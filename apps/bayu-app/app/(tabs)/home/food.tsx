import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { Card, Badge, StarRating } from '@/components/ui';
import { FoodMapSVG } from '@/components/food/FoodMapSVG';
import { foodSpots } from '@/data';

const foodTags = ['all', 'tourist-friendly', 'muslim-friendly', 'viral-spot', 'local-gem'] as const;
type FoodTag = typeof foodTags[number];

const tagLabels: Record<string, string> = {
  'all': 'All',
  'tourist-friendly': 'Tourist-friendly',
  'muslim-friendly': 'Muslim-friendly',
  'viral-spot': 'Viral',
  'local-gem': 'Local Gem',
};

type ViewMode = 'map' | 'list';

export default function FoodIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<ViewMode>('map');
  const [tag, setTag] = useState<FoodTag>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const filteredSpots = useMemo(() => {
    if (tag === 'all') return foodSpots;
    return foodSpots.filter((s) => s.tags.includes(tag));
  }, [tag]);

  const goToDetail = (id: string) =>
    router.push({ pathname: '/(tabs)/home/food/[id]', params: { id } } as any);

  const handleMapPinSelect = (id: string) => {
    setActiveId(id);
    const idx = filteredSpots.findIndex((s) => s.id === id);
    if (idx >= 0 && listRef.current) {
      listRef.current.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[...Colors.gradients.sabahSky]} style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>FOOD INTELLIGENCE</Text>
            <Text style={styles.title}>Sabah Food Map</Text>
          </View>
          <View style={styles.backBtn}>
            <Ionicons name="restaurant" size={20} color="#FFFFFF" />
          </View>
        </View>

        {/* Segmented toggle */}
        <View style={styles.segmented}>
          {(['map', 'list'] as ViewMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.segment, mode === m && styles.segmentActive]}
              onPress={() => setMode(m)}
            >
              <Ionicons
                name={m === 'map' ? 'map' : 'list'}
                size={14}
                color={mode === m ? Colors.primary : '#FFFFFF'}
              />
              <Text style={[styles.segmentText, mode === m && styles.segmentTextActive]}>
                {m === 'map' ? 'Map View' : 'List View'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScroll}
        style={{ flexGrow: 0 }}
      >
        {foodTags.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, tag === t && styles.chipActive]}
            onPress={() => setTag(t)}
          >
            <Text style={[styles.chipText, tag === t && styles.chipTextActive]}>
              {tagLabels[t]}
            </Text>
            {tag === t && <Text style={styles.chipCount}>{filteredSpots.length}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {mode === 'map' ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.mapSection}>
            <FoodMapSVG spots={filteredSpots} activeId={activeId} onSelect={handleMapPinSelect} />

            {activeId && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.activeCardWrap}>
                {(() => {
                  const spot = filteredSpots.find((s) => s.id === activeId);
                  if (!spot) return null;
                  return (
                    <TouchableOpacity activeOpacity={0.9} onPress={() => goToDetail(spot.id)}>
                      <Card style={styles.activeCard}>
                        <Image source={{ uri: spot.image }} style={styles.activeImage} contentFit="cover" />
                        <View style={styles.activeInfo}>
                          <Text style={styles.activeName} numberOfLines={1}>{spot.name}</Text>
                          <Text style={styles.activeCuisine}>{spot.cuisine}</Text>
                          <View style={styles.activeMeta}>
                            <StarRating rating={spot.rating} size={12} />
                            <Text style={styles.activeRating}>{spot.rating}</Text>
                            {spot.isHalal && <Badge label="Halal" color={Colors.secondary} size="sm" />}
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                      </Card>
                    </TouchableOpacity>
                  );
                })()}
              </Animated.View>
            )}

            <Text style={styles.mapHint}>Tap a glowing pin on the map to preview</Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)}>
            <FlatList
              ref={listRef}
              data={filteredSpots}
              scrollEnabled={false}
              keyExtractor={(i) => i.id}
              contentContainerStyle={styles.list}
              ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => goToDetail(item.id)}>
                    <Card style={styles.foodCard}>
                      <Image source={{ uri: item.image }} style={styles.foodImage} contentFit="cover" />
                      <View style={styles.foodInfo}>
                        <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.foodCuisine}>{item.cuisine} · {item.priceRange}</Text>
                        <View style={styles.foodMeta}>
                          <StarRating rating={item.rating} size={12} />
                          <Text style={styles.foodRating}>{item.rating}</Text>
                          {item.isHalal && <Badge label="Halal" color={Colors.secondary} size="sm" />}
                        </View>
                        <Text style={styles.foodPeak} numberOfLines={1}>📍 {item.location}</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Animated.View>
              )}
            />
          </Animated.View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    marginTop: 2,
  },

  segmented: {
    flexDirection: 'row',
    marginTop: Spacing.base,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  segmentActive: { backgroundColor: '#FFFFFF' },
  segmentText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
  },
  segmentTextActive: { color: Colors.primary },

  chipScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.text,
  },
  chipTextActive: { color: '#FFFFFF' },
  chipCount: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
  },

  content: { paddingTop: 0 },

  mapSection: { paddingHorizontal: Spacing.base, gap: Spacing.base },
  mapHint: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  activeCardWrap: { marginTop: Spacing.sm },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  activeImage: { width: 60, height: 60, borderRadius: BorderRadius.md },
  activeInfo: { flex: 1, gap: 2 },
  activeName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text },
  activeCuisine: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  activeMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  activeRating: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.text,
  },

  list: { paddingHorizontal: Spacing.base },
  foodCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  foodImage: { width: 84, height: 84, borderRadius: BorderRadius.md },
  foodInfo: { flex: 1, gap: 3 },
  foodName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text },
  foodCuisine: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  foodMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  foodRating: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  foodPeak: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
