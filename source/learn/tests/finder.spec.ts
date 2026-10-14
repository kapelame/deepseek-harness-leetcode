/**
 * Problem finder: LeetCode signature mapping, and complete runs with a
 * scripted model against a local fake LeetCode GraphQL server. Covers the
 * happy path, trusted metadata, unsupported and uninspected problems,
 * rejected specifications, request budgets, limits, and cancellation.
 */
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { brandString } from '@deepseek-ai/dsh-brand'
import { textResponse, toolCallResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import { mapLeetCodeSignature, parseExampleInputs } from '../src/finder/signature.ts'
import { OWNER_LEARNER } from '../src/index.ts'
import type { FinderRunId, FinderRunView, ProblemId } from '../src/types.ts'
import { createDockerRunner } from './runner-fixture.ts'
import { createLearnFixture, type LearnFixture } from './service-fixture.ts'

const probe = await createDockerRunner()
await probe.dispose()

describe('LeetCode signature mapping', () => {
  it('maps plain functions', () => {
    const mapped = mapLeetCodeSignature({ name: 'twoSum', params: [{ name: 'nums', type: 'integer[]' }, { name: 'target', type: 'integer' }],
      return: { type: 'integer[]' } })
    expect(mapped).toEqual({ ok: true, signature: { entry: { python: 'twoSum', typescript: 'twoSum' },
      params: [{ name: 'nums', type: 'int[]' }, { name: 'target', type: 'int' }], returns: 'int[]' } })
  })

  it('maps in-place problems through output.paramindex', () => {
    const mapped = mapLeetCodeSignature({ name: 'rotate', params: [{ name: 'matrix', type: 'integer[][]' }], return: { type: 'void' },
      output: { paramindex: 0 } })
    expect(mapped).toMatchObject({ ok: true, signature: { returns: 'int[][]', shape: { kind: 'in-place', param: 0 } } })
  })

  it('maps design classes', () => {
    const mapped = mapLeetCodeSignature({ classname: 'MinStack', systemdesign: true, constructor: { params: [] },
      methods: [{ name: 'push', params: [{ name: 'val', type: 'integer' }], return: { type: 'void' } },
        { name: 'getMin', params: [], return: { type: 'integer' } }] })
    expect(mapped).toMatchObject({ ok: true, signature: { entry: { python: 'MinStack' }, returns: 'json',
      shape: { kind: 'design', className: 'MinStack', methods: [{ name: 'push', returns: 'void' }, { name: 'getMin', returns: 'int' }] } } })
  })

  it('maps known manual harnesses and rejects unknown ones', () => {
    expect(mapLeetCodeSignature({ name: 'detectCycle', params: [{ name: 'head', type: 'ListNode' }, { name: 'pos', type: 'integer' }],
      return: { type: 'ListNode' }, manual: true })).toMatchObject({ ok: true, signature: { shape: { kind: 'harness', name: 'linked-list-cycle' } } })
    expect(mapLeetCodeSignature({ name: 'connect', params: [{ name: 'root', type: 'TreeNode' }], return: { type: 'TreeNode' }, manual: true }))
      .toEqual({ ok: false, reason: 'the problem needs a custom judge Learn does not provide' })
    expect(mapLeetCodeSignature({ name: 'f', params: [{ name: 'g', type: 'NestedInteger' }], return: { type: 'integer' } }))
      .toEqual({ ok: false, reason: 'parameter type NestedInteger is not supported' })
  })

  it('parses official example inputs and drops malformed ones', () => {
    expect(parseExampleInputs(['[2,7,11,15]\n9', '[3,2,4]\n6', 'oops\n1', '[1]'], 2)).toEqual([[[2, 7, 11, 15], 9], [[3, 2, 4], 6]])
  })
})

const RUNNING_SUM = {
  questionFrontendId: '1480', title: 'Running Sum of 1d Array', titleSlug: 'running-sum-of-1d-array', difficulty: 'Easy', isPaidOnly: false,
  topicTags: [{ slug: 'array' }, { slug: 'prefix-sum' }],
  metaData: JSON.stringify({ name: 'runningSum', params: [{ name: 'nums', type: 'integer[]' }], return: { type: 'integer[]' } }),
  exampleTestcaseList: ['[1,2,3,4]', '[1,1,1,1,1]', '[3,1,2,10,1]'],
}
const MANUAL = {
  questionFrontendId: '116', title: 'Populating Next Right Pointers in Each Node', titleSlug: 'populating-next-right-pointers-in-each-node',
  difficulty: 'Medium', isPaidOnly: false, topicTags: [{ slug: 'tree' }],
  metaData: JSON.stringify({ name: 'connect', params: [{ name: 'root', type: 'TreeNode' }], return: { type: 'TreeNode' }, manual: true }),
  exampleTestcaseList: ['[1,2,3,4,5,6,7]'],
}
const PAID = { questionFrontendId: '1427', title: 'Perform String Shifts', titleSlug: 'perform-string-shifts', difficulty: 'Easy', isPaidOnly: true,
  topicTags: [{ slug: 'array' }] }

/** Fake LeetCode GraphQL endpoint; records every request body. */
let server: Server
let endpoint = ''
const requests: { query: string; variables: Record<string, unknown> }[] = []

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString('utf8') })
    req.on('end', () => {
      const parsed = JSON.parse(body) as { query: string; variables: Record<string, unknown> }
      requests.push(parsed)
      const slug = parsed.variables['s']
      let data: unknown
      if (parsed.query.includes('questionList')) {
        data = { questionList: { totalNum: 3, data: [RUNNING_SUM, MANUAL, PAID].map(item => ({ questionFrontendId: item.questionFrontendId, title: item.title,
          titleSlug: item.titleSlug, difficulty: item.difficulty, isPaidOnly: item.isPaidOnly, topicTags: item.topicTags })) } }
      } else if (parsed.query.includes('translatedTitle')) {
        data = { question: slug === RUNNING_SUM.titleSlug ? { translatedTitle: '一维数组的动态和' } : null }
      } else {
        data = { question: [RUNNING_SUM, MANUAL].find(item => item.titleSlug === slug) ?? null }
      }
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ data }))
    })
  })
  await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve) })
  endpoint = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}/graphql`
})

afterAll(async () => {
  await new Promise<void>((resolve) => { server.close(() => { resolve() }) })
})

const fixtures: LearnFixture[] = []
afterEach(async () => {
  for (const fixture of fixtures.splice(0)) await fixture.dispose()
  requests.length = 0
})

async function fixture(options: Parameters<typeof createLearnFixture>[0] = {}): Promise<LearnFixture> {
  const created = await createLearnFixture({
    ...options,
    config: { ...options.config, finder: { leetcodeEndpoint: endpoint, leetcodeCnEndpoint: endpoint, requestIntervalMs: 200,
      ...options.config?.finder } },
  })
  fixtures.push(created)
  return created
}

async function settled(learn: LearnFixture['learn'], id: FinderRunId): Promise<FinderRunView> {
  for await (const frame of learn.finderFollow(OWNER_LEARNER, id, AbortSignal.timeout(300_000))) {
    if (frame.type === 'settled') return frame.run
    if (frame.type === 'snapshot' && frame.run.status !== 'running') return frame.run
  }
  throw new Error('the run did not settle')
}

const localized = (text: string): { zh: string; en: string } => ({ zh: text, en: text })
const REFERENCE = 'def runningSum(nums):\n    out, total = [], 0\n    for x in nums:\n        total += x\n        out.append(total)\n    return out\n'
const ORACLE = 'def runningSum(nums):\n    return [sum(nums[:i + 1]) for i in range(len(nums))]\n'
const SPEC = {
  topicId: 'array-techniques',
  summary: localized('Given an integer array, return the array whose i-th entry is the sum of the first i+1 entries of the input.'),
  constraints: [localized('1 <= nums.length <= 1000'), localized('-10^6 <= nums[i] <= 10^6')],
  hints: [localized('What does each output entry share with the previous one?'), localized('Entry i equals entry i-1 plus nums[i].'),
    localized('Keep a running total while scanning once.')],
  explanation: localized('Scan once, adding each value to a running total. O(n) time, O(n) output space.'),
  comparator: { kind: 'exact' },
  reference: REFERENCE,
  oracle: ORACLE,
  inputs: [{ type: 'int[]', min: -1_000_000, max: 1_000_000, smallMin: -5, smallMax: 5, minLength: 1, maxLength: 1000, smallMaxLength: 8,
    largeLength: 1000 }],
  boundaryCases: [[[0]], [[-1_000_000]], [[1_000_000, 1_000_000, 1_000_000]], [[5, -5, 5, -5]]],
}

function toolResults(fixtureValue: LearnFixture): string {
  return JSON.stringify(fixtureValue.adapter.requests.at(-1)?.messages ?? [])
}

describe.skipIf(!probe.ready)('problem finder', () => {
  it('adds a validated problem from verified metadata and rejects everything untrusted', async () => {
    const created = await fixture({ script: [
      toolCallResponse('c1', 'search_leetcode', { tags: ['prefix-sum'], difficulty: 'easy' }),
      toolCallResponse('c2', 'get_leetcode_problem', { slug: MANUAL.titleSlug }),
      toolCallResponse('c3', 'add_problem', { slug: MANUAL.titleSlug, spec: SPEC }),
      toolCallResponse('c4', 'get_leetcode_problem', { slug: RUNNING_SUM.titleSlug }),
      toolCallResponse('c5', 'add_problem', { slug: RUNNING_SUM.titleSlug, spec: { ...SPEC, title: 'Invented', frontendId: 9999 } }),
      toolCallResponse('c6', 'add_problem', { slug: RUNNING_SUM.titleSlug, spec: { ...SPEC,
        reference: 'def runningSum(nums):\n    return [sum(nums[:i]) for i in range(len(nums))]\n' } }),
      toolCallResponse('c7', 'add_problem', { slug: RUNNING_SUM.titleSlug, spec: SPEC }),
    ] })
    const { learn } = created
    const run = learn.findProblems(OWNER_LEARNER, 'one easy prefix sum problem', 1)
    expect(() => learn.findProblems(OWNER_LEARNER, 'another', 1)).toThrow(/already running/)
    const done = await settled(learn, run.id)

    expect(done.status).toBe('completed')
    const id = brandString<ProblemId>('lc-running-sum-of-1d-array')
    expect(done.added).toEqual([id])
    const kinds = done.events.map(event => event.kind)
    expect(kinds).toEqual(['search', 'inspect', 'inspect', 'validating', 'rejected', 'validating', 'rejected', 'validating', 'added'])
    expect(done.events[1]).toMatchObject({ kind: 'inspect', slug: MANUAL.titleSlug, supported: false,
      reason: 'the problem needs a custom judge Learn does not provide' })
    const schemaRejection = done.events[4]
    expect(schemaRejection?.kind === 'rejected' && schemaRejection.checks[0]?.detail).toMatch(/Unrecognized key/)
    const oracleRejection = done.events[6]
    expect(oracleRejection?.kind === 'rejected' && oracleRejection.checks.some(check => !check.ok)).toBe(true)

    // Paid-only problems never reach the model; the uninspected manual problem was refused.
    const transcript = toolResults(created)
    expect(transcript).not.toContain('perform-string-shifts')
    expect(transcript).toContain('Inspect populating-next-right-pointers-in-each-node with get_leetcode_problem first')

    // Number, title, difficulty, and signature come from LeetCode, never from the model.
    const workspace = learn.workspace(OWNER_LEARNER, id)
    expect(workspace.problem).toMatchObject({ difficulty: 'easy', title: { zh: '一维数组的动态和', en: 'Running Sum of 1d Array' },
      leetcode: { frontendId: 1480, slug: RUNNING_SUM.titleSlug } })
    expect(learn.finderRuns(OWNER_LEARNER)[0]).toMatchObject({ id: run.id, status: 'completed', added: [id] })

    // The stored problem judges learner code like curated content.
    const code = 'class Solution:\n    def runningSum(self, nums):\n        for i in range(1, len(nums)):\n            nums[i] += nums[i - 1]\n        return nums\n'
    const submitted = await learn.submit(OWNER_LEARNER, { problemId: id, language: 'python', code, context: 'practice' }, AbortSignal.timeout(120_000))
    expect(submitted.verdict?.kind).toBe('passed-local-tests')

    expect(requests.some(request => request.query.includes('translatedTitle'))).toBe(true)
  }, 600_000)

  it('enforces the LeetCode request budget and run limits', async () => {
    const created = await fixture({ config: { finder: { maxLeetcodeRequests: 1, maxProblems: 2 } }, script: [
      toolCallResponse('c1', 'search_leetcode', { keywords: 'sum' }),
      toolCallResponse('c2', 'search_leetcode', { keywords: 'sum' }),
      textResponse('Nothing suitable.'),
    ] })
    const { learn } = created
    expect(() => learn.findProblems(OWNER_LEARNER, 'three problems', 3)).toThrow(/1-2 problems/)
    expect(() => learn.findProblems(OWNER_LEARNER, 'x', 1)).toThrow(/3-1000 characters/)
    const done = await settled(learn, learn.findProblems(OWNER_LEARNER, 'two sum problems', 2).id)
    expect(done.status).toBe('completed')
    expect(done.added).toEqual([])
    expect(requests).toHaveLength(1)
    expect(toolResults(created)).toContain('request budget of 1 for this run is used up')
  }, 300_000)

  it('cancels a running search and refuses runs without a model or when disabled', async () => {
    const { learn } = await fixture({ script: ['hang'] })
    const run = learn.findProblems(OWNER_LEARNER, 'graph problems', 1)
    learn.finderCancel(OWNER_LEARNER, run.id)
    const done = await settled(learn, run.id)
    expect(done.status).toBe('cancelled')
    expect(learn.finderRuns(OWNER_LEARNER)[0]?.status).toBe('cancelled')

    const noModel = await fixture({ model: false })
    expect(() => noModel.learn.findProblems(OWNER_LEARNER, 'graph problems', 1)).toThrow(/default model/)
    const disabled = await fixture({ config: { finder: { enabled: false } } })
    expect(() => disabled.learn.findProblems(OWNER_LEARNER, 'graph problems', 1)).toThrow(/disabled/)
  }, 300_000)
})
