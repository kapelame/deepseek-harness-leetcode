/** Persisted Learn navigation, so a refresh resumes the same tab, lesson, or workspace. */
import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { AttemptView, ProblemId, ReviewItemId, TopicId } from '@deepseek-ai/dsh-experimental-learn/types'

/** Top-level Learn sections. */
export type LearnTab = 'today' | 'learn' | 'practice' | 'review' | 'progress' | 'settings'

/** Current Learn location. */
export interface LearnRoute {
  readonly tab: LearnTab
  /** Whether the Learn panel was open when the page last rendered; a reload reopens it. */
  readonly open?: boolean
  readonly topicId?: TopicId
  readonly problemId?: ProblemId
  readonly mode?: AttemptView['context']
  readonly reviewItemId?: ReviewItemId
}

const TAB_IDS: readonly LearnTab[] = ['today', 'learn', 'practice', 'review', 'progress', 'settings']

/**
 * Parse a `#learn/<tab>` deep link.
 * @param hash - `location.hash`.
 * @returns the route, or undefined for other hashes.
 */
export function routeFromHash(hash: string): LearnRoute | undefined {
  const match = /^#learn(?:\/([a-z]+))?$/.exec(hash)
  if (match === null) return undefined
  const tab = TAB_IDS.find(item => item === match[1]) ?? 'today'
  return { tab }
}

/**
 * Create the persisted route store.
 * @returns the store, starting at Today when nothing was saved.
 */
export function createRouteStore(): SnapshotStore<LearnRoute> {
  return createSnapshotStore<LearnRoute>({ tab: 'today' }, { persist: { name: 'dsh.learn.route' } })
}
