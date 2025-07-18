import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMusic } from '../context/MusicContext';

const { width } = Dimensions.get('window');

const AI_TOOLS = [
  { id: 'lyrics', name: 'AI Lyrics Generator', icon: 'document-text', color: '#FF6B6B', isPro: false },
  { id: 'beats', name: 'Beat Maker AI', icon: 'musical-notes', color: '#4ECDC4', isPro: false },
  { id: 'voice', name: 'Voice Synthesis', icon: 'mic', color: '#9C27B0', isPro: true },
  { id: 'mastering', name: 'AI Mastering', icon: 'settings', color: '#FF8E53', isPro: true },
];

const MUSIC_CHALLENGES = [
  {
    id: '1',
    title: '30-Second Hit Challenge',
    description: 'Create a viral 30-second track',
    prize: 5000,
    participants: 1247,
    deadline: '7 days left',
    difficulty: 'beginner',
  },
  {
    id: '2',
    title: 'AI vs Human Beatmaking',
    description: 'Beat the AI in creating the perfect beat',
    prize: 10000,
    participants: 892,
    deadline: '3 days left',
    difficulty: 'intermediate',
  },
];

const NFT_TRACKS = [
  {
    id: 'nft1',
    title: 'Digital Dreams #001',
    artist: 'CryptoBeats',
    nftPrice: 0.5,
    royalties: 2.5,
    plays: 450000,
    likes: 23000,
  },
  {
    id: 'nft2',
    title: 'Rare Vibes Collection',
    artist: 'Soulful Sarah',
    nftPrice: 1.2,
    royalties: 5.0,
    plays: 678000,
    likes: 34000,
  },
];

const VIRTUAL_CONCERTS = [
  {
    id: '1',
    artist: 'MC Flow',
    title: 'Metaverse Hip-Hop Experience',
    viewers: 12341,
    ticketPrice: 15,
    isVR: true,
  },
  {
    id: '2',
    artist: 'Pop Princess',
    title: 'Holographic Pop Spectacular',
    viewers: 8976,
    ticketPrice: 25,
    isVR: false,
  },
];

export const LumaMusicScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    discoverArtists, 
    trendingTracks, 
    currentTrack, 
    isPlaying, 
    playTrack, 
    pauseTrack,
    followArtist,
    unfollowArtist,
    isFollowing,
    userMusicProfile
  } = useMusic();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [activeTab, setActiveTab] = useState('discover');
  const [pulseAnim] = useState(new Animated.Value(1));

  const genres = ['All', 'Hip-Hop', 'R&B', 'Pop', 'Rock', 'Jazz', 'Electronic'];

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const filteredArtists = discoverArtists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || artist.genres.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const handlePlayTrack = (track: any) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
  };

  const handleCreateMusic = (toolId: string) => {
    const tool = AI_TOOLS.find(t => t.id === toolId);
    if (tool?.isPro && !userMusicProfile?.isArtist) {
      Alert.alert('Luma Music Pro Required', 'This AI tool requires a Pro subscription!');
      return;
    }
    Alert.alert(`${tool?.name}`, `Opening ${tool?.name}...`);
  };

  const handleJoinChallenge = (challenge: any) => {
    Alert.alert(
      `Join ${challenge.title}`,
      `Prize: $${challenge.prize.toLocaleString()}\nParticipants: ${challenge.participants}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join Challenge', onPress: () => Alert.alert('Success', 'Challenge joined!') },
      ]
    );
  };

  const handleBuyNFT = (track: any) => {
    Alert.alert(
      'Buy NFT Track',
      `${track.title} by ${track.artist}\nPrice: ${track.nftPrice} ETH`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Buy Now', onPress: () => Alert.alert('Purchase', 'NFT purchased!') },
      ]
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { id: 'discover', label: 'Discover', icon: 'compass' },
          { id: 'create', label: 'AI Studio', icon: 'create' },
          { id: 'challenges', label: 'Challenges', icon: 'trophy' },
          { id: 'nft', label: 'NFT Market', icon: 'diamond' },
          { id: 'live', label: 'Virtual Concerts', icon: 'tv' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons name={tab.icon as any} size={20} color={activeTab === tab.id ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderHeader = () => (
    <LinearGradient colors={['#FF6B6B', '#4ECDC4', '#45B7D1']} style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🎵 Luma Music 2.0</Text>
          <Text style={styles.headerSubtitle}>AI-Powered Music Creation</Text>
        </View>
        
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {activeTab === 'discover' && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search artists, tracks, genres..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
      )}
    </LinearGradient>
  );

  const renderGenreFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreContainer}>
      {genres.map((genre) => (
        <TouchableOpacity
          key={genre}
          style={[styles.genreChip, selectedGenre === genre && styles.selectedGenreChip]}
          onPress={() => setSelectedGenre(genre)}
        >
          <Text style={[styles.genreText, selectedGenre === genre && styles.selectedGenreText]}>
            {genre}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderAIStudio = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🤖 AI Music Creation Studio</Text>
      <Text style={styles.sectionSubtitle}>Create professional music with AI assistance</Text>
      
      <View style={styles.aiToolsGrid}>
        {AI_TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={styles.aiToolCard}
            onPress={() => handleCreateMusic(tool.id)}
          >
            <LinearGradient colors={[tool.color, `${tool.color}80`]} style={styles.aiToolGradient}>
              <View style={styles.aiToolHeader}>
                <Ionicons name={tool.icon as any} size={24} color="#fff" />
                {tool.isPro && <Text style={styles.proLabel}>PRO</Text>}
              </View>
              <Text style={styles.aiToolName}>{tool.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderChallenges = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏆 Music Challenges</Text>
      <Text style={styles.sectionSubtitle}>Compete with artists worldwide</Text>
      
      {MUSIC_CHALLENGES.map((challenge) => (
        <View key={challenge.id} style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
            </View>
            <View style={[styles.difficultyBadge, styles[`difficulty${challenge.difficulty}`]]}>
              <Text style={styles.difficultyText}>{challenge.difficulty.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.challengeStats}>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={16} color="#FFD700" />
              <Text style={styles.statText}>${challenge.prize.toLocaleString()}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color="#4ECDC4" />
              <Text style={styles.statText}>{challenge.participants}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color="#FF6B6B" />
              <Text style={styles.statText}>{challenge.deadline}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.joinButton} onPress={() => handleJoinChallenge(challenge)}>
            <Text style={styles.joinButtonText}>Join Challenge</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderNFTMarketplace = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💎 NFT Music Marketplace</Text>
      <Text style={styles.sectionSubtitle}>Own exclusive digital music assets</Text>
      
      {NFT_TRACKS.map((track) => (
        <View key={track.id} style={styles.nftCard}>
          <View style={styles.nftHeader}>
            <View style={styles.nftInfo}>
              <Text style={styles.nftTitle}>{track.title}</Text>
              <Text style={styles.nftArtist}>{track.artist}</Text>
            </View>
            <View style={styles.nftPrice}>
              <Text style={styles.priceText}>{track.nftPrice} ETH</Text>
              <Text style={styles.royaltyText}>{track.royalties}% royalties</Text>
            </View>
          </View>
          
          <View style={styles.nftStats}>
            <View style={styles.statItem}>
              <Ionicons name="play" size={14} color="#666" />
              <Text style={styles.statText}>{(track.plays / 1000).toFixed(0)}K plays</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={14} color="#FF6B6B" />
              <Text style={styles.statText}>{(track.likes / 1000).toFixed(0)}K</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyNFT(track)}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buyGradient}>
              <Text style={styles.buyButtonText}>Buy NFT</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderVirtualConcerts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎭 Virtual Concerts</Text>
      <Text style={styles.sectionSubtitle}>Immersive live music experiences</Text>
      
      {VIRTUAL_CONCERTS.map((concert) => (
        <View key={concert.id} style={styles.concertCard}>
          <LinearGradient colors={['#FF6B6B20', '#4ECDC420']} style={styles.concertGradient}>
            <View style={styles.concertHeader}>
              <View style={styles.concertInfo}>
                <Text style={styles.concertTitle}>{concert.title}</Text>
                <Text style={styles.concertArtist}>{concert.artist}</Text>
                <View style={styles.concertTags}>
                  {concert.isVR && <Text style={styles.vrTag}>VR</Text>}
                  <Text style={styles.liveTag}>LIVE</Text>
                </View>
              </View>
              <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.liveCircle} />
              </Animated.View>
            </View>
            
            <View style={styles.concertStats}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={16} color="#4ECDC4" />
                <Text style={styles.statText}>{concert.viewers.toLocaleString()} watching</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="ticket" size={16} color="#FFD700" />
                <Text style={styles.statText}>${concert.ticketPrice}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.joinConcertButton}>
              <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.joinGradient}>
                <Ionicons name="tv" size={20} color="#fff" />
                <Text style={styles.joinConcertText}>Join Concert</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ))}
    </View>
  );

  const renderFeaturedArtists = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⭐ Featured Artists</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filteredArtists.map((artist) => (
          <View key={artist.id} style={styles.artistCard}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.artistGradient}>
              <View style={styles.artistImageContainer}>
                <Text style={styles.artistInitial}>{artist.name.charAt(0)}</Text>
              </View>
              
              <Text style={styles.artistName}>{artist.name}</Text>
              <Text style={styles.artistGenres}>{artist.genres.join(', ')}</Text>
              <Text style={styles.artistFollowers}>{(artist.followers / 1000).toFixed(0)}K followers</Text>
              
              <TouchableOpacity
                style={[styles.followButton, isFollowing(artist.id) && styles.followingButton]}
                onPress={() => isFollowing(artist.id) ? unfollowArtist(artist.id) : followArtist(artist.id)}
              >
                <Text style={[styles.followButtonText, isFollowing(artist.id) && styles.followingText]}>
                  {isFollowing(artist.id) ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderTrendingTracks = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔥 Trending Tracks</Text>
      
      {trendingTracks.map((track, index) => (
        <View key={track.id} style={styles.trackCard}>
          <View style={styles.trackRank}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          
          <LinearGradient colors={['#FF6B6B20', '#4ECDC420']} style={styles.trackCover}>
            <Ionicons name="musical-note" size={24} color="#667eea" />
          </LinearGradient>
          
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle}>{track.title}</Text>
            <Text style={styles.trackArtist}>{track.artist}</Text>
            <Text style={styles.trackStats}>{(track.plays / 1000000).toFixed(1)}M plays</Text>
          </View>
          
          <TouchableOpacity style={styles.playButton} onPress={() => handlePlayTrack(track)}>
            <Ionicons
              name={currentTrack?.id === track.id && isPlaying ? "pause" : "play"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderMusicPlayer = () => {
    if (!currentTrack) return null;

    return (
      <View style={styles.musicPlayer}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.playerGradient}>
          <View style={styles.playerContent}>
            <View style={styles.playerTrackInfo}>
              <Text style={styles.playerTitle}>{currentTrack.title}</Text>
              <Text style={styles.playerArtist}>{currentTrack.artist}</Text>
            </View>
            
            <View style={styles.playerControls}>
              <TouchableOpacity onPress={() => {}}>
                <Ionicons name="play-skip-back" size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={() => isPlaying ? pauseTrack() : playTrack(currentTrack)}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => {}}>
                <Ionicons name="play-skip-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabBar()}
        
        {activeTab === 'discover' && (
          <>
            {renderGenreFilter()}
            {renderFeaturedArtists()}
            {renderTrendingTracks()}
          </>
        )}
        {activeTab === 'create' && renderAIStudio()}
        {activeTab === 'challenges' && renderChallenges()}
        {activeTab === 'nft' && renderNFTMarketplace()}
        {activeTab === 'live' && renderVirtualConcerts()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>🎵 Luma Music 2.0 - AI-Powered Music Creation</Text>
        </View>
      </ScrollView>
      
      {renderMusicPlayer()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  tabBar: {
    padding: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#fff',
  },
  genreContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  genreChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedGenreChip: {
    backgroundColor: '#667eea',
  },
  genreText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedGenreText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  aiToolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  aiToolCard: {
    flex: 1,
    minWidth: width / 2 - 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiToolGradient: {
    padding: 16,
  },
  aiToolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  proLabel: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  aiToolName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
  },
  difficultyBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  difficultybeginner: {
    backgroundColor: '#4CAF50',
  },
  difficultyintermediate: {
    backgroundColor: '#FF9800',
  },
  difficultypro: {
    backgroundColor: '#F44336',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  challengeStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  nftCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nftInfo: {
    flex: 1,
  },
  nftTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  nftArtist: {
    fontSize: 14,
    color: '#666',
  },
  nftPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  royaltyText: {
    fontSize: 12,
    color: '#666',
  },
  nftStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  buyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buyGradient: {
    padding: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  concertCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  concertGradient: {
    padding: 16,
  },
  concertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  concertInfo: {
    flex: 1,
  },
  concertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  concertArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  concertTags: {
    flexDirection: 'row',
    gap: 8,
  },
  vrTag: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  liveTag: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  liveIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
  },
  concertStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  joinConcertButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  joinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  joinConcertText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  artistCard: {
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    width: 180,
  },
  artistGradient: {
    padding: 16,
    alignItems: 'center',
  },
  artistImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  artistInitial: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  artistGenres: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  artistFollowers: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  followButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followingButton: {
    backgroundColor: '#fff',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  followingText: {
    color: '#667eea',
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  trackCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  trackStats: {
    fontSize: 12,
    color: '#999',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  playerGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerTrackInfo: {
    flex: 1,
  },
  playerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playerArtist: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playPauseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
}); 