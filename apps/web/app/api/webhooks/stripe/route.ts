import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyWebhookSignature, handleStripeWebhook } from '@/lib/payment/stripe'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    if (!webhookSecret) {
      console.error('No webhook secret configured')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret)
    if (!event) {
      console.error('Webhook signature verification failed')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Stripe webhook event:', event.type, event.id)

    // Handle the webhook event
    await handleStripeWebhook(event)

    // Additional booking-specific webhook handling
    await handleBookingWebhookEvents(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleBookingWebhookEvents(event: any): Promise<void> {
  const supabase = createSupabaseClient()

  switch (event.type) {
    case 'payment_intent.succeeded':
      const successPaymentIntent = event.data.object
      const successBookingId = successPaymentIntent.metadata?.booking_id

      if (successBookingId) {
        // Update booking status to confirmed and payment status to paid
        await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', successBookingId)

        // Update all related sub-bookings to confirmed
        await Promise.all([
          supabase
            .from('flight_bookings')
            .update({ booking_status: 'confirmed' })
            .eq('booking_id', successBookingId),
          supabase
            .from('hotel_bookings')
            .update({ booking_status: 'confirmed' })
            .eq('booking_id', successBookingId),
          supabase
            .from('activity_bookings')
            .update({ booking_status: 'confirmed' })
            .eq('booking_id', successBookingId),
          supabase
            .from('transport_bookings')
            .update({ booking_status: 'confirmed' })
            .eq('booking_id', successBookingId)
        ])

        // Record successful payment transaction
        await supabase
          .from('payment_transactions')
          .insert({
            booking_id: successBookingId,
            payment_provider: 'stripe',
            payment_intent_id: successPaymentIntent.id,
            transaction_type: 'payment',
            amount: successPaymentIntent.amount / 100,
            currency: successPaymentIntent.currency.toUpperCase(),
            status: 'succeeded',
            processed_at: new Date().toISOString()
          })

        console.log(`Booking ${successBookingId} confirmed after successful payment`)
      }
      break

    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object
      const failedBookingId = failedPaymentIntent.metadata?.booking_id

      if (failedBookingId) {
        // Update payment status to failed, keep booking in pending status
        await supabase
          .from('bookings')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', failedBookingId)

        // Record failed payment transaction
        await supabase
          .from('payment_transactions')
          .insert({
            booking_id: failedBookingId,
            payment_provider: 'stripe',
            payment_intent_id: failedPaymentIntent.id,
            transaction_type: 'payment',
            amount: failedPaymentIntent.amount / 100,
            currency: failedPaymentIntent.currency.toUpperCase(),
            status: 'failed',
            failure_reason: failedPaymentIntent.last_payment_error?.message,
            processed_at: new Date().toISOString()
          })

        console.log(`Payment failed for booking ${failedBookingId}`)
      }
      break

    case 'payment_intent.canceled':
      const canceledPaymentIntent = event.data.object
      const canceledBookingId = canceledPaymentIntent.metadata?.booking_id

      if (canceledBookingId) {
        // Cancel the booking when payment is canceled
        await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            payment_status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', canceledBookingId)

        // Cancel all related sub-bookings
        await Promise.all([
          supabase
            .from('flight_bookings')
            .update({ booking_status: 'cancelled' })
            .eq('booking_id', canceledBookingId),
          supabase
            .from('hotel_bookings')
            .update({ booking_status: 'cancelled' })
            .eq('booking_id', canceledBookingId),
          supabase
            .from('activity_bookings')
            .update({ booking_status: 'cancelled' })
            .eq('booking_id', canceledBookingId),
          supabase
            .from('transport_bookings')
            .update({ booking_status: 'cancelled' })
            .eq('booking_id', canceledBookingId)
        ])

        console.log(`Booking ${canceledBookingId} cancelled due to payment cancellation`)
      }
      break

    case 'charge.dispute.created':
      const dispute = event.data.object
      const disputePaymentIntent = dispute.payment_intent
      
      // Log dispute for manual review
      console.log(`Dispute created for payment intent: ${disputePaymentIntent}`, {
        disputeId: dispute.id,
        reason: dispute.reason,
        amount: dispute.amount
      })
      
      // TODO: Implement dispute notification system
      // await notifyAdminOfDispute(dispute)
      break

    default:
      console.log('Unhandled booking webhook event:', event.type)
  }
}

// Require raw body for signature verification
export const runtime = 'nodejs'