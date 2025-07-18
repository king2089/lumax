import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CardField, useStripe } from '@stripe/stripe-react-native';

const TABS = [
  { key: 'apple', label: 'Apple Pay', icon: 'logo-apple' },
  { key: 'google', label: 'Google Pay', icon: 'logo-google' },
  { key: 'card', label: 'Card', icon: 'card' },
  { key: 'bank', label: 'Bank', icon: 'business' },
  { key: 'paypal', label: 'PayPal', icon: 'logo-paypal' },
];

export const PayoutModal = ({ visible, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('card');
  const [amount, setAmount] = useState('');
  const [cardDetails, setCardDetails] = useState({});
  const [bankInfo, setBankInfo] = useState({ account: '', routing: '' });
  const [paypalEmail, setPaypalEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { createToken } = useStripe();

  const handlePayout = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let payload = { amount };
      if (activeTab === 'card') {
        const { token, error } = await createToken({ type: 'Card', ...cardDetails });
        if (error || !token) throw new Error(error?.message || 'Card error');
        endpoint = '/api/payouts/card';
        payload = { ...payload, cardToken: token.id };
      } else if (activeTab === 'bank') {
        endpoint = '/api/payouts/bank';
        payload = { ...payload, account: bankInfo.account, routing: bankInfo.routing };
      } else if (activeTab === 'paypal') {
        endpoint = '/api/payouts/paypal';
        payload = { ...payload, email: paypalEmail };
      } else if (activeTab === 'apple') {
        endpoint = '/api/payouts/applepay';
      } else if (activeTab === 'google') {
        endpoint = '/api/payouts/googlepay';
      }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Payout failed');
      onSuccess && onSuccess();
      Alert.alert('Success', 'Payout requested!');
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message || 'Payout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.activeTab]} onPress={() => setActiveTab(tab.key)}>
              <Ionicons name={tab.icon} size={24} color={activeTab === tab.key ? '#667eea' : '#888'} />
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Amount (USD)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          {activeTab === 'card' && (
            <CardField postalCodeEnabled={false} placeholders={{ number: '4242 4242 4242 4242' }} cardStyle={styles.cardField} style={{ height: 50, marginVertical: 10 }} onCardChange={setCardDetails} />
          )}
          {activeTab === 'bank' && (
            <>
              <TextInput style={styles.input} placeholder="Account Number" value={bankInfo.account} onChangeText={v => setBankInfo({ ...bankInfo, account: v })} />
              <TextInput style={styles.input} placeholder="Routing Number" value={bankInfo.routing} onChangeText={v => setBankInfo({ ...bankInfo, routing: v })} />
            </>
          )}
          {activeTab === 'paypal' && (
            <TextInput style={styles.input} placeholder="PayPal Email" value={paypalEmail} onChangeText={setPaypalEmail} autoCapitalize="none" />
          )}
          {/* Apple/Google Pay tabs can show info or a button if needed */}
          {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : <TouchableOpacity style={styles.submit} onPress={handlePayout}><Text style={styles.submitText}>Request Payout</Text></TouchableOpacity>}
          <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  tab: { alignItems: 'center', padding: 8 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#667eea' },
  tabLabel: { fontSize: 12, color: '#888' },
  activeTabLabel: { color: '#667eea', fontWeight: 'bold' },
  form: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 12 },
  cardField: { backgroundColor: '#f8f9fa', borderRadius: 8 },
  submit: { backgroundColor: '#667eea', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontWeight: 'bold' },
  cancel: { alignItems: 'center', marginTop: 16 },
  cancelText: { color: '#888' },
}); 