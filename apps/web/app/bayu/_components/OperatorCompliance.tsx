'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Clock3, AlertOctagon, XCircle, TrendingUp, ChevronRight } from 'lucide-react';
import { stats, type OperatorStatus } from '../_data/stats';

const statusStyle: Record<OperatorStatus, { label: string; color: string; icon: any }> = {
  compliant: { label: 'Compliant',       color: '#10B981', icon: ShieldCheck },
  pending:   { label: 'Pending audit',   color: '#2EAFE8', icon: Clock3 },
  expiring:  { label: 'Expiring < 30d',  color: '#F7B731', icon: AlertOctagon },
  lapsed:    { label: 'Lapsed',          color: '#F5362F', icon: XCircle },
};

export function OperatorCompliance() {
  const o = stats.operators;
  const segments = [
    { key: 'compliant' as const, value: o.compliant },
    { key: 'pending' as const,   value: o.pending },
    { key: 'expiring' as const,  value: o.expiring },
    { key: 'lapsed' as const,    value: o.lapsed },
  ];
  const total = o.total;

  // Donut
  const size = 160;
  const thickness = 18;
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Donut + breakdown */}
      <div className="col-span-12 md:col-span-5">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
              <circle cx={cx} cy={cy} r={radius} stroke="#12253F" strokeWidth={thickness} fill="none" />
              {segments.map((s, i) => {
                const len = (s.value / total) * circ;
                const rot = (offset / circ) * 360 - 90;
                offset += len;
                return (
                  <motion.circle
                    key={s.key}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke={statusStyle[s.key].color}
                    strokeWidth={thickness}
                    fill="none"
                    strokeLinecap="butt"
                    strokeDasharray={`${len} ${circ}`}
                    transform={`rotate(${rot} ${cx} ${cy})`}
                    initial={{ strokeDasharray: `0 ${circ}` }}
                    animate={{ strokeDasharray: `${len} ${circ}` }}
                    transition={{ delay: i * 0.12, duration: 0.8 }}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold text-bayu-text tabular-nums">{total}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
                operators
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            {segments.map((s) => {
              const style = statusStyle[s.key];
              const Icon = style.icon;
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <Icon className="h-3 w-3" style={{ color: style.color }} />
                  <span className="text-xs text-bayu-textMuted">{style.label}</span>
                  <span className="ml-auto font-display text-xs font-bold text-bayu-text tabular-nums">
                    {s.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-bayu-line bg-bayu-bg2/40 p-3">
          <TrendingUp className="h-4 w-4 text-bayu-jungle" />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
              Compliance rate
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-bayu-text">
                {Math.round((o.compliant / total) * 100)}%
              </span>
              <span className="text-[11px] font-bold text-bayu-jungle">+{o.complianceYoY}% YoY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action list */}
      <div className="col-span-12 md:col-span-7 md:border-l md:border-bayu-line md:pl-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
            Requires attention
          </h3>
          <span className="text-[10px] text-bayu-textDim">{o.actions.length} operators</span>
        </div>

        <div className="space-y-2">
          {o.actions.map((op, i) => {
            const style = statusStyle[op.status];
            const Icon = style.icon;
            return (
              <motion.div
                key={op.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group flex items-center gap-3 rounded-lg border border-bayu-line bg-bayu-bg2/40 p-3 transition hover:border-bayu-line2 hover:bg-bayu-bg2/70"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: style.color + '22' }}
                >
                  <Icon className="h-4 w-4" style={{ color: style.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-bayu-text">{op.name}</div>
                  <div className="flex items-center gap-2 text-[10px] text-bayu-textDim">
                    <span>{op.category}</span>
                    <span>·</span>
                    <span>{op.district}</span>
                    {op.lastAuditScore !== undefined && (
                      <>
                        <span>·</span>
                        <span>audit {op.lastAuditScore}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: style.color }}
                  >
                    {style.label}
                  </div>
                  <div className="text-[10px] text-bayu-textDim">
                    {op.expiresIn >= 0 ? `${op.expiresIn}d left` : `${Math.abs(op.expiresIn)}d overdue`}
                  </div>
                </div>
                <button className="flex h-7 items-center gap-1 rounded-md border border-bayu-line bg-bayu-bg0 px-2 text-[10px] font-semibold text-bayu-textMuted transition hover:border-bayu-sky hover:text-bayu-sky">
                  Review
                  <ChevronRight className="h-3 w-3" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
