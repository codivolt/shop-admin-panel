import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import Button from '../../components/button/Button';
import DataTable, { type Column } from '../../components/table/DataTable';
import StatCard from '../../components/stats/StatCard';
import Breadcrumb from '../../components/layout/Breadcrumb';
import PageHeader from '../../components/layout/PageHeader';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import CustomSelect from '../../components/form/CustomSelect';
import Input from '../../components/input/Input';
import {
  formatCurrency,
  formatOrderDate,
  OrderStatusBadge,
  PaymentStatusBadge,
  ORDER_STATUS,
  PAYMENT_STATUS,
  shortOrderId,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from '../../components/orders/OrderMeta';
import { useAppSelector } from '../../hooks/useRedux';
import { PERMISSIONS } from '../../constants';

type OrderModalState = { order: Order; intent: 'view' | 'delete' };

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [orderModal, setOrderModal] = useState<OrderModalState | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['orders', page, limit, statusFilter, paymentFilter, search],
    queryFn: async () => {
      const res = await api.get('/orders/admin', {
        params: {
          page,
          limit,
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(paymentFilter ? { paymentStatus: paymentFilter } : {}),
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      });
      return res.data;
    },
  });

  const orders: Order[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const paidCount = orders.filter((o) => o.paymentStatus === 'paid').length;

  const { user } = useAppSelector((state: any) => state.auth);
  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'super_admin';
  const canViewOrder = isSuperAdmin || permissions.includes(PERMISSIONS.ORDERS_VIEW);
  const canDeleteOrder = isSuperAdmin || permissions.includes(PERMISSIONS.ORDERS_DELETE);

  const columns: Column<Order>[] = useMemo(
    () => [
      {
        key: 'id',
        label: 'سفارش',
        width: '24%',
        render: (_value, row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 dark:shadow-black/30">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="font-mono text-xs text-fg" dir="ltr">
                #{shortOrderId(row.id)}
              </div>
              <div className="text-[11px] text-muted">{formatOrderDate(row.createdAt)}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'user',
        label: 'مشتری',
        width: '18%',
        render: (_value, row) => {
          const fullName = [row.user?.firstName, row.user?.lastName]
            .filter(Boolean)
            .join(' ');
          return (
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-fg">
                {fullName || '—'}
              </div>
              {row.user?.phone ? (
                <div className="text-[11px] text-muted" dir="ltr">
                  {row.user.phone}
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        key: 'items',
        label: 'اقلام',
        width: '14%',
        align: 'center',
        render: (_value, row) => {
          const count = row.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
          return (
            <span className="text-xs text-muted">
              {count.toLocaleString('fa-IR')} قلم
            </span>
          );
        },
      },
      {
        key: 'totalAmount',
        label: 'مبلغ کل',
        width: '20%',
        align: 'right',
        render: (value: number) => (
          <span className="font-medium text-fg">{formatCurrency(value)}</span>
        ),
      },
      {
        key: 'status',
        label: 'وضعیت سفارش',
        width: '16%',
        align: 'center',
        render: (value: OrderStatus) => <OrderStatusBadge status={value} />,
      },
      {
        key: 'paymentStatus',
        label: 'پرداخت',
        width: '14%',
        align: 'center',
        render: (value: PaymentStatus) => <PaymentStatusBadge status={value} />,
      },
      {
        key: 'actions',
        label: 'عملیات',
        width: '12%',
        align: 'center',
        render: (_value, row) => (
          <div className="flex items-center justify-center gap-1.5">
            {canViewOrder && (
              <button
                onClick={() => setOrderModal({ order: row, intent: 'view' })}
                title="جزئیات سفارش"
                aria-label={`جزئیات سفارش ${shortOrderId(row.id)}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-card-from to-card-to text-muted shadow-md shadow-black/10 dark:shadow-black/30 transition-all hover:text-primary active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            )}
            {canDeleteOrder && (
              <button
                onClick={() => setOrderModal({ order: row, intent: 'delete' })}
                title="حذف سفارش"
                aria-label={`حذف سفارش ${shortOrderId(row.id)}`}
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
            <p className="font-semibold text-fg">خطا در بارگذاری سفارش‌ها</p>
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
        title="سفارشات"
        description="سفارش‌های ثبت‌شده را بررسی کنید و وضعیت پردازش و پرداخت آن‌ها را به‌روز کنید."
        actions={
          <Button
            variant="outline"
            size="md"
            className="w-full md:w-auto"
            onClick={() => refetch()}
            isLoading={isFetching && !isLoading}
          >
            به‌روزرسانی
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="کل سفارش‌ها"
          value={total}
          color="primary"
          hint="در همه صفحات"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="در انتظار"
          value={pendingCount}
          color="accent"
          hint="در صفحه جاری"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          }
        />
        <StatCard
          label="پرداخت‌شده"
          value={paidCount}
          color="secondary"
          hint="در صفحه جاری"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-4">
          <Input
            name="search"
            label="جستجو"
            placeholder="شماره سفارش، کد سفارش، نام یا شماره موبایل مشتری"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <CustomSelect
          label="وضعیت سفارش"
          options={[
            { value: '', label: 'همه وضعیت‌ها' },
            ...Object.entries(ORDER_STATUS).map(([value, cfg]) => ({
              value,
              label: cfg.label,
            })),
          ]}
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val as string);
            setPage(1);
          }}
        />
        <CustomSelect
          label="وضعیت پرداخت"
          options={[
            { value: '', label: 'همه پرداخت‌ها' },
            ...Object.entries(PAYMENT_STATUS).map(([value, cfg]) => ({
              value,
              label: cfg.label,
            })),
          ]}
          value={paymentFilter}
          onChange={(val) => {
            setPaymentFilter(val as string);
            setPage(1);
          }}
        />
        <div className="flex items-end lg:col-span-2 lg:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter('');
              setPaymentFilter('');
              setSearch('');
              setPage(1);
            }}
            disabled={!statusFilter && !paymentFilter && !search}
          >
            پاک کردن فیلترها
          </Button>
        </div>
      </div>

      {/* Table */}
      {!canViewOrder ? (
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to p-8 text-center shadow-xl shadow-black/10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-muted mx-auto mb-4">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 12a3 3 0 11-6 0" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-fg">عدم دسترسی به مشاهده سفارشات</p>
          <p className="mt-1 text-sm text-muted-soft">شما دسترسی مشاهده لیست سفارشات را ندارید.</p>
        </div>
      ) : (
        <DataTable<Order>
          columns={columns}
          data={orders}
          total={total}
          page={page}
          limit={limit}
          totalPages={data?.totalPages ?? 1}
          loading={isLoading}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          emptyMessage="هیچ سفارشی ثبت نشده است"
          className={isFetching && !isLoading ? 'opacity-70 transition-opacity' : 'transition-opacity'}
        />
      )}

      <OrderDetailModal
        open={!!orderModal}
        orderId={orderModal?.order.id ?? null}
        order={orderModal?.order ?? null}
        intent={orderModal?.intent ?? 'view'}
        onClose={() => setOrderModal(null)}
      />
    </div>
  );
}
