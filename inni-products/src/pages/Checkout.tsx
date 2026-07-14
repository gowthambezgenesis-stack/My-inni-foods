import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { Banknote, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { RazorpayCheckout } from '../components/RazorpayCheckout';
import { PaymentRecord } from '../types/payment';
import { createOrder } from '../features/orders/orderApi';
import { PaymentMethod } from '../types';
import { useCheckoutStore, type ShippingInfo } from '../store/checkoutStore';
import { cn, normalizeProductImageUrl } from '../lib/utils';
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  getPhoneDigits,
  PHONE_COUNTRY_CODES,
} from '../lib/phone';

const PHONE_ERROR = 'Enter valid number';

function isValidPhone(phone: string): boolean {
  return getPhoneDigits(phone).length === 10;
}

function getPhoneError(phone: string, showValidation: boolean): string | null {
  if (!phone.trim()) {
    return null;
  }
  if (/[a-zA-Z]/.test(phone)) {
    return PHONE_ERROR;
  }
  const digits = getPhoneDigits(phone);
  if (digits.length > 10) {
    return PHONE_ERROR;
  }
  if (showValidation && digits.length !== 10) {
    return PHONE_ERROR;
  }
  return null;
}

export function Checkout() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const shippingInfo = useCheckoutStore((state) => state.shippingInfo);
  const updateShippingInfo = useCheckoutStore((state) => state.updateShippingInfo);
  const clearShippingInfo = useCheckoutStore((state) => state.clearShippingInfo);

  const [phoneTouched, setPhoneTouched] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [isPlacingCodOrder, setIsPlacingCodOrder] = useState(false);

  const phoneCountryCode = shippingInfo.phoneCountryCode || DEFAULT_PHONE_COUNTRY_CODE;
  const phoneError = getPhoneError(shippingInfo.phone, phoneTouched);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = 0;
  const total = subtotal + (cartItems.length > 0 ? shipping : 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateShippingInfo({ [name]: value } as Partial<ShippingInfo>);
    if (name === 'phone' && (/[a-zA-Z]/.test(value) || getPhoneDigits(value).length > 10)) {
      setPhoneTouched(true);
    }
  };

  const handleCountryCodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateShippingInfo({ phoneCountryCode: event.target.value });
  };

  const handlePaymentSuccess = (payment: PaymentRecord) => {
    clearCart();
    clearShippingInfo();
    navigate('/success', {
      state: {
        payment,
        orderNumber: payment.order_id,
        email: shippingInfo.email.trim().toLowerCase(),
        mobile: getPhoneDigits(shippingInfo.phone),
        isCod: false,
      },
    });
  };

  const isFormComplete =
    Boolean(shippingInfo.email) &&
    isValidPhone(shippingInfo.phone) &&
    Boolean(shippingInfo.firstName) &&
    Boolean(shippingInfo.lastName) &&
    Boolean(shippingInfo.address) &&
    Boolean(shippingInfo.city) &&
    Boolean(shippingInfo.state) &&
    Boolean(shippingInfo.zip);

  const handleCodPlaceOrder = async () => {
    if (!isFormComplete) return;

    setIsPlacingCodOrder(true);
    try {
      const order = await createOrder({
        ...orderPayload,
        payment_method: 'cod',
      });

      clearCart();
      clearShippingInfo();
      toast.success('Order placed successfully!');
      navigate('/success', {
        state: {
          orderNumber: order.order_number,
          email: shippingInfo.email.trim().toLowerCase(),
          mobile: getPhoneDigits(shippingInfo.phone),
          isCod: true,
        },
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string; detail?: string } } })?.response?.data
          ?.error ||
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Unable to place your order. Please try again.';
      toast.error(typeof message === 'string' ? message : 'Unable to place your order. Please try again.');
    } finally {
      setIsPlacingCodOrder(false);
    }
  };

  const orderPayload = {
    email: shippingInfo.email.trim().toLowerCase(),
    shipping_address: {
      firstName: shippingInfo.firstName,
      lastName: shippingInfo.lastName,
      phone: getPhoneDigits(shippingInfo.phone),
      phoneCountryCode,
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip: shippingInfo.zip,
    },
    items: cartItems.map(item => ({
      product_id: item.product.id,
      name: item.product.name,
      image: normalizeProductImageUrl(item.product.image),
      quantity: item.quantity,
      price: item.product.price,
      weight: item.product.weight,
    })),
    total_amount: total,
    shipping_amount: shipping,
    currency: 'INR',
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-32 flex flex-col items-center text-white">
        <h1 className="text-3xl font-semibold mb-6">Your bag is empty.</h1>
        <button onClick={() => navigate('/shop')} className="bg-white text-black px-8 py-3 rounded-full font-medium">Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-32 text-white">
      <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Column - Forms */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-semibold tracking-tighter mb-8 text-white">Checkout.</h1>
          
          <form id="checkout-form" className="space-y-10">
            {/* Contact Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium border-b border-white/10 pb-2">Contact Information</h2>
              <div className="space-y-2">
                <input required type="email" name="email" value={shippingInfo.email} onChange={handleInputChange} placeholder="Email Address" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <div className="flex gap-3">
                  <select
                    name="phoneCountryCode"
                    value={phoneCountryCode}
                    onChange={handleCountryCodeChange}
                    aria-label="Country code"
                    className="shrink-0 w-[5.5rem] bg-[#111] border border-white/10 rounded-xl px-3 py-3 outline-none focus:border-white/50 transition-colors text-white"
                  >
                    {PHONE_COUNTRY_CODES.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#111]">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    onBlur={() => setPhoneTouched(true)}
                    placeholder="Phone Number (10 digits)"
                    autoComplete="tel-national"
                    inputMode="numeric"
                    maxLength={15}
                    aria-invalid={Boolean(phoneError)}
                    aria-describedby={phoneError ? 'phone-error' : undefined}
                    className={cn(
                      'flex-1 min-w-0 bg-[#111] border rounded-xl px-4 py-3 outline-none transition-colors text-white placeholder-neutral-500',
                      phoneError
                        ? 'border-red-500/60 focus:border-red-400'
                        : 'border-white/10 focus:border-white/50',
                    )}
                  />
                </div>
                {phoneError && (
                  <p id="phone-error" className="text-sm text-red-400">
                    {phoneError}
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium border-b border-white/10 pb-2">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} placeholder="First Name" className="col-span-1 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <input required type="text" name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} placeholder="Last Name" className="col-span-1 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <input required type="text" name="address" value={shippingInfo.address} onChange={handleInputChange} placeholder="Street Address" className="col-span-2 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <input required type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} placeholder="City" className="col-span-2 sm:col-span-1 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <input required type="text" name="state" value={shippingInfo.state} onChange={handleInputChange} placeholder="State / Province" className="col-span-1 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <input required type="text" name="zip" value={shippingInfo.zip} onChange={handleInputChange} placeholder="ZIP / Postal Code" className="col-span-1 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium border-b border-white/10 pb-2">Payment</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={cn(
                    'rounded-2xl border px-4 py-4 text-left transition-all',
                    paymentMethod === 'razorpay'
                      ? 'border-white/40 bg-white/[0.06]'
                      : 'border-white/10 bg-[#111] hover:border-white/20',
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <CreditCard size={16} />
                    Pay Online
                  </span>
                  <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                    Secure checkout via Razorpay (UPI, cards, netbanking).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={cn(
                    'rounded-2xl border px-4 py-4 text-left transition-all',
                    paymentMethod === 'cod'
                      ? 'border-white/40 bg-white/[0.06]'
                      : 'border-white/10 bg-[#111] hover:border-white/20',
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <Banknote size={16} />
                    Cash on Delivery
                  </span>
                  <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                    Pay in cash when your order arrives. Payment stays pending until delivery.
                  </p>
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Right Column - Summary */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:pl-12">
          <div className="bg-[#111] rounded-[2rem] p-8 border border-white/10 sticky top-24">
            <h2 className="text-xl font-medium mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
              {cartItems.map(item => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-black overflow-hidden relative shrink-0">
                    <img src={item.product.image} className="w-full h-full object-cover opacity-70" alt={item.product.name} />
                    <div className="absolute top-0 right-0 bg-white/20 backdrop-blur w-5 h-5 flex items-center justify-center rounded-bl-lg text-[10px] font-bold">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-white">{item.product.name}</p>
                      <p className="text-xs text-neutral-500">{item.product.weight}</p>
                    </div>
                    <p className="font-medium text-sm">₹{item.product.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3 mb-6 text-sm text-neutral-400">
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8 text-xl font-semibold text-white">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            {paymentMethod === 'razorpay' ? (
              <RazorpayCheckout
                orderPayload={{ ...orderPayload, payment_method: 'razorpay' }}
                description="Inni Products Order"
                prefill={{
                  name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
                  email: shippingInfo.email,
                  contact: getPhoneDigits(shippingInfo.phone),
                }}
                buttonLabel={`Pay ₹${total}`}
                disabled={!isFormComplete}
                onSuccess={handlePaymentSuccess}
              />
            ) : (
              <button
                type="button"
                onClick={handleCodPlaceOrder}
                disabled={!isFormComplete || isPlacingCodOrder}
                className={cn(
                  'w-full bg-white text-black py-4 rounded-xl font-medium text-lg flex justify-center items-center transition-all',
                  !isFormComplete || isPlacingCodOrder
                    ? 'opacity-70 scale-[0.98] cursor-not-allowed'
                    : 'hover:bg-neutral-200',
                )}
              >
                {isPlacingCodOrder ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Placing order...
                  </span>
                ) : (
                  `Place Order · ₹${total}`
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
