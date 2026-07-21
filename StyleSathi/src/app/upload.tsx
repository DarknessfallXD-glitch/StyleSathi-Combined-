import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UploadPhotoScreen() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const uri = event.target?.result as string;
            setProfileImage(uri);
            // Save to AsyncStorage
            await AsyncStorage.setItem('profilePhoto', uri);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      // Save to AsyncStorage
      await AsyncStorage.setItem('profilePhoto', uri);
    }
  };

  // Also load saved photo when screen mounts
  React.useEffect(() => {
    const loadPhoto = async () => {
      const saved = await AsyncStorage.getItem('profilePhoto');
      if (saved) {
        setProfileImage(saved);
      }
    };
    loadPhoto();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity onPress={() => router.replace('./personalize1')}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>STEP 2 OF 4</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressDot} />
          <View style={styles.progressActive} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.title}>Upload Your Photo</Text>
        <Text style={styles.subtitle}>
          Help our AI see how jewelry looks on{'\n'}
          you with a clear selfie.
        </Text>

        {/* Profile Picture Circle */}
        <TouchableOpacity style={styles.profileWrapper} onPress={pickImage} activeOpacity={0.8}>
          <View style={styles.profileCircle}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.iconContainer}>
                <Icon name="user-o" size={75} color="#CCCCCC" />
              </View>
            )}
            <View style={styles.plusButton}>
              <Icon name="plus" size={17} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.guidelinesTitle}>GUIDELINES FOR BEST RESULTS</Text>

        <View style={styles.guidelinesContainer}>
          <View style={styles.guidelineItem}>
            <View style={styles.iconCircle}>
              <Icon name="sun-o" size={20} color="#FF6B8A" />
            </View>
            <View style={styles.guidelineTextContainer}>
              <Text style={styles.guidelineSubtitle}>Bright & Natural Light</Text>
              <Text style={styles.guidelineDesc}>
                Stand facing a window or a well-lit area to avoid shadows on your face.
              </Text>
            </View>
          </View>

          <View style={styles.guidelineItem}>
            <View style={styles.iconCircle}>
              <Icon name="smile-o" size={20} color="#FF6B8A" />
            </View>
            <View style={styles.guidelineTextContainer}>
              <Text style={styles.guidelineSubtitle}>Neutral Expression</Text>
              <Text style={styles.guidelineDesc}>
                Keep your hair tucked behind ears and maintain a gentle, natural look.
              </Text>
            </View>
          </View>

          <View style={styles.guidelineItem}>
            <View style={styles.iconCircle}>
              <Icon name="camera" size={18} color="#FF6B8A" />
            </View>
            <View style={styles.guidelineTextContainer}>
              <Text style={styles.guidelineSubtitle}>Eye-Level Shot</Text>
              <Text style={styles.guidelineDesc}>
                Hold your phone straight. Ensure your forehead and neck are visible.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => router.replace('./style')}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Your photo is only used for virtual try-on and is never shared with third parties.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: 'center',
  },

  stepText: {
    fontSize: 12,
    color: '#FF6B8A',
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2F343A',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },

    progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 14,
    gap: 6,
  },

  progressDot: {
    width: 6,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
  },

  progressActive: {
    width: 24,
    height: 4,
    backgroundColor: "#FF6B8A",
    borderRadius: 2,
  },


  profileWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },

  profileCircle: {
    width: 140,
    height: 140,
    borderRadius: 80,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#FF6B8A',
    borderStyle: 'dashed',
    overflow: 'visible', // Changed from 'hidden'
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconHint: {
    fontSize: 10,
    color: '#D4A574',
    marginTop: 4,
    fontWeight: '500',
  },

  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 60,
  },

    back: {
    fontSize: 30,
    color: '#333',
    marginLeft: -160,
    marginTop: -17,
    marginBottom:20
  },

  plusButton: {
    position: 'absolute',
    bottom: 13,
    right: -7,
    width: 40,
    height: 40 ,
    borderRadius: 25,
    backgroundColor: '#FF6B8A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#F4F4F4',
    zIndex: 10,
  },

  guidelinesTitle: {
    fontSize: 11,
    color: '#999',
    letterSpacing: 1,
    marginBottom: 16,
    fontWeight: '500',
    alignSelf: 'flex-start',
    width: '100%',
  },

  guidelinesContainer: {
    marginBottom: 40,
    gap: 24,
    width: '100%',
  },

  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  guidelineTextContainer: {
    flex: 1,
  },

  guidelineSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F343A',
    marginBottom: 4,
  },

  guidelineDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },

  continueButton: {
    backgroundColor: '#FF6B8A',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },

  continueButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  privacyNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#aaa',
    lineHeight: 16,
  },
});