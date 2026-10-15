/** Progress: a LeetCode-style practice record, concept mastery, mistake patterns, review history, and recent submissions. */
import type { Difficulty, PracticeStats } from '@deepseek-ai/dsh-experimental-learn/types'
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
          <Record stats={data.stats} />
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

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard']

/** Solved ring split by difficulty, like LeetCode's profile. */
function SolvedRing({ stats }: { stats: PracticeStats }) {
  const { t } = useLearn()
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const { solved, total, byDifficulty } = stats.solved
  let offset = 0
  return (
    <div className={css.solvedRing}>
      <svg viewBox="0 0 128 128" width="128" height="128" role="img" aria-label={t('record.solvedOf', { solved, total })}>
        <circle cx="64" cy="64" r={radius} fill="none" className={css.ringTrack} strokeWidth="8" />
        {DIFFICULTIES.map((difficulty) => {
          const length = total === 0 ? 0 : byDifficulty[difficulty].solved / total * circumference
          const arc = <circle key={difficulty} cx="64" cy="64" r={radius} fill="none" strokeWidth="8" data-difficulty={difficulty} className={css.ringArc}
            strokeDasharray={`${String(length)} ${String(circumference)}`} strokeDashoffset={-offset} transform="rotate(-90 64 64)" />
          offset += length
          return arc
        })}
        <text x="64" y="62" textAnchor="middle" className={css.ringValue}>{solved}</text>
        <text x="64" y="82" textAnchor="middle" className={css.ringLabel}>/{total}</text>
      </svg>
      <ul className={css.difficultyBars}>
        {DIFFICULTIES.map(difficulty => (
          <li key={difficulty} data-difficulty={difficulty}>
            <span className={css.difficulty} data-difficulty={difficulty}>{t(`difficulty.${difficulty}`)}</span>
            <span><strong>{byDifficulty[difficulty].solved}</strong><span className={css.muted}>/{byDifficulty[difficulty].total}</span></span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** One year of daily submissions, Sunday-first weeks, oldest on the left. */
function Heatmap({ stats }: { stats: PracticeStats }) {
  const { t, locale } = useLearn()
  const counts = new Map(stats.calendar.map(item => [item.date, item.count]))
  const end = new Date(`${stats.today}T00:00:00Z`)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 364 - start.getUTCDay())
  const cells: { date: string; count: number; x: number; y: number }[] = []
  for (let day = new Date(start), index = 0; day <= end; day.setUTCDate(day.getUTCDate() + 1), index++) {
    const date = day.toISOString().slice(0, 10)
    cells.push({ date, count: counts.get(date) ?? 0, x: Math.floor(index / 7), y: index % 7 })
  }
  const weeks = (cells.at(-1)?.x ?? 0) + 1
  // Label a column when its first day starts a new month, as LeetCode does.
  const months = cells.filter(cell => cell.y === 0 && cell.date.slice(8) <= '07').map(cell => ({ x: cell.x,
    label: new Date(`${cell.date}T00:00:00Z`).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', timeZone: 'UTC' }) }))
  const level = (count: number): number => count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4
  return (
    <div className={css.heatmapWrap}>
      <svg viewBox={`0 -14 ${String(weeks * 13)} ${String(7 * 13 + 14)}`} className={css.heatmap} role="img"
        aria-label={t('record.heatmap', { count: stats.calendar.reduce((sum, item) => sum + item.count, 0) })}>
        {months.map(month => <text key={month.x} x={month.x * 13} y={-4} className={css.heatMonth}>{month.label}</text>)}
        {cells.map(cell => (
          <rect key={cell.date} x={cell.x * 13} y={cell.y * 13} width="10" height="10" rx="2" data-level={level(cell.count)} className={css.heatCell}>
            <title>{t('record.cell', { count: cell.count, date: cell.date })}</title>
          </rect>
        ))}
      </svg>
    </div>
  )
}

/** LeetCode-style practice record: solved counts, submissions, activity, streaks, and recent passes. */
function Record({ stats }: { stats: PracticeStats }) {
  const { t, locale, overview, navigate } = useLearn()
  const rate = stats.submissions.total === 0 ? '—' : `${(stats.submissions.passed / stats.submissions.total * 100).toFixed(1)}%`
  const yearly = stats.calendar.reduce((sum, item) => sum + item.count, 0)
  return (
    <>
      <div className={css.recordTop} data-span="wide">
        <section className={css.card}>
          <h3>{t('record.solved')}</h3>
          <SolvedRing stats={stats} />
        </section>
        <section className={css.card}>
          <h3>{t('record.submissions')}</h3>
          <dl className={css.statList}>
            <div><dt>{t('record.total')}</dt><dd>{stats.submissions.total}</dd></div>
            <div><dt>{t('record.acceptance')}</dt><dd>{rate}</dd></div>
            <div><dt>{t('record.activeDays')}</dt><dd>{stats.activeDays}</dd></div>
            <div><dt>{t('record.streak')}</dt><dd>{stats.streak.current}</dd></div>
            <div><dt>{t('record.longest')}</dt><dd>{stats.streak.longest}</dd></div>
          </dl>
          <p className={css.muted}>{t('record.acceptanceNote')}</p>
        </section>
      </div>
      <section className={css.card} data-span="wide">
        <div className={css.row}>
          <h3>{t('record.activity', { count: yearly })}</h3>
          <span className={css.spacer} />
          <span className={css.muted}>{t('record.activeSummary', { days: stats.activeDays, streak: stats.streak.longest })}</span>
        </div>
        <Heatmap stats={stats} />
      </section>
      <section className={css.card} data-span="wide">
        <h3>{t('record.recent')}</h3>
        {stats.recentPassed.length === 0 ? <p className={css.muted}>{t('record.noRecent')}</p> : (
          <ul className={css.list}>
            {stats.recentPassed.map((item) => {
              const problem = overview.problems.find(entry => entry.id === item.problemId)
              return (
                <li key={item.problemId} className={css.listRow}>
                  <button type="button" className={css.problemLink} onClick={() => { navigate({ tab: 'practice', problemId: item.problemId, mode: 'practice' }) }}>
                    {problem?.leetcode !== undefined && `${String(problem.leetcode.frontendId)}. `}{problem === undefined ? item.problemId : pick(problem.title, locale)}
                  </button>
                  <span className={css.spacer} />
                  <span className={css.muted}>{when(item.at, locale)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}
