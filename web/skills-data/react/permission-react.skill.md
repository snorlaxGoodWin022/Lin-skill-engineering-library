# Skill: 权限控制（React）

## 使用场景

当需要实现前端权限体系时使用此Skill，包括但不限于：

- 路由权限守卫
- 按钮/操作级权限控制
- 角色管理
- 菜单动态渲染
- 权限指令

## 技术栈

### 核心依赖

- React 18.2
- TypeScript 5.0
- React Router v6（路由守卫）
- Zustand（权限状态管理）

### 架构特点

- RBAC（基于角色的访问控制）
- 路由级 + 组件级 + 按钮级 三层权限控制
- 权限状态持久化（刷新不丢失）
- 动态路由注册

## 文件结构规范

```
src/
├── store/
│   └── usePermissionStore.ts    # 权限状态管理
├── hooks/
│   └── usePermission.ts         # 权限判断 Hook
├── components/
│   ├── AuthGuard/
│   │   └── index.tsx            # 路由权限守卫
│   ├── AuthButton/
│   │   └── index.tsx            # 权限按钮组件
│   └── AuthWrapper/
│       └── index.tsx            # 权限包裹组件
├── router/
│   ├── index.tsx                # 路由配置
│   ├── routes.ts                # 静态路由
│   ├── dynamicRoutes.ts         # 动态路由（按角色）
│   └── guard.ts                 # 路由守卫逻辑
└── types/
    └── permission.ts            # 权限类型定义
```

## 类型定义

```typescript
// types/permission.ts

/** 权限码 */
export type PermissionCode = string

/** 角色枚举 */
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest',
}

/** 菜单项 */
export interface MenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  path: string
  children?: MenuItem[]
  /** 访问该菜单所需权限码 */
  permission?: PermissionCode
  /** 访问该菜单所需角色（满足其一即可） */
  roles?: Role[]
  /** 是否在菜单中隐藏 */
  hidden?: boolean
}

/** 路由元信息扩展 */
export interface RouteMeta {
  /** 页面标题 */
  title: string
  /** 所需权限码 */
  permission?: PermissionCode
  /** 所需角色 */
  roles?: Role[]
  /** 是否需要登录 */
  requiresAuth?: boolean
  /** 是否在菜单中隐藏 */
  hidden?: boolean
}

/** 用户权限信息 */
export interface UserPermission {
  /** 用户角色列表 */
  roles: Role[]
  /** 用户权限码列表 */
  permissions: PermissionCode[]
}
```

## 权限 Store

```typescript
// store/usePermissionStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Role, PermissionCode, UserPermission, MenuItem } from '@/types/permission'

interface PermissionState {
  /** 用户角色 */
  roles: Role[]
  /** 权限码列表 */
  permissions: PermissionCode[]
  /** 动态菜单 */
  menus: MenuItem[]

  /** 设置权限信息 */
  setPermission: (data: UserPermission) => void
  /** 设置动态菜单 */
  setMenus: (menus: MenuItem[]) => void
  /** 判断是否拥有指定权限 */
  hasPermission: (code: PermissionCode) => boolean
  /** 判断是否拥有指定角色（满足其一） */
  hasRole: (roles: Role[]) => boolean
  /** 清除权限（登出） */
  clearPermission: () => void
}

/**
 * 权限状态管理 Store
 * 持久化到 localStorage，刷新不丢失
 */
export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      roles: [],
      permissions: [],
      menus: [],

      setPermission: (data) =>
        set({
          roles: data.roles,
          permissions: data.permissions,
        }),

      setMenus: (menus) => set({ menus }),

      hasPermission: (code) => {
        const { permissions } = get()
        return permissions.includes(code)
      },

      hasRole: (roles) => {
        const { roles: userRoles } = get()
        // super_admin 拥有所有权限
        if (userRoles.includes(Role.SUPER_ADMIN)) return true
        return roles.some((role) => userRoles.includes(role))
      },

      clearPermission: () =>
        set({
          roles: [],
          permissions: [],
          menus: [],
        }),
    }),
    {
      name: 'permission-storage',
    }
  )
)
```

## 权限判断 Hook

```typescript
// hooks/usePermission.ts
import { useCallback } from 'react'
import { usePermissionStore } from '@/store/usePermissionStore'
import { Role, PermissionCode } from '@/types/permission'

/**
 * 权限判断 Hook
 * 提供细粒度的权限检查能力
 *
 * @example
 * const { hasPermission, hasRole, hasAnyPermission } = usePermission();
 *
 * if (hasPermission('user:delete')) {
 *   // 显示删除按钮
 * }
 */
export function usePermission() {
  const store = usePermissionStore()

  /** 判断是否拥有指定权限码 */
  const hasPermission = useCallback(
    (code: PermissionCode) => store.hasPermission(code),
    [store.permissions]
  )

  /** 判断是否拥有任一权限码 */
  const hasAnyPermission = useCallback(
    (codes: PermissionCode[]) => codes.some((code) => store.hasPermission(code)),
    [store.permissions]
  )

  /** 判断是否拥有全部权限码 */
  const hasAllPermissions = useCallback(
    (codes: PermissionCode[]) => codes.every((code) => store.hasPermission(code)),
    [store.permissions]
  )

  /** 判断是否拥有指定角色（满足其一） */
  const hasRole = useCallback((roles: Role[]) => store.hasRole(roles), [store.roles])

  /** 判断是否为超级管理员 */
  const isSuperAdmin = useCallback(() => store.roles.includes(Role.SUPER_ADMIN), [store.roles])

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isSuperAdmin,
    roles: store.roles,
    permissions: store.permissions,
  }
}
```

## 路由权限守卫

```typescript
// components/AuthGuard/index.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissionStore } from '@/store/usePermissionStore';
import { usePermission } from '@/hooks/usePermission';

interface AuthGuardProps {
  children: React.ReactNode;
  /** 所需权限码 */
  permission?: string;
  /** 所需角色 */
  roles?: string[];
  /** 是否需要登录（默认 true） */
  requireAuth?: boolean;
}

/**
 * 路由权限守卫组件
 * 包裹需要权限控制的路由页面
 *
 * @example
 * <AuthGuard permission="user:edit">
 *   <UserEditPage />
 * </AuthGuard>
 */
export default function AuthGuard({
  children,
  permission,
  roles,
  requireAuth = true,
}: AuthGuardProps) {
  const location = useLocation();
  const isAuthenticated = usePermissionStore((s) => s.permissions.length > 0);
  const { hasPermission, hasRole } = usePermission();

  // 需要登录但未登录
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 需要特定角色但无角色
  if (roles && roles.length > 0 && !hasRole(roles as any[])) {
    return <Navigate to="/403" replace />;
  }

  // 需要特定权限但无权限
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
```

## 权限按钮组件

```typescript
// components/AuthButton/index.tsx
import React from 'react';
import { Button, ButtonProps, Tooltip } from 'antd';
import { usePermission } from '@/hooks/usePermission';

interface AuthButtonProps extends ButtonProps {
  /** 所需权限码 */
  permission: string;
  /** 无权限时的行为：隐藏 | 禁用 */
  fallback?: 'hidden' | 'disabled';
  /** 无权限时的提示文字 */
  noAuthTip?: string;
}

/**
 * 权限控制按钮
 * 根据权限自动隐藏或禁用
 *
 * @example
 * <AuthButton permission="user:delete" danger>
 *   删除用户
 * </AuthButton>
 */
export default function AuthButton({
  permission,
  fallback = 'hidden',
  noAuthTip = '无操作权限',
  children,
  ...rest
}: AuthButtonProps) {
  const { hasPermission } = usePermission();

  const authorized = hasPermission(permission);

  // 无权限 → 隐藏
  if (!authorized && fallback === 'hidden') {
    return null;
  }

  // 无权限 → 禁用 + 提示
  if (!authorized && fallback === 'disabled') {
    return (
      <Tooltip title={noAuthTip}>
        <Button {...rest} disabled>
          {children}
        </Button>
      </Tooltip>
    );
  }

  return <Button {...rest}>{children}</Button>;
}
```

## 权限包裹组件

```typescript
// components/AuthWrapper/index.tsx
import React from 'react';
import { usePermission } from '@/hooks/usePermission';

interface AuthWrapperProps {
  children: React.ReactNode;
  /** 所需权限码（满足任一） */
  anyPermission?: string[];
  /** 所需权限码（必须全部） */
  allPermissions?: string[];
  /** 所需角色 */
  roles?: string[];
  /** 无权限时的替代内容 */
  fallback?: React.ReactNode;
}

/**
 * 权限包裹组件
 * 控制任意内容的显示/隐藏
 *
 * @example
 * <AuthWrapper anyPermission={['order:view', 'order:edit']}>
 *   <OrderPanel />
 * </AuthWrapper>
 */
export default function AuthWrapper({
  children,
  anyPermission,
  allPermissions,
  roles,
  fallback = null,
}: AuthWrapperProps) {
  const { hasAnyPermission, hasAllPermissions, hasRole } = usePermission();

  let authorized = true;

  if (anyPermission) {
    authorized = hasAnyPermission(anyPermission);
  }

  if (allPermissions) {
    authorized = hasAllPermissions(allPermissions);
  }

  if (roles) {
    authorized = hasRole(roles as any[]);
  }

  return authorized ? <>{children}</> : <>{fallback}</>;
}
```

## 路由配置示例

```typescript
// router/index.tsx
import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import { Role } from '@/types/permission';

// 懒加载页面
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const UserList = lazy(() => import('@/pages/User/List'));
const UserEdit = lazy(() => import('@/pages/User/Edit'));
const OrderList = lazy(() => import('@/pages/Order/List'));
const SystemSettings = lazy(() => import('@/pages/System/Settings'));
const Login = lazy(() => import('@/pages/Login'));
const NotFound = lazy(() => import('@/pages/404'));
const Forbidden = lazy(() => import('@/pages/403'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        ),
      },
      {
        path: 'user',
        children: [
          {
            path: 'list',
            element: (
              <AuthGuard permission="user:view">
                <UserList />
              </AuthGuard>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <AuthGuard permission="user:edit">
                <UserEdit />
              </AuthGuard>
            ),
          },
        ],
      },
      {
        path: 'order',
        element: (
          <AuthGuard permission="order:view">
            <OrderList />
          </AuthGuard>
        ),
      },
      {
        path: 'system',
        element: (
          <AuthGuard roles={[Role.ADMIN, Role.SUPER_ADMIN]}>
            <SystemSettings />
          </AuthGuard>
        ),
      },
    ],
  },
  {
    path: '/403',
    element: <Forbidden />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
```

## 动态菜单渲染

```typescript
// components/DynamicMenu/index.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { usePermissionStore } from '@/store/usePermissionStore';
import { usePermission } from '@/hooks/usePermission';
import { MenuItem } from '@/types/permission';

interface DynamicMenuProps {
  /** 菜单数据 */
  items: MenuItem[];
}

/**
 * 动态权限菜单
 * 根据用户角色和权限过滤菜单项
 */
export default function DynamicMenu({ items }: DynamicMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, hasRole } = usePermission();

  /** 过滤菜单项（递归） */
  const filterMenus = (menus: MenuItem[]): MenuItem[] => {
    return menus
      .filter((item) => {
        // 隐藏的菜单不显示
        if (item.hidden) return false;

        // 检查角色权限
        if (item.roles && !hasRole(item.roles)) return false;

        // 检查功能权限
        if (item.permission && !hasPermission(item.permission)) return false;

        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterMenus(item.children) : undefined,
      }));
  };

  /** 转换为 Ant Design Menu 格式 */
  const convertToAntMenu = (menus: MenuItem[]): MenuProps['items'] => {
    return menus.map((item) => ({
      key: item.path,
      icon: item.icon,
      label: item.label,
      children: item.children ? convertToAntMenu(item.children) : undefined,
    }));
  };

  const filteredItems = filterMenus(items);

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={convertToAntMenu(filteredItems)}
      onClick={({ key }) => navigate(key)}
    />
  );
}
```

## 输出要求

当用户要求实现权限控制时，必须：

1. 提供 RBAC 权限模型（角色 + 权限码）
2. Zustand 权限 Store 含持久化
3. 路由守卫组件（AuthGuard）
4. 按钮级权限组件（AuthButton）
5. 内容级权限包裹组件（AuthWrapper）
6. 动态菜单渲染（根据权限过滤）
7. 所有类型定义完整，无 any 类型

## 使用示例

### 用户输入

```
请按照 permission-react 规范，实现权限控制体系。

角色：超级管理员、管理员、普通用户
权限码：
- user:view / user:edit / user:delete
- order:view / order:edit
- system:settings
```

### AI 输出

AI 会自动生成：

1. 权限类型定义（角色枚举、权限码、菜单类型）
2. Zustand 权限 Store（含持久化）
3. usePermission Hook
4. AuthGuard 路由守卫
5. AuthButton 权限按钮
6. AuthWrapper 权限包裹
7. 路由配置示例
8. 动态菜单组件

你只需要：

- 根据后端接口获取用户权限数据
- 配置路由和菜单
- 在登录后调用 setPermission
- 基本上不用改就能用
