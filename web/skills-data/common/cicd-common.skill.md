# Skill: CI/CD 配置

## 使用场景

当需要配置前端项目持续集成/持续部署时使用此Skill，包括但不限于：

- GitHub Actions 工作流
- 自动化测试流水线
- 自动化构建与部署
- 环境变量管理
- 代码质量检查（Lint、类型检查）
- 预览环境部署（PR Preview）
- 版本发布与 Changelog

## 技术栈

### 核心工具

- GitHub Actions（CI/CD 平台）
- Node.js 18+ / pnpm 8+
- Vitest / Jest（单元测试）
- Playwright / Cypress（E2E 测试）
- Vercel / 自建服务器（部署目标）

### 架构特点

- 分层流水线：lint → test → build → deploy
- 矩阵构建（多 Node 版本）
- 缓存依赖加速
- 环境隔离（dev / staging / prod）
- PR 预览自动部署

## 文件结构规范

```
.github/
├── workflows/
│   ├── ci.yml                   # 主 CI 流水线（lint + test + build）
│   ├── deploy-staging.yml       # 预发布环境部署
│   ├── deploy-production.yml    # 生产环境部署
│   ├── pr-preview.yml           # PR 预览部署
│   └── release.yml              # 版本发布
├── actions/                     # 自定义 Action（可选）
│   └── setup-node/
│       └── action.yml
└── CODEOWNERS                   # 代码审查规则
```

## 1. 主 CI 流水线

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ==================== 代码质量检查 ====================
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: ESLint
        run: pnpm run lint

      - name: TypeScript type check
        run: pnpm run type-check

  # ==================== 单元测试 ====================
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm run test:ci

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  # ==================== 构建 ====================
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm run build
        env:
          VITE_API_BASE_URL: ${{ vars.API_BASE_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 3

  # ==================== E2E 测试 ====================
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Run E2E tests
        run: pnpm run e2e:ci

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-results
          path: e2e-results/
          retention-days: 7
```

## 2. 预发布环境部署

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.STAGING_API_URL }}
          VITE_ENV: staging

      # ====== Vercel 部署 ======
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./

      # ====== 或自建服务器部署 ======
      # - name: Deploy to Server
      #   uses: easingthemes/ssh-deploy@v4
      #   env:
      #     SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
      #     REMOTE_HOST: ${{ secrets.STAGING_HOST }}
      #     REMOTE_USER: ${{ secrets.DEPLOY_USER }}
      #     SOURCE: dist/
      #     TARGET: /var/www/staging/
```

## 3. 生产环境部署

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.example.com

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.PRODUCTION_API_URL }}
          VITE_ENV: production

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Notify deployment
        if: always()
        run: |
          curl -X POST "${{ secrets.NOTIFY_WEBHOOK }}" \
            -H "Content-Type: application/json" \
            -d '{"status": "${{ job.status }}", "version": "${{ github.ref_name }}"}'
```

## 4. PR 预览部署

```yaml
# .github/workflows/pr-preview.yml
name: PR Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: pr-preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm run build
        env:
          VITE_API_BASE_URL: ${{ vars.STAGING_API_URL }}
          VITE_ENV: preview

      - name: Deploy Preview
        uses: rossjrw/pr-preview-action@v1
        with:
          source-dir: dist/
          preview-branch: gh-pages
          umbrella-dir: pr-preview
          action: auto

      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            const prNumber = context.payload.pull_request.number;
            const previewUrl = `https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/pr-preview/pr-${prNumber}/`;

            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: prNumber,
              body: `:rocket: **Preview deployed!**\n\nURL: ${previewUrl}\n\nCommit: ${{ github.sha }}`
            });
```

## 5. 版本发布

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm run build

      - name: Generate Changelog
        id: changelog
        run: |
          PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
          if [ -z "$PREV_TAG" ]; then
            CHANGES=$(git log --pretty=format:"- %s (%h)" HEAD)
          else
            CHANGES=$(git log --pretty=format:"- %s (%h)" ${PREV_TAG}..HEAD)
          fi
          echo "changes<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGES" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref_name }}
          body: |
            ## Changes
            ${{ steps.changelog.outputs.changes }}

            ## Artifacts
            - Build: Attached
          draft: false
          prerelease: ${{ contains(github.ref_name, 'beta') || contains(github.ref_name, 'alpha') }}

      - name: Upload build artifacts
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: dist.zip
          asset_name: dist-${{ github.ref_name }}.zip
          asset_content_type: application/zip
```

## 6. 环境变量管理

### GitHub Secrets 配置清单

```yaml
# 必需的 GitHub Secrets / Variables

# ==================== Secrets（敏感信息）====================
VERCEL_TOKEN: # Vercel 部署令牌
VERCEL_ORG_ID: # Vercel 组织 ID
VERCEL_PROJECT_ID: # Vercel 项目 ID
STAGING_API_URL: # 预发布 API 地址
PRODUCTION_API_URL: # 生产 API 地址
SSH_PRIVATE_KEY: # SSH 私钥（自建服务器部署）
DEPLOY_USER: # 部署用户
NOTIFY_WEBHOOK: # 通知 Webhook URL

# ==================== Variables（非敏感信息）====================
API_BASE_URL: # 默认 API 地址
```

### 应用中环境变量规范

```typescript
// env.d.ts — 环境变量类型声明
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENV: 'development' | 'staging' | 'production' | 'preview'
  readonly VITE_ERROR_REPORT: string
  readonly VITE_SENTRY_DSN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENV=development

# .env.staging
VITE_API_BASE_URL=https://staging-api.example.com
VITE_ENV=staging
VITE_ERROR_REPORT=false

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_ENV=production
VITE_ERROR_REPORT=true
```

## 7. package.json 脚本约定

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.ts,.tsx --max-warnings 0",
    "lint:fix": "eslint . --ext .vue,.ts,.tsx --fix",
    "type-check": "vue-tsc --noEmit",
    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "e2e": "playwright test",
    "e2e:ci": "playwright test --reporter=html",
    "e2e:ui": "playwright test --ui"
  }
}
```

## 输出要求

当用户要求配置 CI/CD 时，必须：

1. 提供 GitHub Actions 工作流配置
2. 包含完整流水线（lint → test → build → deploy）
3. 多环境配置（dev / staging / production）
4. PR 预览部署
5. 环境变量管理方案
6. 缓存依赖加速构建
7. 并发控制（同分支取消旧任务）
8. 部署通知

## 使用示例

### 用户输入

```
请按照 cicd-common 规范，配置项目 CI/CD。

技术栈：Vue 3 + Vite
部署目标：Vercel
环境：开发、预发布、生产
需要 PR 预览功能
```

### AI 输出

AI 会自动生成：

1. ci.yml — 主 CI 流水线（lint + test + build + e2e）
2. deploy-staging.yml — 预发布部署
3. deploy-production.yml — 生产部署（tag 触发）
4. pr-preview.yml — PR 预览 + 自动评论
5. release.yml — 版本发布 + Changelog
6. 环境变量类型声明
7. package.json scripts 约定

你只需要：

- 在 GitHub 仓库配置 Secrets 和 Variables
- 根据部署目标调整部署步骤
- 推送代码即可自动运行
- 基本上不用改就能用
