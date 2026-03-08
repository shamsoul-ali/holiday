// Navigation types
export type TierType = 'budget' | 'comfort' | 'luxury';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'fpx' | 'card' | 'ewallet' | 'bnpl' | 'bayu-credit';
export type ActivityType = 'transport' | 'meal' | 'activity' | 'hotel' | 'shopping' | 'free_time';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  nationality: string;
  tripsCount: number;
  countriesVisited: number;
  loyaltyPoints: number;
  preferredCurrency: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  price: number;
  currency: string;
  description: string;
  tags: string[];
  accommodations?: number;
  isPopular?: boolean;
  isMalaysia?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface TripPackage {
  id: string;
  tier: TierType;
  title: string;
  destination: string;
  duration: string;
  price: number;
  pricePerPerson: number;
  currency: string;
  rating: number;
  highlights: string[];
  inclusions: string[];
  image: string;
  isRecommended?: boolean;
  priceBreakdown: PriceBreakdown;
}

export interface PriceBreakdown {
  flights: number;
  accommodation: number;
  meals: number;
  activities: number;
  transport: number;
  insurance: number;
  taxes: number;
  total: number;
}

export interface DaySchedule {
  day: number;
  date: string;
  title: string;
  activities: ScheduleActivity[];
}

export interface ScheduleActivity {
  id: string;
  time: string;
  title: string;
  type: ActivityType;
  duration: string;
  cost: number;
  location: string;
  description?: string;
  tips?: string;
  image?: string;
}

export interface Itinerary {
  id: string;
  packageId: string;
  destination: string;
  departureCity: string;
  startDate: string;
  endDate: string;
  travelers: { adults: number; children: number; infants: number };
  totalCost: number;
  currency: string;
  weather: string;
  days: DaySchedule[];
  flight: FlightInfo;
  hotel: HotelInfo;
}

export interface FlightInfo {
  airline: string;
  flightNumber: string;
  departure: { airport: string; time: string; code: string };
  arrival: { airport: string; time: string; code: string };
  duration: string;
  class: string;
  price: number;
  returnFlight?: {
    flightNumber: string;
    departure: { airport: string; time: string; code: string };
    arrival: { airport: string; time: string; code: string };
    duration: string;
  };
}

export interface HotelInfo {
  name: string;
  stars: number;
  location: string;
  roomType: string;
  pricePerNight: number;
  nights: number;
  totalPrice: number;
  amenities: string[];
  image: string;
}

export interface Booking {
  id: string;
  itineraryId: string;
  destination: string;
  image: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalCost: number;
  currency: string;
  travelers: number;
  paymentMethod: PaymentMethod;
  reference: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  reference?: string;
}

export interface Bank {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
}

export interface EWallet {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface PrayerTime {
  name: string;
  time: string;
  icon: string;
}

export interface HalalRestaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distance: string;
  priceRange: string;
  certification: string;
  image: string;
  address: string;
}

export interface UmrahPackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  rating: number;
  hotel: string;
  inclusions: string[];
  image: string;
  departureDate: string;
}

export interface Notification {
  id: string;
  type: 'flight_delay' | 'weather_alert' | 'check_in_reminder' | 'booking_confirmation' | 'payment_reminder' | 'tide_alert' | 'permit_confirmation';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export type CrowdLevel = 'low' | 'moderate' | 'high' | 'very-high';
export type EcoRating = 1 | 2 | 3 | 4 | 5;

export interface SabahDestination extends Destination {
  district: string;
  crowdLevel: CrowdLevel;
  ecoRating: EcoRating;
  bestTimeToVisit: string;
  tideInfo?: string;
  wildlifeTypes?: string[];
  permitRequired?: boolean;
  alternativeSpots?: string[];
}

export type AgentType = 'dive-center' | 'guide' | 'transport' | 'homestay' | 'tour-operator' | 'cultural-guide';

export interface MarketplaceAgent {
  id: string;
  name: string;
  type: AgentType;
  rating: number;
  verified: boolean;
  specialties: string[];
  languages: string[];
  contact: string;
  image: string;
  priceRange: string;
  location: string;
}

export interface FoodSpot {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  tags: string[];
  peakHours: string;
  mustTry: string[];
  isHalal: boolean;
  image: string;
  location: string;
  priceRange: string;
}

export type AlertSeverity = 'info' | 'warning' | 'danger';
export type AlertType = 'tide' | 'weather' | 'trail' | 'wildlife';

export interface SafetyAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  location: string;
  active: boolean;
}

export type EmergencyType = 'police' | 'ambulance' | 'coast-guard' | 'hospital' | 'fire' | 'tourism-hotline';

export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  type: EmergencyType;
}

export interface TravelBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  requirement: string;
  district: string;
}

export interface GovernmentStats {
  totalVisitors: number;
  monthlyTrend: { month: string; visitors: number }[];
  topDistricts: { name: string; visitors: number; percentage: number }[];
  sustainabilityScore: number;
  revenue: number;
}

export type DurationPreset = '2D1N' | '3D2N' | '4D3N' | '5D4N' | '7D6N';

export interface WizardState {
  step: number;
  destination: string;
  departureCity: string;
  startDate: string;
  endDate: string;
  duration: DurationPreset;
  budget: number;
  adults: number;
  children: number;
  infants: number;
  interests: string[];
  travelStyle: TierType;
}

export interface SabahIsland {
  id: string;
  name: string;
  region: string;
  image: string;
  activities: string[];
  difficulty: 'easy' | 'moderate' | 'hard';
  access: string;
  isMarinePark: boolean;
  marineParkName?: string;
  highlight: string;
  permitRequired: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface SabahEvent {
  id: string;
  name: string;
  month: number;
  dateRange: string;
  location: string;
  description: string;
  category: string;
  image: string;
  isFeatured: boolean;
}

export interface SabahNews {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  image: string;
  source: string;
}
