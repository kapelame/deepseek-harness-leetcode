/** Review: today's variant queue, upcoming items, snooze/reschedule, generation, and the variant library. */
import { useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { randomUUID } from '@deepseek-ai/dsh-util-crypto'
import type { ReviewQueueEntry } from '@deepseek-ai/dsh-experimental-learn/types'
import { Workspace } from './Workspace.tsx'
import { ValidationReport } from './PracticeTab.tsx'
import { Chip, Loaded, messageOf, pick, useAsync, useLearn } from './shared.tsx'
import css from './Learn.module.css'

/**
 * Render the queue or the review workspace.
 * @returns the section.
 */
export function ReviewTab() {
  const { route, navigate } = useLearn()
  if (route.problemId !== undefined && route.reviewItemId !== undefined) {
    return <Workspace problemId={route.problemId} context="review" reviewItemId={route.reviewItemId} onBack={() => { navigate({ tab: 'review' }) }} />
  }
  return <Queue />
}

function Queue() {
  const { api, t } = useLearn()
  const [key, setKey] = useState(0)
  const queue = useAsync(() => api.reviewQueue(), String(key))
  const variants = useAsync(() => api.variants(), String(key))
  const refresh = (): void => { setKey(value => value + 1) }
  return (
    <Loaded state={queue} t={t}>
      {data => (
        <div className={css.stack}>
          <h2>{t('review.heading')}</h2>
          <p className={css.muted}>{t('review.summary', { due: data.due.length, limit: data.dailyLimit,
            done: data.completedToday })} · {data.today} ({data.timezone})</p>
          {data.deferred > 0 && <p className={css.note}>{t('review.deferred', { count: data.deferred })}</p>}
          {data.due.length === 0 && <p className={css.muted}>{t('review.empty')}</p>}
          {data.due.map(entry => <Entry key={entry.itemId} entry={entry} due onChanged={refresh} />)}
          <h3>{t('review.upcoming')}</h3>
          {data.upcoming.length === 0 && <p className={css.muted}>{t('review.noUpcoming')}</p>}
          {data.upcoming.map(entry => <Entry key={entry.itemId} entry={entry} due={false} onChanged={refresh} />)}
          <details className={css.card}>
            <summary>{t('review.variants')}</summary>
            {variants.data?.map(record => <ValidationReport key={record.id} record={record} />)}
          </details>
        </div>
      )}
    </Loaded>
  )
}

function Entry({ entry, due, onChanged }: { entry: ReviewQueueEntry; due: boolean; onChanged: () => void }) {
  const { api, t, locale, overview, navigate } = useLearn()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | undefined>()
  const [date, setDate] = useState(entry.dueDate)
  const topic = overview.topics.find(item => item.id === entry.topicId)
  const variantId = entry.variantId
  const move = (target: { days: number } | { date: string }): void => {
    setBusy(true)
    api.moveReview(entry.itemId, target, randomUUID()).then(onChanged, (failure: unknown) => { setMessage(t('failed',
      { message: messageOf(failure) })) }).finally(() => { setBusy(false) })
  }
  const generate = (): void => {
    setBusy(true)
    setMessage(t('review.generating'))
    api.generateVariant(entry.parentProblemId, AbortSignal.timeout(600_000)).then((result) => { setMessage(t('review.generateResult',
      { message: result.message })); onChanged() }, (failure: unknown) => { setMessage(t('failed', { message: messageOf(failure) })) })
      .finally(() => { setBusy(false) })
  }
  return (
    <div className={css.card}>
      <div className={css.row}>
        <strong className={css.cardTitle}>{topic === undefined ? entry.topicId : pick(topic.title, locale)}</strong>
        {entry.variantOrigin !== undefined && <Chip tone="outline">{t(`review.origin.${entry.variantOrigin}`)}</Chip>}
        <span className={css.spacer} />
        <span className={css.muted}>{due && entry.overdueDays > 0 ? t('review.overdue', { days: entry.overdueDays }) : t('review.due',
          { date: entry.dueDate })}</span>
      </div>
      <div className={css.row}>
        <span className={css.muted}>{t('review.estimate', { minutes: entry.estimatedMinutes })} · {t('review.interval',
          { days: entry.intervalDays })}</span>
      </div>
      {entry.lastReason !== undefined && <p className={css.muted}>{pick(entry.lastReason, locale)}</p>}
      <div className={css.row}>
        {due && (variantId === undefined
          ? <span className={css.muted}>{t('review.noVariant')}</span>
          : <Button variant="primary" size="sm" onClick={() => { navigate({ tab: 'review', problemId: variantId,
            reviewItemId: entry.itemId, mode: 'review' }) }}>{t('review.start')}</Button>)}
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => { move({ days: 1 }) }}>{t('review.snooze')}</Button>
        <label className={css.inline}>
          <span className={css.muted}>{t('review.rescheduleTo')}</span>
          <input className={css.select} type="date" value={date} onChange={(event) => { setDate(event.target.value) }} />
        </label>
        <Button variant="ghost" size="sm" disabled={busy || date === entry.dueDate} onClick={() => { move({ date }) }}>{t('review.reschedule')}</Button>
        <span className={css.spacer} />
        {overview.tutor.configured && <Button variant="ghost" size="sm" disabled={busy} onClick={generate}>{t('review.generate')}</Button>}
      </div>
      {message !== undefined && <p className={css.note} role="status">{message}</p>}
    </div>
  )
}
