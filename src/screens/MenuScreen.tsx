import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Pressable,
  Modal,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { MoodControl } from '../components/MoodControl';
import { useMood } from '../context/MoodContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AgeVerificationModal } from '../components/AgeVerificationModal';
import { ContentReportModal } from '../components/ContentReportModal';
import { PrivacyControlsModal } from '../components/PrivacyControlsModal';
import { CommunityGuidelinesModal } from '../components/CommunityGuidelinesModal';
import { ContentModerationTools } from '../components/ContentModerationTools';
import { NSFWContentWarning } from '../components/NSFWContentWarning';
import { NotificationSettingsModal } from '../components/NotificationSettingsModal';
import { LumaMusicScreen } from './LumaMusicScreen';
import { ArtistProfileScreen } from './ArtistProfileScreen';
import { MonetizationDashboard } from './MonetizationDashboard';
import { NSFWControlPanel } from './NSFWControlPanel';
import { LumaBabyAIScreen } from './LumaBabyAIScreen';
import { LumaLovedOnesScreen } from './LumaLovedOnesScreen';
import { LumaBankScreen } from './LumaBankScreen';
import { LumaShopScreen } from './LumaShopScreen';
import { ApplePayGooglePayScreen } from './ApplePayGooglePayScreen';
import { SubscriptionScreen } from './SubscriptionScreen';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import AutoUpdateService, { UpdateProgress } from '../services/AutoUpdateService';
import StoreUpdateService from '../services/StoreUpdateService';
import { scale, responsiveStyle } from '../utils/responsive';

type MenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MenuMain'>;

const AI_AGENTS = [
  {
    id: 'luma-assistant',
    name: 'Luma Assistant',
    description: 'General AI helper for all your needs',
    icon: 'sparkles',
    color: '#FF6B6B',
    avatar: 'https://i.pravatar.cc/150?u=ai1',
    status: 'online',
    specialty: 'General AI',
    conversations: 42,
    rating: 4.9,
  },
  {
    id: 'content-creator',
    name: 'Content Creator AI',
    description: 'Helps create posts, captions, and content',
    icon: 'create',
    color: '#00C853',
    avatar: 'https://i.pravatar.cc/150?u=ai2',
    status: 'online',
    specialty: 'Content Creation',
    conversations: 38,
    rating: 4.8,
  },
  {
    id: 'mood-therapist',
    name: 'Mood Therapist',
    description: 'Mental health and wellness support',
    icon: 'heart',
    color: '#9C27B0',
    avatar: 'https://i.pravatar.cc/150?u=ai3',
    status: 'online',
    specialty: 'Mental Health',
    conversations: 156,
    rating: 4.9,
  },
  {
    id: 'productivity-coach',
    name: 'Productivity Coach',
    description: 'Optimize your workflow and productivity',
    icon: 'trending-up',
    color: '#FF9800',
    avatar: 'https://i.pravatar.cc/150?u=ai4',
    status: 'online',
    specialty: 'Productivity',
    conversations: 89,
    rating: 4.7,
  },
  {
    id: 'creative-muse',
    name: 'Creative Muse',
    description: 'Inspiration for art, writing, and design',
    icon: 'color-palette',
    color: '#E91E63',
    avatar: 'https://i.pravatar.cc/150?u=ai5',
    status: 'busy',
    specialty: 'Creativity',
    conversations: 67,
    rating: 4.8,
  },
  {
    id: 'tech-mentor',
    name: 'Tech Mentor',
    description: 'Coding, tech advice, and development help',
    icon: 'code-slash',
    color: '#2196F3',
    avatar: 'https://i.pravatar.cc/150?u=ai6',
    status: 'online',
    specialty: 'Technology',
    conversations: 124,
    rating: 4.9,
  },
];

// Update info for Gen 1
const UPDATE_INFO = {
  version: '1.2.1',
  newVersion: '1.2.2',
  size: '52.8 MB',
  features: [
    '🚀 Enhanced Gen 1 AI Power',
    '🎬 Improved live streaming quality',
    '🎧 New customer service system',
    '⚡ Performance optimizations',
    '🐛 Bug fixes and stability improvements',
    '🎬 NEW: Live Streaming with Real-Time Quality Switching',
    '🎬 NEW: 4K, 8K, and 20K Ultra HD Streaming Support',
    '🎬 NEW: Live Stream Posts in Feed with Join Functionality',
    '🎬 NEW: Real-Time Notifications for Live Streams',
    '🎬 NEW: Interactive Live Stream Reactions and Chat',
    '🎬 NEW: NSFW Content Support for Live Streaming',
    '🎬 NEW: AI-Powered Live Stream Enhancement',
    '🎬 NEW: Multi-Quality Streaming (1080p, 4K, 8K, 20K)',
    '🎬 NEW: Live Stream Analytics and Viewer Tracking',
    '🎬 NEW: Real-Time Quality Change During Streams',
    '🎧 NEW: AI-Powered Customer Support System',
    '🎧 NEW: Live Support Sessions with Video Chat',
    '🎧 NEW: Support Ticket Management',
    '🎧 NEW: Real-Time Agent Availability',
    '🎧 NEW: Customer Service Analytics Dashboard',
    '🎧 NEW: Intelligent AI Response System',
    '🎧 NEW: Multi-Language Support',
    '🎧 NEW: NSFW Content Support in Customer Service',
    '🎧 NEW: Quality-Based Support Sessions (1080p-20K)'
  ],
  isAvailable: true,
  isRequired: false,
  autoUpdateEnabled: true
};

const MENU_SECTIONS = [
  {
    title: 'Gen 1 Features',
    items: [
      { icon: 'person', label: 'Profile', color: '#1877f2', route: 'Profile' },
      { icon: 'people', label: 'Friends', color: '#1877f2', route: 'Friends' },
      { icon: 'bookmark', label: 'Saved', color: '#8B64E9', route: 'Saved' },
      { icon: 'sparkles', label: '🤖 Luma AI', color: '#667eea', route: 'LumaAI' },
      { icon: 'compass', label: 'FYP', color: '#00C853', route: 'FYP' },
      { icon: 'checkmark-done-circle', label: 'TODO', color: '#9c27b0', route: 'Todo' },
      { icon: 'happy', label: '👶 Luma Baby AI', color: '#FF9800', action: 'baby-ai' },
      { icon: 'musical-notes', label: '🎵 Luma Music', color: '#4ECDC4', action: 'luma-music' },
      { icon: 'heart', label: '💝 Luma Loved Ones', color: '#E91E63', action: 'loved-ones' },
      { icon: 'card', label: '🏦 Luma Bank', color: '#FFD700', action: 'luma-card' },
      { icon: 'bag', label: '🛍️ Luma Shop', color: '#FF6B6B', action: 'luma-shop' },
      { icon: 'logo-apple', label: '🍎 Apple Pay & Google Pay', color: '#000000', action: 'apple-google-pay' },
      { icon: 'repeat', label: '📅 Subscriptions', color: '#9C27B0', action: 'subscriptions' },
    ],
  },
  {
    title: 'Gen 1 Creator Tools',
    items: [
      { icon: 'videocam', label: 'Content Studio', color: '#FF6B6B', action: 'content-studio' },
      { icon: 'analytics', label: 'Creator Analytics', color: '#4ECDC4', action: 'creator-analytics' },
      { icon: 'cash', label: 'Monetization', color: '#00C853', action: 'monetization' },
      { icon: 'trending-up', label: 'Growth Tools', color: '#667eea', action: 'growth-tools' },
      { icon: 'people', label: 'Audience Insights', color: '#45B7D1', action: 'audience-insights' },
      { icon: 'megaphone', label: 'Brand Partnerships', color: '#FF8E53', action: 'brand-partnerships' },
      { icon: 'school', label: 'Creator Academy', color: '#9C27B0', action: 'creator-academy' },
      { icon: 'storefront', label: 'Creator Store', color: '#E91E63', action: 'creator-store' },
      { icon: 'calendar-outline', label: 'Live Streaming', color: '#FFA726', action: 'live-streaming' },
      { icon: 'shield-checkmark', label: 'Creator Support', color: '#2196F3', action: 'creator-support' },
    ],
  },
  {
    title: 'Gen 1 Music Platform',
    items: [
      { icon: 'library', label: 'Discover Artists', color: '#FF6B6B', action: 'music-discover' },
      { icon: 'mic', label: 'Artist Profile', color: '#4ECDC4', action: 'music-profile' },
      { icon: 'musical-notes', label: 'Music Studio', color: '#667eea', action: 'music-studio' },
      { icon: 'people-outline', label: 'Collaborations', color: '#45B7D1', action: 'music-collabs' },
      { icon: 'radio', label: 'Live Sessions', color: '#FF8E53', action: 'music-live' },
      { icon: 'trending-up', label: 'Trending Tracks', color: '#00C853', action: 'music-trending' },
    ],
  },
  {
    title: 'Gen 1 Updates & Settings',
    items: [
      { icon: 'star', label: 'About Gen 1', color: '#FFD700', action: 'about-gen1' },
      { icon: 'cloud-download', label: 'Software Update', color: '#00C853', action: 'software-update', badge: UPDATE_INFO.isAvailable ? 'NEW' : undefined },
      { icon: 'checkmark-circle', label: 'System Requirements', color: '#4CAF50', action: 'system-requirements' },
      { icon: 'logo-apple', label: 'App Store Update', color: '#007AFF', action: 'app-store-update', badge: Platform.OS === 'ios' ? 'STORE' : undefined },
      { icon: 'logo-google', label: 'Google Play Update', color: '#34A853', action: 'google-play-update', badge: Platform.OS === 'android' ? 'STORE' : undefined },
      { icon: 'rocket', label: '🚀 Gen 2 Coming Soon', color: '#FF6B6B', action: 'gen2-coming-soon', badge: 'BETA' },
      { icon: 'calendar', label: 'Events', color: '#F44337', route: 'Events' },
      { icon: 'flag', label: 'Pages', color: '#FF9800', route: 'Pages' },
      { icon: 'people-circle', label: 'Groups', color: '#4CAF50', route: 'Groups' },
      { icon: 'code-working', label: 'Luma Game Engine', color: '#2196F3', route: 'GameEngine' },
    ],
  },
  {
    title: 'Safety & Content',
    items: [
      { icon: 'shield-checkmark', label: 'Age Verification', color: '#00C853', action: 'age-verification' },
      { icon: 'flag', label: 'Report Content', color: '#FF9800', action: 'report-content' },
      { icon: 'lock-closed', label: 'Privacy Controls', color: '#2196F3', action: 'privacy-controls' },
      { icon: 'document-text', label: 'Community Guidelines', color: '#9C27B0', action: 'community-guidelines' },
      { icon: 'construct', label: 'Moderation Tools', color: '#E91E63', action: 'moderation-tools' },
      { icon: 'warning', label: 'NSFW Content', color: '#FF6B6B', action: 'nsfw-content' },
    ],
  },
  {
    title: 'Personal Settings',
    items: [
      { icon: 'person-circle', label: 'Profile Settings', color: '#667eea', action: 'profile-settings' },
      { icon: 'notifications', label: 'Notifications', color: '#FF6B6B', action: 'notifications' },
      { icon: 'shield', label: 'Account Security', color: '#00C853', action: 'account-security' },
      { icon: 'card', label: 'Subscription & Billing', color: '#FFA726', action: 'subscription' },
      { icon: 'analytics', label: 'Data & Analytics', color: '#9C27B0', action: 'data-analytics' },
      { icon: 'download', label: 'Download Data', color: '#2196F3', action: 'download-data' },
      { icon: 'settings', label: 'Settings & privacy', chevron: true, route: 'Settings' },
      { icon: 'help-circle', label: 'Help & support', chevron: true, route: 'Help' },
      { icon: 'headset', label: 'Customer Support', chevron: true, route: 'CustomerService', color: '#667eea' },
      { icon: 'moon', label: 'Display & accessibility', chevron: true, route: 'Display' },
      { icon: 'log-out', label: 'Log Out', color: '#FF3B30', route: 'LogOut' },
    ],
  },
];

interface MenuItemProps {
  icon: string;
  label: string;
  color?: string;
  chevron?: boolean;
  fullWidth?: boolean;
  route?: keyof RootStackParamList;
  action?: string;
  onPress?: () => void;
  badge?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  icon, 
  label, 
  color, 
  chevron, 
  fullWidth,
  route,
  action,
  onPress,
  badge
}) => {
  const navigation = useNavigation<MenuScreenNavigationProp>();
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    
    if (action) {
      // Handle safety and content actions in parent component
      onPress && onPress();
      return;
    }
    
    if (route) {
      if (route === 'LogOut') {
        // This will be handled by the parent component
        return;
      }
      navigation.navigate(route);
    }
  };

  const iconContainerStyle = [
    styles.iconContainer,
    color ? { backgroundColor: `${color}15` } : undefined,
    isPressed && styles.iconContainerPressed,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        fullWidth && styles.menuItemFullWidth,
        pressed && styles.menuItemPressed,
      ]}
      onPress={handlePress}
      android_ripple={Platform.select({
        android: { color: 'rgba(0, 0, 0, 0.1)' },
        default: undefined,
      })}
    >
      <View style={styles.menuItemContent}>
        <View style={iconContainerStyle}>
          <Ionicons
            name={icon as any}
            size={22}
            color={color || '#1a1a1a'}
          />
        </View>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[
            styles.menuItemLabel,
            isPressed && styles.menuItemLabelPressed
          ]}>
            {label}
          </Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
      </View>
      {chevron && (
        <Ionicons name="chevron-forward" size={20} color="#1a1a1a" />
      )}
    </Pressable>
  );
};

export const MenuScreen: React.FC = () => {
  const navigation = useNavigation<MenuScreenNavigationProp>();
  const { currentMood, getMoodDescription } = useMood();
  const { logout, user, updateUser } = useAuth();
  const [showMoodControl, setShowMoodControl] = useState(false);
  const [showAIAgents, setShowAIAgents] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<typeof AI_AGENTS[0] | null>(null);
  
  // Safety & Content modals
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showContentReport, setShowContentReport] = useState(false);
  const [showPrivacyControls, setShowPrivacyControls] = useState(false);
  const [showCommunityGuidelines, setShowCommunityGuidelines] = useState(false);
  const [showModerationTools, setShowModerationTools] = useState(false);
  const [showNSFWWarning, setShowNSFWWarning] = useState(false);

  // Personal modals
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountSecurity, setShowAccountSecurity] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showDataAnalytics, setShowDataAnalytics] = useState(false);
  const [showDownloadData, setShowDownloadData] = useState(false);

  // Luma Music
  const [showLumaMusic, setShowLumaMusic] = useState(false);
  const [artistProfileVisible, setArtistProfileVisible] = useState(false);

  // CreatorHub 2.0
  const [showCreatorHub, setShowCreatorHub] = useState(false);
  const [showMonetizationDashboard, setShowMonetizationDashboard] = useState(false);
  
  // NSFW Controls
  const [showNSFWControls, setShowNSFWControls] = useState(false);
  
  // Baby AI
  const [showBabyAI, setShowBabyAI] = useState(false);
  
  // Loved Ones
  const [showLovedOnes, setShowLovedOnes] = useState(false);
  const [showLumaBank, setShowLumaBank] = useState(false);
  const [showLumaShop, setShowLumaShop] = useState(false);
  const [showAppleGooglePay, setShowAppleGooglePay] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [showAboutGen1, setShowAboutGen1] = useState(false);
  const [showSoftwareUpdate, setShowSoftwareUpdate] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(UPDATE_INFO);
  const [autoUpdateService] = useState(() => AutoUpdateService.getInstance());

  // Add state for update error and completion
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateComplete, setUpdateComplete] = useState(false);
  const [storeUpdateService] = useState(() => StoreUpdateService.getInstance());
  const [storeUpdateInfo, setStoreUpdateInfo] = useState(storeUpdateService.getUpdateInfo());

  // Initialize auto-update service
  useEffect(() => {
    // Load current update info
    const currentInfo = autoUpdateService.getUpdateInfo();
    setUpdateInfo(prev => ({ ...prev, ...currentInfo }));

    // Listen for progress updates
    const handleProgressUpdate = (progress: UpdateProgress) => {
      setUpdateProgress(progress.progress);
      setIsUpdating(progress.status === 'downloading' || progress.status === 'installing');
    };

    autoUpdateService.addProgressListener(handleProgressUpdate);

    // Check for updates on mount
    autoUpdateService.checkForUpdatesInBackground();

    return () => {
      autoUpdateService.removeProgressListener(handleProgressUpdate);
    };
  }, [autoUpdateService]);

  const handleMoodControlPress = () => {
    setShowMoodControl(true);
  };

  const handleAIAgentsPress = () => {
    setShowAIAgents(true);
  };

  const handleAgentSelect = (agent: typeof AI_AGENTS[0]) => {
    setSelectedAgent(agent);
    Alert.alert(
      `Chat with ${agent.name}`,
      `Start a conversation with ${agent.name}? This AI specializes in ${agent.specialty.toLowerCase()}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Chat', 
          onPress: () => {
            setShowAIAgents(false);
            // Here you would navigate to the chat screen
            console.log(`Starting chat with ${agent.name}`);
          }
        },
      ]
    );
  };

  // Safety & Content handlers
  const handleSafetyAction = (action: string) => {
    switch (action) {
      case 'age-verification':
        setShowAgeVerification(true);
        break;
      case 'report-content':
        setShowContentReport(true);
        break;
      case 'privacy-controls':
        setShowPrivacyControls(true);
        break;
      case 'community-guidelines':
        setShowCommunityGuidelines(true);
        break;
      case 'moderation-tools':
        setShowModerationTools(true);
        break;
      case 'nsfw-content':
        setShowNSFWControls(true);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  // Personal handlers
  const handlePersonalAction = (action: string) => {
    switch (action) {
      case 'profile-settings':
        setShowProfileSettings(true);
        break;
      case 'notifications':
        setShowNotifications(true);
        break;
      case 'account-security':
        setShowAccountSecurity(true);
        break;
      case 'subscription':
        setShowSubscription(true);
        break;
      case 'data-analytics':
        setShowDataAnalytics(true);
        break;
      case 'download-data':
        setShowDownloadData(true);
        break;
      default:
        console.log(`Unknown personal action: ${action}`);
    }
  };

  // Luma Music handlers
  const handleMusicAction = (action: string) => {
    switch (action) {
      case 'luma-music':
      case 'music-discover':
        setShowLumaMusic(true);
        break;
          case 'music-profile':
      setArtistProfileVisible(true);
      break;
      case 'music-studio':
        Alert.alert('Music Studio', 'Music creation tools coming soon!');
        break;
      case 'music-collabs':
        Alert.alert('Collaborations', 'Find and connect with other artists!');
        break;
      case 'music-live':
        Alert.alert('Live Sessions', 'Go live and share your music!');
        break;
      case 'music-trending':
        setShowLumaMusic(true);
        break;
      default:
        console.log(`Unknown music action: ${action}`);
    }
  };

  // CreatorHub 2.0 handlers
  const handleCreatorHubAction = (action: string) => {
    switch (action) {
      case 'creator-hub':
        setShowCreatorHub(true);
        break;
      case 'content-studio':
        Alert.alert('Content Studio', '🎬 Create, edit, and publish your content with our professional studio tools!');
        break;
      case 'creator-analytics':
        Alert.alert('Creator Analytics', '📊 Deep insights into your content performance, audience engagement, and growth metrics!');
        break;
      case 'monetization':
        setShowMonetizationDashboard(true);
        break;
      case 'growth-tools':
        Alert.alert('Growth Tools', '📈 AI-powered tools to optimize your content strategy and reach more fans!');
        break;
      case 'audience-insights':
        Alert.alert('Audience Insights', '👥 Understand your audience demographics, interests, and behavior patterns!');
        break;
      case 'brand-partnerships':
        Alert.alert('Brand Partnerships', '🤝 Connect with brands for sponsorship opportunities and collaborations!');
        break;
      case 'creator-academy':
        Alert.alert('Creator Academy', '🎓 Learn from top creators with courses, workshops, and masterclasses!');
        break;
      case 'creator-store':
        Alert.alert('Creator Store', '🛍️ Sell merchandise, digital products, and exclusive content to your fans!');
        break;
      case 'live-streaming':
        Alert.alert('Live Streaming', '📺 Go live with advanced streaming tools, interactive features, and audience management!');
        break;
      case 'creator-support':
        Alert.alert('Creator Support', '🆘 24/7 dedicated support for creators with priority assistance and resources!');
        break;
      default:
        console.log(`Unknown CreatorHub action: ${action}`);
    }
  };

  // Logout handler
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
            logout();
          }
        },
      ]
    );
  };

  // Add handler for Luma Bank
  const handleLumaBank = () => setShowLumaBank(true);
  const handleLumaShop = () => setShowLumaShop(true);
  const handleAppleGooglePay = () => setShowAppleGooglePay(true);
  const handleSubscriptions = () => setShowSubscriptions(true);
  
  // Software Update handlers
  const handleSoftwareUpdate = () => {
    setShowSoftwareUpdate(true);
  };

  const handleGen2ComingSoon = () => {
    navigation.navigate('Gen2ComingSoon');
  };

  const handleAppStoreUpdate = async () => {
    if (Platform.OS === 'ios') {
      try {
        await storeUpdateService.checkForStoreUpdates();
        await storeUpdateService.openStoreWithUpdatePrompt();
      } catch (error) {
        console.log('Error checking store updates:', error);
        Alert.alert('Error', 'Failed to check for store updates. Please try again.');
      }
    } else {
      Alert.alert('App Store Update', 'This feature is only available on iOS devices.');
    }
  };

  const handleGooglePlayUpdate = async () => {
    if (Platform.OS === 'android') {
      try {
        await storeUpdateService.checkForStoreUpdates();
        await storeUpdateService.openStoreWithUpdatePrompt();
      } catch (error) {
        console.log('Error checking store updates:', error);
        Alert.alert('Error', 'Failed to check for store updates. Please try again.');
      }
    } else {
      Alert.alert('Google Play Update', 'This feature is only available on Android devices.');
    }
  };

  const startUpdate = async () => {
    setUpdateError(null);
    setUpdateComplete(false);
    try {
      await autoUpdateService.startUpdate();
      // Update local state
      const newInfo = autoUpdateService.getUpdateInfo();
      setUpdateInfo(prev => ({ ...prev, ...newInfo }));
      setUpdateComplete(true);
      setTimeout(() => setShowSoftwareUpdate(false), 2000);
    } catch (error: any) {
      setUpdateError(error?.message || 'There was an error updating the app. Please try again.');
    }
  };

  const checkForUpdates = async () => {
    try {
      // Show loading state
      Alert.alert('Checking for Updates', 'Please wait while we check for the latest Gen 1 updates...');
      
      // Use manual check that respects dismissed state
      await autoUpdateService.manualCheckForUpdates();
      
      // Update local state
      const newInfo = autoUpdateService.getUpdateInfo();
      setUpdateInfo(prev => ({ ...prev, ...newInfo }));
      
      console.log('Update check result:', newInfo);
      
      if (autoUpdateService.shouldShowNotification()) {
        Alert.alert(
          'Update Available! 🚀',
          `A new version of Luma Gen 1 is available!\n\nVersion: ${newInfo.newVersion}\nSize: ${newInfo.size}\n\nFeatures:\n${newInfo.features.slice(0, 3).map(f => `• ${f}`).join('\n')}`,
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Update Now', onPress: () => setShowSoftwareUpdate(true) }
          ]
        );
      } else {
        Alert.alert(
          'No Updates Available',
          'You\'re running the latest version of Luma Gen 1!\n\nCurrent Version: ' + newInfo.version,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Error checking for updates:', error);
      Alert.alert('Error', 'Failed to check for updates. Please try again.');
    }
  };

  const resetDismissedState = async () => {
    try {
      await autoUpdateService.resetDismissedState();
      Alert.alert('Reset Complete', 'Update notification dismissed state has been reset. You can now see update notifications again.');
    } catch (error) {
      console.log('Error resetting dismissed state:', error);
      Alert.alert('Error', 'Failed to reset dismissed state. Please try again.');
    }
  };

  const checkDismissedState = () => {
    const isDismissed = autoUpdateService.isNotificationDismissed();
    const hasNewVersion = autoUpdateService.hasNewVersion();
    const shouldShow = autoUpdateService.shouldShowNotification();
    Alert.alert(
      'Update State', 
      `Dismissed: ${isDismissed ? 'YES' : 'NO'}\nNew Version: ${hasNewVersion ? 'YES' : 'NO'}\nShould Show: ${shouldShow ? 'YES' : 'NO'}`
    );
  };

  const simulateNewVersion = async () => {
    try {
      // Force a new version to be available
      autoUpdateService.forceUpdateAvailable();
      Alert.alert('New Version Simulated', 'A new version has been simulated. Check the update notification!');
    } catch (error) {
      console.log('Error simulating new version:', error);
      Alert.alert('Error', 'Failed to simulate new version. Please try again.');
    }
  };

  const viewUpdateLog = () => {
    const whatsNew = autoUpdateService.getWhatsNew();
    const logText = `New Features:\n${whatsNew.newFeatures.map(f => `• ${f}`).join('\n')}\n\nBug Fixes:\n${whatsNew.bugFixes.map(f => `• ${f}`).join('\n')}\n\nLayout Fixes:\n${whatsNew.layoutFixes.map(f => `• ${f}`).join('\n')}`;
    Alert.alert('Update Log', logText);
  };

  // Luma Card actions
  const handleLumaCardPayout = () => {
    if (!user) return;
    if (user.lumaCardBalance < 100) {
      Alert.alert('Insufficient Funds', 'You need at least $100 to payout.');
      return;
    }
    const newBalance = user.lumaCardBalance - 100;
    updateUser({ ...user, lumaCardBalance: newBalance });
    Alert.alert('Payout Successful', 'You have withdrawn $100 from your Luma Card!');
  };
  const handleLumaCardShop = () => {
    if (!user) return;
    if (user.lumaCardBalance < 50) {
      Alert.alert('Insufficient Funds', 'You need at least $50 to shop.');
      return;
    }
    const newBalance = user.lumaCardBalance - 50;
    updateUser({ ...user, lumaCardBalance: newBalance });
    Alert.alert('Purchase Successful', 'You spent $50 in the Luma Shop!');
  };

  // Add handler for updating profile picture
  const handleUpdateProfilePic = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newAvatar = result.assets[0].uri;
      updateUser({ ...user, avatar: newAvatar });
    }
  };

  const renderAIAgent = (agent: typeof AI_AGENTS[0]) => (
    <TouchableOpacity
      key={agent.id}
      style={styles.agentCard}
      onPress={() => handleAgentSelect(agent)}
    >
      <LinearGradient
        colors={[`${agent.color}15`, `${agent.color}05`]}
        style={styles.agentGradient}
      >
        <View style={styles.agentHeader}>
          <View style={styles.agentAvatarContainer}>
            <Image source={{ uri: agent.avatar }} style={styles.agentAvatar} />
            <View style={[styles.statusIndicator, { backgroundColor: agent.status === 'online' ? '#00C853' : '#FF9800' }]} />
          </View>
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>{agent.name}</Text>
            <Text style={styles.agentSpecialty}>{agent.specialty}</Text>
          </View>
          <View style={[styles.agentIcon, { backgroundColor: `${agent.color}20` }]}>
            <Ionicons name={agent.icon as any} size={20} color={agent.color} />
          </View>
        </View>
        <Text style={styles.agentDescription}>{agent.description}</Text>
        <View style={styles.agentStats}>
          <View style={styles.statItem}>
            <Ionicons name="chatbubbles" size={14} color="#65676b" />
            <Text style={styles.statText}>{agent.conversations}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.statText}>{agent.rating}</Text>
          </View>
          <Text style={[styles.statusText, { color: agent.status === 'online' ? '#00C853' : '#FF9800' }]}>
            {agent.status}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Agents Preview, Mood Section, and Menu Sections */}
        <View style={{ flex: 1 }}>
        {/* Gen 1 Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerText}>Gen 1 Menu</Text>
            <View style={styles.gen1Badge}>
              <Ionicons name="rocket" size={scale(12)} color="#fff" />
              <Text style={styles.gen1BadgeText}>GEN 1</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleUpdateProfilePic}>
            <Image
              source={{ uri: (user as any)?.profilePicture || 'https://i.pravatar.cc/150?u=user' }}
              style={styles.profileImage}
            />
        </TouchableOpacity>
      </View>

        {/* Gen 1 Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Gen 1 Status</Text>
          <View style={styles.gen1StatusCard}>
            <View style={styles.gen1StatusRow}>
              <View style={styles.gen1StatusItem}>
                <Ionicons name="checkmark-circle" size={scale(20)} color="#00C853" />
                <Text style={styles.gen1StatusLabel}>Version {UPDATE_INFO.version}</Text>
                </View>
              <View style={styles.gen1StatusItem}>
                <Ionicons name="wifi" size={scale(20)} color="#4CAF50" />
                <Text style={styles.gen1StatusLabel}>Online</Text>
                  </View>
                </View>
            <View style={styles.gen1StatusRow}>
              <View style={styles.gen1StatusItem}>
                <Ionicons name="sparkles" size={scale(20)} color="#FFD700" />
                <Text style={styles.gen1StatusLabel}>AI Active</Text>
              </View>
              <View style={styles.gen1StatusItem}>
                <Ionicons name="cube" size={scale(20)} color="#667eea" />
                <Text style={styles.gen1StatusLabel}>4D Ready</Text>
          </View>
        </View>
          </View>
        </View>

        {/* Gen 1 AI Agents Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🚀 Gen 1 AI Power</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={handleAIAgentsPress}
            >
              <Text style={styles.viewAllText}>Explore All</Text>
              <Ionicons name="chevron-forward" size={scale(18)} color="#667eea" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.aiAgentsPreview}>
            {AI_AGENTS.slice(0, 2).map(agent => (
              <TouchableOpacity
                key={agent.id}
                style={styles.agentPreviewCard}
                onPress={() => handleAgentSelect(agent)}
              >
                <LinearGradient
                  colors={[`${agent.color}15`, `${agent.color}05`]}
                  style={styles.agentPreviewGradient}
                >
                  <View style={styles.agentPreviewHeader}>
                    <View style={styles.agentPreviewAvatarContainer}>
                      <Image source={{ uri: agent.avatar }} style={styles.agentPreviewAvatar} />
                      <View style={[styles.statusIndicator, { backgroundColor: agent.status === 'online' ? '#00C853' : '#FF9800' }]} />
                    </View>
                    <View style={[styles.agentPreviewIcon, { backgroundColor: `${agent.color}20` }]}>
                      <Ionicons name={agent.icon as any} size={16} color={agent.color} />
                    </View>
                  </View>
                  <Text style={styles.agentPreviewName}>{agent.name}</Text>
                  <Text style={styles.agentPreviewSpecialty}>{agent.specialty}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Mood Display */}
        <View style={styles.moodSection}>
          <Text style={styles.sectionTitle}>🎭 Your Mood</Text>
          <View style={styles.moodCard}>
            <View style={styles.moodInfo}>
              <Text style={styles.moodEmoji}>
                {currentMood === 'happy' ? '🌟' : 
                 currentMood === 'calm' ? '🌊' :
                 currentMood === 'energetic' ? '⚡' :
                 currentMood === 'focused' ? '🎯' :
                 currentMood === 'creative' ? '🎨' :
                 currentMood === 'social' ? '🤝' :
                 currentMood === 'relaxed' ? '😌' : '📈'}
              </Text>
              <View style={styles.moodText}>
                <Text style={styles.moodName}>{currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}</Text>
                <Text style={styles.moodDescription}>{getMoodDescription()}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.moodControlButton}
              onPress={handleMoodControlPress}
            >
              <Ionicons name="settings" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Render all menu sections, not just 'All shortcuts' */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuGrid}>
              {section.items.map((item) => (
                <MenuItem
                  key={item.label}
                  {...item}
                  fullWidth={false}
                  route={item.route as keyof RootStackParamList}
                  onPress={
                    item.route === 'MoodControl'
                      ? handleMoodControlPress
                      : item.route === 'LogOut'
                        ? handleLogout
                        : item.action === 'luma-card'
                          ? handleLumaBank
                        : item.action === 'luma-shop'
                          ? handleLumaShop
                        : item.action === 'apple-google-pay'
                          ? handleAppleGooglePay
                        : item.action === 'subscriptions'
                          ? handleSubscriptions
                        : item.action === 'baby-ai'
                          ? () => setShowBabyAI(true)
                        : item.action === 'loved-ones'
                          ? () => setShowLovedOnes(true)
                        : item.action === 'luma-music'
                          ? () => setShowLumaMusic(true)
                        : item.action === 'about-gen1'
                          ? () => setShowAboutGen1(true)
                        : item.action === 'software-update'
                          ? handleSoftwareUpdate
                        : item.action === 'system-requirements'
                          ? () => navigation.navigate('SystemRequirements')
                        : item.action === 'app-store-update'
                          ? handleAppStoreUpdate
                        : item.action === 'google-play-update'
                          ? handleGooglePlayUpdate
                          : item.action === 'gen2-coming-soon'
                            ? handleGen2ComingSoon
                            : item.action
                              ? () => handlePersonalAction(item.action!)
                              : undefined
                  }
                />
              ))}
            </View>
          </View>
        ))}
            </View>
          </ScrollView>
      {/* ... existing modals ... */}
      
      {/* Software Update Modal */}
      <Modal 
        visible={showSoftwareUpdate} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSoftwareUpdate(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🚀 Software Update</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSoftwareUpdate(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.updateInfoCard}>
              <View style={styles.updateHeader}>
                <Ionicons name="rocket" size={32} color="#667eea" />
                <Text style={styles.updateTitle}>Gen 1 Update Available</Text>
                <Text style={styles.updateVersion}>Version {UPDATE_INFO.newVersion}</Text>
                <Text style={styles.updateSize}>{UPDATE_INFO.size}</Text>
              </View>
              
              <View style={styles.updateFeatures}>
                <Text style={styles.updateFeaturesTitle}>🎯 New Features:</Text>
                {UPDATE_INFO.features.map((feature, index) => (
                  <View key={index} style={styles.updateFeatureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#00C853" />
                    <Text style={styles.updateFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              {updateError && (
                <View style={styles.updateError}>
                  <Ionicons name="warning" size={20} color="#FF6B6B" />
                  <Text style={styles.updateErrorText}>{updateError}</Text>
                </View>
              )}
              
              {updateComplete && (
                <View style={styles.updateSuccess}>
                  <Ionicons name="checkmark-circle" size={20} color="#00C853" />
                  <Text style={styles.updateSuccessText}>Update completed successfully!</Text>
                </View>
              )}
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.checkUpdateButton}
              onPress={checkForUpdates}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.checkUpdateText}>Check for Updates</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.fullUpdateButton}
              onPress={() => {
                setShowSoftwareUpdate(false);
                navigation.navigate('UpdateScreen', { updateInfo });
              }}
            >
              <Ionicons name="settings" size={20} color="#fff" />
              <Text style={styles.fullUpdateText}>Full Update</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.updateButton,
                updateComplete && styles.updateButtonDisabled
              ]}
              onPress={startUpdate}
              disabled={updateComplete}
            >
              <Ionicons name="cloud-download" size={20} color="#fff" />
              <Text style={styles.updateButtonText}>
                {updateComplete ? 'Update Complete' : 'Update Now'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.testButton}
              onPress={resetDismissedState}
            >
              <Ionicons name="refresh-circle" size={20} color="#fff" />
              <Text style={styles.testButtonText}>Reset Dismissed</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: '#9C27B0' }]}
              onPress={checkDismissedState}
            >
              <Ionicons name="information-circle" size={20} color="#fff" />
              <Text style={styles.testButtonText}>Check State</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: '#E91E63' }]}
              onPress={simulateNewVersion}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.testButtonText}>Simulate New Version</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: '#607D8B' }]}
              onPress={viewUpdateLog}
            >
              <Ionicons name="document-text" size={20} color="#fff" />
              <Text style={styles.testButtonText}>View Update Log</Text>
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
    backgroundColor: '#f8f9fa',
  }),
  header: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
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
  profileImage: responsiveStyle({
    width: 40,
    height: 40,
    borderRadius: 20,
  }),
  menuSection: responsiveStyle({
    paddingHorizontal: 20,
    marginBottom: 25,
    }),
  sectionTitle: responsiveStyle({
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    marginTop: 12,
    letterSpacing: -0.2,
  }),
  menuItem: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    }),
  menuItemLeft: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  menuIcon: responsiveStyle({
    marginRight: 15,
  }),
  menuText: responsiveStyle({
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  }),
  menuArrow: responsiveStyle({
    color: '#888',
  }),
  premiumBadge: responsiveStyle({
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  }),
  premiumText: responsiveStyle({
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  }),
  logoutButton: responsiveStyle({
    backgroundColor: '#ff4444',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  }),
  logoutText: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }),
  iconContainer: responsiveStyle({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
  }),
  iconContainerPressed: responsiveStyle({
    transform: [{ scale: 0.95 }],
  }),
  menuItemFullWidth: responsiveStyle({
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  menuItemPressed: responsiveStyle({
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  }),
  menuItemContent: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  }),
  menuItemLabel: responsiveStyle({
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    letterSpacing: -0.1,
  }),
  menuItemLabelPressed: responsiveStyle({
    opacity: 0.7,
  }),
  badge: responsiveStyle({
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginLeft: 8,
  }),
  badgeText: responsiveStyle({
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  }),
  agentCard: responsiveStyle({
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  }),
  agentGradient: responsiveStyle({
    flex: 1,
    padding: 12,
    borderRadius: 8,
  }),
  agentHeader: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  }),
  agentAvatarContainer: responsiveStyle({
    position: 'relative',
  }),
  agentAvatar: responsiveStyle({
    width: 40,
    height: 40,
    borderRadius: 20,
  }),
  statusIndicator: responsiveStyle({
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  }),
  agentInfo: responsiveStyle({
    flex: 1,
    marginLeft: 12,
  }),
  agentName: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
  }),
  agentSpecialty: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
  }),
  agentIcon: responsiveStyle({
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  agentDescription: responsiveStyle({
    fontSize: 14,
    color: '#65676b',
  }),
  agentStats: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  }),
  statItem: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  }),
  statText: responsiveStyle({
    fontSize: 12,
    color: '#65676b',
    fontWeight: '500',
  }),
  statusText: responsiveStyle({
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  }),
  section: responsiveStyle({
    paddingHorizontal: 20,
    marginBottom: 30,
  }),
  sectionHeader: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  }),
  viewAllButton: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  }),
  viewAllText: responsiveStyle({
    fontSize: 16,
    color: '#667eea',
    fontWeight: '700',
  }),
  aiAgentsPreview: responsiveStyle({
    flexDirection: 'row',
    gap: 16,
  }),
  agentPreviewCard: responsiveStyle({
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  }),
  agentPreviewGradient: responsiveStyle({
    padding: 20,
    borderRadius: 16,
  }),
  agentPreviewHeader: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  }),
  agentPreviewAvatarContainer: responsiveStyle({
    position: 'relative',
  }),
  agentPreviewAvatar: responsiveStyle({
    width: 32,
    height: 32,
    borderRadius: 16,
  }),
  agentPreviewIcon: responsiveStyle({
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  agentPreviewName: responsiveStyle({
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  }),
  agentPreviewSpecialty: responsiveStyle({
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  }),
  moodSection: responsiveStyle({
    paddingHorizontal: 20,
    marginBottom: 20,
  }),
  moodCard: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
        shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    }),
  moodInfo: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  }),
  moodEmoji: responsiveStyle({
    fontSize: 28,
    marginRight: 14,
  }),
  moodText: responsiveStyle({
    flex: 1,
  }),
  moodName: responsiveStyle({
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 3,
  }),
  moodDescription: responsiveStyle({
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  }),
  moodControlButton: responsiveStyle({
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#667eea',
  }),
  menuGrid: responsiveStyle({
    gap: 10,
  }),
  gen1StatusCard: responsiveStyle({
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  }),
  gen1StatusRow: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  }),
  gen1StatusItem: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  }),
  gen1StatusLabel: responsiveStyle({
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  }),
  modalContainer: responsiveStyle({
    flex: 1,
    backgroundColor: '#f8f9fa',
  }),
  modalHeader: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  }),
  modalTitle: responsiveStyle({
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  }),
  closeButton: responsiveStyle({
    padding: 10,
  }),
  modalContent: responsiveStyle({
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  }),
  updateInfoCard: responsiveStyle({
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  }),
  updateHeader: responsiveStyle({
    alignItems: 'center',
    marginBottom: 15,
  }),
  updateTitle: responsiveStyle({
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 10,
  }),
  updateVersion: responsiveStyle({
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  }),
  updateSize: responsiveStyle({
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  }),
  updateFeatures: responsiveStyle({
    marginBottom: 20,
  }),
  updateFeaturesTitle: responsiveStyle({
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  }),
  updateFeatureItem: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  }),
  updateFeatureText: responsiveStyle({
    fontSize: 14,
    color: '#333',
  }),
  updateError: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FFEEBA',
  }),
  updateErrorText: responsiveStyle({
    fontSize: 14,
    color: '#856404',
    flex: 1,
  }),
  updateSuccess: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D4EDDA',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#C6EFCE',
  }),
  updateSuccessText: responsiveStyle({
    fontSize: 14,
    color: '#155724',
    flex: 1,
  }),
  modalFooter: responsiveStyle({
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'column',
    gap: 10,
  }),
  checkUpdateButton: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  }),
  checkUpdateText: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }),
  updateButton: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00C853',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  }),
  updateButtonText: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }),
  updateButtonDisabled: responsiveStyle({
    opacity: 0.7,
  }),
  fullUpdateButton: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  }),
  fullUpdateText: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }),
  testButton: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  }),
  testButtonText: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }),
}); 