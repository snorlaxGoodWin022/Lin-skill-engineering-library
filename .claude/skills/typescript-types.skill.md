# Skill: TypeScript 类型定义

## 使用场景

用于快速生成规范的 TypeScript 类型定义，适用于：
- API 响应类型
- 表单数据类型
- 组件 Props 类型
- 通用工具类型
- 业务领域类型

## 技术栈

### 核心依赖
- TypeScript 5.x

### 设计原则
1. **精确性** - 类型定义尽可能精确
2. **复用性** - 通用类型抽取复用
3. **文档性** - JSDoc 注释说明用途
4. **严格性** - 开启 strict 模式

## 文件结构规范

```
src/
├── types/
│   ├── index.ts              # 类型统一导出
│   ├── api.d.ts              # API 相关类型
│   ├── form.d.ts             # 表单相关类型
│   ├── components.d.ts       # 组件相关类型
│   ├── utils.d.ts            # 工具类型
│   └── models/               # 业务领域类型
│       ├── user.d.ts
│       ├── product.d.ts
│       └── order.d.ts
└── ...
```

## 通用基础类型

```typescript
// types/base.d.ts

/**
 * 可空类型
 */
export type Nullable<T> = T | null

/**
 * 可选类型
 */
export type Optional<T> = T | undefined

/**
 * 可能为空的类型
 */
export type Maybe<T> = T | null | undefined

/**
 * 非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 只读深层次类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 必选深层次类型
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

/**
 * 部分深层次类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 获取函数参数类型
 */
export type Parameters<T> = T extends (...args: infer P) => any ? P : never

/**
 * 获取函数返回类型
 */
export type ReturnType<T> = T extends (...args: any) => infer R ? R : never

/**
 * 获取 Promise 返回类型
 */
export type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T

/**
 * 获取数组元素类型
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never

/**
 * 获取对象值类型
 */
export type ValueOf<T> = T[keyof T]

/**
 * 将对象键转换为联合类型
 */
export type Keys<T> = keyof T

/**
 * 排除 null 和 undefined 的键
 */
export type NonUndefinedKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K
}[keyof T]

/**
 * 必选某些属性
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * 可选某些属性
 */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 将某些属性变为必选
 */
export type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * 将某些属性变为可选
 */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 互斥属性（只能选其一）
 */
export type OneOf<T, Keys extends keyof T> = {
  [K in Keys]: { [P in K]: T[P] } & { [P in Exclude<Keys, K>]?: never }
}[Keys] &
  Omit<T, Keys>

/**
 * 提取指定类型的键
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P]
}

/**
 * 排除指定类型的键
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P]
}

/**
 * 将常量类型转换为联合类型
 */
export type UnionFromConst<T extends readonly unknown[]> = T[number]

/**
 * 将字符串字面量转换为联合类型
 */
export type StringUnion<T extends string> = `${T}`
```

## API 响应类型

```typescript
// types/api.d.ts

/**
 * 通用 API 响应
 */
export interface ApiResponse<T = any> {
  /** 状态码，0 表示成功 */
  code: number
  /** 响应数据 */
  data: T
  /** 响应消息 */
  message: string
  /** 时间戳 */
  timestamp?: number
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  /** 当前页码 */
  pageNum: number
  /** 每页条数 */
  pageSize: number
}

/**
 * 分页响应数据
 */
export interface PaginatedResponse<T> extends PaginationParams {
  /** 数据列表 */
  list: T[]
  /** 总条数 */
  total: number
  /** 总页数 */
  totalPages?: number
}

/**
 * 列表查询参数
 */
export interface ListQueryParams extends PaginationParams {
  /** 搜索关键词 */
  keyword?: string
  /** 排序字段 */
  sortBy?: string
  /** 排序方式 */
  sortOrder?: 'asc' | 'desc'
}

/**
 * ID 参数
 */
export interface IdParam {
  id: string | number
}

/**
 * 批量操作参数
 */
export interface BatchParams {
  ids: (string | number)[]
}

/**
 * API 错误响应
 */
export interface ApiError {
  code: number
  message: string
  errors?: Record<string, string[]>
}

/**
 * 请求配置
 */
export interface RequestConfig {
  /** 是否显示 loading */
  loading?: boolean
  /** 是否显示错误提示 */
  showError?: boolean
  /** 是否显示成功提示 */
  showSuccess?: boolean
  /** 成功提示消息 */
  successMessage?: string
  /** 请求超时时间 */
  timeout?: number
  /** 是否携带 token */
  withToken?: boolean
}
```

## 表单类型

```typescript
// types/form.d.ts

/**
 * 表单字段基础配置
 */
export interface FormFieldBase {
  /** 字段名 */
  name: string
  /** 字段标签 */
  label: string
  /** 占位符 */
  placeholder?: string
  /** 提示信息 */
  tooltip?: string
  /** 是否必填 */
  required?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 默认值 */
  defaultValue?: any
  /** 校验规则 */
  rules?: FormRule[]
  /** 栅格布局 */
  span?: number
  /** 是否隐藏 */
  hidden?: boolean
  /** 动态隐藏条件 */
  hiddenWhen?: (formData: any) => boolean
  /** 动态禁用条件 */
  disabledWhen?: (formData: any) => boolean
}

/**
 * 表单校验规则
 */
export interface FormRule {
  /** 规则类型 */
  type?: 'required' | 'email' | 'phone' | 'url' | 'pattern' | 'custom'
  /** 正则表达式 */
  pattern?: RegExp
  /** 最小长度 */
  min?: number
  /** 最大长度 */
  max?: number
  /** 最小值 */
  minValue?: number
  /** 最大值 */
  maxValue?: number
  /** 错误消息 */
  message: string
  /** 自定义校验函数 */
  validator?: (value: any, formData: any) => boolean | string | Promise<boolean | string>
}

/**
 * 输入框字段
 */
export interface InputField extends FormFieldBase {
  type: 'input'
  /** 输入类型 */
  inputType?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  /** 最大长度 */
  maxlength?: number
  /** 是否显示字数统计 */
  showCount?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 前缀 */
  prefix?: string
  /** 后缀 */
  suffix?: string
}

/**
 * 文本域字段
 */
export interface TextareaField extends FormFieldBase {
  type: 'textarea'
  /** 行数 */
  rows?: number
  /** 最大长度 */
  maxlength?: number
  /** 是否显示字数统计 */
  showCount?: boolean
  /** 是否可自动调整高度 */
  autoSize?: boolean | { minRows: number; maxRows: number }
}

/**
 * 选择器字段
 */
export interface SelectField extends FormFieldBase {
  type: 'select'
  /** 选项列表 */
  options: SelectOption[]
  /** 是否多选 */
  multiple?: boolean
  /** 是否可搜索 */
  filterable?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 是否远程搜索 */
  remote?: boolean
  /** 远程搜索方法 */
  remoteMethod?: (keyword: string) => Promise<SelectOption[]>
}

/**
 * 选择项
 */
export interface SelectOption {
  /** 值 */
  value: string | number
  /** 标签 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
  /** 子选项（分组） */
  children?: SelectOption[]
}

/**
 * 日期选择字段
 */
export interface DateField extends FormFieldBase {
  type: 'date' | 'datetime' | 'daterange' | 'datetimerange'
  /** 日期格式 */
  format?: string
  /** 值格式 */
  valueFormat?: string
  /** 是否可清空 */
  clearable?: boolean
  /** 禁用日期 */
  disabledDate?: (date: Date) => boolean
}

/**
 * 数字输入字段
 */
export interface NumberField extends FormFieldBase {
  type: 'number'
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步长 */
  step?: number
  /** 精度 */
  precision?: number
  /** 是否显示按钮 */
  controls?: boolean
}

/**
 * 开关字段
 */
export interface SwitchField extends FormFieldBase {
  type: 'switch'
  /** 选中时的值 */
  activeValue?: string | number | boolean
  /** 未选中时的值 */
  inactiveValue?: string | number | boolean
  /** 选中时的文本 */
  activeText?: string
  /** 未选中时的文本 */
  inactiveText?: string
}

/**
 * 复选框字段
 */
export interface CheckboxField extends FormFieldBase {
  type: 'checkbox'
  /** 选项列表 */
  options?: SelectOption[]
  /** 是否多选 */
  multiple?: boolean
}

/**
 * 单选框字段
 */
export interface RadioField extends FormFieldBase {
  type: 'radio'
  /** 选项列表 */
  options: SelectOption[]
}

/**
 * 上传字段
 */
export interface UploadField extends FormFieldBase {
  type: 'upload'
  /** 上传地址 */
  action?: string
  /** 接受的文件类型 */
  accept?: string
  /** 最大文件数 */
  limit?: number
  /** 最大文件大小（MB） */
  maxSize?: number
  /** 是否多选 */
  multiple?: boolean
  /** 是否显示文件列表 */
  showFileList?: boolean
  /** 列表类型 */
  listType?: 'text' | 'picture' | 'picture-card'
}

/**
 * 表单字段联合类型
 */
export type FormField =
  | InputField
  | TextareaField
  | SelectField
  | DateField
  | NumberField
  | SwitchField
  | CheckboxField
  | RadioField
  | UploadField

/**
 * 表单配置
 */
export interface FormConfig {
  /** 表单字段 */
  fields: FormField[]
  /** 表单布局 */
  layout?: 'horizontal' | 'vertical' | 'inline'
  /** 标签位置 */
  labelPosition?: 'left' | 'right' | 'top'
  /** 标签宽度 */
  labelWidth?: string | number
  /** 表单尺寸 */
  size?: 'small' | 'default' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示操作按钮 */
  showActions?: boolean
  /** 提交按钮文本 */
  submitText?: string
  /** 重置按钮文本 */
  resetText?: string
}

/**
 * 表单实例方法
 */
export interface FormInstance {
  /** 获取表单值 */
  getValues: () => Record<string, any>
  /** 设置表单值 */
  setValues: (values: Record<string, any>) => void
  /** 获取字段值 */
  getFieldValue: (name: string) => any
  /** 设置字段值 */
  setFieldValue: (name: string, value: any) => void
  /** 重置表单 */
  reset: () => void
  /** 校验表单 */
  validate: () => Promise<boolean>
  /** 校验字段 */
  validateField: (name: string) => Promise<boolean>
  /** 获取错误 */
  getErrors: () => Record<string, string[]>
  /** 设置错误 */
  setErrors: (errors: Record<string, string>) => void
  /** 清除错误 */
  clearErrors: () => void
  /** 提交表单 */
  submit: () => Promise<void>
}
```

## 组件 Props 类型

```typescript
// types/components.d.ts

/**
 * 基础组件 Props
 */
export interface BaseComponentProps {
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties | string
  /** 测试 ID */
  testId?: string
  /** aria-label */
  'aria-label'?: string
}

/**
 * 尺寸类型
 */
export type Size = 'small' | 'medium' | 'large'

/**
 * 状态类型
 */
export type Status = 'default' | 'success' | 'warning' | 'error'

/**
 * 按钮 Props
 */
export interface ButtonProps extends BaseComponentProps {
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
  /** 按钮尺寸 */
  size?: Size
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 是否危险按钮 */
  danger?: boolean
  /** 是否块级按钮 */
  block?: boolean
  /** 图标 */
  icon?: React.ReactNode
  /** 点击回调 */
  onClick?: (event: React.MouseEvent) => void
}

/**
 * 输入框 Props
 */
export interface InputProps extends BaseComponentProps {
  /** 当前值 */
  value?: string
  /** 默认值 */
  defaultValue?: string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 最大长度 */
  maxLength?: number
  /** 是否可清空 */
  allowClear?: boolean
  /** 前缀 */
  prefix?: React.ReactNode
  /** 后缀 */
  suffix?: React.ReactNode
  /** 值变化回调 */
  onChange?: (value: string) => void
  /** 输入回调 */
  onInput?: (value: string) => void
  /** 获得焦点回调 */
  onFocus?: (event: React.FocusEvent) => void
  /** 失去焦点回调 */
  onBlur?: (event: React.FocusEvent) => void
}

/**
 * 模态框 Props
 */
export interface ModalProps extends BaseComponentProps {
  /** 是否显示 */
  open: boolean
  /** 标题 */
  title?: React.ReactNode
  /** 宽度 */
  width?: string | number
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 是否显示遮罩 */
  mask?: boolean
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean
  /** 是否居中 */
  centered?: boolean
  /** 是否显示底部 */
  footer?: boolean | React.ReactNode
  /** 确认按钮文本 */
  okText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认回调 */
  onOk?: () => void | Promise<void>
  /** 取消回调 */
  onCancel?: () => void
  /** 关闭后回调 */
  afterClose?: () => void
}

/**
 * 表格列配置
 */
export interface TableColumn<T = any> {
  /** 列标题 */
  title: string
  /** 数据字段 */
  dataIndex?: keyof T
  /** 列宽度 */
  width?: string | number
  /** 最小宽度 */
  minWidth?: number
  /** 是否固定 */
  fixed?: 'left' | 'right'
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sorter?: boolean | ((a: T, b: T) => number)
  /** 自定义渲染 */
  render?: (value: any, record: T, index: number) => React.ReactNode
  /** 是否可筛选 */
  filters?: { text: string; value: any }[]
  /** 筛选函数 */
  onFilter?: (value: any, record: T) => boolean
}

/**
 * 表格 Props
 */
export interface TableProps<T = any> extends BaseComponentProps {
  /** 数据源 */
  dataSource: T[]
  /** 列配置 */
  columns: TableColumn<T>[]
  /** 行 key */
  rowKey?: string | ((record: T) => string)
  /** 是否显示边框 */
  bordered?: boolean
  /** 表格尺寸 */
  size?: 'small' | 'middle' | 'large'
  /** 是否显示加载状态 */
  loading?: boolean
  /** 是否可选择 */
  rowSelection?: {
    type?: 'checkbox' | 'radio'
    selectedRowKeys?: (string | number)[]
    onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void
  }
  /** 分页配置 */
  pagination?: false | {
    current: number
    pageSize: number
    total: number
    onChange?: (page: number, pageSize: number) => void
  }
  /** 滚动配置 */
  scroll?: { x?: number | string; y?: number | string }
}
```

## 业务领域类型

```typescript
// types/models/user.d.ts

/**
 * 用户角色
 */
export type UserRole = 'admin' | 'user' | 'guest'

/**
 * 用户状态
 */
export type UserStatus = 'active' | 'inactive' | 'banned'

/**
 * 用户信息
 */
export interface User {
  /** 用户 ID */
  id: string
  /** 用户名 */
  username: string
  /** 邮箱 */
  email: string
  /** 头像 */
  avatar?: string
  /** 手机号 */
  phone?: string
  /** 角色 */
  role: UserRole
  /** 状态 */
  status: UserStatus
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 最后登录时间 */
  lastLoginTime?: string
}

/**
 * 用户列表查询参数
 */
export interface UserListParams extends ListQueryParams {
  /** 用户名搜索 */
  username?: string
  /** 邮箱搜索 */
  email?: string
  /** 角色筛选 */
  role?: UserRole
  /** 状态筛选 */
  status?: UserStatus
}

/**
 * 创建用户参数
 */
export interface CreateUserParams {
  username: string
  email: string
  password: string
  role: UserRole
  phone?: string
}

/**
 * 更新用户参数
 */
export type UpdateUserParams = Partial<Omit<CreateUserParams, 'password'>> & {
  avatar?: string
  status?: UserStatus
}

/**
 * 登录参数
 */
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

/**
 * 登录响应
 */
export interface LoginResponse {
  user: User
  token: string
  expiresIn: number
}
```

```typescript
// types/models/product.d.ts

/**
 * 商品状态
 */
export type ProductStatus = 'draft' | 'pending' | 'active' | 'inactive'

/**
 * 商品分类
 */
export interface ProductCategory {
  id: string
  name: string
  parentId?: string
  children?: ProductCategory[]
}

/**
 * 商品规格
 */
export interface ProductSpec {
  id: string
  name: string
  value: string
}

/**
 * 商品 SKU
 */
export interface ProductSku {
  id: string
  productId: string
  specs: ProductSpec[]
  price: number
  originalPrice?: number
  stock: number
  sku: string
  image?: string
}

/**
 * 商品信息
 */
export interface Product {
  id: string
  name: string
  description?: string
  categoryId: string
  category?: ProductCategory
  images: string[]
  mainImage: string
  status: ProductStatus
  skus: ProductSku[]
  minPrice: number
  maxPrice: number
  totalStock: number
  salesCount: number
  createTime: string
  updateTime: string
}

/**
 * 商品列表参数
 */
export interface ProductListParams extends ListQueryParams {
  name?: string
  categoryId?: string
  status?: ProductStatus
  minPrice?: number
  maxPrice?: number
}

/**
 * 创建商品参数
 */
export interface CreateProductParams {
  name: string
  description?: string
  categoryId: string
  images: string[]
  status?: ProductStatus
  skus: Omit<ProductSku, 'id' | 'productId'>[]
}
```

## 类型守卫

```typescript
// utils/typeGuards.ts

/**
 * 判断是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 判断是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 判断是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 判断是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 判断是否为数组
 */
export function isArray<T = any>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * 判断是否为函数
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

/**
 * 判断是否为 null
 */
export function isNull(value: unknown): value is null {
  return value === null
}

/**
 * 判断是否为 undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

/**
 * 判断是否为 null 或 undefined
 */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

/**
 * 判断是否为日期
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

/**
 * 判断是否为空对象
 */
export function isEmptyObject(value: unknown): value is Record<string, never> {
  return isObject(value) && Object.keys(value).length === 0
}

/**
 * 判断是否为空数组
 */
export function isEmptyArray(value: unknown): value is [] {
  return isArray(value) && value.length === 0
}

/**
 * 判断属性是否存在
 */
export function hasProperty<T extends object>(
  obj: T,
  key: PropertyKey
): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key)
}
```

## 类型断言工具

```typescript
// utils/typeAssertions.ts

/**
 * 断言条件为真
 */
export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

/**
 * 断言值不为 null 或 undefined
 */
export function assertDefined<T>(value: T | null | undefined, message?: string): T {
  assert(value !== null && value !== undefined, message || 'Value is null or undefined')
  return value
}

/**
 * 断言值为字符串
 */
export function assertString(value: unknown, message?: string): string {
  assert(typeof value === 'string', message || 'Value is not a string')
  return value
}

/**
 * 断言值为数字
 */
export function assertNumber(value: unknown, message?: string): number {
  assert(typeof value === 'number' && !isNaN(value), message || 'Value is not a number')
  return value
}

/**
 * 不可能的类型（用于 exhaustive check）
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`)
}

// 使用示例
// type Shape = 'circle' | 'square' | 'triangle'
// function getArea(shape: Shape): number {
//   switch (shape) {
//     case 'circle': return Math.PI
//     case 'square': return 1
//     case 'triangle': return 0.5
//     default: return assertNever(shape)
//   }
// }
```

## 输出要求

生成类型定义时必须：

1. 使用 `export` 导出所有类型
2. 使用 `.d.ts` 文件扩展名
3. 添加 JSDoc 注释
4. 使用严格的类型（避免 any）
5. 提供类型守卫函数

## 使用示例

### 用户输入

```
生成一个订单模块的类型定义。

订单状态：pending, paid, shipped, delivered, cancelled
支付方式：alipay, wechat, credit_card

订单信息：
- 订单号、用户ID、商品列表、总金额、状态
- 支付信息：支付方式、支付时间、交易号
- 物流信息：快递公司、快递单号、发货时间、收货时间
- 地址信息：收货人、手机号、省市区、详细地址
```

### AI 输出

生成完整的类型定义文件，包括：
- 枚举/联合类型
- 订单主类型
- 订单商品类型
- 支付信息类型
- 物流信息类型
- 地址信息类型
- 查询参数类型
- 创建/更新参数类型
