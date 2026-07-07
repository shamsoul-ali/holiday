import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import {
  districtsById,
  sabahDestinations,
  getFoodCountsByDistrict,
  getEventCountsByDistrict,
  getAlertCountsByDistrict,
  getIslandCountsByDistrict,
} from '@/data';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { Button, Badge } from '@/components/ui';
import type { MapMode } from '@/components/SabahMap';

interface Props {
  visible: boolean;
  districtId: string | null;
  mode?: MapMode;
  onClose: () => void;
}

const crowdLabels: Record<string, string> = {
  low: 'Quiet',
  moderate: 'Steady',
  high: 'Busy',
  'very-high': 'Peak',
};

const crowdColors: Record<string, string> = {
  low: Colors.success,
  moderate: Colors.warning,
  high: Colors.sunset,
  'very-high': Colors.error,
};

export const SabahMapSheet: React.FC<Props> = ({ visible, districtId, mode = 'occupancy', onClose }) => {
  const router = useRouter();
  const district = districtId ? districtsById[districtId] : undefined;

  if (!district) return null;

  const foodCount = getFoodCountsByDistrict()[district.id] || 0;
  const eventCount = getEventCountsByDistrict()[district.id] || 0;
  const alertCount = getAlertCountsByDistrict()[district.id] || 0;
  const islandCount = getIslandCountsByDistrict()[district.id] || 0;

  const destsInDistrict = sabahDestinations.filter((d) =>
    district.destinationIds.includes(d.id),
  );

  // Primary CTA contextual to map mode
  const primaryCta = (() => {
    switch (mode) {
      case 'food':
        return {
          label: `See ${foodCount} food spot${foodCount === 1 ? '' : 's'}`,
          disabled: foodCount === 0,
          onPress: () => { onClose(); router.push('/(tabs)/home/food' as any); },
        };
      case 'islands':
        return {
          label: `See ${islandCount} island${islandCount === 1 ? '' : 's'}`,
          disabled: islandCount === 0,
          onPress: () => { onClose(); router.push('/(tabs)/home/islands' as any); },
        };
      case 'safety':
        return {
          label: `See ${alertCount} active alert${alertCount === 1 ? '' : 's'}`,
          disabled: alertCount === 0,
          onPress: () => { onClose(); router.push('/(tabs)/home/safety-hub' as any); },
        };
      case 'activity':
        return {
          label: `See ${eventCount} event${eventCount === 1 ? '' : 's'}`,
          disabled: eventCount === 0,
          onPress: () => { onClose(); router.push('/(tabs)/discover' as any); },
        };
      default: {
        const firstDest = destsInDistrict[0];
        return {
          label: firstDest ? `Explore ${firstDest.name}` : 'View destinations',
          disabled: !firstDest,
          onPress: () => {
            onClose();
            if (firstDest) {
              router.push({ pathname: '/(tabs)/home/destination/[id]', params: { id: firstDest.id } } as any);
            }
          },
        };
      }
    }
  })();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(220)} style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <Animated.View entering={SlideInDown.duration(320)} style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <LinearGradient colors={[...Colors.gradients.oceanDepth]} style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.districtPill}>
                <Ionicons name="location" size={11} color="#FFFFFF" />
                <Text style={styles.districtPillText}>DISTRICT</Text>
              </View>
              {district.id === 'kk' && (
                <View style={[styles.districtPill, { backgroundColor: 'rgba(247,183,49,0.25)' }]}>
                  <Ionicons name="star" size={11} color="#FDE68A" />
                  <Text style={[styles.districtPillText, { color: '#FDE68A' }]}>CAPITAL</Text>
                </View>
              )}
            </View>
            <Text style={styles.name}>{district.name}</Text>
            {district.tagline && <Text style={styles.tagline}>{district.tagline}</Text>}
          </LinearGradient>

          {/* Stats grid */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{district.occupancy}%</Text>
              <Text style={styles.statLabel}>Occupancy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <View style={styles.crowdInline}>
                <View style={[styles.crowdDot, { backgroundColor: crowdColors[district.crowdLevel] }]} />
                <Text style={[styles.statValue, { color: crowdColors[district.crowdLevel] }]}>
                  {crowdLabels[district.crowdLevel]}
                </Text>
              </View>
              <Text style={styles.statLabel}>Crowd</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{district.rooms.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Rooms</Text>
            </View>
          </View>

          {/* Resource counts */}
          <View style={styles.countsRow}>
            <CountChip icon="restaurant" label={`${foodCount} food`} color={Colors.sunset} />
            <CountChip icon="boat" label={`${islandCount} islands`} color={Colors.ocean} />
            <CountChip icon="calendar" label={`${eventCount} events`} color={Colors.secondary} />
            {alertCount > 0 && (
              <CountChip icon="warning" label={`${alertCount} alerts`} color={Colors.error} />
            )}
          </View>

          {/* Destinations in this district */}
          {destsInDistrict.length > 0 && (
            <View style={styles.destsSection}>
              <Text style={styles.destsLabel}>DESTINATIONS IN {district.name.toUpperCase()}</Text>
              <View style={styles.destsRow}>
                {destsInDistrict.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={styles.destChip}
                    onPress={() => {
                      onClose();
                      router.push({ pathname: '/(tabs)/home/destination/[id]', params: { id: d.id } } as any);
                    }}
                  >
                    <Text style={styles.destChipText}>{d.name}</Text>
                    <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Primary CTA */}
          <View style={{ marginTop: Spacing.md }}>
            <Button
              title={primaryCta.label}
              onPress={primaryCta.onPress}
              size="lg"
              fullWidth
              disabled={primaryCta.disabled}
              icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            />
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const CountChip: React.FC<{ icon: string; label: string; color: string }> = ({ icon, label, color }) => (
  <View style={[styles.countChip, { borderColor: color + '40', backgroundColor: color + '10' }]}>
    <Ionicons name={icon as any} size={12} color={color} />
    <Text style={[styles.countChipText, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,22,40,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },

  header: {
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  headerTop: { flexDirection: 'row', gap: Spacing.sm },
  districtPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
  },
  districtPillText: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  name: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    marginTop: Spacing.sm,
  },
  tagline: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 2,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  statValue: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.headingBold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  crowdInline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  crowdDot: { width: 6, height: 6, borderRadius: 3 },

  countsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.md,
  },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  countChipText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
  },

  destsSection: { marginTop: Spacing.md },
  destsLabel: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  destsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  destChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  destChipText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.primary,
  },

  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
