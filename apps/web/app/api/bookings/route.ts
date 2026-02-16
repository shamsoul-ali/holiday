import { NextRequest, NextResponse } from 'next/server'

// Generate booking reference
function generateBookingReference(): string {
  const prefix = 'HAI'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    // Simple auth check using Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    // For mock auth, we'll accept any token that looks like a user ID
    if (!token || token === 'null' || token === 'undefined') {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Mock bookings data - in production this would query your database
    const mockBookings = [
      {
        id: 'booking_1',
        booking_reference: generateBookingReference(),
        user_id: token,
        status: 'confirmed',
        total_amount: 5500,
        currency: 'MYR',
        payment_status: 'paid',
        created_at: new Date().toISOString(),
        itineraries: {
          title: 'Tokyo Adventure',
          destination: 'Tokyo, Japan',
          duration: '7 days'
        }
      }
    ]

    // Filter by status if provided
    const filteredBookings = status && status !== 'all' 
      ? mockBookings.filter(booking => booking.status === status)
      : mockBookings

    return NextResponse.json({
      success: true,
      data: filteredBookings.slice(offset, offset + limit),
      pagination: {
        limit,
        offset,
        total: filteredBookings.length
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    // Simple auth check using Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token || token === 'null' || token === 'undefined') {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const {
      itinerary_id,
      total_amount,
      currency = 'MYR',
      booking_data,
      passenger_details,
      contact_details,
      special_requests
    } = body

    // Validate required fields
    if (!itinerary_id || !total_amount || !booking_data) {
      return NextResponse.json({ 
        error: 'Missing required fields: itinerary_id, total_amount, booking_data' 
      }, { status: 400 })
    }

    // Generate unique booking reference
    const booking_reference = generateBookingReference()

    // Create mock booking record (in production this would save to database)
    const booking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: token,
      itinerary_id,
      booking_reference,
      status: 'pending',
      total_amount: parseFloat(total_amount),
      currency,
      payment_status: 'pending',
      booking_data: {
        ...booking_data,
        passenger_details,
        contact_details,
        special_requests,
        created_at: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Mock itinerary details (in production this would be fetched from database)
    const itinerary = {
      title: booking_data.title || 'Your Trip',
      destination: booking_data.destination || 'Amazing Destination',
      duration: booking_data.duration || '5 days',
      dates: booking_data.dates || { start: '2024-06-01', end: '2024-06-05' },
      travelers: booking_data.travelers || { total: passenger_details?.length || 1 }
    }

    const fullBooking = {
      ...booking,
      itineraries: itinerary
    }

    // Note: In production, this would be stored in a database
    // For now, we'll just return the booking data without persistence

    return NextResponse.json({
      success: true,
      data: fullBooking,
      message: 'Booking created successfully'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}