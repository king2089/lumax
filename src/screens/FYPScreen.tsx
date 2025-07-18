import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, responsiveStyle } from '../utils/responsive';

const DUMMY_FYP_POSTS = [
  {
    id: '1',
    user: 'Trending Creator',
    avatar: 'https://via.placeholder.com/50/ff6b6b/FFFFFF?text=TC',
    content: 'Amazing sunset at the beach today! 🌅 #sunset #beach #nature',
    image: 'https://via.placeholder.com/400x300/ff6b6b/FFFFFF?text=Sunset',
    likes: 1247,
    comments: 89,
    shares: 23,
    time: '2h ago',
    isTrending: true,
  },
  {
    id: '2',
    user: 'Tech Enthusiast',
    avatar: 'https://via.placeholder.com/50/4ecdc4/FFFFFF?text=TE',
    content: 'Just discovered this amazing new app! The future of social media is here 🚀 #tech #innovation',
    image: 'https://via.placeholder.com/400x300/4ecdc4/FFFFFF?text=Tech',
    likes: 892,
    comments: 156,
    shares: 67,
    time: '4h ago',
    isTrending: true,
  },
  {
    id: '3',
    user: 'Food Blogger',
    avatar: 'https://via.placeholder.com/50/45b7d1/FFFFFF?text=FB',
    content: 'Homemade pasta night! 🍝 This recipe is absolutely divine #food #cooking #pasta',
    image: 'https://via.placeholder.com/400x300/45b7d1/FFFFFF?text=Food',
    likes: 2156,
    comments: 234,
    shares: 89,
    time: '6h ago',
    isTrending: false,
  },
];

export const FYPScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState(DUMMY_FYP_POSTS);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
        {item.isTrending && (
          <View style={styles.trendingBadge}>
            <Ionicons name="trending-up" size={16} color="#fff" />
            <Text style={styles.trendingText}>Trending</Text>
          </View>
        )}
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}

      <View style={styles.postStats}>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={16} color="#ff6b6b" />
          <Text style={styles.statText}>{item.likes.toLocaleString()}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble" size={16} color="#4ecdc4" />
          <Text style={styles.statText}>{item.comments}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="share" size={16} color="#45b7d1" />
          <Text style={styles.statText}>{item.shares}</Text>
        </View>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="#666" />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>For You</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.trendingSection}>
            <Text style={styles.trendingTitle}>🔥 Trending Now</Text>
            <Text style={styles.trendingSubtitle}>Discover what's popular</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: responsiveStyle({
    flex: 1,
    backgroundColor: '#f8f9fa',
  }),
  header: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  headerTitle: responsiveStyle({
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1e21',
  }),
  filterButton: responsiveStyle({
    padding: 8,
  }),
  trendingSection: responsiveStyle({
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  trendingTitle: responsiveStyle({
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 4,
  }),
  trendingSubtitle: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
  }),
  postCard: responsiveStyle({
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 16,
  }),
  postHeader: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  }),
  userAvatar: responsiveStyle({
    width: 40,
    height: 40,
    borderRadius: 20,
  }),
  userInfo: responsiveStyle({
    flex: 1,
    marginLeft: 12,
  }),
  userName: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  }),
  postTime: responsiveStyle({
    fontSize: 12,
    color: '#65676b',
  }),
  trendingBadge: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  }),
  trendingText: responsiveStyle({
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  }),
  moreButton: responsiveStyle({
    padding: 4,
  }),
  postContent: responsiveStyle({
    fontSize: 16,
    color: '#1c1e21',
    lineHeight: 24,
    marginBottom: 12,
  }),
  postImage: responsiveStyle({
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  }),
  postStats: responsiveStyle({
    flexDirection: 'row',
    marginBottom: 12,
  }),
  statItem: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  }),
  statText: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
    marginLeft: 4,
  }),
  postActions: responsiveStyle({
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
    paddingTop: 12,
  }),
  actionButton: responsiveStyle({
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  }),
  actionText: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
    marginLeft: 4,
  }),
}); 