import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  scale, 
  verticalScale, 
  responsiveStyle, 
  isSmallDevice, 
  isTablet,
  isMediumDevice,
  isLargeDevice,
  getResponsiveFontSize, 
  getResponsivePadding,
  getResponsiveMargin,
  screenDimensions
} from '../utils/responsive';
import ScreenFitter from '../components/ScreenFitter';
import AutoUpdateService, { UpdateProgress } from '../services/AutoUpdateService';

const { width, height } = Dimensions.get('window');

export const UpdateScreen: React.FC = () => {
  const [updateProgress, setUpdateProgress] = useState<UpdateProgress>({
    progress: 0,
    status: 'idle',
    message: 'Checking for Gen 1 Updates...',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(AutoUpdateService.getInstance().getUpdateInfo());

  // Animation values - Screen specific
  const screenProgressAnim = useRef(new Animated.Value(0)).current;
  const screenGlowAnim = useRef(new Animated.Value(0)).current;
  const screenGradientAnim = useRef(new Animated.Value(0)).current;
  const screenPulseAnim = useRef(new Animated.Value(1)).current;
  const screenRotateAnim = useRef(new Animated.Value(0)).current;
  const screenScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    startAnimations();
    
    // Subscribe to update progress
    const autoUpdateService = AutoUpdateService.getInstance();
    const progressListener = (progress: UpdateProgress) => {
      setUpdateProgress(progress);
      animateProgress(progress.progress);
      
      if (progress.status === 'downloading' || progress.status === 'installing' || progress.status === 'checking') {
        setIsUpdating(true);
      } else if (progress.status === 'complete') {
        setIsUpdating(false);
        showCompletionAlert();
      } else if (progress.status === 'error') {
        setIsUpdating(false);
      } else {
        setIsUpdating(false);
      }
    };

    autoUpdateService.addProgressListener(progressListener);

    // Initial progress animation
    animateProgress(updateProgress.progress);

    return () => {
      autoUpdateService.removeProgressListener(progressListener);
    };
  }, []);

  const startAnimations = () => {
    // Glow animation - using JS driver for shadow opacity
    Animated.loop(
      Animated.sequence([
        Animated.timing(screenGlowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(screenGlowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Gradient animation - using JS driver for color interpolation
    Animated.loop(
      Animated.sequence([
        Animated.timing(screenGradientAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(screenGradientAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Pulse animation - using native driver for transform
    Animated.loop(
      Animated.sequence([
        Animated.timing(screenPulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(screenPulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation - using native driver for transform
    Animated.loop(
      Animated.timing(screenRotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Scale animation for icon - using native driver for transform
    Animated.loop(
      Animated.sequence([
        Animated.timing(screenScaleAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(screenScaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateProgress = (progress: number) => {
    Animated.timing(screenProgressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const handleStartUpdate = async () => {
    try {
      setIsUpdating(true);
      const autoUpdateService = AutoUpdateService.getInstance();
      await autoUpdateService.startUpdate();
    } catch (error) {
      setIsUpdating(false);
      Alert.alert('Update Failed', 'Please try again later.');
    }
  };

  const showCompletionAlert = () => {
    Alert.alert(
      '🎉 Update Complete!',
      'Your Luma Gen 1 app has been successfully updated with the latest features and improvements!',
      [
        {
          text: 'Awesome!',
          style: 'default',
        },
      ]
    );
  };

  const getStatusIcon = () => {
    switch (updateProgress.status) {
      case 'checking':
        return 'refresh';
      case 'downloading':
        return 'download';
      case 'installing':
        return 'construct';
      case 'complete':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      default:
        return 'refresh';
    }
  };

  const getStatusColor = () => {
    switch (updateProgress.status) {
      case 'checking':
        return '#FFD700';
      case 'downloading':
        return '#00C853';
      case 'installing':
        return '#2196F3';
      case 'complete':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return '#FFD700';
    }
  };

  const getGradientColors = () => {
    const glowIntensity = screenGradientAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    });

    return [
      'rgba(255, 215, 0, 0.8)',
      'rgba(255, 193, 7, 0.6)',
      'rgba(255, 152, 0, 0.4)',
    ] as const;
  };

  const spin = screenRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Gen 1 Badge */}
        <View style={styles.gen1Badge}>
          <LinearGradient
            colors={['rgba(255, 215, 0, 0.9)', 'rgba(255, 193, 7, 0.9)']}
            style={styles.gen1BadgeGradient}
          >
            <Text style={styles.gen1Text}>GEN 1</Text>
          </LinearGradient>
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    shadowOpacity: screenGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.8],
                    }),
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.logoGradient,
                    {
                      transform: [{ scale: screenScaleAnim }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFC107', '#FF9800']}
                    style={styles.logoGradient}
                  >
                    <Ionicons name="rocket" size={scale(24)} color="#fff" />
                  </LinearGradient>
                </Animated.View>
              </Animated.View>

              <Text style={styles.title}>Luma Gen 1</Text>
              <Text style={styles.subtitle}>AI-Powered Social Platform</Text>
              <Text style={styles.gen1Subtitle}>Next Generation Social Experience</Text>
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    shadowOpacity: screenGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 0.6],
                    }),
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.iconGradient,
                    {
                      transform: [
                        { scale: screenPulseAnim },
                        { rotate: spin },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={getGradientColors()}
                    style={styles.iconGradient}
                  >
                    <Ionicons
                      name={getStatusIcon() as any}
                      size={scale(40)}
                      color="#fff"
                    />
                  </LinearGradient>
                </Animated.View>
              </Animated.View>

              <Animated.Text
                style={[
                  styles.statusText,
                  {
                    color: getStatusColor(),
                  },
                ]}
              >
                {updateProgress.message}
              </Animated.Text>

              <Text style={styles.subStatusText}>
                {updateProgress.status === 'idle' && updateInfo.isAvailable
                  ? 'Latest Gen 1 update ready to install'
                  : 'Checking for Gen 1 updates...'}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: screenProgressAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: getStatusColor(),
                      },
                    ]}
                  />
                </View>
                
                {/* Progress Percentage */}
                <Animated.Text
                  style={[
                    styles.progressPercentage,
                    {
                      color: getStatusColor(),
                    },
                  ]}
                >
                  {Math.round(updateProgress.progress)}%
                </Animated.Text>
              </View>
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
              <View style={styles.featuresHeader}>
                <MaterialCommunityIcons
                  name="target"
                  size={scale(24)}
                  color="#F44336"
                  style={styles.featuresIcon}
                />
                <Text style={styles.featuresTitle}>New Gen 1 Features:</Text>
              </View>

              <View style={styles.featuresList}>
                {updateInfo.features.slice(0, 5).map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="sparkles"
                      size={scale(16)}
                      color="#FFD700"
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
                <Text style={styles.featuresMore}>
                  ...and {updateInfo.features.length - 5} more Gen 1 enhancements
                </Text>
              </View>
            </View>

            {/* Update Button */}
            {updateInfo.isAvailable && !isUpdating && (
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleStartUpdate}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFC107', '#FF9800']}
                  style={styles.updateButtonGradient}
                >
                  <Ionicons name="rocket" size={scale(20)} color="#fff" />
                  <Text style={styles.updateButtonText}>Update Now</Text>
                  <Ionicons name="arrow-forward" size={scale(20)} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Current Version Info */}
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>
                Current Version: {updateInfo.version}
              </Text>
              <Text style={styles.versionText}>
                New Version: {updateInfo.newVersion} • {updateInfo.size}
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  background: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: getResponsivePadding(20),
    paddingHorizontal: getResponsivePadding(16),
  },
  gen1Badge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? scale(60) : scale(40),
    right: scale(20),
    borderRadius: scale(20),
    overflow: 'hidden',
    zIndex: 10,
  },
  gen1BadgeGradient: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
  },
  gen1Text: {
    color: '#fff',
    fontSize: scale(12),
    fontWeight: '700',
    letterSpacing: 1,
  },
  content: {
    width: '100%',
    maxWidth: isTablet ? 600 : 400,
    alignSelf: 'center',
    paddingTop: Platform.OS === 'ios' ? scale(60) : scale(40),
    paddingBottom: getResponsivePadding(20),
  },
  header: {
    alignItems: 'center',
    marginBottom: getResponsivePadding(40),
  },
  logoContainer: {
    width: isSmallDevice ? scale(60) : isTablet ? scale(100) : scale(80),
    height: isSmallDevice ? scale(60) : isTablet ? scale(100) : scale(80),
    borderRadius: isSmallDevice ? scale(30) : isTablet ? scale(50) : scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsivePadding(20),
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: isSmallDevice ? scale(30) : isTablet ? scale(50) : scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: getResponsiveFontSize(28),
    fontWeight: '700',
    color: '#fff',
    marginBottom: getResponsivePadding(8),
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: getResponsiveFontSize(16),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: getResponsivePadding(4),
    textAlign: 'center',
  },
  gen1Subtitle: {
    fontSize: getResponsiveFontSize(14),
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: getResponsivePadding(40),
  },
  iconContainer: {
    width: isSmallDevice ? scale(60) : isTablet ? scale(100) : scale(80),
    height: isSmallDevice ? scale(60) : isTablet ? scale(100) : scale(80),
    borderRadius: isSmallDevice ? scale(30) : isTablet ? scale(50) : scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsivePadding(20),
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: isSmallDevice ? scale(30) : isTablet ? scale(50) : scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: '600',
    marginBottom: getResponsivePadding(8),
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subStatusText: {
    fontSize: getResponsiveFontSize(14),
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: getResponsivePadding(20),
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: scale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(4),
    overflow: 'hidden',
    marginBottom: scale(12),
  },
  progressBarFill: {
    height: '100%',
    borderRadius: scale(4),
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  progressPercentage: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: '700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  featuresSection: {
    width: '100%',
    marginBottom: getResponsivePadding(30),
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  featuresIcon: {
    marginRight: scale(8),
  },
  featuresTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: '600',
    color: '#fff',
  },
  featuresList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(12),
    padding: scale(16),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  featureIcon: {
    marginRight: scale(8),
  },
  featureText: {
    fontSize: getResponsiveFontSize(14),
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  featuresMore: {
    fontSize: scale(12),
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    marginTop: scale(8),
  },
  updateButton: {
    width: '100%',
    marginBottom: scale(20),
    borderRadius: scale(25),
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(16),
    paddingHorizontal: scale(24),
  },
  updateButtonText: {
    color: '#fff',
    fontSize: scale(18),
    fontWeight: '700',
    marginHorizontal: scale(12),
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: scale(12),
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: scale(4),
  },
});

export default UpdateScreen; 