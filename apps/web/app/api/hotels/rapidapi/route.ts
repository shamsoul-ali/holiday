import { NextRequest, NextResponse } from 'next/server'
import { rapidAPIService, RapidAPIHotel } from '../../../../lib/rapidapi-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')
    const checkin = searchParams.get('checkin') || searchParams.get('check_in')
    const checkout = searchParams.get('checkout') || searchParams.get('check_out')
    const adults = parseInt(searchParams.get('adults') || '2')
    const currency = searchParams.get('currency') || 'USD'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!destination || !checkin || !checkout) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: destination, checkin, checkout'
      }, { status: 400 })
    }

    console.log(`RapidAPI Hotels: Searching for ${destination}, ${checkin} to ${checkout}, ${adults} adults`)

    // First, get the destination ID if needed
    let destinationId = destination
    if (isNaN(parseInt(destination))) {
      const destIdResponse = await rapidAPIService.getDestinationId(destination)
      if (destIdResponse.success && destIdResponse.data) {
        destinationId = destIdResponse.data
        console.log(`Found destination ID: ${destinationId} for ${destination}`)
      }
    }

    // Search hotels using RapidAPI
    const hotelsResponse = await rapidAPIService.searchHotels({
      destination: destinationId,
      checkin,
      checkout,
      adults,
      currency,
      limit
    })

    if (!hotelsResponse.success) {
      console.error('RapidAPI Hotels search failed:', hotelsResponse.error)
      return NextResponse.json({
        success: false,
        error: hotelsResponse.error || 'Failed to search hotels'
      }, { status: 500 })
    }

    const hotels = hotelsResponse.data || []

    // Transform to match your existing hotel interface
    const transformedHotels = hotels.map((hotel: RapidAPIHotel) => ({
      id: hotel.hotel_id,
      name: hotel.hotel_name,
      location: {
        address: `${hotel.district}, ${hotel.city}, ${hotel.country}`,
        city: hotel.city,
        country: hotel.country,
        latitude: 0, // RapidAPI doesn't always provide coordinates
        longitude: 0
      },
      star_rating: hotel.rating,
      pricing: {
        per_night: hotel.price.current_price,
        total: hotel.price.current_price * calculateNights(checkin, checkout),
        currency: hotel.price.currency,
        taxes_included: true
      },
      amenities: hotel.amenities.length > 0 ? hotel.amenities : [
        'Free WiFi',
        'Air Conditioning',
        'Restaurant',
        '24-hour Front Desk'
      ],
      room_types: [
        {
          type: 'Standard Room',
          description: hotel.description || `Comfortable room at ${hotel.hotel_name}`,
          max_occupancy: adults,
          bed_type: 'Queen Bed',
          size: '25 sqm'
        }
      ],
      images: hotel.photos.length > 0 ? hotel.photos : [
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80'
      ],
      reviews: {
        overall_rating: hotel.review_score || hotel.rating,
        total_reviews: hotel.review_count,
        cleanliness: hotel.review_score || hotel.rating,
        service: hotel.review_score || hotel.rating,
        location: hotel.review_score || hotel.rating,
        value: hotel.review_score || hotel.rating
      },
      policies: {
        check_in: '15:00',
        check_out: '11:00',
        cancellation: 'Free cancellation up to 24 hours before check-in',
        pets_allowed: false,
        smoking_allowed: false
      },
      contact: {
        phone: '+1-000-000-0000',
        email: 'info@hotel.com',
        website: 'https://booking.com'
      },
      availability: true,
      source: 'rapidapi_booking'
    }))

    console.log(`RapidAPI Hotels: Found ${transformedHotels.length} hotels for ${destination}`)

    return NextResponse.json({
      success: true,
      data: {
        hotels: transformedHotels,
        total: transformedHotels.length,
        destination: destination,
        check_in: checkin,
        check_out: checkout,
        adults: adults,
        source: 'RapidAPI Booking.com'
      }
    })

  } catch (error) {
    console.error('RapidAPI Hotels API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

function calculateNights(checkin: string, checkout: string): number {
  try {
    const checkinDate = new Date(checkin)
    const checkoutDate = new Date(checkout)
    const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  } catch {
    return 1
  }
}