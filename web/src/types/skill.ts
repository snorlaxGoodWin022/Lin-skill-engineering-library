// types/skill.ts

export interface SkillMeta {
  title: string
  description: string
  framework: 'react' | 'vue3' | 'common'
  category: string
}

export interface Skill {
  filename: string
  meta: SkillMeta
  content: string
  path: string
}

export const FRAMEWORK_LABELS: Record<string, string> = {
  react: 'React',
  vue3: 'Vue3',
  common: '通用',
}

export const FRAMEWORK_COLORS: Record<string, string> = {
  react: 'bg-blue-100 text-blue-800',
  vue3: 'bg-green-100 text-green-800',
  common: 'bg-gray-100 text-gray-800',
}

export const CATEGORY_LABELS: Record<string, string> = {
  form: '表单',
  crud: 'CRUD',
  code: '代码规范',
  component: '组件封装',
  api: 'API层',
  test: '测试',
  state: '状态管理',
  hooks: 'Hooks',
  router: '路由',
  utils: '工具',
  types: '类型',
  other: '其他',
}
