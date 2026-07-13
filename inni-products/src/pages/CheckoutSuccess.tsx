import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { NavLink, useLocation } from 'react-router-dom';
import { CheckCircle, Loader2, PackageSearch } from 'lucide-react';
import { TrackingTimeline } from '../components/tracking/TrackingTimeline';
import { useRealtimeOrderTracking } from '../hooks/useRealtimeOrderTracking';
import { PaymentRecord } from '../types/payment';
import { TrackOrderPayload } from '../types';

interface SuccessLocationState {
  payment?: PaymentRecord;
  orderNumber?: string;
  email?: string;
  mobile?: string;
  isCod?: boolean;
}

export function CheckoutSuccess() {
  const location = useLocation();
  const state = (location.state ?? {}) as SuccessLocationState;
  const isCod = state.isCod ?? false;
  const orderNumber = state.orderNumber || state.payment?.order_id || '';
  const email = state.email?.trim().toLowerCase() ?? '';
  const mobile = state.mobile?.replace(/\D/g, '') ?? '';

  const trackPayload = useMemo<TrackOrderPayload | null>(() => {
    if (!orderNumber) {
      return null;
    }

    if (email) {
      return {
        order_number: orderNumber.trim().toUpperCase(),
        email,
      };
    }

    if (mobile) {
      return {
        order_number: orderNumber.trim().toUpperCase(),
        mobile,
      };
    }

    return null;
  }, [orderNumber, email, mobile]);

  const { order, loading } = useRealtimeOrderTracking({
    payload: trackPayload,
    enabled: Boolean(trackPayload),
  });

  const trackOrderPath = orderNumber
    ? `/track-order?order=${encodeURIComponent(orderNumber)}${email ? `&email=${encodeURIComponent(email)}` : ''}`
    : '/track-order';

  return (
    <div className="min-h-screen bg-black pt-32 pb-32 flex flex-col items-center justify-center text-white text-center px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 border border-white/20 text-white"
      >
        <CheckCircle size={48} strokeWidth={1.5} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl font-semibold tracking-tighter mb-4"
      >
        {isCod ? 'Order placed.' : 'Payment complete.'}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-neutral-400 text-lg max-w-md mx-auto mb-10 font-light"
      >
        {isCod
          ? 'Your order has been confirmed with cash on delivery. Pay when your premium spices arrive.'
          : 'Your premium spices are being prepared. We will send you an email with your shipping confirmation shortly.'}
      </motion.p>

      {trackPayload && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-10 w-full max-w-xl text-left"
        >
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white text-neutral-900 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Live order tracking
              </p>
              {loading && !order ? (
                <div className="mt-3 inline-flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 size={16} className="animate-spin" />
                  Loading tracking details...
                </div>
              ) : order ? (
                <>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                    {order.status_label}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Order <span className="font-mono text-neutral-800">#{order.order_number}</span>
                  </p>
                </>
              ) : null}
            </div>

            {order && (
              <div className="px-5 py-5 sm:px-6">
                <TrackingTimeline events={order.tracking_history} variant="compact" />
              </div>
            )}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <NavLink
          to={trackOrderPath}
          className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform"
        >
          <PackageSearch size={18} />
          Track Your Order
        </NavLink>
        <NavLink
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium border border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          Continue Shopping
        </NavLink>
      </motion.div>
    </div>
  );
}
