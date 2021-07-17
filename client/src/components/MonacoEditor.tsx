import * as monaco from "monaco-editor"
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker"
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker"
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker"
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
import React, { useEffect, useRef } from "react"
import autorender from "./autorender"
import styles from "./MonacoEditor.module.scss"

declare global {
  interface Window {
    MonacoEnvironment: monaco.Environment;
  }
}

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string): Worker {
    switch (label) {
      case 'json':
        return new jsonWorker()
      case 'css':
        return new cssWorker()
      case 'html':
      case 'handlebars':
      case "razor":
        return new htmlWorker()
      case 'typescript':
      case "javascript":
        return new tsWorker()
      default:
        return new editorWorker()
    }
  }
}

interface MonacoEditorProps {
  model: monaco.editor.ITextModel
}

export function MonacoEditor({ model }: MonacoEditorProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const editor = useRef<monaco.editor.IEditor | null>(null)

  useEffect(() => {
    if (ref.current)
      editor.current = monaco.editor.create(ref.current, {
        model,
        theme: 'vs-dark',
        automaticLayout: true,
        cursorSmoothCaretAnimation: true,
        padding: { top: 10 }
      })
    return () => editor.current?.dispose()
  }, [])

  useEffect(() => {
    if (editor.current)
      editor.current.setModel(model)
  }, [model])

  return autorender(
    () => (
      <div className={styles.container}>
        <div ref={ref} className={styles.editor} />
      </div>
    ),
    [model]
  )
}