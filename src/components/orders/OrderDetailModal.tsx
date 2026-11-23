import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Button from '../button/Button';
import Modal from '../layout/Modal';
import CustomSelect from '../form/CustomSelect';
import {
  formatCurrency,
  formatOrderDate,
  ORDER_STATUS,
  PAYMENT_STATUS,
  shortOrderId,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from './OrderMeta';

export type OrderDetailModalProps = {
  open: boolean;
  orderId: string | null;
  order?: Order | null;
  intent?: 'view' | 'delete';
  onClose: () => void;
  onDeleted?: () => void;
};

export default function OrderDetailModal({
  open,
  orderId,
  order: initialOrder,
  intent = 'view',
  onClose,
  onDeleted,
}: OrderDetailModalProps) {
  const queryClient = useQueryClient();
  const [confirmingDelete, setConfirmingDelete] = useState(intent === 'delete');

  useEffect(() => {
    if (open) setConfirmingDelete(intent === 'delete');
  }, [open, intent, orderId]);

  const { data: fetchedOrder, isLoading, isError, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      return res.data as Order;
    },
    enabled: open && !!orderId,
    initialData: initialOrder && initialOrder.id === orderId ? initialOrder : undefined,
    staleTime: 15_000,
  });

  const order = fetchedOrder ?? (initialOrder && initialOrder.id === orderId ? initialOrder : null);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      await api.put(`/orders/${id}/status`, { status });
      return { id, status };
    },
    onSuccess: ({ id, status }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.setQueryData<Order>(['order', id], (prev) => (prev ? { ...prev, status } : prev));
      toast.success(`وضعیت سفارش به «${ORDER_STATUS[status].label}» تغییر کرد`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در تغییر وضعیت سفارش');
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) => {
      await api.put(`/orders/${id}/payment`, { paymentStatus });
      return { id, paymentStatus };
    },
    onSuccess: ({ id, paymentStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.setQueryData<Order>(['order', id], (prev) => (prev ? { ...prev, paymentStatus } : prev));
      toast.success(`وضعیت پرداخت به «${PAYMENT_STATUS[paymentStatus].label}» تغییر کرد`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در تغییر وضعیت پرداخت');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/orders/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.removeQueries({ queryKey: ['order', id] });
      toast.success('سفارش با موفقیت حذف شد');
      onDeleted?.();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف سفارش');
    },
  });

  const targetId = order?.id ?? orderId;
  const isPending = statusMutation.isPending || paymentMutation.isPending;

  const title = confirmingDelete ? 'حذف سفارش' : 'جزئیات سفارش';

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      {confirmingDelete ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(239,68,68,0.10)] text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm leading-6 text-muted">
              سفارش{' '}
              <span className="font-mono font-semibold text-fg">
                #{targetId ? shortOrderId(targetId) : ''}
              </span>{' '}
              برای همیشه حذف می‌شود. این عمل قابل بازگشت نیست.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                if (intent === 'delete') {
                  onClose();
                } else {
                  setConfirmingDelete(false);
                }
              }}
            >
              انصراف
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="w-full sm:w-auto"
              isLoading={deleteMutation.isPending}
              onClick={() => targetId && deleteMutation.mutate(targetId)}
            >
              حذف سفارش
            </Button>
          </div>
        </div>
      ) : isError && !order ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(239,68,68,0.10)] text-red-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-fg">خطا در بارگذاری سفارش</p>
            <p className="mt-1 text-sm text-muted">سفارش یافت نشد یا ارتباط با سرور برقرار نشد.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            تلاش دوباره
          </Button>
        </div>
      ) : isLoading && !order ? (
        <div className="space-y-4">
          <div className="h-16 animate-pulse rounded-xl bg-surface-2" />
          <div className="h-28 animate-pulse rounded-xl bg-surface-2" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="h-12 animate-pulse rounded-xl bg-surface-2" />
            <div className="h-12 animate-pulse rounded-xl bg-surface-2" />
          </div>
        </div>
      ) : order ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
            <div>
              <div className="text-[11px] text-muted">شماره سفارش</div>
              <div className="font-mono text-sm text-fg" dir="ltr">
                #{shortOrderId(order.id)}
              </div>
            </div>
            <div className="text-left">
              <div className="text-[11px] text-muted">تاریخ ثبت</div>
              <div className="text-sm text-fg">{formatOrderDate(order.createdAt)}</div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">اقلام سفارش</h3>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {(order.items ?? []).length === 0 && (
                <p className="px-4 py-6 text-center text-xs text-muted">قلمی ثبت نشده است</p>
              )}
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-fg">{item.productNameSnapshot}</div>
                    <div className="text-[11px] text-muted">
                      {item.quantity.toLocaleString('fa-IR')} × {formatCurrency(item.unitPrice)}
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-fg-soft">{formatCurrency(item.totalPrice)}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[rgb(var(--primary-rgb)/0.08)] px-4 py-3">
              <span className="text-xs font-medium text-muted">مبلغ کل سفارش</span>
              <span className="text-sm font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {order.paymentMethod && (
            <div className="mt-4 rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">روش پرداخت</span>
              </div>
              <div className="text-sm text-fg">{order.paymentMethod}</div>
            </div>
          )}

          {order.receiptImageUrl && (
            <div className="mt-4 rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">فیش پرداخت</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={order.receiptImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  نمایش فیش
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-4l-4.586-4.586a2 2 0 012.828 0L16 8m-4 4zm0 0L6 14m0 0l4.586 4.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </a>
                <img
                  src={order.receiptImageUrl}
                  alt="فیش پرداخت"
                  className="mt-2 max-w-xs max-h-40 rounded-lg border border-border object-cover"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">وضعیت سفارش</label>
              <CustomSelect
                options={(Object.keys(ORDER_STATUS) as OrderStatus[]).map((key) => ({
                  value: key,
                  label: ORDER_STATUS[key].label,
                }))}
                value={order.status}
                disabled={isPending}
                onChange={(value) => statusMutation.mutate({ id: order.id, status: value as OrderStatus })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">وضعیت پرداخت</label>
              <CustomSelect
                options={(Object.keys(PAYMENT_STATUS) as PaymentStatus[]).map((key) => ({
                  value: key,
                  label: PAYMENT_STATUS[key].label,
                }))}
                value={order.paymentStatus}
                disabled={isPending}
                onChange={(value) => paymentMutation.mutate({ id: order.id, paymentStatus: value as PaymentStatus })}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[#f87171] hover:text-[#f87171] sm:w-auto"
              onClick={() => setConfirmingDelete(true)}
            >
              حذف سفارش
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={onClose}>
              بستن
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
