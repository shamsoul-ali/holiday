'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MALAYSIA_STATES, MALAYSIA_VIEWBOX } from '../_data/malaysia-map';
import { stats, BKI_COORDS, type FlightPath } from '../_data/stats';

const VB_PAD_X = 20;
const VB_PAD_Y = 30;
const VB_W = MALAYSIA_VIEWBOX.width + VB_PAD_X * 2;
const VB_H = MALAYSIA_VIEWBOX.height + VB_PAD_Y * 2;
const VB_X = -VB_PAD_X;
const VB_Y = -VB_PAD_Y;

// ---------- color helpers --------------------------------------------------
function hex2rgb(h: string): [number, number, number] {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function rgb2hex(r: number, g: number, b: number) {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + h(r) + h(g) + h(b);
}
function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hex2rgb(a);
  const [r2, g2, b2] = hex2rgb(b);
  return rgb2hex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

function bezierPath(x0: number, y0: number, x1: number, y1: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const nx = -dy / dist;
  const ny = dx / dist;
  const lift = Math.min(dist * 0.22, 70);
  const cx = mx + nx * lift;
  const cy = my + ny * lift - 5;
  return `M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`;
}

// ---------- main component -------------------------------------------------
export function MalaysiaMap({
  className = '',
  highlightFlightId,
  onFlightClick,
}: {
  className?: string;
  highlightFlightId?: string | null;
  onFlightClick?: (flightId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const maxOrigin = useMemo(
    () => Math.max(...stats.domesticOrigins.map((o) => o.visitors)),
    [],
  );
  const originMap = useMemo(() => {
    const m: Record<string, number> = {};
    stats.domesticOrigins.forEach((o) => (m[o.stateCode] = o.visitors));
    return m;
  }, []);

  function stateFill(stateId: string) {
    if (stateId === 'MY12') return '#F7B731'; // Sabah (destination)
    const v = originMap[stateId] ?? 0;
    if (v === 0) return '#1A3053';
    const t = Math.pow(v / maxOrigin, 0.7);
    return mix('#1F3A5F', '#2EAFE8', t);
  }

  const activeState = hover ?? selected;
  const activeStateMeta = activeState ? MALAYSIA_STATES.find((s) => s.id === activeState) : null;
  const activeOrigin = activeState
    ? stats.domesticOrigins.find((o) => o.stateCode === activeState)
    : null;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto"
      >
        <defs>
          <radialGradient id="sabahGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F7B731" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F7B731" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="seaBG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B1A30" />
            <stop offset="100%" stopColor="#070F1E" />
          </linearGradient>
          <radialGradient id="cornerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#096DBB" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#096DBB" stopOpacity="0" />
          </radialGradient>
          <filter id="stateShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" />
            <feOffset dy="1.5" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.35" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sea bg */}
        <rect x={VB_X} y={VB_Y} width={VB_W} height={VB_H} fill="url(#seaBG)" />
        {/* Corner glows */}
        <circle cx={VB_W * 0.15 + VB_X} cy={VB_H * 0.3 + VB_Y} r={180} fill="url(#cornerGlow)" />
        <circle cx={VB_W * 0.85 + VB_X} cy={VB_H * 0.85 + VB_Y} r={180} fill="url(#cornerGlow)" />

        {/* Grid lines */}
        <g opacity={0.08}>
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={VB_X}
              y1={VB_Y + (VB_H / 10) * i}
              x2={VB_X + VB_W}
              y2={VB_Y + (VB_H / 10) * i}
              stroke="#2EAFE8"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={VB_X + (VB_W / 20) * i}
              y1={VB_Y}
              x2={VB_X + (VB_W / 20) * i}
              y2={VB_Y + VB_H}
              stroke="#2EAFE8"
              strokeWidth={0.5}
            />
          ))}
        </g>

        {/* Sabah aura */}
        <circle cx={BKI_COORDS.x} cy={BKI_COORDS.y} r={90} fill="url(#sabahGlow)" />

        {/* State paths */}
        <g filter="url(#stateShadow)">
          {MALAYSIA_STATES.map((s, i) => {
            const isActive = activeState === s.id;
            const dimmed = activeState && !isActive;
            return (
              <motion.path
                key={s.id}
                d={s.d}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: dimmed ? 0.4 : 1,
                  scale: isActive ? 1.01 : 1,
                }}
                transition={{ delay: i * 0.02, duration: 0.5 }}
                fill={stateFill(s.id)}
                stroke={isActive ? '#FFFFFF' : '#0B1A30'}
                strokeWidth={isActive ? 1.5 : 0.7}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelected((curr) => (curr === s.id ? null : s.id))}
              />
            );
          })}
        </g>

        {/* Flight paths */}
        <g>
          {stats.flightPaths.map((fp, i) => (
            <FlightArc
              key={fp.id}
              fp={fp}
              delayMs={i * 180}
              highlighted={!highlightFlightId || highlightFlightId === fp.id}
            />
          ))}
        </g>

        {/* Origin markers */}
        <g>
          {stats.flightPaths.map((fp) => (
            <OriginMarker
              key={`om-${fp.id}`}
              fp={fp}
              highlighted={!highlightFlightId || highlightFlightId === fp.id}
              onClick={onFlightClick ? () => onFlightClick(fp.id) : undefined}
            />
          ))}
        </g>

        {/* BKI destination */}
        <DestinationPulse cx={BKI_COORDS.x} cy={BKI_COORDS.y} />
        <text
          x={BKI_COORDS.x}
          y={BKI_COORDS.y - 22}
          fontSize={13}
          fontWeight="700"
          fill="#FFD97A"
          textAnchor="middle"
          style={{ letterSpacing: 0.3 }}
        >
          🏝️ Sabah · BKI
        </text>
      </svg>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-lg border border-bayu-line bg-bayu-bg0/90 p-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-2 overflow-hidden rounded">
            <div className="w-3 bg-[#1F3A5F]" />
            <div className="w-3 bg-[#2A6699]" />
            <div className="w-3 bg-[#2EAFE8]" />
          </div>
          <span className="text-[10px] font-medium text-bayu-textMuted">Domestic → Sabah</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-bayu-gold shadow-[0_0_8px] shadow-bayu-gold" />
          <span className="text-[10px] font-medium text-bayu-textMuted">Destination</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 border-t border-dashed border-bayu-gold" />
          <span className="text-[10px] font-medium text-bayu-textMuted">Active flight route</span>
        </div>
      </div>

      {/* Active state info */}
      {activeStateMeta && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-4 top-4 rounded-lg border border-bayu-line bg-bayu-bg0/95 p-3 backdrop-blur max-w-[240px]"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
            {activeStateMeta.id === 'MY12' ? 'Destination' : 'Origin market'}
          </div>
          <div className="mt-0.5 font-display text-base font-bold text-bayu-text">{activeStateMeta.name}</div>
          {activeStateMeta.id === 'MY12' ? (
            <>
              <div className="mt-2 text-2xl font-bold text-bayu-gold">
                {(stats.totalVisitors / 1_000_000).toFixed(2)}M
              </div>
              <div className="text-[11px] text-bayu-textMuted">annual arrivals</div>
            </>
          ) : activeOrigin && activeOrigin.visitors > 0 ? (
            <>
              <div className="mt-2 text-2xl font-bold text-bayu-sky">
                {activeOrigin.visitors.toLocaleString('en-MY')}
              </div>
              <div className="text-[11px] text-bayu-textMuted">visitors/year → Sabah</div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-bayu-bg2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-bayu-ocean to-bayu-sky"
                  style={{ width: `${(activeOrigin.visitors / maxOrigin) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <div className="mt-2 text-[11px] text-bayu-textDim">No outbound-to-Sabah tracking</div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ---------- flight arc (animated dashed bezier) ----------------------------
function FlightArc({ fp, delayMs, highlighted = true }: { fp: FlightPath; delayMs: number; highlighted?: boolean }) {
  const d = useMemo(() => bezierPath(fp.x0, fp.y0, BKI_COORDS.x, BKI_COORDS.y), [fp]);
  const opacity = highlighted ? 1 : 0.15;
  return (
    <g style={{ opacity, transition: 'opacity 0.3s' }}>
      <path d={d} stroke="#096DBB" strokeOpacity={0.2} strokeWidth={0.6} fill="none" />
      <path
        d={d}
        stroke="#F7B731"
        strokeWidth={highlighted ? 1.8 : 1.2}
        fill="none"
        strokeDasharray="6 6"
        className="animate-bayu-dash"
        style={{ animationDelay: `${delayMs}ms`, filter: 'drop-shadow(0 0 3px rgba(247, 183, 49, 0.6))' }}
      />
    </g>
  );
}

// ---------- origin marker --------------------------------------------------
function OriginMarker({
  fp,
  highlighted = true,
  onClick,
}: {
  fp: FlightPath;
  highlighted?: boolean;
  onClick?: () => void;
}) {
  const below = fp.y0 < 60;
  const ty = below ? fp.y0 + 22 : fp.y0 - 12;
  const opacity = highlighted ? 1 : 0.3;
  return (
    <g style={{ opacity, cursor: onClick ? 'pointer' : 'default', transition: 'opacity 0.3s' }} onClick={onClick}>
      <circle cx={fp.x0} cy={fp.y0} r={4} fill="#2EAFE8" opacity={0.25} className="animate-bayu-pulse" />
      <circle cx={fp.x0} cy={fp.y0} r={3.5} fill="#E6EEF7" stroke="#2EAFE8" strokeWidth={1.2} />
      <text
        x={fp.x0}
        y={ty}
        fontSize={10}
        fontWeight="700"
        fill="#E6EEF7"
        textAnchor="middle"
        style={{ letterSpacing: 0.2 }}
      >
        {fp.flag} {fp.originLabel}
      </text>
      <text
        x={fp.x0}
        y={ty + 10}
        fontSize={8}
        fontWeight="500"
        fill="#8FA3B8"
        textAnchor="middle"
      >
        {fp.flightsPerWeek} flt/wk
      </text>
    </g>
  );
}

// ---------- destination pulse ---------------------------------------------
function DestinationPulse({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="#F7B731" opacity={0.35} className="animate-bayu-pulse" />
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill="#F7B731"
        opacity={0.35}
        className="animate-bayu-pulse"
        style={{ animationDelay: '800ms' }}
      />
      <circle cx={cx} cy={cy} r={7} fill="#F7B731" stroke="#FFFFFF" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={3} fill="#FFFFFF" />
    </g>
  );
}
