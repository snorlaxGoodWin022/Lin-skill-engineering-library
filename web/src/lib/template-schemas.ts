// lib/template-schemas.ts
import type { TemplateSchema, TemplateType } from '@/types/configurator'

export const TEMPLATE_SCHEMAS: Record<TemplateType, TemplateSchema> = {
  form: {
    templateType: 'form',
    label: '表单生成器',
    icon: '📝',
    description: '生成表单组件，包含校验、提交、重置等功能',
    supportedFrameworks: ['react', 'vue3'],
    fields: [
      { key: 'componentName', label: '组件名称', type: 'text', placeholder: '如：UserForm', required: true },
      { key: 'description', label: '功能描述', type: 'textarea', placeholder: '描述这个表单的用途', required: true },
      { key: 'fields', label: '表单字段', type: 'fields-list', required: true },
      { key: 'formLibrary', label: '表单库', type: 'select', defaultValue: 'react-hook-form',
        options: [
          { label: 'React Hook Form + Zod', value: 'react-hook-form' },
          { label: 'Ant Design Form', value: 'antd-form' },
        ],
      },
      { key: 'uiLibrary', label: 'UI 组件库', type: 'select', defaultValue: 'ant-design',
        options: [
          { label: 'Ant Design', value: 'ant-design' },
          { label: 'Element Plus', value: 'element-plus' },
        ],
      },
    ],
  },

  crud: {
    templateType: 'crud',
    label: 'CRUD 模板',
    icon: '🗃️',
    description: '生成完整的增删改查模块，包含列表、详情、编辑页面',
    supportedFrameworks: ['react', 'vue3'],
    fields: [
      { key: 'moduleName', label: '模块名称', type: 'text', placeholder: '如：User（用户）', required: true },
      { key: 'description', label: '功能描述', type: 'textarea', placeholder: '描述这个模块的用途', required: true },
      { key: 'fields', label: '数据字段', type: 'fields-list', required: true },
      { key: 'apiBaseUrl', label: 'API 基础路径', type: 'text', placeholder: '如：/api/users', required: true },
      { key: 'features', label: '附加功能', type: 'textarea', placeholder: '如：批量删除, 导出, 状态切换（逗号分隔）' },
    ],
  },

  api: {
    templateType: 'api',
    label: 'API 层封装',
    icon: '🔌',
    description: '生成 API 请求层代码，包含类型定义、请求函数、Query Hooks',
    supportedFrameworks: ['react', 'vue3'],
    fields: [
      { key: 'moduleName', label: '模块名称', type: 'text', placeholder: '如：Order（订单）', required: true },
      { key: 'description', label: '功能描述', type: 'textarea', placeholder: '描述 API 模块的用途', required: true },
      { key: 'fields', label: '实体字段', type: 'fields-list', required: true },
      { key: 'apiBaseUrl', label: 'API 基础路径', type: 'text', placeholder: '如：/api/orders', required: true },
      { key: 'hasPagination', label: '是否分页', type: 'boolean', defaultValue: true },
    ],
  },

  'unit-test': {
    templateType: 'unit-test',
    label: '单元测试',
    icon: '🧪',
    description: '生成单元测试代码，包含组件测试、Hook 测试、工具函数测试',
    supportedFrameworks: ['react', 'vue3'],
    fields: [
      { key: 'targetName', label: '测试目标名称', type: 'text', placeholder: '如：LoginForm', required: true },
      { key: 'description', label: '功能描述', type: 'textarea', placeholder: '描述测试目标的功能', required: true },
      { key: 'componentType', label: '测试类型', type: 'select', defaultValue: 'component',
        options: [
          { label: '组件测试', value: 'component' },
          { label: 'Hook 测试', value: 'hook' },
          { label: '工具函数测试', value: 'util' },
        ],
      },
      { key: 'testCases', label: '需要测试的场景', type: 'textarea', placeholder: '如：正常提交, 空表单验证, 网络错误（每行一个）' },
    ],
  },

  hooks: {
    templateType: 'hooks',
    label: 'Hooks / Composables',
    icon: '🪝',
    description: '生成自定义 Hook 或 Composable 函数',
    supportedFrameworks: ['react', 'vue3'],
    fields: [
      { key: 'hookName', label: 'Hook 名称', type: 'text', placeholder: '如：useCounter', required: true },
      { key: 'description', label: '功能描述', type: 'textarea', placeholder: '描述这个 Hook 的用途', required: true },
      { key: 'parameters', label: '参数定义', type: 'fields-list' },
      { key: 'returnValues', label: '返回值定义', type: 'fields-list' },
    ],
  },

  state: {
    templateType: 'state',
    label: '状态管理',
    icon: '📦',
    description: '生成状态管理 Store，包含状态定义、Action、Selector',
    supportedFrameworks: ['react', 'vue3'],
    fields: [
      { key: 'storeName', label: 'Store 名称', type: 'text', placeholder: '如：useUserStore', required: true },
      { key: 'description', label: '功能描述', type: 'textarea', placeholder: '描述这个 Store 管理的状态', required: true },
      { key: 'fields', label: '状态字段', type: 'fields-list', required: true },
      { key: 'persist', label: '是否持久化', type: 'boolean', defaultValue: false },
    ],
  },

  utils: {
    templateType: 'utils',
    label: '工具函数',
    icon: '🔧',
    description: '生成通用工具函数，包含类型定义和单元测试',
    supportedFrameworks: ['react', 'vue3'],
    fields: [
      { key: 'category', label: '函数分类', type: 'select', defaultValue: 'string',
        options: [
          { label: '字符串处理', value: 'string' },
          { label: '数字处理', value: 'number' },
          { label: '日期处理', value: 'date' },
          { label: '数据校验', value: 'validate' },
          { label: 'URL 处理', value: 'url' },
          { label: '本地存储', value: 'storage' },
        ],
      },
      { key: 'functionName', label: '函数名称', type: 'text', placeholder: '如：formatDate', required: true },
      { key: 'description', label: '功能描述', type: 'textarea', placeholder: '描述函数的功能', required: true },
      { key: 'parameters', label: '参数定义', type: 'fields-list' },
    ],
  },
}
