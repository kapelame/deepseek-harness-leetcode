/** Real Docker runner fixture for Learn specs; specs skip when Docker or the images are unavailable. */
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import LocalSubprocessRuntime from '@deepseek-ai/dsh-subprocess-local'
import { DockerRunner, type DockerRunnerOptions } from '../src/runner/docker.ts'

/** Package content directory. */
export const CONTENT_ROOT = fileURLToPath(new URL('../content', import.meta.url))
/** Package runtime directory holding the drivers. */
export const RUNTIME_ROOT = fileURLToPath(new URL('../runtime', import.meta.url))

/** Default options used by specs. */
export const TEST_RUNNER_OPTIONS: DockerRunnerOptions = {
  command: 'docker',
  images: { python: 'python:3.13-alpine', typescript: 'node:24-alpine' },
  memoryMb: 256,
  cpus: 1,
  pidsLimit: 64,
  tmpfsMb: 16,
  startupAllowanceMs: 8000,
  maxWallMs: 120_000,
  maxProtocolBytes: 16 * 1024 * 1024,
  maxStdoutChars: 4000,
  maxValueBytes: 4 * 1024 * 1024,
  maxConcurrent: 4,
  timeScale: 1,
  cwd: tmpdir(),
}

/**
 * Create a Docker runner over the local subprocess provider.
 * @param overrides - option overrides.
 * @returns the runner, its readiness, and a disposer.
 */
export async function createDockerRunner(
  overrides: Partial<DockerRunnerOptions> = {},
): Promise<{ runner: DockerRunner; ready: boolean; dispose: () => Promise<void> }> {
  const ctx = new Context()
  await ctx.plugin(LocalSubprocessRuntime)
  const drivers = {
    python: await readFile(`${RUNTIME_ROOT}/python_driver.py`, 'utf8'),
    typescript: await readFile(`${RUNTIME_ROOT}/typescript_driver.mjs`, 'utf8'),
  }
  const runner = new DockerRunner(ctx, { ...TEST_RUNNER_OPTIONS, ...overrides }, drivers)
  const probe = await runner.probe(AbortSignal.timeout(30_000))
  const ready = probe.available && probe.languages.every(item => item.available)
  return { runner, ready, dispose: async () => { await ctx.fiber.dispose() } }
}
