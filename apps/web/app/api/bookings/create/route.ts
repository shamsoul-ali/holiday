import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { createPaymentIntent, generateBookingReference } from '@/lib/payment/stripe'
import { CreateBookingRequest, BookingResponse } from '@/lib/types/booking'

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json()
    
    // Validate required fields
    if (!body.userId || !body.bookingType || !body.travelStartDate || !body.travelerCount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required booking information',
        validationErrors: {
          userId: !body.userId ? 'User ID is required' : '',
          bookingType: !body.bookingType ? 'Booking type is required' : '',
          travelStartDate: !body.travelStartDate ? 'Travel start date is required' : '',
          travelerCount: !body.travelerCount ? 'Traveler count is required' : ''
        }
      } as BookingResponse, { status: 400 })
    }

    const supabase = createSupabaseClient()
    
    // Calculate total booking amount
    let totalAmount = 0
    const currency = 'MYR' // Default currency

    // Calculate flight costs
    if (body.flightDetails?.selectedFlight) {
      totalAmount += body.flightDetails.selectedFlight.price * body.travelerCount
    }

    // Calculate hotel costs
    if (body.hotelDetails?.selectedRoom) {
      const nights = Math.ceil((new Date(body.travelEndDate).getTime() - new Date(body.travelStartDate).getTime()) / (1000 * 60 * 60 * 24))
      totalAmount += body.hotelDetails.selectedRoom.pricePerNight * nights * body.hotelDetails.roomCount
    }

    // Calculate activity costs
    if (body.activityDetails) {
      for (const activity of body.activityDetails) {
        totalAmount += activity.selectedActivity.price * activity.participantCount
      }
    }

    // Calculate transport costs
    if (body.transportDetails) {
      for (const transport of body.transportDetails) {
        totalAmount += transport.selectedTransport.price
      }
    }

    if (totalAmount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid booking amount'
      } as BookingResponse, { status: 400 })
    }

    // Generate unique booking reference
    const bookingReference = generateBookingReference()

    // Create master booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: body.userId,
        booking_reference: bookingReference,
        booking_type: body.bookingType,
        status: 'pending',
        total_amount: totalAmount,
        currency: currency,
        payment_status: 'pending',
        travel_start_date: body.travelStartDate,
        travel_end_date: body.travelEndDate,
        traveler_count: body.travelerCount,
        special_requests: body.specialRequests
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create booking'
      } as BookingResponse, { status: 500 })
    }

    // Create flight booking if requested
    if (body.flightDetails && body.bookingType === 'complete_trip' || body.bookingType === 'flight_only') {
      const { error: flightError } = await supabase
        .from('flight_bookings')
        .insert({
          booking_id: booking.id,
          origin_airport: body.flightDetails.originAirport,
          destination_airport: body.flightDetails.destinationAirport,
          departure_date: body.flightDetails.departureDate,
          return_date: body.flightDetails.returnDate,
          airline_code: body.flightDetails.selectedFlight.segments?.[0]?.departure?.airport || 'XX',
          flight_number: 'TBD', // Will be updated after actual booking
          flight_details: body.flightDetails.selectedFlight.segments || {},
          passenger_details: body.flightDetails.passengers,
          booking_class: body.flightDetails.bookingClass || 'Y',
          total_price: body.flightDetails.selectedFlight.price * body.travelerCount,
          currency: currency,
          booking_status: 'pending'
        })

      if (flightError) {
        console.error('Flight booking creation error:', flightError)
      }
    }

    // Create hotel booking if requested
    if (body.hotelDetails && (body.bookingType === 'complete_trip' || body.bookingType === 'hotel_only')) {
      const nights = Math.ceil((new Date(body.travelEndDate).getTime() - new Date(body.travelStartDate).getTime()) / (1000 * 60 * 60 * 24))
      
      const { error: hotelError } = await supabase
        .from('hotel_bookings')
        .insert({
          booking_id: booking.id,
          hotel_id: body.hotelDetails.hotelId,
          hotel_name: body.hotelDetails.selectedRoom.id, // Will be updated with actual hotel name
          hotel_address: {
            street: 'TBD',
            city: 'TBD',
            country: 'TBD',
            coordinates: { latitude: 0, longitude: 0 }
          },
          check_in_date: body.hotelDetails.checkInDate,
          check_out_date: body.hotelDetails.checkOutDate,
          nights: nights,
          room_type: body.hotelDetails.selectedRoom.roomType,
          room_count: body.hotelDetails.roomCount,
          guest_count: body.hotelDetails.guests.length,
          guest_details: body.hotelDetails.guests,
          total_price: body.hotelDetails.selectedRoom.pricePerNight * nights * body.hotelDetails.roomCount,
          price_per_night: body.hotelDetails.selectedRoom.pricePerNight,
          currency: currency,
          booking_status: 'pending',
          cancellation_policy: body.hotelDetails.selectedRoom.cancellationPolicy
        })

      if (hotelError) {
        console.error('Hotel booking creation error:', hotelError)
      }
    }

    // Create activity bookings if requested
    if (body.activityDetails && body.activityDetails.length > 0) {
      for (const activity of body.activityDetails) {
        const { error: activityError } = await supabase
          .from('activity_bookings')
          .insert({
            booking_id: booking.id,
            activity_id: activity.activityId,
            activity_name: activity.selectedActivity.name,
            activity_type: 'tour', // Default type
            provider: 'Holiday AI',
            activity_date: activity.activityDate,
            participant_count: activity.participantCount,
            participant_details: activity.participants || [],
            total_price: activity.selectedActivity.price * activity.participantCount,
            currency: currency,
            booking_status: 'pending'
          })

        if (activityError) {
          console.error('Activity booking creation error:', activityError)
        }
      }
    }

    // Create transport bookings if requested
    if (body.transportDetails && body.transportDetails.length > 0) {
      for (const transport of body.transportDetails) {
        const { error: transportError } = await supabase
          .from('transport_bookings')
          .insert({
            booking_id: booking.id,
            transport_type: transport.transportType,
            provider: transport.selectedTransport.provider,
            pickup_location: transport.pickupLocation,
            dropoff_location: transport.dropoffLocation,
            pickup_datetime: transport.pickupDatetime,
            total_price: transport.selectedTransport.price,
            currency: currency,
            booking_status: 'pending'
          })

        if (transportError) {
          console.error('Transport booking creation error:', transportError)
        }
      }
    }

    // Create Stripe Payment Intent
    const paymentResult = await createPaymentIntent({
      amount: totalAmount,
      currency: currency.toLowerCase(),
      bookingId: booking.id,
      userId: body.userId,
      description: `Holiday AI Booking - ${bookingReference}`,
      metadata: {
        booking_reference: bookingReference,
        booking_type: body.bookingType,
        traveler_count: body.travelerCount.toString(),
        travel_dates: `${body.travelStartDate} to ${body.travelEndDate}`
      }
    })

    if (!paymentResult.success) {
      // Rollback booking creation if payment intent fails
      await supabase.from('bookings').delete().eq('id', booking.id)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to create payment intent: ' + paymentResult.error
      } as BookingResponse, { status: 500 })
    }

    // Update booking with payment intent ID
    await supabase
      .from('bookings')
      .update({ payment_intent_id: paymentResult.paymentIntent?.id })
      .eq('id', booking.id)

    // Return successful response
    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        payment_intent_id: paymentResult.paymentIntent?.id
      },
      paymentIntent: {
        clientSecret: paymentResult.clientSecret!,
        status: paymentResult.paymentIntent?.status || 'requires_payment_method'
      }
    } as BookingResponse)

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as BookingResponse, { status: 500 })
  }
}