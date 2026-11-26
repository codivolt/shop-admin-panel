export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string | null;
  productNameSnapshot: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export interface Order {
  id: string;
  userId: string;
  user?: OrderUser;
  addressId: string;
  deliveryMethodId: string | null;
  deliveryPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  receiptImageUrl: string | null;
  rejectionReason: string | null;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

type StatusConfig = { label: string; cls: string; dot: string };

export const ORDER_STATUS: Record<OrderStatus, StatusConfig> = {
  pending: { label: 'در انتظار', cls: 'bg-[rgba(245,158,11,0.12)] text-amber-400', dot: 'bg-amber-400' },
  processing: { label: 'در حال پردازش', cls: 'bg-[rgb(var(--secondary-rgb)/0.12)] text-secondary', dot: 'bg-secondary' },
  shipped: { label: 'ارسال شده', cls: 'bg-[rgb(var(--primary-rgb)/0.12)] text-primary', dot: 'bg-primary' },
  delivered: { label: 'تحویل شده', cls: 'bg-[rgba(16,185,129,0.12)] text-emerald-400', dot: 'bg-emerald-400' },
  cancelled: { label: 'لغو شده', cls: 'bg-[rgba(239,68,68,0.12)] text-red-400', dot: 'bg-red-400' },
};

export const PAYMENT_STATUS: Record<PaymentStatus, StatusConfig> = {
  unpaid: { label: 'پرداخت نشده', cls: 'bg-[rgba(245,158,11,0.12)] text-amber-400', dot: 'bg-amber-400' },
  paid: { label: 'پرداخت شده', cls: 'bg-[rgba(16,185,129,0.12)] text-emerald-400', dot: 'bg-emerald-400' },
  refunded: { label: 'بازگشت وجه', cls: 'bg-surface-2 text-muted', dot: 'bg-muted' },
};

export const formatCurrency = (value: number) => `${Number(value || 0).toLocaleString('fa-IR')} تومان`;

export const shortOrderId = (id: string) => id.slice(0, 8).toUpperCase();

export const formatOrderDate = (value: string) =>
  new Date(value).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' });

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = ORDER_STATUS[status] ?? ORDER_STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = PAYMENT_STATUS[status] ?? PAYMENT_STATUS.unpaid;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
