/** Learner-scoped SQL access. Every query that reads learner data filters by `learner_id`. */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type { DatabaseSync, SQLInputValue } from 'node:sqlite'
import { brandString } from '@deepseek-ai/dsh-brand'
import { z } from 'zod'
import type {
  AttemptId, AttemptView, CodeLanguage, ContentOrigin, VariantSpec, VariantValidation, EmailJobId, EmailJobView, ExecutionVerdict,
  FinderRunId, FinderRunView,
  HintLevel, HintView, LearnerId,
  LearnerSettings, LessonProgress, LessonStage, Localized, ProblemId, ReviewEventView, ReviewItemId, SupportLevel, TopicId,
  TutorAssessment, TutorMessage, TutorThreadId,
} from '../types.ts'
import type { SuiteCase } from '../content/catalog.ts'
import { transaction } from './schema.ts'
import { parseJson } from '../json.ts'
import { contentOriginSchema, foundProblemSpecSchema, validationSchema, variantSpecSchema, type FoundProblemSpec } from '../content/schema.ts'

type Row = Record<string, SQLInputValue>

function text(row: Row, key: string): string {
  const value = row[key]
  if (typeof value !== 'string') throw new TypeError(`learn store: column ${key} is not text`)
  return value
}

function optionalText(row: Row, key: string): string | undefined {
  const value = row[key]
  return typeof value === 'string' ? value : undefined
}

function integer(row: Row, key: string): number {
  const value = row[key]
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  throw new TypeError(`learn store: column ${key} is not an integer`)
}

/** Stored review item. */
export interface ReviewItemRow {
  readonly id: ReviewItemId
  readonly learnerId: LearnerId
  readonly topicId: TopicId
  readonly parentProblemId: ProblemId
  readonly step: number
  readonly intervalDays: number
  readonly dueDate: string
  readonly reps: number
  readonly lapses: number
  readonly lastReason?: Localized
  readonly lastReviewedAt?: string
  readonly createdAt: string
}

/** Stored email settings, including secret hashes that never leave the service. */
export interface EmailSettingsRow {
  readonly address?: string
  readonly verifiedAt?: string
  readonly verifyCodeHash?: string
  readonly verifyTokenHash?: string
  readonly verifyExpiresAt?: string
  readonly verifyAttempts: number
  readonly optIn: boolean
  readonly paused: boolean
  readonly deliveryHour: number
  /** Capability token embedded in unsubscribe links; it only permits opting out. */
  readonly unsubscribeToken?: string
}

/** Stored email job. */
export interface EmailJobRow {
  readonly id: EmailJobId
  readonly learnerId: LearnerId
  readonly kind: 'digest' | 'verification' | 'test'
  readonly idempotencyKey: string
  readonly status: EmailJobView['status']
  readonly attempts: number
  readonly nextAttemptAt: string
  readonly leaseUntil?: string
  readonly payload: Readonly<Record<string, unknown>>
  readonly lastError?: string
  readonly reason?: string
  readonly createdAt: string
  readonly updatedAt: string
}

/** Stored delivery record. */
export interface EmailDeliveryRow {
  readonly jobId: EmailJobId
  readonly transport: 'capture' | 'smtp'
  readonly status: 'captured' | 'sent' | 'failed'
  readonly recipient: string
  readonly subject: string
  readonly text: string
  readonly html: string
  readonly messageId?: string
  readonly previewPath?: string
  readonly error?: string
  readonly createdAt: string
}

/** Stored generated variant or imported problem. */
export interface StoredProblemRow {
  readonly id: ProblemId
  readonly kind: 'variant' | 'imported'
  readonly parentProblemId?: ProblemId
  readonly topicId: TopicId
  readonly status: 'validated' | 'quarantined'
  /** Validated specification; absent for a quarantined candidate that failed the schema. */
  readonly spec: VariantSpec | FoundProblemSpec | undefined
  /** Raw candidate kept for quarantined rows whose specification failed the schema. */
  readonly raw?: JsonValue
  readonly validation: VariantValidation
  readonly origin: ContentOrigin
  readonly createdAt: string
}

/** Submission joined with its verdict for mastery and progress projections. */
export interface GradedSubmission {
  readonly attemptId: AttemptId
  readonly problemId: ProblemId
  readonly context: 'practice' | 'lesson' | 'review'
  readonly support: SupportLevel
  readonly verdictKind: ExecutionVerdict['kind']
  readonly createdAt: string
}

/** Parse a stored specification; a quarantined raw candidate yields no spec. */
function storedSpec(value: JsonValue): { spec: VariantSpec | FoundProblemSpec | undefined; raw?: JsonValue } {
  const found = foundProblemSpecSchema.safeParse(value)
  if (found.success) return { spec: found.data }
  const parsed = variantSpecSchema.safeParse(value)
  return parsed.success ? { spec: parsed.data } : { spec: undefined, raw: value }
}

const localizedSchema = z.object({ zh: z.string(), en: z.string() })
const finderEventSchema = z.array(z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('search'), at: z.string(), query: z.string(), results: z.number() }),
  z.object({ kind: z.literal('inspect'), at: z.string(), slug: z.string(), frontendId: z.number(), title: z.string(), supported: z.boolean(),
    reason: z.string().optional() }),
  z.object({ kind: z.literal('validating'), at: z.string(), slug: z.string(), attempt: z.number() }),
  z.object({ kind: z.literal('added'), at: z.string(), slug: z.string(), problemId: z.string().transform(id => brandString<ProblemId>(id)),
    frontendId: z.number(), title: localizedSchema }),
  z.object({ kind: z.literal('rejected'), at: z.string(), slug: z.string(), checks: z.array(z.object({ name: z.string(), ok: z.boolean(),
    detail: z.string() })) }),
  z.object({ kind: z.literal('skipped'), at: z.string(), slug: z.string(), reason: z.string() }),
  z.object({ kind: z.literal('message'), at: z.string(), text: z.string() }),
  z.object({ kind: z.literal('error'), at: z.string(), message: z.string() }),
]))

/** SQL row values as JSON: integers stay numbers, blobs become base64 text. */
function jsonRows(rows: Row[]): Record<string, JsonValue>[] {
  return rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]): [string, JsonValue] => [
    key, typeof value === 'bigint' ? Number(value) : ArrayBuffer.isView(value) ? Buffer.from(value.buffer, value.byteOffset,
      value.byteLength).toString('base64') : value,
  ])))
}

function finderRunFromRow(row: Row): FinderRunView {
  const error = optionalText(row, 'error')
  return {
    id: brandString<FinderRunId>(text(row, 'id')),
    description: text(row, 'description'),
    count: Number(row['count']),
    status: text(row, 'status') as FinderRunView['status'],
    events: finderEventSchema.parse(parseJson(text(row, 'events_json'))),
    added: (z.array(z.string()).parse(parseJson(text(row, 'added_json')))).map(id => brandString<ProblemId>(id)),
    ...error === undefined ? {} : { error },
    createdAt: text(row, 'created_at'),
    updatedAt: text(row, 'updated_at'),
  }
}

function attemptFromRow(row: Row): AttemptView {
  const verdict = optionalText(row, 'verdict_json')
  const assessment = optionalText(row, 'assessment_json')
  const judgeMode = optionalText(row, 'judge_mode')
  return {
    id: brandString<AttemptId>(text(row, 'id')),
    problemId: brandString<ProblemId>(text(row, 'problem_id')),
    problemVersion: integer(row, 'problem_version'),
    suiteVersion: integer(row, 'suite_version'),
    language: text(row, 'language') as CodeLanguage,
    kind: text(row, 'kind') as AttemptView['kind'],
    context: text(row, 'context') as AttemptView['context'],
    code: text(row, 'code'),
    support: text(row, 'support') as SupportLevel,
    hintsUsed: integer(row, 'hints_used'),
    status: text(row, 'status') as AttemptView['status'],
    ...verdict === undefined ? {} : { verdict: JSON.parse(verdict) as ExecutionVerdict },
    ...assessment === undefined ? {} : { assessment: JSON.parse(assessment) as TutorAssessment },
    ...judgeMode === undefined ? {} : { judgeMode: judgeMode as NonNullable<AttemptView['judgeMode']> },
    createdAt: text(row, 'created_at'),
  }
}

function reviewItemFromRow(row: Row): ReviewItemRow {
  const reason = optionalText(row, 'last_reason')
  const reviewed = optionalText(row, 'last_reviewed_at')
  return {
    id: brandString<ReviewItemId>(text(row, 'id')),
    learnerId: brandString<LearnerId>(text(row, 'learner_id')),
    topicId: brandString<TopicId>(text(row, 'topic_id')),
    parentProblemId: brandString<ProblemId>(text(row, 'parent_problem_id')),
    step: integer(row, 'step'),
    intervalDays: integer(row, 'interval_days'),
    dueDate: text(row, 'due_date'),
    reps: integer(row, 'reps'),
    lapses: integer(row, 'lapses'),
    ...reason === undefined ? {} : { lastReason: JSON.parse(reason) as Localized },
    ...reviewed === undefined ? {} : { lastReviewedAt: reviewed },
    createdAt: text(row, 'created_at'),
  }
}

function jobFromRow(row: Row): EmailJobRow {
  const lease = optionalText(row, 'lease_until')
  const error = optionalText(row, 'last_error')
  const reason = optionalText(row, 'reason')
  return {
    id: brandString<EmailJobId>(text(row, 'id')),
    learnerId: brandString<LearnerId>(text(row, 'learner_id')),
    kind: text(row, 'kind') as EmailJobRow['kind'],
    idempotencyKey: text(row, 'idempotency_key'),
    status: text(row, 'status') as EmailJobRow['status'],
    attempts: integer(row, 'attempts'),
    nextAttemptAt: text(row, 'next_attempt_at'),
    ...lease === undefined ? {} : { leaseUntil: lease },
    payload: JSON.parse(text(row, 'payload_json')) as Record<string, unknown>,
    ...error === undefined ? {} : { lastError: error },
    ...reason === undefined ? {} : { reason },
    createdAt: text(row, 'created_at'),
    updatedAt: text(row, 'updated_at'),
  }
}

/** Typed queries over the Learn database. */
export class LearnStore {
  constructor(readonly db: DatabaseSync) {}

  private get(sql: string, ...params: SQLInputValue[]): Row | undefined {
    return this.db.prepare(sql).get(...params)
  }

  private all(sql: string, ...params: SQLInputValue[]): Row[] {
    return this.db.prepare(sql).all(...params)
  }

  private run(sql: string, ...params: SQLInputValue[]): number {
    return Number(this.db.prepare(sql).run(...params).changes)
  }

  /**
   * Run statements atomically.
   * @param body - synchronous store calls.
   * @returns the body's result.
   */
  atomic<T>(body: () => T): T {
    return transaction(this.db, body)
  }

  // ---- learners ----

  /**
   * Create the learner row when absent.
   * @param id - learner.
   * @param defaults - initial settings.
   * @param now - ISO timestamp.
   * @returns the stored settings.
   */
  ensureLearner(id: LearnerId, defaults: LearnerSettings, now: string): LearnerSettings {
    this.run('INSERT OR IGNORE INTO learners (id, settings_json, created_at, updated_at) VALUES (?, ?, ?, ?)', id,
      JSON.stringify(defaults), now, now)
    return this.settings(id, defaults)
  }

  /**
   * Read learner settings, filling fields added after the row was written.
   * @param id - learner.
   * @param defaults - current defaults.
   * @returns merged settings.
   */
  settings(id: LearnerId, defaults: LearnerSettings): LearnerSettings {
    const row = this.get('SELECT settings_json FROM learners WHERE id = ?', id)
    if (row === undefined) return defaults
    return { ...defaults, ...JSON.parse(text(row, 'settings_json')) as Partial<LearnerSettings> }
  }

  /**
   * Replace learner settings.
   * @param id - identifier.
   * @param settings - settings.
   * @param now - ISO timestamp.
   */
  saveSettings(id: LearnerId, settings: LearnerSettings, now: string): void {
    this.run('UPDATE learners SET settings_json = ?, updated_at = ? WHERE id = ?', JSON.stringify(settings), now, id)
  }

  /**
   * Every learner id.
   * @returns every learner id.
   */
  learners(): LearnerId[] {
    return this.all('SELECT id FROM learners ORDER BY created_at').map(row => brandString<LearnerId>(text(row, 'id')))
  }

  // ---- lessons ----

  /**
   * Lesson progress for every started topic.
   * @param learner - learner.
   * @returns lesson progress for every started topic.
   */
  lessons(learner: LearnerId): LessonProgress[] {
    return this.all('SELECT * FROM lesson_progress WHERE learner_id = ? ORDER BY topic_id', learner).map((row) => {
      const reflection = optionalText(row, 'reflection')
      const feedback = optionalText(row, 'reflection_feedback')
      const completed = optionalText(row, 'completed_at')
      return {
        topicId: brandString<TopicId>(text(row, 'topic_id')),
        stage: text(row, 'stage') as LessonStage,
        checkAnswers: JSON.parse(text(row, 'check_answers_json')) as Record<string, number>,
        skipped: integer(row, 'skipped') === 1,
        ...reflection === undefined ? {} : { reflection },
        ...feedback === undefined ? {} : { reflectionFeedback: feedback },
        ...completed === undefined ? {} : { completedAt: completed },
      }
    })
  }

  /**
   * Insert or replace one topic's lesson progress.
   * @param learner - learner.
   * @param progress - lesson progress.
   * @param now - ISO timestamp.
   */
  saveLesson(learner: LearnerId, progress: LessonProgress, now: string): void {
    this.run(`INSERT INTO lesson_progress (learner_id, topic_id, stage, check_answers_json, skipped, reflection, reflection_feedback, completed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (learner_id, topic_id) DO UPDATE SET stage = excluded.stage, check_answers_json = excluded.check_answers_json,
        skipped = excluded.skipped, reflection = excluded.reflection, reflection_feedback = excluded.reflection_feedback,
        completed_at = excluded.completed_at, updated_at = excluded.updated_at`,
    learner, progress.topicId, progress.stage, JSON.stringify(progress.checkAnswers), progress.skipped ? 1 : 0,
    progress.reflection ?? null, progress.reflectionFeedback ?? null, progress.completedAt ?? null, now)
  }

  // ---- drafts and notes ----

  /**
   * Saved drafts of one problem, one per language.
   * @param learner - learner.
   * @param problem - problem.
   * @returns saved drafts of one problem, one per language.
   */
  drafts(learner: LearnerId, problem: ProblemId): { language: CodeLanguage; code: string; updatedAt: string }[] {
    return this.all('SELECT language, code, updated_at FROM drafts WHERE learner_id = ? AND problem_id = ?', learner, problem)
      .map(row => ({ language: text(row, 'language') as CodeLanguage, code: text(row, 'code'), updatedAt: text(row, 'updated_at') }))
  }

  /**
   * Insert or replace one draft.
   * @param learner - learner.
   * @param problem - problem.
   * @param language - language.
   * @param code - draft code.
   * @param now - ISO timestamp.
   */
  saveDraft(learner: LearnerId, problem: ProblemId, language: CodeLanguage, code: string, now: string): void {
    this.run(`INSERT INTO drafts (learner_id, problem_id, language, code, updated_at) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (learner_id, problem_id, language) DO UPDATE SET code = excluded.code, updated_at = excluded.updated_at`,
    learner, problem, language, code, now)
  }

  /**
   * Problem notes.
   * @param learner - learner.
   * @param problem - problem.
   * @returns problem notes.
   */
  note(learner: LearnerId, problem: ProblemId): string {
    const row = this.get('SELECT body FROM notes WHERE learner_id = ? AND problem_id = ?', learner, problem)
    return row === undefined ? '' : text(row, 'body')
  }

  /**
   * Insert or replace problem notes.
   * @param learner - learner.
   * @param problem - problem.
   * @param body - note text.
   * @param now - ISO timestamp.
   */
  saveNote(learner: LearnerId, problem: ProblemId, body: string, now: string): void {
    this.run(`INSERT INTO notes (learner_id, problem_id, body, updated_at) VALUES (?, ?, ?, ?)
      ON CONFLICT (learner_id, problem_id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at`, learner, problem, body, now)
  }

  // ---- attempts ----

  /**
   * Insert a new attempt in `judging` state.
   * @param learner - learner.
   * @param attempt - attempt.
   * @param reviewItem - review item submitted against, if any.
   */
  insertAttempt(learner: LearnerId, attempt: AttemptView, reviewItem: ReviewItemId | undefined): void {
    this.run(`INSERT INTO attempts (id, learner_id, problem_id, problem_version, suite_version, language, kind, context, review_item_id, code, support, hints_used, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    attempt.id, learner, attempt.problemId, attempt.problemVersion, attempt.suiteVersion, attempt.language, attempt.kind, attempt.context,
    reviewItem ?? null, attempt.code, attempt.support, attempt.hintsUsed, attempt.status, attempt.createdAt)
  }

  /**
   * Record the immutable verdict and mark the attempt done in one transaction.
   * @param attempt - attempt id.
   * @param verdict - execution verdict.
   * @param judgeMode - judge path that produced the run.
   * @returns false when a verdict already exists.
   */
  recordVerdict(attempt: AttemptId, verdict: ExecutionVerdict, judgeMode: NonNullable<AttemptView['judgeMode']> | undefined): boolean {
    return this.atomic(() => {
      if (this.get('SELECT 1 AS present FROM verdicts WHERE attempt_id = ?', attempt) !== undefined) return false
      this.run('INSERT INTO verdicts (attempt_id, kind, passed, total, verdict_json, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        attempt, verdict.kind, verdict.passed, verdict.total, JSON.stringify(verdict), verdict.createdAt)
      this.run('UPDATE attempts SET status = \'done\', judge_mode = ? WHERE id = ?', judgeMode ?? null, attempt)
      return true
    })
  }

  /**
   * Record which judge path produced an attempt.
   * @param attempt - attempt.
   * @param judgeMode - judge path.
   */
  setJudgeMode(attempt: AttemptId, judgeMode: NonNullable<AttemptView['judgeMode']>): void {
    this.run('UPDATE attempts SET judge_mode = ? WHERE id = ?', judgeMode, attempt)
  }

  /**
   * Store the tutor assessment of an attempt; the verdict stays unchanged.
   * @param attempt - attempt.
   * @param assessment - tutor assessment.
   * @param now - ISO timestamp.
   */
  saveAssessment(attempt: AttemptId, assessment: TutorAssessment, now: string): void {
    this.run(`INSERT INTO assessments (attempt_id, source, assessment_json, created_at) VALUES (?, ?, ?, ?)
      ON CONFLICT (attempt_id) DO UPDATE SET source = excluded.source, assessment_json = excluded.assessment_json, created_at = excluded.created_at`,
    attempt, assessment.source, JSON.stringify(assessment), now)
  }

  /**
   * Recorded execution verdict of an attempt.
   * @param attempt - attempt.
   * @returns recorded execution verdict of an attempt.
   */
  verdictOf(attempt: AttemptId): ExecutionVerdict | undefined {
    const row = this.get('SELECT verdict_json FROM verdicts WHERE attempt_id = ?', attempt)
    return row === undefined ? undefined : JSON.parse(text(row, 'verdict_json')) as ExecutionVerdict
  }

  private static readonly ATTEMPT_SELECT = `SELECT a.*, v.verdict_json, s.assessment_json FROM attempts a
    LEFT JOIN verdicts v ON v.attempt_id = a.id LEFT JOIN assessments s ON s.attempt_id = a.id`

  /**
   * One attempt owned by the learner.
   * @param learner - learner.
   * @param id - identifier.
   * @returns the attempt, or `undefined` when absent or owned by another learner.
   */
  attempt(learner: LearnerId, id: AttemptId): AttemptView | undefined {
    const row = this.get(`${LearnStore.ATTEMPT_SELECT} WHERE a.learner_id = ? AND a.id = ?`, learner, id)
    return row === undefined ? undefined : attemptFromRow(row)
  }

  /**
   * Recent attempts, newest first.
   * @param learner - learner.
   * @param problem - problem.
   * @param limit - maximum rows.
   * @returns recent attempts, newest first.
   */
  attempts(learner: LearnerId, problem: ProblemId | undefined, limit: number): AttemptView[] {
    const rows = problem === undefined
      ? this.all(`${LearnStore.ATTEMPT_SELECT} WHERE a.learner_id = ? ORDER BY a.created_at DESC LIMIT ?`, learner, limit)
      : this.all(`${LearnStore.ATTEMPT_SELECT} WHERE a.learner_id = ? AND a.problem_id = ? ORDER BY a.created_at DESC LIMIT ?`, learner,
        problem, limit)
    return rows.map(attemptFromRow)
  }

  /**
   * Attempts left in `judging` by an interrupted Host.
   * @returns attempts left in `judging` by an interrupted Host.
   */
  judgingAttempts(): { learner: LearnerId; id: AttemptId }[] {
    return this.all('SELECT learner_id, id FROM attempts WHERE status = \'judging\'')
      .map(row => ({ learner: brandString<LearnerId>(text(row, 'learner_id')), id: brandString<AttemptId>(text(row, 'id')) }))
  }

  /**
   * Completed Submit attempts with their grades, oldest first.
   * @param learner - learner.
   * @returns completed Submit attempts with their grades, oldest first.
   */
  gradedSubmissions(learner: LearnerId): GradedSubmission[] {
    return this.all(`SELECT a.id, a.problem_id, a.context, a.support, a.created_at, v.kind FROM attempts a JOIN verdicts v ON v.attempt_id = a.id
      WHERE a.learner_id = ? AND a.kind = 'submit' ORDER BY a.created_at`, learner).map(row => ({
      attemptId: brandString<AttemptId>(text(row, 'id')),
      problemId: brandString<ProblemId>(text(row, 'problem_id')),
      context: text(row, 'context') as GradedSubmission['context'],
      support: text(row, 'support') as SupportLevel,
      verdictKind: text(row, 'kind') as ExecutionVerdict['kind'],
      createdAt: text(row, 'created_at'),
    }))
  }

  // ---- hints and mistakes ----

  /**
   * Record a revealed hint.
   * @param learner - learner.
   * @param problem - problem.
   * @param hint - revealed hint.
   */
  insertHint(learner: LearnerId, problem: ProblemId, hint: HintView): void {
    this.run('INSERT INTO hint_events (learner_id, problem_id, level, source, content, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      learner, problem, hint.level, hint.source, hint.content, hint.createdAt)
  }

  /**
   * Revealed hints of a problem in level order.
   * @param learner - learner.
   * @param problem - problem.
   * @returns revealed hints of a problem in level order.
   */
  hints(learner: LearnerId, problem: ProblemId): HintView[] {
    return this.all('SELECT level, source, content, created_at FROM hint_events WHERE learner_id = ? AND problem_id = ? ORDER BY id',
      learner, problem)
      .map(row => ({ level: integer(row, 'level') as HintLevel, source: text(row, 'source') as HintView['source'], content: text(row,
        'content'), createdAt: text(row, 'created_at') }))
  }

  /**
   * Record mistake tags derived from one attempt.
   * @param learner - learner.
   * @param attempt - attempt.
   * @param problem - problem.
   * @param topic - topic.
   * @param tags - mistake tags.
   * @param now - ISO timestamp.
   */
  insertMistakeTags(learner: LearnerId, attempt: AttemptId, problem: ProblemId, topic: TopicId, tags: readonly string[],
    now: string): void {
    for (const tag of tags) {
      this.run('INSERT INTO mistake_tags (learner_id, attempt_id, problem_id, topic_id, tag, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        learner, attempt, problem, topic, tag, now)
    }
  }

  /**
   * Every recorded mistake tag, oldest first.
   * @param learner - learner.
   * @returns every recorded mistake tag, oldest first.
   */
  mistakeTags(learner: LearnerId): { tag: string; topicId: TopicId; createdAt: string }[] {
    return this.all('SELECT tag, topic_id, created_at FROM mistake_tags WHERE learner_id = ? ORDER BY created_at', learner)
      .map(row => ({ tag: text(row, 'tag'), topicId: brandString<TopicId>(text(row, 'topic_id')), createdAt: text(row, 'created_at') }))
  }

  // ---- tutor ----

  /**
   * Return the thread for one subject, creating it when absent.
   * @param learner - learner.
   * @param subject - `problem:<id>` or `topic:<id>`.
   * @param id - id used when creating.
   * @param now - ISO timestamp.
   * @returns the thread id.
   */
  thread(learner: LearnerId, subject: string, id: TutorThreadId, now: string): TutorThreadId {
    this.run('INSERT OR IGNORE INTO tutor_threads (id, learner_id, subject, created_at) VALUES (?, ?, ?, ?)', id, learner, subject, now)
    const row = this.get('SELECT id FROM tutor_threads WHERE learner_id = ? AND subject = ?', learner, subject)
    if (row === undefined) throw new Error('learn store: tutor thread insert failed')
    return brandString<TutorThreadId>(text(row, 'id'))
  }

  /**
   * Owner and subject of a tutor thread.
   * @param thread - thread.
   * @returns owner and subject of a tutor thread.
   */
  threadOwner(thread: TutorThreadId): { learner: LearnerId; subject: string } | undefined {
    const row = this.get('SELECT learner_id, subject FROM tutor_threads WHERE id = ?', thread)
    return row === undefined ? undefined : { learner: brandString<LearnerId>(text(row, 'learner_id')), subject: text(row, 'subject') }
  }

  /**
   * Messages of a tutor thread in order.
   * @param thread - thread.
   * @returns messages of a tutor thread in order.
   */
  messages(thread: TutorThreadId): TutorMessage[] {
    return this.all('SELECT * FROM tutor_messages WHERE thread_id = ? ORDER BY seq', thread).map((row) => {
      const error = optionalText(row, 'error')
      return {
        id: text(row, 'id'),
        role: text(row, 'role') as TutorMessage['role'],
        content: text(row, 'content'),
        status: text(row, 'status') as TutorMessage['status'],
        ...error === undefined ? {} : { error },
        createdAt: text(row, 'created_at'),
      }
    })
  }

  /**
   * Append a tutor thread message.
   * @param thread - thread.
   * @param message - message.
   */
  appendMessage(thread: TutorThreadId, message: TutorMessage): void {
    this.run(`INSERT INTO tutor_messages (id, thread_id, seq, role, content, status, error, created_at)
      VALUES (?, ?, (SELECT COALESCE(MAX(seq), 0) + 1 FROM tutor_messages WHERE thread_id = ?), ?, ?, ?, ?, ?)`,
    message.id, thread, thread, message.role, message.content, message.status, message.error ?? null, message.createdAt)
  }

  /**
   * Finish a streaming tutor message.
   * @param id - identifier.
   * @param content - final content.
   * @param status - status.
   * @param error - failure message, if any.
   */
  settleMessage(id: string, content: string, status: TutorMessage['status'], error: string | undefined): void {
    this.run('UPDATE tutor_messages SET content = ?, status = ?, error = ? WHERE id = ?', content, status, error ?? null, id)
  }

  /** Mark tutor messages left streaming by an interrupted Host. */
  interruptStreamingMessages(): void {
    this.run('UPDATE tutor_messages SET status = \'interrupted\', error = \'The Host stopped before this reply finished.\' WHERE status = \'streaming\'')
  }

  // ---- generated problems and suites ----

  /**
   * Store a learner-owned generated or imported problem.
   * @param learner - learner.
   * @param row - validated problem row.
   */
  insertProblem(learner: LearnerId, row: StoredProblemRow): void {
    this.run(`INSERT INTO problems (id, learner_id, kind, parent_problem_id, topic_id, status, spec_json, validation_json, origin_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    row.id, learner, row.kind, row.parentProblemId ?? null, row.topicId, row.status,
    JSON.stringify(row.spec ?? row.raw ?? null), JSON.stringify(row.validation), JSON.stringify(row.origin), row.createdAt)
  }

  /**
   * Learner-owned generated and imported problems, validated on read.
   * @param learner - learner.
   * @returns learner-owned generated and imported problems, validated on read.
   */
  storedProblems(learner: LearnerId): StoredProblemRow[] {
    return this.all('SELECT * FROM problems WHERE learner_id = ? ORDER BY created_at', learner).map((row) => {
      const parent = optionalText(row, 'parent_problem_id')
      return {
        id: brandString<ProblemId>(text(row, 'id')),
        kind: text(row, 'kind') as StoredProblemRow['kind'],
        ...parent === undefined ? {} : { parentProblemId: brandString<ProblemId>(parent) },
        topicId: brandString<TopicId>(text(row, 'topic_id')),
        status: text(row, 'status') as StoredProblemRow['status'],
        ...storedSpec(parseJson(text(row, 'spec_json'))),
        validation: validationSchema.parse(parseJson(text(row, 'validation_json'))),
        origin: contentOriginSchema.parse(parseJson(text(row, 'origin_json'))),
        createdAt: text(row, 'created_at'),
      }
    })
  }

  /**
   * Freeze a suite version; stored suites are immutable.
   * @param problem - problem.
   * @param version - suite version.
   * @param origin - how the suite was built.
   * @param cases - suite cases.
   * @param now - ISO timestamp.
   */
  insertSuite(problem: ProblemId, version: number, origin: string, cases: readonly SuiteCase[], now: string): void {
    this.run('INSERT INTO suites (problem_id, version, origin, cases_json, created_at) VALUES (?, ?, ?, ?, ?)', problem, version, origin,
      JSON.stringify(cases), now)
  }

  /**
   * Frozen suite versions of a stored problem.
   * @param problem - problem.
   * @returns frozen suite versions of a stored problem.
   */
  suites(problem: ProblemId): { version: number; origin: string; cases: SuiteCase[] }[] {
    return this.all('SELECT version, origin, cases_json FROM suites WHERE problem_id = ? ORDER BY version', problem)
      .map(row => ({ version: integer(row, 'version'), origin: text(row, 'origin'), cases: JSON.parse(text(row,
        'cases_json')) as SuiteCase[] }))
  }

  /**
   * Record a judge-proposed test and its validation status.
   * @param problem - problem.
   * @param attempt - attempt.
   * @param args - input arguments.
   * @param expected - reference output, when validated.
   * @param status - status.
   * @param reason - cancellation reason.
   * @param now - ISO timestamp.
   */
  insertProposedTest(problem: ProblemId, attempt: AttemptId | undefined, args: readonly JsonValue[], expected: JsonValue | undefined,
    status: 'validated' | 'rejected', reason: string, now: string): void {
    this.run('INSERT INTO proposed_tests (problem_id, attempt_id, args_json, expected_json, status, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      problem, attempt ?? null, JSON.stringify(args), expected === undefined ? null : JSON.stringify(expected), status, reason, now)
  }

  /**
   * Proposed tests of a problem with the given status.
   * @param problem - problem.
   * @param status - status.
   * @returns proposed tests of a problem with the given status.
   */
  proposedTests(problem: ProblemId,
    status: 'validated' | 'rejected' | 'promoted'): { id: number; args: JsonValue[]; expected: JsonValue; reason: string }[] {
    return this.all('SELECT id, args_json, expected_json, reason FROM proposed_tests WHERE problem_id = ? AND status = ? ORDER BY id',
      problem, status)
      .map(row => ({ id: integer(row, 'id'), args: JSON.parse(text(row, 'args_json')) as JsonValue[], expected: parseJson(optionalText(row, 'expected_json') ?? 'null'), reason: text(row, 'reason') }))
  }

  /**
   * Mark proposed tests as promoted into a suite.
   * @param ids - proposed test ids.
   */
  markProposedPromoted(ids: readonly number[]): void {
    for (const id of ids) this.run('UPDATE proposed_tests SET status = \'promoted\' WHERE id = ?', id)
  }

  // ---- reviews ----

  /**
   * One review item owned by the learner.
   * @param learner - learner.
   * @param id - identifier.
   * @returns the item, or `undefined` when absent or owned by another learner.
   */
  reviewItem(learner: LearnerId, id: ReviewItemId): ReviewItemRow | undefined {
    const row = this.get('SELECT * FROM review_items WHERE learner_id = ? AND id = ?', learner, id)
    return row === undefined ? undefined : reviewItemFromRow(row)
  }

  /**
   * Review item of a parent problem.
   * @param learner - learner.
   * @param parent - parent problem.
   * @returns review item of a parent problem.
   */
  reviewItemFor(learner: LearnerId, parent: ProblemId): ReviewItemRow | undefined {
    const row = this.get('SELECT * FROM review_items WHERE learner_id = ? AND parent_problem_id = ?', learner, parent)
    return row === undefined ? undefined : reviewItemFromRow(row)
  }

  /**
   * Every review item of the learner.
   * @param learner - learner.
   * @returns every review item of the learner.
   */
  reviewItems(learner: LearnerId): ReviewItemRow[] {
    return this.all('SELECT * FROM review_items WHERE learner_id = ? ORDER BY due_date, created_at', learner).map(reviewItemFromRow)
  }

  /**
   * Insert a review item unless the parent already has one.
   * @param item - review item.
   * @returns whether the item was inserted.
   */
  insertReviewItem(item: ReviewItemRow): boolean {
    return this.run(`INSERT OR IGNORE INTO review_items (id, learner_id, topic_id, parent_problem_id, step, interval_days, due_date, reps, lapses, last_reason, last_reviewed_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    item.id, item.learnerId, item.topicId, item.parentProblemId, item.step, item.intervalDays, item.dueDate, item.reps, item.lapses,
    item.lastReason === undefined ? null : JSON.stringify(item.lastReason), item.lastReviewedAt ?? null, item.createdAt) === 1
  }

  /**
   * Replace review item scheduling fields.
   * @param item - review item.
   */
  updateReviewItem(item: ReviewItemRow): void {
    this.run('UPDATE review_items SET step = ?, interval_days = ?, due_date = ?, reps = ?, lapses = ?, last_reason = ?, last_reviewed_at = ? WHERE id = ? AND learner_id = ?',
      item.step, item.intervalDays, item.dueDate, item.reps, item.lapses,
      item.lastReason === undefined ? null : JSON.stringify(item.lastReason),
      item.lastReviewedAt ?? null, item.id, item.learnerId)
  }

  /**
   * Insert a review event unless its idempotency key exists.
   * @param event - review event.
   * @returns whether the event was inserted.
   */
  insertReviewEvent(event: {
    learner: LearnerId
    item: ReviewItemId
    topic: TopicId
    kind: ReviewEventView['kind']
    key: string
    attempt?: AttemptId
    variant?: ProblemId
    localDate: string
    before?: unknown
    after: unknown
    reason: Localized
    now: string
  }): boolean {
    return this.run(`INSERT OR IGNORE INTO review_events (learner_id, item_id, topic_id, kind, idempotency_key, attempt_id, variant_id, local_date, before_json, after_json, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    event.learner, event.item, event.topic, event.kind, event.key, event.attempt ?? null, event.variant ?? null, event.localDate,
    event.before === undefined ? null : JSON.stringify(event.before), JSON.stringify(event.after), JSON.stringify(event.reason),
    event.now) === 1
  }

  /**
   * Review event recorded under an idempotency key.
   * @param learner - learner.
   * @param key - idempotency key.
   * @returns review event recorded under an idempotency key.
   */
  reviewEventByKey(learner: LearnerId,
    key: string): { after: unknown; before: unknown; reason: Localized; variant?: ProblemId } | undefined {
    const row = this.get('SELECT before_json, after_json, reason, variant_id FROM review_events WHERE learner_id = ? AND idempotency_key = ?', learner, key)
    if (row === undefined) return undefined
    const variant = optionalText(row, 'variant_id')
    return {
      after: JSON.parse(text(row, 'after_json')),
      before: JSON.parse(optionalText(row, 'before_json') ?? 'null'),
      reason: JSON.parse(text(row, 'reason')) as Localized,
      ...variant === undefined ? {} : { variant: brandString<ProblemId>(variant) },
    }
  }

  /**
   * Review completion already recorded for an attempt.
   * @param learner - learner.
   * @param attempt - attempt.
   * @returns review completion already recorded for an attempt.
   */
  completionForAttempt(learner: LearnerId,
    attempt: AttemptId): { after: unknown; before: unknown; reason: Localized; variant?: ProblemId } | undefined {
    const row = this.get('SELECT idempotency_key FROM review_events WHERE learner_id = ? AND attempt_id = ? AND kind = \'completed\'',
      learner, attempt)
    return row === undefined ? undefined : this.reviewEventByKey(learner, text(row, 'idempotency_key'))
  }

  /**
   * Recent review events, newest first.
   * @param learner - learner.
   * @param limit - maximum rows.
   * @returns recent review events, newest first.
   */
  reviewEvents(learner: LearnerId, limit: number): ReviewEventView[] {
    return this.all('SELECT * FROM review_events WHERE learner_id = ? ORDER BY id DESC LIMIT ?', learner, limit).map(row => ({
      kind: text(row, 'kind') as ReviewEventView['kind'],
      itemId: brandString<ReviewItemId>(text(row, 'item_id')),
      topicId: brandString<TopicId>(text(row, 'topic_id')),
      reason: JSON.parse(text(row, 'reason')) as Localized,
      dueDate: (JSON.parse(text(row, 'after_json')) as { dueDate?: string }).dueDate ?? '',
      createdAt: text(row, 'created_at'),
    }))
  }

  /**
   * Number of reviews completed on a local date.
   * @param learner - learner.
   * @param localDate - local date `YYYY-MM-DD`.
   * @returns number of reviews completed on a local date.
   */
  completedReviewsOn(learner: LearnerId, localDate: string): number {
    const row = this.get('SELECT COUNT(*) AS count FROM review_events WHERE learner_id = ? AND kind = \'completed\' AND local_date = ?',
      learner, localDate)
    return row === undefined ? 0 : integer(row, 'count')
  }

  /**
   * Pass or fail outcome of every completed review with its topic.
   * @param learner - learner.
   * @returns pass or fail outcome of every completed review with its topic.
   */
  reviewOutcomes(learner: LearnerId): { topicId: TopicId; passed: boolean }[] {
    return this.all('SELECT topic_id, after_json FROM review_events WHERE learner_id = ? AND kind = \'completed\'', learner).map(row => ({
      topicId: brandString<TopicId>(text(row, 'topic_id')),
      passed: (JSON.parse(text(row, 'after_json')) as { result?: string }).result === 'passed',
    }))
  }

  /**
   * Exercise assigned to one due cycle.
   * @param item - review item.
   * @param dueDate - due date of the cycle.
   * @returns the assigned problem, or `undefined` when none is assigned.
   */
  assignment(item: ReviewItemId, dueDate: string): ProblemId | undefined {
    const row = this.get('SELECT variant_id FROM review_assignments WHERE item_id = ? AND due_date = ?', item, dueDate)
    return row === undefined ? undefined : brandString<ProblemId>(text(row, 'variant_id'))
  }

  /**
   * Assign a variant to one due cycle; a concurrent assignment wins.
   * @param item - review item.
   * @param dueDate - due date of the cycle.
   * @param variant - variant problem.
   * @param now - ISO timestamp.
   * @returns the assigned variant.
   */
  assign(item: ReviewItemId, dueDate: string, variant: ProblemId, now: string): ProblemId {
    this.run('INSERT OR IGNORE INTO review_assignments (item_id, due_date, variant_id, created_at) VALUES (?, ?, ?, ?)', item, dueDate,
      variant, now)
    return this.assignment(item, dueDate) ?? variant
  }

  /**
   * Variants already assigned to a review item.
   * @param item - review item.
   * @returns variants already assigned to a review item.
   */
  variantsUsed(item: ReviewItemId): ProblemId[] {
    return this.all('SELECT variant_id FROM review_assignments WHERE item_id = ? ORDER BY created_at',
      item).map(row => brandString<ProblemId>(text(row, 'variant_id')))
  }

  // ---- email ----

  /**
   * Email settings row, with defaults when absent.
   * @param learner - learner.
   * @returns email settings row, with defaults when absent.
   */
  emailSettings(learner: LearnerId): EmailSettingsRow {
    const row = this.get('SELECT * FROM email_settings WHERE learner_id = ?', learner)
    if (row === undefined) return { verifyAttempts: 0, optIn: false, paused: false, deliveryHour: 9 }
    const pick = (key: string): string | undefined => optionalText(row, key)
    const address = pick('address')
    const verifiedAt = pick('verified_at')
    const verifyCodeHash = pick('verify_code_hash')
    const verifyTokenHash = pick('verify_token_hash')
    const verifyExpiresAt = pick('verify_expires_at')
    const unsubscribeToken = pick('unsubscribe_token')
    return {
      ...address === undefined ? {} : { address },
      ...verifiedAt === undefined ? {} : { verifiedAt },
      ...verifyCodeHash === undefined ? {} : { verifyCodeHash },
      ...verifyTokenHash === undefined ? {} : { verifyTokenHash },
      ...verifyExpiresAt === undefined ? {} : { verifyExpiresAt },
      verifyAttempts: integer(row, 'verify_attempts'),
      optIn: integer(row, 'opt_in') === 1,
      paused: integer(row, 'paused') === 1,
      deliveryHour: integer(row, 'delivery_hour'),
      ...unsubscribeToken === undefined ? {} : { unsubscribeToken },
    }
  }

  /**
   * Insert or replace email settings.
   * @param learner - learner.
   * @param settings - settings.
   * @param now - ISO timestamp.
   */
  saveEmailSettings(learner: LearnerId, settings: EmailSettingsRow, now: string): void {
    this.run(`INSERT INTO email_settings (learner_id, address, verified_at, verify_code_hash, verify_token_hash, verify_expires_at, verify_attempts, opt_in, paused, delivery_hour, unsubscribe_token, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (learner_id) DO UPDATE SET address = excluded.address, verified_at = excluded.verified_at, verify_code_hash = excluded.verify_code_hash,
        verify_token_hash = excluded.verify_token_hash, verify_expires_at = excluded.verify_expires_at, verify_attempts = excluded.verify_attempts,
        opt_in = excluded.opt_in, paused = excluded.paused, delivery_hour = excluded.delivery_hour, unsubscribe_token = excluded.unsubscribe_token,
        updated_at = excluded.updated_at`,
    learner, settings.address ?? null, settings.verifiedAt ?? null, settings.verifyCodeHash ?? null, settings.verifyTokenHash ?? null,
    settings.verifyExpiresAt ?? null, settings.verifyAttempts, settings.optIn ? 1 : 0, settings.paused ? 1 : 0, settings.deliveryHour,
    settings.unsubscribeToken ?? null, now)
  }

  /**
   * Learner owning a verification-token hash or unsubscribe token.
   * @param column - token column.
   * @param value - token value or hash.
   * @returns learner owning a verification-token hash or unsubscribe token.
   */
  learnerByToken(column: 'verify_token_hash' | 'unsubscribe_token', value: string): LearnerId | undefined {
    const row = this.get(`SELECT learner_id FROM email_settings WHERE ${column} = ?`, value)
    return row === undefined ? undefined : brandString<LearnerId>(text(row, 'learner_id'))
  }

  /**
   * Enqueue a job unless its idempotency key exists.
   * @param job - job.
   * @returns whether a new job was inserted.
   */
  enqueueJob(job: Omit<EmailJobRow, 'attempts' | 'updatedAt' | 'status'>): boolean {
    return this.run(`INSERT OR IGNORE INTO email_jobs (id, learner_id, kind, idempotency_key, status, attempts, next_attempt_at, payload_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'queued', 0, ?, ?, ?, ?)`,
    job.id, job.learnerId, job.kind, job.idempotencyKey, job.nextAttemptAt, JSON.stringify(job.payload), job.createdAt, job.createdAt) === 1
  }

  /**
   * Job recorded under an idempotency key.
   * @param key - idempotency key.
   * @returns job recorded under an idempotency key.
   */
  jobByKey(key: string): EmailJobRow | undefined {
    const row = this.get('SELECT * FROM email_jobs WHERE idempotency_key = ?', key)
    return row === undefined ? undefined : jobFromRow(row)
  }

  /**
   * One job owned by the learner.
   * @param learner - learner.
   * @param id - identifier.
   * @returns the job, or `undefined` when absent or owned by another learner.
   */
  job(learner: LearnerId, id: EmailJobId): EmailJobRow | undefined {
    const row = this.get('SELECT * FROM email_jobs WHERE learner_id = ? AND id = ?', learner, id)
    return row === undefined ? undefined : jobFromRow(row)
  }

  /**
   * Recent jobs, newest first.
   * @param learner - learner.
   * @param limit - maximum rows.
   * @returns recent jobs, newest first.
   */
  jobs(learner: LearnerId, limit: number): EmailJobRow[] {
    return this.all('SELECT * FROM email_jobs WHERE learner_id = ? ORDER BY created_at DESC LIMIT ?', learner, limit).map(jobFromRow)
  }

  /**
   * Claim due jobs with a lease. Expired `sending` leases are reclaimed.
   * @param now - ISO timestamp.
   * @param leaseUntil - lease expiry.
   * @param limit - maximum jobs.
   * @returns claimed jobs.
   */
  claimJobs(now: string, leaseUntil: string, limit: number): EmailJobRow[] {
    return this.atomic(() => {
      const rows = this.all(`SELECT * FROM email_jobs WHERE (status = 'queued' AND next_attempt_at <= ?) OR (status = 'sending' AND lease_until <= ?)
        ORDER BY next_attempt_at LIMIT ?`, now, now, limit)
      for (const row of rows) {
        this.run('UPDATE email_jobs SET status = \'sending\', lease_until = ?, attempts = attempts + 1, updated_at = ? WHERE id = ?',
          leaseUntil, now, text(row, 'id'))
      }
      return rows.map(row => ({ ...jobFromRow(row), status: 'sending' as const, attempts: integer(row, 'attempts') + 1, leaseUntil }))
    })
  }

  /**
   * Settle a claimed job or schedule its retry.
   * @param id - identifier.
   * @param status - status.
   * @param now - ISO timestamp.
   * @param detail - failure message, skip reason, or retry time.
   */
  finishJob(id: EmailJobId, status: EmailJobRow['status'], now: string,
    detail: { error?: string; reason?: string; nextAttemptAt?: string }): void {
    this.run(`UPDATE email_jobs SET status = ?, lease_until = NULL, updated_at = ?, last_error = COALESCE(?, last_error), reason = COALESCE(?, reason),
      next_attempt_at = COALESCE(?, next_attempt_at) WHERE id = ?`,
    status, now, detail.error ?? null, detail.reason ?? null, detail.nextAttemptAt ?? null, id)
  }

  /**
   * Remove secrets from a settled job's payload.
   * @param id - identifier.
   */
  scrubJobPayload(id: EmailJobId): void {
    this.run('UPDATE email_jobs SET payload_json = \'{}\' WHERE id = ? AND status NOT IN (\'queued\', \'sending\')', id)
  }

  /**
   * Cancel queued jobs of the given kinds.
   * @param learner - learner.
   * @param kinds - job kinds.
   * @param reason - cancellation reason.
   * @param now - ISO timestamp.
   * @returns the number of cancelled jobs.
   */
  cancelQueuedJobs(learner: LearnerId, kinds: readonly EmailJobRow['kind'][], reason: string, now: string): number {
    let changed = 0
    for (const kind of kinds) {
      changed += this.run(`UPDATE email_jobs SET status = 'cancelled', reason = ?, updated_at = ?, payload_json = CASE WHEN kind = 'verification' THEN '{}' ELSE payload_json END
        WHERE learner_id = ? AND kind = ? AND status = 'queued'`, reason, now, learner, kind)
    }
    return changed
  }

  /**
   * Record one transport delivery attempt.
   * @param delivery - delivery record.
   */
  insertDelivery(delivery: EmailDeliveryRow): void {
    this.run(`INSERT INTO email_deliveries (job_id, transport, status, message_id, recipient, subject, text_body, html_body, preview_path, error, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    delivery.jobId, delivery.transport, delivery.status, delivery.messageId ?? null, delivery.recipient, delivery.subject,
    delivery.text, delivery.html,
    delivery.previewPath ?? null, delivery.error ?? null, delivery.createdAt)
  }

  /**
   * Latest delivery attempt of a job.
   * @param job - job.
   * @returns latest delivery attempt of a job.
   */
  latestDelivery(job: EmailJobId): EmailDeliveryRow | undefined {
    const row = this.get('SELECT * FROM email_deliveries WHERE job_id = ? ORDER BY id DESC LIMIT 1', job)
    if (row === undefined) return undefined
    const messageId = optionalText(row, 'message_id')
    const previewPath = optionalText(row, 'preview_path')
    const error = optionalText(row, 'error')
    return {
      jobId: brandString<EmailJobId>(text(row, 'job_id')),
      transport: text(row, 'transport') as EmailDeliveryRow['transport'],
      status: text(row, 'status') as EmailDeliveryRow['status'],
      recipient: text(row, 'recipient'),
      subject: text(row, 'subject'),
      text: text(row, 'text_body'),
      html: text(row, 'html_body'),
      ...messageId === undefined ? {} : { messageId },
      ...previewPath === undefined ? {} : { previewPath },
      ...error === undefined ? {} : { error },
      createdAt: text(row, 'created_at'),
    }
  }

  // ---- export and reset ----

  /**
   * Dump every learner-owned row.
   * @param learner - learner.
   * @returns rows keyed by table, with secret hashes removed.
   */
  exportRows(learner: LearnerId): Record<string, Record<string, JsonValue>[]> {
    const scoped = ['learners', 'lesson_progress', 'drafts', 'notes', 'attempts', 'hint_events', 'mistake_tags', 'tutor_threads',
      'problems', 'review_items', 'review_events', 'email_jobs', 'finder_runs']
    const tables: Record<string, Record<string, JsonValue>[]> = {}
    for (const table of scoped) {
      const column = table === 'learners' ? 'id' : 'learner_id'
      tables[table] = jsonRows(this.all(`SELECT * FROM ${table} WHERE ${column} = ?`, learner))
    }
    tables['verdicts'] = jsonRows(this.all('SELECT v.* FROM verdicts v JOIN attempts a ON a.id = v.attempt_id WHERE a.learner_id = ?',
      learner))
    tables['assessments'] = jsonRows(this.all('SELECT s.* FROM assessments s JOIN attempts a ON a.id = s.attempt_id WHERE a.learner_id = ?', learner))
    tables['tutor_messages'] = jsonRows(this.all('SELECT m.* FROM tutor_messages m JOIN tutor_threads t ON t.id = m.thread_id WHERE t.learner_id = ?', learner))
    tables['review_assignments'] = jsonRows(this.all('SELECT r.* FROM review_assignments r JOIN review_items i ON i.id = r.item_id WHERE i.learner_id = ?', learner))
    tables['email_settings'] = jsonRows(this.all('SELECT learner_id, address, verified_at, opt_in, paused, delivery_hour, updated_at FROM email_settings WHERE learner_id = ?', learner))
    tables['email_deliveries'] = jsonRows(this.all('SELECT d.id, d.job_id, d.transport, d.status, d.recipient, d.subject, d.created_at FROM email_deliveries d JOIN email_jobs j ON j.id = d.job_id WHERE j.learner_id = ?', learner))
    return tables
  }

  /**
   * Record a new problem-finder run.
   * @param learner - learner.
   * @param run - the run as started.
   */
  insertFinderRun(learner: LearnerId, run: FinderRunView): void {
    this.run(`INSERT INTO finder_runs (id, learner_id, description, count, status, events_json, added_json, error, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, run.id, learner, run.description, run.count, run.status, JSON.stringify(run.events),
    JSON.stringify(run.added), run.error ?? null, run.createdAt, run.updatedAt)
  }

  /**
   * Replace the mutable fields of a problem-finder run.
   * @param run - current run state.
   */
  updateFinderRun(run: FinderRunView): void {
    this.run('UPDATE finder_runs SET status = ?, events_json = ?, added_json = ?, error = ?, updated_at = ? WHERE id = ?', run.status,
      JSON.stringify(run.events), JSON.stringify(run.added), run.error ?? null, run.updatedAt, run.id)
  }

  /**
   * Recent problem-finder runs, newest first.
   * @param learner - learner.
   * @param limit - maximum rows.
   * @returns the runs.
   */
  finderRuns(learner: LearnerId, limit: number): FinderRunView[] {
    return this.all('SELECT * FROM finder_runs WHERE learner_id = ? ORDER BY created_at DESC LIMIT ?', learner, limit).map(finderRunFromRow)
  }

  /**
   * Mark runs left `running` by an interrupted Host as failed.
   * @param now - ISO timestamp.
   */
  interruptFinderRuns(now: string): void {
    this.run(`UPDATE finder_runs SET status = 'failed', error = 'The Host stopped while this run was in progress.', updated_at = ?
      WHERE status = 'running'`, now)
  }

  /**
   * Delete every row owned by a learner.
   * @param learner - learner.
   */
  deleteLearner(learner: LearnerId): void {
    this.atomic(() => {
      const owned = this.all('SELECT id FROM problems WHERE learner_id = ?', learner).map(row => text(row, 'id'))
      for (const id of owned) {
        this.run('DELETE FROM suites WHERE problem_id = ?', id)
        this.run('DELETE FROM proposed_tests WHERE problem_id = ?', id)
      }
      this.run('DELETE FROM learners WHERE id = ?', learner)
    })
  }
}
