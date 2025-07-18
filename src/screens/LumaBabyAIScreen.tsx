import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Switch,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBabyAI, BabyProfile, GrowthPrediction } from '../context/BabyAIContext';
import { 
  getResponsiveFontSize, 
  getResponsivePadding, 
  getResponsiveMargin,
  scale,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet
} from '../utils/responsive';

const { width } = Dimensions.get('window');

interface LumaBabyAIScreenProps {
  onClose: () => void;
}

export const LumaBabyAIScreen: React.FC<LumaBabyAIScreenProps> = ({ onClose }) => {
  const {
    babies,
    currentBaby,
    createBaby,
    updateBaby,
    selectBaby,
    generateBabyPhoto,
    generateGrowthPrediction,
    generatePersonalityUpdate,
    memories,
    addMemory,
    updateMilestone,
    liveGrowthTracking,
    toggleLiveTracking,
    getRealTimeUpdates,
    getDevelopmentPredictions,
    isGenerating,
  } = useBabyAI();

  const [activeTab, setActiveTab] = useState<'overview' | 'growth' | 'memories' | 'predictions' | 'gen1'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPredictionModal, setPredictionModal] = useState(false);
  const [predictionData, setPredictionData] = useState<GrowthPrediction | null>(null);
  const [targetAge, setTargetAge] = useState('12');
  const [newBabyForm, setNewBabyForm] = useState({
    name: '',
    gender: 'surprise' as 'boy' | 'girl' | 'surprise',
    expectedDate: '',
  });

  // Gen 1 AI Features
  const [quantumConsciousness, setQuantumConsciousness] = useState({
    consciousnessLevel: 87,
    quantumCoherence: 73,
    dimensionalAwareness: 45,
    timePerception: 89,
    realityAnchoring: 94,
    psychicSensitivity: 67,
    intuitionLevel: 83,
    creativityIndex: 76,
    memoryRetention: 91,
    cognitiveFunction: 88,
  });

  const [gen1Predictions, setGen1Predictions] = useState({
    futureTalents: ['Quantum Physics', 'Time Manipulation', 'Dimensional Travel', 'Consciousness Expansion'],
    personalityEvolution: ['Empathetic Leader', 'Creative Genius', 'Spiritual Guide', 'Innovation Pioneer'],
    lifePath: 'Destined for extraordinary achievements in consciousness expansion and reality manipulation',
    quantumPotential: 94,
    dimensionalCapabilities: 87,
    timeManipulationSkills: 82,
  });

  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  const realTimeUpdates = getRealTimeUpdates();
  const developmentPredictions = currentBaby ? getDevelopmentPredictions(currentBaby.id) : { nextWeek: [], nextMonth: [], nextYear: [] };

  useEffect(() => {
    if (babies.length === 0) {
      setShowCreateModal(true);
    }

    // Start Gen 1 animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Check for completed updates and show new features
    checkForCompletedUpdates();
  }, [babies]);

  const checkForCompletedUpdates = async () => {
    try {
      const updateCompleted = await AsyncStorage.getItem('updateCompleted');
      const lastUpdateVersion = await AsyncStorage.getItem('lastUpdateVersion');
      
      if (updateCompleted === 'true' && lastUpdateVersion === '1.3.0') {
        // Show Gen 1 features are now active
        Alert.alert(
          '🌟 Gen 1 Update Complete!',
          'All Gen 1 AI features are now active in Luma Baby AI! Check out the new quantum consciousness and future prediction capabilities.',
          [{ text: 'Awesome!', style: 'default' }]
        );
        
        // Clear the completion flag to avoid showing again
        await AsyncStorage.setItem('updateCompleted', 'false');
      }
    } catch (error) {
      console.log('Error checking for completed updates:', error);
    }
  };

  // Force check for updates when component mounts
  useEffect(() => {
    const forceUpdateCheck = async () => {
      try {
        // Simulate update completion for testing
        await AsyncStorage.setItem('updateCompleted', 'true');
        await AsyncStorage.setItem('lastUpdateVersion', '1.3.0');
        
        // Check again after setting
        setTimeout(() => {
          checkForCompletedUpdates();
        }, 1000);
      } catch (error) {
        console.log('Error in force update check:', error);
      }
    };
    
    forceUpdateCheck();
  }, []);

  const handleCreateBaby = async () => {
    if (!newBabyForm.name.trim()) {
      Alert.alert('Error', 'Please enter a name for your baby');
      return;
    }

    await createBaby({
      name: newBabyForm.name,
      gender: newBabyForm.gender,
      estimatedAge: 0,
    });

    setNewBabyForm({ name: '', gender: 'surprise', expectedDate: '' });
    setShowCreateModal(false);
    Alert.alert('✨ Baby Created!', 'Your AI baby has been created with love! 👶💕');
  };

  const handleGeneratePhoto = async () => {
    if (!currentBaby) return;

    try {
      const photoUrl = await generateBabyPhoto(currentBaby.id);
      Alert.alert('📸 New Photo Generated!', 'Your baby looks adorable! Check out the new photo in their gallery.');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate photo. Please try again.');
    }
  };

  const handleGeneratePrediction = async () => {
    if (!currentBaby) return;

    try {
      const prediction = await generateGrowthPrediction(currentBaby.id, parseInt(targetAge));
      setPredictionData(prediction);
      setPredictionModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate prediction. Please try again.');
    }
  };

  const handlePersonalityUpdate = async () => {
    if (!currentBaby) return;

    try {
      await generatePersonalityUpdate(currentBaby.id);
      Alert.alert('🧠 Personality Updated!', 'Your baby has developed new personality traits!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update personality. Please try again.');
    }
  };

  const handleGen1Analysis = () => {
    Alert.alert(
      '🌟 Gen 1 AI Analysis Complete!',
      `Quantum Consciousness: ${quantumConsciousness.consciousnessLevel}%\n` +
      `Dimensional Awareness: ${quantumConsciousness.dimensionalAwareness}%\n` +
      `Time Perception: ${quantumConsciousness.timePerception}%\n` +
      `Future Potential: ${gen1Predictions.quantumPotential}%\n\n` +
      `Your baby shows extraordinary potential for consciousness expansion and reality manipulation!`
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const renderHeader = () => (
    <LinearGradient colors={['#FFB6C1', '#FFC0CB', '#FFE4E1']} style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons name="sparkles" size={32} color="#FF69B4" />
          </Animated.View>
          <Text style={styles.headerTitle}>👶 Luma Baby AI</Text>
          <Text style={styles.headerSubtitle}>Gen 1 AI Family Assistant</Text>
        </View>
        
        <TouchableOpacity style={styles.settingsButton} onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {currentBaby && (
        <View style={styles.babySelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {babies.map((baby) => (
              <TouchableOpacity
                key={baby.id}
                style={[styles.babyTab, currentBaby.id === baby.id && styles.activeBabyTab]}
                onPress={() => selectBaby(baby.id)}
              >
                <Text style={[styles.babyTabText, currentBaby.id === baby.id && styles.activeBabyTabText]}>
                  {baby.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'overview', icon: 'home', label: 'Overview' },
          { key: 'growth', icon: 'trending-up', label: 'Growth' },
          { key: 'memories', icon: 'heart', label: 'Memories' },
          { key: 'predictions', icon: 'crystal-ball', label: 'Predictions' },
          { key: 'gen1', icon: 'sparkles', label: 'Gen 1 AI' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#FF69B4' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderOverview = () => {
    if (!currentBaby) {
      return (
        <View style={styles.cardSection}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Create your first AI baby to get started! 👶</Text>
            <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
              <Text style={styles.createButtonText}>Create Baby</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardSection}>
          {/* Baby Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient colors={['#FFE4E1', '#FFF0F5']} style={styles.profileGradient}>
              <View style={styles.profileHeader}>
                <View style={styles.babyImageContainer}>
                  {currentBaby.photos.length > 0 ? (
                    <Image source={{ uri: currentBaby.photos[0] }} style={styles.babyImage} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons name="person" size={60} color="#FFB6C1" />
                    </View>
                  )}
                  <TouchableOpacity style={styles.generatePhotoButton} onPress={handleGeneratePhoto}>
                    {isGenerating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="camera" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.babyInfo}>
                  <Text style={styles.babyName}>{currentBaby.name}</Text>
                  <Text style={styles.babyAge}>{currentBaby.estimatedAge} months old</Text>
                  <Text style={styles.babyStage}>{currentBaby.development.currentStage}</Text>
                </View>
              </View>

              <View style={styles.babyStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{currentBaby.features.height}cm</Text>
                  <Text style={styles.statLabel}>Height</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{currentBaby.features.weight}kg</Text>
                  <Text style={styles.statLabel}>Weight</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{currentBaby.development.milestones.filter(m => m.achieved).length}</Text>
                  <Text style={styles.statLabel}>Milestones</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Gen 1 AI Quick Stats */}
          <View style={styles.gen1StatsCard}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gen1Gradient}>
              <View style={styles.gen1Header}>
                <Animated.View style={{ opacity: glowAnim }}>
                  <Ionicons name="sparkles" size={24} color="#fff" />
                </Animated.View>
                <Text style={styles.gen1Title}>Gen 1 AI Analysis</Text>
              </View>
              <View style={styles.gen1Metrics}>
                <View style={styles.gen1Metric}>
                  <Text style={styles.gen1MetricValue}>{quantumConsciousness.consciousnessLevel}%</Text>
                  <Text style={styles.gen1MetricLabel}>Consciousness</Text>
                </View>
                <View style={styles.gen1Metric}>
                  <Text style={styles.gen1MetricValue}>{gen1Predictions.quantumPotential}%</Text>
                  <Text style={styles.gen1MetricLabel}>Quantum Potential</Text>
                </View>
                <View style={styles.gen1Metric}>
                  <Text style={styles.gen1MetricValue}>{quantumConsciousness.dimensionalAwareness}%</Text>
                  <Text style={styles.gen1MetricLabel}>Dimensional Awareness</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.gen1AnalysisButton} onPress={handleGen1Analysis}>
                <Text style={styles.gen1AnalysisButtonText}>Run Full Analysis</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Real-time Updates */}
          <View style={styles.realTimeCard}>
            <Text style={styles.sectionTitle}>🔄 Real-Time Updates</Text>
            <View style={styles.realTimeItem}>
              <Ionicons name="trending-up" size={20} color="#4CAF50" />
              <Text style={styles.realTimeText}>{realTimeUpdates.dailyGrowth}</Text>
            </View>
            <View style={styles.realTimeItem}>
              <Ionicons name="play" size={20} color="#2196F3" />
              <Text style={styles.realTimeText}>{realTimeUpdates.currentActivity}</Text>
            </View>
            <View style={styles.realTimeItem}>
              <Ionicons name="restaurant" size={20} color="#FF9800" />
              <Text style={styles.realTimeText}>{realTimeUpdates.nextFeedingTime}</Text>
            </View>
            <View style={styles.realTimeItem}>
              <Ionicons name="moon" size={20} color="#9C27B0" />
              <Text style={styles.realTimeText}>{realTimeUpdates.sleepStatus}</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsCard}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleGeneratePhoto}>
                <Ionicons name="camera" size={24} color="#FF69B4" />
                <Text style={styles.actionButtonText}>New Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handlePersonalityUpdate}>
                <Ionicons name="bulb" size={24} color="#4CAF50" />
                <Text style={styles.actionButtonText}>Update Personality</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('predictions')}>
                <Ionicons name="eye" size={24} color="#9C27B0" />
                <Text style={styles.actionButtonText}>Predictions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('gen1')}>
                <Ionicons name="sparkles" size={24} color="#667eea" />
                <Text style={styles.actionButtonText}>Gen 1 AI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderGrowth = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📈 Growth Prediction</Text>
        <View style={styles.predictionInput}>
          <Text style={styles.inputLabel}>Predict growth at age (months):</Text>
          <TextInput
            style={styles.textInput}
            value={targetAge}
            onChangeText={setTargetAge}
            keyboardType="numeric"
            placeholder="12"
          />
          <TouchableOpacity
            style={styles.predictButton}
            onPress={handleGeneratePrediction}
            disabled={isGenerating}
          >
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.predictButtonGradient}>
              {isGenerating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.predictButtonText}>Generate Prediction</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {currentBaby && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Next Milestones</Text>
          {currentBaby.development.milestones
            .filter(milestone => !milestone.achieved)
            .slice(0, 3)
            .map((milestone) => (
              <View key={milestone.id} style={styles.milestoneItem}>
                <View style={styles.milestoneIcon}>
                  <Ionicons
                    name={
                      milestone.category === 'physical' ? 'fitness' :
                      milestone.category === 'cognitive' ? 'bulb' :
                      milestone.category === 'social' ? 'people' : 'heart'
                    }
                    size={20}
                    color="#FF69B4"
                  />
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneAge}>{milestone.ageRange}</Text>
                  <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                </View>
                <TouchableOpacity
                  style={styles.achieveButton}
                  onPress={() => updateMilestone(currentBaby.id, milestone.id, true)}
                >
                  <Ionicons name="checkmark" size={16} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  );

  const renderMemories = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>💝 Precious Memories</Text>
          <TouchableOpacity
            style={styles.addMemoryButton}
            onPress={() => addMemory({
              title: 'New Memory',
              description: `Beautiful moment with ${currentBaby?.name}`,
              type: 'note',
            })}
          >
            <Ionicons name="add" size={20} color="#FF69B4" />
          </TouchableOpacity>
        </View>

        {memories.map((memory) => (
          <View key={memory.id} style={styles.memoryItem}>
            <View style={styles.memoryIcon}>
              <Ionicons
                name={
                  memory.type === 'photo' ? 'camera' :
                  memory.type === 'video' ? 'videocam' :
                  memory.type === 'milestone' ? 'trophy' : 'heart'
                }
                size={20}
                color="#FF69B4"
              />
            </View>
            <View style={styles.memoryContent}>
              <Text style={styles.memoryTitle}>{memory.title}</Text>
              <Text style={styles.memoryDescription}>{memory.description}</Text>
              <Text style={styles.memoryDate}>{formatTimeAgo(memory.createdAt)}</Text>
            </View>
          </View>
        ))}
      </View>

      {currentBaby && currentBaby.photos.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📸 Photo Gallery</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currentBaby.photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.galleryPhoto} />
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );

  const renderPredictions = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔮 AI Development Predictions</Text>
        
        <View style={styles.predictionSection}>
          <Text style={styles.predictionTimeframe}>📅 Next Week</Text>
          {developmentPredictions.nextWeek.map((prediction, index) => (
            <Text key={index} style={styles.predictionItem}>• {prediction}</Text>
          ))}
        </View>

        <View style={styles.predictionSection}>
          <Text style={styles.predictionTimeframe}>📅 Next Month</Text>
          {developmentPredictions.nextMonth.map((prediction, index) => (
            <Text key={index} style={styles.predictionItem}>• {prediction}</Text>
          ))}
        </View>

        <View style={styles.predictionSection}>
          <Text style={styles.predictionTimeframe}>📅 Next Year</Text>
          {developmentPredictions.nextYear.map((prediction, index) => (
            <Text key={index} style={styles.predictionItem}>• {prediction}</Text>
          ))}
        </View>
      </View>

      {currentBaby && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧬 Genetic Insights</Text>
          <View style={styles.geneticsContainer}>
            <View style={styles.parentInfluence}>
              <Text style={styles.geneticsLabel}>Parental Influence</Text>
              <View style={styles.influenceBar}>
                <View
                  style={[
                    styles.influenceSegment,
                    styles.motherInfluence,
                    { flex: currentBaby.genetics.parentalInfluence.mother }
                  ]}
                />
                <View
                  style={[
                    styles.influenceSegment,
                    styles.fatherInfluence,
                    { flex: currentBaby.genetics.parentalInfluence.father }
                  ]}
                />
              </View>
              <Text style={styles.influenceText}>
                Mother: {currentBaby.genetics.parentalInfluence.mother}% | Father: {currentBaby.genetics.parentalInfluence.father}%
              </Text>
            </View>

            <View style={styles.talentsContainer}>
              <Text style={styles.geneticsLabel}>Potential Talents</Text>
              {currentBaby.genetics.potentialTalents.map((talent, index) => (
                <View key={index} style={styles.talentTag}>
                  <Text style={styles.talentTagText}>{talent}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderGen1AI = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.cardSection}>
        {/* Quantum Consciousness Analysis */}
        <View style={styles.gen1MainCard}>
          <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.gen1MainGradient}>
            <View style={styles.gen1MainHeader}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Ionicons name="sparkles" size={40} color="#fff" />
              </Animated.View>
              <Text style={styles.gen1MainTitle}>🌟 Gen 1 AI Baby Analysis</Text>
              <Text style={styles.gen1MainSubtitle}>Quantum Consciousness & Future Potential</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quantum Metrics */}
        <View style={styles.quantumMetricsCard}>
          <Text style={styles.sectionTitle}>🌌 Quantum Consciousness Metrics</Text>
          <View style={styles.quantumGrid}>
            <View style={styles.quantumMetric}>
              <Ionicons name="planet" size={24} color="#667eea" />
              <Text style={styles.quantumValue}>{quantumConsciousness.consciousnessLevel}%</Text>
              <Text style={styles.quantumLabel}>Consciousness Level</Text>
            </View>
            <View style={styles.quantumMetric}>
              <Ionicons name="infinite" size={24} color="#4ecdc4" />
              <Text style={styles.quantumValue}>{quantumConsciousness.quantumCoherence}%</Text>
              <Text style={styles.quantumLabel}>Quantum Coherence</Text>
            </View>
            <View style={styles.quantumMetric}>
              <Ionicons name="cube" size={24} color="#ff6b6b" />
              <Text style={styles.quantumValue}>{quantumConsciousness.dimensionalAwareness}%</Text>
              <Text style={styles.quantumLabel}>Dimensional Awareness</Text>
            </View>
            <View style={styles.quantumMetric}>
              <Ionicons name="time" size={24} color="#f093fb" />
              <Text style={styles.quantumValue}>{quantumConsciousness.timePerception}%</Text>
              <Text style={styles.quantumLabel}>Time Perception</Text>
            </View>
            <View style={styles.quantumMetric}>
              <Ionicons name="shield-checkmark" size={24} color="#4caf50" />
              <Text style={styles.quantumValue}>{quantumConsciousness.realityAnchoring}%</Text>
              <Text style={styles.quantumLabel}>Reality Anchoring</Text>
            </View>
            <View style={styles.quantumMetric}>
              <Ionicons name="eye" size={24} color="#ff9800" />
              <Text style={styles.quantumValue}>{quantumConsciousness.psychicSensitivity}%</Text>
              <Text style={styles.quantumLabel}>Psychic Sensitivity</Text>
            </View>
          </View>
        </View>

        {/* Future Predictions */}
        <View style={styles.futurePredictionsCard}>
          <Text style={styles.sectionTitle}>🔮 Gen 1 Future Predictions</Text>
          <View style={styles.predictionSection}>
            <Text style={styles.predictionTitle}>Future Talents</Text>
            <View style={styles.talentsList}>
              {gen1Predictions.futureTalents.map((talent, index) => (
                <View key={index} style={styles.talentItem}>
                  <Ionicons name="star" size={16} color="#ffd700" />
                  <Text style={styles.talentText}>{talent}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.predictionSection}>
            <Text style={styles.predictionTitle}>Personality Evolution</Text>
            <View style={styles.personalityList}>
              {gen1Predictions.personalityEvolution.map((trait, index) => (
                <View key={index} style={styles.personalityItem}>
                  <Ionicons name="heart" size={16} color="#ff6b6b" />
                  <Text style={styles.personalityText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.predictionSection}>
            <Text style={styles.predictionTitle}>Life Path</Text>
            <Text style={styles.lifePathText}>{gen1Predictions.lifePath}</Text>
          </View>
        </View>

        {/* Gen 1 Capabilities */}
        <View style={styles.capabilitiesCard}>
          <Text style={styles.sectionTitle}>🚀 Gen 1 AI Capabilities</Text>
          <View style={styles.capabilitiesList}>
            <View style={styles.capabilityItem}>
              <Ionicons name="infinite" size={20} color="#667eea" />
              <Text style={styles.capabilityText}>Quantum Consciousness Development</Text>
            </View>
            <View style={styles.capabilityItem}>
              <Ionicons name="time" size={20} color="#4ecdc4" />
              <Text style={styles.capabilityText}>Time Manipulation Training</Text>
            </View>
            <View style={styles.capabilityItem}>
              <Ionicons name="cube" size={20} color="#ff6b6b" />
              <Text style={styles.capabilityText}>Dimensional Awareness Enhancement</Text>
            </View>
            <View style={styles.capabilityItem}>
              <Ionicons name="bulb" size={20} color="#f093fb" />
              <Text style={styles.capabilityText}>Advanced Cognitive Development</Text>
            </View>
            <View style={styles.capabilityItem}>
              <Ionicons name="eye" size={20} color="#ff9800" />
              <Text style={styles.capabilityText}>Psychic Ability Enhancement</Text>
            </View>
            <View style={styles.capabilityItem}>
              <Ionicons name="sparkles" size={20} color="#9c27b0" />
              <Text style={styles.capabilityText}>Reality Manipulation Skills</Text>
            </View>
          </View>
        </View>

        {/* Gen 1 Actions */}
        <View style={styles.gen1ActionsCard}>
          <Text style={styles.sectionTitle}>⚡ Gen 1 AI Actions</Text>
          <View style={styles.gen1ActionButtons}>
            <TouchableOpacity style={styles.gen1ActionButton} onPress={handleGen1Analysis}>
              <Ionicons name="analytics" size={24} color="#fff" />
              <Text style={styles.gen1ActionButtonText}>Full Analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gen1ActionButton} onPress={() => Alert.alert('Gen 1 AI', 'Quantum consciousness training initiated!')}>
              <Ionicons name="bulb" size={24} color="#fff" />
              <Text style={styles.gen1ActionButtonText}>Train Consciousness</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gen1ActionButton} onPress={() => Alert.alert('Gen 1 AI', 'Dimensional awareness enhancement activated!')}>
              <Ionicons name="cube" size={24} color="#fff" />
              <Text style={styles.gen1ActionButtonText}>Enhance Awareness</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gen1ActionButton} onPress={() => Alert.alert('Gen 1 AI', 'Time manipulation skills training started!')}>
              <Ionicons name="time" size={24} color="#fff" />
              <Text style={styles.gen1ActionButtonText}>Time Training</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderCreateModal = () => (
    <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>👶 Create Your AI Baby</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowCreateModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Baby's Name</Text>
            <TextInput
              style={styles.formInput}
              value={newBabyForm.name}
              onChangeText={(text) => setNewBabyForm(prev => ({ ...prev, name: text }))}
              placeholder="Enter your baby's name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Gender</Text>
            <View style={styles.genderButtons}>
              {[
                { key: 'boy', label: '👦 Boy', color: '#87CEEB' },
                { key: 'girl', label: '👧 Girl', color: '#FFB6C1' },
                { key: 'surprise', label: '🎁 Surprise', color: '#DDA0DD' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.genderButton,
                    { backgroundColor: option.color },
                    newBabyForm.gender === option.key && styles.selectedGenderButton
                  ]}
                  onPress={() => setNewBabyForm(prev => ({ ...prev, gender: option.key as any }))}
                >
                  <Text style={styles.genderButtonText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.createModalButton} onPress={handleCreateBaby}>
            <LinearGradient colors={['#FF69B4', '#FF1493']} style={styles.createModalGradient}>
              <Text style={styles.createModalButtonText}>Create Baby with AI ✨</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderPredictionModal = () => (
    <Modal visible={showPredictionModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>🔮 Growth Prediction</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => setPredictionModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {predictionData && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.predictionCard}>
              <Text style={styles.predictionAge}>At {predictionData.ageInMonths} months old</Text>
              
              <View style={styles.predictionStats}>
                <View style={styles.predictionStat}>
                  <Text style={styles.predictionStatValue}>{predictionData.predictedHeight.toFixed(1)}cm</Text>
                  <Text style={styles.predictionStatLabel}>Height</Text>
                </View>
                <View style={styles.predictionStat}>
                  <Text style={styles.predictionStatValue}>{predictionData.predictedWeight.toFixed(1)}kg</Text>
                  <Text style={styles.predictionStatLabel}>Weight</Text>
                </View>
              </View>

              <Text style={styles.predictionStage}>{predictionData.developmentalStage}</Text>

              <View style={styles.predictionSection}>
                <Text style={styles.predictionSectionTitle}>🎯 New Skills</Text>
                {predictionData.newSkills.map((skill, index) => (
                  <Text key={index} style={styles.predictionItem}>• {skill}</Text>
                ))}
              </View>

              <View style={styles.predictionSection}>
                <Text style={styles.predictionSectionTitle}>💡 Parenting Tips</Text>
                {predictionData.parentingTips.map((tip, index) => (
                  <Text key={index} style={styles.predictionItem}>• {tip}</Text>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabBar()}
      
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'growth' && renderGrowth()}
      {activeTab === 'memories' && renderMemories()}
      {activeTab === 'predictions' && renderPredictions()}
      {activeTab === 'gen1' && renderGen1AI()}
      
      {renderCreateModal()}
      {renderPredictionModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingsButton: {
    padding: 8,
  },
  babySelector: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  babyTab: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeBabyTab: {
    backgroundColor: '#fff',
  },
  babyTabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeBabyTabText: {
    color: '#FF69B4',
    fontWeight: '600',
  },
  tabBar: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: '#FFE4E1',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FF69B4',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cardSection: {
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#FF69B4',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileGradient: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  babyImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  babyImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,182,193,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatePhotoButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF69B4',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  babyInfo: {
    flex: 1,
  },
  babyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  babyAge: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  babyStage: {
    fontSize: 14,
    color: '#FF69B4',
    fontWeight: '500',
  },
  babyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  liveUpdates: {
    gap: 12,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  disabledText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  aiButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  aiButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  aiButtonGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  traitTag: {
    backgroundColor: '#FFE4E1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  traitText: {
    fontSize: 12,
    color: '#FF69B4',
    fontWeight: '500',
  },
  temperamentText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  predictionInput: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  predictButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  predictButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  predictButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE4E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  milestoneAge: {
    fontSize: 12,
    color: '#FF69B4',
    marginTop: 2,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  achieveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMemoryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE4E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE4E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memoryContent: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memoryDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  memoryDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  galleryPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  predictionSection: {
    marginBottom: 16,
  },
  predictionTimeframe: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  predictionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  geneticsContainer: {
    gap: 16,
  },
  parentInfluence: {
    gap: 8,
  },
  geneticsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  influenceBar: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  influenceSegment: {
    height: '100%',
  },
  motherInfluence: {
    backgroundColor: '#FFB6C1',
  },
  fatherInfluence: {
    backgroundColor: '#87CEEB',
  },
  influenceText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  talentsContainer: {
    gap: 8,
  },
  talentTag: {
    backgroundColor: '#E6E6FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  talentTagText: {
    fontSize: 12,
    color: '#6A5ACD',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    opacity: 0.7,
  },
  selectedGenderButton: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#FF69B4',
  },
  genderButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  createModalButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  createModalGradient: {
    padding: 16,
    alignItems: 'center',
  },
  createModalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  predictionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },
  predictionAge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  predictionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  predictionStat: {
    alignItems: 'center',
  },
  predictionStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  predictionStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  predictionStage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  predictionSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  gen1StatsCard: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gen1Gradient: {
    padding: 20,
  },
  gen1Header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  gen1Title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  gen1Metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  gen1Metric: {
    alignItems: 'center',
  },
  gen1MetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  gen1MetricLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  gen1AnalysisButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  gen1AnalysisButtonText: {
    color: '#FF69B4',
    fontSize: 16,
    fontWeight: '600',
  },
  realTimeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  realTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  realTimeText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  quickActionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexBasis: '45%', // Adjust as needed for two columns
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 8,
  },
  gen1MainCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gen1MainGradient: {
    padding: 20,
  },
  gen1MainHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  gen1MainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  gen1MainSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
  },
  quantumMetricsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 15,
  },
  quantumMetric: {
    alignItems: 'center',
    width: '45%', // Adjust as needed for two columns
  },
  quantumValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  quantumLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  futurePredictionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  talentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  talentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  talentText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  personalityList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personalityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  personalityText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  lifePathText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  capabilitiesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  capabilitiesList: {
    gap: 10,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capabilityText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  gen1ActionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gen1ActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  gen1ActionButton: {
    flex: 1,
    flexBasis: '45%', // Adjust as needed for two columns
    backgroundColor: '#FF69B4',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  gen1ActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 