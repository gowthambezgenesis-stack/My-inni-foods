import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ComboOffer } from '../../types';

interface ComboOfferCardProps {
  offer: ComboOffer;
  index: number;
}

export function ComboOfferCard({ offer, index }: ComboOfferCardProps) {
  const totalItemValue = offer.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const hasSavings = totalItemValue > offer.offerPrice;
  const savingsPercent = hasSavings
    ? Math.round(((totalItemValue - offer.offerPrice) / totalItemValue) * 100)
    : 0;
  const previewItems = offer.items.slice(0, 4);
  const hasMoreItems = offer.items.length > 4;

  return (
    <article className="group relative flex flex-col h-full">
      <div className="relative flex flex-col h-full rounded-2xl sm:rounded-[2rem] overflow-hidden bg-[#0a0a0a] border border-white/[0.06] group-hover:border-white/[0.12] transition-[border-color,box-shadow] duration-500 group-hover:shadow-[0_24px_80px_-20px_rgba(227,62,43,0.2)]">
        {/* Image header */}
        <div className="relative h-36 sm:h-52 md:h-56 shrink-0 bg-[#0a0a0a] isolate overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={offer.image}
              alt={offer.title}
              className="h-full w-full object-cover will-change-transform transition-transform duration-700 ease-out group-hover:scale-[1.04] [transform:translateZ(0)]"
            />
          </div>
          {/* Solid bottom fade — matches card bg to prevent seam flicker */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0a0a0a] from-25% via-[#0a0a0a]/60 via-50% to-transparent" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#E33E2B]/5 via-transparent to-amber-900/5" />

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-4 sm:left-4 sm:right-4 z-10 flex items-start justify-between gap-1.5 sm:gap-2">
            <span className="inline-flex items-center bg-black/50 backdrop-blur-md border border-white/10 text-[8px] sm:text-[9px] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
              Launch Offer
            </span>
            <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#E33E2B] bg-black/40 backdrop-blur-md border border-[#E33E2B]/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
              0{index + 1}
            </span>
          </div>
        </div>

        {/* Content — overlaps image fade to hide sub-pixel gap */}
        <div className="relative z-10 -mt-px flex flex-col flex-1 p-3 sm:p-6 pt-3 sm:pt-5 bg-[#0a0a0a]">
          <div className="mb-3 sm:mb-5">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-neutral-500 font-medium mb-1.5 sm:mb-2">
              Introductory Hamper
            </p>
            <h3 className="text-sm sm:text-xl md:text-2xl font-semibold tracking-tight text-white group-hover:text-[#E33E2B] transition-colors duration-300 line-clamp-2">
              {offer.title}
            </h3>
          </div>

          {/* Product list */}
          <ul className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
            {previewItems.map((item) => (
              <li
                key={`${offer.id}-${item.name}`}
                className="flex items-start gap-1.5 sm:gap-2.5 text-[10px] sm:text-[11px] md:text-xs leading-relaxed"
              >
                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#E33E2B]/80 shrink-0" />
                <span className="text-neutral-400 font-light line-clamp-2">
                  <span className="text-neutral-200">{item.name}</span>
                  <span className="text-neutral-600"> · </span>
                  {item.weight}
                </span>
              </li>
            ))}
          </ul>

          {hasMoreItems && (
            <Link
              to={`/offers/${offer.id}`}
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-neutral-500 hover:text-[#E33E2B] transition-colors mb-3 sm:mb-6"
            >
              See more
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          {!hasMoreItems && <div className="mb-3 sm:mb-6" />}

          {/* Pricing block */}
          <div className="rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.06] p-2.5 sm:p-4 mb-3 sm:mb-5 group-hover:border-white/[0.1] transition-colors duration-300">
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-neutral-500 font-medium">
                Total Value
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-400 font-light">{offer.totalWeight}</span>
            </div>
            <div className="flex items-end justify-between gap-2 sm:gap-3">
              <span className="text-lg sm:text-2xl font-semibold tracking-tight text-white">
                ₹{offer.offerPrice.toLocaleString('en-IN')}
              </span>
              {hasSavings && (
                <span className="text-[8px] sm:text-[9px] font-bold tracking-widest uppercase text-[#E33E2B] bg-[#E33E2B]/10 border border-[#E33E2B]/20 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                  Save {savingsPercent}%
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <Link
            to={`/offers/${offer.id}`}
            className="group/btn relative flex items-center justify-center gap-2 w-full py-2.5 sm:py-3.5 rounded-full overflow-hidden font-semibold text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98] mt-auto"
          >
            <span className="absolute inset-0 bg-white" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#E33E2B] to-amber-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2 text-black group-hover/btn:text-white transition-colors duration-300">
              Shop Now
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
