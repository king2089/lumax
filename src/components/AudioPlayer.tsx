import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

interface AudioPlayerProps {
  uri: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ uri }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isPlaying = status?.isLoaded && status.isPlaying;
  const durationMillis = status?.isLoaded ? status.durationMillis : 0;
  const positionMillis = status?.isLoaded ? status.positionMillis : 0;

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await sound?.pauseAsync();
    } else {
      if (sound) {
        await sound.playAsync();
      } else {
        setIsLoading(true);
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          setSound(newSound);
        } catch (error) {
          console.error('Error loading audio:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    if (playbackStatus.isLoaded && !playbackStatus.isPlaying) {
      // Handle end of playback
    }
  };
  
  const onSlidingComplete = async (value: number) => {
    await sound?.setPositionAsync(value);
  };
  
  const formatTime = (millis: number | undefined) => {
    if (millis === undefined) return '0:00';
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePlayPause} disabled={isLoading} style={styles.playButton}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#fff" />
        )}
      </TouchableOpacity>
      <View style={styles.controls}>
        <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={durationMillis}
          value={positionMillis}
          onSlidingComplete={onSlidingComplete}
          minimumTrackTintColor="#00C853"
          maximumTrackTintColor="rgba(255,255,255,0.4)"
          thumbTintColor="#fff"
        />
        <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 12,
  },
  playButton: {
    marginRight: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  controls: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
  },
  slider: {
    flex: 1,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
  },
}); 