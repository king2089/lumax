import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ProfileSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profileData: ProfileData) => void;
  currentProfile: ProfileData;
}

interface ProfileData {
  displayName: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  birthday: string;
  gender: string;
  pronouns: string;
  avatar: string;
  coverPhoto: string;
  isPrivate: boolean;
  showOnlineStatus: boolean;
  allowTagging: boolean;
  showBirthday: boolean;
  isVerified: boolean;
  lumaCardBalance: number;
  socialLinks: {
    twitter: string;
    instagram: string;
    tiktok: string;
    youtube: string;
  };
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  visible,
  onClose,
  onSave,
  currentProfile,
}) => {
  const [profile, setProfile] = useState<ProfileData>(currentProfile);
  const [activeSection, setActiveSection] = useState<string>('basic');

  const updateProfile = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const updateSocialLinks = <K extends keyof ProfileData['socialLinks']>(
    key: K,
    value: ProfileData['socialLinks'][K]
  ) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value }
    }));
  };

  const handleSave = () => {
    if (!profile.displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }
    
    if (!profile.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    onSave(profile);
    Alert.alert('✅ Profile Updated', 'Your profile has been saved successfully!');
  };

  const renderBasicInfo = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>👤 Basic Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Display Name *</Text>
        <TextInput
          style={styles.textInput}
          value={profile.displayName}
          onChangeText={(text) => updateProfile('displayName', text)}
          placeholder="Your display name"
          maxLength={50}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Username *</Text>
        <TextInput
          style={styles.textInput}
          value={profile.username}
          onChangeText={(text) => updateProfile('username', text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          placeholder="username"
          maxLength={30}
        />
        <Text style={styles.inputHint}>Only lowercase letters, numbers, and underscores</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Bio</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaInput]}
          value={profile.bio}
          onChangeText={(text) => updateProfile('bio', text)}
          placeholder="Tell people about yourself..."
          multiline
          numberOfLines={4}
          maxLength={200}
        />
        <Text style={styles.characterCount}>{profile.bio.length}/200</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Location</Text>
        <TextInput
          style={styles.textInput}
          value={profile.location}
          onChangeText={(text) => updateProfile('location', text)}
          placeholder="City, Country"
          maxLength={50}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Website</Text>
        <TextInput
          style={styles.textInput}
          value={profile.website}
          onChangeText={(text) => updateProfile('website', text)}
          placeholder="https://yourwebsite.com"
          keyboardType="url"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderPersonalDetails = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>🎂 Personal Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Birthday</Text>
        <TextInput
          style={styles.textInput}
          value={profile.birthday}
          onChangeText={(text) => updateProfile('birthday', text)}
          placeholder="MM/DD/YYYY"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Gender</Text>
        <TextInput
          style={styles.textInput}
          value={profile.gender}
          onChangeText={(text) => updateProfile('gender', text)}
          placeholder="How do you identify?"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Pronouns</Text>
        <TextInput
          style={styles.textInput}
          value={profile.pronouns}
          onChangeText={(text) => updateProfile('pronouns', text)}
          placeholder="they/them, she/her, he/him, etc."
        />
      </View>

      <View style={styles.toggleGroup}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Show Birthday on Profile</Text>
          <Text style={styles.toggleDescription}>Others can see your birthday</Text>
        </View>
        <Switch
          value={profile.showBirthday}
          onValueChange={(value) => updateProfile('showBirthday', value)}
          trackColor={{ false: '#ccc', true: '#667eea' }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );

  const renderSocialLinks = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>🔗 Social Links</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Twitter</Text>
        <TextInput
          style={styles.textInput}
          value={profile.socialLinks.twitter}
          onChangeText={(text) => updateSocialLinks('twitter', text)}
          placeholder="@username"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Instagram</Text>
        <TextInput
          style={styles.textInput}
          value={profile.socialLinks.instagram}
          onChangeText={(text) => updateSocialLinks('instagram', text)}
          placeholder="@username"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>TikTok</Text>
        <TextInput
          style={styles.textInput}
          value={profile.socialLinks.tiktok}
          onChangeText={(text) => updateSocialLinks('tiktok', text)}
          placeholder="@username"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>YouTube</Text>
        <TextInput
          style={styles.textInput}
          value={profile.socialLinks.youtube}
          onChangeText={(text) => updateSocialLinks('youtube', text)}
          placeholder="Channel URL or @handle"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderPrivacySettings = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>🔒 Privacy Settings</Text>
      
      <View style={styles.toggleGroup}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Private Account</Text>
          <Text style={styles.toggleDescription}>Only approved followers can see your posts</Text>
        </View>
        <Switch
          value={profile.isPrivate}
          onValueChange={(value) => updateProfile('isPrivate', value)}
          trackColor={{ false: '#ccc', true: '#667eea' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.toggleGroup}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Show Online Status</Text>
          <Text style={styles.toggleDescription}>Let others see when you're active</Text>
        </View>
        <Switch
          value={profile.showOnlineStatus}
          onValueChange={(value) => updateProfile('showOnlineStatus', value)}
          trackColor={{ false: '#ccc', true: '#667eea' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.toggleGroup}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Allow Tagging</Text>
          <Text style={styles.toggleDescription}>Others can tag you in posts and stories</Text>
        </View>
        <Switch
          value={profile.allowTagging}
          onValueChange={(value) => updateProfile('allowTagging', value)}
          trackColor={{ false: '#ccc', true: '#667eea' }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );

  const renderVerificationStatus = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>✅ Verification Status</Text>
      
      <View style={styles.verificationCard}>
        <View style={styles.verificationStatus}>
          <Ionicons
            name={profile.isVerified ? "checkmark-circle" : "time"}
            size={24}
            color={profile.isVerified ? "#00C853" : "#FFA726"}
          />
          <Text style={[
            styles.verificationText,
            { color: profile.isVerified ? "#00C853" : "#FFA726" }
          ]}>
            {profile.isVerified ? "Verified Account" : "Verification Pending"}
          </Text>
        </View>
        
        <Text style={styles.verificationDescription}>
          {profile.isVerified 
            ? "Your account has been verified and you have access to all premium features."
            : "Submit verification documents to get verified and unlock premium features."
          }
        </Text>

        {!profile.isVerified && (
          <TouchableOpacity style={styles.verificationButton}>
            <Ionicons name="document-attach" size={16} color="#667eea" />
            <Text style={styles.verificationButtonText}>Submit Verification</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const sections = [
    { id: 'basic', title: 'Basic Info', icon: 'person' },
    { id: 'personal', title: 'Personal', icon: 'heart' },
    { id: 'social', title: 'Social Links', icon: 'link' },
    { id: 'privacy', title: 'Privacy', icon: 'shield' },
    { id: 'verification', title: 'Verification', icon: 'checkmark-circle' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Settings</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.container}>
        <View style={styles.navigation}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.navButton,
                  activeSection === section.id && styles.navButtonActive
                ]}
                onPress={() => setActiveSection(section.id)}
              >
                <Ionicons
                  name={section.icon as any}
                  size={16}
                  color={activeSection === section.id ? "#667eea" : "#666"}
                />
                <Text style={[
                  styles.navButtonText,
                  activeSection === section.id && styles.navButtonTextActive
                ]}>
                  {section.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeSection === 'basic' && renderBasicInfo()}
          {activeSection === 'personal' && renderPersonalDetails()}
          {activeSection === 'social' && renderSocialLinks()}
          {activeSection === 'privacy' && renderPrivacySettings()}
          {activeSection === 'verification' && renderVerificationStatus()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  navigation: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  navButtonActive: {
    backgroundColor: '#e7f3ff',
  },
  navButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  navButtonTextActive: {
    color: '#667eea',
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  toggleGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  verificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  verificationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  verificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  verificationButtonText: {
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 6,
  },
}); 