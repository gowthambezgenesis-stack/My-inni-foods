import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, ListOrdered, RefreshCw, Search } from 'lucide-react';
import { LiveIndicator } from './LiveIndicator';
import { OrderTable } from './OrderTable';
import { downloadOrdersExport, FetchOrdersParams } from '../../features/orders/orderApi';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { OrderStatus, PaymentStatus } from '../../types';
import { ORDER_STATUS_FILTER_OPTIONS, formatOrderStatusLabel } from '../../lib/orderStatuses';

type OrdersListMode = 'recent' | 'all';

interface OrdersListViewProps {
  mode: OrdersListMode;
}

const accentButtonClass =
  'inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors cursor-pointer';

const downloadButtonClass =
  'inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-neutral-950 disabled:opacity-60 disabled:cursor-not-allowed text-white border border-white/[0.08] rounded-lg text-sm font-medium transition-colors cursor-pointer';

export function OrdersListView({ mode }: OrdersListViewProps) {
  const isRecent = mode === 'recent';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | ''>('');
  const [filters, setFilters] = useState<FetchOrdersParams>({ recent: isRecent });
  const [isExporting, setIsExporting] = useState(false);

  const { orders, loading, error, lastUpdated, refresh } = useRealtimeOrders({ filters });

  const buildFilters = (overrides: Partial<FetchOrdersParams> = {}): FetchOrdersParams => ({
    recent: isRecent ? true : undefined,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    payment_status: paymentFilter || undefined,
    ...overrides,
  });

  const applyFilters = (next: FetchOrdersParams) => {
    setFilters(next);
  };

  const runSearch = () => {
    applyFilters(buildFilters());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch();
  };

  const handleFilterChange = (type: 'status' | 'payment', value: string) => {
    const newStatus = type === 'status' ? (value as OrderStatus | '') : statusFilter;
    const newPayment = type === 'payment' ? (value as PaymentStatus | '') : paymentFilter;

    if (type === 'status') setStatusFilter(value as OrderStatus | '');
    else setPaymentFilter(value as PaymentStatus | '');

    applyFilters(
      buildFilters({
        status: newStatus || undefined,
        payment_status: newPayment || undefined,
      }),
    );
  };

  const handleRefresh = () => {
    setStatusFilter('');
    setPaymentFilter('');
    applyFilters(buildFilters({ status: undefined, payment_status: undefined }));
    refresh();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadOrdersExport(buildFilters());
      toast.success('Orders spreadsheet downloaded.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to download spreadsheet.';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          {!isRecent && (
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-4"
            >
              <ArrowLeft size={16} />
              Back to Recent Orders
            </Link>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {isRecent ? 'Orders' : 'All Orders'}
          </h2>
          <p className="text-neutral-400 mt-1">
            {isRecent
              ? 'Active orders and recently delivered — updated in the last 7 days.'
              : 'Complete order history across every status.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isRecent && (
            <Link to="/admin/orders/all" className={accentButtonClass}>
              <ListOrdered size={16} />
              All Orders
            </Link>
          )}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || loading}
            className={downloadButtonClass}
          >
            <Download size={16} />
            {isExporting ? 'Downloading...' : 'Download Excel'}
          </button>
          <LiveIndicator lastUpdated={lastUpdated} />
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <button
            type="button"
            onClick={runSearch}
            aria-label="Search orders"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-orange-400 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
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
