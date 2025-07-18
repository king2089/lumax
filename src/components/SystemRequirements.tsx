import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { scale } from '../utils/responsive';
import * as Device from 'expo-device';
import { navigate, goBack } from '../services/NavigationService';

const { width, height } = Dimensions.get('window');

interface SystemRequirementsProps {
  onContinue?: () => void;
  onDismiss?: () => void;
  isUpdateFlow?: boolean;
  navigation?: any;
  route?: any;
}

const SystemRequirements: React.FC<SystemRequirementsProps> = ({
  onContinue,
  onDismiss,
  isUpdateFlow = false,
  navigation,
  route
}) => {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [meetsRequirements, setMeetsRequirements] = useState(false);

  useEffect(() => {
    checkDeviceRequirements();
  }, []);

  const checkDeviceRequirements = async () => {
    try {
      // Get device information
      const deviceData = {
        brand: Device.brand,
        manufacturer: Device.manufacturer,
        modelName: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
        totalMemory: Device.totalMemory,
        deviceType: Device.deviceType,
        isDevice: Device.isDevice,
      };

      setDeviceInfo(deviceData);

      // Check if device meets minimum requirements
      // 4GB RAM = 4 * 1024 * 1024 * 1024 bytes = 4,294,967,296 bytes
      const minRamBytes = 4 * 1024 * 1024 * 1024; // 4GB in bytes
      const hasEnoughRam = Device.totalMemory >= minRamBytes;

      setMeetsRequirements(hasEnoughRam);

      // If this is an update flow and device doesn't meet requirements, show warning
      if (isUpdateFlow && !hasEnoughRam) {
        Alert.alert(
          '⚠️ Low-End Device Detected',
          'Your device has less than 4GB RAM. Some Gen 1 features may not work optimally, but you can still try them out!',
          [
            { text: 'Continue Anyway', onPress: handleContinue },
            { text: 'Cancel', style: 'cancel', onPress: handleDismiss }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking device requirements:', error);
      // Default to allowing if we can't check
      setMeetsRequirements(true);
    }
  };

  const handleContinue = () => {
    if (isUpdateFlow) {
      // Navigate back to update screen to continue the update
      goBack();
    } else {
      onContinue?.();
    }
  };

  const handleDismiss = () => {
    if (isUpdateFlow) {
      // Navigate back to previous screen
      goBack();
    } else {
      onDismiss?.();
    }
  };

  const formatMemory = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const getRamStatus = () => {
    if (!deviceInfo) return { status: 'checking', color: '#FF9800', icon: 'refresh' };
    
    const minRamBytes = 4 * 1024 * 1024 * 1024; // 4GB
    if (deviceInfo.totalMemory >= minRamBytes) {
      return { status: 'meets', color: '#00C853', icon: 'checkmark-circle' };
    } else {
      return { status: 'low', color: '#FF9800', icon: 'warning' };
    }
  };

  const ramStatus = getRamStatus();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Gen 1 Badge */}
        <View style={styles.gen1Badge}>
          <Text style={styles.gen1Text}>GEN 1</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="settings" size={scale(28)} color="#fff" />
              </View>
              <Text style={styles.title}>🎯 System Requirements</Text>
              <Text style={styles.subtitle}>Gen 1 AI-Powered Features</Text>
            </View>

            {/* Requirements Section */}
            <View style={styles.requirementsSection}>
              <Text style={styles.sectionTitle}>Minimum Requirements:</Text>
              
              {/* RAM Requirement */}
              <View style={styles.requirementItem}>
                <View style={styles.requirementHeader}>
                  <Ionicons 
                    name={ramStatus.icon as any} 
                    size={scale(18)} 
                    color={ramStatus.color} 
                  />
                  <Text style={styles.requirementTitle}>RAM (Memory)</Text>
                </View>
                <View style={styles.requirementDetails}>
                  <Text style={styles.requirementValue}>
                    Required: 4.0 GB
                  </Text>
                  <Text style={styles.requirementValue}>
                    Your Device: {deviceInfo ? formatMemory(deviceInfo.totalMemory) : 'Checking...'}
                  </Text>
                  <Text style={[styles.requirementStatus, { color: ramStatus.color }]}>
                    {ramStatus.status === 'checking' && 'Checking...'}
                    {ramStatus.status === 'meets' && '✅ Meets Requirements'}
                    {ramStatus.status === 'low' && '⚠️ Low-End Device'}
                  </Text>
                </View>
              </View>

              {/* Platform Requirement */}
              <View style={styles.requirementItem}>
                <View style={styles.requirementHeader}>
                  <Ionicons name="checkmark-circle" size={scale(18)} color="#00C853" />
                  <Text style={styles.requirementTitle}>Platform</Text>
                </View>
                <View style={styles.requirementDetails}>
                  <Text style={styles.requirementValue}>
                    Required: iOS 13+ / Android 8+
                  </Text>
                  <Text style={styles.requirementValue}>
                    Your Device: {deviceInfo ? `${deviceInfo.osName} ${deviceInfo.osVersion}` : 'Checking...'}
                  </Text>
                  <Text style={[styles.requirementStatus, { color: '#00C853' }]}>
                    ✅ Compatible
                  </Text>
                </View>
              </View>

              {/* Device Type */}
              <View style={styles.requirementItem}>
                <View style={styles.requirementHeader}>
                  <Ionicons name="checkmark-circle" size={scale(18)} color="#00C853" />
                  <Text style={styles.requirementTitle}>Device Type</Text>
                </View>
                <View style={styles.requirementDetails}>
                  <Text style={styles.requirementValue}>
                    Required: Smartphone/Tablet
                  </Text>
                  <Text style={styles.requirementValue}>
                    Your Device: {deviceInfo ? deviceInfo.deviceType : 'Checking...'}
                  </Text>
                  <Text style={[styles.requirementStatus, { color: '#00C853' }]}>
                    ✅ Compatible
                  </Text>
                </View>
              </View>
            </View>

            {/* Low-End Device Warning */}
            {ramStatus.status === 'low' && (
              <View style={styles.warningSection}>
                <View style={styles.warningHeader}>
                  <Ionicons name="warning" size={scale(20)} color="#FF9800" />
                  <Text style={styles.warningTitle}>Low-End Device Detected</Text>
                </View>
                <Text style={styles.warningText}>
                  Your device has less than 4GB RAM. While you can still try all Gen 1 features, some may run slower or have reduced performance. We recommend using a device with 4GB+ RAM for the best experience.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              {isUpdateFlow ? (
                <>
                  <TouchableOpacity 
                    style={[styles.primaryButton, { backgroundColor: ramStatus.color }]} 
                    onPress={handleContinue}
                  >
                    <Text style={styles.primaryButtonText}>
                      {ramStatus.status === 'low' ? 'Continue Anyway' : 'Continue Update'}
                    </Text>
                    <Ionicons name="arrow-forward" size={scale(14)} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryButton} onPress={handleDismiss}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: ramStatus.color }]} 
                  onPress={handleContinue}
                >
                  <Text style={styles.primaryButtonText}>
                    {ramStatus.status === 'low' ? 'Try Gen 1 Features' : 'Continue'}
                  </Text>
                  <Ionicons name="arrow-forward" size={scale(14)} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Powered by Luma Gen 1 AI</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: scale(20),
  },
  gen1Badge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? scale(50) : scale(20),
    right: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  gen1Text: {
    color: '#fff',
    fontSize: scale(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    width: '100%',
    paddingHorizontal: scale(20),
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: scale(24),
    width: '100%',
  },
  logoContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  title: {
    fontSize: Math.min(scale(22), 24),
    fontWeight: '700',
    color: '#fff',
    marginBottom: scale(6),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.min(scale(14), 16),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  requirementsSection: {
    width: '100%',
    marginBottom: scale(16),
  },
  sectionTitle: {
    fontSize: Math.min(scale(16), 18),
    fontWeight: '600',
    color: '#fff',
    marginBottom: scale(12),
    textAlign: 'center',
  },
  requirementItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(10),
    padding: scale(12),
    marginBottom: scale(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  requirementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(6),
  },
  requirementTitle: {
    fontSize: Math.min(scale(14), 16),
    fontWeight: '600',
    color: '#fff',
    marginLeft: scale(6),
    flex: 1,
  },
  requirementDetails: {
    marginLeft: scale(24),
  },
  requirementValue: {
    fontSize: Math.min(scale(12), 14),
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: scale(2),
  },
  requirementStatus: {
    fontSize: Math.min(scale(12), 14),
    fontWeight: '600',
    marginTop: scale(3),
  },
  warningSection: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderRadius: scale(10),
    padding: scale(12),
    marginBottom: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
    width: '100%',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(6),
  },
  warningTitle: {
    fontSize: Math.min(scale(14), 16),
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: scale(6),
    flex: 1,
  },
  warningText: {
    fontSize: Math.min(scale(12), 14),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: Math.min(scale(16), 18),
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C853',
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(20),
    marginBottom: scale(8),
    gap: scale(6),
    minWidth: scale(200),
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: Math.min(scale(14), 16),
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(8),
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: Math.min(scale(14), 16),
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: scale(8),
  },
  footerText: {
    fontSize: Math.min(scale(10), 12),
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
});

export default SystemRequirements; 