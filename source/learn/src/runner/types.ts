/** Execution request and outcome vocabulary shared by runner backends and the judge. */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type { CodeLanguage, ProblemShape, ValueType } from '../types.ts'

/** Encodings accepted by the drivers; `json` is reserved for internal generator runs. */
export type DriverValueType = ValueType | 'json'

/** One case sent into the isolated process; expected values never cross. */
export interface ExecutionCase {
  readonly id: string
  readonly args: readonly JsonValue[]
}

/** Complete, explicit execution request. */
export interface ExecutionRequest {
  readonly language: CodeLanguage
  readonly code: string
  /** Entry function or `Solution` method name. */
  readonly entry: string
  readonly params: readonly DriverValueType[]
  readonly returns: DriverValueType
  /** Calling convention for in-place, harness, and design problems; absent for plain functions. */
  readonly shape?: ProblemShape
  readonly cases: readonly ExecutionCase[]
  /** Per-case wall-clock limit enforced in the driver (Python) and by the Host deadline. */
  readonly perCaseMs: number
}

/** Per-case failure classification reported by a driver. */
export type CaseErrorKind = 'runtime' | 'timeout' | 'memory' | 'invalid-output' | 'output-limit'

/** One case reported by the driver. */
export type CaseOutcome =
  | CaseReport & { readonly ok: true; readonly value: JsonValue }
  | CaseReport & { readonly ok: false; readonly error: CaseError }

/** Fields every reported case carries. */
export interface CaseReport {
  readonly id: string
  readonly timeMs: number
  readonly stdout: string
  readonly stdoutTruncated: boolean
}

/** One case failure. */
export interface CaseError {
  readonly kind: CaseErrorKind
  readonly message: string
  readonly line: number | null
}

/** Reason evaluation could not run at all. */
export type UnavailableReason = 'runner-missing' | 'daemon-unavailable' | 'image-missing' | 'language-unsupported' | 'capacity'

/**
 * Settled execution. `cases` lists every case the driver reported before the
 * outcome, in request order. A non-`completed` status never implies success.
 */
export type ExecutionOutcome =
  | { readonly status: 'completed'; readonly cases: readonly CaseOutcome[]; readonly runner: string }
  | { readonly status: 'compile-error'; readonly message: string; readonly line: number | null; readonly runner: string }
  | { readonly status: 'module-error'; readonly kind: 'runtime' | 'timeout'; readonly message: string; readonly line: number | null; readonly runner: string }
  | { readonly status: 'timeout'; readonly cases: readonly CaseOutcome[]; readonly caseId: string | null; readonly runner: string }
  | { readonly status: 'memory-limit'; readonly cases: readonly CaseOutcome[]; readonly caseId: string | null; readonly runner: string }
  | { readonly status: 'output-limit'; readonly cases: readonly CaseOutcome[]; readonly caseId: string | null; readonly runner: string }
  | { readonly status: 'cancelled'; readonly cases: readonly CaseOutcome[]; readonly runner: string }
  | { readonly status: 'unavailable'; readonly reason: UnavailableReason; readonly message: string; readonly runner: string }
  | { readonly status: 'runner-error'; readonly message: string; readonly runner: string }

/** Availability of one language image. */
export interface LanguageAvailability {
  readonly language: CodeLanguage
  readonly available: boolean
  readonly image: string
  readonly reason?: string
}

/** Next setup step a learner must take: install the backend, start it, download images, or nothing. */
export type RunnerSetupStep = 'install' | 'start' | 'images' | 'ready'

/** Backend probe result. */
export interface BackendProbe {
  readonly available: boolean
  readonly setup: RunnerSetupStep
  readonly reason?: string
  readonly languages: readonly LanguageAvailability[]
}

/**
 * An isolated execution backend. Implementations must enforce no network,
 * no host filesystem access, no inherited secrets, CPU/memory/process limits,
 * and cancellation, and must report `unavailable` rather than fall back to
 * unconfined execution.
 */
export interface RunnerBackend {
  /** Stable backend identifier recorded on verdicts. */
  readonly id: string
  /**
   * Check whether the backend and its images are usable.
   * @param signal - probe cancellation.
   * @returns availability per language.
   */
  probe(signal: AbortSignal): Promise<BackendProbe>
  /**
   * Execute one request in a fresh isolated process.
   * @param request - code, entry, cases, and limits.
   * @param signal - cancellation; aborting kills the isolated process.
   * @returns the settled outcome; infrastructure failures settle as `unavailable` or `runner-error`.
   */
  execute(request: ExecutionRequest, signal: AbortSignal): Promise<ExecutionOutcome>
  /**
   * Fetch a language image with the backend's own tooling.
   * @param language - language whose image is fetched.
   * @param signal - cancellation.
   * @returns after the image is available.
   */
  prepare(language: CodeLanguage, signal: AbortSignal): Promise<void>
  /**
   * Ask the operating system to start the backend (for example Docker Desktop).
   * @param signal - cancellation.
   * @returns after the start request was issued; the backend may still be starting.
   */
  start(signal: AbortSignal): Promise<void>
}
