import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { governmentStats } from '@/data';
import { Card } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

export default function GovernmentDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const stats = governmentStats;

  const maxDistrictVisitors = Math.max(...stats.topDistricts.map((d) => d.visitors));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Tourism Dashboard" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Visitors */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <LinearGradient colors={[...Colors.gradients.sabahSky]} style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total Visitors (2025)</Text>
            <Text style={styles.heroValue}>{(stats.totalVisitors / 1000000).toFixed(1)}M</Text>
            <Text style={styles.heroSub}>+12.5% from previous year</Text>
          </LinearGradient>
        </Animated.View>

        {/* Key Metrics */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <Ionicons name="leaf" size={24} color={Colors.secondary} />
            <Text style={styles.metricValue}>{stats.sustainabilityScore}%</Text>
            <Text style={styles.metricLabel}>Sustainability</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Ionicons name="cash" size={24} color={Colors.accent} />
            <Text style={styles.metricValue}>RM {(stats.revenue / 1000000000).toFixed(1)}B</Text>
            <Text style={styles.metricLabel}>Revenue</Text>
          </Card>
        </Animated.View>

        {/* Monthly Trend */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>Monthly Trend</Text>
          <Card>
            <View style={styles.chartContainer}>
              {stats.monthlyTrend.map((item, i) => {
                const maxVisitors = Math.max(...stats.monthlyTrend.map((m) => m.visitors));
                const height = (item.visitors / maxVisitors) * 100;
                return (
                  <View key={item.month} style={styles.barCol}>
                    <View style={styles.barWrapper}>
                      <View style={[styles.bar, { height: `${height}%`, backgroundColor: Colors.primary }]} />
                    </View>
                    <Text style={styles.barLabel}>{item.month.slice(0, 1)}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </Animated.View>

        {/* District Breakdown */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>District Breakdown</Text>
          <Card>
            {stats.topDistricts.map((district, i) => (
              <View key={district.name} style={[styles.districtRow, i < stats.topDistricts.length - 1 && styles.districtBorder]}>
                <View style={styles.districtInfo}>
                  <Text style={styles.districtName}>{district.name}</Text>
                  <Text style={styles.districtVisitors}>{(district.visitors / 1000).toFixed(0)}K visitors ({district.percentage}%)</Text>
                </View>
                <View style={styles.districtBarBg}>
                  <View style={[styles.districtBarFill, { width: `${(district.visitors / maxDistrictVisitors) * 100}%` }]} />
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* Export Button */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={() => Alert.alert('Export Report', 'Report exported to PDF successfully (mock)')}
          >
            <Ionicons name="download-outline" size={20} color={Colors.primary} />
            <Text style={styles.exportText}>Export Report (PDF)</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 100 },
  heroCard: { borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  heroLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  heroValue: { fontSize: 48, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginTop: Spacing.xs },
  heroSub: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: 'rgba(255,255,255,0.9)', marginTop: Spacing.xs },
  metricsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  metricCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg },
  metricValue: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.text, marginTop: Spacing.sm },
  metricLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.md },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', height: 120, alignItems: 'flex-end', paddingTop: Spacing.sm },
  barCol: { flex: 1, alignItems: 'center' },
  barWrapper: { flex: 1, width: '60%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 3, minHeight: 4 },
  barLabel: { fontSize: 9, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 4 },
  districtRow: { paddingVertical: Spacing.md },
  districtBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  districtInfo: { marginBottom: Spacing.xs },
  districtName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  districtVisitors: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  districtBarBg: { height: 8, borderRadius: 4, backgroundColor: Colors.surfaceSecondary },
  districtBarFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.primary },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, marginTop: Spacing.lg, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.lg },
  exportText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
});
