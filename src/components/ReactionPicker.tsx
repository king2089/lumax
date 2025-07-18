import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { ReactionType } from '../types';
import { Ionicons } from '@expo/vector-icons';

const reactionIcons: { [key in ReactionType]: string } = {
  like: 'thumbs-up',
  love: 'heart',
  haha: 'happy',
  wow: 'sparkles',
  sad: 'sad',
  angry: 'flame',
};

const reactionColors: { [key in ReactionType]: string } = {
  like: '#4169E1',
  love: '#e74c3c',
  haha: '#f1c40f',
  wow: '#9b59b6',
  sad: '#3498db',
  angry: '#e67e22',
};

interface ReactionPickerProps {
  isVisible: boolean;
  onSelect: (reaction: ReactionType) => void;
  onClose: () => void;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ isVisible, onSelect, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
    }
  }, [isVisible]);

  const handleSelect = (reaction: ReactionType) => {
    onSelect(reaction);
    onClose();
  };

  if (!isVisible && scaleAnim._value === 0) return null;

  return (
    <Animated.View
        style={[
            styles.container,
            { transform: [{ scale: scaleAnim }] },
        ]}
    >
    {Object.keys(reactionIcons).map((reaction) => (
        <TouchableOpacity key={reaction} onPress={() => handleSelect(reaction as ReactionType)}>
        <Ionicons
            name={reactionIcons[reaction as ReactionType] as any}
            size={30}
            color={reactionColors[reaction as ReactionType]}
            style={styles.icon}
        />
        </TouchableOpacity>
    ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  icon: {
    marginHorizontal: 5,
  },
}); 