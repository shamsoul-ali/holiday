import { Booking } from '@/lib/types/booking'
import { createSupabaseClient } from '@/lib/supabase'

export interface DigitalReceipt {
  bookingReference: string
  bookingId: string
  userId: string
  qrCode: string
  receiptData: ReceiptData
  issuedAt: Date
  expiresAt?: Date
  verificationStatus: 'active' | 'used' | 'expired' | 'invalid'
}

export interface ReceiptData {
  booking: Booking
  customerInfo: {
    name: string
    email: string
    phone?: string
  }
  paymentInfo: {
    totalAmount: number
    currency: string
    paymentMethod: string
    transactionId: string
  }
  travelDetails: {
    destinations: string[]
    dates: {
      start: Date
      end: Date
    }
    travelers: number
  }
  components: ReceiptComponent[]
}

export interface ReceiptComponent {
  type: 'flight' | 'hotel' | 'activity' | 'transport'
  name: string
  details: any
  amount: number
  currency: string
  status: string
  confirmationCode?: string
}

export interface QRCodeData {
  bookingId: string
  bookingReference: string
  userId: string
  issuedAt: number
  hash: string // Security hash to prevent tampering
}

export async function generateDigitalReceipt(bookingId: string): Promise<DigitalReceipt | null> {
  try {
    const supabase = createSupabaseClient()

    // Fetch complete booking details with related records
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
      console.error('Failed to fetch booking for receipt:', bookingError)
      return null
    }

    // Fetch user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, first_name, last_name, phone')
      .eq('id', booking.user_id)
      .single()

    if (userError || !user) {
      console.error('Failed to fetch user for receipt:', userError)
      return null
    }

    // Fetch payment transaction details
    const { data: paymentTransaction, error: paymentError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Build receipt components
    const components: ReceiptComponent[] = []

    // Add flight components
    if (booking.flight_bookings) {
      for (const flight of booking.flight_bookings) {
        components.push({
          type: 'flight',
          name: `Flight ${flight.origin_airport} → ${flight.destination_airport}`,
          details: {
            departure: flight.departure_date,
            return: flight.return_date,
            airline: flight.airline_code,
            flightNumber: flight.flight_number,
            class: flight.booking_class,
            passengers: flight.passenger_details
          },
          amount: flight.total_price,
          currency: flight.currency,
          status: flight.booking_status,
          confirmationCode: flight.confirmation_code
        })
      }
    }

    // Add hotel components
    if (booking.hotel_bookings) {
      for (const hotel of booking.hotel_bookings) {
        components.push({
          type: 'hotel',
          name: hotel.hotel_name,
          details: {
            checkIn: hotel.check_in_date,
            checkOut: hotel.check_out_date,
            nights: hotel.nights,
            roomType: hotel.room_type,
            rooms: hotel.room_count,
            guests: hotel.guest_count
          },
          amount: hotel.total_price,
          currency: hotel.currency,
          status: hotel.booking_status,
          confirmationCode: hotel.confirmation_code
        })
      }
    }

    // Add activity components
    if (booking.activity_bookings) {
      for (const activity of booking.activity_bookings) {
        components.push({
          type: 'activity',
          name: activity.activity_name,
          details: {
            date: activity.activity_date,
            time: activity.activity_time,
            duration: activity.duration_hours,
            participants: activity.participant_count,
            type: activity.activity_type
          },
          amount: activity.total_price,
          currency: activity.currency,
          status: activity.booking_status,
          confirmationCode: activity.confirmation_code
        })
      }
    }

    // Add transport components
    if (booking.transport_bookings) {
      for (const transport of booking.transport_bookings) {
        components.push({
          type: 'transport',
          name: `${transport.transport_type} - ${transport.provider}`,
          details: {
            pickup: transport.pickup_datetime,
            dropoff: transport.dropoff_datetime,
            pickupLocation: transport.pickup_location,
            dropoffLocation: transport.dropoff_location,
            vehicle: transport.vehicle_details
          },
          amount: transport.total_price,
          currency: transport.currency,
          status: transport.booking_status,
          confirmationCode: transport.confirmation_code
        })
      }
    }

    // Get unique destinations
    const destinations = Array.from(new Set([
      ...booking.flight_bookings?.map((f: any) => f.destination_airport) || [],
      ...booking.hotel_bookings?.map((h: any) => h.hotel_address?.city) || []
    ].filter(Boolean)))

    // Build receipt data
    const receiptData: ReceiptData = {
      booking,
      customerInfo: {
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Valued Customer',
        email: user.email,
        phone: user.phone
      },
      paymentInfo: {
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        paymentMethod: paymentTransaction?.payment_provider || 'Stripe',
        transactionId: paymentTransaction?.payment_intent_id || booking.payment_intent_id || ''
      },
      travelDetails: {
        destinations,
        dates: {
          start: new Date(booking.travelStartDate),
          end: new Date(booking.travelEndDate)
        },
        travelers: booking.travelerCount
      },
      components
    }

    // Generate QR code
    const qrCodeData = await generateQRCode({
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      userId: booking.user_id,
      issuedAt: Date.now(),
      hash: generateSecurityHash(booking.id, booking.bookingReference, booking.user_id)
    })

    const digitalReceipt: DigitalReceipt = {
      bookingReference: booking.bookingReference,
      bookingId: booking.id,
      userId: booking.user_id,
      qrCode: qrCodeData,
      receiptData,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Expires in 1 year
      verificationStatus: 'active'
    }

    console.log(`Generated digital receipt for booking ${booking.bookingReference}`)
    return digitalReceipt

  } catch (error) {
    console.error('Error generating digital receipt:', error)
    return null
  }
}

export async function generateQRCode(data: QRCodeData): Promise<string> {
  // This is a simplified QR code representation
  // In production, you would use a QR code library like 'qrcode' or 'react-qr-code'
  const qrData = JSON.stringify(data)
  const base64Data = Buffer.from(qrData).toString('base64')
  
  // Return a data URL that can be used to display the QR code
  // This is a placeholder - you would generate an actual QR code image
  return `data:text/plain;base64,${base64Data}`
}

export function generateSecurityHash(bookingId: string, bookingReference: string, userId: string): string {
  // Simple hash function - in production use crypto.createHash with a secret
  const data = `${bookingId}:${bookingReference}:${userId}:${Date.now()}`
  return Buffer.from(data).toString('base64').substring(0, 16)
}

export async function verifyQRCode(qrCodeData: string): Promise<{
  valid: boolean
  data?: QRCodeData
  error?: string
}> {
  try {
    // Decode QR code data
    const base64Data = qrCodeData.replace('data:text/plain;base64,', '')
    const jsonData = Buffer.from(base64Data, 'base64').toString('utf-8')
    const data: QRCodeData = JSON.parse(jsonData)

    // Verify the hash
    const expectedHash = generateSecurityHash(data.bookingId, data.bookingReference, data.userId)
    if (data.hash !== expectedHash) {
      return { valid: false, error: 'Invalid QR code hash' }
    }

    // Check if booking exists and is valid
    const supabase = createSupabaseClient()
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', data.bookingId)
      .eq('booking_reference', data.bookingReference)
      .eq('user_id', data.userId)
      .single()

    if (error || !booking) {
      return { valid: false, error: 'Booking not found' }
    }

    if (booking.status === 'cancelled') {
      return { valid: false, error: 'Booking has been cancelled' }
    }

    return { valid: true, data }

  } catch (error) {
    console.error('QR code verification error:', error)
    return { valid: false, error: 'Invalid QR code format' }
  }
}

export function generateReceiptHTML(receipt: DigitalReceipt): string {
  const { receiptData, qrCode, bookingReference } = receipt

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Digital Receipt - ${bookingReference}</title>
        <style>
            @media print { body { margin: 0; } }
            body { font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .receipt-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
            .receipt-reference { font-size: 32px; font-weight: bold; letter-spacing: 2px; margin: 15px 0; }
            .section { background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 20px; }
            .section-title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 8px; }
            .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .component-item { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
            .total-amount { font-size: 28px; font-weight: bold; color: #28a745; text-align: center; margin: 25px 0; padding: 20px; background: #f8fff9; border-radius: 10px; }
            .qr-section { text-align: center; background: white; padding: 30px; border-radius: 10px; margin: 30px 0; border: 2px dashed #ccc; }
            .qr-code { width: 200px; height: 200px; margin: 20px auto; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 12px; word-break: break-all; padding: 10px; }
            .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .status-confirmed { background: #28a745; color: white; }
            .status-pending { background: #ffc107; color: black; }
            .footer { text-align: center; color: #666; margin-top: 40px; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; }
            @media (max-width: 600px) {
                .detail-grid { grid-template-columns: 1fr; }
                .receipt-reference { font-size: 24px; }
            }
        </style>
    </head>
    <body>
        <div class="receipt-header">
            <h1>🧾 Digital Receipt</h1>
            <div class="receipt-reference">${bookingReference}</div>
            <p>Holiday AI - Your AI-Powered Travel Companion</p>
        </div>

        <!-- Customer Information -->
        <div class="section">
            <div class="section-title">👤 Customer Information</div>
            <div class="detail-grid">
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${receiptData.customerInfo.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${receiptData.customerInfo.email}</span>
                </div>
                ${receiptData.customerInfo.phone ? `
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${receiptData.customerInfo.phone}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- Travel Details -->
        <div class="section">
            <div class="section-title">✈️ Travel Details</div>
            <div class="detail-grid">
                <div class="detail-row">
                    <span class="detail-label">Booking Type:</span>
                    <span class="detail-value">${receiptData.booking.bookingType.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Travel Dates:</span>
                    <span class="detail-value">${receiptData.travelDetails.dates.start.toLocaleDateString()} - ${receiptData.travelDetails.dates.end.toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Travelers:</span>
                    <span class="detail-value">${receiptData.travelDetails.travelers} ${receiptData.travelDetails.travelers === 1 ? 'person' : 'people'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Destinations:</span>
                    <span class="detail-value">${receiptData.travelDetails.destinations.join(', ') || 'Multiple destinations'}</span>
                </div>
            </div>
        </div>

        <!-- Booking Components -->
        ${receiptData.components.length > 0 ? `
        <div class="section">
            <div class="section-title">📋 Booking Components</div>
            ${receiptData.components.map(component => `
                <div class="component-item">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #333;">${getComponentIcon(component.type)} ${component.name}</h4>
                        <span class="status-badge ${component.status === 'confirmed' ? 'status-confirmed' : 'status-pending'}">${component.status}</span>
                    </div>
                    <div class="detail-grid">
                        ${Object.entries(component.details).map(([key, value]) => `
                            <div class="detail-row">
                                <span class="detail-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                <span class="detail-value">${formatDetailValue(value)}</span>
                            </div>
                        `).join('')}
                        <div class="detail-row">
                            <span class="detail-label">Amount:</span>
                            <span class="detail-value" style="font-weight: bold;">${component.currency} ${component.amount.toLocaleString()}</span>
                        </div>
                        ${component.confirmationCode ? `
                        <div class="detail-row">
                            <span class="detail-label">Confirmation Code:</span>
                            <span class="detail-value" style="font-family: monospace; font-weight: bold;">${component.confirmationCode}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- Payment Information -->
        <div class="section">
            <div class="section-title">💳 Payment Information</div>
            <div class="detail-grid">
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">${receiptData.paymentInfo.paymentMethod}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value" style="font-family: monospace;">${receiptData.paymentInfo.transactionId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Status:</span>
                    <span class="detail-value">✅ Completed</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Receipt Date:</span>
                    <span class="detail-value">${receipt.issuedAt.toLocaleDateString()}</span>
                </div>
            </div>
        </div>

        <div class="total-amount">
            💰 Total Paid: ${receiptData.paymentInfo.currency} ${receiptData.paymentInfo.totalAmount.toLocaleString()}
        </div>

        <!-- QR Code Section -->
        <div class="qr-section">
            <h3 style="color: #333; margin-bottom: 15px;">📱 Digital Verification Code</h3>
            <div class="qr-code">
                ${qrCode}
            </div>
            <p style="font-size: 16px; font-weight: bold; color: #333; margin: 15px 0;">${bookingReference}</p>
            <p style="font-size: 14px; color: #666;">Show this code for check-in, verification, and support purposes</p>
        </div>

        <!-- Terms and Conditions -->
        <div class="section">
            <div class="section-title">📋 Important Information</div>
            <ul style="margin: 0; padding-left: 20px; color: #555;">
                <li>This digital receipt serves as proof of payment and booking confirmation</li>
                <li>Present this receipt or the QR code for check-in at hotels, flights, and activities</li>
                <li>Keep this receipt safe for your records and potential refund purposes</li>
                <li>Contact our support team if you need assistance with your booking</li>
                <li>Check cancellation policies for each component before making changes</li>
                <li>Ensure all travelers have valid identification and travel documents</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>Holiday AI</strong> - Your AI-Powered Travel Companion</p>
            <p>📧 support@holidayai.com | 📞 +1-800-HOLIDAY | 🌐 www.holidayai.com</p>
            <p style="font-size: 12px; margin-top: 15px;">This receipt was generated on ${receipt.issuedAt.toLocaleDateString()} at ${receipt.issuedAt.toLocaleTimeString()}</p>
        </div>
    </body>
    </html>
  `
}

function getComponentIcon(type: string): string {
  const icons = {
    flight: '✈️',
    hotel: '🏨',
    activity: '🎯',
    transport: '🚗'
  }
  return icons[type as keyof typeof icons] || '📄'
}

function formatDetailValue(value: any): string {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'string' && value.includes('T') && value.includes(':')) {
    // Looks like a date string
    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }
  return String(value)
}

export async function downloadReceiptPDF(bookingId: string): Promise<Blob | null> {
  try {
    const receipt = await generateDigitalReceipt(bookingId)
    if (!receipt) return null

    const html = generateReceiptHTML(receipt)
    
    // This would require a PDF generation library like Puppeteer or jsPDF
    // For now, we'll return the HTML as a blob
    const blob = new Blob([html], { type: 'text/html' })
    return blob

  } catch (error) {
    console.error('Error generating PDF receipt:', error)
    return null
  }
}