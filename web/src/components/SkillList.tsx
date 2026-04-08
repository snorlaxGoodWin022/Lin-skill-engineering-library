// components/SkillList.tsx
'use client'

import { useMemo } from 'react'
import SkillCard from './SkillCard'
import { useSkillStore } from '@/store/skillStore'
import type { Skill } from '@/types/skill'

interface Props {
  skills: Skill[]
}

export default function SkillList({ skills }: Props) {
  const { framework, category, searchQuery } = useSkillStore()

  const filteredSkills = useMemo(() => {
    let result = skills

    // 框架筛选
    if (framework && framework !== 'all') {
      result = result.filter((s) => s.meta.framework === framework)
    }

    // 分类筛选
    if (category && category !== 'all') {
      result = result.filter((s) => s.meta.category === category)
    }

    // 搜索
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.meta.title.toLowerCase().includes(q) ||
          s.meta.description.toLowerCase().includes(q)
      )
    }

    return result
  }, [skills, framework, category, searchQuery])

  if (filteredSkills.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        没有找到匹配的 Skill
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredSkills.map((skill) => (
        <SkillCard key={skill.filename} skill={skill} />
      ))}
    </div>
  )
}
