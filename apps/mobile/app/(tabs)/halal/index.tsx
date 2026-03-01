import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useHalalStore } from '@/store';
import { formatCurrency } from '@/utils';
import { Badge, Card, StarRating } from '@/components/ui';

const tabs = ['Prayer Times', 'Restaurants', 'Umrah'] as const;

export default function HalalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { prayerTimes, restaurants, umrahPackages, hijriDate, selectedCity } = useHalalStore();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Prayer Times');

  const renderPrayerTimes = () => {
    // Find next prayer (mock: assume Asr is next)
    const nextPrayer = prayerTimes[3]; // Asr
    return (
      <Animated.View entering={FadeInDown.duration(400)}>
        {/* Next Prayer Countdown */}
        <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.nextPrayerCard}>
          <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
          <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
          <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
          <Text style={styles.hijriDate}>{hijriDate}</Text>
          <Text style={styles.locationText}>{selectedCity}</Text>
        </LinearGradient>

        {/* All Prayer Times */}
        <Card style={styles.prayerCard}>
          {prayerTimes.map((prayer, i) => (
            <View key={prayer.name} style={[styles.prayerRow, i < prayerTimes.length - 1 && styles.prayerBorder]}>
              <View style={styles.prayerLeft}>
                <Ionicons name={prayer.icon as any} size={20} color={prayer.name === nextPrayer.name ? '#7C3AED' : Colors.textTertiary} />
                <Text style={[styles.prayerName, prayer.name === nextPrayer.name && styles.prayerNameActive]}>{prayer.name}</Text>
              </View>
              <Text style={[styles.prayerTime, prayer.name === nextPrayer.name && styles.prayerTimeActive]}>{prayer.time}</Text>
            </View>
          ))}
        </Card>

        {/* Qibla Direction */}
        <Card style={styles.qiblaCard}>
          <View style={styles.qiblaContent}>
            <View style={styles.qiblaCompass}>
              <Ionicons name="compass" size={48} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.qiblaTitle}>Qibla Direction</Text>
              <Text style={styles.qiblaValue}>292.5° NW from {selectedCity}</Text>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };

  const renderRestaurants = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      {restaurants.map((restaurant) => (
        <Card key={restaurant.id} style={styles.restaurantCard}>
          <View style={styles.restaurantRow}>
            <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} contentFit="cover" />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
              <View style={styles.restaurantMeta}>
                <StarRating rating={restaurant.rating} size={12} />
                <Text style={styles.restaurantRating}>{restaurant.rating}</Text>
                <Text style={styles.metaDot}>-</Text>
                <Text style={styles.restaurantDistance}>{restaurant.distance}</Text>
                <Text style={styles.metaDot}>-</Text>
                <Text style={styles.restaurantPrice}>{restaurant.priceRange}</Text>
              </View>
              <Badge label={restaurant.certification} color="#7C3AED" size="sm" style={{ marginTop: Spacing.xs }} />
            </View>
          </View>
        </Card>
      ))}
    </Animated.View>
  );

  const renderUmrah = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      {umrahPackages.map((pkg) => (
        <Card key={pkg.id} style={styles.umrahCard}>
          <Image source={{ uri: pkg.image }} style={styles.umrahImage} contentFit="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.umrahOverlay}>
            <Badge label="Umrah" color="#7C3AED" />
            <Text style={styles.umrahName}>{pkg.name}</Text>
          </LinearGradient>
          <View style={styles.umrahBody}>
            <View style={styles.umrahRow}>
              <View>
                <Text style={styles.umrahDuration}>{pkg.duration}</Text>
                <Text style={styles.umrahHotel}>{pkg.hotel}</Text>
              </View>
              <View style={styles.umrahPriceCol}>
                <Text style={styles.umrahPrice}>{formatCurrency(pkg.price)}</Text>
                <Text style={styles.umrahPer}>per person</Text>
              </View>
            </View>
            <View style={styles.umrahInclusions}>
              {pkg.inclusions.slice(0, 4).map((inc, i) => (
                <View key={i} style={styles.inclusionRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#7C3AED" />
                  <Text style={styles.inclusionText}>{inc}</Text>
                </View>
              ))}
            </View>
            <View style={styles.umrahFooter}>
              <StarRating rating={pkg.rating} size={14} />
              <Text style={styles.umrahDate}>Departs: {pkg.departureDate}</Text>
            </View>
          </View>
        </Card>
      ))}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Halal Travel</Text>
        <Text style={styles.headerSubtitle}>Muslim-friendly travel tools</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'Prayer Times' && renderPrayerTimes()}
        {activeTab === 'Restaurants' && renderRestaurants()}
        {activeTab === 'Umrah' && renderUmrah()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  headerTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  headerSubtitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  tabs: { flexDirection: 'row', marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 4, marginBottom: Spacing.md },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.md },
  tabActive: { backgroundColor: Colors.background, ...Shadows.sm },
  tabText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary },
  tabTextActive: { color: '#7C3AED' },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 40 },

  // Prayer Times
  nextPrayerCard: { borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md },
  nextPrayerLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  nextPrayerName: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginTop: Spacing.xs },
  nextPrayerTime: { fontSize: Typography.sizes['3xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  hijriDate: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.7)', marginTop: Spacing.sm },
  locationText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  prayerCard: { marginBottom: Spacing.md },
  prayerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  prayerBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  prayerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  prayerName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  prayerNameActive: { color: '#7C3AED', fontFamily: Typography.fonts.bodySemiBold },
  prayerTime: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  prayerTimeActive: { color: '#7C3AED' },
  qiblaCard: { marginBottom: Spacing.md },
  qiblaContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  qiblaCompass: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#7C3AED15', alignItems: 'center', justifyContent: 'center' },
  qiblaTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text },
  qiblaValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },

  // Restaurants
  restaurantCard: { marginBottom: Spacing.md },
  restaurantRow: { flexDirection: 'row', gap: Spacing.md },
  restaurantImage: { width: 80, height: 80, borderRadius: BorderRadius.md },
  restaurantInfo: { flex: 1 },
  restaurantName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  restaurantCuisine: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  restaurantMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  restaurantRating: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  metaDot: { fontSize: Typography.sizes.xs, color: Colors.textTertiary },
  restaurantDistance: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  restaurantPrice: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary },

  // Umrah
  umrahCard: { marginBottom: Spacing.lg, overflow: 'hidden' },
  umrahImage: { width: '100%', height: 160 },
  umrahOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 160, justifyContent: 'flex-end', padding: Spacing.md },
  umrahName: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginTop: Spacing.xs },
  umrahBody: { padding: Spacing.md },
  umrahRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  umrahDuration: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  umrahHotel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  umrahPriceCol: { alignItems: 'flex-end' },
  umrahPrice: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: '#7C3AED' },
  umrahPer: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  umrahInclusions: { marginTop: Spacing.md, gap: Spacing.xs },
  inclusionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  inclusionText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  umrahFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  umrahDate: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
});
