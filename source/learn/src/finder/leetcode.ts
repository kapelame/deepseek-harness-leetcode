/**
 * Read-only client for LeetCode's public GraphQL endpoint. It runs on the
 * Host, never inside the code runner, requests metadata only (no statement
 * text), paces requests, and enforces a per-run request budget, a timeout,
 * and a response-size bound. Every failure is reported, never retried silently.
 */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import { parseJson } from '../json.ts'

/** Client limits; all come from validated configuration. */
export interface LeetCodeClientOptions {
  readonly endpoint: string
  /** LeetCode China endpoint used only for the official Chinese title; empty disables it. */
  readonly cnEndpoint: string
  readonly requestIntervalMs: number
  readonly timeoutMs: number
  readonly maxResponseBytes: number
  readonly maxRequests: number
}

/** One search hit. */
export interface LeetCodeListing {
  readonly frontendId: number
  readonly slug: string
  readonly title: string
  readonly difficulty: 'easy' | 'medium' | 'hard'
  readonly paidOnly: boolean
  readonly tags: readonly string[]
}

/** Verified metadata of one problem. */
export interface LeetCodeQuestion extends LeetCodeListing {
  readonly titleZh?: string
  readonly metaData: JsonValue
  readonly exampleTestcases: readonly string[]
}

/** Search filters accepted by `questionList`. */
export interface LeetCodeSearch {
  readonly keywords?: string | undefined
  readonly tags?: readonly string[] | undefined
  readonly difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | undefined
  readonly skip?: number | undefined
  readonly limit?: number | undefined
}

/** A failed LeetCode request with a learner-safe message. */
export class LeetCodeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LeetCodeError'
  }
}

const SEARCH = 'query($f:QuestionListFilterInput,$limit:Int,$skip:Int){questionList(categorySlug:"",limit:$limit,skip:$skip,filters:$f){totalNum data{questionFrontendId title titleSlug difficulty isPaidOnly topicTags{slug}}}}'
const QUESTION = 'query($s:String!){question(titleSlug:$s){questionFrontendId title titleSlug difficulty isPaidOnly topicTags{slug} metaData exampleTestcaseList}}'
const TRANSLATED = 'query($s:String!){question(titleSlug:$s){translatedTitle}}'

function fields(value: JsonValue | undefined): Readonly<Record<string, JsonValue>> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function difficultyOf(value: JsonValue | undefined): LeetCodeListing['difficulty'] {
  const text = typeof value === 'string' ? value.toLowerCase() : ''
  if (text === 'easy' || text === 'medium' || text === 'hard') return text
  throw new LeetCodeError(`LeetCode returned an unknown difficulty ${JSON.stringify(value)}`)
}

function listing(raw: JsonValue | undefined): LeetCodeListing {
  const item = fields(raw)
  const slug = item['titleSlug']
  const title = item['title']
  if (typeof slug !== 'string' || typeof title !== 'string') throw new LeetCodeError('LeetCode returned a problem without a slug or title')
  return {
    frontendId: Number(item['questionFrontendId']),
    slug,
    title,
    difficulty: difficultyOf(item['difficulty']),
    paidOnly: item['isPaidOnly'] === true,
    tags: (Array.isArray(item['topicTags']) ? item['topicTags'] : []).flatMap((tag) => {
      const name = fields(tag)['slug']
      return typeof name === 'string' ? [name] : []
    }),
  }
}

/** One finder run's view of LeetCode, with its own request budget. */
export class LeetCodeSession {
  private used = 0
  private last = 0

  constructor(private readonly options: LeetCodeClientOptions, private readonly signal: AbortSignal) {}

  /** Requests left in this run's budget. */
  get remaining(): number {
    return this.options.maxRequests - this.used
  }

  /**
   * Search the public problem list.
   * @param search - keywords, tag slugs, difficulty, and paging.
   * @returns the total match count and one page of listings.
   */
  async search(search: LeetCodeSearch): Promise<{ total: number; problems: LeetCodeListing[] }> {
    const filters: Record<string, JsonValue> = {}
    if (search.keywords !== undefined && search.keywords.trim() !== '') filters['searchKeywords'] = search.keywords.trim()
    if (search.tags !== undefined && search.tags.length > 0) filters['tags'] = [...search.tags]
    if (search.difficulty !== undefined) filters['difficulty'] = search.difficulty
    const data = await this.query(this.options.endpoint, SEARCH, { f: filters, limit: Math.min(20, Math.max(1, search.limit ?? 10)),
      skip: Math.max(0, search.skip ?? 0) }, 'https://leetcode.com/problemset/')
    const list = fields(data['questionList'])
    return {
      total: Number(list['totalNum'] ?? 0),
      problems: (Array.isArray(list['data']) ? list['data'] : []).map(listing),
    }
  }

  /**
   * Fetch verified metadata for one problem; never the statement.
   * @param slug - LeetCode title slug.
   * @returns the metadata, or undefined when LeetCode has no such problem.
   */
  async question(slug: string): Promise<LeetCodeQuestion | undefined> {
    if (!/^[a-z0-9-]{1,100}$/.test(slug)) throw new LeetCodeError(`${JSON.stringify(slug)} is not a LeetCode title slug`)
    const data = await this.query(this.options.endpoint, QUESTION, { s: slug }, `https://leetcode.com/problems/${slug}/`)
    const raw = data['question']
    if (raw === null || raw === undefined) return undefined
    const item = fields(raw)
    const metaText = item['metaData']
    if (typeof metaText !== 'string') throw new LeetCodeError(`${slug} has no signature metadata`)
    let titleZh: string | undefined
    if (this.options.cnEndpoint !== '' && this.remaining > 0) {
      try {
        const translated = fields((await this.query(this.options.cnEndpoint, TRANSLATED, { s: slug }, `https://leetcode.cn/problems/${slug}/`))['question'])
        if (typeof translated['translatedTitle'] === 'string' && translated['translatedTitle'] !== '') titleZh = translated['translatedTitle']
      } catch (error) {
        // The Chinese title is optional; the English title from leetcode.com stays authoritative.
        if (error instanceof LeetCodeError) titleZh = undefined
        else throw error
      }
    }
    return {
      ...listing(raw),
      ...titleZh === undefined ? {} : { titleZh },
      metaData: parseJson(metaText),
      exampleTestcases: (Array.isArray(item['exampleTestcaseList']) ? item['exampleTestcaseList'] : []).flatMap(value => typeof value === 'string' ? [value] : []),
    }
  }

  private async query(endpoint: string, query: string, variables: Record<string, JsonValue>, referer: string): Promise<Readonly<Record<string, JsonValue>>> {
    if (this.used >= this.options.maxRequests) {
      throw new LeetCodeError(`the LeetCode request budget of ${String(this.options.maxRequests)} for this run is used up`)
    }
    this.used++
    const wait = this.last + this.options.requestIntervalMs - Date.now()
    if (wait > 0) await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, wait)
      this.signal.addEventListener('abort', () => { clearTimeout(timer); reject(this.signal.reason as Error) }, { once: true })
    })
    this.signal.throwIfAborted()
    this.last = Date.now()
    let response: Response
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'referer': referer, 'user-agent': 'dsh-plugin-learn' },
        body: JSON.stringify({ query, variables }),
        redirect: 'error',
        signal: AbortSignal.any([this.signal, AbortSignal.timeout(this.options.timeoutMs)]),
      })
    } catch (error) {
      this.signal.throwIfAborted()
      throw new LeetCodeError(`LeetCode could not be reached: ${error instanceof Error ? error.message : String(error)}`)
    }
    if (!response.ok) throw new LeetCodeError(`LeetCode answered HTTP ${String(response.status)}`)
    const reader = response.body?.getReader()
    if (reader === undefined) throw new LeetCodeError('LeetCode returned an empty response')
    const chunks: Uint8Array[] = []
    let size = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > this.options.maxResponseBytes) {
        await reader.cancel()
        throw new LeetCodeError(`the LeetCode response exceeded ${String(this.options.maxResponseBytes)} bytes`)
      }
      chunks.push(value)
    }
    let body: JsonValue
    try {
      body = parseJson(Buffer.concat(chunks).toString('utf8'))
    } catch {
      // A non-JSON body (an error page or a block) is reported as a failed request.
      throw new LeetCodeError('LeetCode returned a response that is not JSON')
    }
    const envelope = fields(body)
    if (Array.isArray(envelope['errors']) && envelope['errors'].length > 0) {
      throw new LeetCodeError(`LeetCode rejected the query: ${JSON.stringify(envelope['errors'][0]).slice(0, 200)}`)
    }
    return fields(envelope['data'])
  }
}
