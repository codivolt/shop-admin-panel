import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import Button from '../../components/button/Button';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import DataTable, { type Column } from '../../components/table/DataTable';
import Breadcrumb from '../../components/layout/Breadcrumb';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/layout/Modal';
import AmountInput from '../../components/input/AmountInput';
import { useAppSelector } from '../../hooks/useRedux';
import { PERMISSIONS } from '../../constants';

interface DeliveryMethod {
  id: string;
  name: string;
  price: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DeliveryPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<DeliveryMethod | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    price: string;
    description: string;
    isActive: boolean;
  }>({
    name: '',
    price: '',
    description: '',
    isActive: true,
  });

  const { user } = useAppSelector((state: any) => state.auth);
  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'super_admin';
  const canView = isSuperAdmin || permissions.includes(PERMISSIONS.DELIVERY_VIEW);
  const canCreate = isSuperAdmin || permissions.includes(PERMISSIONS.DELIVERY_CREATE);
  const canUpdate = isSuperAdmin || permissions.includes(PERMISSIONS.DELIVERY_UPDATE);
  const canDelete = isSuperAdmin || permissions.includes(PERMISSIONS.DELIVERY_DELETE);

  const { data, isLoading, error, refetch } = useQuery<DeliveryMethod[]>({
    queryKey: ['delivery'],
    queryFn: async () => {
      const res = await api.get('/delivery');
      // Handle different response structures
      return (res.data?.data ?? res.data ?? []) as DeliveryMethod[];
    },
  });

  const deliveryMethods: DeliveryMethod[] = Array.isArray(data) ? data : [];

  const createMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      price: number;
      description: string | null;
      isActive: boolean;
    }) => {
      const res = await api.post('/delivery', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery'] });
      toast.success('روش ارسال با موفقیت ایجاد شد');
      setOpenModal(false);
      setFormData({
        name: '',
        price: '',
        description: '',
        isActive: true,
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد روش ارسال');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.put(`/delivery/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery'] });
      toast.success('روش ارسال با موفقیت بروزرسانی شد');
      setOpenModal(false);
      setEditingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی روش ارسال');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/delivery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery'] });
      toast.success('روش ارسال با موفقیت حذف شد');
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف روش ارسال');
    },
  });

  useEffect(() => {
    if (editingId) {
      const item = deliveryMethods.find((d) => d.id === editingId);
      if (item) {
        setFormData({
          name: item.name,
          price: item.price.toString(),
          description: item.description ?? '',
          isActive: item.isActive,
        });
      }
    } else {
      setFormData({
        name: '',
        price: '',
        description: '',
        isActive: true,
      });
    }
  }, [editingId]);

  const columns: Column<DeliveryMethod>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'نام روش ارسال',
        sortable: true,
        width: '35%',
        render: (_value, row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 dark:shadow-black/30">
              <span className="text-xs font-bold text-fg-soft">
                {row.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-fg">{row.name}</div>
              <div className="text-[11px] text-muted-soft">
                {row.isActive ? 'فعال' : 'غیرفعال'}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'price',
        label: 'قیمت (تومان)',
        width: '20%',
        align: 'right',
        render: (value: number) => (
          <span className="font-mono text-[11px] text-fg" dir="ltr">
            {value.toLocaleString('fa-IR')}
          </span>
        ),
      },
      {
        key: 'description',
        label: 'توضیحات',
        width: '30%',
        render: (value: string | null) => (
          <span className="block max-w-[24rem] truncate text-muted" title={value || undefined}>
            {value || '—'}
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
        width: '13%',
        align: 'center',
        render: (_value, row) => (
          <div className="flex items-center justify-center gap-1.5">
            {canUpdate && (
              <Link
                to="#" // handled via click below
                onClick={(e) => {
                  e.preventDefault();
                  setEditingId(row.id);
                  setOpenModal(true);
                }}
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
    [canUpdate, canDelete]
  );

  if (!canView) {
    return (
      <div className="space-y-4">
        <Breadcrumb />
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to p-8 text-center shadow-xl shadow-black/10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-muted mx-auto mb-4">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 12a3 3 0 11-6 0" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-fg">عدم دسترسی به روش‌های ارسال</p>
          <p className="mt-1 text-sm text-muted-soft">شما دسترسی مشاهده روش‌های ارسال را ندارید.</p>
        </div>
      </div>
    );
  }

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
            <p className="font-semibold text-fg">خطا در بارگذاری روش‌های ارسال</p>
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
        title="روش‌های ارسال"
        description="روش‌های ارسال کالا و قیمت هر روش را مدیریت کنید."
        actions={
          <>
            {canCreate && (
              <Button
                variant="primary"
                size="md"
                className="w-full md:w-auto"
                onClick={() => {
                  setEditingId(null);
                  setOpenModal(true);
                }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                افزودن روش ارسال
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path d="M4 7v10l8 4M4 7l8-4m8 4v10M12 7V3m0 14l-8-4 8-4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-fg">کل روش‌ها</p>
              <p className="text-sm font-medium text-fg">{deliveryMethods.length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 12a3 3 0 11-6 0" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-fg">فعاله</p>
              <p className="text-sm font-medium text-fg">
                {deliveryMethods.filter((d) => d.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-muted-soft">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 12a3 3 0 11-6 0" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-fg">غیرفعاله</p>
              <p className="text-sm font-medium text-fg">
                {deliveryMethods.filter((d) => !d.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

        <DataTable<DeliveryMethod>
          columns={columns}
          data={deliveryMethods}
          total={deliveryMethods.length}
          loading={isLoading}
          emptyMessage="هیچ روش ارسالی تعریف نشده است"
        />

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingId ? 'ویرایش روش ارسال' : 'افزودن روش ارسال'}
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              name: formData.name.trim(),
              price: Number(formData.price),
              description: formData.description.trim() || null,
              isActive: formData.isActive,
            };
            if (editingId) {
              updateMutation.mutate({ id: editingId, payload });
            } else {
              createMutation.mutate(payload);
            }
          }}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-fg">نام روش ارسال</label>
            <input
              placeholder="مثلاً پست ایران"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full rounded-xl border bg-surface-2 px-3.5 py-2.5 text-sm text-fg outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary)]"
            />
          </div>
          <div className="space-y-2">
            <AmountInput
              label="قیمت (تومان)"
              value={formData.price}
              onChange={(value) => setFormData({ ...formData, price: String(value) })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-fg">توضیحات</label>
            <input
              placeholder="توضیحات روش ارسال..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-xl border bg-surface-2 px-3.5 py-2.5 text-sm text-fg outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary)]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-fg">وضعیت</label>
            <select
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.value === 'true' })
              }
              className="w-full rounded-xl border bg-surface-2 px-3.5 py-2.5 text-sm text-fg outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary)]"
            >
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              type="button"
              onClick={() => setOpenModal(false)}
            >
              انصراف
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              isLoading={
                (editingId ? updateMutation : createMutation).isPending
              }
            >
              {editingId ? 'ذخیره تغییرات' : 'ایجاد روش'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="حذف روش ارسال"
        size="sm"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(239,68,68,0.10)] text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="text-sm leading-6 text-muted">
              روش ارسال{' '}
              <span className="font-semibold text-fg">
                «{deleteTarget?.name}»
              </span>{' '}
              برای همیشه حذف می‌شود. این عمل قابل بازگشت نیست.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setDeleteTarget(null)}
            >
              انصراف
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="w-full sm:w-auto"
              isLoading={deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
            >
              حذف روش ارسال
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
