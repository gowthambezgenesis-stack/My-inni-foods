import { api } from '../../lib/api';
import {
  CreateOrderPayload,
  Order,
  OrderCreateResponse,
  OrderStatus,
  PaymentStatus,
  TrackOrderPayload,
  TrackedOrder,
  TrackingHistoryEvent,
} from '../../types';

export interface FetchOrdersParams {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  search?: string;
  recent?: boolean;
}

/** Normalize Django numeric IDs to strings for frontend consistency. */
function normalizeOrder(order: Order & { id: number | string }): Order {
  return { ...order, id: String(order.id) };
}

/** List orders — admin sees all, customers see their own. */
export async function fetchOrders(params?: FetchOrdersParams): Promise<Order[]> {
  const { data } = await api.get<(Order & { id: number })[]>('/orders/', { params });
  return data.map(normalizeOrder);
}

/** Get a single order by ID. */
export async function fetchOrderById(id: string): Promise<Order> {
  const { data } = await api.get<Order & { id: number }>(`/orders/${id}/`);
  return normalizeOrder(data);
}

/** Create order at checkout (includes Razorpay order creation). */
export async function createOrder(payload: CreateOrderPayload): Promise<OrderCreateResponse> {
  const { data } = await api.post<OrderCreateResponse & { id: number }>('/orders/create/', payload);
  return normalizeOrder(data) as OrderCreateResponse;
}

/** Update order fulfillment status (admin only). */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data } = await api.patch<Order & { id: number }>(`/orders/${id}/status/`, { status });
  return normalizeOrder(data);
}

function normalizeTrackedOrder(
  order: TrackedOrder & {
    total_amount: number | string;
    items?: Array<{ price_at_time: number | string }>;
    tracking_history?: TrackingHistoryEvent[];
  },
): TrackedOrder {
  return {
    ...order,
    total_amount: Number(order.total_amount),
    tracking_history: order.tracking_history ?? [],
    items: (order.items ?? []).map((item) => ({
      ...item,
      price_at_time: Number(item.price_at_time),
    })),
  };
}

/** Guest order lookup by order number + email or mobile. */
export async function trackOrder(payload: TrackOrderPayload): Promise<TrackedOrder> {
  const { data } = await api.post<TrackedOrder>('/orders/track/', payload);
  return normalizeTrackedOrder(data);
}

/** Download invoice PDF after guest verification. */
export async function downloadOrderInvoice(payload: TrackOrderPayload): Promise<void> {
  try {
    const response = await api.post<Blob>('/orders/track/invoice/', payload, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${payload.order_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(await parseApiError(error, 'Unable to download invoice.'));
  }
}

async function parseApiError(error: unknown, fallback: string): Promise<string> {
  const axiosError = error as {
    response?: { data?: Blob | { error?: string; detail?: string } };
  };

  const responseData = axiosError.response?.data;
  if (responseData instanceof Blob) {
    try {
      const text = await responseData.text();
      const parsed = JSON.parse(text) as { error?: string; detail?: string };
      return parsed.error || parsed.detail || fallback;
    } catch {
      return fallback;
    }
  }

  if (responseData && typeof responseData === 'object') {
    return responseData.error || responseData.detail || fallback;
  }

  return fallback;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function filenameFromContentDisposition(header: string | undefined, fallback: string): string {
  if (!header) return fallback;
  const match = /filename="?([^"]+)"?/i.exec(header);
  return match?.[1] || fallback;
}

/** Export filtered orders as an Excel-compatible CSV file (admin only). */
export async function downloadOrdersExport(params?: FetchOrdersParams): Promise<void> {
  try {
    const response = await api.get<Blob>('/orders/export/', {
      params,
      responseType: 'blob',
    });
    const filename = filenameFromContentDisposition(
      response.headers['content-disposition'],
      'orders-export.csv',
    );
    triggerBlobDownload(new Blob([response.data], { type: 'text/csv' }), filename);
  } catch (error) {
    throw new Error(await parseApiError(error, 'Unable to download orders export.'));
  }
}

/** Export a single order with line items as an Excel-compatible CSV file (admin only). */
export async function downloadOrderDetailExport(orderId: string): Promise<void> {
  try {
    const response = await api.get<Blob>(`/orders/${orderId}/export/`, {
      responseType: 'blob',
    });
    const filename = filenameFromContentDisposition(
      response.headers['content-disposition'],
      `order-${orderId}.csv`,
    );
    triggerBlobDownload(new Blob([response.data], { type: 'text/csv' }), filename);
  } catch (error) {
    throw new Error(await parseApiError(error, 'Unable to download order export.'));
  }
}
