import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NSFWSettings {
  isAgeVerified: boolean;
  allowNSFWContent: boolean;
  contentFilterLevel: 'strict' | 'moderate' | 'minimal' | 'off';
  blurNSFWImages: boolean;
  hideNSFWText: boolean;
  showContentWarnings: boolean;
  requireConfirmation: boolean;
  parentalControlsEnabled: boolean;
  restrictedHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "06:00"
  };
}

export interface ContentRating {
  level: 'safe' | 'suggestive' | 'mature' | 'explicit';
  reason: string[];
  confidence: number; // 0-1
}

export interface NSFWContent {
  id: string;
  type: 'image' | 'video' | 'text' | 'audio' | 'livestream';
  rating: ContentRating;
  isBlurred: boolean;
  isHidden: boolean;
  reportCount: number;
  verifiedAge: boolean;
  creatorVerified: boolean;
  tags: string[];
  warningShown: boolean;
}

export interface AgeVerification {
  isVerified: boolean;
  verificationMethod: 'id' | 'credit_card' | 'phone' | 'manual' | null;
  verifiedDate: string | null;
  documentType: string | null;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'expired';
}

export interface ParentalControls {
  isEnabled: boolean;
  parentEmail: string;
  pin: string;
  allowedHours: {
    start: string;
    end: string;
  };
  maxDailyTime: number; // minutes
  blockedKeywords: string[];
  allowedCreators: string[];
  emergencyContacts: string[];
}

interface NSFWContextType {
  // Settings
  nsfwSettings: NSFWSettings;
  updateNSFWSettings: (settings: Partial<NSFWSettings>) => Promise<void>;
  
  // Age Verification
  ageVerification: AgeVerification;
  startAgeVerification: (method: 'id' | 'credit_card' | 'phone') => Promise<boolean>;
  uploadVerificationDocument: (document: any) => Promise<boolean>;
  checkAgeVerificationStatus: () => Promise<void>;
  
  // Content Filtering
  checkContentRating: (content: any) => Promise<ContentRating>;
  shouldBlockContent: (content: NSFWContent) => boolean;
  shouldBlurContent: (content: NSFWContent) => boolean;
  shouldShowWarning: (content: NSFWContent) => boolean;
  
  // Content Management
  reportContent: (contentId: string, reason: string) => Promise<boolean>;
  flagAsNSFW: (contentId: string) => Promise<boolean>;
  requestContentReview: (contentId: string) => Promise<boolean>;
  
  // Parental Controls
  parentalControls: ParentalControls;
  enableParentalControls: (controls: ParentalControls) => Promise<boolean>;
  disableParentalControls: (pin: string) => Promise<boolean>;
  checkParentalRestrictions: () => boolean;
  
  // Safe Mode
  isSafeModeEnabled: boolean;
  enableSafeMode: () => Promise<void>;
  disableSafeMode: () => Promise<void>;
  
  // Analytics & Reporting
  getContentExposureReport: () => Promise<any>;
  getFilteringEffectiveness: () => Promise<any>;
  
  // Emergency & Safety
  emergencyBlock: () => Promise<void>;
  reportUnsafeContent: (contentId: string, details: string) => Promise<boolean>;
  requestHelpFromModerator: () => Promise<boolean>;
  
  isLoading: boolean;
  error: string | null;
}

const NSFWContext = createContext<NSFWContextType | undefined>(undefined);

interface NSFWProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  NSFW_SETTINGS: 'nsfw_settings',
  AGE_VERIFICATION: 'age_verification',
  PARENTAL_CONTROLS: 'parental_controls',
  SAFE_MODE: 'safe_mode',
};

export const NSFWProvider: React.FC<NSFWProviderProps> = ({ children }) => {
  const [nsfwSettings, setNSFWSettings] = useState<NSFWSettings>({
    isAgeVerified: false,
    allowNSFWContent: false,
    contentFilterLevel: 'strict',
    blurNSFWImages: true,
    hideNSFWText: true,
    showContentWarnings: true,
    requireConfirmation: true,
    parentalControlsEnabled: false,
    restrictedHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '06:00',
    },
  });

  const [ageVerification, setAgeVerification] = useState<AgeVerification>({
    isVerified: false,
    verificationMethod: null,
    verifiedDate: null,
    documentType: null,
    verificationStatus: 'pending',
  });

  const [parentalControls, setParentalControls] = useState<ParentalControls>({
    isEnabled: false,
    parentEmail: '',
    pin: '',
    allowedHours: {
      start: '08:00',
      end: '20:00',
    },
    maxDailyTime: 120, // 2 hours
    blockedKeywords: [
      'explicit', 'adult', 'nsfw', 'mature', 'xxx', '18+', 'porn', 'nude', 'sex',
      'erotic', 'fetish', 'kinky', 'bdsm', 'hardcore', 'softcore'
    ],
    allowedCreators: [],
    emergencyContacts: [],
  });

  const [isSafeModeEnabled, setIsSafeModeEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoredSettings();
  }, []);

  const loadStoredSettings = async () => {
    try {
      setIsLoading(true);
      
      const [storedNSFWSettings, storedAgeVerification, storedParentalControls, storedSafeMode] = 
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.NSFW_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.AGE_VERIFICATION),
          AsyncStorage.getItem(STORAGE_KEYS.PARENTAL_CONTROLS),
          AsyncStorage.getItem(STORAGE_KEYS.SAFE_MODE),
        ]);

      if (storedNSFWSettings) {
        setNSFWSettings(JSON.parse(storedNSFWSettings));
      }

      if (storedAgeVerification) {
        setAgeVerification(JSON.parse(storedAgeVerification));
      }

      if (storedParentalControls) {
        setParentalControls(JSON.parse(storedParentalControls));
      }

      if (storedSafeMode) {
        setIsSafeModeEnabled(JSON.parse(storedSafeMode));
      }
    } catch (err) {
      setError('Failed to load NSFW settings');
      console.error('Error loading NSFW settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNSFWSettings = async (newSettings: Partial<NSFWSettings>) => {
    try {
      const updatedSettings = { ...nsfwSettings, ...newSettings };
      setNSFWSettings(updatedSettings);
      await AsyncStorage.setItem(STORAGE_KEYS.NSFW_SETTINGS, JSON.stringify(updatedSettings));
    } catch (err) {
      setError('Failed to update NSFW settings');
      throw err;
    }
  };

  const startAgeVerification = async (method: 'id' | 'credit_card' | 'phone'): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call for age verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newVerification: AgeVerification = {
        isVerified: false,
        verificationMethod: method,
        verifiedDate: null,
        documentType: method === 'id' ? 'drivers_license' : null,
        verificationStatus: 'pending',
      };
      
      setAgeVerification(newVerification);
      await AsyncStorage.setItem(STORAGE_KEYS.AGE_VERIFICATION, JSON.stringify(newVerification));
      
      return true;
    } catch (err) {
      setError('Failed to start age verification');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadVerificationDocument = async (document: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate document upload and verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate approval (in real app, this would be reviewed)
      const verifiedDate = new Date().toISOString();
      const approvedVerification: AgeVerification = {
        ...ageVerification,
        isVerified: true,
        verifiedDate,
        verificationStatus: 'approved',
      };
      
      setAgeVerification(approvedVerification);
      await AsyncStorage.setItem(STORAGE_KEYS.AGE_VERIFICATION, JSON.stringify(approvedVerification));
      
      // Update NSFW settings to allow content
      await updateNSFWSettings({
        isAgeVerified: true,
        allowNSFWContent: true,
      });
      
      return true;
    } catch (err) {
      setError('Failed to upload verification document');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAgeVerificationStatus = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate checking verification status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if verification expired (30 days)
      if (ageVerification.verifiedDate) {
        const verifiedDate = new Date(ageVerification.verifiedDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (verifiedDate < thirtyDaysAgo) {
          const expiredVerification = {
            ...ageVerification,
            verificationStatus: 'expired' as const,
          };
          setAgeVerification(expiredVerification);
          await AsyncStorage.setItem(STORAGE_KEYS.AGE_VERIFICATION, JSON.stringify(expiredVerification));
        }
      }
    } catch (err) {
      setError('Failed to check verification status');
    } finally {
      setIsLoading(false);
    }
  };

  const checkContentRating = async (content: any): Promise<ContentRating> => {
    try {
      // Simulate AI content analysis
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock content analysis based on content
      const keywords = content.text?.toLowerCase() || '';
      const hasExplicitKeywords = parentalControls.blockedKeywords.some(keyword => 
        keywords.includes(keyword)
      );
      
      let rating: ContentRating;
      
      if (hasExplicitKeywords) {
        rating = {
          level: 'explicit',
          reason: ['Contains explicit language or content'],
          confidence: 0.9,
        };
      } else if (keywords.includes('suggestive') || keywords.includes('adult')) {
        rating = {
          level: 'mature',
          reason: ['Contains mature themes'],
          confidence: 0.7,
        };
      } else if (keywords.includes('mild') || keywords.includes('innuendo')) {
        rating = {
          level: 'suggestive',
          reason: ['Contains suggestive content'],
          confidence: 0.6,
        };
      } else {
        rating = {
          level: 'safe',
          reason: ['Content appears safe'],
          confidence: 0.8,
        };
      }
      
      return rating;
    } catch (err) {
      return {
        level: 'safe',
        reason: ['Analysis failed, defaulting to safe'],
        confidence: 0.5,
      };
    }
  };

  const shouldBlockContent = (content: NSFWContent): boolean => {
    if (isSafeModeEnabled) return content.rating.level !== 'safe';
    if (!nsfwSettings.allowNSFWContent) return content.rating.level === 'explicit';
    if (parentalControls.isEnabled) return content.rating.level !== 'safe';
    if (!nsfwSettings.isAgeVerified && content.rating.level === 'explicit') return true;
    
    switch (nsfwSettings.contentFilterLevel) {
      case 'strict':
        return content.rating.level === 'explicit' || content.rating.level === 'mature';
      case 'moderate':
        return content.rating.level === 'explicit';
      case 'minimal':
        return false;
      case 'off':
        return false;
      default:
        return true;
    }
  };

  const shouldBlurContent = (content: NSFWContent): boolean => {
    if (shouldBlockContent(content)) return false; // Blocked content isn't shown at all
    if (!nsfwSettings.blurNSFWImages) return false;
    
    return content.rating.level === 'mature' || content.rating.level === 'suggestive';
  };

  const shouldShowWarning = (content: NSFWContent): boolean => {
    if (shouldBlockContent(content)) return false;
    if (!nsfwSettings.showContentWarnings) return false;
    
    return content.rating.level !== 'safe';
  };

  const reportContent = async (contentId: string, reason: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate reporting content to moderation team
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, this would send to moderation API
      console.log(`Content ${contentId} reported for: ${reason}`);
      
      return true;
    } catch (err) {
      setError('Failed to report content');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const flagAsNSFW = async (contentId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate flagging content as NSFW
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (err) {
      setError('Failed to flag content');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const requestContentReview = async (contentId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate requesting manual review
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (err) {
      setError('Failed to request content review');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const enableParentalControls = async (controls: ParentalControls): Promise<boolean> => {
    try {
      setParentalControls({ ...controls, isEnabled: true });
      await AsyncStorage.setItem(STORAGE_KEYS.PARENTAL_CONTROLS, JSON.stringify(controls));
      
      // Enable safe mode when parental controls are enabled
      await enableSafeMode();
      
      return true;
    } catch (err) {
      setError('Failed to enable parental controls');
      return false;
    }
  };

  const disableParentalControls = async (pin: string): Promise<boolean> => {
    try {
      if (pin !== parentalControls.pin) {
        setError('Incorrect PIN');
        return false;
      }
      
      const disabledControls = { ...parentalControls, isEnabled: false };
      setParentalControls(disabledControls);
      await AsyncStorage.setItem(STORAGE_KEYS.PARENTAL_CONTROLS, JSON.stringify(disabledControls));
      
      return true;
    } catch (err) {
      setError('Failed to disable parental controls');
      return false;
    }
  };

  const checkParentalRestrictions = (): boolean => {
    if (!parentalControls.isEnabled) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const startTime = parentalControls.allowedHours.start;
    const endTime = parentalControls.allowedHours.end;
    
    return currentTime < startTime || currentTime > endTime;
  };

  const enableSafeMode = async (): Promise<void> => {
    try {
      setIsSafeModeEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.SAFE_MODE, JSON.stringify(true));
      
      // Update NSFW settings for safe mode
      await updateNSFWSettings({
        allowNSFWContent: false,
        contentFilterLevel: 'strict',
        blurNSFWImages: true,
        hideNSFWText: true,
        showContentWarnings: true,
      });
    } catch (err) {
      setError('Failed to enable safe mode');
      throw err;
    }
  };

  const disableSafeMode = async (): Promise<void> => {
    try {
      if (!ageVerification.isVerified) {
        setError('Age verification required to disable safe mode');
        throw new Error('Age verification required');
      }
      
      setIsSafeModeEnabled(false);
      await AsyncStorage.setItem(STORAGE_KEYS.SAFE_MODE, JSON.stringify(false));
    } catch (err) {
      setError('Failed to disable safe mode');
      throw err;
    }
  };

  const getContentExposureReport = async (): Promise<any> => {
    try {
      setIsLoading(true);
      
      // Simulate generating exposure report
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        totalContentViewed: 1247,
        nsfwContentBlocked: 89,
        warningsShown: 156,
        reportsSubmitted: 3,
        filterEffectiveness: 96.8,
        safeModeActiveDays: 15,
      };
    } catch (err) {
      setError('Failed to generate content exposure report');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteringEffectiveness = async (): Promise<any> => {
    try {
      setIsLoading(true);
      
      // Simulate analyzing filter effectiveness
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        accuracy: 94.2,
        falsePositives: 3.1,
        falseNegatives: 2.7,
        userSatisfaction: 87.5,
        lastUpdated: new Date().toISOString(),
      };
    } catch (err) {
      setError('Failed to get filtering effectiveness');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const emergencyBlock = async (): Promise<void> => {
    try {
      // Immediately enable strictest settings
      await enableSafeMode();
      await updateNSFWSettings({
        allowNSFWContent: false,
        contentFilterLevel: 'strict',
        blurNSFWImages: true,
        hideNSFWText: true,
        showContentWarnings: true,
        requireConfirmation: true,
      });
      
      // Log emergency action
      console.log('Emergency block activated at:', new Date().toISOString());
    } catch (err) {
      setError('Failed to activate emergency block');
      throw err;
    }
  };

  const reportUnsafeContent = async (contentId: string, details: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate reporting unsafe content with high priority
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, this would trigger immediate moderation review
      console.log(`URGENT: Unsafe content reported - ID: ${contentId}, Details: ${details}`);
      
      return true;
    } catch (err) {
      setError('Failed to report unsafe content');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const requestHelpFromModerator = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate connecting with live moderator
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (err) {
      setError('Failed to connect with moderator');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: NSFWContextType = {
    nsfwSettings,
    updateNSFWSettings,
    ageVerification,
    startAgeVerification,
    uploadVerificationDocument,
    checkAgeVerificationStatus,
    checkContentRating,
    shouldBlockContent,
    shouldBlurContent,
    shouldShowWarning,
    reportContent,
    flagAsNSFW,
    requestContentReview,
    parentalControls,
    enableParentalControls,
    disableParentalControls,
    checkParentalRestrictions,
    isSafeModeEnabled,
    enableSafeMode,
    disableSafeMode,
    getContentExposureReport,
    getFilteringEffectiveness,
    emergencyBlock,
    reportUnsafeContent,
    requestHelpFromModerator,
    isLoading,
    error,
  };

  return (
    <NSFWContext.Provider value={value}>
      {children}
    </NSFWContext.Provider>
  );
};

export const useNSFW = (): NSFWContextType => {
  const context = useContext(NSFWContext);
  if (context === undefined) {
    throw new Error('useNSFW must be used within an NSFWProvider');
  }
  return context;
}; 