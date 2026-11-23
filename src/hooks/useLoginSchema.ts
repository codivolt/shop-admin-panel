import { z } from 'zod';

export const loginSchema = z.object({
  phone: z.string().min(10, 'شماره موبایل نامعتبر است'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
