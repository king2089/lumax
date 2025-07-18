import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STRIPE_CONFIG, STRIPE_PRICE_IDS } from '../config/stripe';

export interface EarningsData {
  totalEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  pendingPayouts: number;
  availableBalance: number;
}

export interface RevenueStream {
  id: string;
  type: 'ads' | 'sponsorship' | 'merchandise' | 'subscription' | 'tips' | 'courses' | 'live' | 'affiliate';
  name: string;
  description: string;
  earnings: number;
  isActive: boolean;
  conversionRate: number;
  estimatedMonthly: number;
}

export interface PaymentMethod {
  id: string;
  type: 'stripe' | 'paypal' | 'bank' | 'crypto';
  name: string;
  details: string;
  isVerified: boolean;
  isDefault: boolean;
}

export interface CreatorTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  minFollowers: number;
  maxWeeklyEarnings: number;
  commissionRate: number;
  features: string[];
}

export interface SponsorshipOffer {
  id: string;
  brandName: string;
  brandLogo: string;
  campaignTitle: string;
  description: string;
  payout: number;
  requirements: string[];
  deadline: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  category: string;
}

export interface AnalyticsData {
  views: number;
  engagement: number;
  clickThroughRate: number;
  conversionRate: number;
  audienceReach: number;
  topPerformingContent: string[];
  revenueBySource: { [key: string]: number };
}

interface MonetizationContextType {
  // Earnings
  earnings: EarningsData;
  revenueStreams: RevenueStream[];
  
  // Creator Status
  creatorTier: CreatorTier;
  isMonetizationEnabled: boolean;
  
  // Payment Methods
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<boolean>;
  removePaymentMethod: (methodId: string) => Promise<boolean>;
  setDefaultPaymentMethod: (methodId: string) => Promise<boolean>;
  
  // Revenue Streams
  toggleRevenueStream: (streamId: string) => Promise<boolean>;
  optimizeRevenueStream: (streamId: string) => Promise<void>;
  
  // Sponsorships
  sponsorshipOffers: SponsorshipOffer[];
  acceptSponsorship: (offerId: string) => Promise<boolean>;
  rejectSponsorship: (offerId: string) => Promise<boolean>;
  completeSponsorship: (offerId: string) => Promise<boolean>;
  
  // Payouts
  requestPayout: (amount: number, methodId: string) => Promise<boolean>;
  getPayoutHistory: () => Promise<any[]>;
  
  // Analytics
  analytics: AnalyticsData;
  refreshAnalytics: () => Promise<void>;
  
  // API Integration
  connectStripe: () => Promise<boolean>;
  connectPayPal: () => Promise<boolean>;
  enableAds: () => Promise<boolean>;
  setupMerchStore: () => Promise<boolean>;
  
  // Real-time updates
  isLoading: boolean;
  error: string | null;
  refreshEarnings: () => Promise<void>;
}

const MonetizationContext = createContext<MonetizationContextType | undefined>(undefined);

interface MonetizationProviderProps {
  children: ReactNode;
}

// Creator tier configurations
const CREATOR_TIERS: CreatorTier[] = [
  {
    tier: 'bronze',
    minFollowers: 1000,
    maxWeeklyEarnings: 1000,
    commissionRate: 0.15,
    features: ['Basic Analytics', 'Ad Revenue', 'Tips'],
  },
  {
    tier: 'silver',
    minFollowers: 5000,
    maxWeeklyEarnings: 5000,
    commissionRate: 0.12,
    features: ['Advanced Analytics', 'Brand Partnerships', 'Merchandise', 'Live Streaming'],
  },
  {
    tier: 'gold',
    minFollowers: 25000,
    maxWeeklyEarnings: 10000,
    commissionRate: 0.10,
    features: ['Premium Analytics', 'Priority Support', 'Course Creation', 'Affiliate Program'],
  },
  {
    tier: 'platinum',
    minFollowers: 100000,
    maxWeeklyEarnings: 15000,
    commissionRate: 0.08,
    features: ['Enterprise Analytics', 'Dedicated Manager', 'White-label Options', 'API Access'],
  },
  {
    tier: 'diamond',
    minFollowers: 500000,
    maxWeeklyEarnings: 20000,
    commissionRate: 0.05,
    features: ['Custom Solutions', '24/7 Support', 'Revenue Optimization', 'Cross-platform Sync'],
  },
];

// Mock API endpoints - In production, replace with real API
const API_BASE_URL = 'https://api.lumamonetization.com/v1';

export const MonetizationProvider: React.FC<MonetizationProviderProps> = ({ children }) => {
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    yearlyEarnings: 0,
    pendingPayouts: 0,
    availableBalance: 0,
  });

  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([]);
  const [creatorTier, setCreatorTier] = useState<CreatorTier>(CREATOR_TIERS[0]);
  const [isMonetizationEnabled, setIsMonetizationEnabled] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [sponsorshipOffers, setSponsorshipOffers] = useState<SponsorshipOffer[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    views: 0,
    engagement: 0,
    clickThroughRate: 0,
    conversionRate: 0,
    audienceReach: 0,
    topPerformingContent: [],
    revenueBySource: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with sample data
  useEffect(() => {
    initializeMonetization();
  }, []);

  const initializeMonetization = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call to get user's monetization data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample earnings data - realistic high earning potential
      setEarnings({
        totalEarnings: 127580.50,
        weeklyEarnings: 18240.75,
        monthlyEarnings: 72960.30,
        yearlyEarnings: 875523.60,
        pendingPayouts: 3250.00,
        availableBalance: 15890.75,
      });

      // Sample revenue streams
      setRevenueStreams([
        {
          id: 'ads',
          type: 'ads',
          name: 'Ad Revenue',
          description: 'Premium ad placements and video monetization',
          earnings: 4240.50,
          isActive: true,
          conversionRate: 4.8,
          estimatedMonthly: 16960.00,
        },
        {
          id: 'sponsorship',
          type: 'sponsorship',
          name: 'Brand Partnerships',
          description: 'High-value sponsored content deals',
          earnings: 12800.00,
          isActive: true,
          conversionRate: 12.2,
          estimatedMonthly: 51200.00,
        },
        {
          id: 'merchandise',
          type: 'merchandise',
          name: 'Creator Store',
          description: 'Branded merchandise and digital products',
          earnings: 1200.25,
          isActive: true,
          conversionRate: 3.8,
          estimatedMonthly: 4800.00,
        },
        {
          id: 'subscription',
          type: 'subscription',
          name: 'Premium Memberships',
          description: 'Monthly recurring revenue from fan subscriptions',
          earnings: 0,
          isActive: false,
          conversionRate: 0,
          estimatedMonthly: 0,
        },
        {
          id: 'courses',
          type: 'courses',
          name: 'Educational Content',
          description: 'Sell courses and tutorials to your audience',
          earnings: 0,
          isActive: false,
          conversionRate: 0,
          estimatedMonthly: 0,
        },
        {
          id: 'affiliate',
          type: 'affiliate',
          name: 'Affiliate Marketing',
          description: 'Earn commissions from product recommendations',
          earnings: 0,
          isActive: false,
          conversionRate: 0,
          estimatedMonthly: 0,
        },
      ]);

      // Sample sponsorship offers with high payouts
      setSponsorshipOffers([
        {
          id: 'sp1',
          brandName: 'TechGear Pro',
          brandLogo: 'https://via.placeholder.com/60x60/667eea/FFFFFF?text=TG',
          campaignTitle: 'Gaming Setup Showcase',
          description: 'Feature our premium gaming setup in your content for 30 days',
          payout: 4850.00,
          requirements: ['100K+ gaming audience', '5M+ monthly views', 'Multi-platform content'],
          deadline: '2024-02-15',
          status: 'pending',
          category: 'Technology',
        },
        {
          id: 'sp2',
          brandName: 'FitLife Nutrition',
          brandLogo: 'https://via.placeholder.com/60x60/00C853/FFFFFF?text=FL',
          campaignTitle: 'Premium Supplement Series',
          description: '6-week fitness transformation series with our products',
          payout: 7200.00,
          requirements: ['Health & fitness niche', '250K+ followers', 'Video series + posts'],
          deadline: '2024-02-20',
          status: 'pending',
          category: 'Health & Fitness',
        },
        {
          id: 'sp3',
          brandName: 'LuxuryTravel Co',
          brandLogo: 'https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=LT',
          campaignTitle: 'Exclusive Resort Experience',
          description: 'Document your luxury vacation experience at our 5-star resort',
          payout: 12500.00,
          requirements: ['Travel/lifestyle content', '500K+ audience', 'Professional photography'],
          deadline: '2024-03-01',
          status: 'pending',
          category: 'Travel & Lifestyle',
        },
      ]);

      // Set creator tier based on follower count (mock data for high-tier creator)
      const followerCount = 750000; // High-tier creator
      const tier = CREATOR_TIERS.reverse().find(t => followerCount >= t.minFollowers) || CREATOR_TIERS[0];
      setCreatorTier(tier);
      setIsMonetizationEnabled(followerCount >= 1000);

      // Sample analytics for successful creator
      setAnalytics({
        views: 2456800,
        engagement: 12.4,
        clickThroughRate: 5.8,
        conversionRate: 4.2,
        audienceReach: 1804500,
        topPerformingContent: ['Creator Tips Masterclass', 'Behind the Scenes', 'Q&A Session'],
        revenueBySource: {
          'Brand Partnerships': 12800.00,
          'Ad Revenue': 4240.50,
          'Merchandise': 1200.25,
          'Tips & Donations': 0,
        },
      });

    } catch (err) {
      setError('Failed to load monetization data');
    } finally {
      setIsLoading(false);
    }
  };

  // API functions
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-api-token', // In production, get from auth context
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('API call failed:', err);
      throw err;
    }
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newMethod: PaymentMethod = {
        ...method,
        id: `pm_${Date.now()}`,
      };
      
      setPaymentMethods(prev => [...prev, newMethod]);
      return true;
    } catch (err) {
      setError('Failed to add payment method');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removePaymentMethod = async (methodId: string): Promise<boolean> => {
    try {
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      return true;
    } catch (err) {
      setError('Failed to remove payment method');
      return false;
    }
  };

  const setDefaultPaymentMethod = async (methodId: string): Promise<boolean> => {
    try {
      setPaymentMethods(prev => prev.map(m => ({
        ...m,
        isDefault: m.id === methodId,
      })));
      return true;
    } catch (err) {
      setError('Failed to set default payment method');
      return false;
    }
  };

  const toggleRevenueStream = async (streamId: string): Promise<boolean> => {
    try {
      setRevenueStreams(prev => prev.map(stream => 
        stream.id === streamId 
          ? { ...stream, isActive: !stream.isActive }
          : stream
      ));
      return true;
    } catch (err) {
      setError('Failed to toggle revenue stream');
      return false;
    }
  };

  const optimizeRevenueStream = async (streamId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRevenueStreams(prev => prev.map(stream => 
        stream.id === streamId 
          ? { 
              ...stream, 
              conversionRate: stream.conversionRate * 1.25,
              estimatedMonthly: stream.estimatedMonthly * 1.25,
            }
          : stream
      ));
    } catch (err) {
      setError('Failed to optimize revenue stream');
    } finally {
      setIsLoading(false);
    }
  };

  const acceptSponsorship = async (offerId: string): Promise<boolean> => {
    try {
      setSponsorshipOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: 'accepted' as const }
          : offer
      ));
      return true;
    } catch (err) {
      setError('Failed to accept sponsorship');
      return false;
    }
  };

  const rejectSponsorship = async (offerId: string): Promise<boolean> => {
    try {
      setSponsorshipOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: 'rejected' as const }
          : offer
      ));
      return true;
    } catch (err) {
      setError('Failed to reject sponsorship');
      return false;
    }
  };

  const completeSponsorship = async (offerId: string): Promise<boolean> => {
    try {
      const offer = sponsorshipOffers.find(o => o.id === offerId);
      if (offer) {
        // Add substantial earnings
        setEarnings(prev => ({
          ...prev,
          weeklyEarnings: prev.weeklyEarnings + offer.payout,
          totalEarnings: prev.totalEarnings + offer.payout,
          availableBalance: prev.availableBalance + offer.payout,
        }));
        
        setSponsorshipOffers(prev => prev.map(o => 
          o.id === offerId 
            ? { ...o, status: 'completed' as const }
            : o
        ));
      }
      return true;
    } catch (err) {
      setError('Failed to complete sponsorship');
      return false;
    }
  };

  const requestPayout = async (amount: number, methodId: string): Promise<boolean> => {
    try {
      if (amount > earnings.availableBalance) {
        setError('Insufficient balance');
        return false;
      }
      
      setIsLoading(true);
      
      // Simulate payout processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEarnings(prev => ({
        ...prev,
        availableBalance: prev.availableBalance - amount,
        pendingPayouts: prev.pendingPayouts + amount,
      }));
      
      return true;
    } catch (err) {
      setError('Failed to process payout');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getPayoutHistory = async (): Promise<any[]> => {
    // Return mock payout history with substantial amounts
    return [
      {
        id: 'po1',
        amount: 15000.00,
        date: '2024-01-15',
        status: 'completed',
        method: 'Stripe',
      },
      {
        id: 'po2',
        amount: 12500.00,
        date: '2024-01-08',
        status: 'completed',
        method: 'PayPal',
      },
      {
        id: 'po3',
        amount: 8800.00,
        date: '2024-01-01',
        status: 'completed',
        method: 'Bank Transfer',
      },
    ];
  };

  const refreshAnalytics = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate analytics refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalytics(prev => ({
        ...prev,
        views: prev.views + Math.floor(Math.random() * 50000),
        engagement: prev.engagement + (Math.random() * 0.5),
      }));
    } catch (err) {
      setError('Failed to refresh analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const connectStripe = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if Stripe is already connected
      if (paymentMethods.some(method => method.type === 'stripe')) {
        setError('Stripe is already connected');
        return false;
      }
      
      // Simulate Stripe connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const stripeMethod: PaymentMethod = {
        id: `stripe_connect_${Date.now()}`,
        type: 'stripe',
        name: 'Stripe Connect',
        details: 'Professional payment processing • Instant transfers',
        isVerified: true,
        isDefault: paymentMethods.length === 0, // Only default if it's the first method
      };
      
      setPaymentMethods(prev => [...prev, stripeMethod]);
      return true;
    } catch (err) {
      setError('Failed to connect Stripe');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const connectPayPal = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if PayPal is already connected
      if (paymentMethods.some(method => method.type === 'paypal')) {
        setError('PayPal is already connected');
        return false;
      }
      
      // Simulate PayPal connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const paypalMethod: PaymentMethod = {
        id: `paypal_connect_${Date.now()}`,
        type: 'paypal',
        name: 'PayPal Business',
        details: 'creator.business@paypal.com • Global payments',
        isVerified: true,
        isDefault: paymentMethods.length === 0, // Only default if it's the first method
      };
      
      setPaymentMethods(prev => [...prev, paypalMethod]);
      return true;
    } catch (err) {
      setError('Failed to connect PayPal');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const enableAds = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate ad network setup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRevenueStreams(prev => prev.map(stream => 
        stream.type === 'ads' 
          ? { ...stream, isActive: true }
          : stream
      ));
      
      return true;
    } catch (err) {
      setError('Failed to enable ads');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setupMerchStore = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate merchandise store setup
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setRevenueStreams(prev => prev.map(stream => 
        stream.type === 'merchandise' 
          ? { ...stream, isActive: true }
          : stream
      ));
      
      return true;
    } catch (err) {
      setError('Failed to setup merchandise store');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEarnings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate real-time earnings update with realistic amounts
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const earningsBoost = Math.random() * 500 + 100; // $100-600 boost
      setEarnings(prev => ({
        ...prev,
        weeklyEarnings: prev.weeklyEarnings + earningsBoost,
        totalEarnings: prev.totalEarnings + earningsBoost,
        availableBalance: prev.availableBalance + earningsBoost,
      }));
    } catch (err) {
      setError('Failed to refresh earnings');
    } finally {
      setIsLoading(false);
    }
  };

  const value: MonetizationContextType = {
    earnings,
    revenueStreams,
    creatorTier,
    isMonetizationEnabled,
    paymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    toggleRevenueStream,
    optimizeRevenueStream,
    sponsorshipOffers,
    acceptSponsorship,
    rejectSponsorship,
    completeSponsorship,
    requestPayout,
    getPayoutHistory,
    analytics,
    refreshAnalytics,
    connectStripe,
    connectPayPal,
    enableAds,
    setupMerchStore,
    isLoading,
    error,
    refreshEarnings,
  };

  return (
    <MonetizationContext.Provider value={value}>
      {children}
    </MonetizationContext.Provider>
  );
};

export const useMonetization = (): MonetizationContextType => {
  const context = useContext(MonetizationContext);
  if (context === undefined) {
    throw new Error('useMonetization must be used within a MonetizationProvider');
  }
  return context;
}; 