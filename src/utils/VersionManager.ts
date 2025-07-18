import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VersionInfo {
  version: string;
  buildNumber: string;
  releaseDate: Date;
  features: string[];
  isRequired: boolean;
  downloadSize: string;
  changelog: string[];
}

export interface VersionHistory {
  currentVersion: string;
  installedVersions: string[];
  lastUpdateCheck: Date;
  updatePreferences: {
    autoUpdate: boolean;
    betaUpdates: boolean;
    wifiOnly: boolean;
  };
}

class VersionManager {
  private static instance: VersionManager;
  private currentVersion = '1.0.0';
  private versionHistory: VersionHistory;

  private constructor() {
    this.versionHistory = {
      currentVersion: this.currentVersion,
      installedVersions: [this.currentVersion],
      lastUpdateCheck: new Date(),
      updatePreferences: {
        autoUpdate: true,
        betaUpdates: false,
        wifiOnly: true,
      },
    };
    this.loadVersionHistory();
  }

  public static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager();
    }
    return VersionManager.instance;
  }

  private async loadVersionHistory() {
    try {
      const stored = await AsyncStorage.getItem('versionHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.versionHistory = { ...this.versionHistory, ...parsed };
      }
    } catch (error) {
      console.log('Error loading version history:', error);
    }
  }

  private async saveVersionHistory() {
    try {
      await AsyncStorage.setItem('versionHistory', JSON.stringify(this.versionHistory));
    } catch (error) {
      console.log('Error saving version history:', error);
    }
  }

  public getCurrentVersion(): string {
    return this.currentVersion;
  }

  public getVersionHistory(): VersionHistory {
    return { ...this.versionHistory };
  }

  public async checkForUpdates(): Promise<VersionInfo | null> {
    // Simulate API call to check for updates
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different update scenarios
    const scenarios = [
      {
        version: '1.1.0',
        buildNumber: '101',
        releaseDate: new Date(),
        features: [
          'Enhanced Gen 1 AI features',
          'Improved live streaming quality',
          'New content creation tools',
          'Performance optimizations',
          'Bug fixes and stability improvements'
        ],
        isRequired: false,
        downloadSize: '45.2 MB',
        changelog: [
          '🚀 New Gen 1 AI assistant with enhanced capabilities',
          '📺 Improved 4K/8K live streaming with HDR support',
          '🎨 Advanced content creation tools with AI assistance',
          '⚡ Performance improvements and faster loading times',
          '🐛 Fixed various bugs and improved stability',
          '🎯 Enhanced user experience with smoother animations'
        ]
      },
      {
        version: '1.2.0',
        buildNumber: '102',
        releaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        features: [
          'Advanced AI-powered content recommendations',
          'Real-time collaboration features',
          'Enhanced security and privacy controls',
          'New social features and community tools',
          'Improved accessibility features'
        ],
        isRequired: false,
        downloadSize: '52.8 MB',
        changelog: [
          '🤖 AI-powered content recommendations',
          '👥 Real-time collaboration tools',
          '🔒 Enhanced security and privacy',
          '🌐 New social and community features',
          '♿ Improved accessibility support'
        ]
      }
    ];

    // Randomly select a scenario (30% chance of update)
    if (Math.random() < 0.3) {
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      // Only return update if version is newer
      if (this.compareVersions(scenario.version, this.currentVersion) > 0) {
        this.versionHistory.lastUpdateCheck = new Date();
        await this.saveVersionHistory();
        return scenario;
      }
    }

    this.versionHistory.lastUpdateCheck = new Date();
    await this.saveVersionHistory();
    return null;
  }

  public async installUpdate(versionInfo: VersionInfo): Promise<boolean> {
    try {
      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update version history
      this.currentVersion = versionInfo.version;
      this.versionHistory.currentVersion = versionInfo.version;
      this.versionHistory.installedVersions.push(versionInfo.version);
      await this.saveVersionHistory();

      return true;
    } catch (error) {
      console.log('Error installing update:', error);
      return false;
    }
  }

  public updatePreferences(preferences: Partial<VersionHistory['updatePreferences']>) {
    this.versionHistory.updatePreferences = {
      ...this.versionHistory.updatePreferences,
      ...preferences
    };
    this.saveVersionHistory();
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

  public getUpdateSize(): string {
    return '45.2 MB';
  }

  public isUpdateRequired(): boolean {
    return false; // For now, no updates are required
  }

  public getChangelog(): string[] {
    return [
      '🚀 New Gen 1 AI assistant with enhanced capabilities',
      '📺 Improved 4K/8K live streaming with HDR support',
      '🎨 Advanced content creation tools with AI assistance',
      '⚡ Performance improvements and faster loading times',
      '🐛 Fixed various bugs and improved stability',
      '🎯 Enhanced user experience with smoother animations'
    ];
  }
}

export default VersionManager; 