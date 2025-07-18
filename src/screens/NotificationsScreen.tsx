import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, responsiveStyle } from '../utils/responsive';

const DUMMY_NOTIFICATIONS = [
  {
    id: '1',
    type: 'like',
    user: 'Sarah Chen',
    content: 'liked your Gen 1 post',
    time: '2m ago',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    read: false,
    icon: 'heart',
    color: '#FF6B6B',
  },
  {
    id: '2',
    type: 'comment',
    user: 'Alex Rivera',
    content: 'commented on your Luma AI post',
    time: '15m ago',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    read: false,
    icon: 'chatbubble',
    color: '#4ECDC4',
  },
  {
    id: '3',
    type: 'follow',
    user: 'Maya Patel',
    content: 'started following you',
    time: '1h ago',
    avatar: 'https://i.pravatar.cc/150?u=maya',
    read: true,
    icon: 'person-add',
    color: '#667eea',
  },
  {
    id: '4',
    type: 'ai',
    user: 'Luma AI',
    content: 'Your Gen 1 AI analysis is ready',
    time: '3h ago',
    avatar: 'https://i.pravatar.cc/150?u=luma',
    read: false,
    icon: 'sparkles',
    color: '#FFD700',
  },
  {
    id: '5',
    type: 'update',
    user: 'System',
    content: 'New Gen 1 features available',
    time: '5h ago',
    avatar: 'https://i.pravatar.cc/150?u=system',
    read: true,
    icon: 'rocket',
    color: '#00C853',
  },
  {
    id: '6',
    type: 'music',
    user: 'DJ Luna',
    content: 'shared a new track with you',
    time: '1d ago',
    avatar: 'https://i.pravatar.cc/150?u=djluna',
    read: true,
    icon: 'musical-notes',
    color: '#E91E63',
  },
];

export const NotificationsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const renderNotification = ({ item }: { item: typeof DUMMY_NOTIFICATIONS[0] }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unread
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={[styles.iconBadge, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as any} size={12} color="white" />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.text}>
          <Text style={styles.username}>{item.user}</Text>
          {' '}{item.content}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Gen 1 Notifications</Text>
        <TouchableOpacity style={styles.markAllButton}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
        showsVerticalScrollIndicator={false}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  }),
  headerText: responsiveStyle({
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  }),
  markAllButton: responsiveStyle({
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#667eea',
  }),
  markAllText: responsiveStyle({
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  }),
  notificationItem: responsiveStyle({
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  }),
  unread: responsiveStyle({
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  }),
  avatarContainer: responsiveStyle({
    position: 'relative',
    marginRight: 14,
  }),
  avatar: responsiveStyle({
    width: 48,
    height: 48,
    borderRadius: 24,
  }),
  iconBadge: responsiveStyle({
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  }),
  contentContainer: responsiveStyle({
    flex: 1,
  }),
  text: responsiveStyle({
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 4,
    lineHeight: 22,
  }),
  username: responsiveStyle({
    fontWeight: '600',
  }),
  time: responsiveStyle({
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  }),
  unreadDot: responsiveStyle({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginLeft: 8,
  }),
}); 