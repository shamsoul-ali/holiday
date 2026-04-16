import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { governmentStats } from '@/data';
import { Card } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { MalaysiaMap } from '@/components/gov/MalaysiaMap';
import {
  LiveCounter,
  LiveDot,
  Sparkline,
  DonutChart,
  SustainabilityGauge,
  HeatmapGrid,
  LiveBookingFeed,
  SourceMarketRow,
  MonthlyTrendChart,
} from '@/components/gov/widgets';

export default function GovernmentDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const stats = governmentStats;

  const visitorsSparkline = stats.monthlyTrend.map((m) => m.visitors);
  const revenueSparkline = stats.monthlyTrend.map((m) => m.revenue);

  const maxMarket = Math.max(...stats.sourceMarkets.map((m) => m.visitors));

  const maxDistrictVisitors = Math.max(...stats.topDistricts.map((d) => d.visitors));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Tourism Command Center" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* === HERO: Live visitor counter + YoY === */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <LinearGradient colors={Colors.gradients.memberCard} style={styles.hero}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroEyebrow}>SABAH TOURISM · 2026</Text>
                <Text style={styles.heroTitle}>Visitor Intelligence</Text>
              </View>
              <LiveDot />
            </View>

            <View style={styles.heroStatsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroLabel}>Visitors today</Text>
                <LiveCounter
                  value={stats.liveVisitorsToday}
                  ratePerSec={stats.liveVisitorsRate}
                  style={styles.heroLiveValue}
                />
                <Text style={styles.heroRate}>+{stats.liveVisitorsRate.toFixed(1)}/min live arrivals</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={{ flex: 1 }}>
                <Text style={styles.heroLabel}>YTD total</Text>
                <Text style={styles.heroYtdValue}>{(stats.totalVisitors / 1_000_000).toFixed(2)}M</Text>
                <View style={styles.yoyBadge}>
                  <Ionicons name="trending-up" size={10} color="#34D399" />
                  <Text style={styles.yoyText}>+{stats.totalVisitorsYoY}% YoY</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* === KPI grid === */}
        <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.kpiGrid}>
          <KpiTile
            label="Revenue"
            value={`RM ${(stats.revenue / 1_000_000_000).toFixed(1)}B`}
            growth={stats.revenueYoY}
            icon="cash"
            color={Colors.accent}
            spark={revenueSparkline}
          />
          <KpiTile
            label="Avg Spend"
            value={`RM ${stats.avgSpendPerVisitor.toLocaleString('en-MY')}`}
            growth={6.2}
            icon="wallet"
            color={Colors.secondary}
          />
          <KpiTile
            label="Avg Stay"
            value={`${stats.avgStayDays} days`}
            growth={2.1}
            icon="bed"
            color={Colors.primary}
          />
          <KpiTile
            label="Sustainability"
            value={`${stats.sustainabilityScore}/100`}
            growth={4.8}
            icon="leaf"
            color={Colors.secondary}
          />
        </Animated.View>

        {/* === MALAYSIA MAP === */}
        <SectionHeader title="Visitor Origin Map" subtitle="Live flight routes · heatmap by state" live />
        <Animated.View entering={FadeInDown.delay(220).duration(500)} style={styles.mapCard}>
          <MalaysiaMap />
        </Animated.View>

        <View style={styles.mapStatsRow}>
          <MapStat label="Inbound flights/wk" value={stats.flightPaths.reduce((a, f) => a + f.flightsPerWeek, 0).toString()} />
          <MapStat label="Source markets" value={stats.sourceMarkets.length.toString()} />
          <MapStat label="Top origin" value="🇲🇾 KL" />
        </View>

        {/* === TOP SOURCE MARKETS === */}
        <SectionHeader title="Top Source Markets" subtitle="Visitors · growth · avg spend" />
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Card>
            {stats.sourceMarkets.slice(0, 9).map((m, i) => (
              <View key={m.id} style={i > 0 ? styles.marketDivider : undefined}>
                <SourceMarketRow
                  flag={m.flag}
                  country={m.country}
                  visitors={m.visitors}
                  growth={m.growth}
                  avgSpend={m.avgSpend}
                  max={maxMarket}
                />
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* === REVENUE BY SECTOR === */}
        <SectionHeader title="Revenue by Sector" subtitle="Where tourism RM flows" />
        <Animated.View entering={FadeInDown.delay(360).duration(500)}>
          <Card>
            <View style={styles.donutRow}>
              <DonutChart
                size={140}
                thickness={20}
                segments={stats.revenueBySector.map((s) => ({ value: s.amount, color: s.color, label: s.sector }))}
                centerValue={`RM ${(stats.revenue / 1_000_000_000).toFixed(1)}B`}
                centerLabel="Total"
              />
              <View style={{ flex: 1, gap: Spacing.sm }}>
                {stats.revenueBySector.map((s) => (
                  <View key={s.sector} style={styles.sectorRow}>
                    <View style={[styles.sectorDot, { backgroundColor: s.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectorLabel}>{s.sector}</Text>
                      <Text style={styles.sectorValue}>RM {(s.amount / 1_000_000_000).toFixed(2)}B · {s.percentage}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* === MONTHLY TREND === */}
        <SectionHeader title="Monthly Trend" subtitle="Visitors vs. revenue" />
        <Animated.View entering={FadeInDown.delay(420).duration(500)}>
          <Card>
            <MonthlyTrendChart data={stats.monthlyTrend} />
          </Card>
        </Animated.View>

        {/* === PEAK SEASON HEATMAP === */}
        <SectionHeader title="Peak Season Intensity" subtitle="Demand by activity × month" />
        <Animated.View entering={FadeInDown.delay(480).duration(500)}>
          <Card>
            <HeatmapGrid
              data={stats.peakSeasonGrid}
              categories={['Diving', 'Mountain', 'Cultural', 'Wildlife', 'Beach']}
            />
            <View style={styles.heatLegend}>
              <Text style={styles.heatLegendText}>Low</Text>
              <LinearGradient
                colors={['#E8F1F8', '#F7B731', '#F5362F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.heatLegendBar}
              />
              <Text style={styles.heatLegendText}>Peak</Text>
            </View>
          </Card>
        </Animated.View>

        {/* === DISTRICT BREAKDOWN === */}
        <SectionHeader title="District Performance" subtitle="Visitors · YoY growth" />
        <Animated.View entering={FadeInDown.delay(540).duration(500)}>
          <Card>
            {stats.topDistricts.map((d, i) => (
              <View
                key={d.name}
                style={[
                  styles.districtRow,
                  i < stats.topDistricts.length - 1 && styles.districtBorder,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.districtHeaderRow}>
                    <Text style={styles.districtName}>{d.name}</Text>
                    <View style={styles.districtGrowthPill}>
                      <Ionicons name="trending-up" size={10} color={Colors.secondary} />
                      <Text style={styles.districtGrowthText}>+{d.growth.toFixed(1)}%</Text>
                    </View>
                  </View>
                  <Text style={styles.districtVisitors}>
                    {(d.visitors / 1000).toFixed(0)}K visitors · {d.percentage}% share
                  </Text>
                  <View style={styles.districtBarBg}>
                    <View
                      style={[
                        styles.districtBarFill,
                        { width: `${(d.visitors / maxDistrictVisitors) * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* === SUSTAINABILITY IMPACT === */}
        <SectionHeader title="Sustainability Impact" subtitle="Tourism that gives back" />
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <Card>
            <View style={styles.sustainRow}>
              <SustainabilityGauge score={stats.sustainabilityScore} size={130} />
              <View style={{ flex: 1, gap: Spacing.sm, marginLeft: Spacing.md }}>
                <SustainTile icon="leaf" color={Colors.secondary} label="CO₂ offset" value={`${(stats.sustainability.carbonOffsetTonnes / 1000).toFixed(1)}K t`} />
                <SustainTile icon="water" color={Colors.reef} label="Reef protected" value={`${stats.sustainability.reefProtectedHectares} ha`} />
                <SustainTile icon="people" color={Colors.primary} label="Jobs created" value={`${(stats.sustainability.localJobsCreated / 1000).toFixed(1)}K`} />
              </View>
            </View>
            <View style={styles.sustainFooter}>
              <SustainFooterTile label="Eco-certified operators" value={`${stats.sustainability.ecoCertifiedOperators}%`} />
              <SustainFooterTile label="Waste reduction" value={`${stats.sustainability.wasteReduction}%`} />
              <SustainFooterTile label="Plastic-free islands" value={`${stats.sustainability.plasticFreeIslands}`} />
            </View>
          </Card>
        </Animated.View>

        {/* === LIVE BOOKING FEED === */}
        <SectionHeader title="Live Booking Feed" subtitle="Real-time bookings across Sabah" live />
        <Animated.View entering={FadeInDown.delay(660).duration(500)}>
          <LiveBookingFeed bookings={stats.liveBookings} />
        </Animated.View>

        {/* === EXPORT === */}
        <Animated.View entering={FadeInDown.delay(720).duration(500)}>
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={() => Alert.alert('Export Report', 'Full dashboard exported to PDF · sent to official@sabahtourism.my (mock)')}
          >
            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            <Text style={styles.exportText}>Export Executive Report (PDF)</Text>
          </TouchableOpacity>
          <Text style={styles.footnote}>
            Data refreshed · {new Date().toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// === Sub-components ========================================================

function SectionHeader({ title, subtitle, live }: { title: string; subtitle?: string; live?: boolean }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {live && <LiveDot />}
        </View>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

function KpiTile({ label, value, growth, icon, color, spark }: { label: string; value: string; growth: number; icon: string; color: string; spark?: number[] }) {
  return (
    <View style={styles.kpiTile}>
      <View style={styles.kpiHeader}>
        <View style={[styles.kpiIcon, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon as any} size={14} color={color} />
        </View>
        <Text style={styles.kpiLabel}>{label}</Text>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <View style={styles.kpiFooter}>
        <Text style={[styles.kpiGrowth, { color: growth >= 0 ? Colors.secondary : Colors.error }]}>
          {growth >= 0 ? '▲' : '▼'} {Math.abs(growth).toFixed(1)}%
        </Text>
        {spark && <Sparkline data={spark} color={color} width={60} height={20} />}
      </View>
    </View>
  );
}

function MapStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.mapStat}>
      <Text style={styles.mapStatValue}>{value}</Text>
      <Text style={styles.mapStatLabel}>{label}</Text>
    </View>
  );
}

function SustainTile({ icon, color, label, value }: { icon: string; color: string; label: string; value: string }) {
  return (
    <View style={styles.sustainTile}>
      <View style={[styles.sustainIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sustainTileValue}>{value}</Text>
        <Text style={styles.sustainTileLabel}>{label}</Text>
      </View>
    </View>
  );
}

function SustainFooterTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.sustainFooterTile}>
      <Text style={styles.sustainFooterValue}>{value}</Text>
      <Text style={styles.sustainFooterLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 120 },

  // HERO
  hero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroEyebrow: { fontSize: 10, fontFamily: Typography.fonts.bodySemiBold, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.2 },
  heroTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginTop: 2 },
  heroStatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg },
  heroDivider: { width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: Spacing.md },
  heroLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  heroLiveValue: { fontSize: 30, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  heroYtdValue: { fontSize: 30, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  heroRate: { fontSize: 10, fontFamily: Typography.fonts.bodyMedium, color: '#34D399', marginTop: 2 },
  yoyBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4, backgroundColor: 'rgba(52, 211, 153, 0.18)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  yoyText: { fontSize: 10, fontFamily: Typography.fonts.bodySemiBold, color: '#34D399' },

  // KPI
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  kpiTile: { flexBasis: '48%', flexGrow: 1, backgroundColor: '#FFFFFF', borderRadius: BorderRadius.md, padding: Spacing.md, ...Shadows.sm },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  kpiIcon: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  kpiLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  kpiValue: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  kpiFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  kpiGrowth: { fontSize: 10, fontFamily: Typography.fonts.bodySemiBold },

  // SECTION
  sectionHeader: { marginTop: Spacing.xl, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  sectionSubtitle: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },

  // MAP
  mapCard: { ...Shadows.md, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  mapStatsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  mapStat: { flex: 1, backgroundColor: Colors.surface, padding: Spacing.sm, borderRadius: BorderRadius.md, alignItems: 'center' },
  mapStatValue: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  mapStatLabel: { fontSize: 10, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary, marginTop: 2 },

  // MARKETS
  marketDivider: { borderTopWidth: 1, borderTopColor: Colors.borderLight },

  // DONUT
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  sectorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectorDot: { width: 10, height: 10, borderRadius: 5 },
  sectorLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  sectorValue: { fontSize: 10, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 1 },

  // HEATMAP
  heatLegend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.md, justifyContent: 'center' },
  heatLegendText: { fontSize: 10, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  heatLegendBar: { flex: 1, height: 6, borderRadius: 3, maxWidth: 140 },

  // DISTRICTS
  districtRow: { paddingVertical: Spacing.sm },
  districtBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  districtHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  districtName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  districtGrowthPill: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.secondary + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  districtGrowthText: { fontSize: 10, fontFamily: Typography.fonts.bodySemiBold, color: Colors.secondary },
  districtVisitors: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2, marginBottom: 6 },
  districtBarBg: { height: 6, borderRadius: 3, backgroundColor: Colors.surfaceSecondary, overflow: 'hidden' },
  districtBarFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.primary },

  // SUSTAINABILITY
  sustainRow: { flexDirection: 'row', alignItems: 'center' },
  sustainTile: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sustainIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sustainTileValue: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  sustainTileLabel: { fontSize: 10, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  sustainFooter: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  sustainFooterTile: { flex: 1, alignItems: 'center' },
  sustainFooterValue: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  sustainFooterLabel: { fontSize: 9, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },

  // EXPORT
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  exportText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: '#FFFFFF' },
  footnote: { fontSize: 10, fontFamily: Typography.fonts.body, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm },
});
