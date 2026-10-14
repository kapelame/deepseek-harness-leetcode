/** Sidebar glyph for the Learn page; the sidebar owns the accessible label. */
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'

/**
 * Render a graduation-cap outline at the requested size.
 * @param props - sidebar icon share.
 * @returns decorative icon.
 */
export function LearnIcon({ size }: PropsRuntime<'sidebar.panellist'>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 9.5 12 5l9.5 4.5L12 14 2.5 9.5Z" />
      <path d="M6.5 11.5v4c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4" />
      <path d="M21.5 9.5v5" />
    </svg>
  )
}
