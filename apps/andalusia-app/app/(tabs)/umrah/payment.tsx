import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useUmrahStore, useBookingStore } from '@/store';
import { banks, eWallets } from '@/data';
import { formatCurrency } from '@/utils';
import { Button, Card } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { PaymentMethod } from '@/types';

const paymentMethods: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'andalusia-wallet', label: 'Dompet Andalusia', icon: 'wallet' },
  { id: 'fpx', label: 'FPX Online Banking', icon: 'business' },
  { id: 'card', label: 'Kad Kredit/Debit', icon: 'card' },
  { id: 'ewallet', label: 'E-Wallet', icon: 'phone-portrait' },
  { id: 'bnpl', label: 'Ansuran (BNPL)', icon: 'calendar' },
];

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedPackage } = useUmrahStore();
  const { selectedPaymentMethod, setPaymentMethod, processPayment, createBooking, isProcessing } = useBookingStore();
  const [selectedBank, setSelectedBank] = useState('');

  if (!selectedPackage) return null;

  const handlePay = async () => {
    const bookingId = createBooking({
      itineraryId: 'itin-umrah-' + selectedPackage.tier,
      packageTitle: selectedPackage.title,
      tier: selectedPackage.tier,
      image: selectedPackage.image,
      startDate: '2026-05-10',
      endDate: '2026-05-19',
      status: 'pending',
      totalCost: selectedPackage.price,
      currency: 'MYR',
      travelers: 2,
      paymentMethod: selectedPaymentMethod,
      visaStatus: 'not_started',
      kursusProgress: 0,
      mutawifName: selectedPackage.mutawifName || 'Akan ditugaskan',
    });
    await processPayment(bookingId);
    router.replace('/(tabs)/umrah/payment-success');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Pembayaran" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Jumlah Bayaran</Text>
          <Text style={styles.amountValue}>{formatCurrency(selectedPackage.price)}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Kaedah Pembayaran</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, selectedPaymentMethod === method.id && styles.methodSelected]}
            onPress={() => setPaymentMethod(method.id)}
          >
            {method.id === 'andalusia-wallet' ? (
              <LinearGradient colors={['#059669', '#10B981']} style={styles.walletIcon}>
                <Ionicons name={method.icon as any} size={20} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={styles.methodIcon}>
                <Ionicons name={method.icon as any} size={20} color={selectedPaymentMethod === method.id ? Colors.primary : Colors.textSecondary} />
              </View>
            )}
            <Text style={[styles.methodLabel, selectedPaymentMethod === method.id && { color: Colors.primary }]}>{method.label}</Text>
            <Ionicons name={selectedPaymentMethod === method.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={selectedPaymentMethod === method.id ? Colors.primary : Colors.textTertiary} />
          </TouchableOpacity>
        ))}

        {selectedPaymentMethod === 'fpx' && (
          <View style={styles.bankGrid}>
            {banks.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={[styles.bankItem, selectedBank === bank.id && styles.bankSelected]}
                onPress={() => setSelectedBank(bank.id)}
              >
                <View style={[styles.bankIcon, { backgroundColor: bank.color + '20' }]}>
                  <Text style={[styles.bankIconText, { color: bank.color }]}>{bank.icon}</Text>
                </View>
                <Text style={styles.bankName}>{bank.shortName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedPaymentMethod === 'ewallet' && (
          <View style={styles.bankGrid}>
            {eWallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                style={[styles.bankItem, selectedBank === wallet.id && styles.bankSelected]}
                onPress={() => setSelectedBank(wallet.id)}
              >
                <View style={[styles.bankIcon, { backgroundColor: wallet.color + '20' }]}>
                  <Text style={[styles.bankIconText, { color: wallet.color }]}>{wallet.icon}</Text>
                </View>
                <Text style={styles.bankName}>{wallet.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Button title={isProcessing ? 'Memproses...' : `Bayar ${formatCurrency(selectedPackage.price)}`} onPress={handlePay} size="lg" fullWidth loading={isProcessing} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base },
  amountCard: { alignItems: 'center', marginBottom: Spacing.lg },
  amountLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  amountValue: { fontSize: Typography.sizes['3xl'], fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  sectionTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.md },
  methodCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.border, marginBottom: Spacing.sm, gap: Spacing.md },
  methodSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  methodIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  walletIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodLabel: { flex: 1, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  bankItem: { width: '23%', alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  bankSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  bankIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  bankIconText: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold },
  bankName: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.text, textAlign: 'center' },
  footer: { padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.borderLight },
});
