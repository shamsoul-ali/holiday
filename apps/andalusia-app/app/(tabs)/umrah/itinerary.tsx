import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useUmrahStore } from '@/store';
import { Badge, Button } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { ActivityType } from '@/types';

const activityColors: Record<ActivityType, string> = {
  ibadah: Colors.primary,
  ziarah: '#8B5CF6',
  meal: Colors.secondary,
  transport: Colors.accent,
  hotel: '#6B7280',
  free_time: '#10B981',
};

const locationColors: Record<string, string> = {
  Madinah: '#3B82F6',
  Makkah: Colors.primary,
  Transit: Colors.secondary,
  KUL: '#6B7280',
};

export default function ItineraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentItinerary, selectedDay, setSelectedDay } = useUmrahStore();

  if (!currentItinerary) return null;

  const dayData = currentItinerary.days.find((d) => d.day === selectedDay) || currentItinerary.days[0];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Jadual Perjalanan" />

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>
        {currentItinerary.days.map((day) => (
          <TouchableOpacity
            key={day.day}
            style={[styles.dayChip, selectedDay === day.day && styles.dayChipActive]}
            onPress={() => setSelectedDay(day.day)}
          >
            <Text style={[styles.dayNum, selectedDay === day.day && styles.dayNumActive]}>H{day.day}</Text>
            <Badge label={day.location} color={locationColors[day.location] || Colors.textTertiary} size="sm" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.dayTitle}>{dayData.title}</Text>

        {dayData.activities.map((activity, index) => (
          <Animated.View key={activity.id} entering={FadeInDown.delay(index * 80).duration(400)}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Text style={styles.time}>{activity.time}</Text>
                <View style={[styles.dot, { backgroundColor: activityColors[activity.type] }]} />
                {index < dayData.activities.length - 1 && <View style={styles.line} />}
              </View>
              <View style={[styles.activityCard, { borderLeftColor: activityColors[activity.type] }]}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Badge label={activity.type} color={activityColors[activity.type]} size="sm" />
                </View>
                <View style={styles.activityMeta}>
                  <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
                  <Text style={styles.metaText}>{activity.duration}</Text>
                  <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
                  <Text style={styles.metaText}>{activity.location}</Text>
                </View>
                {activity.tips && (
                  <View style={styles.tipBox}>
                    <Ionicons name="bulb" size={14} color={Colors.secondary} />
                    <Text style={styles.tipText}>{activity.tips}</Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Button title="Semak & Tempah" onPress={() => router.push('/(tabs)/umrah/review')} size="lg" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  daySelector: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm },
  dayChip: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, backgroundColor: Colors.surface, gap: 4 },
  dayChipActive: { backgroundColor: Colors.primary + '15' },
  dayNum: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.heading, color: Colors.textSecondary },
  dayNumActive: { color: Colors.primary },
  content: { padding: Spacing.base },
  dayTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text, marginBottom: Spacing.lg },

  timelineItem: { flexDirection: 'row', marginBottom: Spacing.sm },
  timelineLeft: { width: 60, alignItems: 'center' },
  time: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary, marginBottom: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: 4 },

  activityCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginLeft: Spacing.sm, borderLeftWidth: 3 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  activityTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, flex: 1, marginRight: Spacing.sm },
  activityMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginRight: 8 },
  tipBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: Spacing.sm, padding: Spacing.sm, backgroundColor: Colors.secondary + '10', borderRadius: BorderRadius.sm },
  tipText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.secondary, flex: 1 },

  footer: { padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.borderLight },
});
