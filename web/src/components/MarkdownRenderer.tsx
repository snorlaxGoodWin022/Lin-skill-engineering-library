// components/MarkdownRenderer.tsx
'use client'

import { useMemo } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

interface Props {
  content: string
}

export default function MarkdownRenderer({ content }: Props) {
  const html = useMemo(() => {
    // 简单的 Markdown 渲染
    let result = content
      // 代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
        const highlighted = lang
          ? hljs.highlight(code, { language: lang }).value
          : code
        return `<pre class="bg-gray-100 p-4 rounded-lg overflow-auto my-4"><code>${highlighted}</code></pre>`
      })
      // 行内代码
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">$1</code>')
      // 标题
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // 粗体
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // 列表
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4">$2</li>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      // 段落
      .replace(/\n\n/g, '</p><p class="my-3">')
      // 表格
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(Boolean)
        return `<tr>${cells.map((c: string) => `<td class="border px-3 py-2">${c.trim()}</td>`).join('')}</tr>`
      })

    return `<div class="prose prose-sm max-w-none"><p class="my-3">${result}</p></div>`
  }, [content])

  return (
    <div
      className="markdown-body p-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
