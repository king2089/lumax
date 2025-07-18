import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

// API Configuration
const API_BASE_URL = (() => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL;
    }
  } catch (error) {
    console.error('Error accessing environment variables:', error);
  }
  return 'http://localhost:3001';
})();

// Types
export interface PaymentMethod {
  id: string;
  type: 'apple_pay' | 'google_pay' | 'card';
  lastFour?: string;
  brand?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'purchase' | 'refund' | 'payout';
  description: string;
  merchant: string;
  reference: string;
  createdAt: string;
  paymentMethodType?: string;
  lastFour?: string;
}

export interface Payout {
  id: string;
  amount: string;
  fee: string;
  netAmount: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference: string;
  createdAt: string;
  processedAt?: string;
  paymentMethodType?: string;
  lastFour?: string;
}

export interface ApplePayConfig {
  merchantId: string;
  domainName: string;
  displayName: string;
  supportedNetworks: string[];
  merchantCapabilities: string[];
  countryCode: string;
  currencyCode: string;
}

export interface GooglePayConfig {
  environment: string;
  merchantId: string;
  merchantName: string;
  allowedPaymentMethods: any[];
  transactionInfo: any;
}

class PaymentService {
  private authToken: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      await this.loadAuthToken();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize PaymentService:', error);
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

  private async getAuthHeaders(): Promise<HeadersInit> {
    if (!this.isInitialized) {
      await this.initializeService();
    }
    
    await this.loadAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
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

    const url = `${API_BASE_URL}${endpoint}`;
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

  // Apple Pay Methods

  async getApplePayConfig(): Promise<ApplePayConfig> {
    try {
      return await this.makeRequest<ApplePayConfig>('/api/apple-pay/config');
    } catch (error) {
      console.error('Error fetching Apple Pay config:', error);
      // Return default config as fallback
      return {
        merchantId: 'merchant.com.luma.app',
        domainName: 'luma.app',
        displayName: 'Luma',
        supportedNetworks: ['visa', 'mastercard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        countryCode: 'US',
        currencyCode: 'USD',
      };
    }
  }

  async validateApplePaySession(validationURL: string): Promise<any> {
    try {
      return await this.makeRequest('/api/apple-pay/validate-session', {
        method: 'POST',
        body: JSON.stringify({ validationURL }),
      });
    } catch (error) {
      console.error('Error validating Apple Pay session:', error);
      throw error;
    }
  }

  async processApplePayPayment(
    paymentToken: string,
    amount: number,
    description: string,
    merchant: string
  ): Promise<{ success: boolean; transactionId: string; amount: string; status: string }> {
    try {
      return await this.makeRequest('/api/apple-pay/process-payment', {
        method: 'POST',
        body: JSON.stringify({
          paymentToken,
          amount: amount.toFixed(2),
          description,
          merchant,
        }),
      });
    } catch (error) {
      console.error('Error processing Apple Pay payment:', error);
      throw error;
    }
  }

  // Google Pay Methods

  async getGooglePayConfig(): Promise<GooglePayConfig> {
    try {
      return await this.makeRequest<GooglePayConfig>('/api/google-pay/config');
    } catch (error) {
      console.error('Error fetching Google Pay config:', error);
      // Return default config as fallback
      return {
        environment: 'TEST',
        merchantId: 'merchant.com.luma.app',
        merchantName: 'Luma',
        allowedPaymentMethods: [],
        transactionInfo: {},
      };
    }
  }

  async getGooglePayClientToken(): Promise<{ clientToken: string }> {
    try {
      return await this.makeRequest<{ clientToken: string }>('/api/google-pay/client-token');
    } catch (error) {
      console.error('Error fetching Google Pay client token:', error);
      throw error;
    }
  }

  async processGooglePayPayment(
    paymentMethodNonce: string,
    amount: number,
    description: string,
    merchant: string
  ): Promise<{ success: boolean; transactionId: string; amount: string; status: string }> {
    try {
      return await this.makeRequest('/api/google-pay/process-payment', {
        method: 'POST',
        body: JSON.stringify({
          paymentMethodNonce,
          amount: amount.toFixed(2),
          description,
          merchant,
        }),
      });
    } catch (error) {
      console.error('Error processing Google Pay payment:', error);
      throw error;
    }
  }

  // Payment Methods Management

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await this.makeRequest<PaymentMethod[]>('/api/payment-methods');
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Return empty array as fallback
      return [];
    }
  }

  async addPaymentMethod(
    type: 'apple_pay' | 'google_pay' | 'card',
    token: string,
    lastFour?: string,
    brand?: string
  ): Promise<{ success: boolean; paymentMethodId: string; message: string }> {
    try {
      return await this.makeRequest('/api/payment-methods', {
        method: 'POST',
        body: JSON.stringify({
          type,
          token,
          lastFour,
          brand,
        }),
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.makeRequest(`/api/payment-methods/${paymentMethodId}/default`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  async removePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.makeRequest(`/api/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  // Transactions

  async getTransactions(limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    try {
      return await this.makeRequest<Transaction[]>(`/api/transactions?limit=${limit}&offset=${offset}`);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return empty array as fallback
      return [];
    }
  }

  // Payouts

  async requestPayout(
    amount: number,
    paymentMethodId: string
  ): Promise<{
    success: boolean;
    payoutId: string;
    amount: string;
    fee: string;
    netAmount: string;
    status: string;
  }> {
    try {
      return await this.makeRequest('/api/payouts', {
        method: 'POST',
        body: JSON.stringify({
          amount: amount.toFixed(2),
          paymentMethodId,
        }),
      });
    } catch (error) {
      console.error('Error requesting payout:', error);
      throw error;
    }
  }

  async getPayouts(limit: number = 50, offset: number = 0): Promise<Payout[]> {
    try {
      return await this.makeRequest<Payout[]>(`/api/payouts?limit=${limit}&offset=${offset}`);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      // Return empty array as fallback
      return [];
    }
  }

  // Utility Methods

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  calculateFee(amount: number): { fee: number; netAmount: number } {
    const feePercentage = 0.029; // 2.9%
    const feeFixed = 0.25; // $0.25
    const fee = Math.max(feeFixed, amount * feePercentage);
    const netAmount = amount - fee;
    
    return {
      fee: Math.round(fee * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
    };
  }

  validateAmount(amount: number): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }
    
    if (amount < 0.50) {
      return { isValid: false, error: 'Minimum amount is $0.50' };
    }
    
    if (amount > 10000) {
      return { isValid: false, error: 'Maximum amount is $10,000' };
    }
    
    return { isValid: true };
  }

  // Platform-specific checks
  isApplePayAvailable(): boolean {
    return Platform.OS === 'ios';
  }

  isGooglePayAvailable(): boolean {
    return Platform.OS === 'android';
  }

  // Error handling
  handlePaymentError(error: any): string {
    console.error('Payment error:', error);
    
    if (error.message?.includes('insufficient_funds')) {
      return 'Insufficient funds in your account';
    }
    
    if (error.message?.includes('card_declined')) {
      return 'Your card was declined. Please try a different payment method.';
    }
    
    if (error.message?.includes('expired_card')) {
      return 'Your card has expired. Please update your payment method.';
    }
    
    if (error.message?.includes('invalid_cvc')) {
      return 'Invalid security code. Please check and try again.';
    }
    
    if (error.message?.includes('network_error')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    return 'Payment failed. Please try again or contact support.';
  }

  // Success handling
  showPaymentSuccess(amount: string, transactionId: string) {
    Alert.alert(
      '✅ Payment Successful',
      `Your payment of ${amount} has been processed successfully.\n\nTransaction ID: ${transactionId}`,
      [{ text: 'OK' }]
    );
  }

  showPayoutSuccess(amount: string, netAmount: string, payoutId: string) {
    Alert.alert(
      '✅ Payout Requested',
      `Your payout request for ${amount} has been submitted.\n\nNet amount: ${netAmount}\nPayout ID: ${payoutId}\n\nYou will receive the funds within 1-3 business days.`,
      [{ text: 'OK' }]
    );
  }
}

// Create singleton instance with lazy initialization
let paymentServiceInstance: PaymentService | null = null;

export const paymentService = (() => {
  if (!paymentServiceInstance) {
    paymentServiceInstance = new PaymentService();
  }
  return paymentServiceInstance;
})();

// React Hook for using payment service
export const usePaymentService = () => {
  const { user } = useAuth();
  
  return {
    paymentService,
    isAuthenticated: !!user,
    userId: user?.id,
  };
}; 