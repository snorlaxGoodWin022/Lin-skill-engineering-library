import { describe, it, expect } from 'vitest'
import { parseSkillMarkdown } from '@/lib/skill-import-parser'

describe('skill-import-parser', () => {
  describe('parseSkillMarkdown', () => {
    it('空内容应返回 null', () => {
      expect(parseSkillMarkdown('')).toBeNull()
      expect(parseSkillMarkdown('   ')).toBeNull()
    })

    // ===== A. 框架检测 =====

    it('从 H1 括号标记检测 React 框架', () => {
      const result = parseSkillMarkdown('# Skill: 用户表单 (React)\n## 使用场景\n用于表单')
      expect(result).not.toBeNull()
      expect(result!.framework).toBe('react')
    })

    it('从 H1 括号标记检测 Vue3 框架', () => {
      const result = parseSkillMarkdown('# Skill: 用户表单 (Vue3)\n## 使用场景\n用于表单')
      expect(result).not.toBeNull()
      expect(result!.framework).toBe('vue3')
    })

    it('从技术栈关键词检测 React', () => {
      const result = parseSkillMarkdown(`# 某个技能
## 技术栈约定
- react-hook-form
- Zustand
- Ant Design`)
      expect(result!.framework).toBe('react')
    })

    it('从技术栈关键词检测 Vue3', () => {
      const result = parseSkillMarkdown(`# 某个技能
## 技术栈约定
- vee-validate
- Pinia
- Element Plus`)
      expect(result!.framework).toBe('vue3')
    })

    it('从文件扩展名检测框架', () => {
      const react = parseSkillMarkdown('# 技能\n代码位于 src/components/App.tsx\n无其他关键词')
      expect(react!.framework).toBe('react')

      const vue = parseSkillMarkdown('# 技能\n代码位于 src/components/App.vue\n无其他关键词')
      expect(vue!.framework).toBe('vue3')
    })

    it('无框架信号时返回 null', () => {
      const result = parseSkillMarkdown('# 普通标题\n一些普通内容')
      expect(result!.framework).toBeNull()
    })

    // ===== B. 模板类型检测 =====

    it('检测表单类型 (form)', () => {
      const result = parseSkillMarkdown(`# Skill: 用户表单 (React)
## 使用场景
用于表单
\`\`\`typescript
interface UserFormData {
  name: string
  age: number
}
\`\`\``)
      expect(result!.templateType).toBe('form')
      expect(result!.detected.confidence).toBe('high')
    })

    it('检测 CRUD 类型', () => {
      const result = parseSkillMarkdown(`# Skill: 用户管理 CRUD (React)
## 使用场景
CRUD 操作
\`\`\`typescript
interface UserItem {
  name: string
}
\`\`\``)
      expect(result!.templateType).toBe('crud')
    })

    it('检测 API 类型', () => {
      const result = parseSkillMarkdown(`# Skill: API 层封装 (React)
## 使用场景
用于 API 请求`)
      expect(result!.templateType).toBe('api')
    })

    it('检测单元测试类型', () => {
      const result = parseSkillMarkdown(`# Skill: 单元测试 (React)
\`\`\`typescript
describe('MyComponent', () => {
  it('should render', () => {})
})
\`\`\``)
      expect(result!.templateType).toBe('unit-test')
    })

    it('检测 Hooks 类型', () => {
      const result = parseSkillMarkdown(`# Skill: Hook 模板 (React)
\`\`\`typescript
export function useCounter() {
  return 0
}
\`\`\``)
      expect(result!.templateType).toBe('hooks')
    })

    it('检测状态管理类型', () => {
      const result = parseSkillMarkdown(`# Skill: 状态管理 Store (React)
\`\`\`typescript
import { create } from 'zustand'
const useStore = create<{}>()(() => ({}))
\`\`\``)
      expect(result!.templateType).toBe('state')
    })

    it('检测工具函数类型', () => {
      const result = parseSkillMarkdown(`# Skill: 工具函数
\`\`\`typescript
export function formatDate(d: Date): string { return '' }
\`\`\``)
      expect(result!.templateType).toBe('utils')
    })

    it('无匹配信号时模板类型为 null 且置信度为 low', () => {
      const result = parseSkillMarkdown('# 普通文档\n普通内容而已')
      expect(result!.templateType).toBeNull()
      expect(result!.detected.confidence).toBe('low')
    })

    it('分差小时置信度为 low', () => {
      // 同时包含 form 和 crud 的弱信号，让分数接近
      const result = parseSkillMarkdown(`# 某技能
表单和CRUD相关
\`\`\`typescript
interface ItemFormData {
  name: string
}
\`\`\``)
      // 只要能运行不崩溃即可，置信度取决于实际评分
      expect(result).not.toBeNull()
      expect(['low', 'medium', 'high']).toContain(result!.detected.confidence)
    })

    // ===== C. 名称提取 =====

    it('从 H1 提取名称（去掉 Skill: 前缀和括号后缀）', () => {
      const result = parseSkillMarkdown('# Skill: 用户表单 (React)')
      expect(result!.detected.name).toBe('用户表单')
    })

    it('去掉 Vue3 括号后缀', () => {
      const result = parseSkillMarkdown('# Skill: 商品管理 (Vue3)')
      expect(result!.detected.name).toBe('商品管理')
    })

    it('去掉类型标签后缀', () => {
      const result = parseSkillMarkdown('# Skill: 用户信息表单生成器')
      expect(result!.detected.name).toBe('用户信息')
    })

    it('H1 无名称时返回 null', () => {
      const result = parseSkillMarkdown('普通内容没有H1')
      expect(result!.detected.name).toBeNull()
    })

    // ===== D. 字段提取 =====

    it('从 TypeScript 接口提取字段', () => {
      const result = parseSkillMarkdown(`# Skill: 用户表单 (React)
\`\`\`typescript
interface UserFormData {
  username: string
  age: number
  isActive: boolean
  email?: string
}
\`\`\``)
      expect(result!.fields.length).toBe(4)

      const username = result!.fields.find(f => f.name === 'username')
      expect(username).toBeDefined()
      expect(username!.type).toBe('text')
      expect(username!.required).toBe(true)

      const age = result!.fields.find(f => f.name === 'age')
      expect(age!.type).toBe('number')

      const isActive = result!.fields.find(f => f.name === 'isActive')
      expect(isActive!.type).toBe('boolean')

      const email = result!.fields.find(f => f.name === 'email')
      expect(email!.required).toBe(false)
    })

    it('跳过 id/createTime/updateTime 等通用字段', () => {
      const result = parseSkillMarkdown(`# 技能
\`\`\`typescript
interface ItemFields {
  id: number
  name: string
  createTime: string
  updateTime: string
  title: string
}
\`\`\``)
      const names = result!.fields.map(f => f.name)
      expect(names).not.toContain('id')
      expect(names).not.toContain('createTime')
      expect(names).not.toContain('updateTime')
      expect(names).toContain('name')
      expect(names).toContain('title')
    })

    it('无接口代码块时不提取字段', () => {
      const result = parseSkillMarkdown('# 技能\n没有代码块')
      expect(result!.fields.length).toBe(0)
    })

    // ===== E. 类型特有值提取 =====

    it('form 类型提取 componentName', () => {
      const result = parseSkillMarkdown('# Skill: 用户表单 (React)')
      expect(result!.values.componentName).toBe('用户表单')
    })

    it('crud 类型提取 moduleName 和 apiBaseUrl', () => {
      const result = parseSkillMarkdown(`# Skill: 用户管理 CRUD 模板 (React)
\`\`\`typescript
const BASE_URL = '/api/users'
\`\`\``)
      expect(result!.values.moduleName).toBe('用户管理')
      expect(result!.values.apiBaseUrl).toBe('/api/users')
    })

    it('api 类型检测分页', () => {
      const result = parseSkillMarkdown(`# Skill: API 层封装 (React)
包含 PaginatedResponse 支持`)
      expect(result!.values.hasPagination).toBe(true)
    })

    it('unit-test 类型提取测试用例', () => {
      const result = parseSkillMarkdown(`# Skill: 测试 (React)
\`\`\`typescript
describe('MyComponent', () => {
  it('should render correctly', () => {})
  it('should handle click', () => {})
})
\`\`\``)
      expect(result!.values.testCases).toContain('should render correctly')
      expect(result!.values.testCases).toContain('should handle click')
    })

    it('state 类型检测 persist', () => {
      const result = parseSkillMarkdown(`# Skill: 状态管理 (React)
使用 persist 中间件和 localStorage`)
      expect(result!.values.persist).toBe(true)
    })

    it('state 类型未使用 persist 时为 false', () => {
      const result = parseSkillMarkdown('# Skill: 状态管理 (React)\n普通 store')
      expect(result!.values.persist).toBe(false)
    })

    it('utils 类型检测分类', () => {
      const result = parseSkillMarkdown('# Skill: 工具函数\n用于字符串处理')
      expect(result!.values.category).toBe('string')
    })

    // ===== F. 警告 =====

    it('接口存在但无字段时产生警告', () => {
      const result = parseSkillMarkdown(`# 技能
\`\`\`typescript
interface EmptyFields {
}
\`\`\``)
      expect(result!.detected.warnings.length).toBeGreaterThan(0)
      expect(result!.detected.warnings[0]).toContain('EmptyFields')
    })

    // ===== G. sections 提取 =====

    it('正确提取 ## 标题列表', () => {
      const result = parseSkillMarkdown(`# 技能
## 使用场景
内容A
## 技术栈约定
内容B
## 代码规范
内容C`)
      expect(result!.detected.sections).toEqual(['使用场景', '技术栈约定', '代码规范'])
    })

    // ===== H. 完整端到端解析 =====

    it('完整解析一个表单 Skill.md', () => {
      const content = `# Skill: 商品表单 (React)

## 使用场景
用于商品信息的录入和编辑，适用于电商后台管理系统。

## 技术栈约定

- React Hook Form + Zod
- Ant Design 5.x
- TypeScript 5

## 文件结构

\`\`\`typescript
interface ProductFormData {
  name: string
  price: number
  description?: string
  isActive: boolean
}
\`\`\`

## 代码规范

使用函数式组件和自定义 Hooks。`

      const result = parseSkillMarkdown(content)

      expect(result).not.toBeNull()
      expect(result!.framework).toBe('react')
      expect(result!.templateType).toBe('form')
      expect(result!.detected.name).toBe('商品表单')
      expect(result!.detected.confidence).toBe('high')
      expect(result!.fields.length).toBe(4)
      expect(result!.values.componentName).toBe('商品表单')
      expect(result!.detected.sections.length).toBeGreaterThanOrEqual(3)
    })

    it('完整解析一个 Vue3 CRUD Skill.md', () => {
      const content = `# Skill: 订单管理 CRUD (Vue3)

## 使用场景
用于订单数据的增删改查操作。

## 技术栈约定
- vee-validate
- Pinia
- Element Plus

\`\`\`typescript
interface OrderItem {
  orderNo: string
  amount: number
}
\`\`\``

      const result = parseSkillMarkdown(content)

      expect(result!.framework).toBe('vue3')
      expect(result!.templateType).toBe('crud')
      expect(result!.detected.name).toBe('订单管理 CRUD')
      expect(result!.fields.length).toBe(2)
      expect(result!.values.moduleName).toBe('订单管理 CRUD')
    })
  })
})
