/** Problem catalog with search and filters, the import dialog, and the workspace. */
import { useMemo, useState } from 'react'
import { Button, Input, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { Difficulty, ProblemStatus, TopicId, VariantRecord } from '@deepseek-ai/dsh-experimental-learn/types'
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
  const { t, locale, overview, navigate } = useLearn()
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<TopicId | 'all'>('all')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [status, setStatus] = useState<ProblemStatus | 'all'>('all')
  const [importing, setImporting] = useState(false)
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return overview.problems.filter(problem => (topic === 'all' || problem.topics.includes(topic))
      && (difficulty === 'all' || problem.difficulty === difficulty)
      && (status === 'all' || problem.status === status)
      && (needle === '' || pick(problem.title, locale).toLowerCase().includes(needle) || problem.title.en.toLowerCase().includes(needle)
        || String(problem.leetcode?.frontendId ?? '') === needle || problem.leetcode?.tags.some(tag => tag.toLowerCase().includes(needle)) === true))
  }, [overview.problems, query, topic, difficulty, status, locale])
  return (
    <div className={css.stack}>
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
        <span className={css.spacer} />
        <Button variant="outline" size="sm" onClick={() => { setImporting(true) }}>{t('practice.import')}</Button>
      </div>
      {rows.length === 0 ? <p className={css.muted}>{t('practice.empty')}</p> : (
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
      )}
      <ImportDialog open={importing} onClose={() => { setImporting(false) }} />
    </div>
  )
}

function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { api, t, refreshOverview } = useLearn()
  const [spec, setSpec] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<VariantRecord | undefined>()
  const [error, setError] = useState<string | undefined>()
  return (
    <Modal open={open} onClose={onClose} title={t('practice.import')} closeLabel={t('close')} description={t('practice.importHelp')}
      footer={<><Button variant="ghost" onClick={onClose}>{t('close')}</Button><Button variant="primary" disabled={busy || spec.trim() === ''} onClick={() => {
        setBusy(true); setError(undefined)
        api.importProblem(spec, AbortSignal.timeout(300_000)).then((record) => { setResult(record); refreshOverview() },
          (failure: unknown) => { setError(messageOf(failure)) }).finally(() => { setBusy(false) })
      }}>{t('practice.importSubmit')}</Button></>}
    >
      <textarea className={css.codeArea} rows={14} value={spec} onChange={(event) => { setSpec(event.target.value) }} aria-label={t('practice.import')} spellCheck={false} />
      {busy && <p className={css.muted}>{t('review.generating')}</p>}
      {result !== undefined && <ValidationReport record={result} />}
      {error !== undefined && <div className={css.errorBox} role="alert">{t('failed', { message: error })}</div>}
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
