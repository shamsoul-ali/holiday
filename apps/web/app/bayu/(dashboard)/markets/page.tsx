'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Wallet, Globe2, Plane } from 'lucide-react';
import { TopBar } from '../../_components/TopBar';
import { Section } from '../../_components/Section';
import { SourceMarkets } from '../../_components/SourceMarkets';
import { Sparkline } from '../../_components/Sparkline';
import { stats } from '../../_data/stats';

export default function MarketsPage() {
  const [selectedId, setSelectedId] = useState<string>(stats.sourceMarkets[1].id);
  const market = stats.sourceMarkets.find((m) => m.id === selectedId) ?? stats.sourceMarkets[0];
  const flightPath = stats.flightPaths.find((f) => f.originId === market.id);

  const totalVisitors = stats.sourceMarkets.reduce((a, m) => a + m.visitors, 0);
  const totalSpend = stats.sourceMarkets.reduce((a, m) => a + m.visitors * m.avgSpend, 0);
  const avgGrowth = stats.sourceMarkets.reduce((a, m) => a + m.growth, 0) / stats.sourceMarkets.length;

  // Synthetic seasonality per market
  const seasonality = useMemo(() => {
    const seed = market.id.charCodeAt(0) + market.id.length;
    return Array.from({ length: 12 }).map((_, i) => {
      const base = 60 + (seed * 3) % 20;
      return base + Math.sin((i + seed) * 0.6) * 22 + ((i * 5 + seed) % 15);
    });
  }, [market.id]);

  // Opportunity matrix: spend (x) × growth (y)
  const maxSpend = Math.max(...stats.sourceMarkets.map((m) => m.avgSpend));
  const maxGrowth = Math.max(...stats.sourceMarkets.map((m) => m.growth));

  return (
    <>
      <TopBar title="Source Markets" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
          {/* Strip */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StripTile icon={Globe2} label="Countries tracked" value={stats.sourceMarkets.length.toString()} sub="active source markets" accent="#2EAFE8" />
            <StripTile icon={Users} label="Total inbound" value={`${(totalVisitors / 1_000_000).toFixed(2)}M`} sub="YTD visitors" accent="#F7B731" />
            <StripTile icon={Wallet} label="Total spend" value={`RM ${(totalSpend / 1_000_000_000).toFixed(1)}B`} sub="estimated" accent="#10B981" />
            <StripTile icon={TrendingUp} label="Avg growth" value={`+${avgGrowth.toFixed(1)}%`} sub="weighted YoY" accent="#A78BFA" />
          </div>

          {/* Table + Detail */}
          <div className="grid grid-cols-12 gap-6">
            <Section
              className="col-span-12 xl:col-span-7"
              title="All source markets"
              subtitle="Click a row to drill down"
            >
              <SourceMarkets />
            </Section>

            <Section
              className="col-span-12 xl:col-span-5"
              title={`${market.flag}  ${market.country}`}
              subtitle={`YoY ${market.growth >= 0 ? '+' : ''}${market.growth.toFixed(1)}% · Avg spend RM ${market.avgSpend.toLocaleString('en-MY')}`}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <DetailMini label="Annual visitors" value={market.visitors.toLocaleString('en-MY')} />
                  <DetailMini
                    label="Share of total"
                    value={`${((market.visitors / totalVisitors) * 100).toFixed(1)}%`}
                  />
                  <DetailMini
                    label="Estimated spend"
                    value={`RM ${((market.visitors * market.avgSpend) / 1_000_000_000).toFixed(2)}B`}
                  />
                  {flightPath && (
                    <DetailMini label="Direct flights" value={`${flightPath.flightsPerWeek}/wk`} />
                  )}
                </div>

                <div className="rounded-lg border border-bayu-line bg-bayu-bg2/40 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
                      12-month seasonality
                    </h3>
                    <span className="text-[10px] text-bayu-textDim">Index vs. annual average</span>
                  </div>
                  <Sparkline data={seasonality} width={320} height={80} color="#2EAFE8" strokeWidth={2} />
                  <div className="mt-2 flex justify-between text-[10px] text-bayu-textDim">
                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => (
                      <span key={i}>{m}</span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-bayu-line bg-bayu-bg2/40 p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
                    Strategic signal
                  </h3>
                  <p className="text-sm text-bayu-text leading-snug">
                    {market.growth >= 20
                      ? `🚀 High-growth market. Prioritise BDM expansion, trade mission participation, and co-marketing with airlines.`
                      : market.growth >= 10
                      ? `📈 Healthy growth. Sustain current campaigns, test premium product positioning.`
                      : market.growth >= 0
                      ? `➡️ Steady. Review product-market fit. Consider diversification levers.`
                      : `⚠️ Cooling. Audit visa policy, review competitive positioning vs. alternatives.`}
                  </p>
                </div>
              </div>
            </Section>
          </div>

          {/* Market selector */}
          <Section
            title="Pick a market"
            subtitle="Select any country to drill into its performance above"
          >
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
              {stats.sourceMarkets.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                    selectedId === m.id
                      ? 'border-bayu-sky bg-bayu-ocean/15'
                      : 'border-bayu-line bg-bayu-bg1 hover:bg-bayu-bg2/60'
                  }`}
                >
                  <span className="text-2xl leading-none">{m.flag}</span>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-xs font-semibold text-bayu-text">{m.country}</div>
                    <div className="text-[10px] text-bayu-textMuted">
                      {(m.visitors / 1000).toFixed(0)}K ·{' '}
                      <span className={m.growth >= 0 ? 'text-bayu-jungle' : 'text-bayu-coral'}>
                        {m.growth >= 0 ? '+' : ''}{m.growth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* Opportunity matrix */}
          <Section
            title="Opportunity matrix"
            subtitle="Avg spend per visitor (→) vs. YoY growth (↑). Upper-right = high-value growing markets."
          >
            <OpportunityMatrix maxSpend={maxSpend} maxGrowth={maxGrowth} selectedId={selectedId} onSelect={setSelectedId} />
          </Section>

          {/* Direct flight routes */}
          <Section
            title="Direct flight routes to BKI"
            subtitle={`${stats.flightPaths.reduce((a, f) => a + f.flightsPerWeek, 0)} flights/week from ${stats.flightPaths.length} origin hubs`}
          >
            <div className="overflow-hidden rounded-xl border border-bayu-line">
              <div className="grid grid-cols-[140px_1fr_100px_120px_100px] gap-3 border-b border-bayu-line bg-bayu-bg2/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
                <div>Hub</div>
                <div>Route</div>
                <div className="text-right">Flights/wk</div>
                <div className="text-right">Visitors/yr</div>
                <div className="text-right">Share</div>
              </div>
              <div className="divide-y divide-bayu-line/70">
                {stats.flightPaths
                  .slice()
                  .sort((a, b) => b.flightsPerWeek - a.flightsPerWeek)
                  .map((f) => {
                    const totalFlights = stats.flightPaths.reduce((a, p) => a + p.flightsPerWeek, 0);
                    const share = (f.flightsPerWeek / totalFlights) * 100;
                    return (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-[140px_1fr_100px_120px_100px] items-center gap-3 px-4 py-3 text-sm transition hover:bg-bayu-bg2/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl leading-none">{f.flag}</span>
                          <span className="font-semibold text-bayu-text">{f.originLabel}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-bayu-textMuted">
                          <Plane className="h-3 w-3 text-bayu-sky" />
                          <span>{f.originLabel}</span>
                          <span className="text-bayu-textDim">→</span>
                          <span className="text-bayu-gold">BKI</span>
                        </div>
                        <div className="text-right font-mono tabular-nums text-bayu-text">
                          {f.flightsPerWeek}
                        </div>
                        <div className="text-right font-mono tabular-nums text-bayu-textMuted">
                          {(f.visitors / 1000).toFixed(0)}K
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <span className="font-mono text-xs text-bayu-textMuted tabular-nums">{share.toFixed(1)}%</span>
                            <div className="h-1 w-16 overflow-hidden rounded bg-bayu-bg2">
                              <div
                                className="h-full rounded bg-gradient-to-r from-bayu-ocean to-bayu-sky"
                                style={{ width: `${(f.flightsPerWeek / stats.flightPaths[0].flightsPerWeek) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function StripTile({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="rounded-xl border border-bayu-line bg-bayu-bg1 p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
        <Icon className="h-3 w-3" style={{ color: accent }} />
        <span>{label}</span>
      </div>
      <div className="mt-1 font-display text-2xl font-bold" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-[10px] text-bayu-textMuted">{sub}</div>
    </div>
  );
}

function DetailMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-bayu-line bg-bayu-bg2/30 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-bayu-text">{value}</div>
    </div>
  );
}

function OpportunityMatrix({
  maxSpend,
  maxGrowth,
  selectedId,
  onSelect,
}: {
  maxSpend: number;
  maxGrowth: number;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const size = 360;
  const pad = 30;
  return (
    <div className="flex flex-col items-center gap-3 md:flex-row md:items-start">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* axes */}
          <line x1={pad} y1={size - pad} x2={size - pad} y2={size - pad} stroke="#1F3A5F" strokeWidth={1} />
          <line x1={pad} y1={pad} x2={pad} y2={size - pad} stroke="#1F3A5F" strokeWidth={1} />
          {/* grid */}
          {[0.25, 0.5, 0.75].map((t) => (
            <g key={t} opacity={0.25}>
              <line x1={pad + (size - 2 * pad) * t} y1={pad} x2={pad + (size - 2 * pad) * t} y2={size - pad} stroke="#2A4F7D" strokeDasharray="2 3" />
              <line x1={pad} y1={pad + (size - 2 * pad) * t} x2={size - pad} y2={pad + (size - 2 * pad) * t} stroke="#2A4F7D" strokeDasharray="2 3" />
            </g>
          ))}
          {/* upper-right highlight */}
          <rect x={pad + (size - 2 * pad) * 0.6} y={pad} width={(size - 2 * pad) * 0.4} height={(size - 2 * pad) * 0.4} fill="#10B981" opacity={0.08} />
          <text x={size - pad - 4} y={pad + 14} textAnchor="end" fontSize={9} fontWeight="700" fill="#10B981">
            HIGH-VALUE GROWING
          </text>
          {/* axis labels */}
          <text x={size / 2} y={size - 6} textAnchor="middle" fontSize={10} fill="#8FA3B8">Avg spend →</text>
          <text x={10} y={size / 2} textAnchor="middle" fontSize={10} fill="#8FA3B8" transform={`rotate(-90 10 ${size / 2})`}>Growth ↑</text>

          {/* bubbles */}
          {stats.sourceMarkets.map((m) => {
            const x = pad + ((size - 2 * pad) * (m.avgSpend / maxSpend));
            const y = size - pad - ((size - 2 * pad) * (Math.max(0, m.growth) / maxGrowth));
            const r = Math.max(4, Math.sqrt(m.visitors / 10000));
            const isActive = selectedId === m.id;
            return (
              <g key={m.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(m.id)}>
                <circle
                  cx={x}
                  cy={y}
                  r={r + 2}
                  fill={isActive ? '#2EAFE8' : '#F7B731'}
                  fillOpacity={0.25}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={isActive ? '#2EAFE8' : '#F7B731'}
                  stroke={isActive ? '#FFFFFF' : '#0B1A30'}
                  strokeWidth={1.4}
                />
                <text x={x} y={y + 3} textAnchor="middle" fontSize={Math.max(9, r)} pointerEvents="none">
                  {m.flag}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex-1 text-xs text-bayu-textMuted leading-relaxed">
        <p>
          Bubble size = annual visitor volume. Markets in the <span className="text-bayu-jungle font-semibold">upper-right quadrant</span> combine
          high per-visitor spend with above-average growth — they warrant the biggest share of trade-mission and
          co-marketing budgets.
        </p>
        <p className="mt-3">
          Click a bubble to drill into that market above.
        </p>
      </div>
    </div>
  );
}
