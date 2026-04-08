# Skill: 单元测试生成器 (Vue 3)

## 使用场景

用于快速生成规范的单元测试代码，适用于：
- Vue 3 组件测试
- Composables 测试
- 工具函数测试
- API 层测试
- Pinia Store 测试

## 技术栈

### 核心依赖
- Vitest（测试框架，Vite 原生支持）
- @vue/test-utils（Vue 组件测试工具）
- @vitest/coverage-v8（代码覆盖率）
- happy-dom 或 jsdom（DOM 环境）
- msw（API Mock，可选）

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
│       ├── index.vue
│       └── __tests__/
│           └── Button.test.ts        # 组件测试
├── composables/
│   └── useCounter/
│       ├── index.ts
│       └── __tests__/
│           └── useCounter.test.ts    # Composable 测试
├── stores/
│   └── user.ts
│   └── __tests__/
│       └── user.test.ts              # Store 测试
├── utils/
│   └── format/
│       ├── index.ts
│       └── __tests__/
│           └── format.test.ts        # 工具函数测试
└── __mocks__/
    └── fileMock.ts                   # 文件 Mock
```

## Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/**/__tests__/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

```typescript
// src/__tests__/setup.ts
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// 全局 Mock
config.global.mocks = {
  $t: (key: string) => key, // i18n mock
}

// ResizeObserver Mock
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// IntersectionObserver Mock
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
window.IntersectionObserver = MockIntersectionObserver as any

// matchMedia Mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// localStorage Mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
```

## 组件测试规范

### 1. 基础组件测试

```typescript
// components/Button/__tests__/Button.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../index.vue'

describe('Button', () => {
  describe('渲染', () => {
    it('应该正确渲染按钮文本', () => {
      const wrapper = mount(Button, {
        slots: {
          default: '点击我',
        },
      })

      expect(wrapper.text()).toBe('点击我')
    })

    it('应该渲染不同类型的按钮', () => {
      const wrapper = mount(Button, {
        props: { type: 'primary' },
      })

      expect(wrapper.classes()).toContain('el-button--primary')
    })

    it('应该渲染禁用状态的按钮', () => {
      const wrapper = mount(Button, {
        props: { disabled: true },
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('应该渲染加载状态的按钮', () => {
      const wrapper = mount(Button, {
        props: { loading: true },
      })

      expect(wrapper.classes()).toContain('is-loading')
    })
  })

  describe('交互', () => {
    it('点击按钮应该触发 click 事件', async () => {
      const wrapper = mount(Button)

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('禁用按钮点击不应该触发 click 事件', async () => {
      const wrapper = mount(Button, {
        props: { disabled: true },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('Props', () => {
    it('应该正确应用 size prop', () => {
      const wrapper = mount(Button, {
        props: { size: 'small' },
      })

      expect(wrapper.classes()).toContain('el-button--small')
    })

    it('应该正确应用 plain prop', () => {
      const wrapper = mount(Button, {
        props: { plain: true },
      })

      expect(wrapper.classes()).toContain('is-plain')
    })
  })
})
```

### 2. 表单组件测试

```typescript
// components/UserForm/__tests__/UserForm.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ElementPlus from 'element-plus'
import UserForm from '../index.vue'

// 创建测试用的 Pinia
const createTestPinia = () =>
  createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
  })

// 组件包装器工厂函数
const mountUserForm = (options = {}) => {
  return mount(UserForm, {
    global: {
      plugins: [ElementPlus, createTestPinia()],
      stubs: {
        // 可以 stub 子组件
      },
    },
    ...options,
  })
}

describe('UserForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('渲染', () => {
    it('应该渲染所有表单字段', () => {
      const wrapper = mountUserForm()

      expect(wrapper.find('input[placeholder="请输入用户名"]').exists()).toBe(true)
      expect(wrapper.find('input[placeholder="请输入邮箱"]').exists()).toBe(true)
    })

    it('创建模式应该显示空表单', () => {
      const wrapper = mountUserForm({
        props: { mode: 'create' },
      })

      const inputs = wrapper.findAll('input')
      inputs.forEach((input) => {
        expect(input.element.value).toBe('')
      })
    })

    it('编辑模式应该显示初始值', async () => {
      const initialData = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
      }

      const wrapper = mountUserForm({
        props: {
          mode: 'edit',
          initialData,
        },
      })

      // 等待表单初始化
      await wrapper.vm.$nextTick()

      expect(wrapper.find('input[placeholder="请输入用户名"]').element.value).toBe('testuser')
    })
  })

  describe('验证', () => {
    it('提交空表单应该显示验证错误', async () => {
      const wrapper = mountUserForm({
        props: {
          mode: 'create',
          onSubmit: mockOnSubmit,
        },
      })

      // 触发提交
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // 验证错误提示
      expect(wrapper.text()).toContain('请输入用户名')
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('无效邮箱应该显示错误', async () => {
      const wrapper = mountUserForm({
        props: { mode: 'create' },
      })

      const emailInput = wrapper.find('input[placeholder="请输入邮箱"]')
      await emailInput.setValue('invalid-email')
      await emailInput.trigger('blur')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('请输入有效的邮箱地址')
    })
  })

  describe('提交', () => {
    it('有效表单应该成功提交', async () => {
      const wrapper = mountUserForm({
        props: {
          mode: 'create',
          onSubmit: mockOnSubmit,
        },
      })

      // 填写表单
      await wrapper.find('input[placeholder="请输入用户名"]').setValue('testuser')
      await wrapper.find('input[placeholder="请输入邮箱"]').setValue('test@example.com')

      // 提交表单
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
        })
      )
    })
  })
})
```

### 3. 列表组件测试

```typescript
// components/UserList/__tests__/UserList.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ElementPlus from 'element-plus'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import UserList from '../index.vue'
import * as api from '@/api/user'

// Mock API
vi.mock('@/api/user', () => ({
  fetchUserList: vi.fn(),
  deleteUser: vi.fn(),
}))

const mockFetchUserList = api.fetchUserList as ReturnType<typeof vi.fn>
const mockDeleteUser = api.deleteUser as ReturnType<typeof vi.fn>

const createWrapper = (options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return mount(UserList, {
    global: {
      plugins: [
        ElementPlus,
        createTestingPinia({ createSpy: vi.fn }),
        [VueQueryPlugin, { queryClient }],
      ],
      stubs: {
        RouterLink: true,
      },
    },
    ...options,
  })
}

describe('UserList', () => {
  beforeEach(() => {
    mockFetchUserList.mockResolvedValue({
      list: [
        { id: '1', username: 'user1', email: 'user1@test.com', status: 'active' },
        { id: '2', username: 'user2', email: 'user2@test.com', status: 'inactive' },
      ],
      total: 2,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('数据加载', () => {
    it('应该调用 API 获取用户列表', async () => {
      createWrapper()

      await flushPromises()

      expect(mockFetchUserList).toHaveBeenCalled()
    })

    it('应该正确渲染用户列表', async () => {
      const wrapper = createWrapper()

      await flushPromises()

      expect(wrapper.text()).toContain('user1')
      expect(wrapper.text()).toContain('user2')
    })

    it('API 错误应该显示错误信息', async () => {
      mockFetchUserList.mockRejectedValue(new Error('加载失败'))

      const wrapper = createWrapper()

      await flushPromises()

      expect(wrapper.text()).toContain('加载失败')
    })
  })

  describe('删除操作', () => {
    it('点击删除应该调用删除 API', async () => {
      mockDeleteUser.mockResolvedValue(undefined)

      const wrapper = createWrapper()

      await flushPromises()

      // 找到删除按钮并点击
      const deleteButtons = wrapper.findAll('button')
      const deleteButton = deleteButtons.find((btn) => btn.text() === '删除')

      if (deleteButton) {
        await deleteButton.trigger('click')
        await flushPromises()

        // 确认弹窗
        const confirmButton = wrapper.find('.el-message-box__header-btn')
        if (confirmButton.exists()) {
          await confirmButton.trigger('click')
        }
      }

      // 注意：实际测试需要处理 Element Plus 的确认弹窗
    })
  })
})
```

## Composables 测试规范

### 1. 基础 Composable 测试

```typescript
// composables/useCounter/__tests__/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from '../index'

describe('useCounter', () => {
  describe('初始状态', () => {
    it('默认初始值应该是 0', () => {
      const { count } = useCounter()

      expect(count.value).toBe(0)
    })

    it('应该接受自定义初始值', () => {
      const { count } = useCounter(10)

      expect(count.value).toBe(10)
    })
  })

  describe('操作方法', () => {
    it('increment 应该增加计数', () => {
      const { count, increment } = useCounter()

      increment()

      expect(count.value).toBe(1)
    })

    it('decrement 应该减少计数', () => {
      const { count, decrement } = useCounter(5)

      decrement()

      expect(count.value).toBe(4)
    })

    it('reset 应该重置为初始值', () => {
      const { count, increment, reset } = useCounter(10)

      increment()
      increment()

      expect(count.value).toBe(12)

      reset()

      expect(count.value).toBe(10)
    })

    it('setCount 应该设置指定值', () => {
      const { count, setCount } = useCounter()

      setCount(100)

      expect(count.value).toBe(100)
    })
  })

  describe('边界情况', () => {
    it('min 限制应该生效', () => {
      const { count, decrement } = useCounter(0, { min: 0 })

      decrement()

      expect(count.value).toBe(0)
    })

    it('max 限制应该生效', () => {
      const { count, increment } = useCounter(10, { max: 10 })

      increment()

      expect(count.value).toBe(10)
    })
  })
})
```

### 2. Vue Query Composables 测试

```typescript
// composables/queries/useUser/__tests__/useUser.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { useUserList, useUserDetail } from '../index'
import * as api from '@/api/user'

// Mock API
vi.mock('@/api/user', () => ({
  fetchUserList: vi.fn(),
  fetchUserDetail: vi.fn(),
}))

const mockFetchUserList = api.fetchUserList as ReturnType<typeof vi.fn>
const mockFetchUserDetail = api.fetchUserDetail as ReturnType<typeof vi.fn>

// 辅助函数：创建测试组件
const createTestComponent = (composable: () => any) => {
  return defineComponent({
    setup() {
      return composable()
    },
    template: '<div></div>',
  })
}

describe('useUserList', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    mockFetchUserList.mockResolvedValue({
      list: [{ id: '1', username: 'test' }],
      total: 1,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('应该获取用户列表', async () => {
    const TestComponent = createTestComponent(() =>
      useUserList({ pageNum: 1, pageSize: 20 })
    )

    mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    })

    await flushPromises()

    expect(mockFetchUserList).toHaveBeenCalledWith({
      pageNum: 1,
      pageSize: 20,
    })
  })

  it('API 错误应该设置 isError', async () => {
    mockFetchUserList.mockRejectedValue(new Error('Network Error'))

    let result: any

    const TestComponent = defineComponent({
      setup() {
        result = useUserList({ pageNum: 1, pageSize: 20 })
        return {}
      },
      template: '<div></div>',
    })

    mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    })

    await flushPromises()

    expect(result.isError.value).toBe(true)
  })
})

describe('useUserDetail', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    mockFetchUserDetail.mockResolvedValue({
      id: '1',
      username: 'test',
    })
  })

  it('应该获取用户详情', async () => {
    let result: any

    const TestComponent = defineComponent({
      setup() {
        result = useUserDetail('1')
        return {}
      },
      template: '<div></div>',
    })

    mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    })

    await flushPromises()

    expect(result.user.value).toEqual({
      id: '1',
      username: 'test',
    })
  })

  it('id 为空时不应该发送请求', () => {
    let result: any

    const TestComponent = defineComponent({
      setup() {
        result = useUserDetail(undefined)
        return {}
      },
      template: '<div></div>',
    })

    mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    })

    expect(result.isLoading.value).toBe(false)
    expect(result.user.value).toBeUndefined()
  })
})
```

## Pinia Store 测试

```typescript
// stores/__tests__/user.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('State', () => {
    it('应该有正确的初始状态', () => {
      const store = useUserStore()

      expect(store.user).toBeNull()
      expect(store.token).toBe('')
      expect(store.isLoggedIn).toBe(false)
    })
  })

  describe('Actions', () => {
    it('login 应该设置用户信息和 token', async () => {
      const store = useUserStore()
      const mockUser = { id: '1', username: 'test' }
      const mockToken = 'test-token'

      // Mock login API
      vi.mock('@/api/auth', () => ({
        login: vi.fn().mockResolvedValue({ user: mockUser, token: mockToken }),
      }))

      await store.login({ username: 'test', password: '123456' })

      expect(store.user).toEqual(mockUser)
      expect(store.token).toBe(mockToken)
      expect(store.isLoggedIn).toBe(true)
    })

    it('logout 应该清除用户信息', () => {
      const store = useUserStore()

      // 先设置一些数据
      store.$patch({
        user: { id: '1', username: 'test' },
        token: 'test-token',
      })

      store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBe('')
      expect(store.isLoggedIn).toBe(false)
    })

    it('updateUser 应该更新用户信息', () => {
      const store = useUserStore()

      store.$patch({
        user: { id: '1', username: 'test' },
      })

      store.updateUser({ username: 'new-name' })

      expect(store.user?.username).toBe('new-name')
    })
  })

  describe('Getters', () => {
    it('displayName 应该返回用户名或默认值', () => {
      const store = useUserStore()

      expect(store.displayName).toBe('未登录')

      store.$patch({
        user: { id: '1', username: 'test' },
      })

      expect(store.displayName).toBe('test')
    })

    it('isAdmin 应该正确判断管理员角色', () => {
      const store = useUserStore()

      expect(store.isAdmin).toBe(false)

      store.$patch({
        user: { id: '1', username: 'admin', role: 'admin' },
      })

      expect(store.isAdmin).toBe(true)
    })
  })
})
```

## 工具函数测试

```typescript
// utils/format/__tests__/format.test.ts
import { describe, it, expect } from 'vitest'
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

1. 使用 Vitest 进行测试
2. 测试文件放在 `__tests__` 目录或使用 `.test.ts` 后缀
3. 包含正向测试、边界测试、错误处理测试
4. 使用 `describe` 组织测试套件
5. 使用 `beforeEach/afterEach` 处理公共逻辑
6. Mock 外部依赖（API、第三方库）
7. 测试 Composables 时使用测试组件包装
8. 异步操作使用 `flushPromises`

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
