import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '../../../lib/api-config'

interface PriceAlert {
  id: string
  user_id: string
  origin: string
  destination: string
  departure_date: string
  return_date?: string
  adults: number
  children: number
  travel_class: string
  target_price: number
  current_price: number
  currency: string
  alert_type: 'PRICE_DROP' | 'THRESHOLD' | 'PERCENTAGE'
  threshold_percentage?: number
  status: 'ACTIVE' | 'TRIGGERED' | 'EXPIRED' | 'CANCELLED'
  created_at: string
  expires_at: string
  last_checked: string
  notifications_sent: number
  notification_preferences: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

interface CreatePriceAlertRequest {
  origin: string
  destination: string
  departure_date: string
  return_date?: string
  adults: number
  children?: number
  travel_class?: string
  target_price: number
  currency?: string
  alert_type?: 'PRICE_DROP' | 'THRESHOLD' | 'PERCENTAGE'
  threshold_percentage?: number
  notification_preferences?: {
    email?: boolean
    push?: boolean
    sms?: boolean
  }
}

// Mock database - In production, this would be stored in a real database
const priceAlerts: PriceAlert[] = []

// Mock user authentication - In production, this would come from auth middleware
const getCurrentUserId = (request: NextRequest): string => {
  // In production, extract from JWT token or session
  return request.headers.get('x-user-id') || 'user-' + Math.random().toString(36).substr(2, 9)
}

const generateAlertId = (): string => {
  return 'alert-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

const formatPrice = (price: number, currency: string = 'MYR'): string => {
  return `${currency} ${price.toLocaleString()}`
}

const sendNotification = async (alert: PriceAlert, newPrice: number, oldPrice: number) => {
  const savings = oldPrice - newPrice
  const savingsPercentage = Math.round((savings / oldPrice) * 100)
  
  console.log(`🔔 Price Alert Triggered for ${alert.id}:`)
  console.log(`   Route: ${alert.origin} → ${alert.destination}`)
  console.log(`   Previous price: ${formatPrice(oldPrice, alert.currency)}`)
  console.log(`   New price: ${formatPrice(newPrice, alert.currency)}`)
  console.log(`   You save: ${formatPrice(savings, alert.currency)} (${savingsPercentage}%)`)
  
  // In production, implement actual email/SMS/push notification sending
  if (alert.notification_preferences.email) {
    console.log(`📧 Email notification sent to user ${alert.user_id}`)
  }
  
  if (alert.notification_preferences.push) {
    console.log(`📱 Push notification sent to user ${alert.user_id}`)
  }
  
  if (alert.notification_preferences.sms) {
    console.log(`💬 SMS notification sent to user ${alert.user_id}`)
  }
  
  // Update alert stats
  alert.notifications_sent++
  alert.last_checked = new Date().toISOString()
}

const checkPriceAlerts = async () => {
  const activeAlerts = priceAlerts.filter(alert => alert.status === 'ACTIVE')
  
  for (const alert of activeAlerts) {
    try {
      // Check if alert has expired
      if (new Date(alert.expires_at) < new Date()) {
        alert.status = 'EXPIRED'
        continue
      }
      
      // Fetch current prices (simulate API call)
      // In production, this would call the actual flight search API
      const currentPrice = alert.current_price + (Math.random() - 0.5) * alert.current_price * 0.1
      
      let shouldTrigger = false
      
      switch (alert.alert_type) {
        case 'THRESHOLD':
          shouldTrigger = currentPrice <= alert.target_price
          break
        case 'PRICE_DROP':
          shouldTrigger = currentPrice < alert.current_price
          break
        case 'PERCENTAGE':
          const dropPercentage = ((alert.current_price - currentPrice) / alert.current_price) * 100
          shouldTrigger = dropPercentage >= (alert.threshold_percentage || 10)
          break
      }
      
      if (shouldTrigger) {
        await sendNotification(alert, currentPrice, alert.current_price)
        alert.status = 'TRIGGERED'
        alert.current_price = currentPrice
      } else {
        // Update current price for next check
        alert.current_price = currentPrice
        alert.last_checked = new Date().toISOString()
      }
      
    } catch (error) {
      console.error(`Error checking price alert ${alert.id}:`, error)
    }
  }
}

// Simulate periodic price checking (in production, this would be a cron job)
setInterval(checkPriceAlerts, 5 * 60 * 1000) // Check every 5 minutes

export async function GET(request: NextRequest) {
  try {
    const userId = getCurrentUserId(request)
    const userAlerts = priceAlerts.filter(alert => alert.user_id === userId)
    
    return NextResponse.json({
      success: true,
      data: {
        alerts: userAlerts,
        active_count: userAlerts.filter(a => a.status === 'ACTIVE').length,
        triggered_count: userAlerts.filter(a => a.status === 'TRIGGERED').length
      }
    })
  } catch (error: any) {
    console.error('Get price alerts error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch price alerts'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getCurrentUserId(request)
    const body: CreatePriceAlertRequest = await request.json()
    
    // Validate required fields
    if (!body.origin || !body.destination || !body.departure_date || !body.target_price) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: origin, destination, departure_date, target_price'
      }, { status: 400 })
    }
    
    // Validate target price
    if (body.target_price <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Target price must be greater than 0'
      }, { status: 400 })
    }
    
    // Get current price for comparison
    let currentPrice = body.target_price * 1.2 // Mock current price (20% higher than target)
    try {
      // In production, fetch actual current price from flight search API
      const flightSearchResponse = await fetch(`${request.nextUrl.origin}/api/flights/search?origin=${body.origin}&destination=${body.destination}&departure_date=${body.departure_date}&adults=${body.adults}&return_date=${body.return_date}&travel_class=${body.travel_class || 'ECONOMY'}`)
      
      if (flightSearchResponse.ok) {
        const flightData = await flightSearchResponse.json()
        if (flightData.success && flightData.data?.length > 0) {
          currentPrice = parseFloat(flightData.data[0].price?.total || '0')
        }
      }
    } catch (error) {
      console.log('Could not fetch current price, using mock price')
    }
    
    // Create alert
    const alert: PriceAlert = {
      id: generateAlertId(),
      user_id: userId,
      origin: body.origin,
      destination: body.destination,
      departure_date: body.departure_date,
      return_date: body.return_date,
      adults: body.adults,
      children: body.children || 0,
      travel_class: body.travel_class || 'ECONOMY',
      target_price: body.target_price,
      current_price: currentPrice,
      currency: body.currency || 'MYR',
      alert_type: body.alert_type || 'THRESHOLD',
      threshold_percentage: body.threshold_percentage || 10,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      last_checked: new Date().toISOString(),
      notifications_sent: 0,
      notification_preferences: {
        email: body.notification_preferences?.email ?? true,
        push: body.notification_preferences?.push ?? true,
        sms: body.notification_preferences?.sms ?? false
      }
    }
    
    priceAlerts.push(alert)
    
    // Provide immediate feedback
    const isCurrentlyBelowTarget = currentPrice <= body.target_price
    const priceDifference = currentPrice - body.target_price
    const percentageDifference = Math.round((priceDifference / body.target_price) * 100)
    
    return NextResponse.json({
      success: true,
      data: {
        alert,
        immediate_feedback: {
          current_price: currentPrice,
          target_price: body.target_price,
          is_below_target: isCurrentlyBelowTarget,
          price_difference: priceDifference,
          percentage_difference: percentageDifference,
          message: isCurrentlyBelowTarget 
            ? `Great! Current price (${formatPrice(currentPrice, alert.currency)}) is already below your target. Consider booking now!`
            : `Alert set! Current price is ${formatPrice(Math.abs(priceDifference), alert.currency)} (${Math.abs(percentageDifference)}%) above your target. We'll notify you when it drops.`
        }
      }
    })
    
  } catch (error: any) {
    console.error('Create price alert error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create price alert'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getCurrentUserId(request)
    const alertId = request.nextUrl.searchParams.get('id')
    
    if (!alertId) {
      return NextResponse.json({
        success: false,
        error: 'Alert ID is required'
      }, { status: 400 })
    }
    
    const alertIndex = priceAlerts.findIndex(alert => 
      alert.id === alertId && alert.user_id === userId
    )
    
    if (alertIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Price alert not found'
      }, { status: 404 })
    }
    
    priceAlerts[alertIndex].status = 'CANCELLED'
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Price alert cancelled successfully'
      }
    })
    
  } catch (error: any) {
    console.error('Delete price alert error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel price alert'
    }, { status: 500 })
  }
}