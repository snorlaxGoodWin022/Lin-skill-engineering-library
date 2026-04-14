# Skill: Pinia 状态管理 (Vue 3)

## 使用场景

用于快速生成规范的 Pinia Store，适用于：

- 全局状态管理
- 用户信息/权限管理
- 应用配置管理
- 购物车/收藏夹等业务状态
- Vue 3 官方推荐的状态管理方案

## 技术栈

### 核心依赖

- Pinia 2.x（Vue 3 官方状态管理）
- pinia-plugin-persistedstate（持久化，可选）

### 架构特点

- Vue 3 Composition API 风格
- 完整的 TypeScript 支持
- 支持 DevTools
- 支持 SSR
- 模块化自动实现

## 文件结构规范

```
src/
├── stores/
│   ├── index.ts              # Store 统一导出
│   ├── user.ts               # 用户状态
│   ├── app.ts                # 应用全局状态
│   ├── cart.ts               # 购物车状态
│   └── types/
│       └── index.ts          # Store 类型定义
└── main.ts                   # Pinia 初始化
```

## Pinia 初始化配置

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'

const app = createApp(App)

const pinia = createPinia()
// 持久化插件
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.mount('#app')
```

## Setup Store 风格（推荐）

### 1. 简单 Store

```typescript
// stores/counter.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)

  // Getters
  const doubleCount = computed(() => count.value * 2)

  // Actions
  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  return { count, doubleCount, increment, decrement, reset }
})
```

### 2. 用户状态 Store

```typescript
// stores/user.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from './types'

export const useUserStore = defineStore(
  'user',
  () => {
    // State
    const user = ref<User | null>(null)
    const token = ref('')

    // Getters
    const isLoggedIn = computed(() => !!user.value && !!token.value)
    const displayName = computed(() => user.value?.username || '未登录')
    const isAdmin = computed(() => user.value?.role === 'admin')

    // Actions
    async function login(username: string, password: string) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })

        const data = await response.json()

        if (data.code === 0) {
          user.value = data.data.user
          token.value = data.data.token
          return { success: true }
        }

        return { success: false, message: data.message }
      } catch (error) {
        return { success: false, message: (error as Error).message }
      }
    }

    function logout() {
      user.value = null
      token.value = ''
    }

    function updateUser(data: Partial<User>) {
      if (user.value) {
        user.value = { ...user.value, ...data }
      }
    }

    async function fetchCurrentUser() {
      if (!token.value) return

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        })

        const data = await response.json()

        if (data.code === 0) {
          user.value = data.data
        }
      } catch (error) {
        logout()
      }
    }

    return {
      // State
      user,
      token,
      // Getters
      isLoggedIn,
      displayName,
      isAdmin,
      // Actions
      login,
      logout,
      updateUser,
      fetchCurrentUser,
    }
  },
  {
    persist: {
      key: 'user-store',
      storage: localStorage,
      pick: ['user', 'token'],
    },
  }
)
```

### 3. 购物车 Store

```typescript
// stores/cart.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export const useCartStore = defineStore(
  'cart',
  () => {
    // State
    const items = ref<CartItem[]>([])
    const loading = ref(false)

    // Getters
    const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

    const total = computed(() =>
      items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    )

    const isEmpty = computed(() => items.value.length === 0)

    // Actions
    function addItem(product: Omit<CartItem, 'id' | 'quantity'>, quantity = 1) {
      const existingItem = items.value.find((item) => item.productId === product.productId)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        items.value.push({
          ...product,
          id: crypto.randomUUID(),
          quantity,
        })
      }
    }

    function removeItem(id: string) {
      const index = items.value.findIndex((item) => item.id === id)
      if (index > -1) {
        items.value.splice(index, 1)
      }
    }

    function updateQuantity(id: string, quantity: number) {
      const item = items.value.find((item) => item.id === id)
      if (item) {
        item.quantity = Math.max(1, quantity)
      }
    }

    function clearCart() {
      items.value = []
    }

    async function syncToServer() {
      loading.value = true
      try {
        await fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: items.value }),
        })
      } finally {
        loading.value = false
      }
    }

    async function loadCart() {
      loading.value = true
      try {
        const response = await fetch('/api/cart')
        const data = await response.json()
        if (data.code === 0) {
          items.value = data.data
        }
      } finally {
        loading.value = false
      }
    }

    return {
      // State
      items,
      loading,
      // Getters
      itemCount,
      total,
      isEmpty,
      // Actions
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      syncToServer,
      loadCart,
    }
  },
  {
    persist: {
      key: 'cart-store',
      storage: localStorage,
      pick: ['items'],
    },
  }
)
```

### 4. 应用配置 Store

```typescript
// stores/app.ts
import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore(
  'app',
  () => {
    // State
    const theme = ref<'light' | 'dark'>('light')
    const language = ref<'zh-CN' | 'en-US'>('zh-CN')
    const sidebarCollapsed = ref(false)
    const loading = ref(false)

    // 主题切换时更新 DOM
    watch(
      theme,
      (newTheme) => {
        document.documentElement.setAttribute('data-theme', newTheme)
      },
      { immediate: true }
    )

    // Actions
    function toggleTheme() {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }

    function setLanguage(lang: 'zh-CN' | 'en-US') {
      language.value = lang
    }

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setLoading(value: boolean) {
      loading.value = value
    }

    return {
      theme,
      language,
      sidebarCollapsed,
      loading,
      toggleTheme,
      setLanguage,
      toggleSidebar,
      setLoading,
    }
  },
  {
    persist: {
      key: 'app-store',
      pick: ['theme', 'language', 'sidebarCollapsed'],
    },
  }
)
```

## Options Store 风格（备选）

```typescript
// stores/user-options.ts
import { defineStore } from 'pinia'
import type { User } from './types'

interface UserState {
  user: User | null
  token: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: '',
  }),

  getters: {
    isLoggedIn: (state) => !!state.user && !!state.token,
    displayName: (state) => state.user?.username || '未登录',
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(username: string, password: string) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.code === 0) {
        this.user = data.data.user
        this.token = data.data.token
        return { success: true }
      }

      return { success: false, message: data.message }
    },

    logout() {
      this.user = null
      this.token = ''
    },

    updateUser(data: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...data }
      }
    },
  },

  persist: {
    key: 'user-store',
    pick: ['user', 'token'],
  },
})
```

## 组件中使用

### 基础使用

```vue
<template>
  <div>
    <p>欢迎, {{ userStore.displayName }}</p>
    <p>购物车: {{ cartStore.itemCount }} 件商品</p>
    <p>总计: ¥{{ cartStore.total }}</p>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

const userStore = useUserStore()
const cartStore = useCartStore()
</script>
```

### 解构使用（storeToRefs）

```vue
<template>
  <div>
    <p>欢迎, {{ displayName }}</p>
    <button @click="logout">退出</button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// State 和 Getters 需要用 storeToRefs 保持响应式
const { user, displayName, isLoggedIn } = storeToRefs(userStore)

// Actions 直接解构
const { logout, login } = userStore
</script>
```

### 组合式使用

```vue
<template>
  <div>
    <div v-if="isLoggedIn">
      <span>{{ user?.username }}</span>
      <button @click="handleLogout">退出</button>
    </div>
    <div v-else>
      <button @click="handleLogin">登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const cartStore = useCartStore()

const { user, isLoggedIn } = storeToRefs(userStore)

async function handleLogin() {
  const result = await userStore.login('username', 'password')
  if (result.success) {
    ElMessage.success('登录成功')
    // 登录后同步购物车
    await cartStore.loadCart()
  } else {
    ElMessage.error(result.message || '登录失败')
  }
}

function handleLogout() {
  userStore.logout()
  cartStore.clearCart()
  ElMessage.success('已退出登录')
}
</script>
```

## Store 组合

```typescript
// stores/index.ts
export { useUserStore } from './user'
export { useAppStore } from './app'
export { useCartStore } from './cart'

// 组合 Store（跨 Store 通信）
// stores/root.ts
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useCartStore } from './cart'

export const useRootStore = defineStore('root', () => {
  const userStore = useUserStore()
  const cartStore = useCartStore()

  const initialized = ref(false)

  async function init() {
    // 初始化用户信息
    await userStore.fetchCurrentUser()
    // 初始化购物车
    await cartStore.loadCart()
    initialized.value = true
  }

  function reset() {
    userStore.logout()
    cartStore.clearCart()
    initialized.value = false
  }

  return { initialized, init, reset }
})
```

## 插件配置

```typescript
// stores/plugins/logger.ts
import type { PiniaPluginContext } from 'pinia'

export function piniaLogger(context: PiniaPluginContext) {
  context.store.$onAction(({ name, args, after, onError }) => {
    console.log(`[${context.store.$id}] Action "${name}" started`)

    after((result) => {
      console.log(`[${context.store.$id}] Action "${name}" finished`, result)
    })

    onError((error) => {
      console.error(`[${context.store.$id}] Action "${name}" failed`, error)
    })
  })
}

// main.ts
const pinia = createPinia()
pinia.use(piniaLogger)
```

## 测试

```typescript
// __tests__/cart.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '../cart'

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应该正确添加商品', () => {
    const cartStore = useCartStore()

    cartStore.addItem({
      productId: '1',
      name: '测试商品',
      price: 100,
    })

    expect(cartStore.items).toHaveLength(1)
    expect(cartStore.itemCount).toBe(1)
  })

  it('重复添加应该增加数量', () => {
    const cartStore = useCartStore()

    cartStore.addItem({ productId: '1', name: '商品A', price: 100 })
    cartStore.addItem({ productId: '1', name: '商品A', price: 100 }, 2)

    expect(cartStore.items).toHaveLength(1)
    expect(cartStore.itemCount).toBe(3)
  })

  it('应该正确计算总价', () => {
    const cartStore = useCartStore()

    cartStore.addItem({ productId: '1', name: '商品A', price: 100 }, 2)
    cartStore.addItem({ productId: '2', name: '商品B', price: 200 }, 1)

    expect(cartStore.total).toBe(400)
  })

  it('应该正确移除商品', () => {
    const cartStore = useCartStore()

    cartStore.addItem({ productId: '1', name: '商品A', price: 100 })
    const itemId = cartStore.items[0].id
    cartStore.removeItem(itemId)

    expect(cartStore.items).toHaveLength(0)
  })

  it('应该正确清空购物车', () => {
    const cartStore = useCartStore()

    cartStore.addItem({ productId: '1', name: '商品A', price: 100 })
    cartStore.addItem({ productId: '2', name: '商品B', price: 200 })
    cartStore.clearCart()

    expect(cartStore.isEmpty).toBe(true)
  })
})
```

## 输出要求

生成 Pinia Store 时必须：

1. 使用 Setup Store 风格（推荐）
2. 完整的 TypeScript 类型定义
3. State、Getters、Actions 分离
4. 需要 Persist 时配置 pick
5. 提供 storeToRefs 使用示例
6. 包含测试用例

## 使用示例

### 用户输入

```
生成一个订单状态管理的 Pinia Store。

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
- Setup Store 实现
- Getters 计算
- 异步 Actions
- Persist 配置
- 组件使用示例
- 测试用例
