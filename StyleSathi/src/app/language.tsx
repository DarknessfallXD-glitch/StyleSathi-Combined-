import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePreferences } from '../services/api/preferences';

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('nepali');
  const [isLoading, setIsLoading] = useState(false);

  // Get profile photo from AsyncStorage
  const getProfilePhoto = async () => {
    try {
      const photo = await AsyncStorage.getItem('profilePhoto');
      return photo;
    } catch (error) {
      console.error('Error getting profile photo:', error);
      return null;
    }
  };

  // Get selected styles from AsyncStorage
  const getSelectedStyles = async () => {
    try {
      const styles = await AsyncStorage.getItem('selectedStyles');
      return styles ? JSON.parse(styles) : [];
    } catch (error) {
      console.error('Error getting selected styles:', error);
      return [];
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    
    try {
      const profilePhoto = await getProfilePhoto();
      const selectedStyles = await getSelectedStyles();
      
      // Build preferences JSON
      const userPreferences = {
        profilePhoto: profilePhoto || null,
        selectedStyles: selectedStyles,
        language: selectedLanguage,
        onboardingCompleted: true,
        completedAt: new Date().toISOString(),
        deviceInfo: {
          platform: 'react-native',
          appVersion: '1.0.0',
        },
      };
      
      // Send to backend
      await updatePreferences(userPreferences);
      
      // Also save language locally for quick access
      await AsyncStorage.setItem('selectedLanguage', selectedLanguage);
      
      Alert.alert('Success', 'Your preferences have been saved!');
      router.replace('./home');
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    { id: 'nepali', name: 'नेपाली', subtitle: 'Nepali' },
    { id: 'english', name: 'English', subtitle: 'English' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity onPress={() => router.replace('./style')}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        
        {/* Step Indicator */}
        <Text style={styles.stepText}>STEP 4 OF 4</Text>

        {/* Progress Bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressActive} />
        </View>

        {/* Language Icons Row */}
        <View style={styles.languageIconsRow}>
          <View style={styles.languageIconItem}>
            <Icon name="globe" size={35} color="#FF6B8A" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Choose Your Language</Text>
        <Text style={styles.subtitle}>
          Select your preferred language to customize your StyleSathy experience.
        </Text>

        {/* Language Options */}
        <View style={styles.languagesContainer}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.languageCard,
                selectedLanguage === lang.id && styles.languageCardSelected,
              ]}
              onPress={() => setSelectedLanguage(lang.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.languageName,
                selectedLanguage === lang.id && styles.languageNameSelected,
              ]}>
                {lang.name}
              </Text>
              <Text style={[
                styles.languageSubtitle,
                selectedLanguage === lang.id && styles.languageSubtitleSelected,
              ]}>
                {lang.subtitle}
              </Text>
              {selectedLanguage === lang.id && (
                <View style={styles.checkIcon}>
                  <Icon name="check" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <Text style={styles.note}>
          You can change this anytime in settings.
        </Text>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, isLoading && styles.buttonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Saving...' : 'Continue'}
          </Text>
        </TouchableOpacity>
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
  },

  stepText: {
    fontSize: 12,
    color: '#FF6B8A',
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
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

  languageIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },

  languageIconItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
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

  languagesContainer: {
    gap: 12,
    marginBottom: 30,
  },

  languageCard: {
    height: 145,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },

  languageCardSelected: {
    backgroundColor: '#FF6B8A',
    borderColor: '#FF6B8A',
  },

  languageName: {
    fontSize: 37,
    fontWeight: '600',
    color: '#2F343A',
    marginBottom: 4,
  },

  languageNameSelected: {
    color: '#FFFFFF',
  },

  languageSubtitle: {
    fontSize: 27,
    color: '#888',
  },

  languageSubtitleSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  checkIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },

  continueButton: {
    backgroundColor: '#FF6B8A',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonDisabled: {
    backgroundColor: '#FFB3C1',
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  back: {
    fontSize: 28,
    color: '#333',
    marginLeft: 10,
    marginTop: -5,
    marginBottom: 20,
  },
});