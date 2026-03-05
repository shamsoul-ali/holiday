import { PrayerTime, HalalRestaurant } from '@/types';

export const prayerTimes: PrayerTime[] = [
  { name: 'Fajr', time: '05:30', icon: 'moon-outline' },
  { name: 'Sunrise', time: '06:15', icon: 'sunny-outline' },
  { name: 'Dhuhr', time: '12:10', icon: 'sunny' },
  { name: 'Asr', time: '15:30', icon: 'sunny' },
  { name: 'Maghrib', time: '18:20', icon: 'partly-sunny-outline' },
  { name: 'Isha', time: '19:30', icon: 'moon' },
];

export const halalRestaurants: HalalRestaurant[] = [
  { id: 'r1', name: 'Alu-Alu Kitchen', cuisine: 'Sabahan Seafood', rating: 4.7, distance: '0.5 km', priceRange: '$$', certification: 'JAKIM Certified', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', address: 'Waterfront, Kota Kinabalu' },
  { id: 'r2', name: 'Kampung Nelayan', cuisine: 'Malay-Sabah', rating: 4.6, distance: '1.2 km', priceRange: '$', certification: 'JAKIM Certified', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', address: 'Sinsuran, Kota Kinabalu' },
  { id: 'r3', name: 'Welcome Seafood', cuisine: 'Chinese-Malay', rating: 4.8, distance: '2.0 km', priceRange: '$$$', certification: 'Muslim Friendly', image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400', address: 'KK Waterfront' },
  { id: 'r4', name: 'Naan & Curry House', cuisine: 'Indian', rating: 4.4, distance: '0.8 km', priceRange: '$', certification: 'Halal Certified', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', address: 'Gaya Street, KK' },
  { id: 'r5', name: 'Tanjung Aru Satay', cuisine: 'Local BBQ', rating: 4.5, distance: '5 km', priceRange: '$', certification: 'JAKIM Certified', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', address: 'Tanjung Aru Beach' },
];
