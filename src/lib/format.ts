export const formatNumber = (value: number): string =>
  Number(value || 0).toLocaleString('fa-IR');

export const formatCurrency = (value: number): string =>
  `${formatNumber(value)} تومان`;

export const formatDate = (value?: string | null): string =>
  value
    ? new Date(value).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-';

export const formatDateTime = (value?: string | null): string =>
  value ? new Date(value).toLocaleString('fa-IR') : '-';