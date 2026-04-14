// components/SearchBar.tsx
'use client'

import { useState } from 'react'
import { useSkillStore } from '@/store/skillStore'
import { FRAMEWORK_LABELS, CATEGORY_LABELS } from '@/types/skill'

export default function SearchBar() {
  const { framework, category, searchQuery, setFramework, setCategory, setSearchQuery } =
    useSkillStore()
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = framework !== 'all' || category !== 'all'

  return (
    <div className="mb-6">
      {/* 搜索行 */}
      <div className="flex gap-2">
        {/* 搜索框 */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索 Skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 移动端筛选按钮 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`md:hidden px-3 py-2 border rounded-lg flex items-center gap-1 transition ${
            hasActiveFilters
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {hasActiveFilters && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
        </button>

        {/* 桌面端筛选器 */}
        <div className="hidden md:flex gap-2">
          {/* 框架筛选 */}
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部分类</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 移动端展开的筛选器 */}
      {showFilters && (
        <div className="md:hidden flex flex-col gap-2 mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="all">全部框架</option>
            {Object.entries(FRAMEWORK_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="all">全部分类</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setFramework('all')
                setCategory('all')
              }}
              className="text-sm text-blue-600 dark:text-blue-400 py-1"
            >
              清除筛选
            </button>
          )}
        </div>
      )}
    </div>
  )
}
