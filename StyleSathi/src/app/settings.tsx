import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../Context/ThemeContext';
import { ThemedText } from '../comp/ThemedText';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useTheme();

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [language, setLanguage] = useState('English');
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  // Load saved settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotificationsEnabled(parsed.notificationsEnabled ?? true);
        setSaveHistory(parsed.saveHistory ?? true);
        setSelectedLanguage(parsed.selectedLanguage ?? 'english');
        setLanguage(parsed.language ?? 'English');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      const existing = await AsyncStorage.getItem('userSettings');
      const settings = existing ? JSON.parse(existing) : {};
      settings[key] = value;
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSetting('notificationsEnabled', value);
    Alert.alert('Success', `Notifications ${value ? 'enabled' : 'disabled'}`);
  };

  const handleToggleDarkMode = (value: boolean) => {
    toggleTheme();
    saveSetting('darkModeEnabled', value);
  };

  const handleToggleSaveHistory = (value: boolean) => {
    setSaveHistory(value);
    saveSetting('saveHistory', value);
  };

  const handleLanguageSelect = (lang: string, langCode: string) => {
    setLanguage(lang);
    setSelectedLanguage(langCode);
    saveSetting('language', lang);
    saveSetting('selectedLanguage', langCode);
    Alert.alert('Language Changed', `Language set to ${lang}`);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    type = 'link',
    value,
    onPress,
    onValueChange,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    type?: 'link' | 'toggle' | 'select';
    value?: boolean;
    onPress?: () => void;
    onValueChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
      disabled={type === 'toggle'}
      activeOpacity={type === 'toggle' ? 1 : 0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.surface }]}>
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingTextContainer}>
          <ThemedText style={styles.settingTitle}>{title}</ThemedText>
          {subtitle && (
            <ThemedText type="secondary" style={styles.settingSubtitle}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      )}
      {type === 'link' && (
        <Icon name="chevron-right" size={16} color={colors.textSecondary} />
      )}
      {type === 'select' && (
        <ThemedText style={[styles.selectedValue, { color: colors.primary }]}>
          {value}
        </ThemedText>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-left" size={22} color={colors.icon} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Settings</ThemedText>
          <View style={{ width: 22 }} />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>

          <SettingItem
            icon="bell-o"
            title="Push Notifications"
            subtitle="Receive updates about new arrivals and offers"
            type="toggle"
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
          />

          <SettingItem
            icon="moon-o"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            type="toggle"
            value={isDarkMode}
            onValueChange={handleToggleDarkMode}
          />

          <SettingItem
            icon="history"
            title="Save Search History"
            subtitle="Remember your recent searches"
            type="toggle"
            value={saveHistory}
            onValueChange={handleToggleSaveHistory}
          />
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Language</ThemedText>

          <TouchableOpacity
            style={[styles.languageOption, { backgroundColor: colors.surface }]}
            onPress={() => handleLanguageSelect('English', 'english')}
          >
            <View style={styles.languageLeft}>
              <Icon name="globe" size={20} color={colors.primary} />
              <ThemedText style={styles.languageText}>English</ThemedText>
            </View>
            {language === 'English' && (
              <Icon name="check" size={16} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.languageOption, { backgroundColor: colors.surface }]}
            onPress={() => handleLanguageSelect('नेपाली', 'nepali')}
          >
            <View style={styles.languageLeft}>
              <Icon name="flag" size={20} color={colors.primary} />
              <ThemedText style={styles.languageText}>नेपाली (Nepali)</ThemedText>
            </View>
            {language === 'नेपाली' && (
              <Icon name="check" size={16} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>

          <SettingItem
            icon="user-o"
            title="Edit Profile"
            onPress={() => router.push('/edit-profile')}
          />

          <SettingItem
            icon="lock"
            title="Privacy & Security"
            onPress={() => router.push('/privacy')}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Support</ThemedText>

          <SettingItem
            icon="question-circle-o"
            title="Help Center"
            onPress={() => router.push('/help')}
          />

          <SettingItem
            icon="star-o"
            title="Rate Us"
            onPress={() => Alert.alert('Rate Us', 'Thank you for rating StyleSathy!')}
          />

          <SettingItem
            icon="share-alt"
            title="Share App"
            onPress={() => Alert.alert('Share', 'Share StyleSathy with your friends!')}
          />

          <SettingItem
            icon="info-circle"
            title="About"
            onPress={() => router.push('/about')}
          />
        </View>

        {/* Version */}
        <ThemedText type="secondary" style={styles.versionText}>
          Version 2.4.1
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  selectedValue: {
    fontSize: 14,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  languageText: {
    fontSize: 15,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 20,
  },
});