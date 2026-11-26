import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import Input from '../../components/input/Input';
import Button from '../../components/button/Button';
import Card from '../../components/layout/Card';
import CustomSelect from '../../components/form/CustomSelect';
import Modal from '../../components/layout/Modal';
import toast from 'react-hot-toast';

import Breadcrumb from '../../components/layout/Breadcrumb';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const productSchema = z.object({
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

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface CategoryAttribute {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  options: string | null;
  isRequired: boolean;
  sortOrder: number;
}

export default function ProductAddPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof productSchema>, any, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      stock: 0,
      sku: '',
      categoryId: '',
      brandId: '',
      isActive: true,
    },
  });

  const watchedName = watch('name');
  const watchedSlug = watch('slug');
  const lastGeneratedSlug = useRef<string>('');
  useEffect(() => {
    if (!watchedName) return;
    const generated = slugify(watchedName);
    if (!watchedSlug || watchedSlug === lastGeneratedSlug.current) {
      setValue('slug', generated);
      lastGeneratedSlug.current = generated;
    }
  }, [watchedName, watchedSlug, setValue]);
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['productCategories'],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { limit: 100 } });
      return res.data.data;
    },
  });

  const { data: brands, isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ['productBrands'],
    queryFn: async () => {
      const res = await api.get('/brands', { params: { limit: 100 } });
      return res.data.data;
    },
  });

  useEffect(() => {
    if (selectedCategoryId) {
      api
        .get<CategoryAttribute[]>(`/categories/${selectedCategoryId}/attributes`)
        .then((res) => {
          setAttributes(res.data);
          const newValues: Record<string, string> = {};
          res.data.forEach((attr) => {
            newValues[attr.id] = '';
          });
          setAttributeValues(newValues);
        })
        .catch(() => {
          setAttributes([]);
          setAttributeValues({});
        });
    } else {
      setAttributes([]);
      setAttributeValues({});
    }
  }, [selectedCategoryId]);

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const res = await api.post('/products', data);
      return res.data;
    },
    onSuccess: async (newProduct) => {
      const savePromises = Object.entries(attributeValues).map(
        ([attributeId, value]) => {
          if (value.trim()) {
            return api.post(`/products/${newProduct.id}/attribute-values`, {
              attributeId,
              value,
            });
          }
          return Promise.resolve();
        }
      );
      await Promise.all(savePromises);

      // Upload selected images: first becomes the main image, rest go to the gallery
      if (imageFiles.length > 0) {
        try {
          const firstForm = new FormData();
          firstForm.append('file', imageFiles[0]);
          const mainRes = await api.post('/products/upload-image', firstForm, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          await api.put(`/products/${newProduct.id}`, {
            imageUrl: mainRes.data.imageUrl,
          });

          for (const file of imageFiles.slice(1)) {
            const form = new FormData();
            form.append('file', file);
            await api.post(`/products/${newProduct.id}/images`, form, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          }
        } catch (err: any) {
          toast.error(
            err.response?.data?.message || 'خطا در آپلود تصاویر محصول',
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('محصول با موفقیت ایجاد شد');
      navigate('/products');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد محصول');
    },
  });

  const handleSubmitForm = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const handleAttributeChange = (attributeId: string, value: string) => {
    setAttributeValues((prev) => ({ ...prev, [attributeId]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    if (incoming.length === 0) return;

    const validFiles = incoming.filter(
      (file) => file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE,
    );
    if (validFiles.length !== incoming.length) {
      toast.error('هر تصویر باید حداکثر 2 مگابایت باشد و از نوع عکس باشد');
    }
    if (validFiles.length === 0) return;

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImagePreview((prev) => prev ?? newPreviews[0] ?? null);
    e.target.value = '';
  };

  const removeImage = () => {
    setImageFiles([]);
    setImagePreviews([]);
    setImagePreview(null);
    setImageModalOpen(false);
  };

  const removeImageAt = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setImagePreview(next[0] ?? null);
      return next;
    });
  };

  if (categoriesLoading || brandsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">افزودن محصول جدید</h1>
          <p className="text-muted text-sm">
            اطلاعات پایه و ویژگی‌های محصول را وارد کنید
          </p>
        </div>
        <Link to="/products" className="md:shrink-0">
          <Button variant="outline" className="w-full md:w-auto">
            بازگشت به لیست محصولات
          </Button>
        </Link>
      </div>

      <Card padding="md" radius="lg" border="neutral-200">
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-8">

          {/* Image Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-fg">تصویر محصول</h2>
              {imageFiles.length > 0 && (
                <Button variant="outline" size="sm" onClick={removeImage}>
                  حذف تصاویر
                </Button>
              )}
            </div>
            <div
              className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all ${
                imageFiles.length > 0
                  ? 'border-border-strong bg-primary/10'
                    : 'border-border bg-surface-2 hover:border-primary hover:bg-surface-2'
              } cursor-pointer`}
              onClick={() => document.getElementById('product-image-input')?.click()}
            >
              <input
                id="product-image-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreviews.length > 0 ? (
                <div className="w-full">
                  <div className="flex flex-wrap justify-center gap-3">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={src}
                          alt={`پیش نمایش ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded-xl shadow-md"
                        />
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            removeImageAt(idx);
                          }}
                          className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700"
                          aria-label="حذف تصویر"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        document.getElementById('product-image-input')?.click();
                      }}
                      className="flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary transition-colors"
                    >
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[11px] font-medium">افزودن</span>
                    </button>
                  </div>
                  <div className="mt-3 text-sm font-medium text-primary">
                    {imagePreviews.length} تصویر انتخاب شده
                  </div>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-sm font-medium text-muted-soft">
                    انتخاب تصویر محصول (چندگانه)
                  </div>
                  <p className="text-xs text-muted mt-1">
                    فرمت‌های پشتیبانی شده: JPG, PNG, WEBP — حداکثر 2 مگابایت برای هر تصویر
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Input
                name="name"
                label="نام محصول *"
                placeholder="معمولاً توتون خشک"
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
                placeholder="toton-khoshk"
                methods={{
                  register,
                  formState: { errors },
                } as any}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="price"
                label="قیمت (تومان) *"
                type="number"
                required
                methods={{
                  register,
                  formState: { errors },
                } as any}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="stock"
                label="موجودی"
                type="number"
                methods={{
                  register,
                  formState: { errors },
                } as any}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="sku"
                label="کد محصول (SKU)"
                placeholder="SKU-123"
                methods={{
                  register,
                  formState: { errors },
                } as any}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="block text-sm font-medium text-fg-soft">
                توضیحات
              </div>
              <textarea
                {...register('description')}
                placeholder="توضیحات محصول"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border bg-surface text-fg focus:ring-2 focus:border-transparent outline-none transition-all border-border focus:ring-primary"
              />
              {errors.description && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-fg-soft">
              دسته‌بندی *
            </label>
            <CustomSelect
              options={categories?.map((cat) => ({ value: cat.id, label: cat.name })) ?? []}
              value={selectedCategoryId}
              onChange={(val) => {
                setValue('categoryId', val as string);
                setSelectedCategoryId(val as string);
              }}
              label="دسته‌بندی"
              required
              error={errors.categoryId?.message}
            />
            {errors.categoryId && (
              <p className="text-red-500 text-sm font-medium">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Brand Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-fg-soft">
              برند
            </label>
            <CustomSelect
              options={brands?.map((b) => ({ value: b.id, label: b.name })) ?? []}
              value={selectedBrandId || ''}
              onChange={(val) => {
                setValue('brandId', val as string);
                setSelectedBrandId(val as string);
              }}
              label="برند"
              error={errors.brandId?.message}
            />
          </div>

          {/* Dynamic Attributes */}
          {selectedCategoryId && attributes.length > 0 && (
            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-fg">ویژگی‌های دسته‌بندی</h3>
                <p className="text-xs text-muted">
                  ویژگی‌های تعریف شده برای این دسته‌بندی
                </p>
              </div>
              <div className="space-y-4">
                {attributes.map((attr) => {
                  const isSelect = attr.type === 'select';
                  const options = attr.options ? JSON.parse(attr.options) : [];
                  return (
                    <div
                      key={attr.id}
                      className={`p-4 rounded-xl border ${
                        attr.isRequired
                          ? 'border-border-strong bg-primary/10/40'
                          : 'border-border bg-surface-2/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-fg">
                          {attr.name}
                        </label>
                        {attr.isRequired && (
                          <span className="text-xs font-medium text-primary">
                            اجباری
                          </span>
                        )}
                      </div>
                      {isSelect ? (
                        <CustomSelect
                          options={options.map((opt: string) => ({ value: opt, label: opt }))}
                          value={attributeValues[attr.id] || ''}
                          onChange={(val) => handleAttributeChange(attr.id, val as string)}
                          label="مقدار ویژگی"
                          required={attr.isRequired}
                          error={attr.isRequired && !attributeValues[attr.id] ? 'این فیلد الزامی است' : undefined}
                        />
                      ) : attr.type === 'boolean' ? (
                        <CustomSelect
                          options={[
                            { value: 'true', label: 'بله' },
                            { value: 'false', label: 'خیر' },
                          ]}
                          value={attributeValues[attr.id] || ''}
                          onChange={(val) => handleAttributeChange(attr.id, val as string)}
                          label="مقدار ویژگی"
                          required={attr.isRequired}
                          error={attr.isRequired && !attributeValues[attr.id] ? 'این فیلد الزامی است' : undefined}
                        />
                      ) : (
                        <Input
                          name={`attr_${attr.id}`}
                          label="مقدار ویژگی"
                          placeholder={`مقدار ویژگی ${attr.name}`}
                          type={attr.type === 'number' ? 'number' : 'text'}
                          value={attributeValues[attr.id] || ''}
                          onChange={(e) =>
                            handleAttributeChange(attr.id, e.target.value)
                          }
                          required={attr.isRequired}
                          error={attr.isRequired && !attributeValues[attr.id] ? 'این فیلد الزامی است' : undefined}
                          className="w-full"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/products')}
              disabled={createProductMutation.isPending}
            >
              لغو
            </Button>
            <Button
              type="submit"
              disabled={createProductMutation.isPending}
            >
              ذخیره محصول
            </Button>
          </div>
        </form>
      </Card>

      {imagePreview && (
        <Modal
          open={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          title="پیش نمایش تصویر"
          size="md"
        >
          <div className="flex items-center justify-center">
            <img
              src={imagePreview}
              alt="پیش نمایش"
              className="max-w-full max-h-[60vh] rounded-xl shadow-2xl object-contain"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setImageModalOpen(false)}>
              بستن
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
