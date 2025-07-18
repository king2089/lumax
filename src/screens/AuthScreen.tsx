import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { LumaMusicOnboarding } from '../components/LumaMusicOnboarding';
import { useMusic } from '../context/MusicContext';
import * as Linking from 'expo-linking';
import { scale, responsiveStyle } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

export const AuthScreen: React.FC = () => {
  const { loginWithCredentials, isLoading, error } = useAuth();
  const { setUserMusicProfile } = useMusic();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showMusicOnboarding, setShowMusicOnboarding] = useState(false);
  const [musicProfile, setMusicProfile] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isArtistSignup, setIsArtistSignup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [age, setAge] = useState('');
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const logoScale = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }

    if (!isLogin) {
      if (!username.trim()) {
        Alert.alert('Error', 'Please enter a username');
        return false;
      }
      
      if (!displayName.trim()) {
        Alert.alert('Error', 'Please enter your display name');
        return false;
      }

      if (password.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters long');
        return false;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }

      if (!isAgeVerified) {
        Alert.alert('Error', 'Please verify your age (must be 18+)');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (isLogin) {
      await loginWithCredentials(email, password);
    } else {
      // Start the music onboarding flow for new signups
      setShowMusicOnboarding(true);
    }
  };

  const handleMusicOnboardingComplete = async (profile: any) => {
    setMusicProfile(profile);
    setUserMusicProfile(profile);
    setShowMusicOnboarding(false);
    
    // Complete signup with music profile data
    console.log('Signup:', { 
      email, 
      password, 
      username, 
      displayName,
      musicProfile: profile
    });
    
    // Show welcome bonus alert
    Alert.alert(
      '🎉 Welcome to Luma Gen 1!',
      `Congratulations ${displayName}! You've received a $2,500 welcome bonus.\n\nYour funds are now available for use or payout to Apple Pay, Google Pay, or your bank account.`,
      [
        {
          text: 'Claim Bonus',
          onPress: () => {
            // The bonus will be automatically claimed when they first access Luma Bank
            alert(`✅ Welcome bonus claimed! $2,500 has been added to your Luma Bank balance.`);
          }
        },
        {
          text: 'Continue',
          style: 'default'
        }
      ]
    );
  };

  const handleMusicOnboardingSkip = async () => {
    setShowMusicOnboarding(false);
    
    // Complete signup without music profile
    console.log('Signup:', { email, password, username, displayName });
    
    // Show welcome bonus alert
    Alert.alert(
      '🎉 Welcome to Luma Gen 1!',
      `Congratulations ${displayName}! You've received a $2,500 welcome bonus.\n\nYour funds are now available for use or payout to Apple Pay, Google Pay, or your bank account.`,
      [
        {
          text: 'Claim Bonus',
          onPress: () => {
            // The bonus will be automatically claimed when they first access Luma Bank
            alert(`✅ Welcome bonus claimed! $2,500 has been added to your Luma Bank balance.`);
          }
        },
        {
          text: 'Continue',
          style: 'default'
        }
      ]
    );
  };

  const handleTestLogin = async () => {
    // Use the test account credentials
    await loginWithCredentials('test@luma.go', 'test123');
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert(
      `${provider} Login`,
      `${provider} authentication will be implemented in Gen 2.`,
      [{ text: 'OK' }]
    );
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Enter your email address and we\'ll send you a reset link.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Reset Link', onPress: () => Alert.alert('Sent!', 'Check your email for reset instructions.') },
      ]
    );
  };

  const handleAgeVerification = () => {
    const ageNum = parseInt(age);
    if (ageNum >= 18) {
      setIsAgeVerified(true);
      Alert.alert('Age Verified ✅', 'You are now verified to access Luma Gen 1.');
    } else {
      Alert.alert('Access Denied ❌', 'You must be 18 or older to access Luma Gen 1.');
    }
  };

  const canSubmit = isLogin 
    ? email.trim() && password.trim()
    : email.trim() && password.trim() && username.trim() && displayName.trim() && confirmPassword.trim() && isAgeVerified;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Logo Section */}
              <Animated.View 
                style={[
                  styles.logoContainer,
                  { transform: [{ scale: logoScale }] }
                ]}
              >
            <View style={styles.logoIcon}>
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>L</Text>
              </LinearGradient>
            </View>
                <Text style={styles.logo}>Luma Gen 1</Text>
            <Text style={styles.tagline}>
                  {isLogin ? 'Welcome back to the future' : 'Join the next generation'}
                </Text>
                <Text style={styles.subtitle}>
                  {isLogin ? 'Sign in to continue your journey' : 'Create your account and start earning'}
            </Text>
              </Animated.View>

          {/* Sign In / Sign Up Tabs */}
              <View style={styles.tabContainer}>
            <TouchableOpacity
                  style={[styles.tab, isLogin && styles.activeTab]}
              onPress={() => setIsLogin(true)}
            >
                  <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                    Sign In
                  </Text>
            </TouchableOpacity>
            <TouchableOpacity
                  style={[styles.tab, !isLogin && styles.activeTab]}
              onPress={() => setIsLogin(false)}
            >
                  <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                    Sign Up
                  </Text>
            </TouchableOpacity>
          </View>

              {/* Form */}
          <View style={styles.formContainer}>
              {!isLogin && (
                <>
                    <View style={styles.inputGroup}>
                      <Ionicons name="person" size={20} color="#fff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Display Name"
                        placeholderTextColor="#ccc"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                  />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Ionicons name="at" size={20} color="#fff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                        placeholderTextColor="#ccc"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                    </View>
                </>
              )}

                <View style={styles.inputGroup}>
                  <Ionicons name="mail" size={20} color="#fff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                    placeholderTextColor="#ccc"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
                </View>

                <View style={styles.inputGroup}>
                  <Ionicons name="lock-closed" size={20} color="#fff" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                  placeholder="Password"
                    placeholderTextColor="#ccc"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#fff" 
                    />
                </TouchableOpacity>
              </View>

              {!isLogin && (
                  <>
                    <View style={styles.inputGroup}>
                      <Ionicons name="lock-closed" size={20} color="#fff" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#ccc"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Ionicons 
                          name={showConfirmPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color="#fff" 
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Age Verification */}
                    <View style={styles.ageVerificationContainer}>
                      <View style={styles.inputGroup}>
                        <Ionicons name="calendar" size={20} color="#fff" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Age (18+)"
                          placeholderTextColor="#ccc"
                          value={age}
                          onChangeText={setAge}
                          keyboardType="numeric"
                          maxLength={2}
                        />
                        <TouchableOpacity
                          style={[styles.verifyButton, isAgeVerified && styles.verifiedButton]}
                          onPress={handleAgeVerification}
                        >
                          <Ionicons 
                            name={isAgeVerified ? "checkmark-circle" : "shield-checkmark"} 
                            size={20} 
                            color="#fff" 
                          />
                        </TouchableOpacity>
                      </View>
                      {isAgeVerified && (
                        <Text style={styles.verifiedText}>✅ Age verified</Text>
                      )}
                    </View>

                    {/* Signup Type Selection */}
                <View style={styles.signupOptions}>
                  <TouchableOpacity
                    style={[styles.signupType, !isArtistSignup && styles.signupTypeActive]}
                    onPress={() => setIsArtistSignup(false)}
                  >
                        <Ionicons name="people" size={24} color={!isArtistSignup ? "#fff" : "#ccc"} />
                    <Text style={[styles.signupTypeText, !isArtistSignup && styles.signupTypeTextActive]}>
                          Fan/Creator
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.signupType, isArtistSignup && styles.signupTypeActive]}
                    onPress={() => setIsArtistSignup(true)}
                  >
                        <Ionicons name="musical-notes" size={24} color={isArtistSignup ? "#fff" : "#ccc"} />
                    <Text style={[styles.signupTypeText, isArtistSignup && styles.signupTypeTextActive]}>
                          Music Artist
                    </Text>
                  </TouchableOpacity>
                </View>
                  </>
              )}

                {/* Remember Me & Forgot Password */}
              {isLogin && (
                <View style={styles.loginOptions}>
                  <TouchableOpacity 
                      style={styles.rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                      <Ionicons 
                        name={rememberMe ? "checkbox" : "square-outline"} 
                        size={20} 
                        color="#fff" 
                      />
                      <Text style={styles.rememberMeText}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
              )}
              
                {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit || isLoading}
                >
                  <LinearGradient
                    colors={canSubmit ? ['#FF6B6B', '#4ECDC4'] : ['#666', '#999']}
                    style={styles.submitGradient}
              >
                <Text style={styles.submitButtonText}>
                      {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
                </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Error Display */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Test Login Button */}
                <TouchableOpacity
                  style={styles.testLoginButton}
                  onPress={handleTestLogin}
                >
                  <Text style={styles.testLoginText}>🔑 Test Account Login</Text>
              </TouchableOpacity>

                {/* Social Login */}
                <View style={styles.socialLoginContainer}>
                  <Text style={styles.socialLoginText}>Or continue with</Text>
                <View style={styles.socialButtons}>
                  <TouchableOpacity 
                    style={styles.socialButton}
                      onPress={() => handleSocialLogin('Apple')}
                  >
                      <Ionicons name="logo-apple" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.socialButton}
                      onPress={() => handleSocialLogin('Google')}
                  >
                      <Ionicons name="logo-google" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.socialButton}
                      onPress={() => handleSocialLogin('Facebook')}
                  >
                      <Ionicons name="logo-facebook" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

                {/* Terms and Privacy */}
            {!isLogin && (
                  <Text style={styles.termsText}>
                    By signing up, you agree to our{' '}
                    <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
                )}
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Music Onboarding Modal */}
      <Modal
        visible={showMusicOnboarding}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LumaMusicOnboarding
          onComplete={handleMusicOnboardingComplete}
          onSkip={handleMusicOnboardingSkip}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: responsiveStyle({
    flex: 1,
    backgroundColor: '#0a0a0a',
  }),
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: responsiveStyle({
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  }),
  logoContainer: responsiveStyle({
    alignItems: 'center',
    marginBottom: 40,
  }),
  logoIcon: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    marginBottom: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: scale(36),
    fontWeight: 'bold',
    color: '#fff',
  },
  logo: responsiveStyle({
    width: 120,
    height: 120,
    marginBottom: 20,
  }),
  tagline: {
    fontSize: scale(18),
    color: '#fff',
    textAlign: 'center',
    marginBottom: scale(4),
    fontWeight: '600',
  },
  subtitle: responsiveStyle({
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
  }),
  title: responsiveStyle({
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  }),
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(12),
    padding: scale(4),
    marginBottom: scale(24),
  },
  tab: {
    flex: 1,
    paddingVertical: scale(12),
    alignItems: 'center',
    borderRadius: scale(8),
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#ccc',
  },
  activeTabText: {
    color: '#fff',
  },
  formContainer: responsiveStyle({
    marginBottom: 30,
  }),
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(12),
    marginBottom: scale(16),
    paddingHorizontal: scale(16),
    paddingVertical: scale(4),
  },
  inputIcon: {
    marginRight: scale(12),
  },
  input: responsiveStyle({
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  }),
  inputFocused: responsiveStyle({
    borderColor: '#FFD700',
  }),
  passwordToggle: {
    padding: scale(8),
  },
  ageVerificationContainer: {
    marginBottom: scale(16),
  },
  verifyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: scale(8),
    borderRadius: scale(8),
  },
  verifiedButton: {
    backgroundColor: '#4CAF50',
  },
  verifiedText: {
    color: '#4CAF50',
    fontSize: scale(12),
    textAlign: 'center',
    marginTop: scale(4),
  },
  signupOptions: {
    flexDirection: 'row',
    marginBottom: scale(24),
    gap: scale(12),
  },
  signupType: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(12),
    padding: scale(16),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  signupTypeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#fff',
  },
  signupTypeText: {
    color: '#ccc',
    fontSize: scale(14),
    fontWeight: '600',
    marginTop: scale(8),
  },
  signupTypeTextActive: {
    color: '#fff',
  },
  loginOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(24),
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    color: '#fff',
    marginLeft: scale(8),
    fontSize: scale(14),
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: scale(14),
    textDecorationLine: 'underline',
  },
  submitButton: {
    borderRadius: scale(12),
    marginBottom: scale(16),
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: scale(16),
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: scale(8),
    padding: scale(12),
    marginBottom: scale(16),
  },
  errorText: responsiveStyle({
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  }),
  testLoginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(8),
    padding: scale(12),
    alignItems: 'center',
    marginBottom: scale(24),
  },
  testLoginText: {
    color: '#fff',
    fontSize: scale(14),
  },
  socialLoginContainer: {
    alignItems: 'center',
    marginBottom: scale(24),
  },
  socialLoginText: {
    color: '#fff',
    fontSize: scale(14),
    marginBottom: scale(16),
  },
  socialButtons: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  }),
  socialButton: responsiveStyle({
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  }),
  termsText: {
    color: '#fff',
    fontSize: scale(12),
    textAlign: 'center',
    opacity: 0.8,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  divider: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  }),
  dividerLine: responsiveStyle({
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  }),
  dividerText: responsiveStyle({
    color: '#888',
    fontSize: 14,
    marginHorizontal: 15,
  }),
  buttonContainer: responsiveStyle({
    marginBottom: 20,
  }),
  primaryButton: responsiveStyle({
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  }),
  primaryButtonText: responsiveStyle({
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  }),
  secondaryButton: responsiveStyle({
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  }),
  secondaryButtonText: responsiveStyle({
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  }),
  ageVerificationModal: responsiveStyle({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  }),
  modalContent: responsiveStyle({
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    alignItems: 'center',
  }),
  modalTitle: responsiveStyle({
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 15,
  }),
  modalText: responsiveStyle({
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  }),
  modalButtons: responsiveStyle({
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  }),
  modalButton: responsiveStyle({
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
  }),
  confirmButton: responsiveStyle({
    backgroundColor: '#FFD700',
  }),
  cancelButton: responsiveStyle({
    backgroundColor: '#ff4444',
  }),
  buttonText: responsiveStyle({
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  }),
  confirmText: responsiveStyle({
    color: '#000',
  }),
  cancelText: responsiveStyle({
    color: '#fff',
  }),
}); 