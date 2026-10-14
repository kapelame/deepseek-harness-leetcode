/** Browser entry for the experimental Learn page. */
import type { Context } from '@deepseek-ai/cordis'
import learnRemote from '@deepseek-ai/dsh-experimental-api-learn/remote'
import { mountLearn } from './mount.ts'

export { inject } from './mount.ts'

/**
 * Activate the Learn page.
 * @param ctx - Client runtime.
 * @returns complete UI and Remote disposer.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  return await mountLearn(ctx, learnRemote)
}
