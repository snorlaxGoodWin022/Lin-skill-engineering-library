# Skill: API 层代码生成器 (React)

## 使用场景

用于快速生成规范的 API 请求层代码，适用于：
- RESTful API 封装
- 与 React Query 集成的数据请求
- 统一的错误处理和请求拦截
- TypeScript 类型安全的 API 调用

## 技术栈

### 核心依赖
- Axios（HTTP 客户端）
- @tanstack/react-query（数据请求和缓存）
- TypeScript 5（类型支持）
- Zod（运行时类型校验，可选）

### 架构分层
```
API 层架构：
┌─────────────────────────────────────────┐
│              业务组件层                  │
├─────────────────────────────────────────┤
│    React Query Hooks (useQuery/useMutation)  │
├─────────────────────────────────────────┤
│         API 函数层 (api/*.ts)           │
├─────────────────────────────────────────┤
│         请求实例 (utils/request.ts)      │
├─────────────────────────────────────────┤
│           Axios 实例配置                 │
└─────────────────────────────────────────┘
```

## 文件结构规范

```
src/
├── api/
│   ├── index.ts              # API 统一导出
│   ├── user.ts               # 用户相关 API
│   ├── product.ts            # 商品相关 API
│   └── types/
│       ├── user.ts           # 用户相关类型
│       └── common.ts         # 公共类型
├── hooks/
│   ├── queries/
│   │   ├── useUser.ts        # 用户查询 Hooks
│   │   └── useProduct.ts     # 商品查询 Hooks
│   └── mutations/
│       ├── useUserMutation.ts # 用户变更 Hooks
│       └── useProductMutation.ts
├── utils/
│   ├── request.ts            # Axios 实例
│   └── api-helpers.ts        # API 辅助函数
└── types/
    └── api.d.ts              # 全局 API 类型声明
```

## Axios 实例配置

### 1. 基础请求实例

```typescript
// utils/request.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { message } from 'antd'

// 响应数据结构
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// 分页响应结构
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

// 创建 Axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加 Token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加请求 ID（用于追踪）
    config.headers['X-Request-ID'] = crypto.randomUUID()

    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response

    // 业务状态码判断
    if (data.code === 0) {
      return data.data
    }

    // 业务错误处理
    const errorMessage = data.message || '请求失败'
    message.error(errorMessage)

    // 特定错误码处理
    if (data.code === 401) {
      // 未授权，跳转登录
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(new Error(errorMessage))
  },
  (error: AxiosError<ApiResponse>) => {
    // HTTP 错误处理
    if (error.response) {
      const status = error.response.status
      const errorMessage = error.response.data?.message || getHttpErrorMessage(status)

      message.error(errorMessage)

      if (status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请重试')
    } else {
      message.error('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

// HTTP 错误信息映射
function getHttpErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权，请重新登录',
    403: '没有权限访问',
    404: '请求的资源不存在',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务暂不可用',
    504: '网关超时',
  }
  return messages[status] || `请求失败 (${status})`
}

// 封装请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config)
  },

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.patch(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config)
  },
}

export default request
```

### 2. API 辅助函数

```typescript
// utils/api-helpers.ts
import type { PaginatedResponse } from './request'

/**
 * 构建分页参数
 */
export function buildPaginationParams(
  pageNum: number = 1,
  pageSize: number = 20
): { pageNum: number; pageSize: number } {
  return { pageNum, pageSize }
}

/**
 * 构建查询参数（移除空值）
 */
export function buildQueryParams<T extends Record<string, any>>(params: T): Partial<T> {
  const result: Partial<T> = {}

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      result[key as keyof T] = value
    }
  })

  return result
}

/**
 * 构建日期范围参数
 */
export function buildDateRangeParams(
  startDate?: string,
  endDate?: string
): { startDate?: string; endDate?: string } {
  const params: { startDate?: string; endDate?: string } = {}

  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate

  return params
}

/**
 * 提取分页数据
 */
export function extractPagination<T>(response: PaginatedResponse<T>) {
  return {
    list: response.list,
    total: response.total,
    pageNum: response.pageNum,
    pageSize: response.pageSize,
    hasMore: response.pageNum * response.pageSize < response.total,
  }
}
```

## API 函数层规范

### 1. 类型定义

```typescript
// api/types/user.ts

// 用户信息
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
  status: 'active' | 'inactive'
  createTime: string
  updateTime: string
}

// 用户列表查询参数
export interface UserListParams {
  pageNum: number
  pageSize: number
  keyword?: string
  role?: string
  status?: string
}

// 创建用户参数
export interface CreateUserParams {
  username: string
  email: string
  password: string
  role: string
}

// 更新用户参数
export interface UpdateUserParams {
  username?: string
  email?: string
  avatar?: string
  role?: string
  status?: string
}
```

### 2. API 函数

```typescript
// api/user.ts
import request from '@/utils/request'
import { buildQueryParams } from '@/utils/api-helpers'
import type { User, UserListParams, CreateUserParams, UpdateUserParams } from './types/user'
import type { PaginatedResponse } from '@/utils/request'

/**
 * 获取用户列表
 */
export async function fetchUserList(
  params: UserListParams
): Promise<PaginatedResponse<User>> {
  return request.get('/users', {
    params: buildQueryParams(params),
  })
}

/**
 * 获取用户详情
 */
export async function fetchUserDetail(id: string): Promise<User> {
  return request.get(`/users/${id}`)
}

/**
 * 创建用户
 */
export async function createUser(data: CreateUserParams): Promise<User> {
  return request.post('/users', data)
}

/**
 * 更新用户
 */
export async function updateUser(id: string, data: UpdateUserParams): Promise<User> {
  return request.put(`/users/${id}`, data)
}

/**
 * 删除用户
 */
export async function deleteUser(id: string): Promise<void> {
  return request.delete(`/users/${id}`)
}

/**
 * 批量删除用户
 */
export async function batchDeleteUsers(ids: string[]): Promise<void> {
  return request.post('/users/batch-delete', { ids })
}

/**
 * 更新用户状态
 */
export async function updateUserStatus(
  id: string,
  status: 'active' | 'inactive'
): Promise<void> {
  return request.patch(`/users/${id}/status`, { status })
}
```

## React Query Hooks 规范

### 1. 查询 Hooks

```typescript
// hooks/queries/useUser.ts
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { fetchUserList, fetchUserDetail } from '@/api/user'
import type { User, UserListParams } from '@/api/types/user'
import type { PaginatedResponse } from '@/utils/request'

/**
 * 用户列表查询 Hook
 */
export function useUserList(
  params: UserListParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<User>, Error, PaginatedResponse<User>>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<PaginatedResponse<User>, Error> {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: () => fetchUserList(params),
    staleTime: 5 * 60 * 1000, // 5 分钟
    ...options,
  })
}

/**
 * 用户详情查询 Hook
 */
export function useUserDetail(
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<User, Error, User>,
    'queryKey' | 'queryFn' | 'enabled'
  >
): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => fetchUserDetail(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 分钟
    ...options,
  })
}

/**
 * 用户选项列表 Hook（用于下拉选择）
 */
export function useUserOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['users', 'options'],
    queryFn: () =>
      fetchUserList({
        pageNum: 1,
        pageSize: 1000,
        status: 'active',
      }),
    staleTime: 30 * 60 * 1000, // 30 分钟
  })

  const options = data?.list.map((user) => ({
    label: user.username,
    value: user.id,
  })) || []

  return { options, isLoading }
}
```

### 2. 变更 Hooks

```typescript
// hooks/mutations/useUserMutation.ts
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import {
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  updateUserStatus,
} from '@/api/user'
import type { User, CreateUserParams, UpdateUserParams } from '@/api/types/user'

/**
 * 创建用户 Hook
 */
export function useCreateUser(
  options?: Omit<
    UseMutationOptions<User, Error, CreateUserParams>,
    'mutationFn'
  >
): UseMutationResult<User, Error, CreateUserParams> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      message.success('创建成功')
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
    },
    onError: (error) => {
      message.error(`创建失败: ${error.message}`)
    },
    ...options,
  })
}

/**
 * 更新用户 Hook
 */
export function useUpdateUser(
  options?: Omit<
    UseMutationOptions<User, Error, { id: string; data: UpdateUserParams }>,
    'mutationFn'
  >
): UseMutationResult<User, Error, { id: string; data: UpdateUserParams }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (data, variables) => {
      message.success('更新成功')
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
      queryClient.setQueryData(['users', 'detail', variables.id], data)
    },
    onError: (error) => {
      message.error(`更新失败: ${error.message}`)
    },
    ...options,
  })
}

/**
 * 删除用户 Hook
 */
export function useDeleteUser(
  options?: Omit<
    UseMutationOptions<void, Error, string>,
    'mutationFn'
  >
): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
    },
    ...options,
  })
}

/**
 * 批量删除用户 Hook
 */
export function useBatchDeleteUsers(
  options?: Omit<
    UseMutationOptions<void, Error, string[]>,
    'mutationFn'
  >
): UseMutationResult<void, Error, string[]> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchDeleteUsers,
    onSuccess: () => {
      message.success('批量删除成功')
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
    },
    ...options,
  })
}

/**
 * 更新用户状态 Hook
 */
export function useUpdateUserStatus(
  options?: Omit<
    UseMutationOptions<void, Error, { id: string; status: 'active' | 'inactive' }>,
    'mutationFn'
  >
): UseMutationResult<void, Error, { id: string; status: 'active' | 'inactive' }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => updateUserStatus(id, status),
    onSuccess: (_, variables) => {
      message.success('状态更新成功')
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', variables.id] })
    },
    ...options,
  })
}
```

## 组件中使用示例

```typescript
// components/UserList.tsx
import { useState } from 'react'
import { Table, Button, Space, message } from 'antd'
import { useUserList, useUserOptions } from '@/hooks/queries/useUser'
import { useDeleteUser, useBatchDeleteUsers } from '@/hooks/mutations/useUserMutation'

export default function UserList() {
  const [params, setParams] = useState({
    pageNum: 1,
    pageSize: 20,
    keyword: '',
  })

  // 查询用户列表
  const { data, isLoading, refetch } = useUserList(params)

  // 删除单个用户
  const deleteMutation = useDeleteUser({
    onSuccess: () => {
      // 可以执行额外操作
    },
  })

  // 批量删除
  const batchDeleteMutation = useBatchDeleteUsers()

  // 处理删除
  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  // 处理批量删除
  const handleBatchDelete = async (ids: string[]) => {
    await batchDeleteMutation.mutateAsync(ids)
  }

  return (
    <div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list}
        pagination={{
          current: params.pageNum,
          pageSize: params.pageSize,
          total: data?.total,
          onChange: (pageNum, pageSize) => setParams({ ...params, pageNum, pageSize }),
        }}
      />
    </div>
  )
}
```

## 乐观更新示例

```typescript
// hooks/mutations/useUpdateUserOptimistic.ts
import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { updateUser } from '@/api/user'
import type { User, UpdateUserParams } from '@/api/types/user'

export function useUpdateUserOptimistic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserParams }) =>
      updateUser(id, data),

    // 乐观更新：在请求发出前立即更新 UI
    onMutate: async ({ id, data }) => {
      // 取消正在进行的查询，防止覆盖乐观更新
      await queryClient.cancelQueries({ queryKey: ['users', 'detail', id] })

      // 保存旧数据以便回滚
      const previousUser = queryClient.getQueryData<User>(['users', 'detail', id])

      // 乐观更新详情
      if (previousUser) {
        queryClient.setQueryData<User>(['users', 'detail', id], {
          ...previousUser,
          ...data,
        })
      }

      return { previousUser }
    },

    // 错误时回滚
    onError: (err, { id }, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['users', 'detail', id], context.previousUser)
      }
    },

    // 无论成功失败，都重新获取最新数据
    onSettled: (data, err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', id] })
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
    },
  })
}
```

## 输出要求

生成 API 层代码时必须：

1. 包含完整的 TypeScript 类型定义
2. Axios 实例配置包含请求/响应拦截器
3. 统一的错误处理机制
4. API 函数命名规范（fetch* 查询，create/update/delete 变更）
5. React Query Hooks 封装，包含缓存策略
6. 乐观更新支持
7. 分页数据处理
8. 批量操作支持

## 使用示例

### 用户输入

```
按 API 层模板生成订单模块的 API 代码。

API 接口：
- GET /orders - 订单列表（支持分页、状态筛选、日期范围）
- GET /orders/:id - 订单详情
- POST /orders - 创建订单
- PUT /orders/:id - 更新订单
- DELETE /orders/:id - 删除订单
- POST /orders/:id/cancel - 取消订单
- POST /orders/:id/complete - 完成订单

订单类型字段：
- id: string
- orderNo: string
- customer: string
- amount: number
- status: 'pending' | 'processing' | 'completed' | 'cancelled'
- items: OrderItem[]
- createTime: string
```

### AI 输出

自动生成：
- `api/order.ts` - API 函数
- `api/types/order.ts` - 类型定义
- `hooks/queries/useOrder.ts` - 查询 Hooks
- `hooks/mutations/useOrderMutation.ts` - 变更 Hooks
- 包含 React Query 缓存配置
- 包含乐观更新支持
