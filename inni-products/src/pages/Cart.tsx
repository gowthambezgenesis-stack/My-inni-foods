import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../hooks/useCart';
import { NavLink } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { getCartLineKey } from '../lib/productVariants';

export function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + (cartItems.length > 0 ? shipping : 0);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-black pt-28 pb-32 text-white selection:bg-[#E33E2B] selection:text-white">
      <div className="max-w-screen-lg mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#E33E2B] font-semibold mb-4">
            Your Selection
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white">
            {cartItems.length > 0 ? 'Review your bag.' : 'Your bag is empty.'}
          </h1>
          {cartItems.length > 0 && (
            <p className="mt-3 text-sm text-neutral-500 font-light">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} · Curated for your kitchen
            </p>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center max-w-sm mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-neutral-500 mb-6">
              <ShoppingBag size={24} strokeWidth={1.5} />
            </div>
            <p className="text-neutral-500 mb-8 font-light leading-relaxed">
              Explore our collection of premium masalas and spice powders.
            </p>
            <NavLink
              to="/shop"
              className="group inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-neutral-200 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </NavLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Items */}
            <div className="lg:col-span-7 space-y-4">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => {
                  const lineKey = getCartLineKey(item.product);
                  return (
                  <motion.article
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, height: 0, marginBottom: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.25 }}
                    key={lineKey}
                    className="group flex gap-5 md:gap-6 p-4 md:p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors duration-300"
                  >
                    {/* Image */}
                    <div className="relative w-24 h-28 md:w-28 md:h-32 shrink-0 rounded-2xl overflow-hidden bg-neutral-950 border border-white/[0.06]">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">
                            INNI
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <h3 className="text-base md:text-lg font-semibold text-white tracking-tight truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-neutral-500 text-xs md:text-sm mt-1 font-light">
                            {item.product.weight}
                          </p>
                          <p className="text-neutral-600 text-xs mt-0.5">
                            ₹{item.product.price.toLocaleString('en-IN')} each
                          </p>
                        </div>
                        <p className="text-base md:text-lg font-semibold text-white shrink-0 tracking-tight">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 md:mt-5">
                        {/* Quantity */}
                        <div className="inline-flex items-center rounded-full border border-white/[0.1] bg-black/40 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(lineKey, item.quantity - 1)}
                            className="flex items-center justify-center w-9 h-9 text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                            aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                          >
                            {item.quantity === 1 ? <Trash2 size={15} /> : <Minus size={15} />}
                          </button>
                          <span className="w-8 text-center text-sm font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(lineKey, item.quantity + 1)}
                            className="flex items-center justify-center w-9 h-9 text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(lineKey)}
                          className="text-xs text-neutral-500 hover:text-[#E33E2B] transition-colors tracking-wide"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.article>
                  );
                })}
              </AnimatePresence>

              <NavLink
                to="/shop"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors mt-2 px-1"
              >
                <ArrowRight className="w-3 h-3 rotate-180" />
                Continue shopping
              </NavLink>
            </div>

            {/* Summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
                <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 pb-6 border-b border-white/[0.06]">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Shipping</span>
                    <span className="font-medium tabular-nums text-emerald-400">Free</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="text-white font-medium tabular-nums">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline py-6">
                  <span className="text-sm uppercase tracking-[0.15em] text-neutral-500 font-medium">
                    Total
                  </span>
                  <span className="text-3xl font-semibold tracking-tight tabular-nums">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                <NavLink
                  to="/checkout"
                  className="group relative flex items-center justify-center gap-2.5 w-full py-4 rounded-full overflow-hidden font-semibold text-sm tracking-[0.12em] uppercase transition-all duration-300 active:scale-[0.98]"
                >
                  <span className="absolute inset-0 bg-white" />
                  <span className="absolute inset-0 bg-gradient-to-r from-[#E33E2B] to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 text-black group-hover:text-white transition-colors duration-300">
                    Check Out
                  </span>
                  <ArrowRight className="relative z-10 w-4 h-4 text-black group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5" />
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
