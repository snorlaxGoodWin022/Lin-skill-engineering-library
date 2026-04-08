// components/SkillCard.tsx
'use client'

import { FRAMEWORK_COLORS, FRAMEWORK_LABELS, CATEGORY_LABELS } from '@/types/skill'
import type { Skill } from '@/types/skill'
import { useSkillStore } from '@/store/skillStore'
import { useRouter } from 'next/navigation'

interface Props {
  skill: Skill
}

export default function SkillCard({ skill }: Props) {
  const router = useRouter()
  const { setSelectedSkill } = useSkillStore()

  const handleClick = () => {
    setSelectedSkill(skill)
    router.push(`/editor?skill=${skill.filename}`)
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900">{skill.meta.title}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            FRAMEWORK_COLORS[skill.meta.framework]
          }`}
        >
          {FRAMEWORK_LABELS[skill.meta.framework]}
        </span>
      </div>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
        {skill.meta.description}
      </p>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{CATEGORY_LABELS[skill.meta.category] || skill.meta.category}</span>
        <span>•</span>
        <span>{skill.filename}</span>
      </div>
    </div>
  )
}
