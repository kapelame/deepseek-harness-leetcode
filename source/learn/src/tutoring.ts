/**
 * Hints, tutor conversations, and reflection feedback. Hint levels are
 * enforced here, not by the prompt: a learner receives one level at a time,
 * the solution needs explicit confirmation, and tutor text is guarded against
 * solution code until then. Model failures never produce fabricated replies.
 */
import { randomUUID } from 'node:crypto'
import { brandString } from '@deepseek-ai/dsh-brand'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type {
  HintLevel, HintView, LearnerId, LearnLocale, LessonProgress, ProblemId, TopicId, TutorMessage, TutorStreamFrame, TutorThreadId,
} from './types.ts'
import type { ProblemDefinition } from './content/catalog.ts'
import { HINT_LEVELS, pick, problemBlock, reflectionSystemPrompt, tutorSystemPrompt } from './agents/prompts.ts'
import { runLearnAgent } from './agents/runtime.ts'
import { guardTutorText } from './tutor/guard.ts'
import { LearnError } from './judging.ts'
import { toJson } from './json.ts'
import type { LearnRuntime } from './runtime.ts'

interface ThreadLive {
  readonly listeners: Set<(frame: TutorStreamFrame) => void>
  active?: { readonly messageId: string; readonly abort: AbortController } | undefined
}

/**
 * Guard partially streamed text: an unclosed fence is hidden until it closes.
 * @param raw - text so far.
 * @param entries - entry names.
 * @param locale - locale.
 * @param revealed - solution already requested.
 * @returns text safe to show.
 */
function guardStreaming(raw: string, entries: readonly string[], locale: LearnLocale, revealed: boolean): string {
  if (revealed) return raw
  const fences = raw.split('```').length - 1
  const closed = fences % 2 === 0 ? raw : `${raw.slice(0, raw.lastIndexOf('```'))}\n…`
  return guardTutorText(closed, entries, locale).text
}

/** Hint, chat, and reflection orchestration. */
export class Tutoring {
  private readonly threads = new Map<TutorThreadId, ThreadLive>()
  private readonly running = new Set<Promise<void>>()

  constructor(private readonly runtime: LearnRuntime) {}

  private live(thread: TutorThreadId): ThreadLive {
    let entry = this.threads.get(thread)
    if (entry === undefined) {
      entry = { listeners: new Set() }
      this.threads.set(thread, entry)
    }
    return entry
  }

  private emit(thread: TutorThreadId, frame: TutorStreamFrame): void {
    for (const listener of this.live(thread).listeners) {
      try {
        listener(frame)
      } catch (error) {
        this.runtime.host.logger.warn(`learn: tutor listener failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  /**
   * Thread id for a subject, created on first use.
   * @param learner - learner.
   * @param subject - `problem:<id>` or `topic:<id>`.
   * @returns the thread id.
   */
  thread(learner: LearnerId, subject: string): TutorThreadId {
    return this.runtime.store.thread(learner, subject, brandString<TutorThreadId>(`thr-${randomUUID()}`), this.runtime.iso())
  }

  private ownedThread(learner: LearnerId, thread: TutorThreadId): string {
    const owner = this.runtime.store.threadOwner(thread)
    if (owner?.learner !== learner) throw new LearnError('not-found', 'Unknown tutor thread')
    return owner.subject
  }

  private solutionRevealed(learner: LearnerId, problem: ProblemId): boolean {
    return this.runtime.store.hints(learner, problem).some(hint => hint.level === 4)
  }

  private latestResult(learner: LearnerId, problem: ProblemId): string {
    const [latest] = this.runtime.store.attempts(learner, problem, 1)
    if (latest?.verdict === undefined) return 'No run or submission yet.'
    const verdict = latest.verdict
    return JSON.stringify({
      kind: latest.kind, verdict: verdict.kind, passed: verdict.passed, total: verdict.total,
      ...verdict.message === undefined ? {} : { message: verdict.message },
      ...verdict.failing === undefined ? {} : { failingCase: verdict.failing },
    })
  }

  private currentCode(learner: LearnerId, problem: ProblemId): { language: string; code: string } | undefined {
    const preferred = this.runtime.settings(learner).preferredLanguage
    const drafts = this.runtime.store.drafts(learner, problem).sort((left, right) => left.updatedAt < right.updatedAt ? 1 : -1)
    const draft = drafts.find(item => item.language === preferred) ?? drafts[0]
    return draft === undefined ? undefined : { language: draft.language, code: draft.code }
  }

  private contextBlock(learner: LearnerId, definition: ProblemDefinition, locale: LearnLocale): string {
    const code = this.currentCode(learner, definition.id)
    const hints = this.runtime.store.hints(learner, definition.id)
    return [
      problemBlock(definition, locale),
      `Learner experience: ${this.runtime.settings(learner).experience}.`,
      `Recent mistake tags on this topic: ${this.runtime.recentMistakeTags(learner, this.runtime.problems.topicOf(definition)).join(', ') || 'none'}.`,
      `Hints already given: ${hints.length === 0 ? 'none' : hints.map(hint => `level ${String(hint.level)}`).join(', ')}.`,
      '<execution_output>',
      this.latestResult(learner, definition.id),
      '</execution_output>',
      '<learner_code>',
      code === undefined ? '(no code yet)' : `language=${code.language}\n${code.code}`,
      '</learner_code>',
    ].join('\n')
  }

  /**
   * Deliver the next hint level.
   * @param learner - learner.
   * @param problemId - problem.
   * @param level - requested level; at most one above the highest delivered.
   * @param confirmReveal - required for level 4.
   * @param signal - cancellation.
   * @returns the stored hint.
   */
  async hint(learner: LearnerId, problemId: ProblemId, level: HintLevel, confirmReveal: boolean, signal: AbortSignal): Promise<HintView> {
    const definition = this.runtime.problems.get(learner, problemId)
    if (definition === undefined) throw new LearnError('not-found', `Unknown problem ${problemId}`)
    if (![1, 2, 3, 4].includes(level)) throw new LearnError('invalid', 'Hint level must be 1-4')
    const highest = Math.max(0, ...this.runtime.store.hints(learner, problemId).map(item => item.level))
    if (level > highest + 1) throw new LearnError('invalid', `Request hint level ${String(highest + 1)} before level ${String(level)}`)
    if (level === 4 && !confirmReveal) throw new LearnError('invalid', 'Viewing the solution requires explicit confirmation')
    const locale = this.runtime.settings(learner).locale
    const authored = level === 4
      ? `${pick(definition.solution.explanation, locale)}\n\n\`\`\`python\n${definition.solution.python.trimEnd()}\n\`\`\``
      : pick(definition.hints[level - 1] ?? definition.summary, locale)
    let content = authored
    let source: HintView['source'] = 'authored'
    if (this.runtime.tutorAvailable()) {
      const result = await runLearnAgent(this.runtime.host, {
        purpose: 'tutor',
        system: tutorSystemPrompt(locale, level === 4),
        tools: [],
        prompt: [
          this.contextBlock(learner, definition, locale),
          `Give exactly one hint. ${HINT_LEVELS[level]}`,
          level === 4 ? `Reference walk-through:\n${pick(definition.solution.explanation, locale)}\nSolution code:\n${definition.solution.python}` : `Authored hint for this level, which you may adapt to the learner's code: ${authored}`,
        ].join('\n'),
        signal,
      })
      this.runtime.noteAgentResult(result)
      if (result.status === 'completed' && result.text.trim() !== '') {
        content = level === 4 ? result.text : guardTutorText(result.text, Object.values(definition.entry), locale).text
        source = 'tutor'
      }
    }
    const hint: HintView = { level, source, content, createdAt: this.runtime.iso() }
    this.runtime.store.insertHint(learner, problemId, hint)
    return hint
  }

  /**
   * Post a learner message and start the tutor reply in the background.
   * @param learner - learner.
   * @param subject - problem or topic the conversation is about.
   * @param text - learner text.
   * @returns the thread and the pending tutor message id.
   */
  send(learner: LearnerId, subject: { problemId?: ProblemId; topicId?: TopicId },
    text: string): { threadId: TutorThreadId; messageId: string } {
    const body = text.trim()
    if (body === '' || body.length > 4000) throw new LearnError('invalid', 'Message must be 1-4000 characters')
    const definition = subject.problemId === undefined ? undefined : this.runtime.problems.get(learner, subject.problemId)
    const topics = this.runtime.problems.curriculum.topics
    const topic = subject.topicId === undefined ? undefined : topics.find(item => item.id === subject.topicId)
    if (definition === undefined && topic === undefined) throw new LearnError('not-found', 'Unknown tutor subject')
    const threadId = this.thread(learner, definition === undefined ? `topic:${topic?.id ?? ''}` : `problem:${definition.id}`)
    const live = this.live(threadId)
    if (live.active !== undefined) throw new LearnError('conflict', 'The tutor is still answering the previous message')
    const now = this.runtime.iso()
    const learnerMessage: TutorMessage = { id: `msg-${randomUUID()}`, role: 'learner', content: body, status: 'complete', createdAt: now }
    const reply: TutorMessage = { id: `msg-${randomUUID()}`, role: 'tutor', content: '', status: 'streaming', createdAt: now }
    this.runtime.store.appendMessage(threadId, learnerMessage)
    this.runtime.store.appendMessage(threadId, reply)
    this.emit(threadId, { type: 'snapshot', messages: this.runtime.store.messages(threadId) })
    const locale = this.runtime.settings(learner).locale
    if (!this.runtime.tutorAvailable()) {
      const error = locale === 'zh' ? '导师模型不可用（未配置模型或服务中断），你的消息已保存。' : 'The tutor model is unavailable (no model configured or the provider failed). Your message is saved.'
      this.settle(threadId, reply.id, '', 'failed', error)
      return { threadId, messageId: reply.id }
    }
    const abort = new AbortController()
    live.active = { messageId: reply.id, abort }
    const task = this.reply(learner, threadId, reply.id, definition, topic?.id, abort.signal).finally(() => {
      live.active = undefined
      this.running.delete(task)
    })
    this.running.add(task)
    return { threadId, messageId: reply.id }
  }

  private settle(thread: TutorThreadId, messageId: string, content: string, status: TutorMessage['status'], error?: string): void {
    this.runtime.store.settleMessage(messageId, content, status, error)
    const message = this.runtime.store.messages(thread).find(item => item.id === messageId)
    if (message !== undefined) this.emit(thread, { type: 'settled', message })
  }

  private async reply(learner: LearnerId, thread: TutorThreadId, messageId: string, definition: ProblemDefinition | undefined,
    topicId: TopicId | undefined, signal: AbortSignal): Promise<void> {
    const locale = this.runtime.settings(learner).locale
    const revealed = definition !== undefined && this.solutionRevealed(learner, definition.id)
    const entries = definition === undefined ? [] : Object.values(definition.entry)
    const transcript = this.runtime.store.messages(thread).filter(item => item.id !== messageId).slice(-10)
    const topic = this.runtime.problems.curriculum.topics.find(item => item.id === (topicId ?? definition?.topics[0]))
    const tools = definition === undefined ? [] : [defineTool({
      name: 'run_learner_code',
      description: 'Run the learner\'s current code and the reference on one input you choose, returning both outputs. Use it to check behaviour instead of guessing.',
      parameters: { args: { type: 'array', items: { type: 'json' }, required: true,
        description: `Argument list matching (${definition.params.map(item => `${item.name}: ${item.type}`).join(', ')}).` } },
      output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
      execute: async (args, exec) => {
        const code = this.currentCode(learner, definition.id)
        if (code === undefined) throw new Error('The learner has no code yet.')
        return toJson(await this.runtime.runOnInput(learner, definition,
          code.language === 'typescript' ? 'typescript' : 'python', code.code, args.args, exec.signal))
      },
    })]
    const prompt = [
      topic === undefined ? '' : `Topic: ${pick(topic.title, locale)}. Lesson summary: ${pick(topic.summary, locale)}`,
      definition === undefined ? '' : this.contextBlock(learner, definition, locale),
      'Conversation so far (oldest first):',
      ...transcript.map(item => item.role === 'learner' ? `<learner_message>\n${item.content}\n</learner_message>` : `Tutor: ${item.content}`),
      'Reply to the latest learner message.',
    ].filter(line => line !== '').join('\n')
    let raw = ''
    const result = await runLearnAgent(this.runtime.host, {
      purpose: 'tutor', system: tutorSystemPrompt(locale, revealed), tools, prompt, signal,
      onText: (delta) => {
        raw += delta
        this.emit(thread, { type: 'progress', messageId, text: guardStreaming(raw, entries, locale, revealed) })
      },
    })
    this.runtime.noteAgentResult(result)
    const text = result.text !== '' ? result.text : raw
    const guarded = revealed ? text : guardTutorText(text, entries, locale).text
    switch (result.status) {
      case 'completed': this.settle(thread, messageId, guarded, 'complete'); break
      case 'cancelled': this.settle(thread, messageId, guarded, 'interrupted', 'Cancelled.'); break
      case 'failed':
      case 'unavailable':
        this.settle(thread, messageId, guarded, 'failed', result.error ?? 'The tutor model failed.')
        break
      default: {
        const unreachable: never = result.status
        throw new Error(`unexpected status ${String(unreachable)}`)
      }
    }
  }

  /**
   * Cancel the active tutor reply of a thread.
   * @param learner - learner.
   * @param thread - thread.
   */
  cancel(learner: LearnerId, thread: TutorThreadId): void {
    this.ownedThread(learner, thread)
    this.threads.get(thread)?.active?.abort.abort(new Error('Cancelled by the learner'))
  }

  /**
   * Follow a thread: one snapshot, then live progress and settled frames.
   * @param learner - learner.
   * @param thread - thread.
   * @param signal - observation lifetime.
   * @returns frames until the signal aborts.
   */
  async *follow(learner: LearnerId, thread: TutorThreadId, signal: AbortSignal): AsyncIterable<TutorStreamFrame> {
    this.ownedThread(learner, thread)
    const queue: TutorStreamFrame[] = []
    let wake: (() => void) | undefined
    const listener = (frame: TutorStreamFrame): void => { queue.push(frame); wake?.() }
    const live = this.live(thread)
    live.listeners.add(listener)
    const onAbort = (): void => { wake?.() }
    signal.addEventListener('abort', onAbort, { once: true })
    try {
      yield { type: 'snapshot', messages: this.runtime.store.messages(thread) }
      while (!signal.aborted) {
        const frame = queue.shift()
        if (frame !== undefined) { yield frame; continue }
        await new Promise<void>((resolve) => { wake = resolve })
        wake = undefined
      }
    } finally {
      live.listeners.delete(listener)
      signal.removeEventListener('abort', onAbort)
    }
  }

  /**
   * Store a lesson reflection and, when a model is available, tutor feedback.
   * @param learner - learner.
   * @param topicId - topic.
   * @param text - learner explanation.
   * @param signal - cancellation.
   * @returns the updated lesson progress.
   */
  async reflect(learner: LearnerId, topicId: TopicId, text: string, signal: AbortSignal): Promise<LessonProgress> {
    const topic = this.runtime.problems.curriculum.topics.find(item => item.id === topicId)
    if (topic === undefined) throw new LearnError('not-found', `Unknown topic ${topicId}`)
    const body = text.trim()
    if (body.length < 10 || body.length > 4000) throw new LearnError('invalid', 'Reflection must be 10-4000 characters')
    const locale = this.runtime.settings(learner).locale
    const existing = this.runtime.store.lessons(learner).find(item => item.topicId === topicId)
    let feedback: string | undefined
    if (this.runtime.tutorAvailable()) {
      const practice = this.runtime.problems.get(learner, topic.lesson.practiceProblem)
      const result = await runLearnAgent(this.runtime.host, {
        purpose: 'reflection',
        system: reflectionSystemPrompt(locale),
        tools: [],
        prompt: [
          `Topic: ${pick(topic.title, locale)}`,
          `What the lesson taught: ${pick(topic.lesson.strategy, locale)}`,
          `Reflection prompt: ${pick(topic.lesson.reflectionPrompt, locale)}`,
          practice === undefined ? '' : `Latest result on the practice problem: ${this.latestResult(learner, practice.id)}`,
          `<learner_message>\n${body}\n</learner_message>`,
        ].join('\n'),
        signal,
      })
      this.runtime.noteAgentResult(result)
      if (result.status === 'completed' && result.text.trim() !== '') feedback = guardTutorText(result.text, [], locale).text
    }
    const progress: LessonProgress = {
      topicId,
      stage: 'complete',
      checkAnswers: existing?.checkAnswers ?? {},
      skipped: existing?.skipped ?? false,
      reflection: body,
      ...feedback === undefined ? {} : { reflectionFeedback: feedback },
      completedAt: existing?.completedAt ?? this.runtime.iso(),
    }
    this.runtime.store.saveLesson(learner, progress, this.runtime.iso())
    return progress
  }

  /** Abort active replies and wait for them during disposal. */
  async dispose(): Promise<void> {
    for (const live of this.threads.values()) live.active?.abort.abort(new Error('Learn service disposed'))
    await Promise.allSettled([...this.running])
    this.threads.clear()
  }
}
