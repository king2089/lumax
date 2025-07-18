import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface CommunityGuidelinesModalProps {
  visible: boolean;
  onClose: () => void;
}

const GUIDELINES = [
  {
    id: 'respect',
    title: 'Be Respectful',
    icon: 'heart',
    color: '#FF6B6B',
    description: 'Treat everyone with kindness and respect',
    rules: [
      'No harassment, bullying, or hate speech',
      'Respect different opinions and perspectives',
      'Use inclusive language',
      'Be constructive in your criticism',
    ],
  },
  {
    id: 'authentic',
    title: 'Stay Authentic',
    icon: 'checkmark-circle',
    color: '#4ECDC4',
    description: 'Be genuine and honest in your interactions',
    rules: [
      'Don\'t impersonate others',
      'Share original content when possible',
      'Be honest about sponsored content',
      'Don\'t create fake accounts',
    ],
  },
  {
    id: 'safety',
    title: 'Keep it Safe',
    icon: 'shield-checkmark',
    color: '#00C853',
    description: 'Help maintain a safe environment for everyone',
    rules: [
      'No sharing of personal information',
      'Report suspicious or harmful content',
      'Don\'t engage in dangerous challenges',
      'Protect minors from inappropriate content',
    ],
  },
  {
    id: 'legal',
    title: 'Follow the Law',
    icon: 'library',
    color: '#2196F3',
    description: 'Comply with all applicable laws and regulations',
    rules: [
      'No illegal activities or content',
      'Respect intellectual property rights',
      'Don\'t share copyrighted material without permission',
      'No spam or fraudulent activities',
    ],
  },
  {
    id: 'content',
    title: 'Appropriate Content',
    icon: 'eye',
    color: '#9C27B0',
    description: 'Share content that\'s appropriate for all users',
    rules: [
      'Mark sensitive content appropriately',
      'No explicit or graphic content',
      'Keep it family-friendly in public spaces',
      'Use content warnings when necessary',
    ],
  },
  {
    id: 'privacy',
    title: 'Respect Privacy',
    icon: 'lock-closed',
    color: '#FF8E53',
    description: 'Protect your own and others\' privacy',
    rules: [
      'Don\'t share others\' private information',
      'Respect privacy settings',
      'Ask before posting photos of others',
      'Don\'t screenshot private conversations',
    ],
  },
];

export const CommunityGuidelinesModal: React.FC<CommunityGuidelinesModalProps> = ({
  visible,
  onClose,
}) => {
  const renderGuideline = (guideline: typeof GUIDELINES[0]) => (
    <View key={guideline.id} style={styles.guidelineCard}>
      <LinearGradient
        colors={[`${guideline.color}15`, `${guideline.color}05`]}
        style={styles.guidelineGradient}
      >
        <View style={styles.guidelineHeader}>
          <View style={[styles.guidelineIcon, { backgroundColor: `${guideline.color}20` }]}>
            <Ionicons name={guideline.icon as any} size={24} color={guideline.color} />
          </View>
          <View style={styles.guidelineInfo}>
            <Text style={styles.guidelineTitle}>{guideline.title}</Text>
            <Text style={styles.guidelineDescription}>{guideline.description}</Text>
          </View>
        </View>
        
        <View style={styles.rulesContainer}>
          {guideline.rules.map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <View style={[styles.ruleBullet, { backgroundColor: guideline.color }]} />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
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
          <Text style={styles.headerTitle}>Community Guidelines</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Welcome to Our Community! 🌟</Text>
            <Text style={styles.introText}>
              Our community guidelines help create a safe, inclusive, and positive environment 
              for everyone. By using Luma Go, you agree to follow these guidelines.
            </Text>
          </View>

          {GUIDELINES.map(renderGuideline)}

          <View style={styles.enforcementSection}>
            <Text style={styles.enforcementTitle}>Enforcement</Text>
            <Text style={styles.enforcementText}>
              Violations of these guidelines may result in:
            </Text>
            
            <View style={styles.consequencesList}>
              <View style={styles.consequenceItem}>
                <Ionicons name="warning" size={16} color="#FFA726" />
                <Text style={styles.consequenceText}>Content removal</Text>
              </View>
              <View style={styles.consequenceItem}>
                <Ionicons name="time" size={16} color="#FF8E53" />
                <Text style={styles.consequenceText}>Temporary restrictions</Text>
              </View>
              <View style={styles.consequenceItem}>
                <Ionicons name="ban" size={16} color="#FF6B6B" />
                <Text style={styles.consequenceText}>Account suspension</Text>
              </View>
              <View style={styles.consequenceItem}>
                <Ionicons name="close-circle" size={16} color="#F44336" />
                <Text style={styles.consequenceText}>Permanent ban</Text>
              </View>
            </View>
          </View>

          <View style={styles.reportingSection}>
            <Text style={styles.reportingTitle}>Reporting Violations</Text>
            <Text style={styles.reportingText}>
              If you see content that violates these guidelines, please report it using the 
              report button. Our moderation team reviews all reports within 24 hours.
            </Text>
            
            <TouchableOpacity style={styles.reportButton}>
              <LinearGradient
                colors={['#FF6B6B', '#EE5A24']}
                style={styles.reportGradient}
              >
                <Ionicons name="flag" size={20} color="#fff" />
                <Text style={styles.reportButtonText}>Report Content</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              These guidelines are regularly updated to ensure our community remains safe and welcoming. 
              Thank you for helping us maintain a positive environment for everyone! 💙
            </Text>
            
            <Text style={styles.lastUpdated}>
              Last updated: {new Date().toLocaleDateString()}
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
  introSection: {
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
  },
  guidelineCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  guidelineGradient: {
    padding: 16,
  },
  guidelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  guidelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  guidelineInfo: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  guidelineDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  rulesContainer: {
    gap: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  ruleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 12,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  enforcementSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  enforcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  enforcementText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  consequencesList: {
    gap: 8,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consequenceText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  reportingSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  reportingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  reportingText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  reportButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  reportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footerSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 