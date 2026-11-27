import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import Button from '../../components/button/Button';
import { Link, useNavigate } from 'react-router-dom';
import DataTable, { type Column } from '../../components/table/DataTable';
import StatCard from '../../components/stats/StatCard';
import Breadcrumb from '../../components/layout/Breadcrumb';
import PageHeader from '../../components/layout/PageHeader';
import { useAppSelector } from '../../hooks/useRedux';
import { PERMISSIONS } from '../../constants';

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

export default function BrandsPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const search = searchInput.trim();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['brands', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/brands', { params: { page, limit, search } });
      return res.data;
    },
  });

  const brands: Brand[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const activeCount = brands.filter((b) => b.isActive).length;
  const inactiveCount = brands.length - activeCount;

  const { user } = useAppSelector((state: any) => state.auth);
  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'super_admin';
  const canView = isSuperAdmin || permissions.includes(PERMISSIONS.BRANDS_VIEW);
  const canUpdate = isSuperAdmin || permissions.includes(PERMISSIONS.BRANDS_UPDATE);
  const canCreate = isSuperAdmin || permissions.includes(PERMISSIONS.BRANDS_CREATE);

  const columns: Column<Brand>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'نام برند',
        sortable: true,
        width: '32%',
        render: (_value, row) => (
          <div className="flex items-center gap-3">
            {row.logo ? (
              <img
                src={row.logo}
                alt={row.name}
                className="h-9 w-9 shrink-0 rounded-xl border border-border bg-surface-2 object-contain p-1"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-card-from to-card-to text-xs font-bold text-fg-soft shadow-md shadow-black/10 dark:shadow-black/30">
                {row.name?.charAt(0) || '؟'}
              </div>
            )}
            <span className="truncate font-medium text-fg">{row.name}</span>
          </div>
        ),
      },
      {
        key: 'slug',
        label: 'نامک (Slug)',
        sortable: true,
        width: '20%',
        render: (value: string) => (
          <code className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted" dir="ltr">
            {value || '-'}
          </code>
        ),
      },
      {
        key: 'description',
        label: 'توضیحات',
        width: '26%',
        render: (value: string | null) => (
          <span className="block max-w-[20rem] truncate text-muted" title={value || undefined}>
            {value || '—'}
          </span>
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
        width: '12%',
        align: 'center',
        render: (_value, row) => (
          <div className="flex items-center justify-center gap-1.5">
            {canUpdate && (
              <Link
                to={`/brands/${row.id}/edit`}
                title="ویرایش"
                aria-label={`ویرایش ${row.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 dark:shadow-black/30 transition-all hover:text-primary active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
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
            <p className="font-semibold text-fg">خطا در بارگذاری برندها</p>
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
        title="برندها"
        description="برندهای فروشگاه را مدیریت کنید و برای هر کدام لوگو و وضعیت نمایش تعیین کنید."
        actions={
      <>
        {canCreate && (
          <Button variant="primary" size="md" className="w-full md:w-auto" onClick={() => navigate('/brands/add')}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v16m8-8H4" />
            </svg>
            افزودن برند
          </Button>
        )}
      </>
    }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="کل برندها"
          value={total}
          color="primary"
          hint="در همه صفحات"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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
          label="غیرفعال"
          value={inactiveCount}
          color="accent"
          hint="در صفحه جاری"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
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
          <p className="text-lg font-semibold text-fg">عدم دسترسی به مشاهده برندها</p>
          <p className="mt-1 text-sm text-muted-soft">شما دسترسی مشاهده لیست برندها را ندارید.</p>
        </div>
      ) : (
        <DataTable<Brand>
          columns={columns}
          data={brands}
          total={total}
          page={page}
          limit={limit}
          totalPages={data?.totalPages ?? 1}
          loading={isLoading}
          searchable
          searchPlaceholder="جستجوی برند…"
          onSearch={(value) => setSearchInput(value)}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          emptyMessage="هیچ برندی یافت نشد"
          className={isFetching && !isLoading ? 'opacity-70 transition-opacity' : 'transition-opacity'}
        />
      )}
    </div>
  );
}
