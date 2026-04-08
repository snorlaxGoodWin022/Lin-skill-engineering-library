// lib/template-generator.ts
import type { SkillConfig, FieldDefinition } from '@/types/configurator'

export function generateMarkdown(config: SkillConfig): string {
  if (!config.templateType || !config.framework) return ''

  const generators: Record<string, (config: SkillConfig) => string> = {
    form: generateForm,
    crud: generateCrud,
    api: generateApi,
    'unit-test': generateUnitTest,
    hooks: generateHooks,
    state: generateState,
    utils: generateUtils,
  }

  const generator = generators[config.templateType]
  return generator ? generator(config) : ''
}

// ===== Helper functions =====

function getFrameworkLabel(fw: string): string {
  return fw === 'react' ? 'React' : 'Vue3'
}

function getFormLib(config: SkillConfig): string {
  return config.values.formLibrary || 'react-hook-form'
}

function getUILib(config: SkillConfig): string {
  return config.values.uiLibrary || 'ant-design'
}

function fieldToZod(field: FieldDefinition, fw: string): string {
  const types: Record<string, string> = {
    text: 'z.string()',
    email: 'z.string().email()',
    number: 'z.number()',
    select: 'z.string()',
    date: 'z.string()',
    boolean: 'z.boolean()',
    textarea: 'z.string()',
  }
  let base = types[field.type] || 'z.string()'
  if (field.required) {
    base += '.min(1, "请输入${field.label}")'
  } else {
    base += '.optional()'
  }
  return `  ${field.name}: ${base}`
}

function fieldToComponent(field: FieldDefinition, fw: string): string {
  const uiLib = fw === 'react' ? 'AntD' : 'El'
  const components: Record<string, string> = {
    text: `${uiLib}Input`,
    email: `${uiLib}Input`,
    number: `${uiLib}InputNumber`,
    select: `${uiLib}Select`,
    date: `${uiLib}DatePicker`,
    boolean: `${uiLib}Checkbox`,
    textarea: `${uiLib}Input.TextArea`,
  }
  return components[field.type] || `${uiLib}Input`
}

// ===== Form Generator =====

function generateForm(config: SkillConfig): string {
  const fw = config.framework!
  const name = config.values.componentName || 'MyForm'
  const desc = config.values.description || '表单组件'
  const fields = config.fields
  const fwLabel = getFrameworkLabel(fw)

  const sections: string[] = []

  // Header
  sections.push(`# Skill: ${name} 表单生成器 (${fwLabel})`)
  sections.push('')

  // 使用场景
  sections.push('## 使用场景')
  sections.push('')
  sections.push(`用于快速生成${desc}的表单组件，适用于：`)
  sections.push(`- ${name} 表单创建`)
  sections.push(`- ${name} 表单编辑（预填充数据）`)
  sections.push('- 表单校验和提交')
  sections.push('')

  // 技术栈
  sections.push('## 技术栈')
  sections.push('')
  if (fw === 'react') {
    sections.push('```')
    sections.push('react-hook-form + Zod + Ant Design')
    sections.push('- react-hook-form: 表单状态管理')
    sections.push('- @hookform/resolvers/zod: Zod 校验集成')
    sections.push('- zod: Schema 校验')
    sections.push('- antd: UI 组件库')
    sections.push('```')
  } else {
    sections.push('```')
    sections.push('VeeValidate + Zod + Element Plus')
    sections.push('- vee-validate: 表单状态管理')
    sections.push('- @vee-validate/zod: Zod 校验集成')
    sections.push('- zod: Schema 校验')
    sections.push('- element-plus: UI 组件库')
    sections.push('```')
  }
  sections.push('')

  // 文件结构
  sections.push('## 文件结构规范')
  sections.push('')
  sections.push('```')
  sections.push(`src/components/${name}/`)
  sections.push(`├── index.tsx`)
  sections.push(`├── ${name}.tsx              # 表单组件`)
  sections.push(`├── schema.ts               # Zod Schema 定义`)
  sections.push(`├── types.ts                # 类型定义`)
  sections.push(`└── __tests__/`)
  sections.push(`    └── ${name}.test.tsx`)
  sections.push('```')
  sections.push('')

  // 类型定义
  sections.push('## 类型定义')
  sections.push('')
  sections.push('```typescript')
  sections.push(`// types.ts`)
  const typeFields = fields.map(f => {
    const tsTypes: Record<string, string> = { text: 'string', email: 'string', number: 'number', select: 'string', date: 'string', boolean: 'boolean', textarea: 'string' }
    const tsType = tsTypes[f.type] || 'string'
    return `  ${f.name}${f.required ? '' : '?'}: ${tsType}`
  })
  sections.push(`export interface ${name}FormData {`)
  sections.push(typeFields.join('\n'))
  sections.push('}')
  sections.push('')
  if (fields.some(f => f.type === 'select' && f.options?.length)) {
    const selectFields = fields.filter(f => f.type === 'select' && f.options?.length)
    selectFields.forEach(f => {
      const opts = f.options!.map(o => `'${o}'`).join(' | ')
      sections.push(`export type ${f.name}Option = ${opts}`)
    })
    sections.push('')
  }
  sections.push('```')
  sections.push('')

  // Schema
  sections.push('## Schema 定义')
  sections.push('')
  sections.push('```typescript')
  sections.push(`// schema.ts`)
  sections.push(`import { z } from 'zod'`)
  sections.push('')
  sections.push(`export const ${name}Schema = z.object({`)
  sections.push(fields.map(f => fieldToZod(f, fw)).join(',\n'))
  sections.push('})')
  sections.push('')
  sections.push(`export type ${name}SchemaType = z.infer<typeof ${name}Schema>`)
  sections.push('```')
  sections.push('')

  // 组件模板
  sections.push('## 组件模板')
  sections.push('')
  if (fw === 'react') {
    sections.push('```typescript')
    sections.push(`// ${name}.tsx`)
    sections.push(`import { useForm } from 'react-hook-form'`)
    sections.push(`import { zodResolver } from '@hookform/resolvers/zod'`)
    sections.push(`import { Form, Input, InputNumber, Select, DatePicker, Checkbox, Button } from 'antd'`)
    sections.push(`import { ${name}Schema, type ${name}SchemaType } from './schema'`)
    sections.push('')
    sections.push(`interface ${name}Props {`)
    sections.push(`  initialValues?: Partial<${name}SchemaType>`)
    sections.push(`  onSubmit: (values: ${name}SchemaType) => Promise<void>`)
    sections.push(`  onCancel?: () => void`)
    sections.push(`  loading?: boolean`)
    sections.push(`}`)
    sections.push('')
    sections.push(`export default function ${name}({ initialValues, onSubmit, onCancel, loading }: ${name}Props) {`)
    sections.push(`  const { handleSubmit, control, formState: { errors } } = useForm<${name}SchemaType>({`)
    sections.push(`    resolver: zodResolver(${name}Schema),`)
    sections.push(`    defaultValues: initialValues,`)
    sections.push(`  })`)
    sections.push('')
    sections.push(`  return (`)
    sections.push(`    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>`)
    fields.forEach(f => {
      const comp = fieldToComponent(f, fw)
      sections.push(`      <Form.Item label="${f.label}" name="${f.name}" validateStatus={errors.${f.name} ? 'error' : ''} help={errors.${f.name}?.message}>`)
      sections.push(`        <${comp} control={control} name="${f.name}" ${f.type === 'select' && f.options ? `options={[${f.options.map(o => `{label:'${o}',value:'${o}'}`).join(',')}]}` : ''} />`)
      sections.push(`      </Form.Item>`)
    })
    sections.push(`      <Form.Item>`)
    sections.push(`        <Button type="primary" htmlType="submit" loading={loading}>提交</Button>`)
    sections.push(`        {onCancel && <Button onClick={onCancel} style={{ marginLeft: 8 }}>取消</Button>}`)
    sections.push(`      </Form.Item>`)
    sections.push(`    </Form>`)
    sections.push(`  )`)
    sections.push(`}`)
    sections.push('```')
  } else {
    sections.push('```typescript')
    sections.push(`// ${name}.vue`)
    sections.push(`// 使用 VeeValidate + Zod + Element Plus`)
    sections.push(`// 详细模板参考 form-generator-vue3.skill.md`)
    sections.push('```')
  }
  sections.push('')

  // 输出要求
  sections.push('## 输出要求')
  sections.push('')
  sections.push('生成表单组件时必须：')
  sections.push('1. 包含完整的 TypeScript 类型定义')
  sections.push('2. 使用 Zod Schema 进行表单校验')
  sections.push('3. 支持创建和编辑两种模式')
  sections.push('4. 处理加载和错误状态')
  sections.push('5. 表单项包含正确的 label 和校验提示')
  sections.push('6. 使用 controlled 组件模式')
  sections.push('')

  // 使用示例
  sections.push('## 使用示例')
  sections.push('')
  sections.push('### 用户输入')
  sections.push('```')
  sections.push(`生成 ${name} 表单组件`)
  sections.push('')
  sections.push('表单字段：')
  fields.forEach(f => {
    sections.push(`- ${f.label} (${f.type}${f.required ? ', 必填' : ', 选填'}${f.options ? `, 选项: ${f.options.join('/')}` : ''})`)
  })
  sections.push('```')
  sections.push('')
  sections.push('### AI 输出')
  sections.push('```')
  sections.push(`生成完整的 ${name} 表单组件，包含：`)
  sections.push('- types.ts - 类型定义')
  sections.push('- schema.ts - Zod 校验 Schema')
  sections.push(`- ${fw === 'react' ? `${name}.tsx` : `${name}.vue`} - 表单组件`)
  sections.push('```')

  return sections.join('\n')
}

// ===== CRUD Generator =====

function generateCrud(config: SkillConfig): string {
  const fw = config.framework!
  const name = config.values.moduleName || 'Item'
  const desc = config.values.description || '数据模块'
  const apiBase = config.values.apiBaseUrl || '/api/items'
  const fields = config.fields
  const fwLabel = getFrameworkLabel(fw)

  const sections: string[] = []
  sections.push(`# Skill: ${name} CRUD 模板 (${fwLabel})`)
  sections.push('')
  sections.push('## 使用场景')
  sections.push('')
  sections.push(`用于快速生成${desc}的增删改查模块，适用于：`)
  sections.push(`- ${name} 列表展示（分页、搜索、筛选）`)
  sections.push(`- ${name} 详情查看`)
  sections.push(`- ${name} 新建和编辑`)
  sections.push(`- ${name} 删除和批量操作`)
  sections.push('')
  sections.push('## 技术栈')
  sections.push('')
  if (fw === 'react') {
    sections.push('React 18 + TypeScript 5 + Ant Design 5 + React Query + Zustand')
  } else {
    sections.push('Vue 3.4+ + TypeScript 5 + Element Plus 2.4+ + Vue Query + Pinia')
  }
  sections.push('')
  sections.push('## 文件结构规范')
  sections.push('')
  sections.push('```')
  sections.push(`src/pages/${name}/`)
  sections.push(`├── list/`)
  sections.push(`│   └── index.tsx              # 列表页`)
  sections.push(`├── detail/`)
  sections.push(`│   └── index.tsx              # 详情页`)
  sections.push(`├── edit/`)
  sections.push(`│   └── index.tsx              # 编辑/新建页`)
  sections.push(`├── components/`)
  sections.push(`│   └── ${name}Form.tsx         # 表单组件`)
  sections.push(`├── hooks/`)
  sections.push(`│   └── use${name}.ts           # 数据请求 Hooks`)
  sections.push(`└── types.ts`)
  sections.push('```')
  sections.push('')
  sections.push('## 类型定义')
  sections.push('')
  sections.push('```typescript')
  const typeFields = fields.map(f => {
    const tsTypes: Record<string, string> = { text: 'string', email: 'string', number: 'number', select: 'string', date: 'string', boolean: 'boolean', textarea: 'string' }
    return `  ${f.name}: ${tsTypes[f.type] || 'string'}`
  })
  sections.push(`export interface ${name} {`)
  sections.push(typeFields.join('\n'))
  sections.push(`  id: string`)
  sections.push(`  createTime: string`)
  sections.push(`}`)
  sections.push('```')
  sections.push('')
  sections.push('## API 路径')
  sections.push('')
  sections.push(`- GET    ${apiBase}          # 列表`)
  sections.push(`- GET    ${apiBase}/:id       # 详情`)
  sections.push(`- POST   ${apiBase}           # 创建`)
  sections.push(`- PUT    ${apiBase}/:id       # 更新`)
  sections.push(`- DELETE ${apiBase}/:id       # 删除`)
  sections.push('')
  sections.push('## 输出要求')
  sections.push('')
  sections.push(`生成完整的 ${name} CRUD 模块，包含列表页、详情页、编辑页和数据请求 Hooks。`)
  sections.push('')

  return sections.join('\n')
}

// ===== API Generator =====

function generateApi(config: SkillConfig): string {
  const fw = config.framework!
  const name = config.values.moduleName || 'Item'
  const desc = config.values.description || 'API 模块'
  const apiBase = config.values.apiBaseUrl || '/api/items'
  const hasPagination = config.values.hasPagination !== false
  const fields = config.fields
  const fwLabel = getFrameworkLabel(fw)

  const sections: string[] = []
  sections.push(`# Skill: ${name} API 层封装 (${fwLabel})`)
  sections.push('')
  sections.push('## 使用场景')
  sections.push('')
  sections.push(`用于快速生成${desc}的 API 请求层代码。`)
  sections.push('')
  sections.push('## API 路径')
  sections.push('')
  sections.push(`- GET    ${apiBase}          # 列表${hasPagination ? '（分页）' : ''}`)
  sections.push(`- GET    ${apiBase}/:id       # 详情`)
  sections.push(`- POST   ${apiBase}           # 创建`)
  sections.push(`- PUT    ${apiBase}/:id       # 更新`)
  sections.push(`- DELETE ${apiBase}/:id       # 删除`)
  sections.push('')
  sections.push('## 实体字段')
  sections.push('')
  sections.push('```typescript')
  const typeFields = fields.map(f => {
    const tsTypes: Record<string, string> = { text: 'string', email: 'string', number: 'number', select: 'string', date: 'string', boolean: 'boolean', textarea: 'string' }
    return `  ${f.name}: ${tsTypes[f.type] || 'string'}`
  })
  sections.push(`export interface ${name} {`)
  sections.push(typeFields.join('\n'))
  sections.push(`  id: string`)
  sections.push('}')
  sections.push('```')
  sections.push('')
  sections.push('## 输出要求')
  sections.push('')
  sections.push(`生成完整的 API 请求层，包含类型定义、请求函数、${fwLabel === 'React' ? 'React Query' : 'Vue Query'} Hooks。`)
  sections.push('')

  return sections.join('\n')
}

// ===== Unit Test Generator =====

function generateUnitTest(config: SkillConfig): string {
  const fw = config.framework!
  const name = config.values.targetName || 'Component'
  const desc = config.values.description || '测试目标'
  const testType = config.values.componentType || 'component'
  const cases = (config.values.testCases || '').split('\n').filter((s: string) => s.trim())
  const fwLabel = getFrameworkLabel(fw)

  const sections: string[] = []
  sections.push(`# Skill: ${name} 单元测试 (${fwLabel})`)
  sections.push('')
  sections.push('## 使用场景')
  sections.push('')
  sections.push(`为 ${name}（${desc}）生成单元测试。`)
  sections.push('')
  sections.push('## 测试类型')
  sections.push('')
  const typeLabels: Record<string, string> = { component: '组件测试', hook: 'Hook 测试', util: '工具函数测试' }
  sections.push(`${typeLabels[testType] || '组件测试'}`)
  sections.push('')
  sections.push('## 测试场景')
  sections.push('')
  if (cases.length > 0) {
    cases.forEach((c: string) => sections.push(`- ${c.trim()}`))
  } else {
    sections.push('- 正常渲染')
    sections.push('- 用户交互')
    sections.push('- 错误处理')
  }
  sections.push('')
  sections.push('## 技术栈')
  sections.push('')
  if (fw === 'react') {
    sections.push('Jest + @testing-library/react + @testing-library/user-event')
  } else {
    sections.push('Vitest + @vue/test-utils')
  }
  sections.push('')
  sections.push('## 输出要求')
  sections.push('')
  sections.push(`生成 ${name} 的完整单元测试文件，覆盖上述测试场景。`)
  sections.push('')

  return sections.join('\n')
}

// ===== Hooks Generator =====

function generateHooks(config: SkillConfig): string {
  const fw = config.framework!
  const name = config.values.hookName || 'useMyHook'
  const desc = config.values.description || '自定义 Hook'
  const params = config.fields
  const fwLabel = getFrameworkLabel(fw)

  const sections: string[] = []
  sections.push(`# Skill: ${name} ${fwLabel === 'React' ? 'Hook' : 'Composable'} 模板`)
  sections.push('')
  sections.push('## 使用场景')
  sections.push('')
  sections.push(`${desc}`)
  sections.push('')
  sections.push('## Hook 名称')
  sections.push('')
  sections.push(`\`${name}\``)
  sections.push('')
  if (params.length > 0) {
    sections.push('## 参数定义')
    sections.push('')
    sections.push('```typescript')
    params.forEach(p => {
      sections.push(`// ${p.label}: ${p.type}${p.required ? ' (必填)' : ' (选填)'}`)
    })
    sections.push('```')
    sections.push('')
  }
  sections.push('## 输出要求')
  sections.push('')
  sections.push(`生成 ${name} 的完整实现，包含类型定义、实现逻辑、使用示例和测试。`)
  sections.push('')

  return sections.join('\n')
}

// ===== State Generator =====

function generateState(config: SkillConfig): string {
  const fw = config.framework!
  const name = config.values.storeName || 'useMyStore'
  const desc = config.values.description || '状态管理'
  const fields = config.fields
  const persist = config.values.persist
  const fwLabel = getFrameworkLabel(fw)

  const sections: string[] = []
  sections.push(`# Skill: ${name} 状态管理 (${fwLabel})`)
  sections.push('')
  sections.push('## 使用场景')
  sections.push('')
  sections.push(`${desc}`)
  sections.push('')
  sections.push('## 技术栈')
  sections.push('')
  sections.push(fw === 'react' ? 'Zustand 5' : 'Pinia')
  sections.push('')
  sections.push('## 状态字段')
  sections.push('')
  sections.push('```typescript')
  fields.forEach(f => {
    const tsTypes: Record<string, string> = { text: 'string', email: 'string', number: 'number', select: 'string', date: 'string', boolean: 'boolean', textarea: 'string' }
    sections.push(`${f.name}: ${tsTypes[f.type] || 'string'} // ${f.label}`)
  })
  sections.push('```')
  sections.push('')
  if (persist) {
    sections.push('## 持久化')
    sections.push('')
    sections.push('需要持久化到 localStorage')
    sections.push('')
  }
  sections.push('## 输出要求')
  sections.push('')
  sections.push(`生成 ${name} 的完整 Store 实现，包含状态定义、Actions 和使用示例。`)
  sections.push('')

  return sections.join('\n')
}

// ===== Utils Generator =====

function generateUtils(config: SkillConfig): string {
  const fw = config.framework!
  const name = config.values.functionName || 'myUtil'
  const desc = config.values.description || '工具函数'
  const category = config.values.category || 'string'
  const params = config.fields

  const sections: string[] = []
  sections.push(`# Skill: ${name} 工具函数`)
  sections.push('')
  sections.push('## 使用场景')
  sections.push('')
  sections.push(`${desc}`)
  sections.push('')
  sections.push('## 函数分类')
  sections.push('')
  const catLabels: Record<string, string> = { string: '字符串处理', number: '数字处理', date: '日期处理', validate: '数据校验', url: 'URL 处理', storage: '本地存储' }
  sections.push(catLabels[category] || '通用')
  sections.push('')
  if (params.length > 0) {
    sections.push('## 参数定义')
    sections.push('')
    sections.push('```typescript')
    params.forEach(p => {
      sections.push(`// ${p.label}: ${p.type}${p.required ? ' (必填)' : ' (选填)'}`)
    })
    sections.push('```')
    sections.push('')
  }
  sections.push('## 输出要求')
  sections.push('')
  sections.push(`生成 ${name} 的完整实现，包含类型定义、实现逻辑、边界处理和单元测试。`)
  sections.push('')

  return sections.join('\n')
}
