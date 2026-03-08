import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useBookingStore } from '@/store';
import { formatCurrency, formatDate, formatDateRange } from '@/utils';
import { Badge, Card, Button } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { BookingStatus } from '@/types';

const statusColors: Record<BookingStatus, string> = {
  confirmed: Colors.confirmed,
  pending: Colors.pending,
  cancelled: Colors.cancelled,
  completed: Colors.completed,
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings } = useBookingStore();
  const booking = bookings.find((b) => b.id === id);

  if (!booking) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Booking Details" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: booking.image }} style={styles.image} contentFit="cover" />

        <View style={styles.headerRow}>
          <Text style={styles.destination}>{booking.destination}</Text>
          <Badge label={booking.status.toUpperCase()} color={statusColors[booking.status]} />
        </View>

        <Card style={styles.detailCard}>
          {[
            { icon: 'calendar', label: 'Dates', value: formatDateRange(booking.startDate, booking.endDate) },
            { icon: 'people', label: 'Travelers', value: `${booking.travelers} persons` },
            { icon: 'card', label: 'Payment', value: booking.paymentMethod.toUpperCase() },
            { icon: 'document-text', label: 'Reference', value: booking.reference },
            { icon: 'time', label: 'Booked', value: formatDate(booking.createdAt) },
          ].map((item, i) => (
            <View key={i} style={[styles.detailRow, i < 4 && styles.detailBorder]}>
              <View style={styles.detailLeft}>
                <Ionicons name={item.icon as any} size={18} color={Colors.primary} />
                <Text style={styles.detailLabel}>{item.label}</Text>
              </View>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.priceCard}>
          <Text style={styles.priceLabel}>Total Paid</Text>
          <Text style={styles.priceValue}>{formatCurrency(booking.totalCost)}</Text>
        </Card>

        {booking.status === 'confirmed' && (
          <Button
            title="View My Journey"
            onPress={() => router.push('/(tabs)/home/journey')}
            variant="outline"
            size="lg"
            fullWidth
            icon={<Ionicons name="map-outline" size={18} color={Colors.primary} />}
            style={{ marginTop: Spacing.md }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 100 },
  image: { width: '100%', height: 180, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  destination: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  detailCard: { marginBottom: Spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  detailLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  detailValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  priceCard: { alignItems: 'center', backgroundColor: Colors.primary + '08' },
  priceLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  priceValue: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: Colors.primary, marginTop: Spacing.xs },
});
