'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Hotel, TrendingUp, Plane, Waves } from 'lucide-react';
import { stats } from '../_data/stats';
import {
  SABAH_VIEWBOX,
  SABAH_CONTENT_TRANSLATE_Y,
  SABAH_DISTRICTS,
  SABAH_HIGHLIGHTS,
} from '../_data/sabah-geo';

function mix(a: string, b: string, t: number) {
  const ha = a.replace('#', '');
  const hb = b.replace('#', '');
  const ra = parseInt(ha.slice(0, 2), 16), ga = parseInt(ha.slice(2, 4), 16), ba = parseInt(ha.slice(4, 6), 16);
  const rb = parseInt(hb.slice(0, 2), 16), gb = parseInt(hb.slice(2, 4), 16), bb = parseInt(hb.slice(4, 6), 16);
  const h = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return '#' + h(ra + (rb - ra) * t) + h(ga + (gb - ga) * t) + h(ba + (bb - ba) * t);
}

function occupancyColor(pct: number) {
  const t = Math.max(0, Math.min(1, pct / 100));
  if (t < 0.5) return mix('#12253F', '#2EAFE8', t * 2);
  if (t < 0.8) return mix('#2EAFE8', '#F7B731', (t - 0.5) / 0.3);
  return mix('#F7B731', '#F5362F', (t - 0.8) / 0.2);
}

// --- Overlay markers in rendered SVG coords (y already includes translate) ---
// Positions aligned against district polygon centroids:
//   KK (d21)       at (219, 317)  → BKI just SW
//   Sandakan (d8)  at (543, 326)
//   Tawau (d5)     at (486, 563)
//   Lahad Datu (d3)at (616, 466)
//   Kudat (d13)    at (380, 153)
//   Semporna (d19) at (630, 563)  → Sipadan / Mabul further SE
const AIRPORTS = [
  { code: 'BKI', name: 'Kota Kinabalu Intl',   cx: 205, cy: 330, pax: '9.3M/yr', primary: true,  anchor: 'kk' },
  { code: 'SDK', name: 'Sandakan',             cx: 545, cy: 322, pax: '1.2M/yr',                 anchor: 'sandakan' },
  { code: 'TWU', name: 'Tawau',                cx: 486, cy: 560, pax: '1.0M/yr',                 anchor: 'tawau' },
  { code: 'LDU', name: 'Lahad Datu',           cx: 610, cy: 464, pax: '284k/yr',                 anchor: 'lahaddatu' },
  { code: 'KUD', name: 'Kudat',                cx: 380, cy: 153, pax: 'domestic',                anchor: 'kudat' },
];

const ISLANDS = [
  { id: 'sipadan',  name: 'Sipadan',       cx: 700, cy: 618, feat: 'World #1 dive' },
  { id: 'mabul',    name: 'Mabul',         cx: 675, cy: 608, feat: 'Macro diving'  },
  { id: 'banggi',   name: 'Banggi',        cx: 420, cy:  80, feat: 'Largest island' },
  { id: 'layang',   name: 'Layang-Layang', cx:  55, cy: 210, feat: 'Atoll · remote' },
];

// Districts whose name/label is already shown via an airport marker — skip
// drawing the polygon label here to avoid double-labeling.
const AIRPORT_ANCHORED = new Set(AIRPORTS.map((a) => a.anchor));

// Hand-mapped: each polygon id → district id (from stats.hotels.districts).
// 32 polygons = 26 Sabah districts (#aaaaff + #5555ff highlights) + a few small
// decorative/overlap polygons left unmapped.
const GEO_TO_DISTRICT: Record<string, string> = {
  d0:  'kinabatangan', // (617,400) huge E-center river district
  d1:  'tongod',       // (366,453) large center-S
  d2:  'nabawan',      // (281,523) large interior-S
  d3:  'lahaddatu',    // (616,466) large E-S
  d4:  'beluran',      // (423,269) large NE
  d5:  'tawau',        // (486,563) large S coast — #5555ff highlighted
  d6:  'ranau',        // (327,306) interior N (Mt Kinabalu foot)
  d7:  'keningau',     // (236,426) interior center
  d8:  'sandakan',     // (543,326) E-center — #5555ff highlighted
  d9:  'beaufort',     // (175,485) W-S
  d10: 'telupid',      // (393,325) E interior
  d11: 'papar',        // (130,416) W coast south
  d12: 'kotamarudu',   // (337,203) N
  d13: 'kudat',        // (380,153) far N tip
  d14: 'kotabelud',    // (271,224) NW coast
  d15: 'penampang',    // (190,360) W coast, just S of KK
  d16: 'kunak',        // (554,525) SE coast
  d17: 'tambunan',     // (256,343) interior
  d18: 'tuaran',       // (242,275) NW coast
  d19: 'semporna',     // (630,563) far SE
  d20: 'kualapenyu',   // ( 92,391) SW coast peninsula
  d21: 'kk',           // (219,317) Kota Kinabalu — #5555ff highlighted
  d22: 'tenom',        // (635,532) — small, re-using for tenom
  d23: 'sipitang',     // (509,611) S coast — re-using
  d24: 'pitas',        // (441,160) N
  d25: 'putatan',      // (477,604) small S
};

// Per-polygon label overrides when the bbox centroid sits on a neighbor.
// KK is a very small polygon wedged between Tuaran (N) and Penampang (S),
// and its bbox centroid lands on Penampang's upper edge. Pull it up + left
// so it reads clearly inside the KK city area.
const LABEL_OFFSETS: Record<string, { dx: number; dy: number }> = {
  d21: { dx: -8,  dy: -14 }, // KK — pull NW into its actual footprint
  d15: { dx:  8,  dy:  10 }, // Penampang — push SE so it doesn't clash with KK
  d31: { dx: -14, dy:  0 },  // Putatan — shift west toward coast
};

function useDistrictsWithData() {
  return useMemo(() => {
    const byId: Record<string, typeof stats.hotels.districts[number]> = {};
    stats.hotels.districts.forEach((d) => (byId[d.id] = d));
    return SABAH_DISTRICTS.map((geo) => ({
      geo,
      data: byId[GEO_TO_DISTRICT[geo.id]],
    }));
  }, []);
}

export function SabahOccupancy() {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const paired = useDistrictsWithData();

  const allDistricts = stats.hotels.districts;
  const active = hoverId ? paired.find((p) => p.geo.id === hoverId) : null;
  const avgOccupancy = Math.round(
    allDistricts.reduce((a, d) => a + d.occupancy * d.rooms, 0) /
      allDistricts.reduce((a, d) => a + d.rooms, 0),
  );
  const totalRooms = allDistricts.reduce((a, d) => a + d.rooms, 0);

  const vb = `${SABAH_VIEWBOX.x} ${SABAH_VIEWBOX.y} ${SABAH_VIEWBOX.width} ${SABAH_VIEWBOX.height}`;
  const ty = SABAH_CONTENT_TRANSLATE_Y;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sabah district map */}
      <div className="col-span-12 lg:col-span-7">
        <div className="relative overflow-hidden rounded-xl border border-bayu-line bg-bayu-bg0">
          <svg viewBox={vb} preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
            <defs>
              <linearGradient id="occBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0B1A30" />
                <stop offset="100%" stopColor="#070F1E" />
              </linearGradient>
              <radialGradient id="landAura" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#096DBB" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#096DBB" stopOpacity="0" />
              </radialGradient>
              <filter id="hotGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ocean bg */}
            <rect x={SABAH_VIEWBOX.x} y={SABAH_VIEWBOX.y} width={SABAH_VIEWBOX.width} height={SABAH_VIEWBOX.height} fill="url(#occBg)" />

            {/* Grid */}
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={'gh-' + i} x1={SABAH_VIEWBOX.x} y1={SABAH_VIEWBOX.y + (SABAH_VIEWBOX.height / 16) * i} x2={SABAH_VIEWBOX.x + SABAH_VIEWBOX.width} y2={SABAH_VIEWBOX.y + (SABAH_VIEWBOX.height / 16) * i} stroke="#1F3A5F" strokeWidth={0.25} opacity={0.3} />
            ))}
            {Array.from({ length: 22 }).map((_, i) => (
              <line key={'gv-' + i} x1={SABAH_VIEWBOX.x + (SABAH_VIEWBOX.width / 22) * i} y1={SABAH_VIEWBOX.y} x2={SABAH_VIEWBOX.x + (SABAH_VIEWBOX.width / 22) * i} y2={SABAH_VIEWBOX.y + SABAH_VIEWBOX.height} stroke="#1F3A5F" strokeWidth={0.25} opacity={0.3} />
            ))}

            <circle cx={SABAH_VIEWBOX.x + SABAH_VIEWBOX.width * 0.45} cy={SABAH_VIEWBOX.y + SABAH_VIEWBOX.height * 0.5} r={SABAH_VIEWBOX.width * 0.35} fill="url(#landAura)" />

            {/* District polygons — apply the source translate */}
            <g transform={`translate(0, ${ty})`}>
              {/* Outlying highlights (Labuan, border islands) */}
              <g>
                {SABAH_HIGHLIGHTS.map((p) => (
                  <path key={p.id} d={p.d} fill="#1F3A5F" fillOpacity={0.55} stroke="#2A4F7D" strokeWidth={0.4} />
                ))}
              </g>

              {/* Heat-colored district polygons */}
              <g>
                {paired.map((p, i) => {
                  const isActive = hoverId === p.geo.id;
                  const occupancy = p.data?.occupancy ?? 58 + ((i * 7) % 25);
                  const color = occupancyColor(occupancy);
                  return (
                    <motion.path
                      key={p.geo.id}
                      d={p.geo.d}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isActive ? 1 : 0.9 }}
                      transition={{ delay: i * 0.04, duration: 0.5 }}
                      fill={color}
                      fillOpacity={p.data ? 0.88 : 0.5}
                      stroke={isActive ? '#FFFFFF' : '#0B1A30'}
                      strokeWidth={isActive ? 1.8 : 0.6}
                      style={{ cursor: 'pointer' }}
                      filter={occupancy >= 90 ? 'url(#hotGlow)' : undefined}
                      onMouseEnter={() => setHoverId(p.geo.id)}
                      onMouseLeave={() => setHoverId(null)}
                    />
                  );
                })}
              </g>

              {/* District name labels — skip anything anchored by an airport marker
                  or smaller than a floor so we don't pile text on tiny polygons. */}
              <g style={{ pointerEvents: 'none' }}>
                {paired.map((p) => {
                  if (!p.data) return null;
                  if (AIRPORT_ANCHORED.has(p.data.id)) return null;
                  if (p.geo.area < 2500) return null;
                  const occupancy = p.data.occupancy;
                  const offset = LABEL_OFFSETS[p.geo.id] ?? { dx: 0, dy: 0 };
                  const lx = p.geo.cx + offset.dx;
                  const ly = p.geo.cy - SABAH_CONTENT_TRANSLATE_Y + offset.dy;
                  // Scale label size loosely by polygon area so tiny polygons don't get clipped
                  const isTiny = p.geo.area < 4000;
                  const nameSize = isTiny ? 6 : 8;
                  const pctSize = isTiny ? 8 : 11;
                  // Show a small leader-dot at the true centroid for tiny polygons,
                  // so users see where the polygon actually sits.
                  return (
                    <g key={'lbl-' + p.geo.id}>
                      {isTiny && (offset.dx !== 0 || offset.dy !== 0) && (
                        <>
                          <circle
                            cx={p.geo.cx}
                            cy={p.geo.cy - SABAH_CONTENT_TRANSLATE_Y}
                            r={2}
                            fill="#FFFFFF"
                            stroke="#0B1A30"
                            strokeWidth={0.6}
                          />
                          <line
                            x1={p.geo.cx}
                            y1={p.geo.cy - SABAH_CONTENT_TRANSLATE_Y}
                            x2={lx}
                            y2={ly + 1}
                            stroke="#FFFFFF"
                            strokeOpacity={0.55}
                            strokeWidth={0.6}
                            strokeDasharray="1.5 1.2"
                          />
                        </>
                      )}
                      <text
                        x={lx}
                        y={ly - 1}
                        textAnchor="middle"
                        fontSize={pctSize}
                        fontWeight="800"
                        fill="#FFFFFF"
                        style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.85)', strokeWidth: 2.2 }}
                      >
                        {occupancy}%
                      </text>
                      <text
                        x={lx}
                        y={ly + nameSize + 2}
                        textAnchor="middle"
                        fontSize={nameSize}
                        fontWeight="700"
                        fill="#E6EEF7"
                        style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.85)', strokeWidth: 2 }}
                      >
                        {p.data.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            </g>

            {/* Airport markers (rendered coords — already in viewBox space) */}
            <g>
              {AIRPORTS.map((a) => (
                <g key={a.code}>
                  {a.primary && (
                    <>
                      <circle cx={a.cx} cy={a.cy} r={14} fill="#F7B731" opacity={0.2}>
                        <animate attributeName="r" from="8" to="18" dur="1.6s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.4" to="0" dur="1.6s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                  <circle cx={a.cx} cy={a.cy} r={a.primary ? 7 : 5} fill={a.primary ? '#F7B731' : '#E6EEF7'} stroke="#0B1A30" strokeWidth={1.2} />
                  <text x={a.cx} y={a.cy + 2} textAnchor="middle" fontSize={a.primary ? 7 : 6} fontWeight="700" fill="#0B1A30">
                    ✈
                  </text>
                  <text x={a.cx + 9} y={a.cy - 6} fontSize={9} fontWeight="800" fill="#F7B731" style={{ paintOrder: 'stroke', stroke: '#070F1E', strokeWidth: 2 }}>
                    {a.code}
                  </text>
                  <text x={a.cx + 9} y={a.cy + 4} fontSize={7} fontWeight="500" fill="#E6EEF7" style={{ paintOrder: 'stroke', stroke: '#070F1E', strokeWidth: 2 }}>
                    {a.name}
                  </text>
                </g>
              ))}
            </g>

            {/* Island markers */}
            <g>
              {ISLANDS.map((isl) => (
                <g key={isl.id}>
                  <circle cx={isl.cx} cy={isl.cy} r={4} fill="#2EAFE8" stroke="#0B1A30" strokeWidth={1} />
                  <circle cx={isl.cx} cy={isl.cy} r={8} fill="none" stroke="#2EAFE8" strokeWidth={0.8} strokeDasharray="2 1.5" opacity={0.6} />
                  <text x={isl.cx} y={isl.cy - 10} textAnchor="middle" fontSize={8} fontWeight="700" fill="#2EAFE8" style={{ paintOrder: 'stroke', stroke: '#070F1E', strokeWidth: 2.5 }}>
                    {isl.name}
                  </text>
                </g>
              ))}
            </g>

            {/* Title */}
            <text x={SABAH_VIEWBOX.x + 15} y={SABAH_VIEWBOX.y + 22} fontSize={9} fontWeight="800" letterSpacing={1.5} fill="#8FA3B8">
              SABAH · ACCOMMODATION INDEX
            </text>
            <text x={SABAH_VIEWBOX.x + 15} y={SABAH_VIEWBOX.y + 32} fontSize={7} fontWeight="600" fill="#5A7394">
              {allDistricts.length} districts · 5 airports · key dive islands
            </text>
          </svg>

          {/* Active district popup */}
          {active && active.data && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-3 top-3 rounded-lg border border-bayu-line bg-bayu-bg0/95 p-3 text-xs backdrop-blur"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
                District
              </div>
              <div className="mt-0.5 font-display text-base font-bold text-bayu-text">
                {active.data.name}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold" style={{ color: occupancyColor(active.data.occupancy) }}>
                  {active.data.occupancy}%
                </span>
                <span className="text-[10px] text-bayu-textMuted">occupancy</span>
              </div>
              <div className="mt-1 text-[10px] text-bayu-textDim">{active.data.rooms.toLocaleString('en-MY')} rooms</div>
            </motion.div>
          )}

          {/* Legend */}
          <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1 rounded-md border border-bayu-line bg-bayu-bg0/90 px-2 py-1.5 text-[9px] text-bayu-textMuted">
            <div className="flex items-center gap-2">
              <span>Low</span>
              <div className="flex h-2 w-20 overflow-hidden rounded">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} style={{ backgroundColor: occupancyColor(i * 5), flex: 1 }} />
                ))}
              </div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <Plane className="h-2.5 w-2.5 text-bayu-gold" />
              <span>Airport</span>
              <Waves className="ml-1 h-2.5 w-2.5 text-bayu-sky" />
              <span>Island</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Rate index + metrics */}
      <div className="col-span-12 lg:col-span-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MetricTile label="State-wide occupancy" value={`${avgOccupancy}%`} sub={`${totalRooms.toLocaleString('en-MY')} rooms`} color="#2EAFE8" />
          <MetricTile label="RevPAR" value={`RM ${stats.hotels.revPar}`} sub={`+${stats.hotels.revParYoY}% YoY`} color="#F7B731" />
        </div>

        <div className="rounded-xl border border-bayu-line bg-bayu-bg2/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Hotel className="h-3.5 w-3.5 text-bayu-sky" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">Average Daily Rate by tier</h3>
            <span className="ml-auto inline-flex items-center gap-0.5 rounded bg-bayu-jungle/15 px-1.5 py-0.5 text-[10px] font-bold text-bayu-jungle">
              <TrendingUp className="h-3 w-3" />+{stats.hotels.adrYoY}%
            </span>
          </div>

          <div className="space-y-3">
            {stats.hotels.rateIndex.map((r, i) => {
              const max = Math.max(...stats.hotels.rateIndex.map((x) => x.avgRate));
              const pct = (r.avgRate / max) * 100;
              return (
                <motion.div key={r.stars} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex gap-0.5 text-bayu-gold">
                        {Array.from({ length: r.stars }).map((_, j) => <span key={j}>★</span>)}
                      </span>
                      <span className="text-xs text-bayu-textMuted">hotels</span>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-sm font-bold text-bayu-text tabular-nums">RM {r.avgRate.toLocaleString('en-MY')}</span>
                      <span className="ml-2 text-[10px] font-bold text-bayu-jungle">+{r.yoy.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bayu-bg2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.2 + i * 0.08, duration: 0.7 }} className="h-full rounded-full bg-gradient-to-r from-bayu-gold to-bayu-goldlight" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-bayu-line bg-bayu-bg2/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">Forward bookings (next 30d)</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-bayu-text">{stats.hotels.forwardBookings}%</span>
                <span className="text-xs text-bayu-textMuted">of inventory</span>
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-bayu-bg2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${stats.hotels.forwardBookings}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-bayu-ocean via-bayu-sky to-bayu-gold" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl border border-bayu-line bg-bayu-bg2/40 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="mt-0.5 text-[10px] text-bayu-textMuted">{sub}</div>
    </div>
  );
}
