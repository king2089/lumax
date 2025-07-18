import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useMonetization } from '../context/MonetizationContext';

const { width } = Dimensions.get('window');

export const MonetizationDashboard: React.FC = () => {
  const navigation = useNavigation();
  const {
    earnings,
    revenueStreams,
    creatorTier,
    paymentMethods,
    sponsorshipOffers,
    refreshEarnings,
    connectStripe,
    connectPayPal,
    toggleRevenueStream,
    acceptSponsorship,
    requestPayout,
  } = useMonetization();

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshEarnings();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTierBadgeColor = (): [string, string] => {
    switch (creatorTier.tier) {
      case 'diamond': return ['#E8EAF6', '#3F51B5'];
      case 'platinum': return ['#F3E5F5', '#9C27B0'];
      case 'gold': return ['#FFF8E1', '#FF9800'];
      case 'silver': return ['#F5F5F5', '#757575'];
      default: return ['#FFF3E0', '#FF5722'];
    }
  };

  const handleConnectPayment = async (type: 'stripe' | 'paypal') => {
    const success = type === 'stripe' ? await connectStripe() : await connectPayPal();
    if (success) {
      Alert.alert('Success!', `${type === 'stripe' ? 'Stripe' : 'PayPal'} connected successfully. You can now receive payments!`);
    }
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount > earnings.availableBalance) {
      Alert.alert('Insufficient Balance', 'The requested amount exceeds your available balance');
      return;
    }

    const defaultMethod = paymentMethods.find(m => m.isDefault);
    if (!defaultMethod) {
      Alert.alert('No Payment Method', 'Please add a payment method first');
      return;
    }

    const success = await requestPayout(amount, defaultMethod.id);
    if (success) {
      setShowPayoutModal(false);
      setPayoutAmount('');
      Alert.alert('Payout Requested!', `$${amount.toFixed(2)} will be transferred to your ${defaultMethod.name} within 1-3 business days.`);
    }
  };

  const handleToggleStream = async (streamId: string) => {
    await toggleRevenueStream(streamId);
  };

  const handleAcceptSponsorship = async (offerId: string) => {
    const success = await acceptSponsorship(offerId);
    if (success) {
      Alert.alert('Sponsorship Accepted!', 'You can now start working on this campaign. Payment will be released upon completion.');
    }
  };

  const renderEarningsCard = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.earningsCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.earningsHeader}>
        <View>
          <Text style={styles.earningsTitle}>Total Earnings</Text>
          <Text style={styles.earningsAmount}>{formatCurrency(earnings.totalEarnings)}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.earningsStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={styles.statValue}>{formatCurrency(earnings.weeklyEarnings)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Available</Text>
          <Text style={styles.statValue}>{formatCurrency(earnings.availableBalance)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statValue}>{formatCurrency(earnings.pendingPayouts)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.payoutButton}
        onPress={() => setShowPayoutModal(true)}
        disabled={earnings.availableBalance <= 0}
      >
        <Text style={styles.payoutButtonText}>Request Payout</Text>
        <Ionicons name="arrow-forward" size={20} color="#667eea" />
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderCreatorTierCard = () => (
    <View style={styles.tierCard}>
      <View style={styles.tierHeader}>
        <LinearGradient
          colors={getTierBadgeColor()}
          style={styles.tierBadge}
        >
          <Text style={styles.tierName}>{creatorTier.tier.toUpperCase()}</Text>
        </LinearGradient>
        <Text style={styles.tierDescription}>Creator Tier</Text>
      </View>
      
      <View style={styles.tierStats}>
        <View style={styles.tierStatItem}>
          <Text style={styles.tierStatLabel}>Max Weekly</Text>
          <Text style={styles.tierStatValue}>{formatCurrency(creatorTier.maxWeeklyEarnings)}</Text>
        </View>
        <View style={styles.tierStatItem}>
          <Text style={styles.tierStatLabel}>Commission</Text>
          <Text style={styles.tierStatValue}>{(creatorTier.commissionRate * 100).toFixed(0)}%</Text>
        </View>
      </View>

      <Text style={styles.tierFeaturesTitle}>Benefits:</Text>
      <View style={styles.tierFeatures}>
        {creatorTier.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={styles.tierFeature}>
            <Ionicons name="checkmark-circle" size={16} color="#00C853" />
            <Text style={styles.tierFeatureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monetization Hub</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="analytics" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderEarningsCard()}
        {renderCreatorTierCard()}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Revenue Streams</Text>
          
          {revenueStreams.map((stream) => (
            <View key={stream.id} style={styles.streamCard}>
              <View style={styles.streamHeader}>
                <View style={styles.streamInfo}>
                  <Text style={styles.streamName}>{stream.name}</Text>
                  <Text style={styles.streamDescription}>{stream.description}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.streamToggle,
                    { backgroundColor: stream.isActive ? '#00C853' : '#ccc' }
                  ]}
                  onPress={() => handleToggleStream(stream.id)}
                >
                  <Ionicons 
                    name={stream.isActive ? "checkmark" : "close"} 
                    size={16} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.streamStats}>
                <View style={styles.streamStat}>
                  <Text style={styles.streamStatLabel}>Earnings</Text>
                  <Text style={styles.streamStatValue}>{formatCurrency(stream.earnings)}</Text>
                </View>
                <View style={styles.streamStat}>
                  <Text style={styles.streamStatLabel}>Monthly Est.</Text>
                  <Text style={styles.streamStatValue}>{formatCurrency(stream.estimatedMonthly)}</Text>
                </View>
                <View style={styles.streamStat}>
                  <Text style={styles.streamStatLabel}>Conversion</Text>
                  <Text style={styles.streamStatValue}>{stream.conversionRate.toFixed(1)}%</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤝 Brand Partnership Offers</Text>
          
          {sponsorshipOffers.filter(offer => offer.status === 'pending').map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <View>
                  <Text style={styles.offerBrand}>{offer.brandName}</Text>
                  <Text style={styles.offerTitle}>{offer.campaignTitle}</Text>
                </View>
                <View style={styles.offerPayout}>
                  <Text style={styles.offerPayoutAmount}>{formatCurrency(offer.payout)}</Text>
                  <Text style={styles.offerPayoutLabel}>Payout</Text>
                </View>
              </View>
              
              <Text style={styles.offerDescription}>{offer.description}</Text>
              
              <View style={styles.offerRequirements}>
                <Text style={styles.requirementsTitle}>Requirements:</Text>
                {offer.requirements.map((req, index) => (
                  <Text key={index} style={styles.requirement}>• {req}</Text>
                ))}
              </View>
              
              <View style={styles.offerActions}>
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={() => Alert.alert('Offer Rejected', 'You have declined this sponsorship offer.')}
                >
                  <Text style={styles.rejectButtonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => handleAcceptSponsorship(offer.id)}
                >
                  <Text style={styles.acceptButtonText}>Accept Offer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Methods</Text>
          
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Connect your payment methods to start earning</Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity 
                  style={styles.paymentOption}
                  onPress={() => handleConnectPayment('stripe')}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.paymentGradient}
                  >
                    <Ionicons name="card" size={24} color="#fff" />
                    <Text style={styles.paymentOptionText}>Connect Stripe</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.paymentOption}
                  onPress={() => handleConnectPayment('paypal')}
                >
                  <LinearGradient
                    colors={['#00C853', '#4CAF50']}
                    style={styles.paymentGradient}
                  >
                    <Ionicons name="logo-paypal" size={24} color="#fff" />
                    <Text style={styles.paymentOptionText}>Connect PayPal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            paymentMethods.map((method) => (
              <View key={method.id} style={styles.paymentMethod}>
                <View style={styles.paymentInfo}>
                  <Ionicons 
                    name={method.type === 'stripe' ? 'card' : 'logo-paypal'} 
                    size={24} 
                    color="#667eea" 
                  />
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentName}>{method.name}</Text>
                    <Text style={styles.paymentDetailsText}>{method.details}</Text>
                  </View>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Payout Modal */}
      <Modal
        visible={showPayoutModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Payout</Text>
            <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.availableBalance}>
              Available: {formatCurrency(earnings.availableBalance)}
            </Text>
            
            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount"
              value={payoutAmount}
              onChangeText={setPayoutAmount}
              keyboardType="numeric"
            />
            
            <TouchableOpacity 
              style={styles.requestButton}
              onPress={handleRequestPayout}
            >
              <Text style={styles.requestButtonText}>Request Payout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  earningsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  earningsTitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  payoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
  },
  payoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginRight: 8,
  },
  tierCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  tierName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  tierDescription: {
    fontSize: 16,
    fontWeight: '600',
  },
  tierStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tierStatItem: {
    flex: 1,
  },
  tierStatLabel: {
    fontSize: 14,
    color: '#65676b',
  },
  tierStatValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  tierFeaturesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tierFeatures: {
    gap: 4,
  },
  tierFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierFeatureText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#65676b',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  streamCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  streamInfo: {
    flex: 1,
  },
  streamName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  streamDescription: {
    fontSize: 14,
    color: '#65676b',
  },
  streamToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streamStat: {
    alignItems: 'center',
  },
  streamStatLabel: {
    fontSize: 12,
    color: '#65676b',
  },
  streamStatValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  offerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  offerBrand: {
    fontSize: 16,
    fontWeight: '600',
  },
  offerTitle: {
    fontSize: 14,
    color: '#65676b',
  },
  offerPayout: {
    alignItems: 'flex-end',
  },
  offerPayoutAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00C853',
  },
  offerPayoutLabel: {
    fontSize: 12,
    color: '#65676b',
  },
  offerDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  offerRequirements: {
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 14,
    color: '#65676b',
    marginBottom: 4,
  },
  offerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#65676b',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#00C853',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#65676b',
    marginBottom: 20,
    textAlign: 'center',
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentOption: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  paymentGradient: {
    padding: 16,
    alignItems: 'center',
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  paymentMethod: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDetails: {
    marginLeft: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentDetailsText: {
    fontSize: 14,
    color: '#65676b',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C853',
  },
  bottomSpacer: {
    height: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  availableBalance: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
    paddingVertical: 12,
    marginBottom: 30,
  },
  requestButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
}); 