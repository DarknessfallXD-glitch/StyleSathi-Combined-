// ==================== DUMMY DATA SERVICE ====================
// This file contains dummy data for testing
// Replace with real API calls when backend is ready

export type Product = {
  id: number;
  name: string;
  price: string;
  tag: string;
  image: string;
  category: string;
  // --- extended fields for product detail ---
  description: string;
  rating: number;
  reviewCount: number;
  material: string;
  weight: string;
  length: string;
  gemstones: string;
  features: { icon: string; text: string }[];
  retailers: { name: string; price: string; url: string }[];
};

export type FeaturedCollection = {
  id: number;
  title: string;
  subtitle: string;
  color: string;
};

export type RecentSearch = string;

// Dummy products data (now with full details)
export const DUMMY_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Antique Gold Jhumk",
    price: "₹4,999",
    tag: "AI Try-On",
    category: "EARRINGS",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200",
    description: "Handcrafted 24K gold-plated jhumk with traditional filigree work. Perfect for festive occasions and weddings.",
    rating: 4.8,
    reviewCount: 124,
    material: "24K Gold Plated Brass",
    weight: "45 grams",
    length: "Adjustable",
    gemstones: "Kundan & Ruby",
    features: [
      { icon: "truck", text: "Free Shipping" },
      { icon: "certificate", text: "Certified Gold" },
      { icon: "refresh", text: "7-Day Return" },
    ],
    retailers: [
      { name: "Amazon", price: "₹4,999", url: "https://amazon.in" },
      { name: "Flipkart", price: "₹4,950", url: "https://flipkart.com" },
      { name: "Daraz", price: "₹4,999", url: "https://daraz.com" },
    ],
  },
  {
    id: 2,
    name: "Silver Minimal Ring",
    price: "₹1,250",
    tag: "AI Try-On",
    category: "RINGS",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200",
    description: "Minimalist silver ring with a sleek finish. Ideal for daily wear and stacking.",
    rating: 4.5,
    reviewCount: 89,
    material: "925 Sterling Silver",
    weight: "3 grams",
    length: "Adjustable",
    gemstones: "None",
    features: [
      { icon: "truck", text: "Free Shipping" },
      { icon: "refresh", text: "7-Day Return" },
    ],
    retailers: [
      { name: "Amazon", price: "₹1,250", url: "https://amazon.in" },
      { name: "Flipkart", price: "₹1,200", url: "https://flipkart.com" },
    ],
  },
  {
    id: 3,
    name: "Pearl Drop Necklace",
    price: "₹3,400",
    tag: "AI Try-On",
    category: "NECKLACE",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200",
    description: "Elegant pearl drop necklace with a delicate chain. Perfect for parties and formal events.",
    rating: 4.7,
    reviewCount: 56,
    material: "Silver with Pearl",
    weight: "12 grams",
    length: "18 inches",
    gemstones: "Freshwater Pearls",
    features: [
      { icon: "truck", text: "Free Shipping" },
      { icon: "certificate", text: "Certified" },
      { icon: "refresh", text: "7-Day Return" },
    ],
    retailers: [
      { name: "Amazon", price: "₹3,400", url: "https://amazon.in" },
      { name: "Flipkart", price: "₹3,350", url: "https://flipkart.com" },
    ],
  },
  {
    id: 4,
    name: "Floral Tikka",
    price: "₹2,100",
    tag: "AI Try-On",
    category: "MAANG TIKKA",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200",
    description: "Floral design tikka with intricate kundan work. Ideal for weddings and festive occasions.",
    rating: 4.6,
    reviewCount: 42,
    material: "Gold Plated Metal",
    weight: "20 grams",
    length: "Adjustable chain",
    gemstones: "Kundan & Polki",
    features: [
      { icon: "truck", text: "Free Shipping" },
      { icon: "refresh", text: "7-Day Return" },
    ],
    retailers: [
      { name: "Amazon", price: "₹2,100", url: "https://amazon.in" },
      { name: "Flipkart", price: "₹2,050", url: "https://flipkart.com" },
      { name: "Daraz", price: "₹2,100", url: "https://daraz.com" },
    ],
  },
  {
    id: 5,
    name: "Traditional Temple Necklace",
    price: "₹12,499",
    tag: "Best Seller",
    category: "NECKLACE",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200",
    description: "Handcrafted traditional temple necklace with intricate detailing. Perfect for bridal wear and grand celebrations.",
    rating: 4.9,
    reviewCount: 203,
    material: "22K Gold Plated Brass",
    weight: "65 grams",
    length: "20 inches",
    gemstones: "Kundan, Ruby, Emerald",
    features: [
      { icon: "truck", text: "Free Shipping" },
      { icon: "certificate", text: "Certified Gold" },
      { icon: "refresh", text: "7-Day Return" },
      { icon: "gift", text: "Gift Box Included" },
    ],
    retailers: [
      { name: "Amazon", price: "₹12,499", url: "https://amazon.in" },
      { name: "Flipkart", price: "₹12,299", url: "https://flipkart.com" },
      { name: "Daraz", price: "₹12,499", url: "https://daraz.com" },
    ],
  },
  {
    id: 6,
    name: "Rose Gold Bangle",
    price: "₹1,499",
    tag: "Trending",
    category: "BANGLES",
    image: "https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200",
    description: "Stylish rose gold plated bangle with a smooth finish. Great for everyday wear.",
    rating: 4.4,
    reviewCount: 78,
    material: "Gold Plated Metal",
    weight: "15 grams",
    length: "2.5 inches diameter",
    gemstones: "None",
    features: [
      { icon: "truck", text: "Free Shipping" },
      { icon: "refresh", text: "7-Day Return" },
    ],
    retailers: [
      { name: "Amazon", price: "₹1,499", url: "https://amazon.in" },
      { name: "Flipkart", price: "₹1,450", url: "https://flipkart.com" },
    ],
  },
];

// Dummy featured collections
export const DUMMY_FEATURED: FeaturedCollection[] = [
  { id: 1, title: "Exclusive", subtitle: "Wedding Special", color: "#FF6B8A" },
  { id: 2, title: "Trending", subtitle: "Daily Explore", color: "#FFB347" },
  { id: 3, title: "New Arrivals", subtitle: "Just Landed", color: "#6C5CE7" },
];

// Dummy recent searches
export const DUMMY_RECENT_SEARCHES: RecentSearch[] = [
  "earrings",
  "नेपाली माता",
  "silver",
  "gold necklace",
  "diamond ring",
];

// API Service (switch between dummy and real API)
const USE_REAL_API = false; // Change to true when backend is ready
const API_BASE_URL = "http://localhost:3000/api";

// Fetch Just For You products
export const fetchJustForYou = async (): Promise<Product[]> => {
  if (!USE_REAL_API) {
    // Return dummy data
    return DUMMY_PRODUCTS;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/products/just-for-you`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

// Fetch Featured Collections
export const fetchFeaturedCollections = async (): Promise<FeaturedCollection[]> => {
  if (!USE_REAL_API) {
    return DUMMY_FEATURED;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/home/featured`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

// Fetch Recent Searches
export const fetchRecentSearches = async (): Promise<RecentSearch[]> => {
  if (!USE_REAL_API) {
    return DUMMY_RECENT_SEARCHES;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/recent-searches`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};