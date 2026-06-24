import React from 'react';

export function Partner() {
  return (
    <div className="bg-black min-h-screen text-white pt-32 pb-24">
      <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        <div className="sticky top-32">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-6">Partner with inni.</h1>
          <p className="text-xl text-neutral-400 font-light mb-12">Bring the absolute highest grade of culinary flavor to your restaurant, retail space, or commercial kitchen.</p>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-white font-medium text-xl mb-2">Wholesale Volumes</h3>
              <p className="text-neutral-500 font-light">Tiered pricing for bulk orders tailored to your operational scale.</p>
            </div>
            <div className="h-px bg-white/[0.08] w-full" />
            <div>
              <h3 className="text-white font-medium text-xl mb-2">Custom Blending</h3>
              <p className="text-neutral-500 font-light">Collaborate with our flavor architects for your signature spice blend.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111112] p-8 md:p-12 flex flex-col gap-6 rounded-[2.5rem] border border-white/[0.05] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          
          <h2 className="text-2xl font-semibold z-10 relative mb-4">Application Form</h2>
          
          <div className="space-y-2 z-10 relative">
            <label className="text-xs text-neutral-400 font-medium tracking-wide uppercase">Business Name</label>
            <input type="text" className="w-full bg-black border border-white/[0.1] rounded-2xl px-5 py-4 placeholder-neutral-700 text-white outline-none focus:border-white transition-colors" placeholder="Acme Dining Group" />
          </div>

          <div className="space-y-2 z-10 relative">
            <label className="text-xs text-neutral-400 font-medium tracking-wide uppercase">Email Address</label>
            <input type="email" className="w-full bg-black border border-white/[0.1] rounded-2xl px-5 py-4 placeholder-neutral-700 text-white outline-none focus:border-white transition-colors" placeholder="hello@example.com" />
          </div>

          <div className="space-y-2 z-10 relative text-white">
            <label className="text-xs text-neutral-400 font-medium tracking-wide uppercase">Partnership Type</label>
            <select className="w-full bg-black border border-white/[0.1] rounded-2xl px-5 py-4 text-white outline-none focus:border-white transition-colors appearance-none">
              <option>Restaurant / Chef</option>
              <option>Retail Distributor</option>
              <option>Catering / Events</option>
            </select>
          </div>

          <button className="w-full bg-white text-black py-4 rounded-xl font-medium mt-6 hover:scale-[1.02] transition-transform z-10 relative">
            Submit Application
          </button>
        </div>

      </div>
    </div>
  );
}
