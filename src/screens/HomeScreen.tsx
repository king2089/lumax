import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  RefreshControl,
  Platform,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import { usePost } from '../context/PostContext';
import { PostCard } from '../components/PostCard';
import { StoryList } from '../components/StoryList';
import { LiveStreamPost } from '../components/LiveStreamPost';
import { DevelopmentBanner } from '../components/DevelopmentBanner';
import { scale, getResponsiveFontSize, getResponsivePadding } from '../utils/responsive';
import { Post } from '../types';
import { useLiveStreaming } from '../hooks/useLiveStreaming';
import { LiveStreamConfig } from '../services/LiveStreamingService';
import AutoUpdateService from '../services/AutoUpdateService';

const { width, height } = Dimensions.get('window');

type HomeScreenNavigationProp = {
  navigate: (screen: string, params?: any) => void;
};

export const HomeScreen: React.FC = () => {
  const { posts, stories, addPost, setPosts, updatePost, setLoading } = useApp();
  const { user } = useAuth();
  const { currentMood, moodIntensity, detectMoodFromActivity } = useMood();
  const { feedPosts, createPost } = usePost();
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [isNSFW, setIsNSFW] = useState(false);

  // Gen 1 Live Streaming Hook
  const {
    currentStream,
    liveStreams,
    isLoading: streamsLoading,
    isCreating,
    isStarting,
    isEnding,
    createLiveStream,
    startLiveStream,
    endLiveStream,
    joinLiveStream,
    leaveLiveStream,
    sendChatMessage,
    sendReaction,
    fetchLiveStreams,
    isUserLive,
    canGoLive,
    changeStreamQuality,
  } = useLiveStreaming();

  // Live stream configuration state
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDescription, setLiveDescription] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<'1080p' | '4K' | '8K' | '20K'>('4K');
  const [streamBitrate, setStreamBitrate] = useState(25000);
  const [enableAI, setEnableAI] = useState(true);
  const [enableHDR, setEnableHDR] = useState(false);
  const [enableRayTracing, setEnableRayTracing] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [streamPrivacy, setStreamPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [nsfwLevel, setNsfwLevel] = useState<'mild' | 'moderate' | 'explicit'>('mild');
  const [ageRestriction, setAgeRestriction] = useState(18);
  const [contentWarnings, setContentWarnings] = useState<string[]>(['adult-content']);
  
  // Real-time quality switching state
  const [currentStreamQuality, setCurrentStreamQuality] = useState<'1080p' | '4K' | '8K' | '20K'>('4K');
  const [isQualityChanging, setIsQualityChanging] = useState(false);
  const [qualityChangeProgress, setQualityChangeProgress] = useState(0);
  const [showQualitySelector, setShowQualitySelector] = useState(false);

  const QUALITY_OPTIONS = [
    { 
      id: '1080p', 
      label: '1080p HD', 
      description: 'Full HD • 1920x1080 • 60fps',
      bitrate: 8000,
      color: '#4CAF50',
      icon: 'videocam',
      resolution: '1920x1080',
      fps: 60,
      codec: 'H.264',
      features: ['Standard HD', 'Wide compatibility', 'Low bandwidth']
    },
    { 
      id: '4K', 
      label: '4K Ultra HD', 
      description: 'Ultra HD • 3840x2160 • 60fps',
      bitrate: 25000,
      color: '#2196F3',
      icon: 'diamond',
      resolution: '3840x2160',
      fps: 60,
      codec: 'H.265',
      features: ['Crystal clear', 'HDR support', 'Premium quality']
    },
    { 
      id: '8K', 
      label: '8K Cinema', 
      description: 'Cinema • 7680x4320 • 60fps',
      bitrate: 50000,
      color: '#9C27B0',
      icon: 'star',
      resolution: '7680x4320',
      fps: 60,
      codec: 'H.265',
      features: ['Cinema-grade', 'Immersive experience', 'Future-ready']
    },
    { 
      id: '20K', 
      label: '20K Next-Gen', 
      description: 'Future • 19200x10800 • 120fps',
      bitrate: 100000,
      color: '#FF6B6B',
      icon: 'flash',
      resolution: '19200x10800',
      fps: 120,
      codec: 'AV1',
      features: ['Next-generation', 'Ultra-smooth', 'Cutting-edge']
    }
  ];

  const CATEGORIES = [
    'general', 'gaming', 'music', 'education', 'cooking', 'fitness', 
    'travel', 'comedy', 'news', 'sports', 'art', 'technology',
    'adult', 'nsfw', 'mature', 'explicit'
  ];

  const NSFW_LEVELS = [
    { id: 'mild', label: 'Mild', description: 'Suggestive content' },
    { id: 'moderate', label: 'Moderate', description: 'Partial nudity' },
    { id: 'explicit', label: 'Explicit', description: 'Full nudity (Private only)' }
  ];

  const CONTENT_WARNINGS = [
    'adult-content', 'explicit-material', 'nudity', 'sexual-content'
  ];

  const [reels, setReels] = useState<any[]>([]);
  const [loadingReels, setLoadingReels] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initializeApp = async () => {
      await fetchFeed();
      await fetchReels();
    detectMoodFromActivity('social browsing');
      await requestCameraPermission();
      await fetchLiveStreams(); // Fetch live streams on mount
      
      // Force show Gen 1 update notification with Baby AI features
      try {
        const autoUpdateService = AutoUpdateService.getInstance();
        await autoUpdateService.forceOTAUpdate();
        // Also force update available to ensure notification shows
        autoUpdateService.forceUpdateAvailable();
      } catch (error) {
        console.log('AutoUpdateService not available:', error);
      }
    };

    initializeApp();
  }, [feedPosts]);

  const requestCameraPermission = async () => {
    if (!permission) {
      const { status } = await requestPermission();
      return status === 'granted';
    }
    return permission.granted;
  };

  const fetchFeed = async () => {
    try {
    setLoading(true);
      // Fetch posts logic here
      
      // Fetch live stream posts
      await fetchLiveStreamPosts();
      
      // Fetch notifications
      await fetchNotifications();
      
        setLoading(false);
    } catch (error) {
      console.error('Error fetching feed:', error);
      setLoading(false);
    }
  };

  const fetchLiveStreamPosts = async () => {
    try {
      // Get live streams and convert to posts
      const streams = await fetchLiveStreams();
      if (streams && Array.isArray(streams)) {
        const streamPosts = streams.map(stream => ({
          id: `live-stream-${stream.id}`,
          userId: stream.userId,
          content: `🔴 LIVE NOW: ${stream.title}\n\n${stream.description || ''}\n\nQuality: ${stream.quality} • ${stream.bitrate.toLocaleString()} kbps\nViewers: ${stream.viewers}\n\n#LiveStream #${stream.category}`,
          type: 'live_stream',
          media: [stream.thumbnailUrl || 'https://via.placeholder.com/400x225/FFD700/000000?text=Live+Stream'],
          likes: [],
          comments: [],
          shares: [],
          createdAt: stream.startedAt,
          updatedAt: stream.startedAt,
          isLive: true,
          liveStreamId: stream.id,
          liveStreamData: {
            title: stream.title,
            quality: stream.quality,
            bitrate: stream.bitrate,
            viewers: stream.viewers,
            category: stream.category,
            isNSFW: stream.isNSFW,
            nsfwLevel: stream.nsfwLevel,
            ageRestriction: stream.ageRestriction,
            contentWarnings: stream.contentWarnings
          }
        }));
        
        setLiveStreamPosts(streamPosts);
      } else {
        console.log('No live streams found or invalid response');
        setLiveStreamPosts([]);
      }
    } catch (error) {
      console.error('Error fetching live stream posts:', error);
      setLiveStreamPosts([]);
    }
  };

  const fetchReels = async () => {
    try {
    setLoadingReels(true);
      // Fetch reels logic here
    setLoadingReels(false);
    } catch (error) {
      console.error('Error fetching reels:', error);
      setLoadingReels(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Mock notifications for demo
      const mockNotifications = [
        {
          id: 'notification-1',
          type: 'live_stream_started',
          title: '🔴 Live Stream Started!',
          body: 'Your friend is now live streaming',
          data: {
            streamId: 'mock-stream-1',
            streamTitle: 'Amazing Stream',
            quality: '4K',
            category: 'gaming'
          },
          createdAt: new Date().toISOString(),
          read: false
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationPress = (notification: any) => {
    if (notification.type === 'live_stream_started') {
      // Navigate to live stream or show stream details
      Alert.alert(
        notification.title,
        notification.body,
        [
          {
            text: 'Join Stream',
            onPress: () => {
              // Handle joining the stream
              console.log('Joining stream:', notification.data.streamId);
            }
          },
          {
            text: 'Dismiss',
            style: 'cancel'
          }
        ]
      );
    }
    
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
  };

  const handleLiveStreamJoin = (streamId: string) => {
    // Handle joining live stream from feed
    console.log('Joining live stream from feed:', streamId);
    
    // Show success message
    Alert.alert(
      'Joined Stream! 🎬',
      'You\'re now watching the live stream. Enjoy!',
      [{ text: 'OK' }]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchFeed(),
      fetchReels(),
      fetchLiveStreams()
    ]);
    setRefreshing(false);
  };

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  const handleQuickPost = async () => {
    if (!postContent.trim()) {
      Alert.alert('Empty Post', 'Please enter some content for your post.');
      return;
    }

    try {
      setLoading(true);
      const newPost: Post = {
        id: Date.now().toString(),
        userId: user?.id || 'current-user',
        content: postContent.trim(),
        reactions: {},
        comments: [],
        shares: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
        tags: [],
        privacy: 'public',
        contentTags: { isNSFW: false, isSensitive: false, ageRestriction: 0, contentWarning: "", categories: [] as string[] },
        moderation: {
          isReported: false,
          reportCount: 0,
          isHidden: false,
          moderationStatus: 'approved',
          reportReasons: []
        },
      };

      addPost(newPost);
      setPostContent('');
      setShowCreatePost(false);
      setIsNSFW(false);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoLive = async () => {
    detectMoodFromActivity('start live stream');
    
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Camera Permission', 'Camera access is required to start live streaming.');
      return;
    }
    
    if (!canGoLive) {
      Alert.alert('Already Live', 'You are already broadcasting. Please end your current stream first.');
      return;
    }
    
    setShowLiveModal(true);
  };

  const handleStartLiveStream = async () => {
    if (!liveTitle.trim()) {
      Alert.alert('Live Stream Title', 'Please enter a title for your live stream.');
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Camera Permission', 'Camera access is required to start live streaming.');
      return;
    }
    
    const selectedQualityOption = QUALITY_OPTIONS.find(q => q.id === selectedQuality);
    
    const streamConfig: LiveStreamConfig = {
      title: liveTitle.trim(),
      description: liveDescription.trim(),
      quality: selectedQuality,
      bitrate: streamBitrate,
      enableAI,
      enableHDR,
      enableRayTracing,
      privacy: streamPrivacy,
      category: selectedCategory,
      tags: selectedTags,
      isNSFW: isNSFW,
      nsfwLevel: isNSFW ? nsfwLevel : undefined,
      ageRestriction: isNSFW ? ageRestriction : undefined,
      contentWarnings: isNSFW ? contentWarnings : undefined
    };

    try {
      const stream = await createLiveStream(streamConfig);
      if (stream) {
        setCurrentStreamQuality(stream.quality as any);
    setShowLiveModal(false);
    
        // Start the stream
        const startedStream = await startLiveStream(stream.id);
        if (startedStream) {
          // Add live stream post to feed
          await addLiveStreamPostToFeed(startedStream);
          
          // Add notification
          await addLiveStreamNotification(startedStream);
          
          Alert.alert(
            'Live Stream Started! 🎬',
            `Your ${startedStream.quality} stream is now live!\n\nQuality: ${startedStream.quality}\nBitrate: ${startedStream.bitrate.toLocaleString()} kbps\nViewers: ${startedStream.viewers}`,
            [
              {
                text: 'Change Quality',
                onPress: () => setShowQualitySelector(true)
              },
              {
                text: 'Continue',
                style: 'default'
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error starting live stream:', error);
      Alert.alert('Error', 'Failed to start live stream. Please try again.');
    }
  };

  const addLiveStreamPostToFeed = async (stream: any) => {
    try {
      if (!stream) {
        console.error('Stream object is undefined');
        return;
      }

      const liveStreamPost = {
        id: `live-stream-${stream.id || Date.now()}`,
        userId: stream.userId || 'demo-user',
        content: `🔴 LIVE NOW: ${stream.title || 'Live Stream'}\n\n${stream.description || ''}\n\nQuality: ${stream.quality || '4K'} • ${(stream.bitrate || 25000).toLocaleString()} kbps\nViewers: ${stream.viewers || 0}\n\n#LiveStream #${stream.category || 'general'}`,
        type: 'live_stream',
        media: [stream.thumbnailUrl || 'https://via.placeholder.com/400x225/FFD700/000000?text=Live+Stream'],
        likes: [],
        comments: [],
        shares: [],
        createdAt: stream.startedAt || new Date(),
        updatedAt: stream.startedAt || new Date(),
        isLive: true,
        liveStreamId: stream.id || `stream-${Date.now()}`,
        liveStreamData: {
          title: stream.title || 'Live Stream',
          quality: stream.quality || '4K',
          bitrate: stream.bitrate || 25000,
          viewers: stream.viewers || 0,
          category: stream.category || 'general',
          isNSFW: stream.isNSFW || false,
          nsfwLevel: stream.nsfwLevel || 'mild',
          ageRestriction: stream.ageRestriction || 13,
          contentWarnings: stream.contentWarnings || []
        }
      };

      // Add to the beginning of live stream posts
      setLiveStreamPosts(prev => [liveStreamPost, ...prev]);
      
      console.log('📝 Added live stream post to feed:', liveStreamPost.id);
    } catch (error) {
      console.error('Error adding live stream post to feed:', error);
    }
  };

  const addLiveStreamNotification = async (stream: any) => {
    try {
      if (!stream) {
        console.error('Stream object is undefined');
        return;
      }

      const notification = {
        id: `live-notification-${stream.id || Date.now()}`,
        type: 'live_stream_started',
        title: '🔴 Live Stream Started!',
        body: `${stream.title || 'Live Stream'} is now live in ${stream.quality || '4K'} quality`,
        data: {
          streamId: stream.id || `stream-${Date.now()}`,
          streamTitle: stream.title || 'Live Stream',
          quality: stream.quality || '4K',
          category: stream.category || 'general',
          isNSFW: stream.isNSFW || false
        },
        createdAt: new Date().toISOString(),
        read: false
      };

      // Add to the beginning of notifications
      setNotifications(prev => [notification, ...prev]);
      
      console.log('🔔 Added live stream notification:', notification.id);
    } catch (error) {
      console.error('Error adding live stream notification:', error);
    }
  };

  const handleQualityChange = async (newQuality: '1080p' | '4K' | '8K' | '20K') => {
    if (!currentStream) {
      Alert.alert('No Active Stream', 'Please start a live stream first.');
      return;
    }

    setIsQualityChanging(true);
    setQualityChangeProgress(0);
    setPreviewQuality(newQuality);

    try {
      // Simulate quality change progress
      const progressInterval = setInterval(() => {
        setQualityChangeProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      // Change quality in the service
      const updatedStream = await changeStreamQuality(currentStream.id, newQuality);
      
      if (updatedStream) {
        setCurrentStreamQuality(newQuality);
        setSelectedQuality(newQuality);
        
        // Update the current stream
        if (currentStream.id === updatedStream.id) {
          // Update the current stream reference
          // This would typically be handled by the service
        }

        // Show success message
        Alert.alert(
          'Quality Changed! 🎬',
          `Stream quality updated to ${newQuality}\n\nNew Settings:\n• Resolution: ${QUALITY_OPTIONS.find(q => q.id === newQuality)?.resolution}\n• Bitrate: ${updatedStream.bitrate.toLocaleString()} kbps\n• FPS: ${QUALITY_OPTIONS.find(q => q.id === newQuality)?.fps}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error changing quality:', error);
      Alert.alert('Error', 'Failed to change stream quality. Please try again.');
    } finally {
      setIsQualityChanging(false);
      setQualityChangeProgress(0);
    }
  };

  const quickGoLive = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Camera Permission', 'Camera access is required to start live streaming.');
      return;
    }
    
    // Quick live with default settings
    const streamConfig: LiveStreamConfig = {
      title: `${user?.displayName || 'User'}'s Live Stream`,
      description: 'Going live now!',
      quality: '4K',
      bitrate: 25000,
      enableAI: true,
      enableHDR: false,
      enableRayTracing: false,
      privacy: 'public',
      category: 'general',
      tags: ['quick-live'],
      isNSFW: false
    };

    try {
      const stream = await createLiveStream(streamConfig);
      if (stream) {
        await startLiveStream(stream.id);
      }
    } catch (error) {
      console.error('Error with quick go live:', error);
      Alert.alert('Error', 'Failed to start quick live stream. Please try again.');
    }
  };

  const testUpdateNotification = async () => {
    try {
      const autoUpdateService = AutoUpdateService.getInstance();
      await autoUpdateService.forceOTAUpdate();
      autoUpdateService.forceUpdateAvailable();
      Alert.alert('Gen 1 Update Notification', 'Version 1.3.0 OTA update notification triggered! Check for the update banner.');
    } catch (error) {
      console.log('Error testing update notification:', error);
    }
  };

  const testUpdateCompletion = async () => {
    try {
      // Simulate update completion for testing
      await AsyncStorage.setItem('updateCompleted', 'true');
      await AsyncStorage.setItem('lastUpdateVersion', '1.3.0');
      
      // Force app refresh
      if (global.appRefreshCallback) {
        global.appRefreshCallback();
      }
      
      Alert.alert(
        '🧪 Test Update Complete',
        'Update completion has been simulated. Check Luma Baby AI for new features!',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.log('Error testing update completion:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCamera = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  // Add image picker for quick post
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Video preview state
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [previewQuality, setPreviewQuality] = useState<'1080p' | '4K' | '8K' | '20K'>('4K');
  
  // Live stream posts and notifications state
  const [liveStreamPosts, setLiveStreamPosts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDevBanner, setShowDevBanner] = useState(true);

  // --- Move header and create post section into a renderHeader function ---
  const renderFeedHeader = () => (
    <>
      {/* Enhanced Live Status Indicator */}
      {isUserLive && currentStream && (
        <View style={styles.liveStatusBar}>
          <LinearGradient
            colors={['#F44337', '#FF5722']}
            style={styles.liveStatusGradient}
          >
            <View style={styles.liveStatusContent}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE • {currentStream.quality}</Text>
            </View>
              <View style={styles.liveStats}>
                <Text style={styles.liveViewersText}>{currentStream.viewers.toLocaleString()} viewers</Text>
                <Text style={styles.liveBitrateText}>{currentStream.bitrate.toLocaleString()}k</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Clean Header with Luma Gen 1 branding */}
      <View style={styles.header}>
          <LinearGradient
          colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 193, 7, 0.05)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Luma Gen 1</Text>
              <Text style={styles.headerSubtitle}>AI-Powered Social Platform</Text>
            </View>
            <View style={styles.headerRight}>
              {/* Development Mode Indicator */}
              <View style={styles.devModeIndicator}>
                <Text style={styles.devModeText}>BETA</Text>
              </View>
              
              {currentStream && currentStream.isLive && (
                <TouchableOpacity 
                  style={styles.qualityChangeHeaderButton}
                  onPress={() => setShowQualitySelector(true)}
                >
                  <Ionicons name="settings" size={16} color="#FFD700" />
                  <Text style={styles.qualityChangeHeaderText}>
                    {currentStreamQuality}
            </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => setShowNotifications(!showNotifications)}
              >
                <Ionicons name="notifications" size={24} color="#FFD700" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notifications.filter(n => !n.read).length}
                    </Text>
                  </View>
                )}
            </TouchableOpacity>
              <TouchableOpacity 
                style={styles.updateButton}
                onPress={testUpdateNotification}
              >
                <Ionicons name="refresh" size={20} color="#FFD700" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.updateButton}
                onPress={testUpdateCompletion}
              >
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>
          </LinearGradient>
        </View>

      {/* Create Post Section */}
      <View style={styles.createPostSection}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={styles.createPostGradient}
        >
          <View style={styles.createPostContent}>
            <TouchableOpacity style={styles.createPostInput} onPress={handleCreatePost}>
              <Ionicons name="add-circle" size={24} color="#FFD700" />
              <Text style={styles.createPostPlaceholder}>What's on your mind, Gen 1?</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.createPostActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleGoLive}>
              <LinearGradient
                colors={['rgba(244,67,54,0.2)', 'rgba(244,67,54,0.1)']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="videocam" size={20} color="#F44337" />
                <Text style={styles.actionText}>Live</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleCreatePost}>
              <LinearGradient
                colors={['rgba(76,175,80,0.2)', 'rgba(76,175,80,0.1)']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="images" size={20} color="#4CAF50" />
                <Text style={styles.actionText}>Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['rgba(255,193,7,0.2)', 'rgba(255,193,7,0.1)']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="happy" size={20} color="#FFC107" />
                <Text style={styles.actionText}>Feeling</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
      {/* Development Banner */}
      <DevelopmentBanner 
        isVisible={showDevBanner}
        onClose={() => setShowDevBanner(false)}
      />
      
      {/* Enhanced Stories Section */}
      <StoryList stories={stories} />
    </>
  );

  // Animated background logic
  const [bgAnim] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => bgAnim.setValue(0));
  }, [currentMood]);

  const renderLiveSetupModal = () => (
    <Modal
      visible={showLiveModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLiveModal(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Go Live</Text>
            <View style={styles.placeholder} />
                </View>

          {/* Camera Preview */}
          <View style={styles.cameraContainer}>
            {permission?.granted ? (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={cameraType}
              />
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Ionicons name="videocam-off" size={48} color="#666" />
                <Text style={styles.cameraPlaceholderText}>Camera access required</Text>
            </View>
          )}
            <TouchableOpacity style={styles.cameraToggle} onPress={toggleCamera}>
              <Ionicons name="camera-reverse" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Stream Configuration */}
          <View style={styles.configSection}>
            <Text style={styles.configTitle}>Stream Settings</Text>
            
            {/* Title Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter stream title..."
                placeholderTextColor="#666"
                value={liveTitle}
                onChangeText={setLiveTitle}
                maxLength={100}
              />
              </View>

            {/* Description Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your stream..."
                placeholderTextColor="#666"
                value={liveDescription}
                onChangeText={setLiveDescription}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
              </View>

            {/* Quality Selection */}
            <View style={styles.inputContainer}>
              <View style={styles.qualityHeader}>
                <Text style={styles.inputLabel}>Quality</Text>
                {currentStream && (
                  <View style={styles.currentQualityBadge}>
                    <Text style={styles.currentQualityText}>
                      Live: {currentStreamQuality}
                    </Text>
              </View>
                )}
            </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.qualityScroll}>
                {QUALITY_OPTIONS.map((option) => (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.qualityOption,
                      selectedQuality === option.id && styles.qualityOptionSelected,
                      currentStream && currentStreamQuality === option.id && styles.qualityOptionLive
        ]}
        onPress={() => {
                      if (currentStream && currentStream.isLive) {
                        // If stream is live, change quality in real-time
                        handleQualityChange(option.id as any);
                      } else {
                        // If not live, just update selection
                        setSelectedQuality(option.id as any);
          setStreamBitrate(option.bitrate);
                      }
                    }}
        >
          <View style={styles.qualityHeader}>
                      <Ionicons name={option.icon} size={20} color={selectedQuality === option.id ? '#fff' : option.color} />
                      {currentStream && currentStreamQuality === option.id && (
                        <View style={styles.liveIndicator}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>LIVE</Text>
                        </View>
              )}
            </View>
                    <Text style={[styles.qualityLabel, selectedQuality === option.id && styles.qualityLabelSelected]}>
                  {option.label}
                </Text>
                    <Text style={[styles.qualityDescription, selectedQuality === option.id && styles.qualityDescriptionSelected]}>
                      {option.description}
                    </Text>
                    <View style={styles.qualityDetails}>
                      <Text style={[styles.qualityDetail, selectedQuality === option.id && styles.qualityDetailSelected]}>
                        {option.bitrate.toLocaleString()} kbps
                      </Text>
                      <Text style={[styles.qualityDetail, selectedQuality === option.id && styles.qualityDetailSelected]}>
                        {option.codec}
                    </Text>
                  </View>
                    <View style={styles.qualityFeatures}>
                      {option.features.slice(0, 2).map((feature, index) => (
                        <Text key={index} style={[styles.qualityFeature, selectedQuality === option.id && styles.qualityFeatureSelected]}>
                          {feature}
            </Text>
                      ))}
          </View>
                    {currentStream && currentStream.isLive && (
                      <TouchableOpacity
                        style={styles.changeQualityButton}
                        onPress={() => handleQualityChange(option.id as any)}
                      >
                        <Text style={styles.changeQualityText}>
                          {currentStreamQuality === option.id ? 'Current' : 'Switch'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {isQualityChanging && (
                <View style={styles.qualityChangeProgress}>
                  <Text style={styles.qualityChangeText}>Changing quality...</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${qualityChangeProgress}%` }]} />
                  </View>
            </View>
          )}
              
              {/* Video Preview */}
              {currentStream && currentStream.isLive && (
                <View style={styles.videoPreviewContainer}>
                  <View style={styles.videoPreviewHeader}>
                    <Text style={styles.videoPreviewTitle}>Live Stream Preview</Text>
                    <TouchableOpacity
                      style={styles.previewToggleButton}
                      onPress={() => setShowVideoPreview(!showVideoPreview)}
                    >
                      <Ionicons 
                        name={showVideoPreview ? 'eye-off' : 'eye'} 
                        size={20} 
                        color="#FFD700" 
                      />
                    </TouchableOpacity>
        </View>
                  
                  {showVideoPreview && (
                    <View style={styles.videoPreview}>
                      <View style={styles.videoPlaceholder}>
                        <Ionicons name="videocam" size={48} color="#FFD700" />
                        <Text style={styles.videoPlaceholderText}>
                          Live Stream
                        </Text>
                        <Text style={styles.videoQualityText}>
                          {currentStreamQuality} • {QUALITY_OPTIONS.find(q => q.id === currentStreamQuality)?.bitrate.toLocaleString()} kbps
                        </Text>
                        <View style={styles.videoStats}>
                          <Text style={styles.videoStatText}>
                            Viewers: {currentStream.viewers}
                          </Text>
                          <Text style={styles.videoStatText}>
                            Duration: {Math.floor((Date.now() - currentStream.startedAt.getTime()) / 1000)}s
            </Text>
          </View>
                      </View>
                      
                      {/* Quality Change Animation */}
                      {isQualityChanging && (
                        <View style={styles.qualityChangeOverlay}>
                          <View style={styles.qualityChangeIndicator}>
                            <Ionicons name="sync" size={24} color="#FFD700" />
                            <Text style={styles.qualityChangeOverlayText}>
                              Switching to {previewQuality}...
                            </Text>
                          </View>
            </View>
          )}
            </View>
          )}
            </View>
          )}
        </View>
        
            {/* Category Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category && styles.categoryOptionSelected
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[styles.categoryLabel, selectedCategory === category && styles.categoryLabelSelected]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Privacy Settings */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Privacy</Text>
              <View style={styles.privacyOptions}>
                {(['public', 'friends', 'private'] as const).map((privacy) => (
                  <TouchableOpacity
                    key={privacy}
                    style={[
                      styles.privacyOption,
                      streamPrivacy === privacy && styles.privacyOptionSelected
                    ]}
                    onPress={() => setStreamPrivacy(privacy)}
                  >
                    <Ionicons 
                      name={privacy === 'public' ? 'globe' : privacy === 'friends' ? 'people' : 'lock-closed'} 
                      size={16} 
                      color={streamPrivacy === privacy ? '#fff' : '#666'} 
                    />
                    <Text style={[styles.privacyLabel, streamPrivacy === privacy && styles.privacyLabelSelected]}>
                      {privacy.charAt(0).toUpperCase() + privacy.slice(1)}
                    </Text>
    </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Advanced Settings Toggle */}
            <TouchableOpacity
              style={styles.advancedToggle}
              onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              <Text style={styles.advancedToggleText}>Advanced Settings</Text>
              <Ionicons 
                name={showAdvancedSettings ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#FFD700" 
              />
            </TouchableOpacity>

            {/* NSFW Settings */}
            <View style={styles.inputContainer}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>NSFW Content</Text>
                  <Text style={styles.settingDescription}>Adult content (18+ only)</Text>
                </View>
          <TouchableOpacity
                  style={[styles.toggle, isNSFW && styles.toggleActive]}
                  onPress={() => setIsNSFW(!isNSFW)}
          >
                  <View style={[styles.toggleThumb, isNSFW && styles.toggleThumbActive]} />
          </TouchableOpacity>
              </View>
            </View>

            {isNSFW && (
              <View style={styles.nsfwSettings}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>NSFW Level</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nsfwLevelScroll}>
                    {NSFW_LEVELS.map((level) => (
          <TouchableOpacity
                        key={level.id}
                        style={[
                          styles.nsfwLevelOption,
                          nsfwLevel === level.id && styles.nsfwLevelOptionSelected
                        ]}
                        onPress={() => setNsfwLevel(level.id as any)}
                      >
                        <Text style={[styles.nsfwLevelLabel, nsfwLevel === level.id && styles.nsfwLevelLabelSelected]}>
                          {level.label}
                        </Text>
                        <Text style={[styles.nsfwLevelDescription, nsfwLevel === level.id && styles.nsfwLevelDescriptionSelected]}>
                          {level.description}
                        </Text>
          </TouchableOpacity>
                    ))}
                  </ScrollView>
        </View>
        
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Content Warnings</Text>
                  <View style={styles.warningOptions}>
                    {CONTENT_WARNINGS.map((warning) => (
                      <TouchableOpacity
                        key={warning}
                        style={[
                          styles.warningOption,
                          contentWarnings.includes(warning) && styles.warningOptionSelected
                        ]}
                        onPress={() => {
                          if (contentWarnings.includes(warning)) {
                            setContentWarnings(contentWarnings.filter(w => w !== warning));
                          } else {
                            setContentWarnings([...contentWarnings, warning]);
                          }
                        }}
                      >
                        <Text style={[styles.warningLabel, contentWarnings.includes(warning) && styles.warningLabelSelected]}>
                          {warning.replace('-', ' ')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
          </View>

                {nsfwLevel === 'explicit' && (
                  <View style={styles.explicitWarning}>
                    <Ionicons name="warning" size={20} color="#FF6B6B" />
                    <Text style={styles.explicitWarningText}>
                      Explicit content must be private streams only
                    </Text>
            </View>
                )}
          </View>
            )}

          {/* Advanced Settings */}
          {showAdvancedSettings && (
              <View style={styles.advancedSettings}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>AI Enhancement</Text>
                    <Text style={styles.settingDescription}>Real-time AI improvements</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, enableAI && styles.toggleActive]}
                  onPress={() => setEnableAI(!enableAI)}
                >
                    <View style={[styles.toggleThumb, enableAI && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>HDR10+ Support</Text>
                    <Text style={styles.settingDescription}>Enhanced color and contrast</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, enableHDR && styles.toggleActive]}
                  onPress={() => setEnableHDR(!enableHDR)}
                >
                    <View style={[styles.toggleThumb, enableHDR && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Ray Tracing</Text>
                    <Text style={styles.settingDescription}>Advanced lighting effects</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, enableRayTracing && styles.toggleActive]}
                  onPress={() => setEnableRayTracing(!enableRayTracing)}
                >
                    <View style={[styles.toggleThumb, enableRayTracing && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>
          )}
            </View>
            
          {/* Go Live Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.goLiveButton, !liveTitle.trim() && styles.goLiveButtonDisabled]}
              onPress={handleStartLiveStream}
              disabled={!liveTitle.trim() || isCreating || isStarting}
            >
              <LinearGradient
                colors={liveTitle.trim() ? 
                  ['#F44337', '#FF5722'] : 
                  ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.05)']}
                style={styles.goLiveButtonGradient}
              >
                <Ionicons name="videocam" size={20} color="#fff" />
                <Text style={styles.goLiveButtonText}>
                  {isCreating || isStarting ? 'Starting...' : `Go Live in ${selectedQuality}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderPost = ({ item, index }: { item: any; index: number }) => {
    // Handle live stream posts
    if (item.type === 'live_stream') {
      const postUser = users.find(u => u.id === item.userId) || {
        id: item.userId || '0',
        username: 'streamer',
        displayName: 'Live Streamer',
        email: '',
        avatar: 'https://i.pravatar.cc/150?u=streamer',
        bio: 'Live streaming now!',
        followers: [],
        following: [],
        posts: [],
        createdAt: new Date(),
        isVerified: true,
        isPrivate: false,
        isAgeVerified: true,
        blockedUsers: [],
        reportedUsers: [],
        contentPreferences: { allowNSFW: false, requireContentWarnings: true, blockedKeywords: [] },
        lumaCardBalance: 0,
      };
      
      return (
        <LiveStreamPost 
          post={item} 
          user={postUser} 
          onJoin={handleLiveStreamJoin}
        />
      );
    }
    
    // Handle regular posts
    const postUser = users.find(u => u.id === item.userId) || {
      id: '0',
      username: 'unknown',
      displayName: 'Unknown User',
      email: '',
      avatar: 'https://i.pravatar.cc/150?u=0',
      bio: '',
      followers: [],
      following: [],
      posts: [],
      createdAt: new Date(),
      isVerified: false,
      isPrivate: false,
      isAgeVerified: false,
      blockedUsers: [],
      reportedUsers: [],
      contentPreferences: { allowNSFW: false, requireContentWarnings: true, blockedKeywords: [] },
      lumaCardBalance: 0,
    };
    return <PostCard post={item} user={postUser} scrollY={scrollY} index={index} />;
  };

  // Combine regular posts and live stream posts
  const combinedPosts = [...liveStreamPosts, ...posts];

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.background,
          {
            opacity: bgAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8],
            }),
          },
        ]}
      />
      
      <View style={styles.cardSection}>
        <FlatList
          data={combinedPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderFeedHeader}
          showsVerticalScrollIndicator={Platform.OS === 'android' ? false : false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFD700"
              colors={['#FFD700']}
            />
          }
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={Platform.OS === 'android' ? 10 : 5}
          windowSize={Platform.OS === 'android' ? 21 : 10}
        />
          </View>
          
      {/* Create Post Modal */}
      <Modal
        visible={showCreatePost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCreatePost(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
          <TouchableOpacity 
              style={styles.postButton}
              onPress={handleQuickPost}
              disabled={!postContent.trim()}
            >
              <Text style={[styles.postButtonText, !postContent.trim() && styles.postButtonTextDisabled]}>
                Post
              </Text>
          </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
              <TextInput
              style={styles.postInput}
              placeholder="What's on your mind, Gen 1?"
              placeholderTextColor="#666"
                value={postContent}
                onChangeText={setPostContent}
                multiline
              textAlignVertical="top"
            />
              </View>
        </SafeAreaView>
      </Modal>

      {/* Live Setup Modal */}
      {renderLiveSetupModal()}

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
                  <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowNotifications(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off" size={48} color="#666" />
                <Text style={styles.emptyNotificationsText}>No notifications yet</Text>
              </View>
            ) : (
              notifications.map((notification, index) => (
                  <TouchableOpacity 
                  key={notification.id}
                    style={[
                    styles.notificationItem,
                    !notification.read && styles.unreadNotification
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View style={styles.notificationIcon}>
                    <Ionicons 
                      name={notification.type === 'live_stream_started' ? 'videocam' : 'notifications'} 
                      size={24} 
                      color="#FFD700" 
                    />
                </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationBody}>{notification.body}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </Text>
              </View>
                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
            </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: Platform.OS === 'android' ? 0 : getResponsivePadding(4),
    paddingTop: Platform.OS === 'android' ? 0 : getResponsivePadding(4),
    ...(Platform.OS === 'android' && {
      height: '100%',
      width: '100%',
    }),
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0a',
    ...(Platform.OS === 'android' && {
      height: '100%',
      width: '100%',
    }),
  },
  listContent: {
    paddingBottom: Platform.OS === 'android' ? 120 : 100,
  },
  cardSection: {
    flex: 1,
    marginHorizontal: Platform.OS === 'android' ? 0 : getResponsivePadding(8),
    marginTop: Platform.OS === 'android' ? 0 : getResponsivePadding(4),
    marginBottom: Platform.OS === 'android' ? 0 : getResponsivePadding(4),
    borderRadius: Platform.OS === 'android' ? 0 : getResponsivePadding(16),
    backgroundColor: Platform.OS === 'android' ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
    shadowColor: Platform.OS === 'android' ? 'transparent' : '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
    shadowRadius: Platform.OS === 'android' ? 0 : 3.84,
    elevation: Platform.OS === 'android' ? 0 : 5,
  },
  liveStatusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  liveStatusGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  liveStatusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  liveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  liveStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveViewersText: {
    color: '#fff',
    fontSize: 12,
    marginRight: 12,
  },
  liveBitrateText: {
    color: '#fff',
    fontSize: 12,
  },
  header: {
    marginTop: Platform.OS === 'android' ? getResponsivePadding(40) : getResponsivePadding(60),
    marginHorizontal: Platform.OS === 'android' ? getResponsivePadding(8) : getResponsivePadding(16),
    marginBottom: getResponsivePadding(20),
  },
  headerGradient: {
    borderRadius: 20,
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: getResponsiveFontSize(26),
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: getResponsiveFontSize(15),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualityChangeHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  qualityChangeHeaderText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F44337',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  createPostSection: {
    marginHorizontal: Platform.OS === 'android' ? getResponsivePadding(8) : getResponsivePadding(16),
    marginBottom: getResponsivePadding(20),
  },
  createPostGradient: {
    borderRadius: 20,
    padding: 20,
  },
  createPostContent: {
    marginBottom: 16,
  },
  createPostInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  createPostPlaceholder: {
    flex: 1,
    marginLeft: 14,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  actionText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: getResponsivePadding(4),
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsivePadding(16),
    paddingVertical: getResponsivePadding(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFD700',
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  postButtonTextDisabled: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    padding: getResponsivePadding(16),
  },
  postInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textAlignVertical: 'top',
  },
  cameraContainer: {
    height: 200,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholderText: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
  cameraToggle: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  configSection: {
    padding: 16,
  },
  configTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  qualityScroll: {
    flexDirection: 'row',
  },
  qualityOption: {
    width: 120,
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  qualityOptionSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  qualityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
  },
  qualityLabelSelected: {
    color: '#000',
  },
  qualityDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
    textAlign: 'center',
  },
  qualityDescriptionSelected: {
    color: 'rgba(0, 0, 0, 0.7)',
  },
  qualityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  qualityDetail: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  qualityDetailSelected: {
    color: 'rgba(0, 0, 0, 0.7)',
  },
  qualityFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  qualityFeature: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qualityFeatureSelected: {
    color: 'rgba(0, 0, 0, 0.8)',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  qualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentQualityBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentQualityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  qualityOptionLive: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44337',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '600',
  },
  changeQualityButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  changeQualityText: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
  },
  qualityChangeProgress: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
  },
  qualityChangeText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postUserDetails: {
    marginLeft: scale(12),
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  videoPreviewContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  videoPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  videoPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  previewToggleButton: {
    padding: 4,
  },
  videoPreview: {
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  videoPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginTop: 8,
  },
  videoQualityText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  videoStats: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  videoStatText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  qualityChangeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualityChangeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  qualityChangeOverlayText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryOptionSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#fff',
  },
  categoryLabelSelected: {
    color: '#000',
    fontWeight: '600',
  },
  privacyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  privacyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  privacyOptionSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  privacyLabel: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  privacyLabelSelected: {
    color: '#000',
    fontWeight: '600',
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 16,
  },
  advancedToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFD700',
  },
  advancedSettings: {
    marginTop: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  settingDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#FFD700',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  goLiveButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  goLiveButtonDisabled: {
    opacity: 0.5,
  },
  goLiveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  goLiveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  nsfwSettings: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  nsfwLevelScroll: {
    flexDirection: 'row',
  },
  nsfwLevelOption: {
    width: 100,
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  nsfwLevelOptionSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  nsfwLevelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  nsfwLevelLabelSelected: {
    color: '#fff',
  },
  nsfwLevelDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  nsfwLevelDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  warningOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  warningOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  warningOptionSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  warningLabel: {
    fontSize: 12,
    color: '#fff',
    textTransform: 'capitalize',
  },
  warningLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  updateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  devModeIndicator: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  devModeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  explicitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 8,
    marginTop: 12,
  },
  explicitWarningText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default HomeScreen;