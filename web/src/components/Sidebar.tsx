// components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FRAMEWORK_LABELS } from '@/types/skill'

interface Props {
  skills: Array<{
    filename: string
    meta: {
      title: string
      framework: string
      category: string
    }
  }>
  currentSkill?: string
  onClose?: () => void
}

export default function Sidebar({ skills, currentSkill, onClose }: Props) {
  const pathname = usePathname()

  // 按框架分组
  const groupedSkills = skills.reduce(
    (acc, skill) => {
      const framework = skill.meta.framework
      if (!acc[framework]) {
        acc[framework] = []
      }
      acc[framework].push(skill)
      return acc
    },
    {} as Record<string, typeof skills>
  )

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/library" className="text-lg font-bold text-gray-900 hover:text-blue-600">
          Skills Library
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto p-2">
        {/* 首页链接 */}
        <Link
          href="/"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 ${
            pathname === '/' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>🏠</span>
          <span>首页</span>
        </Link>

        <Link
          href="/library"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 ${
            pathname === '/library' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>📚</span>
          <span>技能库</span>
        </Link>

        <Link
          href="/editor"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-2 ${
            pathname.startsWith('/editor')
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>✏️</span>
          <span>编辑器</span>
        </Link>

        {/* 分隔线 */}
        <div className="border-t border-gray-200 my-2" />

        {/* 按框架分组的 Skills */}
        {Object.entries(groupedSkills).map(([framework, skills]) => (
          <div key={framework} className="mb-3">
            <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
              {FRAMEWORK_LABELS[framework]}
            </div>
            {skills.map((skill) => (
              <Link
                key={skill.filename}
                href={`/editor?skill=${skill.filename}`}
                onClick={onClose}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                  currentSkill === skill.filename
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{skill.meta.title}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400">
        <div>共 {skills.length} 个 Skill</div>
        <a
          href="https://github.com/snorlaxGoodWin022/Lin-skill-engineering-library"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600"
        >
          GitHub →
        </a>
      </div>
    </div>
  )
}
