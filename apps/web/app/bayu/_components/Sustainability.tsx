'use client';

import { motion } from 'framer-motion';
import { Leaf, Waves, Users2, Award, Trash2, Sparkles } from 'lucide-react';
import { stats } from '../_data/stats';

export function Sustainability() {
  const score = stats.sustainabilityScore;
  const s = stats.sustainability;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center">
      <SustainGauge score={score} />

      <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-3">
        <Tile icon={Leaf}   label="CO₂ offset"          value={`${(s.carbonOffsetTonnes / 1000).toFixed(1)}K`}  unit="tonnes"          color="#10B981" />
        <Tile icon={Waves}  label="Reef protected"      value={`${s.reefProtectedHectares}`}                    unit="hectares"        color="#00BCD4" />
        <Tile icon={Users2} label="Jobs created"        value={`${(s.localJobsCreated / 1000).toFixed(1)}K`}     unit="local roles"     color="#2EAFE8" />
        <Tile icon={Award}  label="Eco-certified ops"   value={`${s.ecoCertifiedOperators}%`}                    unit="of operators"    color="#F7B731" />
        <Tile icon={Trash2} label="Waste reduction"     value={`${s.wasteReduction}%`}                           unit="YoY improvement" color="#A78BFA" />
        <Tile icon={Sparkles} label="Plastic-free isles" value={`${s.plasticFreeIslands}`}                        unit="islands"         color="#FFD97A" />
      </div>
    </div>
  );
}

function SustainGauge({ score }: { score: number }) {
  const size = 200;
  const thickness = 18;
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F7B731' : '#F5362F';

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="sustainGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <filter id="sustainGlow">
            <feGaussianBlur stdDeviation="3" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={radius} stroke="#12253F" strokeWidth={thickness} fill="none" />
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#sustainGrad)"
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{ filter: 'url(#sustainGlow)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bayu-textDim">Score</div>
        <div className="font-display text-5xl font-bold tabular-nums" style={{ color }}>
          {score}
        </div>
        <div className="text-[11px] text-bayu-textMuted">out of 100</div>
      </div>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-bayu-line bg-bayu-bg2/40 p-3"
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded"
          style={{ backgroundColor: color + '22' }}
        >
          <Icon className="h-3 w-3" style={{ color }} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
          {label}
        </span>
      </div>
      <div className="mt-2 font-display text-xl font-bold text-bayu-text">{value}</div>
      <div className="text-[10px] text-bayu-textMuted">{unit}</div>
    </motion.div>
  );
}
