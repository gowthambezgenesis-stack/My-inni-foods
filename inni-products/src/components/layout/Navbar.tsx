import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCart } from '../../hooks/useCart';

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { name: 'Shop', path: '/shop' },
    { name: 'Offers', path: '/offers' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'Get Now', path: '/contact' },
  ];

  const NavItemLabel = ({ label, className }: { label: string; className?: string }) => (
    <span className={cn('inline-grid', className)}>
      <span className="col-start-1 row-start-1 font-semibold invisible select-none" aria-hidden="true">
        {label}
      </span>
      <span className="col-start-1 row-start-1 font-medium group-hover:font-semibold">
        {label}
      </span>
    </span>
  );

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-black/60 backdrop-blur-2xl border-b border-white/[0.08]'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <NavLink to="/" className="font-bold tracking-tight text-xl text-white">
            INNI
          </NavLink>

          <div className="hidden md:flex items-center gap-5">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className="group px-2 py-2 text-sm tracking-wide text-white"
              >
                <NavItemLabel label={link.name} />
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <NavLink
              to="/cart"
              className="group relative py-1 text-white transition-colors"
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
              className="md:hidden text-white"
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
                  className="group py-2 px-1 text-lg tracking-tight text-white"
                >
                  <NavItemLabel label={link.name} />
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
