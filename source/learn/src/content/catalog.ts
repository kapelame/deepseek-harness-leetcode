/**
 * Curriculum loading. Built-in content lives in package files and is validated
 * once at activation; a missing file, schema violation, or dangling reference
 * fails the plugin load.
 */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import yaml from 'js-yaml'
import { brandString } from '@deepseek-ai/dsh-brand'
import type {
  CodeLanguage, CollectionView, Comparator, ContentOrigin, Difficulty, LeetCodeReference, Localized, ParamSpec, ProblemId, ProblemShape,
  ProblemKind, ProblemView, TopicId, TopicView, ValueType, VariantDifference, VisibleCase,
} from '../types.ts'
import { composeGenerator, deriveStarters, domainMismatch } from './generation.ts'
import {
  collectionFileSchema, matchesValueType, problemFileSchema, suiteFileSchema, topicFileSchema, variantFileSchema,
  type InputDomain, type ProblemFile, type SuiteFile, type VariantFile,
} from './schema.ts'

/** One frozen case with its hidden expected value. */
export interface SuiteCase {
  readonly id: string
  readonly args: readonly JsonValue[]
  readonly expected: JsonValue
  readonly visibility: 'example' | 'hidden'
  readonly label: string
}

/** One immutable suite version. */
export interface SuiteDefinition {
  readonly version: number
  readonly origin: 'authored' | 'generated' | 'promoted'
  readonly cases: readonly SuiteCase[]
}

/** Variant-only definition fields. */
export interface VariantDetails {
  readonly parentProblemId: ProblemId
  readonly differences: readonly VariantDifference[]
  readonly transfer: Localized
  readonly skills: readonly string[]
}

/**
 * Complete Host-only problem definition. `reference`, `oracle`, hidden suite
 * cases, and the authored solution never enter learner payloads or tutoring
 * context except through the explicit solution-reveal path.
 */
export interface ProblemDefinition {
  readonly id: ProblemId
  readonly kind: ProblemKind
  readonly version: number
  readonly suiteVersion: number
  readonly title: Localized
  readonly difficulty: Difficulty
  readonly topics: readonly TopicId[]
  readonly leetcode?: LeetCodeReference
  readonly summary: Localized
  readonly statement?: Localized
  readonly constraints: readonly Localized[]
  readonly params: readonly ParamSpec[]
  readonly returns: ValueType
  readonly shape?: ProblemShape
  readonly comparator: Comparator
  readonly entry: { readonly python: string; readonly typescript: string }
  readonly starter: Readonly<Record<CodeLanguage, string>>
  readonly perCaseMs: number
  readonly hints: readonly Localized[]
  readonly solution: { readonly explanation: Localized; readonly python: string }
  readonly reference: string
  readonly oracle?: string
  readonly suites: ReadonlyMap<number, SuiteDefinition>
  readonly exampleExplanations: Readonly<Record<string, Localized>>
  readonly origin: ContentOrigin
  readonly variant?: VariantDetails
  /** Authored suite inputs used to freeze or re-check suites; absent for stored problems. */
  readonly seedInputs?: SeedInputs
}

/** Authored inputs from which a suite version is frozen. */
export interface SeedInputs {
  readonly examples: readonly { readonly id: string; readonly args: readonly JsonValue[]; readonly expected: JsonValue }[]
  readonly boundary: readonly (readonly JsonValue[])[]
  /** Python source defining `generate(seed, size)`, composed from domains or an override. */
  readonly generator: string
  /** Declared domains when the generator was composed from them. */
  readonly inputs?: readonly InputDomain[]
  readonly hooks?: string
  /** Incorrect implementations the suite must reject (variants only). */
  readonly mutants?: readonly string[]
}

/** Validated built-in curriculum. */
export interface Curriculum {
  readonly topics: readonly TopicView[]
  readonly problems: ReadonlyMap<ProblemId, ProblemDefinition>
  /** Curated lists over the problems above. */
  readonly collections: readonly CollectionView[]
  /** Seed variants per topic, in authored order. */
  readonly seedVariants: ReadonlyMap<TopicId, readonly ProblemId[]>
}

const AUTHORED: ContentOrigin = { source: 'authored', author: 'DSH Learn curriculum', createdAt: '2026-10-14' }

async function readText(path: string): Promise<string> {
  return await readFile(path, 'utf8')
}

async function readOptional(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}

async function readMutants(directory: string): Promise<string[]> {
  const names = (await readdir(directory)).filter(name => name.endsWith('.py')).sort()
  if (names.length < 2) fail(directory, 'a variant needs at least two mutants')
  return await Promise.all(names.map(async name => await readText(join(directory, name))))
}

async function startersOf(directory: string, entry: Readonly<Record<CodeLanguage, string>>, params: readonly ParamSpec[],
  returns: ValueType, style: 'method' | 'function', shape: ProblemShape | undefined): Promise<Record<CodeLanguage, string>> {
  const derived = deriveStarters(entry, params, returns, style, shape)
  return {
    python: await readOptional(join(directory, 'starter.py')) ?? derived.python,
    typescript: await readOptional(join(directory, 'starter.ts')) ?? derived.typescript,
  }
}

/**
 * Generator source of an authored problem: a `generator.py` override, or the
 * shared library over the declared input domains plus optional `hooks.py`.
 */
async function generatorOf(root: string, directory: string, path: string, params: readonly ParamSpec[],
  inputs: readonly InputDomain[] | undefined): Promise<{ generator: string; inputs?: readonly InputDomain[]; hooks?: string }> {
  const override = await readOptional(join(directory, 'generator.py'))
  if (override !== undefined) return { generator: override }
  if (inputs === undefined) fail(path, 'declare inputs or provide generator.py')
  const mismatch = domainMismatch(params, inputs)
  if (mismatch !== undefined) fail(path, mismatch)
  const hooks = await readOptional(join(directory, 'hooks.py'))
  return { generator: composeGenerator(await readGeneratorLibrary(root), inputs, hooks), inputs, ...hooks === undefined ? {} : { hooks } }
}

/**
 * Read the shared generator library next to the content directory.
 * @param contentRoot - package `content` directory.
 * @returns `runtime/gen_lib.py` source.
 */
export async function readGeneratorLibrary(contentRoot: string): Promise<string> {
  return await readText(join(contentRoot, '..', 'runtime', 'gen_lib.py'))
}

async function readYaml(path: string): Promise<unknown> {
  return yaml.load(await readText(path), { filename: path, schema: yaml.JSON_SCHEMA })
}

function fail(path: string, message: string): never {
  throw new Error(`learn content ${path}: ${message}`)
}

async function loadSuites(directory: string, problemId: string): Promise<Map<number, SuiteDefinition>> {
  const suites = new Map<number, SuiteDefinition>()
  for (const name of (await readdir(directory)).sort()) {
    const match = /^suite\.v(\d+)\.json$/.exec(name)
    if (match === null) continue
    const path = join(directory, name)
    const parsed = suiteFileSchema.safeParse(JSON.parse(await readText(path)))
    if (!parsed.success) fail(path, parsed.error.message)
    const suite: SuiteFile = parsed.data
    if (suite.problemId !== problemId || suite.version !== Number(match[1])) fail(path, 'problemId or version does not match the file name')
    suites.set(suite.version, { version: suite.version, origin: suite.origin, cases: suite.cases })
  }
  return suites
}

/**
 * Validate case arguments and expected values against a signature.
 * @param where - diagnostic location.
 * @param params - declared parameters.
 * @param returns - declared return encoding.
 * @param cases - candidate cases.
 */
export function assertCasesMatchSignature(
  where: string, params: readonly ParamSpec[], returns: ValueType,
  cases: readonly { readonly id?: string; readonly args: readonly JsonValue[]; readonly expected?: JsonValue }[],
): void {
  for (const [index, testCase] of cases.entries()) {
    const label = testCase.id ?? String(index)
    if (testCase.args.length !== params.length) fail(where,
      `case ${label} has ${String(testCase.args.length)} arguments, expected ${String(params.length)}`)
    params.forEach((param, position) => {
      if (!matchesValueType(param.type, testCase.args[position])) fail(where, `case ${label} argument ${param.name} is not ${param.type}`)
    })
    if (testCase.expected !== undefined && !matchesValueType(returns, testCase.expected)) {
      fail(where, `case ${label} expected value is not ${returns}`)
    }
  }
}

function examplesOf(definition: Pick<ProblemDefinition, 'suites' | 'suiteVersion' | 'exampleExplanations'>): VisibleCase[] {
  const suite = definition.suites.get(definition.suiteVersion)
  if (suite === undefined) return []
  return suite.cases.filter(item => item.visibility === 'example').map((item) => {
    const explanation = definition.exampleExplanations[item.id]
    return { id: item.id, args: item.args, expected: item.expected, ...explanation === undefined ? {} : { explanation } }
  })
}

/**
 * Project a learner-safe view of a definition.
 * @param definition - Host-only definition.
 * @param revealVariant - include the parent mapping after the learner's attempt.
 * @param parentTitle - parent title used by the variant reveal.
 * @returns a view without reference code, oracle, solution, or hidden cases.
 */
export function problemView(definition: ProblemDefinition, revealVariant: boolean, parentTitle?: Localized): ProblemView {
  const suite = definition.suites.get(definition.suiteVersion)
  const hiddenCaseCount = suite === undefined ? 0 : suite.cases.filter(item => item.visibility === 'hidden').length
  const variant = definition.variant === undefined
    ? undefined
    : revealVariant && parentTitle !== undefined
      ? { parentProblemId: definition.variant.parentProblemId, parentTitle, differences: definition.variant.differences,
        transfer: definition.variant.transfer }
      : { parentHidden: true as const }
  return {
    id: definition.id,
    kind: definition.kind,
    version: definition.version,
    suiteVersion: definition.suiteVersion,
    title: definition.title,
    difficulty: definition.difficulty,
    topics: definition.topics,
    ...definition.leetcode === undefined ? {} : { leetcode: definition.leetcode },
    summary: definition.summary,
    ...definition.statement === undefined ? {} : { statement: definition.statement },
    constraints: definition.constraints,
    params: definition.params,
    returns: definition.returns,
    ...definition.shape === undefined ? {} : { shape: definition.shape },
    comparator: definition.comparator,
    entry: definition.entry,
    starter: definition.starter,
    examples: examplesOf(definition),
    hiddenCaseCount,
    origin: definition.origin,
    ...variant === undefined ? {} : { variant },
  }
}

async function loadProblem(root: string, id: string, requireSuites: boolean): Promise<ProblemDefinition> {
  const directory = join(root, 'problems', id)
  const path = join(directory, 'problem.yaml')
  const parsed = problemFileSchema.safeParse(await readYaml(path))
  if (!parsed.success) fail(path, parsed.error.message)
  const file: ProblemFile = parsed.data
  if (file.id !== id) fail(path, `id ${file.id} does not match directory ${id}`)
  const suites = await loadSuites(directory, id)
  const suite = suites.get(file.suiteVersion)
  if (suite === undefined && requireSuites) fail(path, `suite v${String(file.suiteVersion)} is missing`)
  if (suite !== undefined) {
    assertCasesMatchSignature(path, file.params, file.returns, suite.cases)
    if (!suite.cases.some(item => item.visibility === 'example')) fail(path, 'the suite has no visible example')
  }
  const oracle = await readOptional(join(directory, 'oracle.py'))
  return {
    id: brandString<ProblemId>(id),
    kind: file.kind,
    version: file.version,
    suiteVersion: file.suiteVersion,
    title: file.title,
    difficulty: file.difficulty,
    topics: file.topics.map(topic => brandString<TopicId>(topic)),
    ...file.leetcode === undefined ? {} : { leetcode: { ...file.leetcode, url: `https://leetcode.com/problems/${file.leetcode.slug}/` } },
    summary: file.summary,
    ...file.statement === undefined ? {} : { statement: file.statement },
    constraints: file.constraints,
    params: file.params,
    returns: file.returns,
    ...file.shape === undefined ? {} : { shape: file.shape },
    comparator: file.comparator,
    entry: file.entry,
    starter: await startersOf(directory, file.entry, file.params, file.returns, 'method', file.shape),
    perCaseMs: file.perCaseMs,
    hints: file.hints,
    solution: { explanation: file.solution.explanation, python: await readOptional(join(directory,
      'solution.py')) ?? await readText(join(directory, 'reference.py')) },
    reference: await readText(join(directory, 'reference.py')),
    ...oracle === undefined ? {} : { oracle },
    suites,
    exampleExplanations: Object.fromEntries(file.examples.flatMap(item => item.explanation === undefined ? [] : [[item.id,
      item.explanation]])),
    origin: AUTHORED,
    seedInputs: { examples: file.examples, boundary: file.boundaryCases.map(item => item.args), ...await generatorOf(root, directory, path,
      file.params, file.inputs) },
  }
}

async function loadVariant(root: string, id: string, requireSuites: boolean): Promise<ProblemDefinition> {
  const directory = join(root, 'variants', id)
  const path = join(directory, 'variant.yaml')
  const parsed = variantFileSchema.safeParse(await readYaml(path))
  if (!parsed.success) fail(path, parsed.error.message)
  const file: VariantFile = parsed.data
  if (file.id !== id) fail(path, `id ${file.id} does not match directory ${id}`)
  const suites = await loadSuites(directory, id)
  const suite = suites.get(file.suiteVersion)
  if (suite === undefined && requireSuites) fail(path, `suite v${String(file.suiteVersion)} is missing`)
  if (suite !== undefined) assertCasesMatchSignature(path, file.params, file.returns, suite.cases)
  const reference = await readText(join(directory, 'reference.py'))
  return {
    id: brandString<ProblemId>(id),
    kind: 'variant',
    version: file.version,
    suiteVersion: file.suiteVersion,
    title: file.title,
    difficulty: file.difficulty,
    topics: [brandString<TopicId>(file.topicId)],
    summary: file.summary,
    statement: file.statement,
    constraints: file.constraints,
    params: file.params,
    returns: file.returns,
    ...file.shape === undefined ? {} : { shape: file.shape },
    comparator: file.comparator,
    entry: file.entry,
    starter: await startersOf(directory, file.entry, file.params, file.returns, 'function', file.shape),
    perCaseMs: file.perCaseMs,
    hints: file.hints,
    solution: { explanation: file.transfer, python: reference },
    reference,
    oracle: await readText(join(directory, 'oracle.py')),
    suites,
    exampleExplanations: {},
    origin: AUTHORED,
    seedInputs: {
      examples: file.examples.map((item, index) => ({ id: `ex-${String(index + 1)}`, args: item.args, expected: item.expected })),
      boundary: file.boundaryCases.map(item => item.args),
      ...await generatorOf(root, directory, path, file.params, file.inputs),
      mutants: await readMutants(join(directory, 'mutants')),
    },
    variant: {
      parentProblemId: brandString<ProblemId>(file.parentProblemId),
      differences: file.differences,
      transfer: file.transfer,
      skills: file.skills,
    },
  }
}

/**
 * Load and cross-check the built-in curriculum.
 * @param root - the package `content` directory.
 * @param requireSuites - reject problems whose declared suite version has no frozen file; only suite freezing passes false.
 * @returns the validated curriculum.
 */
export async function loadCurriculum(root: string, requireSuites = true): Promise<Curriculum> {
  const topicNames = (await readdir(join(root, 'topics'))).filter(name => name.endsWith('.yaml')).sort()
  const topics: TopicView[] = []
  const problems = new Map<ProblemId, ProblemDefinition>()
  const seedVariants = new Map<TopicId, ProblemId[]>()
  for (const name of topicNames) {
    const path = join(root, 'topics', name)
    const parsed = topicFileSchema.safeParse(await readYaml(path))
    if (!parsed.success) fail(path, parsed.error.message)
    const file = parsed.data
    if (`${file.id}.yaml` !== name) fail(path, 'id does not match the file name')
    for (const problemId of file.problems) {
      if (!problems.has(brandString<ProblemId>(problemId))) problems.set(brandString<ProblemId>(problemId), await loadProblem(root,
        problemId, requireSuites))
    }
    const variants: ProblemId[] = []
    for (const variantId of file.variants) {
      const variant = await loadVariant(root, variantId, requireSuites)
      if (variant.topics[0] !== file.id) fail(path, `variant ${variantId} belongs to another topic`)
      if (!file.problems.includes(variant.variant?.parentProblemId ?? '')) fail(path,
        `variant ${variantId} parent is not a problem of this topic`)
      problems.set(variant.id, variant)
      variants.push(variant.id)
    }
    if (!file.problems.includes(file.lesson.practiceProblem)) fail(path, 'practiceProblem is not listed in problems')
    for (const question of file.lesson.check) {
      if (question.answer >= question.options.length) fail(path, `check ${question.id} answer index is out of range`)
    }
    for (const step of file.lesson.example.trace) {
      for (const column of file.lesson.example.traceColumns) {
        if (!(column in step.state)) fail(path, `trace step is missing column ${column}`)
      }
    }
    seedVariants.set(brandString<TopicId>(file.id), variants)
    topics.push({
      id: brandString<TopicId>(file.id),
      order: file.order,
      title: file.title,
      summary: file.summary,
      prerequisites: file.prerequisites.map(item => brandString<TopicId>(item)),
      problems: file.problems.map(item => brandString<ProblemId>(item)),
      lesson: { ...file.lesson, practiceProblem: brandString<ProblemId>(file.lesson.practiceProblem) },
    })
  }
  const topicIds = new Set(topics.map(topic => topic.id))
  for (const topic of topics) {
    for (const prerequisite of topic.prerequisites) {
      if (!topicIds.has(prerequisite)) fail(`topics/${topic.id}.yaml`, `unknown prerequisite ${prerequisite}`)
    }
  }
  for (const problem of problems.values()) {
    for (const topic of problem.topics) {
      if (!topicIds.has(topic)) fail(`problems/${problem.id}`, `unknown topic ${topic}`)
    }
  }
  topics.sort((left, right) => left.order - right.order)
  const collections: CollectionView[] = []
  const collectionNames = (await readdir(join(root, 'collections')).catch((error: unknown) => {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  })).filter(name => name.endsWith('.yaml')).sort()
  for (const name of collectionNames) {
    const path = join(root, 'collections', name)
    const parsed = collectionFileSchema.safeParse(await readYaml(path))
    if (!parsed.success) fail(path, parsed.error.message)
    const file = parsed.data
    if (`${file.id}.yaml` !== name) fail(path, 'id does not match the file name')
    const seen = new Set<string>()
    for (const group of file.groups) {
      for (const problem of group.problems) {
        if (!problems.has(brandString<ProblemId>(problem))) fail(path, `problem ${problem} is not in any topic`)
        if (seen.has(problem)) fail(path, `problem ${problem} is listed twice`)
        seen.add(problem)
      }
    }
    collections.push({ id: file.id, title: file.title, source: file.source,
      groups: file.groups.map(group => ({ id: group.id, title: group.title, problems: group.problems.map(item => brandString<ProblemId>(item)) })) })
  }
  return { topics, problems, seedVariants, collections }
}
