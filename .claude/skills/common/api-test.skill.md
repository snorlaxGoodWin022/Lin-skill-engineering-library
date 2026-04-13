# Skill: API 测试生成器

## 使用场景

用于快速生成 API 接口测试代码，适用于：
- RESTful API 测试
- 接口集成测试
- 契约测试
- 性能基准测试

## 技术栈

### 核心依赖
- Jest/Vitest（测试框架）
- Supertest（HTTP 断言库）
- TypeScript 5（类型支持）

### 测试原则
1. **测试接口契约** - 验证请求和响应格式
2. **覆盖所有场景** - 成功、失败、边界、异常
3. **独立可重复** - 每个测试独立，可重复运行
4. **数据隔离** - 使用测试数据库或 Mock

## 文件结构规范

```
tests/
├── api/
│   ├── setup.ts                 # 测试环境设置
│   ├── teardown.ts              # 测试环境清理
│   ├── helpers/
│   │   ├── request.ts           # 请求封装
│   │   ├── auth.ts              # 认证辅助
│   │   └── fixtures.ts          # 测试数据
│   ├── unit/
│   │   ├── user.test.ts         # 用户接口测试
│   │   ├── auth.test.ts         # 认证接口测试
│   │   └── product.test.ts      # 商品接口测试
│   └── integration/
│       ├── order-flow.test.ts   # 订单流程测试
│       └── payment-flow.test.ts # 支付流程测试
└── __mocks__/
    ├── db.ts                    # 数据库 Mock
    └── services.ts              # 服务 Mock
```

## 基础配置

### 1. Jest 配置

```typescript
// jest.config.ts
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/api'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/api/setup.ts'],
  globalTeardown: '<rootDir>/tests/api/teardown.ts',
  coverageDirectory: 'coverage/api',
  collectCoverageFrom: [
    'src/api/**/*.ts',
    '!src/api/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

export default config
```

### 2. 测试环境设置

```typescript
// tests/api/setup.ts
import supertest from 'supertest'
import app from '../../src/app'
import { connectTestDB, clearTestDB, disconnectTestDB } from './helpers/db'

// 请求客户端
export const request = supertest(app)

// 全局设置
beforeAll(async () => {
  await connectTestDB()
})

// 每个测试后清理
afterEach(async () => {
  await clearTestDB()
})

// 全局清理
afterAll(async () => {
  await disconnectTestDB()
})

// 增加超时时间
jest.setTimeout(30000)
```

### 3. 请求封装

```typescript
// tests/api/helpers/request.ts
import supertest, { Response } from 'supertest'
import app from '../../../src/app'

const client = supertest(app)

export interface RequestOptions {
  token?: string
  headers?: Record<string, string>
}

/**
 * GET 请求
 */
export async function get(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  let req = client.get(url)

  if (options.token) {
    req = req.set('Authorization', `Bearer ${options.token}`)
  }

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      req = req.set(key, value)
    })
  }

  return req
}

/**
 * POST 请求
 */
export async function post(
  url: string,
  body: any,
  options: RequestOptions = {}
): Promise<Response> {
  let req = client.post(url).send(body)

  if (options.token) {
    req = req.set('Authorization', `Bearer ${options.token}`)
  }

  return req
}

/**
 * PUT 请求
 */
export async function put(
  url: string,
  body: any,
  options: RequestOptions = {}
): Promise<Response> {
  let req = client.put(url).send(body)

  if (options.token) {
    req = req.set('Authorization', `Bearer ${options.token}`)
  }

  return req
}

/**
 * DELETE 请求
 */
export async function del(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  let req = client.delete(url)

  if (options.token) {
    req = req.set('Authorization', `Bearer ${options.token}`)
  }

  return req
}

/**
 * 断言响应状态码
 */
export function assertStatus(response: Response, expected: number) {
  expect(response.status).toBe(expected)
}

/**
 * 断言响应包含属性
 */
export function assertHasProperties(response: Response, properties: string[]) {
  properties.forEach((prop) => {
    expect(response.body).toHaveProperty(prop)
  })
}

/**
 * 断言响应错误信息
 */
export function assertErrorMessage(response: Response, message: string) {
  expect(response.body).toHaveProperty('message')
  expect(response.body.message).toContain(message)
}
```

### 4. 认证辅助

```typescript
// tests/api/helpers/auth.ts
import { post } from './request'
import { Response } from 'supertest'

export interface TestUser {
  id: string
  username: string
  email: string
  token: string
}

/**
 * 创建测试用户并获取 Token
 */
export async function createTestUser(userData?: Partial<{
  username: string
  email: string
  password: string
}>): Promise<TestUser> {
  const timestamp = Date.now()
  const defaultData = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'Test@123456',
  }

  const data = { ...defaultData, ...userData }

  // 注册用户
  const registerRes = await post('/api/auth/register', data)
  if (registerRes.status !== 201) {
    throw new Error('Failed to create test user')
  }

  // 登录获取 Token
  const loginRes = await post('/api/auth/login', {
    username: data.username,
    password: data.password,
  })

  if (loginRes.status !== 200) {
    throw new Error('Failed to login test user')
  }

  return {
    id: registerRes.body.data.id,
    username: data.username,
    email: data.email,
    token: loginRes.body.data.token,
  }
}

/**
 * 创建管理员用户
 */
export async function createAdminUser(): Promise<TestUser> {
  return createTestUser({ username: 'admin_test', role: 'admin' })
}

/**
 * 获取无效 Token
 */
export function getInvalidToken(): string {
  return 'invalid_token_xxx'
}

/**
 * 获取过期 Token
 */
export function getExpiredToken(): string {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired'
}
```

### 5. 测试数据

```typescript
// tests/api/helpers/fixtures.ts
export const fixtures = {
  user: {
    valid: {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test@123456',
    },
    invalid: {
      emptyUsername: {
        username: '',
        email: 'test@example.com',
        password: 'Test@123456',
      },
      invalidEmail: {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Test@123456',
      },
      weakPassword: {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
      },
    },
  },

  product: {
    valid: {
      name: 'Test Product',
      price: 99.99,
      stock: 100,
      category: 'electronics',
    },
    invalid: {
      negativePrice: {
        name: 'Test Product',
        price: -10,
        stock: 100,
      },
      negativeStock: {
        name: 'Test Product',
        price: 99.99,
        stock: -5,
      },
    },
  },
}

/**
 * 生成唯一测试数据
 */
export function generateUnique(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}
```

## 测试用例规范

### 1. 认证接口测试

```typescript
// tests/api/unit/auth.test.ts
import { post, get, assertStatus, assertHasProperties, assertErrorMessage } from '../helpers/request'
import { createTestUser, getInvalidToken } from '../helpers/auth'

describe('认证接口', () => {
  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const timestamp = Date.now()
      const response = await post('/api/auth/register', {
        username: `newuser_${timestamp}`,
        email: `new_${timestamp}@example.com`,
        password: 'Test@123456',
      })

      assertStatus(response, 201)
      assertHasProperties(response, ['data'])
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('username')
    })

    it('重复注册应该返回错误', async () => {
      const userData = {
        username: `duplicate_${Date.now()}`,
        email: `duplicate_${Date.now()}@example.com`,
        password: 'Test@123456',
      }

      // 第一次注册
      await post('/api/auth/register', userData)

      // 第二次注册
      const response = await post('/api/auth/register', userData)

      assertStatus(response, 409)
      assertErrorMessage(response, '已存在')
    })

    it('无效邮箱应该返回验证错误', async () => {
      const response = await post('/api/auth/register', {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Test@123456',
      })

      assertStatus(response, 400)
      assertErrorMessage(response, '邮箱')
    })

    it('密码太短应该返回验证错误', async () => {
      const response = await post('/api/auth/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
      })

      assertStatus(response, 400)
      assertErrorMessage(response, '密码')
    })
  })

  describe('POST /api/auth/login', () => {
    it('正确凭据应该返回 Token', async () => {
      // 先创建用户
      const user = await createTestUser()

      // 登录
      const response = await post('/api/auth/login', {
        username: user.username,
        password: 'Test@123456',
      })

      assertStatus(response, 200)
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data).toHaveProperty('user')
    })

    it('错误密码应该返回 401', async () => {
      const user = await createTestUser()

      const response = await post('/api/auth/login', {
        username: user.username,
        password: 'wrongpassword',
      })

      assertStatus(response, 401)
      assertErrorMessage(response, '密码错误')
    })

    it('不存在的用户应该返回 401', async () => {
      const response = await post('/api/auth/login', {
        username: 'nonexistent',
        password: 'password',
      })

      assertStatus(response, 401)
      assertErrorMessage(response, '用户不存在')
    })
  })

  describe('GET /api/auth/me', () => {
    it('有效 Token 应该返回用户信息', async () => {
      const user = await createTestUser()

      const response = await get('/api/auth/me', { token: user.token })

      assertStatus(response, 200)
      expect(response.body.data.username).toBe(user.username)
    })

    it('无 Token 应该返回 401', async () => {
      const response = await get('/api/auth/me')

      assertStatus(response, 401)
    })

    it('无效 Token 应该返回 401', async () => {
      const response = await get('/api/auth/me', { token: getInvalidToken() })

      assertStatus(response, 401)
    })
  })
})
```

### 2. CRUD 接口测试

```typescript
// tests/api/unit/user.test.ts
import {
  get, post, put, del,
  assertStatus, assertHasProperties, assertErrorMessage
} from '../helpers/request'
import { createTestUser, createAdminUser } from '../helpers/auth'
import { fixtures, generateUnique } from '../helpers/fixtures'

describe('用户接口', () => {
  let adminUser: any
  let normalUser: any

  beforeEach(async () => {
    adminUser = await createAdminUser()
    normalUser = await createTestUser()
  })

  describe('GET /api/users', () => {
    it('应该返回用户列表', async () => {
      const response = await get('/api/users', { token: adminUser.token })

      assertStatus(response, 200)
      expect(response.body.data).toHaveProperty('list')
      expect(response.body.data).toHaveProperty('total')
      expect(Array.isArray(response.body.data.list)).toBe(true)
    })

    it('应该支持分页', async () => {
      const response = await get('/api/users?pageNum=1&pageSize=10', {
        token: adminUser.token,
      })

      assertStatus(response, 200)
      expect(response.body.data.pageNum).toBe(1)
      expect(response.body.data.pageSize).toBe(10)
    })

    it('应该支持搜索', async () => {
      const response = await get(`/api/users?keyword=${normalUser.username}`, {
        token: adminUser.token,
      })

      assertStatus(response, 200)
      expect(response.body.data.list.length).toBeGreaterThan(0)
    })

    it('普通用户访问应该返回 403', async () => {
      const response = await get('/api/users', { token: normalUser.token })

      assertStatus(response, 403)
    })
  })

  describe('GET /api/users/:id', () => {
    it('应该返回用户详情', async () => {
      const response = await get(`/api/users/${normalUser.id}`, {
        token: adminUser.token,
      })

      assertStatus(response, 200)
      expect(response.body.data.id).toBe(normalUser.id)
    })

    it('不存在的用户应该返回 404', async () => {
      const response = await get('/api/users/nonexistent-id', {
        token: adminUser.token,
      })

      assertStatus(response, 404)
    })
  })

  describe('POST /api/users', () => {
    it('应该创建用户', async () => {
      const response = await post('/api/users', {
        username: generateUnique('newuser'),
        email: `${generateUnique('test')}@example.com`,
        password: 'Test@123456',
        role: 'user',
      }, { token: adminUser.token })

      assertStatus(response, 201)
      assertHasProperties(response, ['data'])
      expect(response.body.data).toHaveProperty('id')
    })

    it('重复用户名应该返回错误', async () => {
      const response = await post('/api/users', {
        username: normalUser.username,
        email: 'another@example.com',
        password: 'Test@123456',
      }, { token: adminUser.token })

      assertStatus(response, 409)
    })

    it('无效数据应该返回验证错误', async () => {
      const response = await post('/api/users', {
        username: '',
        email: 'invalid',
      }, { token: adminUser.token })

      assertStatus(response, 400)
    })
  })

  describe('PUT /api/users/:id', () => {
    it('应该更新用户', async () => {
      const response = await put(`/api/users/${normalUser.id}`, {
        username: 'updated_username',
      }, { token: adminUser.token })

      assertStatus(response, 200)
      expect(response.body.data.username).toBe('updated_username')
    })

    it('更新不存在的用户应该返回 404', async () => {
      const response = await put('/api/users/nonexistent-id', {
        username: 'test',
      }, { token: adminUser.token })

      assertStatus(response, 404)
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('应该删除用户', async () => {
      const userToDelete = await createTestUser()

      const response = await del(`/api/users/${userToDelete.id}`, {
        token: adminUser.token,
      })

      assertStatus(response, 200)

      // 验证已删除
      const getResponse = await get(`/api/users/${userToDelete.id}`, {
        token: adminUser.token,
      })
      assertStatus(getResponse, 404)
    })

    it('删除不存在的用户应该返回 404', async () => {
      const response = await del('/api/users/nonexistent-id', {
        token: adminUser.token,
      })

      assertStatus(response, 404)
    })
  })
})
```

### 3. 集成测试

```typescript
// tests/api/integration/order-flow.test.ts
import { get, post, put, del, assertStatus } from '../helpers/request'
import { createTestUser } from '../helpers/auth'

describe('订单流程集成测试', () => {
  let user: any
  let productId: string
  let orderId: string

  beforeAll(async () => {
    user = await createTestUser()
  })

  describe('完整订单流程', () => {
    it('步骤1: 创建商品', async () => {
      const response = await post('/api/products', {
        name: 'Test Product',
        price: 99.99,
        stock: 100,
      }, { token: user.token })

      assertStatus(response, 201)
      productId = response.body.data.id
    })

    it('步骤2: 添加到购物车', async () => {
      const response = await post('/api/cart/items', {
        productId,
        quantity: 2,
      }, { token: user.token })

      assertStatus(response, 200)
    })

    it('步骤3: 查看购物车', async () => {
      const response = await get('/api/cart', { token: user.token })

      assertStatus(response, 200)
      expect(response.body.data.items).toHaveLength(1)
      expect(response.body.data.items[0].productId).toBe(productId)
    })

    it('步骤4: 创建订单', async () => {
      const response = await post('/api/orders', {
        items: [{ productId, quantity: 2 }],
        address: 'Test Address',
      }, { token: user.token })

      assertStatus(response, 201)
      orderId = response.body.data.id
    })

    it('步骤5: 查看订单详情', async () => {
      const response = await get(`/api/orders/${orderId}`, { token: user.token })

      assertStatus(response, 200)
      expect(response.body.data.status).toBe('pending')
    })

    it('步骤6: 支付订单', async () => {
      const response = await post(`/api/orders/${orderId}/pay`, {}, {
        token: user.token,
      })

      assertStatus(response, 200)
      expect(response.body.data.status).toBe('paid')
    })

    it('步骤7: 验证库存扣减', async () => {
      const response = await get(`/api/products/${productId}`, {
        token: user.token,
      })

      assertStatus(response, 200)
      expect(response.body.data.stock).toBe(98) // 100 - 2
    })
  })
})
```

## 输出要求

生成 API 测试时必须：

1. 包含请求/响应类型定义
2. 使用统一的请求封装
3. 覆盖成功、失败、边界场景
4. 使用 describe 组织测试套件
5. 使用 beforeEach/afterEach 处理公共逻辑
6. 断言响应状态码和数据结构
7. 测试认证和授权
8. 集成测试验证完整流程

## 运行命令

```bash
# 运行所有 API 测试
npm run test:api

# 运行指定文件
npm run test:api -- user.test.ts

# 带覆盖率
npm run test:api -- --coverage

# 监听模式
npm run test:api -- --watch
```

## 使用示例

### 用户输入

```
为商品 API 生成测试用例。

接口列表：
- GET /api/products - 商品列表（分页、搜索、分类筛选）
- GET /api/products/:id - 商品详情
- POST /api/products - 创建商品（需要管理员权限）
- PUT /api/products/:id - 更新商品
- DELETE /api/products/:id - 删除商品

商品字段：
- id: string
- name: string
- description: string
- price: number
- stock: number
- category: string
- status: 'active' | 'inactive'
```

### AI 输出

生成完整的测试文件：
- `tests/api/unit/product.test.ts` - CRUD 测试
- `tests/api/helpers/product-fixtures.ts` - 测试数据
