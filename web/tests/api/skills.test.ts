import { describe, it, expect, beforeAll } from 'vitest'
import type { Skill } from '@/types/skill'

const baseUrl = 'http://localhost:3000'

describe('Skills API', () => {
  describe('GET /api/skills', () => {
    it('应该返回技能列表', async () => {
      const response = await fetch(`${baseUrl}/api/skills`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('skills')
      expect(Array.isArray(data.skills)).toBe(true)
      expect(data.skills.length).toBeGreaterThan(0)
    })

    it('每个 skill 应该包含必要字段', async () => {
      const response = await fetch(`${baseUrl}/api/skills`)
      const data = await response.json()

      data.skills.forEach((skill: Skill) => {
        expect(skill).toHaveProperty('filename')
        expect(skill).toHaveProperty('meta')
        expect(skill.meta).toHaveProperty('title')
        expect(skill.meta).toHaveProperty('description')
        expect(skill.meta).toHaveProperty('framework')
        expect(skill.meta).toHaveProperty('category')
      })
    })
  })

  describe('GET /api/skills/:filename', () => {
    it('应该返回指定 skill 详情', async () => {
      // 先获取一个有效的文件名
      const listResponse = await fetch(`${baseUrl}/api/skills`)
      const listData = await listResponse.json()
      const firstSkill = listData.skills[0]

      const response = await fetch(`${baseUrl}/api/skills/${firstSkill.filename}`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('skill')
      expect(data.skill.filename).toBe(firstSkill.filename)
      expect(data.skill).toHaveProperty('content')
    })

    it('不存在的 skill 应该返回 404', async () => {
      const response = await fetch(`${baseUrl}/api/skills/nonexistent.md`)

      expect(response.status).toBe(404)
    })
  })
})
