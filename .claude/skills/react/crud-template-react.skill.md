# Skill: CRUD业务模板生成器

## 使用场景

用于快速生成标准的列表-详情-编辑三页面结构，适用于：
- 用户管理
- 订单管理
- 商品管理
- 内容管理
- 任何需要CRUD操作的业务对象

## 技术栈

### 核心依赖
- React 18 + TypeScript
- React Router v6（路由）
- @tanstack/react-query（数据请求）
- Zustand（全局状态）
- Ant Design 5.x（UI组件）

### 状态管理分工
- 列表数据：React Query（支持缓存和自动刷新）
- 筛选条件：URL Query参数（支持刷新保持状态）
- 弹窗开关：组件内useState
- 用户信息：Zustand全局store

## 文件结构规范

每个CRUD模块必须按以下结构组织：

```
ModuleName/
├── index.tsx              # 路由入口
├── List/
│   ├── index.tsx          # 列表页主组件
│   ├── SearchForm.tsx     # 搜索筛选表单
│   ├── columns.tsx        # 表格列配置
│   ├── useListData.ts     # 列表数据hook
│   └── __tests__/         # 测试文件
├── Detail/
│   ├── index.tsx          # 详情页
│   ├── InfoCard.tsx       # 信息展示卡片
│   └── useDetailData.ts   # 详情数据hook
├── Edit/
│   ├── index.tsx          # 编辑页（新建和编辑共用）
│   ├── EditForm.tsx       # 表单组件
│   └── useEditSubmit.ts   # 提交逻辑hook
├── types.ts               # 模块类型定义
├── api.ts                 # API请求函数
└── constants.ts           # 常量配置
```

## API层规范

### 1. API函数命名

```typescript
// api.ts
import request from '@/utils/request';
import { ListParams, ListResponse, DetailData, CreateParams, UpdateParams } from './types';

/**
 * 获取列表
 */
export async function fetchList(params: ListParams): Promise<ListResponse> {
  return request.get('/api/module/list', { params });
}

/**
 * 获取详情
 */
export async function fetchDetail(id: string): Promise<DetailData> {
  return request.get(`/api/module/${id}`);
}

/**
 * 创建
 */
export async function create(data: CreateParams): Promise<void> {
  return request.post('/api/module', data);
}

/**
 * 更新
 */
export async function update(id: string, data: UpdateParams): Promise<void> {
  return request.put(`/api/module/${id}`, data);
}

/**
 * 删除
 */
export async function remove(id: string): Promise<void> {
  return request.delete(`/api/module/${id}`);
}
```

### 2. 类型定义

```typescript
// types.ts

// 列表查询参数
export interface ListParams {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  // 其他筛选字段...
}

// 列表响应
export interface ListResponse {
  list: ListItem[];
  total: number;
}

// 列表项
export interface ListItem {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createTime: string;
  updateTime: string;
  // 其他字段...
}

// 详情数据（通常比列表项字段更多）
export interface DetailData extends ListItem {
  description: string;
  // 更多详细字段...
}

// 创建参数
export interface CreateParams {
  name: string;
  // 其他必填字段...
}

// 更新参数（通常和创建参数一样，但某些字段可选）
export interface UpdateParams extends Partial<CreateParams> {}
```

## 列表页规范

### 1. 筛选条件管理

使用URL Query参数存储筛选条件，好处：

- 刷新页面筛选条件不丢失
- 可以分享筛选后的URL给同事
- 浏览器前进后退按钮可用

```typescript
// List/useListData.ts
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchList } from '../api';

export function useListData() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 从URL读取筛选条件
  const params = {
    pageNum: Number(searchParams.get('pageNum')) || 1,
    pageSize: Number(searchParams.get('pageSize')) || 20,
    keyword: searchParams.get('keyword') || '',
    status: searchParams.get('status') || '',
  };

  // 获取列表数据
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['moduleList', params],
    queryFn: () => fetchList(params),
  });

  // 更新筛选条件
  const updateParams = (newParams: Partial<typeof params>) => {
    const updated = { ...params, ...newParams };
    // 筛选条件变化时，重置到第一页
    if (newParams.keyword !== undefined || newParams.status !== undefined) {
      updated.pageNum = 1;
    }
    setSearchParams(updated as any);
  };

  return {
    list: data?.list || [],
    total: data?.total || 0,
    params,
    isLoading,
    updateParams,
    refetch,
  };
}
```

### 2. 搜索表单组件

```typescript
// List/SearchForm.tsx
import { Form, Input, Select, Button, Space } from 'antd';

interface SearchFormProps {
  initialValues: {
    keyword?: string;
    status?: string;
  };
  onSearch: (values: any) => void;
}

export default function SearchForm({ initialValues, onSearch }: SearchFormProps) {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  return (
    <Form
      form={form}
      layout="inline"
      initialValues={initialValues}
      onFinish={onSearch}
    >
      <Form.Item name="keyword">
        <Input placeholder="搜索关键词" style={{ width: 200 }} />
      </Form.Item>

      <Form.Item name="status">
        <Select
          placeholder="状态"
          style={{ width: 120 }}
          options={[
            { label: '全部', value: '' },
            { label: '启用', value: 'active' },
            { label: '禁用', value: 'inactive' },
          ]}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            搜索
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
```

### 3. 表格列配置

```typescript
// List/columns.tsx
import { Space, Button, Popconfirm, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ListItem } from '../types';

interface GetColumnsParams {
  onEdit: (record: ListItem) => void;
  onDelete: (id: string) => void;
  onDetail: (id: string) => void;
}

export function getColumns({ onEdit, onDelete, onDetail }: GetColumnsParams): ColumnsType<ListItem> {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => onDetail(record.id)}>
            详情
          </Button>
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => onDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
```

### 4. 列表页主组件

```typescript
// List/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SearchForm from './SearchForm';
import { getColumns } from './columns';
import { useListData } from './useListData';
import { remove } from '../api';
import EditForm from '../Edit/EditForm';

export default function List() {
  const navigate = useNavigate();
  const { list, total, params, isLoading, updateParams, refetch } = useListData();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  // 搜索
  const handleSearch = (values: any) => {
    updateParams(values);
  };

  // 分页
  const handlePageChange = (pageNum: number, pageSize: number) => {
    updateParams({ pageNum, pageSize });
  };

  // 新建
  const handleCreate = () => {
    setEditingRecord(null);
    setEditModalOpen(true);
  };

  // 编辑
  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setEditModalOpen(true);
  };

  // 删除
  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      message.success('删除成功');
      refetch();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 查看详情
  const handleDetail = (id: string) => {
    navigate(`/module/${id}`);
  };

  // 编辑成功
  const handleEditSuccess = () => {
    setEditModalOpen(false);
    refetch();
  };

  const columns = getColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onDetail: handleDetail,
  });

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <SearchForm
          initialValues={{
            keyword: params.keyword,
            status: params.status,
          }}
          onSearch={handleSearch}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={isLoading}
        pagination={{
          current: params.pageNum,
          pageSize: params.pageSize,
          total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handlePageChange,
        }}
      />

      <Modal
        title={editingRecord ? '编辑' : '新建'}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={600}
      >
        <EditForm
          mode={editingRecord ? 'edit' : 'create'}
          initialData={editingRecord}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
```

## 详情页规范

```typescript
// Detail/index.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchDetail } from '../api';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['moduleDetail', id],
    queryFn: () => fetchDetail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <Spin />;
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card title="基本信息">
        <Descriptions column={2}>
          <Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
          <Descriptions.Item label="名称">{data?.name}</Descriptions.Item>
          <Descriptions.Item label="状态">{data?.status}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{data?.createTime}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {data?.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
```

## 编辑页规范

编辑页和新建页共用一个组件，通过mode区分：

```typescript
// Edit/EditForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Button, Space, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { create, update } from '../api';
import { editSchema } from '../schema';

interface EditFormProps {
  mode: 'create' | 'edit';
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditForm({ mode, initialData, onSuccess, onCancel }: EditFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: initialData,
  });

  // 创建mutation
  const createMutation = useMutation({
    mutationFn: create,
    onSuccess: () => {
      message.success('创建成功');
      queryClient.invalidateQueries({ queryKey: ['moduleList'] });
      onSuccess?.();
    },
  });

  // 更新mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => update(id, data),
    onSuccess: () => {
      message.success('保存成功');
      queryClient.invalidateQueries({ queryKey: ['moduleList'] });
      queryClient.invalidateQueries({ queryKey: ['moduleDetail'] });
      onSuccess?.();
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync({ id: initialData.id, data });
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        label="名称"
        validateStatus={errors.name ? 'error' : ''}
        help={errors.name?.message as string}
      >
        <Input {...register('name')} placeholder="请输入名称" />
      </Form.Item>

      {/* 其他字段... */}

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {mode === 'create' ? '创建' : '保存'}
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
```

## 路由配置

```typescript
// index.tsx
import { Routes, Route } from 'react-router-dom';
import List from './List';
import Detail from './Detail';

export default function ModuleRoutes() {
  return (
    <Routes>
      <Route path="/" element={<List />} />
      <Route path="/:id" element={<Detail />} />
    </Routes>
  );
}
```

## 数据刷新策略

使用React Query的自动刷新机制：

```typescript
// 列表查询配置
useQuery({
  queryKey: ['moduleList', params],
  queryFn: () => fetchList(params),
  staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
  refetchOnWindowFocus: true, // 窗口重新获得焦点时刷新
});

// 详情查询配置
useQuery({
  queryKey: ['moduleDetail', id],
  queryFn: () => fetchDetail(id),
  staleTime: 10 * 60 * 1000, // 10分钟
});

// 操作成功后手动刷新
queryClient.invalidateQueries({ queryKey: ['moduleList'] });
```

## 权限控制

```typescript
// 使用自定义hook检查权限
import { usePermission } from '@/hooks/usePermission';

export default function List() {
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('module:create');
  const canEdit = hasPermission('module:edit');
  const canDelete = hasPermission('module:delete');

  return (
    <div>
      {canCreate && (
        <Button onClick={handleCreate}>新建</Button>
      )}

      <Table
        columns={getColumns({
          onEdit: canEdit ? handleEdit : undefined,
          onDelete: canDelete ? handleDelete : undefined,
        })}
      />
    </div>
  );
}
```

## 输出要求

生成CRUD模块时必须：

1. 包含完整文件结构（所有页面和hook）
2. 列表页支持筛选、分页、刷新
3. 筛选条件存储在URL中
4. 使用React Query管理数据
5. 编辑和新建共用表单组件
6. 包含loading和错误处理
7. 操作成功后自动刷新列表

## 使用示例

### 用户输入

```
按CRUD模板生成一个商品管理模块。

列表页筛选条件：
- 商品名称搜索
- 分类筛选（单选下拉）
- 状态筛选（上架/下架）
- 价格区间筛选

列表展示字段：
- 商品ID
- 商品名称
- 分类
- 价格
- 库存
- 状态
- 创建时间

编辑表单字段：
- 商品名称（必填）
- 分类（必选）
- 价格（必填，大于0）
- 库存（必填，整数）
- 商品描述（选填）
- 商品图片（上传）
```

### AI输出

自动生成15+个文件，包括：

- 列表页完整代码
- 搜索表单（4个筛选项）
- 详情页
- 编辑表单（带图片上传）
- 所有API函数
- 所有TypeScript类型
- React Query配置
- 路由配置

复制粘贴到项目，补充真实API，基本可用。