import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useAuthStore } from '@/store';
import { Card } from '@/components/ui';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const stats = [
    { label: 'Trips', value: user?.tripsCount || 0, icon: 'airplane', color: Colors.primary },
    { label: 'Countries', value: user?.countriesVisited || 0, icon: 'globe', color: Colors.accent },
    { label: 'Points', value: user?.loyaltyPoints?.toLocaleString() || '0', icon: 'diamond', color: Colors.secondary },
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
      title: 'General',
      items: [
        { icon: 'settings-outline', label: 'Settings', route: '/(tabs)/profile/settings' },
        { icon: 'help-circle-outline', label: 'Help & Support', route: null },
        { icon: 'document-text-outline', label: 'Terms & Privacy', route: null },
        { icon: 'star-outline', label: 'Rate the App', route: null },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <LinearGradient colors={['#059669', '#10B981']} style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'A'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Traveler'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsRow}>
        {stats.map((stat, i) => (
          <Card key={i} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Card>
        ))}
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

      <Text style={styles.version}>Holiday AI v1.0.0</Text>
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
