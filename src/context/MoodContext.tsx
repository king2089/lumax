import React, { createContext, useContext, useState, useEffect } from 'react';
import { MoodType } from '../components/MoodRayGlow';

interface MoodContextType {
  currentMood: MoodType;
  moodIntensity: number;
  isMoodDetectionEnabled: boolean;
  setMood: (mood: MoodType) => void;
  setMoodIntensity: (intensity: number) => void;
  toggleMoodDetection: () => void;
  detectMoodFromActivity: (activity: string) => void;
  getMoodDescription: () => string;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};

interface MoodProviderProps {
  children: React.ReactNode;
}

// AI-powered mood detection based on user activity
const MOOD_ACTIVITY_MAPPING: Record<string, MoodType> = {
  // Social activities
  'post': 'social',
  'comment': 'social',
  'share': 'social',
  'like': 'social',
  'message': 'social',
  'chat': 'social',
  
  // Creative activities
  'create': 'creative',
  'design': 'creative',
  'write': 'creative',
  'draw': 'creative',
  'edit': 'creative',
  'compose': 'creative',
  
  // Productive activities
  'work': 'productive',
  'study': 'productive',
  'read': 'productive',
  'organize': 'productive',
  'plan': 'productive',
  'complete': 'productive',
  
  // Focused activities
  'focus': 'focused',
  'concentrate': 'focused',
  'analyze': 'focused',
  'research': 'focused',
  'solve': 'focused',
  
  // Energetic activities
  'exercise': 'energetic',
  'workout': 'energetic',
  'dance': 'energetic',
  'run': 'energetic',
  'play': 'energetic',
  'game': 'energetic',
  
  // Relaxed activities
  'rest': 'relaxed',
  'sleep': 'relaxed',
  'meditate': 'relaxed',
  'breathe': 'relaxed',
  'chill': 'relaxed',
  'relax': 'relaxed',
  
  // Calm activities
  'listen': 'calm',
  'observe': 'calm',
  'reflect': 'calm',
  'think': 'calm',
  'contemplate': 'calm',
  
  // Happy activities
  'laugh': 'happy',
  'smile': 'happy',
  'celebrate': 'happy',
  'enjoy': 'happy',
  'fun': 'happy',
  'party': 'happy',
};

const MOOD_DESCRIPTIONS: Record<MoodType, string> = {
  happy: '🌟 Radiating joy and positivity with golden warmth',
  calm: '🌊 Serene and peaceful with gentle blue tranquility',
  energetic: '⚡ Full of dynamic energy with vibrant orange power',
  focused: '🎯 Sharp and concentrated with deep blue clarity',
  creative: '🎨 Sparking imagination with purple inspiration',
  social: '🤝 Connecting and engaging with green harmony',
  relaxed: '😌 At ease and comfortable with soft pastels',
  productive: '📈 Efficient and accomplished with teal precision',
};

export const MoodProvider: React.FC<MoodProviderProps> = ({ children }) => {
  const [currentMood, setCurrentMood] = useState<MoodType>('happy');
  const [moodIntensity, setMoodIntensity] = useState(0.7);
  const [isMoodDetectionEnabled, setIsMoodDetectionEnabled] = useState(true);

  // AI mood detection based on user activity
  const detectMoodFromActivity = (activity: string) => {
    if (!isMoodDetectionEnabled) return;

    const activityLower = activity.toLowerCase();
    
    // Find matching mood based on activity keywords
    for (const [keyword, mood] of Object.entries(MOOD_ACTIVITY_MAPPING)) {
      if (activityLower.includes(keyword)) {
        setCurrentMood(mood);
        
        // Adjust intensity based on activity strength
        if (activityLower.includes('intense') || activityLower.includes('heavy')) {
          setMoodIntensity(0.9);
        } else if (activityLower.includes('light') || activityLower.includes('gentle')) {
          setMoodIntensity(0.4);
        } else {
          setMoodIntensity(0.7);
        }
        
        console.log(`🎭 AI detected mood: ${mood} from activity: ${activity}`);
        return;
      }
    }
    
    // Default mood transitions based on time of day
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      setCurrentMood('energetic');
    } else if (hour >= 12 && hour < 17) {
      setCurrentMood('focused');
    } else if (hour >= 17 && hour < 21) {
      setCurrentMood('social');
    } else {
      setCurrentMood('relaxed');
    }
  };

  const setMood = (mood: MoodType) => {
    setCurrentMood(mood);
    console.log(`🎭 Mood manually set to: ${mood}`);
  };

  const toggleMoodDetection = () => {
    setIsMoodDetectionEnabled(!isMoodDetectionEnabled);
    console.log(`🎭 Mood detection ${!isMoodDetectionEnabled ? 'enabled' : 'disabled'}`);
  };

  const getMoodDescription = () => {
    return MOOD_DESCRIPTIONS[currentMood];
  };

  // Auto-detect mood based on time of day on app start
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      setCurrentMood('energetic');
    } else if (hour >= 12 && hour < 17) {
      setCurrentMood('focused');
    } else if (hour >= 17 && hour < 21) {
      setCurrentMood('social');
    } else {
      setCurrentMood('relaxed');
    }
  }, []);

  const value: MoodContextType = {
    currentMood,
    moodIntensity,
    isMoodDetectionEnabled,
    setMood,
    setMoodIntensity,
    toggleMoodDetection,
    detectMoodFromActivity,
    getMoodDescription,
  };

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
}; 