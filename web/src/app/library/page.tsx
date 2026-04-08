// app/library/page.tsx
import { getAllSkills } from '@/lib/skill-loader'
import SkillList from '@/components/SkillList'
import SearchBar from '@/components/SearchBar'
import Layout from '@/components/Layout'

export default function LibraryPage() {
  const skills = getAllSkills()

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
            技能库
          </h1>
          <SearchBar />
          <SkillList skills={skills} />
        </div>
      </div>
    </Layout>
  )
}
