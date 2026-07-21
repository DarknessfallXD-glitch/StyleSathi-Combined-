import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function NotFoundScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Check if there's a previous page to go back to
    // In React Native, we can check navigation history length
    setCanGoBack(true); // Default to true, router.back() will handle if not possible
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoBack = () => {
    try {
      router.back();
    } catch (error) {
      // If can't go back, go to welcome page
      router.replace('./welcome');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* 404 Icon */}
        <View style={styles.iconCircle}>
          <Icon name="exclamation-triangle" size={50} color="#FF6B8A" />
        </View>

        {/* Error Code */}
        <Text style={styles.errorCode}>404</Text>

        {/* Title */}
        <Text style={styles.title}>Page Not Found</Text>

        {/* Description */}
        <Text style={styles.description}>
          Oops! The page you are looking for{'\n'}
          doesn't exist or has been moved.
        </Text>

        {/* Decorative Line */}
        <View style={styles.divider} />

        {/* Suggestions */}
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionItem}>
            <Icon name="home" size={16} color="#FF6B8A" />
            <Text style={styles.suggestionText}> Go to Homepage</Text>
          </View>
          <View style={styles.suggestionItem}>
            <Icon name="arrow-left" size={16} color="#FF6B8A" />
            <Text style={styles.suggestionText}> Go back to previous page</Text>
          </View>
          <View style={styles.suggestionItem}>
            <Icon name="search" size={16} color="#FF6B8A" />
            <Text style={styles.suggestionText}> Check the URL for mistakes</Text>
          </View>
        </View>

        {/* Buttons */}

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  content: {
    alignItems: 'center',
    width: '100%',
  },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  errorCode: {
    fontSize: 64,
    fontWeight: '700',
    color: '#FF6B8A',
    letterSpacing: 4,
    marginBottom: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2F343A',
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },

  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E5E5',
    marginBottom: 30,
  },

  suggestionsContainer: {
    alignSelf: 'flex-start',
    width: '100%',
    marginBottom: 40,
    gap: 16,
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  suggestionText: {
    fontSize: 14,
    color: '#666',
  },

  primaryButton: {
    backgroundColor: '#FF6B8A',
    borderRadius: 28,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 28,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF6B8A',
    width: '100%',
  },

  secondaryButtonText: {
    color: '#FF6B8A',
    fontWeight: '600',
    fontSize: 16,
  },

  buttonIcon: {
    marginRight: 8,
  },
});