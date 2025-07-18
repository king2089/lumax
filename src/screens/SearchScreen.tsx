import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Post } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { scale, responsiveStyle } from '../utils/responsive';

const { width } = Dimensions.get('window');

export const SearchScreen: React.FC = () => {
  const { posts } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'top' | 'users' | 'tags' | 'posts' | 'ai'>('top');

  const trendingTopics = [
    { id: '1', name: '#LumaGo', posts: 1234, isGen1: true, gen1Features: ['AI Enhanced', 'Smart Trends'] },
    { id: '2', name: '#NextGen', posts: 856, isGen1: true, gen1Features: ['AI Powered', 'Predictive'] },
    { id: '3', name: '#TechNews', posts: 654, isGen1: false },
    { id: '4', name: '#Innovation', posts: 432, isGen1: true, gen1Features: ['AI Curated', 'Smart Filter'] },
    { id: '5', name: '#MobileApp', posts: 321, isGen1: false },
    { id: '6', name: '#LiveStream', posts: 567, isGen1: true, gen1Features: ['4K Quality', 'Live Chat'] },
    { id: '7', name: '#CustomerSupport', posts: 234, isGen1: true, gen1Features: ['AI Assistant', '24/7 Help'] },
  ];

  const suggestedUsers = [
    { 
      id: '1', 
      username: 'tech_innovator', 
      displayName: 'Tech Innovator', 
      avatar: 'https://via.placeholder.com/50x50',
      isGen1: true,
      gen1Features: ['AI Expert', 'Verified'],
      followers: 1234,
      isLive: false
    },
    { 
      id: '2', 
      username: 'design_master', 
      displayName: 'Design Master', 
      avatar: 'https://via.placeholder.com/50x50',
      isGen1: false,
      followers: 856,
      isLive: true
    },
    { 
      id: '3', 
      username: 'code_wizard', 
      displayName: 'Code Wizard', 
      avatar: 'https://via.placeholder.com/50x50',
      isGen1: true,
      gen1Features: ['AI Developer', 'Premium'],
      followers: 2341,
      isLive: false
    },
    { 
      id: '4', 
      username: 'luma_ai_assistant', 
      displayName: 'Luma AI Assistant', 
      avatar: 'https://via.placeholder.com/50x50',
      isGen1: true,
      gen1Features: ['AI Assistant', 'Official'],
      followers: 5678,
      isLive: false
    },
  ];

  const aiSearchSuggestions = [
    { id: '1', query: 'How to use Luma AI features', type: 'ai_help' },
    { id: '2', query: 'Live streaming setup guide', type: 'tutorial' },
    { id: '3', query: 'Customer support contact', type: 'support' },
    { id: '4', query: 'Gen 1 features explained', type: 'feature' },
    { id: '5', query: 'NSFW content settings', type: 'settings' },
  ];

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderTrendingTopic = ({ item }: { item: any }) => (
    <View style={styles.cardSection}>
      <TouchableOpacity style={styles.trendingItem}>
        <View style={styles.trendingContent}>
          <View style={styles.trendingHeader}>
            <Text style={styles.trendingName}>{item.name}</Text>
            {item.isGen1 && (
              <View style={styles.gen1Badge}>
                <Ionicons name="sparkles" size={12} color="#FFD700" />
                <Text style={styles.gen1Text}>Gen 1</Text>
              </View>
            )}
          </View>
          <Text style={styles.trendingPosts}>{item.posts} posts</Text>
          {item.isGen1 && item.gen1Features && (
            <View style={styles.featuresContainer}>
              {item.gen1Features.map((feature: string, index: number) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <Ionicons name="trending-up" size={20} color="#667eea" />
      </TouchableOpacity>
    </View>
  );

  const renderSuggestedUser = ({ item }: { item: any }) => (
    <View style={styles.cardSection}>
      <TouchableOpacity style={styles.userItem}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatarContainer}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>
                {item.displayName.charAt(0)}
              </Text>
            </View>
            {item.isLive && (
              <View style={styles.liveIndicator}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userDisplayName}>{item.displayName}</Text>
              {item.isGen1 && (
                <View style={styles.gen1UserBadge}>
                  <Ionicons name="sparkles" size={10} color="#FFD700" />
                </View>
              )}
            </View>
            <Text style={styles.userUsername}>@{item.username}</Text>
            <Text style={styles.userFollowers}>{item.followers} followers</Text>
            {item.isGen1 && item.gen1Features && (
              <View style={styles.userFeaturesContainer}>
                {item.gen1Features.map((feature: string, index: number) => (
                  <View key={index} style={styles.userFeatureTag}>
                    <Text style={styles.userFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.cardSection}>
      <TouchableOpacity style={styles.postItem}>
        <View style={styles.postHeader}>
          <View style={styles.postUserInfo}>
            <View style={styles.postUserAvatar}>
              <Text style={styles.postUserInitial}>U</Text>
            </View>
            <Text style={styles.postUsername}>User {item.userId}</Text>
          </View>
          <Text style={styles.postTime}>2h ago</Text>
        </View>
        <Text style={styles.postContent} numberOfLines={3}>
          {item.content}
        </Text>
        {item.images.length > 0 && (
          <View style={styles.postImageContainer}>
            <View style={styles.postImage} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAISearchSuggestion = ({ item }: { item: any }) => (
    <View style={styles.cardSection}>
      <TouchableOpacity style={styles.aiSuggestionItem}>
        <View style={styles.aiSuggestionIcon}>
          <Ionicons name="sparkles" size={20} color="#FFD700" />
        </View>
        <View style={styles.aiSuggestionContent}>
          <Text style={styles.aiSuggestionQuery}>{item.query}</Text>
          <Text style={styles.aiSuggestionType}>{item.type.replace('_', ' ')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#65676b" />
      </TouchableOpacity>
    </View>
  );

  const renderGen1Stats = () => (
    <View style={styles.cardSection}>
      <View style={styles.gen1StatsContainer}>
        <Text style={styles.gen1StatsTitle}>Gen 1 Search Analytics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="sparkles" size={24} color="#FFD700" />
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Gen 1 Topics</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#3498db" />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Gen 1 Users</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#e74c3c" />
            <Text style={styles.statNumber}>2.1K</Text>
            <Text style={styles.statLabel}>Total Posts</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="search" size={24} color="#9b59b6" />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>AI Suggestions</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'top':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderGen1Stats()}
            <View style={styles.cardSection}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trending Topics</Text>
                <FlatList
                  data={trendingTopics}
                  renderItem={renderTrendingTopic}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            </View>
            <View style={styles.cardSection}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Suggested Users</Text>
                <FlatList
                  data={suggestedUsers}
                  renderItem={renderSuggestedUser}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            </View>
          </ScrollView>
        );
      case 'users':
        return (
          <FlatList
            data={suggestedUsers}
            renderItem={renderSuggestedUser}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'tags':
        return (
          <FlatList
            data={trendingTopics}
            renderItem={renderTrendingTopic}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'posts':
        return (
          <FlatList
            data={filteredPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'ai':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.cardSection}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={24} color="#FFD700" />
                <Text style={styles.aiHeaderTitle}>AI-Powered Search</Text>
              </View>
              <Text style={styles.aiDescription}>
                Get intelligent search suggestions and AI-enhanced results
              </Text>
            </View>
            <View style={styles.cardSection}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>AI Search Suggestions</Text>
                <FlatList
                  data={aiSearchSuggestions}
                  renderItem={renderAISearchSuggestion}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.cardSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users, tags, or posts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.cardSection}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'top' && styles.activeTab]}
            onPress={() => setActiveTab('top')}
          >
            <Text style={[styles.tabText, activeTab === 'top' && styles.activeTabText]}>
              Top
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
              Users
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tags' && styles.activeTab]}
            onPress={() => setActiveTab('tags')}
          >
            <Text style={[styles.tabText, activeTab === 'tags' && styles.activeTabText]}>
              Tags
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ai' && styles.activeTab]}
            onPress={() => setActiveTab('ai')}
          >
            <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>
              AI
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: responsiveStyle({
    flex: 1,
    backgroundColor: '#f8f9fa',
  }),
  cardSection: responsiveStyle({
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  }),
  header: responsiveStyle({
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
  gen1StatsContainer: responsiveStyle({
    padding: 20,
  }),
  gen1StatsTitle: responsiveStyle({
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 16,
    textAlign: 'center',
  }),
  statsGrid: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-between',
  }),
  statCard: responsiveStyle({
    alignItems: 'center',
    flex: 1,
  }),
  statNumber: responsiveStyle({
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1e21',
    marginTop: 4,
  }),
  statLabel: responsiveStyle({
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
    textAlign: 'center',
  }),
  searchContainer: responsiveStyle({
    padding: 16,
  }),
  searchBar: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 12,
  }),
  searchIcon: responsiveStyle({
    marginRight: 8,
  }),
  searchInput: responsiveStyle({
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1c1e21',
  }),
  tabsContainer: responsiveStyle({
    flexDirection: 'row',
    padding: 16,
  }),
  tab: responsiveStyle({
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  }),
  activeTab: responsiveStyle({
    backgroundColor: '#1877f2',
  }),
  tabText: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
    fontWeight: '500',
  }),
  activeTabText: responsiveStyle({
    color: '#fff',
    fontWeight: '600',
  }),
  content: {
    flex: 1,
  },
  section: responsiveStyle({
    padding: 16,
  }),
  sectionTitle: responsiveStyle({
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 12,
  }),
  trendingItem: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  }),
  trendingContent: responsiveStyle({
    flex: 1,
  }),
  trendingHeader: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  }),
  trendingName: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  }),
  gen1Badge: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  }),
  gen1Text: responsiveStyle({
    fontSize: 10,
    fontWeight: '600',
    color: '#DAA520',
    marginLeft: 2,
  }),
  featuresContainer: responsiveStyle({
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  }),
  featureTag: responsiveStyle({
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
    marginBottom: 2,
  }),
  featureText: responsiveStyle({
    fontSize: 10,
    color: '#1877f2',
    fontWeight: '500',
  }),
  trendingPosts: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
    marginTop: 2,
  }),
  userItem: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  }),
  userInfo: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  }),
  userAvatarContainer: responsiveStyle({
    position: 'relative',
    marginRight: 12,
  }),
  userAvatar: responsiveStyle({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  liveIndicator: responsiveStyle({
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  }),
  liveText: responsiveStyle({
    fontSize: 8,
    color: '#fff',
    fontWeight: '600',
  }),
  userInitial: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }),
  userDetails: responsiveStyle({
    flex: 1,
  }),
  userNameContainer: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  userDisplayName: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  }),
  gen1UserBadge: responsiveStyle({
    marginLeft: 4,
  }),
  userUsername: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
  }),
  userFollowers: responsiveStyle({
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
  }),
  userFeaturesContainer: responsiveStyle({
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  }),
  userFeatureTag: responsiveStyle({
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  }),
  userFeatureText: responsiveStyle({
    fontSize: 9,
    color: '#1877f2',
    fontWeight: '500',
  }),
  followButton: responsiveStyle({
    backgroundColor: '#1877f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  }),
  followButtonText: responsiveStyle({
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }),
  postItem: responsiveStyle({
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  postHeader: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  }),
  postUserInfo: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  postUserAvatar: responsiveStyle({
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  }),
  postUserInitial: responsiveStyle({
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }),
  postUsername: responsiveStyle({
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
  }),
  postTime: responsiveStyle({
    fontSize: 12,
    color: '#65676b',
  }),
  postContent: responsiveStyle({
    fontSize: 16,
    color: '#1c1e21',
    lineHeight: 22,
    marginBottom: 8,
  }),
  postImageContainer: responsiveStyle({
    marginTop: 8,
  }),
  postImage: responsiveStyle({
    width: '100%',
    height: 200,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
  }),
  aiHeader: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  }),
  aiHeaderTitle: responsiveStyle({
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1e21',
    marginLeft: 8,
  }),
  aiDescription: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
    padding: 16,
    paddingTop: 0,
  }),
  aiSuggestionItem: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  }),
  aiSuggestionIcon: responsiveStyle({
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  }),
  aiSuggestionContent: responsiveStyle({
    flex: 1,
  }),
  aiSuggestionQuery: responsiveStyle({
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1e21',
  }),
  aiSuggestionType: responsiveStyle({
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
    textTransform: 'capitalize',
  }),
}); 