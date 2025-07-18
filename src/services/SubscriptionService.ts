import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'week' | 'day';
  intervalCount: number;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
  trialDays?: number;
  maxUsers?: number;
  maxStorage?: number;
  maxApiCalls?: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  quantity: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionUsage {
  id: string;
  subscriptionId: string;
  feature: string;
  usage: number;
  limit: number;
  resetDate: Date;
  createdAt: Date;
}

export interface BillingHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  invoiceUrl?: string;
  paidAt?: Date;
  createdAt: Date;
}

export interface SubscriptionInvoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  invoiceNumber: string;
  invoiceUrl: string;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  metadata?: Record<string, any>;
}

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
  averageRevenuePerUser: number;
  trialConversionRate: number;
}

class SubscriptionService {
  private baseUrl: string;
  private authToken: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Use a default URL and initialize lazily
    this.baseUrl = 'http://192.168.1.205:3001';
    this.initializeService();
  }

  private async initializeService() {
    try {
      // Set the base URL from environment if available
      if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) {
        this.baseUrl = process.env.EXPO_PUBLIC_API_URL;
      }
      
      await this.loadAuthToken();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize SubscriptionService:', error);
      // Still mark as initialized to prevent infinite retries
      this.isInitialized = true;
    }
  }

  private async loadAuthToken() {
    try {
      if (AsyncStorage) {
        this.authToken = await AsyncStorage.getItem('authToken');
      }
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  private async getAuthToken(): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initializeService();
    }
    await this.loadAuthToken();
    return this.authToken;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.isInitialized) {
      await this.initializeService();
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      return await this.makeRequest<SubscriptionPlan[]>('/api/subscriptions/plans');
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      // Return empty array as fallback
      return [];
    }
  }

  async createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> {
    try {
      return await this.makeRequest<SubscriptionPlan>('/api/subscriptions/plans', {
        method: 'POST',
        body: JSON.stringify(plan),
      });
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  }

  async updateSubscriptionPlan(planId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    try {
      return await this.makeRequest<SubscriptionPlan>(`/api/subscriptions/plans/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }
  }

  async deleteSubscriptionPlan(planId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/subscriptions/plans/${planId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      throw error;
    }
  }

  // User Subscriptions
  async getUserSubscriptions(): Promise<Subscription[]> {
    try {
      return await this.makeRequest<Subscription[]>('/api/subscriptions');
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      // Return empty array as fallback
      return [];
    }
  }

  async createSubscription(planId: string, paymentMethodId: string, quantity: number = 1): Promise<Subscription> {
    try {
      return await this.makeRequest<Subscription>('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          planId,
          paymentMethodId,
          quantity,
        }),
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    try {
      return await this.makeRequest<Subscription>(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ cancelAtPeriodEnd }),
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      return await this.makeRequest<Subscription>(`/api/subscriptions/${subscriptionId}/reactivate`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId: string, updates: { planId?: string; quantity?: number }): Promise<Subscription> {
    try {
      return await this.makeRequest<Subscription>(`/api/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Billing History
  async getBillingHistory(subscriptionId?: string): Promise<BillingHistory[]> {
    try {
      const endpoint = subscriptionId 
        ? `/api/subscriptions/${subscriptionId}/billing-history`
        : '/api/subscriptions/billing-history';
      return await this.makeRequest<BillingHistory[]>(endpoint);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      // Return empty array as fallback
      return [];
    }
  }

  // Invoices
  async getInvoices(subscriptionId?: string): Promise<SubscriptionInvoice[]> {
    try {
      const endpoint = subscriptionId 
        ? `/api/subscriptions/${subscriptionId}/invoices`
        : '/api/subscriptions/invoices';
      return await this.makeRequest<SubscriptionInvoice[]>(endpoint);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Return empty array as fallback
      return [];
    }
  }

  async getInvoice(invoiceId: string): Promise<SubscriptionInvoice> {
    try {
      return await this.makeRequest<SubscriptionInvoice>(`/api/subscriptions/invoices/${invoiceId}`);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  // Usage Tracking
  async getUsage(subscriptionId: string): Promise<SubscriptionUsage[]> {
    try {
      return await this.makeRequest<SubscriptionUsage[]>(`/api/subscriptions/${subscriptionId}/usage`);
    } catch (error) {
      console.error('Error fetching usage:', error);
      // Return empty array as fallback
      return [];
    }
  }

  async reportUsage(subscriptionId: string, feature: string, usage: number): Promise<SubscriptionUsage> {
    try {
      return await this.makeRequest<SubscriptionUsage>(`/api/subscriptions/${subscriptionId}/usage`, {
        method: 'POST',
        body: JSON.stringify({ feature, usage }),
      });
    } catch (error) {
      console.error('Error reporting usage:', error);
      throw error;
    }
  }

  // Metrics
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    try {
      return await this.makeRequest<SubscriptionMetrics>('/api/subscriptions/metrics');
    } catch (error) {
      console.error('Error fetching subscription metrics:', error);
      // Return default metrics as fallback
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        monthlyRecurringRevenue: 0,
        annualRecurringRevenue: 0,
        churnRate: 0,
        averageRevenuePerUser: 0,
        trialConversionRate: 0,
      };
    }
  }

  // Webhook Handling
  async handleSubscriptionWebhook(event: any): Promise<void> {
    try {
      await this.makeRequest('/api/subscriptions/webhooks', {
        method: 'POST',
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Error handling subscription webhook:', error);
      throw error;
    }
  }

  // Utility Methods
  calculateNextBillingDate(subscription: Subscription): Date {
    return new Date(subscription.currentPeriodEnd);
  }

  isSubscriptionActive(subscription: Subscription): boolean {
    return subscription.status === 'active' || subscription.status === 'trialing';
  }

  isSubscriptionTrialing(subscription: Subscription): boolean {
    return subscription.status === 'trialing';
  }

  getDaysUntilRenewal(subscription: Subscription): number {
    const now = new Date();
    const renewalDate = new Date(subscription.currentPeriodEnd);
    const diffTime = renewalDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getTrialDaysRemaining(subscription: Subscription): number {
    if (!subscription.trialEnd) return 0;
    
    const now = new Date();
    const trialEnd = new Date(subscription.trialEnd);
    const diffTime = trialEnd.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysRemaining);
  }

  formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price);
  }

  formatInterval(interval: string, intervalCount: number): string {
    if (intervalCount === 1) {
      return interval.charAt(0).toUpperCase() + interval.slice(1);
    }
    return `${intervalCount} ${interval}s`;
  }
}

// Create singleton instance with lazy initialization
let subscriptionServiceInstance: SubscriptionService | null = null;

export const subscriptionService = (() => {
  if (!subscriptionServiceInstance) {
    subscriptionServiceInstance = new SubscriptionService();
  }
  return subscriptionServiceInstance;
})();

// React Hook for using subscription service
export const useSubscriptionService = () => {
  return {
    subscriptionService,
  };
}; 