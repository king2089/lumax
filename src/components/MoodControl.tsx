import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMood } from '../context/MoodContext';
import { MoodType } from './MoodRayGlow';

interface MoodControlProps {
  isVisible: boolean;
  onClose: () => void;
}

const MOOD_OPTIONS: Array<{
  type: MoodType;
  name: string;
  emoji: string;
  description: string;
  colors: string[];
}> = [
  {
    type: 'happy',
    name: 'Happy',
    emoji: '🌟',
    description: 'Radiating joy and positivity',
    colors: ['#FFD700', '#FFA500', '#FF6B6B'],
  },
  {
    type: 'calm',
    name: 'Calm',
    emoji: '🌊',
    description: 'Serene and peaceful',
    colors: ['#87CEEB', '#98FB98', '#DDA0DD'],
  },
  {
    type: 'energetic',
    name: 'Energetic',
    emoji: '⚡',
    description: 'Full of dynamic energy',
    colors: ['#FF4500', '#FF6347', '#FF8C00'],
  },
  {
    type: 'focused',
    name: 'Focused',
    emoji: '🎯',
    description: 'Sharp and concentrated',
    colors: ['#4169E1', '#1E90FF', '#00CED1'],
  },
  {
    type: 'creative',
    name: 'Creative',
    emoji: '🎨',
    description: 'Sparking imagination',
    colors: ['#9932CC', '#DA70D6', '#FF69B4'],
  },
  {
    type: 'social',
    name: 'Social',
    emoji: '🤝',
    description: 'Connecting and engaging',
    colors: ['#32CD32', '#00FF7F', '#98FB98'],
  },
  {
    type: 'relaxed',
    name: 'Relaxed',
    emoji: '😌',
    description: 'At ease and comfortable',
    colors: ['#F0E68C', '#DDA0DD', '#98FB98'],
  },
  {
    type: 'productive',
    name: 'Productive',
    emoji: '📈',
    description: 'Efficient and accomplished',
    colors: ['#00CED1', '#20B2AA', '#48D1CC'],
  },
];

export const MoodControl: React.FC<MoodControlProps> = ({ isVisible, onClose }) => {
  const { currentMood, moodIntensity, isMoodDetectionEnabled, setMood, setMoodIntensity, toggleMoodDetection, getMoodDescription } = useMood();
  const [localIntensity, setLocalIntensity] = useState(moodIntensity);

  const handleMoodSelect = (mood: MoodType) => {
    setMood(mood);
  };

  const handleIntensityChange = (value: number) => {
    setLocalIntensity(value);
    setMoodIntensity(value);
  };

  const currentMoodOption = MOOD_OPTIONS.find(option => option.type === currentMood);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.7)']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AI Mood Control</Text>
            <Text style={styles.headerSubtitle}>Powered by Luma Go</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Mood Display */}
          <View style={styles.currentMoodSection}>
            <LinearGradient
              colors={currentMoodOption?.colors as any || ['#00C853', '#64DD17']}
              style={styles.currentMoodCard}
            >
              <Text style={styles.currentMoodEmoji}>{currentMoodOption?.emoji}</Text>
              <Text style={styles.currentMoodName}>{currentMoodOption?.name}</Text>
              <Text style={styles.currentMoodDescription}>{getMoodDescription()}</Text>
            </LinearGradient>
          </View>

          {/* AI Detection Toggle */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star-outline" size={20} color="#00C853" />
              <Text style={styles.sectionTitle}>AI Mood Detection</Text>
            </View>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>
                {isMoodDetectionEnabled ? 'AI automatically detects your mood' : 'AI detection disabled'}
              </Text>
              <Switch
                value={isMoodDetectionEnabled}
                onValueChange={toggleMoodDetection}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#00C853' }}
                thumbColor={isMoodDetectionEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Intensity Control */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash" size={20} color="#00C853" />
              <Text style={styles.sectionTitle}>Ray Glow Intensity</Text>
            </View>
            <View style={styles.intensityContainer}>
              <Text style={styles.intensityLabel}>Intensity: {Math.round(localIntensity * 100)}%</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={localIntensity}
                onValueChange={handleIntensityChange}
                minimumTrackTintColor="#00C853"
                maximumTrackTintColor="rgba(255,255,255,0.3)"
              />
            </View>
          </View>

          {/* Mood Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={20} color="#00C853" />
              <Text style={styles.sectionTitle}>Choose Your Mood</Text>
            </View>
            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.type}
                  style={[
                    styles.moodOption,
                    currentMood === mood.type && styles.moodOptionSelected,
                  ]}
                  onPress={() => handleMoodSelect(mood.type)}
                >
                  <LinearGradient
                    colors={mood.colors as any}
                    style={[
                      styles.moodOptionGradient,
                      currentMood === mood.type && styles.moodOptionGradientSelected,
                    ]}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={styles.moodName}>{mood.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color="#00C853" />
              <Text style={styles.sectionTitle}>How It Works</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                🎭 <Text style={styles.infoHighlight}>AI Mood Detection:</Text> Luma Go analyzes your activities and automatically adjusts the ray glow effects to match your mood.
              </Text>
              <Text style={styles.infoText}>
                ✨ <Text style={styles.infoHighlight}>Ray Glow Technology:</Text> Advanced lighting effects that respond to your emotional state, creating a personalized visual experience.
              </Text>
              <Text style={styles.infoText}>
                🎨 <Text style={styles.infoHighlight}>8 Mood States:</Text> From energetic orange to calm blue, each mood has unique colors, animations, and intensities.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  currentMoodSection: {
    marginBottom: 24,
  },
  currentMoodCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  currentMoodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  currentMoodName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  currentMoodDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
    marginRight: 16,
  },
  intensityContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  intensityLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#00C853',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodOption: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  moodOptionSelected: {
    transform: [{ scale: 1.05 }],
  },
  moodOptionGradient: {
    padding: 16,
    alignItems: 'center',
    opacity: 0.7,
  },
  moodOptionGradientSelected: {
    opacity: 1,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoHighlight: {
    color: '#00C853',
    fontWeight: '600',
  },
}); 