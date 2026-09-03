import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL. Set EXPO_PUBLIC_API_URL in .env to point at your machine's LAN
// IP so a physical phone in Expo Go can reach the FastAPI server.
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.102:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    console.log('🔹 Attaching token:', token ? 'yes' : 'no');  // 👈 add this
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});