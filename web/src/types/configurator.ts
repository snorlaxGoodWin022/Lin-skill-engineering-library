// types/configurator.ts

export type TemplateType = 'form' | 'crud' | 'api' | 'unit-test' | 'hooks' | 'state' | 'utils'

export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'boolean'
  | 'textarea'
  | 'fields-list'
  | 'date'
  | 'email'

export interface ConfigFieldSchema {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  defaultValue?: string | number | boolean
  options?: { label: string; value: string }[]
  description?: string
}

export interface TemplateSchema {
  templateType: TemplateType
  label: string
  icon: string
  description: string
  supportedFrameworks: ('react' | 'vue3')[]
  fields: ConfigFieldSchema[]
}

export interface FieldDefinition {
  name: string
  label: string
  type: FieldType
  required: boolean
  options?: string[]
}

export interface SkillConfig {
  templateType: TemplateType | null
  framework: 'react' | 'vue3' | null
  values: Record<string, any>
  fields: FieldDefinition[]
}

export interface ParsedSkillDetected {
  name: string | null
  confidence: 'high' | 'medium' | 'low'
  sections: string[]
  warnings: string[]
}

export interface ParsedSkill {
  templateType: TemplateType | null
  framework: 'react' | 'vue3' | null
  values: Record<string, any>
  fields: FieldDefinition[]
  detected: ParsedSkillDetected
}

export const TEMPLATE_LABELS: Record<TemplateType, string> = {
  form: '表单生成器',
  crud: 'CRUD 模板',
  api: 'API 层封装',
  'unit-test': '单元测试',
  hooks: 'Hooks / Composables',
  state: '状态管理',
  utils: '工具函数',
}
