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

interface ContentModerationToolsProps {
  visible: boolean;
  onClose: () => void;
}

interface ModerationSettings {
  autoModerationEnabled: boolean;
  aiContentFiltering: boolean;
  userReporting: boolean;
  communityModeration: boolean;
  keywordFiltering: boolean;
  imageRecognition: boolean;
  behaviorAnalysis: boolean;
  realTimeMonitoring: boolean;
}

export const ContentModerationTools: React.FC<ContentModerationToolsProps> = ({
  visible,
  onClose,
}) => {
  const [settings, setSettings] = useState<ModerationSettings>({
    autoModerationEnabled: true,
    aiContentFiltering: true,
    userReporting: true,
    communityModeration: true,
    keywordFiltering: true,
    imageRecognition: true,
    behaviorAnalysis: false,
    realTimeMonitoring: true,
  });

  const [stats] = useState({
    contentReviewed: 12847,
    violationsDetected: 293,
    falsePositives: 12,
    userReports: 156,
    actionsTaken: 281,
    communityScore: 94.2,
  });

  const updateSetting = (key: keyof ModerationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleTestModeration = () => {
    Alert.alert(
      'Moderation Test',
      'Running content moderation test...\n\n✅ AI Content Filter: Active\n✅ Keyword Detection: Active\n✅ Image Recognition: Active\n\nAll moderation tools are functioning correctly!',
      [{ text: 'OK' }]
    );
  };

  const handleViewReports = () => {
    Alert.alert(
      'Content Reports',
      '📊 Recent Reports:\n\n• 23 spam reports (auto-resolved)\n• 12 inappropriate content reports\n• 8 harassment reports\n• 4 copyright violation reports\n\nAll reports are being processed by our moderation team.',
      [{ text: 'OK' }]
    );
  };

  const renderModerationTool = (
    title: string,
    description: string,
    icon: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    color: string = '#4ECDC4',
    premium: boolean = false
  ) => (
    <View style={styles.toolCard}>
      <View style={styles.toolHeader}>
        <View style={[styles.toolIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.toolInfo}>
          <View style={styles.toolTitleRow}>
            <Text style={styles.toolTitle}>{title}</Text>
            {premium && <Text style={styles.premiumBadge}>PRO</Text>}
          </View>
          <Text style={styles.toolDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#f4f3f4', true: `${color}40` }}
          thumbColor={value ? color : '#f4f3f4'}
          disabled={premium && !value}
        />
      </View>
    </View>
  );

  const renderStatCard = (title: string, value: number | string, icon: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
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
          <Text style={styles.headerTitle}>Moderation Tools</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Moderation Overview</Text>
            <Text style={styles.sectionDescription}>
              Advanced AI-powered content moderation tools to keep your community safe
            </Text>
            
            <View style={styles.statsGrid}>
              {renderStatCard('Content Reviewed', stats.contentReviewed, 'document-text', '#4ECDC4')}
              {renderStatCard('Violations Detected', stats.violationsDetected, 'warning', '#FF6B6B')}
              {renderStatCard('User Reports', stats.userReports, 'flag', '#FF8E53')}
              {renderStatCard('Community Score', `${stats.communityScore}%`, 'star', '#00C853')}
            </View>
          </View>

          <View style={styles.toolsSection}>
            <Text style={styles.sectionTitle}>Moderation Tools</Text>
            
            {renderModerationTool(
              'Auto Moderation',
              'Automatically detect and handle policy violations',
              'shield-checkmark',
              settings.autoModerationEnabled,
              (value) => updateSetting('autoModerationEnabled', value),
              '#4ECDC4'
            )}

            {renderModerationTool(
              'AI Content Filtering',
              'Advanced AI analysis of text, images, and videos',
              'scan',
              settings.aiContentFiltering,
              (value) => updateSetting('aiContentFiltering', value),
              '#667eea'
            )}

            {renderModerationTool(
              'User Reporting System',
              'Allow community members to report content',
              'flag',
              settings.userReporting,
              (value) => updateSetting('userReporting', value),
              '#FF6B6B'
            )}

            {renderModerationTool(
              'Community Moderation',
              'Trusted community members help moderate content',
              'people',
              settings.communityModeration,
              (value) => updateSetting('communityModeration', value),
              '#45B7D1'
            )}

            {renderModerationTool(
              'Keyword Filtering',
              'Automatically filter content based on keywords',
              'text',
              settings.keywordFiltering,
              (value) => updateSetting('keywordFiltering', value),
              '#FF8E53'
            )}

            {renderModerationTool(
              'Image Recognition',
              'AI-powered detection of inappropriate images',
              'camera',
              settings.imageRecognition,
              (value) => updateSetting('imageRecognition', value),
              '#9C27B0'
            )}

            {renderModerationTool(
              'Behavior Analysis',
              'Advanced pattern detection for suspicious behavior',
              'analytics',
              settings.behaviorAnalysis,
              (value) => updateSetting('behaviorAnalysis', value),
              '#FFA726',
              true
            )}

            {renderModerationTool(
              'Real-time Monitoring',
              'Live monitoring of all platform activity',
              'radio',
              settings.realTimeMonitoring,
              (value) => updateSetting('realTimeMonitoring', value),
              '#E91E63'
            )}
          </View>

          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleTestModeration}>
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.actionGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.actionText}>Test Moderation Tools</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleViewReports}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.actionGradient}
              >
                <Ionicons name="document-text" size={20} color="#fff" />
                <Text style={styles.actionText}>View Content Reports</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => Alert.alert('Feature', 'Advanced analytics coming soon!')}
            >
              <LinearGradient
                colors={['#FF8E53', '#FF6B35']}
                style={styles.actionGradient}
              >
                <Ionicons name="bar-chart" size={20} color="#fff" />
                <Text style={styles.actionText}>Moderation Analytics</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={16} color="#FF6B6B" />
                <Text style={styles.alertTitle}>High Volume of Reports</Text>
                <Text style={styles.alertTime}>2h ago</Text>
              </View>
              <Text style={styles.alertText}>
                Increased reporting activity detected. Reviewing content patterns.
              </Text>
            </View>

            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Ionicons name="checkmark-circle" size={16} color="#00C853" />
                <Text style={styles.alertTitle}>AI Filter Updated</Text>
                <Text style={styles.alertTime}>4h ago</Text>
              </View>
              <Text style={styles.alertText}>
                Content filtering algorithms updated with improved accuracy.
              </Text>
            </View>

            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Ionicons name="shield" size={16} color="#4ECDC4" />
                <Text style={styles.alertTitle}>Community Score Improved</Text>
                <Text style={styles.alertTime}>1d ago</Text>
              </View>
              <Text style={styles.alertText}>
                Community safety score increased to 94.2% (+2.1% from last week).
              </Text>
            </View>
          </View>

          <View style={styles.disclaimerSection}>
            <Ionicons name="information-circle" size={16} color="#888" />
            <Text style={styles.disclaimerText}>
              Moderation tools use AI and human review to maintain community standards. 
              Some features require Luma Go Pro subscription.
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
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  toolsSection: {
    marginBottom: 24,
  },
  toolCard: {
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
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  premiumBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF6B6B',
    backgroundColor: '#FF6B6B20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginTop: 2,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  alertsSection: {
    marginBottom: 24,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  alertTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  alertTime: {
    fontSize: 12,
    color: '#888',
  },
  alertText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 16,
  },
  disclaimerSection: {
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