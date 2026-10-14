/**
 * General problem generation: declarative input domains, generator
 * composition over the shared Python library, and starters derived from the
 * signature. Authored content, model-generated variants, and imports all use
 * this one scheme; a hand-written generator is only an override.
 */
import type { CodeLanguage, ParamSpec, ProblemShape, ValueType } from '../types.ts'
import { HARNESS_SIGNATURES, type InputDomain } from './schema.ts'

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
  'tree': 'Optional[TreeNode]', 'linked-list': 'Optional[ListNode]', 'linked-list[]': 'List[Optional[ListNode]]',
  'json': 'Any',
}

const TYPESCRIPT_TYPES: Readonly<Record<ValueType, string>> = {
  'int': 'number', 'float': 'number', 'bool': 'boolean', 'string': 'string',
  'int[]': 'number[]', 'float[]': 'number[]', 'bool[]': 'boolean[]', 'string[]': 'string[]',
  'int[][]': 'number[][]', 'string[][]': 'string[][]',
  'tree': 'TreeNode | null', 'linked-list': 'ListNode | null', 'linked-list[]': 'Array<ListNode | null>',
  'json': 'any',
}

const NODE_NOTES: Readonly<Record<'TreeNode' | 'ListNode' | 'Node', Record<CodeLanguage, string>>> = {
  TreeNode: { python: '# class TreeNode: val, left, right (provided)\n',
    typescript: '// class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null } (provided)\n' },
  ListNode: { python: '# class ListNode: val, next (provided)\n',
    typescript: '// class ListNode { val: number; next: ListNode | null } (provided)\n' },
  Node: { python: '# class Node: val, next, random (provided)\n',
    typescript: '// class _Node { val: number; next: _Node | null; random: _Node | null } (provided)\n' },
}

type StarterParam = { readonly name: string; readonly python: string; readonly typescript: string }

function nodeTypes(node: 'TreeNode' | 'ListNode' | 'Node' | 'bool'): Record<CodeLanguage, string> {
  if (node === 'bool') return { python: 'bool', typescript: 'boolean' }
  return node === 'Node' ? { python: "Optional['Node']", typescript: '_Node | null' } : { python: `Optional[${node}]`,
    typescript: `${node} | null` }
}

function notesFor(nodes: Iterable<string>): Record<CodeLanguage, string> {
  const found = new Set(nodes)
  const keys = (['TreeNode', 'ListNode', 'Node'] as const).filter(key => found.has(key))
  return { python: keys.map(key => NODE_NOTES[key].python).join(''), typescript: keys.map(key => NODE_NOTES[key].typescript).join('') }
}

function nodesOf(types: Iterable<ValueType | 'void'>): string[] {
  return [...types].flatMap(type => type === 'tree' ? ['TreeNode'] : type === 'linked-list' || type === 'linked-list[]' ? ['ListNode'] : [])
}

function functionStarter(entry: Readonly<Record<CodeLanguage, string>>, params: readonly StarterParam[],
  result: Record<CodeLanguage, string>, notes: Record<CodeLanguage, string>, style: 'method' | 'function'): Record<CodeLanguage, string> {
  const pyParams = params.map(param => `${param.name}: ${param.python}`).join(', ')
  const tsParams = params.map(param => `${param.name}: ${param.typescript}`).join(', ')
  const python = style === 'method'
    ? `${notes.python}class Solution:\n    def ${entry.python}(self${pyParams === '' ? '' : `, ${pyParams}`}) -> ${result.python}:\n        pass\n`
    : `${notes.python}def ${entry.python}(${pyParams}) -> ${result.python}:\n    pass\n`
  return { python, typescript: `${notes.typescript}function ${entry.typescript}(${tsParams}): ${result.typescript} {\n\n}\n` }
}

function designStarter(shape: Extract<ProblemShape, { kind: 'design' }>): Record<CodeLanguage, string> {
  const py = (params: readonly ParamSpec[]): string => params.map(item => `, ${item.name}: ${PYTHON_TYPES[item.type]}`).join('')
  const ts = (params: readonly ParamSpec[]): string => params.map(item => `${item.name}: ${TYPESCRIPT_TYPES[item.type]}`).join(', ')
  const pyReturn = (type: ValueType | 'void'): string => type === 'void' ? 'None' : PYTHON_TYPES[type]
  const tsReturn = (type: ValueType | 'void'): string => type === 'void' ? 'void' : TYPESCRIPT_TYPES[type]
  const notes = notesFor(nodesOf([...shape.constructorParams.map(item => item.type),
    ...shape.methods.flatMap(item => [...item.params.map(param => param.type), item.returns])]))
  const python = [
    `${notes.python}class ${shape.className}:`,
    '',
    `    def __init__(self${py(shape.constructorParams)}):`,
    '        pass',
    ...shape.methods.flatMap(item => ['', `    def ${item.name}(self${py(item.params)}) -> ${pyReturn(item.returns)}:`, '        pass']),
    '',
  ].join('\n')
  const typescript = [
    `${notes.typescript}class ${shape.className} {`,
    `    constructor(${ts(shape.constructorParams)}) {`,
    '',
    '    }',
    ...shape.methods.flatMap(item => ['', `    ${item.name}(${ts(item.params)}): ${tsReturn(item.returns)} {`, '', '    }']),
    '}',
    '',
  ].join('\n')
  return { python, typescript }
}

/**
 * Derive editor starters from a signature and calling convention.
 * @param entry - entry names per language.
 * @param params - parameters as stored in test cases.
 * @param returns - return encoding as stored in test cases.
 * @param style - `method` for LeetCode-style `class Solution`, `function` otherwise.
 * @param shape - optional calling convention; harness and design problems expose LeetCode's own signature.
 * @returns starter code per language.
 */
export function deriveStarters(entry: Readonly<Record<CodeLanguage, string>>, params: readonly ParamSpec[], returns: ValueType,
  style: 'method' | 'function', shape?: ProblemShape): Record<CodeLanguage, string> {
  if (shape?.kind === 'design') return designStarter(shape)
  if (shape?.kind === 'harness') {
    const signature = HARNESS_SIGNATURES[shape.name]
    const solution = signature.solution.map(item => ({ name: item.name, ...nodeTypes(item.node) }))
    const result = signature.result[returns] ?? 'bool'
    const notes = notesFor([...signature.solution.map(item => item.node), result])
    return functionStarter(entry, solution, nodeTypes(result), notes, style)
  }
  const starterParams = params.map(param => ({ name: param.name, python: PYTHON_TYPES[param.type], typescript: TYPESCRIPT_TYPES[param.type] }))
  const result = shape?.kind === 'in-place' ? { python: 'None', typescript: 'void' }
    : { python: PYTHON_TYPES[returns], typescript: TYPESCRIPT_TYPES[returns] }
  const notes = notesFor(nodesOf([...params.map(param => param.type), ...shape?.kind === 'in-place' ? [] : [returns]]))
  return functionStarter(entry, starterParams, result, notes, style)
}
