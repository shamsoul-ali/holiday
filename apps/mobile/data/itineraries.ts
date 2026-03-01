import { Itinerary } from '@/types';

export const tokyoItinerary: Itinerary = {
  id: 'itin-tokyo-comfort',
  packageId: 'tokyo-comfort',
  destination: 'Tokyo, Japan',
  departureCity: 'Kuala Lumpur',
  startDate: '2026-04-15',
  endDate: '2026-04-19',
  travelers: { adults: 2, children: 0, infants: 0 },
  totalCost: 8500,
  currency: 'MYR',
  weather: '18°C Partly Cloudy',
  flight: {
    airline: 'Malaysia Airlines',
    flightNumber: 'MH70',
    departure: { airport: 'KLIA', time: '09:30', code: 'KUL' },
    arrival: { airport: 'Narita', time: '17:45', code: 'NRT' },
    duration: '7h 15m',
    class: 'Economy',
    price: 1700,
    returnFlight: {
      flightNumber: 'MH71',
      departure: { airport: 'Narita', time: '17:30', code: 'NRT' },
      arrival: { airport: 'KLIA', time: '23:45', code: 'KUL' },
      duration: '7h 15m',
    },
  },
  hotel: {
    name: 'Hotel Gracery Shinjuku',
    stars: 4,
    location: 'Shinjuku City, Tokyo',
    roomType: 'Superior Twin Room',
    pricePerNight: 525,
    nights: 4,
    totalPrice: 2100,
    amenities: ['Free WiFi', 'Restaurant', '24h Front Desk', 'Luggage Storage', 'City Views', 'A/C'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
  },
  days: [
    {
      day: 1, date: '2026-04-15', title: 'Arrival & Shinjuku',
      activities: [
        { id: 'a1', time: '09:30', title: 'Depart KUL - Flight MH70', type: 'transport', duration: '7h 15m', cost: 0, location: 'KLIA Terminal 1', description: 'Pre-order halal meals on flight' },
        { id: 'a2', time: '17:45', title: 'Arrive Narita Airport', type: 'transport', duration: '1h', cost: 0, location: 'Narita International Airport', description: 'Immigration & luggage collection' },
        { id: 'a3', time: '19:00', title: 'Airport Transfer to Hotel', type: 'transport', duration: '1h 30m', cost: 80, location: 'Narita Express', tips: 'Purchase Suica card at airport' },
        { id: 'a4', time: '20:30', title: 'Check-in Hotel Gracery', type: 'hotel', duration: '30m', cost: 0, location: 'Hotel Gracery Shinjuku' },
        { id: 'a5', time: '21:00', title: 'Halal Dinner at Naritake', type: 'meal', duration: '1h', cost: 60, location: 'Shinjuku, Tokyo', tips: 'Halal-certified ramen shop' },
      ],
    },
    {
      day: 2, date: '2026-04-16', title: 'Asakusa & Akihabara',
      activities: [
        { id: 'b1', time: '07:00', title: 'Breakfast at Hotel', type: 'meal', duration: '45m', cost: 0, location: 'Hotel Gracery Restaurant' },
        { id: 'b2', time: '08:30', title: 'Senso-ji Temple', type: 'activity', duration: '2h', cost: 0, location: 'Asakusa, Tokyo', tips: 'Arrive early to avoid crowds' },
        { id: 'b3', time: '10:30', title: 'Nakamise Shopping Street', type: 'shopping', duration: '1h', cost: 50, location: 'Asakusa, Tokyo', description: 'Traditional snacks and souvenirs' },
        { id: 'b4', time: '12:00', title: 'Halal Lunch - Asakusa Sushi', type: 'meal', duration: '1h', cost: 80, location: 'Asakusa, Tokyo', tips: 'JAKIM certified halal sushi' },
        { id: 'b5', time: '14:00', title: 'Akihabara Electric Town', type: 'activity', duration: '2h 30m', cost: 0, location: 'Akihabara, Tokyo', description: 'Anime, manga & electronics paradise' },
        { id: 'b6', time: '17:00', title: 'Tokyo Skytree', type: 'activity', duration: '2h', cost: 80, location: 'Sumida, Tokyo', tips: 'Book tickets online for shorter queue' },
        { id: 'b7', time: '19:30', title: 'Halal Yakiniku Dinner', type: 'meal', duration: '1h 30m', cost: 120, location: 'Sumida, Tokyo', tips: 'Halal-certified Japanese BBQ' },
      ],
    },
    {
      day: 3, date: '2026-04-17', title: 'Shibuya & Harajuku',
      activities: [
        { id: 'c1', time: '07:00', title: 'Breakfast at Hotel', type: 'meal', duration: '45m', cost: 0, location: 'Hotel Gracery Restaurant' },
        { id: 'c2', time: '09:00', title: 'Meiji Shrine', type: 'activity', duration: '1h 30m', cost: 0, location: 'Shibuya, Tokyo', tips: 'Beautiful forest walk in the city' },
        { id: 'c3', time: '11:00', title: 'Harajuku & Takeshita Street', type: 'shopping', duration: '2h', cost: 100, location: 'Harajuku, Tokyo', description: 'Trendy fashion & unique snacks' },
        { id: 'c4', time: '13:00', title: 'Halal Lunch at Gyumon', type: 'meal', duration: '1h', cost: 70, location: 'Shibuya, Tokyo', tips: 'Halal wagyu beef restaurant' },
        { id: 'c5', time: '14:30', title: 'Shibuya Crossing & Hachiko', type: 'activity', duration: '1h', cost: 0, location: 'Shibuya, Tokyo', description: "World's busiest pedestrian crossing" },
        { id: 'c6', time: '16:00', title: 'Shibuya Sky Observatory', type: 'activity', duration: '1h 30m', cost: 75, location: 'Shibuya, Tokyo', tips: 'Best sunset views of Tokyo' },
        { id: 'c7', time: '18:30', title: 'Halal Dinner at Shinbashi', type: 'meal', duration: '1h 30m', cost: 90, location: 'Minato, Tokyo' },
      ],
    },
    {
      day: 4, date: '2026-04-18', title: 'Day Trip - Mt. Fuji Area',
      activities: [
        { id: 'd1', time: '06:30', title: 'Early Breakfast', type: 'meal', duration: '30m', cost: 30, location: 'Hotel Gracery' },
        { id: 'd2', time: '07:30', title: 'Bullet Train to Mishima', type: 'transport', duration: '1h', cost: 120, location: 'Shinjuku Station', tips: 'Sit on right side for Mt. Fuji views' },
        { id: 'd3', time: '09:00', title: 'Lake Kawaguchiko', type: 'activity', duration: '3h', cost: 50, location: 'Fujikawaguchiko', description: 'Stunning lake views with Mt. Fuji backdrop' },
        { id: 'd4', time: '12:30', title: 'Halal Lunch near Lake', type: 'meal', duration: '1h', cost: 60, location: 'Kawaguchiko area' },
        { id: 'd5', time: '14:00', title: 'Chureito Pagoda', type: 'activity', duration: '2h', cost: 0, location: 'Fujiyoshida', tips: 'Iconic photo spot - 400 steps up' },
        { id: 'd6', time: '16:30', title: 'Return to Tokyo', type: 'transport', duration: '1h 30m', cost: 120, location: 'Mishima Station' },
        { id: 'd7', time: '19:00', title: 'Farewell Dinner at Halal Wagyu', type: 'meal', duration: '2h', cost: 150, location: 'Shinjuku, Tokyo', tips: 'Premium halal wagyu experience' },
      ],
    },
    {
      day: 5, date: '2026-04-19', title: 'Departure',
      activities: [
        { id: 'e1', time: '08:00', title: 'Breakfast & Check-out', type: 'meal', duration: '1h', cost: 0, location: 'Hotel Gracery', description: 'Pack and check out by 10am' },
        { id: 'e2', time: '10:00', title: 'Last Minute Shopping', type: 'shopping', duration: '2h', cost: 100, location: 'Shinjuku Station area', tips: 'Don Quijote for souvenirs' },
        { id: 'e3', time: '12:30', title: 'Quick Halal Lunch', type: 'meal', duration: '45m', cost: 40, location: 'Shinjuku, Tokyo' },
        { id: 'e4', time: '14:00', title: 'Transfer to Narita Airport', type: 'transport', duration: '1h 30m', cost: 80, location: 'Narita Express' },
        { id: 'e5', time: '17:30', title: 'Depart NRT - Flight MH71', type: 'transport', duration: '7h 15m', cost: 0, location: 'Narita International Airport', description: 'Arrive KUL at 23:45' },
      ],
    },
  ],
};

export const allItineraries = [tokyoItinerary];
