import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CATEGORIES } from '../data';
import { useCart } from '../hooks/useCart';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  applyProductVariant,
  getCartLineKey,
  getWeightOptionsForProduct,
  supportsWeightVariants,
} from '../lib/productVariants';
import { ProductCard } from './Shop';
import { Product, SignatureKit } from '../types';
import { fetchProductBySlug, fetchAllProducts } from '../lib/api';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState('100g');

  const [product, setProduct] = useState<Product | SignatureKit | null>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetchProductBySlug(id)
      .then((prod) => {
        if (prod) {
          setProduct(prod);

          // Now fetch other related products
          fetchAllProducts()
            .then(({ products }) => {
              const related = products
                .filter((p) => p.id !== prod.id)
                .sort((a, b) => {
                  if (a.category === prod.category && b.category !== prod.category) return -1;
                  if (a.category !== prod.category && b.category === prod.category) return 1;
                  return 0;
                })
                .slice(0, 4);
              setOtherProducts(related);
              setLoading(false);
            })
            .catch((err) => {
              console.error('Failed to load related products', err);
              setLoading(false);
            });
        } else {
          setProduct(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load product details', err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    setSelectedWeight('100g');
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#E33E2B] border-r-2 border-transparent" />
        <p className="mt-4 text-neutral-400 font-light">Loading blend details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
        <h2 className="text-3xl font-semibold mb-4 text-neutral-400">Product not found</h2>
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Shop
        </button>
      </div>
    );
  }

  const isKit = product.isSignatureKit;
  const kit = isKit ? product as SignatureKit : undefined;
  const hasWeightVariants = supportsWeightVariants(product);
  const weightOptions = getWeightOptionsForProduct(product);
  const selectedOption =
    weightOptions.find((option) => option.weight === selectedWeight) ?? weightOptions[0];
  const displayProduct = hasWeightVariants
    ? applyProductVariant(product, selectedOption)
    : product;

  const categoryName = isKit ? (kit?.badge || 'Signature Collection') : (CATEGORIES.find((c) => c.id === product.category)?.name || product.category);
  const cartLineKey = getCartLineKey(displayProduct);
  const inCartCount = cartItems.find((i) => getCartLineKey(i.product) === cartLineKey)?.quantity || 0;

  const handleAdd = () => {
    addToCart(displayProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-32 text-white selection:bg-[#E33E2B] selection:text-white">
      <div className="max-w-screen-xl mx-auto px-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/shop')}
          className="group flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-all mb-12 hover:-translate-x-1 duration-300"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:scale-110" />
          <span>Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">
          {/* Left Column: Main Image */}
          <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-8 lg:gap-12 items-start w-full">
            <div className="flex-1 w-full flex justify-center lg:justify-start lg:pl-6">
              <motion.div
                key={product.image}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative w-[75%] aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-neutral-900 border border-white/10 group shadow-2xl"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Gradient Overlay glow based on product color */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-tr opacity-10 mix-blend-color pointer-events-none",
                  product.color
                )}></div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-8 pointer-events-none">
                  <span className="text-[10px] tracking-[0.3em] font-semibold text-neutral-400 uppercase">
                    MASALA ESSENCE NO. {product.id.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Info & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col h-full"
          >
            {/* Category Breadcrumb */}
            <span className="text-xs uppercase tracking-[0.25em] text-[#E33E2B] font-bold mb-4">
              {categoryName}
            </span>

            {/* Product Name */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-white mb-4">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed mb-8 max-w-lg">
                {product.description}
              </p>
            )}

            {/* Price & Net weight */}
            <div className="mb-8 pb-8 border-b border-white/10">
              <div className="flex items-baseline gap-4 flex-wrap mb-6">
                <span className="text-3xl md:text-4xl font-semibold text-white">
                  ₹{displayProduct.price.toLocaleString('en-IN')}
                </span>
                {isKit && kit?.originalPrice && (
                  <>
                    <span className="text-xl text-neutral-500 line-through">
                      ₹{kit.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="bg-[#E33E2B] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                      -{Math.round(((kit.originalPrice - product.price) / kit.originalPrice) * 100)}% Off
                    </span>
                  </>
                )}
              </div>

              {hasWeightVariants ? (
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Net weight</p>
                  <div className="flex flex-wrap gap-2.5">
                    {weightOptions.map((option) => {
                      const isSelected = selectedWeight === option.weight;
                      return (
                        <button
                          key={option.weight}
                          type="button"
                          onClick={() => setSelectedWeight(option.weight)}
                          className={cn(
                            'min-w-[4.5rem] px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border',
                            isSelected
                              ? 'bg-white text-black border-white shadow-[0_8px_24px_rgba(255,255,255,0.12)]'
                              : 'bg-white/[0.04] text-neutral-300 border-white/10 hover:border-white/25 hover:text-white',
                          )}
                        >
                          {option.weight}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-3 bg-white/[0.06] border border-white/15 rounded-2xl px-5 py-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                    Net weight
                  </span>
                  <span className="text-xl font-semibold text-white tracking-tight">{product.weight}</span>
                </div>
              )}
            </div>

            {/* Add to Bag Action */}
            <div className="flex flex-col gap-4">
              <button
                onClick={handleAdd}
                className={cn(
                  "w-full py-4 rounded-full font-semibold text-sm tracking-wider transition-all duration-300 flex items-center justify-center gap-3 active:scale-98 cursor-pointer shadow-lg",
                  added
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-black hover:bg-neutral-200"
                )}
              >
                <ShoppingBag size={18} />
                {added ? "Added to Bag" : "Add to Bag"}
              </button>

              {inCartCount > 0 && (
                <p className="text-xs text-neutral-500 text-center">
                  You currently have <span className="text-white font-medium">{inCartCount}</span> of this item in your bag.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-20"></div>

        {/* Related Products Section */}
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#E33E2B] font-bold block mb-3 text-center lg:text-left">
            Sensory Curation
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter text-white mb-12 text-center lg:text-left">
            Explore Other Blends
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
