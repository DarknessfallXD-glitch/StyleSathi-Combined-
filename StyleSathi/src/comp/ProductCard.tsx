import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import { useTheme } from '../Context/ThemeContext';
import { lightHaptic, successHaptic } from '../utils/haptic';

type Product = {
  id: number;
  name: string;
  price: string;
  tag: string;
  image: string;
  category: string;
};

type ProductCardProps = {
  item: Product;
  onPress: () => void;
  isWishlisted: boolean;
  onToggleWishlist: () => Promise<void>;
  width?: number;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onPress,
  isWishlisted,
  onToggleWishlist,
  width = 160,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartRotate = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const animateHeart = () => {
    // Reset rotation
    heartRotate.setValue(0);
    // Smoother spring with overshoot
    Animated.spring(heartScale, {
      toValue: 1.25,
      friction: 2.5,
      tension: 60,
      useNativeDriver: true,
    }).start(() => {
      // Spring back to original size with a gentle bounce
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        tension: 30,
        useNativeDriver: true,
      }).start();
    });

    // Add a small rotation for extra delight
    Animated.sequence([
      Animated.timing(heartRotate, {
        toValue: 0.1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(heartRotate, {
        toValue: -0.1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(heartRotate, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleWishlist = async () => {
    animateHeart();
    lightHaptic();
    await onToggleWishlist();
    successHaptic();
    Toast.show({
      type: 'success',
      text1: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      text2: item.name,
      position: 'bottom',
      visibilityTime: 1500,
    });
  };

  const rotateInterpolate = heartRotate.interpolate({
    inputRange: [-0.1, 0.1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <Animated.View style={[styles.container, { width, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={[styles.aiTag, { backgroundColor: colors.surface }]}>
            <Icon name="magic" size={10} color={colors.primary} />
            <Text style={[styles.aiTagText, { color: colors.primary }]}>{item.tag}</Text>
          </View>
          <Animated.View
            style={[
              styles.heartWrapper,
              {
                transform: [{ scale: heartScale }, { rotate: rotateInterpolate }],
              },
            ]}
          >
            <TouchableOpacity onPress={handleWishlist} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon
                name={isWishlisted ? 'heart' : 'heart-o'}
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>{item.price}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Styles remain exactly the same as before
const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  card: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 130,
    borderRadius: 12,
  },
  aiTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiTagText: {
    fontSize: 9,
    fontWeight: '600',
  },
  heartWrapper: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
});