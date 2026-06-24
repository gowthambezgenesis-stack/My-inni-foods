import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCart } from '../../hooks/useCart';

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const links = [
    { name: 'Shop', path: '/shop' },
    { name: 'Collections', path: '/collections' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'Our Story', path: '/about' },
    { name: 'Get Now', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/[0.08]">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <NavLink to="/" className="font-semibold tracking-tighter text-xl text-white">
            inni
          </NavLink>

          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => cn(
                  "text-xs tracking-wide transition-colors",
                  isActive ? "text-white" : "text-neutral-400 hover:text-white"
                )}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <NavLink 
              to="/cart" 
              className="relative text-neutral-400 hover:text-white transition-colors"
            >
              <ShoppingBag size={18} strokeWidth={2} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black text-[9px] font-bold flex items-center justify-center rounded-full"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>

            <button 
              className="md:hidden text-neutral-400"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#111112] backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-6 space-y-4">
              {links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => cn(
                    "text-xl font-medium tracking-tight",
                    isActive ? "text-white" : "text-neutral-400"
                  )}
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
