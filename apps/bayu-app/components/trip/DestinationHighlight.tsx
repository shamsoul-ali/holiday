import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { SabahDestination, CrowdLevel } from '@/types';

interface Props {
  destination: SabahDestination;
}

const crowdColors: Record<CrowdLevel, string> = {
  low: Colors.success,
  moderate: Colors.warning,
  high: Colors.sunset,
  'very-high': Colors.error,
};

const crowdLabels: Record<CrowdLevel, string> = {
  low: 'Quiet',
  moderate: 'Steady',
  high: 'Busy',
  'very-high': 'Peak',
};

export const DestinationHighlight: React.FC<Props> = ({ destination }) => {
  const topActivities = destination.tags.slice(0, 4);
  const topWildlife = destination.wildlifeTypes?.slice(0, 3) || [];

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.card}>
      <View style={styles.hero}>
        <Image source={{ uri: destination.image }} style={styles.image} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.5, 1]}
          style={styles.overlay}
        />
        <View style={styles.districtPill}>
          <Ionicons name="location" size={11} color="#FFFFFF" />
          <Text style={styles.districtText}>{destination.district}</Text>
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.eyebrow}>YOUR DESTINATION</Text>
          <Text style={styles.destName}>{destination.name}</Text>
          <Text style={styles.destDesc} numberOfLines={2}>{destination.description}</Text>
        </View>
      </View>

      {/* Stats bar */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
          <Text style={styles.statLabel}>Best</Text>
          <Text style={styles.statValue} numberOfLines={1}>{destination.bestTimeToVisit}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={14} color={crowdColors[destination.crowdLevel]} />
          <Text style={styles.statLabel}>Crowd</Text>
          <Text style={[styles.statValue, { color: crowdColors[destination.crowdLevel] }]}>
            {crowdLabels[destination.crowdLevel]}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="leaf-outline" size={14} color={Colors.secondary} />
          <Text style={styles.statLabel}>Eco</Text>
          <Text style={styles.statValue}>{'★'.repeat(destination.ecoRating || 3)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="star" size={14} color={Colors.sunset} />
          <Text style={styles.statLabel}>Rating</Text>
          <Text style={styles.statValue}>{destination.rating}</Text>
        </View>
      </View>

      {/* Activity chips */}
      {topActivities.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Ionicons name="compass" size={14} color={Colors.primary} />
            <Text style={styles.sectionLabel}>What you'll do</Text>
          </View>
          <View style={styles.chipRow}>
            {topActivities.map((tag, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Wildlife chips */}
      {topWildlife.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Ionicons name="paw" size={14} color={Colors.secondary} />
            <Text style={styles.sectionLabel}>Wildlife you may spot</Text>
          </View>
          <View style={styles.chipRow}>
            {topWildlife.map((w, i) => (
              <View key={i} style={[styles.chip, styles.chipWildlife]}>
                <Text style={[styles.chipText, { color: Colors.secondary }]}>{w}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tide info */}
      {destination.tideInfo && (
        <View style={styles.infoRow}>
          <Ionicons name="water" size={14} color={Colors.ocean} />
          <Text style={styles.infoText}>{destination.tideInfo}</Text>
        </View>
      )}

      {/* Permit warning */}
      {destination.permitRequired && (
        <View style={styles.permitBanner}>
          <Ionicons name="alert-circle" size={16} color={Colors.warning} />
          <View style={{ flex: 1 }}>
            <Text style={styles.permitTitle}>Permit required</Text>
            <Text style={styles.permitDesc}>Included in Comfort & Premium packages. Booking handles it.</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  hero: { width: '100%', height: 180 },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject },
  districtPill: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: BorderRadius.full,
  },
  districtText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heroContent: { position: 'absolute', bottom: Spacing.md, left: Spacing.md, right: Spacing.md },
  eyebrow: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  destName: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
  },
  destDesc: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 2,
    lineHeight: Typography.sizes.xs * 1.4,
  },

  statsRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
  },
  statValue: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
    textAlign: 'center',
  },
  statDivider: { width: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.xs },

  section: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: Spacing.sm },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.primary + '12',
    borderRadius: BorderRadius.full,
  },
  chipWildlife: { backgroundColor: Colors.secondary + '12' },
  chipText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.primary,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.xs * 1.4,
  },

  permitBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: Colors.warning + '12',
    borderTopWidth: 1,
    borderTopColor: Colors.warning + '30',
    alignItems: 'flex-start',
  },
  permitTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  permitDesc: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
