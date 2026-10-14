/** zod validation for curriculum files, frozen suites, imports, and model-produced variant specifications. */
import { z } from 'zod'
import type { HarnessName, ParamSpec, ProblemShape, ValueType } from '../types.ts'

/** Every value encoding accepted from content, imports, and models. */
export const VALUE_TYPES = [
  'int', 'float', 'bool', 'string',
  'int[]', 'float[]', 'bool[]', 'string[]',
  'int[][]', 'string[][]',
  'tree', 'linked-list', 'linked-list[]',
  'json',
] as const satisfies readonly ValueType[]

/**
 * Argument encodings each harness accepts, the return encodings it reports, and the parameters the
 * solution itself receives (used for starters and prompts).
 */
export const HARNESS_SIGNATURES: Readonly<Record<HarnessName, {
  readonly params: readonly ValueType[]
  readonly returns: readonly ValueType[]
  readonly solution: readonly { readonly name: string; readonly node: 'ListNode' | 'TreeNode' | 'Node' }[]
  readonly result: Readonly<Partial<Record<ValueType, 'ListNode' | 'TreeNode' | 'Node' | 'bool'>>>
}>> = {
  'linked-list-cycle': { params: ['linked-list', 'int'], returns: ['bool', 'int'], solution: [{ name: 'head', node: 'ListNode' }],
    result: { bool: 'bool', int: 'ListNode' } },
  'linked-list-intersection': { params: ['int', 'linked-list', 'linked-list', 'int', 'int'], returns: ['json'],
    solution: [{ name: 'headA', node: 'ListNode' }, { name: 'headB', node: 'ListNode' }], result: { json: 'ListNode' } },
  'random-list': { params: ['json'], returns: ['json'], solution: [{ name: 'head', node: 'Node' }], result: { json: 'Node' } },
  'tree-node-refs': { params: ['tree', 'int', 'int'], returns: ['int'],
    solution: [{ name: 'root', node: 'TreeNode' }, { name: 'p', node: 'TreeNode' }, { name: 'q', node: 'TreeNode' }],
    result: { int: 'TreeNode' } },
}

const bound = z.number().int().min(-1_000_000_000).max(1_000_000_000)
const length = z.number().int().min(0).max(200_000)

/** Declarative input domain of one parameter, consumed by `runtime/gen_lib.py`. */
export const inputDomainSchema = z.object({
  type: z.enum(VALUE_TYPES),
  min: bound.optional(),
  max: bound.optional(),
  smallMin: bound.optional(),
  smallMax: bound.optional(),
  digits: z.number().int().min(0).max(9).optional(),
  minLength: length.optional(),
  maxLength: length.optional(),
  smallMaxLength: length.optional(),
  largeLength: length.optional(),
  sorted: z.enum(['asc', 'desc']).optional(),
  distinct: z.boolean().optional(),
  alphabet: z.string().min(1).max(200).optional(),
  smallAlphabet: z.string().min(1).max(200).optional(),
  shape: z.enum(['random', 'chain']).optional(),
  word: z.object({ minLength: length.optional(), maxLength: length.optional(), smallMaxLength: length.optional(),
    alphabet: z.string().min(1).max(200).optional() }).strict().optional(),
  row: z.object({ minLength: length.optional(), maxLength: length.optional(), smallMaxLength: length.optional(),
    largeLength: length.optional() }).strict().optional(),
  cell: z.object({ min: bound.optional(), max: bound.optional(), alphabet: z.string().min(1).max(200).optional(),
    maxLength: length.optional() }).strict().optional(),
}).strict().superRefine((value, issue) => {
  if (value.min !== undefined && value.max !== undefined && value.min > value.max) issue.addIssue({ code: 'custom',
    message: 'min exceeds max' })
  if (value.minLength !== undefined && value.maxLength !== undefined && value.minLength > value.maxLength) issue.addIssue({ code: 'custom',
    message: 'minLength exceeds maxLength' })
})

/** One parameter domain. */
export type InputDomain = z.infer<typeof inputDomainSchema>

const localized = z.object({ zh: z.string().trim().min(1), en: z.string().trim().min(1) }).strict()
const identifier = z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/)
const contentId = z.string().regex(/^[a-z0-9][a-z0-9-]{1,63}$/)
const valueType = z.enum(VALUE_TYPES)
const difficulty = z.enum(['easy', 'medium', 'hard'])

/** Host-owned comparator selection. */
export const comparatorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('exact') }).strict(),
  z.object({ kind: z.literal('unordered') }).strict(),
  z.object({ kind: z.literal('unordered-nested') }).strict(),
  z.object({ kind: z.literal('float'), tolerance: z.number().positive().max(1) }).strict(),
  z.object({ kind: z.literal('validator'), name: z.enum(['pair-indices-sum', 'pair-indices-sum-one-based',
    'longest-palindromic-substring', 'balanced-bst-same-inorder']) }).strict(),
])

const param = z.object({ name: identifier, type: valueType }).strict()

/** Judge calling convention; see `ProblemShape`. */
export const shapeSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('in-place'), param: z.number().int().nonnegative() }).strict(),
  z.object({ kind: z.literal('harness'), name: z.enum(['linked-list-cycle', 'linked-list-intersection', 'random-list',
    'tree-node-refs']) }).strict(),
  z.object({
    kind: z.literal('design'),
    className: identifier,
    constructorParams: z.array(param),
    methods: z.array(z.object({ name: identifier, params: z.array(param), returns: z.union([valueType, z.literal('void')]) }).strict())
      .min(1),
  }).strict(),
])

/**
 * Check that a signature fits its calling convention.
 * @param params - declared parameters.
 * @param returns - declared return encoding.
 * @param shape - optional calling convention.
 * @returns a problem description, or `undefined` when consistent.
 */
export function shapeProblem(params: readonly ParamSpec[], returns: ValueType, shape: ProblemShape | undefined): string | undefined {
  if (shape === undefined) return undefined
  switch (shape.kind) {
    case 'in-place': {
      const target = params[shape.param]
      if (target === undefined) return `in-place parameter ${String(shape.param)} does not exist`
      return target.type === returns ? undefined : `in-place problems declare returns as the compared parameter type (${target.type})`
    }
    case 'harness': {
      const signature = HARNESS_SIGNATURES[shape.name]
      const types = params.map(item => item.type)
      if (types.length !== signature.params.length || types.some((type, index) => type !== signature.params[index])) {
        return `harness ${shape.name} needs parameters (${signature.params.join(', ')})`
      }
      return signature.returns.includes(returns) ? undefined : `harness ${shape.name} returns ${signature.returns.join(' or ')}`
    }
    case 'design':
      if (params.length !== 2 || params[0]?.type !== 'string[]' || params[1]?.type !== 'json' || returns !== 'json') {
        return 'design problems take (operations: string[], arguments: json) and return json'
      }
      return new Set(shape.methods.map(item => item.name)).size === shape.methods.length ? undefined : 'design method names repeat'
    default: {
      const unreachable: never = shape
      return unreachable
    }
  }
}
const entry = z.object({ python: identifier, typescript: identifier }).strict()

/** One `content/topics/<id>.yaml` file. */
export const topicFileSchema = z.object({
  id: contentId,
  order: z.number().int().positive(),
  title: localized,
  summary: localized,
  prerequisites: z.array(contentId),
  problems: z.array(contentId).min(2),
  variants: z.array(contentId).min(2),
  lesson: z.object({
    motivation: localized,
    strategy: localized,
    example: z.object({
      title: localized,
      body: localized,
      traceColumns: z.array(z.string().min(1)).min(1),
      trace: z.array(z.object({ state: z.record(z.string(), z.string()), note: localized }).strict()).min(2),
    }).strict(),
    check: z.array(z.object({
      id: contentId,
      prompt: localized,
      options: z.array(localized).min(2).max(5),
      answer: z.number().int().nonnegative(),
      explanation: localized,
    }).strict()).min(1),
    practiceProblem: contentId,
    reflectionPrompt: localized,
  }).strict(),
}).strict()

/** One `content/collections/<id>.yaml` file: a curated list of built-in problems in its publisher's grouping. */
export const collectionFileSchema = z.object({
  id: contentId,
  title: localized,
  source: z.object({ name: z.string().min(1), url: z.url(), verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).strict(),
  groups: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]{1,64}$/), title: localized, problems: z.array(contentId).min(1) }).strict()).min(1),
}).strict()

/** Parsed topic file. */
export type TopicFile = z.infer<typeof topicFileSchema>

const leetcode = z.object({
  frontendId: z.number().int().positive(),
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  difficulty,
  tags: z.array(z.string().min(1)).min(1),
  paidOnly: z.boolean(),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).strict()

/** One `content/problems/<id>/problem.yaml` file. */
export const problemFileSchema = z.object({
  id: contentId,
  kind: z.enum(['leetcode', 'original']),
  version: z.number().int().positive(),
  suiteVersion: z.number().int().positive(),
  title: localized,
  difficulty,
  topics: z.array(contentId).min(1),
  leetcode: leetcode.optional(),
  summary: localized,
  statement: localized.optional(),
  constraints: z.array(localized),
  params: z.array(param).min(1),
  returns: valueType,
  shape: shapeSchema.optional(),
  comparator: comparatorSchema,
  entry,
  perCaseMs: z.number().int().min(100).max(10_000),
  /** Declarative input domains; `generator.py` in the problem directory overrides them. */
  inputs: z.array(inputDomainSchema).optional(),
  hints: z.array(localized).length(3),
  solution: z.object({ explanation: localized }).strict(),
  examples: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]{1,40}$/), args: z.array(z.json()), expected: z.json(),
    explanation: localized.optional() }).strict()).min(1).max(5),
  boundaryCases: z.array(z.object({ args: z.array(z.json()) }).strict()).min(1).max(30),
}).strict().superRefine((value, issue) => {
  if (value.kind === 'leetcode' && value.leetcode === undefined) issue.addIssue({ code: 'custom',
    message: 'leetcode problems need verified metadata' })
  if (value.kind === 'original' && value.statement === undefined) issue.addIssue({ code: 'custom',
    message: 'original problems need a full statement' })
  if (value.kind === 'leetcode' && value.statement !== undefined) issue.addIssue({ code: 'custom',
    message: 'LeetCode statements are not stored; write an original summary' })
  const mismatch = shapeProblem(value.params, value.returns, value.shape)
  if (mismatch !== undefined) issue.addIssue({ code: 'custom', message: mismatch })
})

/** Parsed problem file. */
export type ProblemFile = z.infer<typeof problemFileSchema>

/** One frozen test case. */
export const suiteCaseSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  args: z.array(z.json()),
  expected: z.json(),
  visibility: z.enum(['example', 'hidden']),
  label: z.enum(['example', 'basic', 'boundary', 'random', 'adversarial', 'proposed']),
}).strict()

/** One frozen `suite.v<N>.json` file. */
export const suiteFileSchema = z.object({
  problemId: contentId,
  version: z.number().int().positive(),
  origin: z.enum(['authored', 'generated', 'promoted']),
  createdAt: z.string().min(1),
  cases: z.array(suiteCaseSchema).min(1),
}).strict()

/** Parsed suite file. */
export type SuiteFile = z.infer<typeof suiteFileSchema>

const difference = z.object({
  category: z.enum(['constraints', 'output', 'input-structure', 'reasoning']),
  description: localized,
}).strict()

/**
 * Structured variant specification. The same schema validates authored seed
 * variants, model-generated candidates, and learner imports.
 */
export const variantSpecSchema = z.object({
  id: contentId,
  parentProblemId: contentId,
  topicId: contentId,
  title: localized,
  statement: localized,
  summary: localized,
  difficulty,
  skills: z.array(z.string().min(1)).min(1),
  differences: z.array(difference).min(1),
  transfer: localized,
  entry,
  params: z.array(param).min(1),
  returns: valueType,
  shape: shapeSchema.optional(),
  comparator: comparatorSchema,
  constraints: z.array(localized).min(1),
  examples: z.array(z.object({ args: z.array(z.json()), expected: z.json() }).strict()).min(1).max(5),
  /** Optional; derived from the signature when absent. */
  starter: z.object({ python: z.string().min(1), typescript: z.string().min(1) }).strict().optional(),
  reference: z.string().min(1).max(20_000),
  oracle: z.string().min(1).max(20_000),
  /** Preferred: one declarative domain per parameter. */
  inputs: z.array(inputDomainSchema).optional(),
  /** Optional Python defining `adjust(args, rng, size)` and/or `valid(args)` for cross-parameter preconditions. */
  hooks: z.string().min(1).max(20_000).optional(),
  /** Override: Python defining `generate(seed, size)`; used only when `inputs` cannot express the input space. */
  generator: z.string().min(1).max(20_000).optional(),
  boundaryCases: z.array(z.object({ args: z.array(z.json()) }).strict()).min(1).max(20),
  mutants: z.array(z.string().min(1).max(20_000)).min(2).max(6),
  hints: z.array(localized).length(3),
}).strict()

/** Model-written parts of a problem found on LeetCode; signature, ids, and examples come from verified metadata. */
export const foundSubmissionSchema = z.object({
  topicId: contentId,
  summary: localized,
  constraints: z.array(localized).min(1).max(8),
  hints: z.array(localized).length(3),
  explanation: localized,
  comparator: comparatorSchema,
  reference: z.string().min(1).max(20_000),
  oracle: z.string().min(1).max(20_000),
  inputs: z.array(inputDomainSchema).optional(),
  hooks: z.string().min(1).max(20_000).optional(),
  generator: z.string().min(1).max(20_000).optional(),
  boundaryCases: z.array(z.array(z.json())).min(1).max(20),
}).strict()

/** Parsed model submission for a found problem. */
export type FoundSubmission = z.infer<typeof foundSubmissionSchema>

/** Stored specification of a LeetCode problem added by the problem finder. */
export const foundProblemSpecSchema = z.object({
  format: z.literal('leetcode'),
  leetcode,
  title: localized,
  difficulty,
  topicId: contentId,
  summary: localized,
  constraints: z.array(localized),
  hints: z.array(localized).length(3),
  explanation: localized,
  entry,
  params: z.array(param).min(1),
  returns: valueType,
  shape: shapeSchema.optional(),
  comparator: comparatorSchema,
  reference: z.string().min(1),
  oracle: z.string().min(1),
}).strict()

/** Parsed found-problem specification. */
export type FoundProblemSpec = z.infer<typeof foundProblemSpecSchema>

/** Stored content origin. */
export const contentOriginSchema = z.object({
  source: z.enum(['authored', 'generated', 'imported', 'found']),
  author: z.string(),
  createdAt: z.string(),
  seed: z.number().optional(),
  sessionId: z.string().optional(),
}).strict()

/** Stored validation report. */
export const validationSchema = z.object({
  ok: z.boolean(),
  checks: z.array(z.object({ name: z.string(), ok: z.boolean(), detail: z.string() }).strict()),
}).strict()

/**
 * Whether a specification describes its inputs through domains or a generator override; one of them is required.
 * @param spec - parsed specification.
 * @returns whether an input source is present.
 */
export function hasInputSource(spec: { inputs?: unknown; generator?: unknown }): boolean {
  return spec.inputs !== undefined || spec.generator !== undefined
}

/** `content/variants/<id>/variant.yaml` carries the specification without its code files. */
export const variantFileSchema = variantSpecSchema.omit({
  starter: true, reference: true, oracle: true, generator: true, hooks: true, mutants: true,
}).extend({
  version: z.number().int().positive(),
  suiteVersion: z.number().int().positive(),
  perCaseMs: z.number().int().min(100).max(10_000),
}).strict()

/** Parsed variant file. */
export type VariantFile = z.infer<typeof variantFileSchema>

/**
 * Check one JSON value against a declared encoding.
 * @param type - declared value type.
 * @param value - candidate JSON value.
 * @returns whether the value matches the encoding.
 */
export function matchesValueType(type: ValueType, value: unknown): boolean {
  const isInt = (item: unknown): boolean => typeof item === 'number' && Number.isSafeInteger(item)
  const isFloat = (item: unknown): boolean => typeof item === 'number' && Number.isFinite(item)
  const isArrayOf = (item: unknown, check: (inner: unknown) => boolean): boolean => Array.isArray(item) && item.every(check)
  switch (type) {
    case 'int': return isInt(value)
    case 'float': return isFloat(value)
    case 'bool': return typeof value === 'boolean'
    case 'string': return typeof value === 'string'
    case 'int[]': return isArrayOf(value, isInt)
    case 'float[]': return isArrayOf(value, isFloat)
    case 'bool[]': return isArrayOf(value, item => typeof item === 'boolean')
    case 'string[]': return isArrayOf(value, item => typeof item === 'string')
    case 'int[][]': return isArrayOf(value, row => isArrayOf(row, isInt))
    case 'string[][]': return isArrayOf(value, row => isArrayOf(row, item => typeof item === 'string'))
    case 'tree': return isArrayOf(value, item => item === null || isInt(item))
    case 'linked-list': return isArrayOf(value, isInt)
    case 'linked-list[]': return isArrayOf(value, list => isArrayOf(list, isInt))
    case 'json': return true
    default: {
      const unreachable: never = type
      return unreachable
    }
  }
}
