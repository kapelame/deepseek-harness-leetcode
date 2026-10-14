/**
 * Variant reviews: due queues in the learner's calendar, stable variant
 * assignment, once-only completion with a transfer reveal, snooze and
 * reschedule, and variant generation that quarantines invalid candidates.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { brandString } from '@deepseek-ai/dsh-brand'
import { toolCallResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import { OWNER_LEARNER } from '../src/index.ts'
import { toJson } from '../src/json.ts'
import type { ProblemId } from '../src/types.ts'
import { createDockerRunner } from './runner-fixture.ts'
import { createLearnFixture, type LearnFixture } from './service-fixture.ts'

const probe = await createDockerRunner()
await probe.dispose()

const TWO_SUM = brandString<ProblemId>('two-sum')
const CORRECT = 'class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for i, x in enumerate(nums):\n            if target - x in seen:\n                return [seen[target - x], i]\n            seen[x] = i\n        return []\n'
const DISTINCT = 'from collections import Counter\n\ndef countDistinctPairs(nums, target):\n    counts = Counter(nums)\n    return sum(1 for v in counts if (v < target - v and target - v in counts) or (v == target - v and counts[v] >= 2))\n'
const PAIRS = 'def countPairs(nums, target):\n    counts = {}\n    total = 0\n    for v in nums:\n        total += counts.get(target - v, 0)\n        counts[v] = counts.get(v, 0) + 1\n    return total\n'

const fixtures: LearnFixture[] = []
afterEach(async () => {
  vi.useRealTimers()
  for (const fixture of fixtures.splice(0)) await fixture.dispose()
})

async function fixture(options: Parameters<typeof createLearnFixture>[0] = {}): Promise<LearnFixture> {
  const created = await createLearnFixture(options)
  fixtures.push(created)
  return created
}

function at(iso: string): void {
  vi.setSystemTime(new Date(iso))
}

describe.skipIf(!probe.ready)('variant reviews', () => {
  it('presents a stable validated variant when due and completes the cycle exactly once', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    at('2026-10-14T02:00:00.000Z')
    const { learn } = await fixture({ model: false })
    await learn.submit(OWNER_LEARNER, { problemId: TWO_SUM, language: 'python', code: CORRECT, context: 'practice' },
      AbortSignal.timeout(120_000))
    expect(learn.reviewQueue(OWNER_LEARNER)).toMatchObject({ today: '2026-10-14', due: [] })
    expect(learn.reviewQueue(OWNER_LEARNER).upcoming[0]).toMatchObject({ dueDate: '2026-10-15', intervalDays: 1 })

    at('2026-10-15T01:00:00.000Z')
    const queue = learn.reviewQueue(OWNER_LEARNER)
    expect(queue.due).toHaveLength(1)
    const [entry] = queue.due
    if (entry?.variantId === undefined) throw new Error('no variant assigned')
    expect(entry.variantOrigin).toBe('authored')
    expect(learn.reviewQueue(OWNER_LEARNER).due[0]?.variantId).toBe(entry.variantId)

    const workspace = learn.workspace(OWNER_LEARNER, entry.variantId)
    expect(workspace.problem.kind).toBe('variant')
    expect(workspace.problem.variant).toEqual({ parentHidden: true })
    expect(JSON.stringify(workspace.problem)).not.toContain('two-sum')

    const code = entry.variantId === 'hashing-distinct-pair-sums' ? DISTINCT : PAIRS
    const attempt = await learn.submit(OWNER_LEARNER, { problemId: entry.variantId, language: 'python', code, context: 'review',
      reviewItemId: entry.itemId }, AbortSignal.timeout(120_000))
    expect(attempt.verdict?.kind).toBe('passed-local-tests')
    const [first, second] = await Promise.all([
      Promise.resolve().then(() => learn.completeReview(OWNER_LEARNER, entry.itemId, attempt.id, 'good')),
      Promise.resolve().then(() => learn.completeReview(OWNER_LEARNER, entry.itemId, attempt.id, 'good')),
    ])
    expect(first).toMatchObject({ duplicate: false, previousDueDate: '2026-10-15', nextDueDate: '2026-10-18', intervalDays: 3, step: 1 })
    expect(second).toMatchObject({ duplicate: true, nextDueDate: '2026-10-18' })
    expect(first?.reveal).toMatchObject({ parentProblemId: 'two-sum' })
    expect(first?.reveal?.transfer.en).toMatch(/complement/)
    expect(learn.reviewQueue(OWNER_LEARNER)).toMatchObject({ due: [], completedToday: 1 })
    expect(learn.workspace(OWNER_LEARNER, entry.variantId).problem.variant).toMatchObject({ parentProblemId: 'two-sum' })
    expect(learn.progressView(OWNER_LEARNER).history.filter(item => item.kind === 'completed')).toHaveLength(1)

    at('2026-10-18T01:00:00.000Z')
    const next = learn.reviewQueue(OWNER_LEARNER).due[0]
    expect(next?.variantId).toBeDefined()
    expect(next?.variantId).not.toBe(entry.variantId)
  }, 300_000)

  it('handles missed days, daily limits, snooze, reschedule, and failed reviews', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    at('2026-10-14T02:00:00.000Z')
    const { learn } = await fixture({ model: false })
    learn.updateSettings(OWNER_LEARNER, { reviewDailyLimit: 1 })
    await learn.submit(OWNER_LEARNER, { problemId: TWO_SUM, language: 'python', code: CORRECT, context: 'practice' },
      AbortSignal.timeout(120_000))
    await learn.submit(OWNER_LEARNER, { problemId: brandString<ProblemId>('contains-duplicate'), language: 'python',
      code: 'class Solution:\n    def containsDuplicate(self, nums):\n        return len(set(nums)) < len(nums)\n', context: 'practice' }, AbortSignal.timeout(120_000))

    at('2026-10-25T03:00:00.000Z')
    const queue = learn.reviewQueue(OWNER_LEARNER)
    expect(queue).toMatchObject({ dailyLimit: 1, deferred: 1 })
    expect(queue.due[0]?.overdueDays).toBe(10)

    const [entry] = queue.due
    if (entry === undefined) throw new Error('nothing due')
    const snoozed = learn.moveReview(OWNER_LEARNER, entry.itemId, { days: 2 }, 'snooze-request-0001')
    expect(snoozed).toEqual({ dueDate: '2026-10-27', duplicate: false })
    expect(learn.moveReview(OWNER_LEARNER, entry.itemId, { days: 2 }, 'snooze-request-0001')).toEqual({ dueDate: '2026-10-27',
      duplicate: true })
    expect(() => learn.moveReview(OWNER_LEARNER, entry.itemId, { date: '2026-10-01' }, 'reschedule-0001')).toThrow(/today/)
    expect(learn.moveReview(OWNER_LEARNER, entry.itemId, { date: '2026-11-02' }, 'reschedule-0002').dueDate).toBe('2026-11-02')

    const other = learn.reviewQueue(OWNER_LEARNER).due[0]
    if (other?.variantId === undefined) throw new Error('second item missing')
    const failing = await learn.submit(OWNER_LEARNER, { problemId: other.variantId, language: 'python',
      code: 'def countPairs(nums, target):\n    return 0\ndef countDistinctPairs(nums, target):\n    return 0\n', context: 'review', reviewItemId: other.itemId }, AbortSignal.timeout(120_000))
    expect(failing.verdict?.kind).toBe('wrong-answer')
    const completion = learn.completeReview(OWNER_LEARNER, other.itemId, failing.id, undefined)
    expect(completion).toMatchObject({ intervalDays: 1, step: 0, nextDueDate: '2026-10-26' })
    expect(completion.reason.en).toMatch(/did not pass/)
  }, 300_000)

  it('quarantines malformed and inconsistent generated variants and keeps using seeded content', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    at('2026-10-14T02:00:00.000Z')
    const seed = (await import('../src/content/catalog.ts')).loadCurriculum
    const curriculum = await seed(new URL('../content', import.meta.url).pathname)
    const variant = curriculum.problems.get(brandString<ProblemId>('hashing-count-index-pairs'))
    if (variant?.seedInputs === undefined || variant.variant === undefined) throw new Error('seed variant missing')
    const valid = {
      id: 'candidate', parentProblemId: 'two-sum', topicId: 'hashing',
      title: { zh: '相差为 k 的下标对', en: 'Index Pairs With Difference K' },
      statement: { zh: '统计满足 i < j 且 nums[j] - nums[i] 的绝对值等于 k 的下标对数量。',
        en: 'Count index pairs i < j where the absolute difference between nums[i] and nums[j] equals k.' },
      summary: { zh: '统计差的绝对值为 k 的下标对。', en: 'Count index pairs whose absolute difference is k.' },
      difficulty: 'medium', skills: ['complement lookup', 'counting'],
      differences: [{ category: 'reasoning', description: { zh: '补数从 target - x 变成 x + k 和 x - k 两个值。',
        en: 'The complement becomes two values, x + k and x - k, instead of target - x.' } }],
      transfer: { zh: '依然是查询之前出现过的搭档，但需要同时查询两个方向。', en: 'You still look up earlier partners, but in two directions at once.' },
      entry: { python: 'countDiffPairs', typescript: 'countDiffPairs' },
      params: [{ name: 'nums', type: 'int[]' }, { name: 'k', type: 'int' }], returns: 'int', comparator: { kind: 'exact' },
      constraints: [{ zh: '1 ≤ n ≤ 2·10⁴，0 ≤ k ≤ 100', en: '1 ≤ n ≤ 2·10⁴, 0 ≤ k ≤ 100' }],
      examples: [{ args: [[1, 3, 5], 2], expected: 2 }],
      starter: { python: 'def countDiffPairs(nums, k):\n    pass\n',
        typescript: 'function countDiffPairs(nums: number[], k: number): number {\n}\n' },
      reference: 'def countDiffPairs(nums, k):\n    seen = {}\n    total = 0\n    for v in nums:\n        total += seen.get(v - k, 0)\n        if k != 0:\n            total += seen.get(v + k, 0)\n        seen[v] = seen.get(v, 0) + 1\n    return total\n',
      oracle: 'def countDiffPairs(nums, k):\n    return sum(1 for i in range(len(nums)) for j in range(i + 1, len(nums)) if abs(nums[i] - nums[j]) == k)\n',
      inputs: [
        { type: 'int[]', minLength: 1, smallMaxLength: 10, largeLength: 20000, min: -50, max: 50, smallMin: -5, smallMax: 5 },
        { type: 'int', min: 0, max: 5, smallMax: 3, smallMin: 0 },
      ],
      boundaryCases: [{ args: [[7], 0] }, { args: [[2, 2], 0] }, { args: [[1, 1, 1], 0] }],
      mutants: [
        'def countDiffPairs(nums, k):\n    seen = {}\n    total = 0\n    for v in nums:\n        total += seen.get(v - k, 0) + seen.get(v + k, 0)\n        seen[v] = seen.get(v, 0) + 1\n    return total\n',
        'def countDiffPairs(nums, k):\n    seen = set()\n    total = 0\n    for v in nums:\n        if v - k in seen or v + k in seen:\n            total += 1\n        seen.add(v)\n    return total\n',
      ],
      hints: variant.hints,
    }
    const malformed = { ...valid, params: 'nums' }
    const inconsistent = { ...valid, examples: [{ args: [[1, 3, 5], 2], expected: 3 }] }
    const { learn, adapter } = await fixture({
      script: [
        toolCallResponse('v-1', 'submit_variant', { spec: malformed }),
        toolCallResponse('v-2', 'submit_variant', { spec: inconsistent }),
        toolCallResponse('v-3', 'submit_variant', { spec: valid }),
      ],
    })
    const result = await learn.generateVariant(OWNER_LEARNER, TWO_SUM, AbortSignal.timeout(300_000))
    expect(result.status).toBe('validated')
    expect(result.quarantined.map(item => item.validation.checks.find(check => !check.ok)?.name)).toEqual(['schema', 'reference'])
    expect(result.variant?.validation.checks.map(check => check.name)).toEqual(['schema', 'novelty', 'signature', 'generator', 'reference',
      'oracle', 'mutants', 'transfer', 'coverage'])
    expect(result.variant?.origin).toMatchObject({ source: 'generated', author: 'model:mock/mock-learn' })
    expect(typeof result.variant?.origin.seed).toBe('number')
    expect(adapter.requests).toHaveLength(3)
    const records = learn.variantRecords(OWNER_LEARNER)
    expect(records.map(item => item.status).sort()).toEqual(['quarantined', 'quarantined', 'validated'])
    const generatedId = result.variant?.id
    if (generatedId === undefined) throw new Error('missing id')
    expect(learn.workspace(OWNER_LEARNER, generatedId).problem.hiddenCaseCount).toBeGreaterThan(5)
    for (const quarantined of result.quarantined) expect(() => learn.workspace(OWNER_LEARNER, quarantined.id)).toThrow(/Unknown problem/)

    const replay = {
      ...valid,
      title: { zh: '两数之和的重放', en: 'Replay of the parent' },
      entry: { python: 'twoSum', typescript: 'twoSum' },
      params: [{ name: 'nums', type: 'int[]' }, { name: 'target', type: 'int' }],
      returns: 'int[]',
      comparator: { kind: 'validator', name: 'pair-indices-sum' },
    }
    const spec = toJson({ ...replay, reference: variant.reference })
    const outcome = await learn.importProblem(OWNER_LEARNER, spec, AbortSignal.timeout(120_000))
    expect(outcome.status).toBe('quarantined')
  }, 600_000)
})
