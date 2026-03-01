import { create } from 'zustand';
import { PrayerTime, HalalRestaurant, UmrahPackage } from '@/types';
import { prayerTimes, halalRestaurants, umrahPackages } from '@/data';

interface HalalState {
  prayerTimes: PrayerTime[];
  restaurants: HalalRestaurant[];
  umrahPackages: UmrahPackage[];
  selectedCity: string;
  qiblaDirection: number;
  hijriDate: string;
  setCity: (city: string) => void;
}

export const useHalalStore = create<HalalState>((set) => ({
  prayerTimes,
  restaurants: halalRestaurants,
  umrahPackages,
  selectedCity: 'Kuala Lumpur',
  qiblaDirection: 292.5,
  hijriDate: '2 Ramadan 1447',
  setCity: (city) => set({ selectedCity: city }),
}));
