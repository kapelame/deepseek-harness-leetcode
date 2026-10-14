/**
 * Built-in curriculum checks. Every authored problem and variant is rebuilt
 * through the isolated runner and must reproduce its frozen suite exactly.
 * With LEARN_FREEZE_SUITES=1 a missing suite file is written once; an
 * existing suite version is never rewritten.
 */
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { loadCurriculum } from '../src/content/catalog.ts'
import { suiteInputOf } from '../src/content/suite-input.ts'
import { buildSuite } from '../src/judge/suite-builder.ts'
import { CONTENT_ROOT, createDockerRunner } from './runner-fixture.ts'

const curriculum = await loadCurriculum(CONTENT_ROOT, false)
const fixture = await createDockerRunner()
afterAll(async () => { await fixture.dispose() })

describe('curriculum structure', () => {
  it('covers at least six topics, twelve verified LeetCode problems, and two variants per topic', () => {
    expect(curriculum.topics.length).toBeGreaterThanOrEqual(6)
    const leetcode = [...curriculum.problems.values()].filter(item => item.kind === 'leetcode')
    expect(leetcode.length).toBeGreaterThanOrEqual(12)
    for (const problem of leetcode) {
      expect(problem.leetcode?.url).toBe(`https://leetcode.com/problems/${problem.leetcode?.slug ?? ''}/`)
      expect(problem.statement).toBeUndefined()
    }
    for (const topic of curriculum.topics) expect(curriculum.seedVariants.get(topic.id)?.length ?? 0).toBeGreaterThanOrEqual(2)
  })
})

describe.skipIf(!fixture.ready)('frozen suites', () => {
  for (const definition of curriculum.problems.values()) {
    it(`${definition.id} reproduces suite v${String(definition.suiteVersion)}`, async () => {
      const parent = definition.variant === undefined ? undefined : curriculum.problems.get(definition.variant.parentProblemId)
      const result = await buildSuite(fixture.runner, suiteInputOf(definition, parent), AbortSignal.timeout(300_000))
      expect(result.checks.filter(check => !check.ok)).toEqual([])
      const directory = join(CONTENT_ROOT, definition.kind === 'variant' ? 'variants' : 'problems', definition.id)
      const path = join(directory, `suite.v${String(definition.suiteVersion)}.json`)
      if (!existsSync(path)) {
        expect(process.env['LEARN_FREEZE_SUITES'], `${path} is missing; rerun with LEARN_FREEZE_SUITES=1`).toBe('1')
        const frozen = { problemId: definition.id, version: definition.suiteVersion, origin: 'authored', createdAt: '2026-10-14',
          cases: result.cases }
        await writeFile(path, `${JSON.stringify(frozen)}\n`, { flag: 'wx' })
        return
      }
      const frozen = JSON.parse(await readFile(path, 'utf8')) as { cases: unknown }
      expect(frozen.cases).toEqual(result.cases)
    }, 600_000)
  }
})
