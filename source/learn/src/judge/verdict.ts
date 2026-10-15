/**
 * Verdict assembly. The verdict is a pure function of the runner outcome and
 * the Host-held expected values; no model output participates.
 */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type { CaseResult, CodeLanguage, Comparator, ExecutionVerdict, FailingCase, Localized, VerdictKind } from '../types.ts'
import type { CaseOutcome, ExecutionOutcome } from '../runner/types.ts'
import { outputsMatch } from './compare.ts'

/** One case evaluated by the judge, with its Host-held expected value. */
export interface JudgedCase {
  readonly id: string
  readonly args: readonly JsonValue[]
  /** Absent when no trusted expected value exists (custom input the reference rejected). */
  readonly expected?: JsonValue
  readonly visibility: 'example' | 'custom' | 'hidden'
  readonly label?: string
}

/** Inputs for {@link assembleVerdict}. */
export interface VerdictInput {
  readonly outcome: ExecutionOutcome
  readonly cases: readonly JudgedCase[]
  readonly comparator: Comparator
  readonly suite: ExecutionVerdict['suite']
  readonly suiteVersion: number
  readonly language: CodeLanguage
  /** Include per-case results; only Run, whose cases are all visible, sets this. */
  readonly includeCaseResults: boolean
  readonly now: string
}

function coverage(input: VerdictInput, passed: number, total: number): Localized {
  const hidden = input.cases.filter(item => item.visibility === 'hidden').length
  const visible = total - hidden
  if (input.suite === 'full') {
    return {
      zh: `本地测试：通过 ${String(passed)}/${String(total)}（${String(visible)} 个示例，${String(hidden)} 个隐藏的边界、随机和对抗用例，套件 v${String(input.suiteVersion)}）。本地测试不能证明程序完全正确，也不等于 LeetCode 官方判定通过。`,
      en: `Local tests: ${String(passed)}/${String(total)} passed (${String(visible)} examples, ${String(hidden)} hidden boundary, random, and adversarial cases, suite v${String(input.suiteVersion)}). Local tests cannot prove correctness and are not LeetCode acceptance.`,
    }
  }
  return {
    zh: `运行了 ${String(total)} 个可见用例，通过 ${String(passed)} 个。提交时会运行完整的冻结测试套件。`,
    en: `Ran ${String(total)} visible cases; ${String(passed)} passed. Submit runs the full frozen suite.`,
  }
}

function caseError(outcome: CaseOutcome): string | undefined {
  return outcome.ok ? undefined : outcome.error.message
}

function failingCase(judged: JudgedCase, outcome: CaseOutcome | undefined, extra: Partial<FailingCase> = {}): FailingCase {
  return {
    caseId: judged.id,
    visibility: judged.visibility,
    args: judged.args,
    ...judged.expected === undefined ? {} : { expected: judged.expected },
    ...outcome?.ok === true ? { actual: outcome.value } : {},
    ...outcome !== undefined && !outcome.ok ? { error: outcome.error.message,
      ...outcome.error.line === null ? {} : { line: outcome.error.line } } : {},
    ...outcome !== undefined && outcome.stdout !== '' && judged.visibility !== 'hidden' ? { stdout: outcome.stdout } : {},
    ...extra,
  }
}

/**
 * Build the immutable verdict of one execution.
 * @param input - runner outcome, judged cases, and comparison contract.
 * @returns the execution verdict.
 */
export function assembleVerdict(input: VerdictInput): ExecutionVerdict {
  const { outcome } = input
  const total = input.cases.length
  const base = { total, suite: input.suite, suiteVersion: input.suiteVersion, language: input.language, runner: outcome.runner,
    createdAt: input.now }
  const byId = new Map(input.cases.map(item => [item.id, item]))
  const results = 'cases' in outcome ? outcome.cases : []
  const measuredMs = results.reduce((sum, item) => sum + item.timeMs, 0)
  const memory = outcome.status === 'completed' && outcome.peakKb !== undefined ? { peakMemoryKb: outcome.peakKb } : {}
  const passedCount = results.filter((item) => {
    const judged = byId.get(item.id)
    return judged !== undefined && item.ok && (judged.expected === undefined || outputsMatch(input.comparator, item.value, judged.expected,
      judged.args))
  }).length
  const caseResults = (): readonly CaseResult[] | undefined => input.includeCaseResults
    ? input.cases.map((judged): CaseResult => {
      const reported = results.find(item => item.id === judged.id)
      const matched = reported?.ok === true && (judged.expected === undefined || outputsMatch(input.comparator, reported.value,
        judged.expected, judged.args))
      const error = reported === undefined ? undefined : caseError(reported)
      return {
        caseId: judged.id,
        args: judged.args,
        ...judged.expected === undefined ? {} : { expected: judged.expected },
        ...reported?.ok === true ? { actual: reported.value } : {},
        passed: reported !== undefined && matched,
        ...error === undefined ? {} : { error },
        ...reported !== undefined && !reported.ok && reported.error.line !== null ? { line: reported.error.line } : {},
        stdout: reported?.stdout ?? '',
        ...reported === undefined ? {} : { timeMs: reported.timeMs },
      }
    })
    : undefined
  const withCases = (verdict: Omit<ExecutionVerdict, 'cases' | 'coverageNote'>): ExecutionVerdict => {
    const cases = caseResults()
    return { ...verdict, coverageNote: coverage(input, verdict.passed, total), ...cases === undefined ? {} : { cases } }
  }
  const limitVerdict = (kind: VerdictKind, caseId: string | null, message: string): ExecutionVerdict => {
    const judged = caseId === null ? undefined : byId.get(caseId)
    return withCases({
      ...base, kind, passed: passedCount, message,
      ...judged === undefined ? {} : { failing: failingCase(judged, results.find(item => item.id === judged.id), { error: message }) },
      ...measuredMs > 0 ? { measuredMs } : {},
    })
  }
  switch (outcome.status) {
    case 'unavailable':
      return withCases({ ...base, kind: 'evaluation-unavailable', passed: 0, message: outcome.message })
    case 'runner-error':
      return withCases({ ...base, kind: 'evaluation-unavailable', passed: 0, message: `Runner failure: ${outcome.message}` })
    case 'cancelled':
      return withCases({ ...base, kind: 'cancelled', passed: passedCount, message: 'Execution was cancelled before completion.' })
    case 'compile-error':
    {
      const failing: FailingCase | undefined = outcome.line === null
        ? undefined
        : { caseId: 'compile', visibility: 'example', args: [], error: outcome.message, line: outcome.line }
      return withCases({ ...base, kind: 'compile-error', passed: 0, message: outcome.message, ...failing === undefined ? {} : { failing } })
    }
    case 'module-error':
      return outcome.kind === 'timeout'
        ? withCases({ ...base, kind: 'time-limit-exceeded', passed: 0, message: outcome.message })
        : withCases({ ...base, kind: 'runtime-error', passed: 0, message: outcome.message, failing: { caseId: 'module',
          visibility: 'example', args: [], error: outcome.message, ...outcome.line === null ? {} : { line: outcome.line } } })
    case 'timeout':
      return limitVerdict('time-limit-exceeded', outcome.caseId, 'Time limit exceeded.')
    case 'memory-limit':
      return limitVerdict('memory-limit-exceeded', outcome.caseId, 'Memory limit exceeded.')
    case 'output-limit':
      return limitVerdict('output-limit-exceeded', outcome.caseId, 'Output limit exceeded.')
    case 'completed':
      break
    default: {
      const unreachable: never = outcome
      return unreachable
    }
  }
  for (const judged of input.cases) {
    const reported = results.find(item => item.id === judged.id)
    if (reported === undefined) {
      return withCases({ ...base, kind: 'evaluation-unavailable', passed: passedCount,
        message: `The runner did not report case ${judged.id}.` })
    }
    if (!reported.ok) {
      const kind: VerdictKind = reported.error.kind === 'invalid-output' ? 'wrong-answer' : 'runtime-error'
      return withCases({ ...base, kind, passed: passedCount, message: reported.error.message, failing: failingCase(judged, reported),
        measuredMs, ...memory })
    }
    if (judged.expected !== undefined && !outputsMatch(input.comparator, reported.value, judged.expected, judged.args)) {
      return withCases({ ...base, kind: 'wrong-answer', passed: passedCount, failing: failingCase(judged, reported), measuredMs, ...memory })
    }
  }
  return withCases({ ...base, kind: 'passed-local-tests', passed: passedCount, measuredMs, ...memory })
}
