/** Settings: learning preferences, tutor model, runner, reminder email, and data controls. */
import { useState } from 'react'
import { Button, Input, Modal, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CodeLanguage, EmailPreview, EmailSettingsView, LearnerSettings } from '@deepseek-ai/dsh-experimental-learn/types'
import { Chip, Loaded, messageOf, useAsync, useLearn, when } from './shared.tsx'
import { RunnerSetup } from './RunnerSetup.tsx'
import css from './Learn.module.css'

/**
 * Render settings.
 * @returns the section.
 */
export function SettingsTab() {
  return (
    <div className={css.grid}>
      <Preferences />
      <Status />
      <Email />
      <Data />
    </div>
  )
}

function Preferences() {
  const { api, t, overview, refreshOverview } = useLearn()
  const [draft, setDraft] = useState<LearnerSettings>(overview.settings)
  const [ladder, setLadder] = useState(overview.settings.reviewLadderDays.join(', '))
  const [state, setState] = useState<string | undefined>()
  const save = (): void => {
    const days = ladder.split(',').map(item => Number(item.trim())).filter(item => Number.isFinite(item))
    api.updateSettings({ ...draft, reviewLadderDays: days }).then(() => { setState(t('settings.saved')); refreshOverview() },
      (failure: unknown) => { setState(t('failed', { message: messageOf(failure) })) })
  }
  const set = <K extends keyof LearnerSettings>(key: K, value: LearnerSettings[K]): void => { setDraft(current => ({ ...current,
    [key]: value })) }
  return (
    <section className={css.card}>
      <h3>{t('settings.learner')}</h3>
      <div className={css.form}>
        <label>{t('settings.locale')}
          <select className={css.select} value={draft.locale} onChange={(event) => { set('locale',
            event.target.value === 'en' ? 'en' : 'zh') }}>
            <option value="zh">{t('settings.locale.zh')}</option><option value="en">{t('settings.locale.en')}</option>
          </select>
        </label>
        <label>{t('settings.timezone')}<Input value={draft.timezone} onChange={(event) => { set('timezone',
          event.target.value) }} /></label>
        <label>{t('settings.experience')}
          <select className={css.select} value={draft.experience} onChange={(event) => { set('experience',
            event.target.value as LearnerSettings['experience']) }}>
            {(['new', 'some', 'experienced'] as const).map(item => <option key={item} value={item}>{t(`experience.${item}`)}</option>)}
          </select>
        </label>
        <label>{t('settings.language')}
          <select className={css.select} value={draft.preferredLanguage} onChange={(event) => { set('preferredLanguage',
            event.target.value as CodeLanguage) }}>
            {overview.languages.map(item => <option key={item.language} value={item.language}>{item.label}</option>)}
          </select>
        </label>
        <label>{t('settings.dailyGoal')}<Input type="number" min={5} max={600} value={draft.dailyGoalMinutes} onChange={(event) => { set('dailyGoalMinutes', Number(event.target.value)) }} /></label>
        <label>{t('settings.reviewLimit')}<Input type="number" min={1} max={50} value={draft.reviewDailyLimit} onChange={(event) => { set('reviewDailyLimit', Number(event.target.value)) }} /></label>
        <label>{t('settings.ladder')}<Input value={ladder} onChange={(event) => { setLadder(event.target.value) }} /></label>
      </div>
      <div className={css.row}><Button variant="primary" onClick={save}>{t('settings.save')}</Button>{state !== undefined && <span className={css.muted} role="status">{state}</span>}</div>
    </section>
  )
}

function Status() {
  const { api, t, overview, refreshOverview } = useLearn()
  const [runner, setRunner] = useState(overview.runner)
  const [busy, setBusy] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()
  const refresh = (): void => {
    setBusy('refresh')
    api.runnerStatus(true).then((status) => { setRunner(status); refreshOverview() },
      (failure: unknown) => { setError(messageOf(failure)) }).finally(() => { setBusy(undefined) })
  }
  const prepare = (language: CodeLanguage): void => {
    setBusy(language)
    api.prepareRunner(language, AbortSignal.timeout(900_000)).then((status) => { setRunner(status); refreshOverview() },
      (failure: unknown) => { setError(messageOf(failure)) }).finally(() => { setBusy(undefined) })
  }
  return (
    <section className={css.card}>
      <h3>{t('settings.model')}</h3>
      {overview.tutor.configured
        ? <p>{t('settings.modelConfigured', { model: `${overview.tutor.provider ?? ''}/${overview.tutor.model ?? ''}` })}</p>
        : <p className={css.note}>{t('settings.modelMissing')}</p>}
      {overview.tutor.lastFailure !== undefined && overview.tutor.configured && <p className={css.errorText}>{t('settings.modelFailure',
        { error: overview.tutor.lastFailure })}</p>}
      <h3>{t('settings.runner')}</h3>
      <p>{runner.available ? t('settings.runnerReady', { backend: runner.backend }) : t('settings.runnerMissing',
        { reason: runner.reason ?? '' })}</p>
      <RunnerSetup status={runner} onChange={(status) => { setRunner(status); refreshOverview() }} />
      <ul className={css.list}>
        {runner.languages.map(item => (
          <li key={item.language} className={css.listRow}>
            <span>{t('settings.runnerLanguage', { language: item.language,
              state: item.available ? t('settings.ready') : t('settings.notReady') })}</span>
            <code className={css.muted}>{item.image}</code>
            <span className={css.spacer} />
            {!item.available && runner.setup === 'ready' && <Button size="sm" variant="outline" disabled={busy !== undefined} onClick={() => { prepare(item.language) }}>{busy === item.language ? t('loading') : t('settings.prepare')}</Button>}
          </li>
        ))}
      </ul>
      <p className={css.muted}>{t('settings.isolation')}</p>
      <Button size="sm" variant="ghost" disabled={busy !== undefined} onClick={refresh}>{t('settings.refresh')}</Button>
      {error !== undefined && <div className={css.errorBox} role="alert">{t('failed', { message: error })}</div>}
    </section>
  )
}

function Email() {
  const { api, t, locale } = useLearn()
  const [key, setKey] = useState(0)
  const settings = useAsync(() => api.emailSettings(), String(key))
  const jobs = useAsync(() => api.emailJobs(), String(key))
  const [address, setAddress] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [preview, setPreview] = useState<EmailPreview | undefined>()
  const reasonText = (reason: string): string => {
    const known = { 'no reviews due': 'email.reason.noReviews', 'opted out': 'email.reason.optedOut', 'paused': 'email.reason.paused',
      'no verified address': 'email.reason.unverified', 'address changed': 'email.reason.addressChanged' } as const
    const key = (known as Readonly<Record<string, (typeof known)[keyof typeof known]>>)[reason]
    if (key !== undefined) return t(key)
    return reason.startsWith('stale') ? t('email.reason.stale') : reason.startsWith('superseded') ? t('email.reason.superseded') : reason
  }
  const refresh = (): void => { setKey(value => value + 1) }
  const act = (operation: Promise<unknown>): void => {
    setError(undefined)
    operation.then(() => { refresh() }, (failure: unknown) => { setError(messageOf(failure)) })
  }
  return (
    <section className={css.card} data-span="wide">
      <h3>{t('settings.email')}</h3>
      <Loaded state={settings} t={t}>
        {(view: EmailSettingsView) => (
          <div className={css.stack}>
            <p className={css.note}>{view.transport === 'capture' || !view.liveSending ? t('email.transport.capture') : t('email.transport.smtp')} {t('email.runtime')}</p>
            <div className={css.row}>
              <label className={css.inline}>{t('email.address')}<Input type="email" value={address === '' ? view.address ?? '' : address} onChange={(event) => { setAddress(event.target.value) }} /></label>
              <Button variant="outline" size="sm" onClick={() => { act(api.setEmailAddress(address === '' ? view.address ?? '' : address)) }}>{t('email.setAddress')}</Button>
              {view.address !== undefined && <Chip tone={view.verified ? 'success' : 'outline'}>{view.verified ? t('email.verified') : t('email.unverified')}</Chip>}
            </div>
            {view.verificationPending && (
              <div className={css.row}>
                <span className={css.muted}>{t('email.pending')}</span>
                <Input inputMode="numeric" maxLength={6} value={code} placeholder={t('email.code')} aria-label={t('email.code')} onChange={(event) => { setCode(event.target.value) }} />
                <Button variant="primary" size="sm" disabled={code.length !== 6} onClick={() => { act(api.verifyEmail(code)) }}>{t('email.verify')}</Button>
              </div>
            )}
            <div className={css.row}>
              <span className={css.inline}><Switch checked={view.optIn} disabled={!view.verified} onChange={(value: boolean) => { act(api.emailPreferences({ optIn: value })) }} label={t('email.optIn')} />{t('email.optIn')}</span>
              <span className={css.inline}><Switch checked={view.paused} disabled={!view.optIn} onChange={(value: boolean) => { act(api.emailPreferences({ paused: value })) }} label={t('email.pause')} />{t('email.pause')}</span>
              <label className={css.inline}>{t('email.hour')}
                <select className={css.select} value={view.deliveryHour}
                  onChange={(event) => { act(api.emailPreferences({ deliveryHour: Number(event.target.value) })) }}
                >
                  {Array.from({ length: 24 }, (_value, hour) => <option key={hour} value={hour}>{String(hour).padStart(2,
                    '0')}:00</option>)}
                </select>
              </label>
            </div>
            <div className={css.row}>
              <Button variant="outline" size="sm" disabled={!view.verified} onClick={() => { act(api.testEmail()) }}>{t('email.test')}</Button>
              <Button variant="ghost" size="sm" onClick={() => { act(api.runReminders()) }}>{t('email.runNow')}</Button>
            </div>
          </div>
        )}
      </Loaded>
      {error !== undefined && <div className={css.errorBox} role="alert">{t('failed', { message: error })}</div>}
      <h4>{t('email.jobs')}</h4>
      {(jobs.data ?? []).length === 0 ? <p className={css.muted}>{t('email.noJobs')}</p> : (
        <ul className={css.list}>
          {(jobs.data ?? []).map(job => (
            <li key={job.id} className={css.listRow}>
              <Chip>{t(`email.kind.${job.kind}`)}</Chip>
              <span>{t(`email.status.${job.status}`)}</span>
              {job.reason !== undefined && <span className={css.muted}>{reasonText(job.reason)}</span>}
              {job.lastError !== undefined && <span className={css.errorText}>{job.lastError}</span>}
              <span className={css.spacer} />
              <span className={css.muted}>{when(job.updatedAt, locale)}</span>
              {job.previewSubject !== undefined && <Button size="sm" variant="ghost" onClick={() => { api.emailPreview(job.id).then(setPreview, (failure: unknown) => { setError(messageOf(failure)) }) }}>{t('email.preview')}</Button>}
            </li>
          ))}
        </ul>
      )}
      <Modal open={preview !== undefined} onClose={() => { setPreview(undefined) }} title={t('email.previewTitle')} closeLabel={t('close')} {...preview === undefined ? {} : { description: `${preview.to} · ${preview.subject} · ${t(`email.status.${preview.status}`)}` }}>
        {preview !== undefined && <iframe className={css.previewFrame} title={preview.subject} sandbox="" srcDoc={preview.html} />}
      </Modal>
    </section>
  )
}

function Data() {
  const { api, t, refreshOverview } = useLearn()
  const [exported, setExported] = useState<string | undefined>()
  const [resetting, setResetting] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | undefined>()
  return (
    <section className={css.card}>
      <h3>{t('settings.data')}</h3>
      <div className={css.row}>
        <Button variant="outline" size="sm" onClick={() => { api.exportData().then((data) => { setExported(JSON.stringify(data, null,
          2)) }, (failure: unknown) => { setError(messageOf(failure)) }) }}>{t('data.export')}</Button>
        <Button variant="ghost" size="sm" onClick={() => { setResetting(true) }}>{t('data.reset')}</Button>
      </div>
      {exported !== undefined && <><p className={css.muted}>{t('data.exported')}</p><textarea className={css.codeArea} rows={8} readOnly value={exported} aria-label={t('data.export')} /></>}
      {error !== undefined && <div className={css.errorBox} role="alert">{t('failed', { message: error })}</div>}
      <Modal open={resetting} onClose={() => { setResetting(false) }} title={t('data.reset')} closeLabel={t('close')} description={t('data.resetBody')}
        footer={<><Button variant="ghost" onClick={() => { setResetting(false) }}>{t('close')}</Button><Button variant="primary" disabled={confirm !== 'RESET'} onClick={() => {
          api.resetData(confirm).then(() => { setResetting(false); setConfirm(''); refreshOverview() },
            (failure: unknown) => { setError(messageOf(failure)) })
        }}>{t('data.resetConfirm')}</Button></>}
      >
        <Input value={confirm} onChange={(event) => { setConfirm(event.target.value) }} aria-label={t('data.reset')} data-modal-autofocus />
      </Modal>
    </section>
  )
}
