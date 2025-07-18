import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ReelsScreen } from '../screens/ReelsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { FuturesScreen } from '../screens/FuturesScreen';
import { TodoScreen } from '../screens/TodoScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { FYPScreen } from '../screens/FYPScreen';
import { Gen2ComingSoonScreen } from '../screens/Gen2ComingSoonScreen';
import LumaAIScreen from '../screens/LumaAIScreen';
import UpdateScreen from '../screens/UpdateScreen';
import SystemRequirements from '../components/SystemRequirements';
import CustomerServiceScreen from '../screens/CustomerServiceScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTabBar from '../components/CustomTabBar';
import { navigationRef } from '../services/NavigationService';

import type { TabParamList, RootStackParamList } from '../types/navigation';
import StripClubScreen from '../screens/StripClubScreen';

// Placeholder screens until they're implemented
const PlaceholderScreen = ({ route }: any) => null;

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const HomeStack = () => (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Friends" component={FriendsScreen} />
    <Stack.Screen name="Search" component={PlaceholderScreen} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    <Stack.Screen name="Gen2ComingSoon" component={Gen2ComingSoonScreen} />
    <Stack.Screen name="LumaAI" component={LumaAIScreen} />
    <Stack.Screen name="UpdateScreen" component={UpdateScreen} />
    <Stack.Screen name="SystemRequirements" component={SystemRequirements} />
    <Stack.Screen name="CustomerService" component={CustomerServiceScreen} />
  </Stack.Navigator>
);

const VideoStack = () => (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="VideoMain" component={ReelsScreen} />
    <Stack.Screen name="Watch" component={PlaceholderScreen} />
  </Stack.Navigator>
);

const StripClubStack = () => (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StripClubMain" component={StripClubScreen} />
  </Stack.Navigator>
);

const NotificationsStack = () => (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NotificationsMain" component={NotificationsScreen} />
  </Stack.Navigator>
);

const MenuStack = () => (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MenuMain" component={MenuScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Friends" component={FriendsScreen} />
    <Stack.Screen name="Saved" component={SavedScreen} />
    <Stack.Screen name="Todo" component={TodoScreen} />
    <Stack.Screen name="FYP" component={FYPScreen} />
    <Stack.Screen name="Watch" component={PlaceholderScreen} />
    <Stack.Screen name="Events" component={PlaceholderScreen} />
    <Stack.Screen name="Pages" component={PlaceholderScreen} />
    <Stack.Screen name="Groups" component={PlaceholderScreen} />
    <Stack.Screen name="GameEngine" component={PlaceholderScreen} />
    <Stack.Screen name="Settings" component={PlaceholderScreen} />
    <Stack.Screen name="Help" component={PlaceholderScreen} />
    <Stack.Screen name="Display" component={PlaceholderScreen} />
    <Stack.Screen name="Search" component={PlaceholderScreen} />
    <Stack.Screen name="Gen2ComingSoon" component={Gen2ComingSoonScreen} />
    <Stack.Screen name="LumaAI" component={LumaAIScreen} />
    <Stack.Screen name="UpdateScreen" component={UpdateScreen} />
    <Stack.Screen name="SystemRequirements" component={SystemRequirements} />
    <Stack.Screen name="CustomerService" component={CustomerServiceScreen} />
  </Stack.Navigator>
);

export const AppNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator id={undefined}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconComponent;

            if (route.name === 'HomeTab') {
              iconComponent = <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
            } else if (route.name === 'VideoTab') {
              iconComponent = <MaterialIcons name={focused ? 'video-library' : 'video-library'} size={size} color={color} />;
            } else if (route.name === 'MarketplaceTab') {
              iconComponent = <Ionicons name={focused ? 'wine' : 'wine-outline'} size={size} color={color} />;
            } else if (route.name === 'NotificationsTab') {
              iconComponent = <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />;
            } else if (route.name === 'MenuTab') {
              iconComponent = <Ionicons name={focused ? 'menu' : 'menu-outline'} size={size} color={color} />;
            }

            return iconComponent;
          },
          tabBarActiveTintColor: '#1877f2', // Facebook blue
          tabBarInactiveTintColor: '#65676b',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e4e6eb',
            height: 49 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 3,
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 32,
            borderRadius: 32,
            zIndex: 101,
          },
          headerShown: false,
        })}
        tabBar={props => <CustomTabBar {...props} />}
      >
        <Tab.Screen 
          name="HomeTab" 
          component={HomeStack}
          options={{
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen 
          name="VideoTab" 
          component={VideoStack}
          options={{
            tabBarLabel: 'Reels',
          }}
        />
        <Tab.Screen 
          name="MarketplaceTab" 
          component={StripClubStack}
          options={{
            tabBarLabel: 'Strip Club',
          }}
        />
        <Tab.Screen 
          name="NotificationsTab" 
          component={NotificationsStack}
          options={{
            tabBarLabel: 'Notifications',
            tabBarBadge: 6,
          }}
        />
        <Tab.Screen 
          name="MenuTab" 
          component={MenuStack}
          options={{
            tabBarLabel: 'Menu',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}; 