/**
 * Problem lookup across the built-in curriculum and learner-owned stored
 * problems (validated generated variants and imports). Quarantined problems
 * are never returned as exercises.
 */
import { brandString } from '@deepseek-ai/dsh-brand'
import type { LearnerId, ProblemId, TopicId } from './types.ts'
import type { Curriculum, ProblemDefinition, SuiteDefinition } from './content/catalog.ts'
import type { LearnStore, StoredProblemRow } from './store/store.ts'
import { deriveStarters } from './content/generation.ts'

/**
 * Build a definition from a stored specification and its frozen suites.
 * @param row - stored problem.
 * @param suites - suite versions from the store.
 * @param perCaseMs - per-case limit for generated content.
 * @returns the definition, or undefined when no suite was frozen.
 */
export function storedDefinition(row: StoredProblemRow,
  suites: readonly { version: number; origin: string; cases: SuiteDefinition['cases'] }[], perCaseMs: number): ProblemDefinition | undefined {
  const spec = row.spec
  if (suites.length === 0 || spec === undefined) return undefined
  const suiteMap = new Map<number, SuiteDefinition>(suites.map(item => [item.version, { version: item.version,
    origin: item.origin as SuiteDefinition['origin'], cases: item.cases }]))
  const suiteVersion = Math.max(...suiteMap.keys())
  return {
    id: row.id,
    kind: row.kind,
    version: 1,
    suiteVersion,
    title: spec.title,
    difficulty: spec.difficulty,
    topics: [row.topicId],
    summary: spec.summary,
    statement: spec.statement,
    constraints: spec.constraints,
    params: spec.params,
    returns: spec.returns,
    comparator: spec.comparator,
    entry: spec.entry,
    starter: spec.starter ?? deriveStarters(spec.entry, spec.params, spec.returns, 'function'),
    perCaseMs,
    hints: spec.hints,
    solution: { explanation: spec.transfer, python: spec.reference },
    reference: spec.reference,
    oracle: spec.oracle,
    suites: suiteMap,
    exampleExplanations: {},
    origin: row.origin,
    ...row.kind === 'variant' && row.parentProblemId !== undefined
      ? { variant: { parentProblemId: row.parentProblemId, differences: spec.differences, transfer: spec.transfer, skills: spec.skills } }
      : {},
  }
}

/** Learner-scoped problem lookup. */
export class ProblemRegistry {
  constructor(
    readonly curriculum: Curriculum,
    private readonly store: LearnStore,
    private readonly perCaseMs: () => number,
  ) {}

  /**
   * Resolve one exercise visible to a learner.
   * @param learner - owning learner for stored problems.
   * @param id - problem id.
   * @returns the definition, or undefined for unknown or quarantined ids.
   */
  get(learner: LearnerId, id: ProblemId): ProblemDefinition | undefined {
    const builtIn = this.curriculum.problems.get(id)
    if (builtIn !== undefined) return builtIn
    const row = this.store.storedProblems(learner).find(item => item.id === id)
    if (row === undefined || row.status !== 'validated') return undefined
    return storedDefinition(row, this.store.suites(id), this.perCaseMs())
  }

  /**
   * List exercises for a learner.
   * @param learner - learner.
   * @returns built-in problems followed by validated stored problems.
   */
  all(learner: LearnerId): ProblemDefinition[] {
    const stored = this.store.storedProblems(learner)
      .filter(row => row.status === 'validated')
      .map(row => storedDefinition(row, this.store.suites(row.id), this.perCaseMs()))
      .filter((item): item is ProblemDefinition => item !== undefined)
    return [...this.curriculum.problems.values(), ...stored]
  }

  /**
   * Validated variants that can review a parent problem, preferring the same parent, then the same topic.
   * @param learner - learner.
   * @param parent - parent problem.
   * @param topic - parent topic.
   * @returns candidate variant ids in preference order.
   */
  variantsFor(learner: LearnerId, parent: ProblemId, topic: TopicId): ProblemId[] {
    const variants = this.all(learner).filter(item => item.variant !== undefined)
    const sameParent = variants.filter(item => item.variant?.parentProblemId === parent)
    const sameTopic = variants.filter(item => item.variant?.parentProblemId !== parent && item.topics.includes(topic))
    return [...sameParent, ...sameTopic].map(item => item.id)
  }

  /**
   * Topic of a problem.
   * @param definition - problem.
   * @returns the primary topic.
   */
  topicOf(definition: ProblemDefinition): TopicId {
    return definition.topics[0] ?? brandString<TopicId>('unknown')
  }
}
