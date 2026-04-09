# Lin Skills Template Library - Web 应用

在线浏览、编辑和生成 Skill.md 文件的 Web 应用。

**线上地址**: https://web-delta-gules-16.vercel.app

## 功能模块

| 页面 | 路由 | 功能 |
|------|------|------|
| 首页 | `/` | 项目介绍、统计数据、快速导航 |
| Skill 库 | `/library` | 分类浏览、搜索筛选、一键复制/下载 |
| 编辑器 | `/editor` | Monaco Editor 在线编辑、实时预览 |
| 配置器 | `/configurator` | 3 步向导可视化生成 Skill |

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19
- **语言**: TypeScript 5
- **样式**: Tailwind CSS v4
- **编辑器**: Monaco Editor
- **状态管理**: Zustand 5
- **测试**: Vitest (单元) + Playwright (E2E)
- **部署**: Vercel

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/
│   ├── layout.tsx              # 根布局（暗黑模式）
│   ├── page.tsx                # 首页
│   ├── library/                # Skill 库浏览
│   ├── editor/                 # 在线编辑器
│   ├── configurator/           # 可视化配置器
│   └── api/skills/             # API 路由
├── components/
│   ├── Layout.tsx              # 全局布局+导航
│   ├── MonacoEditor.tsx        # Monaco 编辑器封装
│   ├── MarkdownRenderer.tsx    # Markdown 渲染
│   ├── SkillCard.tsx           # Skill 卡片
│   ├── SkillList.tsx           # Skill 列表
│   ├── SearchBar.tsx           # 搜索栏
│   └── configurator/           # 配置器组件
│       ├── TemplateSelector.tsx
│       ├── FrameworkSelector.tsx
│       ├── FieldEditor.tsx
│       └── ConfigForm.tsx
├── lib/
│   ├── skill-loader.ts         # Skill 文件加载
│   ├── template-generator.ts   # 模板生成（7种）
│   └── template-schemas.ts     # 配置 Schema
├── store/
│   ├── skillStore.ts           # Skill 状态
│   └── configStore.ts          # 配置器状态
└── types/
    ├── skill.ts                # Skill 类型
    └── configurator.ts         # 配置器类型
```

## 测试

```bash
# 单元测试
npm run test

# E2E 测试
npx playwright test
```

## 部署

```bash
# 部署到 Vercel
npx vercel --prod --yes
```
