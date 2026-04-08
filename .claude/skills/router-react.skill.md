# Skill: React Router 配置 (React)

## 使用场景

用于快速生成规范的 React Router 配置，适用于：
- 路由配置管理
- 路由守卫/权限控制
- 嵌套路由配置
- 动态路由生成
- 面包屑导航

## 技术栈

### 核心依赖
- React Router v6.20+（路由库）
- TypeScript 5（类型支持）
- React 18+（Suspense 支持）

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
│   ├── index.tsx             # 路由入口
│   ├── routes.tsx            # 路由配置表
│   ├── guards/
│   │   ├── AuthGuard.tsx     # 认证守卫
│   │   ├── PermissionGuard.tsx # 权限守卫
│   │   └── GuestGuard.tsx    # 游客守卫（仅未登录可访问）
│   ├── layouts/
│   │   ├── DefaultLayout.tsx # 默认布局
│   │   ├── BlankLayout.tsx   # 空白布局
│   │   └── AuthLayout.tsx    # 认证布局
│   └── utils/
│       ├── lazy.ts           # 懒加载工具
│       └── breadcrumbs.ts    # 面包屑配置
├── pages/
│   ├── home/
│   ├── user/
│   ├── login/
│   └── 404/
└── App.tsx
```

## 路由配置

### 1. 路由类型定义

```typescript
// router/types.ts
import type { ReactNode } from 'react'

export type RouteLayout = 'default' | 'blank' | 'auth'

export interface RouteMeta {
  title?: string
  icon?: string
  hidden?: boolean
  breadcrumb?: boolean
  keepAlive?: boolean
  permissions?: string[]
  roles?: string[]
}

export interface AppRouteObject {
  path: string
  element?: ReactNode
  children?: AppRouteObject[]
  index?: boolean
  meta?: RouteMeta
  layout?: RouteLayout
  redirect?: string
  handle?: {
    crumb?: (data: any) => { title: string; path?: string }
  }
}
```

### 2. 懒加载工具

```typescript
// router/utils/lazy.ts
import { Suspense, lazy, ComponentType } from 'react'
import { Spin } from 'antd'

/**
 * 懒加载组件包装器
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  const LazyComponent = lazy(importFn)

  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="large" />
        </div>
      }
    >
      <LazyComponent />
    </Suspense>
  )
}

/**
 * 带命名导出的懒加载
 */
export function lazyLoadNamed<T extends ComponentType<any>>(
  importFn: () => Promise<{ [key: string]: T }>,
  exportName: string
) {
  const LazyComponent = lazy(async () => {
    const module = await importFn()
    return { default: module[exportName] }
  })

  return (
    <Suspense fallback={<Spin />}>
      <LazyComponent />
    </Suspense>
  )
}
```

### 3. 路由配置表

```typescript
// router/routes.tsx
import { lazyLoad } from './utils/lazy'

// 公共页面
const Login = () => lazyLoad(() => import('@/pages/login'))
const Register = () => lazyLoad(() => import('@/pages/register'))
const NotFound = () => lazyLoad(() => import('@/pages/404'))

// 需认证页面
const Home = () => lazyLoad(() => import('@/pages/home'))
const Dashboard = () => lazyLoad(() => import('@/pages/dashboard'))
const UserList = () => lazyLoad(() => import('@/pages/user/List'))
const UserDetail = () => lazyLoad(() => import('@/pages/user/Detail'))
const Settings = () => lazyLoad(() => import('@/pages/settings'))

export const routes: AppRouteObject[] = [
  // 公共路由 - 空白布局
  {
    path: '/login',
    element: Login(),
    layout: 'blank',
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/register',
    element: Register(),
    layout: 'blank',
    meta: { title: '注册', hidden: true },
  },

  // 需认证路由 - 默认布局
  {
    path: '/',
    layout: 'default',
    meta: { title: '首页' },
    children: [
      {
        index: true,
        element: Home(),
        meta: { title: '首页', icon: 'home' },
      },
      {
        path: 'dashboard',
        element: Dashboard(),
        meta: { title: '仪表盘', icon: 'dashboard' },
      },
    ],
  },

  // 用户管理 - 嵌套路由
  {
    path: '/user',
    layout: 'default',
    meta: { title: '用户管理', icon: 'user' },
    children: [
      {
        index: true,
        element: UserList(),
        meta: { title: '用户列表' },
      },
      {
        path: ':id',
        element: UserDetail(),
        meta: { title: '用户详情', hidden: true },
      },
    ],
  },

  // 权限路由
  {
    path: '/settings',
    element: Settings(),
    layout: 'default',
    meta: {
      title: '系统设置',
      icon: 'setting',
      permissions: ['settings:view'],
    },
  },

  // 404
  {
    path: '*',
    element: NotFound(),
    layout: 'blank',
    meta: { title: '页面不存在', hidden: true },
  },
]
```

### 4. 路由守卫

```typescript
// router/guards/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/stores/user'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  const { isLoggedIn } = useUserStore()

  if (!isLoggedIn) {
    // 保存当前路径，登录后跳转回来
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
```

```typescript
// router/guards/GuestGuard.tsx
import { Navigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user'

interface GuestGuardProps {
  children: React.ReactNode
}

/**
 * 游客守卫 - 仅未登录可访问（如登录页）
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isLoggedIn } = useUserStore()

  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
```

```typescript
// router/guards/PermissionGuard.tsx
import { Navigate } from 'react-router-dom'
import { Result } from 'antd'
import { useUserStore } from '@/stores/user'
import type { RouteMeta } from '../types'

interface PermissionGuardProps {
  children: React.ReactNode
  meta?: RouteMeta
}

export function PermissionGuard({ children, meta }: PermissionGuardProps) {
  const { user } = useUserStore()

  // 无权限要求
  if (!meta?.permissions && !meta?.roles) {
    return <>{children}</>
  }

  // 检查角色
  if (meta.roles && !meta.roles.includes(user?.role || '')) {
    return (
      <Result
        status="403"
        title="无访问权限"
        subTitle="您没有权限访问此页面"
      />
    )
  }

  // 检查权限
  if (meta.permissions) {
    const hasPermission = meta.permissions.some((permission) =>
      user?.permissions?.includes(permission)
    )

    if (!hasPermission) {
      return (
        <Result
          status="403"
          title="无访问权限"
          subTitle="您没有权限访问此页面"
        />
      )
    }
  }

  return <>{children}</>
}
```

### 5. 布局组件

```typescript
// router/layouts/DefaultLayout.tsx
import { Outlet, Navigate } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { routes } from '../routes'
import type { AppRouteObject } from '../types'

const { Sider, Content, Header } = Layout

/**
 * 过滤菜单路由
 */
function filterMenuRoutes(routes: AppRouteObject[]): AppRouteObject[] {
  return routes
    .filter((route) => !route.meta?.hidden)
    .map((route) => ({
      ...route,
      children: route.children ? filterMenuRoutes(route.children) : undefined,
    }))
}

/**
 * 生成菜单项
 */
function generateMenuItems(routes: AppRouteObject[], parentPath = ''): any[] {
  return routes
    .filter((route) => route.meta?.title)
    .map((route) => {
      const fullPath = parentPath + route.path

      if (route.children && route.children.length > 0) {
        return {
          key: fullPath,
          icon: route.meta?.icon,
          label: route.meta?.title,
          children: generateMenuItems(route.children, fullPath + '/'),
        }
      }

      return {
        key: fullPath,
        icon: route.meta?.icon,
        label: route.meta?.title,
      }
    })
}

export default function DefaultLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  // 生成菜单
  const menuItems = useMemo(() => {
    const menuRoutes = filterMenuRoutes(routes)
    return generateMenuItems(menuRoutes)
  }, [])

  // 当前选中的菜单
  const selectedKeys = useMemo(() => {
    return [location.pathname]
  }, [location.pathname])

  // 默认展开的菜单
  const defaultOpenKeys = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean)
    return pathParts.slice(0, -1).map((_, i) =>
      '/' + pathParts.slice(0, i + 1).join('/')
    )
  }, [location.pathname])

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} collapsible>
        <div style={{ height: 64, color: '#fff', textAlign: 'center', lineHeight: '64px' }}>
          LOGO
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={defaultOpenKeys}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px' }}>
          {/* 头部内容 */}
        </Header>
        <Content style={{ margin: 16, background: '#fff', padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
```

```typescript
// router/layouts/BlankLayout.tsx
import { Outlet } from 'react-router-dom'

export default function BlankLayout() {
  return <Outlet />
}
```

### 6. 路由渲染器

```typescript
// router/index.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthGuard } from './guards/AuthGuard'
import { GuestGuard } from './guards/GuestGuard'
import { PermissionGuard } from './guards/PermissionGuard'
import DefaultLayout from './layouts/DefaultLayout'
import BlankLayout from './layouts/BlankLayout'
import { routes } from './routes'
import type { AppRouteObject } from './types'

/**
 * 渲染单个路由
 */
function renderRoute(route: AppRouteObject) {
  const { path, element, children, index, meta, layout, redirect } = route

  // 重定向路由
  if (redirect) {
    return {
      path,
      element: <Navigate to={redirect} replace />,
    }
  }

  // 包装权限守卫
  let wrappedElement = element
  if (meta?.permissions || meta?.roles) {
    wrappedElement = <PermissionGuard meta={meta}>{element}</PermissionGuard>
  }

  // 包装认证守卫（非公共路由）
  if (layout !== 'blank' && !path.includes('login') && !path.includes('register')) {
    wrappedElement = <AuthGuard>{wrappedElement}</AuthGuard>
  }

  // 游客守卫（登录、注册页）
  if (path.includes('login') || path.includes('register')) {
    wrappedElement = <GuestGuard>{wrappedElement}</GuestGuard>
  }

  return {
    path: index ? undefined : path,
    index,
    element: wrappedElement,
    children: children?.map(renderRoute),
  }
}

/**
 * 根据布局分组路由
 */
function groupRoutesByLayout(routes: AppRouteObject[]) {
  const groups: Record<string, AppRouteObject[]> = {
    default: [],
    blank: [],
    auth: [],
  }

  routes.forEach((route) => {
    const layout = route.layout || 'default'
    groups[layout].push(route)
  })

  return groups
}

/**
 * 创建路由配置
 */
function createRoutes() {
  const groups = groupRoutesByLayout(routes)

  const routerRoutes = [
    // 默认布局路由
    {
      element: <DefaultLayout />,
      children: groups.default.map(renderRoute),
    },
    // 空白布局路由
    ...groups.blank.map(renderRoute),
  ]

  return createBrowserRouter(routerRoutes)
}

const router = createRoutes()

export default function AppRouter() {
  return <RouterProvider router={router} />
}

export { router }
```

### 7. 面包屑导航

```typescript
// router/utils/breadcrumbs.ts
import { matchPath } from 'react-router-dom'
import type { AppRouteObject } from '../types'

interface Breadcrumb {
  title: string
  path?: string
}

/**
 * 根据路径生成面包屑
 */
export function getBreadcrumbs(
  routes: AppRouteObject[],
  pathname: string
): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = []

  function findRoute(
    routes: AppRouteObject[],
    pathname: string,
    parentPath = ''
  ): Breadcrumb[] {
    for (const route of routes) {
      const fullPath = parentPath + route.path

      // 匹配当前路由
      if (matchPath(fullPath, pathname)) {
        const crumbs: Breadcrumb[] = []

        // 添加当前路由的面包屑
        if (route.meta?.title && !route.meta?.hidden) {
          crumbs.push({
            title: route.meta.title,
            path: fullPath,
          })
        }

        // 递归查找子路由
        if (route.children) {
          const childCrumbs = findRoute(route.children, pathname, fullPath + '/')
          crumbs.push(...childCrumbs)
        }

        return crumbs
      }
    }
    return []
  }

  return findRoute(routes, pathname)
}

// 使用示例
// const breadcrumbs = getBreadcrumbs(routes, location.pathname)
```

```typescript
// components/Breadcrumb/index.tsx
import { Breadcrumb as AntBreadcrumb } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { getBreadcrumbs } from '@/router/utils/breadcrumbs'
import { routes } from '@/router/routes'
import { HomeOutlined } from '@ant-design/icons'

export default function Breadcrumb() {
  const location = useLocation()
  const breadcrumbs = getBreadcrumbs(routes, location.pathname)

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <AntBreadcrumb style={{ marginBottom: 16 }}>
      <AntBreadcrumb.Item>
        <Link to="/">
          <HomeOutlined />
        </Link>
      </AntBreadcrumb.Item>
      {breadcrumbs.map((crumb, index) => (
        <AntBreadcrumb.Item key={crumb.path || index}>
          {crumb.path && index < breadcrumbs.length - 1 ? (
            <Link to={crumb.path}>{crumb.title}</Link>
          ) : (
            crumb.title
          )}
        </AntBreadcrumb.Item>
      ))}
    </AntBreadcrumb>
  )
}
```

### 8. 编程式导航 Hooks

```typescript
// hooks/useNavigation/index.ts
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'

export function useNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [searchParams] = useSearchParams()

  // 返回上一页
  const goBack = () => {
    navigate(-1)
  }

  // 跳转到登录页（保存当前路径）
  const goToLogin = () => {
    navigate('/login', { state: { from: location } })
  }

  // 登录后跳转回原页面
  const goAfterLogin = () => {
    const from = (location.state as any)?.from?.pathname || '/'
    navigate(from, { replace: true })
  }

  // 跳转到详情页
  const goToDetail = (module: string, id: string | number) => {
    navigate(`/${module}/${id}`)
  }

  // 刷新当前页
  const refresh = () => {
    navigate(0)
  }

  // 替换当前路由
  const replace = (path: string) => {
    navigate(path, { replace: true })
  }

  return {
    navigate,
    goBack,
    goToLogin,
    goAfterLogin,
    goToDetail,
    refresh,
    replace,
    location,
    params,
    searchParams,
  }
}
```

### 9. 路由入口

```typescript
// App.tsx
import AppRouter from './router'

export default function App() {
  return <AppRouter />
}
```

## 动态路由

```typescript
// router/dynamic.ts
import { lazyLoad } from './utils/lazy'
import type { AppRouteObject } from './types'

/**
 * 根据后端返回的菜单生成路由
 */
export function generateRoutesFromMenu(menuData: any[]): AppRouteObject[] {
  return menuData.map((menu) => {
    const route: AppRouteObject = {
      path: menu.path,
      meta: {
        title: menu.title,
        icon: menu.icon,
        permissions: menu.permissions,
      },
    }

    if (menu.component) {
      route.element = lazyLoad(() => import(`@/pages/${menu.component}`))
    }

    if (menu.children && menu.children.length > 0) {
      route.children = generateRoutesFromMenu(menu.children)
    }

    return route
  })
}
```

## 输出要求

生成路由配置时必须：

1. 使用 TypeScript 类型定义
2. 懒加载路由组件（Suspense）
3. 路由守卫（认证/权限）
4. 布局组件复用
5. 面包屑导航支持
6. 404 页面处理

## 使用示例

### 用户输入

```
生成一个电商后台的路由配置。

页面结构：
- 登录页（/login）
- 仪表盘（/dashboard）
- 商品管理（/products）
  - 商品列表
  - 商品详情（/:id）
  - 商品编辑（/:id/edit）
- 订单管理（/orders）
  - 订单列表
  - 订单详情（/:id）
- 用户管理（/users）
- 设置（/settings）

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
- 面包屑配置
