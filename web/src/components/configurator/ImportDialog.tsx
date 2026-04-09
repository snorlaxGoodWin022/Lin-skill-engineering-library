// components/configurator/ImportDialog.tsx
'use client'

import { useState, useRef } from 'react'
import { parseSkillMarkdown } from '@/lib/skill-import-parser'
import { TEMPLATE_LABELS } from '@/types/configurator'
import type { ParsedSkill } from '@/types/configurator'

interface Props {
  open: boolean
  onClose: () => void
  onImport: (parsed: ParsedSkill) => void
}

type InputMode = 'file' | 'paste'

export default function ImportDialog({ open, onClose, onImport }: Props) {
  const [mode, setMode] = useState<InputMode>('file')
  const [pasteContent, setPasteContent] = useState('')
  const [parsed, setParsed] = useState<ParsedSkill | null>(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const readFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      doParse(content)
    }
    reader.onerror = () => setError('文件读取失败')
    reader.readAsText(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) readFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.name.endsWith('.md') || file.name.endsWith('.skill.md')) {
        readFile(file)
      } else {
        setError('请上传 .md 文件')
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  const handlePasteParse = () => {
    if (!pasteContent.trim()) {
      setError('请输入 Skill.md 内容')
      return
    }
    doParse(pasteContent)
  }

  const doParse = (content: string) => {
    setError('')
    const result = parseSkillMarkdown(content)
    if (!result) {
      setError('无法解析内容，请确认是否为有效的 Skill.md 文件')
      setParsed(null)
      return
    }
    setParsed(result)
  }

  const handleImport = () => {
    if (parsed) {
      onImport(parsed)
      handleClose()
    }
  }

  const handleClose = () => {
    setParsed(null)
    setPasteContent('')
    setError('')
    if (fileRef.current) fileRef.current.value = ''
    onClose()
  }

  const confidenceLabel = (c: 'high' | 'medium' | 'low') => {
    const map = { high: '高', medium: '中', low: '低' }
    return map[c]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">导入 Skill</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* 模式切换 */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMode('file')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                mode === 'file'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              上传文件
            </button>
            <button
              onClick={() => setMode('paste')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                mode === 'paste'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              粘贴内容
            </button>
          </div>

          {/* 上传文件 */}
          {mode === 'file' && (
            <div>
              <div
                onClick={() => fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition ${
                  dragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <div className="text-3xl mb-2">📄</div>
                <span className="text-sm text-gray-600 dark:text-gray-400">点击选择 .skill.md 文件</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">或拖拽文件到此处</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".md,.skill.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* 粘贴内容 */}
          {mode === 'paste' && (
            <div className="space-y-3">
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="将 Skill.md 内容粘贴到此处..."
                className="w-full h-48 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handlePasteParse}
                className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                解析内容
              </button>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* 解析结果 */}
          {parsed && (
            <div className="space-y-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">解析结果</h3>

              <div className="space-y-2 text-sm">
                {/* 名称 */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-20">名称:</span>
                  <span className="text-gray-900 dark:text-gray-100">{parsed.detected.name || '未检测到'}</span>
                </div>

                {/* 类型 */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-20">类型:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {parsed.templateType ? TEMPLATE_LABELS[parsed.templateType] : '未检测到'}
                  </span>
                  {parsed.templateType && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      parsed.detected.confidence === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      parsed.detected.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {confidenceLabel(parsed.detected.confidence)}置信度
                    </span>
                  )}
                </div>

                {/* 框架 */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-20">框架:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {parsed.framework === 'react' ? 'React' : parsed.framework === 'vue3' ? 'Vue3' : '未检测到'}
                  </span>
                </div>

                {/* 字段 */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-20">提取字段:</span>
                  <span className="text-gray-900 dark:text-gray-100">{parsed.fields.length} 个</span>
                </div>

                {/* 警告 */}
                {parsed.detected.warnings.length > 0 && (
                  <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                    {parsed.detected.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!parsed}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            导入
          </button>
        </div>
      </div>
    </div>
  )
}
