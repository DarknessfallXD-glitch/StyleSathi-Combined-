// utils/searchHistory.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'searchHistory';

// Get all search terms (most recent first)
export const getSearchHistory = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// Add a term (avoid duplicates, keep latest first, limit to 20)
export const addSearchTerm = async (term: string): Promise<void> => {
  try {
    const trimmed = term.trim();
    if (!trimmed) return;
    const history = await getSearchHistory();
    // Remove duplicate if exists
    const filtered = history.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
    // Add to front
    const updated = [trimmed, ...filtered].slice(0, 20); // keep only 20
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
};

// Remove a specific term
export const removeSearchTerm = async (term: string): Promise<void> => {
  try {
    const history = await getSearchHistory();
    const updated = history.filter(item => item !== term);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
};

// Clear all history
export const clearSearchHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};