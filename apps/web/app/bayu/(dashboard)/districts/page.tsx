'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Hotel, Users, MapPin, AlertTriangle } from 'lucide-react';
import { TopBar } from '../../_components/TopBar';
import { Section } from '../../_components/Section';
import { SabahOccupancy } from '../../_components/SabahOccupancy';
import { stats } from '../../_data/stats';

// Synthetic per-district attraction + alert data for the demo
const DISTRICT_EXTRAS: Record<string, { attractions: string[]; alerts?: { level: 'info' | 'warning'; msg: string } }> = {
  kk:            { attractions: ['Signal Hill Observatory', 'Mari Mari Cultural Village', 'Gaya Street Sunday Market'] },
  sandakan:      { attractions: ['Sepilok Orangutan Sanctuary', 'Sandakan Memorial Park', 'Turtle Islands Park'] },
  semporna:      { attractions: ['Sipadan Island', 'Mabul Island', 'Bajau Laut stilt village'], alerts: { level: 'info', msg: 'Dive permits 94% utilised · waitlist 3 days' } },
  ranau:         { attractions: ['Mt Kinabalu summit climb', 'Poring Hot Springs', 'Kundasang War Memorial'], alerts: { level: 'warning', msg: 'Summit trail weather-closed until 14:00' } },
  kinabatangan:  { attractions: ['Kinabatangan River Safari', 'Sukau Rainforest Lodge', 'Gomantong Caves'] },
  tawau:         { attractions: ['Tawau Hills Park', 'Bell Tower', 'Sabah tea estates'] },
  papar:         { attractions: ['Papar railway', 'Kawang Forest Reserve', 'Klias Wetlands proboscis monkeys'] },
  lahaddatu:     { attractions: ['Danum Valley Conservation Area', 'Madai Caves', 'Tabin Wildlife Reserve'] },
  keningau:      { attractions: ['Keningau Heritage Park', 'Crocker Range Park', 'Murut longhouse homestay'] },
  kudat:         { attractions: ['Tip of Borneo (Tanjung Simpang Mengayau)', 'Rungus longhouse', 'Kelambu Beach'] },
  tuaran:        { attractions: ['Mengkabong Water Village', 'Tamparuli tamu market', 'Karambunai peninsula'] },
  penampang:     { attractions: ['Babagon Dam', 'Kadazan cultural sites', 'Monsopiad Cultural Village'] },
  beluran:       { attractions: ['Kinabatangan upper reaches', 'Pin-Supu Forest', 'remote longhouse stays'] },
  kotabelud:     { attractions: ['Bajau horsemen Sunday tamu', 'Usukan Bay', 'Mantanani Island gateway'] },
  tenom:         { attractions: ['Sabah Agricultural Park', 'Tenom coffee', 'Murut cultural centre'] },
  tambunan:      { attractions: ['Mahua Waterfall', 'Crocker Range scenic', 'Rafflesia sanctuary'] },
  kunak:         { attractions: ['Madai beach', 'Bird sanctuary', 'Sea gypsy villages'] },
  putatan:       { attractions: ['Petagas War Memorial', 'Sabah Art Gallery', 'Coastal promenade'] },
  kotamarudu:    { attractions: ['Bongon Beach', 'Mount Nombuyukong', 'Rungus cultural tamu'] },
  beaufort:      { attractions: ['Padas River rafting', 'Beaufort town', 'Bukit Perahu viewpoint'] },
  sipitang:      { attractions: ['Mendolong Lake', 'Menumbok ferry (to Labuan)', 'Crocker Range southern tip'] },
  pitas:         { attractions: ['Jambongan Island', 'Mangrove boardwalks', 'Bajau pearl farms'] },
  kualapenyu:    { attractions: ['Tempurung Seaside Lodge', 'Tanjung Aru inlet', 'Klias Peninsula wetlands'] },
  nabawan:       { attractions: ['Murut heartland', 'Pinangah Forest Reserve', 'longhouse stays'] },
  telupid:       { attractions: ['Labuk Valley', 'Mt Tingkar', 'rural homestays'] },
  tongod:        { attractions: ['Tongod Forest Reserve', 'Lungmanis river', 'village homestays'] },
};

export default function DistrictsPage() {
  const [sort, setSort] = useState<'visitors' | 'growth' | 'occupancy' | 'rooms'>('visitors');
  const [selected, setSelected] = useState<string>('kk');

  // Join district data with extras + district-level table
  const rows = stats.hotels.districts.map((d) => {
    const topDistrict = stats.topDistricts.find((td) => td.name.toLowerCase().replace(/\s+/g, '') === d.id);
    return {
      ...d,
      visitors: topDistrict?.visitors ?? Math.round(d.rooms * 180 + 20000),
      growth: topDistrict?.growth ?? 6 + ((d.id.charCodeAt(0) * 3) % 10),
      extras: DISTRICT_EXTRAS[d.id],
    };
  });

  const sorted = [...rows].sort((a, b) => (b as any)[sort] - (a as any)[sort]);
  const totalRooms = rows.reduce((a, d) => a + d.rooms, 0);
  const avgOcc = Math.round(rows.reduce((a, d) => a + d.occupancy * d.rooms, 0) / totalRooms);
  const activeRow = rows.find((r) => r.id === selected) ?? rows[0];

  return (
    <>
      <TopBar title="District Performance" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
          {/* Strip */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Strip label="Districts tracked" value={rows.length.toString()} sub="across Sabah" accent="#2EAFE8" icon={MapPin} />
            <Strip label="Total rooms" value={totalRooms.toLocaleString('en-MY')} sub="hotel inventory" accent="#F7B731" icon={Hotel} />
            <Strip label="Weighted occupancy" value={`${avgOcc}%`} sub="state-wide avg" accent="#10B981" icon={TrendingUp} />
            <Strip label="Annual arrivals" value={`${(stats.totalVisitors / 1_000_000).toFixed(2)}M`} sub="district-attributed" accent="#A78BFA" icon={Users} />
          </div>

          {/* Map */}
          <Section
            title="Sabah Accommodation Map"
            subtitle="Heatmap by occupancy · hover any district"
            live
          >
            <SabahOccupancy />
          </Section>

          {/* Table + Detail */}
          <div className="grid grid-cols-12 gap-6">
            <Section
              className="col-span-12 xl:col-span-7"
              title="All districts"
              subtitle="Sort by any column · click a row to pin"
            >
              <div className="overflow-hidden rounded-xl border border-bayu-line">
                <div className="grid grid-cols-[32px_1fr_90px_80px_90px_90px] gap-2 border-b border-bayu-line bg-bayu-bg2/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
                  <div>#</div>
                  <div>District</div>
                  <SortHead label="Visitors" k="visitors" current={sort} onSort={setSort} />
                  <SortHead label="Occ" k="occupancy" current={sort} onSort={setSort} />
                  <SortHead label="Rooms" k="rooms" current={sort} onSort={setSort} />
                  <SortHead label="YoY" k="growth" current={sort} onSort={setSort} />
                </div>
                <div className="max-h-[480px] overflow-y-auto divide-y divide-bayu-line/70">
                  {sorted.map((d, i) => {
                    const isActive = selected === d.id;
                    return (
                      <motion.button
                        key={d.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.015 }}
                        onClick={() => setSelected(d.id)}
                        className={`grid w-full grid-cols-[32px_1fr_90px_80px_90px_90px] items-center gap-2 px-4 py-2.5 text-left text-xs transition ${
                          isActive ? 'bg-bayu-ocean/15' : 'hover:bg-bayu-bg2/50'
                        }`}
                      >
                        <div className="font-mono text-bayu-textDim">{i + 1}</div>
                        <div className="truncate font-semibold text-bayu-text">{d.name}</div>
                        <div className="text-right font-mono tabular-nums text-bayu-text">
                          {(d.visitors / 1000).toFixed(0)}K
                        </div>
                        <div className="text-right">
                          <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold"
                                style={{
                                  color: d.occupancy >= 85 ? '#F7B731' : '#E6EEF7',
                                  backgroundColor: d.occupancy >= 85 ? 'rgba(247,183,49,0.15)' : 'rgba(143,163,184,0.12)',
                                }}>
                            {d.occupancy}%
                          </span>
                        </div>
                        <div className="text-right font-mono tabular-nums text-bayu-textMuted">
                          {d.rooms.toLocaleString('en-MY')}
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${d.growth >= 10 ? 'text-bayu-jungle' : d.growth >= 0 ? 'text-bayu-sky' : 'text-bayu-coral'}`}>
                            {d.growth >= 0 ? '+' : ''}{d.growth.toFixed(1)}%
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </Section>

            <Section
              className="col-span-12 xl:col-span-5"
              title={activeRow.name}
              subtitle={`${activeRow.occupancy}% occupancy · ${activeRow.rooms.toLocaleString('en-MY')} rooms · +${activeRow.growth.toFixed(1)}% YoY`}
            >
              <div className="space-y-4">
                {activeRow.extras?.alerts && (
                  <div
                    className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                      activeRow.extras.alerts.level === 'warning'
                        ? 'border-bayu-gold/50 bg-bayu-gold/10 text-bayu-gold'
                        : 'border-bayu-sky/40 bg-bayu-sky/10 text-bayu-sky'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-px" />
                    <span className="text-bayu-text">{activeRow.extras.alerts.msg}</span>
                  </div>
                )}

                <div className="rounded-lg border border-bayu-line bg-bayu-bg2/40 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
                    Top attractions
                  </h3>
                  <ul className="space-y-1.5 text-sm">
                    {(activeRow.extras?.attractions ?? ['Attractions data coming soon']).map((a) => (
                      <li key={a} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bayu-gold" />
                        <span className="text-bayu-text">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatBlock label="Visitors" value={activeRow.visitors.toLocaleString('en-MY')} sub="annual" />
                  <StatBlock label="Avg stay" value={`${(3.8 + ((activeRow.id.charCodeAt(0) % 5) * 0.3)).toFixed(1)}d`} sub="per visitor" />
                  <StatBlock
                    label="RM per room"
                    value={`${(activeRow.occupancy * 4.8).toFixed(0)}`}
                    sub="daily ADR estimate"
                  />
                  <StatBlock
                    label="Rank (by rooms)"
                    value={`#${rows.sort((a,b)=>b.rooms-a.rooms).findIndex(r => r.id === activeRow.id) + 1}`}
                    sub={`of ${rows.length}`}
                  />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}

function Strip({ label, value, sub, accent, icon: Icon }: { label: string; value: string; sub: string; accent: string; icon: any }) {
  return (
    <div className="rounded-xl border border-bayu-line bg-bayu-bg1 p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
        <Icon className="h-3 w-3" style={{ color: accent }} />
        <span>{label}</span>
      </div>
      <div className="mt-1 font-display text-2xl font-bold" style={{ color: accent }}>{value}</div>
      <div className="text-[10px] text-bayu-textMuted">{sub}</div>
    </div>
  );
}

function SortHead({ label, k, current, onSort }: { label: string; k: 'visitors' | 'growth' | 'occupancy' | 'rooms'; current: string; onSort: (k: any) => void }) {
  return (
    <button
      onClick={() => onSort(k)}
      className={`text-right ${current === k ? 'text-bayu-sky' : 'text-bayu-textDim hover:text-bayu-text'}`}
    >
      {label}
    </button>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-bayu-line bg-bayu-bg2/40 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-bayu-text">{value}</div>
      <div className="text-[10px] text-bayu-textMuted">{sub}</div>
    </div>
  );
}
