import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useAuthStore, useAppStore, useBookingStore } from '@/store';
import { featuredDestinations, sabahDestinations, categories, featuredIslands, getUpcomingEvents } from '@/data';
import { formatCurrency } from '@/utils';
import { Badge } from '@/components/ui';
import { IslandCard, EventCard } from '@/components/ui';
import { TrendingNow } from '@/components/home/TrendingNow';
import { LiveEventCard } from '@/components/home/LiveEventCard';
import { PartnershipStrip } from '@/components/home/PartnershipStrip';
import { LiveContextBanner } from '@/components/home/LiveContextBanner';
import { JourneyTrackerBanner } from '@/components/home/JourneyTrackerBanner';
import { StoriesRow } from '@/components/home/StoriesRow';
import { CrowdLevel } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const crowdColors: Record<CrowdLevel, string> = {
  low: Colors.success,
  moderate: Colors.warning,
  high: Colors.sunset,
  'very-high': Colors.error,
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const notificationCount = useAppStore((s) => s.notificationCount);
  const bookings = useBookingStore((s) => s.bookings);

  const upcomingBooking = bookings
    .filter((b) => b.status === 'confirmed')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]
    || bookings.find((b) => b.id === 'BK001');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[...Colors.gradients.sabahSky]} style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Traveler'} 👋</Text>
            <Text style={styles.headerSubtitle}>Discover the best of Sabah</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/(tabs)/home/notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            {notificationCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.8} onPress={() => router.push('/(tabs)/explore')}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} />
          <Text style={styles.searchPlaceholder}>Search islands, mountains, wildlife...</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stories row — Today in Sabah */}
      <StoriesRow />

      {/* Live push-like context banner — rotating real-time signals */}
      <LiveContextBanner />

      {/* Trending Now — live social proof ticker */}
      <TrendingNow />

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.quickActions}>
        {[
          { icon: 'sparkles', label: 'AI Plan', color: Colors.primary, route: '/(tabs)/explore' },
          { icon: 'boat', label: 'Islands', color: Colors.sky, route: '/(tabs)/home/islands' },
          { icon: 'restaurant', label: 'Food Map', color: Colors.sunset, route: '/(tabs)/home/food' },
          { icon: 'ribbon', label: 'My Pass', color: Colors.category.cultural, route: '/(tabs)/profile/travel-pass' },
          { icon: 'shield-checkmark', label: 'Safety', color: Colors.error, route: '/(tabs)/home/safety-hub' },
        ].map((action, i) => (
          <TouchableOpacity key={i} style={styles.quickAction} onPress={() => router.push(action.route as any)}>
            <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
              <Ionicons name={action.icon as any} size={22} color={action.color} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Journey tracker — adapts to pre-trip / in-progress / completed */}
      {upcomingBooking && (
        <JourneyTrackerBanner
          booking={upcomingBooking}
          onPress={() => router.push('/(tabs)/home/journey' as any)}
        />
      )}

      {/* Featured Sabah */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Sabah</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover' as any)}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={featuredDestinations}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.base }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.featuredCard, { width: CARD_WIDTH }]}
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: '/(tabs)/home/destination/[id]', params: { id: item.id.replace('-f', '') } })}
            >
              <Image source={{ uri: item.image }} style={styles.featuredImage} contentFit="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.featuredOverlay}>
                <View style={styles.featuredTags}>
                  {item.tags.map((tag, i) => (
                    <Badge key={i} label={tag} color="rgba(255,255,255,0.25)" size="sm" />
                  ))}
                </View>
                <Text style={styles.featuredName}>{item.name}</Text>
                <Text style={styles.featuredDesc}>{item.description}</Text>
                <View style={styles.featuredPriceRow}>
                  <Text style={styles.featuredPrice}>From {formatCurrency(item.price)}</Text>
                  <View style={styles.featuredRating}>
                    <Ionicons name="star" size={14} color={Colors.sunset} />
                    <Text style={styles.featuredRatingText}>{item.rating}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* Sabah Islands */}
      <Animated.View entering={FadeInDown.delay(350).duration(500)}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sabah Islands</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home/islands' as any)}><Text style={styles.seeAll}>See All 40+</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={featuredIslands}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.base }}
          renderItem={({ item }) => (
            <IslandCard island={item} compact onPress={() => router.push('/(tabs)/home/islands' as any)} />
          )}
        />
      </Animated.View>

      {/* Partnership strip — credibility anchor */}
      <PartnershipStrip />

      {/* Upcoming Events with live countdowns */}
      <Animated.View entering={FadeInDown.delay(380).duration(500)}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Events Countdown</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover' as any)}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={getUpcomingEvents().slice(0, 5)}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.base }}
          renderItem={({ item }) => (
            <LiveEventCard event={item} onPress={() => router.push('/(tabs)/discover' as any)} />
          )}
        />
      </Animated.View>

      {/* Categories */}
      <Animated.View entering={FadeInDown.delay(400).duration(500)}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
        </View>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => router.push({ pathname: '/(tabs)/home/category/[id]', params: { id: cat.id } })}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                <Ionicons name={cat.icon as any} size={22} color={cat.color} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{cat.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Popular in Sabah */}
      <Animated.View entering={FadeInDown.delay(500).duration(500)}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular in Sabah</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover' as any)}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={sabahDestinations.filter((d) => d.isPopular)}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.base }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.destCard} onPress={() => router.push({ pathname: '/(tabs)/home/destination/[id]', params: { id: item.id } })}>
              <Image source={{ uri: item.image }} style={styles.destImage} contentFit="cover" />
              <Text style={styles.destName}>{item.name}</Text>
              <Text style={styles.destPrice}>From {formatCurrency(item.price)}/pax</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* Crowd Monitor */}
      <Animated.View entering={FadeInDown.delay(600).duration(500)}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Crowd Monitor</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover' as any)}><Text style={styles.seeAll}>Live</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={sabahDestinations.slice(0, 6)}
          keyExtractor={(item) => item.id + '-crowd'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.base }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
          renderItem={({ item }) => (
            <View style={styles.crowdCard}>
              <Image source={{ uri: item.image }} style={styles.crowdImage} contentFit="cover" />
              <View style={styles.crowdInfo}>
                <Text style={styles.crowdName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.crowdRow}>
                  <View style={[styles.crowdDot, { backgroundColor: crowdColors[item.crowdLevel] }]} />
                  <Text style={[styles.crowdLevel, { color: crowdColors[item.crowdLevel] }]}>
                    {item.crowdLevel.charAt(0).toUpperCase() + item.crowdLevel.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  headerSubtitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  notifBadge: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { color: '#fff', fontSize: 9, fontFamily: Typography.fonts.bodySemiBold },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.sm },
  searchPlaceholder: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.md },
  quickAction: { alignItems: 'center', gap: Spacing.sm },
  quickActionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, marginTop: Spacing.xl, marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.heading, color: Colors.text },
  seeAll: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary },
  featuredCard: { height: 220, borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.lg },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.base, paddingTop: Spacing['3xl'] },
  featuredTags: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm },
  featuredName: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  featuredDesc: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  featuredPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  featuredPrice: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: '#FFFFFF' },
  featuredRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredRatingText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: '#FFFFFF' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md },
  categoryItem: { width: '25%', alignItems: 'center', marginBottom: Spacing.base },
  categoryIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  categoryName: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  destCard: { width: 140 },
  destImage: { width: 140, height: 100, borderRadius: BorderRadius.md },
  destName: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, marginTop: Spacing.xs },
  destPrice: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary },
  crowdCard: { width: 130, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, overflow: 'hidden' },
  crowdImage: { width: 130, height: 70 },
  crowdInfo: { padding: Spacing.sm },
  crowdName: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  crowdRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  crowdDot: { width: 8, height: 8, borderRadius: 4 },
  crowdLevel: { fontSize: 10, fontFamily: Typography.fonts.bodyMedium },
});
