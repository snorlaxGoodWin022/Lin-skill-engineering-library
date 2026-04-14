# Skill: 性能优化（React）

## 使用场景

当需要优化 React 应用性能时使用此Skill，包括但不限于：

- 路由懒加载
- 组件懒加载与代码分割
- 虚拟列表（大数据量渲染）
- 图片懒加载
- React Query 缓存策略
- 防抖节流
- 重渲染优化（memo、useMemo、useCallback）
- Web Vitals 性能监控

## 技术栈

### 核心依赖

- React 18.2
- TypeScript 5.0
- @tanstack/react-query（缓存策略）
- @tanstack/react-virtual（虚拟列表）
- react-lazily（组件懒加载，可选）
- web-vitals（性能指标采集，可选）

### 架构特点

- 按路由级别代码分割
- 细粒度缓存控制
- 大数据量场景虚拟化
- 渲染性能可度量

## 文件结构规范

```
src/
├── components/
│   ├── VirtualList/
│   │   └── index.tsx             # 通用虚拟列表组件
│   ├── LazyImage/
│   │   └── index.tsx             # 图片懒加载组件
│   └── AsyncComponent/
│       └── index.tsx             # 异步组件加载包装
├── hooks/
│   ├── useDebounce.ts            # 防抖 Hook
│   ├── useThrottle.ts            # 节流 Hook
│   └── useIntersectionObserver.ts # 可视区检测 Hook
├── lib/
│   └── performance/
│       ├── monitor.ts            # 性能监控
│       └── types.ts              # 类型定义
└── router/
    └── index.tsx                 # 路由懒加载配置
```

## 1. 路由懒加载

```typescript
// router/index.tsx
import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Spin } from 'antd';

/** 路由级 loading 组件 */
function RouteLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
      <Spin size="large" />
    </div>
  );
}

/**
 * 包装懒加载路由组件
 * 统一添加 Suspense 和 loading 状态
 */
function lazyLoad(factory: () => Promise<{ default: React.ComponentType }>) {
  const Component = lazy(factory);
  return (
    <Suspense fallback={<RouteLoading />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: lazyLoad(() => import('@/pages/Dashboard')),
      },
      {
        path: 'user',
        element: lazyLoad(() => import('@/pages/User')),
      },
      {
        path: 'order',
        element: lazyLoad(() => import('@/pages/Order')),
      },
      {
        path: 'system',
        element: lazyLoad(() => import('@/pages/System')),
      },
    ],
  },
]);
```

## 2. 重渲染优化

### React.memo

```typescript
// 使用 React.memo 避免不必要的重渲染
// 适用于：接收基本类型 props 或浅比较即可的组件

interface UserCardProps {
  name: string;
  avatar: string;
  email: string;
  onClick: (id: string) => void;
}

/**
 * 用户卡片组件
 * props 未变化时跳过重渲染
 */
const UserCard = React.memo(function UserCard({ name, avatar, email, onClick }: UserCardProps) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
});
```

### useMemo + useCallback

```typescript
import { useMemo, useCallback, useState } from 'react';

export default function UserList() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  // ✅ useMemo: 缓存计算结果（搜索过滤）
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  // ✅ useMemo: 缓存复杂对象（传给子组件的 props）
  const tableColumns = useMemo(
    () => [
      { title: '姓名', dataIndex: 'name' },
      { title: '邮箱', dataIndex: 'email' },
    ],
    [],
  );

  // ✅ useCallback: 缓存事件处理函数（传给子组件）
  const handleUserClick = useCallback((id: string) => {
    console.log('User clicked:', id);
  }, []);

  return (
    <div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索用户"
      />
      <Table dataSource={filteredUsers} columns={tableColumns} />
    </div>
  );
}
```

### 何时使用 memo / useMemo / useCallback

| 场景                       | 使用                     | 说明                             |
| -------------------------- | ------------------------ | -------------------------------- |
| 子组件接收基本类型 props   | React.memo               | 避免父组件渲染时子组件跟着渲染   |
| 传递对象/数组给子组件      | useMemo + React.memo     | 缓存引用类型，避免每次创建新引用 |
| 传递回调函数给子组件       | useCallback + React.memo | 缓存函数引用                     |
| 复杂计算（过滤/排序/转换） | useMemo                  | 缓存计算结果                     |
| 简单的值计算               | 不需要                   | 开销小于 memo 本身               |
| 只在当前组件内部使用       | 不需要                   | 没有子组件重渲染问题             |

## 3. 虚拟列表

```typescript
// components/VirtualList/index.tsx
import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  /** 数据源 */
  data: T[];
  /** 每行高度（固定高度模式） */
  itemHeight: number;
  /** 列表可视区高度 */
  height: number;
  /** 过度渲染数量 */
  overscan?: number;
  /** 渲染行内容 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 列表为空时的内容 */
  emptyContent?: React.ReactNode;
}

/**
 * 通用虚拟列表组件
 * 适用于大数据量列表渲染（1000+ 条）
 *
 * @example
 * <VirtualList
 *   data={users}
 *   itemHeight={60}
 *   height={500}
 *   renderItem={(user) => <UserRow key={user.id} user={user} />}
 * />
 */
export default function VirtualList<T>({
  data,
  itemHeight,
  height,
  overscan = 5,
  renderItem,
  emptyContent,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  if (data.length === 0) {
    return <>{emptyContent}</>;
  }

  return (
    <div
      ref={parentRef}
      style={{
        height,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(data[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 4. 图片懒加载

```typescript
// components/LazyImage/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from 'antd';

interface LazyImageProps {
  src: string;
  alt: string;
  /** 占位图 */
  placeholder?: string;
  /** 加载失败图 */
  fallback?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 图片懒加载组件
 * 进入可视区域时才加载图片
 */
export default function LazyImage({
  src,
  alt,
  placeholder,
  fallback,
  className,
  style,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // IntersectionObserver 检测是否进入可视区
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }, // 提前 200px 开始加载
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className} style={style}>
      {!inView && (
        <Skeleton.Image active style={{ width: '100%', height: '100%' }} />
      )}
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      {error && (
        <img
          src={fallback || '/images/image-error.png'}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  );
}
```

## 5. React Query 缓存策略

```typescript
// hooks/useCachedQuery.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'

interface UseCachedQueryOptions<T> {
  /** Query Key */
  queryKey: string[]
  /** 请求函数 */
  queryFn: () => Promise<T>
  /** 缓存时间（毫秒），默认 5 分钟 */
  staleTime?: number
  /** 缓存保留时间（毫秒），默认 30 分钟 */
  gcTime?: number
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 带缓存策略的查询 Hook
 * 封装常用缓存配置
 *
 * @example
 * const { data } = useCachedQuery({
 *   queryKey: ['users'],
 *   queryFn: fetchUsers,
 *   staleTime: 5 * 60 * 1000, // 5 分钟内不重新请求
 * });
 */
export function useCachedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000,
  gcTime = 30 * 60 * 1000,
  enabled = true,
}: UseCachedQueryOptions<T>) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    enabled,
  })
}

/**
 * 缓存失效工具
 * 用于 mutation 成功后刷新数据
 *
 * @example
 * const queryClient = useQueryClient();
 * invalidateRelated(queryClient, [['users'], ['dashboard']]);
 */
export function invalidateRelated(
  queryClient: ReturnType<typeof useQueryClient>,
  keys: string[][]
) {
  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key })
  })
}

/**
 * 预加载查询
 * 用于在用户可能访问的页面前预加载数据
 *
 * @example
 * // 在鼠标悬停时预加载
 * onMouseEnter={() => prefetchQuery(['user', id], () => fetchUser(id))}
 */
export function usePrefetch() {
  const queryClient = useQueryClient()

  const prefetchQuery = <T>(queryKey: string[], queryFn: () => Promise<T>) => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 5 * 60 * 1000,
    })
  }

  return { prefetchQuery }
}
```

## 6. 防抖与节流

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react'

/**
 * 防抖 Hook
 * 延迟更新值，只在停止变化后触发
 * 适用于搜索输入、窗口 resize
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 *
 * useEffect(() => {
 *   // 用 debouncedSearch 发请求
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

```typescript
// hooks/useThrottle.ts
import { useState, useEffect, useRef } from 'react'

/**
 * 节流 Hook
 * 在指定时间间隔内最多触发一次
 * 适用于滚动事件、按钮连续点击
 *
 * @example
 * const throttledScrollY = useThrottle(scrollY, 100);
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastExecuted = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastExecuted.current

    if (elapsed >= interval) {
      lastExecuted.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now()
        setThrottledValue(value)
      }, interval - elapsed)

      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}
```

## 7. 性能监控

```typescript
// lib/performance/monitor.ts
import { onLCP, onFID, onCLS, onTTFB, onINP } from 'web-vitals'

interface PerformanceMetrics {
  LCP?: number // Largest Contentful Paint
  FID?: number // First Input Delay
  CLS?: number // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
  INP?: number // Interaction to Next Paint
}

const metrics: PerformanceMetrics = {}

/**
 * 上报性能指标
 */
function reportMetrics(metric: { name: string; value: number }) {
  const key = metric.name as keyof PerformanceMetrics
  metrics[key] = metric.value

  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms`)
  }

  // 生产环境上报
  if (import.meta.env.PROD) {
    // 上报到分析服务
    navigator.sendBeacon?.('/api/metrics', JSON.stringify(metrics))
  }
}

/**
 * 初始化 Web Vitals 性能监控
 * 在应用入口调用一次
 */
export function setupPerformanceMonitor() {
  onLCP(reportMetrics)
  onFID(reportMetrics)
  onCLS(reportMetrics)
  onTTFB(reportMetrics)
  onINP(reportMetrics)
}

/**
 * 组件渲染耗时测量
 * 用于性能瓶颈排查
 *
 * @example
 * const end = startMeasure('UserList');
 * // ... 渲染逻辑
 * end();
 */
export function startMeasure(label: string): () => void {
  if (import.meta.env.DEV) {
    performance.mark(`${label}-start`)
    return () => {
      performance.mark(`${label}-end`)
      performance.measure(label, `${label}-start`, `${label}-end`)
      const measure = performance.getEntriesByName(label)[0]
      console.log(`[Measure] ${label}: ${measure.duration.toFixed(2)}ms`)
    }
  }
  return () => {}
}
```

## 输出要求

当用户要求性能优化时，必须：

1. 分析性能瓶颈场景（渲染、网络、加载）
2. 路由级懒加载 + Suspense
3. 重渲染优化（memo/useMemo/useCallback 使用指南）
4. 虚拟列表组件（支持大数据量）
5. React Query 缓存策略
6. 防抖/节流 Hook
7. 性能监控（Web Vitals）
8. 提供优化前后对比指标

## 使用示例

### 用户输入

```
请按照 performance-react 规范，优化列表页面性能。

问题：
- 用户列表 5000+ 条数据渲染卡顿
- 搜索输入每次击键都发请求
- 切换页面后数据需要重新加载
```

### AI 输出

AI 会自动生成：

1. VirtualList 虚拟列表组件（替代 Table）
2. useDebounce Hook（搜索防抖）
3. useCachedQuery Hook（数据缓存）
4. 路由懒加载配置
5. 性能监控接入

你只需要：

- 将 Table 替换为 VirtualList
- 搜索输入加 useDebounce
- 配置合适的缓存时间
- 基本上不用改就能用
