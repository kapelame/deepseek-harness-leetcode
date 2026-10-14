/** Host-side, contract-aware output comparison. Model output never selects or defines a comparator. */
import type { Comparator, ValidatorName } from '../types.ts'

/**
 * Canonical JSON with sorted object keys, used for equality and multiset keys.
 * @param value - JSON value.
 * @returns a stable string encoding.
 */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`
  }
  return value === undefined ? 'undefined' : JSON.stringify(value)
}

function sameMultiset(left: readonly unknown[], right: readonly unknown[], key: (item: unknown) => string): boolean {
  if (left.length !== right.length) return false
  const counts = new Map<string, number>()
  for (const item of left) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1)
  for (const item of right) {
    const current = counts.get(key(item))
    if (current === undefined || current === 0) return false
    counts.set(key(item), current - 1)
  }
  return true
}

function sortedInner(item: unknown): string {
  if (!Array.isArray(item)) return canonical(item)
  return `[${item.map(canonical).sort().join(',')}]`
}

function closeEnough(actual: unknown, expected: unknown, tolerance: number): boolean {
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected))
  }
  if (Array.isArray(actual) && Array.isArray(expected)) {
    return actual.length === expected.length && actual.every((item, index) => closeEnough(item, expected[index], tolerance))
  }
  return canonical(actual) === canonical(expected)
}

function validPairIndices(actual: unknown, args: readonly unknown[], base: 0 | 1): boolean {
  const [nums, target] = args
  if (!Array.isArray(nums) || typeof target !== 'number') return false
  if (!Array.isArray(actual) || actual.length !== 2) return false
  const first: unknown = actual[0]
  const second: unknown = actual[1]
  if (!Number.isSafeInteger(first) || !Number.isSafeInteger(second)) return false
  const left = (first as number) - base
  const right = (second as number) - base
  if (left === right || left < 0 || right < 0 || left >= nums.length || right >= nums.length) return false
  if (base === 1 && !(left < right)) return false
  return (nums[left] as number) + (nums[right] as number) === target
}

function longestPalindrome(actual: unknown, expected: unknown, args: readonly unknown[]): boolean {
  const [text] = args
  if (typeof text !== 'string' || typeof actual !== 'string' || typeof expected !== 'string') return false
  return actual.length === expected.length && text.includes(actual) && [...actual].reverse().join('') === actual
}

interface TreeShape { readonly value: unknown; left: TreeShape | null; right: TreeShape | null }

/** Rebuild a level-order tree encoding; `undefined` when the encoding is malformed. */
function levelOrderTree(values: unknown): TreeShape | null | undefined {
  if (!Array.isArray(values)) return undefined
  if (values.length === 0) return null
  if (values[0] === null) return values.length === 1 ? null : undefined
  const root: TreeShape = { value: values[0], left: null, right: null }
  const queue: TreeShape[] = [root]
  let index = 1
  for (let head = 0; head < queue.length && index < values.length; head++) {
    const node = queue[head]
    if (node === undefined) break
    for (const side of ['left', 'right'] as const) {
      if (index >= values.length) break
      const value: unknown = values[index++]
      if (value === null) continue
      const child: TreeShape = { value, left: null, right: null }
      node[side] = child
      queue.push(child)
    }
  }
  return index === values.length ? root : undefined
}

function balancedBstOf(actual: unknown, args: readonly unknown[]): boolean {
  const [nums] = args
  const root = levelOrderTree(actual)
  if (root === undefined || !Array.isArray(nums)) return false
  const order: unknown[] = []
  const height = (node: TreeShape | null): number => {
    if (node === null) return 0
    const left = height(node.left)
    order.push(node.value)
    const right = height(node.right)
    if (left < 0 || right < 0 || Math.abs(left - right) > 1) return -1
    return Math.max(left, right) + 1
  }
  return height(root) >= 0 && canonical(order) === canonical(nums)
}

const VALIDATORS: Readonly<Record<ValidatorName, (actual: unknown, args: readonly unknown[], expected: unknown) => boolean>> = {
  'pair-indices-sum': (actual, args) => validPairIndices(actual, args, 0),
  'pair-indices-sum-one-based': (actual, args) => validPairIndices(actual, args, 1),
  'longest-palindromic-substring': (actual, args, expected) => longestPalindrome(actual, expected, args),
  'balanced-bst-same-inorder': (actual, args) => balancedBstOf(actual, args),
}

/**
 * Compare one actual value with the frozen expected value under a contract.
 * @param comparator - problem comparator.
 * @param actual - value returned by the submission.
 * @param expected - frozen expected value from the reference.
 * @param args - case arguments, used by validators.
 * @returns whether the actual value satisfies the contract.
 */
export function outputsMatch(comparator: Comparator, actual: unknown, expected: unknown, args: readonly unknown[]): boolean {
  switch (comparator.kind) {
    case 'exact': return canonical(actual) === canonical(expected)
    case 'unordered':
      return Array.isArray(actual) && Array.isArray(expected) && sameMultiset(actual, expected, canonical)
    case 'unordered-nested':
      return Array.isArray(actual) && Array.isArray(expected) && sameMultiset(actual, expected, sortedInner)
    case 'float': return closeEnough(actual, expected, comparator.tolerance)
    case 'validator': return VALIDATORS[comparator.name](actual, args, expected)
    default: {
      const unreachable: never = comparator
      return unreachable
    }
  }
}
