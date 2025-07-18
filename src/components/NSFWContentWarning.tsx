import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface NSFWContentWarningProps {
  visible: boolean;
  onClose: () => void;
  onProceed?: () => void;
  contentType?: string;
  warningLevel?: 'mild' | 'moderate' | 'explicit';
}

export const NSFWContentWarning: React.FC<NSFWContentWarningProps> = ({
  visible,
  onClose,
  onProceed,
  contentType = 'content',
  warningLevel = 'moderate',
}) => {
  const getWarningConfig = () => {
    switch (warningLevel) {
      case 'mild':
        return {
          icon: 'warning-outline',
          color: '#FFA726',
          title: 'Sensitive Content',
          description: 'This content may contain material that some users find sensitive.',
          gradient: ['#FFA726', '#FF8F00'] as const,
        };
      case 'explicit':
        return {
          icon: 'alert-circle',
          color: '#F44336',
          title: 'Explicit Content Warning',
          description: 'This content contains explicit material and is intended for mature audiences only.',
          gradient: ['#F44336', '#D32F2F'] as const,
        };
      default:
        return {
          icon: 'warning',
          color: '#FF6B6B',
          title: 'Content Warning',
          description: 'This content may not be suitable for all audiences.',
          gradient: ['#FF6B6B', '#EE5A24'] as const,
        };
    }
  };

  const config = getWarningConfig();

  const handleProceed = () => {
    Alert.alert(
      'Age Verification Required',
      'You must be 18 or older to view this content. By proceeding, you confirm that you meet the age requirement.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I am 18+',
          onPress: () => {
            onProceed?.();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={config.gradient}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={config.icon as any} size={48} color="#fff" />
            </View>
            <Text style={styles.title}>{config.title}</Text>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.description}>{config.description}</Text>

            <View style={styles.warningDetails}>
              <View style={styles.warningItem}>
                <Ionicons name="eye-off" size={16} color="#666" />
                <Text style={styles.warningText}>
                  Content may contain nudity or sexual themes
                </Text>
              </View>

              <View style={styles.warningItem}>
                <Ionicons name="person" size={16} color="#666" />
                <Text style={styles.warningText}>
                  Intended for users 18 years and older
                </Text>
              </View>

              <View style={styles.warningItem}>
                <Ionicons name="shield-checkmark" size={16} color="#666" />
                <Text style={styles.warningText}>
                  Content has been reviewed for safety
                </Text>
              </View>
            </View>

            <View style={styles.ageVerification}>
              <Ionicons name="checkmark-circle" size={20} color={config.color} />
              <Text style={styles.ageText}>
                By proceeding, you confirm you are 18 or older
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Go Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.proceedButton]}
              onPress={handleProceed}
            >
              <LinearGradient
                colors={config.gradient}
                style={styles.proceedGradient}
              >
                <Text style={styles.proceedText}>I'm 18+ - Proceed</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              This warning helps ensure content is viewed by appropriate audiences. 
              Our community guidelines apply to all content.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  warningDetails: {
    marginBottom: 20,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  ageVerification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ageText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    paddingVertical: 12,
  },
  proceedButton: {
    overflow: 'hidden',
  },
  proceedGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  proceedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  disclaimer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    lineHeight: 14,
  },
}); 