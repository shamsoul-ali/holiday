import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useTripStore } from '@/store';
import { sabahDestinations } from '@/data';
import { formatCurrency, formatDateRange, formatDurationLabel } from '@/utils';
import { Button, Card, Chip } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { EcoImpactCard } from '@/components/trip/EcoImpactCard';

const addOns = [
  { id: 'wifi', label: 'Pocket WiFi', price: 50, icon: 'wifi' },
  { id: 'lounge', label: 'Airport Lounge', price: 120, icon: 'wine' },
  { id: 'photo', label: 'Photo Package', price: 200, icon: 'camera' },
  { id: 'halal_guide', label: 'Halal Food Guide', price: 0, icon: 'restaurant' },
];

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedPackage, currentItinerary, wizard, addOns: selectedAddOns, toggleAddOn } = useTripStore();

  if (!selectedPackage || !currentItinerary) return null;

  const addOnTotal = addOns
    .filter((a) => selectedAddOns.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const grandTotal = selectedPackage.price + addOnTotal;

  const destination = currentItinerary.destinationId
    ? sabahDestinations.find((d) => d.id === currentItinerary.destinationId)
    : undefined;
  const travelerCount = (currentItinerary.travelers.adults || 0) + (currentItinerary.travelers.children || 0) || 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Review Booking" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trip Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Trip Summary</Text>
          <View style={styles.row}><Text style={styles.label}>Destination</Text><Text style={styles.value}>{currentItinerary.destination}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Duration</Text><Text style={styles.value}>{wizard.duration} ({formatDurationLabel(wizard.duration)})</Text></View>
          <View style={styles.row}><Text style={styles.label}>Dates</Text><Text style={styles.value}>{formatDateRange(currentItinerary.startDate, currentItinerary.endDate)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>From</Text><Text style={styles.value}>{currentItinerary.departureCity}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Travelers</Text><Text style={styles.value}>{currentItinerary.travelers.adults} Adults{currentItinerary.travelers.children > 0 ? `, ${currentItinerary.travelers.children} Children` : ''}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Package</Text><Text style={styles.value}>{selectedPackage.title}</Text></View>
        </Card>

        {/* Price Breakdown */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.row}><Text style={styles.label}>Flights</Text><Text style={styles.value}>{formatCurrency(selectedPackage.priceBreakdown.flights)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Accommodation</Text><Text style={styles.value}>{formatCurrency(selectedPackage.priceBreakdown.accommodation)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Meals</Text><Text style={styles.value}>{formatCurrency(selectedPackage.priceBreakdown.meals)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Activities</Text><Text style={styles.value}>{formatCurrency(selectedPackage.priceBreakdown.activities)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Transport</Text><Text style={styles.value}>{formatCurrency(selectedPackage.priceBreakdown.transport)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Insurance</Text><Text style={styles.value}>{formatCurrency(selectedPackage.priceBreakdown.insurance)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Taxes & Fees</Text><Text style={styles.value}>{formatCurrency(selectedPackage.priceBreakdown.taxes)}</Text></View>
          <View style={[styles.row, styles.totalRow]}><Text style={styles.totalLabel}>Package Total</Text><Text style={styles.totalValue}>{formatCurrency(selectedPackage.price)}</Text></View>
        </Card>

        {/* Eco Impact — sustainability pitch piece */}
        <View style={{ marginBottom: Spacing.md }}>
          <EcoImpactCard package={selectedPackage} destination={destination} travelers={travelerCount} />
        </View>

        {/* Add-ons */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Add-ons</Text>
          {addOns.map((addon) => (
            <Chip
              key={addon.id}
              label={`${addon.label} ${addon.price > 0 ? `+${formatCurrency(addon.price)}` : 'FREE'}`}
              selected={selectedAddOns.includes(addon.id)}
              onPress={() => toggleAddOn(addon.id)}
              icon={<Ionicons name={addon.icon as any} size={16} color={selectedAddOns.includes(addon.id) ? Colors.primary : Colors.textTertiary} />}
            />
          ))}
        </Card>

        {/* Grand Total */}
        <Card style={{ ...styles.summaryCard, backgroundColor: Colors.primary + '08', borderColor: Colors.primary + '20' }} variant="outlined">
          <View style={styles.row}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 80 }]}>
        <Button title="Proceed to Payment" onPress={() => router.push('/(tabs)/explore/payment')} size="lg" fullWidth icon={<Ionicons name="card" size={18} color="#fff" />} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 100 },
  summaryCard: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs },
  label: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  value: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.md },
  totalLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text },
  totalValue: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  grandTotalLabel: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.heading, color: Colors.text },
  grandTotalValue: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  footer: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
});
