/**
 * Variant generation and problem imports. Candidates are structured
 * specifications validated by schema, static checks, and the isolated suite
 * builder; only validated candidates become exercises, and every rejected
 * candidate is stored as quarantined with its checks.
 */
import { randomInt, randomUUID } from 'node:crypto'
import { brandString } from '@deepseek-ai/dsh-brand'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type { ContentOrigin, LearnerId, ProblemId, TopicId, VariantRecord, VariantSpec, VariantValidation } from './types.ts'
import type { ProblemDefinition } from './content/catalog.ts'
import { hasInputSource, variantSpecSchema } from './content/schema.ts'
import { composeGenerator, deriveStarters, domainMismatch } from './content/generation.ts'
import { buildSuite, SUITE_SEEDS, type SuiteCheck } from './judge/suite-builder.ts'
import { variantSystemPrompt } from './agents/prompts.ts'
import { runLearnAgent } from './agents/runtime.ts'
import { LearnError } from './judging.ts'
import { toJson } from './json.ts'
import type { LearnRuntime } from './runtime.ts'

/** Import specification: a variant specification whose parent fields are optional. */
const importSpecSchema = variantSpecSchema.partial({ parentProblemId: true, differences: true, transfer: true })

/** Result of one generation request. */
export interface GenerationResult {
  readonly status: 'validated' | 'failed' | 'skipped'
  readonly variant?: VariantRecord
  readonly quarantined: readonly VariantRecord[]
  readonly message: string
}

function record(id: ProblemId, parent: ProblemId, topic: TopicId, status: VariantRecord['status'], origin: ContentOrigin,
  validation: VariantValidation, title: VariantSpec['title'], createdAt: string): VariantRecord {
  return { id, parentProblemId: parent, topicId: topic, status, origin, validation, title, createdAt }
}

/** Generation, validation, and import of exercises. */
export class Variants {
  private readonly inFlight = new Map<string, Promise<GenerationResult>>()

  constructor(private readonly runtime: LearnRuntime) {}

  /**
   * Validate one candidate without storing it.
   * @param learner - learner whose existing variants define novelty.
   * @param raw - candidate JSON.
   * @param parent - parent definition, absent for imports without a parent.
   * @param kind - variant or import.
   * @param signal - cancellation.
   * @returns validation, the parsed specification, and frozen cases when valid.
   */
  async validate(learner: LearnerId, raw: JsonValue, parent: ProblemDefinition | undefined, kind: 'variant' | 'imported',
    signal: AbortSignal): Promise<{ validation: VariantValidation; spec?: VariantSpec; cases?: Awaited<ReturnType<typeof buildSuite>>['cases'] }> {
    const parsed = kind === 'variant' ? variantSpecSchema.safeParse(raw) : importSpecSchema.safeParse(raw)
    if (!parsed.success) {
      return { validation: { ok: false, checks: [{ name: 'schema', ok: false, detail: parsed.error.issues.slice(0,
        8).map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ') }] } }
    }
    const data = parsed.data
    if (!hasInputSource(data)) {
      return { validation: { ok: false, checks: [{ name: 'schema', ok: false,
        detail: 'declare inputs (one domain per parameter) or a generator override' }] } }
    }
    const mismatch = data.inputs === undefined ? undefined : domainMismatch(data.params, data.inputs)
    if (mismatch !== undefined) return { validation: { ok: false, checks: [{ name: 'schema', ok: false, detail: mismatch }] } }
    const spec: VariantSpec = {
      ...data,
      starter: data.starter ?? deriveStarters(data.entry, data.params, data.returns, 'function'),
      parentProblemId: data.parentProblemId ?? parent?.id ?? '',
      differences: data.differences ?? [],
      transfer: data.transfer ?? { zh: '这是导入的练习题。', en: 'This is an imported exercise.' },
    }
    const checks: SuiteCheck[] = [{ name: 'schema', ok: true, detail: 'specification matches the schema' }]
    const fail = (name: string, detail: string): { validation: VariantValidation; spec: VariantSpec } => ({ validation: { ok: false,
      checks: [...checks, { name, ok: false, detail }] }, spec })
    if (kind === 'variant') {
      if (parent === undefined) return fail('parent', 'unknown parent problem')
      if (spec.parentProblemId !== parent.id) return fail('parent', `parentProblemId must be ${parent.id}`)
      if (!parent.topics.includes(brandString<TopicId>(spec.topicId))) return fail('parent',
        `topicId must be one of ${parent.topics.join(', ')}`)
      if (spec.title.en.trim().toLowerCase() === parent.title.en.trim().toLowerCase() || spec.title.zh.trim() === parent.title.zh.trim()) return fail('novelty', 'the title repeats the parent problem')
      if (spec.differences.every(item => item.description.en.trim().length < 20)) return fail('novelty',
        'describe each difference in at least one full sentence')
      const existing = this.runtime.problems.all(learner).filter(item => item.variant?.parentProblemId === parent.id)
      if (existing.some(item => item.title.en.trim().toLowerCase() === spec.title.en.trim().toLowerCase())) return fail('novelty',
        'a variant with this title already exists')
      checks.push({ name: 'novelty', ok: true,
        detail: `${String(spec.differences.length)} declared differences: ${spec.differences.map(item => item.category).join(', ')}` })
    }
    const built = await buildSuite(this.runtime.runner, {
      params: spec.params, returns: spec.returns, comparator: spec.comparator, entry: spec.entry.python,
      reference: spec.reference, oracle: spec.oracle,
      generator: data.generator ?? composeGenerator(this.runtime.generatorLibrary, data.inputs ?? [], data.hooks),
      examples: spec.examples.map((item, index) => ({ id: `ex-${String(index + 1)}`, args: item.args, expected: item.expected })),
      boundary: spec.boundaryCases.map(item => item.args),
      perCaseMs: this.runtime.config.generatedPerCaseMs,
      smallSeeds: SUITE_SEEDS.small, largeSeeds: SUITE_SEEDS.large, mutants: spec.mutants,
      ...parent === undefined || kind !== 'variant' ? {} : { parent: { reference: parent.reference, entry: parent.entry.python,
        params: parent.params, returns: parent.returns } },
    }, signal)
    return { validation: { ok: built.ok, checks: [...checks, ...built.checks] }, spec,
      ...built.cases === undefined ? {} : { cases: built.cases } }
  }

  private store(learner: LearnerId, kind: 'variant' | 'imported', spec: VariantSpec | undefined, raw: JsonValue,
    validation: VariantValidation, cases: Awaited<ReturnType<typeof buildSuite>>['cases'], origin: ContentOrigin, parent: ProblemId | undefined, topic: TopicId): VariantRecord {
    const id = brandString<ProblemId>(`${kind === 'variant' ? 'gen' : 'imp'}-${randomUUID().slice(0, 12)}`)
    const status: VariantRecord['status'] = validation.ok && cases !== undefined ? 'validated' : 'quarantined'
    const createdAt = this.runtime.iso()
    const title = spec?.title ?? { zh: '无效的候选题', en: 'Invalid candidate' }
    this.runtime.store.atomic(() => {
      this.runtime.store.insertProblem(learner, {
        id, kind, ...parent === undefined ? {} : { parentProblemId: parent }, topicId: topic, status,
        spec: spec === undefined ? undefined : { ...spec, id }, ...spec === undefined ? { raw } : {}, validation, origin, createdAt,
      })
      if (status === 'validated' && cases !== undefined) this.runtime.store.insertSuite(id, 1,
        kind === 'variant' ? 'generated' : 'authored', cases, createdAt)
    })
    return record(id, parent ?? brandString<ProblemId>(''), topic, status, origin, validation, title, createdAt)
  }

  /**
   * Generate one validated variant for a parent problem with the variant agent.
   * Concurrent requests for the same parent share one run.
   * @param learner - learner.
   * @param parentId - parent problem.
   * @param signal - cancellation.
   * @returns the generation result; failures never produce an exercise.
   */
  generate(learner: LearnerId, parentId: ProblemId, signal: AbortSignal): Promise<GenerationResult> {
    const key = `${learner}:${parentId}`
    const running = this.inFlight.get(key)
    if (running !== undefined) return running
    const task = this.generateOnce(learner, parentId, signal).finally(() => { this.inFlight.delete(key) })
    this.inFlight.set(key, task)
    return task
  }

  private async generateOnce(learner: LearnerId, parentId: ProblemId, signal: AbortSignal): Promise<GenerationResult> {
    const parent = this.runtime.problems.get(learner, parentId)
    if (parent === undefined || parent.variant !== undefined) throw new LearnError('not-found', `Unknown parent problem ${parentId}`)
    if (!this.runtime.tutorAvailable()) return { status: 'skipped', quarantined: [],
      message: 'No model is available; seeded validated variants are used instead.' }
    const topic = this.runtime.problems.topicOf(parent)
    const seed = randomInt(1, 2 ** 31 - 1)
    const quarantined: VariantRecord[] = []
    let accepted: VariantRecord | undefined
    let submissions = 0
    const maxSubmissions = this.runtime.config.agents.maxVariantSubmissions
    const example = this.seedSpec(learner, topic)
    const existing = this.runtime.problems.all(learner)
      .filter(item => item.variant?.parentProblemId === parentId)
      .map(item => item.title.en)
    const tool = defineTool({
      name: 'submit_variant',
      description: 'Submit one complete variant specification for validation. Every piece of code runs in an isolated runner; the result lists each check.',
      parameters: { spec: { type: 'json', required: true, description: 'The complete variant specification object.' } },
      output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
      execute: async (args, exec) => {
        if (accepted !== undefined) throw new Error('A variant was already accepted.')
        if (submissions >= maxSubmissions) throw new Error('The submission budget is used up.')
        submissions++
        const { validation, spec, cases } = await this.validate(learner, args.spec, parent, 'variant', exec.signal)
        const origin: ContentOrigin = { source: 'generated',
          author: `model:${this.runtime.tutorStatus().provider ?? ''}/${this.runtime.tutorStatus().model ?? ''}`, createdAt: this.runtime.iso(), seed }
        const stored = this.store(learner, 'variant', spec, args.spec, validation, cases, origin, parentId, topic)
        if (stored.status === 'validated') {
          accepted = stored
          exec.concludeTurn()
        } else {
          quarantined.push(stored)
        }
        return toJson({
          accepted: stored.status === 'validated',
          checks: validation.checks,
          submissionsLeft: maxSubmissions - submissions,
        })
      },
    })
    const prompt = [
      `Parent problem (${parent.kind}${parent.leetcode === undefined ? '' : `, LeetCode #${String(parent.leetcode.frontendId)}`}): ${parent.title.en}`,
      `Parent summary: ${parent.summary.en}`,
      `Parent signature: ${parent.entry.python}(${parent.params.map(item => `${item.name}: ${item.type}`).join(', ')}) -> ${parent.returns}`,
      `Topic: ${topic}. Learner's recent mistake tags on this topic: ${this.runtime.recentMistakeTags(learner, topic).join(', ') || 'none'}.`,
      `Variation seed ${String(seed)}: use it to choose which dimension to change, so repeated requests explore different variants.`,
      `Existing variants of this parent (do not repeat them): ${existing.join('; ') || 'none'}.`,
      'Value types: int, float, bool, string, int[], float[], bool[], string[], int[][], string[][], tree (level-order list with null), linked-list. Comparators: exact, unordered, unordered-nested, float with tolerance.',
      'Here is one accepted specification for this topic, showing every required field (yours must be different):',
      JSON.stringify(example),
      `Use parentProblemId "${parentId}" and topicId "${topic}". The id field may be any lowercase slug; the service assigns the final id.`,
    ].join('\n')
    const result = await runLearnAgent(this.runtime.host, { purpose: 'variant',
      system: variantSystemPrompt(maxSubmissions), tools: [tool], prompt, signal })
    this.runtime.noteAgentResult(result)
    if (accepted !== undefined) return { status: 'validated', variant: accepted, quarantined, message: 'A new variant passed validation.' }
    return { status: 'failed', quarantined,
      message: result.error ?? `No candidate passed validation after ${String(submissions)} submissions; seeded variants remain in use.` }
  }

  /** One authored variant of the topic as a complete example specification. */
  private seedSpec(learner: LearnerId, topic: TopicId): VariantSpec | undefined {
    const [first] = this.runtime.problems.curriculum.seedVariants.get(topic) ?? []
    const definition = first === undefined ? undefined : this.runtime.problems.get(learner, first)
    const seed = definition?.seedInputs
    if (definition?.variant === undefined || seed === undefined) return undefined
    return {
      id: definition.id, parentProblemId: definition.variant.parentProblemId, topicId: topic, title: definition.title,
      statement: definition.statement ?? definition.summary, summary: definition.summary, difficulty: definition.difficulty,
      skills: definition.variant.skills, differences: definition.variant.differences, transfer: definition.variant.transfer,
      entry: definition.entry, params: definition.params, returns: definition.returns, comparator: definition.comparator,
      constraints: definition.constraints, examples: seed.examples.map(item => ({ args: item.args, expected: item.expected })),
      starter: definition.starter, reference: definition.reference, oracle: definition.oracle ?? '',
      ...seed.inputs === undefined ? { generator: seed.generator } : { inputs: seed.inputs,
        ...seed.hooks === undefined ? {} : { hooks: seed.hooks } },
      boundaryCases: seed.boundary.map(args => ({ args })), mutants: seed.mutants ?? [], hints: definition.hints,
    }
  }

  /**
   * Import a learner-provided problem through the same validation.
   * @param learner - learner.
   * @param raw - specification JSON.
   * @param signal - cancellation.
   * @returns the stored record, validated or quarantined.
   */
  async importProblem(learner: LearnerId, raw: JsonValue, signal: AbortSignal): Promise<VariantRecord> {
    const declared = typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? raw['parentProblemId'] : undefined
    const parentId = typeof declared === 'string' ? brandString<ProblemId>(declared) : undefined
    const parent = parentId === undefined ? undefined : this.runtime.problems.get(learner, parentId)
    const { validation, spec, cases } = await this.validate(learner, raw, parent, 'imported', signal)
    const topic = brandString<TopicId>(spec?.topicId ?? 'unknown')
    const known = this.runtime.problems.curriculum.topics.some(item => item.id === topic)
    const checked: VariantValidation = known ? validation : { ok: false, checks: [...validation.checks, { name: 'topic', ok: false,
      detail: `unknown topic ${topic}` }] }
    const origin: ContentOrigin = { source: 'imported', author: 'learner', createdAt: this.runtime.iso() }
    return this.store(learner, 'imported', spec, raw, checked, cases, origin, parent?.id, topic)
  }

  /**
   * Stored variants and imports with their validation results.
   * @param learner - learner.
   * @returns records, newest first.
   */
  list(learner: LearnerId): VariantRecord[] {
    return this.runtime.store.storedProblems(learner).map(row => record(
      row.id, row.parentProblemId ?? brandString<ProblemId>(''), row.topicId, row.status, row.origin,
      row.validation, row.spec?.title ?? { zh: '无效的候选题',
        en: 'Invalid candidate' }, row.createdAt,
    )).reverse()
  }

  /** Wait for in-flight generation during disposal. */
  async dispose(): Promise<void> {
    await Promise.allSettled([...this.inFlight.values()])
  }
}
