/**
 * Calling conventions beyond plain functions: in-place mutation, named
 * harnesses for object-graph inputs, design classes, and list-of-lists input,
 * executed in real containers for both languages. Validators and starters are
 * checked without a runner.
 */
import { afterAll, describe, expect, it } from 'vitest'
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import { deriveStarters } from '../src/content/generation.ts'
import { outputsMatch } from '../src/judge/compare.ts'
import type { CaseOutcome, ExecutionOutcome, ExecutionRequest } from '../src/runner/types.ts'
import type { CodeLanguage, ProblemShape } from '../src/types.ts'
import { createDockerRunner } from './runner-fixture.ts'

const fixture = await createDockerRunner()
afterAll(async () => { await fixture.dispose() })

const run = (request: Omit<ExecutionRequest, 'perCaseMs'>): Promise<ExecutionOutcome> =>
  fixture.runner.execute({ perCaseMs: 2000, ...request }, AbortSignal.timeout(90_000))

function values(outcome: ExecutionOutcome): (JsonValue | { error: string })[] {
  expect(outcome.status).toBe('completed')
  return 'cases' in outcome ? outcome.cases.map((item: CaseOutcome) => item.ok ? item.value : { error: item.error.kind }) : []
}

const MIN_STACK: ProblemShape = {
  kind: 'design', className: 'MinStack', constructorParams: [],
  methods: [
    { name: 'push', params: [{ name: 'val', type: 'int' }], returns: 'void' },
    { name: 'pop', params: [], returns: 'void' },
    { name: 'top', params: [], returns: 'int' },
    { name: 'getMin', params: [], returns: 'int' },
  ],
}
const MIN_STACK_CASE = { id: 'a', args: [['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'top', 'getMin'],
  [[], [-2], [0], [-3], [], [], [], []]] }
const MIN_STACK_EXPECTED = [null, null, null, null, -3, null, 0, -2]

const SOURCES: Record<CodeLanguage, Record<string, string>> = {
  python: {
    rotate: 'def rotate(matrix):\n    matrix[:] = [list(row) for row in zip(*matrix[::-1])]\n',
    minStack: [
      'class MinStack:',
      '    def __init__(self):',
      '        self.items = []',
      '    def push(self, val):',
      '        self.items.append((val, min(val, self.items[-1][1]) if self.items else val))',
      '    def pop(self):',
      '        self.items.pop()',
      '    def top(self):',
      '        return self.items[-1][0]',
      '    def getMin(self):',
      '        return self.items[-1][1]',
    ].join('\n'),
    hasCycle: 'def hasCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n        if slow is fast:\n            return True\n    return False\n',
    detectCycle: 'def detectCycle(head):\n    seen = set()\n    while head:\n        if id(head) in seen:\n            return head\n        seen.add(id(head))\n        head = head.next\n    return None\n',
    foreignNode: 'def detectCycle(head):\n    return ListNode(0)\n',
    intersection: 'def getIntersectionNode(a, b):\n    seen = set()\n    while a:\n        seen.add(id(a))\n        a = a.next\n    while b:\n        if id(b) in seen:\n            return b\n        b = b.next\n    return None\n',
    copyRandom: [
      'def copyRandomList(head):',
      '    if head is None:',
      '        return None',
      '    clones = {}',
      '    node = head',
      '    while node:',
      '        clones[node] = Node(node.val)',
      '        node = node.next',
      '    for original, clone in clones.items():',
      '        clone.next = clones.get(original.next)',
      '        clone.random = clones.get(original.random)',
      '    return clones[head]',
    ].join('\n'),
    shallowCopy: 'def copyRandomList(head):\n    return head\n',
    lca: 'def lowestCommonAncestor(root, p, q):\n    if root in (None, p, q):\n        return root\n    left = lowestCommonAncestor(root.left, p, q)\n    right = lowestCommonAncestor(root.right, p, q)\n    return root if left and right else left or right\n',
    mergeK: 'import heapq\ndef mergeKLists(lists):\n    values = sorted(v for head in lists for v in iter_list(head))\n    dummy = tail = ListNode()\n    for v in values:\n        tail.next = ListNode(v)\n        tail = tail.next\n    return dummy.next\ndef iter_list(head):\n    while head:\n        yield head.val\n        head = head.next\n',
  },
  typescript: {
    rotate: 'function rotate(matrix: number[][]): void {\n  const n = matrix.length\n  const copy = matrix.map(row => [...row])\n  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) matrix[j][n - 1 - i] = copy[i][j]\n}\n',
    minStack: [
      'class MinStack {',
      '  items: [number, number][] = []',
      '  push(val: number): void { const m = this.items.length ? Math.min(val, this.items[this.items.length - 1][1]) : val; this.items.push([val, m]) }',
      '  pop(): void { this.items.pop() }',
      '  top(): number { return this.items[this.items.length - 1][0] }',
      '  getMin(): number { return this.items[this.items.length - 1][1] }',
      '}',
    ].join('\n'),
    hasCycle: 'function hasCycle(head: ListNode | null): boolean {\n  let slow = head, fast = head\n  while (fast && fast.next) { slow = slow!.next; fast = fast.next.next; if (slow === fast) return true }\n  return false\n}\n',
    detectCycle: 'function detectCycle(head: ListNode | null): ListNode | null {\n  const seen = new Set<ListNode>()\n  while (head) { if (seen.has(head)) return head; seen.add(head); head = head.next }\n  return null\n}\n',
    foreignNode: 'function detectCycle(head: ListNode | null): ListNode | null {\n  return new ListNode(0)\n}\n',
    intersection: 'function getIntersectionNode(a: ListNode | null, b: ListNode | null): ListNode | null {\n  const seen = new Set<ListNode>()\n  while (a) { seen.add(a); a = a.next }\n  while (b) { if (seen.has(b)) return b; b = b.next }\n  return null\n}\n',
    copyRandom: 'function copyRandomList(head: _Node | null): _Node | null {\n  const clones = new Map<_Node, _Node>()\n  for (let n = head; n; n = n.next) clones.set(n, new _Node(n.val))\n  for (const [o, c] of clones) { c.next = o.next ? clones.get(o.next)! : null; c.random = o.random ? clones.get(o.random)! : null }\n  return head ? clones.get(head)! : null\n}\n',
    shallowCopy: 'function copyRandomList(head: _Node | null): _Node | null {\n  return head\n}\n',
    lca: 'function lowestCommonAncestor(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {\n  if (root === null || root === p || root === q) return root\n  const left = lowestCommonAncestor(root.left, p, q)\n  const right = lowestCommonAncestor(root.right, p, q)\n  return left && right ? root : left ?? right\n}\n',
    mergeK: 'function mergeKLists(lists: Array<ListNode | null>): ListNode | null {\n  const values: number[] = []\n  for (let head of lists) for (; head; head = head.next) values.push(head.val)\n  values.sort((a, b) => a - b)\n  const dummy = new ListNode(0)\n  let tail = dummy\n  for (const v of values) { tail.next = new ListNode(v); tail = tail.next }\n  return dummy.next\n}\n',
  },
}

describe.skipIf(!fixture.ready).each(['python', 'typescript'] as const)('%s calling conventions', (language) => {
  const code = SOURCES[language]
  const source = (name: string): string => code[name] ?? ''

  it('compares the mutated parameter of an in-place solution', async () => {
    const outcome = await run({ language, code: source('rotate'), entry: 'rotate', params: ['int[][]'], returns: 'int[][]',
      shape: { kind: 'in-place', param: 0 }, cases: [{ id: 'a', args: [[[1, 2], [3, 4]]] }] })
    expect(values(outcome)).toEqual([[[3, 1], [4, 2]]])
  }, 120_000)

  it('runs a design class through LeetCode-style operation lists', async () => {
    const outcome = await run({ language, code: source('minStack'), entry: 'MinStack', params: ['string[]', 'json'], returns: 'json',
      shape: MIN_STACK, cases: [MIN_STACK_CASE] })
    expect(values(outcome)).toEqual([MIN_STACK_EXPECTED])
    const missing = await run({ language, code: language === 'python' ? 'class Other:\n    pass\n' : 'class Other {}\n', entry: 'MinStack',
      params: ['string[]', 'json'], returns: 'json', shape: MIN_STACK, cases: [MIN_STACK_CASE] })
    expect(missing).toMatchObject({ status: 'compile-error' })
  }, 120_000)

  it('builds cycles from pos and reports returned nodes by index', async () => {
    const shape: ProblemShape = { kind: 'harness', name: 'linked-list-cycle' }
    const cases = [{ id: 'a', args: [[3, 2, 0, -4], 1] }, { id: 'b', args: [[1], -1] }]
    expect(values(await run({ language, code: source('hasCycle'), entry: 'hasCycle', params: ['linked-list', 'int'], returns: 'bool',
      shape, cases }))).toEqual([true, false])
    expect(values(await run({ language, code: source('detectCycle'), entry: 'detectCycle', params: ['linked-list', 'int'],
      returns: 'int', shape, cases }))).toEqual([1, -1])
    expect(values(await run({ language, code: source('foreignNode'), entry: 'detectCycle', params: ['linked-list', 'int'],
      returns: 'int', shape, cases: [cases[0] ?? { id: 'a', args: [] }] }))).toEqual([{ error: 'invalid-output' }])
  }, 120_000)

  it('shares nodes between intersecting lists', async () => {
    const outcome = await run({ language, code: source('intersection'), entry: 'getIntersectionNode',
      params: ['int', 'linked-list', 'linked-list', 'int', 'int'], returns: 'json', shape: { kind: 'harness', name: 'linked-list-intersection' },
      cases: [{ id: 'a', args: [8, [4, 1, 8, 4, 5], [5, 6, 1, 8, 4, 5], 2, 3] }, { id: 'b', args: [0, [2, 6, 4], [1, 5], 3, 2] }] })
    expect(values(outcome)).toEqual([8, null])
  }, 120_000)

  it('requires a deep copy of a random-pointer list', async () => {
    const shape: ProblemShape = { kind: 'harness', name: 'random-list' }
    const cases = [{ id: 'a', args: [[[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]] }]
    expect(values(await run({ language, code: source('copyRandom'), entry: 'copyRandomList', params: ['json'], returns: 'json', shape,
      cases }))).toEqual([[[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]])
    expect(values(await run({ language, code: source('shallowCopy'), entry: 'copyRandomList', params: ['json'], returns: 'json', shape,
      cases }))).toEqual([{ error: 'invalid-output' }])
  }, 120_000)

  it('passes tree nodes for p and q and reports the returned node value', async () => {
    const outcome = await run({ language, code: source('lca'), entry: 'lowestCommonAncestor', params: ['tree', 'int', 'int'], returns: 'int',
      shape: { kind: 'harness', name: 'tree-node-refs' },
      cases: [{ id: 'a', args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1] }, { id: 'b', args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4] }] })
    expect(values(outcome)).toEqual([3, 5])
  }, 120_000)

  it('decodes a list of linked lists', async () => {
    const outcome = await run({ language, code: source('mergeK'), entry: 'mergeKLists', params: ['linked-list[]'], returns: 'linked-list',
      cases: [{ id: 'a', args: [[[1, 4, 5], [1, 3, 4], [2, 6]]] }, { id: 'b', args: [[]] }] })
    expect(values(outcome)).toEqual([[1, 1, 2, 3, 4, 4, 5, 6], []])
  }, 120_000)
})

describe('multi-answer validators', () => {
  it('accepts any longest palindromic substring', () => {
    const comparator = { kind: 'validator', name: 'longest-palindromic-substring' } as const
    expect(outputsMatch(comparator, 'aba', 'bab', ['babad'])).toBe(true)
    expect(outputsMatch(comparator, 'ba', 'bab', ['babad'])).toBe(false)
    expect(outputsMatch(comparator, 'xyx', 'bab', ['babad'])).toBe(false)
  })

  it('accepts any height-balanced BST over the sorted input', () => {
    const comparator = { kind: 'validator', name: 'balanced-bst-same-inorder' } as const
    expect(outputsMatch(comparator, [0, -3, 9, -10, null, 5], [0, -10, 5, null, -3, null, 9], [[-10, -3, 0, 5, 9]])).toBe(true)
    expect(outputsMatch(comparator, [0, -10, 5, null, -3, null, 9], [], [[-10, -3, 0, 5, 9]])).toBe(true)
    expect(outputsMatch(comparator, [-10, null, -3, null, 0, null, 5, null, 9], [], [[-10, -3, 0, 5, 9]])).toBe(false)
    expect(outputsMatch(comparator, [0, -3, 9, -10, null, 6], [], [[-10, -3, 0, 5, 9]])).toBe(false)
  })
})

describe('starters', () => {
  it('derives class skeletons for design problems', () => {
    const starter = deriveStarters({ python: 'MinStack', typescript: 'MinStack' }, [{ name: 'operations', type: 'string[]' },
      { name: 'arguments', type: 'json' }], 'json', 'method', MIN_STACK)
    expect(starter.python).toContain('class MinStack:')
    expect(starter.python).toContain('def getMin(self) -> int:')
    expect(starter.typescript).toContain('push(val: number): void {')
  })

  it('exposes the solution parameters of a harness, not the test inputs', () => {
    const starter = deriveStarters({ python: 'detectCycle', typescript: 'detectCycle' }, [{ name: 'head', type: 'linked-list' },
      { name: 'pos', type: 'int' }], 'int', 'method', { kind: 'harness', name: 'linked-list-cycle' })
    expect(starter.python).toContain('def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:')
    expect(starter.typescript).toContain('function detectCycle(head: ListNode | null): ListNode | null {')
  })

  it('returns nothing for in-place problems', () => {
    const starter = deriveStarters({ python: 'rotate', typescript: 'rotate' }, [{ name: 'matrix', type: 'int[][]' }], 'int[][]', 'method',
      { kind: 'in-place', param: 0 })
    expect(starter.python).toContain('def rotate(self, matrix: List[List[int]]) -> None:')
    expect(starter.typescript).toContain('function rotate(matrix: number[][]): void {')
  })
})
