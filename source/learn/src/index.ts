/**
 * Learn: a structured algorithm-learning mode. The service owns the learner
 * database, curriculum, isolated runner, judge/tutor/variant agents, review
 * scheduling, and reminder email; `api-learn` exposes it to the Web Client.
 */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import { readFile } from 'node:fs/promises'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DatabaseSync } from 'node:sqlite'
import { Context, Service } from '@deepseek-ai/cordis'
import { brandString } from '@deepseek-ai/dsh-brand'
import type {} from '@deepseek-ai/dsh-subprocess'
import type {} from '@deepseek-ai/dsh-credentials'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {
  AttemptId, AttemptView, CodeLanguage, EmailJobId, EmailJobView, EmailPreview, EmailSettingsView, HintLevel, HintView, LearnerId,
  LearnerSettings, LearnExport, LearnOverview, LessonCheckId, LessonCheckView, TopicView, LessonProgress, LessonStage, ProblemId, ProblemSummary, ProgressView, RecallRating,
  ReviewCompletion, ReviewItemId, ReviewQueue, RunnerStatus, TodayView, TopicId, TutorStatus, TutorStreamFrame, TutorThreadId,
  FinderRunId, FinderRunView, FinderStreamFrame,
  VariantRecord, WorkspaceState,
} from './types.ts'
import { ConfigSchema, type Config } from './config.ts'
import { loadCurriculum, problemView, readGeneratorLibrary, type ProblemDefinition } from './content/catalog.ts'
import { FINDER_SKILL, ProblemFinder } from './finder/index.ts'
import { LessonChecks } from './checks.ts'
import { executionSignature } from './content/signature.ts'
import { openLearnDatabase } from './store/schema.ts'
import { LearnStore } from './store/store.ts'
import { ProblemRegistry } from './problems.ts'
import { DockerRunner } from './runner/docker.ts'
import type { RunnerBackend } from './runner/types.ts'
import { isValidTimeZone, localDate } from './review/dates.ts'
import { isValidLadder } from './review/policy.ts'
import { Judging, LearnError, gradeOf, type RunRequest, type SubmitRequest } from './judging.ts'
import { Tutoring } from './tutoring.ts'
import { Reviews } from './reviews.ts'
import { Variants, type GenerationResult } from './variants.ts'
import { Progress } from './progress.ts'
import { Reminders, type TransportChoice } from './email/reminders.ts'
import { CaptureTransport, SmtpTransport } from './email/transport.ts'
import type { LearnAgentResult } from './agents/runtime.ts'
import type { LearnRuntime, ProposedTestOutcome } from './runtime.ts'

export type * from './types.ts'
export { LearnError } from './judging.ts'
export type { Config } from './config.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Experimental algorithm learning mode. */
    learn: LearnService
  }
}

/** The single owner learner of one DSH home. */
export const OWNER_LEARNER = brandString<LearnerId>('owner')

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))

/** Host service behind `ctx.learn`. */
export default class LearnService extends Service implements LearnRuntime {
  static inject = ['subprocess']
  static Config = ConfigSchema

  private readonly runnerCwd: string
  generatorLibrary: string = ''
  finderSkill: string = ''
  /** Host context exposed to Learn feature modules. */
  readonly host: Context
  private database: DatabaseSync | undefined
  private storeValue: LearnStore | undefined
  private problemsValue: ProblemRegistry | undefined
  private runnerValue: RunnerBackend | undefined
  private readonly judging: Judging
  private readonly tutoring: Tutoring
  private readonly reviews: Reviews
  private readonly variants: Variants
  private readonly finder: ProblemFinder
  private readonly checks: LessonChecks
  private readonly progress: Progress
  private readonly reminders: Reminders
  private lastAgentFailure: string | undefined
  private runnerStatusCache: RunnerStatus | undefined
  private readonly lifetime = new AbortController()
  private readonly background = new Set<Promise<unknown>>()

  constructor(ctx: Context, readonly config: Config) {
    super(ctx, 'learn')
    this.host = ctx
    if (!isValidLadder(config.reviewLadderDays)) throw new Error('learn: reviewLadderDays must be strictly ascending positive day counts')
    if (config.defaultTimezone !== '' && !isValidTimeZone(config.defaultTimezone)) throw new Error(`learn: unknown time zone ${config.defaultTimezone}`)
    if (config.email.transport === 'smtp' && config.email.smtp.host === '') throw new Error('learn: email.transport smtp requires email.smtp.host')
    this.runnerCwd = join(config.dataRoot, 'runner')
    this.judging = new Judging(this)
    this.tutoring = new Tutoring(this)
    this.variants = new Variants(this)
    this.finder = new ProblemFinder(this)
    this.checks = new LessonChecks(this)
    this.reviews = new Reviews(this, (learner, parent) => { this.requestVariant(learner, parent) })
    this.progress = new Progress(this)
    this.reminders = new Reminders(this, this.reviews, () => this.transportChoice(), () => this.baseUrl())
    ctx.effect(() => async () => {
      this.lifetime.abort(new Error('Learn service disposed'))
      await this.tutoring.dispose()
      await this.variants.dispose()
      await this.finder.dispose()
      await Promise.allSettled([...this.background])
      this.database?.close()
    }, 'learn: lifetime')
  }

  protected async [Service.init](): Promise<void> {
    await mkdir(this.runnerCwd, { recursive: true, mode: 0o700 })
    const curriculum = await loadCurriculum(join(PACKAGE_ROOT, 'content'))
    this.database = await openLearnDatabase(join(this.config.dataRoot, 'learn.db'))
    this.storeValue = new LearnStore(this.database)
    this.problemsValue = new ProblemRegistry(curriculum, this.storeValue, () => this.config.generatedPerCaseMs)
    this.generatorLibrary = await readGeneratorLibrary(join(PACKAGE_ROOT, 'content'))
    this.finderSkill = (await readFile(join(PACKAGE_ROOT, 'skills', FINDER_SKILL, 'SKILL.md'), 'utf8')).replace(/^---\n[\s\S]*?\n---\n/, '').trim()
    const drivers = {
      python: await readFile(join(PACKAGE_ROOT, 'runtime', 'python_driver.py'), 'utf8'),
      typescript: await readFile(join(PACKAGE_ROOT, 'runtime', 'typescript_driver.mjs'), 'utf8'),
    }
    this.runnerValue = new DockerRunner(this.ctx, { ...this.config.runner, cwd: this.runnerCwd }, drivers)
    this.storeValue.ensureLearner(OWNER_LEARNER, this.defaultSettings(), this.iso())
    this.storeValue.interruptStreamingMessages()
    this.finder.recoverInterrupted()
    this.track(this.judging.recoverInterrupted(this.lifetime.signal))
    this.ctx.effect(() => {
      const timer = setInterval(() => { this.track(this.reminders.tick()) }, this.config.email.workerIntervalMs)
      this.track(this.reminders.tick())
      return () => { clearInterval(timer) }
    }, 'learn: reminder worker')
    this.ctx.inject(['webServer'], (child) => {
      const page = (title: string,
        body: string): string => `<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font-family:sans-serif;max-width:480px;margin:48px auto"><h2>${title}</h2><p>${body}</p></body>`
      const tokenOf = (url: string | undefined): string => new URL(url ?? '/', 'http://local').searchParams.get('token') ?? ''
      child.effect(() => child.webServer.register({
        kind: 'exact', path: '/learn/email/unsubscribe',
        handler: (req, res) => {
          const ok = this.reminders.unsubscribe(tokenOf(req.url))
          res.writeHead(ok ? 200 : 404, { 'content-type': 'text/html; charset=utf-8' })
          res.end(ok ? page('Unsubscribed · 已退订',
            'DSH Learn review reminders are turned off. 你已关闭 DSH Learn 复习提醒。') : page('Link not valid · 链接无效', 'This unsubscribe link is not valid. 此退订链接无效。'))
        },
      }), 'learn: unsubscribe route')
      child.effect(() => child.webServer.register({
        kind: 'exact', path: '/learn/email/verify',
        handler: (req, res) => {
          const ok = req.method === 'GET' && this.reminders.verifyToken(tokenOf(req.url))
          res.writeHead(ok ? 200 : 404, { 'content-type': 'text/html; charset=utf-8' })
          res.end(ok ? page('Address verified · 邮箱已验证',
            'You can now turn on reminders in Learn settings. 现在可以在 Learn 设置中开启提醒。') : page('Link not valid · 链接无效', 'The link expired or was replaced. 链接已过期或已被替换。'))
        },
      }), 'learn: verify route')
    })
  }

  // ---- LearnRuntime ----

  get store(): LearnStore {
    if (this.storeValue === undefined) throw new LearnError('unavailable', 'Learn is still starting')
    return this.storeValue
  }

  get problems(): ProblemRegistry {
    if (this.problemsValue === undefined) throw new LearnError('unavailable', 'Learn is still starting')
    return this.problemsValue
  }

  get runner(): RunnerBackend {
    if (this.runnerValue === undefined) throw new LearnError('unavailable', 'Learn is still starting')
    return this.runnerValue
  }

  /**
   * Current time; tests replace it to move the clock.
   * @returns the current instant.
   */
  now(): Date {
    return new Date()
  }

  /**
   * Current time as an ISO 8601 string.
   * @returns the timestamp.
   */
  iso(): string {
    return this.now().toISOString()
  }

  private defaultSettings(): LearnerSettings {
    const zone = this.config.defaultTimezone !== '' ? this.config.defaultTimezone : Intl.DateTimeFormat().resolvedOptions().timeZone
    return {
      locale: this.config.defaultLocale,
      timezone: isValidTimeZone(zone) ? zone : 'UTC',
      experience: 'new',
      preferredLanguage: 'python',
      dailyGoalMinutes: 30,
      reviewDailyLimit: this.config.reviewDailyLimit,
      reviewLadderDays: this.config.reviewLadderDays,
    }
  }

  /**
   * Stored settings with configured defaults.
   * @param learner - learner.
   * @returns settings.
   */
  settings(learner: LearnerId): LearnerSettings {
    return this.store.settings(learner, this.defaultSettings())
  }

  /**
   * Local date in the learner's timezone.
   * @param learner - learner.
   * @returns `YYYY-MM-DD`.
   */
  today(learner: LearnerId): string {
    return localDate(this.now(), this.settings(learner).timezone)
  }

  /**
   * Whether a default model and agent runtime are composed.
   * @returns availability.
   */
  tutorAvailable(): boolean {
    const status = this.tutorStatus()
    return status.configured
  }

  /**
   * Tutor model selection and the last agent failure.
   * @returns status for the UI.
   */
  tutorStatus(): TutorStatus {
    const defaults = this.ctx.get('agentDefaultModel')
    const agents = this.ctx.get('agents')
    if (defaults === undefined || agents === undefined) return { configured: false, lastFailure: 'No agent runtime is composed.' }
    try {
      const selection = defaults.currentSelection()
      if (selection.provider === '' || selection.model === '') return { configured: false, lastFailure: 'No default model is configured.' }
      return { configured: true, provider: selection.provider, model: selection.model,
        ...this.lastAgentFailure === undefined ? {} : { lastFailure: this.lastAgentFailure } }
    } catch (error) {
      return { configured: false, lastFailure: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Record the outcome of a Learn agent run for {@link tutorStatus}.
   * @param result - run outcome.
   */
  noteAgentResult(result: LearnAgentResult): void {
    if (result.status === 'completed') this.lastAgentFailure = undefined
    else if (result.status !== 'cancelled') this.lastAgentFailure = result.error ?? `Agent run ${result.status}`
  }

  /**
   * Most recent distinct mistake tags in a topic.
   * @param learner - learner.
   * @param topic - topic.
   * @returns up to five tags, newest first.
   */
  recentMistakeTags(learner: LearnerId, topic: TopicId): string[] {
    return this.store.mistakeTags(learner).filter(item => item.topicId === topic).reverse().map(item => item.tag).filter((tag, index,
      all) => all.indexOf(tag) === index).slice(0, 5)
  }

  /**
   * Validate a judge-proposed input against the reference and queue it for a future suite version.
   * @param definition - problem.
   * @param attempt - attempt that prompted it.
   * @param args - input arguments.
   * @param rationale - why the input is relevant.
   * @param signal - cancellation.
   * @returns validation status and the expected value when validated; the current verdict never changes.
   */
  async proposeTest(definition: ProblemDefinition, attempt: AttemptId | undefined, args: readonly JsonValue[], rationale: string,
    signal: AbortSignal): Promise<ProposedTestOutcome> {
    const valid = Array.isArray(args) && args.length === definition.params.length
    const now = this.iso()
    if (!valid) {
      this.store.insertProposedTest(definition.id, attempt, args, undefined, 'rejected', `wrong argument count; ${rationale}`.slice(0,
        500), now)
      return { status: 'rejected', reason: 'The input does not match the signature.' }
    }
    const outcome = await this.runner.execute({
      language: 'python', code: definition.reference, entry: definition.entry.python, ...executionSignature(definition),
      cases: [{ id: 'proposal', args }], perCaseMs: definition.perCaseMs,
    }, signal)
    const reported = 'cases' in outcome ? outcome.cases[0] : undefined
    if (outcome.status !== 'completed' || reported?.ok !== true) {
      this.store.insertProposedTest(definition.id, attempt, args, undefined, 'rejected',
        `reference could not solve it; ${rationale}`.slice(0, 500), now)
      return { status: 'rejected', reason: 'The reference could not solve this input; it may violate the constraints.' }
    }
    this.store.insertProposedTest(definition.id, attempt, args, reported.value, 'validated', rationale.slice(0, 500), now)
    return { status: 'validated', expected: reported.value, reason: 'Queued for a future suite version; the current verdict is unchanged.' }
  }

  /**
   * Run learner code on one input for the judge agent.
   * @param _learner - learner.
   * @param definition - problem.
   * @param language - language.
   * @param code - learner code.
   * @param args - input arguments.
   * @param signal - cancellation.
   * @returns the output or failure, without the expected value.
   */
  async runOnInput(_learner: LearnerId, definition: ProblemDefinition, language: CodeLanguage, code: string, args: readonly JsonValue[],
    signal: AbortSignal): Promise<Readonly<Record<string, unknown>>> {
    return await this.judging.runOnInput(definition, language, code, args, signal)
  }

  /**
   * Update review and lesson state after a Submit attempt is recorded.
   * @param learner - learner.
   * @param attempt - recorded attempt.
   * @param definition - problem.
   * @returns after the state is saved.
   */
  async afterSubmit(learner: LearnerId, attempt: AttemptView, definition: ProblemDefinition): Promise<void> {
    if (attempt.context !== 'review') this.reviews.ensureItem(learner, definition, attempt)
    if (attempt.context === 'lesson' && gradeOf(attempt.verdict) === 'passed') {
      const topic = this.problems.curriculum.topics.find(item => item.lesson.practiceProblem === definition.id)
      const progress = topic === undefined ? undefined : this.store.lessons(learner).find(item => item.topicId === topic.id)
      if (topic !== undefined && progress?.stage === 'problem') this.store.saveLesson(learner, { ...progress, stage: 'reflection' },
        this.iso())
    }
    await Promise.resolve()
  }

  private readonly known = new Set<LearnerId>()

  /** Create the learner row on first use so learner-scoped writes satisfy their foreign keys. */
  private ensure(learner: LearnerId): void {
    if (this.known.has(learner)) return
    this.store.ensureLearner(learner, this.defaultSettings(), this.iso())
    this.known.add(learner)
  }

  private track(task: Promise<unknown>): void {
    const tracked = task.catch((error: unknown) => {
      this.ctx.logger.warn(`learn: background task failed: ${error instanceof Error ? error.message : String(error)}`)
    }).finally(() => { this.background.delete(tracked) })
    this.background.add(tracked)
  }

  private requestVariant(learner: LearnerId, parent: ProblemId): void {
    if (!this.config.agents.variantGeneration || !this.tutorAvailable() || this.lifetime.signal.aborted) return
    this.track(this.variants.generate(learner, parent, this.lifetime.signal))
  }

  private transportChoice(): TransportChoice {
    const email = this.config.email
    if (email.transport === 'smtp' && email.liveSendingAuthorized) {
      return {
        liveSending: true,
        transport: new SmtpTransport({
          host: email.smtp.host, port: email.smtp.port, secure: email.smtp.secure, user: email.smtp.user,
          password: async () => {
            const credentials = this.ctx.get('credentials')
            if (credentials === undefined) return undefined
            const { credentialRef } = await import('@deepseek-ai/dsh-credentials')
            return (await credentials.resolve(credentialRef(email.smtp.passwordRef)))?.value
          },
        }),
      }
    }
    return { liveSending: false, transport: new CaptureTransport(join(this.config.dataRoot, 'outbox')) }
  }

  private baseUrl(): string | undefined {
    if (this.config.email.publicBaseUrl !== '') return this.config.email.publicBaseUrl.replace(/\/+$/, '')
    const server = this.ctx.get('webServer')
    if (server === undefined) return undefined
    let port: number | undefined
    try {
      port = server.port
    } catch {
      // The listener has not bound a port yet; links fall back to codes only.
      return undefined
    }
    if (typeof port !== 'number' || port === 0) return undefined
    const bound = String(server.host)
    const host = bound === '0.0.0.0' || bound === '::' || bound === '' ? '127.0.0.1' : bound.includes(':') ? `[${bound}]` : bound
    return `http://${host}:${String(port)}`
  }

  // ---- public API ----

  /**
   * Bootstrap snapshot of the Learn page.
   * @param learner - learner.
   * @returns curriculum, settings, progress, catalog, runner, and tutor status.
   */
  async overview(learner: LearnerId): Promise<LearnOverview> {
    this.ensure(learner)
    const statuses = this.progress.statuses(learner)
    const problems: ProblemSummary[] = this.problems.all(learner).filter(item => item.variant === undefined).map(item => ({
      id: item.id, kind: item.kind, title: item.title, difficulty: item.difficulty, topics: item.topics,
      ...item.leetcode === undefined ? {} : { leetcode: { frontendId: item.leetcode.frontendId, url: item.leetcode.url,
        tags: item.leetcode.tags } },
      status: statuses.get(item.id) ?? 'new',
    }))
    const runner = await this.runnerStatus(false)
    return {
      learnerId: learner,
      settings: this.settings(learner),
      topics: this.problems.curriculum.topics,
      collections: this.problems.curriculum.collections,
      lessons: this.store.lessons(learner),
      mastery: this.progress.mastery(learner),
      problems,
      runner,
      tutor: this.tutorStatus(),
      languages: [
        { language: 'python', label: 'Python 3.13', supported: true },
        { language: 'typescript', label: 'TypeScript (Node 24, types stripped, no type checking)', supported: true },
      ],
    }
  }

  /**
   * Update learner settings.
   * @param learner - learner.
   * @param patch - changed fields.
   * @returns merged settings.
   */
  updateSettings(learner: LearnerId, patch: Partial<LearnerSettings>): LearnerSettings {
    this.ensure(learner)
    const next: LearnerSettings = { ...this.settings(learner), ...patch }
    if (!isValidTimeZone(next.timezone)) throw new LearnError('invalid', `Unknown time zone ${next.timezone}`)
    if (!Number.isSafeInteger(next.dailyGoalMinutes) || next.dailyGoalMinutes < 5 || next.dailyGoalMinutes > 600) throw new LearnError('invalid', 'Daily goal must be 5-600 minutes')
    if (!Number.isSafeInteger(next.reviewDailyLimit) || next.reviewDailyLimit < 1 || next.reviewDailyLimit > 50) throw new LearnError('invalid', 'Daily review limit must be 1-50')
    if (!isValidLadder(next.reviewLadderDays)) throw new LearnError('invalid',
      'Review intervals must be strictly ascending positive day counts')
    this.store.saveSettings(learner, next, this.iso())
    return next
  }

  /**
   * Today dashboard.
   * @param learner - learner.
   * @returns dashboard projection.
   */
  todayView(learner: LearnerId): TodayView {
    this.ensure(learner)
    return this.progress.today(learner, this.reviews.queue(learner).due.length)
  }

  /**
   * Move a lesson to a stage. The practice problem and later stages need a passed understanding check.
   * @param learner - learner.
   * @param topicId - topic.
   * @param stage - target stage.
   * @returns updated progress.
   */
  lesson(learner: LearnerId, topicId: TopicId, stage: LessonStage): LessonProgress {
    this.ensure(learner)
    const topic = this.problems.curriculum.topics.find(item => item.id === topicId)
    if (topic === undefined) throw new LearnError('not-found', `Unknown topic ${topicId}`)
    const order: LessonStage[] = ['motivation', 'strategy', 'example', 'check', 'problem', 'reflection', 'complete']
    if (!order.includes(stage) || stage === 'complete') throw new LearnError('invalid', 'Complete a lesson through its reflection')
    const existing = this.store.lessons(learner).find(item => item.topicId === topicId)
    if (order.indexOf(stage) > order.indexOf('check') && !this.checkPassed(learner, topic, existing)) {
      throw new LearnError('invalid', 'Pass the understanding check before the practice problem')
    }
    const progress: LessonProgress = {
      topicId, stage, checkAnswers: existing?.checkAnswers ?? {}, skipped: existing?.skipped ?? false,
      ...existing?.reflection === undefined ? {} : { reflection: existing.reflection },
      ...existing?.reflectionFeedback === undefined ? {} : { reflectionFeedback: existing.reflectionFeedback },
      ...existing?.completedAt === undefined ? {} : { completedAt: existing.completedAt },
    }
    this.store.saveLesson(learner, progress, this.iso())
    return progress
  }

  /** A passed check, or (for progress saved before tutor checks) every built-in question answered correctly. */
  private checkPassed(learner: LearnerId, topic: TopicView, existing: LessonProgress | undefined): boolean {
    if (this.checks.passed(learner, topic.id)) return true
    const answers = existing?.checkAnswers ?? {}
    return topic.lesson.check.length > 0 && topic.lesson.check.every(question => answers[question.id] === question.answer)
  }

  /**
   * The newest understanding check of a lesson.
   * @param learner - learner.
   * @param topicId - topic.
   * @returns the check, or undefined before the first one.
   */
  lessonCheck(learner: LearnerId, topicId: TopicId): LessonCheckView | undefined {
    this.ensure(learner)
    return this.checks.current(learner, topicId)
  }

  /**
   * Start an understanding check with fresh questions.
   * @param learner - learner.
   * @param topicId - topic.
   * @param source - `tutor` (written and graded by the tutor) or `authored` (the lesson's built-in questions).
   * @param signal - cancellation.
   * @returns the open check.
   */
  startLessonCheck(learner: LearnerId, topicId: TopicId, source: LessonCheckView['source'], signal: AbortSignal): Promise<LessonCheckView> {
    this.ensure(learner)
    return this.checks.start(learner, topicId, source, AbortSignal.any([signal, this.lifetime.signal]))
  }

  /**
   * Submit answers to an understanding check; the tutor (or the answer key) decides whether the learner passes.
   * @param learner - learner.
   * @param checkId - check.
   * @param answers - answer per question id.
   * @param signal - cancellation.
   * @returns the graded check.
   */
  submitLessonCheck(learner: LearnerId, checkId: LessonCheckId, answers: Readonly<Record<string, string>>, signal: AbortSignal): Promise<LessonCheckView> {
    this.ensure(learner)
    return this.checks.submit(learner, checkId, answers, AbortSignal.any([signal, this.lifetime.signal]))
  }

  /**
   * Skip the rest of a lesson after passing its understanding check.
   * @param learner - learner.
   * @param topicId - topic.
   * @returns the completed progress.
   */
  skipLesson(learner: LearnerId, topicId: TopicId): LessonProgress {
    this.ensure(learner)
    const topic = this.problems.curriculum.topics.find(item => item.id === topicId)
    if (topic === undefined) throw new LearnError('not-found', `Unknown topic ${topicId}`)
    const existing = this.store.lessons(learner).find(item => item.topicId === topicId)
    if (!this.checkPassed(learner, topic, existing)) throw new LearnError('invalid', 'Pass the understanding check before skipping the lesson')
    const progress: LessonProgress = { topicId, stage: 'complete', checkAnswers: existing?.checkAnswers ?? {}, skipped: true,
      ...existing?.reflection === undefined ? {} : { reflection: existing.reflection },
      ...existing?.reflectionFeedback === undefined ? {} : { reflectionFeedback: existing.reflectionFeedback },
      completedAt: existing?.completedAt ?? this.iso() }
    this.store.saveLesson(learner, progress, this.iso())
    return progress
  }

  /**
   * Store a lesson reflection with tutor feedback when available.
   * @param learner - learner.
   * @param topicId - topic.
   * @param text - reflection.
   * @param signal - cancellation.
   * @returns updated progress.
   */
  reflect(learner: LearnerId, topicId: TopicId, text: string, signal: AbortSignal): Promise<LessonProgress> {
    this.ensure(learner)
    return this.tutoring.reflect(learner, topicId, text, signal)
  }

  /**
   * Workspace state for one exercise.
   * @param learner - learner.
   * @param problemId - problem.
   * @returns problem view, drafts, attempts, hints, tutor thread, and status.
   */
  workspace(learner: LearnerId, problemId: ProblemId): WorkspaceState {
    this.ensure(learner)
    const definition = this.problems.get(learner, problemId)
    if (definition === undefined) throw new LearnError('not-found', `Unknown problem ${problemId}`)
    const attempts = this.store.attempts(learner, problemId, 30)
    const reviewed = definition.variant !== undefined && attempts.some(item => item.kind === 'submit' && item.status === 'done')
    const parent = definition.variant === undefined ? undefined : this.problems.get(learner, definition.variant.parentProblemId)
    const threadId = this.tutoring.thread(learner, `problem:${problemId}`)
    const drafts = Object.fromEntries(this.store.drafts(learner, problemId).map(item => [item.language, { code: item.code,
      updatedAt: item.updatedAt }]))
    const item = definition.variant === undefined ? this.store.reviewItemFor(learner, problemId) : undefined
    return {
      problem: problemView(definition, reviewed, parent?.title),
      drafts,
      note: this.store.note(learner, problemId),
      attempts,
      hints: this.store.hints(learner, problemId),
      tutor: { threadId, messages: this.store.messages(threadId) },
      status: this.progress.statuses(learner).get(problemId) ?? 'new',
      ...item === undefined ? {} : { reviewItemId: item.id },
    }
  }

  /**
   * Persist a draft.
   * @param learner - learner.
   * @param problemId - problem.
   * @param language - language.
   * @param code - draft code.
   * @returns save time.
   */
  saveDraft(learner: LearnerId, problemId: ProblemId, language: CodeLanguage, code: string): string {
    this.ensure(learner)
    if (this.problems.get(learner, problemId) === undefined) throw new LearnError('not-found', `Unknown problem ${problemId}`)
    if (code.length > 64 * 1024) throw new LearnError('invalid', 'Code exceeds 64 KiB')
    const now = this.iso()
    this.store.saveDraft(learner, problemId, language, code, now)
    return now
  }

  /**
   * Persist problem notes.
   * @param learner - learner.
   * @param problemId - problem.
   * @param body - note text.
   * @returns save time.
   */
  saveNote(learner: LearnerId, problemId: ProblemId, body: string): string {
    this.ensure(learner)
    if (this.problems.get(learner, problemId) === undefined) throw new LearnError('not-found', `Unknown problem ${problemId}`)
    if (body.length > 20_000) throw new LearnError('invalid', 'Notes exceed 20,000 characters')
    const now = this.iso()
    this.store.saveNote(learner, problemId, body, now)
    return now
  }

  /**
   * Run code against the visible examples and custom inputs in the isolated runner.
   * @param learner - learner.
   * @param request - problem, language, code, and custom inputs.
   * @param signal - cancellation; Learn disposal also aborts.
   * @returns the recorded Run attempt; it never changes review state.
   */
  run(learner: LearnerId, request: RunRequest, signal: AbortSignal): Promise<AttemptView> {
    this.ensure(learner)
    return this.judging.run(learner, request, AbortSignal.any([signal, this.lifetime.signal]))
  }

  /**
   * Judge code against the frozen hidden suite; the execution verdict is authoritative and a judge agent adds only an assessment.
   * @param learner - learner.
   * @param request - problem, language, code, attempt context, and review item.
   * @param signal - cancellation; Learn disposal also aborts.
   * @returns the recorded Submit attempt with verdict, at most one counterexample, and the tutor assessment.
   */
  submit(learner: LearnerId, request: SubmitRequest, signal: AbortSignal): Promise<AttemptView> {
    this.ensure(learner)
    return this.judging.submit(learner, request, AbortSignal.any([signal, this.lifetime.signal]))
  }

  /**
   * Reveal the next hint level; levels unlock in order and the solution level requires `confirmReveal`.
   * @param learner - learner.
   * @param problemId - problem.
   * @param level - requested level.
   * @param confirmReveal - explicit confirmation for the solution level.
   * @param signal - cancellation; Learn disposal also aborts.
   * @returns the recorded hint, generated or authored.
   */
  hint(learner: LearnerId, problemId: ProblemId, level: HintLevel, confirmReveal: boolean, signal: AbortSignal): Promise<HintView> {
    this.ensure(learner)
    return this.tutoring.hint(learner, problemId, level, confirmReveal, AbortSignal.any([signal, this.lifetime.signal]))
  }

  /**
   * Append a learner message to the problem or topic tutor thread and start a reply.
   * @param learner - learner.
   * @param subject - problem or topic the thread belongs to.
   * @param text - message text.
   * @returns thread and message ids; follow the thread for the reply.
   */
  tutorSend(learner: LearnerId, subject: { problemId?: ProblemId; topicId?: TopicId },
    text: string): { threadId: TutorThreadId; messageId: string } {
    this.ensure(learner)
    return this.tutoring.send(learner, subject, text)
  }

  /**
   * Cancel the running tutor reply in a thread.
   * @param learner - learner.
   * @param thread - thread.
   */
  tutorCancel(learner: LearnerId, thread: TutorThreadId): void {
    this.ensure(learner)
    this.tutoring.cancel(learner, thread)
  }

  /**
   * Stream tutor reply frames for a thread.
   * @param learner - learner.
   * @param thread - thread.
   * @param signal - observation lifetime.
   * @returns frames until the signal aborts.
   */
  tutorFollow(learner: LearnerId, thread: TutorThreadId, signal: AbortSignal): AsyncIterable<TutorStreamFrame> {
    this.ensure(learner)
    return this.tutoring.follow(learner, thread, AbortSignal.any([signal, this.lifetime.signal]))
  }

  /**
   * Today's review queue in the learner's timezone, bounded by the daily limit.
   * @param learner - learner.
   * @returns due, upcoming, and assigned items.
   */
  reviewQueue(learner: LearnerId): ReviewQueue {
    this.ensure(learner)
    return this.reviews.queue(learner)
  }

  /**
   * Complete a due review from a judged attempt; repeated calls for the same due date are idempotent.
   * @param learner - learner.
   * @param itemId - review item.
   * @param attemptId - Submit attempt for the assigned exercise.
   * @param recall - self-rated recall, or `undefined`.
   * @returns the next schedule and whether the call was a duplicate.
   */
  completeReview(learner: LearnerId, itemId: ReviewItemId, attemptId: AttemptId, recall: RecallRating | undefined): ReviewCompletion {
    this.ensure(learner)
    return this.reviews.complete(learner, itemId, attemptId, recall)
  }

  /**
   * Snooze or reschedule a review item.
   * @param learner - learner.
   * @param itemId - review item.
   * @param target - relative days or an absolute local date.
   * @param requestKey - client idempotency key.
   * @returns the new due date and whether the key was already applied.
   */
  moveReview(learner: LearnerId, itemId: ReviewItemId, target: { days: number } | { date: string },
    requestKey: string): { dueDate: string; duplicate: boolean } {
    this.ensure(learner)
    return this.reviews.move(learner, itemId, target, requestKey)
  }

  /**
   * Generate a review variant with an agent and validate it before it can be assigned.
   * @param learner - learner.
   * @param parentId - problem the variant reviews.
   * @param signal - cancellation; Learn disposal also aborts.
   * @returns the validated record or the quarantine report.
   */
  generateVariant(learner: LearnerId, parentId: ProblemId, signal: AbortSignal): Promise<GenerationResult> {
    this.ensure(learner)
    return this.variants.generate(learner, parentId, AbortSignal.any([signal, this.lifetime.signal]))
  }

  /**
   * List the learner's generated and imported problems.
   * @param learner - learner.
   * @returns records with validation reports.
   */
  variantRecords(learner: LearnerId): VariantRecord[] {
    this.ensure(learner)
    return this.variants.list(learner)
  }

  /**
   * Validate and store a structured problem spec; failing specs are quarantined.
   * @param learner - learner.
   * @param spec - problem spec JSON.
   * @param signal - cancellation; Learn disposal also aborts.
   * @returns the stored record.
   */
  importProblem(learner: LearnerId, spec: JsonValue, signal: AbortSignal): Promise<VariantRecord> {
    this.ensure(learner)
    return this.variants.importProblem(learner, spec, AbortSignal.any([signal, this.lifetime.signal]))
  }

  /**
   * Start a problem-finder run: an agent searches LeetCode for problems matching the description and adds validated ones.
   * @param learner - learner.
   * @param description - what the learner wants, in their own words.
   * @param count - problems to add.
   * @returns the run as started; follow it for progress.
   */
  findProblems(learner: LearnerId, description: string, count: number): FinderRunView {
    this.ensure(learner)
    return this.finder.start(learner, description, count)
  }

  /**
   * Recent problem-finder runs, newest first.
   * @param learner - learner.
   * @returns up to 20 runs.
   */
  finderRuns(learner: LearnerId): FinderRunView[] {
    this.ensure(learner)
    return this.finder.runs(learner)
  }

  /**
   * Stream one problem-finder run.
   * @param learner - learner.
   * @param run - run id.
   * @param signal - observation lifetime.
   * @returns snapshot, event, and settled frames.
   */
  finderFollow(learner: LearnerId, run: FinderRunId, signal: AbortSignal): AsyncIterable<FinderStreamFrame> {
    this.ensure(learner)
    return this.finder.follow(learner, run, AbortSignal.any([signal, this.lifetime.signal]))
  }

  /**
   * Cancel a running problem-finder run; problems already added stay.
   * @param learner - learner.
   * @param run - run id.
   */
  finderCancel(learner: LearnerId, run: FinderRunId): void {
    this.ensure(learner)
    this.finder.cancel(learner, run)
  }

  /**
   * Promote validated proposed tests into a new suite version of a stored problem.
   * Built-in suites change only through content files.
   * @param learner - learner.
   * @param problemId - stored problem.
   * @returns the new suite version, or the unchanged version when nothing was pending.
   */
  promoteProposedTests(learner: LearnerId, problemId: ProblemId): number {
    this.ensure(learner)
    const definition = this.problems.get(learner, problemId)
    if (definition === undefined) throw new LearnError('not-found', `Unknown problem ${problemId}`)
    if (this.problems.curriculum.problems.has(problemId)) throw new LearnError('invalid',
      'Built-in suites change only through versioned content files')
    const pending = this.store.proposedTests(problemId, 'validated')
    if (pending.length === 0) return definition.suiteVersion
    const current = definition.suites.get(definition.suiteVersion)?.cases ?? []
    const version = definition.suiteVersion + 1
    this.store.atomic(() => {
      this.store.insertSuite(problemId, version, 'promoted', [...current, ...pending.map((item, index) => ({
        id: `p-${String(version)}-${String(index + 1)}`, args: item.args, expected: item.expected, visibility: 'hidden' as const, label: 'proposed',
      }))], this.iso())
      this.store.markProposedPromoted(pending.map(item => item.id))
    })
    return version
  }

  /**
   * Progress page projection.
   * @param learner - learner.
   * @returns mastery, mistakes, review history, and recent attempts.
   */
  progressView(learner: LearnerId): ProgressView {
    this.ensure(learner)
    return {
      stats: this.progress.stats(learner),
      mastery: this.progress.mastery(learner),
      mistakes: this.progress.mistakes(learner),
      history: this.store.reviewEvents(learner, 50),
      attempts: this.store.attempts(learner, undefined, 50),
    }
  }

  /**
   * Runner availability, cached until refreshed.
   * @param refresh - probe again.
   * @returns runner status.
   */
  async runnerStatus(refresh: boolean): Promise<RunnerStatus> {
    if (this.runnerStatusCache !== undefined && !refresh) return this.runnerStatusCache
    const probe = await this.runner.probe(AbortSignal.any([AbortSignal.timeout(30_000), this.lifetime.signal]))
    this.runnerStatusCache = {
      backend: this.runner.id, available: probe.available && probe.languages.some(item => item.available), setup: probe.setup,
      languages: probe.languages, ...probe.reason === undefined ? {} : { reason: probe.reason }, checkedAt: this.iso(),
    }
    return this.runnerStatusCache
  }

  /**
   * Fetch runner images: one language, or every missing one.
   * @param language - language, or undefined for every missing image.
   * @param signal - cancellation.
   * @returns refreshed status.
   */
  async prepareRunner(language: CodeLanguage | undefined, signal: AbortSignal): Promise<RunnerStatus> {
    const combined = AbortSignal.any([signal, this.lifetime.signal])
    const targets = language !== undefined ? [language]
      : (await this.runnerStatus(true)).languages.filter(item => !item.available).map(item => item.language)
    for (const target of targets) await this.runner.prepare(target, combined)
    return await this.runnerStatus(true)
  }

  /**
   * Launch Docker Desktop and wait up to two minutes for its daemon.
   * @param signal - cancellation.
   * @returns refreshed status; `setup` stays `start` when the daemon did not come up in time.
   */
  async startRunner(signal: AbortSignal): Promise<RunnerStatus> {
    const combined = AbortSignal.any([signal, this.lifetime.signal])
    await this.runner.start(combined)
    const deadline = Date.now() + 120_000
    for (;;) {
      const status = await this.runnerStatus(true)
      if (status.setup !== 'start' || Date.now() > deadline) return status
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 3000)
        combined.addEventListener('abort', () => { clearTimeout(timer); reject(combined.reason as Error) }, { once: true })
      })
    }
  }

  /**
   * Email reminder settings.
   * @param learner - learner.
   * @returns address, verification, opt-in, pause, delivery hour, and transport mode.
   */
  emailSettings(learner: LearnerId): EmailSettingsView {
    this.ensure(learner)
    return this.reminders.view(learner)
  }

  /**
   * Set an address and queue a verification message; reminders stay off until it is verified.
   * @param learner - learner.
   * @param address - email address.
   * @returns updated settings.
   */
  setEmailAddress(learner: LearnerId, address: string): EmailSettingsView {
    this.ensure(learner)
    return this.reminders.setAddress(learner, address)
  }

  /**
   * Verify the pending address with the emailed code.
   * @param learner - learner.
   * @param code - verification code.
   * @returns updated settings.
   */
  verifyEmail(learner: LearnerId, code: string): EmailSettingsView {
    this.ensure(learner)
    return this.reminders.verifyCode(learner, code)
  }

  /**
   * Change opt-in, pause, or delivery hour; opt-in requires a verified address.
   * @param learner - learner.
   * @param patch - changed preferences.
   * @returns updated settings.
   */
  emailPreferences(learner: LearnerId, patch: { optIn?: boolean; paused?: boolean; deliveryHour?: number }): EmailSettingsView {
    this.ensure(learner)
    return this.reminders.preferences(learner, patch)
  }

  /**
   * Queue a test message to the verified address.
   * @param learner - learner.
   * @returns the queued job.
   */
  testEmail(learner: LearnerId): EmailJobView {
    this.ensure(learner)
    return this.reminders.test(learner)
  }

  /**
   * Recent email jobs.
   * @param learner - learner.
   * @returns jobs, newest first.
   */
  emailJobs(learner: LearnerId): EmailJobView[] {
    this.ensure(learner)
    return this.reminders.jobs(learner)
  }

  /**
   * Rendered message of a job.
   * @param learner - learner.
   * @param jobId - job.
   * @returns recipient, subject, bodies, transport, and status.
   */
  emailPreview(learner: LearnerId, jobId: EmailJobId): EmailPreview {
    this.ensure(learner)
    return this.reminders.preview(learner, jobId)
  }

  /**
   * Run the reminder planner and worker once.
   * @returns after the tick settles.
   */
  runReminders(): Promise<void> {
    return this.reminders.tick()
  }

  /**
   * Export every learner-owned row.
   * @param learner - learner.
   * @returns export bundle without secret hashes.
   */
  exportData(learner: LearnerId): LearnExport {
    this.ensure(learner)
    return { format: 'dsh-learn-export', version: 1, exportedAt: this.iso(), learnerId: learner, tables: this.store.exportRows(learner) }
  }

  /**
   * Delete every learner-owned row after explicit confirmation.
   * @param learner - learner.
   * @param confirmation - must equal `RESET`.
   */
  resetData(learner: LearnerId, confirmation: string): void {
    this.ensure(learner)
    if (confirmation !== 'RESET') throw new LearnError('invalid', 'Type RESET to confirm')
    this.store.deleteLearner(learner)
    this.known.delete(learner)
    this.ensure(learner)
  }
}
