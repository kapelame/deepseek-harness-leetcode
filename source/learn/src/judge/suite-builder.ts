/**
 * Suite derivation and validation. Generator, reference, oracle, mutants, and
 * parent code all run in the isolated runner, because model-generated and
 * imported code is untrusted. The same pipeline freezes authored suites.
 */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type { Comparator, ParamSpec, ValueType } from '../types.ts'
import type { SuiteCase } from '../content/catalog.ts'
import { matchesValueType } from '../content/schema.ts'
import type { CaseOutcome, ExecutionOutcome, RunnerBackend } from '../runner/types.ts'
import { canonical, outputsMatch } from './compare.ts'

/** Seeds used for authored and generated suites: twelve small random cases and two large ones. */
export const SUITE_SEEDS = { small: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], large: [101, 102] } as const

/** Inputs for one suite build. */
export interface SuiteBuildInput {
  readonly params: readonly ParamSpec[]
  readonly returns: ValueType
  readonly comparator: Comparator
  /** Python entry name shared by reference, oracle, and mutants. */
  readonly entry: string
  readonly reference: string
  readonly oracle?: string
  /** Python source defining `generate(seed, size)`. */
  readonly generator: string
  readonly examples: readonly { readonly id: string; readonly args: readonly JsonValue[]; readonly expected?: JsonValue }[]
  readonly boundary: readonly (readonly JsonValue[])[]
  readonly perCaseMs: number
  readonly smallSeeds: readonly number[]
  readonly largeSeeds: readonly number[]
  readonly mutants?: readonly string[]
  /** Parent problem whose solution must not already solve the candidate. */
  readonly parent?: {
    readonly reference: string
    readonly entry: string
    readonly params: readonly ParamSpec[]
    readonly returns: ValueType
  }
}

/** One named validation check. */
export interface SuiteCheck {
  readonly name: string
  readonly ok: boolean
  readonly detail: string
}

/** Build result; `cases` is present only when every check passed. */
export interface SuiteBuildResult {
  readonly ok: boolean
  readonly checks: readonly SuiteCheck[]
  readonly cases?: readonly SuiteCase[]
}

function outcomeProblem(outcome: ExecutionOutcome): string | undefined {
  switch (outcome.status) {
    case 'completed': {
      const failed = outcome.cases.find((item): item is Extract<CaseOutcome, { ok: false }> => !item.ok)
      return failed === undefined ? undefined : `case ${failed.id}: ${failed.error.message}`
    }
    case 'compile-error': return `compile error${outcome.line === null ? '' : ` on line ${String(outcome.line)}`}: ${outcome.message}`
    case 'module-error': return `module error: ${outcome.message}`
    case 'timeout': return `time limit exceeded${outcome.caseId === null ? '' : ` on case ${outcome.caseId}`}`
    case 'memory-limit': return 'memory limit exceeded'
    case 'output-limit': return 'output limit exceeded'
    case 'cancelled': return 'cancelled'
    case 'unavailable': return `runner unavailable: ${outcome.message}`
    case 'runner-error': return `runner error: ${outcome.message}`
    default: {
      const unreachable: never = outcome
      return unreachable
    }
  }
}

function valuesById(outcome: ExecutionOutcome): Map<string, CaseOutcome> {
  return new Map('cases' in outcome ? outcome.cases.map(item => [item.id, item]) : [])
}

/**
 * Derive and validate a suite.
 * @param runner - isolated runner backend.
 * @param input - signature, code, and authored inputs.
 * @param signal - cancellation.
 * @returns ordered checks and, when all pass, frozen cases with reference expected values.
 */
export async function buildSuite(runner: RunnerBackend, input: SuiteBuildInput, signal: AbortSignal): Promise<SuiteBuildResult> {
  const checks: SuiteCheck[] = []
  const fail = (name: string, detail: string): SuiteBuildResult => {
    checks.push({ name, ok: false, detail })
    return { ok: false, checks }
  }
  const pass = (name: string, detail: string): void => { checks.push({ name, ok: true, detail }) }
  const signatureProblem = (args: readonly JsonValue[]): string | undefined => {
    if (args.length !== input.params.length) return `expected ${String(input.params.length)} arguments, got ${String(args.length)}`
    const index = input.params.findIndex((param, position) => !matchesValueType(param.type, args[position]))
    return index < 0 ? undefined : `argument ${input.params[index]?.name ?? String(index)} is not ${input.params[index]?.type ?? ''}`
  }

  for (const example of input.examples) {
    const problem = signatureProblem(example.args)
    if (problem !== undefined) return fail('signature', `example ${example.id}: ${problem}`)
    if (example.expected !== undefined && !matchesValueType(input.returns, example.expected)) return fail('signature',
      `example ${example.id}: expected value is not ${input.returns}`)
  }
  for (const [index, args] of input.boundary.entries()) {
    const problem = signatureProblem(args)
    if (problem !== undefined) return fail('signature', `boundary case ${String(index + 1)}: ${problem}`)
  }
  pass('signature', 'examples and boundary cases match the declared parameters and return type')

  const seeds = [...input.smallSeeds.map(seed => ({ seed, size: 'small' })), ...input.largeSeeds.map(seed => ({ seed, size: 'large' }))]
  const generated = await runner.execute({
    language: 'python', code: input.generator, entry: 'generate', params: ['int', 'string'], returns: 'json',
    cases: seeds.map(item => ({ id: `${item.size === 'small' ? 'r' : 'l'}-${String(item.seed)}`, args: [item.seed, item.size] })),
    perCaseMs: 5000,
  }, signal)
  const generationProblem = outcomeProblem(generated)
  if (generationProblem !== undefined) return fail('generator', generationProblem)
  const generatedCases: { id: string; args: readonly JsonValue[]; label: string }[] = []
  for (const item of valuesById(generated).values()) {
    if (!item.ok) continue
    if (!Array.isArray(item.value)) return fail('generator', `${item.id} did not return an argument list`)
    const problem = signatureProblem(item.value)
    if (problem !== undefined) return fail('generator', `${item.id}: ${problem}`)
    generatedCases.push({ id: item.id, args: item.value, label: item.id.startsWith('l-') ? 'adversarial' : 'random' })
  }
  pass('generator', `generated ${String(generatedCases.length)} seeded cases`)

  const seen = new Set<string>()
  const ordered: { id: string; args: readonly JsonValue[]; visibility: 'example' | 'hidden'; label: string; expected?: JsonValue }[] = []
  const add = (item: { id: string; args: readonly JsonValue[]; visibility: 'example' | 'hidden'; label: string; expected?: JsonValue }): void => {
    const key = canonical(item.args)
    if (seen.has(key)) return
    seen.add(key)
    ordered.push(item)
  }
  for (const example of input.examples) add({ id: example.id, args: example.args, visibility: 'example', label: 'example',
    ...example.expected === undefined ? {} : { expected: example.expected } })
  input.boundary.forEach((args, index) => { add({ id: `b-${String(index + 1)}`, args, visibility: 'hidden', label: 'boundary' }) })
  for (const item of generatedCases) add({ ...item, visibility: 'hidden' })

  const reference = await runner.execute({
    language: 'python', code: input.reference, entry: input.entry, params: input.params.map(item => item.type), returns: input.returns,
    cases: ordered.map(item => ({ id: item.id, args: item.args })), perCaseMs: input.perCaseMs,
  }, signal)
  const referenceProblem = outcomeProblem(reference)
  if (referenceProblem !== undefined) return fail('reference', referenceProblem)
  const referenceValues = valuesById(reference)
  const cases: SuiteCase[] = []
  for (const item of ordered) {
    const reported = referenceValues.get(item.id)
    if (reported === undefined || !reported.ok) return fail('reference', `no reference value for ${item.id}`)
    if (!matchesValueType(input.returns, reported.value)) return fail('reference', `${item.id}: reference value is not ${input.returns}`)
    if (item.expected !== undefined && !(outputsMatch(input.comparator, reported.value, item.expected,
      item.args) && outputsMatch(input.comparator, item.expected, reported.value, item.args))) {
      return fail('reference',
        `example ${item.id} states ${JSON.stringify(item.expected)} but the reference returns ${JSON.stringify(reported.value)}`)
    }
    cases.push({ id: item.id, args: item.args, expected: reported.value, visibility: item.visibility, label: item.label })
  }
  const slowest = Math.max(...[...referenceValues.values()].map(item => item.timeMs))
  pass('reference', `reference solved ${String(cases.length)} cases; slowest case ${slowest.toFixed(1)} ms of ${String(input.perCaseMs)} ms`)

  if (input.oracle !== undefined) {
    const small = cases.filter(item => item.label !== 'adversarial')
    const oracle = await runner.execute({
      language: 'python', code: input.oracle, entry: input.entry, params: input.params.map(item => item.type), returns: input.returns,
      cases: small.map(item => ({ id: item.id, args: item.args })), perCaseMs: Math.min(10_000, input.perCaseMs * 3),
    }, signal)
    const oracleProblem = outcomeProblem(oracle)
    if (oracleProblem !== undefined) return fail('oracle', oracleProblem)
    const oracleValues = valuesById(oracle)
    for (const item of small) {
      const reported = oracleValues.get(item.id)
      if (reported === undefined || !reported.ok || !outputsMatch(input.comparator, reported.value, item.expected, item.args)) {
        return fail('oracle',
          `brute-force oracle disagrees with the reference on ${item.id}: oracle ${JSON.stringify(reported?.ok === true ? reported.value : null)}, reference ${JSON.stringify(item.expected)}`)
      }
    }
    pass('oracle', `independent brute-force oracle agreed on ${String(small.length)} cases`)
  }

  if (input.mutants !== undefined) {
    let killed = 0
    for (const [index, mutant] of input.mutants.entries()) {
      const outcome = await runner.execute({
        language: 'python', code: mutant, entry: input.entry, params: input.params.map(item => item.type), returns: input.returns,
        cases: cases.map(item => ({ id: item.id, args: item.args })), perCaseMs: input.perCaseMs,
      }, signal)
      if (outcome.status === 'unavailable' || outcome.status === 'runner-error' || outcome.status === 'cancelled') return fail('mutants',
        `mutant ${String(index + 1)}: ${outcomeProblem(outcome) ?? ''}`)
      const values = valuesById(outcome)
      const survives = outcome.status === 'completed' && cases.every((item) => {
        const reported = values.get(item.id)
        return reported?.ok === true && outputsMatch(input.comparator, reported.value, item.expected, item.args)
      })
      if (survives) return fail('mutants', `incorrect implementation ${String(index + 1)} passes every case; the tests are too weak`)
      killed++
    }
    pass('mutants', `all ${String(killed)} incorrect implementations fail at least one case`)
  }

  if (input.parent !== undefined) {
    const parent = input.parent
    const compatible = parent.returns === input.returns && parent.params.length === input.params.length
      && parent.params.every((item, index) => item.type === input.params[index]?.type)
    if (!compatible) {
      pass('transfer', 'the parent signature differs, so its solution cannot be replayed unchanged')
    } else {
      const outcome = await runner.execute({
        language: 'python', code: parent.reference, entry: parent.entry, params: parent.params.map(item => item.type), returns: parent.returns,
        cases: cases.map(item => ({ id: item.id, args: item.args })), perCaseMs: input.perCaseMs,
      }, signal)
      const values = valuesById(outcome)
      const replays = outcome.status === 'completed' && cases.every((item) => {
        const reported = values.get(item.id)
        return reported?.ok === true && outputsMatch(input.comparator, reported.value, item.expected, item.args)
      })
      if (replays) return fail('transfer',
        'the parent problem\'s solution already passes every case; the variant is not meaningfully different')
      pass('transfer', 'the parent solution fails at least one case, so the variant requires adapting the idea')
    }
  }

  if (!cases.some(item => item.visibility === 'example')) return fail('coverage', 'no visible example')
  if (!cases.some(item => item.label === 'boundary')) return fail('coverage', 'no boundary case survived deduplication')
  pass('coverage', `${String(cases.filter(item => item.visibility === 'example').length)} examples, ${String(cases.filter(item => item.label === 'boundary').length)} boundary, ${String(cases.filter(item => item.label === 'random').length)} random, ${String(cases.filter(item => item.label === 'adversarial').length)} large cases`)
  return { ok: true, checks, cases }
}
