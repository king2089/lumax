import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Story } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface StoryListProps {
  stories: Story[];
}

export const StoryList: React.FC<StoryListProps> = ({ stories }) => {
  const mockStories = [
    {
      id: '1',
      userId: '1',
      media: 'https://via.placeholder.com/60x60/667eea/ffffff?text=Story1',
      type: 'image' as const,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      views: [],
    },
    {
      id: '2',
      userId: '2',
      media: 'https://via.placeholder.com/60x60/ff6b6b/ffffff?text=Story2',
      type: 'image' as const,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      views: [],
    },
    {
      id: '3',
      userId: '3',
      media: 'https://via.placeholder.com/60x60/4ecdc4/ffffff?text=Story3',
      type: 'image' as const,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      views: [],
    },
    {
      id: '4',
      userId: '4',
      media: 'https://via.placeholder.com/60x60/45b7d1/ffffff?text=Story4',
      type: 'image' as const,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      views: [],
    },
  ];

  const displayStories = stories.length > 0 ? stories : mockStories;

  const handleStoryPress = (story: Story) => {
    // In a real app, this would open the story viewer
    console.log('Story pressed:', story.id);
  };

  const handleAddStory = () => {
    // In a real app, this would open the story creation screen
    console.log('Add story pressed');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Add Story Button */}
        <TouchableOpacity style={styles.storyItem} onPress={handleAddStory}>
          <View style={styles.addStoryContainer}>
            <View style={styles.addStoryAvatar}>
              <Ionicons name="add" size={24} color="#667eea" />
            </View>
            <Text style={styles.storyUsername}>Add Story</Text>
          </View>
        </TouchableOpacity>

        {/* Story Items */}
        {displayStories.map((story) => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyItem}
            onPress={() => handleStoryPress(story)}
          >
            <View style={styles.storyContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.storyBorder}
              >
                <Image source={{ uri: story.media }} style={styles.storyAvatar} />
              </LinearGradient>
              <Text style={styles.storyUsername} numberOfLines={1}>
                User {story.userId}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  scrollContainer: {
    paddingHorizontal: 15,
  },
  storyItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  storyContainer: {
    alignItems: 'center',
  },
  storyBorder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 3,
    marginBottom: 5,
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  addStoryContainer: {
    alignItems: 'center',
  },
  addStoryAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  storyUsername: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    maxWidth: 70,
  },
}); 