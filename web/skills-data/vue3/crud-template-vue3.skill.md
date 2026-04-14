# Skill: CRUD业务模板生成器 (Vue 3)

## 使用场景

用于快速生成标准的列表-详情-编辑三页面结构，适用于：

- 用户管理
- 订单管理
- 商品管理
- 内容管理
- 任何需要 CRUD 操作的业务对象

## 技术栈

### 核心依赖

- Vue 3.4+ + TypeScript 5
- Vue Router 4（路由）
- @tanstack/vue-query（数据请求）
- Pinia（全局状态）
- Element Plus 2.x（UI 组件）
- VeeValidate + Zod（表单校验）

### 状态管理分工

- 列表数据：Vue Query（支持缓存和自动刷新）
- 筛选条件：URL Query 参数（支持刷新保持状态）
- 弹窗开关：组件内 ref
- 用户信息：Pinia 全局 store

## 文件结构规范

每个 CRUD 模块必须按以下结构组织：

```
ModuleName/
├── index.vue              # 路由入口
├── List/
│   ├── index.vue          # 列表页主组件
│   ├── SearchForm.vue     # 搜索筛选表单
│   ├── columns.ts         # 表格列配置
│   └── composables/
│       └── useListData.ts # 列表数据 composable
├── Detail/
│   ├── index.vue          # 详情页
│   ├── InfoCard.vue       # 信息展示卡片
│   └── composables/
│       └── useDetailData.ts # 详情数据 composable
├── Edit/
│   ├── index.vue          # 编辑页（新建和编辑共用）
│   ├── EditForm.vue       # 表单组件
│   └── composables/
│       └── useEditSubmit.ts # 提交逻辑 composable
├── composables/
│   └── useModule.ts       # 模块通用 composables
├── types.ts               # 模块类型定义
├── api.ts                 # API 请求函数
├── constants.ts           # 常量配置
└── schema.ts              # Zod 校验 schema
```

## API 层规范

### 1. API 函数命名

```typescript
// api.ts
import request from '@/utils/request'
import type { ListParams, ListResponse, DetailData, CreateParams, UpdateParams } from './types'

/**
 * 获取列表
 */
export async function fetchList(params: ListParams): Promise<ListResponse> {
  return request.get('/api/module/list', { params })
}

/**
 * 获取详情
 */
export async function fetchDetail(id: string): Promise<DetailData> {
  return request.get(`/api/module/${id}`)
}

/**
 * 创建
 */
export async function create(data: CreateParams): Promise<void> {
  return request.post('/api/module', data)
}

/**
 * 更新
 */
export async function update(id: string, data: UpdateParams): Promise<void> {
  return request.put(`/api/module/${id}`, data)
}

/**
 * 删除
 */
export async function remove(id: string): Promise<void> {
  return request.delete(`/api/module/${id}`)
}

/**
 * 批量删除
 */
export async function batchRemove(ids: string[]): Promise<void> {
  return request.post('/api/module/batch-delete', { ids })
}
```

### 2. 类型定义

```typescript
// types.ts

// 列表查询参数
export interface ListParams {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  startDate?: string
  endDate?: string
  // 其他筛选字段...
}

// 列表响应
export interface ListResponse {
  list: ListItem[]
  total: number
}

// 列表项
export interface ListItem {
  id: string
  name: string
  status: 'active' | 'inactive'
  createTime: string
  updateTime: string
  // 其他字段...
}

// 详情数据（通常比列表项字段更多）
export interface DetailData extends ListItem {
  description: string
  // 更多详细字段...
}

// 创建参数
export interface CreateParams {
  name: string
  // 其他必填字段...
}

// 更新参数（通常和创建参数一样，但某些字段可选）
export type UpdateParams = Partial<CreateParams>
```

### 3. Zod 校验 Schema

```typescript
// schema.ts
import { z } from 'zod'

export const editSchema = z.object({
  name: z.string().min(1, '请输入名称').max(50, '名称不能超过50个字符'),
  status: z.enum(['active', 'inactive'], { required_error: '请选择状态' }),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
})

export type EditFormData = z.infer<typeof editSchema>
```

## 列表页规范

### 1. 筛选条件管理

使用 URL Query 参数存储筛选条件，好处：

- 刷新页面筛选条件不丢失
- 可以分享筛选后的 URL 给同事
- 浏览器前进后退按钮可用

```typescript
// List/composables/useListData.ts
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { fetchList } from '../../api'
import type { ListParams } from '../../types'

export function useListData() {
  const route = useRoute()
  const router = useRouter()

  // 从 URL 读取筛选条件
  const params = computed<ListParams>(() => ({
    pageNum: Number(route.query.pageNum) || 1,
    pageSize: Number(route.query.pageSize) || 20,
    keyword: (route.query.keyword as string) || '',
    status: (route.query.status as string) || '',
  }))

  // 获取列表数据
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['moduleList', params],
    queryFn: () => fetchList(params.value),
  })

  // 更新筛选条件
  const updateParams = (newParams: Partial<ListParams>) => {
    const query = { ...route.query, ...newParams }

    // 筛选条件变化时，重置到第一页
    if ('keyword' in newParams || 'status' in newParams) {
      query.pageNum = '1'
    }

    // 移除空值
    Object.keys(query).forEach((key) => {
      if (query[key] === '' || query[key] === undefined) {
        delete query[key]
      }
    })

    router.push({ query })
  }

  // 重置筛选条件
  const resetParams = () => {
    router.push({ query: {} })
  }

  return {
    list: computed(() => data.value?.list || []),
    total: computed(() => data.value?.total || 0),
    params,
    isLoading,
    updateParams,
    resetParams,
    refetch,
  }
}
```

### 2. 搜索表单组件

```vue
<!-- List/SearchForm.vue -->
<template>
  <el-form :model="formData" inline>
    <el-form-item label="关键词">
      <el-input
        v-model="formData.keyword"
        placeholder="搜索关键词"
        clearable
        style="width: 200px"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      />
    </el-form-item>

    <el-form-item label="状态">
      <el-select
        v-model="formData.status"
        placeholder="全部"
        clearable
        style="width: 120px"
        @change="handleSearch"
      >
        <el-option label="全部" value="" />
        <el-option label="启用" value="active" />
        <el-option label="禁用" value="inactive" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
      <el-button @click="handleReset"> 重置 </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface SearchFormProps {
  initialValues: {
    keyword?: string
    status?: string
  }
}

interface SearchFormEmits {
  (e: 'search', values: Record<string, any>): void
  (e: 'reset'): void
}

const props = defineProps<SearchFormProps>()
const emit = defineEmits<SearchFormEmits>()

const formData = reactive({
  keyword: props.initialValues.keyword || '',
  status: props.initialValues.status || '',
})

// 监听外部初始值变化
watch(
  () => props.initialValues,
  (newValues) => {
    formData.keyword = newValues.keyword || ''
    formData.status = newValues.status || ''
  },
  { deep: true }
)

const handleSearch = () => {
  emit('search', { ...formData })
}

const handleReset = () => {
  formData.keyword = ''
  formData.status = ''
  emit('reset')
}
</script>
```

### 3. 表格列配置

```typescript
// List/columns.ts
import { h } from 'vue'
import { ElButton, ElTag, ElSpace, ElPopconfirm } from 'element-plus'
import type { TableColumnCtx } from 'element-plus'
import type { ListItem } from '../types'

interface GetColumnsParams {
  onEdit: (record: ListItem) => void
  onDelete: (id: string) => void
  onDetail: (id: string) => void
}

export function getColumns({
  onEdit,
  onDelete,
  onDetail,
}: GetColumnsParams): TableColumnCtx<ListItem>[] {
  return [
    {
      prop: 'id',
      label: 'ID',
      width: 100,
    },
    {
      prop: 'name',
      label: '名称',
      width: 200,
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      render: ({ row }) =>
        h(ElTag, { type: row.status === 'active' ? 'success' : 'danger' }, () =>
          row.status === 'active' ? '启用' : '禁用'
        ),
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 180,
    },
    {
      prop: 'action',
      label: '操作',
      width: 200,
      fixed: 'right',
      render: ({ row }) =>
        h(ElSpace, null, () => [
          h(
            ElButton,
            {
              type: 'primary',
              link: true,
              size: 'small',
              onClick: () => onDetail(row),
            },
            () => '详情'
          ),
          h(
            ElButton,
            {
              type: 'primary',
              link: true,
              size: 'small',
              onClick: () => onEdit(row),
            },
            () => '编辑'
          ),
          h(
            ElPopconfirm,
            {
              title: '确认删除？',
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              onConfirm: () => onDelete(row.id),
            },
            {
              reference: () =>
                h(ElButton, { type: 'danger', link: true, size: 'small' }, () => '删除'),
            }
          ),
        ]),
    },
  ]
}
```

### 4. 列表页主组件

```vue
<!-- List/index.vue -->
<template>
  <div class="list-container">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <SearchForm
        :initial-values="{
          keyword: params.keyword,
          status: params.status,
        }"
        @search="handleSearch"
        @reset="handleReset"
      />
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="isLoading" :data="list" :columns="columns" row-key="id" border>
      <!-- 自定义列渲染 -->
      <template v-for="col in columns" :key="col.prop">
        <el-table-column v-bind="col">
          <template #default="scope">
            <component :is="col.render?.(scope)" v-if="col.render" />
            <span v-else>{{ scope.row[col.prop!] }}</span>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editingRecord ? '编辑' : '新建'"
      width="600px"
      destroy-on-close
    >
      <EditForm
        :mode="editingRecord ? 'edit' : 'create'"
        :initial-data="editingRecord"
        @success="handleEditSuccess"
        @cancel="editDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import SearchForm from './SearchForm.vue'
import EditForm from '../Edit/EditForm.vue'
import { getColumns } from './columns'
import { useListData } from './composables/useListData'
import { remove } from '../api'

const router = useRouter()
const { list, total, params, isLoading, updateParams, resetParams, refetch } = useListData()

// 分页状态
const currentPage = ref(params.value.pageNum)
const pageSize = ref(params.value.pageSize)

// 同步 URL 参数到分页组件
watch(
  () => params.value,
  (newParams) => {
    currentPage.value = newParams.pageNum
    pageSize.value = newParams.pageSize
  }
)

// 弹窗状态
const editDialogVisible = ref(false)
const editingRecord = ref<any>(null)

// 表格列配置
const columns = computed(() =>
  getColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onDetail: handleDetail,
  })
)

// 搜索
const handleSearch = (values: Record<string, any>) => {
  updateParams(values)
}

// 重置
const handleReset = () => {
  resetParams()
}

// 分页
const handlePageChange = () => {
  updateParams({
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  })
}

// 新建
const handleCreate = () => {
  editingRecord.value = null
  editDialogVisible.value = true
}

// 编辑
const handleEdit = (record: any) => {
  editingRecord.value = { ...record }
  editDialogVisible.value = true
}

// 删除
const handleDelete = async (id: string) => {
  try {
    await remove(id)
    ElMessage.success('删除成功')
    refetch()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 查看详情
const handleDetail = (id: string) => {
  router.push(`/module/${id}`)
}

// 编辑成功
const handleEditSuccess = () => {
  editDialogVisible.value = false
  refetch()
}
</script>

<style scoped lang="scss">
.list-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
```

## 详情页规范

```vue
<!-- Detail/index.vue -->
<template>
  <div class="detail-container">
    <!-- 返回按钮 -->
    <el-button @click="router.back()" style="margin-bottom: 16px">
      <el-icon><ArrowLeft /></el-icon>
      返回
    </el-button>

    <!-- 加载状态 -->
    <el-skeleton v-if="isLoading" :rows="10" animated />

    <!-- 详情内容 -->
    <template v-else-if="data">
      <el-card header="基本信息">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">
            {{ data.id }}
          </el-descriptions-item>
          <el-descriptions-item label="名称">
            {{ data.name }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="data.status === 'active' ? 'success' : 'danger'">
              {{ data.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ data.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ data.description || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button type="primary" @click="handleEdit"> 编辑 </el-button>
        <el-popconfirm title="确认删除？" @confirm="handleDelete">
          <template #reference>
            <el-button type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </div>
    </template>

    <!-- 空状态 -->
    <el-empty v-else description="数据不存在" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchDetail, remove } from '../api'

const route = useRoute()
const router = useRouter()

const id = computed(() => route.params.id as string)

// 获取详情数据
const { data, isLoading } = useQuery({
  queryKey: ['moduleDetail', id],
  queryFn: () => fetchDetail(id.value),
  enabled: () => !!id.value,
})

// 编辑
const handleEdit = () => {
  router.push(`/module/${id.value}/edit`)
}

// 删除
const handleDelete = async () => {
  try {
    await remove(id.value)
    ElMessage.success('删除成功')
    router.back()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}
</script>

<style scoped lang="scss">
.detail-container {
  padding: 20px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
</style>
```

## 编辑页规范

编辑页和新建页共用一个组件，通过 mode 区分：

```vue
<!-- Edit/EditForm.vue -->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="100px"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="名称" prop="name">
      <el-input v-model="formData.name" placeholder="请输入名称" maxlength="50" show-word-limit />
    </el-form-item>

    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="formData.status">
        <el-radio value="active">启用</el-radio>
        <el-radio value="inactive">禁用</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="描述" prop="description">
      <el-input
        v-model="formData.description"
        type="textarea"
        :rows="4"
        placeholder="请输入描述"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>

    <el-form-item>
      <el-space>
        <el-button type="primary" native-type="submit" :loading="submitting">
          {{ mode === 'create' ? '创建' : '保存' }}
        </el-button>
        <el-button @click="emit('cancel')"> 取消 </el-button>
      </el-space>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { create, update } from '../api'
import type { EditFormData } from '../schema'

interface EditFormProps {
  mode: 'create' | 'edit'
  initialData?: Record<string, any>
}

interface EditFormEmits {
  (e: 'success'): void
  (e: 'cancel'): void
}

const props = defineProps<EditFormProps>()
const emit = defineEmits<EditFormEmits>()

const queryClient = useQueryClient()
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive<EditFormData>({
  name: '',
  status: 'active',
  description: '',
})

// 初始化表单数据
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      formData.name = data.name || ''
      formData.status = data.status || 'active'
      formData.description = data.description || ''
    }
  },
  { immediate: true }
)

// 表单校验规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { max: 50, message: '名称不能超过50个字符', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  description: [{ max: 500, message: '描述不能超过500个字符', trigger: 'blur' }],
}

// 创建 mutation
const createMutation = useMutation({
  mutationFn: create,
  onSuccess: () => {
    ElMessage.success('创建成功')
    queryClient.invalidateQueries({ queryKey: ['moduleList'] })
    emit('success')
  },
  onError: () => {
    ElMessage.error('创建失败')
  },
})

// 更新 mutation
const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: EditFormData }) => update(id, data),
  onSuccess: () => {
    ElMessage.success('保存成功')
    queryClient.invalidateQueries({ queryKey: ['moduleList'] })
    queryClient.invalidateQueries({ queryKey: ['moduleDetail'] })
    emit('success')
  },
  onError: () => {
    ElMessage.error('保存失败')
  },
})

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (props.mode === 'create') {
      await createMutation.mutateAsync(formData)
    } else {
      await updateMutation.mutateAsync({
        id: props.initialData!.id,
        data: formData,
      })
    }
  } finally {
    submitting.value = false
  }
}

// 暴露方法
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
})
</script>
```

## Composables 复用

### 1. 通用列表数据 Hook

```typescript
// composables/useListQuery.ts
import { computed, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'

interface UseListQueryOptions<T, P> {
  queryKey: string
  fetchFn: (params: P) => Promise<{ list: T[]; total: number }>
  params: MaybeRef<P>
  staleTime?: number
}

export function useListQuery<T, P extends Record<string, any>>(options: UseListQueryOptions<T, P>) {
  const { queryKey, fetchFn, params, staleTime = 5 * 60 * 1000 } = options

  const paramsValue = computed(() => toValue(params))

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [queryKey, paramsValue],
    queryFn: () => fetchFn(paramsValue.value),
    staleTime,
  })

  return {
    list: computed(() => data.value?.list || []),
    total: computed(() => data.value?.total || 0),
    isLoading,
    isFetching,
    refetch,
  }
}
```

### 2. 通用详情数据 Hook

```typescript
// composables/useDetailQuery.ts
import { computed, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'

interface UseDetailQueryOptions<T> {
  queryKey: string
  fetchFn: (id: string) => Promise<T>
  id: MaybeRef<string | undefined>
  staleTime?: number
}

export function useDetailQuery<T>(options: UseDetailQueryOptions<T>) {
  const { queryKey, fetchFn, id, staleTime = 10 * 60 * 1000 } = options

  const idValue = computed(() => toValue(id))

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [queryKey, idValue],
    queryFn: () => fetchFn(idValue.value!),
    enabled: () => !!idValue.value,
    staleTime,
  })

  return {
    data,
    isLoading,
    isFetching,
    refetch,
  }
}
```

### 3. 通用操作 Hook

```typescript
// composables/useMutation.ts
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ElMessage } from 'element-plus'

interface UseMutationOptions<T, P> {
  mutationFn: (params: P) => Promise<T>
  queryKey: string | string[]
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
}

export function useMutationAction<T, P>(options: UseMutationOptions<T, P>) {
  const queryClient = useQueryClient()
  const { mutationFn, queryKey, successMessage, errorMessage, onSuccess } = options

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      if (successMessage) {
        ElMessage.success(successMessage)
      }

      // 刷新相关查询
      const keys = Array.isArray(queryKey) ? queryKey : [queryKey]
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] })
      })

      onSuccess?.()
    },
    onError: () => {
      if (errorMessage) {
        ElMessage.error(errorMessage)
      }
    },
  })

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
```

### 4. 分页参数 Hook

```typescript
// composables/usePagination.ts
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface UsePaginationOptions {
  defaultPageSize?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { defaultPageSize = 20 } = options
  const route = useRoute()
  const router = useRouter()

  const currentPage = ref(Number(route.query.pageNum) || 1)
  const pageSize = ref(Number(route.query.pageSize) || defaultPageSize)

  // 同步 URL 参数
  watch([currentPage, pageSize], ([page, size]) => {
    router.push({
      query: {
        ...route.query,
        pageNum: String(page),
        pageSize: String(size),
      },
    })
  })

  const resetPage = () => {
    currentPage.value = 1
  }

  return {
    currentPage,
    pageSize,
    resetPage,
    pagination: computed(() => ({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    })),
  }
}
```

## 路由配置

```typescript
// router/modules/module.ts
import type { RouteRecordRaw } from 'vue-router'

const moduleRoutes: RouteRecordRaw = {
  path: '/module',
  component: () => import('@/layouts/DefaultLayout.vue'),
  children: [
    {
      path: '',
      name: 'ModuleList',
      component: () => import('@/views/Module/List/index.vue'),
      meta: {
        title: '模块列表',
        keepAlive: true,
      },
    },
    {
      path: ':id',
      name: 'ModuleDetail',
      component: () => import('@/views/Module/Detail/index.vue'),
      meta: {
        title: '模块详情',
      },
    },
    {
      path: ':id/edit',
      name: 'ModuleEdit',
      component: () => import('@/views/Module/Edit/index.vue'),
      meta: {
        title: '编辑模块',
      },
    },
  ],
}

export default moduleRoutes
```

## 数据刷新策略

使用 Vue Query 的自动刷新机制：

```typescript
// 列表查询配置
useQuery({
  queryKey: ['moduleList', params],
  queryFn: () => fetchList(params.value),
  staleTime: 5 * 60 * 1000, // 5 分钟内认为数据是新鲜的
  refetchOnWindowFocus: true, // 窗口重新获得焦点时刷新
})

// 详情查询配置
useQuery({
  queryKey: ['moduleDetail', id],
  queryFn: () => fetchDetail(id.value),
  staleTime: 10 * 60 * 1000, // 10 分钟
})

// 操作成功后手动刷新
queryClient.invalidateQueries({ queryKey: ['moduleList'] })
```

## 权限控制

```vue
<template>
  <div>
    <!-- 按钮级权限控制 -->
    <el-button v-if="canCreate" type="primary" @click="handleCreate"> 新建 </el-button>

    <!-- 表格操作列权限 -->
    <el-table :data="list">
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-if="canEdit" type="primary" link @click="handleEdit(row)"> 编辑 </el-button>
          <el-button v-if="canDelete" type="danger" link @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { usePermission } from '@/composables/usePermission'

const { hasPermission } = usePermission()

const canCreate = computed(() => hasPermission('module:create'))
const canEdit = computed(() => hasPermission('module:edit'))
const canDelete = computed(() => hasPermission('module:delete'))
</script>
```

## 批量操作

```vue
<template>
  <div>
    <!-- 批量操作栏 -->
    <div v-if="selectedRows.length > 0" class="batch-actions">
      <span>已选择 {{ selectedRows.length }} 项</span>
      <el-button type="danger" @click="handleBatchDelete"> 批量删除 </el-button>
    </div>

    <el-table :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <!-- 其他列... -->
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { batchRemove } from '../api'

const selectedRows = ref<ListItem[]>([])

const handleSelectionChange = (rows: ListItem[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条数据？`, '批量删除', {
      type: 'warning',
    })

    const ids = selectedRows.value.map((row) => row.id)
    await batchRemove(ids)
    ElMessage.success('批量删除成功')
    refetch()
  } catch {
    // 用户取消
  }
}
</script>
```

## 输出要求

生成 CRUD 模块时必须：

1. 包含完整文件结构（所有页面和 composable）
2. 列表页支持筛选、分页、刷新
3. 筛选条件存储在 URL 中
4. 使用 Vue Query 管理数据
5. 编辑和新建共用表单组件
6. 包含 loading 和错误处理
7. 操作成功后自动刷新列表
8. 使用 `<script setup>` 语法
9. 提供完整的 TypeScript 类型定义
10. 支持 Element Plus 组件按需引入

## 使用示例

### 用户输入

```
按 CRUD 模板生成一个商品管理模块。

列表页筛选条件：
- 商品名称搜索
- 分类筛选（单选下拉）
- 状态筛选（上架/下架）
- 价格区间筛选

列表展示字段：
- 商品 ID
- 商品名称
- 分类
- 价格
- 库存
- 状态
- 创建时间

编辑表单字段：
- 商品名称（必填）
- 分类（必选）
- 价格（必填，大于 0）
- 库存（必填，整数）
- 商品描述（选填）
- 商品图片（上传）
```

### AI 输出

自动生成 15+ 个文件，包括：

- 列表页完整代码
- 搜索表单（4 个筛选项）
- 详情页
- 编辑表单（带图片上传）
- 所有 API 函数
- 所有 TypeScript 类型
- Vue Query 配置
- 路由配置
- Zod 校验 schema
- 通用 composables

复制粘贴到项目，补充真实 API，基本可用。
