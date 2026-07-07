import { TravelBadge } from '@/types';

export const travelBadges: TravelBadge[] = [
  { id: 'b1', name: 'Ocean Explorer', description: 'Visit 3 island destinations in Sabah', icon: 'water', earned: true, requirement: '3 islands visited', district: 'Semporna' },
  { id: 'b2', name: 'Summit Seeker', description: 'Reach the peak of Mount Kinabalu', icon: 'flag', earned: false, requirement: 'Complete Kinabalu summit', district: 'Ranau' },
  { id: 'b3', name: 'Wildlife Whisperer', description: 'Spot 5 different wildlife species', icon: 'paw', earned: true, requirement: '5 species spotted', district: 'Sandakan' },
  { id: 'b4', name: 'Cultural Guardian', description: 'Visit 2 cultural heritage sites', icon: 'people', earned: false, requirement: '2 cultural sites', district: 'Kota Kinabalu' },
  { id: 'b5', name: 'Foodie Explorer', description: 'Try food at 5 recommended spots', icon: 'restaurant', earned: true, requirement: '5 food spots visited', district: 'Kota Kinabalu' },
  { id: 'b6', name: 'Eco Warrior', description: 'Complete 2 eco-tourism activities', icon: 'leaf', earned: true, requirement: '2 eco activities', district: 'Multiple' },
  { id: 'b7', name: 'Deep Diver', description: 'Complete 10 dives in Sabah waters', icon: 'water', earned: false, requirement: '10 dives logged', district: 'Semporna' },
  { id: 'b8', name: 'Jungle Trekker', description: 'Complete 3 jungle trekking trails', icon: 'trail-sign', earned: false, requirement: '3 trails completed', district: 'Multiple' },
  { id: 'b9', name: 'Sunset Chaser', description: 'Watch sunset at Tip of Borneo', icon: 'sunny', earned: false, requirement: 'Visit Tip of Borneo', district: 'Kudat' },
  { id: 'b10', name: 'River Navigator', description: 'Complete a Kinabatangan river cruise', icon: 'boat', earned: true, requirement: 'River cruise done', district: 'Sandakan' },
  { id: 'b11', name: 'Sabah Insider', description: 'Visit 5 different districts', icon: 'map', earned: false, requirement: '5 districts visited', district: 'Multiple' },
  { id: 'b12', name: 'First Timer', description: 'Complete your first Sabah trip', icon: 'ribbon', earned: true, requirement: 'First trip completed', district: 'Any' },
];

export const travelPassStats = {
  level: 3,
  points: 8500,
  nextLevelPoints: 12000,
  districtsVisited: 3,
  totalDistricts: 7,
  visitedDistricts: ['Kota Kinabalu', 'Semporna', 'Sandakan'],
  allDistricts: ['Kota Kinabalu', 'Semporna', 'Sandakan', 'Ranau', 'Kudat', 'Lahad Datu', 'Beaufort'],
  badgesEarned: 6,
  totalBadges: 12,
  tripsCompleted: 8,
};
