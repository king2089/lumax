import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Enhanced Gen4 Responsive Design
const isTablet = width >= 768 || height >= 768;
const isLandscape = width > height;
const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';
const isIPad = Platform.OS === 'ios' && (width >= 768 || height >= 768);

// Gen4 Quantum Scale Functions
const quantumScale = (size: number): number => {
  const baseSize = isTablet ? 768 : (Platform.OS === 'ios' ? 375 : 360);
  const scaleFactor = Math.min(width, height) / baseSize;
  const minScale = 0.8;
  const maxScale = 1.5;
  const adjustedScale = Math.max(minScale, Math.min(maxScale, scaleFactor));
  return size * adjustedScale;
};

export const Gen4MenuScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'featured' | 'ai' | 'upcoming' | 'tools' | 'new'>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredFeatures, setFilteredFeatures] = useState<any[]>([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Gen4 Enhanced Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const quantumFieldAnim = useRef(new Animated.Value(0)).current;

  // Countdown timer to 09/25/2025
  useEffect(() => {
    const targetDate = new Date('2025-09-25T00:00:00Z').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);
  const searchAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gen4 Quantum Animation System
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Quantum Field Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(quantumFieldAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(quantumFieldAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for active category
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
  }, []);

  // Search animation effect
  useEffect(() => {
    if (showSearch) {
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(searchAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showSearch]);

  // Stats animation
  useEffect(() => {
    Animated.timing(statsAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Filter features based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      // Filter features based on search query
      const allFeatures = [
        { name: 'Luma AI', category: 'featured', description: 'Advanced AI Assistant' },
        { name: 'Neural Music Studio', category: 'featured', description: 'AI-powered music creation' },
        { name: 'Luma Partnership Program', category: 'featured', description: 'Post NSFW videos & get paid' },
        { name: 'Quantum Computing', category: 'upcoming', description: 'Next-gen processing', countdown: true },
        { name: 'Holographic Display', category: 'upcoming', description: '3D immersive experiences', countdown: true },
        { name: 'AI Hologram Chat', category: 'upcoming', description: '3D holographic AI conversations', countdown: true },
        { name: 'Time Travel Posts', category: 'upcoming', description: 'Send messages to past/future', countdown: true },
        { name: 'Neural Interface', category: 'upcoming', description: 'Direct brain-computer interface', countdown: true },
        { name: 'Reality Warping', category: 'upcoming', description: 'Bend reality to your will', countdown: true },
        { name: 'Developer Tools', category: 'tools', description: 'Advanced development tools' },
        { name: 'System Monitor', category: 'tools', description: 'Performance monitoring' },
      ];
      
      const filtered = allFeatures.filter(feature => 
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setFilteredFeatures(filtered);
    } else {
      setFilteredFeatures([]);
    }
  }, [searchQuery]);

  const handleFeaturePress = (featureName: string, description: string) => {
    // Add haptic feedback for better UX
    if (Platform.OS === 'ios') {
      // iOS haptic feedback - use Vibration instead of deprecated UIImpactFeedbackGenerator
      const { Vibration } = require('react-native');
      Vibration.vibrate(50);
    }
    
    if (featureName === 'Luma Partnership Program') {
      Alert.alert(
        'Luma Partnership Program - Coming Soon! 💰', 
        'Join our exclusive partnership program and monetize your content!\n\n• Post NSFW videos and get paid\n• Earn through views and engagement\n• Direct partnership with Luma\n• Advanced analytics and insights\n• Premium creator tools\n\nThis feature will be available in the next update!'
      );
    } else {
      Alert.alert(
        'Coming Soon! 🚀', 
        `${featureName} will be available in the next update!\n\n${description}\n\nStay tuned for the latest Gen4 features!`
      );
    }
  };

  const handleLumaAIPress = () => {
    // Add haptic feedback for better UX
    if (Platform.OS === 'ios') {
      const { Vibration } = require('react-native');
      Vibration.vibrate(50);
    }
    
    Alert.alert(
      'Coming Soon! 🚀', 
      'Luma AI will be available in the next update!\n\nAdvanced AI Assistant with quantum processing capabilities.\n\nStay tuned for the latest Gen4 features!'
    );
  };

  const renderFeaturedFeatures = () => (
    <View style={styles.categoryContent}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>🌟 Featured Gen4 Features</Text>
        <Text style={styles.categoryDescription}>
          Discover the most powerful Gen4 features and tools - Coming Soon in the next update!
        </Text>
      </View>
      
      <View style={styles.featuresGrid}>
        <TouchableOpacity 
          style={[styles.featureCard, styles.premiumCard]}
          onPress={handleLumaAIPress}
        >
          <LinearGradient
            colors={['#FF4081', '#E91E63']}
            style={styles.featureGradient}
          >
            <View style={styles.featureHeader}>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>1</Text>
              </View>
              <View style={styles.enhancedPremiumBadge}>
                <Text style={styles.enhancedPremiumBadgeText}>PREMIUM</Text>
              </View>
            </View>
            <View style={styles.featureIconContainer}>
              <Ionicons name="sparkles" size={quantumScale(24)} color="#fff" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Luma AI</Text>
              <Text style={styles.featureDescription}>Advanced AI Assistant</Text>
              <Text style={styles.featureStatus}>Coming Soon</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.featureCard, styles.creativeCard]}
          onPress={() => handleFeaturePress('Neural Music Studio', 'AI-powered music creation with brain-computer interface integration')}
        >
          <LinearGradient
            colors={['#9C27B0', '#6A1B9A']}
            style={styles.featureGradient}
          >
            <View style={styles.featureHeader}>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>2</Text>
              </View>
              <View style={styles.creativeBadge}>
                <Text style={styles.creativeBadgeText}>CREATIVE</Text>
              </View>
            </View>
            <View style={styles.featureIconContainer}>
              <Ionicons name="musical-notes" size={quantumScale(24)} color="#fff" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Neural Music</Text>
              <Text style={styles.featureDescription}>AI Music Creation</Text>
              <Text style={styles.featureStatus}>Coming Soon</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.featureCard, styles.monetizationCard]}
          onPress={() => handleFeaturePress('Luma Partnership Program', 'Post NSFW videos and get paid through our exclusive partnership program')}
        >
          <LinearGradient
            colors={['#FF5722', '#E64A19']}
            style={styles.featureGradient}
          >
            <View style={styles.featureHeader}>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>3</Text>
              </View>
              <View style={styles.monetizationBadge}>
                <Text style={styles.monetizationBadgeText}>EARN</Text>
              </View>
            </View>
            <View style={styles.featureIconContainer}>
              <Ionicons name="cash" size={quantumScale(24)} color="#fff" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Partnership</Text>
              <Text style={styles.featureDescription}>NSFW Videos & Get Paid</Text>
              <Text style={styles.featureStatus}>Coming Soon</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Luma Bank', 'Digital banking with $500 sign-up bonus and investment features')}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.featureGradient}
          >
            <Ionicons name="card" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Luma Bank</Text>
            <Text style={styles.featureDescription}>Digital Banking</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Security Dashboard', 'Advanced anti-hacking protection and threat monitoring')}
        >
          <LinearGradient
            colors={['#F44336', '#D32F2F']}
            style={styles.featureGradient}
          >
            <Ionicons name="shield" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Security</Text>
            <Text style={styles.featureDescription}>Threat Protection</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Profile Studio', 'Enhanced profile customization with AI-powered features')}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.newBadge]}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
            <Ionicons name="person-circle" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Profile Studio</Text>
            <Text style={styles.featureDescription}>AI Customization</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAIFeatures = () => (
    <View style={styles.categoryContent}>
      <Text style={styles.categoryDescription}>
        Explore the future of AI with Luma's advanced intelligence systems - Coming Soon!
      </Text>
      
      <View style={styles.featuresGrid}>
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Brain Computer Interface', 'Direct neural connection for enhanced AI interaction')}
        >
          <LinearGradient
            colors={['#00D4FF', '#0099CC']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.betaBadge]}>
              <Text style={styles.betaBadgeText}>BETA</Text>
            </View>
            <Ionicons name="pulse" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>BCI Integration</Text>
            <Text style={styles.featureDescription}>Neural Interface</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Voice Assistant', 'Natural language processing with voice recognition')}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.featureGradient}
          >
            <Ionicons name="mic" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Voice AI</Text>
            <Text style={styles.featureDescription}>Speech Recognition</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Content Generator', 'AI-powered content creation and optimization')}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.featureGradient}
          >
            <Ionicons name="create" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Content AI</Text>
            <Text style={styles.featureDescription}>Auto Generation</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('AI Analytics', 'Advanced analytics and insights powered by AI')}
        >
          <LinearGradient
            colors={['#9C27B0', '#6A1B9A']}
            style={styles.featureGradient}
          >
            <Ionicons name="analytics" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>AI Analytics</Text>
            <Text style={styles.featureDescription}>Smart Insights</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUpcomingFeatures = () => (
    <View style={styles.categoryContent}>
      <Text style={styles.categoryDescription}>
        Get a sneak peek at the next generation of Gen4 features - 100+ revolutionary features coming soon!
      </Text>
      
      <View style={styles.featuresGrid}>
        {/* Quantum & Advanced Computing */}
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Quantum Computing', 'Quantum-powered computing and processing capabilities')}
        >
          <LinearGradient
            colors={['#00D4FF', '#0099CC']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.comingSoonBadge]}>
              <Text style={styles.comingSoonBadgeText}>SOON</Text>
            </View>
            <Ionicons name="infinite" size={quantumScale(24)} color="#fff" />
            <Text style={styles.featureTitle}>Quantum Computing</Text>
            <Text style={styles.featureDescription}>Next-Gen Processing</Text>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
              </Text>
              <Text style={styles.countdownLabel}>Until Launch</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Holographic Display', '3D holographic content and immersive experiences')}
        >
          <LinearGradient
            colors={['#9C27B0', '#6A1B9A']}
            style={styles.featureGradient}
          >
            <Ionicons name="cube" size={quantumScale(24)} color="#fff" />
            <Text style={styles.featureTitle}>Holographic</Text>
            <Text style={styles.featureDescription}>3D Immersion</Text>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
              </Text>
              <Text style={styles.countdownLabel}>Until Launch</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Neural Network', 'Advanced neural network training and optimization')}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.featureGradient}
          >
            <Ionicons name="git-network" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Neural Network</Text>
            <Text style={styles.featureDescription}>Deep Learning</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Reality Augmentation', 'Mixed reality and augmented world experiences')}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.featureGradient}
          >
            <Ionicons name="eye" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Reality AR</Text>
            <Text style={styles.featureDescription}>Mixed Reality</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Gen2 Revolutionary Features */}
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('AI Hologram Chat', 'Talk to AI in stunning 3D holographic environments')}
        >
          <LinearGradient
            colors={['#9C27B0', '#E91E63']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.gen2Badge]}>
              <Text style={styles.gen2BadgeText}>GEN2</Text>
            </View>
            <Ionicons name="cube" size={quantumScale(24)} color="#fff" />
            <Text style={styles.featureTitle}>AI Hologram</Text>
            <Text style={styles.featureDescription}>3D AI Chat</Text>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
              </Text>
              <Text style={styles.countdownLabel}>Until Launch</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Quantum Messaging', 'Instant messaging across parallel universes')}
        >
          <LinearGradient
            colors={['#00BCD4', '#009688']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.gen2Badge]}>
              <Text style={styles.gen2BadgeText}>GEN2</Text>
            </View>
            <Ionicons name="infinite" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Quantum Msg</Text>
            <Text style={styles.featureDescription}>Parallel Chat</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Neural Interface', 'Control the app with your thoughts')}
        >
          <LinearGradient
            colors={['#FF5722', '#FF9800']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.gen2Badge]}>
              <Text style={styles.gen2BadgeText}>GEN2</Text>
            </View>
            <Ionicons name="bulb" size={quantumScale(24)} color="#fff" />
            <Text style={styles.featureTitle}>Neural Control</Text>
            <Text style={styles.featureDescription}>Mind Control</Text>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
              </Text>
              <Text style={styles.countdownLabel}>Until Launch</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Time Travel Posts', 'Send messages to the past and future')}
        >
          <LinearGradient
            colors={['#673AB7', '#3F51B5']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.comingSoonBadge]}>
              <Text style={styles.comingSoonBadgeText}>Q4 2025</Text>
            </View>
            <Ionicons name="time" size={quantumScale(24)} color="#fff" />
            <Text style={styles.featureTitle}>Time Travel</Text>
            <Text style={styles.featureDescription}>Past & Future</Text>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
              </Text>
              <Text style={styles.countdownLabel}>Until Launch</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Dimensional Portals', 'Create portals to other dimensions')}
        >
          <LinearGradient
            colors={['#4CAF50', '#8BC34A']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.alphaBadge]}>
              <Text style={styles.alphaBadgeText}>ALPHA</Text>
            </View>
            <Ionicons name="planet" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Dimensional</Text>
            <Text style={styles.featureDescription}>Portals</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Reality Bending', 'Bend the laws of physics in your posts')}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.comingSoonBadge]}>
              <Text style={styles.comingSoonBadgeText}>Q2 2026</Text>
            </View>
            <Ionicons name="sparkles" size={quantumScale(24)} color="#fff" />
            <Text style={styles.featureTitle}>Reality Bend</Text>
            <Text style={styles.featureDescription}>Physics Break</Text>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
              </Text>
              <Text style={styles.countdownLabel}>Until Launch</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Music & Entertainment */}
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Luma Records', 'Record deals, VIP artist access, exclusive releases')}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.featureGradient}
          >
            <Ionicons name="musical-notes" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Luma Records</Text>
            <Text style={styles.featureDescription}>Music Label</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('AI Music Generation', 'AI-powered music composition and remixing')}
        >
          <LinearGradient
            colors={['#FF6B9D', '#E91E63']}
            style={styles.featureGradient}
          >
            <Ionicons name="musical-note" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>AI Music</Text>
            <Text style={styles.featureDescription}>Auto Compose</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Neural Music Sync', 'Brain-computer interface for music synchronization')}
        >
          <LinearGradient
            colors={['#00D4FF', '#0099CC']}
            style={styles.featureGradient}
          >
            <Ionicons name="pulse" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Neural Music</Text>
            <Text style={styles.featureDescription}>Brain Sync</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Gaming & Interactive */}
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Luma Game Engine', 'Advanced game development and 3D rendering')}
        >
          <LinearGradient
            colors={['#9C27B0', '#6A1B9A']}
            style={styles.featureGradient}
          >
            <Ionicons name="game-controller" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Game Engine</Text>
            <Text style={styles.featureDescription}>3D Gaming</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Mobile Game Studio', 'Create and optimize games for mobile devices')}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.featureGradient}
          >
            <Ionicons name="phone-portrait" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Game Studio</Text>
            <Text style={styles.featureDescription}>Mobile Dev</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Interactive Stories', 'AI-powered interactive storytelling with choices')}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.featureGradient}
          >
            <Ionicons name="book" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Story AI</Text>
            <Text style={styles.featureDescription}>Interactive</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Social & Communication */}
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Holographic Stories', '3D holographic story creation and sharing')}
        >
          <LinearGradient
            colors={['#00BCD4', '#009688']}
            style={styles.featureGradient}
          >
            <Ionicons name="sparkles" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Holo Stories</Text>
            <Text style={styles.featureDescription}>3D Content</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Quantum Social', 'Social networking across multiple dimensions')}
        >
          <LinearGradient
            colors={['#673AB7', '#3F51B5']}
            style={styles.featureGradient}
          >
            <Ionicons name="people" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Quantum Social</Text>
            <Text style={styles.featureDescription}>Multi-Dim</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Neural Chat', 'Brain-to-brain communication interface')}
        >
          <LinearGradient
            colors={['#FF5722', '#FF9800']}
            style={styles.featureGradient}
          >
            <Ionicons name="chatbubbles" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Neural Chat</Text>
            <Text style={styles.featureDescription}>Brain Chat</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Advanced AI & Machine Learning */}
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('AI Collaboration', 'Multi-AI collaboration and team building')}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.featureGradient}
          >
            <Ionicons name="people-circle" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>AI Teams</Text>
            <Text style={styles.featureDescription}>Collaboration</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Predictive Analytics', 'AI-powered future prediction and forecasting')}
        >
          <LinearGradient
            colors={['#9C27B0', '#6A1B9A']}
            style={styles.featureGradient}
          >
            <Ionicons name="trending-up" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Predictive AI</Text>
            <Text style={styles.featureDescription}>Future Sight</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Emotional AI', 'AI that understands and responds to emotions')}
        >
          <LinearGradient
            colors={['#FF6B9D', '#E91E63']}
            style={styles.featureGradient}
          >
            <Ionicons name="heart" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Emotional AI</Text>
            <Text style={styles.featureDescription}>Feel & Respond</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Creative & Media */}
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('3D Content Creator', 'Create immersive 3D content and experiences')}
        >
          <LinearGradient
            colors={['#00D4FF', '#0099CC']}
            style={styles.featureGradient}
          >
            <Ionicons name="cube" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>3D Creator</Text>
            <Text style={styles.featureDescription}>Immersive</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('AI Video Editor', 'AI-powered video editing and enhancement')}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.featureGradient}
          >
            <Ionicons name="videocam" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>AI Video</Text>
            <Text style={styles.featureDescription}>Auto Edit</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Holographic Photography', 'Capture and share 3D holographic images')}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.featureGradient}
          >
            <Ionicons name="camera" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Holo Photos</Text>
            <Text style={styles.featureDescription}>3D Capture</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Business & Productivity */}
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('AI Business Suite', 'Complete AI-powered business management')}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.featureGradient}
          >
            <Ionicons name="briefcase" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>AI Business</Text>
            <Text style={styles.featureDescription}>Management</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Quantum Security', 'Unbreakable quantum encryption and security')}
        >
          <LinearGradient
            colors={['#9C27B0', '#6A1B9A']}
            style={styles.featureGradient}
          >
            <Ionicons name="shield-checkmark" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Quantum Security</Text>
            <Text style={styles.featureDescription}>Unbreakable</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Neural Commerce', 'Brain-computer interface for shopping')}
        >
          <LinearGradient
            colors={['#FF6B9D', '#E91E63']}
            style={styles.featureGradient}
          >
            <Ionicons name="cart" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Neural Shop</Text>
            <Text style={styles.featureDescription}>Mind Shopping</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Health & Wellness */}
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('AI Health Monitor', 'Comprehensive health monitoring and AI diagnosis')}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.featureGradient}
          >
            <Ionicons name="fitness" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>AI Health</Text>
            <Text style={styles.featureDescription}>Monitoring</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Neural Therapy', 'Brain-computer interface for mental health')}
        >
          <LinearGradient
            colors={['#00D4FF', '#0099CC']}
            style={styles.featureGradient}
          >
            <Ionicons name="medical" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Neural Therapy</Text>
            <Text style={styles.featureDescription}>Mental Health</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Quantum Healing', 'Quantum technology for advanced healing')}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.featureGradient}
          >
            <Ionicons name="leaf" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Quantum Healing</Text>
            <Text style={styles.featureDescription}>Advanced Care</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Education & Learning */}
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('AI Learning Platform', 'Personalized AI-powered education')}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.featureGradient}
          >
            <Ionicons name="school" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>AI Learning</Text>
            <Text style={styles.featureDescription}>Education</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Holographic Classes', '3D immersive educational experiences')}
        >
          <LinearGradient
            colors={['#9C27B0', '#6A1B9A']}
            style={styles.featureGradient}
          >
            <Ionicons name="cube" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Holo Classes</Text>
            <Text style={styles.featureDescription}>3D Learning</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Neural Training', 'Brain-computer interface for skill development')}
        >
          <LinearGradient
            colors={['#FF6B9D', '#E91E63']}
            style={styles.featureGradient}
          >
            <Ionicons name="bulb" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Neural Training</Text>
            <Text style={styles.featureDescription}>Skill Dev</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* More Features Coming Soon */}
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('100+ More Features', 'Explore the complete roadmap of Gen4 features')}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.comingSoonBadge]}>
              <Text style={styles.comingSoonBadgeText}>100+</Text>
            </View>
            <Ionicons name="sparkles" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>100+ More</Text>
            <Text style={styles.featureDescription}>Features</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTools = () => (
    <View style={styles.categoryContent}>
      <Text style={styles.categoryDescription}>
        Essential tools and utilities for power users - Coming Soon in the next update!
      </Text>
      
      <View style={styles.featuresGrid}>
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Developer Tools', 'Advanced development and debugging tools')}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.premiumBadge]}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
            <Ionicons name="code" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Dev Tools</Text>
            <Text style={styles.featureDescription}>Development</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('System Monitor', 'Real-time system performance monitoring')}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.featureGradient}
          >
            <Ionicons name="speedometer" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>System Monitor</Text>
            <Text style={styles.featureDescription}>Performance</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Data Analytics', 'Comprehensive data analysis and visualization')}
        >
          <LinearGradient
            colors={['#9C27B0', '#6A1B9A']}
            style={styles.featureGradient}
          >
            <Ionicons name="bar-chart" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Data Analytics</Text>
            <Text style={styles.featureDescription}>Insights</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('API Manager', 'Manage and monitor API integrations')}
        >
          <LinearGradient
            colors={['#00D4FF', '#0099CC']}
            style={styles.featureGradient}
          >
            <Ionicons name="settings" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>API Manager</Text>
            <Text style={styles.featureDescription}>Integration</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNewFeatures = () => (
    <View style={styles.categoryContent}>
      <Text style={styles.categoryDescription}>
        Latest features and updates - fresh from the Gen4 development lab! Coming Soon!
      </Text>
      
      <View style={styles.featuresGrid}>
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Enhanced Menu System', 'New menu with 100+ features and improved navigation')}
        >
          <LinearGradient
            colors={['#FF6B9D', '#E91E63']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.newBadge]}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
            <Ionicons name="menu" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Enhanced Menu</Text>
            <Text style={styles.featureDescription}>100+ Features</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Advanced Search', 'Smart search with real-time filtering and suggestions')}
        >
          <LinearGradient
            colors={['#00D4FF', '#0099CC']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.newBadge]}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
            <Ionicons name="search" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Smart Search</Text>
            <Text style={styles.featureDescription}>Real-time Filter</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Quick Stats', 'Instant overview of Gen4 capabilities and progress')}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.newBadge]}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
            <Ionicons name="analytics" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Quick Stats</Text>
            <Text style={styles.featureDescription}>Progress Overview</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => handleFeaturePress('Feature Categories', 'Organized feature browsing by technology type')}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.featureGradient}
          >
            <View style={[styles.featureBadge, styles.newBadge]}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
            <Ionicons name="grid" size={quantumScale(32)} color="#fff" />
            <Text style={styles.featureTitle}>Categories</Text>
            <Text style={styles.featureDescription}>Organized Browse</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Gen4 Quantum Field Background */}
      <Animated.View 
        style={[
          styles.quantumFieldBackground,
          {
            opacity: quantumFieldAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.3],
            }),
          },
        ]}
      />
      
      {/* Enhanced Background Gradient */}
      <LinearGradient
        colors={['rgba(0,212,255,0.05)', 'rgba(147,39,176,0.05)', 'rgba(255,107,157,0.05)']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gen4 Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Gen4 Menu</Text>
            <Text style={styles.headerSubtitle}>
              {activeCategory === 'featured' && '🌟 6 Featured Features - Coming Soon!'}
              {activeCategory === 'ai' && '🤖 4 AI-Powered Tools - Coming Soon!'}
              {activeCategory === 'upcoming' && '🚀 4 Future Features - Coming Soon!'}
              {activeCategory === 'tools' && '🛠️ 4 Essential Tools - Coming Soon!'}
              {activeCategory === 'new' && '🆕 4 Latest Additions - Coming Soon!'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Ionicons name="search" size={quantumScale(24)} color="#00D4FF" />
            </TouchableOpacity>
            <View style={styles.headerIcon}>
              <Ionicons name="menu" size={quantumScale(32)} color="#00D4FF" />
            </View>
          </View>
        </Animated.View>

        {/* Search Bar */}
        {showSearch && (
          <Animated.View 
            style={[
              styles.searchContainer,
              {
                opacity: searchAnim,
                transform: [{ scale: searchAnim }]
              }
            ]}
          >
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={quantumScale(20)} color="rgba(255,255,255,0.6)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search features..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={quantumScale(20)} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        {/* Quick Stats Section */}
        <Animated.View 
          style={[
            styles.quickStatsSection,
            {
              opacity: statsAnim,
              transform: [{ translateY: statsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })}],
            },
          ]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <LinearGradient colors={['#00D4FF', '#0099CC']} style={styles.statGradient}>
                <Ionicons name="sparkles" size={quantumScale(20)} color="#fff" />
                <Text style={styles.statNumber}>100+</Text>
                <Text style={styles.statLabel}>Coming Soon</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statItem}>
              <LinearGradient colors={['#FF6B9D', '#E91E63']} style={styles.statGradient}>
                <Ionicons name="trending-up" size={quantumScale(20)} color="#fff" />
                <Text style={styles.statNumber}>Gen4</Text>
                <Text style={styles.statLabel}>Next Update</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statItem}>
              <LinearGradient colors={['#4CAF50', '#45A049']} style={styles.statGradient}>
                <Ionicons name="rocket" size={quantumScale(20)} color="#fff" />
                <Text style={styles.statNumber}>2025</Text>
                <Text style={styles.statLabel}>Coming Soon</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statItem}>
              <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.statGradient}>
                <Ionicons name="infinite" size={quantumScale(20)} color="#fff" />
                <Text style={styles.statNumber}>∞</Text>
                <Text style={styles.statLabel}>Coming Soon</Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* Search Results */}
        {searchQuery.trim() && filteredFeatures.length > 0 && (
          <Animated.View 
            style={[
              styles.searchResultsSection,
              {
                opacity: searchAnim,
                transform: [{ scale: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                })}],
              },
            ]}
          >
            <Text style={styles.searchResultsTitle}>
              Search Results for "{searchQuery}"
            </Text>
            <View style={styles.searchResultsGrid}>
              {filteredFeatures.map((feature, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.searchResultCard}
                  onPress={() => handleFeaturePress(feature.name, feature.description)}
                >
                  <LinearGradient
                    colors={['rgba(0,212,255,0.2)', 'rgba(0,212,255,0.1)']}
                    style={styles.searchResultGradient}
                  >
                    <Text style={styles.searchResultName}>{feature.name}</Text>
                    <Text style={styles.searchResultDescription}>{feature.description}</Text>
                    {feature.countdown && (
                      <View style={styles.countdownContainer}>
                        <Text style={styles.countdownText}>
                          {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                        </Text>
                        <Text style={styles.countdownLabel}>Until Launch</Text>
                      </View>
                    )}
                    <View style={styles.searchResultCategory}>
                      <Text style={styles.searchResultCategoryText}>{feature.category}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Category Tabs */}
        <View style={styles.categoryNav}>
          <TouchableOpacity 
            style={[
              styles.categoryTab, 
              activeCategory === 'featured' && styles.categoryTabActive,
              activeCategory === 'featured' && {
                transform: [{ scale: pulseAnim }]
              }
            ]}
            onPress={() => setActiveCategory('featured')}
          >
            <Text style={[styles.categoryTabText, activeCategory === 'featured' && styles.categoryTabTextActive]}>
              🌟 Featured
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'ai' && styles.categoryTabActive]}
            onPress={() => setActiveCategory('ai')}
          >
            <Text style={[styles.categoryTabText, activeCategory === 'ai' && styles.categoryTabTextActive]}>
              🤖 AI Features
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryTab, 
              activeCategory === 'upcoming' && styles.categoryTabActive,
              activeCategory === 'upcoming' && {
                transform: [{ scale: pulseAnim }]
              }
            ]}
            onPress={() => setActiveCategory('upcoming')}
          >
            <Text style={[styles.categoryTabText, activeCategory === 'upcoming' && styles.categoryTabTextActive]}>
              🚀 Upcoming
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'tools' && styles.categoryTabActive]}
            onPress={() => setActiveCategory('tools')}
          >
            <Text style={[styles.categoryTabText, activeCategory === 'tools' && styles.categoryTabTextActive]}>
              🛠️ Tools
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'new' && styles.categoryTabActive]}
            onPress={() => setActiveCategory('new')}
          >
            <Text style={[styles.categoryTabText, activeCategory === 'new' && styles.categoryTabTextActive]}>
              🆕 New
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Content */}
        {activeCategory === 'featured' && renderFeaturedFeatures()}
        {activeCategory === 'ai' && renderAIFeatures()}
        {activeCategory === 'upcoming' && renderUpcomingFeatures()}
        {activeCategory === 'tools' && renderTools()}
        {activeCategory === 'new' && renderNewFeatures()}
        {activeCategory === 'new' && renderNewFeatures()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  quantumFieldBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: -2,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: quantumScale(100),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: quantumScale(20),
    paddingTop: Platform.OS === 'android' ? quantumScale(30) : quantumScale(60),
    paddingBottom: quantumScale(20),
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: quantumScale(28),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: quantumScale(4),
  },
  headerSubtitle: {
    fontSize: quantumScale(16),
    color: 'rgba(255,255,255,0.7)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: quantumScale(12),
  },
  headerButton: {
    width: quantumScale(44),
    height: quantumScale(44),
    borderRadius: quantumScale(22),
    backgroundColor: 'rgba(0,212,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
  },
  headerIcon: {
    width: quantumScale(60),
    height: quantumScale(60),
    borderRadius: quantumScale(30),
    backgroundColor: 'rgba(0,212,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: quantumScale(20),
    marginBottom: quantumScale(20),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: quantumScale(25),
    paddingHorizontal: quantumScale(16),
    paddingVertical: quantumScale(12),
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: quantumScale(16),
    marginLeft: quantumScale(12),
    marginRight: quantumScale(8),
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: quantumScale(20),
    marginBottom: quantumScale(20),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: quantumScale(24),
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: quantumScale(4),
  },
  statLabel: {
    fontSize: quantumScale(12),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: quantumScale(40),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  categoryNav: {
    flexDirection: 'row',
    paddingHorizontal: quantumScale(20),
    marginBottom: quantumScale(20),
    gap: quantumScale(8),
  },
  categoryTab: {
    flex: 1,
    paddingVertical: quantumScale(10),
    paddingHorizontal: quantumScale(8),
    borderRadius: quantumScale(16),
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    minWidth: quantumScale(80),
  },
  categoryTabActive: {
    backgroundColor: 'rgba(0,212,255,0.2)',
    borderWidth: 1,
    borderColor: '#00D4FF',
  },
  categoryTabText: {
    fontSize: quantumScale(12),
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#00D4FF',
  },
  categoryContent: {
    paddingHorizontal: quantumScale(20),
  },
  categoryDescription: {
    fontSize: quantumScale(16),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: quantumScale(24),
    lineHeight: quantumScale(24),
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: quantumScale(16),
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    height: quantumScale(140),
    borderRadius: quantumScale(12),
    overflow: 'hidden',
    marginBottom: quantumScale(12),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  featureGradient: {
    padding: quantumScale(12),
    alignItems: 'center',
    gap: quantumScale(8),
    minHeight: quantumScale(140),
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: quantumScale(14),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: quantumScale(10),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  featureBadge: {
    position: 'absolute',
    top: quantumScale(8),
    right: quantumScale(8),
    width: quantumScale(24),
    height: quantumScale(24),
    borderRadius: quantumScale(12),
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureBadgeText: {
    fontSize: quantumScale(10),
    fontWeight: 'bold',
    color: '#000',
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    width: quantumScale(36),
    height: quantumScale(20),
    borderRadius: quantumScale(10),
  },
  newBadgeText: {
    fontSize: quantumScale(8),
    fontWeight: 'bold',
    color: '#fff',
  },
  comingSoonBadge: {
    backgroundColor: '#FF9800',
    width: quantumScale(40),
    height: quantumScale(20),
    borderRadius: quantumScale(10),
  },
  comingSoonBadgeText: {
    fontSize: quantumScale(8),
    fontWeight: 'bold',
    color: '#fff',
  },
  betaBadge: {
    backgroundColor: '#9C27B0',
    width: quantumScale(32),
    height: quantumScale(20),
    borderRadius: quantumScale(10),
  },
  betaBadgeText: {
    fontSize: quantumScale(8),
    fontWeight: 'bold',
    color: '#fff',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    width: quantumScale(28),
    height: quantumScale(20),
    borderRadius: quantumScale(10),
  },
  premiumBadgeText: {
    fontSize: quantumScale(8),
    fontWeight: 'bold',
    color: '#000',
  },
  hotBadge: {
    backgroundColor: '#F44336',
    width: quantumScale(28),
    height: quantumScale(20),
    borderRadius: quantumScale(10),
  },
  hotBadgeText: {
    fontSize: quantumScale(8),
    fontWeight: 'bold',
    color: '#fff',
  },
  gen2Badge: {
    backgroundColor: '#9C27B0',
    width: quantumScale(36),
    height: quantumScale(20),
    borderRadius: quantumScale(10),
  },
  gen2BadgeText: {
    fontSize: quantumScale(8),
    fontWeight: 'bold',
    color: '#fff',
  },
  alphaBadge: {
    backgroundColor: '#FF5722',
    width: quantumScale(36),
    height: quantumScale(20),
    borderRadius: quantumScale(10),
  },
  alphaBadgeText: {
    fontSize: quantumScale(8),
    fontWeight: 'bold',
    color: '#fff',
  },
  quickStatsSection: {
    paddingHorizontal: quantumScale(20),
    marginBottom: quantumScale(20),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: quantumScale(16),
    paddingVertical: quantumScale(10),
    paddingHorizontal: quantumScale(15),
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
  },
  statGradient: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: quantumScale(8),
    paddingHorizontal: quantumScale(12),
    borderRadius: quantumScale(12),
  },
  searchResultsSection: {
    paddingHorizontal: quantumScale(20),
    marginBottom: quantumScale(20),
  },
  searchResultsTitle: {
    fontSize: quantumScale(18),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: quantumScale(12),
    textAlign: 'center',
  },
  searchResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: quantumScale(12),
    justifyContent: 'space-between',
  },
  searchResultCard: {
    width: '48%',
    borderRadius: quantumScale(12),
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchResultGradient: {
    padding: quantumScale(12),
    minHeight: quantumScale(80),
    justifyContent: 'space-between',
  },
  searchResultName: {
    fontSize: quantumScale(14),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: quantumScale(4),
  },
  searchResultDescription: {
    fontSize: quantumScale(11),
    color: 'rgba(255,255,255,0.7)',
    marginBottom: quantumScale(4),
  },
  searchResultCategory: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: quantumScale(8),
    paddingVertical: quantumScale(4),
    paddingHorizontal: quantumScale(8),
  },
  searchResultCategoryText: {
    fontSize: quantumScale(10),
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  // Enhanced Layout Styles
  categoryHeader: {
    marginBottom: quantumScale(20),
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: quantumScale(24),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: quantumScale(8),
    textAlign: 'center',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: quantumScale(8),
  },
  featureIconContainer: {
    alignItems: 'center',
    marginBottom: quantumScale(8),
  },
  featureContent: {
    alignItems: 'center',
  },
  featureStatus: {
    fontSize: quantumScale(12),
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
    marginTop: quantumScale(4),
  },
  // Card Type Styles
  premiumCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  creativeCard: {
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  monetizationCard: {
    borderWidth: 2,
    borderColor: '#FF5722',
  },
  // Badge Styles
  enhancedPremiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: quantumScale(6),
    paddingVertical: quantumScale(2),
    borderRadius: quantumScale(8),
  },
  enhancedPremiumBadgeText: {
    fontSize: quantumScale(8),
    fontWeight: 'bold',
    color: '#000',
  },
  creativeBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: quantumScale(6),
    paddingVertical: quantumScale(2),
    borderRadius: quantumScale(8),
  },
  creativeBadgeText: {
    fontSize: quantumScale(8),
    fontWeight: 'bold',
    color: '#fff',
  },
  monetizationBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: quantumScale(6),
    paddingVertical: quantumScale(2),
    borderRadius: quantumScale(8),
  },
  monetizationBadgeText: {
    fontSize: quantumScale(8),
    fontWeight: 'bold',
    color: '#fff',
  },
  countdownContainer: {
    alignItems: 'center',
    marginTop: quantumScale(4),
    paddingVertical: quantumScale(2),
    paddingHorizontal: quantumScale(4),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: quantumScale(6),
  },
  countdownText: {
    fontSize: quantumScale(8),
    fontWeight: 'bold',
    color: '#00D4FF',
    textAlign: 'center',
  },
  countdownLabel: {
    fontSize: quantumScale(6),
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: quantumScale(1),
  },
});

export default Gen4MenuScreen;
