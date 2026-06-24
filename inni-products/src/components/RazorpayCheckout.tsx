import { Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useRazorpay } from '../hooks/useRazorpay';
import { CreateOrderPayload } from '../types';
import { PaymentRecord, RazorpayCheckoutPrefill } from '../types/payment';

export interface RazorpayCheckoutProps {
  orderPayload: CreateOrderPayload;
  description?: string;
  prefill?: RazorpayCheckoutPrefill;
  disabled?: boolean;
  buttonLabel?: string;
  className?: string;
  onSuccess?: (payment: PaymentRecord) => void;
  onFailure?: (error: Error) => void;
  onDismiss?: () => void;
}

/**
 * Reusable Razorpay checkout button wired to the orders API.
 */
export function RazorpayCheckout({
  orderPayload,
  description,
  prefill,
  disabled = false,
  buttonLabel,
  className,
  onSuccess,
  onFailure,
  onDismiss,
}: RazorpayCheckoutProps) {
  const { isLoading, initiatePayment } = useRazorpay();

  const handlePay = async () => {
    await initiatePayment({
      orderPayload,
      description,
      prefill,
      onSuccess,
      onFailure,
      onDismiss,
    });
  };

  const label = buttonLabel ?? `Pay ₹${orderPayload.total_amount}`;

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={disabled || isLoading}
      className={cn(
        'w-full bg-white text-black py-4 rounded-xl font-medium text-lg flex justify-center items-center transition-all',
        disabled || isLoading ? 'opacity-70 scale-[0.98] cursor-not-allowed' : 'hover:bg-neutral-200',
        className,
      )}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
          />
          Processing...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {label}
          <Lock size={16} className="text-neutral-600" />
        </span>
      )}
    </button>
  );
}
