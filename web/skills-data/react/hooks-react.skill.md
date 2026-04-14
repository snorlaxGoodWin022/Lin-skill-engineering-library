# Skill: 自定义 Hooks (React)

## 使用场景

用于快速生成规范的自定义 React Hooks，适用于：

- 数据请求封装
- 表单状态管理
- DOM 事件监听
- 浏览器 API 封装
- 业务逻辑复用

## 技术栈

### 核心依赖

- React 18+（Hooks API）
- TypeScript 5（类型支持）

### 设计原则

1. **单一职责** - 每个 Hook 只做一件事
2. **命名规范** - use 开头，如 useUserList
3. **返回值稳定** - 使用 useCallback/useMemo 优化
4. **清理副作用** - useEffect 返回清理函数

## 文件结构规范

```
src/
├── hooks/
│   ├── index.ts              # Hooks 统一导出
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
    └── hooks.d.ts            # 全局类型定义
```

## 基础 Hooks 模板

### 1. useToggle - 布尔切换

```typescript
// hooks/useToggle/index.ts
import { useState, useCallback } from 'react'

type ToggleFunction = () => void
type SetFunction = (value: boolean) => void

interface UseToggleReturn {
  value: boolean
  toggle: ToggleFunction
  setTrue: () => void
  setFalse: () => void
  setValue: SetFunction
}

export function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue((v) => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse, setValue }
}

// 使用示例
// const { value: isOpen, toggle, setTrue: open, setFalse: close } = useToggle()
```

### 2. useDebounce - 防抖值

```typescript
// hooks/useDebounce/index.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// 使用示例
// const [search, setSearch] = useState('')
// const debouncedSearch = useDebounce(search, 500)
// useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
```

### 3. useThrottle - 节流值

```typescript
// hooks/useThrottle/index.ts
import { useState, useEffect, useRef } from 'react'

export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastExecutedRef = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastExecution = now - lastExecutedRef.current

    if (timeSinceLastExecution >= interval) {
      lastExecutedRef.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastExecutedRef.current = Date.now()
        setThrottledValue(value)
      }, interval - timeSinceLastExecution)

      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}
```

### 4. useLocalStorage - 本地存储

```typescript
// hooks/useLocalStorage/index.ts
import { useState, useCallback } from 'react'

type SetValue<T> = (value: T | ((prev: T) => T)) => void
type RemoveValue = () => void

interface UseLocalStorageReturn<T> {
  value: T
  setValue: SetValue<T>
  removeValue: RemoveValue
}

export function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorageReturn<T> {
  // 获取初始值
  const getStoredValue = (): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  }

  const [value, setValueState] = useState<T>(getStoredValue)

  // 设置值
  const setValue: SetValue<T> = useCallback(
    (value) => {
      setValueState((prev) => {
        const newValue = value instanceof Function ? value(prev) : value
        try {
          localStorage.setItem(key, JSON.stringify(newValue))
        } catch (error) {
          console.error('localStorage setItem error:', error)
        }
        return newValue
      })
    },
    [key]
  )

  // 移除值
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('localStorage removeItem error:', error)
    }
    setValueState(initialValue)
  }, [key, initialValue])

  return { value, setValue, removeValue }
}
```

### 5. useClickOutside - 点击外部检测

```typescript
// hooks/useClickOutside/index.ts
import { useEffect, RefObject } from 'react'

type Handler = (event: MouseEvent | TouchEvent) => void

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (!ref.current || ref.current.contains(target)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler, enabled])
}

// 使用示例
// const ref = useRef<HTMLDivElement>(null)
// useClickOutside(ref, () => setIsOpen(false))
```

### 6. useMediaQuery - 媒体查询

```typescript
// hooks/useMediaQuery/index.ts
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

// 预设断点
export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)')
```

### 7. useWindowSize - 窗口尺寸

```typescript
// hooks/useWindowSize/index.ts
import { useState, useEffect } from 'react'

interface WindowSize {
  width: number
  height: number
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(() => ({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  }))

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // 使用 ResizeObserver 或防抖优化
    let timeoutId: number
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = window.setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return size
}
```

### 8. useKeyPress - 按键检测

```typescript
// hooks/useKeyPress/index.ts
import { useState, useEffect } from 'react'

type KeyFilter = string | string[] | ((key: string) => boolean)

export function useKeyPress(targetKey: KeyFilter): boolean {
  const [pressed, setPressed] = useState(false)

  const checkKey = (key: string): boolean => {
    if (typeof targetKey === 'string') return key === targetKey
    if (Array.isArray(targetKey)) return targetKey.includes(key)
    return targetKey(key)
  }

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if (checkKey(event.key)) {
        setPressed(true)
      }
    }

    const upHandler = (event: KeyboardEvent) => {
      if (checkKey(event.key)) {
        setPressed(false)
      }
    }

    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)

    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [targetKey])

  return pressed
}

// 使用示例
// const enterPressed = useKeyPress('Enter')
// const escapePressed = useKeyPress(['Escape', 'Esc'])
```

### 9. useAsync - 异步状态管理

```typescript
// hooks/useAsync/index.ts
import { useState, useCallback, useEffect, useRef } from 'react'

interface AsyncState<T> {
  loading: boolean
  error: Error | null
  data: T | null
}

interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate: boolean = false
): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    loading: immediate,
    error: null,
    data: null,
  })

  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const data = await asyncFunction(...args)
        if (mountedRef.current) {
          setState({ loading: false, error: null, data })
        }
        return data
      } catch (error) {
        if (mountedRef.current) {
          setState({ loading: false, error: error as Error, data: null })
        }
        return null
      }
    },
    [asyncFunction]
  )

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null })
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  return { ...state, execute, reset }
}
```

### 10. usePrevious - 上一帧值

```typescript
// hooks/usePrevious/index.ts
import { useRef, useEffect } from 'react'

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
```

### 11. useIntersectionObserver - 交叉观察

```typescript
// hooks/useIntersectionObserver/index.ts
import { useState, useEffect, RefObject } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  enabled?: boolean
}

interface UseIntersectionObserverReturn {
  isIntersecting: boolean
  entry: IntersectionObserverEntry | null
}

export function useIntersectionObserver(
  ref: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const { threshold = 0, root = null, rootMargin = '0px', enabled = true } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        setEntry(entry)
      },
      { threshold, root, rootMargin }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref, threshold, root, rootMargin, enabled])

  return { isIntersecting, entry }
}

// 使用示例 - 懒加载
// const ref = useRef<HTMLDivElement>(null)
// const { isIntersecting } = useIntersectionObserver(ref)
// useEffect(() => { if (isIntersecting) loadData() }, [isIntersecting])
```

### 12. useCopyToClipboard - 复制到剪贴板

```typescript
// hooks/useCopyToClipboard/index.ts
import { useState, useCallback } from 'react'

interface UseCopyToClipboardReturn {
  copied: boolean
  copy: (text: string) => Promise<boolean>
  reset: () => void
}

export function useCopyToClipboard(resetDelay: number = 2000): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)

        if (resetDelay > 0) {
          setTimeout(() => setCopied(false), resetDelay)
        }

        return true
      } catch {
        setCopied(false)
        return false
      }
    },
    [resetDelay]
  )

  const reset = useCallback(() => setCopied(false), [])

  return { copied, copy, reset }
}
```

## 业务 Hooks 模板

### useUserList - 用户列表

```typescript
// hooks/useUserList/index.ts
import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserList, deleteUser } from '@/api/user'
import type { User, UserListParams } from '@/api/types/user'

interface UseUserListOptions {
  initialParams?: Partial<UserListParams>
}

interface UseUserListReturn {
  users: User[]
  total: number
  loading: boolean
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

  const [params, setParams] = useState<UserListParams>({
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
  const updateParams = useCallback((newParams: Partial<UserListParams>) => {
    setParams((prev) => {
      // 筛选条件变化时重置分页
      const shouldResetPage = newParams.keyword !== undefined || newParams.status !== undefined

      return {
        ...prev,
        ...newParams,
        ...(shouldResetPage ? { pageNum: 1 } : {}),
      }
    })
  }, [])

  // 重置参数
  const resetParams = useCallback(() => {
    setParams({ ...defaultParams, ...initialParams })
  }, [initialParams])

  // 删除用户
  const remove = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id)
    },
    [deleteMutation]
  )

  return {
    users: data?.list || [],
    total: data?.total || 0,
    loading: isLoading,
    params,
    updateParams,
    resetParams,
    refresh: refetch,
    remove,
  }
}
```

### useForm - 表单处理

```typescript
// hooks/useForm/index.ts
import { useState, useCallback } from 'react'
import type { ZodSchema } from 'zod'

interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
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

  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  })

  const validate = useCallback(
    (values: T): Partial<Record<keyof T, string>> => {
      if (!schema) return {}

      const result = schema.safeParse(values)
      if (result.success) return {}

      const errors: Partial<Record<keyof T, string>> = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof T
        errors[field] = err.message
      })
      return errors
    },
    [schema]
  )

  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setState((prev) => {
        const newValues = { ...prev.values, [field]: value }
        const errors = validate(newValues)
        return {
          ...prev,
          values: newValues,
          errors,
          isValid: Object.keys(errors).length === 0,
        }
      })
    },
    [validate]
  )

  const handleBlur = useCallback((field: keyof T) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [field]: true },
    }))
  }, [])

  const handleSubmit = useCallback(async () => {
    const errors = validate(state.values)

    // 标记所有字段为已触碰
    const touched = Object.keys(state.values).reduce((acc, key) => ({ ...acc, [key]: true }), {})

    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, errors, touched, isValid: false }))
      return
    }

    setState((prev) => ({ ...prev, isSubmitting: true }))

    try {
      await onSubmit(state.values)
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }))
    }
  }, [state.values, validate, onSubmit])

  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    })
  }, [initialValues])

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      handleChange(field)(value)
    },
    [handleChange]
  )

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
    }))
  }, [])

  return {
    ...state,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
  }
}
```

## Hooks 统一导出

```typescript
// hooks/index.ts
// 基础 Hooks
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

// 业务 Hooks
export { useUserList } from './useUserList'
export { useForm } from './useForm'
```

## 测试模板

```typescript
// hooks/useToggle/__tests__/useToggle.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToggle } from '../index'

describe('useToggle', () => {
  it('默认值应该是 false', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current.value).toBe(false)
  })

  it('应该接受初始值', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current.value).toBe(true)
  })

  it('toggle 应该切换值', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(true)

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(false)
  })

  it('setTrue 应该设置为 true', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.setTrue()
    })

    expect(result.current.value).toBe(true)
  })

  it('setFalse 应该设置为 false', () => {
    const { result } = renderHook(() => useToggle(true))

    act(() => {
      result.current.setFalse()
    })

    expect(result.current.value).toBe(false)
  })
})
```

## 输出要求

生成自定义 Hook 时必须：

1. 使用 TypeScript 类型定义
2. 返回值使用 useCallback/useMemo 优化
3. 清理副作用（useEffect return）
4. 提供完整的使用示例
5. 包含测试用例
6. 统一导出到 index.ts

## 使用示例

### 用户输入

```
生成一个 useInfiniteScroll Hook。

功能需求：
- 支持滚动加载更多
- 支持自定义触发距离
- 支持加载状态
- 支持结束判断
- 支持手动触发
```

### AI 输出

生成完整的 Hook 文件，包括：

- TypeScript 类型定义
- IntersectionObserver 实现
- 加载状态管理
- 使用示例
- 测试用例
