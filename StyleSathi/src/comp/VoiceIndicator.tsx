import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../Context/ThemeContext';

interface VoiceIndicatorProps {
  isListening: boolean;
  size?: number;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ 
  isListening, 
  size = 40 
}) => {
  const { colors } = useTheme();
  const wave1Ref = useRef<Animated.Value>(new Animated.Value(0));
  const wave2Ref = useRef<Animated.Value>(new Animated.Value(0));
  const wave3Ref = useRef<Animated.Value>(new Animated.Value(0));
  const pulseRef = useRef<Animated.Value>(new Animated.Value(0));

  const startAnimation = () => {
    const animateWave = (wave: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(wave, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(wave, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const animatePulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseRef.current, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseRef.current, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateWave(wave1Ref.current, 0);
    animateWave(wave2Ref.current, 150);
    animateWave(wave3Ref.current, 300);
    animatePulse();
  };

  const stopAnimation = () => {
    wave1Ref.current.stopAnimation();
    wave2Ref.current.stopAnimation();
    wave3Ref.current.stopAnimation();
    pulseRef.current.stopAnimation();
    wave1Ref.current.setValue(0);
    wave2Ref.current.setValue(0);
    wave3Ref.current.setValue(0);
    pulseRef.current.setValue(0);
  };

  useEffect(() => {
    if (isListening) {
      startAnimation();
    } else {
      stopAnimation();
    }
    return () => stopAnimation();
  }, [isListening]);

  if (!isListening) return null;

  const waveStyle = (wave: Animated.Value) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: wave.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 0],
    }),
    transform: [
      {
        scale: wave.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1.5],
        }),
      },
    ],
  });

  const pulseStyle = {
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.primary,
    opacity: pulseRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0],
    }),
    transform: [
      {
        scale: pulseRef.current.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.8],
        }),
      },
    ],
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={pulseStyle} />
      <Animated.View style={waveStyle(wave3Ref.current)} />
      <Animated.View style={waveStyle(wave2Ref.current)} />
      <Animated.View style={waveStyle(wave1Ref.current)} />
      <View style={[styles.centerDot, { width: size * 0.4, height: size * 0.4, backgroundColor: colors.primary }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    position: 'absolute' as const,
    borderRadius: 999,
  },
});

export default VoiceIndicator;