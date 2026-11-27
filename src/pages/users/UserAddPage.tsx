import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createUser } from '../../features/users/api';
import Input from '../../components/input/Input';
import Button from '../../components/button/Button';
import Card from '../../components/layout/Card';
import CustomSelect from '../../components/form/CustomSelect';
import toast from 'react-hot-toast';

import { useAppSelector } from '../../hooks/useRedux';
import Breadcrumb from '../../components/layout/Breadcrumb';
const userSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد').optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: z.enum(['customer', 'admin', 'super_admin', 'courier']),
  isActive: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserAddPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user } = useAppSelector((state: any) => state.auth);
  const isSuperAdmin = user?.role === 'super_admin';

  const methods = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      avatarUrl: '',
      role: 'customer',
      isActive: true,
    },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const res = await createUser(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('کاربر با موفقیت ایجاد شد');
      navigate('/users');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد کاربر');
    },
  });

  const handleSubmitForm = async (data: UserFormData) => {
    let avatarUrl = data.avatarUrl;
    if (avatarFile) {
      avatarUrl = await fileToDataUrl(avatarFile);
    }
    createUserMutation.mutate({ ...data, avatarUrl });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویر انتخاب کنید');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم فایل باید حداکثر ۲ مگابایت باشد');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
      reader.readAsDataURL(file);
    });

  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">افزودن کاربر جدید</h1>
          <p className="text-muted text-sm">
            اطلاعات کاربر را وارد کنید
          </p>
        </div>
        <Link to="/users" className="md:shrink-0">
          <Button variant="outline" className="w-full md:w-auto">
            بازگشت به لیست کاربران
          </Button>
        </Link>
      </div>

      <Card padding="md" radius="lg" border="neutral-200">
        <form onSubmit={methods.handleSubmit(handleSubmitForm)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Input
                name="email"
                label="ایمیل *"
                placeholder="ali@example.com"
                type="email"
                required
                methods={methods}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="password"
                label="رمز عبور *"
                type="password"
                required
                methods={methods}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="firstName"
                label="نام"
                placeholder="علی"
                methods={methods}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="lastName"
                label="نام خانوادگی"
                placeholder="احمدی"
                methods={methods}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="phone"
                label="تلفن"
                placeholder="09123456789"
                methods={methods}
              />
            </div>
            <div className="space-y-2">
              <CustomSelect
                name="role"
                methods={methods}
                options={[
                  { value: 'customer', label: 'مشتری' },
                  { value: 'admin', label: 'مدیر' },
                  ...(isSuperAdmin
                    ? [{ value: 'super_admin', label: 'مدیر فوق العاده' }]
                    : []),
                  { value: 'courier', label: 'پیک' },
                ]}
                label="نقش"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted">عکس آواتار</label>
              <div
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  avatarFile
                    ? 'border-border-strong bg-primary/10'
                    : 'border-border bg-surface-2 hover:border-primary hover:bg-surface-2'
                }`}
                onClick={() => document.getElementById('avatar-input')?.click()}
              >
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                {avatarPreview ? (
                  <>
                    <img
                      src={avatarPreview}
                      alt="پیش نمایش آواتار"
                      className="w-24 h-24 object-cover rounded-full shadow-md mb-2"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeAvatar}
                      className="mt-1"
                    >
                      حذف عکس
                    </Button>
                    <p className="text-[10px] text-muted mt-1">اختیاری</p>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm font-medium text-muted-soft">انتخاب عکس آواتار</div>
                    <p className="text-[10px] text-muted mt-1">اختیاری</p>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
<div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...methods.register('isActive')}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                />
                <label className="text-sm text-muted-soft cursor-pointer">
                  فعال
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/users')}
              disabled={createUserMutation.isPending}
            >
              لغو
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
            >
              ذخیره کاربر
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
