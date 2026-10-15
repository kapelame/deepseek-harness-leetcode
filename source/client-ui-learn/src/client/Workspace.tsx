/** Practice workspace: statement, tutor, hints, notes, history, editor, and results. */
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent } from 'react'
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  AttemptView, CodeLanguage, HintLevel, JsonValue, ProblemId, RecallRating, ReviewCompletion, ReviewItemId, WorkspaceState,
} from '@deepseek-ai/dsh-experimental-learn/types'
import { CodeEditor } from './CodeEditor.tsx'
import { TutorPane } from './TutorPane.tsx'
import { Chip, compact, DifficultyBadge, Loaded, Markdown, messageOf, pick, useAsync, useLearn, VerdictLabel, when } from './shared.tsx'
import css from './Learn.module.css'

type Pane = 'description' | 'tutor' | 'hints' | 'notes' | 'history'

/** Workspace props. */
export interface WorkspaceProps {
  readonly problemId: ProblemId
  readonly context: AttemptView['context']
  readonly reviewItemId?: ReviewItemId
  readonly onBack: () => void
}

function readRatio(): number {
  try {
    const stored = Number(window.localStorage.getItem('dsh.learn.split'))
    return Number.isFinite(stored) && stored >= 0.25 && stored <= 0.75 ? stored : 0.42
  } catch {
    return 0.42
  }
}

function writeRatio(ratio: number): void {
  try {
    window.localStorage.setItem('dsh.learn.split', String(ratio))
  } catch {
    // Storage may be unavailable (private windows); the split still works for this view.
  }
}

/**
 * Load and render one exercise.
 * @param props - problem and context.
 * @returns the workspace.
 */
export function Workspace(props: WorkspaceProps) {
  const { api, t } = useLearn()
  const state = useAsync(() => api.workspace(props.problemId), props.problemId)
  return <Loaded state={state} t={t}>{data => <WorkspaceView {...props} initial={data} reload={state.reload} />}</Loaded>
}

function WorkspaceView({ initial, context, reviewItemId, onBack,
  reload }: WorkspaceProps & { initial: WorkspaceState; reload: () => void }) {
  const { api, t, locale, overview, refreshOverview } = useLearn()
  const problem = initial.problem
  const [pane, setPane] = useState<Pane>('description')
  const [language, setLanguage] = useState<CodeLanguage>(() => initial.drafts[overview.settings.preferredLanguage] !== undefined || initial.drafts.python === undefined ? overview.settings.preferredLanguage : 'python')
  const [code, setCode] = useState(() => initial.drafts[language]?.code ?? problem.starter[language])
  const [saveState, setSaveState] = useState<{ kind: 'idle' | 'saving' | 'saved' | 'failed'; at?: string }>({ kind: 'idle' })
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState<{ kind: 'run' | 'submit'; started: number; abort: AbortController } | undefined>()
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<AttemptView | undefined>(initial.attempts[0])
  const [error, setError] = useState<string | undefined>()
  const [ratio, setRatio] = useState(readRatio)
  const [attempts, setAttempts] = useState(initial.attempts)
  const container = useRef<HTMLDivElement>(null)
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (busy === undefined) return
    const timer = setInterval(() => { setElapsed(Math.round((Date.now() - busy.started) / 1000)) }, 500)
    return () => { clearInterval(timer) }
  }, [busy])

  const persist = useCallback((next: string, lang: CodeLanguage) => {
    if (pending.current !== undefined) clearTimeout(pending.current)
    setSaveState({ kind: 'saving' })
    pending.current = setTimeout(() => {
      api.saveDraft(problem.id, lang, next).then((at) => { setSaveState({ kind: 'saved', at }) },
        () => { setSaveState({ kind: 'failed' }) })
    }, 700)
  }, [api, problem.id])

  useEffect(() => () => { if (pending.current !== undefined) clearTimeout(pending.current) }, [])

  const onCode = (next: string): void => {
    setCode(next)
    persist(next, language)
  }

  const switchLanguage = (next: CodeLanguage): void => {
    setLanguage(next)
    setCode(initial.drafts[next]?.code ?? problem.starter[next])
  }

  const parseCustom = (): JsonValue[][] | string => {
    const lines = custom.split('\n').map(line => line.trim()).filter(line => line !== '')
    const parsed: JsonValue[][] = []
    for (const [index, line] of lines.entries()) {
      try {
        const value = JSON.parse(line) as JsonValue
        if (!Array.isArray(value)) return t('ws.customInvalid', { line: index + 1 })
        parsed.push(value)
      } catch {
        return t('ws.customInvalid', { line: index + 1 })
      }
    }
    return parsed
  }

  const execute = (kind: 'run' | 'submit'): void => {
    if (busy !== undefined) return
    const inputs = kind === 'run' ? parseCustom() : []
    if (typeof inputs === 'string') { setError(inputs); return }
    const abort = new AbortController()
    setBusy({ kind, started: Date.now(), abort })
    setElapsed(0)
    setError(undefined)
    const call = kind === 'run'
      ? api.run(problem.id, language, code, inputs, abort.signal)
      : api.submit(problem.id, language, code, context, reviewItemId ?? null, abort.signal)
    call.then((attempt) => {
      setResult(attempt)
      setAttempts(list => [attempt, ...list])
      if (kind === 'submit') refreshOverview()
    }, (failure: unknown) => { if (!abort.signal.aborted) setError(messageOf(failure)) })
      .finally(() => { setBusy(undefined) })
  }

  const onDivider = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const box = container.current?.getBoundingClientRect()
    if (box === undefined) return
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    const move = (moveEvent: PointerEvent): void => {
      const next = Math.min(0.75, Math.max(0.25, (moveEvent.clientX - box.left) / box.width))
      setRatio(next)
    }
    const up = (): void => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', up)
      setRatio((value) => { writeRatio(value); return value })
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', up)
  }

  const onDividerKey = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    setRatio((value) => {
      const next = Math.min(0.75, Math.max(0.25, value + (event.key === 'ArrowLeft' ? -0.05 : 0.05)))
      writeRatio(next)
      return next
    })
  }

  const panes: Pane[] = ['description', 'tutor', 'hints', 'notes', 'history']
  return (
    <div className={css.workspace}>
      <div className={css.workspaceBar}>
        <Button variant="ghost" size="sm" onClick={onBack}>{t('ws.back')}</Button>
        <h2 className={css.problemTitle}>
          {problem.leetcode !== undefined && <span className={css.muted}>{problem.leetcode.frontendId}. </span>}
          {pick(problem.title, locale)}
        </h2>
        <DifficultyBadge difficulty={problem.difficulty} />
        <Chip tone="outline">{t(`kind.${problem.kind}`)}</Chip>
        <span className={css.spacer} />
        <span className={css.muted} aria-live="polite">
          {saveState.kind === 'saving' ? t('ws.saving') : saveState.kind === 'saved' && saveState.at !== undefined ? t('ws.saved',
            { time: when(saveState.at, locale) }) : saveState.kind === 'failed' ? t('ws.saveFailed') : ''}
        </span>
      </div>
      <div ref={container} className={css.split} style={{ '--learn-split': `${String(Math.round(ratio * 100))}%` } as React.CSSProperties}>
        <section className={css.leftPane}>
          <div className={css.paneTabs} role="tablist">
            {panes.map(item => (
              <button key={item} type="button" role="tab" aria-selected={pane === item} className={css.paneTab} onClick={() => { setPane(item) }}>{t(`ws.${item}`)}</button>
            ))}
          </div>
          <div className={css.paneBody}>
            {pane === 'description' && <Description state={initial} />}
            {pane === 'tutor' && <TutorPane threadId={initial.tutor.threadId} problemId={problem.id} initial={initial.tutor.messages} />}
            {pane === 'hints' && <Hints problemId={problem.id} initial={initial.hints} />}
            {pane === 'notes' && <Notes problemId={problem.id} initial={initial.note} />}
            {pane === 'history' && <Submissions attempts={attempts} onRestore={(attempt) => { setLanguage(attempt.language); onCode(attempt.code) }} />}
          </div>
        </section>
        <div className={css.divider} role="separator" aria-orientation="vertical" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={25} aria-valuemax={75} tabIndex={0} onPointerDown={onDivider} onKeyDown={onDividerKey} />
        <section className={css.rightPane}>
          <div className={css.editorBar}>
            <label className={css.inline}>
              <span className={css.muted}>{t('ws.language')}</span>
              <select className={css.select} value={language} onChange={(event) => { switchLanguage(event.target.value as CodeLanguage) }}>
                {overview.languages.filter(item => item.supported).map(item => (
                  <option key={item.language} value={item.language}>{item.label}</option>
                ))}
              </select>
            </label>
            <span className={css.spacer} />
            <Button variant="ghost" size="sm" onClick={() => { if (window.confirm(t('ws.resetConfirm'))) onCode(problem.starter[language]) }}>{t('ws.reset')}</Button>
          </div>
          <CodeEditor value={code} language={language} label={t('ws.code')} onChange={onCode} onRun={() => { execute('run') }} onSubmit={() => { execute('submit') }} />
          <details className={css.custom}>
            <summary>{t('ws.custom')}</summary>
            <textarea className={css.textarea} rows={3} value={custom} placeholder={t('ws.customHelp')} onChange={(event) => { setCustom(event.target.value) }} />
          </details>
          <div className={css.actions}>
            {busy !== undefined && <span className={css.muted} aria-live="polite">{busy.kind === 'run' ? t('ws.running') : t('ws.judging',
              { seconds: elapsed })}</span>}
            <span className={css.spacer} />
            {busy !== undefined && <Button variant="ghost" onClick={() => { busy.abort.abort() }}>{t('ws.cancel')}</Button>}
            <Button variant="outline" disabled={busy !== undefined} onClick={() => { execute('run') }}>{t('ws.run')}</Button>
            <Button variant="primary" disabled={busy !== undefined} onClick={() => { execute('submit') }}>{t('ws.submit')}</Button>
          </div>
          {error !== undefined && <div className={css.errorBox} role="alert">{t('failed', { message: error })}</div>}
          <Result attempt={result} />
          {context === 'review' && reviewItemId !== undefined && result?.kind === 'submit' && result.context === 'review' && (
            <ReviewCompletionCard itemId={reviewItemId} attempt={result} onDone={() => { reload(); refreshOverview() }} />
          )}
        </section>
      </div>
    </div>
  )
}

function Description({ state }: { state: WorkspaceState }) {
  const { t, locale } = useLearn()
  const problem = state.problem
  return (
    <div className={css.stack}>
      <div className={css.row}>
        {problem.topics.map(topic => <Chip key={topic}>{topic}</Chip>)}
        {problem.leetcode?.tags.map(tag => <Chip key={tag} tone="outline">{tag}</Chip>)}
      </div>
      {problem.leetcode !== undefined && (
        <p className={css.note}>
          {t('ws.summaryNote')}{' '}
          <a className={css.link} href={problem.leetcode.url} target="_blank" rel="noreferrer">{t('ws.officialLink')}</a>
          {' · '}{t('ws.verified', { date: problem.leetcode.verifiedAt })}
        </p>
      )}
      {problem.variant !== undefined && 'parentHidden' in problem.variant && <p className={css.note}>{t('ws.variantHidden')}</p>}
      <Markdown text={pick(problem.statement ?? problem.summary, locale)} />
      {problem.variant !== undefined && !('parentHidden' in problem.variant) && (
        <div className={css.card}>
          <strong>{t('ws.parent', { title: pick(problem.variant.parentTitle, locale) })}</strong>
          <h4>{t('ws.differences')}</h4>
          <ul>{problem.variant.differences.map((item, index) => <li key={index}>{pick(item.description, locale)}</li>)}</ul>
          <h4>{t('ws.transfer')}</h4>
          <p>{pick(problem.variant.transfer, locale)}</p>
        </div>
      )}
      <h4>{t('ws.examples')}</h4>
      {problem.examples.map(example => (
        <div key={example.id} className={css.example}>
          <div className={css.muted}>{t('ws.example', { id: example.id })}</div>
          <code className={css.mono}>{t('ws.input')}: {problem.params.map((param,
            index) => `${param.name} = ${compact(example.args[index])}`).join(', ')}</code>
          <code className={css.mono}>{t('ws.output')}: {compact(example.expected)}</code>
          {example.explanation !== undefined && <span>{pick(example.explanation, locale)}</span>}
        </div>
      ))}
      <h4>{t('ws.constraints')}</h4>
      <ul>{problem.constraints.map((item, index) => <li key={index}>{pick(item, locale)}</li>)}</ul>
      <p className={css.muted}>{t('ws.hiddenCases', { count: problem.hiddenCaseCount })}</p>
      <p className={css.muted}>{t(`ws.origin.${problem.origin.source}`)}</p>
    </div>
  )
}

function Hints({ problemId, initial }: { problemId: ProblemId; initial: WorkspaceState['hints'] }) {
  const { api, t, refreshOverview } = useLearn()
  const [hints, setHints] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const highest = Math.max(0, ...hints.map(hint => hint.level))
  const next = Math.min(4, highest + 1) as HintLevel
  const request = (level: HintLevel, confirm: boolean): void => {
    setLoading(true)
    setError(undefined)
    api.hint(problemId, level, confirm, AbortSignal.timeout(180_000)).then((hint) => {
      setHints(list => [...list, hint])
      refreshOverview()
    }, (failure: unknown) => { setError(messageOf(failure)) }).finally(() => { setLoading(false) })
  }
  return (
    <div className={css.stack}>
      {hints.length === 0 && <p className={css.muted}>{t('hint.none')}</p>}
      {hints.map((hint, index) => (
        <div key={index} className={css.card}>
          <div className={css.row}><strong>{t(`hint.level${hint.level}`)}</strong><Chip>{t(`hint.source.${hint.source}`)}</Chip></div>
          <Markdown text={hint.content} />
        </div>
      ))}
      {loading && <p className={css.muted} aria-live="polite">{t('hint.loading')}</p>}
      {error !== undefined && <div className={css.errorBox} role="alert">{t('failed', { message: error })}</div>}
      {highest < 4 && (
        <Button variant="outline" disabled={loading} onClick={() => { if (next === 4) setConfirming(true); else request(next, false) }}>
          {t('hint.request', { level: t(`hint.level${next}`) })}
        </Button>
      )}
      <Modal open={confirming} onClose={() => { setConfirming(false) }} title={t('hint.revealTitle')} closeLabel={t('close')} description={t('hint.revealBody')}
        footer={<><Button variant="ghost" onClick={() => { setConfirming(false) }}>{t('close')}</Button><Button variant="primary" onClick={() => { setConfirming(false); request(4, true) }}>{t('hint.revealConfirm')}</Button></>}
      >{null}</Modal>
    </div>
  )
}

function Notes({ problemId, initial }: { problemId: ProblemId; initial: string }) {
  const { api, t } = useLearn()
  const [value, setValue] = useState(initial)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => { if (timer.current !== undefined) clearTimeout(timer.current) }, [])
  return (
    <textarea className={css.notes} value={value} placeholder={t('notes.placeholder')} aria-label={t('ws.notes')}
      onChange={(event) => {
        const next = event.target.value
        setValue(next)
        if (timer.current !== undefined) clearTimeout(timer.current)
        timer.current = setTimeout(() => { void api.saveNote(problemId, next) }, 700)
      }}
    />
  )
}

/** Runtime and peak memory of a verdict, formatted like LeetCode's submission record. */
function usage(verdict: AttemptView['verdict']): { runtime: string; memory: string } {
  return {
    runtime: verdict?.measuredMs === undefined ? '—' : `${String(Math.round(verdict.measuredMs))} ms`,
    memory: verdict?.peakMemoryKb === undefined ? '—' : `${(verdict.peakMemoryKb / 1024).toFixed(1)} MB`,
  }
}

function Submissions({ attempts, onRestore }: { attempts: readonly AttemptView[]; onRestore: (attempt: AttemptView) => void }) {
  const { t, locale, overview } = useLearn()
  const [showRuns, setShowRuns] = useState(false)
  const [open, setOpen] = useState<string | undefined>()
  const shown = attempts.filter(attempt => showRuns || attempt.kind === 'submit')
  // Short names keep the table narrow enough for the side pane; the full runtime label is on the editor.
  const label = (language: CodeLanguage): string => overview.languages.find(item => item.language === language)?.label.split(' ')[0] ?? language
  return (
    <div className={css.stack}>
      <label className={css.inline}>
        <input type="checkbox" checked={showRuns} onChange={(event) => { setShowRuns(event.target.checked) }} />
        <span className={css.muted}>{t('history.showRuns')}</span>
      </label>
      {shown.length === 0 ? <p className={css.muted}>{t(showRuns ? 'history.empty' : 'history.noSubmissions')}</p> : (
        <div className={css.tableWrap}>
          <table className={`${css.table ?? ''} ${css.submissionTable ?? ''}`}>
            <thead>
              <tr><th scope="col">{t('history.status')}</th><th scope="col">{t('history.language')}</th><th scope="col">{t('history.runtime')}</th>
                <th scope="col">{t('history.memory')}</th></tr>
            </thead>
            <tbody>
              {shown.map((attempt) => {
                const { runtime, memory } = usage(attempt.verdict)
                const expanded = open === attempt.id
                return (
                  <SubmissionRow key={attempt.id} attempt={attempt} expanded={expanded} runtime={runtime} memory={memory} language={label(attempt.language)}
                    date={when(attempt.createdAt, locale)} onToggle={() => { setOpen(expanded ? undefined : attempt.id) }} onRestore={() => { onRestore(attempt) }} />
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SubmissionRow({ attempt, expanded, runtime, memory, language, date, onToggle, onRestore }: {
  attempt: AttemptView; expanded: boolean; runtime: string; memory: string; language: string; date: string; onToggle: () => void; onRestore: () => void
}) {
  const { t } = useLearn()
  const verdict = attempt.verdict
  return (
    <>
      <tr className={css.submissionRow} aria-expanded={expanded} onClick={onToggle}>
        <td>
          <button type="button" className={css.statusButton} onClick={(event) => { event.stopPropagation(); onToggle() }}>
            {verdict === undefined ? t('history.judging') : <VerdictLabel kind={verdict.kind} />}
          </button>
          <div className={css.subtle}>
            {attempt.kind === 'run' && <>{t('ws.run')} · </>}
            {verdict !== undefined && <>{t('history.cases', { passed: verdict.passed, total: verdict.total })} · </>}
            {date}
          </div>
        </td>
        <td>{language}</td>
        <td>{runtime}</td>
        <td>{memory}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={4}>
            <div className={css.stack}>
              {verdict?.failing !== undefined && verdict.failing.caseId !== 'compile' && verdict.failing.caseId !== 'module' && (
                <div className={css.case}>
                  <strong>{t('ws.failingCase', { visibility: t(`ws.visibility.${verdict.failing.visibility}`) })}</strong>
                  <code className={css.mono}>{t('ws.input')}: {compact(verdict.failing.args)}</code>
                  {verdict.failing.expected !== undefined && <code className={css.mono}>{t('ws.expected')}: {compact(verdict.failing.expected)}</code>}
                  {verdict.failing.actual !== undefined && <code className={css.mono}>{t('ws.output')}: {compact(verdict.failing.actual)}</code>}
                  {verdict.failing.error !== undefined && <code className={css.errorText}>{verdict.failing.error}</code>}
                </div>
              )}
              {verdict?.message !== undefined && verdict.kind !== 'wrong-answer' && <pre className={css.errorText}>{verdict.message}</pre>}
              <pre className={css.codeBlock}>{attempt.code}</pre>
              <div className={css.row}>
                <Chip tone="outline">{t(`ws.support.${attempt.support}`)}</Chip>
                <span className={css.spacer} />
                <Button size="sm" variant="outline" onClick={onRestore}>{t('history.restore')}</Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function Result({ attempt }: { attempt: AttemptView | undefined }) {
  const { t, locale } = useLearn()
  const verdict = attempt?.verdict
  if (attempt === undefined || verdict === undefined) return <div className={css.result}><p className={css.muted}>{t('ws.noResult')}</p></div>
  return (
    <div className={css.result} aria-live="polite">
      <div className={css.row}>
        <VerdictLabel kind={verdict.kind} />
        <span className={css.muted}>{t('ws.passedCases', { passed: verdict.passed, total: verdict.total })}</span>
        {attempt.kind === 'submit' && <Chip tone="outline">{t(`ws.support.${attempt.support}`)}</Chip>}
      </div>
      {verdict.message !== undefined && verdict.kind !== 'wrong-answer' && <pre className={css.errorText}>{verdict.message}</pre>}
      <p className={css.note}>{verdict.coverageNote[locale]}</p>
      {verdict.measuredMs !== undefined && <p className={css.muted}>{t('ws.measured', { ms: Math.round(verdict.measuredMs) })}
        {verdict.peakMemoryKb !== undefined && <> · {t('ws.memory', { mb: (verdict.peakMemoryKb / 1024).toFixed(1) })}</>}</p>}
      {verdict.failing !== undefined && verdict.failing.caseId !== 'compile' && verdict.failing.caseId !== 'module' && (
        <div className={css.case}>
          <strong>{t('ws.failingCase', { visibility: t(`ws.visibility.${verdict.failing.visibility}`) })}</strong>
          <code className={css.mono}>{t('ws.input')}: {compact(verdict.failing.args)}</code>
          {verdict.failing.expected !== undefined && <code className={css.mono}>{t('ws.expected')}: {compact(verdict.failing.expected)}</code>}
          {verdict.failing.actual !== undefined && <code className={css.mono}>{t('ws.output')}: {compact(verdict.failing.actual)}</code>}
          {verdict.failing.error !== undefined && <code className={css.errorText}>{verdict.failing.error}{verdict.failing.line === undefined ? '' : ` (${t('ws.errorLine', { line: verdict.failing.line })})`}</code>}
        </div>
      )}
      {verdict.failing?.line !== undefined && (verdict.failing.caseId === 'compile' || verdict.failing.caseId === 'module') && <p className={css.errorText}>{t('ws.errorLine', { line: verdict.failing.line })}</p>}
      {verdict.cases?.map(item => (
        <div key={item.caseId} className={css.case} data-pass={item.passed}>
          <div className={css.row}><strong>{item.caseId}</strong><span>{item.passed ? '✓' : '✗'}</span>{item.timeMs !== undefined && <span className={css.muted}>{t('ws.timeMs', { value: item.timeMs.toFixed(1) })}</span>}</div>
          <code className={css.mono}>{t('ws.input')}: {compact(item.args)}</code>
          {item.expected !== undefined && <code className={css.mono}>{t('ws.expected')}: {compact(item.expected)}</code>}
          {item.actual !== undefined && <code className={css.mono}>{t('ws.output')}: {compact(item.actual)}</code>}
          {item.error !== undefined && <code className={css.errorText}>{item.error}</code>}
          {item.stdout !== '' && <details><summary>{t('ws.stdout')}</summary><pre className={css.mono}>{item.stdout}</pre></details>}
        </div>
      ))}
      {attempt.kind === 'submit' && <Assessment attempt={attempt} />}
    </div>
  )
}

function Assessment({ attempt }: { attempt: AttemptView }) {
  const { api, t } = useLearn()
  const assessment = attempt.assessment
  const [explanation, setExplanation] = useState('')
  const [sent, setSent] = useState(false)
  if (assessment === undefined) return null
  return (
    <div className={css.card}>
      <div className={css.row}>
        <strong>{t('ws.assessment')}</strong>
        {attempt.judgeMode !== undefined && <Chip tone="outline">{t(`ws.judgeMode.${attempt.judgeMode}`)}</Chip>}
      </div>
      <p className={css.muted}>{t('ws.verdictNote')}</p>
      {assessment.source === 'unavailable'
        ? <p>{t('ws.assessmentUnavailable', { reason: assessment.failure ?? assessment.summary })}</p>
        : (
          <>
            <Markdown text={assessment.summary} />
            {assessment.reasoning !== undefined && <Markdown text={assessment.reasoning} />}
            {assessment.likelyComplexity !== undefined && <p>{t('ws.complexity', { time: assessment.likelyComplexity.time,
              space: assessment.likelyComplexity.space })}</p>}
            {assessment.misconceptions.length > 0 && <><h4>{t('ws.misconceptions')}</h4><ul>{assessment.misconceptions.map((item,
              index) => <li key={index}>{item}</li>)}</ul></>}
            {assessment.mistakeTags.length > 0 && <p className={css.muted}>{t('ws.mistakes',
              { tags: assessment.mistakeTags.join(', ') })}</p>}
            {assessment.nextStep !== undefined && <p><strong>{t('ws.nextStep')}: </strong>{assessment.nextStep}</p>}
            {assessment.reflectionQuestion !== undefined && (
              <div className={css.stack}>
                <strong>{t('ws.reflectionQuestion')}: {assessment.reflectionQuestion}</strong>
                <textarea className={css.textarea} rows={3} value={explanation} placeholder={t('ws.explainPlaceholder')} onChange={(event) => { setExplanation(event.target.value) }} />
                <Button variant="outline" size="sm" disabled={sent || explanation.trim().length < 10}
                  onClick={() => { void api.tutorSend(attempt.problemId, null,
                    `${assessment.reflectionQuestion ?? ''}\n\n${explanation}`).then(() => { setSent(true) }) }}
                >{t('ws.explainSend')}</Button>
              </div>
            )}
          </>
        )}
    </div>
  )
}

function ReviewCompletionCard({ itemId, attempt, onDone }: { itemId: ReviewItemId; attempt: AttemptView; onDone: () => void }) {
  const { api, t, locale } = useLearn()
  const [completion, setCompletion] = useState<ReviewCompletion | undefined>()
  const [error, setError] = useState<string | undefined>()
  const graded = attempt.verdict !== undefined && attempt.verdict.kind !== 'evaluation-unavailable' && attempt.verdict.kind !== 'cancelled'
  const complete = (recall: RecallRating): void => {
    api.completeReview(itemId, attempt.id, recall).then((result) => { setCompletion(result); onDone() },
      (failure: unknown) => { setError(messageOf(failure)) })
  }
  if (completion !== undefined) {
    return (
      <div className={css.card} data-tone="success">
        <strong>{t('review.result', { date: completion.nextDueDate, days: completion.intervalDays })}</strong>
        <p>{pick(completion.reason, locale)}</p>
        {completion.duplicate && <p className={css.muted}>{t('review.duplicate')}</p>}
        {completion.reveal !== undefined && (
          <>
            <p><strong>{t('ws.parent', { title: pick(completion.reveal.parentTitle, locale) })}</strong></p>
            <h4>{t('ws.differences')}</h4>
            <ul>{completion.reveal.differences.map((item, index) => <li key={index}>{pick(item.description, locale)}</li>)}</ul>
            <h4>{t('ws.transfer')}</h4>
            <p>{pick(completion.reveal.transfer, locale)}</p>
          </>
        )}
      </div>
    )
  }
  return (
    <div className={css.card}>
      <strong>{t('review.complete')}</strong>
      <p className={css.muted}>{graded ? t('review.completeHelp') : t('review.needsGraded')}</p>
      <div className={css.row} role="group" aria-label={t('review.recall')}>
        {(['again', 'hard', 'good', 'easy'] as const).map(recall => (
          <Button key={recall} variant={recall === 'good' ? 'primary' : 'outline'} size="sm" disabled={!graded} onClick={() => { complete(recall) }}>{t(`recall.${recall}`)}</Button>
        ))}
      </div>
      {error !== undefined && <div className={css.errorBox} role="alert">{t('failed', { message: error })}</div>}
    </div>
  )
}
