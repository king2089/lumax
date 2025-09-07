import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Notification, NotificationPreference } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationAnalytics {
  totalNotifications: number;
  readNotifications: number;
  unreadNotifications: number;
  clickThroughRate: number;
  engagementRate: number;
  lastUpdated: string;
}

export interface NotificationCampaign {
  id: string;
  title: string;
  body: string;
  targetAudience: string[];
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  createdAt: string;
  sentCount: number;
  openedCount: number;
}

export interface SmartFilter {
  id: string;
  name: string;
  criteria: {
    type?: string[];
    category?: string[];
    priority?: string[];
    timeRange?: {
      start: string;
      end: string;
    };
    keywords?: string[];
  };
  isActive: boolean;
}

class EnhancedNotificationService {
  private static instance: EnhancedNotificationService;
  private notifications: Notification[] = [];
  private preferences: NotificationPreference[] = [];
  private analytics: NotificationAnalytics | null = null;
  private campaigns: NotificationCampaign[] = [];
  private smartFilters: SmartFilter[] = [];
  private listeners: Map<string, (notification: Notification) => void> = new Map();
  private isServiceConnected: boolean = false;
  private pushToken: string | null = null;
  
  // Storage keys
  private readonly NOTIFICATIONS_KEY = 'enhanced_notifications';
  private readonly PREFERENCES_KEY = 'notification_preferences';
  private readonly ANALYTICS_KEY = 'notification_analytics';
  private readonly CAMPAIGNS_KEY = 'notification_campaigns';
  private readonly FILTERS_KEY = 'smart_filters';
  private readonly PUSH_TOKEN_KEY = 'push_token';

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): EnhancedNotificationService {
    if (!EnhancedNotificationService.instance) {
      EnhancedNotificationService.instance = new EnhancedNotificationService();
    }
    return EnhancedNotificationService.instance;
  }

  private async initializeService() {
    console.log('🔔 [ENHANCED NOTIFICATIONS] Initializing enhanced notification service...');
    
    try {
      // Load stored data
      await this.loadStoredData();
      
      // Request push notification permissions
      await this.requestPermissions();
      
      // Register for push notifications
      await this.registerForPushNotifications();
      
      // Initialize real-time notifications
      this.initializeRealTimeNotifications();
      
      // Load default preferences if none exist
      if (this.preferences.length === 0) {
        await this.initializeDefaultPreferences();
      }
      
      // Load default smart filters
      if (this.smartFilters.length === 0) {
        await this.initializeDefaultFilters();
      }
      
      console.log('✅ [ENHANCED NOTIFICATIONS] Service initialized successfully');
    } catch (error) {
      console.error('❌ [ENHANCED NOTIFICATIONS] Initialization failed:', error);
    }
  }

  private async loadStoredData() {
    try {
      const [notifications, preferences, analytics, campaigns, filters, pushToken] = await Promise.all([
        AsyncStorage.getItem(this.NOTIFICATIONS_KEY),
        AsyncStorage.getItem(this.PREFERENCES_KEY),
        AsyncStorage.getItem(this.ANALYTICS_KEY),
        AsyncStorage.getItem(this.CAMPAIGNS_KEY),
        AsyncStorage.getItem(this.FILTERS_KEY),
        AsyncStorage.getItem(this.PUSH_TOKEN_KEY),
      ]);

      this.notifications = notifications ? JSON.parse(notifications) : [];
      this.preferences = preferences ? JSON.parse(preferences) : [];
      this.analytics = analytics ? JSON.parse(analytics) : null;
      this.campaigns = campaigns ? JSON.parse(campaigns) : [];
      this.smartFilters = filters ? JSON.parse(filters) : [];
      this.pushToken = pushToken;

      console.log('📦 [ENHANCED NOTIFICATIONS] Loaded stored data:', {
        notifications: this.notifications.length,
        preferences: this.preferences.length,
        campaigns: this.campaigns.length,
        filters: this.smartFilters.length,
      });
    } catch (error) {
      console.error('❌ [ENHANCED NOTIFICATIONS] Error loading stored data:', error);
    }
  }

  private async saveStoredData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(this.notifications)),
        AsyncStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(this.preferences)),
        AsyncStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(this.analytics)),
        AsyncStorage.setItem(this.CAMPAIGNS_KEY, JSON.stringify(this.campaigns)),
        AsyncStorage.setItem(this.FILTERS_KEY, JSON.stringify(this.smartFilters)),
      ]);
    } catch (error) {
      console.error('❌ [ENHANCED NOTIFICATIONS] Error saving stored data:', error);
    }
  }

  // 1. REAL-TIME NOTIFICATIONS
  private initializeRealTimeNotifications() {
    console.log('🔄 [ENHANCED NOTIFICATIONS] Initializing real-time notifications...');
    
    // Simulate real-time notification delivery
    setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance of new notification
        this.createRealTimeNotification();
      }
    }, 15000); // Check every 15 seconds

    // Listen for notification interactions
    Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 [ENHANCED NOTIFICATIONS] Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 [ENHANCED NOTIFICATIONS] Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  private createRealTimeNotification() {
    const notificationTypes = [
      { type: 'like', title: 'New Like!', body: 'Someone liked your post! ❤️' },
      { type: 'comment', title: 'New Comment', body: 'Someone commented on your post! 💬' },
      { type: 'follow', title: 'New Follower', body: 'You have a new follower! 👥' },
      { type: 'mention', title: 'You were mentioned', body: 'Someone mentioned you in a post! 📢' },
      { type: 'share', title: 'Post Shared', body: 'Your post was shared! 🔄' },
    ];

    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    
    const notification: Notification = {
      id: `realtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'current_user',
      title: randomType.title,
      body: randomType.body,
      type: randomType.type,
      category: 'social',
      is_read: false,
      created_at: new Date().toISOString(),
      data: {
        postId: `post_${Date.now()}`,
        userId: `user_${Math.random().toString(36).substr(2, 9)}`,
        username: 'LumaUser',
      }
    };

    this.addNotification(notification);
  }

  private handleNotificationReceived(notification: any) {
    // Update analytics
    this.updateAnalytics('received');
  }

  private handleNotificationResponse(response: any) {
    // Update analytics
    this.updateAnalytics('opened');
    
    // Mark as read if it's a local notification
    const notificationId = response.notification.request.content.data?.id;
    if (notificationId) {
      this.markAsRead(notificationId);
    }
  }

  // 2. PUSH NOTIFICATIONS
  private async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ [ENHANCED NOTIFICATIONS] Push notification permissions not granted');
        return false;
      }

      console.log('✅ [ENHANCED NOTIFICATIONS] Push notification permissions granted');
      return true;
    } catch (error) {
      console.error('❌ [ENHANCED NOTIFICATIONS] Error requesting permissions:', error);
      return false;
    }
  }

  private async registerForPushNotifications() {
    try {
      if (Platform.OS === 'web') {
        console.log('🔔 [ENHANCED NOTIFICATIONS] Web platform - skipping push notification registration');
        return null;
      }

      // Check if running in Expo Go (which doesn't support push notifications in SDK 53+)
      if (__DEV__ && Platform.OS === 'android') {
        console.log('🔔 [ENHANCED NOTIFICATIONS] Development mode on Android - push notifications require development build');
        return null;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const token = await Notifications.getExpoPushTokenAsync();
      this.pushToken = token.data;
      await AsyncStorage.setItem(this.PUSH_TOKEN_KEY, this.pushToken);
      
      // Clear retry flag on success
      await AsyncStorage.removeItem('notification_retry_needed');
      
      console.log('📱 [ENHANCED NOTIFICATIONS] Push token registered:', this.pushToken);
      return this.pushToken;
    } catch (error: any) {
      console.error('❌ [ENHANCED NOTIFICATIONS] Error registering for push notifications:', error);
      
      // Handle specific network errors
      if (error?.message?.includes('503') || error?.message?.includes('upstream connect error')) {
        console.log('🔄 [ENHANCED NOTIFICATIONS] Network error detected, will retry later');
        // Set a flag to retry later
        await AsyncStorage.setItem('notification_retry_needed', 'true');
      }
      
      if (__DEV__ && Platform.OS === 'android') {
        console.log('🔔 [ENHANCED NOTIFICATIONS] This is expected in Expo Go. Use a development build for push notifications.');
      }
      return null;
    }
  }

  public async sendPushNotification(notification: Notification) {
    try {
      if (!this.pushToken) {
        console.warn('⚠️ [ENHANCED NOTIFICATIONS] No push token available');
        return false;
      }

      const message = {
        to: this.pushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data,
      };

      // In a real app, you would send this to your backend
      // which would then send it via Expo's push service
      console.log('📤 [ENHANCED NOTIFICATIONS] Sending push notification:', message);
      
      // For demo purposes, we'll just schedule a local notification
      await this.scheduleLocalNotification(notification);
      return true;
    } catch (error) {
      console.error('❌ [ENHANCED NOTIFICATIONS] Error sending push notification:', error);
      return false;
    }
  }

  public async scheduleLocalNotification(notification: Notification, trigger?: any) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { id: notification.id, ...notification.data },
        },
        trigger: trigger || null,
      });
      
      console.log('⏰ [ENHANCED NOTIFICATIONS] Local notification scheduled:', notification.id);
    } catch (error) {
      console.error('❌ [ENHANCED NOTIFICATIONS] Error scheduling local notification:', error);
    }
  }

  // 3. NOTIFICATION PREFERENCES
  private async initializeDefaultPreferences() {
    const defaultPreferences: NotificationPreference[] = [
      {
        id: 'social_likes',
        user_id: 'current_user',
        category: 'social',
        email_enabled: true,
        push_enabled: true,
        in_app_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'social_comments',
        user_id: 'current_user',
        category: 'social',
        email_enabled: true,
        push_enabled: true,
        in_app_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'social_follows',
        user_id: 'current_user',
        category: 'social',
        email_enabled: false,
        push_enabled: true,
        in_app_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'content_posts',
        user_id: 'current_user',
        category: 'content',
        email_enabled: true,
        push_enabled: false,
        in_app_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'system_updates',
        user_id: 'current_user',
        category: 'system',
        email_enabled: true,
        push_enabled: true,
        in_app_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    this.preferences = defaultPreferences;
    await this.saveStoredData();
    console.log('⚙️ [ENHANCED NOTIFICATIONS] Default preferences initialized');
  }

  public getPreferences(): NotificationPreference[] {
    return [...this.preferences];
  }

  public async updatePreferences(newPreferences: Partial<NotificationPreference>[]) {
    try {
      for (const pref of newPreferences) {
        const index = this.preferences.findIndex(p => p.id === pref.id);
        if (index !== -1) {
          this.preferences[index] = { ...this.preferences[index], ...pref, updated_at: new Date().toISOString() };
        }
      }
      
      await this.saveStoredData();
      console.log('⚙️ [ENHANCED NOTIFICATIONS] Preferences updated');
    } catch (error) {
      console.error('❌ [ENHANCED NOTIFICATIONS] Error updating preferences:', error);
    }
  }

  // 4. NOTIFICATION HISTORY
  public addNotification(notification: Notification) {
    this.notifications.unshift(notification);
    
    // Keep only last 500 notifications
    if (this.notifications.length > 500) {
      this.notifications = this.notifications.slice(0, 500);
    }

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (error) {
        console.error('❌ [ENHANCED NOTIFICATIONS] Error in notification listener:', error);
      }
    });

    // Update analytics
    this.updateAnalytics('created');

    // Save to storage
    this.saveStoredData();

    console.log('🔔 [ENHANCED NOTIFICATIONS] Notification added:', notification.title);
  }

  public getNotifications(filters?: any): Notification[] {
    let filteredNotifications = [...this.notifications];

    if (filters) {
      if (filters.type) {
        filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
      }
      if (filters.category) {
        filteredNotifications = filteredNotifications.filter(n => n.category === filters.category);
      }
      if (filters.is_read !== undefined) {
        filteredNotifications = filteredNotifications.filter(n => n.is_read === filters.is_read);
      }
      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        filteredNotifications = filteredNotifications.filter(n => {
          const date = new Date(n.created_at);
          return date >= start && date <= end;
        });
      }
    }

    return filteredNotifications;
  }

  public getNotificationHistory(limit: number = 50, offset: number = 0): Notification[] {
    return this.notifications.slice(offset, offset + limit);
  }

  public async markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.is_read) {
      notification.is_read = true;
      await this.saveStoredData();
      this.updateAnalytics('read');
      console.log('✅ [ENHANCED NOTIFICATIONS] Marked as read:', notificationId);
    }
  }

  public async markAllAsRead() {
    let updated = false;
    this.notifications.forEach(n => {
      if (!n.is_read) {
        n.is_read = true;
        updated = true;
      }
    });
    
    if (updated) {
      await this.saveStoredData();
      this.updateAnalytics('read');
      console.log('✅ [ENHANCED NOTIFICATIONS] All notifications marked as read');
    }
  }

  public async deleteNotification(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      await this.saveStoredData();
      console.log('🗑️ [ENHANCED NOTIFICATIONS] Notification deleted:', notificationId);
    }
  }

  public async clearNotificationHistory() {
    this.notifications = [];
    await this.saveStoredData();
    console.log('🧹 [ENHANCED NOTIFICATIONS] Notification history cleared');
  }

  // 5. SMART FILTERING
  private async initializeDefaultFilters() {
    const defaultFilters: SmartFilter[] = [
      {
        id: 'high_priority',
        name: 'High Priority',
        criteria: {
          priority: ['urgent', 'high'],
        },
        isActive: true,
      },
      {
        id: 'social_activity',
        name: 'Social Activity',
        criteria: {
          type: ['like', 'comment', 'follow', 'mention'],
          category: ['social'],
        },
        isActive: true,
      },
      {
        id: 'recent_notifications',
        name: 'Recent (Last 24h)',
        criteria: {
          timeRange: {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
        },
        isActive: false,
      },
      {
        id: 'unread_only',
        name: 'Unread Only',
        criteria: {},
        isActive: false,
      },
    ];

    this.smartFilters = defaultFilters;
    await this.saveStoredData();
    console.log('🧠 [ENHANCED NOTIFICATIONS] Default smart filters initialized');
  }

  public getSmartFilters(): SmartFilter[] {
    return [...this.smartFilters];
  }

  public async createSmartFilter(filter: Omit<SmartFilter, 'id'>) {
    const newFilter: SmartFilter = {
      ...filter,
      id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    this.smartFilters.push(newFilter);
    await this.saveStoredData();
    console.log('🧠 [ENHANCED NOTIFICATIONS] Smart filter created:', newFilter.name);
    return newFilter;
  }

  public async updateSmartFilter(filterId: string, updates: Partial<SmartFilter>) {
    const index = this.smartFilters.findIndex(f => f.id === filterId);
    if (index !== -1) {
      this.smartFilters[index] = { ...this.smartFilters[index], ...updates };
      await this.saveStoredData();
      console.log('🧠 [ENHANCED NOTIFICATIONS] Smart filter updated:', filterId);
    }
  }

  public async deleteSmartFilter(filterId: string) {
    const index = this.smartFilters.findIndex(f => f.id === filterId);
    if (index !== -1) {
      this.smartFilters.splice(index, 1);
      await this.saveStoredData();
      console.log('🗑️ [ENHANCED NOTIFICATIONS] Smart filter deleted:', filterId);
    }
  }

  public applySmartFilters(notifications: Notification[]): Notification[] {
    const activeFilters = this.smartFilters.filter(f => f.isActive);
    
    return notifications.filter(notification => {
      return activeFilters.every(filter => {
        const criteria = filter.criteria;
        
        // Type filter
        if (criteria.type && !criteria.type.includes(notification.type)) {
          return false;
        }
        
        // Category filter
        if (criteria.category && !criteria.category.includes(notification.category)) {
          return false;
        }
        
        // Priority filter (if notification has priority)
        if (criteria.priority && notification.data?.priority && !criteria.priority.includes(notification.data.priority)) {
          return false;
        }
        
        // Time range filter
        if (criteria.timeRange) {
          const notificationDate = new Date(notification.created_at);
          const start = new Date(criteria.timeRange.start);
          const end = new Date(criteria.timeRange.end);
          if (notificationDate < start || notificationDate > end) {
            return false;
          }
        }
        
        // Keywords filter
        if (criteria.keywords) {
          const text = `${notification.title} ${notification.body}`.toLowerCase();
          if (!criteria.keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
            return false;
          }
        }
        
        return true;
      });
    });
  }

  // ANALYTICS
  private updateAnalytics(action: 'created' | 'received' | 'opened' | 'read') {
    if (!this.analytics) {
      this.analytics = {
        totalNotifications: 0,
        readNotifications: 0,
        unreadNotifications: 0,
        clickThroughRate: 0,
        engagementRate: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    this.analytics.totalNotifications = this.notifications.length;
    this.analytics.readNotifications = this.notifications.filter(n => n.is_read).length;
    this.analytics.unreadNotifications = this.notifications.filter(n => !n.is_read).length;
    this.analytics.lastUpdated = new Date().toISOString();

    // Calculate rates
    if (this.analytics.totalNotifications > 0) {
      this.analytics.clickThroughRate = (this.analytics.readNotifications / this.analytics.totalNotifications) * 100;
      this.analytics.engagementRate = (this.analytics.readNotifications / this.analytics.totalNotifications) * 100;
    }

    this.saveStoredData();
  }

  public getAnalytics(): NotificationAnalytics | null {
    return this.analytics;
  }

  // CAMPAIGNS
  public async createCampaign(campaignData: Omit<NotificationCampaign, 'id' | 'createdAt' | 'sentCount' | 'openedCount'>) {
    const campaign: NotificationCampaign = {
      ...campaignData,
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      sentCount: 0,
      openedCount: 0,
    };

    this.campaigns.push(campaign);
    await this.saveStoredData();
    console.log('📢 [ENHANCED NOTIFICATIONS] Campaign created:', campaign.title);
    return campaign;
  }

  public getCampaigns(): NotificationCampaign[] {
    return [...this.campaigns];
  }

  public async updateCampaignStatus(campaignId: string, status: NotificationCampaign['status']) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.status = status;
      await this.saveStoredData();
      console.log('📢 [ENHANCED NOTIFICATIONS] Campaign status updated:', campaignId, status);
    }
  }

  // UTILITY METHODS
  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }

  public subscribe(listenerId: string, callback: (notification: Notification) => void) {
    this.listeners.set(listenerId, callback);
    console.log(`🔔 [ENHANCED NOTIFICATIONS] Listener subscribed: ${listenerId}`);
  }

  public unsubscribe(listenerId: string) {
    this.listeners.delete(listenerId);
    console.log(`🔔 [ENHANCED NOTIFICATIONS] Listener unsubscribed: ${listenerId}`);
  }

  public isConnected(): boolean {
    return this.isServiceConnected;
  }

  public getPushToken(): string | null {
    return this.pushToken;
  }
}

export default EnhancedNotificationService;
