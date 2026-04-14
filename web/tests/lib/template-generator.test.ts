import { describe, it, expect } from 'vitest'
import { generateMarkdown } from '@/lib/template-generator'
import type { SkillConfig, FieldDefinition } from '@/types/configurator'

// 辅助工厂函数
function baseConfig(overrides: Partial<SkillConfig> = {}): SkillConfig {
  return {
    templateType: null,
    framework: null,
    values: {},
    fields: [],
    ...overrides,
  }
}

const sampleFields: FieldDefinition[] = [
  { name: 'username', label: '用户名', type: 'text', required: true },
  { name: 'age', label: '年龄', type: 'number', required: false },
  {
    name: 'role',
    label: '角色',
    type: 'select',
    required: true,
    options: ['admin', 'user'],
  },
]

describe('template-generator', () => {
  describe('generateMarkdown', () => {
    it('空 config 返回空字符串', () => {
      expect(generateMarkdown(baseConfig())).toBe('')
    })

    it('缺少 templateType 返回空字符串', () => {
      expect(generateMarkdown(baseConfig({ framework: 'react' }))).toBe('')
    })

    it('缺少 framework 返回空字符串', () => {
      expect(generateMarkdown(baseConfig({ templateType: 'form' }))).toBe('')
    })

    it('未知 templateType 返回空字符串', () => {
      expect(
        generateMarkdown(baseConfig({ templateType: 'unknown' as any, framework: 'react' }))
      ).toBe('')
    })
  })

  describe('Form 生成器', () => {
    it('React 表单包含 react-hook-form + zod + antd', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'form',
          framework: 'react',
          values: { componentName: 'UserForm', description: '用户表单' },
          fields: sampleFields,
        })
      )
      expect(result).toContain('# Skill: UserForm 表单生成器 (React)')
      expect(result).toContain('react-hook-form')
      expect(result).toContain('zod')
      expect(result).toContain('antd')
      expect(result).toContain('interface UserFormFormData')
      expect(result).toContain('z.object')
      expect(result).toContain('## 输出要求')
      expect(result).toContain('@testing-library/react')
    })

    it('Vue3 表单包含 vee-validate + element-plus', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'form',
          framework: 'vue3',
          values: { componentName: 'UserForm', description: '用户表单' },
          fields: sampleFields,
        })
      )
      expect(result).toContain('# Skill: UserForm 表单生成器 (Vue3)')
      expect(result).toContain('vee-validate')
      expect(result).toContain('element-plus')
      expect(result).toContain('el-form')
      expect(result).toContain('v-model')
    })

    it('字段类型映射到正确的 Zod schema', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'form',
          framework: 'react',
          values: { componentName: 'TestForm' },
          fields: [
            { name: 'email', label: '邮箱', type: 'email', required: false },
            { name: 'count', label: '数量', type: 'number', required: false },
          ],
        })
      )
      expect(result).toContain('email()')
      expect(result).toContain('z.number')
    })

    it('必填字段生成 .min(1) 校验', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'form',
          framework: 'react',
          values: { componentName: 'TestForm' },
          fields: [{ name: 'name', label: '姓名', type: 'text', required: true }],
        })
      )
      expect(result).toContain("min(1, { message: '请输入姓名' })")
    })

    it('选填字段生成 .optional()', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'form',
          framework: 'react',
          values: { componentName: 'TestForm' },
          fields: [{ name: 'bio', label: '简介', type: 'text', required: false }],
        })
      )
      expect(result).toContain('.optional()')
    })
  })

  describe('CRUD 生成器', () => {
    it('React CRUD 包含 API 路径和 React Query hooks', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'crud',
          framework: 'react',
          values: {
            moduleName: 'User',
            description: '用户管理',
            apiBaseUrl: '/api/users',
          },
          fields: sampleFields,
        })
      )
      expect(result).toContain('# Skill: User CRUD 模板 (React)')
      expect(result).toContain('@tanstack/react-query')
      expect(result).toContain('GET    /api/users')
      expect(result).toContain('POST   /api/users')
      expect(result).toContain('useUserList')
      expect(result).toContain('useCreateUser')
      expect(result).toContain("message.success('创建成功')")
    })

    it('Vue3 CRUD 包含 Pinia 和 ElMessage', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'crud',
          framework: 'vue3',
          values: {
            moduleName: 'User',
            description: '用户管理',
            apiBaseUrl: '/api/users',
          },
          fields: sampleFields,
        })
      )
      expect(result).toContain('# Skill: User CRUD 模板 (Vue3)')
      expect(result).toContain('@tanstack/vue-query')
      expect(result).toContain("ElMessage.success('创建成功')")
    })

    it('包含 RESTful API 路径', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'crud',
          framework: 'react',
          values: { moduleName: 'Order', apiBaseUrl: '/api/orders' },
          fields: sampleFields,
        })
      )
      expect(result).toContain('GET    /api/orders')
      expect(result).toContain('GET    /api/orders/:id')
      expect(result).toContain('POST   /api/orders')
      expect(result).toContain('PUT    /api/orders/:id')
      expect(result).toContain('DELETE /api/orders/:id')
    })
  })

  describe('API 生成器', () => {
    it('生成完整的 API 函数和 hooks', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'api',
          framework: 'react',
          values: {
            moduleName: 'Order',
            description: '订单 API',
            apiBaseUrl: '/api/orders',
            hasPagination: true,
          },
          fields: sampleFields,
        })
      )
      expect(result).toContain('# Skill: Order API 层封装 (React)')
      expect(result).toContain('fetchOrderList')
      expect(result).toContain('fetchOrderDetail')
      expect(result).toContain('createOrder')
      expect(result).toContain('updateOrder')
      expect(result).toContain('deleteOrder')
      expect(result).toContain('useOrderList')
      expect(result).toContain('useCreateOrder')
    })

    it('hasPagination=false 不包含分页提示', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'api',
          framework: 'react',
          values: {
            moduleName: 'Config',
            apiBaseUrl: '/api/configs',
            hasPagination: false,
          },
          fields: sampleFields,
        })
      )
      expect(result).toContain('无分页')
    })
  })

  describe('Unit Test 生成器', () => {
    it('component 类型包含渲染和交互测试', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'unit-test',
          framework: 'react',
          values: {
            targetName: 'LoginForm',
            description: '登录表单',
            componentType: 'component',
            testCases: '正常提交\n空表单验证',
          },
          fields: [],
        })
      )
      expect(result).toContain('# Skill: LoginForm 单元测试 (React)')
      expect(result).toContain('@testing-library/react')
      expect(result).toContain('正常提交')
      expect(result).toContain('空表单验证')
    })

    it('hook 类型包含 renderHook 测试', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'unit-test',
          framework: 'react',
          values: {
            targetName: 'useCounter',
            description: '计数器 Hook',
            componentType: 'hook',
          },
          fields: [],
        })
      )
      expect(result).toContain('renderHook')
      expect(result).toContain('初始状态')
    })

    it('util 类型包含函数测试模板', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'unit-test',
          framework: 'react',
          values: {
            targetName: 'formatDate',
            description: '日期格式化',
            componentType: 'util',
          },
          fields: [],
        })
      )
      expect(result).toContain('功能测试')
      expect(result).toContain('边界情况')
    })
  })

  describe('Hooks 生成器', () => {
    it('React Hook 包含 useState/useCallback', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'hooks',
          framework: 'react',
          values: { hookName: 'useCounter', description: '计数器' },
          fields: sampleFields,
        })
      )
      expect(result).toContain('# Skill: useCounter Hook 模板 (React)')
      expect(result).toContain('useState')
      expect(result).toContain('useCallback')
    })

    it('Vue3 Composable 包含 ref/computed', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'hooks',
          framework: 'vue3',
          values: { hookName: 'useCounter', description: '计数器' },
          fields: sampleFields,
        })
      )
      expect(result).toContain('# Skill: useCounter Composable 模板 (Vue3)')
      expect(result).toContain('ref(')
      expect(result).toContain('computed(')
    })
  })

  describe('State 生成器', () => {
    it('React Zustand 包含 create() 和字段 setters', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'state',
          framework: 'react',
          values: { storeName: 'useUserStore', description: '用户状态' },
          fields: [
            { name: 'name', label: '名称', type: 'text', required: true },
            { name: 'age', label: '年龄', type: 'number', required: false },
          ],
        })
      )
      expect(result).toContain('# Skill: useUserStore 状态管理 (React)')
      expect(result).toContain("import { create } from 'zustand'")
      expect(result).toContain('setName')
      expect(result).toContain('setAge')
      expect(result).toContain('reset:')
    })

    it('Vue3 Pinia 包含 defineStore()', () => {
      const result = generateMarkdown(
        baseConfig({
          templateType: 'state',
          framework: 'vue3',
          values: { storeName: 'useUserStore', description: '用户状态' },
          fields: [{ name: 'name', label: '名称', type: 'text', required: true }],
        })
      )
      expect(result).toContain('# Skill: useUserStore 状态管理 (Vue3)')
      expect(result).toContain("import { defineStore } from 'pinia'")
      expect(result).toContain('state:')
      expect(result).toContain('getters:')
      expect(result).toContain('actions:')
    })

    it('persist=true 触发持久化配置', () => {
      const reactResult = generateMarkdown(
        baseConfig({
          templateType: 'state',
          framework: 'react',
          values: { storeName: 'useUserStore', persist: true },
          fields: [{ name: 'token', label: '令牌', type: 'string', required: true }],
        })
      )
      expect(reactResult).toContain('persist')
      expect(reactResult).toContain('zustand/middleware')

      const vueResult = generateMarkdown(
        baseConfig({
          templateType: 'state',
          framework: 'vue3',
          values: { storeName: 'useUserStore', persist: true },
          fields: [{ name: 'token', label: '令牌', type: 'string', required: true }],
        })
      )
      expect(vueResult).toContain('persist: true')
    })
  })

  describe('Utils 生成器', () => {
    it('按分类生成工具函数模板', () => {
      const categories = ['string', 'number', 'date', 'validate', 'url', 'storage']
      const catLabels: Record<string, string> = {
        string: '字符串处理',
        number: '数字处理',
        date: '日期处理',
        validate: '数据校验',
        url: 'URL 处理',
        storage: '本地存储',
      }

      for (const cat of categories) {
        const result = generateMarkdown(
          baseConfig({
            templateType: 'utils',
            framework: 'react',
            values: {
              functionName: 'myUtil',
              description: '工具函数',
              category: cat,
            },
            fields: [],
          })
        )
        expect(result).toContain(catLabels[cat])
      }
    })
  })
})
