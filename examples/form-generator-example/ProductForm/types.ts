import type { ProductFormData } from './schema';
import type { Dayjs } from 'dayjs';

// 表单组件Props
export interface ProductFormProps {
  /** 表单提交回调函数 */
  onSubmit: (data: ProductFormData) => void;

  /** 初始数据（用于编辑模式） */
  initialData?: Partial<ProductFormData>;

  /** 加载状态 */
  loading?: boolean;

  /** 自定义样式类 */
  className?: string;

  /** 提交按钮文本 */
  submitText?: string;

  /** 重置按钮文本 */
  resetText?: string;

  /** 是否显示重置按钮 */
  showReset?: boolean;
}

// 表单字段类型（用于动态生成）
export interface FormFieldConfig {
  /** 字段名称 */
  name: keyof ProductFormData;

  /** 字段标签 */
  label: string;

  /** 字段类型 */
  type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'daterange';

  /** 是否必填 */
  required: boolean;

  /** 占位符文本 */
  placeholder?: string;

  /** 选项列表（select类型使用） */
  options?: Array<{ label: string; value: string }>;

  /** 最小值（number类型使用） */
  min?: number;

  /** 最大值（number类型使用） */
  max?: number;

  /** 步长（number类型使用） */
  step?: number;

  /** 最大长度（text/textarea类型使用） */
  maxLength?: number;

  /** 验证规则 */
  validation?: {
    pattern?: RegExp;
    message?: string;
  };
}

// 表单状态
export interface ProductFormState {
  /** 表单数据 */
  data: ProductFormData;

  /** 错误信息 */
  errors: Partial<Record<keyof ProductFormData, string>>;

  /** 触摸状态 */
  touched: Partial<Record<keyof ProductFormData, boolean>>;

  /** 提交状态 */
  isSubmitting: boolean;

  /** 是否有效 */
  isValid: boolean;
}

// API响应类型
export interface ProductApiResponse {
  /** 是否成功 */
  success: boolean;

  /** 数据 */
  data?: ProductFormData;

  /** 错误信息 */
  error?: string;

  /** 错误详情 */
  errors?: Record<string, string[]>;
}

// 产品实体类型
export interface ProductEntity {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: 'draft' | 'published' | 'archived';
  description?: string;
  shelfLife?: [Date, Date];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// 表单操作类型
export type ProductFormAction =
  | { type: 'SET_FIELD'; field: keyof ProductFormData; value: any }
  | { type: 'SET_ERROR'; field: keyof ProductFormData; error: string }
  | { type: 'SET_TOUCHED'; field: keyof ProductFormData; touched: boolean }
  | { type: 'SET_SUBMITTING'; submitting: boolean }
  | { type: 'RESET_FORM'; initialData?: Partial<ProductFormData> }
  | { type: 'VALIDATE_FORM' };