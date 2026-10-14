/** Lifecycle of the Learn Remote namespace, dictionaries, page, and sidebar entry. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client'
import type { TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { createLearnApi } from './api.ts'
import { LearnIcon } from './LearnIcon.tsx'
import { LearnPage, type LearnPageInjected } from './LearnPage.tsx'
import { en, NS, zh } from './locales.ts'
import { createRouteStore, routeFromHash, type LearnRoute } from './route.ts'

/** Services the Learn page needs. */
export const inject = ['remote', 'slots', 'locale', 'layout']

/** Main panel id of the Learn page. */
export const LEARN_PANEL = 'learn' as MainPanelId

function registerUi(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'learn: dictionaries')
  const t = ctx.locale.bind(NS)
  const route = createRouteStore()
  const api = createLearnApi(ctx)
  const navigate = (next: LearnRoute): void => { route.set({ ...next, open: true }) }
  const setOpen = (open: boolean): void => { if (route.getSnapshot().open !== open) route.set({ ...route.getSnapshot(), open }) }
  const select = (): void => {
    try {
      ctx.layout.selectPanel(LEARN_PANEL)
    } catch (error) {
      ctx.logger.warn(`learn: could not open the Learn panel: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  const openFromHash = (): boolean => {
    const linked = routeFromHash(window.location.hash)
    if (linked === undefined) return false
    navigate(linked)
    select()
    return true
  }
  ctx.effect(() => {
    const onHash = (): void => { openFromHash() }
    window.addEventListener('hashchange', onHash)
    return () => { window.removeEventListener('hashchange', onHash) }
  }, 'learn: deep links')
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main', key: LEARN_PANEL, locale: NS,
    inject: (): LearnPageInjected => ({ api, hooks: { route }, navigate, setOpen }),
  }, LearnPage))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist', id: LEARN_PANEL, order: 15, locale: NS, label: () => t('title'),
  }, LearnIcon))
  // The panel exists only after the slot registration above settles, so a
  // deep link or a reload that should reopen Learn selects it afterwards.
  const restore = setTimeout(() => { if (!openFromHash() && route.getSnapshot().open === true) select() }, 0)
  ctx.effect(() => () => { clearTimeout(restore) }, 'learn: restore panel')
}

/**
 * Mount the experimental namespace and the page together.
 * @param ctx - Client runtime.
 * @param contribution - generated Learn Remote definitions.
 * @returns disposer joining UI and Remote withdrawal.
 */
export async function mountLearn(ctx: Context, contribution: TypertRemoteContribution): Promise<() => Promise<void>> {
  const disposeRemote = await ctx.remote.$mount(contribution)
  const ui = ctx.inject(['remote.learn', 'slots', 'locale', 'layout'], registerUi)
  try { await ui } catch (error) { await ui.dispose(); await disposeRemote(); throw error }
  return async () => { await ui.dispose(); await disposeRemote() }
}
