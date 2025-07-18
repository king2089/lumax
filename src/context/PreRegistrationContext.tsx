import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PreRegistrationData {
  email: string;
  deviceId: string;
  platform: string;
  timestamp: string;
  preferences: {
    earlyAccess: boolean;
    betaTesting: boolean;
    marketingEmails: boolean;
    notifications: boolean;
  };
  status: 'pending' | 'confirmed' | 'early_access' | 'beta_access';
}

interface PreRegistrationStats {
  totalRegistrations: number;
  earlyAccessCount: number;
  betaAccessCount: number;
  lastUpdated: string;
}

interface PreRegistrationContextType {
  isPreRegistered: boolean;
  preRegistrationStats: PreRegistrationStats;
  userRegistration: PreRegistrationData | null;
  preRegister: (email: string, preferences?: Partial<PreRegistrationData['preferences']>) => Promise<boolean>;
  checkPreRegistrationStatus: (email: string) => Promise<boolean>;
  updatePreferences: (email: string, preferences: Partial<PreRegistrationData['preferences']>) => Promise<void>;
  refreshStats: () => Promise<void>;
  loading: boolean;
}

const PreRegistrationContext = createContext<PreRegistrationContextType | undefined>(undefined);

export const usePreRegistration = () => {
  const context = useContext(PreRegistrationContext);
  if (context === undefined) {
    throw new Error('usePreRegistration must be used within a PreRegistrationProvider');
  }
  return context;
};

interface PreRegistrationProviderProps {
  children: ReactNode;
}

const PreRegistrationProvider: React.FC<PreRegistrationProviderProps> = ({ children }) => {
  const [isPreRegistered, setIsPreRegistered] = useState(true); // Set to true to hide the banner
  const [preRegistrationStats, setPreRegistrationStats] = useState<PreRegistrationStats>({
    totalRegistrations: 15420,
    earlyAccessCount: 0,
    betaAccessCount: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [userRegistration, setUserRegistration] = useState<PreRegistrationData | null>(null);
  const [loading, setLoading] = useState(false);

  const preRegister = async (email: string, preferences?: Partial<PreRegistrationData['preferences']>): Promise<boolean> => {
    try {
      setIsPreRegistered(true);
      return true;
    } catch (error) {
      console.error('Error in pre-registration:', error);
      return false;
    }
  };

  const checkPreRegistrationStatus = async (email: string): Promise<boolean> => {
    return isPreRegistered;
  };

  const updatePreferences = async (email: string, preferences: Partial<PreRegistrationData['preferences']>): Promise<void> => {
    // Implementation for updating preferences
  };

  const refreshStats = async (): Promise<void> => {
    // Implementation for refreshing stats
  };

  const value: PreRegistrationContextType = {
    isPreRegistered,
    preRegistrationStats,
    userRegistration,
    preRegister,
    checkPreRegistrationStatus,
    updatePreferences,
    refreshStats,
    loading,
  };

  return (
    <PreRegistrationContext.Provider value={value}>
      {children}
    </PreRegistrationContext.Provider>
  );
};

export { PreRegistrationProvider }; 