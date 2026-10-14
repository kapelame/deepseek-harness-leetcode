/**
 * Learn service composed with the production agent loop, a scripted model
 * adapter (no provider key), the local subprocess provider, and the real
 * Docker runner.
 */
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context, Service } from '@deepseek-ai/cordis'
import { mountAgentLoopTestDependencies, mountAgentLoopTestHarness } from '@deepseek-ai/dsh-agent-loop-testkit'
import LocalSubprocessRuntime from '@deepseek-ai/dsh-subprocess-local'
import { MockAdapter } from '../../../core/agent-loop/tests/mock-adapter.ts'
import LearnService from '../src/index.ts'
import type { ConfigInput } from '../src/config.ts'
import { TEST_RUNNER_OPTIONS } from './runner-fixture.ts'

/** Minimal `ctx.agentDefaultModel` selecting the scripted adapter. */
class ScriptedDefaultModel extends Service {
  constructor(ctx: Context) {
    super(ctx, 'agentDefaultModel')
  }

  currentSelection(): { provider: string; model: string } {
    return { provider: 'mock', model: 'mock-learn' }
  }
}

/** Fixture handle. */
export interface LearnFixture {
  readonly ctx: Context
  readonly learn: LearnService
  readonly adapter: MockAdapter
  readonly dataRoot: string
  dispose(): Promise<void>
}

/**
 * Compose Learn for a spec.
 * @param options - scripted model responses, whether a model is configured, and config overrides.
 * @returns the fixture.
 */
export async function createLearnFixture(options: {
  script?: ConstructorParameters<typeof MockAdapter>[0]
  model?: boolean
  config?: Omit<ConfigInput, 'dataRoot' | 'runner'>
  dataRoot?: string
} = {}): Promise<LearnFixture> {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  await mountAgentLoopTestHarness(ctx)
  await ctx.plugin(LocalSubprocessRuntime)
  const adapter = new MockAdapter(options.script ?? [])
  ctx.llm.registerAdapter(['mock'], adapter)
  if (options.model !== false) await ctx.plugin(ScriptedDefaultModel)
  const dataRoot = options.dataRoot ?? await mkdtemp(join(tmpdir(), 'dsh-learn-'))
  const { cwd: _cwd, ...defaults } = TEST_RUNNER_OPTIONS
  const runner = { ...defaults, timeScale: 3 }
  const config = LearnService.Config({
    ...options.config,
    dataRoot,
    defaultTimezone: options.config?.defaultTimezone ?? 'Asia/Shanghai',
    runner,
    email: { workerIntervalMs: 3_600_000, ...options.config?.email },
  })
  await ctx.plugin(LearnService, config)
  const learn = await new Promise<LearnService>((resolve) => {
    ctx.inject(['learn'], (child) => { resolve(child.learn) })
  })
  return {
    ctx, learn, adapter, dataRoot,
    dispose: async () => {
      await ctx.fiber.dispose()
      if (options.dataRoot === undefined) await rm(dataRoot, { recursive: true, force: true })
    },
  }
}
