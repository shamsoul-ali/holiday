import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { adminStats } from '@/data';
import { formatCurrency } from '@/utils';
import { Card, ProgressBar } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Dashboard Pentadbir" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <LinearGradient colors={['#059669', '#10B981']} style={styles.heroCard}>
            <Text style={styles.heroLabel}>Jemaah Berdaftar</Text>
            <Text style={styles.heroValue}>{adminStats.totalJemaah.toLocaleString()}</Text>
            <Text style={styles.heroSub}>Andalusia Travel & Tours</Text>
          </LinearGradient>
        </Animated.View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {[
            { label: 'Tempahan Aktif', value: adminStats.activeBookings.toLocaleString(), icon: 'briefcase', color: Colors.info },
            { label: 'Hasil Bulanan', value: `RM${(adminStats.monthlyRevenue / 1000000).toFixed(1)}M`, icon: 'trending-up', color: Colors.primary },
            { label: 'Kepuasan', value: `${adminStats.satisfaction}/5`, icon: 'star', color: Colors.secondary },
          ].map((metric, i) => (
            <Animated.View key={metric.label} entering={FadeInDown.delay(200 + i * 100).duration(400)} style={styles.metricCard}>
              <Ionicons name={metric.icon as any} size={22} color={metric.color} />
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Demographics */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Demografi Jemaah</Text>

          <Text style={styles.subTitle}>Jantina</Text>
          <View style={styles.genderRow}>
            <View style={[styles.genderBar, { flex: adminStats.genderSplit.female, backgroundColor: Colors.primary }]} />
            <View style={[styles.genderBar, { flex: adminStats.genderSplit.male, backgroundColor: Colors.accent }]} />
          </View>
          <View style={styles.legendRow}>
            <Text style={styles.legendText}>Wanita {adminStats.genderSplit.female}%</Text>
            <Text style={styles.legendText}>Lelaki {adminStats.genderSplit.male}%</Text>
          </View>

          <Text style={[styles.subTitle, { marginTop: Spacing.lg }]}>Kumpulan Umur</Text>
          {adminStats.ageGroups.map((group) => (
            <View key={group.range} style={styles.barRow}>
              <Text style={styles.barLabel}>{group.range}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${group.percentage}%`, backgroundColor: Colors.primary }]} />
              </View>
              <Text style={styles.barValue}>{group.percentage}%</Text>
            </View>
          ))}

          <Text style={[styles.subTitle, { marginTop: Spacing.lg }]}>Pendapatan</Text>
          {adminStats.incomeGroups.map((group) => (
            <View key={group.group} style={styles.barRow}>
              <Text style={styles.barLabel}>{group.group}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${group.percentage}%`, backgroundColor: group.group === 'B40' ? Colors.ekonomi : group.group === 'M40' ? Colors.standard : Colors.vip }]} />
              </View>
              <Text style={styles.barValue}>{group.percentage}%</Text>
            </View>
          ))}
        </Card>

        {/* Top States */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Negeri Teratas</Text>
          {adminStats.topStates.map((state) => (
            <View key={state.name} style={styles.stateRow}>
              <Text style={styles.stateName}>{state.name}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${state.percentage}%`, backgroundColor: Colors.primary }]} />
              </View>
              <Text style={styles.barValue}>{state.count.toLocaleString()}</Text>
            </View>
          ))}
        </Card>

        {/* Package Sales */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Jualan Pakej</Text>
          {adminStats.packageSales.map((pkg) => (
            <View key={pkg.name} style={styles.packageRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.packageName}>{pkg.name}</Text>
                <Text style={styles.packagePax}>{pkg.pax.toLocaleString()} pax</Text>
              </View>
              <Text style={styles.packageRevenue}>{formatCurrency(pkg.revenue)}</Text>
            </View>
          ))}
        </Card>

        {/* Monthly Trend */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Trend Bulanan</Text>
          {adminStats.monthlyTrend.map((month) => (
            <View key={month.month} style={styles.trendRow}>
              <Text style={styles.trendMonth}>{month.month}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(month.bookings / 3800) * 100}%`, backgroundColor: Colors.primary }]} />
              </View>
              <Text style={styles.trendBookings}>{month.bookings.toLocaleString()}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base },

  heroCard: { borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  heroLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  heroValue: { fontSize: 42, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginVertical: 4 },
  heroSub: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: 'rgba(255,255,255,0.9)' },

  metricsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  metricCard: { flex: 1, backgroundColor: Colors.background, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', gap: 4, ...Shadows.sm },
  metricValue: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  metricLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary, textAlign: 'center' },

  section: { marginBottom: Spacing.base },
  sectionTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.md },
  subTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary, marginBottom: Spacing.sm },

  genderRow: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 },
  genderBar: { borderRadius: 6 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  legendText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },

  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  barLabel: { width: 50, fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: Colors.surfaceSecondary, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barValue: { width: 36, fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.text, textAlign: 'right' },

  stateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  stateName: { width: 80, fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },

  packageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  packageName: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  packagePax: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
  packageRevenue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },

  trendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  trendMonth: { width: 30, fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  trendBookings: { width: 40, fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.text, textAlign: 'right' },
});
