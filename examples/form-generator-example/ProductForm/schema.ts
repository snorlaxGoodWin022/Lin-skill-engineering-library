import { z } from 'zod';
import dayjs from 'dayjs';

// 产品表单数据验证Schema
export const ProductFormSchema = z.object({
  // 产品名称：必填，2-50个字符
  name: z.string()
    .min(2, '产品名称至少2个字符')
    .max(50, '产品名称最多50个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/, '只能包含中文、英文、数字和空格'),

  // 价格：必填，正数，最多两位小数
  price: z.number()
    .min(0, '价格不能为负数')
    .max(999999.99, '价格不能超过999999.99'),

  // 库存：必填，非负整数
  stock: z.number()
    .int('库存必须是整数')
    .min(0, '库存不能为负数')
    .max(99999, '库存不能超过99999'),

  // 分类：必填，从预定义列表中选择
  category: z.enum(['electronics', 'clothing', 'food', 'books', 'other'], {
    errorMap: () => ({ message: '请选择有效的产品分类' }),
  }),

  // 状态：可选，默认草稿
  status: z.enum(['draft', 'published', 'archived']).default('draft'),

  // 描述：可选，最多500字符
  description: z.string()
    .max(500, '描述最多500个字符')
    .optional(),

  // 上架时间范围：可选，需要验证时间顺序
  shelfLife: z.tuple([z.date(), z.date()])
    .optional()
    .refine(
      (dates) => !dates || dates[0] <= dates[1],
      '开始时间不能晚于结束时间'
    )
    .transform((dates) =>
      dates ? [dayjs(dates[0]), dayjs(dates[1])] as [dayjs.Dayjs, dayjs.Dayjs] : undefined
    ),
});

// 表单数据类型
export type ProductFormData = z.infer<typeof ProductFormSchema>;

// 表单提交数据（转换后的类型）
export type ProductSubmitData = {
  name: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  description?: string;
  shelfLife?: [Date, Date];
};

// 验证函数
export function validateProductForm(data: unknown): ProductFormData {
  return ProductFormSchema.parse(data);
}

// 部分验证函数（用于实时验证）
export function validateProductField<K extends keyof ProductFormData>(
  field: K,
  value: ProductFormData[K]
): string | undefined {
  try {
    ProductFormSchema.shape[field].parse(value);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return '验证失败';
  }
}