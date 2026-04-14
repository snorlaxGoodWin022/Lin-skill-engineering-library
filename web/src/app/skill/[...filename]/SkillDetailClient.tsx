// app/skill/[filename]/SkillDetailClient.tsx
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { FRAMEWORK_LABELS, FRAMEWORK_COLORS, CATEGORY_LABELS } from '@/types/skill'
import type { Skill } from '@/types/skill'
import MarkdownRenderer from '@/components/MarkdownRenderer'

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
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '')
    headings.push({ id, text, level })
  }
  return headings
}

/** 为 markdown 内容中的标题注入 id 锚点 */
function injectHeadingIds(html: string): string {
  return html.replace(/<h([23]) class="[^"]*">(.+?)<\/h[23]>/g, (match, level, text) => {
    const id = text
      .replace(/<[^>]+>/g, '')
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '')
    return `<h${level} id="${id}" class="${match.includes('class="') ? match.match(/class="([^"]*)"/)?.[1] || '' : ''}">${text}</h${level}>`
  })
}

export default function SkillDetailClient({ skill }: Props) {
  const [activeId, setActiveId] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  const headings = useMemo(() => extractHeadings(skill.content), [skill.content])

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

    // 稍后观察（等待 markdown 渲染完成）
    const timer = setTimeout(() => {
      headings.forEach((h) => {
        const el = document.getElementById(h.id)
        if (el) observer.observe(el)
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [headings])

  const scrollToHeading = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }, [])

  // 为渲染后的 HTML 注入 id
  const renderedHtml = useMemo(() => {
    // MarkdownRenderer 的输出中提取并注入 id
    // 我们需要直接渲染带 id 的内容
    return ''
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
                    className={`w-full text-left text-sm py-1 px-2 rounded transition truncate ${
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
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <SkillContentRenderer content={skill.content} headings={headings} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** 渲染 markdown 并为标题注入 id */
function SkillContentRenderer({ content, headings }: { content: string; headings: Heading[] }) {
  // 直接用 dangerouslySetInnerHTML 渲染 MarkdownRenderer 的输出
  // 并为每个标题注入 id
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    // 遍历 h2/h3 元素，注入 id
    const h2s = ref.current.querySelectorAll('h2, h3')
    h2s.forEach((el) => {
      const text = el.textContent || ''
      const id = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-|-$/g, '')
      el.id = id
    })
  }, [content])

  return (
    <div ref={ref}>
      <MarkdownRenderer content={content} />
    </div>
  )
}
