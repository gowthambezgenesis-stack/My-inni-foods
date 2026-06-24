import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Order } from '../../types';
import { formatOrderStatusLabel } from '../../lib/orderStatuses';

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
  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="bg-neutral-950 border border-white/[0.08] rounded-xl overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-neutral-900/50">
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Order ID</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Date</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Username</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Customer</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Destination</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Total</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Payment</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400 min-w-[140px]">Fulfillment</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm font-semibold text-white font-mono">{order.order_number}</td>
                  <td className="p-4 text-xs text-neutral-400 font-mono">{formatDate(order.created_at)}</td>
                  <td className="p-4 text-sm text-white">
                    {order.customer_name || 'Guest'}
                    {order.username && (
                      <span className="block text-[10px] text-neutral-500 font-mono mt-0.5">{order.username}</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-neutral-300">
                    <span className="block">{order.user_email || '—'}</span>
                    {order.shipping_address?.phone && (
                      <span className="block text-[10px] text-neutral-500 font-mono mt-0.5">
                        {order.shipping_address.phone}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-neutral-300">
                    {order.shipping_address?.city}, {order.shipping_address?.state}
                  </td>
                  <td className="p-4 text-sm font-semibold text-white font-mono">₹{order.total_amount}</td>
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
                      className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors inline-flex items-center"
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-sm text-neutral-500">
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
