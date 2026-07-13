import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import { fetchOrders } from '../features/orders/orderApi';
import { canAccessOrders } from '../lib/adminRoles';
import { useAdminNotificationStore } from '../store/adminNotificationStore';
import { useAuthStore } from '../store/authStore';

const POLL_INTERVAL_MS = 5000;

/** Polls orders for the admin shell and pushes new arrivals into the notification bell. */
export function useAdminOrderNotifications() {
  const role = useAuthStore((state) => state.role);
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);
  const enabled = canAccessOrders(role) || isSuperAdmin;

  const seedKnownOrders = useAdminNotificationStore((state) => state.seedKnownOrders);
  const pushNewOrders = useAdminNotificationStore((state) => state.pushNewOrders);
  const hasSeeded = useAdminNotificationStore((state) => state.hasSeeded);

  const hasSeededRef = useRef(hasSeeded);
  hasSeededRef.current = hasSeeded;

  useEffect(() => {
    if (!enabled) return undefined;

    let intervalId: number | undefined;
    let cancelled = false;

    const poll = async () => {
      try {
        const orders = await fetchOrders({ recent: true });
        if (cancelled) return;

        if (!hasSeededRef.current) {
          seedKnownOrders(orders.map((order) => String(order.id)));
          return;
        }

        const arrivals = pushNewOrders(orders);
        for (const notification of arrivals) {
          toast.success(`New order ${notification.orderNumber}`, {
            id: `new-order-${notification.id}`,
          });
        }
      } catch {
        // Silent — bell polling should not interrupt the admin UI
      }
    };

    const stop = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const start = () => {
      stop();
      intervalId = window.setInterval(poll, POLL_INTERVAL_MS);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }
      void poll();
      start();
    };

    void poll();
    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, pushNewOrders, seedKnownOrders]);
}
