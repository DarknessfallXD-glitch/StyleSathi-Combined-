import React, { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StylePreferenceScreen() {
  const router = useRouter();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // Save to AsyncStorage whenever selectedStyles changes
  useEffect(() => {
    const saveStyles = async () => {
      try {
        await AsyncStorage.setItem('selectedStyles', JSON.stringify(selectedStyles));
        console.log('Saved styles:', selectedStyles);
      } catch (error) {
        console.error('Error saving styles:', error);
      }
    };
    
    saveStyles();
  }, [selectedStyles]);

  const stylesList = [
    {
      id: 'traditional',
      name: 'Traditional',
      desc: 'Ethnic & Festive',
      image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400',
    },
    {
      id: 'modern',
      name: 'Modern',
      desc: 'Chic & Trendy',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    },
    {
      id: 'minimal',
      name: 'Minimal',
      desc: 'Subtle & Daily',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    },
    {
      id: 'bold',
      name: 'Bold',
      desc: 'Statement Pieces',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    },
  ];

  const toggleStyle = (id: string) => {
    if (selectedStyles.includes(id)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== id));
    } else {
      setSelectedStyles([...selectedStyles, id]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.replace('./upload')}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.stepText}>STEP 3 OF 4</Text>
        
        <View style={styles.progressRow}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressActive} />
          <View style={styles.progressDot} />
        </View>
        
        {/* Header */}
        <Text style={styles.header}>Style Preference</Text>

        {/* Title */}
        <Text style={styles.title}>Pick your vibe</Text>
        <Text style={styles.subtitle}>
          Select one or more styles you love. We'll show you pieces that match your taste.
        </Text>

        {/* Grid */}
        <View style={styles.grid}>
          {stylesList.map((item) => {
            const scale = useRef(new Animated.Value(1)).current;
            const selected = selectedStyles.includes(item.id);

            const handlePressIn = () => {
              Animated.spring(scale, {
                toValue: 1.05,
                useNativeDriver: true,
              }).start();
            };

            const handlePressOut = () => {
              Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
              }).start();
            };
            
            return (
              <Animated.View
                key={item.id}
                style={{
                  width: '48%',
                  transform: [{ scale }],
                }}
              >
                <TouchableOpacity
                  style={[styles.card, selected && styles.cardSelected]}
                  onPress={() => toggleStyle(item.id)}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.9}
                >
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: item.image }} style={styles.image} />
                    {selected && (
                      <View style={styles.check}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.name, selected && styles.nameSelected]}>
                    {item.name}
                  </Text>
                  <Text style={styles.desc}>{item.desc}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            ✨ You can always change your style preferences later in your profile settings.
          </Text>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('./language')}
        >
          <Text style={styles.buttonText}>Continue →</Text>
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

  scroll: {
    paddingHorizontal: 20,
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

  header: {
    fontSize: 12,
    color: '#FF6B8A',
    fontWeight: '600',
    marginBottom: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2F343A',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },

  image: {
    width: '100%',
    height: 150,
    borderRadius: 14,
  },

  cardSelected: {
    borderColor: '#FF6B8A',
  },

  imageWrapper: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },

  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FF6B8A',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  back: {
    fontSize: 28,
    color: '#333',
    marginLeft: 10,
    marginTop: -5,
    marginBottom: 20,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F343A',
    textAlign: 'center',
  },

  nameSelected: {
    color: '#FF6B8A',
  },

  desc: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
  },

  noteBox: {
    backgroundColor: '#FDE8EE',
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 20,
  },

  noteText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#FF6B8A',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});