// app/configurator/ConfiguratorContent.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useConfigStore } from '@/store/configStore'
import { getAllSkills } from '@/lib/skill-loader'
import { FRAMEWORK_LABELS, FRAMEWORK_COLORS, CATEGORY_LABELS } from '@/types/skill'
import type { Skill } from '@/types/skill'
import Layout from '@/components/Layout'
import MonacoEditor from '@/components/MonacoEditor'

export default function ConfiguratorContent() {
  const searchParams = useSearchParams()
  const {
    selectedSkillFilename,
    markdownContent,
    searchQuery,
    frameworkFilter,
    setSelectedSkillFilename,
    setMarkdownContent,
    setSearchQuery,
    setFrameworkFilter,
  } = useConfigStore()

  const [copied, setCopied] = useState(false)
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)

  // 加载技能列表
  useEffect(() => {
    fetch('/api/skills')
      .then((res) => res.json())
      .then((data) => {
        if (data.skills) setSkills(data.skills)
      })
      .catch(console.error)
  }, [])

  // URL 参数预选
  useEffect(() => {
    const skillParam = searchParams.get('skill')
    if (skillParam) {
      loadSkillContent(skillParam)
    }
  }, [searchParams])

  const loadSkillContent = async (filename: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/skills/${filename}`)
      const data = await res.json()
      if (data.skill) {
        setSelectedSkillFilename(filename)
        setMarkdownContent(data.skill.content)
      }
    } catch (err) {
      console.error('加载技能失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 筛选技能
  const filteredSkills = useMemo(() => {
    let result = skills
    if (frameworkFilter !== 'all') {
      result = result.filter((s) => s.meta.framework === frameworkFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.meta.title.toLowerCase().includes(q) || s.meta.description.toLowerCase().includes(q)
      )
    }
    return result
  }, [skills, frameworkFilter, searchQuery])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdownContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = selectedSkillFilename || 'skill.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const frameworkTabs = [
    { value: 'all', label: '全部' },
    { value: 'react', label: 'React' },
    { value: 'vue3', label: 'Vue3' },
    { value: 'common', label: '通用' },
  ]

  return (
    <Layout>
      <div className="h-[calc(100vh-56px)] flex flex-col md:flex-row">
        {/* 左侧：技能选择列表 */}
        <div className="w-full md:w-[320px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          {/* 搜索框 */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="搜索技能..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* 框架筛选 */}
          <div className="flex px-3 pt-2 pb-1 gap-1">
            {frameworkTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFrameworkFilter(tab.value)}
                className={`px-2 py-1 text-xs rounded-md transition ${
                  frameworkFilter === tab.value
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 技能列表 */}
          <div className="flex-1 overflow-y-auto">
            {filteredSkills.map((skill) => (
              <button
                key={skill.filename}
                onClick={() => loadSkillContent(skill.filename)}
                className={`w-full text-left px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 transition ${
                  selectedSkillFilename === skill.filename
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {skill.meta.title}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                      FRAMEWORK_COLORS[skill.meta.framework]
                    }`}
                  >
                    {FRAMEWORK_LABELS[skill.meta.framework]}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {CATEGORY_LABELS[skill.meta.category] || skill.meta.category}
                </div>
              </button>
            ))}
            {filteredSkills.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-400">未找到匹配的技能</div>
            )}
          </div>
        </div>

        {/* 右侧：编辑器 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 工具栏 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedSkillFilename
                ? `${selectedSkillFilename.split(/[/\\]/).pop()}`
                : '选择一个技能开始编辑'}
            </span>
            {markdownContent && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  {copied ? '已复制 ✓' : '复制'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  下载 .skill.md
                </button>
              </div>
            )}
          </div>

          {/* Monaco 编辑器 */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">加载中...</div>
            ) : markdownContent ? (
              <MonacoEditor
                value={markdownContent}
                onChange={setMarkdownContent}
                readOnly={false}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                <div className="text-center">
                  <div className="text-4xl mb-3">🔧</div>
                  <p>从左侧选择一个技能</p>
                  <p>在此处编辑和导出</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
