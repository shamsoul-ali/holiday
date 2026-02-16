import { Booking, FlightBooking, HotelBooking, ActivityBooking, TransportBooking } from '@/lib/types/booking'
import { createSupabaseClient } from '@/lib/supabase'

export interface BookingConfirmationData {
  booking: Booking & {
    flightBookings?: FlightBooking[]
    hotelBookings?: HotelBooking[]
    activityBookings?: ActivityBooking[]
    transportBookings?: TransportBooking[]
  }
  userDetails: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
  }
}

export interface BookingNotificationRequest {
  bookingId: string
  userId: string
  notificationType: 'booking_confirmation' | 'payment_confirmation' | 'booking_reminder' | 'booking_update'
  deliveryMethods: ('email' | 'sms' | 'push')[]
  scheduledFor?: Date
}

export async function sendBookingConfirmationEmail(bookingId: string): Promise<void> {
  try {
    console.log(`Sending booking confirmation email for booking: ${bookingId}`)
    
    const supabase = createSupabaseClient()
    
    // Fetch complete booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        flight_bookings(*),
        hotel_bookings(*),
        activity_bookings(*),
        transport_bookings(*)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Failed to fetch booking for confirmation email:', bookingError)
      return
    }

    // Fetch user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, first_name, last_name, phone')
      .eq('id', booking.user_id)
      .single()

    if (userError || !user) {
      console.error('Failed to fetch user for confirmation email:', userError)
      return
    }

    const confirmationData: BookingConfirmationData = {
      booking,
      userDetails: {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone
      }
    }

    // Generate email HTML
    const emailHtml = generateBookingConfirmationEmail(confirmationData)
    
    // Send email (integrate with your email service)
    await sendEmail({
      to: user.email,
      subject: `Booking Confirmed - ${booking.bookingReference}`,
      html: emailHtml,
      from: 'bookings@holidayai.com'
    })

    // Create notification record
    await createBookingNotification({
      bookingId,
      userId: booking.user_id,
      notificationType: 'booking_confirmation',
      deliveryMethods: ['email']
    })

    console.log(`Booking confirmation email sent successfully for ${bookingId}`)
  } catch (error) {
    console.error('Error sending booking confirmation email:', error)
  }
}

export function generateBookingConfirmationEmail(data: BookingConfirmationData): string {
  const { booking, userDetails } = data
  const customerName = userDetails.firstName ? `${userDetails.firstName} ${userDetails.lastName}` : 'Valued Customer'

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - ${booking.bookingReference}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
            .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; margin: 25px 0 15px 0; border-bottom: 2px solid #667eea; padding-bottom: 8px; }
            .price-total { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
            .qr-code { text-align: center; margin: 30px 0; }
            .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
            .status-confirmed { background: #28a745; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; }
            .booking-reference { font-size: 28px; font-weight: bold; letter-spacing: 2px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Booking Confirmed!</h1>
                <div class="booking-reference">${booking.bookingReference}</div>
                <p>Thank you for choosing Holiday AI for your travel needs</p>
            </div>
            
            <div class="content">
                <p>Dear ${customerName},</p>
                <p>We're excited to confirm your booking! Your travel plans are all set and we can't wait for you to enjoy your amazing journey.</p>
                
                <div class="booking-details">
                    <div class="detail-row">
                        <span class="detail-label">Booking Reference:</span>
                        <span class="detail-value">${booking.bookingReference}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Booking Type:</span>
                        <span class="detail-value">${booking.bookingType.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="status-confirmed">${booking.status}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Travel Dates:</span>
                        <span class="detail-value">${new Date(booking.travelStartDate).toLocaleDateString()} - ${new Date(booking.travelEndDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Travelers:</span>
                        <span class="detail-value">${booking.travelerCount} ${booking.travelerCount === 1 ? 'person' : 'people'}</span>
                    </div>
                </div>

                ${booking.flightBookings && booking.flightBookings.length > 0 ? `
                    <div class="section-title">✈️ Flight Details</div>
                    ${booking.flightBookings.map(flight => `
                        <div class="booking-details">
                            <div class="detail-row">
                                <span class="detail-label">Route:</span>
                                <span class="detail-value">${flight.origin_airport} → ${flight.destination_airport}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Departure:</span>
                                <span class="detail-value">${new Date(flight.departure_date).toLocaleDateString()}</span>
                            </div>
                            ${flight.return_date ? `
                                <div class="detail-row">
                                    <span class="detail-label">Return:</span>
                                    <span class="detail-value">${new Date(flight.return_date).toLocaleDateString()}</span>
                                </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Class:</span>
                                <span class="detail-value">${flight.booking_class === 'Y' ? 'Economy' : flight.booking_class === 'C' ? 'Business' : 'First'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Price:</span>
                                <span class="detail-value">${flight.currency} ${flight.total_price.toLocaleString()}</span>
                            </div>
                        </div>
                    `).join('')}
                ` : ''}

                ${booking.hotelBookings && booking.hotelBookings.length > 0 ? `
                    <div class="section-title">🏨 Hotel Details</div>
                    ${booking.hotelBookings.map(hotel => `
                        <div class="booking-details">
                            <div class="detail-row">
                                <span class="detail-label">Hotel:</span>
                                <span class="detail-value">${hotel.hotel_name}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Check-in:</span>
                                <span class="detail-value">${new Date(hotel.check_in_date).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Check-out:</span>
                                <span class="detail-value">${new Date(hotel.check_out_date).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Nights:</span>
                                <span class="detail-value">${hotel.nights} nights</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Room Type:</span>
                                <span class="detail-value">${hotel.room_type}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Guests:</span>
                                <span class="detail-value">${hotel.guest_count} guests</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Total Price:</span>
                                <span class="detail-value">${hotel.currency} ${hotel.total_price.toLocaleString()}</span>
                            </div>
                        </div>
                    `).join('')}
                ` : ''}

                ${booking.activityBookings && booking.activityBookings.length > 0 ? `
                    <div class="section-title">🎯 Activities & Experiences</div>
                    ${booking.activityBookings.map(activity => `
                        <div class="booking-details">
                            <div class="detail-row">
                                <span class="detail-label">Activity:</span>
                                <span class="detail-value">${activity.activity_name}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date:</span>
                                <span class="detail-value">${new Date(activity.activity_date).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Participants:</span>
                                <span class="detail-value">${activity.participant_count} people</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Price:</span>
                                <span class="detail-value">${activity.currency} ${activity.total_price.toLocaleString()}</span>
                            </div>
                        </div>
                    `).join('')}
                ` : ''}

                <div class="price-total">
                    💰 Total: ${booking.currency} ${booking.totalAmount.toLocaleString()}
                </div>

                <div class="qr-code">
                    <p><strong>Your Digital Booking Code</strong></p>
                    <div style="font-family: monospace; font-size: 24px; letter-spacing: 3px; background: #f0f0f0; padding: 15px; border-radius: 8px;">
                        ${booking.bookingReference}
                    </div>
                    <p style="font-size: 14px; color: #666;">Show this code for check-in and verification</p>
                </div>

                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h3 style="color: #1976d2; margin-top: 0;">What's Next?</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>Check your email for detailed itinerary and documents</li>
                        <li>Ensure your passport is valid for at least 6 months</li>
                        <li>Check visa requirements for your destination</li>
                        <li>Download the Holiday AI app for real-time updates</li>
                        <li>Review cancellation policies and travel insurance options</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}" 
                       style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                        View Full Booking Details
                    </a>
                </div>

                <p>If you have any questions or need assistance, our 24/7 customer support team is here to help!</p>
                
                <p>Safe travels and enjoy your journey!</p>
                <p><strong>The Holiday AI Team</strong></p>
            </div>

            <div class="footer">
                <p>Holiday AI - Your AI-Powered Travel Companion</p>
                <p>Contact us: support@holidayai.com | +1-800-HOLIDAY</p>
                <p style="font-size: 12px;">This is an automated email. Please do not reply directly to this message.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

export async function createBookingNotification(request: BookingNotificationRequest): Promise<void> {
  try {
    const supabase = createSupabaseClient()

    const notificationTitle = getNotificationTitle(request.notificationType)
    const notificationMessage = await getNotificationMessage(request.notificationType, request.bookingId)

    for (const method of request.deliveryMethods) {
      await supabase
        .from('travel_notifications')
        .insert({
          user_id: request.userId,
          booking_id: request.bookingId,
          notification_type: request.notificationType,
          title: notificationTitle,
          message: notificationMessage,
          priority: 'normal',
          scheduled_for: request.scheduledFor,
          delivery_method: method
        })
    }

    console.log(`Created ${request.deliveryMethods.length} notification(s) for booking ${request.bookingId}`)
  } catch (error) {
    console.error('Error creating booking notification:', error)
  }
}

function getNotificationTitle(type: string): string {
  const titles = {
    'booking_confirmation': '🎉 Booking Confirmed!',
    'payment_confirmation': '✅ Payment Successful',
    'booking_reminder': '⏰ Travel Reminder',
    'booking_update': '📋 Booking Update'
  }
  return titles[type as keyof typeof titles] || '📧 Booking Notification'
}

async function getNotificationMessage(type: string, bookingId: string): Promise<string> {
  const supabase = createSupabaseClient()
  
  const { data: booking } = await supabase
    .from('bookings')
    .select('booking_reference, travel_start_date')
    .eq('id', bookingId)
    .single()

  if (!booking) return 'Your booking has been updated.'

  const messages = {
    'booking_confirmation': `Your booking ${booking.bookingReference} has been confirmed! Get ready for an amazing journey.`,
    'payment_confirmation': `Payment for booking ${booking.bookingReference} was processed successfully.`,
    'booking_reminder': `Your trip ${booking.bookingReference} is coming up on ${new Date(booking.travelStartDate).toLocaleDateString()}. Don't forget to check in!`,
    'booking_update': `Your booking ${booking.bookingReference} has been updated. Please review the changes.`
  }

  return messages[type as keyof typeof messages] || `Update for booking ${booking.bookingReference}.`
}

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  from?: string
}): Promise<void> {
  // This is a placeholder for actual email integration
  // You would integrate with services like:
  // - SendGrid
  // - AWS SES
  // - Mailgun
  // - Resend
  // - Nodemailer with SMTP
  
  console.log('Sending email:', {
    to: params.to,
    subject: params.subject,
    from: params.from || 'noreply@holidayai.com'
  })
  
  // TODO: Implement actual email sending
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // await sgMail.send(params)
}

export async function generateTravelDocuments(bookingId: string): Promise<void> {
  console.log(`Generating travel documents for booking: ${bookingId}`)
  
  // TODO: Generate PDF itinerary, boarding passes, hotel vouchers, etc.
  // This would integrate with PDF generation libraries like:
  // - jsPDF
  // - Puppeteer
  // - React-PDF
  
  const supabase = createSupabaseClient()
  
  // Create travel document records
  await supabase
    .from('travel_documents')
    .insert([
      {
        booking_id: bookingId,
        document_type: 'itinerary',
        document_name: `Itinerary - ${bookingId}`,
        document_data: { generated: true },
        is_verified: true
      }
    ])
}

export async function scheduleBookingNotifications(bookingId: string): Promise<void> {
  console.log(`Scheduling notifications for booking: ${bookingId}`)
  
  const supabase = createSupabaseClient()
  
  // Get booking details
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (!booking) return

  const travelDate = new Date(booking.travelStartDate)
  const oneDayBefore = new Date(travelDate.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekBefore = new Date(travelDate.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Schedule reminder notifications
  await createBookingNotification({
    bookingId,
    userId: booking.user_id,
    notificationType: 'booking_reminder',
    deliveryMethods: ['email', 'push'],
    scheduledFor: oneWeekBefore
  })

  await createBookingNotification({
    bookingId,
    userId: booking.user_id,
    notificationType: 'booking_reminder',
    deliveryMethods: ['email', 'sms', 'push'],
    scheduledFor: oneDayBefore
  })
}