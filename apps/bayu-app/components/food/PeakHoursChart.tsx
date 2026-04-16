import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';

interface Props {
  data: number[]; // 24 entries, 0–100
  currentHour?: number;
  height?: number;
}

const crowdLabel = (v: number) => {
  if (v >= 80) return 'Packed';
  if (v >= 60) return 'Busy';
  if (v >= 35) return 'Steady';
  if (v >= 15) return 'Quiet';
  return 'Empty';
};

const hourLabel = (h: number) => {
  if (h === 0) return '12a';
  if (h === 12) return '12p';
  if (h < 12) return `${h}a`;
  return `${h - 12}p`;
};

export const PeakHoursChart: React.FC<Props> = ({ data, currentHour = new Date().getHours(), height = 80 }) => {
  if (!data.length) return null;
  const currentValue = data[currentHour] ?? 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Peak Hours · Live</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: currentValue >= 60 ? Colors.error : currentValue >= 35 ? Colors.warning : Colors.success }]} />
            <Text style={styles.statusLabel}>Right now: {crowdLabel(currentValue)}</Text>
          </View>
        </View>
        <Text style={styles.now}>{hourLabel(currentHour)}</Text>
      </View>

      <View style={[styles.chart, { height }]}>
        {data.map((v, i) => {
          const isCurrent = i === currentHour;
          const barHeight = Math.max(4, (v / 100) * height);
          return (
            <View key={i} style={styles.barWrap}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: isCurrent ? Colors.sunset : v >= 60 ? Colors.primary : v >= 35 ? Colors.primaryLight : Colors.surfaceSecondary,
                  },
                  isCurrent && styles.currentBar,
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.axis}>
        {[0, 6, 12, 18, 23].map((h) => (
          <Text key={h} style={styles.axisLabel}>{hourLabel(h)}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.base },
  label: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  now: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.sunset,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: Spacing.xs,
  },
  barWrap: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  bar: {
    width: '100%',
    borderRadius: 3,
  },
  currentBar: {
    shadowColor: Colors.sunset,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs },
  axisLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
});
