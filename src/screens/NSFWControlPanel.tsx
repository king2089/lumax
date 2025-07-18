import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useNSFW } from '../context/NSFWContext';

export const NSFWControlPanel: React.FC = () => {
  const navigation = useNavigation();
  const {
    nsfwSettings,
    updateNSFWSettings,
    ageVerification,
    startAgeVerification,
    uploadVerificationDocument,
    parentalControls,
    enableParentalControls,
    disableParentalControls,
    isSafeModeEnabled,
    enableSafeMode,
    disableSafeMode,
    emergencyBlock,
    getContentExposureReport,
    isLoading,
    error,
  } = useNSFW();

  const [showAgeVerificationModal, setShowAgeVerificationModal] = useState(false);
  const [showParentalControlsModal, setShowParentalControlsModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [parentalPin, setParentalPin] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [selectedVerificationMethod, setSelectedVerificationMethod] = useState<'id' | 'credit_card' | 'phone'>('id');

  const handleAgeVerification = async () => {
    const success = await startAgeVerification(selectedVerificationMethod);
    if (success) {
      Alert.alert(
        'Verification Started',
        'Please upload your verification document. This process typically takes 24-48 hours.',
        [
          { text: 'Upload Document', onPress: () => handleDocumentUpload() },
          { text: 'Later', style: 'cancel' },
        ]
      );
    }
    setShowAgeVerificationModal(false);
  };

  const handleDocumentUpload = async () => {
    // Simulate document upload
    const success = await uploadVerificationDocument({ type: selectedVerificationMethod });
    if (success) {
      Alert.alert(
        'Document Uploaded Successfully',
        'Your verification is being processed. You will be notified within 24-48 hours.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleToggleSafeMode = async () => {
    try {
      if (isSafeModeEnabled) {
        Alert.alert(
          'Disable Safe Mode',
          'This will allow mature content. Age verification is required.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                try {
                  await disableSafeMode();
                  Alert.alert('Safe Mode Disabled', 'Mature content is now allowed based on your filter settings.');
                } catch (err) {
                  Alert.alert('Error', 'Age verification required to disable safe mode.');
                }
              },
            },
          ]
        );
      } else {
        await enableSafeMode();
        Alert.alert('Safe Mode Enabled', 'All mature content will be blocked.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle safe mode.');
    }
  };

  const handleEmergencyBlock = async () => {
    Alert.alert(
      'Emergency Block',
      'This will immediately enable the strictest content filtering and safe mode. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'EMERGENCY BLOCK',
          style: 'destructive',
          onPress: async () => {
            await emergencyBlock();
            setShowEmergencyModal(false);
            Alert.alert(
              'Emergency Block Activated',
              'All mature content has been blocked with the strictest settings.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleEnableParentalControls = async () => {
    if (!parentalPin || !parentEmail) {
      Alert.alert('Error', 'Please enter both parent email and PIN.');
      return;
    }

    const controls = {
      ...parentalControls,
      parentEmail,
      pin: parentalPin,
      isEnabled: true,
    };

    const success = await enableParentalControls(controls);
    if (success) {
      setShowParentalControlsModal(false);
      setParentalPin('');
      setParentEmail('');
      Alert.alert(
        'Parental Controls Enabled',
        'Content is now restricted according to parental control settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const getVerificationStatusColor = () => {
    switch (ageVerification.verificationStatus) {
      case 'approved': return '#00C853';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      case 'expired': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getVerificationStatusText = () => {
    switch (ageVerification.verificationStatus) {
      case 'approved': return 'Verified ✓';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      case 'expired': return 'Expired';
      default: return 'Not Verified';
    }
  };

  const renderAgeVerificationSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔞 Age Verification</Text>
      
      <View style={styles.verificationCard}>
        <View style={styles.verificationHeader}>
          <View style={styles.verificationInfo}>
            <Text style={styles.verificationStatus}>
              Status: <Text style={[styles.statusText, { color: getVerificationStatusColor() }]}>
                {getVerificationStatusText()}
              </Text>
            </Text>
            {ageVerification.verifiedDate && (
              <Text style={styles.verificationDate}>
                Verified: {new Date(ageVerification.verifiedDate).toLocaleDateString()}
              </Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getVerificationStatusColor() }]}>
            <Ionicons 
              name={ageVerification.isVerified ? "checkmark" : "close"} 
              size={20} 
              color="#fff" 
            />
          </View>
        </View>
        
        <Text style={styles.verificationDescription}>
          Age verification is required to access mature content and disable certain safety features.
        </Text>
        
        {!ageVerification.isVerified && (
          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={() => setShowAgeVerificationModal(true)}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Start Verification</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderContentFilterSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🛡️ Content Filtering</Text>
      
      <View style={styles.filterCard}>
        <View style={styles.filterOption}>
          <View style={styles.filterInfo}>
            <Text style={styles.filterLabel}>Safe Mode</Text>
            <Text style={styles.filterDescription}>
              Blocks all mature content completely
            </Text>
          </View>
          <Switch
            value={isSafeModeEnabled}
            onValueChange={handleToggleSafeMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isSafeModeEnabled ? '#667eea' : '#f4f3f4'}
          />
        </View>

        <View style={styles.filterOption}>
          <View style={styles.filterInfo}>
            <Text style={styles.filterLabel}>Allow NSFW Content</Text>
            <Text style={styles.filterDescription}>
              Requires age verification
            </Text>
          </View>
          <Switch
            value={nsfwSettings.allowNSFWContent}
            onValueChange={(value) => updateNSFWSettings({ allowNSFWContent: value })}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={nsfwSettings.allowNSFWContent ? '#667eea' : '#f4f3f4'}
            disabled={!ageVerification.isVerified}
          />
        </View>

        <View style={styles.filterOption}>
          <View style={styles.filterInfo}>
            <Text style={styles.filterLabel}>Blur NSFW Images</Text>
            <Text style={styles.filterDescription}>
              Blur mature images until clicked
            </Text>
          </View>
          <Switch
            value={nsfwSettings.blurNSFWImages}
            onValueChange={(value) => updateNSFWSettings({ blurNSFWImages: value })}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={nsfwSettings.blurNSFWImages ? '#667eea' : '#f4f3f4'}
          />
        </View>

        <View style={styles.filterOption}>
          <View style={styles.filterInfo}>
            <Text style={styles.filterLabel}>Content Warnings</Text>
            <Text style={styles.filterDescription}>
              Show warnings before mature content
            </Text>
          </View>
          <Switch
            value={nsfwSettings.showContentWarnings}
            onValueChange={(value) => updateNSFWSettings({ showContentWarnings: value })}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={nsfwSettings.showContentWarnings ? '#667eea' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.filterLevelTitle}>Filter Level</Text>
        <View style={styles.filterLevels}>
          {['strict', 'moderate', 'minimal', 'off'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.filterLevelOption,
                nsfwSettings.contentFilterLevel === level && styles.filterLevelSelected
              ]}
              onPress={() => updateNSFWSettings({ contentFilterLevel: level as any })}
            >
              <Text style={[
                styles.filterLevelText,
                nsfwSettings.contentFilterLevel === level && styles.filterLevelTextSelected
              ]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderParentalControlsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Parental Controls</Text>
      
      <View style={styles.parentalCard}>
        <View style={styles.parentalHeader}>
          <View style={styles.parentalInfo}>
            <Text style={styles.parentalStatus}>
              Status: {parentalControls.isEnabled ? 'Enabled' : 'Disabled'}
            </Text>
            {parentalControls.isEnabled && (
              <Text style={styles.parentalEmail}>
                Parent: {parentalControls.parentEmail}
              </Text>
            )}
          </View>
          <View style={[
            styles.parentalBadge,
            { backgroundColor: parentalControls.isEnabled ? '#00C853' : '#9E9E9E' }
          ]}>
            <Ionicons 
              name={parentalControls.isEnabled ? "shield-checkmark" : "shield-outline"} 
              size={20} 
              color="#fff" 
            />
          </View>
        </View>
        
        <Text style={styles.parentalDescription}>
          Restrict content access and set time limits for underage users.
        </Text>
        
        {!parentalControls.isEnabled ? (
          <TouchableOpacity 
            style={styles.parentalButton}
            onPress={() => setShowParentalControlsModal(true)}
          >
            <LinearGradient
              colors={['#00C853', '#4CAF50']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Enable Parental Controls</Text>
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.parentalDisableButton}
            onPress={() => {
              Alert.prompt(
                'Disable Parental Controls',
                'Enter the parental control PIN:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Disable',
                    onPress: async (pin) => {
                      if (pin) {
                        const success = await disableParentalControls(pin);
                        if (success) {
                          Alert.alert('Parental Controls Disabled');
                        }
                      }
                    },
                  },
                ],
                'secure-text'
              );
            }}
          >
            <Text style={styles.disableButtonText}>Disable Parental Controls</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmergencySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚨 Emergency & Safety</Text>
      
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyHeader}>
          <Ionicons name="warning" size={24} color="#F44336" />
          <Text style={styles.emergencyTitle}>Emergency Controls</Text>
        </View>
        
        <Text style={styles.emergencyDescription}>
          Use these controls if you need immediate protection or help.
        </Text>
        
        <View style={styles.emergencyButtons}>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={handleEmergencyBlock}
          >
            <LinearGradient
              colors={['#F44336', '#D32F2F']}
              style={styles.buttonGradient}
            >
              <Ionicons name="shield" size={20} color="#fff" />
              <Text style={styles.buttonText}>Emergency Block</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => setShowReportModal(true)}
          >
            <View style={styles.helpButtonContent}>
              <Ionicons name="help-circle" size={20} color="#667eea" />
              <Text style={styles.helpButtonText}>Get Help</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NSFW Controls</Text>
        <TouchableOpacity onPress={() => setShowReportModal(true)}>
          <Ionicons name="help-circle" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderAgeVerificationSection()}
        {renderContentFilterSection()}
        {renderParentalControlsSection()}
        {renderEmergencySection()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Age Verification Modal */}
      <Modal
        visible={showAgeVerificationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Age Verification</Text>
            <TouchableOpacity onPress={() => setShowAgeVerificationModal(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.verificationMethodTitle}>Choose Verification Method:</Text>
            
            {[
              { id: 'id', label: 'Government ID', icon: 'card', description: 'Driver\'s license, passport, or state ID' },
              { id: 'credit_card', label: 'Credit Card', icon: 'card-outline', description: 'Credit or debit card verification' },
              { id: 'phone', label: 'Phone Verification', icon: 'call', description: 'SMS verification with age confirmation' },
            ].map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.verificationMethod,
                  selectedVerificationMethod === method.id && styles.verificationMethodSelected
                ]}
                onPress={() => setSelectedVerificationMethod(method.id as any)}
              >
                <Ionicons name={method.icon as any} size={24} color="#667eea" />
                <View style={styles.methodInfo}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
                <View style={[
                  styles.methodRadio,
                  selectedVerificationMethod === method.id && styles.methodRadioSelected
                ]} />
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.startVerificationButton} onPress={handleAgeVerification}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Start Verification</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Parental Controls Modal */}
      <Modal
        visible={showParentalControlsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Parental Controls</Text>
            <TouchableOpacity onPress={() => setShowParentalControlsModal(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Parent Email:</Text>
            <TextInput
              style={styles.textInput}
              value={parentEmail}
              onChangeText={setParentEmail}
              placeholder="parent@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Text style={styles.inputLabel}>PIN (4 digits):</Text>
            <TextInput
              style={styles.textInput}
              value={parentalPin}
              onChangeText={setParentalPin}
              placeholder="Enter 4-digit PIN"
              secureTextEntry
              maxLength={4}
              keyboardType="numeric"
            />
            
            <TouchableOpacity style={styles.enableButton} onPress={handleEnableParentalControls}>
              <LinearGradient
                colors={['#00C853', '#4CAF50']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Enable Parental Controls</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  verificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusText: {
    fontWeight: 'bold',
  },
  verificationDate: {
    fontSize: 14,
    color: '#65676b',
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationDescription: {
    fontSize: 14,
    color: '#65676b',
    marginBottom: 16,
    lineHeight: 20,
  },
  verifyButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  filterCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  filterInfo: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  filterDescription: {
    fontSize: 14,
    color: '#65676b',
  },
  filterLevelTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  filterLevels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterLevelOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    backgroundColor: '#f8f9fa',
  },
  filterLevelSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#65676b',
  },
  filterLevelTextSelected: {
    color: '#fff',
  },
  parentalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  parentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  parentalInfo: {
    flex: 1,
  },
  parentalStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  parentalEmail: {
    fontSize: 14,
    color: '#65676b',
  },
  parentalBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  parentalDescription: {
    fontSize: 14,
    color: '#65676b',
    marginBottom: 16,
    lineHeight: 20,
  },
  parentalButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  parentalDisableButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    alignItems: 'center',
  },
  disableButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  emergencyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    color: '#F44336',
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#65676b',
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  emergencyButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  helpButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#667eea',
    paddingVertical: 12,
    alignItems: 'center',
  },
  helpButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  verificationMethodTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  verificationMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    marginBottom: 12,
  },
  verificationMethodSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#65676b',
  },
  methodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e4e6eb',
  },
  methodRadioSelected: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
  },
  startVerificationButton: {
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  enableButton: {
    marginTop: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
}); 