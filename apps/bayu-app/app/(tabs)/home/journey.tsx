import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { ProgressBar, Card } from '@/components/ui';
import { useBookingStore } from '@/store';
import { sabahItinerary, buildJourneyTimeline, buildJourneySummary } from '@/data';
import { formatCurrency } from '@/utils';
import { hapticLight } from '@/utils';
import { JourneyStep } from '@/types';

const TimelineNode: React.FC<{ step: JourneyStep; index: number; isLast: boolean }> = ({ step, index, isLast }) => {
  const isCompleted = step.status === 'completed';
  const isCurrent = step.status === 'current';

  const pulseStyle = useAnimatedStyle(() => {
    if (!isCurrent) return { transform: [{ scale: 1 }] };
    return {
      transform: [{ scale: withRepeat(withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true) }],
    };
  });

  const nodeSize = isCurrent ? 18 : 14;
  const nodeColor = isCompleted ? Colors.primary : isCurrent ? Colors.accent : Colors.border;

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 600)).duration(400)} style={styles.timelineRow}>
      {/* Left: line + node */}
      <View style={styles.timelineLeft}>
        {!isLast && (
          <View style={[styles.timelineLine, { backgroundColor: isCompleted ? Colors.primary : Colors.borderLight }]} />
        )}
        <Animated.View style={[
          styles.timelineNode,
          {
            width: nodeSize,
            height: nodeSize,
            borderRadius: nodeSize / 2,
            backgroundColor: isCompleted || isCurrent ? nodeColor : 'transparent',
            borderWidth: isCompleted || isCurrent ? 0 : 2,
            borderColor: Colors.border,
          },
          isCurrent && pulseStyle,
        ]}>
          {isCompleted && <Ionicons name="checkmark" size={10} color="#fff" />}
        </Animated.View>
      </View>

      {/* Right: content */}
      <View style={[styles.timelineContent, step.status === 'upcoming' && { opacity: 0.5 }]}>
        <Text style={styles.stepTime}>{step.time}</Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDesc}>{step.description}</Text>
        {step.tips && (
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={12} color={Colors.accent} />
            <Text style={styles.tipText}>{step.tips}</Text>
          </View>
        )}
        {step.cost !== undefined && step.cost > 0 && (
          <View style={styles.costBadge}>
            <Text style={styles.costText}>RM {step.cost}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default function JourneyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bookings = useBookingStore((s) => s.bookings);
  const [currentIndex, setCurrentIndex] = useState(4);

  const booking = bookings.find((b) => b.id === 'BK001') || bookings[0];
  const itinerary = sabahItinerary;

  const steps = useMemo(() => buildJourneyTimeline(booking, itinerary, currentIndex), [currentIndex]);
  const summary = useMemo(() => buildJourneySummary(itinerary), []);

  const totalDays = itinerary.days.length;
  const totalNights = totalDays - 1;
  const totalTravelers = itinerary.travelers.adults + itinerary.travelers.children;

  // Group steps by day
  const dayGroups = useMemo(() => {
    const groups: { day: number; title: string; steps: JourneyStep[] }[] = [];
    let currentDay = -1;
    for (const step of steps) {
      if (step.day !== currentDay) {
        currentDay = step.day;
        const dayData = itinerary.days.find((d) => d.day === step.day);
        const title = step.day === 0 ? 'Pre-Trip' : step.type === 'trip-complete' ? 'Journey Complete' : dayData?.title || `Day ${step.day}`;
        groups.push({ day: step.day, title, steps: [] });
      }
      groups[groups.length - 1].steps.push(step);
    }
    return groups;
  }, [steps]);

  const handleSimulateNext = () => {
    if (currentIndex < steps.length - 1) {
      hapticLight();
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[...Colors.gradients.oceanDepth]} style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Journey</Text>
          <Text style={styles.headerSubtitle}>{booking.destination}</Text>
          <Text style={styles.headerDates}>{itinerary.startDate.slice(5)} — {itinerary.endDate.slice(5)} 2026</Text>
          <View style={styles.progressRow}>
            <ProgressBar progress={currentIndex / (steps.length - 1)} color={Colors.accent} height={4} style={{ flex: 1 }} />
            <Text style={styles.progressText}>{currentIndex}/{steps.length - 1}</Text>
          </View>
        </LinearGradient>

        {/* Trip Info */}
        <View style={styles.tripInfoCard}>
          <View style={styles.tripInfoItem}>
            <Ionicons name="airplane" size={16} color={Colors.primary} />
            <Text style={styles.tripInfoLabel}>{itinerary.flight.departure.code} → {itinerary.flight.arrival.code}</Text>
          </View>
          <View style={styles.tripInfoDivider} />
          <View style={styles.tripInfoItem}>
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={styles.tripInfoLabel}>{totalDays}D{totalNights}N</Text>
          </View>
          <View style={styles.tripInfoDivider} />
          <View style={styles.tripInfoItem}>
            <Ionicons name="people-outline" size={16} color={Colors.primary} />
            <Text style={styles.tripInfoLabel}>{totalTravelers} pax</Text>
          </View>
        </View>

        {/* Timeline */}
        {dayGroups.map((group, gi) => (
          <View key={gi}>
            <Animated.View entering={FadeInDown.delay(Math.min(gi * 50, 300)).duration(400)} style={styles.daySeparator}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>
                  {group.day === 0 ? 'Pre-Trip' : `Day ${group.day}`}
                </Text>
              </View>
              <Text style={styles.dayTitle}>{group.title}</Text>
            </Animated.View>
            {group.steps.map((step, si) => (
              <TimelineNode
                key={step.id}
                step={step}
                index={gi * 10 + si}
                isLast={gi === dayGroups.length - 1 && si === group.steps.length - 1}
              />
            ))}
          </View>
        ))}

        {/* Trip Summary */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Trip Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <Text style={styles.summaryValue}>{summary.totalDays} Days</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="wallet" size={20} color={Colors.success} />
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalSpent)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="location" size={20} color={Colors.sunset} />
              <Text style={styles.summaryValue}>{summary.placesVisited} Places</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="compass" size={20} color={Colors.category.cultural} />
              <Text style={styles.summaryValue}>{summary.activitiesCompleted} Activities</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Simulate Next Button */}
      {currentIndex < steps.length - 1 && (
        <TouchableOpacity style={[styles.simulateBtn, { bottom: insets.bottom + 80 }]} activeOpacity={0.85} onPress={handleSimulateNext}>
          <Ionicons name="play-forward" size={20} color="#fff" />
          <Text style={styles.simulateBtnText}>Simulate Next</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.fonts.headingBold,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerDates: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.7)',
  },
  tripInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  tripInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tripInfoLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.text,
  },
  tripInfoDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  daySeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  dayBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  dayBadgeText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#fff',
  },
  dayTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  timelineRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    minHeight: 60,
  },
  timelineLeft: {
    width: 36,
    alignItems: 'center',
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
  },
  timelineNode: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingBottom: Spacing.base,
  },
  stepTime: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textTertiary,
  },
  stepTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.text,
    marginTop: 1,
  },
  stepDesc: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    backgroundColor: Colors.accent + '12',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  costBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  costText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.primary,
  },
  summaryCard: {
    margin: Spacing.base,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  summaryTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
    marginBottom: Spacing.base,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
  },
  summaryItem: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.text,
  },
  simulateBtn: {
    position: 'absolute',
    right: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadows.lg,
  },
  simulateBtnText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#fff',
  },
});
