import { CrowdLevel } from '@/types';
import { sabahDestinations } from './destinations';
import { foodSpots } from './food-spots';
import { sabahEvents } from './events';
import { safetyAlerts } from './safety';
import { sabahIslands } from './islands';

export interface SabahDistrictMeta {
  id: string;
  name: string;
  occupancy: number;
  rooms: number;
  crowdLevel: CrowdLevel;
  destinationIds: string[];
  tagline?: string;
}

// Hand-crafted 26-district meta for demo. Occupancy values tell a coherent
// story: Semporna peaks (Sipadan dive season), KK capital is high,
// Lahad Datu / Kudat are quiet, interior districts variable.
const baseDistricts: Omit<SabahDistrictMeta, 'crowdLevel'>[] = [
  { id: 'kk', name: 'Kota Kinabalu', occupancy: 87, rooms: 8400, destinationIds: ['mari-mari', 'tar-park'], tagline: 'Capital · gateway city' },
  { id: 'penampang', name: 'Penampang', occupancy: 72, rooms: 1800, destinationIds: [], tagline: 'Kadazan cultural heartland' },
  { id: 'putatan', name: 'Putatan', occupancy: 68, rooms: 600, destinationIds: [], tagline: 'KK southern suburb' },
  { id: 'tuaran', name: 'Tuaran', occupancy: 64, rooms: 900, destinationIds: [], tagline: 'Coastal town · Mantanani gateway' },
  { id: 'kotabelud', name: 'Kota Belud', occupancy: 54, rooms: 450, destinationIds: [], tagline: 'Horse town · weekly tamu' },
  { id: 'kotamarudu', name: 'Kota Marudu', occupancy: 48, rooms: 300, destinationIds: [], tagline: 'Paddy fields · route to Kudat' },
  { id: 'kudat', name: 'Kudat', occupancy: 58, rooms: 900, destinationIds: ['tip-of-borneo'], tagline: 'Tip of Borneo · Banggi Island' },
  { id: 'pitas', name: 'Pitas', occupancy: 42, rooms: 180, destinationIds: [], tagline: 'Mangrove coasts · remote' },
  { id: 'ranau', name: 'Ranau', occupancy: 81, rooms: 2400, destinationIds: ['kinabalu', 'kundasang', 'poring'], tagline: 'Mt Kinabalu · highland cool' },
  { id: 'tambunan', name: 'Tambunan', occupancy: 56, rooms: 320, destinationIds: [], tagline: 'Rafflesia country · Crocker Range' },
  { id: 'keningau', name: 'Keningau', occupancy: 61, rooms: 780, destinationIds: [], tagline: 'Interior hub · Murut culture' },
  { id: 'tenom', name: 'Tenom', occupancy: 52, rooms: 220, destinationIds: [], tagline: 'Coffee trails · padas whitewater' },
  { id: 'beaufort', name: 'Beaufort', occupancy: 47, rooms: 260, destinationIds: [], tagline: 'Home of Beaufort Mee · Padas River' },
  { id: 'sipitang', name: 'Sipitang', occupancy: 44, rooms: 180, destinationIds: [], tagline: 'Brunei border · quiet coastal' },
  { id: 'kualapenyu', name: 'Kuala Penyu', occupancy: 50, rooms: 310, destinationIds: [], tagline: 'Tiga Island · Survivor filmed here' },
  { id: 'papar', name: 'Papar', occupancy: 63, rooms: 520, destinationIds: [], tagline: 'Rice granary · beach escapes' },
  { id: 'sandakan', name: 'Sandakan', occupancy: 76, rooms: 3600, destinationIds: ['kinabatangan', 'sepilok'], tagline: 'Orangutans · river safari gateway' },
  { id: 'kinabatangan', name: 'Kinabatangan', occupancy: 78, rooms: 880, destinationIds: ['kinabatangan'], tagline: 'River safari · pygmy elephants' },
  { id: 'beluran', name: 'Beluran', occupancy: 46, rooms: 160, destinationIds: [], tagline: 'Sugut Estuary · bird watching' },
  { id: 'telupid', name: 'Telupid', occupancy: 40, rooms: 120, destinationIds: [], tagline: 'Forest reserve gateway' },
  { id: 'tongod', name: 'Tongod', occupancy: 38, rooms: 90, destinationIds: [], tagline: 'Interior · Imbak Canyon' },
  { id: 'nabawan', name: 'Nabawan', occupancy: 36, rooms: 70, destinationIds: [], tagline: 'Southern interior · Murut highlands' },
  { id: 'tawau', name: 'Tawau', occupancy: 78, rooms: 2800, destinationIds: [], tagline: 'Gateway to Semporna · hills park' },
  { id: 'lahaddatu', name: 'Lahad Datu', occupancy: 64, rooms: 1200, destinationIds: ['danum-valley'], tagline: 'Danum Valley · primary rainforest' },
  { id: 'semporna', name: 'Semporna', occupancy: 92, rooms: 2100, destinationIds: ['sipadan', 'mabul', 'kapalai'], tagline: 'World #1 diving · marine park' },
  { id: 'kunak', name: 'Kunak', occupancy: 41, rooms: 140, destinationIds: [], tagline: 'SE coast · oil palm and sea' },
];

function deriveCrowd(occ: number): CrowdLevel {
  if (occ >= 88) return 'very-high';
  if (occ >= 70) return 'high';
  if (occ >= 50) return 'moderate';
  return 'low';
}

export const sabahDistricts: SabahDistrictMeta[] = baseDistricts.map((d) => ({
  ...d,
  crowdLevel: deriveCrowd(d.occupancy),
}));

export const districtsById: Record<string, SabahDistrictMeta> = sabahDistricts.reduce(
  (acc, d) => {
    acc[d.id] = d;
    return acc;
  },
  {} as Record<string, SabahDistrictMeta>,
);

// Hotel stats aggregates used by occupancy mode
export const sabahHotelStats = (() => {
  const totalRooms = sabahDistricts.reduce((a, d) => a + d.rooms, 0);
  const weightedOccupancy = Math.round(
    sabahDistricts.reduce((a, d) => a + d.occupancy * d.rooms, 0) / totalRooms,
  );
  return { totalRooms, avgOccupancy: weightedOccupancy };
})();

// ---------- Runtime-derived counts keyed by district id ----------
// Food spots tagged by their location string — match against district.name
export function getFoodCountsByDistrict(): Record<string, number> {
  const counts: Record<string, number> = {};
  sabahDistricts.forEach((d) => (counts[d.id] = 0));
  foodSpots.forEach((f) => {
    const loc = f.location.toLowerCase();
    sabahDistricts.forEach((d) => {
      if (loc.includes(d.name.toLowerCase()) || (d.id === 'kk' && (loc.includes('kk') || loc.includes('kota kinabalu')))) {
        counts[d.id] = (counts[d.id] || 0) + 1;
      }
    });
  });
  return counts;
}

export function getEventCountsByDistrict(): Record<string, number> {
  const counts: Record<string, number> = {};
  sabahDistricts.forEach((d) => (counts[d.id] = 0));
  sabahEvents.forEach((e) => {
    const loc = e.location.toLowerCase();
    sabahDistricts.forEach((d) => {
      if (loc.includes(d.name.toLowerCase()) || (d.id === 'kk' && (loc.includes('kk') || loc.includes('kota kinabalu')))) {
        counts[d.id] = (counts[d.id] || 0) + 1;
      }
    });
  });
  return counts;
}

export function getAlertCountsByDistrict(): Record<string, number> {
  const counts: Record<string, number> = {};
  sabahDistricts.forEach((d) => (counts[d.id] = 0));
  safetyAlerts.forEach((a) => {
    if (!a.active) return;
    const loc = a.location.toLowerCase();
    sabahDistricts.forEach((d) => {
      if (loc.includes(d.name.toLowerCase()) || (d.id === 'kk' && loc.includes('kota kinabalu'))) {
        counts[d.id] = (counts[d.id] || 0) + 1;
      }
    });
  });
  return counts;
}

export function getIslandCountsByDistrict(): Record<string, number> {
  const counts: Record<string, number> = {};
  sabahDistricts.forEach((d) => (counts[d.id] = 0));
  sabahIslands.forEach((isl) => {
    const region = isl.region.toLowerCase();
    // Region keywords → district ids
    if (region.includes('semporna')) counts['semporna'] = (counts['semporna'] || 0) + 1;
    else if (region.includes('sandakan')) counts['sandakan'] = (counts['sandakan'] || 0) + 1;
    else if (region.includes('kudat')) counts['kudat'] = (counts['kudat'] || 0) + 1;
    else if (region.includes('tiga')) counts['kualapenyu'] = (counts['kualapenyu'] || 0) + 1;
    else if (region.includes('mantanani')) counts['kotabelud'] = (counts['kotabelud'] || 0) + 1;
    else if (region.includes('tarp') || region.includes('kota kinabalu')) counts['kk'] = (counts['kk'] || 0) + 1;
    else if (region.includes('layang')) counts['kk'] = (counts['kk'] || 0) + 1;
  });
  return counts;
}
