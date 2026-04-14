// components/SkillCard.tsx
'use client'

import { FRAMEWORK_COLORS, FRAMEWORK_LABELS, CATEGORY_LABELS } from '@/types/skill'
import type { Skill } from '@/types/skill'
import { useRouter } from 'next/navigation'

interface Props {
  skill: Skill
}

export default function SkillCard({ skill }: Props) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/skill/${encodeURIComponent(skill.filename)}`)
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">{skill.meta.title}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            skill.meta.framework === 'react'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : skill.meta.framework === 'vue3'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {FRAMEWORK_LABELS[skill.meta.framework]}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
        {skill.meta.description}
      </p>
      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span>{CATEGORY_LABELS[skill.meta.category] || skill.meta.category}</span>
        <span>•</span>
        <span className="truncate">{skill.filename}</span>
      </div>
    </div>
  )
}
