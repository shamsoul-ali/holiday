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
import { useAuthStore, useAppStore } from '@/store';
import { umrahPackages, umrahPlusDestinations, cabutanInfo } from '@/data';
import { formatCurrency } from '@/utils';
import { Badge } from '@/components/ui';
import { TierType } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const tierColors: Record<TierType, string> = {
  ekonomi: Colors.ekonomi,
  standard: Colors.standard,
  premium: Colors.premium,
  vip: Colors.vip,
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const notificationCount = useAppStore((s) => s.notificationCount);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#059669', '#10B981']} style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Assalamualaikum,</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Jemaah'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home/notifications')} style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {notificationCount > 0 && (
              <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{notificationCount}</Text></View>
            )}
          </TouchableOpacity>
        </View>

        {/* Departure Countdown */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.countdownCard}>
          <View style={styles.countdownLeft}>
            <Text style={styles.countdownLabel}>Perjalanan Umrah Seterusnya</Text>
            <Text style={styles.countdownDate}>10 Mei 2026 (Madinah)</Text>
          </View>
          <View style={styles.countdownRight}>
            <Text style={styles.countdownDays}>66</Text>
            <Text style={styles.countdownUnit}>Hari</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.quickActions}>
        {[
          { icon: 'moon' as const, label: 'Umrah', route: '/(tabs)/umrah' as const, color: Colors.primary },
          { icon: 'school' as const, label: 'Kursus', route: '/(tabs)/ibadah' as const, color: Colors.secondary },
          { icon: 'gift' as const, label: 'Cabutan', route: '/(tabs)/home' as const, color: '#8B5CF6' },
          { icon: 'calendar' as const, label: 'Jadual', route: '/(tabs)/bookings' as const, color: Colors.accent },
        ].map((action) => (
          <TouchableOpacity key={action.label} style={styles.quickAction} onPress={() => router.push(action.route)}>
            <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Featured Packages - 4 Tiers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pakej Umrah</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/umrah')}>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={umrahPackages}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.base }}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(400 + index * 100).duration(500)}>
              <TouchableOpacity style={[styles.packageCard, { width: CARD_WIDTH }]} onPress={() => router.push('/(tabs)/umrah')}>
                <Image source={{ uri: item.image }} style={styles.packageImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.packageGradient}>
                  <Badge label={item.tier.charAt(0).toUpperCase() + item.tier.slice(1)} color={tierColors[item.tier]} size="sm" />
                  <Text style={styles.packageTitle}>{item.title}</Text>
                  <Text style={styles.packageHotel}>{item.hotelMakkah}</Text>
                  <View style={styles.packageFooter}>
                    <Text style={styles.packagePrice}>{formatCurrency(item.price)}</Text>
                    <Text style={styles.packageDuration}>{item.duration}</Text>
                  </View>
                </LinearGradient>
                {item.isRecommended && (
                  <View style={styles.recommendedBadge}>
                    <Ionicons name="star" size={12} color="#fff" />
                    <Text style={styles.recommendedText}>Popular</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      </View>

      {/* Cabutan Banner */}
      <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.section}>
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient colors={['#d97706', '#F59E0B']} style={styles.cabutanBanner}>
            <View style={styles.cabutanLeft}>
              <Text style={styles.cabutanTitle}>Cabutan Umrah Percuma!</Text>
              <Text style={styles.cabutanDesc}>Sertai cabutan mingguan & menangi pakej Umrah Ekonomi bernilai RM6,367</Text>
              <View style={styles.cabutanStat}>
                <Ionicons name="people" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.cabutanStatText}>{cabutanInfo.totalEntries.toLocaleString()} peserta</Text>
              </View>
            </View>
            <View style={styles.cabutanRight}>
              <Ionicons name="gift" size={48} color="rgba(255,255,255,0.3)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Umrah Plus */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Umrah Plus</Text>
          <Text style={styles.sectionSubtitle}>Umrah + Pelancongan</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.md }}>
          {umrahPlusDestinations.map((dest) => (
            <TouchableOpacity key={dest.id} style={styles.plusCard}>
              <Image source={{ uri: dest.image }} style={styles.plusImage} />
              <View style={styles.plusInfo}>
                <Text style={styles.plusName}>{dest.name}</Text>
                <Text style={styles.plusCountry}>{dest.country}</Text>
                <Text style={styles.plusCost}>+{formatCurrency(dest.additionalCost)} / +{dest.additionalDays} hari</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Partnership Logos */}
      <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.partners}>
        <Text style={styles.partnersTitle}>Rakan Strategik Kami</Text>
        <View style={styles.partnerLogos}>
          {['Malaysia Airlines', 'Hilton', 'Pullman'].map((partner) => (
            <View key={partner} style={styles.partnerBadge}>
              <Text style={styles.partnerText}>{partner}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['2xl'] },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  notifBadge: { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { color: '#fff', fontSize: 10, fontFamily: Typography.fonts.bodySemiBold },

  countdownCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.lg, padding: Spacing.base, alignItems: 'center' },
  countdownLeft: { flex: 1 },
  countdownLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  countdownDate: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: '#FFFFFF', marginTop: 2 },
  countdownRight: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  countdownDays: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  countdownUnit: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },

  quickActions: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.base, marginTop: -Spacing.md, backgroundColor: Colors.background, marginHorizontal: Spacing.base, borderRadius: BorderRadius.lg, ...Shadows.md },
  quickAction: { alignItems: 'center', gap: Spacing.xs },
  quickActionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },

  section: { marginTop: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  sectionSubtitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  seeAll: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },

  packageCard: { marginRight: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden', height: 220, ...Shadows.md },
  packageImage: { width: '100%', height: '100%' },
  packageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.md, gap: 4 },
  packageTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  packageHotel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  packageFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  packagePrice: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: Colors.secondaryLight },
  packageDuration: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  recommendedBadge: { position: 'absolute', top: Spacing.md, right: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.secondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  recommendedText: { fontSize: 11, fontFamily: Typography.fonts.bodySemiBold, color: '#fff' },

  cabutanBanner: { marginHorizontal: Spacing.base, borderRadius: BorderRadius.lg, padding: Spacing.lg, flexDirection: 'row', overflow: 'hidden' },
  cabutanLeft: { flex: 1 },
  cabutanRight: { justifyContent: 'center' },
  cabutanTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginBottom: 4 },
  cabutanDesc: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.85)', lineHeight: 20, marginBottom: Spacing.sm },
  cabutanStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cabutanStatText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: 'rgba(255,255,255,0.9)' },

  plusCard: { width: 160, borderRadius: BorderRadius.lg, overflow: 'hidden', backgroundColor: Colors.background, ...Shadows.sm },
  plusImage: { width: 160, height: 100 },
  plusInfo: { padding: Spacing.sm },
  plusName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text },
  plusCountry: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  plusCost: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary, marginTop: 4 },

  partners: { marginTop: Spacing.xl, paddingHorizontal: Spacing.xl, alignItems: 'center' },
  partnersTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary, marginBottom: Spacing.md },
  partnerLogos: { flexDirection: 'row', gap: Spacing.md },
  partnerBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  partnerText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
});
