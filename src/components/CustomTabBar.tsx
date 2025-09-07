import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS = {
  HomeTab: (focused: boolean, color: string, size: number) => (
    <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
  ),
  ReelsTab: (focused: boolean, color: string, size: number) => (
    <MaterialIcons name={'video-library'} size={size} color={color} />
  ),
  MarketplaceTab: (focused: boolean, color: string, size: number) => (
    <Ionicons name={focused ? 'wine' : 'wine-outline'} size={size} color={color} />
  ),
  NotificationsTab: (focused: boolean, color: string, size: number) => (
    <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />
  ),
  MenuTab: (focused: boolean, color: string, size: number) => (
    <Ionicons name={focused ? 'menu' : 'menu-outline'} size={size} color={color} />
  ),
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };
        // Center tab styling
        const isCenter = index === Math.floor(state.routes.length / 2);
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}

            onPress={onPress}
            onLongPress={onLongPress}
            style={isCenter ? styles.centerTab : styles.tab}
            activeOpacity={0.85}
          >
            {TAB_ICONS[route.name as keyof typeof TAB_ICONS]?.(isFocused, isFocused ? '#1877f2' : '#65676b', isCenter ? 34 : 26)}
            <Text style={[styles.label, isFocused && styles.labelFocused, isCenter && styles.centerLabel]}>{label as string}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    left: Platform.OS === 'android' ? 12 : 16, // More margin for Android
    right: Platform.OS === 'android' ? 12 : 16, // More margin for Android
    bottom: Platform.OS === 'android' ? 20 : 32, // Lower for Android navigation bar
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'android' ? 35 : 32, // Larger radius for Android
    height: Platform.OS === 'android' ? 70 : 64, // Taller for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: Platform.OS === 'android' ? 12 : 8, // Higher elevation for Android
    zIndex: 100,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'android' ? 10 : 8, // More padding for Android
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    marginTop: Platform.OS === 'android' ? -20 : -18, // More margin for Android
    backgroundColor: '#f0f4ff',
    borderRadius: Platform.OS === 'android' ? 35 : 32, // Larger radius for Android
    width: Platform.OS === 'android' ? 70 : 64, // Larger for Android
    height: Platform.OS === 'android' ? 70 : 64, // Larger for Android
    shadowColor: '#1877f2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 15 : 12, // Higher elevation for Android
  },
  label: {
    fontSize: Platform.OS === 'android' ? 12 : 11, // Larger font for Android
    color: '#65676b',
    marginTop: Platform.OS === 'android' ? 3 : 2, // More margin for Android
  },
  labelFocused: {
    color: '#1877f2',
    fontWeight: 'bold',
  },
  centerLabel: {
    fontWeight: 'bold',
    color: '#1877f2',
  },
});

export default CustomTabBar; 