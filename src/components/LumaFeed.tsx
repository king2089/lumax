import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Post } from '../types';
import { PostCard } from './PostCard';

interface LumaFeedProps {
  posts: Post[];
  users: any[];
}

// Next Gen 2070: Futuristic feed UI
export const LumaFeed: React.FC<LumaFeedProps> = ({ posts, users }) => {
  if (!posts.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No posts yet. Be the first to share your vibe in 2070!</Text>
      </View>
    );
  }
  return (
    <View style={styles.feedContainer}>
      {posts.map(post => {
        const postUser = users.find(u => u.id === post.userId) || { id: '0', name: 'Unknown', avatar: '', isVerified: false, isPrivate: false };
        return <PostCard key={post.id} post={post} user={postUser} futuristic />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    padding: 0,
    margin: 0,
    backgroundColor: 'rgba(10,10,30,0.95)',
    borderRadius: 24,
    shadowColor: '#00C853',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#64DD17',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#00C853',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
