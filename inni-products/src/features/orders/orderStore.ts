import { create } from 'zustand';
import toast from 'react-hot-toast';
import { Order, OrderStatus } from '../../types';
import {
  fetchOrderById,
  fetchOrders,
  FetchOrdersParams,
  updateOrderStatus,
} from './orderApi';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
  filters: FetchOrdersParams;
  loadOrders: (params?: FetchOrdersParams) => Promise<void>;
  loadOrder: (id: string) => Promise<void>;
  setFilters: (filters: FetchOrdersParams) => void;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  clearSelected: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  filters: {},

  loadOrders: async (params) => {
    const filters = params ?? get().filters;
    set({ loading: true, error: null, filters });
    try {
      const orders = await fetchOrders(filters);
      set({ orders, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  loadOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const order = await fetchOrderById(id);
      set({ selectedOrder: order, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load order';
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().loadOrders(filters);
  },

  updateStatus: async (id, status) => {
    try {
      const updated = await updateOrderStatus(id, status);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updated : o)),
        selectedOrder: state.selectedOrder?.id === id ? updated : state.selectedOrder,
      }));
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(message);
      throw err;
    }
  },

  clearSelected: () => set({ selectedOrder: null }),
}));
