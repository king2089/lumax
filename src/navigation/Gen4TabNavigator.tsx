import React, { useState, createContext, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import screens
import { Gen4FeedScreen } from '../screens/Gen4FeedScreen';
import { Gen4CreateScreen } from '../screens/Gen4CreateScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import Gen4ProfileScreen from '../screens/Gen4ProfileScreen';
import Gen4MenuScreen from '../screens/Gen4MenuScreen';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768 || height >= 768;
const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

// Enhanced Quantum Scale Functions for Real Device Compatibility
const quantumScale = (size: number) => {
  const baseSize = isTablet ? 768 : (isIOS ? 375 : 360);
  const scaleFactor = Math.min(width, height) / baseSize;
  const minScale = 0.9; // Better minimum scale for real devices
  const maxScale = 1.8; // Better maximum scale for real devices
  const adjustedScale = Math.max(minScale, Math.min(maxScale, scaleFactor));
  return Math.round(size * adjustedScale); // Round to avoid sub-pixel issues
};

// Loading Context
interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  loadingMessage: '',
  setIsLoading: () => {},
  setLoadingMessage: () => {},
});

export const useLoading = () => useContext(LoadingContext);

// Tab Navigation Context
interface TabNavigationContextType {
  currentTabIndex: number;
  setCurrentTabIndex: (index: number) => void;
  navigateToCreate: () => void;
}

const TabNavigationContext = createContext<TabNavigationContextType>({
  currentTabIndex: 0,
  setCurrentTabIndex: () => {},
  navigateToCreate: () => {},
});

export const useTabNavigation = () => useContext(TabNavigationContext);

const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  return (
    <LoadingContext.Provider value={{ isLoading, loadingMessage, setIsLoading, setLoadingMessage }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Gen4 Routes Configuration
const gen4Routes = [
  {
    name: 'Gen4Feed',
    component: Gen4FeedScreen,
    icon: 'home',
    label: 'Feed',
    color: '#00D4FF',
    description: 'Your personalized feed',
    gradient: ['#00D4FF', '#0099CC'],
  },
  {
    name: 'Gen4Create',
    component: Gen4CreateScreen,
    icon: 'add-circle',
    label: 'Create',
    color: '#FF6B9D',
    description: 'Create amazing content',
    gradient: ['#FF6B9D', '#E91E63'],
  },
  {
    name: 'Gen4Search',
    component: SearchScreen,
    icon: 'search',
    label: 'Search',
    color: '#9C27B0',
    description: 'Find what you love',
    gradient: ['#9C27B0', '#7B1FA2'],
  },
  {
    name: 'Gen4Notifications',
    component: NotificationScreen,
    icon: 'notifications',
    label: 'Notifications',
    color: '#FF5722',
    description: 'Stay updated',
    gradient: ['#FF5722', '#E64A19'],
  },
  {
    name: 'Gen4Profile',
    component: Gen4ProfileScreen,
    icon: 'person',
    label: 'Profile',
    color: '#FF8C00',
    description: 'Your digital identity',
    gradient: ['#FF8C00', '#F57C00'],
  },
  {
    name: 'Gen4Menu',
    component: Gen4MenuScreen,
    icon: 'menu',
    label: 'Menu',
    color: '#FF6B9D',
    description: 'App settings and more',
    gradient: ['#FF6B9D', '#E91E63'],
  },
];

// Gen4 Tab Navigator
export const Gen4TabNavigator: React.FC = () => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  
  const handleTabPress = (index: number) => {
    setCurrentTabIndex(index);
  };

  const navigateToCreate = () => {
    setCurrentTabIndex(1); // Create tab is at index 1
  };
  
  return (
    <LoadingProvider>
      <TabNavigationContext.Provider value={{
        currentTabIndex,
        setCurrentTabIndex,
        navigateToCreate
      }}>
        <SafeAreaView style={styles.mainContainer}>
        {/* Status Bar */}
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="transparent" 
          translucent 
          animated={true}
        />
        
        {/* Main Content */}
        <View style={styles.contentContainer}>
          {React.createElement(gen4Routes[currentTabIndex].component)}
        </View>
        
        {/* Enhanced Tab Bar */}
        <View style={styles.tabBarWrapper}>
          <View style={styles.simpleTabBar}>
            {gen4Routes.map((route, index) => (
              <TouchableOpacity
                key={route.name}
                style={[
                  styles.simpleTabButton,
                  currentTabIndex === index && styles.simpleTabButtonActive
                ]}
                onPress={() => handleTabPress(index)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={route.icon as any}
                  size={quantumScale(22)}
                  color={currentTabIndex === index ? route.color : '#fff'}
                />
                <Text style={[
                  styles.simpleTabLabel,
                  { color: currentTabIndex === index ? route.color : '#fff' }
                ]}>
                  {route.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
      </TabNavigationContext.Provider>
    </LoadingProvider>
  );
};

// Enhanced Styles for Real Device Compatibility
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? quantumScale(110) : quantumScale(110), // Increased padding for Android tab bar
    paddingTop: Platform.OS === 'ios' ? quantumScale(20) : quantumScale(15), // Increased top padding for Android status bar
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(26,26,46,0.95)', // Add background to wrapper
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  simpleTabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26,26,46,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingVertical: Platform.OS === 'ios' ? quantumScale(12) : quantumScale(12), // Increased Android padding
    paddingHorizontal: Platform.OS === 'ios' ? quantumScale(8) : quantumScale(12), // More horizontal padding for Android
    minHeight: Platform.OS === 'ios' ? quantumScale(90) : quantumScale(90), // Increased Android height
    justifyContent: 'space-between', // Evenly distribute tabs
    alignItems: 'center',
  },
  simpleTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? quantumScale(10) : quantumScale(12), // More padding for Android
    paddingHorizontal: Platform.OS === 'ios' ? quantumScale(6) : quantumScale(8), // More horizontal padding for Android
    minWidth: 0, // Allow flex to work properly
    minHeight: Platform.OS === 'ios' ? quantumScale(50) : quantumScale(55), // Larger touch target for Android
  },
  simpleTabButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: quantumScale(8),
    marginHorizontal: Platform.OS === 'ios' ? quantumScale(2) : quantumScale(3), // More margin for Android
  },
  simpleTabLabel: {
    fontSize: Platform.OS === 'ios' ? quantumScale(11) : quantumScale(11), // Larger font for Android
    fontWeight: '600',
    marginTop: Platform.OS === 'ios' ? quantumScale(4) : quantumScale(5), // More margin for Android
    textAlign: 'center',
    color: '#fff',
  },
});

// Default export for backward compatibility
export default Gen4TabNavigator;
