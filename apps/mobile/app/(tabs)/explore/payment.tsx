import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useTripStore, useBookingStore } from '@/store';
import { formatCurrency } from '@/utils';
import { Button, Card, Input } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { banks, eWallets } from '@/data';
import { PaymentMethod } from '@/types';

const paymentTabs: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'fpx', label: 'FPX', icon: 'business' },
  { id: 'card', label: 'Card', icon: 'card' },
  { id: 'ewallet', label: 'E-Wallet', icon: 'phone-portrait' },
  { id: 'bnpl', label: 'BNPL', icon: 'calendar' },
];

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedPackage, currentItinerary } = useTripStore();
  const { selectedPaymentMethod, setPaymentMethod, processPayment, createBooking, isProcessing } = useBookingStore();
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  if (!selectedPackage || !currentItinerary) return null;

  const handlePay = async () => {
    const bookingId = createBooking({
      itineraryId: currentItinerary.id,
      destination: currentItinerary.destination,
      image: selectedPackage.image,
      startDate: currentItinerary.startDate,
      endDate: currentItinerary.endDate,
      status: 'pending',
      totalCost: selectedPackage.price,
      currency: 'MYR',
      travelers: currentItinerary.travelers.adults,
      paymentMethod: selectedPaymentMethod,
    });
    await processPayment(bookingId);
    router.push('/(tabs)/explore/payment-success');
  };

  const renderPaymentContent = () => {
    switch (selectedPaymentMethod) {
      case 'fpx':
        return (
          <View style={styles.methodContent}>
            <Text style={styles.methodTitle}>Select Your Bank</Text>
            {banks.map((bank) => (
              <TouchableOpacity key={bank.id} style={[styles.bankOption, selectedBank === bank.id && styles.bankSelected]} onPress={() => setSelectedBank(bank.id)}>
                <View style={[styles.bankIcon, { backgroundColor: bank.color + '20' }]}>
                  <Text style={[styles.bankIconText, { color: bank.color }]}>{bank.icon}</Text>
                </View>
                <Text style={styles.bankName}>{bank.name}</Text>
                {selectedBank === bank.id && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'card':
        return (
          <View style={styles.methodContent}>
            <Input label="Card Number" placeholder="1234 5678 9012 3456" value={cardNumber} onChangeText={setCardNumber} keyboardType="numeric" />
            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              <View style={{ flex: 1 }}><Input label="Expiry" placeholder="MM/YY" value={expiry} onChangeText={setExpiry} /></View>
              <View style={{ flex: 1 }}><Input label="CVV" placeholder="123" value={cvv} onChangeText={setCvv} keyboardType="numeric" secureTextEntry /></View>
            </View>
          </View>
        );
      case 'ewallet':
        return (
          <View style={styles.methodContent}>
            <Text style={styles.methodTitle}>Select E-Wallet</Text>
            <View style={styles.walletGrid}>
              {eWallets.map((wallet) => (
                <TouchableOpacity key={wallet.id} style={[styles.walletOption, selectedWallet === wallet.id && styles.walletSelected]} onPress={() => setSelectedWallet(wallet.id)}>
                  <View style={[styles.walletIcon, { backgroundColor: wallet.color + '20' }]}>
                    <Text style={[styles.walletIconText, { color: wallet.color }]}>{wallet.icon}</Text>
                  </View>
                  <Text style={styles.walletName}>{wallet.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 'bnpl':
        return (
          <View style={styles.methodContent}>
            <Text style={styles.methodTitle}>Split into 3 payments</Text>
            <Card variant="outlined" style={styles.bnplCard}>
              {[
                { label: 'Today', amount: selectedPackage.price / 3 },
                { label: 'After 30 days', amount: selectedPackage.price / 3 },
                { label: 'After 60 days', amount: selectedPackage.price / 3 },
              ].map((payment, i) => (
                <View key={i} style={[styles.bnplRow, i < 2 && styles.bnplBorder]}>
                  <Text style={styles.bnplLabel}>{payment.label}</Text>
                  <Text style={styles.bnplAmount}>{formatCurrency(Math.ceil(payment.amount))}</Text>
                </View>
              ))}
            </Card>
            <Text style={styles.bnplNote}>0% interest - No hidden fees</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Payment" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Method Tabs */}
        <View style={styles.tabs}>
          {paymentTabs.map((tab) => (
            <TouchableOpacity key={tab.id} style={[styles.tab, selectedPaymentMethod === tab.id && styles.tabActive]} onPress={() => setPaymentMethod(tab.id)}>
              <Ionicons name={tab.icon as any} size={18} color={selectedPaymentMethod === tab.id ? Colors.primary : Colors.textTertiary} />
              <Text style={[styles.tabLabel, selectedPaymentMethod === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderPaymentContent()}

        {/* Order Summary */}
        <Card variant="outlined" style={styles.orderSummary}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Order Total</Text>
            <Text style={styles.orderTotal}>{formatCurrency(selectedPackage.price)}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button title={`Pay ${formatCurrency(selectedPackage.price)}`} onPress={handlePay} size="lg" fullWidth loading={isProcessing} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 40 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 4, marginBottom: Spacing.lg },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  tabActive: { backgroundColor: Colors.background, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } },
  tabLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary },
  tabLabelActive: { color: Colors.primary },
  methodContent: { marginBottom: Spacing.lg },
  methodTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.md },
  bankOption: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm, gap: Spacing.md },
  bankSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  bankIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bankIconText: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold },
  bankName: { flex: 1, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  walletGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  walletOption: { width: '47%', alignItems: 'center', padding: Spacing.base, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  walletSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  walletIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  walletIconText: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold },
  walletName: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  bnplCard: { marginBottom: Spacing.md },
  bnplRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  bnplBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  bnplLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  bnplAmount: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  bnplNote: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.success, textAlign: 'center' },
  orderSummary: { marginTop: Spacing.md },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  orderTotal: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  footer: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
});
