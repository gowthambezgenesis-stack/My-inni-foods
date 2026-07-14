import React from 'react';
import { Download, Loader2, Mail, Package, Phone } from 'lucide-react';
import { formatShippingPhone } from '../../lib/phone';
import { TrackingTimeline } from './TrackingTimeline';
import { TrackedOrder } from '../../types';
import { cn } from '../../lib/utils';

interface OrderTrackingDashboardProps {
  order: TrackedOrder;
  isRefreshing?: boolean;
  isDownloading?: boolean;
  onDownloadInvoice: () => void;
  onTrackAnother: () => void;
}

const CUSTOMER_SUPPORT = {
  phone: '080 9480051410',
  email: 'vasanthamachaih@oakroad.industries',
  addressLines: [
    'Oakroad Ventures private limited',
    'Site No.2.',
    'Survey No. 50/5',
    'Off Bileshivale main road.',
    'Shani mahatma temple road,',
    'Kyalasanahalli Bangalore – 560077',
  ],
};

function formatStatusDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

function formatPhone(phone: string, countryCode?: string) {
  return formatShippingPhone({ phone, phoneCountryCode: countryCode });
}

function formatAddress(order: TrackedOrder) {
  const { shipping_address: address } = order;
  return [
    address.address,
    [address.city, address.state, address.zip].filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join(', ');
}

function DetailBlock({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1 sm:space-y-1.5', className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>
      <div className="text-sm leading-snug sm:leading-relaxed text-neutral-800">{value}</div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4 md:p-5 md:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400 sm:text-[10px] sm:tracking-[0.16em]">
        {label}
      </p>
      <div className="mt-1.5 text-sm font-semibold leading-tight tracking-tight text-neutral-900 sm:mt-2 sm:text-base md:text-lg">
        {value}
      </div>
    </div>
  );
}

function SellerSupportBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('space-y-4 sm:space-y-6', compact && 'space-y-3')}>
      <DetailBlock label="Seller Name" value={<span className="font-medium text-neutral-950">INNI</span>} />
      <DetailBlock
        label="Customer Support"
        value={
          <div className="space-y-3 sm:space-y-4">
            <a
              href={`tel:${CUSTOMER_SUPPORT.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 text-neutral-700 transition-colors hover:text-neutral-950 sm:gap-2.5"
            >
              {!compact && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200/80 sm:h-8 sm:w-8">
                  <Phone size={14} className="text-neutral-500" />
                </span>
              )}
              {compact && <Phone size={14} className="shrink-0 text-neutral-400" />}
              <span className="text-sm">{CUSTOMER_SUPPORT.phone}</span>
            </a>
            <a
              href={`mailto:${CUSTOMER_SUPPORT.email}`}
              className="flex items-center gap-2 text-neutral-700 transition-colors hover:text-neutral-950 sm:gap-2.5"
            >
              {!compact && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200/80 sm:h-8 sm:w-8">
                  <Mail size={14} className="text-neutral-500" />
                </span>
              )}
              {compact && <Mail size={14} className="shrink-0 text-neutral-400" />}
              <span className="whitespace-nowrap text-xs leading-none">{CUSTOMER_SUPPORT.email}</span>
            </a>
            <div className={cn('rounded-lg bg-neutral-50 p-3 ring-1 ring-neutral-200/70 sm:rounded-xl sm:bg-white sm:p-4 sm:shadow-sm')}>
              <p className="mb-1.5 text-xs font-medium text-neutral-500 sm:mb-2">Business Address:</p>
              <div className="space-y-0.5 text-xs leading-relaxed text-neutral-800 sm:text-sm">
                {CUSTOMER_SUPPORT.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}

function CustomerDetailsBlock({ order }: { order: TrackedOrder }) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <DetailBlock label="Name" value={<span className="font-medium">{order.customer_name}</span>} />
      <DetailBlock
        label="Contact"
        value={
          <span className="inline-flex items-center gap-2">
            <Phone size={14} className="text-neutral-400" />
            {formatPhone(order.shipping_address.phone, order.shipping_address.phoneCountryCode)}
          </span>
        }
      />
      {order.customer_email && (
        <DetailBlock
          label="Email"
          value={
            <span className="inline-flex items-start gap-2 break-all">
              <Mail size={14} className="mt-0.5 shrink-0 text-neutral-400" />
              {order.customer_email}
            </span>
          }
        />
      )}
      <DetailBlock
        label="Delivery Address"
        value={<span className="leading-relaxed">{formatAddress(order)}</span>}
      />
    </div>
  );
}

export function OrderTrackingDashboard({
  order,
  isRefreshing = false,
  isDownloading = false,
  onDownloadInvoice,
  onTrackAnother,
}: OrderTrackingDashboardProps) {
  const trackingNumber = order.tracking_info?.tracking_number || order.order_number;
  const currentEvent =
    order.tracking_history.find((event) => event.is_current) ??
    [...order.tracking_history].reverse().find((event) => event.completed);
  const statusTimestamp = currentEvent?.timestamp || order.updated_at;
  const isOutForDelivery = order.status === 'out_for_delivery';

  const estimatedDeliveryValue =
    order.status === 'delivered' && order.estimated_delivery_date
      ? formatStatusDate(order.estimated_delivery_date)
      : order.status === 'cancelled'
        ? 'Not available'
        : '5 to 7 days';

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_24px_64px_rgba(0,0,0,0.08)] sm:rounded-[1.5rem]">
      <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden border-r border-neutral-200/80 bg-neutral-50/70 px-6 py-8 lg:block xl:px-7">
          <div className="mb-8 inline-flex rounded-xl bg-neutral-950 px-5 py-3.5 shadow-sm">
            <span className="text-lg font-bold tracking-[0.08em] text-white">INNI</span>
          </div>
          <SellerSupportBlock />
        </aside>

        <section className="px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-8 lg:py-8">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-200/80 pb-3 sm:pb-4 lg:hidden">
            <div className="inline-flex rounded-lg bg-neutral-950 px-3.5 py-2 shadow-sm">
              <span className="text-sm font-bold tracking-[0.08em] text-white">INNI</span>
            </div>
            <p className="text-right text-xs font-medium text-neutral-500 sm:text-sm">
              Tracking No. <span className="font-mono text-neutral-900">#{trackingNumber}</span>
            </p>
          </div>

          <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
            <p className="hidden text-sm font-medium text-neutral-500 lg:block">
              Tracking No. <span className="font-mono text-neutral-900">#{trackingNumber}</span>
            </p>

            <div
              className={cn(
                'rounded-xl border px-4 py-4 sm:rounded-2xl sm:px-5 sm:py-5 md:px-6 md:py-6',
                isOutForDelivery
                  ? 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-white shadow-[0_4px_20px_rgba(16,185,129,0.1)]'
                  : 'border-neutral-200/70 bg-neutral-50/50',
              )}
            >
              <p className="text-xs font-medium text-neutral-500 sm:text-sm">your order is</p>
              <h2
                className={cn(
                  'mt-1 text-2xl font-bold leading-tight tracking-tight sm:mt-1.5 sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.05]',
                  isOutForDelivery ? 'text-emerald-800' : 'text-neutral-950',
                )}
              >
                {order.status_label}
              </h2>
              <p className="mt-2 text-xs leading-snug text-neutral-600 sm:mt-3 sm:text-sm sm:leading-relaxed">
                as on {formatStatusDate(statusTimestamp)}
              </p>
              <p className="mt-1 text-[11px] text-neutral-400 sm:text-xs">
                Last updated on {formatStatusDate(order.updated_at)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <button
                type="button"
                onClick={onDownloadInvoice}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-2.5 text-xs font-medium text-neutral-700 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-60 cursor-pointer sm:gap-2 sm:px-5 sm:text-sm"
              >
                {isDownloading ? (
                  <Loader2 size={14} className="animate-spin sm:w-[15px] sm:h-[15px]" />
                ) : (
                  <Download size={14} className="sm:w-[15px] sm:h-[15px]" />
                )}
                Download Invoice
              </button>
              <button
                type="button"
                onClick={onTrackAnother}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-neutral-950 px-3 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-neutral-800 cursor-pointer sm:gap-2 sm:px-5 sm:text-sm"
              >
                Track Another Order
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3 md:mt-8 md:gap-4">
            <StatCard label="Payment" value={order.payment_status_label} />
            <StatCard
              label="Order Total"
              value={
                <span className="font-mono">
                  ₹{Number(order.total_amount).toLocaleString('en-IN')}
                </span>
              }
            />
            <StatCard label="Estimated Delivery" value={estimatedDeliveryValue} />
          </div>

          <div className="mt-4 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:mt-6 sm:rounded-2xl sm:p-5 md:mt-8 md:p-6">
            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 sm:h-9 sm:w-9">
                <Package size={15} className="text-neutral-600" />
              </span>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 sm:text-sm">
                Ordered Items
              </h3>
            </div>
            <div className="divide-y divide-neutral-100">
              {(order.items ?? []).map((item, index) => (
                <div
                  key={`${item.product_name}-${index}`}
                  className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0 sm:gap-4 sm:py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 sm:text-base">{item.product_name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500 sm:text-sm">
                      Qty {item.quantity}
                      {item.weight ? ` · ${item.weight}` : ''}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-xs font-medium text-neutral-800 sm:text-sm">
                    ₹{Number(item.price_at_time).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 xl:mt-8 xl:grid xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-8">
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5 md:p-6 lg:p-7">
              <div className="mb-3 flex items-center justify-between gap-3 sm:mb-5 md:mb-6">
                <h3 className="text-base font-bold tracking-tight text-neutral-950 sm:text-lg md:text-xl">
                  Tracking History
                </h3>
                {isRefreshing && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] text-neutral-500 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
                    <Loader2 size={12} className="animate-spin sm:w-3.5 sm:h-3.5" />
                    Refreshing...
                  </span>
                )}
              </div>

              <TrackingTimeline
                events={order.tracking_history}
                variant="mobile"
                className="lg:hidden"
              />
              <TrackingTimeline
                events={order.tracking_history}
                variant="compact"
                className="hidden lg:block xl:hidden"
              />
              <TrackingTimeline events={order.tracking_history} className="hidden xl:block" />
            </div>

            <aside className="mt-4 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:mt-6 sm:rounded-2xl sm:p-5 md:mt-8 md:p-6 xl:mt-0 xl:p-7">
              <CustomerDetailsBlock order={order} />
            </aside>
          </div>

          <div className="mt-4 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-4 sm:mt-6 sm:p-5 lg:hidden">
            <SellerSupportBlock compact />
          </div>
        </section>
      </div>
    </div>
  );
}
