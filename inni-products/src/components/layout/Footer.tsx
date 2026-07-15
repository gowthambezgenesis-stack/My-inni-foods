import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();
  const links = [
    { name: 'Shop', path: '/shop' },
    { name: 'Offers', path: '/offers' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'Get Now', path: '/contact' },
  ];

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/partner');
  };

  return (
    <footer className="bg-black border-t border-white/[0.08] py-12 text-xs">
      <div className="max-w-screen-xl mx-auto px-6 text-neutral-400">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 pb-12">
          <div className="col-span-1 md:col-span-1">
            <span className="font-bold tracking-tight text-2xl text-white block mb-3">INNI</span>
            <address className="not-italic leading-relaxed text-neutral-500 text-xs space-y-0.5">
              <span className="block text-neutral-400">Oakroad Ventures Private Limited</span>
              <span className="block">Site No. 2</span>
              <span className="block">Off Bileshivale Main Road</span>
              <span className="block">Bangalore – 560077</span>
            </address>
          </div>
          <div className="col-span-1 md:col-span-2 flex items-start md:pl-12 pt-2">
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm font-semibold tracking-wide transition-colors ${isActive ? "text-white" : "text-neutral-400 hover:text-white"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="md:border-l border-white/[0.08] md:pl-8 flex flex-col gap-4">
            <div>
              <span className="font-bold text-white block mb-1">Call :</span>
              <a href="tel:+918197046698" className="text-white font-normal hover:text-[#E33E2B] transition-colors duration-200 block">
                +91 81970 46698
              </a>
            </div>
            <div>
              <span className="font-bold text-white block mb-1">Email:</span>
              <a href="mailto:vasanthamachaih@oakroad.industries" className="text-xs sm:text-sm text-white font-normal hover:text-[#E33E2B] transition-colors duration-200 block whitespace-nowrap">
                vasanthamachaih@oakroad.industries
              </a>
            </div>
            <div className="mt-2">
              <form onSubmit={handlePartnerSubmit} className="flex items-stretch w-full max-w-[240px] bg-neutral-900 border border-white/[0.08] focus-within:border-white/20 transition-all rounded overflow-hidden">
                <input
                  type="text"
                  placeholder="Partner with us"
                  className="bg-transparent text-white px-3 py-2.5 text-xs outline-none w-full placeholder-neutral-500 min-w-0"
                />
                <button
                  type="submit"
                  className="group bg-white hover:bg-neutral-200 active:scale-95 transition-all px-4.5 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-black transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-400">
          <p>&copy; {new Date().getFullYear()} INNI Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <NavLink
              to="/legal#privacy"
              className="hover:text-white transition-colors duration-200"
            >
              Privacy Policy and Terms
            </NavLink>
            <span className="text-neutral-700">|</span>
            <NavLink
              to="/legal#terms"
              className="hover:text-white transition-colors duration-200"
            >
              Terms & Conditions
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
