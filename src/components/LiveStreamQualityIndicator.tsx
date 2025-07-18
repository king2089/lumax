import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface LiveStreamQualityIndicatorProps {
  quality: '1080p' | '4K' | '8K' | '20K';
  bitrate: number;
  fps: number;
  codec: string;
  isChanging?: boolean;
  changeProgress?: number;
}

export const LiveStreamQualityIndicator: React.FC<LiveStreamQualityIndicatorProps> = ({
  quality,
  bitrate,
  fps,
  codec,
  isChanging = false,
  changeProgress = 0,
}) => {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '1080p': return '#4CAF50';
      case '4K': return '#2196F3';
      case '8K': return '#9C27B0';
      case '20K': return '#FF6B6B';
      default: return '#FFD700';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case '1080p': return 'videocam';
      case '4K': return 'diamond';
      case '8K': return 'star';
      case '20K': return 'flash';
      default: return 'videocam';
    }
  };

  const getQualityFeatures = (quality: string) => {
    switch (quality) {
      case '1080p': return ['Standard HD', 'Wide compatibility', 'Low bandwidth'];
      case '4K': return ['Crystal clear', 'HDR support', 'Premium quality'];
      case '8K': return ['Cinema-grade', 'Immersive experience', 'Future-ready'];
      case '20K': return ['Next-generation', 'Ultra-smooth', 'Cutting-edge'];
      default: return ['Standard quality'];
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 193, 7, 0.05)']}
        style={styles.gradient}
      >
        {/* Quality Header */}
        <View style={styles.header}>
          <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(quality) }]}>
            <Ionicons name={getQualityIcon(quality)} size={16} color="#fff" />
            <Text style={styles.qualityText}>{quality}</Text>
          </View>
          
          {isChanging && (
            <View style={styles.changingIndicator}>
              <Ionicons name="sync" size={14} color="#FFD700" />
              <Text style={styles.changingText}>Changing...</Text>
            </View>
          )}
        </View>

        {/* Quality Progress (if changing) */}
        {isChanging && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${changeProgress}%`,
                    backgroundColor: getQualityColor(quality)
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(changeProgress)}%</Text>
          </View>
        )}

        {/* Quality Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="speedometer" size={14} color="#FFD700" />
              <Text style={styles.detailText}>{bitrate.toLocaleString()} kbps</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="play-circle" size={14} color="#FFD700" />
              <Text style={styles.detailText}>{fps} fps</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="settings" size={14} color="#FFD700" />
              <Text style={styles.detailText}>{codec}</Text>
            </View>
          </View>
        </View>

        {/* Quality Features */}
        <View style={styles.features}>
          {getQualityFeatures(quality).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  qualityText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  changingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changingText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  features: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
});

export default LiveStreamQualityIndicator; 