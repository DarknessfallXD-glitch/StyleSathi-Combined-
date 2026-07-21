import { apiClient } from './client';

export const getPreferences = async (): Promise<Record<string, any>> => {
  const res = await apiClient.get('/preferences/me');
  return res.data.preferences;
};

export const updatePreferences = async (prefs: Record<string, any>): Promise<void> => {
  await apiClient.patch('/preferences/me', prefs);
};