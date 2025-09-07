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

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Enhanced validation
    if (email.trim().length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      console.log('✅ Gen4 login successful');
      // Success animation or feedback could be added here
    } catch (error) {
      console.error('❌ Login error:', error);
      let errorMessage = 'Invalid credentials. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    // Quick login with default credentials for testing
    setEmail('Luma');
    setPassword('Kendall15');
    setIsLoading(true);
    
    try {
      await login('Luma', 'Kendall15');
      console.log('✅ Gen4 quick login successful');
    } catch (error) {
      console.error('❌ Quick login error:', error);
      Alert.alert('Quick Login Error', 'Failed to login with default credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    (navigation as any).goBack();
  };

  const handleRegister = () => {
    (navigation as any).navigate('Register');
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

        {/* Gen4 Login Content */}
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
            <Text style={styles.title}>🚀 Welcome to Gen4</Text>
            <Text style={styles.subtitle}>Access your Quantum Experience</Text>
          </View>

          {/* Gen4 Login Form */}
          <View style={styles.formContainer}>
            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  transform: [
                    { translateY: popOutAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5]
                    })}
                  ]
                }
              ]}
            >
              <Ionicons name="mail" size={quantumScale(20)} color="#FF5722" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Animated.View>

            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  transform: [
                    { translateY: popOutAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5]
                    })}
                  ]
                }
              ]}
            >
              <Ionicons name="lock-closed" size={quantumScale(20)} color="#E64A19" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </Animated.View>

            {/* Gen4 Login Button */}
            <Animated.View
              style={{
                transform: [
                  { translateY: popOutAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8]
                  })}
                ]
              }}
            >
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF5722', '#E64A19', '#D84315']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? '🚀 Launching Gen4...' : '🚀 Launch Gen4'}
                  </Text>
                  <Ionicons name="rocket" size={quantumScale(24)} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Gen4 Quick Login Button - Developer Only */}
            {__DEV__ && (
              <Animated.View
                style={{
                  transform: [
                    { translateY: popOutAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -6]
                    })}
                  ]
                }}
              >
                <TouchableOpacity 
                  style={styles.quickLoginButton}
                  onPress={handleQuickLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(255,87,34,0.2)', 'rgba(255,87,34,0.1)']}
                    style={styles.quickLoginButtonGradient}
                  >
                    <Text style={styles.quickLoginButtonText}>
                      Quick Launch (Demo) - Dev Only
                    </Text>
                    <Ionicons name="flash" size={quantumScale(16)} color="#FF5722" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Register Link */}
            <TouchableOpacity 
              style={styles.registerLink}
              onPress={handleRegister}
            >
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerTextBold}>Register</Text>
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
    width: '100%',
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
    marginBottom: quantumScale(50),
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
    marginBottom: quantumScale(50),
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
  // Login Button
  loginButton: {
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
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: quantumScale(16),
    paddingHorizontal: quantumScale(32),
    gap: quantumScale(12),
  },
  loginButtonText: {
    fontSize: quantumScale(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  // Quick Login Button
  quickLoginButton: {
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
  quickLoginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: quantumScale(16),
    paddingHorizontal: quantumScale(32),
    gap: quantumScale(12),
  },
  quickLoginButtonText: {
    fontSize: quantumScale(16),
    fontWeight: 'bold',
    color: '#FF5722',
  },
  // Register Link
  registerLink: {
    alignItems: 'center',
    marginBottom: quantumScale(30),
  },
  registerText: {
    fontSize: quantumScale(16),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  registerTextBold: {
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
});

export default LoginScreen;
