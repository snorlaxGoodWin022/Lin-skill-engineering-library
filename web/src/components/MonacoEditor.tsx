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

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor
  }

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
      theme="vs"
    />
  )
}
