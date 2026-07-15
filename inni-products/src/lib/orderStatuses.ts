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

export const ORDER_STATUS_FILTER_OPTIONS: OrderStatus[] = [
  ...ADMIN_FULFILLMENT_STATUSES,
  'cancelled',
];


export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipping: 'Shipping',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/** Matches backend All Orders scope (not shown in Recent Orders). */
export const RECENT_DELIVERED_MS = 24 * 60 * 60 * 1000;

export function isAllOrdersLockedOrder(order: {
  status: string;
  updated_at: string;
}): boolean {
  if (order.status === 'cancelled') {
    return true;
  }
  if (order.status === 'delivered') {
    return Date.now() - new Date(order.updated_at).getTime() >= RECENT_DELIVERED_MS;
  }
  return false;
}

export function formatOrderStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Pending';
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status.replace(/_/g, ' ');
}
