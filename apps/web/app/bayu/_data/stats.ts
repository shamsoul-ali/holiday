// Bayu — Sabah Tourism Command Center
// Mock data mirroring the mobile app's government.ts for live demo purposes.

export const BKI_COORDS = { x: 863.8, y: 89.8 };

export interface InternationalOrigin {
  id: string;
  country: string;
  city: string;
  flag: string;
  visitors: number;
  growth: number;
  avgSpend: number;
  x: number;
  y: number;
}

export interface FlightPath {
  id: string;
  originId: string;
  originLabel: string;
  flag: string;
  x0: number;
  y0: number;
  visitors: number;
  flightsPerWeek: number;
}

export interface LiveBooking {
  id: string;
  name: string;
  from: string;
  flag: string;
  package: string;
  amount: number;
  minutesAgo: number;
  tier: 'budget' | 'comfort' | 'luxury';
}

export interface SourceMarket {
  id: string;
  country: string;
  flag: string;
  visitors: number;
  growth: number;
  avgSpend: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'ok';

export interface OpsAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  district: string;
  minsAgo: number;
  icon: string; // lucide icon name
}

export interface ForecastAnomaly {
  id: string;
  region: string;
  pct: number;          // signed percentage
  reason: string;       // short explanation
  confidence: number;   // 0-100
}

export interface Forecast {
  next30DaysVisitors: number;
  next30DaysGrowth: number;
  confidence: number;     // 0-100
  dailySeries: number[];  // 30 synthetic daily forecast points (visitors)
  anomalies: ForecastAnomaly[];
  topSurges: { region: string; pct: number }[];
}

export interface HotelsData {
  districts: { id: string; name: string; occupancy: number; rooms: number; cx: number; cy: number; r: number }[];
  rateIndex: { stars: 3 | 4 | 5; avgRate: number; yoy: number }[];
  adrYoY: number;
  revPar: number;
  revParYoY: number;
  forwardBookings: number; // % of next-30-day inventory booked
}

export type OperatorStatus = 'compliant' | 'pending' | 'expiring' | 'lapsed';

export interface OperatorRecord {
  id: string;
  name: string;
  category: string;
  district: string;
  status: OperatorStatus;
  expiresIn: number; // days (or negative = lapsed)
  lastAuditScore?: number; // 0-100
}

export interface OperatorsData {
  total: number;
  compliant: number;
  pending: number;
  expiring: number;
  lapsed: number;
  complianceYoY: number;
  actions: OperatorRecord[];
}

export interface DemographicsData {
  ageBuckets: { bucket: string; pct: number }[];
  purpose: { label: string; pct: number; color: string }[];
  stayDistribution: { range: string; pct: number }[];
  genderSplit: { male: number; female: number };
  returningVsNew: { returning: number; newVisitor: number };
  avgGroupSize: number;
}

export interface SocialData {
  sentiment: { positive: number; neutral: number; negative: number };
  totalMentions: number;
  mentionsYoY: number;
  hashtags: { tag: string; mentions: number; trend: number }[];
  influencers: { name: string; handle: string; platform: string; reach: number; engagement: number; region: string }[];
  topPosts: { text: string; sentiment: 'positive' | 'neutral' | 'negative'; likes: number; platform: string }[];
}

export interface CompetitorRow {
  id: string;
  name: string;
  country: string;
  flag: string;
  arrivals: number;
  avgSpend: number;
  avgStay: number;
  sustainabilityScore: number;
  isHome?: boolean;
}

export interface IncomingFlight {
  id: string;
  flightNo: string;   // e.g. "MH2042"
  airline: string;    // e.g. "Malaysia Airlines"
  origin: string;
  flag: string;
  etaMinutes: number; // -5 = landed 5 mins ago; 0 = landing now; positive = ETA
  status: 'on-time' | 'delayed' | 'boarding' | 'landing' | 'landed';
  gate?: string;
  pax: number;
  aircraft: string;
}

export interface GovernmentStats {
  totalVisitors: number;
  totalVisitorsYoY: number;
  revenue: number;
  revenueYoY: number;
  avgSpendPerVisitor: number;
  avgStayDays: number;
  sustainabilityScore: number;
  liveVisitorsToday: number;
  liveVisitorsRate: number;
  hotelOccupancy: number;
  hotelOccupancyYoY: number;
  flightsPerWeek: number;
  flightsPerWeekYoY: number;
  monthlyTrend: { month: string; visitors: number; revenue: number }[];
  topDistricts: { name: string; visitors: number; percentage: number; growth: number }[];
  domesticOrigins: { stateCode: string; name: string; visitors: number }[];
  internationalOrigins: InternationalOrigin[];
  flightPaths: FlightPath[];
  revenueBySector: { sector: string; amount: number; percentage: number; color: string }[];
  sustainability: {
    carbonOffsetTonnes: number;
    reefProtectedHectares: number;
    localJobsCreated: number;
    ecoCertifiedOperators: number;
    wasteReduction: number;
    plasticFreeIslands: number;
  };
  liveBookings: LiveBooking[];
  peakSeasonGrid: { month: string; categories: Record<string, number> }[];
  sourceMarkets: SourceMarket[];
  alerts: OpsAlert[];
  forecast: Forecast;
  incomingFlights: IncomingFlight[];
  demographics: DemographicsData;
  social: SocialData;
  competitors: CompetitorRow[];
  hotels: HotelsData;
  operators: OperatorsData;
}

export const stats: GovernmentStats = {
  totalVisitors: 3_820_450,
  totalVisitorsYoY: 12.5,
  revenue: 12_500_000_000,
  revenueYoY: 18.3,
  avgSpendPerVisitor: 3270,
  avgStayDays: 5.4,
  sustainabilityScore: 78,
  liveVisitorsToday: 14_287,
  liveVisitorsRate: 9.6,
  hotelOccupancy: 84,
  hotelOccupancyYoY: 6.7,
  flightsPerWeek: 297,
  flightsPerWeekYoY: 14.2,

  monthlyTrend: [
    { month: 'Jan', visitors: 280_000, revenue: 910 },
    { month: 'Feb', visitors: 310_000, revenue: 1_010 },
    { month: 'Mar', visitors: 350_000, revenue: 1_150 },
    { month: 'Apr', visitors: 380_000, revenue: 1_250 },
    { month: 'May', visitors: 340_000, revenue: 1_120 },
    { month: 'Jun', visitors: 290_000, revenue: 950 },
    { month: 'Jul', visitors: 360_000, revenue: 1_180 },
    { month: 'Aug', visitors: 390_000, revenue: 1_280 },
    { month: 'Sep', visitors: 320_000, revenue: 1_050 },
    { month: 'Oct', visitors: 300_000, revenue: 980 },
    { month: 'Nov', visitors: 250_000, revenue: 820 },
    { month: 'Dec', visitors: 250_450, revenue: 800 },
  ],

  topDistricts: [
    { name: 'Kota Kinabalu', visitors: 1_520_000, percentage: 40, growth: 14.2 },
    { name: 'Semporna',      visitors:   760_000, percentage: 20, growth: 22.7 },
    { name: 'Sandakan',      visitors:   570_000, percentage: 15, growth:  8.9 },
    { name: 'Ranau',         visitors:   380_000, percentage: 10, growth: 16.4 },
    { name: 'Kudat',         visitors:   228_000, percentage:  6, growth: 11.1 },
    { name: 'Lahad Datu',    visitors:   190_000, percentage:  5, growth:  6.3 },
    { name: 'Beaufort',      visitors:   152_000, percentage:  4, growth:  9.8 },
  ],

  domesticOrigins: [
    { stateCode: 'MY10', name: 'Selangor',        visitors: 410_000 },
    { stateCode: 'MY14', name: 'Kuala Lumpur',    visitors: 380_000 },
    { stateCode: 'MY01', name: 'Johor',           visitors: 220_000 },
    { stateCode: 'MY07', name: 'Pulau Pinang',    visitors: 185_000 },
    { stateCode: 'MY08', name: 'Perak',           visitors: 140_000 },
    { stateCode: 'MY06', name: 'Pahang',          visitors:  95_000 },
    { stateCode: 'MY13', name: 'Sarawak',         visitors:  88_000 },
    { stateCode: 'MY05', name: 'Negeri Sembilan', visitors:  78_000 },
    { stateCode: 'MY11', name: 'Terengganu',      visitors:  62_000 },
    { stateCode: 'MY03', name: 'Kelantan',        visitors:  55_000 },
    { stateCode: 'MY04', name: 'Melaka',          visitors:  48_000 },
    { stateCode: 'MY02', name: 'Kedah',           visitors:  40_000 },
    { stateCode: 'MY09', name: 'Perlis',          visitors:  14_000 },
    { stateCode: 'MY16', name: 'Putrajaya',       visitors:  18_000 },
    { stateCode: 'MY15', name: 'Labuan',          visitors:  35_000 },
    { stateCode: 'MY12', name: 'Sabah',           visitors:       0 },
  ],

  internationalOrigins: [
    { id: 'sg', country: 'Singapore',      city: 'Singapore',     flag: '🇸🇬', visitors: 820_000, growth: 15.4, avgSpend: 4_100, x: 220, y: 315 },
    { id: 'id', country: 'Indonesia',      city: 'Jakarta',       flag: '🇮🇩', visitors: 340_000, growth: 11.2, avgSpend: 2_640, x: 430, y: 325 },
    { id: 'cn', country: 'China',          city: 'Beijing',       flag: '🇨🇳', visitors: 650_000, growth: 28.1, avgSpend: 5_320, x: 620, y:   8 },
    { id: 'kr', country: 'South Korea',    city: 'Seoul',         flag: '🇰🇷', visitors: 420_000, growth: 34.6, avgSpend: 4_780, x: 830, y:   8 },
    { id: 'jp', country: 'Japan',          city: 'Tokyo',         flag: '🇯🇵', visitors: 280_000, growth:  9.8, avgSpend: 5_100, x: 970, y:  30 },
    { id: 'au', country: 'Australia',      city: 'Sydney',        flag: '🇦🇺', visitors: 210_000, growth:  7.4, avgSpend: 4_920, x: 970, y: 310 },
    { id: 'uk', country: 'United Kingdom', city: 'London',        flag: '🇬🇧', visitors: 180_000, growth:  5.2, avgSpend: 6_150, x:  10, y:  12 },
    { id: 'ph', country: 'Philippines',    city: 'Manila',        flag: '🇵🇭', visitors: 150_000, growth: 12.0, avgSpend: 2_210, x: 920, y: 180 },
  ],

  flightPaths: [
    { id: 'sg', originId: 'sg', originLabel: 'Singapore',  flag: '🇸🇬', x0: 220, y0: 315, visitors: 820_000, flightsPerWeek: 42 },
    { id: 'kl', originId: 'kl', originLabel: 'Kuala Lumpur', flag: '🇲🇾', x0: 140, y0: 211, visitors: 1_650_000, flightsPerWeek: 168 },
    { id: 'id', originId: 'id', originLabel: 'Jakarta',    flag: '🇮🇩', x0: 430, y0: 325, visitors: 340_000, flightsPerWeek: 21 },
    { id: 'cn', originId: 'cn', originLabel: 'Beijing',    flag: '🇨🇳', x0: 620, y0:   8, visitors: 650_000, flightsPerWeek: 28 },
    { id: 'kr', originId: 'kr', originLabel: 'Seoul',      flag: '🇰🇷', x0: 830, y0:   8, visitors: 420_000, flightsPerWeek: 14 },
    { id: 'jp', originId: 'jp', originLabel: 'Tokyo',      flag: '🇯🇵', x0: 970, y0:  30, visitors: 280_000, flightsPerWeek: 10 },
    { id: 'au', originId: 'au', originLabel: 'Sydney',     flag: '🇦🇺', x0: 970, y0: 310, visitors: 210_000, flightsPerWeek:  7 },
    { id: 'ph', originId: 'ph', originLabel: 'Manila',     flag: '🇵🇭', x0: 920, y0: 180, visitors: 150_000, flightsPerWeek:  7 },
  ],

  revenueBySector: [
    { sector: 'Hotels & Resorts',    amount: 5_000_000_000, percentage: 40, color: '#096DBB' },
    { sector: 'Tours & Activities',  amount: 3_125_000_000, percentage: 25, color: '#F7B731' },
    { sector: 'Food & Beverage',     amount: 1_875_000_000, percentage: 15, color: '#059669' },
    { sector: 'Transport',           amount: 1_500_000_000, percentage: 12, color: '#2EAFE8' },
    { sector: 'Retail & Souvenirs',  amount: 1_000_000_000, percentage:  8, color: '#A78BFA' },
  ],

  sustainability: {
    carbonOffsetTonnes: 24_380,
    reefProtectedHectares: 890,
    localJobsCreated: 15_420,
    ecoCertifiedOperators: 78,
    wasteReduction: 43,
    plasticFreeIslands: 12,
  },

  liveBookings: [
    { id: '1',  name: 'Ahmad K.',    from: 'Kuala Lumpur', flag: '🇲🇾', package: 'Sipadan 3D2N Dive',        amount: 3_450, minutesAgo:  1, tier: 'luxury'  },
    { id: '2',  name: 'Mei Ling C.', from: 'Singapore',    flag: '🇸🇬', package: 'Mt Kinabalu Climb',        amount: 2_180, minutesAgo:  3, tier: 'comfort' },
    { id: '3',  name: 'Rina S.',     from: 'Jakarta',      flag: '🇮🇩', package: 'Sandakan Wildlife 4D',     amount: 1_890, minutesAgo:  4, tier: 'comfort' },
    { id: '4',  name: 'Wei Chen L.', from: 'Beijing',      flag: '🇨🇳', package: 'KK City Break',            amount: 1_240, minutesAgo:  6, tier: 'budget'  },
    { id: '5',  name: 'Ji-ho P.',    from: 'Seoul',        flag: '🇰🇷', package: 'Mabul Island Dive',        amount: 4_780, minutesAgo:  8, tier: 'luxury'  },
    { id: '6',  name: 'James W.',    from: 'Sydney',       flag: '🇦🇺', package: 'Kinabatangan Safari',      amount: 2_940, minutesAgo: 11, tier: 'comfort' },
    { id: '7',  name: 'Siti A.',     from: 'Penang',       flag: '🇲🇾', package: 'Tunku Abdul Rahman Day',   amount:   480, minutesAgo: 12, tier: 'budget'  },
    { id: '8',  name: 'Yuki T.',     from: 'Tokyo',        flag: '🇯🇵', package: 'Sipadan Luxury 5D4N',      amount: 8_900, minutesAgo: 14, tier: 'luxury'  },
    { id: '9',  name: 'Arun R.',     from: 'London',       flag: '🇬🇧', package: 'Borneo Grand Tour 10D',    amount:12_400, minutesAgo: 18, tier: 'luxury'  },
    { id: '10', name: 'Farah M.',    from: 'Johor Bahru',  flag: '🇲🇾', package: 'KK Weekend Escape',        amount:   890, minutesAgo: 22, tier: 'budget'  },
  ],

  peakSeasonGrid: [
    { month: 'Jan', categories: { Diving: 85, Mountain: 70, Cultural: 45, Wildlife: 60, Beach: 80 } },
    { month: 'Feb', categories: { Diving: 88, Mountain: 72, Cultural: 90, Wildlife: 62, Beach: 82 } },
    { month: 'Mar', categories: { Diving: 92, Mountain: 78, Cultural: 50, Wildlife: 65, Beach: 85 } },
    { month: 'Apr', categories: { Diving: 95, Mountain: 80, Cultural: 88, Wildlife: 70, Beach: 90 } },
    { month: 'May', categories: { Diving: 82, Mountain: 74, Cultural: 98, Wildlife: 75, Beach: 80 } },
    { month: 'Jun', categories: { Diving: 75, Mountain: 82, Cultural: 68, Wildlife: 80, Beach: 72 } },
    { month: 'Jul', categories: { Diving: 78, Mountain: 90, Cultural: 72, Wildlife: 88, Beach: 75 } },
    { month: 'Aug', categories: { Diving: 80, Mountain: 92, Cultural: 75, Wildlife: 92, Beach: 78 } },
    { month: 'Sep', categories: { Diving: 82, Mountain: 85, Cultural: 78, Wildlife: 90, Beach: 80 } },
    { month: 'Oct', categories: { Diving: 85, Mountain: 88, Cultural: 95, Wildlife: 85, Beach: 82 } },
    { month: 'Nov', categories: { Diving: 70, Mountain: 60, Cultural: 90, Wildlife: 72, Beach: 65 } },
    { month: 'Dec', categories: { Diving: 72, Mountain: 55, Cultural: 80, Wildlife: 68, Beach: 78 } },
  ],

  sourceMarkets: [
    { id: 'my', country: 'Malaysia (domestic)', flag: '🇲🇾', visitors: 2_066_450, growth:  8.4, avgSpend: 1_640 },
    { id: 'sg', country: 'Singapore',            flag: '🇸🇬', visitors:   820_000, growth: 15.4, avgSpend: 4_100 },
    { id: 'cn', country: 'China',                flag: '🇨🇳', visitors:   650_000, growth: 28.1, avgSpend: 5_320 },
    { id: 'kr', country: 'South Korea',          flag: '🇰🇷', visitors:   420_000, growth: 34.6, avgSpend: 4_780 },
    { id: 'id', country: 'Indonesia',            flag: '🇮🇩', visitors:   340_000, growth: 11.2, avgSpend: 2_640 },
    { id: 'jp', country: 'Japan',                flag: '🇯🇵', visitors:   280_000, growth:  9.8, avgSpend: 5_100 },
    { id: 'au', country: 'Australia',            flag: '🇦🇺', visitors:   210_000, growth:  7.4, avgSpend: 4_920 },
    { id: 'uk', country: 'United Kingdom',       flag: '🇬🇧', visitors:   180_000, growth:  5.2, avgSpend: 6_150 },
    { id: 'ph', country: 'Philippines',          flag: '🇵🇭', visitors:   150_000, growth: 12.0, avgSpend: 2_210 },
  ],

  alerts: [
    { id: 'a1', severity: 'critical', title: 'Mt Kinabalu — Summit trail closed',  detail: 'Heavy rainfall warning until 14:00 · 47 climbers rerouted',  district: 'Ranau',         minsAgo:  4, icon: 'CloudRain' },
    { id: 'a2', severity: 'warning',  title: 'Sipadan — 8/120 permits remaining', detail: 'Dive quota 94% full for today · 3 operators on waitlist',    district: 'Semporna',      minsAgo: 11, icon: 'Ticket' },
    { id: 'a3', severity: 'warning',  title: 'Tawau Jetty — 45 min boarding queue', detail: '2 speedboats delayed due to mechanical · backup dispatched', district: 'Tawau',         minsAgo: 18, icon: 'AlertTriangle' },
    { id: 'a4', severity: 'info',     title: 'Kinabatangan — Amber dengue alert',  detail: '4 new cases reported near Sukau · tourism ops notified',     district: 'Kinabatangan',  minsAgo: 32, icon: 'Bug' },
    { id: 'a5', severity: 'ok',       title: 'BKI Airport — Normal operations',    detail: 'All 8 scheduled arrivals on time · no delays',              district: 'Kota Kinabalu', minsAgo: 45, icon: 'CheckCircle2' },
    { id: 'a6', severity: 'info',     title: 'Mabul — Night dive visibility excellent', detail: '25m+ visibility reported · plankton bloom subsiding',   district: 'Semporna',      minsAgo: 58, icon: 'Waves' },
  ],

  forecast: {
    next30DaysVisitors: 425_600,
    next30DaysGrowth: 18.4,
    confidence: 92,
    // 30 days of synthetic daily arrivals with a realistic curve (weekend peaks)
    dailySeries: [
      12_400, 12_900, 13_100, 13_600, 14_200, 15_800, 16_100,
      13_400, 13_200, 13_800, 14_000, 14_600, 16_900, 17_200,
      14_100, 14_400, 14_800, 15_200, 15_800, 17_600, 18_200,
      15_000, 15_200, 15_600, 16_000, 16_600, 18_900, 19_400,
      16_200, 16_800,
    ],
    anomalies: [
      { id: 'f1', region: 'Semporna',       pct:  340, reason: 'Viral TikTok: @diveaddict · 2.4M views in 48h',                 confidence: 87 },
      { id: 'f2', region: 'Mt Kinabalu',    pct:   94, reason: 'Climb permits 94% booked for next 14 days · surge pricing active', confidence: 96 },
      { id: 'f3', region: 'Kudat',          pct: -18,  reason: 'Monsoon shift reducing demand · expected recovery by May 3',       confidence: 81 },
      { id: 'f4', region: 'Sandakan',       pct:   27, reason: 'New direct Korea route launches Apr 28 · Seoul arrivals +62%',     confidence: 93 },
    ],
    topSurges: [
      { region: 'Semporna',    pct: 340 },
      { region: 'Sandakan',    pct:  62 },
      { region: 'Ranau',       pct:  48 },
      { region: 'Lahad Datu',  pct:  34 },
    ],
  },

  incomingFlights: [
    { id: 'f-0', flightNo: 'MH2042', airline: 'Malaysia Airlines', origin: 'Kuala Lumpur',  flag: '🇲🇾', etaMinutes:   0, status: 'landing',  gate: 'A3', pax: 168, aircraft: 'B737' },
    { id: 'f-1', flightNo: 'AK6136', airline: 'AirAsia',           origin: 'Singapore',     flag: '🇸🇬', etaMinutes:   8, status: 'on-time',  gate: 'B1', pax: 186, aircraft: 'A320' },
    { id: 'f-2', flightNo: 'SQ 118', airline: 'Singapore Airlines',origin: 'Singapore',     flag: '🇸🇬', etaMinutes:  22, status: 'on-time',  gate: 'B2', pax: 152, aircraft: 'A350' },
    { id: 'f-3', flightNo: 'CA 819', airline: 'Air China',         origin: 'Beijing',       flag: '🇨🇳', etaMinutes:  34, status: 'on-time',  gate: 'C1', pax: 248, aircraft: 'A330' },
    { id: 'f-4', flightNo: 'KE 621', airline: 'Korean Air',        origin: 'Seoul',         flag: '🇰🇷', etaMinutes:  48, status: 'delayed',  gate: 'C2', pax: 274, aircraft: 'B777' },
    { id: 'f-5', flightNo: 'D7 726', airline: 'AirAsia X',         origin: 'Tokyo',         flag: '🇯🇵', etaMinutes:  61, status: 'on-time',  gate: 'A5', pax: 368, aircraft: 'A330' },
    { id: 'f-6', flightNo: 'MH2046', airline: 'Malaysia Airlines', origin: 'Johor Bahru',   flag: '🇲🇾', etaMinutes:  78, status: 'on-time',  gate: 'A2', pax: 112, aircraft: 'B737' },
    { id: 'f-7', flightNo: 'AK6024', airline: 'AirAsia',           origin: 'Jakarta',       flag: '🇮🇩', etaMinutes:  94, status: 'delayed',  gate: 'B4', pax: 198, aircraft: 'A321' },
    { id: 'f-8', flightNo: 'JQ 118', airline: 'Jetstar',           origin: 'Sydney',        flag: '🇦🇺', etaMinutes: 112, status: 'on-time',  gate: 'C3', pax: 186, aircraft: 'B787' },
    { id: 'f-9', flightNo: 'MH 852', airline: 'Malaysia Airlines', origin: 'Hong Kong',     flag: '🇭🇰', etaMinutes: 128, status: 'on-time',  gate: 'C4', pax: 274, aircraft: 'A330' },
    { id: 'f-10', flightNo: 'PR 592',airline: 'Philippine Airlines',origin: 'Manila',       flag: '🇵🇭', etaMinutes: -12, status: 'landed',   gate: 'B3', pax: 148, aircraft: 'A321' },
    { id: 'f-11', flightNo: 'AK1234',airline: 'AirAsia',           origin: 'Penang',        flag: '🇲🇾', etaMinutes: -28, status: 'landed',   gate: 'A1', pax: 180, aircraft: 'A320' },
  ],

  demographics: {
    ageBuckets: [
      { bucket: '18–24', pct: 14 },
      { bucket: '25–34', pct: 31 },
      { bucket: '35–44', pct: 24 },
      { bucket: '45–54', pct: 17 },
      { bucket: '55+',   pct: 14 },
    ],
    purpose: [
      { label: 'Leisure',    pct: 58, color: '#096DBB' },
      { label: 'MICE',       pct: 14, color: '#F7B731' },
      { label: 'VFR',        pct: 11, color: '#10B981' },
      { label: 'Adventure',  pct: 10, color: '#2EAFE8' },
      { label: 'Wellness',   pct:  7, color: '#A78BFA' },
    ],
    stayDistribution: [
      { range: '1–3d',   pct: 22 },
      { range: '4–7d',   pct: 46 },
      { range: '8–14d',  pct: 24 },
      { range: '15d+',   pct:  8 },
    ],
    genderSplit: { male: 52, female: 48 },
    returningVsNew: { returning: 38, newVisitor: 62 },
    avgGroupSize: 3.2,
  },

  social: {
    sentiment: { positive: 74, neutral: 19, negative: 7 },
    totalMentions: 128_420,
    mentionsYoY: 34.8,
    hashtags: [
      { tag: '#SabahBorneo',      mentions: 48_240, trend: 42.1 },
      { tag: '#SipadanDive',      mentions: 22_110, trend: 18.6 },
      { tag: '#MtKinabalu',       mentions: 18_980, trend: 12.3 },
      { tag: '#VisitSabah',       mentions: 14_450, trend:  8.4 },
      { tag: '#BorneoAdventure',  mentions: 11_200, trend: 24.8 },
      { tag: '#SunsetKK',         mentions:  9_420, trend: 16.9 },
    ],
    influencers: [
      { name: 'Dive Addict',    handle: '@diveaddict',   platform: 'TikTok',    reach: 2_400_000, engagement: 8.4, region: 'Singapore' },
      { name: 'Borneo Nomad',   handle: '@borneonomad',  platform: 'Instagram', reach: 1_820_000, engagement: 6.1, region: 'Malaysia' },
      { name: 'K-Travel Diary', handle: '@ktraveldiary', platform: 'YouTube',   reach:   980_000, engagement: 4.7, region: 'South Korea' },
      { name: 'Wild China',     handle: '@wildchina',    platform: 'Xiaohongshu', reach: 740_000, engagement: 5.9, region: 'China' },
    ],
    topPosts: [
      { text: 'Just touched a whale shark in Sipadan 🐋 speechless', sentiment: 'positive', likes: 284_000, platform: 'TikTok' },
      { text: 'Mt Kinabalu sunrise above the clouds — bucket list ✅', sentiment: 'positive', likes: 142_000, platform: 'Instagram' },
      { text: 'Kinabatangan river safari = orangutans EVERYWHERE',     sentiment: 'positive', likes:  98_400, platform: 'Instagram' },
    ],
  },

  competitors: [
    { id: 'sabah',    name: 'Sabah',           country: 'Malaysia',    flag: '🇲🇾', arrivals: 3_820_000, avgSpend: 3_270, avgStay: 5.4, sustainabilityScore: 78, isHome: true },
    { id: 'bali',     name: 'Bali',            country: 'Indonesia',   flag: '🇮🇩', arrivals: 6_200_000, avgSpend: 2_180, avgStay: 6.8, sustainabilityScore: 64 },
    { id: 'phuket',   name: 'Phuket',          country: 'Thailand',    flag: '🇹🇭', arrivals: 9_800_000, avgSpend: 2_940, avgStay: 5.1, sustainabilityScore: 58 },
    { id: 'boracay',  name: 'Boracay',         country: 'Philippines', flag: '🇵🇭', arrivals: 2_100_000, avgSpend: 2_460, avgStay: 4.2, sustainabilityScore: 71 },
    { id: 'langkawi', name: 'Langkawi',        country: 'Malaysia',    flag: '🇲🇾', arrivals: 3_400_000, avgSpend: 2_680, avgStay: 4.8, sustainabilityScore: 69 },
  ],

  // Sabah's real 26 districts (approximation — the SVG has 25-27 polygons depending on how
  // Labuan/federal territory is counted). Rooms drive the geographic area-rank pairing.
  hotels: {
    districts: [
      { id: 'kk',           name: 'Kota Kinabalu',  occupancy: 92, rooms: 12_840, cx: 110, cy: 180, r: 46 },
      { id: 'sandakan',     name: 'Sandakan',       occupancy: 82, rooms:  4_620, cx: 296, cy: 124, r: 34 },
      { id: 'semporna',     name: 'Semporna',       occupancy: 96, rooms:  3_240, cx: 346, cy: 236, r: 32 },
      { id: 'ranau',        name: 'Ranau',          occupancy: 88, rooms:  2_380, cx: 198, cy: 150, r: 28 },
      { id: 'kinabatangan', name: 'Kinabatangan',   occupancy: 78, rooms:  2_180, cx: 304, cy: 176, r: 26 },
      { id: 'tawau',        name: 'Tawau',          occupancy: 71, rooms:  2_140, cx: 320, cy: 276, r: 28 },
      { id: 'papar',        name: 'Papar',          occupancy: 72, rooms:  1_860, cx: 128, cy: 260, r: 22 },
      { id: 'lahaddatu',    name: 'Lahad Datu',     occupancy: 63, rooms:  1_560, cx: 276, cy: 224, r: 24 },
      { id: 'keningau',     name: 'Keningau',       occupancy: 58, rooms:  1_480, cx: 160, cy: 240, r: 24 },
      { id: 'kudat',        name: 'Kudat',          occupancy: 74, rooms:  1_420, cx: 198, cy:  60, r: 26 },
      { id: 'tuaran',       name: 'Tuaran',         occupancy: 81, rooms:  1_320, cx: 120, cy: 200, r: 22 },
      { id: 'penampang',    name: 'Penampang',      occupancy: 68, rooms:  1_240, cx: 130, cy: 224, r: 20 },
      { id: 'beluran',      name: 'Beluran',        occupancy: 54, rooms:  1_120, cx: 280, cy: 150, r: 22 },
      { id: 'kotabelud',    name: 'Kota Belud',     occupancy: 66, rooms:    680, cx: 158, cy: 108, r: 22 },
      { id: 'tenom',        name: 'Tenom',          occupancy: 52, rooms:    620, cx: 140, cy: 280, r: 20 },
      { id: 'tambunan',     name: 'Tambunan',       occupancy: 64, rooms:    580, cx: 170, cy: 220, r: 20 },
      { id: 'kunak',        name: 'Kunak',          occupancy: 69, rooms:    540, cx: 340, cy: 250, r: 18 },
      { id: 'putatan',      name: 'Putatan',        occupancy: 86, rooms:    520, cx: 118, cy: 210, r: 16 },
      { id: 'kotamarudu',   name: 'Kota Marudu',    occupancy: 47, rooms:    480, cx: 210, cy:  85, r: 20 },
      { id: 'beaufort',     name: 'Beaufort',       occupancy: 61, rooms:    460, cx: 160, cy: 296, r: 22 },
      { id: 'sipitang',     name: 'Sipitang',       occupancy: 45, rooms:    360, cx: 130, cy: 310, r: 18 },
      { id: 'pitas',        name: 'Pitas',          occupancy: 42, rooms:    290, cx: 230, cy:  95, r: 18 },
      { id: 'kualapenyu',   name: 'Kuala Penyu',    occupancy: 48, rooms:    240, cx: 150, cy: 300, r: 16 },
      { id: 'nabawan',      name: 'Nabawan',        occupancy: 38, rooms:    200, cx: 220, cy: 280, r: 18 },
      { id: 'telupid',      name: 'Telupid',        occupancy: 35, rooms:    160, cx: 240, cy: 200, r: 16 },
      { id: 'tongod',       name: 'Tongod',         occupancy: 32, rooms:    130, cx: 260, cy: 220, r: 16 },
    ],
    rateIndex: [
      { stars: 3, avgRate:   285, yoy:  4.2 },
      { stars: 4, avgRate:   640, yoy:  9.8 },
      { stars: 5, avgRate: 1_480, yoy: 14.6 },
    ],
    adrYoY: 9.4,
    revPar: 482,
    revParYoY: 11.2,
    forwardBookings: 64,
  },

  operators: {
    total: 342,
    compliant: 284,
    pending: 31,
    expiring: 18,
    lapsed: 9,
    complianceYoY: 7.4,
    actions: [
      { id: 'op1', name: 'Sipadan Dive Centre Sdn Bhd',   category: 'Dive operator',    district: 'Semporna',       status: 'expiring', expiresIn: 11, lastAuditScore: 94 },
      { id: 'op2', name: 'Kinabalu Trekking Co.',         category: 'Mountain guide',   district: 'Ranau',          status: 'expiring', expiresIn: 18, lastAuditScore: 89 },
      { id: 'op3', name: 'Borneo Wildlife Expeditions',   category: 'Wildlife tour',    district: 'Kinabatangan',   status: 'pending',  expiresIn: 46, lastAuditScore: 82 },
      { id: 'op4', name: 'Tawau Heritage Cruises',        category: 'Marine transport', district: 'Tawau',          status: 'lapsed',   expiresIn: -6, lastAuditScore: 71 },
      { id: 'op5', name: 'Kota Kinabalu Cultural Tours',  category: 'Cultural guide',   district: 'Kota Kinabalu',  status: 'pending',  expiresIn: 28, lastAuditScore: 88 },
    ],
  },
};
