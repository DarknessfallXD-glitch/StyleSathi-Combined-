import AsyncStorage from '@react-native-async-storage/async-storage';

export type WishlistItem = {
  id: number;
  name: string;
  price: string;
  category: string;
  image: string;
  originalPrice?: string;
  discount?: string;
  isNew?: boolean;
  isAiTryOn?: boolean;
  isPriceDrop?: boolean;
};

// Add to wishlist
export const addToWishlist = async (item: WishlistItem) => {
  try {
    const existing = await getWishlist();
    const exists = existing.some(i => i.id === item.id);
    
    if (!exists) {
      const newWishlist = [...existing, item];
      await AsyncStorage.setItem('wishlist', JSON.stringify(newWishlist));
      console.log('Added:', item.name);
      return true;
    }
    console.log('Already exists:', item.name);
    return false;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  } 
};

// Remove from wishlist
export const removeFromWishlist = async (id: number) => {
  try {
    console.log('=== REMOVE FUNCTION STARTED ===');
    console.log('ID to remove:', id);
    console.log('Type of ID:', typeof id);
    
    const existing = await getWishlist();
    console.log('Current wishlist before removal:', JSON.stringify(existing, null, 2));
    console.log('Number of items before:', existing.length);
    
    // Find the item to see if it exists
    const itemToRemove = existing.find(item => item.id === id);
    console.log('Item found to remove:', itemToRemove);
    
    const newWishlist = existing.filter(item => item.id !== id);
    console.log('Number of items after filter:', newWishlist.length);
    
    await AsyncStorage.setItem('wishlist', JSON.stringify(newWishlist));
    console.log('Wishlist saved to storage');
    
    // Verify it was actually saved
    const verify = await AsyncStorage.getItem('wishlist');
    console.log('Verified storage after save:', verify);
    
    console.log('=== REMOVE FUNCTION COMPLETED ===');
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
};

// Get all wishlist items
export const getWishlist = async (): Promise<WishlistItem[]> => {
  try {
    const data = await AsyncStorage.getItem('wishlist');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return [];
  }
};

// Check if item is in wishlist
export const isInWishlist = async (id: number): Promise<boolean> => {
  const wishlist = await getWishlist();
  return wishlist.some(item => item.id === id);
};