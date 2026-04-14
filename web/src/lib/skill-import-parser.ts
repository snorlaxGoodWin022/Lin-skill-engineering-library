// lib/skill-import-parser.ts
import type {
  TemplateType,
  FieldDefinition,
  ParsedSkill,
  ParsedSkillDetected,
} from '@/types/configurator'

// ===== 反向类型映射 =====

const TS_TO_FIELD_TYPE: Record<string, FieldDefinition['type']> = {
  string: 'text',
  number: 'number',
  boolean: 'boolean',
}

// ===== 解析主函数 =====

export function parseSkillMarkdown(content: string): ParsedSkill | null {
  if (!content.trim()) return null

  const sections = extractSections(content)
  const h1 = extractH1(content)
  const warnings: string[] = []

  // A. 检测框架
  const framework = detectFramework(content, h1)

  // B. 检测模板类型
  const { templateType, confidence } = detectTemplateType(content, h1)

  // C. 提取名称
  const name = extractName(h1)

  // D. 提取字段和配置值
  const { values, fields } = extractConfig(content, sections, templateType, name, warnings)

  return {
    templateType,
    framework,
    values,
    fields,
    detected: {
      name,
      confidence,
      sections: sections.map((s) => s.title),
      warnings,
    },
  }
}

// ===== 工具函数 =====

interface Section {
  title: string
  content: string
}

function extractSections(content: string): Section[] {
  const sections: Section[] = []
  const lines = content.split('\n')
  let currentTitle = ''
  let currentLines: string[] = []

  for (const line of lines) {
    const match = line.match(/^## (.+)/)
    if (match) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentLines.join('\n') })
      }
      currentTitle = match[1].trim()
      currentLines = []
    } else {
      currentLines.push(line)
    }
  }
  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentLines.join('\n') })
  }

  return sections
}

function extractH1(content: string): string {
  const match = content.match(/^# (.+)/m)
  return match ? match[1].trim() : ''
}

function findSection(sections: Section[], keyword: string): Section | undefined {
  return sections.find((s) => s.title.includes(keyword))
}

// ===== A. 框架检测 =====

function detectFramework(content: string, h1: string): 'react' | 'vue3' | null {
  // H1 括号标记
  if (/\(React\)/.test(h1) || /\(React\s*\)/.test(h1)) return 'react'
  if (/\(Vue3?\)/.test(h1) || /\(Vue\s*3?\)/.test(h1)) return 'vue3'

  // 技术栈关键词
  const reactKeywords = [
    'react-hook-form',
    'Zustand',
    'Ant Design',
    'antd',
    '@tanstack/react-query',
    'Jest',
    'Testing Library',
  ]
  const vueKeywords = [
    'vee-validate',
    'Pinia',
    'Element Plus',
    'element-plus',
    '@tanstack/vue-query',
    'Vitest',
    'defineStore',
    'composable',
  ]

  let reactScore = 0,
    vueScore = 0
  for (const kw of reactKeywords) {
    if (content.includes(kw)) reactScore++
  }
  for (const kw of vueKeywords) {
    if (content.includes(kw)) vueScore++
  }

  if (reactScore > vueScore) return 'react'
  if (vueScore > reactScore) return 'vue3'

  // 文件扩展名
  if (/\.tsx/.test(content) && !/\.vue/.test(content)) return 'react'
  if (/\.vue/.test(content) && !/\.tsx/.test(content)) return 'vue3'

  return null
}

// ===== B. 模板类型检测 =====

function detectTemplateType(
  content: string,
  h1: string
): { templateType: TemplateType | null; confidence: 'high' | 'medium' | 'low' } {
  const scores: Record<TemplateType, number> = {
    form: 0,
    crud: 0,
    api: 0,
    'unit-test': 0,
    hooks: 0,
    state: 0,
    utils: 0,
  }

  // H1 关键词
  if (/表单/.test(h1)) scores.form += 5
  if (/CRUD|增删改查/.test(h1)) scores.crud += 5
  if (/API|请求层|api\s*层/.test(h1)) scores.api += 5
  if (/测试|test/i.test(h1)) scores['unit-test'] += 5
  if (/Hook|Composable/.test(h1)) scores.hooks += 5
  if (/状态|Store|store/.test(h1)) scores.state += 5
  if (/工具|util|函数/.test(h1)) scores.utils += 5

  // 内容信号
  if (/FormData/.test(content)) scores.form += 3
  if (/useQuery|useMutation/.test(content)) {
    scores.crud += 3
    scores.api += 3
  }
  if (/describe\s*\(|it\s*\(/.test(content)) scores['unit-test'] += 5
  if (/create\s*<|defineStore/.test(content)) scores.state += 4
  if (/export\s+function\s+use[A-Z]/.test(content)) scores.hooks += 3
  if (/export\s+function\s+[a-z]/.test(content) && !/use[A-Z]/.test(content)) scores.utils += 3
  if (/纯函数/.test(content)) scores.utils += 2

  // 文件结构信号
  if (/\bapi\//.test(content)) {
    scores.crud += 2
    scores.api += 2
  }
  if (/\bstore\b|stores\//.test(content)) scores.state += 3
  if (/\bhooks\b|composables\//.test(content)) scores.hooks += 2
  if (/__tests__|\.test\./.test(content)) scores['unit-test'] += 2
  if (/\butils\//.test(content)) scores.utils += 2

  // 选出最高分
  let maxScore = 0
  let bestType: TemplateType | null = null
  let runnerUp = 0

  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      runnerUp = maxScore
      maxScore = score
      bestType = type as TemplateType
    } else if (score > runnerUp) {
      runnerUp = score
    }
  }

  if (maxScore === 0) return { templateType: null, confidence: 'low' }

  const gap = maxScore - runnerUp
  const confidence: 'high' | 'medium' | 'low' = gap >= 3 ? 'high' : gap >= 1 ? 'medium' : 'low'

  return { templateType: bestType, confidence }
}

// ===== C. 名称提取 =====

function extractName(h1: string): string | null {
  if (!h1) return null
  // 去掉 "Skill:" 前缀
  let name = h1.replace(/^Skill:\s*/i, '').trim()
  // 去掉括号后缀 (React) / (Vue3)
  name = name.replace(/\s*\((?:React|Vue3?)\)\s*$/, '').trim()
  // 去掉类型标签后缀
  const typeSuffixes = [
    '表单生成器',
    'CRUD 模板',
    'CRUD模板',
    'API 层封装',
    'API层封装',
    '单元测试',
    'Hooks 模板',
    'Hook 模板',
    'Composable 模板',
    '状态管理',
    '工具函数',
  ]
  for (const suffix of typeSuffixes) {
    if (name.endsWith(suffix)) {
      name = name.slice(0, -suffix.length).trim()
      break
    }
  }
  return name || null
}

// ===== D. 配置提取 =====

function extractConfig(
  content: string,
  sections: Section[],
  templateType: TemplateType | null,
  name: string | null,
  warnings: string[]
): { values: Record<string, any>; fields: FieldDefinition[] } {
  const values: Record<string, any> = {}
  let fields: FieldDefinition[] = []

  // 通用：描述（使用场景第一段）
  const usageSection = findSection(sections, '使用场景')
  if (usageSection) {
    const firstLine = usageSection.content
      .split('\n')
      .find((l) => l.trim() && !l.trim().startsWith('-') && !l.trim().startsWith('用于'))
    if (firstLine)
      values.description = firstLine
        .trim()
        .replace(/，适用于：$/, '')
        .replace(/，$/, '')
  }

  // 提取 TypeScript 接口中的字段
  fields = extractFieldsFromTsInterfaces(content, warnings)

  // 根据模板类型提取特有值
  switch (templateType) {
    case 'form':
      values.componentName = name || 'MyForm'
      break

    case 'crud':
      values.moduleName = name || 'Item'
      values.apiBaseUrl = extractApiBaseUrl(content) || '/api/items'
      extractFeatures(sections, values)
      break

    case 'api':
      values.moduleName = name || 'Item'
      values.apiBaseUrl = extractApiBaseUrl(content) || '/api/items'
      values.hasPagination = content.includes('PaginatedResponse') || content.includes('分页')
      break

    case 'unit-test':
      values.targetName = name || 'Component'
      values.componentType = detectComponentType(content)
      values.testCases = extractTestCases(content)
      break

    case 'hooks':
      values.hookName = name || 'useMyHook'
      break

    case 'state':
      values.storeName = name || 'useMyStore'
      values.persist = /persist|localStorage/.test(content)
      break

    case 'utils':
      values.functionName = name || 'myUtil'
      values.category = detectUtilCategory(content)
      break

    default:
      // 未知类型，尝试设置通用的 name
      if (name) {
        values.componentName = name
        values.moduleName = name
      }
      break
  }

  return { values, fields }
}

// ===== 字段提取 =====

function extractFieldsFromTsInterfaces(content: string, warnings: string[]): FieldDefinition[] {
  const fields: FieldDefinition[] = []

  // 查找 TypeScript 接口代码块
  const codeBlockRegex = /```(?:typescript|ts)\n([\s\S]*?)```/g
  let blockMatch: RegExpExecArray | null

  // 收集所有接口名
  const targetInterfaces: string[] = []

  while ((blockMatch = codeBlockRegex.exec(content)) !== null) {
    const block = blockMatch[1]
    // 匹配 FormData / Item / State / Params / Options 等接口
    const ifaceRegex = /interface\s+(\w+(?:FormData|Item|State|Params|Options|Return|Fields))\s*\{/g
    let ifaceMatch: RegExpExecArray | null
    while ((ifaceMatch = ifaceRegex.exec(block)) !== null) {
      targetInterfaces.push(ifaceMatch[1])
    }
  }

  if (targetInterfaces.length === 0) return fields

  // 重新扫描，从匹配到的接口提取字段
  codeBlockRegex.lastIndex = 0
  while ((blockMatch = codeBlockRegex.exec(content)) !== null) {
    const block = blockMatch[1]
    for (const ifaceName of targetInterfaces) {
      const ifacePattern = new RegExp(
        `interface\\s+${escapeRegex(ifaceName)}\\s*\\{([\\s\\S]*?)\\}`
      )
      const ifaceMatch = ifacePattern.exec(block)
      if (ifaceMatch) {
        const body = ifaceMatch[1]
        const parsed = parseInterfaceBody(body)
        fields.push(...parsed)
        if (parsed.length === 0) {
          warnings.push(`接口 ${ifaceName} 未提取到字段`)
        }
      }
    }
  }

  return fields
}

function parseInterfaceBody(body: string): FieldDefinition[] {
  const fields: FieldDefinition[] = []
  const lines = body.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*'))
      continue

    // 匹配 fieldName?: type 或 fieldName: type
    const propMatch = trimmed.match(/^(\w+)(\??):\s*(\w+(?:\[\])?)/)
    if (propMatch) {
      const name = propMatch[1]
      const required = propMatch[2] !== '?'
      const tsType = propMatch[3]
      const fieldType = TS_TO_FIELD_TYPE[tsType] || 'text'

      // 跳过 id, createTime, updateTime 等通用字段
      if (['id', 'createTime', 'updateTime', 'createdAt', 'updatedAt'].includes(name)) continue

      fields.push({
        name,
        label: name, // 默认用字段名，后续可从使用示例中提取中文标签
        type: fieldType,
        required,
      })
    }
  }

  return fields
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ===== 特有值提取 =====

function extractApiBaseUrl(content: string): string | null {
  const match = content.match(
    /(?:const\s+BASE_URL\s*=\s*|apiBaseUrl[：:]\s*)(['"`])(\/[^'"`\s]+)\1/
  )
  return match ? match[2] : null
}

function extractFeatures(sections: Section[], values: Record<string, any>) {
  const featureSection = findSection(sections, '附加功能')
  if (featureSection) {
    const features = featureSection.content
      .split('\n')
      .map((l) => l.replace(/^-\s*/, '').trim())
      .filter(Boolean)
    if (features.length) values.features = features.join(', ')
  }
}

function detectComponentType(content: string): string {
  if (/组件/.test(content) && !/hook|Hook/.test(content)) return 'component'
  if (/hook|Hook/.test(content)) return 'hook'
  return 'function'
}

function extractTestCases(content: string): string {
  const cases: string[] = []
  const itRegex = /it\s*\(\s*['"`]([^'"`]+)['"`]/g
  let match: RegExpExecArray | null
  while ((match = itRegex.exec(content)) !== null) {
    cases.push(match[1])
  }
  return cases.join('\n')
}

function detectUtilCategory(content: string): string {
  const categories: [string, RegExp][] = [
    ['string', /字符串/],
    ['number', /数字/],
    ['date', /日期/],
    ['validate', /校验|验证/],
    ['url', /URL|url/],
    ['storage', /存储|localStorage/],
  ]
  for (const [cat, regex] of categories) {
    if (regex.test(content)) return cat
  }
  return 'string'
}
