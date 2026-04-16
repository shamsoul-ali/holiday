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
import { sabahDestinations, featuredDestinations } from '@/data';
import { formatCurrency } from '@/utils';
import { Button, Badge, StarRating, Card, SustainBadges, getDestinationBadges } from '@/components/ui';
import { CrowdLevel, SabahDestination } from '@/types';

const crowdColors: Record<CrowdLevel, string> = {
  low: Colors.success,
  moderate: Colors.warning,
  high: Colors.sunset,
  'very-high': Colors.error,
};

export default function DestinationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const dest = sabahDestinations.find((d) => d.id === id);
  if (!dest) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.heroContainer}>
          <Image source={{ uri: dest.image }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']} style={styles.heroOverlay} />
          <TouchableOpacity style={[styles.backBtn, { top: insets.top + Spacing.sm }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{dest.name}</Text>
            <Text style={styles.heroCountry}>{dest.district}, Sabah</Text>
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

          <Text style={styles.sectionLabel}>Sustainability</Text>
          <SustainBadges badges={getDestinationBadges(dest)} size="md" max={5} style={{ marginBottom: Spacing.lg }} />

          {/* Sabah-specific info */}
          <View style={styles.infoGrid}>
            {/* Crowd Level */}
            <Card style={styles.infoItem}>
              <View style={[styles.crowdDot, { backgroundColor: crowdColors[dest.crowdLevel] }]} />
              <Text style={styles.infoLabel}>Crowd</Text>
              <Text style={[styles.infoValue, { color: crowdColors[dest.crowdLevel] }]}>
                {dest.crowdLevel.charAt(0).toUpperCase() + dest.crowdLevel.slice(1)}
              </Text>
            </Card>

            {/* Eco Rating */}
            <Card style={styles.infoItem}>
              <Ionicons name="leaf" size={20} color={Colors.secondary} />
              <Text style={styles.infoLabel}>Eco Rating</Text>
              <Text style={styles.infoValue}>{dest.ecoRating}/5</Text>
            </Card>

            {/* Best Time */}
            <Card style={styles.infoItem}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Best Time</Text>
              <Text style={styles.infoValue}>{dest.bestTimeToVisit}</Text>
            </Card>

            {/* Permit */}
            {dest.permitRequired && (
              <Card style={styles.infoItem}>
                <Ionicons name="document-text" size={20} color={Colors.warning} />
                <Text style={styles.infoLabel}>Permit</Text>
                <Text style={[styles.infoValue, { color: Colors.warning }]}>Required</Text>
              </Card>
            )}
          </View>

          {/* Tide Info */}
          {dest.tideInfo && (
            <Card style={styles.tideCard}>
              <View style={styles.tideRow}>
                <Ionicons name="water" size={20} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tideTitle}>Tide Info</Text>
                  <Text style={styles.tideText}>{dest.tideInfo}</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Wildlife */}
          {dest.wildlifeTypes && dest.wildlifeTypes.length > 0 && (
            <View style={styles.wildlifeSection}>
              <Text style={styles.sectionLabel}>Wildlife</Text>
              <View style={styles.wildlifeTags}>
                {dest.wildlifeTypes.map((animal, i) => (
                  <Badge key={i} label={animal} color={Colors.secondary + '15'} textColor={Colors.secondary} size="sm" />
                ))}
              </View>
            </View>
          )}

          {/* Alternative Spots */}
          {dest.alternativeSpots && dest.alternativeSpots.length > 0 && (
            <View style={styles.altSection}>
              <Text style={styles.sectionLabel}>Also nearby</Text>
              {dest.alternativeSpots.map((spot, i) => {
                const match = sabahDestinations.find((d) => d.name === spot);
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.altSpot}
                    onPress={() => {
                      if (match) {
                        router.push({ pathname: '/(tabs)/home/destination/[id]', params: { id: match.id } });
                      } else {
                        router.push('/(tabs)/home/islands' as any);
                      }
                    }}
                  >
                    <Ionicons name="navigate" size={16} color={Colors.primary} />
                    <Text style={styles.altSpotText}>{spot}</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 80 }]}>
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
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  infoItem: { width: '47%', alignItems: 'center', paddingVertical: Spacing.md },
  crowdDot: { width: 12, height: 12, borderRadius: 6 },
  infoLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: Spacing.xs },
  infoValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, marginTop: 2 },
  tideCard: { marginBottom: Spacing.lg },
  tideRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  tideTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  tideText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2, lineHeight: 20 },
  wildlifeSection: { marginBottom: Spacing.lg },
  sectionLabel: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.sm },
  wildlifeTags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  altSection: { marginBottom: Spacing.lg },
  altSpot: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  altSpotText: { flex: 1, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight, backgroundColor: Colors.background },
  footerPrice: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  footerPer: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
});
