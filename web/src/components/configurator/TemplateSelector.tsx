// components/configurator/TemplateSelector.tsx
'use client'

import type { TemplateType } from '@/types/configurator'
import { TEMPLATE_SCHEMAS } from '@/lib/template-schemas'

interface Props {
  value: TemplateType | null
  onChange: (type: TemplateType) => void
}

export default function TemplateSelector({ value, onChange }: Props) {
  const templates = Object.values(TEMPLATE_SCHEMAS)

  return (
    <div>
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
        选择模板类型
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {templates.map((t) => (
          <button
            key={t.templateType}
            onClick={() => onChange(t.templateType)}
            className={`p-3 rounded-lg border text-left transition ${
              value === t.templateType
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="text-xl mb-1">{t.icon}</div>
            <div className="font-medium text-sm text-gray-900 dark:text-white">
              {t.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {t.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
