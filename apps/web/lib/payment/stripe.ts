// Stripe Payment Integration for Holiday AI Platform
// Secure payment processing for all travel bookings

import Stripe from 'stripe'
import { PaymentTransaction, Booking } from '../types/booking'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
})

export const stripeClient = stripe

// Payment Intent Configuration
export interface CreatePaymentIntentRequest {
  amount: number // in cents
  currency: string
  bookingId: string
  userId: string
  description: string
  metadata?: { [key: string]: string }
  paymentMethodTypes?: string[]
  captureMethod?: 'automatic' | 'manual'
}

export interface PaymentIntentResponse {
  success: boolean
  paymentIntent?: Stripe.PaymentIntent
  clientSecret?: string
  error?: string
}

// Create Payment Intent for booking
export async function createPaymentIntent(
  request: CreatePaymentIntentRequest
): Promise<PaymentIntentResponse> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100), // Convert to cents
      currency: request.currency.toLowerCase(),
      description: request.description,
      metadata: {
        booking_id: request.bookingId,
        user_id: request.userId,
        platform: 'holiday_ai',
        ...request.metadata
      },
      payment_method_types: request.paymentMethodTypes || ['card'],
      capture_method: request.captureMethod || 'automatic',
      // Enable automatic confirmation for better UX
      confirm: false,
      // Setup future usage for returning customers
      setup_future_usage: 'on_session',
    })

    return {
      success: true,
      paymentIntent,
      clientSecret: paymentIntent.client_secret!
    }
  } catch (error) {
    console.error('Stripe Payment Intent creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment setup failed'
    }
  }
}

// Confirm Payment Intent (when user completes payment on frontend)
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId?: string
): Promise<PaymentIntentResponse> {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    })

    return {
      success: true,
      paymentIntent
    }
  } catch (error) {
    console.error('Stripe Payment Intent confirmation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment confirmation failed'
    }
  }
}

// Capture payment (for manual capture method)
export async function capturePaymentIntent(
  paymentIntentId: string,
  amountToCapture?: number
): Promise<PaymentIntentResponse> {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amountToCapture
    })

    return {
      success: true,
      paymentIntent
    }
  } catch (error) {
    console.error('Stripe Payment capture error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment capture failed'
    }
  }
}

// Process refund
export interface RefundRequest {
  paymentIntentId: string
  amount?: number // in cents, if partial refund
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  metadata?: { [key: string]: string }
}

export interface RefundResponse {
  success: boolean
  refund?: Stripe.Refund
  error?: string
}

export async function processRefund(request: RefundRequest): Promise<RefundResponse> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: request.paymentIntentId,
      amount: request.amount,
      reason: request.reason,
      metadata: request.metadata
    })

    return {
      success: true,
      refund
    }
  } catch (error) {
    console.error('Stripe refund error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Refund failed'
    }
  }
}

// Customer Management
export async function createStripeCustomer(
  email: string,
  name?: string,
  phone?: string,
  metadata?: { [key: string]: string }
): Promise<{ success: boolean; customer?: Stripe.Customer; error?: string }> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        platform: 'holiday_ai',
        ...metadata
      }
    })

    return {
      success: true,
      customer
    }
  } catch (error) {
    console.error('Stripe customer creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Customer creation failed'
    }
  }
}

// Payment Method Management
export async function attachPaymentMethodToCustomer(
  paymentMethodId: string,
  customerId: string
): Promise<{ success: boolean; paymentMethod?: Stripe.PaymentMethod; error?: string }> {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    })

    return {
      success: true,
      paymentMethod
    }
  } catch (error) {
    console.error('Payment method attachment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment method attachment failed'
    }
  }
}

// Get customer payment methods
export async function getCustomerPaymentMethods(
  customerId: string
): Promise<{ success: boolean; paymentMethods?: Stripe.PaymentMethod[]; error?: string }> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    })

    return {
      success: true,
      paymentMethods: paymentMethods.data
    }
  } catch (error) {
    console.error('Get payment methods error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment methods'
    }
  }
}

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return null
  }
}

// Handle webhook events
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  console.log('Processing Stripe webhook:', event.type)

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
      break
    
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
      break
    
    case 'payment_intent.canceled':
      await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
      break
    
    case 'charge.dispute.created':
      await handleChargeDispute(event.data.object as Stripe.Dispute)
      break
    
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
      break
    
    default:
      console.log('Unhandled webhook event type:', event.type)
  }
}

// Payment success handler
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingId = paymentIntent.metadata.booking_id
  
  if (bookingId) {
    try {
      // Update booking status to confirmed
      await updateBookingPaymentStatus(bookingId, 'paid', paymentIntent.id)
      
      // Send confirmation email
      await sendBookingConfirmationEmail(bookingId)
      
      // Create travel documents
      await generateTravelDocuments(bookingId)
      
      // Schedule notifications
      await scheduleBookingNotifications(bookingId)
      
      console.log(`Payment succeeded for booking: ${bookingId}`)
    } catch (error) {
      console.error('Error processing successful payment:', error)
    }
  }
}

// Payment failure handler
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingId = paymentIntent.metadata.booking_id
  
  if (bookingId) {
    try {
      // Update booking status
      await updateBookingPaymentStatus(bookingId, 'failed', paymentIntent.id)
      
      // Send failure notification
      await sendPaymentFailureNotification(bookingId, paymentIntent.last_payment_error?.message)
      
      // Cancel booking holds
      await cancelBookingHolds(bookingId)
      
      console.log(`Payment failed for booking: ${bookingId}`)
    } catch (error) {
      console.error('Error processing failed payment:', error)
    }
  }
}

// Payment cancellation handler
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingId = paymentIntent.metadata.booking_id
  
  if (bookingId) {
    try {
      await updateBookingPaymentStatus(bookingId, 'cancelled', paymentIntent.id)
      await cancelBookingHolds(bookingId)
      console.log(`Payment canceled for booking: ${bookingId}`)
    } catch (error) {
      console.error('Error processing canceled payment:', error)
    }
  }
}

// Dispute handler
async function handleChargeDispute(dispute: Stripe.Dispute): Promise<void> {
  try {
    // Notify admin about dispute
    console.log('Charge dispute created:', dispute.id, dispute.reason)
    
    // Could integrate with admin notification system
    // await notifyAdminOfDispute(dispute)
  } catch (error) {
    console.error('Error handling charge dispute:', error)
  }
}

// Invoice payment success (for subscription-based features in future)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log('Invoice payment succeeded:', invoice.id)
  // Handle subscription or recurring payment success
}

// Utility functions (these would be implemented in the booking service)
async function updateBookingPaymentStatus(
  bookingId: string,
  status: 'paid' | 'failed' | 'cancelled',
  paymentIntentId: string
): Promise<void> {
  const { createSupabaseClient } = await import('@/lib/supabase')
  const supabase = createSupabaseClient()
  
  await supabase
    .from('bookings')
    .update({
      payment_status: status,
      status: status === 'paid' ? 'confirmed' : status === 'failed' ? 'pending' : 'cancelled',
      payment_intent_id: paymentIntentId,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    
  console.log(`Updated booking ${bookingId} payment status to ${status}`)
}

async function sendBookingConfirmationEmail(bookingId: string): Promise<void> {
  const { sendBookingConfirmationEmail: sendConfirmation } = await import('@/lib/services/booking-confirmation')
  await sendConfirmation(bookingId)
}

async function generateTravelDocuments(bookingId: string): Promise<void> {
  const { generateTravelDocuments: generateDocs } = await import('@/lib/services/booking-confirmation')
  await generateDocs(bookingId)
}

async function scheduleBookingNotifications(bookingId: string): Promise<void> {
  const { scheduleBookingNotifications: scheduleNotifications } = await import('@/lib/services/booking-confirmation')
  await scheduleNotifications(bookingId)
}

async function sendPaymentFailureNotification(
  bookingId: string,
  errorMessage?: string
): Promise<void> {
  console.log(`Send payment failure notification for booking ${bookingId}`)
}

async function cancelBookingHolds(bookingId: string): Promise<void> {
  // Cancel holds on flights, hotels, etc.
  console.log(`Cancel booking holds for booking ${bookingId}`)
}

// Pricing utilities
export function convertToStripeAmount(amount: number, currency: string): number {
  // Some currencies don't use decimal places (e.g., JPY, KRW)
  const zeroDecimalCurrencies = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']
  
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return Math.round(amount)
  }
  
  return Math.round(amount * 100)
}

export function convertFromStripeAmount(amount: number, currency: string): number {
  const zeroDecimalCurrencies = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']
  
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return amount
  }
  
  return amount / 100
}

// Generate booking reference
export function generateBookingReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `HAI-${timestamp}${random}`
}

export default stripeClient