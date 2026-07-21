// ==================== SEARCH DATA SERVICE ====================
// This file contains dummy data for search testing
// Replace with real API calls when backend is ready

export type SearchProduct = {
  id: number;
  name: string;
  price: string;
  priceValue: number;
  category: string;
  image: string;
  isNew?: boolean;
  isAiTryOn?: boolean;
  isAiVerified?: boolean;
  description?: string;
  rating?: number;
};

// Featured items for horizontal scroll (Top picks)
export const FEATURED_ITEMS: SearchProduct[] = [
  {
    id: 1,
    name: 'Traditional Temple Necklace',
    price: '₹12,499',
    priceValue: 12499,
    category: 'NECKLACE',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    isAiVerified: true,
    description: 'Handcrafted traditional temple design with intricate detailing',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Antique Gold Jhumka',
    price: '₹8,999',
    priceValue: 8999,
    category: 'EARRINGS',
    image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=400',
    isAiVerified: true,
    description: 'Antique gold plated jhumka with traditional design',
    rating: 4.6,
  },
  {
    id: 3,
    name: 'Diamond Pendant Set',
    price: '₹24,999',
    priceValue: 24999,
    category: 'NECKLACE',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    isAiVerified: true,
    description: 'Real diamond pendant with chain',
    rating: 4.9,
  },
  {
    id: 4,
    name: 'Kundan Matha Patti',
    price: '₹15,999',
    priceValue: 15999,
    category: 'MAANG TIKKA',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400',
    isAiVerified: true,
    description: 'Traditional kundan matha patti for weddings',
    rating: 4.7,
  },
  {
    id: 5,
    name: 'Emerald Drop Earrings',
    price: '₹18,999',
    priceValue: 18999,
    category: 'EARRINGS',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    isAiVerified: true,
    description: 'Beautiful emerald drop earrings with gold plating',
    rating: 4.8,
  },
  {
    id: 6,
    name: 'Ruby Choker Set',
    price: '₹22,499',
    priceValue: 22499,
    category: 'NECKLACE',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    isAiVerified: true,
    description: 'Ruby stone choker with matching earrings',
    rating: 4.9,
  },
];

// All products for search (complete catalog)
export const ALL_PRODUCTS: SearchProduct[] = [
  // NECKLACES
  {
    id: 1,
    name: 'Silver Nepali Mala',
    price: '₹3,750',
    priceValue: 3750,
    category: 'NECKLACE',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200',
    isNew: true,
    isAiTryOn: true,
    description: 'Traditional Nepali silver mala with intricate design',
    rating: 4.5,
  },
  {
    id: 2,
    name: 'Pearl Drop Necklace',
    price: '₹3,400',
    priceValue: 3400,
    category: 'NECKLACE',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200',
    isAiTryOn: true,
    description: 'Elegant pearl drop necklace for special occasions',
    rating: 4.7,
  },
  {
    id: 3,
    name: 'Gold Plated Choker',
    price: '₹2,999',
    priceValue: 2999,
    category: 'NECKLACE',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200',
    isNew: true,
    description: 'Beautiful gold plated choker necklace',
    rating: 4.4,
  },
  {
    id: 4,
    name: 'Layered Pearl Necklace',
    price: '₹4,500',
    priceValue: 4500,
    category: 'NECKLACE',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200',
    description: 'Multi-layer pearl necklace with gold chain',
    rating: 4.6,
  },
  {
    id: 5,
    name: 'Oxidized Silver Necklace',
    price: '₹2,200',
    priceValue: 2200,
    category: 'NECKLACE',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200',
    isAiTryOn: true,
    description: 'Traditional oxidized silver necklace with pendant',
    rating: 4.3,
  },

  // EARRINGS
  {
    id: 6,
    name: 'Antique Gold Jhumk',
    price: '₹4,999',
    priceValue: 4999,
    category: 'EARRINGS',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200',
    isAiTryOn: true,
    description: 'Antique gold plated jhumk earrings',
    rating: 4.8,
  },
  {
    id: 7,
    name: 'Gold Temple Jhumka',
    price: '₹5,999',
    priceValue: 5999,
    category: 'EARRINGS',
    image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200',
    isNew: true,
    description: 'Gold plated temple jhumka earrings',
    rating: 4.6,
  },
  {
    id: 8,
    name: 'Diamond Stud Earrings',
    price: '₹8,999',
    priceValue: 8999,
    category: 'EARRINGS',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200',
    isAiVerified: true,
    description: 'Real diamond stud earrings in white gold',
    rating: 4.9,
  },
  {
    id: 9,
    name: 'Pearl Drop Earrings',
    price: '₹2,500',
    priceValue: 2500,
    category: 'EARRINGS',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200',
    description: 'Elegant pearl drop earrings',
    rating: 4.5,
  },
  {
    id: 10,
    name: 'Silver Hoop Earrings',
    price: '₹1,800',
    priceValue: 1800,
    category: 'EARRINGS',
    image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200',
    isAiTryOn: true,
    description: 'Classic silver hoop earrings',
    rating: 4.4,
  },
  {
    id: 11,
    name: 'Kundan Chandbali',
    price: '₹7,500',
    priceValue: 7500,
    category: 'EARRINGS',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200',
    isNew: true,
    description: 'Traditional kundan chandbali earrings',
    rating: 4.7,
  },

  // RINGS
  {
    id: 12,
    name: 'Silver Minimal Ring',
    price: '₹1,250',
    priceValue: 1250,
    category: 'RINGS',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200',
    isAiTryOn: true,
    description: 'Minimalist silver ring for daily wear',
    rating: 4.4,
  },
  {
    id: 13,
    name: 'Gold Plated Ring',
    price: '₹2,499',
    priceValue: 2499,
    category: 'RINGS',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200',
    description: 'Elegant gold plated ring with stone',
    rating: 4.5,
  },
  {
    id: 14,
    name: 'Diamond Engagement Ring',
    price: '₹15,999',
    priceValue: 15999,
    category: 'RINGS',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200',
    isAiVerified: true,
    description: 'Real diamond engagement ring',
    rating: 4.9,
  },
  {
    id: 15,
    name: 'Rose Gold Stackable Ring',
    price: '₹1,999',
    priceValue: 1999,
    category: 'RINGS',
    image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200',
    isNew: true,
    description: 'Rose gold plated stackable ring',
    rating: 4.3,
  },

  // BANGLES & BRACELETS
  {
    id: 16,
    name: 'Rose Gold Bangle',
    price: '₹1,499',
    priceValue: 1499,
    category: 'BANGLES',
    image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200',
    description: 'Rose gold plated bangle set',
    rating: 4.2,
  },
  {
    id: 17,
    name: 'White Gold Bracelet',
    price: '₹1,699',
    priceValue: 1699,
    category: 'BRACELET',
    image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200',
    description: 'Elegant white gold bracelet',
    rating: 4.3,
  },
  {
    id: 18,
    name: 'Antique Gold Kada',
    price: '₹3,999',
    priceValue: 3999,
    category: 'BANGLES',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200',
    isNew: true,
    description: 'Traditional antique gold kada for men',
    rating: 4.6,
  },
  {
    id: 19,
    name: 'Diamond Tennis Bracelet',
    price: '₹12,999',
    priceValue: 12999,
    category: 'BRACELET',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200',
    isAiVerified: true,
    description: 'Real diamond tennis bracelet',
    rating: 4.8,
  },
  {
    id: 20,
    name: 'Pearl Bangle Set',
    price: '₹2,899',
    priceValue: 2899,
    category: 'BANGLES',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200',
    description: 'Set of 3 pearl bangles',
    rating: 4.4,
  },

  // MAANG TIKKA / NATH
  {
    id: 21,
    name: 'Floral Tikka',
    price: '₹2,100',
    priceValue: 2100,
    category: 'MAANG TIKKA',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200',
    isAiTryOn: true,
    description: 'Floral design tikka for special occasions',
    rating: 4.5,
  },
  {
    id: 22,
    name: 'Kundan Maang Tikka',
    price: '₹3,500',
    priceValue: 3500,
    category: 'MAANG TIKKA',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200',
    isNew: true,
    description: 'Traditional kundan maang tikka',
    rating: 4.7,
  },
  {
    id: 23,
    name: 'Floral Nathi',
    price: '₹1,200',
    priceValue: 1200,
    category: 'NATH',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200',
    description: 'Floral design nose ring',
    rating: 4.1,
  },
  {
    id: 24,
    name: 'Gold Nose Pin',
    price: '₹899',
    priceValue: 899,
    category: 'NATH',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200',
    description: 'Simple gold nose pin',
    rating: 4.2,
  },

  // CHOKERS
  {
    id: 25,
    name: 'White Choker',
    price: '₹500',
    priceValue: 500,
    category: 'CHOKER',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200',
    description: 'Simple white choker necklace',
    rating: 4.0,
  },
  {
    id: 26,
    name: 'Black Velvet Choker',
    price: '₹799',
    priceValue: 799,
    category: 'CHOKER',
    image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200',
    isNew: true,
    description: 'Elegant black velvet choker with pendant',
    rating: 4.3,
  },
  {
    id: 27,
    name: 'Gold Coin Choker',
    price: '₹2,999',
    priceValue: 2999,
    category: 'CHOKER',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200',
    description: 'Traditional gold coin choker',
    rating: 4.5,
  },

  // Additional Items
  {
    id: 28,
    name: 'Anklet Silver',
    price: '₹1,299',
    priceValue: 1299,
    category: 'ANKLET',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200',
    description: 'Silver anklet with bells',
    rating: 4.3,
  },
  {
    id: 29,
    name: 'Toe Rings Set',
    price: '₹399',
    priceValue: 399,
    category: 'TOE RINGS',
    image: '',
    description: 'Set of 2 silver toe rings',
    rating: 4.1,
  },
  {
    id: 30,
    name: 'Nose Chain',
    price: '₹1,499',
    priceValue: 1499,
    category: 'NATH',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200',
    isNew: true,
    description: 'Elegant nose chain with chain',
    rating: 4.4,
  },
  {
    id: 31,
    name: 'Armlet Gold Plated',
    price: '₹2,499',
    priceValue: 2499,
    category: 'ARMLET',
    image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200',
    description: 'Gold plated armlet for special occasions',
    rating: 4.5,
  },
  {
    id: 32,
    name: 'Hair Accessory Set',
    price: '₹899',
    priceValue: 899,
    category: 'HAIR',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200',
    description: 'Set of 4 hair pins with pearls',
    rating: 4.2,
  },
];

// Search function that mimics API behavior
export const searchProducts = async (query: string): Promise<SearchProduct[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!query.trim()) {
    return ALL_PRODUCTS;
  }
  
  const searchTerm = query.toLowerCase().trim();
  const results = ALL_PRODUCTS.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm) ||
    product.description?.toLowerCase().includes(searchTerm)
  );
  
  // Sort by relevance (name match first, then category match)
  return results.sort((a, b) => {
    const aNameMatch = a.name.toLowerCase().includes(searchTerm) ? 2 : 0;
    const bNameMatch = b.name.toLowerCase().includes(searchTerm) ? 2 : 0;
    const aCatMatch = a.category.toLowerCase().includes(searchTerm) ? 1 : 0;
    const bCatMatch = b.category.toLowerCase().includes(searchTerm) ? 1 : 0;
    const aScore = aNameMatch + aCatMatch;
    const bScore = bNameMatch + bCatMatch;
    return bScore - aScore;
  });
};

// Get featured items
export const getFeaturedItems = async (): Promise<SearchProduct[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return FEATURED_ITEMS;
};

// Filter products by category
export const filterByCategory = (products: SearchProduct[], category: string | null): SearchProduct[] => {
  if (!category) return products;
  return products.filter(p => p.category === category);
};

// Sort products
export const sortProducts = (products: SearchProduct[], sortBy: string | null): SearchProduct[] => {
  if (!sortBy) return products;
  
  const sorted = [...products];
  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.priceValue - b.priceValue);
    case 'price_desc':
      return sorted.sort((a, b) => b.priceValue - a.priceValue);
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return products;
  }
};

// Get unique categories from products
export const getCategories = (): string[] => {
  const categories = new Set(ALL_PRODUCTS.map(p => p.category));
  return Array.from(categories).sort();
};