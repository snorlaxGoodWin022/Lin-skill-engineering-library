// components/configurator/FrameworkSelector.tsx
'use client'

interface Props {
  value: 'react' | 'vue3' | null
  onChange: (fw: 'react' | 'vue3') => void
  supported: ('react' | 'vue3')[]
}

export default function FrameworkSelector({ value, onChange, supported }: Props) {
  const frameworks = [
    { key: 'react' as const, label: 'React', color: 'blue', desc: 'React 18 + TypeScript' },
    { key: 'vue3' as const, label: 'Vue3', color: 'green', desc: 'Vue 3.4+ + TypeScript' },
  ]

  return (
    <div>
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">选择技术栈</h3>
      <div className="flex gap-3">
        {frameworks.map((fw) => {
          const disabled = !supported.includes(fw.key)
          return (
            <button
              key={fw.key}
              onClick={() => !disabled && onChange(fw.key)}
              disabled={disabled}
              className={`flex-1 p-4 rounded-lg border text-center transition ${
                disabled
                  ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  : value === fw.key
                    ? fw.color === 'blue'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200'
                      : 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-200'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="text-2xl mb-1">{fw.key === 'react' ? '⚛️' : '💚'}</div>
              <div className="font-medium text-gray-900 dark:text-white">{fw.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{fw.desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
