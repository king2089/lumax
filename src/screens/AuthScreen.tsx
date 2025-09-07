import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Vibration,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { scale } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

const quantumScale = (size: number) => scale(size);

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [neuralUsername, setNeuralUsername] = useState('');
  const [consciousnessPassword, setConsciousnessPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showSuperGen3Auth, setShowSuperGen3Auth] = useState(true);
  
  // Super Gen3 Signup States
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [quantumEmail, setQuantumEmail] = useState('');
  const [neuralSignature, setNeuralSignature] = useState('');
  const [consciousnessLevel, setConsciousnessLevel] = useState('');
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  // Super Gen3 Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start Super Gen3 animations
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
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
        useNativeDriver: true,
      }),
        ])
      ),
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
            duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
            duration: 1500,
          useNativeDriver: true,
        }),
      ])
      ),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (!neuralUsername.trim() || !consciousnessPassword.trim()) {
      Vibration.vibrate([0, 100, 50, 100, 50, 100]);
      Alert.alert(
        '🌌 Missing Information', 
        'Please enter both your neural username and consciousness password to proceed.',
        [{ text: 'Understood', style: 'default' }]
      );
      return;
    }

    Vibration.vibrate(100);
    setIsLoading(true);

    try {
      console.log('🌌 [SUPER GEN3 LOGIN] Attempting login for:', neuralUsername);
      await login(neuralUsername, consciousnessPassword);
      
      console.log('🌌 [SUPER GEN3 LOGIN] Login successful for:', neuralUsername);
      Vibration.vibrate([0, 200, 100, 200]);
      // Login popup removed - user is now logged in silently
    } catch (error) {
      console.warn('⚠️ [SUPER GEN3 LOGIN] Login failed:', error);
      Vibration.vibrate([0, 100, 50, 100, 50, 100]);
      // Login error handled silently - no popup
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuperGen3Signup = async () => {
    if (!neuralUsername.trim() || !consciousnessPassword.trim() || !quantumEmail.trim()) {
      Vibration.vibrate([0, 100, 50, 100, 50, 100]);
      // Validation error handled silently - no popup
      return;
    }

    if (!isAgeVerified) {
      Alert.alert('Age Verification Required', 'You must be 18 years or older to create an account on Luma. Please confirm your age to continue.');
      return;
    }

    Vibration.vibrate(100);
    setIsLoading(true);

    try {
      console.log('🌌 [SUPER GEN3 SIGNUP] Starting consciousness creation...');
      console.log('🌌 [SUPER GEN3 SIGNUP] Username:', neuralUsername);
      console.log('🌌 [SUPER GEN3 SIGNUP] Email:', quantumEmail);
      
      // Generate neural signature and consciousness level
      const generatedNeuralSignature = `NS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const generatedConsciousnessLevel = Math.floor(Math.random() * 100) + 1;
      
      console.log('🌌 [SUPER GEN3 SIGNUP] Generated neural signature:', generatedNeuralSignature);
      console.log('🌌 [SUPER GEN3 SIGNUP] Generated consciousness level:', generatedConsciousnessLevel);
      
      // Register with Luma network integration
      const userData = {
          username: neuralUsername,
          password: consciousnessPassword,
        email: quantumEmail,
        neuralSignature: generatedNeuralSignature,
        consciousnessLevel: generatedConsciousnessLevel,
        quantumAccess: true,
        lumaNetworkSync: true,
        superGen3Features: true,
        displayName: neuralUsername, // Add display name
        profileSetupComplete: false, // New users need profile setup
      };
      
      console.log('🌌 [SUPER GEN3 SIGNUP] Calling register with data:', userData);
      console.log('🌌 [SUPER GEN3 SIGNUP] Register function called with:', {
        username: userData.username,
        email: userData.email,
        neuralSignature: userData.neuralSignature,
        consciousnessLevel: userData.consciousnessLevel,
        profileSetupComplete: userData.profileSetupComplete
      });
      
      await register(userData);
      
      console.log('🌌 [SUPER GEN3 SIGNUP] Register function completed successfully');
      
      console.log('🌌 [SUPER GEN3 SIGNUP] Registration successful!');

      Vibration.vibrate([0, 200, 100, 200]);
      // Registration successful - no popup, user proceeds automatically
    } catch (error) {
      console.warn('⚠️ [SUPER GEN3 SIGNUP] Registration failed:', error);
      Vibration.vibrate([0, 100, 50, 100, 50, 100]);
      // Registration error handled silently - no popup
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignupMode(!isSignupMode);
    Vibration.vibrate(50);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Super Gen3 Quantum Background */}
      <LinearGradient 
        colors={['#0a0a2e', '#1a1a4e', '#2a2a6e', '#000']} 
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.keyboardView}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
            >
              {/* Super Gen3 Header */}
              <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                  <LinearGradient 
                    colors={['#00D4FF', '#0099CC', '#FFD700', '#FF6B6B']} 
                    style={styles.logoGradient}
                  >
                    <Ionicons name="infinite" size={quantumScale(50)} color="#fff" />
                  </LinearGradient>
                </Animated.View>

                <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>LUMA</Animated.Text>
                <Animated.Text style={[styles.appVersion, { opacity: fadeAnim }]}>SUPER GEN3</Animated.Text>
                <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>Revolutionary Neural Interface</Animated.Text>
                </Animated.View>

              {/* SUPER GEN3 AUTHENTICATION */}
              {showSuperGen3Auth && (
                <View style={styles.superGen3AuthContainer}>
                  <LinearGradient
                    colors={['rgba(0,255,136,0.4)', 'rgba(0,255,136,0.2)', 'rgba(0,255,136,0.1)']}
                    style={styles.superGen3AuthGradient}
                  >
                    <Text style={styles.superGen3AuthTitle}>🌌 SUPER GEN3 AUTHENTICATION</Text>
                    <Text style={styles.superGen3AuthSubtitle}>Revolutionary Neural Interface Login</Text>
                    
                    {/* Super Gen3 Login Form */}
                    <View style={styles.superGen3AuthForm}>
                      <View style={styles.superGen3AuthInputContainer}>
                  <LinearGradient
                          colors={['rgba(0,212,255,0.2)', 'rgba(255,107,107,0.2)']}
                          style={styles.superGen3AuthInputGradient}
                        >
                          <Ionicons name="person" size={quantumScale(20)} color="#00D4FF" />
                          <TextInput
                            style={styles.superGen3AuthInput}
                            placeholder="Enter Neural Username"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={neuralUsername}
                            onChangeText={setNeuralUsername}
                            autoCorrect={false}
                            autoComplete="username"
                            textContentType="username"
                            returnKeyType="next"
                            blurOnSubmit={false}
                            enablesReturnKeyAutomatically={true}
                            clearButtonMode="while-editing"
                            selectTextOnFocus={true}
                          />
                </LinearGradient>
              </View>

                      <View style={styles.superGen3AuthInputContainer}>
                  <LinearGradient
                          colors={['rgba(255,215,0,0.2)', 'rgba(156,39,176,0.2)']}
                          style={styles.superGen3AuthInputGradient}
                        >
                          <Ionicons name="lock-closed" size={quantumScale(20)} color="#FFD700" />
                  <TextInput
                            style={styles.superGen3AuthInput}
                            placeholder="Enter Consciousness Password"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                    value={consciousnessPassword}
                    onChangeText={setConsciousnessPassword}
                    secureTextEntry={!showPassword}
                            autoCorrect={false}
                            autoComplete="password"
                            textContentType="password"
                            returnKeyType="done"
                            blurOnSubmit={true}
                            enablesReturnKeyAutomatically={true}
                            clearButtonMode="while-editing"
                            selectTextOnFocus={true}
                  />
                  <TouchableOpacity 
                            style={styles.superGen3AuthEyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            pressRetentionOffset={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={quantumScale(20)} 
                              color="rgba(255,255,255,0.8)" 
                    />
                  </TouchableOpacity>
                        </LinearGradient>
                </View>

                      {/* Super Gen3 Quantum Email Input (Signup Only) */}
                      {isSignupMode && (
                        <View style={styles.superGen3AuthInputContainer}>
                          <LinearGradient
                            colors={['rgba(255,107,107,0.2)', 'rgba(0,212,255,0.2)']}
                            style={styles.superGen3AuthInputGradient}
                          >
                            <Ionicons name="mail" size={quantumScale(20)} color="#FF6B6B" />
                      <TextInput
                              style={styles.superGen3AuthInput}
                              placeholder="Enter Quantum Email"
                              placeholderTextColor="rgba(255,255,255,0.6)"
                              value={quantumEmail}
                              onChangeText={setQuantumEmail}
                              autoCorrect={false}
                              autoComplete="email"
                              textContentType="emailAddress"
                              returnKeyType="next"
                              blurOnSubmit={false}
                              enablesReturnKeyAutomatically={true}
                              clearButtonMode="while-editing"
                              selectTextOnFocus={true}
                              keyboardType="email-address"
                            />
                          </LinearGradient>
                    </View>
                      )}

                      {/* Super Gen3 Action Buttons */}
                      {!isSignupMode ? (
                        <>
                          {/* Super Gen3 Login Button */}
                      <TouchableOpacity
                            style={styles.superGen3AuthLoginButton}
                            onPress={handleSubmit}
                            disabled={isLoading}
                            activeOpacity={0.8}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                            pressRetentionOffset={{ top: 30, bottom: 30, left: 30, right: 30 }}
                      >
                        <LinearGradient
                              colors={['#00D4FF', '#FF6B6B', '#FFD700', '#00FF88']}
                              style={styles.superGen3AuthLoginGradient}
                            >
                              <Ionicons name="rocket" size={quantumScale(24)} color="#fff" />
                              <Text style={styles.superGen3AuthLoginText}>
                                🚀 SUPER GEN3 NEURAL SYNC
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                          {/* Super Gen3 Forgot Password */}
                    <TouchableOpacity
                            style={styles.superGen3AuthForgotButton}
                            onPress={() => setShowForgotPasswordModal(true)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            pressRetentionOffset={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                      <LinearGradient
                              colors={['rgba(156,39,176,0.2)', 'rgba(0,255,136,0.2)']}
                              style={styles.superGen3AuthForgotGradient}
                            >
                              <Ionicons name="key" size={quantumScale(16)} color="rgba(255,255,255,0.8)" />
                              <Text style={styles.superGen3AuthForgotText}>🔐 Forgot Super Gen3 Password?</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                        </>
                      ) : (
                        <>
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

                          {/* Super Gen3 Signup Button */}
                  <TouchableOpacity
                            style={styles.superGen3AuthSignupButton}
                            onPress={handleSuperGen3Signup}
                            disabled={isLoading}
                            activeOpacity={0.8}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                            pressRetentionOffset={{ top: 30, bottom: 30, left: 30, right: 30 }}
                          >
                            <LinearGradient
                              colors={['#FF6B6B', '#00D4FF', '#FFD700', '#9C27B0']}
                              style={styles.superGen3AuthSignupGradient}
                            >
                              <Ionicons name="add-circle" size={quantumScale(24)} color="#fff" />
                              <Text style={styles.superGen3AuthSignupText}>
                                🌟 CREATE SUPER GEN3 CONSCIOUSNESS
                              </Text>
                            </LinearGradient>
                  </TouchableOpacity>
                        </>
                      )}
                    </View>

                    {/* Super Gen3 Mode Toggle */}
                  <TouchableOpacity
                      style={styles.superGen3AuthModeToggle}
                      onPress={toggleAuthMode}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      pressRetentionOffset={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                  <LinearGradient
                        colors={['rgba(0,255,136,0.2)', 'rgba(156,39,176,0.2)']}
                        style={styles.superGen3AuthModeToggleGradient}
                      >
                        <Ionicons 
                          name={isSignupMode ? "log-in" : "person-add"} 
                          size={quantumScale(16)} 
                          color="rgba(255,255,255,0.8)" 
                        />
                        <Text style={styles.superGen3AuthModeToggleText}>
                          {isSignupMode ? '🔐 Switch to Neural Sync' : '🌟 Switch to Consciousness Creation'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}

              {/* Super Gen3 Footer */}
              <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                <Text style={styles.footerText}>SUPER GEN3 • Quantum • Neural • Revolutionary</Text>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: quantumScale(20),
    paddingVertical: quantumScale(20),
  },
  header: {
    alignItems: 'center',
    marginBottom: quantumScale(40),
  },
  logoContainer: {
    marginBottom: quantumScale(20),
  },
  logoGradient: {
    width: quantumScale(80),
    height: quantumScale(80),
    borderRadius: quantumScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: quantumScale(32),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: quantumScale(8),
  },
  appVersion: {
    fontSize: quantumScale(18),
    color: '#00D4FF',
    fontWeight: 'bold',
    marginBottom: quantumScale(8),
  },
  tagline: {
    fontSize: quantumScale(16),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  
  // Super Gen3 Authentication Styles
  superGen3AuthContainer: {
    marginBottom: quantumScale(20),
  },
  superGen3AuthGradient: {
    borderRadius: quantumScale(16),
    padding: quantumScale(20),
    borderWidth: 2,
    borderColor: 'rgba(0,255,136,0.5)',
  },
  superGen3AuthTitle: {
    fontSize: quantumScale(28),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: quantumScale(8),
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: quantumScale(8),
  },
  superGen3AuthSubtitle: {
    fontSize: quantumScale(16),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: quantumScale(20),
    lineHeight: quantumScale(22),
  },
  superGen3AuthForm: {
    gap: quantumScale(16),
  },
  superGen3AuthInputContainer: {
    marginBottom: quantumScale(12),
  },
  superGen3AuthInputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: quantumScale(16),
    borderRadius: quantumScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: quantumScale(12),
  },
  superGen3AuthInput: {
    flex: 1,
    fontSize: quantumScale(16),
    color: '#fff',
    paddingVertical: quantumScale(8),
  },
  superGen3AuthEyeButton: {
    padding: quantumScale(4),
  },
  superGen3AuthLoginButton: {
    marginTop: quantumScale(8),
  },
  superGen3AuthLoginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: quantumScale(16),
    borderRadius: quantumScale(12),
    gap: quantumScale(12),
  },
  superGen3AuthLoginText: {
    fontSize: quantumScale(18),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  superGen3AuthForgotButton: {
    marginTop: quantumScale(12),
  },
  superGen3AuthForgotGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: quantumScale(12),
    borderRadius: quantumScale(8),
    gap: quantumScale(8),
  },
  superGen3AuthForgotText: {
    fontSize: quantumScale(14),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  superGen3AuthSignupButton: {
    marginTop: quantumScale(8),
  },
  superGen3AuthSignupGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: quantumScale(16),
    borderRadius: quantumScale(12),
    gap: quantumScale(12),
  },
  superGen3AuthSignupText: {
    fontSize: quantumScale(16),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  superGen3AuthModeToggle: {
    marginTop: quantumScale(16),
  },
  superGen3AuthModeToggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: quantumScale(12),
    borderRadius: quantumScale(8),
    gap: quantumScale(8),
  },
  superGen3AuthModeToggleText: {
    fontSize: quantumScale(14),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: quantumScale(40),
  },
  footerText: {
    fontSize: quantumScale(14),
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
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
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  ageVerificationText: {
    fontSize: quantumScale(14),
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    lineHeight: quantumScale(20),
  },
}); 