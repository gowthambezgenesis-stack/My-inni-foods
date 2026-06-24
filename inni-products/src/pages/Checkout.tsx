import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { RazorpayCheckout } from '../components/RazorpayCheckout';
import { PaymentRecord } from '../types/payment';
import { cn } from '../lib/utils';

const PHONE_ERROR = 'Enter valid number';

function getPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

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

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const [phoneTouched, setPhoneTouched] = useState(false);

  const phoneError = getPhoneError(formData.phone, phoneTouched);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + (cartItems.length > 0 ? shipping : 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'phone' && (/[a-zA-Z]/.test(value) || getPhoneDigits(value).length > 10)) {
      setPhoneTouched(true);
    }
  };

  const handlePaymentSuccess = (payment: PaymentRecord) => {
    clearCart();
    navigate('/success', {
      state: {
        payment,
        orderNumber: payment.order_id,
        email: formData.email.trim().toLowerCase(),
        mobile: getPhoneDigits(formData.phone),
      },
    });
  };

  const orderPayload = {
    email: formData.email.trim().toLowerCase(),
    shipping_address: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: getPhoneDigits(formData.phone),
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
    },
    items: cartItems.map(item => ({
      product_id: item.product.id,
      name: item.product.name,
      image: item.product.image,
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
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="Phone Number (10 digits)"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={15}
                  aria-invalid={Boolean(phoneError)}
                  aria-describedby={phoneError ? 'phone-error' : undefined}
                  className={cn(
                    'w-full bg-[#111] border rounded-xl px-4 py-3 outline-none transition-colors text-white placeholder-neutral-500',
                    phoneError
                      ? 'border-red-500/60 focus:border-red-400'
                      : 'border-white/10 focus:border-white/50',
                  )}
                />
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
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="col-span-1 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="col-span-1 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <input required type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Street Address" className="col-span-2 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="col-span-2 sm:col-span-1 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <input required type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State / Province" className="col-span-1 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
                <input required type="text" name="zip" value={formData.zip} onChange={handleInputChange} placeholder="ZIP / Postal Code" className="col-span-1 border border-white/10 bg-[#111] rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-colors text-white placeholder-neutral-500" />
              </div>
            </div>

            {/* Payment — handled by Razorpay secure checkout */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium border-b border-white/10 pb-2">Payment</h2>
              <p className="text-sm text-neutral-400">
                You will be redirected to Razorpay&apos;s secure checkout to complete your payment.
              </p>
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
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8 text-xl font-semibold text-white">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <RazorpayCheckout
              orderPayload={orderPayload}
              description="Inni Products Order"
              prefill={{
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                contact: getPhoneDigits(formData.phone),
              }}
              buttonLabel={`Pay ₹${total}`}
              disabled={
                !formData.email ||
                !isValidPhone(formData.phone) ||
                !formData.firstName ||
                !formData.lastName ||
                !formData.address ||
                !formData.city ||
                !formData.state ||
                !formData.zip
              }
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
