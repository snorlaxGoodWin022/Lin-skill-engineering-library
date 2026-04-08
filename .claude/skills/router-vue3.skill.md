# Skill: Vue Router 配置 (Vue 3)

## 使用场景

用于快速生成规范的 Vue Router 配置，适用于：
- 路由配置管理
- 路由守卫/权限控制
- 嵌套路由配置
- 动态路由生成
- 面包屑导航

## 技术栈

### 核心依赖
- Vue Router 4.x（路由库）
- TypeScript 5（类型支持）
- Vue 3.4+（Suspense 支持）

### 路由架构
```
路由结构：
├── 公共路由（登录、注册、404）
├── 需认证路由（需要登录）
│   ├── 布局路由（侧边栏、头部）
│   │   ├── 首页
│   │   ├── 用户管理
│   │   └── 设置
│   └── 无布局路由（独立页面）
└── 权限路由（特定角色）
```

## 文件结构规范

```
src/
├── router/
│   ├── index.ts              # 路由入口
│   ├── routes.ts             # 路由配置表
│   ├── guards.ts             # 路由守卫
│   ├── layouts/
│   │   ├── DefaultLayout.vue # 默认布局
│   │   ├── BlankLayout.vue   # 空白布局
│   │   └── AuthLayout.vue    # 认证布局
│   └── utils/
│       ├── lazy.ts           # 懒加载工具
│       └── breadcrumbs.ts    # 面包屑配置
├── views/
│   ├── home/
│   ├── user/
│   ├── login/
│   └── 404/
└── main.ts
```

## 路由配置

### 1. 路由类型定义

```typescript
// router/types.ts
import type { RouteRecordRaw, RouteMeta } from 'vue-router'

export type RouteLayout = 'default' | 'blank' | 'auth'

export interface AppRouteMeta extends RouteMeta {
  title?: string
  icon?: string
  hidden?: boolean
  breadcrumb?: boolean
  keepAlive?: boolean
  permissions?: string[]
  roles?: string[]
  layout?: RouteLayout
}

export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'children' | 'meta'> {
  children?: AppRouteRecordRaw[]
  meta?: AppRouteMeta
  component?: () => Promise<any>
  redirect?: string
}
```

### 2. 懒加载工具

```typescript
// router/utils/lazy.ts
import { defineAsyncComponent, type Component } from 'vue'

/**
 * 懒加载组件
 */
export const lazy = (loader: () => Promise<{ default: Component }>) => {
  return defineAsyncComponent({
    loader,
    loadingComponent: () => import('@/components/Loading.vue').then(m => m.default),
    errorComponent: () => import('@/components/Error.vue').then(m => m.default),
    delay: 200,
    timeout: 30000,
  })
}

/**
 * 带命名导出的懒加载
 */
export const lazyNamed = (
  loader: () => Promise<Record<string, Component>>,
  name: string
) => {
  return defineAsyncComponent({
    loader: async () => {
      const module = await loader()
      return module[name]
    },
    delay: 200,
  })
}
```

### 3. 路由配置表

```typescript
// router/routes.ts
import type { AppRouteRecordRaw } from './types'
import { lazy } from './utils/lazy'

// 公共页面
const Login = () => lazy(() => import('@/views/login/index.vue'))
const Register = () => lazy(() => import('@/views/register/index.vue'))
const NotFound = () => lazy(() => import('@/views/404/index.vue'))

// 布局
const DefaultLayout = () => lazy(() => import('@/router/layouts/DefaultLayout.vue'))
const BlankLayout = () => lazy(() => import('@/router/layouts/BlankLayout.vue'))

// 需认证页面
const Home = () => lazy(() => import('@/views/home/index.vue'))
const Dashboard = () => lazy(() => import('@/views/dashboard/index.vue'))
const UserList = () => lazy(() => import('@/views/user/List/index.vue'))
const UserDetail = () => lazy(() => import('@/views/user/Detail/index.vue'))
const Settings = () => lazy(() => import('@/views/settings/index.vue'))

export const constantRoutes: AppRouteRecordRaw[] = [
  // 公共路由 - 空白布局
  {
    path: '/login',
    component: BlankLayout,
    meta: { title: '登录', hidden: true, layout: 'blank' },
    children: [
      {
        path: '',
        name: 'Login',
        component: Login,
      },
    ],
  },
  {
    path: '/register',
    component: BlankLayout,
    meta: { title: '注册', hidden: true, layout: 'blank' },
    children: [
      {
        path: '',
        name: 'Register',
        component: Register,
      },
    ],
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '页面不存在', hidden: true, layout: 'blank' },
  },
]

export const asyncRoutes: AppRouteRecordRaw[] = [
  // 需认证路由 - 默认布局
  {
    path: '/',
    component: DefaultLayout,
    redirect: '/dashboard',
    meta: { title: '首页', layout: 'default' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '仪表盘', icon: 'Odometer' },
      },
      {
        path: 'home',
        name: 'Home',
        component: Home,
        meta: { title: '首页', icon: 'HomeFilled' },
      },
    ],
  },

  // 用户管理 - 嵌套路由
  {
    path: '/user',
    component: DefaultLayout,
    meta: { title: '用户管理', icon: 'User', layout: 'default' },
    children: [
      {
        path: '',
        name: 'UserList',
        component: UserList,
        meta: { title: '用户列表' },
      },
      {
        path: ':id',
        name: 'UserDetail',
        component: UserDetail,
        meta: { title: '用户详情', hidden: true },
      },
    ],
  },

  // 权限路由
  {
    path: '/settings',
    component: DefaultLayout,
    meta: {
      title: '系统设置',
      icon: 'Setting',
      layout: 'default',
      permissions: ['settings:view'],
    },
    children: [
      {
        path: '',
        name: 'Settings',
        component: Settings,
        meta: { title: '系统设置', permissions: ['settings:view'] },
      },
    ],
  },
]

// 所有路由
export const routes: AppRouteRecordRaw[] = [...constantRoutes, ...asyncRoutes]
```

### 4. 路由守卫

```typescript
// router/guards.ts
import type { Router, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 白名单路由
const whiteList = ['/login', '/register', '/404']

/**
 * 设置路由守卫
 */
export function setupRouterGuards(router: Router) {
  // 前置守卫
  router.beforeEach(async (to, from, next) => {
    NProgress.start()

    const userStore = useUserStore()
    const hasToken = userStore.token

    if (hasToken) {
      if (to.path === '/login') {
        // 已登录，跳转首页
        next({ path: '/' })
        NProgress.done()
      } else {
        // 检查是否已获取用户信息
        if (userStore.user) {
          // 检查权限
          if (checkPermission(to, userStore)) {
            next()
          } else {
            next({ path: '/403' })
            NProgress.done()
          }
        } else {
          try {
            // 获取用户信息
            await userStore.fetchCurrentUser()
            next({ ...to, replace: true })
          } catch (error) {
            // 获取失败，清除 token，跳转登录
            userStore.logout()
            next(`/login?redirect=${to.path}`)
            NProgress.done()
          }
        }
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path)) {
        // 白名单，直接进入
        next()
      } else {
        // 其他页面，跳转登录
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  })

  // 后置守卫
  router.afterEach((to) => {
    // 设置页面标题
    const title = to.meta?.title
    if (title) {
      document.title = `${title} | 管理后台`
    }

    NProgress.done()
  })

  // 错误处理
  router.onError((error) => {
    console.error('Router error:', error)
    NProgress.done()
  })
}

/**
 * 检查权限
 */
function checkPermission(
  to: RouteLocationNormalized,
  userStore: ReturnType<typeof useUserStore>
): boolean {
  const { permissions, roles } = to.meta

  // 无权限要求
  if (!permissions && !roles) {
    return true
  }

  // 检查角色
  if (roles && !roles.includes(userStore.user?.role || '')) {
    return false
  }

  // 检查权限
  if (permissions) {
    const userPermissions = userStore.user?.permissions || []
    const hasPermission = (permissions as string[]).some((permission) =>
      userPermissions.includes(permission)
    )
    return hasPermission
  }

  return true
}
```

### 5. 布局组件

```vue
<!-- router/layouts/DefaultLayout.vue -->
<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="aside">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" />
        <span v-show="!isCollapsed">管理后台</span>
      </div>
      <Sidebar :collapsed="isCollapsed" />
    </el-aside>

    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <Breadcrumb />
        </div>
        <div class="right">
          <UserDropdown />
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="main">
        <RouterView v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </RouterView>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Fold, Expand } from '@element-plus/icons-vue'
import Sidebar from './components/Sidebar.vue'
import Breadcrumb from './components/Breadcrumb.vue'
import UserDropdown from './components/UserDropdown.vue'

const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 需要缓存的页面
const cachedViews = computed(() => {
  // 根据路由 meta.keepAlive 返回组件名列表
  return []
})
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.aside {
  background: #304156;
  transition: width 0.3s;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;

  img {
    width: 32px;
    height: 32px;
    margin-right: 8px;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 16px;
}

.left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
}

.main {
  background: #f0f2f5;
  padding: 16px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

```vue
<!-- router/layouts/BlankLayout.vue -->
<template>
  <RouterView />
</template>
```

### 6. 侧边栏组件

```vue
<!-- router/layouts/components/Sidebar.vue -->
<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="collapsed"
    :unique-opened="true"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409eff"
    router
  >
    <template v-for="route in menuRoutes" :key="route.path">
      <SidebarItem :route="route" :base-path="route.path" />
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { asyncRoutes } from '@/router/routes'
import SidebarItem from './SidebarItem.vue'
import { useUserStore } from '@/stores/user'

interface Props {
  collapsed: boolean
}

const props = defineProps<Props>()

const route = useRoute()
const userStore = useUserStore()

// 当前激活菜单
const activeMenu = computed(() => route.path)

// 过滤有权限的菜单
const menuRoutes = computed(() => {
  return filterRoutesByPermission(asyncRoutes, userStore.user?.permissions || [])
})

/**
 * 过滤有权限的路由
 */
function filterRoutesByPermission(routes: any[], permissions: string[]): any[] {
  return routes
    .filter((route) => {
      // 隐藏的路由不显示
      if (route.meta?.hidden) return false

      // 检查权限
      const routePermissions = route.meta?.permissions
      if (!routePermissions) return true

      return routePermissions.some((p: string) => permissions.includes(p))
    })
    .map((route) => {
      if (route.children) {
        route.children = filterRoutesByPermission(route.children, permissions)
      }
      return route
    })
    .filter((route) => {
      // 过滤掉没有子菜单的父菜单
      if (route.children && route.children.length === 0) return false
      return true
    })
}
</script>
```

### 7. 路由入口

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { setupRouterGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 设置路由守卫
setupRouterGuards(router)

export default router
```

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

### 8. 面包屑导航

```typescript
// router/utils/breadcrumbs.ts
import type { RouteLocationNormalized } from 'vue-router'

interface Breadcrumb {
  title: string
  path?: string
}

/**
 * 根据路由生成面包屑
 */
export function getBreadcrumbs(route: RouteLocationNormalized): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = []

  // 从 matched 中提取面包屑
  route.matched.forEach((record) => {
    const title = record.meta?.title as string | undefined
    const hidden = record.meta?.hidden as boolean | undefined

    if (title && !hidden) {
      breadcrumbs.push({
        title,
        path: record.path,
      })
    }
  })

  return breadcrumbs
}
```

```vue
<!-- router/layouts/components/Breadcrumb.vue -->
<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">
      <el-icon><HomeFilled /></el-icon>
    </el-breadcrumb-item>
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
      <router-link v-if="item.path" :to="item.path">
        {{ item.title }}
      </router-link>
      <span v-else>{{ item.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'
import { getBreadcrumbs } from '@/router/utils/breadcrumbs'

const route = useRoute()

const breadcrumbs = computed(() => getBreadcrumbs(route))
</script>
```

### 9. 编程式导航 Composable

```typescript
// composables/useNavigation/index.ts
import { useRouter, useRoute } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

export function useNavigation() {
  const router = useRouter()
  const route = useRoute()

  // 返回上一页
  const goBack = () => {
    router.back()
  }

  // 跳转到登录页
  const goToLogin = () => {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath },
    })
  }

  // 登录后跳转回原页面
  const goAfterLogin = () => {
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  }

  // 跳转到详情页
  const goToDetail = (module: string, id: string | number) => {
    router.push(`/${module}/${id}`)
  }

  // 刷新当前页
  const refresh = () => {
    router.go(0)
  }

  // 替换当前路由
  const replace = (to: RouteLocationRaw) => {
    router.replace(to)
  }

  // 打开新标签页
  const openNewTab = (url: string) => {
    window.open(url, '_blank')
  }

  return {
    router,
    route,
    goBack,
    goToLogin,
    goAfterLogin,
    goToDetail,
    refresh,
    replace,
    openNewTab,
  }
}
```

### 10. 动态路由

```typescript
// router/dynamic.ts
import type { Router, RouteRecordRaw } from 'vue-router'
import { lazy } from './utils/lazy'

/**
 * 根据后端菜单动态添加路由
 */
export function addDynamicRoutes(router: Router, menuData: any[]) {
  const routes = generateRoutesFromMenu(menuData)

  routes.forEach((route) => {
    router.addRoute(route)
  })
}

/**
 * 从菜单数据生成路由
 */
function generateRoutesFromMenu(menus: any[], parentPath = ''): RouteRecordRaw[] {
  return menus.map((menu) => {
    const fullPath = parentPath + menu.path

    const route: RouteRecordRaw = {
      path: menu.path,
      name: menu.name || menu.path.replace(/\//g, '-'),
      meta: {
        title: menu.title,
        icon: menu.icon,
        permissions: menu.permissions,
      },
    }

    if (menu.component) {
      route.component = () => import(`@/views/${menu.component}.vue`)
    }

    if (menu.redirect) {
      route.redirect = menu.redirect
    }

    if (menu.children && menu.children.length > 0) {
      route.children = generateRoutesFromMenu(menu.children, fullPath)
    }

    return route
  })
}

/**
 * 移除动态路由
 */
export function removeDynamicRoutes(router: Router, routeNames: string[]) {
  routeNames.forEach((name) => {
    router.removeRoute(name)
  })
}
```

## 输出要求

生成路由配置时必须：

1. 使用 TypeScript 类型定义
2. 懒加载路由组件
3. 路由守卫（认证/权限）
4. 布局组件复用
5. 面包屑导航支持
6. 404 页面处理
7. KeepAlive 缓存支持

## 使用示例

### 用户输入

```
生成一个电商后台的路由配置。

页面结构：
- 登录页（/login）
- 仪表盘（/dashboard）
- 商品管理
  - 商品列表
  - 商品详情（/:id）
  - 商品编辑（/:id/edit）
- 订单管理
  - 订单列表
  - 订单详情（/:id）
- 用户管理
- 设置

权限要求：
- 商品管理：products:view
- 订单管理：orders:view
- 用户管理：users:view
- 设置：settings:view
```

### AI 输出

生成完整的路由配置，包括：
- 路由类型定义
- 懒加载配置
- 路由配置表
- 路由守卫
- 布局组件
- 侧边栏组件
- 面包屑组件
