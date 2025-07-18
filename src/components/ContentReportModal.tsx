import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ContentReportModalProps {
  visible: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  {
    id: 'harassment',
    title: 'Harassment or Bullying',
    description: 'Content that targets individuals with abuse',
    icon: 'person-remove',
    color: '#FF6B6B',
  },
  {
    id: 'hate_speech',
    title: 'Hate Speech',
    description: 'Content promoting hatred against groups',
    icon: 'warning',
    color: '#FF8E53',
  },
  {
    id: 'violence',
    title: 'Violence or Threats',
    description: 'Content depicting or threatening violence',
    icon: 'alert-circle',
    color: '#FF3B30',
  },
  {
    id: 'spam',
    title: 'Spam or Scam',
    description: 'Unwanted promotional content or scams',
    icon: 'ban',
    color: '#FFA726',
  },
  {
    id: 'inappropriate',
    title: 'Inappropriate Content',
    description: 'Content not suitable for all audiences',
    icon: 'eye-off',
    color: '#9C27B0',
  },
  {
    id: 'misinformation',
    title: 'False Information',
    description: 'Content spreading false or misleading info',
    icon: 'information-circle',
    color: '#2196F3',
  },
  {
    id: 'copyright',
    title: 'Copyright Violation',
    description: 'Unauthorized use of copyrighted material',
    icon: 'shield',
    color: '#4CAF50',
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Something else not listed above',
    icon: 'ellipsis-horizontal',
    color: '#667eea',
  },
];

export const ContentReportModal: React.FC<ContentReportModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [step, setStep] = useState(1);

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    setStep(2);
  };

  const handleSubmitReport = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting');
      return;
    }

    Alert.alert(
      'Report Submitted',
      'Thank you for reporting this content. Our moderation team will review it within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSelectedReason(null);
            setDescription('');
            setStep(1);
            onClose();
          },
        },
      ]
    );
  };

  const selectedReasonData = REPORT_REASONS.find(r => r.id === selectedReason);

  const renderReasonSelection = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Report Content</Text>
      <Text style={styles.subtitle}>
        Help us understand what's wrong with this content
      </Text>

      <View style={styles.reasonsContainer}>
        {REPORT_REASONS.map((reason) => (
          <TouchableOpacity
            key={reason.id}
            style={styles.reasonCard}
            onPress={() => handleReasonSelect(reason.id)}
          >
            <View style={styles.reasonHeader}>
              <View style={[styles.reasonIcon, { backgroundColor: `${reason.color}15` }]}>
                <Ionicons name={reason.icon as any} size={24} color={reason.color} />
              </View>
              <View style={styles.reasonInfo}>
                <Text style={styles.reasonTitle}>{reason.title}</Text>
                <Text style={styles.reasonDescription}>{reason.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderReportDetails = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep(1)}
      >
        <Ionicons name="chevron-back" size={20} color="#667eea" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Report Details</Text>
      
      {selectedReasonData && (
        <View style={styles.selectedReasonCard}>
          <LinearGradient
            colors={[`${selectedReasonData.color}15`, `${selectedReasonData.color}05`]}
            style={styles.selectedReasonGradient}
          >
            <View style={styles.selectedReasonHeader}>
              <View style={[styles.reasonIcon, { backgroundColor: `${selectedReasonData.color}20` }]}>
                <Ionicons name={selectedReasonData.icon as any} size={24} color={selectedReasonData.color} />
              </View>
              <View style={styles.selectedReasonInfo}>
                <Text style={styles.selectedReasonTitle}>{selectedReasonData.title}</Text>
                <Text style={styles.selectedReasonDescription}>{selectedReasonData.description}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionLabel}>
          Additional Details (Optional)
        </Text>
        <Text style={styles.descriptionHint}>
          Provide more context to help our moderation team understand the issue
        </Text>
        <TextInput
          style={styles.descriptionInput}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what you found inappropriate about this content..."
          placeholderTextColor="#888"
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReport}>
        <LinearGradient
          colors={['#FF6B6B', '#EE5A24']}
          style={styles.submitGradient}
        >
          <Text style={styles.submitText}>Submit Report</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.disclaimerContainer}>
        <Ionicons name="information-circle" size={16} color="#888" />
        <Text style={styles.disclaimerText}>
          Reports are anonymous and help keep our community safe
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {step === 1 ? renderReasonSelection() : renderReportDetails()}
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  reasonsContainer: {
    gap: 12,
  },
  reasonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reasonInfo: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  reasonDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 4,
  },
  selectedReasonCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedReasonGradient: {
    padding: 16,
  },
  selectedReasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedReasonInfo: {
    flex: 1,
    marginLeft: 16,
  },
  selectedReasonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  selectedReasonDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  descriptionHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1a1a1a',
    minHeight: 100,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
}); 