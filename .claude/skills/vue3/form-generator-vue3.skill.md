# Skill: 表单组件生成器

## 使用场景

当需要创建任何数据录入表单时使用此Skill，包括但不限于：
- 用户信息表单
- 订单创建表单
- 设置配置表单
- 筛选搜索表单

## 技术栈约定

### 核心依赖
- Vue 3.3+
- TypeScript 5.0+
- Element Plus 2.4+
- VeeValidate 4.x（表单状态管理）
- Zod 3.x（表单校验）

### 状态管理
- 表单内部状态：VeeValidate（统一管理，不额外使用 ref）
- 全局loading状态：Pinia的useLoadingStore
- 提交成功后刷新：TanStack Query的invalidateQueries

> **重要：** 表单数据统一由 VeeValidate 的 `useForm` 管理。
> 不要额外创建 `ref` 来存储表单数据，避免双重状态同步问题。

## 代码规范

### 1. 文件结构

每个表单组件必须按以下结构组织：

```
FormName/
├── index.vue           # 组件主文件
├── schema.ts           # zod校验规则
├── types.ts            # TypeScript类型定义
└── composables/
    └── useFormSubmit.ts # 提交逻辑composable
```

### 2. 命名规范

- 组件名：必须以Form结尾，如UserInfoForm、OrderCreateForm
- 类型名：组件Props用FormNameProps，表单数据用FormNameValues
- Composable名：用use开头，如useUserFormSubmit
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

```vue
<!-- index.vue -->
<template>
  <el-form label-position="top">
    <!-- 文本字段示例 -->
    <el-form-item
      label="用户名"
      :error="errors.username"
    >
      <el-input
        v-model="usernameField.value.value"
        placeholder="请输入用户名"
        :disabled="isReadOnly"
      />
    </el-form-item>

    <!-- 其他表单字段按业务逻辑分组 -->

    <!-- 操作按钮 -->
    <template v-if="!isReadOnly">
      <el-button
        type="primary"
        :loading="isSubmitting"
        @click="handleSubmit"
      >
        {{ mode === 'create' ? '创建' : '保存' }}
      </el-button>
      <el-button @click="onCancel">取消</el-button>
    </template>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { formSchema } from './schema';
import { FormNameProps, FormValues } from './types';
import { useFormSubmit } from './composables/useFormSubmit';

// Props
const props = defineProps<FormNameProps>();

// 表单状态 —— 统一由 VeeValidate 管理
const {
  handleSubmit: veeHandleSubmit,
  errors,
  isSubmitting,
  resetForm,
  setFieldValue,
} = useForm<FormValues>({
  validationSchema: toTypedSchema(formSchema),
  initialValues: props.initialData,
});

// 使用 useField 绑定单个字段
const usernameField = useField<string>('username');

// 提交逻辑
const { submitForm } = useFormSubmit({ mode: props.mode, onSuccess: props.onSuccess });

// 是否只读模式
const isReadOnly = computed(() => props.mode === 'view');

// 提交处理
const handleSubmit = veeHandleSubmit(async (data) => {
  await submitForm(data);
});
</script>
```

### 6. 提交逻辑Composable模板

```typescript
// composables/useFormSubmit.ts
import { ElMessage } from 'element-plus';
import { useMutation } from '@tanstack/vue-query';
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
        ElMessage.success('创建成功');
      } else {
        await updateMutate(data);
        ElMessage.success('保存成功');
      }
      onSuccess?.(data);
    } catch (error) {
      ElMessage.error('操作失败，请重试');
      console.error('Form submit error:', error);
    }
  };

  return { submitForm };
}
```

## 业务逻辑处理规范

### 1. 字段联动

当一个字段变化影响其他字段时：

```vue
<template>
  <el-form label-position="top">
    <el-form-item label="分类">
      <el-select v-model="categoryIdField.value.value" @change="handleCategoryChange">
        <!-- 选项 -->
      </el-select>
    </el-form-item>
    <el-form-item label="子分类">
      <el-select v-model="subCategoryIdField.value.value">
        <!-- 选项 -->
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useForm, useField } from 'vee-validate';

const { setFieldValue } = useForm({
  initialValues: {
    categoryId: '',
    subCategoryId: '',
  },
});

const categoryIdField = useField<string>('categoryId');
const subCategoryIdField = useField<string>('subCategoryId');

// 监听分类变化，联动更新子分类
watch(categoryIdField.value, (newCategoryId) => {
  if (newCategoryId) {
    setFieldValue('subCategoryId', '');
    // 可以在这里加载子分类数据
  }
});

const handleCategoryChange = () => {
  // change事件已通过watch处理
};
</script>
```

### 2. 动态表单（数组字段）

```vue
<template>
  <el-form label-position="top">
    <div v-for="(_, index) in itemFields" :key="index" class="item-row">
      <el-form-item :label="`项目 ${index + 1}`">
        <el-input v-model="itemFields[index].name.value" placeholder="请输入项目名称" />
      </el-form-item>
      <el-form-item label="数量">
        <el-input-number v-model="itemFields[index].qty.value" :min="1" />
      </el-form-item>
      <el-button type="danger" @click="removeItem(index)">删除</el-button>
    </div>
    <el-button type="primary" @click="addItem">添加项目</el-button>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

interface ItemForm {
  name: string;
  qty: number;
}

// 使用 reactive 数组管理动态字段的 useField
const itemFields = reactive<Array<{ name: { value: string }; qty: { value: number } }>>([]);

// 添加项目
const addItem = () => {
  itemFields.push({ name: { value: '' }, qty: { value: 1 } });
};

// 删除项目
const removeItem = (index: number) => {
  itemFields.splice(index, 1);
};
</script>
```

### 3. 文件上传

```vue
<template>
  <el-form label-position="top">
    <el-form-item label="文件上传">
      <el-upload
        class="upload-demo"
        :action="uploadUrl"
        :on-success="handleUploadSuccess"
        :before-upload="beforeUpload"
        :limit="1"
      >
        <el-button type="primary">点击上传</el-button>
        <template #tip>
          <div class="el-upload__tip">
            只能上传jpg/png文件，且不超过2MB
          </div>
        </template>
      </el-upload>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { useForm } from 'vee-validate';

const { setFieldValue } = useForm({
  initialValues: {
    fileUrl: '',
  },
});

const uploadUrl = '/api/upload';

// 上传前校验
const beforeUpload = (file: File) => {
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('文件不能超过2MB');
    return false;
  }
  return true;
};

// 上传成功处理 —— 使用 setFieldValue 更新表单状态
const handleUploadSuccess = (response: { url: string }) => {
  setFieldValue('fileUrl', response.url);
  ElMessage.success('上传成功');
};
</script>
```

### 4. 日期处理

```vue
<template>
  <el-form label-position="top">
    <el-form-item label="出生日期">
      <el-date-picker
        v-model="birthDateField.value.value"
        type="date"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        placeholder="请选择出生日期"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { useField } from 'vee-validate';

const birthDateField = useField<string>('birthDate');

// 提交前格式化（如果需要）
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD');
};
</script>
```

## 错误处理规范

### 1. 字段校验错误

自动显示在字段下方，使用Element Plus的el-form-item：

```vue
<template>
  <el-form label-position="top">
    <el-form-item
      label="用户名"
      :error="errors.username"
    >
      <el-input
        v-model="usernameField.value.value"
        placeholder="请输入用户名"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { formSchema } from './schema';

const {
  errors,
} = useForm({
  validationSchema: toTypedSchema(formSchema),
});

const usernameField = useField<string>('username');
</script>
```

### 2. 提交失败处理

```typescript
// composables/useFormSubmit.ts
const submitForm = async (data: FormValues) => {
  try {
    // 提交逻辑
  } catch (error: any) {
    // 后端返回字段级错误
    if (error.response?.data?.fieldErrors) {
      Object.entries(error.response.data.fieldErrors).forEach(
        ([field, msg]) => {
          // 设置字段错误
          setFieldError(field as keyof FormValues, msg as string);
        }
      );
    } else {
      // 通用错误提示
      ElMessage.error('操作失败，请稍后重试');
    }
  }
};
```

## 常用表单字段配置

> 所有字段通过 `useField` 绑定，使用 `field.value.value` 进行 v-model 绑定。

### 文本输入框

```vue
<el-form-item label="姓名" :error="errors.name">
  <el-input
    v-model="nameField.value.value"
    placeholder="请输入姓名"
    :maxlength="50"
    show-word-limit
  />
</el-form-item>
```

### 数字输入框

```vue
<el-form-item label="年龄" :error="errors.age">
  <el-input-number
    v-model="ageField.value.value"
    :min="0"
    :max="150"
  />
</el-form-item>
```

### 下拉选择

```vue
<el-form-item label="部门" :error="errors.departmentId">
  <el-select
    v-model="departmentIdField.value.value"
    placeholder="请选择部门"
  >
    <el-option
      v-for="dept in departmentOptions"
      :key="dept.id"
      :label="dept.name"
      :value="dept.id"
    />
  </el-select>
</el-form-item>
```

### 单选按钮

```vue
<el-form-item label="性别">
  <el-radio-group v-model="genderField.value.value">
    <el-radio label="male">男</el-radio>
    <el-radio label="female">女</el-radio>
  </el-radio-group>
</el-form-item>
```

### 多选框

```vue
<el-form-item label="兴趣爱好">
  <el-checkbox-group v-model="hobbiesField.value.value">
    <el-checkbox v-for="hobby in hobbyOptions" :key="hobby.value" :label="hobby.value">
      {{ hobby.label }}
    </el-checkbox>
  </el-checkbox-group>
</el-form-item>
```

### 日期选择

```vue
<el-form-item label="出生日期">
  <el-date-picker
    v-model="birthDateField.value.value"
    type="date"
    format="YYYY-MM-DD"
    value-format="YYYY-MM-DD"
    placeholder="请选择出生日期"
  />
</el-form-item>
```

### 多行文本

```vue
<el-form-item label="备注">
  <el-input
    v-model="remarkField.value.value"
    type="textarea"
    :rows="4"
    :maxlength="500"
    show-word-limit
  />
</el-form-item>
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
// __tests__/index.test.ts
import { mount } from '@vue/test-utils';
import FormName from '../index.vue';
import { createPinia } from 'pinia';

const pinia = createPinia();

describe('FormName', () => {
  it('创建模式：必填字段为空时显示错误', async () => {
    const wrapper = mount(FormName, {
      props: {
        mode: 'create',
      },
      global: {
        plugins: [pinia],
      },
    });

    const submitBtn = wrapper.find('button[type="primary"]');
    await submitBtn.trigger('click');

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('请输入用户名');
  });

  it('成功提交后调用onSuccess回调', async () => {
    const onSuccess = jest.fn();
    const wrapper = mount(FormName, {
      props: {
        mode: 'create',
        onSuccess,
      },
      global: {
        plugins: [pinia],
      },
    });

    // 填写表单...
    await wrapper.vm.$nextTick();

    const submitBtn = wrapper.find('button[type="primary"]');
    await submitBtn.trigger('click');

    await wrapper.vm.$nextTick();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('查看模式：表单字段只读', () => {
    const wrapper = mount(FormName, {
      props: {
        mode: 'view',
        initialData: {
          username: 'test',
          // 其他字段...
        },
      },
      global: {
        plugins: [pinia],
      },
    });

    const inputs = wrapper.findAll('input');
    inputs.forEach(input => {
      expect(input.element.disabled).toBe(true);
    });
  });
});
```

## 使用示例

### 用户输入

```
请按照form-generator-vue3规范，生成一个客户信息录入表单。

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

1. 完整的文件结构（4个文件）
2. 符合规范的类型定义
3. Zod校验规则（中文错误提示）
4. 标准的Vue3组件代码
5. 提交逻辑composable
6. 3个测试用例

你只需要：

+ 复制代码到项目
+ 补充真实的API接口
+ 跑一下测试
+ 基本上不用改就能用
