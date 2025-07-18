import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
  TextInput,
  Modal,
  FlatList,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { usePost, ProfilePost } from '../context/PostContext';
import { ProfileSettingsModal } from '../components/ProfileSettingsModal';
import { PostCard } from '../components/PostCard';
import { supabase } from '../supabaseClient';
import { Video } from 'expo-av';
import { scale, responsiveStyle } from '../utils/responsive';

const { width } = Dimensions.get('window');

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const { userMusicProfile, followedArtists, playlist, trendingTracks } = useMusic();
  const {
    profilePosts,
    createPost,
    updatePost,
    deletePost,
    pinPost,
    unpinPost,
    createStory,
    getPostStats,
  } = usePost();
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'videos' | 'reels' | 'tagged'>('posts');
  const [userReels, setUserReels] = useState<any[]>([]);
  const [loadingReels, setLoadingReels] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  
  // Gen 1 Enhanced Features
  const [showGen1Features, setShowGen1Features] = useState(false);
  const [gen1Stats, setGen1Stats] = useState({
    aiInteractions: 1247,
    contentCreated: 89,
    liveStreams: 23,
    supportTickets: 5,
    musicTracks: 12,
    collaborations: 8
  });
  
  // 4D Media Upload States
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<Array<{id: string, uri: string, type: 'image' | 'video', timestamp: Date}>>([]);
  const [selected4DMedia, setSelected4DMedia] = useState<string | null>(null);
  
  // Animation refs for 4D effects
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const depthAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Force refresh profile data after upload
  const refreshProfileData = () => {
    // This will trigger a re-render and show the new posts
    const stats = getProfileStats();
    console.log('Profile refreshed with', stats.posts, 'posts');
  };

  useEffect(() => {
    if (activeTab === 'reels') fetchUserReels();
  }, [activeTab]);

  const fetchUserReels = async () => {
    setLoadingReels(true);
    const { data, error } = await supabase
      .from('reels')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setUserReels(data);
    setLoadingReels(false);
  };

  const handleCreateReel = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
      videoMaxDuration: 120,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      // Upload to Supabase Storage
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const fileName = `${user.id}_${Date.now()}.mp4`;
      const filePath = `${user.id}/${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('reels').upload(filePath, blob, {
        contentType: 'video/mp4',
        upsert: true,
      });
      if (uploadError) {
        alert('Failed to upload video');
        return;
      }
      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('reels').getPublicUrl(filePath);
      const videoUrl = publicUrlData.publicUrl;
      // Prompt for caption
      let caption = '';
      await new Promise((resolve) => {
        Alert.prompt('Reel Caption', 'Add a caption for your reel:', [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
          { text: 'Post', onPress: (text) => { caption = text; resolve(null); } },
        ], 'plain-text');
      });
      if (caption === null) return;
      // Insert into reels table
      await supabase.from('reels').insert({
        user_id: user.id,
        video_url: videoUrl,
        caption,
      });
      fetchUserReels();
      Alert.alert('Success', 'Your reel has been posted!');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getProfileStats = () => {
    const baseStats = {
      posts: profilePosts.length,
      friends: user.following.length + user.followers.length,
      following: user.following.length,
      followers: user.followers.length,
    };

    if (userMusicProfile?.isArtist) {
      return {
        ...baseStats,
        tracks: playlist.length,
        genres: userMusicProfile.genres.length,
        collabs: userMusicProfile.hasOriginalMusic ? 12 : 3,
      };
    }

    return baseStats;
  };

  const handleEditProfile = () => {
    const profileData = {
      displayName: user.displayName,
      username: user.username,
      bio: user.bio,
      location: '',
      website: '',
      birthday: user.dateOfBirth?.toLocaleDateString() || '',
      gender: '',
      pronouns: '',
      avatar: user.avatar,
      coverPhoto: 'https://via.placeholder.com/600x200/667eea/FFFFFF',
      isPrivate: user.isPrivate,
      showOnlineStatus: true,
      allowTagging: true,
      showBirthday: false,
      isVerified: user.isVerified,
      socialLinks: {
        twitter: '',
        instagram: '',
        tiktok: '',
        youtube: '',
      },
      lumaCardBalance: user.lumaCardBalance ?? 2500, // Ensure this property is always present
    };

    setShowEditProfile(true);
  };

  const handleSaveProfile = (profileData: any) => {
    const updatedUser = {
      ...user,
      displayName: profileData.displayName,
      username: profileData.username,
      bio: profileData.bio,
      avatar: profileData.avatar,
      isPrivate: profileData.isPrivate,
      lumaCardBalance: user.lumaCardBalance ?? 2500, // Ensure this property is always present
    };

    updateUser(updatedUser);
    setShowEditProfile(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    await createPost({
      content: newPostContent,
      type: 'text',
      privacy: 'public',
      mood: selectedMood,
      tags: extractHashtags(newPostContent),
    });

    setNewPostContent('');
    setSelectedMood('');
    setShowCreatePost(false);
    Alert.alert('Success', 'Post created successfully!');
  };

  const handleCreateStory = async () => {
    if (!newStoryContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your story');
      return;
    }

    await createStory({
      content: newStoryContent,
      type: 'text',
      mood: selectedMood,
    });

    setNewStoryContent('');
    setSelectedMood('');
    setShowCreateStory(false);
    Alert.alert('Success', 'Story created successfully!');
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#\w+/g;
    const hashtags = text.match(hashtagRegex);
    return hashtags ? hashtags.map(tag => tag.substring(1)) : [];
  };

  const handlePostAction = (postId: string, action: 'pin' | 'unpin' | 'edit' | 'delete') => {
    switch (action) {
      case 'pin':
        pinPost(postId);
        Alert.alert('Success', 'Post pinned to top!');
        break;
      case 'unpin':
        unpinPost(postId);
        Alert.alert('Success', 'Post unpinned!');
        break;
      case 'edit':
        // Navigate to edit post screen
        Alert.alert('Edit Post', 'Edit functionality coming soon!');
        break;
      case 'delete':
        Alert.alert(
          'Delete Post',
          'Are you sure you want to delete this post?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deletePost(postId) },
          ]
        );
        break;
    }
  };

  // 4D Media Upload Functions
  const trigger4DAnimation = () => {
    // Reset all animations
    scaleAnim.setValue(1);
    rotateAnim.setValue(0);
    translateXAnim.setValue(0);
    translateYAnim.setValue(0);
    depthAnim.setValue(0);
    opacityAnim.setValue(1);

    // Complex 4D animation sequence
    Animated.sequence([
      // Initial pop-out
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(depthAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      // Rotation and translation
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(translateXAnim, {
            toValue: 50,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim, {
            toValue: -30,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateYAnim, {
            toValue: -30,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 20,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Final settle
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(depthAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const requestMediaPermissions = async () => {
    const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (mediaLibraryStatus !== 'granted' || cameraStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and media library permissions to upload photos and videos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Helper to upload a file to Supabase Storage and return the public URL
  const uploadMediaToSupabase = async (uri: string, type: 'image' | 'video') => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = type === 'image' ? '.jpg' : '.mp4';
      const fileName = `${user.id}_${Date.now()}${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const { data, error } = await supabase.storage.from('media').upload(filePath, blob, {
        contentType: type === 'image' ? 'image/jpeg' : 'video/mp4',
        upsert: true,
      });
      if (error) throw error;
      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    } catch (err) {
      Alert.alert('Upload Failed', 'Could not upload media to server.');
      return null;
    }
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      setShowMediaUpload(false); // Close modal first
      const newMedia = [];
      for (const asset of result.assets) {
        const type: 'image' | 'video' = asset.type === 'video' ? 'video' : 'image';
        const publicUrl = await uploadMediaToSupabase(asset.uri, type);
        if (publicUrl) {
          newMedia.push({
            id: Date.now().toString() + Math.random().toString(),
            uri: publicUrl,
            type,
            timestamp: new Date(),
          });
          await createPost({
            content: `New ${type} upload! ✨`,
            type,
            privacy: 'public',
            images: type === 'image' ? [publicUrl] : undefined,
            videoUrl: type === 'video' ? publicUrl : undefined,
            mood: '✨',
            tags: ['upload', '4d', 'media'],
          });
        }
      }
      setUploadedMedia(prev => [...prev, ...newMedia]);
      trigger4DAnimation();
      if (newMedia.some(m => m.type === 'image')) setActiveTab('photos');
      else if (newMedia.some(m => m.type === 'video')) setActiveTab('videos');
      refreshProfileData();
      if (newMedia.length > 0) {
        Alert.alert(
          'Success! 🎉',
          `${newMedia.length} ${newMedia.length === 1 ? 'item' : 'items'} uploaded with 4D effects!\n\nCheck your ${newMedia.some(m => m.type === 'image') ? 'Photos' : 'Videos'} tab to see them shine! ✨`,
          [
            {
              text: 'View Now',
              onPress: () => trigger4DAnimation(),
            },
          ]
        );
      }
    }
  };

  const takePhotoOrVideo = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Capture Media',
      'Choose an option:',
      [
        { text: 'Take Photo', onPress: () => launchCamera('photo') },
        { text: 'Record Video', onPress: () => launchCamera('video') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const launchCamera = async (type: 'photo' | 'video') => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: type === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      videoMaxDuration: 30,
    });

    if (!result.canceled && result.assets[0]) {
      setShowMediaUpload(false); // Close modal first
      const asset = result.assets[0];
      const mediaType: 'image' | 'video' = type === 'video' ? 'video' : 'image';
      const publicUrl = await uploadMediaToSupabase(asset.uri, mediaType);
      if (publicUrl) {
        const newMedia = {
          id: Date.now().toString(),
          uri: publicUrl,
          type: mediaType,
          timestamp: new Date(),
        };
        setUploadedMedia(prev => [...prev, newMedia]);
        trigger4DAnimation();
        await createPost({
          content: `Fresh ${type} captured! 📸`,
          type: mediaType,
          privacy: 'public',
          images: mediaType === 'image' ? [publicUrl] : undefined,
          videoUrl: mediaType === 'video' ? publicUrl : undefined,
          mood: '📸',
          tags: ['capture', '4d', 'fresh'],
        });
        if (mediaType === 'image') setActiveTab('photos');
        else if (mediaType === 'video') setActiveTab('videos');
        refreshProfileData();
        Alert.alert(
          'Amazing! 🔥',
          `${type} captured with 4D magic!\n\nCheck your ${mediaType === 'image' ? 'Photos' : 'Videos'} tab to see it in action! ✨`,
          [
            {
              text: 'View Now',
              onPress: () => trigger4DAnimation(),
            },
          ]
        );
      }
    }
  };

  const handle4DMediaPress = (mediaId: string) => {
    setSelected4DMedia(mediaId);
    trigger4DAnimation();
    
    // Add haptic feedback if available
    if (Platform.OS === 'ios') {
      // Haptics would be added here if expo-haptics is available
    }
  };

  const renderPostItem = ({ item }: { item: ProfilePost }) => {
    const stats = getPostStats(item.id);
    
    return (
      <View style={styles.postContainer}>
        {item.isPinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={12} color="#667eea" />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}
        
                 <PostCard
           post={{
             ...item,
             userId: user.id,
             // Convert ProfilePost to Post format
             reactions: item.reactions,
             comments: item.comments.map(comment => ({
               id: comment.id,
               postId: comment.postId,
               userId: comment.userId,
               content: comment.content,
               likes: Object.values(comment.reactions).flat(),
               replies: comment.replies.map(reply => ({
                 id: reply.id,
                 postId: reply.postId,
                 userId: reply.userId,
                 content: reply.content,
                 likes: Object.values(reply.reactions).flat(),
                 replies: [],
                 createdAt: reply.createdAt,
                 isEdited: reply.isEdited,
               })),
               createdAt: comment.createdAt,
               isEdited: comment.isEdited,
             })),
             contentTags: {
               isNSFW: false,
               isSensitive: false,
               ageRestriction: 13,
               categories: [],
             },
             moderation: {
               isReported: false,
               reportCount: 0,
               isHidden: false,
               moderationStatus: 'approved' as const,
               reportReasons: [],
             },
           }}
           user={{
             id: user.id,
             displayName: user.displayName,
             username: user.username,
             email: user.email,
             avatar: user.avatar,
             bio: user.bio,
             isVerified: user.isVerified,
             isPrivate: user.isPrivate,
             followers: user.followers,
             following: user.following,
             posts: [],
             createdAt: user.createdAt || new Date(),
             dateOfBirth: user.dateOfBirth,
             isAgeVerified: user.isAgeVerified || false,
             blockedUsers: user.blockedUsers || [],
             reportedUsers: user.reportedUsers || [],
             contentPreferences: user.contentPreferences || {
               allowNSFW: false,
               requireContentWarnings: true,
               blockedKeywords: [],
             },
             lumaCardBalance: user.lumaCardBalance ?? 2500, // Ensure this property is always present
           }}
         />
        
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.postActionButton}
            onPress={() => handlePostAction(item.id, item.isPinned ? 'unpin' : 'pin')}
          >
            <Ionicons name={item.isPinned ? 'pin' : 'pin-outline'} size={16} color="#666" />
            <Text style={styles.postActionText}>{item.isPinned ? 'Unpin' : 'Pin'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.postActionButton}
            onPress={() => handlePostAction(item.id, 'edit')}
          >
            <Ionicons name="pencil-outline" size={16} color="#666" />
            <Text style={styles.postActionText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.postActionButton}
            onPress={() => handlePostAction(item.id, 'delete')}
          >
            <Ionicons name="trash-outline" size={16} color="#E53E3E" />
            <Text style={[styles.postActionText, { color: '#E53E3E' }]}>Delete</Text>
          </TouchableOpacity>
          
          <View style={styles.postStats}>
            <Text style={styles.postStatsText}>
              {stats.views} views • {stats.reactions} reactions • {stats.reach} reach
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const stats = getProfileStats();

  const pinnedPosts = profilePosts.filter(post => post.isPinned);
  const regularPosts = profilePosts.filter(post => !post.isPinned);
  const sortedPosts = [...pinnedPosts, ...regularPosts];

  const photoPosts = profilePosts.filter(post => post.type === 'image' && post.images && post.images.length > 0);
  const videoPosts = profilePosts.filter(post => post.type === 'video' && post.videoUrl);

  const tabs = [
    { key: 'posts', label: 'Posts' },
    { key: 'photos', label: 'Photos' },
    { key: 'videos', label: 'Videos' },
    { key: 'reels', label: 'Reels' },
    { key: 'tagged', label: 'Tagged' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={scale(24)} color="#1c1e21" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{user.displayName}</Text>
          {user.isVerified && (
            <Ionicons name="checkmark-circle" size={scale(16)} color="#4CAF50" style={styles.headerVerified} />
          )}
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={() => Alert.alert('Share Profile', 'Sharing functionality coming soon!')}>
          <Ionicons name="share-outline" size={scale(24)} color="#1c1e21" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover Photo with Gradient */}
        <View style={styles.coverPhoto}>
          <LinearGradient
            colors={
              userMusicProfile?.isArtist
                ? ['#667eea', '#764ba2']
                : user.isVerified
                ? ['#4facfe', '#00f2fe']
                : ['#667eea', '#667eea']
            }
            style={styles.coverGradient}
          />
          
          {/* Profile Photo */}
          <View style={styles.profilePhotoContainer}>
            <Image source={{ uri: user.avatar }} style={styles.profilePhoto} />
            {user.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{user.displayName}</Text>
            {user.isVerified && (
              <Ionicons name="checkmark-circle" size={scale(20)} color="#4CAF50" style={styles.verifiedIcon} />
            )}
            {userMusicProfile?.isArtist && (
              <View style={styles.artistBadge}>
                <Ionicons name="musical-notes" size={scale(16)} color="#FF6B6B" />
                <Text style={styles.artistBadgeText}>Artist</Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.bio}>{user.bio || "This is a test account for Luma Go development"}</Text>
          
          {userMusicProfile?.isArtist && (
            <View style={styles.musicInfo}>
              <View style={styles.genresContainer}>
                {userMusicProfile.genres.slice(0, 3).map((genre, index) => (
                  <View key={`genre-${genre}-${index}`} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre}</Text>
                  </View>
                ))}
              </View>
              
              {userMusicProfile.location && (
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={16} color="#65676b" />
                  <Text style={styles.locationText}>{userMusicProfile.location}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(stats.posts)}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(stats.followers)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(stats.following)}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          {userMusicProfile?.isArtist ? (
            <React.Fragment key="artist-stats">
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{'tracks' in stats ? stats.tracks : 0}</Text>
                <Text style={styles.statLabel}>Tracks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{'collabs' in stats ? stats.collabs : 0}</Text>
                <Text style={styles.statLabel}>Collabs</Text>
              </View>
            </React.Fragment>
          ) : (
            <View key="friend-stats" style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(stats.friends)}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setShowCreatePost(true)}
          >
            <Ionicons name="add" size={scale(20)} color="#fff" />
            <Text style={styles.primaryButtonText}>New Post</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.gradientButton}
            onPress={() => setShowMediaUpload(true)}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2', '#f093fb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButtonInner}
            >
              <Ionicons name="camera" size={scale(20)} color="#fff" />
              <Text style={styles.gradientButtonText}>4D Upload</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => setShowCreateStory(true)}
          >
            <Ionicons name="add-circle-outline" size={scale(20)} color="#1c1e21" />
            <Text style={styles.secondaryButtonText}>Add Story</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil-outline" size={scale(20)} color="#1c1e21" />
            <Text style={styles.secondaryButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Gen 1 Features Section */}
        <View style={styles.gen1FeaturesSection}>
          <TouchableOpacity 
            style={styles.gen1FeaturesButton}
            onPress={() => setShowGen1Features(!showGen1Features)}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.gen1FeaturesGradient}
            >
              <Ionicons name="sparkles" size={scale(20)} color="#fff" />
              <Text style={styles.gen1FeaturesText}>🚀 Gen 1 Features</Text>
              <Ionicons 
                name={showGen1Features ? "chevron-up" : "chevron-down"} 
                size={scale(16)} 
                color="#fff" 
              />
            </LinearGradient>
          </TouchableOpacity>
          
          {showGen1Features && (
            <View style={styles.gen1FeaturesContent}>
              <View style={styles.gen1StatsGrid}>
                <View style={styles.gen1StatItem}>
                  <Ionicons name="chatbubbles" size={scale(24)} color="#667eea" />
                  <Text style={styles.gen1StatValue}>{gen1Stats.aiInteractions}</Text>
                  <Text style={styles.gen1StatLabel}>AI Interactions</Text>
                </View>
                <View style={styles.gen1StatItem}>
                  <Ionicons name="create" size={scale(24)} color="#4CAF50" />
                  <Text style={styles.gen1StatValue}>{gen1Stats.contentCreated}</Text>
                  <Text style={styles.gen1StatLabel}>Content Created</Text>
                </View>
                <View style={styles.gen1StatItem}>
                  <Ionicons name="videocam" size={scale(24)} color="#FF9800" />
                  <Text style={styles.gen1StatValue}>{gen1Stats.liveStreams}</Text>
                  <Text style={styles.gen1StatLabel}>Live Streams</Text>
                </View>
                <View style={styles.gen1StatItem}>
                  <Ionicons name="headset" size={scale(24)} color="#9C27B0" />
                  <Text style={styles.gen1StatValue}>{gen1Stats.supportTickets}</Text>
                  <Text style={styles.gen1StatLabel}>Support Tickets</Text>
                </View>
                <View style={styles.gen1StatItem}>
                  <Ionicons name="musical-notes" size={scale(24)} color="#E91E63" />
                  <Text style={styles.gen1StatValue}>{gen1Stats.musicTracks}</Text>
                  <Text style={styles.gen1StatLabel}>Music Tracks</Text>
                </View>
                <View style={styles.gen1StatItem}>
                  <Ionicons name="people" size={scale(24)} color="#00BCD4" />
                  <Text style={styles.gen1StatValue}>{gen1Stats.collaborations}</Text>
                  <Text style={styles.gen1StatLabel}>Collaborations</Text>
                </View>
              </View>
              
              <View style={styles.gen1FeaturesList}>
                <Text style={styles.gen1FeaturesTitle}>🎯 Active Gen 1 Features:</Text>
                <View style={styles.gen1FeatureItem}>
                  <Ionicons name="checkmark-circle" size={scale(16)} color="#4CAF50" />
                  <Text style={styles.gen1FeatureText}>AI-Powered Content Creation</Text>
                </View>
                <View style={styles.gen1FeatureItem}>
                  <Ionicons name="checkmark-circle" size={scale(16)} color="#4CAF50" />
                  <Text style={styles.gen1FeatureText}>Live Streaming (4K-20K Quality)</Text>
                </View>
                <View style={styles.gen1FeatureItem}>
                  <Ionicons name="checkmark-circle" size={scale(16)} color="#4CAF50" />
                  <Text style={styles.gen1FeatureText}>Customer Support System</Text>
                </View>
                <View style={styles.gen1FeatureItem}>
                  <Ionicons name="checkmark-circle" size={scale(16)} color="#4CAF50" />
                  <Text style={styles.gen1FeatureText}>Music Platform Integration</Text>
                </View>
                <View style={styles.gen1FeatureItem}>
                  <Ionicons name="checkmark-circle" size={scale(16)} color="#4CAF50" />
                  <Text style={styles.gen1FeatureText}>4D Media Upload</Text>
                </View>
                <View style={styles.gen1FeatureItem}>
                  <Ionicons name="checkmark-circle" size={scale(16)} color="#4CAF50" />
                  <Text style={styles.gen1FeatureText}>Advanced Analytics</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
              {activeTab === tab.key && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {activeTab === 'reels' && (
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', margin: 16 }} onPress={handleCreateReel}>
                <Ionicons name="add-circle" size={28} color="#1877f2" />
                <Text style={{ marginLeft: 8, color: '#1877f2', fontWeight: 'bold', fontSize: 16 }}>Create Reel</Text>
              </TouchableOpacity>
              {loadingReels ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>
              ) : userReels.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>No reels yet. Create your first reel!</Text>
              ) : (
                <FlatList
                  data={userReels}
                  renderItem={({ item }) => (
                    <View style={{ marginBottom: 24, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 }}>
                      <Video
                        source={{ uri: item.video_url }}
                        style={{ width: '100%', aspectRatio: 1 }}
                        useNativeControls
                        shouldPlay={false}
                        isLooping
                      />
                      <View style={{ padding: 12 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.caption}</Text>
                        <Text style={{ color: '#888', fontSize: 12 }}>{new Date(item.created_at).toLocaleString()}</Text>
                        {/* Like/comment buttons can go here */}
                      </View>
                    </View>
                  )}
                  keyExtractor={item => item.id}
                />
              )}
            </View>
          )}
          
          {activeTab === 'posts' && (
            <FlatList
              data={sortedPosts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No posts yet</Text>
                  <Text style={styles.emptyStateSubtext}>Share your first post to get started!</Text>
                </View>
              }
            />
          )}
          
          {activeTab === 'photos' && (
            <View style={styles.mediaGrid}>
              {(photoPosts.length > 0 || uploadedMedia.filter(m => m.type === 'image').length > 0) ? (
                <>
                  {/* Uploaded 4D Media */}
                  {uploadedMedia.filter(m => m.type === 'image').map((media) => (
                    <TouchableOpacity 
                      key={`uploaded-photo-${media.id}`} 
                      style={styles.media4DItem}
                      onPress={() => handle4DMediaPress(media.id)}
                    >
                      <Animated.View style={[
                        styles.media4DContainer,
                        {
                          transform: [
                            { scale: selected4DMedia === media.id ? scaleAnim : 1 },
                            { 
                              rotateY: selected4DMedia === media.id ? 
                                rotateAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '360deg']
                                }) : '0deg' 
                            },
                            { translateX: selected4DMedia === media.id ? translateXAnim : 0 },
                            { translateY: selected4DMedia === media.id ? translateYAnim : 0 },
                          ],
                          opacity: selected4DMedia === media.id ? opacityAnim : 1,
                        }
                      ]}>
                        <Image source={{ uri: media.uri }} style={styles.mediaImage} />
                        <LinearGradient
                          colors={['transparent', 'rgba(102, 126, 234, 0.8)']}
                          style={styles.media4DOverlay}
                        >
                          <View style={styles.media4DBadge}>
                            <Ionicons name="cube-outline" size={16} color="#fff" />
                            <Text style={styles.media4DBadgeText}>4D</Text>
                          </View>
                        </LinearGradient>
                      </Animated.View>
                    </TouchableOpacity>
                  ))}
                  
                  {/* Regular photos */}
                  {photoPosts.map((post) => (
                    <TouchableOpacity key={`photo-${post.id}`} style={styles.mediaItem}>
                    <Image source={{ uri: post.images![0] }} style={styles.mediaImage} />
                  </TouchableOpacity>
                  ))}
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="images-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No photos yet</Text>
                  <Text style={styles.emptyStateSubtext}>Upload your first 4D photo!</Text>
                </View>
              )}
            </View>
          )}
          
          {activeTab === 'videos' && (
            <View style={styles.mediaGrid}>
              {(videoPosts.length > 0 || uploadedMedia.filter(m => m.type === 'video').length > 0) ? (
                <>
                  {/* Uploaded 4D Videos */}
                  {uploadedMedia.filter(m => m.type === 'video').map((media) => (
                    <TouchableOpacity 
                      key={`uploaded-video-${media.id}`} 
                      style={styles.media4DItem}
                      onPress={() => handle4DMediaPress(media.id)}
                    >
                      <Animated.View style={[
                        styles.media4DContainer,
                        {
                          transform: [
                            { scale: selected4DMedia === media.id ? scaleAnim : 1 },
                            { 
                              rotateY: selected4DMedia === media.id ? 
                                rotateAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '360deg']
                                }) : '0deg' 
                            },
                            { translateX: selected4DMedia === media.id ? translateXAnim : 0 },
                            { translateY: selected4DMedia === media.id ? translateYAnim : 0 },
                          ],
                          opacity: selected4DMedia === media.id ? opacityAnim : 1,
                        }
                      ]}>
                    <View style={styles.videoThumbnail}>
                      <Ionicons name="play-circle" size={32} color="#fff" />
                    </View>
                        <LinearGradient
                          colors={['transparent', 'rgba(118, 75, 162, 0.8)']}
                          style={styles.media4DOverlay}
                        >
                          <View style={styles.media4DBadge}>
                            <Ionicons name="cube-outline" size={16} color="#fff" />
                            <Text style={styles.media4DBadgeText}>4D</Text>
                          </View>
                        </LinearGradient>
                      </Animated.View>
                  </TouchableOpacity>
                  ))}
                  
                  {/* Regular videos */}
                  {videoPosts.map((post) => (
                    <TouchableOpacity key={`video-${post.id}`} style={styles.mediaItem}>
                      <View style={styles.videoThumbnail}>
                        <Ionicons name="play-circle" size={32} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="videocam-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No videos yet</Text>
                  <Text style={styles.emptyStateSubtext}>Record your first 4D video!</Text>
                </View>
              )}
            </View>
          )}
          
          {activeTab === 'tagged' && (
            <View style={styles.emptyContainer}>
              <Ionicons name="person-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No tagged posts</Text>
              <Text style={styles.emptyStateSubtext}>Posts you're tagged in will appear here</Text>
            </View>
          )}
        </View>

        {/* Music Section for Artists */}
        {userMusicProfile?.isArtist && (
          <View style={styles.musicSection}>
            <Text style={styles.sectionTitle}>🎵 Music</Text>
            <View style={styles.musicGrid}>
              <View style={styles.musicCard}>
                <Ionicons name="musical-notes" size={24} color="#667eea" />
                <Text style={styles.musicCardTitle}>Latest Track</Text>
                <Text style={styles.musicCardSubtitle}>Coming Soon</Text>
              </View>
              <View style={styles.musicCard}>
                <Ionicons name="albums" size={24} color="#667eea" />
                <Text style={styles.musicCardTitle}>Albums</Text>
                <Text style={styles.musicCardSubtitle}>{userMusicProfile.hasOriginalMusic ? '2' : '0'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Gen 1 Features Section */}
        <View style={styles.gen1Section}>
          <Text style={styles.sectionTitle}>🚀 Gen 1 Features</Text>
          <View style={styles.gen1Grid}>
            <TouchableOpacity key="ai-power" style={styles.gen1Card} onPress={() => (navigation as any).navigate('LumaAI')}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.gen1CardGradient}
              >
                <Ionicons name="sparkles" size={scale(24)} color="#fff" />
                <Text style={styles.gen1CardTitle}>AI Power</Text>
                <Text style={styles.gen1CardSubtitle}>Smart insights & analytics</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity key="4d-media" style={styles.gen1Card} onPress={() => setShowMediaUpload(true)}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.gen1CardGradient}
              >
                <Ionicons name="cube" size={scale(24)} color="#fff" />
                <Text style={styles.gen1CardTitle}>4D Media</Text>
                <Text style={styles.gen1CardSubtitle}>Immersive content</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity key="strip-club" style={styles.gen1Card} onPress={() => (navigation as any).navigate('StripClubMain')}>
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.gen1CardGradient}
              >
                <Ionicons name="wine" size={scale(24)} color="#fff" />
                <Text style={styles.gen1CardTitle}>Strip Club</Text>
                <Text style={styles.gen1CardSubtitle}>18+ content</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity key="live-stream" style={styles.gen1Card} onPress={() => Alert.alert('Coming Soon', 'Live streaming features coming in Gen 2!')}>
              <LinearGradient
                colors={['#43e97b', '#38f9d7']}
                style={styles.gen1CardGradient}
              >
                <Ionicons name="radio" size={scale(24)} color="#fff" />
                <Text style={styles.gen1CardTitle}>Live Stream</Text>
                <Text style={styles.gen1CardSubtitle}>Real-time content</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Section */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>📊 Activity</Text>
          <View style={styles.activityGrid}>
            <View style={styles.activityCard}>
              <Text style={styles.activityNumber}>{profilePosts.length}</Text>
              <Text style={styles.activityLabel}>Posts</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityNumber}>{followedArtists.length}</Text>
              <Text style={styles.activityLabel}>Artists Followed</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityNumber}>{playlist.length}</Text>
              <Text style={styles.activityLabel}>Playlist</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityNumber}>
                {user.createdAt ? new Date().getFullYear() - new Date(user.createdAt).getFullYear() : 0}
              </Text>
              <Text style={styles.activityLabel}>Years on Luma</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Create Post Modal */}
      <Modal visible={showCreatePost} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreatePost(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Post</Text>
            <TouchableOpacity onPress={handleCreatePost}>
              <Text style={styles.modalPost}>Post</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              placeholder="What's on your mind?"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              maxLength={500}
            />
            
            <View style={styles.moodSelector}>
              <Text style={styles.moodLabel}>How are you feeling?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['😊', '😍', '🤔', '😎', '🥳', '💪', '🙏', '❤️'].map((mood, index) => (
                  <TouchableOpacity
                    key={`mood-${mood}-${index}`}
                    style={[styles.moodButton, selectedMood === mood && styles.selectedMood]}
                    onPress={() => setSelectedMood(mood)}
                  >
                    <Text style={styles.moodEmoji}>{mood}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Create Story Modal */}
      <Modal visible={showCreateStory} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateStory(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add to Story</Text>
            <TouchableOpacity onPress={handleCreateStory}>
              <Text style={styles.modalPost}>Share</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              placeholder="Share a moment..."
              value={newStoryContent}
              onChangeText={setNewStoryContent}
              multiline
              maxLength={200}
            />
            
            <Text style={styles.storyNote}>Stories disappear after 24 hours</Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 4D Media Upload Modal */}
      <Modal visible={showMediaUpload} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <BlurView intensity={20} style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowMediaUpload(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>4D Media Upload</Text>
              <View style={styles.modalPlaceholder} />
            </View>
            
            <View style={styles.modal4DContent}>
              <Text style={styles.modal4DTitle}>Choose Upload Method</Text>
              <Text style={styles.modal4DSubtitle}>Experience the magic of 4D media effects</Text>
              
              <View style={styles.uploadOptionsContainer}>
                <TouchableOpacity style={styles.uploadOption} onPress={pickImageFromLibrary}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.uploadOptionGradient}
                  >
                    <Ionicons name="images" size={32} color="#fff" />
                    <Text style={styles.uploadOptionTitle}>Photo Library</Text>
                    <Text style={styles.uploadOptionSubtitle}>Select from gallery</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.uploadOption} onPress={takePhotoOrVideo}>
                  <LinearGradient
                    colors={['#f093fb', '#f5576c']}
                    style={styles.uploadOptionGradient}
                  >
                    <Ionicons name="camera" size={32} color="#fff" />
                    <Text style={styles.uploadOptionTitle}>Capture Live</Text>
                    <Text style={styles.uploadOptionSubtitle}>Photo or video</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              {uploadedMedia.length > 0 && (
                <View style={styles.recentUploadsContainer}>
                  <Text style={styles.recentUploadsTitle}>Recent 4D Uploads</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {uploadedMedia.slice(-5).map((media, index) => (
                      <TouchableOpacity 
                        key={`recent-${media.id}-${index}`}
                        style={styles.recentUploadItem}
                        onPress={() => handle4DMediaPress(media.id)}
                      >
                        {media.type === 'image' ? (
                          <Image source={{ uri: media.uri }} style={styles.recentUploadImage} />
                        ) : (
                          <View style={styles.recentUploadVideo}>
                            <Ionicons name="play-circle" size={24} color="#fff" />
                          </View>
                        )}
                        <View style={styles.recentUpload4DBadge}>
                          <Text style={styles.recentUpload4DText}>4D</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </BlurView>
        </SafeAreaView>
      </Modal>

      {/* Profile Settings Modal */}
      {showEditProfile && (
        <ProfileSettingsModal
          visible={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          onSave={handleSaveProfile}
          currentProfile={{
            displayName: user.displayName,
            username: user.username,
            bio: user.bio,
            location: '',
            website: '',
            birthday: user.dateOfBirth?.toLocaleDateString() || '',
            gender: '',
            pronouns: '',
            avatar: user.avatar,
            coverPhoto: 'https://via.placeholder.com/600x200/667eea/FFFFFF',
            isPrivate: user.isPrivate,
            showOnlineStatus: true,
            allowTagging: true,
            showBirthday: false,
            isVerified: user.isVerified,
            socialLinks: {
              twitter: '',
              instagram: '',
              tiktok: '',
              youtube: '',
            },
            lumaCardBalance: user.lumaCardBalance ?? 2500, // Ensure this property is always present
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: responsiveStyle({
    flex: 1,
    backgroundColor: '#f8f9fa',
  }),
  loadingContainer: responsiveStyle({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  loadingText: responsiveStyle({
    fontSize: 18,
    color: '#65676b',
  }),
  header: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  headerTitle: responsiveStyle({
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1e21',
  }),
  headerCenter: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  }),
  headerVerified: responsiveStyle({
    marginLeft: 8,
  }),
  headerActions: responsiveStyle({
    flexDirection: 'row',
    gap: 12,
  }),
  headerButton: responsiveStyle({
    padding: 8,
  }),
  backButton: responsiveStyle({
    padding: 8,
  }),
  shareButton: responsiveStyle({
    padding: 8,
  }),
  content: {
    flex: 1,
  },
  coverPhoto: responsiveStyle({
    width: '100%',
    height: 200,
  }),
  coverGradient: {
    width: '100%',
    height: '100%',
  },
  profilePhotoContainer: {
    position: 'absolute',
    bottom: -60,
    left: '50%',
    marginLeft: -60,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profilePhoto: responsiveStyle({
    width: 100,
    height: 100,
    borderRadius: 50,
  }),
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  profileInfo: responsiveStyle({
    padding: 16,
    backgroundColor: '#fff',
  }),
  profileHeader: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  }),
  avatarContainer: responsiveStyle({
    position: 'relative',
    marginRight: 16,
  }),
  avatar: responsiveStyle({
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  }),
  editAvatarButton: responsiveStyle({
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1877f2',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  profileDetails: responsiveStyle({
    flex: 1,
  }),
  displayName: responsiveStyle({
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 4,
  }),
  username: responsiveStyle({
    fontSize: 16,
    color: '#65676b',
    marginBottom: 8,
  }),
  bio: responsiveStyle({
    fontSize: 16,
    color: '#1c1e21',
    lineHeight: 22,
    marginBottom: 12,
  }),
  musicInfo: {
    alignItems: 'center',
    width: '100%',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
  },
  genreTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  genreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976D2',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#65676b',
    marginLeft: 4,
  },
  statsContainer: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  }),
  statItem: responsiveStyle({
    alignItems: 'center',
  }),
  statNumber: responsiveStyle({
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1e21',
  }),
  statLabel: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
    marginTop: 4,
  }),
  actionButtons: responsiveStyle({
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  }),
  primaryButton: responsiveStyle({
    flex: 1,
    backgroundColor: '#1877f2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  }),
  secondaryButton: responsiveStyle({
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  }),
  buttonText: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
  }),
  primaryButtonText: responsiveStyle({
    color: '#fff',
  }),
  secondaryButtonText: responsiveStyle({
    color: '#1c1e21',
  }),
  tabsContainer: responsiveStyle({
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  tab: responsiveStyle({
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  }),
  activeTab: responsiveStyle({
    borderBottomWidth: 2,
    borderBottomColor: '#1877f2',
  }),
  tabText: responsiveStyle({
    fontSize: 16,
    color: '#65676b',
  }),
  activeTabText: responsiveStyle({
    color: '#1877f2',
    fontWeight: '600',
  }),
  activeTabIndicator: responsiveStyle({
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 3,
    backgroundColor: '#1877f2',
    borderRadius: 2,
  }),
  contentContainer: responsiveStyle({
    flex: 1,
  }),
  emptyContainer: responsiveStyle({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  }),
  emptyText: responsiveStyle({
    fontSize: 18,
    color: '#65676b',
    textAlign: 'center',
    marginTop: 16,
  }),
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#65676b',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#65676b',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    width: (width - 24) / 2,
    height: (width - 24) / 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1c1e21',
  },
  musicGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  musicCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  musicCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1c1e21',
  },
  musicCardSubtitle: {
    fontSize: 14,
    color: '#65676b',
  },
  activitySection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: (width - 80) / 2,
  },
  activityNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 14,
    color: '#65676b',
  },
  gen1Section: responsiveStyle({
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  }),
  gen1Grid: responsiveStyle({
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  }),
  gen1Card: responsiveStyle({
    width: (width - 80) / 2,
    borderRadius: 12,
    overflow: 'hidden',
  }),
  gen1CardGradient: responsiveStyle({
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  }),
  gen1CardTitle: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  }),
  gen1CardSubtitle: responsiveStyle({
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'center',
  }),
  modalContainer: responsiveStyle({
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  modalContent: responsiveStyle({
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  }),
  modalHeader: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  }),
  modalTitle: responsiveStyle({
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21',
  }),
  modalInput: responsiveStyle({
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  }),
  modalButton: responsiveStyle({
    backgroundColor: '#1877f2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  }),
  modalButtonText: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }),
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  pinnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#667eea',
    padding: 4,
    borderRadius: 8,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  postActionButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  postActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  postStats: {
    flex: 1,
  },
  postStatsText: {
    fontSize: 14,
    color: '#65676b',
  },
  // 4D Media Upload Styles
  gradientButton: responsiveStyle({
    borderRadius: 8,
    overflow: 'hidden',
    flex: 1,
  }),
  gradientButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  gradientButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  media4DItem: {
    width: (width - 24) / 2,
    height: (width - 24) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  media4DContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  media4DOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    padding: 8,
  },
  media4DBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  media4DBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalBlur: {
    flex: 1,
  },
  modal4DContent: {
    flex: 1,
    padding: 20,
  },
  modal4DTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1c1e21',
  },
  modal4DSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#65676b',
    marginBottom: 32,
  },
  uploadOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  uploadOption: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  uploadOptionGradient: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  uploadOptionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadOptionSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  recentUploadsContainer: {
    marginTop: 16,
  },
  recentUploadsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1c1e21',
  },
  recentUploadItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  recentUploadImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recentUploadVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentUpload4DBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recentUpload4DText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  modalPlaceholder: {
    width: 60,
  },
  nameContainer: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  }),
  name: responsiveStyle({
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  }),
  artistBadge: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  }),
  // Gen 1 Features Styles
  gen1FeaturesSection: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  gen1FeaturesButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gen1FeaturesGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  gen1FeaturesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  gen1FeaturesContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gen1StatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gen1StatItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  gen1StatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 4,
  },
  gen1StatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  gen1FeaturesList: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  gen1FeaturesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  gen1FeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gen1FeatureText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 8,
  },
  artistBadgeText: responsiveStyle({
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 4,
  }),
  verifiedIcon: responsiveStyle({
    marginLeft: 8,
  }),
  modalCancel: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  }),
  modalPost: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }),
  moodSelector: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  }),
  moodLabel: responsiveStyle({
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  }),
  moodButton: responsiveStyle({
    padding: 8,
    borderRadius: 8,
  }),
  selectedMood: responsiveStyle({
    backgroundColor: '#667eea',
  }),
  moodEmoji: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
  }),
  storyNote: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
    marginTop: 12,
  }),
}); 