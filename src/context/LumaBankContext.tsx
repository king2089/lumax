import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

// Types for Luma Bank
export interface BankAccount {
  id: string;
  type: 'apple_pay' | 'google_pay' | 'bank_account' | 'paypal';
  name: string;
  last4?: string;
  isDefault: boolean;
  isVerified: boolean;
  addedDate: Date;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payout' | 'bonus' | 'purchase' | 'refund';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  reference?: string;
  fee?: number;
  netAmount?: number;
  createdAt: string; // Add this for compatibility
}

export interface PayoutRequest {
  id: string;
  amount: number;
  method: 'apple_pay' | 'google_pay' | 'bank_account' | 'paypal';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  fee: number;
  netAmount: number;
  reference?: string;
  createdAt: string; // Add this for compatibility
}

export interface WelcomeBonus {
  id: string;
  amount: number;
  status: 'pending' | 'claimed' | 'expired';
  claimed: boolean; // Add this property
  claimedAt?: Date;
  expiresAt: Date;
  requirements: string[];
}

// Payment Method interface for compatibility
export interface PaymentMethod {
  id: string;
  type: 'apple_pay' | 'google_pay' | 'card';
  lastFour?: string;
  brand?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

interface LumaBankState {
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalPayouts: number;
  
  // Accounts and Transactions
  linkedAccounts: BankAccount[];
  transactions: Transaction[];
  payoutHistory: PayoutRequest[];
  
  // Welcome Bonus
  welcomeBonus: WelcomeBonus | null;
  hasClaimedWelcomeBonus: boolean;
  
  // Real-time features
  isProcessingPayout: boolean;
  lastPayoutDate?: Date;
  nextPayoutDate?: Date;
  
  // Settings
  autoPayoutEnabled: boolean;
  autoPayoutThreshold: number;
  payoutMethod: 'apple_pay' | 'google_pay' | 'bank_account' | 'paypal';
}

interface LumaBankContextType extends LumaBankState {
  // Account Management
  linkApplePay: () => Promise<boolean>;
  linkGooglePay: () => Promise<boolean>;
  linkBankAccount: (accountNumber: string, routingNumber: string) => Promise<boolean>;
  linkPayPal: (email: string) => Promise<boolean>;
  removeAccount: (accountId: string) => Promise<boolean>;
  setDefaultAccount: (accountId: string) => Promise<boolean>;
  
  // New methods for compatibility
  linkAccount: (type: 'apple_pay' | 'google_pay') => Promise<boolean>;
  unlinkAccount: (accountId: string) => Promise<boolean>;
  
  // Payout Operations
  requestPayout: (amount: number, method: 'apple_pay' | 'google_pay' | 'bank_account' | 'paypal') => Promise<boolean>;
  cancelPayout: (payoutId: string) => Promise<boolean>;
  getPayoutStatus: (payoutId: string) => Promise<PayoutRequest | null>;
  
  // Welcome Bonus
  claimWelcomeBonus: () => Promise<boolean>;
  checkWelcomeBonusEligibility: () => boolean;
  
  // Balance Management
  addFunds: (amount: number, source: string) => Promise<boolean>;
  deductFunds: (amount: number, reason: string) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  refreshData: () => Promise<void>; // Add this method
  
  // Settings
  toggleAutoPayout: () => Promise<boolean>;
  setAutoPayoutThreshold: (threshold: number) => Promise<boolean>;
  setPayoutMethod: (method: 'apple_pay' | 'google_pay' | 'bank_account' | 'paypal') => Promise<boolean>;
  
  // Analytics
  getTransactionHistory: (days?: number) => Transaction[];
  getEarningsAnalytics: () => Promise<any>;
  
  // Real-time updates
  isLoading: boolean;
  error: string | null;
  
  // Compatibility properties
  payouts: PayoutRequest[]; // Alias for payoutHistory
  paymentMethods: PaymentMethod[]; // Convert from linkedAccounts
}

const LumaBankContext = createContext<LumaBankContextType | undefined>(undefined);

interface LumaBankProviderProps {
  children: ReactNode;
}

// Mock API endpoints - In production, replace with real API
const API_BASE_URL = 'https://api.lumabank.com/v1';

export const LumaBankProvider: React.FC<LumaBankProviderProps> = ({ children }) => {
  const { user, updateUser } = useAuth();
  
  const [state, setState] = useState<LumaBankState>({
    balance: 0,
    availableBalance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalPayouts: 0,
    linkedAccounts: [],
    transactions: [],
    payoutHistory: [],
    welcomeBonus: null,
    hasClaimedWelcomeBonus: false,
    isProcessingPayout: false,
    autoPayoutEnabled: false,
    autoPayoutThreshold: 100,
    payoutMethod: 'apple_pay',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize bank data
  useEffect(() => {
    if (user) {
      initializeBankData();
    }
  }, [user]);

  const initializeBankData = async () => {
    try {
      setIsLoading(true);
      
      // Initialize with user's Luma Card balance
      const initialBalance = user?.lumaCardBalance || 0;
      
      // Create welcome bonus if user is new
      const welcomeBonus: WelcomeBonus = {
        id: 'welcome_bonus_2024',
        amount: 2500,
        status: 'pending',
        claimed: false, // Add this property
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        requirements: ['Complete profile setup', 'Verify email address'],
      };

      setState(prev => ({
        ...prev,
        balance: initialBalance,
        availableBalance: initialBalance,
        welcomeBonus,
        hasClaimedWelcomeBonus: false,
      }));

      // Load stored bank data
      await loadStoredBankData();
      
    } catch (err) {
      console.error('Failed to initialize bank data:', err);
      setError('Failed to load bank data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStoredBankData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('lumaBankData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setState(prev => ({
          ...prev,
          ...parsedData,
          // Ensure dates are properly parsed
          transactions: parsedData.transactions?.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp),
            createdAt: t.createdAt || new Date(t.timestamp).toISOString(), // Add createdAt
          })) || [],
          payoutHistory: parsedData.payoutHistory?.map((p: any) => ({
            ...p,
            requestedAt: new Date(p.requestedAt),
            completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
            createdAt: p.createdAt || new Date(p.requestedAt).toISOString(), // Add createdAt
          })) || [],
          linkedAccounts: parsedData.linkedAccounts?.map((a: any) => ({
            ...a,
            addedDate: new Date(a.addedDate),
          })) || [],
          welcomeBonus: parsedData.welcomeBonus ? {
            ...parsedData.welcomeBonus,
            expiresAt: new Date(parsedData.welcomeBonus.expiresAt),
            claimedAt: parsedData.welcomeBonus.claimedAt ? new Date(parsedData.welcomeBonus.claimedAt) : undefined,
            claimed: parsedData.welcomeBonus.claimed || false, // Ensure claimed property exists
          } : null,
        }));
      }
    } catch (err) {
      console.error('Failed to load stored bank data:', err);
    }
  };

  const saveBankData = async (newState: Partial<LumaBankState>) => {
    try {
      const updatedState = { ...state, ...newState };
      await AsyncStorage.setItem('lumaBankData', JSON.stringify(updatedState));
      setState(updatedState);
    } catch (err) {
      console.error('Failed to save bank data:', err);
    }
  };

  // New methods for compatibility
  const linkAccount = async (type: 'apple_pay' | 'google_pay'): Promise<boolean> => {
    if (type === 'apple_pay') {
      return await linkApplePay();
    } else {
      return await linkGooglePay();
    }
  };

  const unlinkAccount = async (accountId: string): Promise<boolean> => {
    return await removeAccount(accountId);
  };

  const refreshData = async (): Promise<void> => {
    await refreshBalance();
  };

  // Convert linkedAccounts to paymentMethods for compatibility
  const getPaymentMethods = (): PaymentMethod[] => {
    return state.linkedAccounts.map(account => ({
      id: account.id,
      type: account.type === 'apple_pay' ? 'apple_pay' : 'google_pay',
      lastFour: account.last4,
      brand: account.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay',
      isDefault: account.isDefault,
      isActive: account.isVerified,
      createdAt: account.addedDate.toISOString(),
    }));
  };

  const linkApplePay = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate Apple Pay linking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAccount: BankAccount = {
        id: `apple_pay_${Date.now()}`,
        type: 'apple_pay',
        name: 'Apple Pay',
        isDefault: state.linkedAccounts.length === 0,
        isVerified: true,
        addedDate: new Date(),
      };

      await saveBankData({
        linkedAccounts: [...state.linkedAccounts, newAccount],
      });

      Alert.alert('Success', 'Apple Pay account linked successfully!');
      return true;
    } catch (err) {
      console.error('Failed to link Apple Pay:', err);
      Alert.alert('Error', 'Failed to link Apple Pay account');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const linkGooglePay = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate Google Pay linking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAccount: BankAccount = {
        id: `google_pay_${Date.now()}`,
        type: 'google_pay',
        name: 'Google Pay',
        isDefault: state.linkedAccounts.length === 0,
        isVerified: true,
        addedDate: new Date(),
      };

      await saveBankData({
        linkedAccounts: [...state.linkedAccounts, newAccount],
      });

      Alert.alert('Success', 'Google Pay account linked successfully!');
      return true;
    } catch (err) {
      console.error('Failed to link Google Pay:', err);
      Alert.alert('Error', 'Failed to link Google Pay account');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const linkBankAccount = async (accountNumber: string, routingNumber: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate bank account linking process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newAccount: BankAccount = {
        id: `bank_${Date.now()}`,
        type: 'bank_account',
        name: 'Bank Account',
        last4: accountNumber.slice(-4),
        isDefault: state.linkedAccounts.length === 0,
        isVerified: true,
        addedDate: new Date(),
      };

      await saveBankData({
        linkedAccounts: [...state.linkedAccounts, newAccount],
      });

      Alert.alert('Success', 'Bank account linked successfully!');
      return true;
    } catch (err) {
      console.error('Failed to link bank account:', err);
      Alert.alert('Error', 'Failed to link bank account');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const linkPayPal = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate PayPal linking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAccount: BankAccount = {
        id: `paypal_${Date.now()}`,
        type: 'paypal',
        name: 'PayPal',
        isDefault: state.linkedAccounts.length === 0,
        isVerified: true,
        addedDate: new Date(),
      };

      await saveBankData({
        linkedAccounts: [...state.linkedAccounts, newAccount],
      });

      Alert.alert('Success', 'PayPal account linked successfully!');
      return true;
    } catch (err) {
      console.error('Failed to link PayPal:', err);
      Alert.alert('Error', 'Failed to link PayPal account');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAccount = async (accountId: string): Promise<boolean> => {
    try {
      const updatedAccounts = state.linkedAccounts.filter(account => account.id !== accountId);
      await saveBankData({ linkedAccounts: updatedAccounts });
      Alert.alert('Success', 'Account removed successfully');
      return true;
    } catch (err) {
      console.error('Failed to remove account:', err);
      Alert.alert('Error', 'Failed to remove account');
      return false;
    }
  };

  const setDefaultAccount = async (accountId: string): Promise<boolean> => {
    try {
      const updatedAccounts = state.linkedAccounts.map(account => ({
        ...account,
        isDefault: account.id === accountId,
      }));
      await saveBankData({ linkedAccounts: updatedAccounts });
      return true;
    } catch (err) {
      console.error('Failed to set default account:', err);
      return false;
    }
  };

  const requestPayout = async (amount: number, method: 'apple_pay' | 'google_pay' | 'bank_account' | 'paypal'): Promise<boolean> => {
    try {
      if (amount <= 0) {
        Alert.alert('Error', 'Invalid payout amount');
        return false;
      }

      if (amount > state.availableBalance) {
        Alert.alert('Error', 'Insufficient balance for payout');
        return false;
      }

      if (state.linkedAccounts.length === 0) {
        Alert.alert('Error', 'No linked accounts found. Please link an account first.');
        return false;
      }

      setIsLoading(true);
      setState(prev => ({ ...prev, isProcessingPayout: true }));

      // Calculate fees (2.9% + $0.30)
      const fee = Math.max(0.30, amount * 0.029);
      const netAmount = amount - fee;

      // Simulate payout processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const payoutRequest: PayoutRequest = {
        id: `payout_${Date.now()}`,
        amount,
        method,
        status: 'processing',
        requestedAt: new Date(),
        fee,
        netAmount,
        reference: `REF${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      // Add transaction record
      const transaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'payout',
        amount: -amount,
        description: `Payout to ${method.replace('_', ' ')}`,
        status: 'pending',
        timestamp: new Date(),
        reference: payoutRequest.reference,
        fee,
        netAmount: -netAmount,
        createdAt: new Date().toISOString(),
      };

      await saveBankData({
        balance: state.balance - amount,
        availableBalance: state.availableBalance - amount,
        payoutHistory: [...state.payoutHistory, payoutRequest],
        transactions: [...state.transactions, transaction],
        totalPayouts: state.totalPayouts + amount,
        isProcessingPayout: false,
      });

      Alert.alert(
        'Payout Requested',
        `Your payout of ${amount.toFixed(2)} has been submitted.\n\nNet amount: ${netAmount.toFixed(2)}\nFee: ${fee.toFixed(2)}\n\nYou will receive the funds within 1-3 business days.`
      );

      return true;
    } catch (err) {
      console.error('Failed to request payout:', err);
      Alert.alert('Error', 'Failed to request payout. Please try again.');
      setState(prev => ({ ...prev, isProcessingPayout: false }));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPayout = async (payoutId: string): Promise<boolean> => {
    try {
      const payout = state.payoutHistory.find(p => p.id === payoutId);
      if (!payout || payout.status !== 'pending') {
        Alert.alert('Error', 'Payout cannot be cancelled');
        return false;
      }

      // Update payout status
      const updatedPayouts = state.payoutHistory.map(p =>
        p.id === payoutId ? { ...p, status: 'cancelled' as const } : p
      );

      // Refund the amount
      const refundTransaction: Transaction = {
        id: `refund_${Date.now()}`,
        type: 'refund',
        amount: payout.amount,
        description: `Payout cancellation refund`,
        status: 'completed',
        timestamp: new Date(),
        reference: payout.reference,
        createdAt: new Date().toISOString(),
      };

      await saveBankData({
        balance: state.balance + payout.amount,
        availableBalance: state.availableBalance + payout.amount,
        payoutHistory: updatedPayouts,
        transactions: [...state.transactions, refundTransaction],
      });

      Alert.alert('Success', 'Payout cancelled and amount refunded');
      return true;
    } catch (err) {
      console.error('Failed to cancel payout:', err);
      Alert.alert('Error', 'Failed to cancel payout');
      return false;
    }
  };

  const getPayoutStatus = async (payoutId: string): Promise<PayoutRequest | null> => {
    return state.payoutHistory.find(p => p.id === payoutId) || null;
  };

  const claimWelcomeBonus = async (): Promise<boolean> => {
    try {
      if (!state.welcomeBonus || state.welcomeBonus.claimed) {
        Alert.alert('Error', 'Welcome bonus not available or already claimed');
        return false;
      }

      setIsLoading(true);

      // Simulate bonus claiming process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const bonusTransaction: Transaction = {
        id: `bonus_${Date.now()}`,
        type: 'bonus',
        amount: state.welcomeBonus.amount,
        description: 'Welcome Bonus',
        status: 'completed',
        timestamp: new Date(),
        reference: `BONUS${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      const updatedWelcomeBonus: WelcomeBonus = {
        ...state.welcomeBonus,
        status: 'claimed',
        claimed: true,
        claimedAt: new Date(),
      };

      await saveBankData({
        balance: state.balance + state.welcomeBonus.amount,
        availableBalance: state.availableBalance + state.welcomeBonus.amount,
        welcomeBonus: updatedWelcomeBonus,
        hasClaimedWelcomeBonus: true,
        transactions: [...state.transactions, bonusTransaction],
        totalEarned: state.totalEarned + state.welcomeBonus.amount,
      });

      // Update user's Luma Card balance
      if (user) {
        const updatedUser = {
          ...user,
          lumaCardBalance: (user.lumaCardBalance || 0) + state.welcomeBonus.amount,
        };
        updateUser(updatedUser);
      }

      Alert.alert('🎉 Welcome Bonus Claimed!', `Your $${state.welcomeBonus.amount.toFixed(2)} welcome bonus has been added to your balance!`);
      return true;
    } catch (err) {
      console.error('Failed to claim welcome bonus:', err);
      Alert.alert('Error', 'Failed to claim welcome bonus');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkWelcomeBonusEligibility = (): boolean => {
    return !!(state.welcomeBonus && !state.welcomeBonus.claimed && state.welcomeBonus.status === 'pending');
  };

  const addFunds = async (amount: number, source: string): Promise<boolean> => {
    try {
      const transaction: Transaction = {
        id: `deposit_${Date.now()}`,
        type: 'deposit',
        amount,
        description: `Deposit from ${source}`,
        status: 'completed',
        timestamp: new Date(),
        reference: `DEP${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      await saveBankData({
        balance: state.balance + amount,
        availableBalance: state.availableBalance + amount,
        transactions: [...state.transactions, transaction],
        totalEarned: state.totalEarned + amount,
      });

      return true;
    } catch (err) {
      console.error('Failed to add funds:', err);
      return false;
    }
  };

  const deductFunds = async (amount: number, reason: string): Promise<boolean> => {
    try {
      if (amount > state.availableBalance) {
        return false;
      }

      const transaction: Transaction = {
        id: `deduction_${Date.now()}`,
        type: 'withdrawal',
        amount: -amount,
        description: reason,
        status: 'completed',
        timestamp: new Date(),
        reference: `DED${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      await saveBankData({
        balance: state.balance - amount,
        availableBalance: state.availableBalance - amount,
        transactions: [...state.transactions, transaction],
      });

      return true;
    } catch (err) {
      console.error('Failed to deduct funds:', err);
      return false;
    }
  };

  const refreshBalance = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate balance refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would fetch the latest balance from the server
      console.log('Balance refreshed');
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoPayout = async (): Promise<boolean> => {
    try {
      await saveBankData({
        autoPayoutEnabled: !state.autoPayoutEnabled,
      });
      return true;
    } catch (err) {
      console.error('Failed to toggle auto payout:', err);
      return false;
    }
  };

  const setAutoPayoutThreshold = async (threshold: number): Promise<boolean> => {
    try {
      await saveBankData({
        autoPayoutThreshold: threshold,
      });
      return true;
    } catch (err) {
      console.error('Failed to set auto payout threshold:', err);
      return false;
    }
  };

  const setPayoutMethod = async (method: 'apple_pay' | 'google_pay' | 'bank_account' | 'paypal'): Promise<boolean> => {
    try {
      await saveBankData({
        payoutMethod: method,
      });
      return true;
    } catch (err) {
      console.error('Failed to set payout method:', err);
      return false;
    }
  };

  const getTransactionHistory = (days: number = 30): Transaction[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return state.transactions.filter(transaction => 
      transaction.timestamp >= cutoffDate
    );
  };

  const getEarningsAnalytics = async (): Promise<any> => {
    // Simulate analytics data
    return {
      totalEarned: state.totalEarned,
      totalPayouts: state.totalPayouts,
      currentBalance: state.balance,
      monthlyEarnings: state.transactions
        .filter(t => t.type === 'bonus' || t.type === 'deposit')
        .reduce((sum, t) => sum + Math.max(0, t.amount), 0),
      averagePayout: state.payoutHistory.length > 0 
        ? state.payoutHistory.reduce((sum, p) => sum + p.amount, 0) / state.payoutHistory.length 
        : 0,
    };
  };

  const contextValue: LumaBankContextType = {
    ...state,
    linkApplePay,
    linkGooglePay,
    linkBankAccount,
    linkPayPal,
    removeAccount,
    setDefaultAccount,
    linkAccount, // New method
    unlinkAccount, // New method
    requestPayout,
    cancelPayout,
    getPayoutStatus,
    claimWelcomeBonus,
    checkWelcomeBonusEligibility,
    addFunds,
    deductFunds,
    refreshBalance,
    refreshData, // New method
    toggleAutoPayout,
    setAutoPayoutThreshold,
    setPayoutMethod,
    getTransactionHistory,
    getEarningsAnalytics,
    isLoading,
    error,
    payouts: state.payoutHistory, // Alias for compatibility
    paymentMethods: getPaymentMethods(), // Convert for compatibility
  };

  return (
    <LumaBankContext.Provider value={contextValue}>
      {children}
    </LumaBankContext.Provider>
  );
};

export const useLumaBank = (): LumaBankContextType => {
  const context = useContext(LumaBankContext);
  if (context === undefined) {
    throw new Error('useLumaBank must be used within a LumaBankProvider');
  }
  return context;
}; 