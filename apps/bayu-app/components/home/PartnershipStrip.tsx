import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';

interface Partner {
  name: string;
  acronym: string;
  icon: string;
  color: string;
}

const partners: Partner[] = [
  { name: 'Sabah Tourism Board', acronym: 'STB', icon: 'earth', color: '#096DBB' },
  { name: 'Sabah Parks', acronym: 'Sabah Parks', icon: 'leaf', color: '#059669' },
  { name: 'JAKIM Halal', acronym: 'JAKIM', icon: 'shield-checkmark', color: '#10B981' },
  { name: 'Tourism Malaysia', acronym: 'Tourism Malaysia', icon: 'flag', color: '#F5362F' },
  { name: 'Sabah Wildlife Dept', acronym: 'SWD', icon: 'paw', color: '#8B6914' },
  { name: 'Sabah Parks Marine', acronym: 'Marine Parks', icon: 'water', color: '#00BCD4' },
];

export const PartnershipStrip: React.FC = () => (
  <View style={styles.wrap}>
    <View style={styles.headerRow}>
      <Ionicons name="ribbon-outline" size={12} color={Colors.textTertiary} />
      <Text style={styles.label}>OFFICIAL PARTNERS & CERTIFICATIONS</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {partners.map((p) => (
        <View key={p.acronym} style={styles.chip}>
          <View style={[styles.iconWrap, { backgroundColor: p.color + '15' }]}>
            <Ionicons name={p.icon as any} size={12} color={p.color} />
          </View>
          <Text style={styles.chipText}>{p.acronym}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  label: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
  },
  row: { gap: Spacing.sm, paddingRight: Spacing.base, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.textSecondary,
  },
});
