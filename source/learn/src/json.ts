/** JSON helpers that keep parsed values typed. */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'

/**
 * Parse JSON text produced by this package.
 * @param text - JSON text.
 * @returns the parsed value.
 */
export function parseJson(text: string): JsonValue {
  return JSON.parse(text) as JsonValue
}

/**
 * Detach a value into plain JSON, dropping undefined members.
 * @param value - serializable value.
 * @returns the JSON copy.
 */
export function toJson(value: object): JsonValue {
  return parseJson(JSON.stringify(value))
}
