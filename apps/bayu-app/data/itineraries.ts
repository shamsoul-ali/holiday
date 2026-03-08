import { Itinerary, DurationPreset, ScheduleActivity } from '@/types';
import { format, addDays, parseISO } from 'date-fns';

type DayTemplate = {
  dayOffset: number;
  title: string;
  activities: ScheduleActivity[];
};

type ItineraryTemplate = {
  title: string;
  days: DayTemplate[];
};

export const sabahItinerary: Itinerary = {
  id: 'itin-sabah-comfort',
  packageId: 'island-comfort',
  destination: 'Sabah, Malaysia',
  departureCity: 'Kuala Lumpur',
  startDate: '2026-04-15',
  endDate: '2026-04-18',
  travelers: { adults: 2, children: 0, infants: 0 },
  totalCost: 3500,
  currency: 'MYR',
  weather: '30°C Sunny',
  flight: {
    airline: 'AirAsia',
    flightNumber: 'AK5106',
    departure: { airport: 'KLIA2', time: '07:00', code: 'KUL' },
    arrival: { airport: 'Tawau Airport', time: '09:35', code: 'TWU' },
    duration: '2h 35m',
    class: 'Economy',
    price: 400,
    returnFlight: {
      flightNumber: 'AK5107',
      departure: { airport: 'Tawau Airport', time: '17:30', code: 'TWU' },
      arrival: { airport: 'KLIA2', time: '20:05', code: 'KUL' },
      duration: '2h 35m',
    },
  },
  hotel: {
    name: 'Sipadan Mabul Resort',
    stars: 4,
    location: 'Mabul Island, Semporna',
    roomType: 'Sea View Chalet',
    pricePerNight: 600,
    nights: 2,
    totalPrice: 1200,
    amenities: ['Dive Centre', 'Restaurant', 'Jetty', 'WiFi', 'Sea Views', 'Snorkeling Gear'],
    image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400',
  },
  days: [
    {
      day: 1, date: '2026-04-15', title: 'Arrival & Semporna',
      activities: [
        { id: 'a1', time: '07:00', title: 'Depart KUL - Flight AK5106', type: 'transport', duration: '2h 35m', cost: 0, location: 'KLIA2 Terminal', description: 'Early morning flight to Tawau' },
        { id: 'a2', time: '09:35', title: 'Arrive Tawau Airport', type: 'transport', duration: '30m', cost: 0, location: 'Tawau Airport', description: 'Immigration & luggage' },
        { id: 'a3', time: '10:30', title: 'Transfer to Semporna', type: 'transport', duration: '1h 30m', cost: 80, location: 'Tawau-Semporna Highway', tips: 'Scenic drive through oil palm estates' },
        { id: 'a4', time: '12:30', title: 'Seafood Lunch at Ocean King', type: 'meal', duration: '1h', cost: 50, location: 'Semporna Town', tips: 'Try the butter prawns & steamed grouper' },
        { id: 'a5', time: '14:00', title: 'Boat Transfer to Mabul Island', type: 'transport', duration: '45m', cost: 0, location: 'Semporna Jetty' },
        { id: 'a6', time: '15:00', title: 'Check-in & Resort Briefing', type: 'hotel', duration: '1h', cost: 0, location: 'Sipadan Mabul Resort' },
        { id: 'a7', time: '16:30', title: 'House Reef Snorkeling', type: 'activity', duration: '1h 30m', cost: 0, location: 'Mabul House Reef', tips: 'Look for turtles near the jetty' },
        { id: 'a8', time: '19:00', title: 'Dinner at Resort', type: 'meal', duration: '1h 30m', cost: 0, location: 'Resort Restaurant', description: 'Included full board meal' },
      ],
    },
    {
      day: 2, date: '2026-04-16', title: 'Sipadan Diving Day',
      activities: [
        { id: 'b1', time: '06:00', title: 'Early Breakfast', type: 'meal', duration: '30m', cost: 0, location: 'Resort Restaurant' },
        { id: 'b2', time: '07:00', title: 'Boat to Sipadan Island', type: 'transport', duration: '30m', cost: 0, location: 'Resort Jetty' },
        { id: 'b3', time: '08:00', title: 'Dive 1: Barracuda Point', type: 'activity', duration: '1h', cost: 0, location: 'Sipadan Island', tips: 'Famous barracuda tornado — keep your camera ready!', description: 'Drift dive along the wall, 18-25m depth' },
        { id: 'b4', time: '09:30', title: 'Dive 2: Turtle Tomb', type: 'activity', duration: '1h', cost: 0, location: 'Sipadan Island', tips: 'Underwater cave system — advanced divers only', description: 'See green & hawksbill turtles' },
        { id: 'b5', time: '11:00', title: 'Surface Interval & Snorkeling', type: 'activity', duration: '1h', cost: 0, location: 'Sipadan Island', description: 'Beach rest and shallow reef snorkeling' },
        { id: 'b6', time: '12:30', title: 'Packed Lunch on Island', type: 'meal', duration: '45m', cost: 0, location: 'Sipadan Island' },
        { id: 'b7', time: '13:30', title: 'Dive 3: South Point', type: 'activity', duration: '1h', cost: 0, location: 'Sipadan Island', tips: 'Look for hammerhead sharks & whitetip reef sharks' },
        { id: 'b8', time: '15:30', title: 'Return to Mabul', type: 'transport', duration: '30m', cost: 0, location: 'Sipadan Jetty' },
        { id: 'b9', time: '17:00', title: 'Mabul Village Walk', type: 'activity', duration: '1h', cost: 0, location: 'Mabul Village', description: 'Visit the Bajau sea gypsy stilt village' },
        { id: 'b10', time: '19:00', title: 'BBQ Seafood Dinner', type: 'meal', duration: '2h', cost: 0, location: 'Resort Beach', tips: 'Special BBQ night under the stars' },
      ],
    },
    {
      day: 3, date: '2026-04-17', title: 'Kinabatangan Wildlife',
      activities: [
        { id: 'c1', time: '06:00', title: 'Sunrise & Breakfast', type: 'meal', duration: '1h', cost: 0, location: 'Resort Restaurant' },
        { id: 'c2', time: '07:30', title: 'Boat to Semporna + Drive to Kinabatangan', type: 'transport', duration: '4h', cost: 120, location: 'Semporna to Sukau', tips: 'Long transfer — rest on the way' },
        { id: 'c3', time: '12:00', title: 'Lunch at River Lodge', type: 'meal', duration: '1h', cost: 60, location: 'Sukau Rainforest Lodge' },
        { id: 'c4', time: '14:00', title: 'Afternoon River Cruise', type: 'activity', duration: '2h', cost: 120, location: 'Kinabatangan River', tips: 'Look for proboscis monkeys, pygmy elephants & hornbills', description: 'Guided wildlife cruise along the riverbanks' },
        { id: 'c5', time: '16:30', title: 'Oxbow Lake Exploration', type: 'activity', duration: '1h 30m', cost: 0, location: 'Menanggul River', description: 'Hidden lake teeming with birdlife' },
        { id: 'c6', time: '19:00', title: 'Dinner at Lodge', type: 'meal', duration: '1h', cost: 60, location: 'Sukau Lodge' },
        { id: 'c7', time: '20:30', title: 'Night Jungle Walk', type: 'activity', duration: '1h 30m', cost: 80, location: 'Kinabatangan Trail', tips: 'Spot sleeping birds, insects & possibly slow loris' },
      ],
    },
    {
      day: 4, date: '2026-04-18', title: 'Sepilok & Departure',
      activities: [
        { id: 'd1', time: '06:00', title: 'Dawn River Cruise', type: 'activity', duration: '1h 30m', cost: 0, location: 'Kinabatangan River', tips: 'Best time for elephant sightings' },
        { id: 'd2', time: '08:00', title: 'Breakfast & Check-out', type: 'meal', duration: '1h', cost: 0, location: 'Sukau Lodge' },
        { id: 'd3', time: '09:30', title: 'Drive to Sepilok', type: 'transport', duration: '1h 30m', cost: 60, location: 'Sukau-Sandakan Road' },
        { id: 'd4', time: '11:00', title: 'Sepilok Orangutan Centre', type: 'activity', duration: '2h', cost: 60, location: 'Sepilok, Sandakan', tips: 'Feeding time at 10am & 3pm platform', description: 'Watch rehabilitated orangutans in semi-wild setting' },
        { id: 'd5', time: '13:00', title: 'Lunch at Sepilok', type: 'meal', duration: '45m', cost: 30, location: 'Sepilok area' },
        { id: 'd6', time: '14:00', title: 'Transfer to Tawau Airport', type: 'transport', duration: '2h 30m', cost: 100, location: 'Sandakan-Tawau Highway' },
        { id: 'd7', time: '17:30', title: 'Depart TWU - Flight AK5107', type: 'transport', duration: '2h 35m', cost: 0, location: 'Tawau Airport', description: 'Arrive KUL at 20:05' },
      ],
    },
  ],
};

// 2-day quick island itinerary template
const twoDay = {
  title: 'Quick Island Escape',
  days: [
    {
      dayOffset: 0, title: 'Arrival & Island Hopping',
      activities: [
        { id: 'q1', time: '07:00', title: 'Depart to Sabah', type: 'transport' as const, duration: '2h 35m', cost: 0, location: 'Airport' },
        { id: 'q2', time: '10:00', title: 'Arrive & Transfer', type: 'transport' as const, duration: '1h', cost: 80, location: 'Airport to Jetty' },
        { id: 'q3', time: '11:30', title: 'Island Hopping Begins', type: 'activity' as const, duration: '2h', cost: 150, location: 'Marine Park' },
        { id: 'q4', time: '13:30', title: 'Seafood Lunch on Island', type: 'meal' as const, duration: '1h', cost: 50, location: 'Island Restaurant' },
        { id: 'q5', time: '15:00', title: 'Snorkeling & Beach', type: 'activity' as const, duration: '2h', cost: 0, location: 'Coral Reef' },
        { id: 'q6', time: '17:30', title: 'Check-in Resort', type: 'hotel' as const, duration: '1h', cost: 0, location: 'Beach Resort' },
        { id: 'q7', time: '19:00', title: 'Sunset Dinner', type: 'meal' as const, duration: '1h 30m', cost: 60, location: 'Resort Restaurant' },
      ],
    },
    {
      dayOffset: 1, title: 'Beach Morning & Departure',
      activities: [
        { id: 'q8', time: '07:00', title: 'Sunrise Beach Walk', type: 'activity' as const, duration: '1h', cost: 0, location: 'Beach' },
        { id: 'q9', time: '08:30', title: 'Breakfast & Check-out', type: 'meal' as const, duration: '1h', cost: 0, location: 'Resort' },
        { id: 'q10', time: '10:00', title: 'Marine Park Snorkeling', type: 'activity' as const, duration: '2h', cost: 0, location: 'House Reef' },
        { id: 'q11', time: '12:30', title: 'Lunch', type: 'meal' as const, duration: '1h', cost: 40, location: 'Waterfront' },
        { id: 'q12', time: '14:00', title: 'Transfer to Airport', type: 'transport' as const, duration: '2h', cost: 80, location: 'Highway' },
        { id: 'q13', time: '17:00', title: 'Depart Sabah', type: 'transport' as const, duration: '2h 35m', cost: 0, location: 'Airport' },
      ],
    },
  ],
};

// 5-day adventure template
const fiveDay = {
  title: 'Sabah Grand Adventure',
  days: [
    {
      dayOffset: 0, title: 'Arrival & Semporna',
      activities: [
        { id: 'f1', time: '07:00', title: 'Depart to Sabah', type: 'transport' as const, duration: '2h 35m', cost: 0, location: 'Airport' },
        { id: 'f2', time: '10:00', title: 'Arrive & Transfer to Semporna', type: 'transport' as const, duration: '1h 30m', cost: 80, location: 'Tawau to Semporna' },
        { id: 'f3', time: '12:30', title: 'Seafood Lunch', type: 'meal' as const, duration: '1h', cost: 50, location: 'Semporna' },
        { id: 'f4', time: '14:00', title: 'Boat to Resort', type: 'transport' as const, duration: '45m', cost: 0, location: 'Jetty' },
        { id: 'f5', time: '15:30', title: 'House Reef Snorkeling', type: 'activity' as const, duration: '2h', cost: 0, location: 'Mabul' },
        { id: 'f6', time: '19:00', title: 'Welcome Dinner', type: 'meal' as const, duration: '1h 30m', cost: 0, location: 'Resort' },
      ],
    },
    {
      dayOffset: 1, title: 'Sipadan Diving Day',
      activities: [
        { id: 'f7', time: '06:00', title: 'Early Breakfast', type: 'meal' as const, duration: '30m', cost: 0, location: 'Resort' },
        { id: 'f8', time: '07:00', title: 'Boat to Sipadan', type: 'transport' as const, duration: '30m', cost: 0, location: 'Jetty' },
        { id: 'f9', time: '08:00', title: 'Dive/Snorkel: Barracuda Point', type: 'activity' as const, duration: '1h', cost: 0, location: 'Sipadan' },
        { id: 'f10', time: '10:00', title: 'Dive/Snorkel: Turtle Tomb', type: 'activity' as const, duration: '1h', cost: 0, location: 'Sipadan' },
        { id: 'f11', time: '12:00', title: 'Packed Lunch', type: 'meal' as const, duration: '45m', cost: 0, location: 'Sipadan Beach' },
        { id: 'f12', time: '14:00', title: 'Dive/Snorkel: South Point', type: 'activity' as const, duration: '1h', cost: 0, location: 'Sipadan' },
        { id: 'f13', time: '16:00', title: 'Return & Village Walk', type: 'activity' as const, duration: '1h 30m', cost: 0, location: 'Mabul Village' },
        { id: 'f14', time: '19:00', title: 'BBQ Seafood Dinner', type: 'meal' as const, duration: '2h', cost: 0, location: 'Resort Beach' },
      ],
    },
    {
      dayOffset: 2, title: 'Bohey Dulang & Tun Sakaran',
      activities: [
        { id: 'f15', time: '06:00', title: 'Breakfast', type: 'meal' as const, duration: '30m', cost: 0, location: 'Resort' },
        { id: 'f16', time: '07:00', title: 'Boat to Bohey Dulang', type: 'transport' as const, duration: '30m', cost: 50, location: 'Marine Park' },
        { id: 'f17', time: '08:00', title: 'Hike to Summit Viewpoint', type: 'activity' as const, duration: '2h', cost: 0, location: 'Bohey Dulang Trail' },
        { id: 'f18', time: '10:30', title: 'Island Hopping: Mantabuan & Sibuan', type: 'activity' as const, duration: '3h', cost: 80, location: 'Tun Sakaran' },
        { id: 'f19', time: '13:30', title: 'Lunch', type: 'meal' as const, duration: '1h', cost: 40, location: 'Boat/Island' },
        { id: 'f20', time: '15:00', title: 'Return & Free Time', type: 'activity' as const, duration: '2h', cost: 0, location: 'Resort' },
        { id: 'f21', time: '19:00', title: 'Dinner', type: 'meal' as const, duration: '1h 30m', cost: 0, location: 'Resort' },
      ],
    },
    {
      dayOffset: 3, title: 'Kinabatangan Wildlife',
      activities: [
        { id: 'f22', time: '06:00', title: 'Breakfast & Check-out', type: 'meal' as const, duration: '1h', cost: 0, location: 'Resort' },
        { id: 'f23', time: '07:30', title: 'Transfer to Kinabatangan', type: 'transport' as const, duration: '4h', cost: 120, location: 'Semporna to Sukau' },
        { id: 'f24', time: '12:00', title: 'Lunch at River Lodge', type: 'meal' as const, duration: '1h', cost: 60, location: 'Sukau' },
        { id: 'f25', time: '14:00', title: 'Afternoon River Cruise', type: 'activity' as const, duration: '2h', cost: 120, location: 'Kinabatangan River' },
        { id: 'f26', time: '16:30', title: 'Oxbow Lake Exploration', type: 'activity' as const, duration: '1h 30m', cost: 0, location: 'Menanggul River' },
        { id: 'f27', time: '19:00', title: 'Dinner', type: 'meal' as const, duration: '1h', cost: 60, location: 'Lodge' },
        { id: 'f28', time: '20:30', title: 'Night Jungle Walk', type: 'activity' as const, duration: '1h 30m', cost: 80, location: 'Kinabatangan Trail' },
      ],
    },
    {
      dayOffset: 4, title: 'Sepilok & Departure',
      activities: [
        { id: 'f29', time: '06:00', title: 'Dawn River Cruise', type: 'activity' as const, duration: '1h 30m', cost: 0, location: 'Kinabatangan River' },
        { id: 'f30', time: '08:00', title: 'Breakfast & Check-out', type: 'meal' as const, duration: '1h', cost: 0, location: 'Lodge' },
        { id: 'f31', time: '09:30', title: 'Drive to Sepilok', type: 'transport' as const, duration: '1h 30m', cost: 60, location: 'Sukau-Sandakan' },
        { id: 'f32', time: '11:00', title: 'Sepilok Orangutan Centre', type: 'activity' as const, duration: '2h', cost: 60, location: 'Sepilok' },
        { id: 'f33', time: '13:00', title: 'Lunch', type: 'meal' as const, duration: '45m', cost: 30, location: 'Sepilok' },
        { id: 'f34', time: '14:00', title: 'Transfer to Airport', type: 'transport' as const, duration: '2h 30m', cost: 100, location: 'Sandakan-Tawau' },
        { id: 'f35', time: '17:30', title: 'Depart Sabah', type: 'transport' as const, duration: '2h 35m', cost: 0, location: 'Airport' },
      ],
    },
  ],
};

// 7-day ultimate template
const sevenDay = {
  title: 'Ultimate Sabah Explorer',
  days: [
    {
      dayOffset: 0, title: 'Arrival & KK City',
      activities: [
        { id: 'u1', time: '07:00', title: 'Arrive Kota Kinabalu', type: 'transport' as const, duration: '2h 35m', cost: 0, location: 'KKIA' },
        { id: 'u2', time: '10:00', title: 'Check-in & Rest', type: 'hotel' as const, duration: '1h', cost: 0, location: 'KK City' },
        { id: 'u3', time: '12:00', title: 'Gaya Street & Filipino Market', type: 'activity' as const, duration: '2h', cost: 0, location: 'KK City' },
        { id: 'u4', time: '14:30', title: 'Lunch — Sang Nyuk Mian', type: 'meal' as const, duration: '1h', cost: 30, location: 'KK City' },
        { id: 'u5', time: '16:00', title: 'Signal Hill Sunset', type: 'activity' as const, duration: '1h 30m', cost: 0, location: 'Signal Hill' },
        { id: 'u6', time: '18:30', title: 'Night Market Seafood', type: 'meal' as const, duration: '2h', cost: 60, location: 'KK Waterfront' },
      ],
    },
    {
      dayOffset: 1, title: 'TARP Island Hopping',
      activities: [
        { id: 'u7', time: '08:00', title: 'Breakfast', type: 'meal' as const, duration: '30m', cost: 0, location: 'Hotel' },
        { id: 'u8', time: '09:00', title: 'Ferry to Manukan Island', type: 'transport' as const, duration: '20m', cost: 40, location: 'Jesselton Point' },
        { id: 'u9', time: '09:30', title: 'Snorkeling at Manukan', type: 'activity' as const, duration: '2h', cost: 0, location: 'Manukan Island' },
        { id: 'u10', time: '12:00', title: 'Lunch on Sapi Island', type: 'meal' as const, duration: '1h', cost: 40, location: 'Sapi Island' },
        { id: 'u11', time: '13:30', title: 'Zipline Sapi to Gaya', type: 'activity' as const, duration: '30m', cost: 60, location: 'Sapi-Gaya' },
        { id: 'u12', time: '14:30', title: 'Gaya Island Hiking', type: 'activity' as const, duration: '2h', cost: 0, location: 'Gaya Island' },
        { id: 'u13', time: '17:00', title: 'Return to KK', type: 'transport' as const, duration: '20m', cost: 0, location: 'Ferry' },
        { id: 'u14', time: '19:00', title: 'Dinner', type: 'meal' as const, duration: '1h 30m', cost: 50, location: 'KK City' },
      ],
    },
    {
      dayOffset: 2, title: 'Mt Kinabalu & Kundasang',
      activities: [
        { id: 'u15', time: '06:00', title: 'Drive to Kinabalu Park', type: 'transport' as const, duration: '2h', cost: 80, location: 'KK to Ranau' },
        { id: 'u16', time: '08:30', title: 'Kinabalu Park Nature Walk', type: 'activity' as const, duration: '2h', cost: 30, location: 'Kinabalu Park' },
        { id: 'u17', time: '11:00', title: 'Poring Hot Springs', type: 'activity' as const, duration: '1h 30m', cost: 15, location: 'Poring' },
        { id: 'u18', time: '13:00', title: 'Lunch at Kundasang Market', type: 'meal' as const, duration: '1h', cost: 30, location: 'Kundasang' },
        { id: 'u19', time: '14:30', title: 'Desa Dairy Farm', type: 'activity' as const, duration: '1h 30m', cost: 10, location: 'Kundasang' },
        { id: 'u20', time: '16:30', title: 'Scenic Drive Back', type: 'transport' as const, duration: '2h', cost: 0, location: 'Ranau-KK' },
        { id: 'u21', time: '19:30', title: 'Dinner', type: 'meal' as const, duration: '1h 30m', cost: 50, location: 'KK' },
      ],
    },
    {
      dayOffset: 3, title: 'Fly to Semporna & Island Life',
      activities: [
        { id: 'u22', time: '07:00', title: 'Fly KK to Tawau', type: 'transport' as const, duration: '50m', cost: 150, location: 'KKIA' },
        { id: 'u23', time: '08:30', title: 'Transfer to Semporna', type: 'transport' as const, duration: '1h 30m', cost: 80, location: 'Tawau-Semporna' },
        { id: 'u24', time: '10:30', title: 'Boat to Resort', type: 'transport' as const, duration: '45m', cost: 0, location: 'Semporna Jetty' },
        { id: 'u25', time: '12:00', title: 'Lunch & Check-in', type: 'meal' as const, duration: '1h', cost: 0, location: 'Resort' },
        { id: 'u26', time: '14:00', title: 'Afternoon Snorkeling', type: 'activity' as const, duration: '2h', cost: 0, location: 'House Reef' },
        { id: 'u27', time: '19:00', title: 'Dinner', type: 'meal' as const, duration: '1h 30m', cost: 0, location: 'Resort' },
      ],
    },
    {
      dayOffset: 4, title: 'Sipadan Diving Day',
      activities: [
        { id: 'u28', time: '06:00', title: 'Breakfast', type: 'meal' as const, duration: '30m', cost: 0, location: 'Resort' },
        { id: 'u29', time: '07:00', title: 'Boat to Sipadan', type: 'transport' as const, duration: '30m', cost: 0, location: 'Jetty' },
        { id: 'u30', time: '08:00', title: 'Dive/Snorkel: Barracuda Point', type: 'activity' as const, duration: '1h', cost: 0, location: 'Sipadan' },
        { id: 'u31', time: '10:00', title: 'Dive/Snorkel: Turtle Tomb', type: 'activity' as const, duration: '1h', cost: 0, location: 'Sipadan' },
        { id: 'u32', time: '12:00', title: 'Lunch on Island', type: 'meal' as const, duration: '1h', cost: 0, location: 'Sipadan' },
        { id: 'u33', time: '14:00', title: 'Dive/Snorkel: South Point', type: 'activity' as const, duration: '1h', cost: 0, location: 'Sipadan' },
        { id: 'u34', time: '16:00', title: 'Return & Free Time', type: 'activity' as const, duration: '2h', cost: 0, location: 'Resort' },
        { id: 'u35', time: '19:00', title: 'BBQ Night', type: 'meal' as const, duration: '2h', cost: 0, location: 'Beach' },
      ],
    },
    {
      dayOffset: 5, title: 'Kinabatangan Wildlife',
      activities: [
        { id: 'u36', time: '06:00', title: 'Check-out & Transfer', type: 'transport' as const, duration: '4h', cost: 120, location: 'Semporna to Sukau' },
        { id: 'u37', time: '11:00', title: 'Arrive Lodge & Lunch', type: 'meal' as const, duration: '1h 30m', cost: 60, location: 'Sukau Lodge' },
        { id: 'u38', time: '14:00', title: 'Afternoon River Cruise', type: 'activity' as const, duration: '2h', cost: 120, location: 'Kinabatangan River' },
        { id: 'u39', time: '16:30', title: 'Oxbow Lake', type: 'activity' as const, duration: '1h 30m', cost: 0, location: 'Menanggul River' },
        { id: 'u40', time: '19:00', title: 'Dinner', type: 'meal' as const, duration: '1h', cost: 60, location: 'Lodge' },
        { id: 'u41', time: '20:30', title: 'Night Walk', type: 'activity' as const, duration: '1h 30m', cost: 80, location: 'Jungle Trail' },
      ],
    },
    {
      dayOffset: 6, title: 'Sepilok & Departure',
      activities: [
        { id: 'u42', time: '06:00', title: 'Dawn River Cruise', type: 'activity' as const, duration: '1h 30m', cost: 0, location: 'Kinabatangan' },
        { id: 'u43', time: '08:00', title: 'Breakfast & Check-out', type: 'meal' as const, duration: '1h', cost: 0, location: 'Lodge' },
        { id: 'u44', time: '09:30', title: 'Drive to Sepilok', type: 'transport' as const, duration: '1h 30m', cost: 60, location: 'Sukau-Sandakan' },
        { id: 'u45', time: '11:00', title: 'Sepilok Orangutan Centre', type: 'activity' as const, duration: '2h', cost: 60, location: 'Sepilok' },
        { id: 'u46', time: '13:00', title: 'Lunch', type: 'meal' as const, duration: '45m', cost: 30, location: 'Sepilok' },
        { id: 'u47', time: '14:00', title: 'Transfer to Airport', type: 'transport' as const, duration: '2h 30m', cost: 100, location: 'Sandakan-Tawau' },
        { id: 'u48', time: '17:30', title: 'Depart Sabah', type: 'transport' as const, duration: '2h 35m', cost: 0, location: 'Airport' },
      ],
    },
  ],
};

const durationTemplates: Record<string, ItineraryTemplate> = {
  '2D1N': twoDay,
  '3D2N': { title: 'Sabah Island Getaway', days: sabahItinerary.days.slice(0, 3).map((d, i) => ({ dayOffset: i, title: d.title, activities: d.activities })) },
  '4D3N': { title: 'Sabah Explorer', days: sabahItinerary.days.map((d, i) => ({ dayOffset: i, title: d.title, activities: d.activities })) },
  '5D4N': fiveDay,
  '7D6N': sevenDay,
};

export const getItineraryForDuration = (
  duration: DurationPreset,
  destination: string,
  startDate: string,
  departureCity: string,
): Itinerary => {
  const template = durationTemplates[duration] || durationTemplates['4D3N'];
  const daysCount = parseInt(duration.charAt(0));
  const nightsCount = daysCount - 1;

  const days = template.days.map((dayTemplate, i) => ({
    day: i + 1,
    date: format(addDays(parseISO(startDate || '2026-04-15'), i), 'yyyy-MM-dd'),
    title: dayTemplate.title,
    activities: dayTemplate.activities,
  }));

  return {
    id: `itin-${duration.toLowerCase()}-${Date.now()}`,
    packageId: 'island-comfort',
    destination: destination || 'Sabah, Malaysia',
    departureCity: departureCity || 'Kuala Lumpur',
    startDate: startDate || '2026-04-15',
    endDate: format(addDays(parseISO(startDate || '2026-04-15'), daysCount - 1), 'yyyy-MM-dd'),
    travelers: { adults: 2, children: 0, infants: 0 },
    totalCost: 3500,
    currency: 'MYR',
    weather: '30°C Sunny',
    flight: {
      airline: 'AirAsia',
      flightNumber: 'AK5106',
      departure: { airport: departureCity === 'Kuala Lumpur' ? 'KLIA2' : `${departureCity} Airport`, time: '07:00', code: departureCity === 'Kuala Lumpur' ? 'KUL' : departureCity.substring(0, 3).toUpperCase() },
      arrival: { airport: 'Tawau Airport', time: '09:35', code: 'TWU' },
      duration: '2h 35m',
      class: 'Economy',
      price: 400,
      returnFlight: {
        flightNumber: 'AK5107',
        departure: { airport: 'Tawau Airport', time: '17:30', code: 'TWU' },
        arrival: { airport: departureCity === 'Kuala Lumpur' ? 'KLIA2' : `${departureCity} Airport`, time: '20:05', code: departureCity === 'Kuala Lumpur' ? 'KUL' : departureCity.substring(0, 3).toUpperCase() },
        duration: '2h 35m',
      },
    },
    hotel: {
      name: 'Sipadan Mabul Resort',
      stars: 4,
      location: 'Mabul Island, Semporna',
      roomType: 'Sea View Chalet',
      pricePerNight: 600,
      nights: nightsCount,
      totalPrice: 600 * nightsCount,
      amenities: ['Dive Centre', 'Restaurant', 'Jetty', 'WiFi', 'Sea Views', 'Snorkeling Gear'],
      image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400',
    },
    days,
  };
};

export const allItineraries = [sabahItinerary];
