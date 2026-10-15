/**
 * Lesson understanding checks: tutor-written questions graded by the tutor
 * through the production agent loop with a scripted model, the gate on the
 * practice problem, skipping after a pass, and the built-in fallback.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { brandString } from '@deepseek-ai/dsh-brand'
import { toolCallResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import { OWNER_LEARNER } from '../src/index.ts'
import type { TopicId } from '../src/types.ts'
import { createLearnFixture, type LearnFixture } from './service-fixture.ts'

const HASHING = brandString<TopicId>('hashing')
const QUESTIONS = [
  { prompt: 'Why does the two-sum scan look up the complement before inserting the current number?' },
  { prompt: 'For nums = [1, 4, 6] and target 10, what does the table hold when the answer is found?' },
  { prompt: 'What is the expected time complexity of the scan?', options: ['O(n)', 'O(n log n)', 'O(n^2)'] },
]

const fixtures: LearnFixture[] = []
afterEach(async () => {
  for (const fixture of fixtures.splice(0)) await fixture.dispose()
})

async function fixture(options: Parameters<typeof createLearnFixture>[0] = {}): Promise<LearnFixture> {
  const created = await createLearnFixture(options)
  fixtures.push(created)
  return created
}

const signal = (): AbortSignal => AbortSignal.timeout(60_000)

describe('lesson checks', () => {
  it('lets the tutor write the questions and decide whether the learner passes', async () => {
    const created = await fixture({ script: [
      toolCallResponse('a1', 'set_check_questions', { questions: [{ prompt: 'too short' }] }),
      toolCallResponse('a2', 'set_check_questions', { questions: QUESTIONS }),
      toolCallResponse('g1', 'record_check_result', { passed: false, summary: 'The first answer misses the key idea.', grades: [
        { questionId: 'q1', passed: false, feedback: 'Think about what happens when a number pairs with itself.' },
        { questionId: 'q2', passed: true, feedback: 'Right.' },
        { questionId: 'q3', passed: true, feedback: 'Yes, one pass with O(1) lookups.' },
      ] }),
      toolCallResponse('g2', 'record_check_result', { passed: true, summary: 'You have the core idea.', grades: [
        { questionId: 'q1', passed: true, feedback: 'Exactly: inserting first could pair an element with itself.' },
      ] }),
      toolCallResponse('g3', 'record_check_result', { passed: true, summary: 'You have the core idea.', grades: [
        { questionId: 'q1', passed: true, feedback: 'Exactly: inserting first could pair an element with itself.' },
        { questionId: 'q2', passed: true, feedback: 'Right.' },
        { questionId: 'q3', passed: true, feedback: 'Right.' },
      ] }),
    ] })
    const { learn, adapter } = created
    expect(learn.lessonCheck(OWNER_LEARNER, HASHING)).toBeUndefined()
    const check = await learn.startLessonCheck(OWNER_LEARNER, HASHING, 'tutor', signal())
    expect(check).toMatchObject({ source: 'tutor', status: 'open', attempts: 0 })
    expect(check.questions.map(question => question.id)).toEqual(['q1', 'q2', 'q3'])
    expect(check.questions[2]?.options).toEqual(['O(n)', 'O(n log n)', 'O(n^2)'])
    // The author saw the lesson itself, and its invalid first call was refused.
    expect(JSON.stringify(adapter.requests[0]?.messages)).toContain('Worked example')
    expect(JSON.stringify(adapter.requests[1]?.messages)).toContain('Invalid questions')

    await expect(learn.submitLessonCheck(OWNER_LEARNER, check.id, { q1: 'x' }, signal())).rejects.toThrow(/every question/)
    await expect(learn.submitLessonCheck(OWNER_LEARNER, check.id, { q1: 'a', q2: 'b', q3: '7' }, signal())).rejects.toThrow(/options/)
    const answers = { q1: 'Because the table only holds earlier indices.', q2: '{1: 0, 4: 1}', q3: '0' }
    const failed = await learn.submitLessonCheck(OWNER_LEARNER, check.id, answers, signal())
    expect(failed).toMatchObject({ status: 'failed', attempts: 1, summary: 'The first answer misses the key idea.' })
    expect(failed.grades?.map(grade => grade.passed)).toEqual([false, true, true])
    expect(() => learn.lesson(OWNER_LEARNER, HASHING, 'problem')).toThrow(/understanding check/)
    // Learner answers reach the grader only as fenced data.
    expect(JSON.stringify(adapter.requests.at(-1)?.messages)).toContain('<learner_answers>')

    const passed = await learn.submitLessonCheck(OWNER_LEARNER, check.id, { ...answers, q1: 'Inserting first could match a number with itself.' },
      signal())
    expect(passed).toMatchObject({ status: 'passed', attempts: 2 })
    expect(JSON.stringify(adapter.requests.at(-1)?.messages)).toContain('Grade every question; missing q2, q3')
    expect(learn.lessonCheck(OWNER_LEARNER, HASHING)?.status).toBe('passed')
    await expect(learn.submitLessonCheck(OWNER_LEARNER, check.id, answers, signal())).rejects.toThrow(/already passed/)
    expect(learn.lesson(OWNER_LEARNER, HASHING, 'problem').stage).toBe('problem')
    expect(learn.skipLesson(OWNER_LEARNER, HASHING)).toMatchObject({ stage: 'complete', skipped: true })
  }, 120_000)

  it('reports a tutor that writes no questions instead of passing silently', async () => {
    const { learn } = await fixture({ script: [toolCallResponse('a1', 'set_check_questions', { questions: 'none' }), 'hang'] })
    const controller = new AbortController()
    const started = learn.startLessonCheck(OWNER_LEARNER, HASHING, 'tutor', controller.signal)
    setTimeout(() => { controller.abort(new Error('stop')) }, 1500)
    await expect(started).rejects.toThrow(/could not write a check/)
    expect(learn.lessonCheck(OWNER_LEARNER, HASHING)).toBeUndefined()
    expect(() => learn.skipLesson(OWNER_LEARNER, HASHING)).toThrow(/understanding check/)
  }, 60_000)

  it('grades the built-in questions by their answer key without a model', async () => {
    const { learn } = await fixture({ model: false })
    const check = await learn.startLessonCheck(OWNER_LEARNER, HASHING, 'authored', signal())
    expect(check.questions.every(question => question.options !== undefined)).toBe(true)
    const result = await learn.submitLessonCheck(OWNER_LEARNER, check.id, { 'insert-order': '1', complexity: '2' }, signal())
    expect(result.status).toBe('passed')
    expect(learn.lesson(OWNER_LEARNER, HASHING, 'problem').stage).toBe('problem')
  }, 60_000)
})
