# Skill: 性能优化（Vue 3）

## 使用场景

当需要优化 Vue 3 应用性能时使用此Skill，包括但不限于：
- 路由懒加载
- 组件懒加载与异步组件
- 虚拟列表（大数据量渲染）
- 图片懒加载
- TanStack Query 缓存策略
- 防抖节流
- 响应式优化（shallowRef、markRaw）
- Web Vitals 性能监控

## 技术栈

### 核心依赖
- Vue 3.3+
- TypeScript 5.0
- @tanstack/vue-query（缓存策略）
- @tanstack/vue-virtual（虚拟列表）
- web-vitals（性能指标采集，可选）

### 架构特点
- 按路由级别代码分割
- 细粒度缓存控制
- 大数据量场景虚拟化
- Vue 3 响应式性能优化
- 渲染性能可度量

## 文件结构规范

```
src/
├── components/
│   ├── VirtualList/
│   │   └── index.vue             # 通用虚拟列表组件
│   ├── LazyImage/
│   │   └── index.vue             # 图片懒加载组件
│   └── AsyncComponent/
│       └── index.vue             # 异步组件包装
├── composables/
│   ├── useDebounce.ts            # 防抖 Composable
│   ├── useThrottle.ts            # 节流 Composable
│   └── useIntersectionObserver.ts # 可视区检测 Composable
├── lib/
│   └── performance/
│       ├── monitor.ts            # 性能监控
│       └── types.ts              # 类型定义
└── router/
    └── index.ts                  # 路由懒加载配置
```

## 1. 路由懒加载

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/components/Layout/index.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        // ✅ 路由级懒加载：访问时才下载
        component: () => import('@/views/Dashboard/index.vue'),
      },
      {
        path: 'user',
        name: 'UserList',
        component: () => import('@/views/User/List.vue'),
      },
      {
        path: 'order',
        name: 'OrderList',
        component: () => import('@/views/Order/List.vue'),
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('@/views/System/index.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

## 2. 异步组件

```typescript
// 组件级懒加载
import { defineAsyncComponent } from 'vue';

// 基础用法
const HeavyChart = defineAsyncComponent(
  () => import('@/components/HeavyChart/index.vue'),
);

// 带加载状态
const HeavyTable = defineAsyncComponent({
  loader: () => import('@/components/HeavyTable/index.vue'),
  loadingComponent: () => import('@/components/LoadingSpinner.vue'),
  delay: 200, // 延迟 200ms 显示 loading（避免闪烁）
  timeout: 10000, // 超时 10s 显示错误
});
```

## 3. 响应式优化

### shallowRef vs ref

```typescript
import { ref, shallowRef, triggerRef } from 'vue';

// ❌ ref：深层响应式 —— 大对象性能开销大
const bigData = ref({
  list: new Array(10000).fill(null).map((_, i) => ({ id: i, name: `Item ${i}` })),
  meta: { total: 10000, page: 1 },
});

// ✅ shallowRef：浅层响应式 —— 大对象推荐
const bigDataShallow = shallowRef<{
  list: Array<{ id: number; name: string }>;
  meta: { total: number; page: number };
}>({
  list: new Array(10000).fill(null).map((_, i) => ({ id: i, name: `Item ${i}` })),
  meta: { total: 10000, page: 1 },
});

// shallowRef 更新时需要替换整个引用
function updateList(newList: Array<{ id: number; name: string }>) {
  bigDataShallow.value = {
    ...bigDataShallow.value,
    list: newList,
  };
}

// 或者手动触发更新
function mutateAndTrigger() {
  bigDataShallow.value.list.push({ id: 10001, name: 'New Item' });
  triggerRef(bigDataShallow); // 手动通知依赖更新
}
```

### markRaw — 跳过响应式转换

```typescript
import { reactive, markRaw } from 'vue';
import { useRouter } from 'vue-router';

// ❌ router 实例不需要响应式，放进 reactive 会增加开销
const state = reactive({
  router: useRouter(), // 会递归做 proxy 代理
});

// ✅ 使用 markRaw 跳过
const stateOptimized = reactive({
  router: markRaw(useRouter()), // 不做响应式转换
});
```

### v-once 和 v-memo

```vue
<template>
  <!-- v-once: 只渲染一次，后续不更新（静态内容） -->
  <div v-once>
    <h1>{{ appTitle }}</h1>
  </div>

  <!-- v-memo: 条件性缓存，依赖不变则不更新 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.selected]">
    <span>{{ item.name }}</span>
    <span>{{ item.selected ? '已选' : '未选' }}</span>
  </div>

  <!-- v-memo 空数组 = 永远不更新（等价 v-once） -->
  <div v-memo="[]">
    <p>这段内容只在首次渲染</p>
  </div>
</template>
```

### 何时使用响应式优化

| 场景 | 使用 | 说明 |
|------|------|------|
| 大型数据对象（API 返回的列表） | shallowRef | 避免深层 proxy 代理开销 |
| 第三方库实例（ECharts、Map、Router） | markRaw | 跳过不需要的响应式转换 |
| 纯静态内容（标题、图标） | v-once | 只渲染一次 |
| 列表项中部分变化 | v-memo | 条件性跳过 diff |
| 简单数据（string/number） | ref | 开销很小，不需要优化 |

## 4. 虚拟列表

```vue
<!-- components/VirtualList/index.vue -->
<template>
  <div
    ref="containerRef"
    :style="{ height: `${height}px`, overflow: 'auto' }"
  >
    <div
      :style="{
        height: `${totalSize}px`,
        width: '100%',
        position: 'relative',
      }"
    >
      <div
        v-for="virtualItem in virtualItems"
        :key="virtualItem.key"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualItem.size}px`,
          transform: `translateY(${virtualItem.start}px)`,
        }"
      >
        <slot :item="data[virtualItem.index]" :index="virtualItem.index" />
      </div>
    </div>
  </div>
  <div v-if="data.length === 0">
    <slot name="empty" />
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';

interface VirtualListProps {
  /** 数据源 */
  data: T[];
  /** 每行高度 */
  itemHeight: number;
  /** 列表可视区高度 */
  height: number;
  /** 过度渲染数量 */
  overscan?: number;
}

const props = withDefaults(defineProps<VirtualListProps>(), {
  overscan: 5,
});

const containerRef = ref<HTMLDivElement>();

const virtualizer = useVirtualizer({
  get count() {
    return props.data.length;
  },
  getScrollElement: () => containerRef.value,
  estimateSize: () => props.itemHeight,
  overscan: props.overscan,
});

const virtualItems = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());
</script>
```

使用示例：

```vue
<template>
  <VirtualList
    :data="users"
    :item-height="60"
    :height="500"
  >
    <template #default="{ item }">
      <div class="user-row">
        <span>{{ item.name }}</span>
        <span>{{ item.email }}</span>
      </div>
    </template>
    <template #empty>
      <el-empty description="暂无数据" />
    </template>
  </VirtualList>
</template>

<script setup lang="ts">
import VirtualList from '@/components/VirtualList/index.vue';
import { ref } from 'vue';

interface User {
  id: number;
  name: string;
  email: string;
}

const users = ref<User[]>([]);
</script>
```

## 5. 图片懒加载

```vue
<!-- components/LazyImage/index.vue -->
<template>
  <div ref="imgRef" :class="$attrs.class" :style="$attrs.style">
    <div v-if="!inView" class="lazy-image-placeholder">
      <el-skeleton :loading="true" animated>
        <template #template>
          <el-skeleton-item variant="image" style="width: 100%; height: 100%" />
        </template>
      </el-skeleton>
    </div>
    <img
      v-if="inView && !hasError"
      :src="src"
      :alt="alt"
      @load="onLoad"
      @error="onError"
      :style="{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }"
    />
    <img
      v-if="hasError"
      :src="fallbackSrc"
      :alt="alt"
      style="width: 100%; height: 100%; object-fit: cover"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface LazyImageProps {
  src: string;
  alt: string;
  fallback?: string;
}

const props = withDefaults(defineProps<LazyImageProps>(), {
  fallback: '/images/image-error.png',
});

const imgRef = ref<HTMLDivElement>();
const inView = ref(false);
const loaded = ref(false);
const hasError = ref(false);
const fallbackSrc = props.fallback;

let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        inView.value = true;
        observer?.disconnect();
      }
    },
    { rootMargin: '200px' },
  );

  if (imgRef.value) {
    observer.observe(imgRef.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});

const onLoad = () => {
  loaded.value = true;
};

const onError = () => {
  hasError.value = true;
};
</script>
```

## 6. Vue Query 缓存策略

```typescript
// composables/useCachedQuery.ts
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import type { Ref } from 'vue';

interface UseCachedQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  gcTime?: number;
  enabled?: Ref<boolean> | boolean;
}

/**
 * 带缓存策略的查询 Composable
 *
 * @example
 * const { data } = useCachedQuery({
 *   queryKey: ['users'],
 *   queryFn: fetchUsers,
 *   staleTime: 5 * 60 * 1000,
 * });
 */
export function useCachedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000,
  gcTime = 30 * 60 * 1000,
  enabled = true,
}: UseCachedQueryOptions<T>) {
  return useQuery<T>({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    enabled,
  });
}

/**
 * 预加载 Composable
 *
 * @example
 * const { prefetch } = usePrefetch();
 * onMouseEnter={() => prefetch(['user', id], () => fetchUser(id))}
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetch = <T>(queryKey: string[], queryFn: () => Promise<T>) => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetch };
}
```

## 7. 防抖与节流

```typescript
// composables/useDebounce.ts
import { ref, watch, type Ref } from 'vue';

/**
 * 防抖 Composable
 * 延迟更新值，只在停止变化后触发
 *
 * @example
 * const search = ref('');
 * const debouncedSearch = useDebounce(search, 300);
 *
 * watch(debouncedSearch, (val) => {
 *   // 用 val 发请求
 * });
 */
export function useDebounce<T>(value: Ref<T>, delay: number): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>;
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(value, (newVal) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      debouncedValue.value = newVal;
    }, delay);
  });

  return debouncedValue;
}
```

```typescript
// composables/useThrottle.ts
import { ref, watch, type Ref } from 'vue';

/**
 * 节流 Composable
 * 在指定时间间隔内最多触发一次
 *
 * @example
 * const scrollY = ref(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 */
export function useThrottle<T>(value: Ref<T>, interval: number): Ref<T> {
  const throttledValue = ref(value.value) as Ref<T>;
  let lastExecuted = Date.now();
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(value, (newVal) => {
    const now = Date.now();
    const elapsed = now - lastExecuted;

    if (elapsed >= interval) {
      lastExecuted = now;
      throttledValue.value = newVal;
    } else {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        lastExecuted = Date.now();
        throttledValue.value = newVal;
      }, interval - elapsed);
    }
  });

  return throttledValue;
}
```

## 8. 性能监控

```typescript
// lib/performance/monitor.ts
import { onLCP, onFID, onCLS, onTTFB, onINP } from 'web-vitals';

interface PerformanceMetrics {
  LCP?: number;
  FID?: number;
  CLS?: number;
  TTFB?: number;
  INP?: number;
}

const metrics: PerformanceMetrics = {};

/**
 * 上报性能指标
 */
function reportMetrics(metric: { name: string; value: number }): void {
  const key = metric.name as keyof PerformanceMetrics;
  metrics[key] = metric.value;

  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms`);
  }

  if (import.meta.env.PROD) {
    navigator.sendBeacon?.('/api/metrics', JSON.stringify(metrics));
  }
}

/**
 * 初始化性能监控
 * 在 main.ts 中调用一次
 */
export function setupPerformanceMonitor(): void {
  onLCP(reportMetrics);
  onFID(reportMetrics);
  onCLS(reportMetrics);
  onTTFB(reportMetrics);
  onINP(reportMetrics);
}

/**
 * 组件渲染耗时测量
 *
 * @example
 * const end = startMeasure('UserList');
 * // ... 渲染逻辑
 * end();
 */
export function startMeasure(label: string): () => void {
  if (import.meta.env.DEV) {
    performance.mark(`${label}-start`);
    return () => {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      console.log(`[Measure] ${label}: ${measure.duration.toFixed(2)}ms`);
    };
  }
  return () => {};
}
```

## 输出要求

当用户要求性能优化时，必须：

1. 分析性能瓶颈场景（渲染、网络、加载）
2. 路由级懒加载 + defineAsyncComponent
3. 响应式优化指南（shallowRef / markRaw / v-memo）
4. 虚拟列表组件（支持大数据量）
5. TanStack Query 缓存策略
6. 防抖/节流 Composable
7. 性能监控（Web Vitals）
8. 提供优化前后对比指标

## 使用示例

### 用户输入

```
请按照 performance-vue3 规范，优化列表页面性能。

问题：
- 用户列表 5000+ 条数据渲染卡顿
- 搜索输入每次击键都发请求
- 切换页面后数据需要重新加载
```

### AI 输出

AI 会自动生成：

1. VirtualList 虚拟列表组件
2. useDebounce Composable（搜索防抖）
3. useCachedQuery Composable（数据缓存）
4. shallowRef 优化大对象响应式
5. 路由懒加载配置
6. v-memo 条件性缓存

你只需要：

+ 将 el-table 替换为 VirtualList
+ 搜索输入加 useDebounce
+ 用 shallowRef 管理大列表数据
+ 基本上不用改就能用
