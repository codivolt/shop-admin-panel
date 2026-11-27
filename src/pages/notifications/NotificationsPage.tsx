import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Breadcrumb from '../../components/layout/Breadcrumb';
import PageHeader from '../../components/layout/PageHeader';
import AccessDenied from '../../components/layout/AccessDenied';
import Button from '../../components/button/Button';
import StatCard from '../../components/stats/StatCard';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import { shortOrderId, type Order } from '../../components/orders/OrderMeta';
import { useAppSelector } from '../../hooks/useRedux';
import { PERMISSIONS } from '../../constants';

interface Notification {
  id: string;
  type?: string;
  message: string;
  orderId?: string | null;
  read: boolean;
  createdAt: string;
}

type FilterKey = 'all' | 'unread' | 'orders';

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  new_order: 'سفارش جدید',
  order_status: 'وضعیت سفارش',
  order_payment: 'پرداخت سفارش',
  low_stock: 'کمبود موجودی',
  system: 'سیستم',
};

const typeLabel = (type?: string) => (type ? NOTIFICATION_TYPE_LABELS[type] ?? 'اعلان' : 'اعلان');

const relativeFormatter = new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' });

function relativeTime(value: string) {
  const diffMs = new Date(value).getTime() - Date.now();
  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return relativeFormatter.format(days, 'day');
  return new Date(value).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fullDate(value: string) {
  return new Date(value).toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NotificationIcon({ type }: { type?: string }) {
  const isOrder = !!type?.includes('order');
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        isOrder
          ? 'bg-[rgb(var(--primary-rgb)/0.12)] text-primary'
          : 'bg-[rgb(var(--secondary-rgb)/0.12)] text-secondary'
      }`}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {isOrder ? (
          <>
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <path d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            <path d="M9 13h6M9 17h4" />
          </>
        ) : (
          <>
            <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h11z" />
            <path d="M9 17a3 3 0 006 0" />
          </>
        )}
      </svg>
    </span>
  );
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
  });

  const notifications: Notification[] = useMemo(
    () => (Array.isArray(data) ? data : data?.data ?? []),
    [data]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
  const orderCount = notifications.filter((n) => !!n.orderId).length;

  const { user } = useAppSelector((state: any) => state.auth);
  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'super_admin';
  const canViewNotification = isSuperAdmin || permissions.includes(PERMISSIONS.NOTIFICATIONS_VIEW);
  const canUpdateNotification = isSuperAdmin || permissions.includes(PERMISSIONS.NOTIFICATIONS_UPDATE);

  const filters = [
    { key: 'all' as const, label: 'همه', count: notifications.length },
    { key: 'unread' as const, label: 'خوانده‌نشده', count: unreadCount },
    { key: 'orders' as const, label: 'سفارش‌ها', count: orderCount },
  ];

  const visible = useMemo(
    () =>
      notifications.filter((n) =>
        filter === 'all' ? true : filter === 'unread' ? !n.read : !!n.orderId
      ),
    [notifications, filter]
  );

  const patchCachedNotifications = (updater: (list: Notification[]) => Notification[]) => {
    queryClient.setQueryData(['notifications'], (old: any) => {
      if (Array.isArray(old)) return updater(old);
      if (old && Array.isArray(old.data)) return { ...old, data: updater(old.data) };
      return old;
    });
  };

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
  };

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData(['notifications']);
      patchCachedNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
      return { previous };
    },
    onError: (err: any, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
      toast.error(err.response?.data?.message || 'خطا در علامت‌گذاری');
    },
    onSettled: () => {
      invalidateNotifications();
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const ids = notifications.filter((n) => !n.read).map((n) => n.id);
      await Promise.all(ids.map((id) => api.put(`/notifications/${id}/read`)));
      return ids.length;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData(['notifications']);
      patchCachedNotifications((list) => list.map((n) => ({ ...n, read: true })));
      return { previous };
    },
    onSuccess: (count) => {
      toast.success(`${count.toLocaleString('fa-IR')} اعلان خوانده شد`);
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
      toast.error(err.response?.data?.message || 'خطا در علامت‌گذاری اعلان‌ها');
    },
    onSettled: () => {
      invalidateNotifications();
    },
  });

  const openOrder = (notification: Notification) => {
    if (!notification.orderId) return;
    if (!notification.read) markRead.mutate(notification.id);
    setSelectedOrderId(notification.orderId);
    setSelectedOrder(null);
  };

  const handleOrderClose = () => {
    setSelectedOrderId(null);
    setSelectedOrder(null);
  };

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Breadcrumb />
        <div className="card-elevated flex min-h-[360px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(239,68,68,0.10)] text-red-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-fg">خطا در بارگذاری اعلان‌ها</p>
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
    <>
      {!canViewNotification ? (
        <AccessDenied resource="اعلان‌ها" />
      ) : (
      <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="اعلان‌ها"
        description="رویدادهای فروشگاه را مرور کنید؛ اعلان‌های مرتبط با سفارش مستقیماً به جزئیات همان سفارش باز می‌شوند."
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
              onClick={() => refetch()}
              isLoading={isFetching && !isLoading}
            >
              به‌روزرسانی
            </Button>
            {canUpdateNotification && (
              <Button
                variant="secondary"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => markAllRead.mutate()}
                disabled={unreadCount === 0}
                isLoading={markAllRead.isPending}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 13l4 4L20 5" />
                </svg>
                خواندن همه
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-slide-up">
        <StatCard
          label="کل اعلان‌ها"
          value={notifications.length}
          color="primary"
          hint="آخرین ۵۰ رویداد"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h11z" />
              <path d="M9 17a3 3 0 006 0" />
            </svg>
          }
        />
        <StatCard
          label="خوانده‌نشده"
          value={unreadCount}
          color="accent"
          hint="نیازمند بررسی"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
            </svg>
          }
        />
        <StatCard
          label="مرتبط با سفارش"
          value={orderCount}
          color="secondary"
          hint="قابل پیگیری"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      <div className="inline-flex max-w-full flex-wrap items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to p-1 shadow-lg shadow-black/10 dark:shadow-black/30 animate-slide-up" style={{ animationDelay: '50ms' }}>
        {filters.map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-b from-primary to-primary-600 text-fg shadow-md shadow-[rgb(var(--primary-rgb)/0.3)]'
                  : 'text-muted hover:bg-surface-2 hover:text-fg'
              }`}
            >
              {item.label}
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  active ? 'bg-black/15 text-fg' : 'bg-surface-2 text-muted'
                }`}
              >
                {item.count.toLocaleString('fa-IR')}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <ul className="space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="card-elevated-sm p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-surface-2" />
                <div className="flex-1 space-y-2.5 py-0.5">
                  <div className="h-3 w-32 animate-pulse rounded-md bg-surface-2" />
                  <div className="h-3.5 w-3/4 animate-pulse rounded-md bg-surface-2" />
                  <div className="h-3 w-1/3 animate-pulse rounded-md bg-surface-2" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : visible.length === 0 ? (
        <div className="card-elevated flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-muted-soft">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h11z" />
              <path d="M9 17a3 3 0 006 0" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-fg">
              {filter === 'unread'
                ? 'همه اعلان‌ها خوانده شده‌اند'
                : filter === 'orders'
                  ? 'اعلان مرتبط با سفارشی وجود ندارد'
                  : 'اعلانی ثبت نشده است'}
            </p>
            <p className="mt-1 text-xs text-muted-soft">رویدادهای جدید فروشگاه در این بخش نمایش داده می‌شوند.</p>
          </div>
        </div>
      ) : (
        <ul
          className={`space-y-3 transition-opacity duration-200 ${
            isFetching ? 'opacity-70' : 'opacity-100'
          }`}
        >
          {visible.map((notification, index) => {
            const clickable = !!notification.orderId;
            const isMarking = markRead.isPending && markRead.variables === notification.id;
            return (
              <li
                key={notification.id}
                onClick={clickable ? () => openOrder(notification) : undefined}
                onKeyDown={(event) => {
                  if (!clickable) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openOrder(notification);
                  }
                }}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-label={clickable ? `مشاهده سفارش اعلان ${notification.message}` : undefined}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-card-from to-card-to p-4 shadow-lg shadow-black/10 outline-none transition-all duration-200 dark:shadow-black/30 animate-slide-up ${
                  notification.read
                    ? 'border-border hover:shadow-xl hover:shadow-black/15'
                    : 'border-[rgb(var(--primary-rgb)/0.35)] shadow-[rgb(var(--primary-rgb)/0.08)]'
                } ${
                  clickable
                    ? 'cursor-pointer hover:border-primary/60 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.995]'
                    : ''
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {!notification.read && (
                  <span className="absolute inset-y-4 right-0 w-[3px] rounded-full bg-primary" />
                )}

                <div className="flex items-start gap-3">
                  <NotificationIcon type={notification.type} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="chip bg-surface-2 text-[10px] text-fg-soft">
                        {typeLabel(notification.type)}
                      </span>
                      {!notification.read && (
                        <span className="chip bg-[rgb(var(--accent-rgb)/0.12)] text-[10px] text-accent">جدید</span>
                      )}
                      {notification.orderId && (
                        <span
                          className="chip bg-[rgb(var(--primary-rgb)/0.10)] font-mono text-[10px] text-primary"
                          dir="ltr"
                        >
                          #{shortOrderId(notification.orderId)}
                        </span>
                      )}
                      <span
                        className="text-[11px] text-muted-soft"
                        title={fullDate(notification.createdAt)}
                      >
                        {relativeTime(notification.createdAt)}
                      </span>
                    </div>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        notification.read ? 'text-fg-soft' : 'font-medium text-fg'
                      }`}
                    >
                      {notification.message}
                    </p>

                    {clickable && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/60 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors group-hover:border-primary/40">
                          مشاهده سفارش
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 19l-7-7 7-7" />
                          </svg>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {!notification.read && canUpdateNotification && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          markRead.mutate(notification.id);
                        }}
                        disabled={isMarking}
                        title="علامت خوانده شده"
                        aria-label="علامت خوانده شده"
                        className="icon-btn transition-all hover:text-primary active:scale-95 disabled:opacity-50"
                      >
                        {isMarking ? (
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )}
                    {clickable && (
                      <svg className="h-4 w-4 text-muted-soft transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <OrderDetailModal
        open={!!selectedOrderId}
        orderId={selectedOrderId}
        order={selectedOrder}
        intent="view"
        onClose={handleOrderClose}
      />
        </div>
      )}
    </>
  );
}