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

        <motion.div layout className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-stretch">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col h-full bg-transparent rounded-[2rem] p-6 border border-white/[0.05]">
                  <div className="bg-neutral-900 rounded-2xl aspect-[4/5] mb-6 relative overflow-hidden shrink-0" />
                  <div className="h-5 bg-neutral-900 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-neutral-900 rounded w-5/6 mx-auto mb-4" />
                  <div className="h-4 bg-neutral-900 rounded w-1/4 mx-auto mb-8" />
                  <div className="mt-auto h-10 bg-neutral-900 rounded-full w-full" />
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

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

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
      className="group flex h-full flex-col bg-transparent rounded-2xl sm:rounded-[2rem] p-3 sm:p-5 md:p-6 border border-white/[0.05] hover:border-white/20 transition-colors cursor-pointer"
    >
      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/5] bg-black mb-3 sm:mb-6 shrink-0">
        <img 
          src={product.image} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none" 
          alt={product.name}
        />
      </div>

      <div className="flex flex-1 flex-col text-center">
        <h3 className="font-semibold text-sm sm:text-lg md:text-xl text-white mb-1.5 sm:mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem] leading-5 sm:leading-7">
          {product.name}
        </h3>
        <p className="text-neutral-400 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-4 sm:leading-5">
          {product.description}
        </p>
        <p className="text-white font-medium text-base sm:text-lg mb-3 sm:mb-6">₹{product.price}</p>

        <div className="mt-auto">
          <button 
            onClick={handleAdd}
            className={cn(
              "w-full py-2.5 sm:py-3 rounded-full font-medium text-xs sm:text-sm transition-all focus:scale-95 cursor-pointer",
              added ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
            )}
          >
            {added ? "Added to Bag" : "Add to Bag"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
