import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { fetchAllProducts } from '../lib/api';

export function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts()
      .then(({ products }) => {
        setFeatured(products.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load featured products', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full bg-black">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=2500&q=80"
            alt="Premium Spices"
            className="w-full h-full object-cover brightness-110 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.35)_100%)]" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center text-center mt-20">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-semibold tracking-tighter text-white mb-4"
          >
            Live Tastefully
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-neutral-400 font-light tracking-wide max-w-lg mb-10"
          >
            The purest essence, engineered for culinary professionals.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <NavLink
              to="/shop"
              className="bg-white text-black px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform"
            >
              Buy
            </NavLink>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Highlights */}
      <section className="py-32 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white">Innovation in every pinch.</h2>
            <p className="mt-4 text-lg text-neutral-400 font-light">Refined through generations, perfected by science.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">




            <div className="md:col-span-3 bg-neutral-900 rounded-[2.5rem] p-10 h-80 xl:h-[28rem] relative overflow-hidden flex items-center group border border-white/[0.02]">
              <img
                src="/images/home/innovation-in-every-pinch.png"
                className="absolute inset-0 w-full h-full object-cover object-center brightness-110 contrast-105 xl:group-hover:scale-105 transition-transform duration-1000"
                alt="Explore the authentic flavors of India"
              />
              <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-black/90 via-black/45 to-transparent" />
              <div className="relative z-10 max-w-xl">
                 <h3 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white mb-4 leading-tight">Sourced globally. <br/>Crafted locally.</h3>
                 <p className="text-neutral-400 text-lg">We partner directly with the world's most elite spice farms.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Collection — featured products */}
      <section className="relative py-32 md:py-40 border-t border-white/[0.05] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(227,62,43,0.04),transparent_65%)]" />

        <div className="relative max-w-screen-xl mx-auto px-6">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14 md:mb-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#E33E2B] font-semibold mb-4">
                Curated Selection
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-white">
                The Collection.
              </h2>
            </div>
            <NavLink
              to="/shop"
              className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors shrink-0"
            >
              See all models
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </NavLink>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="rounded-2xl sm:rounded-[2rem] aspect-[3/4] mb-3 sm:mb-5 bg-white/[0.03] border border-white/[0.05]" />
                  <div className="h-4 bg-white/[0.05] rounded w-2/3 mb-2" />
                  <div className="h-3 bg-white/[0.03] rounded w-1/3" />
                </div>
              ))
            ) : (
              featured.map((product, index) => (
                <FeaturedProductCard key={product.id} product={product} index={index} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Premium featured product card for The Collection section */
function FeaturedProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <NavLink to={`/product/${product.id}`} className="group block cursor-pointer">
        {/* Image frame — add product.image URLs in data.ts */}
        <div className="relative mb-3 sm:mb-5 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-white/[0.06] bg-neutral-950 aspect-[3/4] transition-all duration-500 group-hover:border-white/[0.12] group-hover:shadow-[0_24px_60px_-20px_rgba(227,62,43,0.2)]">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Index badge */}
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase">
            0{index + 1}
          </span>
        </div>

        {/* Product info */}
        <div className="px-0.5 sm:px-1">
          <h3 className="text-white font-semibold tracking-tight text-sm sm:text-base mb-1 sm:mb-1.5 line-clamp-2 transition-colors duration-300 group-hover:text-[#E33E2B]">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 font-light">
            From <span className="text-neutral-300 font-medium">₹{product.price}</span>
          </p>
        </div>
      </NavLink>
    </motion.div>
  );
}
