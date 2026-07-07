'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Zap, Target } from 'lucide-react';
import { stats } from '../_data/stats';
import { Sparkline } from './Sparkline';

export function AiForecast() {
  const f = stats.forecast;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-bayu-line bg-bayu-bg1">
      {/* Purple/sky aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(600px 300px at 0% 0%, rgba(124, 58, 237, 0.16), transparent 60%),' +
            'radial-gradient(600px 300px at 100% 100%, rgba(46, 175, 232, 0.14), transparent 60%)',
        }}
      />

      <div className="relative grid grid-cols-12 gap-6 p-6">
        {/* Left: headline + sparkline */}
        <div className="col-span-12 md:col-span-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-bayu-textDim">
            <Sparkles className="h-3 w-3 text-bayu-sky" />
            <span>Bayu AI Forecast · 30-day</span>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold tracking-tight text-bayu-text">
              {(f.next30DaysVisitors / 1000).toFixed(0)}K
            </span>
            <span className="text-sm font-medium text-bayu-textMuted">visitors</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-bayu-jungle/15 px-2 py-0.5 text-xs font-bold text-bayu-jungle">
              <TrendingUp className="h-3 w-3" />+{f.next30DaysGrowth}% vs baseline
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-bayu-line px-2 py-0.5 text-[10px] font-semibold text-bayu-textMuted">
              <Target className="h-3 w-3" />
              {f.confidence}% confidence
            </span>
          </div>

          <div className="mt-4">
            <Sparkline data={f.dailySeries} color="#A78BFA" width={280} height={56} strokeWidth={2} />
            <div className="mt-2 flex justify-between text-[10px] text-bayu-textDim">
              <span>Today</span>
              <span>+30 days</span>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-bayu-textDim">
            Model blends historical arrivals, flight bookings, hotel reservations, and social signals.
            Retrained nightly with 3.2M data points.
          </p>
        </div>

        {/* Right: anomaly list */}
        <div className="col-span-12 md:col-span-7 md:border-l md:border-bayu-line md:pl-6">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-bayu-gold" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
              AI-detected anomalies
            </h3>
            <span className="ml-auto text-[10px] text-bayu-textDim">
              {f.anomalies.length} active signals
            </span>
          </div>

          <div className="space-y-2.5">
            {f.anomalies.map((a, i) => {
              const positive = a.pct >= 0;
              const color = positive ? '#F7B731' : '#F5362F';
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="group flex items-start gap-3 rounded-lg border border-bayu-line bg-bayu-bg2/50 p-3 transition hover:bg-bayu-bg2"
                >
                  <div
                    className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                    style={{
                      backgroundColor: color + '22',
                      color,
                      boxShadow: `inset 0 0 0 1px ${color}33`,
                    }}
                  >
                    {positive ? '▲' : '▼'} {Math.abs(a.pct)}
                    <span className="text-[9px] opacity-70">%</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-bayu-text">{a.region}</span>
                      <span className="rounded-sm bg-bayu-bg0 px-1 py-px text-[9px] font-bold uppercase tracking-wider text-bayu-textDim">
                        {a.confidence}%
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-bayu-textMuted">{a.reason}</p>
                  </div>
                  {positive ? (
                    <TrendingUp className="mt-1 h-3.5 w-3.5 shrink-0 text-bayu-gold" />
                  ) : (
                    <TrendingDown className="mt-1 h-3.5 w-3.5 shrink-0 text-bayu-coral" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
