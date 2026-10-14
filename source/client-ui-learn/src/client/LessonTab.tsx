/** Roadmap and staged lessons: motivation, strategy, worked example, check, problem, reflection. */
import { useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { LessonProgress, LessonStage, TopicView } from '@deepseek-ai/dsh-experimental-learn/types'
import { TutorPane } from './TutorPane.tsx'
import { Workspace } from './Workspace.tsx'
import { Markdown, messageOf, pick, useLearn } from './shared.tsx'
import css from './Learn.module.css'

const STAGES: readonly LessonStage[] = ['motivation', 'strategy', 'example', 'check', 'problem', 'reflection']

/**
 * Render the roadmap, a lesson, or the lesson's practice workspace.
 * @returns the section.
 */
export function LessonTab() {
  const { route, navigate, overview } = useLearn()
  const topic = overview.topics.find(item => item.id === route.topicId)
  if (topic !== undefined && route.problemId !== undefined) {
    return <Workspace problemId={route.problemId} context="lesson" onBack={() => { navigate({ tab: 'learn', topicId: topic.id }) }} />
  }
  if (topic !== undefined) return <Lesson topic={topic} />
  return <Roadmap />
}

function Roadmap() {
  const { t, locale, overview, navigate } = useLearn()
  const lessons = new Map(overview.lessons.map(item => [item.topicId, item]))
  const mastery = new Map(overview.mastery.map(item => [item.topicId, item]))
  const experienced = overview.settings.experience === 'experienced'
  const titleOf = (id: string): string => pick(overview.topics.find(item => item.id === id)?.title ?? { zh: id, en: id }, locale)
  return (
    <div className={css.stack}>
      <h2>{t('learn.heading')}</h2>
      <ol className={css.roadmap}>
        {overview.topics.map((topic) => {
          const progress = lessons.get(topic.id)
          const level = mastery.get(topic.id)
          const locked = !experienced && topic.prerequisites.some(item => lessons.get(item)?.stage !== 'complete')
          return (
            <li key={topic.id} className={`${css.card ?? ''} ${css.topicCard ?? ''}`} data-locked={locked}>
              <div className={css.row}>
                <span className={css.topicOrder}>{topic.order}</span>
                <strong className={css.cardTitle}>{pick(topic.title, locale)}</strong>
                <span className={css.spacer} />
                <span className={css.level} data-level={level?.level ?? 'not-started'}>{t(`level.${level?.level ?? 'not-started'}`)}</span>
              </div>
              <p>{pick(topic.summary, locale)}</p>
              <div className={css.meter}><div className={css.meterFill} style={{ width: `${String(level?.score ?? 0)}%` }} /></div>
              <div className={css.row}>
                {topic.prerequisites.length > 0 && (
                  <span className={css.muted}>{t('learn.prerequisites', { list: topic.prerequisites.map(titleOf).join(', ') })}</span>
                )}
                <span className={css.muted}>{t('learn.problems', { count: topic.problems.length })}</span>
                <span className={css.muted}>{t(`stage.${progress?.stage ?? 'motivation'}`)}</span>
                <span className={css.spacer} />
                <Button variant={locked ? 'ghost' : 'outline'} size="sm" disabled={locked} title={locked ? t('learn.locked') : undefined} onClick={() => { navigate({ tab: 'learn', topicId: topic.id }) }}>{t('learn.open')}</Button>
              </div>
              {locked && <p className={css.muted}>{t('learn.locked')}</p>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Lesson({ topic }: { topic: TopicView }) {
  const { api, t, locale, overview, navigate, refreshOverview } = useLearn()
  const saved = overview.lessons.find(item => item.topicId === topic.id)
  const [progress, setProgress] = useState<LessonProgress | undefined>(saved)
  const [viewing, setViewing] = useState<LessonStage>(saved === undefined || saved.stage === 'complete' ? 'motivation' : saved.stage)
  const [answers, setAnswers] = useState<Record<string, number>>(saved?.checkAnswers ?? {})
  const [correct, setCorrect] = useState<Record<string, boolean>>({})
  const [reflection, setReflection] = useState(saved?.reflection ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [notice, setNotice] = useState<string | undefined>()
  const lesson = topic.lesson
  const reached = STAGES.indexOf(progress?.stage === 'complete' ? 'reflection' : progress?.stage ?? 'motivation')
  const index = STAGES.indexOf(viewing)

  const go = (stage: LessonStage): void => {
    setError(undefined)
    if (STAGES.indexOf(stage) <= reached || progress?.stage === 'complete') { setViewing(stage); return }
    setBusy(true)
    api.lesson(topic.id, stage, answers).then((result) => {
      setProgress(result.progress)
      setCorrect(result.correct)
      setViewing(stage)
      refreshOverview()
    }, (failure: unknown) => { setError(messageOf(failure)) }).finally(() => { setBusy(false) })
  }

  const checkAnswers = (): void => {
    setBusy(true)
    api.lesson(topic.id, 'check', answers).then((result) => { setProgress(result.progress); setCorrect(result.correct) },
      (failure: unknown) => { setError(messageOf(failure)) })
      .finally(() => { setBusy(false) })
  }

  const skip = (): void => {
    setBusy(true)
    api.skipLesson(topic.id, answers).then((result) => {
      setCorrect(result.correct)
      if (result.progress !== undefined) { setProgress(result.progress); setNotice(t('lesson.skipped')); refreshOverview() } else setNotice(t('lesson.skipFailed'))
    }, (failure: unknown) => { setError(messageOf(failure)) }).finally(() => { setBusy(false) })
  }

  const reflect = (): void => {
    setBusy(true)
    api.reflect(topic.id, reflection, AbortSignal.timeout(180_000)).then((result) => { setProgress(result); refreshOverview() },
      (failure: unknown) => { setError(messageOf(failure)) })
      .finally(() => { setBusy(false) })
  }

  const practice = overview.problems.find(item => item.id === lesson.practiceProblem)
  return (
    <div className={css.lesson}>
      <div className={css.row}>
        <Button variant="ghost" size="sm" onClick={() => { navigate({ tab: 'learn' }) }}>{t('learn.back')}</Button>
        <h2 className={css.problemTitle}>{pick(topic.title, locale)}</h2>
        {progress?.stage === 'complete' && <span className={css.level} data-level="proficient">{t('lesson.completed')}</span>}
      </div>
      <nav className={css.stages} aria-label={t('learn.heading')}>
        {STAGES.map((stage, position) => (
          <button key={stage} type="button" className={css.stage} aria-current={stage === viewing ? 'step' : undefined} data-done={position < reached || progress?.stage === 'complete'} disabled={position > reached + 1 && progress?.stage !== 'complete'} onClick={() => { go(stage) }}>
            {position + 1}. {t(`stage.${stage}`)}
          </button>
        ))}
      </nav>
      <div className={css.lessonBody}>
        {viewing === 'motivation' && <Markdown text={pick(lesson.motivation, locale)} />}
        {viewing === 'strategy' && <Markdown text={pick(lesson.strategy, locale)} />}
        {viewing === 'example' && (
          <div className={css.stack}>
            <h3>{pick(lesson.example.title, locale)}</h3>
            <Markdown text={pick(lesson.example.body, locale)} />
            <div className={css.tableWrap}>
              <table className={css.table}>
                <caption>{t('lesson.traceTitle')}</caption>
                <thead><tr>{lesson.example.traceColumns.map(column => <th key={column} scope="col">{column}</th>)}<th scope="col" /></tr></thead>
                <tbody>
                  {lesson.example.trace.map((step, row) => (
                    <tr key={row}>
                      {lesson.example.traceColumns.map(column => <td key={column}><code>{step.state[column]}</code></td>)}
                      <td>{pick(step.note, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {viewing === 'check' && (
          <div className={css.stack}>
            {lesson.check.map(question => (
              <fieldset key={question.id} className={css.card}>
                <legend className={css.cardTitle}>{pick(question.prompt, locale)}</legend>
                {question.options.map((option, choice) => (
                  <label key={choice} className={css.choice}>
                    <input type="radio" name={question.id} checked={answers[question.id] === choice} onChange={() => { setAnswers(current => ({ ...current, [question.id]: choice })) }} />
                    <span>{pick(option, locale)}</span>
                  </label>
                ))}
                {correct[question.id] !== undefined && (
                  <p className={correct[question.id] === true ? css.success : css.errorText}>
                    {correct[question.id] === true ? t('lesson.correct') : t('lesson.incorrect')}
                    {correct[question.id] === true && <> · {pick(question.explanation, locale)}</>}
                  </p>
                )}
              </fieldset>
            ))}
            <p className={css.muted}>{t('lesson.checkAll')}</p>
            <div className={css.row}>
              <Button variant="outline" disabled={busy} onClick={checkAnswers}>{t('lesson.checkSubmit')}</Button>
              <span className={css.spacer} />
              <span className={css.muted}>{t('lesson.skipHelp')}</span>
              <Button variant="ghost" disabled={busy} onClick={skip}>{t('lesson.skip')}</Button>
            </div>
          </div>
        )}
        {viewing === 'problem' && practice !== undefined && (
          <div className={css.stack}>
            <p>{progress?.stage === 'reflection' || progress?.stage === 'complete' ? t('lesson.problemPassed') : t('lesson.problemIntro')}</p>
            <p className={css.cardTitle}>{practice.leetcode !== undefined && `${String(practice.leetcode.frontendId)}. `}{pick(practice.title, locale)}</p>
            <Button variant="primary" onClick={() => { navigate({ tab: 'learn', topicId: topic.id, problemId: practice.id,
              mode: 'lesson' }) }}>{t('lesson.openProblem')}</Button>
          </div>
        )}
        {viewing === 'reflection' && (
          <div className={css.stack}>
            <Markdown text={pick(lesson.reflectionPrompt, locale)} />
            <textarea className={css.textarea} rows={5} value={reflection} placeholder={t('lesson.reflectionPlaceholder')} onChange={(event) => { setReflection(event.target.value) }} />
            <Button variant="primary" disabled={busy || reflection.trim().length < 10} onClick={reflect}>{t('lesson.reflectionSubmit')}</Button>
            {progress?.stage === 'complete' && progress.reflection !== undefined && (
              <div className={css.card}>
                <strong>{t('lesson.feedback')}</strong>
                {progress.reflectionFeedback === undefined ? <p className={css.muted}>{t('lesson.feedbackUnavailable')}</p> : <Markdown text={progress.reflectionFeedback} />}
              </div>
            )}
          </div>
        )}
      </div>
      {notice !== undefined && <p className={css.note} role="status">{notice}</p>}
      {error !== undefined && <div className={css.errorBox} role="alert">{t('failed', { message: error })}</div>}
      <div className={css.row}>
        <Button variant="ghost" disabled={index === 0} onClick={() => { const previous = STAGES[index - 1]; if (previous !== undefined) setViewing(previous) }}>{t('lesson.previous')}</Button>
        <span className={css.spacer} />
        {index < STAGES.length - 1 && <Button variant="primary" disabled={busy} onClick={() => { const next = STAGES[index + 1]; if (next !== undefined) go(next) }}>{t('lesson.next')}</Button>}
      </div>
      <details className={css.card}>
        <summary>{t('ws.tutor')}</summary>
        <TutorPane topicId={topic.id} initial={[]} />
      </details>
    </div>
  )
}
