// lib/skill-loader.ts
import fs from 'fs'
import path from 'path'
import type { Skill, SkillMeta } from '@/types/skill'

const SKILLS_DIR = path.join(process.cwd(), '..', '.claude', 'skills')

// 如果不存在，尝试另一个路径
const getSkillsDir = () => {
  if (fs.existsSync(SKILLS_DIR)) {
    return SKILLS_DIR
  }
  // 尝试相对于 web 目录的路径
  const altPath = path.join(__dirname, '..', '..', '..', '..', '.claude', 'skills')
  if (fs.existsSync(altPath)) {
    return altPath
  }
  return SKILLS_DIR
}

/**
 * 获取所有 Skill 文件名
 */
export function getSkillFilenames(): string[] {
  try {
    const dir = getSkillsDir()
    return fs.readdirSync(dir).filter((file) => file.endsWith('.md') && file !== 'readme.md')
  } catch {
    return []
  }
}

/**
 * 解析框架类型
 */
function parseFramework(filename: string): 'react' | 'vue3' | 'common' {
  if (filename.includes('-react')) return 'react'
  if (filename.includes('-vue3')) return 'vue3'
  return 'common'
}

/**
 * 解析分类
 */
function parseCategory(filename: string): string {
  if (filename.includes('form')) return 'form'
  if (filename.includes('crud')) return 'crud'
  if (filename.includes('code-standard') || filename.includes('code-standrad')) return 'code'
  if (filename.includes('component')) return 'component'
  if (filename.includes('api-layer')) return 'api'
  if (filename.includes('unit-test')) return 'test'
  if (filename.includes('state')) return 'state'
  if (filename.includes('hooks') || filename.includes('composables')) return 'hooks'
  if (filename.includes('router')) return 'router'
  if (filename.includes('utils')) return 'utils'
  if (filename.includes('typescript') || filename.includes('types')) return 'types'
  return 'other'
}

/**
 * 从内容中提取标题
 */
function extractTitle(content: string, filename: string): string {
  // 尝试从第一个 # 标题提取
  const match = content.match(/^#\s+(.+)$/m)
  if (match) {
    return match[1].replace(/^Skill:\s*/i, '')
  }
  // 从文件名提取
  return filename
    .replace('.skill.md', '')
    .replace('.md', '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * 从内容中提取描述
 */
function extractDescription(content: string): string {
  // 尝试从第一个段落提取
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line && !line.startsWith('#') && !line.startsWith('```')) {
      return line.slice(0, 150) + (line.length > 150 ? '...' : '')
    }
  }
  return ''
}

/**
 * 获取单个 Skill
 */
export function getSkill(filename: string): Skill | null {
  try {
    const dir = getSkillsDir()
    const filePath = path.join(dir, filename)
    const content = fs.readFileSync(filePath, 'utf-8')

    const framework = parseFramework(filename)
    const category = parseCategory(filename)
    const title = extractTitle(content, filename)
    const description = extractDescription(content)

    return {
      filename,
      meta: {
        title,
        description,
        framework,
        category,
      },
      content,
      path: filePath,
    }
  } catch {
    return null
  }
}

/**
 * 获取所有 Skills
 */
export function getAllSkills(): Skill[] {
  const filenames = getSkillFilenames()
  return filenames
    .map((filename) => getSkill(filename))
    .filter((skill): skill is Skill => skill !== null)
    .sort((a, b) => {
      // 按框架分组，然后按名称排序
      const frameworkOrder = { react: 0, vue3: 1, common: 2 }
      const fa = frameworkOrder[a.meta.framework] ?? 3
      const fb = frameworkOrder[b.meta.framework] ?? 3
      if (fa !== fb) return fa - fb
      return a.meta.title.localeCompare(b.meta.title)
    })
}

/**
 * 按框架筛选
 */
export function filterByFramework(skills: Skill[], framework: string): Skill[] {
  if (!framework || framework === 'all') return skills
  return skills.filter((skill) => skill.meta.framework === framework)
}

/**
 * 按分类筛选
 */
export function filterByCategory(skills: Skill[], category: string): Skill[] {
  if (!category || category === 'all') return skills
  return skills.filter((skill) => skill.meta.category === category)
}

/**
 * 搜索
 */
export function searchSkills(skills: Skill[], query: string): Skill[] {
  if (!query.trim()) return skills
  const q = query.toLowerCase()
  return skills.filter(
    (skill) =>
      skill.meta.title.toLowerCase().includes(q) ||
      skill.meta.description.toLowerCase().includes(q) ||
      skill.content.toLowerCase().includes(q)
  )
}
