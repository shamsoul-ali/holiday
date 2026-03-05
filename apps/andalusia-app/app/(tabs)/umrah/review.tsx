import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useUmrahStore } from '@/store';
import { formatCurrency } from '@/utils';
import { Button, Card, StarRating } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedPackage, addOns } = useUmrahStore();

  if (!selectedPackage) return null;

  const addOnTotal = addOns.reduce((sum, a) => {
    const match = a.match(/RM([\d,]+)/);
    return sum + (match ? parseInt(match[1].replace(',', '')) : 0);
  }, 0);

  const total = selectedPackage.price + addOnTotal;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Semakan Tempahan" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        <Card style={styles.packageCard}>
          <Text style={styles.packageTitle}>{selectedPackage.title}</Text>
          <StarRating rating={selectedPackage.rating} />
          <View style={styles.detailRow}>
            <Ionicons name="business" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Makkah: {selectedPackage.hotelMakkah}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="business" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Madinah: {selectedPackage.hotelMadinah}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="airplane" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{selectedPackage.airline} - {selectedPackage.flightClass}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Mutawif: {selectedPackage.mutawifName || 'Akan ditugaskan'}</Text>
          </View>
        </Card>

        <Card style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Pecahan Harga</Text>
          {Object.entries(selectedPackage.priceBreakdown).filter(([k]) => k !== 'total').map(([key, value]) => (
            <View key={key} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(value as number)}</Text>
            </View>
          ))}
          {addOns.map((addOn) => (
            <View key={addOn} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{addOn.split('(')[0].trim()}</Text>
              <Text style={styles.breakdownValue}>+{addOn.match(/RM[\d,]+/)?.[0]}</Text>
            </View>
          ))}
          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Jumlah</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerTotal}>{formatCurrency(total)}</Text>
          <Text style={styles.footerPer}>/orang</Text>
        </View>
        <Button title="Teruskan Bayaran" onPress={() => router.push('/(tabs)/umrah/payment')} size="lg" style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base },
  packageCard: { marginBottom: Spacing.base, gap: Spacing.sm },
  packageTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  detailText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  breakdownCard: { gap: Spacing.sm },
  breakdownTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.xs },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  breakdownLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  breakdownValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: Spacing.sm },
  totalLabel: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  totalValue: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  footer: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: Spacing.md },
  footerPrice: { alignItems: 'center' },
  footerTotal: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  footerPer: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
});
