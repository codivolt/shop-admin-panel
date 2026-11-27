import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import Input from '../../components/input/Input';
import Button from '../../components/button/Button';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/layout/Breadcrumb';
import Stepper from '../../components/categories/Stepper';
import WizardAttributesStep from '../../components/categories/WizardAttributesStep';
import { categorySchema, type CategoryFormData, type Category, type CategoryAttribute, type WizardAttribute } from '../../lib/categories-wizard';

import { getAbsoluteImageUrl } from '../../lib/image';
export default function CategoriesWizardPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [createdCategoryId, setCreatedCategoryId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [removedAttributeIds, setRemovedAttributeIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', isActive: true },
  });

  const isActive = watch('isActive');

  const [attributes, setAttributes] = useState<WizardAttribute[]>([
    { id: Date.now().toString(), name: '', type: 'select', options: [], isRequired: false, sortOrder: 0 },
  ]);

  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImageUploading, setCategoryImageUploading] = useState(false);

  const uploadCategoryImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/categories/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.imageUrl;
    },
    onSuccess: (url) => {
      const absoluteUrl = getAbsoluteImageUrl(url);
      setCategoryImagePreview(absoluteUrl);
      setCategoryImageUploading(false);
      toast.success('تصویر دسته‌بندی آپلود شد');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در آپلود تصویر');
      setCategoryImageFile(null);
      setCategoryImagePreview(null);
      setCategoryImageUploading(false);
    },
  });

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویر انتخاب کنید');
      return;
    }
    setCategoryImageFile(file);
    setCategoryImageUploading(true);
    uploadCategoryImageMutation.mutate(file);
  };

  const removeCategoryImage = () => {
    setCategoryImageFile(null);
    setCategoryImagePreview(null);
  };

  const addAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, name: '', type: 'select', options: [], isRequired: false, sortOrder: prev.length },
    ]);
  };

  const removeAttribute = (attrId: string) => {
    setAttributes((prev) => prev.filter((a) => a.id !== attrId));
    if (isEdit && attrId.length > 20) {
      setRemovedAttributeIds((prev) => [...prev, attrId]);
    }
  };

  const updateAttributeName = (attrId: string, value: string) =>
    setAttributes((prev) => prev.map((a) => (a.id === attrId ? { ...a, name: value } : a)));

  const updateAttributeType = (attrId: string, value: string | number) =>
    setAttributes((prev) =>
      prev.map((a) =>
        a.id === attrId ? { ...a, type: String(value), options: value !== 'select' ? [] : a.options } : a
      )
    );

  const updateAttributeRequired = (attrId: string, value: boolean) =>
    setAttributes((prev) => prev.map((a) => (a.id === attrId ? { ...a, isRequired: value } : a)));

  const updateSortOrder = (attrId: string, value: number) =>
    setAttributes((prev) => prev.map((a) => (a.id === attrId ? { ...a, sortOrder: value } : a)));

  const addOption = (attributeId: string) =>
    setAttributes((prev) =>
      prev.map((a) => (a.id === attributeId ? { ...a, options: [...a.options, ''] } : a))
    );

  const removeOption = (attributeId: string, index: number) =>
    setAttributes((prev) =>
      prev.map((a) =>
        a.id === attributeId ? { ...a, options: a.options.filter((_, i) => i !== index) } : a
      )
    );

  const updateOption = (attributeId: string, index: number, value: string) =>
    setAttributes((prev) =>
      prev.map((a) =>
        a.id === attributeId
          ? { ...a, options: a.options.map((opt, i) => (i === index ? value : opt)) }
          : a
      )
    );

  useEffect(() => {
    if (isEdit && id) {
      setInitialLoading(true);
      api.get<Category>(`/categories/${id}`).then((res) => {
        const cat = res.data;
        reset({ name: cat.name, description: cat.description || '', isActive: cat.isActive });
        setCreatedCategoryId(cat.id);
        setStep(1);
        if (cat.imageUrl) {
          setCategoryImagePreview(getAbsoluteImageUrl(cat.imageUrl));
        }
      });

      api
        .get<CategoryAttribute[]>(`/categories/${id}/attributes`)
        .then((res) => {
          const attrs: WizardAttribute[] = res.data.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            options: a.options ? JSON.parse(a.options) : [],
            isRequired: a.isRequired,
            sortOrder: a.sortOrder,
          }));
          setAttributes(
            attrs.length > 0
              ? attrs
              : [{ id: Date.now().toString(), name: '', type: 'select', options: [], isRequired: false, sortOrder: 0 }]
          );
        })
        .finally(() => setInitialLoading(false));
    }
  }, [isEdit, id]);

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData & { imageUrl?: string }) => {
      const payload = { ...data };
      if (categoryImagePreview) {
        // Extract the relative URL from the absolute preview URL
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        if (categoryImagePreview.startsWith(apiUrl)) {
          payload.imageUrl = categoryImagePreview.replace(apiUrl, '');
        } else {
          payload.imageUrl = categoryImagePreview;
        }
      }
      if (isEdit && id) {
        const res = await api.put(`/categories/${id}`, payload);
        return res.data;
      }
      const res = await api.post('/categories', payload);
      return res.data;
    },
    onSuccess: (newCategory) => {
      setCreatedCategoryId(newCategory.id);
      setStep(2);
      toast.success(isEdit ? 'اطلاعات دسته‌بندی بروزرسانی شد' : 'دسته‌بندی ایجاد شد؛ حالا ویژگی‌ها را اضافه کنید');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ذخیره دسته‌بندی');
    },
  });

  const createAttributesMutation = useMutation({
    mutationFn: async ({ categoryId, attrs }: { categoryId: string; attrs: WizardAttribute[] }) => {
      const existingAttrs = attrs.filter((a) => a.id.length > 20);
      const newAttrs = attrs.filter((a) => a.id.length <= 20);

      const savePromises = [
        ...removedAttributeIds.map((attrId) => api.delete(`/categories/${categoryId}/attributes/${attrId}`)),
        ...existingAttrs.map((attr) =>
          api.put(`/categories/${categoryId}/attributes/${attr.id}`, {
            name: attr.name,
            type: attr.type,
            options: attr.type === 'select' ? JSON.stringify(attr.options.filter((o) => o.trim())) : undefined,
            isRequired: attr.isRequired,
            sortOrder: attr.sortOrder,
          })
        ),
        ...newAttrs.map((attr) =>
          api.post(`/categories/${categoryId}/attributes`, {
            name: attr.name,
            type: attr.type,
            options: attr.type === 'select' ? JSON.stringify(attr.options.filter((o) => o.trim())) : undefined,
            isRequired: attr.isRequired,
            sortOrder: attr.sortOrder,
          })
        ),
      ];
      return Promise.all(savePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-attributes'] });
      toast.success('ویژگی‌ها با موفقیت ذخیره شدند');
      setStep(3);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ذخیره ویژگی‌ها');
    },
  });

  const handleStep1Submit = (data: CategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  const handleStep2Submit = () => {
    if (!createdCategoryId) return;
    const validAttrs = attributes.filter((a) => a.name.trim());
    if (validAttrs.length === 0) {
      toast.error('حداقل یک ویژگی با عنوان معتبر وارد کنید');
      return;
    }
    createAttributesMutation.mutate({ categoryId: createdCategoryId, attrs: validAttrs });
  };

  const goToList = () => navigate('/categories');

  const stepLabels = isEdit
    ? ['اطلاعات دسته‌بندی', 'ویژگی‌ها']
    : ['اطلاعات دسته‌بندی', 'ویژگی‌ها', 'تکمیل'];

  const pageTitle = isEdit
    ? 'ویرایش دسته‌بندی'
    : step === 1
      ? 'ایجاد دسته‌بندی جدید'
      : step === 2
        ? 'افزودن ویژگی‌ها'
        : 'تکمیل شد';

  const pageSubtitle = isEdit
    ? 'اطلاعات و ویژگی‌های دسته‌بندی را به‌روزرسانی کنید'
    : step === 1
      ? 'ابتدا نام و توضیحات دسته‌بندی را وارد کنید'
      : step === 2
        ? 'ویژگی‌های قابل انتخاب برای محصولات این دسته را تعریف کنید'
        : 'دسته‌بندی با موفقیت ذخیره شد';

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <Breadcrumb />
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-56 rounded-xl bg-surface-2" />
          <div className="h-16 rounded-2xl bg-surface-2" />
          <div className="h-72 rounded-2xl bg-surface-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb />

      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-fg md:text-2xl">
            {pageTitle}
          </h1>
          <p className="mt-1 text-sm text-muted">{pageSubtitle}</p>
        </div>
        <Button variant="outline" size="md" className="w-full md:w-auto" onClick={goToList}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          بازگشت به لیست
        </Button>
      </div>

      {step < 3 && <Stepper steps={stepLabels} current={step} />}

      {/* Step 1 */}
      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <form
            onSubmit={handleSubmit(handleStep1Submit)}
            className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/20 lg:col-span-2 md:p-6"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary-rgb)/0.12)] text-primary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-fg">اطلاعات دسته‌بندی</h2>
                <p className="text-xs text-muted">نام و وضعیت نمایش دسته را مشخص کنید</p>
              </div>
            </div>

            <div className="space-y-5">
              <Input
                name="name"
                label="نام دسته‌بندی"
                placeholder="مثلاً تنباکو"
                required
                methods={{ register, formState: { errors } } as any}
              />

              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted">توضیحات</label>
                <textarea
                  {...register('description')}
                  placeholder="توضیح کوتاهی درباره این دسته‌بندی…"
                  rows={4}
                  className="w-full resize-y rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-fg outline-none transition-all placeholder:text-muted focus:border-primary focus:shadow-[0_0_0_3px_rgb(var(--primary-rgb)/0.16)]"
                />
                {errors.description && (
                  <p className="text-xs font-medium text-[#f87171]">{errors.description.message}</p>
                )}
              </div>

              {/* Category Image Upload */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-fg">تصویر دسته‌بندی</h3>
                  {categoryImageFile && (
                    <Button variant="outline" size="sm" onClick={removeCategoryImage} disabled={categoryImageUploading}>
                      حذف تصویر
                    </Button>
                  )}
                </div>
                <div
                  className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all ${
                    categoryImageFile || categoryImagePreview
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border bg-surface-2 hover:border-primary hover:bg-surface-2'
                  } cursor-pointer`}
                  onClick={() => document.getElementById('category-image-input')?.click()}
                >
                  <input
                    id="category-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleCategoryImageChange}
                    className="hidden"
                    disabled={categoryImageUploading}
                  />
                  {categoryImagePreview ? (
                    <>
                      <img
                        src={categoryImagePreview}
                        alt="پیش‌نمایش تصویر دسته‌بندی"
                        className="w-24 h-24 object-cover rounded-xl shadow-md"
                      />
                      <div className="mt-3 text-sm font-medium text-primary">
                        تصویر انتخاب شده
                      </div>
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="text-sm font-medium text-muted-soft">
                        انتخاب تصویر دسته‌بندی
                      </div>
                      <p className="text-xs text-muted mt-1">
                        فرمت‌های پشتیبانی شده: JPG, PNG, WEBP
                      </p>
                    </>
                  )}
                  {categoryImageUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-xl">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <p className="text-sm font-medium text-primary">در حال آپلود...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setValue('isActive', !isActive)}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-right transition-colors hover:border-muted-soft"
              >
                <span>
                  <span className="block text-sm font-medium text-fg">وضعیت فعال</span>
                  <span className="block text-xs text-muted">
                    دسته‌بندی غیرفعال در فروشگاه نمایش داده نمی‌شود
                  </span>
                </span>
                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    isActive ? 'bg-primary' : 'bg-muted-soft'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      isActive ? 'right-0.5' : 'right-[22px]'
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={goToList}>
                انصراف
              </Button>
              <Button type="submit" isLoading={createCategoryMutation.isPending} className="w-full sm:w-auto">
                {isEdit ? 'ذخیره و ادامه' : 'مرحله بعدی'}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-bold text-fg">نکات این مرحله</h3>
              <ul className="space-y-3 text-xs leading-6 text-muted">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  نام دسته باید کوتاه و گویا باشد؛ در فروشگاه همین نام نمایش داده می‌شود.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  در مرحله بعد می‌توانید ویژگی‌هایی مثل رنگ یا سایز را تعریف کنید.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  وضعیت غیرفعال برای آماده‌سازی بدون نمایش عمومی مناسب است.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && createdCategoryId && (
        <WizardAttributesStep
          attributes={attributes}
          isSaving={createAttributesMutation.isPending}
          onAdd={addAttribute}
          onRemove={removeAttribute}
          onUpdateName={updateAttributeName}
          onUpdateType={updateAttributeType}
          onUpdateSort={(id, v) => updateSortOrder(id, v)}
          onToggleRequired={(id) => {
            const attr = attributes.find((x) => x.id === id);
            if (attr) updateAttributeRequired(id, !attr.isRequired);
          }}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          onUpdateOption={updateOption}
          onBack={() => setStep(1)}
          onCancel={goToList}
          onSubmit={handleStep2Submit}
        />
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to px-6 py-16 text-center shadow-lg shadow-black/25">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(16,185,129,0.12)] text-emerald-400">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-fg md:text-xl">
            {isEdit ? 'دسته‌بندی با موفقیت بروزرسانی شد' : 'دسته‌بندی با موفقیت ایجاد شد'}
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            اطلاعات و ویژگی‌های این دسته‌بندی ذخیره شدند و آماده استفاده در محصولات هستند.
          </p>
          <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {!isEdit && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  reset();
                  setAttributes([{ id: Date.now().toString(), name: '', type: 'select', options: [], isRequired: false, sortOrder: 0 }]);
                  setRemovedAttributeIds([]);
                  setCreatedCategoryId(null);
                  setStep(1);
                }}
              >
                افزودن دسته‌بندی دیگر
              </Button>
            )}
            <Button className="w-full sm:w-auto" onClick={goToList}>
              بازگشت به لیست دسته‌بندی‌ها
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
