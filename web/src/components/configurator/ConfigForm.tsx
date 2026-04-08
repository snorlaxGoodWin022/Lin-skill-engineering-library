// components/configurator/ConfigForm.tsx
'use client'

import type { ConfigFieldSchema, FieldDefinition } from '@/types/configurator'
import FieldEditor from './FieldEditor'

interface Props {
  fields: ConfigFieldSchema[]
  values: Record<string, any>
  dynamicFields: FieldDefinition[]
  onValueChange: (key: string, value: any) => void
  onFieldsChange: (fields: FieldDefinition[]) => void
}

export default function ConfigForm({ fields, values, dynamicFields, onValueChange, onFieldsChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium text-gray-900 dark:text-white">
        填写配置
      </h3>

      {fields.map((field) => {
        // 动态字段列表
        if (field.type === 'fields-list') {
          return (
            <div key={field.key}>
              <FieldEditor
                fields={dynamicFields}
                onChange={onFieldsChange}
              />
            </div>
          )
        }

        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* 文本输入 */}
            {field.type === 'text' && (
              <input
                type="text"
                placeholder={field.placeholder}
                value={values[field.key] || ''}
                onChange={(e) => onValueChange(field.key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            )}

            {/* 文本域 */}
            {field.type === 'textarea' && (
              <textarea
                placeholder={field.placeholder}
                value={values[field.key] || ''}
                onChange={(e) => onValueChange(field.key, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
            )}

            {/* 下拉选择 */}
            {field.type === 'select' && field.options && (
              <select
                value={values[field.key] || field.defaultValue || ''}
                onChange={(e) => onValueChange(field.key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}

            {/* 布尔值 */}
            {field.type === 'boolean' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values[field.key] ?? !!field.defaultValue}
                  onChange={(e) => onValueChange(field.key, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {field.description || '启用'}
                </span>
              </label>
            )}

            {field.description && field.type !== 'boolean' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{field.description}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
