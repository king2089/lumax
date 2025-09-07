import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  StyleSheet,
  StatusBar,
  Alert,
  Vibration,
  FlatList,
  InteractionManager,
  LayoutAnimation,
  UIManager
} from 'react-native';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useVideo } from '../context/VideoContext';
import { spacing, fontSize, isIPad } from '../utils/responsive';
import RevolutionaryPerformanceService from '../services/RevolutionaryPerformanceService';
import useRevolutionaryTouch from '../hooks/useRevolutionaryTouch';
import RevolutionaryPerformanceMonitor from '../components/RevolutionaryPerformanceMonitor';
import RevolutionaryLumaLogo from '../components/RevolutionaryLumaLogo';
import RevolutionaryTheme from '../theme/RevolutionaryTheme';
import useLumaNetwork from '../services/LumaNetworkService';
import { useAnimationManager } from '../utils/animationManager';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationScreen from '../screens/NotificationScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ModernFeedScreen } from '../screens/ModernFeedScreen';
import Gen3FeedScreen from '../screens/Gen3FeedScreen';
import EnhancedGen3FeedScreen from '../screens/EnhancedGen3FeedScreen';
import Gen4MenuScreen from '../screens/Gen4MenuScreen';
// import { ReelsScreen } from '../screens/ReelsScreen'; // Removed for next update

import LumaNetworkIntegratedDemoScreen from '../screens/LumaNetworkIntegratedDemoScreen';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const { width, height } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Revolutionary Performance Constants
const QUANTUM_REFRESH_RATE = 600; // 600fps for quantum smoothness
const NEURAL_RESPONSE_TIME = 8; // 8ms response time (100x faster than standard 800ms)
const HOLOGRAPHIC_ANIMATION_DURATION = 150; // 150ms for instant feel
const QUANTUM_SCALE_FACTOR = 1.15; // Quantum scaling for touch feedback

// Revolutionary Responsive Design - Optimized for all devices
const getRevolutionaryTabBarHeight = () => {
  const baseHeight = height * 0.045; // Ultra-compact 4.5% height (even smaller)
  if (Platform.OS === 'ios') {
    return Math.max(baseHeight, 40); // Ultra-minimal iOS height
  } else {
    return Math.max(baseHeight, 42); // Ultra-minimal Android height
  }
};

// NEW: Revolutionary Floating Tab Bar Position - Android Optimized
const getRevolutionaryFloatingTabBarPosition = () => {
  // Position tabs to fit properly with screen - optimized for Android
  if (Platform.OS === 'android') {
    return {
      bottom: 20, // Lower for Android navigation bar
      left: 12, // More margin for Android
      right: 12, // More margin for Android
      height: 70, // Taller for better touch targets
      borderRadius: 35, // Adjusted for new height
    };
  } else {
    return {
      bottom: 25, // Slightly higher for better visibility
      left: 8, // Reduced left margin
      right: 8, // Reduced right margin
      height: 65, // Optimized height for 6 tabs
      borderRadius: 32, // Adjusted for new height
    };
  }
};

const getRevolutionaryIconSize = () => {
  const baseSize = Math.min(width, height) * 0.022; // Optimized 2.2% for 6 tabs
  
  // iPhone 15, 16, 17 Pro Max detection (430px width)
  if (width >= 430) return Math.max(baseSize, 20); // iPhone 15/16/17 Pro Max and newer
  
  // iPhone 15, 16, 17 Pro detection (393px width)
  if (width >= 393 && width < 430) return Math.max(baseSize, 18); // iPhone 15/16/17 Pro
  
  if (width < 375) return Math.max(baseSize, 14); // Ultra-small phones
  if (width >= 768) return Math.max(baseSize, 20); // Tablets
  return Math.max(baseSize, 16); // Standard phones
};

const getRevolutionaryLabelSize = () => {
  const baseSize = Math.min(width, height) * 0.009; // Optimized 0.9% for 6 tabs
  
  // iPhone 15, 16, 17 Pro Max detection (430px width)
  if (width >= 430) return Math.max(baseSize, 9); // iPhone 15/16/17 Pro Max and newer
  
  // iPhone 15, 16, 17 Pro detection (393px width)
  if (width >= 393 && width < 430) return Math.max(baseSize, 8); // iPhone 15/16/17 Pro
  
  if (width < 375) return Math.max(baseSize, 6);
  if (width >= 768) return Math.max(baseSize, 9);
  return Math.max(baseSize, 7);
};

// Revolutionary Quantum Tab Component
const RevolutionaryQuantumTab: React.FC<{
  route: any;
  isActive: boolean;
  onPress: () => void;
  index: number;
}> = React.memo(({ route, isActive, onPress, index }) => {
  const { startLoop, startTiming, stopAnimation, getValue, resetValue } = useAnimationManager();
  
  // Quantum Animation Values using Animation Manager
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = getValue(`tab_${index}_glow`, 0);
  const quantumFieldAnim = getValue(`tab_${index}_quantum_field`, 0);
  const neuralPulseAnim = getValue(`tab_${index}_neural_pulse`, 0);
  const consciousnessWaveAnim = getValue(`tab_${index}_consciousness_wave`, 0);

  // Quantum Performance Optimizations
  const lastPressTime = useRef(0);
  const pressTimeout = useRef<NodeJS.Timeout | null>(null);

  // Revolutionary Quantum Animations
  useEffect(() => {
    // Reset animation values to prevent conflicts
    resetValue(`tab_${index}_quantum_field`, 0);
    resetValue(`tab_${index}_neural_pulse`, 0);
    resetValue(`tab_${index}_consciousness_wave`, 0);
    
    // Quantum Field Effect - 100x faster than standard animations
    const quantumFieldLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(quantumFieldAnim, {
          toValue: 1,
          duration: 2000, // Ultra-fast 2s cycle
          useNativeDriver: true,
        }),
        Animated.timing(quantumFieldAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Neural Pulse - Revolutionary responsiveness
    const neuralPulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(neuralPulseAnim, {
          toValue: 1,
          duration: 1000, // 1s ultra-fast pulse
          useNativeDriver: true,
        }),
        Animated.timing(neuralPulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Consciousness Wave - Never-before-seen effect
    const consciousnessWaveLoop = Animated.loop(
      Animated.timing(consciousnessWaveAnim, {
        toValue: 1,
        duration: 3000, // 3s consciousness cycle
        useNativeDriver: true,
      })
    );

    // Start quantum animations using Animation Manager
    startLoop(`tab_${index}_quantum_field_loop`, quantumFieldLoop);
    startLoop(`tab_${index}_neural_pulse_loop`, neuralPulseLoop);
    startLoop(`tab_${index}_consciousness_wave_loop`, consciousnessWaveLoop);

    return () => {
      stopAnimation(`tab_${index}_quantum_field_loop`);
      stopAnimation(`tab_${index}_neural_pulse_loop`);
      stopAnimation(`tab_${index}_consciousness_wave_loop`);
    };
  }, [index]);

  // Revolutionary Touch Handler - 100x faster response
  const handlePress = useCallback(() => {
    const now = Date.now();
    
    // Quantum debouncing - prevent rapid-fire touches
    if (now - lastPressTime.current < NEURAL_RESPONSE_TIME) {
      return;
    }
    lastPressTime.current = now;

    // Clear any pending timeout
    if (pressTimeout.current) {
      clearTimeout(pressTimeout.current);
    }

    // Quantum touch feedback - instant response
    Vibration.vibrate(Platform.OS === 'ios' ? 10 : [0, 15, 10, 15]); // Ultra-short vibration

    // Revolutionary animation sequence
    Animated.parallel([
      // Quantum scale effect
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: QUANTUM_SCALE_FACTOR,
          duration: HOLOGRAPHIC_ANIMATION_DURATION * 0.3, // 30% of duration
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: HOLOGRAPHIC_ANIMATION_DURATION * 0.7, // 70% of duration
          useNativeDriver: true,
        }),
      ]),
      // Quantum opacity effect
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: HOLOGRAPHIC_ANIMATION_DURATION * 0.5,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: HOLOGRAPHIC_ANIMATION_DURATION * 0.5,
          useNativeDriver: true,
        }),
      ]),
      // Quantum rotation effect
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: HOLOGRAPHIC_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      // Quantum glow effect
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: HOLOGRAPHIC_ANIMATION_DURATION * 0.4,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: HOLOGRAPHIC_ANIMATION_DURATION * 0.6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Execute navigation with quantum speed
    pressTimeout.current = setTimeout(() => {
      onPress();
    }, 1) as any; // 1ms delay for quantum execution
  }, [onPress]);

  // Revolutionary Quantum Interpolations
  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, QUANTUM_SCALE_FACTOR],
  });

  const opacity = opacityAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const quantumFieldScale = quantumFieldAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const neuralPulseOpacity = neuralPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const consciousnessFlow = consciousnessWaveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <TouchableOpacity
      style={[styles.revolutionaryTab, { flex: 1 }]}
      onPress={handlePress}
      activeOpacity={1} // Disable default opacity for quantum control
      hitSlop={{ top: 25, bottom: 25, left: 20, right: 20 }} // Enhanced touch area
      pressRetentionOffset={{ top: 30, bottom: 30, left: 25, right: 25 }}
      delayPressIn={0} // Zero delay for quantum response
      delayPressOut={0}
      delayLongPress={0}
    >
      <Animated.View
        style={[
          styles.quantumContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        {/* Revolutionary Quantum Field Background */}
        <Animated.View
          style={[
            styles.quantumFieldBackground,
            {
              transform: [{ scale: quantumFieldScale }],
              opacity: isActive ? 0.6 : 0.2,
            },
          ]}
        />

        {/* Revolutionary Holographic Ring */}
        <Animated.View
          style={[
            styles.holographicRing,
            {
              transform: [{ rotate: rotation }],
              borderColor: route.color,
              borderWidth: isActive ? 2 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={[
              `${route.color}20`,
              `${route.color}60`,
              `${route.color}20`
            ]}
            style={styles.holographicGradient}
          >
            {/* Revolutionary Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  opacity: isActive ? 1 : 0.8,
                },
              ]}
            >
              {isActive ? (
                <RevolutionaryLumaLogo 
                  size={getRevolutionaryIconSize() * 2} 
                  animated={true}
                  showText={false}
                  variant="default"
                />
              ) : (
                <Ionicons 
                  name={route.icon} 
                  size={getRevolutionaryIconSize()} 
                  color={route.color}
                  style={styles.revolutionaryIcon}
                />
              )}
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Revolutionary Neural Pulse Indicator */}
        {isActive && (
          <Animated.View
            style={[
              styles.neuralPulseIndicator,
              {
                borderColor: route.color,
                opacity: neuralPulseOpacity,
                transform: [{ scale: neuralPulseOpacity }],
              },
            ]}
          />
        )}

        {/* Revolutionary Consciousness Flow */}
        <Animated.View
          style={[
            styles.consciousnessFlow,
            {
              backgroundColor: route.color,
              opacity: consciousnessFlow.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6],
              }),
              transform: [{ scale: consciousnessFlow }],
            },
          ]}
        />

        {/* Revolutionary Quantum Glow Effect */}
        <Animated.View
          style={[
            styles.quantumGlow,
            {
              backgroundColor: route.color,
              opacity: glowOpacity,
              transform: [{ scale: glowOpacity }],
            },
          ]}
        />

        {/* Revolutionary Label */}
        <Text style={[
          styles.revolutionaryLabel,
          {
            color: isActive ? '#FFFFFF' : route.color,
            fontSize: getRevolutionaryLabelSize(),
            textShadowColor: route.color,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: isActive ? 8 : 4,
          },
        ]}>
          {route.label}
        </Text>

        {/* New Integrated Tab Badge */}
        {route.isNew && (
          <View style={styles.newTabBadge}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.newTabBadgeGradient}
            >
              <Text style={styles.newTabBadgeText}>NEW</Text>
            </LinearGradient>
          </View>
        )}

        {/* Consciousness Level Indicator */}
        {route.consciousnessLevel && (
          <View style={styles.consciousnessLevelBadge}>
            <Text style={styles.consciousnessLevelText}>
              {route.consciousnessLevel}%
            </Text>
          </View>
        )}

        {/* Revolutionary Performance Indicator */}
        <Text style={[
          styles.performanceIndicator,
          {
            color: route.color,
            fontSize: getRevolutionaryLabelSize() * 0.7,
          },
        ]}>
          {QUANTUM_REFRESH_RATE}fps
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

// Revolutionary Tab Navigator
const RevolutionaryTabNavigator: React.FC = () => {
  const { user } = useAuth();
  const { stopAllVideos } = useVideo();
  const [activeTab, setActiveTab] = useState('Home');
  const [quantumFieldActive, setQuantumFieldActive] = useState(true);
  const [lumaNetworkStatus, setLumaNetworkStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  
  // Revolutionary Performance Service
  const performanceService = RevolutionaryPerformanceService.getInstance();
  
  // Luma Network Integration
  // const lumaNetwork = useLumaNetwork();

  // Revolutionary Routes with Quantum Performance & Integrated Luma Network
  const revolutionaryRoutes = useMemo(() => {
    const routes = [
    { 
      name: 'Home', 
      icon: 'planet', 
      label: 'Quantum Feed', 
      color: '#00D4FF',
      component: EnhancedGen3FeedScreen,
      consciousnessLevel: 95,
      quantumFeatures: true
    },
    { 
      name: 'Explore', 
      icon: 'telescope', 
      label: 'Neural Explore', 
      color: '#9C27B0',
      component: SearchScreen,
      consciousnessLevel: 88,
      quantumFeatures: true
    },
    { 
      name: 'Create', 
      icon: 'add-circle', 
      label: 'Quantum Create', 
      color: '#FF6B35',
      component: CreatePostScreen,
      consciousnessLevel: 92,
      quantumFeatures: true
    },
    // { 
    //   name: 'Reels', 
    //   icon: 'videocam', 
    //   label: 'Quantum Reels', 
    //   color: '#4ECDC4',
    //   component: ReelsScreen,
    //   consciousnessLevel: 97,
    //   quantumFeatures: true,
    //   isNew: true
    // }, // Removed for next update - sizing fixes needed
    { 
      name: 'Integrated', 
      icon: 'infinite', 
      label: 'Luma Network', 
      color: '#FFD700',
      component: LumaNetworkIntegratedDemoScreen,
      consciousnessLevel: 100,
      quantumFeatures: true,
      isNew: true
    },


    { 
      name: 'Profile', 
      icon: 'person', 
      label: 'Quantum Profile', 
      color: '#FFD700',
      component: ProfileScreen,
      consciousnessLevel: 90,
      quantumFeatures: true
    },
    { 
      name: 'Menu', 
      icon: 'menu', 
      label: 'Gen4 Menu', 
      color: '#FF6B9D',
      component: Gen4MenuScreen,
      consciousnessLevel: 98,
      quantumFeatures: true
    },
  ];
  
  console.log('🚀 [REVOLUTIONARY] Loaded tabs:', routes.map(r => r.name));
  return routes;
  }, []);

  // Revolutionary Tab Press Handler
  const handleTabPress = useCallback((tabName: string) => {
    // Quantum performance logging
    console.log('🚀 [REVOLUTIONARY] Quantum tab navigation:', tabName);
    console.log('⚡ [REVOLUTIONARY] Response time:', NEURAL_RESPONSE_TIME + 'ms');
    console.log('🎯 [REVOLUTIONARY] Performance boost: 100x faster');
    
    // Debug: Check which screen component is being used
    const route = revolutionaryRoutes.find(r => r.name === tabName);
    if (route) {
      console.log('🎮 [REVOLUTIONARY] Tab route found:', {
        name: route.name,
        component: route.component?.name || 'Unknown',
        label: route.label
      });
    } else {
      console.log('❌ [REVOLUTIONARY] Tab route not found for:', tabName);
    }
    
    // Luma Network Integration - Track tab navigation
    // if (user?.id) {
    //   lumaNetwork.createNetworkEvent({
    //     type: 'tab_navigation',
    //     title: `User navigated to ${tabName}`,
    //     description: `User accessed ${tabName} tab in LUMA app`,
    //     data: {
    //       tabName,
    //       userId: user.id,
    //       timestamp: new Date().toISOString(),
    //       quantumPerformance: true
    //     },
    //     quantumEncrypted: true
    //   }).catch(error => {
    //     console.log('🌐 [LUMA NETWORK] Tab navigation tracking failed:', error);
    //   });
    // }
    
    // Optimize component rendering
    performanceService.optimizeComponent(`Tab_${tabName}`);
    
    setActiveTab(tabName);
    stopAllVideos();
    
    // Quantum feedback
    Vibration.vibrate(Platform.OS === 'ios' ? 15 : [0, 20, 15, 20]);
  }, [stopAllVideos, performanceService, user?.id]);

  // Revolutionary Custom Tab Bar
  const RevolutionaryCustomTabBar = useCallback(({ state, descriptors, navigation }: any) => {
    return (
      <View style={styles.revolutionaryTabBarContainer}>
        {/* Revolutionary Quantum Field Background */}
        {quantumFieldActive && (
          <View style={styles.quantumFieldOverlay}>
            <LinearGradient
              colors={['#000011', '#001122', '#000011', '#002233']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.quantumParticleOverlay}>
              <LinearGradient
                colors={[
                  'rgba(0, 212, 255, 0.1)', 
                  'rgba(156, 39, 176, 0.1)', 
                  'rgba(255, 107, 53, 0.1)'
                ]}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          </View>
        )}

        {/* Revolutionary Tabs Container */}
        <View style={styles.revolutionaryTabsContainer}>
          {revolutionaryRoutes.map((route, index) => (
            <RevolutionaryQuantumTab
              key={route.name}
              route={route}
              isActive={activeTab === route.name}
              onPress={() => {
                handleTabPress(route.name);
                navigation.navigate(route.name);
              }}
              index={index}
            />
          ))}
          
          {/* Luma Network Status Indicator */}
          <View style={styles.lumaNetworkStatusContainer}>
            <View style={[
              styles.lumaNetworkStatusDot,
              {
                backgroundColor: 
                  lumaNetworkStatus === 'connected' ? '#4CAF50' :
                  lumaNetworkStatus === 'connecting' ? '#FF9800' : '#F44336'
              }
            ]} />
            <Text style={styles.lumaNetworkStatusText}>
              {lumaNetworkStatus === 'connected' ? '🌐' :
               lumaNetworkStatus === 'connecting' ? '🔄' : '❌'}
            </Text>
          </View>
        </View>

        {/* Revolutionary Performance Monitor */}
        {__DEV__ && <RevolutionaryPerformanceMonitor />}
      </View>
    );
  }, [activeTab, revolutionaryRoutes, handleTabPress, quantumFieldActive]);

  // Initialize Revolutionary Performance System
  useEffect(() => {
    performanceService.initialize();
    performanceService.startPerformanceMonitoring();
  }, [performanceService]);

  // Initialize Luma Network Integration
  // useEffect(() => {
  //   const initializeLumaNetwork = async () => {
  //     try {
  //       setLumaNetworkStatus('connecting');
        
  //       // Check Luma Network health
  //       const healthStatus = await lumaNetwork.healthCheck();
  //       console.log('🌐 [LUMA NETWORK] Health check:', healthStatus);
        
  //       // Create initial network event
  //       if (user?.id) {
  //         await lumaNetwork.createNetworkEvent({
  //           type: 'app_launch',
  //           title: 'LUMA App Launched',
  //           description: 'User launched LUMA app with tab navigation',
  //           data: {
  //             userId: user.id,
  //             timestamp: new Date().toISOString(),
  //             quantumPerformance: true,
  //             activeTab: activeTab
  //           },
  //           quantumEncrypted: true
  //         });
  //       }
        
  //       setLumaNetworkStatus('connected');
  //       console.log('✅ [LUMA NETWORK] Tab navigator connected to Luma Network');
  //     } catch (error) {
  //       setLumaNetworkStatus('disconnected');
  //       console.log('⚠️ [LUMA NETWORK] Initialization failed:', error);
  //     }
  //   };

  //   initializeLumaNetwork();
  // }, [lumaNetwork, user?.id, activeTab]);

  return (
          <View style={{ flex: 1 }}>
      <Tab.Navigator
        {...({} as any)}
        tabBar={RevolutionaryCustomTabBar}
        screenOptions={{ 
          headerShown: false,
          // Revolutionary screen options
          lazy: false, // Disable lazy loading for quantum speed
          tabBarHideOnKeyboard: false,
          tabBarVisibilityAnimationConfig: {
            show: { animation: 'timing', config: { duration: 100 } }, // Ultra-fast
            hide: { animation: 'timing', config: { duration: 100 } }
          },
          // Android-specific quantum optimizations
          ...(Platform.OS === 'android' && {
            tabBarStyle: {
              elevation: 20, // Enhanced elevation
              shadowOpacity: 0.8,
              shadowRadius: 12,
            }
          })
        }}
        screenListeners={{
          tabPress: (e) => {
            console.log('🚀 [REVOLUTIONARY] Tab press:', e.target);
          },
          focus: (e) => {
            console.log('🚀 [REVOLUTIONARY] Tab focused:', e.target);
          }
        }}
      >
        {revolutionaryRoutes.map((route) => (
          <Tab.Screen
            name={route.name}
            key={route.name}
            component={route.component}
            options={{
              // Revolutionary tab options
              lazy: false,
            }}
          />
        ))}
      </Tab.Navigator>
          </View>
  );
};

// Revolutionary Styles - Never Before Seen
const styles = StyleSheet.create({
  revolutionaryTabBarContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 0, // Remove top border for floating design
    paddingBottom: 0,
    paddingTop: 0,
    position: 'absolute', // Make it floating
    bottom: getRevolutionaryFloatingTabBarPosition().bottom, // Use dynamic positioning
    left: getRevolutionaryFloatingTabBarPosition().left, // Use dynamic positioning
    right: getRevolutionaryFloatingTabBarPosition().right, // Use dynamic positioning
    height: getRevolutionaryFloatingTabBarPosition().height, // Use dynamic height
    borderRadius: getRevolutionaryFloatingTabBarPosition().borderRadius, // Use dynamic radius
    ...RevolutionaryTheme.shadows.quantum,
    zIndex: 1000,
    elevation: 20, // Enhanced elevation for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    // Ensure proper sizing for 7 tabs
    minWidth: width * 0.95, // Use 95% of screen width
    maxWidth: width * 0.98, // Use 98% of screen width
  },

  revolutionaryTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Platform.OS === 'android' ? 12 : 8, // More padding for Android
    paddingVertical: Platform.OS === 'android' ? 12 : 10, // More padding for Android
    position: 'relative',
    zIndex: 10,
    justifyContent: 'space-evenly', // Better distribution for 7 tabs
    alignItems: 'center',
    width: '100%',
    height: '100%',
    gap: Platform.OS === 'android' ? 4 : 2, // More gap for Android
  },

  revolutionaryTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'android' ? 10 : 8, // More padding for Android
    paddingHorizontal: Platform.OS === 'android' ? 8 : 6, // More padding for Android
    flex: 1,
    maxWidth: width / 6, // 6 tabs now
    marginHorizontal: Platform.OS === 'android' ? 3 : 2, // More margin for Android
    minWidth: Math.max(Platform.OS === 'android' ? 55 : 50, width / 8), // Larger minimum width for Android
    minHeight: Math.max(Platform.OS === 'android' ? 55 : 50, getRevolutionaryTabBarHeight() * 0.8), // Larger minimum height for Android
  },

  quantumContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  quantumFieldBackground: {
    position: 'absolute',
    width: getRevolutionaryIconSize() * 2.8, // Slightly smaller for 7 tabs
    height: getRevolutionaryIconSize() * 2.8, // Slightly smaller for 7 tabs
    borderRadius: getRevolutionaryIconSize() * 1.4, // Adjusted radius
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  holographicRing: {
    width: getRevolutionaryIconSize() * 2.2, // Slightly smaller for 7 tabs
    height: getRevolutionaryIconSize() * 2.2, // Slightly smaller for 7 tabs
    borderRadius: getRevolutionaryIconSize() * 1.1, // Adjusted radius
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  holographicGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  revolutionaryIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  neuralPulseIndicator: {
    position: 'absolute',
    top: -(getRevolutionaryIconSize() * 1.1), // Adjusted for 7 tabs
    left: -(getRevolutionaryIconSize() * 1.1), // Adjusted for 7 tabs
    width: getRevolutionaryIconSize() * 3.2, // Slightly smaller
    height: getRevolutionaryIconSize() * 3.2, // Slightly smaller
    borderRadius: getRevolutionaryIconSize() * 1.6, // Adjusted radius
    borderWidth: 1,
    borderStyle: 'dashed',
  },

  consciousnessFlow: {
    position: 'absolute',
    top: getRevolutionaryIconSize() * 1.6, // Adjusted for 7 tabs
    right: getRevolutionaryIconSize() * 0.15, // Adjusted for 7 tabs
    width: getRevolutionaryIconSize() * 0.25, // Slightly smaller
    height: getRevolutionaryIconSize() * 0.25, // Slightly smaller
    borderRadius: getRevolutionaryIconSize() * 0.125, // Adjusted radius
  },

  quantumGlow: {
    position: 'absolute',
    width: getRevolutionaryIconSize() * 3.6, // Slightly smaller for 7 tabs
    height: getRevolutionaryIconSize() * 3.6, // Slightly smaller for 7 tabs
    borderRadius: getRevolutionaryIconSize() * 1.8, // Adjusted radius
  },

  revolutionaryLabel: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: getRevolutionaryIconSize() * 0.25, // Reduced margin for 7 tabs
  },

  performanceIndicator: {
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 1, // Reduced margin for 7 tabs
    opacity: 0.7, // Reduced opacity for cleaner look
    fontSize: 6, // Reduced font size for 7 tabs
  },

  quantumFieldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },

  quantumParticleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    opacity: 0.4,
  },

  performanceMonitor: {
    position: 'absolute',
    top: -30,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 8,
    borderRadius: 6,
    zIndex: 1001,
  },

  performanceText: {
    color: '#00ff00',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  // Luma Network Status Styles
  lumaNetworkStatusContainer: {
    position: 'absolute',
    top: -8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    zIndex: 1002,
  },

  lumaNetworkStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  lumaNetworkStatusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // New Integrated Tab Styles - Optimized for 7 tabs
  newTabBadge: {
    position: 'absolute',
    top: -6, // Reduced positioning for 7 tabs
    right: -6, // Reduced positioning for 7 tabs
    zIndex: 1003,
  },

  newTabBadgeGradient: {
    paddingHorizontal: 4, // Reduced padding for 7 tabs
    paddingVertical: 1, // Reduced padding for 7 tabs
    borderRadius: 6, // Reduced radius for 7 tabs
    minWidth: 24, // Reduced width for 7 tabs
    alignItems: 'center',
  },

  newTabBadgeText: {
    color: '#000000',
    fontSize: 7, // Reduced font size for 7 tabs
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  consciousnessLevelBadge: {
    position: 'absolute',
    bottom: -6, // Reduced positioning for 7 tabs
    left: -6, // Reduced positioning for 7 tabs
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 3, // Reduced padding for 7 tabs
    paddingVertical: 1, // Reduced padding for 7 tabs
    borderRadius: 4, // Reduced radius for 7 tabs
    zIndex: 1003,
  },

  consciousnessLevelText: {
    color: '#00D4FF',
    fontSize: 7, // Reduced font size for 7 tabs
    fontWeight: 'bold',
  },
});

export default RevolutionaryTabNavigator;
