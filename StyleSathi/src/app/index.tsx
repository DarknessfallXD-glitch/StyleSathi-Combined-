import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function SplashScreen() {
  const router = useRouter();
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate progress bar from 0 to 100% over 2.5 seconds
    Animated.timing(progress, {
      toValue: 100,
      duration: 2500,
      useNativeDriver: false,
    }).start();

    // Navigate to welcome page after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/welcome');  // This will go to your welcome page
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={styles.logoCircle}>
          {/* Changed from Text to Icon */}
          <Icon name="bolt" size={22} color="#FFCC00" />
        </View>

        <Text style={styles.title}>StyleSathy</Text>
        <Text style={styles.subtitle}>ONE EARTH • ONE STYLE</Text>

        <View style={styles.divider} />

        <Text style={styles.loading}>INITIALIZING AI STUDIO...</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width }]} />
        </View>
      </View>

      <Text style={styles.footer}>POWERED BY SATHY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2F343A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    color: '#FFFFFF',
    fontSize: 26,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2F343A',
  },
  subtitle: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  divider: {
    width: 100,
    height: 1,
    backgroundColor: '#DDD',
    marginVertical: 16,
  },
  loading: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    marginBottom: 12,
  },
  progressBarContainer: {
    width: 200,
    height: 2,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2F343A',
    borderRadius: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
  },
});