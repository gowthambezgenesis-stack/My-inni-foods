import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchOrders, FetchOrdersParams } from '../features/orders/orderApi';
import { Order } from '../types';

const DEFAULT_INTERVAL_MS = 5000;

interface UseRealtimeOrdersOptions {
  intervalMs?: number;
  enabled?: boolean;
  filters?: FetchOrdersParams;
}

export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const {
    intervalMs = DEFAULT_INTERVAL_MS,
    enabled = true,
    filters,
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const filtersRef = useRef(filters ?? {});
  filtersRef.current = filters ?? {};

  const isInitialRef = useRef(true);

  const filtersKey = JSON.stringify(filters ?? {});

  const refresh = useCallback(async () => {
    const isInitial = isInitialRef.current;

    try {
      if (isInitial) {
        setLoading(true);
      }

      const data = await fetchOrders(filtersRef.current);

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
  }, []);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    isInitialRef.current = true;

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
