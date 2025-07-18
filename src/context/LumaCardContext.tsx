import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

// Types for Luma Card
export interface CardTransaction {
  id: string;
  type: 'purchase' | 'refund' | 'cashback' | 'fee' | 'bonus';
  amount: number;
  description: string;
  merchant: string;
  category: 'food' | 'shopping' | 'entertainment' | 'transport' | 'utilities' | 'other';
  location?: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  cardId: string;
}

export interface CardReward {
  id: string;
  type: 'cashback' | 'points' | 'bonus';
  amount: number;
  description: string;
  earnedAt: Date;
  expiresAt?: Date;
  isRedeemed: boolean;
  redeemedAt?: Date;
}

export interface CardAccount {
  id: string;
  cardNumber: string;
  cardType: 'virtual' | 'physical';
  status: 'active' | 'frozen' | 'expired';
  creditLimit: number;
  availableCredit: number;
  currentBalance: number;
  paymentDueDate: Date;
  minimumPayment: number;
  apr: number;
  rewardsRate: number;
  issuedDate: Date;
  expiryDate: Date;
  isDefault: boolean;
}

export interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface LumaCardState {
  // Card Accounts
  cards: CardAccount[];
  activeCard: CardAccount | null;
  
  // Transactions and Spending
  transactions: CardTransaction[];
  monthlySpending: number;
  spendingByCategory: SpendingCategory[];
  
  // Rewards
  rewards: CardReward[];
  totalRewardsEarned: number;
  availableRewards: number;
  
  // Account Status
  creditScore: number;
  paymentHistory: any[];
  isCardLocked: boolean;
  
  // Settings
  notifications: {
    transactions: boolean;
    payments: boolean;
    rewards: boolean;
    fraud: boolean;
  };
}

interface LumaCardContextType extends LumaCardState {
  // Card Management
  createCard: (type: 'virtual' | 'physical') => Promise<CardAccount>;
  freezeCard: (cardId: string) => Promise<boolean>;
  unfreezeCard: (cardId: string) => Promise<boolean>;
  setDefaultCard: (cardId: string) => Promise<boolean>;
  reportLostCard: (cardId: string) => Promise<boolean>;
  
  // Transactions
  addTransaction: (transaction: Omit<CardTransaction, 'id' | 'timestamp' | 'status'>) => Promise<boolean>;
  getTransactionHistory: (days?: number) => CardTransaction[];
  getSpendingAnalytics: () => Promise<any>;
  
  // Rewards
  earnRewards: (amount: number, type: 'cashback' | 'points' | 'bonus') => Promise<boolean>;
  redeemRewards: (rewardId: string) => Promise<boolean>;
  getRewardsHistory: () => CardReward[];
  
  // Payments
  makePayment: (amount: number, cardId: string) => Promise<boolean>;
  schedulePayment: (amount: number, date: Date, cardId: string) => Promise<boolean>;
  getPaymentHistory: () => Promise<any[]>;
  
  // Account Management
  updateCreditLimit: (newLimit: number) => Promise<boolean>;
  updateNotifications: (settings: Partial<LumaCardState['notifications']>) => Promise<boolean>;
  getCreditScore: () => Promise<number>;
  
  // Real-time updates
  isLoading: boolean;
  error: string | null;
  refreshCardData: () => Promise<void>;
}

const LumaCardContext = createContext<LumaCardContextType | undefined>(undefined);

interface LumaCardProviderProps {
  children: ReactNode;
}

// Mock API endpoints - In production, replace with real API
const API_BASE_URL = 'https://api.lumacard.com/v1';

export const LumaCardProvider: React.FC<LumaCardProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  const [state, setState] = useState<LumaCardState>({
    cards: [],
    activeCard: null,
    transactions: [],
    monthlySpending: 0,
    spendingByCategory: [],
    rewards: [],
    totalRewardsEarned: 0,
    availableRewards: 0,
    creditScore: 750,
    paymentHistory: [],
    isCardLocked: false,
    notifications: {
      transactions: true,
      payments: true,
      rewards: true,
      fraud: true,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize card data
  useEffect(() => {
    if (user) {
      initializeCardData();
    }
  }, [user]);

  const initializeCardData = async () => {
    try {
      setIsLoading(true);
      
      // Create default virtual card for new users
      const defaultCard: CardAccount = {
        id: 'card_001',
        cardNumber: '**** **** **** 1234',
        cardType: 'virtual',
        status: 'active',
        creditLimit: 10000,
        availableCredit: 10000,
        currentBalance: 0,
        paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        minimumPayment: 0,
        apr: 15.99,
        rewardsRate: 0.02, // 2% cashback
        issuedDate: new Date(),
        expiryDate: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000), // 4 years from now
        isDefault: true,
      };

      setState(prev => ({
        ...prev,
        cards: [defaultCard],
        activeCard: defaultCard,
      }));

      // Load stored card data
      await loadStoredCardData();
      
    } catch (err) {
      console.error('Failed to initialize card data:', err);
      setError('Failed to load card data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStoredCardData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('lumaCardData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setState(prev => ({
          ...prev,
          ...parsedData,
          // Ensure dates are properly parsed
          transactions: parsedData.transactions?.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp),
          })) || [],
          rewards: parsedData.rewards?.map((r: any) => ({
            ...r,
            earnedAt: new Date(r.earnedAt),
            expiresAt: r.expiresAt ? new Date(r.expiresAt) : undefined,
            redeemedAt: r.redeemedAt ? new Date(r.redeemedAt) : undefined,
          })) || [],
          cards: parsedData.cards?.map((c: any) => ({
            ...c,
            paymentDueDate: new Date(c.paymentDueDate),
            issuedDate: new Date(c.issuedDate),
            expiryDate: new Date(c.expiryDate),
          })) || [],
        }));
      }
    } catch (err) {
      console.error('Failed to load stored card data:', err);
    }
  };

  const saveCardData = async (newState: Partial<LumaCardState>) => {
    try {
      const updatedState = { ...state, ...newState };
      await AsyncStorage.setItem('lumaCardData', JSON.stringify(updatedState));
      setState(updatedState);
    } catch (err) {
      console.error('Failed to save card data:', err);
    }
  };

  // Card Management
  const createCard = async (type: 'virtual' | 'physical'): Promise<CardAccount> => {
    try {
      setIsLoading(true);
      
      // Simulate card creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCard: CardAccount = {
        id: `card_${Date.now()}`,
        cardNumber: `**** **** **** ${Math.floor(Math.random() * 9000) + 1000}`,
        cardType: type,
        status: 'active',
        creditLimit: 5000,
        availableCredit: 5000,
        currentBalance: 0,
        paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        minimumPayment: 0,
        apr: 16.99,
        rewardsRate: 0.015, // 1.5% cashback
        issuedDate: new Date(),
        expiryDate: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000),
        isDefault: false,
      };

      const updatedCards = [...state.cards, newCard];
      await saveCardData({ cards: updatedCards });
      
      Alert.alert('✅ Card Created', `${type === 'virtual' ? 'Virtual' : 'Physical'} card has been created successfully!`);
      return newCard;
    } catch (err) {
      setError('Failed to create card');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const freezeCard = async (cardId: string): Promise<boolean> => {
    try {
      const updatedCards = state.cards.map(card => 
        card.id === cardId ? { ...card, status: 'frozen' as const } : card
      );
      await saveCardData({ cards: updatedCards });
      Alert.alert('✅ Card Frozen', 'Your card has been frozen for security.');
      return true;
    } catch (err) {
      setError('Failed to freeze card');
      return false;
    }
  };

  const unfreezeCard = async (cardId: string): Promise<boolean> => {
    try {
      const updatedCards = state.cards.map(card => 
        card.id === cardId ? { ...card, status: 'active' as const } : card
      );
      await saveCardData({ cards: updatedCards });
      Alert.alert('✅ Card Unfrozen', 'Your card has been reactivated.');
      return true;
    } catch (err) {
      setError('Failed to unfreeze card');
      return false;
    }
  };

  const setDefaultCard = async (cardId: string): Promise<boolean> => {
    try {
      const updatedCards = state.cards.map(card => ({
        ...card,
        isDefault: card.id === cardId,
      }));
      await saveCardData({ cards: updatedCards });
      return true;
    } catch (err) {
      setError('Failed to set default card');
      return false;
    }
  };

  const reportLostCard = async (cardId: string): Promise<boolean> => {
    try {
      // Create replacement card
      const oldCard = state.cards.find(c => c.id === cardId);
      if (!oldCard) return false;

      const replacementCard: CardAccount = {
        ...oldCard,
        id: `card_${Date.now()}`,
        cardNumber: `**** **** **** ${Math.floor(Math.random() * 9000) + 1000}`,
        issuedDate: new Date(),
        expiryDate: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000),
      };

      const updatedCards = state.cards.map(card => 
        card.id === cardId ? { ...card, status: 'expired' as const } : card
      );
      
      await saveCardData({ 
        cards: [...updatedCards, replacementCard],
        activeCard: replacementCard,
      });
      
      Alert.alert('✅ Card Reported', 'Your lost card has been reported and a replacement is being issued.');
      return true;
    } catch (err) {
      setError('Failed to report lost card');
      return false;
    }
  };

  // Transactions
  const addTransaction = async (transaction: Omit<CardTransaction, 'id' | 'timestamp' | 'status'>): Promise<boolean> => {
    try {
      const newTransaction: CardTransaction = {
        ...transaction,
        id: `tx_${Date.now()}`,
        timestamp: new Date(),
        status: 'completed',
      };

      const updatedTransactions = [newTransaction, ...state.transactions];
      const updatedCards = state.cards.map(card => 
        card.id === transaction.cardId 
          ? { 
              ...card, 
              currentBalance: card.currentBalance + transaction.amount,
              availableCredit: card.availableCredit - transaction.amount,
            }
          : card
      );

      await saveCardData({ 
        transactions: updatedTransactions,
        cards: updatedCards,
      });

      // Earn rewards
      if (transaction.amount > 0) {
        const card = state.cards.find(c => c.id === transaction.cardId);
        if (card) {
          const rewardAmount = transaction.amount * card.rewardsRate;
          await earnRewards(rewardAmount, 'cashback');
        }
      }

      return true;
    } catch (err) {
      setError('Failed to add transaction');
      return false;
    }
  };

  const getTransactionHistory = (days: number = 30): CardTransaction[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return state.transactions.filter(transaction => 
      transaction.timestamp >= cutoffDate
    );
  };

  const getSpendingAnalytics = async (): Promise<any> => {
    try {
      const recentTransactions = getTransactionHistory(30);
      const spendingByCategory = recentTransactions.reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = { amount: 0, count: 0 };
        }
        acc[category].amount += Math.abs(transaction.amount);
        acc[category].count += 1;
        return acc;
      }, {} as Record<string, { amount: number; count: number }>);

      const totalSpending = Object.values(spendingByCategory).reduce((sum, cat) => sum + cat.amount, 0);

      return {
        totalSpending,
        spendingByCategory: Object.entries(spendingByCategory).map(([category, data]) => ({
          category,
          amount: data.amount,
          percentage: totalSpending > 0 ? (data.amount / totalSpending) * 100 : 0,
          count: data.count,
        })),
        averageTransaction: recentTransactions.length > 0 
          ? recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / recentTransactions.length 
          : 0,
      };
    } catch (err) {
      console.error('Failed to get spending analytics:', err);
      return null;
    }
  };

  // Rewards
  const earnRewards = async (amount: number, type: 'cashback' | 'points' | 'bonus'): Promise<boolean> => {
    try {
      const newReward: CardReward = {
        id: `reward_${Date.now()}`,
        type,
        amount,
        description: `${type === 'cashback' ? 'Cashback' : type === 'points' ? 'Points' : 'Bonus'} earned`,
        earnedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isRedeemed: false,
      };

      const updatedRewards = [newReward, ...state.rewards];
      const totalEarned = state.totalRewardsEarned + amount;
      const available = state.availableRewards + amount;

      await saveCardData({
        rewards: updatedRewards,
        totalRewardsEarned: totalEarned,
        availableRewards: available,
      });

      return true;
    } catch (err) {
      setError('Failed to earn rewards');
      return false;
    }
  };

  const redeemRewards = async (rewardId: string): Promise<boolean> => {
    try {
      const reward = state.rewards.find(r => r.id === rewardId);
      if (!reward || reward.isRedeemed) {
        Alert.alert('Cannot Redeem', 'This reward cannot be redeemed.');
        return false;
      }

      const updatedRewards = state.rewards.map(r => 
        r.id === rewardId 
          ? { ...r, isRedeemed: true, redeemedAt: new Date() }
          : r
      );

      const available = state.availableRewards - reward.amount;

      await saveCardData({
        rewards: updatedRewards,
        availableRewards: available,
      });

      Alert.alert('✅ Rewards Redeemed', `$${reward.amount.toFixed(2)} has been added to your balance.`);
      return true;
    } catch (err) {
      setError('Failed to redeem rewards');
      return false;
    }
  };

  const getRewardsHistory = (): CardReward[] => {
    return state.rewards;
  };

  // Payments
  const makePayment = async (amount: number, cardId: string): Promise<boolean> => {
    try {
      const card = state.cards.find(c => c.id === cardId);
      if (!card) return false;

      if (amount > card.currentBalance) {
        Alert.alert('Invalid Amount', 'Payment amount cannot exceed current balance.');
        return false;
      }

      const updatedCards = state.cards.map(c => 
        c.id === cardId 
          ? { 
              ...c, 
              currentBalance: c.currentBalance - amount,
              availableCredit: c.availableCredit + amount,
            }
          : c
      );

      const paymentTransaction: CardTransaction = {
        id: `tx_${Date.now()}`,
        type: 'refund',
        amount: -amount,
        description: 'Payment received',
        merchant: 'Luma Card',
        category: 'other',
        timestamp: new Date(),
        status: 'completed',
        cardId,
      };

      const updatedTransactions = [paymentTransaction, ...state.transactions];

      await saveCardData({
        cards: updatedCards,
        transactions: updatedTransactions,
      });

      Alert.alert('✅ Payment Successful', `Payment of $${amount.toFixed(2)} has been processed.`);
      return true;
    } catch (err) {
      setError('Failed to process payment');
      return false;
    }
  };

  const schedulePayment = async (amount: number, date: Date, cardId: string): Promise<boolean> => {
    try {
      // In a real app, this would schedule the payment
      Alert.alert('✅ Payment Scheduled', `Payment of $${amount.toFixed(2)} has been scheduled for ${date.toLocaleDateString()}.`);
      return true;
    } catch (err) {
      setError('Failed to schedule payment');
      return false;
    }
  };

  const getPaymentHistory = async (): Promise<any[]> => {
    try {
      return state.transactions.filter(t => t.type === 'refund');
    } catch (err) {
      console.error('Failed to get payment history:', err);
      return [];
    }
  };

  // Account Management
  const updateCreditLimit = async (newLimit: number): Promise<boolean> => {
    try {
      const updatedCards = state.cards.map(card => ({
        ...card,
        creditLimit: newLimit,
        availableCredit: newLimit - card.currentBalance,
      }));
      await saveCardData({ cards: updatedCards });
      return true;
    } catch (err) {
      setError('Failed to update credit limit');
      return false;
    }
  };

  const updateNotifications = async (settings: Partial<LumaCardState['notifications']>): Promise<boolean> => {
    try {
      const updatedNotifications = { ...state.notifications, ...settings };
      await saveCardData({ notifications: updatedNotifications });
      return true;
    } catch (err) {
      setError('Failed to update notifications');
      return false;
    }
  };

  const getCreditScore = async (): Promise<number> => {
    try {
      // Simulate credit score calculation
      const baseScore = 750;
      const paymentHistory = state.paymentHistory.length;
      const creditUtilization = state.cards.reduce((total, card) => 
        total + (card.currentBalance / card.creditLimit), 0
      ) / state.cards.length;

      let score = baseScore;
      score += paymentHistory * 10; // Good payment history
      score -= creditUtilization * 100; // High utilization hurts score

      return Math.max(300, Math.min(850, Math.round(score)));
    } catch (err) {
      console.error('Failed to get credit score:', err);
      return 750;
    }
  };

  const refreshCardData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await loadStoredCardData();
      // In a real app, this would sync with the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError('Failed to refresh card data');
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: LumaCardContextType = {
    ...state,
    createCard,
    freezeCard,
    unfreezeCard,
    setDefaultCard,
    reportLostCard,
    addTransaction,
    getTransactionHistory,
    getSpendingAnalytics,
    earnRewards,
    redeemRewards,
    getRewardsHistory,
    makePayment,
    schedulePayment,
    getPaymentHistory,
    updateCreditLimit,
    updateNotifications,
    getCreditScore,
    refreshCardData,
    isLoading,
    error,
  };

  return (
    <LumaCardContext.Provider value={contextValue}>
      {children}
    </LumaCardContext.Provider>
  );
};

export const useLumaCard = (): LumaCardContextType => {
  const context = useContext(LumaCardContext);
  if (context === undefined) {
    throw new Error('useLumaCard must be used within a LumaCardProvider');
  }
  return context;
}; 