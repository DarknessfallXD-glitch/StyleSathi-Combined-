import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// Change this to true when backend is ready
const USE_REAL_API = false;

// Backend URL - Your friend will provide this
const API_BASE_URL = 'http://localhost:3000/api';

// ==================== DUMMY DATA (For frontend development) ====================

const dummyProducts = {
  justForYou: [
    { id: 1, name: 'Antique Gold Jhumk', price: 4999, tag: 'AI Try-On', category: 'EARRINGS', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200', is_new: true, is_ai_try_on: true },
    { id: 2, name: 'Silver Minimal Ring', price: 1250, tag: 'AI Try-On', category: 'RINGS', image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200', is_new: false, is_ai_try_on: true },
    { id: 3, name: 'Pearl Drop Necklace', price: 3400, tag: 'AI Try-On', category: 'NECKLACE', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200', is_new: false, is_ai_try_on: true },
    { id: 4, name: 'Floral Tikka', price: 2100, tag: 'AI Try-On', category: 'MAANG TIKKA', image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200', is_new: false, is_ai_try_on: true },
  ],
  featured: [
    { id: 5, name: 'Traditional Temple Necklace', price: 12499, category: 'NECKLACE', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', is_new: true },
    { id: 6, name: 'Antique Gold Jhumka', price: 8999, category: 'EARRINGS', image_url: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=400', is_new: true },
  ],
  searchResults: [
    { id: 1, name: 'Silver Nepali Mala', price: 3750, category: 'NECKLACE', image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200', is_new: true, is_ai_try_on: true },
    { id: 2, name: 'Rose Gold Bangle', price: 1499, category: 'BANGLES', image_url: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200' },
    { id: 3, name: 'White Gold Bracelet', price: 1699, category: 'BRACELET', image_url: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200' },
    { id: 4, name: 'Floral Nathi', price: 1200, category: 'NATH', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200' },
    { id: 5, name: 'White Choker', price: 500, category: 'CHOKER', image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200' },
    { id: 6, name: 'Gold Temple Jhumka', price: 5999, category: 'EARRINGS', image_url: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200', is_new: true },
  ],
};

// ==================== API SERVICE FUNCTIONS ====================

// Fetch Just For You products
export const fetchJustForYou = async () => {
  if (!USE_REAL_API) {
    return { success: true, data: dummyProducts.justForYou };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/products/just-for-you`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: [], error: 'Failed to fetch products' };
  }
};

// Fetch Search Results
export const fetchSearchResults = async (query: string = '') => {
  if (!USE_REAL_API) {
    let results = dummyProducts.searchResults;
    if (query) {
      results = results.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
    }
    return { success: true, data: results };
  }
  
  try {
    const url = query ? `${API_BASE_URL}/products/search?q=${query}` : `${API_BASE_URL}/products`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: [], error: 'Failed to fetch search results' };
  }
};

// Fetch Featured Collections
export const fetchFeatured = async () => {
  if (!USE_REAL_API) {
    return { success: true, data: dummyProducts.featured };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/products/featured`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: [], error: 'Failed to fetch featured' };
  }
};

// Fetch Product by ID
export const fetchProductById = async (id: number) => {
  if (!USE_REAL_API) {
    const allProducts = [...dummyProducts.justForYou, ...dummyProducts.searchResults];
    const product = allProducts.find(p => p.id === id);
    return { success: true, data: product };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: null, error: 'Failed to fetch product' };
  }
};

// Add to Wishlist
export const addToWishlist = async (userId: string, productId: number) => {
  if (!USE_REAL_API) {
    try {
      const existing = await AsyncStorage.getItem('wishlist');
      const wishlist = existing ? JSON.parse(existing) : [];
      if (!wishlist.some((item: any) => item.productId === productId)) {
        wishlist.push({ productId, userId, addedAt: new Date().toISOString() });
        await AsyncStorage.setItem('wishlist', JSON.stringify(wishlist));
      }
      return { success: true };
    } catch (error) {
      console.error('Storage Error:', error);
      return { success: false, error: 'Failed to save to wishlist' };
    }
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId }),
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Failed to add to wishlist' };
  }
};

// Get Wishlist Items
export const getWishlist = async (userId: string) => {
  if (!USE_REAL_API) {
    try {
      const existing = await AsyncStorage.getItem('wishlist');
      const wishlist = existing ? JSON.parse(existing) : [];
      const wishlistProducts = wishlist.map((item: any) => {
        const product = [...dummyProducts.justForYou, ...dummyProducts.searchResults]
          .find(p => p.id === item.productId);
        return product;
      }).filter(Boolean);
      return { success: true, data: wishlistProducts };
    } catch (error) {
      console.error('Storage Error:', error);
      return { success: false, data: [], error: 'Failed to fetch wishlist' };
    }
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: [], error: 'Failed to fetch wishlist' };
  }
};

// Remove from Wishlist
export const removeFromWishlist = async (userId: string, productId: number) => {
  if (!USE_REAL_API) {
    try {
      const existing = await AsyncStorage.getItem('wishlist');
      const wishlist = existing ? JSON.parse(existing) : [];
      const newWishlist = wishlist.filter((item: any) => item.productId !== productId);
      await AsyncStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return { success: true };
    } catch (error) {
      console.error('Storage Error:', error);
      return { success: false, error: 'Failed to remove from wishlist' };
    }
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId }),
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Failed to remove from wishlist' };
  }
};