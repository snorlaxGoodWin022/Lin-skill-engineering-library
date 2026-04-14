# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 仓库概述

这是一个 **Skill.md 库** —— 收集了 AI "工作手册"，用于指导 AI 助手遵循项目特定的规范、架构和开发模式。Skill.md 文件告诉 AI 如何生成符合团队标准的代码。

主要内容位于 `skill-library/` 目录：

```
skill-library/
├── .claude/skills/     # 核心技能文件（表单生成器、CRUD模板等）
├── templates/          # 技能模板（最小、详细、团队规范）
├── examples/           # 可运行的 React 代码示例
├── docs/               # 文档（快速开始、概念、常见问题）
├── tools/              # Node.js 工具（验证、生成）
└── config/             # Claude Desktop 和 MCP 配置示例
```

## 技能文件

核心技能位于 `skill-library/.claude/skills/`，按技术栈分类：

### React 技术栈 (`react/`)

| 技能文件 | 用途 | 技术栈 |
|---------|------|--------|
| `react/form-generator-react.skill.md` | React 表单组件生成 | React Hook Form + Zod + Ant Design |
| `react/crud-template-react.skill.md` | CRUD 模块模板 | React + Ant Design Table + 自定义 Hooks |
| `react/code-standard-react.skill.md` | 代码规范标准 | TypeScript + React 最佳实践 |
| `react/component-wrapper-react.skill.md` | UI 组件封装 | Ant Design 定制化 |
| `react/api-layer-react.skill.md` | API 层封装 | Axios + React Query |
| `react/unit-test-react.skill.md` | 单元测试 | Jest + Testing Library |
| `react/state-zustand.skill.md` | 状态管理 | Zustand |
| `react/hooks-react.skill.md` | 自定义 Hooks 模板 | React Hooks |
| `react/router-react.skill.md` | 路由配置 | React Router v6 |
| `react/error-handler-react.skill.md` | 错误处理体系 | Error Boundary + Axios 拦截 + 日志上报 |
| `react/permission-react.skill.md` | 权限控制 | RBAC + AuthGuard + AuthButton + Zustand |
| `react/performance-react.skill.md` | 性能优化 | 懒加载 + 虚拟列表 + memo + 缓存策略 |

### Vue 3 技术栈 (`vue3/`)

| 技能文件 | 用途 | 技术栈 |
|---------|------|--------|
| `vue3/form-generator-vue3.skill.md` | Vue3 表单组件生成 | VeeValidate + Zod + Element Plus |
| `vue3/crud-template-vue3.skill.md` | CRUD 模块模板 | Vue 3 + Element Plus Table + Composables |
| `vue3/code-standard-vue3.skill.md` | 代码规范标准 | TypeScript + Vue 3 最佳实践 |
| `vue3/component-wrapper-vue3.skill.md` | UI 组件封装 | Element Plus 定制化 |
| `vue3/api-layer-vue3.skill.md` | API 层封装 | Axios + Vue Query |
| `vue3/unit-test-vue3.skill.md` | 单元测试 | Vitest + Vue Test Utils |
| `vue3/state-pinia.skill.md` | 状态管理 | Pinia |
| `vue3/composables-vue3.skill.md` | Composables 模板 | Vue 3 Composition API |
| `vue3/router-vue3.skill.md` | 路由配置 | Vue Router 4 |
| `vue3/error-handler-vue3.skill.md` | 错误处理体系 | onErrorCaptured + Axios 拦截 + 日志上报 |
| `vue3/permission-vue3.skill.md` | 权限控制 | RBAC + beforeEach + v-permission + Pinia |
| `vue3/performance-vue3.skill.md` | 性能优化 | 懒加载 + 虚拟列表 + shallowRef + 缓存 |

### 通用技能 (`common/`)

| 技能文件 | 用途 | 技术栈 |
|---------|------|--------|
| `common/utils-common.skill.md` | 通用工具函数 | 日期/数字/字符串/校验/存储 |
| `common/typescript-types.skill.md` | TypeScript 类型定义 | API/表单/组件类型 |
| `common/e2e-test-playwright.skill.md` | E2E 测试 | Playwright + Page Object |
| `common/api-test.skill.md` | API 接口测试 | Supertest |
| `common/i18n-common.skill.md` | 国际化 | react-i18next / vue-i18n + 多语言方案 |
| `common/cicd-common.skill.md` | CI/CD 配置 | GitHub Actions + 多环境部署 |

## 工具命令

`skill-library/tools/` 目录下的 Node.js 工具：

```bash
# 验证单个技能文件格式
node skill-library/tools/validate-skill.js ./path/to/skill.skill.md

# 验证目录下所有技能文件
node skill-library/tools/validate-skill.js --dir ./skill-library/.claude/skills

# 交互式创建新技能
node skill-library/tools/generate-skill.js

# 使用指定模板创建
node skill-library/tools/generate-skill.js "技能名称" detailed
```

可用模板：`minimal`（最小）、`detailed`（详细）、`team`（团队）、`component`（组件）、`form`（表单）、`crud`

## 代码示例

可运行的代码示例展示技能输出效果：

- `skill-library/examples/form-generator-example/` - 商品表单（React Hook Form + Zod）
- `skill-library/examples/crud-template-example/` - 用户管理 CRUD（含自定义 Hooks）

## 技术栈

技能覆盖两套前端技术栈：

**React 栈：**
- React 18 + TypeScript 5
- Ant Design 5.x
- react-hook-form + Zod 表单校验
- Zustand / React Query 状态管理
- React Router v6

**Vue 3 栈：**
- Vue 3.3+ + TypeScript 5
- Element Plus 2.4+
- VeeValidate + Zod 表单校验
- Pinia / TanStack Query 状态管理
- Vue Router 4

## AI 助手注意事项

当用户询问 Skill.md 相关问题时，引导其查看 `skill-library/README.md` 获取概览，`skill-library/docs/getting-started.md` 获取配置说明。创建新技能时，参考 `.claude/skills/` 中的现有技能作为模板 —— 它们遵循统一结构：使用场景、技术栈约定、代码规范、业务逻辑模板、输出要求。

## MCP 自动化工作流

本项目已配置以下 MCP Server。Claude 应根据任务自动选择使用，无需用户手动指定。

### Playwright MCP — 浏览器自动化 & 视觉验证

**自动触发场景：**
- 用户说"看看效果"、"验证一下"、"打开页面"、"截图"时
- 完成组件/页面开发后，用户要求检查效果时
- 用户要求进行流程测试（如"测试编辑器流程"）时
- 用户要求对比设计与实现的差异时

**使用流程：**
1. 确认 dev server 已启动（如未启动，先运行 `cd skill-library/web && npm run dev`）
2. 通过 Playwright 打开本地开发地址（http://localhost:3000）
3. 导航到目标页面（首页、library、configurator、editor），执行操作或截图
4. 将截图结果反馈给用户，指出发现的问题

### Context7 MCP — 最新文档查询

**自动触发场景：**
- 用户问到项目中使用的库/API 的用法时（Next.js、Zustand、Monaco Editor、Tailwind CSS 4 等）
- 生成代码时需要确认某个 API 的最新签名时
- 用户说"查一下"、"怎么用"、"最新"时
- 使用不确定是否已变更的 API 时（尤其是 Next.js 16 有 breaking changes）

**使用流程：**
1. 查询相关库的最新文档
2. 基于返回的文档内容生成准确的代码
3. 如果发现项目中的代码使用了已废弃的 API，主动提醒用户

## Web 应用技术栈

`skill-library/web/` 是本项目的 Web 前端应用，用于在线展示和管理 Skill.md 文件。

- **框架：** Next.js 16.2.2 (App Router)
- **语言：** TypeScript 5
- **样式：** Tailwind CSS 4
- **状态管理：** Zustand 5
- **代码编辑器：** Monaco Editor (@monaco-editor/react)
- **Markdown 处理：** gray-matter + highlight.js
- **单元测试：** Vitest + Testing Library + jsdom
- **E2E 测试：** Playwright (chromium)
- **Lint：** ESLint + eslint-config-next
- **部署：** Vercel

## Web 应用项目结构

```
skill-library/web/src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 首页
│   ├── layout.tsx          # 根布局
│   ├── globals.css         # 全局样式 (Tailwind)
│   ├── library/page.tsx    # Skill 库浏览页
│   ├── configurator/       # Skill 配置器页面
│   ├── editor/             # Skill 编辑器页面
│   └── api/skills/         # API Routes (技能文件 CRUD)
├── components/             # 通用组件
│   ├── Layout.tsx          # 页面布局
│   ├── Sidebar.tsx         # 侧边导航
│   ├── SkillCard.tsx       # Skill 卡片
│   ├── SkillList.tsx       # Skill 列表
│   ├── CodePreview.tsx     # 代码预览
│   ├── MonacoEditor.tsx    # Monaco 编辑器封装
│   ├── SearchBar.tsx       # 搜索栏
│   ├── MarkdownRenderer.tsx # Markdown 渲染
│   └── configurator/       # 配置器专用组件
├── lib/                    # 工具函数
│   ├── skill-loader.ts     # Skill 文件加载
│   ├── skill-import-parser.ts  # 导入解析
│   ├── template-generator.ts   # 模板生成
│   └── template-schemas.ts     # 模板 Schema
├── store/                  # Zustand 状态管理
│   ├── skillStore.ts       # Skill 状态
│   └── configStore.ts      # 配置器状态
└── types/                  # TypeScript 类型
    ├── skill.ts            # Skill 类型定义
    └── configurator.ts     # 配置器类型定义
```

## 代码规范

- **组件语法：** 函数式组件 + TypeScript，使用 `'use client'` 标记客户端组件
- **样式方案：** Tailwind CSS 4 utility classes，避免内联样式
- **路径别名：** 使用 `@/` 指向 `src/`
- **状态管理：** Zustand store 拆分为独立领域（skill、config）
- **测试：** 单元测试放在 `tests/`，E2E 测试放在 `e2e/`
- **API：** 使用 Next.js App Router API Routes（`app/api/`）
