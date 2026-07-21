import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTheme } from "../Context/ThemeContext";
import { ThemedText } from "../comp/ThemedText";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width - 64; // smaller, with 32px margin on each side

export default function ProductDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  const product = params.product ? JSON.parse(params.product as string) : null;

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText>Product not found</ThemedText>
      </View>
    );
  }

  const rating = product.rating ?? null;
  const reviewCount = product.reviewCount ?? 0;
  const description =
    product.description?.trim() || "Description not provided.";
  const material = product.material?.trim() || "Not listed";
  const weight = product.weight?.trim() || "Not listed";
  const length = product.length?.trim() || "Not listed";
  const gemstones = product.gemstones?.trim() || "None";
  const features =
    product.features && product.features.length > 0 ? product.features : [];
  const retailers =
    product.retailers && product.retailers.length > 0 ? product.retailers : [];

  const badges = ["Festival Special", "On You"];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Back Button - now positioned relative to the image container */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Product Image - centered with margins */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
      </View>

      {/* Badges */}
      <View style={styles.badgesRow}>
        {badges.map((badge, index) => (
          <View
            key={index}
            style={[styles.badge, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ))}
      </View>

      {/* Title & Rating */}
      <ThemedText style={styles.productName}>{product.name}</ThemedText>
      <View style={styles.ratingRow}>
        {rating ? (
          <>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {rating} ({reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
              )
            </Text>
          </>
        ) : (
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
            Not rated
          </Text>
        )}
      </View>

      {/* Price */}
      <ThemedText style={[styles.price, { color: colors.primary }]}>
        {product.price}
      </ThemedText>

      {/* About Section */}
      <ThemedText style={styles.sectionTitle}>ABOUT THIS ITEM</ThemedText>
      <ThemedText type="secondary" style={styles.description}>
        {description}
      </ThemedText>

      {/* Specifications */}
      <ThemedText style={styles.sectionTitle}>SPECIFICATIONS</ThemedText>
      <View style={styles.specsContainer}>
        <ThemedText style={styles.specItem}>• Material: {material}</ThemedText>
        <ThemedText style={styles.specItem}>• Weight: {weight}</ThemedText>
        <ThemedText style={styles.specItem}>• Length: {length}</ThemedText>
        <ThemedText style={styles.specItem}>
          • Gemstones: {gemstones}
        </ThemedText>
      </View>

      {/* Features / Benefits */}
      {features.length > 0 && (
        <>
          <ThemedText style={styles.sectionTitle}>FEATURES</ThemedText>
          <View style={styles.featuresRow}>
            {features.map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <Icon name={feature.icon} size={20} color={colors.primary} />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Retailers */}
      <ThemedText style={styles.sectionTitle}>
        SELECT RETAILER TO BUY
      </ThemedText>
      {retailers.length > 0 ? (
        retailers.map((retailer, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.retailerCard, { backgroundColor: colors.surface }]}
            onPress={() =>
              Alert.alert(
                "Redirect",
                `You will be redirected to ${retailer.name}`,
              )
            }
          >
            <Text style={[styles.retailerName, { color: colors.text }]}>
              {retailer.name}
            </Text>
            <Text style={[styles.retailerPrice, { color: colors.primary }]}>
              {retailer.price}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <ThemedText type="secondary" style={styles.noRetailersText}>
          No retailers available at the moment.
        </ThemedText>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  backButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  productImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 16,
    resizeMode: "cover",
  },
  badgesRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  specsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  specItem: {
    fontSize: 14,
    marginBottom: 6,
  },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  featureItem: {
    alignItems: "center",
    gap: 6,
  },
  featureText: {
    fontSize: 12,
  },
  retailerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  retailerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  retailerPrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  noRetailersText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
});
