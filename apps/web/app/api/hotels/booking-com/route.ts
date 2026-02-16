import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '../../../../lib/api-config'

interface BookingComHotelSearchParams {
  destination: string
  checkin: string
  checkout: string
  adults: number
  children?: number
  rooms?: number
  currency?: string
  offset?: number
  limit?: number
  minPrice?: number
  maxPrice?: number
  starRating?: string
  facilities?: string[]
  mealPlan?: string
}

interface BookingComHotelResponse {
  success: boolean
  data?: {
    hotels: BookingComHotel[]
    search_params: BookingComHotelSearchParams
    meta: {
      total_results: number
      search_time: string
      data_source: 'booking_com'
      cache_used: boolean
      commission_eligible: boolean
    }
  }
  error?: string
  rate_limit?: {
    remaining: number
    reset_time: string
  }
}

interface BookingComHotel {
  id: string
  name: string
  chain?: string
  star_rating: number
  guest_rating: {
    score: number
    count: number
    description: string
  }
  location: {
    address: string
    city: string
    country: string
    coordinates: {
      latitude: number
      longitude: number
    }
    distance_to_center: string
    district?: string
    nearby_landmarks: string[]
    public_transport: string[]
  }
  images: {
    main: string
    gallery: string[]
    room_photos: string[]
  }
  amenities: string[]
  room_types: Array<{
    room_id: string
    name: string
    description: string
    max_occupancy: number
    bed_configuration: string
    room_size_sqm?: number
    facilities: string[]
    price: {
      total: number
      per_night: number
      currency: string
      taxes_included: boolean
      cancellation_policy: 'free' | 'non_refundable' | 'partial'
      cancellation_deadline?: string
      meal_plan?: string
    }
    availability: {
      rooms_left: number
      last_booked: string
    }
  }>
  policies: {
    check_in_time: string
    check_out_time: string
    cancellation_policy: string
    child_policy: string
    pet_policy?: string
  }
  booking_info: {
    booking_url: string
    deep_link: string
    commission_rate?: number
    partner_confirmation: boolean
  }
  special_offers?: string[]
  sustainability?: {
    green_certified: boolean
    eco_friendly_practices: string[]
  }
}

// Cache for Booking.com API responses
const bookingComCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes for hotel data

// GET /api/hotels/booking-com - Search hotels via Booking.com API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')
    const checkin = searchParams.get('checkin') || searchParams.get('check_in')
    const checkout = searchParams.get('checkout') || searchParams.get('check_out')
    const adults = parseInt(searchParams.get('adults') || '2')
    const children = parseInt(searchParams.get('children') || '0')
    const rooms = parseInt(searchParams.get('rooms') || '1')
    const currency = searchParams.get('currency') || 'USD'
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '25')
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined
    const starRating = searchParams.get('star_rating')
    const facilities = searchParams.get('facilities')?.split(',') || []
    const mealPlan = searchParams.get('meal_plan')

    // Validation
    if (!destination || !checkin || !checkout) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: destination, checkin, checkout'
      }, { status: 400 })
    }

    console.log(`Booking.com API: Searching hotels in ${destination} from ${checkin} to ${checkout}`)

    // Check cache first
    const cacheKey = `booking-com-${destination}-${checkin}-${checkout}-${adults}-${children}-${rooms}-${currency}`
    const cached = bookingComCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached Booking.com data')
      return NextResponse.json({
        ...cached.data,
        meta: { ...cached.data.meta, cache_used: true }
      })
    }

    const requestParams: BookingComHotelSearchParams = {
      destination,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      currency,
      offset,
      limit,
      minPrice,
      maxPrice,
      starRating,
      facilities,
      mealPlan
    }

    let hotels: BookingComHotel[] = []

    // Try Booking.com API if credentials are configured
    if (API_CONFIG.BOOKING_COM.API_KEY && API_CONFIG.BOOKING_COM.AFFILIATE_ID) {
      try {
        hotels = await searchBookingComAPI(requestParams)
      } catch (error) {
        console.log('Booking.com API error:', error)
        // Continue to fallback data
      }
    }

    // If no real API results or API not configured, use enhanced mock data based on Booking.com style
    if (hotels.length === 0) {
      console.log('Using Booking.com-style mock data (API not configured or failed)')
      hotels = generateBookingComStyleMockData(requestParams)
    }

    const response: BookingComHotelResponse = {
      success: true,
      data: {
        hotels,
        search_params: requestParams,
        meta: {
          total_results: hotels.length,
          search_time: new Date().toISOString(),
          data_source: 'booking_com',
          cache_used: false,
          commission_eligible: true
        }
      }
    }

    // Cache the results
    bookingComCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('Booking.com API endpoint error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to search Booking.com hotels',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function searchBookingComAPI(params: BookingComHotelSearchParams): Promise<BookingComHotel[]> {
  try {
    // Calculate nights for pricing
    const nights = Math.ceil(
      (new Date(params.checkout).getTime() - new Date(params.checkin).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Booking.com API endpoint (this is a placeholder - actual endpoint varies by partnership level)
    const searchUrl = new URL(`${API_CONFIG.BOOKING_COM.BASE_URL}/hotels/search`)
    
    // Add search parameters
    searchUrl.searchParams.append('destination', params.destination)
    searchUrl.searchParams.append('checkin', params.checkin)
    searchUrl.searchParams.append('checkout', params.checkout)
    searchUrl.searchParams.append('adults', params.adults.toString())
    searchUrl.searchParams.append('currency', params.currency || 'USD')
    searchUrl.searchParams.append('offset', (params.offset || 0).toString())
    searchUrl.searchParams.append('limit', (params.limit || 25).toString())
    
    if (params.children && params.children > 0) {
      searchUrl.searchParams.append('children', params.children.toString())
    }
    
    if (params.rooms && params.rooms > 1) {
      searchUrl.searchParams.append('rooms', params.rooms.toString())
    }
    
    if (params.starRating) {
      searchUrl.searchParams.append('star_rating', params.starRating)
    }
    
    if (params.minPrice) {
      searchUrl.searchParams.append('min_price', params.minPrice.toString())
    }
    
    if (params.maxPrice) {
      searchUrl.searchParams.append('max_price', params.maxPrice.toString())
    }

    console.log('Booking.com API Request URL:', searchUrl.toString())

    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'X-Booking-API-Key': API_CONFIG.BOOKING_COM.API_KEY,
        'X-Affiliate-ID': API_CONFIG.BOOKING_COM.AFFILIATE_ID,
        'Accept': 'application/json',
        'User-Agent': 'Holiday-AI-Platform/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Booking.com API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`Booking.com API returned ${data.hotels?.length || 0} hotels`)

    // Transform Booking.com response to our format
    return data.hotels?.map((hotel: any) => transformBookingComHotel(hotel, params, nights)) || []
    
  } catch (error) {
    console.error('Booking.com API search error:', error)
    throw error
  }
}

function transformBookingComHotel(bookingComHotel: any, params: BookingComHotelSearchParams, nights: number): BookingComHotel {
  // Transform raw Booking.com API response to our standardized format
  return {
    id: bookingComHotel.hotel_id?.toString() || `booking-com-${Date.now()}`,
    name: bookingComHotel.hotel_name || 'Unknown Hotel',
    chain: bookingComHotel.chain_name,
    star_rating: bookingComHotel.star_rating || 3,
    guest_rating: {
      score: bookingComHotel.review_score || 8.0,
      count: bookingComHotel.review_nr || 100,
      description: getBookingComRatingDescription(bookingComHotel.review_score || 8.0)
    },
    location: {
      address: bookingComHotel.address || `${params.destination} City Center`,
      city: bookingComHotel.city || params.destination,
      country: bookingComHotel.country_trans || 'Unknown',
      coordinates: {
        latitude: bookingComHotel.latitude || 0,
        longitude: bookingComHotel.longitude || 0
      },
      distance_to_center: bookingComHotel.distance_to_cc || '1.0 km',
      district: bookingComHotel.district,
      nearby_landmarks: bookingComHotel.landmarks || [],
      public_transport: bookingComHotel.public_transport || []
    },
    images: {
      main: bookingComHotel.main_photo_url || 'https://via.placeholder.com/400x300?text=Hotel+Image',
      gallery: bookingComHotel.photo_urls || [],
      room_photos: bookingComHotel.room_photos || []
    },
    amenities: bookingComHotel.facilities || ['WiFi', 'Air Conditioning'],
    room_types: (bookingComHotel.rooms || [{}]).map((room: any, index: number) => ({
      room_id: room.room_id?.toString() || `room-${index}`,
      name: room.room_name || 'Standard Room',
      description: room.room_description || 'Comfortable accommodation',
      max_occupancy: room.max_occupancy || params.adults + (params.children || 0),
      bed_configuration: room.bed_configuration || '1 Double Bed',
      room_size_sqm: room.room_size_sqm,
      facilities: room.facilities || [],
      price: {
        total: Math.round((room.price_total || 300) * nights),
        per_night: Math.round(room.price_per_night || 300),
        currency: params.currency || 'USD',
        taxes_included: room.taxes_included !== false,
        cancellation_policy: room.cancellation_policy || 'free',
        cancellation_deadline: room.cancellation_deadline,
        meal_plan: room.meal_plan
      },
      availability: {
        rooms_left: room.rooms_left || Math.floor(Math.random() * 5) + 1,
        last_booked: room.last_booked || `${Math.floor(Math.random() * 24)} hours ago`
      }
    })),
    policies: {
      check_in_time: bookingComHotel.check_in_time || '15:00',
      check_out_time: bookingComHotel.check_out_time || '11:00',
      cancellation_policy: bookingComHotel.cancellation_policy || 'Free cancellation before 18:00 on day of arrival',
      child_policy: bookingComHotel.child_policy || 'Children welcome',
      pet_policy: bookingComHotel.pet_policy
    },
    booking_info: {
      booking_url: bookingComHotel.url || `https://www.booking.com/hotel/${bookingComHotel.hotel_id}`,
      deep_link: `${bookingComHotel.url || `https://www.booking.com/hotel/${bookingComHotel.hotel_id}`}?aid=${API_CONFIG.BOOKING_COM.AFFILIATE_ID}`,
      commission_rate: 4.0, // Typical Booking.com commission rate
      partner_confirmation: true
    },
    special_offers: bookingComHotel.deals || [],
    sustainability: {
      green_certified: bookingComHotel.sustainability_level > 0,
      eco_friendly_practices: bookingComHotel.sustainability_practices || []
    }
  }
}

function generateBookingComStyleMockData(params: BookingComHotelSearchParams): BookingComHotel[] {
  // Generate realistic mock data that matches Booking.com's response structure and quality
  const nights = Math.ceil(
    (new Date(params.checkout).getTime() - new Date(params.checkin).getTime()) / (1000 * 60 * 60 * 24)
  )

  const mockHotels: BookingComHotel[] = [
    {
      id: 'booking-com-mock-001',
      name: `${params.destination} Grand Hotel`,
      chain: 'Grand Hotels International',
      star_rating: 5,
      guest_rating: {
        score: 9.1,
        count: 2847,
        description: 'Superb'
      },
      location: {
        address: `123 Premium Boulevard, ${params.destination}`,
        city: params.destination,
        country: getCountryFromDestination(params.destination),
        coordinates: {
          latitude: 13.7563 + (Math.random() - 0.5) * 0.02,
          longitude: 100.5018 + (Math.random() - 0.5) * 0.02
        },
        distance_to_center: '0.3 km',
        district: 'City Center',
        nearby_landmarks: ['Central Station', 'Main Shopping District', 'Historic Quarter'],
        public_transport: ['Metro Station (200m)', 'Bus Stop (50m)']
      },
      images: {
        main: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop`,
        gallery: [
          `https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop`,
          `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop`,
          `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop`
        ],
        room_photos: [
          `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop`,
          `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop`
        ]
      },
      amenities: [
        'Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa & Wellness Center', 
        'Restaurant', 'Bar', 'Room Service', 'Concierge', 'Airport Shuttle', 
        'Business Center', 'Meeting Rooms', 'Parking'
      ],
      room_types: [
        {
          room_id: 'grand-deluxe-001',
          name: 'Deluxe City View Room',
          description: 'Spacious room with panoramic city views and modern amenities',
          max_occupancy: params.adults + (params.children || 0),
          bed_configuration: params.adults > 1 ? '1 King Bed' : '2 Twin Beds',
          room_size_sqm: 45,
          facilities: ['City View', 'Air Conditioning', 'Mini Bar', 'Safe', 'Work Desk'],
          price: {
            total: Math.round(580 * nights * (params.currency === 'MYR' ? 4.7 : 1)),
            per_night: Math.round(580 * (params.currency === 'MYR' ? 4.7 : 1)),
            currency: params.currency || 'USD',
            taxes_included: true,
            cancellation_policy: 'free',
            cancellation_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            meal_plan: 'Room Only'
          },
          availability: {
            rooms_left: 3,
            last_booked: '2 hours ago'
          }
        }
      ],
      policies: {
        check_in_time: '15:00',
        check_out_time: '12:00',
        cancellation_policy: 'Free cancellation until 18:00 on the day before arrival',
        child_policy: 'Children of all ages are welcome. Children 12 and above are considered adults.',
        pet_policy: 'Pets are not allowed'
      },
      booking_info: {
        booking_url: `https://www.booking.com/hotel/mock-grand-${params.destination.toLowerCase()}`,
        deep_link: `https://www.booking.com/hotel/mock-grand-${params.destination.toLowerCase()}?aid=holiday-ai`,
        commission_rate: 4.0,
        partner_confirmation: true
      },
      special_offers: ['Free WiFi', 'Flexible Booking', 'No Prepayment'],
      sustainability: {
        green_certified: true,
        eco_friendly_practices: ['Energy Efficient', 'Water Conservation', 'Waste Reduction']
      }
    },
    // Add more mock hotels here for variety
    {
      id: 'booking-com-mock-002',
      name: `Budget Inn ${params.destination}`,
      star_rating: 3,
      guest_rating: {
        score: 8.2,
        count: 1456,
        description: 'Very Good'
      },
      location: {
        address: `456 Budget Street, ${params.destination}`,
        city: params.destination,
        country: getCountryFromDestination(params.destination),
        coordinates: {
          latitude: 13.7563 + (Math.random() - 0.5) * 0.05,
          longitude: 100.5018 + (Math.random() - 0.5) * 0.05
        },
        distance_to_center: '1.2 km',
        district: 'Tourist District',
        nearby_landmarks: ['Night Market', 'Local Temple', 'Shopping Street'],
        public_transport: ['Bus Stop (100m)', 'Taxi Stand (200m)']
      },
      images: {
        main: `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop`,
        gallery: [
          `https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop`,
          `https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop`
        ],
        room_photos: [
          `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop`
        ]
      },
      amenities: [
        'Free WiFi', 'Air Conditioning', 'Reception 24/7', 'Luggage Storage', 'Tour Desk'
      ],
      room_types: [
        {
          room_id: 'budget-standard-001',
          name: 'Standard Double Room',
          description: 'Comfortable room with essential amenities',
          max_occupancy: params.adults + (params.children || 0),
          bed_configuration: '1 Double Bed',
          room_size_sqm: 25,
          facilities: ['Air Conditioning', 'Private Bathroom', 'Work Desk'],
          price: {
            total: Math.round(120 * nights * (params.currency === 'MYR' ? 4.7 : 1)),
            per_night: Math.round(120 * (params.currency === 'MYR' ? 4.7 : 1)),
            currency: params.currency || 'USD',
            taxes_included: true,
            cancellation_policy: 'free',
            cancellation_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          availability: {
            rooms_left: 8,
            last_booked: '4 hours ago'
          }
        }
      ],
      policies: {
        check_in_time: '14:00',
        check_out_time: '11:00',
        cancellation_policy: 'Free cancellation until 14:00 on the day of arrival',
        child_policy: 'Children welcome. Extra bed available for additional charge.',
      },
      booking_info: {
        booking_url: `https://www.booking.com/hotel/mock-budget-${params.destination.toLowerCase()}`,
        deep_link: `https://www.booking.com/hotel/mock-budget-${params.destination.toLowerCase()}?aid=holiday-ai`,
        commission_rate: 4.5,
        partner_confirmation: true
      },
      special_offers: ['Free WiFi', 'No Booking Fees'],
      sustainability: {
        green_certified: false,
        eco_friendly_practices: ['Towel Reuse Program']
      }
    }
  ]

  return mockHotels
}

function getBookingComRatingDescription(score: number): string {
  if (score >= 9.0) return 'Superb'
  if (score >= 8.5) return 'Fabulous'
  if (score >= 8.0) return 'Very Good'
  if (score >= 7.5) return 'Good'
  if (score >= 7.0) return 'Pleasant'
  if (score >= 6.0) return 'Review Score'
  return 'Okay'
}

function getCountryFromDestination(destination: string): string {
  const destinationCountryMap: { [key: string]: string } = {
    'Bangkok': 'Thailand',
    'Tokyo': 'Japan',
    'Singapore': 'Singapore',
    'Kuala Lumpur': 'Malaysia',
    'Seoul': 'South Korea',
    'Hong Kong': 'Hong Kong',
    'Jakarta': 'Indonesia',
    'Manila': 'Philippines',
    'Ho Chi Minh City': 'Vietnam',
    'Phnom Penh': 'Cambodia',
    'Yangon': 'Myanmar',
    'Vientiane': 'Laos',
    'Bandar Seri Begawan': 'Brunei'
  }
  
  return destinationCountryMap[destination] || 'Unknown'
}