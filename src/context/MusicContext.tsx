import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MusicArtistProfile {
  isArtist: boolean;
  artistName: string;
  genres: string[];
  artistType: 'solo' | 'band' | 'producer' | 'songwriter' | 'other';
  instruments: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'professional' | 'industry';
  lookingFor: string[];
  socialLinks: {
    spotify: string;
    appleMusic: string;
    soundcloud: string;
    youtube: string;
    instagram: string;
    tiktok: string;
  };
  bio: string;
  location: string;
  availableForCollabs: boolean;
  openToBookings: boolean;
  hasOriginalMusic: boolean;
  recordLabel: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  plays: number;
  likes: number;
  isPlaying?: boolean;
  cover?: string;
  artistId?: string;
  releaseDate?: string;
  album?: string;
}

export interface Artist {
  id: string;
  name: string;
  type: 'rapper' | 'singer' | 'pop' | 'rock' | 'rnb' | 'producer' | 'band';
  genres: string[];
  followers: number;
  isVerified: boolean;
  image?: string;
  isLive?: boolean;
  latestTrack?: string;
  location?: string;
  collaborations?: number;
  profile?: MusicArtistProfile;
}

export interface Collaboration {
  id: string;
  title: string;
  artists: string[];
  genre: string;
  status: 'pending' | 'active' | 'completed';
  description: string;
  requirements: string[];
  createdAt: string;
  deadline?: string;
}

interface MusicContextType {
  // User's music profile
  userMusicProfile: MusicArtistProfile | null;
  setUserMusicProfile: (profile: MusicArtistProfile | null) => void;
  upgradeToArtist: (artistData?: Partial<MusicArtistProfile>) => void;
  
  // Current playing track
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  
  // Playlist management
  playlist: Track[];
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  clearPlaylist: () => void;
  
  // Artist following
  followedArtists: string[];
  followArtist: (artistId: string) => void;
  unfollowArtist: (artistId: string) => void;
  isFollowing: (artistId: string) => boolean;
  
  // Collaborations
  collaborations: Collaboration[];
  createCollaboration: (collab: Omit<Collaboration, 'id' | 'createdAt'>) => void;
  joinCollaboration: (collabId: string) => void;
  leaveCollaboration: (collabId: string) => void;
  
  // Discovery
  discoverArtists: Artist[];
  trendingTracks: Track[];
  refreshDiscovery: () => void;
  
  // Utilities
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  skipTrack: () => void;
  previousTrack: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  // User profile state
  const [userMusicProfile, setUserMusicProfile] = useState<MusicArtistProfile | null>(null);
  
  // Player state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  
  // Social state
  const [followedArtists, setFollowedArtists] = useState<string[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  
  // Discovery state
  const [discoverArtists, setDiscoverArtists] = useState<Artist[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);

  // Initialize with sample data
  useEffect(() => {
    // Sample trending tracks
    setTrendingTracks([
      {
        id: '1',
        title: 'Street Dreams',
        artist: 'MC Flow',
        genre: 'Hip-Hop',
        duration: '3:24',
        plays: 1200000,
        likes: 45000,
        artistId: '1',
        releaseDate: '2024-01-15',
      },
      {
        id: '2',
        title: 'Midnight Vibes',
        artist: 'Soulful Sarah',
        genre: 'R&B',
        duration: '4:12',
        plays: 890000,
        likes: 32000,
        artistId: '2',
        releaseDate: '2024-01-10',
      },
      {
        id: '3',
        title: 'Electric Dreams',
        artist: 'Pop Princess',
        genre: 'Pop',
        duration: '3:45',
        plays: 2100000,
        likes: 78000,
        artistId: '3',
        releaseDate: '2024-01-20',
      },
    ]);

    // Sample artists
    setDiscoverArtists([
      {
        id: '1',
        name: 'MC Flow',
        type: 'rapper',
        genres: ['Hip-Hop', 'Rap'],
        followers: 125000,
        isVerified: true,
        isLive: true,
        latestTrack: 'Street Dreams',
        location: 'Atlanta, GA',
        collaborations: 23,
      },
      {
        id: '2',
        name: 'Soulful Sarah',
        type: 'singer',
        genres: ['R&B', 'Soul'],
        followers: 89000,
        isVerified: true,
        latestTrack: 'Midnight Vibes',
        location: 'Los Angeles, CA',
        collaborations: 18,
      },
      {
        id: '3',
        name: 'Pop Princess',
        type: 'pop',
        genres: ['Pop', 'Dance'],
        followers: 234000,
        isVerified: true,
        isLive: true,
        latestTrack: 'Electric Dreams',
        location: 'New York, NY',
        collaborations: 31,
      },
    ]);
  }, []);

  // Playlist management
  const addToPlaylist = (track: Track) => {
    setPlaylist(prev => {
      if (prev.find(t => t.id === track.id)) return prev;
      return [...prev, track];
    });
  };

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist(prev => prev.filter(t => t.id !== trackId));
  };

  const clearPlaylist = () => {
    setPlaylist([]);
  };

  // Artist following
  const followArtist = (artistId: string) => {
    setFollowedArtists(prev => {
      if (prev.includes(artistId)) return prev;
      return [...prev, artistId];
    });
  };

  const unfollowArtist = (artistId: string) => {
    setFollowedArtists(prev => prev.filter(id => id !== artistId));
  };

  const isFollowing = (artistId: string) => {
    return followedArtists.includes(artistId);
  };

  // Collaboration management
  const createCollaboration = (collab: Omit<Collaboration, 'id' | 'createdAt'>) => {
    const newCollab: Collaboration = {
      ...collab,
      id: `collab_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCollaborations(prev => [...prev, newCollab]);
  };

  const joinCollaboration = (collabId: string) => {
    if (!userMusicProfile?.artistName) return;
    
    setCollaborations(prev => prev.map(collab => {
      if (collab.id === collabId && !collab.artists.includes(userMusicProfile.artistName)) {
        return {
          ...collab,
          artists: [...collab.artists, userMusicProfile.artistName],
          status: 'active' as const,
        };
      }
      return collab;
    }));
  };

  const leaveCollaboration = (collabId: string) => {
    if (!userMusicProfile?.artistName) return;
    
    setCollaborations(prev => prev.map(collab => {
      if (collab.id === collabId) {
        const updatedArtists = collab.artists.filter(artist => artist !== userMusicProfile.artistName);
        return {
          ...collab,
          artists: updatedArtists,
          status: updatedArtists.length === 0 ? 'pending' as const : collab.status,
        };
      }
      return collab;
    }));
  };

  // Player controls
  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    addToPlaylist(track);
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const skipTrack = () => {
    if (playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
  };

  const previousTrack = () => {
    if (playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    setCurrentTrack(playlist[prevIndex]);
  };

  const refreshDiscovery = () => {
    // In a real app, this would fetch fresh data from the API
    console.log('Refreshing music discovery...');
  };

  const upgradeToArtist = (artistData?: Partial<MusicArtistProfile>) => {
    const defaultArtistProfile: MusicArtistProfile = {
      isArtist: true,
      artistName: artistData?.artistName || 'New Artist',
      genres: artistData?.genres || ['Pop'],
      artistType: artistData?.artistType || 'solo',
      instruments: artistData?.instruments || [],
      experienceLevel: artistData?.experienceLevel || 'beginner',
      lookingFor: artistData?.lookingFor || ['Collaboration', 'Feedback'],
      socialLinks: {
        spotify: '',
        appleMusic: '',
        soundcloud: '',
        youtube: '',
        instagram: '',
        tiktok: '',
        ...artistData?.socialLinks,
      },
      bio: artistData?.bio || 'Aspiring artist ready to create amazing music!',
      location: artistData?.location || '',
      availableForCollabs: artistData?.availableForCollabs ?? true,
      openToBookings: artistData?.openToBookings ?? true,
      hasOriginalMusic: artistData?.hasOriginalMusic ?? false,
      recordLabel: artistData?.recordLabel || '',
    };

    setUserMusicProfile(defaultArtistProfile);
    
    // In a real app, you would also update the user's profile in your backend
    console.log('User upgraded to artist:', defaultArtistProfile);
  };

  const value: MusicContextType = {
    // User profile
    userMusicProfile,
    setUserMusicProfile,
    upgradeToArtist,
    
    // Player state
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    
    // Playlist
    playlist,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    
    // Following
    followedArtists,
    followArtist,
    unfollowArtist,
    isFollowing,
    
    // Collaborations
    collaborations,
    createCollaboration,
    joinCollaboration,
    leaveCollaboration,
    
    // Discovery
    discoverArtists,
    trendingTracks,
    refreshDiscovery,
    
    // Player controls
    playTrack,
    pauseTrack,
    skipTrack,
    previousTrack,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};