import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

interface AgeVerificationModalProps {
  visible: boolean;
  onVerificationComplete: (isVerified: boolean, dateOfBirth?: Date) => void;
  onCancel: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  visible,
  onVerificationComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAdultContent, setAcceptedAdultContent] = useState(false);
  const [understoodRisks, setUnderstoodRisks] = useState(false);

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const age = calculateAge(dateOfBirth);
      if (age < 13) {
        Alert.alert(
          '❌ Age Restriction',
          'You must be at least 13 years old to use this app. Please contact your parent or guardian.',
          [{ text: 'OK', onPress: onCancel }]
        );
        return;
      } else if (age < 18) {
        Alert.alert(
          '⚠️ Parental Consent Required',
          'Users under 18 require parental consent and will have restricted access to mature content.',
          [
            { text: 'Cancel', onPress: onCancel },
            { text: 'Continue', onPress: () => setCurrentStep(2) }
          ]
        );
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleComplete = () => {
    const age = calculateAge(dateOfBirth);
    
    if (!acceptedTerms) {
      Alert.alert('Terms Required', 'You must accept the Terms of Service to continue.');
      return;
    }

    if (age >= 18 && !acceptedAdultContent) {
      Alert.alert('Adult Content Agreement Required', 'You must acknowledge the adult content policy to access mature features.');
      return;
    }

    if (age >= 18 && !understoodRisks) {
      Alert.alert('Safety Acknowledgment Required', 'You must acknowledge the safety guidelines for mature content.');
      return;
    }

    onVerificationComplete(true, dateOfBirth);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="calendar" size={48} color="#667eea" />
      </View>
      
      <Text style={styles.stepTitle}>Age Verification Required</Text>
      <Text style={styles.stepSubtitle}>
        This app contains mature content and requires age verification for compliance with digital safety laws.
      </Text>

      <View style={styles.datePickerContainer}>
        <Text style={styles.dateLabel}>Select your date of birth:</Text>
        
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {dateOfBirth.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#667eea" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )}
      </View>

      <View style={styles.ageDisplay}>
        <Text style={styles.ageText}>
          Age: {calculateAge(dateOfBirth)} years old
        </Text>
        {calculateAge(dateOfBirth) >= 18 && (
          <View style={styles.adultBadge}>
            <Text style={styles.adultBadgeText}>18+ Verified</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="document-text" size={48} color="#667eea" />
      </View>
      
      <Text style={styles.stepTitle}>Terms & Conditions</Text>
      
      <ScrollView style={styles.termsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.termsText}>
          <Text style={styles.termsHeader}>Community Guidelines & Terms of Service{'\n\n'}</Text>
          
          <Text style={styles.termsSection}>1. Age Requirements{'\n'}</Text>
          • Users must be 13+ to create an account{'\n'}
          • Users 13-17 require parental consent{'\n'}
          • Adult content (18+) requires age verification{'\n\n'}
          
          <Text style={styles.termsSection}>2. Content Policies{'\n'}</Text>
          • No harassment, bullying, or hate speech{'\n'}
          • No illegal content or activities{'\n'}
          • NSFW content must be properly tagged{'\n'}
          • Respect intellectual property rights{'\n\n'}
          
          <Text style={styles.termsSection}>3. Privacy & Safety{'\n'}</Text>
          • Your data is protected and encrypted{'\n'}
          • Report inappropriate content immediately{'\n'}
          • Block and restrict users as needed{'\n'}
          • Use privacy controls for your safety{'\n\n'}
          
          <Text style={styles.termsSection}>4. Mature Content (18+){'\n'}</Text>
          • Adult content is restricted to verified users{'\n'}
          • Content must include appropriate warnings{'\n'}
          • Consent is required for all interactions{'\n'}
          • Zero tolerance for non-consensual content{'\n\n'}
        </Text>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
        onPress={() => setAcceptedTerms(!acceptedTerms)}
      >
        <Ionicons 
          name={acceptedTerms ? "checkmark-circle" : "ellipse-outline"} 
          size={24} 
          color={acceptedTerms ? "#00C853" : "#ccc"} 
        />
        <Text style={styles.checkboxText}>
          I accept the Terms of Service and Community Guidelines
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => {
    const age = calculateAge(dateOfBirth);
    const isAdult = age >= 18;

    return (
      <View style={styles.stepContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={48} color={isAdult ? "#FF6B6B" : "#00C853"} />
        </View>
        
        <Text style={styles.stepTitle}>
          {isAdult ? '🔞 Adult Content Agreement' : '✅ Account Setup Complete'}
        </Text>
        
        {isAdult ? (
          <>
            <Text style={styles.stepSubtitle}>
              As an adult user, you'll have access to mature content. Please review these important guidelines:
            </Text>

            <View style={styles.adultWarningContainer}>
              <Text style={styles.adultWarningText}>
                ⚠️ Adult Content Includes:{'\n'}
                • Mature themes and discussions{'\n'}
                • NSFW visual content{'\n'}
                • Adult-oriented communities{'\n'}
                • Age-restricted live streams{'\n'}
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.checkbox, acceptedAdultContent && styles.checkboxChecked]}
              onPress={() => setAcceptedAdultContent(!acceptedAdultContent)}
            >
              <Ionicons 
                name={acceptedAdultContent ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={acceptedAdultContent ? "#00C853" : "#ccc"} 
              />
              <Text style={styles.checkboxText}>
                I understand and consent to viewing adult content
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.checkbox, understoodRisks && styles.checkboxChecked]}
              onPress={() => setUnderstoodRisks(!understoodRisks)}
            >
              <Ionicons 
                name={understoodRisks ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={understoodRisks ? "#00C853" : "#ccc"} 
              />
              <Text style={styles.checkboxText}>
                I understand the safety guidelines and reporting tools
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.stepSubtitle}>
            Your account has been configured with appropriate content filters for your age group. You can adjust these settings later in Privacy & Safety.
          </Text>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onCancel}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Age Verification</Text>
          <Text style={styles.headerSubtitle}>Step {currentStep} of 3</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep > 1 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          {currentStep < 3 ? (
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[
                styles.completeButton,
                (!acceptedTerms || (calculateAge(dateOfBirth) >= 18 && (!acceptedAdultContent || !understoodRisks))) && styles.buttonDisabled
              ]}
              onPress={handleComplete}
              disabled={!acceptedTerms || (calculateAge(dateOfBirth) >= 18 && (!acceptedAdultContent || !understoodRisks))}
            >
              <Text style={styles.completeButtonText}>Complete Setup</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 24,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
    paddingVertical: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  datePickerContainer: {
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  ageDisplay: {
    alignItems: 'center',
    marginTop: 24,
  },
  ageText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
  },
  adultBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  adultBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  termsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
    marginBottom: 24,
  },
  termsText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  termsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsSection: {
    fontSize: 15,
    fontWeight: '600',
  },
  adultWarningContainer: {
    backgroundColor: 'rgba(255,107,107,0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.5)',
  },
  adultWarningText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(0,200,83,0.1)',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  completeButton: {
    backgroundColor: '#00C853',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
}); 