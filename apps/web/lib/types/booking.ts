// Holiday AI Platform - Complete Booking System Types
// Types for comprehensive travel booking and management

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: Date
  nationality?: string
  passportNumber?: string
  passportExpiry?: Date
  preferredCurrency: string
  travelPreferences?: TravelPreferences
  loyaltyPoints: number
  createdAt: Date
  updatedAt: Date
}

export interface TravelPreferences {
  dietary?: string[] // vegetarian, halal, kosher, etc.
  accessibility?: string[] // wheelchair, hearing, visual, etc.
  accommodation?: string // budget, standard, luxury
  transport?: string // economy, business, first
  activities?: string[] // adventure, cultural, relaxation, etc.
  notifications?: NotificationPreferences
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  flightUpdates: boolean
  weatherAlerts: boolean
  checkInReminders: boolean
  promotions: boolean
}

// Master booking record
export interface Booking {
  id: string
  userId: string
  bookingReference: string
  bookingType: 'complete_trip' | 'flight_only' | 'hotel_only' | 'activity_only'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded'
  totalAmount: number
  currency: string
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed' | 'partial'
  paymentIntentId?: string
  bookingDate: Date
  travelStartDate: Date
  travelEndDate: Date
  travelerCount: number
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
  
  // Related bookings (populated)
  flightBookings?: FlightBooking[]
  hotelBookings?: HotelBooking[]
  activityBookings?: ActivityBooking[]
  transportBookings?: TransportBooking[]
  itinerary?: Itinerary
}

// Flight booking details
export interface FlightBooking {
  id: string
  bookingId: string
  amadeusBookingId?: string
  originAirport: string
  destinationAirport: string
  departureDate: Date
  returnDate?: Date
  airlineCode: string
  flightNumber: string
  flightDetails: FlightDetails
  passengerDetails: PassengerDetails[]
  bookingClass: 'Y' | 'C' | 'F' // Economy, Business, First
  totalPrice: number
  currency: string
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'completed'
  confirmationCode?: string
  eTicketNumbers: string[]
  createdAt: Date
  updatedAt: Date
}

export interface FlightDetails {
  segments: FlightSegment[]
  totalDuration: string
  aircraft: string
  baggage: BaggageInfo
  seatSelection?: SeatSelection[]
  meals?: MealOption[]
  entertainment?: boolean
}

export interface FlightSegment {
  departure: {
    airport: string
    terminal?: string
    time: string
    date: string
  }
  arrival: {
    airport: string
    terminal?: string
    time: string
    date: string
  }
  duration: string
  stops: number
  layovers?: LayoverInfo[]
}

export interface PassengerDetails {
  type: 'adult' | 'child' | 'infant'
  title: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  passportNumber?: string
  passportExpiry?: Date
  nationality: string
  specialRequests?: string[]
  seatPreference?: string
  mealPreference?: string
}

// Hotel booking details
export interface HotelBooking {
  id: string
  bookingId: string
  externalBookingId?: string
  hotelId: string
  hotelName: string
  hotelAddress: HotelAddress
  checkInDate: Date
  checkOutDate: Date
  nights: number
  roomType: string
  roomCount: number
  guestCount: number
  guestDetails: GuestDetails[]
  specialRequests?: string
  totalPrice: number
  pricePerNight: number
  currency: string
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'completed'
  confirmationCode?: string
  cancellationPolicy?: CancellationPolicy
  createdAt: Date
  updatedAt: Date
}

export interface HotelAddress {
  street: string
  city: string
  state?: string
  country: string
  postalCode?: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export interface GuestDetails {
  firstName: string
  lastName: string
  age?: number
  specialRequests?: string[]
}

export interface CancellationPolicy {
  type: 'free' | 'partial' | 'non_refundable'
  freeUntil?: Date
  penaltyAmount?: number
  terms: string
}

// Activity and experience booking
export interface ActivityBooking {
  id: string
  bookingId: string
  activityId: string
  activityName: string
  activityType: 'tour' | 'restaurant' | 'attraction' | 'show' | 'transport' | 'experience'
  provider: string
  activityDate: Date
  activityTime?: string
  durationHours?: number
  participantCount: number
  participantDetails?: ParticipantDetails[]
  meetingPoint?: MeetingPoint
  totalPrice: number
  currency: string
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  confirmationCode?: string
  voucherInfo?: VoucherInfo
  createdAt: Date
}

export interface ParticipantDetails {
  firstName: string
  lastName: string
  age?: number
  requirements?: string[]
}

export interface MeetingPoint {
  name: string
  address: string
  coordinates: {
    latitude: number
    longitude: number
  }
  instructions?: string
}

export interface VoucherInfo {
  voucherType: 'qr_code' | 'pdf' | 'confirmation_number'
  voucherData: string
  validUntil?: Date
  instructions: string
}

// Transportation booking
export interface TransportBooking {
  id: string
  bookingId: string
  transportType: 'car_rental' | 'airport_transfer' | 'taxi' | 'train' | 'bus'
  provider: string
  pickupLocation: Location
  dropoffLocation?: Location
  pickupDatetime: Date
  dropoffDatetime?: Date
  vehicleDetails?: VehicleDetails
  driverDetails?: DriverDetails
  totalPrice: number
  currency: string
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'in_progress' | 'completed'
  confirmationCode?: string
  createdAt: Date
}

export interface Location {
  name: string
  address: string
  coordinates: {
    latitude: number
    longitude: number
  }
  contactPhone?: string
  instructions?: string
}

export interface VehicleDetails {
  category: string
  make?: string
  model?: string
  year?: number
  features: string[]
  capacity: number
  transmission: 'manual' | 'automatic'
  fuelType: string
}

export interface DriverDetails {
  name?: string
  phone?: string
  rating?: number
  photo?: string
  vehiclePlate?: string
}

// Payment transaction
export interface PaymentTransaction {
  id: string
  bookingId: string
  paymentProvider: 'stripe' | 'paypal' | 'bank_transfer'
  paymentIntentId: string
  paymentMethodId?: string
  transactionType: 'payment' | 'refund' | 'partial_refund'
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending' | 'cancelled'
  failureReason?: string
  providerResponse?: any
  processedAt?: Date
  createdAt: Date
}

// Travel document
export interface TravelDocument {
  id: string
  userId: string
  bookingId?: string
  documentType: 'passport' | 'visa' | 'insurance' | 'ticket' | 'voucher' | 'certificate'
  documentName: string
  documentData: any
  fileUrl?: string
  expiryDate?: Date
  issuedDate?: Date
  issuingAuthority?: string
  documentNumber?: string
  isVerified: boolean
  createdAt: Date
}

// Itinerary
export interface Itinerary {
  id: string
  userId: string
  bookingId?: string
  name: string
  destination: string
  startDate: Date
  endDate: Date
  itineraryData: ItineraryDay[]
  aiGenerated: boolean
  userCustomized: boolean
  isPublic: boolean
  likesCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ItineraryDay {
  date: Date
  title: string
  activities: ItineraryActivity[]
  meals: ItineraryMeal[]
  transportation: ItineraryTransport[]
  accommodation?: ItineraryAccommodation
  budget: {
    planned: number
    actual?: number
    currency: string
  }
  notes?: string
}

export interface ItineraryActivity {
  time: string
  name: string
  type: string
  location: Location
  duration?: number
  cost?: number
  bookingId?: string
  description?: string
  photos?: string[]
}

export interface ItineraryMeal {
  time: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  restaurant?: string
  location?: Location
  cost?: number
  bookingId?: string
}

export interface ItineraryTransport {
  time: string
  type: string
  from: Location
  to: Location
  duration?: number
  cost?: number
  bookingId?: string
}

export interface ItineraryAccommodation {
  name: string
  location: Location
  checkIn: Date
  checkOut: Date
  roomType: string
  cost?: number
  bookingId?: string
}

// Notifications
export interface TravelNotification {
  id: string
  userId: string
  bookingId?: string
  notificationType: 'flight_delay' | 'weather_alert' | 'check_in_reminder' | 'booking_confirmation' | 'payment_reminder'
  title: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  isRead: boolean
  scheduledFor?: Date
  sentAt?: Date
  deliveryMethod: 'app' | 'email' | 'sms'
  createdAt: Date
}

// Reviews and ratings
export interface Review {
  id: string
  userId: string
  bookingId?: string
  reviewableType: 'hotel' | 'flight' | 'activity' | 'overall_trip' | 'transport'
  reviewableId: string
  rating: number
  title?: string
  reviewText?: string
  photos?: string[]
  isVerified: boolean
  helpfulCount: number
  responseText?: string
  createdAt: Date
  user?: {
    firstName: string
    lastName: string
  }
}

// Booking request and response types
export interface CreateBookingRequest {
  userId: string
  bookingType: Booking['bookingType']
  travelStartDate: Date
  travelEndDate: Date
  travelerCount: number
  flightDetails?: CreateFlightBookingRequest
  hotelDetails?: CreateHotelBookingRequest
  activityDetails?: CreateActivityBookingRequest[]
  transportDetails?: CreateTransportBookingRequest[]
  paymentMethod: PaymentMethod
  specialRequests?: string
}

export interface CreateFlightBookingRequest {
  originAirport: string
  destinationAirport: string
  departureDate: Date
  returnDate?: Date
  passengers: PassengerDetails[]
  bookingClass?: 'Y' | 'C' | 'F'
  selectedFlight: FlightOffer
}

export interface CreateHotelBookingRequest {
  hotelId: string
  checkInDate: Date
  checkOutDate: Date
  roomType: string
  roomCount: number
  guests: GuestDetails[]
  selectedRoom: HotelOffer
}

export interface CreateActivityBookingRequest {
  activityId: string
  activityDate: Date
  participantCount: number
  participants?: ParticipantDetails[]
  selectedActivity: ActivityOffer
}

export interface CreateTransportBookingRequest {
  transportType: TransportBooking['transportType']
  pickupLocation: Location
  dropoffLocation?: Location
  pickupDatetime: Date
  selectedTransport: TransportOffer
}

export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'wallet'
  cardToken?: string
  saveCard?: boolean
}

// API response types
export interface BookingResponse {
  success: boolean
  booking?: Booking
  paymentIntent?: {
    clientSecret: string
    status: string
  }
  error?: string
  validationErrors?: { [key: string]: string }
}

export interface BookingListResponse {
  success: boolean
  bookings?: Booking[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error?: string
}

// Supporting types
export interface FlightOffer {
  id: string
  price: number
  currency: string
  segments: FlightSegment[]
  validUntil: Date
}

export interface HotelOffer {
  id: string
  roomType: string
  price: number
  pricePerNight: number
  currency: string
  cancellationPolicy: CancellationPolicy
  validUntil: Date
}

export interface ActivityOffer {
  id: string
  name: string
  price: number
  currency: string
  duration: number
  validUntil: Date
}

export interface TransportOffer {
  id: string
  provider: string
  vehicleType: string
  price: number
  currency: string
  validUntil: Date
}

// Additional utility types
export interface BaggageInfo {
  checkedBags: number
  carryOnBags: number
  personalItem: boolean
  weightLimit?: number
  sizeRestrictions?: string
}

export interface SeatSelection {
  passengerId: string
  seatNumber: string
  seatType: 'standard' | 'extra_legroom' | 'premium'
  cost?: number
}

export interface MealOption {
  passengerId: string
  mealCode: string
  mealName: string
  dietaryRestrictions?: string[]
  cost?: number
}

export interface LayoverInfo {
  airport: string
  duration: string
  terminal?: string
}