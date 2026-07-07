import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useUmrahStore } from '@/store';
import { formatCurrency } from '@/utils';
import { Badge, StarRating } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { TierType } from '@/types';

const tierColors: Record<TierType, string> = {
  ekonomi: Colors.ekonomi,
  standard: Colors.standard,
  premium: Colors.premium,
  vip: Colors.vip,
};

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { packages, selectPackage } = useUmrahStore();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Pakej Tersedia" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>4 pakej disyorkan untuk anda</Text>

        {packages.map((pkg, index) => (
          <Animated.View key={pkg.id} entering={FadeInDown.delay(index * 150).duration(500)}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => { selectPackage(pkg); router.push('/(tabs)/umrah/itinerary'); }}
              activeOpacity={0.8}
            >
              <Image source={{ uri: pkg.image }} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Badge label={pkg.tier.charAt(0).toUpperCase() + pkg.tier.slice(1)} color={tierColors[pkg.tier]} />
                  {pkg.isRecommended && <Badge label="Disyorkan" color={Colors.secondary} />}
                </View>
                <Text style={styles.cardTitle}>{pkg.title}</Text>

                <View style={styles.hotelRow}>
                  <Ionicons name="business" size={14} color={Colors.textSecondary} />
                  <Text style={styles.hotelText}>{pkg.hotelMakkah}</Text>
                </View>
                <View style={styles.hotelRow}>
                  <Ionicons name="location" size={14} color={Colors.textSecondary} />
                  <Text style={styles.hotelText}>{pkg.distanceHaram} dari Haram</Text>
                </View>
                <View style={styles.hotelRow}>
                  <Ionicons name="airplane" size={14} color={Colors.textSecondary} />
                  <Text style={styles.hotelText}>{pkg.airline} ({pkg.flightClass})</Text>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <StarRating rating={pkg.rating} />
                    <Text style={styles.duration}>{pkg.duration}</Text>
                  </View>
                  <View style={styles.priceCol}>
                    <Text style={[styles.price, { color: tierColors[pkg.tier] }]}>{formatCurrency(pkg.price)}</Text>
                    <Text style={styles.perPerson}>/orang</Text>
                  </View>
                </View>
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
  content: { padding: Spacing.base },
  subtitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginBottom: Spacing.base, paddingHorizontal: Spacing.sm },

  card: { backgroundColor: Colors.background, borderRadius: BorderRadius.lg, marginBottom: Spacing.base, overflow: 'hidden', ...Shadows.md },
  cardImage: { width: '100%', height: 150 },
  cardBody: { padding: Spacing.base },
  cardHeader: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  cardTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text, marginBottom: Spacing.sm },

  hotelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  hotelText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  duration: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 4 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold },
  perPerson: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
});
