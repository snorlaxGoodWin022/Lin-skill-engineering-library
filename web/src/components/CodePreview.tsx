// components/CodePreview.tsx
'use client'

import { useState } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

interface Props {
  code: string
  language?: string
}

export default function CodePreview({ code, language = 'markdown' }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlighted = hljs.highlight(code, { language }).value

  return (
    <div className="relative rounded-lg border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm text-gray-500">{language}</span>
        <button
          onClick={handleCopy}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {copied ? '已复制 ✓' : '复制'}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-auto max-h-[600px]">
        <pre className="p-4 text-sm">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  )
}
