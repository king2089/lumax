import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerProps {
  uri: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ uri }) => {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isPlaying = status?.isLoaded && status.isPlaying;

  const handlePlayPause = () => {
    if (!video.current) return;
    if (isPlaying) {
      video.current.pauseAsync();
    } else {
      video.current.playAsync();
    }
  };

  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    if (playbackStatus.isLoaded) {
      setIsLoading(false);
      setStatus(playbackStatus);
    } else {
      if (playbackStatus.error) {
        console.error(`Video Error: ${playbackStatus.error}`);
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        source={{ uri }}
        useNativeControls={false}
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        onLoadStart={() => setIsLoading(true)}
        onReadyForDisplay={() => setIsLoading(false)}
      />
      {(isLoading) && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      {!isLoading && (
         <TouchableOpacity style={styles.overlay} onPress={handlePlayPause}>
            <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={60}
                color="rgba(255, 255, 255, 0.8)"
                style={styles.playIcon}
            />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  }
}); 