import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Badge } from './Badge';
import { Card } from './Card';
import { SabahEvent } from '@/types';

interface EventCardProps {
  event: SabahEvent;
  onPress?: () => void;
  compact?: boolean;
}

const categoryColors: Record<string, string> = {
  Cultural: Colors.category.cultural,
  Sports: Colors.category.sports,
  Food: Colors.category.food,
};

const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, compact }) => {
  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.9}>
        <View style={[styles.dateBadge, { backgroundColor: (categoryColors[event.category] || Colors.primary) + '15' }]}>
          <Text style={[styles.dateMonth, { color: categoryColors[event.category] || Colors.primary }]}>{monthNames[event.month]}</Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{event.name}</Text>
          <Text style={styles.compactLocation} numberOfLines={1}>{event.location}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={styles.row}>
          <View style={[styles.dateBadgeLarge, { backgroundColor: (categoryColors[event.category] || Colors.primary) + '15' }]}>
            <Text style={[styles.dateMonthLarge, { color: categoryColors[event.category] || Colors.primary }]}>{monthNames[event.month]}</Text>
            <Text style={[styles.dateDay, { color: categoryColors[event.category] || Colors.primary }]}>{event.dateRange.split(' ')[0]}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{event.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
              <Text style={styles.location}>{event.location}</Text>
            </View>
            <Text style={styles.dateRange}>{event.dateRange}</Text>
            <Badge label={event.category} color={categoryColors[event.category] || Colors.primary} size="sm" style={{ alignSelf: 'flex-start', marginTop: Spacing.xs }} />
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.md },
  dateBadgeLarge: { width: 56, height: 56, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  dateMonthLarge: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold },
  dateDay: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold },
  info: { flex: 1 },
  name: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  location: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  dateRange: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 2 },
  compactCard: { width: 180, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginRight: Spacing.md, flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  dateBadge: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  dateMonth: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold },
  compactInfo: { flex: 1 },
  compactName: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  compactLocation: { fontSize: 10, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 1 },
});
