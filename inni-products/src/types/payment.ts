export type PaymentStatus = 'pending' | 'success' | 'failed';

/** @deprecated Use CreateOrderPayload from types/index.ts — kept for legacy payment endpoints */
export interface LegacyPaymentOrderPayload {
  amount: number;
  currency?: string;
  notes?: Record<string, unknown>;
}

export interface LegacyCreateOrderResponse {
  order_id: string;
  razorpay_order_id: string;
  amount: number;
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  key_id: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentRecord {
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayCheckoutOptions {
  description?: string;
  prefill?: RazorpayCheckoutPrefill;
  onSuccess?: (payment: PaymentRecord) => void;
  onFailure?: (error: Error) => void;
  onDismiss?: () => void;
}
