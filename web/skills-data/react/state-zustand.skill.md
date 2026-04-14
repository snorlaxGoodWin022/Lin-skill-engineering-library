# Skill: Zustand 状态管理 (React)

## 使用场景

用于快速生成规范的 Zustand Store，适用于：

- 全局状态管理
- 用户信息/权限管理
- 应用配置管理
- 购物车/收藏夹等业务状态
- 替代 Redux 的轻量级方案

## 技术栈

### 核心依赖

- Zustand 4.x（状态管理）
- Immer（不可变数据，可选）
- Persist middleware（持久化，可选）

### 架构特点

- 无需 Provider 包裹
- 支持 TypeScript
- 支持中间件扩展
- 支持 DevTools
- 支持 Persist 持久化

## 文件结构规范

```
src/
├── stores/
│   ├── index.ts              # Store 统一导出
│   ├── useUserStore.ts       # 用户状态
│   ├── useAppStore.ts        # 应用全局状态
│   ├── useCartStore.ts       # 购物车状态
│   └── middlewares/
│       ├── logger.ts         # 日志中间件
│       └── persist.ts        # 持久化配置
└── types/
    └── store.d.ts            # Store 类型定义
```

## 基础 Store 模板

### 1. 简单 Store

```typescript
// stores/useCounterStore.ts
import { create } from 'zustand'

interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
```

### 2. 带 Immer 的 Store

```typescript
// stores/useUserStore.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
}

interface UserState {
  user: User | null
  token: string
  isLoggedIn: boolean

  // Actions
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
  setToken: (token: string) => void
}

export const useUserStore = create<UserState>()(
  immer((set) => ({
    user: null,
    token: '',
    isLoggedIn: false,

    login: (user, token) =>
      set((state) => {
        state.user = user
        state.token = token
        state.isLoggedIn = true
      }),

    logout: () =>
      set((state) => {
        state.user = null
        state.token = ''
        state.isLoggedIn = false
      }),

    updateUser: (data) =>
      set((state) => {
        if (state.user) {
          Object.assign(state.user, data)
        }
      }),

    setToken: (token) =>
      set((state) => {
        state.token = token
      }),
  }))
)
```

### 3. 带持久化的 Store

```typescript
// stores/useAppStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AppState {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  sidebarCollapsed: boolean

  // Actions
  toggleTheme: () => void
  setLanguage: (lang: 'zh-CN' | 'en-US') => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'zh-CN',
      sidebarCollapsed: false,

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      setLanguage: (lang) => set({ language: lang }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
    }),
    {
      name: 'app-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
```

### 4. 带 DevTools 的 Store

```typescript
// stores/useCartStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void

  // Computed
  calculateTotal: () => void
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        total: 0,
        itemCount: 0,

        addItem: (item) =>
          set(
            (state) => {
              const existingItem = state.items.find((i) => i.productId === item.productId)

              if (existingItem) {
                existingItem.quantity += item.quantity
              } else {
                state.items.push({
                  ...item,
                  id: crypto.randomUUID(),
                })
              }

              state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
            },
            false,
            'cart/addItem'
          ),

        removeItem: (id) =>
          set(
            (state) => {
              state.items = state.items.filter((i) => i.id !== id)
              state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
            },
            false,
            'cart/removeItem'
          ),

        updateQuantity: (id, quantity) =>
          set(
            (state) => {
              const item = state.items.find((i) => i.id === id)
              if (item) {
                item.quantity = Math.max(1, quantity)
              }
              state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
            },
            false,
            'cart/updateQuantity'
          ),

        clearCart: () =>
          set(
            {
              items: [],
              total: 0,
              itemCount: 0,
            },
            false,
            'cart/clearCart'
          ),

        calculateTotal: () =>
          set(
            (state) => {
              state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
            },
            false,
            'cart/calculateTotal'
          ),
      }),
      {
        name: 'cart-storage',
        partialize: (state) => ({ items: state.items }),
      }
    ),
    { name: 'CartStore' }
  )
)
```

## 异步 Actions

```typescript
// stores/useProductStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Product {
  id: string
  name: string
  price: number
  category: string
}

interface ProductState {
  products: Product[]
  loading: boolean
  error: string | null

  // Async Actions
  fetchProducts: (category?: string) => Promise<void>
  searchProducts: (keyword: string) => Promise<void>
}

export const useProductStore = create<ProductState>()(
  devtools(
    (set) => ({
      products: [],
      loading: false,
      error: null,

      fetchProducts: async (category) => {
        set({ loading: true, error: null }, false, 'products/fetchStart')

        try {
          const params = category ? { category } : {}
          const response = await fetch('/api/products', {
            method: 'POST',
            body: JSON.stringify(params),
          })
          const data = await response.json()

          set({ products: data, loading: false }, false, 'products/fetchSuccess')
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, 'products/fetchError')
        }
      },

      searchProducts: async (keyword) => {
        set({ loading: true, error: null }, false, 'products/searchStart')

        try {
          const response = await fetch('/api/products/search', {
            method: 'POST',
            body: JSON.stringify({ keyword }),
          })
          const data = await response.json()

          set({ products: data, loading: false }, false, 'products/searchSuccess')
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, 'products/searchError')
        }
      },
    }),
    { name: 'ProductStore' }
  )
)
```

## Selectors 优化

```typescript
// 使用 selector 避免不必要的重渲染
import { useUserStore } from '@/stores/useUserStore'

// ❌ 不好：组件会在任何状态变化时重渲染
const store = useUserStore()

// ✅ 好：只在 user 变化时重渲染
const user = useUserStore((state) => state.user)
const isLoggedIn = useUserStore((state) => state.isLoggedIn)

// ✅ 好：多个 selector
const { user, token } = useUserStore((state) => ({
  user: state.user,
  token: state.token,
}))

// ✅ 好：使用 shallow 比较
import { shallow } from 'zustand/shallow'

const { login, logout } = useUserStore(
  (state) => ({ login: state.login, logout: state.logout }),
  shallow
)
```

## 组件中使用

```typescript
// components/UserProfile.tsx
import { useUserStore } from '@/stores/useUserStore'
import { useAppStore } from '@/stores/useAppStore'

export default function UserProfile() {
  // 只订阅需要的状态
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const theme = useAppStore((state) => state.theme)

  if (!user) {
    return <div>请先登录</div>
  }

  return (
    <div className={`profile ${theme}`}>
      <img src={user.avatar} alt={user.username} />
      <h3>{user.username}</h3>
      <p>{user.email}</p>
      <button onClick={logout}>退出登录</button>
    </div>
  )
}
```

```typescript
// components/Cart.tsx
import { useCartStore } from '@/stores/useCartStore'

export default function Cart() {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)
  const { removeItem, updateQuantity, clearCart } = useCartStore(
    (state) => ({
      removeItem: state.removeItem,
      updateQuantity: state.updateQuantity,
      clearCart: state.clearCart,
    }),
    shallow
  )

  return (
    <div>
      <h2>购物车 ({items.length})</h2>
      {items.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, +e.target.value)}
          />
          <span>¥{item.price * item.quantity}</span>
          <button onClick={() => removeItem(item.id)}>删除</button>
        </div>
      ))}
      <div>总计: ¥{total}</div>
      <button onClick={clearCart}>清空购物车</button>
    </div>
  )
}
```

## Store 组合

```typescript
// stores/index.ts - 统一导出
export { useUserStore } from './useUserStore'
export { useAppStore } from './useAppStore'
export { useCartStore } from './useCartStore'
export { useProductStore } from './useProductStore'

// 创建组合 Store（跨 Store 通信）
import { create } from 'zustand'
import { useUserStore } from './useUserStore'
import { useCartStore } from './useCartStore'

interface RootStore {
  initialized: boolean
  init: () => Promise<void>
  reset: () => void
}

export const useRootStore = create<RootStore>((set, get) => ({
  initialized: false,

  init: async () => {
    // 初始化用户信息
    await useUserStore.getState().fetchCurrentUser()
    // 初始化购物车
    await useCartStore.getState().loadCart()

    set({ initialized: true })
  },

  reset: () => {
    useUserStore.getState().logout()
    useCartStore.getState().clearCart()
    set({ initialized: false })
  },
}))
```

## 中间件配置

```typescript
// stores/middlewares/logger.ts
import { StateCreator } from 'zustand'

type Logger = <T extends object>(f: StateCreator<T>, name?: string) => StateCreator<T>

export const logger: Logger = (f, name) => (set, get, store) => {
  type T = ReturnType<typeof f>

  const loggedSet: typeof set = (...args) => {
    const prevState = get()
    set(...args)
    const nextState = get()

    console.group(`%c ${name || 'Store'} Update`, 'color: #4CAF50')
    console.log('Prev:', prevState)
    console.log('Next:', nextState)
    console.groupEnd()
  }

  return f(loggedSet, get, store)
}

// 使用
export const useUserStore = create<UserState>()(
  logger(
    devtools(
      persist(
        (set) => ({
          // ... store implementation
        }),
        { name: 'user-storage' }
      ),
      { name: 'UserStore' }
    ),
    'UserStore'
  )
)
```

## 测试

```typescript
// __tests__/useCartStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCartStore } from '../useCartStore'

describe('useCartStore', () => {
  beforeEach(() => {
    // 重置 store
    useCartStore.setState({ items: [], total: 0, itemCount: 0 })
  })

  it('应该正确添加商品', () => {
    act(() => {
      useCartStore.getState().addItem({
        productId: '1',
        name: '测试商品',
        price: 100,
        quantity: 2,
      })
    })

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.itemCount).toBe(2)
  })

  it('重复添加应该增加数量', () => {
    act(() => {
      useCartStore.getState().addItem({
        productId: '1',
        name: '测试商品',
        price: 100,
        quantity: 1,
      })
      useCartStore.getState().addItem({
        productId: '1',
        name: '测试商品',
        price: 100,
        quantity: 2,
      })
    })

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.itemCount).toBe(3)
  })

  it('应该正确移除商品', () => {
    act(() => {
      useCartStore.getState().addItem({
        productId: '1',
        name: '测试商品',
        price: 100,
        quantity: 1,
      })
    })

    const itemId = useCartStore.getState().items[0].id

    act(() => {
      useCartStore.getState().removeItem(itemId)
    })

    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
```

## 输出要求

生成 Zustand Store 时必须：

1. 使用 TypeScript 类型定义
2. State 和 Actions 分离定义
3. 使用 Immer 处理复杂状态更新
4. 需要 DevTools 支持
5. 需要 Persist 时配置 partialize
6. 提供 Selector 使用示例
7. 包含测试用例

## 使用示例

### 用户输入

```
生成一个订单状态管理的 Zustand Store。

功能需求：
- 订单列表
- 当前选中订单
- 订单状态筛选
- 分页信息
- 加载状态

Actions:
- fetchOrders: 获取订单列表
- selectOrder: 选中订单
- updateOrderStatus: 更新订单状态
- setFilter: 设置筛选条件
- setPage: 设置分页
```

### AI 输出

生成完整的 Store 文件，包括：

- TypeScript 类型定义
- 状态初始化
- 同步/异步 Actions
- DevTools 和 Persist 配置
- 使用示例
- 测试用例
