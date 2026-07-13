import { useCallback, useEffect, useRef, useState } from 'react';

import { DashboardStats, fetchDashboardStats } from '../features/admin/adminApi';

const DEFAULT_INTERVAL_MS = 10000;

interface UseRealtimeDashboardStatsOptions {
  intervalMs?: number;
  enabled?: boolean;
}

export function useRealtimeDashboardStats(options: UseRealtimeDashboardStatsOptions = {}) {
  const { intervalMs = DEFAULT_INTERVAL_MS, enabled = true } = options;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isInitialRef = useRef(true);

  const refresh = useCallback(async () => {
    const isInitial = isInitialRef.current;

    try {
      if (isInitial) {
        setLoading(true);
      }

      const data = await fetchDashboardStats();
      setStats(data);
      setError(null);
      setLastUpdated(new Date());
    } catch {
      if (isInitial) {
        setError('Unable to load dashboard data. Please refresh and try again.');
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
  }, [enabled, intervalMs, refresh]);

  return { stats, loading, error, lastUpdated, refresh };
}
