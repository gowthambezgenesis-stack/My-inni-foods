import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ShoppingBag,
  Package,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from '../hooks/useCart';
import { comboOfferToProduct, getComboOfferById } from '../data';

export function ComboOfferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [added, setAdded] = useState(false);

  const offer = id ? getComboOfferById(id) : undefined;

  if (!offer) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
        <h2 className="text-3xl font-semibold mb-4 text-neutral-400">Offer not found</h2>
        <button
          onClick={() => navigate('/offers')}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Offers
        </button>
      </div>
    );
  }

  const cartProduct = comboOfferToProduct(offer);
  const inCartCount = cartItems.find((i) => i.product.id === offer.id)?.quantity || 0;
  const totalItemValue = offer.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const hasSavings = totalItemValue > offer.offerPrice;
  const savingsPercent = hasSavings
    ? Math.round(((totalItemValue - offer.offerPrice) / totalItemValue) * 100)
    : 0;

  const handleAdd = () => {
    addToCart(cartProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-32 text-white selection:bg-[#E33E2B] selection:text-white">
      {/* Subtle page texture */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(227,62,43,0.06),transparent_50%)]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,rgba(180,83,9,0.04),transparent_50%)]" />

      <div className="relative max-w-screen-xl mx-auto px-6">
        <button
          onClick={() => navigate('/offers')}
          className="group flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-all mb-10 md:mb-14 hover:-translate-x-1 duration-300"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] group-hover:border-white/20 transition-colors">
            <ArrowLeft size={14} />
          </span>
          <span className="tracking-wide">Back to Offers</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left — Hero image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 xl:col-span-6 lg:sticky lg:top-28"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#E33E2B]/15 via-transparent to-amber-600/10 rounded-[3rem] blur-2xl opacity-60" />

              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-neutral-950 border border-white/[0.08] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] group">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#E33E2B]/15 via-transparent to-amber-900/20 mix-blend-overlay" />

                <div className="absolute top-5 left-5">
                  <span className="inline-flex items-center bg-black/50 backdrop-blur-xl border border-white/10 text-[10px] font-bold tracking-[0.25em] uppercase text-white px-4 py-2 rounded-full">
                    Launch Offer
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-8">
                  <p className="text-[10px] tracking-[0.35em] uppercase text-neutral-500 font-medium mb-1">
                    Premium Hamper
                  </p>
                  <p className="text-lg font-semibold tracking-tight text-white/90">
                    {offer.totalWeight}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Details */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7 xl:col-span-6 flex flex-col"
          >
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[#E33E2B] font-bold mb-5">
              <span className="w-8 h-px bg-[#E33E2B]/50" />
              Combo Hamper
            </span>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-semibold tracking-tighter text-white leading-[1.05] mb-3">
              {offer.title}
            </h1>
            <p className="text-neutral-500 font-light text-sm md:text-base mb-10 max-w-md leading-relaxed">
              Introductory launch hamper — a curated selection of inni masalas and spice powders at an exclusive bundle price.
            </p>

            {/* Pricing card */}
            <div className="relative rounded-3xl overflow-hidden mb-10 border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.01]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E33E2B]/10 rounded-full blur-3xl" />
              <div className="relative p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-medium mb-3">
                      Offer Price
                    </p>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
                        ₹{offer.offerPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  {hasSavings && (
                    <span className="inline-flex items-center bg-[#E33E2B] text-white text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full shadow-lg shadow-[#E33E2B]/20">
                      Save {savingsPercent}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-black/40 border border-white/[0.06] px-4 py-3.5">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 mb-1">Total Value</p>
                    <p className="text-sm font-medium text-white">{offer.totalWeight}</p>
                  </div>
                  <div className="rounded-2xl bg-black/40 border border-white/[0.06] px-4 py-3.5">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 mb-1">Items Included</p>
                    <p className="text-sm font-medium text-white">{offer.items.length} products</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Included items */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <Package className="w-4 h-4 text-[#E33E2B]" />
                <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-semibold">
                  This hamper includes
                </h2>
              </div>

              <ul className="rounded-3xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.05] overflow-hidden">
                {offer.items.map((item, idx) => (
                  <li
                    key={`${offer.id}-${item.name}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] text-neutral-500 font-medium shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm text-neutral-200 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <span className="text-xs text-neutral-500">{item.weight}</span>
                      {item.price != null && (
                        <span className="text-xs font-medium text-neutral-400 w-12">₹{item.price}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add to bag */}
            <div className="flex flex-col gap-3 mb-12">
              <button
                onClick={handleAdd}
                className={cn(
                  'group relative w-full py-4 md:py-5 rounded-full font-semibold text-sm tracking-[0.12em] uppercase overflow-hidden transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl',
                  added
                    ? 'bg-emerald-600 text-white shadow-emerald-900/30'
                    : 'bg-white text-black shadow-white/10 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.25)]',
                )}
              >
                {!added && (
                  <span className="absolute inset-0 bg-gradient-to-r from-[#E33E2B] to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                )}
                <ShoppingBag
                  size={18}
                  className={cn('relative z-10 transition-colors', !added && 'group-hover:text-white')}
                />
                <span className={cn('relative z-10 transition-colors', !added && 'group-hover:text-white')}>
                  {added ? 'Added to Bag' : 'Add to Bag'}
                </span>
              </button>

              {inCartCount > 0 && (
                <p className="text-xs text-neutral-500 text-center">
                  <span className="text-white font-medium">{inCartCount}</span> in your bag
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
