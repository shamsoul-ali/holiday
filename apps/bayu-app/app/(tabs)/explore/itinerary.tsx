import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useTripStore } from '@/store';
import { formatCurrency, formatDateRange } from '@/utils';
import { Button, Badge, Card } from '@/components/ui';
import { ActivityType } from '@/types';

const activityColors: Record<ActivityType, string> = {
  transport: Colors.sky,
  meal: Colors.sunset,
  activity: Colors.secondary,
  hotel: Colors.category.cultural,
  shopping: '#EC4899',
  free_time: '#6B7280',
};

const activityIcons: Record<ActivityType, string> = {
  transport: 'airplane',
  meal: 'restaurant',
  activity: 'camera',
  hotel: 'bed',
  shopping: 'bag',
  free_time: 'cafe',
};

export default function ItineraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentItinerary, selectedPackage, selectedDay, setSelectedDay } = useTripStore();

  if (!currentItinerary || !selectedPackage) return null;

  const dayData = currentItinerary.days.find((d) => d.day === selectedDay) || currentItinerary.days[0];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: selectedPackage.image }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']} style={styles.heroOverlay} />
          <TouchableOpacity style={[styles.backBtn, { top: insets.top + Spacing.sm }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={[styles.heroTopRightRow, { top: insets.top + Spacing.sm }]}>
            <View style={styles.offlinePill}>
              <Ionicons name="cloud-done" size={11} color="#FFFFFF" />
              <Text style={styles.offlinePillText}>Offline-ready</Text>
            </View>
            <TouchableOpacity
              style={styles.iconBtnSmall}
              onPress={() =>
                Share.share({
                  title: selectedPackage.title,
                  message: `Check out my Sabah trip: ${selectedPackage.title} — ${currentItinerary.destination} (${formatDateRange(currentItinerary.startDate, currentItinerary.endDate)}). Planned with Bayu.`,
                }).catch(() => Alert.alert('Share', 'Share failed — try again.'))
              }
            >
              <Ionicons name="share-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{selectedPackage.title}</Text>
            <Text style={styles.heroSubtitle}>{currentItinerary.destination} - {formatDateRange(currentItinerary.startDate, currentItinerary.endDate)}</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Ionicons name="cloud" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroStatText}>{currentItinerary.weather}</Text>
              </View>
              <View style={styles.heroStat}>
                <Ionicons name="cash" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroStatText}>{formatCurrency(currentItinerary.totalCost)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>
          {currentItinerary.days.map((day) => (
            <TouchableOpacity
              key={day.day}
              style={[styles.dayTab, selectedDay === day.day && styles.dayTabActive]}
              onPress={() => setSelectedDay(day.day)}
            >
              <Text style={[styles.dayTabLabel, selectedDay === day.day && styles.dayTabLabelActive]}>Day {day.day}</Text>
              <Text style={[styles.dayTabTitle, selectedDay === day.day && styles.dayTabTitleActive]} numberOfLines={1}>{day.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Timeline */}
        <View style={styles.timeline}>
          {dayData.activities.map((activity, index) => {
            const color = activityColors[activity.type];
            const icon = activityIcons[activity.type];
            return (
              <View key={activity.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <Text style={styles.timelineTime}>{activity.time}</Text>
                  {index < dayData.activities.length - 1 && <View style={[styles.timelineLine, { backgroundColor: color + '30' }]} />}
                </View>
                <View style={[styles.timelineDot, { backgroundColor: color }]}>
                  <Ionicons name={icon as any} size={14} color="#FFFFFF" />
                </View>
                <Card style={styles.activityCard} variant="outlined">
                  <View style={styles.activityHeader}>
                    <Badge label={activity.type.replace('_', ' ')} color={color + '20'} textColor={color} size="sm" />
                    {activity.cost > 0 && <Text style={styles.activityCost}>{formatCurrency(activity.cost)}</Text>}
                  </View>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <View style={styles.activityMeta}>
                    <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
                    <Text style={styles.activityDuration}>{activity.duration}</Text>
                    <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
                    <Text style={styles.activityLocation} numberOfLines={1}>{activity.location}</Text>
                  </View>
                  {activity.tips && (
                    <View style={styles.tipRow}>
                      <Ionicons name="bulb-outline" size={12} color={Colors.secondary} />
                      <Text style={styles.tipText}>{activity.tips}</Text>
                    </View>
                  )}
                </Card>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Book Button */}
      <View style={[styles.floatingFooter, { paddingBottom: insets.bottom + 80 }]}>
        <View>
          <Text style={styles.footerPrice}>{formatCurrency(selectedPackage.price)}</Text>
          <Text style={styles.footerPer}>total for {currentItinerary.travelers.adults} pax</Text>
        </View>
        <Button title="Book This Trip" onPress={() => router.push('/(tabs)/explore/review')} size="lg" icon={<Ionicons name="arrow-forward" size={18} color="#fff" />} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { height: 250, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  backBtn: { position: 'absolute', left: Spacing.base, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  heroTopRightRow: { position: 'absolute', right: Spacing.base, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  offlinePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 5, backgroundColor: 'rgba(5,150,105,0.9)', borderRadius: BorderRadius.full },
  offlinePillText: { fontSize: 10, fontFamily: Typography.fonts.bodySemiBold, color: '#FFFFFF', letterSpacing: 0.3 },
  iconBtnSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { position: 'absolute', bottom: Spacing.lg, left: Spacing.lg, right: Spacing.lg },
  heroTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  heroSubtitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  heroStats: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroStatText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: 'rgba(255,255,255,0.9)' },
  daySelector: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.sm },
  dayTab: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, backgroundColor: Colors.surface, minWidth: 100 },
  dayTabActive: { backgroundColor: Colors.primary },
  dayTabLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.textTertiary },
  dayTabLabelActive: { color: 'rgba(255,255,255,0.8)' },
  dayTabTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.text, marginTop: 2 },
  dayTabTitleActive: { color: '#FFFFFF' },
  timeline: { padding: Spacing.base },
  timelineItem: { flexDirection: 'row', marginBottom: Spacing.md },
  timelineLeft: { width: 50, alignItems: 'center' },
  timelineTime: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.textSecondary },
  timelineLine: { width: 2, flex: 1, marginTop: Spacing.xs },
  timelineDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginHorizontal: Spacing.sm },
  activityCard: { flex: 1, padding: Spacing.md },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  activityCost: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
  activityTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  activityMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  activityDuration: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginRight: Spacing.sm },
  activityLocation: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, flex: 1 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm, backgroundColor: Colors.secondary + '10', padding: Spacing.sm, borderRadius: BorderRadius.sm },
  tipText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.secondary, flex: 1 },
  floatingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight, backgroundColor: Colors.background },
  footerPrice: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  footerPer: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
});
