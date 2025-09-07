import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  StatusBar,
  Animated,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Enhanced Gen4 Responsive Design
const isTablet = width >= 768 || height >= 768;
const isLandscape = width > height;
const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';
const isIPad = Platform.OS === 'ios' && (width >= 768 || height >= 768);

// Gen4 Quantum Scale Functions
const quantumScale = (size: number) => {
  const baseSize = isTablet ? 768 : (Platform.OS === 'ios' ? 375 : 360);
  const scaleFactor = Math.min(width, height) / baseSize;
  const minScale = 0.8;
  const maxScale = 1.5;
  const adjustedScale = Math.max(minScale, Math.min(maxScale, scaleFactor));
  return size * adjustedScale;
};

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'user' | 'artist'>('user');
  const [artistName, setArtistName] = useState('');
  const [artistCategory, setArtistCategory] = useState<'musician' | 'producer' | 'composer' | 'dj' | 'singer' | 'rapper' | 'band' | 'orchestra' | 'choir' | 'other'>('musician');
  const [artistGenre, setArtistGenre] = useState<string[]>(['']);
  const [artistBio, setArtistBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  
  // Gen4 Enhanced 3D Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const quantumFieldAnim = useRef(new Animated.Value(0)).current;
  const popOutAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gen4 Quantum 3D Animation System
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Quantum Field Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(quantumFieldAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(quantumFieldAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3D Pop-Out Animation
    Animated.timing(popOutAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Glow Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Enhanced Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleRegister = async () => {
    // Enhanced validation
    if (!username || !email || !password || !confirmPassword || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isAgeVerified) {
      Alert.alert('Age Verification Required', 'You must be 18 years or older to create an account on Luma. Please confirm your age to continue.');
      return;
    }

    // Username validation
    if (username.trim().length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return;
    }

    if (username.trim().length > 20) {
      Alert.alert('Error', 'Username must be less than 20 characters');
      return;
    }

    // Display name validation
    if (displayName.trim().length < 2) {
      Alert.alert('Error', 'Display name must be at least 2 characters long');
      return;
    }

    if (displayName.trim().length > 30) {
      Alert.alert('Error', 'Display name must be less than 30 characters');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password.length > 50) {
      Alert.alert('Error', 'Password must be less than 50 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'user'];
    if (weakPasswords.includes(password.toLowerCase())) {
      Alert.alert('Error', 'Please choose a stronger password');
      return;
    }

    // Artist-specific validation
    if (userType === 'artist') {
      if (!artistName || artistName.trim().length < 2) {
        Alert.alert('Error', 'Artist name must be at least 2 characters long');
        return;
      }
      
      if (!artistGenre || artistGenre.filter(g => g.trim()).length === 0) {
        Alert.alert('Error', 'Please select at least one music genre');
        return;
      }
    }

    setIsLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        userType,
        artistName: userType === 'artist' ? artistName.trim() : undefined,
        artistCategory: userType === 'artist' ? artistCategory : undefined,
        artistGenre: userType === 'artist' ? artistGenre.filter(g => g.trim()) : undefined,
        artistBio: userType === 'artist' ? artistBio.trim() : undefined,
        neuralSignature: `dna_${Date.now()}`,
        consciousnessLevel: Math.floor(Math.random() * 20) + 80, // Random level 80-100
      });
      console.log('✅ Gen4 registration successful');
      Alert.alert('Success', 'Account created successfully! Welcome to Gen4! 🚀');
    } catch (error) {
      console.error('❌ Registration error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

    const handleQuickRegister = async () => {
    // Quick registration with demo credentials
    setUsername('DemoUser');
    setDisplayName('Demo User');
    setEmail('demo@luma.com');
    setPassword('DemoPass123');
    setConfirmPassword('DemoPass123');
    setUserType('user'); // Default to user for demo
    setIsLoading(true);
    
    try {
      await register({
        username: 'DemoUser',
        email: 'demo@luma.com',
        password: 'DemoPass123',
        displayName: 'Demo User',
        userType: 'user',
        neuralSignature: `dna_${Date.now()}`,
        consciousnessLevel: 95,
      });
      console.log('✅ Gen4 quick registration successful');
      Alert.alert('Success', 'Demo account created successfully! Welcome to Gen4! 🚀');
    } catch (error) {
      console.error('❌ Quick registration error:', error);
      Alert.alert('Quick Registration Error', 'Failed to create demo account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    (navigation as any).goBack();
  };

  const handleLogin = () => {
    (navigation as any).navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Gen4 Background */}
      <LinearGradient
        colors={['#000', '#1a0033', '#330066', '#6600cc']}
        style={styles.background}
      >
        {/* Gen4 Quantum Field Background */}
        <Animated.View style={[styles.quantumFieldBackground, { opacity: quantumFieldAnim }]}>
          {[...Array(20)].map((_, i) => (
            <View
              key={`quantum-${i}`}
              style={[
                styles.quantumField,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  animationDelay: `${i * 0.2}s`,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Gen4 Register Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: popOutAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })}
                ]
              }
            ]}
          >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={quantumScale(24)} color="#fff" />
          </TouchableOpacity>

          {/* Gen4 Logo */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: pulseAnim },
                  { translateY: popOutAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10]
                  })}
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['#FF5722', '#E64A19', '#D84315']}
              style={styles.logoGradient}
            >
              <Ionicons name="rocket" size={quantumScale(60)} color="#fff" />
            </LinearGradient>
          </Animated.View>

          {/* Gen4 Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🚀 Join Gen4</Text>
            <Text style={styles.subtitle}>Create your Quantum Experience</Text>
          </View>

          {/* Register Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={quantumScale(20)} color="#FF6B9D" />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="person-circle" size={quantumScale(20)} color="#9C27B0" />
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <Text style={styles.userTypeLabel}>I am a:</Text>
              <View style={styles.userTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === 'user' && styles.userTypeButtonActive
                  ]}
                  onPress={() => setUserType('user')}
                >
                  <LinearGradient
                    colors={userType === 'user' ? ['#00D4FF', '#0099CC'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.userTypeButtonGradient}
                  >
                    <Ionicons name="person" size={quantumScale(16)} color={userType === 'user' ? '#fff' : 'rgba(255,255,255,0.6)'} />
                    <Text style={[styles.userTypeButtonText, userType === 'user' && styles.userTypeButtonTextActive]}>
                      User
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === 'artist' && styles.userTypeButtonActive
                  ]}
                  onPress={() => setUserType('artist')}
                >
                  <LinearGradient
                    colors={userType === 'artist' ? ['#FF6B9D', '#E91E63'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.userTypeButtonGradient}
                  >
                    <Ionicons name="musical-notes" size={quantumScale(16)} color={userType === 'artist' ? '#fff' : 'rgba(255,255,255,0.6)'} />
                    <Text style={[styles.userTypeButtonText, userType === 'artist' && styles.userTypeButtonTextActive]}>
                      Artist
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Artist Fields */}
            {userType === 'artist' && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="star" size={quantumScale(20)} color="#FFD700" />
                  <TextInput
                    style={styles.input}
                    placeholder="Artist Name"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={artistName}
                    onChangeText={setArtistName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="albums" size={quantumScale(20)} color="#9C27B0" />
                  <TextInput
                    style={styles.input}
                    placeholder="Artist Category (Musician, Producer, DJ, etc.)"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={artistCategory}
                    onChangeText={(text) => setArtistCategory(text as any)}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="musical-note" size={quantumScale(20)} color="#4CAF50" />
                  <TextInput
                    style={styles.input}
                    placeholder="Music Genres (comma separated)"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={artistGenre.join(', ')}
                    onChangeText={(text) => setArtistGenre(text.split(',').map(g => g.trim()).filter(g => g))}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="document-text" size={quantumScale(20)} color="#FF9800" />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Artist Bio (optional)"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={artistBio}
                    onChangeText={setArtistBio}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={quantumScale(20)} color="#4CAF50" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={quantumScale(20)} color="#4CAF50" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={quantumScale(20)} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={quantumScale(20)} color="#4CAF50" />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={quantumScale(20)} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            {/* Age Verification Checkbox */}
            <View style={styles.ageVerificationContainer}>
              <TouchableOpacity
                style={styles.ageVerificationCheckbox}
                onPress={() => setIsAgeVerified(!isAgeVerified)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  isAgeVerified && styles.checkboxChecked
                ]}>
                  {isAgeVerified && (
                    <Ionicons name="checkmark" size={quantumScale(16)} color="#fff" />
                  )}
                </View>
                <Text style={styles.ageVerificationText}>
                  I confirm that I am 18 years or older
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B9D', '#9C27B0']}
                style={styles.registerButtonGradient}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
                <Ionicons name="arrow-forward" size={quantumScale(20)} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Quick Register Button - Developer Only */}
            {__DEV__ && (
              <TouchableOpacity 
                style={styles.quickRegisterButton}
                onPress={handleQuickRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  style={styles.quickRegisterButtonGradient}
                >
                  <Text style={styles.quickRegisterButtonText}>
                    {isLoading ? 'Creating Demo...' : 'Quick Register (Demo) - Dev Only'}
                  </Text>
                  <Ionicons name="flash" size={quantumScale(20)} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Login Link */}
            <TouchableOpacity 
              style={styles.loginLink}
              onPress={handleLogin}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginTextBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Gen4 Platform Info */}
          <View style={styles.platformInfo}>
            <Text style={styles.platformText}>
              {isIPad ? '📱 iPad Optimized' : isTablet ? '📱 Tablet Optimized' : isAndroid ? '🤖 Android Optimized' : '🍎 iOS Optimized'}
            </Text>
            <Text style={styles.versionText}>Gen4 v2.0 • Quantum Enhanced</Text>
          </View>
        </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Gen4 Quantum Field Background
  quantumFieldBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  quantumField: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,87,34,0.6)',
    position: 'absolute',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: quantumScale(40),
    paddingTop: isIPad ? 100 : (Platform.OS === 'ios' ? 80 : 60),
    paddingBottom: quantumScale(40),
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  // Back Button
  backButton: {
    position: 'absolute',
    top: isIPad ? 80 : (Platform.OS === 'ios' ? 60 : 40),
    left: quantumScale(20),
    zIndex: 10,
  },
  // Logo
  logoContainer: {
    marginBottom: quantumScale(40),
    alignItems: 'center',
  },
  logoGradient: {
    width: quantumScale(100),
    height: quantumScale(100),
    borderRadius: quantumScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  // Title
  titleContainer: {
    alignItems: 'center',
    marginBottom: quantumScale(40),
    paddingHorizontal: quantumScale(20),
  },
  title: {
    fontSize: quantumScale(28),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: quantumScale(12),
  },
  subtitle: {
    fontSize: quantumScale(16),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: quantumScale(22),
  },
  // Form
  formContainer: {
    width: '100%',
    marginBottom: quantumScale(40),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: quantumScale(16),
    paddingHorizontal: quantumScale(16),
    paddingVertical: quantumScale(16),
    marginBottom: quantumScale(20),
    gap: quantumScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255,87,34,0.3)',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    flex: 1,
    fontSize: quantumScale(16),
    color: '#fff',
    paddingVertical: quantumScale(4),
  },
  textArea: {
    minHeight: quantumScale(80),
    textAlignVertical: 'top',
  },
  // User Type Selection
  userTypeContainer: {
    marginBottom: quantumScale(16),
  },
  userTypeLabel: {
    fontSize: quantumScale(16),
    color: '#fff',
    marginBottom: quantumScale(12),
    textAlign: 'center',
    fontWeight: '600',
  },
  userTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: quantumScale(12),
  },
  userTypeButton: {
    flex: 1,
    borderRadius: quantumScale(12),
    overflow: 'hidden',
  },
  userTypeButtonActive: {
    shadowColor: '#FF5722',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  userTypeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: quantumScale(14),
    paddingHorizontal: quantumScale(16),
    gap: quantumScale(8),
  },
  userTypeButtonText: {
    fontSize: quantumScale(16),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  userTypeButtonTextActive: {
    color: '#fff',
  },
  // Register Button
  registerButton: {
    borderRadius: quantumScale(16),
    overflow: 'hidden',
    marginBottom: quantumScale(20),
    marginTop: quantumScale(8),
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: quantumScale(16),
    paddingHorizontal: quantumScale(32),
    gap: quantumScale(12),
  },
  registerButtonText: {
    fontSize: quantumScale(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  // Quick Register Button
  quickRegisterButton: {
    borderRadius: quantumScale(16),
    overflow: 'hidden',
    marginBottom: quantumScale(24),
    borderWidth: 1,
    borderColor: 'rgba(255,87,34,0.4)',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quickRegisterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: quantumScale(16),
    paddingHorizontal: quantumScale(32),
    gap: quantumScale(12),
  },
  quickRegisterButtonText: {
    fontSize: quantumScale(16),
    fontWeight: 'bold',
    color: '#fff',
  },
  // Login Link
  loginLink: {
    alignItems: 'center',
    marginBottom: quantumScale(30),
  },
  loginText: {
    fontSize: quantumScale(16),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  loginTextBold: {
    color: '#FF5722',
    fontWeight: 'bold',
  },
  // Platform Info
  platformInfo: {
    alignItems: 'center',
    marginTop: quantumScale(20),
  },
  platformText: {
    fontSize: quantumScale(14),
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: quantumScale(4),
  },
  versionText: {
    fontSize: quantumScale(12),
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  // Age Verification Styles
  ageVerificationContainer: {
    marginVertical: quantumScale(16),
    paddingHorizontal: quantumScale(20),
  },
  ageVerificationCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: quantumScale(12),
  },
  checkbox: {
    width: quantumScale(20),
    height: quantumScale(20),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: quantumScale(4),
    marginRight: quantumScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  ageVerificationText: {
    fontSize: quantumScale(14),
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    lineHeight: quantumScale(20),
  },
});

export default RegisterScreen;
