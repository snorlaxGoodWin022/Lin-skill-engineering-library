# Skills 目录

AI 代码生成模板库，用于指导 Claude 生成符合项目规范的代码。

## 目录结构

```
.claude/skills/
├── react/                # React 技术栈
│   ├── form-generator-react.skill.md
│   ├── crud-template-react.skill.md
│   ├── code-standard-react.skill.md
│   ├── component-wrapper-react.skill.md
│   ├── api-layer-react.skill.md
│   ├── unit-test-react.skill.md
│   ├── state-zustand.skill.md
│   ├── hooks-react.skill.md
│   ├── router-react.skill.md
│   ├── error-handler-react.skill.md
│   ├── permission-react.skill.md
│   └── performance-react.skill.md
├── vue3/                 # Vue 3 技术栈
│   ├── form-generator-vue3.skill.md
│   ├── crud-template-vue3.skill.md
│   ├── code-standard-vue3.skill.md
│   ├── component-wrapper-vue3.skill.md
│   ├── api-layer-vue3.skill.md
│   ├── unit-test-vue3.skill.md
│   ├── state-pinia.skill.md
│   ├── composables-vue3.skill.md
│   ├── router-vue3.skill.md
│   ├── error-handler-vue3.skill.md
│   ├── permission-vue3.skill.md
│   └── performance-vue3.skill.md
├── common/               # 框架无关通用技能
│   ├── utils-common.skill.md
│   ├── typescript-types.skill.md
│   ├── e2e-test-playwright.skill.md
│   ├── api-test.skill.md
│   ├── i18n-common.skill.md
│   └── cicd-common.skill.md
└── readme.md             # 本文件
```

## 技能列表 (29个)

### React 技术栈 (12个)

| 技能 | 文件 | 用途 |
|------|------|------|
| 表单生成器 | `react/form-generator-react` | 表单组件 (RHF + Zod + Ant Design) |
| CRUD 模板 | `react/crud-template-react` | CRUD 模块模板 (列表+搜索+分页+弹窗) |
| 代码规范 | `react/code-standard-react` | 代码规范标准 (TypeScript + React) |
| 组件封装 | `react/component-wrapper-react` | UI 组件封装 (Ant Design 定制) |
| API 层 | `react/api-layer-react` | API 层封装 (Axios + React Query) |
| 单元测试 | `react/unit-test-react` | 单元测试 (Jest + Testing Library) |
| 状态管理 | `react/state-zustand` | Zustand 状态管理 |
| 自定义 Hooks | `react/hooks-react` | 自定义 Hooks 模板库 |
| 路由配置 | `react/router-react` | 路由配置 (React Router v6) |
| 错误处理 | `react/error-handler-react` | 错误处理体系 (Error Boundary + Axios 拦截) |
| 权限控制 | `react/permission-react` | 权限控制 (RBAC + 路由守卫 + 按钮权限) |
| 性能优化 | `react/performance-react` | 性能优化 (懒加载 + 虚拟列表 + 缓存) |

### Vue 3 技术栈 (12个)

| 技能 | 文件 | 用途 |
|------|------|------|
| 表单生成器 | `vue3/form-generator-vue3` | 表单组件 (VeeValidate + Zod + Element Plus) |
| CRUD 模板 | `vue3/crud-template-vue3` | CRUD 模块模板 (列表+搜索+分页+弹窗) |
| 代码规范 | `vue3/code-standard-vue3` | 代码规范标准 (TypeScript + Vue 3) |
| 组件封装 | `vue3/component-wrapper-vue3` | UI 组件封装 (Element Plus 定制) |
| API 层 | `vue3/api-layer-vue3` | API 层封装 (Axios + Vue Query) |
| 单元测试 | `vue3/unit-test-vue3` | 单元测试 (Vitest + Vue Test Utils) |
| 状态管理 | `vue3/state-pinia` | Pinia 状态管理 |
| Composables | `vue3/composables-vue3` | Composables 模板库 |
| 路由配置 | `vue3/router-vue3` | 路由配置 (Vue Router 4) |
| 错误处理 | `vue3/error-handler-vue3` | 错误处理体系 (onErrorCaptured + Axios 拦截) |
| 权限控制 | `vue3/permission-vue3` | 权限控制 (RBAC + 路由守卫 + v-permission) |
| 性能优化 | `vue3/performance-vue3` | 性能优化 (懒加载 + 虚拟列表 + 响应式优化) |

### 通用技能 (6个)

| 技能 | 文件 | 用途 |
|------|------|------|
| 工具函数 | `common/utils-common` | 通用工具函数 (日期/数字/字符串/校验/存储) |
| 类型定义 | `common/typescript-types` | TypeScript 类型定义 (API/表单/组件) |
| E2E 测试 | `common/e2e-test-playwright` | E2E 测试 (Playwright + Page Object) |
| API 测试 | `common/api-test` | API 接口测试 (Supertest) |
| 国际化 | `common/i18n-common` | 国际化 (react-i18next / vue-i18n + 多语言方案) |
| CI/CD | `common/cicd-common` | CI/CD 配置 (GitHub Actions + 多环境部署) |

## 使用方式

将技能文件内容复制到 Claude 对话中，或配置到 Claude Code/Desktop 的 skills 目录。

也可通过在线配置器可视化生成：https://web-delta-gules-16.vercel.app/configurator

## 文件命名规范

```
{功能名}-{框架}.skill.md
```

示例: `form-generator-react.skill.md`

## Skill 分类说明

- **react/** — 所有 React 生态相关的 skill，使用 Ant Design 5.x + react-hook-form + Zustand + React Query
- **vue3/** — 所有 Vue 3 生态相关的 skill，使用 Element Plus 2.x + VeeValidate + Pinia + Vue Query
- **common/** — 框架无关的通用 skill，包括工具函数、类型定义、测试模板、国际化、CI/CD
