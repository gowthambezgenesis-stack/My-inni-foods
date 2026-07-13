export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipping'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';
export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'order_manager' | 'support_agent' | null;
  full_name?: string;
  is_super_admin?: boolean;
  is_admin_staff?: boolean;
  is_active?: boolean;
  date_joined?: string;
}

export interface ProductWeightVariant {
  weight: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  category: string;
  image: string;
  color: string;
  isSignatureKit?: boolean;
  weightVariants?: ProductWeightVariant[];
}

export interface SignatureKit extends Product {
  badge: string;
  story: string;
  originalPrice?: number;
}

export interface ComboOfferItem {
  name: string;
  weight: string;
  price?: number;
}

export interface ComboOffer {
  id: string;
  title: string;
  offerPrice: number;
  totalWeight: string;
  items: ComboOfferItem[];
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  product?: Product;
  product_name?: string;
  product_slug?: string;
  product_image?: string;
  quantity: number;
  price_at_time: number;
  weight: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  phoneCountryCode?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  order_number: string;
  user?: string;
  user_email?: string;
  username?: string | null;
  customer_name?: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  shipping_address: ShippingAddress;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  items_count?: number;
}

export interface CreateOrderItemPayload {
  product_id: string;
  name?: string;
  image?: string;
  quantity: number;
  price: number;
  weight?: string;
}

export interface CreateOrderPayload {
  email?: string;
  shipping_address: ShippingAddress;
  items: CreateOrderItemPayload[];
  total_amount: number;
  shipping_amount?: number;
  currency?: string;
  payment_method?: PaymentMethod;
}

export interface OrderCreateResponse extends Order {
  key_id?: string;
  amount_paise: number;
  currency: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface TrackOrderPayload {
  order_number: string;
  email?: string;
  mobile?: string;
}

export interface OrderTrackingInfo {
  carrier?: string | null;
  tracking_number?: string | null;
}

export interface TrackingHistoryEvent {
  title: string;
  timestamp: string | null;
  location: string;
  completed: boolean;
  is_current: boolean;
}

export interface TrackedOrder {
  order_number: string;
  status: OrderStatus;
  status_label: string;
  order_date: string;
  updated_at: string;
  items: OrderItem[];
  total_amount: number;
  payment_status: PaymentStatus;
  payment_status_label: string;
  shipping_address: ShippingAddress;
  customer_name: string;
  customer_email?: string | null;
  tracking_info: OrderTrackingInfo | null;
  estimated_delivery_date: string | null;
  tracking_history: TrackingHistoryEvent[];
}
