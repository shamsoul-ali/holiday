import { create } from 'zustand';
import { PrayerTime, HalalRestaurant, FoodSpot, MarketplaceAgent, SafetyAlert, EmergencyContact } from '@/types';
import { prayerTimes, halalRestaurants, foodSpots, marketplaceAgents, safetyAlerts, emergencyContacts } from '@/data';

interface DiscoverState {
  // Prayer & Halal
  prayerTimes: PrayerTime[];
  restaurants: HalalRestaurant[];
  selectedCity: string;
  qiblaDirection: number;
  hijriDate: string;
  setCity: (city: string) => void;

  // Food
  foodSpots: FoodSpot[];
  selectedFoodTag: string;
  setFoodTag: (tag: string) => void;

  // Marketplace
  agents: MarketplaceAgent[];
  selectedAgentType: string;
  setAgentType: (type: string) => void;

  // Safety
  alerts: SafetyAlert[];
  emergencyContacts: EmergencyContact[];
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  prayerTimes,
  restaurants: halalRestaurants,
  selectedCity: 'Kota Kinabalu',
  qiblaDirection: 292.5,
  hijriDate: '2 Ramadan 1447',
  setCity: (city) => set({ selectedCity: city }),

  foodSpots,
  selectedFoodTag: 'all',
  setFoodTag: (tag) => set({ selectedFoodTag: tag }),

  agents: marketplaceAgents,
  selectedAgentType: 'all',
  setAgentType: (type) => set({ selectedAgentType: type }),

  alerts: safetyAlerts,
  emergencyContacts,
}));
