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
            testID={options.tabBarTestID}
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
    left: 16,
    right: 16,
    bottom: Platform.OS === 'android' ? 24 : 32,
    backgroundColor: 'white',
    borderRadius: 32,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    marginTop: -18,
    backgroundColor: '#f0f4ff',
    borderRadius: 32,
    width: 64,
    height: 64,
    shadowColor: '#1877f2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 12,
  },
  label: {
    fontSize: 11,
    color: '#65676b',
    marginTop: 2,
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