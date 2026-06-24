import React, { useState } from 'react';
import { RefreshCw, Search, Filter } from 'lucide-react';
import { LiveIndicator } from '../../components/admin/LiveIndicator';
import { OrderTable } from '../../components/admin/OrderTable';
import { FetchOrdersParams } from '../../features/orders/orderApi';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { OrderStatus, PaymentStatus } from '../../types';
import { ORDER_STATUS_FILTER_OPTIONS, formatOrderStatusLabel } from '../../lib/orderStatuses';

export function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | ''>('');
  const [filters, setFilters] = useState<FetchOrdersParams>({});

  const { orders, loading, error, lastUpdated, refresh } = useRealtimeOrders({ filters });

  const applyFilters = (next: FetchOrdersParams) => {
    setFilters(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      payment_status: paymentFilter || undefined,
    });
  };

  const handleFilterChange = (type: 'status' | 'payment', value: string) => {
    const newStatus = type === 'status' ? (value as OrderStatus | '') : statusFilter;
    const newPayment = type === 'payment' ? (value as PaymentStatus | '') : paymentFilter;

    if (type === 'status') setStatusFilter(value as OrderStatus | '');
    else setPaymentFilter(value as PaymentStatus | '');

    applyFilters({
      search: searchTerm || undefined,
      status: newStatus || undefined,
      payment_status: newPayment || undefined,
    });
  };

  const handleRefresh = () => {
    setStatusFilter('');
    setPaymentFilter('');
    applyFilters({ search: searchTerm || undefined });
    refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Orders</h2>
          <p className="text-neutral-400 mt-1">Manage, filter, and track order fulfillment statuses.</p>
        </div>
        <LiveIndicator lastUpdated={lastUpdated} />
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search phone, username, order number, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 placeholder-neutral-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 font-sans flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 bg-neutral-950 border border-white/[0.08] rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-orange-500"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUS_FILTER_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {formatOrderStatusLabel(status)}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => handleFilterChange('payment', e.target.value)}
            className="px-3 py-2 bg-neutral-950 border border-white/[0.08] rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-orange-500"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            type="button"
            onClick={handleRefresh}
            title="Reset status and payment filters"
            aria-label="Reset status and payment filters"
            className="flex items-center justify-center p-2 bg-neutral-950 hover:bg-neutral-900 border border-white/[0.08] text-neutral-300 hover:text-white rounded-lg text-sm transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-white/[0.08] text-neutral-300 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <Filter size={16} />
            <span>Search</span>
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-12 text-sm text-neutral-400">Loading orders...</div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-sm text-red-400">
          {error}
        </div>
      ) : (
        <OrderTable orders={orders} />
      )}
    </div>
  );
}

export default Orders;
