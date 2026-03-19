export type OrderStatus = 'completed' | 'processing' | 'shipped' | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  completed: '新規',
  processing: '対応中',
  shipped: '発送済み',
  cancelled: 'キャンセル',
};

export const ORDER_STATUS_OPTIONS: OrderStatus[] = ['completed', 'processing', 'shipped', 'cancelled'];

export function getOrderStatusLabel(status: string | null | undefined) {
  if (!status) return '未設定';
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}

export function formatOrderCurrency(amount: number | string | null | undefined, currency = 'jpy') {
  const numeric = typeof amount === 'string' ? Number(amount) : amount ?? 0;
  const value = Number.isFinite(numeric) ? numeric : 0;

  if (currency.toLowerCase() === 'jpy') {
    return `¥${Math.round(value).toLocaleString('ja-JP')}`;
  }

  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

export function normalizeOrderAmount(amount: number | null | undefined, currency = 'jpy') {
  if (amount == null) return 0;
  return currency.toLowerCase() === 'jpy' ? amount : amount / 100;
}

export function formatOrderDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
