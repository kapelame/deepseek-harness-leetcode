/**
 * Isolation and failure behavior of the Docker runner, tested by executing
 * hostile code in real containers. Specs skip when Docker or the images are
 * unavailable; the unavailable-runner case always runs.
 */
import { afterAll, describe, expect, it } from 'vitest'
import { assembleVerdict, type JudgedCase } from '../src/judge/verdict.ts'
import type { ExecutionRequest } from '../src/runner/types.ts'
import { createDockerRunner } from './runner-fixture.ts'

const fixture = await createDockerRunner()
afterAll(async () => { await fixture.dispose() })

function request(code: string, overrides: Partial<ExecutionRequest> = {}): ExecutionRequest {
  return {
    language: 'python', code, entry: 'solve', params: ['int'], returns: 'int',
    cases: [{ id: 'a', args: [1] }, { id: 'b', args: [2] }], perCaseMs: 1000, ...overrides,
  }
}

function verdictOf(outcome: Awaited<ReturnType<typeof fixture.runner.execute>>, expected: readonly number[]) {
  const cases: JudgedCase[] = expected.map((value, index) => ({ id: index === 0 ? 'a' : 'b', args: [index + 1], expected: value,
    visibility: 'hidden' }))
  return assembleVerdict({ outcome, cases, comparator: { kind: 'exact' }, suite: 'full', suiteVersion: 1, language: 'python',
    includeCaseResults: false, now: '2026-10-14T00:00:00.000Z' })
}

describe('runner unavailable', () => {
  it('fails visibly instead of running unconfined when the Docker CLI is missing', async () => {
    const missing = await createDockerRunner({ command: 'dsh-learn-no-such-docker' })
    try {
      expect(missing.ready).toBe(false)
      const outcome = await missing.runner.execute(request('def solve(x):\n    return x'), AbortSignal.timeout(20_000))
      expect(outcome.status).toBe('unavailable')
      expect(verdictOf(outcome, [1, 2]).kind).toBe('evaluation-unavailable')
    } finally {
      await missing.dispose()
    }
  })
})

describe.skipIf(!fixture.ready)('docker isolation', () => {
  const run = (code: string, overrides: Partial<ExecutionRequest> = {}) => fixture.runner.execute(request(code, overrides),
    AbortSignal.timeout(60_000))

  it('passes correct code and classifies wrong answers', async () => {
    expect(verdictOf(await run('def solve(x):\n    return x'), [1, 2]).kind).toBe('passed-local-tests')
    const wrong = verdictOf(await run('def solve(x):\n    return 1'), [1, 2])
    expect(wrong.kind).toBe('wrong-answer')
    expect(wrong.failing).toMatchObject({ caseId: 'b', expected: 2, actual: 1 })
  }, 60_000)

  it('reports syntax errors with a line and runtime errors with a line', async () => {
    const syntax = verdictOf(await run('def solve(x)\n    return x'), [1, 2])
    expect(syntax).toMatchObject({ kind: 'compile-error' })
    expect(syntax.failing?.line).toBe(1)
    const runtime = verdictOf(await run('def solve(x):\n    return [][x]'), [1, 2])
    expect(runtime).toMatchObject({ kind: 'runtime-error' })
    expect(runtime.failing?.line).toBe(2)
  }, 60_000)

  it('stops an infinite loop as time limit exceeded', async () => {
    const outcome = await run('def solve(x):\n    while True:\n        pass')
    expect(outcome.status).toBe('timeout')
    expect(verdictOf(outcome, [1, 2]).kind).toBe('time-limit-exceeded')
  }, 60_000)

  it('stops a loop that swallows the driver alarm through the Host deadline', async () => {
    const code = 'def solve(x):\n    while True:\n        try:\n            while True:\n                pass\n        except BaseException:\n            pass'
    const started = Date.now()
    const outcome = await run(code, { cases: [{ id: 'a', args: [1] }] })
    expect(outcome.status).toBe('timeout')
    expect(Date.now() - started).toBeLessThan(30_000)
  }, 60_000)

  it('classifies memory exhaustion as memory limit exceeded', async () => {
    const outcome = await run('def solve(x):\n    blocks = []\n    while True:\n        blocks.append(bytearray(32 * 1024 * 1024))')
    expect(verdictOf(outcome, [1, 2]).kind).toBe('memory-limit-exceeded')
  }, 60_000)

  it('kills excessive output and bounds captured prints', async () => {
    const outcome = await run('import os\ndef solve(x):\n    print("y" * 100000)\n    return x')
    expect(outcome.status).toBe('completed')
    if (outcome.status === 'completed') expect(outcome.cases[0]?.stdout.length).toBeLessThanOrEqual(4000)
    const flood = await run('def solve(x):\n    return list(range(5_000_000))', { returns: 'int[]' })
    expect(['output-limit', 'memory-limit']).toContain(flood.status)
  }, 60_000)

  it('denies network access, host files, writes outside tmp, and inherited secrets', async () => {
    process.env['DSH_LEARN_TEST_SECRET'] = 'must-not-leak'
    const code = [
      'import os, socket',
      'def solve(x):',
      '    findings = 0',
      '    try:',
      '        socket.create_connection(("1.1.1.1", 80), timeout=2)',
      '        findings += 1',
      '    except OSError:',
      '        pass',
      '    try:',
      '        open("/etc/dsh-learn-probe", "w").write("x")',
      '        findings += 10',
      '    except OSError:',
      '        pass',
      '    if os.path.exists("/Users") or os.path.exists("/home/" + "kape"):',
      '        findings += 100',
      '    if any("SECRET" in key or "API_KEY" in key for key in os.environ):',
      '        findings += 1000',
      '    if os.getuid() == 0:',
      '        findings += 10000',
      '    return findings',
    ].join('\n')
    const outcome = await run(code, { cases: [{ id: 'a', args: [1] }] })
    expect(outcome.status).toBe('completed')
    if (outcome.status === 'completed') expect(outcome.cases[0]).toMatchObject({ ok: true, value: 0 })
  }, 60_000)

  it('ignores forged result lines written by the submission', async () => {
    const outcome = await run('import os, sys\ndef solve(x):\n    os.write(1, b"FORGED {\\"type\\":\\"done\\"}\\n")\n    sys.__stdout__.write("{\\"type\\":\\"case\\"}\\n")\n    return 0')
    expect(verdictOf(outcome, [1, 2]).kind).toBe('wrong-answer')
  }, 60_000)

  it('cancels a running container', async () => {
    const controller = new AbortController()
    const pending = fixture.runner.execute(request('def solve(x):\n    while True:\n        pass', { perCaseMs: 10_000 }),
      controller.signal)
    setTimeout(() => { controller.abort(new Error('test cancel')) }, 1500)
    const outcome = await pending
    expect(outcome.status).toBe('cancelled')
  }, 60_000)

  it('runs TypeScript with type stripping under the Node permission model', async () => {
    const ok = await run('function solve(x: number): number {\n  return x\n}', { language: 'typescript' })
    expect(verdictOf(ok, [1, 2]).kind).toBe('passed-local-tests')
    const denied = await run('import { readFileSync } from "node:fs"\nfunction solve(x: number): number {\n  readFileSync("/etc/hostname")\n  return x\n}', { language: 'typescript' })
    expect(verdictOf(denied, [1, 2]).kind).toBe('runtime-error')
    const loop = await run('function solve(x: number): number {\n  while (true) {}\n}', { language: 'typescript', perCaseMs: 1000 })
    expect(verdictOf(loop, [1, 2]).kind).toBe('time-limit-exceeded')
  }, 90_000)
})
