// app/skill/[filename]/SkillDetailClient.tsx
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { FRAMEWORK_LABELS, FRAMEWORK_COLORS, CATEGORY_LABELS } from '@/types/skill'
import type { Skill } from '@/types/skill'

interface Heading {
  id: string
  text: string
  level: number // 2 for ##, 3 for ###
}

interface Props {
  skill: Skill
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const regex = /^(#{2,3})\s+(.+)$/gm
  let match
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = generateHeadingId(text)
    headings.push({ id, text, level })
  }
  return headings
}

/** 从标题文本生成 DOM id */
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** 简易 markdown → HTML，并为 h2/h3 注入 id */
function renderMarkdownWithIds(content: string): string {
  // 用占位符保护代码块
  const codeBlocks: string[] = []
  let result = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length
    // 简单转义 HTML
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    codeBlocks.push(
      `<pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto my-4"><code>${escaped}</code></pre>`
    )
    return `%%CODEBLOCK_${idx}%%`
  })

  // 行内代码
  result = result.replace(/`([^`]+)`/g, (_, code) => {
    return `<code class="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-sm">${code}</code>`
  })

  // h3 (### )
  result = result.replace(/^### (.+)$/gm, (_, text) => {
    const id = generateHeadingId(text.replace(/<[^>]+>/g, ''))
    return `<h3 id="${id}" class="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-gray-100">${text}</h3>`
  })

  // h2 (## )
  result = result.replace(/^## (.+)$/gm, (_, text) => {
    const id = generateHeadingId(text.replace(/<[^>]+>/g, ''))
    return `<h2 id="${id}" class="text-xl font-semibold mt-8 mb-3 text-gray-900 dark:text-gray-100">${text}</h2>`
  })

  // h1 (# )
  result = result.replace(/^# (.+)$/gm, (_, text) => {
    return `<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">${text}</h1>`
  })

  // 粗体
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // 列表
  result = result.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
  result = result.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4">$2</li>')

  // 链接
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
  )

  // 段落
  result = result.replace(/\n\n/g, '</p><p class="my-3 text-gray-700 dark:text-gray-300">')

  // 恢复代码块
  result = result.replace(/%%CODEBLOCK_(\d+)%%/g, (_, idx) => codeBlocks[parseInt(idx)])

  return `<div class="prose prose-sm max-w-none dark:prose-invert"><p class="my-3 text-gray-700 dark:text-gray-300">${result}</p></div>`
}

export default function SkillDetailClient({ skill }: Props) {
  const [activeId, setActiveId] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  const headings = useMemo(() => extractHeadings(skill.content), [skill.content])

  // 带有 id 的渲染 HTML
  const renderedHtml = useMemo(() => renderMarkdownWithIds(skill.content), [skill.content])

  // IntersectionObserver 追踪当前可见标题
  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', root: container }
    )

    // 等待 DOM 渲染完成后观察
    const timer = setTimeout(() => {
      headings.forEach((h) => {
        const el = container.querySelector(`[id="${h.id}"]`)
        if (el) observer.observe(el)
      })
    }, 200)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [headings])

  const scrollToHeading = useCallback((id: string) => {
    const container = contentRef.current
    if (!container) return

    const el = container.querySelector(`[id="${id}"]`) as HTMLElement | null
    if (el) {
      // 计算目标在容器内的偏移量
      const containerRect = container.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const scrollOffset = elRect.top - containerRect.top + container.scrollTop - 16
      container.scrollTo({ top: scrollOffset, behavior: 'smooth' })
      setActiveId(id)
    }
  }, [])

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      {/* 顶部操作栏 */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
        <Link
          href="/library"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-medium text-gray-900 dark:text-white truncate">
            {skill.meta.title}
          </h1>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${FRAMEWORK_COLORS[skill.meta.framework]}`}>
          {FRAMEWORK_LABELS[skill.meta.framework]}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
          {CATEGORY_LABELS[skill.meta.category] || skill.meta.category}
        </span>
        <Link
          href={`/configurator?skill=${encodeURIComponent(skill.filename)}`}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          打开配置器
        </Link>
      </div>

      {/* 主体：大纲 + 内容 */}
      <div className="flex flex-1 min-h-0">
        {/* 左侧大纲 */}
        <nav className="hidden md:block w-56 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="p-3">
            <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-2">
              目录
            </div>
            <ul className="space-y-0.5">
              {headings.map((h) => (
                <li key={h.id}>
                  <button
                    onClick={() => scrollToHeading(h.id)}
                    className={`w-full text-left text-sm py-1 px-2 rounded transition cursor-pointer truncate ${
                      h.level === 3 ? 'pl-5' : ''
                    } ${
                      activeId === h.id
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* 右侧内容 */}
        <div ref={contentRef} className="flex-1 overflow-y-auto scroll-smooth">
          <div
            className="max-w-3xl mx-auto p-6"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </div>
    </div>
  )
}
