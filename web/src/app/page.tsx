// app/page.tsx
import Link from 'next/link'
import { getAllSkills } from '@/lib/skill-loader'
import { FRAMEWORK_LABELS, CATEGORY_LABELS } from '@/types/skill'
import Layout from '@/components/Layout'

export default function HomePage() {
  const skills = getAllSkills()

  // 统计
  const stats = {
    total: skills.length,
    react: skills.filter((s) => s.meta.framework === 'react').length,
    vue3: skills.filter((s) => s.meta.framework === 'vue3').length,
    common: skills.filter((s) => s.meta.framework === 'common').length,
  }

  // 按分类分组
  const categories = skills.reduce(
    (acc, skill) => {
      const cat = skill.meta.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(skill)
      return acc
    },
    {} as Record<string, typeof skills>
  )

  return (
    <Layout>
      <div className="pb-20 md:pb-0">
        {/* Hero */}
        <section className="py-12 md:py-16 px-4">
          <div className="text-center">
            <div className="text-5xl md:text-6xl mb-4">📘</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              Skills Template Library
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto">
              AI 代码生成模板库，帮助开发者快速生成符合项目规范的代码
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <Link
                href="/library"
                className="px-5 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
              >
                浏览技能库
              </Link>
              <Link
                href="/configurator"
                className="px-5 md:px-6 py-2.5 md:py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium text-center"
              >
                打开配置器
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-6 md:py-8 px-4 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              <div className="text-center p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">全部模板</div>
              </div>
              <div className="text-center p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-blue-500">{stats.react}</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">React</div>
              </div>
              <div className="text-center p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-green-500">{stats.vue3}</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Vue3</div>
              </div>
              <div className="text-center p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-gray-500">{stats.common}</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">通用</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 md:py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
              按分类浏览
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {Object.entries(categories).map(([category, categorySkills]) => (
                <Link
                  key={category}
                  href={`/library?category=${category}`}
                  className="p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition"
                >
                  <div className="text-xl md:text-2xl mb-1 md:mb-2">
                    {CATEGORY_ICONS[category] || '📁'}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                    {CATEGORY_LABELS[category] || category}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {categorySkills.length} 个模板
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Skills */}
        <section className="py-8 md:py-12 px-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                最近更新
              </h2>
              <Link
                href="/library"
                className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium"
              >
                查看全部 →
              </Link>
            </div>
            <div className="space-y-2 md:space-y-3">
              {skills.slice(0, 6).map((skill) => (
                <Link
                  key={skill.filename}
                  href={`/skill/${encodeURIComponent(skill.filename)}`}
                  className="flex items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="text-lg md:text-xl">
                      {CATEGORY_ICONS[skill.meta.category] || '📁'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                        {skill.meta.title}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {skill.meta.description.slice(0, 40)}...
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                      skill.meta.framework === 'react'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : skill.meta.framework === 'vue3'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {FRAMEWORK_LABELS[skill.meta.framework]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              功能特点
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">20+ 模板</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  覆盖表单、CRUD、API、测试、状态管理等常见场景
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-3">⚛️</div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">双栈支持</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  同时支持 React 和 Vue3 技术栈
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-3">✏️</div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">在线编辑</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Monaco Editor 编辑器，实时预览和复制
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

const CATEGORY_ICONS: Record<string, string> = {
  form: '📝',
  crud: '🗃️',
  code: '📏',
  component: '🧩',
  api: '🔌',
  test: '🧪',
  state: '📦',
  hooks: '🪝',
  router: '🛤️',
  utils: '🔧',
  types: '🔷',
  other: '📁',
}
