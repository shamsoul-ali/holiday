import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useAuthStore } from '@/store';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();

  const stats = [
    { label: 'Umrah', value: user?.umrahCount || 0, icon: 'moon' },
    { label: 'Kursus', value: '75%', icon: 'school' },
    { label: 'Mata', value: (user?.loyaltyPoints || 0).toLocaleString(), icon: 'star' },
  ];

  const menuSections = [
    {
      title: 'Akaun',
      items: [
        { label: 'Edit Profil', icon: 'person-outline', route: '/(tabs)/profile/edit' },
        { label: 'Tetapan', icon: 'settings-outline', route: '/(tabs)/profile/settings' },
        { label: 'Keutamaan', icon: 'options-outline', route: '/(tabs)/profile/preferences' },
      ],
    },
    {
      title: 'Lain-lain',
      items: [
        { label: 'Dashboard Pentadbir', icon: 'bar-chart-outline', route: '/(tabs)/profile/admin-dashboard' },
        { label: 'Bantuan & Sokongan', icon: 'help-circle-outline', route: '' },
        { label: 'Tentang Andalusia', icon: 'information-circle-outline', route: '' },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#059669', '#10B981']} style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'A'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        {/* Membership Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <LinearGradient colors={['#059669', '#d97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.memberCard}>
            <View style={styles.memberTop}>
              <Text style={styles.memberLabel}>ANDALUSIA</Text>
              <Ionicons name="star" size={16} color="#d97706" />
            </View>
            <Text style={styles.memberTier}>Ahli Emas</Text>
            <Text style={styles.memberName}>{user?.name}</Text>
            <Text style={styles.memberId}>ID: AND-{user?.id?.slice(-4) || '0001'}</Text>
          </LinearGradient>
        </Animated.View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <Ionicons name={stat.icon as any} size={20} color={Colors.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <Text style={styles.menuTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => item.route && router.push(item.route as any)}>
              <Ionicons name={item.icon as any} size={22} color={Colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => { logout(); router.replace('/(auth)/login'); }}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Log Keluar</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Andalusia v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingBottom: Spacing.xl, paddingHorizontal: Spacing.xl },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  avatarText: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  name: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  email: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.lg },

  memberCard: { width: '100%', borderRadius: BorderRadius.lg, padding: Spacing.base },
  memberTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: 'rgba(255,255,255,0.8)', letterSpacing: 2 },
  memberTier: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginTop: Spacing.sm },
  memberName: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  memberId: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.6)', marginTop: Spacing.sm },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.lg, marginHorizontal: Spacing.base, marginTop: -Spacing.md, backgroundColor: Colors.background, borderRadius: BorderRadius.lg, ...Shadows.md },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  statLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },

  menuSection: { marginTop: Spacing.lg, paddingHorizontal: Spacing.xl },
  menuTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.textTertiary, marginBottom: Spacing.sm, textTransform: 'uppercase' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuLabel: { flex: 1, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.text },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing['2xl'], paddingVertical: Spacing.md },
  logoutText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.error },
  version: { textAlign: 'center', fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: Spacing.md },
});
