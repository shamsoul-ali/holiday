import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { LinearGradient } from 'expo-linear-gradient';
import { useTripStore, useBookingStore } from '@/store';
import { useGamificationStore } from '@/store';
import { formatCurrency } from '@/utils';
import { Button, Card, Input } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { banks, eWallets } from '@/data';
import { PaymentMethod } from '@/types';

const paymentTabs: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'bayu-credit', label: 'Bayu', icon: 'wallet' },
  { id: 'fpx', label: 'FPX', icon: 'business' },
  { id: 'card', label: 'Card', icon: 'card' },
  { id: 'ewallet', label: 'E-Wallet', icon: 'phone-portrait' },
  { id: 'bnpl', label: 'BNPL', icon: 'calendar' },
];

const topUpAmounts = [500, 1000, 2000];

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedPackage, currentItinerary } = useTripStore();
  const { selectedPaymentMethod, setPaymentMethod, processPayment, createBooking, isProcessing, wallet, topUpWallet } = useBookingStore();
  const { stats } = useGamificationStore();
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [topUpAmount, setTopUpAmount] = useState(1000);

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

  const walletBalance = wallet.balance;
  const canPayFull = walletBalance >= selectedPackage.price;
  const pointsDiscount = Math.min(Math.floor(wallet.loyaltyPoints / 100), Math.floor(selectedPackage.price * 0.1));

  const handleTopUp = async () => {
    await topUpWallet(topUpAmount);
  };

  const renderPaymentContent = () => {
    switch (selectedPaymentMethod) {
      case 'bayu-credit':
        return (
          <View style={styles.methodContent}>
            {/* Wallet Card */}
            <LinearGradient
              colors={[...Colors.gradients.memberCard]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.creditCard}
            >
              <View style={styles.creditTopRow}>
                <View style={styles.creditLogoRow}>
                  <View style={styles.creditLogo}>
                    <Ionicons name="wallet" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.creditBrand}>Bayu Wallet</Text>
                </View>
                <View style={styles.creditLevelBadge}>
                  <Ionicons name="shield-checkmark" size={10} color="#FFD700" />
                  <Text style={styles.creditLevelText}>Lvl {stats.level}</Text>
                </View>
              </View>
              <Text style={styles.creditBalanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.creditBalanceValue}>RM {walletBalance.toFixed(2)}</Text>
              <View style={styles.creditPointsRow}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.creditPointsText}>{wallet.loyaltyPoints.toLocaleString()} reward points</Text>
              </View>
            </LinearGradient>

            {/* Payment Breakdown */}
            <Card variant="outlined" style={{ marginTop: Spacing.lg }}>
              <View style={[styles.creditRow, styles.creditRowBorder]}>
                <Text style={styles.creditRowLabel}>Trip Cost</Text>
                <Text style={styles.creditRowValue}>{formatCurrency(selectedPackage.price)}</Text>
              </View>
              {pointsDiscount > 0 && (
                <View style={[styles.creditRow, styles.creditRowBorder]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.creditRowLabel}>Points Discount</Text>
                  </View>
                  <Text style={[styles.creditRowValue, { color: Colors.success }]}>-{formatCurrency(pointsDiscount)}</Text>
                </View>
              )}
              <View style={styles.creditRow}>
                <Text style={styles.creditRowLabel}>Wallet Debit</Text>
                <Text style={[styles.creditRowValue, { color: Colors.primary, fontFamily: Typography.fonts.headingBold }]}>
                  {formatCurrency(selectedPackage.price - pointsDiscount)}
                </Text>
              </View>
            </Card>

            {canPayFull ? (
              <View style={styles.creditStatusRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={[styles.creditStatusText, { color: Colors.success }]}>Sufficient balance</Text>
              </View>
            ) : (
              <View>
                <View style={styles.creditStatusRow}>
                  <Ionicons name="alert-circle" size={20} color={Colors.warning} />
                  <Text style={[styles.creditStatusText, { color: Colors.warning }]}>
                    Shortfall of {formatCurrency(selectedPackage.price - pointsDiscount - walletBalance)}
                  </Text>
                </View>

                {/* Top Up UI */}
                <Card variant="outlined" style={styles.topUpCard}>
                  <Text style={styles.topUpTitle}>Top Up Wallet</Text>
                  <View style={styles.topUpChips}>
                    {topUpAmounts.map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        style={[styles.topUpChip, topUpAmount === amount && styles.topUpChipActive]}
                        onPress={() => setTopUpAmount(amount)}
                      >
                        <Text style={[styles.topUpChipText, topUpAmount === amount && styles.topUpChipTextActive]}>
                          RM {amount.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Button
                    title={`Top Up RM ${topUpAmount.toLocaleString()}`}
                    onPress={handleTopUp}
                    size="md"
                    fullWidth
                    loading={isProcessing}
                    icon={<Ionicons name="add-circle" size={18} color="#FFFFFF" />}
                  />
                </Card>
              </View>
            )}

            <Text style={styles.creditEarnNote}>
              Earn {Math.floor(selectedPackage.price / 10)} points from this booking
            </Text>
          </View>
        );
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
              {eWallets.map((ew) => (
                <TouchableOpacity key={ew.id} style={[styles.walletOption, selectedWallet === ew.id && styles.walletSelected]} onPress={() => setSelectedWallet(ew.id)}>
                  <View style={[styles.walletIcon, { backgroundColor: ew.color + '20' }]}>
                    <Text style={[styles.walletIconText, { color: ew.color }]}>{ew.icon}</Text>
                  </View>
                  <Text style={styles.walletName}>{ew.name}</Text>
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
              {tab.id === 'bayu-credit' && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>25% OFF</Text>
                </View>
              )}
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

      <View style={[styles.footer, { paddingBottom: insets.bottom + 80 }]}>
        <Button title={`Pay ${formatCurrency(selectedPackage.price)}`} onPress={handlePay} size="lg" fullWidth loading={isProcessing} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 100 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 4, marginBottom: Spacing.lg },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  tabActive: { backgroundColor: Colors.background, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } },
  tabLabel: { fontSize: 11, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary },
  tabLabelActive: { color: Colors.primary },
  tabBadge: { position: 'absolute', top: -6, right: -4, backgroundColor: Colors.accentRed, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  tabBadgeText: { fontSize: 7, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', letterSpacing: 0.3 },
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
  // Bayu Credit styles
  creditCard: { borderRadius: 16, padding: Spacing.lg, overflow: 'hidden' },
  creditTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  creditLogoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  creditLogo: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  creditBrand: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', letterSpacing: 0.5 },
  creditLevelBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  creditLevelText: { fontSize: 10, fontFamily: Typography.fonts.bodySemiBold, color: '#FFD700' },
  creditBalanceLabel: { fontSize: 9, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5 },
  creditBalanceValue: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginTop: 2 },
  creditPointsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  creditPointsText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.7)' },
  creditRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  creditRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  creditRowLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  creditRowValue: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  creditStatusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  creditStatusText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, flex: 1 },
  creditEarnNote: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.primary, textAlign: 'center', marginTop: Spacing.lg },
  // Top Up styles
  topUpCard: { marginTop: Spacing.md },
  topUpTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.md },
  topUpChips: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  topUpChip: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  topUpChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  topUpChipText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  topUpChipTextActive: { color: '#FFFFFF' },
});
