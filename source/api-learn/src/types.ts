/** JSON-safe inputs of the experimental Learn Remote namespace. */
import type {} from '@deepseek-ai/dsh-typert-protocol'
import type { VariantRecord } from '@deepseek-ai/dsh-experimental-learn/types'

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    /** The requested problem, topic, attempt, review, thread, or job does not exist for this learner. */
    'learn/not-found': { readonly reason: string }
    /** The request violates a Learn rule (hint order, check answers, input shape). */
    'learn/invalid': { readonly reason: string }
    /** The request conflicts with current state (a reply is streaming, a review is not due). */
    'learn/conflict': { readonly reason: string }
    /** Learn or one of its dependencies (runner, model) cannot serve the request now. */
    'learn/unavailable': { readonly reason: string }
  }
}

/** Target of a review move: days from today, or an explicit local date. */
export type ReviewMoveTarget = { readonly days: number } | { readonly date: string }

/** Generation outcome returned to the Client. */
export interface VariantGenerationView {
  readonly status: 'validated' | 'failed' | 'skipped'
  readonly variant?: VariantRecord
  readonly quarantined: readonly VariantRecord[]
  readonly message: string
}
