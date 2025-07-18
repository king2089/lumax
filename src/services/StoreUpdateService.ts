import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoreUpdateInfo {
  currentVersion: string;
  storeVersion: string;
  isUpdateAvailable: boolean;
  storeUrl: string;
  lastChecked: Date;
  updateSize?: string;
  releaseNotes?: string[];
}

export interface StoreUpdateProgress {
  status: 'checking' | 'available' | 'not-available' | 'error';
  message: string;
}

class StoreUpdateService {
  private static instance: StoreUpdateService;
  private listeners: ((progress: StoreUpdateProgress) => void)[] = [];
  private updateInfo: StoreUpdateInfo;

  // Store URLs - replace with actual app URLs when published
  private readonly STORE_URLS = {
    ios: 'https://apps.apple.com/app/luma-gen1/id1234567890',
    android: 'https://play.google.com/store/apps/details?id=com.yungking2029.luma-go-fresh-start'
  };

  private constructor() {
    this.updateInfo = {
      currentVersion: '1.0.0',
      storeVersion: '1.0.0',
      isUpdateAvailable: false,
      storeUrl: Platform.OS === 'ios' ? this.STORE_URLS.ios : this.STORE_URLS.android,
      lastChecked: new Date(),
      updateSize: '45.2 MB',
      releaseNotes: [
        'Enhanced Gen 1 AI features',
        'Improved live streaming quality',
        'New content creation tools',
        'Performance optimizations',
        'Bug fixes and stability improvements'
      ]
    };
    this.loadSettings();
  }

  public static getInstance(): StoreUpdateService {
    if (!StoreUpdateService.instance) {
      StoreUpdateService.instance = new StoreUpdateService();
    }
    return StoreUpdateService.instance;
  }

  private async loadSettings() {
    try {
      const saved = await AsyncStorage.getItem('storeUpdateSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.updateInfo = { ...this.updateInfo, ...settings };
      }
    } catch (error) {
      console.log('Error loading store update settings:', error);
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem('storeUpdateSettings', JSON.stringify(this.updateInfo));
    } catch (error) {
      console.log('Error saving store update settings:', error);
    }
  }

  public addProgressListener(listener: (progress: StoreUpdateProgress) => void) {
    this.listeners.push(listener);
  }

  public removeProgressListener(listener: (progress: StoreUpdateProgress) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(progress: StoreUpdateProgress) {
    this.listeners.forEach(listener => listener(progress));
  }

  public getUpdateInfo(): StoreUpdateInfo {
    return { ...this.updateInfo };
  }

  public async checkForStoreUpdates(): Promise<StoreUpdateInfo> {
    this.notifyListeners({
      status: 'checking',
      message: 'Checking for store updates...'
    });

    try {
      // Simulate store API check - in real implementation, you would call the store APIs
      const mockStoreVersion = '1.1.0';
      const isUpdateAvailable = this.compareVersions(mockStoreVersion, this.updateInfo.currentVersion) > 0;

      this.updateInfo.storeVersion = mockStoreVersion;
      this.updateInfo.isUpdateAvailable = isUpdateAvailable;
      this.updateInfo.lastChecked = new Date();

      await this.saveSettings();

      this.notifyListeners({
        status: isUpdateAvailable ? 'available' : 'not-available',
        message: isUpdateAvailable ? 'Update available in store!' : 'App is up to date'
      });

      return this.updateInfo;
    } catch (error) {
      console.log('Error checking store updates:', error);
      this.notifyListeners({
        status: 'error',
        message: 'Failed to check for store updates'
      });
      throw error;
    }
  }

  public async openStore(): Promise<void> {
    try {
      const canOpen = await Linking.canOpenURL(this.updateInfo.storeUrl);
      if (canOpen) {
        await Linking.openURL(this.updateInfo.storeUrl);
      } else {
        Alert.alert(
          'Cannot Open Store',
          'Unable to open the app store. Please manually check for updates.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Error opening store:', error);
      Alert.alert(
        'Error',
        'Failed to open the app store. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  public async openStoreWithUpdatePrompt(): Promise<void> {
    if (!this.updateInfo.isUpdateAvailable) {
      Alert.alert(
        'No Update Available',
        'Your app is already up to date!',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Update Available',
      `Version ${this.updateInfo.storeVersion} is available in the store.\n\nWould you like to open the store to update?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update Now', 
          onPress: () => this.openStore()
        }
      ]
    );
  }

  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1 = v1Parts[i] || 0;
      const v2 = v2Parts[i] || 0;
      
      if (v1 > v2) return 1;
      if (v1 < v2) return -1;
    }
    
    return 0;
  }

  public getStoreBadge(): string | undefined {
    if (this.updateInfo.isUpdateAvailable) {
      return Platform.OS === 'ios' ? 'STORE' : 'STORE';
    }
    return undefined;
  }

  public getStoreUpdateMessage(): string {
    if (this.updateInfo.isUpdateAvailable) {
      return `Update to version ${this.updateInfo.storeVersion} available in ${Platform.OS === 'ios' ? 'App Store' : 'Google Play Store'}`;
    }
    return 'App is up to date';
  }
}

export default StoreUpdateService; 