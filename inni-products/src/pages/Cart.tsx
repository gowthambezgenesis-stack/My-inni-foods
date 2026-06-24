import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../hooks/useCart';
import { NavLink } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';

export function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + (cartItems.length > 0 ? shipping : 0);

  return (
    <div className="min-h-screen bg-black pt-28 pb-32 text-white">
      <div className="max-w-screen-md mx-auto px-6">
        <h1 className="text-4xl font-semibold tracking-tighter mb-12 text-center">
          {cartItems.length > 0 ? "Review your bag." : "Your bag is empty."}
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center">
            <p className="text-neutral-400 mb-8 font-light">Explore our collection of premium quality masalas.</p>
            <NavLink 
              to="/shop" 
              className="bg-white text-black px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform"
            >
              Continue Shopping
            </NavLink>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="border-t border-white/10 pt-8 space-y-8">
              <AnimatePresence>
                {cartItems.map(item => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    key={item.product.id}
                    className="flex gap-6 pb-8 border-b border-white/10"
                  >
                    <div className="w-24 h-32 rounded-xl overflow-hidden bg-[#111] shrink-0 relative">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover opacity-60" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-white tracking-tight">{item.product.name}</h3>
                          <p className="text-neutral-400 text-sm mt-1">{item.product.weight}</p>
                        </div>
                        <span className="font-medium text-lg">₹{item.product.price * item.quantity}</span>
                      </div>
                      
                      <div className="flex items-end justify-between">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-2 py-1 border border-white/20">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 text-white/70 hover:text-white transition">
                            {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 text-white/70 hover:text-white transition">
                            <Plus size={16} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-sm text-neutral-400 hover:text-white transition underline">Remove</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="py-8">
              <div className="space-y-4 text-sm text-neutral-400 border-b border-white/10 pb-8 mb-8">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-white">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-10 text-2xl font-semibold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              
              <NavLink 
                to="/checkout"
                className="w-full bg-white text-black py-4 rounded-full font-semibold text-lg hover:bg-neutral-200 transition-colors flex justify-center items-center"
              >
                Check Out
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
