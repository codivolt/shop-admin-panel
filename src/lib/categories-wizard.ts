import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'نام دستهبندی الزامی است'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryAttribute {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  options: string | null;
  isRequired: boolean;
  sortOrder: number;
}

export const ATTRIBUTE_TYPES = [
  { value: 'text', label: 'متن' },
  { value: 'number', label: 'عدد' },
  { value: 'select', label: 'لیست انتخاب' },
  { value: 'boolean', label: 'بله/خیر' },
];

export interface WizardAttribute {
  id: string;
  name: string;
  type: string;
  options: string[];
  isRequired: boolean;
  sortOrder: number;
}