import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import LiveStreamingService, { 
  LiveStream, 
  LiveStreamConfig, 
  LiveStreamEvent 
} from '../services/LiveStreamingService';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';

export interface UseLiveStreamingReturn {
  // State
  currentStream: LiveStream | null;
  liveStreams: LiveStream[];
  isLoading: boolean;
  isCreating: boolean;
  isStarting: boolean;
  isEnding: boolean;
  
  // Actions
  createLiveStream: (config: LiveStreamConfig) => Promise<LiveStream | null>;
  startLiveStream: (streamId: string) => Promise<boolean>;
  endLiveStream: (streamId: string) => Promise<boolean>;
  changeStreamQuality: (streamId: string, quality: '1080p' | '4K' | '8K' | '20K') => Promise<LiveStream | null>;
  joinLiveStream: (streamId: string) => Promise<void>;
  leaveLiveStream: (streamId: string) => Promise<void>;
  sendChatMessage: (streamId: string, message: string) => Promise<void>;
  sendReaction: (streamId: string, reaction: string) => Promise<void>;
  
  // Data fetching
  fetchLiveStreams: (category?: string) => Promise<void>;
  fetchUserLiveStreams: (userId: string) => Promise<LiveStream[]>;
  refreshCurrentStream: () => Promise<void>;
  
  // Events
  streamEvents: LiveStreamEvent[];
  clearEvents: () => void;
  
  // Utilities
  isUserLive: boolean;
  canGoLive: boolean;
  getStreamAnalytics: (streamId: string) => any;
}

export const useLiveStreaming = (): UseLiveStreamingReturn => {
  const { user } = useAuth();
  const { detectMoodFromActivity } = useMood();
  
  // State
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [streamEvents, setStreamEvents] = useState<LiveStreamEvent[]>([]);

  // Service instance
  const streamingService = LiveStreamingService.getInstance();

  // Initialize
  useEffect(() => {
    const handleStreamEvent = (event: LiveStreamEvent) => {
      setStreamEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
      
      // Handle specific events
      switch (event.type) {
        case 'started':
          if (event.streamId === currentStream?.id) {
            refreshCurrentStream();
          }
          break;
        case 'ended':
          if (event.streamId === currentStream?.id) {
            setCurrentStream(null);
          }
          break;
        case 'viewer_joined':
        case 'viewer_left':
          refreshCurrentStream();
          break;
      }
    };

    // Subscribe to events
    streamingService.addEventListener(handleStreamEvent);

    // Initial data fetch
    fetchLiveStreams();

    return () => {
      streamingService.removeEventListener(handleStreamEvent);
    };
  }, []);

  // Check if user is currently live
  const isUserLive = currentStream?.isLive || false;

  // Check if user can go live
  const canGoLive = !isUserLive && !!user;

  // Create a new live stream
  const createLiveStream = useCallback(async (config: LiveStreamConfig): Promise<LiveStream | null> => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to create a live stream.');
      return null;
    }

    if (isUserLive) {
      Alert.alert('Already Live', 'You are already broadcasting. Please end your current stream first.');
      return null;
    }

    setIsCreating(true);
    try {
      detectMoodFromActivity('create live stream');
      
      const stream = await streamingService.createLiveStream(config);
      
      Alert.alert(
        'Stream Created!',
        `Your "${config.title}" stream has been created successfully.\n\nQuality: ${config.quality}\nBitrate: ${config.bitrate.toLocaleString()} kbps\nAI Features: ${config.enableAI ? 'Enabled' : 'Disabled'}`,
        [
          {
            text: 'Start Now',
            onPress: () => startLiveStream(stream.id)
          },
          {
            text: 'Later',
            style: 'cancel'
          }
        ]
      );

      return stream;
    } catch (error) {
      console.error('Error creating live stream:', error);
      Alert.alert('Error', 'Failed to create live stream. Please try again.');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user, isUserLive, detectMoodFromActivity]);

  // Start a live stream
  const startLiveStream = useCallback(async (streamId: string): Promise<boolean> => {
    if (isUserLive) {
      Alert.alert('Already Live', 'You are already broadcasting.');
      return false;
    }

    setIsStarting(true);
    try {
      detectMoodFromActivity('start live stream');
      
      const stream = await streamingService.startLiveStream(streamId);
      setCurrentStream(stream);
      
      Alert.alert(
        '🔴 Live Now!',
        `Your "${stream.title}" stream is now live!\n\nViewers: ${stream.viewers}\nQuality: ${stream.quality}\nAI Features: ${stream.aiFeatures.enabled ? 'Active' : 'Disabled'}`,
        [
          {
            text: 'End Stream',
            style: 'destructive',
            onPress: () => endLiveStream(streamId)
          },
          {
            text: 'Keep Streaming',
            style: 'cancel'
          }
        ]
      );

      return true;
    } catch (error) {
      console.error('Error starting live stream:', error);
      Alert.alert('Error', 'Failed to start live stream. Please try again.');
      return false;
    } finally {
      setIsStarting(false);
    }
  }, [isUserLive, detectMoodFromActivity]);

  // End a live stream
  const endLiveStream = useCallback(async (streamId: string): Promise<boolean> => {
    setIsEnding(true);
    try {
      detectMoodFromActivity('end live stream');
      
      const stream = await streamingService.endLiveStream(streamId);
      setCurrentStream(null);
      
      Alert.alert(
        'Stream Ended',
        `Your stream has ended successfully!\n\nDuration: ${formatDuration(stream.duration)}\nPeak Viewers: ${stream.peakViewers.toLocaleString()}\nTotal Views: ${stream.analytics.totalViews.toLocaleString()}`
      );

      return true;
    } catch (error) {
      console.error('Error ending live stream:', error);
      Alert.alert('Error', 'Failed to end live stream. Please try again.');
      return false;
    } finally {
      setIsEnding(false);
    }
  }, [detectMoodFromActivity]);

  // Join a live stream
  const joinLiveStream = useCallback(async (streamId: string): Promise<void> => {
    try {
      await streamingService.joinLiveStream(streamId);
      detectMoodFromActivity('join live stream');
    } catch (error) {
      console.error('Error joining live stream:', error);
      Alert.alert('Error', 'Failed to join live stream. Please try again.');
    }
  }, [detectMoodFromActivity]);

  // Leave a live stream
  const leaveLiveStream = useCallback(async (streamId: string): Promise<void> => {
    try {
      await streamingService.leaveLiveStream(streamId);
      detectMoodFromActivity('leave live stream');
    } catch (error) {
      console.error('Error leaving live stream:', error);
    }
  }, [detectMoodFromActivity]);

  // Send chat message
  const sendChatMessage = useCallback(async (streamId: string, message: string): Promise<void> => {
    if (!message.trim()) return;
    
    try {
      await streamingService.sendChatMessage(streamId, message.trim());
      detectMoodFromActivity('send chat message');
    } catch (error) {
      console.error('Error sending chat message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  }, [detectMoodFromActivity]);

  // Send reaction
  const sendReaction = useCallback(async (streamId: string, reaction: string): Promise<void> => {
    try {
      await streamingService.sendReaction(streamId, reaction);
      detectMoodFromActivity('send reaction');
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  }, [detectMoodFromActivity]);

  // Fetch live streams
  const fetchLiveStreams = useCallback(async (category?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const streams = await streamingService.getLiveStreams(category);
      setLiveStreams(streams);
    } catch (error) {
      console.error('Error fetching live streams:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user's live streams
  const fetchUserLiveStreams = useCallback(async (userId: string): Promise<LiveStream[]> => {
    try {
      return await streamingService.getUserLiveStreams(userId);
    } catch (error) {
      console.error('Error fetching user live streams:', error);
      return [];
    }
  }, []);

  // Refresh current stream data
  const refreshCurrentStream = useCallback(async (): Promise<void> => {
    if (currentStream) {
      const updatedStream = await streamingService.getLiveStream(currentStream.id);
      if (updatedStream) {
        setCurrentStream(updatedStream);
      }
    }
  }, [currentStream]);

  // Clear events
  const clearEvents = useCallback(() => {
    setStreamEvents([]);
  }, []);

  // Get stream analytics
  const getStreamAnalytics = useCallback((streamId: string) => {
    const stream = liveStreams.find(s => s.id === streamId) || currentStream;
    return stream?.analytics || null;
  }, [liveStreams, currentStream]);

  // Utility function to format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // State
    currentStream,
    liveStreams,
    isLoading,
    isCreating,
    isStarting,
    isEnding,
    
    // Actions
    createLiveStream,
    startLiveStream,
    endLiveStream,
    changeStreamQuality: async (streamId: string, quality: '1080p' | '4K' | '8K' | '20K') => {
      if (!user) {
        Alert.alert('Authentication Required', 'Please log in to change stream quality.');
        return null;
      }
      if (!isUserLive) {
        Alert.alert('No Active Stream', 'Please start a live stream first to change quality.');
        return null;
      }
      setIsStarting(true);
      try {
        detectMoodFromActivity('change stream quality');
        const stream = await streamingService.changeStreamQuality(streamId, quality);
        setCurrentStream(stream);
        return stream;
      } catch (error) {
        console.error('Error changing stream quality:', error);
        Alert.alert('Error', 'Failed to change stream quality. Please try again.');
        return null;
      } finally {
        setIsStarting(false);
      }
    },
    joinLiveStream,
    leaveLiveStream,
    sendChatMessage,
    sendReaction,
    
    // Data fetching
    fetchLiveStreams,
    fetchUserLiveStreams,
    refreshCurrentStream,
    
    // Events
    streamEvents,
    clearEvents,
    
    // Utilities
    isUserLive,
    canGoLive,
    getStreamAnalytics,
  };
}; 