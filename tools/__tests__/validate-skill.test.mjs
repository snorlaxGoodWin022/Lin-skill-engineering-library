import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  validateSkillFile,
  validateSkillDirectory,
  collectSkillFiles,
  REQUIRED_SECTIONS,
  RECOMMENDED_SECTIONS,
} from '../validate-skill.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const FIXTURES_DIR = path.join(__dirname, 'fixtures')

// 辅助：mock console 方法避免测试输出噪音
function mockConsole() {
  return {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  }
}

function restoreConsole(mocks) {
  Object.values(mocks).forEach((m) => m.mockRestore())
}

describe('validate-skill', () => {
  describe('exports', () => {
    it('导出 REQUIRED_SECTIONS 数组', () => {
      expect(Array.isArray(REQUIRED_SECTIONS)).toBe(true)
      expect(REQUIRED_SECTIONS).toContain('# Skill:')
      expect(REQUIRED_SECTIONS).toContain('## 输出要求')
    })

    it('导出 RECOMMENDED_SECTIONS 数组', () => {
      expect(Array.isArray(RECOMMENDED_SECTIONS)).toBe(true)
      expect(RECOMMENDED_SECTIONS.length).toBe(7)
    })
  })

  describe('validateSkillFile', () => {
    let mocks

    beforeEach(() => {
      mocks = mockConsole()
    })

    afterEach(() => {
      restoreConsole(mocks)
    })

    it('有效文件返回 true', () => {
      const filePath = path.join(FIXTURES_DIR, 'valid-complete.skill.md')
      const result = validateSkillFile(filePath)
      expect(result).toBe(true)
    })

    it('不存在的文件返回 false', () => {
      const result = validateSkillFile('/nonexistent/file.skill.md')
      expect(result).toBe(false)
      expect(mocks.error).toHaveBeenCalled()
    })

    it('缺少 # Skill: 和 ## 输出要求 返回 false', () => {
      const filePath = path.join(FIXTURES_DIR, 'missing-required.skill.md')
      const result = validateSkillFile(filePath)
      expect(result).toBe(false)
    })

    it('缺少使用场景变体返回 false', () => {
      const filePath = path.join(FIXTURES_DIR, 'missing-scenario.skill.md')
      const result = validateSkillFile(filePath)
      expect(result).toBe(false)
    })

    it('变体标题（适用范围/核心依赖）正确识别', () => {
      const filePath = path.join(FIXTURES_DIR, 'variant-headings.skill.md')
      const result = validateSkillFile(filePath)
      expect(result).toBe(true)
    })

    it('占位符名称触发 warn 但通过验证', () => {
      const filePath = path.join(FIXTURES_DIR, 'placeholder-name.skill.md')
      const result = validateSkillFile(filePath)
      expect(result).toBe(true)
      expect(mocks.warn).toHaveBeenCalledWith(
        expect.stringContaining('占位符')
      )
    })
  })

  describe('collectSkillFiles', () => {
    it('递归查找 .skill.md 文件', () => {
      const files = collectSkillFiles(FIXTURES_DIR)
      expect(files.length).toBeGreaterThanOrEqual(4)
      files.forEach((f) => {
        expect(f).toMatch(/\.skill\.md$/)
      })
    })

    it('空目录返回空数组', () => {
      const emptyDir = path.join(FIXTURES_DIR, '__empty__')
      fs.mkdirSync(emptyDir, { recursive: true })
      const files = collectSkillFiles(emptyDir)
      expect(files).toEqual([])
      fs.rmdirSync(emptyDir)
    })

    it('不包含非 .skill.md 文件', () => {
      const files = collectSkillFiles(FIXTURES_DIR)
      const basenames = files.map((f) => path.basename(f))
      basenames.forEach((name) => {
        expect(name).toMatch(/\.skill\.md$/)
      })
    })
  })

  describe('validateSkillDirectory', () => {
    let mocks

    beforeEach(() => {
      mocks = mockConsole()
    })

    afterEach(() => {
      restoreConsole(mocks)
    })

    it('不存在的目录返回 undefined', () => {
      const result = validateSkillDirectory('/nonexistent/dir')
      expect(result).toBeUndefined()
    })

    it('无 .skill.md 文件的目录返回 undefined', () => {
      const emptyDir = path.join(FIXTURES_DIR, '__empty2__')
      fs.mkdirSync(emptyDir, { recursive: true })
      const result = validateSkillDirectory(emptyDir)
      expect(result).toBeUndefined()
      fs.rmdirSync(emptyDir)
    })

    it('包含有效文件的目录返回 true', () => {
      const tmpDir = path.join(FIXTURES_DIR, '__tmp_valid__')
      fs.mkdirSync(tmpDir, { recursive: true })
      const srcFile = path.join(FIXTURES_DIR, 'valid-complete.skill.md')
      const dstFile = path.join(tmpDir, 'test.skill.md')
      fs.copyFileSync(srcFile, dstFile)

      const result = validateSkillDirectory(tmpDir)
      expect(result).toBe(true)

      fs.unlinkSync(dstFile)
      fs.rmdirSync(tmpDir)
    })

    it('批量验证输出统计信息', () => {
      validateSkillDirectory(FIXTURES_DIR)
      expect(mocks.log).toHaveBeenCalledWith(
        expect.stringContaining('批量验证结果')
      )
    })
  })
})
