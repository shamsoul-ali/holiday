import { Destination } from '@/types';

export const malaysianDestinations: Destination[] = [
  { id: 'kl', name: 'Kuala Lumpur', country: 'Malaysia', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400', rating: 4.7, price: 250, currency: 'MYR', description: 'Vibrant capital city with iconic towers', tags: ['City', 'Shopping', 'Food'], accommodations: 19902, isPopular: true, isMalaysia: true },
  { id: 'penang', name: 'Penang', country: 'Malaysia', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400', rating: 4.8, price: 180, currency: 'MYR', description: 'UNESCO heritage & street food paradise', tags: ['Heritage', 'Food', 'Beach'], accommodations: 5161, isPopular: true, isMalaysia: true },
  { id: 'malacca', name: 'Malacca', country: 'Malaysia', image: 'https://images.unsplash.com/photo-1596200205796-c3083e6eb5f5?w=400', rating: 4.6, price: 150, currency: 'MYR', description: 'Historical city with colonial charm', tags: ['Heritage', 'Culture', 'Food'], accommodations: 5883, isPopular: true, isMalaysia: true },
  { id: 'kk', name: 'Kota Kinabalu', country: 'Malaysia', image: 'https://images.unsplash.com/photo-1600586103402-4d1e0e05e1c5?w=400', rating: 4.7, price: 320, currency: 'MYR', description: 'Gateway to Mount Kinabalu & islands', tags: ['Nature', 'Adventure', 'Beach'], accommodations: 3417, isPopular: true, isMalaysia: true },
  { id: 'jb', name: 'Johor Bahru', country: 'Malaysia', image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400', rating: 4.3, price: 200, currency: 'MYR', description: 'Southern gateway with theme parks', tags: ['Family', 'Shopping', 'Theme Park'], accommodations: 6994, isPopular: true, isMalaysia: true },
];

export const internationalDestinations: Destination[] = [
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', rating: 4.9, price: 4250, currency: 'MYR', description: 'Tradition meets futuristic innovation', tags: ['Culture', 'Food', 'Technology'], accommodations: 28500, isPopular: true },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400', rating: 4.6, price: 1800, currency: 'MYR', description: 'Temples, street food & nightlife', tags: ['Culture', 'Food', 'Shopping'], accommodations: 12048, isPopular: true },
  { id: 'bali', name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', rating: 4.8, price: 2200, currency: 'MYR', description: 'Island of gods with rice terraces', tags: ['Beach', 'Culture', 'Wellness'], accommodations: 18200, isPopular: true },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400', rating: 4.7, price: 3500, currency: 'MYR', description: 'K-culture, tech & ancient palaces', tags: ['Culture', 'Shopping', 'Food'], accommodations: 15300, isPopular: true },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400', rating: 4.8, price: 3800, currency: 'MYR', description: 'Where East meets West', tags: ['Heritage', 'Culture', 'Food'], accommodations: 9500, isPopular: true },
  { id: 'dubai', name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400', rating: 4.7, price: 5500, currency: 'MYR', description: 'Luxury shopping & ultramodern architecture', tags: ['Luxury', 'Shopping', 'City'], accommodations: 11200, isPopular: true },
  { id: 'maldives', name: 'Maldives', country: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400', rating: 4.9, price: 8500, currency: 'MYR', description: 'Overwater villas & crystal waters', tags: ['Beach', 'Luxury', 'Romance'], accommodations: 450, isPopular: true },
  { id: 'manila', name: 'Manila', country: 'Philippines', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400', rating: 4.3, price: 1500, currency: 'MYR', description: 'Vibrant capital with rich history', tags: ['City', 'Culture', 'Food'], accommodations: 13223, isPopular: true },
];

export const featuredDestinations: Destination[] = [
  { id: 'tokyo-f', name: 'Tokyo, Japan', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', rating: 4.9, price: 4250, currency: 'MYR', description: '5D4N All-Inclusive Halal Package', tags: ['AI Pick', 'Halal Friendly'] },
  { id: 'istanbul-f', name: 'Istanbul, Turkey', country: 'Turkey', image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400', rating: 4.8, price: 3800, currency: 'MYR', description: '7D6N Cultural Heritage Tour', tags: ['Trending', 'Muslim Friendly'] },
  { id: 'maldives-f', name: 'Maldives', country: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400', rating: 4.9, price: 8500, currency: 'MYR', description: '4D3N Luxury Overwater Villa', tags: ['Honeymoon', 'Premium'] },
  { id: 'bali-f', name: 'Bali, Indonesia', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', rating: 4.8, price: 2200, currency: 'MYR', description: '6D5N Wellness & Culture Retreat', tags: ['Popular', 'Halal Options'] },
];

export const allDestinations = [...malaysianDestinations, ...internationalDestinations];
