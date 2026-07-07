'use client';

import { motion } from 'framer-motion';
import { Users, Briefcase, Calendar, Repeat } from 'lucide-react';
import { stats } from '../_data/stats';

export function Demographics() {
  const d = stats.demographics;
  const maxAge = Math.max(...d.ageBuckets.map((a) => a.pct));
  const maxStay = Math.max(...d.stayDistribution.map((s) => s.pct));

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Age histogram */}
      <div className="col-span-12 md:col-span-4">
        <SubHeader icon={Users} label="Age distribution" hint={`Avg group size ${d.avgGroupSize}`} />
        <div className="flex h-40 items-end gap-2">
          {d.ageBuckets.map((a, i) => (
            <div key={a.bucket} className="flex flex-1 flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(a.pct / maxAge) * 100}%` }}
                transition={{ delay: i * 0.08, duration: 0.7, ease: 'easeOut' }}
                className="w-full rounded-t bg-gradient-to-t from-bayu-ocean to-bayu-sky shadow-[0_0_12px_rgba(46,175,232,0.3)]"
                style={{ minHeight: 4 }}
              />
              <div className="text-[10px] font-medium text-bayu-textDim">{a.bucket}</div>
              <div className="font-display text-xs font-bold text-bayu-text">{a.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Purpose donut */}
      <div className="col-span-12 md:col-span-4 md:border-l md:border-bayu-line md:pl-6">
        <SubHeader icon={Briefcase} label="Trip purpose" />
        <PurposeDonut data={d.purpose} />
      </div>

      {/* Stay distribution + meta */}
      <div className="col-span-12 md:col-span-4 md:border-l md:border-bayu-line md:pl-6">
        <SubHeader icon={Calendar} label="Length of stay" />
        <div className="space-y-2.5">
          {d.stayDistribution.map((s, i) => (
            <motion.div
              key={s.range}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-bayu-text">{s.range}</span>
                <span className="font-display font-bold text-bayu-text tabular-nums">{s.pct}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bayu-bg2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.pct / maxStay) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.7 }}
                  className="h-full rounded-full bg-gradient-to-r from-bayu-gold to-bayu-goldlight"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <MiniStat icon={Repeat} label="Returning" value={`${d.returningVsNew.returning}%`} color="#10B981" />
          <MiniStat icon={Users} label="Gender (F)" value={`${d.genderSplit.female}%`} color="#A78BFA" />
        </div>
      </div>
    </div>
  );
}

function SubHeader({ icon: Icon, label, hint }: { icon: any; label: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-bayu-sky" />
      <h3 className="text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">{label}</h3>
      {hint && <span className="ml-auto text-[10px] text-bayu-textDim">{hint}</span>}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-bayu-line bg-bayu-bg2/40 p-2">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
        <Icon className="h-3 w-3" style={{ color }} />
        <span>{label}</span>
      </div>
      <div className="mt-0.5 font-display text-sm font-bold text-bayu-text">{value}</div>
    </div>
  );
}

function PurposeDonut({ data }: { data: { label: string; pct: number; color: string }[] }) {
  const size = 140;
  const thickness = 18;
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={radius} stroke="#12253F" strokeWidth={thickness} fill="none" />
          {data.map((s, i) => {
            const len = (s.pct / 100) * circ;
            const rot = (offset / circ) * 360 - 90;
            offset += len;
            return (
              <motion.circle
                key={s.label}
                cx={cx}
                cy={cy}
                r={radius}
                stroke={s.color}
                strokeWidth={thickness}
                fill="none"
                strokeDasharray={`${len} ${circ}`}
                transform={`rotate(${rot} ${cx} ${cy})`}
                initial={{ strokeDasharray: `0 ${circ}` }}
                animate={{ strokeDasharray: `${len} ${circ}` }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-lg font-bold text-bayu-text">{data[0].pct}%</span>
          <span className="text-[10px] text-bayu-textDim">Leisure</span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {data.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-bayu-text">{s.label}</span>
            </div>
            <span className="font-display font-bold text-bayu-text tabular-nums">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
