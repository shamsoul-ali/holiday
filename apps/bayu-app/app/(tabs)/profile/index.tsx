import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useAuthStore, useGamificationStore } from '@/store';
import { mockWallet } from '@/data';
import { Card } from '@/components/ui';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { stats } = useGamificationStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const profileStats = [
    { label: 'Trips', value: user?.tripsCount || 0, icon: 'airplane', color: Colors.primary },
    { label: 'Districts', value: stats.districtsVisited, icon: 'map', color: Colors.accent },
    { label: 'Badges', value: stats.badgesEarned, icon: 'ribbon', color: Colors.category.cultural },
  ];

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', route: '/(tabs)/profile/edit' },
        { icon: 'heart-outline', label: 'Travel Preferences', route: '/(tabs)/profile/preferences' },
        { icon: 'notifications-outline', label: 'Notifications', route: '/(tabs)/home/notifications' },
      ],
    },
    {
      title: 'Sabah',
      items: [
        { icon: 'ribbon-outline', label: 'Travel Pass', route: '/(tabs)/profile/travel-pass' as any },
        { icon: 'bar-chart-outline', label: 'Tourism Dashboard (B2B)', route: '/(tabs)/profile/government' },
      ],
    },
    {
      title: 'General',
      items: [
        { icon: 'settings-outline', label: 'Settings', route: '/(tabs)/profile/settings' },
        { icon: 'help-circle-outline', label: 'Help & Support', route: '/(tabs)/profile/help' },
        { icon: 'document-text-outline', label: 'Terms & Privacy', route: '/(tabs)/profile/terms' },
        { icon: 'star-outline', label: 'Rate the App', route: '/(tabs)/profile/rate' },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <LinearGradient colors={[...Colors.gradients.sabahSky]} style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'A'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Traveler'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsRow}>
        {profileStats.map((stat, i) => {
          const tappable = stat.label === 'Districts' || stat.label === 'Badges';
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={tappable ? 0.8 : 1}
              onPress={() => tappable && router.push('/(tabs)/profile/travel-pass' as any)}
              style={{ flex: 1 }}
            >
              <Card style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Membership Card */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => router.push('/(tabs)/profile/travel-pass' as any)}
        style={styles.memberCardWrapper}
      >
        <LinearGradient
          colors={[...Colors.gradients.memberCard]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.memberCard}
        >
          {/* Card pattern overlay */}
          <View style={styles.cardPattern} />

          {/* Top row: Logo + Level badge */}
          <View style={styles.cardTopRow}>
            <View style={styles.cardLogoRow}>
              <View style={styles.cardLogo}>
                <Ionicons name="earth" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.cardBrand}>Bayu</Text>
            </View>
            <View style={styles.levelBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#FFD700" />
              <Text style={styles.levelText}>Level {stats.level}</Text>
            </View>
          </View>

          {/* Member name */}
          <Text style={styles.cardName}>{user?.name || 'Member'}</Text>

          {/* Member ID */}
          <View style={styles.cardIdRow}>
            <Text style={styles.cardIdLabel}>MEMBER ID</Text>
            <Text style={styles.cardIdValue}>BY-{user?.id?.replace('usr_', '').toUpperCase() || '001'}-MY</Text>
          </View>

          {/* Bottom row: Credit + Points */}
          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardFieldLabel}>CREDIT BALANCE</Text>
              <Text style={styles.cardCreditValue}>RM {mockWallet.balance.toFixed(2)}</Text>
            </View>
            <View style={styles.cardDivider} />
            <View>
              <Text style={styles.cardFieldLabel}>REWARD POINTS</Text>
              <Text style={styles.cardPointsValue}>{mockWallet.loyaltyPoints.toLocaleString()}</Text>
            </View>
            <View style={styles.cardDivider} />
            <View>
              <Text style={styles.cardFieldLabel}>VALID THRU</Text>
              <Text style={styles.cardPointsValue}>12/27</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.cardProgressRow}>
            <View style={styles.cardProgressBg}>
              <View style={[styles.cardProgressFill, { width: `${(stats.points / stats.nextLevelPoints) * 100}%` }]} />
            </View>
            <Text style={styles.cardProgressText}>{stats.points.toLocaleString()}/{stats.nextLevelPoints.toLocaleString()} pts to Level {stats.level + 1}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Language Switcher — ASEAN readiness */}
      <View style={{ paddingHorizontal: Spacing.base, marginBottom: Spacing.md }}>
        <LanguageSwitcher />
      </View>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Card variant="outlined" padding={0}>
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, i < section.items.length - 1 && styles.menuBorder]}
                onPress={() => item.route && router.push(item.route as any)}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.textSecondary} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Bayu v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingBottom: Spacing['2xl'], borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avatarText: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  userName: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  userEmail: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statsRow: { flexDirection: 'row', marginHorizontal: Spacing.base, marginTop: -Spacing.xl, gap: Spacing.sm },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  statValue: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  statLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  memberCardWrapper: { paddingHorizontal: Spacing.base, marginTop: Spacing.lg },
  memberCard: { borderRadius: 16, padding: Spacing.lg, overflow: 'hidden', ...Shadows.lg },
  cardPattern: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  cardLogoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  cardLogo: { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  cardBrand: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', letterSpacing: 1 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  levelText: { fontSize: 11, fontFamily: Typography.fonts.bodySemiBold, color: '#FFD700' },
  cardName: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', letterSpacing: 0.5 },
  cardIdRow: { marginTop: Spacing.xs, marginBottom: Spacing.lg },
  cardIdLabel: { fontSize: 9, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5 },
  cardIdValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: 'rgba(255,255,255,0.9)', letterSpacing: 2, marginTop: 1 },
  cardBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardFieldLabel: { fontSize: 8, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2 },
  cardCreditValue: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginTop: 1 },
  cardPointsValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: '#FFFFFF', marginTop: 1 },
  cardDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },
  cardProgressRow: { marginTop: Spacing.md },
  cardProgressBg: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  cardProgressFill: { height: '100%', borderRadius: 2, backgroundColor: '#FFD700' },
  cardProgressText: { fontSize: 10, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.6)', marginTop: 4, textAlign: 'right' },
  section: { marginTop: Spacing.xl, paddingHorizontal: Spacing.base },
  sectionTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.textTertiary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.base },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing['2xl'], paddingVertical: Spacing.md },
  logoutText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.error },
  version: { textAlign: 'center', fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: Spacing.lg },
});
