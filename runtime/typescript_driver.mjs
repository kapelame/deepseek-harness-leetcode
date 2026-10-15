// Learn judge driver for TypeScript submissions. It runs inside an isolated
// container under Node's permission model, reads one JSON request from stdin,
// strips erasable type syntax, and writes nonce-prefixed JSON events through a
// captured stdout writer. Submission console output is captured and bounded.
import { stripTypeScriptTypes } from 'node:module'
import { performance } from 'node:perf_hooks'

const writeOut = process.stdout.write.bind(process.stdout)

class TreeNode {
  constructor(val, left, right) {
    this.val = val === undefined ? 0 : val
    this.left = left === undefined ? null : left
    this.right = right === undefined ? null : right
  }
}

class ListNode {
  constructor(val, next) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}

class _Node {
  constructor(val, next, random) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
    this.random = random === undefined ? null : random
  }
}

class InvalidOutput extends Error {}

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

function buildTree(values) {
  if (values.length === 0 || values[0] === null) return null
  const root = new TreeNode(values[0])
  const queue = [root]
  let head = 0
  let index = 1
  while (head < queue.length && index < values.length) {
    const node = queue[head++]
    if (index < values.length && values[index] !== null) { node.left = new TreeNode(values[index]); queue.push(node.left) }
    index++
    if (index < values.length && values[index] !== null) { node.right = new TreeNode(values[index]); queue.push(node.right) }
    index++
  }
  return root
}

function serializeTree(root) {
  if (root === null || root === undefined) return []
  const out = []
  const queue = [root]
  let head = 0
  let seen = 0
  while (head < queue.length) {
    const node = queue[head++]
    if (node === null || node === undefined) { out.push(null); continue }
    if (++seen > 100000) throw new Error('tree is too large or contains a cycle')
    out.push(plain(node.val))
    queue.push(node.left ?? null, node.right ?? null)
  }
  while (out.length > 0 && out[out.length - 1] === null) out.pop()
  return out
}

function plain(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('non-finite number')
    return value
  }
  if (value === undefined) throw new Error('undefined is not a valid result')
  if (Array.isArray(value)) return value.map(plain)
  if (value instanceof Set) return [...value].map(plain)
  throw new Error(`unsupported result type ${Object.prototype.toString.call(value)}`)
}

function buildList(values) {
  let head = null
  for (let index = values.length - 1; index >= 0; index--) head = new ListNode(values[index], head)
  return head
}

function linkNodes(nodes) {
  for (let index = 0; index + 1 < nodes.length; index++) nodes[index].next = nodes[index + 1]
  return nodes
}

function walk(head) {
  const nodes = []
  while (head !== null && head !== undefined) {
    if (nodes.length >= 100000) throw new Error('linked list is too long or contains a cycle')
    nodes.push(head)
    head = head.next
  }
  return nodes
}

function decode(kind, value) {
  if (kind === 'tree') return buildTree(value)
  if (kind === 'linked-list') return buildList(value)
  if (kind === 'linked-list[]') return value.map(buildList)
  return value
}

function encode(kind, value) {
  if (kind === 'tree') return serializeTree(value)
  if (kind === 'linked-list') {
    const out = []
    let seen = 0
    while (value !== null && value !== undefined) {
      if (++seen > 100000) throw new Error('linked list is too long or contains a cycle')
      out.push(plain(value.val))
      value = value.next
    }
    return out
  }
  return plain(value)
}

function prepareDesign(shape, Cls, rawArgs) {
  const [operations, argumentsList] = rawArgs
  if (operations.length !== argumentsList.length || operations.length === 0 || operations[0] !== shape.className) {
    throw new Error('design cases start with the constructor and pair every operation with its arguments')
  }
  const methods = new Map(shape.methods.map(method => [method.name, method]))
  for (const name of operations.slice(1)) if (!methods.has(name)) throw new Error(`unknown operation ${name}`)
  const call = async () => {
    const instance = new Cls(...shape.constructorParams.map((param, index) => decode(param.type, argumentsList[0][index])))
    const results = [[null, 'void']]
    for (let index = 1; index < operations.length; index++) {
      const method = methods.get(operations[index])
      const values = method.params.map((param, position) => decode(param.type, argumentsList[index][position]))
      if (typeof instance[method.name] !== 'function') throw new TypeError(`${shape.className}.${method.name} is not a function`)
      results.push([await instance[method.name](...values), method.returns])
    }
    return results
  }
  const finish = results => results.map(([value, kind]) => kind === 'void' ? null : encode(kind, value))
  return [call, finish]
}

function prepareHarness(name, fn, returns, rawArgs) {
  if (name === 'linked-list-cycle') {
    const [values, pos] = rawArgs
    const nodes = linkNodes(values.map(value => new ListNode(value)))
    if (nodes.length > 0 && pos >= 0) nodes[nodes.length - 1].next = nodes[pos]
    const head = nodes[0] ?? null
    const finish = (result) => {
      if (returns === 'bool') {
        if (typeof result !== 'boolean') throw new InvalidOutput('expected a boolean')
        return result
      }
      if (result === null || result === undefined) return -1
      const index = nodes.indexOf(result)
      if (index < 0) throw new InvalidOutput('the returned node is not a node of the input list')
      return index
    }
    return [() => fn(head), finish]
  }
  if (name === 'linked-list-intersection') {
    const [intersectVal, listA, listB, skipA, skipB] = rawArgs
    const nodesA = linkNodes(listA.map(value => new ListNode(value)))
    const shared = intersectVal !== 0 && skipA < nodesA.length
    const ownB = linkNodes((shared ? listB.slice(0, skipB) : listB).map(value => new ListNode(value)))
    let headB = ownB[0] ?? null
    if (shared) {
      if (ownB.length > 0) ownB[ownB.length - 1].next = nodesA[skipA]
      else headB = nodesA[skipA]
    }
    const headA = nodesA[0] ?? null
    const finish = (result) => {
      if (result === null || result === undefined) return null
      if (!nodesA.includes(result)) throw new InvalidOutput('the returned node is not a node of listA')
      return plain(result.val)
    }
    return [() => fn(headA, headB), finish]
  }
  if (name === 'random-list') {
    const [pairs] = rawArgs
    const nodes = linkNodes(pairs.map(pair => new _Node(pair[0])))
    nodes.forEach((node, index) => { const target = pairs[index][1]; node.random = target === null ? null : nodes[target] })
    const originals = new Set(nodes)
    const finish = (result) => {
      const copied = walk(result)
      const positions = new Map(copied.map((node, index) => [node, index]))
      return copied.map((node) => {
        if (originals.has(node)) throw new InvalidOutput('the result reuses input nodes; return a deep copy')
        const target = node.random ?? null
        if (target !== null && !positions.has(target)) throw new InvalidOutput('a random pointer leaves the copied list')
        return [plain(node.val), target === null ? null : positions.get(target)]
      })
    }
    return [() => fn(nodes[0] ?? null), finish]
  }
  if (name === 'tree-node-refs') {
    const [values, pValue, qValue] = rawArgs
    const root = buildTree(values)
    const found = new Map()
    const stack = [root]
    while (stack.length > 0) {
      const node = stack.pop()
      if (node === null || node === undefined) continue
      if (!found.has(node.val)) found.set(node.val, node)
      stack.push(node.left, node.right)
    }
    if (!found.has(pValue) || !found.has(qValue)) throw new Error('p and q must be values present in the tree')
    const finish = (result) => {
      if (!(result instanceof TreeNode)) throw new InvalidOutput('expected a tree node')
      return plain(result.val)
    }
    return [() => fn(root, found.get(pValue), found.get(qValue)), finish]
  }
  throw new Error(`unknown harness ${name}`)
}

function prepare(shape, fn, params, returns, rawArgs) {
  if (shape.kind === 'design') return prepareDesign(shape, fn, rawArgs)
  if (shape.kind === 'harness') return prepareHarness(shape.name, fn, returns, rawArgs)
  const args = rawArgs.map((value, index) => decode(params[index], value))
  if (shape.kind === 'in-place') return [() => fn(...args), () => encode(params[shape.param], args[shape.param])]
  return [() => fn(...args), result => encode(returns, result)]
}

function solutionLine(error, offset) {
  const stack = typeof error?.stack === 'string' ? error.stack : ''
  const match = /data:text\/javascript[^:]*:(\d+):\d+/.exec(stack)
  if (match === null) return null
  const line = Number(match[1]) - offset
  return line > 0 ? line : null
}

async function main() {
  const request = JSON.parse(await readStdin())
  const nonce = request.nonce
  const emit = event => { writeOut(`${nonce} ${JSON.stringify(event)}\n`) }
  let captured = ''
  let truncated = false
  const limit = request.maxStdoutChars
  const sink = (...items) => {
    const text = items.map(item => typeof item === 'string' ? item : (() => { try { return JSON.stringify(item) } catch { return String(item) } })()).join(' ') + '\n'
    const room = limit - captured.length
    if (room <= 0) { truncated = true; return }
    captured += text.slice(0, room)
    if (text.length > room) truncated = true
  }
  const take = () => { const result = [captured, truncated]; captured = ''; truncated = false; return result }
  for (const method of ['log', 'info', 'warn', 'error', 'debug', 'trace']) console[method] = sink
  process.stdout.write = chunk => { sink(String(chunk)); return true }
  process.stderr.write = chunk => { sink(String(chunk)); return true }
  globalThis.TreeNode = TreeNode
  globalThis.ListNode = ListNode
  globalThis._Node = _Node

  let javascript
  try {
    javascript = stripTypeScriptTypes(request.code, { mode: 'strip' })
  } catch (error) {
    emit({ type: 'compile-error', message: String(error?.message ?? error).split('\n')[0], line: null })
    return
  }
  const shape = request.shape ?? { kind: 'function' }
  const entry = shape.kind === 'design' ? shape.className : request.entry
  if (!/^[A-Za-z_$][\w$]*$/.test(entry)) throw new Error('invalid entry name')
  const source = `${javascript}\n;export const __dshEntry = typeof ${entry} === 'function' ? ${entry} : undefined;\n`
  let module
  try {
    module = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
  } catch (error) {
    const kind = error instanceof SyntaxError ? 'compile-error' : 'module-error'
    if (kind === 'compile-error') emit({ type: kind, message: `SyntaxError: ${error.message}`, line: solutionLine(error, 0) })
    else emit({ type: kind, kind: 'runtime', message: `${error?.name ?? 'Error'}: ${error?.message ?? String(error)}`, line: solutionLine(error, 0) })
    return
  }
  const fn = module.__dshEntry
  if (typeof fn !== 'function') {
    emit({ type: 'compile-error', message: shape.kind === 'design' ? `Define class ${entry}` : `Define a top-level function ${entry}`, line: null })
    return
  }
  emit({ type: 'ready' })
  for (const testCase of request.cases) {
    emit({ type: 'start', id: testCase.id })
    take()
    let call, finish
    try {
      [call, finish] = prepare(shape, fn, request.params, request.returns, testCase.args)
    } catch (error) {
      emit({ type: 'driver-error', message: `Cannot decode case ${testCase.id}: ${error?.message ?? String(error)}` })
      return
    }
    const started = performance.now()
    let result
    try {
      result = await call()
    } catch (error) {
      const elapsed = Math.round((performance.now() - started) * 1000) / 1000
      const [stdout, stdoutTruncated] = take()
      const overflow = error instanceof RangeError && /call stack/i.test(String(error.message))
      emit({ type: 'case', id: testCase.id, ok: false, error: { kind: 'runtime', message: `${error?.name ?? 'Error'}: ${error?.message ?? String(error)}${overflow ? ' (stack overflow)' : ''}`, line: solutionLine(error, 0) }, timeMs: elapsed, stdout, stdoutTruncated })
      continue
    }
    const elapsed = Math.round((performance.now() - started) * 1000) / 1000
    const [stdout, stdoutTruncated] = take()
    let value
    try {
      value = finish(result)
    } catch (error) {
      emit({ type: 'case', id: testCase.id, ok: false, error: { kind: 'invalid-output', message: `Returned value is not valid: ${error.message}`, line: null }, timeMs: elapsed, stdout, stdoutTruncated })
      continue
    }
    if (JSON.stringify(value).length > request.maxValueBytes) {
      emit({ type: 'case', id: testCase.id, ok: false, error: { kind: 'output-limit', message: `Returned value exceeds ${request.maxValueBytes} bytes`, line: null }, timeMs: elapsed, stdout, stdoutTruncated })
      return
    }
    emit({ type: 'case', id: testCase.id, ok: true, value, timeMs: elapsed, stdout, stdoutTruncated })
  }
  let peakKb = null
  try { peakKb = process.resourceUsage().maxRSS } catch { peakKb = null }
  emit({ type: 'done', peakKb })
}

main().catch(error => { writeOut(`driver failure ${String(error?.message ?? error)}\n`); process.exitCode = 70 })
