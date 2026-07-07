'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Plane, Globe2, Users, Wallet } from 'lucide-react';
import { TopBar } from '../../_components/TopBar';
import { Section } from '../../_components/Section';
import { MalaysiaMap } from '../../_components/MalaysiaMap';
import { Sparkline } from '../../_components/Sparkline';
import { LiveDot } from '../../_components/LiveCounter';
import { stats } from '../../_data/stats';

export default function OriginsPage() {
  const [selectedId, setSelectedId] = useState<string>(stats.flightPaths[0].id);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const highlightId = hoverId ?? selectedId;
  const selected = stats.flightPaths.find((fp) => fp.id === selectedId)!;

  // Build enriched view per flight path (merge with source markets where possible)
  const enriched = useMemo(() => {
    return stats.flightPaths.map((fp) => {
      const market = stats.sourceMarkets.find((m) => m.id === fp.originId);
      return { ...fp, market };
    });
  }, []);
  const totalFlights = stats.flightPaths.reduce((a, f) => a + f.flightsPerWeek, 0);
  const totalVisitors = stats.flightPaths.reduce((a, f) => a + f.visitors, 0);

  const activeMarket = enriched.find((e) => e.id === selectedId)?.market;

  // Synthetic seasonality (12-pt mini-chart per origin)
  function seasonality(seed: number) {
    const base = 60 + (seed * 7) % 30;
    return Array.from({ length: 12 }).map((_, i) => base + Math.sin(i + seed) * 20 + (i * 2) % 10);
  }

  return (
    <>
      <TopBar title="Visitor Origin Explorer" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
          {/* Summary strip */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StripTile icon={Globe2} label="Source markets" value={stats.sourceMarkets.length.toString()} accent="#2EAFE8" />
            <StripTile icon={Plane}  label="Inbound flights" value={`${totalFlights}/wk`}                  accent="#F7B731" />
            <StripTile icon={Users}  label="Tracked arrivals" value={`${(totalVisitors / 1_000_000).toFixed(1)}M`} accent="#10B981" />
            <StripTile icon={Wallet} label="Avg spend (intl)" value={`RM ${Math.round(stats.sourceMarkets.reduce((a, m) => a + m.avgSpend, 0) / stats.sourceMarkets.length).toLocaleString('en-MY')}`} accent="#A78BFA" />
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Left rail: origin list */}
            <Section
              className="col-span-12 xl:col-span-3"
              title="Inbound routes"
              subtitle="Hover / click to highlight"
              live
            >
              <div className="space-y-1.5">
                {enriched.map((fp) => {
                  const active = fp.id === highlightId;
                  const pct = (fp.visitors / totalVisitors) * 100;
                  return (
                    <button
                      key={fp.id}
                      onMouseEnter={() => setHoverId(fp.id)}
                      onMouseLeave={() => setHoverId(null)}
                      onClick={() => setSelectedId(fp.id)}
                      className={`w-full rounded-lg border p-3 text-left transition ${
                        active
                          ? 'border-bayu-sky bg-bayu-ocean/10'
                          : 'border-bayu-line bg-bayu-bg2/30 hover:bg-bayu-bg2/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl leading-none">{fp.flag}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-bayu-text">
                            {fp.originLabel}
                          </div>
                          <div className="text-[10px] text-bayu-textDim">
                            {fp.flightsPerWeek} flt/wk · {(fp.visitors / 1000).toFixed(0)}K pax/yr
                          </div>
                        </div>
                        {fp.market && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              fp.market.growth >= 0
                                ? 'bg-bayu-jungle/15 text-bayu-jungle'
                                : 'bg-bayu-coral/15 text-bayu-coral'
                            }`}
                          >
                            {fp.market.growth >= 0 ? '+' : ''}{fp.market.growth.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-bayu-bg2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-bayu-ocean to-bayu-sky"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Main map */}
            <Section
              className="col-span-12 xl:col-span-9"
              title="Live flight routes · Malaysia → Sabah"
              subtitle="Click any origin to pin detail"
              live
              kicker={`${totalFlights} flights/wk`}
            >
              <MalaysiaMap
                className="rounded-xl overflow-hidden"
                highlightFlightId={highlightId}
                onFlightClick={(id) => setSelectedId(id)}
              />
            </Section>
          </div>

          {/* Detail panel */}
          <Section
            title={`${selected.flag}  ${selected.originLabel} — Route detail`}
            subtitle={`Origin-specific breakdown · ${selected.flightsPerWeek} flights/wk`}
          >
            <div className="grid grid-cols-12 gap-6">
              {/* Big stats */}
              <div className="col-span-12 md:col-span-4 space-y-3">
                <BigStat
                  label="Annual visitors"
                  value={selected.visitors.toLocaleString('en-MY')}
                  sub={`${((selected.visitors / totalVisitors) * 100).toFixed(1)}% of total`}
                />
                {activeMarket && (
                  <>
                    <BigStat
                      label="YoY growth"
                      value={`${activeMarket.growth >= 0 ? '+' : ''}${activeMarket.growth.toFixed(1)}%`}
                      sub="vs. previous year"
                      color={activeMarket.growth >= 0 ? '#10B981' : '#F5362F'}
                    />
                    <BigStat
                      label="Avg spend"
                      value={`RM ${activeMarket.avgSpend.toLocaleString('en-MY')}`}
                      sub="per visitor"
                      color="#F7B731"
                    />
                  </>
                )}
              </div>

              {/* Seasonality sparkline + route info */}
              <div className="col-span-12 md:col-span-8">
                <div className="rounded-lg border border-bayu-line bg-bayu-bg2/40 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
                      12-month seasonality
                    </h3>
                    <span className="text-[10px] text-bayu-textDim">Indexed to 100 = annual avg</span>
                  </div>
                  <Sparkline data={seasonality(selected.originId.charCodeAt(0))} width={540} height={80} color="#2EAFE8" />
                  <div className="mt-2 flex justify-between text-[10px] text-bayu-textDim">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <RouteInfo label="Primary airlines" value="MAS, AirAsia" />
                  <RouteInfo label="Avg ticket price" value="RM 1,240" />
                  <RouteInfo label="Load factor" value="82%" />
                </div>

                {activeMarket && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center gap-2 rounded-lg border border-bayu-line bg-bayu-bg2/30 p-3 text-xs text-bayu-textMuted"
                  >
                    {activeMarket.growth >= 15 ? (
                      <TrendingUp className="h-4 w-4 text-bayu-jungle" />
                    ) : activeMarket.growth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-bayu-sky" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-bayu-coral" />
                    )}
                    <span>
                      {activeMarket.growth >= 15
                        ? 'Hot market · prioritize trade mission + seat expansion'
                        : activeMarket.growth >= 0
                        ? 'Steady growth · maintain BDM presence'
                        : 'Cooling market · review product positioning'}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function StripTile({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-bayu-line bg-bayu-bg1 p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
        <Icon className="h-3 w-3" style={{ color: accent }} />
        <span>{label}</span>
      </div>
      <div className="mt-1 font-display text-2xl font-bold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function BigStat({ label, value, sub, color = '#E6EEF7' }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div className="rounded-lg border border-bayu-line bg-bayu-bg2/40 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-bayu-textMuted">{sub}</div>
    </div>
  );
}

function RouteInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-bayu-line bg-bayu-bg2/30 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">{label}</div>
      <div className="mt-1 font-display text-sm font-bold text-bayu-text">{value}</div>
    </div>
  );
}
