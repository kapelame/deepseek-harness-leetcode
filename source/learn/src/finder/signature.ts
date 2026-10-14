/**
 * Translate LeetCode's public `metaData` into a Learn signature. Only verified
 * metadata decides entry names, parameter encodings, and the calling
 * convention; unsupported shapes are reported instead of guessed.
 */
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type { DesignMethod, ParamSpec, ProblemShape, ValueType } from '../types.ts'

/** Learn signature derived from LeetCode metadata. */
export interface MappedSignature {
  readonly entry: { readonly python: string; readonly typescript: string }
  readonly params: readonly ParamSpec[]
  readonly returns: ValueType
  readonly shape?: ProblemShape
}

/** Mapping result: a signature, or why the problem cannot be judged by Learn. */
export type SignatureMapping = { readonly ok: true; readonly signature: MappedSignature } | { readonly ok: false; readonly reason: string }

const SCALARS: Readonly<Record<string, ValueType>> = {
  'integer': 'int', 'long': 'int', 'double': 'float', 'float': 'float', 'boolean': 'bool', 'string': 'string', 'character': 'string',
  'integer[]': 'int[]', 'list<integer>': 'int[]', 'long[]': 'int[]', 'list<long>': 'int[]',
  'double[]': 'float[]', 'list<double>': 'float[]', 'boolean[]': 'bool[]', 'list<boolean>': 'bool[]',
  'string[]': 'string[]', 'list<string>': 'string[]', 'character[]': 'string[]', 'list<character>': 'string[]',
  'integer[][]': 'int[][]', 'list<list<integer>>': 'int[][]', 'list<integer[]>': 'int[][]',
  'string[][]': 'string[][]', 'list<list<string>>': 'string[][]', 'character[][]': 'string[][]', 'list<list<character>>': 'string[][]',
  'ListNode': 'linked-list', 'TreeNode': 'tree', 'ListNode[]': 'linked-list[]', 'list<ListNode>': 'linked-list[]',
}

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/

function record(value: JsonValue | undefined): Readonly<Record<string, JsonValue>> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : undefined
}

function list(value: JsonValue | undefined): readonly JsonValue[] {
  return Array.isArray(value) ? value : []
}

function str(value: JsonValue | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function typeOf(raw: string | undefined): ValueType | undefined {
  return raw === undefined ? undefined : SCALARS[raw.replace(/\s+/g, '')]
}

function paramsOf(value: JsonValue | undefined): ParamSpec[] | string {
  const out: ParamSpec[] = []
  for (const item of list(value)) {
    const fields = record(item)
    const name = str(fields?.['name'])
    const rawType = str(fields?.['type'])
    const type = typeOf(rawType)
    if (name === undefined || !IDENTIFIER.test(name)) return `parameter name ${JSON.stringify(name)} is not an identifier`
    if (type === undefined) return `parameter type ${rawType ?? '?'} is not supported`
    out.push({ name, type })
  }
  return out
}

function harnessOf(name: string, params: readonly { name: string; type: string }[], returns: string): MappedSignature | undefined {
  const types = params.map(item => item.type).join(',')
  const entry = { python: name, typescript: name }
  if (types === 'ListNode,integer' && params[1]?.name === 'pos' && (returns === 'boolean' || returns === 'ListNode')) {
    return { entry, params: [{ name: 'head', type: 'linked-list' }, { name: 'pos', type: 'int' }], returns: returns === 'boolean' ? 'bool' : 'int',
      shape: { kind: 'harness', name: 'linked-list-cycle' } }
  }
  if (types === 'integer,ListNode,ListNode,integer,integer' && returns === 'ListNode') {
    return { entry, params: [{ name: 'intersectVal', type: 'int' }, { name: 'listA', type: 'linked-list' }, { name: 'listB', type: 'linked-list' },
      { name: 'skipA', type: 'int' }, { name: 'skipB', type: 'int' }], returns: 'json', shape: { kind: 'harness', name: 'linked-list-intersection' } }
  }
  if (name === 'copyRandomList' && types === 'ListNode' && returns === 'ListNode') {
    return { entry, params: [{ name: 'head', type: 'json' }], returns: 'json', shape: { kind: 'harness', name: 'random-list' } }
  }
  if (types === 'TreeNode,integer,integer' && returns === 'TreeNode') {
    return { entry, params: [{ name: 'root', type: 'tree' }, { name: 'p', type: 'int' }, { name: 'q', type: 'int' }], returns: 'int',
      shape: { kind: 'harness', name: 'tree-node-refs' } }
  }
  return undefined
}

/**
 * Map LeetCode `metaData` (already parsed from its JSON string) to a Learn signature.
 * @param meta - the parsed `metaData` object of `question(titleSlug)`.
 * @returns the signature, or the reason the problem is unsupported.
 */
export function mapLeetCodeSignature(meta: JsonValue): SignatureMapping {
  const fields = record(meta)
  if (fields === undefined) return { ok: false, reason: 'metadata is missing' }
  if (fields['systemdesign'] === true) {
    const className = str(fields['classname'])
    if (className === undefined || !IDENTIFIER.test(className)) return { ok: false, reason: 'design class name is missing' }
    const constructorParams = paramsOf(record(fields['constructor'])?.['params'])
    if (typeof constructorParams === 'string') return { ok: false, reason: constructorParams }
    const methods: DesignMethod[] = []
    for (const item of list(fields['methods'])) {
      const method = record(item)
      const name = str(method?.['name'])
      if (name === undefined || !IDENTIFIER.test(name)) return { ok: false, reason: 'a design method name is missing' }
      const params = paramsOf(method?.['params'])
      if (typeof params === 'string') return { ok: false, reason: `${name}: ${params}` }
      const rawReturn = str(record(method?.['return'])?.['type'])
      const returns = rawReturn === 'void' ? 'void' : typeOf(rawReturn)
      if (returns === undefined) return { ok: false, reason: `${name} returns unsupported type ${rawReturn ?? '?'}` }
      methods.push({ name, params, returns })
    }
    if (methods.length === 0) return { ok: false, reason: 'the design class has no methods' }
    return { ok: true, signature: { entry: { python: className, typescript: className }, params: [{ name: 'operations', type: 'string[]' },
      { name: 'arguments', type: 'json' }], returns: 'json', shape: { kind: 'design', className, constructorParams, methods } } }
  }
  const name = str(fields['name'])
  if (name === undefined || !IDENTIFIER.test(name)) return { ok: false, reason: 'function name is missing' }
  const rawReturn = str(record(fields['return'])?.['type'])
  if (fields['manual'] === true) {
    const rawParams = list(fields['params']).map(item => ({ name: str(record(item)?.['name']) ?? '', type: str(record(item)?.['type']) ?? '' }))
    const harness = harnessOf(name, rawParams, rawReturn ?? '')
    if (harness !== undefined) return { ok: true, signature: harness }
    const plain = paramsOf(fields['params'])
    const plainReturn = typeOf(rawReturn)
    // Some manual problems only need a custom checker on LeetCode's side; plain encodings still judge them exactly.
    if (typeof plain !== 'string' && plainReturn !== undefined && !plain.some(item => item.type === 'linked-list' || item.type === 'tree')
      && plainReturn !== 'linked-list' && plainReturn !== 'tree') {
      return { ok: true, signature: { entry: { python: name, typescript: name }, params: plain, returns: plainReturn } }
    }
    return { ok: false, reason: 'the problem needs a custom judge Learn does not provide' }
  }
  const params = paramsOf(fields['params'])
  if (typeof params === 'string') return { ok: false, reason: params }
  if (params.length === 0) return { ok: false, reason: 'the function takes no parameters' }
  const entry = { python: name, typescript: name }
  if (rawReturn === 'void') {
    const index = record(fields['output'])?.['paramindex']
    if (typeof index !== 'number' || params[index] === undefined) return { ok: false, reason: 'an in-place problem names no output parameter' }
    const target = params[index]
    return { ok: true, signature: { entry, params, returns: target.type, shape: { kind: 'in-place', param: index } } }
  }
  const returns = typeOf(rawReturn)
  if (returns === undefined) return { ok: false, reason: `return type ${rawReturn ?? '?'} is not supported` }
  return { ok: true, signature: { entry, params, returns } }
}

/**
 * Parse LeetCode's example test case strings (one JSON value per line) against a signature.
 * @param examples - `exampleTestcaseList` entries.
 * @param width - number of parameters.
 * @returns argument lists that parsed cleanly; malformed examples are dropped.
 */
export function parseExampleInputs(examples: readonly string[], width: number): JsonValue[][] {
  const out: JsonValue[][] = []
  for (const raw of examples) {
    const lines = raw.split('\n').map(line => line.trim()).filter(line => line !== '')
    if (lines.length !== width) continue
    try {
      out.push(lines.map((line): JsonValue => JSON.parse(line) as JsonValue))
    } catch {
      // A malformed official example is skipped; the suite builder still requires at least one example.
      continue
    }
  }
  return out
}
