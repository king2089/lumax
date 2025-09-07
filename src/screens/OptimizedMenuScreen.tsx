import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Modal,
  Alert,
  Dimensions,
  Platform,
  FlatList,
  InteractionManager,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useMood } from '../context/MoodContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { DefaultAvatar } from '../components/DefaultAvatar';
import { MoodRayGlow } from '../components/MoodRayGlow';
import AutoUpdateService from '../services/AutoUpdateService';
import StatusService, { StatusData } from '../services/StatusService';
import GlobalLogo from '../components/GlobalLogo';
import LumaNetworkService from '../services/LumaNetworkService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ANIMATION_CONFIG } from '../utils/animationConfig';

const { width, height } = Dimensions.get('window');

// Platform-specific optimizations
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Responsive scaling functions with platform optimization
const scale = (size: number) => {
  const baseSize = isIOS ? 375 : 360; // iOS uses 375, Android uses 360
  return Math.min(width, height) / baseSize * size;
};

const scaleVertical = (size: number) => {
  const baseHeight = isIOS ? 812 : 800; // iOS uses 812, Android uses 800
  return height / baseHeight * size;
};

const scaleHorizontal = (size: number) => {
  const baseWidth = isIOS ? 375 : 360;
  return width / baseWidth * size;
};

// Platform-specific performance optimizations
const FLATLIST_CONFIG = {
  removeClippedSubviews: true,
  maxToRenderPerBatch: isAndroid ? 5 : 10, // Android needs fewer items
  windowSize: isAndroid ? 5 : 10,
  initialNumToRender: isAndroid ? 8 : 12,
  updateCellsBatchingPeriod: isAndroid ? 50 : 30,
  onEndReachedThreshold: 0.5,
};

// Modern 2.0 menu categories with enhanced visual design
const MENU_CATEGORIES = [
  {
    id: 'luma-core',
    title: 'Luma Core',
    subtitle: 'Essential features',
    icon: 'rocket',
    color: '#FF2E63',
    gradient: ['#FF2E63', '#FF6B9D'],
    items: [
      { icon: 'person', label: 'Profile', route: 'Gen3Profile', description: 'Advanced consciousness mapping', badge: '2.0' },
      { icon: 'people', label: 'Friends', route: 'Friends', description: 'Quantum connections', badge: '2.0' },
      { icon: 'notifications', label: 'Notifications', route: 'Gen3Notifications', description: 'Smart alerts', badge: '2.0' },
      { icon: 'chatbubbles', label: 'Messenger', route: 'Gen1Messenger', description: 'AI-powered chat', badge: '2.0' },
      { icon: 'videocam', label: 'Reels', route: 'Reels', description: 'Holographic content', badge: '2.0' },
      { icon: 'create', label: 'Create', route: 'Gen3CreatePost', description: 'AI content creation', badge: '2.0' },
      { icon: 'compass', label: 'Explore', route: 'Gen3Explore', description: 'Discover content', badge: '2.0' },
      { icon: 'settings', label: 'Settings', route: 'Gen3Settings', description: 'Advanced config', badge: '2.0' },
    ]
  },
  {
    id: 'luma-ai',
    title: 'Luma AI',
    subtitle: 'Intelligent features',
    icon: 'brain',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#E1BEE7'],
    items: [
      { icon: 'brain', label: 'Character Creation', route: 'AICharacterGeneration', description: 'Create AI personalities', badge: '2.0' },
      { icon: 'chatbubbles', label: 'Chat Assistant', route: 'AIChatAssistant', description: 'Intelligent conversations', badge: '2.0' },
      { icon: 'bulb', label: 'Content Generator', route: 'AIContentGenerator', description: 'Generate posts & stories', badge: '2.0' },
      { icon: 'image', label: 'Image Generation', route: 'AIImageGeneration', description: 'Create AI artwork', badge: '2.0' },
      { icon: 'videocam', label: 'Video Generation', route: 'AIVideoGeneration', description: 'AI videos & animations', badge: '2.0' },
      { icon: 'musical-notes', label: 'Music Composer', route: 'AIMusicComposer', description: 'Original AI music', badge: '2.0' },
      { icon: 'analytics', label: 'Analytics Dashboard', route: 'AIAnalyticsDashboard', description: 'AI-powered insights', badge: '2.0' },
      { icon: 'people', label: 'Luma Network', route: 'LumaNetwork', description: 'Connect with community', badge: 'NEW' },
      { icon: 'cube', label: 'AI Hologram', route: 'Gen2AIHologram', description: '3D AI conversations', badge: 'BETA' },
      { icon: 'infinite', label: 'Quantum Messaging', route: 'Gen2QuantumMessaging', description: 'Cross-universe chat', badge: 'BETA' },
    ]
  },
  {
    id: 'luma-creator',
    title: 'Creator Tools',
    subtitle: 'Professional creation',
    icon: 'videocam',
    color: '#667eea',
    gradient: ['#667eea', '#764ba2'],
    items: [
      { icon: 'grid', label: 'Creator Tools', route: 'CreatorTools', description: 'Advanced creator tools', badge: '2.0' },
      { icon: 'sparkles', label: 'AI Creator Tools', route: 'AICreatorTools', description: 'AI-powered creation', badge: '2.0' },
      { icon: 'grid', label: 'Content Studio', route: 'ContentStudio', description: 'Professional creation', badge: '2.0' },
      { icon: 'analytics', label: 'Creator Analytics', route: 'CreatorAnalytics', description: 'Performance tracking', badge: '2.0' },
      { icon: 'cash', label: 'Creator Monetization', route: 'CreatorMonetization', description: 'Monetization tools', badge: '2.0' },
      { icon: 'people', label: 'Creator Collaboration', route: 'CreatorCollaboration', description: 'Team collaboration', badge: '2.0' },
      { icon: 'videocam', label: 'Music Video Studio', route: 'MusicVideoStudio', description: 'Professional videos', badge: '2.0' },
      { icon: 'musical-notes', label: 'Music Upload', route: 'MusicUpload', description: 'Upload & distribute', badge: '2.0' },
    ]
  },
  {
    id: 'luma-financial',
    title: '💰 Luma Financial',
    icon: 'card',
    color: '#FFD700',
    items: [
      { icon: 'card', label: 'Luma Bank', route: 'LumaBank', description: 'Digital banking and payments' },
      { icon: 'bag', label: 'Luma Shop', route: 'LumaShop', description: 'Digital marketplace' },
      { icon: 'heart', label: 'Luma Loved Ones', route: 'LumaLovedOnes', description: 'Family financial management' },
      { icon: 'musical-notes', label: 'Luma Records', route: 'LumaRecords', description: 'Music distribution platform' },
      { icon: 'musical-notes', label: 'Luma Music', route: 'LumaMusic', description: 'Music streaming service' },
      { icon: 'trending-up', label: 'Futures Trading', route: 'Futures', description: 'Advanced trading platform' },
      { icon: 'card', label: 'Apple Pay/Google Pay', route: 'ApplePayGooglePay', description: 'Mobile payment integration' },
      { icon: 'cash', label: 'Monetization Dashboard', route: 'MonetizationDashboard', description: 'Revenue tracking and analytics' },
    ]
  },
  {
    id: 'luma-gaming',
    title: '🎮 Luma Gaming',
    icon: 'game-controller',
    color: '#9C27B0',
    items: [
      { icon: 'cloud', label: 'Luma Cloud Gaming', route: 'LumaCloudGaming', description: 'Stream games from the cloud', badge: 'NEW' },
      { icon: 'game-controller', label: 'Luma BR Game', route: 'LumaBRGame', description: 'Battle royale gaming' },
      { icon: 'game-controller', label: 'Luma Game Engine', route: 'LumaGameEngine', description: 'Game development platform' },
      { icon: 'game-controller', label: 'Luma Game Engine Preview', route: 'Gen3GameEnginePreview', description: 'Next-gen gaming technology' },
      { icon: 'trophy', label: 'Gaming Hub', route: 'GamingHub', description: 'Gaming community and tournaments' },
      { icon: 'people', label: 'Gaming Communities', route: 'Communities', description: 'Gaming communities' },
    ]
  },
  {
    id: 'luma-education',
    title: '📚 Luma Education',
    icon: 'school',
    color: '#4CAF50',
    items: [
      { icon: 'school', label: 'Learning Hub', route: 'LearningHub', description: 'Educational content and courses' },
      { icon: 'code', label: 'Luma Coding', route: 'LumaCoding', description: 'Programming education' },
      { icon: 'library', label: 'Luma Learning', route: 'LumaLearning', description: 'Advanced learning platform' },
      { icon: 'bulb', label: 'Tutorials', route: 'Tutorials', description: 'Step-by-step guides' },
      { icon: 'people', label: 'Mentorship', route: 'Mentorship', description: 'Find mentors and experts' },
      { icon: 'certificate', label: 'Certifications', route: 'Certifications', description: 'Professional certifications' },
    ]
  },
  {
    id: 'luma-community',
    title: '👥 Luma Community',
    icon: 'people',
    color: '#FF6B6B',
    items: [
      { icon: 'people', label: 'Communities', route: 'Communities', description: 'Join communities' },
      { icon: 'people', label: 'Groups', route: 'Groups', description: 'Group discussions' },
      { icon: 'people', label: 'Pages', route: 'Pages', description: 'Business and creator pages' },
      { icon: 'calendar', label: 'Events', route: 'Events', description: 'Community events' },
      { icon: 'briefcase', label: 'Job Applications', route: 'JobApplications', description: 'Career opportunities' },
      { icon: 'briefcase', label: 'Job Postings', route: 'JobPostings', description: 'Post job opportunities' },
      { icon: 'briefcase', label: 'Hiring Workflow', route: 'HiringWorkflow', description: 'Streamlined hiring process' },
      { icon: 'briefcase', label: 'Contractor Agreements', route: 'ContractorAgreements', description: 'Freelancer contracts' },
    ]
  },
  {
    id: 'luma-entertainment',
    title: 'Entertainment',
    subtitle: 'Fun & engagement',
    icon: 'film',
    color: '#FF9800',
    gradient: ['#FF9800', '#FFB74D'],
    items: [
      { icon: 'videocam', label: 'Live Streaming', route: 'LiveStreaming', description: 'Go live & interact', badge: '2.0' },
      { icon: 'videocam', label: 'Movie Theater', route: 'Gen2MovieTheater', description: 'Virtual cinema', badge: '2.0' },
      { icon: 'radio', label: 'Podcasts', route: 'Podcasts', description: 'Audio content', badge: '2.0' },
      { icon: 'heart', label: 'Dating', route: 'Dating', description: 'Find your match', badge: '2.0' },
      { icon: 'trending-up', label: 'Trending', route: 'Trending', description: 'Popular content', badge: '2.0' },
      { icon: 'location', label: 'Nearby', route: 'Nearby', description: 'Local content', badge: '2.0' },
    ]
  },
  {
    id: 'luma-settings',
    title: '⚙️ Luma Settings',
    icon: 'settings',
    color: '#607D8B',
    items: [
      { icon: 'settings', label: 'Luma Settings', route: 'Gen3Settings', description: 'Advanced configuration' },
      { icon: 'settings', label: 'Basic Settings', route: 'Gen1Settings', description: 'Basic app settings' },
      { icon: 'shield', label: 'Privacy Settings', route: 'PrivacySettings', description: 'Privacy and security' },
      { icon: 'notifications', label: 'Notification Settings', route: 'NotificationSettings', description: 'Notification preferences' },
      { icon: 'color-palette', label: 'Appearance', route: 'Appearance', description: 'Customize appearance' },
      { icon: 'language', label: 'Language', route: 'Language', description: 'Change language' },
      { icon: 'help-circle', label: 'Help & Support', route: 'HelpSupport', description: 'Get help and support' },
      { icon: 'information-circle', label: 'About', route: 'About', description: 'About the app and team' },
    ]
  },
  {
    id: 'luma-advanced',
    title: '🔬 Luma Advanced',
    icon: 'flask',
    color: '#E91E63',
    items: [
      { icon: 'eye', label: 'Eye Control', route: 'EyeControl', description: 'Eye tracking technology' },
      { icon: 'brain', label: 'Mind Control', route: 'MindControl', description: 'Thought-based control' },
      { icon: 'bulb', label: 'Consciousness Analysis', route: 'ConsciousnessAnalysis', description: 'Brainwave analysis' },
      { icon: 'infinite', label: 'Quantum Technology', route: 'QuantumTech', description: 'Quantum computing features' },
      { icon: 'globe', label: 'Metaverse', route: 'Metaverse', description: 'Virtual reality worlds' },
      { icon: 'time', label: 'Time Travel', route: 'TimeTravel', description: 'Temporal features' },
      { icon: 'globe', label: 'Teleportation', route: 'Teleportation', description: 'Spatial features' },
    ]
  },
  {
    id: 'luma-futuristic',
    title: '🚀 Luma Futuristic (Coming Soon)',
    icon: 'rocket',
    color: '#FF2E63',
    items: [
      { icon: 'brain', label: 'Neural Implants', route: 'NeuralImplants', badge: 'FUTURE', description: 'Direct brain-computer interface' },
      { icon: 'globe', label: 'Multi-Dimensional Travel', route: 'MultiDimensionalTravel', badge: 'FUTURE', description: 'Travel between dimensions' },
      { icon: 'infinite', label: 'Quantum Consciousness', route: 'QuantumConsciousness', badge: 'FUTURE', description: 'Quantum-level consciousness' },
      { icon: 'time', label: 'Temporal Manipulation', route: 'TemporalManipulation', badge: 'FUTURE', description: 'Control time flow' },
      { icon: 'globe', label: 'Reality Warping', route: 'RealityWarping', badge: 'FUTURE', description: 'Bend reality to your will' },
      { icon: 'sparkles', label: 'Energy Manipulation', route: 'EnergyManipulation', badge: 'FUTURE', description: 'Control energy fields' },
      { icon: 'people', label: 'Collective Consciousness', route: 'CollectiveConsciousness', badge: 'FUTURE', description: 'Shared mind networks' },
      { icon: 'infinite', label: 'Infinite Knowledge', route: 'InfiniteKnowledge', badge: 'FUTURE', description: 'Access all knowledge' },
    ]
  },
  {
    id: 'luma-ai-evolution',
    title: '🤖 Luma AI Evolution (Coming Soon)',
    icon: 'sparkles',
    color: '#00D4AA',
    items: [
      { icon: 'brain', label: 'Superintelligent AI', route: 'SuperintelligentAI', badge: 'FUTURE', description: 'Beyond human intelligence' },
      { icon: 'people', label: 'AI Consciousness', route: 'AIConsciousness', badge: 'FUTURE', description: 'Self-aware AI beings' },
      { icon: 'infinite', label: 'Quantum AI', route: 'QuantumAI', badge: 'FUTURE', description: 'Quantum-powered AI' },
      { icon: 'globe', label: 'AI Reality Creation', route: 'AIRealityCreation', badge: 'FUTURE', description: 'AI-generated realities' },
      { icon: 'sparkles', label: 'Emotional AI', route: 'EmotionalAI', badge: 'FUTURE', description: 'AI with emotions' },
      { icon: 'people', label: 'AI-Human Fusion', route: 'AIHumanFusion', badge: 'FUTURE', description: 'Merge with AI' },
      { icon: 'infinite', label: 'Predictive AI', route: 'PredictiveAI', badge: 'FUTURE', description: 'Predict the future' },
      { icon: 'brain', label: 'Creative AI', route: 'CreativeAI', badge: 'FUTURE', description: 'AI artistic creation' },
    ]
  },
  {
    id: 'luma-advanced-gaming',
    title: '🎮 Luma Advanced Gaming (Coming Soon)',
    icon: 'game-controller',
    color: '#9C27B0',
    items: [
      { icon: 'brain', label: 'Mind Gaming', route: 'MindGaming', badge: 'FUTURE', description: 'Control games with thoughts' },
      { icon: 'globe', label: 'Virtual Reality Gaming', route: 'VRGaming', badge: 'FUTURE', description: 'Immersive VR experiences' },
      { icon: 'infinite', label: 'Quantum Gaming', route: 'QuantumGaming', badge: 'FUTURE', description: 'Quantum-powered games' },
      { icon: 'people', label: 'Collective Gaming', route: 'CollectiveGaming', badge: 'FUTURE', description: 'Shared gaming consciousness' },
      { icon: 'time', label: 'Time Gaming', route: 'TimeGaming', badge: 'FUTURE', description: 'Time-manipulation games' },
      { icon: 'sparkles', label: 'Reality Gaming', route: 'RealityGaming', badge: 'FUTURE', description: 'Real-world game integration' },
    ]
  },
  {
    id: 'luma-advanced-finance',
    title: '💰 Luma Advanced Finance (Coming Soon)',
    icon: 'card',
    color: '#FFD700',
    items: [
      { icon: 'brain', label: 'AI Trading', route: 'AITrading', badge: 'FUTURE', description: 'AI-powered trading' },
      { icon: 'infinite', label: 'Quantum Finance', route: 'QuantumFinance', badge: 'FUTURE', description: 'Quantum financial systems' },
      { icon: 'globe', label: 'Global Banking', route: 'GlobalBanking', badge: 'FUTURE', description: 'Worldwide financial access' },
      { icon: 'sparkles', label: 'Crypto Evolution', route: 'CryptoEvolution', badge: 'FUTURE', description: 'Advanced cryptocurrency' },
      { icon: 'people', label: 'Collective Wealth', route: 'CollectiveWealth', badge: 'FUTURE', description: 'Shared financial systems' },
      { icon: 'time', label: 'Time Banking', route: 'TimeBanking', badge: 'FUTURE', description: 'Time-based currency' },
    ]
  },
  {
    id: 'luma-advanced-communication',
    title: '💬 Luma Advanced Communication (Coming Soon)',
    icon: 'chatbubbles',
    color: '#00D4AA',
    items: [
      { icon: 'brain', label: 'Thought Messaging', route: 'ThoughtMessaging', badge: 'FUTURE', description: 'Send thoughts directly' },
      { icon: 'infinite', label: 'Quantum Communication', route: 'QuantumCommunication', badge: 'FUTURE', description: 'Instant quantum messaging' },
      { icon: 'globe', label: 'Universal Translation', route: 'UniversalTranslation', badge: 'FUTURE', description: 'Real-time translation' },
      { icon: 'people', label: 'Collective Communication', route: 'CollectiveCommunication', badge: 'FUTURE', description: 'Shared consciousness chat' },
      { icon: 'time', label: 'Time Messaging', route: 'TimeMessaging', badge: 'FUTURE', description: 'Send messages through time' },
      { icon: 'sparkles', label: 'Holographic Communication', route: 'HolographicCommunication', badge: 'FUTURE', description: '3D communication' },
    ]
  },
  {
    id: 'luma-advanced-creation',
    title: '🎨 Luma Advanced Creation (Coming Soon)',
    icon: 'brush',
    color: '#FF6B6B',
    items: [
      { icon: 'brain', label: 'Thought Creation', route: 'ThoughtCreation', badge: 'FUTURE', description: 'Create with thoughts' },
      { icon: 'infinite', label: 'Quantum Art', route: 'QuantumArt', badge: 'FUTURE', description: 'Quantum-generated art' },
      { icon: 'globe', label: 'Reality Painting', route: 'RealityPainting', badge: 'FUTURE', description: 'Paint in reality' },
      { icon: 'people', label: 'Collective Creation', route: 'CollectiveCreation', badge: 'FUTURE', description: 'Shared creative consciousness' },
      { icon: 'time', label: 'Time Art', route: 'TimeArt', badge: 'FUTURE', description: 'Art across time' },
      { icon: 'sparkles', label: 'Holographic Creation', route: 'HolographicCreation', badge: 'FUTURE', description: '3D holographic art' },
    ]
  },
  {
    id: 'luma-advanced-education',
    title: '📚 Luma Advanced Education (Coming Soon)',
    icon: 'school',
    color: '#4CAF50',
    items: [
      { icon: 'brain', label: 'Thought Learning', route: 'ThoughtLearning', badge: 'FUTURE', description: 'Learn through thoughts' },
      { icon: 'infinite', label: 'Quantum Education', route: 'QuantumEducation', badge: 'FUTURE', description: 'Quantum learning systems' },
      { icon: 'globe', label: 'Universal Knowledge', route: 'UniversalKnowledge', badge: 'FUTURE', description: 'Access all knowledge' },
      { icon: 'people', label: 'Collective Learning', route: 'CollectiveLearning', badge: 'FUTURE', description: 'Shared learning consciousness' },
      { icon: 'time', label: 'Time Learning', route: 'TimeLearning', badge: 'FUTURE', description: 'Learn across time' },
      { icon: 'sparkles', label: 'Holographic Education', route: 'HolographicEducation', badge: 'FUTURE', description: '3D educational experiences' },
    ]
  },
  {
    id: 'luma-advanced-health',
    title: '🏥 Luma Advanced Health (Coming Soon)',
    icon: 'medical',
    color: '#FF9800',
    items: [
      { icon: 'brain', label: 'Thought Healing', route: 'ThoughtHealing', badge: 'FUTURE', description: 'Heal with thoughts' },
      { icon: 'infinite', label: 'Quantum Medicine', route: 'QuantumMedicine', badge: 'FUTURE', description: 'Quantum health systems' },
      { icon: 'globe', label: 'Universal Health', route: 'UniversalHealth', badge: 'FUTURE', description: 'Global health access' },
      { icon: 'people', label: 'Collective Wellness', route: 'CollectiveWellness', badge: 'FUTURE', description: 'Shared health consciousness' },
      { icon: 'time', label: 'Time Medicine', route: 'TimeMedicine', badge: 'FUTURE', description: 'Healing across time' },
      { icon: 'sparkles', label: 'Holographic Healing', route: 'HolographicHealing', badge: 'FUTURE', description: '3D healing experiences' },
    ]
  },
  {
    id: 'luma-advanced-transport',
    title: '🚁 Luma Advanced Transport (Coming Soon)',
    icon: 'airplane',
    color: '#607D8B',
    items: [
      { icon: 'brain', label: 'Thought Travel', route: 'ThoughtTravel', badge: 'FUTURE', description: 'Travel with thoughts' },
      { icon: 'infinite', label: 'Quantum Transport', route: 'QuantumTransport', badge: 'FUTURE', description: 'Instant quantum travel' },
      { icon: 'globe', label: 'Universal Transport', route: 'UniversalTransport', badge: 'FUTURE', description: 'Travel anywhere instantly' },
      { icon: 'people', label: 'Collective Travel', route: 'CollectiveTravel', badge: 'FUTURE', description: 'Shared travel consciousness' },
      { icon: 'time', label: 'Time Travel', route: 'TimeTravel', badge: 'FUTURE', description: 'Travel through time' },
      { icon: 'sparkles', label: 'Holographic Transport', route: 'HolographicTransport', badge: 'FUTURE', description: '3D transport experiences' },
    ]
  },
  {
    id: 'luma-dream',
    title: '🌌 Luma Dream - 20 Years Ahead',
    icon: 'infinite',
    color: '#FF2E63',
    items: [
      { icon: 'brain', label: 'Consciousness Upload', route: 'ConsciousnessUpload', badge: 'DREAM', description: 'Upload your consciousness' },
      { icon: 'globe', label: 'Digital Immortality', route: 'DigitalImmortality', badge: 'DREAM', description: 'Live forever digitally' },
      { icon: 'infinite', label: 'Infinite Possibilities', route: 'InfinitePossibilities', badge: 'DREAM', description: 'Unlimited potential' },
      { icon: 'people', label: 'Collective Consciousness', route: 'CollectiveConsciousness', badge: 'DREAM', description: 'Shared mind networks' },
      { icon: 'sparkles', label: 'Reality Creation', route: 'RealityCreation', badge: 'DREAM', description: 'Create your own reality' },
      { icon: 'time', label: 'Eternal Now', route: 'EternalNow', badge: 'DREAM', description: 'Live in eternal present' },
    ]
  },
  {
    id: 'luma-ai-gen3',
    title: '🧠 Luma AI Gen3 - 20 Years Ahead',
    icon: 'brain',
    color: '#9C27B0',
    items: [
      { icon: 'brain', label: 'Superintelligent AI', route: 'SuperintelligentAI', badge: 'GEN3', description: 'Beyond human intelligence' },
      { icon: 'people', label: 'AI Consciousness', route: 'AIConsciousness', badge: 'GEN3', description: 'Self-aware AI beings' },
      { icon: 'infinite', label: 'Quantum AI', route: 'QuantumAI', badge: 'GEN3', description: 'Quantum-powered AI' },
      { icon: 'globe', label: 'AI Reality Creation', route: 'AIRealityCreation', badge: 'GEN3', description: 'AI-generated realities' },
      { icon: 'sparkles', label: 'Emotional AI', route: 'EmotionalAI', badge: 'GEN3', description: 'AI with emotions' },
      { icon: 'people', label: 'AI-Human Fusion', route: 'AIHumanFusion', badge: 'GEN3', description: 'Merge with AI' },
    ]
  },
];

// Memoized status indicators
const getStatusIndicators = (statusData: StatusData | null, followerCount: number) => [
  { 
    name: 'Gen 2', 
    value: statusData?.gen2 ? 'Current' : 'Offline', 
    icon: 'sparkles', 
    color: statusData?.gen2 ? '#00C853' : '#F44336', 
    status: statusData?.gen2 ? 'active' : 'inactive' 
  },
  { 
    name: 'Gen 1', 
    value: statusData?.gen1 ? 'Current' : 'Offline', 
    icon: 'checkmark-circle', 
    color: statusData?.gen1 ? '#00C853' : '#F44336', 
    status: statusData?.gen1 ? 'active' : 'inactive' 
  },
  { 
    name: 'My Followers', 
    value: followerCount.toString(), 
    icon: 'people', 
    color: '#2196F3', 
    status: 'active' 
  },
  { 
    name: 'Active', 
    value: statusData?.activeUsers?.toString() || Math.floor(Math.random() * 200 + 800).toString(), 
    icon: 'radio', 
    color: '#4CAF50', 
    status: 'active' 
  },
];

// Optimized MenuScreen component with React.memo
const OptimizedMenuScreen: React.FC = React.memo(() => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Menu'>>();
  const { currentMood, getMoodDescription } = useMood();
  const { logout, user } = useAuth();
  const autoUpdateService = AutoUpdateService.getInstance();
  
  // Optimized animations with platform-specific timing
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isAndroid ? 30 : 50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Enhanced State with useMemo for performance
  const [selectedCategory, setSelectedCategory] = useState('core-features');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [updateProgress, setUpdateProgress] = useState<any>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Real-time status state
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const statusService = StatusService.getInstance();

  // Network integration state
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkService] = useState(() => LumaNetworkService.getInstance());

  // Network integration functions
  const checkNetworkAuth = async () => {
    try {
      // Check if user is authenticated with main app
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) return false;
      
      // Check if Luma Network profile exists
      const networkProfile = await networkService.getMyNetworkProfile();
      return !!networkProfile;
    } catch (error) {
      console.error('❌ Error checking network auth:', error);
      return false;
    }
  };

  const initializeNetworkForUser = async () => {
    try {
      // Check if user is authenticated with main app
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) return false;
      
      // Check if network profile exists, create if not
      const networkProfile = await networkService.getMyNetworkProfile();
      if (!networkProfile) {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await networkService.initialize(userId);
      }
      return true;
    } catch (error) {
      console.error('❌ Error initializing network:', error);
      return false;
    }
  };

  const handleNetworkIntegration = async (route: string, itemLabel: string) => {
    try {
      const isNetworkAuthenticated = await checkNetworkAuth();
      
      if (!isNetworkAuthenticated) {
        // Show network signup prompt
        Alert.alert(
          '🌐 Join Luma Network',
          `To access ${itemLabel} with full networking features, you'll need to join the Luma Network.`,
          [
            {
              text: 'Skip for Now',
              onPress: () => navigation.navigate(route as any)
            },
            {
              text: 'Join Network',
                                onPress: () => {
                    // Luma Network is now integrated with main auth
                    // Users automatically get network profiles when they sign up
                    Alert.alert(
                      '🌐 Luma Network',
                      'Luma Network is now integrated with your main account! Your network profile was created when you signed up. You can access network features from the menu.',
                      [{ text: 'OK' }]
                    );
                  }
            }
          ]
        );
        return;
      }

      // User is authenticated, initialize network and navigate
      const networkInitialized = await initializeNetworkForUser();
      if (networkInitialized) {
        // Create network activity for this menu item
        await networkService.updateNetworkProfile({
          lastSeen: new Date().toISOString(),
          bio: `Last used: ${itemLabel}`
        });
      }

      // Navigate to the requested route
      navigation.navigate(route as any);
      
    } catch (error) {
      console.error('❌ Error with network integration:', error);
      // Fallback to normal navigation
      navigation.navigate(route as any);
    }
  };

  const handleMenuNavigation = async (route: string, itemLabel: string) => {
    setLoading(true);
    try {
      await handleNetworkIntegration(route, itemLabel);
    } finally {
      setLoading(false);
    }
  };

  // Memoized selected category data
  const selectedCategoryData = useMemo(() => 
    MENU_CATEGORIES.find(cat => cat.id === selectedCategory), 
    [selectedCategory]
  );

  // Memoized status indicators
  const statusIndicators = useMemo(() => 
    getStatusIndicators(statusData, followerCount), 
    [statusData, followerCount]
  );

  // Platform-specific back handler
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showMenuModal) {
          setShowMenuModal(false);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [showMenuModal])
  );

  useEffect(() => {
    // Platform-optimized animations
    const animationDuration = isAndroid ? 600 : 800;
    const slideDistance = isAndroid ? 30 : 50;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: ANIMATION_CONFIG.useNativeDriver,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: ANIMATION_CONFIG.useNativeDriver,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: animationDuration + 200,
        useNativeDriver: ANIMATION_CONFIG.useNativeDriver,
      }),
    ]).start();

    // Optimized pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: isAndroid ? 1500 : 2000,
          useNativeDriver: ANIMATION_CONFIG.useNativeDriver,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: isAndroid ? 1500 : 2000,
          useNativeDriver: ANIMATION_CONFIG.useNativeDriver,
        }),
      ])
    ).start();

    // Defer heavy operations
    InteractionManager.runAfterInteractions(() => {
      loadFollowerCount();
      loadUpdateInfo();
      setupUpdateListeners();
      startStatusUpdates();
    });
  }, []);

  // Optimized data loading functions
  const loadFollowerCount = useCallback(async () => {
    if (user?.followers) {
      setFollowerCount(user.followers.length);
    } else {
      setFollowerCount(0);
    }
  }, [user?.followers]);

  const loadStatusData = useCallback(async () => {
    try {
      const status = await statusService.getStatus();
      setStatusData(status);
    } catch (error) {
      console.error('Error loading status:', error);
    }
  }, [statusService]);

  const startStatusUpdates = useCallback(() => {
    statusService.addListener((status) => {
      setStatusData(status);
      setLastUpdateTime(new Date());
      
      setShowUpdateNotification(true);
      setTimeout(() => {}, 500);
      
      console.log('🔄 Real-time status update received:', status);
    });

    statusService.startRealTimeUpdates(10000);
    loadStatusData();
  }, [statusService]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      statusService.stopRealTimeUpdates();
    };
  }, [statusService]);

  const loadUpdateInfo = useCallback(async () => {
    try {
      const info = autoUpdateService.getUpdateInfo();
      setUpdateInfo(info);
    } catch (error) {
      console.error('Error loading update info:', error);
    }
  }, [autoUpdateService]);

  const setupUpdateListeners = useCallback(() => {
    const handleProgressUpdate = (progress: any) => {
      setUpdateProgress(progress);
      if (progress.status === 'downloading' || progress.status === 'installing') {
        setIsUpdating(true);
      } else if (progress.status === 'complete' || progress.status === 'error') {
        setIsUpdating(false);
      }
    };

    autoUpdateService.addProgressListener(handleProgressUpdate);
  }, [autoUpdateService]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFollowerCount();
    await loadUpdateInfo();
    setTimeout(() => {}, 500);
  }, [loadFollowerCount, loadUpdateInfo]);

  const handleUpdatePress = useCallback(async () => {
    if (updateInfo?.isAvailable) {
      setShowUpdateModal(true);
    } else {
      try {
        setLoading(true);
        await autoUpdateService.checkForOTAUpdates();
        const newInfo = autoUpdateService.getUpdateInfo();
        setUpdateInfo(newInfo);
        
        if (newInfo?.isAvailable) {
          setShowUpdateModal(true);
        } else {
          Alert.alert('No Updates', 'You are running the latest version.');
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
        Alert.alert('Error', 'Failed to check for updates. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }, [updateInfo, autoUpdateService]);

  // Optimized menu item press handler with Gen3 support and network integration
  const handleMenuItemPress = useCallback((item: any) => {
    console.log('🎯 [GEN3 MENU] Menu item pressed:', item.label, 'Route:', item.route);
    
    if (item.label === 'Software Update') {
      handleUpdatePress();
    } else if (item.route) {
      try {
        // Handle special cases for Gen3 features with network integration
        if (item.route === 'Gen3Profile') {
          console.log('🎯 [GEN3 MENU] Navigating to Gen3 Profile with network integration');
          handleMenuNavigation('Gen3Profile', item.label);
        } else if (item.route === 'Gen3Notifications') {
          console.log('🎯 [GEN3 MENU] Navigating to Gen3 Notifications with network integration');
          handleMenuNavigation('Gen3Notifications', item.label);
        } else if (item.route === 'Gen3CreatePost') {
          console.log('🎯 [GEN3 MENU] Navigating to Gen3 Create Post with network integration');
          handleMenuNavigation('Gen3CreatePost', item.label);
        } else if (item.route === 'Gen3Explore') {
          console.log('🎯 [GEN3 MENU] Navigating to Gen3 Explore with network integration');
          handleMenuNavigation('Gen3Explore', item.label);
        } else if (item.route === 'Gen3Settings') {
          console.log('🎯 [GEN3 MENU] Navigating to Gen3 Settings with network integration');
          handleMenuNavigation('Gen3Settings', item.label);
        } else if (item.route === 'Gen3AIHelp') {
          console.log('🎯 [GEN3 MENU] Navigating to Gen3 AI Help with network integration');
          handleMenuNavigation('Gen3AIHelp', item.label);
        } else if (item.route === 'LumaNetwork') {
          // Direct navigation to Luma Network
          console.log('🌐 [LUMA NETWORK] Direct navigation to Luma Network');
          navigation.navigate('LumaNetwork' as any);
        } else if (item.badge === 'DREAM') {
          // Special handling for Luma Dream features with network integration
          console.log('🌌 [LUMA DREAM] Feature accessed with network integration:', item.label);
          Alert.alert(
            '🌌 Luma Dream - 20 Years Ahead',
            `${item.label}\n\nThis revolutionary technology represents the future of human consciousness and reality manipulation. Developed by a solo developer 20 years ahead of current technology.\n\n${item.description}\n\nThis feature will change the world forever.`,
            [
              { 
                text: 'Experience the Future', 
                onPress: () => handleMenuNavigation(item.route, item.label)
              }
            ]
          );
        } else {
          // Standard navigation with network integration for all other routes
          console.log('🎯 [GEN3 MENU] Navigating with network integration to:', item.route);
          handleMenuNavigation(item.route, item.label);
        }
      } catch (error) {
        console.error('❌ [GEN3 MENU] Navigation error for', item.label, ':', error);
        
        // Show user-friendly error message
        Alert.alert(
          'Feature Coming Soon',
          `${item.label} is being prepared for Gen3. This feature will be available soon!`,
          [{ text: 'OK', style: 'default' }]
        );
        
        // Fallback to modal for unsupported features
        setSelectedMenuItem(item);
        setShowMenuModal(true);
      }
    } else {
      // Handle items without routes (show modal with description)
      console.log('🎯 [GEN3 MENU] Showing modal for:', item.label);
      setSelectedMenuItem(item);
      setShowMenuModal(true);
    }
  }, [navigation, handleUpdatePress, handleMenuNavigation]);

  const handleStartUpdate = useCallback(async () => {
    try {
      setShowUpdateModal(false);
      setLoading(true);
      await autoUpdateService.startUpdate();
    } catch (error) {
      console.error('Error starting update:', error);
      Alert.alert('Error', 'Failed to start update. Please try again.');
      setLoading(false);
    }
  }, [autoUpdateService]);

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await logout();
              console.log('✅ Logout completed successfully');
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [logout]);

  // Quick logout function for emergency use
  const quickLogout = useCallback(async () => {
    try {
      console.log('🚨 Emergency logout initiated');
      await logout();
      console.log('✅ Emergency logout completed');
    } catch (error) {
      console.error('❌ Emergency logout failed:', error);
    }
  }, [logout]);

  // Optimized render functions with React.memo
  const renderMenuItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleMenuItemPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
        style={styles.menuItemGradient}
      >
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemIcon}>
            <Ionicons name={item.icon as any} size={scale(16)} color="#FFD700" />
          </View>
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          </View>
          {item.badge && (
            <View style={styles.menuItemBadge}>
              <Text style={styles.menuItemBadgeText}>{item.badge}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={scale(12)} color="rgba(255,255,255,0.5)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), [handleMenuItemPress]);

  const renderCategoryCard = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => setSelectedCategory(item.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={selectedCategory === item.id 
          ? [item.color + '40', item.color + '20'] 
          : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
        }
        style={styles.categoryGradient}
      >
        <View style={styles.categoryContent}>
          <View style={styles.categoryIcon}>
            <Ionicons name={item.icon as any} size={scale(20)} color={selectedCategory === item.id ? item.color : 'rgba(255,255,255,0.7)'} />
          </View>
          <Text style={[
            styles.categoryTitle,
            selectedCategory === item.id && { color: item.color }
          ]}>
            {item.title}
          </Text>
          <Text style={styles.categoryCount}>{item.items.length} items</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), [selectedCategory]);

  const renderStatusItem = useCallback(({ item }: { item: any }) => (
    <View style={styles.statusItem}>
      <View style={[styles.statusIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={scale(16)} color={item.color} />
      </View>
      <Text style={styles.statusName}>{item.name}</Text>
      <Text style={styles.statusValue}>{item.value}</Text>
      <View style={[styles.statusDot, { backgroundColor: item.color }]} />
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        style={styles.background}
      >
        {/* Modern 2.0 Header */}
        <SafeAreaView style={styles.header}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.headerGradient}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={scale(24)} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <View style={styles.headerLogoContainer}>
                  <View style={styles.headerIconContainer}>
                    <LinearGradient
                      colors={['#FF2E63', '#FF6B9D']}
                      style={styles.headerIconGradient}
                    >
                      <Ionicons name="star" size={scale(24)} color="#fff" />
                    </LinearGradient>
                  </View>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Menu</Text>
                    <Text style={styles.headerSubtitle}>Explore all features</Text>
                    <View style={styles.headerBadge}>
                      <Text style={styles.headerBadgeText}>LUMA</Text>
                      <Text style={styles.headerBadgeSubtext}>GEN3</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
              
              {/* Revolutionary Gen3 Menu Button */}
              <TouchableOpacity
                style={styles.gen3MenuButton}
                onPress={() => navigation.navigate('Gen3RevolutionaryMenu' as any)}
              >
                <LinearGradient
                  colors={['#FF2E63', '#FF6B9D', '#C44569']}
                  style={styles.gen3ButtonGradient}
                >
                  <Ionicons name="bulb" size={scale(16)} color="#fff" />
                  <Text style={styles.gen3MenuText}>Gen3</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Network Status Button */}
              <TouchableOpacity
                style={styles.networkStatusButton}
                onPress={() => navigation.navigate('LumaNetwork' as any)}
              >
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.networkButtonGradient}
                >
                  <Ionicons name="people" size={scale(16)} color="#fff" />
                  <Text style={styles.networkStatusText}>Network</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={scale(24)} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        </SafeAreaView>

        {/* User Profile Section */}
        <Animated.View style={[styles.profileSection, { opacity: headerAnim }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.profileGradient}
          >
            <View style={styles.profileContent}>
              <View style={styles.profileAvatar}>
                {user?.avatar ? (
                  <DefaultAvatar size={scale(50)} />
                ) : (
                  <DefaultAvatar size={scale(50)} />
                )}
                <MoodRayGlow mood={currentMood} />
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.displayName || user?.username || 'New Luma User'}</Text>
                <Text style={styles.profileUsername}>@{user?.username || user?.email?.split('@')[0] || 'luma_user'}</Text>
                <Text style={styles.profileMood}>{getMoodDescription()}</Text>
              </View>
              
              <View style={styles.profileStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{followerCount}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Gen4 Update Banner */}
        <Animated.View style={[styles.gen4Banner, { opacity: headerAnim }]}>
          <LinearGradient
            colors={['#FF2E63', '#FF6B9D', '#C44569']}
            style={styles.gen4BannerGradient}
          >
            <View style={styles.gen4BannerContent}>
              <View style={styles.gen4BannerIcon}>
                <Ionicons name="rocket" size={scale(18)} color="#FFFFFF" />
              </View>
              <View style={styles.gen4BannerText}>
                <Text style={styles.gen4BannerTitle}>🚀 Gen4 + Luma Dream</Text>
                <Text style={styles.gen4BannerSubtitle}>76+ Features • 20 Years Ahead</Text>
              </View>
              <View style={styles.gen4BannerBadge}>
                <Text style={styles.gen4BannerBadgeText}>GEN4</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Network Integration Banner */}
        <Animated.View style={[styles.networkBanner, { opacity: headerAnim }]}>
          <LinearGradient
            colors={['#2196F3', '#1976D2', '#0D47A1']}
            style={styles.networkBannerGradient}
          >
            <View style={styles.networkBannerContent}>
              <View style={styles.networkBannerIcon}>
                <Ionicons name="people" size={scale(18)} color="#FFFFFF" />
              </View>
              <View style={styles.networkBannerText}>
                <Text style={styles.networkBannerTitle}>🌐 Luma Network Connected</Text>
                <Text style={styles.networkBannerSubtitle}>All features enhanced with networking</Text>
              </View>
              <TouchableOpacity
                style={styles.networkBannerButton}
                onPress={() => navigation.navigate('LumaNetwork' as any)}
              >
                <Text style={styles.networkBannerButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Main Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFD700"
              colors={['#FFD700']}
            />
          }
        >
          {/* Categories */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={MENU_CATEGORIES}
              renderItem={renderCategoryCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
              {...FLATLIST_CONFIG}
            />
          </View>

          {/* Menu Items */}
          {selectedCategoryData && (
            <View style={styles.menuItemsSection}>
              <Text style={styles.sectionTitle}>{selectedCategoryData.title}</Text>
              <FlatList
                data={selectedCategoryData.items}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.label}
                scrollEnabled={false}
                {...FLATLIST_CONFIG}
              />
            </View>
          )}

          {/* Status Indicators */}
          <View style={styles.statusSection}>
            <View style={styles.statusHeader}>
              <Text style={styles.sectionTitle}>System Status</Text>
              {lastUpdateTime && (
                <Text style={styles.lastUpdateText}>
                  Last update: {lastUpdateTime.toLocaleTimeString()}
                </Text>
              )}
            </View>
            <FlatList
              data={statusIndicators}
              renderItem={renderStatusItem}
              keyExtractor={(item) => item.name}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statusGrid}
              {...FLATLIST_CONFIG}
            />
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutSection}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(244,67,54,0.2)', 'rgba(244,67,54,0.1)']}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out-outline" size={scale(20)} color="#F44336" />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
});

// Platform-specific styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  background: {
    flex: 1,
  },
  header: {
    paddingTop: isIOS ? 0 : StatusBar.currentHeight,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: scale(10),
    borderRadius: scale(12),
    marginHorizontal: scale(15),
    marginTop: scale(5),
  },
  backButton: {
    padding: scale(8),
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(5),
  },
  headerIconContainer: {
    marginRight: scale(10),
  },
  headerIconGradient: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    marginLeft: scale(10),
    flex: 1,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(4),
  },
  headerBadgeText: {
    fontSize: scale(10),
    fontWeight: 'bold',
    color: '#FF2E63',
    marginRight: scale(4),
  },
  headerBadgeSubtext: {
    fontSize: scale(8),
    color: '#FF6B9D',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: scale(12),
    color: 'rgba(255,255,255,0.7)',
    marginTop: scale(2),
  },
  logoutButton: {
    padding: scale(8),
  },
  profileSection: {
    marginHorizontal: scale(15),
    marginTop: scale(10),
  },
  profileGradient: {
    borderRadius: scale(12),
    padding: scale(15),
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    position: 'relative',
  },
  profileInfo: {
    flex: 1,
    marginLeft: scale(15),
  },
  profileName: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  profileUsername: {
    fontSize: scale(14),
    color: 'rgba(255,255,255,0.7)',
    marginTop: scale(2),
  },
  profileMood: {
    fontSize: scale(12),
    color: '#FFD700',
    marginTop: scale(4),
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: scale(20),
  },
  statValue: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: scale(10),
    color: 'rgba(255,255,255,0.7)',
    marginTop: scale(2),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(15),
    paddingBottom: scale(60),
  },
  categoriesSection: {
    marginTop: scale(20),
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: scale(10),
  },
  categoriesList: {
    paddingRight: scale(15),
  },
  categoryCard: {
    width: scale(100),
    marginRight: scale(8),
  },
  categoryGradient: {
    borderRadius: scale(6),
    padding: scale(10),
  },
  categoryContent: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(6),
  },
  categoryTitle: {
    fontSize: scale(11),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: scale(9),
    color: 'rgba(255,255,255,0.5)',
    marginTop: scale(3),
  },
  menuItemsSection: {
    marginTop: scale(20),
  },
  menuItem: {
    marginBottom: scale(4),
  },
  menuItemGradient: {
    borderRadius: scale(4),
    padding: scale(8),
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(8),
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: scale(12),
    fontWeight: '600',
    color: '#fff',
  },
  menuItemDescription: {
    fontSize: scale(10),
    color: 'rgba(255,255,255,0.7)',
    marginTop: scale(1),
  },
  menuItemBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: scale(4),
    paddingVertical: scale(1),
    borderRadius: scale(3),
    marginRight: scale(6),
  },
  menuItemBadgeText: {
    fontSize: scale(9),
    fontWeight: 'bold',
    color: '#000',
  },
  statusSection: {
    marginTop: scale(20),
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  lastUpdateText: {
    fontSize: scale(10),
    color: 'rgba(255,255,255,0.5)',
  },
  statusGrid: {
    paddingRight: scale(15),
  },
  statusItem: {
    alignItems: 'center',
    marginRight: scale(20),
    minWidth: scale(60),
  },
  statusIcon: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(6),
  },
  statusName: {
    fontSize: scale(10),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  statusValue: {
    fontSize: scale(12),
    fontWeight: 'bold',
    color: '#fff',
    marginTop: scale(2),
  },
  statusDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    marginTop: scale(4),
  },
  logoutSection: {
    marginTop: scale(20),
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(15),
    borderRadius: scale(8),
  },
  logoutText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#F44336',
    marginLeft: scale(8),
  },
  // Gen4 Banner Styles - Compact
  gen4Banner: {
    marginHorizontal: scale(15),
    marginTop: scale(8),
    marginBottom: scale(10),
  },
  gen4BannerGradient: {
    borderRadius: scale(8),
    padding: scale(10),
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gen4BannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gen4BannerIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(8),
  },
  gen4BannerText: {
    flex: 1,
  },
  gen4BannerTitle: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: scale(2),
  },
  gen4BannerSubtitle: {
    fontSize: scale(10),
    color: 'rgba(255,255,255,0.8)',
    lineHeight: scale(12),
  },
  gen4BannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(4),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  gen4BannerBadgeText: {
    fontSize: scale(8),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Network Integration Banner Styles - Compact
  networkBanner: {
    marginHorizontal: scale(15),
    marginTop: scale(8),
    marginBottom: scale(10),
  },
  networkBannerGradient: {
    borderRadius: scale(8),
    padding: scale(10),
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  networkBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkBannerIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(8),
  },
  networkBannerText: {
    flex: 1,
  },
  networkBannerTitle: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: scale(2),
  },
  networkBannerSubtitle: {
    fontSize: scale(10),
    color: 'rgba(255,255,255,0.8)',
    lineHeight: scale(12),
  },
  networkBannerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: scale(5),
    paddingHorizontal: scale(10),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  networkBannerButtonText: {
    fontSize: scale(12),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFD700',
    fontSize: scale(16),
    marginTop: scale(10),
  },
  networkStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: scale(5),
    paddingHorizontal: scale(10),
    borderRadius: scale(8),
    marginLeft: scale(10),
  },
  gen3MenuButton: {
    marginRight: scale(10),
  },
  gen3ButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(20),
  },
  gen3MenuText: {
    color: '#fff',
    fontSize: scale(12),
    fontWeight: '600',
    marginLeft: scale(4),
  },
  networkStatusText: {
    color: '#fff',
    fontSize: scale(12),
    fontWeight: '600',
    marginLeft: scale(5),
  },
  networkButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(20),
  },
});

export default OptimizedMenuScreen; 