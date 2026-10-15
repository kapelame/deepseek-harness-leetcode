/**
 * Read-side projections: concept mastery, problem status, mistake patterns,
 * and the Today dashboard. Mastery is per topic and weighs evidence by how
 * much help preceded it; "mastered" additionally requires passed reviews.
 */
import type {
  ActivityItem, Difficulty, LearnerId, LessonProgress, MistakePattern, PracticeStats, ProblemId, ProblemStatus, TodayView, TopicId, TopicMastery,
} from './types.ts'
import type { GradedSubmission } from './store/store.ts'
import { gradeOfKind } from './judging.ts'
import { addDays, localDate } from './review/dates.ts'
import type { LearnRuntime } from './runtime.ts'

const WEIGHTS = { independent: 25, 'with-hints': 14, 'studied-solution': 6, failed: -3, reviewPassed: 15, reviewFailed: -8 } as const

/**
 * Status of one problem from its submissions.
 * @param submissions - graded submissions of that problem.
 * @returns problem status.
 */
export function problemStatus(submissions: readonly GradedSubmission[]): ProblemStatus {
  if (submissions.length === 0) return 'new'
  const passed = submissions.filter(item => item.verdictKind === 'passed-local-tests')
  if (passed.some(item => item.support === 'independent')) return 'solved'
  if (passed.length > 0) return 'solved-with-help'
  return 'attempted'
}

/** Mastery, status, and dashboard projections. */
export class Progress {
  constructor(private readonly runtime: LearnRuntime) {}

  /**
   * Status per problem.
   * @param learner - learner.
   * @returns status keyed by problem id.
   */
  statuses(learner: LearnerId): Map<ProblemId, ProblemStatus> {
    const byProblem = new Map<ProblemId, GradedSubmission[]>()
    for (const submission of this.runtime.store.gradedSubmissions(learner)) {
      const list = byProblem.get(submission.problemId) ?? []
      list.push(submission)
      byProblem.set(submission.problemId, list)
    }
    return new Map([...byProblem].map(([id, list]) => [id, problemStatus(list)]))
  }

  /**
   * LeetCode-style practice record over the learner's problem bank (variants excluded).
   * @param learner - learner.
   * @returns solved counts, submission totals, a one-year activity calendar, and streaks.
   */
  stats(learner: LearnerId): PracticeStats {
    const timezone = this.runtime.settings(learner).timezone
    const today = this.runtime.today(learner)
    const statuses = this.statuses(learner)
    const byDifficulty: Record<Difficulty, { solved: number; total: number }> = { easy: { solved: 0, total: 0 }, medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 } }
    for (const problem of this.runtime.problems.all(learner)) {
      if (problem.variant !== undefined) continue
      const bucket = byDifficulty[problem.difficulty]
      bucket.total++
      const status = statuses.get(problem.id)
      if (status === 'solved' || status === 'solved-with-help') bucket.solved++
    }
    const submissions = this.runtime.store.gradedSubmissions(learner)
    const perDay = new Map<string, number>()
    for (const submission of submissions) {
      const date = localDate(new Date(submission.createdAt), timezone)
      perDay.set(date, (perDay.get(date) ?? 0) + 1)
    }
    const start = addDays(today, -364)
    const calendar = [...perDay].filter(([date]) => date >= start && date <= today).sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
    const days = [...perDay.keys()].sort()
    let longest = 0
    let run = 0
    let previous: string | undefined
    for (const date of days) {
      run = previous !== undefined && addDays(previous, 1) === date ? run + 1 : 1
      longest = Math.max(longest, run)
      previous = date
    }
    let current = 0
    // A streak still counts today until the day ends, so it may end yesterday.
    for (let day = perDay.has(today) ? today : addDays(today, -1); perDay.has(day); day = addDays(day, -1)) current++
    const recentPassed: { problemId: ProblemId; at: string }[] = []
    for (const submission of [...submissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
      if (submission.verdictKind !== 'passed-local-tests' || recentPassed.some(item => item.problemId === submission.problemId)) continue
      if (this.runtime.problems.get(learner, submission.problemId)?.variant !== undefined) continue
      recentPassed.push({ problemId: submission.problemId, at: submission.createdAt })
      if (recentPassed.length >= 10) break
    }
    const solved = byDifficulty.easy.solved + byDifficulty.medium.solved + byDifficulty.hard.solved
    return {
      today,
      solved: { solved, total: byDifficulty.easy.total + byDifficulty.medium.total + byDifficulty.hard.total, byDifficulty },
      submissions: { total: submissions.length, passed: submissions.filter(item => item.verdictKind === 'passed-local-tests').length },
      calendar,
      activeDays: calendar.length,
      streak: { current, longest },
      recentPassed,
    }
  }

  /**
   * Mastery per topic.
   * @param learner - learner.
   * @returns one entry per curriculum topic.
   */
  mastery(learner: LearnerId): TopicMastery[] {
    const lessons = new Map(this.runtime.store.lessons(learner).map(item => [item.topicId, item]))
    const submissions = this.runtime.store.gradedSubmissions(learner)
    const reviews = this.runtime.store.reviewOutcomes(learner)
    return this.runtime.problems.curriculum.topics.map((topic): TopicMastery => {
      const own = submissions.filter((item) => {
        const definition = this.runtime.problems.get(learner, item.problemId)
        return definition !== undefined && definition.topics.includes(topic.id) && item.context !== 'review'
      })
      const solvedBy = (support: GradedSubmission['support']): number => new Set(own.filter(item => item.verdictKind === 'passed-local-tests' && item.support === support).map(item => item.problemId)).size
      const independentSolves = solvedBy('independent')
      const assistedSolves = solvedBy('with-hints')
      const studiedSolutions = solvedBy('studied-solution')
      const failedAttempts = own.filter(item => gradeOfKind(item.verdictKind) === 'failed').length
      const topicReviews = reviews.filter(item => item.topicId === topic.id)
      const reviewsPassed = topicReviews.filter(item => item.passed).length
      const reviewsFailed = topicReviews.length - reviewsPassed
      const raw = independentSolves * WEIGHTS.independent + assistedSolves * WEIGHTS['with-hints'] + studiedSolutions * WEIGHTS['studied-solution']
        + Math.min(10, failedAttempts) * WEIGHTS.failed + reviewsPassed * WEIGHTS.reviewPassed + reviewsFailed * WEIGHTS.reviewFailed
        + (lessons.get(topic.id)?.stage === 'complete' ? 10 : 0)
      const score = Math.max(0, Math.min(reviewsPassed >= 2 ? 100 : 84, raw))
      const started = own.length > 0 || lessons.has(topic.id) || topicReviews.length > 0
      const level: TopicMastery['level'] = !started ? 'not-started' : score >= 85 ? 'mastered' : score >= 60 ? 'proficient' : score >= 30 ? 'practicing' : 'learning'
      return { topicId: topic.id, score, level, independentSolves, assistedSolves, studiedSolutions, failedAttempts, reviewsPassed,
        reviewsFailed }
    })
  }

  /**
   * Aggregated mistake tags.
   * @param learner - learner.
   * @returns patterns ordered by frequency.
   */
  mistakes(learner: LearnerId): MistakePattern[] {
    const patterns = new Map<string, { count: number; lastSeen: string; topics: Set<TopicId> }>()
    for (const row of this.runtime.store.mistakeTags(learner)) {
      const entry = patterns.get(row.tag) ?? { count: 0, lastSeen: row.createdAt, topics: new Set<TopicId>() }
      entry.count++
      entry.lastSeen = row.createdAt > entry.lastSeen ? row.createdAt : entry.lastSeen
      entry.topics.add(row.topicId)
      patterns.set(row.tag, entry)
    }
    return [...patterns].map(([tag, entry]) => ({ tag, count: entry.count, lastSeen: entry.lastSeen, topics: [...entry.topics] }))
      .sort((left, right) => right.count - left.count)
  }

  private nextLesson(learner: LearnerId, lessons: readonly LessonProgress[]): TodayView['nextLesson'] {
    const byTopic = new Map(lessons.map(item => [item.topicId, item]))
    const experienced = this.runtime.settings(learner).experience === 'experienced'
    for (const topic of this.runtime.problems.curriculum.topics) {
      const progress = byTopic.get(topic.id)
      if (progress?.stage === 'complete') continue
      const ready = experienced || topic.prerequisites.every(item => byTopic.get(item)?.stage === 'complete')
      if (ready) return { topicId: topic.id, stage: progress?.stage ?? 'motivation' }
    }
    return undefined
  }

  /**
   * Today dashboard.
   * @param learner - learner.
   * @param reviewsDue - due reviews within today's limit.
   * @returns dashboard projection.
   */
  today(learner: LearnerId, reviewsDue: number): TodayView {
    const settings = this.runtime.settings(learner)
    const today = this.runtime.today(learner)
    const lessons = this.runtime.store.lessons(learner)
    const statuses = this.statuses(learner)
    const nextLesson = this.nextLesson(learner, lessons)
    const nextProblem = this.runtime.problems.curriculum.topics.flatMap(topic => topic.problems).find(id => statuses.get(id) !== 'solved')
    const attempts = this.runtime.store.attempts(learner, undefined, 40)
    const todayAttempts = attempts.filter(item => localDate(new Date(item.createdAt), settings.timezone) === today)
    const recent: ActivityItem[] = attempts.slice(0, 8).map((attempt) => {
      const definition = this.runtime.problems.get(learner, attempt.problemId)
      return {
        kind: 'attempt', title: definition?.title ?? { zh: attempt.problemId, en: attempt.problemId },
        detail: `${attempt.kind}:${attempt.verdict?.kind ?? attempt.status}`, at: attempt.createdAt, problemId: attempt.problemId,
      }
    })
    return {
      today,
      ...nextLesson === undefined ? {} : { nextLesson },
      ...nextProblem === undefined ? {} : { nextProblem },
      reviewsDue,
      reviewsCompletedToday: this.runtime.store.completedReviewsOn(learner, today),
      dailyLimit: settings.reviewDailyLimit,
      dailyGoalMinutes: settings.dailyGoalMinutes,
      minutesToday: Math.min(settings.dailyGoalMinutes * 3,
        todayAttempts.filter(item => item.kind === 'submit').length * 8 + todayAttempts.filter(item => item.kind === 'run').length * 2),
      recent,
    }
  }
}
