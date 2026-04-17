'use client';

import { useMemo, useState } from 'react';
import { Eye, EyeOff, Map, Crosshair } from 'lucide-react';
import { TopBar } from '../../_components/TopBar';
import { Section } from '../../_components/Section';
import {
  SABAH_VIEWBOX,
  SABAH_CONTENT_TRANSLATE_Y,
  SABAH_DISTRICTS,
  SABAH_HIGHLIGHTS,
} from '../../_data/sabah-geo';
import { SIPITANG_PATH } from '../../_data/sipitang';
import { stats } from '../../_data/stats';

// Synthetic Sipitang placement — kept in sync with SabahOccupancy.tsx
const SIPITANG_TRANSFORM = (() => {
  const nativeMinX = 431;
  const nativeMinY = 189;
  const nativeW = 1243;
  const targetTLX = 84;
  const targetTLY = 82.5;
  const targetW = 78;
  const scale = targetW / nativeW;
  const tx = targetTLX - nativeMinX * scale;
  const ty = targetTLY - nativeMinY * scale;
  return `translate(${tx.toFixed(3)}, ${ty.toFixed(3)}) scale(${scale})`;
})();

// Kept in sync with SabahOccupancy.tsx — update both if you change anything.
const GEO_TO_DISTRICT: Record<string, string> = {
  d0:  'kinabatangan',
  d1:  'tongod',
  d2:  'nabawan',
  d3:  'lahaddatu',
  d4:  'beluran',
  d5:  'tawau',
  // d6 = Sarawak/Brunei, hidden
  d7:  'ranau',
  d8:  'keningau',
  d9:  'sandakan',
  d10: 'tenom',
  d11: 'telupid',
  d12: 'beaufort',
  d13: 'kotamarudu',
  d14: 'pitas',
  d15: 'kotabelud',
  d16: 'papar',
  d17: 'kunak',
  d18: 'tambunan',
  d19: 'tuaran',
  d20: 'sipitang',
  d21: 'semporna',
  d22: 'kualapenyu',
  d23: 'penampang',
  d24: 'kk',
  d25: 'semporna',
  d26: 'tawau',
  d27: 'pitas',
  d28: 'tawau',
  d31: 'semporna',
  d32: 'beluran',
  d33: 'sandakan',
  d34: 'putatan',
};

// Drop legend artifacts from the raw SVG (and d20 which is replaced by sipitang.svg)
const SKIP_POLYGONS = new Set(['d6', 'd20', 'd29', 'd30', 'h4']);

export default function SabahMapDebugPage() {
  const [showRaw, setShowRaw] = useState(true);
  const [showIds, setShowIds] = useState(true);
  const [showCentroids, setShowCentroids] = useState(true);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const districtsById = useMemo(() => {
    const m: Record<string, typeof stats.hotels.districts[number]> = {};
    stats.hotels.districts.forEach((d) => (m[d.id] = d));
    return m;
  }, []);

  const rows = useMemo(() => {
    const regular = SABAH_DISTRICTS
      .filter((g) => !SKIP_POLYGONS.has(g.id))
      .map((g) => ({
        geo: g,
        mappedId: GEO_TO_DISTRICT[g.id],
        data: GEO_TO_DISTRICT[g.id] ? districtsById[GEO_TO_DISTRICT[g.id]] : undefined,
      }));
    const kudatData = districtsById['kudat'];
    const kudatRows = SABAH_HIGHLIGHTS
      .filter((g) => !SKIP_POLYGONS.has(g.id))
      .map((g) => ({
        geo: g,
        mappedId: 'kudat',
        data: kudatData,
      }));
    return [...regular, ...kudatRows];
  }, [districtsById]);

  const vb = `${SABAH_VIEWBOX.x} ${SABAH_VIEWBOX.y} ${SABAH_VIEWBOX.width} ${SABAH_VIEWBOX.height}`;
  const ty = SABAH_CONTENT_TRANSLATE_Y;
  const active = hoverId ?? selectedId;

  return (
    <>
      <TopBar title="Sabah Map — Debug View" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-bayu-line bg-bayu-bg1 p-4">
            <Toggle label="Raw SVG backdrop" icon={Map} active={showRaw} onClick={() => setShowRaw(!showRaw)} />
            <Toggle label="Polygon IDs" icon={Eye} active={showIds} onClick={() => setShowIds(!showIds)} />
            <Toggle label="Centroids" icon={Crosshair} active={showCentroids} onClick={() => setShowCentroids(!showCentroids)} />
            <div className="ml-auto text-xs text-bayu-textMuted">
              {SABAH_DISTRICTS.length} polygons extracted · {Object.keys(GEO_TO_DISTRICT).length} mapped · viewBox {vb}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Map view */}
            <Section
              className="col-span-12 xl:col-span-8"
              title="Overlay view"
              subtitle="Our extracted polygons over the original SVG. Hover / click any polygon."
            >
              <div className="relative overflow-hidden rounded-xl border border-bayu-line bg-bayu-bg0">
                {/* Raw SVG as backdrop */}
                {showRaw && (
                  <img
                    src="/sabah/municipal.svg"
                    alt="Sabah municipal map (raw)"
                    className="absolute inset-0 w-full h-full object-contain opacity-70 pointer-events-none"
                    style={{ mixBlendMode: 'normal' }}
                  />
                )}

                {/* Our extracted polygons overlaid */}
                <svg
                  viewBox={vb}
                  preserveAspectRatio="xMidYMid meet"
                  className="relative w-full h-auto"
                >
                  <g transform={`translate(0, ${ty})`}>
                    {/* All polygons (regular districts + Kudat highlights) — same handler */}
                    {rows.map((r) => {
                      const isActive = active === r.geo.id;
                      return (
                        <path
                          key={r.geo.id}
                          d={r.geo.d}
                          fill={isActive ? 'rgba(46,175,232,0.55)' : r.mappedId ? 'rgba(16,185,129,0.18)' : 'rgba(245,54,47,0.18)'}
                          stroke={isActive ? '#FFFFFF' : r.mappedId ? '#10B981' : '#F5362F'}
                          strokeWidth={isActive ? 1.6 : 0.8}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoverId(r.geo.id)}
                          onMouseLeave={() => setHoverId(null)}
                          onClick={() => setSelectedId((s) => (s === r.geo.id ? null : r.geo.id))}
                        />
                      );
                    })}

                    {/* Synthetic Sipitang polygon (from sipitang.svg) */}
                    <g transform={SIPITANG_TRANSFORM}>
                      <path
                        d={SIPITANG_PATH}
                        fill={active === 'sipitang-synth' ? 'rgba(46,175,232,0.55)' : 'rgba(16,185,129,0.18)'}
                        stroke={active === 'sipitang-synth' ? '#FFFFFF' : '#10B981'}
                        strokeWidth={active === 'sipitang-synth' ? 30 : 16}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoverId('sipitang-synth')}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={() => setSelectedId((s) => (s === 'sipitang-synth' ? null : 'sipitang-synth'))}
                      />
                    </g>

                    {/* Centroid dots */}
                    {showCentroids &&
                      rows.map((r) => {
                        const cx = r.geo.cx;
                        const cy = r.geo.cy - ty;
                        return (
                          <g key={'c-' + r.geo.id} style={{ pointerEvents: 'none' }}>
                            <circle cx={cx} cy={cy} r={2.5} fill="#F7B731" stroke="#0B1A30" strokeWidth={0.6} />
                          </g>
                        );
                      })}

                    {/* Polygon IDs */}
                    {showIds &&
                      rows.map((r) => {
                        const cx = r.geo.cx;
                        const cy = r.geo.cy - ty;
                        return (
                          <text
                            key={'t-' + r.geo.id}
                            x={cx}
                            y={cy + 8}
                            textAnchor="middle"
                            fontSize={8}
                            fontWeight="800"
                            fill="#FFFFFF"
                            style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.8)', strokeWidth: 2, pointerEvents: 'none' }}
                          >
                            {r.geo.id}
                          </text>
                        );
                      })}
                  </g>
                </svg>

                {/* Legend — top-right */}
                <div className="pointer-events-none absolute top-3 right-3 rounded-md border border-bayu-line bg-bayu-bg0/95 p-3 text-[10px] text-bayu-textMuted backdrop-blur">
                  <div className="mb-1 font-semibold uppercase tracking-wider text-bayu-text">Legend</div>
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="h-3 w-3 rounded-sm border border-[#10B981]" style={{ background: 'rgba(16,185,129,0.2)' }} />
                    mapped district
                  </div>
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="h-3 w-3 rounded-sm border border-[#F5362F]" style={{ background: 'rgba(245,54,47,0.2)' }} />
                    unmapped polygon
                  </div>
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="h-3 w-3 rounded-sm border border-[#F7B731]" style={{ background: 'rgba(247,183,49,0.2)' }} />
                    highlight (#ffaaaa)
                  </div>
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-bayu-gold" />
                    centroid
                  </div>
                </div>

                {/* Active polygon card */}
                {active && (() => {
                  const row = active === 'sipitang-synth'
                    ? {
                        geo: { id: 'sipitang-synth', cx: 115, cy: 528, area: 0 },
                        mappedId: 'sipitang',
                        data: districtsById['sipitang'],
                      }
                    : rows.find((r) => r.geo.id === active);
                  if (!row) return null;
                  return (
                    <div className="absolute left-3 top-3 rounded-lg border border-bayu-line bg-bayu-bg0/95 p-3 text-xs backdrop-blur">
                      <PolygonInfo row={row} />
                    </div>
                  );
                })()}
              </div>
            </Section>

            {/* Side panel: polygon list */}
            <Section
              className="col-span-12 xl:col-span-4"
              title="All polygons"
              subtitle="Click a row to pin. Green = mapped, red = no data."
            >
              <div className="max-h-[640px] overflow-y-auto pr-1">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-bayu-bg1 z-10">
                    <tr className="text-left text-[10px] uppercase tracking-wider text-bayu-textDim">
                      <th className="py-2">ID</th>
                      <th>Mapping</th>
                      <th className="text-right">cx</th>
                      <th className="text-right">cy</th>
                      <th className="text-right">area</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bayu-line/60">
                    {rows
                      .slice()
                      .sort((a, b) => b.geo.area - a.geo.area)
                      .map((r) => {
                        const isActive = active === r.geo.id;
                        return (
                          <tr
                            key={r.geo.id}
                            className={`cursor-pointer transition ${isActive ? 'bg-bayu-ocean/15' : 'hover:bg-bayu-bg2/60'}`}
                            onMouseEnter={() => setHoverId(r.geo.id)}
                            onMouseLeave={() => setHoverId(null)}
                            onClick={() => setSelectedId((s) => (s === r.geo.id ? null : r.geo.id))}
                          >
                            <td className="py-2 pr-2">
                              <span className={`font-mono font-bold ${r.mappedId ? 'text-bayu-jungle' : 'text-bayu-coral'}`}>
                                {r.geo.id}
                              </span>
                            </td>
                            <td className="pr-2 text-bayu-text">
                              {r.data?.name ?? <span className="text-bayu-textDim italic">— unmapped —</span>}
                            </td>
                            <td className="text-right font-mono tabular-nums text-bayu-textMuted">
                              {r.geo.cx.toFixed(0)}
                            </td>
                            <td className="text-right font-mono tabular-nums text-bayu-textMuted">
                              {r.geo.cy.toFixed(0)}
                            </td>
                            <td className="text-right font-mono tabular-nums text-bayu-textMuted">
                              {r.geo.area.toFixed(0)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>

          {/* SW Polygon Gallery — isolate each polygon so user can identify Sipitang */}
          <Section
            title="SW Polygon Gallery"
            subtitle="Every polygon (mapped + skipped) with centroid cx < 260 and cy > 350. Click a card to pin. Red outline = unmapped."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {[
                ...SABAH_DISTRICTS.map((g) => ({
                  geo: g,
                  mappedId: GEO_TO_DISTRICT[g.id],
                  data: GEO_TO_DISTRICT[g.id] ? districtsById[GEO_TO_DISTRICT[g.id]] : undefined,
                  skipped: SKIP_POLYGONS.has(g.id),
                })),
                ...SABAH_HIGHLIGHTS.map((g) => ({
                  geo: g,
                  mappedId: 'kudat',
                  data: districtsById['kudat'],
                  skipped: SKIP_POLYGONS.has(g.id),
                })),
              ]
                .filter((r) => r.geo.cx < 260 && r.geo.cy > 350)
                .sort((a, b) => a.geo.cy - b.geo.cy || a.geo.cx - b.geo.cx)
                .map((r) => {
                  const isActive = active === r.geo.id;
                  // Per-polygon bbox-fit viewBox so each shape fills the card
                  // Use a generous pad around the polygon
                  const polyCxRel = r.geo.cx;
                  const polyCyRel = r.geo.cy - ty; // source y (without translate)
                  // Rough bbox half-size from area (assuming near-square)
                  const half = Math.max(40, Math.sqrt(r.geo.area) * 0.7);
                  const vbx = polyCxRel - half;
                  const vby = polyCyRel - half;
                  const vbw = half * 2;
                  const vbh = half * 2;
                  const statusTag = r.skipped
                    ? { label: 'SKIPPED', color: '#F5362F' }
                    : r.mappedId
                    ? { label: r.data?.name ?? r.mappedId, color: '#2EAFE8' }
                    : { label: 'UNMAPPED', color: '#F7B731' };
                  return (
                    <button
                      key={'gal-' + r.geo.id}
                      onClick={() => setSelectedId((s) => (s === r.geo.id ? null : r.geo.id))}
                      className={`flex flex-col overflow-hidden rounded-lg border transition ${
                        isActive
                          ? 'border-bayu-sky bg-bayu-ocean/15'
                          : 'border-bayu-line bg-bayu-bg1 hover:border-bayu-line2 hover:bg-bayu-bg2/60'
                      }`}
                    >
                      <div className="relative bg-bayu-bg0 aspect-square">
                        <svg
                          viewBox={`${vbx} ${vby} ${vbw} ${vbh}`}
                          preserveAspectRatio="xMidYMid meet"
                          className="w-full h-full"
                        >
                          <path
                            d={r.geo.d}
                            fill={statusTag.color + (r.skipped ? '55' : '88')}
                            stroke={statusTag.color}
                            strokeWidth={Math.max(0.6, vbw / 120)}
                          />
                          <circle cx={polyCxRel} cy={polyCyRel} r={Math.max(1.5, vbw / 80)} fill="#F7B731" stroke="#0B1A30" strokeWidth={0.5} />
                        </svg>
                      </div>
                      <div className="p-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-bayu-text">
                            {r.geo.id}
                          </span>
                          <span className="text-[10px] font-semibold uppercase" style={{ color: statusTag.color }}>
                            {statusTag.label}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[9px] text-bayu-textDim">
                          cx {r.geo.cx.toFixed(0)} · cy {r.geo.cy.toFixed(0)} · area {r.geo.area.toFixed(0)}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </Section>

          {/* Raw SVG in its own panel */}
          <Section
            title="Raw Sabah_municipal_map.svg"
            subtitle="Source of truth — compare against overlay above"
          >
            <div className="overflow-hidden rounded-xl border border-bayu-line bg-white">
              <img
                src="/sabah/municipal.svg"
                alt="Sabah municipal map (raw)"
                className="w-full h-auto"
              />
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function PolygonInfo({ row }: { row: { geo: { id: string; cx: number; cy: number; area: number }; mappedId?: string; data?: { name: string; occupancy: number; rooms: number } } }) {
  return (
    <div className="min-w-[200px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
        Polygon
      </div>
      <div className="font-display text-base font-bold text-bayu-text">{row.geo.id}</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-bayu-textMuted">
        <div><span className="text-bayu-textDim">cx</span><br/>{row.geo.cx.toFixed(1)}</div>
        <div><span className="text-bayu-textDim">cy</span><br/>{row.geo.cy.toFixed(1)}</div>
        <div><span className="text-bayu-textDim">area</span><br/>{row.geo.area.toFixed(0)}</div>
      </div>
      <div className="mt-3 border-t border-bayu-line pt-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
          Mapped to
        </div>
        {row.data ? (
          <>
            <div className="text-sm font-semibold text-bayu-text">{row.data.name}</div>
            <div className="text-[10px] text-bayu-textMuted">
              {row.data.occupancy}% occ · {row.data.rooms.toLocaleString('en-MY')} rooms
            </div>
          </>
        ) : (
          <div className="text-sm italic text-bayu-coral">— unmapped —</div>
        )}
      </div>
    </div>
  );
}

function Toggle({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition ${
        active
          ? 'border-bayu-sky bg-bayu-ocean/15 text-bayu-text'
          : 'border-bayu-line bg-bayu-bg2/40 text-bayu-textMuted hover:bg-bayu-bg2'
      }`}
    >
      {active ? <Icon className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
