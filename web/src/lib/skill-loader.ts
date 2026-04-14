// lib/skill-loader.ts
import fs from 'fs'
import path from 'path'
import type { Skill, SkillMeta } from '@/types/skill'

// 技能文件目录：优先使用构建时复制的本地副本，其次使用项目原始路径
const SKILLS_DIR_BUILD = path.join(process.cwd(), 'skills-data')
const SKILLS_DIR_SRC = path.join(process.cwd(), '..', '.claude', 'skills')

const getSkillsDir = () => {
  if (fs.existsSync(SKILLS_DIR_BUILD)) {
    return SKILLS_DIR_BUILD
  }
  if (fs.existsSync(SKILLS_DIR_SRC)) {
    return SKILLS_DIR_SRC
  }
  return SKILLS_DIR_SRC
}

/**
 * 获取所有 Skill 文件名（递归读取子目录）
 */
export function getSkillFilenames(): string[] {
  try {
    const dir = getSkillsDir()
    const files: string[] = []

    const readDirRecursive = (currentDir: string) => {
      const items = fs.readdirSync(currentDir)
      for (const item of items) {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          readDirRecursive(fullPath)
        } else if (item.endsWith('.md') && item !== 'readme.md') {
          // 存储相对于 skills 目录的路径，统一用正斜杠
          files.push(path.relative(dir, fullPath).replace(/\\/g, '/'))
        }
      }
    }

    readDirRecursive(dir)
    return files
  } catch {
    return []
  }
}

/**
 * 解析框架类型
 */
function parseFramework(filename: string): 'react' | 'vue3' | 'common' {
  // 统一用正斜杠处理，兼容 Windows 反斜杠
  const normalized = filename.replace(/\\/g, '/')
  if (normalized.startsWith('react/')) return 'react'
  if (normalized.startsWith('vue3/')) return 'vue3'
  if (normalized.startsWith('common/')) return 'common'
  // 兜底：从文件名判断
  if (normalized.includes('-react')) return 'react'
  if (normalized.includes('-vue3')) return 'vue3'
  return 'common'
}

/**
 * 解析分类
 */
function parseCategory(filename: string): string {
  // 注意：performance 必须在 form 之前判断，因为 "performance" 包含 "form"
  if (filename.includes('performance')) return 'performance'
  if (filename.includes('form')) return 'form'
  if (filename.includes('crud')) return 'crud'
  if (filename.includes('code-standard') || filename.includes('code-standrad')) return 'code'
  if (filename.includes('component')) return 'component'
  // api-layer 必须在 api-test 之前，避免 "api-layer" 匹配到 "api"
  if (filename.includes('api-layer')) return 'api'
  if (filename.includes('unit-test')) return 'test'
  if (filename.includes('state')) return 'state'
  if (filename.includes('hooks') || filename.includes('composables')) return 'hooks'
  if (filename.includes('router')) return 'router'
  if (filename.includes('utils')) return 'utils'
  if (filename.includes('typescript') || filename.includes('types')) return 'types'
  if (filename.includes('permission')) return 'permission'
  if (filename.includes('error-handler')) return 'error'
  if (filename.includes('i18n')) return 'i18n'
  if (filename.includes('cicd')) return 'cicd'
  if (filename.includes('e2e')) return 'e2e'
  if (filename.includes('api-test')) return 'api-test'
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
