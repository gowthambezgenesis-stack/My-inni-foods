import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { OrderTrackingDashboard } from '../components/tracking/OrderTrackingDashboard';
import { downloadOrderInvoice } from '../features/orders/orderApi';
import { useRealtimeOrderTracking } from '../hooks/useRealtimeOrderTracking';
import { getRecentOrders, removeRecentOrder, type RecentOrder } from '../lib/recentOrders';
import { TrackOrderPayload } from '../types';
import { cn } from '../lib/utils';
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  getPhoneDigits,
  PHONE_COUNTRY_CODES,
} from '../lib/phone';

type VerificationMethod = 'email' | 'mobile';

const PHONE_ERROR = 'Enter valid 10-digit mobile number';

function parseInitialMobile(value: string): string {
  const digits = getPhoneDigits(value);
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function isValidMobile(mobile: string): boolean {
  return getPhoneDigits(mobile).length === 10;
}

const fieldClassName =
  'w-full bg-transparent border-0 border-b border-white/20 py-3 text-white placeholder-neutral-600 outline-none focus:border-[#E33E2B]/80 transition-colors duration-300';

const labelClassName = 'text-sm text-neutral-400';

function formatSavedAt(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

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
  const [mobileCountryCode, setMobileCountryCode] = useState(DEFAULT_PHONE_COUNTRY_CODE);
  const [mobile, setMobile] = useState(parseInitialMobile(initialMobile));
  const [mobileTouched, setMobileTouched] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [activePayload, setActivePayload] = useState<TrackOrderPayload | null>(null);
  const [hasShownFoundToast, setHasShownFoundToast] = useState(false);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(() => getRecentOrders());

  const mobileDigits = getPhoneDigits(mobile);
  const mobileError =
    verificationMethod === 'mobile' && mobile.trim()
      ? mobileDigits.length > 10 || /[a-zA-Z]/.test(mobile)
        ? PHONE_ERROR
        : mobileTouched && mobileDigits.length !== 10
          ? PHONE_ERROR
          : null
      : null;

  const verificationPayload = useMemo(
    () => ({
      order_number: orderNumber.trim().toUpperCase(),
      ...(verificationMethod === 'email'
        ? { email: email.trim().toLowerCase() }
        : { mobile: mobileDigits.slice(0, 10) }),
    }),
    [verificationMethod, orderNumber, email, mobileDigits],
  );

  const {
    order: trackedOrder,
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

  const startTracking = (payload: TrackOrderPayload) => {
    setError('');
    setHasShownFoundToast(false);
    reset();
    setActivePayload(payload);
  };

  const handleTrack = (event: React.FormEvent) => {
    event.preventDefault();

    if (!verificationPayload.order_number) {
      setError('Please enter your order number.');
      return;
    }

    if (verificationMethod === 'email' && !email.trim()) {
      setError('Please enter the email used during checkout.');
      return;
    }

    if (verificationMethod === 'mobile') {
      if (!mobileDigits) {
        setError('Please enter the mobile number used during checkout.');
        return;
      }
      if (!isValidMobile(mobile)) {
        setError(PHONE_ERROR);
        setMobileTouched(true);
        return;
      }
    }

    startTracking(verificationPayload);
  };

  const handleTrackRecent = (recent: RecentOrder) => {
    setVerificationMethod('mobile');
    setOrderNumber(recent.orderNumber);
    setMobile(recent.phone);
    setMobileTouched(true);
    setEmail('');
    startTracking({
      order_number: recent.orderNumber,
      mobile: recent.phone,
    });
  };

  const handleDeleteRecent = (recent: RecentOrder) => {
    removeRecentOrder(recent.orderNumber, recent.phone);
    setRecentOrders(getRecentOrders());
    toast.success('Recent order removed.');
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
    setRecentOrders(getRecentOrders());
  };

  return (
    <div className="bg-black text-white min-h-screen px-4 py-20 sm:px-6 sm:py-28 md:py-32">
      <div className="max-w-6xl mx-auto space-y-8">
        {!trackedOrder ? (
          <>
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
                    onClick={() => {
                      setVerificationMethod('mobile');
                      setMobileTouched(false);
                    }}
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
                      <div
                        className={cn(
                          'flex items-center gap-3 border-b py-1 transition-colors duration-300',
                          mobileError
                            ? 'border-red-500/60 focus-within:border-red-400'
                            : 'border-white/20 focus-within:border-[#E33E2B]/80',
                        )}
                      >
                        <select
                          id="track-mobile-country"
                          value={mobileCountryCode}
                          onChange={(event) => setMobileCountryCode(event.target.value)}
                          aria-label="Country code"
                          className="shrink-0 w-[4.5rem] bg-transparent border-0 py-2 text-white outline-none cursor-pointer"
                        >
                          {PHONE_COUNTRY_CODES.map((option) => (
                            <option key={option.value} value={option.value} className="bg-[#111112]">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <input
                          id="track-mobile"
                          type="tel"
                          value={mobile}
                          onChange={(event) => {
                            const value = event.target.value;
                            setMobile(value);
                            if (/[a-zA-Z]/.test(value) || getPhoneDigits(value).length > 10) {
                              setMobileTouched(true);
                            }
                          }}
                          onBlur={() => setMobileTouched(true)}
                          placeholder="10-digit mobile number"
                          className="flex-1 min-w-0 bg-transparent border-0 py-2 text-white placeholder-neutral-600 outline-none"
                          autoComplete="tel-national"
                          inputMode="numeric"
                          maxLength={15}
                          aria-invalid={Boolean(mobileError)}
                          aria-describedby={mobileError ? 'track-mobile-error' : undefined}
                        />
                      </div>
                      {mobileError && (
                        <p id="track-mobile-error" className="mt-2 text-sm text-red-400">
                          {mobileError}
                        </p>
                      )}
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

            {recentOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="bg-[#111112] border border-white/[0.08] rounded-[2rem] p-6 md:p-8"
              >
                <div className="mb-6">
                  <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mb-2">Saved locally</p>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter">Recent orders</h2>
                  <p className="text-sm text-neutral-500 mt-2">
                    Orders stay here until you delete them.
                  </p>
                </div>

                <ul className="space-y-3">
                  {recentOrders.map((recent) => (
                    <li
                      key={`${recent.orderNumber}-${recent.phone}`}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm sm:text-base text-white">
                          {recent.orderNumber}
                        </p>
                        <p className="mt-1 text-sm text-neutral-400">
                          Phone {recent.phone}
                          <span className="text-neutral-600"> · </span>
                          Saved {formatSavedAt(recent.savedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTrackRecent(recent)}
                          disabled={isSearching}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          <Search size={14} />
                          Track
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecent(recent)}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-red-300 hover:border-red-500/30 transition-colors cursor-pointer"
                          aria-label={`Delete recent order ${recent.orderNumber}`}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <OrderTrackingDashboard
              order={trackedOrder}
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
