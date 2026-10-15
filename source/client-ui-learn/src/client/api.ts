/** Browser-side Learn actions over the `learn` Remote namespace. */
import type { Context } from '@deepseek-ai/cordis'
import { RemoteStreamCarrierError } from '@deepseek-ai/dsh-api-gateway/client'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-experimental-api-learn/remote'
import type { ReviewMoveTarget, VariantGenerationView } from '@deepseek-ai/dsh-experimental-api-learn/types'
import type {
  AttemptId, AttemptView, CodeLanguage, EmailJobId, EmailJobView, EmailPreview, EmailSettingsView, HintLevel, HintView, JsonValue,
  FinderRunId, FinderRunView, FinderStreamFrame, LessonCheckId, LessonCheckView,
  LearnerSettings, LearnExport, LearnOverview, LessonProgress, LessonStage, ProblemId, ProgressView, RecallRating, ReviewCompletion,
  ReviewItemId, ReviewQueue, RunnerStatus, TodayView, TopicId, TutorStreamFrame, TutorThreadId, VariantRecord, WorkspaceState,
} from '@deepseek-ai/dsh-experimental-learn/types'

/** Error carrying the Remote failure message for display. */
export class LearnApiError extends Error {
  constructor(message: string, readonly code: string | undefined) {
    super(message)
    this.name = 'LearnApiError'
  }
}

async function unwrap<T>(pending: Promise<RemoteResult<T>>): Promise<T> {
  const result = await pending
  if (result.ok) return result.value
  const error = result.error as { message?: string; code?: string }
  throw new LearnApiError(error.message ?? 'Request failed', error.code)
}

/** Every Learn action the page uses; each rejects with {@link LearnApiError}. */
export interface LearnApi {
  overview(): Promise<LearnOverview>
  today(): Promise<TodayView>
  updateSettings(patch: Partial<LearnerSettings>): Promise<LearnerSettings>
  lesson(topicId: TopicId, stage: LessonStage): Promise<LessonProgress>
  lessonCheck(topicId: TopicId): Promise<LessonCheckView | null>
  startLessonCheck(topicId: TopicId, source: LessonCheckView['source'], signal: AbortSignal): Promise<LessonCheckView>
  submitLessonCheck(checkId: LessonCheckId, answers: Readonly<Record<string, string>>, signal: AbortSignal): Promise<LessonCheckView>
  skipLesson(topicId: TopicId): Promise<LessonProgress>
  reflect(topicId: TopicId, text: string, signal: AbortSignal): Promise<LessonProgress>
  workspace(problemId: ProblemId): Promise<WorkspaceState>
  saveDraft(problemId: ProblemId, language: CodeLanguage, code: string): Promise<string>
  saveNote(problemId: ProblemId, body: string): Promise<string>
  run(problemId: ProblemId, language: CodeLanguage, code: string, customInputs: readonly (readonly JsonValue[])[],
    signal: AbortSignal): Promise<AttemptView>
  submit(problemId: ProblemId, language: CodeLanguage, code: string, context: AttemptView['context'], reviewItemId: ReviewItemId | null,
    signal: AbortSignal): Promise<AttemptView>
  hint(problemId: ProblemId, level: HintLevel, confirmReveal: boolean, signal: AbortSignal): Promise<HintView>
  tutorSend(problemId: ProblemId | null, topicId: TopicId | null, text: string): Promise<{ threadId: TutorThreadId; messageId: string }>
  tutorCancel(threadId: TutorThreadId): Promise<void>
  /**
   * Follow a tutor thread until the signal aborts.
   * @param threadId - thread.
   * @param onFrame - frame consumer.
   * @param signal - observation lifetime.
   * @returns after the observation ends.
   */
  tutorFollow(threadId: TutorThreadId, onFrame: (frame: TutorStreamFrame) => void, signal: AbortSignal): Promise<void>
  reviewQueue(): Promise<ReviewQueue>
  completeReview(itemId: ReviewItemId, attemptId: AttemptId, recall: RecallRating | null): Promise<ReviewCompletion>
  moveReview(itemId: ReviewItemId, target: ReviewMoveTarget, requestKey: string): Promise<{ dueDate: string; duplicate: boolean }>
  generateVariant(parentId: ProblemId, signal: AbortSignal): Promise<VariantGenerationView>
  variants(): Promise<VariantRecord[]>
  importProblem(specJson: string, signal: AbortSignal): Promise<VariantRecord>
  findProblems(description: string, count: number): Promise<FinderRunView>
  finderRuns(): Promise<FinderRunView[]>
  finderCancel(runId: FinderRunId): Promise<void>
  /**
   * Follow a problem search until the signal aborts.
   * @param runId - run.
   * @param onFrame - frame consumer.
   * @param signal - observation lifetime.
   * @returns after the observation ends.
   */
  finderFollow(runId: FinderRunId, onFrame: (frame: FinderStreamFrame) => void, signal: AbortSignal): Promise<void>
  progress(): Promise<ProgressView>
  runnerStatus(refresh: boolean): Promise<RunnerStatus>
  prepareRunner(language: CodeLanguage | null, signal: AbortSignal): Promise<RunnerStatus>
  startRunner(signal: AbortSignal): Promise<RunnerStatus>
  emailSettings(): Promise<EmailSettingsView>
  setEmailAddress(address: string): Promise<EmailSettingsView>
  verifyEmail(code: string): Promise<EmailSettingsView>
  emailPreferences(patch: { optIn?: boolean; paused?: boolean; deliveryHour?: number }): Promise<EmailSettingsView>
  testEmail(): Promise<EmailJobView>
  emailJobs(): Promise<EmailJobView[]>
  emailPreview(jobId: EmailJobId): Promise<EmailPreview>
  runReminders(): Promise<void>
  exportData(): Promise<LearnExport>
  resetData(confirmation: string): Promise<void>
}

/**
 * Bind the Learn actions to a mounted Remote namespace.
 * @param ctx - Client context with `remote.learn`.
 * @returns the action set.
 */
export function createLearnApi(ctx: Context): LearnApi {
  const learn = ctx.remote.learn
  return {
    overview: () => unwrap(learn.overview()),
    today: () => unwrap(learn.today()),
    updateSettings: patch => unwrap(learn.updateSettings(patch)),
    lesson: (topicId, stage) => unwrap(learn.lesson(topicId, stage)),
    lessonCheck: topicId => unwrap(learn.lessonCheck(topicId)),
    startLessonCheck: (topicId, source, signal) => unwrap(learn.startLessonCheck(topicId, source, signal)),
    submitLessonCheck: (checkId, answers, signal) => unwrap(learn.submitLessonCheck(checkId, answers, signal)),
    skipLesson: topicId => unwrap(learn.skipLesson(topicId)),
    reflect: (topicId, text, signal) => unwrap(learn.reflect(topicId, text, signal)),
    workspace: problemId => unwrap(learn.workspace(problemId)),
    saveDraft: (problemId, language, code) => unwrap(learn.saveDraft(problemId, language, code)),
    saveNote: (problemId, body) => unwrap(learn.saveNote(problemId, body)),
    run: (problemId, language, code, inputs, signal) => unwrap(learn.run(problemId, language, code, inputs, signal)),
    submit: (problemId, language, code, context, item, signal) => unwrap(learn.submit(problemId, language, code, context, item, signal)),
    hint: (problemId, level, confirm, signal) => unwrap(learn.hint(problemId, level, confirm, signal)),
    tutorSend: (problemId, topicId, text) => unwrap(learn.tutorSend(problemId, topicId, text)),
    tutorCancel: threadId => unwrap(learn.tutorCancel(threadId)),
    tutorFollow: async (threadId, onFrame, signal) => {
      const stream = ctx.remote.$stream<TutorStreamFrame>({
        name: 'Learn tutor', open: streamSignal => learn.tutorFollow(threadId, streamSignal),
        ended: () => new RemoteStreamCarrierError('Learn tutor stream ended'), carrierFailed: () => {},
      })
      const stop = (): void => { void stream.dispose() }
      signal.addEventListener('abort', stop, { once: true })
      try {
        for await (const item of stream) {
          onFrame(item.value)
          item.accept()
        }
      } catch (error) {
        if (!signal.aborted) throw error
      } finally {
        signal.removeEventListener('abort', stop)
        await stream.dispose()
      }
    },
    reviewQueue: () => unwrap(learn.reviewQueue()),
    completeReview: (itemId, attemptId, recall) => unwrap(learn.completeReview(itemId, attemptId, recall)),
    moveReview: (itemId, target, key) => unwrap(learn.moveReview(itemId, target, key)),
    generateVariant: (parentId, signal) => unwrap(learn.generateVariant(parentId, signal)),
    variants: () => unwrap(learn.variants()),
    importProblem: (spec, signal) => unwrap(learn.importProblem(spec, signal)),
    findProblems: (description, count) => unwrap(learn.findProblems(description, count)),
    finderRuns: () => unwrap(learn.finderRuns()),
    finderCancel: runId => unwrap(learn.finderCancel(runId)),
    finderFollow: async (runId, onFrame, signal) => {
      const stream = ctx.remote.$stream<FinderStreamFrame>({
        name: 'Learn problem finder', open: streamSignal => learn.finderFollow(runId, streamSignal),
        ended: () => new RemoteStreamCarrierError('Learn problem finder stream ended'), carrierFailed: () => {},
      })
      const stop = (): void => { void stream.dispose() }
      signal.addEventListener('abort', stop, { once: true })
      try {
        for await (const item of stream) {
          onFrame(item.value)
          item.accept()
          if (item.value.type === 'settled') break
        }
      } catch (error) {
        if (!signal.aborted) throw error
      } finally {
        signal.removeEventListener('abort', stop)
        await stream.dispose()
      }
    },
    progress: () => unwrap(learn.progress()),
    runnerStatus: refresh => unwrap(learn.runnerStatus(refresh)),
    prepareRunner: (language, signal) => unwrap(learn.prepareRunner(language, signal)),
    startRunner: signal => unwrap(learn.startRunner(signal)),
    emailSettings: () => unwrap(learn.emailSettings()),
    setEmailAddress: address => unwrap(learn.setEmailAddress(address)),
    verifyEmail: code => unwrap(learn.verifyEmail(code)),
    emailPreferences: patch => unwrap(learn.emailPreferences(patch)),
    testEmail: () => unwrap(learn.testEmail()),
    emailJobs: () => unwrap(learn.emailJobs()),
    emailPreview: jobId => unwrap(learn.emailPreview(jobId)),
    runReminders: () => unwrap(learn.runReminders()),
    exportData: () => unwrap(learn.exportData()),
    resetData: confirmation => unwrap(learn.resetData(confirmation)),
  }
}
