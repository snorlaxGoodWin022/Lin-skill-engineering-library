// components/MonacoEditor.tsx
'use client'

import { useEffect, useRef } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

interface Props {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
}

export default function MonacoEditor({ value, onChange, readOnly = false }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    // 检测暗黑模式
    const darkMode = document.documentElement.classList.contains('dark')
    monaco.editor.setTheme(darkMode ? 'vs-dark' : 'vs')
  }

  // 监听暗黑模式变化
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (editorRef.current) {
        const darkMode = document.documentElement.classList.contains('dark')
        const monaco = (window as any).monaco
        if (monaco?.editor) {
          monaco.editor.setTheme(darkMode ? 'vs-dark' : 'vs')
        }
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      value={value}
      onChange={(v) => onChange?.(v || '')}
      onMount={handleMount}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
      }}
    />
  )
}
