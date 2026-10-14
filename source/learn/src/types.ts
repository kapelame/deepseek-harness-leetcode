/** JSON-safe Learn domain types shared by the Host service, its Remote namespace, and the Web Client. */
import type { Branded } from '@deepseek-ai/dsh-brand'
import type { JsonValue } from '@deepseek-ai/dsh-util-values'

export type { JsonValue }

/** Owner-scoped learner identity; one DSH home has one owner learner. */
export type LearnerId = Branded<'LearnLearnerId'>
/** Stable topic identity from the curriculum. */
export type TopicId = Branded<'LearnTopicId'>
/** Stable problem identity: curriculum problem, original exercise, or variant. */
export type ProblemId = Branded<'LearnProblemId'>
/** One saved Run or Submit. */
export type AttemptId = Branded<'LearnAttemptId'>
/** One concept review schedule. */
export type ReviewItemId = Branded<'LearnReviewItemId'>
/** One tutor conversation thread. */
export type TutorThreadId = Branded<'LearnTutorThreadId'>
/** One queued email job. */
export type EmailJobId = Branded<'LearnEmailJobId'>
/** Problem-finder run identifier. */
export type FinderRunId = Branded<'LearnFinderRunId'>

/** Tutoring and explanation language. Code identifiers stay idiomatic in every locale. */
export type LearnLocale = 'zh' | 'en'
/** Text authored in both supported locales. */
export interface Localized {
  readonly zh: string
  readonly en: string
}

/** Problem difficulty, matching LeetCode's three levels. */
export type Difficulty = 'easy' | 'medium' | 'hard'
/** Submission languages; a language is listed only when its runner and driver are complete. */
export type CodeLanguage = 'python' | 'typescript'
/**
 * Where a problem came from. `leetcode` problems carry verified metadata and an
 * official link; `original` exercises and `variant` reviews carry full statements.
 */
export type ProblemKind = 'leetcode' | 'original' | 'variant' | 'imported'

/**
 * Parameter and return value encodings understood by both drivers. `json`
 * passes any JSON value through unchanged; design operation arguments and
 * harness outputs that may be `null` use it.
 */
export type ValueType =
  | 'int' | 'float' | 'bool' | 'string'
  | 'int[]' | 'float[]' | 'bool[]' | 'string[]'
  | 'int[][]' | 'string[][]'
  | 'tree' | 'linked-list' | 'linked-list[]'
  | 'json'

/**
 * Fixed argument builders for problems whose inputs are object graphs a JSON
 * value cannot express directly. The drivers own every builder; content and
 * models only select one by name.
 * - `linked-list-cycle`: `(values, pos)` builds a list whose tail links to index `pos` (`-1` for none); the
 *   solution receives `head`; a returned node is reported as its index (`-1` for `null`).
 * - `linked-list-intersection`: `(intersectVal, listA, listB, skipA, skipB)` builds two lists sharing nodes
 *   from `listA[skipA]`; the solution receives `(headA, headB)`; a returned node is reported as its value or `null`.
 * - `random-list`: `([[val, randomIndex | null], ...])` builds a list with random pointers; the solution
 *   receives `head` and must return a deep copy, reported in the same encoding.
 * - `tree-node-refs`: `(tree, p, q)` builds the tree and passes the nodes holding values `p` and `q`;
 *   a returned node is reported as its value.
 */
export type HarnessName = 'linked-list-cycle' | 'linked-list-intersection' | 'random-list' | 'tree-node-refs'

/** One method of a design problem. */
export interface DesignMethod {
  readonly name: string
  readonly params: readonly ParamSpec[]
  readonly returns: ValueType | 'void'
}

/**
 * How the judge calls a submission when it is not a plain function returning its answer.
 * - `in-place`: the solution returns nothing; the judge compares parameter `param` after the call.
 * - `harness`: arguments go through a named {@link HarnessName} builder.
 * - `design`: case arguments are `[operations, arguments]` as on LeetCode; the first operation constructs
 *   `className`, each later one calls a method, and the result lists every output (`null` for constructors
 *   and `void` methods).
 */
export type ProblemShape =
  | { readonly kind: 'in-place'; readonly param: number }
  | { readonly kind: 'harness'; readonly name: HarnessName }
  | { readonly kind: 'design'; readonly className: string; readonly constructorParams: readonly ParamSpec[];
    readonly methods: readonly DesignMethod[] }

/**
 * Host-side output comparison. Validators are named functions owned by the
 * service, never code from content files or models.
 */
export type Comparator =
  | { readonly kind: 'exact' }
  | { readonly kind: 'unordered' }
  | { readonly kind: 'unordered-nested' }
  | { readonly kind: 'float'; readonly tolerance: number }
  | { readonly kind: 'validator'; readonly name: ValidatorName }

/** Registered alternative-output validators. */
export type ValidatorName = 'pair-indices-sum' | 'pair-indices-sum-one-based' | 'longest-palindromic-substring' | 'balanced-bst-same-inorder'

/** Verified official metadata for a LeetCode problem; never statement text. */
export interface LeetCodeReference {
  readonly frontendId: number
  readonly title: string
  readonly slug: string
  readonly difficulty: Difficulty
  readonly tags: readonly string[]
  readonly url: string
  readonly paidOnly: boolean
  /** ISO date the metadata was checked against LeetCode's public question query. */
  readonly verifiedAt: string
}

/** Content origin recorded in storage and shown in the UI. */
export interface ContentOrigin {
  /** `found` marks LeetCode problems added by the problem finder from a learner's description. */
  readonly source: 'authored' | 'generated' | 'imported' | 'found'
  /** Human author or `model:<provider>/<model>` for generated content. */
  readonly author: string
  readonly createdAt: string
  /** Generation seed and DSH Session that produced a generated variant. */
  readonly seed?: number | undefined
  readonly sessionId?: string | undefined
}

/** One function parameter in the learner-facing signature. */
export interface ParamSpec {
  readonly name: string
  readonly type: ValueType
}

/** Learner-visible example or explicitly visible case. */
export interface VisibleCase {
  readonly id: string
  readonly args: readonly JsonValue[]
  readonly expected: JsonValue
  readonly explanation?: Localized
}

/** Learner-facing problem view; never includes reference code or hidden cases. */
export interface ProblemView {
  readonly id: ProblemId
  readonly kind: ProblemKind
  readonly version: number
  readonly suiteVersion: number
  readonly title: Localized
  readonly difficulty: Difficulty
  readonly topics: readonly TopicId[]
  readonly leetcode?: LeetCodeReference
  /** Original concise description written for Learn. */
  readonly summary: Localized
  /** Complete statement for original exercises, variants, and licensed imports. */
  readonly statement?: Localized
  readonly constraints: readonly Localized[]
  readonly params: readonly ParamSpec[]
  readonly returns: ValueType
  /** Present when the judge does not call a plain function; see {@link ProblemShape}. */
  readonly shape?: ProblemShape
  readonly comparator: Comparator
  /** Function or method name used by both languages. */
  readonly entry: { readonly python: string; readonly typescript: string }
  readonly starter: Readonly<Record<CodeLanguage, string>>
  readonly examples: readonly VisibleCase[]
  readonly hiddenCaseCount: number
  readonly origin: ContentOrigin
  /** Variant-only fields; the parent mapping stays hidden until the variant attempt ends. */
  readonly variant?: { readonly parentHidden: true } | VariantReveal
}

/** Post-attempt explanation of what transferred between a parent problem and a variant. */
export interface VariantReveal {
  readonly parentProblemId: ProblemId
  readonly parentTitle: Localized
  readonly differences: readonly VariantDifference[]
  readonly transfer: Localized
}

/** One meaningful change from the parent problem. */
export interface VariantDifference {
  readonly category: 'constraints' | 'output' | 'input-structure' | 'reasoning'
  readonly description: Localized
}

/** Catalog row for search and filtering. */
export interface ProblemSummary {
  readonly id: ProblemId
  readonly kind: ProblemKind
  readonly title: Localized
  readonly difficulty: Difficulty
  readonly topics: readonly TopicId[]
  readonly leetcode?: Pick<LeetCodeReference, 'frontendId' | 'url' | 'tags'>
  readonly status: ProblemStatus
}

/** A curated problem list, such as LeetCode Hot 100, grouped the way its publisher groups it. */
export interface CollectionView {
  readonly id: string
  readonly title: Localized
  /** Where the list and its grouping were verified. */
  readonly source: { readonly name: string; readonly url: string; readonly verifiedAt: string }
  readonly groups: readonly { readonly id: string; readonly title: Localized; readonly problems: readonly ProblemId[] }[]
}

/** Learner progress on one problem. */
export type ProblemStatus = 'new' | 'attempted' | 'solved-with-help' | 'solved'

/** One step of a worked-example trace table. */
export interface TraceStep {
  readonly state: Readonly<Record<string, string>>
  readonly note: Localized
}

/** Multiple-choice understanding check graded deterministically. */
export interface CheckQuestion {
  readonly id: string
  readonly prompt: Localized
  readonly options: readonly Localized[]
  readonly answer: number
  readonly explanation: Localized
}

/** One topic lesson in teaching order. */
export interface Lesson {
  readonly motivation: Localized
  readonly strategy: Localized
  readonly example: {
    readonly title: Localized
    readonly body: Localized
    readonly traceColumns: readonly string[]
    readonly trace: readonly TraceStep[]
  }
  readonly check: readonly CheckQuestion[]
  readonly practiceProblem: ProblemId
  readonly reflectionPrompt: Localized
}

/** Curriculum topic with prerequisites and problem order. */
export interface TopicView {
  readonly id: TopicId
  readonly order: number
  readonly title: Localized
  readonly summary: Localized
  readonly prerequisites: readonly TopicId[]
  readonly problems: readonly ProblemId[]
  readonly lesson: Lesson
}

/** Ordered lesson stages; `reflection` completes the lesson. */
export type LessonStage = 'motivation' | 'strategy' | 'example' | 'check' | 'problem' | 'reflection' | 'complete'

/** Persisted lesson progress for one topic. */
export interface LessonProgress {
  readonly topicId: TopicId
  readonly stage: LessonStage
  readonly checkAnswers: Readonly<Record<string, number>>
  readonly skipped: boolean
  readonly reflection?: string
  readonly reflectionFeedback?: string
  readonly completedAt?: string
}

/** Concept mastery projected from attempts and reviews. */
export interface TopicMastery {
  readonly topicId: TopicId
  /** 0–100. */
  readonly score: number
  readonly level: 'not-started' | 'learning' | 'practicing' | 'proficient' | 'mastered'
  readonly independentSolves: number
  readonly assistedSolves: number
  readonly studiedSolutions: number
  readonly failedAttempts: number
  readonly reviewsPassed: number
  readonly reviewsFailed: number
}

/** How much help preceded an attempt. */
export type SupportLevel = 'independent' | 'with-hints' | 'studied-solution'

/** Execution verdict computed only from deterministic runs. */
export type VerdictKind =
  | 'passed-local-tests'
  | 'wrong-answer'
  | 'compile-error'
  | 'runtime-error'
  | 'time-limit-exceeded'
  | 'memory-limit-exceeded'
  | 'output-limit-exceeded'
  | 'evaluation-unavailable'
  | 'cancelled'

/** Revealed failing or counterexample case. */
export interface FailingCase {
  readonly caseId: string
  readonly visibility: 'example' | 'custom' | 'hidden'
  readonly args: readonly JsonValue[]
  /** Absent for hidden-case runtime failures that need no expected value. */
  readonly expected?: JsonValue
  readonly actual?: JsonValue
  readonly error?: string
  readonly line?: number
  readonly stdout?: string
}

/** Per-case result for Run, where every case is visible. */
export interface CaseResult {
  readonly caseId: string
  readonly args: readonly JsonValue[]
  readonly expected?: JsonValue
  readonly actual?: JsonValue
  readonly passed: boolean
  readonly error?: string
  readonly line?: number
  readonly stdout: string
  readonly timeMs?: number
}

/** Immutable execution verdict of one attempt. */
export interface ExecutionVerdict {
  readonly kind: VerdictKind
  readonly passed: number
  readonly total: number
  readonly suite: 'examples' | 'custom' | 'full'
  readonly suiteVersion: number
  readonly language: CodeLanguage
  readonly runner: string
  readonly failing?: FailingCase
  readonly cases?: readonly CaseResult[]
  /** Sum of measured per-case wall time inside the container, when available. */
  readonly measuredMs?: number
  readonly message?: string
  readonly coverageNote: Localized
  readonly createdAt: string
}

/** Tutor assessment, separate from and unable to override the execution verdict. */
export interface TutorAssessment {
  readonly source: 'agent' | 'unavailable'
  readonly summary: string
  readonly reasoning?: string
  readonly likelyComplexity?: { readonly time: string; readonly space: string; readonly basis: 'estimated' }
  readonly codeQuality?: string
  readonly misconceptions: readonly string[]
  readonly mistakeTags: readonly string[]
  readonly nextStep?: string
  readonly reflectionQuestion?: string
  readonly sessionId?: string
  readonly failure?: string
}

/** One saved Run or Submit with its frozen versions. */
export interface AttemptView {
  readonly id: AttemptId
  readonly problemId: ProblemId
  readonly problemVersion: number
  readonly suiteVersion: number
  readonly language: CodeLanguage
  readonly kind: 'run' | 'submit'
  readonly context: 'practice' | 'lesson' | 'review'
  readonly code: string
  readonly support: SupportLevel
  readonly hintsUsed: number
  readonly status: 'judging' | 'done'
  readonly verdict?: ExecutionVerdict
  readonly assessment?: TutorAssessment
  readonly judgeMode?: 'agent' | 'deterministic-fallback'
  readonly createdAt: string
}

/** Hint levels: direction, key observation, outline, solution. */
export type HintLevel = 1 | 2 | 3 | 4

/** One delivered hint. */
export interface HintView {
  readonly level: HintLevel
  readonly source: 'authored' | 'tutor'
  readonly content: string
  readonly createdAt: string
}

/** Tutor conversation message. */
export interface TutorMessage {
  readonly id: string
  readonly role: 'learner' | 'tutor'
  readonly content: string
  readonly status: 'complete' | 'streaming' | 'interrupted' | 'failed'
  readonly error?: string
  readonly createdAt: string
}

/** Live tutor stream frame. */
export type TutorStreamFrame =
  | { readonly type: 'snapshot'; readonly messages: readonly TutorMessage[] }
  /** Complete guarded text so far; streaming never exposes unguarded model output. */
  | { readonly type: 'progress'; readonly messageId: string; readonly text: string }
  | { readonly type: 'settled'; readonly message: TutorMessage }

/** One step of a problem-finder run, rendered by the client in the learner's language. */
export type FinderEvent =
  | { readonly kind: 'search'; readonly at: string; readonly query: string; readonly results: number }
  | { readonly kind: 'inspect'; readonly at: string; readonly slug: string; readonly frontendId: number; readonly title: string;
    readonly supported: boolean; readonly reason?: string | undefined }
  | { readonly kind: 'validating'; readonly at: string; readonly slug: string; readonly attempt: number }
  | { readonly kind: 'added'; readonly at: string; readonly slug: string; readonly problemId: ProblemId; readonly frontendId: number;
    readonly title: Localized }
  | { readonly kind: 'rejected'; readonly at: string; readonly slug: string; readonly checks: readonly { readonly name: string;
    readonly ok: boolean; readonly detail: string }[] }
  | { readonly kind: 'skipped'; readonly at: string; readonly slug: string; readonly reason: string }
  | { readonly kind: 'message'; readonly at: string; readonly text: string }
  | { readonly kind: 'error'; readonly at: string; readonly message: string }

/** A problem-finder run: the learner's description, its progress, and the problems it added. */
export interface FinderRunView {
  readonly id: FinderRunId
  readonly description: string
  /** Problems the learner asked for. */
  readonly count: number
  readonly status: 'running' | 'completed' | 'failed' | 'cancelled'
  readonly events: readonly FinderEvent[]
  readonly added: readonly ProblemId[]
  readonly error?: string
  readonly createdAt: string
  readonly updatedAt: string
}

/** Live problem-finder frames. */
export type FinderStreamFrame =
  | { readonly type: 'snapshot'; readonly run: FinderRunView }
  | { readonly type: 'event'; readonly event: FinderEvent }
  | { readonly type: 'settled'; readonly run: FinderRunView }

/** Learner workspace state for one problem. */
export interface WorkspaceState {
  readonly problem: ProblemView
  readonly drafts: Readonly<Partial<Record<CodeLanguage, { readonly code: string; readonly updatedAt: string }>>>
  readonly note: string
  readonly attempts: readonly AttemptView[]
  readonly hints: readonly HintView[]
  readonly tutor: { readonly threadId: TutorThreadId; readonly messages: readonly TutorMessage[] }
  readonly status: ProblemStatus
  readonly reviewItemId?: ReviewItemId
}

/** Self-rated recall after a review attempt. */
export type RecallRating = 'again' | 'hard' | 'good' | 'easy'

/** One review queue entry. */
export interface ReviewQueueEntry {
  readonly itemId: ReviewItemId
  readonly topicId: TopicId
  readonly parentProblemId: ProblemId
  readonly dueDate: string
  readonly overdueDays: number
  readonly intervalDays: number
  readonly step: number
  /** Assigned validated variant, stable for this due cycle. */
  readonly variantId?: ProblemId
  readonly variantOrigin?: ContentOrigin['source']
  readonly estimatedMinutes: number
  readonly lastReason?: Localized
}

/** Review queue snapshot in the learner's local calendar. */
export interface ReviewQueue {
  readonly today: string
  readonly timezone: string
  readonly dailyLimit: number
  readonly completedToday: number
  readonly due: readonly ReviewQueueEntry[]
  readonly upcoming: readonly ReviewQueueEntry[]
  /** Due items beyond today's limit, carried to later days. */
  readonly deferred: number
}

/** Outcome of completing one review. */
export interface ReviewCompletion {
  readonly itemId: ReviewItemId
  readonly duplicate: boolean
  readonly previousDueDate: string
  readonly nextDueDate: string
  readonly intervalDays: number
  readonly step: number
  readonly reason: Localized
  readonly reveal?: VariantReveal
}

/** One review history row. */
export interface ReviewEventView {
  readonly kind: 'created' | 'completed' | 'snoozed' | 'rescheduled'
  readonly itemId: ReviewItemId
  readonly topicId: TopicId
  readonly reason: Localized
  readonly dueDate: string
  readonly createdAt: string
}

/** Learner settings. */
export interface LearnerSettings {
  readonly locale: LearnLocale
  readonly timezone: string
  readonly experience: 'new' | 'some' | 'experienced'
  readonly preferredLanguage: CodeLanguage
  readonly dailyGoalMinutes: number
  readonly reviewDailyLimit: number
  readonly reviewLadderDays: readonly number[]
}

/** Email reminder preferences and verification status. */
export interface EmailSettingsView {
  readonly address?: string
  readonly verified: boolean
  readonly verificationPending: boolean
  readonly optIn: boolean
  readonly paused: boolean
  readonly deliveryHour: number
  readonly transport: 'capture' | 'smtp'
  readonly liveSending: boolean
  readonly verifyUrlAvailable: boolean
}

/** One email job with its latest delivery. */
export interface EmailJobView {
  readonly id: EmailJobId
  readonly kind: 'digest' | 'verification' | 'test'
  readonly status: 'queued' | 'sending' | 'sent' | 'captured' | 'skipped' | 'cancelled' | 'failed'
  readonly attempts: number
  readonly idempotencyKey: string
  readonly lastError?: string
  readonly reason?: string
  readonly createdAt: string
  readonly updatedAt: string
  readonly previewSubject?: string
}

/** Rendered message preview from the capture transport. */
export interface EmailPreview {
  readonly jobId: EmailJobId
  readonly to: string
  readonly subject: string
  readonly text: string
  readonly html: string
  readonly transport: 'capture' | 'smtp'
  readonly status: EmailJobView['status']
}

/** Runner health shown before Run and Submit. */
export interface RunnerStatus {
  readonly backend: string
  readonly available: boolean
  readonly languages: readonly {
    readonly language: CodeLanguage
    readonly available: boolean
    readonly image: string
    readonly reason?: string
  }[]
  readonly reason?: string
  readonly checkedAt: string
}

/** Model availability for tutoring. */
export interface TutorStatus {
  readonly configured: boolean
  readonly provider?: string
  readonly model?: string
  readonly lastFailure?: string
}

/** Recent activity item. */
export interface ActivityItem {
  readonly kind: 'attempt' | 'review' | 'lesson'
  readonly title: Localized
  readonly detail: string
  readonly at: string
  readonly problemId?: ProblemId
  readonly topicId?: TopicId
}

/** Today dashboard projection. */
export interface TodayView {
  readonly today: string
  readonly nextLesson?: { readonly topicId: TopicId; readonly stage: LessonStage }
  readonly nextProblem?: ProblemId
  readonly reviewsDue: number
  readonly reviewsCompletedToday: number
  readonly dailyLimit: number
  readonly dailyGoalMinutes: number
  readonly minutesToday: number
  readonly recent: readonly ActivityItem[]
}

/** Mistake pattern aggregated from tutor assessments and verdicts. */
export interface MistakePattern {
  readonly tag: string
  readonly count: number
  readonly lastSeen: string
  readonly topics: readonly TopicId[]
}

/** Progress page projection. */
export interface ProgressView {
  readonly mastery: readonly TopicMastery[]
  readonly mistakes: readonly MistakePattern[]
  readonly history: readonly ReviewEventView[]
  readonly attempts: readonly AttemptView[]
}

/** Complete bootstrap snapshot for the Learn page. */
export interface LearnOverview {
  readonly learnerId: LearnerId
  readonly settings: LearnerSettings
  readonly topics: readonly TopicView[]
  readonly lessons: readonly LessonProgress[]
  readonly mastery: readonly TopicMastery[]
  readonly problems: readonly ProblemSummary[]
  /** Curated problem lists over the built-in problems. */
  readonly collections: readonly CollectionView[]
  readonly runner: RunnerStatus
  readonly tutor: TutorStatus
  readonly languages: readonly { readonly language: CodeLanguage; readonly label: string; readonly supported: boolean }[]
}

/** Structured variant specification produced by an agent or authored as seed content. */
export interface VariantSpec {
  readonly id: string
  readonly parentProblemId: string
  readonly topicId: string
  readonly title: Localized
  readonly statement: Localized
  readonly summary: Localized
  readonly difficulty: Difficulty
  readonly skills: readonly string[]
  readonly differences: readonly VariantDifference[]
  readonly transfer: Localized
  readonly entry: { readonly python: string; readonly typescript: string }
  readonly params: readonly ParamSpec[]
  readonly returns: ValueType
  readonly shape?: ProblemShape | undefined
  readonly comparator: Comparator
  readonly constraints: readonly Localized[]
  readonly examples: readonly { readonly args: readonly JsonValue[]; readonly expected: JsonValue }[]
  /** Derived from the signature when absent. */
  readonly starter?: Readonly<Record<CodeLanguage, string>> | undefined
  readonly reference: string
  readonly oracle: string
  /** One declarative input domain per parameter (see `runtime/gen_lib.py`). */
  readonly inputs?: readonly InputDomainSpec[] | undefined
  /** Python `adjust(args, rng, size)` and/or `valid(args)` hooks over domain-generated inputs. */
  readonly hooks?: string | undefined
  /** Override: Python `generate(seed, size)` returning one argument list. */
  readonly generator?: string | undefined
  readonly boundaryCases: readonly { readonly args: readonly JsonValue[] }[]
  readonly mutants: readonly string[]
  readonly hints: readonly Localized[]
}

/** Declarative input domain of one parameter, interpreted by `runtime/gen_lib.py`. */
export interface InputDomainSpec {
  readonly type: ValueType
  readonly min?: number | undefined
  readonly max?: number | undefined
  readonly smallMin?: number | undefined
  readonly smallMax?: number | undefined
  readonly digits?: number | undefined
  readonly minLength?: number | undefined
  readonly maxLength?: number | undefined
  readonly smallMaxLength?: number | undefined
  readonly largeLength?: number | undefined
  readonly sorted?: 'asc' | 'desc' | undefined
  readonly distinct?: boolean | undefined
  readonly alphabet?: string | undefined
  readonly smallAlphabet?: string | undefined
  readonly shape?: 'random' | 'chain' | undefined
  readonly word?: InputLengthSpec & { readonly alphabet?: string | undefined } | undefined
  readonly row?: InputLengthSpec & { readonly largeLength?: number | undefined } | undefined
  readonly cell?: InputCellSpec | undefined
}

/** Length bounds of a nested generated value. */
export interface InputLengthSpec {
  readonly minLength?: number | undefined
  readonly maxLength?: number | undefined
  readonly smallMaxLength?: number | undefined
}

/** Value bounds of matrix cells. */
export interface InputCellSpec {
  readonly min?: number | undefined
  readonly max?: number | undefined
  readonly alphabet?: string | undefined
  readonly maxLength?: number | undefined
}

/** Validation result of one variant candidate. */
export interface VariantValidation {
  readonly ok: boolean
  readonly checks: readonly { readonly name: string; readonly ok: boolean; readonly detail: string }[]
}

/** Stored variant record. */
export interface VariantRecord {
  readonly id: ProblemId
  readonly parentProblemId: ProblemId
  readonly topicId: TopicId
  readonly status: 'validated' | 'quarantined'
  readonly origin: ContentOrigin
  readonly validation: VariantValidation
  readonly title: Localized
  readonly createdAt: string
}

/** Export bundle of every learner-owned row. */
export interface LearnExport {
  readonly format: 'dsh-learn-export'
  readonly version: 1
  readonly exportedAt: string
  readonly learnerId: LearnerId
  readonly tables: Readonly<Record<string, readonly Readonly<Record<string, JsonValue>>[]>>
}
