import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useLumaBank } from '../context/LumaBankContext';
import { PaymentMethodSelector } from '../components/PaymentComponents';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { PayoutModal } from '../components/PayoutModal';

const { width, height } = Dimensions.get('window');

type LumaBankScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MenuMain'>;

export const LumaBankScreen: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const navigation = useNavigation<LumaBankScreenNavigationProp>();
  const { user } = useAuth();
  const {
    balance,
    transactions,
    payouts,
    paymentMethods,
    welcomeBonus,
    isLoading,
    refreshData,
    requestPayout,
    linkAccount,
    unlinkAccount,
    claimWelcomeBonus,
  } = useLumaBank();

  const [activeTab, setActiveTab] = useState<'overview' | 'payouts' | 'transactions' | 'accounts'>('overview');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showWelcomeBonusModal, setShowWelcomeBonusModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animation refs
  const balanceScale = useRef(new Animated.Value(1)).current;
  const balanceOpacity = useRef(new Animated.Value(1)).current;
  const cardRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (welcomeBonus && !welcomeBonus.claimed) {
      setShowWelcomeBonusModal(true);
    }
  }, [welcomeBonus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const animateBalance = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(balanceScale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(balanceOpacity, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(balanceScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(balanceOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const animateCard = () => {
    Animated.timing(cardRotation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      cardRotation.setValue(0);
    });
  };

  const handlePayoutRequest = async () => {
    if (!payoutAmount || !selectedPaymentMethod) {
      Alert.alert('Error', 'Please enter an amount and select a payment method');
      return;
    }

    const amount = parseFloat(payoutAmount);
    if (amount <= 0 || amount > balance) {
      Alert.alert('Error', 'Invalid amount. Please enter a valid amount within your balance.');
      return;
    }

    try {
      await requestPayout(amount, selectedPaymentMethod.id);
      setShowPayoutModal(false);
      setPayoutAmount('');
      setSelectedPaymentMethod(null);
      animateBalance();
      Alert.alert('Success', 'Payout request submitted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to request payout. Please try again.');
    }
  };

  const handleClaimWelcomeBonus = async () => {
    try {
      await claimWelcomeBonus();
      setShowWelcomeBonusModal(false);
      animateBalance();
      Alert.alert('Success', 'Welcome bonus claimed! $2,500 added to your account.');
    } catch (error) {
      Alert.alert('Error', 'Failed to claim welcome bonus. Please try again.');
    }
  };

  const handleLinkAccount = async (type: 'apple_pay' | 'google_pay') => {
    try {
      await linkAccount(type);
      setShowAccountModal(false);
      Alert.alert('Success', `${type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} account linked successfully!`);
    } catch (error) {
      Alert.alert('Error', `Failed to link ${type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} account.`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderBalanceCard = () => (
    <View style={styles.balanceCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceGradient}
      >
        <Animated.View
          style={[
            styles.balanceContent,
            {
              transform: [
                { scale: balanceScale },
                {
                  rotateY: cardRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: balanceOpacity,
            },
          ]}
        >
          <View style={styles.balanceHeader}>
            <Ionicons name="card" size={24} color="#fff" />
            <Text style={styles.balanceTitle}>Luma Bank</Text>
          </View>
          
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
          
          <View style={styles.balanceActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowPayoutModal(true)}
            >
              <Ionicons name="cash-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Payout</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowAccountModal(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Link Account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );

  const renderWelcomeBonusCard = () => (
    <View style={styles.welcomeBonusCard}>
      <LinearGradient
        colors={['#FFD700', '#FFA500']}
        style={styles.welcomeBonusGradient}
      >
        <View style={styles.welcomeBonusContent}>
          <Ionicons name="gift" size={32} color="#fff" />
          <Text style={styles.welcomeBonusTitle}>Welcome Bonus!</Text>
          <Text style={styles.welcomeBonusAmount}>$2,500</Text>
          <Text style={styles.welcomeBonusDescription}>
            Claim your welcome bonus and start earning with Luma Bank
          </Text>
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => setShowWelcomeBonusModal(true)}
          >
            <Text style={styles.claimButtonText}>Claim Now</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStats}>
      <View style={styles.statCard}>
        <Ionicons name="trending-up" size={24} color="#4CAF50" />
        <Text style={styles.statNumber}>{transactions.length}</Text>
        <Text style={styles.statLabel}>Transactions</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="cash" size={24} color="#FF9800" />
        <Text style={styles.statNumber}>{payouts.length}</Text>
        <Text style={styles.statLabel}>Payouts</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="card" size={24} color="#2196F3" />
        <Text style={styles.statNumber}>{paymentMethods.length}</Text>
        <Text style={styles.statLabel}>Accounts</Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payouts':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Payout History</Text>
            {payouts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cash-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No payouts yet</Text>
                <Text style={styles.emptyStateSubtext}>Request your first payout to get started</Text>
              </View>
            ) : (
              payouts.map((payout) => (
                <View key={payout.id} style={styles.payoutItem}>
                  <View style={styles.payoutInfo}>
                    <Text style={styles.payoutAmount}>{payout.amount}</Text>
                    <Text style={styles.payoutDate}>
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.payoutStatus}>
                    <Text style={[
                      styles.statusText,
                      { color: payout.status === 'completed' ? '#4CAF50' : '#FF9800' }
                    ]}>
                      {payout.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'transactions':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No transactions yet</Text>
                <Text style={styles.emptyStateSubtext}>Your transaction history will appear here</Text>
              </View>
            ) : (
              transactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'payout' ? '#4CAF50' : '#F44336' }
                  ]}>
                    {transaction.type === 'payout' ? '+' : '-'}{transaction.amount}
                  </Text>
                </View>
              ))
            )}
          </View>
        );

      case 'accounts':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Linked Accounts</Text>
            {paymentMethods.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No accounts linked</Text>
                <Text style={styles.emptyStateSubtext}>Link your payment methods to get started</Text>
                <TouchableOpacity
                  style={styles.linkAccountButton}
                  onPress={() => setShowAccountModal(true)}
                >
                  <Text style={styles.linkAccountButtonText}>Link Account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              paymentMethods.map((method) => (
                <View key={method.id} style={styles.accountItem}>
                  <View style={styles.accountInfo}>
                    <Ionicons
                      name={method.type === 'apple_pay' ? 'logo-apple' : 'logo-google'}
                      size={24}
                      color={method.type === 'apple_pay' ? '#000' : '#4285F4'}
                    />
                    <View style={styles.accountDetails}>
                      <Text style={styles.accountName}>
                        {method.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
                      </Text>
                      {method.lastFour && (
                        <Text style={styles.accountNumber}>•••• {method.lastFour}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.unlinkButton}
                    onPress={() => unlinkAccount(method.id)}
                  >
                    <Ionicons name="trash" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        );

      default:
        return (
          <View style={styles.tabContent}>
            {renderQuickStats()}
            {welcomeBonus && !welcomeBonus.claimed && renderWelcomeBonusCard()}
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="card" size={48} color="#667eea" />
          <Text style={styles.loadingText}>Loading Luma Bank...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (onClose) {
              onClose();
            } else if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              try {
                navigation.navigate('MenuMain');
              } catch (error) {
                // fallback
              }
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Luma Bank</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderBalanceCard()}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {[
            { key: 'overview', label: 'Overview', icon: 'home' },
            { key: 'payouts', label: 'Payouts', icon: 'cash' },
            { key: 'transactions', label: 'Transactions', icon: 'receipt' },
            { key: 'accounts', label: 'Accounts', icon: 'card' },
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

        {renderTabContent()}
        {/* Add a payout button at the bottom for easy access */}
        <TouchableOpacity style={styles.submitButton} onPress={() => setShowPayoutModal(true)}>
          <Ionicons name="cash-outline" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Request Payout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Payout Modal (all 5 methods) */}
      <PayoutModal
        visible={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSuccess={refreshData}
      />

      {/* Account Linking Modal */}
      <Modal visible={showAccountModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAccountModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Link Account</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Choose Payment Method</Text>
            
            <TouchableOpacity
              style={styles.paymentMethodOption}
              onPress={() => handleLinkAccount('apple_pay')}
            >
              <Ionicons name="logo-apple" size={32} color="#000" />
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>Apple Pay</Text>
                <Text style={styles.paymentMethodDescription}>
                  Link your Apple Pay account for instant payouts
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.paymentMethodOption}
              onPress={() => handleLinkAccount('google_pay')}
            >
              <Ionicons name="logo-google" size={32} color="#4285F4" />
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>Google Pay</Text>
                <Text style={styles.paymentMethodDescription}>
                  Link your Google Pay account for instant payouts
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Welcome Bonus Modal */}
      <Modal visible={showWelcomeBonusModal} animationType="fade" transparent>
        <BlurView intensity={20} style={styles.welcomeBonusModal}>
          <View style={styles.welcomeBonusModalContent}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.welcomeBonusModalGradient}
            >
              <Ionicons name="gift" size={64} color="#fff" />
              <Text style={styles.welcomeBonusModalTitle}>Welcome to Luma Bank!</Text>
              <Text style={styles.welcomeBonusModalAmount}>$2,500</Text>
              <Text style={styles.welcomeBonusModalDescription}>
                Claim your welcome bonus and start your financial journey with Luma Bank
              </Text>
              
              <TouchableOpacity
                style={styles.claimWelcomeButton}
                onPress={handleClaimWelcomeBonus}
              >
                <Text style={styles.claimWelcomeButtonText}>Claim Welcome Bonus</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => setShowWelcomeBonusModal(false)}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
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
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceContent: {
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  welcomeBonusCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  welcomeBonusGradient: {
    padding: 20,
  },
  welcomeBonusContent: {
    alignItems: 'center',
  },
  welcomeBonusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  welcomeBonusAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  welcomeBonusDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  claimButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  claimButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f0f2f5',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  activeTabLabel: {
    color: '#667eea',
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1c1e21',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  linkAccountButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  linkAccountButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  payoutItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutInfo: {
    flex: 1,
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1e21',
  },
  payoutDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  payoutStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1e21',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  accountItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountDetails: {
    marginLeft: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1e21',
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  unlinkButton: {
    padding: 8,
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
  modalPlaceholder: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1c1e21',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1e21',
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  welcomeBonusModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeBonusModalContent: {
    width: width * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  welcomeBonusModalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  welcomeBonusModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
  },
  welcomeBonusModalAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 16,
  },
  welcomeBonusModalDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  claimWelcomeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 16,
  },
  claimWelcomeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
}); 