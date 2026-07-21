import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTheme } from "../Context/ThemeContext";

export default function BottomTab({ active }) {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const tabs = [
    { name: "home", label: "home", icon: "home", route: "./home" },
    {
      name: "search",
      label: "search-result",
      icon: "search",
      route: "./search-result",
    },
    { name: "Try-On", label: "try-on", icon: "camera", route: "./try-on" },
    { name: "saved", label: "saved", icon: "heart-o", route: "./saved" },
    { name: "profile", label: "profile", icon: "user", route: "./profile" },
  ];

  return (
    <View
      style={[
        styles.bottomTab,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.label;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => router.replace(tab.route)}
            activeOpacity={0.7}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={isActive ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: isActive ? colors.primary : colors.textSecondary },
                isActive && styles.tabActive,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomTab: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },

  tabText: {
    fontSize: 10,
  },

  tabActive: {
    fontWeight: "600",
  },
});
