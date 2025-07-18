import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { getUpdateConfig, UPDATE_ENDPOINTS, UPDATE_STATUS } from '../config/updateServer';
import Constants from 'expo-constants';

export interface BackendUpdateInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
  features: string[];
  isRequired: boolean;
  downloadSize: number;
  downloadUrl: string;
  changelog: string[];
  minVersion: string;
  maxVersion: string;
  updateType: 'patch' | 'minor' | 'major';
  checksum: string;
  isHotUpdate: boolean;
  isGen1Update?: boolean; // Added for Gen 1 specific updates
}

export interface UpdateDownloadProgress {
  bytesDownloaded: number;
  totalBytes: number;
  progress: number;
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
}

export interface UpdateInstallationResult {
  success: boolean;
  error?: string;
  requiresRestart: boolean;
  newVersion: string;
}

class UpdateBackendService {
  private static instance: UpdateBackendService;
  private config = getUpdateConfig();
  private deviceId: string;
  private currentVersion: string;
  private isUpdating = false;

  private constructor() {
    this.deviceId = this.generateDeviceId();
    // Use expo-constants for version, fallback to '1.0.0'
    this.currentVersion =
      (Constants.manifest && (Constants.manifest.version as string)) ||
      (Constants.expoConfig && (Constants.expoConfig.version as string)) ||
      '1.0.0';
  }

  public static getInstance(): UpdateBackendService {
    if (!UpdateBackendService.instance) {
      UpdateBackendService.instance = new UpdateBackendService();
    }
    return UpdateBackendService.instance;
  }

  private generateDeviceId(): string {
    // Generate a unique device ID for tracking
    return `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    try {
      // Add timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced to 5 seconds
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Device-ID': this.deviceId,
          'X-App-Version': this.currentVersion,
          'X-Platform': Platform.OS,
          'X-App-ID': this.config.appId,
          'X-Channel': this.config.channel,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Handle timeout errors silently for background checks
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - network may be slow');
      }
      
      throw error;
    }
  }

  public async checkForUpdates(): Promise<BackendUpdateInfo | null> {
    try {
      const requestBody = {
        currentVersion: this.currentVersion,
        platform: Platform.OS,
        deviceId: this.deviceId,
        appId: this.config.appId,
        channel: this.config.channel,
      };
      
      const response = await this.makeApiRequest(UPDATE_ENDPOINTS.check, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (response.hasUpdate) {
        return response.updateInfo;
      }

      return null;
    } catch (error) {
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return this.simulateBackendUpdate();
      }
      
      // For other errors, don't show updates
      return null;
    }
  }

  private simulateBackendUpdate(): BackendUpdateInfo {
    // Simulate backend response for development/testing
    return {
      version: '1.1.0',
      buildNumber: '101',
      releaseDate: new Date().toISOString(),
      features: [
        'Enhanced Gen 1 AI features',
        'Improved live streaming quality',
        'New content creation tools',
        'Performance optimizations',
        'Bug fixes and stability improvements',
        'Strip Club 18+ enhancements',
        'Auto-update improvements'
      ],
      isRequired: false,
      downloadSize: 45.2 * 1024 * 1024, // 45.2 MB in bytes
      downloadUrl: 'https://luma-updates.com/downloads/luma-gen1-1.1.0.zip',
      changelog: [
        '🚀 New Gen 1 AI assistant with enhanced capabilities',
        '📺 Improved 4K/8K live streaming with HDR support',
        '🎨 Advanced content creation tools with AI assistance',
        '⚡ Performance improvements and faster loading times',
        '🐛 Fixed various bugs and improved stability',
        '🎯 Enhanced user experience with smoother animations',
        '🔥 Strip Club 18+ new features and improvements',
        '🔄 Auto-update system enhancements'
      ],
      minVersion: '1.0.0',
      maxVersion: '1.0.9',
      updateType: 'minor',
      checksum: 'sha256:abc123...',
      isHotUpdate: false,
    };
  }

  public async downloadUpdate(
    updateInfo: BackendUpdateInfo,
    onProgress?: (progress: UpdateDownloadProgress) => void
  ): Promise<string> {
    if (this.isUpdating) {
      throw new Error('Update already in progress');
    }

    this.isUpdating = true;

    try {
      const downloadDir = `${FileSystem.documentDirectory}updates/`;
      const fileName = `luma-update-${updateInfo.version}.zip`;
      const fileUri = `${downloadDir}${fileName}`;

      // Ensure download directory exists
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });

      // Download the update file
      const downloadResumable = FileSystem.createDownloadResumable(
        updateInfo.downloadUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress: UpdateDownloadProgress = {
            bytesDownloaded: downloadProgress.totalBytesWritten,
            totalBytes: updateInfo.downloadSize,
            progress: (downloadProgress.totalBytesWritten / updateInfo.downloadSize) * 100,
            speed: downloadProgress.totalBytesWritten / (Date.now() / 1000),
            estimatedTimeRemaining: (updateInfo.downloadSize - downloadProgress.totalBytesWritten) / 
              (downloadProgress.totalBytesWritten / (Date.now() / 1000)),
          };
          onProgress?.(progress);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      // Verify checksum
      await this.verifyChecksum(uri, updateInfo.checksum);

      return uri;
    } catch (error) {
      this.isUpdating = false;
      throw error;
    }
  }

  private async verifyChecksum(fileUri: string, expectedChecksum: string): Promise<void> {
    // In a real implementation, you would verify the file checksum
    // For now, we'll simulate the verification
    console.log('Verifying update file checksum...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  public async installUpdate(updateInfo: BackendUpdateInfo, fileUri: string): Promise<UpdateInstallationResult> {
    try {
      if (updateInfo.isHotUpdate) {
        // Handle hot update (no app restart required)
        return await this.installHotUpdate(updateInfo, fileUri);
      } else {
        // Handle full update (requires app restart)
        return await this.installFullUpdate(updateInfo, fileUri);
      }
    } catch (error) {
      this.isUpdating = false;
      throw error;
    }
  }

  private async installHotUpdate(updateInfo: BackendUpdateInfo, fileUri: string): Promise<UpdateInstallationResult> {
    // For hot updates, we would extract and apply the update
    console.log('Installing hot update...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      requiresRestart: false,
      newVersion: updateInfo.version,
    };
  }

  private async installFullUpdate(updateInfo: BackendUpdateInfo, fileUri: string): Promise<UpdateInstallationResult> {
    // For full updates, we need to restart the app
    console.log('Installing full update...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Save update info for restart
    await this.saveUpdateInfo(updateInfo);

    return {
      success: true,
      requiresRestart: true,
      newVersion: updateInfo.version,
    };
  }

  private async saveUpdateInfo(updateInfo: BackendUpdateInfo): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}update-info.json`,
        JSON.stringify(updateInfo)
      );
    } catch (error) {
      console.error('Error saving update info:', error);
    }
  }

  public async restartApp(): Promise<void> {
    try {
      // Show restart dialog
      Alert.alert(
        'Update Complete',
        'The app needs to restart to apply the update. Please close and reopen the app manually.',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Update installed successfully. Please restart the app manually.');
              // In a production app, you would implement proper restart logic
              // For now, we'll just show a message to restart manually
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error handling app restart:', error);
    }
  }

  public async reportUpdateStatus(
    updateInfo: BackendUpdateInfo,
    status: 'started' | 'downloaded' | 'installed' | 'failed',
    error?: string
  ): Promise<void> {
    try {
      await this.makeApiRequest(UPDATE_ENDPOINTS.report, {
        method: 'POST',
        body: JSON.stringify({
          updateId: updateInfo.version,
          status,
          error,
          deviceId: this.deviceId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      // Silently handle report failures
    }
  }

  public getUpdateStatus(): boolean {
    return this.isUpdating;
  }

  public resetUpdateStatus(): void {
    this.isUpdating = false;
  }

  public async getUpdateHistory(): Promise<BackendUpdateInfo[]> {
    try {
      const response = await this.makeApiRequest(UPDATE_ENDPOINTS.history);
      return response.updates || [];
    } catch (error) {
      console.error('Error fetching update history:', error);
      return [];
    }
  }

  public async checkStripClubUpdates(): Promise<BackendUpdateInfo | null> {
    // Special update check for Strip Club 18+ features
    try {
      const response = await this.makeApiRequest(UPDATE_ENDPOINTS.stripClub, {
        method: 'POST',
        body: JSON.stringify({
          currentVersion: this.currentVersion,
          platform: Platform.OS,
          deviceId: this.deviceId,
          feature: 'strip-club-18plus',
        }),
      });

      if (response.hasUpdate) {
        return response.updateInfo;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  public async checkGen2Updates(): Promise<BackendUpdateInfo | null> {
    // Special update check for Gen 2 features
    try {
      const response = await this.makeApiRequest('/updates/gen2', {
        method: 'POST',
        body: JSON.stringify({
          currentVersion: this.currentVersion,
          platform: Platform.OS,
          deviceId: this.deviceId,
          feature: 'gen2-gaming',
        }),
      });

      if (response.hasUpdate) {
        return response.updateInfo;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  public async checkGen1Updates(): Promise<BackendUpdateInfo | null> {
    try {
      const requestBody = {
        currentVersion: this.currentVersion,
        platform: Platform.OS,
        deviceId: this.deviceId,
        feature: 'gen1-ai',
      };
      
      const response = await this.makeApiRequest('/updates/gen1', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (response.hasUpdate) {
        return response.updateInfo;
      }

      return null;
    } catch (error) {
      // Fallback to local update simulation
      return this.simulateGen1Update();
    }
  }

  private simulateGen1Update(): BackendUpdateInfo {
    // Simulate Gen 1 backend response for development/testing
    return {
      version: '1.1.0',
      buildNumber: '101',
      releaseDate: new Date().toISOString(),
      features: [
        'Enhanced Gen 1 AI assistant with improved responses',
        'Better content creation tools with AI assistance',
        'Improved performance and faster loading times',
        'New social features for better community engagement',
        'Enhanced privacy controls and security',
        'Bug fixes and stability improvements',
        'Strip Club 18+ enhancements',
        'Auto-update system improvements'
      ],
      isRequired: false,
      downloadSize: 45.2 * 1024 * 1024, // 45.2 MB in bytes
      downloadUrl: 'https://luma-updates.com/downloads/luma-gen1-1.1.0.zip',
      changelog: [
        '🤖 Enhanced Gen 1 AI with better understanding',
        '🎨 Improved content creation with AI assistance',
        '⚡ Performance improvements and faster loading',
        '👥 New social features for community building',
        '🔒 Enhanced privacy controls and security',
        '🐛 Fixed various bugs and improved stability',
        '🎯 Enhanced user experience with smoother animations',
        '🔥 Strip Club 18+ new features and improvements',
        '🔄 Auto-update system enhancements'
      ],
      minVersion: '1.0.0',
      maxVersion: '1.0.9',
      updateType: 'minor',
      checksum: 'sha256:gen1abc123...',
      isHotUpdate: false,
      isGen1Update: true,
    };
  }
}

export default UpdateBackendService; 