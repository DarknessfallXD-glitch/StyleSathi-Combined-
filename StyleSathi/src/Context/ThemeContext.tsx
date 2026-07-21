import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
  colors: typeof lightColors;
};

const lightColors = {
  background: '#F4F4F4',
  surface: '#FFFFFF',
  text: '#2F343A',
  textSecondary: '#888888',
  border: '#E5E5E5',
  card: '#FFFFFF',
  inputBackground: '#EDEDED',
  inputText: '#333333',
  placeholder: '#999999',
  primary: '#FF6B8A',
  icon: '#666666',
  tabBar: '#FFFFFF',
  tabBarBorder: '#EEEEEE',
  error: '#FF4444',
  success: '#4CAF50',
};

const darkColors = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  border: '#333333',
  card: '#1E1E1E',
  inputBackground: '#2C2C2C',
  inputText: '#FFFFFF',
  placeholder: '#666666',
  primary: '#FF6B8A',
  icon: '#CCCCCC',
  tabBar: '#1E1E1E',
  tabBarBorder: '#333333',
  error: '#FF6B6B',
  success: '#4CAF50',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      } else if (systemColorScheme) {
        setTheme(systemColorScheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('appTheme', newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;
  const isDarkMode = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};