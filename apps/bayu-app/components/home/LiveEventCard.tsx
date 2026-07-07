import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { SabahEvent } from '@/types';

interface Props {
  event: SabahEvent;
  onPress?: () => void;
}

const categoryGradients: Record<string, readonly [string, string]> = {
  Cultural: ['#7C3AED', '#A78BFA'],
  Sports: ['#F5362F', '#F97373'],
  Food: ['#F7B731', '#FFD97A'],
};

function parseStartDate(dateRange: string): Date | null {
  // Examples: "1 - 31 May 2026", "24 - 26 Apr 2026", "17 Oct 2026", "3 May 2026"
  const m = dateRange.match(/^(\d{1,2})\s*(?:-\s*\d{1,2}\s*)?([A-Za-z]+)\s+(\d{4})/);
  if (!m) return null;
  const [, day, month, year] = m;
  const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const mo = months[month.slice(0, 3)];
  if (mo === undefined) return null;
  return new Date(+year, mo, +day, 9, 0, 0);
}

function formatCountdown(targetMs: number): { d: number; h: number; m: number; s: number; isLive: boolean } {
  const now = Date.now();
  const diff = targetMs - now;
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, isLive: true };
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { d, h, m, s, isLive: false };
}

export const LiveEventCard: React.FC<Props> = ({ event, onPress }) => {
  const startDate = parseStartDate(event.dateRange);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!startDate) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [startDate]);

  const cd = startDate ? formatCountdown(startDate.getTime()) : null;
  const gradient = categoryGradients[event.category] ?? (['#096DBB', '#2EAFE8'] as const);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <Image source={{ uri: event.image }} style={styles.image} contentFit="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']} style={styles.overlay}>
        <View style={styles.topRow}>
          <LinearGradient colors={gradient} style={styles.categoryPill}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </LinearGradient>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.name} numberOfLines={2}>{event.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={11} color="rgba(255,255,255,0.8)" />
            <Text style={styles.location} numberOfLines={1}>{event.location}</Text>
          </View>

          {cd && !cd.isLive && (
            <View style={styles.countdownRow}>
              <CountdownBlock value={cd.d} label="days" />
              <Text style={styles.colon}>·</Text>
              <CountdownBlock value={cd.h} label="hrs" />
              <Text style={styles.colon}>·</Text>
              <CountdownBlock value={cd.m} label="min" />
              <Text style={styles.colon}>·</Text>
              <CountdownBlock value={cd.s} label="sec" pulse />
            </View>
          )}

          {cd?.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>HAPPENING NOW</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

function CountdownBlock({ value, label, pulse }: { value: number; label: string; pulse?: boolean }) {
  return (
    <View style={styles.cdBlock}>
      <Text style={[styles.cdValue, pulse && { color: '#F7B731' }]}>{value.toString().padStart(2, '0')}</Text>
      <Text style={styles.cdLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginRight: Spacing.md,
    ...Shadows.md,
  },
  image: { width: '100%', height: '100%', position: 'absolute' },
  overlay: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  categoryPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  categoryText: { fontSize: 10, fontFamily: Typography.fonts.bodySemiBold, color: '#FFFFFF', letterSpacing: 0.5 },
  bottom: { gap: 4 },
  name: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', lineHeight: 18 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  location: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: 'rgba(255,255,255,0.85)' },
  countdownRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 6 },
  cdBlock: { alignItems: 'center' },
  cdValue: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', fontVariant: ['tabular-nums'], lineHeight: 20 },
  cdLabel: { fontSize: 9, fontFamily: Typography.fonts.bodyMedium, color: 'rgba(255,255,255,0.7)', marginTop: -1 },
  colon: { fontSize: Typography.sizes.md, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F5362F', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveText: { fontSize: 10, fontFamily: Typography.fonts.bodySemiBold, color: '#FFFFFF', letterSpacing: 0.5 },
});
