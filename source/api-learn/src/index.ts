/**
 * Owner-scoped Remote access to `ctx.learn`. Every method acts for the DSH
 * home's owner learner; this package registers no non-owner access policy, so
 * Remote peers other than the owner cannot reach the namespace.
 */
import { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { LearnError, OWNER_LEARNER } from '@deepseek-ai/dsh-experimental-learn'
import type {
  AttemptId, AttemptView, CodeLanguage, JsonValue, EmailJobId, EmailJobView, EmailPreview, EmailSettingsView, HintLevel, HintView,
  LearnerSettings, LearnExport, LearnOverview, LessonProgress, LessonStage, ProblemId, ProgressView, RecallRating, ReviewCompletion,
  ReviewItemId, ReviewQueue,
  RunnerStatus, TodayView, TopicId, TutorStreamFrame, TutorThreadId, VariantRecord, WorkspaceState,
} from '@deepseek-ai/dsh-experimental-learn/types'
import type { ReviewMoveTarget, VariantGenerationView } from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Experimental Learn Remote controller. */
    learnController: LearnController
  }
}

/** Remote limits. */
export interface Config {
  /** Largest accepted import specification, in characters of JSON. */
  maxImportChars: number
}

function remote<T>(operation: () => T): T {
  try {
    return operation()
  } catch (error) {
    throw toRemote(error)
  }
}

async function remoteAsync<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    throw toRemote(error)
  }
}

const CODES = {
  'not-found': 'learn/not-found',
  'invalid': 'learn/invalid',
  'conflict': 'learn/conflict',
  'unavailable': 'learn/unavailable',
} as const

function toRemote(error: unknown): unknown {
  if (error instanceof LearnError) return new RemoteError(CODES[error.code], error.message, { reason: error.message })
  return error
}

/** The `learn` Remote namespace. */
export default class LearnController extends TypertRemoteService {
  static inject = ['learn', 'typert']
  static Config: z<Config> = z.object({
    maxImportChars: z.natural().min(1024).default(200_000),
  })

  constructor(ctx: Context, private readonly config: Config) {
    super(ctx, 'learnController', { namespace: 'learn' })
  }

  /**
   * Bootstrap snapshot of the Learn page.
   * @returns curriculum, settings, progress, catalog, runner, and tutor status.
   */
  @Remote
  overview(): Promise<LearnOverview> { return remoteAsync(() => this.ctx.learn.overview(OWNER_LEARNER)) }

  /**
   * Today dashboard.
   * @returns the dashboard projection.
   */
  @Remote
  today(): TodayView { return remote(() => this.ctx.learn.todayView(OWNER_LEARNER)) }

  /**
   * Update learner settings.
   * @param patch - changed fields.
   * @returns merged settings.
   */
  @Remote
  updateSettings(patch: Partial<LearnerSettings>): LearnerSettings { return remote(() => this.ctx.learn.updateSettings(OWNER_LEARNER,
    patch)) }

  /**
   * Move a lesson to a stage, recording check answers.
   * @param topicId - topic.
   * @param stage - target stage.
   * @param answers - check answers by question id.
   * @returns progress and per-question correctness.
   */
  @Remote
  lesson(topicId: TopicId, stage: LessonStage, answers: Readonly<Record<string,
    number>>): { progress: LessonProgress; correct: Record<string, boolean> } {
    return remote(() => this.ctx.learn.lesson(OWNER_LEARNER, topicId, stage, answers))
  }

  /**
   * Diagnostic skip of a lesson.
   * @param topicId - topic.
   * @param answers - answers to every check.
   * @returns progress when every answer is correct, and per-question correctness.
   */
  @Remote
  skipLesson(topicId: TopicId, answers: Readonly<Record<string, number>>): { progress?: LessonProgress; correct: Record<string, boolean> } {
    return remote(() => this.ctx.learn.skipLesson(OWNER_LEARNER, topicId, answers))
  }

  /**
   * Store a lesson reflection.
   * @param topicId - topic.
   * @param text - reflection.
   * @param signal - cancellation.
   * @returns updated progress.
   */
  @Remote
  reflect(topicId: TopicId, text: string, signal: AbortSignal): Promise<LessonProgress> {
    return remoteAsync(() => this.ctx.learn.reflect(OWNER_LEARNER, topicId, text, signal))
  }

  /**
   * Workspace state of one exercise.
   * @param problemId - problem.
   * @returns problem, drafts, attempts, hints, and tutor thread.
   */
  @Remote
  workspace(problemId: ProblemId): WorkspaceState { return remote(() => this.ctx.learn.workspace(OWNER_LEARNER, problemId)) }

  /**
   * Persist a draft.
   * @param problemId - problem.
   * @param language - language.
   * @param code - code.
   * @returns save time.
   */
  @Remote
  saveDraft(problemId: ProblemId, language: CodeLanguage, code: string): string {
    return remote(() => this.ctx.learn.saveDraft(OWNER_LEARNER, problemId, language, code))
  }

  /**
   * Persist notes.
   * @param problemId - problem.
   * @param body - notes.
   * @returns save time.
   */
  @Remote
  saveNote(problemId: ProblemId, body: string): string { return remote(() => this.ctx.learn.saveNote(OWNER_LEARNER, problemId, body)) }

  /**
   * Run examples and custom inputs.
   * @param problemId - problem.
   * @param language - language.
   * @param code - code.
   * @param customInputs - argument lists.
   * @param signal - cancellation.
   * @returns the settled run.
   */
  @Remote
  run(problemId: ProblemId, language: CodeLanguage, code: string, customInputs: readonly (readonly JsonValue[])[],
    signal: AbortSignal): Promise<AttemptView> {
    return remoteAsync(() => this.ctx.learn.run(OWNER_LEARNER, { problemId, language, code, customInputs }, signal))
  }

  /**
   * Submit against the frozen suite.
   * @param problemId - problem.
   * @param language - language.
   * @param code - code.
   * @param context - practice, lesson, or review.
   * @param reviewItemId - review item for review submissions.
   * @param signal - cancellation.
   * @returns the settled attempt.
   */
  @Remote
  submit(problemId: ProblemId, language: CodeLanguage, code: string, context: AttemptView['context'], reviewItemId: ReviewItemId | null,
    signal: AbortSignal): Promise<AttemptView> {
    return remoteAsync(() => this.ctx.learn.submit(OWNER_LEARNER, { problemId, language, code, context,
      ...reviewItemId === null ? {} : { reviewItemId } }, signal))
  }

  /**
   * Request the next hint.
   * @param problemId - problem.
   * @param level - hint level.
   * @param confirmReveal - confirmation for the solution.
   * @param signal - cancellation.
   * @returns the hint.
   */
  @Remote
  hint(problemId: ProblemId, level: HintLevel, confirmReveal: boolean, signal: AbortSignal): Promise<HintView> {
    return remoteAsync(() => this.ctx.learn.hint(OWNER_LEARNER, problemId, level, confirmReveal, signal))
  }

  /**
   * Send a tutor message; the reply streams through `tutorFollow`.
   * @param problemId - problem subject, or null.
   * @param topicId - topic subject, or null.
   * @param text - message.
   * @returns thread and pending reply ids.
   */
  @Remote
  tutorSend(problemId: ProblemId | null, topicId: TopicId | null, text: string): { threadId: TutorThreadId; messageId: string } {
    return remote(() => this.ctx.learn.tutorSend(OWNER_LEARNER, { ...problemId === null ? {} : { problemId },
      ...topicId === null ? {} : { topicId } }, text))
  }

  /**
   * Cancel the active tutor reply.
   * @param threadId - thread.
   */
  @Remote
  tutorCancel(threadId: TutorThreadId): void { remote(() => { this.ctx.learn.tutorCancel(OWNER_LEARNER, threadId) }) }

  /**
   * Follow a tutor thread.
   * @param threadId - thread.
   * @param signal - observation lifetime.
   * @returns a snapshot, then progress and settled frames.
   */
  @Remote({ mode: 'stream' })
  async *tutorFollow(threadId: TutorThreadId, signal: AbortSignal): AsyncIterable<TutorStreamFrame> {
    try {
      for await (const frame of this.ctx.learn.tutorFollow(OWNER_LEARNER, threadId, signal)) yield frame
    } catch (error) {
      throw toRemote(error)
    }
  }

  /**
   * Today's review queue.
   * @returns queue with assigned variants.
   */
  @Remote
  reviewQueue(): ReviewQueue { return remote(() => this.ctx.learn.reviewQueue(OWNER_LEARNER)) }

  /**
   * Complete a review cycle.
   * @param itemId - review item.
   * @param attemptId - graded review submission.
   * @param recall - self-rated recall, or null.
   * @returns the schedule change and transfer explanation.
   */
  @Remote
  completeReview(itemId: ReviewItemId, attemptId: AttemptId, recall: RecallRating | null): ReviewCompletion {
    return remote(() => this.ctx.learn.completeReview(OWNER_LEARNER, itemId, attemptId, recall ?? undefined))
  }

  /**
   * Snooze or reschedule a review.
   * @param itemId - review item.
   * @param target - days from today or an explicit date.
   * @param requestKey - client idempotency key.
   * @returns the new due date.
   */
  @Remote
  moveReview(itemId: ReviewItemId, target: ReviewMoveTarget, requestKey: string): { dueDate: string; duplicate: boolean } {
    return remote(() => this.ctx.learn.moveReview(OWNER_LEARNER, itemId, target, requestKey))
  }

  /**
   * Generate a validated variant with the variant agent.
   * @param parentId - parent problem.
   * @param signal - cancellation.
   * @returns the generation outcome.
   */
  @Remote
  generateVariant(parentId: ProblemId, signal: AbortSignal): Promise<VariantGenerationView> {
    return remoteAsync(() => this.ctx.learn.generateVariant(OWNER_LEARNER, parentId, signal))
  }

  /**
   * Stored variants and imports with validation results.
   * @returns records, newest first.
   */
  @Remote
  variants(): VariantRecord[] { return remote(() => this.ctx.learn.variantRecords(OWNER_LEARNER)) }

  /**
   * Import a problem specification through the same validation as variants.
   * @param specJson - specification JSON text.
   * @param signal - cancellation.
   * @returns the stored record.
   */
  @Remote
  importProblem(specJson: string, signal: AbortSignal): Promise<VariantRecord> {
    return remoteAsync(async () => {
      if (specJson.length > this.config.maxImportChars) throw new LearnError('invalid',
        `The specification exceeds ${String(this.config.maxImportChars)} characters`)
      let spec: JsonValue
      try {
        spec = JSON.parse(specJson) as JsonValue
      } catch (error) {
        throw new LearnError('invalid', `The specification is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
      }
      return await this.ctx.learn.importProblem(OWNER_LEARNER, spec, signal)
    })
  }

  /**
   * Progress page projection.
   * @returns mastery, mistakes, history, and attempts.
   */
  @Remote
  progress(): ProgressView { return remote(() => this.ctx.learn.progressView(OWNER_LEARNER)) }

  /**
   * Runner availability.
   * @param refresh - probe again.
   * @returns runner status.
   */
  @Remote
  runnerStatus(refresh: boolean): Promise<RunnerStatus> { return remoteAsync(() => this.ctx.learn.runnerStatus(refresh)) }

  /**
   * Fetch a runner image.
   * @param language - language.
   * @param signal - cancellation.
   * @returns refreshed status.
   */
  @Remote
  prepareRunner(language: CodeLanguage, signal: AbortSignal): Promise<RunnerStatus> {
    return remoteAsync(() => this.ctx.learn.prepareRunner(language, signal))
  }

  /**
   * Email settings.
   * @returns settings without secrets.
   */
  @Remote
  emailSettings(): EmailSettingsView { return remote(() => this.ctx.learn.emailSettings(OWNER_LEARNER)) }

  /**
   * Bind an address and send its verification message.
   * @param address - email address.
   * @returns settings.
   */
  @Remote
  setEmailAddress(address: string): EmailSettingsView { return remote(() => this.ctx.learn.setEmailAddress(OWNER_LEARNER, address)) }

  /**
   * Verify the pending address.
   * @param code - emailed code.
   * @returns settings.
   */
  @Remote
  verifyEmail(code: string): EmailSettingsView { return remote(() => this.ctx.learn.verifyEmail(OWNER_LEARNER, code)) }

  /**
   * Change reminder preferences.
   * @param patch - changed fields.
   * @returns settings.
   */
  @Remote
  emailPreferences(patch: { optIn?: boolean; paused?: boolean; deliveryHour?: number }): EmailSettingsView {
    return remote(() => this.ctx.learn.emailPreferences(OWNER_LEARNER, patch))
  }

  /**
   * Queue a test email.
   * @returns the job.
   */
  @Remote
  testEmail(): EmailJobView { return remote(() => this.ctx.learn.testEmail(OWNER_LEARNER)) }

  /**
   * Recent email jobs.
   * @returns jobs, newest first.
   */
  @Remote
  emailJobs(): EmailJobView[] { return remote(() => this.ctx.learn.emailJobs(OWNER_LEARNER)) }

  /**
   * Rendered message of a job.
   * @param jobId - job.
   * @returns the exact message.
   */
  @Remote
  emailPreview(jobId: EmailJobId): EmailPreview { return remote(() => this.ctx.learn.emailPreview(OWNER_LEARNER, jobId)) }

  /**
   * Run the reminder worker once.
   * @returns after the tick settles.
   */
  @Remote
  runReminders(): Promise<void> { return remoteAsync(() => this.ctx.learn.runReminders()) }

  /**
   * Export learner data.
   * @returns the export bundle.
   */
  @Remote
  exportData(): LearnExport { return remote(() => this.ctx.learn.exportData(OWNER_LEARNER)) }

  /**
   * Delete learner data after confirmation.
   * @param confirmation - must be `RESET`.
   */
  @Remote
  resetData(confirmation: string): void { remote(() => { this.ctx.learn.resetData(OWNER_LEARNER, confirmation) }) }
}
