// components/Layout.tsx
'use client'

import Link from 'next/link'
import { useSkillStore } from '@/store/skillStore'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, toggleSidebar } = useSkillStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Skills Library
            </Link>
            <span className="text-sm text-gray-500">20+ 模板</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/library"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              技能库
            </Link>
            <Link
              href="/editor"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              编辑器
            </Link>
            <a
              href="https://github.com/snorlaxGoodWin022/Lin-skill-engineering-library"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="pt-14">{children}</main>
    </div>
  )
}
