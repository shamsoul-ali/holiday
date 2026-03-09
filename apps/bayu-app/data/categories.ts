import { Category } from '@/types';
import { Colors } from '@/constants/colors';

export const categories: Category[] = [
  { id: 'islands', name: 'Islands & Beach', icon: 'sunny', color: Colors.sky, description: 'Tropical islands & crystal waters' },
  { id: 'diving', name: 'Diving & Snorkeling', icon: 'water', color: Colors.ocean, description: 'World-class dive sites' },
  { id: 'mountains', name: 'Mountains & Hiking', icon: 'trail-sign', color: Colors.jungle, description: 'Trek Kinabalu & highland trails' },
  { id: 'wildlife', name: 'Wildlife & Nature', icon: 'leaf', color: Colors.secondaryLight, description: 'Orangutans, elephants & rainforest' },
  { id: 'cultural', name: 'Cultural Heritage', icon: 'people', color: Colors.category.cultural, description: 'Indigenous tribes & traditions' },
  { id: 'food-tours', name: 'Food Tours', icon: 'restaurant', color: Colors.sunset, description: 'Sabah seafood & local cuisine' },
  { id: 'eco-tourism', name: 'Eco-Tourism', icon: 'earth', color: Colors.secondary, description: 'Sustainable travel experiences' },
  { id: 'adventure', name: 'Adventure Sports', icon: 'compass', color: Colors.coral, description: 'Rafting, climbing & paragliding' },
];
