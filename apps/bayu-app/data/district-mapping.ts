import { sabahDestinations } from './destinations';
import { sabahDistricts } from './sabah-districts';

// Polygon id → district id (ported verbatim from web's SabahOccupancy.tsx)
export const GEO_TO_DISTRICT: Record<string, string> = {
  d0:  'kinabatangan',
  d1:  'tongod',
  d2:  'nabawan',
  d3:  'lahaddatu',
  d4:  'beluran',
  d5:  'tawau',
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

export const HIGHLIGHTS_DISTRICT_ID = 'kudat';
export const CAPITAL_GEO_ID = 'd24';
export const SKIP_POLYGONS = new Set(['d6', 'd20', 'd29', 'd30', 'h4']);

// Per-polygon label offsets (source coords)
export const LABEL_OFFSETS: Record<string, { dx: number; dy: number }> = {
  d24: { dx: -8, dy: -14 }, // KK — pull NW
  d23: { dx: 8, dy: 10 },   // Penampang — push SE
  d34: { dx: -14, dy: 0 },  // Putatan — shift W
};

// Sipitang transform (derived in web). Kept as a fn so it's evaluated at module load.
export const SIPITANG_TRANSFORM = (() => {
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

// Airport overlay (source coords, pre-translate-y)
export const AIRPORTS: {
  code: string;
  name: string;
  cx: number;
  cy: number;
  pax: string;
  primary?: boolean;
  anchor: string;
}[] = [
  { code: 'BKI', name: 'Kota Kinabalu Intl', cx: 205, cy: 330, pax: '9.3M/yr', primary: true, anchor: 'kk' },
  { code: 'SDK', name: 'Sandakan',           cx: 545, cy: 322, pax: '1.2M/yr',                anchor: 'sandakan' },
  { code: 'TWU', name: 'Tawau',              cx: 486, cy: 560, pax: '1.0M/yr',                anchor: 'tawau' },
  { code: 'LDU', name: 'Lahad Datu',         cx: 610, cy: 464, pax: '284k/yr',                anchor: 'lahaddatu' },
  { code: 'KUD', name: 'Kudat',              cx: 320, cy: 125, pax: 'domestic',               anchor: 'kudat' },
];

export const AIRPORT_ANCHORED = new Set(AIRPORTS.map((a) => a.anchor));

// Island overlays
export const OFFSHORE_ISLANDS: {
  id: string;
  name: string;
  cx: number;
  cy: number;
  feat: string;
}[] = [
  { id: 'sipadan', name: 'Sipadan',       cx: 700, cy: 618, feat: 'World #1 dive' },
  { id: 'mabul',   name: 'Mabul',         cx: 675, cy: 608, feat: 'Macro diving' },
  { id: 'banggi',  name: 'Banggi',        cx: 420, cy:  80, feat: 'Largest island' },
  { id: 'layang',  name: 'Layang-Layang', cx:  55, cy: 210, feat: 'Atoll · remote' },
];

// Destination id → district id (derived from each destination's district name)
export const destinationToDistrict: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  sabahDestinations.forEach((d) => {
    const match = sabahDistricts.find(
      (dist) => dist.name.toLowerCase() === d.district.toLowerCase(),
    );
    if (match) map[d.id] = match.id;
  });
  return map;
})();
