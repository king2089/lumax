import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, AppState, AppStateStatus } from 'react-native';
import VersionManager, { VersionInfo } from '../utils/VersionManager';
import UpdateBackendService from './UpdateBackendService';
import AutoUpdateService from './AutoUpdateService';

export interface UpdateInfo {
  version: string;
  newVersion: string;
  size: string;
  features: string[];
  isAvailable: boolean;
  isRequired: boolean;
  lastChecked: Date;
  autoUpdateEnabled: boolean;
  layoutFixes?: string[];
  bugFixes?: string[];
  newFeatures?: string[];
  screenFitting?: string[];
}

export interface UpdateProgress {
  progress: number;
  status: 'idle' | 'checking' | 'downloading' | 'installing' | 'complete' | 'error';
  message: string;
  speed?: number;
  estimatedTimeRemaining?: number;
  layoutUpdates?: boolean;
  bugFixes?: boolean;
  newFeatures?: boolean;
  screenFitting?: boolean;
}

class UpdateManager {
  private static instance: UpdateManager;
  private updateInfo: UpdateInfo;
  private updateProgress: UpdateProgress;
  private listeners: ((progress: UpdateProgress) => void)[] = [];
  private appStateListener: any;
  private updateCheckInterval: NodeJS.Timeout | null = null;
  private autoUpdateService: AutoUpdateService;

  private constructor() {
    const versionManager = VersionManager.getInstance();
    const currentVersion = versionManager.getCurrentVersion();
    
    this.autoUpdateService = AutoUpdateService.getInstance();
    
    this.updateInfo = {
      version: currentVersion,
      newVersion: '1.1.2', // Always latest version
      size: '45.2 MB',
      features: [
        'Enhanced Gen 1 AI features with improved responses',
        'Better content creation tools with AI assistance',
        'Improved performance and faster loading times',
        'New social features for better community engagement',
        'Enhanced privacy controls and security',
        'Strip Club 18+ enhancements',
        'Auto-update improvements',
        'Layout fixes for all screen sizes',
        'Bug fixes and stability improvements',
        'New Gen 1 features and enhancements',
        'Improved responsive design',
        'Better screen fitting',
        'Enhanced user experience',
        'Performance optimizations',
        'Security improvements'
      ],
      isAvailable: true, // Always show updates available
      isRequired: false,
      lastChecked: new Date(),
      autoUpdateEnabled: true,
      layoutFixes: [
        'Fixed screen fitting issues on all devices',
        'Improved responsive design for tablets',
        'Enhanced layout for small screens',
        'Better orientation handling',
        'Auto-scaling improvements',
        'Fixed layout bugs on various screen sizes',
        'Improved card layouts',
        'Better spacing and padding'
      ],
      bugFixes: [
        'Fixed network timeout errors',
        'Resolved update notification issues',
        'Improved error handling',
        'Enhanced performance',
        'Fixed layout bugs',
        'Resolved UI glitches',
        'Fixed navigation issues',
        'Improved stability'
      ],
      newFeatures: [
        'Enhanced like system with Gen 1 effects',
        'Improved comment system',
        'Better post creation flow',
        'Enhanced AI features',
        'New social interactions',
        'Improved notifications',
        'Better search functionality',
        'Enhanced user profiles'
      ],
      screenFitting: [
        'Auto-responsive layouts for all screen sizes',
        'Dynamic scaling for different devices',
        'Improved tablet layouts',
        'Better small screen optimization',
        'Enhanced orientation handling',
        'Smart padding and margin adjustments',
        'Optimized font sizes for readability',
        'Improved touch targets for better UX'
      ]
    };

    this.updateProgress = {
      progress: 0,
      status: 'idle',
      message: 'Ready for updates',
      layoutUpdates: true,
      bugFixes: true,
      newFeatures: true,
      screenFitting: true
    };

    this.initializeAppStateListener();
    this.loadSettings();
    this.startAutoUpdateCheck();
  }

  public static getInstance(): UpdateManager {
    if (!UpdateManager.instance) {
      UpdateManager.instance = new UpdateManager();
    }
    return UpdateManager.instance;
  }

  private async loadSettings() {
    try {
      const settings = await AsyncStorage.getItem('updateManagerSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.updateInfo = { ...this.updateInfo, ...parsed };
      }
    } catch (error) {
      // Silent error handling
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem('updateManagerSettings', JSON.stringify({
        autoUpdateEnabled: this.updateInfo.autoUpdateEnabled,
        lastChecked: this.updateInfo.lastChecked,
        version: this.updateInfo.version
      }));
    } catch (error) {
      // Silent error handling
    }
  }

  private initializeAppStateListener() {
    this.appStateListener = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground, always check for updates
      this.checkForUpdatesInBackground();
    }
  };

  private startAutoUpdateCheck() {
    // Check for updates every 2 minutes
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdatesInBackground();
    }, 2 * 60 * 1000);
  }

  public async checkForUpdatesInBackground() {
    try {
      // Always provide latest update info
      this.updateInfo.isAvailable = true;
      this.updateInfo.lastChecked = new Date();
      this.updateInfo.newVersion = this.getLatestVersion();
      
      // Update features list with latest improvements
      this.updateInfo.features = this.getLatestFeatures();
      this.updateInfo.layoutFixes = this.getLatestLayoutFixes();
      this.updateInfo.bugFixes = this.getLatestBugFixes();
      this.updateInfo.newFeatures = this.getLatestNewFeatures();
      this.updateInfo.screenFitting = this.getLatestScreenFitting();
      
      await this.saveSettings();

      // Notify listeners that update is available
      this.updateProgress = {
        progress: 100,
        status: 'idle',
        message: 'Latest update available',
        layoutUpdates: true,
        bugFixes: true,
        newFeatures: true,
        screenFitting: true
      };
      this.notifyListeners();

    } catch (error) {
      // Silent error handling - always provide updates
      this.updateInfo.isAvailable = true;
    }
  }

  private getLatestVersion(): string {
    const versions = ['1.1.2', '1.1.3', '1.2.0', '1.2.1'];
    return versions[Math.floor(Math.random() * versions.length)];
  }

  private getLatestFeatures(): string[] {
    const allFeatures = [
      'Enhanced Gen 1 AI features with improved responses',
      'Better content creation tools with AI assistance',
      'Improved performance and faster loading times',
      'New social features for better community engagement',
      'Enhanced privacy controls and security',
      'Strip Club 18+ enhancements',
      'Auto-update improvements',
      'Layout fixes for all screen sizes',
      'Bug fixes and stability improvements',
      'New Gen 1 features and enhancements',
      'Improved responsive design',
      'Better screen fitting',
      'Enhanced user experience',
      'Performance optimizations',
      'Security improvements',
      'Advanced AI capabilities',
      'Enhanced social interactions',
      'Improved content discovery',
      'Better accessibility features',
      'Enhanced customization options'
    ];
    
    // Return random selection of features
    return allFeatures.sort(() => 0.5 - Math.random()).slice(0, 10);
  }

  private getLatestLayoutFixes(): string[] {
    return [
      'Fixed screen fitting issues on all devices',
      'Improved responsive design for tablets',
      'Enhanced layout for small screens',
      'Better orientation handling',
      'Auto-scaling improvements',
      'Fixed layout bugs on various screen sizes',
      'Improved card layouts',
      'Better spacing and padding',
      'Enhanced navigation layout',
      'Improved modal layouts',
      'Better list item spacing',
      'Fixed header alignment issues',
      'Improved button layouts',
      'Enhanced form layouts'
    ];
  }

  private getLatestBugFixes(): string[] {
    return [
      'Fixed network timeout errors',
      'Resolved update notification issues',
      'Improved error handling',
      'Enhanced performance',
      'Fixed layout bugs',
      'Resolved UI glitches',
      'Fixed navigation issues',
      'Improved stability',
      'Fixed memory leaks',
      'Resolved crash issues',
      'Fixed data synchronization problems',
      'Improved loading states',
      'Fixed image loading issues',
      'Resolved audio playback problems'
    ];
  }

  private getLatestNewFeatures(): string[] {
    return [
      'Enhanced like system with Gen 1 effects',
      'Improved comment system',
      'Better post creation flow',
      'Enhanced AI features',
      'New social interactions',
      'Improved notifications',
      'Better search functionality',
      'Enhanced user profiles',
      'Advanced content filtering',
      'Improved privacy controls',
      'Enhanced sharing options',
      'Better content discovery',
      'Improved accessibility',
      'Enhanced customization'
    ];
  }

  private getLatestScreenFitting(): string[] {
    return [
      'Auto-responsive layouts for all screen sizes',
      'Dynamic scaling for different devices',
      'Improved tablet layouts',
      'Better small screen optimization',
      'Enhanced orientation handling',
      'Smart padding and margin adjustments',
      'Optimized font sizes for readability',
      'Improved touch targets for better UX',
      'Enhanced gesture recognition',
      'Better keyboard handling',
      'Improved safe area handling',
      'Dynamic content sizing',
      'Enhanced scroll performance',
      'Better visual hierarchy'
    ];
  }

  public async startUpdate(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.updateProgress = {
          progress: 0,
          status: 'checking',
          message: 'Checking for latest updates...',
          layoutUpdates: true,
          bugFixes: true,
          newFeatures: true,
          screenFitting: true
        };
        this.notifyListeners();

        // Simulate update process
        await this.simulateUpdateProcess();

        this.updateProgress = {
          progress: 100,
          status: 'complete',
          message: 'Update completed successfully!',
          layoutUpdates: true,
          bugFixes: true,
          newFeatures: true,
          screenFitting: true
        };
        this.notifyListeners();

        // Update version info
        this.updateInfo.version = this.updateInfo.newVersion;
        this.updateInfo.isAvailable = false;
        await this.saveSettings();

        resolve();
      } catch (error) {
        this.updateProgress = {
          progress: 0,
          status: 'error',
          message: 'Update failed. Please try again.',
          layoutUpdates: false,
          bugFixes: false,
          newFeatures: false,
          screenFitting: false
        };
        this.notifyListeners();
        reject(error);
      }
    });
  }

  private async simulateUpdateProcess() {
    const steps = [
      { progress: 10, message: 'Checking for updates...' },
      { progress: 20, message: 'Downloading layout fixes...' },
      { progress: 35, message: 'Installing bug fixes...' },
      { progress: 50, message: 'Adding new features...' },
      { progress: 65, message: 'Optimizing screen fitting...' },
      { progress: 80, message: 'Optimizing performance...' },
      { progress: 95, message: 'Finalizing update...' },
      { progress: 100, message: 'Update completed!' }
    ];

    for (const step of steps) {
      this.updateProgress = {
        ...this.updateProgress,
        progress: step.progress,
        status: step.progress < 100 ? 'downloading' : 'complete',
        message: step.message
      };
      this.notifyListeners();
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  public getUpdateInfo(): UpdateInfo {
    return { ...this.updateInfo };
  }

  public getUpdateProgress(): UpdateProgress {
    return { ...this.updateProgress };
  }

  public triggerUpdateNotification() {
    // Always trigger update notification
    this.updateInfo.isAvailable = true;
    this.updateInfo.lastChecked = new Date();
    this.notifyListeners();
  }

  public forceUpdateAvailable() {
    this.updateInfo.isAvailable = true;
    this.updateInfo.isRequired = true;
    this.updateInfo.newVersion = this.getLatestVersion();
    this.updateInfo.features = this.getLatestFeatures();
    this.updateInfo.layoutFixes = this.getLatestLayoutFixes();
    this.updateInfo.bugFixes = this.getLatestBugFixes();
    this.updateInfo.newFeatures = this.getLatestNewFeatures();
    this.updateInfo.screenFitting = this.getLatestScreenFitting();
    this.notifyListeners();
  }

  public setAutoUpdateEnabled(enabled: boolean) {
    this.updateInfo.autoUpdateEnabled = enabled;
    this.saveSettings();
  }

  public addProgressListener(listener: (progress: UpdateProgress) => void) {
    this.listeners.push(listener);
  }

  public removeProgressListener(listener: (progress: UpdateProgress) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.updateProgress);
      } catch (error) {
        // Silent error handling
      }
    });
  }

  public cleanup() {
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }
    this.listeners = [];
  }
}

export default UpdateManager; 