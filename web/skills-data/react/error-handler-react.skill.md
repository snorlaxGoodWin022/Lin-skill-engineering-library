# Skill: 错误处理（React）

## 使用场景

当需要实现前端错误处理体系时使用此Skill，包括但不限于：

- 全局错误边界（Error Boundary）
- API 请求错误统一拦截
- 业务错误码处理
- 错误日志上报
- 用户友好的错误提示

## 技术栈

### 核心依赖

- React 18.2
- TypeScript 5.0
- Axios 1.x（HTTP 请求拦截）
- Ant Design 5.x（错误提示组件）
- Sentry / 自建日志服务（错误上报，可选）

### 架构特点

- 分层错误处理：组件级 → 页面级 → 全局级
- 统一错误码映射
- 自动错误上报
- 优雅降级 UI

## 文件结构规范

```
src/
├── components/
│   └── ErrorBoundary/
│       ├── index.tsx              # 全局错误边界组件
│       ├── FallbackUI.tsx         # 错误降级 UI
│       └── withErrorBoundary.tsx  # HOC 包装器
├── hooks/
│   └── useErrorHandler.ts         # 错误处理 Hook
├── lib/
│   ├── axios/
│   │   ├── instance.ts            # Axios 实例（含拦截器）
│   │   ├── errorMapping.ts        # 错误码映射表
│   │   └── types.ts               # 错误类型定义
│   └── logger/
│       ├── index.ts               # 日志上报统一入口
│       └── types.ts               # 日志类型
└── pages/
    ├── 404.tsx                    # 404 页面
    └── 500.tsx                    # 500 页面
```

## 类型定义

```typescript
// lib/axios/types.ts

/** HTTP 业务错误码 */
export enum BizErrorCode {
  // 通用错误 1xxx
  UNKNOWN = 1000,
  PARAM_ERROR = 1001,
  UNAUTHORIZED = 1002,
  FORBIDDEN = 1003,
  NOT_FOUND = 1004,
  SERVER_ERROR = 1005,
  TOO_MANY_REQUESTS = 1006,

  // 用户模块 2xxx
  USER_NOT_FOUND = 2001,
  USER_DISABLED = 2002,
  TOKEN_EXPIRED = 2003,
  TOKEN_INVALID = 2004,

  // 业务模块 3xxx
  ORDER_NOT_FOUND = 3001,
  ORDER_STATUS_ERROR = 3002,
  STOCK_NOT_ENOUGH = 3003,
}

/** 后端错误响应结构 */
export interface ApiErrorResponse {
  code: BizErrorCode
  message: string
  data?: unknown
  fieldErrors?: Record<string, string>
}

/** 错误处理级别 */
export type ErrorLevel = 'toast' | 'modal' | 'page' | 'silent'

/** 错误处理策略 */
export interface ErrorHandlerConfig {
  level: ErrorLevel
  message?: string
  report?: boolean
  redirect?: string
}
```

## 错误码映射表

```typescript
// lib/axios/errorMapping.ts
import { BizErrorCode, ErrorHandlerConfig } from './types'

/**
 * 错误码 → 处理策略映射表
 * 统一管理所有业务错误码的处理方式
 */
export const errorMapping: Record<number, ErrorHandlerConfig> = {
  // 通用错误
  [BizErrorCode.PARAM_ERROR]: {
    level: 'toast',
    message: '参数错误，请检查输入',
  },
  [BizErrorCode.UNAUTHORIZED]: {
    level: 'page',
    redirect: '/login',
    message: '请先登录',
  },
  [BizErrorCode.TOKEN_EXPIRED]: {
    level: 'page',
    redirect: '/login',
    message: '登录已过期，请重新登录',
  },
  [BizErrorCode.TOKEN_INVALID]: {
    level: 'page',
    redirect: '/login',
    message: '认证失败，请重新登录',
  },
  [BizErrorCode.FORBIDDEN]: {
    level: 'page',
    redirect: '/403',
    message: '无权访问',
  },
  [BizErrorCode.NOT_FOUND]: {
    level: 'page',
    redirect: '/404',
    message: '资源不存在',
  },
  [BizErrorCode.SERVER_ERROR]: {
    level: 'modal',
    message: '服务器开小差了，请稍后重试',
    report: true,
  },
  [BizErrorCode.TOO_MANY_REQUESTS]: {
    level: 'toast',
    message: '操作过于频繁，请稍后重试',
  },

  // 用户模块
  [BizErrorCode.USER_NOT_FOUND]: {
    level: 'toast',
    message: '用户不存在',
  },
  [BizErrorCode.USER_DISABLED]: {
    level: 'modal',
    message: '账号已被禁用，请联系管理员',
  },

  // 业务模块
  [BizErrorCode.ORDER_NOT_FOUND]: {
    level: 'toast',
    message: '订单不存在',
  },
  [BizErrorCode.ORDER_STATUS_ERROR]: {
    level: 'toast',
    message: '订单状态异常，请刷新后重试',
  },
  [BizErrorCode.STOCK_NOT_ENOUGH]: {
    level: 'toast',
    message: '库存不足，请调整数量',
  },
}

/**
 * 获取错误处理策略
 * 未配置的错误码返回默认策略
 */
export function getErrorConfig(code: number): ErrorHandlerConfig {
  return (
    errorMapping[code] ?? {
      level: 'toast',
      message: '操作失败，请稍后重试',
      report: true,
    }
  )
}
```

## Axios 拦截器

```typescript
// lib/axios/instance.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message, Modal } from 'antd'
import { ApiErrorResponse, BizErrorCode } from './types'
import { getErrorConfig } from './errorMapping'
import { reportError } from '../logger'

/** 创建 Axios 实例 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==================== 请求拦截器 ====================
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 注入 Token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// ==================== 响应拦截器 ====================
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, data, message: msg } = response.data

    // 业务成功（code === 0 或 code === 200 视为成功）
    if (code === 0 || code === 200) {
      return data
    }

    // 业务错误 → 走统一错误处理
    handleBizError({ code, message: msg, data })
    return Promise.reject(new Error(msg))
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // HTTP 状态码错误
    handleHttpError(error)
    return Promise.reject(error)
  }
)

/**
 * 处理业务错误
 * 根据错误码映射表决定处理方式
 */
function handleBizError(response: ApiErrorResponse): void {
  const config = getErrorConfig(response.code)

  switch (config.level) {
    case 'toast':
      message.error(config.message || response.message)
      break

    case 'modal':
      Modal.error({
        title: '操作失败',
        content: config.message || response.message,
      })
      break

    case 'page':
      if (config.redirect) {
        window.location.href = config.redirect
      }
      break

    case 'silent':
      // 静默处理，不提示用户
      break
  }

  // 需要上报的错误
  if (config.report) {
    reportError({
      type: 'biz',
      code: response.code,
      message: response.message,
    })
  }
}

/**
 * 处理 HTTP 状态码错误
 * 401 → 登录过期
 * 403 → 无权限
 * 404 → 资源不存在
 * 500 → 服务器错误
 * 网络 → 网络异常
 */
function handleHttpError(error: AxiosError<ApiErrorResponse>): void {
  const status = error.response?.status

  const httpErrorMap: Record<number, string> = {
    400: '请求参数错误',
    401: '登录已过期，请重新登录',
    403: '无权访问该资源',
    404: '请求的资源不存在',
    408: '请求超时',
    429: '操作过于频繁',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务暂不可用',
  }

  if (status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }

  const errorMessage = httpErrorMap[status ?? 0] ?? '网络异常，请检查网络连接'

  message.error(errorMessage)

  // 5xx 错误上报
  if (status && status >= 500) {
    reportError({
      type: 'http',
      code: status,
      message: error.message,
      url: error.config?.url,
    })
  }
}

export default request
```

## Error Boundary 组件

```typescript
// components/ErrorBoundary/index.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { reportError } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 自定义降级 UI */
  fallback?: ReactNode;
  /** 错误发生时的回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 是否为页面级边界（影响降级 UI 样式） */
  isPage?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 全局错误边界组件
 * 捕获子组件树中的 JavaScript 错误，防止整个应用崩溃
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 上报错误
    reportError({
      type: 'runtime',
      message: error.message,
      stack: errorInfo.componentStack,
    });

    // 回调
    this.props.onError?.(error, errorInfo);

    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 自定义降级 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 页面级错误
      if (this.props.isPage) {
        return (
          <Result
            status="500"
            title="页面出了点问题"
            subTitle="抱歉，页面发生了意外错误。请尝试刷新页面。"
            extra={[
              <Button key="retry" type="primary" onClick={this.handleReset}>
                重试
              </Button>,
              <Button key="reload" onClick={this.handleReload}>
                刷新页面
              </Button>,
            ]}
          />
        );
      }

      // 组件级错误 —— 轻量降级
      return (
        <Result
          status="warning"
          title="组件加载失败"
          extra={
            <Button type="link" onClick={this.handleReset}>
              点击重试
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}
```

## HOC 包装器

```typescript
// components/ErrorBoundary/withErrorBoundary.tsx
import React, { ComponentType } from 'react';
import { ErrorBoundary } from './index';

interface WithErrorBoundaryOptions {
  isPage?: boolean;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * HOC：为组件包装 ErrorBoundary
 * 用于给特定组件或页面添加错误边界
 *
 * @example
 * const SafeChart = withErrorBoundary(ChartComponent, { isPage: false });
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryOptions = {},
): ComponentType<P> {
  const { isPage = false, fallback, onError } = options;

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary isPage={isPage} fallback={fallback} onError={onError}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName ?? WrappedComponent.name})`;

  return ComponentWithErrorBoundary;
}
```

## 错误处理 Hook

```typescript
// hooks/useErrorHandler.ts
import { useCallback } from 'react'
import { message, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import { reportError } from '@/lib/logger'

interface UseErrorHandlerOptions {
  /** 默认错误提示方式 */
  defaultLevel?: 'toast' | 'modal' | 'silent'
  /** 错误回调 */
  onError?: (error: unknown) => void
}

interface ErrorAction {
  toast?: string
  modal?: { title: string; content: string }
  redirect?: string
  report?: boolean
}

/**
 * 统一错误处理 Hook
 * 用于在组件中处理 try/catch 中的错误
 *
 * @example
 * const { handleError } = useErrorHandler();
 *
 * try {
 *   await someAction();
 * } catch (error) {
 *   handleError(error);
 * }
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { defaultLevel = 'toast', onError } = options
  const navigate = useNavigate()

  const handleError = useCallback(
    (error: unknown, action?: ErrorAction) => {
      const errorMessage = error instanceof Error ? error.message : '操作失败，请稍后重试'

      // 执行自定义回调
      onError?.(error)

      // 应用自定义处理策略
      if (action) {
        if (action.toast) {
          message.error(action.toast)
        }
        if (action.modal) {
          Modal.error({
            title: action.modal.title,
            content: action.modal.content,
          })
        }
        if (action.redirect) {
          navigate(action.redirect)
        }
        if (action.report) {
          reportError({
            type: 'handled',
            message: errorMessage,
          })
        }
        return
      }

      // 默认处理
      switch (defaultLevel) {
        case 'toast':
          message.error(errorMessage)
          break
        case 'modal':
          Modal.error({
            title: '操作失败',
            content: errorMessage,
          })
          break
        case 'silent':
          break
      }
    },
    [defaultLevel, navigate, onError]
  )

  return { handleError }
}
```

## 错误日志上报

```typescript
// lib/logger/index.ts
import { AxiosRequestConfig } from 'axios'
import request from '../axios/instance'

/** 错误日志条目 */
interface ErrorLog {
  type: 'runtime' | 'http' | 'biz' | 'handled'
  message: string
  code?: number
  stack?: string
  url?: string
  timestamp?: number
  userAgent?: string
  extra?: Record<string, unknown>
}

/** 是否启用错误上报 */
const REPORT_ENABLED = import.meta.env.VITE_ERROR_REPORT === 'true'

/** 错误上报队列（防抖合并） */
let reportQueue: ErrorLog[] = []
let reportTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 上报错误日志
 * 自动收集上下文信息，队列化批量上报
 */
export function reportError(log: Omit<ErrorLog, 'timestamp' | 'userAgent'>): void {
  const errorLog: ErrorLog = {
    ...log,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  }

  // 控制台输出（开发环境）
  if (import.meta.env.DEV) {
    console.error('[ErrorReport]', errorLog)
  }

  // 生产环境上报
  if (!REPORT_ENABLED) return

  reportQueue.push(errorLog)

  // 防抖：500ms 内合并上报
  if (reportTimer) clearTimeout(reportTimer)
  reportTimer = setTimeout(flushReport, 500)
}

/** 批量上报队列 */
async function flushReport(): Promise<void> {
  if (reportQueue.length === 0) return

  const logs = [...reportQueue]
  reportQueue = []

  try {
    await request.post('/api/error-report', { logs })
  } catch {
    // 上报失败静默处理，避免无限循环
    console.warn('[ErrorReport] 上报失败')
  }
}

/**
 * 注册全局未捕获错误监听
 * 在应用入口调用一次即可
 */
export function setupGlobalErrorHandler(): void {
  // 未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault()
    reportError({
      type: 'runtime',
      message: `Unhandled rejection: ${event.reason}`,
    })
  })

  // 未捕获的 JS 错误
  window.onerror = (message, source, lineno, colno, error) => {
    reportError({
      type: 'runtime',
      message: String(message),
      stack: error?.stack,
    })
  }
}
```

## 应用入口配置

```typescript
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { setupGlobalErrorHandler } from '@/lib/logger';
import App from './App';

// 初始化全局错误监听
setupGlobalErrorHandler();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary isPage>
      <BrowserRouter>
        <ConfigProvider>
          <AntApp>
            <App />
          </AntApp>
        </ConfigProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
```

## 组件中使用示例

```typescript
// pages/UserProfile/index.tsx
import React from 'react';
import { Button, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { fetchUserProfile } from '@/api/user';

export default function UserProfile() {
  const { handleError } = useErrorHandler({
    onError: (error) => {
      console.error('Profile load failed:', error);
    },
  });

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  if (isLoading) return <Spin />;
  if (error) {
    handleError(error, {
      toast: '加载用户信息失败',
      report: true,
    });
    return <div>加载失败，请刷新重试</div>;
  }

  return (
    <ErrorBoundary>
      <div>
        <h1>{profile.name}</h1>
        <Button onClick={() => { /* ... */ }}>编辑</Button>
      </div>
    </ErrorBoundary>
  );
}
```

## 输出要求

当用户要求实现错误处理时，必须：

1. 提供完整的错误处理分层架构（组件级 → 页面级 → 全局级）
2. 包含 Axios 请求/响应拦截器的错误处理
3. 错误码映射表完整，覆盖常见业务场景
4. ErrorBoundary 组件支持页面级和组件级两种模式
5. 错误日志上报机制（含防抖队列）
6. 所有类型定义完整，无 any 类型
7. 提供应用入口集成示例

## 使用示例

### 用户输入

```
请按照 error-handler-react 规范，实现项目错误处理体系。

需求：
- 登录过期自动跳转
- 403 无权限页面
- 网络异常友好提示
- 生产环境错误上报到 Sentry
```

### AI 输出

AI 会自动生成：

1. Axios 实例（含请求/响应拦截器）
2. 错误码映射表（含登录过期、权限、网络错误处理）
3. ErrorBoundary 组件（页面级 + 组件级）
4. useErrorHandler Hook
5. 错误日志上报模块（对接 Sentry）
6. 应用入口集成代码

你只需要：

- 根据实际后端错误码调整映射表
- 配置 Sentry DSN
- 在 App 入口引入
- 基本上不用改就能用
