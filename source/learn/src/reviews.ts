/**
 * Concept reviews. Each review item belongs to one parent problem; every due
 * cycle is assigned one validated variant, stored so reloads show the same
 * exercise. Completion is one transaction keyed by the item's due cycle, so a
 * repeated or concurrent completion changes the schedule once.
 */
import { randomUUID } from 'node:crypto'
import { brandString } from '@deepseek-ai/dsh-brand'
import type {
  AttemptId, AttemptView, LearnerId, Localized, ProblemId, RecallRating, ReviewCompletion, ReviewItemId, ReviewQueue,
  ReviewQueueEntry, VariantReveal,
} from './types.ts'
import type { ProblemDefinition } from './content/catalog.ts'
import type { ReviewItemRow } from './store/store.ts'
import { addDays, daysBetween, isCalendarDate } from './review/dates.ts'
import { initialSchedule, nextSchedule } from './review/policy.ts'
import { gradeOf, LearnError } from './judging.ts'
import type { LearnRuntime } from './runtime.ts'

const MINUTES: Readonly<Record<ProblemDefinition['difficulty'], number>> = { easy: 10, medium: 20, hard: 30 }

function stateOf(item: ReviewItemRow): { step: number; intervalDays: number; reps: number; lapses: number; dueDate: string } {
  return { step: item.step, intervalDays: item.intervalDays, reps: item.reps, lapses: item.lapses, dueDate: item.dueDate }
}

/** Review queue and schedule changes. */
export class Reviews {
  constructor(
    private readonly runtime: LearnRuntime,
    private readonly requestVariant: (learner: LearnerId, parent: ProblemId) => void,
  ) {}

  /**
   * Choose the variant for one due cycle, preferring the same parent and avoiding variants this item already used.
   * @returns the assigned variant, or undefined when no validated variant exists.
   */
  private assignment(learner: LearnerId, item: ReviewItemRow): ProblemId | undefined {
    const existing = this.runtime.store.assignment(item.id, item.dueDate)
    if (existing !== undefined) return existing
    const candidates = this.runtime.problems.variantsFor(learner, item.parentProblemId, item.topicId)
    if (candidates.length === 0) {
      this.requestVariant(learner, item.parentProblemId)
      return undefined
    }
    const used = this.runtime.store.variantsUsed(item.id)
    const unused = candidates.filter(candidate => !used.includes(candidate))
    if (unused.length <= 1) this.requestVariant(learner, item.parentProblemId)
    const chosen = unused[0] ?? used.find(candidate => candidates.includes(candidate)) ?? candidates[0]
    if (chosen === undefined) return undefined
    return this.runtime.store.assign(item.id, item.dueDate, chosen, this.runtime.iso())
  }

  private entry(learner: LearnerId, item: ReviewItemRow, today: string, assign: boolean): ReviewQueueEntry {
    const variantId = assign ? this.assignment(learner, item) : this.runtime.store.assignment(item.id, item.dueDate)
    const variant = variantId === undefined ? undefined : this.runtime.problems.get(learner, variantId)
    return {
      itemId: item.id,
      topicId: item.topicId,
      parentProblemId: item.parentProblemId,
      dueDate: item.dueDate,
      overdueDays: Math.max(0, daysBetween(item.dueDate, today)),
      intervalDays: item.intervalDays,
      step: item.step,
      ...variantId === undefined ? {} : { variantId },
      ...variant === undefined ? {} : { variantOrigin: variant.origin.source },
      estimatedMinutes: MINUTES[variant?.difficulty ?? 'medium'],
      ...item.lastReason === undefined ? {} : { lastReason: item.lastReason },
    }
  }

  /**
   * Today's queue in the learner's calendar; at most the daily limit is due, the rest is deferred.
   * @param learner - learner.
   * @returns queue snapshot with stable variant assignments.
   */
  queue(learner: LearnerId): ReviewQueue {
    const settings = this.runtime.settings(learner)
    const today = this.runtime.today(learner)
    const items = this.runtime.store.reviewItems(learner)
    const completedToday = this.runtime.store.completedReviewsOn(learner, today)
    const remaining = Math.max(0, settings.reviewDailyLimit - completedToday)
    const due = items.filter(item => item.dueDate <= today).sort((left,
      right) => left.dueDate < right.dueDate ? -1 : left.dueDate > right.dueDate ? 1 : 0)
    const shown = due.slice(0, remaining)
    const upcoming = items.filter(item => item.dueDate > today).slice(0, 20)
    return {
      today,
      timezone: settings.timezone,
      dailyLimit: settings.reviewDailyLimit,
      completedToday,
      due: shown.map(item => this.entry(learner, item, today, true)),
      upcoming: upcoming.map(item => this.entry(learner, item, today, false)),
      deferred: due.length - shown.length,
    }
  }

  /**
   * Create the review item after the first graded submission of a curriculum problem.
   * @param learner - learner.
   * @param definition - submitted problem.
   * @param attempt - settled submission.
   */
  ensureItem(learner: LearnerId, definition: ProblemDefinition, attempt: Pick<AttemptView, 'id' | 'support' | 'verdict'>): void {
    if (definition.variant !== undefined || definition.kind === 'imported') return
    const grade = gradeOf(attempt.verdict)
    if (grade === undefined) return
    if (this.runtime.store.reviewItemFor(learner, definition.id) !== undefined) return
    const settings = this.runtime.settings(learner)
    const today = this.runtime.today(learner)
    const decision = initialSchedule({ result: grade, support: attempt.support }, settings.reviewLadderDays, today)
    const item: ReviewItemRow = {
      id: brandString<ReviewItemId>(`rev-${randomUUID()}`),
      learnerId: learner,
      topicId: this.runtime.problems.topicOf(definition),
      parentProblemId: definition.id,
      step: decision.state.step,
      intervalDays: decision.state.intervalDays,
      dueDate: decision.dueDate,
      reps: decision.state.reps,
      lapses: decision.state.lapses,
      lastReason: decision.reason,
      createdAt: this.runtime.iso(),
    }
    this.runtime.store.atomic(() => {
      if (!this.runtime.store.insertReviewItem(item)) return
      this.runtime.store.insertReviewEvent({
        learner, item: item.id, topic: item.topicId, kind: 'created', key: `create:${item.id}`, attempt: attempt.id,
        localDate: today, after: stateOf(item), reason: decision.reason, now: this.runtime.iso(),
      })
    })
  }

  private reveal(learner: LearnerId, variantId: ProblemId | undefined): VariantReveal | undefined {
    const variant = variantId === undefined ? undefined : this.runtime.problems.get(learner, variantId)
    if (variant?.variant === undefined) return undefined
    const parent = this.runtime.problems.get(learner, variant.variant.parentProblemId)
    return {
      parentProblemId: variant.variant.parentProblemId,
      parentTitle: parent?.title ?? { zh: variant.variant.parentProblemId, en: variant.variant.parentProblemId },
      differences: variant.variant.differences,
      transfer: variant.variant.transfer,
    }
  }

  /**
   * Complete the current due cycle of an item with a graded review submission.
   * @param learner - learner.
   * @param itemId - review item.
   * @param attemptId - graded submission made in review context for this item.
   * @param recall - optional self-rated recall.
   * @returns the schedule change; a repeated completion returns the first result with `duplicate: true`.
   */
  complete(learner: LearnerId, itemId: ReviewItemId, attemptId: AttemptId, recall: RecallRating | undefined): ReviewCompletion {
    const today = this.runtime.today(learner)
    const ladder = this.runtime.settings(learner).reviewLadderDays
    return this.runtime.store.atomic((): ReviewCompletion => {
      const item = this.runtime.store.reviewItem(learner, itemId)
      if (item === undefined) throw new LearnError('not-found', 'Unknown review item')
      const attempt = this.runtime.store.attempt(learner, attemptId)
      if (attempt?.kind !== 'submit' || attempt.context !== 'review') throw new LearnError('invalid',
        'Complete a review with a submission made in review mode')
      const priorKey = this.runtime.store.completionForAttempt(learner, attemptId)
      if (priorKey !== undefined) {
        const after = priorKey.after as { dueDate: string; intervalDays: number; step: number }
        const before = priorKey.before as { dueDate: string }
        return { itemId, duplicate: true, previousDueDate: before.dueDate, nextDueDate: after.dueDate, intervalDays: after.intervalDays,
          step: after.step, reason: priorKey.reason, ...this.withReveal(learner, priorKey.variant) }
      }
      const key = `complete:${itemId}:${item.dueDate}`
      const prior = this.runtime.store.reviewEventByKey(learner, key)
      if (prior !== undefined) {
        const after = prior.after as { dueDate: string; intervalDays: number; step: number }
        return { itemId, duplicate: true, previousDueDate: item.dueDate, nextDueDate: after.dueDate, intervalDays: after.intervalDays,
          step: after.step, reason: prior.reason, ...this.withReveal(learner, prior.variant) }
      }
      if (item.dueDate > today) throw new LearnError('conflict', `This review is not due until ${item.dueDate}`)
      const assigned = this.runtime.store.assignment(item.id, item.dueDate)
      if (assigned !== undefined && attempt.problemId !== assigned) throw new LearnError('invalid',
        'The submission is for a different exercise than the assigned variant')
      const grade = gradeOf(attempt.verdict)
      if (grade === undefined) throw new LearnError('invalid',
        'The submission has no graded verdict; run it again when evaluation is available')
      const decision = nextSchedule(item, { result: grade, support: attempt.support, ...recall === undefined ? {} : { recall } }, ladder,
        today)
      const next: ReviewItemRow = {
        ...item, step: decision.state.step, intervalDays: decision.state.intervalDays,
        reps: decision.state.reps, lapses: decision.state.lapses,
        dueDate: decision.dueDate, lastReason: decision.reason, lastReviewedAt: this.runtime.iso(),
      }
      const event = {
        learner, item: item.id, topic: item.topicId, kind: 'completed' as const, attempt: attemptId, localDate: today,
        variant: attempt.problemId,
        before: stateOf(item), after: { ...stateOf(next), result: grade, support: attempt.support,
          ...recall === undefined ? {} : { recall } },
        reason: decision.reason, now: this.runtime.iso(),
      }
      this.runtime.store.insertReviewEvent({ ...event, key })
      this.runtime.store.updateReviewItem(next)
      return { itemId, duplicate: false, previousDueDate: item.dueDate, nextDueDate: next.dueDate, intervalDays: next.intervalDays,
        step: next.step, reason: decision.reason, ...this.withReveal(learner, attempt.problemId) }
    })
  }

  private withReveal(learner: LearnerId, variant: ProblemId | undefined): { reveal?: VariantReveal } {
    const reveal = this.reveal(learner, variant)
    return reveal === undefined ? {} : { reveal }
  }

  /**
   * Move an item to a later local date.
   * @param learner - learner.
   * @param itemId - item.
   * @param target - `{ days }` from today or an explicit `{ date }` not before today.
   * @param requestKey - client idempotency key.
   * @returns the new due date.
   */
  move(learner: LearnerId, itemId: ReviewItemId, target: { days: number } | { date: string },
    requestKey: string): { dueDate: string; duplicate: boolean } {
    if (!/^[A-Za-z0-9-]{8,80}$/.test(requestKey)) throw new LearnError('invalid', 'Invalid idempotency key')
    const today = this.runtime.today(learner)
    return this.runtime.store.atomic(() => {
      const item = this.runtime.store.reviewItem(learner, itemId)
      if (item === undefined) throw new LearnError('not-found', 'Unknown review item')
      const kind = 'days' in target ? 'snoozed' as const : 'rescheduled' as const
      const key = `${kind}:${itemId}:${requestKey}`
      const prior = this.runtime.store.reviewEventByKey(learner, key)
      if (prior !== undefined) return { dueDate: (prior.after as { dueDate: string }).dueDate, duplicate: true }
      let dueDate: string
      if ('days' in target) {
        if (!Number.isSafeInteger(target.days) || target.days < 1 || target.days > 30) throw new LearnError('invalid',
          'Snooze between 1 and 30 days')
        dueDate = addDays(item.dueDate > today ? item.dueDate : today, target.days)
      } else {
        if (!isCalendarDate(target.date) || target.date < today || daysBetween(today, target.date) > 365) throw new LearnError('invalid',
          'Choose a date between today and one year from now')
        dueDate = target.date
      }
      const reason: Localized = kind === 'snoozed'
        ? { zh: `你将复习推迟到 ${dueDate}，间隔档位不变。`, en: `You snoozed this review to ${dueDate}; the interval step is unchanged.` }
        : { zh: `你把复习改期到 ${dueDate}，间隔档位不变。`, en: `You rescheduled this review to ${dueDate}; the interval step is unchanged.` }
      const next: ReviewItemRow = { ...item, dueDate, lastReason: reason }
      this.runtime.store.insertReviewEvent({ learner, item: itemId, topic: item.topicId, kind, key, localDate: today,
        before: stateOf(item), after: stateOf(next), reason, now: this.runtime.iso() })
      this.runtime.store.updateReviewItem(next)
      return { dueDate, duplicate: false }
    })
  }
}
