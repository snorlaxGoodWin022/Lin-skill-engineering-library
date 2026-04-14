# Skill: 代码规范标准

## 适用范围

本规范适用于项目所有前端代码，包括：

- Vue3组件
- TypeScript类型定义
- 工具函数
- API请求
- 测试代码

## 命名规范

### 1. 文件命名

- **组件文件**：PascalCase.vue
  - 示例：`UserCard.vue`、`ProductList.vue`
- **工具函数文件**：camelCase.ts
  - 示例：`formatDate.ts`、`validateEmail.ts`
- **常量文件**：camelCase.ts或UPPER_SNAKE_CASE.ts
  - 示例：`apiConfig.ts`、`APP_CONFIG.ts`
- **类型文件**：camelCase.types.ts
  - 示例：`user.types.ts`、`api.types.ts`
- **Composable文件**：useXxx.ts
  - 示例：`useUserData.ts`、`useDebounce.ts`

### 2. 变量命名

- **常量**：UPPER_SNAKE_CASE
  ```typescript
  const MAX_RETRY_COUNT = 3
  const API_BASE_URL = 'https://api.example.com'
  ```

* **普通变量**：camelCase

```typescript
const userName = 'Alice'
const productList = []
```

- **布尔值**：用is/has/should开头

```typescript
const isLoading = false
const hasPermission = true
const shouldShowModal = false
```

- **数组**：用复数形式

```typescript
const users = []
const products = []
```

- **对象**：用单数形式

```typescript
const user = { id: 1, name: 'Alice' }
const config = { timeout: 3000 }
```

### 3. 函数命名

- **普通函数**：camelCase，动词开头

```typescript
function fetchUserData() {}
function validateEmail() {}
function calculateTotal() {}
```

- **事件处理函数**：handle开头

```typescript
function handleClick() {}
function handleSubmit() {}
function handleInputChange() {}
```

- **Vue3组件**：PascalCase

```vue
<!-- UserCard.vue -->
<template>
  <div>...</div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>
```

- **自定义Composable**：use开头，camelCase

```typescript
function useUserData() {}
function useDebounce() {}
```

### 4. 类型命名

- **Interface**：PascalCase，不加I前缀

```typescript
interface User {
  id: string
  name: string
}
```

- **Type**：PascalCase

```typescript
type Status = 'pending' | 'success' | 'error'
```

- **泛型参数**：单个大写字母或PascalCase

```typescript
function identity<T>(arg: T): T {}
function map<TInput, TOutput>(fn: (item: TInput) => TOutput) {}
```

## 目录结构规范

```plain
src/
├── components/          # 公共组件
│   ├── Button/
│   │   ├── index.vue
│   │   ├── Button.types.ts
│   │   └── Button.module.css
│   └── ...
├── views/               # 页面组件
│   ├── User/
│   │   ├── List.vue
│   │   ├── Detail.vue
│   │   └── Edit.vue
│   └── ...
├── composables/         # 自定义Composables
├── utils/               # 工具函数
├── services/            # API服务
├── stores/              # 状态管理
├── types/               # 全局类型定义
├── constants/           # 常量配置
└── assets/              # 静态资源
```

## 代码风格规范

### 1. 函数定义

**统一使用箭头函数**

```typescript
// ✅ 推荐
const fetchUserData = async (id: string) => {
  // ...
}

// ❌ 不推荐
async function fetchUserData(id: string) {
  // ...
}
```

### 2. 解构赋值

**能解构的尽量解构**

```typescript
// ✅ 推荐
const { name, age } = user
const [first, second, ...rest] = array

// ❌ 不推荐
const name = user.name
const age = user.age
```

### 3. 可选链和空值合并

**使用?.和??简化代码**

```typescript
// ✅ 推荐
const userName = user?.profile?.name ?? '匿名用户'

// ❌ 不推荐
const userName = (user && user.profile && user.profile.name) || '匿名用户'
```

### 4. 模板字符串

**字符串拼接用模板字符串**

```typescript
// ✅ 推荐
const greeting = `Hello, ${userName}!`

// ❌ 不推荐
const greeting = 'Hello, ' + userName + '!'
```

## 注释规范

### 1. JSDoc注释

**所有导出的函数和组件必须有JSDoc注释**

```typescript
/**
 * 格式化日期
 * @param date - 日期对象或时间戳
 * @param format - 格式化模板，默认'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
 * // => '2024-01-01 12:00:00'
 */
export const formatDate = (date: Date | number, format: string = 'YYYY-MM-DD'): string => {
  // 实现...
}
```

### 2. 行内注释

**复杂逻辑必须加注释说明**

```typescript
// ✅ 推荐
// 计算折扣：满100减10，满200减30
const discount = total >= 200 ? 30 : total >= 100 ? 10 : 0

// ❌ 不推荐（没注释，看不懂）
const discount = total >= 200 ? 30 : total >= 100 ? 10 : 0
```

### 3. TODO注释

**临时方案用TODO标记**

```typescript
// TODO: 优化性能，改用虚拟滚动
const renderList = () => {
  return items.map(item => <Item key={item.id} data={item} />);
};

// FIXME: 修复Safari浏览器兼容问题
const handleScroll = () => {
  // ...
};
```

## TypeScript规范

### 1. 禁止使用any

**必须指定明确类型，特殊情况用unknown**

```typescript
// ✅ 推荐
const fetchData = async (url: string): Promise<User[]> => {
  // ...
}

// ❌ 禁止
const fetchData = async (url: string): Promise<any> => {
  // ...
}

// ✅ 不确定类型时用unknown
const parseJSON = (json: string): unknown => {
  return JSON.parse(json)
}
```

### 2. 类型定义要完整

**Props、返回值、参数都要定义类型**

```vue
<!-- ✅ 推荐 -->
<template>
  <button @click="onClick" :disabled="disabled">{{ text }}</button>
</template>

<script setup lang="ts">
interface ButtonProps {
  text: string
  onClick: () => void
  disabled?: boolean
}

const props = defineProps<ButtonProps>()
</script>

<!-- ❌ 不推荐 -->
<template>
  <button @click="onClick" :disabled="disabled">{{ text }}</button>
</template>

<script setup>
// 没有类型定义
const props = defineProps(['text', 'onClick', 'disabled'])
</script>
```

### 3. 用Type还是Interface？

- 组件Props、函数参数 → 用Interface
- 联合类型、工具类型 → 用Type

```typescript
// ✅ Interface用于对象结构
interface User {
  id: string
  name: string
}

// ✅ Type用于联合类型
type Status = 'pending' | 'success' | 'error'
type ButtonSize = 'small' | 'medium' | 'large'
```

## 错误处理规范

### 1. 统一错误处理

**所有异步操作必须try-catch**

```typescript
// ✅ 推荐
const fetchUserData = async (id: string) => {
  try {
    const data = await api.getUser(id)
    return data
  } catch (error) {
    console.error('获取用户数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    throw error // 继续抛出，让上层决定如何处理
  }
}
```

### 2. 错误提示要具体

**告诉用户哪里出错了，怎么解决**

```typescript
// ✅ 推荐
if (!email.includes('@')) {
  throw new Error('邮箱格式不正确，请输入包含@的邮箱地址')
}

// ❌ 不推荐
if (!email.includes('@')) {
  throw new Error('输入错误')
}
```

### 3. 网络请求错误处理

```typescript
const fetchData = async () => {
  try {
    const res = await api.getData()
    return res.data
  } catch (error: any) {
    // 区分不同错误类型
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      // 跳转登录页
    } else if (error.response?.status === 403) {
      ElMessage.error('无权限访问')
    } else if (error.response?.status === 404) {
      ElMessage.error('请求的资源不存在')
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查网络')
    } else {
      ElMessage.error('操作失败，请稍后重试')
    }
    throw error
  }
}
```

## Vue3规范

### 1. 组件拆分原则

**单一职责，一个组件只做一件事**

```vue
<!-- ✅ 推荐：拆分成多个小组件 -->
<template>
  <div>
    <SearchBar />
    <UserTable />
    <Pagination />
  </div>
</template>

<script setup lang="ts">
import SearchBar from './SearchBar.vue'
import UserTable from './UserTable.vue'
import Pagination from './Pagination.vue'
</script>

<!-- ❌ 不推荐：所有逻辑堆在一个组件 -->
<template>
  <div>
    <!-- 500行代码... -->
  </div>
</template>
```

### 2. 状态管理

**能用props就不用ref，能用local state就不用global state**

```vue
<!-- ✅ 推荐 -->
<template>
  <div v-if="open">...</div>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  onClose: () => void
}>()
</script>

<!-- ❌ 不推荐 -->
<template>
  <div v-if="open">...</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 弹窗状态应该由父组件控制，而不是自己管理
const open = ref(false)
</script>
```

### 3. 生命周期规范

**使用Composition API的生命周期钩子**

```vue
<template>
  <div>{{ data }}</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { fetchData } from '@/services/api'

const props = defineProps<{
  userId: string
}>()

const data = ref<any>(null)

onMounted(async () => {
  await loadData()
})

watch(
  () => props.userId,
  async (newUserId) => {
    await loadData()
  }
)

const loadData = async () => {
  try {
    data.value = await fetchData(props.userId)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}
</script>
```

### 4. 性能优化

**列表必须加key，避免不必要的重渲染**

```vue
<!-- ✅ 推荐 -->
<template>
  <div v-for="user in users" :key="user.id">
    <UserCard :data="user" />
  </div>
</template>

<!-- ❌ 不推荐 -->
<template>
  <div v-for="(user, index) in users" :key="index">
    <UserCard :data="user" />
  </div>
</template>
```

**大列表用v-memo**

```vue
<template>
  <div v-for="user in users" :key="user.id" v-memo="[user.id, user.name]">
    {{ user.name }}
  </div>
</template>
```

## 代码质量检查清单

在提交代码前，AI和人工都要检查以下项：

- [ ] 所有导出函数有JSDoc注释
- [ ] 没有any类型
- [ ] Props有完整TypeScript定义
- [ ] 异步操作有try-catch
- [ ] 列表渲染有key
- [ ] 生命周期钩子使用正确
- [ ] 文件命名符合规范
- [ ] 变量命名语义化
- [ ] 没有console.log（除了错误日志）
- [ ] 没有被注释掉的代码

## 输出要求

AI生成代码时，必须完全遵守以上规范，违反任何一条都需要重新生成。

Code Review时发现不符合规范的代码，必须打回修改。
