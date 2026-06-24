import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, PRODUCTS } from '../data';
import { Product } from '../types';
import { Search } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { fetchAllProducts } from '../lib/api';

export function Shop() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProducts(PRODUCTS);
    setLoading(false);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black pt-28 pb-32">
      <div className="max-w-screen-xl mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white mb-16">Which blend <br/>is right for you?</h1>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 sticky top-14 z-30 bg-black/80 backdrop-blur-xl py-4 border-b border-white/10">
          <div className="flex overflow-x-auto no-scrollbar gap-2 w-full lg:w-auto pb-2 lg:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                  activeCategory === cat.id 
                    ? "bg-white text-black border-white" 
                    : "bg-transparent text-neutral-400 border-white/20 hover:border-white/50"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
          
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input 
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-full py-2.5 pl-12 pr-4 outline-none focus:border-white transition-colors text-sm text-white placeholder-neutral-500"
            />
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-transparent rounded-[2rem] p-6 border border-white/[0.05]">
                  <div className="bg-neutral-900 rounded-2xl aspect-[4/5] mb-6 relative overflow-hidden" />
                  <div className="h-5 bg-neutral-900 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-neutral-900 rounded w-5/6 mx-auto mb-4" />
                  <div className="h-4 bg-neutral-900 rounded w-1/4 mx-auto mb-8" />
                  <div className="h-10 bg-neutral-900 rounded-full w-full" />
                </div>
              ))
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-32">
            <h3 className="text-2xl font-medium text-neutral-400">No results found.</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductCard({ product }: { product: Product; key?: string }) {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [added, setAdded] = React.useState(false);
  
  const inCartCount = cartItems.find(i => i.product.id === product.id)?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group flex flex-col bg-transparent rounded-[2rem] p-6 border border-white/[0.05] hover:border-white/20 transition-colors cursor-pointer"
    >
      <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-black mb-6">
        <img 
          src={product.image} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none" 
          alt={product.name}
        />
      </div>

      <div className="text-center mb-8">
        <h3 className="font-semibold text-xl text-white mb-2">{product.name}</h3>
        <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{product.description}</p>
        <p className="text-white font-medium text-lg">₹{product.price}</p>
      </div>

      <button 
        onClick={handleAdd}
        className={cn(
          "w-full py-3 rounded-full font-medium text-sm transition-all focus:scale-95 cursor-pointer",
          added ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
        )}
      >
        {added ? "Added to Bag" : "Add to Bag"}
      </button>
      {inCartCount > 0 && <p className="text-xs text-neutral-500 text-center mt-3">{inCartCount} in your bag.</p>}
    </motion.div>
  );
}
