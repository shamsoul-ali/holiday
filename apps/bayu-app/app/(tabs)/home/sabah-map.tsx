import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { SabahMap, MapMode } from '@/components/SabahMap';
import { SabahMapSheet } from '@/components/SabahMapSheet';
import { LiveCounter, LiveDot } from '@/components/gov/widgets';
import { sabahHotelStats, governmentStats } from '@/data';

const modes: { id: MapMode; label: string; icon: string }[] = [
  { id: 'occupancy', label: 'Occupancy', icon: 'bed' },
  { id: 'crowd',     label: 'Crowd',     icon: 'people' },
  { id: 'food',      label: 'Food',      icon: 'restaurant' },
  { id: 'islands',   label: 'Islands',   icon: 'boat' },
  { id: 'activity',  label: 'Events',    icon: 'calendar' },
  { id: 'safety',    label: 'Safety',    icon: 'shield-checkmark' },
];

export default function SabahMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<MapMode>('occupancy');
  const [selected, setSelected] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[...Colors.gradients.oceanDepth]} style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>SABAH TOURISM MAP · B2G</Text>
            <Text style={styles.title}>Spatial Command Center</Text>
          </View>
          <View style={styles.livePill}>
            <LiveDot color="#FDE68A" size={6} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Live visitor ticker */}
        <View style={styles.tickerRow}>
          <View style={styles.ticker}>
            <Text style={styles.tickerLabel}>Visitors right now</Text>
            <LiveCounter value={governmentStats.liveVisitorsToday} ratePerSec={governmentStats.liveVisitorsRate} />
          </View>
          <View style={styles.tickerDivider} />
          <View style={styles.ticker}>
            <Text style={styles.tickerLabel}>Avg occupancy</Text>
            <Text style={styles.tickerValue}>{sabahHotelStats.avgOccupancy}%</Text>
          </View>
          <View style={styles.tickerDivider} />
          <View style={styles.ticker}>
            <Text style={styles.tickerLabel}>Rooms</Text>
            <Text style={styles.tickerValue}>{sabahHotelStats.totalRooms.toLocaleString()}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mode chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {modes.map((m) => {
            const active = mode === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setMode(m.id)}
                activeOpacity={0.85}
              >
                <Ionicons name={m.icon as any} size={12} color={active ? '#FFFFFF' : Colors.primary} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Map */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.mapFrame}>
          <SabahMap
            mode={mode}
            selectedDistrictId={selected}
            onSelectDistrict={(id) => {
              setSelected(id);
              setSheetOpen(true);
            }}
            height={460}
          />
          <View style={styles.capitalChip}>
            <Ionicons name="star" size={11} color="#FDE68A" />
            <Text style={styles.capitalText}>CAPITAL · Kota Kinabalu</Text>
          </View>
        </Animated.View>

        {/* Info card */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoTitle}>How the map works</Text>
          </View>
          <Text style={styles.infoText}>
            Tap any district to see real-time occupancy, crowd level, food spots, islands, events, and active safety alerts. Map layers swap live — same dataset Sabah Tourism Board uses on their B2G dashboard.
          </Text>
        </Animated.View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <SabahMapSheet
        visible={sheetOpen}
        districtId={selected}
        mode={mode}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    marginTop: 1,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  liveText: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FDE68A',
    letterSpacing: 1.2,
  },

  tickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: BorderRadius.md,
  },
  ticker: { flex: 1, alignItems: 'center' },
  tickerLabel: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  tickerValue: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.headingBold,
    color: '#FDE68A',
  },
  tickerDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },

  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },

  chipRow: { gap: Spacing.xs, paddingRight: Spacing.base, paddingVertical: Spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
  chipTextActive: { color: '#FFFFFF' },

  mapFrame: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    position: 'relative',
    ...Shadows.md,
  },
  capitalChip: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#F7B731',
  },
  capitalText: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FDE68A',
    letterSpacing: 0.6,
  },

  infoCard: {
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  infoTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  infoText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.xs * 1.5,
  },
});
