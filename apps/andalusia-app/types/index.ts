export type TierType = 'ekonomi' | 'standard' | 'premium' | 'vip';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'fpx' | 'card' | 'ewallet' | 'bnpl' | 'andalusia-wallet';
export type ActivityType = 'ibadah' | 'ziarah' | 'meal' | 'transport' | 'hotel' | 'free_time';
export type VisaStatus = 'not_started' | 'submitted' | 'processing' | 'approved';

export interface JemaahProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  icNumber?: string;
  passportNumber?: string;
  nationality: string;
  state: string;
  umrahCount: number;
  hajjCount: number;
  loyaltyPoints: number;
  preferredCurrency: string;
  membershipTier: 'silver' | 'gold' | 'platinum';
}

export interface UmrahPackage {
  id: string;
  tier: TierType;
  title: string;
  duration: string;
  price: number;
  pricePerPerson: number;
  currency: string;
  rating: number;
  hotelMakkah: string;
  hotelMadinah: string;
  distanceHaram: string;
  airline: string;
  flightClass: string;
  highlights: string[];
  inclusions: string[];
  image: string;
  isRecommended?: boolean;
  priceBreakdown: UmrahPriceBreakdown;
  mutawifName?: string;
}

export interface UmrahPriceBreakdown {
  flights: number;
  hotels: number;
  visa: number;
  transport: number;
  ziarah: number;
  insurance: number;
  mutawif: number;
  total: number;
}

export interface Mutawif {
  id: string;
  name: string;
  image: string;
  experience: number;
  languages: string[];
  specialization: string;
  rating: number;
  totalGroups: number;
}

export interface KursusModule {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  progress: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  icon: string;
  duration: string;
}

export interface UmrahItinerary {
  id: string;
  packageId: string;
  departureCity: string;
  startDate: string;
  endDate: string;
  travelers: { adults: number; children: number; infants: number };
  totalCost: number;
  currency: string;
  days: UmrahDay[];
  flight: FlightInfo;
  hotelMakkah: HotelInfo;
  hotelMadinah: HotelInfo;
}

export interface UmrahDay {
  day: number;
  date: string;
  title: string;
  location: 'Madinah' | 'Makkah' | 'Transit' | 'KUL';
  activities: UmrahActivity[];
}

export interface UmrahActivity {
  id: string;
  time: string;
  title: string;
  type: ActivityType;
  duration: string;
  location: string;
  description?: string;
  tips?: string;
}

export interface FlightInfo {
  airline: string;
  flightNumber: string;
  departure: { airport: string; time: string; code: string };
  arrival: { airport: string; time: string; code: string };
  duration: string;
  class: string;
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
  distanceToHaram: string;
  pricePerNight: number;
  nights: number;
  totalPrice: number;
  amenities: string[];
  image: string;
}

export interface Booking {
  id: string;
  itineraryId: string;
  packageTitle: string;
  tier: TierType;
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
  visaStatus: VisaStatus;
  kursusProgress: number;
  mutawifName: string;
  groupWhatsApp?: string;
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

export interface DuaEntry {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translationBM: string;
  translationEN: string;
  category: 'travel' | 'tawaf' | 'saie' | 'general' | 'makkah' | 'madinah';
}

export interface UmrahChecklist {
  id: string;
  category: 'documents' | 'clothing' | 'medicines' | 'essentials';
  items: { id: string; label: string; checked: boolean }[];
}

export interface PrayerTime {
  name: string;
  time: string;
  icon: string;
}

export interface UmrahPlusDestination {
  id: string;
  name: string;
  country: string;
  image: string;
  additionalDays: number;
  additionalCost: number;
  highlights: string[];
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
}

export interface Notification {
  id: string;
  type: 'visa_update' | 'kursus_reminder' | 'departure_reminder' | 'payment_reminder' | 'cabutan_result' | 'group_update';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface AdminStats {
  totalJemaah: number;
  activeBookings: number;
  monthlyRevenue: number;
  satisfaction: number;
  genderSplit: { male: number; female: number };
  ageGroups: { range: string; count: number; percentage: number }[];
  incomeGroups: { group: string; count: number; percentage: number }[];
  topStates: { name: string; count: number; percentage: number }[];
  packageSales: { name: string; pax: number; revenue: number }[];
  monthlyTrend: { month: string; bookings: number; revenue: number }[];
}

export interface CabutanEntry {
  id: string;
  name: string;
  state: string;
  prize: string;
  date: string;
}

export interface WizardState {
  step: number;
  tier: TierType;
  departureCity: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  infants: number;
  roomType: string;
  addOns: string[];
}
