import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useTripStore } from '@/store';
import { formatCurrency, formatDurationLabel } from '@/utils';
import { Button, Badge } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { TripPackage, TierType } from '@/types';

const tierColors: Record<TierType, string> = { budget: Colors.budget, comfort: Colors.comfort, luxury: Colors.luxury };
const tierLabels: Record<TierType, string> = { budget: 'BUDGET', comfort: 'RECOMMENDED', luxury: 'PREMIUM' };

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { packages, selectPackage, wizard } = useTripStore();

  const handleSelect = (pkg: TripPackage) => {
    selectPackage(pkg);
    router.push('/(tabs)/explore/itinerary');
  };

  const contextParts = [
    wizard.duration,
    wizard.destination ? `to ${wizard.destination}` : null,
    wizard.startDate ? `| ${wizard.startDate.substring(5, 7)}/${wizard.startDate.substring(0, 4)}` : null,
    `From ${wizard.departureCity}`,
    `${wizard.adults} Adult${wizard.adults > 1 ? 's' : ''}${wizard.children > 0 ? ` ${wizard.children}C` : ''}`,
  ].filter(Boolean).join(' | ');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Trip Options" />
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {contextParts && (
          <View style={styles.contextBanner}>
            <Ionicons name="airplane" size={14} color={Colors.primary} />
            <Text style={styles.contextText}>{contextParts}</Text>
          </View>
        )}
        <Text style={styles.subtitle}>AI generated 3 options for you</Text>
        {packages.map((pkg, index) => (
          <Animated.View key={pkg.id} entering={FadeInUp.delay(index * 200).duration(400)}>
            <TouchableOpacity style={[styles.packageCard, { borderColor: tierColors[pkg.tier] + '40' }]} activeOpacity={0.9} onPress={() => handleSelect(pkg)}>
              <Image source={{ uri: pkg.image }} style={styles.packageImage} contentFit="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.imageOverlay} />
              <Badge
                label={tierLabels[pkg.tier]}
                color={tierColors[pkg.tier]}
                style={styles.tierBadge}
              />

              <View style={styles.packageBody}>
                <Text style={styles.packageTitle}>{pkg.title}</Text>
                <Text style={styles.packageDest}>{pkg.destination} - {pkg.duration}</Text>

                <View style={styles.priceRow}>
                  <Text style={[styles.packagePrice, { color: tierColors[pkg.tier] }]}>{formatCurrency(pkg.price)}</Text>
                  <Text style={styles.perPerson}>{formatCurrency(pkg.pricePerPerson)}/pax</Text>
                </View>

                <View style={styles.highlightsRow}>
                  {pkg.highlights.slice(0, 3).map((h, i) => (
                    <View key={i} style={styles.highlight}>
                      <Ionicons name="checkmark-circle" size={14} color={tierColors[pkg.tier]} />
                      <Text style={styles.highlightText}>{h}</Text>
                    </View>
                  ))}
                </View>

                <Button
                  title="View Itinerary"
                  onPress={() => handleSelect(pkg)}
                  variant={pkg.isRecommended ? 'primary' : 'outline'}
                  size="md"
                  fullWidth
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.base, paddingBottom: 40 },
  contextBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.primary + '10', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  contextText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary, flex: 1 },
  subtitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginBottom: Spacing.lg, textAlign: 'center' },
  packageCard: { borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.lg, backgroundColor: Colors.background, borderWidth: 1, ...Shadows.lg },
  packageImage: { width: '100%', height: 160 },
  imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 160 },
  tierBadge: { position: 'absolute', top: Spacing.md, left: Spacing.md },
  packageBody: { padding: Spacing.base },
  packageTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  packageDest: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, marginVertical: Spacing.md },
  packagePrice: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold },
  perPerson: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  highlightsRow: { gap: Spacing.xs, marginBottom: Spacing.md },
  highlight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  highlightText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
});
