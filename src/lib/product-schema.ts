import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'نام محصول الزامی است'),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'قیمت نمی‌تواند منفی باشد'),
  stock: z.coerce.number().min(0, 'موجودی نمی‌تواند منفی باشد').optional(),
  sku: z.string().optional(),
  categoryId: z.string().min(1, 'انتخاب دسته‌بندی الزامی است'),
  brandId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const PRODUCT_FORM_DEFAULTS = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  stock: 0,
  sku: '',
  categoryId: '',
  brandId: '',
  isActive: true,
};
