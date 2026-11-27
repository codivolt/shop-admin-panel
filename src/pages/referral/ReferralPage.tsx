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

interface ReferralStat {
  totalUsers: number;
  usersWithReferrals: number;
  totalReferrals: number;
  topReferrers: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    referralCode: string | null;
    referralCount: number;
  }>;
}

interface ReferralTier {
  id: string;
  minReferrals: number;
  discountPercent?: number;
  discountAmount?: number;
  name?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateTierData {
  minReferrals: number;
  discountPercent?: number;
  discountAmount?: number;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export default function ReferralPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const search = searchInput.trim();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<ReferralTier | null>(null);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<ReferralTier | null>(null);
  const [tierForm, setTierForm] = useState<CreateTierData>({
    minReferrals: 1,
    discountPercent: 0,
    discountAmount: 0,
    name: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    setPage(1);
  }, [search]);

  // Fetch referral stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: async () => {
      const res = await api.get('/users/referral/stats');
      return res.data as ReferralStat;
    },
  });

  // Fetch referral tiers
  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ['referral-tiers'],
    queryFn: async () => {
      const res = await api.get('/users/referral/tiers');
      return res.data as ReferralTier[];
    },
  });

  // Create tier mutation
  const createTierMutation = useMutation({
    mutationFn: async (data: CreateTierData) => {
      const res = await api.post('/users/referral/tiers', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('سطح رفرال با موفقیت ایجاد شد');
      setTierModalOpen(false);
      setEditingTier(null);
      resetTierForm();
      queryClient.invalidateQueries({ queryKey: ['referral-tiers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد سطح رفرال');
    },
  });

  // Update tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateTierData }) => {
      const res = await api.put(`/users/referral/tiers/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('سطح رفرال با موفقیت بروزرسانی شد');
      setTierModalOpen(false);
      setEditingTier(null);
      resetTierForm();
      queryClient.invalidateQueries({ queryKey: ['referral-tiers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی سطح رفرال');
    },
  });

  // Delete tier mutation
  const deleteTierMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/referral/tiers/${id}`);
    },
    onSuccess: () => {
      toast.success('سطح رفرال با موفقیت حذف شد');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['referral-tiers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف سطح رفرال');
    },
  });

  const resetTierForm = () => {
    setTierForm({
      minReferrals: 1,
      discountPercent: 0,
      discountAmount: 0,
      name: '',
      description: '',
      isActive: true,
    });
  };

  const handleOpenCreateTier = () => {
    setEditingTier(null);
    resetTierForm();
    setTierModalOpen(true);
  };

  const handleEditTier = (tier: ReferralTier) => {
    setEditingTier(tier);
    setTierForm({
      minReferrals: tier.minReferrals,
      discountPercent: tier.discountPercent || 0,
      discountAmount: tier.discountAmount || 0,
      name: tier.name || '',
      description: tier.description || '',
      isActive: tier.isActive,
    });
    setTierModalOpen(true);
  };

  const handleSubmitTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTier) {
      updateTierMutation.mutate({ id: editingTier.id, data: tierForm });
    } else {
      createTierMutation.mutate(tierForm);
    }
  };

  const { user } = useAppSelector((state: any) => state.auth);
  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'super_admin';
  const canView = isSuperAdmin || permissions.includes(PERMISSIONS.USERS_VIEW);
  const canCreate = isSuperAdmin || permissions.includes(PERMISSIONS.USERS_CREATE);
  const canUpdate = isSuperAdmin || permissions.includes(PERMISSIONS.USERS_UPDATE);
  const canDelete = isSuperAdmin || permissions.includes(PERMISSIONS.USERS_DELETE);

  const tierColumns: Column<ReferralTier>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'نام سطح',
        width: '20%',
        render: (value: string | undefined) => value || '—',
      },
      {
        key: 'minReferrals',
        label: 'حداقل رفرال',
        width: '15%',
        align: 'center',
        render: (value: number) => <span className="font-mono text-lg font-semibold">{value}</span>,
      },
      {
        key: 'discountPercent',
        label: 'درصد تخفیف',
        width: '15%',
        align: 'center',
        render: (value: number | undefined) => (value ? `${value}%` : '—'),
      },
      {
        key: 'discountAmount',
        label: 'مبلغ تخفیف',
        width: '15%',
        align: 'center',
        render: (value: number | undefined) => (value ? `${value.toLocaleString()} تومان` : '—'),
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
        width: '15%',
        align: 'center',
        render: (_value: unknown, row: ReferralTier) => (
          <div className="flex items-center justify-center gap-1.5">
            {canUpdate && (
              <button
                onClick={() => handleEditTier(row)}
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

  const fullName = (user: { firstName: string | null; lastName: string | null; email: string }) =>
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

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
          <p className="text-lg font-semibold text-fg">عدم دسترسی به مدیریت رفرال</p>
          <p className="mt-1 text-sm text-muted-soft">شما دسترسی مشاهده این بخش را ندارید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت رفرال"
        description="تنظیم سطوح رفرال، مشاهده آمار و مدیریت کاربران برتر"
        actions={
          <>
            {canCreate && (
              <Button variant="primary" size="md" className="w-full md:w-auto" onClick={handleOpenCreateTier}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                افزودن سطح رفرال
              </Button>
            )}
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          label="کل کاربران"
          value={stats?.totalUsers ?? 0}
          color="primary"
          hint="کل کاربران ثبت‌نام کرده"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          }
        />
        <StatCard
          label="کاربران با رفرال"
          value={stats?.usersWithReferrals ?? 0}
          color="secondary"
          hint="کاربرانی که با کد رفرال ثبت‌نام کرده‌اند"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm12 10v-2a4 4 0 00-3-3.87" />
            </svg>
          }
        />
        <StatCard
          label="کل رفرال‌ها"
          value={stats?.totalReferrals ?? 0}
          color="accent"
          hint="تعداد کل رفرال‌های موفق"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.82 13.82a1 1 0 011.415 0l3 3a1 1 0 01-1.414 1.415l-3-3a1 1 0 010-1.415z" />
              <path d="M2.39 12c0-4.418 2.52-8.104 6.002-9.67a4 4 0 012.496 1.19A7.972 7.972 0 0121.61 12c0 4.419-2.52 8.105-6.002 9.67a4 4 0 01-2.496-1.19 7.97 7.97 0 01-6.212 0z" />
            </svg>
          }
        />
        <StatCard
          label="سطوح رفرال"
          value={tiers?.length ?? 0}
          color="neutral"
          hint="تعداد سطوح تعریف شده"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21v-4M3 10v-4M3 4v4M12 21v-8M12 4v8M21 21v-4m0-11v4M21 4v4M6 3h12M6 21h12" />
            </svg>
          }
        />
      </div>

      {/* Top Referrers */}
      {stats && stats.topReferrers && stats.topReferrers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-fg">بهترین معرفین</h3>
          <DataTable<ReferralStat['topReferrers'][0]>
            columns={[
              {
                key: 'referralCode',
                label: 'کد رفرال',
                width: '15%',
                render: (value: string | null) => (
                  <span className="font-mono text-base font-medium text-stone-900 tracking-wider">{value || '—'}</span>
                ),
              },
              {
                key: 'name',
                label: 'نام کاربر',
                width: '25%',
                render: (_v, row) => fullName(row),
              },
              {
                key: 'email',
                label: 'ایمیل',
                width: '25%',
                render: (value: string) => <span className="text-[11px] text-muted" dir="ltr">{value}</span>,
              },
              {
                key: 'referralCount',
                label: 'تعداد رفرال',
                width: '15%',
                align: 'center',
                render: (value: number) => <span className="font-bold text-primary text-lg">{value}</span>,
              },
            ]}
            data={stats.topReferrers ?? []}
            total={stats.topReferrers?.length ?? 0}
            page={1}
            limit={10}
            totalPages={1}
            loading={statsLoading}
            className="bg-card"
          />
        </div>
      )}

      {/* Referral Tiers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-fg">سطوح رفرال</h3>
          {canCreate && (
            <Button variant="primary" size="sm" onClick={handleOpenCreateTier}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              افزودن سطح
            </Button>
          )}
        </div>
        <DataTable<ReferralTier>
          columns={tierColumns}
          data={tiers ?? []}
          total={tiers?.length ?? 0}
          page={page}
          limit={limit}
          totalPages={1}
          loading={tiersLoading}
          searchable
          searchPlaceholder="جستجوی نام سطح…"
          onSearch={(value) => setSearchInput(value)}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          emptyMessage="هیچ سطح رفرالی تعریف نشده است"
          className="bg-card"
        />
      </div>

      {/* Create/Edit Tier Modal */}
      <Modal open={tierModalOpen} onClose={() => { setTierModalOpen(false); setEditingTier(null); resetTierForm(); }} title={editingTier ? 'ویرایش سطح رفرال' : 'افزودن سطح رفرال'} size="lg">
        <form onSubmit={handleSubmitTier} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="tier-min-referrals"
              label="حداقل تعداد رفرال *"
              type="number"
              value={String(tierForm.minReferrals)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTierForm({ ...tierForm, minReferrals: parseInt(e.target.value) || 1 })}
              required
            />
            <Input
              name="tier-name"
              label="نام سطح"
              placeholder="مثال: نقره، طلا، الماس"
              value={tierForm.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTierForm({ ...tierForm, name: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="tier-discount-percent"
              label="درصد تخفیف (%)"
              type="number"
              value={String(tierForm.discountPercent || 0)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTierForm({ ...tierForm, discountPercent: parseInt(e.target.value) || 0 })}
            />
            <Input
              name="tier-discount-amount"
              label="مبلغ تخفیف ثابت (تومان)"
              type="number"
              value={String(tierForm.discountAmount || 0)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTierForm({ ...tierForm, discountAmount: parseInt(e.target.value) || 0 })}
            />
          </div>

          <Input
            name="tier-description"
            label="توضیحات"
            placeholder="توضیحات این سطح..."
            value={tierForm.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTierForm({ ...tierForm, description: e.target.value })}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="tier-is-active"
              checked={tierForm.isActive}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTierForm({ ...tierForm, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="tier-is-active" className="text-sm text-fg cursor-pointer">
              فعال
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => { setTierModalOpen(false); setEditingTier(null); resetTierForm(); }}>
              انصراف
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              isLoading={createTierMutation.isPending || updateTierMutation.isPending}
            >
              {editingTier ? 'ذخیره تغییرات' : 'افزودن سطح'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف سطح رفرال" size="sm">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(239,68,68,0.10)] text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm leading-6 text-muted">
              سطح رفرال{' '}
              <span className="font-semibold text-fg">
                «{deleteTarget?.name || `${deleteTarget?.minReferrals} رفرال`}»
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
              isLoading={deleteTierMutation.isPending}
              onClick={() => deleteTarget && deleteTierMutation.mutate(deleteTarget.id)}
            >
              حذف سطح
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}