import { create } from 'zustand';
import type { Order } from '../types';

export interface OrderNotification {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  createdAt: string;
}

interface AdminNotificationState {
  notifications: OrderNotification[];
  knownOrderIds: string[];
  hasSeeded: boolean;
  unreadCount: number;
  seedKnownOrders: (orderIds: string[]) => void;
  pushNewOrders: (orders: Order[]) => OrderNotification[];
  /** Clears the notification list after it has been viewed once. Keeps known order ids. */
  dismissViewed: () => void;
  clear: () => void;
}

function toNotification(order: Order): OrderNotification {
  return {
    id: String(order.id),
    orderNumber: order.order_number,
    customerName: order.customer_name || order.username || 'Guest',
    totalAmount: Number(order.total_amount),
    createdAt: order.created_at,
  };
}

export const useAdminNotificationStore = create<AdminNotificationState>((set, get) => ({
  notifications: [],
  knownOrderIds: [],
  hasSeeded: false,
  unreadCount: 0,

  seedKnownOrders: (orderIds) => {
    if (get().hasSeeded) return;
    set({
      knownOrderIds: [...new Set(orderIds.map(String))],
      hasSeeded: true,
    });
  },

  pushNewOrders: (orders) => {
    const state = get();
    if (!state.hasSeeded) {
      get().seedKnownOrders(orders.map((order) => String(order.id)));
      return [];
    }

    const known = new Set(state.knownOrderIds);
    const arrivals = orders.filter((order) => !known.has(String(order.id)));
    if (arrivals.length === 0) return [];

    const nextNotifications = arrivals.map(toNotification);
    const nextKnown = [...known, ...arrivals.map((order) => String(order.id))];

    set({
      knownOrderIds: nextKnown,
      notifications: [...nextNotifications, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + nextNotifications.length,
    });

    return nextNotifications;
  },

  dismissViewed: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  clear: () =>
    set({
      notifications: [],
      knownOrderIds: [],
      hasSeeded: false,
      unreadCount: 0,
    }),
}));
