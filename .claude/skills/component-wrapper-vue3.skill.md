# Skill: UI组件封装规范 (Vue 3)

## 使用场景

当项目使用 Element Plus 等 UI 组件库，但需要统一业务风格、增加通用功能时使用此 Skill：

- 主题色、圆角、间距等设计 Token 统一
- 增加权限控制、埋点等业务通用功能
- 统一空状态、loading 样式
- 简化重复配置

## 技术栈约定

### 核心依赖
- Vue 3.4+ + TypeScript 5
- Element Plus 2.x（或其他 UI 库如 Naive UI、Ant Design Vue）
- Scoped CSS / CSS Modules / UnoCSS（样式方案）
- 设计 Token 系统
- VueUse（组合式函数库）

### 封装原则
- 保持原组件 API 不变
- 只覆盖样式，不改逻辑
- 通过 props/slots/emit 扩展功能
- 支持主题定制

## 设计 Token 配置

### 1. 主题色定义
```typescript
// styles/tokens.ts
export const tokens = {
  // 品牌色
  primary: '#409eff',
  success: '#67c23a',
  warning: '#e6a23c',
  error: '#f56c6c',
  info: '#909399',

  // 中性色
  gray1: '#ffffff',
  gray2: '#fafafa',
  gray3: '#f5f7fa',
  gray4: '#e4e7ed',
  gray5: '#dcdfe6',
  gray6: '#c0c4cc',
  gray7: '#909399',
  gray8: '#606266',
  gray9: '#303133',
  gray10: '#000000',

  // 功能色
  link: '#409eff',
}
```

### 2. 尺寸体系
```typescript
// styles/sizes.ts
export const sizes = {
  // 间距（4px 基准）
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  space5: '20px',
  space6: '24px',
  space7: '32px',
  space8: '40px',
  space9: '48px',
  space10: '64px',

  // 圆角
  borderRadiusSM: '2px',
  borderRadius: '4px',
  borderRadiusLG: '8px',

  // 字体大小
  fontSizeSM: '12px',
  fontSize: '14px',
  fontSizeLG: '16px',
  fontSizeXL: '20px',
  fontSizeXXL: '24px',
}
```

### 3. 组件尺寸映射
```typescript
// styles/componentSizes.ts
export const componentSizes = {
  small: {
    height: '24px',
    padding: '0 8px',
    fontSize: '12px',
  },
  medium: {
    height: '32px',
    padding: '0 12px',
    fontSize: '14px',
  },
  large: {
    height: '40px',
    padding: '0 16px',
    fontSize: '16px',
  },
}
```

## 组件封装原则

### 1. API 兼容性
保持与原组件相同的 API，避免学习成本：
```typescript
// ✅ 推荐：保持相同 props
interface ButtonProps extends ElButtonProps {
  // 只添加业务需要的 props
  trackEvent?: string
  permission?: string
}

// ❌ 不推荐：完全重写 props
interface MyButtonProps {
  // 与原组件完全不同
  text: string
  clickHandler: () => void
}
```

### 2. 样式覆盖
使用 Scoped CSS 或 CSS Modules 覆盖样式：
```vue
<!-- Button/index.vue -->
<template>
  <el-button :class="[$style.button, props.class]" v-bind="attrs">
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

const attrs = useAttrs()
const props = defineProps<ButtonProps>()
</script>

<style module lang="scss">
.button {
  border-radius: var(--border-radius-lg);
  font-weight: 500;
}
</style>
```

### 3. 功能增强
通过 Composables 增加业务功能：
```typescript
// composables/usePermission.ts
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function usePermission() {
  const userStore = useUserStore()

  const hasPermission = (permissionKey: string) => {
    return userStore.permissions.includes(permissionKey)
  }

  const hasAnyPermission = (permissionKeys: string[]) => {
    return permissionKeys.some(key => hasPermission(key))
  }

  const hasAllPermissions = (permissionKeys: string[]) => {
    return permissionKeys.every(key => hasPermission(key))
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
```

## 常见组件封装示例

### 1. Button 组件（主题色、圆角、埋点）
```vue
<!-- components/Button/index.vue -->
<template>
  <el-button
    :class="[$style.button, { [$style.primary]: type === 'primary' }]"
    v-bind="attrs"
    @click="handleClick"
  >
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { useAttrs, computed } from 'vue'
import { ElButton } from 'element-plus'
import type { ButtonProps as ElButtonProps } from 'element-plus'
import { useTracking } from '@/composables/useTracking'
import { usePermission } from '@/composables/usePermission'

interface ButtonProps extends /* @vue-ignore */ ElButtonProps {
  trackEvent?: string
  permission?: string
}

const props = defineProps<ButtonProps>()
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const attrs = useAttrs()
const { track } = useTracking()
const { hasPermission } = usePermission()

// 权限控制
const isVisible = computed(() => {
  return props.permission ? hasPermission(props.permission) : true
})

const handleClick = (event: MouseEvent) => {
  if (props.trackEvent) {
    track(props.trackEvent, { element: 'button' })
  }
  emit('click', event)
}

// 无权限时返回 null
defineExpose({
  isVisible,
})
</script>

<style module lang="scss">
.button {
  border-radius: var(--border-radius-lg, 8px);
  font-weight: 500;
  transition: all 0.2s ease;

  &:global(.el-button--primary) {
    background: var(--primary-color, #409eff);
    border-color: var(--primary-color, #409eff);

    &:hover {
      background: var(--primary-color-hover, #66b1ff);
      border-color: var(--primary-color-hover, #66b1ff);
    }
  }
}
</style>
```

### 2. Input 组件（错误提示、字数统计）
```vue
<!-- components/Input/index.vue -->
<template>
  <div :class="$style.inputWrapper">
    <el-input
      ref="inputRef"
      :class="[$style.input, { [$style.error]: errorMessage }]"
      :model-value="modelValue"
      :maxlength="maxlength"
      v-bind="attrs"
      @update:model-value="handleInput"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData" :key="name">
        <slot :name="name" v-bind="slotData" />
      </template>
    </el-input>

    <div v-if="showCount && maxlength" :class="$style.count">
      {{ count }}/{{ maxlength }}
    </div>

    <div v-if="errorMessage" :class="$style.errorMessage">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots } from 'vue'
import { ElInput } from 'element-plus'
import type { InputProps as ElInputProps } from 'element-plus'

interface InputProps extends /* @vue-ignore */ ElInputProps {
  modelValue?: string
  maxlength?: number
  showCount?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  maxlength: undefined,
  showCount: false,
  errorMessage: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const slots = useSlots()
const inputRef = ref<InstanceType<typeof ElInput>>()

const count = computed(() => props.modelValue?.length ?? 0)

const handleInput = (value: string) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// 暴露 Element Plus Input 的方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
})
</script>

<style module lang="scss">
.inputWrapper {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.input {
  :global(.el-input__wrapper) {
    border-radius: var(--border-radius, 4px);
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 0 0 1px var(--primary-color, #409eff) inset;
    }
  }

  &.error :global(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--error-color, #f56c6c) inset;
  }
}

.count {
  font-size: 12px;
  color: var(--gray7, #909399);
  text-align: right;
}

.errorMessage {
  font-size: 12px;
  color: var(--error-color, #f56c6c);
}
</style>
```

### 3. Table 组件（空状态、loading 样式）
```vue
<!-- components/Table/index.vue -->
<template>
  <div :class="$style.tableContainer">
    <el-table
      ref="tableRef"
      v-loading="loading"
      :class="$style.table"
      :data="data"
      v-bind="attrs"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData" :key="name">
        <slot :name="name" v-bind="slotData" />
      </template>

      <template #empty>
        <slot name="empty">
          <el-empty :description="emptyText" :image="emptyImage" />
        </slot>
      </template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, useSlots } from 'vue'
import { ElTable, ElEmpty } from 'element-plus'
import type { TableProps as ElTableProps } from 'element-plus'

interface TableProps<T = any> extends /* @vue-ignore */ ElTableProps<T> {
  data: T[]
  loading?: boolean
  emptyText?: string
  emptyImage?: string
}

const props = withDefaults(defineProps<TableProps>(), {
  loading: false,
  emptyText: '暂无数据',
  emptyImage: undefined,
})

const slots = useSlots()
const tableRef = ref<InstanceType<typeof ElTable>>()

// 暴露 Element Plus Table 的方法
defineExpose({
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) =>
    tableRef.value?.toggleRowSelection(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  toggleRowExpansion: (row: any, expanded?: boolean) =>
    tableRef.value?.toggleRowExpansion(row, expanded),
  setCurrentRow: (row: any) => tableRef.value?.setCurrentRow(row),
  clearSort: () => tableRef.value?.clearSort(),
  clearFilter: (columnKeys?: string[]) => tableRef.value?.clearFilter(columnKeys),
  doLayout: () => tableRef.value?.doLayout(),
  sort: (prop: string, order: string) => tableRef.value?.sort(prop, order),
})
</script>

<style module lang="scss">
.tableContainer {
  width: 100%;
}

.table {
  border-radius: var(--border-radius-lg, 8px);
  overflow: hidden;

  :global(.el-table__header-wrapper) {
    th {
      background-color: var(--gray2, #fafafa);
    }
  }

  :global(.el-table__body-wrapper) {
    tr:hover > td {
      background-color: var(--gray3, #f5f7fa);
    }
  }
}
</style>
```

### 4. Dialog 组件（固定宽度、关闭确认）
```vue
<!-- components/Dialog/index.vue -->
<template>
  <el-dialog
    ref="dialogRef"
    :class="$style.dialog"
    :model-value="modelValue"
    :width="width"
    :before-close="handleBeforeClose"
    v-bind="attrs"
    @update:model-value="handleUpdate"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData" :key="name">
      <slot :name="name" v-bind="slotData" />
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, useSlots } from 'vue'
import { ElDialog, ElMessageBox } from 'element-plus'
import type { DialogProps as ElDialogProps } from 'element-plus'

interface DialogProps extends /* @vue-ignore */ ElDialogProps {
  modelValue: boolean
  width?: number | string
  confirmClose?: boolean
  confirmMessage?: string
}

const props = withDefaults(defineProps<DialogProps>(), {
  modelValue: false,
  width: '50%',
  confirmClose: false,
  confirmMessage: '确定要关闭吗？未保存的内容将丢失',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const slots = useSlots()
const dialogRef = ref<InstanceType<typeof ElDialog>>()

const handleBeforeClose = async (done: () => void) => {
  if (props.confirmClose) {
    try {
      await ElMessageBox.confirm(props.confirmMessage, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      done()
      emit('close')
    } catch {
      // 用户取消关闭
    }
  } else {
    done()
    emit('close')
  }
}

const handleUpdate = (value: boolean) => {
  emit('update:modelValue', value)
}

defineExpose({
  open: () => emit('update:modelValue', true),
  close: () => emit('update:modelValue', false),
})
</script>

<style module lang="scss">
.dialog {
  :global(.el-dialog__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--gray4, #e4e7ed);
  }

  :global(.el-dialog__body) {
    padding: 20px;
  }

  :global(.el-dialog__footer) {
    padding: 16px 20px;
    border-top: 1px solid var(--gray4, #e4e7ed);
  }
}
</style>
```

### 5. Select 组件（远程搜索、防抖）
```vue
<!-- components/Select/index.vue -->
<template>
  <el-select
    ref="selectRef"
    :class="$style.select"
    :model-value="modelValue"
    :loading="loading"
    :filterable="filterable || remote"
    :remote="remote"
    :remote-method="handleRemoteSearch"
    v-bind="attrs"
    @update:model-value="handleUpdate"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData" :key="name">
      <slot :name="name" v-bind="slotData" />
    </template>

    <el-option
      v-for="option in options"
      :key="getOptionValue(option)"
      :label="getOptionLabel(option)"
      :value="getOptionValue(option)"
      :disabled="option.disabled"
    />
  </el-select>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, watch } from 'vue'
import { ElSelect, ElOption } from 'element-plus'
import type { SelectProps as ElSelectProps } from 'element-plus'
import { useDebounceFn } from '@vueuse/core'

interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  [key: string]: any
}

interface SelectProps extends /* @vue-ignore */ ElSelectProps {
  modelValue?: string | number | string[] | number[]
  options?: SelectOption[]
  filterable?: boolean
  remote?: boolean
  remoteMethod?: (query: string) => Promise<SelectOption[]>
  debounce?: number
  labelKey?: string
  valueKey?: string
}

const props = withDefaults(defineProps<SelectProps>(), {
  modelValue: '',
  options: () => [],
  filterable: false,
  remote: false,
  remoteMethod: undefined,
  debounce: 300,
  labelKey: 'label',
  valueKey: 'value',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | string[] | number[]]
  change: [value: string | number | string[] | number[]]
  search: [query: string]
}>()

const slots = useSlots()
const selectRef = ref<InstanceType<typeof ElSelect>>()
const loading = ref(false)
const remoteOptions = ref<SelectOption[]>([])

const options = computed(() =>
  props.remote ? remoteOptions.value : props.options
)

const getOptionLabel = (option: SelectOption) => option[props.labelKey]
const getOptionValue = (option: SelectOption) => option[props.valueKey]

const handleRemoteSearch = useDebounceFn(async (query: string) => {
  if (!props.remoteMethod) return

  emit('search', query)

  if (!query) {
    remoteOptions.value = []
    return
  }

  loading.value = true
  try {
    remoteOptions.value = await props.remoteMethod(query)
  } catch (error) {
    console.error('Remote search failed:', error)
    remoteOptions.value = []
  } finally {
    loading.value = false
  }
}, props.debounce)

const handleUpdate = (value: string | number | string[] | number[]) => {
  emit('update:modelValue', value)
  emit('change', value)
}

defineExpose({
  focus: () => selectRef.value?.focus(),
  blur: () => selectRef.value?.blur(),
})
</script>

<style module lang="scss">
.select {
  width: 100%;

  :global(.el-input__wrapper) {
    border-radius: var(--border-radius, 4px);
  }
}
</style>
```

## 主题配置

### 1. Element Plus 主题定制
```typescript
// styles/theme.ts
import type { ConfigProviderProps } from 'element-plus'

export const elementPlusConfig: ConfigProviderProps = {
  // 主题色
  theme: {
    // 使用 CSS 变量覆盖
  },
}

// 使用 CSS 变量覆盖 Element Plus 主题
export const cssVariables = `
  :root {
    --el-color-primary: #409eff;
    --el-color-primary-light-3: #79bbff;
    --el-color-primary-light-5: #a0cfff;
    --el-color-primary-light-7: #c6e2ff;
    --el-color-primary-light-8: #d9ecff;
    --el-color-primary-light-9: #ecf5ff;
    --el-color-primary-dark-2: #337ecc;

    --el-color-success: #67c23a;
    --el-color-warning: #e6a23c;
    --el-color-danger: #f56c6c;
    --el-color-error: #f56c6c;
    --el-color-info: #909399;

    --el-border-radius-base: 4px;
    --el-border-radius-small: 2px;
    --el-border-radius-round: 8px;

    --el-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --el-font-size-base: 14px;

    --el-component-size-small: 24px;
    --el-component-size: 32px;
    --el-component-size-large: 40px;
  }
`
```

### 2. 全局样式重置
```css
/* styles/reset.css */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --error-color: #f56c6c;

  --border-radius-sm: 2px;
  --border-radius: 4px;
  --border-radius-lg: 8px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--gray9, #303133);
  background-color: #fff;
}
```

### 3. SCSS 变量文件
```scss
// styles/variables.scss
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$error-color: #f56c6c;
$info-color: #909399;

// 间距
$space-xs: 4px;
$space-sm: 8px;
$space-md: 12px;
$space-lg: 16px;
$space-xl: 20px;
$space-xxl: 24px;

// 圆角
$border-radius-sm: 2px;
$border-radius: 4px;
$border-radius-lg: 8px;

// 字体大小
$font-size-sm: 12px;
$font-size-base: 14px;
$font-size-lg: 16px;
$font-size-xl: 20px;

// 组件高度
$component-height-sm: 24px;
$component-height: 32px;
$component-height-lg: 40px;
```

## 常用 Composables

### 1. 埋点 Hook
```typescript
// composables/useTracking.ts
import { onMounted, onUnmounted } from 'vue'

interface TrackingEvent {
  name: string
  params?: Record<string, any>
}

export function useTracking() {
  const track = (eventName: string, params?: Record<string, any>) => {
    // 发送埋点数据
    console.log('Track:', eventName, params)
    // 实际项目中可调用埋点 SDK
    // window.analytics?.track(eventName, params)
  }

  const trackPageView = (pageName: string) => {
    track('page_view', { page: pageName })
  }

  const trackClick = (element: string, extra?: Record<string, any>) => {
    track('click', { element, ...extra })
  }

  return {
    track,
    trackPageView,
    trackClick,
  }
}
```

### 2. Loading Hook
```typescript
// composables/useLoading.ts
import { ref, computed } from 'vue'

export function useLoading(initialState = false) {
  const loading = ref(initialState)

  const startLoading = () => {
    loading.value = true
  }

  const stopLoading = () => {
    loading.value = false
  }

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    startLoading()
    try {
      return await fn()
    } finally {
      stopLoading()
    }
  }

  return {
    loading: computed(() => loading.value),
    startLoading,
    stopLoading,
    withLoading,
  }
}
```

### 3. 表单校验 Hook
```typescript
// composables/useFormValidation.ts
import { ref, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T
) {
  const formRef = ref<FormInstance>()
  const formData = ref<T>({ ...initialValues }) as { value: T }
  const errors = ref<Record<string, string>>({})

  const validate = async (): Promise<boolean> => {
    if (!formRef.value) return false

    try {
      await formRef.value.validate()
      errors.value = {}
      return true
    } catch (error) {
      const validationErrors = error as Record<string, { message: string }[]>
      Object.keys(validationErrors).forEach((key) => {
        errors.value[key] = validationErrors[key][0]?.message || ''
      })
      return false
    }
  }

  const resetForm = () => {
    formRef.value?.resetFields()
    formData.value = { ...initialValues }
    errors.value = {}
  }

  const setFieldValue = <K extends keyof T>(field: K, value: T[K]) => {
    formData.value[field] = value
  }

  return {
    formRef,
    formData,
    errors,
    validate,
    resetForm,
    setFieldValue,
  }
}
```

## 使用示例

### 1. 在项目中统一引入
```typescript
// src/components/index.ts
export { default as Button } from './Button'
export { default as Input } from './Input'
export { default as Select } from './Select'
export { default as Table } from './Table'
export { default as Dialog } from './Dialog'
```

### 2. 全局注册组件
```typescript
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as components from '@/components'
import App from './App.vue'
import './styles/reset.css'

const app = createApp(App)

app.use(ElementPlus)

// 全局注册封装的组件
Object.entries(components).forEach(([name, component]) => {
  app.component(name, component)
})

app.mount('#app')
```

### 3. 按需使用业务功能
```vue
<template>
  <div class="demo">
    <!-- 带埋点的按钮 -->
    <Button type="primary" track-event="user_click_submit" @click="handleSubmit">
      提交
    </Button>

    <!-- 带字数统计的输入框 -->
    <Input
      v-model="inputValue"
      placeholder="请输入内容"
      :max-length="100"
      show-count
    />

    <!-- 远程搜索选择器 -->
    <Select
      v-model="selectedValue"
      :options="options"
      remote
      :remote-method="searchUsers"
      placeholder="搜索用户"
    />

    <!-- 带确认关闭的弹窗 -->
    <Dialog v-model="dialogVisible" title="新建订单" confirm-close>
      <p>弹窗内容</p>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button, Input, Select, Dialog } from '@/components'

const inputValue = ref('')
const selectedValue = ref('')
const dialogVisible = ref(false)
const options = ref([])

const handleSubmit = () => {
  console.log('提交')
}

const searchUsers = async (query: string) => {
  // 模拟远程搜索
  const res = await fetch(`/api/users?keyword=${query}`)
  const data = await res.json()
  return data.map((user: any) => ({
    label: user.name,
    value: user.id,
  }))
}
</script>
```

## 输出要求

生成 UI 组件封装时必须：

1. 保持与原组件 API 兼容（使用 `v-bind="attrs"` 透传属性）
2. 使用设计 Token 统一样式
3. 通过 props/slots/emit 扩展业务功能
4. 包含完整的 TypeScript 类型定义（使用 `extends /* @vue-ignore */` 继承原组件类型）
5. 提供主题配置示例
6. 使用 `<script setup>` 语法
7. 通过 `defineExpose` 暴露原组件方法
8. 支持所有 slots 透传
9. 遵循 Vue 3 组合式 API 最佳实践
