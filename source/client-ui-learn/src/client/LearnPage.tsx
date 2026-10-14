/** The Learn main panel: section tabs, availability banners, and the active section. */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SegmentedTabs, type SegmentedTab } from '@deepseek-ai/dsh-client-ui-primitives'
import type { HostObservable, InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type { LearnApi } from './api.ts'
import type { NS } from './locales.ts'
import type { LearnRoute, LearnTab } from './route.ts'
import { LearnEnvContext, Loaded, useAsync, type LearnEnv } from './shared.tsx'
import { TodayTab } from './TodayTab.tsx'
import { LessonTab } from './LessonTab.tsx'
import { PracticeTab } from './PracticeTab.tsx'
import { ReviewTab } from './ReviewTab.tsx'
import { ProgressTab } from './ProgressTab.tsx'
import { SettingsTab } from './SettingsTab.tsx'
import css from './Learn.module.css'

/** Injected actions and persisted route. */
export interface LearnPageInjected {
  readonly api: LearnApi
  readonly hooks: { readonly route: HostObservable<LearnRoute> }
  readonly navigate: (route: LearnRoute) => void
  /** Record whether the panel is showing so a reload can reopen it. */
  readonly setOpen: (open: boolean) => void
}

/** Props of the Learn page. */
export type LearnPageProps = PropsRuntime<'main'> & InjectFace<LearnPageInjected> & PropsLocale<typeof NS>

const ORDER: readonly LearnTab[] = ['today', 'learn', 'practice', 'review', 'progress', 'settings']

/**
 * Render the Learn page.
 * @param props - injected actions, route hook, and translator.
 * @returns the page.
 */
export function LearnPage({ api, useRoute, navigate, setOpen, t }: LearnPageProps) {
  const route = useRoute(value => value)
  useEffect(() => {
    setOpen(true)
    return () => { setOpen(false) }
  }, [setOpen])
  const [overviewKey, setOverviewKey] = useState(0)
  const overview = useAsync(() => api.overview(), String(overviewKey))
  const refreshOverview = useCallback(() => { setOverviewKey(value => value + 1) }, [])
  const items = useMemo(() => ORDER.map(tab => ({ value: tab, label: t(`tab.${tab}`), id: `learn-tab-${tab}`,
    panelId: 'learn-panel' })) as [SegmentedTab<LearnTab>, ...SegmentedTab<LearnTab>[]], [t])
  return (
    <div className={css.page}>
      <header className={css.header}>
        <h1 className={css.title}>{t('title')}</h1>
        <SegmentedTabs items={items} value={route.tab} onChange={(tab) => { navigate({ tab }) }} label={t('tabs')} />
      </header>
      <Loaded state={overview} t={t}>
        {(data) => {
          const env: LearnEnv = { api, t, route, navigate, overview: data, refreshOverview, locale: data.settings.locale }
          return (
            <LearnEnvContext.Provider value={env}>
              {!data.runner.available && (
                <div className={css.banner} data-tone="warn" role="status">
                  <span>{t('banner.runner',
                    { reason: data.runner.reason ?? data.runner.languages.find(item => !item.available)?.reason ?? '' })}</span>
                  <button type="button" className={css.linkButton} onClick={() => { navigate({ tab: 'settings' }) }}>{t('banner.runnerAction')}</button>
                </div>
              )}
              {!data.tutor.configured && <div className={css.banner} data-tone="info" role="status">{t('banner.tutor')}</div>}
              <main id="learn-panel" className={css.body} role="tabpanel" aria-labelledby={`learn-tab-${route.tab}`}>
                {route.tab === 'today' && <TodayTab />}
                {route.tab === 'learn' && <LessonTab />}
                {route.tab === 'practice' && <PracticeTab />}
                {route.tab === 'review' && <ReviewTab />}
                {route.tab === 'progress' && <ProgressTab />}
                {route.tab === 'settings' && <SettingsTab />}
              </main>
            </LearnEnvContext.Provider>
          )
        }}
      </Loaded>
    </div>
  )
}
