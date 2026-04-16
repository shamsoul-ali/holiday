import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Booking } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';

interface Props {
  booking: Booking;
  onPress?: () => void;
}

type Phase = 'pre-trip' | 'in-progress' | 'completed' | 'hidden';

function getTripPhase(booking: Booking): Phase {
  const now = Date.now();
  const start = new Date(booking.startDate).getTime();
  const end = new Date(booking.endDate).getTime() + 86400000; // include end day
  if (now < start) return 'pre-trip';
  if (now >= start && now < end) return 'in-progress';
  if (now >= end && now < end + 86400000 * 3) return 'completed';
  return 'hidden';
}

function getCountdown(startDate: string): { days: number; hours: number; mins: number } {
  const start = new Date(startDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, start - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hours, mins };
}

function getTripDayProgress(booking: Booking): { current: number; total: number } {
  const start = new Date(booking.startDate).getTime();
  const end = new Date(booking.endDate).getTime();
  const total = Math.round((end - start) / 86400000) + 1;
  const now = Date.now();
  const current = Math.min(total, Math.max(1, Math.floor((now - start) / 86400000) + 1));
  return { current, total };
}

export const JourneyTrackerBanner: React.FC<Props> = ({ booking, onPress }) => {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(getTripPhase(booking));
  const [countdown, setCountdown] = useState(getCountdown(booking.startDate));

  useEffect(() => {
    const tick = () => {
      setPhase(getTripPhase(booking));
      setCountdown(getCountdown(booking.startDate));
    };
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [booking]);

  if (phase === 'hidden') return null;

  const handlePress = () => {
    if (onPress) onPress();
    else router.push('/(tabs)/home/journey' as any);
  };

  // PRE-TRIP: countdown
  if (phase === 'pre-trip') {
    return (
      <Animated.View entering={FadeInUp.duration(400)} style={{ paddingHorizontal: Spacing.base, marginTop: Spacing.md }}>
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
          <LinearGradient
            colors={[...Colors.gradients.oceanDepth]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.card}
          >
            <View style={styles.pattern} />

            <View style={styles.topRow}>
              <View style={styles.tripStatusPill}>
                <View style={styles.liveDot} />
                <Text style={styles.tripStatusText}>UPCOMING TRIP</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
            </View>

            <Text style={styles.destTitle}>{booking.destination}</Text>
            <Text style={styles.refText}>Ref: {booking.reference}</Text>

            <View style={styles.countdownRow}>
              {[
                { value: countdown.days, label: 'DAYS' },
                { value: countdown.hours, label: 'HRS' },
                { value: countdown.mins, label: 'MIN' },
              ].map((seg) => (
                <View key={seg.label} style={styles.countBlock}>
                  <Text style={styles.countNum}>{String(seg.value).padStart(2, '0')}</Text>
                  <Text style={styles.countLabel}>{seg.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.footerRow}>
              <Ionicons name="airplane-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.footerText}>Starts {new Date(booking.startDate).toDateString()}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // IN-PROGRESS: day X of Y, live progress
  if (phase === 'in-progress') {
    const { current, total } = getTripDayProgress(booking);
    const pct = (current / total) * 100;
    return (
      <Animated.View entering={FadeInUp.duration(400)} style={{ paddingHorizontal: Spacing.base, marginTop: Spacing.md }}>
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
          <LinearGradient
            colors={[...Colors.gradients.jungleMist]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.card}
          >
            <View style={styles.topRow}>
              <View style={styles.tripStatusPill}>
                <View style={[styles.liveDot, { backgroundColor: '#FFFFFF' }]} />
                <Text style={styles.tripStatusText}>TRIP IN PROGRESS</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
            </View>

            <Text style={styles.destTitle}>{booking.destination}</Text>
            <Text style={styles.dayProgressLine}>Day {current} of {total} · Live itinerary</Text>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>

            <View style={styles.footerRow}>
              <Ionicons name="location" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.footerText}>Tap to view today's plan</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // COMPLETED: celebration + earn badge nudge
  return (
    <Animated.View entering={FadeInUp.duration(400)} style={{ paddingHorizontal: Spacing.base, marginTop: Spacing.md }}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/profile/travel-pass' as any)}>
        <LinearGradient
          colors={[...Colors.gradients.sunsetGlow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.card}
        >
          <View style={styles.topRow}>
            <View style={styles.tripStatusPill}>
              <Ionicons name="trophy" size={10} color="#FFFFFF" />
              <Text style={styles.tripStatusText}>TRIP COMPLETE</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
          </View>

          <Text style={[styles.destTitle, { color: '#0A1628' }]}>Welcome back from {booking.destination.split(',')[0]}</Text>
          <Text style={[styles.dayProgressLine, { color: '#4A6178' }]}>Claim your memories + earn badges</Text>

          <View style={styles.footerRow}>
            <Ionicons name="ribbon" size={14} color="#0A1628" />
            <Text style={[styles.footerText, { color: '#0A1628' }]}>+250 pts ready to claim</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  pattern: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  tripStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BorderRadius.full,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F5362F' },
  tripStatusText: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },

  destTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
  },
  refText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  dayProgressLine: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 2,
  },

  countdownRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  countBlock: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
  },
  countNum: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    lineHeight: Typography.sizes['2xl'] * 1.1,
  },
  countLabel: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.2,
    marginTop: 2,
  },

  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },

  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  footerText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.85)',
  },
});
