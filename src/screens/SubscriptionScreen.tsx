import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { subscriptionService, SubscriptionPlan, Subscription, BillingHistory, SubscriptionInvoice } from '../services/SubscriptionService';
import { PaymentMethodSelector } from '../components/PaymentComponents';

const { width } = Dimensions.get('window');

export const SubscriptionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'current' | 'billing' | 'usage'>('plans');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPlans(),
        loadUserSubscriptions(),
        loadBillingHistory(),
        loadInvoices(),
      ]);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    const plansData = await subscriptionService.getSubscriptionPlans();
    setPlans(plansData);
  };

  const loadUserSubscriptions = async () => {
    const subscriptions = await subscriptionService.getUserSubscriptions();
    setUserSubscriptions(subscriptions);
  };

  const loadBillingHistory = async () => {
    const billing = await subscriptionService.getBillingHistory();
    setBillingHistory(billing);
  };

  const loadInvoices = async () => {
    const invoicesData = await subscriptionService.getInvoices();
    setInvoices(invoicesData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const confirmSubscription = async (paymentMethodId: string) => {
    if (!selectedPlan) return;

    try {
      await subscriptionService.createSubscription(selectedPlan.id, paymentMethodId);
      setShowPlanModal(false);
      setSelectedPlan(null);
      await loadUserSubscriptions();
      Alert.alert('Success', 'Subscription created successfully!');
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert('Error', 'Failed to create subscription');
    }
  };

  const handleCancelSubscription = async (subscription: Subscription) => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await subscriptionService.cancelSubscription(subscription.id);
              await loadUserSubscriptions();
              Alert.alert('Success', 'Subscription cancelled successfully');
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          },
        },
      ]
    );
  };

  const handleReactivateSubscription = async (subscription: Subscription) => {
    try {
      await subscriptionService.reactivateSubscription(subscription.id);
      await loadUserSubscriptions();
      Alert.alert('Success', 'Subscription reactivated successfully');
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      Alert.alert('Error', 'Failed to reactivate subscription');
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isPopular = plan.isPopular;
    const isSubscribed = userSubscriptions.some(sub => 
      sub.planId === plan.id && subscriptionService.isSubscriptionActive(sub)
    );

    return (
      <View key={plan.id} style={[styles.planCard, isPopular && styles.popularPlan]}>
        {isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}
        
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planDescription}>{plan.description}</Text>
        
        <View style={styles.planPrice}>
          <Text style={styles.priceAmount}>
            {subscriptionService.formatPrice(plan.price, plan.currency)}
          </Text>
          <Text style={styles.priceInterval}>
            /{subscriptionService.formatInterval(plan.interval, plan.intervalCount)}
          </Text>
        </View>

        {plan.trialDays && (
          <View style={styles.trialBadge}>
            <Text style={styles.trialText}>{plan.trialDays} days free trial</Text>
          </View>
        )}

        <View style={styles.featuresList}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.subscribeButton,
            isSubscribed && styles.subscribedButton
          ]}
          onPress={() => isSubscribed ? null : handleSubscribe(plan)}
          disabled={isSubscribed}
        >
          <Text style={styles.subscribeButtonText}>
            {isSubscribed ? 'Current Plan' : 'Subscribe'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSubscriptionCard = (subscription: Subscription) => {
    const plan = plans.find(p => p.id === subscription.planId);
    const isActive = subscriptionService.isSubscriptionActive(subscription);
    const isTrialing = subscriptionService.isSubscriptionTrialing(subscription);
    const daysUntilRenewal = subscriptionService.getDaysUntilRenewal(subscription);
    const trialDaysRemaining = subscriptionService.getTrialDaysRemaining(subscription);

    return (
      <View key={subscription.id} style={[styles.subscriptionCard, !isActive && styles.inactiveSubscription]}>
        <View style={styles.subscriptionHeader}>
          <Text style={styles.subscriptionPlanName}>{plan?.name || 'Unknown Plan'}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isActive ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.statusText}>{subscription.status}</Text>
          </View>
        </View>

        <View style={styles.subscriptionDetails}>
          <Text style={styles.subscriptionPeriod}>
            {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </Text>
          
          {isTrialing && trialDaysRemaining > 0 && (
            <Text style={styles.trialInfo}>
              Trial ends in {trialDaysRemaining} days
            </Text>
          )}
          
          {isActive && !isTrialing && (
            <Text style={styles.renewalInfo}>
              Renews in {daysUntilRenewal} days
            </Text>
          )}
        </View>

        <View style={styles.subscriptionActions}>
          {subscription.cancelAtPeriodEnd ? (
            <TouchableOpacity
              style={styles.reactivateButton}
              onPress={() => handleReactivateSubscription(subscription)}
            >
              <Text style={styles.reactivateButtonText}>Reactivate</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelSubscription(subscription)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderBillingItem = (billing: BillingHistory) => {
    return (
      <TouchableOpacity key={billing.id} style={styles.billingItem}>
        <View style={styles.billingHeader}>
          <Text style={styles.billingDescription}>{billing.description}</Text>
          <Text style={styles.billingAmount}>
            {subscriptionService.formatPrice(billing.amount, billing.currency)}
          </Text>
        </View>
        
        <View style={styles.billingDetails}>
          <Text style={styles.billingDate}>
            {new Date(billing.createdAt).toLocaleDateString()}
          </Text>
          <View style={[
            styles.billingStatus,
            { backgroundColor: billing.status === 'paid' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.billingStatusText}>{billing.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderInvoiceItem = (invoice: SubscriptionInvoice) => {
    return (
      <TouchableOpacity 
        key={invoice.id} 
        style={styles.invoiceItem}
        onPress={() => {
          setSelectedInvoice(invoice);
          setShowBillingModal(true);
        }}
      >
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          <Text style={styles.invoiceAmount}>
            {subscriptionService.formatPrice(invoice.amount, invoice.currency)}
          </Text>
        </View>
        
        <View style={styles.invoiceDetails}>
          <Text style={styles.invoiceDate}>
            Due: {new Date(invoice.dueDate).toLocaleDateString()}
          </Text>
          <View style={[
            styles.invoiceStatus,
            { backgroundColor: invoice.status === 'paid' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.invoiceStatusText}>{invoice.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading subscriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscriptions</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: 'plans', label: 'Plans', icon: 'card' },
          { key: 'current', label: 'Current', icon: 'checkmark-circle' },
          { key: 'billing', label: 'Billing', icon: 'receipt' },
          { key: 'usage', label: 'Usage', icon: 'analytics' },
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'plans' && (
          <View style={styles.plansContainer}>
            {plans.map(renderPlanCard)}
          </View>
        )}

        {activeTab === 'current' && (
          <View style={styles.currentContainer}>
            {userSubscriptions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No active subscriptions</Text>
                <Text style={styles.emptyStateSubtext}>
                  Choose a plan to get started
                </Text>
              </View>
            ) : (
              userSubscriptions.map(renderSubscriptionCard)
            )}
          </View>
        )}

        {activeTab === 'billing' && (
          <View style={styles.billingContainer}>
            <Text style={styles.sectionTitle}>Recent Billing</Text>
            {billingHistory.map(renderBillingItem)}
            
            <Text style={styles.sectionTitle}>Invoices</Text>
            {invoices.map(renderInvoiceItem)}
          </View>
        )}

        {activeTab === 'usage' && (
          <View style={styles.usageContainer}>
            <Text style={styles.sectionTitle}>Usage Analytics</Text>
            <Text style={styles.comingSoon}>Usage tracking coming soon!</Text>
          </View>
        )}
      </ScrollView>

      {/* Plan Selection Modal */}
      <Modal visible={showPlanModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPlanModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Subscribe to {selectedPlan?.name}</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          <View style={styles.modalContent}>
            {selectedPlan && (
              <View style={styles.planSummary}>
                <Text style={styles.planSummaryName}>{selectedPlan.name}</Text>
                <Text style={styles.planSummaryPrice}>
                  {subscriptionService.formatPrice(selectedPlan.price, selectedPlan.currency)}/
                  {subscriptionService.formatInterval(selectedPlan.interval, selectedPlan.intervalCount)}
                </Text>
                {selectedPlan.trialDays && (
                  <Text style={styles.planSummaryTrial}>
                    {selectedPlan.trialDays} days free trial
                  </Text>
                )}
              </View>
            )}
            
            <PaymentMethodSelector
              paymentMethods={[]} // This would be populated from PaymentService
              onSelectMethod={(method) => confirmSubscription(method.id)}
              onAddMethod={() => {
                setShowPlanModal(false);
                // Navigate to add payment method
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal visible={showBillingModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBillingModal(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Invoice Details</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedInvoice && (
              <View style={styles.invoiceDetail}>
                <View style={styles.invoiceDetailHeader}>
                  <Text style={styles.invoiceDetailNumber}>
                    Invoice #{selectedInvoice.invoiceNumber}
                  </Text>
                  <Text style={styles.invoiceDetailAmount}>
                    {subscriptionService.formatPrice(selectedInvoice.amount, selectedInvoice.currency)}
                  </Text>
                </View>
                
                <View style={styles.invoiceDetailInfo}>
                  <Text style={styles.invoiceDetailStatus}>
                    Status: {selectedInvoice.status}
                  </Text>
                  <Text style={styles.invoiceDetailDate}>
                    Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </Text>
                  {selectedInvoice.paidAt && (
                    <Text style={styles.invoiceDetailPaid}>
                      Paid: {new Date(selectedInvoice.paidAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                
                <View style={styles.invoiceItems}>
                  <Text style={styles.invoiceItemsTitle}>Items</Text>
                  {selectedInvoice.items.map((item) => (
                    <View key={item.id} style={styles.invoiceItemDetail}>
                      <Text style={styles.invoiceItemDescription}>{item.description}</Text>
                      <Text style={styles.invoiceItemAmount}>
                        {subscriptionService.formatPrice(item.amount, selectedInvoice.currency)}
                      </Text>
                    </View>
                  ))}
                </View>
                
                <TouchableOpacity style={styles.downloadButton}>
                  <Ionicons name="download" size={20} color="#667eea" />
                  <Text style={styles.downloadButtonText}>Download PDF</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabLabel: {
    color: '#667eea',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },

  // Plans Tab
  plansContainer: {
    padding: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  priceInterval: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  trialBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  trialText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1c1e21',
  },
  subscribeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribedButton: {
    backgroundColor: '#4CAF50',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Current Tab
  currentContainer: {
    padding: 16,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  inactiveSubscription: {
    opacity: 0.6,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionPlanName: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionDetails: {
    marginBottom: 12,
  },
  subscriptionPeriod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  trialInfo: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
  renewalInfo: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  subscriptionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reactivateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  reactivateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Billing Tab
  billingContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  billingItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  billingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billingDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  billingAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  billingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingDate: {
    fontSize: 14,
    color: '#666',
  },
  billingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  billingStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666',
  },
  invoiceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  invoiceStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Usage Tab
  usageContainer: {
    padding: 16,
  },
  comingSoon: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 32,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },

  // Modal Styles
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
    fontWeight: '600',
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
  planSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  planSummaryName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planSummaryPrice: {
    fontSize: 24,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  planSummaryTrial: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  invoiceDetail: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  invoiceDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  invoiceDetailNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  invoiceDetailAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  invoiceDetailInfo: {
    marginBottom: 16,
  },
  invoiceDetailStatus: {
    fontSize: 14,
    marginBottom: 4,
  },
  invoiceDetailDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  invoiceDetailPaid: {
    fontSize: 14,
    color: '#4CAF50',
  },
  invoiceItems: {
    marginBottom: 16,
  },
  invoiceItemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  invoiceItemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  invoiceItemDescription: {
    fontSize: 14,
  },
  invoiceItemAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  downloadButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 