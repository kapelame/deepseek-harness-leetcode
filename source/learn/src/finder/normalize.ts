/**
 * Normalize unambiguous alternative shapes of a model submission before
 * schema validation. Live runs showed models naturally writing locale-major
 * text lists (`{ zh: [...], en: [...] }`), input domains keyed by parameter
 * name, and code wrapped as `{ python: "..." }`. Each rewrite is exact; any
 * shape that could mean two things is left for the schema to reject.
 */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type { ParamSpec } from '../types.ts'

type JsonRecord = { readonly [key: string]: JsonValue }

function record(value: JsonValue | undefined): JsonRecord | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : undefined
}

/** `{ zh: [a, b], en: [c, d] }` to `[{ zh: a, en: c }, { zh: b, en: d }]` when both lists have the same length. */
function localizedList(value: JsonValue | undefined): JsonValue | undefined {
  const fields = record(value)
  const zh = fields?.['zh']
  const en = fields?.['en']
  if (fields === undefined || Object.keys(fields).length !== 2 || !Array.isArray(zh) || !Array.isArray(en) || zh.length !== en.length) return value
  return zh.map((item, index): JsonValue => ({ zh: item, en: en[index] ?? null }))
}

/** `{ python: "..." }` to the code string. */
function code(value: JsonValue | undefined): JsonValue | undefined {
  const fields = record(value)
  const python = fields?.['python'] ?? fields?.['python3']
  return fields !== undefined && Object.keys(fields).length === 1 && typeof python === 'string' ? python : value
}

/** Domains keyed by parameter name, or listed with a `name`, to positional domains. */
function inputs(value: JsonValue | undefined, params: readonly ParamSpec[]): JsonValue | undefined {
  const byName = record(value)
  if (byName !== undefined) {
    const names = Object.keys(byName)
    if (names.length !== params.length || !params.every(param => names.includes(param.name))) return value
    return params.map(param => byName[param.name] ?? null)
  }
  if (!Array.isArray(value) || value.length !== params.length) return value
  const named = value.map(record)
  if (!named.every(item => typeof item?.['name'] === 'string')) return value
  const ordered = params.map(param => named.find(item => item?.['name'] === param.name))
  if (ordered.some(item => item === undefined)) return value
  return ordered.map((item): JsonValue => Object.fromEntries(Object.entries(item ?? {}).filter(([key]) => key !== 'name')))
}

/**
 * Rewrite the unambiguous alternative shapes of a submission.
 * @param raw - the model's `spec` argument.
 * @param params - verified parameters of the problem.
 * @returns the submission in the canonical shape where a rewrite applied, otherwise unchanged.
 */
export function normalizeSubmission(raw: JsonValue, params: readonly ParamSpec[]): JsonValue {
  const fields = record(raw)
  if (fields === undefined) return raw
  const out: Record<string, JsonValue> = { ...fields }
  const set = (key: string, value: JsonValue | undefined): void => {
    if (value !== undefined) out[key] = value
  }
  set('constraints', localizedList(fields['constraints']))
  set('hints', localizedList(fields['hints']))
  set('reference', code(fields['reference']))
  set('oracle', code(fields['oracle']))
  set('inputs', inputs(fields['inputs'], params))
  return out
}
