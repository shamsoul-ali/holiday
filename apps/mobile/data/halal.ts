import { PrayerTime, HalalRestaurant, UmrahPackage } from '@/types';

export const prayerTimes: PrayerTime[] = [
  { name: 'Fajr', time: '05:45', icon: 'moon-outline' },
  { name: 'Sunrise', time: '07:05', icon: 'sunny-outline' },
  { name: 'Dhuhr', time: '13:15', icon: 'sunny' },
  { name: 'Asr', time: '16:30', icon: 'sunny' },
  { name: 'Maghrib', time: '19:25', icon: 'partly-sunny-outline' },
  { name: 'Isha', time: '20:40', icon: 'moon' },
];

export const halalRestaurants: HalalRestaurant[] = [
  { id: 'r1', name: 'Naritake Halal Ramen', cuisine: 'Japanese', rating: 4.6, distance: '0.5 km', priceRange: '$$', certification: 'JAKIM Certified', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', address: 'Shinjuku, Tokyo' },
  { id: 'r2', name: 'Gyumon Halal Wagyu', cuisine: 'Japanese BBQ', rating: 4.8, distance: '1.2 km', priceRange: '$$$', certification: 'JAKIM Certified', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', address: 'Shibuya, Tokyo' },
  { id: 'r3', name: 'Halal Sushi Asakusa', cuisine: 'Sushi', rating: 4.5, distance: '2.1 km', priceRange: '$$', certification: 'Muslim Friendly', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400', address: 'Asakusa, Tokyo' },
  { id: 'r4', name: 'Saray Kebab House', cuisine: 'Turkish', rating: 4.4, distance: '0.8 km', priceRange: '$', certification: 'Halal Certified', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', address: 'Roppongi, Tokyo' },
  { id: 'r5', name: 'Al-Flah Indian', cuisine: 'Indian', rating: 4.3, distance: '1.5 km', priceRange: '$', certification: 'JAKIM Certified', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', address: 'Ueno, Tokyo' },
];

export const umrahPackages: UmrahPackage[] = [
  { id: 'u1', name: 'Umrah Economy', duration: '10D9N', price: 5500, rating: 4.5, hotel: 'Hotel near Haram (500m)', inclusions: ['Return flights', 'Hotel accommodation', 'Ground transport', 'Visa processing', 'Guided ziarah', 'Meals included'], image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400', departureDate: '2026-06-15' },
  { id: 'u2', name: 'Umrah Premium', duration: '12D11N', price: 9800, rating: 4.8, hotel: 'Pullman ZamZam (Haram view)', inclusions: ['Return flights (Economy)', '5-star hotel', 'Private transport', 'Visa processing', 'Full board meals', 'Guided ziarah', 'Laundry service', 'Health insurance'], image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400', departureDate: '2026-06-15' },
  { id: 'u3', name: 'Umrah VIP', duration: '14D13N', price: 18500, rating: 4.9, hotel: 'Raffles Makkah Palace', inclusions: ['Return flights (Business)', 'Palace suite', 'Private chauffeur', 'VIP visa', 'Fine dining', 'Private guide', 'Spa access', 'Concierge service', 'Premium insurance'], image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400', departureDate: '2026-06-15' },
];
