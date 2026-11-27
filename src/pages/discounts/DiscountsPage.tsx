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
import JalaliDatePicker from '../../components/input/JalaliDatePicker';
import Select from '../../components/form/Select';

interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser: number;
  usedCount: number;
  expiresAt?: string;
  status: 'active' | 'inactive' | 'expired' | 'used_up';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateDiscountData {
  code: string;
  description?: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  expiresAt?: string;
  isActive?: boolean;
}

interface DiscountStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  usedUp: number;
}

export default function DiscountsPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const search = searchInput.trim();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<DiscountCode | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [form, setForm] = useState<CreateDiscountData>({
    code: '',
    description: '',
    type: 'percent',
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    usageLimitPerUser: 1,
    expiresAt: '',
    isActive: true,
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const { data: discounts, isLoading } = useQuery({
    queryKey: ['discounts', page, limit, search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/discounts', { params: { page, limit, search, status: statusFilter || undefined } });
      return res.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['discount-stats'],
    queryFn: async () => {
      const res = await api.get('/discounts/stats');
      return res.data as DiscountStats;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateDiscountData) => {
      const res = await api.post('/discounts', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('کد تخفیف با موفقیت ایجاد شد');
      setModalOpen(false);
      setEditingDiscount(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discount-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد کد تخفیف');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateDiscountData }) => {
      const res = await api.put(`/discounts/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('کد تخفیف با موفقیت بروزرسانی شد');
      setModalOpen(false);
      setEditingDiscount(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discount-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی کد تخفیف');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/discounts/${id}`);
    },
    onSuccess: () => {
      toast.success('کد تخفیف با موفقیت حذف شد');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discount-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف کد تخفیف');
    },
  });

  const resetForm = () => {
    setForm({
      code: '',
      description: '',
      type: 'percent',
      value: 0,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      usageLimit: 0,
      usageLimitPerUser: 1,
      expiresAt: '',
      isActive: true,
    });
  };

  const handleOpenCreate = () => {
    setEditingDiscount(null);
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setForm({
      code: discount.code,
      description: discount.description || '',
      type: discount.type,
      value: discount.value,
      minOrderAmount: discount.minOrderAmount || 0,
      maxDiscountAmount: discount.maxDiscountAmount || 0,
      usageLimit: discount.usageLimit || 0,
      usageLimitPerUser: discount.usageLimitPerUser,
      expiresAt: discount.expiresAt ? discount.expiresAt.split('T')[0] : '',
      isActive: discount.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      code: form.code.toUpperCase(),
      minOrderAmount: form.minOrderAmount || undefined,
      maxDiscountAmount: form.maxDiscountAmount || undefined,
      usageLimit: form.usageLimit || undefined,
      expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59` : undefined,
    };

    if (editingDiscount) {
      updateMutation.mutate({ id: editingDiscount.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const { user } = useAppSelector((state: any) => state.auth);
  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'super_admin';
  const canView = isSuperAdmin || permissions.includes(PERMISSIONS.PRODUCTS_VIEW);
  const canCreate = isSuperAdmin || permissions.includes(PERMISSIONS.PRODUCTS_CREATE);
  const canUpdate = isSuperAdmin || permissions.includes(PERMISSIONS.PRODUCTS_UPDATE);
  const canDelete = isSuperAdmin || permissions.includes(PERMISSIONS.PRODUCTS_DELETE);

  const typeLabels: Record<string, string> = {
    percent: 'درصدی',
    fixed: 'مبلغ ثابت',
  };
  const typeBadges: Record<string, string> = {
    percent: 'bg-[rgb(var(--primary-rgb)/0.12)] text-primary',
    fixed: 'bg-[rgb(var(--secondary-rgb)/0.12)] text-secondary',
  };

  const statusLabels: Record<string, string> = {
    active: 'فعال',
    inactive: 'غیرفعال',
    expired: 'منقضی',
    used_up: 'تمام شده',
  };
  const statusBadges: Record<string, string> = {
    active: 'bg-[rgba(16,185,129,0.12)] text-emerald-400',
    inactive: 'bg-surface-2 text-muted',
    expired: 'bg-[rgba(239,68,68,0.12)] text-red-400',
    used_up: 'bg-[rgba(245,158,11,0.12)] text-amber-400',
  };

  const columns: Column<DiscountCode>[] = useMemo(
    () => [
      {
        key: 'code',
        label: 'کد تخفیف',
        width: '15%',
        render: (value: string) => (
          <span className="font-mono text-base font-medium text-stone-900 tracking-wider">{value}</span>
        ),
      },
      {
        key: 'description',
        label: 'توضیحات',
        width: '20%',
        render: (value: string | undefined) => value || '—',
      },
      {
        key: 'type',
        label: 'نوع',
        width: '12%',
        align: 'center',
        render: (value: string) => (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${typeBadges[value]}`}>
            {typeLabels[value] || value}
          </span>
        ),
      },
      {
        key: 'value',
        label: 'مقدار',
        width: '12%',
        align: 'center',
        render: (value: number, row: DiscountCode) => (
          <span className="font-mono font-semibold">{row.type === 'percent' ? `${value}%` : `${value.toLocaleString()} تومان`}</span>
        ),
      },
      {
        key: 'usage',
        label: 'استفاده',
        width: '12%',
        align: 'center',
        render: (_v, row: DiscountCode) => (
          <span className="font-mono text-sm">
            {row.usedCount} / {row.usageLimit ? row.usageLimit.toLocaleString() : '∞'}
          </span>
        ),
      },
      {
        key: 'expiresAt',
        label: 'انقضا',
        width: '12%',
        align: 'center',
        render: (value: string | undefined) => (
          value ? new Date(value).toLocaleDateString('fa-IR') : 'بدون انقضا'
        ),
      },
      {
        key: 'status',
        label: 'وضعیت',
        width: '10%',
        align: 'center',
        render: (value: string) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadges[value]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${value === 'active' ? 'bg-emerald-400' : value === 'expired' ? 'bg-red-400' : value === 'used_up' ? 'bg-amber-400' : 'bg-muted-soft'}`} />
            {statusLabels[value] || value}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'عملیات',
        width: '10%',
        align: 'center',
        render: (_value: unknown, row: DiscountCode) => (
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
          <p className="text-lg font-semibold text-fg">عدم دسترسی به کدهای تخفیف</p>
          <p className="mt-1 text-sm text-muted-soft">شما دسترسی مشاهده این بخش را ندارید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="کدهای تخفیف"
        description="ایجاد و مدیریت کدهای تخفیف درصدی و مبلغ ثابت"
        actions={
          <>
            {canCreate && (
              <Button variant="primary" size="md" className="w-full md:w-auto" onClick={handleOpenCreate}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                افزودن کد تخفیف
              </Button>
            )}
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <StatCard
          label="کل کدها"
          value={stats?.total ?? 0}
          color="primary"
          hint="تعداد کل کدهای تخفیف"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          }
        />
        <StatCard
          label="فعال"
          value={stats?.active ?? 0}
          color="secondary"
          hint="کدهای تخفیف فعال"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <StatCard
          label="غیرفعال"
          value={stats?.inactive ?? 0}
          color="neutral"
          hint="کدهای تخفیف غیرفعال"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
        />
        <StatCard
          label="منقضی"
          value={stats?.expired ?? 0}
          color="accent"
          hint="کدهای منقضی شده"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="تمام شده"
          value={stats?.usedUp ?? 0}
          color="neutral"
          hint="کدهای به حد استفاده رسیده"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select
          name="status-filter"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
          <option value="expired">منقضی</option>
          <option value="used_up">تمام شده</option>
        </Select>
      </div>

      {/* Table */}
      <DataTable<DiscountCode>
        columns={columns}
        data={discounts?.data ?? []}
        total={discounts?.total ?? 0}
        page={page}
        limit={limit}
        totalPages={discounts?.totalPages ?? 1}
        loading={isLoading}
        searchable
        searchPlaceholder="جستجوی کد یا توضیحات…"
        onSearch={(value) => setSearchInput(value)}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
        emptyMessage="هیچ کد تخفیفی یافت نشد"
        className="bg-card"
      />

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingDiscount(null); resetForm(); }} title={editingDiscount ? 'ویرایش کد تخفیف' : 'افزودن کد تخفیف'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="code"
              label="کد تخفیف *"
              placeholder="مثال: SAVE20"
              value={form.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
              maxLength={50}
            />
            <Select
              name="type"
              value={form.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })}
              label="نوع تخفیف *"
            >
              <option value="percent">درصدی (%)</option>
              <option value="fixed">مبلغ ثابت (تومان)</option>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="value"
              label="مقدار تخفیف *"
              type="number"
              value={String(form.value)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, value: parseInt(e.target.value) || 0 })}
              required
            />
            <Input
              name="usageLimitPerUser"
              label="محدودیت برای هر کاربر"
              type="number"
              value={String(form.usageLimitPerUser)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, usageLimitPerUser: parseInt(e.target.value) || 1 })}
            />
          </div>

          <Input
            name="description"
            label="توضیحات"
            placeholder="توضیحات کد تخفیف..."
            value={form.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AmountInput
              name="minOrderAmount"
              label="حداقل مبلغ سفارش (تومان)"
              value={form.minOrderAmount}
              onChange={(value) => setForm({ ...form, minOrderAmount: value })}
            />
            <AmountInput
              name="maxDiscountAmount"
              label="حداکثر مبلغ تخفیف (برای درصدی) (تومان)"
              value={form.maxDiscountAmount}
              onChange={(value) => setForm({ ...form, maxDiscountAmount: value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="usageLimit"
              label="محدودیت تعداد استفاده کل"
              type="number"
              value={String(form.usageLimit || '')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })}
            />
            <JalaliDatePicker
              label="تاریخ انقضا"
              value={form.expiresAt}
              onChange={(value) => setForm({ ...form, expiresAt: value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="discount-is-active"
              checked={form.isActive}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="discount-is-active" className="text-sm text-fg cursor-pointer">
              فعال
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => { setModalOpen(false); setEditingDiscount(null); resetForm(); }}>
              انصراف
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingDiscount ? 'ذخیره تغییرات' : 'افزودن کد'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف کد تخفیف" size="sm">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(239,68,68,0.10)] text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm leading-6 text-muted">
              کد تخفیف{' '}
              <span className="font-semibold text-fg">
                «{deleteTarget?.code}»
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
              حذف کد
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}