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
import { Booking, BookingStatus, TierType } from '@/types';

const statusColors: Record<BookingStatus, string> = {
  confirmed: Colors.confirmed,
  pending: Colors.pending,
  cancelled: Colors.cancelled,
  completed: Colors.completed,
};

const statusLabels: Record<BookingStatus, string> = {
  confirmed: 'Disahkan',
  pending: 'Menunggu',
  cancelled: 'Dibatalkan',
  completed: 'Selesai',
};

const tierColors: Record<TierType, string> = {
  ekonomi: Colors.ekonomi,
  standard: Colors.standard,
  premium: Colors.premium,
  vip: Colors.vip,
};

const segments = [
  { id: 'upcoming', label: 'Akan Datang', statuses: ['confirmed', 'pending'] },
  { id: 'completed', label: 'Selesai', statuses: ['completed'] },
  { id: 'cancelled', label: 'Dibatalkan', statuses: ['cancelled'] },
] as const;

export default function BookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings } = useBookingStore();
  const [activeSegment, setActiveSegment] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const segment = segments.find((s) => s.id === activeSegment)!;
  const filtered = bookings.filter((b) => (segment.statuses as readonly string[]).includes(b.status));

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(tabs)/bookings/${item.id}`)}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Badge label={item.tier.charAt(0).toUpperCase() + item.tier.slice(1)} color={tierColors[item.tier]} size="sm" />
          <Badge label={statusLabels[item.status]} color={statusColors[item.status]} size="sm" />
        </View>
        <Text style={styles.cardTitle}>{item.packageTitle}</Text>
        <Text style={styles.cardDate}>{formatDateRange(item.startDate, item.endDate)}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardRef}>{item.reference}</Text>
          <Text style={styles.cardPrice}>{formatCurrency(item.totalCost)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tempahan Saya</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/bookings/wallet')}>
          <Ionicons name="wallet" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

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
        contentContainerStyle={[styles.list, filtered.length === 0 && { flex: 1 }]}
        ListEmptyComponent={<EmptyState icon="briefcase-outline" title="Tiada tempahan" message="Tempahan anda akan dipaparkan di sini" actionLabel="Tempah Umrah" onAction={() => router.push('/(tabs)/umrah')} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }} tintColor={Colors.primary} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  headerTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  segments: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.md },
  segment: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surface },
  segmentActive: { backgroundColor: Colors.primary },
  segmentText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  segmentTextActive: { color: '#FFFFFF' },
  list: { padding: Spacing.base },
  card: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, overflow: 'hidden', ...Shadows.sm },
  cardImage: { width: 100, height: 120 },
  cardBody: { flex: 1, padding: Spacing.md },
  cardHeader: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  cardTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text },
  cardDate: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  cardRef: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary },
  cardPrice: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.headingBold, color: Colors.primary },
});
