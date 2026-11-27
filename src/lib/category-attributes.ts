import { z } from 'zod';

export type AttributeType = 'text' | 'number' | 'select' | 'boolean';

export const ATTRIBUTE_TYPES: { value: AttributeType; label: string }[] = [
  { value: 'text', label: 'متن' },
  { value: 'number', label: 'عدد' },
  { value: 'select', label: 'لیست انتخاب' },
  { value: 'boolean', label: 'بله / خیر' },
];

export const TYPE_LABELS: Record<AttributeType, string> = {
  text: 'متن',
  number: 'عدد',
  select: 'لیست انتخاب',
  boolean: 'بله / خیر',
};

export function parseOptionList(input?: string | null): string[] {
  const raw = (input ?? '').trim();
  if (!raw) return [];
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeOptions(input?: string | null): string | null {
  const list = parseOptionList(input);
  return list.length > 0 ? JSON.stringify(list) : null;
}

export const attributeSchema = z
  .object({
    name: z.string().trim().min(1, 'نام ویژگی الزامی است'),
    type: z.enum(['text', 'number', 'select', 'boolean']),
    options: z.string().optional(),
    isRequired: z.boolean().optional(),
    sortOrder: z.coerce
      .number()
      .int('ترتیب نمایش باید عدد صحیح باشد')
      .min(0, 'ترتیب نمایش نمی‌تواند منفی باشد')
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'select' && !normalizeOptions(value.options)) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'برای نوع لیست انتخاب، حداقل یک گزینه وارد کنید',
      });
    }
  });

export type AttributeFormData = z.infer<typeof attributeSchema>;

export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
}

export interface CategoryAttribute {
  id: string;
  categoryId: string;
  name: string;
  type: AttributeType;
  options: string | null;
  isRequired: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}