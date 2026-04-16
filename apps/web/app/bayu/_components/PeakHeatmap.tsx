'use client';

import { motion } from 'framer-motion';
import { stats } from '../_data/stats';

function mix(a: string, b: string, t: number) {
  const ha = a.replace('#', '');
  const hb = b.replace('#', '');
  const ra = parseInt(ha.slice(0, 2), 16),
    ga = parseInt(ha.slice(2, 4), 16),
    ba = parseInt(ha.slice(4, 6), 16);
  const rb = parseInt(hb.slice(0, 2), 16),
    gb = parseInt(hb.slice(2, 4), 16),
    bb = parseInt(hb.slice(4, 6), 16);
  const h = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return '#' + h(ra + (rb - ra) * t) + h(ga + (gb - ga) * t) + h(ba + (bb - ba) * t);
}

function heatColor(v: number) {
  const t = Math.max(0, Math.min(1, v / 100));
  if (t < 0.45) return mix('#12253F', '#2EAFE8', t / 0.45);
  if (t < 0.7) return mix('#2EAFE8', '#F7B731', (t - 0.45) / 0.25);
  return mix('#F7B731', '#F5362F', (t - 0.7) / 0.3);
}

const CATEGORIES = ['Diving', 'Mountain', 'Cultural', 'Wildlife', 'Beach'];

export function PeakHeatmap() {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <div className="w-24" />
        {stats.peakSeasonGrid.map((d) => (
          <div key={d.month} className="flex-1 text-center text-[10px] font-medium text-bayu-textDim">
            {d.month}
          </div>
        ))}
      </div>

      {/* Rows */}
      {CATEGORIES.map((cat, rowIdx) => (
        <div key={cat} className="flex items-center gap-1.5">
          <div className="w-24 pr-2 text-right text-xs font-semibold text-bayu-text">{cat}</div>
          {stats.peakSeasonGrid.map((d, i) => {
            const v = d.categories[cat] ?? 0;
            return (
              <motion.div
                key={d.month + cat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (rowIdx * 12 + i) * 0.01, duration: 0.3 }}
                className="group relative flex-1 rounded cursor-pointer transition hover:ring-2 hover:ring-bayu-skylight"
                style={{
                  aspectRatio: 1,
                  backgroundColor: heatColor(v),
                  boxShadow: v > 80 ? `0 0 12px ${heatColor(v)}80` : 'none',
                }}
              >
                <span
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                  style={{ color: v > 75 ? '#FFFFFF' : v > 50 ? '#0B1A30' : '#E6EEF7' }}
                >
                  {v}
                </span>
              </motion.div>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <span className="text-[10px] font-medium text-bayu-textDim">Low</span>
        <div className="flex h-2 w-48 overflow-hidden rounded-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: heatColor(i * 5), flex: 1 }} />
          ))}
        </div>
        <span className="text-[10px] font-medium text-bayu-textDim">Peak</span>
      </div>
    </div>
  );
}
