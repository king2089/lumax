import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { scale, getResponsiveFontSize } from '../utils/responsive';

interface DevelopmentBannerProps {
  onClose?: () => void;
  isVisible?: boolean;
}

export const DevelopmentBanner: React.FC<DevelopmentBannerProps> = ({ 
  onClose, 
  isVisible = true 
}) => {
  if (!isVisible) return null;

  return (
    <LinearGradient
      colors={['#FF6B6B', '#FF8E53', '#FFA726']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="construct" size={20} color="#fff" />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>🚧 Development Mode</Text>
          <Text style={styles.subtitle}>
            Luma Gen 1 is currently in beta. Features may change and improve over time.
          </Text>
        </View>

        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: getResponsiveFontSize(12),
    color: '#fff',
    opacity: 0.9,
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
  },
}); 