import Constants from 'expo-constants';

export const UPDATE_ENDPOINTS = {
  check: '/updates/check',
  download: '/updates/download',
  install: '/updates/install',
  report: '/updates/report',
  history: '/updates/history',
  stripClub: '/updates/strip-club',
  gen1: '/updates/gen1',
  gen2: '/updates/gen2',
  health: '/health',
};

export const UPDATE_STATUS = {
  IDLE: 'idle',
  CHECKING: 'checking',
  DOWNLOADING: 'downloading',
  INSTALLING: 'installing',
  COMPLETE: 'complete',
  ERROR: 'error',
};

export const UPDATE_SERVER_CONFIG = {
  baseUrl: Constants.expoConfig?.extra?.updateServer?.apiUrl || process.env.EXPO_PUBLIC_UPDATE_SERVER_URL || 'https://luma-gen2.vercel.app/v1',
  apiKey: process.env.EXPO_PUBLIC_UPDATE_API_KEY || 'your-api-key-here',
  appId: 'luma-gen1',
  appName: 'Luma Gen 1',
  platform: 'mobile',
  channels: {
    development: 'dev',
    staging: 'staging',
    production: 'prod',
  },
  updateTypes: {
    patch: 'patch',
    minor: 'minor',
    major: 'major',
    hotfix: 'hotfix',
  },
  features: {
    stripClub18Plus: 'strip-club-18plus',
    gen1AI: 'gen1-ai',
    liveStreaming: 'live-streaming',
    autoUpdate: 'auto-update',
  },
  intervals: {
    checkFrequency: 60 * 60 * 1000, // 1 hour
    retryDelay: 5 * 60 * 1000, // 5 minutes
    maxRetries: 3,
  },
  paths: {
    updates: '/updates',
    downloads: '/downloads',
    temp: '/temp',
  },
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Luma-Gen1-Mobile/1.0.0',
  },
  errors: {
    networkError: 'Network connection error. Please check your internet connection.',
    serverError: 'Server error. Please try again later.',
    downloadError: 'Download failed. Please try again.',
    installationError: 'Installation failed. Please try again.',
    verificationError: 'Update verification failed. The update may be corrupted.',
  },
  messages: {
    updateAvailable: 'A new update is available!',
    updateDownloaded: 'Update downloaded successfully.',
    updateInstalled: 'Update installed successfully.',
    appRestartRequired: 'App restart required to apply changes.',
  },
};

export const getUpdateConfig = () => {
  const isDevelopment = __DEV__;
  return {
    ...UPDATE_SERVER_CONFIG,
    baseUrl: isDevelopment
      ? 'http://192.168.1.205:3001/v1'
      : UPDATE_SERVER_CONFIG.baseUrl,
    channel: isDevelopment
      ? UPDATE_SERVER_CONFIG.channels.development
      : UPDATE_SERVER_CONFIG.channels.production,
    debug: isDevelopment,
  };
};

export default UPDATE_SERVER_CONFIG; 