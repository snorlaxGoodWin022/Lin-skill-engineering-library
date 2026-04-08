// app/editor/EditorContent.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSkillStore } from '@/store/skillStore'
import Layout from '@/components/Layout'
import MonacoEditor from '@/components/MonacoEditor'
import type { Skill } from '@/types/skill'
import { FRAMEWORK_LABELS } from '@/types/skill'

export default function EditorContent() {
  const searchParams = useSearchParams()
  const filename = searchParams.get('skill')
  const { editorContent, setEditorContent, isEditing, setIsEditing } = useSkillStore()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [copied, setCopied] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

  // 加载 Skill
  useEffect(() => {
    if (filename) {
      fetch(`/api/skills/${filename}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.skill) {
            setSkill(data.skill)
            setEditorContent(data.skill.content)
          }
        })
        .catch(console.error)
    }
  }, [filename, setEditorContent])

  // 复制
  const handleCopy = async () => {
    await navigator.clipboard.writeText(editorContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 下载
  const handleDownload = () => {
    const blob = new Blob([editorContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'skill.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Skill 信息面板
  const SkillInfo = () => (
    <div className="p-4">
      <h2 className="font-medium mb-2 text-gray-900 dark:text-white">
        {skill?.meta.title || '选择一个 Skill'}
      </h2>
      {skill && (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{skill.meta.description}</p>
          <div className="flex gap-2 text-xs mb-4">
            <span className={`px-2 py-0.5 rounded ${
              skill.meta.framework === 'react'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                : skill.meta.framework === 'vue3'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {FRAMEWORK_LABELS[skill.meta.framework]}
            </span>
          </div>
          {/* 移动端快速操作 */}
          <div className="md:hidden flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              {copied ? '已复制' : '复制'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg"
            >
              下载
            </button>
          </div>
        </>
      )}
      {!skill && (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          从技能库选择一个模板开始编辑
        </p>
      )}
    </div>
  )

  return (
    <Layout>
      <div className="h-[calc(100vh-56px)] md:h-[calc(100vh-56px)] flex relative">
        {/* 移动端遮罩 */}
        {showDrawer && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDrawer(false)}
          />
        )}

        {/* Sidebar - 桌面端固定，移动端抽屉 */}
        <div className={`
          fixed md:relative inset-y-0 left-0 z-50 md:z-auto
          w-72 md:w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
          transform transition-transform duration-300 ease-in-out
          ${showDrawer ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-auto
        `}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
            <span className="font-medium text-gray-900 dark:text-white">Skill 信息</span>
            <button
              onClick={() => setShowDrawer(false)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              ✕
            </button>
          </div>
          <SkillInfo />
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-2 md:px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 gap-2">
            <div className="flex items-center gap-1 md:gap-2">
              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setShowDrawer(true)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-2 md:px-3 py-1.5 text-sm rounded-lg transition ${
                  isEditing
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {isEditing ? '编辑' : '只读'}
              </button>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={handleCopy}
                className="hidden md:flex px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {copied ? '已复制 ✓' : '复制'}
              </button>
              <button
                onClick={handleDownload}
                className="hidden md:flex px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                下载
              </button>
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              value={editorContent}
              onChange={setEditorContent}
              readOnly={!isEditing}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}
