/** Validated Learn configuration; every deployment-varying choice is a field here. */
import z from '@deepseek-ai/schemastery'
import type { CodeLanguage, LearnLocale } from './types.ts'

/** Isolated runner configuration. */
export interface RunnerConfig {
  /** Docker CLI command or absolute path. */
  command: string
  /** Image per language; never pulled implicitly by Run or Submit. */
  images: Record<CodeLanguage, string>
  /** Container memory limit; swap is disabled. */
  memoryMb: number
  /** Container CPU quota. */
  cpus: number
  /** Maximum processes and threads in one container. */
  pidsLimit: number
  /** Size of the writable, non-executable `/tmp`. */
  tmpfsMb: number
  /** Time allowed for container start before the per-case limits apply. */
  startupAllowanceMs: number
  /** Hard wall-clock limit of one container run. */
  maxWallMs: number
  /** Maximum driver output read from one run; larger output fails as output-limit-exceeded. */
  maxProtocolBytes: number
  /** Learner `print` output kept per case. */
  maxStdoutChars: number
  /** Maximum serialized size of one returned value. */
  maxValueBytes: number
  /** Containers that may run at the same time; further runs wait. */
  maxConcurrent: number
  /** Multiplier applied to every per-case time limit on slower machines. */
  timeScale: number
}

/** SMTP transport settings; the password is resolved through `ctx.credentials`. */
export interface SmtpConfig {
  /** SMTP server host. */
  host: string
  /** SMTP server port. */
  port: number
  /** Use implicit TLS; otherwise STARTTLS is required. */
  secure: boolean
  /** SMTP user name; empty sends without authentication. */
  user: string
  /** Credential reference name (for example `DSH_LEARN_SMTP_PASSWORD`); never the password itself. */
  passwordRef: string
}

/** Reminder email configuration. */
export interface EmailConfig {
  /** `capture` writes previews under the data root and never sends. */
  transport: 'capture' | 'smtp'
  /** Live SMTP sending also requires this explicit authorization. */
  liveSendingAuthorized: boolean
  /** Sender address of every message. */
  from: string
  /** SMTP settings used when `transport` is `smtp`. */
  smtp: SmtpConfig
  /** Origin used in verification, deep, and unsubscribe links; empty uses the Web server origin. */
  publicBaseUrl: string
  /** Interval of the reminder planner and delivery worker. */
  workerIntervalMs: number
  /** A missed digest is still sent this many hours after its delivery hour, never on a later day. */
  catchUpHours: number
  /** Delivery attempts before a job fails. */
  maxAttempts: number
  /** First retry delay; each later retry doubles it. */
  retryBaseMs: number
  /** Lifetime of a verification code and link. */
  verificationTtlMinutes: number
}

/** Agent behavior configuration. */
export interface AgentsConfig {
  /** Use a judge agent for Submit; disabled runs deterministic judging only. */
  judge: boolean
  /** Generate review variants with an agent when unused validated variants run out. */
  variantGeneration: boolean
  /** Specifications the variant agent may submit before generation fails. */
  maxVariantSubmissions: number
  /** Custom-input runs the judge agent may make per Submit. */
  maxDiagnosticRuns: number
}

/** Complete Learn configuration. */
export interface Config {
  /** Directory holding the database, captured email, and agent working directory. */
  dataRoot: string
  /** Explanation language of new learners. */
  defaultLocale: LearnLocale
  /** IANA zone for new learners; empty uses the Host zone. */
  defaultTimezone: string
  /** Review intervals in days after each successful review. */
  reviewLadderDays: number[]
  /** Default number of reviews assigned per day. */
  reviewDailyLimit: number
  /** Per-case limit for generated variants and imports. */
  generatedPerCaseMs: number
  /** Isolated code runner. */
  runner: RunnerConfig
  /** Judge, tutor, and variant agents. */
  agents: AgentsConfig
  /** Reminder email. */
  email: EmailConfig
}

type Defaulted<T> = { [K in keyof T]?: T[K] extends readonly number[] ? T[K] : T[K] extends object ? Defaulted<T[K]> : T[K] }

/** Accepted configuration input: everything except `dataRoot` falls back to its default. */
export type ConfigInput = Defaulted<Config> & Pick<Config, 'dataRoot'>

/** Schemastery validation for {@link Config}. */
export const ConfigSchema: z<ConfigInput, Config> = z.object({
  dataRoot: z.string().min(1).required(),
  defaultLocale: z.union(['zh', 'en'] as const).default('zh'),
  defaultTimezone: z.string().default(''),
  reviewLadderDays: z.array(z.natural().min(1)).default([1, 3, 7, 14, 30]),
  reviewDailyLimit: z.natural().min(1).max(50).default(5),
  generatedPerCaseMs: z.natural().min(100).max(10_000).default(2000),
  runner: z.object({
    command: z.string().min(1).default('docker'),
    images: z.object({
      python: z.string().min(1).default('python:3.13-alpine'),
      typescript: z.string().min(1).default('node:24-alpine'),
    }).default({ python: 'python:3.13-alpine', typescript: 'node:24-alpine' }),
    memoryMb: z.natural().min(64).max(4096).default(256),
    cpus: z.number().min(0.1).max(8).default(1),
    pidsLimit: z.natural().min(8).max(1024).default(64),
    tmpfsMb: z.natural().min(1).max(256).default(16),
    startupAllowanceMs: z.natural().min(1000).max(60_000).default(8000),
    maxWallMs: z.natural().min(5000).max(600_000).default(120_000),
    maxProtocolBytes: z.natural().min(65_536).default(16 * 1024 * 1024),
    maxStdoutChars: z.natural().min(100).max(1_000_000).default(4000),
    maxValueBytes: z.natural().min(1024).default(4 * 1024 * 1024),
    maxConcurrent: z.natural().min(1).max(16).default(2),
    timeScale: z.number().min(1).max(10).default(1),
  }).default({}),
  agents: z.object({
    judge: z.boolean().default(true),
    variantGeneration: z.boolean().default(true),
    maxVariantSubmissions: z.natural().min(1).max(6).default(3),
    maxDiagnosticRuns: z.natural().max(10).default(3),
  }).default({}),
  email: z.object({
    transport: z.union(['capture', 'smtp'] as const).default('capture'),
    liveSendingAuthorized: z.boolean().default(false),
    from: z.string().min(3).default('DSH Learn <learn@localhost>'),
    smtp: z.object({
      host: z.string().default(''),
      port: z.natural().min(1).max(65_535).default(587),
      secure: z.boolean().default(false),
      user: z.string().default(''),
      passwordRef: z.string().default('DSH_LEARN_SMTP_PASSWORD'),
    }).default({}),
    publicBaseUrl: z.string().default(''),
    workerIntervalMs: z.natural().min(1000).default(60_000),
    catchUpHours: z.natural().max(23).default(12),
    maxAttempts: z.natural().min(1).max(20).default(5),
    retryBaseMs: z.natural().min(1000).default(60_000),
    verificationTtlMinutes: z.natural().min(5).max(1440).default(30),
  }).default({}),
})
