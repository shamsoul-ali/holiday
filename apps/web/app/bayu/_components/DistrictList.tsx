'use client';

import { motion } from 'framer-motion';
import { TrendingUp, MapPin } from 'lucide-react';
import { stats } from '../_data/stats';

export function DistrictList() {
  const max = Math.max(...stats.topDistricts.map((d) => d.visitors));

  return (
    <div className="space-y-3">
      {stats.topDistricts.map((d, i) => (
        <motion.div
          key={d.name}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="group rounded-lg border border-transparent bg-bayu-bg2/40 p-3 transition hover:border-bayu-line hover:bg-bayu-bg2/60"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-bayu-sky" />
              <span className="truncate text-sm font-semibold text-bayu-text">{d.name}</span>
              <span className="text-[11px] text-bayu-textDim">· {d.percentage}% share</span>
            </div>
            <span className="flex items-center gap-1 rounded bg-bayu-jungle/15 px-1.5 py-0.5 text-[10px] font-bold text-bayu-jungle">
              <TrendingUp className="h-3 w-3" />+{d.growth.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-bayu-bg2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(d.visitors / max) * 100}%` }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.7 }}
                className="h-full rounded-full bg-gradient-to-r from-bayu-ocean to-bayu-sky"
              />
            </div>
            <span className="font-display text-xs font-semibold text-bayu-textMuted tabular-nums">
              {(d.visitors / 1000).toFixed(0)}K
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
