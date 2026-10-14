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

function decode(kind, value) {
  if (kind === 'tree') return buildTree(value)
  if (kind === 'linked-list') {
    let head = null
    for (let index = value.length - 1; index >= 0; index--) head = new ListNode(value[index], head)
    return head
  }
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

  let javascript
  try {
    javascript = stripTypeScriptTypes(request.code, { mode: 'strip' })
  } catch (error) {
    emit({ type: 'compile-error', message: String(error?.message ?? error).split('\n')[0], line: null })
    return
  }
  const entry = request.entry
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
    emit({ type: 'compile-error', message: `Define a top-level function ${entry}`, line: null })
    return
  }
  emit({ type: 'ready' })
  for (const testCase of request.cases) {
    emit({ type: 'start', id: testCase.id })
    take()
    const args = testCase.args.map((value, index) => decode(request.params[index], value))
    const started = performance.now()
    let result
    try {
      result = await fn(...args)
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
      value = encode(request.returns, result)
    } catch (error) {
      emit({ type: 'case', id: testCase.id, ok: false, error: { kind: 'invalid-output', message: `Returned value is not valid for ${request.returns}: ${error.message}`, line: null }, timeMs: elapsed, stdout, stdoutTruncated })
      continue
    }
    if (JSON.stringify(value).length > request.maxValueBytes) {
      emit({ type: 'case', id: testCase.id, ok: false, error: { kind: 'output-limit', message: `Returned value exceeds ${request.maxValueBytes} bytes`, line: null }, timeMs: elapsed, stdout, stdoutTruncated })
      return
    }
    emit({ type: 'case', id: testCase.id, ok: true, value, timeMs: elapsed, stdout, stdoutTruncated })
  }
  emit({ type: 'done' })
}

main().catch(error => { writeOut(`driver failure ${String(error?.message ?? error)}\n`); process.exitCode = 70 })
