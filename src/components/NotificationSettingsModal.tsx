import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface NotificationSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  friendRequests: boolean;
  messages: boolean;
  likes: boolean;
  comments: boolean;
  mentions: boolean;
  followers: boolean;
  posts: boolean;
  stories: boolean;
  liveStreams: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  quietHours: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    friendRequests: true,
    messages: true,
    likes: true,
    comments: true,
    mentions: true,
    followers: true,
    posts: true,
    stories: false,
    liveStreams: true,
    securityAlerts: true,
    marketingEmails: false,
    weeklyDigest: true,
    quietHours: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  const updateSetting = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    Alert.alert(
      'Settings Saved',
      'Your notification preferences have been updated successfully.',
      [
        {
          text: 'OK',
          onPress: onClose,
        },
      ]
    );
  };

  const renderToggleItem = (
    title: string,
    description: string,
    icon: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    color: string = '#4ECDC4'
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingHeader}>
        <View style={[styles.settingIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#f4f3f4', true: `${color}40` }}
          thumbColor={value ? color : '#f4f3f4'}
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Delivery Methods</Text>
          
          {renderToggleItem(
            'Push Notifications',
            'Receive notifications on your device',
            'phone-portrait',
            settings.pushNotifications,
            (value) => updateSetting('pushNotifications', value),
            '#4ECDC4'
          )}

          {renderToggleItem(
            'Email Notifications',
            'Receive notifications via email',
            'mail',
            settings.emailNotifications,
            (value) => updateSetting('emailNotifications', value),
            '#667eea'
          )}

          {renderToggleItem(
            'SMS Notifications',
            'Receive important notifications via text',
            'chatbubble',
            settings.smsNotifications,
            (value) => updateSetting('smsNotifications', value),
            '#FF6B6B'
          )}

          {renderToggleItem(
            'In-App Notifications',
            'Show notifications while using the app',
            'notifications',
            settings.inAppNotifications,
            (value) => updateSetting('inAppNotifications', value),
            '#45B7D1'
          )}

          <Text style={styles.sectionTitle}>Social Notifications</Text>

          {renderToggleItem(
            'Friend Requests',
            'When someone sends you a friend request',
            'people',
            settings.friendRequests,
            (value) => updateSetting('friendRequests', value),
            '#FF8E53'
          )}

          {renderToggleItem(
            'Messages',
            'New direct messages and chats',
            'chatbubbles',
            settings.messages,
            (value) => updateSetting('messages', value),
            '#9C27B0'
          )}

          {renderToggleItem(
            'Likes & Reactions',
            'When someone likes your content',
            'heart',
            settings.likes,
            (value) => updateSetting('likes', value),
            '#E91E63'
          )}

          {renderToggleItem(
            'Comments',
            'When someone comments on your posts',
            'chatbubble-ellipses',
            settings.comments,
            (value) => updateSetting('comments', value),
            '#FFA726'
          )}

          {renderToggleItem(
            'Mentions',
            'When someone mentions you in a post',
            'at',
            settings.mentions,
            (value) => updateSetting('mentions', value),
            '#2196F3'
          )}

          {renderToggleItem(
            'New Followers',
            'When someone follows you',
            'person-add',
            settings.followers,
            (value) => updateSetting('followers', value),
            '#4CAF50'
          )}

          <Text style={styles.sectionTitle}>Content Notifications</Text>

          {renderToggleItem(
            'New Posts',
            'From people you follow',
            'document-text',
            settings.posts,
            (value) => updateSetting('posts', value),
            '#795548'
          )}

          {renderToggleItem(
            'Stories',
            'When friends post new stories',
            'film',
            settings.stories,
            (value) => updateSetting('stories', value),
            '#607D8B'
          )}

          {renderToggleItem(
            'Live Streams',
            'When people you follow go live',
            'radio',
            settings.liveStreams,
            (value) => updateSetting('liveStreams', value),
            '#FF5722'
          )}

          <Text style={styles.sectionTitle}>Security & Updates</Text>

          {renderToggleItem(
            'Security Alerts',
            'Important account security notifications',
            'shield-checkmark',
            settings.securityAlerts,
            (value) => updateSetting('securityAlerts', value),
            '#F44336'
          )}

          {renderToggleItem(
            'Marketing Emails',
            'Product updates and promotional content',
            'megaphone',
            settings.marketingEmails,
            (value) => updateSetting('marketingEmails', value),
            '#9E9E9E'
          )}

          {renderToggleItem(
            'Weekly Digest',
            'Summary of your week on Luma Go',
            'calendar',
            settings.weeklyDigest,
            (value) => updateSetting('weeklyDigest', value),
            '#3F51B5'
          )}

          <Text style={styles.sectionTitle}>Quiet Hours</Text>

          {renderToggleItem(
            'Enable Quiet Hours',
            'Silence non-urgent notifications during set hours',
            'moon',
            settings.quietHours,
            (value) => updateSetting('quietHours', value),
            '#673AB7'
          )}

          {settings.quietHours && (
            <View style={styles.quietHoursCard}>
              <Text style={styles.quietHoursTitle}>Quiet Hours Schedule</Text>
              <Text style={styles.quietHoursTime}>
                🌙 {settings.quietHoursStart} - {settings.quietHoursEnd}
              </Text>
              <Text style={styles.quietHoursNote}>
                Only security alerts and urgent messages will be delivered during quiet hours
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.saveGradient}
            >
              <Text style={styles.saveText}>Save Notification Settings</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={20} color="#FFA726" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>💡 Tip</Text>
              <Text style={styles.tipText}>
                You can customize notifications for individual conversations and groups 
                by visiting their settings directly.
              </Text>
            </View>
          </View>

          <View style={styles.disclaimerContainer}>
            <Ionicons name="information-circle" size={16} color="#888" />
            <Text style={styles.disclaimerText}>
              Some notifications may still be delivered based on your device settings. 
              You can manage system-level notifications in your device settings.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 24,
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  quietHoursCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#673AB7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quietHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  quietHoursTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#673AB7',
    marginBottom: 8,
  },
  quietHoursNote: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  saveButton: {
    marginTop: 32,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingBottom: 32,
    gap: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
    flex: 1,
  },
}); 