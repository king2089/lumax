import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Animated, 
  Dimensions, 
  TouchableOpacity, 
  Platform,
  StyleSheet,
  StatusBar,
  Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useVideo } from '../context/VideoContext';
import { spacing, fontSize, isIPad } from '../utils/responsive';

// Import all screens
import HomeScreen from '../screens/HomeScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationScreen from '../screens/NotificationScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProfileEditScreen } from '../screens/ProfileEditScreen';
import AuthScreen from '../screens/AuthScreen';
import { CreatorToolsScreen } from '../screens/CreatorToolsScreen';
import { ContentStudioScreen } from '../screens/ContentStudioScreen';
import { CreatorAnalyticsScreen } from '../screens/CreatorAnalyticsScreen';
import { CreatorMonetizationScreen } from '../screens/CreatorMonetizationScreen';
import { CreatorCollaborationScreen } from '../screens/CreatorCollaborationScreen';
import { LumaBankScreen } from '../screens/LumaBankScreen';
import LumaShopScreen from '../screens/LumaShopScreen';
import LumaLovedOnesScreen from '../screens/LumaLovedOnesScreen';
import LumaInvestmentsScreen from '../screens/LumaInvestmentsScreen';
import QuantumConsciousnessMarketplaceScreen from '../screens/QuantumConsciousnessMarketplaceScreen';
import { LumaMusicScreen } from '../screens/LumaMusicScreen';
import { LumaRecordsScreen } from '../screens/LumaRecordsScreen';
import LumaCloudGamingScreen from '../screens/LumaCloudGamingScreen';
import Gen3RevolutionaryMenuScreen from '../screens/Gen3RevolutionaryMenuScreen';
import Gen3UltraRevolutionaryMenuScreen from '../screens/Gen3UltraRevolutionaryMenuScreen';
import Gen4MenuScreen from '../screens/Gen4MenuScreen';
import SuperGen3V2ProfileSetupScreen from '../screens/SuperGen3V2ProfileSetupScreen';
import { SuperGen3V2Screen } from '../screens/SuperGen3V2Screen';
import { Gen3V3ProfileScreen } from '../screens/Gen3V3ProfileScreen';


import { ApplePayGooglePayScreen } from '../screens/ApplePayGooglePayScreen';
import { ArtistProfileScreen } from '../screens/ArtistProfileScreen';
import SystemRequirements from '../components/SystemRequirements';
import Gen3SystemRequirementsScreen from '../screens/Gen3SystemRequirementsScreen';
import Gen3DisplayScreen from '../screens/Gen3DisplayScreen';
import { Gen3AuthScreen } from '../screens/Gen3AuthScreen';
import Gen3SettingsScreen from '../screens/Gen3SettingsScreen';
import AboutGen1UpdateScreen from '../screens/AboutGen1UpdateScreen';
import LogoCustomizationScreen from '../screens/LogoCustomizationScreen';
// NSFWControlPanel removed for 18+ only app
import { NSFWContentSettingsScreen } from '../screens/NSFWContentSettingsScreen';
import { MonetizationDashboard } from '../screens/MonetizationDashboard';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { SubscriptionContentScreen } from '../screens/SubscriptionContentScreen';
import { TodoScreen } from '../screens/TodoScreen';
import { FuturesScreen } from '../screens/FuturesScreen';

import FriendsScreen from '../screens/FriendsScreen';
import SavedScreen from '../screens/SavedScreen';
import { DisplayScreen } from '../screens/DisplayScreen';
import { SafetyContentScreen } from '../screens/SafetyContentScreen';
import { ReelsScreen } from '../screens/ReelsScreen';
import Gen1SettingsScreen from '../screens/Gen1SettingsScreen';

import KidsAccountScreen from '../screens/KidsAccountScreen';
import ComingSoonScreen from '../screens/ComingSoonScreen';
import { MusicVideoStudioScreen } from '../screens/MusicVideoStudioScreen';
import MusicUploadScreen from '../screens/MusicUploadScreen';
import { AIFanBaseScreen } from '../screens/AIFanBaseScreen';

import Gen2AIScreen from '../screens/Gen2AIScreen';
import Gen2ComingSoonScreen from '../screens/Gen2ComingSoonScreen';
import Gen2AIHologramScreen from '../screens/Gen2AIHologramScreen';
import Gen2QuantumMessagingScreen from '../screens/Gen2QuantumMessagingScreen';
import Gen2NeuralInterfaceScreen from '../screens/Gen2NeuralInterfaceScreen';
import Gen2OTAUpdateScreen from '../screens/Gen2OTAUpdateScreen';
import { Gen2DashboardScreen } from '../screens/Gen2DashboardScreen';
import { Gen2FeedScreen } from '../screens/Gen2FeedScreen';
import { Gen2ExploreScreen } from '../screens/Gen2ExploreScreen';
import { Gen2NotificationsScreen } from '../screens/Gen2NotificationsScreen';
import { Gen2CreatePostScreen } from '../screens/Gen2CreatePostScreen';
import { Gen2MenuScreen } from '../screens/Gen2MenuScreen';

// Gen3 Screens - Revolutionary UI
import Gen3FeedScreen from '../screens/Gen3FeedScreen';
import Gen3ExploreScreen from '../screens/Gen3ExploreScreen';
import { Gen3NotificationsScreen } from '../screens/Gen3NotificationsScreen';
import NotificationBadge from '../components/NotificationBadge';
import { Gen3CreatePostScreen } from '../screens/Gen3CreatePostScreen';
import OptimizedMenuScreen from '../screens/OptimizedMenuScreen';
import Gen3AIHelpScreen from '../screens/Gen3AIHelpScreen';
import { Gen3ProfileScreen } from '../screens/Gen3ProfileScreen';
import VerificationScreen from '../screens/VerificationScreen';
import OptimizedGen2MenuScreen from '../screens/OptimizedGen2MenuScreen';
import OptimizedGen2AIHologramScreen from '../screens/OptimizedGen2AIHologramScreen';

// Revolutionary XR System
import RevolutionaryXRView from '../components/RevolutionaryXRView';
import ImmersiveXRExperience from '../components/ImmersiveXRExperience';
import UniversalGen2AIHologramScreen from '../screens/UniversalGen2AIHologramScreen';
import LumaBRGameScreen from '../screens/LumaBRGameScreen';
import LumaAIGen3Screen from '../screens/LumaAIGen3Screen';
import { IPadFeedScreen } from '../screens/iPadFeedScreen';
import { AnalyticsDashboardScreen } from '../screens/AnalyticsDashboardScreen';
import AICharacterGenerationScreen from '../screens/AICharacterGenerationScreen';
import LumaNetworkScreen from '../screens/LumaNetworkScreen';
// LumaNetworkAuthScreen removed - integrated with main auth
import { AICreatorToolsScreen } from '../screens/AICreatorToolsScreen';
import Gen1MessengerScreen from '../screens/Gen1MessengerScreen';
import { Gen1MessengerV2Screen } from '../screens/Gen1MessengerV2Screen';
import { ModernFeedScreen } from '../screens/ModernFeedScreen';
import NewChatScreen from '../screens/NewChatScreen';
import ChatDetailsScreen from '../screens/ChatDetailsScreen';
import RevolutionaryTabNavigator from './RevolutionaryTabNavigator';
import { Gen4TabNavigator } from './Gen4TabNavigator';

import LumaPoliceScreen from '../screens/LumaPoliceScreen';
import LumaLegalScreen from '../screens/LumaLegalScreen';
import LumaQuantumScreen from '../screens/LumaQuantumScreen';
import { LumaBestModeScreen } from '../screens/LumaBestModeScreen';
import { LumaMusicUploadScreen } from '../screens/LumaMusicUploadScreen';
import { MusicJobApplicationScreen } from '../screens/MusicJobApplicationScreen';
import { LumaJobsScreen } from '../screens/LumaJobsScreen';
import { ApplyScreen } from '../screens/ApplyScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LumaAIRevolutionaryScreen from '../screens/LumaAIRevolutionaryScreen';
import LumaPoliceStatusScreen from '../screens/LumaPoliceStatusScreen';
import QuantumProcessingScreen from '../screens/QuantumProcessingScreen';
import NeuralNetworksScreen from '../screens/NeuralNetworksScreen';
import RealityManipulationScreen from '../screens/RealityManipulationScreen';
import TimeControlScreen from '../screens/TimeControlScreen';
import UFOWatcherGen2Screen from '../screens/UFOWatcherGen2Screen';
import LumaTimeMachineScreen from '../screens/LumaTimeMachineScreen';
import DimensionalControlScreen from '../screens/DimensionalControlScreen';
import ConsciousnessExpansionScreen from '../screens/ConsciousnessExpansionScreen';
import CosmicIntelligenceScreen from '../screens/CosmicIntelligenceScreen';
import InfiniteConsciousnessScreen from '../screens/InfiniteConsciousnessScreen';
import UniversalKnowledgeScreen from '../screens/UniversalKnowledgeScreen';
import OmnipotenceScreen from '../screens/OmnipotenceScreen';


import ComprehensiveSettingsScreen from '../screens/ComprehensiveSettingsScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import LumaDiabetesDetectorScreen from '../screens/LumaDiabetesDetectorScreen';
import GamingHubScreen from '../screens/GamingHubScreen';
import LumaCasinoScreen from '../screens/LumaCasinoScreen';
import SuperGen3BankScreen from '../screens/SuperGen3BankScreen';
import FitnessTrackerScreen from '../screens/FitnessTrackerScreen';
import LearningHubScreen from '../screens/LearningHubScreen';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import MovieTheaterScreen from '../screens/MovieTheaterScreen';
import { FollowerAnalyticsScreen } from '../screens/FollowerAnalyticsScreen';
import Gen3LiveScreen from '../screens/Gen3LiveScreen';
import { UFOWatcherScreen } from '../screens/UFOWatcherScreen';
import UFOWatcherMenuScreen from '../screens/UFOWatcherMenuScreen';
import AIContentCreatorScreen from '../screens/AIContentCreatorScreen';
import QuantumTechScreen from '../screens/QuantumTechScreen';
import MetaverseScreen from '../screens/MetaverseScreen';
import NeuralInterfaceScreen from '../screens/NeuralInterfaceScreen';
import TimeTravelScreen from '../screens/TimeTravelScreen';
import TeleportationScreen from '../screens/TeleportationScreen';
import LumaVRScreen from '../screens/LumaVRScreen';
import VRUniverseScreen from '../screens/VRUniverseScreen';
import VRRequirementsScreen from '../screens/VRRequirementsScreen';
import LumaVREnvironmentScreen from '../screens/LumaVREnvironmentScreen';
import LumaVRGamingScreen from '../screens/LumaVRGamingScreen';
import LumaCodingScreen from '../screens/LumaCodingScreen';
import JobApplicationsScreen from '../screens/JobApplicationsScreen';
import TestAccountScreen from '../screens/TestAccountScreen';
import UpdateScreen from '../screens/UpdateScreen';
import FeatureBuilderScreen from '../screens/FeatureBuilderScreen';
import APIDocumentationScreen from '../screens/APIDocumentationScreen';
import AIFeatureGeneratorScreen from '../screens/AIFeatureGeneratorScreen';
import { NewPostScreen } from '../screens/NewPostScreen';

import DeviceRequirementsScreen from '../screens/DeviceRequirementsScreen';
import Gen3GameEnginePreview from '../screens/Gen3GameEnginePreview';

import { UploadScreen } from '../screens/UploadScreen';
// EyeControlOverlay removed - users can use eye control in backend with camera
// EyeControlTest removed - users can use eye control in backend with camera
import AuthTest from '../components/AuthTest';

// EyeControlFloatingButton removed - users can use eye control in backend with camera
import TestFeedScreen from '../screens/TestFeedScreen';

import { FriendsFollowersScreen } from '../screens/FriendsFollowersScreen';


// Create proper component references to avoid inline functions
const EventsScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Events" />);
const PagesScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Pages" />);
const GroupsScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Groups" />);
// Game Engine Screens
const MobileGameStudioScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Mobile Game Studio" />);
const AndroidGameBuilderScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Android Game Builder" />);
const IOSGameBuilderScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="iOS Game Builder" />);
const AIAssetGeneratorScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="AI Asset Generator" />);
const ThreeDWorldBuilderScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="3D World Builder" />);
const VisualScriptingScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Visual Scripting" />);
const MultiplayerEngineScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Multiplayer Engine" />);
const GameAnalyticsScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Game Analytics" />);
const CrossPlatformDeployScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Cross-Platform Deploy" />);
const GameTemplatesScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Game Templates" />);
const GameMonetizationScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Game Monetization" />);
const GameAssetStoreScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Game Asset Store" />);
const GameTestingScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Game Testing" />);
const ARVRGamesScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="AR/VR Games" />);
const SettingsScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Settings & Privacy" />);
const HelpScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Help & Support" />);

const CustomerServiceScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Customer Support" />);
const CacheManagementScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Cache Management" />);
const TermsOfServiceScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Terms of Service" />);
const PrivacyPolicyScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Privacy Policy" />);
const PrivacySettingsScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Privacy Settings" />);
const NotificationSettingsScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Notification Settings" />);
const AnimationSettingsScreen = React.memo((props: any) => <ComingSoonScreen {...props} feature="Animation Settings" />);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const { width, height } = Dimensions.get('window');

// Responsive Design Functions
const isTablet = width >= 768;
const isLargeTablet = width >= 1024;
const isSmallPhone = width < 375;

// Responsive scaling functions
const scaleSize = (size: number) => {
  const baseWidth = isTablet ? 768 : 375;
  return Math.min(width, height) / baseWidth * size;
};

const scaleVertical = (size: number) => {
  const baseHeight = isTablet ? 1024 : 812;
  return height / baseHeight * size;
};

// Revolutionary Ultra-Compact Tab Bar Height - Further Reduced by 50%
const getTabBarHeight = () => {
  const baseHeight = height * 0.025; // Ultra-compact 2.5% height (50% further reduction)
  if (Platform.OS === 'ios') {
    if (height > 800) return Math.max(baseHeight, 25); // Ultra-minimal iOS height
    return Math.max(baseHeight, 22); // Ultra-minimal iOS height
  } else {
    return Math.max(baseHeight, 28); // Ultra-minimal Android height
  }
};

const getTabIconSize = () => {
  const baseSize = Math.min(width, height) * 0.018; // Ultra-optimized 1.8% (further reduction)
  if (isSmallPhone) return Math.max(baseSize, 14); // Ultra-small phones
  if (isTablet) return Math.max(baseSize, 18); // Tablets
  return Math.max(baseSize, 16); // Standard phones
};

const getTabLabelSize = () => {
  const baseSize = Math.min(width, height) * 0.007; // Ultra-optimized 0.7% (further reduction)
  if (isSmallPhone) return Math.max(baseSize, 6);
  if (isTablet) return Math.max(baseSize, 8);
  return Math.max(baseSize, 7);
};

const getHolographicRingSize = () => {
  const availableWidth = width / 6; // Divide by number of tabs (6 now)
  const baseSize = Math.min(availableWidth * 0.45, height * 0.025); // Ultra-compact 45% width and 2.5% height (further reduction)
  if (isSmallPhone) return Math.max(baseSize, 20); // Ultra-small phones
  if (isTablet) return Math.max(baseSize, 26); // Tablets
  return Math.max(baseSize, 23); // Standard phones
};



// Super Gen3 Quantum Neural Navigation Component
const SuperGen3QuantumNav: React.FC<{ 
  activeTab: string; 
  onTabPress: (tab: string) => void;
  routes: Array<{ name: string; icon: string; label: string; color: string; consciousnessLevel?: number; }>;
}> = ({ activeTab, onTabPress, routes }) => {
  const animatedValues = useRef(routes.map(() => new Animated.Value(0))).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const hologramRotation = useRef(new Animated.Value(0)).current;
  const quantumField = useRef(new Animated.Value(0)).current;
  const neuralSync = useRef(new Animated.Value(0)).current;
  const consciousnessWave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Super Gen3 Quantum Field Effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(quantumField, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(quantumField, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Neural Sync Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(neuralSync, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(neuralSync, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Consciousness Wave
    Animated.loop(
      Animated.timing(consciousnessWave, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();

    // Holographic rotation
    Animated.loop(
      Animated.timing(hologramRotation, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const renderSuperGen3Tab = (route: any, index: number) => {
    const isActive = activeTab === route.name;
    const animatedValue = animatedValues[index];
    const consciousnessLevel = route.consciousnessLevel || 85;

    const scale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.4],
    });

    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const quantumGlow = quantumField.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.3],
    });

    const neuralPulse = neuralSync.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });

    const consciousnessFlow = consciousnessWave.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <TouchableOpacity
        key={route.name}
        style={[styles.gen3Tab, { flex: 1 }]}
        onPress={() => {
          console.log('🎯 [HOLOGRAPHIC TAB] Pressed tab:', route.name);
          onTabPress(route.name);
        }}
        onPressIn={() => {
          console.log('🎯 [HOLOGRAPHIC TAB] Press in:', route.name);
          Animated.spring(animatedValue, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          console.log('🎯 [HOLOGRAPHIC TAB] Press out:', route.name);
          Animated.spring(animatedValue, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }}
        activeOpacity={0.6}
        hitSlop={{ top: 20, bottom: 20, left: 15, right: 15 }}
        pressRetentionOffset={{ top: 30, bottom: 30, left: 25, right: 25 }}
        delayPressIn={0}
        delayPressOut={0}
        delayLongPress={0}
      >
        <Animated.View
          style={[
            styles.holographicContainer,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          {/* Holographic glow effect */}
          <Animated.View
            style={[
              styles.holographicGlow,
              {
                backgroundColor: route.color,
                transform: [{ scale: quantumGlow }],
                opacity: isActive ? 0.7 : 0.4,
                width: getHolographicRingSize() * 0.9,
                height: getHolographicRingSize() * 0.9,
                borderRadius: getHolographicRingSize() * 0.45,
              },
            ]}
          />
          
          {/* 3D holographic ring */}
          <Animated.View
            style={[
              styles.holographicRing,
              {
                width: getHolographicRingSize(),
                height: getHolographicRingSize(),
                borderRadius: getHolographicRingSize() / 2,
                transform: [{
                  rotateY: hologramRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }],
                borderColor: route.color,
                borderWidth: isActive ? scaleSize(1) : scaleSize(0.5),
              },
            ]}
          >
            <LinearGradient
              colors={[`${route.color}40`, `${route.color}80`, `${route.color}40`]}
              style={[styles.holographicGradient, {
                borderRadius: getHolographicRingSize() / 2,
              }]}
            >
              <View style={{ position: 'relative' }}>
                <Ionicons 
                  name={route.icon as any} 
                  size={getTabIconSize()} 
                  color={isActive ? '#FFFFFF' : route.color}
                  style={{ 
                    textShadowColor: route.color,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: isActive ? 10 : 5,
                  }}
                />
                {route.name === 'Notifications' && (
                  <NotificationBadge 
                    size="small" 
                    color="#ff4444"
                    style={{ top: -8, right: -8 }}
                  />
                )}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Super Gen3 Neural Connection Indicator */}
          {isActive && (
            <Animated.View
              style={[
                styles.neuralIndicator, 
                { 
                  borderColor: route.color,
                  opacity: neuralPulse,
                  transform: [{ scale: neuralPulse }]
                }
              ]}
            />
          )}

          {/* Consciousness Level Indicator */}
          <Animated.View
            style={[
              styles.consciousnessIndicator,
              {
                backgroundColor: route.color,
                opacity: consciousnessFlow,
                transform: [{ scale: consciousnessFlow }]
              }
            ]}
          />

          {/* Super Gen3 Quantum Label */}
          <Text style={[
            styles.gen3Label, 
            { 
              color: isActive ? '#FFFFFF' : route.color,
              fontSize: getTabLabelSize(),
              marginTop: getHolographicRingSize() * 0.08, // Reduced margin
              textShadowColor: route.color,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: isActive ? 8 : 4,
            }
          ]}>
            {route.label}
          </Text>

          {/* Consciousness Level Display - Removed for cleaner UI */}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.gen3NavContainer}>
      <View style={styles.gen3TabsContainer}>
        {routes.map(renderSuperGen3Tab)}
      </View>
    </View>
  );
};

// Quantum Screen Transition Component
const QuantumTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const quantumParticles = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(quantumParticles, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Quantum particle overlay */}
      <Animated.View
        style={[
          styles.quantumOverlay,
          {
            opacity: quantumParticles.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.3, 0],
            }),
          },
        ]}
      />
      {children}
    </Animated.View>
  );
};





const TabNavigator = () => {
  const { user } = useAuth();
  const { stopAllVideos } = useVideo();
  const [activeTab, setActiveTab] = useState('Home');
  const [quantumFieldActive, setQuantumFieldActive] = useState(true);

  // Super Gen3 Quantum Tab Routes with Consciousness Levels
  const gen3Routes = [
    { 
      name: 'Home', 
      icon: 'planet', 
      label: 'Quantum Feed', 
      color: '#00D4FF',
      consciousnessLevel: 95,
              component: isIPad() ? IPadFeedScreen : Gen2FeedScreen
    },
    { 
      name: 'Explore', 
      icon: 'telescope', 
      label: 'Neural Explore', 
      color: '#9C27B0',
      consciousnessLevel: 88,
      component: Gen3ExploreScreen
    },
    { 
      name: 'Create', 
      icon: 'add-circle', 
      label: 'Quantum Create', 
      color: '#FF6B35',
      consciousnessLevel: 92,
      component: Gen3CreatePostScreen
    },

    { 
      name: 'Notifications', 
      icon: 'notifications', 
      label: 'Neural Alerts', 
      color: '#4CAF50',
      consciousnessLevel: 87,
      component: NotificationScreen
    },
    { 
      name: 'Profile', 
      icon: 'person', 
      label: 'Quantum Profile', 
      color: '#FFD700',
      consciousnessLevel: 90,
      component: ProfileScreen
    },
    { 
      name: 'Menu', 
      icon: 'menu', 
      label: 'Gen4 Menu', 
      color: '#FF6B9D',
      component: Gen4MenuScreen
    },
  ];

  const handleTabPress = (tabName: string) => {
    console.log('🎯 [TAB PRESS] Tab pressed:', tabName);
    console.log('🎯 [TAB PRESS] Current active tab:', activeTab);
    
    // Ensure tab name is valid
    if (!gen3Routes.find(r => r.name === tabName)) {
      console.log('🎯 [TAB PRESS] Invalid tab name:', tabName);
      return;
    }
    
    setActiveTab(tabName);
    stopAllVideos();
    
    // Super Gen3 Quantum Tab Navigation Feedback
    const route = gen3Routes.find(r => r.name === tabName);
    const consciousnessLevel = route?.consciousnessLevel || 85;
    
    console.log('🌌 [SUPER GEN3] Quantum tab navigation activated:', tabName);
    console.log('🧠 [SUPER GEN3] Consciousness level:', consciousnessLevel + '%');
    console.log('⚡ [SUPER GEN3] Neural sync established with', tabName);
    
    // Quantum feedback vibration
    if (Platform.OS === 'ios') {
      // iOS haptic feedback
      const { Vibration } = require('react-native');
      Vibration.vibrate(50);
    } else {
      // Android vibration
      const { Vibration } = require('react-native');
      Vibration.vibrate([0, 30, 20, 30]);
    }
  };

  // Minimal Tab Bar with Only Essential Tabs
  const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    console.log('🎯 [CUSTOM TAB BAR] Rendering tab bar');
    console.log('🎯 [CUSTOM TAB BAR] Current state:', state?.routes?.map(r => r.name));
    console.log('🎯 [CUSTOM TAB BAR] Active tab:', activeTab);
    
    return (
      <View style={styles.gen3TabBarContainer}>
        {/* Holographic Navigation - Only Tabs */}
        <SuperGen3QuantumNav
          activeTab={activeTab}
          onTabPress={(tab) => {
            console.log('🎯 [CUSTOM TAB BAR] Tab pressed in SuperGen3QuantumNav:', tab);
            const route = gen3Routes.find(r => r.name === tab);
            if (route) {
              console.log('🎯 [CUSTOM TAB BAR] Found route, navigating to:', tab);
              handleTabPress(tab);
              navigation.navigate(tab);
            } else {
              console.log('🎯 [CUSTOM TAB BAR] Route not found for tab:', tab);
            }
          }}
          routes={gen3Routes}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Super Gen3 Quantum Field Background */}
      {quantumFieldActive && (
        <View style={styles.quantumFieldBackground}>
          <LinearGradient
            colors={['#000011', '#001122', '#000011', '#002233']}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Quantum Particle Overlay */}
          <View style={styles.quantumParticleOverlay}>
            <LinearGradient
              colors={['rgba(0, 212, 255, 0.1)', 'rgba(156, 39, 176, 0.1)', 'rgba(255, 107, 53, 0.1)']}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        </View>
      )}

      <Tab.Navigator
        id={undefined}
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ 
          headerShown: false,
          // Enhanced tab screen options for better touch response
          tabBarHideOnKeyboard: false,
          tabBarVisibilityAnimationConfig: {
            show: { animation: 'timing', config: { duration: 200 } },
            hide: { animation: 'timing', config: { duration: 200 } }
          },
          // Android-specific improvements
          ...(Platform.OS === 'android' && {
            tabBarStyle: {
              elevation: 15,
              shadowOpacity: 0.6,
              shadowRadius: 8,
            }
          })
        }}
        screenListeners={{
          tabPress: (e) => {
            console.log('🎯 [TAB] Tab press event:', e.target);
          },
          focus: (e) => {
            console.log('🎯 [TAB] Tab focused:', e.target);
          }
        }}
      >
        {gen3Routes.map((route) => (
          <Tab.Screen
            name={route.name}
            key={route.name}
            component={route.component}
            options={{
              // Enhanced tab options for better performance
              lazy: false, // Disable lazy loading for better touch response
            }}
          />
        ))}
      </Tab.Navigator>
      
      {/* Eye Control removed from feed - users can use it in backend with camera */}
      
      {/* Debug Login Button - Temporary for testing */}
      {/* <DebugLoginButton /> */}
      
      {/* Debug Touch Info - Temporary for S20FE testing */}
      {__DEV__ && (
        <View style={styles.debugTouchInfo}>
          <Text style={styles.debugTouchText}>Active Tab: {activeTab}</Text>
          <Text style={styles.debugTouchText}>Platform: {Platform.OS}</Text>
          <Text style={styles.debugTouchText}>Screen: {width}x{height}</Text>
        </View>
      )}
    </View>
  );
};

export const AppNavigator = () => {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const user = auth?.user;
  // Eye control state removed - users can use eye control in backend with camera

  console.log('🔐 [NAVIGATION] AppNavigator render - isAuthenticated:', isAuthenticated);


  // Navigation logic:
  // 1. If not authenticated → show AuthScreen
  // 2. If authenticated but profile not complete → show ProfileSetupScreen
  // 3. If authenticated and profile complete → show MainTabs
  
  const shouldShowAuth = !isAuthenticated;
  const shouldShowProfileSetup = isAuthenticated && !user?.profileSetupComplete;
  
  console.log('🔐 [NAVIGATION] Navigation state:', { 
    isAuthenticated, 
    profileSetupComplete: user?.profileSetupComplete,
    shouldShowAuth,
    shouldShowProfileSetup 
  });
  
  if (shouldShowAuth) {
    console.log('🔐 [NAVIGATION] Showing AuthScreen (user not authenticated)');
    return (
      <NavigationContainer
        onStateChange={(state) => {
          console.log('🔐 [NAVIGATION] Auth state changed:', state?.routes?.map(r => r.name));
        }}
        onReady={() => {
          console.log('🔐 [NAVIGATION] Auth navigation container ready');
        }}
      >
        <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }} initialRouteName="Auth">
          <Stack.Screen name="Gen3Auth" component={Gen3AuthScreen} />
          <Stack.Screen name="LogoCustomization" component={LogoCustomizationScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
          <Stack.Screen name="ProfileSetup" component={SuperGen3V2ProfileSetupScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="TestFeed" component={TestFeedScreen} />
          <Stack.Screen name="Gen3Feed" component={Gen3FeedScreen} />
          <Stack.Screen name="MainTabs" component={TabNavigator} />

        <Stack.Screen name="UFOWatcher" component={UFOWatcherScreen} />
        <Stack.Screen name="UFOWatcherMenu" component={UFOWatcherMenuScreen} />
        <Stack.Screen name="LumaVR" component={LumaVRScreen} />
        <Stack.Screen name="VRUniverse" component={VRUniverseScreen} />
        <Stack.Screen name="VRRequirements" component={VRRequirementsScreen} />
        <Stack.Screen name="LumaVREnvironment" component={LumaVREnvironmentScreen} />
        <Stack.Screen name="LumaVRGaming" component={LumaVRGamingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (shouldShowProfileSetup) {
    console.log('🔐 [NAVIGATION] Showing ProfileSetupScreen (user authenticated but profile not complete)');
    return (
      <NavigationContainer
        onStateChange={(state) => {
          console.log('🔐 [NAVIGATION] Profile setup state changed:', state?.routes?.map(r => r.name));
        }}
        onReady={() => {
          console.log('🔐 [NAVIGATION] Profile setup navigation container ready');
        }}
      >
        <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }} initialRouteName="ProfileSetup">
          <Stack.Screen name="ProfileSetup" component={SuperGen3V2ProfileSetupScreen} />
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  console.log('🔐 [NAVIGATION] Showing Revolutionary Main app (user authenticated)');
  console.log('🔐 [NAVIGATION] User details:', { username: user?.username, profileSetupComplete: user?.profileSetupComplete });
  console.log('🚀 [REVOLUTIONARY] Loading 100x faster navigation system');
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        onStateChange={(state) => {
          console.log('🔐 [NAVIGATION] State changed:', state?.routes?.map(r => r.name));
        }}
        onReady={() => {
          console.log('🔐 [NAVIGATION] Navigation container ready');
          console.log('🚀 [REVOLUTIONARY] Quantum navigation system activated');
        }}
      >
      <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={RevolutionaryTabNavigator} />
        <Stack.Screen name="Gen4Tabs" component={Gen4TabNavigator} />
        <Stack.Screen name="TestFeed" component={TestFeedScreen} />

        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        <Stack.Screen name="Menu" component={Gen3UltraRevolutionaryMenuScreen} />
        <Stack.Screen name="CreatorTools" component={CreatorToolsScreen} />
        <Stack.Screen name="ContentStudio" component={ContentStudioScreen} />
        <Stack.Screen name="CreatorAnalytics" component={CreatorAnalyticsScreen} />
        <Stack.Screen name="CreatorMonetization" component={CreatorMonetizationScreen} />
        <Stack.Screen name="CreatorCollaboration" component={CreatorCollaborationScreen} />
        <Stack.Screen name="LumaBank" component={LumaBankScreen} />
        <Stack.Screen name="LumaShop" component={LumaShopScreen} />
        <Stack.Screen name="LumaLovedOnes" component={LumaLovedOnesScreen} />
        <Stack.Screen name="LumaInvestments" component={LumaInvestmentsScreen} />
        <Stack.Screen name="QuantumConsciousnessMarketplace" component={QuantumConsciousnessMarketplaceScreen} />
        <Stack.Screen name="LumaMusic" component={LumaMusicScreen} />
        <Stack.Screen name="LumaRecords" component={LumaRecordsScreen} />
        <Stack.Screen name="LumaCloudGaming" component={LumaCloudGamingScreen} />
        <Stack.Screen name="Gen3RevolutionaryMenu" component={Gen3RevolutionaryMenuScreen} />
        <Stack.Screen name="Gen3UltraRevolutionaryMenu" component={Gen3UltraRevolutionaryMenuScreen} />
        <Stack.Screen name="SuperGen3Menu" component={Gen4MenuScreen} />
        <Stack.Screen name="OptimizedMenu" component={OptimizedMenuScreen} />

        <Stack.Screen name="ApplePayGooglePay" component={ApplePayGooglePayScreen} />
        <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
        <Stack.Screen name="SystemRequirements" component={SystemRequirements} />
        <Stack.Screen name="Gen3SystemRequirements" component={Gen3SystemRequirementsScreen} />
        <Stack.Screen name="AboutGen1Update" component={AboutGen1UpdateScreen} />
        {/* NSFWControlPanel removed for 18+ only app */}
        <Stack.Screen name="NSFWContentSettings" component={NSFWContentSettingsScreen} />
        <Stack.Screen name="MonetizationDashboard" component={MonetizationDashboard} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="SubscriptionContent" component={SubscriptionContentScreen} />
        <Stack.Screen name="Todo" component={TodoScreen} />
        <Stack.Screen name="Futures" component={FuturesScreen} />

        <Stack.Screen name="Friends" component={FriendsScreen} />
        <Stack.Screen name="Saved" component={SavedScreen} />
        <Stack.Screen name="Display" component={DisplayScreen} />
        <Stack.Screen name="Gen3Display" component={Gen3DisplayScreen} />
        <Stack.Screen name="Gen3Settings" component={Gen3SettingsScreen} />
        <Stack.Screen name="Gen3Profile" component={Gen3ProfileScreen} />
        <Stack.Screen name="SafetyContent" component={SafetyContentScreen} />
        <Stack.Screen name="Reels" component={ReelsScreen} />
        <Stack.Screen name="Gen1Settings" component={Gen1SettingsScreen} />

        <Stack.Screen name="KidsAccount" component={KidsAccountScreen} />
        <Stack.Screen name="Events" component={EventsScreen} />
        <Stack.Screen name="Pages" component={PagesScreen} />
        <Stack.Screen name="Groups" component={GroupsScreen} />

        <Stack.Screen name="DeviceRequirements" component={DeviceRequirementsScreen} />
        <Stack.Screen name="Gen3GameEnginePreview" component={Gen3GameEnginePreview} />
        <Stack.Screen name="MobileGameStudio" component={MobileGameStudioScreen} />
        <Stack.Screen name="AndroidGameBuilder" component={AndroidGameBuilderScreen} />
        <Stack.Screen name="IOSGameBuilder" component={IOSGameBuilderScreen} />
        <Stack.Screen name="AIAssetGenerator" component={AIAssetGeneratorScreen} />
        <Stack.Screen name="3DWorldBuilder" component={ThreeDWorldBuilderScreen} />
        <Stack.Screen name="VisualScripting" component={VisualScriptingScreen} />
        <Stack.Screen name="MultiplayerEngine" component={MultiplayerEngineScreen} />
        <Stack.Screen name="GameAnalytics" component={GameAnalyticsScreen} />
        <Stack.Screen name="CrossPlatformDeploy" component={CrossPlatformDeployScreen} />
        <Stack.Screen name="GameTemplates" component={GameTemplatesScreen} />
        <Stack.Screen name="GameMonetization" component={GameMonetizationScreen} />
        <Stack.Screen name="GameAssetStore" component={GameAssetStoreScreen} />
        <Stack.Screen name="GameTesting" component={GameTestingScreen} />
        <Stack.Screen name="ARVRGames" component={ARVRGamesScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />

        <Stack.Screen name="OptimizedGen2Menu" component={OptimizedGen2MenuScreen} />
        <Stack.Screen name="OptimizedGen2AIHologram" component={OptimizedGen2AIHologramScreen} />
        <Stack.Screen name="UniversalGen2AIHologram" component={UniversalGen2AIHologramScreen} />
        <Stack.Screen name="LumaBRGame" component={LumaBRGameScreen} />
        <Stack.Screen name="LumaAIGen3" component={LumaAIGen3Screen} />

        <Stack.Screen name="CustomerService" component={CustomerServiceScreen} />
                    <Stack.Screen name="MusicVideoStudio" component={MusicVideoStudioScreen} />
            <Stack.Screen name="MusicUpload" component={MusicUploadScreen} />
            <Stack.Screen name="CacheManagement" component={CacheManagementScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="AnimationSettings" component={AnimationSettingsScreen} />
        <Stack.Screen name="AIFanBase" component={AIFanBaseScreen} />
        <Stack.Screen name="AICharacterGeneration" component={AICharacterGenerationScreen} />
        <Stack.Screen name="LumaNetwork" component={LumaNetworkScreen} />
        {/* LumaNetworkAuth removed - integrated with main auth */}

        <Stack.Screen name="Gen2AI" component={Gen2AIScreen} />
        <Stack.Screen name="Gen2ComingSoon" component={Gen2ComingSoonScreen} />
        <Stack.Screen name="Gen2AIHologram" component={Gen2AIHologramScreen} />
        <Stack.Screen name="Gen2QuantumMessaging" component={Gen2QuantumMessagingScreen} />
        <Stack.Screen name="Gen2NeuralInterface" component={Gen2NeuralInterfaceScreen} />
        <Stack.Screen name="Gen2OTAUpdate" component={Gen2OTAUpdateScreen} />
        <Stack.Screen name="Gen2Dashboard" component={Gen2DashboardScreen} />
        <Stack.Screen name="Gen2Explore" component={Gen2ExploreScreen} />
        <Stack.Screen name="Gen2Notifications" component={Gen2NotificationsScreen} />
        <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboardScreen} />
        <Stack.Screen name="AICreatorTools" component={AICreatorToolsScreen} />
        <Stack.Screen name="Gen1Messenger" component={Gen1MessengerScreen} />
        <Stack.Screen name="Gen1MessengerV2" component={Gen1MessengerV2Screen} />
        <Stack.Screen name="NewChat" component={NewChatScreen} />

        <Stack.Screen name="ChatDetails" component={ChatDetailsScreen} />
        <Stack.Screen name="ComprehensiveSettings" component={ComprehensiveSettingsScreen} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
        <Stack.Screen name="LumaDiabetesDetector" component={LumaDiabetesDetectorScreen} />
        <Stack.Screen name="GamingHub" component={GamingHubScreen} />
        <Stack.Screen name="LumaCasino" component={LumaCasinoScreen} />
        <Stack.Screen name="SuperGen3Bank" component={SuperGen3BankScreen} />
        <Stack.Screen name="FitnessTracker" component={FitnessTrackerScreen} />
        <Stack.Screen name="LearningHub" component={LearningHubScreen} />
        <Stack.Screen name="Communities" component={CommunitiesScreen} />
        <Stack.Screen name="MovieTheater" component={MovieTheaterScreen} />
        <Stack.Screen name="FollowerAnalytics" component={FollowerAnalyticsScreen} />
        <Stack.Screen name="FeatureBuilder" component={FeatureBuilderScreen} />
        <Stack.Screen name="APIDocumentation" component={APIDocumentationScreen} />
        <Stack.Screen name="AIFeatureGenerator" component={AIFeatureGeneratorScreen} />
        <Stack.Screen name="Gen3Live" component={Gen3LiveScreen} />
        
        {/* Gen3 Screen Routes - Revolutionary UI */}
        <Stack.Screen name="Gen3Feed" component={Gen3FeedScreen} />
        <Stack.Screen name="Gen3Explore" component={Gen3ExploreScreen} />
        <Stack.Screen name="Gen3Notifications" component={Gen3NotificationsScreen} />
        <Stack.Screen name="Gen3CreatePost" component={Gen3CreatePostScreen} />
        <Stack.Screen name="Gen3Menu" component={OptimizedMenuScreen} />
        <Stack.Screen name="Gen3AIHelp" component={Gen3AIHelpScreen} />
        
        <Stack.Screen name="AIContentCreator" component={AIContentCreatorScreen} />
        <Stack.Screen name="QuantumTech" component={QuantumTechScreen} />
        <Stack.Screen name="Metaverse" component={MetaverseScreen} />
        <Stack.Screen name="NeuralInterface" component={NeuralInterfaceScreen} />
        <Stack.Screen name="TimeTravel" component={TimeTravelScreen} />
        <Stack.Screen name="Teleportation" component={TeleportationScreen} />
        <Stack.Screen name="LumaPolice" component={LumaPoliceScreen} />
        <Stack.Screen name="LumaLegal" component={LumaLegalScreen} />
        <Stack.Screen name="LumaQuantum" component={LumaQuantumScreen} />
        <Stack.Screen name="LumaBestMode" component={LumaBestModeScreen} />
        <Stack.Screen name="LumaMusicUpload" component={LumaMusicUploadScreen} />
        <Stack.Screen name="MusicJobApplication" component={MusicJobApplicationScreen} />
        <Stack.Screen name="LumaJobs" component={LumaJobsScreen} />
        <Stack.Screen name="Apply" component={ApplyScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="LumaPoliceStatus" component={LumaPoliceStatusScreen} />
        <Stack.Screen name="UpdateScreen" component={UpdateScreen} />

        <Stack.Screen name="Gen2Feed" component={isIPad() ? IPadFeedScreen : Gen2FeedScreen} />
        <Stack.Screen name="iPadFeed" component={IPadFeedScreen} />
        <Stack.Screen name="NewPost" component={NewPostScreen} />

        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="LumaCoding" component={LumaCodingScreen} />
        <Stack.Screen name="JobApplications" component={JobApplicationsScreen} />
        <Stack.Screen name="TestAccount" component={TestAccountScreen} />
        <Stack.Screen name="LumaAI" component={ComingSoonScreen} />
        <Stack.Screen name="TargetScreen" component={ComingSoonScreen} />
        <Stack.Screen name="Performance" component={ComingSoonScreen} />
        <Stack.Screen name="FanAnalytics" component={ComingSoonScreen} />
        <Stack.Screen name="ContentCalendar" component={ComingSoonScreen} />
        <Stack.Screen name="DesignStudio" component={ComingSoonScreen} />
        <Stack.Screen name="WelcomeBonus" component={ComingSoonScreen} />
        <Stack.Screen name="InvestmentTools" component={ComingSoonScreen} />
        <Stack.Screen name="DigitalWallet" component={ComingSoonScreen} />
        <Stack.Screen name="BabyAI" component={ComingSoonScreen} />
        <Stack.Screen name="AISafetyDashboard" component={ComingSoonScreen} />
        <Stack.Screen name="AIForgotPassword" component={ComingSoonScreen} />
        <Stack.Screen name="FeatureLibrary" component={ComingSoonScreen} />
        <Stack.Screen name="TopFeatures" component={ComingSoonScreen} />
        <Stack.Screen name="DeveloperCommunity" component={ComingSoonScreen} />
        <Stack.Screen name="CodingTutorials" component={ComingSoonScreen} />
        <Stack.Screen name="SubmitFeature" component={ComingSoonScreen} />
        <Stack.Screen name="MySubmissions" component={ComingSoonScreen} />
        <Stack.Screen name="FeaturedDevelopers" component={ComingSoonScreen} />
        <Stack.Screen name="FeatureAnalytics" component={ComingSoonScreen} />
        <Stack.Screen name="FeatureRewards" component={ComingSoonScreen} />
        <Stack.Screen name="QuantumProcessing" component={QuantumProcessingScreen} />
        <Stack.Screen name="NeuralNetworks" component={NeuralNetworksScreen} />
        <Stack.Screen name="RealityManipulation" component={RealityManipulationScreen} />
        <Stack.Screen name="TimeControl" component={TimeControlScreen} />
        <Stack.Screen name="DimensionalControl" component={DimensionalControlScreen} />
        <Stack.Screen name="UFOWatcherGen2" component={UFOWatcherGen2Screen} />
        <Stack.Screen name="LumaTimeMachine" component={LumaTimeMachineScreen} />
        <Stack.Screen name="ConsciousnessExpansion" component={ConsciousnessExpansionScreen} />
        <Stack.Screen name="CosmicIntelligence" component={CosmicIntelligenceScreen} />
        <Stack.Screen name="InfiniteConsciousness" component={InfiniteConsciousnessScreen} />
        <Stack.Screen name="UniversalKnowledge" component={UniversalKnowledgeScreen} />
        <Stack.Screen name="Omnipotence" component={OmnipotenceScreen} />
        <Stack.Screen name="LumaAIRevolutionary" component={LumaAIRevolutionaryScreen} />

        {/* Add missing investment routes */}
        <Stack.Screen name="FeatureInvestment" component={ComingSoonScreen} />
        <Stack.Screen name="BusinessPartnership" component={ComingSoonScreen} />
        <Stack.Screen name="PremiumInvestment" component={ComingSoonScreen} />
        <Stack.Screen name="SuperGen3V2" component={SuperGen3V2Screen} />
        <Stack.Screen name="FriendsFollowers" component={FriendsFollowersScreen} />
        <Stack.Screen name="Gen3V3Profile" component={Gen3V3ProfileScreen} />

      </Stack.Navigator>
    </NavigationContainer>
    </View>
  );
};

// Revolutionary Gen3 Styles - Never Seen Before on Mobile
const styles = StyleSheet.create({
  // Gen3 Navigation Container
  gen3NavContainer: {
    height: getTabBarHeight(),
    position: 'relative',
    overflow: 'hidden',
  },

  // Updated Holographic Tab Styles for 6 Tabs - Perfect Screen Fit with Enhanced Touch
  gen3Tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleVertical(4), // Ultra-compact padding (reduced)
    paddingHorizontal: scaleSize(1), // Ultra-compact horizontal padding (reduced)
    flex: 1, // Distribute evenly across screen width
    maxWidth: width / 6, // Ensure it doesn't exceed 1/6 of screen width
    marginHorizontal: 0.5, // Minimal gap between tabs (reduced)
    // Enhanced touch handling for Android
    minWidth: 35, // Ultra-minimal touch target width (reduced)
    minHeight: Math.max(35, getTabBarHeight() * 0.9), // Ultra-minimal touch target height (reduced)
  },

  holographicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  holographicGlow: {
    position: 'absolute',
    opacity: 0.3,
  },

  holographicRing: {
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

  neuralIndicator: {
    position: 'absolute',
    top: -(getHolographicRingSize() * 0.12), // Reduced positioning
    left: -(getHolographicRingSize() * 0.12), // Reduced positioning
    width: getHolographicRingSize() * 1.2, // Reduced size
    height: getHolographicRingSize() * 1.2, // Reduced size
    borderRadius: getHolographicRingSize() * 0.6, // Reduced radius
    borderWidth: Math.max(1, getHolographicRingSize() * 0.015), // Reduced border width
    borderStyle: 'dashed',
    opacity: 0.6, // Reduced opacity
  },

  consciousnessIndicator: {
    position: 'absolute',
    top: getHolographicRingSize() * 0.8,
    right: getHolographicRingSize() * 0.1,
    width: getHolographicRingSize() * 0.2,
    height: getHolographicRingSize() * 0.2,
    borderRadius: getHolographicRingSize() * 0.1,
    opacity: 0.8,
  },

  consciousnessLevel: {
    fontWeight: '600',
    textAlign: 'center',
    textShadowRadius: 3,
    opacity: 0.9,
  },

  gen3Label: {
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowRadius: 5,
  },

  gen3TabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: width * 0.004, // Reduced horizontal padding
    paddingVertical: height * 0.001, // Reduced vertical padding
    position: 'relative',
    zIndex: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: width * 0.003, // Reduced gap
  },

  gen3TabBarContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingBottom: Platform.OS === 'ios' ? height * 0.008 : height * 0.006, // Reduced padding
    paddingTop: Platform.OS === 'android' ? height * 0.001 : height * 0.003, // Minimal padding for Android
    position: 'relative',
    height: getTabBarHeight(),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 }, // Reduced shadow
    shadowOpacity: 0.2, // Reduced shadow opacity
    shadowRadius: 2, // Reduced shadow radius
    elevation: 8, // Reduced elevation
    // Enhanced for better touch handling
    zIndex: 1000,
    // Android-specific touch improvements
    ...(Platform.OS === 'android' && {
      elevation: 10, // Reduced elevation
      shadowOpacity: 0.3, // Reduced shadow opacity
      shadowRadius: 4, // Reduced shadow radius
    }),
  },

  quantumOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00D4FF',
    opacity: 0.1,
  },

  quantumFieldBackground: {
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
    opacity: 0.3,
  },

  // Eye control button styles removed - users can use eye control in backend with camera
  
  // Additional styles for the simplified version
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  instruction: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: '#00ff00',
    fontSize: 12,
    marginBottom: 2,
  },
  debugTouchInfo: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 9999,
  },
  debugTouchText: {
    color: '#00ff00',
    fontSize: 10,
    marginBottom: 2,
  },
});

export default AppNavigator; 