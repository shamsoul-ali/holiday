'use client';

import { motion } from 'framer-motion';
import { Plane, Users2, Clock, MapPin } from 'lucide-react';
import { stats, type IncomingFlight } from '../_data/stats';

const statusStyle: Record<IncomingFlight['status'], { label: string; color: string; bg: string }> = {
  'on-time':  { label: 'On time',    color: '#10B981', bg: 'rgba(16, 185, 129, 0.14)' },
  'delayed':  { label: 'Delayed',    color: '#F7B731', bg: 'rgba(247, 183, 49, 0.14)' },
  'boarding': { label: 'Boarding',   color: '#2EAFE8', bg: 'rgba(46, 175, 232, 0.14)' },
  'landing':  { label: 'Landing',    color: '#F5362F', bg: 'rgba(245, 54, 47, 0.14)' },
  'landed':   { label: 'Landed',     color: '#5A7394', bg: 'rgba(90, 115, 148, 0.12)' },
};

function formatEta(mins: number) {
  if (mins <= 0 && mins > -60) return `${Math.abs(mins)}m ago`;
  if (mins < 60) return `in ${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `in ${h}h ${m}m`;
}

export function FlightBoard() {
  const upcoming = [...stats.incomingFlights].sort((a, b) => a.etaMinutes - b.etaMinutes);
  const nextPax = upcoming.filter((f) => f.status !== 'landed').reduce((a, f) => a + f.pax, 0);

  return (
    <div>
      {/* Summary strip */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        <SummaryTile label="Next arrivals" value={upcoming.filter((f) => f.status !== 'landed').length.toString()} icon={Plane} color="#2EAFE8" />
        <SummaryTile label="PAX inbound"   value={nextPax.toLocaleString('en-MY')}                               icon={Users2} color="#F7B731" />
        <SummaryTile label="Landed today"  value={upcoming.filter((f) => f.status === 'landed').length.toString()} icon={MapPin} color="#10B981" />
        <SummaryTile label="Delays"        value={upcoming.filter((f) => f.status === 'delayed').length.toString()} icon={Clock}  color="#F5362F" />
      </div>

      {/* Airline-style board */}
      <div className="overflow-hidden rounded-xl border border-bayu-line">
        <div className="grid grid-cols-[110px_1fr_120px_80px_110px] gap-3 border-b border-bayu-line bg-bayu-bg2/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
          <div>Flight</div>
          <div>Origin</div>
          <div>Status</div>
          <div className="text-right">PAX</div>
          <div className="text-right">ETA</div>
        </div>

        <div className="divide-y divide-bayu-line/70">
          {upcoming.map((f, i) => {
            const s = statusStyle[f.status];
            const isLanding = f.status === 'landing';
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035, duration: 0.35 }}
                className={`grid grid-cols-[110px_1fr_120px_80px_110px] items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-bayu-bg2/50 ${
                  isLanding ? 'bg-bayu-coral/[0.07]' : ''
                }`}
              >
                {/* Flight no */}
                <div className="flex items-center gap-2">
                  <Plane className="h-3.5 w-3.5 text-bayu-sky" />
                  <span className="font-mono text-xs font-bold tracking-wider text-bayu-text">
                    {f.flightNo}
                  </span>
                </div>

                {/* Origin */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{f.flag}</span>
                    <span className="truncate text-sm font-medium text-bayu-text">{f.origin}</span>
                  </div>
                  <div className="text-[10px] text-bayu-textDim">{f.airline} · {f.aircraft}{f.gate ? ` · Gate ${f.gate}` : ''}</div>
                </div>

                {/* Status */}
                <div>
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold"
                    style={{ color: s.color, backgroundColor: s.bg }}
                  >
                    {isLanding && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: s.color, animation: 'bayuPulse 1.6s ease-out infinite' }}
                      />
                    )}
                    {s.label.toUpperCase()}
                  </span>
                </div>

                {/* PAX */}
                <div className="text-right font-mono text-xs text-bayu-textMuted tabular-nums">{f.pax}</div>

                {/* ETA */}
                <div
                  className="text-right font-mono text-xs font-bold tabular-nums"
                  style={{ color: isLanding ? s.color : f.status === 'landed' ? '#5A7394' : '#E6EEF7' }}
                >
                  {formatEta(f.etaMinutes)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-bayu-textDim">
        <span>Data: BKI ATC · MAVCOM · refreshes every 30s</span>
        <span>Next update: 28s</span>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-bayu-line bg-bayu-bg2/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
        <Icon className="h-3 w-3" style={{ color }} />
        <span>{label}</span>
      </div>
      <div className="mt-1 font-display text-lg font-bold text-bayu-text">{value}</div>
    </div>
  );
}
