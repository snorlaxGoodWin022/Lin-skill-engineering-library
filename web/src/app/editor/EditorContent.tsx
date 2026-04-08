// app/editor/EditorContent.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSkillStore } from '@/store/skillStore'
import Layout from '@/components/Layout'
import MonacoEditor from '@/components/MonacoEditor'
import type { Skill } from '@/types/skill'

export default function EditorContent() {
  const searchParams = useSearchParams()
  const filename = searchParams.get('skill')
  const { editorContent, setEditorContent, isEditing, setIsEditing } = useSkillStore()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [copied, setCopied] = useState(false)

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

  return (
    <Layout>
      <div className="h-[calc(100vh-56px)] flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white overflow-auto">
          <div className="p-4">
            <h2 className="font-medium mb-2">
              {skill?.meta.title || '选择一个 Skill'}
            </h2>
            {skill && (
              <>
                <p className="text-sm text-gray-500 mb-2">{skill.meta.description}</p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                    {skill.meta.framework}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1 text-sm rounded ${
                  isEditing
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isEditing ? '编辑中' : '只读'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                {copied ? '已复制 ✓' : '复制'}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                下载
              </button>
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1">
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
