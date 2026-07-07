import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WeatherDay, WeatherIconKey } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';

interface Props {
  days: WeatherDay[];
}

const iconMap: Record<WeatherIconKey, string> = {
  sun: 'sunny',
  cloud: 'cloud',
  rain: 'rainy',
  storm: 'thunderstorm',
  partly: 'partly-sunny',
};

const gradientMap: Record<WeatherIconKey, readonly [string, string]> = {
  sun: ['#F7B731', '#FDE68A'] as const,
  cloud: ['#6B7280', '#9CA3AF'] as const,
  rain: ['#2563EB', '#60A5FA'] as const,
  storm: ['#1E3A8A', '#4F46E5'] as const,
  partly: ['#2EAFE8', '#7DD3FC'] as const,
};

export const WeatherCards: React.FC<Props> = ({ days }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scroll}
  >
    {days.map((d, i) => (
      <LinearGradient
        key={d.date}
        colors={gradientMap[d.iconKey]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.card, i === 0 && styles.todayCard]}
      >
        <Text style={styles.dayLabel}>{d.day}</Text>
        <Text style={styles.dateLabel}>{d.date}</Text>
        <View style={styles.iconWrap}>
          <Ionicons name={iconMap[d.iconKey] as any} size={34} color="#FFFFFF" />
        </View>
        <Text style={styles.condition} numberOfLines={1}>{d.condition}</Text>
        <View style={styles.tempRow}>
          <Text style={styles.high}>{d.high}°</Text>
          <Text style={styles.low}>{d.low}°</Text>
        </View>
        <View style={styles.precipRow}>
          <Ionicons name="water" size={11} color="rgba(255,255,255,0.85)" />
          <Text style={styles.precip}>{d.precipPct}%</Text>
        </View>
      </LinearGradient>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.base, gap: Spacing.md, paddingVertical: Spacing.xs },
  card: {
    width: 110,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  todayCard: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  dayLabel: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
  },
  dateLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    marginTop: -2,
  },
  iconWrap: { marginVertical: Spacing.sm },
  condition: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    marginBottom: Spacing.xs,
  },
  tempRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
  high: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.headingBold,
  },
  low: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
  },
  precipRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: Spacing.xs },
  precip: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
  },
});
