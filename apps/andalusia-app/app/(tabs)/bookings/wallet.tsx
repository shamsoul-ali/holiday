import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useBookingStore } from '@/store';
import { formatCurrencyDecimal, getRelativeTime } from '@/utils';
import { Card } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { WalletTransaction } from '@/types';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { wallet, transactions } = useBookingStore();

  const renderTransaction = ({ item }: { item: WalletTransaction }) => (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: item.type === 'credit' ? Colors.success + '15' : Colors.error + '15' }]}>
        <Ionicons name={item.type === 'credit' ? 'arrow-down' : 'arrow-up'} size={18} color={item.type === 'credit' ? Colors.success : Colors.error} />
      </View>
      <View style={styles.txContent}>
        <Text style={styles.txDesc}>{item.description}</Text>
        <Text style={styles.txDate}>{getRelativeTime(item.date)}</Text>
      </View>
      <Text style={[styles.txAmount, { color: item.type === 'credit' ? Colors.success : Colors.error }]}>
        {item.type === 'credit' ? '+' : '-'}{formatCurrencyDecimal(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Dompet Andalusia" />

      <LinearGradient colors={['#059669', '#10B981']} style={styles.walletCard}>
        <Text style={styles.walletLabel}>Baki Dompet</Text>
        <Text style={styles.walletBalance}>{formatCurrencyDecimal(wallet.balance)}</Text>
        <View style={styles.walletRow}>
          <View style={styles.walletStat}>
            <Ionicons name="star" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.walletStatText}>{wallet.loyaltyPoints.toLocaleString()} mata</Text>
          </View>
          <Text style={styles.walletStatText}>= {formatCurrencyDecimal(wallet.pointsValue)}</Text>
        </View>
      </LinearGradient>

      <Text style={styles.historyTitle}>Sejarah Transaksi</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={{ paddingHorizontal: Spacing.base, paddingBottom: insets.bottom + 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  walletCard: { marginHorizontal: Spacing.base, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.lg },
  walletLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  walletBalance: { fontSize: Typography.sizes['3xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginVertical: Spacing.xs },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletStatText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: 'rgba(255,255,255,0.9)' },
  historyTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.md },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txContent: { flex: 1 },
  txDesc: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.text },
  txDate: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 2 },
  txAmount: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold },
});
