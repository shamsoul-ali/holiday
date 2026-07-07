'use client';

import { TopBar } from '../_components/TopBar';
import { Hero } from '../_components/Hero';
import { KpiCard } from '../_components/KpiCard';
import { MalaysiaMap } from '../_components/MalaysiaMap';
import { RevenueDonut } from '../_components/RevenueDonut';
import { MonthlyTrend } from '../_components/MonthlyTrend';
import { SourceMarkets } from '../_components/SourceMarkets';
import { PeakHeatmap } from '../_components/PeakHeatmap';
import { DistrictList } from '../_components/DistrictList';
import { Sustainability } from '../_components/Sustainability';
import { LiveBookingFeed } from '../_components/LiveBookingFeed';
import { AiForecast } from '../_components/AiForecast';
import { AlertsPanel } from '../_components/AlertsPanel';
import { FlightBoard } from '../_components/FlightBoard';
import { Demographics } from '../_components/Demographics';
import { SocialSentiment } from '../_components/SocialSentiment';
import { CompetitorBenchmark } from '../_components/CompetitorBenchmark';
import { SabahOccupancy } from '../_components/SabahOccupancy';
import { OperatorCompliance } from '../_components/OperatorCompliance';
import { Section } from '../_components/Section';
import { stats } from '../_data/stats';
import {
  Wallet,
  Clock,
  Leaf,
  Plane,
  Hotel,
  Globe,
} from 'lucide-react';

export default function BayuOverviewPage() {
  const revenueSpark = stats.monthlyTrend.map((m) => m.revenue);
  const visitorsSpark = stats.monthlyTrend.map((m) => m.visitors);

  return (
    <>
      <TopBar title="Tourism Intelligence Overview" />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
          {/* HERO */}
          <Hero />

          {/* KPI GRID */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <KpiCard
              label="Avg Spend"
              value={`RM ${stats.avgSpendPerVisitor.toLocaleString('en-MY')}`}
              sublabel="per visitor"
              growth={6.2}
              icon={Wallet}
              accent="ocean"
              spark={revenueSpark}
              delay={0.0}
            />
            <KpiCard
              label="Avg Stay"
              value={`${stats.avgStayDays} d`}
              sublabel="per trip"
              growth={2.1}
              icon={Clock}
              accent="sky"
              delay={0.05}
            />
            <KpiCard
              label="Sustainability"
              value={`${stats.sustainabilityScore}/100`}
              sublabel="above APAC avg"
              growth={4.8}
              icon={Leaf}
              accent="jungle"
              delay={0.1}
            />
            <KpiCard
              label="Flights"
              value={`${stats.flightsPerWeek}`}
              sublabel="per week"
              growth={stats.flightsPerWeekYoY}
              icon={Plane}
              accent="gold"
              spark={visitorsSpark}
              delay={0.15}
            />
            <KpiCard
              label="Hotel Occupancy"
              value={`${stats.hotelOccupancy}%`}
              sublabel="state-wide"
              growth={stats.hotelOccupancyYoY}
              icon={Hotel}
              accent="ocean"
              delay={0.2}
            />
            <KpiCard
              label="Source Markets"
              value={`${stats.sourceMarkets.length}`}
              sublabel="active countries"
              growth={12.5}
              icon={Globe}
              accent="sky"
              delay={0.25}
            />
          </div>

          {/* AI FORECAST */}
          <AiForecast />

          {/* ALERTS + MAP */}
          <div className="grid grid-cols-12 gap-6">
            <Section
              className="col-span-12 xl:col-span-8"
              title="Visitor Origin · Live Flight Routes"
              subtitle="Domestic heatmap + international inbound flights"
              live
              kicker={`${stats.flightPaths.reduce((a, f) => a + f.flightsPerWeek, 0)} flights/wk · ${stats.sourceMarkets.length} markets`}
            >
              <div className="relative">
                <MalaysiaMap className="rounded-xl overflow-hidden" />
              </div>
            </Section>

            <Section
              className="col-span-12 xl:col-span-4"
              title="Operational Alerts"
              subtitle="Live incidents across Sabah"
              live
            >
              <AlertsPanel />
            </Section>
          </div>

          {/* FLIGHTS + LIVE BOOKING FEED */}
          <div className="grid grid-cols-12 gap-6">
            <Section
              className="col-span-12 xl:col-span-8"
              title="BKI Arrivals Board"
              subtitle="Inbound flights · real-time ATC + MAVCOM feed"
              live
              kicker={`${stats.incomingFlights.filter((f) => f.status !== 'landed').length} incoming`}
            >
              <FlightBoard />
            </Section>

            <div className="col-span-12 xl:col-span-4">
              <LiveBookingFeed />
            </div>
          </div>

          {/* REVENUE + MONTHLY */}
          <div className="grid grid-cols-12 gap-6">
            <Section
              className="col-span-12 lg:col-span-5"
              title="Revenue by Sector"
              subtitle={`Breakdown of RM ${(stats.revenue / 1_000_000_000).toFixed(1)}B annual revenue`}
            >
              <RevenueDonut />
            </Section>

            <Section
              className="col-span-12 lg:col-span-7"
              title="Monthly Performance"
              subtitle="Visitors vs. revenue throughout 2026"
            >
              <MonthlyTrend />
            </Section>
          </div>

          {/* MARKETS */}
          <Section
            title="Top Source Markets"
            subtitle="Inbound visitors by country · sortable"
          >
            <SourceMarkets />
          </Section>

          {/* DEMOGRAPHICS */}
          <Section
            title="Visitor Demographics"
            subtitle="Age · purpose · length of stay"
            kicker="Q1 2026 survey · 42,000 respondents"
          >
            <Demographics />
          </Section>

          {/* SOCIAL SENTIMENT */}
          <Section
            title="Social Intelligence"
            subtitle="Mentions · sentiment · influencer reach"
            live
          >
            <SocialSentiment />
          </Section>

          {/* COMPETITOR BENCHMARK */}
          <Section
            title="APAC Competitor Benchmark"
            subtitle="Sabah vs. leading APAC leisure destinations"
          >
            <CompetitorBenchmark />
          </Section>

          {/* HEATMAP + DISTRICTS */}
          <div className="grid grid-cols-12 gap-6">
            <Section
              className="col-span-12 xl:col-span-8"
              title="Peak Season Intensity"
              subtitle="Demand by activity · 12-month view"
            >
              <PeakHeatmap />
            </Section>

            <Section
              className="col-span-12 xl:col-span-4"
              title="District Performance"
              subtitle="Top districts by arrivals"
            >
              <DistrictList />
            </Section>
          </div>

          {/* HOTEL OCCUPANCY */}
          <Section
            title="Accommodation Index · Sabah-wide"
            subtitle="District-level occupancy + ADR by star tier"
            kicker={`${(stats.hotels.districts.reduce((a, d) => a + d.rooms, 0) / 1000).toFixed(1)}K rooms tracked`}
          >
            <SabahOccupancy />
          </Section>

          {/* OPERATOR COMPLIANCE */}
          <Section
            title="Operator Compliance"
            subtitle="Licensed tourism operators across Sabah"
            kicker="MOTAC regulatory audit"
          >
            <OperatorCompliance />
          </Section>

          {/* SUSTAINABILITY */}
          <Section
            title="Sustainability Impact"
            subtitle="Tourism that gives back to Sabah"
            kicker="Above APAC benchmark · MOTAC-aligned"
          >
            <Sustainability />
          </Section>

          {/* FOOTER */}
          <div className="flex items-center justify-between rounded-xl border border-bayu-line bg-bayu-bg1/50 px-5 py-4 text-xs">
            <div className="text-bayu-textDim">
              Data streams from BKI &amp; Tawau airports, 78 hotel partners, 340+ tour operators.
              Updated every 30 seconds.
            </div>
            <div className="flex items-center gap-2 text-bayu-textMuted">
              <span>Sabah Tourism Board · Bayu AI</span>
              <span className="h-1 w-1 rounded-full bg-bayu-textDim" />
              <span>v2.4.1</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
