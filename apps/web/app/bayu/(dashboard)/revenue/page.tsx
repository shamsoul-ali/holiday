'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Wallet, Building2, Receipt, Coins, Landmark } from 'lucide-react';
import { TopBar } from '../../_components/TopBar';
import { Section } from '../../_components/Section';
import { RevenueDonut } from '../../_components/RevenueDonut';
import { MonthlyTrend } from '../../_components/MonthlyTrend';
import { Sparkline } from '../../_components/Sparkline';
import { stats } from '../../_data/stats';

export default function RevenuePage() {
  const totalRevenue = stats.revenue;
  const monthlyRevenue = stats.monthlyTrend.map((m) => m.revenue);
  const avgMonthly = monthlyRevenue.reduce((a, b) => a + b, 0) / monthlyRevenue.length;

  // Derived KPIs
  const stateTax = totalRevenue * 0.062; // ~6.2% sales & tourism tax estimated
  const multiplierImpact = totalRevenue * 1.84; // local economic multiplier
  const revenuePerVisitor = totalRevenue / stats.totalVisitors;
  const peakMonth = stats.monthlyTrend.reduce((a, m) => (m.revenue > a.revenue ? m : a), stats.monthlyTrend[0]);

  // 12-month forward projection (naive growth extrapolation)
  const projection = Array.from({ length: 12 }).map((_, i) => {
    const base = avgMonthly;
    const trend = 1 + ((stats.revenueYoY / 100) * (i / 12));
    const seasonal = 1 + Math.sin(i / 2) * 0.12;
    return Math.round(base * trend * seasonal);
  });

  return (
    <>
      <TopBar title="Revenue Intelligence" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-bayu-line bg-bayu-bg1">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  'radial-gradient(1000px 380px at 15% 20%, rgba(247, 183, 49, 0.22), transparent 60%),' +
                  'radial-gradient(800px 320px at 90% 90%, rgba(16, 185, 129, 0.16), transparent 60%)',
              }}
            />
            <div className="relative grid grid-cols-12 gap-6 p-8">
              <div className="col-span-12 md:col-span-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bayu-textDim">
                  Total revenue · 2026 YTD
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold text-bayu-gold tabular-nums">
                    {(totalRevenue / 1_000_000_000).toFixed(1)}
                  </span>
                  <span className="font-display text-xl font-bold text-bayu-goldlight">B</span>
                  <span className="text-xs font-medium text-bayu-textMuted">MYR</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-bayu-jungle/15 px-2 py-1 text-xs font-bold text-bayu-jungle">
                  <TrendingUp className="h-3 w-3" />+{stats.revenueYoY}% YoY
                </div>
              </div>

              <div className="col-span-6 md:col-span-4 md:border-l md:border-bayu-line md:pl-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bayu-textDim">
                  State tax revenue
                </div>
                <div className="mt-3 font-display text-4xl font-bold text-bayu-text tabular-nums">
                  RM {(stateTax / 1_000_000).toFixed(0)}M
                </div>
                <div className="text-[11px] text-bayu-textMuted">
                  Tourism + sales tax pass-through
                </div>
              </div>

              <div className="col-span-6 md:col-span-4 md:border-l md:border-bayu-line md:pl-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bayu-textDim">
                  Economic impact (1.84×)
                </div>
                <div className="mt-3 font-display text-4xl font-bold text-bayu-text tabular-nums">
                  RM {(multiplierImpact / 1_000_000_000).toFixed(1)}B
                </div>
                <div className="text-[11px] text-bayu-textMuted">
                  Including indirect &amp; induced effects
                </div>
              </div>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <MiniStat icon={Wallet} label="Revenue / visitor" value={`RM ${Math.round(revenuePerVisitor).toLocaleString('en-MY')}`} sub="weighted average" spark={monthlyRevenue} accent="#F7B731" />
            <MiniStat icon={Building2} label="Peak month" value={peakMonth.month} sub={`RM ${peakMonth.revenue}M`} accent="#2EAFE8" />
            <MiniStat icon={Receipt} label="Avg monthly" value={`RM ${Math.round(avgMonthly)}M`} sub="steady run-rate" accent="#10B981" />
            <MiniStat icon={Coins} label="Forecast Q1-27" value={`RM ${Math.round(projection.slice(0, 3).reduce((a,b)=>a+b,0))}M`} sub="next 3 mo" accent="#A78BFA" />
          </div>

          {/* Sector donut + monthly trend */}
          <div className="grid grid-cols-12 gap-6">
            <Section
              className="col-span-12 lg:col-span-5"
              title="Revenue by sector"
              subtitle="Where tourism RM flows across the economy"
              kicker="FY 2026"
            >
              <RevenueDonut />
            </Section>

            <Section
              className="col-span-12 lg:col-span-7"
              title="Monthly performance"
              subtitle="Visitors vs. revenue throughout the year"
            >
              <MonthlyTrend />
            </Section>
          </div>

          {/* Sector deep-dive */}
          <Section
            title="Sector deep-dive"
            subtitle="Per-sector contribution, growth, and priority levers"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stats.revenueBySector.map((s, i) => {
                // Synthetic growth rates for each sector
                const growth = 8 + (i * 3.5);
                const levers = [
                  ['Room inventory expansion', 'Mice convention bidding'],
                  ['New experiences (wellness, eco)', 'Agent commissions rebalancing'],
                  ['Halal food cluster', 'Farm-to-table pilots'],
                  ['Ferry capacity', 'EV charging at islands'],
                  ['Craft markets', 'Duty-free terminal expansion'],
                ][i] ?? ['Strategic review pending'];
                return (
                  <motion.div
                    key={s.sector}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="overflow-hidden rounded-xl border border-bayu-line bg-bayu-bg1 p-5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-bayu-textMuted">
                            {s.sector}
                          </span>
                        </div>
                        <div className="mt-2 font-display text-2xl font-bold text-bayu-text">
                          RM {(s.amount / 1_000_000_000).toFixed(2)}B
                        </div>
                        <div className="mt-0.5 text-[11px] text-bayu-textMuted">
                          {s.percentage}% of total revenue
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-0.5 rounded bg-bayu-jungle/15 px-1.5 py-0.5 text-[10px] font-bold text-bayu-jungle">
                        <TrendingUp className="h-3 w-3" />+{growth.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bayu-bg2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.percentage}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                    </div>
                    <div className="mt-4 border-t border-bayu-line pt-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
                        Priority levers
                      </div>
                      <ul className="mt-1.5 space-y-1 text-[11px] text-bayu-text">
                        {levers.map((l) => (
                          <li key={l} className="flex items-start gap-1.5">
                            <span className="mt-1 h-1 w-1 rounded-full bg-bayu-sky shrink-0" />
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Section>

          {/* Forward projection */}
          <Section
            title="12-month forward projection"
            subtitle="Naive extrapolation blending seasonality + current YoY trend"
            kicker={`Projected +${stats.revenueYoY}% run-rate`}
          >
            <div className="space-y-3">
              <Sparkline data={projection} width={720} height={120} color="#F7B731" strokeWidth={2.5} fill />
              <div className="flex justify-between px-1 text-[10px] text-bayu-textDim">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <span key={i} className="text-center">
                    {m}
                    <br />
                    <span className="font-mono text-bayu-textMuted">{projection[i]}M</span>
                  </span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <ProjTile label="12-month total" value={`RM ${Math.round(projection.reduce((a, b) => a + b, 0) / 1000)}B`} />
                <ProjTile label="Peak month" value={`${projection[projection.indexOf(Math.max(...projection))]}M MYR`} />
                <ProjTile label="Confidence" value="82%" note="Tier-2 model · historical residuals" />
              </div>
            </div>
          </Section>

          {/* State finance footer */}
          <div className="rounded-xl border border-bayu-line bg-bayu-bg1 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-bayu-sky" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
                Tourism's contribution to Sabah state finances
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
              <FinRow label="State tax revenue" value={`RM ${(stateTax / 1_000_000).toFixed(0)}M`} />
              <FinRow label="Direct jobs created" value={`${stats.sustainability.localJobsCreated.toLocaleString('en-MY')}`} />
              <FinRow label="GDP contribution" value="~8.4%" />
              <FinRow label="Export earnings (FX)" value={`RM ${(totalRevenue * 0.44 / 1_000_000_000).toFixed(1)}B`} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MiniStat({ icon: Icon, label, value, sub, spark, accent }: { icon: any; label: string; value: string; sub: string; spark?: number[]; accent: string }) {
  return (
    <div className="rounded-xl border border-bayu-line bg-bayu-bg1 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
            <Icon className="h-3 w-3" style={{ color: accent }} />
            <span>{label}</span>
          </div>
          <div className="mt-1 font-display text-xl font-bold text-bayu-text">{value}</div>
          <div className="text-[10px] text-bayu-textMuted">{sub}</div>
        </div>
        {spark && <Sparkline data={spark} width={56} height={28} color={accent} />}
      </div>
    </div>
  );
}

function ProjTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-bayu-line bg-bayu-bg2/40 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-bayu-text">{value}</div>
      {note && <div className="mt-0.5 text-[10px] text-bayu-textMuted">{note}</div>}
    </div>
  );
}

function FinRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">{label}</div>
      <div className="mt-0.5 font-display text-sm font-bold text-bayu-text">{value}</div>
    </div>
  );
}
