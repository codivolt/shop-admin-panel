import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import Button from '../../components/button/Button';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import DataTable, { type Column } from '../../components/table/DataTable';
import StatCard from '../../components/stats/StatCard';
import StatGrid from '../../components/stats/StatGrid';
import Modal from '../../components/layout/Modal';
import Breadcrumb from '../../components/layout/Breadcrumb';
import PageHeader from '../../components/layout/PageHeader';
import AccessDenied from '../../components/layout/AccessDenied';
import { useAppSelector } from '../../hooks/useRedux';
import { PERMISSIONS } from '../../constants';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: 'customer' | 'admin' | 'super_admin' | 'courier';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const search = searchInput.trim();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['users', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/users', { params: { page, limit, search } });
      return res.data;
    },
  });

  const users: User[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const adminCount = users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length;
  const customerCount = users.length - adminCount;

  const fullName = (user: User) =>
    [user.firstName, user.lastName].filter(Boolean).join(' ') || 'بدون نام';

  const roleLabel: Record<string, string> = {
    customer: 'مشتری',
    admin: 'مدیر',
    super_admin: 'مدیر فوق العاده',
    courier: 'پیک',
  };
  const roleBadge: Record<string, string> = {
    customer: 'bg-surface-2 text-muted',
    admin: 'bg-[rgb(var(--primary-rgb)/0.12)] text-primary',
    super_admin: 'bg-[rgb(var(--primary-rgb)/0.12)] text-primary',
    courier: 'bg-[rgb(var(--primary-rgb)/0.12)] text-primary',
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('کاربر با موفقیت حذف شد');
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف کاربر');
    },
  });

  const { user } = useAppSelector((state: any) => state.auth);
  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'super_admin';
  const canView = isSuperAdmin || permissions.includes(PERMISSIONS.USERS_VIEW);
  const canUpdate = isSuperAdmin || permissions.includes(PERMISSIONS.USERS_UPDATE);
  const canDelete = isSuperAdmin || permissions.includes(PERMISSIONS.USERS_DELETE);
  const canCreate = isSuperAdmin || permissions.includes(PERMISSIONS.USERS_CREATE);

  const columns: Column<User>[] = useMemo(
    () => [
      {
        key: 'email',
        label: 'کاربر',
        sortable: true,
        width: '32%',
        render: (_value, row) => (
          <div className="flex items-center gap-3">
            {row.avatarUrl ? (
              <img
                src={row.avatarUrl}
                alt={fullName(row)}
                className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fg-soft to-fg text-xs font-bold text-surface">
                {(row.firstName || row.email).charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate font-medium text-fg">{fullName(row)}</div>
              <div className="truncate text-[11px] text-muted" dir="ltr">
                {row.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'phone',
        label: 'تلفن',
        width: '16%',
        render: (value: string | null) => (
          <span className="font-mono text-[11px] text-muted" dir="ltr">
            {value || '—'}
          </span>
        ),
      },
      {
        key: 'role',
        label: 'نقش',
        width: '12%',
        align: 'center',
        render: (value: string) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              roleBadge[value] || 'bg-surface-2 text-muted'
            }`}
          >
            {roleLabel[value] || value}
          </span>
        ),
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
        render: (_value, row) => {
          const isLastAdmin = row.role === 'admin' && adminCount === 1;
          return (
            <div className="flex items-center justify-center gap-1.5">
              {canView && (
                <Link
                  to={`/users/${row.id}`}
                  title="مشاهده پروفایل"
                  aria-label={`مشاهده ${fullName(row)}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 dark:shadow-black/30 transition-all hover:text-fg active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </Link>
              )}
              {canUpdate && (
                <Link
                  to={`/users/${row.id}/edit`}
                  title="ویرایش"
                  aria-label={`ویرایش ${fullName(row)}`}
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
                  disabled={isLastAdmin}
                  title={isLastAdmin ? 'تنها مدیر سیستم قابل حذف نیست' : 'حذف'}
                  aria-label={`حذف ${fullName(row)}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 dark:shadow-black/30 transition-all hover:text-secondary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [adminCount]
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
            <p className="font-semibold text-fg">خطا در بارگذاری کاربران</p>
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
        title="کاربران"
        description="حساب‌های کاربری فروشگاه، نقش‌ها و وضعیت دسترسی آن‌ها را مدیریت کنید."
        actions={
      <>
        {canCreate && (
          <Button variant="primary" size="md" className="w-full md:w-auto" onClick={() => navigate('/users/add')}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            افزودن کاربر
          </Button>
        )}
      </>
    }
      />

      {/* Stats */}
      <StatGrid cols={3}>
        <StatCard
          label="کل کاربران"
          value={total}
          color="primary"
          hint="در همه صفحات"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          }
        />
        <StatCard
          label="مدیران"
          value={adminCount}
          color="secondary"
          hint="در صفحه جاری"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15a4 4 0 100-8 4 4 0 000 8zm0 0c-3.314 0-6 2.239-6 5v1h12v-1c0-2.761-2.686-5-6-5z" />
            </svg>
          }
        />
        <StatCard
          label="مشتریان"
          value={customerCount}
          color="accent"
          hint="در صفحه جاری"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm12 10v-2a4 4 0 00-3-3.87" />
            </svg>
          }
        />
      </StatGrid>

      {/* Table */}
      {!canView ? (
        <AccessDenied resource="کاربران" />
      ) : (
        <DataTable<User>
          columns={columns}
          data={users}
          total={total}
          page={page}
          limit={limit}
          totalPages={data?.totalPages ?? 1}
          loading={isLoading}
          searchable
          searchPlaceholder="جستجوی نام، ایمیل یا تلفن…"
          onSearch={(value) => setSearchInput(value)}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          emptyMessage="هیچ کاربری یافت نشد"
          className={isFetching && !isLoading ? 'opacity-70 transition-opacity' : 'transition-opacity'}
        />
      )}

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف کاربر" size="sm">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(239,68,68,0.10)] text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm leading-6 text-muted">
              حساب{' '}
              <span className="font-semibold text-fg">
                «{deleteTarget ? fullName(deleteTarget) : ''}»
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
              حذف کاربر
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
