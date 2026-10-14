/**
 * Transparent spaced-repetition policy over a configurable interval ladder
 * (default 1/3/7/14/30 days). Each decision returns a localized reason that
 * is stored with the review event.
 */
import type { Localized, RecallRating, SupportLevel } from '../types.ts'
import { addDays } from './dates.ts'

/** Mutable schedule state of one review item. */
export interface ScheduleState {
  /** Index into the ladder. */
  readonly step: number
  readonly intervalDays: number
  readonly reps: number
  readonly lapses: number
}

/** Evidence from one completed review or practice submission. */
export interface ReviewEvidence {
  readonly result: 'passed' | 'failed'
  readonly support: SupportLevel
  readonly recall?: RecallRating
}

/** Scheduling decision. */
export interface ScheduleDecision {
  readonly state: ScheduleState
  readonly dueDate: string
  readonly reason: Localized
}

function clampStep(step: number, ladder: readonly number[]): number {
  return Math.max(0, Math.min(ladder.length - 1, step))
}

function decide(state: ScheduleState, step: number, ladder: readonly number[], today: string, reason: Localized,
  lapse: boolean): ScheduleDecision {
  const clamped = clampStep(step, ladder)
  const intervalDays = ladder[clamped] as number
  return {
    state: { step: clamped, intervalDays, reps: state.reps + 1, lapses: state.lapses + (lapse ? 1 : 0) },
    dueDate: addDays(today, intervalDays),
    reason: {
      zh: `${reason.zh}下次复习间隔 ${String(intervalDays)} 天。`,
      en: `${reason.en} Next review in ${String(intervalDays)} day${intervalDays === 1 ? '' : 's'}.`,
    },
  }
}

/**
 * Compute the next schedule after a review outcome.
 * @param state - current item state.
 * @param evidence - verdict, support level, and optional self-rated recall.
 * @param ladder - ascending interval ladder in days.
 * @param today - learner-local completion date.
 * @returns the next state, due date, and reason.
 */
export function nextSchedule(state: ScheduleState, evidence: ReviewEvidence, ladder: readonly number[], today: string): ScheduleDecision {
  if (evidence.result === 'failed') {
    return decide(state, 0, ladder, today, { zh: '本次复习未通过本地测试，回到第一档。',
      en: 'The review did not pass local tests, so it restarts at the first interval.' }, true)
  }
  if (evidence.recall === 'again') {
    return decide(state, 0, ladder, today, { zh: '你选择了“需要重来”，回到第一档。',
      en: 'You rated recall as "again", so it restarts at the first interval.' }, true)
  }
  if (evidence.support === 'studied-solution') {
    return decide(state, 0, ladder, today, { zh: '查看了解答后才完成，需要尽快独立再做一次。',
      en: 'You completed it after studying the solution, so it returns soon for an independent attempt.' }, false)
  }
  if (evidence.support === 'with-hints') {
    const step = evidence.recall === 'hard' ? state.step - 1 : state.step
    return decide(state, step, ladder, today, { zh: '借助提示通过，间隔保持不变。', en: 'Passed with hints, so the interval does not grow.' }, false)
  }
  switch (evidence.recall) {
    case 'hard': return decide(state, state.step, ladder, today, { zh: '独立通过但感觉吃力，间隔保持不变。',
      en: 'Passed independently but felt hard, so the interval stays the same.' }, false)
    case 'easy': return decide(state, state.step + 2, ladder, today, { zh: '独立通过且感觉轻松，跳过一档。',
      en: 'Passed independently and felt easy, so it skips one interval.' }, false)
    case 'good':
    case undefined:
      return decide(state, state.step + 1, ladder, today, { zh: '独立通过，进入下一档。',
        en: 'Passed independently, so it moves to the next interval.' }, false)
    default: {
      const unreachable: never = evidence.recall
      return unreachable
    }
  }
}

/**
 * Create the first schedule after the learner's first graded submission on a problem.
 * @param evidence - first submission evidence.
 * @param ladder - interval ladder.
 * @param today - learner-local date.
 * @returns the initial decision; the first review is always at the first interval.
 */
export function initialSchedule(evidence: ReviewEvidence, ladder: readonly number[], today: string): ScheduleDecision {
  const reason: Localized = evidence.result === 'passed' && evidence.support === 'independent'
    ? { zh: '首次独立解出，安排一次变体复习来检验迁移。', en: 'First independent solve; a variant review checks that the idea transfers.' }
    : evidence.result === 'passed'
      ? { zh: '在帮助下首次通过，安排变体复习巩固概念。', en: 'First pass with help; a variant review reinforces the concept.' }
      : { zh: '首次提交未通过，安排变体复习再次练习这个概念。', en: 'The first submission did not pass; a variant review revisits the concept.' }
  return decide({ step: 0, intervalDays: ladder[0] as number, reps: -1, lapses: 0 }, 0, ladder, today, reason, false)
}

/**
 * Validate an interval ladder.
 * @param ladder - candidate ladder.
 * @returns whether it is non-empty, positive, integral, and strictly ascending.
 */
export function isValidLadder(ladder: readonly number[]): boolean {
  return ladder.length > 0 && ladder.length <= 12 && ladder.every((days, index) =>
    Number.isSafeInteger(days) && days > 0 && days <= 365 && (index === 0 || days > (ladder[index - 1] as number)))
}
