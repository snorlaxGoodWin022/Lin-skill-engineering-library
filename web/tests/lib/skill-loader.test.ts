import { describe, it, expect } from 'vitest'
import {
  getSkillFilenames,
  getSkill,
  getAllSkills,
  filterByFramework,
  filterByCategory,
  searchSkills,
} from '@/lib/skill-loader'

describe('skill-loader', () => {
  describe('getSkillFilenames', () => {
    it('应该返回 skill 文件列表', () => {
      const filenames = getSkillFilenames()
      expect(Array.isArray(filenames)).toBe(true)
      expect(filenames.length).toBeGreaterThan(0)
    })

    it('应该只返回 .md 文件', () => {
      const filenames = getSkillFilenames()
      filenames.forEach((name) => {
        expect(name.endsWith('.md')).toBe(true)
      })
    })

    it('应该排除 readme.md', () => {
      const filenames = getSkillFilenames()
      expect(filenames).not.toContain('readme.md')
    })
  })

  describe('getSkill', () => {
    it('应该返回指定 skill 的详细信息', () => {
      const filenames = getSkillFilenames()
      if (filenames.length > 0) {
        const skill = getSkill(filenames[0])
        expect(skill).not.toBeNull()
        expect(skill?.filename).toBe(filenames[0])
        expect(skill?.meta).toHaveProperty('title')
        expect(skill?.meta).toHaveProperty('description')
        expect(skill?.meta).toHaveProperty('framework')
        expect(skill?.meta).toHaveProperty('category')
        expect(skill?.content).toBeTruthy()
      }
    })

    it('不存在的文件应该返回 null', () => {
      const skill = getSkill('nonexistent.skill.md')
      expect(skill).toBeNull()
    })
  })

  describe('getAllSkills', () => {
    it('应该返回所有 skill', () => {
      const skills = getAllSkills()
      expect(Array.isArray(skills)).toBe(true)
      expect(skills.length).toBeGreaterThan(0)
    })

    it('应该按框架分组排序', () => {
      const skills = getAllSkills()
      const frameworks = skills.map((s) => s.meta.framework)

      // react 应该在最前面
      const reactIndex = frameworks.indexOf('react')
      const vueIndex = frameworks.indexOf('vue3')
      const commonIndex = frameworks.indexOf('common')

      if (reactIndex !== -1 && vueIndex !== -1) {
        expect(reactIndex).toBeLessThan(vueIndex)
      }
      if (vueIndex !== -1 && commonIndex !== -1) {
        expect(vueIndex).toBeLessThan(commonIndex)
      }
    })
  })

  describe('filterByFramework', () => {
    it('应该筛选指定框架的 skill', () => {
      const skills = getAllSkills()
      const reactSkills = filterByFramework(skills, 'react')

      reactSkills.forEach((skill) => {
        expect(skill.meta.framework).toBe('react')
      })
    })

    it('all 应该返回所有 skill', () => {
      const skills = getAllSkills()
      const filtered = filterByFramework(skills, 'all')
      expect(filtered.length).toBe(skills.length)
    })
  })

  describe('filterByCategory', () => {
    it('应该筛选指定分类的 skill', () => {
      const skills = getAllSkills()
      const formSkills = filterByCategory(skills, 'form')

      formSkills.forEach((skill) => {
        expect(skill.meta.category).toBe('form')
      })
    })
  })

  describe('searchSkills', () => {
    it('空搜索应该返回所有 skill', () => {
      const skills = getAllSkills()
      const result = searchSkills(skills, '')
      expect(result.length).toBe(skills.length)
    })

    it('应该搜索标题', () => {
      const skills = getAllSkills()
      const result = searchSkills(skills, 'form')
      expect(result.length).toBeGreaterThan(0)

      result.forEach((skill) => {
        const matches =
          skill.meta.title.toLowerCase().includes('form') ||
          skill.meta.description.toLowerCase().includes('form') ||
          skill.content.toLowerCase().includes('form')
        expect(matches).toBe(true)
      })
    })
  })
})
