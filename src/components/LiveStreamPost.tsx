import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLiveStreaming } from '../hooks/useLiveStreaming';
import { LiveStream } from '../services/LiveStreamingService';

interface LiveStreamPostProps {
  post: any;
  user: any;
  onJoin?: (streamId: string) => void;
}

export const LiveStreamPost: React.FC<LiveStreamPostProps> = ({ 
  post, 
  user, 
  onJoin 
}) => {
  const { joinLiveStream, sendChatMessage, sendReaction } = useLiveStreaming();
  const [isJoining, setIsJoining] = useState(false);
  const [viewerCount, setViewerCount] = useState(post.liveStreamData?.viewers || 0);
  const [pulseAnim] = useState(new Animated.Value(1));

  const streamData = post.liveStreamData;

  useEffect(() => {
    // Animate the live indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handleJoinStream = async () => {
    if (!post.liveStreamId) {
      Alert.alert('Error', 'Stream not found');
      return;
    }

    setIsJoining(true);
    try {
      await joinLiveStream(post.liveStreamId);
      setViewerCount(prev => prev + 1);
      
      if (onJoin) {
        onJoin(post.liveStreamId);
      }

      Alert.alert(
        'Joined Stream! 🎬',
        `You're now watching "${streamData.title}"\n\nQuality: ${streamData.quality}\nViewers: ${viewerCount + 1}`,
        [
          {
            text: 'Send Message',
            onPress: () => sendChatMessage(post.liveStreamId, 'Hello from the feed! 👋')
          },
          {
            text: 'Continue Watching',
            style: 'default'
          }
        ]
      );
    } catch (error) {
      console.error('Error joining stream:', error);
      Alert.alert('Error', 'Failed to join stream. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSendReaction = async (reaction: string) => {
    try {
      await sendReaction(post.liveStreamId, reaction);
      Alert.alert('Reaction Sent!', `You sent ${reaction} to the stream`);
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 193, 7, 0.05)']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.userDetails}>
              <Text style={styles.username}>{user.displayName}</Text>
              <View style={styles.liveIndicator}>
                <Animated.View 
                  style={[
                    styles.liveDot,
                    { transform: [{ scale: pulseAnim }] }
                  ]} 
                />
                <Text style={styles.liveText}>LIVE NOW</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.streamStats}>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={16} color="#FFD700" />
              <Text style={styles.statText}>{viewerCount.toLocaleString()}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons 
                name={getQualityIcon(streamData.quality)} 
                size={16} 
                color={getQualityColor(streamData.quality)} 
              />
              <Text style={styles.statText}>{streamData.quality}</Text>
            </View>
          </View>
        </View>

        {/* Stream Preview */}
        <View style={styles.streamPreview}>
          <Image 
            source={{ uri: post.media[0] }} 
            style={styles.streamImage}
            resizeMode="cover"
          />
          
          {/* Quality Badge */}
          <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(streamData.quality) }]}>
            <Ionicons name={getQualityIcon(streamData.quality)} size={14} color="#fff" />
            <Text style={styles.qualityBadgeText}>{streamData.quality}</Text>
          </View>
          
          <View style={styles.streamOverlay}>
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
              style={styles.overlayGradient}
            >
              <View style={styles.streamInfo}>
                <Text style={styles.streamTitle}>{streamData.title}</Text>
                <Text style={styles.streamDescription}>
                  {post.content.split('\n\n')[1] || 'Live streaming now!'}
                </Text>
              </View>
              
              <View style={styles.streamActions}>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={handleJoinStream}
                  disabled={isJoining}
                >
                  <LinearGradient
                    colors={['#F44337', '#FF5722']}
                    style={styles.joinButtonGradient}
                  >
                    <Ionicons name="play" size={20} color="#fff" />
                    <Text style={styles.joinButtonText}>
                      {isJoining ? 'Joining...' : 'Join Stream'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Stream Details */}
        <View style={styles.streamDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="settings" size={16} color="#FFD700" />
              <Text style={styles.detailText}>
                {streamData.bitrate.toLocaleString()} kbps
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="grid" size={16} color="#FFD700" />
              <Text style={styles.detailText}>
                {streamData.category}
              </Text>
            </View>
            {streamData.isNSFW && (
              <View style={styles.detailItem}>
                <Ionicons name="warning" size={16} color="#FF5722" />
                <Text style={[styles.detailText, styles.nsfwText]}>
                  {streamData.nsfwLevel}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSendReaction('❤️')}
          >
            <Text style={styles.actionEmoji}>❤️</Text>
            <Text style={styles.actionText}>Love</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSendReaction('🔥')}
          >
            <Text style={styles.actionEmoji}>🔥</Text>
            <Text style={styles.actionText}>Fire</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSendReaction('👏')}
          >
            <Text style={styles.actionEmoji}>👏</Text>
            <Text style={styles.actionText}>Clap</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSendReaction('🎉')}
          >
            <Text style={styles.actionEmoji}>🎉</Text>
            <Text style={styles.actionText}>Celebrate</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            Started {new Date(post.createdAt).toLocaleTimeString()}
          </Text>
          <Text style={styles.hashtags}>
            #LiveStream #{streamData.category}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F44337',
    marginRight: 8,
  },
  liveText: {
    fontSize: 13,
    color: '#F44337',
    fontWeight: '700',
  },
  streamStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  streamPreview: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  streamImage: {
    width: '100%',
    height: '100%',
  },
  qualityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  qualityBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  streamOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  streamInfo: {
    marginTop: 16,
  },
  streamTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  streamDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  streamActions: {
    marginBottom: 16,
  },
  joinButton: {
    alignSelf: 'flex-start',
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  joinButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  streamDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#fff',
  },
  nsfwText: {
    color: '#FF5722',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  actionText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  hashtags: {
    fontSize: 12,
    color: '#FFD700',
  },
}); 