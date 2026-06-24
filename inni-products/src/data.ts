import { Product, SignatureKit } from './types';

export const CATEGORIES = [
  { id: 'all', name: 'All Masalas' },
  { id: 'non-veg', name: 'Non-Veg Delights' },
  { id: 'veg', name: 'Vegetarian Classics' },
  { id: 'whole', name: 'Whole Spices' },
  { id: 'blends', name: 'Special Blends' },
];

export const PRODUCTS: Product[] = [
  {
    "id": "black-pepper-kaali-mirch",
    "name": "Black Pepper (Kaali Mirch)",
    "description": "Tellicherry black peppercorns for a sharp, biting flavor.",
    "price": 280.0,
    "weight": "100g",
    "category": "whole",
    "image": "https://cdn1.healthians.com/blog/wp-content/uploads/2026/02/Black-pepper-benefits.webp",
    "color": "from-neutral-800 to-black",
    "isSignatureKit": false
  },
  {
    "id": "whole-cloves-laung",
    "name": "Whole Cloves (Laung)",
    "description": "Aromatic, oil-rich whole cloves.",
    "price": 320.0,
    "weight": "50g",
    "category": "whole",
    "image": "https://thottamfarmfresh.com/wp-content/uploads/2021/05/Buy-CLoves-Online.webp",
    "color": "from-stone-700 to-stone-900",
    "isSignatureKit": false
  },
  {
    "id": "whole-cardamom-elaichi",
    "name": "Whole Cardamom (Elaichi)",
    "description": "Premium bold size green cardamom pods from Kerala.",
    "price": 450.0,
    "weight": "50g",
    "category": "whole",
    "image": "https://www.paperandtea.com/cdn/shop/articles/Kardamom_d4c472c3-a841-4150-9b38-dfa3b4955637.jpg?v=1777385965&width=1200",
    "color": "from-emerald-400 to-green-600",
    "isSignatureKit": false
  },
  {
    "id": "kashmiri-chilli-powder",
    "name": "Kashmiri Chilli Powder",
    "description": "Vibrant red color with very mild heat.",
    "price": 170.0,
    "weight": "100g",
    "category": "veg",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbxeXDlZnkbwZ952C9uZgS6s3LSELLio6dhA&s",
    "color": "from-red-500 to-red-800",
    "isSignatureKit": false
  },
  {
    "id": "chat-masala",
    "name": "Chat Masala",
    "description": "Zesty and tangy, the classic Indian finishing spice.",
    "price": 85.0,
    "weight": "50g",
    "category": "blends",
    "image": "https://www.seriouseats.com/thmb/hcBBpXhQmhaV98x2g-B5ZrA464w=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20170921-chaat-vicky-wasik-1-edit-31f58eb2b58f4a3d87c2bba688ad60ac.jpg",
    "color": "from-lime-500 to-green-700",
    "isSignatureKit": false
  },
  {
    "id": "jeera-powder-cumin",
    "name": "Jeera Powder (Cumin)",
    "description": "Roasted and coarse ground for a deep, earthy flavor.",
    "price": 160.0,
    "weight": "100g",
    "category": "veg",
    "image": "https://m.media-amazon.com/images/I/81Fx1lQ-xoL._AC_UF350,350_QL80_.jpg",
    "color": "from-stone-600 to-stone-800",
    "isSignatureKit": false
  },
  {
    "id": "tandoori-tikka-masala",
    "name": "Tandoori Tikka Masala",
    "description": "Get that smoky restaurant-style flavor in your homemade tikka.",
    "price": 140.0,
    "weight": "100g",
    "category": "blends",
    "image": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    "color": "from-red-600 to-orange-700",
    "isSignatureKit": false
  },
  {
    "id": "coastal-fish-curry-masala",
    "name": "Coastal Fish Curry Masala",
    "description": "Tangy and spicy blend, perfect for all seafood delicacies.",
    "price": 130.0,
    "weight": "100g",
    "category": "non-veg",
    "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    "color": "from-rose-500 to-red-600",
    "isSignatureKit": false
  },
  {
    "id": "bombay-pav-bhaji-masala",
    "name": "Bombay Pav Bhaji Masala",
    "description": "Street-style aroma right in your kitchen.",
    "price": 95.0,
    "weight": "100g",
    "category": "veg",
    "image": "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=800&q=80",
    "color": "from-red-400 to-orange-600",
    "isSignatureKit": false
  },
  {
    "id": "amritsari-chole-masala",
    "name": "Amritsari Chole Masala",
    "description": "Perfectly balanced sour and spicy notes for authentic Punjabi chole.",
    "price": 110.0,
    "weight": "100g",
    "category": "veg",
    "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    "color": "from-orange-800 to-amber-900",
    "isSignatureKit": false
  },
  {
    "id": "dhaniya-powder-coriander",
    "name": "Dhaniya Powder (Coriander)",
    "description": "Freshly ground coriander seeds with a distinct citrusy aroma.",
    "price": 100.0,
    "weight": "250g",
    "category": "veg",
    "image": "https://images.unsplash.com/photo-1608797178894-bf7c596932da?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "color": "from-green-600 to-green-800",
    "isSignatureKit": false
  },
  {
    "id": "guntur-red-chilli-powder",
    "name": "Guntur Red Chilli Powder",
    "description": "Bright red color and intense heat. For those who love it spicy.",
    "price": 140.0,
    "weight": "100g",
    "category": "veg",
    "image": "https://images.unsplash.com/photo-1611396761090-48415264a174?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "color": "from-red-500 to-red-700",
    "isSignatureKit": false
  },
  {
    "id": "pure-turmeric-powder-haldi",
    "name": "Pure Turmeric Powder (Haldi)",
    "description": "High-curcumin turmeric, sourced directly from Salem farmers.",
    "price": 90.0,
    "weight": "250g",
    "category": "veg",
    "image": "https://media.istockphoto.com/id/1372767803/photo/curcuma-longa-powder-rhizomes-and-tea.jpg?s=2048x2048&w=is&k=20&c=FQF-ADMTWqFme9KYSGsAPa9tZFvahrIRc8frGtSsU-U=",
    "color": "from-yellow-300 to-amber-500",
    "isSignatureKit": false
  },
  {
    "id": "shahi-biryani-masala",
    "name": "Shahi Biryani Masala",
    "description": "Elevate your biryani with our secret mix of premium exotic spices.",
    "price": 200.0,
    "weight": "100g",
    "category": "blends",
    "image": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    "color": "from-yellow-400 to-orange-500",
    "isSignatureKit": false
  },
  {
    "id": "kashmiri-garam-masala",
    "name": "Kashmiri Garam Masala",
    "description": "The king of spice blends, roasted and ground for maximum aroma.",
    "price": 180.0,
    "weight": "100g",
    "category": "blends",
    "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    "color": "from-amber-700 to-orange-950",
    "isSignatureKit": false
  },
  {
    "id": "nizami-mutton-masala",
    "name": "Nizami Mutton Masala",
    "description": "Rich, robust, and intense spices crafted for the perfect slow-cooked mutton.",
    "price": 150.0,
    "weight": "100g",
    "category": "non-veg",
    "image": "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?auto=format&fit=crop&w=800&q=80",
    "color": "from-red-600 to-rose-900",
    "isSignatureKit": false
  },
  {
    "id": "royale-chicken-masala",
    "name": "Royale Chicken Masala",
    "description": "A perfect blend of aromatic spices to create the most flavourful chicken curries.",
    "price": 120.0,
    "weight": "100g",
    "category": "non-veg",
    "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    "color": "from-orange-500 to-red-600",
    "isSignatureKit": false
  }
];

export const SIGNATURE_KITS: SignatureKit[] = [
  {
    "id": "festive-family-collection",
    "name": "Festive Family Collection",
    "description": "Exotic masala combinations celebrating the warmth of Indian hospitality and traditional feasts.",
    "price": 750.0,
    "weight": "3 Masala Packs",
    "category": "blends",
    "image": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    "color": "from-red-600 to-orange-700",
    "isSignatureKit": true,
    "badge": "New Arrival Pack",
    "story": "A festive combination celebrating grand family banquets. Features Royal Biryani Masala, Tandoori Tikka Masala, and zesty Chaat Masala for complete culinary celebrations.",
    "originalPrice": 890.0
  },
  {
    "id": "kerala-whole-spice-kit",
    "name": "Kerala Whole Spice Kit",
    "description": "Pure, single-origin Tellicherry black pepper, bold cardamom, and oil-rich whole cloves.",
    "price": 990.0,
    "weight": "3 Whole Spice Packs",
    "category": "whole",
    "image": "https://thottamfarmfresh.com/wp-content/uploads/2021/05/Buy-CLoves-Online.webp",
    "color": "from-stone-700 to-stone-900",
    "isSignatureKit": true,
    "badge": "Collector's Edition",
    "story": "Whole jewels hand-harvested from high-altitude estates. Packed with intense essential oils and robust heat, this collection preserves the authentic botanical identity of the Western Ghats.",
    "originalPrice": 1090.0
  },
  {
    "id": "chefs-essential-blends",
    "name": "Chef's Essential Blends",
    "description": "Essential kitchen starters featuring Salem Turmeric, Kashmiri Garam Masala, and Cumin Powder.",
    "price": 390.0,
    "weight": "3 Masala Packs",
    "category": "veg",
    "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    "color": "from-yellow-300 to-amber-500",
    "isSignatureKit": true,
    "badge": "Best Value Kit",
    "story": "The building blocks of spice artistry. Sourced from Salem and Kashmir, these freshly ground staples provide vibrant colors, warm aromas, and clean flavors for daily vegetarian cuisine.",
    "originalPrice": 490.0
  },
  {
    "id": "royal-non-veg-box",
    "name": "Royal Non-Veg Box",
    "description": "The ultimate compilation of slow-cooked mutton, coastal fish, and royale chicken masala.",
    "price": 380.0,
    "weight": "3 Masala Packs",
    "category": "non-veg",
    "image": "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?auto=format&fit=crop&w=800&q=80",
    "color": "from-orange-500 to-red-600",
    "isSignatureKit": true,
    "badge": "Signature Collection",
    "story": "Crafted for legacy Indian feasts, these three core blends combine stone flower, star anise, and mace to replicate authentic curries passed down through royal cooks.",
    "originalPrice": 470.0
  }
];
