'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { stats } from '../_data/stats';

type MetricKey = 'arrivals' | 'avgSpend' | 'avgStay' | 'sustainabilityScore';

const METRICS: { key: MetricKey; label: string; unit: string; format: (n: number) => string; accent: string }[] = [
  { key: 'arrivals',            label: 'Arrivals',       unit: '',       format: (n) => `${(n / 1_000_000).toFixed(1)}M`, accent: '#2EAFE8' },
  { key: 'avgSpend',            label: 'Avg Spend',      unit: '/visitor', format: (n) => `RM ${n.toLocaleString('en-MY')}`, accent: '#F7B731' },
  { key: 'avgStay',             label: 'Avg Stay',       unit: ' days',  format: (n) => n.toFixed(1), accent: '#A78BFA' },
  { key: 'sustainabilityScore', label: 'Sustainability', unit: '/100',   format: (n) => n.toString(), accent: '#10B981' },
];

export function CompetitorBenchmark() {
  const rows = [...stats.competitors].sort((a, b) => b.arrivals - a.arrivals);

  // Compute Sabah's rank per metric
  const sabahRanks = METRICS.reduce((acc, m) => {
    const sorted = [...stats.competitors].sort((a, b) => b[m.key] - a[m.key]);
    acc[m.key] = sorted.findIndex((c) => c.isHome) + 1;
    return acc;
  }, {} as Record<MetricKey, number>);

  return (
    <div>
      {/* Rank summary */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {METRICS.map((m) => {
          const rank = sabahRanks[m.key];
          const isTop = rank === 1;
          return (
            <div
              key={m.key}
              className="rounded-lg border p-3"
              style={{
                borderColor: isTop ? m.accent : '#1F3A5F',
                backgroundColor: isTop ? m.accent + '14' : 'rgba(18, 37, 63, 0.4)',
              }}
            >
              <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
                {isTop && <Trophy className="h-3 w-3 text-bayu-gold" />}
                <span>{m.label}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-display text-xl font-bold" style={{ color: isTop ? m.accent : '#E6EEF7' }}>
                  #{rank}
                </span>
                <span className="text-[10px] text-bayu-textDim">of {stats.competitors.length}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="overflow-hidden rounded-xl border border-bayu-line">
        <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr] gap-3 border-b border-bayu-line bg-bayu-bg2/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
          <div>Destination</div>
          {METRICS.map((m) => (
            <div key={m.key} className="text-right">
              {m.label}
            </div>
          ))}
        </div>
        <div className="divide-y divide-bayu-line/70">
          {rows.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className={`grid grid-cols-[180px_1fr_1fr_1fr_1fr] items-center gap-3 px-4 py-3 text-sm ${
                c.isHome ? 'bg-bayu-ocean/[0.08]' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl leading-none">{c.flag}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`truncate font-semibold ${c.isHome ? 'text-bayu-sky' : 'text-bayu-text'}`}>
                      {c.name}
                    </span>
                    {c.isHome && (
                      <span className="rounded bg-bayu-sky/20 px-1 py-px text-[9px] font-bold uppercase text-bayu-sky">
                        us
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[10px] text-bayu-textDim">{c.country}</div>
                </div>
              </div>

              {METRICS.map((m) => {
                const max = Math.max(...rows.map((r) => r[m.key]));
                const pct = (c[m.key] / max) * 100;
                return (
                  <div key={m.key} className="text-right">
                    <div
                      className={`font-display text-sm font-bold tabular-nums ${
                        c.isHome ? 'text-bayu-gold' : 'text-bayu-text'
                      }`}
                    >
                      {m.format(c[m.key])}
                      <span className="text-[10px] font-normal text-bayu-textDim">{m.unit}</span>
                    </div>
                    <div className="mt-1 ml-auto h-1 w-24 overflow-hidden rounded-full bg-bayu-bg2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.7 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: c.isHome ? '#F7B731' : m.accent + 'AA' }}
                      />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-bayu-textMuted">
        <TrendingUp className="h-3 w-3 text-bayu-jungle" />
        <span>
          Sabah leads on <span className="font-semibold text-bayu-jungle">sustainability</span> · ranks{' '}
          <span className="font-semibold text-bayu-text">#{sabahRanks.avgSpend}</span> on spend-per-visitor in APAC benchmark.
        </span>
      </div>
    </div>
  );
}
