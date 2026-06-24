import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { fetchOrders, FetchOrdersParams } from '../features/orders/orderApi';
import { Order } from '../types';

const DEFAULT_INTERVAL_MS = 5000;

interface UseRealtimeOrdersOptions {
  intervalMs?: number;
  enabled?: boolean;
  filters?: FetchOrdersParams;
  notifyOnChanges?: boolean;
}

function orderSnapshotKey(order: Order): string {
  return `${order.status}|${order.payment_status}|${order.updated_at}`;
}

export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const {
    intervalMs = DEFAULT_INTERVAL_MS,
    enabled = true,
    filters,
    notifyOnChanges = true,
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const filtersRef = useRef(filters ?? {});
  filtersRef.current = filters ?? {};

  const snapshotRef = useRef<Map<string, string>>(new Map());
  const isInitialRef = useRef(true);

  const filtersKey = JSON.stringify(filters ?? {});

  const refresh = useCallback(async () => {
    const isInitial = isInitialRef.current;

    try {
      if (isInitial) {
        setLoading(true);
      }

      const data = await fetchOrders(filtersRef.current);

      if (!isInitial && notifyOnChanges) {
        for (const order of data) {
          const previous = snapshotRef.current.get(order.id);
          if (!previous) {
            toast.success(`New order ${order.order_number}`, { id: `new-order-${order.id}` });
          } else if (previous !== orderSnapshotKey(order)) {
            toast(`Order ${order.order_number} updated`, {
              id: `update-order-${order.id}`,
              icon: '📦',
            });
          }
        }
      }

      snapshotRef.current = new Map(data.map((order) => [order.id, orderSnapshotKey(order)]));
      setOrders(data);
      setError(null);
      setLastUpdated(new Date());
    } catch {
      if (isInitial) {
        setError('Failed to load orders.');
      }
    } finally {
      if (isInitial) {
        setLoading(false);
        isInitialRef.current = false;
      }
    }
  }, [notifyOnChanges]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    isInitialRef.current = true;
    snapshotRef.current = new Map();

    let intervalId: number | undefined;

    const stopPolling = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const startPolling = () => {
      stopPolling();
      intervalId = window.setInterval(refresh, intervalMs);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
        return;
      }
      refresh();
      startPolling();
    };

    refresh();
    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, intervalMs, filtersKey, refresh]);

  return { orders, loading, error, lastUpdated, refresh };
}
