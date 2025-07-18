import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePreRegistration } from '../context/PreRegistrationContext';

const { width } = Dimensions.get('window');

interface PreRegistrationBannerProps {
  onPress?: () => void;
  compact?: boolean;
}

export const PreRegistrationBanner: React.FC<PreRegistrationBannerProps> = ({ 
  onPress, 
  compact = false 
}) => {
  const { isPreRegistered, preRegistrationStats } = usePreRegistration();

  if (isPreRegistered) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <View style={styles.textContainer}>
              <Text style={styles.title}>Pre-registered for Gen 2! 🎉</Text>
              {!compact && (
                <Text style={styles.subtitle}>
                  You'll get early access when Luma Gen 2 launches in 2025
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Ionicons name="rocket" size={24} color="#fff" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Pre-register for Luma Gen 2</Text>
            {!compact && (
              <Text style={styles.subtitle}>
                {preRegistrationStats.totalRegistrations.toLocaleString()} people have signed up
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
}); 