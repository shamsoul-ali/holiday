import { NextRequest, NextResponse } from 'next/server'

interface FlightVendor {
  id: string
  name: string
  logo_url: string
  booking_url: string
  api_provider: string
  reliability_score: number
  last_updated: string
}

interface VendorPrice {
  vendor: FlightVendor
  price: number
  currency: string
  availability: 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT'
  booking_class: string
  restrictions: string[]
  baggage_included: boolean
  seat_selection: boolean
  meal_included: boolean
  refundable: boolean
  change_fee: number
  last_updated: string
  price_change: {
    direction: 'UP' | 'DOWN' | 'STABLE'
    percentage: number
    amount: number
    since: string
  }
}

interface PriceMonitoringResult {
  route: string
  search_criteria: {
    origin: string
    destination: string
    departure_date: string
    return_date?: string
    adults: number
    children: number
    travel_class: string
  }
  monitoring_status: 'ACTIVE' | 'PAUSED' | 'ERROR'
  last_scan: string
  vendor_prices: VendorPrice[]
  best_deals: {
    lowest_price: VendorPrice
    best_value: VendorPrice
    most_flexible: VendorPrice
  }
  price_trends: {
    average_price: number
    median_price: number
    price_range: { min: number; max: number }
    volatility_score: number
    trend_direction: 'RISING' | 'FALLING' | 'STABLE'
  }
  alerts_triggered: {
    price_drops: number
    threshold_alerts: number
    availability_changes: number
  }
  next_scan_time: string
  monitoring_duration: number
}

// Mock vendor data
const FLIGHT_VENDORS: FlightVendor[] = [
  {
    id: 'expedia',
    name: 'Expedia',
    logo_url: '/logos/expedia.png',
    booking_url: 'https://expedia.com',
    api_provider: 'expedia_api',
    reliability_score: 4.2,
    last_updated: new Date().toISOString()
  },
  {
    id: 'booking',
    name: 'Booking.com',
    logo_url: '/logos/booking.png',
    booking_url: 'https://booking.com',
    api_provider: 'booking_api',
    reliability_score: 4.4,
    last_updated: new Date().toISOString()
  },
  {
    id: 'agoda',
    name: 'Agoda',
    logo_url: '/logos/agoda.png',
    booking_url: 'https://agoda.com',
    api_provider: 'agoda_api',
    reliability_score: 4.1,
    last_updated: new Date().toISOString()
  },
  {
    id: 'kayak',
    name: 'Kayak',
    logo_url: '/logos/kayak.png',
    booking_url: 'https://kayak.com',
    api_provider: 'kayak_api',
    reliability_score: 4.3,
    last_updated: new Date().toISOString()
  },
  {
    id: 'skyscanner',
    name: 'Skyscanner',
    logo_url: '/logos/skyscanner.png',
    booking_url: 'https://skyscanner.com',
    api_provider: 'skyscanner_api',
    reliability_score: 4.5,
    last_updated: new Date().toISOString()
  },
  {
    id: 'momondo',
    name: 'Momondo',
    logo_url: '/logos/momondo.png',
    booking_url: 'https://momondo.com',
    api_provider: 'momondo_api',
    reliability_score: 4.0,
    last_updated: new Date().toISOString()
  },
  {
    id: 'airasia',
    name: 'AirAsia',
    logo_url: '/logos/airasia.png',
    booking_url: 'https://airasia.com',
    api_provider: 'direct_airline',
    reliability_score: 4.2,
    last_updated: new Date().toISOString()
  },
  {
    id: 'malaysia_airlines',
    name: 'Malaysia Airlines',
    logo_url: '/logos/mas.png',
    booking_url: 'https://malaysiaairlines.com',
    api_provider: 'direct_airline',
    reliability_score: 4.3,
    last_updated: new Date().toISOString()
  }
]

// Generate realistic vendor price data
function generateVendorPrices(
  origin: string, 
  destination: string, 
  departure_date: string,
  travel_class: string,
  adults: number,
  children: number
): VendorPrice[] {
  const basePrice = getBasePrice(origin, destination)
  const classMultiplier = travel_class === 'BUSINESS' ? 3.5 : travel_class === 'PREMIUM_ECONOMY' ? 1.8 : 1
  const passengerMultiplier = adults + (children * 0.75)
  
  return FLIGHT_VENDORS.map(vendor => {
    // Each vendor has different pricing strategies
    let vendorMultiplier = 1
    const randomVariation = 0.85 + (Math.random() * 0.3) // ±15% variation
    
    switch (vendor.id) {
      case 'expedia':
        vendorMultiplier = 0.95 // Often slightly cheaper
        break
      case 'booking':
        vendorMultiplier = 1.02 // Premium positioning
        break
      case 'agoda':
        vendorMultiplier = 0.92 // Competitive pricing
        break
      case 'kayak':
        vendorMultiplier = 0.98 // Meta-search, varies
        break
      case 'skyscanner':
        vendorMultiplier = 0.96 // Good deals
        break
      case 'momondo':
        vendorMultiplier = 0.94 // Often best prices
        break
      case 'airasia':
        vendorMultiplier = 0.88 // Low-cost carrier
        break
      case 'malaysia_airlines':
        vendorMultiplier = 1.15 // Full-service premium
        break
    }
    
    const finalPrice = Math.round(
      basePrice * classMultiplier * passengerMultiplier * vendorMultiplier * randomVariation
    )
    
    // Generate price change data
    const priceChangeDirection = Math.random() > 0.6 ? 'UP' : Math.random() > 0.3 ? 'DOWN' : 'STABLE'
    const priceChangePercentage = priceChangeDirection === 'STABLE' ? 0 : Math.random() * 15 + 1
    const priceChangeAmount = priceChangeDirection === 'UP' ? 
      Math.round(finalPrice * (priceChangePercentage / 100)) :
      priceChangeDirection === 'DOWN' ?
      -Math.round(finalPrice * (priceChangePercentage / 100)) : 0
    
    return {
      vendor,
      price: finalPrice,
      currency: 'MYR',
      availability: Math.random() > 0.9 ? 'LIMITED' : Math.random() > 0.98 ? 'SOLD_OUT' : 'AVAILABLE',
      booking_class: travel_class,
      restrictions: generateRestrictions(vendor.id),
      baggage_included: vendor.id.includes('airline') || Math.random() > 0.6,
      seat_selection: vendor.id.includes('airline') || Math.random() > 0.4,
      meal_included: travel_class !== 'ECONOMY' || vendor.id.includes('airline'),
      refundable: travel_class === 'BUSINESS' || Math.random() > 0.7,
      change_fee: travel_class === 'BUSINESS' ? 0 : Math.round(Math.random() * 300 + 50),
      last_updated: new Date().toISOString(),
      price_change: {
        direction: priceChangeDirection,
        percentage: Math.round(priceChangePercentage * 10) / 10,
        amount: priceChangeAmount,
        since: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  }).sort((a, b) => a.price - b.price)
}

function getBasePrice(origin: string, destination: string): number {
  const routes = {
    'KUL-BKK': 280, 'KUL-SIN': 150, 'KUL-CGK': 200, 'KUL-NRT': 650,
    'KUL-ICN': 580, 'KUL-PVG': 520, 'KUL-SYD': 450, 'KUL-MEL': 420,
    'KUL-LHR': 850, 'KUL-CDG': 920, 'KUL-FRA': 900, 'KUL-JFK': 1200,
    'KUL-LAX': 1100, 'KUL-DXB': 550, 'KUL-DOH': 600, 'KUL-IST': 700
  }
  
  const routeKey = `${origin}-${destination}`
  const reverseKey = `${destination}-${origin}`
  
  return routes[routeKey] || routes[reverseKey] || 400
}

function generateRestrictions(vendorId: string): string[] {
  const allRestrictions = [
    'Non-refundable',
    'Change fee applies',
    'No seat selection',
    'Basic baggage only',
    'No meal included',
    'No cancellation',
    '24hr advance booking required'
  ]
  
  // Airlines typically have fewer restrictions
  if (vendorId.includes('airline')) {
    return allRestrictions.slice(0, Math.floor(Math.random() * 2))
  }
  
  return allRestrictions.slice(0, Math.floor(Math.random() * 4) + 1)
}

function analyzePriceTrends(vendorPrices: VendorPrice[]) {
  const prices = vendorPrices.map(vp => vp.price)
  const average = prices.reduce((sum, p) => sum + p, 0) / prices.length
  const sorted = [...prices].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  
  // Calculate volatility
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / prices.length
  const volatilityScore = Math.sqrt(variance) / average
  
  // Determine trend direction based on recent price changes
  const upTrends = vendorPrices.filter(vp => vp.price_change.direction === 'UP').length
  const downTrends = vendorPrices.filter(vp => vp.price_change.direction === 'DOWN').length
  
  const trendDirection = upTrends > downTrends ? 'RISING' : 
                        downTrends > upTrends ? 'FALLING' : 'STABLE'
  
  return {
    average_price: Math.round(average),
    median_price: median,
    price_range: { min, max },
    volatility_score: Math.round(volatilityScore * 1000) / 1000,
    trend_direction: trendDirection
  }
}

function identifyBestDeals(vendorPrices: VendorPrice[]) {
  const available = vendorPrices.filter(vp => vp.availability === 'AVAILABLE')
  
  const lowestPrice = available.reduce((min, current) => 
    current.price < min.price ? current : min
  )
  
  // Best value considers price, restrictions, and included services
  const bestValue = available.reduce((best, current) => {
    const currentScore = calculateValueScore(current)
    const bestScore = calculateValueScore(best)
    return currentScore > bestScore ? current : best
  })
  
  // Most flexible considers refundability and change policies
  const mostFlexible = available.reduce((most, current) => {
    const currentFlexScore = calculateFlexibilityScore(current)
    const mostFlexScore = calculateFlexibilityScore(most)
    return currentFlexScore > mostFlexScore ? current : most
  })
  
  return {
    lowest_price: lowestPrice,
    best_value: bestValue,
    most_flexible: mostFlexible
  }
}

function calculateValueScore(vendorPrice: VendorPrice): number {
  let score = 100 / vendorPrice.price // Lower price = higher score
  
  if (vendorPrice.baggage_included) score += 0.2
  if (vendorPrice.seat_selection) score += 0.15
  if (vendorPrice.meal_included) score += 0.1
  if (vendorPrice.refundable) score += 0.25
  if (vendorPrice.change_fee === 0) score += 0.2
  
  // Deduct points for restrictions
  score -= vendorPrice.restrictions.length * 0.05
  
  return score
}

function calculateFlexibilityScore(vendorPrice: VendorPrice): number {
  let score = 0
  
  if (vendorPrice.refundable) score += 10
  if (vendorPrice.change_fee === 0) score += 8
  if (vendorPrice.change_fee < 100) score += 5
  if (vendorPrice.restrictions.length === 0) score += 5
  if (vendorPrice.seat_selection) score += 3
  
  return score
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      origin, 
      destination, 
      departure_date, 
      return_date,
      adults = 1,
      children = 0,
      travel_class = 'ECONOMY'
    } = body
    
    if (!origin || !destination || !departure_date) {
      return NextResponse.json(
        { error: 'Origin, destination, and departure_date are required' },
        { status: 400 }
      )
    }
    
    // Generate vendor prices
    const vendorPrices = generateVendorPrices(
      origin, 
      destination, 
      departure_date,
      travel_class,
      adults,
      children
    )
    
    // Analyze trends and identify best deals
    const priceTrends = analyzePriceTrends(vendorPrices)
    const bestDeals = identifyBestDeals(vendorPrices)
    
    // Calculate monitoring metrics
    const alertsTriggered = {
      price_drops: Math.floor(Math.random() * 3),
      threshold_alerts: Math.floor(Math.random() * 2),
      availability_changes: Math.floor(Math.random() * 5)
    }
    
    const result: PriceMonitoringResult = {
      route: `${origin} → ${destination}`,
      search_criteria: {
        origin,
        destination,
        departure_date,
        return_date,
        adults,
        children,
        travel_class
      },
      monitoring_status: 'ACTIVE',
      last_scan: new Date().toISOString(),
      vendor_prices: vendorPrices,
      best_deals: bestDeals,
      price_trends: priceTrends,
      alerts_triggered: alertsTriggered,
      next_scan_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      monitoring_duration: Math.floor(Math.random() * 7) + 1 // 1-7 days
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      scan_time: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Price monitoring error:', error)
    return NextResponse.json(
      { error: 'Failed to monitor prices across vendors' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return current monitoring status for all active monitors
    const activeMonitors = [
      {
        id: 'monitor_1',
        route: 'KUL → BKK',
        status: 'ACTIVE',
        last_update: new Date().toISOString(),
        price_changes_24h: 3,
        lowest_price_found: 245
      },
      {
        id: 'monitor_2', 
        route: 'KUL → SIN',
        status: 'ACTIVE',
        last_update: new Date(Date.now() - 300000).toISOString(),
        price_changes_24h: 1,
        lowest_price_found: 128
      }
    ]
    
    return NextResponse.json({
      success: true,
      active_monitors: activeMonitors,
      total_vendors: FLIGHT_VENDORS.length,
      system_status: 'OPERATIONAL'
    })
    
  } catch (error) {
    console.error('Monitoring status error:', error)
    return NextResponse.json(
      { error: 'Failed to get monitoring status' },
      { status: 500 }
    )
  }
}