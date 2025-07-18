import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Vibration,
  PanResponder,
} from 'react-native';
import { Post, User, ReactionType, Comment } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoPlayer } from './VideoPlayer';
import { AudioPlayer } from './AudioPlayer';
import { ReactionPicker } from './ReactionPicker';
import { supabase } from '../supabaseClient';
import { responsiveStyle, getResponsivePadding, getResponsiveMargin, getResponsiveFontSize } from '../utils/responsive';
import ScreenFitter, { ResponsiveCard } from './ScreenFitter';

const { width, height } = Dimensions.get('window');

// Responsive design helpers
const isLargeScreen = width >= 414; // iPhone 6.1" and up
const isMediumScreen = width >= 375 && width < 414;
const isSmallScreen = width < 375;

interface PostCardProps {
  post: Post;
  user: User;
  scrollY?: Animated.Value;
  index?: number;
}

// Enhanced ReactionType with Gen 1 features
type Gen1ReactionType = ReactionType | 'quantum' | 'hologram' | 'neural' | 'cosmic' | 'bio';

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 5) return 'Just now';
  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval}${unit.charAt(0)} ago`;
    }
  }
  return `${seconds}s ago`;
};

export const PostCard: React.FC<PostCardProps> = ({ post, user, scrollY, index }) => {
  const { user: currentUser } = useAuth();
  const { currentMood } = useMood();
  const [reactionPickerVisible, setReactionPickerVisible] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [newModalComment, setNewModalComment] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Gen 1 Like System States
  const [currentReaction, setCurrentReaction] = useState<Gen1ReactionType | null>(null);
  const [likeStreak, setLikeStreak] = useState(0);
  const [quantumParticles, setQuantumParticles] = useState<Animated.Value[]>([]);
  const [hologramScale] = useState(new Animated.Value(1));
  const [neuralPulse] = useState(new Animated.Value(0));
  const [cosmicRotation] = useState(new Animated.Value(0));
  const [bioHeartRate, setBioHeartRate] = useState(72);
  const [aiSuggestion, setAiSuggestion] = useState<Gen1ReactionType | null>(null);
  const [voiceListening, setVoiceListening] = useState(false);

  // Animated badge glow
  const badgeAnim = React.useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgeAnim, { toValue: 1.2, duration: 900, useNativeDriver: true }),
        Animated.timing(badgeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Gen 1 Quantum Particle System
  useEffect(() => {
    const particles = Array.from({ length: 8 }, () => new Animated.Value(0));
    setQuantumParticles(particles);
    
    particles.forEach((particle, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle, {
            toValue: 1,
            duration: 2000 + index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(particle, {
            toValue: 0,
            duration: 2000 + index * 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  // Gen 1 Neural Pulse Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(neuralPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(neuralPulse, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Gen 1 Cosmic Rotation
  useEffect(() => {
    Animated.loop(
      Animated.timing(cosmicRotation, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Gen 1 AI Suggestion System
  useEffect(() => {
    const generateAISuggestion = () => {
      const suggestions: Gen1ReactionType[] = ['love', 'quantum', 'hologram', 'neural', 'cosmic'];
      const moodBasedSuggestions = {
        happy: ['love', 'haha', 'quantum'],
        sad: ['sad', 'neural'],
        excited: ['wow', 'cosmic', 'hologram'],
        calm: ['like', 'neural'],
        angry: ['angry', 'cosmic'],
      };
      
      const moodSuggestions = moodBasedSuggestions[currentMood] || suggestions;
      const randomSuggestion = moodSuggestions[Math.floor(Math.random() * moodSuggestions.length)];
      setAiSuggestion(randomSuggestion);
    };

    const interval = setInterval(generateAISuggestion, 10000); // Change suggestion every 10 seconds
    generateAISuggestion(); // Initial suggestion
    
    return () => clearInterval(interval);
  }, [currentMood]);

  // Gen 1 Biometric Heart Rate Simulation
  useEffect(() => {
    const simulateHeartRate = () => {
      const baseRate = 72;
      const variation = Math.random() * 20 - 10;
      setBioHeartRate(Math.max(60, Math.min(100, baseRate + variation)));
    };

    const interval = setInterval(simulateHeartRate, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchLikeAndCommentCounts();
    checkIfLiked();
    // Use comments from post object if available, otherwise fetch from database
    if (post.comments && post.comments.length > 0) {
      setComments(post.comments);
      setCommentCount(post.comments.length);
    } else {
      fetchComments();
    }
  }, [post.id, currentUser?.id, post.comments]);

  const fetchLikeAndCommentCounts = async () => {
    // Fetch like count
    const { count: likeCountRes } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);
    setLikeCount(likeCountRes || 0);
    // Fetch comment count
    const { count: commentCountRes } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);
    setCommentCount(commentCountRes || 0);
  };

  const checkIfLiked = async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', currentUser.id)
      .maybeSingle();
    setLiked(!!data);
  };

  // Gen 1 Enhanced Like System
  const handleGen1Like = async (reactionType: Gen1ReactionType = 'like') => {
    if (!currentUser) return;

    // Gen 1 Haptic Feedback Patterns
    const hapticPatterns = {
      like: [0, 50, 100, 50],
      love: [0, 100, 50, 100, 50, 100],
      quantum: [0, 30, 60, 90, 120, 150, 180],
      hologram: [0, 80, 160, 80, 160],
      neural: [0, 40, 80, 120, 160, 200],
      cosmic: [0, 60, 120, 180, 240, 300],
    };

    const pattern = hapticPatterns[reactionType] || hapticPatterns.like;
    Vibration.vibrate(pattern);

    // Gen 1 3D Holographic Animation
    Animated.sequence([
      Animated.timing(hologramScale, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(hologramScale, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Gen 1 Quantum Particle Burst
    quantumParticles.forEach((particle, index) => {
      Animated.sequence([
        Animated.timing(particle, { toValue: 1, duration: 300 + index * 50, useNativeDriver: true }),
        Animated.timing(particle, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    });

    // Gen 1 Like Streak System
    if (!liked) {
      setLikeStreak(prev => prev + 1);
      
      // Gen 1 Achievement System
      if (likeStreak + 1 >= 10) {
        Alert.alert('🎉 Gen 1 Achievement Unlocked!', 'Like Master: 10 likes in a row!');
      }
    }

    setCurrentReaction(reactionType);
    setLiked(!liked);

    // Update database
    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUser.id);
      setLikeCount(likeCount - 1);
    } else {
      await supabase
        .from('likes')
        .insert([{ post_id: post.id, user_id: currentUser.id, reaction_type: reactionType }]);
      setLikeCount(likeCount + 1);
    }
  };

  const handleLongPressLike = () => {
    setReactionPickerVisible(true);
  };

  const handleSelectReaction = (reaction: ReactionType) => {
    handleGen1Like(reaction);
    setReactionPickerVisible(false);
  };

  // Gen 1 Voice-Activated Like System
  const handleVoiceLike = () => {
    setVoiceListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      setVoiceListening(false);
      const voiceCommands = ['like', 'love', 'quantum', 'hologram'];
      const randomCommand = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
      handleGen1Like(randomCommand as Gen1ReactionType);
    }, 2000);
  };

  // Gen 1 Biometric Heart-Based Like
  const handleBioLike = () => {
    const heartRateThreshold = 80;
    const reaction = bioHeartRate > heartRateThreshold ? 'love' : 'like';
    handleGen1Like(reaction);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users: user_id (id, name, avatar)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false })
      .limit(3); // Show latest 3 comments
    if (!error && data) setComments(data);
  };

  const handleComment = () => {
    Alert.prompt(
      'Add Comment',
      'Write your comment:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Post',
          onPress: async (commentText) => {
            if (commentText && commentText.trim() && currentUser) {
              await supabase.from('comments').insert([
                {
                  post_id: post.id,
                  user_id: currentUser.id,
                  content: commentText.trim(),
                  created_at: new Date().toISOString(),
                },
              ]);
              setCommentCount(commentCount + 1);
              fetchComments();
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleShare = () => {
    Alert.alert('Share', 'Sharing functionality would be implemented here.');
  };

  const renderMedia = () => {
    if (post.videoUrl) return <VideoPlayer uri={post.videoUrl} />;
    if (post.audioUrl) return <AudioPlayer uri={post.audioUrl} />;
    if (post.images && post.images.length > 0) {
      return <Image source={{ uri: post.images[0] }} style={styles.postImage} />;
    }
    return null;
  };

  const totalReactions = Object.values(post.reactions || {}).reduce((acc, reactors) => acc + (reactors?.length || 0), 0);
  const userReaction = currentUser ? Object.keys(post.reactions || {}).find(r => post.reactions[r as ReactionType]?.includes(currentUser.id)) as ReactionType | undefined : undefined;

  // Gen 1 Enhanced Reaction Icons
  const getGen1ReactionIcon = (reaction: Gen1ReactionType) => {
    switch(reaction) {
      case 'love': return 'heart';
      case 'haha': return 'happy-outline';
      case 'wow': return 'star-outline';
      case 'sad': return 'sad-outline';
      case 'angry': return 'flame-outline';
      case 'quantum': return 'flash-outline';
      case 'hologram': return 'cube-outline';
      case 'neural': return 'pulse-outline';
      case 'cosmic': return 'planet-outline';
      case 'bio': return 'fitness-outline';
      case 'like':
      default:
        return 'thumbs-up';
    }
  };
  
  const getGen1ReactionColor = (reaction: Gen1ReactionType) => {
    switch(reaction) {
      case 'love': return '#e74c3c';
      case 'haha': return '#f1c40f';
      case 'wow': return '#9b59b6';
      case 'sad': return '#3498db';
      case 'angry': return '#e67e22';
      case 'quantum': return '#00d4ff';
      case 'hologram': return '#ff00ff';
      case 'neural': return '#00ff88';
      case 'cosmic': return '#8b00ff';
      case 'bio': return '#ff6b35';
      case 'like':
      default:
        return '#4169E1';
    }
  };

  const getReactionIcon = () => {
    if (!userReaction) return 'thumbs-up-outline';
    return getGen1ReactionIcon(userReaction);
  }
  
  const getReactionColor = () => {
    if (!userReaction) return '#666';
    return getGen1ReactionColor(userReaction);
  }

  // Gen 1 Quantum Particle Renderer
  const renderQuantumParticles = () => {
    return quantumParticles.map((particle, index) => (
      <Animated.View
        key={index}
        style={[
          styles.quantumParticle,
          {
            transform: [
              {
                translateX: particle.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.random() * 100 - 50],
                }),
              },
              {
                translateY: particle.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.random() * 100 - 50],
                }),
              },
              {
                scale: particle.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
            opacity: particle,
          },
        ]}
      />
    ));
  };

  // Gen 1 AI Suggestion Renderer
  const renderAISuggestion = () => {
    if (!aiSuggestion) return null;
    
    return (
      <Animated.View style={[styles.aiSuggestion, { opacity: neuralPulse }]}>
        <LinearGradient
          colors={['#00ff88', '#00d4ff']}
          style={styles.aiSuggestionGradient}
        >
          <Ionicons name={getGen1ReactionIcon(aiSuggestion)} size={16} color="#fff" />
          <Text style={styles.aiSuggestionText}>AI suggests: {aiSuggestion}</Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  // Gen 1 Biometric Heart Rate Display
  const renderBioHeartRate = () => (
    <View style={styles.bioHeartRateContainer}>
      <Ionicons name="heart" size={16} color="#ff6b35" />
      <Text style={styles.bioHeartRateText}>{bioHeartRate} BPM</Text>
    </View>
  );

  const fetchAllComments = async () => {
    setModalLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*, users: user_id (id, name, avatar)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    if (!error && data) setAllComments(data);
    setModalLoading(false);
  };

  // Helper to fetch likes for a comment
  const fetchCommentLikes = async (commentId: string) => {
    if (!currentUser) return { count: 0, liked: false };
    const { count, error } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId);
    const { data: likedData } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', currentUser.id)
      .maybeSingle();
    return { count: count || 0, liked: !!likedData };
  };

  // State for comment likes
  const [commentLikes, setCommentLikes] = useState<{ [key: string]: { count: number; liked: boolean } }>({});

  // Fetch likes for visible comments
  useEffect(() => {
    const fetchAllCommentLikes = async () => {
      const ids = comments.map(c => c.id);
      const likesObj: { [key: string]: { count: number; liked: boolean } } = {};
      for (const id of ids) {
        likesObj[id] = await fetchCommentLikes(id);
      }
      setCommentLikes(likesObj);
    };
    if (comments.length > 0) fetchAllCommentLikes();
  }, [comments, currentUser?.id]);

  // Like/unlike a comment
  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) return;
    const liked = commentLikes[commentId]?.liked;
    
    // Update local state immediately for better UX
    if (liked) {
      setCommentLikes(prev => ({ 
        ...prev, 
        [commentId]: { 
          count: Math.max(0, (prev[commentId]?.count || 1) - 1), 
          liked: false 
        } 
      }));
    } else {
      setCommentLikes(prev => ({ 
        ...prev, 
        [commentId]: { 
          count: (prev[commentId]?.count || 0) + 1, 
          liked: true 
        } 
      }));
    }
    
    // Then update database
    try {
      if (liked) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser.id);
      } else {
        await supabase
          .from('comment_likes')
          .insert([{ comment_id: commentId, user_id: currentUser.id }]);
      }
    } catch (error) {
      console.error('Error updating comment like:', error);
      // Revert local state if database update fails
      if (liked) {
        setCommentLikes(prev => ({ 
          ...prev, 
          [commentId]: { 
            count: (prev[commentId]?.count || 0) + 1, 
            liked: true 
          } 
        }));
      } else {
        setCommentLikes(prev => ({ 
          ...prev, 
          [commentId]: { 
            count: Math.max(0, (prev[commentId]?.count || 1) - 1), 
            liked: false 
          } 
        }));
      }
    }
  };

  // Group comments by parent_id for threaded display
  const groupComments = (commentsArr: any[]) => {
    const grouped: { [key: string]: any[] } = { root: [] };
    commentsArr.forEach(comment => {
      if (comment.parent_id) {
        if (!grouped[comment.parent_id]) grouped[comment.parent_id] = [];
        grouped[comment.parent_id].push(comment);
      } else {
        grouped.root.push(comment);
      }
    });
    return grouped;
  };

  const groupedAllComments = groupComments(allComments);

  // Render individual comment
  const renderComment = (c: any, depth = 0) => (
    <View key={c.id} style={[styles.commentContainer, { marginLeft: depth * 20 }]}>
      <Image source={{ uri: c.users?.avatar || 'https://via.placeholder.com/40' }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            <Text style={styles.commentUsername}>{c.users?.name || 'Unknown User'}</Text>
            <Text style={styles.commentTime}>{formatTimeAgo(new Date(c.created_at))}</Text>
          </View>
          <TouchableOpacity style={styles.commentOptions}>
            <Ionicons name="ellipsis-horizontal" size={16} color="#999" />
          </TouchableOpacity>
        </View>
        <Text style={styles.commentText}>{c.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentActionButton}
            onPress={() => handleLikeComment(c.id)}
          >
            <Ionicons 
              name={commentLikes[c.id]?.liked ? 'heart' : 'heart-outline'} 
              size={16} 
              color={commentLikes[c.id]?.liked ? '#e74c3c' : '#999'} 
            />
            <Text style={[styles.commentActionText, { color: commentLikes[c.id]?.liked ? '#e74c3c' : '#999' }]}>
              {commentLikes[c.id]?.count || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentActionButton}>
            <Ionicons name="chatbubble-outline" size={16} color="#999" />
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentActionButton}>
            <Ionicons name="share-outline" size={16} color="#999" />
            <Text style={styles.replyText}>Share</Text>
          </TouchableOpacity>
        </View>
        {groupedAllComments[c.id]?.length > 0 && (
          <TouchableOpacity style={styles.replyCountButton}>
            <Text style={styles.replyCountText}>
              {groupedAllComments[c.id].length} {groupedAllComments[c.id].length === 1 ? 'reply' : 'replies'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render comment for modal (same as above but with more depth)
  const renderModalComment = (c: any, depth = 0) => (
    <View key={c.id} style={[styles.commentContainer, { marginLeft: depth * 20 }]}>
      <Image source={{ uri: c.users?.avatar || 'https://via.placeholder.com/40' }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            <Text style={styles.commentUsername}>{c.users?.name || 'Unknown User'}</Text>
            <Text style={styles.commentTime}>{formatTimeAgo(new Date(c.created_at))}</Text>
          </View>
          <TouchableOpacity style={styles.commentOptions}>
            <Ionicons name="ellipsis-horizontal" size={16} color="#999" />
          </TouchableOpacity>
        </View>
        <Text style={styles.commentText}>{c.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentActionButton}
            onPress={() => handleLikeComment(c.id)}
          >
            <Ionicons 
              name={commentLikes[c.id]?.liked ? 'heart' : 'heart-outline'} 
              size={16} 
              color={commentLikes[c.id]?.liked ? '#e74c3c' : '#999'} 
            />
            <Text style={[styles.commentActionText, { color: commentLikes[c.id]?.liked ? '#e74c3c' : '#999' }]}>
              {commentLikes[c.id]?.count || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.commentActionButton}
            onPress={() => setReplyingTo(c.id)}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#999" />
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentActionButton}>
            <Ionicons name="share-outline" size={16} color="#999" />
            <Text style={styles.replyText}>Share</Text>
          </TouchableOpacity>
        </View>
        {groupedAllComments[c.id]?.length > 0 && (
          <TouchableOpacity style={styles.replyCountButton}>
            <Text style={styles.replyCountText}>
              {groupedAllComments[c.id].length} {groupedAllComments[c.id].length === 1 ? 'reply' : 'replies'}
            </Text>
          </TouchableOpacity>
        )}
        {/* Render replies */}
        {groupedAllComments[c.id]?.map((reply: any) => renderModalComment(reply, depth + 1))}
      </View>
    </View>
  );

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !currentUser) return;
    
    try {
      await supabase.from('comments').insert([
        {
          post_id: post.id,
          user_id: currentUser.id,
          content: replyText.trim(),
          created_at: new Date().toISOString(),
          parent_id: replyingTo === 'root' ? null : replyingTo,
        },
      ]);
      
      setReplyText('');
      setReplyingTo(null);
      fetchAllComments();
      setCommentCount(commentCount + 1);
      fetchLikeAndCommentCounts();
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply. Please try again.');
    }
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: hologramScale }] }]}>
      {/* Gen 1 Quantum Particles */}
      {renderQuantumParticles()}
      
      {/* Gen 1 AI Suggestion */}
      {renderAISuggestion()}

      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.userName}>{user.displayName}</Text>
          <Text style={styles.timestamp}>{formatTimeAgo(post.createdAt)}</Text>
        </View>
        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Media Container with Gen 1 Badges */}
      <View style={styles.mediaContainerGen1}>
        {post.isLive && (
          <Animated.View style={[styles.badge, styles.liveBadge, { top: 8, transform: [{ scale: badgeAnim }] }] }>
            <Text style={styles.badgeText}>LIVE</Text>
          </Animated.View>
        )}
        {post.contentTags?.isNSFW && (
          <Animated.View style={[styles.badge, styles.nsfwBadge, { top: 38, transform: [{ scale: badgeAnim }] }] }>
            <Text style={styles.badgeText}>NSFW</Text>
          </Animated.View>
        )}
        {user.isVerified && (
          <Animated.View style={[styles.badge, styles.verifiedBadge, { top: 76, transform: [{ scale: badgeAnim }] }] }>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
          </Animated.View>
        )}
        <Animated.View style={[styles.badge, styles.nextGenBadge, { top: 114, transform: [{ scale: badgeAnim }] }] }>
          <Text style={styles.badgeText}>NEXT GEN</Text>
        </Animated.View>
        {renderMedia()}
      </View>

      {/* Post Content */}
      <Text style={styles.content}>{post.content}</Text>
      
      {/* Gen 1 Biometric Heart Rate */}
      {renderBioHeartRate()}
      
      {/* Stats */}
      <View style={styles.statsContainer}>
          <Text style={styles.statsText}>{likeCount} Likes</Text>
          <TouchableOpacity 
            onPress={() => { setShowAllComments(true); fetchAllComments(); }}
            style={styles.statsCommentButton}
          >
            <Text style={[styles.statsText, styles.commentStatsText]}>
              {comments.length} Comments
            </Text>
          </TouchableOpacity>
          <Text style={styles.statsText}>{post.shares} Shares</Text>
      </View>

      {/* Gen 1 Enhanced Actions */}
      <View style={styles.actionBar}>
        {/* Gen 1 Quantum Like Button */}
        <TouchableOpacity 
          onPress={() => handleGen1Like('like')} 
          onLongPress={handleLongPressLike}
          style={styles.actionButton}
        >
          <Animated.View style={{ transform: [{ scale: hologramScale }] }}>
            <Ionicons 
              name={liked ? getReactionIcon() : 'thumbs-up-outline'}
              size={24} 
              color={liked ? getReactionColor() : '#666'} 
            />
          </Animated.View>
          <Text style={[styles.actionText, { color: liked ? getReactionColor() : '#666' }]}>
            {currentReaction || 'Like'}
          </Text>
        </TouchableOpacity>

        {/* Gen 1 Voice-Activated Like */}
        <TouchableOpacity 
          onPress={handleVoiceLike}
          style={[styles.actionButton, voiceListening && styles.voiceListeningButton]}
        >
          <Ionicons 
            name={voiceListening ? 'mic' : 'mic-outline'} 
            size={24} 
            color={voiceListening ? '#64DD17' : '#666'} 
          />
          <Text style={[styles.actionText, { color: voiceListening ? '#64DD17' : '#666' }]}>
            {voiceListening ? 'Listening...' : 'Voice'}
          </Text>
        </TouchableOpacity>

        {/* Gen 1 Biometric Like */}
        <TouchableOpacity 
          onPress={handleBioLike}
          style={styles.actionButton}
        >
          <Ionicons name="fitness-outline" size={24} color="#ff6b35" />
          <Text style={[styles.actionText, { color: '#ff6b35' }]}>Bio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="arrow-redo-outline" size={24} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Gen 1 Like Streak Display */}
      {likeStreak > 0 && (
        <View style={styles.likeStreakContainer}>
          <LinearGradient
            colors={['#ff6b35', '#f7931e']}
            style={styles.likeStreakGradient}
          >
            <Ionicons name="flame" size={16} color="#fff" />
            <Text style={styles.likeStreakText}>Like Streak: {likeStreak}</Text>
          </LinearGradient>
        </View>
      )}

      {/* Comments Summary */}
      <View style={styles.commentsSection}>
        {comments.length > 0 ? (
          <TouchableOpacity 
            style={styles.viewCommentsButton} 
            onPress={() => { setShowAllComments(true); fetchAllComments(); }}
          >
            <View style={styles.commentSummary}>
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              <Text style={styles.commentCountText}>
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.noCommentsContainer}>
            <Ionicons name="chatbubble-outline" size={24} color="#ccc" style={{ marginBottom: 4 }} />
            <Text style={styles.noCommentsText}>No comments yet</Text>
          </View>
        )}
        
        {/* Add Comment Button */}
        <TouchableOpacity style={styles.addCommentButton} onPress={() => setReplyingTo('root')}>
          <Ionicons name="add-circle-outline" size={18} color="#64DD17" />
          <Text style={styles.addCommentText}>Add a comment...</Text>
        </TouchableOpacity>
      </View>
      {/* Reply input (inline) */}
      {replyingTo && (
        <View style={styles.replyInputContainer}>
          <View style={styles.replyInputHeader}>
            <Text style={styles.replyInputTitle}>
              {replyingTo === 'root' ? 'Add a comment' : 'Write a reply'}
            </Text>
            <TouchableOpacity onPress={() => { setReplyingTo(null); setReplyText(''); }} style={styles.closeReplyButton}>
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
          </View>
          <View style={styles.replyInputContent}>
            <TextInput
              style={styles.replyTextInput}
              placeholder={replyingTo === 'root' ? "What's on your mind?" : "Write your reply..."}
              placeholderTextColor="#999"
              value={replyText}
              onChangeText={setReplyText}
              onSubmitEditing={handleReplySubmit}
              returnKeyType="send"
              autoFocus
              multiline
              maxLength={500}
            />
            <View style={styles.replyInputActions}>
              <Text style={styles.characterCount}>{replyText.length}/500</Text>
              <TouchableOpacity 
                onPress={handleReplySubmit} 
                style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
                disabled={!replyText.trim()}
              >
                <Ionicons name="send" size={18} color={replyText.trim() ? "#64DD17" : "#ccc"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* All Comments Modal */}
      <Modal visible={showAllComments} animationType="slide" onRequestClose={() => setShowAllComments(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>Comments ({commentCount})</Text>
              <Text style={styles.modalSubtitle}>Join the conversation</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAllComments(false)} style={styles.closeModalButton}>
              <Ionicons name="close" size={24} color="#64DD17" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {modalLoading ? (
              <View style={styles.modalLoadingContainer}>
                <Text style={styles.modalLoadingText}>Loading...</Text>
              </View>
            ) : (
              groupedAllComments['root']?.length === 0 ? (
                <View style={styles.modalEmptyContainer}>
                  <Ionicons name="chatbubble-outline" size={48} color="#666" style={{ marginBottom: 16 }} />
                  <Text style={styles.modalEmptyText}>No comments yet.</Text>
                  <Text style={styles.modalEmptySubtext}>Be the first to share your thoughts!</Text>
                </View>
              ) : (
                groupedAllComments['root']?.map((c: any) => renderModalComment(c))
              )
            )}
          </View>
          {/* Reply input in modal */}
          {replyingTo && (
            <View style={styles.modalReplyInput}>
              <TextInput
                style={styles.modalReplyTextInput}
                placeholder="Write a reply..."
                placeholderTextColor="#888"
                value={replyText}
                onChangeText={setReplyText}
                onSubmitEditing={handleReplySubmit}
                returnKeyType="send"
                autoFocus
              />
              <TouchableOpacity onPress={handleReplySubmit} style={styles.modalSendButton}>
                <Ionicons name="send" size={22} color="#64DD17" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setReplyingTo(null); setReplyText(''); }} style={styles.modalCloseButton}>
                <Ionicons name="close" size={22} color="#aaa" />
              </TouchableOpacity>
            </View>
          )}
          {/* New top-level comment input (if not replying) */}
          {!replyingTo && (
            <View style={styles.modalCommentInput}>
              <TextInput
                style={styles.modalCommentTextInput}
                placeholder="Add a comment..."
                placeholderTextColor="#888"
                value={newModalComment}
                onChangeText={setNewModalComment}
                onSubmitEditing={async () => {
                  if (newModalComment.trim() && currentUser) {
                    await supabase.from('comments').insert([
                      {
                        post_id: post.id,
                        user_id: currentUser.id,
                        content: newModalComment.trim(),
                        created_at: new Date().toISOString(),
                        parent_id: null,
                      },
                    ]);
                    setNewModalComment('');
                    fetchAllComments();
                    setCommentCount(commentCount + 1);
                    fetchLikeAndCommentCounts();
                  }
                }}
                returnKeyType="send"
              />
              <TouchableOpacity
                onPress={async () => {
                  if (newModalComment.trim() && currentUser) {
                    await supabase.from('comments').insert([
                      {
                        post_id: post.id,
                        user_id: currentUser.id,
                        content: newModalComment.trim(),
                        created_at: new Date().toISOString(),
                        parent_id: null,
                      },
                    ]);
                    setNewModalComment('');
                    fetchAllComments();
                    setCommentCount(commentCount + 1);
                    fetchLikeAndCommentCounts();
                  }
                }}
                style={styles.modalSendButton}
              >
                <Ionicons name="send" size={22} color="#64DD17" />
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>

      {reactionPickerVisible && (
        <ReactionPicker
          isVisible={reactionPickerVisible}
          onSelect={handleSelectReaction}
          onClose={() => setReactionPickerVisible(false)}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: responsiveStyle({
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    marginHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    maxWidth: width - 40,
    alignSelf: 'center',
  }, { autoUpdate: true, screenSpecific: true }),
  header: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  }, { autoUpdate: true }),
  avatar: responsiveStyle({
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  }, { autoUpdate: true }),
  headerTextContainer: {
    flex: 1,
  },
  userName: {
    color: '#333',
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  optionsButton: {
    padding: 4,
  },
  content: {
    color: '#333',
    fontSize: isLargeScreen ? 16 : isMediumScreen ? 15 : 14,
    marginBottom: isLargeScreen ? 16 : isMediumScreen ? 14 : 12,
    lineHeight: isLargeScreen ? 24 : isMediumScreen ? 22 : 20,
  },
  mediaContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: isLargeScreen ? 240 : isMediumScreen ? 220 : 200,
    resizeMode: 'cover',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
  statsCommentButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  commentStatsText: {
    color: '#64DD17',
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: isLargeScreen ? 16 : isMediumScreen ? 14 : 12,
    paddingBottom: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    marginBottom: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
    paddingHorizontal: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
  },
  actionText: {
    marginLeft: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
    fontSize: isLargeScreen ? 15 : isMediumScreen ? 14 : 13,
    color: '#666',
    fontWeight: '600',
  },
  mediaContainerGen1: {
    borderRadius: isLargeScreen ? 20 : isMediumScreen ? 18 : 16,
    overflow: 'hidden',
    marginBottom: isLargeScreen ? 16 : isMediumScreen ? 14 : 12,
    marginHorizontal: isLargeScreen ? -20 : isMediumScreen ? -16 : -12,
    backgroundColor: '#181818',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    minHeight: isLargeScreen ? 240 : isMediumScreen ? 220 : 200,
    justifyContent: 'center',
    width: '100%',
  },
  badge: {
    position: 'absolute',
    left: 16,
    top: 8,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    backgroundColor: '#F44336',
  },
  nsfwBadge: {
    backgroundColor: '#9C27B0',
  },
  verifiedBadge: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  nextGenBadge: {
    backgroundColor: '#9C27B0',
    right: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  commentsSection: {
    marginTop: isLargeScreen ? 16 : isMediumScreen ? 14 : 12,
    paddingTop: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: isLargeScreen ? 16 : isMediumScreen ? 14 : 12,
  },
  noCommentsText: {
    color: '#999',
    fontSize: isLargeScreen ? 12 : isMediumScreen ? 11 : 10,
    fontWeight: '500',
  },
  noCommentsSubtext: {
    color: '#ccc',
    fontSize: isLargeScreen ? 12 : isMediumScreen ? 11 : 10,
    fontStyle: 'italic',
  },
  viewAllCommentsButton: {
    marginTop: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    paddingVertical: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
  },
  viewAllCommentsText: {
    color: '#64DD17',
    fontWeight: 'bold',
    fontSize: isLargeScreen ? 14 : isMediumScreen ? 13 : 12,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    paddingVertical: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
  },
  commentAvatar: {
    width: isLargeScreen ? 32 : isMediumScreen ? 28 : 24,
    height: isLargeScreen ? 32 : isMediumScreen ? 28 : 24,
    borderRadius: isLargeScreen ? 16 : isMediumScreen ? 14 : 12,
    marginRight: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    padding: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isLargeScreen ? 6 : isMediumScreen ? 4 : 2,
  },
  commentUserInfo: {
    flex: 1,
  },
  commentOptions: {
    padding: 4,
  },
  commentUsername: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: isLargeScreen ? 14 : isMediumScreen ? 13 : 12,
    marginBottom: isLargeScreen ? 2 : isMediumScreen ? 1 : 0,
  },
  commentTime: {
    color: '#999',
    fontSize: isLargeScreen ? 11 : isMediumScreen ? 10 : 9,
  },
  commentText: {
    color: '#333',
    fontSize: isLargeScreen ? 14 : isMediumScreen ? 13 : 12,
    lineHeight: isLargeScreen ? 20 : isMediumScreen ? 18 : 16,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: isLargeScreen ? 6 : isMediumScreen ? 4 : 2,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: isLargeScreen ? 16 : isMediumScreen ? 12 : 8,
    paddingVertical: isLargeScreen ? 4 : isMediumScreen ? 2 : 1,
  },
  commentActionText: {
    marginLeft: isLargeScreen ? 4 : isMediumScreen ? 2 : 1,
    fontSize: isLargeScreen ? 12 : isMediumScreen ? 11 : 10,
  },
  replyText: {
    color: '#64DD17',
    fontSize: isLargeScreen ? 12 : isMediumScreen ? 11 : 10,
    fontWeight: '500',
  },
  replyCountButton: {
    marginTop: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
    paddingVertical: isLargeScreen ? 4 : isMediumScreen ? 2 : 1,
  },
  replyCountText: {
    color: '#666',
    fontSize: isLargeScreen ? 11 : isMediumScreen ? 10 : 9,
    fontWeight: '500',
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    paddingHorizontal: isLargeScreen ? 16 : isMediumScreen ? 14 : 12,
    backgroundColor: '#f8f9fa',
    borderRadius: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    marginTop: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  addCommentText: {
    color: '#666',
    fontSize: isLargeScreen ? 14 : isMediumScreen ? 13 : 12,
    marginLeft: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
  },
  viewCommentsButton: {
    marginBottom: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
  },
  commentSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
    paddingHorizontal: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    backgroundColor: '#f8f9fa',
    borderRadius: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  commentCountText: {
    color: '#666',
    fontSize: isLargeScreen ? 13 : isMediumScreen ? 12 : 11,
    fontWeight: '500',
    marginLeft: isLargeScreen ? 6 : isMediumScreen ? 4 : 2,
    marginRight: isLargeScreen ? 6 : isMediumScreen ? 4 : 2,
  },
  replyInputContainer: {
    marginTop: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    backgroundColor: '#f8f9fa',
    borderRadius: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  replyInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isLargeScreen ? 16 : isMediumScreen ? 14 : 12,
    paddingVertical: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    backgroundColor: '#f1f3f4',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  replyInputTitle: {
    fontSize: isLargeScreen ? 14 : isMediumScreen ? 13 : 12,
    fontWeight: '600',
    color: '#333',
  },
  closeReplyButton: {
    padding: 4,
  },
  replyInputContent: {
    padding: isLargeScreen ? 16 : isMediumScreen ? 14 : 12,
  },
  replyTextInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
    padding: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    minHeight: isLargeScreen ? 80 : isMediumScreen ? 70 : 60,
    textAlignVertical: 'top',
    fontSize: isLargeScreen ? 14 : isMediumScreen ? 13 : 12,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
  },
  replyInputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: isLargeScreen ? 11 : isMediumScreen ? 10 : 9,
    color: '#999',
  },
  sendButton: {
    padding: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
    borderRadius: isLargeScreen ? 20 : isMediumScreen ? 18 : 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#181818',
    paddingTop: Platform.OS === 'ios' ? 60 : 30, // Safe area for status bar and dynamic island
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#222',
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  modalSubtitle: {
    color: '#999',
    fontSize: 12,
  },
  closeModalButton: {
    padding: 8,
    marginLeft: 12,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoadingText: {
    color: '#fff',
    fontSize: 16,
  },
  modalEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalEmptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalEmptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  modalCommentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#222',
  },
  modalCommentTextInput: {
    flex: 1,
    color: '#fff',
    backgroundColor: '#181818',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
  },
  modalReplyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#222',
  },
  modalReplyTextInput: {
    flex: 1,
    color: '#fff',
    backgroundColor: '#181818',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
  },
  modalSendButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  modalCloseButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#333',
    marginLeft: 8,
  },
  likeStreakContainer: {
    marginTop: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    alignItems: 'center',
  },
  likeStreakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
    paddingHorizontal: isLargeScreen ? 16 : isMediumScreen ? 14 : 12,
    borderRadius: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  likeStreakText: {
    color: '#fff',
    fontSize: isLargeScreen ? 14 : isMediumScreen ? 13 : 12,
    fontWeight: 'bold',
    marginLeft: isLargeScreen ? 8 : isMediumScreen ? 6 : 4,
  },
  voiceListeningButton: {
    opacity: 0.7,
  },
  quantumParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#00ff88',
    borderRadius: 4,
    opacity: 0,
  },
  aiSuggestion: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  aiSuggestionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    opacity: 0.9,
  },
  aiSuggestionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bioHeartRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: isLargeScreen ? 12 : isMediumScreen ? 10 : 8,
    marginBottom: isLargeScreen ? 16 : isMediumScreen ? 14 : 12,
  },
  bioHeartRateText: {
    color: '#ff6b35',
    fontSize: isLargeScreen ? 14 : isMediumScreen ? 13 : 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Gen 1 Enhanced Styles
  quantumParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#00ff88',
    borderRadius: 4,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  aiSuggestion: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  aiSuggestionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  aiSuggestionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bioHeartRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    marginVertical: 8,
  },
  bioHeartRateText: {
    color: '#ff6b35',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  likeStreakContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  likeStreakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  likeStreakText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  voiceListeningButton: {
    backgroundColor: 'rgba(100, 221, 23, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(100, 221, 23, 0.3)',
  },
}); 