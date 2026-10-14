/**
 * Scoped DSH agents for tutoring, judging, reflection feedback, and variant
 * generation. Each run is an ordinary durable Session created through
 * `ctx.agents`; its setup hides every globally registered tool, registers only
 * the Learn tools for that purpose, and replaces the system prompt.
 */
import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import { brandString } from '@deepseek-ai/dsh-brand'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-default-model'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type { ToolDefinition } from '@deepseek-ai/dsh-tools'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { SessionId } from '@deepseek-ai/dsh-session'

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    /**
     * Learn-owned prompt for one tutoring, judging, reflection, or variant-generation run.
     * Readers preserve the message without this producer; nothing reads the kind back.
     * @persistenceAttribution
     */
    learn: {
      readonly kind: 'learn'
      readonly purpose: LearnAgentPurpose
    }
  }
}

/** Why a Learn agent runs; recorded in the message source and Session id. */
export type LearnAgentPurpose = 'tutor' | 'judge' | 'variant' | 'reflection'

/** One agent run request. */
export interface LearnAgentRun {
  readonly purpose: LearnAgentPurpose
  /** Complete system prompt; no other section reaches this agent. */
  readonly system: string
  /** The only tools the model can see or call. */
  readonly tools: readonly ToolDefinition[]
  /** User-role prompt with the grounded learning context. */
  readonly prompt: string
  readonly signal: AbortSignal
  /** Live text deltas for streaming UIs. */
  readonly onText?: (delta: string) => void
}

/** Settled agent run. Only `completed` carries trustworthy model text. */
export interface LearnAgentResult {
  readonly status: 'completed' | 'failed' | 'cancelled' | 'unavailable'
  /** Final assistant text of the turn; may be partial for failed and cancelled runs. */
  readonly text: string
  readonly sessionId?: SessionId
  readonly model?: string
  readonly error?: string
}

/**
 * Run one Learn agent turn and wait for it to settle.
 * @param ctx - Host context owning the agent.
 * @param run - prompt, tools, and cancellation.
 * @returns the settled result; model outages settle as `failed` or `unavailable`, never as success.
 */
export async function runLearnAgent(ctx: Context, run: LearnAgentRun): Promise<LearnAgentResult> {
  const agents = ctx.get('agents')
  const defaults = ctx.get('agentDefaultModel')
  if (agents === undefined || defaults === undefined) {
    return { status: 'unavailable', text: '', error: 'No agent runtime or default model is composed in this profile.' }
  }
  let selection: ReturnType<typeof defaults.currentSelection>
  try {
    selection = defaults.currentSelection()
  } catch (error) {
    return { status: 'unavailable', text: '',
      error: `No default model is configured: ${error instanceof Error ? error.message : String(error)}` }
  }
  if (selection.provider === '' || selection.model === '') {
    return { status: 'unavailable', text: '', error: 'No default model is configured.' }
  }
  // Read through a function: the signal changes across awaits, which narrowing does not model.
  const aborted = (): boolean => run.signal.aborted
  if (aborted()) return { status: 'cancelled', text: '' }
  const sessionId = brandString<SessionId>(`learn-${run.purpose}-${randomUUID()}`)
  const model = `${selection.provider}/${selection.model}`
  let streamed = ''
  let finalText = ''
  let reason: { kind: string; message?: string } | undefined
  const stopEvents = ctx.on('session/event', (session, event) => {
    if (session.id !== sessionId) return
    if (event.type === 'assistant/message') {
      const joined = event.data.message.content.filter(block => block.type === 'text').map(block => block.text).join('')
      if (joined !== '') finalText = joined
    }
    if (event.type === 'turn/end') {
      const ended = event.data.reason
      reason = ended.kind === 'error' ? { kind: 'error', message: ended.error.message } : { kind: ended.kind }
    }
  })
  let handle: Awaited<ReturnType<typeof agents.create>> | undefined
  try {
    handle = await agents.create({
      sessionId,
      signal: run.signal,
      // No cwd: Learn Sessions use no file tools, load no workspace
      // instructions, and stay out of workspace Session lists once settled.
      meta: {},
      agentOptions: {
        provider: selection.provider,
        model: selection.model,
        ...selection.reasoningEffort === undefined ? {} : { reasoningEffort: selection.reasoningEffort },
      },
      setup: (agentCtx) => {
        agentCtx.tools.restrict({ allow: [] })
        for (const tool of run.tools) agentCtx.tools.register(tool)
        agentCtx.systemPrompt.section({ name: `learn:${run.purpose}`, order: 0, text: run.system, interpolate: false, complete: true })
        agentCtx.on('agent/assistant-stream', ({ frame }) => {
          if (frame.type === 'start') streamed = ''
          if (frame.type === 'chunk' && frame.chunk.type === 'text-delta') {
            streamed += frame.chunk.text
            run.onText?.(frame.chunk.text)
          }
        })
      },
    })
    const agent = handle.agent
    const cancel = (): void => { agent.cancel({ kind: 'user' }) }
    run.signal.addEventListener('abort', cancel, { once: true })
    try {
      agent.followup(createUserMessage({ content: [{ type: 'text', text: run.prompt }], source: { kind: 'learn', purpose: run.purpose } }))
      await agent.whenIdle()
    } finally {
      run.signal.removeEventListener('abort', cancel)
    }
  } catch (error) {
    if (aborted()) return { status: 'cancelled', text: streamed, sessionId, model }
    return { status: 'failed', text: streamed, sessionId, model, error: error instanceof Error ? error.message : String(error) }
  } finally {
    stopEvents()
    if (handle !== undefined) {
      try {
        await handle.dispose()
      } catch (error) {
        ctx.logger.warn(`learn: disposing ${sessionId} failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
  const settled = reason
  if (settled?.kind === 'completed' || settled?.kind === 'max-tokens') return { status: 'completed', text: finalText, sessionId, model }
  if (settled?.kind === 'aborted' || aborted()) return { status: 'cancelled', text: finalText || streamed, sessionId, model }
  return { status: 'failed', text: finalText || streamed, sessionId, model,
    error: settled?.message ?? `The model turn ended as ${settled?.kind ?? 'unknown'}.` }
}
