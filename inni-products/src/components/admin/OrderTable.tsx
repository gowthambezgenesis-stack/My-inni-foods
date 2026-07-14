import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Order } from '../../types';
import { formatOrderStatusLabel } from '../../lib/orderStatuses';
import { useAdminThemeClasses } from '../../lib/adminTheme';
import { formatShippingPhone } from '../../lib/phone';
import { cn } from '../../lib/utils';

interface OrderTableProps {
  orders: Order[];
}

const statusColors: Record<string, string> = {
  delivered: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  out_for_delivery: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  shipping: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const paymentColors: Record<string, string> = {
  paid: 'text-emerald-400',
  pending: 'text-amber-400',
  failed: 'text-red-400',
  refunded: 'text-neutral-400',
};

export function OrderTable({ orders }: OrderTableProps) {
  const navigate = useNavigate();
  const t = useAdminThemeClasses();

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });

  const openOrder = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <div className={cn('border rounded-xl overflow-hidden font-sans', t.surface)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={cn('border-b', t.border, t.surfaceMuted)}>
              <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider', t.label)}>Order ID</th>
              <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider', t.label)}>Date</th>
              <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider', t.label)}>Username</th>
              <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider', t.label)}>Customer</th>
              <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider', t.label)}>Destination</th>
              <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider', t.label)}>Total</th>
              <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider', t.label)}>Payment</th>
              <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider min-w-[140px]', t.label)}>Fulfillment</th>
              <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider text-right', t.label)}>Actions</th>
            </tr>
          </thead>
          <tbody className={cn('divide-y', t.divide)}>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => openOrder(order.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openOrder(order.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View order ${order.order_number}`}
                  className={cn('transition-colors cursor-pointer focus:outline-none', t.rowHover, t.rowFocus)}
                >
                  <td className={cn('p-4 text-sm font-semibold font-mono', t.heading)}>{order.order_number}</td>
                  <td className={cn('p-4 text-xs font-mono', t.body)}>{formatDate(order.created_at)}</td>
                  <td className={cn('p-4 text-sm', t.heading)}>
                    {order.customer_name || 'Guest'}
                    {order.username && (
                      <span className={cn('block text-[10px] font-mono mt-0.5', t.muted)}>{order.username}</span>
                    )}
                  </td>
                  <td className={cn('p-4 text-xs', t.bodyStrong)}>
                    <span className="block">{order.user_email || '—'}</span>
                    {order.shipping_address?.phone && (
                      <span className={cn('block text-[10px] font-mono mt-0.5', t.muted)}>
                        {formatShippingPhone(order.shipping_address)}
                      </span>
                    )}
                  </td>
                  <td className={cn('p-4 text-sm', t.bodyStrong)}>
                    {order.shipping_address?.city}, {order.shipping_address?.state}
                  </td>
                  <td className={cn('p-4 text-sm font-semibold font-mono', t.heading)}>₹{order.total_amount}</td>
                  <td className="p-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        order.payment_status === 'paid' ? 'bg-emerald-500' :
                        order.payment_status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className={paymentColors[order.payment_status] || 'text-neutral-400'}>
                        {order.payment_status}
                      </span>
                    </span>
                  </td>
                  <td className="p-4 text-xs">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusColors[order.status] || statusColors.pending}`}
                    >
                      {formatOrderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className={cn('p-1.5 rounded-lg transition-colors inline-flex items-center', t.actionIconBtn)}
                      aria-label={`View order ${order.order_number}`}
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className={cn('p-8 text-center text-sm', t.muted)}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
