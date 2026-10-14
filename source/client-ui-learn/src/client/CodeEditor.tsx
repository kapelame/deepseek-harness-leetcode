/**
 * Code editor built from a native textarea over the shared Shiki highlighter.
 * The textarea keeps native selection, IME, undo, and accessibility; the
 * highlighted layer underneath is decorative.
 */
import { useRef, type KeyboardEvent } from 'react'
import { useCodeHighlighter } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CodeLanguage } from '@deepseek-ai/dsh-experimental-learn/types'
import css from './Learn.module.css'

const INDENT = '    '

/** Editor props. */
export interface CodeEditorProps {
  readonly value: string
  readonly language: CodeLanguage
  readonly label: string
  readonly onChange: (value: string) => void
  /** Ctrl/Cmd+Enter runs, Ctrl/Cmd+Shift+Enter submits. */
  readonly onRun?: () => void
  readonly onSubmit?: () => void
}

/**
 * Render the editor.
 * @param props - code, language, and callbacks.
 * @returns the editor.
 */
export function CodeEditor({ value, language, label, onChange, onRun, onSubmit }: CodeEditorProps) {
  const highlight = useCodeHighlighter(language === 'python' ? 'py' : 'ts')
  const area = useRef<HTMLTextAreaElement>(null)
  const layer = useRef<HTMLPreElement>(null)
  const gutter = useRef<HTMLDivElement>(null)
  const lines = value.split('\n')
  const highlighted = highlight(value)

  const replace = (start: number, end: number, text: string, caret: number): void => {
    const next = value.slice(0, start) + text + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      area.current?.setSelectionRange(caret, caret)
    })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    const target = event.currentTarget
    const { selectionStart: start, selectionEnd: end } = target
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      if (event.shiftKey) onSubmit?.()
      else onRun?.()
      return
    }
    if (event.key === 'Tab' && !event.altKey) {
      event.preventDefault()
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      if (event.shiftKey) {
        const removable = value.slice(lineStart, lineStart + INDENT.length).match(/^ {1,4}/)?.[0].length ?? 0
        if (removable > 0) replace(lineStart, lineStart + removable, '', Math.max(lineStart, start - removable))
        return
      }
      replace(start, end, INDENT, start + INDENT.length)
      return
    }
    if (event.key === 'Enter' && !event.shiftKey && start === end) {
      event.preventDefault()
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const current = value.slice(lineStart, start)
      const indent = /^\s*/.exec(current)?.[0] ?? ''
      const opens = language === 'python' ? /:\s*$/.test(current) : /[{([]\s*$/.test(current)
      const insert = `\n${indent}${opens ? INDENT : ''}`
      replace(start, end, insert, start + insert.length)
    }
  }

  const sync = (): void => {
    const textarea = area.current
    if (textarea === null) return
    if (layer.current !== null) {
      layer.current.scrollTop = textarea.scrollTop
      layer.current.scrollLeft = textarea.scrollLeft
    }
    if (gutter.current !== null) gutter.current.scrollTop = textarea.scrollTop
  }

  return (
    <div className={css.editor}>
      <div ref={gutter} className={css.gutter} aria-hidden="true">
        {lines.map((_line, index) => <div key={index}>{index + 1}</div>)}
      </div>
      <div className={css.editorArea}>
        <pre ref={layer} className={css.editorLayer} aria-hidden="true">
          {highlighted === undefined
            ? `${value}\n`
            : highlighted.map((spans, row) => (
              <div key={row}>
                {spans.length === 0 ? '​' : spans.map((span, column) => <span key={column} style={span.style}>{span.text}</span>)}
              </div>
            ))}
        </pre>
        <textarea
          ref={area}
          className={css.editorInput}
          value={value}
          aria-label={label}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          onChange={(event) => { onChange(event.target.value) }}
          onKeyDown={onKeyDown}
          onScroll={sync}
        />
      </div>
    </div>
  )
}
