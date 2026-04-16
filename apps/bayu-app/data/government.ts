import { GovernmentStats } from '@/types';

// BKI (Kota Kinabalu) destination coords in SVG viewbox (Sabah centroid)
export const BKI_COORDS = { x: 863.8, y: 89.8 };

export const governmentStats: GovernmentStats = {
  totalVisitors: 3_820_450,
  totalVisitorsYoY: 12.5,
  revenue: 12_500_000_000,
  revenueYoY: 18.3,
  avgSpendPerVisitor: 3270,
  avgStayDays: 5.4,
  sustainabilityScore: 78,
  liveVisitorsToday: 14_287,
  liveVisitorsRate: 9.6, // visitors/min

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

  // Visitors FROM each Peninsular Malaysian state INTO Sabah (domestic)
  domesticOrigins: [
    { stateCode: 'MY10', name: 'Selangor',        visitors: 410_000 }, // highest
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
    { stateCode: 'MY12', name: 'Sabah',           visitors:       0 }, // destination itself
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
    { id: 'id', originId: 'id', originLabel: 'Jakarta',    flag: '🇮🇩', visitors: 340_000, x0: 430, y0: 325, flightsPerWeek: 21 },
    { id: 'cn', originId: 'cn', originLabel: 'Beijing',    flag: '🇨🇳', visitors: 650_000, x0: 620, y0:   8, flightsPerWeek: 28 },
    { id: 'kr', originId: 'kr', originLabel: 'Seoul',      flag: '🇰🇷', visitors: 420_000, x0: 830, y0:   8, flightsPerWeek: 14 },
    { id: 'jp', originId: 'jp', originLabel: 'Tokyo',      flag: '🇯🇵', visitors: 280_000, x0: 970, y0:  30, flightsPerWeek: 10 },
    { id: 'au', originId: 'au', originLabel: 'Sydney',     flag: '🇦🇺', visitors: 210_000, x0: 970, y0: 310, flightsPerWeek:  7 },
    { id: 'ph', originId: 'ph', originLabel: 'Manila',     flag: '🇵🇭', visitors: 150_000, x0: 920, y0: 180, flightsPerWeek:  7 },
  ],

  revenueBySector: [
    { sector: 'Hotels & Resorts',    amount: 5_000_000_000, percentage: 40, color: '#096DBB' },
    { sector: 'Tours & Activities',  amount: 3_125_000_000, percentage: 25, color: '#F7B731' },
    { sector: 'Food & Beverage',     amount: 1_875_000_000, percentage: 15, color: '#059669' },
    { sector: 'Transport',           amount: 1_500_000_000, percentage: 12, color: '#2EAFE8' },
    { sector: 'Retail & Souvenirs',  amount: 1_000_000_000, percentage:  8, color: '#7C3AED' },
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
    { id: '1', name: 'Ahmad K.',    from: 'Kuala Lumpur', flag: '🇲🇾', package: 'Sipadan 3D2N Dive',     amount: 3_450, minutesAgo:  1, tier: 'luxury' },
    { id: '2', name: 'Mei Ling C.', from: 'Singapore',    flag: '🇸🇬', package: 'Mt Kinabalu Climb',     amount: 2_180, minutesAgo:  3, tier: 'comfort' },
    { id: '3', name: 'Rina S.',     from: 'Jakarta',      flag: '🇮🇩', package: 'Sandakan Wildlife 4D', amount: 1_890, minutesAgo:  4, tier: 'comfort' },
    { id: '4', name: 'Wei Chen L.', from: 'Beijing',      flag: '🇨🇳', package: 'Kota Kinabalu City Break', amount: 1_240, minutesAgo:  6, tier: 'budget' },
    { id: '5', name: 'Ji-ho P.',    from: 'Seoul',        flag: '🇰🇷', package: 'Mabul Island Dive',     amount: 4_780, minutesAgo:  8, tier: 'luxury' },
    { id: '6', name: 'James W.',    from: 'Sydney',       flag: '🇦🇺', package: 'Kinabatangan River Safari', amount: 2_940, minutesAgo: 11, tier: 'comfort' },
    { id: '7', name: 'Siti A.',     from: 'Penang',       flag: '🇲🇾', package: 'Tunku Abdul Rahman Day', amount:   480, minutesAgo: 12, tier: 'budget' },
    { id: '8', name: 'Yuki T.',     from: 'Tokyo',        flag: '🇯🇵', package: 'Sipadan Luxury 5D4N',   amount: 8_900, minutesAgo: 14, tier: 'luxury' },
    { id: '9', name: 'Arun R.',     from: 'London',       flag: '🇬🇧', package: 'Borneo Grand Tour 10D', amount:12_400, minutesAgo: 18, tier: 'luxury' },
    { id: '10', name: 'Farah M.',   from: 'Johor Bahru',  flag: '🇲🇾', package: 'KK Weekend Escape',    amount:   890, minutesAgo: 22, tier: 'budget' },
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
};
