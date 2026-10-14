/** Shared Learn page context, data loading, and small presentational pieces. */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { MarkdownText, Tag } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type { Difficulty, LearnLocale, LearnOverview, Localized, VerdictKind } from '@deepseek-ai/dsh-experimental-learn/types'
import type { LearnApi } from './api.ts'
import type { LearnRoute } from './route.ts'
import type { NS } from './locales.ts'
import css from './Learn.module.css'

/** Everything the Learn sections share. */
export interface LearnEnv {
  readonly api: LearnApi
  readonly t: TranslateNS<typeof NS>
  readonly route: LearnRoute
  readonly navigate: (route: LearnRoute) => void
  readonly overview: LearnOverview
  readonly refreshOverview: () => void
  readonly locale: LearnLocale
}

/** React context carrying {@link LearnEnv}. */
export const LearnEnvContext = createContext<LearnEnv | null>(null)

/**
 * Read the Learn environment.
 * @returns the current environment.
 */
export function useLearn(): LearnEnv {
  const env = useContext(LearnEnvContext)
  if (env === null) throw new Error('Learn components must render inside LearnPage')
  return env
}

/**
 * Pick the learner's locale from a localized text.
 * @param text - localized text.
 * @param locale - learner locale.
 * @returns the string.
 */
export function pick(text: Localized, locale: LearnLocale): string {
  return text[locale]
}

/** Async load state. */
export interface AsyncState<T> {
  readonly data: T | undefined
  readonly error: string | undefined
  readonly loading: boolean
  readonly reload: () => void
  readonly setData: (data: T) => void
}

/**
 * Load data on mount and when `key` changes; stale responses are ignored.
 * @param load - loader.
 * @param key - reload key.
 * @returns state with reload.
 */
export function useAsync<T>(load: () => Promise<T>, key: string): AsyncState<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)
  const loader = useRef(load)
  loader.current = load
  useEffect(() => {
    let live = true
    setLoading(true)
    loader.current().then((value) => {
      if (!live) return
      setData(value)
      setError(undefined)
      setLoading(false)
    }, (failure: unknown) => {
      if (!live) return
      setError(failure instanceof Error ? failure.message : String(failure))
      setLoading(false)
    })
    return () => { live = false }
  }, [key, nonce])
  const reload = useCallback(() => { setNonce(value => value + 1) }, [])
  return { data, error, loading, reload, setData }
}

/**
 * Message text of a rejection.
 * @param error - rejection.
 * @returns displayable text.
 */
export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Loading, error, or content.
 * @param props - async state and content renderer.
 * @returns the matching view.
 */
export function Loaded<T>({ state, t, children }: { state: AsyncState<T>; t: TranslateNS<typeof NS>; children: (data: T) => ReactNode }) {
  if (state.error !== undefined && state.data === undefined) {
    return (
      <div className={css.errorBox} role="alert">
        <span>{t('failed', { message: state.error })}</span>
        <button type="button" className={css.linkButton} onClick={state.reload}>{t('retry')}</button>
      </div>
    )
  }
  if (state.data === undefined) return <div className={css.muted} aria-busy="true">{t('loading')}</div>
  return <>{children(state.data)}</>
}

/**
 * Markdown with localized code chrome.
 * @param props - markdown text and streaming flag.
 * @returns rendered markdown.
 */
export function Markdown({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const { t } = useLearn()
  return (
    <div className={css.markdown}>
      <MarkdownText text={text} streaming={streaming} labels={{ code: { copyLabel: t('copy'), copiedLabel: t('copied') },
        footnotes: t('footnotes') }} />
    </div>
  )
}

/**
 * Difficulty pill in LeetCode colors.
 * @param props - difficulty.
 * @returns the pill.
 */
export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const { t } = useLearn()
  return <span className={css.difficulty} data-difficulty={difficulty}>{t(`difficulty.${difficulty}`)}</span>
}

/**
 * Verdict heading colored by outcome.
 * @param props - verdict kind.
 * @returns the label.
 */
export function VerdictLabel({ kind }: { kind: VerdictKind }) {
  const { t } = useLearn()
  return <span className={css.verdict} data-verdict={kind === 'passed-local-tests' ? 'pass' : kind === 'evaluation-unavailable' || kind === 'cancelled' ? 'neutral' : 'fail'}>{t(`verdict.${kind}`)}</span>
}

/**
 * Neutral tag.
 * @param props - content and tone.
 * @returns the tag.
 */
export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'info' | 'success' | 'outline' }) {
  return <Tag tone={tone}>{children}</Tag>
}

/**
 * Compact JSON for case values.
 * @param value - value.
 * @returns one-line JSON, truncated.
 */
export function compact(value: unknown): string {
  const text = value === undefined ? 'undefined' : JSON.stringify(value)
  return text.length > 400 ? `${text.slice(0, 400)}…` : text
}

/**
 * Local time of an ISO instant.
 * @param iso - instant.
 * @param locale - learner locale.
 * @returns short date and time.
 */
export function when(iso: string, locale: LearnLocale): string {
  return new Date(iso).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit',
    minute: '2-digit' })
}
