import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { verifyPayment } from '../lib/api';
import { createOrder } from '../features/orders/orderApi';
import { loadRazorpayScript } from '../lib/loadRazorpay';
import { CreateOrderPayload, OrderCreateResponse } from '../types';
import {
  PaymentRecord,
  RazorpayCheckoutOptions,
  RazorpaySuccessResponse,
} from '../types/payment';

interface UseRazorpayReturn {
  isLoading: boolean;
  initiatePayment: (options: RazorpayCheckoutOptions & { orderPayload: CreateOrderPayload }) => Promise<void>;
}

/**
 * Full Razorpay checkout flow integrated with the orders app:
 * 1. Create order + Razorpay order on backend
 * 2. Open Razorpay checkout modal
 * 3. Verify payment signature on backend
 */
export function useRazorpay(): UseRazorpayReturn {
  const [isLoading, setIsLoading] = useState(false);

  const initiatePayment = useCallback(async (options) => {
    const {
      orderPayload,
      description = 'Order Payment',
      prefill,
      onSuccess,
      onFailure,
      onDismiss,
    } = options;

    setIsLoading(true);

    try {
      const orderData: OrderCreateResponse = await createOrder(orderPayload);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Failed to load Razorpay checkout. Please try again.');
      }

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: orderData.key_id,
          amount: orderData.amount_paise,
          currency: orderData.currency,
          name: 'Inni Products',
          description,
          order_id: orderData.razorpay_order_id,
          prefill,
          theme: { color: '#ffffff' },
          handler: async (response: RazorpaySuccessResponse) => {
            try {
              const payment: PaymentRecord = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              toast.success('Payment successful!');
              onSuccess?.(payment);
              resolve();
            } catch (err) {
              const error =
                err instanceof Error ? err : new Error('Payment verification failed');
              toast.error(error.message);
              onFailure?.(error);
              reject(error);
            }
          },
          modal: {
            ondismiss: () => {
              toast.error('Payment cancelled');
              onDismiss?.();
              reject(new Error('Payment cancelled by user'));
            },
          },
        });

        rzp.on('payment.failed', (response: { error: { description: string } }) => {
          const error = new Error(response.error.description || 'Payment failed');
          toast.error(error.message);
          onFailure?.(error);
          reject(error);
        });

        rzp.open();
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Something went wrong during payment');
      if (error.message !== 'Payment cancelled by user') {
        toast.error(error.message);
        onFailure?.(error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, initiatePayment };
}
