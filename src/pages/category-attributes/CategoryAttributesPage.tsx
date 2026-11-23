import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Input from '../../components/input/Input';
import Button from '../../components/button/Button';
import CustomSelect from '../../components/form/CustomSelect';
import Modal from '../../components/layout/Modal';
import DataTable, { type Column } from '../../components/table/DataTable';
import StatCard from '../../components/stats/StatCard';
import PageHeader from '../../components/layout/PageHeader';
import { useAppSelector } from '../../hooks/useRedux';
import { PERMISSIONS } from '../../constants';

type AttributeType = 'text' | 'number' | 'select' | 'boolean';

const ATTRIBUTE_TYPES: { value: AttributeType; label: string }[] = [
  { value: 'text', label: 'متن' },
  { value: 'number', label: 'عدد' },
  { value: 'select', label: 'لیست انتخاب' },
  { value: 'boolean', label: 'بله / خیر' },
];

const TYPE_LABELS: Record<AttributeType, string> = {
  text: 'متن',
  number: 'عدد',
  select: 'لیست انتخاب',
  boolean: 'بله / خیر',
};

function parseOptionList(input?: string | null): string[] {
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

function normalizeOptions(input?: string | null): string | null {
  const list = parseOptionList(input);
  return list.length > 0 ? JSON.stringify(list) : null;
}

const attributeSchema = z
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

type AttributeFormData = z.infer<typeof attributeSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
}

interface CategoryAttribute {
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

const QUERY_KEY = 'category-attributes';

export default function CategoryAttributesPage() {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryAttribute | null>(null);

  const methods = useForm<z.input<typeof attributeSchema>, any, AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: '',
      type: 'text',
      options: '',
      isRequired: false,
      sortOrder: 0,
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const currentType = watch('type');
  const optionsPreview = parseOptionList(watch('options'));

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery<Category[]>({
    queryKey: [QUERY_KEY, 'categories'],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { limit: 100 } });
      return res.data.data ?? [];
    },
  });

  const {
    data: attributes,
    isLoading: attributesLoading,
    isFetching: attributesFetching,
  } = useQuery<CategoryAttribute[]>({
    queryKey: [QUERY_KEY, 'list', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const res = await api.get(`/categories/${selectedCategoryId}/attributes`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!selectedCategoryId,
  });

  const selectedCategory = useMemo(
    () => categories?.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const filteredCategories = useMemo(() => {
    const term = categorySearch.trim().toLowerCase();
    if (!term) return categories ?? [];
    return (categories ?? []).filter(
      (category) =>
        category.name.toLowerCase().includes(term) || category.slug.toLowerCase().includes(term)
    );
  }, [categories, categorySearch]);

  const invalidateAttributes = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list', selectedCategoryId] });
  };

  const createMutation = useMutation({
    mutationFn: async (payload: AttributeFormData) => {
      const res = await api.post(`/categories/${selectedCategoryId}/attributes`, payload);
      return res.data;
    },
    onSuccess: () => {
      invalidateAttributes();
      toast.success('ویژگی با موفقیت اضافه شد');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در افزودن ویژگی');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AttributeFormData }) => {
      const res = await api.put(`/categories/${selectedCategoryId}/attributes/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      invalidateAttributes();
      toast.success('ویژگی با موفقیت بروزرسانی شد');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی ویژگی');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${selectedCategoryId}/attributes/${id}`);
    },
    onSuccess: () => {
      invalidateAttributes();
      toast.success('ویژگی با موفقیت حذف شد');
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف ویژگی');
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function closeModal() {
    setOpen(false);
    setEditingAttributeId(null);
    reset({ name: '', type: 'text', options: '', isRequired: false, sortOrder: 0 });
  }

  const openCreateModal = () => {
    setEditingAttributeId(null);
    reset({ name: '', type: 'text', options: '', isRequired: false, sortOrder: 0 });
    setOpen(true);
  };

  const openEditModal = useCallback(
    (attribute: CategoryAttribute) => {
      setEditingAttributeId(attribute.id);
      reset({
        name: attribute.name,
        type: attribute.type,
        options: parseOptionList(attribute.options).join('، '),
        isRequired: attribute.isRequired,
        sortOrder: attribute.sortOrder,
      });
      setOpen(true);
    },
    [reset]
  );

  const handleSubmitForm = (data: AttributeFormData) => {
    const payload: AttributeFormData = {
      name: data.name.trim(),
      type: data.type,
      options: data.type === 'select' ? normalizeOptions(data.options) ?? '' : '',
      isRequired: !!data.isRequired,
      sortOrder: data.sortOrder ?? 0,
    };

    if (editingAttributeId) {
      updateMutation.mutate({ id: editingAttributeId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  useEffect(() => {
    if (selectedCategoryId && categories && !categories.some((c) => c.id === selectedCategoryId)) {
      setSelectedCategoryId(null);
    }
  }, [categories, selectedCategoryId]);

  const { user } = useAppSelector((state: any) => state.auth);
  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'super_admin';
  const canView = isSuperAdmin || permissions.includes(PERMISSIONS.CATEGORIES_ATTRIBUTES_VIEW);
  const canUpdate = isSuperAdmin || permissions.includes(PERMISSIONS.CATEGORIES_ATTRIBUTES_UPDATE);
  const canDelete = isSuperAdmin || permissions.includes(PERMISSIONS.CATEGORIES_ATTRIBUTES_DELETE);
  const canCreate = isSuperAdmin || permissions.includes(PERMISSIONS.CATEGORIES_ATTRIBUTES_CREATE);

  const attributeColumns: Column<CategoryAttribute>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'نام ویژگی',
        width: '30%',
        sortable: true,
        render: (_value, row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 dark:shadow-black/30">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h10M4 18h7" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-fg">{row.name}</div>
              <div className="text-[11px] text-muted">ترتیب نمایش: {row.sortOrder.toLocaleString('fa-IR')}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'type',
        label: 'نوع',
        width: '14%',
        align: 'center',
        render: (value: AttributeType) => (
          <span className="chip bg-surface-2 text-fg-soft">{TYPE_LABELS[value] ?? value}</span>
        ),
      },
      {
        key: 'options',
        label: 'گزینه‌ها',
        width: '24%',
        render: (value: string | null) => {
          const options = parseOptionList(value);
          if (options.length === 0) {
            return <span className="text-xs text-muted-soft">—</span>;
          }
          return (
            <div className="flex flex-wrap items-center gap-1">
              {options.slice(0, 3).map((option) => (
                <span key={option} className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] text-fg-soft">
                  {option}
                </span>
              ))}
              {options.length > 3 && (
                <span className="text-[11px] text-muted">+{options.length - 3}</span>
              )}
            </div>
          );
        },
      },
      {
        key: 'isRequired',
        label: 'اجباری',
        width: '12%',
        align: 'center',
        render: (value: boolean) =>
          value ? (
            <span className="chip bg-[rgb(var(--primary-rgb)/0.12)] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              بله
            </span>
          ) : (
            <span className="chip bg-surface-2 text-muted">خیر</span>
          ),
      },
      {
        key: 'actions',
        label: 'عملیات',
        width: '14%',
        align: 'center',
        render: (_value, row) => (
          <div className="flex items-center justify-center gap-1.5">
            {canUpdate && (
              <button
                onClick={() => openEditModal(row)}
                title="ویرایش ویژگی"
                aria-label={`ویرایش ویژگی ${row.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 transition-all hover:text-primary active:scale-95 dark:shadow-black/30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4h2a2 2 0 012 2v12a2 2 0 01-2 2h-2m-6-9H3m0 0l3-3m-3 3l3 3m6-6V3m0 18v-3" />
                </svg>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setDeleteTarget(row)}
                title="حذف ویژگی"
                aria-label={`حذف ویژگی ${row.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 transition-all hover:text-accent active:scale-95 dark:shadow-black/30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ),
      },
    ],
    [openEditModal]
  );

  const requiredCount = (attributes ?? []).filter((attribute) => attribute.isRequired).length;
  const selectCount = (attributes ?? []).filter((attribute) => attribute.type === 'select').length;

  if (categoriesLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="ویژگی‌های دسته‌بندی" description="مدیریت ویژگی‌های قابل تعریف برای هر دسته‌بندی محصول" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[104px] animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="space-y-6">
        <PageHeader title="ویژگی‌های دسته‌بندی" />
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(239,68,68,0.10)] text-red-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-fg">خطا در بارگذاری دسته‌بندی‌ها</p>
            <p className="mt-1 text-sm text-muted">اتصال به سرور برقرار نشد. دوباره تلاش کنید.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchCategories()}>
            تلاش دوباره
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ویژگی‌های دسته‌بندی"
        description="برای هر دسته‌بندی، ویژگی‌های سفارشی مثل رنگ، سایز یا حجم تعریف کنید."
        actions={
          <>
            <Link to="/categories" className="w-full md:w-auto">
              <Button variant="outline" size="md" className="w-full md:w-auto">
                بازگشت به دسته‌بندی‌ها
              </Button>
            </Link>
            {canCreate && (
              <Button
                variant="primary"
                size="md"
                className="w-full md:w-auto"
                onClick={openCreateModal}
                disabled={!selectedCategoryId}
              >
                افزودن ویژگی
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="دسته‌بندی‌ها"
          value={categories?.length ?? 0}
          color="primary"
          hint="دسته‌بندی قابل انتخاب"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          }
        />
        <StatCard
          label="ویژگی‌های دسته انتخابی"
          value={attributes?.length ?? 0}
          color="secondary"
          hint={selectedCategory ? selectedCategory.name : 'دسته‌ای انتخاب نشده'}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h10M4 18h7" />
            </svg>
          }
        />
        <StatCard
          label="اجباری / لیستی"
          value={`${requiredCount.toLocaleString('fa-IR')} / ${selectCount.toLocaleString('fa-IR')}`}
          color="accent"
          hint="ویژگی‌های اجباری و لیست انتخاب"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to shadow-lg shadow-black/10 dark:shadow-black/30">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-bold text-fg">انتخاب دسته‌بندی</h2>
            <p className="mt-0.5 text-xs text-muted">ویژگی‌های هر دسته‌بندی جداگانه مدیریت می‌شود.</p>
          </div>
          <div className="group relative w-full md:max-w-xs">
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={categorySearch}
              onChange={(event) => setCategorySearch(event.target.value)}
              placeholder="جستجوی دسته‌بندی..."
              className="h-10 w-full rounded-xl border border-border bg-surface pr-10 pl-3 text-sm text-fg outline-none transition-all placeholder:text-muted focus:border-primary focus:shadow-[0_0_0_3px_rgb(var(--primary-rgb)/0.16)]"
            />
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-4">
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-muted-soft">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-fg-soft">دسته‌بندی‌ای یافت نشد</p>
                <p className="mt-1 text-xs text-muted">
                  {categories?.length ? 'عبارت جستجو را تغییر دهید.' : 'ابتدا از بخش دسته‌بندی‌ها یک دسته بسازید.'}
                </p>
              </div>
              {!categories?.length && (
                <Link to="/categories/add">
                  <Button variant="outline" size="sm">ساخت دسته‌بندی</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((category) => {
                const isSelected = selectedCategoryId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    aria-pressed={isSelected}
                    className={`group flex items-center justify-between gap-3 rounded-xl border p-3.5 text-right transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-[rgb(var(--primary-rgb)/0.10)] shadow-[0_0_0_3px_var(--ring-primary)]'
                        : 'border-border bg-surface hover:border-muted-soft hover:shadow-md hover:shadow-black/10 dark:hover:shadow-black/30'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className={`truncate text-sm font-semibold ${isSelected ? 'text-primary' : 'text-fg'}`}>
                        {category.name}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-muted" dir="ltr">
                        /{category.slug}
                      </div>
                    </div>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isSelected ? 'bg-primary text-white' : 'bg-surface-2 text-muted-soft group-hover:text-fg'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedCategoryId ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to px-5 py-4 shadow-lg shadow-black/10 sm:flex-row sm:items-center sm:justify-between dark:shadow-black/30">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-fg">
                ویژگی‌های «{selectedCategory?.name ?? 'دسته انتخاب‌شده'}»
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                {(attributes?.length ?? 0).toLocaleString('fa-IR')} ویژگی برای این دسته تعریف شده است.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategoryId(null)}>
                تغییر دسته‌بندی
              </Button>
              <Button variant="primary" size="sm" onClick={openCreateModal}>
                افزودن ویژگی
              </Button>
            </div>
          </div>

          {!canView ? (
            <div className="rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to p-8 text-center shadow-xl shadow-black/10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-muted mx-auto mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 12a3 3 0 11-6 0" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-fg">عدم دسترسی به مشاهده ویژگی‌ها</p>
              <p className="mt-1 text-sm text-muted-soft">شما دسترسی مشاهده لیست ویژگی‌ها را ندارید.</p>
            </div>
          ) : (
            <DataTable<CategoryAttribute>
              columns={attributeColumns}
              data={attributes ?? []}
              total={attributes?.length ?? 0}
              loading={attributesLoading}
              searchable
              searchPlaceholder="جستجوی ویژگی..."
              emptyMessage="برای این دسته‌بندی هنوز ویژگی‌ای تعریف نشده است"
              className={attributesFetching && !attributesLoading ? 'opacity-70 transition-opacity' : 'transition-opacity'}
            />
          )}
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-muted-soft">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-fg">دسته‌بندی را انتخاب کنید</p>
            <p className="mt-1 text-xs text-muted">پس از انتخاب، ویژگی‌های همان دسته در این بخش نمایش داده می‌شود.</p>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title={editingAttributeId ? 'ویرایش ویژگی' : 'افزودن ویژگی'}
        size="lg"
      >
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5" noValidate>
          <Input
            name="name"
            label="نام ویژگی"
            placeholder="مثلاً رنگ"
            required
            methods={methods}
          />

          <CustomSelect
            label="نوع ویژگی"
            name="type"
            methods={methods}
            options={ATTRIBUTE_TYPES}
            required
          />

          {currentType === 'select' && (
            <div className="space-y-2 rounded-xl border border-border bg-surface-2 p-3.5">
              <label className="block text-xs font-medium text-muted">
                گزینه‌ها <span className="text-accent">*</span>
              </label>
              <textarea
                {...register('options')}
                rows={3}
                placeholder="قرمز، آبی، سبز"
                className={`field resize-y font-mono text-xs ${
                  errors.options ? 'border-[#f87171] focus:border-[#f87171]' : ''
                }`}
                dir="ltr"
              />
              {errors.options ? (
                <p className="text-xs font-medium text-[#f87171]">{errors.options.message}</p>
              ) : (
                <p className="text-[11px] text-muted">
                  گزینه‌ها را با کاما جدا کنید یا آرایه JSON وارد کنید.
                </p>
              )}

              {optionsPreview.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {optionsPreview.map((option) => (
                    <span
                      key={option}
                      className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-fg-soft"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Input
                name="sortOrder"
                label="ترتیب نمایش"
                type="number"
                placeholder="0"
                methods={methods}
              />
            </div>

            <div className="flex items-end">
              <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 transition-colors hover:border-border-strong">
                <input
                  type="checkbox"
                  {...register('isRequired')}
                  className="h-4 w-4 rounded border-border text-primary accent-[rgb(var(--primary-rgb))] focus:ring-primary"
                />
                <span className="text-sm text-fg-soft">
                  پر کردن این ویژگی روی محصول اجباری است
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              type="button"
              className="w-full sm:w-auto"
              onClick={closeModal}
              disabled={isSaving}
            >
              لغو
            </Button>
            <Button type="submit" className="w-full sm:w-auto" isLoading={isSaving}>
              {editingAttributeId ? 'ذخیره تغییرات' : 'افزودن ویژگی'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف ویژگی" size="sm">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(239,68,68,0.10)] text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm leading-6 text-muted">
              ویژگی «<span className="font-semibold text-fg">{deleteTarget?.name}</span>» از این دسته‌بندی حذف می‌شود.
              مقدارهای ثبت‌شده روی محصولات ممکن است از دست بروند.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => setDeleteTarget(null)}>
              انصراف
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="w-full sm:w-auto"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              حذف ویژگی
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
