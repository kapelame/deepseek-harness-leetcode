/**
 * General problem generation: declarative input domains, generator
 * composition over the shared Python library, and starters derived from the
 * signature. Authored content, model-generated variants, and imports all use
 * this one scheme; a hand-written generator is only an override.
 */
import type { CodeLanguage, ParamSpec, ValueType } from '../types.ts'
import type { InputDomain } from './schema.ts'

/**
 * Check that domains line up with parameters.
 * @param params - signature parameters.
 * @param domains - one domain per parameter.
 * @returns a problem description, or undefined when consistent.
 */
export function domainMismatch(params: readonly ParamSpec[], domains: readonly InputDomain[]): string | undefined {
  if (params.length !== domains.length) return `expected ${String(params.length)} input domains, got ${String(domains.length)}`
  const index = params.findIndex((param, position) => domains[position]?.type !== param.type)
  return index < 0 ? undefined : `input domain ${String(index + 1)} has type ${domains[index]?.type ?? '?'} but parameter ${params[index]?.name ?? ''} is ${params[index]?.type ?? ''}`
}

/**
 * Compose a `generate(seed, size)` program from the shared library, domains, and optional hooks.
 * @param library - `runtime/gen_lib.py` source.
 * @param domains - parameter domains.
 * @param hooks - optional Python defining `adjust(args, rng, size)` and/or `valid(args)`.
 * @returns Python source for the isolated runner.
 */
export function composeGenerator(library: string, domains: readonly InputDomain[], hooks: string | undefined): string {
  return [
    library,
    'import json as _json',
    `DOMAINS = _json.loads(${JSON.stringify(JSON.stringify(domains))})`,
    hooks ?? '',
    'def generate(seed, size):',
    '    return generate_from_domains(DOMAINS, seed, size, adjust=globals().get("adjust"), valid=globals().get("valid"))',
    '',
  ].join('\n')
}

const PYTHON_TYPES: Readonly<Record<ValueType, string>> = {
  'int': 'int', 'float': 'float', 'bool': 'bool', 'string': 'str',
  'int[]': 'List[int]', 'float[]': 'List[float]', 'bool[]': 'List[bool]', 'string[]': 'List[str]',
  'int[][]': 'List[List[int]]', 'string[][]': 'List[List[str]]',
  'tree': 'Optional[TreeNode]', 'linked-list': 'Optional[ListNode]',
}

const TYPESCRIPT_TYPES: Readonly<Record<ValueType, string>> = {
  'int': 'number', 'float': 'number', 'bool': 'boolean', 'string': 'string',
  'int[]': 'number[]', 'float[]': 'number[]', 'bool[]': 'boolean[]', 'string[]': 'string[]',
  'int[][]': 'number[][]', 'string[][]': 'string[][]',
  'tree': 'TreeNode | null', 'linked-list': 'ListNode | null',
}

/**
 * Derive editor starters from a signature.
 * @param entry - entry names per language.
 * @param params - parameters.
 * @param returns - return encoding.
 * @param style - `method` for LeetCode-style `class Solution`, `function` otherwise.
 * @returns starter code per language.
 */
export function deriveStarters(entry: Readonly<Record<CodeLanguage, string>>, params: readonly ParamSpec[], returns: ValueType,
  style: 'method' | 'function'): Record<CodeLanguage, string> {
  const pyParams = params.map(param => `${param.name}: ${PYTHON_TYPES[param.type]}`).join(', ')
  const tsParams = params.map(param => `${param.name}: ${TYPESCRIPT_TYPES[param.type]}`).join(', ')
  const treeNote = params.some(param => param.type === 'tree') || returns === 'tree'
    ? { python: '# class TreeNode: val, left, right (provided)\n',
      typescript: '// class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null } (provided)\n' }
    : { python: '', typescript: '' }
  const python = style === 'method'
    ? `${treeNote.python}class Solution:\n    def ${entry.python}(self, ${pyParams}) -> ${PYTHON_TYPES[returns]}:\n        pass\n`
    : `${treeNote.python}def ${entry.python}(${pyParams}) -> ${PYTHON_TYPES[returns]}:\n    pass\n`
  return {
    python,
    typescript: `${treeNote.typescript}function ${entry.typescript}(${tsParams}): ${TYPESCRIPT_TYPES[returns]} {\n\n}\n`,
  }
}
