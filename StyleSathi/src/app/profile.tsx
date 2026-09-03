import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
} from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";
import BottomTab from "../comp/BottomTab";
import { useTheme } from "../Context/ThemeContext";
import { ThemedText } from "../comp/ThemedText";
import { supabase } from "../lib/supabase";
import { getUserProfile } from "../services/api/user";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load user data from AsyncStorage (cached) and sync with backend
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // First try to get cached user data
      const cachedUser = await AsyncStorage.getItem("user");
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser);
        setUser(parsed);
        setLoading(false);
      }

      // Then fetch fresh from backend to update (if token exists)
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const freshUser = await getUserProfile();
        // Merge/update the user state
        setUser((prev: any) => ({
          ...prev,
          ...freshUser,
          name: freshUser.full_name || prev?.name,
          email: freshUser.email || prev?.email,
          created_at: freshUser.created_at || prev?.created_at,
        }));
        // Update cache
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({
            id: freshUser.id,
            name: freshUser.full_name || freshUser.email?.split("@")[0],
            email: freshUser.email,
            provider: "email",
            isAuthenticated: true,
            created_at: freshUser.created_at,
          })
        );
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const performLogout = async () => {
      try {
        // Sign out from Supabase
        await supabase.auth.signOut();
        // Clear all local storage
        await AsyncStorage.multiRemove(["user", "authToken", "userId"]);
        console.log("Logged out successfully");
        if (Platform.OS === 'web') {
          window.alert("You have been successfully logged out.");
          router.replace("/welcome");
        } else {
          Alert.alert("Logged Out", "You have been successfully logged out.", [
            { text: "OK", onPress: () => router.replace("/welcome") },
          ]);
        }
      } catch (error) {
        console.error("Logout error:", error);
        Alert.alert("Error", "Failed to log out. Please try again.");
      }
    };

    if (Platform.OS === 'web') {
      const confirm = window.confirm("Are you sure you want to log out?");
      if (confirm) performLogout();
    } else {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", onPress: performLogout, style: "destructive" },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ✅ Show "Guest" when no user data exists
  const displayName = user?.name || user?.full_name || "Guest";
  const displayEmail = user?.email || "Guest";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Not a member";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="bolt" size={20} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("./settings")}>
            <Icon name="cog" size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
  {user?.avatar_url ? (
    <Image
      source={{ uri: user.avatar_url }}
      style={styles.avatar}
    />
  ) : (
    <View style={[styles.guestAvatar, { backgroundColor: colors.surface }]}>
      <Icon name="user" size={50} color={colors.textSecondary} />
    </View>
  )}
  <View style={[styles.onlineDot, { borderColor: colors.background }]} />
</View>

          <ThemedText style={styles.userName}>{displayName}</ThemedText>
          <ThemedText type="secondary" style={styles.memberSince}>
            Member since {memberSince}
          </ThemedText>
          <ThemedText style={[styles.tierLink, { color: colors.primary }]}>
            Style Icon Tier
          </ThemedText>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Icon name="camera" size={18} color={colors.primary} />
            <ThemedText style={styles.statNumber}>124</ThemedText>
            <ThemedText type="secondary" style={styles.statLabel}>Total Try-Ons</ThemedText>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          <View style={styles.statItem}>
            <Icon name="heart" size={18} color={colors.primary} />
            <ThemedText style={styles.statNumber}>48</ThemedText>
            <ThemedText type="secondary" style={styles.statLabel}>Saved Items</ThemedText>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <ThemedText
            style={[
              styles.tabActiveText,
              { color: colors.primary, borderBottomColor: colors.primary },
            ]}
          >
            My Wardrobe
          </ThemedText>
          <TouchableOpacity onPress={() => router.push("/subscription")}>
            <ThemedText
              style={[
                styles.tabTextInactive,
                { color: colors.textSecondary },
              ]}
            >
              Subscription
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Recent Tries */}
        <View>
          <View style={styles.recentHeader}>
            <ThemedText style={styles.recentTitle}>Recent Tries</ThemedText>
            <ThemedText style={[styles.viewAllText, { color: colors.primary }]}>View All</ThemedText>
          </View>

          <View style={styles.recentContainer}>
            <TouchableOpacity style={styles.imageCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
                }}
                style={styles.cardImage}
              />
              <Text style={styles.imageLabel}>Earrings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1611652022419-a9419f74343d",
                }}
                style={styles.cardImage}
              />
              <Text style={styles.imageLabel}>Necklace</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.primary }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: colors.primary }]}>Log Out Account</Text>
        </TouchableOpacity>

        <ThemedText type="secondary" style={styles.versionText}>
          STYLESATHY VERSION 2.4.1
        </ThemedText>
      </ScrollView>

      <BottomTab active="profile" />
    </View>
  );
}

// ---------- styles (unchanged) ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 80 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  profileSection: { alignItems: "center", marginBottom: 20 },
  avatarWrapper: { position: "relative" },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
  },
  userName: { fontSize: 20, fontWeight: "700", marginTop: 10 },
  memberSince: { fontSize: 12, marginTop: 4 },
  tierLink: { marginTop: 6, fontSize: 13 },
  statsContainer: { flexDirection: "row", borderRadius: 16, padding: 20, marginBottom: 20 },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "700", marginTop: 6 },
  statLabel: { fontSize: 11, marginTop: 4 },
  statDivider: { width: 1, height: 50 },
  tabs: { flexDirection: "row", justifyContent: "space-evenly", marginBottom: 20 },
  tabActiveText: { fontSize: 15, fontWeight: "600", borderBottomWidth: 2, paddingBottom: 4 },
  tabTextInactive: { fontSize: 15, fontWeight: "500" },
  recentHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  recentTitle: { fontWeight: "600", fontSize: 16 },
  viewAllText: { fontSize: 12 },
  recentContainer: { flexDirection: "row", gap: 10 },
  imageCard: { flex: 1, borderRadius: 16, overflow: "hidden" },
  cardImage: { width: "100%", height: 140 },
  imageLabel: { position: "absolute", bottom: 8, left: 8, backgroundColor: "#00000088", color: "#fff", paddingHorizontal: 8, borderRadius: 6, fontSize: 11 },
  logoutButton: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: "center", marginTop: 20 },
  logoutText: { fontWeight: "600", fontSize: 15 },
  versionText: { textAlign: "center", fontSize: 10, marginTop: 20 },
  guestAvatar: {
  width: 90,
  height: 90,
  borderRadius: 45,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 2,
  borderColor: '#FF6B8A',
},
});