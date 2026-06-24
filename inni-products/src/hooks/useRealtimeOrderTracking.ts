import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { trackOrder } from '../features/orders/orderApi';
import { TrackOrderPayload, TrackedOrder } from '../types';

const DEFAULT_INTERVAL_MS = 5000;

interface UseRealtimeOrderTrackingOptions {
  payload: TrackOrderPayload | null;
  enabled?: boolean;
  intervalMs?: number;
  notifyOnChanges?: boolean;
}

function trackingSnapshotKey(order: TrackedOrder): string {
  const latestEvent = order.tracking_history.find((event) => event.is_current);
  return `${order.status}|${order.status_label}|${order.updated_at}|${latestEvent?.title ?? ''}|${order.tracking_history.length}`;
}

export function useRealtimeOrderTracking(options: UseRealtimeOrderTrackingOptions) {
  const {
    payload,
    enabled = true,
    intervalMs = DEFAULT_INTERVAL_MS,
    notifyOnChanges = true,
  } = options;

  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  const snapshotRef = useRef('');
  const isInitialRef = useRef(true);

  const payloadKey = JSON.stringify(payload ?? {});

  const refresh = useCallback(async () => {
    if (!payloadRef.current) {
      return;
    }

    const isInitial = isInitialRef.current;

    try {
      if (isInitial) {
        setLoading(true);
      }

      const data = await trackOrder(payloadRef.current);
      const snapshot = trackingSnapshotKey(data);

      if (!isInitial && notifyOnChanges && snapshotRef.current && snapshotRef.current !== snapshot) {
        toast.success(`Order updated: ${data.status_label}`, { id: `track-${data.order_number}` });
      }

      snapshotRef.current = snapshot;
      setOrder(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const message = (() => {
        const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
        if (typeof data?.error === 'string') {
          return data.error;
        }
        return isInitial
          ? 'Order not found or the details do not match our records.'
          : 'Unable to refresh tracking details.';
      })();

      if (isInitial) {
        setError(message);
      }
    } finally {
      if (isInitial) {
        setLoading(false);
        isInitialRef.current = false;
      }
    }
  }, [notifyOnChanges]);

  useEffect(() => {
    if (!enabled || !payload) {
      return undefined;
    }

    isInitialRef.current = true;
    snapshotRef.current = '';

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
  }, [enabled, intervalMs, payloadKey, refresh]);

  const reset = useCallback(() => {
    setOrder(null);
    setError(null);
    setLastUpdated(null);
    snapshotRef.current = '';
    isInitialRef.current = true;
  }, []);

  return { order, loading, error, lastUpdated, refresh, reset };
}
