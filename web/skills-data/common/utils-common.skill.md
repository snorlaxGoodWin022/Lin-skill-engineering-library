# Skill: 通用工具函数

## 使用场景

用于快速生成规范的通用工具函数库，适用于：

- 日期格式化
- 数字格式化
- 字符串处理
- 数据校验
- URL 解析
- 存储操作
- 防抖节流
- 深拷贝

## 技术栈

### 核心依赖

- TypeScript 5（类型支持）
- dayjs（日期处理，可选）

### 设计原则

1. **纯函数** - 无副作用，输入确定则输出确定
2. **类型安全** - 完整的 TypeScript 类型
3. **单元测试** - 每个函数都有测试覆盖
4. **Tree-shakable** - 支持 ES Module 按需引入

## 文件结构规范

```
src/
├── utils/
│   ├── index.ts              # 统一导出
│   ├── date.ts               # 日期处理
│   ├── number.ts             # 数字处理
│   ├── string.ts             # 字符串处理
│   ├── validate.ts           # 数据校验
│   ├── url.ts                # URL 解析
│   ├── storage.ts            # 存储操作
│   ├── function.ts           # 函数工具（防抖/节流）
│   ├── object.ts             # 对象工具（深拷贝/合并）
│   └── __tests__/
│       ├── date.test.ts
│       ├── number.test.ts
│       └── ...
└── types/
    └── utils.d.ts            # 类型定义
```

## 日期处理

```typescript
// utils/date.ts
import dayjs from 'dayjs'

type DateFormat = string | Date | number | dayjs.Dayjs

/**
 * 格式化日期
 * @example formatDate(new Date(), 'YYYY-MM-DD') // '2024-01-15'
 */
export function formatDate(date: DateFormat, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  try {
    return dayjs(date).format(format)
  } catch {
    return ''
  }
}

/**
 * 相对时间
 * @example formatRelative(new Date()) // '刚刚'
 */
export function formatRelative(date: DateFormat): string {
  if (!date) return ''

  const now = dayjs()
  const target = dayjs(date)
  const diffSeconds = now.diff(target, 'second')
  const diffMinutes = now.diff(target, 'minute')
  const diffHours = now.diff(target, 'hour')
  const diffDays = now.diff(target, 'day')
  const diffMonths = now.diff(target, 'month')
  const diffYears = now.diff(target, 'year')

  if (diffSeconds < 60) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 30) return `${diffDays}天前`
  if (diffMonths < 12) return `${diffMonths}个月前`
  return `${diffYears}年前`
}

/**
 * 获取日期范围
 */
export function getDateRange(type: 'today' | 'week' | 'month' | 'year'): [string, string] {
  const now = dayjs()
  const format = 'YYYY-MM-DD'

  switch (type) {
    case 'today':
      return [now.format(format), now.format(format)]
    case 'week':
      return [now.startOf('week').format(format), now.endOf('week').format(format)]
    case 'month':
      return [now.startOf('month').format(format), now.endOf('month').format(format)]
    case 'year':
      return [now.startOf('year').format(format), now.endOf('year').format(format)]
  }
}

/**
 * 判断是否为今天
 */
export function isToday(date: DateFormat): boolean {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 获取年龄
 */
export function getAge(birthday: DateFormat): number {
  return dayjs().diff(dayjs(birthday), 'year')
}
```

## 数字处理

```typescript
// utils/number.ts

/**
 * 格式化数字（千分位）
 * @example formatNumber(1234567.89) // '1,234,567.89'
 */
export function formatNumber(
  num: number,
  options?: {
    precision?: number
    separator?: string
  }
): string {
  if (isNaN(num)) return '0'

  const { precision, separator = ',' } = options || {}

  let numStr = precision !== undefined ? num.toFixed(precision) : String(num)
  const [integer, decimal] = numStr.split('.')

  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator)

  return decimal ? `${formattedInteger}.${decimal}` : formattedInteger
}

/**
 * 格式化货币
 * @example formatCurrency(1234.56) // '¥1,234.56'
 */
export function formatCurrency(
  amount: number,
  options?: {
    currency?: 'CNY' | 'USD' | 'EUR'
    precision?: number
  }
): string {
  const { currency = 'CNY', precision = 2 } = options || {}

  const symbols: Record<string, string> = {
    CNY: '¥',
    USD: '$',
    EUR: '€',
  }

  return `${symbols[currency]}${formatNumber(amount, { precision })}`
}

/**
 * 格式化百分比
 * @example formatPercent(0.856) // '85.6%'
 */
export function formatPercent(
  value: number,
  options?: {
    precision?: number
    multiply?: boolean
  }
): string {
  const { precision = 1, multiply = true } = options || {}

  const percent = multiply ? value * 100 : value
  return `${percent.toFixed(precision)}%`
}

/**
 * 格式化文件大小
 * @example formatFileSize(1024 * 1024) // '1.00 MB'
 */
export function formatFileSize(bytes: number, precision: number = 2): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(precision)} ${units[i]}`
}

/**
 * 数字范围限制
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

/**
 * 生成随机数
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 保留小数位（不四舍五入）
 */
export function toFixed(num: number, precision: number): number {
  const factor = Math.pow(10, precision)
  return Math.floor(num * factor) / factor
}
```

## 字符串处理

```typescript
// utils/string.ts

/**
 * 截断字符串
 * @example truncate('Hello World', 5) // 'Hello...'
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + suffix
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 驼峰转下划线
 * @example camelToSnake('userName') // 'user_name'
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
}

/**
 * 下划线转驼峰
 * @example snakeToCamel('user_name') // 'userName'
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

/**
 * 驼峰转短横线
 * @example camelToKebab('userName') // 'user-name'
 */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

/**
 * 短横线转驼峰
 * @example kebabToCamel('user-name') // 'userName'
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
}

/**
 * 生成 UUID
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成短 ID
 */
export function shortId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 脱敏手机号
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 脱敏邮箱
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email
  const [name, domain] = email.split('@')
  const maskedName =
    name.length > 2 ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] : name[0] + '*'
  return `${maskedName}@${domain}`
}

/**
 * 脱敏身份证
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2')
}

/**
 * 高亮关键词
 */
export function highlight(str: string, keyword: string, tag: string = 'mark'): string {
  if (!str || !keyword) return str
  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
  return str.replace(regex, `<${tag}>$1</${tag}>`)
}

/**
 * 转义正则特殊字符
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
```

## 数据校验

```typescript
// utils/validate.ts

/**
 * 校验手机号
 */
export function isPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value)
}

/**
 * 校验邮箱
 */
export function isEmail(value: string): boolean {
  return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)
}

/**
 * 校验身份证号
 */
export function isIdCard(value: string): boolean {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value)
}

/**
 * 校验 URL
 */
export function isUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * 校验中文
 */
export function isChinese(value: string): boolean {
  return /^[\u4e00-\u9fa5]+$/.test(value)
}

/**
 * 校验纯数字
 */
export function isNumber(value: string): boolean {
  return /^\d+$/.test(value)
}

/**
 * 校验字母
 */
export function isAlpha(value: string): boolean {
  return /^[a-zA-Z]+$/.test(value)
}

/**
 * 校验字母数字
 */
export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value)
}

/**
 * 校验密码强度
 * @returns 0-4 级别，0 表示不符合要求
 */
export function checkPasswordStrength(password: string): number {
  if (!password || password.length < 8) return 0

  let strength = 0

  // 包含小写字母
  if (/[a-z]/.test(password)) strength++
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++
  // 包含数字
  if (/\d/.test(password)) strength++
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  return strength
}

/**
 * 判断是否为空
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 判断是否为 JSON 字符串
 */
export function isJsonString(value: string): boolean {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}
```

## URL 解析

```typescript
// utils/url.ts

/**
 * 解析 URL 参数
 * @example parseQuery('?name=John&age=18') // { name: 'John', age: '18' }
 */
export function parseQuery(url: string): Record<string, string> {
  const queryString = url.includes('?') ? url.split('?')[1] : url
  const params = new URLSearchParams(queryString)
  const result: Record<string, string> = {}

  params.forEach((value, key) => {
    result[key] = value
  })

  return result
}

/**
 * 对象转 URL 参数
 * @example stringifyQuery({ name: 'John', age: 18 }) // 'name=John&age=18'
 */
export function stringifyQuery(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}

/**
 * 获取 URL 参数
 */
export function getQueryParam(url: string, key: string): string | null {
  const params = parseQuery(url)
  return params[key] || null
}

/**
 * 设置 URL 参数
 */
export function setQueryParam(url: string, key: string, value: any): string {
  const [baseUrl, queryString] = url.split('?')
  const params = parseQuery(queryString || '')
  params[key] = String(value)
  return `${baseUrl}?${stringifyQuery(params)}`
}

/**
 * 移除 URL 参数
 */
export function removeQueryParam(url: string, key: string): string {
  const [baseUrl, queryString] = url.split('?')
  if (!queryString) return baseUrl

  const params = parseQuery(queryString)
  delete params[key]

  const newQuery = stringifyQuery(params)
  return newQuery ? `${baseUrl}?${newQuery}` : baseUrl
}

/**
 * 获取 URL 基础路径
 */
export function getBaseUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.origin + parsed.pathname
  } catch {
    return url.split('?')[0]
  }
}
```

## 存储操作

```typescript
// utils/storage.ts

type StorageType = 'local' | 'session'

/**
 * 获取存储
 */
function getStorage(type: StorageType): Storage {
  return type === 'local' ? localStorage : sessionStorage
}

/**
 * 设置存储
 */
export function setStorage<T>(key: string, value: T, type: StorageType = 'local'): void {
  try {
    getStorage(type).setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('setStorage error:', error)
  }
}

/**
 * 获取存储
 */
export function getStorage<T>(key: string, type: StorageType = 'local'): T | null {
  try {
    const value = getStorage(type).getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

/**
 * 移除存储
 */
export function removeStorage(key: string, type: StorageType = 'local'): void {
  getStorage(type).removeItem(key)
}

/**
 * 清空存储
 */
export function clearStorage(type: StorageType = 'local'): void {
  getStorage(type).clear()
}

/**
 * 获取存储大小（字节）
 */
export function getStorageSize(type: StorageType = 'local'): number {
  const storage = getStorage(type)
  let size = 0

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key) {
      const value = storage.getItem(key)
      size += (key.length + (value?.length || 0)) * 2 // UTF-16
    }
  }

  return size
}

/**
 * Cookie 操作
 */
export const cookie = {
  set(name: string, value: string, days: number = 7): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/`
  },

  get(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + encodeURIComponent(name) + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
  },

  remove(name: string): void {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  },
}
```

## 函数工具

```typescript
// utils/function.ts

/**
 * 防抖
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number = 300
): (...args: Parameters<T>) => void {
  let lastExecuted = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const timeSinceLastExecution = now - lastExecuted

    if (timeSinceLastExecution >= interval) {
      lastExecuted = now
      fn.apply(this, args)
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        lastExecuted = Date.now()
        fn.apply(this, args)
      }, interval - timeSinceLastExecution)
    }
  }
}

/**
 * 只执行一次
 */
export function once<T extends (...args: any[]) => any>(fn: T): T {
  let called = false
  let result: ReturnType<T>

  return function (this: any, ...args: Parameters<T>) {
    if (!called) {
      called = true
      result = fn.apply(this, args)
    }
    return result
  } as T
}

/**
 * 记忆化
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>()

  return function (this: any, ...args: Parameters<T>) {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  } as T
}
```

## 对象工具

```typescript
// utils/object.ts

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T
  }

  const cloned = {} as T

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }

  return cloned
}

/**
 * 深合并
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target

  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} })
        }
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 获取嵌套属性
 * @example getNestedValue({ a: { b: { c: 1 } } }, 'a.b.c') // 1
 */
export function getNestedValue<T = any>(obj: any, path: string, defaultValue?: T): T {
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue as T
    }
    result = result[key]
  }

  return result ?? defaultValue
}

/**
 * 设置嵌套属性
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let target = obj

  for (const key of keys) {
    if (!(key in target)) {
      target[key] = {}
    }
    target = target[key]
  }

  target[lastKey] = value
}

/**
 * 移除空值属性
 */
export function omitEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {}

  for (const key in obj) {
    const value = obj[key]
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value
    }
  }

  return result
}

/**
 * Pick 属性
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>

  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })

  return result
}

/**
 * Omit 属性
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }

  keys.forEach((key) => {
    delete result[key]
  })

  return result
}
```

## 统一导出

```typescript
// utils/index.ts
export * from './date'
export * from './number'
export * from './string'
export * from './validate'
export * from './url'
export * from './storage'
export * from './function'
export * from './object'
```

## 测试示例

```typescript
// utils/__tests__/string.test.ts
import { describe, it, expect } from 'vitest'
import { truncate, camelToSnake, snakeToCamel, uuid, maskPhone } from '../string'

describe('string utils', () => {
  describe('truncate', () => {
    it('应该截断长字符串', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...')
    })

    it('短字符串不应该截断', () => {
      expect(truncate('Hi', 5)).toBe('Hi')
    })

    it('支持自定义后缀', () => {
      expect(truncate('Hello World', 5, '…')).toBe('Hello…')
    })
  })

  describe('camelToSnake', () => {
    it('应该转换驼峰为下划线', () => {
      expect(camelToSnake('userName')).toBe('user_name')
      expect(camelToSnake('getUserById')).toBe('get_user_by_id')
    })
  })

  describe('maskPhone', () => {
    it('应该脱敏手机号', () => {
      expect(maskPhone('13812345678')).toBe('138****5678')
    })
  })

  describe('uuid', () => {
    it('应该生成有效的 UUID', () => {
      const id = uuid()
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })
  })
})
```

## 输出要求

生成工具函数时必须：

1. 纯函数，无副作用
2. 完整的 TypeScript 类型
3. JSDoc 注释和使用示例
4. 单元测试覆盖
5. 支持 Tree-shaking

## 使用示例

### 用户输入

```
生成一个处理数组数据的工具函数库。

功能需求：
- 数组去重
- 数组分组
- 数组排序
- 数组扁平化
- 数组交集/并集/差集
- 树形结构转换
```

### AI 输出

生成完整的工具函数文件，包括：

- TypeScript 类型定义
- 所有函数实现
- JSDoc 注释
- 单元测试
