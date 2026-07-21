import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { supabase } from "../lib/supabase";
import { getUserProfile } from "../services/api/user";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const router = useRouter();
  const [secure, setSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  // ----- Google OAuth with id_token -----
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "478569591036-6ss1sbl1mqhuggtdm5ekun5o188ojdsl.apps.googleusercontent.com",
    iosClientId: "478569591036-4stvl2r1r8snildbnmgvlhajn2b3l12a.apps.googleusercontent.com",
    webClientId: "478569591036-pva3u54atkvh8cr8sm7lds2bsj5dokvl.apps.googleusercontent.com",
    // 1. Ask for standard user profile scopes
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token', 
    // 2. Let Expo handle the dynamic redirect based on platform
    redirectUri: makeRedirectUri({
      scheme: "com.darknessfallxd.stylesathi" 
    }),
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  // ----- Validation & Error Helpers -----
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) newErrors.name = "Full name is required";
    else if (name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Please enter a valid email address";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    else if (password.length > 50) newErrors.password = "Password must be less than 50 characters";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSupabaseError = (error: any): string => {
    console.error("Supabase error:", error);
    if (!error) return "Unable to connect. Please check your internet.";
    if (error.message === "Failed to fetch") return "Network error. Please check your connection.";
    if (error.message?.includes("network")) return "Network error. Please try again.";
    if (error.message?.includes("timeout")) return "Connection timeout. Please try again.";
    if (error.message?.includes("Invalid API key")) return "Authentication service is not configured yet.";
    if (error.message?.includes("Invalid JWT")) return "Service configuration issue. Please contact support.";
    if (error.message?.includes("URL is required")) return "Backend connection not configured.";
    if (error.message?.includes("already registered")) return "An account with this email already exists.";
    if (error.message?.includes("Password should be at least 6 characters")) return "Password must be at least 6 characters.";
    if (error.message?.includes("Email not confirmed")) return "Please verify your email before signing in.";
    if (error.message?.includes("rate limit")) return "Too many attempts. Please try again later.";
    return "Something went wrong. Please try again.";
  };

  // ----- SYNC HELPER -----
  const syncUserWithBackend = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await AsyncStorage.setItem("authToken", session.access_token);
        const userProfile = await getUserProfile();
        console.log("User synced with backend:", userProfile);
        return userProfile;
      }
      return null;
    } catch (err) {
      console.error("Backend sync failed:", err);
      return null;
    }
  };

  // ----- EMAIL SIGN-UP -----
  const handleSignUp = async () => {
    setErrors({});
    setConnectionError(null);
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: { data: { full_name: name.trim() } },
      });

      if (error) {
        if (error.message?.includes("already registered")) {
          Alert.alert("Account Exists", "An account with this email already exists. Please sign in.");
          router.replace("/signin");
          return;
        }
        throw error;
      }

      if (data.session) {
        // New user – check creation time
        const createdAt = new Date(data.user!.created_at).getTime();
        const now = Date.now();
        const isNewUser = (now - createdAt) < 10000;

        if (!isNewUser) {
          Alert.alert("Account Exists", "An account with this email already exists. Please sign in.");
          router.replace("/signin");
          return;
        }

        const userData = {
          id: data.user?.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          provider: "email",
          registeredAt: new Date().toISOString(),
          isAuthenticated: true,
        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        await syncUserWithBackend();

        Alert.alert("Success", "Account created!");
        router.replace("/personalize1");
      } else {
        Alert.alert(
          "Success",
          "Account created! Please check your email to confirm your account before signing in."
        );
        router.replace("/signin");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      const errorMessage = handleSupabaseError(error);
      setConnectionError(errorMessage);
      Alert.alert("Sign Up Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ----- GOOGLE SIGN-UP -----
  const handleGoogleSignUp = () => {
    setGoogleLoading(true);
    promptAsync();
  };

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication, params } = response;
      const idToken = authentication?.idToken || params?.id_token;
      console.log("🔹 idToken:", idToken);

      if (!idToken) {
        Alert.alert("Error", "No ID token received from Google");
        setGoogleLoading(false);
        return;
      }

      supabase.auth
        .signInWithIdToken({
          provider: "google",
          token: idToken,
        })
        .then(async ({ data, error }) => {
          if (error) {
            if (error.message?.includes("User already registered")) {
              const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
              console.log("Session data:", sessionData);
              if (sessionError) throw sessionError;
              if (sessionData.session) {
                data = sessionData;
              } else {
                throw new Error("User exists but no session");
              }
            } else {
              throw error;
            }
          }

          if (!data?.user) throw new Error("No user data returned");

          const userData = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
            provider: "google",
            registeredAt: new Date().toISOString(),
            isAuthenticated: true,
          };
          await AsyncStorage.setItem("user", JSON.stringify(userData));

          const token = data.session?.access_token;
          if (token) {
            await AsyncStorage.setItem("authToken", token);
            await getUserProfile();
          }

          Alert.alert("Success", `Welcome ${userData.name}!`);
          router.replace("/personalize1");
          setGoogleLoading(false);
        })
        .catch((err) => {
          console.error("Google sign-in error:", err);
          setConnectionError(err.message);
          Alert.alert("Sign Up Failed", err.message);
          setGoogleLoading(false);
        });
    } else if (response?.type === "error") {
      console.error("Google OAuth error:", response.error);
      setGoogleLoading(false);
    } else if (response?.type === "cancel") {
      console.log("Google sign-in cancelled");
      setGoogleLoading(false);
    } 
  }, [response]);

  const handleAppleSignUp = () => {
    Alert.alert("Coming Soon", "Apple Sign-Up will be available soon!");
  };

  // ----- RENDER (unchanged) -----
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/signin")}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Logo */}
      <View style={styles.logoCircle}>
        <Icon name="bolt" size={26} color="#FFCC00" />
      </View>

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join StyleSathy and start your virtual styling journey.</Text>

      {connectionError && (
        <View style={styles.connectionErrorContainer}>
          <Icon name="exclamation-triangle" size={16} color="#FF4444" />
          <Text style={styles.connectionErrorText}>{connectionError}</Text>
        </View>
      )}

      {/* Full Name */}
      <Text style={styles.label}>Full Name</Text>
      <View style={[styles.inputBox, errors.name && styles.inputError]}>
        <Icon name="user" size={16} color="#999" style={styles.inputIcon} />
        <TextInput
          placeholder="Your name"
          placeholderTextColor="#999"
          style={styles.input}
          selectionColor="#FF6B8A"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors({ ...errors, name: undefined });
            if (connectionError) setConnectionError(null);
          }}
        />
      </View>
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <View style={[styles.inputBox, errors.email && styles.inputError]}>
        <Icon name="envelope" size={16} color="#999" style={styles.inputIcon} />
        <TextInput
          placeholder="name@example.com"
          placeholderTextColor="#999"
          style={styles.input}
          selectionColor="#FF6B8A"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({ ...errors, email: undefined });
            if (connectionError) setConnectionError(null);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={[styles.inputBox, errors.password && styles.inputError]}>
        <Icon name="lock" size={16} color="#999" style={styles.inputIcon} />
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#999"
          secureTextEntry={secure}
          style={styles.input}
          selectionColor="#FF6B8A"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors({ ...errors, password: undefined });
            if (connectionError) setConnectionError(null);
          }}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Icon name={secure ? "eye" : "eye-slash"} size={18} color="#777" />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* Confirm Password */}
      <Text style={styles.label}>Confirm Password</Text>
      <View style={[styles.inputBox, errors.confirmPassword && styles.inputError]}>
        <Icon name="lock" size={16} color="#999" style={styles.inputIcon} />
        <TextInput
          placeholder="Confirm your password"
          placeholderTextColor="#999"
          secureTextEntry={confirmSecure}
          style={styles.input}
          selectionColor="#FF6B8A"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
            if (connectionError) setConnectionError(null);
          }}
        />
        <TouchableOpacity onPress={() => setConfirmSecure(!confirmSecure)}>
          <Icon name={confirmSecure ? "eye" : "eye-slash"} size={18} color="#777" />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.button, (isLoading || googleLoading) && styles.buttonDisabled]}
        onPress={handleSignUp}
        activeOpacity={0.8}
        disabled={isLoading || googleLoading}
      >
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Create Account</Text>}
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.or}>OR SIGN UP WITH</Text>
        <View style={styles.line} />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialRow}>
        <TouchableOpacity
          style={styles.socialBtn}
          activeOpacity={0.7}
          onPress={handleGoogleSignUp}
          disabled={isLoading || googleLoading}
        >
          {googleLoading ? <ActivityIndicator size="small" color="#DB4437" /> : (
            <>
              <Icon name="google" size={18} color="#DB4437" />
              <Text style={styles.socialLabel}>Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Apple button (commented out) */}
        {/* 
        <TouchableOpacity
          style={styles.socialBtn}
          activeOpacity={0.7}
          onPress={handleAppleSignUp}
          disabled={isLoading}
        >
          <Icon name="apple" size={18} color="#000000" />
          <Text style={styles.socialLabel}>Apple</Text>
        </TouchableOpacity> 
        */}
      </View>

      <Text style={styles.footer}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => router.replace("/signin")}>Sign In</Text>
      </Text>
    </Animated.View>
  );
}

// ----- STYLES (unchanged) -----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2F343A",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#2F343A",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 13,
    color: "#777",
    marginTop: 6,
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#FF4444",
    backgroundColor: "#FFF0F0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 11,
    color: "#FF4444",
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  connectionErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FF4444",
  },
  connectionErrorText: {
    fontSize: 12,
    color: "#FF4444",
    flex: 1,
  },
  button: {
    backgroundColor: "#FF6B8A",
    borderRadius: 28,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#FFB3C1",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  or: {
    fontSize: 10,
    color: "#888",
    marginHorizontal: 10,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDEDED",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  socialLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
  },
  link: {
    color: "#FF6B8A",
    fontWeight: "600",
  },
});