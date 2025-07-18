import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export type MoodType = 'happy' | 'calm' | 'energetic' | 'focused' | 'creative' | 'social' | 'relaxed' | 'productive';

interface MoodRayGlowProps {
  mood?: MoodType;
  intensity?: number; // 0-1
  enabled?: boolean;
}

interface MoodConfig {
  colors: string[];
  positions: Array<{
    top: number;
    left: number;
    size: number;
    opacity: number;
  }>;
  animationSpeed: number;
  glowRadius: number;
}

const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  happy: {
    colors: ['#FFD700', '#FFA500', '#FF6B6B'],
    positions: [
      { top: height * 0.1, left: width * 0.2, size: 50, opacity: 0.3 },
      { top: height * 0.3, right: width * 0.1, size: 40, opacity: 0.2 },
      { top: height * 0.6, left: width * 0.7, size: 45, opacity: 0.25 },
    ],
    animationSpeed: 2000,
    glowRadius: 25,
  },
  calm: {
    colors: ['#87CEEB', '#98FB98', '#DDA0DD'],
    positions: [
      { top: height * 0.15, left: width * 0.1, size: 50, opacity: 0.2 },
      { top: height * 0.4, right: width * 0.15, size: 35, opacity: 0.1 },
      { top: height * 0.7, left: width * 0.6, size: 30, opacity: 0.15 },
    ],
    animationSpeed: 4000,
    glowRadius: 15,
  },
  energetic: {
    colors: ['#FF4500', '#FF6347', '#FF8C00'],
    positions: [
      { top: height * 0.05, left: width * 0.1, size: 70, opacity: 0.5 },
      { top: height * 0.25, right: width * 0.05, size: 60, opacity: 0.4 },
      { top: height * 0.5, left: width * 0.8, size: 65, opacity: 0.45 },
    ],
    animationSpeed: 1200,
    glowRadius: 40,
  },
  focused: {
    colors: ['#4169E1', '#1E90FF', '#00CED1'],
    positions: [
      { top: height * 0.2, left: width * 0.3, size: 60, opacity: 0.25 },
      { top: height * 0.5, right: width * 0.2, size: 40, opacity: 0.2 },
    ],
    animationSpeed: 2800,
    glowRadius: 25,
  },
  creative: {
    colors: ['#9932CC', '#DA70D6', '#FF69B4'],
    positions: [
      { top: height * 0.1, left: width * 0.15, size: 70, opacity: 0.35 },
      { top: height * 0.35, right: width * 0.1, size: 50, opacity: 0.25 },
      { top: height * 0.65, left: width * 0.7, size: 40, opacity: 0.25 },
      { top: height * 0.8, right: width * 0.25, size: 30, opacity: 0.2 },
    ],
    animationSpeed: 1800,
    glowRadius: 35,
  },
  social: {
    colors: ['#32CD32', '#00FF7F', '#98FB98'],
    positions: [
      { top: height * 0.12, left: width * 0.2, size: 60, opacity: 0.35 },
      { top: height * 0.4, right: width * 0.15, size: 45, opacity: 0.25 },
      { top: height * 0.7, left: width * 0.6, size: 35, opacity: 0.25 },
    ],
    animationSpeed: 2200,
    glowRadius: 30,
  },
  relaxed: {
    colors: ['#F0E68C', '#DDA0DD', '#98FB98'],
    positions: [
      { top: height * 0.2, left: width * 0.1, size: 40, opacity: 0.2 },
      { top: height * 0.5, right: width * 0.1, size: 30, opacity: 0.15 },
      { top: height * 0.8, left: width * 0.7, size: 25, opacity: 0.1 },
    ],
    animationSpeed: 5000,
    glowRadius: 10,
  },
  productive: {
    colors: ['#00CED1', '#20B2AA', '#48D1CC'],
    positions: [
      { top: height * 0.15, left: width * 0.25, size: 55, opacity: 0.3 },
      { top: height * 0.45, right: width * 0.2, size: 40, opacity: 0.2 },
      { top: height * 0.75, left: width * 0.65, size: 30, opacity: 0.15 },
    ],
    animationSpeed: 3000,
    glowRadius: 20,
  },
};

export const MoodRayGlow: React.FC<MoodRayGlowProps> = ({
  mood = 'happy',
  intensity = 0.7,
  enabled = true,
}) => {
  const [animations] = useState(() => 
    MOOD_CONFIGS[mood].positions.map(() => new Animated.Value(0))
  );

  const config = MOOD_CONFIGS[mood];

  useEffect(() => {
    if (!enabled) return;

    const startAnimations = () => {
      animations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: config.animationSpeed,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: config.animationSpeed,
              useNativeDriver: false,
            }),
          ])
        ).start();
      });
    };

    startAnimations();
  }, [mood, enabled, config.animationSpeed]);

  if (!enabled) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {config.positions.map((position, index) => (
        <Animated.View
          key={index}
          style={[
            styles.glowOrb,
            {
              top: position.top,
              left: position.left,
              width: position.size,
              height: position.size,
              borderRadius: position.size / 2,
              opacity: position.opacity * intensity,
              shadowRadius: config.glowRadius,
              transform: [
                {
                  scale: animations[index]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }) || 1,
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={config.colors}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowOrb: {
    position: 'absolute',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    elevation: 10,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
}); 