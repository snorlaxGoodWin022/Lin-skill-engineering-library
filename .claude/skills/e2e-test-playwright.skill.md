# Skill: E2E 测试生成器 (Playwright)

## 使用场景

用于快速生成端到端（E2E）测试代码，适用于：
- 页面流程测试
- 用户交互测试
- 跨浏览器兼容性测试
- 视觉回归测试
- API 集成测试

## 技术栈

### 核心依赖
- Playwright（E2E 测试框架）
- @playwright/test（测试运行器）
- TypeScript 5（类型支持）

### 测试原则
1. **模拟真实用户行为** - 测试用户实际操作流程
2. **独立可重复** - 每个测试独立运行，不依赖执行顺序
3. **快速反馈** - 合理使用并行测试和缓存
4. **稳定可靠** - 避免脆弱的选择器，使用稳定的等待策略

## 文件结构规范

```
e2e/
├── playwright.config.ts          # Playwright 配置
├── global-setup.ts               # 全局设置
├── global-teardown.ts            # 全局清理
├── auth.setup.ts                 # 认证设置
├── tests/
│   ├── auth/
│   │   ├── login.spec.ts         # 登录测试
│   │   └── register.spec.ts      # 注册测试
│   ├── dashboard/
│   │   └── overview.spec.ts      # 仪表盘测试
│   ├── user/
│   │   ├── list.spec.ts          # 用户列表测试
│   │   └── detail.spec.ts        # 用户详情测试
│   └── api/
│       └── user-api.spec.ts      # API 测试
├── page-objects/
│   ├── BasePage.ts               # 基础页面
│   ├── LoginPage.ts              # 登录页
│   ├── DashboardPage.ts          # 仪表盘页
│   └── UserListPage.ts           # 用户列表页
├── fixtures/
│   ├── index.ts                  # 自定义 fixtures
│   └── test-data.ts              # 测试数据
├── utils/
│   ├── helpers.ts                # 辅助函数
│   └── assertions.ts             # 自定义断言
└── snapshots/                    # 视觉测试快照
    └── *.png
```

## Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // 测试目录
  testDir: './tests',

  // 全局设置
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  // 并行执行
  fullyParallel: true,

  // CI 上失败时禁止 test.only
  forbidOnly: !!process.env.CI,

  // CI 上重试
  retries: process.env.CI ? 2 : 0,

  // CI 上限制并发
  workers: process.env.CI ? 1 : undefined,

  // 报告器
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // 全局设置
  use: {
    // 基础 URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // 收集失败测试的 trace
    trace: 'on-first-retry',

    // 截图
    screenshot: 'only-on-failure',

    // 视频录制
    video: 'retain-on-failure',

    // 超时
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // 浏览器配置
  projects: [
    // 认证设置
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Chromium
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    // WebKit
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    // Mobile Chrome
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },

    // Mobile Safari
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },
  ],

  // 本地开发服务器
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

## Page Object 模式

### 1. 基础页面类

```typescript
// page-objects/BasePage.ts
import { Page, Locator, expect } from '@playwright/test'

export abstract class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // 导航
  async goto(path: string = '/') {
    await this.page.goto(path)
    await this.waitForPageLoad()
  }

  // 等待页面加载
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  // 等待元素可见
  async waitForElement(locator: Locator) {
    await locator.waitFor({ state: 'visible' })
  }

  // 点击元素
  async clickElement(locator: Locator) {
    await locator.click()
  }

  // 填写输入框
  async fillInput(locator: Locator, value: string) {
    await locator.fill(value)
  }

  // 选择下拉框
  async selectOption(locator: Locator, value: string) {
    await locator.selectOption(value)
  }

  // 截图
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` })
  }

  // 断言页面包含文本
  async assertPageContains(text: string) {
    await expect(this.page.getByText(text)).toBeVisible()
  }

  // 断言 URL
  async assertUrl(path: string) {
    await expect(this.page).toHaveURL(new RegExp(path))
  }
}
```

### 2. 登录页面

```typescript
// page-objects/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  // 元素定位器
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorMessage: Locator
  readonly forgotPasswordLink: Locator

  constructor(page: Page) {
    super(page)
    this.usernameInput = page.getByLabel(/用户名|username/i)
    this.passwordInput = page.getByLabel(/密码|password/i)
    this.loginButton = page.getByRole('button', { name: /登录|login/i })
    this.errorMessage = page.getByRole('alert')
    this.forgotPasswordLink = page.getByText(/忘记密码|forgot/i)
  }

  // 导航到登录页
  async navigate() {
    await this.goto('/login')
  }

  // 执行登录
  async login(username: string, password: string) {
    await this.fillInput(this.usernameInput, username)
    await this.fillInput(this.passwordInput, password)
    await this.clickElement(this.loginButton)
  }

  // 断言登录成功
  async assertLoginSuccess() {
    await this.assertUrl('/dashboard')
  }

  // 断言登录失败
  async assertLoginFailed(message?: string) {
    await expect(this.errorMessage).toBeVisible()
    if (message) {
      await expect(this.errorMessage).toContainText(message)
    }
  }

  // 断言表单验证错误
  async assertValidationError(fieldName: string, message: string) {
    const error = this.page.getByText(message)
    await expect(error).toBeVisible()
  }
}
```

### 3. 用户列表页面

```typescript
// page-objects/UserListPage.ts
import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class UserListPage extends BasePage {
  // 元素定位器
  readonly table: Locator
  readonly searchInput: Locator
  readonly searchButton: Locator
  readonly createButton: Locator
  readonly tableRows: Locator
  readonly pagination: Locator

  constructor(page: Page) {
    super(page)
    this.table = page.getByRole('table')
    this.searchInput = page.getByPlaceholder(/搜索|search/i)
    this.searchButton = page.getByRole('button', { name: /搜索|search/i })
    this.createButton = page.getByRole('button', { name: /新建|create|add/i })
    this.tableRows = this.table.locator('tbody tr')
    this.pagination = page.getByRole('navigation')
  }

  // 导航到用户列表
  async navigate() {
    await this.goto('/users')
  }

  // 搜索用户
  async search(keyword: string) {
    await this.fillInput(this.searchInput, keyword)
    await this.clickElement(this.searchButton)
    await this.waitForPageLoad()
  }

  // 点击新建用户
  async clickCreate() {
    await this.clickElement(this.createButton)
  }

  // 获取表格行数
  async getRowCount(): Promise<number> {
    return await this.tableRows.count()
  }

  // 点击行中的操作按钮
  async clickRowAction(rowIndex: number, action: 'edit' | 'delete' | 'view') {
    const row = this.tableRows.nth(rowIndex)
    const button = row.getByRole('button', { name: new RegExp(action, 'i') })
    await button.click()
  }

  // 断言表格包含用户
  async assertTableContains(username: string) {
    const cell = this.table.getByText(username)
    await expect(cell).toBeVisible()
  }

  // 断言表格不包含用户
  async assertTableNotContains(username: string) {
    const cell = this.table.getByText(username)
    await expect(cell).not.toBeVisible()
  }

  // 断言分页信息
  async assertPagination(total: number, current: number) {
    await expect(this.pagination).toBeVisible()
    // 根据实际分页组件调整断言
  }
}
```

## 测试用例规范

### 1. 登录测试

```typescript
// tests/auth/login.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from '../../page-objects/LoginPage'

test.describe('登录功能', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.navigate()
  })

  test('应该正确显示登录表单', async ({ page }) => {
    await expect(loginPage.usernameInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.loginButton).toBeVisible()
  })

  test('使用有效凭据应该登录成功', async ({ page }) => {
    await loginPage.login('admin', 'password123')
    await loginPage.assertLoginSuccess()
  })

  test('使用无效凭据应该显示错误信息', async ({ page }) => {
    await loginPage.login('invalid', 'wrong')
    await loginPage.assertLoginFailed('用户名或密码错误')
  })

  test('空用户名应该显示验证错误', async ({ page }) => {
    await loginPage.login('', 'password123')
    await loginPage.assertValidationError('username', '请输入用户名')
  })

  test('空密码应该显示验证错误', async ({ page }) => {
    await loginPage.login('admin', '')
    await loginPage.assertValidationError('password', '请输入密码')
  })

  test('点击忘记密码应该跳转到重置页面', async ({ page }) => {
    await loginPage.forgotPasswordLink.click()
    await loginPage.assertUrl('/forgot-password')
  })
})
```

### 2. 用户列表测试

```typescript
// tests/user/list.spec.ts
import { test, expect } from '@playwright/test'
import { UserListPage } from '../../page-objects/UserListPage'
import { LoginPage } from '../../page-objects/LoginPage'

test.describe('用户列表', () => {
  let userListPage: UserListPage

  test.beforeEach(async ({ page }) => {
    // 先登录
    const loginPage = new LoginPage(page)
    await loginPage.navigate()
    await loginPage.login('admin', 'password123')

    // 导航到用户列表
    userListPage = new UserListPage(page)
    await userListPage.navigate()
  })

  test('应该正确显示用户列表', async ({ page }) => {
    const rowCount = await userListPage.getRowCount()
    expect(rowCount).toBeGreaterThan(0)
  })

  test('搜索应该筛选用户列表', async ({ page }) => {
    // 获取第一个用户名
    const firstRow = userListPage.tableRows.first()
    const username = await firstRow.locator('td').first().textContent()

    if (username) {
      await userListPage.search(username)
      await userListPage.assertTableContains(username)
    }
  })

  test('搜索不存在用户应该显示空列表', async ({ page }) => {
    await userListPage.search('不存在的用户xyz123')
    await page.waitForTimeout(1000)

    const rowCount = await userListPage.getRowCount()
    expect(rowCount).toBe(0)
  })

  test('点击新建应该打开创建表单', async ({ page }) => {
    await userListPage.clickCreate()
    await userListPage.assertUrl('/users/create')
  })

  test('点击编辑应该打开编辑表单', async ({ page }) => {
    await userListPage.clickRowAction(0, 'edit')
    await userListPage.assertUrl(/\/users\/\d+\/edit/)
  })

  test('点击删除应该显示确认对话框', async ({ page }) => {
    await userListPage.clickRowAction(0, 'delete')

    // 等待确认对话框
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText(/确认删除/)).toBeVisible()
  })
})
```

### 3. 表单测试

```typescript
// tests/user/create.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from '../../page-objects/LoginPage'

test.describe('创建用户', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.navigate()
    await loginPage.login('admin', 'password123')
    await page.goto('/users/create')
  })

  test('应该正确显示创建表单', async ({ page }) => {
    await expect(page.getByLabel(/用户名/i)).toBeVisible()
    await expect(page.getByLabel(/邮箱/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /创建|提交/i })).toBeVisible()
  })

  test('提交空表单应该显示验证错误', async ({ page }) => {
    await page.getByRole('button', { name: /创建|提交/i }).click()

    await expect(page.getByText(/请输入用户名/i)).toBeVisible()
    await expect(page.getByText(/请输入邮箱/i)).toBeVisible()
  })

  test('无效邮箱应该显示错误', async ({ page }) => {
    await page.getByLabel(/用户名/i).fill('testuser')
    await page.getByLabel(/邮箱/i).fill('invalid-email')
    await page.getByRole('button', { name: /创建|提交/i }).click()

    await expect(page.getByText(/邮箱格式不正确/i)).toBeVisible()
  })

  test('提交有效表单应该创建成功', async ({ page }) => {
    const timestamp = Date.now()

    await page.getByLabel(/用户名/i).fill(`testuser_${timestamp}`)
    await page.getByLabel(/邮箱/i).fill(`test_${timestamp}@example.com`)
    await page.getByRole('button', { name: /创建|提交/i }).click()

    // 断言跳转到列表页
    await expect(page).toHaveURL('/users')

    // 断言成功提示
    await expect(page.getByText(/创建成功/i)).toBeVisible()
  })
})
```

### 4. API 测试

```typescript
// tests/api/user-api.spec.ts
import { test, expect } from '@playwright/test'

test.describe('用户 API', () => {
  const baseUrl = '/api/users'

  test('GET /api/users 应该返回用户列表', async ({ request }) => {
    const response = await request.get(baseUrl)

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('list')
    expect(data).toHaveProperty('total')
    expect(Array.isArray(data.list)).toBe(true)
  })

  test('GET /api/users/:id 应该返回用户详情', async ({ request }) => {
    const response = await request.get(`${baseUrl}/1`)

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('username')
    expect(data).toHaveProperty('email')
  })

  test('POST /api/users 应该创建用户', async ({ request }) => {
    const timestamp = Date.now()
    const response = await request.post(baseUrl, {
      data: {
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'password123',
      },
    })

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('id')
    expect(data.username).toContain(`testuser_${timestamp}`)
  })

  test('PUT /api/users/:id 应该更新用户', async ({ request }) => {
    const response = await request.put(`${baseUrl}/1`, {
      data: {
        username: 'updated_username',
      },
    })

    expect(response.ok()).toBeTruthy()
  })

  test('DELETE /api/users/:id 应该删除用户', async ({ request }) => {
    // 先创建一个用户
    const createResponse = await request.post(baseUrl, {
      data: {
        username: 'to_delete',
        email: 'to_delete@example.com',
        password: 'password123',
      },
    })
    const { id } = await createResponse.json()

    // 删除用户
    const deleteResponse = await request.delete(`${baseUrl}/${id}`)
    expect(deleteResponse.ok()).toBeTruthy()
  })

  test('未授权请求应该返回 401', async ({ request }) => {
    const response = await request.get('/api/protected-route')
    expect(response.status()).toBe(401)
  })
})
```

## 认证设置

```typescript
// auth.setup.ts
import { test as setup, expect } from '@playwright/test'
import { LoginPage } from './page-objects/LoginPage'

const authFile = 'playwright/.auth/user.json'

setup('认证', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.navigate()
  await loginPage.login('admin', 'password123')

  // 保存认证状态
  await page.context().storageState({ path: authFile })
})
```

## 自定义 Fixtures

```typescript
// fixtures/index.ts
import { test as base } from '@playwright/test'
import { LoginPage } from '../page-objects/LoginPage'
import { UserListPage } from '../page-objects/UserListPage'

// 扩展 fixtures
export const test = base.extend<{
  loginPage: LoginPage
  userListPage: UserListPage
  loggedInPage: void
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },

  userListPage: async ({ page }, use) => {
    await use(new UserListPage(page))
  },

  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.navigate()
    await loginPage.login('admin', 'password123')
    await use()
  },
})

export { expect } from '@playwright/test'
```

## 视觉回归测试

```typescript
// tests/visual/homepage.spec.ts
import { test, expect } from '@playwright/test'

test.describe('视觉回归测试', () => {
  test('首页截图对比', async ({ page }) => {
    await page.goto('/')

    // 等待页面稳定
    await page.waitForLoadState('networkidle')

    // 全页截图对比
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixels: 100,
    })
  })

  test('登录页截图对比', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('login.png', {
      maxDiffPixels: 100,
    })
  })

  test('移动端首页截图对比', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      maxDiffPixels: 100,
    })
  })
})
```

## 测试数据管理

```typescript
// fixtures/test-data.ts
export const testUsers = {
  admin: {
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
  },
  normalUser: {
    username: 'user',
    password: 'user123',
    email: 'user@example.com',
  },
}

export const generateTestData = {
  user: (suffix?: string) => ({
    username: `testuser_${suffix || Date.now()}`,
    email: `test_${suffix || Date.now()}@example.com`,
    password: 'Test@123456',
  }),
}
```

## 输出要求

生成 E2E 测试时必须：

1. 使用 Page Object 模式组织代码
2. 使用语义化选择器（getByRole, getByLabel, getByText）
3. 包含正向测试、边界测试、错误处理测试
4. 使用 describe 组织测试套件
5. 使用 beforeEach/afterEach 处理公共逻辑
6. 添加适当的等待策略
7. API 测试使用 request context
8. 视觉测试使用截图对比

## 运行命令

```bash
# 运行所有测试
npx playwright test

# 运行指定文件
npx playwright test tests/auth/login.spec.ts

# 运行指定浏览器
npx playwright test --project=chromium

# 运行并打开报告
npx playwright test --ui

# 调试模式
npx playwright test --debug

# 生成测试代码
npx playwright codegen http://localhost:3000
```

## 使用示例

### 用户输入

```
为商品管理页面生成 E2E 测试。

页面功能：
- 商品列表（分页、搜索、筛选）
- 创建商品（名称、价格、库存、分类）
- 编辑商品
- 删除商品（确认对话框）
- 批量操作（批量删除、批量上架）
```

### AI 输出

生成完整的测试文件：
- `page-objects/ProductListPage.ts` - 列表页 Page Object
- `page-objects/ProductFormPage.ts` - 表单页 Page Object
- `tests/product/list.spec.ts` - 列表测试
- `tests/product/create.spec.ts` - 创建测试
- `tests/product/edit.spec.ts` - 编辑测试
- `tests/product/delete.spec.ts` - 删除测试
