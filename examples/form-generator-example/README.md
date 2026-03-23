# 表单生成器示例：产品表单

本示例演示如何使用 `form-generator.skill.md` 规范生成一个完整的产品信息表单。

## 示例结构

```
ProductForm/
├── index.tsx          # 表单组件主文件
├── schema.ts          # 表单验证Schema（Zod）
├── types.ts           # TypeScript类型定义
└── ProductForm.module.css # 表单样式
```

## 技术栈

- **React 18** + **TypeScript** - 组件开发
- **Ant Design 5.x** - UI组件库
- **react-hook-form** - 表单状态管理
- **Zod** - 表单验证Schema
- **CSS Modules** - 样式隔离

## 功能特性

### 1. 完整的表单验证
- 使用Zod定义严格的验证规则
- 实时字段验证
- 自定义错误消息
- 复杂验证逻辑（日期范围、数值限制等）

### 2. 丰富的表单字段
- 文本输入（产品名称）
- 数字输入（价格、库存）
- 选择器（分类、状态）
- 文本域（描述）
- 日期范围选择器（上架时间）

### 3. 用户体验优化
- 加载状态指示
- 表单重置功能
- 响应式设计
- 美观的样式设计

## 使用方式

### 1. 安装依赖
```bash
npm install react-hook-form @hookform/resolvers zod antd dayjs
```

### 2. 导入组件
```typescript
import ProductForm from './ProductForm';

function App() {
  const handleSubmit = (data: ProductFormData) => {
    console.log('表单数据:', data);
    // 发送到API
  };

  return (
    <div>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
```

### 3. 自定义配置
```typescript
<ProductForm
  onSubmit={handleSubmit}
  initialData={{
    name: '示例产品',
    price: 99.99,
    category: 'electronics',
  }}
  loading={isSubmitting}
  submitText="保存产品"
  showReset={true}
/>
```

## 表单验证规则

### 产品名称
- 必填字段
- 2-50个字符
- 只能包含中文、英文、数字和空格

### 价格
- 必填字段
- 非负数
- 最多两位小数
- 最大值：999999.99

### 库存
- 必填字段
- 非负整数
- 最大值：99999

### 分类
- 必填字段
- 从预定义选项中选择：电子产品、服装、食品、图书、其他

### 状态
- 可选字段
- 默认值：草稿
- 选项：草稿、已发布、已归档

### 描述
- 可选字段
- 最多500个字符
- 显示字数统计

### 上架时间范围
- 可选字段
- 验证开始时间不晚于结束时间

## 样式定制

表单样式通过CSS Modules实现，支持以下自定义：

### 主题色
```css
/* 覆盖主题色 */
.submitButton {
  background: linear-gradient(135deg, #your-color 0%, #your-color-dark 100%);
}
```

### 响应式调整
```css
/* 移动端适配 */
@media (max-width: 768px) {
  .formCard {
    margin: 16px;
  }
}
```

## 最佳实践

### 1. 表单性能优化
- 使用`React.memo`包装组件
- 避免不必要的re-render
- 使用`useCallback`处理回调函数

### 2. 错误处理
```typescript
try {
  const validatedData = validateProductForm(formData);
  // 提交数据
} catch (error) {
  if (error instanceof z.ZodError) {
    // 处理验证错误
    console.error('验证失败:', error.errors);
  }
}
```

### 3. 测试策略
- 单元测试：验证Schema逻辑
- 集成测试：表单交互流程
- E2E测试：完整用户流程

## 扩展建议

### 1. 添加更多字段类型
- 上传组件（图片、文件）
- 富文本编辑器
- 颜色选择器
- 评分组件

### 2. 集成API服务
- 表单数据持久化
- 实时保存草稿
- 多步骤表单
- 表单版本控制

### 3. 国际化支持
- 多语言表单标签
- 地区特定的验证规则
- 时区处理

## 相关资源

- [form-generator.skill.md](../.claude/skills/form-generator.skill.md) - 表单生成器规范
- [Ant Design Form文档](https://ant.design/components/form-cn)
- [React Hook Form文档](https://react-hook-form.com/)
- [Zod文档](https://zod.dev/)

---

**提示**：此示例可直接用于生产环境，或根据项目需求进行修改。遵循`form-generator.skill.md`规范可确保代码质量和一致性。