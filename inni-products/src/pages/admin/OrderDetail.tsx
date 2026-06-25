import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Package } from 'lucide-react';
import { StatusUpdater } from '../../components/admin/StatusUpdater';
import { downloadOrderDetailExport } from '../../features/orders/orderApi';
import { useOrderStore } from '../../features/orders/orderStore';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { selectedOrder, loading, error, loadOrder, updateStatus, clearSelected } = useOrderStore();
  const [isExporting, setIsExporting] = useState(false);

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
    return <div className="text-center py-12 text-sm text-neutral-400">Loading order...</div>;
  }

  if (error || !selectedOrder) {
    return (
      <div className="space-y-4">
        <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-sm text-red-400">
          {error || 'Order not found.'}
        </div>
      </div>
    );
  }

  const address = selectedOrder.shipping_address;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-4">
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-white font-mono">
            {selectedOrder.order_number}
          </h2>
          <p className="text-neutral-400 mt-1">Placed on {formatDate(selectedOrder.created_at)}</p>
        </div>
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-neutral-950 disabled:opacity-60 disabled:cursor-not-allowed text-white border border-white/[0.08] rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Download size={16} />
            {isExporting ? 'Downloading...' : 'Download Excel'}
          </button>
          <div className="text-right">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Fulfillment Status</p>
            <StatusUpdater
              orderId={selectedOrder.id}
              currentStatus={selectedOrder.status}
              onUpdate={updateStatus}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-neutral-950 border border-white/[0.08] rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package size={18} /> Order Items
          </h3>
          <div className="divide-y divide-white/[0.06]">
            {selectedOrder.items?.map((item) => (
              <div key={item.id} className="py-4 flex justify-between items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    {item.product_name || item.product?.name || 'Product'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Qty: {item.quantity} · {item.weight}
                  </p>
                </div>
                <p className="text-sm font-mono text-white">₹{item.price_at_time * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 flex justify-between text-lg font-semibold text-white">
            <span>Total</span>
            <span className="font-mono">₹{selectedOrder.total_amount}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-neutral-950 border border-white/[0.08] rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Payment</h3>
            <div className="text-sm space-y-2 text-neutral-300">
              <p>Status: <span className="capitalize text-white">{selectedOrder.payment_status}</span></p>
              {selectedOrder.razorpay_order_id && (
                <p className="text-xs font-mono text-neutral-500 break-all">
                  RZP Order: {selectedOrder.razorpay_order_id}
                </p>
              )}
              {selectedOrder.razorpay_payment_id && (
                <p className="text-xs font-mono text-neutral-500 break-all">
                  RZP Payment: {selectedOrder.razorpay_payment_id}
                </p>
              )}
            </div>
          </div>

          <div className="bg-neutral-950 border border-white/[0.08] rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Shipping Address</h3>
            <div className="text-sm text-neutral-300 space-y-1">
              <p>{address?.firstName} {address?.lastName}</p>
              {address?.phone && <p>{address.phone}</p>}
              <p>{address?.address}</p>
              <p>{address?.city}, {address?.state} {address?.zip}</p>
            </div>
          </div>

          {selectedOrder.user_email && (
            <div className="bg-neutral-950 border border-white/[0.08] rounded-xl p-6 space-y-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Customer</h3>
              <p className="text-sm text-neutral-300">{selectedOrder.user_email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
