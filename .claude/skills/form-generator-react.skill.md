# Skill: 表单组件生成器

## 使用场景

当需要创建任何数据录入表单时使用此Skill，包括但不限于：
- 用户信息表单
- 订单创建表单
- 设置配置表单
- 筛选搜索表单

## 技术栈约定

### 核心依赖
- React 18.2
- TypeScript 5.0
- Ant Design 5.x
- react-hook-form 7.x（表单状态管理）
- zod（表单校验）

### 状态管理
- 表单内部状态：react-hook-form
- 全局loading状态：Zustand的useLoadingStore
- 提交成功后刷新：React Query的invalidateQueries

## 代码规范

### 1. 文件结构

每个表单组件必须按以下结构组织：

```
FormName/
├── index.tsx           # 组件主文件
├── schema.ts           # zod校验规则
├── types.ts            # TypeScript类型定义
└── hooks/
    └── useFormSubmit.ts # 提交逻辑hook
```

### 2. 命名规范

- 组件名：必须以Form结尾，如UserInfoForm、OrderCreateForm
- 类型名：组件Props用FormNameProps，表单数据用FormNameValues
- Hook名：用use开头，如useUserFormSubmit
- 常量：全大写下划线分隔，如DEFAULT_FORM_VALUES

### 3. 类型定义模板

```typescript
// types.ts
import { z } from 'zod';
import { formSchema } from './schema';

// 从schema推导类型
export type FormValues = z.infer<typeof formSchema>;

// 组件Props
export interface FormNameProps {
  // 表单模式：create新建 | edit编辑 | view查看
  mode: 'create' | 'edit' | 'view';
  // 编辑模式必传初始数据
  initialData?: FormValues;
  // 提交成功回调
  onSuccess?: (data: FormValues) => void;
  // 取消回调
  onCancel?: () => void;
}
```

### 4. Schema定义规范

使用Zod定义校验规则，必须包含中文错误提示：

```typescript
// schema.ts
import { z } from 'zod';

export const formSchema = z.object({
  // 必填字段
  username: z.string()
    .min(1, '请输入用户名')
    .max(20, '用户名不能超过20个字符'),

  // 邮箱校验
  email: z.string()
    .email('请输入正确的邮箱格式'),

  // 手机号校验
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),

  // 数字范围
  age: z.number()
    .min(18, '年龄不能小于18岁')
    .max(100, '请输入正确的年龄'),

  // 可选字段
  remark: z.string().optional(),
});
```

### 5. 组件结构模板

```typescript
// index.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Button, Space } from 'antd';
import { formSchema } from './schema';
import { FormNameProps, FormValues } from './types';
import { useFormSubmit } from './hooks/useFormSubmit';

/**
 * 【组件功能描述】
 * @param mode - 表单模式
 * @param initialData - 初始数据（编辑模式）
 * @param onSuccess - 提交成功回调
 * @param onCancel - 取消回调
 */
export default function FormName({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: FormNameProps) {
  // 表单实例
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  // 提交逻辑
  const { submitForm } = useFormSubmit({ mode, onSuccess });

  // 是否只读模式
  const isReadOnly = mode === 'view';

  return (
    <Form layout="vertical">
      {/* 表单字段按业务逻辑分组 */}

      {/* 操作按钮 */}
      {!isReadOnly && (
        <Space>
          <Button
            type="primary"
            loading={isSubmitting}
            onClick={handleSubmit(submitForm)}
          >
            {mode === 'create' ? '创建' : '保存'}
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      )}
    </Form>
  );
}
```

### 6. 提交逻辑Hook模板

```typescript
// hooks/useFormSubmit.ts
import { message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { FormValues } from '../types';
import { createAPI, updateAPI } from '@/api/xxx';

interface UseFormSubmitProps {
  mode: 'create' | 'edit' | 'view';
  onSuccess?: (data: FormValues) => void;
}

export function useFormSubmit({ mode, onSuccess }: UseFormSubmitProps) {
  // 创建mutation
  const { mutateAsync: createMutate } = useMutation({
    mutationFn: createAPI,
  });

  const { mutateAsync: updateMutate } = useMutation({
    mutationFn: updateAPI,
  });

  // 提交函数
  const submitForm = async (data: FormValues) => {
    try {
      if (mode === 'create') {
        await createMutate(data);
        message.success('创建成功');
      } else {
        await updateMutate(data);
        message.success('保存成功');
      }
      onSuccess?.(data);
    } catch (error) {
      message.error('操作失败，请重试');
      console.error('Form submit error:', error);
    }
  };

  return { submitForm };
}
```

## 业务逻辑处理规范

### 1. 字段联动

当一个字段变化影响其他字段时：

```typescript
// 使用watch监听字段变化
const categoryId = watch('categoryId');

useEffect(() => {
  if (categoryId) {
    // 联动更新子分类选项
    setValue('subCategoryId', undefined);
  }
}, [categoryId]);
```

### 2. 动态表单（数组字段）

```typescript
import { useFieldArray } from 'react-hook-form';

const { fields, append, remove } = useFieldArray({
  control,
  name: 'items', // 数组字段名
});

// 渲染
{fields.map((field, index) => (
  <div key={field.id}>
    <Input {...register(`items.${index}.name`)} />
    <Button onClick={() => remove(index)}>删除</Button>
  </div>
))}

<Button onClick={() => append({ name: '', qty: 0 })}>
  添加项目
</Button>
```

### 3. 文件上传

```typescript
// 使用Ant Design Upload组件
<Upload
  beforeUpload={(file) => {
    // 校验文件
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('文件不能超过2MB');
      return false;
    }
    return true;
  }}
  onChange={(info) => {
    if (info.file.status === 'done') {
      setValue('fileUrl', info.file.response.url);
    }
  }}
>
  <Button>点击上传</Button>
</Upload>
```

### 4. 日期处理

```typescript
import dayjs from 'dayjs';

// 提交前格式化
const onSubmit = (data: FormValues) => {
  const formatted = {
    ...data,
    birthDate: dayjs(data.birthDate).format('YYYY-MM-DD'),
  };
  submitForm(formatted);
};
```

## 错误处理规范

### 1. 字段校验错误

自动显示在字段下方，使用Ant Design的Form.Item：

```typescript
<Form.Item
  label="用户名"
  validateStatus={errors.username ? 'error' : ''}
  help={errors.username?.message}
>
  <Input {...register('username')} />
</Form.Item>
```

### 2. 提交失败处理

```typescript
try {
  await submitForm(data);
} catch (error) {
  // 后端返回字段级错误
  if (error.response?.data?.fieldErrors) {
    Object.entries(error.response.data.fieldErrors).forEach(
      ([field, msg]) => {
        setError(field as keyof FormValues, {
          message: msg as string,
        });
      }
    );
  } else {
    // 通用错误提示
    message.error('操作失败，请稍后重试');
  }
}
```

## 常用表单字段配置

### 文本输入框

```typescript
<Form.Item label="姓名">
  <Input
    placeholder="请输入姓名"
    maxLength={50}
    {...register('name')}
  />
</Form.Item>
```

### 数字输入框

```typescript
<Form.Item label="年龄">
  <InputNumber
    min={0}
    max={150}
    {...register('age', { valueAsNumber: true })}
  />
</Form.Item>
```

### 下拉选择

```typescript
<Form.Item label="部门">
  <Select
    placeholder="请选择部门"
    options={DEPARTMENT_OPTIONS}
    {...register('departmentId')}
  />
</Form.Item>
```

### 单选按钮

```typescript
<Form.Item label="性别">
  <Radio.Group {...register('gender')}>
    <Radio value="male">男</Radio>
    <Radio value="female">女</Radio>
  </Radio.Group>
</Form.Item>
```

### 多选框

```typescript
<Form.Item label="兴趣爱好">
  <Checkbox.Group
    options={HOBBY_OPTIONS}
    {...register('hobbies')}
  />
</Form.Item>
```

### 日期选择

```typescript
<Form.Item label="出生日期">
  <DatePicker
    format="YYYY-MM-DD"
    {...register('birthDate')}
  />
</Form.Item>
```

### 多行文本

```typescript
<Form.Item label="备注">
  <Input.TextArea
    rows={4}
    maxLength={500}
    showCount
    {...register('remark')}
  />
</Form.Item>
```

## 输出要求

当用户要求生成表单时，必须：

1. 生成完整的文件结构（所有必需文件）
2. 类型定义完整，无any类型
3. 包含所有字段的校验规则
4. 提交逻辑完整（loading、错误处理）
5. 至少3个测试用例覆盖：
    - 表单校验测试
    - 成功提交测试
    - 失败提交测试

## 测试用例模板

```typescript
// __tests__/index.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormName from '../index';

describe('FormName', () => {
  it('创建模式：必填字段为空时显示错误', async () => {
    render(<FormName mode="create" />);

    const submitBtn = screen.getByText('创建');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('请输入用户名')).toBeInTheDocument();
    });
  });

  it('成功提交后调用onSuccess回调', async () => {
    const onSuccess = jest.fn();
    render(<FormName mode="create" onSuccess={onSuccess} />);

    // 填写表单...

    const submitBtn = screen.getByText('创建');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('查看模式：表单字段只读', () => {
    render(<FormName mode="view" initialData={mockData} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });
});
```

## 使用示例

### 用户输入

```
请按照form-generator规范，生成一个客户信息录入表单。

字段包括：
- 客户名称（必填，最多50字）
- 联系人（必填）
- 手机号（必填，11位）
- 邮箱（选填）
- 公司地址（选填）
- 客户类型（单选：个人/企业）
- 备注（选填，最多200字）
```

### AI输出

AI会自动生成：

1. 完整的文件结构（6个文件）
2. 符合规范的类型定义
3. Zod校验规则（中文错误提示）
4. 标准的组件代码
5. 提交逻辑hook
6. 3个测试用例

你只需要：

+ 复制代码到项目
+ 补充真实的API接口
+ 跑一下测试
+ 基本上不用改就能用