'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface Props {
  label: string;
  value: string;
  sublabel?: string;
  growth?: number;
  icon: LucideIcon;
  color?: string;
  spark?: number[];
  delay?: number;
  accent?: 'ocean' | 'gold' | 'jungle' | 'coral' | 'sky';
}

const accentMap: Record<string, string> = {
  ocean: '#096DBB',
  gold: '#F7B731',
  jungle: '#10B981',
  coral: '#F5362F',
  sky: '#2EAFE8',
};

export function KpiCard({
  label,
  value,
  sublabel,
  growth,
  icon: Icon,
  spark,
  delay = 0,
  accent = 'ocean',
}: Props) {
  const color = accentMap[accent];
  const positive = (growth ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-xl border border-bayu-line bg-bayu-bg1 p-5 transition hover:border-bayu-line2 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-0.5 opacity-70"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: color + '22' }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color }} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-bayu-textMuted">
              {label}
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold tracking-tight text-bayu-text">
            {value}
          </div>
          {sublabel && <div className="mt-0.5 text-xs text-bayu-textMuted">{sublabel}</div>}
        </div>

        {spark && (
          <div className="opacity-90">
            <Sparkline data={spark} color={color} width={80} height={32} />
          </div>
        )}
      </div>

      {typeof growth === 'number' && (
        <div className="mt-4 flex items-center gap-1.5">
          <div
            className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${
              positive ? 'bg-bayu-jungle/20 text-bayu-jungle' : 'bg-bayu-coral/20 text-bayu-coral'
            }`}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? '+' : ''}
            {growth.toFixed(1)}%
          </div>
          <span className="text-[10px] text-bayu-textDim">vs last year</span>
        </div>
      )}
    </motion.div>
  );
}
