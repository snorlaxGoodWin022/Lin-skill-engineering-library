# Lin Skills Template Library - AI 代码生成模板库

一个开源的 AI 技能文件库，帮助开发者创建和使用 Skill.md 文件来标准化 AI 辅助开发。

## 什么是 Skill.md？

Skill.md 是一种给 AI 提供"工作手册"的方式。就像入职新公司时拿到的《开发规范文档》，Skill.md 告诉 AI：

- 项目如何组织代码
- 有哪些约定俗成的规矩
- 常见业务怎么处理
- 代码写成什么样才算合格

**核心价值：一次配置，持续复用。**

## Skill.md vs Prompt 的区别

| 对比维度 | Prompt | Skill.md |
| --- | --- | --- |
| 使用时机 | 每次对话都要写 | 写一次，长期使用 |
| 内容性质 | 具体任务描述 | 通用规范和知识 |
| 适用场景 | "帮我生成一个登录页" | "我们项目所有页面的开发规范" |
| 更新频率 | 随需求变化 | 技术栈变更时才改 |
| 典型长度 | 100-500字 | 1000-5000字 |

## 目录结构

```
skill-library/
├── .claude/
│   └── skills/                    # 核心技能文件 (22个)
│       ├── form-generator-react.skill.md
│       ├── form-generator-vue3.skill.md
│       ├── crud-template-react-skill.md
│       ├── crud-template-vue3-skill.md
│       ├── ...（共 22 个）
│       ├── e2e-test-playwright.skill.md
│       └── api-test.skill.md
│
├── web/                           # 在线 Web 应用 (Next.js 16)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # 首页
│   │   │   ├── library/           # Skill 库浏览
│   │   │   ├── editor/            # 在线编辑器 (Monaco)
│   │   │   └── configurator/      # 可视化配置器
│   │   ├── components/            # 组件库
│   │   ├── lib/                   # 工具库
│   │   ├── store/                 # Zustand 状态管理
│   │   └── types/                 # TypeScript 类型
│   └── package.json
│
├── templates/                     # 技能模板
│   ├── minimal-skill.md
│   ├── detailed-skill.md
│   └── team-standard.md
│
├── examples/                      # 代码示例
│   ├── form-generator-example/
│   └── crud-template-example/
│
├── docs/                          # 文档
│   ├── getting-started.md
│   ├── concepts.md
│   └── faq.md
│
├── tools/                         # 工具脚本
│   ├── validate-skill.js
│   └── generate-skill.js
│
└── config/                        # 配置示例
    ├── claude-desktop-config.json
    └── mcp-server-config.json
```

## 核心技能文件 (22个)

### React 技术栈 (9个)

| 技能文件 | 用途 |
|---------|------|
| `form-generator-react.skill.md` | 表单组件生成 (RHF + Zod + AntD) |
| `crud-template-react-skill.md` | CRUD 模块模板 |
| `code-standard-react.skill.md` | 代码规范标准 |
| `component-wrapper-react.skill.md` | UI 组件封装 |
| `api-layer-react.skill.md` | API 层封装 (Axios + React Query) |
| `unit-test-react.skill.md` | 单元测试 (Jest + Testing Library) |
| `state-zustand.skill.md` | 状态管理 (Zustand) |
| `hooks-react.skill.md` | 自定义 Hooks 模板 |
| `router-react.skill.md` | 路由配置 (React Router v6) |

### Vue3 技术栈 (9个)

| 技能文件 | 用途 |
|---------|------|
| `form-generator-vue3.skill.md` | 表单组件生成 (VeeValidate + Element Plus) |
| `crud-template-vue3-skill.md` | CRUD 模块模板 |
| `code-standrad-vue3.skill.md` | 代码规范标准 |
| `component-wrapper-vue3.skill.md` | UI 组件封装 |
| `api-layer-vue3.skill.md` | API 层封装 (Axios + Vue Query) |
| `unit-test-vue3.skill.md` | 单元测试 (Vitest) |
| `state-pinia.skill.md` | 状态管理 (Pinia) |
| `composables-vue3.skill.md` | Composables 模板 |
| `router-vue3.skill.md` | 路由配置 (Vue Router 4) |

### 通用 (4个)

| 技能文件 | 用途 |
|---------|------|
| `utils-common.skill.md` | 通用工具函数 (日期/数字/字符串/校验/存储) |
| `typescript-types.skill.md` | TypeScript 类型定义 (API/表单/组件/业务) |
| `e2e-test-playwright.skill.md` | E2E 测试 (Playwright) |
| `api-test.skill.md` | API 测试 |

## 在线 Web 应用

在线浏览、编辑和生成 Skill.md 文件。

**线上地址**: https://web-delta-gules-16.vercel.app

### 功能模块

| 页面 | 路由 | 功能 |
|------|------|------|
| 首页 | `/` | 项目介绍、统计数据、快速导航 |
| Skill 库 | `/library` | 分类浏览、搜索筛选、一键复制/下载 |
| 编辑器 | `/editor` | Monaco Editor 在线编辑、实时预览 |
| 配置器 | `/configurator` | 3 步向导可视化生成 Skill |

### 配置器支持的模板类型 (7种)

通过表单驱动生成高质量 Skill.md，支持 React / Vue3 双栈：

1. **表单生成器** - Zod Schema + 表单组件 + 测试
2. **CRUD 模板** - 类型 + API + Hooks + 页面
3. **API 层封装** - 查询/变更 Hooks + 缓存策略
4. **单元测试** - 组件/Hook/工具函数测试套件
5. **Hooks/Composable** - React Hook / Vue3 Composable
6. **状态管理** - Zustand / Pinia
7. **工具函数** - 纯函数 + 类型定义 + 测试

### 技术栈

- Next.js 16 + React 19 + TypeScript 5
- Tailwind CSS v4
- Monaco Editor
- Zustand 5
- Vitest + Playwright
- 部署: Vercel

### 本地开发

```bash
cd web
npm install
npm run dev
```

访问 http://localhost:3000

## 快速开始

### 方法一：直接使用技能文件

1. 复制 `.claude/skills/` 目录下的技能文件到你的项目
2. 在 Claude 对话中引用这些文件
3. AI 会按照规范生成代码

### 方法二：配置 Claude Desktop 自动加载

1. 编辑 Claude Desktop 配置文件：
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. 添加 MCP 配置：
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/your/project/.claude/skills"]
    }
  }
}
```

3. 重启 Claude Desktop

### 方法三：使用在线配置器

1. 访问 https://web-delta-gules-16.vercel.app/configurator
2. 选择模板类型和技术栈
3. 配置字段和选项
4. 预览生成的 Skill.md
5. 复制或下载

## 工具使用

### 验证技能文件

```bash
# 验证单个文件
node tools/validate-skill.js ./my-skill.skill.md

# 验证目录下所有文件
node tools/validate-skill.js --dir ./.claude/skills
```

### 生成新技能

```bash
# 交互式创建
node tools/generate-skill.js

# 快速创建
node tools/generate-skill.js "技能名称" detailed
```

可用模板：`minimal`、`detailed`、`team`、`component`、`form`、`crud`

## 使用示例

### 生成表单组件

```
请按照 form-generator-react.skill.md 的规范，生成一个用户注册表单。

字段：
- 用户名（3-20字符）
- 邮箱
- 密码（8-20字符）
- 确认密码（需要和密码一致）
```

### 生成 CRUD 模块

```
请按照 crud-template-react-skill.md 的规范，生成一个商品管理模块。

列表页筛选条件：
- 商品名称搜索
- 分类筛选
- 状态筛选

列表展示字段：
- 商品ID、商品名称、价格、库存、状态
```

### 生成 API 层

```
请按照 api-layer-react.skill.md 的规范，生成订单模块的 API 代码。

接口：
- GET /orders - 订单列表
- GET /orders/:id - 订单详情
- POST /orders - 创建订单
- PUT /orders/:id - 更新订单
- DELETE /orders/:id - 删除订单
```

## 技术栈支持

### React 技术栈
- **前端**: React 18 + TypeScript 5
- **UI库**: Ant Design 5.x
- **表单**: react-hook-form + Zod
- **状态管理**: Zustand / React Query
- **路由**: React Router v6
- **测试**: Jest + Testing Library + Playwright

### Vue3 技术栈
- **前端**: Vue 3 + TypeScript 5
- **UI库**: Element Plus
- **表单**: VeeValidate + Zod
- **状态管理**: Pinia / Vue Query
- **路由**: Vue Router 4
- **测试**: Vitest + Playwright

## 文档导航

| 文档 | 说明 |
|-----|------|
| [概念介绍](docs/concepts.md) | Skill.md 原理、组成部分、工作流程 |
| [快速开始](docs/getting-started.md) | 安装配置、工具使用、第一个示例 |
| [常见问题](docs/faq.md) | 使用问题解答和故障排除 |
| [方案与进度](plan.md) | 项目整体方案和各阶段进度 |

## 贡献指南

1. Fork 本仓库
2. 创建你的分支 (`git checkout -b feature/amazing-skill`)
3. 提交更改 (`git commit -m 'Add some amazing skill'`)
4. 推送到分支 (`git push origin feature/amazing-skill`)
5. 打开 Pull Request

欢迎贡献新的技能文件、示例或改进建议！

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**提示**: Skill.md 是团队协作的利器，把团队经验变成可执行的文档，让 AI 成为你的得力助手！
