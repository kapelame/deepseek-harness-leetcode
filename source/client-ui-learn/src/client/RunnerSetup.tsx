/** Guided runner setup: install Docker, start it, and download the runner images, rechecking automatically. */
import { useEffect, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { RunnerStatus } from '@deepseek-ai/dsh-experimental-learn/types'
import { messageOf, useLearn } from './shared.tsx'
import css from './Learn.module.css'

const STEPS = ['install', 'start', 'images'] as const
const DOCKER_URL = 'https://www.docker.com/products/docker-desktop/'

/**
 * Setup steps for the code runner with one action for the current step.
 * @param props - `onChange` receives every refreshed status.
 * @returns the checklist, or nothing once the runner is ready.
 */
export function RunnerSetup({ status, onChange }: { status: RunnerStatus; onChange: (status: RunnerStatus) => void }) {
  const { api, t } = useLearn()
  const [busy, setBusy] = useState<'start' | 'images' | 'check' | undefined>()
  const [error, setError] = useState<string | undefined>()
  const current = status.setup

  // Installing or starting Docker happens outside Learn; recheck quietly until it is done.
  useEffect(() => {
    if ((current !== 'install' && current !== 'start') || busy !== undefined) return
    const timer = setInterval(() => {
      api.runnerStatus(true).then(onChange, () => undefined)
    }, 10_000)
    return () => { clearInterval(timer) }
  }, [api, current, busy, onChange])

  const act = (kind: 'start' | 'images' | 'check'): void => {
    setError(undefined)
    setBusy(kind)
    const pending = kind === 'start' ? api.startRunner(AbortSignal.timeout(180_000))
      : kind === 'images' ? api.prepareRunner(null, AbortSignal.timeout(1_800_000))
        : api.runnerStatus(true)
    pending.then(onChange, (failure: unknown) => { setError(messageOf(failure)) }).finally(() => { setBusy(undefined) })
  }

  if (current === 'ready') return null
  const position = STEPS.indexOf(current)
  return (
    <div className={css.stack}>
      <ol className={css.setupSteps}>
        {STEPS.map((step, index) => (
          <li key={step} data-state={index < position ? 'done' : index === position ? 'current' : 'todo'}>
            <strong>{t(`setup.${step}`)}</strong>
            {index === position && (
              <div className={css.stack}>
                <span className={css.muted}>{t(`setup.${step}.help`)}</span>
                <div className={css.row}>
                  {step === 'install' && <a className={css.linkButton} href={DOCKER_URL} target="_blank" rel="noreferrer">{t('setup.install.link')}</a>}
                  {step === 'start' && <Button size="sm" variant="primary" disabled={busy !== undefined} onClick={() => { act('start') }}>
                    {busy === 'start' ? t('setup.start.busy') : t('setup.start.action')}</Button>}
                  {step === 'images' && <Button size="sm" variant="primary" disabled={busy !== undefined} onClick={() => { act('images') }}>
                    {busy === 'images' ? t('setup.images.busy') : t('setup.images.action')}</Button>}
                  <Button size="sm" variant="ghost" disabled={busy !== undefined} onClick={() => { act('check') }}>{t('settings.refresh')}</Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
      {error !== undefined && <div className={css.errorBox} role="alert">{t('failed', { message: error })}</div>}
    </div>
  )
}
