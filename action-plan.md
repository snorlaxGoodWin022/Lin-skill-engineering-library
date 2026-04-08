# Skills Template Library - 方案与进度

## 项目目标

打造面向前端开发者的 **Skill.md 模板库**，包含 20+ 现成 Skill 模板、在线编辑器和 Chrome 插件。

### 技术栈
- **Web 应用**: Next.js 14 + TypeScript + Monaco Editor
- **Skill 库**: React + Vue3 双栈支持
- **插件**: Chrome Extension

---

## 进度总览

| 阶段 | 内容 | 状态 | 进度 |
|------|------|------|------|
| Phase 0 | 基础 Skill 库搭建 | ✅ 完成 | 100% |
| Phase 1 | Skill 模板扩展 (20+) | 🔄 进行中 | 80% |
| Phase 2 | 在线编辑器 Web 应用 | ⏳ 待开始 | 0% |
| Phase 3 | 可视化配置器 | ⏳ 待开始 | 0% |
| Phase 4 | Chrome 插件 | ⏳ 待开始 | 0% |

---

## Phase 0: 基础 Skill 库 ✅

### 已完成内容

#### Skill 文件 (16个)
| 文件名 | 框架 | 用途 |
|--------|------|------|
| `form-generator-react.skill.md` | React | 表单组件生成 (RHF + Zod + AntD) |
| `form-generator-vue3.skill.md` | Vue3 | 表单组件生成 |
| `crud-template-react-skill.md` | React | CRUD 模块模板 |
| `crud-template-vue3-skill.md` | Vue3 | CRUD 模块模板 |
| `code-standard-react.skill.md` | React | 代码规范标准 |
| `code-standrad-vue3.skill.md` | Vue3 | 代码规范标准 |
| `component-wrapper-react.skill.md` | React | UI 组件封装 |
| `component-wrapper-vue3.skill.md` | Vue3 | UI 组件封装 |
| `api-layer-react.skill.md` | React | API 层封装 (Axios + React Query) |
| `api-layer-vue3.skill.md` | Vue3 | API 层封装 (Axios + Vue Query) |
| `unit-test-react.skill.md` | React | 单元测试 (Jest + Testing Library) |
| `unit-test-vue3.skill.md` | Vue3 | 单元测试 (Vitest) |
| `state-zustand.skill.md` | React | 状态管理 (Zustand) |
| `state-pinia.skill.md` | Vue3 | 状态管理 (Pinia) |
| `hooks-react.skill.md` | React | 自定义 Hooks 模板 |
| `composables-vue3.skill.md` | Vue3 | Composables 模板 |

#### 配套资源
- ✅ `examples/` - 可运行代码示例
- ✅ `templates/` - Skill 编写模板
- ✅ `docs/` - 文档体系
- ✅ `tools/` - CLI 工具 (验证/生成)
- ✅ GitHub 仓库已推送

---

## Phase 1: Skill 模板扩展 🔄

### 目标
扩展至 20+ 个 Skill 模板，覆盖前端开发全流程。

### 待补充 Skill 列表

#### 1. ~~API 层代码生成~~ ✅ 已完成
| 文件名 | 框架 | 状态 |
|--------|------|------|
| `api-layer-react.skill.md` | React | ✅ |
| `api-layer-vue3.skill.md` | Vue3 | ✅ |

#### 2. ~~单元测试生成~~ ✅ 已完成
| 文件名 | 框架 | 状态 |
|--------|------|------|
| `unit-test-react.skill.md` | React | ✅ |
| `unit-test-vue3.skill.md` | Vue3 | ✅ |

#### 3. ~~状态管理~~ ✅ 已完成
| 文件名 | 框架 | 状态 |
|--------|------|------|
| `state-zustand.skill.md` | React | ✅ |
| `state-pinia.skill.md` | Vue3 | ✅ |

#### 4. ~~Hooks / Composables~~ ✅ 已完成
| 文件名 | 框架 | 状态 |
|--------|------|------|
| `hooks-react.skill.md` | React | ✅ |
| `composables-vue3.skill.md` | Vue3 | ✅ |

#### 5. 路由配置 (待补充)
| 文件名 | 框架 | 说明 |
|--------|------|------|
| `router-react.skill.md` | React | React Router v6 配置 |
| `router-vue3.skill.md` | Vue3 | Vue Router 配置 |

#### 6. 工具函数 (待补充)
| 文件名 | 说明 |
|--------|------|
| `utils-common.skill.md` | 通用工具函数 (日期/格式化/校验) |
| `utils-request.skill.md` | 请求工具函数 |

#### 7. 其他 (待补充)
| 文件名 | 说明 |
|--------|------|
| `typescript-types.skill.md` | TypeScript 类型定义模板 |
| `error-handling.skill.md` | 错误处理模板 |
| `i18n.skill.md` | 国际化配置 |

### 进度追踪

```
[████████████████░░░░] 80% (16/20)

✅ 已完成: form-generator, crud-template, code-standard, component-wrapper, api-layer, unit-test, state, hooks (x2框架)
📝 待开始: router, utils, types
```

### 详细任务清单

- [x] `api-layer-react.skill.md` - API 层生成 (React) ✅ 2026-04-08
- [x] `api-layer-vue3.skill.md` - API 层生成 (Vue3) ✅ 2026-04-08
- [x] `unit-test-react.skill.md` - 单元测试 (React) ✅ 2026-04-08
- [x] `unit-test-vue3.skill.md` - 单元测试 (Vue3) ✅ 2026-04-08
- [x] `state-zustand.skill.md` - Zustand 状态管理 ✅ 2026-04-08
- [x] `state-pinia.skill.md` - Pinia 状态管理 ✅ 2026-04-08
- [x] `hooks-react.skill.md` - 自定义 Hooks ✅ 2026-04-08
- [x] `composables-vue3.skill.md` - Composables ✅ 2026-04-08
- [ ] `router-react.skill.md` - React Router 配置
- [ ] `router-vue3.skill.md` - Vue Router 配置
- [ ] `utils-common.skill.md` - 通用工具函数
- [ ] `typescript-types.skill.md` - TS 类型定义

---

## Phase 2: 在线编辑器 Web 应用 ⏳

### 技术方案

```
tech-stack/
├── Next.js 14 (App Router)
├── TypeScript 5
├── Monaco Editor (代码编辑器)
├── Tailwind CSS (样式)
├── Zustand (状态管理)
└── next-mdx-remote (Markdown 渲染)
```

### 功能模块

#### 2.1 Skill 编辑器
- Monaco Editor 集成
- Markdown 语法高亮
- Skill 模板快速插入
- 实时预览

#### 2.2 Skill 库浏览
- 分类展示所有 Skill
- 搜索/筛选功能
- 一键复制/下载

#### 2.3 导入/导出
- 导出为 .skill.md 文件
- 导入现有 Skill 文件
- GitHub 同步 (可选)

### 目录结构

```
web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # 首页
│   ├── editor/
│   │   └── page.tsx             # Skill 编辑器
│   ├── library/
│   │   └── page.tsx             # Skill 库浏览
│   └── preview/
│       └── page.tsx             # Skill 预览
├── components/
│   ├── Editor/
│   │   ├── MonacoWrapper.tsx
│   │   ├── Toolbar.tsx
│   │   └── TemplatePicker.tsx
│   ├── Library/
│   │   ├── SkillCard.tsx
│   │   ├── SkillList.tsx
│   │   └── SearchBar.tsx
│   └── common/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Layout.tsx
├── lib/
│   ├── skill-parser.ts          # Skill 文件解析
│   ├── skill-generator.ts       # Skill 文件生成
│   └── templates.ts             # 模板数据
├── store/
│   └── useSkillStore.ts         # Zustand Store
└── types/
    └── skill.ts                 # 类型定义
```

### 任务清单

- [ ] 初始化 Next.js 项目
- [ ] 集成 Monaco Editor
- [ ] 实现 Skill 编辑器基础功能
- [ ] 实现 Skill 库浏览页面
- [ ] 实现导入/导出功能
- [ ] 响应式设计适配
- [ ] 部署到 Vercel

---

## Phase 3: 可视化配置器 ⏳

### 功能描述
通过表单驱动的界面生成 Skill，无需手写 Markdown。

### 配置流程

```
1. 选择模板类型 (表单/CRUD/API/测试...)
2. 选择技术栈 (React/Vue3)
3. 配置字段/选项
4. 预览生成的 Skill
5. 导出/复制
```

### 界面设计

```
┌─────────────────────────────────────────────────┐
│  Skill 配置器                                    │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌───────────────────────────┐ │
│  │ 模板类型    │  │ 配置面板                  │ │
│  │ ○ 表单生成  │  │ ┌─────────────────────┐   │ │
│  │ ○ CRUD模板  │  │ │ 字段配置            │   │ │
│  │ ○ API层     │  │ │ + 添加字段          │   │ │
│  │ ○ 单元测试  │  │ └─────────────────────┘   │ │
│  │             │  │                           │ │
│  │ 技术栈      │  │ ┌─────────────────────┐   │ │
│  │ ☑ React    │  │ │ 预览                │   │ │
│  │ ☑ Vue3     │  │ │ [生成的Skill内容]   │   │ │
│  └─────────────┘  │ └─────────────────────┘   │ │
│                   └───────────────────────────┘ │
│  [生成 Skill]  [复制]  [下载]                    │
└─────────────────────────────────────────────────┘
```

### 任务清单

- [ ] 设计配置表单组件
- [ ] 实现各类型模板的配置 Schema
- [ ] 实现配置到 Skill 的转换逻辑
- [ ] 实现实时预览
- [ ] 表单校验与错误提示

---

## Phase 4: Chrome 插件 ⏳

### 功能描述
浏览器插件，一键导入 Skill 到 Claude Web。

### 核心功能

#### 4.1 Skill 快速导入
- 从 Web 应用导入
- 从本地文件导入
- 从 GitHub 仓库导入

#### 4.2 Claude 集成
- 检测 Claude Web 页面
- 一键注入 Skill 到对话上下文
- Skill 管理面板

### 目录结构

```
extension/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.tsx
│   └── popup.css
├── content/
│   ├── content.ts              # 注入 Claude 页面
│   └── claude-integration.ts   # Claude DOM 操作
├── background/
│   └── background.ts           # Service Worker
├── options/
│   ├── options.html
│   └── options.tsx             # 设置页面
├── lib/
│   ├── skill-manager.ts        # Skill 存储/读取
│   └── storage.ts              # Chrome Storage 封装
├── components/
│   ├── SkillList.tsx
│   ├── SkillImporter.tsx
│   └── QuickActions.tsx
└── assets/
    └── icon*.png
```

### 任务清单

- [ ] 创建 Chrome Extension 项目
- [ ] 实现 Popup 界面
- [ ] 实现 Skill 存储管理
- [ ] 实现 Claude 页面集成 (Content Script)
- [ ] 实现一键导入功能
- [ ] 打包发布到 Chrome Web Store

---

## 里程碑时间线

```
2026 Q2
├── 4月: Phase 1 完成 (20+ Skills)
├── 5月: Phase 2 MVP (基础编辑器)
└── 6月: Phase 2 完成 + Phase 3 开始

2026 Q3
├── 7月: Phase 3 完成 (可视化配置器)
├── 8月: Phase 4 MVP (Chrome 插件)
└── 9月: 项目完整发布
```

---

## 下一步行动

### 本周任务 (优先级排序)

1. **创建 `state-zustand.skill.md`** - React 状态管理 (Zustand)
2. **创建 `state-pinia.skill.md`** - Vue3 状态管理 (Pinia)
3. **创建 `hooks-react.skill.md`** - 自定义 Hooks 模板
4. **创建 `composables-vue3.skill.md`** - Composables 模板
5. **初始化 Next.js 项目** - Web 应用脚手架 (Phase 2)

---

## 仓库信息

- **GitHub**: `git@github.com:snorlaxGoodWin022/Lin-skill-engineering-library.git`
- **本地路径**: `D:\CodeProject\Lin_AI_Skill\skill-library`

---

**最后更新**: 2026-04-08
**当前阶段**: Phase 1 - Skill 模板扩展 (80% 完成，16/20 Skills)
