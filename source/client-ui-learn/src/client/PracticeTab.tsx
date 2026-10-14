/** Problem catalog with search and filters, the import dialog, and the workspace. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Input, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  CollectionView, Difficulty, FinderEvent, FinderRunView, ProblemId, ProblemStatus, ProblemSummary, TopicId, VariantRecord,
} from '@deepseek-ai/dsh-experimental-learn/types'
import { Workspace } from './Workspace.tsx'
import { Chip, DifficultyBadge, messageOf, pick, useLearn } from './shared.tsx'
import css from './Learn.module.css'

/**
 * Render the catalog or the selected workspace.
 * @returns the section.
 */
export function PracticeTab() {
  const { route, navigate } = useLearn()
  if (route.problemId !== undefined) {
    return <Workspace problemId={route.problemId} context={route.mode ?? 'practice'} {...route.reviewItemId === undefined ? {} : { reviewItemId: route.reviewItemId }} onBack={() => { navigate({ tab: 'practice' }) }} />
  }
  return <Catalog />
}

function Catalog() {
  const { t, locale, overview } = useLearn()
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<TopicId | 'all'>('all')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [status, setStatus] = useState<ProblemStatus | 'all'>('all')
  const [view, setView] = useState<string>('all')
  const [importing, setImporting] = useState(false)
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return overview.problems.filter(problem => (topic === 'all' || problem.topics.includes(topic))
      && (difficulty === 'all' || problem.difficulty === difficulty)
      && (status === 'all' || problem.status === status)
      && (needle === '' || pick(problem.title, locale).toLowerCase().includes(needle) || problem.title.en.toLowerCase().includes(needle)
        || String(problem.leetcode?.frontendId ?? '') === needle || problem.leetcode?.tags.some(tag => tag.toLowerCase().includes(needle)) === true))
  }, [overview.problems, query, topic, difficulty, status, locale])
  const collection = overview.collections.find(item => item.id === view)
  return (
    <div className={css.stack}>
      <div className={css.row} role="group" aria-label={t('practice.view')}>
        <Button variant={view === 'all' ? 'primary' : 'outline'} size="sm" aria-pressed={view === 'all'} onClick={() => { setView('all') }}>{t('practice.view.all')}</Button>
        {overview.collections.map(item => (
          <Button key={item.id} variant={view === item.id ? 'primary' : 'outline'} size="sm" aria-pressed={view === item.id}
            onClick={() => { setView(item.id) }}>{pick(item.title, locale)}</Button>
        ))}
        <span className={css.spacer} />
        <Button variant="outline" size="sm" onClick={() => { setImporting(true) }}>{t('practice.import')}</Button>
      </div>
      {collection === undefined ? (
        <>
          <div className={css.filters}>
            <Input className={css.search ?? ''} value={query} placeholder={t('practice.search')} aria-label={t('practice.search')} onChange={(event) => { setQuery(event.target.value) }} />
            <select className={css.select} aria-label={t('practice.topic')} value={topic} onChange={(event) => { setTopic(event.target.value as TopicId | 'all') }}>
              <option value="all">{t('practice.topic')}: {t('practice.all')}</option>
              {overview.topics.map(item => <option key={item.id} value={item.id}>{pick(item.title, locale)}</option>)}
            </select>
            <select className={css.select} aria-label={t('practice.difficulty')} value={difficulty} onChange={(event) => { setDifficulty(event.target.value as Difficulty | 'all') }}>
              <option value="all">{t('practice.difficulty')}: {t('practice.all')}</option>
              {(['easy', 'medium', 'hard'] as const).map(item => <option key={item} value={item}>{t(`difficulty.${item}`)}</option>)}
            </select>
            <select className={css.select} aria-label={t('practice.status')} value={status} onChange={(event) => { setStatus(event.target.value as ProblemStatus | 'all') }}>
              <option value="all">{t('practice.status')}: {t('practice.all')}</option>
              {(['new', 'attempted', 'solved-with-help',
                'solved'] as const).map(item => <option key={item} value={item}>{t(`status.${item}`)}</option>)}
            </select>
          </div>
          {rows.length === 0 ? <p className={css.muted}>{t('practice.empty')}</p> : <ProblemTable rows={rows} />}
        </>
      ) : <CollectionList collection={collection} />}
      <AddProblemsDialog open={importing} onClose={() => { setImporting(false) }} />
    </div>
  )
}

function ProblemTable({ rows }: { rows: readonly ProblemSummary[] }) {
  const { t, locale, overview, navigate } = useLearn()
  return (
    <div className={css.tableWrap}>
      <table className={css.table}>
        <thead><tr><th scope="col">#</th><th scope="col">{t('ws.description')}</th><th scope="col">{t('practice.topic')}</th><th scope="col">{t('practice.difficulty')}</th><th scope="col">{t('practice.status')}</th></tr></thead>
        <tbody>
          {rows.map(problem => (
            <tr key={problem.id} className={css.clickRow} onClick={() => { navigate({ tab: 'practice', problemId: problem.id,
              mode: 'practice' }) }}>
              <td className={css.muted}>{problem.leetcode?.frontendId ?? '—'}</td>
              <td>
                <button type="button" className={css.problemLink} onClick={(event) => { event.stopPropagation(); navigate({ tab: 'practice', problemId: problem.id, mode: 'practice' }) }}>{pick(problem.title, locale)}</button>
                {problem.kind !== 'leetcode' && <> <Chip tone="outline">{t(`kind.${problem.kind}`)}</Chip></>}
              </td>
              <td>{problem.topics.map(id => pick(overview.topics.find(item => item.id === id)?.title ?? { zh: id, en: id },
                locale).split(/[:：]/)[0]).join(', ')}</td>
              <td><DifficultyBadge difficulty={problem.difficulty} /></td>
              <td><span className={css.status} data-status={problem.status}>{t(`status.${problem.status}`)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CollectionList({ collection }: { collection: CollectionView }) {
  const { t, locale, overview } = useLearn()
  const byId = new Map(overview.problems.map(problem => [problem.id, problem]))
  const solved = (ids: readonly ProblemId[]): number => ids.filter(id => {
    const state = byId.get(id)?.status
    return state === 'solved' || state === 'solved-with-help'
  }).length
  const all = collection.groups.flatMap(group => group.problems)
  const done = solved(all)
  return (
    <div className={css.stack}>
      <div className={css.card}>
        <div className={css.row}>
          <strong className={css.cardTitle}>{pick(collection.title, locale)}</strong>
          <span className={css.spacer} />
          <span>{t('practice.collection.progress', { solved: done, total: all.length })}</span>
        </div>
        <div className={css.meter}><div className={css.meterFill} style={{ width: `${String(all.length === 0 ? 0 : Math.round(done * 100 / all.length))}%` }} /></div>
        <p className={css.muted}>{t('practice.collection.source', { name: collection.source.name, date: collection.source.verifiedAt })}{' '}
          <a href={collection.source.url} target="_blank" rel="noreferrer">{collection.source.url}</a></p>
      </div>
      {collection.groups.map(group => {
        const rows = group.problems.flatMap(id => byId.get(id) ?? [])
        return (
          <section key={group.id} className={css.stack} aria-label={pick(group.title, locale)}>
            <div className={css.row}>
              <h3 className={css.cardTitle}>{pick(group.title, locale)}</h3>
              <span className={css.spacer} />
              <span className={css.muted}>{t('practice.collection.progress', { solved: solved(group.problems), total: group.problems.length })}</span>
            </div>
            <ProblemTable rows={rows} />
          </section>
        )
      })}
    </div>
  )
}

function AddProblemsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { api, t, locale, overview, navigate, refreshOverview } = useLearn()
  const [description, setDescription] = useState('')
  const [count, setCount] = useState(3)
  const [run, setRun] = useState<FinderRunView | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [starting, setStarting] = useState(false)
  const follow = useRef<AbortController | undefined>(undefined)

  const watch = useCallback((started: FinderRunView): void => {
    follow.current?.abort()
    const controller = new AbortController()
    follow.current = controller
    setRun(started)
    api.finderFollow(started.id, (frame) => {
      if (frame.type === 'snapshot' || frame.type === 'settled') setRun(frame.run)
      else setRun(current => current === undefined ? current : { ...current, events: [...current.events, frame.event],
        added: frame.event.kind === 'added' ? [...current.added, frame.event.problemId] : current.added })
      if (frame.type === 'settled' || (frame.type === 'event' && frame.event.kind === 'added')) refreshOverview()
    }, controller.signal).catch((failure: unknown) => { if (!controller.signal.aborted) setError(messageOf(failure)) })
  }, [api, refreshOverview])

  useEffect(() => {
    if (!open) return
    api.finderRuns().then((runs) => {
      const latest = runs[0]
      if (latest === undefined) return
      if (latest.status === 'running') watch(latest)
      else setRun(current => current ?? latest)
    }, (failure: unknown) => { setError(messageOf(failure)) })
  }, [open, api, watch])
  useEffect(() => () => { follow.current?.abort() }, [])

  const running = run?.status === 'running'
  const start = (): void => {
    setStarting(true)
    setError(undefined)
    api.findProblems(description, count).then(watch, (failure: unknown) => { setError(messageOf(failure)) })
      .finally(() => { setStarting(false) })
  }
  const describe = (event: FinderEvent): string => {
    switch (event.kind) {
      case 'search': return t('finder.event.search', { query: event.query === '' ? '—' : event.query, results: event.results })
      case 'inspect': return event.supported ? t('finder.event.inspect', { id: event.frontendId, title: event.title })
        : t('finder.event.unsupported', { id: event.frontendId, title: event.title, reason: event.reason ?? '' })
      case 'validating': return t('finder.event.validating', { slug: event.slug, attempt: event.attempt })
      case 'added': return t('finder.event.added', { id: event.frontendId, title: pick(event.title, locale) })
      case 'rejected': return t('finder.event.rejected', { slug: event.slug,
        checks: event.checks.filter(check => !check.ok).map(check => `${check.name}: ${check.detail}`).join('; ') })
      case 'skipped': return t('finder.event.skipped', { slug: event.slug, reason: event.reason })
      case 'message': return event.text
      case 'error': return t('failed', { message: event.message })
      default: {
        const unreachable: never = event
        return unreachable
      }
    }
  }
  const added = run === undefined ? [] : run.added.flatMap(id => overview.problems.find(problem => problem.id === id) ?? [])
  return (
    <Modal open={open} onClose={onClose} title={t('finder.title')} closeLabel={t('close')} description={t('finder.help')}
      footer={<>
        <Button variant="ghost" onClick={onClose}>{t('close')}</Button>
        {running
          ? <Button variant="outline" onClick={() => { if (run !== undefined) api.finderCancel(run.id).catch((failure: unknown) => { setError(messageOf(failure)) }) }}>{t('finder.cancel')}</Button>
          : <Button variant="primary" disabled={starting || description.trim().length < 3} onClick={start}>{t('finder.start')}</Button>}
      </>}
    >
      <div className={css.stack}>
        <textarea className={css.textarea} rows={3} value={description} disabled={running} placeholder={t('finder.placeholder')}
          aria-label={t('finder.description')} onChange={(event) => { setDescription(event.target.value) }} />
        <label className={css.row}>
          <span>{t('finder.count')}</span>
          <select className={css.select} value={count} disabled={running} onChange={(event) => { setCount(Number(event.target.value)) }}>
            {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        {run !== undefined && (
          <div className={css.card}>
            <div className={css.row}>
              <strong className={css.cardTitle}>{run.description}</strong>
              <span className={css.spacer} />
              <Chip tone={run.status === 'completed' ? 'success' : 'outline'}>{t(`finder.status.${run.status}`)}</Chip>
            </div>
            <ol className={css.finderLog} aria-live="polite">
              {run.events.map((event, index) => <li key={index} data-kind={event.kind}>{describe(event)}</li>)}
              {running && <li className={css.muted}>{t('finder.working')}</li>}
            </ol>
            {added.length > 0 && (
              <div className={css.row}>
                {added.map(problem => (
                  <Button key={problem.id} variant="outline" size="sm" onClick={() => { onClose(); navigate({ tab: 'practice', problemId: problem.id, mode: 'practice' }) }}>
                    {t('finder.open', { title: pick(problem.title, locale) })}
                  </Button>
                ))}
              </div>
            )}
            {run.error !== undefined && <p className={css.errorText}>{run.error}</p>}
          </div>
        )}
        {error !== undefined && <div className={css.errorBox} role="alert">{t('failed', { message: error })}</div>}
      </div>
    </Modal>
  )
}

/**
 * Validation checks of a stored candidate.
 * @param props - record.
 * @returns the report.
 */
export function ValidationReport({ record }: { record: VariantRecord }) {
  const { t, locale } = useLearn()
  return (
    <div className={css.card}>
      <div className={css.row}><strong>{pick(record.title,
        locale)}</strong><Chip tone={record.status === 'validated' ? 'success' : 'outline'}>{t(record.status === 'validated' ? 'review.validated' : 'review.quarantined')}</Chip></div>
      <ul className={css.checks}>
        {record.validation.checks.map((check,
          index) => <li key={index} data-ok={check.ok}><strong>{check.ok ? '✓' : '✗'} {check.name}</strong> {check.detail}</li>)}
      </ul>
    </div>
  )
}
