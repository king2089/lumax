import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface LumaMusicOnboardingProps {
  visible: boolean;
  onComplete: (musicProfile: MusicArtistProfile) => void;
  onSkip: () => void;
}

interface MusicArtistProfile {
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

const MUSIC_GENRES = [
  { id: 'rap', name: 'Rap/Hip-Hop', icon: '🎤', color: '#FF6B6B' },
  { id: 'rnb', name: 'R&B/Soul', icon: '🎵', color: '#4ECDC4' },
  { id: 'pop', name: 'Pop', icon: '⭐', color: '#45B7D1' },
  { id: 'rock', name: 'Rock', icon: '🎸', color: '#96CEB4' },
  { id: 'jazz', name: 'Jazz', icon: '🎺', color: '#FECA57' },
  { id: 'blues', name: 'Blues', icon: '🎸', color: '#6C5CE7' },
  { id: 'country', name: 'Country', icon: '🤠', color: '#FD79A8' },
  { id: 'electronic', name: 'Electronic/EDM', icon: '🔊', color: '#00B894' },
  { id: 'reggae', name: 'Reggae', icon: '🏝️', color: '#00A085' },
  { id: 'latin', name: 'Latin', icon: '💃', color: '#E17055' },
  { id: 'folk', name: 'Folk/Acoustic', icon: '🪕', color: '#A29BFE' },
  { id: 'metal', name: 'Metal', icon: '🤘', color: '#2D3436' },
];

const ARTIST_TYPES = [
  { id: 'solo', name: 'Solo Artist', icon: 'person', description: 'Individual performer' },
  { id: 'band', name: 'Band/Group', icon: 'people', description: 'Multiple members' },
  { id: 'producer', name: 'Producer', icon: 'musical-notes', description: 'Music production' },
  { id: 'songwriter', name: 'Songwriter', icon: 'create', description: 'Lyrics & composition' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', description: 'DJ, Manager, etc.' },
];

const INSTRUMENTS = [
  'Vocals', 'Guitar', 'Bass', 'Drums', 'Piano/Keyboard', 'Violin', 'Saxophone', 'Trumpet',
  'Flute', 'Cello', 'Harmonica', 'Turntables', 'Synthesizer', 'Ukulele', 'Banjo', 'Other'
];

const LOOKING_FOR = [
  'Collaborations', 'Band Members', 'Gigs/Bookings', 'Networking', 'Feedback',
  'Record Label', 'Producer', 'Manager', 'Fans', 'Learning Opportunities'
];

export const LumaMusicOnboarding: React.FC<LumaMusicOnboardingProps> = ({
  visible,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<MusicArtistProfile>({
    isArtist: false,
    artistName: '',
    genres: [],
    artistType: 'solo',
    instruments: [],
    experienceLevel: 'beginner',
    lookingFor: [],
    socialLinks: {
      spotify: '',
      appleMusic: '',
      soundcloud: '',
      youtube: '',
      instagram: '',
      tiktok: '',
    },
    bio: '',
    location: '',
    availableForCollabs: true,
    openToBookings: false,
    hasOriginalMusic: false,
    recordLabel: '',
  });

  const updateProfile = <K extends keyof MusicArtistProfile>(
    key: K,
    value: MusicArtistProfile[K]
  ) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const updateSocialLinks = <K extends keyof MusicArtistProfile['socialLinks']>(
    key: K,
    value: MusicArtistProfile['socialLinks'][K]
  ) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value }
    }));
  };

  const toggleGenre = (genreId: string) => {
    setProfile(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId]
    }));
  };

  const toggleInstrument = (instrument: string) => {
    setProfile(prev => ({
      ...prev,
      instruments: prev.instruments.includes(instrument)
        ? prev.instruments.filter(i => i !== instrument)
        : [...prev.instruments, instrument]
    }));
  };

  const toggleLookingFor = (item: string) => {
    setProfile(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(item)
        ? prev.lookingFor.filter(i => i !== item)
        : [...prev.lookingFor, item]
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !profile.isArtist) {
      onSkip();
      return;
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!profile.artistName.trim()) {
        Alert.alert('Required Field', 'Please enter your artist name');
        return;
      }
      if (profile.genres.length === 0) {
        Alert.alert('Required Field', 'Please select at least one genre');
        return;
      }
      onComplete(profile);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.stepIcon}>🎵</Text>
      </View>
      
      <Text style={styles.stepTitle}>Welcome to Luma Music!</Text>
      <Text style={styles.stepSubtitle}>
        Connect with artists, share your music, and grow your fanbase on the ultimate platform for musicians.
      </Text>

      <View style={styles.artistTypeContainer}>
        <TouchableOpacity
          style={[styles.artistChoice, profile.isArtist && styles.artistChoiceSelected]}
          onPress={() => updateProfile('isArtist', true)}
        >
          <LinearGradient
            colors={profile.isArtist ? ['#FF6B6B', '#FF8E53'] : ['#f8f9fa', '#e9ecef']}
            style={styles.artistChoiceGradient}
          >
            <Text style={styles.artistChoiceIcon}>🎤</Text>
            <Text style={[styles.artistChoiceTitle, profile.isArtist && styles.artistChoiceSelectedText]}>
              I'm a Music Artist
            </Text>
            <Text style={[styles.artistChoiceDescription, profile.isArtist && styles.artistChoiceSelectedText]}>
              Rapper, Singer, Musician, Producer, or Band
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.artistChoice, !profile.isArtist && styles.artistChoiceSelected]}
          onPress={() => updateProfile('isArtist', false)}
        >
          <LinearGradient
            colors={!profile.isArtist ? ['#4ECDC4', '#44A08D'] : ['#f8f9fa', '#e9ecef']}
            style={styles.artistChoiceGradient}
          >
            <Text style={styles.artistChoiceIcon}>🎧</Text>
            <Text style={[styles.artistChoiceTitle, !profile.isArtist && styles.artistChoiceSelectedText]}>
              I'm a Music Fan
            </Text>
            <Text style={[styles.artistChoiceDescription, !profile.isArtist && styles.artistChoiceSelectedText]}>
              Discover and support amazing artists
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.stepIcon}>🎨</Text>
      </View>
      
      <Text style={styles.stepTitle}>Tell us about yourself</Text>
      <Text style={styles.stepSubtitle}>
        Help other artists and fans discover your unique sound
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Artist/Stage Name *</Text>
        <TextInput
          style={styles.textInput}
          value={profile.artistName}
          onChangeText={(text) => updateProfile('artistName', text)}
          placeholder="What should fans call you?"
          maxLength={50}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>What type of artist are you?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.artistTypesScroll}>
          {ARTIST_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.artistTypeCard,
                profile.artistType === type.id && styles.artistTypeCardSelected
              ]}
              onPress={() => updateProfile('artistType', type.id as any)}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={profile.artistType === type.id ? '#fff' : '#667eea'}
              />
              <Text style={[
                styles.artistTypeText,
                profile.artistType === type.id && styles.artistTypeTextSelected
              ]}>
                {type.name}
              </Text>
              <Text style={[
                styles.artistTypeDescription,
                profile.artistType === type.id && styles.artistTypeDescriptionSelected
              ]}>
                {type.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.stepIcon}>🎼</Text>
      </View>
      
      <Text style={styles.stepTitle}>What's your sound?</Text>
      <Text style={styles.stepSubtitle}>
        Select the genres that best describe your music (choose up to 5)
      </Text>

      <ScrollView style={styles.genresContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.genresGrid}>
          {MUSIC_GENRES.map((genre) => (
            <TouchableOpacity
              key={genre.id}
              style={[
                styles.genreCard,
                { borderColor: genre.color },
                profile.genres.includes(genre.id) && { backgroundColor: genre.color }
              ]}
              onPress={() => toggleGenre(genre.id)}
              disabled={!profile.genres.includes(genre.id) && profile.genres.length >= 5}
            >
              <Text style={styles.genreIcon}>{genre.icon}</Text>
              <Text style={[
                styles.genreText,
                profile.genres.includes(genre.id) && styles.genreTextSelected
              ]}>
                {genre.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.selectionCount}>
        {profile.genres.length}/5 genres selected
      </Text>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.stepIcon}>🎹</Text>
      </View>
      
      <Text style={styles.stepTitle}>What do you play?</Text>
      <Text style={styles.stepSubtitle}>
        Select your instruments and experience level
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Experience Level</Text>
        <View style={styles.experienceButtons}>
          {[
            { id: 'beginner', name: 'Beginner', icon: '🌱' },
            { id: 'intermediate', name: 'Intermediate', icon: '🎯' },
            { id: 'professional', name: 'Professional', icon: '⭐' },
            { id: 'industry', name: 'Industry', icon: '👑' },
          ].map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.experienceButton,
                profile.experienceLevel === level.id && styles.experienceButtonSelected
              ]}
              onPress={() => updateProfile('experienceLevel', level.id as any)}
            >
              <Text style={styles.experienceIcon}>{level.icon}</Text>
              <Text style={[
                styles.experienceText,
                profile.experienceLevel === level.id && styles.experienceTextSelected
              ]}>
                {level.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Instruments & Skills</Text>
        <View style={styles.instrumentsGrid}>
          {INSTRUMENTS.map((instrument) => (
            <TouchableOpacity
              key={instrument}
              style={[
                styles.instrumentChip,
                profile.instruments.includes(instrument) && styles.instrumentChipSelected
              ]}
              onPress={() => toggleInstrument(instrument)}
            >
              <Text style={[
                styles.instrumentText,
                profile.instruments.includes(instrument) && styles.instrumentTextSelected
              ]}>
                {instrument}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.iconContainer}>
        <Text style={styles.stepIcon}>🚀</Text>
      </View>
      
      <Text style={styles.stepTitle}>Let's connect your music!</Text>
      <Text style={styles.stepSubtitle}>
        Add your social links and tell us what you're looking for
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Music Platforms</Text>
        
        <View style={styles.socialLinkContainer}>
          <Ionicons name="musical-notes" size={20} color="#1DB954" />
          <TextInput
            style={styles.socialInput}
            value={profile.socialLinks.spotify}
            onChangeText={(text) => updateSocialLinks('spotify', text)}
            placeholder="Spotify artist URL"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.socialLinkContainer}>
          <Ionicons name="musical-note" size={20} color="#000" />
          <TextInput
            style={styles.socialInput}
            value={profile.socialLinks.appleMusic}
            onChangeText={(text) => updateSocialLinks('appleMusic', text)}
            placeholder="Apple Music artist URL"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.socialLinkContainer}>
          <Ionicons name="cloud" size={20} color="#FF5500" />
          <TextInput
            style={styles.socialInput}
            value={profile.socialLinks.soundcloud}
            onChangeText={(text) => updateSocialLinks('soundcloud', text)}
            placeholder="SoundCloud profile URL"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.socialLinkContainer}>
          <Ionicons name="logo-youtube" size={20} color="#FF0000" />
          <TextInput
            style={styles.socialInput}
            value={profile.socialLinks.youtube}
            onChangeText={(text) => updateSocialLinks('youtube', text)}
            placeholder="YouTube channel URL"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>What are you looking for?</Text>
        <View style={styles.lookingForGrid}>
          {LOOKING_FOR.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.lookingForChip,
                profile.lookingFor.includes(item) && styles.lookingForChipSelected
              ]}
              onPress={() => toggleLookingFor(item)}
            >
              <Text style={[
                styles.lookingForText,
                profile.lookingFor.includes(item) && styles.lookingForTextSelected
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.togglesContainer}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Available for collaborations</Text>
          <Switch
            value={profile.availableForCollabs}
            onValueChange={(value) => updateProfile('availableForCollabs', value)}
            trackColor={{ false: '#ccc', true: '#4ECDC4' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Open to bookings/gigs</Text>
          <Switch
            value={profile.openToBookings}
            onValueChange={(value) => updateProfile('openToBookings', value)}
            trackColor={{ false: '#ccc', true: '#4ECDC4' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>I have original music</Text>
          <Switch
            value={profile.hasOriginalMusic}
            onValueChange={(value) => updateProfile('hasOriginalMusic', value)}
            trackColor={{ false: '#ccc', true: '#4ECDC4' }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </ScrollView>
  );

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Luma Music Setup</Text>
          <Text style={styles.stepIndicator}>{currentStep}/5</Text>
        </View>
      </LinearGradient>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / 5) * 100}%` }]} />
      </View>

      <View style={styles.content}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </View>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Ionicons name="arrow-back" size={20} color="#667eea" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, { marginLeft: currentStep > 1 ? 12 : 0 }]}
          onPress={handleNext}
        >
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 1 && !profile.isArtist ? 'Continue as Fan' :
               currentStep === 5 ? 'Complete Setup' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepIndicator: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(102,126,234,0.2)',
    marginHorizontal: 20,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepIcon: {
    fontSize: 60,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  artistTypeContainer: {
    gap: 16,
  },
  artistChoice: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  artistChoiceSelected: {
    transform: [{ scale: 1.02 }],
  },
  artistChoiceGradient: {
    padding: 24,
    alignItems: 'center',
  },
  artistChoiceIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  artistChoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  artistChoiceSelectedText: {
    color: '#fff',
  },
  artistChoiceDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  artistTypesScroll: {
    flexDirection: 'row',
  },
  artistTypeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  artistTypeCardSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  artistTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginTop: 8,
    textAlign: 'center',
  },
  artistTypeTextSelected: {
    color: '#fff',
  },
  artistTypeDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  artistTypeDescriptionSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  genresContainer: {
    flex: 1,
  },
  genresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  genreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 2,
    borderWidth: 2,
  },
  genreIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  genreTextSelected: {
    color: '#fff',
  },
  selectionCount: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 16,
  },
  experienceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  experienceButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  experienceButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  experienceIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  experienceTextSelected: {
    color: '#fff',
  },
  instrumentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  instrumentChip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  instrumentChipSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  instrumentText: {
    fontSize: 14,
    color: '#333',
  },
  instrumentTextSelected: {
    color: '#fff',
  },
  socialLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  socialInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  lookingForGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  lookingForChip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  lookingForChipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  lookingForText: {
    fontSize: 14,
    color: '#333',
  },
  lookingForTextSelected: {
    color: '#fff',
  },
  togglesContainer: {
    marginTop: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  backButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});