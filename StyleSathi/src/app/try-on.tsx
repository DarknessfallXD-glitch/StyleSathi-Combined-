import React, { useRef, useState } from "react";

import BottomTab from "../comp/BottomTab";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";

import Icon from "@expo/vector-icons/FontAwesome";

import * as ImagePicker from "expo-image-picker";

import { Platform } from "react-native";
import { File as ExpoFile, Paths } from "expo-file-system";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "../Context/ThemeContext";

import { ThemedText } from "../comp/ThemedText";

import { API_BASE_URL } from "../lib/config";

const { width } = Dimensions.get("window");

type TryOnResult = {
  id: string;

  name: string;

  price: string;

  image: string;

  isAiGenerated: boolean;
};

export default function TryOnScreen() {
  const router = useRouter();

  const { colors } = useTheme();

  const scrollX = useRef(new Animated.Value(0)).current;

  const { garmentImage, productName, productPrice } = useLocalSearchParams<{
    garmentImage?: string;

    productName?: string;

    productPrice?: string;
  }>();

  const selectedGarment =
    typeof garmentImage === "string" ? garmentImage : undefined;

  const selectedProductName =
    typeof productName === "string" ? productName : undefined;

  const selectedProductPrice =
    typeof productPrice === "string" ? productPrice : undefined;

  const [personImage, setPersonImage] = useState<string | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);

  // Kept from the original screen as example cards. These are not generated

  // by the live model; actual output is shown in the panel below.

  const tryOnResults: TryOnResult[] = [
    {
      id: "1",

      name: "Traditional Temple Necklace",

      price: "₹12,499",

      image:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",

      isAiGenerated: false,
    },

    {
      id: "2",

      name: "Silver Nepali Mala",

      price: "₹3,750",

      image:
        "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800",

      isAiGenerated: false,
    },

    {
      id: "3",

      name: "Antique Gold Jhumka",

      price: "₹5,999",

      image:
        "https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=800",

      isAiGenerated: false,
    },
  ];

  const choosePersonImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",

          "Please allow photo-library access to select your photo.",
        );

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],

        allowsEditing: true,

        quality: 0.9,
      });

      if (!result.canceled && result.assets.length > 0) {
        setPersonImage(result.assets[0].uri);

        setGeneratedImage(null);
      }
    } catch (error) {
      Alert.alert(
        "Could not open photos",

        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const getUploadableImage = async (
    uri: string,
    filename: string,
  ): Promise<any> => {
    // Browsers use Blob/File objects. Do not call expo-file-system on web.
    if (Platform.OS === "web") {
      const response = await fetch(uri);

      if (!response.ok) {
        throw new Error(
          `Could not load ${filename} (HTTP ${response.status}).`,
        );
      }

      const blob = await response.blob();
      const mimeType = blob.type || "image/jpeg";
      const extension = mimeType.includes("png")
        ? "png"
        : mimeType.includes("webp")
          ? "webp"
          : "jpg";

      return new globalThis.File([blob], `${filename}.${extension}`, {
        type: mimeType,
      });
    }

    // Native platforms use a local file URI in React Native FormData.
    let localUri = uri;

    if (/^https?:\/\//i.test(uri)) {
      const extensionMatch = uri.split("?")[0].match(/\.(png|webp|jpe?g)$/i);
      const extension = extensionMatch?.[1]?.toLowerCase() ?? "jpg";
      const destination = new ExpoFile(Paths.cache, `${filename}.${extension}`);

      const downloaded = await ExpoFile.downloadFileAsync(uri, destination, {
        idempotent: true,
      });

      localUri = downloaded.uri;
    }

    const extension = localUri.split("?")[0].split(".").pop()?.toLowerCase();
    const type =
      extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg";

    return { uri: localUri, name: `${filename}.${extension || "jpg"}`, type };
  };

  const generateTryOn = async () => {
    if (!personImage) {
      Alert.alert("Photo required", "Please select your photo first.");
      return;
    }

    if (!selectedGarment) {
      Alert.alert(
        "Product required",
        "Return to a product card and tap AI Try-On to select an item.",
      );
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please sign in again to use AI Try-On.");
      }

      const personFile = await getUploadableImage(personImage, "person-image");
      const garmentFile = await getUploadableImage(
        selectedGarment,
        "garment-image",
      );

      const formData = new FormData();
      // These names match server/api/tryon.py.
      formData.append("user_image", personFile as any);
      formData.append("product_image", garmentFile as any);

      const baseUrl = API_BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/try-on/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // Avoid hiding backend errors when it returns non-JSON content.
      const responseText = await response.text();
      let data: any;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          `The server returned an invalid response (HTTP ${response.status}).`,
        );
      }

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : `The virtual try-on request failed (HTTP ${response.status}).`,
        );
      }

      if (
        typeof data.generated_image_url !== "string" ||
        !data.generated_image_url
      ) {
        throw new Error("The backend did not return generated_image_url.");
      }

      const imageUrl = /^https?:\/\//i.test(data.generated_image_url)
        ? data.generated_image_url
        : `${baseUrl}${data.generated_image_url.startsWith("/") ? "" : "/"}${data.generated_image_url}`;

      setGeneratedImage(imageUrl);
    } catch (error) {
      Alert.alert(
        "Try-on failed",
        error instanceof Error
          ? error.message
          : "Could not connect to the AI backend. Check the server and network.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTryOnItem = ({
    item,

    index,
  }: {
    item: TryOnResult;

    index: number;
  }) => {
    const inputRange = [
      (index - 1) * width * 0.72,

      index * width * 0.72,

      (index + 1) * width * 0.72,
    ];

    const scale = scrollX.interpolate({
      inputRange,

      outputRange: [0.88, 1.02, 0.88],

      extrapolate: "clamp",
    });

    const translateY = scrollX.interpolate({
      inputRange,

      outputRange: [20, 0, 20],

      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,

      outputRange: [0.6, 1, 0.6],

      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.resultCard,

          {
            backgroundColor: colors.surface,

            transform: [{ scale }, { translateY }],

            opacity,
          },
        ]}
      >
        <Image source={{ uri: item.image }} style={styles.resultImage} />

        {!item.isAiGenerated && (
          <View style={[styles.aiTag, { backgroundColor: colors.surface }]}>
            <Icon name="image" size={10} color={colors.primary} />

            <Text style={[styles.sampleTagText, { color: colors.primary }]}>
              Sample
            </Text>
          </View>
        )}

        <View style={[styles.bottomInfo, { backgroundColor: colors.surface }]}>
          <ThemedText style={styles.resultName}>{item.name}</ThemedText>

          <ThemedText style={[styles.resultPrice, { color: colors.primary }]}>
            {item.price}
          </ThemedText>

          <TouchableOpacity
            style={[styles.buyButton, { backgroundColor: colors.primary }]}
            onPress={() =>
              Alert.alert(
                "Coming soon",

                "Shopping checkout will be connected here.",
              )
            }
          >
            <Icon name="shopping-cart" size={14} color="#fff" />

            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.replace("./search-result")}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevron-left" size={18} color={colors.icon} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle}>Your Style Try-On</ThemedText>

          <View style={[styles.tryBadge, { backgroundColor: colors.surface }]}>
            <Text
              style={[styles.tryBadgeText, { color: colors.textSecondary }]}
            >
              AI TRY-ON
            </Text>
          </View>
        </View>

        {/* MAGIC BADGE */}

        <View style={[styles.magicBadge, { backgroundColor: colors.surface }]}>
          <Icon name="magic" size={14} color={colors.primary} />

          <Text style={[styles.magicText, { color: colors.primary }]}>
            AI Magic Ready
          </Text>
        </View>

        {/* LIVE TRY-ON FORM */}

        <View
          style={[styles.uploadSection, { backgroundColor: colors.surface }]}
        >
          <ThemedText style={styles.sectionTitle}>
            {selectedGarment ? "Try on this item" : "Choose a product first"}
          </ThemedText>

          {selectedGarment ? (
            <>
              <Text
                style={[styles.uploadSubtitle, { color: colors.textSecondary }]}
              >
                {selectedProductName || "Selected product"}

                {selectedProductPrice ? ` · ${selectedProductPrice}` : ""}
              </Text>

              <Image
                source={{ uri: selectedGarment }}
                style={styles.garmentPreview}
                resizeMode="contain"
              />
            </>
          ) : (
            <Text
              style={[styles.uploadSubtitle, { color: colors.textSecondary }]}
            >
              Open a product card and tap AI Try-On. Its image will appear here
              automatically.
            </Text>
          )}

          <TouchableOpacity
            onPress={choosePersonImage}
            activeOpacity={0.85}
            style={[
              styles.photoButton,

              {
                borderColor: colors.primary,

                backgroundColor: colors.background,
              },
            ]}
          >
            {personImage ? (
              <Image
                source={{ uri: personImage }}
                style={styles.personPreview}
              />
            ) : (
              <Icon name="user-circle" size={32} color={colors.primary} />
            )}

            <View style={styles.photoButtonText}>
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {personImage ? "Change your photo" : "Add your photo"}
              </Text>

              <Text style={[styles.photoHint, { color: colors.textSecondary }]}>
                Choose a clear photo of yourself
              </Text>
            </View>

            <Icon name="image" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={generateTryOn}
            disabled={isGenerating || !selectedGarment || !personImage}
            activeOpacity={0.85}
            style={[
              styles.generateButton,

              {
                backgroundColor: colors.primary,

                opacity:
                  isGenerating || !selectedGarment || !personImage ? 0.55 : 1,
              },
            ]}
          >
            {isGenerating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Icon name="magic" size={16} color="#FFFFFF" />
            )}

            <Text style={styles.generateButtonText}>
              {isGenerating ? "Generating your look..." : "Generate AI Try-On"}
            </Text>
          </TouchableOpacity>

          {isGenerating && (
            <Text style={[styles.loadingHint, { color: colors.textSecondary }]}>
              This may take a little while. Keep the app open.
            </Text>
          )}

          {generatedImage && (
            <View style={styles.generatedResult}>
              <ThemedText style={styles.sectionTitle}>
                Your AI Try-On Result
              </ThemedText>

              <Image
                source={{ uri: generatedImage }}
                style={styles.generatedPreview}
                resizeMode="contain"
              />

              <TouchableOpacity
                onPress={generateTryOn}
                disabled={isGenerating}
                style={[styles.tryAgainButton, { borderColor: colors.primary }]}
              >
                <Icon name="refresh" size={14} color={colors.primary} />

                <Text style={[styles.tryAgainText, { color: colors.primary }]}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ORIGINAL SAMPLE CAROUSEL */}

        <ThemedText style={styles.generatedTitle}>
          Inspiration Gallery
        </ThemedText>

        <ThemedText type="secondary" style={styles.generatedSubtitle}>
          Sample product styles. Your real AI result appears above after
          generation.
        </ThemedText>

        <Animated.FlatList
          data={tryOnResults}
          renderItem={renderTryOnItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          snapToInterval={width * 0.72}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],

            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
        />

        {/* ANALYTICS - retained from the original screen */}

        <View style={styles.analyticsRow}>
          <View
            style={[styles.analyticsCard, { backgroundColor: colors.surface }]}
          >
            <Text
              style={[styles.analyticsLabel, { color: colors.textSecondary }]}
            >
              TOTAL TRIES TODAY
            </Text>

            <ThemedText style={styles.analyticsValue}>AI Try-On</ThemedText>
          </View>

          <View
            style={[styles.analyticsCard, { backgroundColor: colors.surface }]}
          >
            <Text
              style={[styles.analyticsLabel, { color: colors.textSecondary }]}
            >
              SELECTED STYLE
            </Text>

            <ThemedText
              style={[styles.analyticsPink, { color: colors.primary }]}
            >
              {selectedProductName || "Not selected"}
            </ThemedText>
          </View>
        </View>

        {/* UPGRADE */}

        <View
          style={[styles.upgradeBanner, { backgroundColor: colors.surface }]}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <ThemedText style={styles.upgradeTitle}>
              Unlimited styling
            </ThemedText>

            <ThemedText type="secondary" style={styles.upgradeSub}>
              Only ₹99/month
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/subscription")}
          >
            <Text style={styles.upgradeBtnText}>Upgrade →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomTab active="try-on" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,

    paddingTop: 20,

    paddingBottom: 100,
  },

  topRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 22,
  },

  headerTitle: {
    fontSize: 18,

    fontWeight: "700",
  },

  tryBadge: {
    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 20,
  },

  tryBadgeText: {
    fontSize: 10,

    fontWeight: "700",
  },

  magicBadge: {
    flexDirection: "row",

    alignItems: "center",

    alignSelf: "flex-start",

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 999,

    marginBottom: 22,
  },

  magicText: {
    marginLeft: 8,

    fontWeight: "700",

    fontSize: 13,
  },

  uploadSection: {
    borderRadius: 22,

    padding: 16,

    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 20,

    fontWeight: "800",
  },

  uploadSubtitle: {
    fontSize: 13,

    marginTop: 6,

    marginBottom: 12,

    lineHeight: 19,
  },

  garmentPreview: {
    width: "100%",

    height: 230,

    borderRadius: 16,

    marginBottom: 16,
  },

  photoButton: {
    minHeight: 84,

    borderWidth: 1.5,

    borderRadius: 16,

    padding: 12,

    flexDirection: "row",

    alignItems: "center",

    gap: 12,

    marginBottom: 14,
  },

  personPreview: {
    width: 56,

    height: 56,

    borderRadius: 12,
  },

  photoButtonText: {
    flex: 1,
  },

  photoHint: {
    fontSize: 12,

    marginTop: 4,
  },

  generateButton: {
    minHeight: 52,

    borderRadius: 999,

    paddingHorizontal: 16,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 10,
  },

  generateButtonText: {
    color: "#FFFFFF",

    fontWeight: "800",

    fontSize: 15,
  },

  loadingHint: {
    fontSize: 12,

    marginTop: 10,

    textAlign: "center",
  },

  generatedResult: {
    marginTop: 24,
  },

  generatedPreview: {
    width: "100%",

    height: 380,

    marginTop: 12,

    borderRadius: 16,

    backgroundColor: "#88888818",
  },

  tryAgainButton: {
    alignSelf: "flex-start",

    marginTop: 12,

    borderWidth: 1,

    borderRadius: 999,

    paddingHorizontal: 14,

    paddingVertical: 9,

    flexDirection: "row",

    alignItems: "center",

    gap: 8,
  },

  tryAgainText: {
    fontSize: 13,

    fontWeight: "700",
  },

  generatedTitle: {
    fontSize: 26,

    fontWeight: "800",

    marginBottom: 8,
  },

  generatedSubtitle: {
    fontSize: 14,

    marginBottom: 24,
  },

  carouselContent: {
    paddingLeft: 10,

    paddingRight: 40,

    paddingBottom: 20,
  },

  resultCard: {
    width: width * 0.68,

    borderRadius: 24,

    overflow: "hidden",

    marginRight: 18,

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 18,

    shadowOffset: { width: 0, height: 10 },

    elevation: 6,
  },

  resultImage: {
    width: "100%",

    height: 340,

    resizeMode: "cover",
  },

  aiTag: {
    position: "absolute",

    top: 16,

    left: 16,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 999,
  },

  sampleTagText: {
    fontSize: 11,

    fontWeight: "700",

    marginLeft: 6,
  },

  bottomInfo: {
    padding: 18,
  },

  resultName: {
    fontSize: 18,

    fontWeight: "700",

    marginBottom: 6,
  },

  resultPrice: {
    fontSize: 22,

    fontWeight: "800",

    marginBottom: 16,
  },

  buyButton: {
    height: 48,

    borderRadius: 999,

    alignItems: "center",

    justifyContent: "center",

    flexDirection: "row",
  },

  buyButtonText: {
    color: "#fff",

    fontWeight: "700",

    fontSize: 15,

    marginLeft: 8,
  },

  analyticsRow: {
    flexDirection: "row",

    gap: 12,

    marginTop: 28,
  },

  analyticsCard: {
    flex: 1,

    borderRadius: 22,

    padding: 16,
  },

  analyticsLabel: {
    fontSize: 10,

    fontWeight: "700",

    marginBottom: 10,
  },

  analyticsValue: {
    fontSize: 18,

    fontWeight: "700",
  },

  analyticsPink: {
    fontSize: 16,

    fontWeight: "700",
  },

  upgradeBanner: {
    marginTop: 28,

    borderRadius: 24,

    padding: 20,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  upgradeTitle: {
    fontSize: 17,

    fontWeight: "700",
  },

  upgradeSub: {
    marginTop: 4,

    fontSize: 13,

    fontWeight: "600",
  },

  upgradeBtn: {
    paddingHorizontal: 18,

    paddingVertical: 11,

    borderRadius: 999,
  },

  upgradeBtnText: {
    color: "#FFFFFF",

    fontWeight: "700",

    fontSize: 14,
  },
});
