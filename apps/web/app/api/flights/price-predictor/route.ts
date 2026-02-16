import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '../../../../lib/api-config'

interface PricePredictionRequest {
  origin: string
  destination: string
  departure_date: string
  return_date?: string
  adults: number
  children?: number
  infants?: number
  travel_class?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
  currency?: string
}

interface PricePoint {
  price: number
  timestamp: string
  provider: string
  travel_class: string
}

interface PricePredictionResponse {
  success: boolean
  data?: {
    current_price: {
      amount: number
      currency: string
      provider: string
      last_updated: string
    }
    prediction: {
      recommendation: 'BUY_NOW' | 'WAIT' | 'MONITOR'
      confidence_score: number // 0-100
      reasoning: string
      expected_change: {
        direction: 'UP' | 'DOWN' | 'STABLE'
        percentage: number
        timeframe_days: number
      }
    }
    historical_analysis: {
      avg_price_30d: number
      lowest_price_30d: number
      highest_price_30d: number
      price_trend: 'RISING' | 'FALLING' | 'STABLE'
      volatility_score: number // 0-100
    }
    optimal_booking_window: {
      start_date: string
      end_date: string
      reason: string
    }
    seasonal_insights: {
      is_peak_season: boolean
      seasonal_factor: number
      comparable_periods: string[]
    }
    savings_opportunities: {
      flexible_dates: {
        potential_savings: number
        alternative_dates: string[]
      }
      nearby_airports: {
        potential_savings: number
        alternative_airports: string[]
      }
    }
    next_check_recommendation: string
    price_alerts: {
      target_price: number
      drop_threshold_percentage: number
    }
  }
  error?: string
}

// Mock historical price data - In production, this would come from a database
const getHistoricalPrices = async (route: string): Promise<PricePoint[]> => {
  const mockData: PricePoint[] = []
  const basePrice = 800 + Math.random() * 400
  const today = new Date()
  
  // Generate 30 days of historical data with realistic patterns
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Simulate price fluctuations with seasonal patterns
    const dayOfWeek = date.getDay()
    const weekendMultiplier = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.15 : 1.0
    const volatility = (Math.random() - 0.5) * 0.2
    const seasonalFactor = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.1
    
    const price = basePrice * weekendMultiplier * (1 + volatility + seasonalFactor)
    
    mockData.push({
      price: Math.round(price),
      timestamp: date.toISOString(),
      provider: 'amadeus',
      travel_class: 'ECONOMY'
    })
  }
  
  return mockData
}

const analyzePriceTrend = (prices: PricePoint[]): { 
  trend: 'RISING' | 'FALLING' | 'STABLE', 
  volatility: number,
  avg_price: number 
} => {
  if (prices.length < 7) {
    return { trend: 'STABLE', volatility: 0, avg_price: prices[0]?.price || 0 }
  }
  
  const recent7Days = prices.slice(-7)
  const previous7Days = prices.slice(-14, -7)
  
  const recentAvg = recent7Days.reduce((sum, p) => sum + p.price, 0) / recent7Days.length
  const previousAvg = previous7Days.reduce((sum, p) => sum + p.price, 0) / previous7Days.length
  const totalAvg = prices.reduce((sum, p) => sum + p.price, 0) / prices.length
  
  const change = (recentAvg - previousAvg) / previousAvg
  
  // Calculate volatility as coefficient of variation
  const stdDev = Math.sqrt(prices.reduce((sum, p) => sum + Math.pow(p.price - totalAvg, 2), 0) / prices.length)
  const volatility = Math.min(100, (stdDev / totalAvg) * 100)
  
  let trend: 'RISING' | 'FALLING' | 'STABLE' = 'STABLE'
  if (change > 0.05) trend = 'RISING'
  else if (change < -0.05) trend = 'FALLING'
  
  return { trend, volatility, avg_price: totalAvg }
}

const generatePrediction = (
  currentPrice: number,
  historicalData: PricePoint[],
  departureDate: string,
  isReturnTrip: boolean
): {
  recommendation: 'BUY_NOW' | 'WAIT' | 'MONITOR'
  confidence_score: number
  reasoning: string
  expected_change: {
    direction: 'UP' | 'DOWN' | 'STABLE'
    percentage: number
    timeframe_days: number
  }
} => {
  const analysis = analyzePriceTrend(historicalData)
  const daysUntilDeparture = Math.ceil((new Date(departureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  
  let recommendation: 'BUY_NOW' | 'WAIT' | 'MONITOR' = 'MONITOR'
  let confidence = 65
  let reasoning = ''
  let expectedDirection: 'UP' | 'DOWN' | 'STABLE' = 'STABLE'
  let expectedPercentage = 5
  
  // Price prediction logic based on multiple factors
  const currentVsAvg = (currentPrice - analysis.avg_price) / analysis.avg_price
  
  // Factor 1: Days until departure (sweet spot is usually 1-3 months out)
  if (daysUntilDeparture < 14) {
    recommendation = 'BUY_NOW'
    confidence = 85
    reasoning = 'Prices typically increase significantly within 2 weeks of departure. Book now to avoid last-minute surges.'
    expectedDirection = 'UP'
    expectedPercentage = 15
  } else if (daysUntilDeparture > 120) {
    if (analysis.trend === 'RISING') {
      recommendation = 'WAIT'
      confidence = 70
      reasoning = 'Booking window is still early. Prices may stabilize or decrease as the date approaches.'
      expectedDirection = 'DOWN'
      expectedPercentage = 8
    } else {
      recommendation = 'MONITOR'
      confidence = 60
      reasoning = 'Good booking window approaching. Monitor for the next 2-4 weeks for optimal pricing.'
    }
  } else {
    // Factor 2: Current price vs historical average
    if (currentVsAvg < -0.15) {
      recommendation = 'BUY_NOW'
      confidence = 80
      reasoning = 'Current price is significantly below average. This is likely a good deal.'
      expectedDirection = 'UP'
      expectedPercentage = 12
    } else if (currentVsAvg > 0.2) {
      recommendation = 'WAIT'
      confidence = 75
      reasoning = 'Current price is above average. Consider waiting for prices to normalize.'
      expectedDirection = 'DOWN'
      expectedPercentage = 10
    } else {
      // Factor 3: Price trend analysis
      if (analysis.trend === 'FALLING' && analysis.volatility < 20) {
        recommendation = 'WAIT'
        confidence = 70
        reasoning = 'Prices are trending downward with low volatility. May be worth waiting a few more days.'
        expectedDirection = 'DOWN'
        expectedPercentage = 7
      } else if (analysis.trend === 'RISING' && analysis.volatility > 30) {
        recommendation = 'BUY_NOW'
        confidence = 75
        reasoning = 'Prices are rising with high volatility. Book now to lock in current rates.'
        expectedDirection = 'UP'
        expectedPercentage = 12
      } else {
        recommendation = 'MONITOR'
        confidence = 65
        reasoning = 'Prices are relatively stable. Continue monitoring for the next week.'
        expectedDirection = 'STABLE'
        expectedPercentage = 5
      }
    }
  }
  
  return {
    recommendation,
    confidence_score: confidence,
    reasoning,
    expected_change: {
      direction: expectedDirection,
      percentage: expectedPercentage,
      timeframe_days: Math.min(14, Math.max(3, daysUntilDeparture / 4))
    }
  }
}

// Helper function to estimate flight prices by route when APIs fail
function estimateFlightPriceByRoute(origin: string, destination: string, adults: number, currency: string): number {
  const routePrices: { [key: string]: number } = {
    // From Malaysia (KUL) - prices in MYR
    'KUL-CGK': 800, 'KUL-JKT': 800, 'KUL-JAKARTA': 800,
    'KUL-SIN': 300, 'KUL-SINGAPORE': 300,
    'KUL-BKK': 400, 'KUL-BANGKOK': 400,
    'KUL-IST': 1200, 'KUL-ISTANBUL': 1200,
    'KUL-TYO': 1500, 'KUL-TOKYO': 1500, 'KUL-NRT': 1500,
    'KUL-HKG': 600, 'KUL-HONG': 600,
    'KUL-ICN': 900, 'KUL-SEOUL': 900,
    'KUL-DXB': 1000, 'KUL-DUBAI': 1000,
    'KUL-LHR': 2000, 'KUL-LONDON': 2000,
    'KUL-CDG': 2100, 'KUL-PARIS': 2100,
    'KUL-JFK': 2500, 'KUL-NEW': 2500,
    
    // Popular regional routes
    'SIN-BKK': 250, 'BKK-SIN': 250,
    'SIN-CGK': 200, 'CGK-SIN': 200,
    'BKK-CGK': 300, 'CGK-BKK': 300
  }

  const route = `${origin}-${destination}`
  const reverseRoute = `${destination}-${origin}`
  
  // Try to match with destination codes or city names
  let basePrice = routePrices[route] || routePrices[reverseRoute]
  
  // If no exact match, try partial matches
  if (!basePrice) {
    for (const [routeKey, price] of Object.entries(routePrices)) {
      if (routeKey.includes(origin) && routeKey.includes(destination)) {
        basePrice = price
        break
      }
    }
  }
  
  // Default fallback based on estimated distance
  if (!basePrice) {
    if (origin === 'KUL' || destination === 'KUL') {
      // From Malaysia to unknown destination
      basePrice = 1000
    } else {
      basePrice = 800 // Generic international route
    }
  }

  // Multiply by number of travelers
  let totalPrice = basePrice * adults

  // Add some realistic variation (±10%)
  const variation = (Math.random() - 0.5) * 0.2
  totalPrice = Math.round(totalPrice * (1 + variation))

  // Convert currency if needed
  if (currency === 'USD') {
    totalPrice = Math.round(totalPrice / 4.7) // MYR to USD approximation
  }

  return totalPrice
}

export async function POST(request: NextRequest) {
  try {
    const body: PricePredictionRequest = await request.json()
    
    if (!body.origin || !body.destination || !body.departure_date) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: origin, destination, departure_date'
      }, { status: 400 })
    }
    
    // Get current prices from flight search API
    const flightSearchUrl = new URL('/api/flights/search', request.url)
    flightSearchUrl.searchParams.set('origin', body.origin)
    flightSearchUrl.searchParams.set('destination', body.destination)
    flightSearchUrl.searchParams.set('departure_date', body.departure_date)
    flightSearchUrl.searchParams.set('adults', body.adults.toString())
    
    if (body.return_date) {
      flightSearchUrl.searchParams.set('return_date', body.return_date)
    }
    if (body.travel_class) {
      flightSearchUrl.searchParams.set('travel_class', body.travel_class)
    }
    
    // Fetch current flight prices with better error handling
    let flightData
    try {
      const flightResponse = await fetch(flightSearchUrl.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Holiday-AI-Price-Predictor'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (!flightResponse.ok) {
        throw new Error(`Flight API returned ${flightResponse.status}`)
      }
      
      flightData = await flightResponse.json()
    } catch (fetchError) {
      console.error('Flight price fetch error:', fetchError)
      
      // Generate estimate based on route if API fails
      const estimatedPrice = estimateFlightPriceByRoute(body.origin, body.destination, body.adults, body.currency || 'MYR')
      
      flightData = {
        success: true,
        data: [{
          price: { total: estimatedPrice },
          airline: 'Estimated Price',
          id: 'estimated_flight'
        }]
      }
    }
    
    if (!flightData.success || !flightData.data?.length) {
      // Fallback to estimated pricing
      const estimatedPrice = estimateFlightPriceByRoute(body.origin, body.destination, body.adults, body.currency || 'MYR')
      flightData = {
        success: true,
        data: [{
          price: { total: estimatedPrice },
          airline: 'Estimated Price',
          id: 'estimated_flight'
        }]
      }
    }
    
    const currentFlight = flightData.data[0]
    const currentPrice = parseFloat(currentFlight.price?.total || '0')
    
    // Get historical data
    const route = `${body.origin}-${body.destination}`
    const historicalPrices = await getHistoricalPrices(route)
    
    // Generate prediction
    const prediction = generatePrediction(
      currentPrice,
      historicalPrices,
      body.departure_date,
      !!body.return_date
    )
    
    // Calculate historical analysis
    const analysis = analyzePriceTrend(historicalPrices)
    const last30Days = historicalPrices.slice(-30)
    const prices = last30Days.map(p => p.price)
    
    // Calculate optimal booking window
    const departureDate = new Date(body.departure_date)
    const today = new Date()
    const daysUntilDeparture = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    const optimalStart = new Date(today)
    optimalStart.setDate(today.getDate() + Math.max(0, daysUntilDeparture - 60))
    
    const optimalEnd = new Date(today)
    optimalEnd.setDate(today.getDate() + Math.max(7, daysUntilDeparture - 21))
    
    const response: PricePredictionResponse = {
      success: true,
      data: {
        current_price: {
          amount: currentPrice,
          currency: body.currency || 'USD',
          provider: 'amadeus',
          last_updated: new Date().toISOString()
        },
        prediction,
        historical_analysis: {
          avg_price_30d: Math.round(analysis.avg_price),
          lowest_price_30d: Math.min(...prices),
          highest_price_30d: Math.max(...prices),
          price_trend: analysis.trend,
          volatility_score: Math.round(analysis.volatility)
        },
        optimal_booking_window: {
          start_date: optimalStart.toISOString().split('T')[0],
          end_date: optimalEnd.toISOString().split('T')[0],
          reason: 'Based on historical data, this is typically the best booking window for this route'
        },
        seasonal_insights: {
          is_peak_season: [11, 0, 1, 6, 7].includes(departureDate.getMonth()),
          seasonal_factor: 1.0 + Math.sin((departureDate.getMonth() / 12) * Math.PI * 2) * 0.15,
          comparable_periods: ['Last year same period', 'Holiday seasons', 'Summer vacation period']
        },
        savings_opportunities: {
          flexible_dates: {
            potential_savings: Math.round(currentPrice * 0.12),
            alternative_dates: [
              new Date(departureDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              new Date(departureDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              new Date(departureDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            ]
          },
          nearby_airports: {
            potential_savings: Math.round(currentPrice * 0.08),
            alternative_airports: ['Alternative nearby airports may offer lower prices']
          }
        },
        next_check_recommendation: prediction.recommendation === 'WAIT' ? 
          `Check again in ${prediction.expected_change.timeframe_days} days` :
          prediction.recommendation === 'MONITOR' ?
          'Check again in 2-3 days' :
          'Book as soon as possible',
        price_alerts: {
          target_price: Math.round(currentPrice * 0.9),
          drop_threshold_percentage: 10
        }
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('Price prediction error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate price prediction'
    }, { status: 500 })
  }
}