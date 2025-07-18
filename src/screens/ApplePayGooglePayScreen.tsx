import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { usePaymentService, PaymentMethod, Transaction, Payout } from '../services/PaymentService';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export const ApplePayGooglePayScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { paymentService, isAuthenticated } = usePaymentService();

  // State
  const [activeTab, setActiveTab] = useState<'pay' | 'payout' | 'history' | 'methods'>('pay');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Payment state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  
  // Data state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [applePayConfig, setApplePayConfig] = useState<any>(null);
  const [googlePayConfig, setGooglePayConfig] = useState<any>(null);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadPaymentMethods(),
        loadTransactions(),
        loadPayouts(),
        loadPaymentConfigs(),
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0 && !selectedPaymentMethod) {
        const defaultMethod = methods.find(m => m.isDefault) || methods[0];
        setSelectedPaymentMethod(defaultMethod);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const txns = await paymentService.getTransactions(20, 0);
      setTransactions(txns);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const loadPayouts = async () => {
    try {
      const payoutsData = await paymentService.getPayouts(20, 0);
      setPayouts(payoutsData);
    } catch (error) {
      console.error('Failed to load payouts:', error);
    }
  };

  const loadPaymentConfigs = async () => {
    try {
      const [appleConfig, googleConfig] = await Promise.all([
        paymentService.getApplePayConfig(),
        paymentService.getGooglePayConfig(),
      ]);
      setApplePayConfig(appleConfig);
      setGooglePayConfig(googleConfig);
    } catch (error) {
      console.error('Failed to load payment configs:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Payment Processing
  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    const numAmount = parseFloat(amount);
    const validation = paymentService.validateAmount(numAmount);
    
    if (!validation.isValid) {
      Alert.alert('Invalid Amount', validation.error);
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      setIsLoading(true);
      setShowPaymentModal(false);

      let result;
      
      if (selectedPaymentMethod.type === 'apple_pay') {
        // In a real app, you would integrate with Apple Pay SDK
        // For now, we'll simulate the payment
        result = await paymentService.processApplePayPayment(
          'mock_apple_pay_token',
          numAmount,
          description,
          'Luma Card'
        );
      } else if (selectedPaymentMethod.type === 'google_pay') {
        // In a real app, you would integrate with Google Pay SDK
        // For now, we'll simulate the payment
        result = await paymentService.processGooglePayPayment(
          'mock_google_pay_nonce',
          numAmount,
          description,
          'Luma Card'
        );
      } else {
        Alert.alert('Error', 'Unsupported payment method');
        return;
      }

      if (result.success) {
        paymentService.showPaymentSuccess(result.amount, result.transactionId);
        setAmount('');
        setDescription('');
        await loadTransactions();
      } else {
        Alert.alert('Payment Failed', 'Please try again');
      }
    } catch (error) {
      const errorMessage = paymentService.handlePaymentError(error);
      Alert.alert('Payment Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Payout Processing
  const handlePayout = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    const numAmount = parseFloat(amount);
    const validation = paymentService.validateAmount(numAmount);
    
    if (!validation.isValid) {
      Alert.alert('Invalid Amount', validation.error);
      return;
    }

    try {
      setIsLoading(true);
      setShowPayoutModal(false);

      const result = await paymentService.requestPayout(numAmount, selectedPaymentMethod.id);

      if (result.success) {
        paymentService.showPayoutSuccess(result.amount, result.netAmount, result.payoutId);
        setAmount('');
        await loadPayouts();
      } else {
        Alert.alert('Payout Failed', 'Please try again');
      }
    } catch (error) {
      const errorMessage = paymentService.handlePaymentError(error);
      Alert.alert('Payout Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Payment Method
  const handleAddPaymentMethod = async (type: 'apple_pay' | 'google_pay') => {
    try {
      setIsLoading(true);
      setShowAddMethodModal(false);

      // In a real app, you would integrate with the respective payment SDKs
      // For now, we'll simulate adding a payment method
      const result = await paymentService.addPaymentMethod(
        type,
        `mock_${type}_token_${Date.now()}`,
        '1234',
        type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'
      );

      if (result.success) {
        Alert.alert('Success', `${type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} has been added successfully!`);
        await loadPaymentMethods();
      } else {
        Alert.alert('Error', 'Failed to add payment method');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaymentTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.paymentCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={styles.paymentGradient}
        >
          <Text style={styles.paymentTitle}>Make Payment</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="What's this payment for?"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
          </View>

          <TouchableOpacity
            style={styles.payButton}
            onPress={() => setShowPaymentModal(true)}
            disabled={!amount || !description}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.paymentMethodsSection}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        {paymentMethods.length === 0 ? (
          <TouchableOpacity
            style={styles.addMethodButton}
            onPress={() => setShowAddMethodModal(true)}
          >
            <Ionicons name="add-circle" size={24} color="#667eea" />
            <Text style={styles.addMethodText}>Add Payment Method</Text>
          </TouchableOpacity>
        ) : (
          paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodItem,
                selectedPaymentMethod?.id === method.id && styles.selectedMethod,
              ]}
              onPress={() => setSelectedPaymentMethod(method)}
            >
              <View style={styles.methodIcon}>
                <Ionicons
                  name={method.type === 'apple_pay' ? 'logo-apple' : 'logo-google'}
                  size={24}
                  color="#667eea"
                />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>
                  {method.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
                </Text>
                {method.lastFour && (
                  <Text style={styles.methodLastFour}>•••• {method.lastFour}</Text>
                )}
              </View>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );

  const renderPayoutTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.payoutCard}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.payoutGradient}
        >
          <Text style={styles.payoutTitle}>Request Payout</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
          </View>

          {amount && (
            <View style={styles.feeBreakdown}>
              <Text style={styles.feeText}>Fee: {paymentService.calculateFee(parseFloat(amount) || 0).fee}</Text>
              <Text style={styles.netAmountText}>
                Net: {paymentService.calculateFee(parseFloat(amount) || 0).netAmount}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.payoutButton}
            onPress={() => setShowPayoutModal(true)}
            disabled={!amount}
          >
            <Text style={styles.payoutButtonText}>Request Payout</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.recentPayoutsSection}>
        <Text style={styles.sectionTitle}>Recent Payouts</Text>
        {payouts.length === 0 ? (
          <Text style={styles.emptyText}>No payouts yet</Text>
        ) : (
          payouts.slice(0, 5).map((payout) => (
            <View key={payout.id} style={styles.payoutItem}>
              <View style={styles.payoutInfo}>
                <Text style={styles.payoutAmount}>{payout.amount}</Text>
                <Text style={styles.payoutDate}>
                  {new Date(payout.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: payout.status === 'completed' ? '#4CAF50' : '#FF9800' }
              ]}>
                <Text style={styles.statusText}>{payout.status}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Transaction History</Text>
      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>No transactions yet</Text>
      ) : (
        transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <Ionicons
                name={transaction.type === 'purchase' ? 'card' : 'arrow-up-circle'}
                size={20}
                color={transaction.type === 'purchase' ? '#F44336' : '#4CAF50'}
              />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>
                {transaction.description}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.transactionAmount}>
              <Text style={[
                styles.amountText,
                { color: transaction.type === 'purchase' ? '#F44336' : '#4CAF50' }
              ]}>
                {transaction.type === 'purchase' ? '-' : '+'}{transaction.amount}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: transaction.status === 'completed' ? '#4CAF50' : '#FF9800' }
              ]}>
                <Text style={styles.statusText}>{transaction.status}</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderMethodsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Payment Methods</Text>
      
      {paymentMethods.map((method) => (
        <View key={method.id} style={styles.methodCard}>
          <View style={styles.methodHeader}>
            <View style={styles.methodIcon}>
              <Ionicons
                name={method.type === 'apple_pay' ? 'logo-apple' : 'logo-google'}
                size={24}
                color="#667eea"
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>
                {method.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
              </Text>
              {method.lastFour && (
                <Text style={styles.methodLastFour}>•••• {method.lastFour}</Text>
              )}
              <Text style={styles.methodDate}>
                Added {new Date(method.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.methodActions}>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
              {!method.isDefault && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => paymentService.setDefaultPaymentMethod(method.id)}
                >
                  <Text style={styles.actionButtonText}>Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => paymentService.removePaymentMethod(method.id)}
              >
                <Ionicons name="trash" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addMethodCard}
        onPress={() => setShowAddMethodModal(true)}
      >
        <Ionicons name="add-circle" size={32} color="#667eea" />
        <Text style={styles.addMethodCardText}>Add Payment Method</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Ionicons name="lock-closed" size={64} color="#ccc" />
          <Text style={styles.authText}>Please sign in to access payments</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apple Pay & Google Pay</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'pay', label: 'Pay', icon: 'card' },
          { key: 'payout', label: 'Payout', icon: 'cash' },
          { key: 'history', label: 'History', icon: 'list' },
          { key: 'methods', label: 'Methods', icon: 'wallet' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#667eea' : '#666'}
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'pay' && renderPaymentTab()}
        {activeTab === 'payout' && renderPayoutTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'methods' && renderMethodsTab()}
      </ScrollView>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <TouchableOpacity onPress={handlePayment} disabled={isLoading}>
              <Text style={styles.modalConfirm}>Pay</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.confirmationCard}>
              <Text style={styles.confirmationAmount}>
                {paymentService.formatCurrency(parseFloat(amount) || 0)}
              </Text>
              <Text style={styles.confirmationDescription}>{description}</Text>
              <Text style={styles.confirmationMethod}>
                {selectedPaymentMethod?.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Payout Modal */}
      <Modal visible={showPayoutModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Confirm Payout</Text>
            <TouchableOpacity onPress={handlePayout} disabled={isLoading}>
              <Text style={styles.modalConfirm}>Payout</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.confirmationCard}>
              <Text style={styles.confirmationAmount}>
                {paymentService.formatCurrency(parseFloat(amount) || 0)}
              </Text>
              <Text style={styles.confirmationDescription}>Payout Request</Text>
              <Text style={styles.confirmationMethod}>
                {selectedPaymentMethod?.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
              </Text>
              <View style={styles.feeBreakdown}>
                <Text style={styles.feeText}>
                  Fee: {paymentService.calculateFee(parseFloat(amount) || 0).fee}
                </Text>
                <Text style={styles.netAmountText}>
                  Net: {paymentService.calculateFee(parseFloat(amount) || 0).netAmount}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Add Method Modal */}
      <Modal visible={showAddMethodModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddMethodModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Payment Method</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          <View style={styles.modalContent}>
            {paymentService.isApplePayAvailable() && (
              <TouchableOpacity
                style={styles.addMethodOption}
                onPress={() => handleAddPaymentMethod('apple_pay')}
              >
                <Ionicons name="logo-apple" size={32} color="#000" />
                <Text style={styles.addMethodOptionText}>Apple Pay</Text>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
            )}
            
            {paymentService.isGooglePayAvailable() && (
              <TouchableOpacity
                style={styles.addMethodOption}
                onPress={() => handleAddPaymentMethod('google_pay')}
              >
                <Ionicons name="logo-google" size={32} color="#4285F4" />
                <Text style={styles.addMethodOptionText}>Google Pay</Text>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f0f2f5',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  paymentCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  paymentGradient: {
    padding: 24,
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8,
  },
  payButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  payoutCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  payoutGradient: {
    padding: 24,
  },
  payoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  feeBreakdown: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  feeText: {
    fontSize: 14,
    color: '#fff',
  },
  netAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  payoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  payoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1c1e21',
  },
  paymentMethodsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addMethodText: {
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 8,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e4e6eb',
  },
  selectedMethod: {
    borderColor: '#667eea',
    backgroundColor: '#f0f2f5',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  methodLastFour: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  recentPayoutsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  payoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  payoutInfo: {
    flex: 1,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  payoutDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  addMethodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
  },
  addMethodCardText: {
    color: '#667eea',
    fontWeight: '600',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 32,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  modalCancel: {
    fontSize: 16,
    color: '#667eea',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalConfirm: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  modalPlaceholder: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  confirmationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  confirmationAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 8,
  },
  confirmationDescription: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  confirmationMethod: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  addMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  addMethodOptionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
}); 