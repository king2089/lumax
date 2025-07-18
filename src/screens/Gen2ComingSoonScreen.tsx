import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AutoUpdateService from '../services/AutoUpdateService';
import PreRegistrationService from '../services/PreRegistrationService';
import { usePreRegistration } from '../context/PreRegistrationContext';

const { width, height } = Dimensions.get('window');

const GEN2_FEATURES = [
  {
    id: 'game-engine',
    title: '🎮 Luma Game Engine',
    description: 'Full 3D gaming platform with real-time physics and AI-powered game development',
    icon: 'game-controller',
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E53'],
    details: [
      'Real-time 3D rendering',
      'Advanced physics engine',
      'AI-powered game development',
      'Cross-platform compatibility'
    ]
  },
  {
    id: 'metaverse',
    title: '🌐 Metaverse Integration',
    description: 'Virtual worlds with 3D avatars and interactive experiences',
    icon: 'globe',
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#44A08D'],
    details: [
      '3D virtual environments',
      'Customizable avatars',
      'Real-time social interactions',
      'Virtual economy system'
    ]
  },
  {
    id: 'ai-gen2',
    title: '🎯 Gen 2 AI',
    description: 'Advanced AI with reasoning, creativity, and real-time learning',
    icon: 'sparkles',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#E91E63'],
    details: [
      'Advanced reasoning capabilities',
      'Real-time learning',
      'Creative content generation',
      'Personalized experiences'
    ]
  },
  {
    id: '3d-creation',
    title: '🎨 3D Content Creation',
    description: 'Professional 3D modeling, animation, and real-time editing tools',
    icon: 'color-palette',
    color: '#FF9800',
    gradient: ['#FF9800', '#FF5722'],
    details: [
      '3D modeling tools',
      'Real-time animation',
      'Professional rendering',
      'Asset marketplace'
    ]
  },
  {
    id: 'gaming',
    title: '🎲 Gaming Platform',
    description: 'Built-in game marketplace with multiplayer experiences',
    icon: 'dice',
    color: '#00C853',
    gradient: ['#00C853', '#64DD17'],
    details: [
      'Game marketplace',
      'Multiplayer gaming',
      'Real-time physics',
      'Monetization tools'
    ]
  },
  {
    id: 'virtual-events',
    title: '🎪 Virtual Events',
    description: 'Interactive live events, concerts, and virtual strip club experiences',
    icon: 'musical-notes',
    color: '#E91E63',
    gradient: ['#E91E63', '#C2185B'],
    details: [
      'Live virtual concerts',
      'Interactive events',
      '3D adult entertainment',
      'Real-time streaming'
    ]
  },
  {
    id: 'ai-fanbase',
    title: '🤖 AI Real-Time Fan Base',
    description: 'AI-powered fan management with real-time analytics and automated engagement',
    icon: 'people-circle',
    color: '#667eea',
    gradient: ['#667eea', '#764ba2'],
    details: [
      'Real-time fan analytics',
      'AI-powered engagement',
      'Automated fan interactions',
      'Predictive fan growth'
    ]
  }
];

export const Gen2ComingSoonScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedFeature, setSelectedFeature] = useState<typeof GEN2_FEATURES[0] | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPreRegistration, setShowPreRegistration] = useState(false);
  const [email, setEmail] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  const { 
    isPreRegistered, 
    preRegistrationStats, 
    preRegister, 
    refreshStats 
  } = usePreRegistration();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Load pre-registration data
    loadPreRegistrationData();
  }, []);

  const loadPreRegistrationData = async () => {
    try {
      await refreshStats();
    } catch (error) {
      console.log('Error loading pre-registration data:', error);
    }
  };

  const handleGen2Update = async () => {
    try {
      const autoUpdateService = AutoUpdateService.getInstance();
      await autoUpdateService.checkGen2Updates();
    } catch (error) {
      console.log('Error checking Gen 2 updates:', error);
    }
  };

  const handlePreRegistration = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      await preRegister(email);
      setShowPreRegistration(false);
      
      Alert.alert(
        'Pre-registration Successful! 🎉',
        'You\'ll be among the first to experience Luma Gen 2 when it launches in 2025. We\'ll notify you about early access opportunities and exclusive updates.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to pre-register. Please try again.');
    }
  };

  const renderFeatureCard = (feature: typeof GEN2_FEATURES[0]) => (
    <TouchableOpacity
      key={feature.id}
      style={styles.featureCard}
      onPress={() => setSelectedFeature(feature)}
    >
      <LinearGradient
        colors={feature.gradient}
        style={styles.featureGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.featureHeader}>
          <View style={styles.featureIcon}>
            <Ionicons name={feature.icon as any} size={32} color="#fff" />
          </View>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        </View>
        <View style={styles.featureDetails}>
          {feature.details.map((detail, index) => (
            <View key={index} style={styles.detailItem}>
              <View style={styles.detailDot} />
              <Text style={styles.detailText}>{detail}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.gen2Title}>🚀 Luma Gen 2</Text>
            <Text style={styles.gen2Subtitle}>Coming 2025</Text>
          </View>
          <TouchableOpacity style={styles.updateButton} onPress={handleGen2Update}>
            <Ionicons name="cloud-download" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.heroTitle}>The Future of Social Gaming</Text>
            <Text style={styles.heroDescription}>
              Experience the next generation of Luma with 3D gaming, AI-powered experiences, 
              and a complete metaverse platform launching in 2025.
            </Text>
            
            {/* Pre-registration Stats */}
            <View style={styles.preRegistrationStats}>
              <Text style={styles.statsText}>
                <Text style={styles.statsNumber}>{preRegistrationStats.totalRegistrations.toLocaleString()}</Text> people have pre-registered
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.earlyAccessButton}
              onPress={() => setShowPreRegistration(true)}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                style={styles.earlyAccessGradient}
              >
                <Text style={styles.earlyAccessText}>
                  {isPreRegistered ? 'Pre-registered ✓' : 'Pre-register Now'}
                </Text>
                <Ionicons name={isPreRegistered ? "checkmark-circle" : "rocket"} size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Features Grid */}
        <ScrollView 
          style={styles.featuresContainer} 
          contentContainerStyle={styles.featuresContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>🎮 Gen 2 Features</Text>
          <View style={styles.featuresGrid}>
            {GEN2_FEATURES.map(renderFeatureCard)}
          </View>

          {/* System Requirements */}
          <View style={styles.requirementsSection}>
            <Text style={styles.sectionTitle}>💻 System Requirements</Text>
            <View style={styles.requirementsGrid}>
              <View style={styles.requirementItem}>
                <Ionicons name="hardware-chip" size={24} color="#4ECDC4" />
                <Text style={styles.requirementLabel}>RAM</Text>
                <Text style={styles.requirementValue}>8GB+</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons name="save" size={24} color="#FF9800" />
                <Text style={styles.requirementLabel}>Storage</Text>
                <Text style={styles.requirementValue}>50GB+</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons name="speedometer" size={24} color="#9C27B0" />
                <Text style={styles.requirementLabel}>GPU</Text>
                <Text style={styles.requirementValue}>Metal/Vulkan</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons name="wifi" size={24} color="#00C853" />
                <Text style={styles.requirementLabel}>Network</Text>
                <Text style={styles.requirementValue}>5G/WiFi 6</Text>
              </View>
            </View>
          </View>

          {/* Coming Soon Timeline */}
          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>📅 2025-2026 Release Timeline</Text>
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>Q2 2025</Text>
                  <Text style={styles.timelineTitle}>Pre-registration Opens</Text>
                  <Text style={styles.timelineDescription}>Sign up for early access and exclusive updates</Text>
                </View>
              </View>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>July 16, 2025</Text>
                  <Text style={styles.timelineTitle}>Developer Preview</Text>
                  <Text style={styles.timelineDescription}>First look at Gen 2 features and capabilities</Text>
                </View>
              </View>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>Q3 2025</Text>
                  <Text style={styles.timelineTitle}>Closed Beta</Text>
                  <Text style={styles.timelineDescription}>Limited beta testing with select pre-registered users</Text>
                </View>
              </View>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>Q4 2025</Text>
                  <Text style={styles.timelineTitle}>Open Beta</Text>
                  <Text style={styles.timelineDescription}>Public beta with full feature set for all pre-registered users</Text>
                </View>
              </View>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotActive]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>Q1 2026</Text>
                  <Text style={styles.timelineTitle}>Official Launch</Text>
                  <Text style={styles.timelineDescription}>Full Gen 2 release with all features available to everyone</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Pre-registration Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>🎁 Pre-registration Benefits</Text>
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitItem}>
                <Ionicons name="star" size={24} color="#FFD700" />
                <Text style={styles.benefitTitle}>Early Access</Text>
                <Text style={styles.benefitDescription}>Be among the first to experience Gen 2</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="gift" size={24} color="#FF6B6B" />
                <Text style={styles.benefitTitle}>Exclusive Rewards</Text>
                <Text style={styles.benefitDescription}>Get special in-game items and bonuses</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="notifications" size={24} color="#4ECDC4" />
                <Text style={styles.benefitTitle}>Priority Updates</Text>
                <Text style={styles.benefitDescription}>Receive updates and news first</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="people" size={24} color="#9C27B0" />
                <Text style={styles.benefitTitle}>Founder Status</Text>
                <Text style={styles.benefitDescription}>Special recognition as an early supporter</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Pre-registration Modal */}
      {showPreRegistration && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>🚀 Pre-register for Luma Gen 2</Text>
              <Text style={styles.modalDescription}>
                Be among the first to experience the future of social gaming. Get early access, exclusive rewards, and priority updates.
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email address"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowPreRegistration(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.registerButton}
                  onPress={handlePreRegistration}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E53']}
                    style={styles.registerGradient}
                  >
                    <Text style={styles.registerButtonText}>Pre-register</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  gen2Title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  gen2Subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  updateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    marginBottom: 24,
  },
  heroGradient: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  preRegistrationStats: {
    marginBottom: 24,
  },
  statsText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  earlyAccessButton: {
    borderRadius: 25,
    overflow: 'hidden',
    minWidth: 200,
  },
  earlyAccessGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  earlyAccessText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  featuresContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  featuresContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  featureGradient: {
    padding: 20,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  featureDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  requirementsSection: {
    marginBottom: 32,
  },
  requirementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  requirementItem: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  requirementValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  timelineSection: {
    marginBottom: 32,
  },
  timeline: {
    gap: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
    marginRight: 16,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  benefitItem: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  benefitDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  emailInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  registerButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  registerGradient: {
    padding: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 