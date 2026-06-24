import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag, CircleCheck, Flame, ShieldCheck, Leaf, ArrowRight, ArrowDown } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { PRODUCTS } from '../data';

export function Collections() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [visibleCount, setVisibleCount] = useState<number>(6); // Default 6 for 3-column layout
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const productsSectionRef = useRef<HTMLDivElement>(null);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('inni_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }
  }, []);

  // Fetch products on mount
  useEffect(() => {
    setProducts(PRODUCTS);
    setLoading(false);
  }, []);

  // Toggle wishlist item
  const toggleWishlist = (productId: string) => {
    let updatedWishlist = [...wishlist];
    if (wishlist.includes(productId)) {
      updatedWishlist = updatedWishlist.filter(id => id !== productId);
    } else {
      updatedWishlist.push(productId);
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('inni_wishlist', JSON.stringify(updatedWishlist));
  };

  // Add to cart helper with feedback
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId(null);
    }, 1500);
  };

  // Scroll helper
  const scrollToGrid = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Categories Explorer Cards Setup (Curated Images & Subtitles)
  const categoryCards = [
    { 
      id: 'all', 
      name: 'All Masalas', 
      count: '17 Products', 
      tagline: 'The full spectrum of flavor',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 'non-veg', 
      name: 'Non-Veg Delights', 
      count: '3 Products', 
      tagline: 'Rich, fiery heritage blends',
      image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 'veg', 
      name: 'Vegetarian Classics', 
      count: '6 Products', 
      tagline: 'Pure, aromatic daily essentials',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 'whole', 
      name: 'Whole Spices', 
      count: '3 Products', 
      tagline: 'Sun-dried single-origin jewels',
      image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 'blends', 
      name: 'Special Blends', 
      count: '5 Products', 
      tagline: 'Exotic secret creations',
      image: 'https://images.unsplash.com/photo-1532336414038-cf1905047b2c?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 'best-sellers', 
      name: 'Best Sellers', 
      count: '4 Products', 
      tagline: 'Most loved by sensory purists',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 'new-arrivals', 
      name: 'New Arrivals', 
      count: '4 Products', 
      tagline: 'Freshly harvested additions',
      image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80' 
    },
  ];

  // Specific IDs defined as Best Sellers & New Arrivals
  const bestSellerIds = ['nizami-mutton-masala', 'kashmiri-garam-masala', 'whole-cardamom-elaichi', 'black-pepper-kaali-mirch'];
  const newArrivalIds = ['royale-chicken-masala', 'shahi-biryani-masala', 'guntur-red-chilli-powder', 'whole-cloves-laung'];

  // Poetic luxury description mapping for products
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

  // Map products to include dynamic/visual features
  const enrichedProducts = products.map(product => {
    const hasDiscount = product.price > 120;
    const originalPrice = hasDiscount ? Math.round(product.price * 1.25) : undefined;
    const isBestSeller = bestSellerIds.includes(product.id);
    const isNew = newArrivalIds.includes(product.id);
    const poeticDesc = getPoeticDescription(product.id, product.name, product.description);
    
    // Rating / reviews count
    const ratingValue = (product.id.charCodeAt(1) % 2 === 0) ? 5 : 4;
    const reviewsCount = (product.id.charCodeAt(1) * 7) % 80 + 20;

    return {
      ...product,
      poeticDesc,
      originalPrice,
      isBestSeller,
      isNew,
      ratingValue,
      reviewsCount
    };
  });

  // Filter & Sort Logic
  const filteredProducts = enrichedProducts.filter(product => {
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'best-sellers' && !product.isBestSeller) return false;
      if (selectedCategory === 'new-arrivals' && !product.isNew) return false;
      if (selectedCategory !== 'best-sellers' && selectedCategory !== 'new-arrivals' && product.category !== selectedCategory) return false;
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(query);
      const matchDesc = product.poeticDesc.toLowerCase().includes(query);
      if (!matchName && !matchDesc) return false;
    }

    return true;
  });

  // Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    }
    if (sortBy === 'newest') {
      const aNew = a.isNew ? 1 : 0;
      const bNew = b.isNew ? 1 : 0;
      return bNew - aNew;
    }
    const aPopularity = (a.isBestSeller ? 2 : 0) + (a.ratingValue === 5 ? 1 : 0);
    const bPopularity = (b.isBestSeller ? 2 : 0) + (b.ratingValue === 5 ? 1 : 0);
    return bPopularity - aPopularity;
  });

  const displayProducts = sortedProducts.slice(0, visibleCount);



  // 5. Flavor Journeys Thematic Section Data
  const flavorJourneys = [
    {
      title: 'North Indian Royal Feasts',
      description: 'Rich, creamy, and slow-cooked culinary masterpieces. Spiced with sweet cardamom, saffron, and roasted mace.',
      category: 'blends', // Maps to Special Blends
      image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Coastal Seafood Symphony',
      description: 'Embark along India\'s shorelines. Rich with organic coconut, tangy kokum, and high-heat chillies.',
      category: 'non-veg', // Maps to Non-Veg Delights
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'South Indian Temple Classics',
      description: 'Earthy, pure, and comforting vegetarian delicacies, ground with dry curry leaves, mustard, and dark fenugreek.',
      category: 'veg', // Maps to Vegetarian Classics
      image: 'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?auto=format&fit=crop&w=600&q=80'
    }
  ];

  // Interactive Discover button handler
  const handleJourneyDiscover = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(6);
    scrollToGrid();
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-[#E33E2B] selection:text-white">
      
      {/* 1. Hero Section (Full bleed) */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out transform scale-105"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1600&q=80')" 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.85)_100%)]" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.35em] text-[#E33E2B] font-bold mb-5 flex items-center gap-2 drop-shadow">
            ✦ CURATED LUXURY BLENDS
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white mb-6 leading-tight drop-shadow-2xl">
            Collections
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 font-light leading-relaxed max-w-2xl mb-12 drop-shadow">
            Thoughtfully crafted spice journeys for the sensory purist. Each collection tells a story of origin, lineage, and flavor.
          </p>
          <button 
            onClick={scrollToGrid}
            className="group relative flex items-center gap-3 bg-white hover:bg-neutral-200 text-black px-9 py-4.5 rounded-full font-medium tracking-wide text-xs transition-all duration-300 transform active:scale-95 shadow-2xl cursor-pointer"
          >
            Begin Your Flavor Journey
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <button onClick={scrollToGrid} className="text-neutral-500 hover:text-white transition-colors cursor-pointer">
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Category Explorer Cards */}
      <section ref={productsSectionRef} className="max-w-screen-xl mx-auto px-6 pt-24 pb-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#E33E2B] font-bold block mb-3">Discovery Matrix</span>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tighter">Explore Categories</h2>
        </div>

        {/* Elegant Cards/Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
          {categoryCards.map((card) => {
            const isSelected = selectedCategory === card.id;
            return (
              <button
                key={card.id}
                onClick={() => {
                  setSelectedCategory(card.id);
                  setVisibleCount(6); // reset pagination
                }}
                className={`group/card text-left flex flex-col justify-between p-4.5 rounded-2xl overflow-hidden transition-all duration-500 relative min-h-[145px] border cursor-pointer ${
                  isSelected 
                    ? "border-[#E33E2B] shadow-lg shadow-[#E33E2B]/10 scale-[1.03]"
                    : "border-white/[0.04] hover:border-white/[0.15] bg-white/[0.01] hover:bg-white/[0.02]"
                }`}
              >
                {/* Background Card Image Overlay */}
                <div 
                  className={`absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-15 group-hover/card:opacity-30 ${
                    isSelected ? "opacity-35" : ""
                  }`}
                  style={{ backgroundImage: `url('${card.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />

                <div className="relative z-10">
                  <span className={`text-[9px] font-bold tracking-widest uppercase block ${
                    isSelected ? "text-[#E33E2B]" : "text-neutral-500 group-hover/card:text-neutral-300"
                  }`}>
                    {card.count}
                  </span>
                </div>

                <div className="relative z-10 mt-auto">
                  <h4 className="text-white font-medium text-xs md:text-sm group-hover/card:text-[#E33E2B] transition-colors mb-0.5 line-clamp-1">
                    {card.name}
                  </h4>
                  <p className="text-neutral-600 group-hover/card:text-neutral-500 text-[9px] line-clamp-1 leading-tight font-light">
                    {card.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search Input and Sort Sub-Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-6 border-y border-white/[0.04] bg-black/60 sticky top-14 z-30">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search premium spices..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(6);
              }}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-full pl-11 pr-5 py-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            <span className="text-xs text-neutral-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-neutral-900 border border-white/[0.08] rounded-full px-5 py-2.5 text-xs text-white outline-none focus:border-white/20 transition-all cursor-pointer appearance-none pr-8 relative"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '12px'
              }}
            >
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </section>

      {/* 4. Curated Product Grid (3-column layout) */}
      <section className="max-w-screen-xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/[0.01] border border-white/[0.04] rounded-[2.2rem] p-6 min-h-[450px] flex flex-col justify-between">
                <div className="bg-neutral-900 rounded-3xl aspect-square mb-6 relative overflow-hidden" />
                <div className="h-4 bg-neutral-900 rounded w-2/3 mb-2" />
                <div className="h-3 bg-neutral-900 rounded w-full mb-4" />
                <div className="h-10 bg-neutral-900 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/[0.08] rounded-3xl bg-neutral-950/20">
            <span className="text-2xl block mb-3">🍂</span>
            <h3 className="text-base font-medium text-white mb-1">No Spices Found</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">We couldn't find any spices matching your filters. Try search keywords or selecting another category.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
              {displayProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                return (
                  <div 
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="group flex flex-col bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] rounded-[2.2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1 relative cursor-pointer"
                  >
                    {/* Badge Layer */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
                      {product.isBestSeller && (
                        <span className="bg-[#800020] border border-red-500/10 text-white text-[8px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
                          Bestseller
                        </span>
                      )}
                      {product.isNew && (
                        <span className="bg-emerald-950/80 border border-emerald-500/10 text-emerald-400 text-[8px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
                          New
                        </span>
                      )}
                      {product.originalPrice && (
                        <span className="bg-[#E33E2B] text-white text-[8px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Off
                        </span>
                      )}
                    </div>

                    {/* Wishlist Heart */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-[#E33E2B] text-white flex items-center justify-center backdrop-blur-md transition-colors duration-300 cursor-pointer shadow group/heart"
                    >
                      <Heart 
                        className={`w-3.5 h-3.5 transition-transform duration-300 group-hover/heart:scale-110 ${
                          isWishlisted ? "fill-[#E33E2B] text-[#E33E2B]" : "text-white"
                        }`} 
                      />
                    </button>

                    {/* Image frame */}
                    <div className="relative aspect-square overflow-hidden bg-neutral-900">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Content Details block */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Rating block */}
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <div className="flex text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${
                                  i < product.ratingValue ? "fill-amber-500" : "text-neutral-700"
                                }}`} 
                              />
                            ))}
                          </div>
                          <span className="text-[9px] text-neutral-500 font-light">({product.reviewsCount} reviews)</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-white font-medium text-base md:text-lg group-hover:text-[#E33E2B] transition-colors duration-300 mb-1.5">
                          {product.name}
                        </h3>
                        
                        {/* Poetic description */}
                        <p className="text-neutral-500 text-xs leading-relaxed mb-4 font-light italic">
                          "{product.poeticDesc}"
                        </p>
                      </div>

                      <div>
                        {/* Pricing details */}
                        <div className="flex items-baseline justify-between mb-4.5 border-t border-white/[0.04] pt-4">
                          <div>
                            <span className="text-[9px] text-neutral-600 block mb-0.5">Weight: {product.weight}</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base font-semibold text-white">₹{product.price}</span>
                              {product.originalPrice && (
                                <span className="text-xs text-neutral-600 line-through">₹{product.originalPrice}</span>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); scrollToGrid(); }} 
                            className="text-[10px] text-neutral-500 hover:text-white transition-colors cursor-pointer"
                          >
                            View Full Collection
                          </button>
                        </div>

                        {/* Add to cart action button */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                          className={`w-full py-3 rounded-xl font-medium text-xs tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
                            justAddedId === product.id
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-black hover:bg-neutral-200"
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {justAddedId === product.id ? "Added to Cart" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {sortedProducts.length > visibleCount && (
              <div className="flex justify-center mt-14">
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="group flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-white/[0.08] hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03] transition-all text-xs tracking-wider font-semibold cursor-pointer active:scale-95"
                >
                  Load More
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. Explore Flavor Journeys Section (Thematic Experiences) */}
      <section className="bg-neutral-950/40 border-y border-white/[0.04] py-28">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#E33E2B] font-bold block mb-3">SENSORY EXPLORATION</span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter">Explore Flavor Journeys</h2>
            <p className="text-sm text-neutral-500 mt-4 leading-relaxed font-light">
              Embark on thematic culinary pathways curated from India's traditional regions. Experience culinary lineage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {flavorJourneys.map((journey, i) => (
              <div 
                key={i}
                className="group/journey flex flex-col bg-black border border-white/[0.05] hover:border-white/[0.1] rounded-[2.5rem] overflow-hidden transition-all duration-500 relative min-h-[380px] p-6 justify-between"
              >
                {/* Background overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out opacity-25 group-hover/journey:opacity-40 scale-105 group-hover/journey:scale-100"
                  style={{ backgroundImage: `url('${journey.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

                <div className="relative z-10 text-right">
                  <span className="text-[#E33E2B] text-[10px] font-bold tracking-[0.2em] uppercase">
                    Journey 0{i + 1}
                  </span>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="text-white font-semibold text-xl md:text-2xl mb-2 group-hover/journey:text-[#E33E2B] transition-colors">
                    {journey.title}
                  </h3>
                  <p className="text-neutral-400 text-xs md:text-sm leading-relaxed mb-6 font-light">
                    {journey.description}
                  </p>
                  
                  <button
                    onClick={() => handleJourneyDiscover(journey.category)}
                    className="group/discover flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#E33E2B] transition-colors cursor-pointer"
                  >
                    Discover
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/discover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Trust & Values Bar */}
      <section className="max-w-screen-xl mx-auto px-6 py-24">
        <div className="bg-neutral-950/60 border border-white/[0.05] rounded-[3rem] px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#E33E2B]">
                <CircleCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">100% Pure</h4>
              <p className="text-[10px] text-neutral-500 leading-normal max-w-[140px]">Absolutely zero chemical colors or synthetic dyes.</p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#E33E2B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">No Fillers</h4>
              <p className="text-[10px] text-neutral-500 leading-normal max-w-[140px]">No MSG, starch powder, or bulk additives.</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#E33E2B]">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Freshly Ground</h4>
              <p className="text-[10px] text-neutral-500 leading-normal max-w-[140px]">Small batch roasting & cryogenic grinding.</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#E33E2B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">FSSAI Certified</h4>
              <p className="text-[10px] text-neutral-500 leading-normal max-w-[140px]">Complies with gold quality testing standards.</p>
            </div>

            <div className="col-span-2 md:col-span-1 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#E33E2B]">
                <Leaf className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Sustainably Sourced</h4>
              <p className="text-[10px] text-neutral-500 leading-normal max-w-[140px]">Direct-from-farm fair trade practices.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Small inline SearchIcon SVG to avoid dependency glitches
function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}
