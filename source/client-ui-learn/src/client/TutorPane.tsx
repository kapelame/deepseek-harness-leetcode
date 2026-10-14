/** Tutor conversation with live guarded streaming and visible failures. */
import { useEffect, useRef, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProblemId, TopicId, TutorMessage, TutorThreadId } from '@deepseek-ai/dsh-experimental-learn/types'
import { Markdown, messageOf, useLearn } from './shared.tsx'
import css from './Learn.module.css'

/** Tutor pane props. */
export interface TutorPaneProps {
  readonly threadId?: TutorThreadId
  readonly problemId?: ProblemId
  readonly topicId?: TopicId
  readonly initial: readonly TutorMessage[]
}

/**
 * Render and follow one tutor thread.
 * @param props - thread and subject.
 * @returns the conversation.
 */
export function TutorPane({ threadId: initialThread, problemId, topicId, initial }: TutorPaneProps) {
  const { api, t } = useLearn()
  const [threadId, setThreadId] = useState(initialThread)
  const [messages, setMessages] = useState<readonly TutorMessage[]>(initial)
  const [progress, setProgress] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | undefined>()
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (threadId === undefined) return
    const abort = new AbortController()
    void api.tutorFollow(threadId, (frame) => {
      if (frame.type === 'snapshot') setMessages(frame.messages)
      if (frame.type === 'progress') setProgress(current => ({ ...current, [frame.messageId]: frame.text }))
      if (frame.type === 'settled') {
        setMessages(current => current.map(item => item.id === frame.message.id ? frame.message : item))
        setProgress((current) => {
          const { [frame.message.id]: _done, ...rest } = current
          return rest
        })
      }
    }, abort.signal).catch((failure: unknown) => { setError(messageOf(failure)) })
    return () => { abort.abort() }
  }, [api, threadId])

  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [messages, progress])

  const streaming = messages.some(item => item.status === 'streaming')
  const send = (): void => {
    const text = draft.trim()
    if (text === '') return
    setError(undefined)
    api.tutorSend(problemId ?? null, topicId ?? null, text).then((sent) => {
      setDraft('')
      setThreadId(sent.threadId)
    }, (failure: unknown) => { setError(messageOf(failure)) })
  }

  return (
    <div className={css.tutor}>
      <div className={css.tutorLog} aria-live="polite">
        {messages.length === 0 && <p className={css.muted}>{t('tutor.empty')}</p>}
        {messages.map(message => (
          <div key={message.id} className={css.message} data-role={message.role}>
            <div className={css.messageAuthor}>{message.role === 'learner' ? t('tutor.you') : t('tutor.name')}</div>
            {message.role === 'learner'
              ? <p className={css.prewrap}>{message.content}</p>
              : <Markdown text={progress[message.id] ?? message.content} streaming={message.status === 'streaming'} />}
            {message.status === 'streaming' && progress[message.id] === undefined && <span className={css.muted}>…</span>}
            {message.status === 'failed' && <p className={css.errorText}>{t('tutor.failed', { error: message.error ?? '' })}</p>}
            {message.status === 'interrupted' && <p className={css.muted}>{t('tutor.interrupted')}</p>}
          </div>
        ))}
        <div ref={end} />
      </div>
      {error !== undefined && <div className={css.errorBox} role="alert">{t('failed', { message: error })}</div>}
      <div className={css.tutorInput}>
        <textarea className={css.textarea} rows={2} value={draft} placeholder={t('tutor.placeholder')} aria-label={t('tutor.placeholder')}
          onChange={(event) => { setDraft(event.target.value) }}
          onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send() } }}
        />
        {streaming && threadId !== undefined
          ? <Button variant="outline" onClick={() => { void api.tutorCancel(threadId) }}>{t('tutor.stop')}</Button>
          : <Button variant="primary" disabled={draft.trim() === ''} onClick={send}>{t('tutor.send')}</Button>}
      </div>
    </div>
  )
}
