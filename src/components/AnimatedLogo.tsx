import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const COLOR_SETS = [
  ['#00C853', '#64DD17'],
  ['#FFD700', '#FFA500'],
  ['#4169E1', '#1E90FF'],
  ['#9932CC', '#DA70D6'],
  ['#FF4500', '#FF8C00'],
  ['#00C853', '#64DD17'], // Loop back to start
];

export const AnimatedLogo: React.FC = () => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: COLOR_SETS.length - 1,
        duration: 8000,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const color1 = animation.interpolate({
    inputRange: COLOR_SETS.map((_, i) => i),
    outputRange: COLOR_SETS.map(colors => colors[0]),
  });

  const color2 = animation.interpolate({
    inputRange: COLOR_SETS.map((_, i) => i),
    outputRange: COLOR_SETS.map(colors => colors[1]),
  });

  return (
    <Animated.View style={styles.logoContainer}>
      <AnimatedLinearGradient
        colors={[color1, color2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logoGradient}
      >
        <Text style={styles.logo}>luma go</Text>
      </AnimatedLinearGradient>
      <Animated.View style={[styles.logoGlow, { backgroundColor: color1 }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGradient: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logo: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -1,
    textTransform: 'lowercase',
  },
  logoGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 12,
    zIndex: -1,
    opacity: 0.6,
  },
}); 