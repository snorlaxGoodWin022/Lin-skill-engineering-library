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

  return generators[config.templateType]?.(config) || ''
}

// ===== Shared Helpers =====

type TsType = 'string' | 'number' | 'boolean'

const FIELD_TS_MAP: Record<string, TsType> = {
  text: 'string',
  email: 'string',
  number: 'number',
  select: 'string',
  date: 'string',
  boolean: 'boolean',
  textarea: 'string',
}

function fwLabel(fw: string) {
  return fw === 'react' ? 'React' : 'Vue3'
}
function ext(fw: string) {
  return fw === 'react' ? 'tsx' : 'vue'
}
function hookLib(fw: string) {
  return fw === 'react' ? 'React Query' : 'Vue Query'
}
function uiLib(fw: string) {
  return fw === 'react' ? 'Ant Design 5.x' : 'Element Plus 2.4+'
}
function stateLib(fw: string) {
  return fw === 'react' ? 'Zustand' : 'Pinia'
}

function fieldTs(f: FieldDefinition) {
  return FIELD_TS_MAP[f.type] || 'string'
}

function fieldToZod(f: FieldDefinition): string {
  const map: Record<string, string> = {
    text: 'z.string()',
    email: 'z.string().email()',
    number: 'z.number().min(0)',
    select: 'z.string()',
    date: 'z.string()',
    boolean: 'z.boolean()',
    textarea: 'z.string()',
  }
  let base = map[f.type] || 'z.string()'
  if (f.required) base = base.replace(')', `.min(1, { message: '请输入${f.label}' })`)
  else base += '.optional()'
  return `  ${f.name}: ${base}`
}

function renderFieldsTs(fields: FieldDefinition[], indent = '  ') {
  return fields.map((f) => `${indent}${f.name}${f.required ? '' : '?'}: ${fieldTs(f)}`).join('\n')
}

function renderFieldsTsFull(fields: FieldDefinition[]) {
  return fields.map((f) => `  ${f.name}: ${fieldTs(f)}`).join('\n')
}

function renderApiPaths(base: string) {
  return [
    `- GET    ${base}           # 列表（分页）`,
    `- GET    ${base}/:id        # 详情`,
    `- POST   ${base}            # 创建`,
    `- PUT    ${base}/:id        # 更新`,
    `- DELETE ${base}/:id        # 删除`,
  ].join('\n')
}

// ===== Form Generator =====

function generateForm(c: SkillConfig): string {
  const fw = c.framework!,
    name = c.values.componentName || 'MyForm'
  const desc = c.values.description || '表单组件',
    fields = c.fields
  const isReact = fw === 'react'

  return `# Skill: ${name} 表单生成器 (${fwLabel(fw)})

## 使用场景

用于快速生成${desc}的表单组件，适用于：
- ${name} 创建表单
- ${name} 编辑表单（预填充数据）
- 表单校验和错误提示
- 提交/取消操作

## 技术栈

### 核心依赖
${
  isReact
    ? `- react-hook-form（表单状态管理）
- @hookform/resolvers/zod（Zod 校验集成）
- zod（Schema 校验）
- antd 5.x（UI 组件库）
- TypeScript 5`
    : `- vee-validate（表单状态管理）
- @vee-validate/zod（Zod 校验集成）
- zod（Schema 校验）
- element-plus 2.4+（UI 组件库）
- TypeScript 5`
}

### 表单原则
1. **受控组件** - 所有表单项使用受控模式
2. **Schema 校验** - 使用 Zod 定义校验规则
3. **创建/编辑复用** - 同一组件支持创建和编辑模式
4. **加载状态** - 提交时禁用按钮并显示 loading

## 文件结构规范

\`\`\`
src/components/${name}/
├── index.ts                  # 统一导出
├── ${name}.${ext(fw)}               # 表单组件
├── schema.ts                 # Zod Schema 定义
├── types.ts                  # 类型定义
└── __tests__/
    └── ${name}.test.${ext(fw)}
\`\`\`

## 类型定义

\`\`\`typescript
// types.ts

export interface ${name}FormData {
${renderFieldsTs(fields)}
}

export type ${name}Mode = 'create' | 'edit'

export interface ${name}Props {
  mode?: ${name}Mode
  initialValues?: Partial<${name}FormData>
  onSubmit: (values: ${name}FormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}
\`\`\`

## Schema 定义

\`\`\`typescript
// schema.ts
import { z } from 'zod'

export const ${name}Schema = z.object({
${fields.map((f) => fieldToZod(f)).join(',\n')}
})

export type ${name}SchemaType = z.infer<typeof ${name}Schema>
\`\`\`

${isReact ? renderFormReact(name, fields) : renderFormVue(name, fields)}

## 输出要求

生成表单组件时必须：

1. 包含完整的 TypeScript 类型定义
2. 使用 Zod Schema 进行表单校验
3. 支持 \`mode="create"\` 和 \`mode="edit"\` 两种模式
4. 编辑模式预填充 \`initialValues\`
5. 提交时显示 loading 状态
6. 表单项包含正确的 label 和校验错误提示
7. 校验失败时不触发 onSubmit

## 测试用例模板

\`\`\`typescript
// ${name}.test.${ext(fw)}
${
  isReact
    ? `import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ${name} from '../${name}'

describe('${name}', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  describe('渲染', () => {
    it('应该渲染所有表单字段', () => {
      render(<${name} onSubmit={mockOnSubmit} />)

${fields.map((f) => `      expect(screen.getByLabelText('${f.label}')).toBeInTheDocument()`).join('\n')}
    })

    it('编辑模式应该预填充数据', () => {
      render(
        <${name}
          mode="edit"
          initialValues={{ ${fields[0]?.name || 'field'}: 'test' }}
          onSubmit={mockOnSubmit}
        />,
      )

      expect(screen.getByLabelText('${fields[0]?.label || '字段'}')).toHaveValue('test')
    })
  })

  describe('校验', () => {
    it('空表单提交应该显示验证错误', async () => {
      const user = userEvent.setup()
      render(<${name} onSubmit={mockOnSubmit} />)

      await user.click(screen.getByRole('button', { name: /提交/ }))

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })
  })

  describe('提交', () => {
    it('有效数据应该成功提交', async () => {
      const user = userEvent.setup()
      render(<${name} onSubmit={mockOnSubmit} />)

${fields
  .slice(0, 2)
  .map((f) => `      await user.type(screen.getByLabelText('${f.label}'), 'test${f.name}')`)
  .join('\n')}
      await user.click(screen.getByRole('button', { name: /提交/ }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })
    })
  })
})`
    : `// Vue3 测试参考 unit-test-vue3.skill.md`
}
\`\`\`

## 使用示例

### 用户输入

\`\`\`
生成 ${name} 表单组件。

表单字段：
${fields.map((f) => `- ${f.label} (${f.type}${f.required ? ', 必填' : ', 选填'}${f.options ? `, 选项: ${f.options.join('/')}` : ''})`).join('\n')}
\`\`\`

### AI 输出

\`\`\`
生成完整的 ${name} 表单组件，包含：
- types.ts - 类型定义
- schema.ts - Zod 校验 Schema
- ${name}.${ext(fw)} - 表单组件（支持创建/编辑模式）
- ${name}.test.${ext(fw)} - 测试文件
\`\`\``
}

function renderFormReact(name: string, fields: FieldDefinition[]): string {
  return `## 组件模板

\`\`\`typescript
// ${name}.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, Input, InputNumber, Select, DatePicker, Switch, Button } from 'antd'
import type { ${name}Props } from './types'
import { ${name}Schema, type ${name}SchemaType } from './schema'

const FORM_ITEM_LAYOUT = { labelCol: { span: 6 }, wrapperCol: { span: 16 } }

export default function ${name}({
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: ${name}Props) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<${name}SchemaType>({
    resolver: zodResolver(${name}Schema),
    defaultValues: initialValues,
  })

  const isEdit = mode === 'edit'

  return (
    <Form {...FORM_ITEM_LAYOUT} onFinish={handleSubmit(onSubmit)}>
${fields
  .map((f) => {
    const compMap: Record<string, string> = {
      text: 'Input',
      email: 'Input',
      number: 'InputNumber',
      select: 'Select',
      date: 'DatePicker',
      boolean: 'Switch',
      textarea: 'Input.TextArea',
    }
    const comp = compMap[f.type] || 'Input'
    const extra = f.type === 'textarea' ? ' rows={4}' : ''
    return `      <Form.Item
        label="${f.label}"
        name="${f.name}"
        validateStatus={errors.${f.name} ? 'error' : ''}
        help={errors.${f.name}?.message}
      >
        <${comp}${extra} control={control} name="${f.name}" placeholder="请输入${f.label}"${f.type === 'select' && f.options ? ` options={[${f.options.map((o) => `{ label: '${o}', value: '${o}' }`).join(', ')}]}` : ''} />
      </Form.Item>`
  })
  .join('\n')}

      <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {isEdit ? '保存修改' : '创建'}
        </Button>
        {onCancel && (
          <Button onClick={onCancel} style={{ marginLeft: 8 }}>
            取消
          </Button>
        )}
      </Form.Item>
    </Form>
  )
}
\`\`\``
}

function renderFormVue(name: string, fields: FieldDefinition[]): string {
  return `## 组件模板

\`\`\`vue
<!-- ${name}.vue -->
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ${name}Schema } from './schema'
import type { ${name}Props } from './types'

const props = withDefaults(defineProps<${name}Props>(), {
  mode: 'create',
  loading: false,
})

const emit = defineEmits<{
  submit: [values: ${name}SchemaType]
  cancel: []
}>()

const { handleSubmit, errors, setValues } = useForm({
  validationSchema: toTypedSchema(${name}Schema),
})

// 编辑模式预填充
if (props.initialValues) {
  setValues(props.initialValues)
}

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
})
</script>

<template>
  <el-form label-width="100px" @submit.prevent="onSubmit">
${fields
  .map((f) => {
    const compMap: Record<string, string> = {
      text: 'el-input',
      email: 'el-input',
      number: 'el-input-number',
      select: 'el-select',
      date: 'el-date-picker',
      boolean: 'el-switch',
      textarea: 'el-input',
    }
    const comp = compMap[f.type] || 'el-input'
    const extra = f.type === 'textarea' ? ' type="textarea" :rows="4"' : ''
    return `    <el-form-item label="${f.label}" :error="errors['${f.name}']">
      <${comp}${extra} v-model="values.${f.name}" placeholder="请输入${f.label}" />
    </el-form-item>`
  })
  .join('\n')}

    <el-form-item>
      <el-button type="primary" native-type="submit" :loading="loading">
        {{ mode === 'edit' ? '保存修改' : '创建' }}
      </el-button>
      <el-button v-if="onCancel" @click="emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>
\`\`\``
}

// ===== CRUD Generator =====

function generateCrud(c: SkillConfig): string {
  const fw = c.framework!,
    name = c.values.moduleName || 'Item'
  const desc = c.values.description || '数据模块'
  const apiBase = c.values.apiBaseUrl || '/api/items'
  const features = (c.values.features || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean)
  const fields = c.fields
  const isReact = fw === 'react'

  return `# Skill: ${name} CRUD 模板 (${fwLabel(fw)})

## 使用场景

用于快速生成${desc}的增删改查模块，适用于：
- ${name} 列表展示（分页、搜索、筛选）
- ${name} 详情查看
- ${name} 新建和编辑
- ${name} 删除${features.length ? `和${features.join('、')}` : ''}

## 技术栈

### 核心依赖
${
  isReact
    ? `- React 18 + TypeScript 5
- Ant Design 5.x（UI 组件库）
- @tanstack/react-query（数据请求与缓存）
- Zustand（全局状态管理）
- React Router v6（路由）`
    : `- Vue 3.4+ + TypeScript 5
- Element Plus 2.4+（UI 组件库）
- @tanstack/vue-query（数据请求与缓存）
- Pinia（全局状态管理）
- Vue Router 4（路由）`
}

## 文件结构规范

\`\`\`
src/pages/${name}/
├── list/
│   └── index.${ext(fw)}               # 列表页
├── detail/
│   └── index.${ext(fw)}               # 详情页
├── edit/
│   └── index.${ext(fw)}               # 新建/编辑页
├── components/
│   ├── ${name}Form.${ext(fw)}           # 表单组件（新建/编辑复用）
│   └── ${name}Columns.ts              # 表格列定义
├── hooks/
│   └── use${name}.ts                  # 数据请求 Hooks
├── api/
│   └── ${name.toLowerCase()}.ts        # API 函数
├── types.ts                           # 类型定义
└── index.ts                           # 统一导出
\`\`\`

## 类型定义

\`\`\`typescript
// types.ts

// ${name} 实体
export interface ${name}Item {
  id: string
${renderFieldsTsFull(fields)}
  createTime: string
  updateTime: string
}

// ${name} 列表查询参数
export interface ${name}ListParams {
  pageNum: number
  pageSize: number
  keyword?: string
${fields
  .filter((f) => f.type === 'select')
  .map((f) => `  ${f.name}?: string`)
  .join('\n')}
}

// 创建 ${name} 参数
export interface Create${name}Params {
${renderFieldsTsFull(fields)}
}

// 更新 ${name} 参数
export interface Update${name}Params {
${fields.map((f) => `  ${f.name}?: ${fieldTs(f)}`).join('\n')}
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}
\`\`\`

## API 层

\`\`\`typescript
// api/${name.toLowerCase()}.ts
import request from '@/utils/request'
import type {
  ${name}Item,
  ${name}ListParams,
  Create${name}Params,
  Update${name}Params,
  PaginatedResponse,
} from '../types'

const BASE_URL = '${apiBase}'

export const ${name.toLowerCase()}Api = {
  /** 获取列表 */
  fetchList: (params: ${name}ListParams) =>
    request.get<PaginatedResponse<${name}Item>>(BASE_URL, { params }),

  /** 获取详情 */
  fetchDetail: (id: string) =>
    request.get<${name}Item>(\`\${BASE_URL}/\${id}\`),

  /** 创建 */
  create: (data: Create${name}Params) =>
    request.post<${name}Item>(BASE_URL, data),

  /** 更新 */
  update: (id: string, data: Update${name}Params) =>
    request.put<${name}Item>(\`\${BASE_URL}/\${id}\`, data),

  /** 删除 */
  delete: (id: string) =>
    request.delete(\`\${BASE_URL}/\${id}\`),
}
\`\`\`

## 数据请求 Hooks

\`\`\`typescript
// hooks/use${name}.ts
import { useQuery, useMutation, useQueryClient } from '${isReact ? '@tanstack/react-query' : '@tanstack/vue-query'}'
${isReact ? "import { message } from 'antd'" : "import { ElMessage } from 'element-plus'"}
import { ${name.toLowerCase()}Api } from '../api/${name.toLowerCase()}'
import type { ${name}ListParams, Create${name}Params, Update${name}Params } from '../types'

// 列表查询
export function use${name}List(params: ${name}ListParams) {
  return useQuery({
    queryKey: ['${name.toLowerCase()}', 'list', params],
    queryFn: () => ${name.toLowerCase()}Api.fetchList(params),
  })
}

// 详情查询
export function use${name}Detail(id${isReact ? ': string | undefined' : '?: Ref<string>'}) {
  return useQuery({
    queryKey: ['${name.toLowerCase()}', 'detail', ${isReact ? 'id' : 'id.value'}],
    queryFn: () => ${name.toLowerCase()}Api.fetchDetail(${isReact ? 'id!' : 'id!.value'}),
    enabled: ${isReact ? '!!id' : '!!id?.value'},
  })
}

// 创建
export function useCreate${name}() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Create${name}Params) => ${name.toLowerCase()}Api.create(data),
    onSuccess: () => {
      ${isReact ? "message.success('创建成功')" : "ElMessage.success('创建成功')"}
      queryClient.invalidateQueries({ queryKey: ['${name.toLowerCase()}', 'list'] })
    },
  })
}

// 更新
export function useUpdate${name}() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Update${name}Params }) =>
      ${name.toLowerCase()}Api.update(id, data),
    onSuccess: (_, { id }) => {
      ${isReact ? "message.success('更新成功')" : "ElMessage.success('更新成功')"}
      queryClient.invalidateQueries({ queryKey: ['${name.toLowerCase()}', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['${name.toLowerCase()}', 'detail', id] })
    },
  })
}

// 删除
export function useDelete${name}() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ${name.toLowerCase()}Api.delete(id),
    onSuccess: () => {
      ${isReact ? "message.success('删除成功')" : "ElMessage.success('删除成功')"}
      queryClient.invalidateQueries({ queryKey: ['${name.toLowerCase()}', 'list'] })
    },
  })
}
\`\`\`

## API 路径

${renderApiPaths(apiBase)}

${features.length ? `## 附加功能\n\n${features.map((f: string) => `- ${f}`).join('\n')}\n` : ''}
## 输出要求

生成完整的 ${name} CRUD 模块，必须包含：
1. 完整的 TypeScript 类型定义
2. API 请求函数层
3. ${hookLib(fw)} Hooks（列表查询、详情查询、创建、更新、删除）
4. 列表页（含分页、搜索${fields.some((f) => f.type === 'select') ? '、筛选' : ''}）
5. 详情页
6. 新建/编辑页（复用表单组件）
7. 表单组件（含 Zod 校验）

## 使用示例

### 用户输入

\`\`\`
按 CRUD 模板生成 ${name} 模块。

数据字段：
${fields.map((f) => `- ${f.label} (${f.name}): ${f.type}${f.required ? ', 必填' : ''}${f.options ? `, 选项: ${f.options.join('/')}` : ''}`).join('\n')}

API 基础路径: ${apiBase}
\`\`\`

### AI 输出

\`\`\`
生成完整的 ${name} CRUD 模块：
- types.ts - 类型定义
- api/${name.toLowerCase()}.ts - API 函数
- hooks/use${name}.ts - 数据请求 Hooks
- components/${name}Form.${ext(fw)} - 表单组件
- list/index.${ext(fw)} - 列表页
- detail/index.${ext(fw)} - 详情页
- edit/index.${ext(fw)} - 编辑页
\`\`\``
}

// ===== API Generator =====

function generateApi(c: SkillConfig): string {
  const fw = c.framework!,
    name = c.values.moduleName || 'Item'
  const desc = c.values.description || 'API 模块'
  const apiBase = c.values.apiBaseUrl || '/api/items'
  const hasPagination = c.values.hasPagination !== false
  const fields = c.fields
  const isReact = fw === 'react'

  return `# Skill: ${name} API 层封装 (${fwLabel(fw)})

## 使用场景

用于快速生成${desc}的 API 请求层代码，适用于：
- RESTful API 封装
- 与 ${hookLib(fw)} 集成的数据请求
- 统一的错误处理和请求拦截
- TypeScript 类型安全的 API 调用

## 技术栈

### 核心依赖
- Axios（HTTP 客户端）
- @tanstack/${isReact ? 'react-query' : 'vue-query'}（数据请求与缓存）
- TypeScript 5（类型支持）
- Zod（运行时类型校验，可选）

## 文件结构规范

\`\`\`
src/
├── api/
│   ├── ${name.toLowerCase()}.ts        # API 函数
│   └── types/
│       └── ${name.toLowerCase()}.ts    # 类型定义
├── hooks/
│   ├── queries/
│   │   └── use${name}.ts              # 查询 Hooks
│   └── mutations/
│       └── use${name}Mutation.ts      # 变更 Hooks
└── utils/
    └── request.ts                     # Axios 实例
\`\`\`

## 类型定义

\`\`\`typescript
// api/types/${name.toLowerCase()}.ts

export interface ${name}Item {
  id: string
${renderFieldsTsFull(fields)}
  createTime: string
  updateTime: string
}

export interface ${name}ListParams {
  pageNum: number
  pageSize: number${fields.some((f) => f.type === 'text') ? '\n  keyword?: string' : ''}${hasPagination ? '' : '\n  // 无分页'}
}

export interface Create${name}Params {
${renderFieldsTsFull(fields)}
}

export interface Update${name}Params {
${fields.map((f) => `  ${f.name}?: ${fieldTs(f)}`).join('\n')}
}
\`\`\`

## API 函数

\`\`\`typescript
// api/${name.toLowerCase()}.ts
import request from '@/utils/request'
import type { ${name}Item, ${name}ListParams, Create${name}Params, Update${name}Params } from './types/${name.toLowerCase()}'

const BASE_URL = '${apiBase}'

/** 获取${name}列表 */
export async function fetch${name}List(params: ${name}ListParams) {
  return request.get<${hasPagination ? `PaginatedResponse<${name}Item>` : `${name}Item[]`}>(BASE_URL, { params })
}

/** 获取${name}详情 */
export async function fetch${name}Detail(id: string) {
  return request.get<${name}Item>(\`\${BASE_URL}/\${id}\`)
}

/** 创建${name} */
export async function create${name}(data: Create${name}Params) {
  return request.post<${name}Item>(BASE_URL, data)
}

/** 更新${name} */
export async function update${name}(id: string, data: Update${name}Params) {
  return request.put<${name}Item>(\`\${BASE_URL}/\${id}\`, data)
}

/** 删除${name} */
export async function delete${name}(id: string) {
  return request.delete(\`\${BASE_URL}/\${id}\`)
}
\`\`\`

## 查询 Hooks

\`\`\`typescript
// hooks/queries/use${name}.ts
import { useQuery } from '${isReact ? '@tanstack/react-query' : '@tanstack/vue-query'}'
import { fetch${name}List, fetch${name}Detail } from '@/api/${name.toLowerCase()}'
import type { ${name}ListParams } from '@/api/types/${name.toLowerCase()}'

export function use${name}List(params: ${name}ListParams) {
  return useQuery({
    queryKey: ['${name.toLowerCase()}', 'list', params],
    queryFn: () => fetch${name}List(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function use${name}Detail(id${isReact ? ': string | undefined' : '?: Ref<string>'}) {
  return useQuery({
    queryKey: ['${name.toLowerCase()}', 'detail', ${isReact ? 'id' : 'id?.value'}],
    queryFn: () => fetch${name}Detail(${isReact ? 'id!' : 'id!.value'}),
    enabled: ${isReact ? '!!id' : '!!id?.value'},
  })
}
\`\`\`

## 变更 Hooks

\`\`\`typescript
// hooks/mutations/use${name}Mutation.ts
import { useMutation, useQueryClient } from '${isReact ? '@tanstack/react-query' : '@tanstack/vue-query'}'
${isReact ? "import { message } from 'antd'" : "import { ElMessage } from 'element-plus'"}
import { create${name}, update${name}, delete${name} } from '@/api/${name.toLowerCase()}'
import type { Create${name}Params, Update${name}Params } from '@/api/types/${name.toLowerCase()}'

export function useCreate${name}() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: create${name},
    onSuccess: () => {
      ${isReact ? "message.success('创建成功')" : "ElMessage.success('创建成功')"}
      queryClient.invalidateQueries({ queryKey: ['${name.toLowerCase()}', 'list'] })
    },
  })
}

export function useUpdate${name}() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Update${name}Params }) =>
      update${name}(id, data),
    onSuccess: (_, variables) => {
      ${isReact ? "message.success('更新成功')" : "ElMessage.success('更新成功')"}
      queryClient.invalidateQueries({ queryKey: ['${name.toLowerCase()}', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['${name.toLowerCase()}', 'detail', variables.id] })
    },
  })
}

export function useDelete${name}() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: delete${name},
    onSuccess: () => {
      ${isReact ? "message.success('删除成功')" : "ElMessage.success('删除成功')"}
      queryClient.invalidateQueries({ queryKey: ['${name.toLowerCase()}', 'list'] })
    },
  })
}
\`\`\`

## API 路径

${renderApiPaths(apiBase)}

## 输出要求

生成 API 层代码时必须：
1. 包含完整的 TypeScript 类型定义
2. Axios 请求函数命名规范（fetch* 查询，create/update/delete 变更）
3. ${hookLib(fw)} Hooks 封装，包含缓存策略
4. 创建/更新/删除成功后自动刷新列表
5. 错误处理统一通过 ${isReact ? 'message.error' : 'ElMessage.error'} 提示
${hasPagination ? '6. 列表接口支持分页参数' : ''}

## 使用示例

### 用户输入

\`\`\`
按 API 层模板生成 ${name} 模块。

API 接口：${apiBase}
实体字段：
${fields.map((f) => `- ${f.name} (${f.type}): ${f.label}`).join('\n')}
\`\`\`

### AI 输出

\`\`\`
生成完整的 API 层：
- api/types/${name.toLowerCase()}.ts - 类型定义
- api/${name.toLowerCase()}.ts - API 函数
- hooks/queries/use${name}.ts - 查询 Hooks
- hooks/mutations/use${name}Mutation.ts - 变更 Hooks
\`\`\``
}

// ===== Unit Test Generator =====

function generateUnitTest(c: SkillConfig): string {
  const fw = c.framework!,
    name = c.values.targetName || 'Component'
  const desc = c.values.description || '测试目标'
  const testType = c.values.componentType || 'component'
  const cases = (c.values.testCases || '').split('\n').filter((s: string) => s.trim())
  const isReact = fw === 'react'

  return `# Skill: ${name} 单元测试 (${fwLabel(fw)})

## 使用场景

为 ${name}（${desc}）生成规范的单元测试代码，适用于：
${
  testType === 'component'
    ? `- 组件渲染测试
- 用户交互测试
- 表单校验测试
- 加载/错误状态测试`
    : testType === 'hook'
      ? `- Hook 初始状态测试
- Hook 方法调用测试
- Hook 边界情况测试`
      : `- 函数输入输出测试
- 边界值测试
- 错误处理测试`
}

## 技术栈

### 核心依赖
${
  isReact
    ? `- Jest 29+（测试框架）
- @testing-library/react（React 测试工具）
- @testing-library/user-event（用户交互模拟）
- @testing-library/jest-dom（DOM 断言扩展）`
    : `- Vitest（测试框架）
- @vue/test-utils（Vue 测试工具）
- @testing-library/jest-dom（DOM 断言扩展）`
}

### 测试原则
1. **测试行为而非实现** - 关注用户能看到和操作的内容
2. **保持测试独立** - 每个测试独立运行，不依赖顺序
3. **覆盖关键路径** - 优先测试核心业务逻辑

## 文件结构规范

\`\`\`
src/
├── ${testType === 'component' ? `components/${name}/` : testType === 'hook' ? `hooks/${name}/` : `utils/${name}/`}
│   ├── index.${ext(fw)}
│   └── __tests__/
│       └── ${name}.test.${isReact ? 'tsx' : 'ts'}
└── __mocks__/
    └── setup.ts
\`\`\`

## 测试用例

\`\`\`typescript
// ${name}.test.${isReact ? 'tsx' : 'ts'}
${
  isReact
    ? `import { render, screen${testType === 'component' ? ', waitFor' : ''}} from '@testing-library/react'
${testType === 'component' ? "import userEvent from '@testing-library/user-event'" : "import { renderHook, act } from '@testing-library/react'"}
import ${name} from '../index'

describe('${name}', () => {
${
  testType === 'component'
    ? `  describe('渲染', () => {
    it('应该正确渲染组件', () => {
      render(<${name} />)
${cases.length > 0 ? cases.map((c: string) => `      // ${c.trim()}`).join('\n') : '      expect(screen.getByRole(/.*/)).toBeInTheDocument()'}
    })
  })

  describe('交互', () => {
    it('用户操作应该触发预期行为', async () => {
      const user = userEvent.setup()
      render(<${name} />)
      // TODO: 模拟用户操作
    })
  })`
    : testType === 'hook'
      ? `  describe('初始状态', () => {
    it('应该有正确的初始值', () => {
      const { result } = renderHook(() => ${name}())
      // TODO: 断言初始状态
    })
  })

  describe('操作方法', () => {
    it('方法调用应该更新状态', () => {
      const { result } = renderHook(() => ${name}())
      act(() => {
        // TODO: 调用方法
      })
      // TODO: 断言状态变更
    })
  })`
      : `  describe('功能测试', () => {
    it('应该正确处理正常输入', () => {
      // TODO: 测试正常输入
    })

    it('应该正确处理边界情况', () => {
      // TODO: 测试边界值
    })

    it('应该正确处理错误输入', () => {
      // TODO: 测试错误处理
    })
  })`
}
})
`
    : `// Vue3 测试参考 unit-test-vue3.skill.md`
}
\`\`\`

${
  cases.length > 0
    ? `## 需要覆盖的测试场景

${cases.map((c: string, i: number) => `${i + 1}. ${c.trim()}`).join('\n')}

`
    : ''
}## 输出要求

生成单元测试时必须：
1. 使用 ${isReact ? '@testing-library/react' : '@vue/test-utils'} 进行测试
2. 包含渲染测试、交互测试、错误处理测试
3. 使用 \`describe\` 组织测试套件
4. 使用 \`beforeEach\` 清理公共状态
5. 异步操作使用 \`waitFor\` 或 \`findBy*\`
${testType === 'component' ? '6. 测试可访问性（aria 属性）' : ''}

## 使用示例

### 用户输入

\`\`\`
为 ${name}（${desc}）生成单元测试。
测试类型: ${testType}
${cases.length ? `测试场景:\n${cases.map((c: string) => `- ${c.trim()}`).join('\n')}` : ''}
\`\`\`

### AI 输出

\`\`\`
生成 ${name} 的完整测试文件，包含所有测试场景。
\`\`\``
}

// ===== Hooks Generator =====

function generateHooks(c: SkillConfig): string {
  const fw = c.framework!,
    name = c.values.hookName || 'useMyHook'
  const desc = c.values.description || '自定义 Hook'
  const params = c.fields.filter((f) => f.name)
  const isReact = fw === 'react'
  const hookType = isReact ? 'Hook' : 'Composable'

  return `# Skill: ${name} ${hookType} 模板 (${fwLabel(fw)})

## 使用场景

${desc}，适用于：
${params.length > 0 ? params.map((p) => `- ${p.label} 相关逻辑封装`).join('\n') : '- 业务逻辑复用\n- 状态逻辑提取'}

## 技术栈

### 核心依赖
${
  isReact
    ? `- React 18（useState, useEffect, useCallback, useMemo, useRef）
- TypeScript 5`
    : `- Vue 3.4+（ref, computed, watch, onMounted, onUnmounted）
- TypeScript 5`
}

## 文件结构规范

\`\`\`
src/${isReact ? 'hooks' : 'composables'}/
├── ${name}/
│   ├── index.ts              # 统一导出
│   ├── ${name}.ts            # Hook 实现
│   ├── types.ts              # 类型定义
│   └── __tests__/
│       └── ${name}.test.ts
\`\`\`

## 类型定义

\`\`\`typescript
// types.ts
${
  params.length > 0
    ? `export interface ${name}Params {
${params.map((p) => `  ${p.name}${p.required ? '' : '?'}: ${fieldTs(p)}`).join('\n')}
}`
    : '// 无参数'
}

export interface ${name}Return {
  // TODO: 定义返回值类型
}
\`\`\`

## Hook 实现

\`\`\`typescript
// ${name}.ts
${
  isReact
    ? `import { useState, useCallback } from 'react'
${params.length > 0 ? `import type { ${name}Params } from './types'` : ''}

export function ${name}(${params.length > 0 ? `params: ${name}Params` : ''}) {
  const [state, setState] = useState(/* initial state */)

  const action = useCallback(() => {
    // TODO: 实现 Hook 逻辑
  }, [])

  return {
    state,
    action,
  }
}`
    : `import { ref, computed } from 'vue'
${params.length > 0 ? `import type { ${name}Params } from './types'` : ''}

export function ${name}(${params.length > 0 ? `params: ${name}Params` : ''}) {
  const state = ref(/* initial state */)

  const computedValue = computed(() => {
    // TODO: 计算属性
    return state.value
  })

  function action() {
    // TODO: Composable 逻辑
  }

  return {
    state,
    computedValue,
    action,
  }
}`
}
\`\`\`

## 测试用例

\`\`\`typescript
// ${name}.test.ts
${
  isReact
    ? `import { renderHook, act } from '@testing-library/react'
import { ${name} } from '../${name}'

describe('${name}', () => {
  describe('初始状态', () => {
    it('应该有正确的初始值', () => {
      const { result } = renderHook(() => ${name}(${params.length > 0 ? `{ ${params[0].name}: /* value */ }` : ''}))
      // TODO: 断言初始状态
    })
  })

  describe('操作方法', () => {
    it('action 应该更新状态', () => {
      const { result } = renderHook(() => ${name}())
      act(() => result.current.action())
      // TODO: 断言状态变更
    })
  })
})`
    : `// Vue3 测试参考 unit-test-vue3.skill.md`
}
\`\`\`

## 输出要求

生成 ${hookType} 时必须：
1. 包含完整的 TypeScript 类型定义
2. 使用 ${isReact ? 'useState/useCallback/useMemo' : 'ref/computed/watch'} 管理状态
3. 返回值使用对象解构模式
4. 包含使用示例
5. 包含测试用例

## 使用示例

### 用户输入

\`\`\`
生成 ${name} ${hookType}。
${desc}
${params.length > 0 ? `参数:\n${params.map((p) => `- ${p.name}: ${p.label} (${p.type})`).join('\n')}` : ''}
\`\`\`

### AI 输出

\`\`\`
生成 ${name} 的完整实现：
- types.ts - 类型定义
- ${name}.ts - Hook/Composable 实现
- ${name}.test.ts - 测试文件
\`\`\``
}

// ===== State Generator =====

function generateState(c: SkillConfig): string {
  const fw = c.framework!,
    name = c.values.storeName || 'useMyStore'
  const desc = c.values.description || '状态管理'
  const fields = c.fields,
    persist = c.values.persist
  const isReact = fw === 'react'
  const s: string[] = []

  s.push(`# Skill: ${name} 状态管理 (${fwLabel(fw)})`)
  s.push('')
  s.push('## 使用场景')
  s.push('')
  s.push(`${desc}，适用于：`)
  fields.forEach((f) => s.push(`- ${f.label} 状态管理`))
  s.push('')
  s.push('## 技术栈')
  s.push('')
  s.push(`- ${isReact ? 'Zustand 5（轻量状态管理）' : 'Pinia（Vue 官方状态管理）'}`)
  s.push('- TypeScript 5')
  if (persist) s.push('- zustand/middleware（持久化中间件）')
  s.push('')
  s.push('## 文件结构规范')
  s.push('')
  s.push('```')
  s.push('src/store/')
  s.push(`├── ${name}.ts              # Store 定义`)
  s.push('└── __tests__/')
  s.push(`    └── ${name}.test.ts`)
  s.push('```')
  s.push('')
  s.push('## Store 实现')
  s.push('')
  s.push('```typescript')

  if (isReact) {
    s.push(`// ${name}.ts`)
    s.push("import { create } from 'zustand'")
    if (persist) s.push("import { persist } from 'zustand/middleware'")
    s.push('')
    s.push(`interface ${name}State {`)
    s.push('  // 状态')
    fields.forEach((f) => s.push(`  ${f.name}: ${fieldTs(f)}`))
    s.push('')
    s.push('  // Actions')
    fields.forEach((f) => {
      const setter = 'set' + f.name.charAt(0).toUpperCase() + f.name.slice(1)
      s.push(`  ${setter}: (value: ${fieldTs(f)}) => void`)
    })
    s.push('  reset: () => void')
    s.push('}')
    s.push('')
    s.push('const initialState = {')
    s.push(
      fields
        .map((f) => {
          const val = f.type === 'boolean' ? 'false' : f.type === 'number' ? '0' : "''"
          return `  ${f.name}: ${val}`
        })
        .join(',\n')
    )
    s.push('}')
    s.push('')
    s.push(`export const ${name} = create<${name}State>()(`)
    if (persist) {
      s.push('  persist(')
    }
    s.push('    (set) => ({')
    s.push('      ...initialState,')
    s.push('')
    fields.forEach((f) => {
      const setter = 'set' + f.name.charAt(0).toUpperCase() + f.name.slice(1)
      s.push(`      ${setter}: (value) => set({ ${f.name}: value }),`)
    })
    s.push('')
    s.push('      reset: () => set(initialState),')
    s.push('    })')
    if (persist) {
      s.push(`    , { name: '${name}' })`)
    }
    s.push(')')
  } else {
    const storeName = 'use' + name.replace(/^use/, '')
    s.push(`// ${name}.ts`)
    s.push("import { defineStore } from 'pinia'")
    s.push('')
    s.push(`interface ${name}State {`)
    fields.forEach((f) => s.push(`  ${f.name}: ${fieldTs(f)}`))
    s.push('}')
    s.push('')
    s.push(
      `export const ${storeName} = defineStore('${storeName.replace(/^use/, '').toLowerCase()}', {`
    )
    s.push(`  state: (): ${name}State => ({`)
    s.push(
      fields
        .map((f) => {
          const val = f.type === 'boolean' ? 'false' : f.type === 'number' ? '0' : "''"
          return `    ${f.name}: ${val}`
        })
        .join(',\n')
    )
    s.push('  }),')
    s.push('')
    s.push('  getters: {')
    s.push('    // TODO: 添加计算属性')
    s.push('  },')
    s.push('')
    s.push('  actions: {')
    fields.forEach((f) => {
      const setter = 'set' + f.name.charAt(0).toUpperCase() + f.name.slice(1)
      s.push(`    ${setter}(value: ${fieldTs(f)}) {`)
      s.push(`      this.${f.name} = value`)
      s.push('    },')
    })
    s.push('')
    s.push('    reset() {')
    fields.forEach((f) => {
      const val = f.type === 'boolean' ? 'false' : f.type === 'number' ? '0' : "''"
      s.push(`      this.${f.name} = ${val}`)
    })
    s.push('    },')
    s.push('  },')
    if (persist) s.push('  persist: true,')
    s.push('})')
  }

  s.push('```')
  s.push('')

  if (persist) {
    s.push('## 持久化')
    s.push('')
    s.push('状态会自动持久化到 localStorage，页面刷新后自动恢复。')
    s.push('')
  }

  s.push('## 输出要求')
  s.push('')
  s.push('生成 Store 时必须：')
  s.push('1. 包含完整的 TypeScript 类型定义')
  s.push(`2. 每个${isReact ? '状态字段' : 'state 字段'}都有对应的 setter`)
  s.push('3. 提供 reset 方法重置所有状态')
  if (persist) s.push('4. 配置持久化到 localStorage')
  s.push('5. 包含使用示例')
  s.push('')
  s.push('## 使用示例')
  s.push('')
  s.push('### 用户输入')
  s.push('')
  s.push('```')
  s.push(`生成 ${name} Store。`)
  s.push('状态字段：')
  fields.forEach((f) => s.push(`- ${f.name} (${f.label}): ${f.type}`))
  if (persist) s.push('需要持久化到 localStorage')
  s.push('```')
  s.push('')
  s.push('### AI 输出')
  s.push('')
  s.push('```')
  s.push(`生成 ${name} 的完整 Store 实现。`)
  s.push('```')

  return s.join('\n')
}

// ===== Utils Generator =====

function generateUtils(c: SkillConfig): string {
  const fw = c.framework!,
    name = c.values.functionName || 'myUtil'
  const desc = c.values.description || '工具函数'
  const category = c.values.category || 'string'
  const params = c.fields.filter((f) => f.name)

  const catLabels: Record<string, string> = {
    string: '字符串处理',
    number: '数字处理',
    date: '日期处理',
    validate: '数据校验',
    url: 'URL 处理',
    storage: '本地存储',
  }

  return `# Skill: ${name} 工具函数

## 使用场景

${desc}，适用于：
- ${catLabels[category] || '通用'}相关功能
- 项目中多处复用的通用逻辑

## 技术栈

- TypeScript 5
- 无外部依赖（纯函数）

## 文件结构规范

\`\`\`
src/utils/
├── ${name}/
│   ├── index.ts              # 统一导出
│   ├── ${name}.ts            # 函数实现
│   ├── types.ts              # 类型定义
│   └── __tests__/
│       └── ${name}.test.ts
\`\`\`

## 类型定义

\`\`\`typescript
// types.ts
${
  params.length > 0
    ? `export interface ${name}Options {
${params.map((p) => `  ${p.name}${p.required ? '' : '?'}: ${fieldTs(p)} // ${p.label}`).join('\n')}
}`
    : '// 根据函数签名定义参数类型'
}
\`\`\`

## 函数实现

\`\`\`typescript
// ${name}.ts
${params.length > 0 ? `import type { ${name}Options } from './types'` : ''}

/**
 * ${desc}
 */
export function ${name}(${params.length > 0 ? `options: ${name}Options` : ''}): /* 返回类型 */ {
  // TODO: 实现逻辑
}
\`\`\`

## 测试用例

\`\`\`typescript
// ${name}.test.ts
import { ${name} } from '../${name}'

describe('${name}', () => {
  it('应该正确处理正常输入', () => {
    // TODO: 测试正常输入
  })

  it('应该正确处理边界情况', () => {
    // TODO: 测试边界值
  })

  it('应该正确处理错误输入', () => {
    // TODO: 测试错误处理
  })
})
\`\`\`

## 输出要求

生成工具函数时必须：
1. 纯函数，无副作用
2. 完整的 TypeScript 类型定义
3. 处理边界情况（null、undefined、空字符串等）
4. JSDoc 注释说明用途和参数
5. 包含单元测试

## 使用示例

### 用户输入

\`\`\`
生成 ${name} 工具函数。
${desc}
分类: ${catLabels[category] || '通用'}
${params.length > 0 ? `参数:\n${params.map((p) => `- ${p.name} (${p.label}): ${p.type}`).join('\n')}` : ''}
\`\`\`

### AI 输出

\`\`\`
生成 ${name} 的完整实现：
- types.ts - 类型定义
- ${name}.ts - 函数实现
- ${name}.test.ts - 测试文件
\`\`\``
}
