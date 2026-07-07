'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';
import { LiveCounter, LiveDot } from './LiveCounter';
import { stats } from '../_data/stats';
import { useDateRange } from './DateRangeContext';

export function Hero() {
  const { meta } = useDateRange();
  const scaledVisitors = Math.round(stats.totalVisitors * meta.multiplier);
  const scaledRevenue = stats.revenue * meta.multiplier;
  const isYtd = meta.key === 'ytd';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl border border-bayu-line bg-bayu-bg1"
    >
      {/* Gradient bg — theme-aware via bayu-bg1/bg2 as base, same accent glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-bayu-bg1 to-bayu-bg2" />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(1200px 400px at 10% 10%, rgba(9, 109, 187, 0.28), transparent 60%),' +
              'radial-gradient(800px 350px at 90% 90%, rgba(247, 183, 49, 0.14), transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(46, 175, 232, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(46, 175, 232, 0.12) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative grid grid-cols-12 gap-8 p-8">
        {/* Left: live today */}
        <div className="col-span-12 md:col-span-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-bayu-textDim">
            <Activity className="h-3 w-3" />
            <span>Real-time arrivals · Today</span>
            <LiveDot size="xs" color="coral" label="LIVE" />
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <LiveCounter
              value={stats.liveVisitorsToday}
              ratePerSec={stats.liveVisitorsRate}
              className="font-display text-6xl font-bold tracking-tight text-bayu-text"
            />
            <span className="text-sm font-medium text-bayu-textMuted">visitors</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded bg-bayu-jungle/15 px-2 py-1 text-[11px] font-bold text-bayu-jungle">
              <div className="h-1.5 w-1.5 rounded-full bg-bayu-jungle animate-pulse" />
              +{stats.liveVisitorsRate.toFixed(1)}/min
            </div>
            <span className="text-xs text-bayu-textDim">streaming from BKI & Tawau airports</span>
          </div>
        </div>

        {/* Middle: selected range visitors */}
        <div className="col-span-6 md:col-span-4 md:border-l md:border-bayu-line md:pl-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bayu-textDim">
            {meta.humanLabel}
          </div>
          <motion.div
            key={meta.key + '-v'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-baseline gap-3"
          >
            <span className="font-display text-5xl font-bold tracking-tight text-bayu-text tabular-nums">
              {scaledVisitors >= 1_000_000
                ? `${(scaledVisitors / 1_000_000).toFixed(2)}M`
                : `${(scaledVisitors / 1_000).toFixed(0)}K`}
            </span>
            <span className="text-sm font-medium text-bayu-textMuted">visitors</span>
          </motion.div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-bayu-jungle/15 px-2 py-1 text-xs font-bold text-bayu-jungle">
            <TrendingUp className="h-3 w-3" />+{stats.totalVisitorsYoY}% {isYtd ? 'YoY' : 'vs prev period'}
          </div>
        </div>

        {/* Right: revenue scaled */}
        <div className="col-span-6 md:col-span-3 md:border-l md:border-bayu-line md:pl-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bayu-textDim">
            Revenue · {meta.humanLabel.toLowerCase()}
          </div>
          <motion.div
            key={meta.key + '-r'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-baseline gap-2"
          >
            {scaledRevenue >= 1_000_000_000 ? (
              <>
                <span className="font-display text-5xl font-bold tracking-tight text-bayu-gold tabular-nums">
                  {(scaledRevenue / 1_000_000_000).toFixed(1)}
                </span>
                <span className="font-display text-xl font-bold text-bayu-goldlight">B</span>
              </>
            ) : (
              <>
                <span className="font-display text-5xl font-bold tracking-tight text-bayu-gold tabular-nums">
                  {(scaledRevenue / 1_000_000).toFixed(0)}
                </span>
                <span className="font-display text-xl font-bold text-bayu-goldlight">M</span>
              </>
            )}
            <span className="text-xs font-medium text-bayu-textMuted">MYR</span>
          </motion.div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-bayu-gold/15 px-2 py-1 text-xs font-bold text-bayu-gold">
            <TrendingUp className="h-3 w-3" />+{stats.revenueYoY}% {isYtd ? 'YoY' : 'vs prev'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
