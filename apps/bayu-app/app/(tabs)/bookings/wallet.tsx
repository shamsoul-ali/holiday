import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useBookingStore } from '@/store';
import { formatCurrencyDecimal, formatDate } from '@/utils';
import { Card } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { wallet, transactions } = useBookingStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="My Wallet" />

      <LinearGradient colors={[...Colors.gradients.jungleMist]} style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrencyDecimal(wallet.balance)}</Text>
        <View style={styles.pointsRow}>
          <Ionicons name="diamond" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.pointsText}>{wallet.loyaltyPoints.toLocaleString()} points (worth {formatCurrencyDecimal(wallet.pointsValue)})</Text>
        </View>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.base, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => (
          <Card variant="outlined" padding={Spacing.md}>
            <View style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: item.type === 'credit' ? Colors.success + '15' : Colors.error + '15' }]}>
                <Ionicons name={item.type === 'credit' ? 'arrow-down' : 'arrow-up'} size={18} color={item.type === 'credit' ? Colors.success : Colors.error} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txDesc}>{item.description}</Text>
                <Text style={styles.txDate}>{formatDate(item.date)}</Text>
              </View>
              <Text style={[styles.txAmount, { color: item.type === 'credit' ? Colors.success : Colors.error }]}>
                {item.type === 'credit' ? '+' : '-'}{formatCurrencyDecimal(item.amount)}
              </Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  balanceCard: { margin: Spacing.base, borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center' },
  balanceLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  balanceAmount: { fontSize: Typography.sizes['3xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginTop: Spacing.xs },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.md },
  pointsText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  sectionTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txDesc: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  txDate: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 2 },
  txAmount: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold },
});
