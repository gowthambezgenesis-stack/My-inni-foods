import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CATEGORIES } from '../data';
import { useCart } from '../hooks/useCart';
import { ArrowLeft, ShoppingBag, ShieldCheck, BadgeCheck, Leaf } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProductCard } from './Shop';
import { Product, SignatureKit } from '../types';
import { fetchProductBySlug, fetchAllProducts } from '../lib/api';

// Poetic descriptions copied from Collections.tsx for maximum brand alignment and high-end copy
const getPoeticDescription = (id: string, name: string, fallback: string) => {
  const poeticMap: Record<string, string> = {
    'royale-chicken-masala': 'An ancestral blend of slow-roasted stone flower and cinnamon. Creates chicken curries of regal depth.',
    'nizami-mutton-masala': 'An intense, dark blend of mace, nutmeg, and black cardamom, crafted for slow-braised cuts.',
    'kashmiri-garam-masala': 'The king of spice blends, roasted and ground for maximum aroma.',
    'shahi-biryani-masala': 'Elevate your biryani with our secret mix of premium exotic spices.',
    'pure-turmeric-powder-haldi': 'High-curcumin turmeric, sourced directly from Salem farmers.',
    'guntur-red-chilli-powder': 'Bright red color and intense heat. For those who love it spicy.',
    'dhaniya-powder-coriander': 'Freshly ground coriander seeds with a distinct citrusy aroma.',
    'amritsari-chole-masala': 'Perfectly balanced sour and spicy notes for authentic Punjabi chole.',
    'bombay-pav-bhaji-masala': 'Street-style aroma right in your kitchen.',
    'coastal-fish-curry-masala': 'Tangy and spicy blend, perfect for all seafood delicacies.',
    'tandoori-tikka-masala': 'Get that smoky restaurant-style flavor in your homemade tikka.',
    'jeera-powder-cumin': 'Roasted and coarse ground for a deep, earthy flavor.',
    'chat-masala': 'Zesty and tangy, the classic Indian finishing spice.',
    'kashmiri-chilli-powder': 'Vibrant red color, carrying a gentle warm whisper with virtually no heat.',
    'whole-cardamom-elaichi': 'Premium bold size green cardamom pods from Kerala.',
    'whole-cloves-laung': 'Aromatic, oil-rich whole cloves.',
    'black-pepper-kaali-mirch': 'Tellicherry black peppercorns for a sharp, biting flavor.'
  };
  return poeticMap[id] || fallback;
};

// Generates dynamic secondary/tertiary view images for a spice product
const getProductImages = (product: Product) => {
  // Curated Unsplash images of premium raw spices, roasting, grinding, and curries
  const rawSpicesImg = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80';
  const grindingImg = 'https://images.unsplash.com/photo-1532336414038-cf1905047b2c?auto=format&fit=crop&w=800&q=80';
  const cookingImg = 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=80';
  const wholeSpiceImg = 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80';
  const vegetableDishImg = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
  const generalMasalaImg = 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80';

  if (product.category === 'non-veg') {
    return [product.image, cookingImg, rawSpicesImg];
  }
  if (product.category === 'veg') {
    return [product.image, vegetableDishImg, grindingImg];
  }
  if (product.category === 'whole') {
    return [product.image, wholeSpiceImg, rawSpicesImg];
  }
  return [product.image, generalMasalaImg, grindingImg];
};

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [added, setAdded] = useState(false);

  const [product, setProduct] = useState<Product | SignatureKit | null>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetchProductBySlug(id)
      .then((prod) => {
        if (prod) {
          setProduct(prod);
          setActiveImage(prod.image);

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
          onClick={() => navigate('/collections')}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Collections
        </button>
      </div>
    );
  }

  const isKit = product.isSignatureKit;
  const kit = isKit ? product as SignatureKit : undefined;

  const categoryName = isKit ? (kit?.badge || 'Signature Collection') : (CATEGORIES.find((c) => c.id === product.category)?.name || product.category);
  const inCartCount = cartItems.find((i) => i.product.id === product.id)?.quantity || 0;
  const poeticDesc = isKit ? kit?.story : getPoeticDescription(product.id, product.name, product.description);
  const images = getProductImages(product);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-32 text-white selection:bg-[#E33E2B] selection:text-white">
      <div className="max-w-screen-xl mx-auto px-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/collections')}
          className="group flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-all mb-12 hover:-translate-x-1 duration-300"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:scale-110" />
          <span>Back to Collections</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">
          {/* Left Column: Vertical Thumbnails + Main Image */}
          <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-8 lg:gap-12 items-start w-full">
            {/* Thumbnail Track */}
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-20 overflow-x-auto md:overflow-x-visible no-scrollbar py-2 md:py-0">
              {images.map((img, index) => {
                const isActive = activeImage === img;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-neutral-900 border transition-all duration-300 cursor-pointer flex-shrink-0 focus:outline-none",
                      isActive
                        ? "border-[#E33E2B] scale-105 shadow-md shadow-[#E33E2B]/10"
                        : "border-white/10 hover:border-white/30"
                    )}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                      alt={`${product.name} view ${index + 1}`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Main Image with Glowing Accent */}
            <div className="flex-1 w-full flex justify-center lg:justify-start lg:pl-6">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative w-[75%] aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-neutral-900 border border-white/10 group shadow-2xl"
              >
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity grayscale group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0 transition-all duration-700"
                />
                {/* Gradient Overlay glow based on product color */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-tr opacity-20 mix-blend-color pointer-events-none transition-opacity duration-700 group-hover:opacity-5",
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-white mb-6">
              {product.name}
            </h1>

            {/* Price & Weight */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8 pb-8 border-b border-white/10">
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-3xl font-semibold text-white">₹{product.price}</span>
                {isKit && kit?.originalPrice && (
                  <>
                    <span className="text-xl text-neutral-500 line-through">₹{kit.originalPrice}</span>
                    <span className="bg-[#E33E2B] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                      -{Math.round(((kit.originalPrice - product.price) / kit.originalPrice) * 100)}% Off
                    </span>
                  </>
                )}
              </div>
              <div className="inline-flex items-center gap-3 bg-white/[0.06] border border-white/15 rounded-2xl px-5 py-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                  Net weight
                </span>
                <span className="text-xl font-semibold text-white tracking-tight">{product.weight}</span>
              </div>
            </div>

            {/* Poetic Description */}
            <p className="text-xl text-neutral-300 font-light leading-relaxed mb-6 italic">
              "{poeticDesc}"
            </p>

            {/* Base Description */}
            <p className="text-neutral-400 text-base leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Purity */}
            <div className="mb-10 bg-white/5 border border-white/10 rounded-2xl p-4.5">
              <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Purity</span>
              <span className="text-sm font-medium text-white flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-500" /> 100% Organic Sourced
              </span>
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

            {/* Brand Values Highlights */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-10 mt-10 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#E33E2B]">
                  <BadgeCheck size={16} />
                </div>
                <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">No Fillers</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#E33E2B]">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Lab Tested</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#E33E2B]">
                  <Leaf size={16} />
                </div>
                <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Ethical Trade</span>
              </div>
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
