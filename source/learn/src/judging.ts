/**
 * Run and Submit. Execution verdicts come only from the isolated runner and
 * are recorded once per attempt; the judge agent orchestrates execution and
 * writes a separate tutor assessment that cannot change the verdict.
 */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import { randomUUID } from 'node:crypto'
import { brandString } from '@deepseek-ai/dsh-brand'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { ToolDefinition } from '@deepseek-ai/dsh-tools'
import type {
  AttemptId, AttemptView, CodeLanguage, ExecutionVerdict, LearnerId, LearnLocale, ProblemId, ReviewItemId, SupportLevel,
  TutorAssessment, VerdictKind,
} from './types.ts'
import type { ProblemDefinition, SuiteDefinition } from './content/catalog.ts'
import { executionSignature } from './content/signature.ts'
import { assembleVerdict, type JudgedCase } from './judge/verdict.ts'
import { outputsMatch } from './judge/compare.ts'
import { toJson } from './json.ts'
import { matchesValueType } from './content/schema.ts'
import type { ExecutionOutcome } from './runner/types.ts'
import { judgeSystemPrompt, problemBlock } from './agents/prompts.ts'
import { runLearnAgent } from './agents/runtime.ts'
import type { LearnRuntime } from './runtime.ts'

/** Mistake tags the judge may assign; unknown tags are dropped. */
export const MISTAKE_TAGS = [
  'off-by-one', 'missed-edge-case', 'wrong-data-structure', 'inefficient-algorithm', 'incorrect-invariant', 'duplicate-handling',
  'index-vs-value', 'mutating-input', 'early-return', 'syntax', 'misread-problem', 'complexity-misjudged', 'other',
] as const

/** Run request. */
export interface RunRequest {
  readonly problemId: ProblemId
  readonly language: CodeLanguage
  readonly code: string
  /** Additional visible inputs; each is one argument list. */
  readonly customInputs?: readonly (readonly JsonValue[])[]
}

/** Submit request. */
export interface SubmitRequest {
  readonly problemId: ProblemId
  readonly language: CodeLanguage
  readonly code: string
  readonly context: AttemptView['context']
  readonly reviewItemId?: ReviewItemId
}

/** Typed failure surfaced to the Remote layer. */
export class LearnError extends Error {
  constructor(readonly code: 'not-found' | 'invalid' | 'conflict' | 'unavailable', message: string) {
    super(message)
    this.name = 'LearnError'
  }
}

/**
 * Graded result of a verdict for scheduling.
 * @param verdict - recorded verdict.
 * @returns `passed`, `failed`, or undefined when not gradable.
 */
export function gradeOf(verdict: ExecutionVerdict | undefined): 'passed' | 'failed' | undefined {
  return verdict === undefined ? undefined : gradeOfKind(verdict.kind)
}

/**
 * Graded result of a verdict kind.
 * @param kind - verdict kind.
 * @returns `passed`, `failed`, or undefined for unavailable and cancelled evaluation.
 */
export function gradeOfKind(kind: VerdictKind): 'passed' | 'failed' | undefined {
  switch (kind) {
    case 'passed-local-tests': return 'passed'
    case 'wrong-answer':
    case 'compile-error':
    case 'runtime-error':
    case 'time-limit-exceeded':
    case 'memory-limit-exceeded':
    case 'output-limit-exceeded':
      return 'failed'
    case 'evaluation-unavailable':
    case 'cancelled':
      return undefined
    default: {
      const unreachable: never = kind
      return unreachable
    }
  }
}


/** Run, Submit, and judge orchestration. */
export class Judging {
  constructor(private readonly runtime: LearnRuntime) {}

  /**
   * Support level for a problem, derived from recorded hints.
   * @param learner - learner.
   * @param problem - problem.
   * @returns the support level and number of hints.
   */
  support(learner: LearnerId, problem: ProblemId): { support: SupportLevel; hints: number } {
    const hints = this.runtime.store.hints(learner, problem)
    if (hints.some(item => item.level === 4)) return { support: 'studied-solution', hints: hints.length }
    return { support: hints.length > 0 ? 'with-hints' : 'independent', hints: hints.length }
  }

  private definition(learner: LearnerId, id: ProblemId): ProblemDefinition {
    const definition = this.runtime.problems.get(learner, id)
    if (definition === undefined) throw new LearnError('not-found', `Unknown problem ${id}`)
    return definition
  }

  private frozenSuite(definition: ProblemDefinition): SuiteDefinition {
    const suite = definition.suites.get(definition.suiteVersion)
    if (suite === undefined) throw new LearnError('unavailable',
      `Problem ${definition.id} has no frozen suite v${String(definition.suiteVersion)}`)
    return suite
  }

  private assertCode(code: string): void {
    if (code.length > 64 * 1024) throw new LearnError('invalid', 'Code exceeds 64 KiB')
  }

  private execute(definition: ProblemDefinition, language: CodeLanguage, code: string, cases: readonly JudgedCase[],
    signal: AbortSignal): Promise<ExecutionOutcome> {
    return this.runtime.runner.execute({
      language, code, entry: definition.entry[language], ...executionSignature(definition),
      cases: cases.map(item => ({ id: item.id, args: item.args })), perCaseMs: definition.perCaseMs,
    }, signal)
  }

  /**
   * Expected values for custom inputs, computed by the reference in the runner.
   * @returns judged cases; inputs the reference cannot solve carry no expected value.
   */
  private async customCases(definition: ProblemDefinition, inputs: readonly (readonly JsonValue[])[],
    signal: AbortSignal): Promise<JudgedCase[]> {
    if (inputs.length > 10) throw new LearnError('invalid', 'At most 10 custom inputs per run')
    inputs.forEach((args, index) => {
      if (!Array.isArray(args) || args.length !== definition.params.length || definition.params.some((param,
        position) => !matchesValueType(param.type, args[position]))) {
        throw new LearnError('invalid',
          `Custom input ${String(index + 1)} does not match ${definition.params.map(item => `${item.name}: ${item.type}`).join(', ')}`)
      }
    })
    const cases = inputs.map((args, index) => ({ id: `custom-${String(index + 1)}`, args }))
    const reference = await this.runtime.runner.execute({
      language: 'python', code: definition.reference, entry: definition.entry.python, ...executionSignature(definition), cases,
      perCaseMs: definition.perCaseMs,
    }, signal)
    const values = new Map('cases' in reference ? reference.cases.map(item => [item.id, item]) : [])
    return cases.map((item) => {
      const reported = values.get(item.id)
      return { ...item, visibility: 'custom' as const, ...reported?.ok === true ? { expected: reported.value } : {} }
    })
  }

  /**
   * Run learner code and the reference on one input for diagnosis; nothing is recorded.
   * @param definition - problem.
   * @param language - learner language.
   * @param code - learner code.
   * @param args - argument list.
   * @param signal - cancellation.
   * @returns both outputs or the learner's error.
   */
  async runOnInput(definition: ProblemDefinition, language: CodeLanguage, code: string, args: readonly JsonValue[],
    signal: AbortSignal): Promise<Readonly<Record<string, unknown>>> {
    this.assertCode(code)
    const [judged] = await this.customCases(definition, [args], signal)
    if (judged === undefined) throw new LearnError('invalid', 'No input')
    const outcome = await this.execute(definition, language, code, [judged], signal)
    const reported = 'cases' in outcome ? outcome.cases[0] : undefined
    return {
      input: args,
      referenceOutput: judged.expected ?? null,
      ...judged.expected === undefined ? { referenceNote: 'The reference could not solve this input; it may violate the constraints.' } : {},
      learnerOutcome: outcome.status,
      ...reported?.ok === true
        ? {
          learnerOutput: reported.value,
          matchesReference: judged.expected !== undefined && outputsMatch(definition.comparator, reported.value, judged.expected, args),
        }
        : {},
      ...reported !== undefined && !reported.ok ? { learnerError: reported.error } : {},
      ...'message' in outcome ? { message: outcome.message } : {},
    }
  }

  private newAttempt(learner: LearnerId, definition: ProblemDefinition, request: { language: CodeLanguage; code: string },
    kind: AttemptView['kind'], context: AttemptView['context'], reviewItem: ReviewItemId | undefined): AttemptView {
    const { support, hints } = this.support(learner, definition.id)
    const attempt: AttemptView = {
      id: brandString<AttemptId>(`att-${randomUUID()}`),
      problemId: definition.id,
      problemVersion: definition.version,
      suiteVersion: definition.suiteVersion,
      language: request.language,
      kind,
      context,
      code: request.code,
      support,
      hintsUsed: hints,
      status: 'judging',
      createdAt: this.runtime.iso(),
    }
    this.runtime.store.insertAttempt(learner, attempt, reviewItem)
    return attempt
  }

  /**
   * Run examples and custom inputs.
   * @param learner - learner.
   * @param request - code and inputs.
   * @param signal - cancellation.
   * @returns the settled run attempt.
   */
  async run(learner: LearnerId, request: RunRequest, signal: AbortSignal): Promise<AttemptView> {
    this.assertCode(request.code)
    const definition = this.definition(learner, request.problemId)
    const suite = this.frozenSuite(definition)
    const examples: JudgedCase[] = suite.cases.filter(item => item.visibility === 'example').map(item => ({ id: item.id, args: item.args,
      expected: item.expected, visibility: 'example' as const }))
    const custom = request.customInputs === undefined || request.customInputs.length === 0 ? [] : await this.customCases(definition,
      request.customInputs, signal)
    const cases = [...examples, ...custom]
    const attempt = this.newAttempt(learner, definition, request, 'run', 'practice', undefined)
    const outcome = await this.execute(definition, request.language, request.code, cases, signal)
    const verdict = assembleVerdict({
      outcome, cases, comparator: definition.comparator, suite: custom.length > 0 ? 'custom' : 'examples',
      suiteVersion: definition.suiteVersion, language: request.language, includeCaseResults: true, now: this.runtime.iso(),
    })
    this.runtime.store.recordVerdict(attempt.id, verdict, undefined)
    return this.runtime.store.attempt(learner, attempt.id) ?? attempt
  }

  /**
   * Execute the frozen full suite for an attempt and record its verdict once.
   * @returns the recorded verdict.
   */
  private async judgeFull(attempt: AttemptView, definition: ProblemDefinition, mode: NonNullable<AttemptView['judgeMode']>,
    signal: AbortSignal): Promise<ExecutionVerdict> {
    const existing = this.runtime.store.verdictOf(attempt.id)
    if (existing !== undefined) return existing
    const suite = definition.suites.get(attempt.suiteVersion)
    if (suite === undefined) throw new LearnError('unavailable', `Suite v${String(attempt.suiteVersion)} of ${definition.id} is missing`)
    const cases: JudgedCase[] = suite.cases.map(item => ({ id: item.id, args: item.args, expected: item.expected,
      visibility: item.visibility, label: item.label }))
    const outcome = await this.execute(definition, attempt.language, attempt.code, cases, signal)
    const verdict = assembleVerdict({
      outcome, cases, comparator: definition.comparator, suite: 'full', suiteVersion: attempt.suiteVersion,
      language: attempt.language, includeCaseResults: false, now: this.runtime.iso(),
    })
    this.runtime.store.recordVerdict(attempt.id, verdict, mode)
    return this.runtime.store.verdictOf(attempt.id) ?? verdict
  }

  /**
   * Freeze, execute, and assess one submission.
   * @param learner - learner.
   * @param request - code and context.
   * @param signal - cancellation of the whole judging operation.
   * @returns the settled attempt with verdict and assessment.
   */
  async submit(learner: LearnerId, request: SubmitRequest, signal: AbortSignal): Promise<AttemptView> {
    this.assertCode(request.code)
    const definition = this.definition(learner, request.problemId)
    this.frozenSuite(definition)
    const attempt = this.newAttempt(learner, definition, request, 'submit', request.context, request.reviewItemId)
    const locale = this.runtime.settings(learner).locale
    let assessment: TutorAssessment | undefined
    if (this.runtime.config.agents.judge && this.runtime.tutorAvailable()) {
      assessment = await this.judgeWithAgent(learner, attempt, definition, locale, signal)
    }
    let verdict = this.runtime.store.verdictOf(attempt.id)
    if (verdict === undefined) {
      verdict = await this.judgeFull(attempt, definition, 'deterministic-fallback', signal)
    }
    if (assessment === undefined || assessment.source === 'unavailable') {
      const judgeEnabled = this.runtime.config.agents.judge
      assessment = assessment ?? {
        source: 'unavailable',
        summary: !judgeEnabled
          ? locale === 'zh' ? 'AI 评测已在 Learn 配置中关闭，以下只有确定性测试结果。' : 'AI judging is turned off in the Learn configuration; only the deterministic test result is shown.'
          : locale === 'zh' ? '导师模型当前不可用，以下只有确定性测试结果。' : 'The tutor model is unavailable; only the deterministic test result is shown.',
        misconceptions: [],
        mistakeTags: [],
        failure: !judgeEnabled ? 'agents.judge is false' : this.runtime.tutorStatus().lastFailure ?? 'No default model is configured.',
      }
    }
    this.runtime.store.saveAssessment(attempt.id, assessment, this.runtime.iso())
    if (assessment.mistakeTags.length > 0) {
      this.runtime.store.insertMistakeTags(learner, attempt.id, definition.id, this.runtime.problems.topicOf(definition),
        assessment.mistakeTags, this.runtime.iso())
    }
    const settled = this.runtime.store.attempt(learner, attempt.id)
    if (settled === undefined) throw new LearnError('not-found', 'Attempt disappeared')
    await this.runtime.afterSubmit(learner, settled, definition)
    return settled
  }

  /**
   * Re-judge attempts an interrupted Host left in `judging`, deterministically.
   * @param signal - service lifetime.
   */
  async recoverInterrupted(signal: AbortSignal): Promise<void> {
    for (const { learner, id } of this.runtime.store.judgingAttempts()) {
      const attempt = this.runtime.store.attempt(learner, id)
      const definition = attempt === undefined ? undefined : this.runtime.problems.get(learner, attempt.problemId)
      if (attempt === undefined || definition === undefined) continue
      try {
        if (attempt.kind === 'submit') {
          await this.judgeFull(attempt, definition, 'deterministic-fallback', signal)
          this.runtime.store.saveAssessment(id, { source: 'unavailable',
            summary: 'The Host restarted during judging; the verdict was recomputed deterministically.', misconceptions: [], mistakeTags: [], failure: 'host-restart' }, this.runtime.iso())
        } else {
          this.runtime.store.recordVerdict(id, assembleVerdict({
            outcome: { status: 'cancelled', cases: [],
              runner: this.runtime.runner.id }, cases: [], comparator: definition.comparator, suite: 'examples',
            suiteVersion: attempt.suiteVersion, language: attempt.language, includeCaseResults: false, now: this.runtime.iso(),
          }), undefined)
        }
      } catch (error) {
        this.runtime.host.logger.warn(`learn: recovering attempt ${id} failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  private async judgeWithAgent(learner: LearnerId, attempt: AttemptView, definition: ProblemDefinition, locale: LearnLocale,
    signal: AbortSignal): Promise<TutorAssessment | undefined> {
    let recorded: TutorAssessment | undefined
    let diagnosticRuns = 0
    let proposals = 0
    const maxRuns = this.runtime.config.agents.maxDiagnosticRuns
    const tools: ToolDefinition[] = [
      defineTool({
        name: 'run_tests',
        description: 'Run the learner\'s submission against the frozen local test suite in an isolated runner and record the official execution verdict. Repeated calls return the recorded verdict.',
        parameters: {},
        output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
        execute: async (_args, exec) => {
          const verdict = await this.judgeFull(attempt, definition, 'agent', exec.signal)
          return toJson({
            verdict: verdict.kind, passed: verdict.passed, total: verdict.total, suiteVersion: verdict.suiteVersion,
            ...verdict.message === undefined ? {} : { message: verdict.message },
            ...verdict.failing === undefined ? {} : { failingCase: verdict.failing },
            ...verdict.measuredMs === undefined ? {} : { measuredMsInRunner: verdict.measuredMs },
            note: 'Local tests only; this is not LeetCode acceptance.',
          })
        },
      }),
      defineTool({
        name: 'run_custom_case',
        description: 'Run the learner\'s code and the reference solution on one input you choose, returning both outputs. Use it to localize a bug after run_tests.',
        parameters: { args: { type: 'array', items: { type: 'json' }, required: true,
          description: `Argument list matching (${definition.params.map(item => `${item.name}: ${item.type}`).join(', ')}).` } },
        output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
        execute: async (args, exec) => {
          if (this.runtime.store.verdictOf(attempt.id) === undefined) throw new Error('Call run_tests first.')
          if (diagnosticRuns >= maxRuns) throw new Error(`The diagnostic run budget (${String(maxRuns)}) is used up; record your assessment.`)
          diagnosticRuns++
          return toJson(await this.runOnInput(definition, attempt.language, attempt.code, args.args, exec.signal))
        },
      }),
      defineTool({
        name: 'propose_test',
        description: 'Propose one additional test input the suite seems to miss. It is validated against the reference and queued for a future suite version; it never changes the current verdict.',
        parameters: {
          args: { type: 'array', items: { type: 'json' }, required: true, description: 'Argument list for the new case.' },
          rationale: { type: 'string', required: true, description: 'Which mistake this case catches.' },
        },
        output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
        execute: async (args, exec) => {
          if (proposals >= 3) throw new Error('At most three proposals per assessment.')
          proposals++
          return toJson(await this.runtime.proposeTest(definition, attempt.id, args.args, args.rationale, exec.signal))
        },
      }),
      defineTool({
        name: 'record_assessment',
        description: 'Record your final assessment for the learner. Call exactly once, after run_tests.',
        parameters: {
          summary: { type: 'string', required: true, description: 'Two or three sentences on the outcome and the main lesson.' },
          reasoning: { type: 'string', required: true,
            description: 'Why the approach works or fails, in terms of the invariant or algorithm.' },
          time_complexity: { type: 'string', required: true, description: 'Estimated time complexity from reading the code.' },
          space_complexity: { type: 'string', required: true, description: 'Estimated extra space complexity.' },
          code_quality: { type: 'string', required: true, description: 'Readability and structure observations.' },
          misconceptions: { type: 'array', items: { type: 'string' }, required: true,
            description: 'Concept-level misunderstandings visible in the code; empty when none.' },
          mistake_tags: { type: 'array', items: { type: 'string', enum: MISTAKE_TAGS }, required: true,
            description: 'Mistake categories; empty when none.' },
          next_step: { type: 'string', required: true, description: 'One concrete next learning step.' },
          reflection_question: { type: 'string', required: true,
            description: 'One question asking the learner to explain their approach.' },
        },
        output: { schema: { type: 'json' }, render: () => [{ type: 'text', text: 'Assessment recorded.' }] },
        execute: async (args, exec) => {
          if (this.runtime.store.verdictOf(attempt.id) === undefined) throw new Error('Call run_tests before recording an assessment.')
          if (recorded !== undefined) throw new Error('The assessment is already recorded.')
          recorded = {
            source: 'agent',
            summary: args.summary.slice(0, 2000),
            reasoning: args.reasoning.slice(0, 4000),
            likelyComplexity: { time: args.time_complexity.slice(0, 80), space: args.space_complexity.slice(0, 80), basis: 'estimated' },
            codeQuality: args.code_quality.slice(0, 2000),
            misconceptions: args.misconceptions.slice(0, 6).map(item => item.slice(0, 400)),
            mistakeTags: [...new Set(args.mistake_tags)].slice(0, 6),
            nextStep: args.next_step.slice(0, 1000),
            reflectionQuestion: args.reflection_question.slice(0, 500),
          }
          exec.concludeTurn()
          return Promise.resolve(toJson({ recorded: true }))
        },
      }),
    ]
    const support = this.support(learner, definition.id)
    const prompt = [
      `Language of the submission: ${attempt.language}. Learner locale: ${locale}. Support before this submission: ${support.support} (${String(support.hints)} hints).`,
      `Recent mistake tags on this topic: ${this.runtime.recentMistakeTags(learner, this.runtime.problems.topicOf(definition)).join(', ') || 'none'}.`,
      problemBlock(definition, locale),
      '<learner_code>',
      attempt.code,
      '</learner_code>',
      'Assess this submission following the procedure.',
    ].join('\n')
    const result = await runLearnAgent(this.runtime.host, {
      purpose: 'judge', system: judgeSystemPrompt(locale, maxRuns), tools, prompt, signal,
    })
    this.runtime.noteAgentResult(result)
    if (recorded !== undefined) return { ...recorded, ...result.sessionId === undefined ? {} : { sessionId: result.sessionId } }
    return {
      source: 'unavailable',
      summary: locale === 'zh' ? '导师评估未能完成，以下只有确定性测试结果。' : 'The tutor assessment did not complete; only the deterministic test result is shown.',
      misconceptions: [],
      mistakeTags: [],
      failure: result.error ?? `The judge agent ended as ${result.status} without recording an assessment.`,
      ...result.sessionId === undefined ? {} : { sessionId: result.sessionId },
    }
  }
}
