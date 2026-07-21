import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome as Icon } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";

import BottomTab from "../comp/BottomTab";
import { ProductCard } from "../comp/ProductCard";
import { ThemedText } from "../comp/ThemedText";
import { useTheme } from "../Context/ThemeContext";
import { lightHaptic } from "../utils/haptic";

import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from "../utils/wishlist";

import {
  FeaturedCollection,
  fetchFeaturedCollections,
  fetchJustForYou,
  Product,
} from "../services/dummyData";

import { Skeleton } from "../comp/Skeleton";

// ----- Search History Utilities -----
import {
  getSearchHistory,
  addSearchTerm,
  removeSearchTerm,
  clearSearchHistory,
} from "../utils/searchHistory";

// ==================== SKELETON COMPONENTS (unchanged) ====================
const ProductCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.productCard, { backgroundColor: colors.surface, padding: 12, marginRight: 8, width: 160 }]}>
      <Skeleton height={130} borderRadius={12} />
      <Skeleton width={110} height={12} style={{ marginTop: 8 }} />
      <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
    </View>
  );
};

const HomeSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Skeleton width={120} height={14} />
            <Skeleton width={180} height={24} style={{ marginTop: 4 }} />
          </View>
          <Skeleton width={40} height={40} borderRadius={20} />
        </View>
        <Skeleton height={50} borderRadius={30} style={{ marginBottom: 24 }} />
        <View style={styles.section}>
          <View style={styles.recentSectionHeader}>
            <Skeleton width={20} height={16} borderRadius={8} />
            <Skeleton width={140} height={18} />
          </View>
          <View style={styles.recentList}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={80} height={32} borderRadius={20} style={{ marginRight: 10 }} />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Skeleton width={160} height={18} />
            <Skeleton width={50} height={14} />
          </View>
          <View style={styles.featuredContainer}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.featuredCard}>
                <Skeleton height={120} width={100} borderRadius={16} />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Skeleton width={120} height={18} />
          </View>
          <View style={styles.productList}>
            {[1, 2].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ==================== EMPTY STATE COMPONENTS ====================
const EmptyProducts = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
      <Icon name="shopping-bag" size={60} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No products found</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Check back later for new jewelry!</Text>
    </View>
  );
};

const EmptyFeatured = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.emptyFeaturedContainer, { backgroundColor: colors.surface }]}>
      <Icon name="star" size={30} color={colors.textSecondary} />
      <Text style={[styles.emptyFeaturedText, { color: colors.textSecondary }]}>No featured collections</Text>
    </View>
  );
};

const EmptyRecent = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.emptyRecentContainer, { backgroundColor: colors.surface }]}>
      <Icon name="history" size={24} color={colors.textSecondary} />
      <Text style={[styles.emptyRecentText, { color: colors.textSecondary }]}>No recent searches</Text>
    </View>
  );
};

// ==================== MAIN COMPONENT ====================

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  // Data states
  const [justForYou, setJustForYou] = useState<Product[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<FeaturedCollection[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]); // now array of strings
  const [wishlistStatus, setWishlistStatus] = useState<{ [key: number]: boolean }>({});

  // ----- Load user name & search history -----
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([loadUserName(), loadAllData()]);
  };

  const loadUserName = async () => {
    try {
      const cached = await AsyncStorage.getItem("user");
      if (cached) {
        const parsed = JSON.parse(cached);
        setUserName(parsed.name || "User");
      }
    } catch (err) {
      console.warn("Failed to load user name:", err);
    }
  };

  // ----- Load products & search history (dummy products, real search history) -----
  const loadAllData = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      const [products, featured, history] = await Promise.all([
        fetchJustForYou(),
        fetchFeaturedCollections(),
        getSearchHistory(),
      ]);
      setJustForYou(products);
      setFeaturedCollections(featured);
      setRecentSearches(history);
      if (products && products.length > 0) {
        await checkWishlistStatus(products);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      if (retryCount < 3) {
        const delay = 1000 * Math.pow(2, retryCount);
        setTimeout(() => loadAllData(retryCount + 1), delay);
        return;
      } else {
        setError("Unable to load data. Please check your connection and try again.");
      }
    } finally {
      if (error === null || retryCount >= 3) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    lightHaptic();
    setRefreshing(true);
    setError(null);
    await Promise.all([loadUserName(), loadAllData()]);
    setRefreshing(false);
  };

  // ----- Wishlist (dummy) -----
  const checkWishlistStatus = async (products: Product[]) => {
    const status: { [key: number]: boolean } = {};
    for (const item of products) {
      status[item.id] = await isInWishlist(item.id);
    }
    setWishlistStatus(status);
  };

  const toggleWishlist = async (item: Product) => {
    const isWishlisted = wishlistStatus[item.id];
    if (isWishlisted) {
      await removeFromWishlist(item.id);
    } else {
      await addToWishlist({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image,
      });
    }
    setWishlistStatus((prev) => ({
      ...prev,
      [item.id]: !isWishlisted,
    }));
  };

  // ----- Search handling -----
  const handleSearch = async () => {
    const trimmed = searchText.trim();
    if (!trimmed) return;
    await addSearchTerm(trimmed);
    setSearchText("");
    const updated = await getSearchHistory();
    setRecentSearches(updated);
    // (Optionally navigate to search results page)
    // router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleDeleteSearchTerm = async (term: string) => {
    await removeSearchTerm(term);
    const updated = await getSearchHistory();
    setRecentSearches(updated);
  };

  const handleClearAll = async () => {
    await clearSearchHistory();
    setRecentSearches([]);
  };

  // ----- Render functions -----
  const renderRecentSearch = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.recentChip, { backgroundColor: colors.surface }]}
      onPress={() => {
        setSearchText(item);
        handleSearch();
      }}
    >
      <ThemedText style={styles.recentChipText}>{item}</ThemedText>
      <TouchableOpacity
        onPress={() => handleDeleteSearchTerm(item)}
        style={styles.deleteChip}
      >
        <Icon name="times" size={14} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderJustForYou = ({ item }: { item: Product }) => {
    const isWishlisted = wishlistStatus[item.id] || false;
    const onToggle = () => toggleWishlist(item);
    const onCardPress = () => {
      router.push({
        pathname: '/product-detail',
        params: { product: JSON.stringify(item) },
      });
    };
    return (
      <ProductCard
        item={item}
        onPress={onCardPress}
        isWishlisted={isWishlisted}
        onToggleWishlist={onToggle}
      />
    );
  };

  // ----- Loading & Error states -----
  if (loading && !error) {
    return <HomeSkeleton />;
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
          <Icon name="exclamation-triangle" size={50} color={colors.primary} />
          <ThemedText style={styles.errorTitle}>Oops! Something went wrong</ThemedText>
          <ThemedText style={styles.errorMessage}>{error}</ThemedText>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => loadAllData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ----- Main render -----
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header with dynamic user name */}
        <View style={styles.header}>
  <View style={styles.headerLeft}>
    <ThemedText type="secondary" style={styles.welcomeText}>Welcome back</ThemedText>
    <ThemedText
      style={styles.userName}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      Hi, {userName || 'User'}! 😊
    </ThemedText>
  </View>
  <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
    <Octicons name={isDarkMode ? "sun" : "moon"} size={22} color={colors.icon} />
  </TouchableOpacity>
</View> 

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Icon name="search" size={18} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            placeholder="Describe what you want..."
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { color: colors.inputText }]}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch}>
            <Icon name="arrow-right" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Recent Searches Section */}
        <View style={styles.section}>
          <View style={styles.recentSectionHeader}>
            <Icon name="calendar" size={16} color={colors.primary} />
            <ThemedText style={styles.recentSectionTitle}>Recent Searches</ThemedText>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={handleClearAll}>
                <ThemedText style={styles.clearAllText}>Clear All</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          {recentSearches.length > 0 ? (
            <FlatList
              data={recentSearches}
              renderItem={renderRecentSearch}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            />
          ) : (
            <EmptyRecent />
          )}
        </View>

        {/* Featured Collections (dummy) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Featured Collections</ThemedText>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {featuredCollections.length > 0 ? (
            <View style={styles.featuredContainer}>
              {featuredCollections.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.featuredCard, { backgroundColor: item.color }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.featuredTitle}>{item.title}</Text>
                  <Text style={styles.featuredSubtitle}>{item.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyFeatured />
          )}
        </View>

        {/* Just For You (dummy) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Just For You</ThemedText>
          </View>
          {justForYou.length > 0 ? (
            <FlatList
              data={justForYou}
              renderItem={renderJustForYou}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
            />
          ) : (
            <EmptyProducts />
          )}
        </View>
      </ScrollView>

      <BottomTab active="home" />
    </View>
  );
}

// ----- STYLES (updated with new styles) -----
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 80 },
  header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
  },
    welcomeText: { fontSize: 14 },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    // no need for flexShrink because the parent has flex:1
  },
    themeButton: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 12 },
  section: { marginBottom: 28 },
  recentSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  recentSectionTitle: { fontSize: 18, fontWeight: "600" },
  clearAllText: { fontSize: 12, color: "#FF6B8A", marginLeft: 8 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
  seeAllText: { fontSize: 12, color: "#FF6B8A" },
  recentList: { gap: 8, flexDirection: "row" },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentChipText: { fontSize: 13 },
  deleteChip: { marginLeft: 6, padding: 4 },
  featuredContainer: { flexDirection: "row", gap: 12 },
  featuredCard: { flex: 1, borderRadius: 16, padding: 16, height: 120, justifyContent: "space-between" },
  featuredTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  featuredSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 4, marginBottom: 12 },
  productList: { gap: 20, flexDirection: "row" },
  productCard: { borderRadius: 16, width: 160, marginRight: 8, padding: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productImage: { width: "100%", height: 130, borderRadius: 12 },
  aiTag: { position: "absolute", top: 8, left: 8, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  aiTagText: { color: "grey", fontSize: 9, fontWeight: "600" },
  productName: { fontSize: 13, fontWeight: "500", marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: "700" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 40, borderRadius: 16, marginTop: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  emptyText: { fontSize: 12, marginTop: 4 },
  emptyFeaturedContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 30, borderRadius: 16 },
  emptyFeaturedText: { fontSize: 12, marginTop: 8 },
  emptyRecentContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 20, gap: 8 },
  emptyRecentText: { fontSize: 12 },
  // Error states
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, marginHorizontal: 20, borderRadius: 16 },
  errorTitle: { fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  errorMessage: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  retryButtonText: { color: "#FFF", fontWeight: "600" },

  headerLeft: {
    flex: 1,                 // allows text to shrink
    marginRight: 10,         // some spacing before the button
  },

});