/**
 * Output guard for tutor text. Prompt instructions alone leak solutions, so
 * before the learner has explicitly asked for the solution every fenced code
 * block that could carry one is replaced.
 */
import type { LearnLocale } from '../types.ts'

/** Result of guarding one tutor message. */
export interface GuardedText {
  readonly text: string
  readonly redacted: number
}

const FENCE = /```[^\n]*\n([\s\S]*?)(?:```|$)/g

function looksLikeSolution(body: string, entries: readonly string[]): boolean {
  const lines = body.split('\n').filter(line => line.trim() !== '')
  if (lines.length > 3) return true
  if (/\bclass\s+Solution\b|\bdef\s+\w+\s*\(|\bfunction\s+\w+\s*\(|=>\s*\{|\bfor\b.*:|\bwhile\b/.test(body)) return true
  return entries.some(entry => body.includes(entry))
}

/**
 * Replace solution-shaped fenced code in tutor text.
 * @param text - model text.
 * @param entries - entry names of the current problem.
 * @param locale - replacement note language.
 * @returns guarded text and the number of removed blocks.
 */
export function guardTutorText(text: string, entries: readonly string[], locale: LearnLocale): GuardedText {
  let redacted = 0
  const note = locale === 'zh'
    ? '\n> （此处的代码已隐藏：在你请求“第 4 级：查看解答”之前，导师不会展示完整代码。）\n'
    : '\n> (Code hidden: the tutor shows complete code only after you request the level 4 solution.)\n'
  const fenced = text.replace(FENCE, (block, body: string) => {
    if (!looksLikeSolution(body, entries)) return block
    redacted++
    return note
  })
  const codeLine = /^(\s{2,}\S|(def|class|function|for|while|if|elif|else|return|const|let|var)\b)/
  const output: string[] = []
  let run: string[] = []
  const flush = (): void => {
    if (run.length >= 3 && looksLikeSolution(run.join('\n'), entries)) {
      redacted++
      output.push(note.trim())
    } else {
      output.push(...run)
    }
    run = []
  }
  for (const line of fenced.split('\n')) {
    if (codeLine.test(line)) run.push(line)
    else { flush(); output.push(line) }
  }
  flush()
  return { text: output.join('\n'), redacted }
}
