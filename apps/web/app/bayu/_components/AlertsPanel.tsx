'use client';

import { motion } from 'framer-motion';
import {
  CloudRain,
  Ticket,
  AlertTriangle,
  Bug,
  CheckCircle2,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { stats, type AlertSeverity } from '../_data/stats';

const iconMap: Record<string, LucideIcon> = {
  CloudRain,
  Ticket,
  AlertTriangle,
  Bug,
  CheckCircle2,
  Waves,
};

const severityStyle: Record<AlertSeverity, { color: string; label: string; bg: string }> = {
  critical: { color: '#F5362F', label: 'Critical', bg: 'rgba(245, 54, 47, 0.12)' },
  warning:  { color: '#F7B731', label: 'Warning',  bg: 'rgba(247, 183, 49, 0.12)' },
  info:     { color: '#2EAFE8', label: 'Info',     bg: 'rgba(46, 175, 232, 0.12)' },
  ok:       { color: '#10B981', label: 'Nominal',  bg: 'rgba(16, 185, 129, 0.12)' },
};

export function AlertsPanel() {
  const counts = stats.alerts.reduce(
    (acc, a) => {
      acc[a.severity] = (acc[a.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<AlertSeverity, number>,
  );

  return (
    <div>
      {/* Severity counters */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        {(['critical', 'warning', 'info', 'ok'] as AlertSeverity[]).map((sev) => {
          const s = severityStyle[sev];
          return (
            <div
              key={sev}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: s.color + '33', backgroundColor: s.bg }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: s.color }}>
                {s.label}
              </div>
              <div className="font-display text-lg font-bold text-bayu-text">{counts[sev] ?? 0}</div>
            </div>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {stats.alerts.map((a, i) => {
          const Icon = iconMap[a.icon] ?? AlertTriangle;
          const s = severityStyle[a.severity];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="group flex items-start gap-3 rounded-lg border border-bayu-line bg-bayu-bg2/40 p-3 transition hover:border-bayu-line2 hover:bg-bayu-bg2/70"
            >
              {/* Severity stripe */}
              <div
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: s.color + '1F' }}
              >
                <Icon className="h-4 w-4" style={{ color: s.color }} />
                {a.severity === 'critical' && (
                  <span
                    className="absolute inset-0 rounded-lg"
                    style={{
                      boxShadow: `0 0 0 1.5px ${s.color}`,
                      animation: 'bayuPulse 1.6s ease-out infinite',
                    }}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-bayu-text truncate">{a.title}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-bayu-textMuted truncate">{a.detail}</div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-bayu-textDim">
                  <span
                    className="rounded px-1.5 py-0.5 font-semibold"
                    style={{ color: s.color, backgroundColor: s.color + '14' }}
                  >
                    {s.label}
                  </span>
                  <span>· {a.district}</span>
                  <span>· {a.minsAgo < 60 ? `${a.minsAgo}m ago` : `${Math.floor(a.minsAgo / 60)}h ago`}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
