import React from 'react';
import { motion } from 'motion/react';

export function About() {
  return (
    <div className="bg-black text-white min-h-screen">
      <section className="pt-32 pb-24 px-6 max-w-screen-md mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-semibold tracking-tighter mb-8"
        >
          The pursuit of perfection.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-neutral-400 leading-relaxed font-light"
        >
          We believe that every ingredient should be uncompromising. We scoured the globe to find the most intense, pure, and aromatic spices in existence.
        </motion.p>
      </section>

      <section className="h-[60vh] md:h-screen w-full relative">
        <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=2500&q=80" alt="Spice textures" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </section>

      <section className="py-32 px-6 max-w-screen-lg mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter mb-6">Unadulterated.</h2>
               <p className="text-neutral-400 text-lg leading-relaxed font-light">Most commercial spices are filled with bulking agents and artificial colors. inni spices contain 100% pure ingredients—nothing elses. The result is a flavor profile that is intensely vivid and true to its origin.</p>
            </div>
            <div className="bg-[#111] aspect-square rounded-[2rem] overflow-hidden border border-white/10 relative">
               <img src="https://deliciousfoods.in/cdn/shop/articles/spices.jpg?v=1742457010" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" alt="Turmeric macro"/>
               <div className="absolute inset-0 bg-amber-500/20 mix-blend-color" />
            </div>
         </div>
      </section>
    </div>
  );
}
