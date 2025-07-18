import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { MusicProvider } from './src/context/MusicContext';
import { MoodProvider } from './src/context/MoodContext';
import { MonetizationProvider } from './src/context/MonetizationContext';
import { LumaBankProvider } from './src/context/LumaBankContext';
import { NSFWProvider } from './src/context/NSFWContext';
import { LovedOnesProvider } from './src/context/LovedOnesContext';
import { PostProvider } from './src/context/PostContext';
import { BabyAIProvider } from './src/context/BabyAIContext';
import { PreRegistrationProvider } from './src/context/PreRegistrationContext';
import { AppNavigator as AppContent } from './src/navigation/AppNavigator';
import UpdateNotification from './src/components/UpdateNotification';
import AutoUpdateService, { UpdateProgress } from './src/services/AutoUpdateService';
import { navigate } from './src/services/NavigationService';

const App: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [appRefreshKey, setAppRefreshKey] = useState(0);

  useEffect(() => {
    // Initialize update service
    const updateService = AutoUpdateService.getInstance();
    
    // Set up global app refresh callback
    global.appRefreshCallback = () => {
      setAppRefreshKey(prev => prev + 1);
    };
    
    // Set up global navigation refresh callback
    global.navigationRefresh = () => {
      // Force navigation to refresh
      setAppRefreshKey(prev => prev + 1);
    };
    
    // Listen for update progress changes
    const handleProgressUpdate = (progress: UpdateProgress) => {
      if (progress.status === 'idle' && updateService.shouldShowNotification()) {
        // Show update notification when there's a new version and not dismissed
        const info = updateService.getUpdateInfo();
        setUpdateInfo({
          version: info.version,
          newVersion: info.newVersion,
          features: info.features,
          size: info.size,
          isRequired: info.isRequired
        });
      } else if (progress.status === 'complete') {
        // Show completion notification
        const info = updateService.getUpdateInfo();
        setUpdateInfo({
          version: info.version,
          newVersion: info.newVersion,
          features: info.features,
          size: info.size,
          isRequired: info.isRequired,
          isCompleted: true
        });
        
        // Force app refresh after update completion (stabilized)
        setTimeout(() => {
          setAppRefreshKey(prev => prev + 1);
        }, 2000); // Increased delay to prevent jumping
      } else if (progress.status === 'error') {
        // Hide notification when update fails
        setUpdateInfo(null);
      }
    };

    // Add progress listener
    updateService.addProgressListener(handleProgressUpdate);
    
    // Check for updates on app start and force OTA update
    updateService.checkForUpdatesInBackground();
    
    // Force OTA update notification to appear (delayed to prevent jumping)
    setTimeout(async () => {
      try {
        await updateService.forceOTAUpdate();
      } catch (error) {
        console.log('Error forcing OTA update:', error);
      }
    }, 5000); // Increased delay to prevent app jumping
    
    // Set up periodic update checks
    const updateInterval = setInterval(() => {
      updateService.checkForUpdatesInBackground();
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => {
      clearInterval(updateInterval);
      updateService.removeProgressListener(handleProgressUpdate);
      updateService.cleanup();
      // Clean up global callbacks
      delete global.appRefreshCallback;
      delete global.navigationRefresh;
    };
  }, []); // Remove updateInfo dependency to prevent infinite loops

  const handleUpdatePress = async () => {
    // Navigate to UpdateScreen with update info
    navigate('UpdateScreen', { updateInfo });
    // Mark live streaming update as seen when user starts the update process
    try {
      const updateService = AutoUpdateService.getInstance();
      await updateService.markLiveStreamingUpdateAsSeen();
    } catch (error) {
      console.log('Error marking update as seen:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <AppProvider>
          <MusicProvider>
            <MoodProvider>
              <MonetizationProvider>
                <LumaBankProvider>
                  <NSFWProvider>
                    <LovedOnesProvider>
                      <PostProvider>
                        <BabyAIProvider>
                          <PreRegistrationProvider>
                            <AppContent key={appRefreshKey} />
                            {updateInfo && (
                              <UpdateNotification 
                                onUpdate={handleUpdatePress}
                                onClose={async () => {
                                  setUpdateInfo(null);
                                  // Mark notification as dismissed
                                  const updateService = AutoUpdateService.getInstance();
                                  await updateService.setNotificationDismissed(true);
                                  // Mark live streaming update as seen
                                  await updateService.markLiveStreamingUpdateAsSeen();
                                }}
                              />
                            )}
                          </PreRegistrationProvider>
                        </BabyAIProvider>
                      </PostProvider>
                    </LovedOnesProvider>
                  </NSFWProvider>
                </LumaBankProvider>
              </MonetizationProvider>
            </MoodProvider>
          </MusicProvider>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
