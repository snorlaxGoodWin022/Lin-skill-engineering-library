import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, InputNumber, Select, DatePicker, Button, Space, Card } from 'antd';
import { ProductFormSchema, ProductFormData } from './schema';
import type { ProductFormProps } from './types';
import styles from './ProductForm.module.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function ProductForm({ onSubmit, initialData, loading = false }: ProductFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: initialData || {
      name: '',
      price: 0,
      stock: 0,
      category: '',
      status: 'draft',
      description: '',
    },
  });

  const handleFormSubmit = (data: ProductFormData) => {
    onSubmit(data);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <Card title="产品信息表单" className={styles.formCard}>
      <Form
        layout="vertical"
        onFinish={handleSubmit(handleFormSubmit)}
        className={styles.productForm}
      >
        {/* 产品名称 */}
        <Form.Item
          label="产品名称"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
          required
        >
          <Input
            placeholder="请输入产品名称"
            {...control.register('name')}
            maxLength={50}
          />
        </Form.Item>

        {/* 价格 */}
        <Form.Item
          label="价格"
          validateStatus={errors.price ? 'error' : ''}
          help={errors.price?.message}
          required
        >
          <InputNumber
            placeholder="请输入价格"
            {...control.register('price', { valueAsNumber: true })}
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>

        {/* 库存 */}
        <Form.Item
          label="库存数量"
          validateStatus={errors.stock ? 'error' : ''}
          help={errors.stock?.message}
          required
        >
          <InputNumber
            placeholder="请输入库存数量"
            {...control.register('stock', { valueAsNumber: true })}
            min={0}
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* 分类 */}
        <Form.Item
          label="产品分类"
          validateStatus={errors.category ? 'error' : ''}
          help={errors.category?.message}
          required
        >
          <Select
            placeholder="请选择产品分类"
            {...control.register('category')}
          >
            <Option value="electronics">电子产品</Option>
            <Option value="clothing">服装</Option>
            <Option value="food">食品</Option>
            <Option value="books">图书</Option>
            <Option value="other">其他</Option>
          </Select>
        </Form.Item>

        {/* 状态 */}
        <Form.Item
          label="产品状态"
          validateStatus={errors.status ? 'error' : ''}
          help={errors.status?.message}
        >
          <Select
            placeholder="请选择产品状态"
            {...control.register('status')}
          >
            <Option value="draft">草稿</Option>
            <Option value="published">已发布</Option>
            <Option value="archived">已归档</Option>
          </Select>
        </Form.Item>

        {/* 描述 */}
        <Form.Item
          label="产品描述"
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description?.message}
        >
          <Input.TextArea
            placeholder="请输入产品描述"
            {...control.register('description')}
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* 上架时间范围 */}
        <Form.Item
          label="上架时间范围"
          validateStatus={errors.shelfLife ? 'error' : ''}
          help={errors.shelfLife?.message}
        >
          <RangePicker
            {...control.register('shelfLife')}
            style={{ width: '100%' }}
            placeholder={['开始时间', '结束时间']}
          />
        </Form.Item>

        {/* 操作按钮 */}
        <Form.Item>
          <Space className={styles.formActions}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className={styles.submitButton}
            >
              提交
            </Button>
            <Button onClick={handleReset} className={styles.resetButton}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}