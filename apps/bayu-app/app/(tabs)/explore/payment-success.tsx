import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, BounceIn, FadeIn } from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useTripStore, useBookingStore } from '@/store';
import { formatCurrency, formatDateRange } from '@/utils';
import { hapticSuccess } from '@/utils';
import { Button } from '@/components/ui';

// A fake QR illustration — 7×7 grid of blocks randomly filled
const qrPattern = () => {
  const grid: boolean[][] = [];
  const seed = 'bayu2026'.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  for (let y = 0; y < 7; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < 7; x++) {
      row.push(((x * 31 + y * 17 + seed) % 3) === 0);
    }
    grid.push(row);
  }
  // Anchor blocks at corners
  [[0, 0], [0, 6], [6, 0]].forEach(([y, x]) => {
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        if (y + dy < 7 && x + dx < 7) grid[y + dy][x + dx] = (dy === 0 || dy === 2 || dx === 0 || dx === 2);
      }
    }
  });
  return grid;
};

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confettiRef = useRef<any>(null);
  const { selectedPackage, currentItinerary, resetWizard } = useTripStore();
  const { bookings } = useBookingStore();
  const latestBooking = bookings[0];

  useEffect(() => {
    hapticSuccess();
    setTimeout(() => confettiRef.current?.start(), 100);
  }, []);

  const handleShare = () =>
    Share.share({
      title: 'My Sabah Adventure',
      message: `Just booked ${selectedPackage?.title} via Bayu 🌊 ${currentItinerary ? formatDateRange(currentItinerary.startDate, currentItinerary.endDate) : ''} — Bayu Ref ${latestBooking?.reference || ''}.`,
    }).catch(() => Alert.alert('Share', 'Share failed — try again.'));

  const handleViewBooking = () => {
    resetWizard();
    router.replace('/(tabs)/bookings');
  };

  const handleViewJourney = () => {
    resetWizard();
    router.replace('/(tabs)/home/journey');
  };

  const handleGoHome = () => {
    resetWizard();
    router.replace('/(tabs)/home');
  };

  const grid = qrPattern();

  return (
    <View style={styles.container}>
      <LinearGradient colors={[...Colors.gradients.oceanDepth]} style={styles.bg} />

      <ConfettiCannon
        ref={confettiRef}
        count={140}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut
        colors={['#F7B731', '#FDE68A', '#2EAFE8', '#10B981', '#F5362F', '#FFFFFF']}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={BounceIn.delay(200)} style={styles.checkWrap}>
          <View style={styles.checkGlow} />
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(400)} style={styles.title}>You're going to Sabah!</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(550)} style={styles.subtitle}>
          Booking confirmed · E-ticket ready
        </Animated.Text>

        {/* E-Ticket card */}
        {latestBooking && (
          <Animated.View entering={FadeInDown.delay(700)} style={styles.ticketCard}>
            <View style={styles.ticketTop}>
              <View style={styles.ticketBrand}>
                <View style={styles.ticketLogo}>
                  <Ionicons name="earth" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.ticketBrandLabel}>BAYU E-TICKET</Text>
                  <Text style={styles.ticketRef}>{latestBooking.reference}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                <Ionicons name="share-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.ticketBody}>
              <Text style={styles.ticketDest}>{selectedPackage?.destination || latestBooking.destination}</Text>
              <Text style={styles.ticketPackage}>{selectedPackage?.title}</Text>
              {currentItinerary && (
                <View style={styles.ticketMeta}>
                  <View style={styles.ticketMetaItem}>
                    <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.ticketMetaText}>
                      {formatDateRange(currentItinerary.startDate, currentItinerary.endDate)}
                    </Text>
                  </View>
                  <View style={styles.ticketMetaItem}>
                    <Ionicons name="people-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.ticketMetaText}>
                      {currentItinerary.travelers.adults} adults
                      {currentItinerary.travelers.children > 0 ? ` + ${currentItinerary.travelers.children} kids` : ''}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Perforated divider */}
            <View style={styles.perforationRow}>
              <View style={styles.cutoutLeft} />
              <View style={styles.perforation} />
              <View style={styles.cutoutRight} />
            </View>

            <View style={styles.ticketQrRow}>
              <View style={styles.qrGrid}>
                {grid.map((row, y) => (
                  <View key={y} style={styles.qrRow}>
                    {row.map((filled, x) => (
                      <View
                        key={x}
                        style={[styles.qrBlock, filled && styles.qrBlockOn]}
                      />
                    ))}
                  </View>
                ))}
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.qrLabel}>TOTAL PAID</Text>
                <Text style={styles.qrAmount}>{formatCurrency(latestBooking.totalCost)}</Text>
                <View style={styles.rewardsPill}>
                  <Ionicons name="sparkles" size={10} color={Colors.sunset} />
                  <Text style={styles.rewardsText}>+{Math.round(latestBooking.totalCost / 10)} pts earned</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeIn.delay(900)} style={styles.nextStepBanner}>
          <Ionicons name="notifications-outline" size={14} color={Colors.sunset} />
          <Text style={styles.nextStepText}>
            We'll notify you 48h before departure with check-in & weather briefing
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1050)} style={styles.actions}>
          <Button
            title="View My Journey"
            onPress={handleViewJourney}
            size="lg"
            fullWidth
            icon={<Ionicons name="map" size={18} color="#FFFFFF" />}
          />
          <Button
            title="My Bookings"
            onPress={handleViewBooking}
            variant="outline"
            size="lg"
            fullWidth
          />
          <TouchableOpacity onPress={handleGoHome} style={styles.homeLink}>
            <Text style={styles.homeLinkText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { ...StyleSheet.absoluteFillObject },
  scroll: { alignItems: 'center', paddingHorizontal: Spacing.base, paddingBottom: Spacing['2xl'] },

  checkWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  checkGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(16,185,129,0.35)',
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },

  title: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing.xl,
  },

  ticketCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
    marginBottom: Spacing.lg,
  },
  ticketTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    backgroundColor: Colors.primary,
  },
  ticketBrand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ticketLogo: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketBrandLabel: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 1.4,
  },
  ticketRef: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    letterSpacing: 2,
    marginTop: 1,
  },
  shareBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ticketBody: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: 2,
  },
  ticketDest: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.headingBold,
    color: Colors.text,
  },
  ticketPackage: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textSecondary,
  },
  ticketMeta: { flexDirection: 'row', gap: Spacing.base, marginTop: Spacing.sm },
  ticketMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ticketMetaText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },

  perforationRow: { flexDirection: 'row', alignItems: 'center' },
  cutoutLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#002B7F',
    marginLeft: -8,
  },
  perforation: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  cutoutRight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#002B7F',
    marginRight: -8,
  },

  ticketQrRow: {
    flexDirection: 'row',
    padding: Spacing.base,
    gap: Spacing.base,
    alignItems: 'center',
  },
  qrGrid: {
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
  },
  qrRow: { flexDirection: 'row' },
  qrBlock: {
    width: 8,
    height: 8,
  },
  qrBlockOn: {
    backgroundColor: Colors.text,
  },
  qrLabel: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  qrAmount: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: Colors.primary,
  },
  rewardsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    backgroundColor: Colors.sunset + '15',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  rewardsText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.sunset,
  },

  nextStepBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(247,183,49,0.22)',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  nextStepText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: '#FFFFFF',
  },

  actions: { width: '100%', gap: Spacing.sm },
  homeLink: { alignSelf: 'center', paddingVertical: Spacing.sm },
  homeLinkText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.8)',
  },
});
