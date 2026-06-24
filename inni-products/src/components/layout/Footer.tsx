import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();
  const links = [
    { name: 'Shop', path: '/shop' },
    { name: 'Collections', path: '/collections' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'Our Story', path: '/about' },
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
            <span className="font-semibold tracking-tighter text-2xl text-white block mb-2">inni</span>
            <p className="leading-relaxed text-neutral-500 mb-6">
              The architecture of flavor.<br />Designed for the sensory purist.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.16 1.455 4.773 1.456 5.485 0 9.948-4.614 9.952-10.29.002-2.75-1.057-5.334-2.982-7.261-1.925-1.926-4.491-2.987-7.243-2.988-5.487 0-9.952 4.614-9.956 10.29-.001 2.016.521 3.988 1.512 5.718L1.72 20.3l3.965-1.042c1.83 1.011 3.53 1.547 4.962 1.547zm9.84-7.542c-.269-.135-1.594-.788-1.841-.879-.247-.09-.427-.135-.607.135-.18.27-.697.879-.854 1.06-.157.18-.315.202-.584.067-2.316-1.164-3.155-1.748-4.495-4.075-.269-.466-.404-.787-.584-1.06-.18-.272-.023-.42.112-.556.12-.121.27-.315.405-.473.135-.157.18-.27.27-.45.09-.18.045-.338-.022-.473-.068-.135-.607-1.463-.832-2.003-.22-.528-.46-.456-.63-.465l-.538-.01c-.18 0-.473.067-.72.337-.247.27-.945.923-.945 2.25s.967 2.61 1.103 2.79c.135.18 1.9 2.901 4.6 4.075.642.279 1.144.445 1.534.569.645.205 1.232.176 1.696.107.518-.078 1.594-.652 1.819-1.282.225-.63.225-1.17.157-1.282-.068-.113-.247-.18-.516-.315z" />
                </svg>
              </a>
            </div>
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
              <a href="tel:+919876543210" className="text-white font-normal hover:text-[#E33E2B] transition-colors duration-200 block">
                +91 98765 43210
              </a>
            </div>
            <div>
              <span className="font-bold text-white block mb-1">Email:</span>
              <a href="mailto:inni@gmail.com" className="text-white font-normal hover:text-[#E33E2B] transition-colors duration-200 block">
                inni@gmail.com
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
          <p>&copy; {new Date().getFullYear()} inni Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <span className="text-neutral-700">|</span>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
