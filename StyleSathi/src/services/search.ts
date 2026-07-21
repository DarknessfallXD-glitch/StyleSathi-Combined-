import { apiClient } from './api/client';

// Define what the search endpoint returns
export interface SearchProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  score?: number;   // optional, from backend
  tag?: string;     // optional, for UI
  is_ai_try_on?: boolean; // optional
}

export const searchProducts = async (query: string): Promise<SearchProduct[]> => {
  if (!query.trim()) return [];
  const response = await apiClient.get('/search', { params: { query } });
  const data = response.data;
  const results = [...(data.top_results || []), ...(data.more_results || [])];
  return results.map((item: any) => ({
    id: item.id,
    name: item.title || item.name || 'Unnamed',
    price: item.price || 0,
    category: item.category || '',
    image: item.image_url || item.image || '',
    score: item.score || 0,
    tag: item.tag || '',
    is_ai_try_on: item.is_ai_try_on || false,
  }));
};