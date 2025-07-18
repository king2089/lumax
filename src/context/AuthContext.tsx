import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  verifyUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

// Test account credentials
const TEST_ACCOUNT = {
  email: 'test@luma.go',
  password: 'test123',
  user: {
    id: 'test-user-1',
    username: 'testuser',
    displayName: 'Test User',
    email: 'test@luma.go',
    avatar: 'https://via.placeholder.com/150/00C853/FFFFFF?text=TU',
    bio: 'This is a test account for Luma Go development',
    followers: [],
    following: [],
    posts: [],
    createdAt: new Date(),
    isVerified: true,
    isPrivate: false,
    isAgeVerified: true,
    blockedUsers: [],
    reportedUsers: [],
    contentPreferences: {
      allowNSFW: false,
      requireContentWarnings: true,
      blockedKeywords: [],
    },
    lumaCardBalance: 2500, // 💳 Luma Card signup bonus
  },
  token: 'test-token-123',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN', payload: { user, token } });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (user: User, token: string) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      dispatch({ type: 'LOGIN', payload: { user, token } });
    } catch (error) {
      console.error('Error storing auth data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to store authentication data' });
    }
  };

  const loginWithCredentials = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if it's the test account
      if (email === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
        await login(TEST_ACCOUNT.user, TEST_ACCOUNT.token);
      } else {
        // For any other credentials, create a mock user
        const mockUser: User = {
          id: Date.now().toString(),
          username: email.split('@')[0],
          displayName: email.split('@')[0],
          email: email,
          avatar: `https://via.placeholder.com/150/667eea/FFFFFF?text=${email.charAt(0).toUpperCase()}`,
          bio: 'Welcome to Luma Go!',
          followers: [],
          following: [],
          posts: [],
          createdAt: new Date(),
          isVerified: false,
          isPrivate: false,
          isAgeVerified: false,
          blockedUsers: [],
          reportedUsers: [],
          contentPreferences: {
            allowNSFW: false,
            requireContentWarnings: true,
            blockedKeywords: [],
          },
          lumaCardBalance: 2500, // 💳 Luma Card signup bonus
        };
        
        await login(mockUser, `mock-token-${Date.now()}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Login failed. Please try again.' });
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    AsyncStorage.setItem('userData', JSON.stringify(user)).catch(console.error);
  };

  const verifyUser = () => {
    if (state.user) {
      const verifiedUser = {
        ...state.user,
        isVerified: true,
      };
      updateUser(verifiedUser);
    }
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const value: AuthContextType = {
    ...state,
    login,
    loginWithCredentials,
    logout,
    updateUser,
    verifyUser,
    setLoading,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 