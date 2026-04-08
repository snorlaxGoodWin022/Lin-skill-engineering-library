// app/page.tsx
import Link from 'next/link'
import { getAllSkills } from '@/lib/skill-loader'
import { FRAMEWORK_LABELS } from '@/types/skill'

export default function HomePage() {
  const skills = getAllSkills()

  // 统计
  const stats = {
    total: skills.length,
    react: skills.filter((s) => s.meta.framework === 'react').length,
    vue3: skills.filter((s) => s.meta.framework === 'vue3').length,
    common: skills.filter((s) => s.meta.framework === 'common').length,
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Skills Template Library
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI 代码生成模板库，帮助开发者快速生成符合项目规范的代码
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/library"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              浏览技能库
            </Link>
            <Link
              href="/editor"
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              打开编辑器
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-gray-500">全部模板</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-blue-500">{stats.react}</div>
              <div className="text-gray-500">React</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-500">{stats.vue3}</div>
              <div className="text-gray-500">Vue3</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-gray-500">{stats.common}</div>
              <div className="text-gray-500">通用</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Skills */}
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">最近更新</h2>
          <div className="space-y-3">
            {skills.slice(0, 5).map((skill) => (
              <Link
                key={skill.filename}
                href={`/editor?skill=${skill.filename}`}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition"
              >
                <div>
                  <div className="font-medium">{skill.meta.title}</div>
                  <div className="text-sm text-gray-500">
                    {skill.meta.description.slice(0, 60)}...
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {FRAMEWORK_LABELS[skill.meta.framework]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
