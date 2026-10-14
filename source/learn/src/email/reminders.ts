/**
 * Reminder email state and the durable job queue. Digests are keyed by
 * learner and local date, so repeated planner runs and concurrent workers
 * create at most one digest per day. Each job re-checks current preferences
 * and due reviews immediately before sending.
 */
import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto'
import { brandString } from '@deepseek-ai/dsh-brand'
import type { EmailJobId, EmailJobView, EmailPreview, EmailSettingsView, LearnerId } from '../types.ts'
import type { EmailJobRow, EmailSettingsRow } from '../store/store.ts'
import { localDate, localMinuteOfDay } from '../review/dates.ts'
import { LearnError } from '../judging.ts'
import type { LearnRuntime } from '../runtime.ts'
import type { Reviews } from '../reviews.ts'
import { renderDigest, renderTest, renderVerification, type DigestTopic, type RenderedEmail } from './render.ts'
import type { EmailTransport } from './transport.ts'

const LABEL = '[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?'
const ADDRESS = new RegExp(`^[^\\s@<>()[\\]\\\\,;:"]{1,64}@${LABEL}(?:\\.${LABEL})+$`)
const MAX_VERIFY_ATTEMPTS = 5

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function sameHash(left: string | undefined, right: string): boolean {
  if (left === undefined || left.length !== right.length) return false
  return timingSafeEqual(Buffer.from(left), Buffer.from(right))
}

/** Transport selection resolved from configuration at each send. */
export interface TransportChoice {
  readonly transport: EmailTransport
  readonly liveSending: boolean
}

/** Email settings, verification, and queue processing. */
export class Reminders {
  private ticking: Promise<void> | undefined

  constructor(
    private readonly runtime: LearnRuntime,
    private readonly reviews: Reviews,
    private readonly transport: () => TransportChoice,
    private readonly baseUrl: () => string | undefined,
  ) {}

  /**
   * Learner-visible email settings.
   * @param learner - learner.
   * @returns settings without secrets.
   */
  view(learner: LearnerId): EmailSettingsView {
    const row = this.runtime.store.emailSettings(learner)
    const choice = this.transport()
    return {
      ...row.address === undefined ? {} : { address: row.address },
      verified: row.verifiedAt !== undefined,
      verificationPending: row.verifyCodeHash !== undefined,
      optIn: row.optIn,
      paused: row.paused,
      deliveryHour: row.deliveryHour,
      transport: choice.transport.kind,
      liveSending: choice.liveSending,
      verifyUrlAvailable: this.baseUrl() !== undefined,
    }
  }

  private save(learner: LearnerId, row: EmailSettingsRow): void {
    this.runtime.store.saveEmailSettings(learner, row, this.runtime.iso())
  }

  /**
   * Bind a new address and queue its verification message. Reminders stop until it is verified.
   * @param learner - learner.
   * @param address - email address.
   * @returns updated settings.
   */
  setAddress(learner: LearnerId, address: string): EmailSettingsView {
    const trimmed = address.trim()
    if (trimmed.length > 254 || !ADDRESS.test(trimmed)) throw new LearnError('invalid', 'Enter a valid email address')
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
    const token = randomBytes(24).toString('base64url')
    const expires = new Date(this.runtime.now().getTime() + this.runtime.config.email.verificationTtlMinutes * 60_000).toISOString()
    const current = this.runtime.store.emailSettings(learner)
    const { verifiedAt: _verified, ...rest } = current
    const next: EmailSettingsRow = {
      ...rest, address: trimmed, verifyCodeHash: sha256(`${learner}:${code}`), verifyTokenHash: sha256(token),
      verifyExpiresAt: expires, verifyAttempts: 0, unsubscribeToken: current.unsubscribeToken ?? randomBytes(24).toString('base64url'),
    }
    this.runtime.store.atomic(() => {
      this.save(learner, next)
      this.runtime.store.cancelQueuedJobs(learner, ['verification', 'digest'], 'address changed', this.runtime.iso())
      this.runtime.store.enqueueJob({
        id: brandString<EmailJobId>(`job-${randomUUID()}`), learnerId: learner, kind: 'verification',
        idempotencyKey: `verify:${learner}:${sha256(token).slice(0, 24)}`, nextAttemptAt: this.runtime.iso(),
        payload: { address: trimmed, code, token, tokenHash: sha256(token) }, createdAt: this.runtime.iso(),
      })
    })
    void this.tick()
    return this.view(learner)
  }

  private markVerified(learner: LearnerId, row: EmailSettingsRow): void {
    const { verifyCodeHash: _code, verifyTokenHash: _token, verifyExpiresAt: _expires, ...rest } = row
    this.save(learner, { ...rest, verifyAttempts: 0, verifiedAt: this.runtime.iso() })
  }

  /**
   * Verify the pending address with its emailed code.
   * @param learner - learner.
   * @param code - six-digit code.
   * @returns updated settings.
   */
  verifyCode(learner: LearnerId, code: string): EmailSettingsView {
    const row = this.runtime.store.emailSettings(learner)
    if (row.verifyCodeHash === undefined || row.verifyExpiresAt === undefined) throw new LearnError('conflict',
      'No verification is pending')
    if (row.verifyExpiresAt < this.runtime.iso()) throw new LearnError('invalid', 'The code expired; request a new one')
    if (row.verifyAttempts >= MAX_VERIFY_ATTEMPTS) throw new LearnError('invalid', 'Too many attempts; request a new code')
    if (!sameHash(row.verifyCodeHash, sha256(`${learner}:${code.trim()}`))) {
      this.save(learner, { ...row, verifyAttempts: row.verifyAttempts + 1 })
      throw new LearnError('invalid', 'The code is incorrect')
    }
    this.markVerified(learner, row)
    return this.view(learner)
  }

  /**
   * Verify through the emailed one-click link.
   * @param token - link token.
   * @returns whether a pending verification matched.
   */
  verifyToken(token: string): boolean {
    const learner = this.runtime.store.learnerByToken('verify_token_hash', sha256(token))
    if (learner === undefined) return false
    const row = this.runtime.store.emailSettings(learner)
    if (row.verifyExpiresAt === undefined || row.verifyExpiresAt < this.runtime.iso()) return false
    this.markVerified(learner, row)
    return true
  }

  /**
   * Change reminder preferences.
   * @param learner - learner.
   * @param patch - changed fields.
   * @returns updated settings.
   */
  preferences(learner: LearnerId, patch: { optIn?: boolean; paused?: boolean; deliveryHour?: number }): EmailSettingsView {
    const row = this.runtime.store.emailSettings(learner)
    if (patch.optIn === true && row.verifiedAt === undefined) throw new LearnError('conflict',
      'Verify an address before turning on reminders')
    if (patch.deliveryHour !== undefined && (!Number.isSafeInteger(patch.deliveryHour) || patch.deliveryHour < 0 || patch.deliveryHour > 23)) throw new LearnError('invalid', 'Delivery hour must be 0-23')
    const next: EmailSettingsRow = {
      ...row,
      ...patch.optIn === undefined ? {} : { optIn: patch.optIn },
      ...patch.paused === undefined ? {} : { paused: patch.paused },
      ...patch.deliveryHour === undefined ? {} : { deliveryHour: patch.deliveryHour },
    }
    this.runtime.store.atomic(() => {
      this.save(learner, next)
      if (!next.optIn || next.paused) this.runtime.store.cancelQueuedJobs(learner, ['digest'], next.optIn ? 'paused' : 'opted out',
        this.runtime.iso())
    })
    return this.view(learner)
  }

  /**
   * Opt out through an unsubscribe link.
   * @param token - unsubscribe token.
   * @returns whether the token matched a learner.
   */
  unsubscribe(token: string): boolean {
    const learner = this.runtime.store.learnerByToken('unsubscribe_token', token)
    if (learner === undefined) return false
    this.preferences(learner, { optIn: false })
    return true
  }

  /**
   * Queue a test message to the verified address.
   * @param learner - learner.
   * @returns the queued job.
   */
  test(learner: LearnerId): EmailJobView {
    const row = this.runtime.store.emailSettings(learner)
    if (row.address === undefined || row.verifiedAt === undefined) throw new LearnError('conflict',
      'Verify an address before sending a test email')
    const key = `test:${learner}:${randomUUID()}`
    this.runtime.store.enqueueJob({
      id: brandString<EmailJobId>(`job-${randomUUID()}`), learnerId: learner, kind: 'test', idempotencyKey: key,
      nextAttemptAt: this.runtime.iso(), payload: {}, createdAt: this.runtime.iso(),
    })
    void this.tick()
    const job = this.runtime.store.jobByKey(key)
    if (job === undefined) throw new Error('learn: test job insert failed')
    return this.jobView(job)
  }

  private jobView(job: EmailJobRow): EmailJobView {
    const delivery = this.runtime.store.latestDelivery(job.id)
    return {
      id: job.id, kind: job.kind, status: job.status, attempts: job.attempts, idempotencyKey: job.idempotencyKey,
      ...job.lastError === undefined ? {} : { lastError: job.lastError },
      ...job.reason === undefined ? {} : { reason: job.reason },
      createdAt: job.createdAt, updatedAt: job.updatedAt,
      ...delivery === undefined ? {} : { previewSubject: delivery.subject },
    }
  }

  /**
   * Recent jobs.
   * @param learner - learner.
   * @returns jobs, newest first.
   */
  jobs(learner: LearnerId): EmailJobView[] {
    return this.runtime.store.jobs(learner, 30).map(job => this.jobView(job))
  }

  /**
   * Rendered message of a job's latest delivery attempt.
   * @param learner - learner.
   * @param jobId - job.
   * @returns the exact rendered message.
   */
  preview(learner: LearnerId, jobId: EmailJobId): EmailPreview {
    const job = this.runtime.store.job(learner, jobId)
    const delivery = job === undefined ? undefined : this.runtime.store.latestDelivery(jobId)
    if (job === undefined || delivery === undefined) throw new LearnError('not-found', 'No rendered message for this job')
    return { jobId, to: delivery.recipient, subject: delivery.subject, text: delivery.text, html: delivery.html,
      transport: delivery.transport, status: job.status }
  }

  /**
   * Enqueue today's digest for every opted-in learner whose delivery time has
   * passed within the catch-up window. Earlier missed days are never backfilled.
   * @param now - current instant.
   */
  plan(now: Date): void {
    for (const learner of this.runtime.store.learners()) {
      const row = this.runtime.store.emailSettings(learner)
      if (!row.optIn || row.paused || row.verifiedAt === undefined || row.address === undefined) continue
      const zone = this.runtime.settings(learner).timezone
      const minute = localMinuteOfDay(now, zone)
      const late = minute - row.deliveryHour * 60
      if (late < 0 || late > this.runtime.config.email.catchUpHours * 60) continue
      const date = localDate(now, zone)
      this.runtime.store.enqueueJob({
        id: brandString<EmailJobId>(`job-${randomUUID()}`), learnerId: learner, kind: 'digest', idempotencyKey: `digest:${learner}:${date}`,
        nextAttemptAt: now.toISOString(), payload: { localDate: date }, createdAt: now.toISOString(),
      })
    }
  }

  private links(row: EmailSettingsRow, verifyToken?: string): { review?: string; unsubscribe?: string; verify?: string } {
    const base = this.baseUrl()
    if (base === undefined) return {}
    return {
      review: `${base}/#learn/review`,
      ...row.unsubscribeToken === undefined ? {} : { unsubscribe: `${base}/learn/email/unsubscribe?token=${encodeURIComponent(row.unsubscribeToken)}` },
      ...verifyToken === undefined ? {} : { verify: `${base}/learn/email/verify?token=${encodeURIComponent(verifyToken)}` },
    }
  }

  /** @returns the rendered message, or a terminal status with its reason. */
  private render(job: EmailJobRow): { message: RenderedEmail; to: string } | { status: 'skipped' | 'cancelled'; reason: string } {
    const learner = job.learnerId
    const row = this.runtime.store.emailSettings(learner)
    const locale = this.runtime.settings(learner).locale
    switch (job.kind) {
      case 'verification': {
        const payload = job.payload as { address?: string; code?: string; token?: string; tokenHash?: string }
        if (payload.code === undefined || payload.address === undefined || payload.address !== row.address || payload.tokenHash !== row.verifyTokenHash) return { status: 'cancelled', reason: 'superseded by a newer address or verification' }
        const link = this.links(row, payload.token).verify
        return { message: renderVerification(locale, payload.code, this.runtime.config.email.verificationTtlMinutes, link),
          to: payload.address }
      }
      case 'test':
        if (row.address === undefined || row.verifiedAt === undefined) return { status: 'cancelled', reason: 'no verified address' }
        return { message: renderTest(locale, this.transport().transport.kind), to: row.address }
      case 'digest': {
        if (!row.optIn) return { status: 'cancelled', reason: 'opted out' }
        if (row.paused) return { status: 'cancelled', reason: 'paused' }
        if (row.address === undefined || row.verifiedAt === undefined) return { status: 'cancelled', reason: 'no verified address' }
        const payload = job.payload as { localDate?: string }
        const today = this.runtime.today(learner)
        if (payload.localDate !== today) return { status: 'skipped',
          reason: `stale digest for ${payload.localDate ?? '?'}; today is ${today}` }
        const queue = this.reviews.queue(learner)
        if (queue.due.length === 0) return { status: 'skipped', reason: 'no reviews due' }
        const topics = new Map<string, DigestTopic>()
        for (const entry of queue.due) {
          const topic = this.runtime.problems.curriculum.topics.find(item => item.id === entry.topicId)
          const title = topic?.title ?? { zh: entry.topicId, en: entry.topicId }
          topics.set(entry.topicId, { title, count: (topics.get(entry.topicId)?.count ?? 0) + 1 })
        }
        const minutes = queue.due.reduce((sum, entry) => sum + entry.estimatedMinutes, 0)
        return { message: renderDigest(locale, today, queue.due.length, minutes, [...topics.values()], this.links(row)), to: row.address }
      }
      default: {
        const unreachable: never = job.kind
        return unreachable
      }
    }
  }

  private async processJob(job: EmailJobRow): Promise<void> {
    try {
      await this.deliver(job)
    } finally {
      if (job.kind === 'verification') this.runtime.store.scrubJobPayload(job.id)
    }
  }

  private async deliver(job: EmailJobRow): Promise<void> {
    const now = this.runtime.iso()
    let rendered: ReturnType<Reminders['render']>
    try {
      rendered = this.render(job)
    } catch (error) {
      this.runtime.store.finishJob(job.id, 'failed', now, { error: error instanceof Error ? error.message : String(error) })
      return
    }
    if ('status' in rendered) {
      this.runtime.store.finishJob(job.id, rendered.status, now, { reason: rendered.reason })
      return
    }
    const choice = this.transport()
    const message = {
      from: this.runtime.config.email.from, to: rendered.to, subject: rendered.message.subject,
      text: rendered.message.text, html: rendered.message.html,
      messageId: `<${job.id}@dsh-learn.local>`,
      headers: job.kind === 'digest' ? this.unsubscribeHeaders(job.learnerId) : {},
    }
    try {
      const receipt = await choice.transport.send(message)
      this.runtime.store.atomic(() => {
        this.runtime.store.insertDelivery({
          jobId: job.id, transport: choice.transport.kind, status: choice.transport.kind === 'capture' ? 'captured' : 'sent',
          recipient: rendered.to, subject: message.subject, text: message.text, html: message.html, messageId: receipt.messageId,
          ...receipt.previewPath === undefined ? {} : { previewPath: receipt.previewPath }, createdAt: this.runtime.iso(),
        })
        this.runtime.store.finishJob(job.id, choice.transport.kind === 'capture' ? 'captured' : 'sent', this.runtime.iso(), {})
      })
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      const retry = job.attempts < this.runtime.config.email.maxAttempts
      this.runtime.store.atomic(() => {
        this.runtime.store.insertDelivery({
          jobId: job.id, transport: choice.transport.kind, status: 'failed', recipient: rendered.to, subject: message.subject,
          text: message.text, html: message.html, error: detail, createdAt: this.runtime.iso(),
        })
        this.runtime.store.finishJob(job.id, retry ? 'queued' : 'failed', this.runtime.iso(), {
          error: detail,
          ...retry ? { nextAttemptAt: this.retryAt(job.attempts) } : {},
        })
      })
    }
  }

  private retryAt(attempts: number): string {
    return new Date(this.runtime.now().getTime() + this.runtime.config.email.retryBaseMs * 2 ** (attempts - 1)).toISOString()
  }

  private unsubscribeHeaders(learner: LearnerId): Record<string, string> {
    const link = this.links(this.runtime.store.emailSettings(learner)).unsubscribe
    return link === undefined ? {} : { 'List-Unsubscribe': `<${link}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
  }

  /**
   * Plan digests and process due jobs once. Ticks never overlap.
   * @returns after this tick settles.
   */
  tick(): Promise<void> {
    if (this.ticking !== undefined) return this.ticking
    const run = (async () => {
      const now = this.runtime.now()
      this.plan(now)
      const lease = new Date(now.getTime() + 5 * 60_000).toISOString()
      for (const job of this.runtime.store.claimJobs(now.toISOString(), lease, 20)) await this.processJob(job)
    })().finally(() => { this.ticking = undefined })
    this.ticking = run
    return run
  }
}
