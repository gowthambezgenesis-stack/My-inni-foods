import React, { useRef } from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { COMBO_OFFERS } from '../data';
import { ComboOfferCard } from '../components/offers/ComboOfferCard';

export function Offers() {
  const highlightsSectionRef = useRef<HTMLDivElement>(null);

  const scrollToHighlights = () => {
    highlightsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-[#E33E2B] selection:text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-105 brightness-110 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.35)_100%)]" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.35em] text-[#E33E2B] font-bold mb-5 flex items-center gap-2 drop-shadow">
            INTRODUCTORY LAUNCH OFFER
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white mb-6 leading-tight drop-shadow-2xl">
            Offers
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 font-light leading-relaxed max-w-2xl mb-12 drop-shadow">
            Three exclusive combo hampers — curated masala blends and spice powders at special launch prices.
          </p>
          <button
            onClick={scrollToHighlights}
            className="group relative flex items-center gap-3 bg-white hover:bg-neutral-200 text-black px-9 py-4.5 rounded-full font-medium tracking-wide text-xs transition-all duration-300 transform active:scale-95 shadow-2xl cursor-pointer"
          >
            Browse Offers
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <button onClick={scrollToHighlights} className="text-neutral-500 hover:text-white transition-colors cursor-pointer">
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Combo Offers */}
      <section ref={highlightsSectionRef} className="relative bg-neutral-950/40 border-y border-white/[0.04] py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(227,62,43,0.04),transparent_70%)] pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-[#E33E2B] font-bold mb-4">
              <span className="w-6 h-px bg-[#E33E2B]/40" />
              Introductory Launch Offer
              <span className="w-6 h-px bg-[#E33E2B]/40" />
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-white">
              Combo Offers
            </h2>
            <p className="text-sm md:text-base text-neutral-500 mt-5 leading-relaxed font-light max-w-lg mx-auto">
              Limited-time hampers with our bestselling masalas and spice powders — crafted for the discerning home cook.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {COMBO_OFFERS.map((offer, i) => (
              <ComboOfferCard key={offer.id} offer={offer} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
