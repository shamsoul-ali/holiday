import { GovernmentStats } from '@/types';

export const governmentStats: GovernmentStats = {
  totalVisitors: 3800000,
  monthlyTrend: [
    { month: 'Jan', visitors: 280000 },
    { month: 'Feb', visitors: 310000 },
    { month: 'Mar', visitors: 350000 },
    { month: 'Apr', visitors: 380000 },
    { month: 'May', visitors: 340000 },
    { month: 'Jun', visitors: 290000 },
    { month: 'Jul', visitors: 360000 },
    { month: 'Aug', visitors: 390000 },
    { month: 'Sep', visitors: 320000 },
    { month: 'Oct', visitors: 300000 },
    { month: 'Nov', visitors: 250000 },
    { month: 'Dec', visitors: 230000 },
  ],
  topDistricts: [
    { name: 'Kota Kinabalu', visitors: 1520000, percentage: 40 },
    { name: 'Semporna', visitors: 760000, percentage: 20 },
    { name: 'Sandakan', visitors: 570000, percentage: 15 },
    { name: 'Ranau', visitors: 380000, percentage: 10 },
    { name: 'Kudat', visitors: 228000, percentage: 6 },
    { name: 'Lahad Datu', visitors: 190000, percentage: 5 },
    { name: 'Beaufort', visitors: 152000, percentage: 4 },
  ],
  sustainabilityScore: 78,
  revenue: 12500000000,
};
