import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';

const { width } = Dimensions.get('window');

interface Track {
  id: string;
  title: string;
  plays: number;
  likes: number;
  duration: string;
  releaseDate: string;
  isPublic: boolean;
}

interface Collaboration {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  collaborators: string[];
  deadline: string;
}

interface Performance {
  id: string;
  venue: string;
  date: string;
  attendees: number;
  earnings: number;
  type: 'live' | 'virtual' | 'recorded';
}

interface ArtistProfileScreenProps {
  onClose?: () => void;
}

export const ArtistProfileScreen: React.FC<ArtistProfileScreenProps> = ({ onClose }) => {
  const navigation = useNavigation();
  const { user, verifyUser } = useAuth();
  const { userMusicProfile, trendingTracks, followedArtists, upgradeToArtist } = useMusic();
  
  const [activeTab, setActiveTab] = useState('tracks'); // tracks, collabs, performance, analytics
  
  // Sample data for demonstration
  const myTracks: Track[] = [
    {
      id: '1',
      title: 'Midnight Vibes',
      plays: 125000,
      likes: 8500,
      duration: '3:42',
      releaseDate: '2024-01-15',
      isPublic: true,
    },
    {
      id: '2',
      title: 'City Lights (Demo)',
      plays: 2340,
      likes: 120,
      duration: '2:58',
      releaseDate: '2024-01-20',
      isPublic: false,
    },
    {
      id: '3',
      title: 'Summer Breeze',
      plays: 89000,
      likes: 5200,
      duration: '4:15',
      releaseDate: '2024-01-10',
      isPublic: true,
    },
  ];

  const collaborations: Collaboration[] = [
    {
      id: '1',
      title: 'Hip-Hop Fusion Project',
      status: 'in-progress',
      collaborators: ['MC Flow', 'DJ Beats'],
      deadline: '2024-02-15',
    },
    {
      id: '2',
      title: 'Acoustic Sessions',
      status: 'completed',
      collaborators: ['Soulful Sarah'],
      deadline: '2024-01-30',
    },
  ];

  const performances: Performance[] = [
    {
      id: '1',
      venue: 'The Blue Note',
      date: '2024-01-25',
      attendees: 450,
      earnings: 2500,
      type: 'live',
    },
    {
      id: '2',
      venue: 'Virtual Concert Hall',
      date: '2024-01-18',
      attendees: 1200,
      earnings: 800,
      type: 'virtual',
    },
  ];

  const analyticsData = {
    totalPlays: 512000,
    totalLikes: 28500,
    monthlyListeners: 15600,
    followerGrowth: '+12.5%',
    topCountries: ['United States', 'Canada', 'United Kingdom'],
    peakListeningHour: '8 PM',
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleUploadTrack = () => {
    Alert.alert(
      'Upload Track',
      'Choose upload method:',
      [
        { text: 'Record New', onPress: () => Alert.alert('Recording Studio', 'Opening recording studio...') },
        { text: 'Upload File', onPress: () => Alert.alert('File Upload', 'File picker opening...') },
        { text: 'AI Generate', onPress: () => Alert.alert('AI Studio', 'Opening AI music generator...') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleStartCollaboration = () => {
    Alert.alert(
      'Start Collaboration',
      'Find artists to collaborate with:',
      [
        { text: 'Browse Artists', onPress: () => Alert.alert('Artist Discovery', 'Opening artist browser...') },
        { text: 'Create Request', onPress: () => Alert.alert('Collaboration Request', 'Creating new collaboration...') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleBookPerformance = () => {
    Alert.alert(
      'Book Performance',
      'Schedule a new performance:',
      [
        { text: 'Live Venue', onPress: () => Alert.alert('Live Booking', 'Venue booking opening...') },
        { text: 'Virtual Concert', onPress: () => Alert.alert('Virtual Booking', 'Virtual concert setup...') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => {
          if (onClose) {
            onClose();
          } else if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }} 
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Artist Profile</Text>
      <TouchableOpacity style={styles.settingsButton}>
        <Ionicons name="settings-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderArtistInfo = () => (
    <View style={styles.artistInfo}>
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
        style={styles.artistGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.artistHeader}>
          <Image source={{ uri: user?.avatar }} style={styles.artistImage} />
          <View style={styles.artistDetails}>
            <Text style={styles.artistName}>{userMusicProfile?.artistName || user?.displayName}</Text>
            <Text style={styles.artistType}>{userMusicProfile?.artistType?.toUpperCase()}</Text>
            <View style={styles.genresContainer}>
              {userMusicProfile?.genres.slice(0, 2).map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.verifiedContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#00C853" />
            <Text style={styles.verifiedText}>Verified Artist</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(analyticsData.totalPlays)}</Text>
            <Text style={styles.statLabel}>Total Plays</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(analyticsData.monthlyListeners)}</Text>
            <Text style={styles.statLabel}>Monthly Listeners</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followedArtists.length}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{myTracks.length}</Text>
            <Text style={styles.statLabel}>Tracks</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleUploadTrack}>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Upload Track</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleStartCollaboration}>
            <Ionicons name="people-outline" size={20} color="#667eea" />
            <Text style={styles.secondaryButtonText}>Collaborate</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'tracks', label: 'Tracks', icon: 'musical-notes' },
        { id: 'collabs', label: 'Collaborations', icon: 'people' },
        { id: 'performance', label: 'Performances', icon: 'mic' },
        { id: 'analytics', label: 'Analytics', icon: 'bar-chart' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Ionicons 
            name={tab.icon as any} 
            size={20} 
            color={activeTab === tab.id ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTracks = () => (
    <View style={styles.tracksContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Tracks ({myTracks.length})</Text>
        <TouchableOpacity onPress={handleUploadTrack}>
          <Ionicons name="add-circle-outline" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>
      
      {myTracks.map((track) => (
        <View key={track.id} style={styles.trackCard}>
          <View style={styles.trackInfo}>
            <LinearGradient colors={['#FF6B6B20', '#4ECDC420']} style={styles.trackCover}>
              <Ionicons name="musical-note" size={24} color="#667eea" />
            </LinearGradient>
            
            <View style={styles.trackDetails}>
              <View style={styles.trackHeader}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <View style={styles.trackStatus}>
                  <View style={[styles.statusDot, { backgroundColor: track.isPublic ? '#00C853' : '#FF9800' }]} />
                  <Text style={styles.statusText}>{track.isPublic ? 'Public' : 'Private'}</Text>
                </View>
              </View>
              
              <Text style={styles.trackDate}>Released: {track.releaseDate}</Text>
              
              <View style={styles.trackStats}>
                <View style={styles.trackStat}>
                  <Ionicons name="play" size={14} color="#666" />
                  <Text style={styles.trackStatText}>{formatNumber(track.plays)} plays</Text>
                </View>
                <View style={styles.trackStat}>
                  <Ionicons name="heart" size={14} color="#FF6B6B" />
                  <Text style={styles.trackStatText}>{formatNumber(track.likes)} likes</Text>
                </View>
                <Text style={styles.trackDuration}>{track.duration}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.trackActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="play-circle" size={28} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="create-outline" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCollaborations = () => (
    <View style={styles.collaborationsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Collaborations ({collaborations.length})</Text>
        <TouchableOpacity onPress={handleStartCollaboration}>
          <Ionicons name="add-circle-outline" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>
      
      {collaborations.map((collab) => (
        <View key={collab.id} style={styles.collabCard}>
          <View style={styles.collabHeader}>
            <Text style={styles.collabTitle}>{collab.title}</Text>
            <View style={[styles.statusBadge, styles[`status${collab.status}`]]}>
              <Text style={styles.statusBadgeText}>{collab.status.replace('-', ' ').toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.collaborators}>
            <Text style={styles.collaboratorsLabel}>Collaborators:</Text>
            <Text style={styles.collaboratorsList}>{collab.collaborators.join(', ')}</Text>
          </View>
          
          <Text style={styles.collabDeadline}>Deadline: {collab.deadline}</Text>
          
          <View style={styles.collabActions}>
            <TouchableOpacity style={styles.collabButton}>
              <Text style={styles.collabButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.collabButton}>
              <Text style={styles.collabButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPerformances = () => (
    <View style={styles.performancesContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Performances ({performances.length})</Text>
        <TouchableOpacity onPress={handleBookPerformance}>
          <Ionicons name="add-circle-outline" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>
      
      {performances.map((performance) => (
        <View key={performance.id} style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <View style={styles.performanceInfo}>
              <Text style={styles.performanceVenue}>{performance.venue}</Text>
              <Text style={styles.performanceDate}>{performance.date}</Text>
            </View>
            <View style={[styles.performanceType, styles[`type${performance.type}`]]}>
              <Text style={styles.performanceTypeText}>{performance.type.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.performanceStats}>
            <View style={styles.performanceStat}>
              <Ionicons name="people" size={16} color="#4ECDC4" />
              <Text style={styles.performanceStatText}>{performance.attendees} attendees</Text>
            </View>
            <View style={styles.performanceStat}>
              <Ionicons name="cash" size={16} color="#00C853" />
              <Text style={styles.performanceStatText}>${performance.earnings}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <Text style={styles.sectionTitle}>Artist Analytics</Text>
      
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>{formatNumber(analyticsData.totalPlays)}</Text>
          <Text style={styles.analyticsLabel}>Total Plays</Text>
          <Text style={styles.analyticsGrowth}>+24% this month</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>{formatNumber(analyticsData.totalLikes)}</Text>
          <Text style={styles.analyticsLabel}>Total Likes</Text>
          <Text style={styles.analyticsGrowth}>+18% this month</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>{formatNumber(analyticsData.monthlyListeners)}</Text>
          <Text style={styles.analyticsLabel}>Monthly Listeners</Text>
          <Text style={styles.analyticsGrowth}>{analyticsData.followerGrowth}</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>{analyticsData.peakListeningHour}</Text>
          <Text style={styles.analyticsLabel}>Peak Hour</Text>
          <Text style={styles.analyticsGrowth}>Most active</Text>
        </View>
      </View>
      
      <View style={styles.topCountriesCard}>
        <Text style={styles.cardTitle}>Top Countries</Text>
        {analyticsData.topCountries.map((country, index) => (
          <View key={country} style={styles.countryItem}>
            <Text style={styles.countryRank}>{index + 1}</Text>
            <Text style={styles.countryName}>{country}</Text>
            <View style={styles.countryBar}>
              <View style={[styles.countryBarFill, { width: `${100 - (index * 20)}%` }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'tracks':
        return renderTracks();
      case 'collabs':
        return renderCollaborations();
      case 'performance':
        return renderPerformances();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderTracks();
    }
  };

  if (!userMusicProfile?.isArtist) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header with back button for non-artist view */}
        <View style={styles.simpleHeader}>
          <TouchableOpacity 
            onPress={() => {
              if (onClose) {
                onClose();
              } else if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }} 
            style={styles.simpleBackButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.simpleHeaderTitle}>Artist Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.notArtistContainer}>
          <Ionicons name="musical-notes" size={64} color="#667eea" />
          <Text style={styles.notArtistTitle}>Artist Profile Unavailable</Text>
          <Text style={styles.notArtistText}>This feature is only available for verified artists.</Text>
          <TouchableOpacity 
            style={styles.becomeArtistButton}
            onPress={() => {
              Alert.alert(
                '🎵 Become an Artist',
                'Transform your profile into a professional artist account with access to:\n\n• Upload and manage tracks\n• Collaborate with other artists\n• Performance analytics\n• Monetization tools\n• Fan engagement features\n• Live streaming capabilities\n• Professional artist badge',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Upgrade Now', 
                    onPress: () => {
                      // Create artist profile using user's existing data
                      const artistData = {
                        artistName: user?.displayName || 'New Artist',
                        bio: user?.bio || 'Aspiring artist ready to create amazing music!',
                        genres: ['Pop'], // Default genre, user can change later
                        artistType: 'solo' as const,
                        experienceLevel: 'beginner' as const,
                        location: '', // User can fill this in later
                      };
                      
                      upgradeToArtist(artistData);
                      verifyUser(); // Also verify the user when they become an artist
                      
                      Alert.alert(
                        '🎉 Welcome to Luma Music!', 
                        `Congratulations ${user?.displayName}! Your artist profile has been activated. You now have access to all professional artist features.\n\nYour artist dashboard is ready with:\n• Track upload capabilities\n• Collaboration tools\n• Performance analytics\n• Monetization dashboard\n\nStart creating amazing music!`,
                        [
                          { 
                            text: 'Explore My Profile', 
                            onPress: () => {
                              // The screen will automatically refresh and show the artist profile
                              // since userMusicProfile.isArtist is now true
                            }
                          }
                        ]
                      );
                    }
                  },
                ]
              );
            }}
          >
            <Text style={styles.becomeArtistText}>Become an Artist</Text>
          </TouchableOpacity>
        </View>

        {/* Close Button for non-artist modal view */}
        {onClose && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close-circle" size={40} color="rgba(0,0,0,0.6)" />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerGradient}>
        {renderHeader()}
      </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderArtistInfo()}
        {renderTabs()}
        {renderContent()}
      </ScrollView>

      {/* Close Button - Alternative to back button */}
      {onClose && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close-circle" size={40} color="rgba(0,0,0,0.6)" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  artistInfo: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  artistGradient: {
    padding: 20,
  },
  artistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  artistDetails: {
    flex: 1,
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  artistType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  genreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  verifiedContainer: {
    alignItems: 'center',
  },
  verifiedText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#fff',
  },
  tracksContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  trackCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  trackCover: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackDetails: {
    flex: 1,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  trackStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#666',
  },
  trackDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  trackStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trackStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  trackDuration: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  collaborationsContainer: {
    padding: 20,
  },
  collabCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  collabTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statuspending: {
    backgroundColor: '#FF9800',
  },
  'statusin-progress': {
    backgroundColor: '#2196F3',
  },
  statuscompleted: {
    backgroundColor: '#4CAF50',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  collaborators: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  collaboratorsLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  collaboratorsList: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  collabDeadline: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  collabActions: {
    flexDirection: 'row',
    gap: 8,
  },
  collabButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  collabButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  performancesContainer: {
    padding: 20,
  },
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceVenue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  performanceDate: {
    fontSize: 12,
    color: '#666',
  },
  performanceType: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typelive: {
    backgroundColor: '#FF6B6B',
  },
  typevirtual: {
    backgroundColor: '#4ECDC4',
  },
  typerecorded: {
    backgroundColor: '#9C27B0',
  },
  performanceTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  performanceStats: {
    flexDirection: 'row',
    gap: 16,
  },
  performanceStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  analyticsContainer: {
    padding: 20,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  analyticsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  analyticsGrowth: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '500',
  },
  topCountriesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  countryRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
    width: 20,
  },
  countryName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  countryBar: {
    width: 60,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  countryBarFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  notArtistContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notArtistTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  notArtistText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  becomeArtistButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  becomeArtistText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  simpleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  simpleBackButton: {
    padding: 8,
  },
  simpleHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSpacer: {
    width: 40, // Same width as back button to center the title
  },
}); 