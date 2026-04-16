import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Quest } from '@/types';
import { Card } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';

interface Props {
  quests: Quest[];
}

const formatExpiry = (h: number): string => {
  if (h < 24) return `${h}h left`;
  return `${Math.round(h / 24)}d left`;
};

export const QuestList: React.FC<Props> = ({ quests }) => (
  <View style={{ gap: Spacing.sm }}>
    {quests.map((q) => {
      const pct = Math.min(100, (q.progress / q.target) * 100);
      const nearComplete = pct >= 80;
      return (
        <Card key={q.id} style={styles.card}>
          <View style={styles.iconWrap}>
            <View style={[styles.icon, { backgroundColor: q.color + '20' }]}>
              <Ionicons name={q.icon as any} size={22} color={q.color} />
            </View>
            {nearComplete && <View style={styles.pulseRing} />}
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.topRow}>
              <Text style={styles.title}>{q.title}</Text>
              <View style={styles.rewardChip}>
                <Ionicons name="sparkles" size={10} color={Colors.sunset} />
                <Text style={styles.rewardText}>+{q.rewardPoints}</Text>
              </View>
            </View>
            <Text style={styles.desc} numberOfLines={1}>{q.description}</Text>

            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: q.color }]} />
              </View>
              <Text style={styles.progressText}>{q.progress}/{q.target}</Text>
            </View>

            <View style={styles.expiryRow}>
              <Ionicons name="time-outline" size={10} color={Colors.textTertiary} />
              <Text style={styles.expiryText}>{formatExpiry(q.expiryHours)}</Text>
            </View>
          </View>
        </Card>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.base, alignItems: 'flex-start' },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.sunset,
    opacity: 0.5,
  },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  title: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    backgroundColor: Colors.sunset + '15',
    borderRadius: BorderRadius.full,
  },
  rewardText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.sunset,
  },

  desc: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.text,
  },

  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  expiryText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
  },
});
