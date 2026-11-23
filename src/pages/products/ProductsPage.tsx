import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import Button from '../../components/button/Button';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import DataTable, { type Column } from '../../components/table/DataTable';
import StatCard from '../../components/stats/StatCard';
import Modal from '../../components/layout/Modal';
import Breadcrumb from '../../components/layout/Breadcrumb';
import PageHeader from '../../components/layout/PageHeader';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useAppSelector } from '../../hooks/useRedux';
import { PERMISSIONS } from '../../constants';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string;
  categoryName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const formatPrice = (value: number) =>
  `${Number(value || 0).toLocaleString('fa-IR')} تومان`;

function StockBadge({ stock }: { stock: number }) {
  const tone =
    stock <= 0
      ? { cls: 'bg-[rgba(239,68,68,0.12)] text-red-400', dot: 'bg-red-400', label: 'ناموجود' }
      : stock <= 5
        ? { cls: 'bg-[rgba(245,158,11,0.12)] text-amber-400', dot: 'bg-amber-400', label: 'کم‌موجود' }
        : { cls: 'bg-[rgba(16,185,129,0.12)] text-emerald-400', dot: 'bg-emerald-400', label: 'موجود' };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {tone.label} · {stock.toLocaleString('fa-IR')}
    </span>
  );
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput);
  const search = debouncedSearch.trim();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['products', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/products', { params: { page, limit, search } });
      return res.data;
    },
  });

  const products: Product[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const activeCount = products.filter((p) => p.isActive).length;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('محصول با موفقیت حذف شد');
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف محصول');
    },
  });

  const { user } = useAppSelector((state: any) => state.auth);
  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'super_admin';
  const canView = isSuperAdmin || permissions.includes(PERMISSIONS.PRODUCTS_VIEW);
  const canUpdate = isSuperAdmin || permissions.includes(PERMISSIONS.PRODUCTS_UPDATE);
  const canDelete = isSuperAdmin || permissions.includes(PERMISSIONS.PRODUCTS_DELETE);
  const canCreate = isSuperAdmin || permissions.includes(PERMISSIONS.PRODUCTS_CREATE);

  const columns: Column<Product>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'محصول',
        sortable: true,
        width: '34%',
        render: (_value, row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 dark:shadow-black/30">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-fg">{row.name}</div>
              <div className="truncate text-[11px] text-muted">
                {row.categoryName || row.slug || '—'}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'price',
        label: 'قیمت',
        width: '22%',
        align: 'right',
        render: (value: number) => (
          <span className="font-medium text-fg">{formatPrice(value)}</span>
        ),
      },
      {
        key: 'stock',
        label: 'موجودی',
        width: '16%',
        align: 'center',
        render: (value: number) => <StockBadge stock={Number(value) || 0} />,
      },
      {
        key: 'isActive',
        label: 'وضعیت',
        width: '12%',
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
        width: '16%',
        align: 'center',
        render: (_value, row) => (
          <div className="flex items-center justify-center gap-1.5">
            {canUpdate && (
              <Link
                to={`/products/${row.id}/edit`}
                title="ویرایش"
                aria-label={`ویرایش ${row.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 dark:shadow-black/30 transition-all hover:text-primary active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => setDeleteTarget(row)}
                title="حذف"
                aria-label={`حذف ${row.name}`}
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
    []
  );

  if (error) {
    return (
      <div className="space-y-4">
        <Breadcrumb />
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(239,68,68,0.10)] text-red-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-fg">خطا در بارگذاری محصولات</p>
            <p className="mt-1 text-sm text-muted">اتصال به سرور برقرار نشد. دوباره تلاش کنید.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            تلاش دوباره
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="محصولات"
        description="کاتالوگ محصولات فروشگاه را مدیریت کنید؛ قیمت، موجودی و وضعیت نمایش هر محصول."
        actions={
      <>
        {canCreate && (
          <Button variant="primary" size="md" className="w-full md:w-auto" onClick={() => navigate('/products/add')}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v16m8-8H4" />
            </svg>
            افزودن محصول
          </Button>
        )}
      </>
    }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="کل محصولات"
          value={total}
          color="primary"
          hint="در همه صفحات"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label="فعال"
          value={activeCount}
          color="secondary"
          hint="در صفحه جاری"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="کم‌موجود / ناموجود"
          value={lowStockCount}
          color="accent"
          hint="موجودی ۵ یا کمتر در این صفحه"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* Table */}
      {!canView ? (
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to p-8 text-center shadow-xl shadow-black/10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-muted mx-auto mb-4">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 12a3 3 0 11-6 0" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-fg">عدم دسترسی به مشاهده محصولات</p>
          <p className="mt-1 text-sm text-muted-soft">شما دسترسی مشاهده لیست محصولات را ندارید.</p>
        </div>
      ) : (
        <DataTable<Product>
          columns={columns}
          data={products}
          total={total}
          page={page}
          limit={limit}
          totalPages={data?.totalPages ?? 1}
          loading={isLoading}
          searchable
          searchPlaceholder="جستجوی نام یا نامک محصول…"
          onSearch={(value) => setSearchInput(value)}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          emptyMessage="هیچ محصولی یافت نشد"
          className={isFetching && !isLoading ? 'opacity-70 transition-opacity' : 'transition-opacity'}
        />
      )}

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
              محصول <span className="font-semibold text-fg">«{deleteTarget?.name}»</span> برای
              همیشه حذف می‌شود. این عمل قابل بازگشت نیست.
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
