import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { BorderRadius } from '@/constants/spacing';
import type { SabahDestination, SabahIsland } from '@/types';

export type SustainBadgeKey =
  | 'reef-safe'
  | 'marine-protected'
  | 'eco-certified'
  | 'carbon-neutral'
  | 'plastic-free'
  | 'local-community'
  | 'permit-regulated';

const BADGES: Record<SustainBadgeKey, { label: string; short: string; icon: string; color: string }> = {
  'reef-safe':        { label: 'Reef-safe',        short: 'Reef',    icon: 'water',     color: '#00BCD4' },
  'marine-protected': { label: 'Marine Park',      short: 'Marine',  icon: 'shield-checkmark', color: '#096DBB' },
  'eco-certified':    { label: 'Eco-certified',    short: 'Eco',     icon: 'leaf',      color: '#059669' },
  'carbon-neutral':   { label: 'Carbon-neutral',   short: 'CO₂',     icon: 'cloud-done', color: '#10B981' },
  'plastic-free':     { label: 'Plastic-free',     short: 'No🥤',    icon: 'trash-bin', color: '#0EA5E9' },
  'local-community':  { label: 'Community-led',    short: 'Local',   icon: 'people',    color: '#7C3AED' },
  'permit-regulated': { label: 'Capacity-limited', short: 'Limited', icon: 'ribbon',    color: '#F7B731' },
};

export function getDestinationBadges(d: SabahDestination): SustainBadgeKey[] {
  const out: SustainBadgeKey[] = [];
  if (d.ecoRating >= 4) out.push('eco-certified');
  if (d.tags?.some((t) => /marine|park|unesco/i.test(t))) out.push('marine-protected');
  if (d.tags?.some((t) => /div|snorkel|reef/i.test(t))) out.push('reef-safe');
  if (d.permitRequired) out.push('permit-regulated');
  if (d.ecoRating >= 5) out.push('carbon-neutral');
  return out;
}

export function getIslandBadges(i: SabahIsland): SustainBadgeKey[] {
  const out: SustainBadgeKey[] = [];
  if (i.isMarinePark) out.push('marine-protected');
  if (i.activities.includes('Diving') || i.activities.includes('Snorkeling')) out.push('reef-safe');
  if (i.permitRequired) out.push('permit-regulated');
  // assume remote islands are community-led
  if (i.region === 'Remote' || i.difficulty === 'hard') out.push('local-community');
  return out;
}

interface Props {
  badges: SustainBadgeKey[];
  size?: 'xs' | 'sm' | 'md';
  max?: number;
  iconOnly?: boolean;
  style?: ViewStyle;
}

export const SustainBadges: React.FC<Props> = ({ badges, size = 'sm', max = 3, iconOnly, style }) => {
  if (!badges.length) return null;
  const shown = badges.slice(0, max);
  const dims = size === 'xs' ? { pad: 4, icon: 10, font: 9 } : size === 'sm' ? { pad: 6, icon: 12, font: 10 } : { pad: 8, icon: 14, font: 11 };

  return (
    <View style={[styles.row, style]}>
      {shown.map((k) => {
        const b = BADGES[k];
        return (
          <View key={k} style={[styles.pill, { backgroundColor: b.color + '18', paddingHorizontal: dims.pad, paddingVertical: dims.pad / 2 }]}>
            <Ionicons name={b.icon as any} size={dims.icon} color={b.color} />
            {!iconOnly && (
              <Text style={[styles.text, { color: b.color, fontSize: dims.font }]}>{b.short}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: BorderRadius.full },
  text: { fontFamily: Typography.fonts.bodySemiBold },
});
