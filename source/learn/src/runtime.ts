/** Shared Host-side runtime handed by the Learn service to its feature modules. */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type { Context } from '@deepseek-ai/cordis'
import type { AttemptId, AttemptView, CodeLanguage, LearnerId, LearnerSettings, TopicId, TutorStatus } from './types.ts'
import type { Config } from './config.ts'
import type { LearnStore } from './store/store.ts'
import type { ProblemRegistry } from './problems.ts'
import type { RunnerBackend } from './runner/types.ts'
import type { ProblemDefinition } from './content/catalog.ts'
import type { LearnAgentResult } from './agents/runtime.ts'

/** Outcome of validating one proposed test. */
export interface ProposedTestOutcome {
  readonly status: 'validated' | 'rejected'
  readonly expected?: JsonValue
  readonly reason: string
}

/** Capabilities shared by judging, tutoring, reviews, variants, and email. */
export interface LearnRuntime {
  /** Host context that owns Learn agents and logging. */
  readonly host: Context
  readonly config: Config
  readonly store: LearnStore
  readonly problems: ProblemRegistry
  readonly runner: RunnerBackend
  /** Shared Python input-generation library (`runtime/gen_lib.py`). */
  readonly generatorLibrary: string
  /** @returns the current instant. */
  now(): Date
  /** @returns the current instant as ISO text. */
  iso(): string
  /** @returns merged learner settings. */
  settings(learner: LearnerId): LearnerSettings
  /** @returns the learner-local calendar date. */
  today(learner: LearnerId): string
  /** @returns whether a model can be attempted. */
  tutorAvailable(): boolean
  /** @returns model configuration and the last observed failure. */
  tutorStatus(): TutorStatus
  /** Record the outcome of an agent run for status reporting. */
  noteAgentResult(result: LearnAgentResult): void
  /** @returns recent mistake tags on a topic, newest first. */
  recentMistakeTags(learner: LearnerId, topic: TopicId): string[]
  /** Validate and store one proposed test. */
  proposeTest(definition: ProblemDefinition, attempt: AttemptId | undefined, args: readonly JsonValue[], rationale: string,
    signal: AbortSignal): Promise<ProposedTestOutcome>
  /** Run learner code and the reference on one input; returns both outputs for diagnosis. */
  runOnInput(learner: LearnerId, definition: ProblemDefinition, language: CodeLanguage, code: string, args: readonly JsonValue[],
    signal: AbortSignal): Promise<Readonly<Record<string, unknown>>>
  /** Update lesson and review state after a settled submission. */
  afterSubmit(learner: LearnerId, attempt: AttemptView, definition: ProblemDefinition): Promise<void>
}
