// components/SearchBar.tsx
'use client'

import { useSkillStore } from '@/store/skillStore'
import { FRAMEWORK_LABELS, CATEGORY_LABELS } from '@/types/skill'

export default function SearchBar() {
  const { framework, category, searchQuery, setFramework, setCategory, setSearchQuery } =
    useSkillStore()

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* 搜索框 */}
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="搜索 Skill..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 框架筛选 */}
      <select
        value={framework}
        onChange={(e) => setFramework(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">全部框架</option>
        {Object.entries(FRAMEWORK_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      {/* 分类筛选 */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">全部分类</option>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
