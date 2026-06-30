import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { OrderTrackingDashboard } from '../components/tracking/OrderTrackingDashboard';
import { downloadOrderInvoice } from '../features/orders/orderApi';
import { useRealtimeOrderTracking } from '../hooks/useRealtimeOrderTracking';
import { TrackOrderPayload } from '../types';
import { cn } from '../lib/utils';

type VerificationMethod = 'email' | 'mobile';

const fieldClassName =
  'w-full bg-transparent border-0 border-b border-white/20 py-3 text-white placeholder-neutral-600 outline-none focus:border-[#E33E2B]/80 transition-colors duration-300';

const labelClassName = 'text-sm text-neutral-400';

export function TrackOrder() {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('order') ?? '';
  const initialEmail = searchParams.get('email') ?? '';
  const initialMobile = searchParams.get('mobile') ?? '';

  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(
    initialMobile ? 'mobile' : 'email',
  );
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState(initialEmail);
  const [mobile, setMobile] = useState(initialMobile);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [activePayload, setActivePayload] = useState<TrackOrderPayload | null>(null);
  const [hasShownFoundToast, setHasShownFoundToast] = useState(false);

  const verificationPayload = useMemo(
    () => ({
      order_number: orderNumber.trim().toUpperCase(),
      ...(verificationMethod === 'email'
        ? { email: email.trim().toLowerCase() }
        : { mobile: mobile.replace(/\D/g, '') }),
    }),
    [verificationMethod, orderNumber, email, mobile],
  );

  const {
    order: trackedOrder,
    lastUpdated,
    loading: isTrackingLoading,
    error: trackingError,
    reset,
  } = useRealtimeOrderTracking({
    payload: activePayload,
    enabled: Boolean(activePayload),
  });

  const isSearching = Boolean(activePayload) && isTrackingLoading && !trackedOrder;

  React.useEffect(() => {
    if (trackingError && activePayload) {
      setError(trackingError);
      setActivePayload(null);
      setHasShownFoundToast(false);
      reset();
      toast.error(trackingError);
    }
  }, [trackingError, activePayload, reset]);

  React.useEffect(() => {
    if (trackedOrder && activePayload && !hasShownFoundToast) {
      setHasShownFoundToast(true);
      toast.success('Order found.');
    }
  }, [trackedOrder, activePayload, hasShownFoundToast]);

  const handleTrack = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setHasShownFoundToast(false);

    if (!verificationPayload.order_number) {
      setError('Please enter your order number.');
      return;
    }

    if (verificationMethod === 'email' && !verificationPayload.email) {
      setError('Please enter the email used during checkout.');
      return;
    }

    if (verificationMethod === 'mobile' && !verificationPayload.mobile) {
      setError('Please enter the mobile number used during checkout.');
      return;
    }

    reset();
    setActivePayload(verificationPayload);
  };

  const handleDownloadInvoice = async () => {
    if (!activePayload) {
      return;
    }

    setIsDownloading(true);
    try {
      await downloadOrderInvoice(activePayload);
      toast.success('Invoice downloaded.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to download invoice.';
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const resetSearch = () => {
    setActivePayload(null);
    setHasShownFoundToast(false);
    reset();
    setError('');
  };

  return (
    <div className="bg-black text-white min-h-screen px-6 py-28 md:py-32">
      <div className="max-w-6xl mx-auto">
        {!trackedOrder ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#111112] border border-white/[0.08] rounded-[2.5rem] p-8 md:p-12 lg:p-14 shadow-2xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 md:mb-12">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mb-3">Guest lookup</p>
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter leading-[0.95]">
                  Track order.
                </h1>
                <p className="text-neutral-400 font-light mt-4 max-w-xl">
                  Enter your order number with the email or mobile number used at checkout to view
                  live delivery status and tracking history.
                </p>
              </div>
              <div className="inline-flex rounded-full border border-white/10 p-1 bg-black/40">
                <button
                  type="button"
                  onClick={() => setVerificationMethod('email')}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm transition-colors cursor-pointer',
                    verificationMethod === 'email'
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white',
                  )}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod('mobile')}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm transition-colors cursor-pointer',
                    verificationMethod === 'mobile'
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white',
                  )}
                >
                  Mobile
                </button>
              </div>
            </div>

            <form onSubmit={handleTrack} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="track-order-number" className={labelClassName}>
                    Order number <span className="text-[#E33E2B]">*</span>
                  </label>
                  <input
                    id="track-order-number"
                    type="text"
                    value={orderNumber}
                    onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
                    placeholder="IN-AB12CD34"
                    className={fieldClassName}
                    autoComplete="off"
                  />
                </div>

                {verificationMethod === 'email' ? (
                  <div>
                    <label htmlFor="track-email" className={labelClassName}>
                      Email address <span className="text-[#E33E2B]">*</span>
                    </label>
                    <input
                      id="track-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className={fieldClassName}
                      autoComplete="email"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="track-mobile" className={labelClassName}>
                      Mobile number <span className="text-[#E33E2B]">*</span>
                    </label>
                    <input
                      id="track-mobile"
                      type="tel"
                      value={mobile}
                      onChange={(event) => setMobile(event.target.value)}
                      placeholder="10-digit mobile number"
                      className={fieldClassName}
                      autoComplete="tel"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSearching ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Track Order
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <OrderTrackingDashboard
              order={trackedOrder}
              lastUpdated={lastUpdated}
              isRefreshing={isTrackingLoading}
              isDownloading={isDownloading}
              onDownloadInvoice={handleDownloadInvoice}
              onTrackAnother={resetSearch}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default TrackOrder;
