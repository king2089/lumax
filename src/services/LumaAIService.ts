import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { Audio } from 'expo-av';

export interface HealthMetrics {
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  oxygenSaturation: number;
  temperature: number;
  respiratoryRate: number;
  stressLevel: number;
  activityLevel: number;
  sleepQuality: number;
  mentalHealthScore: number;
  emergencyRisk: number;
}

export interface EmergencyDetection {
  isEmergency: boolean;
  emergencyType: 'cardiac' | 'respiratory' | 'mental' | 'physical' | 'overdose' | 'stroke' | 'seizure' | 'fall';
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  recommendedAction: string;
  shouldCall911: boolean;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}

export interface AIHealthAnalysis {
  overallHealth: number; // 0-100
  riskFactors: string[];
  recommendations: string[];
  nextCheckup: Date;
  emergencyContacts: string[];
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
}

class LumaAIService {
  private static instance: LumaAIService;
  private isMonitoring = false;
  private healthData: HealthMetrics[] = [];
  private emergencyThresholds = {
    heartRate: { min: 50, max: 120 },
    bloodPressure: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 } },
    oxygenSaturation: { min: 95 },
    temperature: { min: 97, max: 100.4 },
    respiratoryRate: { min: 12, max: 20 },
    stressLevel: { max: 80 },
    emergencyRisk: { critical: 90, high: 70, medium: 50 }
  };

  private emergencyKeywords = [
    'help', 'emergency', '911', 'pain', 'chest pain', 'heart attack', 'stroke',
    'can\'t breathe', 'dizzy', 'fainting', 'seizure', 'overdose', 'suicide',
    'bleeding', 'broken', 'accident', 'fall', 'unconscious', 'dead'
  ];

  private distressPatterns = [
    'repeated calls for help',
    'sudden silence after distress',
    'irregular breathing patterns',
    'unusual typing patterns',
    'repeated emergency keywords',
    'sudden mood changes',
    'withdrawal from social interaction'
  ];

  public static getInstance(): LumaAIService {
    if (!LumaAIService.instance) {
      LumaAIService.instance = new LumaAIService();
    }
    return LumaAIService.instance;
  }

  // Start AI Health Monitoring
  public async startHealthMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    try {
      // Request necessary permissions
      await this.requestPermissions();
      
      this.isMonitoring = true;
      console.log('🚨 Luma AI Gen 2: Health monitoring activated');
      
      // Start continuous monitoring
      this.monitorVitalSigns();
      this.monitorUserBehavior();
      this.monitorLocation();
      this.monitorAudio();
      this.monitorAccelerometer();
      
      // Set up emergency detection intervals
      setInterval(() => {
        this.analyzeHealthData();
      }, 30000); // Check every 30 seconds
      
      setInterval(() => {
        this.detectEmergencyPatterns();
      }, 10000); // Check every 10 seconds
      
    } catch (error) {
      console.error('Failed to start health monitoring:', error);
      Alert.alert('Health Monitoring Error', 'Unable to start AI health monitoring. Please check permissions.');
    }
  }

  // Stop AI Health Monitoring
  public stopHealthMonitoring(): void {
    this.isMonitoring = false;
    console.log('🚨 Luma AI Gen 2: Health monitoring deactivated');
  }

  // Request necessary permissions for health monitoring
  private async requestPermissions(): Promise<void> {
    try {
      // Location permission for emergency services
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (!locationPermission.granted) {
        throw new Error('Location permission required for emergency services');
      }

      // Audio permission for voice monitoring
      const audioPermission = await Audio.requestPermissionsAsync();
      if (!audioPermission.granted) {
        console.warn('Audio permission not granted - voice monitoring disabled');
      }

      // Android specific permissions
      if (Platform.OS === 'android') {
        const callPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE
        );
        if (callPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Call permission not granted - manual 911 calls required');
        }
      }

    } catch (error) {
      console.error('Permission request failed:', error);
      throw error;
    }
  }

  // Monitor vital signs using device sensors
  private async monitorVitalSigns(): Promise<void> {
    // Simulate vital sign monitoring (in real implementation, would use actual health sensors)
    setInterval(() => {
      const vitalSigns: HealthMetrics = {
        heartRate: this.generateHeartRate(),
        bloodPressure: this.generateBloodPressure(),
        oxygenSaturation: this.generateOxygenSaturation(),
        temperature: this.generateTemperature(),
        respiratoryRate: this.generateRespiratoryRate(),
        stressLevel: this.generateStressLevel(),
        activityLevel: this.generateActivityLevel(),
        sleepQuality: this.generateSleepQuality(),
        mentalHealthScore: this.generateMentalHealthScore(),
        emergencyRisk: this.calculateEmergencyRisk()
      };

      this.healthData.push(vitalSigns);
      
      // Keep only last 100 readings
      if (this.healthData.length > 100) {
        this.healthData.shift();
      }

      // Check for immediate emergencies
      this.checkImmediateEmergencies(vitalSigns);
    }, 5000); // Update every 5 seconds
  }

  // Monitor user behavior patterns
  private async monitorUserBehavior(): Promise<void> {
    // Monitor typing patterns, app usage, social interactions
    setInterval(() => {
      // Analyze user behavior for distress signals
      this.analyzeBehaviorPatterns();
    }, 15000); // Check every 15 seconds
  }

  // Monitor location for emergency context
  private async monitorLocation(): Promise<void> {
    setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        // Store location for emergency services
        this.currentLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: await this.getAddressFromCoords(location.coords)
      };
    } catch (error) {
        console.warn('Location monitoring failed:', error);
      }
    }, 30000); // Update every 30 seconds
  }

  // Monitor audio for distress signals
  private async monitorAudio(): Promise<void> {
    // In a real implementation, this would use device microphone
    // For now, we'll simulate audio monitoring
    setInterval(() => {
      this.analyzeAudioPatterns();
    }, 10000); // Check every 10 seconds
  }

  // Monitor accelerometer for falls and unusual movements
  private async monitorAccelerometer(): Promise<void> {
    // Simulate accelerometer monitoring for now
    setInterval(() => {
      this.analyzeMovementPatterns({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 2 - 1
      });
    }, 1000);
  }

  // Analyze health data for emergency conditions
  private analyzeHealthData(): void {
    if (this.healthData.length === 0) return;

    const latestData = this.healthData[this.healthData.length - 1];
    const emergencyDetection = this.detectEmergencyConditions(latestData);

    if (emergencyDetection.isEmergency) {
      this.handleEmergency(emergencyDetection);
    }
  }

  // Detect emergency conditions from health data
  private detectEmergencyConditions(data: HealthMetrics): EmergencyDetection {
    const symptoms: string[] = [];
    let emergencyType: EmergencyDetection['emergencyType'] = 'physical';
    let confidence = 0;
    let severity: EmergencyDetection['severity'] = 'low';
    let shouldCall911 = false;

    // Cardiac emergency detection
    if (data.heartRate < 40 || data.heartRate > 150) {
      symptoms.push('Abnormal heart rate');
      emergencyType = 'cardiac';
      confidence += 30;
      if (data.heartRate < 30 || data.heartRate > 180) {
        severity = 'critical';
        shouldCall911 = true;
      }
    }

    // Respiratory emergency detection
    if (data.oxygenSaturation < 90) {
      symptoms.push('Low oxygen saturation');
      emergencyType = 'respiratory';
      confidence += 40;
      if (data.oxygenSaturation < 85) {
        severity = 'critical';
        shouldCall911 = true;
      }
    }

    // Blood pressure emergency detection
    if (data.bloodPressure.systolic > 180 || data.bloodPressure.systolic < 90) {
      symptoms.push('Abnormal blood pressure');
      emergencyType = 'cardiac';
      confidence += 25;
      if (data.bloodPressure.systolic > 200 || data.bloodPressure.systolic < 80) {
        severity = 'critical';
        shouldCall911 = true;
      }
    }

    // Mental health emergency detection
    if (data.mentalHealthScore < 20) {
      symptoms.push('Severe mental distress');
      emergencyType = 'mental';
      confidence += 35;
      if (data.mentalHealthScore < 10) {
        severity = 'critical';
        shouldCall911 = true;
      }
    }

    // High stress emergency detection
    if (data.stressLevel > 90) {
      symptoms.push('Extreme stress levels');
      emergencyType = 'mental';
      confidence += 20;
      if (data.stressLevel > 95) {
        severity = 'high';
        shouldCall911 = true;
      }
    }

    // Overall emergency risk assessment
    if (data.emergencyRisk > 80) {
      severity = 'critical';
      shouldCall911 = true;
      confidence += 50;
    }

    return {
      isEmergency: confidence > 30,
      emergencyType,
      confidence: Math.min(confidence, 100),
      severity,
      symptoms,
      recommendedAction: this.getRecommendedAction(emergencyType, severity),
      shouldCall911,
      location: this.currentLocation
    };
  }

  // Detect emergency patterns in user behavior
  private detectEmergencyPatterns(): void {
    // Analyze recent user interactions for emergency keywords
    // This would integrate with chat, posts, and other user inputs
    const recentActivity = this.getRecentUserActivity();
    
    for (const activity of recentActivity) {
      const emergencyKeywords = this.emergencyKeywords.filter(keyword =>
        activity.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (emergencyKeywords.length > 0) {
        this.handleEmergency({
          isEmergency: true,
          emergencyType: 'mental',
          confidence: 60,
          severity: 'medium',
          symptoms: [`Emergency keywords detected: ${emergencyKeywords.join(', ')}`],
          recommendedAction: 'Immediate attention required',
          shouldCall911: false,
          location: this.currentLocation
        });
      }
    }
  }

  // Handle emergency detection
  private async handleEmergency(detection: EmergencyDetection): Promise<void> {
    console.log('🚨 Luma AI Gen 2: Emergency detected!', detection);

    // Show emergency alert
    Alert.alert(
      '🚨 Luma AI Emergency Detection',
      `AI has detected a potential emergency:\n\n${detection.symptoms.join('\n')}\n\nConfidence: ${detection.confidence}%\nSeverity: ${detection.severity}\n\nRecommended: ${detection.recommendedAction}`,
      [
        {
          text: 'I\'m OK',
          style: 'cancel',
          onPress: () => this.dismissEmergency()
        },
        {
          text: 'Get Help',
          style: 'destructive',
          onPress: () => this.initiateEmergencyResponse(detection)
        }
      ],
      { cancelable: false }
    );

    // Auto-call 911 for critical emergencies
    if (detection.shouldCall911 && detection.severity === 'critical') {
      setTimeout(() => {
        this.autoCall911(detection);
      }, 30000); // 30 second delay to allow user to cancel
    }
  }

  // Initiate emergency response
  private async initiateEmergencyResponse(detection: EmergencyDetection): Promise<void> {
    try {
      // Call 911
      if (detection.shouldCall911) {
        await this.call911(detection);
      }

      // Contact emergency contacts
      await this.contactEmergencyContacts(detection);

      // Send location to emergency services
      if (detection.location) {
        await this.sendLocationToEmergencyServices(detection.location);
      }

      // Log emergency for medical professionals
      await this.logEmergencyForMedicalProfessionals(detection);

    } catch (error) {
      console.error('Emergency response failed:', error);
      Alert.alert('Emergency Response Error', 'Unable to initiate emergency response. Please call 911 manually.');
    }
  }

  // Auto-call 911 for critical emergencies
  private async autoCall911(detection: EmergencyDetection): Promise<void> {
    try {
      Alert.alert(
        '🚨 Auto-Calling 911',
        'Luma AI is automatically calling 911 due to critical emergency detection. This call cannot be cancelled.',
        [{ text: 'OK' }],
        { cancelable: false }
      );

      await this.call911(detection);
    } catch (error) {
      console.error('Auto 911 call failed:', error);
    }
  }

  // Call 911
  private async call911(detection: EmergencyDetection): Promise<void> {
    try {
      const phoneNumber = '911';
      const message = `Emergency: ${detection.emergencyType} emergency detected by Luma AI. Confidence: ${detection.confidence}%. Symptoms: ${detection.symptoms.join(', ')}. Location: ${detection.location?.address || 'Unknown'}`;
      
      // Check if we're in a simulator
      const isSimulator = await Device.isDeviceAsync().then(isDevice => !isDevice);
      
      if (isSimulator) {
        // In simulator, show emergency instructions instead of calling
        Alert.alert(
          '🚨 Emergency Detected (Simulator)',
          `Emergency: ${detection.emergencyType.toUpperCase()}\n\nConfidence: ${detection.confidence}%\nSeverity: ${detection.severity.toUpperCase()}\n\nIn a real device, this would automatically call 911.\n\nFor testing purposes, please:\n1. Call 911 manually if needed\n2. Contact emergency services\n3. Seek medical attention`,
          [
            { text: 'Call 911 Manually', onPress: () => this.showEmergencyInstructions() },
            { text: 'Dismiss', style: 'cancel' }
          ]
        );
        console.log('🚨 Emergency detected in simulator - showing instructions instead of calling 911');
        return;
      }
      
      if (Platform.OS === 'ios') {
        await Linking.openURL(`tel:${phoneNumber}`);
      } else {
        // Android implementation
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await Linking.openURL(`tel:${phoneNumber}`);
        }
      }

      console.log('🚨 911 called successfully');
    } catch (error) {
      console.error('Failed to call 911:', error);
      // Show fallback emergency instructions
      this.showEmergencyInstructions();
    }
  }

  // Show emergency instructions when calling fails
  private showEmergencyInstructions(): void {
    Alert.alert(
      '🚨 Emergency Response Required',
      'Unable to automatically call 911. Please:\n\n1. Call 911 manually\n2. Contact emergency services\n3. Seek immediate medical attention\n4. Contact your emergency contacts',
      [
        { text: 'Call 911 Now', onPress: () => Linking.openURL('tel:911').catch(() => Alert.alert('Error', 'Unable to open phone app')) },
        { text: 'Emergency Contacts', onPress: () => this.showEmergencyContacts() },
        { text: 'OK', style: 'cancel' }
      ]
    );
  }

  // Show emergency contacts
  private showEmergencyContacts(): void {
    const contacts = this.getEmergencyContacts();
    if (contacts.length === 0) {
      Alert.alert('No Emergency Contacts', 'Please add emergency contacts in your phone settings.');
      return;
    }
    
    const contactOptions = contacts.map(contact => ({
      text: `${contact.name} (${contact.phone})`,
      onPress: () => Linking.openURL(`tel:${contact.phone}`).catch(() => Alert.alert('Error', 'Unable to call contact'))
    }));
    
    Alert.alert('Emergency Contacts', 'Select a contact to call:', [
      ...contactOptions,
      { text: 'Cancel', style: 'cancel' }
    ]);
  }

  // Contact emergency contacts
  private async contactEmergencyContacts(detection: EmergencyDetection): Promise<void> {
    const emergencyContacts = this.getEmergencyContacts();
    
    for (const contact of emergencyContacts) {
      try {
        await this.sendEmergencyAlert(contact, detection);
    } catch (error) {
        console.error(`Failed to contact ${contact.name}:`, error);
      }
    }
  }

  // Send location to emergency services
  private async sendLocationToEmergencyServices(location: EmergencyDetection['location']): Promise<void> {
    if (!location) return;

    try {
      // In a real implementation, this would send to emergency services API
      console.log('📍 Location sent to emergency services:', location);
    } catch (error) {
      console.error('Failed to send location:', error);
    }
  }

  // Log emergency for medical professionals
  private async logEmergencyForMedicalProfessionals(detection: EmergencyDetection): Promise<void> {
    try {
      const emergencyLog = {
        timestamp: new Date().toISOString(),
        detection,
        healthData: this.healthData.slice(-10), // Last 10 readings
        userContext: this.getUserContext()
      };

      // In a real implementation, this would be sent to medical professionals
      console.log('📋 Emergency logged for medical professionals:', emergencyLog);
    } catch (error) {
      console.error('Failed to log emergency:', error);
    }
  }

  // Dismiss emergency
  private dismissEmergency(): void {
    console.log('🚨 Emergency dismissed by user');
    // Log dismissal for analysis
  }

  // Get recommended action based on emergency type and severity
  private getRecommendedAction(type: EmergencyDetection['emergencyType'], severity: EmergencyDetection['severity']): string {
    const recommendations = {
      cardiac: {
        critical: 'Immediate medical attention required. Call 911 immediately.',
        high: 'Seek immediate medical attention.',
        medium: 'Monitor symptoms and contact healthcare provider.',
        low: 'Continue monitoring and rest.'
      },
      respiratory: {
        critical: 'Emergency medical attention required. Call 911 immediately.',
        high: 'Seek immediate medical attention.',
        medium: 'Monitor breathing and contact healthcare provider.',
        low: 'Rest and monitor symptoms.'
      },
      mental: {
        critical: 'Immediate mental health crisis intervention required.',
        high: 'Contact mental health professional immediately.',
        medium: 'Consider speaking with a counselor or therapist.',
        low: 'Practice stress management techniques.'
      },
      physical: {
        critical: 'Immediate medical attention required.',
        high: 'Seek medical attention.',
        medium: 'Monitor symptoms and rest.',
        low: 'Continue monitoring.'
      }
    };

    return recommendations[type]?.[severity] || 'Monitor symptoms and seek medical attention if needed.';
  }

  // Generate simulated health data (in real implementation, would use actual sensors)
  private generateHeartRate(): number {
    return Math.floor(Math.random() * 40) + 60; // 60-100 BPM
  }

  private generateBloodPressure(): { systolic: number; diastolic: number } {
      return {
      systolic: Math.floor(Math.random() * 40) + 110, // 110-150
      diastolic: Math.floor(Math.random() * 20) + 70  // 70-90
    };
  }

  private generateOxygenSaturation(): number {
    return Math.floor(Math.random() * 5) + 95; // 95-100%
  }

  private generateTemperature(): number {
    return Math.random() * 2 + 98; // 98-100°F
  }

  private generateRespiratoryRate(): number {
    return Math.floor(Math.random() * 8) + 12; // 12-20 breaths/min
  }

  private generateStressLevel(): number {
    return Math.floor(Math.random() * 100); // 0-100
  }

  private generateActivityLevel(): number {
    return Math.floor(Math.random() * 100); // 0-100
  }

  private generateSleepQuality(): number {
    return Math.floor(Math.random() * 100); // 0-100
  }

  private generateMentalHealthScore(): number {
    return Math.floor(Math.random() * 100); // 0-100
  }

  private calculateEmergencyRisk(): number {
    // Calculate emergency risk based on all health metrics
    return Math.floor(Math.random() * 100); // 0-100
  }

  // Helper methods (would be implemented with real data)
  private getRecentUserActivity(): string[] {
    return []; // Would return recent user interactions
  }

  private analyzeBehaviorPatterns(): void {
    // Analyze user behavior for distress signals
  }

  private analyzeAudioPatterns(): void {
    // Analyze audio for distress signals
  }

  private analyzeMovementPatterns(data: any): void {
    // Analyze accelerometer data for falls or unusual movements
  }

  private checkImmediateEmergencies(data: HealthMetrics): void {
    // Check for immediate life-threatening conditions
  }

  private getAddressFromCoords(coords: any): Promise<string> {
    return Promise.resolve('Unknown Address'); // Would use reverse geocoding
  }

  private getEmergencyContacts(): any[] {
    // Sample emergency contacts for testing
    return [
      { name: 'Emergency Contact 1', phone: '555-0101' },
      { name: 'Emergency Contact 2', phone: '555-0102' },
      { name: 'Medical Provider', phone: '555-0103' }
    ];
  }

  private sendEmergencyAlert(contact: any, detection: EmergencyDetection): Promise<void> {
    return Promise.resolve(); // Would send emergency alert
  }

  private getUserContext(): any {
    return {}; // Would return user context
  }

  private currentLocation: EmergencyDetection['location'] = null;

  // Public methods for external use
  public async analyzeHealthMetrics(): Promise<AIHealthAnalysis> {
    if (this.healthData.length === 0) {
      return {
        overallHealth: 0,
        riskFactors: [],
        recommendations: [],
        nextCheckup: new Date(),
        emergencyContacts: [],
        medicalHistory: [],
        currentMedications: [],
        allergies: []
      };
    }

    const latestData = this.healthData[this.healthData.length - 1];
    
    return {
      overallHealth: this.calculateOverallHealth(latestData),
      riskFactors: this.identifyRiskFactors(latestData),
      recommendations: this.generateRecommendations(latestData),
      nextCheckup: this.calculateNextCheckup(latestData),
      emergencyContacts: this.getEmergencyContacts().map(c => c.name),
      medicalHistory: [],
      currentMedications: [],
      allergies: []
    };
  }

  private calculateOverallHealth(data: HealthMetrics): number {
    // Calculate overall health score based on all metrics
    const scores = [
      data.heartRate > 60 && data.heartRate < 100 ? 100 : 50,
      data.oxygenSaturation > 95 ? 100 : 70,
      data.stressLevel < 50 ? 100 : 100 - data.stressLevel,
      data.mentalHealthScore,
      data.sleepQuality
    ];
    
    return Math.floor(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  private identifyRiskFactors(data: HealthMetrics): string[] {
    const riskFactors: string[] = [];
    
    if (data.heartRate > 100) riskFactors.push('Elevated heart rate');
    if (data.oxygenSaturation < 95) riskFactors.push('Low oxygen saturation');
    if (data.stressLevel > 70) riskFactors.push('High stress levels');
    if (data.mentalHealthScore < 50) riskFactors.push('Mental health concerns');
    
    return riskFactors;
  }

  private generateRecommendations(data: HealthMetrics): string[] {
    const recommendations: string[] = [];
    
    if (data.stressLevel > 70) recommendations.push('Consider stress management techniques');
    if (data.mentalHealthScore < 50) recommendations.push('Speak with a mental health professional');
    if (data.sleepQuality < 50) recommendations.push('Improve sleep hygiene');
    if (data.activityLevel < 30) recommendations.push('Increase physical activity');
    
    return recommendations;
  }

  private calculateNextCheckup(data: HealthMetrics): Date {
    const riskLevel = this.calculateEmergencyRisk();
    const daysUntilCheckup = riskLevel > 70 ? 7 : riskLevel > 50 ? 30 : 90;
    
    const nextCheckup = new Date();
    nextCheckup.setDate(nextCheckup.getDate() + daysUntilCheckup);
    
    return nextCheckup;
  }

  // Emergency manual trigger
  public async triggerManualEmergency(): Promise<void> {
    const detection: EmergencyDetection = {
      isEmergency: true,
      emergencyType: 'physical',
      confidence: 100,
      severity: 'high',
      symptoms: ['Manual emergency trigger activated'],
      recommendedAction: 'Immediate attention required',
      shouldCall911: true,
      location: this.currentLocation
    };

    await this.handleEmergency(detection);
  }

  // Get current health status
  public getCurrentHealthStatus(): HealthMetrics | null {
    return this.healthData.length > 0 ? this.healthData[this.healthData.length - 1] : null;
  }

  // Check if monitoring is active
  public isHealthMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}

export default LumaAIService; 