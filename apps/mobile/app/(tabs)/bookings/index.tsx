import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useBookingStore } from '@/store';
import { formatCurrency, formatDateRange } from '@/utils';
import { Badge } from '@/components/ui';
import { EmptyState } from '@/components/shared';
import { Booking, BookingStatus } from '@/types';

const statusColors: Record<BookingStatus, string> = {
  confirmed: Colors.confirmed,
  pending: Colors.pending,
  cancelled: Colors.cancelled,
  completed: Colors.completed,
};

const segments = [
  { id: 'upcoming', label: 'Upcoming', statuses: ['confirmed', 'pending'] },
  { id: 'completed', label: 'Completed', statuses: ['completed'] },
  { id: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
] as const;

export default function BookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings } = useBookingStore();
  const [activeSegment, setActiveSegment] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const segment = segments.find((s) => s.id === activeSegment)!;
  const filtered = bookings.filter((b) => (segment.statuses as readonly string[]).includes(b.status));

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/(tabs)/bookings/[id]', params: { id: item.id } })}
    >
      <Image source={{ uri: item.image }} style={styles.bookingImage} contentFit="cover" />
      <View style={styles.bookingBody}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingDest}>{item.destination}</Text>
          <Badge label={item.status.toUpperCase()} color={statusColors[item.status]} size="sm" />
        </View>
        <Text style={styles.bookingDates}>{formatDateRange(item.startDate, item.endDate)}</Text>
        <View style={styles.bookingFooter}>
          <Text style={styles.bookingRef}>Ref: {item.reference}</Text>
          <Text style={styles.bookingPrice}>{formatCurrency(item.totalCost)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Segments */}
      <View style={styles.segments}>
        {segments.map((seg) => (
          <TouchableOpacity
            key={seg.id}
            style={[styles.segment, activeSegment === seg.id && styles.segmentActive]}
            onPress={() => setActiveSegment(seg.id)}
          >
            <Text style={[styles.segmentText, activeSegment === seg.id && styles.segmentTextActive]}>{seg.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState icon="briefcase-outline" title="No bookings" message="You don't have any bookings in this category yet." actionLabel="Plan a Trip" onAction={() => router.push('/(tabs)/explore')} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  headerTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  segments: { flexDirection: 'row', marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 4, marginBottom: Spacing.md },
  segment: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.md },
  segmentActive: { backgroundColor: Colors.background, ...Shadows.sm },
  segmentText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary },
  segmentTextActive: { color: Colors.primary },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 40 },
  bookingCard: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.md },
  bookingImage: { width: 100, height: 110 },
  bookingBody: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingDest: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, flex: 1, marginRight: Spacing.sm },
  bookingDates: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  bookingRef: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
  bookingPrice: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.headingBold, color: Colors.primary },
});
