import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface BabyProfile {
  id: string;
  parentId: string;
  partnerId?: string;
  name: string;
  gender: 'boy' | 'girl' | 'surprise';
  estimatedAge: number; // in months for development tracking
  features: {
    eyeColor: string;
    hairColor: string;
    skinTone: string;
    faceShape: string;
    height: number; // cm
    weight: number; // kg
  };
  personality: {
    traits: string[];
    favoriteActivities: string[];
    sleepPattern: 'early-bird' | 'night-owl' | 'regular';
    temperament: 'calm' | 'energetic' | 'curious' | 'social';
  };
  genetics: {
    parentalInfluence: {
      father: number; // percentage
      mother: number; // percentage
    };
    inheritedTraits: string[];
    potentialTalents: string[];
  };
  development: {
    milestones: BabyMilestone[];
    currentStage: string;
    nextMilestone: string;
    estimatedDate: Date;
  };
  photos: string[];
  videos: string[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface BabyMilestone {
  id: string;
  title: string;
  description: string;
  ageRange: string; // e.g., "2-4 months"
  category: 'physical' | 'cognitive' | 'social' | 'emotional';
  achieved: boolean;
  achievedDate?: Date;
  photos: string[];
  notes: string;
}

export interface PartnerRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface BabyMemory {
  id: string;
  babyId: string;
  title: string;
  description: string;
  type: 'photo' | 'video' | 'milestone' | 'note' | 'growth';
  media: string[];
  tags: string[];
  createdAt: Date;
  mood: string;
}

export interface GrowthPrediction {
  ageInMonths: number;
  predictedHeight: number;
  predictedWeight: number;
  developmentalStage: string;
  newSkills: string[];
  parentingTips: string[];
  healthReminders: string[];
}

interface BabyAIContextType {
  // Baby Profiles
  babies: BabyProfile[];
  currentBaby: BabyProfile | null;
  
  // Baby Creation & Management
  createBaby: (babyData: Partial<BabyProfile>) => Promise<void>;
  updateBaby: (babyId: string, updates: Partial<BabyProfile>) => Promise<void>;
  deleteBaby: (babyId: string) => Promise<void>;
  selectBaby: (babyId: string) => void;
  
  // Partner System
  partnerRequests: PartnerRequest[];
  sendPartnerRequest: (partnerId: string, message: string) => Promise<void>;
  respondToPartnerRequest: (requestId: string, accept: boolean) => Promise<void>;
  
  // AI Features
  generateBabyPhoto: (babyId: string) => Promise<string>;
  generateGrowthPrediction: (babyId: string, targetAge: number) => Promise<GrowthPrediction>;
  generatePersonalityUpdate: (babyId: string) => Promise<void>;
  
  // Memories & Milestones
  memories: BabyMemory[];
  addMemory: (memory: Partial<BabyMemory>) => Promise<void>;
  updateMilestone: (babyId: string, milestoneId: string, achieved: boolean) => Promise<void>;
  
  // Real-time Features
  liveGrowthTracking: boolean;
  toggleLiveTracking: () => void;
  getRealTimeUpdates: () => {
    dailyGrowth: string;
    currentActivity: string;
    nextFeedingTime: string;
    sleepStatus: string;
  };
  
  // AI Predictions
  getDevelopmentPredictions: (babyId: string) => {
    nextWeek: string[];
    nextMonth: string[];
    nextYear: string[];
  };
  
  // Loading States
  isGenerating: boolean;
  isLoading: boolean;
}

const BabyAIContext = createContext<BabyAIContextType | undefined>(undefined);

export const useBabyAI = () => {
  const context = useContext(BabyAIContext);
  if (!context) {
    throw new Error('useBabyAI must be used within a BabyAIProvider');
  }
  return context;
};

export const BabyAIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [currentBaby, setCurrentBaby] = useState<BabyProfile | null>(null);
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>([]);
  const [memories, setMemories] = useState<BabyMemory[]>([]);
  const [liveGrowthTracking, setLiveGrowthTracking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStoredData();
    initializeSampleData();
  }, [user]);

  const loadStoredData = async () => {
    try {
      const storedBabies = await AsyncStorage.getItem('@luma_babies');
      const storedMemories = await AsyncStorage.getItem('@luma_baby_memories');
      const storedRequests = await AsyncStorage.getItem('@luma_partner_requests');
      
      if (storedBabies) {
        const babies = JSON.parse(storedBabies).map((baby: any) => ({
          ...baby,
          createdAt: new Date(baby.createdAt),
          lastUpdated: new Date(baby.lastUpdated),
          development: {
            ...baby.development,
            estimatedDate: new Date(baby.development.estimatedDate),
            milestones: baby.development.milestones.map((milestone: any) => ({
              ...milestone,
              achievedDate: milestone.achievedDate ? new Date(milestone.achievedDate) : undefined,
            })),
          },
        }));
        
        const userBabies = babies.filter((baby: BabyProfile) => baby.parentId === user?.id);
        setBabies(userBabies);
        if (userBabies.length > 0) {
          setCurrentBaby(userBabies[0]);
        }
      }
      
      if (storedMemories) {
        const memories = JSON.parse(storedMemories).map((memory: any) => ({
          ...memory,
          createdAt: new Date(memory.createdAt),
        }));
        setMemories(memories);
      }
      
      if (storedRequests) {
        const requests = JSON.parse(storedRequests).map((request: any) => ({
          ...request,
          createdAt: new Date(request.createdAt),
          expiresAt: new Date(request.expiresAt),
        }));
        setPartnerRequests(requests);
      }
    } catch (error) {
      console.error('Error loading baby AI data:', error);
    }
  };

  const saveDataToStorage = async () => {
    try {
      await AsyncStorage.setItem('@luma_babies', JSON.stringify(babies));
      await AsyncStorage.setItem('@luma_baby_memories', JSON.stringify(memories));
      await AsyncStorage.setItem('@luma_partner_requests', JSON.stringify(partnerRequests));
    } catch (error) {
      console.error('Error saving baby AI data:', error);
    }
  };

  const initializeSampleData = async () => {
    if (!user || babies.length > 0) return;

    const sampleMilestones: BabyMilestone[] = [
      {
        id: 'm1',
        title: 'First Smile',
        description: 'Baby develops their first social smile',
        ageRange: '6-8 weeks',
        category: 'social',
        achieved: true,
        achievedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        photos: ['https://via.placeholder.com/300x300/FFB6C1/FFFFFF?text=First+Smile'],
        notes: 'Such a precious moment! 😊',
      },
      {
        id: 'm2',
        title: 'Holds Head Up',
        description: 'Baby can hold their head up during tummy time',
        ageRange: '2-4 months',
        category: 'physical',
        achieved: false,
        photos: [],
        notes: '',
      },
      {
        id: 'm3',
        title: 'First Words',
        description: 'Baby says their first recognizable words',
        ageRange: '10-14 months',
        category: 'cognitive',
        achieved: false,
        photos: [],
        notes: '',
      },
    ];

    const sampleBaby: BabyProfile = {
      id: 'baby1',
      parentId: user.id,
      name: 'Future Baby',
      gender: 'surprise',
      estimatedAge: 3, // 3 months old
      features: {
        eyeColor: 'Brown',
        hairColor: 'Dark Brown',
        skinTone: 'Medium',
        faceShape: 'Round',
        height: 61, // cm
        weight: 5.8, // kg
      },
      personality: {
        traits: ['Curious', 'Playful', 'Gentle', 'Social'],
        favoriteActivities: ['Peek-a-boo', 'Music time', 'Tummy time', 'Story reading'],
        sleepPattern: 'regular',
        temperament: 'calm',
      },
      genetics: {
        parentalInfluence: {
          father: 45,
          mother: 55,
        },
        inheritedTraits: ['Musical ability', 'Athletic build', 'Creative mind'],
        potentialTalents: ['Music', 'Sports', 'Art', 'Mathematics'],
      },
      development: {
        milestones: sampleMilestones,
        currentStage: 'Early Infancy',
        nextMilestone: 'Holds Head Up',
        estimatedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks from now
      },
      photos: [
        'https://via.placeholder.com/400x400/87CEEB/FFFFFF?text=Future+Baby+1',
        'https://via.placeholder.com/400x400/FFB6C1/FFFFFF?text=Future+Baby+2',
        'https://via.placeholder.com/400x400/98FB98/FFFFFF?text=Future+Baby+3',
      ],
      videos: [
        'https://via.placeholder.com/400x300/FFA07A/FFFFFF?text=Baby+Video+1',
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // 3 months ago
      lastUpdated: new Date(),
    };

    const sampleMemory: BabyMemory = {
      id: 'mem1',
      babyId: 'baby1',
      title: 'First Ultrasound',
      description: 'Saw our little one for the first time! 🥺💕',
      type: 'photo',
      media: ['https://via.placeholder.com/300x200/E6E6FA/FFFFFF?text=Ultrasound'],
      tags: ['ultrasound', 'milestone', 'exciting'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180), // 6 months ago
      mood: 'excited',
    };

    setBabies([sampleBaby]);
    setCurrentBaby(sampleBaby);
    setMemories([sampleMemory]);
    
    await saveDataToStorage();
  };

  const createBaby = async (babyData: Partial<BabyProfile>) => {
    if (!user) return;

    const newBaby: BabyProfile = {
      id: Date.now().toString(),
      parentId: user.id,
      name: babyData.name || 'My Baby',
      gender: babyData.gender || 'surprise',
      estimatedAge: babyData.estimatedAge || 0,
      features: babyData.features || {
        eyeColor: 'Brown',
        hairColor: 'Brown',
        skinTone: 'Medium',
        faceShape: 'Round',
        height: 50,
        weight: 3.5,
      },
      personality: babyData.personality || {
        traits: ['Curious', 'Gentle'],
        favoriteActivities: ['Music', 'Stories'],
        sleepPattern: 'regular',
        temperament: 'calm',
      },
      genetics: babyData.genetics || {
        parentalInfluence: { father: 50, mother: 50 },
        inheritedTraits: [],
        potentialTalents: [],
      },
      development: babyData.development || {
        milestones: [],
        currentStage: 'Newborn',
        nextMilestone: 'First Smile',
        estimatedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 42), // 6 weeks
      },
      photos: [],
      videos: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      partnerId: babyData.partnerId,
    };

    setBabies(prev => [newBaby, ...prev]);
    setCurrentBaby(newBaby);
    await saveDataToStorage();
  };

  const updateBaby = async (babyId: string, updates: Partial<BabyProfile>) => {
    setBabies(prev => prev.map(baby => 
      baby.id === babyId 
        ? { ...baby, ...updates, lastUpdated: new Date() }
        : baby
    ));
    
    if (currentBaby?.id === babyId) {
      setCurrentBaby(prev => prev ? { ...prev, ...updates, lastUpdated: new Date() } : null);
    }
    
    await saveDataToStorage();
  };

  const deleteBaby = async (babyId: string) => {
    setBabies(prev => prev.filter(baby => baby.id !== babyId));
    if (currentBaby?.id === babyId) {
      const remainingBabies = babies.filter(baby => baby.id !== babyId);
      setCurrentBaby(remainingBabies.length > 0 ? remainingBabies[0] : null);
    }
    await saveDataToStorage();
  };

  const selectBaby = (babyId: string) => {
    const baby = babies.find(b => b.id === babyId);
    setCurrentBaby(baby || null);
  };

  const generateBabyPhoto = async (babyId: string): Promise<string> => {
    setIsGenerating(true);
    
    // Simulate AI photo generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const baby = babies.find(b => b.id === babyId);
    if (!baby) {
      setIsGenerating(false);
      return '';
    }

    // Generate a new photo URL based on baby's age and features
    const ageGroup = baby.estimatedAge < 6 ? 'newborn' : baby.estimatedAge < 12 ? 'infant' : 'toddler';
    const photoUrl = `https://via.placeholder.com/400x400/FFE4E1/FFFFFF?text=${ageGroup}+${baby.name}+${Date.now()}`;
    
    // Add to baby's photos
    await updateBaby(babyId, {
      photos: [...baby.photos, photoUrl]
    });
    
    setIsGenerating(false);
    return photoUrl;
  };

  const generateGrowthPrediction = async (babyId: string, targetAge: number): Promise<GrowthPrediction> => {
    setIsGenerating(true);
    
    // Simulate AI prediction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const baby = babies.find(b => b.id === babyId);
    if (!baby) {
      setIsGenerating(false);
      throw new Error('Baby not found');
    }

    const prediction: GrowthPrediction = {
      ageInMonths: targetAge,
      predictedHeight: baby.features.height + (targetAge - baby.estimatedAge) * 2.5,
      predictedWeight: baby.features.weight + (targetAge - baby.estimatedAge) * 0.6,
      developmentalStage: targetAge < 6 ? 'Early Infancy' : targetAge < 12 ? 'Mobile Infant' : 'Toddler',
      newSkills: [
        'Improved hand-eye coordination',
        'Better social interaction',
        'Enhanced cognitive abilities',
        'Stronger physical development'
      ],
      parentingTips: [
        'Continue tummy time for strength',
        'Read together daily',
        'Encourage exploration safely',
        'Maintain consistent routines'
      ],
      healthReminders: [
        'Schedule regular check-ups',
        'Monitor developmental milestones',
        'Ensure proper nutrition',
        'Maintain vaccination schedule'
      ],
    };
    
    setIsGenerating(false);
    return prediction;
  };

  const generatePersonalityUpdate = async (babyId: string) => {
    setIsGenerating(true);
    
    // Simulate AI personality analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const baby = babies.find(b => b.id === babyId);
    if (!baby) {
      setIsGenerating(false);
      return;
    }

    const newTraits = ['Observant', 'Expressive', 'Adventurous', 'Affectionate'];
    const newActivities = ['Sensory play', 'Musical toys', 'Picture books', 'Bath time'];
    
    await updateBaby(babyId, {
      personality: {
        ...baby.personality,
        traits: [...new Set([...baby.personality.traits, ...newTraits.slice(0, 2)])],
        favoriteActivities: [...new Set([...baby.personality.favoriteActivities, ...newActivities.slice(0, 2)])],
      }
    });
    
    setIsGenerating(false);
  };

  const sendPartnerRequest = async (partnerId: string, message: string) => {
    if (!user) return;

    const newRequest: PartnerRequest = {
      id: Date.now().toString(),
      fromUserId: user.id,
      toUserId: partnerId,
      status: 'pending',
      message,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    };

    setPartnerRequests(prev => [newRequest, ...prev]);
    await saveDataToStorage();
  };

  const respondToPartnerRequest = async (requestId: string, accept: boolean) => {
    setPartnerRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: accept ? 'accepted' : 'declined' }
        : request
    ));
    await saveDataToStorage();
  };

  const addMemory = async (memoryData: Partial<BabyMemory>) => {
    if (!currentBaby) return;

    const newMemory: BabyMemory = {
      id: Date.now().toString(),
      babyId: currentBaby.id,
      title: memoryData.title || 'New Memory',
      description: memoryData.description || '',
      type: memoryData.type || 'note',
      media: memoryData.media || [],
      tags: memoryData.tags || [],
      createdAt: new Date(),
      mood: memoryData.mood || 'happy',
    };

    setMemories(prev => [newMemory, ...prev]);
    await saveDataToStorage();
  };

  const updateMilestone = async (babyId: string, milestoneId: string, achieved: boolean) => {
    const baby = babies.find(b => b.id === babyId);
    if (!baby) return;

    const updatedMilestones = baby.development.milestones.map(milestone =>
      milestone.id === milestoneId
        ? { 
            ...milestone, 
            achieved, 
            achievedDate: achieved ? new Date() : undefined 
          }
        : milestone
    );

    await updateBaby(babyId, {
      development: {
        ...baby.development,
        milestones: updatedMilestones,
      }
    });
  };

  const toggleLiveTracking = () => {
    setLiveGrowthTracking(prev => !prev);
  };

  const getRealTimeUpdates = () => {
    if (!currentBaby || !liveGrowthTracking) {
      return {
        dailyGrowth: 'Not tracking',
        currentActivity: 'Unknown',
        nextFeedingTime: 'Not scheduled',
        sleepStatus: 'Unknown',
      };
    }

    const now = new Date();
    const hour = now.getHours();
    
    return {
      dailyGrowth: '+2.3g weight, +0.1cm height',
      currentActivity: hour < 8 ? 'Sleeping 😴' : hour < 12 ? 'Playing 🎮' : hour < 18 ? 'Learning 📚' : 'Resting 🛌',
      nextFeedingTime: `${((hour + 3) % 24).toString().padStart(2, '0')}:00`,
      sleepStatus: hour >= 20 || hour <= 6 ? 'Asleep 💤' : 'Awake 👁️',
    };
  };

  const getDevelopmentPredictions = (babyId: string) => {
    const baby = babies.find(b => b.id === babyId);
    if (!baby) {
      return { nextWeek: [], nextMonth: [], nextYear: [] };
    }

    return {
      nextWeek: [
        'Stronger neck muscles',
        'More alert during playtime',
        'Better sleep patterns',
      ],
      nextMonth: [
        'First social smiles',
        'Better hand coordination',
        'Responds to familiar voices',
        'Improved visual tracking',
      ],
      nextYear: [
        'First words',
        'Walking independently',
        'Problem-solving skills',
        'Social play with others',
        'Creative expression',
      ],
    };
  };

  return (
    <BabyAIContext.Provider value={{
      babies,
      currentBaby,
      createBaby,
      updateBaby,
      deleteBaby,
      selectBaby,
      partnerRequests,
      sendPartnerRequest,
      respondToPartnerRequest,
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
      isLoading,
    }}>
      {children}
    </BabyAIContext.Provider>
  );
}; 