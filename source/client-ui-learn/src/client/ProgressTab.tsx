/** Progress: concept mastery, mistake patterns, review history, and recent submissions. */
import { Loaded, pick, useAsync, useLearn, VerdictLabel, when } from './shared.tsx'
import css from './Learn.module.css'

/**
 * Render progress.
 * @returns the section.
 */
export function ProgressTab() {
  const { api, t, locale, overview } = useLearn()
  const state = useAsync(() => api.progress(), 'progress')
  const title = (id: string): string => pick(overview.topics.find(item => item.id === id)?.title ?? { zh: id, en: id }, locale)
  return (
    <Loaded state={state} t={t}>
      {data => (
        <div className={css.grid}>
          <section className={css.card} data-span="wide">
            <h3>{t('progress.mastery')}</h3>
            {data.mastery.map(item => (
              <div key={item.topicId} className={css.masteryRow}>
                <span className={css.masteryName}>{title(item.topicId)}</span>
                <div className={css.meter} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.score} aria-label={title(item.topicId)}><div className={css.meterFill} style={{ width: `${String(item.score)}%` }} /></div>
                <span className={css.level} data-level={item.level}>{t(`level.${item.level}`)}</span>
                <span className={css.muted}>{t('progress.evidence', { independent: item.independentSolves, assisted: item.assistedSolves,
                  studied: item.studiedSolutions, passed: item.reviewsPassed, reviews: item.reviewsPassed + item.reviewsFailed })}</span>
              </div>
            ))}
          </section>
          <section className={css.card}>
            <h3>{t('progress.mistakes')}</h3>
            {data.mistakes.length === 0 ? <p className={css.muted}>{t('progress.noMistakes')}</p> : (
              <ul className={css.list}>{data.mistakes.map(item => <li key={item.tag} className={css.listRow}><code>{item.tag}</code><span className={css.muted}>{t('progress.times', { count: item.count })}</span><span className={css.muted}>{item.topics.map(title).join(', ')}</span></li>)}</ul>
            )}
          </section>
          <section className={css.card}>
            <h3>{t('progress.history')}</h3>
            {data.history.length === 0 ? <p className={css.muted}>{t('progress.noHistory')}</p> : (
              <ul className={css.list}>{data.history.map((item,
                index) => <li key={index} className={css.stackRow}><span><strong>{t(`event.${item.kind}`)}</strong> · {title(item.topicId)} · {when(item.createdAt, locale)}</span><span className={css.muted}>{pick(item.reason, locale)}</span></li>)}</ul>
            )}
          </section>
          <section className={css.card} data-span="wide">
            <h3>{t('progress.attempts')}</h3>
            <ul className={css.list}>
              {data.attempts.filter(item => item.kind === 'submit').slice(0, 20).map((item) => {
                const problem = overview.problems.find(entry => entry.id === item.problemId)
                return (
                  <li key={item.id} className={css.listRow}>
                    <span>{problem === undefined ? item.problemId : pick(problem.title, locale)}</span>
                    {item.verdict !== undefined && <VerdictLabel kind={item.verdict.kind} />}
                    <span className={css.muted}>{t(`ws.support.${item.support}`)}</span>
                    <span className={css.spacer} />
                    <span className={css.muted}>{when(item.createdAt, locale)}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      )}
    </Loaded>
  )
}
