# Skill.md 库

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
│   └── skills/                    # 核心技能文件
│       ├── form-generator-react.skill.md   # React 表单组件生成器
│       ├── form-generator-vue3.skill.md    # Vue3 表单组件生成器
│       ├── crud-template.skill.md          # CRUD 模板生成器
│       ├── code-standard-react.skill.md    # React 代码规范标准
│       ├── code-standrad-vue3.skill.md     # Vue3 代码规范标准
│       └── component-wrapper.skill.md      # UI 组件封装规范
│
├── templates/                     # 技能模板
│   ├── minimal-skill.md          # 最小模板
│   ├── detailed-skill.md         # 详细模板
│   └── team-standard.md          # 团队规范模板
│
├── examples/                      # 代码示例
│   ├── form-generator-example/   # 表单生成器示例
│   │   ├── ProductForm/
│   │   │   ├── index.tsx         # 组件主文件
│   │   │   ├── schema.ts         # Zod 校验规则
│   │   │   ├── types.ts          # TypeScript 类型
│   │   │   └── ProductForm.module.css
│   │   └── README.md
│   │
│   └── crud-template-example/    # CRUD 模板示例
│       ├── UserManagement/
│       │   ├── pages/
│       │   │   ├── ListPage.tsx
│       │   │   └── ListPage.module.css
│       │   ├── hooks/
│       │   │   └── useUserList.ts
│       │   ├── types.ts
│       │   └── mocks/
│       │       └── user.ts
│       └── README.md
│
├── docs/                          # 文档
│   ├── getting-started.md        # 快速开始指南
│   ├── concepts.md               # 概念介绍
│   └── faq.md                    # 常见问题
│
├── tools/                         # 工具脚本
│   ├── validate-skill.js         # 技能文件验证工具
│   └── generate-skill.js         # 技能文件生成工具
│
├── config/                        # 配置示例
│   ├── claude-desktop-config.json    # Claude Desktop 配置
│   └── mcp-server-config.json        # MCP 服务器配置
│
└── README.md                      # 本文件
```

## 核心技能文件

| 技能文件 | 用途 | 技术栈 |
|---------|------|--------|
| `form-generator-react.skill.md` | React 表单组件生成 | React Hook Form + Zod + Ant Design |
| `form-generator-vue3.skill.md` | Vue3 表单组件生成 | Vue 3 + TypeScript + Element Plus |
| `crud-template.skill.md` | CRUD 模块模板 | React + Ant Design Table + 自定义 Hooks |
| `code-standard-react.skill.md` | React 代码规范标准 | TypeScript + React 最佳实践 |
| `code-standrad-vue3.skill.md` | Vue3 代码规范标准 | TypeScript + Vue 3 最佳实践 |
| `component-wrapper.skill.md` | UI 组件封装 | Ant Design 定制化 |

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

### 方法三：自定义技能文件

1. 参考 `templates/` 目录下的模板
2. 根据你的项目技术栈修改
3. 添加到 `.claude/skills/` 目录

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

# 查看帮助
node tools/generate-skill.js --help
```

可用模板：`minimal`、`detailed`、`team`、`component`、`form`、`crud`

## 使用示例

### 生成表单组件

```
请按照 form-generator.skill.md 的规范，生成一个用户注册表单。

字段：
- 用户名（3-20字符）
- 邮箱
- 密码（8-20字符）
- 确认密码（需要和密码一致）
```

### 生成 CRUD 模块

```
请按照 crud-template.skill.md 的规范，生成一个商品管理模块。

列表页筛选条件：
- 商品名称搜索
- 分类筛选
- 状态筛选

列表展示字段：
- 商品ID
- 商品名称
- 价格
- 库存
- 状态
```

## 技术栈支持

### React 技术栈
- **前端**: React 18 + TypeScript 5
- **UI库**: Ant Design 5.x
- **表单**: react-hook-form + Zod
- **状态管理**: Zustand / React Query
- **路由**: React Router v6

### Vue3 技术栈
- **前端**: Vue 3 + TypeScript 5
- **UI库**: Element Plus
- **表单**: VeeValidate + Zod
- **状态管理**: Pinia
- **路由**: Vue Router 4

你可以根据项目实际情况修改技能文件。

## 文档导航

| 文档 | 说明 |
|-----|------|
| [概念介绍](docs/concepts.md) | Skill.md 原理、组成部分、工作流程 |
| [快速开始](docs/getting-started.md) | 安装配置、工具使用、第一个示例 |
| [常见问题](docs/faq.md) | 使用问题解答和故障排除 |

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
