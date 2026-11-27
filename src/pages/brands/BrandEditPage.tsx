import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getBrand, updateBrand } from '../../features/brands/api';
import Input from '../../components/input/Input';
import Button from '../../components/button/Button';
import Card from '../../components/layout/Card';
import toast from 'react-hot-toast';

import Breadcrumb from '../../components/layout/Breadcrumb';
const brandSchema = z.object({
  name: z.string().min(1, 'نام برند الزامی است'),
  slug: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  isActive: z.boolean().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BrandEditPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logo: '',
      isActive: true,
    },
  });

  const { data: brand, isLoading } = useQuery<Brand>({
    queryKey: ['brand', id],
    queryFn: async () => {
      const res = await getBrand(id!);
      return res.data;
    },
    enabled: !!id,
  });

  const updateBrandMutation = useMutation({
    mutationFn: async (data: BrandFormData) => {
      const res = await updateBrand(id!, {
        ...data,
        logo: logoPreview || brand?.logo || data.logo,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand', id] });
      toast.success('برند با موفقیت بروزرسانی شد');
      navigate('/brands');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی برند');
    },
  });

  const handleSubmitForm = (data: BrandFormData) => {
    updateBrandMutation.mutate(data);
  };

  useEffect(() => {
    if (brand) {
      setLogoPreview(brand.logo || null);
      reset({
        name: brand.name,
        slug: brand.slug || '',
        description: brand.description || '',
        logo: brand.logo || '',
        isActive: brand.isActive,
      });
    }
  }, [brand, reset]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویر انتخاب کنید');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setValue('logo', '');
  };

  if (!id || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!brand) {
    navigate('/brands');
    return null;
  }

  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">ویرایش برند</h1>
          <p className="text-muted text-sm">
            اطلاعات برند را بروزرسانی کنید
          </p>
        </div>
        <Link to="/brands" className="md:shrink-0">
          <Button variant="outline" className="w-full md:w-auto">
            بازگشت به لیست برندها
          </Button>
        </Link>
      </div>

      <Card padding="md" radius="lg" border="neutral-200">
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Input
                name="name"
                label="نام برند *"
                placeholder="معمولاً سامسونگ"
                required
                methods={{
                  register,
                  formState: { errors },
                } as any}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="slug"
                label="نامک (Slug)"
                placeholder="samsung"
                methods={{
                  register,
                  formState: { errors },
                } as any}
              />
            </div>

            {/* Logo Upload */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-fg">لوگو برند</h2>
                {logoFile || logoPreview && !logoFile ? (
                  <Button variant="outline" size="sm" onClick={removeLogo}>
                    حذف لوگو
                  </Button>
                ) : null}
              </div>
              <div
                className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all ${
                  logoFile || logoPreview
                    ? 'border-border-strong bg-primary/10'
                    : 'border-border bg-surface-2 hover:border-primary hover:bg-surface-2'
                } cursor-pointer`}
                onClick={() => document.getElementById('brand-logo-input')?.click()}
              >
                <input
                  id="brand-logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                {logoPreview ? (
                  <>
                    <img
                      src={logoPreview}
                      alt="پیش نمایش لوگو"
                      className="w-32 h-32 object-cover rounded-xl shadow-md"
                    />
                    <div className="mt-3 text-sm font-medium text-primary">
                      لوگو انتخاب شده
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm font-medium text-muted-soft">
                      انتخاب لوگو برند
                    </div>
                    <p className="text-xs text-muted mt-1">
                      فرمت‌هایupported: JPG, PNG, WEBP
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="block text-sm font-medium text-fg-soft">
                توضیحات
              </div>
              <textarea
                {...register('description')}
                placeholder="توضیحات برند"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border bg-surface text-fg focus:ring-2 focus:border-transparent outline-none transition-all border-border focus:ring-primary"
              />
              {errors.description && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register('isActive')}
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
              onClick={() => navigate('/brands')}
              disabled={updateBrandMutation.isPending}
            >
              لغو
            </Button>
            <Button
              type="submit"
              disabled={updateBrandMutation.isPending}
            >
              بروزرسانی برند
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
