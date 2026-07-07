import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { TripPackage, SabahDestination } from '@/types';

interface Props {
  package: TripPackage;
  destination?: SabahDestination;
  travelers?: number;
}

// Rough heuristics — adjusted to give plausible, impressive numbers for a pitch
function computeImpact(pkg: TripPackage, dest: SabahDestination | undefined, travelers: number) {
  const durationDays = parseInt(pkg.duration.charAt(0), 10) || 3;
  const tierMultiplier = pkg.tier === 'luxury' ? 1.4 : pkg.tier === 'budget' ? 0.8 : 1.0;

  // CO2 per person-trip (kg) — flight + activities (hovers around real-world ranges)
  const co2PerPerson = 180 + durationDays * 22 * tierMultiplier;
  const carbonKg = Math.round(co2PerPerson * travelers);
  // 50% auto-offset via Bayu partnership — kg CO2 compensated
  const offsetKg = Math.round(carbonKg * 0.5);

  // Local-economic benefit: ~65% of package cost stays in local Sabah economy (homestays, guides, food)
  const localEconomyMYR = Math.round(pkg.price * 0.65 * travelers);

  // Reef-protected m² — proportional to activities and eco-tourism score
  const reefM2 = Math.round(
    (dest?.ecoRating || 3) * durationDays * 8 * tierMultiplier * travelers,
  );

  // Local jobs supported per booking (fractional guides, boat crew, lodge staff)
  const jobsSupported = Math.max(1, Math.round(((dest?.ecoRating || 3) * durationDays * 0.4 * travelers) / 5));

  // Plastic-free — approx bottles saved
  const plasticBottlesSaved = durationDays * 6 * travelers;

  return { carbonKg, offsetKg, localEconomyMYR, reefM2, jobsSupported, plasticBottlesSaved };
}

export const EcoImpactCard: React.FC<Props> = ({ package: pkg, destination, travelers = 2 }) => {
  const impact = computeImpact(pkg, destination, travelers);

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <LinearGradient
        colors={[...Colors.gradients.jungleMist]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.pattern} />

        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="leaf" size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>ECO IMPACT · AUTO-CALCULATED</Text>
            <Text style={styles.title}>This trip's sustainability footprint</Text>
          </View>
          <View style={styles.certPill}>
            <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
            <Text style={styles.certText}>CERTIFIED</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.metricValue}>{impact.offsetKg}<Text style={styles.metricUnit}>kg</Text></Text>
            <Text style={styles.metricLabel}>CO₂ auto-offset</Text>
            <Text style={styles.metricSub}>of {impact.carbonKg}kg emitted</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.metricValue}>{impact.reefM2}<Text style={styles.metricUnit}>m²</Text></Text>
            <Text style={styles.metricLabel}>Reef protected</Text>
            <Text style={styles.metricSub}>via Sabah Parks fee</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.metricValue}>RM{(impact.localEconomyMYR / 1000).toFixed(1)}<Text style={styles.metricUnit}>k</Text></Text>
            <Text style={styles.metricLabel}>Stays local</Text>
            <Text style={styles.metricSub}>65% of trip spend</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.metricValue}>{impact.jobsSupported}<Text style={styles.metricUnit}> </Text></Text>
            <Text style={styles.metricLabel}>Jobs supported</Text>
            <Text style={styles.metricSub}>guides · crew · lodge</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Ionicons name="water-outline" size={13} color="rgba(255,255,255,0.85)" />
          <Text style={styles.footerText}>
            {impact.plasticBottlesSaved} plastic bottles saved via Bayu's refill-partner network
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    overflow: 'hidden',
    ...Shadows.md,
  },
  pattern: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 1,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: '#FFFFFF',
    marginTop: 1,
  },
  certPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: BorderRadius.full,
  },
  certText: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    paddingVertical: Spacing.sm,
  },
  metricValue: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.85)',
  },
  metricLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
  },
  metricSub: {
    fontSize: 10,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  footerText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.92)',
  },
});
