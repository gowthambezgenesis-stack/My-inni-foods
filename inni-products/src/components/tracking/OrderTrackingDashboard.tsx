import React from 'react';
import { Download, Loader2, Mail, Package, Phone, Truck } from 'lucide-react';
import { LiveIndicator } from '../admin/LiveIndicator';
import { TrackingTimeline } from './TrackingTimeline';
import { TrackedOrder } from '../../types';

interface OrderTrackingDashboardProps {
  order: TrackedOrder;
  lastUpdated: Date | null;
  isRefreshing?: boolean;
  isDownloading?: boolean;
  onDownloadInvoice: () => void;
  onTrackAnother: () => void;
}

function formatStatusDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return phone;
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

function DetailBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-1.5">
        {label}
      </p>
      <div className="text-sm leading-relaxed text-neutral-800">{value}</div>
    </div>
  );
}

export function OrderTrackingDashboard({
  order,
  lastUpdated,
  isRefreshing = false,
  isDownloading = false,
  onDownloadInvoice,
  onTrackAnother,
}: OrderTrackingDashboardProps) {
  const trackingNumber = order.tracking_info?.tracking_number || order.order_number;
  const carrier = order.tracking_info?.carrier || 'inni Logistics';
  const currentEvent =
    order.tracking_history.find((event) => event.is_current) ??
    [...order.tracking_history].reverse().find((event) => event.completed);
  const statusTimestamp = currentEvent?.timestamp || order.updated_at;

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white text-neutral-900 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-neutral-200 bg-neutral-50 p-6 lg:border-b-0 lg:border-r">
          <div className="mb-8 inline-flex rounded-md bg-black px-4 py-3">
            <span className="text-lg font-semibold tracking-tight text-white">inni</span>
          </div>

          <div className="space-y-6">
            <DetailBlock label="Customer Name" value={order.customer_name} />
            <DetailBlock
              label="Customer Contact"
              value={
                <span className="inline-flex items-center gap-2">
                  <Phone size={14} className="text-neutral-400" />
                  {formatPhone(order.shipping_address.phone)}
                </span>
              }
            />
            {order.customer_email && (
              <DetailBlock
                label="Customer Email"
                value={
                  <span className="inline-flex items-center gap-2 break-all">
                    <Mail size={14} className="text-neutral-400 shrink-0" />
                    {order.customer_email}
                  </span>
                }
              />
            )}
            <DetailBlock label="Delivery Address" value={formatAddress(order)} />
          </div>

          <div className="my-8 border-t border-neutral-200" />

          <div className="space-y-6">
            <DetailBlock label="Seller Name" value="Inni Products" />
            <DetailBlock
              label="Seller Support"
              value={
                <div className="space-y-1">
                  <p>support@inni.com</p>
                  <p className="text-neutral-500">Premium spice fulfillment team</p>
                </div>
              }
            />
          </div>
        </aside>

        <section className="p-6 md:p-8">
          <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Tracking No. <span className="font-mono text-neutral-900">#{trackingNumber}</span>
              </p>
              <p className="mt-6 text-sm text-neutral-500">your order is</p>
              <h2 className="mt-1 text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
                {order.status_label}
              </h2>
              <p className="mt-3 text-sm text-neutral-600">
                as on {formatStatusDate(statusTimestamp)}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Last updated on {formatStatusDate(order.updated_at)}
              </p>
              <div className="mt-4">
                <LiveIndicator
                  lastUpdated={lastUpdated}
                  className="text-emerald-600 [&_span.relative]:bg-emerald-500 [&_span.absolute]:bg-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                <Truck size={18} className="text-neutral-500" />
                <span className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
                  {carrier}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onDownloadInvoice}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60 cursor-pointer"
                >
                  {isDownloading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  Download Invoice
                </button>
                <button
                  type="button"
                  onClick={onTrackAnother}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 cursor-pointer"
                >
                  Track Another Order
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Payment
              </p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">{order.payment_status_label}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Order Total
              </p>
              <p className="mt-2 text-lg font-semibold font-mono text-neutral-900">
                ₹{Number(order.total_amount).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Estimated Delivery
              </p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">
                {order.estimated_delivery_date
                  ? formatStatusDate(order.estimated_delivery_date)
                  : 'Not available yet'}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Package size={16} className="text-neutral-500" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-600">
                Ordered Items
              </h3>
            </div>
            <div className="space-y-3">
              {(order.items ?? []).map((item, index) => (
                <div
                  key={`${item.product_name}-${index}`}
                  className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{item.product_name}</p>
                    <p className="text-sm text-neutral-500">
                      Qty {item.quantity}
                      {item.weight ? ` · ${item.weight}` : ''}
                    </p>
                  </div>
                  <p className="font-mono text-sm text-neutral-800">
                    ₹{Number(item.price_at_time).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-neutral-900">Tracking History</h3>
              {isRefreshing && (
                <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
                  <Loader2 size={14} className="animate-spin" />
                  Refreshing...
                </span>
              )}
            </div>

            <TrackingTimeline events={order.tracking_history} />
          </div>
        </section>
      </div>
    </div>
  );
}
