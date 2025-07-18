import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity, Image, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { Video } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { scale, responsiveStyle } from '../utils/responsive';

export const ReelsScreen: React.FC = () => {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedReel, setSelectedReel] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchReels();
    // Subscribe to real-time updates
    const reelsSubscription = supabase
      .channel('reels_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reels' }, () => {
        fetchReels();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reel_likes' }, () => {
        fetchReels();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reel_comments' }, () => {
        fetchReels();
        if (selectedReel) {
          fetchComments(selectedReel.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(reelsSubscription);
    };
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reels')
      .select(`
        *,
        user: user_id (id, displayName, avatar, isVerified),
        reel_likes (id, user_id),
        reel_comments (id, user_id, content, created_at, user: user_id (displayName, avatar))
      `)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      // Process the data to calculate like counts and check if current user liked
      const processedReels = data.map(reel => ({
        ...reel,
        likeCount: reel.reel_likes?.length || 0,
        commentCount: reel.reel_comments?.length || 0,
        isLiked: reel.reel_likes?.some((like: any) => like.user_id === user?.id) || false,
      }));
      setReels(processedReels);
    }
    setLoading(false);
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
      fetchReels();
      Alert.alert('Success', 'Your reel has been posted!');
    }
  };

  const handleLikeReel = async (reelId: string) => {
    const reel = reels.find(r => r.id === reelId);
    if (!reel) return;

    if (reel.isLiked) {
      // Unlike
      await supabase
        .from('reel_likes')
        .delete()
        .eq('reel_id', reelId)
        .eq('user_id', user.id);
    } else {
      // Like
      await supabase
        .from('reel_likes')
        .insert({
          reel_id: reelId,
          user_id: user.id,
        });
    }
  };

  const handleCommentReel = async (reelId: string) => {
    setSelectedReel(reels.find(r => r.id === reelId));
    await fetchComments(reelId);
    setCommentModalVisible(true);
  };

  const fetchComments = async (reelId: string) => {
    const { data, error } = await supabase
      .from('reel_comments')
      .select(`
        *,
        user: user_id (id, displayName, avatar)
      `)
      .eq('reel_id', reelId)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setComments(data);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !selectedReel) return;

    await supabase
      .from('reel_comments')
      .insert({
        reel_id: selectedReel.id,
        user_id: user.id,
        content: newComment.trim(),
      });

    setNewComment('');
    await fetchComments(selectedReel.id);
    fetchReels(); // Refresh reels to update comment count
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerText}>Gen 1 Reels</Text>
          <View style={styles.gen1Badge}>
            <Ionicons name="sparkles" size={scale(12)} color="#fff" />
            <Text style={styles.gen1BadgeText}>AI</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={handleCreateReel}>
          <Ionicons name="add-circle" size={scale(28)} color="#1877f2" />
          <Text style={styles.createReelText}>Create Reel</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>
      ) : (
        <FlatList
          data={reels}
          renderItem={({ item }) => (
            <View style={styles.videoContainer}>
              <View style={styles.videoHeader}>
                <Image source={{ uri: item.user?.avatar || 'https://via.placeholder.com/50' }} style={styles.avatar} />
                <View style={styles.videoHeaderInfo}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.userName}>{item.user?.displayName || 'User'}</Text>
                    {item.user?.isVerified && (
                      <Ionicons name="checkmark-circle" size={16} color="#1877f2" />
                    )}
                  </View>
                  <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleString()}</Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <Ionicons name="ellipsis-horizontal" size={24} color="#65676b" />
                </TouchableOpacity>
              </View>
              <Text style={styles.description}>{item.caption}</Text>
              <Video
                source={{ uri: item.video_url }}
                style={styles.videoPlayer}
                useNativeControls
                shouldPlay={false}
                isLooping
                // For 4K/10K, expo-av will use device capabilities
              />
              
              {/* Interaction Counts */}
              <View style={styles.interactionCounts}>
                <View style={styles.reactionCount}>
                  <View style={styles.reactionIcons}>
                    <Text style={styles.reactionEmoji}>❤️</Text>
                  </View>
                  <Text style={styles.countText}>{item.likeCount}</Text>
                </View>
                <View style={styles.commentShareCount}>
                  <TouchableOpacity onPress={() => handleCommentReel(item.id)}>
                    <Text style={styles.countText}>{item.commentCount} comments</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Interaction Buttons */}
              <View style={styles.interactionButtons}>
                <TouchableOpacity 
                  style={styles.interactionButton} 
                  onPress={() => handleLikeReel(item.id)}
                >
                  <Ionicons 
                    name={item.isLiked ? "heart" : "heart-outline"} 
                    size={24} 
                    color={item.isLiked ? "#e31b23" : "#65676b"} 
                  />
                  <Text style={[styles.interactionText, item.isLiked && { color: "#e31b23" }]}>
                    {item.isLiked ? "Liked" : "Like"}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.interactionButton} 
                  onPress={() => handleCommentReel(item.id)}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#65676b" />
                  <Text style={styles.interactionText}>Comment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.interactionButton}>
                  <Ionicons name="share-outline" size={24} color="#65676b" />
                  <Text style={styles.interactionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={item => item.id}
          snapToInterval={Dimensions.get('window').height}
          snapToAlignment="start"
          decelerationRate="fast"
        />
      )}

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
              <Ionicons name="close" size={24} color="#65676b" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Comments</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.commentsList}>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image 
                  source={{ uri: comment.user?.avatar || 'https://via.placeholder.com/40' }} 
                  style={styles.commentAvatar} 
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.user?.displayName || 'User'}</Text>
                    <Text style={styles.commentTime}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]} 
              onPress={handleSubmitComment}
              disabled={!newComment.trim()}
            >
              <Ionicons name="send" size={20} color={newComment.trim() ? "#1877f2" : "#ccc"} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
  headerText: responsiveStyle({
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  }),
  headerLeft: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  }),
  gen1Badge: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  }),
  gen1BadgeText: responsiveStyle({
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  }),
  createReelText: responsiveStyle({
    marginLeft: 6,
    color: '#1877f2',
    fontWeight: 'bold',
    fontSize: 16,
  }),
  headerRight: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  videoContainer: {
    minHeight: Dimensions.get('window').height - 49,
    backgroundColor: '#fff',
    borderBottomWidth: 10,
    borderBottomColor: '#f0f2f5',
  },
  videoHeader: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  videoHeaderInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 13,
    color: '#65676b',
  },
  moreButton: {
    padding: 4,
  },
  description: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 15,
  },
  videoPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactions: {
    padding: 12,
  },
  interactionCounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  reactionCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionIcons: {
    flexDirection: 'row',
    marginRight: 4,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionEmojiOverlap: {
    marginLeft: -6,
  },
  commentShareCount: {
    flexDirection: 'row',
    gap: 8,
  },
  countText: {
    fontSize: 13,
    color: '#65676b',
  },
  interactionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  interactionText: {
    fontSize: 13,
    color: '#65676b',
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 1, // Assuming a square aspect ratio for the video player
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#65676b',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 