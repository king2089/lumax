import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { scale, responsiveStyle } from '../utils/responsive';

// Dummy data for saved items with Gen 1 features
const DUMMY_SAVED_ITEMS = [
  {
    id: '1',
    type: 'post',
    title: 'Amazing Travel Photos',
    author: 'John Doe',
    timestamp: '2h ago',
    thumbnail: 'https://via.placeholder.com/300x200',
    collection: 'Travel',
    isGen1: true,
    gen1Features: ['AI Enhanced', 'Smart Tags'],
    likes: 124,
    comments: 18,
  },
  {
    id: '2',
    type: 'article',
    title: 'How to Master React Native',
    author: 'Tech Blog',
    timestamp: '1d ago',
    thumbnail: 'https://via.placeholder.com/300x200',
    collection: 'Development',
    isGen1: false,
    likes: 89,
    comments: 12,
  },
  {
    id: '3',
    type: 'video',
    title: 'Cooking Tutorial: Perfect Pasta',
    author: 'Chef Maria',
    timestamp: '3d ago',
    thumbnail: 'https://via.placeholder.com/300x200',
    collection: 'Cooking',
    isGen1: true,
    gen1Features: ['AI Recipe', 'Smart Timing'],
    likes: 256,
    comments: 34,
  },
  {
    id: '4',
    type: 'live_stream',
    title: 'Live Music Session',
    author: 'Music Artist',
    timestamp: '5h ago',
    thumbnail: 'https://via.placeholder.com/300x200',
    collection: 'Music',
    isGen1: true,
    gen1Features: ['4K Quality', 'Live Chat'],
    likes: 512,
    comments: 67,
    isLive: true,
  },
  {
    id: '5',
    type: 'ai_chat',
    title: 'AI Conversation History',
    author: 'Luma AI',
    timestamp: '1h ago',
    thumbnail: 'https://via.placeholder.com/300x200',
    collection: 'AI Conversations',
    isGen1: true,
    gen1Features: ['Smart Responses', 'Context Memory'],
    likes: 78,
    comments: 5,
  },
];

export const SavedScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollection, setActiveCollection] = useState('All Items');

  const collections = ['All Items', 'Travel', 'Development', 'Cooking', 'Music', 'AI Conversations'];

  const renderSavedItem = ({ item }: any) => (
    <View style={styles.cardSection}>
      <TouchableOpacity style={styles.savedItem}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.typeContainer}>
              <Text style={styles.itemType}>{item.type.toUpperCase()}</Text>
              {item.isLive && (
                <View style={styles.liveBadge}>
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.author}>{item.author}</Text>
          
          {item.isGen1 && (
            <View style={styles.gen1FeaturesContainer}>
              <View style={styles.gen1Badge}>
                <Ionicons name="sparkles" size={12} color="#FFD700" />
                <Text style={styles.gen1Text}>Gen 1</Text>
              </View>
              {item.gen1Features.map((feature: string, index: number) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.itemFooter}>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Ionicons name="heart" size={14} color="#e74c3c" />
                <Text style={styles.statText}>{item.likes}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="chatbubble" size={14} color="#3498db" />
                <Text style={styles.statText}>{item.comments}</Text>
              </View>
            </View>
            <View style={styles.collectionContainer}>
              <Text style={styles.collection}>{item.collection}</Text>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#65676b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderGen1Stats = () => (
    <View style={styles.cardSection}>
      <View style={styles.gen1StatsContainer}>
        <Text style={styles.gen1StatsTitle}>Gen 1 Saved Content</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="sparkles" size={24} color="#FFD700" />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Gen 1 Items</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart" size={24} color="#e74c3c" />
            <Text style={styles.statNumber}>870</Text>
            <Text style={styles.statLabel}>Total Likes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="chatbubble" size={24} color="#3498db" />
            <Text style={styles.statNumber}>124</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="folder" size={24} color="#9b59b6" />
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
        </View>
      </View>
    </View>
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
        <Text style={styles.headerTitle}>Saved</Text>
        <TouchableOpacity style={styles.addCollectionButton}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderGen1Stats()}

        <View style={styles.cardSection}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#65676b" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search saved items"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#65676b"
              />
            </View>
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.collectionsContainer}>
            <FlatList
              horizontal
              data={collections}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.collectionButton,
                    activeCollection === item && styles.activeCollection
                  ]}
                  onPress={() => setActiveCollection(item)}
                >
                  <Text 
                    style={[
                      styles.collectionText,
                      activeCollection === item && styles.activeCollectionText
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collectionsContent}
            />
          </View>
        </View>

        <View style={styles.savedItemsContainer}>
          {DUMMY_SAVED_ITEMS.map((item) => renderSavedItem({ item }))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: responsiveStyle({
    flex: 1,
    backgroundColor: '#f8f9fa',
  }),
  scrollContainer: responsiveStyle({
    flex: 1,
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
  }),
  backButton: responsiveStyle({
    padding: 8,
  }),
  addCollectionButton: responsiveStyle({
    padding: 8,
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
  collectionsContainer: responsiveStyle({
    padding: 16,
  }),
  collectionsContent: responsiveStyle({
    paddingBottom: 8,
  }),
  collectionButton: responsiveStyle({
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    marginRight: 8,
  }),
  activeCollection: responsiveStyle({
    backgroundColor: '#1877f2',
  }),
  collectionText: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
  }),
  activeCollectionText: responsiveStyle({
    color: '#fff',
    fontWeight: '600',
  }),
  savedItemsContainer: responsiveStyle({
    paddingHorizontal: 16,
    paddingBottom: 20,
  }),
  savedItem: responsiveStyle({
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  }),
  thumbnail: responsiveStyle({
    width: 80,
    height: 80,
    borderRadius: 8,
  }),
  itemContent: responsiveStyle({
    flex: 1,
    padding: 12,
  }),
  itemHeader: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  }),
  typeContainer: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  itemType: responsiveStyle({
    fontSize: 12,
    fontWeight: '600',
    color: '#1877f2',
    textTransform: 'uppercase',
  }),
  liveBadge: responsiveStyle({
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  }),
  liveText: responsiveStyle({
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  }),
  timestamp: responsiveStyle({
    fontSize: 12,
    color: '#65676b',
  }),
  title: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 4,
  }),
  author: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
    marginBottom: 8,
  }),
  gen1FeaturesContainer: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  }),
  gen1Badge: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  }),
  gen1Text: responsiveStyle({
    fontSize: 12,
    fontWeight: '600',
    color: '#DAA520',
    marginLeft: 4,
  }),
  featureTag: responsiveStyle({
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  }),
  featureText: responsiveStyle({
    fontSize: 10,
    color: '#1877f2',
    fontWeight: '500',
  }),
  itemFooter: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  statsContainer: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  stat: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  }),
  statText: responsiveStyle({
    fontSize: 12,
    color: '#65676b',
    marginLeft: 4,
  }),
  collectionContainer: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  collection: responsiveStyle({
    fontSize: 12,
    color: '#1877f2',
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  }),
  moreButton: responsiveStyle({
    padding: 4,
  }),
}); 