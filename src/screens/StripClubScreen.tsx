import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ScrollView,
  Animated,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AutoUpdateService from '../services/AutoUpdateService';
import SystemRequirements from '../components/SystemRequirements';
import { scale, responsiveStyle } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

export const StripClubScreen: React.FC = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [age, setAge] = useState('');
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Check for Strip Club updates when screen loads
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const autoUpdateService = AutoUpdateService.getInstance();
        await autoUpdateService.checkStripClubUpdates();
      } catch (error) {
        console.log('Error checking Strip Club updates:', error);
      }
    };

    // Animate in
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

    // Check for updates after a short delay
    const timer = setTimeout(checkForUpdates, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleGen2Update = async () => {
    try {
      const autoUpdateService = AutoUpdateService.getInstance();
      await autoUpdateService.checkGen2Updates();
      Alert.alert(
        'Gen2 Update Available! 🚀',
        'Luma Gen 2 is coming in 2025 with advanced 3D gaming, AI experiences, and a complete metaverse platform.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.log('Error checking Gen 2 updates:', error);
    }
  };

  const handleAgeVerification = () => {
    const ageNum = parseInt(age);
    if (ageNum >= 18) {
      setIsAgeVerified(true);
      setShowAgeVerification(false);
      Alert.alert('Age Verified ✅', 'You are now verified to access adult content.');
    } else {
      Alert.alert('Access Denied ❌', 'You must be 18 or older to access this content.');
    }
  };

  const handleEnterStripClub = () => {
    if (!isAgeVerified) {
      setShowAgeVerification(true);
    } else {
      // Navigate to Strip Club content
      Alert.alert('Welcome! 🎪', 'Strip Club features coming in Gen 2!');
    }
  };

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
          <View style={styles.headerContent}>
            <Text style={styles.title}>🎪 Strip Club</Text>
            <Text style={styles.subtitle}>Coming Soon with Gen 2</Text>
          </View>
          <TouchableOpacity style={styles.updateButton} onPress={handleGen2Update}>
            <Ionicons name="cloud-download" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Age Verification Warning */}
        <View style={styles.ageVerificationSection}>
          <View style={styles.ageWarning}>
            <Ionicons name="warning" size={24} color="#fff" />
            <Text style={styles.ageWarningText}>
              Age verification required (18+) for adult content
            </Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#FF2E63', '#FF6B9D']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.heroTitle}>Virtual Strip Club Experience</Text>
            <Text style={styles.heroDescription}>
              Experience the future of adult entertainment with 3D virtual environments, 
              AI-powered interactions, and immersive experiences coming in Gen2
            </Text>
            
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Q3 2025</Text>
            </View>

            <TouchableOpacity 
              style={styles.enterButton} 
              onPress={handleEnterStripClub}
            >
              <Text style={styles.enterButtonText}>
                {isAgeVerified ? 'Enter Strip Club' : 'Verify Age & Enter'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Features Preview */}
        <ScrollView style={styles.featuresContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>🎭 Gen 2 Features Preview</Text>
          
          {/* System Requirements */}
          <SystemRequirements 
            onContinue={() => {
              Alert.alert(
                'System Check',
                'Checking your device capabilities for optimal Strip Club performance...'
              );
            }}
            onDismiss={() => {
              Alert.alert(
                'Device Upgrade',
                'For the best Strip Club experience, consider upgrading to a device with 6GB+ RAM.'
              );
            }}
          />
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <LinearGradient
                colors={['#FF6B9D', '#FF8E53']}
                style={styles.featureGradient}
              >
                <Ionicons name="eye" size={32} color="#fff" />
                <Text style={styles.featureTitle}>3D Virtual Environments</Text>
                <Text style={styles.featureDescription}>
                  Immersive 3D spaces with realistic physics and interactive elements
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.featureCard}>
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.featureGradient}
              >
                <Ionicons name="sparkles" size={32} color="#fff" />
                <Text style={styles.featureTitle}>AI-Powered Interactions</Text>
                <Text style={styles.featureDescription}>
                  Advanced AI with natural conversations and personalized experiences
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.featureCard}>
              <LinearGradient
                colors={['#9C27B0', '#7B1FA2']}
                style={styles.featureGradient}
              >
                <Ionicons name="people" size={32} color="#fff" />
                <Text style={styles.featureTitle}>Multiplayer Experiences</Text>
                <Text style={styles.featureDescription}>
                  Real-time social interactions with other users in virtual spaces
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.featureCard}>
              <LinearGradient
                colors={['#FF9800', '#FFB74D']}
                style={styles.featureGradient}
              >
                <Ionicons name="musical-notes" size={32} color="#fff" />
                <Text style={styles.featureTitle}>Live Virtual Shows</Text>
                <Text style={styles.featureDescription}>
                  Live streaming performances with interactive audience participation
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Technology Stack */}
          <View style={styles.techSection}>
            <Text style={styles.sectionTitle}>💻 Powered by Gen 2 Technology</Text>
            <View style={styles.techGrid}>
              <View style={styles.techItem}>
                <Ionicons name="hardware-chip" size={24} color="#4ECDC4" />
                <Text style={styles.techLabel}>3D Rendering</Text>
              </View>
              <View style={styles.techItem}>
                <Ionicons name="sparkles" size={24} color="#FF6B9D" />
                <Text style={styles.techLabel}>AI Engine</Text>
              </View>
              <View style={styles.techItem}>
                <Ionicons name="wifi" size={24} color="#FF9800" />
                <Text style={styles.techLabel}>Real-time</Text>
              </View>
              <View style={styles.techItem}>
                <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                <Text style={styles.techLabel}>Secure</Text>
              </View>
            </View>
          </View>

          {/* Pre-registration */}
          <View style={styles.preRegistrationSection}>
            <Text style={styles.sectionTitle}>🎁 Early Access Benefits</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.benefitText}>Exclusive early access to virtual environments</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="gift" size={20} color="#FF6B9D" />
                <Text style={styles.benefitText}>Free premium content and features</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="diamond" size={20} color="#4ECDC4" />
                <Text style={styles.benefitText}>VIP status and special privileges</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="rocket" size={20} color="#FF9800" />
                <Text style={styles.benefitText}>Priority access to new features</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Age Verification Modal */}
      <Modal
        visible={showAgeVerification}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#FF2E63', '#FF6B9D']}
              style={styles.modalGradient}
            >
              <Ionicons name="shield-checkmark" size={48} color="#fff" />
              <Text style={styles.modalTitle}>Age Verification Required</Text>
              <Text style={styles.modalDescription}>
                You must be 18 or older to access adult content
              </Text>
              
              <TextInput
                style={styles.ageInput}
                placeholder="Enter your age"
                placeholderTextColor="#ccc"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={2}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAgeVerification(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.verifyButton}
                  onPress={handleAgeVerification}
                >
                  <Text style={styles.verifyButtonText}>Verify Age</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: responsiveStyle({
    flex: 1,
    backgroundColor: '#0a0a0a',
  }),
  header: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  }),
  headerContent: {
    flex: 1,
  },
  title: {
    color: '#FF2E63',
    fontSize: scale(22), // reduced from 28
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: '#08D9D6',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: '#fff',
    fontSize: scale(13), // reduced from 16
    marginTop: scale(2),
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  updateButton: {
    marginLeft: scale(10),
    backgroundColor: '#FF2E63',
    borderRadius: scale(16),
    padding: scale(7), // reduced from 10
    shadowColor: '#FF2E63',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  ageVerificationSection: {
    marginBottom: scale(12),
  },
  ageWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF2E63',
    borderRadius: scale(10),
    padding: scale(10),
    shadowColor: '#FF2E63',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  ageWarningText: {
    color: '#fff',
    fontSize: scale(14),
    marginLeft: scale(8),
    flex: 1,
  },
  heroSection: {
    marginBottom: scale(12), // reduced from 20
  },
  heroGradient: {
    borderRadius: scale(18), // reduced from 24
    padding: scale(14), // reduced from 24
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2E63',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  heroTitle: {
    color: '#fff',
    fontSize: scale(18), // reduced from 24
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: scale(6),
    textShadowColor: '#FF2E63',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroDescription: {
    color: '#fff',
    fontSize: scale(13), // reduced from 16
    textAlign: 'center',
    marginBottom: scale(8),
    lineHeight: 24,
    opacity: 0.85,
  },
  comingSoonBadge: {
    backgroundColor: '#fff',
    borderRadius: scale(10),
    paddingHorizontal: scale(10),
    paddingVertical: scale(3),
    alignSelf: 'center',
    marginTop: scale(4),
    marginBottom: scale(12),
  },
  comingSoonText: {
    color: '#FF2E63',
    fontWeight: 'bold',
    fontSize: scale(11), // reduced from 13
    letterSpacing: 1,
  },
  enterButton: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  enterButtonText: {
    color: '#FF2E63',
    fontSize: scale(14),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  featuresContainer: {
    marginTop: scale(4),
  },
  sectionTitle: {
    color: '#fff',
    fontSize: scale(15), // reduced from 18
    fontWeight: 'bold',
    marginBottom: scale(8),
    marginTop: scale(8),
    letterSpacing: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: scale(8),
  },
  featureCard: {
    flexBasis: '48%',
    marginBottom: scale(8),
    borderRadius: scale(12), // reduced from 16
    overflow: 'hidden',
    shadowColor: '#FF2E63',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  featureGradient: {
    padding: scale(10), // reduced from 16
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    color: '#fff',
    fontSize: scale(13), // reduced from 16
    fontWeight: 'bold',
    marginTop: scale(4),
    marginBottom: scale(2),
    textAlign: 'center',
    textShadowColor: '#FF2E63',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  featureDescription: {
    color: '#fff',
    fontSize: scale(11), // reduced from 13
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  techSection: {
    marginBottom: scale(15),
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  techItem: {
    width: '48%', // Two columns
    marginBottom: scale(10),
    alignItems: 'center',
  },
  techLabel: {
    color: '#08D9D6',
    fontSize: scale(12),
    marginTop: scale(3),
    textAlign: 'center',
  },
  preRegistrationSection: {
    marginBottom: scale(15),
  },
  benefitsList: {
    marginTop: scale(5),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  benefitText: {
    color: '#fff',
    fontSize: scale(14),
    marginLeft: scale(8),
    flex: 1,
  },
  // Modal styles
  modalOverlay: responsiveStyle({
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  modalContent: responsiveStyle({
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    alignItems: 'center',
  }),
  modalGradient: {
    padding: scale(24),
    alignItems: 'center',
  },
  modalTitle: responsiveStyle({
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 15,
  }),
  modalDescription: responsiveStyle({
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  }),
  ageInput: {
    backgroundColor: '#fff',
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    fontSize: scale(16),
    width: '100%',
    marginBottom: scale(20),
    textAlign: 'center',
  },
  modalButtons: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  }),
  cancelButton: responsiveStyle({
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
  }),
  cancelButtonText: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  }),
  verifyButton: responsiveStyle({
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
  }),
  verifyButtonText: responsiveStyle({
    color: '#FF2E63',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  }),
  content: responsiveStyle({
    flex: 1,
    paddingHorizontal: 20,
  }),
});

export default StripClubScreen; 