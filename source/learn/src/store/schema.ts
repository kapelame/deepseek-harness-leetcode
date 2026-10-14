/**
 * Learn SQLite schema. The database is canonical learner data, so versions
 * only move forward through ordered migrations; a newer database is refused.
 */
import type { DatabaseSync } from 'node:sqlite'
import { mkdir, open } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

/** Current monotonic schema version. */
export const LEARN_SCHEMA_VERSION = 1

/** SQLite application id ("LERN") protecting unrelated databases. */
export const LEARN_APPLICATION_ID = 0x4C45524E

/** Ordered forward migrations; index `i` upgrades version `i` to `i + 1`. */
const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE learners (
    id TEXT PRIMARY KEY,
    settings_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE lesson_progress (
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL,
    stage TEXT NOT NULL,
    check_answers_json TEXT NOT NULL,
    skipped INTEGER NOT NULL DEFAULT 0,
    reflection TEXT,
    reflection_feedback TEXT,
    completed_at TEXT,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (learner_id, topic_id)
  ) STRICT;

  CREATE TABLE drafts (
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (learner_id, problem_id, language)
  ) STRICT;

  CREATE TABLE notes (
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL,
    body TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (learner_id, problem_id)
  ) STRICT;

  CREATE TABLE attempts (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL,
    problem_version INTEGER NOT NULL,
    suite_version INTEGER NOT NULL,
    language TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('run', 'submit')),
    context TEXT NOT NULL CHECK (context IN ('practice', 'lesson', 'review')),
    review_item_id TEXT,
    code TEXT NOT NULL,
    support TEXT NOT NULL CHECK (support IN ('independent', 'with-hints', 'studied-solution')),
    hints_used INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('judging', 'done')),
    judge_mode TEXT,
    created_at TEXT NOT NULL
  ) STRICT;
  CREATE INDEX attempts_by_problem ON attempts (learner_id, problem_id, created_at);

  CREATE TABLE verdicts (
    attempt_id TEXT PRIMARY KEY REFERENCES attempts(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    passed INTEGER NOT NULL,
    total INTEGER NOT NULL,
    verdict_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;
  CREATE TRIGGER verdicts_immutable BEFORE UPDATE ON verdicts
  BEGIN SELECT RAISE(ABORT, 'verdicts are immutable'); END;

  CREATE TABLE assessments (
    attempt_id TEXT PRIMARY KEY REFERENCES attempts(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    assessment_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE hint_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
    source TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;
  CREATE INDEX hints_by_problem ON hint_events (learner_id, problem_id);

  CREATE TABLE mistake_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    attempt_id TEXT NOT NULL,
    problem_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE tutor_threads (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    session_id TEXT,
    created_at TEXT NOT NULL,
    UNIQUE (learner_id, subject)
  ) STRICT;

  CREATE TABLE tutor_messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL REFERENCES tutor_threads(id) ON DELETE CASCADE,
    seq INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('learner', 'tutor')),
    content TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    created_at TEXT NOT NULL
  ) STRICT;
  CREATE INDEX tutor_messages_by_thread ON tutor_messages (thread_id, seq);

  CREATE TABLE problems (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('variant', 'imported')),
    parent_problem_id TEXT,
    topic_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('validated', 'quarantined')),
    spec_json TEXT NOT NULL,
    validation_json TEXT NOT NULL,
    origin_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE suites (
    problem_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    origin TEXT NOT NULL,
    cases_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (problem_id, version)
  ) STRICT;
  CREATE TRIGGER suites_immutable BEFORE UPDATE ON suites
  BEGIN SELECT RAISE(ABORT, 'suite versions are immutable'); END;

  CREATE TABLE proposed_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id TEXT NOT NULL,
    attempt_id TEXT,
    args_json TEXT NOT NULL,
    expected_json TEXT,
    status TEXT NOT NULL CHECK (status IN ('validated', 'rejected', 'promoted')),
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE review_items (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL,
    parent_problem_id TEXT NOT NULL,
    step INTEGER NOT NULL,
    interval_days INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    last_reason TEXT,
    last_reviewed_at TEXT,
    created_at TEXT NOT NULL,
    UNIQUE (learner_id, parent_problem_id)
  ) STRICT;

  CREATE TABLE review_assignments (
    item_id TEXT NOT NULL REFERENCES review_items(id) ON DELETE CASCADE,
    due_date TEXT NOT NULL,
    variant_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, due_date)
  ) STRICT;

  CREATE TABLE review_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('created', 'completed', 'snoozed', 'rescheduled')),
    idempotency_key TEXT NOT NULL UNIQUE,
    attempt_id TEXT,
    variant_id TEXT,
    local_date TEXT NOT NULL,
    before_json TEXT,
    after_json TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;
  CREATE INDEX review_events_by_learner ON review_events (learner_id, local_date);

  CREATE TABLE email_settings (
    learner_id TEXT PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE,
    address TEXT,
    verified_at TEXT,
    verify_code_hash TEXT,
    verify_token_hash TEXT,
    verify_expires_at TEXT,
    verify_attempts INTEGER NOT NULL DEFAULT 0,
    opt_in INTEGER NOT NULL DEFAULT 0,
    paused INTEGER NOT NULL DEFAULT 0,
    delivery_hour INTEGER NOT NULL DEFAULT 9,
    unsubscribe_token TEXT UNIQUE,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE email_jobs (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('digest', 'verification', 'test')),
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TEXT NOT NULL,
    lease_until TEXT,
    payload_json TEXT NOT NULL,
    last_error TEXT,
    reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;
  CREATE INDEX email_jobs_ready ON email_jobs (status, next_attempt_at);

  CREATE TABLE email_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL REFERENCES email_jobs(id) ON DELETE CASCADE,
    transport TEXT NOT NULL,
    status TEXT NOT NULL,
    message_id TEXT,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    text_body TEXT NOT NULL,
    html_body TEXT NOT NULL,
    preview_path TEXT,
    error TEXT,
    created_at TEXT NOT NULL
  ) STRICT;
  `,
]

async function createDatabaseFile(path: string): Promise<void> {
  try {
    const handle = await open(path, 'wx', 0o600)
    await handle.close()
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
  }
}

/**
 * Run `body` inside one immediate write transaction.
 * @param db - open database.
 * @param body - synchronous statements; a throw rolls the transaction back.
 * @returns the body's result after commit.
 */
export function transaction<T>(db: DatabaseSync, body: () => T): T {
  db.exec('BEGIN IMMEDIATE')
  try {
    const result = body()
    db.exec('COMMIT')
    return result
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

/**
 * Open, validate, and migrate the Learn database.
 * @param path - database file, or `:memory:` for tests.
 * @returns an open database at {@link LEARN_SCHEMA_VERSION}.
 */
export async function openLearnDatabase(path: string): Promise<DatabaseSync> {
  const actual = path === ':memory:' ? path : resolve(path)
  if (actual !== ':memory:') {
    await mkdir(dirname(actual), { recursive: true, mode: 0o700 })
    await createDatabaseFile(actual)
  }
  const { DatabaseSync } = await import('node:sqlite')
  const db = new DatabaseSync(actual)
  try {
    const { application_id: applicationId } = db.prepare('PRAGMA application_id').get() as { application_id: number }
    const { user_version: version } = db.prepare('PRAGMA user_version').get() as { user_version: number }
    const tables = db.prepare('SELECT name FROM sqlite_schema WHERE type = \'table\' AND name NOT LIKE \'sqlite_%\'').all()
    if (applicationId !== 0 && applicationId !== LEARN_APPLICATION_ID) throw new Error(`learn database at "${actual}" belongs to another application`)
    if (applicationId === 0 && tables.length > 0) throw new Error(`learn database at "${actual}" is not empty and is not a Learn database`)
    if (version > LEARN_SCHEMA_VERSION) throw new Error(`learn database at "${actual}" has schema ${String(version)}, newer than supported ${String(LEARN_SCHEMA_VERSION)}`)
    if (actual !== ':memory:') db.exec('PRAGMA journal_mode = WAL')
    db.exec('PRAGMA foreign_keys = ON')
    db.exec('PRAGMA busy_timeout = 5000')
    for (let next = version; next < LEARN_SCHEMA_VERSION; next++) {
      transaction(db, () => {
        db.exec(MIGRATIONS[next] as string)
        db.exec(`PRAGMA application_id = ${String(LEARN_APPLICATION_ID)}`)
        db.exec(`PRAGMA user_version = ${String(next + 1)}`)
      })
    }
    return db
  } catch (error) {
    db.close()
    throw error
  }
}
