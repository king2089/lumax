import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { scale, responsiveStyle } from '../utils/responsive';

// Dummy data for friends list
const DUMMY_FRIENDS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    mutualFriends: 25,
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    isOnline: true,
    gen1Features: ['AI Chat', 'Live Streaming', 'Music Creator'],
    lastActive: '2 minutes ago',
    status: '🎬 Live streaming now',
  },
  {
    id: '2',
    name: 'Michael Chen',
    mutualFriends: 15,
    avatar: 'https://i.pravatar.cc/150?u=michael',
    isOnline: false,
    gen1Features: ['AI Assistant', 'Customer Support'],
    lastActive: '1 hour ago',
    status: '🎧 Working on new music',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    mutualFriends: 32,
    avatar: 'https://i.pravatar.cc/150?u=emma',
    isOnline: true,
    gen1Features: ['Live Streaming', '4D Content', 'AI Creator'],
    lastActive: '5 minutes ago',
    status: '✨ Creating AI content',
  },
  {
    id: '4',
    name: 'David Rodriguez',
    mutualFriends: 18,
    avatar: 'https://i.pravatar.cc/150?u=david',
    isOnline: true,
    gen1Features: ['Music Platform', 'Live Sessions'],
    lastActive: '1 minute ago',
    status: '🎵 Live music session',
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    mutualFriends: 42,
    avatar: 'https://i.pravatar.cc/150?u=lisa',
    isOnline: false,
    gen1Features: ['AI Support', 'Content Creation'],
    lastActive: '3 hours ago',
    status: '🤖 AI assistant active',
  },
];

export const FriendsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'suggestions' | 'gen1'>('all');
  const [showGen1Stats, setShowGen1Stats] = useState(false);

  const renderFriendItem = ({ item }: any) => (
    <TouchableOpacity style={styles.friendItem}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
        {item.gen1Features && item.gen1Features.length > 0 && (
          <View style={styles.gen1Badge}>
            <Text style={styles.gen1BadgeText}>GEN 1</Text>
          </View>
        )}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.mutualFriends}>{item.mutualFriends} mutual friends</Text>
        {item.status && (
          <Text style={styles.friendStatus}>{item.status}</Text>
        )}
        {item.gen1Features && item.gen1Features.length > 0 && (
          <View style={styles.gen1FeaturesContainer}>
            {item.gen1Features.slice(0, 2).map((feature, index) => (
              <View key={index} style={styles.gen1FeatureTag}>
                <Text style={styles.gen1FeatureText}>{feature}</Text>
              </View>
            ))}
            {item.gen1Features.length > 2 && (
              <Text style={styles.moreFeaturesText}>+{item.gen1Features.length - 2} more</Text>
            )}
          </View>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#1877f2" />
        </TouchableOpacity>
        {item.gen1Features && item.gen1Features.includes('Live Streaming') && (
          <TouchableOpacity style={styles.liveButton}>
            <Ionicons name="videocam" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="person-add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#65676b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#65676b"
          />
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
          onPress={() => setActiveTab('suggestions')}
        >
          <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>Suggestions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'gen1' && styles.activeTab]}
          onPress={() => setActiveTab('gen1')}
        >
          <Text style={[styles.tabText, activeTab === 'gen1' && styles.activeTabText]}>🚀 Gen 1</Text>
        </TouchableOpacity>
      </View>

      {/* Gen 1 Stats Section */}
      {activeTab === 'gen1' && (
        <View style={styles.gen1StatsSection}>
          <TouchableOpacity 
            style={styles.gen1StatsButton}
            onPress={() => setShowGen1Stats(!showGen1Stats)}
          >
            <Text style={styles.gen1StatsButtonText}>📊 Gen 1 Network Stats</Text>
            <Ionicons 
              name={showGen1Stats ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#667eea" 
            />
          </TouchableOpacity>
          
          {showGen1Stats && (
            <View style={styles.gen1StatsContent}>
              <View style={styles.gen1StatsGrid}>
                <View style={styles.gen1StatItem}>
                  <Text style={styles.gen1StatValue}>5</Text>
                  <Text style={styles.gen1StatLabel}>Gen 1 Friends</Text>
                </View>
                <View style={styles.gen1StatItem}>
                  <Text style={styles.gen1StatValue}>12</Text>
                  <Text style={styles.gen1StatLabel}>Active Features</Text>
                </View>
                <View style={styles.gen1StatItem}>
                  <Text style={styles.gen1StatValue}>3</Text>
                  <Text style={styles.gen1StatLabel}>Live Now</Text>
                </View>
                <View style={styles.gen1StatItem}>
                  <Text style={styles.gen1StatValue}>89%</Text>
                  <Text style={styles.gen1StatLabel}>Engagement</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={DUMMY_FRIENDS}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.friendsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: responsiveStyle({
    flex: 1,
    backgroundColor: '#fff',
  }),
  header: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  headerTitle: responsiveStyle({
    fontSize: 20,
    fontWeight: '600',
  }),
  backButton: responsiveStyle({
    padding: 8,
  }),
  addButton: responsiveStyle({
    padding: 8,
  }),
  searchContainer: responsiveStyle({
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
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
  tabs: responsiveStyle({
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  tab: responsiveStyle({
    marginRight: 20,
    paddingVertical: 8,
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
  friendsList: responsiveStyle({
    padding: 12,
  }),
  friendItem: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  }),
  avatarContainer: responsiveStyle({
    position: 'relative',
  }),
  avatar: responsiveStyle({
    width: 60,
    height: 60,
    borderRadius: 30,
  }),
  onlineIndicator: responsiveStyle({
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#31a24c',
  }),
  gen1Badge: responsiveStyle({
    position: 'absolute',
    top: -2,
    left: -2,
    backgroundColor: '#667eea',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  }),
  gen1BadgeText: responsiveStyle({
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  }),
  friendInfo: responsiveStyle({
    flex: 1,
    marginLeft: 12,
  }),
  friendName: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  }),
  mutualFriends: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
    marginTop: 2,
  }),
  friendStatus: responsiveStyle({
    fontSize: 12,
    color: '#667eea',
    marginTop: 2,
    fontStyle: 'italic',
  }),
  gen1FeaturesContainer: responsiveStyle({
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  }),
  gen1FeatureTag: responsiveStyle({
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  }),
  gen1FeatureText: responsiveStyle({
    fontSize: 10,
    color: '#667eea',
    fontWeight: '500',
  }),
  moreFeaturesText: responsiveStyle({
    fontSize: 10,
    color: '#65676b',
    marginTop: 4,
  }),
  actionButtons: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  }),
  messageButton: responsiveStyle({
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
  }),
  liveButton: responsiveStyle({
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffe5e5',
  }),
  // Gen 1 Stats Styles
  gen1StatsSection: responsiveStyle({
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  gen1StatsButton: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  }),
  gen1StatsButtonText: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  }),
  gen1StatsContent: responsiveStyle({
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  }),
  gen1StatsGrid: responsiveStyle({
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  }),
  gen1StatItem: responsiveStyle({
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  }),
  gen1StatValue: responsiveStyle({
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  }),
  gen1StatLabel: responsiveStyle({
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  }),
}); 