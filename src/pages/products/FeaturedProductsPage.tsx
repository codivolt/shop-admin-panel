import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import Button from '../../components/button/Button';
import toast from 'react-hot-toast';
import DataTable, { type Column } from '../../components/table/DataTable';
import StatCard from '../../components/stats/StatCard';
import Modal from '../../components/layout/Modal';
import Breadcrumb from '../../components/layout/Breadcrumb';
import PageHeader from '../../components/layout/PageHeader';
import { useAppSelector } from '../../hooks/useRedux';
import { PERMISSIONS } from '../../constants';
import Input from '../../components/input/Input';
import AmountInput from '../../components/input/AmountInput';
import Select from '../../components/form/Select';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  brandId?: string;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  images?: Array<{ id: string; imageUrl: string; isPrimary: boolean }>;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function FeaturedProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const search = searchInput.trim();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [featuredFilter, setFeaturedFilter] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    sku: '',
    imageUrl: '',
    isActive: true,
    isFeatured: false,
    categoryId: '',
    brandId: '',
  });
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    setPage(1);
  }, [search, featuredFilter]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', page, limit, search, featuredFilter],
    queryFn: async () => {
      const res = await api.get('/products', { 
        params: { 
          page, 
          limit, 
          search, 
          isFeatured: featuredFilter === 'true' ? true : featuredFilter === 'false' ? false : undefined 
        } 
      });
      return (res.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 1 }) as PaginatedResponse<Product>;
    },
  });

  const { data: cats } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { limit: 1000 } });
      return (res.data?.data ?? []) as Array<{ id: string; name: string }>;
    },
  });

  useEffect(() => {
    if (cats) setCategories(cats);
  }, [cats]);

  const { data: brandsData } = useQuery({
    queryKey: ['brands-all'],
    queryFn: async () => {
      const res = await api.get('/brands', { params: { limit: 1000 } });
      return (res.data?.data ?? []) as Array<{ id: string; name: string }>;
    },
  });

  useEffect(() => {
    if (brandsData) setBrands(brandsData);
  }, [brandsData]);

  const featuredCount = products?.data?.filter(p => p.isFeatured).length ?? 0;
  const activeCount = products?.data?.filter(p => p.isActive).length ?? 0;

  const featuredMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const res = await api.put(`/products/${id}`, { isFeatured });
      return res.data;
    },
    onSuccess: () => {
      toast.success('وضعیت پیشنهادی بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const res = await api.put(`/products/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('محصول با موفقیت بروزرسانی شد');
      setModalOpen(false);
      setEditingProduct(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی محصول');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      toast.success('محصول با موفقیت حذف شد');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف محصول');
    },
  });

  const resetForm = () => {
    setForm({
      name: '',
      slug: '',
      description: '',
      price: 0,
      stock: 0,
      sku: '',
      imageUrl: '',
      isActive: true,
      isFeatured: false,
      categoryId: '',
      brandId: '',
    });
  };

  const handleToggleFeatured = (product: Product) => {
    featuredMutation.mutate({ id: product.id, isFeatured: !product.isFeatured });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      sku: product.sku || '',
      imageUrl: product.imageUrl || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      categoryId: product.categoryId,
      brandId: product.brandId || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: form });
    }
  };

  const { user } = useAppSelector((state: any) => state.auth);
  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'super_admin';
  const canView = isSuperAdmin || permissions.includes(PERMISSIONS.PRODUCTS_VIEW);
  const canUpdate = isSuperAdmin || permissions.includes(PERMISSIONS.PRODUCTS_UPDATE);
  const canDelete = isSuperAdmin || permissions.includes(PERMISSIONS.PRODUCTS_DELETE);

  const columns: Column<Product>[] = useMemo(
    () => [
      {
        key: 'image',
        label: 'تصویر',
        width: '10%',
        align: 'center',
        render: (_value: unknown, row: Product) => {
          const img = row.images?.[0]?.imageUrl || row.imageUrl;
          return img ? (
            <img 
              src={img} 
              alt={row.name} 
              className="h-12 w-12 object-cover rounded-lg" 
            />
          ) : (
            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-stone-100 text-stone-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          );
        },
      },
      {
        key: 'name',
        label: 'نام محصول',
        width: '25%',
        render: (value: string) => <span className="font-medium">{value}</span>,
      },
      {
        key: 'category',
        label: 'دسته‌بندی',
        width: '15%',
        render: (_value: unknown, row: Product) => row.category?.name || '—',
      },
      {
        key: 'price',
        label: 'قیمت',
        width: '12%',
        align: 'center',
        render: (value: number) => <span className="font-mono font-semibold">{value.toLocaleString()} تومان</span>,
      },
      {
        key: 'stock',
        label: 'موجودی',
        width: '10%',
        align: 'center',
        render: (value: number) => (
          <span className={`font-mono ${value === 0 ? 'text-red-500' : value < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {value}
          </span>
        ),
      },
      {
        key: 'isFeatured',
        label: 'پیشنهادی',
        width: '10%',
        align: 'center',
        render: (value: boolean) => (
          <button
            onClick={() => handleToggleFeatured({ id: '', isFeatured: value } as Product)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              value
                ? 'bg-[rgba(16,185,129,0.12)] text-emerald-400'
                : 'bg-surface-2 text-muted'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${value ? 'bg-emerald-400' : 'bg-muted-soft'}`} />
            {value ? 'بله' : 'خیر'}
          </button>
        ),
      },
      {
        key: 'isActive',
        label: 'وضعیت',
        width: '10%',
        align: 'center',
        render: (value: boolean) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              value
                ? 'bg-[rgba(16,185,129,0.12)] text-emerald-400'
                : 'bg-surface-2 text-muted'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${value ? 'bg-emerald-400' : 'bg-muted-soft'}`} />
            {value ? 'فعال' : 'غیرفعال'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'عملیات',
        width: '10%',
        align: 'center',
        render: (_value: unknown, row: Product) => (
          <div className="flex items-center justify-center gap-1.5">
            {canUpdate && (
              <button
                onClick={() => handleEdit(row)}
                title="ویرایش"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 dark:shadow-black/30 transition-all hover:text-primary active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setDeleteTarget(row)}
                title="حذف"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 dark:shadow-black/30 transition-all hover:text-secondary active:scale-95"
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
    [canUpdate, canDelete]
  );

  if (!canView) {
    return (
      <div className="space-y-4">
        <Breadcrumb />
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-muted">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 12a3 3 0 11-6 0" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-fg">عدم دسترسی به محصولات</p>
          <p className="mt-1 text-sm text-muted-soft">شما دسترسی مشاهده این بخش را ندارید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="محصولات پیشنهادی"
        description="مدیریت محصولات ویژه برای نمایش در اسلایدر صفحه اصلی"
        actions={
          <>
            {canUpdate && (
              <Button variant="primary" size="md" className="w-full md:w-auto" onClick={() => navigate('/products/add')}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                افزودن محصول
              </Button>
            )}
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          label="کل محصولات"
          value={products?.total ?? 0}
          color="primary"
          hint="تعداد کل"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          }
        />
        <StatCard
          label="پیشنهادی"
          value={featuredCount}
          color="secondary"
          hint="محصولات ویژه"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          }
        />
        <StatCard
          label="فعال"
          value={activeCount}
          color="accent"
          hint="محصولات فعال"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <StatCard
          label="غیرفعال"
          value={(products?.total ?? 0) - activeCount}
          color="neutral"
          hint="محصولات غیرفعال"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select
          name="featured-filter"
          value={featuredFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFeaturedFilter(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">همه</option>
          <option value="true">فقط پیشنهادی</option>
          <option value="false">فقط معمولی</option>
        </Select>
      </div>

      {/* Table */}
      <DataTable<Product>
        columns={columns}
        data={products?.data ?? []}
        total={products?.total ?? 0}
        page={page}
        limit={limit}
        totalPages={products?.totalPages ?? 1}
        loading={isLoading}
        searchable
        searchPlaceholder="جستجوی نام، SKU…"
        onSearch={(value) => setSearchInput(value)}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
        emptyMessage="هیچ محصولی یافت نشد"
        className="bg-card"
      />

      {/* Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingProduct(null); resetForm(); }} title={editingProduct ? 'ویرایش محصول' : 'افزودن محصول'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            label="نام محصول *"
            placeholder="نام محصول را وارد کنید"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              name="categoryId"
              label="دسته‌بندی *"
              value={form.categoryId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full"
              required
            >
              <option value="">دسته‌بندی را انتخاب کنید</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select
              name="brandId"
              value={form.brandId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, brandId: e.target.value })}
              className="w-full"
            >
              <option value="">بدون برند</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </div>

          <AmountInput
            name="price"
            label="قیمت (تومان) *"
            value={form.price}
            onChange={(value) => setForm({ ...form, price: value })}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="stock"
              label="موجودی"
              type="number"
              min="0"
              value={String(form.stock || 0)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
            />
            <Input
              name="sku"
              label="SKU"
              placeholder="کد محصول"
              value={form.sku}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, sku: e.target.value })}
            />
          </div>

          <Input
            name="imageUrl"
            label="لینک تصویر"
            placeholder="https://example.com/image.jpg"
            value={form.imageUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, imageUrl: e.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="form-is-active"
                checked={form.isActive}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="form-is-active" className="text-sm text-fg cursor-pointer">فعال</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="form-is-featured"
                checked={form.isFeatured}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, isFeatured: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="form-is-featured" className="text-sm text-fg cursor-pointer">پیشنهادی (ویژه)</label>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => { setModalOpen(false); setEditingProduct(null); resetForm(); }}>
              انصراف
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              isLoading={updateMutation.isPending}
            >
              {editingProduct ? 'ذخیره تغییرات' : 'افزودن محصول'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف محصول" size="sm">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(239,68,68,0.10)] text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm leading-6 text-muted">
              محصول{' '}
              <span className="font-semibold text-fg">
                «{deleteTarget?.name}»
              </span>{' '}
              برای همیشه حذف می‌شود. این عمل قابل بازگشت نیست.
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
              حذف محصول
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}