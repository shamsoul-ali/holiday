import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { Badge } from './Badge';
import { SabahIsland } from '@/types';

interface IslandCardProps {
  island: SabahIsland;
  onPress?: () => void;
  compact?: boolean;
}

const activityIcons: Record<string, string> = {
  Snorkeling: 'water',
  Diving: 'fish',
  Beach: 'sunny',
  Kayaking: 'boat',
  Hiking: 'walk',
  Wildlife: 'paw',
  Fishing: 'fish',
  Camping: 'bonfire',
  Photography: 'camera',
  'Mud Volcano': 'flame',
};

export const IslandCard: React.FC<IslandCardProps> = ({ island, onPress, compact }) => {
  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: island.image }} style={styles.compactImage} contentFit="cover" />
        <Text style={styles.compactName} numberOfLines={1}>{island.name}</Text>
        <Text style={styles.compactRegion} numberOfLines={1}>{island.region.split(' (')[0]}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: island.image }} style={styles.image} contentFit="cover" />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{island.name}</Text>
          {island.isMarinePark && (
            <Badge label="Marine Park" color="#0891b2" size="sm" />
          )}
        </View>
        <View style={styles.regionRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.region}>{island.region}</Text>
          {island.permitRequired && (
            <Badge label="Permit" color={Colors.warning} size="sm" />
          )}
        </View>
        <Text style={styles.highlight} numberOfLines={2}>{island.highlight}</Text>
        <View style={styles.activitiesRow}>
          {island.activities.slice(0, 4).map((act) => (
            <View key={act} style={styles.activityChip}>
              <Ionicons name={(activityIcons[act] || 'ellipse') as any} size={12} color={Colors.primary} />
              <Text style={styles.activityText}>{act}</Text>
            </View>
          ))}
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.difficulty}>
            {island.difficulty === 'easy' ? 'Easy Access' : island.difficulty === 'moderate' ? 'Moderate' : 'Advanced'}
          </Text>
          <Text style={styles.access}>{island.access}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.background, borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.md, ...Shadows.md },
  image: { width: '100%', height: 160 },
  body: { padding: Spacing.base },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  name: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: Colors.text, flex: 1, marginRight: Spacing.sm },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  region: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginRight: Spacing.sm },
  highlight: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.sm },
  activitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  activityChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '10', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  activityText: { fontSize: 11, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  difficulty: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  access: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
  compactCard: { width: 140, marginRight: Spacing.md },
  compactImage: { width: 140, height: 100, borderRadius: BorderRadius.md },
  compactName: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, marginTop: Spacing.xs },
  compactRegion: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
});
