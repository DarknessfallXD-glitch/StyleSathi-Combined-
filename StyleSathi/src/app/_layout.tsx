import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { ThemeProvider } from '../Context/ThemeContext';
import { ErrorBoundary } from '../comp/ErrorBoundary';
import { NetworkStatus } from '../comp/NetworkStatus';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await AsyncStorage.setItem('authToken', session.access_token);
      }
      setIsReady(true);
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await AsyncStorage.setItem('authToken', newSession.access_token);
      } else {
        await AsyncStorage.removeItem('authToken');
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  // Redirect logic
  useEffect(() => {
    if (!isReady) return;

    const currentRoute = segments[0] || '';
    const publicRoutes = ['welcome', 'signin', 'signup'];

    if (session) {
      // Only redirect from welcome to home
      if (currentRoute === 'welcome') {
        router.replace('/home');
        return;
      }
      // For signin/signup, we let those screens handle redirection
      // For other routes (protected), user is logged in – stay
    } else {
      // No session: if not on a public route and not home, redirect to welcome
      if (!publicRoutes.includes(currentRoute) && currentRoute !== 'home') {
        router.replace('/welcome');
        return;
      }
    }
  }, [session, segments, isReady, router]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F4F4' }}>
        <ActivityIndicator size="large" color="#FF6B8A" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NetworkStatus />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="signin" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="home" />
          <Stack.Screen name="personalize1" />
          <Stack.Screen name="upload" />
          <Stack.Screen name="style" />
          <Stack.Screen name="language" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="callback" />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}