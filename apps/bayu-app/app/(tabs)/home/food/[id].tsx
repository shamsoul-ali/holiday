import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { Card, Badge, StarRating, Button } from '@/components/ui';
import { PeakHoursChart } from '@/components/food/PeakHoursChart';
import { foodSpots, foodGalleries, foodPeakHours, foodReviews } from '@/data';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 320;

const tagColors: Record<string, string> = {
  'tourist-friendly': Colors.primary,
  'muslim-friendly': Colors.secondary,
  'viral-spot': Colors.error,
  'local-gem': Colors.sunset,
};

const tagLabels: Record<string, string> = {
  'tourist-friendly': 'Tourist-friendly',
  'muslim-friendly': 'Muslim-friendly',
  'viral-spot': 'Viral Spot',
  'local-gem': 'Local Gem',
};

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const spot = foodSpots.find((f) => f.id === id);
  const gallery = spot ? (foodGalleries[spot.id] || [spot.image]) : [];
  const peaks = spot ? (foodPeakHours[spot.id] || []) : [];
  const reviews = spot ? (foodReviews[spot.id] || []) : [];

  if (!spot) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.floatBack}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.missing}>Food spot not found.</Text>
      </View>
    );
  }

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : spot.rating;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Hero gallery */}
        <View style={styles.heroWrap}>
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={gallery}
            keyExtractor={(item, i) => `${item}-${i}`}
            onMomentumScrollEnd={(e) => setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.heroImage} contentFit="cover" transition={200} />
            )}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
            locations={[0, 0.3, 1]}
            style={styles.heroGradient}
            pointerEvents="none"
          />

          <View style={[styles.heroTopRow, { top: insets.top + Spacing.sm }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.heroTopRight}>
              <TouchableOpacity onPress={() => setSaved((s) => !s)} style={styles.iconBtn}>
                <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroDots}>
            {gallery.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroTagRow}>
              {spot.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} label={tagLabels[tag] || tag} color={tagColors[tag] || Colors.primary} size="sm" />
              ))}
              {spot.isHalal && <Badge label="Halal JAKIM" color={Colors.secondary} size="sm" />}
            </View>
            <Text style={styles.heroName}>{spot.name}</Text>
            <Text style={styles.heroCuisine}>{spot.cuisine} · {spot.priceRange}</Text>
          </View>
        </View>

        {/* Quick stats bar */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.statsRow}>
          <View style={styles.stat}>
            <StarRating rating={avgRating} size={14} />
            <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>{reviews.length} reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color={Colors.primary} />
            <Text style={styles.statValue}>Open</Text>
            <Text style={styles.statLabel}>{spot.peakHours.split(',')[0]}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Ionicons name="location-outline" size={16} color={Colors.sunset} />
            <Text style={styles.statValue}>{spot.location.split(',').slice(-1)[0].trim()}</Text>
            <Text style={styles.statLabel}>Sabah</Text>
          </View>
        </Animated.View>

        {/* Peak hours chart */}
        <Animated.View entering={FadeInDown.delay(140).duration(400)} style={styles.section}>
          <PeakHoursChart data={peaks} />
        </Animated.View>

        {/* Must-try dishes */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Must-try Dishes</Text>
          <Text style={styles.sectionHint}>Crowd favourites recommended by locals</Text>
          <View style={styles.mustTryRow}>
            {spot.mustTry.map((dish) => (
              <View key={dish} style={styles.dishChip}>
                <LinearGradient
                  colors={['#F7B731', '#FDE68A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.dishIcon}
                >
                  <Ionicons name="restaurant" size={14} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.dishText}>{dish}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Reviews */}
        <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <Text style={styles.sectionLink}>See all {reviews.length} →</Text>
          </View>
          {reviews.map((r) => (
            <Card key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewTopRow}>
                <View style={[styles.avatar, { backgroundColor: `hsl(${r.avatarHue}, 60%, 55%)` }]}>
                  <Text style={styles.avatarText}>{r.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <Text style={styles.reviewDate}>{r.date}</Text>
                </View>
                <StarRating rating={r.rating} size={12} />
              </View>
              <Text style={styles.reviewText}>{r.text}</Text>
            </Card>
          ))}
        </Animated.View>

        {/* Location */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Card style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationText}>{spot.location}</Text>
              <Text style={styles.locationMeta}>Peak times: {spot.peakHours}</Text>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Button
          title="Directions"
          variant="outline"
          size="md"
          onPress={() => Alert.alert('Open in Maps?', 'This would deep-link to Google Maps / Apple Maps.')}
          icon={<Ionicons name="navigate" size={16} color={Colors.primary} />}
          style={{ flex: 1 }}
        />
        <Button
          title={saved ? 'Saved' : 'Save'}
          variant="primary"
          size="md"
          onPress={() => setSaved((s) => !s)}
          icon={<Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={16} color="#FFFFFF" />}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  missing: { textAlign: 'center', marginTop: 80, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  floatBack: { position: 'absolute', top: 50, left: Spacing.base, width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },

  heroWrap: { width, height: HERO_HEIGHT },
  heroImage: { width, height: HERO_HEIGHT },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroTopRow: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroTopRight: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDots: {
    position: 'absolute',
    bottom: Spacing.base,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 20, backgroundColor: '#FFFFFF' },
  heroContent: { position: 'absolute', bottom: Spacing.xl + Spacing.md, left: Spacing.base, right: Spacing.base, gap: Spacing.xs },
  heroTagRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.xs, flexWrap: 'wrap' },
  heroName: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
  },
  heroCuisine: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.92)',
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base,
    marginTop: -Spacing.xl,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
    zIndex: 10,
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
  },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },

  section: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
    marginBottom: 2,
  },
  sectionHint: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionLink: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.primary,
  },

  mustTryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.xs },
  dishChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingRight: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FEF7E0',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.sunset + '40',
  },
  dishIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#8B6F47',
  },

  reviewCard: { marginBottom: Spacing.sm, padding: Spacing.base, gap: Spacing.sm },
  reviewTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold },
  reviewName: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  reviewDate: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  reviewText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.5,
  },

  locationCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  locationMeta: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
