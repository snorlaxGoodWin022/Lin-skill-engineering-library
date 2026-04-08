# Skill: Composables (Vue 3)

## 使用场景

用于快速生成规范的 Vue 3 Composables（组合式函数），适用于：
- 数据请求封装
- 表单状态管理
- DOM 事件监听
- 浏览器 API 封装
- 业务逻辑复用

## 技术栈

### 核心依赖
- Vue 3.4+（Composition API）
- TypeScript 5（类型支持）

### 设计原则
1. **单一职责** - 每个 Composable 只做一件事
2. **命名规范** - use 开头，如 useUserList
3. **返回响应式** - 返回 ref/computed
4. **清理副作用** - onScopeDispose 或 onUnmounted

## 文件结构规范

```
src/
├── composables/
│   ├── index.ts              # Composables 统一导出
│   ├── useRequest/           # 数据请求
│   │   ├── index.ts
│   │   └── types.ts
│   ├── useForm/              # 表单处理
│   │   ├── index.ts
│   │   └── types.ts
│   ├── useDebounce/          # 防抖
│   │   └── index.ts
│   ├── useThrottle/          # 节流
│   │   └── index.ts
│   ├── useLocalStorage/      # 本地存储
│   │   └── index.ts
│   ├── useToggle/            # 布尔切换
│   │   └── index.ts
│   ├── useClickOutside/      # 点击外部
│   │   └── index.ts
│   └── useMediaQuery/        # 媒体查询
│       └── index.ts
└── types/
    └── composables.d.ts      # 全局类型定义
```

## 基础 Composables 模板

### 1. useToggle - 布尔切换

```typescript
// composables/useToggle/index.ts
import { ref, readonly } from 'vue'

type ToggleFunction = () => void
type SetFunction = (value: boolean) => void

interface UseToggleReturn {
  value: Readonly<Ref<boolean>>
  toggle: ToggleFunction
  setTrue: () => void
  setFalse: () => void
  setValue: SetFunction
}

export function useToggle(initialValue: boolean = false): UseToggleReturn {
  const value = ref(initialValue)

  const toggle = () => {
    value.value = !value.value
  }

  const setTrue = () => {
    value.value = true
  }

  const setFalse = () => {
    value.value = false
  }

  const setValue = (newValue: boolean) => {
    value.value = newValue
  }

  return {
    value: readonly(value),
    toggle,
    setTrue,
    setFalse,
    setValue,
  }
}

// 使用示例
// const { value: isOpen, toggle, setTrue: open, setFalse: close } = useToggle()
```

### 2. useDebounce - 防抖值

```typescript
// composables/useDebounce/index.ts
import { ref, watch, type Ref, type MaybeRef, unref } from 'vue'

export function useDebounce<T>(value: MaybeRef<T>, delay: number = 300): Ref<T> {
  const debouncedValue = ref(unref(value)) as Ref<T>

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(
    () => unref(value),
    (newValue) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        debouncedValue.value = newValue as any
      }, delay)
    },
    { immediate: true }
  )

  return debouncedValue
}

// 使用示例
// const search = ref('')
// const debouncedSearch = useDebounce(search, 500)
// watch(debouncedSearch, (value) => fetchResults(value))
```

### 3. useThrottle - 节流值

```typescript
// composables/useThrottle/index.ts
import { ref, watch, type Ref, type MaybeRef, unref } from 'vue'

export function useThrottle<T>(value: MaybeRef<T>, interval: number = 300): Ref<T> {
  const throttledValue = ref(unref(value)) as Ref<T>
  const lastExecuted = ref(Date.now())

  watch(
    () => unref(value),
    (newValue) => {
      const now = Date.now()
      const timeSinceLastExecution = now - lastExecuted.value

      if (timeSinceLastExecution >= interval) {
        lastExecuted.value = now
        throttledValue.value = newValue as any
      } else {
        setTimeout(() => {
          lastExecuted.value = Date.now()
          throttledValue.value = unref(value) as any
        }, interval - timeSinceLastExecution)
      }
    }
  )

  return throttledValue
}
```

### 4. useLocalStorage - 本地存储

```typescript
// composables/useLocalStorage/index.ts
import { ref, watch, type Ref } from 'vue'

type SetValue<T> = (value: T | ((prev: T) => T)) => void
type RemoveValue = () => void

interface UseLocalStorageReturn<T> {
  value: Ref<T>
  setValue: SetValue<T>
  removeValue: RemoveValue
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  // 获取存储值
  const getStoredValue = (): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  }

  const value = ref<T>(getStoredValue()) as Ref<T>

  // 监听变化同步到 localStorage
  watch(
    value,
    (newValue) => {
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.error('localStorage setItem error:', error)
      }
    },
    { deep: true }
  )

  // 设置值
  const setValue: SetValue<T> = (newValue) => {
    if (typeof newValue === 'function') {
      value.value = (newValue as (prev: T) => T)(value.value)
    } else {
      value.value = newValue
    }
  }

  // 移除值
  const removeValue = () => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('localStorage removeItem error:', error)
    }
    value.value = initialValue
  }

  return { value, setValue, removeValue }
}
```

### 5. useClickOutside - 点击外部检测

```typescript
// composables/useClickOutside/index.ts
import { onMounted, onUnmounted, type Ref } from 'vue'

type Handler = (event: MouseEvent | TouchEvent) => void

export function useClickOutside<T extends HTMLElement>(
  ref: Ref<T | null>,
  handler: Handler,
  enabled: Ref<boolean> | boolean = true
): void {
  const listener = (event: MouseEvent | TouchEvent) => {
    const enabledValue = typeof enabled === 'boolean' ? enabled : enabled.value
    if (!enabledValue) return

    const target = event.target as Node
    if (!ref.value || ref.value.contains(target)) {
      return
    }
    handler(event)
  }

  onMounted(() => {
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', listener)
    document.removeEventListener('touchstart', listener)
  })
}

// 使用示例
// const dropdownRef = ref<HTMLElement | null>(null)
// const isOpen = ref(true)
// useClickOutside(dropdownRef, () => isOpen.value = false)
```

### 6. useMediaQuery - 媒体查询

```typescript
// composables/useMediaQuery/index.ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useMediaQuery(query: string): Ref<boolean> {
  const matches = ref(false)

  let mediaQuery: MediaQueryList | null = null

  const handler = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches
    mediaQuery.addEventListener('change', handler)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', handler)
  })

  return matches
}

// 预设断点
export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)')
```

### 7. useWindowSize - 窗口尺寸

```typescript
// composables/useWindowSize/index.ts
import { ref, onMounted, onUnmounted } from 'vue'

interface WindowSize {
  width: Ref<number>
  height: Ref<number>
}

export function useWindowSize(): WindowSize {
  const width = ref(typeof window === 'undefined' ? 0 : window.innerWidth)
  const height = ref(typeof window === 'undefined' ? 0 : window.innerHeight)

  let timeoutId: number | null = null

  const handleResize = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  const debouncedResize = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(handleResize, 100)
  }

  onMounted(() => {
    window.addEventListener('resize', debouncedResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', debouncedResize)
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return { width, height }
}
```

### 8. useKeyPress - 按键检测

```typescript
// composables/useKeyPress/index.ts
import { ref, onMounted, onUnmounted, type Ref, computed } from 'vue'

type KeyFilter = string | string[] | ((key: string) => boolean)

export function useKeyPress(targetKey: KeyFilter): Ref<boolean> {
  const pressed = ref(false)

  const checkKey = (key: string): boolean => {
    if (typeof targetKey === 'string') return key === targetKey
    if (Array.isArray(targetKey)) return targetKey.includes(key)
    return targetKey(key)
  }

  const downHandler = (event: KeyboardEvent) => {
    if (checkKey(event.key)) {
      pressed.value = true
    }
  }

  const upHandler = (event: KeyboardEvent) => {
    if (checkKey(event.key)) {
      pressed.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', downHandler)
    window.removeEventListener('keyup', upHandler)
  })

  return pressed
}
```

### 9. useAsync - 异步状态管理

```typescript
// composables/useAsync/index.ts
import { ref, computed, type Ref, onUnmounted } from 'vue'

interface AsyncState<T> {
  loading: Ref<boolean>
  error: Ref<Error | null>
  data: Ref<T | null>
}

interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
  isReady: Ref<boolean>
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate: boolean = false
): UseAsyncReturn<T> {
  const loading = ref(immediate)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null) as Ref<T | null>

  const isReady = computed(() => data.value !== null && !error.value)

  let mounted = true

  onUnmounted(() => {
    mounted = false
  })

  const execute = async (...args: any[]): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await asyncFunction(...args)
      if (mounted) {
        data.value = result
        loading.value = false
      }
      return result
    } catch (e) {
      if (mounted) {
        error.value = e as Error
        loading.value = false
      }
      return null
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  if (immediate) {
    execute()
  }

  return { loading, error, data, execute, reset, isReady }
}
```

### 10. usePrevious - 上一帧值

```typescript
// composables/usePrevious/index.ts
import { ref, watch, type Ref, type MaybeRef, unref } from 'vue'

export function usePrevious<T>(value: MaybeRef<T>): Ref<T | undefined> {
  const previous = ref<T | undefined>(undefined)

  watch(
    () => unref(value),
    (_, oldValue) => {
      previous.value = oldValue
    },
    { flush: 'pre' }
  )

  return previous
}
```

### 11. useIntersectionObserver - 交叉观察

```typescript
// composables/useIntersectionObserver/index.ts
import { ref, onUnmounted, type Ref } from 'vue'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  enabled?: Ref<boolean> | boolean
}

interface UseIntersectionObserverReturn {
  isIntersecting: Ref<boolean>
  entry: Ref<IntersectionObserverEntry | null>
}

export function useIntersectionObserver(
  target: Ref<Element | null>,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const { threshold = 0, root = null, rootMargin = '0px', enabled = true } = options

  const isIntersecting = ref(false)
  const entry = ref<IntersectionObserverEntry | null>(null)

  let observer: IntersectionObserver | null = null

  const getEnabledValue = () =>
    typeof enabled === 'boolean' ? enabled : enabled.value

  const observe = () => {
    if (!getEnabledValue() || !target.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting.value = entry.isIntersecting
        entry.value = entry
      },
      { threshold, root, rootMargin }
    )

    observer.observe(target.value)
  }

  const unobserve = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  // 手动控制
  const start = () => observe()
  const stop = () => unobserve()

  onUnmounted(() => {
    unobserve()
  })

  // 自动开始
  if (getEnabledValue()) {
    observe()
  }

  return { isIntersecting, entry, start, stop }
}

// 使用示例 - 懒加载
// const containerRef = ref<HTMLElement | null>(null)
// const { isIntersecting } = useIntersectionObserver(containerRef)
// watch(isIntersecting, (value) => { if (value) loadData() })
```

### 12. useCopyToClipboard - 复制到剪贴板

```typescript
// composables/useCopyToClipboard/index.ts
import { ref, onUnmounted, type Ref } from 'vue'

interface UseCopyToClipboardReturn {
  copied: Ref<boolean>
  copy: (text: string) => Promise<boolean>
  reset: () => void
}

export function useCopyToClipboard(
  resetDelay: number = 2000
): UseCopyToClipboardReturn {
  const copied = ref(false)
  let timeoutId: number | null = null

  const reset = () => {
    copied.value = false
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const copy = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true

      if (resetDelay > 0) {
        timeoutId = window.setTimeout(reset, resetDelay)
      }

      return true
    } catch {
      copied.value = false
      return false
    }
  }

  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return { copied, copy, reset }
}
```

## 业务 Composables 模板

### useUserList - 用户列表

```typescript
// composables/useUserList/index.ts
import { ref, computed, reactive, type Ref, type ComputedRef } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchUserList, deleteUser } from '@/api/user'
import type { User, UserListParams } from '@/api/types/user'

interface UseUserListOptions {
  initialParams?: Partial<UserListParams>
}

interface UseUserListReturn {
  users: ComputedRef<User[]>
  total: ComputedRef<number>
  loading: Ref<boolean>
  params: UserListParams
  updateParams: (params: Partial<UserListParams>) => void
  resetParams: () => void
  refresh: () => void
  remove: (id: string) => Promise<void>
}

const defaultParams: UserListParams = {
  pageNum: 1,
  pageSize: 20,
  keyword: '',
  status: '',
}

export function useUserList(options: UseUserListOptions = {}): UseUserListReturn {
  const { initialParams = {} } = options
  const queryClient = useQueryClient()

  const params = reactive<UserListParams>({
    ...defaultParams,
    ...initialParams,
  })

  // 查询列表
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', 'list', params],
    queryFn: () => fetchUserList(params),
  })

  // 删除用户
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
    },
  })

  // 更新参数
  const updateParams = (newParams: Partial<UserListParams>) => {
    // 筛选条件变化时重置分页
    const shouldResetPage =
      'keyword' in newParams || 'status' in newParams

    Object.assign(params, newParams)
    if (shouldResetPage) {
      params.pageNum = 1
    }
  }

  // 重置参数
  const resetParams = () => {
    Object.assign(params, defaultParams, initialParams)
  }

  // 删除用户
  const remove = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  return {
    users: computed(() => data.value?.list || []),
    total: computed(() => data.value?.total || 0),
    loading: isLoading,
    params,
    updateParams,
    resetParams,
    refresh: () => refetch(),
    remove,
  }
}
```

### useForm - 表单处理

```typescript
// composables/useForm/index.ts
import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue'
import type { ZodSchema } from 'zod'

interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: Ref<boolean>
  isValid: ComputedRef<boolean>
}

interface UseFormOptions<T> {
  initialValues: T
  schema?: ZodSchema<T>
  onSubmit: (values: T) => Promise<void> | void
}

interface UseFormReturn<T> extends FormState<T> {
  handleChange: (field: keyof T) => (value: any) => void
  handleBlur: (field: keyof T) => () => void
  handleSubmit: () => Promise<void>
  resetForm: () => void
  setFieldValue: (field: keyof T, value: any) => void
  setFieldError: (field: keyof T, error: string) => void
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const { initialValues, schema, onSubmit } = options

  const values = reactive<T>({ ...initialValues } as T)
  const errors = reactive<Partial<Record<keyof T, string>>>({})
  const touched = reactive<Partial<Record<keyof T, boolean>>>({})
  const isSubmitting = ref(false)

  const validate = (formData: T): Partial<Record<keyof T, string>> => {
    if (!schema) return {}

    const result = schema.safeParse(formData)
    if (result.success) return {}

    const newErrors: Partial<Record<keyof T, string>> = {}
    result.error.errors.forEach((err) => {
      const field = err.path[0] as keyof T
      newErrors[field] = err.message
    })
    return newErrors
  }

  const isValid = computed(() => Object.keys(errors).length === 0)

  const handleChange = (field: keyof T) => (value: any) => {
    ;(values as any)[field] = value
    const newErrors = validate(values as T)
    Object.assign(errors, newErrors)
  }

  const handleBlur = (field: keyof T) => () => {
    touched[field] = true
  }

  const handleSubmit = async () => {
    const newErrors = validate(values as T)

    // 标记所有字段为已触碰
    Object.keys(values).forEach((key) => {
      touched[key as keyof T] = true
    })

    if (Object.keys(newErrors).length > 0) {
      Object.assign(errors, newErrors)
      return
    }

    isSubmitting.value = true

    try {
      await onSubmit(values as T)
    } finally {
      isSubmitting.value = false
    }
  }

  const resetForm = () => {
    Object.assign(values, initialValues)
    Object.keys(errors).forEach((key) => delete errors[key as keyof T])
    Object.keys(touched).forEach((key) => delete touched[key as keyof T])
    isSubmitting.value = false
  }

  const setFieldValue = (field: keyof T, value: any) => {
    handleChange(field)(value)
  }

  const setFieldError = (field: keyof T, error: string) => {
    errors[field] = error
  }

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
  }
}
```

## Composables 统一导出

```typescript
// composables/index.ts
// 基础 Composables
export { useToggle } from './useToggle'
export { useDebounce } from './useDebounce'
export { useThrottle } from './useThrottle'
export { useLocalStorage } from './useLocalStorage'
export { useClickOutside } from './useClickOutside'
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery'
export { useWindowSize } from './useWindowSize'
export { useKeyPress } from './useKeyPress'
export { useAsync } from './useAsync'
export { usePrevious } from './usePrevious'
export { useIntersectionObserver } from './useIntersectionObserver'
export { useCopyToClipboard } from './useCopyToClipboard'

// 业务 Composables
export { useUserList } from './useUserList'
export { useForm } from './useForm'
```

## 测试模板

```typescript
// composables/useToggle/__tests__/useToggle.test.ts
import { describe, it, expect } from 'vitest'
import { useToggle } from '../index'

describe('useToggle', () => {
  it('默认值应该是 false', () => {
    const { value } = useToggle()
    expect(value.value).toBe(false)
  })

  it('应该接受初始值', () => {
    const { value } = useToggle(true)
    expect(value.value).toBe(true)
  })

  it('toggle 应该切换值', () => {
    const { value, toggle } = useToggle(false)

    toggle()
    expect(value.value).toBe(true)

    toggle()
    expect(value.value).toBe(false)
  })

  it('setTrue 应该设置为 true', () => {
    const { value, setTrue } = useToggle(false)

    setTrue()
    expect(value.value).toBe(true)
  })

  it('setFalse 应该设置为 false', () => {
    const { value, setFalse } = useToggle(true)

    setFalse()
    expect(value.value).toBe(false)
  })
})
```

## 输出要求

生成 Composable 时必须：

1. 使用 TypeScript 类型定义
2. 返回 ref/computed 响应式值
3. 清理副作用（onUnmounted/onScopeDispose）
4. 提供完整的使用示例
5. 包含测试用例
6. 统一导出到 index.ts

## 使用示例

### 用户输入

```
生成一个 useInfiniteScroll Composable。

功能需求：
- 支持滚动加载更多
- 支持自定义触发距离
- 支持加载状态
- 支持结束判断
- 支持手动触发
```

### AI 输出

生成完整的 Composable 文件，包括：
- TypeScript 类型定义
- IntersectionObserver 实现
- 加载状态管理
- 使用示例
- 测试用例
