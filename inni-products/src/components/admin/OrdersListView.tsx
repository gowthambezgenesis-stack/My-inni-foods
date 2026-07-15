import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, ListOrdered, RefreshCw, Search } from 'lucide-react';
import { LiveIndicator } from './LiveIndicator';
import { AdminPillDropdown } from './AdminPillDropdown';
import { OrderTable } from './OrderTable';
import { downloadOrdersExport, FetchOrdersParams } from '../../features/orders/orderApi';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { OrderStatus, PaymentStatus } from '../../types';
import { ORDER_STATUS_FILTER_OPTIONS, formatOrderStatusLabel } from '../../lib/orderStatuses';
import { useAdminThemeClasses } from '../../lib/adminTheme';
import { cn } from '../../lib/utils';

type OrdersListMode = 'recent' | 'all';

interface OrdersListViewProps {
  mode: OrdersListMode;
}

const accentButtonClass =
  'inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors cursor-pointer';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  ...ORDER_STATUS_FILTER_OPTIONS.map((status) => ({
    value: status,
    label: formatOrderStatusLabel(status),
  })),
];

const PAYMENT_FILTER_OPTIONS = [
  { value: '', label: 'All Payments' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

export function OrdersListView({ mode }: OrdersListViewProps) {
  const isRecent = mode === 'recent';
  const t = useAdminThemeClasses();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | ''>('');
  const [filters, setFilters] = useState<FetchOrdersParams>(
    isRecent ? { recent: true } : { all: true },
  );
  const [isExporting, setIsExporting] = useState(false);

  const { orders, loading, error, lastUpdated, refresh } = useRealtimeOrders({ filters });

  const buildFilters = (overrides: Partial<FetchOrdersParams> = {}): FetchOrdersParams => ({
    recent: isRecent ? true : undefined,
    all: isRecent ? undefined : true,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    payment_status: paymentFilter || undefined,
    ...overrides,
  });

  const applyFilters = (next: FetchOrdersParams) => {
    setFilters(next);
  };

  useEffect(() => {
    const query = searchParams.get('search')?.trim() ?? '';
    if (!query) return;
    setSearchTerm(query);
    setFilters({
      recent: isRecent ? true : undefined,
      all: isRecent ? undefined : true,
      search: query,
    });
  }, [searchParams, isRecent]);

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
              className={cn('inline-flex items-center gap-2 text-sm mb-4', t.linkBack)}
            >
              <ArrowLeft size={16} />
              Back to Recent Orders
            </Link>
          )}
          <h2 className={cn('text-3xl font-bold tracking-tight', t.heading)}>
            {isRecent ? 'Orders' : 'Order History'}
          </h2>
          <p className={cn('mt-1', t.body)}>
            {isRecent
              ? 'Active orders and orders delivered in the last 24 hours.'
              : 'Complete order history across every status.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <LiveIndicator lastUpdated={lastUpdated} />
          {isRecent && (
            <Link to="/admin/orders/all" className={accentButtonClass}>
              <ListOrdered size={16} />
              Order History
            </Link>
          )}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || loading}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors cursor-pointer',
              t.secondaryBtn,
            )}
          >
            <Download size={16} />
            {isExporting ? 'Downloading...' : 'Download Excel'}
          </button>
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
            className={cn(
              'w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-500 transition-colors',
              t.input,
            )}
          />
        </div>
        <div className="flex gap-2 font-sans flex-wrap">
          <AdminPillDropdown
            value={statusFilter}
            options={STATUS_FILTER_OPTIONS}
            onChange={(value) => handleFilterChange('status', value)}
            placeholder="All Statuses"
            ariaLabel="Filter by order status"
          />
          <AdminPillDropdown
            value={paymentFilter}
            options={PAYMENT_FILTER_OPTIONS}
            onChange={(value) => handleFilterChange('payment', value)}
            placeholder="All Payments"
            ariaLabel="Filter by payment status"
          />
          <button
            type="button"
            onClick={handleRefresh}
            title="Reset status and payment filters"
            aria-label="Reset status and payment filters"
            className={cn(
              'flex items-center justify-center p-2 border rounded-lg text-sm transition-colors cursor-pointer',
              t.refreshBtn,
            )}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </form>

      {loading ? (
        <div className={cn('text-center py-12 text-sm', t.loading)}>Loading orders...</div>
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
