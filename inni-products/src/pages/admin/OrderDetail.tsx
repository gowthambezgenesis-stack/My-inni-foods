import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Download,
  MapPin,
  Package,
  User,
} from 'lucide-react';
import { StatusUpdater } from '../../components/admin/StatusUpdater';
import { downloadOrderDetailExport } from '../../features/orders/orderApi';
import { useOrderStore } from '../../features/orders/orderStore';
import { formatOrderStatusLabel } from '../../lib/orderStatuses';
import { useAdminThemeClasses } from '../../lib/adminTheme';
import { formatShippingPhone } from '../../lib/phone';
import { cn } from '../../lib/utils';

const statusBadgeColors: Record<string, string> = {
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  out_for_delivery: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  shipping: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const paymentBadgeColors: Record<string, string> = {
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  refunded: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
};

function formatCurrency(amount: number | string) {
  return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

interface SidebarCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
  surfaceClass: string;
  headingClass: string;
  mutedClass: string;
}

function SidebarCard({
  icon: Icon,
  title,
  children,
  className,
  surfaceClass,
  headingClass,
  mutedClass,
}: SidebarCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 transition-all duration-300 hover:border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/5',
        surfaceClass,
        className,
      )}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
          <Icon size={16} />
        </div>
        <h3 className={cn('text-xs font-semibold uppercase tracking-widest', headingClass)}>{title}</h3>
      </div>
      <div className={cn('text-sm space-y-2.5', mutedClass)}>{children}</div>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { selectedOrder, loading, error, loadOrder, updateStatus, clearSelected } = useOrderStore();
  const [isExporting, setIsExporting] = useState(false);
  const t = useAdminThemeClasses();

  useEffect(() => {
    if (id) loadOrder(id);
    return () => clearSelected();
  }, [id, loadOrder, clearSelected]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleExport = async () => {
    if (!selectedOrder) return;
    setIsExporting(true);
    try {
      await downloadOrderDetailExport(selectedOrder.id);
      toast.success('Order spreadsheet downloaded.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to download spreadsheet.';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('flex min-h-[40vh] items-center justify-center text-sm', t.loading)}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
          Loading order...
        </div>
      </div>
    );
  }

  if (error || !selectedOrder) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/orders"
          className={cn(
            'inline-flex items-center gap-2 text-sm transition-colors',
            t.linkBack,
          )}
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-sm text-red-400">
          {error || 'Order not found.'}
        </div>
      </div>
    );
  }

  const address = selectedOrder.shipping_address;
  const itemCount = selectedOrder.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const statusBadge =
    statusBadgeColors[selectedOrder.status] ?? statusBadgeColors.pending;
  const paymentBadge =
    paymentBadgeColors[selectedOrder.payment_status] ?? paymentBadgeColors.pending;

  return (
    <div className="space-y-6">
      <Link
        to="/admin/orders"
        className={cn(
          'inline-flex items-center gap-2 text-sm transition-colors group',
          t.linkBack,
        )}
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Back to Orders
      </Link>

      {/* Header */}
      <div
        className={cn(
          'relative rounded-2xl border p-6 md:p-8',
          t.surface,
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400">
                Order
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
                  statusBadge,
                )}
              >
                {formatOrderStatusLabel(selectedOrder.status)}
              </span>
            </div>
            <h1 className={cn('text-3xl font-bold tracking-tight font-mono md:text-4xl', t.heading)}>
              {selectedOrder.order_number}
            </h1>
            <p className={cn('flex items-center gap-2 text-sm', t.body)}>
              <Calendar size={14} className="shrink-0 text-orange-400/80" />
              Placed on {formatDate(selectedOrder.created_at)}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div
              className={cn(
                'rounded-xl border px-4 py-3 min-w-[12rem]',
                t.surfaceMuted,
                t.border,
              )}
            >
              <p className={cn('mb-2 text-[10px] font-semibold uppercase tracking-widest', t.muted)}>
                Fulfillment Status
              </p>
              <StatusUpdater
                orderId={selectedOrder.id}
                currentStatus={selectedOrder.status}
                onUpdate={updateStatus}
              />
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/5',
                t.secondaryBtn,
              )}
            >
              <Download size={16} />
              {isExporting ? 'Downloading...' : 'Download Excel'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div
          className={cn(
            'lg:col-span-2 overflow-hidden rounded-2xl border transition-all duration-300 hover:border-white/15',
            t.surface,
          )}
        >
          <div className={cn('flex items-center justify-between border-b px-6 py-5', t.border)}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <Package size={18} />
              </div>
              <div>
                <h2 className={cn('text-base font-semibold', t.heading)}>Order Items</h2>
                <p className={cn('text-xs mt-0.5', t.muted)}>
                  {itemCount} item{itemCount === 1 ? '' : 's'} in this order
                </p>
              </div>
            </div>
          </div>

          <div className="px-2 py-1">
            {selectedOrder.items?.map((item, index) => {
              const lineTotal = item.price_at_time * item.quantity;
              const productName = item.product_name || item.product?.name || 'Product';

              return (
                <div
                  key={item.id}
                  className={cn(
                    'mx-2 flex items-center justify-between gap-4 rounded-xl px-4 py-4 transition-colors',
                    t.rowHover,
                    index > 0 && cn('border-t', t.borderSubtle),
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-medium', t.heading)}>{productName}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium',
                          t.badge,
                          t.borderSubtle,
                        )}
                      >
                        Qty {item.quantity}
                      </span>
                      <span className={cn('text-xs', t.muted)}>{item.weight}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn('text-sm font-semibold font-mono', t.heading)}>
                      {formatCurrency(lineTotal)}
                    </p>
                    {item.quantity > 1 && (
                      <p className={cn('text-[11px] mt-0.5 font-mono', t.muted)}>
                        {formatCurrency(item.price_at_time)} each
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className={cn(
              'mx-4 mb-4 mt-2 flex items-center justify-between rounded-xl border px-5 py-4',
              t.surfaceMuted,
              t.border,
            )}
          >
            <span className={cn('text-sm font-medium uppercase tracking-wider', t.body)}>Total</span>
            <span className={cn('text-xl font-bold font-mono tracking-tight', t.heading)}>
              {formatCurrency(selectedOrder.total_amount)}
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <SidebarCard
            icon={CreditCard}
            title="Payment"
            surfaceClass={t.surface}
            headingClass={t.heading}
            mutedClass={t.bodyStrong}
          >
            <div className="flex items-center justify-between gap-3">
              <span className={t.body}>Status</span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
                  paymentBadge,
                )}
              >
                {selectedOrder.payment_status}
              </span>
            </div>
            {selectedOrder.razorpay_order_id && (
              <div className={cn('rounded-lg border p-3', t.surfaceMuted, t.borderSubtle)}>
                <p className={cn('text-[10px] font-semibold uppercase tracking-wider mb-1', t.muted)}>
                  RZP Order
                </p>
                <p className={cn('text-xs font-mono break-all leading-relaxed', t.bodyStrong)}>
                  {selectedOrder.razorpay_order_id}
                </p>
              </div>
            )}
            {selectedOrder.razorpay_payment_id && (
              <div className={cn('rounded-lg border p-3', t.surfaceMuted, t.borderSubtle)}>
                <p className={cn('text-[10px] font-semibold uppercase tracking-wider mb-1', t.muted)}>
                  RZP Payment
                </p>
                <p className={cn('text-xs font-mono break-all leading-relaxed', t.bodyStrong)}>
                  {selectedOrder.razorpay_payment_id}
                </p>
              </div>
            )}
          </SidebarCard>

          <SidebarCard
            icon={MapPin}
            title="Shipping Address"
            surfaceClass={t.surface}
            headingClass={t.heading}
            mutedClass={t.bodyStrong}
          >
            <p className={cn('font-medium', t.heading)}>
              {address?.firstName} {address?.lastName}
            </p>
            {address?.phone && (
              <p className={cn('font-mono text-xs', t.body)}>{formatShippingPhone(address)}</p>
            )}
            <div className={cn('space-y-0.5 pt-1 text-sm leading-relaxed', t.bodyStrong)}>
              <p>{address?.address}</p>
              <p>
                {address?.city}, {address?.state} {address?.zip}
              </p>
            </div>
          </SidebarCard>

          {selectedOrder.user_email && (
            <SidebarCard
              icon={User}
              title="Customer"
              surfaceClass={t.surface}
              headingClass={t.heading}
              mutedClass={t.bodyStrong}
            >
              <p className={cn('break-all font-medium', t.heading)}>{selectedOrder.user_email}</p>
            </SidebarCard>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
