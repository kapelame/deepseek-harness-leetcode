/** Today: next lesson, due reviews, daily goal, suggested problem, and recent activity. */
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { DifficultyBadge, Loaded, pick, useAsync, useLearn, when } from './shared.tsx'
import css from './Learn.module.css'

/**
 * Render the Today dashboard.
 * @returns the dashboard.
 */
export function TodayTab() {
  const { api, t, locale, overview, navigate } = useLearn()
  const state = useAsync(() => api.today(), 'today')
  const activityDetail = (detail: string): string => {
    const [kind, outcome] = detail.split(':')
    const verdicts = ['passed-local-tests', 'wrong-answer', 'compile-error', 'runtime-error', 'time-limit-exceeded',
      'memory-limit-exceeded', 'output-limit-exceeded', 'evaluation-unavailable', 'cancelled'] as const
    const verdict = verdicts.find(item => item === outcome)
    return `${kind === 'run' ? t('ws.run') : t('ws.submit')} · ${verdict === undefined ? outcome ?? '' : t(`verdict.${verdict}`)}`
  }
  return (
    <Loaded state={state} t={t}>
      {(today) => {
        const topic = overview.topics.find(item => item.id === today.nextLesson?.topicId)
        const problem = overview.problems.find(item => item.id === today.nextProblem)
        return (
          <div className={css.grid}>
            <section className={css.card}>
              <h3>{t('today.nextLesson')}</h3>
              {topic === undefined || today.nextLesson === undefined
                ? <p className={css.muted}>{t('today.allLessons')}</p>
                : (
                  <>
                    <p className={css.cardTitle}>{pick(topic.title, locale)}</p>
                    <p className={css.muted}>{t(`stage.${today.nextLesson.stage}`)}</p>
                    <Button variant="primary" onClick={() => { navigate({ tab: 'learn', topicId: topic.id }) }}>
                      {today.nextLesson.stage === 'motivation' ? t('today.start') : t('today.continue')}
                    </Button>
                  </>
                )}
            </section>
            <section className={css.card}>
              <h3>{t('today.reviews')}</h3>
              <p className={css.cardTitle}>{t('today.reviewsValue', { due: today.reviewsDue, done: today.reviewsCompletedToday,
                limit: today.dailyLimit })}</p>
              {today.reviewsDue > 0
                ? <Button variant="primary" onClick={() => { navigate({ tab: 'review' }) }}>{t('today.reviewNow')}</Button>
                : <p className={css.muted}>{t('today.noReviews')}</p>}
            </section>
            <section className={css.card}>
              <h3>{t('today.goal')}</h3>
              <div className={css.meter} role="progressbar" aria-valuemin={0} aria-valuemax={today.dailyGoalMinutes} aria-valuenow={Math.min(today.minutesToday, today.dailyGoalMinutes)}>
                <div className={css.meterFill} style={{ width: `${String(Math.min(100, Math.round(today.minutesToday / today.dailyGoalMinutes * 100)))}%` }} />
              </div>
              <p className={css.muted}>{t('today.goalValue', { minutes: today.minutesToday, goal: today.dailyGoalMinutes })}</p>
            </section>
            {problem !== undefined && (
              <section className={css.card}>
                <h3>{t('today.nextProblem')}</h3>
                <button type="button" className={css.problemLink} onClick={() => { navigate({ tab: 'practice', problemId: problem.id,
                  mode: 'practice' }) }}>
                  {problem.leetcode !== undefined && `${String(problem.leetcode.frontendId)}. `}{pick(problem.title, locale)}
                </button>
                <DifficultyBadge difficulty={problem.difficulty} />
              </section>
            )}
            <section className={css.card} data-span="wide">
              <h3>{t('today.recent')}</h3>
              {today.recent.length === 0
                ? <p className={css.muted}>{t('today.empty')}</p>
                : (
                  <ul className={css.list}>
                    {today.recent.map((item, index) => (
                      <li key={index} className={css.listRow}>
                        <span>{pick(item.title, locale)}</span>
                        <span className={css.muted}>{activityDetail(item.detail)}</span>
                        <span className={css.spacer} />
                        <span className={css.muted}>{when(item.at, locale)}</span>
                      </li>
                    ))}
                  </ul>
                )}
            </section>
          </div>
        )
      }}
    </Loaded>
  )
}
