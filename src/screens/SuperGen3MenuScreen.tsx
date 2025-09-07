import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  FlatList,
  RefreshControl,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Mobile-optimized scaling
const scale = (size: number) => Math.min(width, height) / 375 * size;
const scaleVertical = (size: number) => height / 812 * size;

// Super Gen3 Menu Categories with Mobile Optimization
const SUPER_GEN3_CATEGORIES = [
  {
    id: 'neural-core',
    title: '🧠 Neural Core',
    subtitle: 'Consciousness Interface',
    icon: 'bulb',
    color: '#FF2E63',
    gradient: ['#FF2E63', '#FF6B9D'],
    consciousnessLevel: 95,
    items: [
      { 
        icon: 'person', 
        label: 'Neural Profile', 
        route: 'Gen3Profile', 
        description: 'Advanced consciousness mapping',
        badge: 'GEN3',
        consciousnessBoost: 15
      },
      { 
        icon: 'people', 
        label: 'Quantum Connections', 
        route: 'Friends', 
        description: 'Neural network of consciousness',
        badge: 'QUANTUM',
        consciousnessBoost: 12
      },
      { 
        icon: 'notifications', 
        label: 'Neural Alerts', 
        route: 'Gen3Notifications', 
        description: 'Consciousness-aware notifications',
        badge: 'NEURAL',
        consciousnessBoost: 8
      },
      { 
        icon: 'chatbubbles', 
        label: 'Telepathic Chat', 
        route: 'Gen1Messenger', 
        description: 'Direct consciousness communication',
        badge: 'TELEPATHIC',
        consciousnessBoost: 20
      },
    ]
  },
  {
    id: 'quantum-ai',
    title: '⚛️ Quantum AI',
    subtitle: 'Intelligent Systems',
    icon: 'sparkles',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#E1BEE7'],
    consciousnessLevel: 88,
    items: [
      { 
        icon: 'bulb', 
        label: 'AI Assistant', 
        route: 'Gen3AIHelp', 
        description: 'Quantum AI consciousness helper',
        badge: 'AI',
        consciousnessBoost: 18
      },
      { 
        icon: 'create', 
        label: 'AI Creator', 
        route: 'AIContentCreator', 
        description: 'AI-powered content creation',
        badge: 'CREATOR',
        consciousnessBoost: 22
      },
      { 
        icon: 'analytics', 
        label: 'AI Analytics', 
        route: 'AnalyticsDashboard', 
        description: 'Advanced consciousness analytics',
        badge: 'ANALYTICS',
        consciousnessBoost: 16
      },
      { 
        icon: 'trending-up', 
        label: 'Analytics v2', 
        route: 'AnalyticsDashboard', 
        description: 'Enhanced quantum analytics & insights',
        badge: 'ANALYTICS V2',
        consciousnessBoost: 20,
        isNew: true,
        features: ['Quantum Insights', 'Predictive Analytics', 'Real-time Monitoring', 'AI-Powered Reports']
      },
      { 
        icon: 'settings', 
        label: 'AI Settings', 
        route: 'Gen3Settings', 
        description: 'AI consciousness configuration',
        badge: 'SETTINGS',
        consciousnessBoost: 10
      },
    ]
  },
  {
    id: 'cosmic-intelligence',
    title: '🌠 Cosmic Intelligence',
    subtitle: 'Universal Knowledge',
    icon: 'star',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA000'],
    consciousnessLevel: 100,
    items: [
      { 
        icon: 'library', 
        label: 'Universal Knowledge', 
        route: 'UniversalKnowledge', 
        description: 'Access all knowledge',
        badge: 'UNIVERSAL',
        consciousnessBoost: 50
      },
      { 
        icon: 'bulb', 
        label: 'Infinite Wisdom', 
        route: 'InfiniteConsciousness', 
        description: 'Infinite consciousness expansion',
        badge: 'INFINITE',
        consciousnessBoost: 60
      },
      { 
        icon: 'star', 
        label: 'Cosmic Intelligence', 
        route: 'CosmicIntelligence', 
        description: 'Cosmic-level intelligence',
        badge: 'COSMIC',
        consciousnessBoost: 55
      },
      { 
        icon: 'flash', 
        label: 'Omnipotence', 
        route: 'Omnipotence', 
        description: 'Ultimate power & control',
        badge: 'OMNIPOTENT',
        consciousnessBoost: 100
      },
    ]
  },
  {
    id: 'luma-ecosystem',
    title: '🌌 Luma Ecosystem',
    subtitle: 'Complete Platform',
    icon: 'planet',
    color: '#00D4FF',
    gradient: ['#00D4FF', '#4ECDC4'],
    consciousnessLevel: 92,
    items: [
      { 
        icon: 'card', 
        label: 'Super Gen3 Bank', 
        route: 'SuperGen3Bank', 
        description: 'Quantum neural financial system',
        badge: 'SUPER GEN3',
        consciousnessBoost: 35,
        isNew: true,
        features: ['Neural Payments', 'Quantum Security', 'Consciousness Banking', 'AI Financial Advisor']
      },
      { 
        icon: 'bag', 
        label: 'Luma Shop', 
        route: 'LumaShop', 
        description: 'Quantum marketplace',
        badge: 'SHOP',
        consciousnessBoost: 20
      },
      { 
        icon: 'heart', 
        label: 'Luma Loved Ones', 
        route: 'LumaLovedOnes', 
        description: 'Family & relationships',
        badge: 'FAMILY',
        consciousnessBoost: 30
      },
      { 
        icon: 'musical-notes', 
        label: 'Luma Music', 
        route: 'LumaMusic', 
        description: 'Quantum music platform',
        badge: 'MUSIC',
        consciousnessBoost: 18
      },
      { 
        icon: 'film', 
        label: 'Luma Movies', 
        route: 'MovieTheater', 
        description: 'Quantum movie theater',
        badge: 'MOVIES',
        consciousnessBoost: 25
      },
      { 
        icon: 'game-controller', 
        label: 'Gaming Hub', 
        route: 'GamingHub', 
        description: 'Quantum gaming platform with casino',
        badge: 'GAMING',
        consciousnessBoost: 28,
        isNew: true,
        features: ['Luma Casino', 'Real Money Gaming', 'Quantum Games', 'Neural Gaming']
      },
      { 
        icon: 'fitness', 
        label: 'Fitness Tracker', 
        route: 'FitnessTracker', 
        description: 'Quantum fitness & health monitoring',
        badge: 'FITNESS',
        consciousnessBoost: 22,
        isNew: true,
        features: ['Neural Workouts', 'Quantum Health', 'AI Training', 'Consciousness Fitness']
      },
      { 
        icon: 'library', 
        label: 'Learning Hub', 
        route: 'LearningHub', 
        description: 'Quantum education & knowledge platform',
        badge: 'LEARNING',
        consciousnessBoost: 26,
        isNew: true,
        features: ['Quantum Courses', 'Neural Learning', 'AI Education', 'Consciousness Knowledge']
      },
      { 
        icon: 'people', 
        label: 'Communities', 
        route: 'Communities', 
        description: 'Quantum social communities & groups',
        badge: 'COMMUNITIES',
        consciousnessBoost: 24,
        isNew: true,
        features: ['Neural Groups', 'Quantum Events', 'Consciousness Communities', 'AI Moderation']
      },
    ]
  },
  {
    id: 'advanced-tools',
    title: '🛠️ Advanced Tools',
    subtitle: 'Developer & Creator',
    icon: 'construct',
    color: '#FF6B35',
    gradient: ['#FF6B35', '#FF8A65'],
    consciousnessLevel: 85,
    items: [
      { 
        icon: 'code', 
        label: 'Luma Coding', 
        route: 'LumaCoding', 
        description: 'Quantum coding environment',
        badge: 'CODE',
        consciousnessBoost: 28
      },
      { 
        icon: 'game-controller', 
        label: 'Game Engine', 
        route: 'LumaGameEngine', 
        description: 'Quantum game development',
        badge: 'GAME',
        consciousnessBoost: 32
      },
      { 
        icon: 'build', 
        label: 'Feature Builder', 
        route: 'FeatureBuilder', 
        description: 'Build new features',
        badge: 'BUILDER',
        consciousnessBoost: 35
      },
      { 
        icon: 'document', 
        label: 'API Docs', 
        route: 'APIDocumentation', 
        description: 'Quantum API documentation',
        badge: 'API',
        consciousnessBoost: 15
      },
    ]
  },
  {
    id: 'quantum-reality',
    title: '🌀 Quantum Reality',
    subtitle: 'Reality Manipulation',
    icon: 'infinite',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#673AB7'],
    consciousnessLevel: 98,
    items: [
      { 
        icon: 'time', 
        label: 'Time Travel', 
        route: 'TimeTravel', 
        description: 'Quantum time manipulation',
        badge: 'TIME',
        consciousnessBoost: 80
      },
      { 
        icon: 'location', 
        label: 'Teleportation', 
        route: 'Teleportation', 
        description: 'Instant quantum transport',
        badge: 'TELEPORT',
        consciousnessBoost: 75
      },
      { 
        icon: 'eye', 
        label: 'Neural Interface', 
        route: 'NeuralInterface', 
        description: 'Direct brain interface',
        badge: 'NEURAL',
        consciousnessBoost: 65
      },
      { 
        icon: 'vr', 
        label: 'VR Universe', 
        route: 'VRUniverse', 
        description: 'Virtual reality creation',
        badge: 'VR',
        consciousnessBoost: 45
      },
    ]
  },
  {
    id: 'luma-investments',
    title: '💰 Luma Investments',
    subtitle: 'Invest in the Future',
    icon: 'trending-up',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#8BC34A'],
    consciousnessLevel: 96,
    items: [
      { 
        icon: 'trending-up', 
        label: 'LUMA Token Investment', 
        route: 'LumaInvestments', 
        description: 'Invest in LUMA tokens for upcoming features',
        badge: 'INVEST',
        consciousnessBoost: 40,
        isNew: true,
        features: ['Token Staking', 'Dividend Rewards', 'Early Access', 'Voting Rights']
      },
      { 
        icon: 'rocket', 
        label: 'Feature Pre-Investment', 
        route: 'FeatureInvestment', 
        description: 'Pre-invest in upcoming LUMA features',
        badge: 'PRE-INVEST',
        consciousnessBoost: 35,
        isNew: true,
        features: ['Early Access', 'Exclusive Benefits', 'Revenue Sharing', 'Priority Support']
      },
      { 
        icon: 'business', 
        label: 'LUMA Business Partnership', 
        route: 'BusinessPartnership', 
        description: 'Partner with LUMA for business growth',
        badge: 'PARTNER',
        consciousnessBoost: 45,
        isNew: true,
        features: ['Revenue Sharing', 'Exclusive Access', 'Business Tools', 'Marketing Support']
      },
      { 
        icon: 'diamond', 
        label: 'Premium Investment Tier', 
        route: 'PremiumInvestment', 
        description: 'Exclusive premium investment opportunities',
        badge: 'PREMIUM',
        consciousnessBoost: 50,
        isNew: true,
        features: ['VIP Access', 'Exclusive Features', 'Priority Support', 'Revenue Sharing']
      },
      { 
        icon: 'infinite', 
        label: 'Quantum Consciousness Marketplace', 
        route: 'QuantumConsciousnessMarketplace', 
        description: 'Trade consciousness experiences and quantum states',
        badge: 'QUANTUM',
        consciousnessBoost: 60,
        isNew: true,
        features: ['Consciousness Trading', 'Quantum States', 'Neural Patterns', 'Temporal Experiences']
      },
    ]
  }
];

const SuperGen3MenuScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  
  // Safely get mood with fallback
  let currentMood = 'happy'; // Default fallback
  try {
    const moodContext = useMood();
    currentMood = moodContext.currentMood;
  } catch (error) {
    console.log('🎭 [MENU] MoodProvider not available, using default mood');
  }
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState('neural-core');
  const [consciousnessLevel, setConsciousnessLevel] = useState(95);
  const [quantumFieldStrength, setQuantumFieldStrength] = useState(88);
  const [neuralActivity, setNeuralActivity] = useState(92);
  const [refreshing, setRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const quantumAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;

  // Animation effects
  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Wave animation
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Quantum field animation
    Animated.loop(
      Animated.timing(quantumAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    Animated.spring(categoryAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => {
      categoryAnim.setValue(0);
    });
  }, []);

  // Handle menu item press
  const handleMenuItemPress = useCallback((item: any) => {
    console.log('🌌 [SUPER GEN3] Menu item pressed:', item.label);
    
    // Quantum feedback
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to route
    if (navigation && item.route) {
      navigation.navigate(item.route as any);
    }
  }, [navigation, pulseAnim]);

  // Handle logout
  const handleLogout = useCallback(() => {
    Alert.alert(
      '🌌 Super Gen3 Logout',
      'Are you sure you want to disconnect from the quantum consciousness network?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            console.log('🌌 [SUPER GEN3] User logged out from quantum network');
          }
        }
      ]
    );
  }, [logout]);

  // Render category tab
  const renderCategoryTab = useCallback(({ item }: { item: any }) => {
    const isSelected = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
        onPress={() => handleCategorySelect(item.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isSelected ? item.gradient : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.categoryTabGradient}
        >
          <Animated.View style={{ transform: [{ scale: isSelected ? pulseAnim : 1 }] }}>
            <Ionicons 
              name={item.icon as any} 
              size={scale(16)} 
              color={isSelected ? '#FFFFFF' : item.color} 
            />
          </Animated.View>
          <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextSelected]}>
            {item.title}
          </Text>
          <Text style={styles.categoryTabSubtitle}>
            {item.subtitle}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, [selectedCategory, pulseAnim, handleCategorySelect]);

  // Render menu item
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
          <View style={styles.consciousnessBoost}>
            <Text style={styles.boostText}>+{item.consciousnessBoost}</Text>
            <Text style={styles.boostLabel}>C</Text>
          </View>
          <Ionicons name="chevron-forward" size={scale(14)} color="rgba(255,255,255,0.5)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), [handleMenuItemPress]);

  const selectedCategoryData = SUPER_GEN3_CATEGORIES.find(cat => cat.id === selectedCategory) || SUPER_GEN3_CATEGORIES[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000011" />
      
      {/* Background */}
      <LinearGradient
        colors={['#000011', '#001122', '#000011']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Quantum Particle Overlay */}
      <Animated.View 
        style={[
          styles.quantumParticles,
          {
            opacity: quantumAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.3],
            }),
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(0, 212, 255, 0.1)', 'rgba(156, 39, 176, 0.1)', 'rgba(255, 107, 53, 0.1)']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#FFD700', '#FF6B35', '#9C27B0']}
              style={styles.logoGradient}
            >
              <Ionicons name="planet" size={scale(20)} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>🌌 Super Gen3 Menu</Text>
            <Text style={styles.headerSubtitle}>Quantum Consciousness Interface</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setShowProfileModal(true)}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.profileButtonGradient}
          >
            <Ionicons name="person" size={scale(16)} color="#FFD700" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Quantum Stats */}
      <View style={styles.quantumStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Consciousness</Text>
          <Text style={styles.statValue}>{consciousnessLevel}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Quantum Field</Text>
          <Text style={styles.statValue}>{quantumFieldStrength}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Neural Activity</Text>
          <Text style={styles.statValue}>{neuralActivity}%</Text>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabsContainer}>
        <FlatList
          data={SUPER_GEN3_CATEGORIES}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsList}
        />
      </View>

      {/* Menu Items */}
      <ScrollView 
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 2000);
            }}
            colors={['#FFD700']}
          />
        }
      >
        <View style={styles.menuItemsSection}>
          <Text style={styles.sectionTitle}>{selectedCategoryData.title}</Text>
          <Text style={styles.sectionSubtitle}>{selectedCategoryData.subtitle}</Text>
          
          <FlatList
            data={selectedCategoryData.items}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.label}
            scrollEnabled={false}
            contentContainerStyle={styles.menuItemsList}
          />
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#000011', '#001122']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🌌 User Profile</Text>
                <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                  <Ionicons name="close" size={scale(24)} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.displayName || user?.username || 'Quantum User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'user@luma.com'}</Text>
                <Text style={styles.profileConsciousness}>Consciousness Level: {consciousnessLevel}%</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <LinearGradient
                  colors={['#FF2E63', '#FF6B9D']}
                  style={styles.logoutButtonGradient}
                >
                  <Ionicons name="log-out" size={scale(16)} color="#FFFFFF" />
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000011',
  },
  
  quantumParticles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(15),
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  logoContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    borderWidth: 2,
    overflow: 'hidden',
    marginRight: scale(10),
  },

  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: scale(2),
  },

  headerSubtitle: {
    fontSize: scale(12),
    color: '#888',
  },

  profileButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    overflow: 'hidden',
  },

  profileButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantumStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: scale(15),
    paddingVertical: scale(10),
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: scale(15),
    marginTop: scale(10),
    borderRadius: scale(12),
  },

  statItem: {
    alignItems: 'center',
  },

  statLabel: {
    fontSize: scale(10),
    color: '#888',
    marginBottom: scale(2),
  },

  statValue: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: '#FFD700',
  },

  categoryTabsContainer: {
    marginTop: scale(15),
  },

  categoryTabsList: {
    paddingHorizontal: scale(15),
  },

  categoryTab: {
    marginRight: scale(10),
    borderRadius: scale(12),
    overflow: 'hidden',
    minWidth: scale(100),
  },

  categoryTabSelected: {
    transform: [{ scale: 1.05 }],
  },

  categoryTabGradient: {
    padding: scale(12),
    alignItems: 'center',
  },

  categoryTabText: {
    fontSize: scale(12),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: scale(4),
    textAlign: 'center',
  },

  categoryTabTextSelected: {
    color: '#FFFFFF',
  },

  categoryTabSubtitle: {
    fontSize: scale(8),
    color: 'rgba(255,255,255,0.7)',
    marginTop: scale(2),
    textAlign: 'center',
  },

  menuContainer: {
    flex: 1,
    marginTop: scale(15),
  },

  menuItemsSection: {
    paddingHorizontal: scale(15),
  },

  sectionTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: scale(4),
  },

  sectionSubtitle: {
    fontSize: scale(14),
    color: '#888',
    marginBottom: scale(20),
  },

  menuItemsList: {
    paddingBottom: scale(20),
  },

  menuItem: {
    marginBottom: scale(8),
    borderRadius: scale(8),
    overflow: 'hidden',
  },

  menuItemGradient: {
    padding: scale(12),
  },

  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },

  menuItemInfo: {
    flex: 1,
  },

  menuItemLabel: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: scale(2),
  },

  menuItemDescription: {
    fontSize: scale(10),
    color: '#888',
    lineHeight: scale(14),
  },

  menuItemBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
    marginRight: scale(8),
  },

  menuItemBadgeText: {
    fontSize: scale(10),
    fontWeight: 'bold',
    color: '#000',
  },

  consciousnessBoost: {
    alignItems: 'center',
    marginRight: scale(8),
  },

  boostText: {
    fontSize: scale(12),
    fontWeight: 'bold',
    color: '#00D4AA',
  },

  boostLabel: {
    fontSize: scale(8),
    color: '#00D4AA',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: width * 0.9,
    borderRadius: scale(20),
    overflow: 'hidden',
  },

  modalGradient: {
    padding: scale(20),
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(20),
  },

  modalTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  profileInfo: {
    marginBottom: scale(20),
  },

  profileName: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: scale(4),
  },

  profileEmail: {
    fontSize: scale(14),
    color: '#888',
    marginBottom: scale(4),
  },

  profileConsciousness: {
    fontSize: scale(14),
    color: '#FFD700',
  },

  logoutButton: {
    borderRadius: scale(12),
    overflow: 'hidden',
  },

  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(15),
  },

  logoutButtonText: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: scale(8),
  },
});

export default SuperGen3MenuScreen;
