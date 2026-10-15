/**
 * Docker runner backend. Every execution starts a fresh container with no
 * network, a read-only root filesystem, a small tmpfs, dropped capabilities,
 * no new privileges, an unprivileged user, CPU/memory/process limits, and no
 * forwarded environment. The Docker CLI itself is a trusted Host child spawned
 * through `ctx.subprocess`; learner code only runs inside the container.
 */
import { randomBytes, randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import type { SubprocessHandle } from '@deepseek-ai/dsh-subprocess'
import type { CodeLanguage } from '../types.ts'
import type {
  BackendProbe, CaseOutcome, ExecutionOutcome, ExecutionRequest, LanguageAvailability, RunnerBackend,
} from './types.ts'

/** Docker backend limits and images; every field is deployment configuration. */
export interface DockerRunnerOptions {
  /** Docker CLI command or absolute path. */
  readonly command: string
  /** Image per language; images are never pulled implicitly by `execute`. */
  readonly images: Readonly<Record<CodeLanguage, string>>
  readonly memoryMb: number
  readonly cpus: number
  readonly pidsLimit: number
  readonly tmpfsMb: number
  /** Container start and interpreter boot allowance added to the case budget. */
  readonly startupAllowanceMs: number
  /** Upper bound on one execution's wall time, including startup. */
  readonly maxWallMs: number
  /** Protocol stdout bytes accepted before the container is killed. */
  readonly maxProtocolBytes: number
  /** Learner stdout characters retained per case. */
  readonly maxStdoutChars: number
  /** Largest JSON-encoded return value accepted per case. */
  readonly maxValueBytes: number
  readonly maxConcurrent: number
  /** Multiplier applied to every per-case limit, for slower or shared machines. */
  readonly timeScale: number
  /** Working directory for the Docker CLI process. */
  readonly cwd: string
}

/** Driver sources read from the package `runtime` directory. */
export interface DriverSources {
  readonly python: string
  readonly typescript: string
}

type DriverEvent =
  | { readonly type: 'ready' }
  | { readonly type: 'start'; readonly id: string }
  | { readonly type: 'case' } & CaseOutcome
  | { readonly type: 'compile-error'; readonly message: string; readonly line: number | null }
  | { readonly type: 'module-error'; readonly kind: 'runtime' | 'timeout'; readonly message: string; readonly line: number | null }
  | { readonly type: 'driver-error'; readonly message: string }
  | { readonly type: 'done' }

const LABEL = 'dsh.learn.runner'
const STALE_CONTAINER_MS = 10 * 60_000

function isDriverEvent(value: unknown): value is DriverEvent {
  return typeof value === 'object' && value !== null && typeof (value as { type?: unknown }).type === 'string'
}

function isCaseOutcome(value: DriverEvent): value is { readonly type: 'case' } & CaseOutcome {
  if (value.type !== 'case') return false
  const record: Readonly<Record<string, unknown>> = { ...value }
  return typeof record['id'] === 'string' && typeof record['ok'] === 'boolean' && typeof record['timeMs'] === 'number'
}

/** Bounded counting semaphore for concurrent containers. */
class Gate {
  private active = 0
  private readonly waiting: (() => void)[] = []
  constructor(private readonly limit: number) {}

  async acquire(signal: AbortSignal): Promise<() => void> {
    if (this.active >= this.limit) {
      await new Promise<void>((resolve, reject) => {
        const wake = (): void => { signal.removeEventListener('abort', abort); resolve() }
        const abort = (): void => {
          const index = this.waiting.indexOf(wake)
          if (index >= 0) this.waiting.splice(index, 1)
          reject(signal.reason instanceof Error ? signal.reason : new Error('Execution cancelled'))
        }
        this.waiting.push(wake)
        signal.addEventListener('abort', abort, { once: true })
      })
    }
    this.active++
    let released = false
    return () => {
      if (released) return
      released = true
      this.active--
      this.waiting.shift()?.()
    }
  }
}

/** Docker CLI backend registered by the Learn service. */
export class DockerRunner implements RunnerBackend {
  readonly id = 'docker'
  private readonly gate: Gate
  private swept = false

  constructor(
    private readonly ctx: Context,
    private readonly options: DockerRunnerOptions,
    private readonly drivers: DriverSources,
  ) {
    this.gate = new Gate(options.maxConcurrent)
  }

  /**
   * Run one short Docker control command and collect its output.
   * @param args - CLI arguments after the command.
   * @param timeoutMs - wall-clock limit.
   * @param signal - caller cancellation.
   * @returns exit code and collected text; spawn failures settle as exit code null.
   */
  private async control(args: readonly string[], timeoutMs: number,
    signal?: AbortSignal): Promise<{ code: number | null; stdout: string; stderr: string; spawnError?: string }> {
    const limit = AbortSignal.timeout(timeoutMs)
    const combined = signal === undefined ? limit : AbortSignal.any([limit, signal])
    let handle: SubprocessHandle
    try {
      handle = this.ctx.subprocess.spawn({
        argv: [this.options.command, ...args],
        cwd: this.options.cwd,
        stdio: { stdin: 'ignore', stdout: { maxBytes: 1_048_576 }, stderr: { maxBytes: 65_536 } },
        graceMs: 1000,
        signal: combined,
      })
    } catch (error) {
      return { code: null, stdout: '', stderr: '', spawnError: error instanceof Error ? error.message : String(error) }
    }
    try {
      const outcome = await handle.done
      return {
        code: outcome.exitCode,
        stdout: handle.collected.stdout?.readFrom(0).text ?? '',
        stderr: handle.collected.stderr?.readFrom(0).text ?? '',
      }
    } catch (error) {
      return { code: null, stdout: '', stderr: '', spawnError: error instanceof Error ? error.message : String(error) }
    }
  }

  /** Remove containers this backend left behind after a Host crash. */
  private async sweep(signal: AbortSignal): Promise<void> {
    if (this.swept) return
    this.swept = true
    const listed = await this.control(['ps', '-a', '--filter', `label=${LABEL}`, '--format', `{{.Names}} {{.Label "${LABEL}.started"}}`],
      10_000, signal)
    if (listed.code !== 0) return
    const stale = listed.stdout.split('\n').map(line => line.trim().split(' ')).filter(([name, started]) =>
      name !== undefined && name !== '' && Number.isFinite(Number(started)) && Date.now() - Number(started) > STALE_CONTAINER_MS,
    ).map(([name]) => name as string)
    if (stale.length > 0) await this.control(['rm', '-f', ...stale], 20_000, signal)
  }

  async probe(signal: AbortSignal): Promise<BackendProbe> {
    const version = await this.control(['version', '--format', '{{.Server.Version}}'], 10_000, signal)
    if (version.spawnError !== undefined) {
      return { available: false, setup: 'install', reason: `Docker CLI "${this.options.command}" could not start: ${version.spawnError}`,
        languages: this.unavailableLanguages('runner-missing') }
    }
    if (version.code !== 0) {
      return { available: false, setup: 'start', reason: `Docker daemon is not reachable: ${firstLine(version.stderr) ?? `exit ${String(version.code)}`}`,
        languages: this.unavailableLanguages('daemon-unavailable') }
    }
    await this.sweep(signal)
    const languages: LanguageAvailability[] = []
    for (const language of ['python', 'typescript'] as const) {
      const image = this.options.images[language]
      const inspected = await this.control(['image', 'inspect', '--format', '{{.Id}}', image], 10_000, signal)
      languages.push(inspected.code === 0
        ? { language, available: true, image }
        : { language, available: false, image,
          reason: `Image ${image} is not present; prepare it from Learn settings or run "docker pull ${image}".` })
    }
    return { available: true, setup: languages.every(item => item.available) ? 'ready' : 'images', languages }
  }

  private unavailableLanguages(reason: string): LanguageAvailability[] {
    return (['python', 'typescript'] as const).map(language => ({ language, available: false, image: this.options.images[language],
      reason }))
  }

  async prepare(language: CodeLanguage, signal: AbortSignal): Promise<void> {
    const pulled = await this.control(['pull', this.options.images[language]], 15 * 60_000, signal)
    if (pulled.code !== 0) throw new Error(`docker pull ${this.options.images[language]} failed: ${firstLine(pulled.stderr) ?? pulled.spawnError ?? `exit ${String(pulled.code)}`}`)
  }

  async start(signal: AbortSignal): Promise<void> {
    // Only the platform's own launcher is used; no privileged commands are run on the learner's behalf.
    const argv = process.platform === 'darwin' ? ['open', '-a', 'Docker']
      : process.platform === 'win32' ? ['cmd', '/c', 'start', '', 'Docker Desktop']
        : undefined
    if (argv === undefined) throw new Error('Start Docker with your system service manager (for example "sudo systemctl start docker").')
    let handle: SubprocessHandle
    try {
      handle = this.ctx.subprocess.spawn({ argv, cwd: this.options.cwd, stdio: { stdin: 'ignore', stdout: { maxBytes: 4096 }, stderr: { maxBytes: 4096 } },
        graceMs: 1000, signal: AbortSignal.any([signal, AbortSignal.timeout(20_000)]) })
    } catch (error) {
      throw new Error(`Docker Desktop could not be launched: ${error instanceof Error ? error.message : String(error)}`)
    }
    const outcome = await handle.done
    if (outcome.exitCode !== 0) {
      throw new Error(`Docker Desktop could not be launched: ${firstLine(handle.collected.stderr?.readFrom(0).text ?? '') ?? `exit ${String(outcome.exitCode)}`}`)
    }
  }

  private command(language: CodeLanguage): string[] {
    switch (language) {
      case 'python': return ['python3', '-I', '-B', '-c', this.drivers.python]
      case 'typescript': return [
        'node', '--permission', `--max-old-space-size=${String(Math.max(32, Math.floor(this.options.memoryMb * 0.75)))}`,
        '--input-type=module', '-e', this.drivers.typescript,
      ]
      default: {
        const unreachable: never = language
        return unreachable
      }
    }
  }

  async execute(request: ExecutionRequest, signal: AbortSignal): Promise<ExecutionOutcome> {
    let release: () => void
    try {
      release = await this.gate.acquire(signal)
    } catch {
      return { status: 'cancelled', cases: [], runner: this.id }
    }
    try {
      return await this.executeAcquired(request, signal)
    } finally {
      release()
    }
  }

  private async executeAcquired(request: ExecutionRequest, signal: AbortSignal): Promise<ExecutionOutcome> {
    if (signal.aborted) return { status: 'cancelled', cases: [], runner: this.id }
    const perCaseMs = Math.round(request.perCaseMs * this.options.timeScale)
    const nonce = randomBytes(18).toString('base64url')
    const name = `dsh-learn-${randomUUID()}`
    const payload = JSON.stringify({
      nonce,
      code: request.code,
      entry: request.entry,
      params: request.params,
      returns: request.returns,
      shape: request.shape ?? null,
      cases: request.cases,
      perCaseMs,
      moduleTimeMs: perCaseMs,
      maxStdoutChars: this.options.maxStdoutChars,
      maxValueBytes: this.options.maxValueBytes,
      recursionLimit: 5000,
    })
    const argv = [
      this.options.command, 'run', '-i', '--pull', 'never', '--name', name,
      '--label', `${LABEL}=1`, '--label', `${LABEL}.started=${String(Date.now())}`,
      '--network', 'none', '--read-only',
      '--tmpfs', `/tmp:rw,noexec,nosuid,size=${String(this.options.tmpfsMb)}m,mode=1777`,
      '--memory', `${String(this.options.memoryMb)}m`, '--memory-swap', `${String(this.options.memoryMb)}m`,
      '--pids-limit', String(this.options.pidsLimit), '--cpus', String(this.options.cpus),
      '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
      '--user', '65534:65534', '--workdir', '/tmp',
      '--ulimit', 'nofile=64:64', '--ulimit', 'fsize=1048576:1048576',
      '--log-driver', 'none',
      this.options.images[request.language],
      ...this.command(request.language),
    ]
    const budget = Math.min(this.options.maxWallMs, this.options.startupAllowanceMs + perCaseMs * Math.max(1, request.cases.length))
    const cases: CaseOutcome[] = []
    const progress: { started: string | null; ready: boolean; done: boolean } = { started: null, ready: false, done: false }
    let terminal: ExecutionOutcome | undefined
    let stopCause: 'timeout' | 'cancelled' | 'output-limit' | undefined
    const diagnostics: string[] = []
    let protocolBytes = 0
    let handle: SubprocessHandle
    try {
      handle = this.ctx.subprocess.spawn({
        argv,
        cwd: this.options.cwd,
        stdio: { stdin: { data: payload }, stdout: 'pipe', stderr: { maxBytes: 65_536 } },
        graceMs: 2000,
      })
    } catch (error) {
      return { status: 'unavailable', reason: 'runner-missing',
        message: `Docker CLI could not start: ${error instanceof Error ? error.message : String(error)}`, runner: this.id }
    }
    const kill = (cause: 'timeout' | 'cancelled' | 'output-limit'): void => {
      if (stopCause !== undefined || progress.done) return
      stopCause = cause
      void this.control(['kill', name], 15_000)
    }
    const deadline = setTimeout(() => { kill('timeout') }, budget)
    const onAbort = (): void => { kill('cancelled') }
    signal.addEventListener('abort', onAbort, { once: true })
    let pending = ''
    const handleLine = (line: string): void => {
      if (!line.startsWith(`${nonce} `)) {
        if (line.trim() !== '' && diagnostics.length < 20) diagnostics.push(line.slice(0, 500))
        return
      }
      let event: unknown
      try {
        event = JSON.parse(line.slice(nonce.length + 1))
      } catch {
        diagnostics.push('malformed driver event')
        return
      }
      if (!isDriverEvent(event)) return
      switch (event.type) {
        case 'ready': progress.ready = true; break
        case 'start': progress.started = event.id; break
        case 'case':
          if (isCaseOutcome(event)) {
            const { type: _type, ...outcome } = event
            cases.push(outcome)
            progress.started = null
            if (!outcome.ok && outcome.error.kind === 'timeout') terminal = { status: 'timeout', cases: [...cases], caseId: outcome.id,
              runner: this.id }
            if (!outcome.ok && outcome.error.kind === 'memory') terminal = { status: 'memory-limit', cases: [...cases], caseId: outcome.id,
              runner: this.id }
            if (!outcome.ok && outcome.error.kind === 'output-limit') terminal = { status: 'output-limit', cases: [...cases],
              caseId: outcome.id, runner: this.id }
          }
          break
        case 'compile-error': terminal = { status: 'compile-error', message: event.message, line: event.line, runner: this.id }; break
        case 'module-error': terminal = { status: 'module-error', kind: event.kind, message: event.message, line: event.line,
          runner: this.id }; break
        case 'driver-error': terminal = { status: 'runner-error', message: event.message, runner: this.id }; break
        case 'done': progress.done = true; break
        default: break
      }
    }
    const stdout = handle.stdout
    const reading = new Promise<void>((resolve) => {
      if (stdout === undefined) { resolve(); return }
      stdout.on('data', (chunk: Buffer) => {
        protocolBytes += chunk.length
        if (protocolBytes > this.options.maxProtocolBytes) { kill('output-limit'); return }
        pending += chunk.toString('utf8')
        let index = pending.indexOf('\n')
        while (index >= 0) {
          handleLine(pending.slice(0, index))
          pending = pending.slice(index + 1)
          index = pending.indexOf('\n')
        }
      })
      stdout.on('end', () => { resolve() })
      stdout.on('error', () => { resolve() })
    })
    let exitCode: number | null = null
    let spawnFailure: string | undefined
    try {
      exitCode = (await handle.done).exitCode
      await reading
    } catch (error) {
      spawnFailure = error instanceof Error ? error.message : String(error)
    } finally {
      clearTimeout(deadline)
      signal.removeEventListener('abort', onAbort)
    }
    if (spawnFailure !== undefined && !progress.ready) {
      await this.control(['rm', '-f', name], 20_000)
      return { status: 'unavailable', reason: 'runner-missing',
        message: `Docker CLI "${this.options.command}" could not run: ${spawnFailure}`, runner: this.id }
    }
    if (spawnFailure !== undefined) diagnostics.push(spawnFailure)
    let oomKilled = false
    if (stopCause === undefined && exitCode !== 0) {
      const inspected = await this.control(['inspect', '--format', '{{.State.OOMKilled}}', name], 10_000)
      oomKilled = inspected.code === 0 && inspected.stdout.trim() === 'true'
    }
    await this.control(['rm', '-f', name], 20_000)
    const stderr = handle.collected.stderr?.readFrom(0).text ?? ''
    if (stopCause === 'cancelled') return { status: 'cancelled', cases, runner: this.id }
    if (stopCause === 'timeout') return { status: 'timeout', cases, caseId: progress.started, runner: this.id }
    if (stopCause === 'output-limit') return { status: 'output-limit', cases, caseId: progress.started, runner: this.id }
    if (oomKilled) return { status: 'memory-limit', cases, caseId: progress.started, runner: this.id }
    if (terminal !== undefined) return terminal
    if (progress.done && exitCode === 0) return { status: 'completed', cases, runner: this.id }
    if (/Unable to find image|No such image/i.test(stderr)) {
      return { status: 'unavailable', reason: 'image-missing',
        message: `Image ${this.options.images[request.language]} is not present locally.`, runner: this.id }
    }
    if (/Cannot connect to the Docker daemon|error during connect|docker daemon/i.test(stderr)) {
      return { status: 'unavailable', reason: 'daemon-unavailable', message: `Docker daemon is not reachable: ${firstLine(stderr) ?? ''}`,
        runner: this.id }
    }
    if (exitCode === 137 && progress.ready) return { status: 'memory-limit', cases, caseId: progress.started, runner: this.id }
    const detail = [firstLine(stderr), ...diagnostics].filter(item => item !== undefined && item !== '').join(' | ')
    const suffix = detail === '' ? '' : `: ${detail.slice(0, 800)}`
    return { status: 'runner-error', message: `Execution ended without a result (exit ${String(exitCode)})${suffix}`, runner: this.id }
  }
}

function firstLine(text: string): string | undefined {
  const line = text.split('\n').map(item => item.trim()).find(item => item !== '')
  return line === undefined ? undefined : line.slice(0, 400)
}
