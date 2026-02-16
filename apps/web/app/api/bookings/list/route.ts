import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { BookingListResponse } from '@/lib/types/booking'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      } as BookingListResponse, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        *,
        flight_bookings(*),
        hotel_bookings(*),
        activity_bookings(*),
        transport_bookings(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Add status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Apply pagination
    const { data: bookings, error: bookingsError } = await query
      .range(offset, offset + limit - 1)

    if (bookingsError) {
      console.error('Bookings fetch error:', bookingsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bookings'
      } as BookingListResponse, { status: 500 })
    }

    // Calculate pagination info
    const totalPages = Math.ceil((totalCount || 0) / limit)

    return NextResponse.json({
      success: true,
      bookings: bookings || [],
      pagination: {
        total: totalCount || 0,
        page: page,
        limit: limit,
        totalPages: totalPages
      }
    } as BookingListResponse)

  } catch (error) {
    console.error('Bookings list error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as BookingListResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      status, 
      dateRange, 
      bookingType, 
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10 
    } = body

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      } as BookingListResponse, { status: 400 })
    }

    const supabase = createSupabaseClient()
    const offset = (page - 1) * limit

    // Build base query
    let query = supabase
      .from('bookings')
      .select(`
        *,
        flight_bookings(*),
        hotel_bookings(*),
        activity_bookings(*),
        transport_bookings(*)
      `)
      .eq('user_id', userId)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (bookingType && bookingType !== 'all') {
      query = query.eq('booking_type', bookingType)
    }

    if (dateRange && dateRange.start && dateRange.end) {
      query = query
        .gte('travel_start_date', dateRange.start)
        .lte('travel_end_date', dateRange.end)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Get total count for pagination with same filters
    let countQuery = supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }

    if (bookingType && bookingType !== 'all') {
      countQuery = countQuery.eq('booking_type', bookingType)
    }

    if (dateRange && dateRange.start && dateRange.end) {
      countQuery = countQuery
        .gte('travel_start_date', dateRange.start)
        .lte('travel_end_date', dateRange.end)
    }

    const { count: totalCount } = await countQuery

    // Apply pagination and fetch results
    const { data: bookings, error: bookingsError } = await query
      .range(offset, offset + limit - 1)

    if (bookingsError) {
      console.error('Advanced bookings search error:', bookingsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bookings'
      } as BookingListResponse, { status: 500 })
    }

    // Calculate pagination info
    const totalPages = Math.ceil((totalCount || 0) / limit)

    return NextResponse.json({
      success: true,
      bookings: bookings || [],
      pagination: {
        total: totalCount || 0,
        page: page,
        limit: limit,
        totalPages: totalPages
      }
    } as BookingListResponse)

  } catch (error) {
    console.error('Advanced bookings search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as BookingListResponse, { status: 500 })
  }
}