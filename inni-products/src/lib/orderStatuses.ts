export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipping'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export const ADMIN_FULFILLMENT_STATUSES: OrderStatus[] = [
  'processing',
  'shipping',
  'out_for_delivery',
  'delivered',
];

export const ORDER_STATUS_FILTER_OPTIONS: OrderStatus[] = ADMIN_FULFILLMENT_STATUSES;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipping: 'Shipping',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function formatOrderStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Pending';
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status.replace(/_/g, ' ');
}
