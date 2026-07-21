import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function CameraOnboardingScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to take a photo for virtual try-on.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Try Again", onPress: requestCameraPermission },
        ],
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setTimeout(() => {
        router.replace("/upload");
      }, 500);
    }
  };

  const skipForNow = () => {
    router.replace("/upload");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>Step 1 of 4</Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressActive} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={takePhoto}
        activeOpacity={0.8}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.selectedImage} />
        ) : (
          <View style={styles.cameraIconContainer}>
            <Icon name="camera" size={90} color="#ff8ca5" />
          </View>
        )}

        {/* Bubble with outlined star */}
        <View style={[styles.bubble, styles.bubbleTopRight]}>
          <Icon name="star-o" size={18} color="#FFD700" />
        </View>

        {/* Bubble with outlined bolt/lightning */}
        <View style={[styles.bubble, styles.bubbleBottomLeft]}>
          <Icon name="bus" size={18} color="#FF6B8A" />
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>Let's Personalize Your</Text>
      <Text style={styles.highlight}>Style Hub</Text>

      <Text style={styles.desc}>
        To see jewelry on yourself, we'll need a quick photo. Our AI uses this
        to match the perfect earrings and necklaces to your features.
      </Text>

      <View style={styles.privacyBox}>
        <View style={styles.privacyHeader}>
          <Icon name="lock" size={14} color="#6B5BFF" />
          <Text style={styles.privacyTitle}> Your Privacy Matters</Text>
        </View>
        <Text style={styles.privacyText}>
          Photos are processed locally for AI try-on and never shared without
          your permission
        </Text>
      </View>

      <TouchableOpacity style={styles.enableButton} onPress={takePhoto}>
        <Icon
          name="camera"
          size={15}
          color="#FFFFFF"
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonText}>Enable Camera →</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.laterButton} onPress={skipForNow}>
        <Text style={styles.laterButtonText}>I'll do this later</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  header: {
    alignItems: "center",
    marginBottom: 10,
  },

  step: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B8A",
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 14,
    gap: 6,
  },

  progressActive: {
    width: 24,
    height: 4,
    backgroundColor: "#FF6B8A",
    borderRadius: 2,
  },

  progressDot: {
    width: 6,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
  },

  card: {
    height: 360,
    borderRadius: 24,
    backgroundColor: "#ececec",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    overflow: "hidden",
    position: "relative",
  },

  cameraIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  selectedImage: {
    width: "100%",
    height: "100%",
  },

  tapText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },

  // Bubble styles
  bubble: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  bubbleTopRight: {
    top: 16,
    right: 16,
  },

  bubbleBottomLeft: {
    bottom: 16,
    left: 16,
  },

  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
  },

  highlight: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    color: "#FF6B8A",
    marginBottom: 15,
  },

  desc: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  privacyBox: {
    borderWidth: 1,
    borderColor: "#CFC6FF",
    backgroundColor: "#F7F5FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },

  privacyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  privacyTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },

  privacyText: {
    fontSize: 11,
    color: "#666",
    lineHeight: 16,
  },

  enableButton: {
    backgroundColor: "#FF6B8A",
    borderRadius: 28,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
  },

  buttonIcon: {
    marginRight: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  laterButton: {
    backgroundColor: "transparent",
    borderRadius: 28,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },

  laterButtonText: {
    color: "#999",
    fontWeight: "500",
    fontSize: 15,
  },
});
