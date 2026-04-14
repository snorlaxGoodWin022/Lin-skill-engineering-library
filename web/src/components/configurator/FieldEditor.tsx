// components/configurator/FieldEditor.tsx
'use client'

import type { FieldDefinition } from '@/types/configurator'

interface Props {
  fields: FieldDefinition[]
  onChange: (fields: FieldDefinition[]) => void
}

const FIELD_TYPES = [
  { value: 'text', label: '文本' },
  { value: 'email', label: '邮箱' },
  { value: 'number', label: '数字' },
  { value: 'select', label: '下拉选择' },
  { value: 'date', label: '日期' },
  { value: 'boolean', label: '布尔' },
  { value: 'textarea', label: '文本域' },
]

export default function FieldEditor({ fields, onChange }: Props) {
  const addField = () => {
    onChange([...fields, { name: '', label: '', type: 'text', required: true }])
  }

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, key: keyof FieldDefinition, value: any) => {
    const updated = [...fields]
    updated[index] = { ...updated[index], [key]: value }
    onChange(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">字段列表</span>
        <button
          onClick={addField}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700"
        >
          + 添加字段
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          暂无字段，点击上方按钮添加
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={index}
            className="flex gap-2 items-start p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            {/* 字段名 */}
            <input
              type="text"
              placeholder="字段名 (name)"
              value={field.name}
              onChange={(e) => updateField(index, 'name', e.target.value)}
              className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {/* 标签 */}
            <input
              type="text"
              placeholder="标签 (label)"
              value={field.label}
              onChange={(e) => updateField(index, 'label', e.target.value)}
              className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {/* 类型 */}
            <select
              value={field.type}
              onChange={(e) => updateField(index, 'type', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {/* 必填 */}
            <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(index, 'required', e.target.checked)}
                className="rounded"
              />
              必填
            </label>
            {/* 删除 */}
            <button
              onClick={() => removeField(index)}
              className="text-gray-400 hover:text-red-500 p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
