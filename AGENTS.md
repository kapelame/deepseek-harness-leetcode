# AGENTS.md

Guidance for coding agents working in this repository. Read [README.md](README.md) first for what the plugin does.

## What this is

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) plugin, published as `dsh-plugin-learn` from `github:kapelame/deepseek-harness-leetcode`. It ships prebuilt `lib/`, so a GitHub install runs no build script. Supported DSH: `>=0.2.0-rc.2 <0.3.0`; keep it working on 0.2.0-rc.2 (current Desktop) and the newest 0.2.x.

## Layout

| Path | Contents |
|---|---|
| `source/learn/` | Host service (`dsh-plugin-learn/service`): content catalog, judge and Docker runner, store (SQLite, forward-only migrations in `src/store/schema.ts`), tutor, reviews, email, problem finder (`src/finder/`). Tests in `tests/`. |
| `source/api-learn/` | Remote API (`@Remote` methods and streams) between Host and browser. |
| `source/client-ui-learn/` | Browser UI (React). Every user-visible string lives in `src/client/locales.ts`, in both `zh` and `en`. |
| `runtime/` | Code that runs inside the runner container: `python_driver.py`, `typescript_driver.mjs`, `gen_lib.py` (input generators). |
| `content/` | Curriculum data: `topics/`, `problems/<slug>/`, `variants/`, `collections/hot-100.yaml`. |
| `skills/learn-problem-author/SKILL.md` | Skill loaded only by the problem-finder agent. |
| `authoring/` | Scripts that generate Hot 100 content and freeze suites. |
| `scripts/build.mjs` | Builds `source/` inside a DSH checkout and assembles `lib/`. |
| `lib/` | Build output. Committed. Never edit by hand. |

## Build and test

The sources build only inside a DSH checkout (they use the DSH toolchain):

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git ../dsh
git -C ../dsh checkout dsh-v0.2.0-rc.2
CI=true node scripts/build.mjs ../dsh            # first time: copy in, pnpm install, build, assemble lib/
node scripts/build.mjs ../dsh --skip-install     # rebuild
node scripts/build.mjs ../dsh --stage-only       # copy sources in without building (for tests)
(cd ../dsh && npx vitest run packages/experimental/learn/tests)
```

- `CI=true` skips DSH's lefthook installer, which refuses to replace a user-level `core.hooksPath`. Never change the user's git config to get around it.
- The build type-checks tests too; fix type errors in specs as well.
- Tests need Docker and the images `python:3.13-alpine` and `node:24-alpine`. A run must end with every test passing; report failures verbatim.
- Build `lib/` against the **oldest** supported DSH (0.2.0-rc.2), then also build and test against the newest 0.2.x before release. `scripts/build.mjs` adapts to toolchain differences (for example the `clientBundle()` signature); add such shims there, not in `source/`.
- After changing anything in `source/`, rebuild and commit the regenerated `lib/` in the same commit.

## Rules that must hold

**Content integrity**
- Never copy or closely paraphrase LeetCode statements. Summaries, hints, explanations, and lessons are original and bilingual (`zh` and `en`, written with equal care).
- Never invent LeetCode numbers, titles, difficulties, tags, acceptance rates, test cases, or editorials. Metadata comes from LeetCode's public API and carries a `verifiedAt` date. Paid-only problems are excluded.
- Every problem has a reference solution and an **independently written** brute-force oracle. Never weaken an oracle to match a wrong reference.
- Suites are frozen (`suite.v<N>.json`) and never edited in place; a change means a new version.

**Judging and security**
- Verdicts come only from test execution. The AI judge may add feedback but never changes a verdict. A pass is "passed local tests", never "LeetCode accepted".
- Learner code runs only in the Docker runner: no network, read-only filesystem, resource limits. If the runner is unavailable, fail visibly; never fall back to running code on the host.
- Expected answers, model credentials, and email capabilities must never be reachable from learner code.
- The problem finder fetches metadata only (no statements, no login, no credentials), paces requests, and respects its per-run budget. Trusted fields (number, title, difficulty, tags, signature, examples) come from LeetCode, never from the model. Do not add bulk scraping.

**Behavior**
- Lesson checks are written and graded by the tutor; the built-in multiple-choice questions are used only when the learner explicitly chooses them (for example without a model). A tutor failure is shown, never treated as a pass.
- No silent fallbacks, mocked core behavior, or TODOs presented as finished work.
- Do not send real email in development or tests; the default `capture` transport writes previews only.
- Do not run live-model flows (tutor, finder, AI judge) against the user's account without explicit permission; tests use the scripted model in `tests/service-fixture.ts`.

## Adding content

- **A Hot 100 or curated problem:** add an entry to the matching module in `authoring/hot100/`, run `python3 authoring/build_content.py`, then `authoring/freeze.sh ../dsh` to validate and freeze its suite. Check `content.spec.ts` passes.
- **A topic:** `content/topics/<id>.yaml` with all lesson stages (motivation, strategy, worked example with trace, checks, practice problem, reflection) and at least two seeded variants with mutants.
- **New judge shapes or value types:** update both drivers (`runtime/python_driver.py`, `runtime/typescript_driver.mjs`), `gen_lib.py`, the schema in `source/learn/src/content/schema.ts`, and add cases to `tests/shapes.spec.ts` for both languages, including wrong-answer detection.
- **Finder authoring guidance** belongs in `skills/learn-problem-author/SKILL.md`, not in hard-coded prompts.

## Conventions

- Match the surrounding code: TypeScript strict mode with `exactOptionalPropertyTypes`, zod for parsing untrusted JSON, brief JSDoc on exported functions.
- UI strings: add both locales; remove keys that are no longer used.
- Store schema changes: bump `LEARN_SCHEMA_VERSION` and add an idempotent, forward-only migration.
- Bump `version` in `package.json` for every release and keep the tested DSH versions in both READMEs current.
- Keep `README.md` and `README.zh.md` in sync. Screenshots in `docs/images/` are taken from an isolated DSH home, never from the user's real data.
- When testing Desktop or Web, use a throwaway `DSH_HOME` (and `--user-data-dir` for Desktop); never modify the user's real profile unless asked.
