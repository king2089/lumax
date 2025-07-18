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

interface PrivacyControlsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  allowTagging: boolean;
  allowLocationSharing: boolean;
  allowDataCollection: boolean;
  showInSearch: boolean;
  allowFriendRequests: boolean;
  allowCommentsFromStrangers: boolean;
  allowStoryViewing: 'everyone' | 'friends' | 'nobody';
  twoFactorAuth: boolean;
  loginNotifications: boolean;
}

export const PrivacyControlsModal: React.FC<PrivacyControlsModalProps> = ({
  visible,
  onClose,
}) => {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'friends',
    allowDirectMessages: true,
    showOnlineStatus: true,
    allowTagging: true,
    allowLocationSharing: false,
    allowDataCollection: false,
    showInSearch: true,
    allowFriendRequests: true,
    allowCommentsFromStrangers: false,
    allowStoryViewing: 'friends',
    twoFactorAuth: false,
    loginNotifications: true,
  });

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    Alert.alert(
      'Privacy Settings Updated',
      'Your privacy preferences have been saved successfully.',
      [
        {
          text: 'OK',
          onPress: onClose,
        },
      ]
    );
  };

  const renderSettingItem = (
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

  const renderDropdownSetting = (
    title: string,
    description: string,
    icon: string,
    options: { value: string; label: string }[],
    currentValue: string,
    onSelect: (value: string) => void,
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
      </View>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              currentValue === option.value && styles.optionButtonSelected,
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                currentValue === option.value && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
            {currentValue === option.value && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
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
          <Text style={styles.headerTitle}>Privacy Controls</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Profile & Discovery</Text>
          
          {renderDropdownSetting(
            'Profile Visibility',
            'Who can see your profile information',
            'person-circle',
            [
              { value: 'public', label: 'Public' },
              { value: 'friends', label: 'Friends Only' },
              { value: 'private', label: 'Private' },
            ],
            settings.profileVisibility,
            (value) => updateSetting('profileVisibility', value),
            '#667eea'
          )}

          {renderSettingItem(
            'Show in Search',
            'Allow others to find you through search',
            'search',
            settings.showInSearch,
            (value) => updateSetting('showInSearch', value),
            '#4ECDC4'
          )}

          {renderSettingItem(
            'Show Online Status',
            'Let friends see when you\'re online',
            'radio-button-on',
            settings.showOnlineStatus,
            (value) => updateSetting('showOnlineStatus', value),
            '#00C853'
          )}

          <Text style={styles.sectionTitle}>Communication</Text>

          {renderSettingItem(
            'Allow Direct Messages',
            'Let others send you private messages',
            'chatbubble',
            settings.allowDirectMessages,
            (value) => updateSetting('allowDirectMessages', value),
            '#FF6B6B'
          )}

          {renderSettingItem(
            'Allow Friend Requests',
            'Let others send you friend requests',
            'people',
            settings.allowFriendRequests,
            (value) => updateSetting('allowFriendRequests', value),
            '#45B7D1'
          )}

          {renderSettingItem(
            'Comments from Strangers',
            'Allow non-friends to comment on your posts',
            'chatbubbles',
            settings.allowCommentsFromStrangers,
            (value) => updateSetting('allowCommentsFromStrangers', value),
            '#FF8E53'
          )}

          {renderDropdownSetting(
            'Story Viewing',
            'Who can view your stories',
            'film',
            [
              { value: 'everyone', label: 'Everyone' },
              { value: 'friends', label: 'Friends Only' },
              { value: 'nobody', label: 'Nobody' },
            ],
            settings.allowStoryViewing,
            (value) => updateSetting('allowStoryViewing', value),
            '#9C27B0'
          )}

          <Text style={styles.sectionTitle}>Content & Tagging</Text>

          {renderSettingItem(
            'Allow Tagging',
            'Let others tag you in posts and photos',
            'pricetag',
            settings.allowTagging,
            (value) => updateSetting('allowTagging', value),
            '#FFA726'
          )}

          <Text style={styles.sectionTitle}>Location & Data</Text>

          {renderSettingItem(
            'Location Sharing',
            'Share your location in posts and stories',
            'location',
            settings.allowLocationSharing,
            (value) => updateSetting('allowLocationSharing', value),
            '#E91E63'
          )}

          {renderSettingItem(
            'Data Collection',
            'Allow enhanced analytics and personalization',
            'analytics',
            settings.allowDataCollection,
            (value) => updateSetting('allowDataCollection', value),
            '#795548'
          )}

          <Text style={styles.sectionTitle}>Security</Text>

          {renderSettingItem(
            'Two-Factor Authentication',
            'Add an extra layer of security to your account',
            'shield-checkmark',
            settings.twoFactorAuth,
            (value) => updateSetting('twoFactorAuth', value),
            '#4CAF50'
          )}

          {renderSettingItem(
            'Login Notifications',
            'Get notified when someone logs into your account',
            'notifications',
            settings.loginNotifications,
            (value) => updateSetting('loginNotifications', value),
            '#2196F3'
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.saveGradient}
            >
              <Text style={styles.saveText}>Save Privacy Settings</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.disclaimerContainer}>
            <Ionicons name="information-circle" size={16} color="#888" />
            <Text style={styles.disclaimerText}>
              These settings help protect your privacy. Some features may be limited with strict privacy settings.
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
  optionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    gap: 4,
  },
  optionButtonSelected: {
    backgroundColor: '#4ECDC4',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  optionTextSelected: {
    color: '#fff',
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