import { NextRequest, NextResponse } from 'next/server'
import { generateDigitalReceipt, generateReceiptHTML, verifyQRCode } from '@/lib/services/digital-receipt'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // json, html, pdf

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400 })
    }

    // Generate digital receipt
    const receipt = await generateDigitalReceipt(bookingId)
    
    if (!receipt) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate receipt. Booking may not exist or is invalid.'
      }, { status: 404 })
    }

    // Return different formats based on request
    switch (format) {
      case 'html':
        const html = generateReceiptHTML(receipt)
        return new NextResponse(html, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `inline; filename="receipt-${receipt.bookingReference}.html"`
          }
        })

      case 'pdf':
        // This would require a PDF generation library
        // For now, return HTML with PDF headers
        const pdfHtml = generateReceiptHTML(receipt)
        return new NextResponse(pdfHtml, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="receipt-${receipt.bookingReference}.pdf"`
          }
        })

      case 'json':
      default:
        return NextResponse.json({
          success: true,
          receipt: receipt
        })
    }

  } catch (error) {
    console.error('Receipt generation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId
    const body = await request.json()
    const { action, qrCodeData, verificationData } = body

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400 })
    }

    switch (action) {
      case 'verify_qr':
        if (!qrCodeData) {
          return NextResponse.json({
            success: false,
            error: 'QR code data is required for verification'
          }, { status: 400 })
        }

        const verificationResult = await verifyQRCode(qrCodeData)
        
        if (verificationResult.valid) {
          // Log successful verification
          const supabase = createSupabaseClient()
          await supabase
            .from('travel_notifications')
            .insert({
              user_id: verificationResult.data!.userId,
              booking_id: verificationResult.data!.bookingId,
              notification_type: 'booking_verification',
              title: '✅ QR Code Verified',
              message: `QR code for booking ${verificationResult.data!.bookingReference} was successfully verified`,
              priority: 'normal',
              delivery_method: 'app',
              sent_at: new Date().toISOString()
            })
        }

        return NextResponse.json({
          success: true,
          verification: verificationResult
        })

      case 'mark_used':
        // Mark QR code or receipt as used (e.g., after check-in)
        const supabase = createSupabaseClient()
        
        await supabase
          .from('travel_notifications')
          .insert({
            user_id: verificationData?.userId,
            booking_id: bookingId,
            notification_type: 'booking_update',
            title: '🎫 Check-in Completed',
            message: `Check-in completed for booking. Thank you for using Holiday AI!`,
            priority: 'normal',
            delivery_method: 'app',
            sent_at: new Date().toISOString()
          })

        return NextResponse.json({
          success: true,
          message: 'Receipt marked as used successfully'
        })

      case 'regenerate':
        // Regenerate receipt with fresh QR code
        const newReceipt = await generateDigitalReceipt(bookingId)
        
        if (!newReceipt) {
          return NextResponse.json({
            success: false,
            error: 'Failed to regenerate receipt'
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          receipt: newReceipt,
          message: 'Receipt regenerated successfully'
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Receipt action error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}