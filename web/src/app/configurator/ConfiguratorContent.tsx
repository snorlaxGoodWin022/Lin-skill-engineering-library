// app/configurator/ConfiguratorContent.tsx
'use client'

import { useMemo, useState } from 'react'
import { useConfigStore } from '@/store/configStore'
import { TEMPLATE_SCHEMAS } from '@/lib/template-schemas'
import { generateMarkdown } from '@/lib/template-generator'
import Layout from '@/components/Layout'
import MonacoEditor from '@/components/MonacoEditor'
import TemplateSelector from '@/components/configurator/TemplateSelector'
import FrameworkSelector from '@/components/configurator/FrameworkSelector'
import ConfigForm from '@/components/configurator/ConfigForm'
import ImportDialog from '@/components/configurator/ImportDialog'
import type { ParsedSkill } from '@/types/configurator'

export default function ConfiguratorContent() {
  const {
    step,
    setStep,
    templateType,
    setTemplateType,
    framework,
    setFramework,
    values,
    setFieldValue,
    fields,
    setFields,
    resetConfig,
    importConfig,
  } = useConfigStore()

  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config')
  const [showImport, setShowImport] = useState(false)

  const schema = templateType ? TEMPLATE_SCHEMAS[templateType] : null

  // 实时生成 Markdown
  const markdown = useMemo(() => {
    if (!templateType || !framework) return ''
    return generateMarkdown({ templateType, framework, values, fields })
  }, [templateType, framework, values, fields])

  // 复制
  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 下载
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${values.componentName || values.moduleName || values.hookName || values.functionName || values.targetName || values.storeName || 'skill'}.skill.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const steps = [
    { num: 1, label: '选择模板' },
    { num: 2, label: '选择框架' },
    { num: 3, label: '填写配置' },
  ]

  return (
    <Layout>
      <div className="h-[calc(100vh-56px)] flex flex-col md:flex-row">
        {/* 左侧：配置面板 */}
        <div className="w-full md:w-[420px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          {/* 步骤指示器 */}
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => s.num <= step && setStep(s.num)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm transition ${
                    step === s.num
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : s.num < step
                        ? 'text-blue-500 dark:text-blue-500 cursor-pointer'
                        : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                      step === s.num
                        ? 'bg-blue-600 text-white'
                        : s.num < step
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {s.num < step ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <span className="mx-1 text-gray-300 dark:text-gray-600">›</span>
                )}
              </div>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => setShowImport(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-2"
            >
              📥 导入
            </button>
            {step > 1 && (
              <button
                onClick={resetConfig}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                重置
              </button>
            )}
          </div>

          {/* 移动端 Tab 切换 */}
          <div className="flex md:hidden border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'config'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              配置
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'preview'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              预览
            </button>
          </div>

          {/* 配置内容 */}
          <div
            className={`flex-1 overflow-auto p-4 ${activeTab !== 'config' ? 'hidden md:block' : ''}`}
          >
            {step === 1 && <TemplateSelector value={templateType} onChange={setTemplateType} />}

            {step === 2 && templateType && (
              <FrameworkSelector
                value={framework}
                onChange={setFramework}
                supported={TEMPLATE_SCHEMAS[templateType].supportedFrameworks}
              />
            )}

            {step === 3 && schema && (
              <ConfigForm
                fields={schema.fields}
                values={values}
                dynamicFields={fields}
                onValueChange={setFieldValue}
                onFieldsChange={setFields}
              />
            )}
          </div>

          {/* 底部操作栏 */}
          {step === 3 && markdown && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {copied ? '已复制 ✓' : '复制'}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                下载 .skill.md
              </button>
            </div>
          )}
        </div>

        {/* 右侧：预览 */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${activeTab !== 'preview' ? 'hidden md:flex' : 'flex'}`}
        >
          {/* 预览头 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {markdown ? `预览 (${markdown.length} 字符)` : '预览'}
            </span>
          </div>

          {/* Monaco 编辑器 */}
          <div className="flex-1">
            {markdown ? (
              <MonacoEditor value={markdown} readOnly />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                <div className="text-center">
                  <div className="text-4xl mb-3">🔧</div>
                  <p>选择模板类型和框架后</p>
                  <p>这里将实时显示生成的 Skill</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={(parsed: ParsedSkill) => importConfig(parsed)}
      />
    </Layout>
  )
}
