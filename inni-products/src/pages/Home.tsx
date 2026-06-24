import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
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
            className="w-full h-full object-cover opacity-[0.35] mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center text-center mt-20">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-semibold tracking-tighter text-white mb-4"
          >
            Pro flavor.
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
            className="flex items-center gap-4"
          >
            <NavLink
              to="/shop"
              className="bg-white text-black px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform"
            >
              Buy
            </NavLink>
            <NavLink
              to="/about"
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-8 py-3 rounded-full font-medium hover:bg-white/20 transition-colors"
            >
              Learn more
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
              <img src="https://cdn.shopify.com/s/files/1/0557/4269/3571/files/shutterstock_2203182523_480x480.jpg?v=1724029756" className="absolute inset-0 w-full h-full object-cover opacity-40 xl:group-hover:scale-105 transition-transform duration-1000 mix-blend-luminosity" alt="Coriander"/>
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
              <div className="relative z-10 max-w-xl">
                 <h3 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white mb-4 leading-tight">Sourced globally. <br/>Crafted locally.</h3>
                 <p className="text-neutral-400 text-lg">We partner directly with the world's most elite spice farms.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Gallery Carousel-Style */}
      <section className="py-32 border-t border-white/[0.05]">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white">The Collection.</h2>
            <NavLink to="/shop" className="text-neutral-400 hover:text-white transition-colors underline underline-offset-4 text-sm font-medium">See all models</NavLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-neutral-900 rounded-3xl aspect-[3/4] mb-4 border border-white/5 relative overflow-hidden" />
                  <div className="h-4 bg-neutral-900 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-neutral-900 rounded w-1/3" />
                </div>
              ))
            ) : (
              featured.map((product) => (
                <NavLink to={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                  <div className="bg-[#0a0a0a] rounded-3xl p-6 aspect-[3/4] relative overflow-hidden mb-4 border border-white/5 transition-colors group-hover:border-white/20">
                    <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-50 xl:group-hover:scale-105 transition-transform duration-700" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${product.color} opacity-10 mix-blend-color group-hover:opacity-30 transition-opacity`}></div>
                  </div>
                  <h3 className="text-white font-medium mb-1">{product.name}</h3>
                  <p className="text-neutral-500 text-sm">From ₹{product.price}</p>
                </NavLink>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
