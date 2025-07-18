import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video' | 'audio' | 'document';
  uploadDate: string;
  description?: string;
}

interface Memory {
  id: string;
  content: string;
  type: 'conversation' | 'event' | 'story';
  date: string;
  emotional_context: string;
}

export interface LovedOne {
  id: string;
  name: string;
  relationship: string; // Mother, Father, Grandma, Friend, etc.
  dateOfBirth: string;
  dateOfPassing: string;
  profileImage: string;
  // Real AI Service Integration
  didAvatarId?: string; // D-ID avatar ID
  elevenLabsVoiceId?: string; // ElevenLabs voice model ID
  openaiPersonalityModel?: string; // Custom GPT model
  personalityProfile: {
    bigFive: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    myersBriggs: string; // e.g., "INFP"
    traits: string[];
    quotes: string[];
    hobbies: string[];
    mannerisms: string[];
  };
  // Enhanced Memory System
  memoryBank: {
    photos: MediaItem[];
    videos: MediaItem[];
    audioRecordings: MediaItem[];
    documents: MediaItem[];
    socialMediaPosts: any[];
    conversations: ChatMessage[];
  };
  // AI Training Data
  trainingData: {
    conversationStyle: string;
    vocabularyPreferences: string[];
    responsePatterns: string[];
    emotionalTriggers: string[];
    memories: Memory[];
  };
  // Real-time Communication
  communicationSettings: {
    voiceEnabled: boolean;
    videoCallsEnabled: boolean;
    realTimeChat: boolean;
    emotionalResponseLevel: 'low' | 'medium' | 'high';
  };
  // Subscription & Privacy
  subscriptionTier: 'starter' | 'premium' | 'forever';
  privacySettings: {
    familyAccess: string[];
    publicProfile: boolean;
    dataRetention: 'temporary' | 'permanent';
  };
  aiModel: {
    isReady: boolean;
    trainingProgress: number; // 0-100
    accuracy: number; // AI similarity rating
    lastTrained: Date;
    modelVersion: string;
  };
  memorialSettings: {
    isPublic: boolean;
    allowTributes: boolean;
    anniversaryReminders: boolean;
    birthdayReminders: boolean;
  };
  chatHistory: ChatMessage[];
  videoCalls: VideoCall[];
  createdAt: Date;
  lastInteraction: Date;
}

export interface ChatMessage {
  id: string;
  lovedOneId: string;
  sender: 'user' | 'ai';
  message: string;
  emotion: string; // happy, sad, nostalgic, comforting
  timestamp: Date;
  aiConfidence: number; // How confident the AI is in the response
  context?: string; // Memory or context the AI referenced
}

export interface VideoCall {
  id: string;
  lovedOneId: string;
  duration: number; // in seconds
  quality: 'HD' | '4K' | '8K';
  emotionalTone: string;
  topics: string[];
  timestamp: Date;
  recording?: string; // Optional recording URL
}

interface AIServices {
  dId: {
    apiKey: string;
    baseUrl: string;
  };
  elevenLabs: {
    apiKey: string;
    baseUrl: string;
  };
  openAI: {
    apiKey: string;
    organizationId: string;
  };
  pinecone: {
    apiKey: string;
    environment: string;
  };
}

interface LovedOnesContextType {
  lovedOnes: LovedOne[];
  activeLovedOne: LovedOne | null;
  isTrainingAI: boolean;
  trainingProgress: number;
  
  // Core functions
  addLovedOne: (lovedOne: Omit<LovedOne, 'id' | 'createdAt' | 'chatHistory' | 'videoCalls'>) => Promise<void>;
  updateLovedOne: (id: string, updates: Partial<LovedOne>) => Promise<void>;
  deleteLovedOne: (id: string) => Promise<void>;
  setActiveLovedOne: (lovedOne: LovedOne | null) => void;
  
  // AI Training
  uploadTrainingMedia: (lovedOneId: string, type: 'photo' | 'video' | 'voice', uri: string) => Promise<void>;
  trainAIModel: (lovedOneId: string) => Promise<void>;
  
  // Communication
  sendMessage: (lovedOneId: string, message: string) => Promise<ChatMessage>;
  sendVoiceMessage: (lovedOneId: string, audioUri: string) => Promise<ChatMessage>;
  startVideoCall: (lovedOneId: string) => Promise<VideoCall>;
  endVideoCall: (callId: string) => Promise<void>;
  
  // Memorial features
  addTribute: (lovedOneId: string, tribute: string, author: string) => Promise<void>;
  getMemories: (lovedOneId: string) => Promise<ChatMessage[]>;
  getMemoryTimeline: (lovedOneId: string) => Promise<any[]>;
  shareMemory: (lovedOneId: string, memoryId: string, recipients: string[]) => Promise<void>;
  setReminder: (lovedOneId: string, type: 'birthday' | 'anniversary', enabled: boolean) => Promise<void>;
  scheduleAnniversaryReminder: (lovedOneId: string, date: Date, message: string) => Promise<void>;
  
  // Real AI Integration Methods
  createAIAvatar: (lovedOneId: string, videoFile: File) => Promise<void>;
  createVoiceClone: (lovedOneId: string, audioFiles: File[]) => Promise<void>;
  trainPersonalityModel: (lovedOneId: string, trainingData: any) => Promise<void>;
  
  // Advanced Communication
  analyzePersonality: (lovedOneId: string, data: any) => Promise<any>;
  
  // Memory Management
  uploadMemories: (lovedOneId: string, files: File[]) => Promise<void>;
  searchMemories: (lovedOneId: string, query: string) => Promise<Memory[]>;
  generateMemoryInsights: (lovedOneId: string) => Promise<string[]>;
  
  // Subscription Management
  upgradeSubscription: (tier: 'starter' | 'premium' | 'forever') => Promise<void>;
  getUsageStats: () => Promise<any>;
}

const LovedOnesContext = createContext<LovedOnesContextType | undefined>(undefined);

export const useLovedOnes = () => {
  const context = useContext(LovedOnesContext);
  if (!context) {
    throw new Error('useLovedOnes must be used within a LovedOnesProvider');
  }
  return context;
};

// Sample data for demonstration
const SAMPLE_LOVED_ONES: LovedOne[] = [
  {
    id: '1',
    name: 'Grandma Rose',
    relationship: 'Grandmother',
    dateOfBirth: '1935-05-15',
    dateOfPassing: '2022-12-10',
    profileImage: 'https://i.pravatar.cc/200?u=grandma1',
    personalityProfile: {
      bigFive: {
        openness: 0.5,
        conscientiousness: 0.7,
        extraversion: 0.3,
        agreeableness: 0.8,
        neuroticism: 0.2
      },
      myersBriggs: 'INFP',
      traits: ['Wise', 'Caring', 'Humorous', 'Patient'],
      quotes: [
        'Everything happens for a reason, dear.',
        'A smile is the best makeup any girl can wear.',
        'Love is the secret ingredient in everything.'
      ],
      hobbies: ['Cooking', 'Gardening', 'Reading', 'Knitting'],
      mannerisms: ['Always hummed while cooking', 'Adjusted glasses when thinking', 'Called everyone "dear"'],
    },
    memoryBank: {
      photos: [],
      videos: [],
      audioRecordings: [],
      documents: [],
      socialMediaPosts: [],
      conversations: []
    },
    trainingData: {
      conversationStyle: 'Warm and nurturing',
      vocabularyPreferences: ['dear', 'sweetie', 'honey'],
      responsePatterns: ['Always ends with endearment', 'Asks follow-up questions'],
      emotionalTriggers: ['family stories', 'cooking memories'],
      memories: []
    },
    communicationSettings: {
      voiceEnabled: true,
      videoCallsEnabled: true,
      realTimeChat: true,
      emotionalResponseLevel: 'high'
    },
    subscriptionTier: 'premium',
    privacySettings: {
      familyAccess: ['user123', 'user456'],
      publicProfile: false,
      dataRetention: 'permanent'
    },
    aiModel: {
      isReady: true,
      trainingProgress: 95,
      accuracy: 92,
      lastTrained: new Date('2024-01-01'),
      modelVersion: '2.1'
    },
    memorialSettings: {
      isPublic: false,
      allowTributes: true,
      anniversaryReminders: true,
      birthdayReminders: true
    },
    chatHistory: [],
    videoCalls: [],
    createdAt: new Date('2023-01-15'),
    lastInteraction: new Date()
  }
];

// AI Response Generator
const generateAIResponse = (lovedOne: LovedOne, userMessage: string): ChatMessage => {
  const responses = [
    `Oh ${userMessage.includes('miss') ? 'sweetheart' : 'dear'}, I miss you too. I'm always watching over you with so much love.`,
    `You know, when I was your age, I faced similar challenges. Remember, you're stronger than you know, love.`,
    `I'm so proud of who you've become. Your grandfather would be proud too. Keep shining, dear.`,
    `Life is like my garden - sometimes you need to weather the storms to appreciate the sunshine. You're doing beautifully.`,
    `Remember our Sunday morning pancakes? Those were my favorite times. I hope you're taking care of yourself, sweetheart.`,
    `I can feel your love even from here. Never forget that you carry a piece of my heart with you always.`
  ];
  
  const emotions = ['comforting', 'wise', 'nostalgic', 'proud', 'loving'];
  const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
  const selectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  
  return {
    id: Date.now().toString(),
    lovedOneId: lovedOne.id,
    sender: 'ai',
    message: selectedResponse,
    emotion: selectedEmotion,
    timestamp: new Date(),
    aiConfidence: 0.85 + Math.random() * 0.15,
    context: 'Drawing from personality profile and past conversations'
  };
};

export const LovedOnesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>(SAMPLE_LOVED_ONES);
  const [activeLovedOne, setActiveLovedOne] = useState<LovedOne | null>(null);
  const [isTrainingAI, setIsTrainingAI] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  // Load data from storage
  useEffect(() => {
    loadLovedOnes();
  }, []);

  const loadLovedOnes = async () => {
    try {
      const stored = await AsyncStorage.getItem('lovedOnes');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLovedOnes(parsed.map((lo: any) => ({
          ...lo,
          dateOfBirth: new Date(lo.dateOfBirth),
          dateOfPassing: new Date(lo.dateOfPassing),
          createdAt: new Date(lo.createdAt),
          lastInteraction: new Date(lo.lastInteraction),
          aiModel: {
            ...lo.aiModel,
            lastTrained: new Date(lo.aiModel.lastTrained)
          },
          chatHistory: lo.chatHistory.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          videoCalls: lo.videoCalls.map((call: any) => ({
            ...call,
            timestamp: new Date(call.timestamp)
          }))
        })));
      }
    } catch (error) {
      console.error('Error loading loved ones:', error);
    }
  };

  const saveLovedOnes = async (newLovedOnes: LovedOne[]) => {
    try {
      await AsyncStorage.setItem('lovedOnes', JSON.stringify(newLovedOnes));
      setLovedOnes(newLovedOnes);
    } catch (error) {
      console.error('Error saving loved ones:', error);
    }
  };

  const addLovedOne = async (lovedOneData: Omit<LovedOne, 'id' | 'createdAt' | 'chatHistory' | 'videoCalls'>) => {
    const newLovedOne: LovedOne = {
      ...lovedOneData,
      id: Date.now().toString(),
      chatHistory: [],
      videoCalls: [],
      createdAt: new Date()
    };
    
    const updatedLovedOnes = [...lovedOnes, newLovedOne];
    await saveLovedOnes(updatedLovedOnes);
    
    // Start AI training
    setTimeout(() => trainAIModel(newLovedOne.id), 1000);
  };

  const updateLovedOne = async (id: string, updates: Partial<LovedOne>) => {
    const updatedLovedOnes = lovedOnes.map(lo => 
      lo.id === id ? { ...lo, ...updates, lastInteraction: new Date() } : lo
    );
    await saveLovedOnes(updatedLovedOnes);
  };

  const deleteLovedOne = async (id: string) => {
    const updatedLovedOnes = lovedOnes.filter(lo => lo.id !== id);
    await saveLovedOnes(updatedLovedOnes);
    if (activeLovedOne?.id === id) {
      setActiveLovedOne(null);
    }
  };

  const uploadTrainingMedia = async (lovedOneId: string, type: 'photo' | 'video' | 'voice', uri: string) => {
    const lovedOne = lovedOnes.find(lo => lo.id === lovedOneId);
    if (!lovedOne) return;

    const newMediaItem: MediaItem = {
      id: Date.now().toString(),
      url: uri,
      type: type === 'voice' ? 'audio' : type,
      uploadDate: new Date().toISOString(),
      description: `${type} for AI training`
    };

    const updates: Partial<LovedOne> = {
      memoryBank: {
        ...lovedOne.memoryBank,
        ...(type === 'photo' && { photos: [...lovedOne.memoryBank.photos, newMediaItem] }),
        ...(type === 'video' && { videos: [...lovedOne.memoryBank.videos, newMediaItem] }),
        ...(type === 'voice' && { audioRecordings: [...lovedOne.memoryBank.audioRecordings, newMediaItem] }),
      }
    };

    await updateLovedOne(lovedOneId, updates);
    console.log(`📸 ${type} uploaded for ${lovedOne.name}. AI model will be retrained.`);
  };

  const trainAIModel = async (lovedOneId: string) => {
    setIsTrainingAI(true);
    setTrainingProgress(0);
    
    // Simulate AI training process
    const trainingSteps = [
      'Analyzing photos...',
      'Processing voice patterns...',
      'Learning personality traits...',
      'Training facial expressions...',
      'Optimizing speech synthesis...',
      'Finalizing AI model...'
    ];

    for (let i = 0; i < trainingSteps.length; i++) {
      console.log(`🤖 ${trainingSteps[i]}`);
      setTrainingProgress((i + 1) / trainingSteps.length * 100);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Update AI model status
    await updateLovedOne(lovedOneId, {
      aiModel: {
        isReady: true,
        trainingProgress: 100,
        accuracy: 85 + Math.random() * 15,
        lastTrained: new Date(),
        modelVersion: '2.1'
      }
    });

    setIsTrainingAI(false);
    setTrainingProgress(0);
    console.log(`✅ AI model for loved one trained successfully!`);
  };

  const sendMessage = async (lovedOneId: string, message: string): Promise<ChatMessage> => {
    const lovedOne = lovedOnes.find(lo => lo.id === lovedOneId);
    if (!lovedOne) throw new Error('Loved one not found');

    // User message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      lovedOneId,
      sender: 'user',
      message,
      emotion: 'hopeful',
      timestamp: new Date(),
      aiConfidence: 1.0
    };

    // AI response
    const aiResponse = generateAIResponse(lovedOne, message);

    // Update chat history
    const updatedChatHistory = [...lovedOne.chatHistory, userMessage, aiResponse];
    await updateLovedOne(lovedOneId, { chatHistory: updatedChatHistory });

    return aiResponse;
  };

  const startVideoCall = async (lovedOneId: string): Promise<VideoCall> => {
    const lovedOne = lovedOnes.find(lo => lo.id === lovedOneId);
    if (!lovedOne) throw new Error('Loved one not found');

    const videoCall: VideoCall = {
      id: Date.now().toString(),
      lovedOneId,
      duration: 0,
      quality: '4K',
      emotionalTone: 'warm and comforting',
      topics: [],
      timestamp: new Date()
    };

    console.log(`📹 Starting AI video call with ${lovedOne.name}...`);
    return videoCall;
  };

  const endVideoCall = async (callId: string) => {
    console.log(`📹 Video call ${callId} ended`);
  };

  const addTribute = async (lovedOneId: string, tribute: string, author: string) => {
    console.log(`💝 Tribute added for loved one: "${tribute}" by ${author}`);
  };

  const getMemories = async (lovedOneId: string): Promise<ChatMessage[]> => {
    const lovedOne = lovedOnes.find(lo => lo.id === lovedOneId);
    return lovedOne?.chatHistory || [];
  };

  const setReminder = async (lovedOneId: string, type: 'birthday' | 'anniversary', enabled: boolean) => {
    const updates = {
      memorialSettings: {
        ...lovedOnes.find(lo => lo.id === lovedOneId)?.memorialSettings,
        [type === 'birthday' ? 'birthdayReminders' : 'anniversaryReminders']: enabled
      }
    };
    await updateLovedOne(lovedOneId, updates as Partial<LovedOne>);
    console.log(`🔔 ${type} reminders ${enabled ? 'enabled' : 'disabled'}`);
  };

  const createAIAvatar = async (lovedOneId: string, videoFile: File) => {
    console.log(`🎬 Creating AI avatar for ${lovedOneId} with D-ID API`);
    // This would integrate with D-ID API in production
    // For now, simulate the process
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ AI avatar created successfully!');
  };

  const createVoiceClone = async (lovedOneId: string, audioFiles: File[]) => {
    console.log(`🎤 Creating voice clone for ${lovedOneId} with ElevenLabs API`);
    // This would integrate with ElevenLabs API in production
    // For now, simulate the process
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Voice clone created successfully!');
  };

  const trainPersonalityModel = async (lovedOneId: string, trainingData: any) => {
    console.log(`🧠 Training personality model for ${lovedOneId}`);
    // This would integrate with OpenAI fine-tuning API in production
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Personality model trained successfully!');
  };

  const analyzePersonality = async (lovedOneId: string, data: any) => {
    console.log(`📊 Analyzing personality for ${lovedOneId}`);
    // This would use psychological analysis APIs in production
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { analysis: 'Personality analysis complete' };
  };

  const uploadMemories = async (lovedOneId: string, files: File[]) => {
    console.log(`📁 Uploading ${files.length} memories for ${lovedOneId}`);
    // This would handle file uploads and processing in production
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Memories uploaded successfully!');
  };

  const searchMemories = async (lovedOneId: string, query: string): Promise<Memory[]> => {
    console.log(`🔍 Searching memories for ${lovedOneId}: "${query}"`);
    // This would use vector search in production
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [];
  };

  const generateMemoryInsights = async (lovedOneId: string): Promise<string[]> => {
    console.log(`💡 Generating memory insights for ${lovedOneId}`);
    // This would use AI analysis in production
    await new Promise(resolve => setTimeout(resolve, 1500));
    return ['Sample insight 1', 'Sample insight 2'];
  };

  const upgradeSubscription = async (tier: 'starter' | 'premium' | 'forever') => {
    console.log(`💳 Upgrading subscription to ${tier}`);
    // This would integrate with payment processing in production
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Subscription upgraded successfully!');
  };

  const getUsageStats = async () => {
    console.log('📊 Getting usage statistics');
    // This would fetch real usage data in production
    return { usage: 'sample stats' };
  };

  const sendVoiceMessage = async (lovedOneId: string, audioUri: string): Promise<ChatMessage> => {
    const lovedOne = lovedOnes.find(lo => lo.id === lovedOneId);
    if (!lovedOne) throw new Error('Loved one not found');
    
    // Simulate voice transcription and AI response
    const transcribedMessage = "Voice message received: Thank you for sharing your voice with me.";
    
    const voiceResponse: ChatMessage = {
      id: Date.now().toString(),
      lovedOneId,
      sender: 'ai',
      message: `I heard your voice and it brings back such wonderful memories. Your voice sounds just like I remember. ${transcribedMessage}`,
      emotion: 'nostalgic',
      timestamp: new Date(),
      aiConfidence: 0.95,
      context: 'voice_message'
    };
    
    const updatedChatHistory = [...lovedOne.chatHistory, voiceResponse];
    await updateLovedOne(lovedOneId, { chatHistory: updatedChatHistory });
    return voiceResponse;
  };

  const getMemoryTimeline = async (lovedOneId: string): Promise<any[]> => {
    const lovedOne = lovedOnes.find(lo => lo.id === lovedOneId);
    if (!lovedOne) return [];
    
    // Generate timeline from chat history, photos, videos, and key dates
    const timeline = [
      {
        id: '1',
        type: 'birthday',
        date: new Date(lovedOne.dateOfBirth),
        title: `${lovedOne.name} was born`,
        description: 'A beautiful soul entered this world',
        icon: 'gift',
        color: '#FFD700'
      },
      {
        id: '2',
        type: 'memory',
        date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        title: 'Last Birthday Together',
        description: 'Celebrating another year of wonderful memories',
        icon: 'cake',
        color: '#FF69B4'
      },
      {
        id: '3',
        type: 'interaction',
        date: lovedOne.lastInteraction,
        title: 'Latest Conversation',
        description: 'Our most recent heart-to-heart chat',
        icon: 'chatbubbles',
        color: '#4CAF50'
      }
    ];
    
    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const shareMemory = async (lovedOneId: string, memoryId: string, recipients: string[]): Promise<void> => {
    // Simulate sharing memory with family members
    console.log(`Sharing memory ${memoryId} of loved one ${lovedOneId} with:`, recipients);
    
    // In production, this would:
    // 1. Send notifications to recipients
    // 2. Create shared memorial space
    // 3. Allow collaborative memory building
  };

  const scheduleAnniversaryReminder = async (lovedOneId: string, date: Date, message: string): Promise<void> => {
    const lovedOne = lovedOnes.find(lo => lo.id === lovedOneId);
    if (!lovedOne) throw new Error('Loved one not found');
    
    // Store reminder in loved one's settings
    const updatedSettings = {
      ...lovedOne.memorialSettings,
      anniversaryReminders: true,
      customReminders: [
        ...(lovedOne.memorialSettings as any).customReminders || [],
        { date, message, type: 'anniversary' }
      ]
    };
    
    await updateLovedOne(lovedOneId, { memorialSettings: updatedSettings });
    console.log(`Anniversary reminder scheduled for ${lovedOne.name} on ${date.toDateString()}: ${message}`);
  };

  const value: LovedOnesContextType = {
    lovedOnes,
    activeLovedOne,
    isTrainingAI,
    trainingProgress,
    addLovedOne,
    updateLovedOne,
    deleteLovedOne,
    setActiveLovedOne,
    uploadTrainingMedia,
    trainAIModel,
    sendMessage,
    sendVoiceMessage,
    startVideoCall,
    endVideoCall,
    addTribute,
    getMemories,
    getMemoryTimeline,
    shareMemory,
    setReminder,
    scheduleAnniversaryReminder,
    createAIAvatar,
    createVoiceClone,
    trainPersonalityModel,
    analyzePersonality,
    uploadMemories,
    searchMemories,
    generateMemoryInsights,
    upgradeSubscription,
    getUsageStats
  };

  return (
    <LovedOnesContext.Provider value={value}>
      {children}
    </LovedOnesContext.Provider>
  );
}; 