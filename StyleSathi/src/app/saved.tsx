import React, { useState, useCallback, useRef } from 'react';
import BottomTab from '../comp/BottomTab';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../Context/ThemeContext';
import { ThemedText } from '../comp/ThemedText';
import { lightHaptic, successHaptic } from '../utils/haptic';
import Toast from 'react-native-toast-message';

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

// Separate component for each wishlist item – allows using hooks
const WishlistItemCard = ({ item, onRemove }: { item: WishlistItem; onRemove: (id: number, name: string) => void }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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

  return (
    <View style={[styles.wishlistCard, { backgroundColor: colors.surface }]}>
      <Image source={{ uri: item.image }} style={styles.wishlistImage} />
      <View style={styles.wishlistInfo}>
        <View style={styles.wishlistHeader}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category}</Text>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() => onRemove(item.id, item.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="trash-o" size={18} color={colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        </View>
        <ThemedText style={styles.productName}>{item.name}</ThemedText>
        <ThemedText style={[styles.currentPrice, { color: colors.primary }]}>{item.price}</ThemedText>
      </View>
    </View>
  );
};

export default function SavedScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [])
  );

  const loadWishlist = async () => {
    try {
      const existing = await AsyncStorage.getItem('wishlist');
      const items = existing ? JSON.parse(existing) : [];
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const handleRemove = async (id: number, itemName: string) => {
    lightHaptic();
    const newList = wishlistItems.filter(item => item.id !== id);
    await AsyncStorage.setItem('wishlist', JSON.stringify(newList));
    setWishlistItems(newList);
    successHaptic();
    Toast.show({
      type: 'success',
      text1: 'Removed from wishlist',
      text2: itemName,
      position: 'bottom',
      visibilityTime: 1500,
    });
  };

  const handleBackPress = () => {
    lightHaptic(); // 👈 haptic on back arrow tap
    router.replace('./try-on');
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <WishlistItemCard item={item} onRemove={handleRemove} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <Icon name="arrow-left" size={22} color={colors.icon} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Saved Items</ThemedText>
          <View style={{ width: 22 }} />
        </View>

        {/* My Wishlist Section */}
        <View style={styles.wishlistHeaderSection}>
          <ThemedText style={styles.wishlistTitle}>My Wishlist</ThemedText>
          <ThemedText type="secondary" style={styles.wishlistCount}>
            {wishlistItems.length} items waiting for you
          </ThemedText>
        </View>

        {/* Wishlist Items Grid */}
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.wishlistList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="heart-o" size={50} color={colors.textSecondary} />
              <ThemedText style={styles.emptyText}>Your wishlist is empty</ThemedText>
              <ThemedText type="secondary" style={styles.emptySubtext}>
                Tap the heart icon on products to add them here!
              </ThemedText>
            </View>
          }
        />

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Icon name="bell-o" size={16} color={colors.primary} />
          <ThemedText style={styles.footerText}>Always get the best price</ThemedText>
        </View>
        <ThemedText type="secondary" style={styles.footerSubtext}>
          We'll notify you the moment your favorites go on sale!
        </ThemedText>
      </ScrollView>

      <BottomTab active="saved" />
      <Toast />
    </View>
  );
}

// Styles remain exactly as you already have them (unchanged)
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  wishlistHeaderSection: { paddingHorizontal: 20, marginBottom: 16 },
  wishlistTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  wishlistCount: { fontSize: 13 },
  wishlistList: { paddingHorizontal: 20 },
  wishlistCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wishlistImage: { width: 100, height: 100, borderRadius: 12 },
  wishlistInfo: { flex: 1, marginLeft: 12 },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: { fontSize: 10, fontWeight: '600' },
  productName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  currentPrice: { fontSize: 16, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, marginTop: 16 },
  emptySubtext: { fontSize: 12, marginTop: 8 },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  footerText: { fontSize: 14, fontWeight: '600' },
  footerSubtext: { fontSize: 11, textAlign: 'center', marginHorizontal: 40, marginBottom: 20, lineHeight: 16 },
});