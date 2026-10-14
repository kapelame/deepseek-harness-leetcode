/**
 * Reminder email: verification, opt-in, one digest per local day across
 * repeated workers, stale and completed-review suppression, time zone
 * changes, opt-out, bounded catch-up, and delivery failure retries. Uses the
 * capture transport and an SMTP transport aimed at a closed port; no real
 * email is sent.
 */
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { brandString } from '@deepseek-ai/dsh-brand'
import { OWNER_LEARNER } from '../src/index.ts'
import type { EmailJobId, LearnerId, ProblemId, ReviewItemId, TopicId } from '../src/types.ts'
import { createLearnFixture, type LearnFixture } from './service-fixture.ts'

const fixtures: LearnFixture[] = []
afterEach(async () => {
  vi.useRealTimers()
  for (const fixture of fixtures.splice(0)) await fixture.dispose()
})

async function fixture(options: Parameters<typeof createLearnFixture>[0] = {}): Promise<LearnFixture> {
  const created = await createLearnFixture({ model: false, ...options })
  fixtures.push(created)
  return created
}

function at(iso: string): void {
  vi.setSystemTime(new Date(iso))
}

function seedDueItem(fixture: LearnFixture, learner: LearnerId, dueDate: string): ReviewItemId {
  const id = brandString<ReviewItemId>(`rev-${dueDate}-${learner}`)
  fixture.learn.store.ensureLearner(learner, fixture.learn.settings(learner), fixture.learn.iso())
  fixture.learn.store.insertReviewItem({
    id, learnerId: learner, topicId: brandString<TopicId>('hashing'), parentProblemId: brandString<ProblemId>('two-sum'),
    step: 0, intervalDays: 1, dueDate, reps: 0, lapses: 0, createdAt: fixture.learn.iso(),
  })
  return id
}

async function verify(fixture: LearnFixture, learner: LearnerId, address: string): Promise<void> {
  fixture.learn.setEmailAddress(learner, address)
  await fixture.learn.runReminders()
  const job = fixture.learn.emailJobs(learner).find(item => item.kind === 'verification')
  if (job === undefined) throw new Error('no verification job')
  const preview = fixture.learn.emailPreview(learner, job.id)
  const code = /(\d{6})/.exec(preview.text)?.[1]
  if (code === undefined) throw new Error('no code in the verification email')
  expect(() => fixture.learn.verifyEmail(learner, code === '000000' ? '111111' : '000000')).toThrow(/incorrect/)
  fixture.learn.verifyEmail(learner, code)
}

describe('reminder email', () => {
  it('verifies an address, captures exactly one digest per local day, and suppresses stale reminders', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    at('2026-10-15T00:30:00.000Z')
    const { learn, dataRoot } = await fixture()
    expect(() => learn.emailPreferences(OWNER_LEARNER, { optIn: true })).toThrow(/Verify/)
    await verify({ learn } as LearnFixture, OWNER_LEARNER, 'learner@example.com')
    const settings = learn.emailPreferences(OWNER_LEARNER, { optIn: true, deliveryHour: 9 })
    expect(settings).toMatchObject({ verified: true, optIn: true, transport: 'capture', liveSending: false })
    const verification = learn.emailJobs(OWNER_LEARNER).find(item => item.kind === 'verification')
    expect(verification?.status).toBe('captured')
    const stored = learn.store.jobByKey(verification?.idempotencyKey ?? '')
    expect(stored?.payload).toEqual({})

    const item = seedDueItem({ learn } as LearnFixture, OWNER_LEARNER, '2026-10-15')
    await learn.runReminders()
    expect(learn.emailJobs(OWNER_LEARNER).filter(job => job.kind === 'digest')).toHaveLength(0)

    at('2026-10-15T01:05:00.000Z')
    await Promise.all([learn.runReminders(), learn.runReminders(), learn.runReminders()])
    await learn.runReminders()
    const digests = learn.emailJobs(OWNER_LEARNER).filter(job => job.kind === 'digest')
    expect(digests).toHaveLength(1)
    expect(digests[0]).toMatchObject({ status: 'captured', idempotencyKey: 'digest:owner:2026-10-15' })
    const preview = learn.emailPreview(OWNER_LEARNER, digests[0]?.id ?? brandString<EmailJobId>(''))
    expect(preview).toMatchObject({ to: 'learner@example.com', transport: 'capture', status: 'captured' })
    expect(preview.subject).toContain('2026-10-15')
    expect(preview.text).not.toMatch(/class Solution|def |seen\[/)
    const eml = await readFile(`${dataRoot}/outbox/${digests[0]?.id ?? ''}_dsh-learn.local_.eml`, 'utf8').catch(() => '')
    expect(eml === '' || eml.includes('X-DSH-Learn-Transport: capture (not sent)')).toBe(true)

    learn.store.updateReviewItem({ ...(learn.store.reviewItem(OWNER_LEARNER, item) ?? (() => { throw new Error('missing') })()),
      dueDate: '2026-10-20' })
    at('2026-10-16T01:10:00.000Z')
    await learn.runReminders()
    const next = learn.emailJobs(OWNER_LEARNER).find(job => job.idempotencyKey === 'digest:owner:2026-10-16')
    expect(next).toMatchObject({ status: 'skipped', reason: 'no reviews due' })
  }, 60_000)

  it('respects opt-out, pause, time zone changes, and the bounded catch-up window', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    at('2026-10-15T00:30:00.000Z')
    const created = await fixture({ config: { email: { catchUpHours: 3 } } })
    const { learn } = created
    await verify(created, OWNER_LEARNER, 'learner@example.com')
    learn.emailPreferences(OWNER_LEARNER, { optIn: true, deliveryHour: 9 })
    seedDueItem(created, OWNER_LEARNER, '2026-10-15')

    at('2026-10-15T07:00:00.000Z')
    await learn.runReminders()
    expect(learn.emailJobs(OWNER_LEARNER).filter(job => job.kind === 'digest')).toHaveLength(0)

    learn.updateSettings(OWNER_LEARNER, { timezone: 'America/New_York' })
    at('2026-10-15T13:30:00.000Z')
    await learn.runReminders()
    expect(learn.emailJobs(OWNER_LEARNER).filter(job => job.kind === 'digest').map(job => job.idempotencyKey)).toEqual(['digest:owner:2026-10-15'])

    learn.emailPreferences(OWNER_LEARNER, { paused: true })
    at('2026-10-16T13:30:00.000Z')
    await learn.runReminders()
    expect(learn.emailJobs(OWNER_LEARNER).filter(job => job.kind === 'digest')).toHaveLength(1)

    learn.emailPreferences(OWNER_LEARNER, { paused: false, optIn: false })
    at('2026-10-17T13:30:00.000Z')
    await learn.runReminders()
    expect(learn.emailJobs(OWNER_LEARNER).filter(job => job.kind === 'digest')).toHaveLength(1)

    learn.emailPreferences(OWNER_LEARNER, { optIn: true })
    learn.store.enqueueJob({ id: brandString<EmailJobId>('job-stale'), learnerId: OWNER_LEARNER, kind: 'digest',
      idempotencyKey: 'digest:owner:2026-10-01', nextAttemptAt: learn.iso(), payload: { localDate: '2026-10-01' }, createdAt: learn.iso() })
    await learn.runReminders()
    expect(learn.emailJobs(OWNER_LEARNER).find(job => job.idempotencyKey === 'digest:owner:2026-10-01')).toMatchObject({ status: 'skipped' })
  }, 60_000)

  it('retries live delivery failures with backoff and marks them failed after the limit', async () => {
    const closed = await new Promise<number>((resolve) => {
      const server = createServer()
      server.listen(0, '127.0.0.1', () => {
        const address = server.address()
        const port = typeof address === 'object' && address !== null ? address.port : 0
        server.close(() => { resolve(port) })
      })
    })
    vi.useFakeTimers({ toFake: ['Date'] })
    at('2026-10-15T00:30:00.000Z')
    const created = await fixture({ config: { email: { transport: 'smtp', liveSendingAuthorized: true, maxAttempts: 2, retryBaseMs: 60_000,
      smtp: { host: '127.0.0.1', port: closed, secure: false, user: '', passwordRef: 'DSH_LEARN_SMTP_PASSWORD' } } } })
    const { learn } = created
    expect(learn.emailSettings(OWNER_LEARNER)).toMatchObject({ transport: 'smtp', liveSending: true })
    learn.setEmailAddress(OWNER_LEARNER, 'learner@example.com')
    await learn.runReminders()
    const [job] = learn.emailJobs(OWNER_LEARNER)
    expect(job).toMatchObject({ kind: 'verification', status: 'queued', attempts: 1 })
    expect(job?.lastError).toMatch(/ECONNREFUSED|connect/i)
    await learn.runReminders()
    expect(learn.emailJobs(OWNER_LEARNER)[0]).toMatchObject({ status: 'queued', attempts: 1 })
    at('2026-10-15T00:31:30.000Z')
    await learn.runReminders()
    expect(learn.emailJobs(OWNER_LEARNER)[0]).toMatchObject({ status: 'failed', attempts: 2 })
  }, 60_000)

  it('keeps each learner\'s reminders and data isolated', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    at('2026-10-15T00:30:00.000Z')
    const created = await fixture()
    const { learn } = created
    const other = brandString<LearnerId>('second-learner')
    await verify(created, OWNER_LEARNER, 'owner@example.com')
    await verify(created, other, 'other@example.com')
    learn.emailPreferences(OWNER_LEARNER, { optIn: true, deliveryHour: 9 })
    learn.emailPreferences(other, { optIn: true, deliveryHour: 9 })
    seedDueItem(created, OWNER_LEARNER, '2026-10-15')
    learn.saveNote(OWNER_LEARNER, brandString<ProblemId>('two-sum'), 'owner note')
    at('2026-10-15T01:10:00.000Z')
    await learn.runReminders()
    expect(learn.emailJobs(OWNER_LEARNER).filter(job => job.kind === 'digest').map(job => job.status)).toEqual(['captured'])
    expect(learn.emailJobs(other).filter(job => job.kind === 'digest').map(job => job.status)).toEqual(['skipped'])
    expect(learn.workspace(other, brandString<ProblemId>('two-sum')).note).toBe('')
    expect(learn.reviewQueue(other).due).toEqual([])
    const ownerJob = learn.emailJobs(OWNER_LEARNER)[0]
    expect(() => learn.emailPreview(other, ownerJob?.id ?? brandString<EmailJobId>(''))).toThrow(/No rendered message/)
    expect(Object.values(learn.exportData(other).tables).flat().some(row => JSON.stringify(row).includes('owner note'))).toBe(false)
    learn.resetData(other, 'RESET')
    expect(learn.workspace(OWNER_LEARNER, brandString<ProblemId>('two-sum')).note).toBe('owner note')
    expect(() => { learn.resetData(OWNER_LEARNER, 'reset') }).toThrow(/RESET/)
  }, 60_000)
})
