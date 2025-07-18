import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  scale, 
  getResponsiveFontSize, 
  getResponsivePadding, 
  getResponsiveMargin,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet
} from '../utils/responsive';
import AutoUpdateService, { UpdateProgress } from '../services/AutoUpdateService';

const { width } = Dimensions.get('window');

interface UpdateNotificationProps {
  onClose: () => void;
  onUpdate: () => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  onClose,
  onUpdate,
}) => {
  const [updateProgress, setUpdateProgress] = useState<UpdateProgress>({
    progress: 0,
    status: 'idle',
    message: 'Gen 1 Update Available!',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(AutoUpdateService.getInstance().getUpdateInfo());

  // Animation values - Notification specific
  const notificationSlideAnim = useRef(new Animated.Value(-200)).current;
  const notificationGlowAnim = useRef(new Animated.Value(0)).current;
  const notificationGradientAnim = useRef(new Animated.Value(0)).current;
  const notificationPulseAnim = useRef(new Animated.Value(1)).current;
  const notificationRotateAnim = useRef(new Animated.Value(0)).current;
  const notificationProgressAnim = useRef(new Animated.Value(0)).current;
  const notificationScaleAnim = useRef(new Animated.Value(1)).current;
  const closeButtonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide in animation
    Animated.spring(notificationSlideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Start continuous animations
    startAnimations();

    // Subscribe to update progress
    const autoUpdateService = AutoUpdateService.getInstance();
    const progressListener = (progress: UpdateProgress) => {
      setUpdateProgress(progress);
      animateProgress(progress.progress);
      
      if (progress.status === 'downloading' || progress.status === 'installing') {
        setIsUpdating(true);
      } else if (progress.status === 'complete') {
        setIsUpdating(false);
        // Show completion state in UI for 5 seconds, then auto-close (stabilized)
        // This gives users time to see the completion message
        setTimeout(() => {
          onClose();
          // Force app refresh after closing notification (delayed to prevent jumping)
          setTimeout(() => {
            if (global.appRefreshCallback) {
              global.appRefreshCallback();
            }
          }, 2000); // Increased delay to prevent jumping
        }, 5000);
      }
    };

    autoUpdateService.addProgressListener(progressListener);

    return () => {
      autoUpdateService.removeProgressListener(progressListener);
    };
  }, []);

  const startAnimations = () => {
    // Glow animation - using JS driver for shadow opacity
    Animated.loop(
      Animated.sequence([
        Animated.timing(notificationGlowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(notificationGlowAnim, {
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
        Animated.timing(notificationGradientAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(notificationGradientAnim, {
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
        Animated.timing(notificationPulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(notificationPulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation - using native driver for transform
    Animated.loop(
      Animated.timing(notificationRotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Scale animation for button - using native driver for transform
    Animated.loop(
      Animated.sequence([
        Animated.timing(notificationScaleAnim, {
          toValue: 1.02,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(notificationScaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateProgress = (progress: number) => {
    Animated.timing(notificationProgressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const autoUpdateService = AutoUpdateService.getInstance();
      await autoUpdateService.startUpdate();
      onUpdate();
    } catch (error) {
      setIsUpdating(false);
      Alert.alert('Update Failed', 'Please try again later.');
    }
  };

  // Removed showCompletionAlert function - using UI-based completion instead

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
        return 'rocket';
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
    const glowIntensity = notificationGradientAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    });

    return [
      'rgba(255, 215, 0, 0.8)',
      'rgba(255, 193, 7, 0.6)',
      'rgba(255, 152, 0, 0.4)',
    ] as const;
  };

  const spin = notificationRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: notificationSlideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(255, 215, 0, 0.9)', 'rgba(255, 193, 7, 0.8)', 'rgba(255, 152, 0, 0.7)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Close Button */}
        <Animated.View style={styles.closeButton}>
          <TouchableOpacity 
            style={styles.closeButtonTouchable} 
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPressIn={() => {
              Animated.spring(closeButtonScaleAnim, {
                toValue: 0.9,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(closeButtonScaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
              }).start();
            }}
          >
            <Animated.View 
              style={[
                styles.closeButtonBackground,
                {
                  transform: [{ scale: closeButtonScaleAnim }],
                },
              ]}
            >
              <Ionicons name="close" size={scale(18)} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Gen 1 Badge */}
        <View style={styles.gen1Badge}>
          <Text style={styles.gen1BadgeText}>GEN 1</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Icon Section - Separate views for different drivers */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                shadowOpacity: notificationGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8],
                }),
              },
            ]}
          >
            <Animated.View
              style={[
                styles.iconGradient,
                {
                  transform: [
                    { scale: notificationPulseAnim },
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
                  size={scale(24)}
                  color="#fff"
                />
              </LinearGradient>
            </Animated.View>
          </Animated.View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Animated.Text
              style={[
                styles.title,
              ]}
            >
              {updateProgress.status === 'complete' 
                ? '🎉 Update Complete!' 
                : updateProgress.message}
            </Animated.Text>
            
            <Text style={styles.subtitle}>
              {updateProgress.status === 'complete'
                ? 'Your Luma Gen 1 app has been successfully updated!'
                : `Version ${updateInfo.newVersion} • ${updateInfo.size}`}
            </Text>
            
            <Text style={styles.featurePreview}>
              {updateProgress.status === 'complete'
                ? 'Choose your next action below'
                : '✨ Enhanced Gen 1 AI assist...'}
            </Text>
          </View>

          {/* Progress Section */}
          {isUpdating && (
            <View style={styles.progressSection}>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: notificationProgressAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: getStatusColor(),
                      },
                    ]}
                  />
                </View>
                
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
          )}

          {/* Update Button or Completion Actions */}
          {!isUpdating && (
            <Animated.View
              style={[
                styles.updateButtonContainer,
                {
                  transform: [{ scale: notificationScaleAnim }],
                },
              ]}
            >
              {updateProgress.status === 'complete' ? (
                // Completion Actions
                <View style={styles.completionActions}>
                  <TouchableOpacity
                    style={styles.completionButton}
                    onPress={handleUpdate}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(76, 175, 80, 0.9)', 'rgba(76, 175, 80, 0.7)']}
                      style={styles.completionButtonGradient}
                    >
                      <Ionicons name="refresh" size={scale(14)} color="#fff" />
                      <Text style={styles.completionButtonText}>Update Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.completionButton}
                    onPress={() => {
                      const { navigate } = require('../services/NavigationService');
                      navigate('MenuScreen');
                      onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(33, 150, 243, 0.9)', 'rgba(33, 150, 243, 0.7)']}
                      style={styles.completionButtonGradient}
                    >
                      <Ionicons name="menu" size={scale(14)} color="#fff" />
                      <Text style={styles.completionButtonText}>Go to Menu</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                // Regular Update Button
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={handleUpdate}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                    style={styles.updateButtonGradient}
                  >
                    <Text style={styles.updateButtonText}>Update →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: getResponsivePadding(60),
    left: getResponsivePadding(16),
    right: getResponsivePadding(16),
    zIndex: 1000,
    borderRadius: getResponsivePadding(20),
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    padding: getResponsivePadding(20),
    minHeight: isSmallDevice ? getResponsivePadding(120) : getResponsivePadding(140),
  },
  closeButton: {
    position: 'absolute',
    top: getResponsivePadding(12),
    right: getResponsivePadding(12),
    zIndex: 10,
  },
  closeButtonTouchable: {
    padding: getResponsivePadding(2),
  },
  closeButtonBackground: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gen1Badge: {
    position: 'absolute',
    top: getResponsivePadding(12),
    left: getResponsivePadding(12),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: getResponsivePadding(8),
    paddingVertical: getResponsivePadding(4),
    borderRadius: getResponsivePadding(12),
  },
  gen1BadgeText: {
    color: '#fff',
    fontSize: getResponsiveFontSize(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getResponsiveMargin(24),
  },
  iconContainer: {
    width: isSmallDevice ? scale(48) : scale(56),
    height: isSmallDevice ? scale(48) : scale(56),
    borderRadius: isSmallDevice ? scale(24) : scale(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveMargin(16),
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 6,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: isSmallDevice ? scale(20) : scale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: '800',
    color: '#fff',
    marginBottom: getResponsiveMargin(6),
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: getResponsiveFontSize(13),
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: getResponsiveMargin(6),
    fontWeight: '500',
  },
  featurePreview: {
    fontSize: getResponsiveFontSize(12),
    color: 'rgba(255, 255, 255, 0.85)',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  progressSection: {
    marginTop: getResponsiveMargin(16),
    width: '100%',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveMargin(12),
  },
  progressBarBackground: {
    flex: 1,
    height: getResponsivePadding(8),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: getResponsivePadding(4),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: getResponsivePadding(3),
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  progressPercentage: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: '700',
    minWidth: scale(35),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  updateButtonContainer: {
    marginLeft: getResponsiveMargin(16),
  },
  updateButton: {
    borderRadius: getResponsivePadding(20),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  updateButtonGradient: {
    paddingHorizontal: getResponsivePadding(20),
    paddingVertical: getResponsivePadding(12),
  },
  updateButtonText: {
    color: '#FFD700',
    fontSize: getResponsiveFontSize(15),
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  completionActions: {
    flexDirection: isSmallDevice ? 'column' : 'row',
    gap: getResponsiveMargin(12),
  },
  completionButton: {
    borderRadius: getResponsivePadding(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  completionButtonGradient: {
    paddingHorizontal: getResponsivePadding(16),
    paddingVertical: getResponsivePadding(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveMargin(6),
  },
  completionButtonText: {
    color: '#fff',
    fontSize: getResponsiveFontSize(13),
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default UpdateNotification; 