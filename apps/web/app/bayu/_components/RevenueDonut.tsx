'use client';

import { motion } from 'framer-motion';
import { stats } from '../_data/stats';

export function RevenueDonut({ size = 200, thickness = 26 }: { size?: number; thickness?: number }) {
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * radius;
  const total = stats.revenueBySector.reduce((a, s) => a + s.amount, 0);

  let offset = 0;
  const segments = stats.revenueBySector.map((s, i) => {
    const len = (s.amount / total) * circ;
    const rotation = (offset / circ) * 360 - 90;
    offset += len;
    return { ...s, len, rotation, index: i };
  });

  return (
    <div className="flex items-center gap-8">
      <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <defs>
            {stats.revenueBySector.map((s) => (
              <filter key={`glow-${s.sector}`} id={`glow-${s.sector.replace(/\s+/g, '')}`}>
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
          <circle cx={cx} cy={cy} r={radius} stroke="#12253F" strokeWidth={thickness} fill="none" />
          {segments.map((seg, i) => (
            <motion.circle
              key={seg.sector}
              cx={cx}
              cy={cy}
              r={radius}
              stroke={seg.color}
              strokeWidth={thickness}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={`${seg.len} ${circ}`}
              transform={`rotate(${seg.rotation} ${cx} ${cy})`}
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${seg.len} ${circ}` }}
              transition={{ delay: i * 0.12, duration: 0.8, ease: 'easeOut' }}
              style={{ filter: `url(#glow-${seg.sector.replace(/\s+/g, '')})` }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">Total</div>
          <div className="font-display text-2xl font-bold text-bayu-text">
            RM {(total / 1_000_000_000).toFixed(1)}B
          </div>
          <div className="text-[10px] text-bayu-textMuted">5 sectors</div>
        </div>
      </div>

      <div className="flex-1 space-y-2.5">
        {stats.revenueBySector.map((s) => (
          <motion.div
            key={s.sector}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="group flex items-center gap-3"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}80` }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-bayu-text">{s.sector}</span>
                <span className="font-display text-sm font-bold text-bayu-text">{s.percentage}%</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-bayu-bg2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.percentage}%` }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: s.color }}
                />
              </div>
              <div className="mt-1 text-[10px] text-bayu-textDim">
                RM {(s.amount / 1_000_000_000).toFixed(2)}B
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
