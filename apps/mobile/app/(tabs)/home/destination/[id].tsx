import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { allDestinations, featuredDestinations } from '@/data';
import { formatCurrency } from '@/utils';
import { Button, Badge, StarRating } from '@/components/ui';

export default function DestinationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const dest = [...allDestinations, ...featuredDestinations].find((d) => d.id === id);
  if (!dest) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <Image source={{ uri: dest.image }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']} style={styles.heroOverlay} />
          <TouchableOpacity style={[styles.backBtn, { top: insets.top + Spacing.sm }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{dest.name}</Text>
            <Text style={styles.heroCountry}>{dest.country}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <StarRating rating={dest.rating} size={16} />
              <Text style={styles.statText}>{dest.rating} rating</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="pricetag" size={16} color={Colors.primary} />
              <Text style={styles.statText}>From {formatCurrency(dest.price)}</Text>
            </View>
          </View>

          <Text style={styles.description}>{dest.description}</Text>

          <View style={styles.tags}>
            {dest.tags.map((tag, i) => (
              <Badge key={i} label={tag} color={Colors.primary + '15'} textColor={Colors.primary} size="md" />
            ))}
          </View>

          {dest.accommodations && (
            <View style={styles.infoCard}>
              <Ionicons name="business-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>{dest.accommodations.toLocaleString()} accommodations available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View>
          <Text style={styles.footerPrice}>From {formatCurrency(dest.price)}</Text>
          <Text style={styles.footerPer}>per person</Text>
        </View>
        <Button title="Plan Trip" onPress={() => router.push('/(tabs)/explore')} size="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroContainer: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  backBtn: { position: 'absolute', left: Spacing.base, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { position: 'absolute', bottom: Spacing.lg, left: Spacing.lg },
  heroTitle: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  heroCountry: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  body: { padding: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.xl, marginBottom: Spacing.lg },
  stat: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  statText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  description: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, lineHeight: 24, marginBottom: Spacing.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base, backgroundColor: Colors.surface, borderRadius: BorderRadius.md },
  infoText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight, backgroundColor: Colors.background },
  footerPrice: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  footerPer: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
});
