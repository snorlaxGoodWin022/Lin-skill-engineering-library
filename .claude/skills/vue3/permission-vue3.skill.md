# Skill: 权限控制（Vue 3）

## 使用场景

当需要实现前端权限体系时使用此Skill，包括但不限于：
- 路由权限守卫（beforeEach）
- 按钮/操作级权限控制
- 角色管理
- 菜单动态渲染
- 权限指令（v-permission）

## 技术栈

### 核心依赖
- Vue 3.3+
- TypeScript 5.0
- Vue Router 4（路由守卫）
- Pinia（权限状态管理）
- Element Plus 2.4+（菜单组件）

### 架构特点
- RBAC（基于角色的访问控制）
- 路由级 + 组件级 + 按钮级 三层权限控制
- 权限状态持久化（刷新不丢失）
- 动态路由注册（addRoute）
- 自定义指令 v-permission

## 文件结构规范

```
src/
├── store/
│   └── usePermissionStore.ts    # 权限状态管理
├── composables/
│   └── usePermission.ts         # 权限判断 Composable
├── components/
│   ├── AuthButton/
│   │   └── index.vue            # 权限按钮组件
│   └── AuthWrapper/
│       └── index.vue            # 权限包裹组件
├── directives/
│   └── permission.ts            # v-permission 指令
├── router/
│   ├── index.ts                 # 路由配置
│   ├── staticRoutes.ts          # 静态路由
│   ├── dynamicRoutes.ts         # 动态路由（按角色）
│   └── guard.ts                 # 路由守卫
└── types/
    └── permission.ts            # 权限类型定义
```

## 类型定义

```typescript
// types/permission.ts

/** 权限码 */
export type PermissionCode = string;

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
  key: string;
  label: string;
  icon?: string;
  path: string;
  children?: MenuItem[];
  /** 访问该菜单所需权限码 */
  permission?: PermissionCode;
  /** 访问该菜单所需角色（满足其一即可） */
  roles?: Role[];
  /** 是否在菜单中隐藏 */
  hidden?: boolean;
}

/** 路由元信息扩展 */
declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题 */
    title?: string;
    /** 所需权限码 */
    permission?: PermissionCode;
    /** 所需角色 */
    roles?: Role[];
    /** 是否需要登录 */
    requiresAuth?: boolean;
    /** 是否在菜单中隐藏 */
    hidden?: boolean;
  }
}

/** 用户权限信息 */
export interface UserPermission {
  /** 用户角色列表 */
  roles: Role[];
  /** 用户权限码列表 */
  permissions: PermissionCode[];
}
```

## 权限 Store

```typescript
// store/usePermissionStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Role, PermissionCode, UserPermission, MenuItem } from '@/types/permission';

/**
 * 权限状态管理 Store
 * 持久化到 localStorage，刷新不丢失
 */
export const usePermissionStore = defineStore('permission', () => {
  // ==================== State ====================
  const roles = ref<Role[]>([]);
  const permissions = ref<PermissionCode[]>([]);
  const menus = ref<MenuItem[]>([]);

  // ==================== Getters ====================
  const isAuthenticated = computed(() => permissions.value.length > 0);

  const isSuperAdmin = computed(() => roles.value.includes(Role.SUPER_ADMIN));

  // ==================== Actions ====================

  /** 设置权限信息 */
  function setPermission(data: UserPermission) {
    roles.value = data.roles;
    permissions.value = data.permissions;
  }

  /** 设置动态菜单 */
  function setMenus(menuList: MenuItem[]) {
    menus.value = menuList;
  }

  /** 判断是否拥有指定权限码 */
  function hasPermission(code: PermissionCode): boolean {
    return permissions.value.includes(code);
  }

  /** 判断是否拥有指定角色（满足其一） */
  function hasRole(checkRoles: Role[]): boolean {
    if (roles.value.includes(Role.SUPER_ADMIN)) return true;
    return checkRoles.some((role) => roles.value.includes(role));
  }

  /** 清除权限（登出） */
  function clearPermission() {
    roles.value = [];
    permissions.value = [];
    menus.value = [];
    localStorage.removeItem('permission-storage');
  }

  return {
    roles,
    permissions,
    menus,
    isAuthenticated,
    isSuperAdmin,
    setPermission,
    setMenus,
    hasPermission,
    hasRole,
    clearPermission,
  };
});
```

## 权限判断 Composable

```typescript
// composables/usePermission.ts
import { usePermissionStore } from '@/store/usePermissionStore';
import { Role, PermissionCode } from '@/types/permission';

/**
 * 权限判断 Composable
 * 提供细粒度的权限检查能力
 *
 * @example
 * const { hasPermission, hasRole } = usePermission();
 *
 * if (hasPermission('user:delete')) {
 *   // 显示删除按钮
 * }
 */
export function usePermission() {
  const permissionStore = usePermissionStore();

  /** 判断是否拥有指定权限码 */
  function hasPermission(code: PermissionCode): boolean {
    return permissionStore.hasPermission(code);
  }

  /** 判断是否拥有任一权限码 */
  function hasAnyPermission(codes: PermissionCode[]): boolean {
    return codes.some((code) => permissionStore.hasPermission(code));
  }

  /** 判断是否拥有全部权限码 */
  function hasAllPermissions(codes: PermissionCode[]): boolean {
    return codes.every((code) => permissionStore.hasPermission(code));
  }

  /** 判断是否拥有指定角色（满足其一） */
  function hasRole(checkRoles: Role[]): boolean {
    return permissionStore.hasRole(checkRoles);
  }

  /** 判断是否为超级管理员 */
  function isSuperAdmin(): boolean {
    return permissionStore.isSuperAdmin;
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isSuperAdmin,
  };
}
```

## 路由守卫

```typescript
// router/guard.ts
import type { Router } from 'vue-router';
import { usePermissionStore } from '@/store/usePermissionStore';

/** 白名单路由（无需登录即可访问） */
const WHITE_LIST = ['/login', '/404', '/403'];

/**
 * 注册路由守卫
 * 在 router/index.ts 中调用 setupRouterGuard(router)
 */
export function setupRouterGuard(router: Router) {
  // ==================== 前置守卫 ====================
  router.beforeEach((to, _from, next) => {
    const permissionStore = usePermissionStore();

    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - 管理系统`;
    }

    // 白名单直接放行
    if (WHITE_LIST.includes(to.path)) {
      next();
      return;
    }

    // 需要登录但未登录
    if (to.meta.requiresAuth !== false && !permissionStore.isAuthenticated) {
      next({ path: '/login', query: { redirect: to.fullPath } });
      return;
    }

    // 检查角色权限
    if (to.meta.roles && to.meta.roles.length > 0) {
      if (!permissionStore.hasRole(to.meta.roles)) {
        next('/403');
        return;
      }
    }

    // 检查功能权限
    if (to.meta.permission) {
      if (!permissionStore.hasPermission(to.meta.permission)) {
        next('/403');
        return;
      }
    }

    next();
  });

  // ==================== 后置守卫 ====================
  router.afterEach(() => {
    // 可以在这里关闭 loading 状态
  });
}
```

## 路由配置

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { setupRouterGuard } from './guard';
import type { RouteRecordRaw } from 'vue-router';
import { Role } from '@/types/permission';

// 静态路由（所有用户可访问）
const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/components/Layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: { title: '仪表盘', requiresAuth: true },
      },
      {
        path: 'user/list',
        name: 'UserList',
        component: () => import('@/views/User/List.vue'),
        meta: { title: '用户管理', permission: 'user:view' },
      },
      {
        path: 'user/edit/:id',
        name: 'UserEdit',
        component: () => import('@/views/User/Edit.vue'),
        meta: { title: '编辑用户', permission: 'user:edit' },
      },
      {
        path: 'order/list',
        name: 'OrderList',
        component: () => import('@/views/Order/List.vue'),
        meta: { title: '订单管理', permission: 'order:view' },
      },
      {
        path: 'system/settings',
        name: 'SystemSettings',
        component: () => import('@/views/System/Settings.vue'),
        meta: {
          title: '系统设置',
          roles: [Role.ADMIN, Role.SUPER_ADMIN],
        },
      },
    ],
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/403.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
});

// 注册路由守卫
setupRouterGuard(router);

export default router;
```

## 权限指令

```typescript
// directives/permission.ts
import type { Directive, DirectiveBinding } from 'vue';
import { usePermissionStore } from '@/store/usePermissionStore';

/**
 * v-permission 指令
 * 根据权限码控制元素显示/隐藏
 *
 * @example
 * <el-button v-permission="'user:delete'">删除</el-button>
 * <div v-permission="['user:edit', 'user:delete']">操作区域</div>
 */
export const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const permissionStore = usePermissionStore();
    const { value } = binding;

    if (!value) return;

    const codes = Array.isArray(value) ? value : [value];
    const hasPermission = codes.some((code) => permissionStore.hasPermission(code));

    if (!hasPermission) {
      el.parentNode?.removeChild(el);
    }
  },
};

/**
 * v-role 指令
 * 根据角色控制元素显示/隐藏
 *
 * @example
 * <div v-role="'admin'">管理员区域</div>
 * <div v-role="['admin', 'super_admin']">管理区域</div>
 */
export const vRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const permissionStore = usePermissionStore();
    const { value } = binding;

    if (!value) return;

    const roles = Array.isArray(value) ? value : [value];
    const hasRole = permissionStore.hasRole(roles as any[]);

    if (!hasRole) {
      el.parentNode?.removeChild(el);
    }
  },
};
```

在 `main.ts` 中注册指令：

```typescript
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { vPermission, vRole } from './directives/permission';

const app = createApp(App);

app.directive('permission', vPermission);
app.directive('role', vRole);

app.use(router);
app.mount('#app');
```

## 权限按钮组件

```vue
<!-- components/AuthButton/index.vue -->
<template>
  <el-button v-if="authorized" v-bind="$attrs">
    <slot />
  </el-button>
  <el-tooltip v-else-if="fallback === 'disabled'" :content="noAuthTip">
    <el-button v-bind="$attrs" disabled>
      <slot />
    </el-button>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermission } from '@/composables/usePermission';

interface AuthButtonProps {
  /** 所需权限码 */
  permission: string;
  /** 无权限时的行为：隐藏 | 禁用 */
  fallback?: 'hidden' | 'disabled';
  /** 无权限时的提示文字 */
  noAuthTip?: string;
}

const props = withDefaults(defineProps<AuthButtonProps>(), {
  fallback: 'hidden',
  noAuthTip: '无操作权限',
});

const { hasPermission } = usePermission();

const authorized = computed(() => hasPermission(props.permission));
</script>
```

## 权限包裹组件

```vue
<!-- components/AuthWrapper/index.vue -->
<template>
  <slot v-if="authorized" />
  <slot v-else name="fallback" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermission } from '@/composables/usePermission';

interface AuthWrapperProps {
  /** 所需权限码（满足任一） */
  anyPermission?: string[];
  /** 所需权限码（必须全部） */
  allPermissions?: string[];
  /** 所需角色 */
  roles?: string[];
}

const props = defineProps<AuthWrapperProps>();

const { hasAnyPermission, hasAllPermissions, hasRole } = usePermission();

const authorized = computed(() => {
  if (props.anyPermission) {
    return hasAnyPermission(props.anyPermission);
  }
  if (props.allPermissions) {
    return hasAllPermissions(props.allPermissions);
  }
  if (props.roles) {
    return hasRole(props.roles as any[]);
  }
  return true;
});
</script>
```

## 动态菜单组件

```vue
<!-- components/DynamicMenu/index.vue -->
<template>
  <el-menu
    :default-active="currentPath"
    router
  >
    <template v-for="item in visibleMenus" :key="item.path">
      <!-- 有子菜单 -->
      <el-sub-menu v-if="item.children?.length" :index="item.path">
        <template #title>
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </template>
        <el-menu-item
          v-for="child in filterMenus(item.children)"
          :key="child.path"
          :index="child.path"
        >
          {{ child.label }}
        </el-menu-item>
      </el-sub-menu>

      <!-- 无子菜单 -->
      <el-menu-item v-else :index="item.path">
        <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePermission } from '@/composables/usePermission';
import { MenuItem } from '@/types/permission';
import { usePermissionStore } from '@/store/usePermissionStore';

const route = useRoute();
const { hasPermission, hasRole } = usePermission();
const permissionStore = usePermissionStore();

const currentPath = computed(() => route.path);

/** 递归过滤菜单 */
function filterMenus(menus: MenuItem[]): MenuItem[] {
  return menus
    .filter((item) => {
      if (item.hidden) return false;
      if (item.roles && !hasRole(item.roles)) return false;
      if (item.permission && !hasPermission(item.permission)) return false;
      return true;
    })
    .map((item) => ({
      ...item,
      children: item.children ? filterMenus(item.children) : undefined,
    }));
}

const visibleMenus = computed(() => filterMenus(permissionStore.menus));
</script>
```

## 输出要求

当用户要求实现权限控制时，必须：

1. 提供 RBAC 权限模型（角色 + 权限码）
2. Pinia 权限 Store 含持久化
3. Vue Router beforeEach 路由守卫
4. 自定义指令 v-permission / v-role
5. 权限按钮组件（AuthButton）
6. 权限包裹组件（AuthWrapper）
7. 动态菜单渲染（根据权限过滤）
8. 所有类型定义完整，无 any 类型

## 使用示例

### 用户输入

```
请按照 permission-vue3 规范，实现权限控制体系。

角色：超级管理员、管理员、普通用户
权限码：
- user:view / user:edit / user:delete
- order:view / order:edit
- system:settings
```

### AI 输出

AI 会自动生成：

1. 权限类型定义（角色枚举、权限码、菜单类型）
2. Pinia 权限 Store
3. usePermission Composable
4. 路由守卫（beforeEach）
5. v-permission / v-role 自定义指令
6. AuthButton 权限按钮组件
7. AuthWrapper 权限包裹组件
8. 路由配置示例
9. 动态菜单组件

你只需要：

+ 根据后端接口获取用户权限数据
+ 配置路由和菜单
+ 在登录后调用 setPermission
+ 基本上不用改就能用
