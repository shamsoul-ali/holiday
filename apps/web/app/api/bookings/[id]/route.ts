import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { BookingResponse } from '@/lib/types/booking'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      } as BookingResponse, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Fetch main booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      } as BookingResponse, { status: 404 })
    }

    // Fetch related flight bookings
    const { data: flightBookings } = await supabase
      .from('flight_bookings')
      .select('*')
      .eq('booking_id', bookingId)

    // Fetch related hotel bookings
    const { data: hotelBookings } = await supabase
      .from('hotel_bookings')
      .select('*')
      .eq('booking_id', bookingId)

    // Fetch related activity bookings
    const { data: activityBookings } = await supabase
      .from('activity_bookings')
      .select('*')
      .eq('booking_id', bookingId)

    // Fetch related transport bookings
    const { data: transportBookings } = await supabase
      .from('transport_bookings')
      .select('*')
      .eq('booking_id', bookingId)

    // Combine all data into comprehensive booking object
    const completeBooking = {
      ...booking,
      flightBookings: flightBookings || [],
      hotelBookings: hotelBookings || [],
      activityBookings: activityBookings || [],
      transportBookings: transportBookings || []
    }

    return NextResponse.json({
      success: true,
      booking: completeBooking
    } as BookingResponse)

  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as BookingResponse, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id
    const body = await request.json()

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      } as BookingResponse, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Update booking status or other fields
    const updateData: any = {}
    
    if (body.status) updateData.status = body.status
    if (body.payment_status) updateData.payment_status = body.payment_status
    if (body.special_requests) updateData.special_requests = body.special_requests

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update'
      } as BookingResponse, { status: 400 })
    }

    updateData.updated_at = new Date().toISOString()

    const { data: booking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError || !booking) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update booking'
      } as BookingResponse, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      booking: booking
    } as BookingResponse)

  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as BookingResponse, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id
    const body = await request.json()
    const { reason, refund_requested } = body

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      } as BookingResponse, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Check existing booking status
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (fetchError || !existingBooking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      } as BookingResponse, { status: 404 })
    }

    // Check if booking can be cancelled
    if (existingBooking.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        error: 'Booking already cancelled'
      } as BookingResponse, { status: 400 })
    }

    if (existingBooking.status === 'completed') {
      return NextResponse.json({
        success: false,
        error: 'Cannot cancel completed booking'
      } as BookingResponse, { status: 400 })
    }

    // Update booking status to cancelled
    const { data: cancelledBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        special_requests: existingBooking.special_requests 
          ? `${existingBooking.special_requests}\n\nCancellation: ${reason || 'User requested cancellation'}`
          : `Cancellation: ${reason || 'User requested cancellation'}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError || !cancelledBooking) {
      return NextResponse.json({
        success: false,
        error: 'Failed to cancel booking'
      } as BookingResponse, { status: 500 })
    }

    // Update related sub-bookings to cancelled
    await Promise.all([
      supabase.from('flight_bookings').update({ booking_status: 'cancelled' }).eq('booking_id', bookingId),
      supabase.from('hotel_bookings').update({ booking_status: 'cancelled' }).eq('booking_id', bookingId),
      supabase.from('activity_bookings').update({ booking_status: 'cancelled' }).eq('booking_id', bookingId),
      supabase.from('transport_bookings').update({ booking_status: 'cancelled' }).eq('booking_id', bookingId)
    ])

    // If refund requested and payment was made, we would initiate refund process here
    if (refund_requested && existingBooking.payment_status === 'paid') {
      // TODO: Implement refund processing with Stripe
      console.log(`Refund requested for booking ${bookingId}`)
    }

    return NextResponse.json({
      success: true,
      booking: cancelledBooking,
      message: 'Booking cancelled successfully'
    } as BookingResponse)

  } catch (error) {
    console.error('Booking cancellation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as BookingResponse, { status: 500 })
  }
}