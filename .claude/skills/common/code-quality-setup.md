---
name: code-quality-setup
description: 代码质量一键管理。未配置时自动安装 ESLint + Prettier + Husky + lint-staged，已配置时自动检查、修复并出报告。支持 Vue/React 自动检测。触发词："配置代码质量"、"检查代码质量"、"设置 ESLint"、"配置 Prettier"、"添加 Husky"、"设置 lint-staged"、"代码风格"、"自动格式化"、"pre-commit 钩子"、"lint 配置"、"检查代码规范"、"lint check"。
version: 1.0.0
---

# Code Quality: ESLint + Prettier + Husky + lint-staged

为 JavaScript/TypeScript 项目配置和检查代码质量工具链。支持 Vue 和 React 项目的自动检测与差异化配置。

## 模式判断：配置 or 检查

首先检测项目是否已配置代码质量工具：

```bash
# 检测已有配置
test -f eslint.config.js && echo "HAS_ESLINT" || true
test -f .eslintrc.js && echo "HAS_ESLINT_LEGACY" || true
test -f .prettierrc.json && echo "HAS_PRETTIER" || true
test -f .husky/pre-commit && echo "HAS_HUSKY" || true
grep -q '"lint-staged"' package.json 2>/dev/null && echo "HAS_LINT_STAGED" || true
```

**判断规则：**

- 如果 `eslint.config.js`（或 `.eslintrc.*`）和 `.prettierrc.json` 都存在 → **进入检查模式**（跳到下方「检查模式」章节）
- 如果配置不完整或不存在 → **进入配置模式**（继续下方 Step 0）

---

## 检查模式

当项目已有完整配置时，按「检查 → 自动修复 → 再次检查」三步执行：

### 第一遍：检查

先运行检查，记录问题数量：

```bash
# ESLint 检查（不修复，只记录问题）
npx eslint .
# Prettier 检查（不修复，只记录不一致文件）
npx prettier --check .
```

记录：

- ESLint：Error 数量、Warning 数量、Top 5 高频规则
- Prettier：格式不一致的文件数量和文件清单

### 自动修复

对能自动修复的问题执行修复：

```bash
# ESLint 自动修复
npx eslint . --fix
# Prettier 自动格式化
npx prettier --write .
```

### 第二遍：再次检查

修复后重新运行检查，对比修复前后差异：

```bash
# ESLint 再次检查
npx eslint .
# Prettier 再次检查
npx prettier --check .
```

### 汇总报告

输出结构化报告，包含修复前后对比：

```
## 代码质量检查报告

### 修复前 → 修复后

| 检查项 | 修复前 | 自动修复 | 修复后 |
|--------|--------|---------|--------|
| ESLint Errors | N 个 | 自动修复 M 个 | 剩余 X 个 |
| ESLint Warnings | N 个 | 自动修复 M 个 | 剩余 X 个 |
| Prettier 不一致 | N 个文件 | 全部格式化 | 0 个 |

### 仍需手动修复的问题
- [列出无法自动修复的 Error，含文件路径、行号、规则名、描述]

### 修复建议
- [针对每个无法自动修复的问题给出具体修改建议]
```

**如果第二遍检查全部通过**，报告"所有问题已自动修复，代码质量检查通过"。
**如果仍有问题**，列出剩余问题并给出手动修复建议。

---

## 配置模式

### Step 0: 项目类型检测

```bash
# 检测 Vue 项目
grep -q '"vue"' package.json && echo "VUE_DETECTED" || true
test -f vue.config.js && echo "VUE_CONFIG" || true
test -f vite.config.ts && echo "VITE_CONFIG" || true

# 检测 React 项目
grep -q '"react"' package.json && echo "REACT_DETECTED" || true
test -f next.config.* && echo "NEXTJS_DETECTED" || true

# 检测包管理器
test -f pnpm-lock.yaml && echo "USE_PNPM" || true
test -f yarn.lock && echo "USE_YARN" || true
test -f package-lock.json && echo "USE_NPM" || true
```

**判断规则：**

- 存在 `vue` 依赖或 `.vue` 文件 → **Vue 项目**
- 存在 `react` 依赖或 `.tsx/.jsx` 文件 → **React 项目**
- 两者都有（如 monorepo）→ 询问用户主框架
- 都没有 → 按 **纯 TypeScript** 项目处理

**包管理器优先级：** pnpm > yarn > npm

记录检测结果，后续步骤据此选择对应配置。

---

## Step 1: 安装依赖

根据检测结果安装对应包：

### 通用依赖（所有项目）

```bash
# npm
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier husky lint-staged

# pnpm
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-prettier husky lint-staged

# yarn
yarn add -D eslint prettier eslint-config-prettier eslint-plugin-prettier husky lint-staged
```

### Vue 项目额外依赖

```bash
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-vue vue-eslint-parser
```

### React 项目额外依赖

```bash
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
```

### 可选依赖（按需安装）

```bash
# 使用 Tailwind CSS 时
npm install -D prettier-plugin-tailwindcss

# 使用 TypeScript 时（通常已包含）
npm install -D typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

---

## Step 2: ESLint 配置

### Vue 项目 — `eslint.config.js`（ESLint v9 flat config）

```js
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import configPrettier from 'eslint-config-prettier'
import * as tsParser from '@typescript-eslint/parser'
import * as tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  {
    ignores: ['dist', 'node_modules', '*.d.ts', '.husky'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  configPrettier,
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
]
```

### React 项目 — `eslint.config.js`（ESLint v9 flat config）

```js
import js from '@eslint/js'
import * as reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import configPrettier from 'eslint-config-prettier'
import * as tsParser from '@typescript-eslint/parser'
import * as tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  {
    ignores: ['dist', 'node_modules', '*.d.ts', '.husky'],
  },
  js.configs.recommended,
  configPrettier,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tsPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
]
```

### 纯 TypeScript 项目 — `eslint.config.js`

```js
import js from '@eslint/js'
import configPrettier from 'eslint-config-prettier'
import * as tsParser from '@typescript-eslint/parser'
import * as tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  {
    ignores: ['dist', 'node_modules', '*.d.ts', '.husky'],
  },
  js.configs.recommended,
  configPrettier,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
]
```

**注意：** 如果项目使用 ESLint v8 旧格式（`.eslintrc.*`），需要先检测：

- 存在 `eslint.config.js` 或 `eslint.config.mjs` → 使用 flat config
- 存在 `.eslintrc.*` → 询问用户是否迁移到 v9 flat config，如果保留旧格式则使用 `extends` 方式

---

## Step 3: Prettier 配置

### `.prettierrc.json`

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "auto"
}
```

> 可根据团队偏好调整 `semi`（分号）、`singleQuote`（引号风格）、`printWidth` 等选项。上述为国内常见配置。

### `.prettierignore`

```
node_modules
dist
build
.next
out
.husky
pnpm-lock.yaml
package-lock.json
yarn.lock
*.min.js
*.min.css
```

---

## Step 4: Husky + lint-staged 配置

### 初始化 Husky

```bash
# 初始化（自动在 package.json 中添加 prepare 脚本）
npx husky init

# 或者手动
npm pkg set scripts.prepare="husky"
npx husky install
```

### 创建 pre-commit hook

```bash
# 创建 hook 文件
echo 'npx lint-staged' > .husky/pre-commit
```

### 配置 lint-staged — `package.json` 中添加

#### Vue 项目

```json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,html,md,json}": ["prettier --write"]
  }
}
```

#### React 项目

```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,html,md,json}": ["prettier --write"]
  }
}
```

#### 纯 TypeScript 项目

```json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.{css,html,md,json}": ["prettier --write"]
  }
}
```

---

## Step 5: package.json scripts

确保 `package.json` 包含以下 scripts：

```json
{
  "scripts": {
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky"
  }
}
```

---

## Step 6: VS Code 推荐设置（可选）

创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[javascript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[vue]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[javascriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }
}
```

创建 `.vscode/extensions.json`：

```json
{
  "recommendations": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
}
```

---

## 验证清单

配置完成后执行以下验证：

1. **ESLint 验证：** `npx eslint . --max-warnings=0`（不应有错误）
2. **Prettier 验证：** `npx prettier --check .`（所有文件格式正确）
3. **Husky 验证：** 尝试 `git commit`，确认 pre-commit hook 触发
4. **lint-staged 验证：** 修改一个文件后 commit，确认只检查暂存文件

如果验证失败：

- ESLint 报错 → 检查配置文件语法，确认依赖都已安装
- Prettier 报错 → 运行 `npm run format` 先格式化一次
- Husky 不触发 → 确认 `.husky/pre-commit` 有执行权限，重新运行 `npx husky install`

---

## Vue vs React 关键差异速查

| 配置项             | Vue                 | React                                                   |
| ------------------ | ------------------- | ------------------------------------------------------- |
| ESLint Parser      | `vue-eslint-parser` | `@typescript-eslint/parser`                             |
| 框架插件           | `eslint-plugin-vue` | `eslint-plugin-react` + `react-hooks` + `react-refresh` |
| 文件匹配           | `*.{js,ts,vue}`     | `*.{js,ts,jsx,tsx}`                                     |
| 可选 Prettier 插件 | —                   | `prettier-plugin-tailwindcss`                           |
| VS Code 格式化     | 需添加 `[vue]` 配置 | 需添加 `[javascriptreact]`/`[typescriptreact]` 配置     |

---

## 注意事项

- 如果项目已有 ESLint/Prettier 配置，先备份旧配置再覆盖
- ESLint v9 flat config 是当前推荐格式，需要 `type: "module"` 或使用 `.mjs` 扩展名
- monorepo 项目需在各子包中单独配置 lint-staged
- 如果项目不使用 TypeScript，去掉所有 `@typescript-eslint` 相关配置
