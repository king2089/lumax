import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface PreRegistrationData {
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

export interface PreRegistrationStats {
  totalRegistrations: number;
  earlyAccessCount: number;
  betaAccessCount: number;
  lastUpdated: string;
}

class PreRegistrationService {
  private static instance: PreRegistrationService;
  private deviceId: string;
  private apiBaseUrl: string;

  private constructor() {
    this.deviceId = this.generateDeviceId();
    this.apiBaseUrl = process.env.EXPO_PUBLIC_PREREGISTRATION_API_URL || 
                     'https://luma-gen2.vercel.app/api/preregistration';
  }

  public static getInstance(): PreRegistrationService {
    if (!PreRegistrationService.instance) {
      PreRegistrationService.instance = new PreRegistrationService();
    }
    return PreRegistrationService.instance;
  }

  private generateDeviceId(): string {
    return `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public async preRegister(email: string, preferences?: Partial<PreRegistrationData['preferences']>): Promise<boolean> {
    try {
      const registrationData: PreRegistrationData = {
        email: email.toLowerCase().trim(),
        deviceId: this.deviceId,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
        preferences: {
          earlyAccess: true,
          betaTesting: true,
          marketingEmails: true,
          notifications: true,
          ...preferences,
        },
        status: 'pending',
      };

      // Save locally first
      await this.saveLocalRegistration(registrationData);

      // Try to send to backend
      try {
        await this.sendToBackend(registrationData);
        await this.updateLocalStatus(email, 'confirmed');
      } catch (backendError) {
        console.log('Backend registration failed, keeping local registration:', backendError);
        // Keep local registration even if backend fails
      }

      return true;
    } catch (error) {
      console.error('Pre-registration failed:', error);
      throw error;
    }
  }

  private async saveLocalRegistration(data: PreRegistrationData): Promise<void> {
    try {
      const existingRegistrations = await this.getLocalRegistrations();
      const updatedRegistrations = [...existingRegistrations, data];
      
      await AsyncStorage.setItem(
        'luma_gen2_preregistrations', 
        JSON.stringify(updatedRegistrations)
      );
    } catch (error) {
      console.error('Error saving local registration:', error);
      throw error;
    }
  }

  private async sendToBackend(data: PreRegistrationData): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Version': '1.0.0',
        'X-Platform': Platform.OS,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Backend registration failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Backend registration successful:', result);
  }

  public async isPreRegistered(email: string): Promise<boolean> {
    try {
      const registrations = await this.getLocalRegistrations();
      return registrations.some(reg => reg.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
      return false;
    }
  }

  public async getLocalRegistrations(): Promise<PreRegistrationData[]> {
    try {
      const stored = await AsyncStorage.getItem('luma_gen2_preregistrations');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting local registrations:', error);
      return [];
    }
  }

  private async updateLocalStatus(email: string, status: PreRegistrationData['status']): Promise<void> {
    try {
      const registrations = await this.getLocalRegistrations();
      const updatedRegistrations = registrations.map(reg => 
        reg.email.toLowerCase() === email.toLowerCase() 
          ? { ...reg, status } 
          : reg
      );
      
      await AsyncStorage.setItem(
        'luma_gen2_preregistrations', 
        JSON.stringify(updatedRegistrations)
      );
    } catch (error) {
      console.error('Error updating local status:', error);
    }
  }

  public async getPreRegistrationStats(): Promise<PreRegistrationStats> {
    try {
      // Try to get from backend first
      try {
        const response = await fetch(`${this.apiBaseUrl}/stats`);
        if (response.ok) {
          const stats = await response.json();
          return stats;
        }
      } catch (error) {
        console.log('Failed to get stats from backend, using local data:', error);
      }

      // Fallback to local stats
      const registrations = await this.getLocalRegistrations();
      const totalRegistrations = registrations.length;
      const earlyAccessCount = registrations.filter(reg => reg.status === 'early_access').length;
      const betaAccessCount = registrations.filter(reg => reg.status === 'beta_access').length;

      return {
        totalRegistrations,
        earlyAccessCount,
        betaAccessCount,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting pre-registration stats:', error);
      return {
        totalRegistrations: 15420, // Fallback number
        earlyAccessCount: 0,
        betaAccessCount: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  public async checkEarlyAccessEligibility(email: string): Promise<boolean> {
    try {
      const registrations = await this.getLocalRegistrations();
      const registration = registrations.find(reg => 
        reg.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!registration) return false;

      // Check if user registered early enough for early access
      const registrationDate = new Date(registration.timestamp);
      const earlyAccessCutoff = new Date('2025-04-01'); // Q2 2025 cutoff
      
      return registrationDate < earlyAccessCutoff;
    } catch (error) {
      return false;
    }
  }

  public async checkBetaAccessEligibility(email: string): Promise<boolean> {
    try {
      const registrations = await this.getLocalRegistrations();
      const registration = registrations.find(reg => 
        reg.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!registration) return false;

      // Check if user registered early enough for beta access
      const registrationDate = new Date(registration.timestamp);
      const betaAccessCutoff = new Date('2025-03-01'); // Q2 2025 cutoff
      
      return registrationDate < betaAccessCutoff;
    } catch (error) {
      return false;
    }
  }

  public async updatePreferences(
    email: string, 
    preferences: Partial<PreRegistrationData['preferences']>
  ): Promise<void> {
    try {
      const registrations = await this.getLocalRegistrations();
      const updatedRegistrations = registrations.map(reg => 
        reg.email.toLowerCase() === email.toLowerCase() 
          ? { ...reg, preferences: { ...reg.preferences, ...preferences } } 
          : reg
      );
      
      await AsyncStorage.setItem(
        'luma_gen2_preregistrations', 
        JSON.stringify(updatedRegistrations)
      );

      // Try to update backend
      try {
        await fetch(`${this.apiBaseUrl}/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, preferences }),
        });
      } catch (error) {
        console.log('Failed to update preferences on backend:', error);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  public async getRegistrationInfo(email: string): Promise<PreRegistrationData | null> {
    try {
      const registrations = await this.getLocalRegistrations();
      return registrations.find(reg => 
        reg.email.toLowerCase() === email.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error getting registration info:', error);
      return null;
    }
  }

  public async syncWithBackend(): Promise<void> {
    try {
      const localRegistrations = await this.getLocalRegistrations();
      
      // Send all local registrations to backend
      for (const registration of localRegistrations) {
        if (registration.status === 'pending') {
          try {
            await this.sendToBackend(registration);
            await this.updateLocalStatus(registration.email, 'confirmed');
          } catch (error) {
            console.log(`Failed to sync registration for ${registration.email}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing with backend:', error);
    }
  }

  public async clearLocalData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('luma_gen2_preregistrations');
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }
}

export default PreRegistrationService; 