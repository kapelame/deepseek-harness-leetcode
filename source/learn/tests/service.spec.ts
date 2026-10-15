/**
 * Learning loop through the composed service: lesson stages, Run and Submit
 * on an authentic problem, persistence across a Host restart, hint evidence,
 * agent judging that cannot override execution, and model outages.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { rm } from 'node:fs/promises'
import { brandString } from '@deepseek-ai/dsh-brand'
import { textResponse, toolCallResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import { OWNER_LEARNER } from '../src/index.ts'
import type { ProblemId, TopicId } from '../src/types.ts'
import { createDockerRunner } from './runner-fixture.ts'
import { createLearnFixture, type LearnFixture } from './service-fixture.ts'

const probe = await createDockerRunner()
await probe.dispose()

const TWO_SUM = brandString<ProblemId>('two-sum')
const HASHING = brandString<TopicId>('hashing')
const WRONG = 'class Solution:\n    def twoSum(self, nums, target):\n        for i in range(len(nums)):\n            for j in range(i, len(nums)):\n                if nums[i] + nums[j] == target:\n                    return [i, j]\n        return []\n'
const CORRECT = 'class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for i, x in enumerate(nums):\n            if target - x in seen:\n                return [seen[target - x], i]\n            seen[x] = i\n        return []\n'

const fixtures: LearnFixture[] = []
afterEach(async () => {
  for (const fixture of fixtures.splice(0)) await fixture.dispose()
})

async function fixture(options: Parameters<typeof createLearnFixture>[0] = {}): Promise<LearnFixture> {
  const created = await createLearnFixture(options)
  fixtures.push(created)
  return created
}

describe.skipIf(!probe.ready)('learning loop', () => {
  it('teaches a lesson, judges an authentic problem, and survives a Host restart', async () => {
    const first = await createLearnFixture({ model: false })
    const { learn, dataRoot } = first
    learn.lesson(OWNER_LEARNER, HASHING, 'strategy')
    learn.lesson(OWNER_LEARNER, HASHING, 'example')
    learn.lesson(OWNER_LEARNER, HASHING, 'check')
    await expect(learn.startLessonCheck(OWNER_LEARNER, HASHING, 'tutor', AbortSignal.timeout(10_000))).rejects.toThrow(/default model/)
    const check = await learn.startLessonCheck(OWNER_LEARNER, HASHING, 'authored', AbortSignal.timeout(10_000))
    const missed = await learn.submitLessonCheck(OWNER_LEARNER, check.id, { 'insert-order': '0', complexity: '2' }, AbortSignal.timeout(10_000))
    expect(missed).toMatchObject({ status: 'failed', attempts: 1 })
    expect(missed.grades?.map(grade => grade.passed)).toEqual([false, true])
    expect(() => learn.lesson(OWNER_LEARNER, HASHING, 'problem')).toThrow(/understanding check/)
    const cleared = await learn.submitLessonCheck(OWNER_LEARNER, check.id, { 'insert-order': '1', complexity: '2' }, AbortSignal.timeout(10_000))
    expect(cleared).toMatchObject({ status: 'passed', attempts: 2 })
    expect(learn.lesson(OWNER_LEARNER, HASHING, 'problem').stage).toBe('problem')

    learn.saveDraft(OWNER_LEARNER, TWO_SUM, 'python', WRONG)
    const run = await learn.run(OWNER_LEARNER, { problemId: TWO_SUM, language: 'python', code: WRONG, customInputs: [[[1, 9, 4], 13]] },
      AbortSignal.timeout(60_000))
    expect(run.verdict?.kind).toBe('wrong-answer')
    expect(run.verdict?.cases?.find(item => item.caseId === 'custom-1')).toMatchObject({ expected: [1, 2], actual: [1, 2], passed: true })

    const wrong = await learn.submit(OWNER_LEARNER, { problemId: TWO_SUM, language: 'python', code: WRONG, context: 'lesson' },
      AbortSignal.timeout(120_000))
    expect(wrong.verdict).toMatchObject({ kind: 'wrong-answer', suite: 'full', suiteVersion: 1 })
    expect(wrong.verdict?.failing?.caseId).toBeDefined()
    expect(wrong.verdict?.coverageNote.en).toMatch(/not LeetCode acceptance/)
    expect(wrong.judgeMode).toBe('deterministic-fallback')
    expect(wrong.assessment?.source).toBe('unavailable')

    const syntax = await learn.submit(OWNER_LEARNER, { problemId: TWO_SUM, language: 'python',
      code: 'class Solution:\n    def twoSum(self, nums, target)\n        return []', context: 'lesson' }, AbortSignal.timeout(60_000))
    expect(syntax.verdict?.kind).toBe('compile-error')

    learn.saveDraft(OWNER_LEARNER, TWO_SUM, 'python', CORRECT)
    const passed = await learn.submit(OWNER_LEARNER, { problemId: TWO_SUM, language: 'python', code: CORRECT, context: 'lesson' },
      AbortSignal.timeout(120_000))
    expect(passed.verdict?.kind).toBe('passed-local-tests')
    expect(passed.verdict?.passed).toBe(passed.verdict?.total)
    expect(passed.support).toBe('independent')
    expect(passed.verdict?.peakMemoryKb).toBeGreaterThan(1024)
    expect(learn.store.lessons(OWNER_LEARNER).find(item => item.topicId === HASHING)?.stage).toBe('reflection')

    // LeetCode-style record: every graded submission counts, one problem solved, one active day.
    const { stats } = learn.progressView(OWNER_LEARNER)
    expect(stats.submissions).toEqual({ total: 3, passed: 1 })
    expect(stats.solved.byDifficulty.easy.solved).toBe(1)
    expect(stats.solved.solved).toBe(1)
    expect(stats.solved.total).toBeGreaterThanOrEqual(100)
    expect(stats.calendar).toEqual([{ date: stats.today, count: 3 }])
    expect(stats.streak).toEqual({ current: 1, longest: 1 })
    expect(stats.recentPassed.map(item => item.problemId)).toEqual([TWO_SUM])

    await first.ctx.fiber.dispose()
    const second = await fixture({ model: false, dataRoot })
    const workspace = second.learn.workspace(OWNER_LEARNER, TWO_SUM)
    expect(workspace.drafts.python?.code).toBe(CORRECT)
    expect(workspace.attempts.map(item => item.verdict?.kind)).toEqual(['passed-local-tests', 'compile-error', 'wrong-answer',
      'wrong-answer'])
    expect(workspace.status).toBe('solved')
    expect(workspace.reviewItemId).toBeDefined()
    expect(second.learn.store.lessons(OWNER_LEARNER).find(item => item.topicId === HASHING)?.stage).toBe('reflection')
    const completed = await second.learn.reflect(OWNER_LEARNER, HASHING,
      'The table maps each value to its index; querying first prevents self pairs. O(n) time, O(n) space.', AbortSignal.timeout(10_000))
    expect(completed.stage).toBe('complete')
    expect(completed.reflectionFeedback).toBeUndefined()
    await rm(dataRoot, { recursive: true, force: true })
  }, 300_000)

  it('records hint dependence and studied solutions as weaker evidence than independent solves', async () => {
    const { learn } = await fixture({ model: false })
    const duplicate = brandString<ProblemId>('contains-duplicate')
    await expect(learn.hint(OWNER_LEARNER, duplicate, 2, false, AbortSignal.timeout(5000))).rejects.toThrow(/level 1/)
    const first = await learn.hint(OWNER_LEARNER, duplicate, 1, false, AbortSignal.timeout(5000))
    expect(first).toMatchObject({ level: 1, source: 'authored' })
    const assisted = await learn.submit(OWNER_LEARNER, { problemId: duplicate, language: 'python',
      code: 'class Solution:\n    def containsDuplicate(self, nums):\n        return len(set(nums)) != len(nums)\n', context: 'practice' }, AbortSignal.timeout(120_000))
    expect(assisted).toMatchObject({ support: 'with-hints', hintsUsed: 1 })
    expect(assisted.verdict?.kind).toBe('passed-local-tests')

    const anagrams = brandString<ProblemId>('group-anagrams')
    await learn.hint(OWNER_LEARNER, anagrams, 1, false, AbortSignal.timeout(5000))
    await learn.hint(OWNER_LEARNER, anagrams, 2, false, AbortSignal.timeout(5000))
    await learn.hint(OWNER_LEARNER, anagrams, 3, false, AbortSignal.timeout(5000))
    await expect(learn.hint(OWNER_LEARNER, anagrams, 4, false, AbortSignal.timeout(5000))).rejects.toThrow(/confirmation/)
    const solution = await learn.hint(OWNER_LEARNER, anagrams, 4, true, AbortSignal.timeout(5000))
    expect(solution.content).toContain('```python')
    const studied = await learn.submit(OWNER_LEARNER, { problemId: anagrams, language: 'python', code: 'class Solution:\n    def groupAnagrams(self, strs):\n        groups = {}\n        for word in strs:\n            groups.setdefault("".join(sorted(word)), []).append(word)\n        return list(groups.values())\n', context: 'practice' }, AbortSignal.timeout(120_000))
    expect(studied.support).toBe('studied-solution')

    const independent = await learn.submit(OWNER_LEARNER, { problemId: TWO_SUM, language: 'python', code: CORRECT, context: 'practice' }, AbortSignal.timeout(120_000))
    expect(independent.support).toBe('independent')

    const mastery = learn.progressView(OWNER_LEARNER).mastery.find(item => item.topicId === HASHING)
    expect(mastery).toMatchObject({ independentSolves: 1, assistedSolves: 1, studiedSolutions: 1 })
    const reasons = learn.store.reviewItems(OWNER_LEARNER).map(item => [item.parentProblemId, item.lastReason?.en])
    expect(reasons).toContainEqual(['two-sum', expect.stringMatching(/independent/)])
    expect(reasons).toContainEqual(['group-anagrams', expect.stringMatching(/with help/)])
  }, 300_000)

  it('keeps the execution verdict when the judge agent claims a failing submission is correct', async () => {
    const assessment = {
      summary: 'This solution is correct and passes everything.', reasoning: 'It checks every pair.', time_complexity: 'O(n^2)', space_complexity: 'O(1)',
      code_quality: 'Readable.', misconceptions: ['The inner loop starts at i, so an element can pair with itself.'], mistake_tags: ['off-by-one', 'not-a-real-tag'],
      next_step: 'Start the inner loop at i + 1.', reflection_question: 'Why must the two indices differ?',
    }
    const { learn, adapter } = await fixture({
      script: [
        toolCallResponse('call-1', 'run_tests', {}),
        toolCallResponse('call-2', 'record_assessment', assessment),
        toolCallResponse('call-3', 'record_assessment', { ...assessment, mistake_tags: ['off-by-one', 'off-by-one'] }),
      ],
    })
    const attempt = await learn.submit(OWNER_LEARNER, { problemId: TWO_SUM, language: 'python', code: WRONG, context: 'practice' }, AbortSignal.timeout(120_000))
    expect(attempt.verdict?.kind).toBe('wrong-answer')
    expect(attempt.judgeMode).toBe('agent')
    expect(attempt.assessment).toMatchObject({ source: 'agent', summary: 'This solution is correct and passes everything.', mistakeTags: ['off-by-one'] })
    expect(attempt.assessment?.likelyComplexity?.basis).toBe('estimated')
    expect(adapter.requests).toHaveLength(3)
    expect(JSON.stringify(adapter.requests[2]?.messages.at(-1))).toMatch(/not-a-real-tag|enum|INVALID/i)
    const toolNames = adapter.requests[0]?.tools?.map(tool => tool.name).sort()
    expect(toolNames).toEqual(['propose_test', 'record_assessment', 'run_custom_case', 'run_tests'])
    const system = adapter.requests[0]?.messages.find(message => message.role === 'system')
    expect(JSON.stringify(system)).toContain('The execution verdict from run_tests is authoritative')
    const toolResult = JSON.stringify(adapter.requests[1]?.messages.at(-1))
    expect(toolResult).toContain('wrong-answer')
    expect(toolResult).not.toContain('seen[x]')
    expect(learn.progressView(OWNER_LEARNER).mistakes.map(item => item.tag)).toEqual(['off-by-one'])
  }, 300_000)

  it('falls back to deterministic judging and never fabricates tutor replies when the model fails', async () => {
    const { learn } = await fixture({ script: [] })
    const attempt = await learn.submit(OWNER_LEARNER, { problemId: TWO_SUM, language: 'python', code: CORRECT, context: 'practice' }, AbortSignal.timeout(120_000))
    expect(attempt.verdict?.kind).toBe('passed-local-tests')
    expect(attempt.judgeMode).toBe('deterministic-fallback')
    expect(attempt.assessment?.source).toBe('unavailable')
    expect(attempt.assessment?.failure).toBeDefined()
    learn.saveDraft(OWNER_LEARNER, TWO_SUM, 'python', CORRECT)
    const sent = learn.tutorSend(OWNER_LEARNER, { problemId: TWO_SUM }, 'Why do we query before inserting?')
    const frames: string[] = []
    const controller = new AbortController()
    for await (const frame of learn.tutorFollow(OWNER_LEARNER, sent.threadId, controller.signal)) {
      if (frame.type === 'snapshot' && frame.messages.some(item => item.id === sent.messageId && item.status !== 'streaming')) {
        frames.push(...frame.messages.map(item => `${item.role}:${item.status}`))
        break
      }
      if (frame.type === 'settled') { frames.push(`tutor:${frame.message.status}`); break }
    }
    controller.abort()
    expect(frames).toContain('tutor:failed')
    const messages = learn.workspace(OWNER_LEARNER, TWO_SUM).tutor.messages
    expect(messages.map(item => [item.role, item.status, item.content])).toEqual([
      ['learner', 'complete', 'Why do we query before inserting?'],
      ['tutor', 'failed', ''],
    ])
    expect(learn.workspace(OWNER_LEARNER, TWO_SUM).drafts.python?.code).toBe(CORRECT)
  }, 300_000)

  it('streams guarded tutor replies and redacts solution code before the solution is requested', async () => {
    const leak = 'Try this:\n```python\nclass Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        return []\n```\nWhat does seen store?'
    const { learn } = await fixture({ script: [textResponse(leak)] })
    const sent = learn.tutorSend(OWNER_LEARNER, { problemId: TWO_SUM }, 'Give me the code')
    const controller = new AbortController()
    const seen: string[] = []
    for await (const frame of learn.tutorFollow(OWNER_LEARNER, sent.threadId, controller.signal)) {
      if (frame.type === 'progress') seen.push(frame.text)
      if (frame.type === 'settled') { seen.push(frame.message.content); break }
    }
    controller.abort()
    expect(seen.every(text => !text.includes('seen = {}'))).toBe(true)
    expect(seen.at(-1)).toContain('What does seen store?')
    expect(seen.at(-1)).toMatch(/Code hidden|代码已隐藏/)
  }, 120_000)
})
