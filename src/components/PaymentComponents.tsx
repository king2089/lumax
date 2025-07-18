import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PaymentMethod, Transaction, Payout } from '../services/PaymentService';

const { width } = Dimensions.get('window');

// Payment Card Component
interface PaymentCardProps {
  type: 'apple_pay' | 'google_pay' | 'card';
  lastFour?: string;
  brand?: string;
  isDefault?: boolean;
  isActive?: boolean;
  onPress?: () => void;
  onSetDefault?: () => void;
  onRemove?: () => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  type,
  lastFour,
  brand,
  isDefault = false,
  isActive = true,
  onPress,
  onSetDefault,
  onRemove,
}) => {
  const getCardIcon = () => {
    switch (type) {
      case 'apple_pay':
        return 'logo-apple';
      case 'google_pay':
        return 'logo-google';
      default:
        return 'card';
    }
  };

  const getCardColor = () => {
    switch (type) {
      case 'apple_pay':
        return '#000000';
      case 'google_pay':
        return '#4285F4';
      default:
        return '#667eea';
    }
  };

  const getCardName = () => {
    switch (type) {
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return brand || 'Card';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.paymentCard, !isActive && styles.inactiveCard]}
      onPress={onPress}
      disabled={!isActive}
    >
      <LinearGradient
        colors={[getCardColor(), getCardColor() + '80']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name={getCardIcon() as any} size={24} color="#fff" />
          </View>
          {isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.cardName}>{getCardName()}</Text>
        {lastFour && (
          <Text style={styles.cardNumber}>•••• {lastFour}</Text>
        )}
        
        <View style={styles.cardActions}>
          {!isDefault && onSetDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSetDefault}
            >
              <Text style={styles.actionButtonText}>Set Default</Text>
            </TouchableOpacity>
          )}
          {onRemove && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={onRemove}
            >
              <Ionicons name="trash" size={16} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Transaction Item Component
interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
}) => {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'purchase':
        return 'card';
      case 'refund':
        return 'arrow-up-circle';
      case 'payout':
        return 'cash';
      default:
        return 'card';
    }
  };

  const getTransactionColor = () => {
    switch (transaction.type) {
      case 'purchase':
        return '#F44336';
      case 'refund':
      case 'payout':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return '#666';
    }
  };

  return (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={onPress}
    >
      <View style={styles.transactionIcon}>
        <Ionicons
          name={getTransactionIcon() as any}
          size={20}
          color={getTransactionColor()}
        />
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>
          {transaction.description}
        </Text>
        <Text style={styles.transactionMerchant}>
          {transaction.merchant}
        </Text>
        <Text style={styles.transactionDate}>
          {new Date(transaction.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: getTransactionColor() }
        ]}>
          {transaction.type === 'purchase' ? '-' : '+'}{transaction.amount}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor() }
        ]}>
          <Text style={styles.statusText}>{transaction.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Payout Item Component
interface PayoutItemProps {
  payout: Payout;
  onPress?: () => void;
}

export const PayoutItem: React.FC<PayoutItemProps> = ({
  payout,
  onPress,
}) => {
  const getStatusColor = () => {
    switch (payout.status) {
      case 'completed':
        return '#4CAF50';
      case 'processing':
        return '#FF9800';
      case 'pending':
        return '#2196F3';
      case 'failed':
        return '#F44336';
      default:
        return '#666';
    }
  };

  return (
    <TouchableOpacity
      style={styles.payoutItem}
      onPress={onPress}
    >
      <View style={styles.payoutIcon}>
        <Ionicons name="cash" size={20} color="#4CAF50" />
      </View>
      
      <View style={styles.payoutDetails}>
        <Text style={styles.payoutAmount}>{payout.amount}</Text>
        <Text style={styles.payoutFee}>Fee: {payout.fee}</Text>
        <Text style={styles.payoutDate}>
          {new Date(payout.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.payoutStatus}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor() }
        ]}>
          <Text style={styles.statusText}>{payout.status}</Text>
        </View>
        <Text style={styles.netAmount}>Net: {payout.netAmount}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Payment Method Selector Component
interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedMethod?: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  onAddMethod?: () => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethods,
  selectedMethod,
  onSelectMethod,
  onAddMethod,
}) => {
  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Payment Method</Text>
      
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodOption,
            selectedMethod?.id === method.id && styles.selectedMethod
          ]}
          onPress={() => onSelectMethod(method)}
        >
          <View style={styles.methodOptionIcon}>
            <Ionicons
              name={method.type === 'apple_pay' ? 'logo-apple' : 'logo-google'}
              size={24}
              color={method.type === 'apple_pay' ? '#000' : '#4285F4'}
            />
          </View>
          
          <View style={styles.methodOptionDetails}>
            <Text style={styles.methodOptionName}>
              {method.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
            </Text>
            {method.lastFour && (
              <Text style={styles.methodOptionLastFour}>
                •••• {method.lastFour}
              </Text>
            )}
          </View>
          
          {selectedMethod?.id === method.id && (
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          )}
        </TouchableOpacity>
      ))}
      
      {onAddMethod && (
        <TouchableOpacity
          style={styles.addMethodOption}
          onPress={onAddMethod}
        >
          <Ionicons name="add-circle" size={24} color="#667eea" />
          <Text style={styles.addMethodText}>Add Payment Method</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Payment Form Component
interface PaymentFormProps {
  amount: string;
  description: string;
  onAmountChange: (amount: string) => void;
  onDescriptionChange: (description: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  submitText?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  description,
  onAmountChange,
  onDescriptionChange,
  onSubmit,
  isLoading = false,
  submitText = 'Pay Now',
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = () => {
    if (!amount || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    setShowConfirmation(true);
  };

  const confirmPayment = () => {
    setShowConfirmation(false);
    onSubmit();
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Amount</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={onAmountChange}
          placeholder="0.00"
          keyboardType="decimal-pad"
          placeholderTextColor="#999"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="What's this payment for?"
          placeholderTextColor="#999"
          multiline
        />
      </View>
      
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{submitText}</Text>
        )}
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Confirm Payment</Text>
            <Text style={styles.confirmationAmount}>
              ${parseFloat(amount).toFixed(2)}
            </Text>
            <Text style={styles.confirmationDescription}>{description}</Text>
            
            <View style={styles.confirmationActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmPayment}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Fee Calculator Component
interface FeeCalculatorProps {
  amount: number;
  feePercentage?: number;
  feeFixed?: number;
}

export const FeeCalculator: React.FC<FeeCalculatorProps> = ({
  amount,
  feePercentage = 0.029,
  feeFixed = 0.25,
}) => {
  const fee = Math.max(feeFixed, amount * feePercentage);
  const netAmount = amount - fee;

  return (
    <View style={styles.feeCalculator}>
      <Text style={styles.feeTitle}>Fee Breakdown</Text>
      
      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>Amount:</Text>
        <Text style={styles.feeValue}>${amount.toFixed(2)}</Text>
      </View>
      
      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>Fee:</Text>
        <Text style={styles.feeValue}>-${fee.toFixed(2)}</Text>
      </View>
      
      <View style={[styles.feeRow, styles.netAmountRow]}>
        <Text style={styles.netAmountLabel}>Net Amount:</Text>
        <Text style={styles.netAmountValue}>${netAmount.toFixed(2)}</Text>
      </View>
    </View>
  );
};

// Loading Payment Component
interface LoadingPaymentProps {
  message?: string;
}

export const LoadingPayment: React.FC<LoadingPaymentProps> = ({
  message = 'Processing payment...',
}) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#667eea" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Payment Card Styles
  paymentCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  inactiveCard: {
    opacity: 0.5,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },

  // Transaction Item Styles
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
  transactionMerchant: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },

  // Payout Item Styles
  payoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  payoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  payoutDetails: {
    flex: 1,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  payoutFee: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  payoutDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  payoutStatus: {
    alignItems: 'flex-end',
  },
  netAmount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  // Payment Method Selector Styles
  selectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e4e6eb',
  },
  selectedMethod: {
    borderColor: '#667eea',
    backgroundColor: '#f0f2f5',
  },
  methodOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodOptionDetails: {
    flex: 1,
  },
  methodOptionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  methodOptionLastFour: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
  },
  addMethodText: {
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 8,
  },

  // Payment Form Styles
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1c1e21',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#e4e6eb',
    paddingVertical: 8,
    textAlign: 'center',
  },
  descriptionInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
    paddingVertical: 8,
    minHeight: 40,
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width * 0.8,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  confirmationAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  confirmationDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Fee Calculator Styles
  feeCalculator: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  feeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  netAmountRow: {
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
    paddingTop: 8,
    marginTop: 8,
  },
  netAmountLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  netAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
}); 