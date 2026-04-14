# Skill: 单元测试生成器 (React)

## 使用场景

用于快速生成规范的单元测试代码，适用于：

- React 组件测试
- 自定义 Hooks 测试
- 工具函数测试
- API 层测试
- 状态管理测试

## 技术栈

### 核心依赖

- Jest 29+（测试框架）
- @testing-library/react（React 测试工具）
- @testing-library/user-event（用户交互模拟）
- @testing-library/jest-dom（DOM 断言扩展）
- msw（API Mock，可选）
- jest-environment-jsdom（浏览器环境模拟）

### 测试原则

1. **测试行为而非实现** - 关注用户能看到和操作的内容
2. **避免测试实现细节** - 不依赖组件内部状态和方法
3. **保持测试独立** - 每个测试用例独立运行，不依赖顺序
4. **覆盖关键路径** - 优先测试核心业务逻辑

## 文件结构规范

```
src/
├── components/
│   └── Button/
│       ├── index.tsx
│       └── __tests__/
│           ├── Button.test.tsx        # 组件测试
│           └── Button.snapshot.test.tsx # 快照测试
├── hooks/
│   └── useCounter/
│       ├── index.ts
│       └── __tests__/
│           └── useCounter.test.ts     # Hook 测试
├── utils/
│   └── format/
│       ├── index.ts
│       └── __tests__/
│           └── format.test.ts         # 工具函数测试
└── __mocks__/
    ├── fileMock.ts                    # 文件 Mock
    └── styleMock.ts                   # 样式 Mock
```

## Jest 配置

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}',
  ],
}
```

```typescript
// jest.setup.ts
import '@testing-library/jest-dom'

// 全局 Mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// IntersectionObserver Mock
class MockIntersectionObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}
window.IntersectionObserver = MockIntersectionObserver as any

// matchMedia Mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
```

## 组件测试规范

### 1. 基础组件测试

```typescript
// components/Button/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../index'

describe('Button', () => {
  describe('渲染', () => {
    it('应该正确渲染按钮文本', () => {
      render(<Button>点击我</Button>)
      expect(screen.getByRole('button', { name: '点击我' })).toBeInTheDocument()
    })

    it('应该渲染不同类型的按钮', () => {
      const { rerender } = render(<Button type="primary">主要按钮</Button>)
      expect(screen.getByRole('button')).toHaveClass('ant-btn-primary')

      rerender(<Button type="dashed">虚线按钮</Button>)
      expect(screen.getByRole('button')).toHaveClass('ant-btn-dashed')
    })

    it('应该渲染禁用状态的按钮', () => {
      render(<Button disabled>禁用按钮</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('应该渲染加载状态的按钮', () => {
      render(<Button loading>加载中</Button>)
      expect(screen.getByRole('button')).toHaveClass('ant-btn-loading')
    })
  })

  describe('交互', () => {
    it('点击按钮应该触发 onClick 回调', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>点击我</Button>)

      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('禁用按钮点击不应该触发 onClick', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(
        <Button disabled onClick={handleClick}>
          禁用按钮
        </Button>
      )

      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('可访问性', () => {
    it('应该有正确的 aria 属性', () => {
      render(<Button aria-label="提交表单">提交</Button>)
      expect(screen.getByLabelText('提交表单')).toBeInTheDocument()
    })
  })
})
```

### 2. 表单组件测试

```typescript
// components/UserForm/__tests__/UserForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserForm from '../index'

// 包装组件，提供必要的 Provider
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('UserForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('渲染', () => {
    it('应该渲染所有表单字段', () => {
      render(<UserForm onSubmit={mockOnSubmit} />, { wrapper })

      expect(screen.getByLabelText('用户名')).toBeInTheDocument()
      expect(screen.getByLabelText('邮箱')).toBeInTheDocument()
      expect(screen.getByLabelText('角色')).toBeInTheDocument()
    })

    it('创建模式应该显示空表单', () => {
      render(<UserForm mode="create" onSubmit={mockOnSubmit} />, { wrapper })

      expect(screen.getByLabelText('用户名')).toHaveValue('')
      expect(screen.getByLabelText('邮箱')).toHaveValue('')
    })

    it('编辑模式应该显示初始值', () => {
      const initialData = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
      }

      render(
        <UserForm mode="edit" initialData={initialData} onSubmit={mockOnSubmit} />,
        { wrapper }
      )

      expect(screen.getByLabelText('用户名')).toHaveValue('testuser')
      expect(screen.getByLabelText('邮箱')).toHaveValue('test@example.com')
    })
  })

  describe('验证', () => {
    it('提交空表单应该显示验证错误', async () => {
      const user = userEvent.setup()

      render(<UserForm mode="create" onSubmit={mockOnSubmit} />, { wrapper })

      await user.click(screen.getByRole('button', { name: '创建' }))

      await waitFor(() => {
        expect(screen.getByText('请输入用户名')).toBeInTheDocument()
        expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('无效邮箱应该显示错误', async () => {
      const user = userEvent.setup()

      render(<UserForm mode="create" onSubmit={mockOnSubmit} />, { wrapper })

      await user.type(screen.getByLabelText('用户名'), 'testuser')
      await user.type(screen.getByLabelText('邮箱'), 'invalid-email')
      await user.click(screen.getByRole('button', { name: '创建' }))

      await waitFor(() => {
        expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument()
      })
    })
  })

  describe('提交', () => {
    it('有效表单应该成功提交', async () => {
      const user = userEvent.setup()

      render(<UserForm mode="create" onSubmit={mockOnSubmit} />, { wrapper })

      await user.type(screen.getByLabelText('用户名'), 'testuser')
      await user.type(screen.getByLabelText('邮箱'), 'test@example.com')
      await user.selectOptions(screen.getByLabelText('角色'), 'admin')
      await user.click(screen.getByRole('button', { name: '创建' }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@example.com',
          role: 'admin',
        })
      })
    })
  })
})
```

### 3. 列表组件测试

```typescript
// components/UserList/__tests__/UserList.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import UserList from '../index'

// Mock API Server
const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json({
        code: 0,
        data: {
          list: [
            { id: '1', username: 'user1', email: 'user1@test.com', status: 'active' },
            { id: '2', username: 'user2', email: 'user2@test.com', status: 'inactive' },
          ],
          total: 2,
        },
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('UserList', () => {
  describe('数据加载', () => {
    it('应该显示加载状态', () => {
      render(<UserList />, { wrapper })
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('应该正确渲染用户列表', async () => {
      render(<UserList />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('user1')).toBeInTheDocument()
        expect(screen.getByText('user2')).toBeInTheDocument()
      })
    })

    it('API 错误应该显示错误信息', async () => {
      server.use(
        rest.get('/api/users', (req, res, ctx) => {
          return res(ctx.status(500))
        })
      )

      render(<UserList />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText(/加载失败/i)).toBeInTheDocument()
      })
    })
  })

  describe('搜索筛选', () => {
    it('搜索应该筛选列表', async () => {
      const user = userEvent.setup()

      server.use(
        rest.get('/api/users', (req, res, ctx) => {
          const keyword = req.url.searchParams.get('keyword')
          const list = keyword
            ? [{ id: '1', username: 'filtered', email: 'f@test.com', status: 'active' }]
            : [
                { id: '1', username: 'user1', email: 'user1@test.com', status: 'active' },
                { id: '2', username: 'user2', email: 'user2@test.com', status: 'inactive' },
              ]

          return res(ctx.json({ code: 0, data: { list, total: list.length } }))
        })
      )

      render(<UserList />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('user1')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText('搜索用户'), 'filtered')
      await user.click(screen.getByRole('button', { name: '搜索' }))

      await waitFor(() => {
        expect(screen.getByText('filtered')).toBeInTheDocument()
        expect(screen.queryByText('user1')).not.toBeInTheDocument()
      })
    })
  })
})
```

## Hooks 测试规范

### 1. 使用 renderHook

```typescript
// hooks/useCounter/__tests__/useCounter.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '../index'

describe('useCounter', () => {
  describe('初始状态', () => {
    it('默认初始值应该是 0', () => {
      const { result } = renderHook(() => useCounter())
      expect(result.current.count).toBe(0)
    })

    it('应该接受自定义初始值', () => {
      const { result } = renderHook(() => useCounter(10))
      expect(result.current.count).toBe(10)
    })
  })

  describe('操作方法', () => {
    it('increment 应该增加计数', () => {
      const { result } = renderHook(() => useCounter())

      act(() => {
        result.current.increment()
      })

      expect(result.current.count).toBe(1)
    })

    it('decrement 应该减少计数', () => {
      const { result } = renderHook(() => useCounter(5))

      act(() => {
        result.current.decrement()
      })

      expect(result.current.count).toBe(4)
    })

    it('reset 应该重置为初始值', () => {
      const { result } = renderHook(() => useCounter(10))

      act(() => {
        result.current.increment()
        result.current.increment()
      })

      expect(result.current.count).toBe(12)

      act(() => {
        result.current.reset()
      })

      expect(result.current.count).toBe(10)
    })

    it('setCount 应该设置指定值', () => {
      const { result } = renderHook(() => useCounter())

      act(() => {
        result.current.setCount(100)
      })

      expect(result.current.count).toBe(100)
    })
  })

  describe('边界情况', () => {
    it('min 限制应该生效', () => {
      const { result } = renderHook(() => useCounter(0, { min: 0 }))

      act(() => {
        result.current.decrement()
      })

      expect(result.current.count).toBe(0)
    })

    it('max 限制应该生效', () => {
      const { result } = renderHook(() => useCounter(10, { max: 10 }))

      act(() => {
        result.current.increment()
      })

      expect(result.current.count).toBe(10)
    })
  })
})
```

### 2. React Query Hooks 测试

```typescript
// hooks/queries/useUser/__tests__/useUser.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { useUserList, useUserDetail } from '../index'

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json({
        code: 0,
        data: {
          list: [{ id: '1', username: 'test' }],
          total: 1,
        },
      })
    )
  }),

  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.json({
        code: 0,
        data: { id: req.params.id, username: 'test' },
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useUserList', () => {
  it('应该获取用户列表', async () => {
    const { result } = renderHook(() => useUserList({ pageNum: 1, pageSize: 20 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.list).toHaveLength(1)
    expect(result.current.data?.list[0].username).toBe('test')
  })

  it('API 错误应该设置 isError', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    const { result } = renderHook(() => useUserList({ pageNum: 1, pageSize: 20 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useUserDetail', () => {
  it('应该获取用户详情', async () => {
    const { result } = renderHook(() => useUserDetail('1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.username).toBe('test')
  })

  it('id 为空时不应该发送请求', () => {
    const { result } = renderHook(() => useUserDetail(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})
```

## 工具函数测试

```typescript
// utils/format/__tests__/format.test.ts
import {
  formatDate,
  formatNumber,
  formatCurrency,
  truncate,
  camelToSnake,
  snakeToCamel,
} from '../index'

describe('formatDate', () => {
  it('应该正确格式化日期', () => {
    const date = new Date('2024-01-15T10:30:00')
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15')
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-01-15 10:30:00')
  })

  it('应该处理字符串日期', () => {
    expect(formatDate('2024-01-15', 'YYYY/MM/DD')).toBe('2024/01/15')
  })

  it('无效日期应该返回空字符串', () => {
    expect(formatDate('invalid', 'YYYY-MM-DD')).toBe('')
  })

  it('应该处理 null 和 undefined', () => {
    expect(formatDate(null, 'YYYY-MM-DD')).toBe('')
    expect(formatDate(undefined, 'YYYY-MM-DD')).toBe('')
  })
})

describe('formatNumber', () => {
  it('应该添加千位分隔符', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('应该处理小数', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56')
  })

  it('应该支持自定义精度', () => {
    expect(formatNumber(1234.567, { precision: 2 })).toBe('1,234.57')
  })
})

describe('formatCurrency', () => {
  it('默认应该使用人民币', () => {
    expect(formatCurrency(1234.56)).toBe('¥1,234.56')
  })

  it('应该支持其他货币', () => {
    expect(formatCurrency(1234.56, { currency: 'USD' })).toBe('$1,234.56')
  })
})

describe('truncate', () => {
  it('应该截断长文本', () => {
    expect(truncate('这是一段很长的文本内容', 5)).toBe('这是一段很...')
  })

  it('短文本不应该截断', () => {
    expect(truncate('短文本', 10)).toBe('短文本')
  })

  it('应该支持自定义省略符', () => {
    expect(truncate('这是一段很长的文本内容', 5, '…')).toBe('这是一段很…')
  })
})

describe('camelToSnake', () => {
  it('应该转换驼峰为下划线', () => {
    expect(camelToSnake('userName')).toBe('user_name')
    expect(camelToSnake('getUserById')).toBe('get_user_by_id')
  })
})

describe('snakeToCamel', () => {
  it('应该转换下划线为驼峰', () => {
    expect(snakeToCamel('user_name')).toBe('userName')
    expect(snakeToCamel('get_user_by_id')).toBe('getUserById')
  })
})
```

## 输出要求

生成单元测试时必须：

1. 使用 @testing-library/react 进行组件测试
2. 测试文件放在 `__tests__` 目录或使用 `.test.ts(x)` 后缀
3. 包含正向测试、边界测试、错误处理测试
4. 使用 `describe` 组织测试套件
5. 使用 `beforeEach/afterEach` 处理公共逻辑
6. Mock 外部依赖（API、第三方库）
7. 测试可访问性（aria 属性）
8. 异步操作使用 `waitFor` 或 `findBy*`

## 测试命名规范

```typescript
// 好的命名
it('点击提交按钮应该调用 onSubmit 回调', () => {})
it('无效邮箱应该显示错误提示', () => {})
it('空表单提交应该显示所有必填字段错误', () => {})

// 不好的命名
it('works', () => {})
it('test 1', () => {})
it('button click', () => {})
```

## 使用示例

### 用户输入

```
为用户登录表单组件生成单元测试。

组件功能：
- 用户名输入框（必填，3-20字符）
- 密码输入框（必填，至少8位，包含字母和数字）
- 记住我复选框
- 登录按钮
- 加载状态显示
- 错误提示显示
```

### AI 输出

生成完整的测试文件，包括：

- 表单渲染测试
- 验证逻辑测试
- 提交成功/失败测试
- 加载状态测试
- 可访问性测试
