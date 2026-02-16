// Booking Service - Handles all booking-related operations
// This module provides a clean interface for booking operations

interface BookingData {
  flights?: {
    outbound: FlightDetails
    return?: FlightDetails
  }
  accommodation?: {
    hotels: HotelDetails[]
  }
  activities?: ActivityDetails[]
  insurance?: InsuranceDetails
  transfers?: TransferDetails[]
}

interface FlightDetails {
  airline: string
  flight_number: string
  departure: {
    airport: string
    time: string
    date: string
  }
  arrival: {
    airport: string
    time: string
    date: string
  }
  duration: string
  class: string
  price: number
}

interface HotelDetails {
  name: string
  address: string
  check_in: string
  check_out: string
  room_type: string
  guests: number
  nights: number
  price_per_night: number
  total_price: number
  cancellation_policy?: string
}

interface ActivityDetails {
  name: string
  description: string
  date: string
  time: string
  duration: string
  location: string
  price: number
  participants: number
}

interface InsuranceDetails {
  provider: string
  policy_type: string
  coverage_amount: number
  price: number
  benefits: string[]
}

interface TransferDetails {
  type: 'airport' | 'hotel' | 'activity'
  from: string
  to: string
  date: string
  time: string
  vehicle_type: string
  price: number
}

interface PassengerDetails {
  title: string
  first_name: string
  last_name: string
  date_of_birth: string
  passport_number?: string
  passport_expiry?: string
  nationality: string
  email?: string
  phone?: string
  special_requests?: string[]
}

interface ContactDetails {
  email: string
  phone: string
  emergency_contact?: {
    name: string
    relationship: string
    phone: string
  }
}

interface BookingRequest {
  itinerary_id: string
  booking_data: BookingData
  passenger_details: PassengerDetails[]
  contact_details: ContactDetails
  total_amount: number
  currency?: string
  special_requests?: string
}

interface BookingResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

class BookingService {
  private baseUrl: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  private getAuthHeaders() {
    // Get user from localStorage for mock auth
    try {
      const userData = localStorage.getItem('auth_user')
      if (userData) {
        const user = JSON.parse(userData)
        return {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json'
        }
      }
    } catch (error) {
      console.error('Error getting auth headers:', error)
    }
    
    return {
      'Content-Type': 'application/json'
    }
  }

  async createBooking(bookingRequest: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bookingRequest)
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create booking'
        }
      }

      return data
    } catch (error) {
      console.error('Booking creation error:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async getBooking(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
        headers: this.getAuthHeaders()
      })
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch booking'
        }
      }

      return data
    } catch (error) {
      console.error('Booking fetch error:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async getUserBookings(filters?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<BookingResponse> {
    try {
      const searchParams = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString())
          }
        })
      }

      const url = `${this.baseUrl}/bookings${searchParams.toString() ? `?${searchParams}` : ''}`
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      })
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch bookings'
        }
      }

      return data
    } catch (error) {
      console.error('Bookings fetch error:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async updateBooking(bookingId: string, updates: Partial<{
    status: string
    payment_status: string
    booking_data: BookingData
    total_amount: number
  }>): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to update booking'
        }
      }

      return data
    } catch (error) {
      console.error('Booking update error:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async cancelBooking(bookingId: string, reason?: string, refundRequested = false): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason, refund_requested: refundRequested })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to cancel booking'
        }
      }

      return data
    } catch (error) {
      console.error('Booking cancellation error:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async createPaymentIntent(bookingId: string, amount: number, currency = 'myr'): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/create-intent`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          booking_id: bookingId,
          amount,
          currency
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create payment intent'
        }
      }

      return data
    } catch (error) {
      console.error('Payment intent creation error:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async confirmPayment(bookingId: string, paymentIntentId: string): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/confirm`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          booking_id: bookingId,
          payment_intent_id: paymentIntentId,
          payment_status: 'paid'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to confirm payment'
        }
      }

      return data
    } catch (error) {
      console.error('Payment confirmation error:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  // Helper method to format booking data from itinerary
  formatBookingData(itinerary: any): BookingData {
    const bookingData: BookingData = {}

    // Format flight data
    if (itinerary.flightDetails) {
      bookingData.flights = {
        outbound: {
          airline: itinerary.flightDetails.outbound.airline,
          flight_number: itinerary.flightDetails.outbound.flightNumber,
          departure: {
            airport: itinerary.flightDetails.outbound.departure.airport,
            time: itinerary.flightDetails.outbound.departure.time,
            date: itinerary.dates?.start || ''
          },
          arrival: {
            airport: itinerary.flightDetails.outbound.arrival.airport,
            time: itinerary.flightDetails.outbound.arrival.time,
            date: itinerary.dates?.start || ''
          },
          duration: itinerary.flightDetails.outbound.duration,
          class: itinerary.flightDetails.outbound.class,
          price: itinerary.flightDetails.outbound.price
        }
      }

      if (itinerary.flightDetails.return) {
        bookingData.flights.return = {
          airline: itinerary.flightDetails.return.airline,
          flight_number: itinerary.flightDetails.return.flightNumber,
          departure: {
            airport: itinerary.flightDetails.return.departure.airport,
            time: itinerary.flightDetails.return.departure.time,
            date: itinerary.dates?.end || ''
          },
          arrival: {
            airport: itinerary.flightDetails.return.arrival.airport,
            time: itinerary.flightDetails.return.arrival.time,
            date: itinerary.dates?.end || ''
          },
          duration: itinerary.flightDetails.return.duration,
          class: itinerary.flightDetails.return.class,
          price: itinerary.flightDetails.return.price
        }
      }
    }

    // Format accommodation data
    if (itinerary.accommodationDetails) {
      bookingData.accommodation = {
        hotels: itinerary.accommodationDetails.hotels.map((hotel: any) => ({
          name: hotel.name,
          address: hotel.location,
          check_in: hotel.checkIn,
          check_out: hotel.checkOut,
          room_type: hotel.roomType,
          guests: itinerary.travelers?.total || 2,
          nights: hotel.totalNights,
          price_per_night: hotel.pricePerNight,
          total_price: hotel.totalPrice
        }))
      }
    }

    // Format insurance data
    if (itinerary.insuranceDetails) {
      bookingData.insurance = {
        provider: itinerary.insuranceDetails.provider,
        policy_type: 'Travel Insurance',
        coverage_amount: 500000, // RM 500k default
        price: itinerary.insuranceDetails.price,
        benefits: itinerary.insuranceDetails.coverage
      }
    }

    return bookingData
  }
}

// Export singleton instance
export const bookingService = new BookingService()

// Export types for use in components
export type {
  BookingData,
  FlightDetails,
  HotelDetails,
  ActivityDetails,
  InsuranceDetails,
  TransferDetails,
  PassengerDetails,
  ContactDetails,
  BookingRequest,
  BookingResponse
}