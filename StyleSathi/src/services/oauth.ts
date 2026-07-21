// services/oauth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { getUserProfile } from "./api/user";

export const handleOAuthCallback = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session?.user) {
      console.error("OAuth callback error:", error);
      router.replace("/signin");
      return false;
    }

    // Store token
    await AsyncStorage.setItem("authToken", session.access_token);

    // Save user locally
    const userData = {
      id: session.user.id,
      email: session.user.email,
      name:
        session.user.user_metadata?.full_name ||
        session.user.email?.split("@")[0],
      provider: "google",
      registeredAt: new Date().toISOString(),
      isAuthenticated: true,
    };
    await AsyncStorage.setItem("user", JSON.stringify(userData));

    // Sync with backend
    await getUserProfile();

    // Redirect to personalize
    router.replace("/personalize1");
    return true;
  } catch (err) {
    console.error("OAuth callback error:", err);
    router.replace("/signin");
    return false;
  }
};
