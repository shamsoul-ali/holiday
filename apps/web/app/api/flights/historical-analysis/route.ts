import { NextRequest, NextResponse } from 'next/server'

interface HistoricalPricePoint {
  date: string
  price: number
  demand_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK'
  season: 'LOW' | 'SHOULDER' | 'HIGH' | 'PEAK'
  day_of_week: string
  advance_booking_days: number
}

interface SeasonalPattern {
  season: string
  avg_price: number
  price_volatility: number
  booking_window_effect: number
  demand_trend: 'INCREASING' | 'STABLE' | 'DECREASING'
}

interface TrendAnalysis {
  route: string
  historical_data: HistoricalPricePoint[]
  seasonal_patterns: SeasonalPattern[]
  price_trends: {
    short_term: 'UP' | 'DOWN' | 'STABLE'
    long_term: 'UP' | 'DOWN' | 'STABLE'
    volatility_level: 'LOW' | 'MEDIUM' | 'HIGH'
  }
  optimal_booking_windows: {
    domestic: { min_days: number; max_days: number; avg_savings: number }
    international: { min_days: number; max_days: number; avg_savings: number }
  }
  market_insights: {
    peak_demand_periods: string[]
    lowest_price_months: string[]
    highest_savings_opportunities: string[]
    risk_factors: string[]
  }
}

// Generate comprehensive historical data for route analysis
function generateHistoricalData(
  origin: string,
  destination: string,
  months: number = 12
): HistoricalPricePoint[] {
  const data: HistoricalPricePoint[] = []
  const basePrice = getBasePrice(origin, destination)
  const currentDate = new Date()
  
  for (let i = months * 30; i >= 0; i--) {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - i)
    
    const seasonalMultiplier = getSeasonalMultiplier(date)
    const dayOfWeekMultiplier = getDayOfWeekMultiplier(date.getDay())
    const demandMultiplier = getDemandMultiplier(date, origin, destination)
    const advanceBookingEffect = getAdvanceBookingEffect(i)
    
    const price = Math.round(
      basePrice * 
      seasonalMultiplier * 
      dayOfWeekMultiplier * 
      demandMultiplier * 
      advanceBookingEffect *
      (0.85 + Math.random() * 0.3) // Add some randomness
    )
    
    data.push({
      date: date.toISOString().split('T')[0],
      price,
      demand_level: getDemandLevel(demandMultiplier),
      season: getSeason(date),
      day_of_week: date.toLocaleDateString('en-US', { weekday: 'long' }),
      advance_booking_days: i
    })
  }
  
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function getBasePrice(origin: string, destination: string): number {
  const priceMap: { [key: string]: number } = {
    'KUL-BKK': 280, 'KUL-SIN': 150, 'KUL-CGK': 200, 'KUL-NRT': 650,
    'KUL-ICN': 580, 'KUL-PVG': 520, 'KUL-SYD': 450, 'KUL-MEL': 420,
    'KUL-LHR': 850, 'KUL-CDG': 920, 'KUL-FRA': 900, 'KUL-JFK': 1200,
    'KUL-LAX': 1100, 'KUL-DXB': 550, 'KUL-DOH': 600, 'KUL-IST': 700
  }
  
  const routeKey = `${origin}-${destination}`
  const reverseKey = `${destination}-${origin}`
  
  return priceMap[routeKey] || priceMap[reverseKey] || 400
}

function getSeasonalMultiplier(date: Date): number {
  const month = date.getMonth()
  const seasonalFactors: { [key: number]: number } = {
    0: 1.3,  // January - New Year travel
    1: 0.9,  // February - Low season
    2: 0.95, // March 
    3: 1.1,  // April - Spring break
    4: 1.15, // May - Start of summer
    5: 1.4,  // June - Peak summer
    6: 1.45, // July - Peak summer
    7: 1.4,  // August - Peak summer
    8: 1.1,  // September - Shoulder season
    9: 1.05, // October
    10: 1.2, // November - Thanksgiving
    11: 1.5  // December - Holiday season
  }
  
  return seasonalFactors[month] || 1.0
}

function getDayOfWeekMultiplier(dayOfWeek: number): number {
  const dayMultipliers = [1.1, 0.9, 0.85, 0.85, 1.2, 1.3, 1.15] // Sun-Sat
  return dayMultipliers[dayOfWeek] || 1.0
}

function getDemandMultiplier(date: Date, origin: string, destination: string): number {
  const month = date.getMonth()
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  
  // High demand periods for popular Asian routes
  const peakPeriods = [
    { start: 0, end: 1 },   // Jan-Feb (Chinese New Year)
    { start: 5, end: 8 },   // Jun-Aug (Summer holidays)
    { start: 11, end: 11 }  // December (Year-end holidays)
  ]
  
  let demandMultiplier = 1.0
  
  for (const period of peakPeriods) {
    if (month >= period.start && month <= period.end) {
      demandMultiplier = 1.3
      break
    }
  }
  
  if (isWeekend) {
    demandMultiplier *= 1.1
  }
  
  return demandMultiplier
}

function getAdvanceBookingEffect(daysInAdvance: number): number {
  if (daysInAdvance <= 7) return 1.4      // Last minute premium
  if (daysInAdvance <= 21) return 1.15    // Short notice
  if (daysInAdvance <= 60) return 0.9     // Sweet spot
  if (daysInAdvance <= 120) return 0.95   // Early booking discount
  return 1.05                              // Too early, limited inventory
}

function getDemandLevel(multiplier: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK' {
  if (multiplier >= 1.3) return 'PEAK'
  if (multiplier >= 1.15) return 'HIGH'
  if (multiplier >= 1.0) return 'MEDIUM'
  return 'LOW'
}

function getSeason(date: Date): 'LOW' | 'SHOULDER' | 'HIGH' | 'PEAK' {
  const month = date.getMonth()
  
  if (month === 11 || month === 0 || (month >= 5 && month <= 7)) return 'PEAK'
  if (month === 3 || month === 4 || month === 10) return 'HIGH'
  if (month === 8 || month === 9) return 'SHOULDER'
  return 'LOW'
}

function analyzeSeasonalPatterns(data: HistoricalPricePoint[]): SeasonalPattern[] {
  const seasonGroups = data.reduce((acc, point) => {
    if (!acc[point.season]) acc[point.season] = []
    acc[point.season].push(point.price)
    return acc
  }, {} as { [key: string]: number[] })
  
  return Object.entries(seasonGroups).map(([season, prices]) => {
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
    
    return {
      season,
      avg_price: Math.round(avgPrice),
      price_volatility: Math.round(Math.sqrt(variance)),
      booking_window_effect: Math.round((avgPrice - Math.min(...prices)) / avgPrice * 100),
      demand_trend: prices.length > 10 ? 
        (prices.slice(-5).reduce((a, b) => a + b) / 5 > prices.slice(0, 5).reduce((a, b) => a + b) / 5 ? 'INCREASING' : 'DECREASING') : 
        'STABLE'
    } as SeasonalPattern
  })
}

function analyzeTrends(data: HistoricalPricePoint[]): TrendAnalysis['price_trends'] {
  const recentPrices = data.slice(-30).map(d => d.price)
  const previousPrices = data.slice(-60, -30).map(d => d.price)
  
  const recentAvg = recentPrices.reduce((a, b) => a + b) / recentPrices.length
  const previousAvg = previousPrices.reduce((a, b) => a + b) / previousPrices.length
  
  const shortTermTrend = recentAvg > previousAvg * 1.05 ? 'UP' : 
                        recentAvg < previousAvg * 0.95 ? 'DOWN' : 'STABLE'
  
  const longTermTrend = data[data.length - 1].price > data[0].price * 1.1 ? 'UP' :
                       data[data.length - 1].price < data[0].price * 0.9 ? 'DOWN' : 'STABLE'
  
  const allPrices = data.map(d => d.price)
  const avgPrice = allPrices.reduce((a, b) => a + b) / allPrices.length
  const variance = allPrices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / allPrices.length
  const coefficientOfVariation = Math.sqrt(variance) / avgPrice
  
  const volatilityLevel = coefficientOfVariation > 0.3 ? 'HIGH' :
                         coefficientOfVariation > 0.15 ? 'MEDIUM' : 'LOW'
  
  return {
    short_term: shortTermTrend,
    long_term: longTermTrend,
    volatility_level: volatilityLevel
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin, destination, departure_date, return_date, route_type = 'international' } = body
    
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      )
    }
    
    // Generate comprehensive historical analysis
    const historicalData = generateHistoricalData(origin, destination, 12)
    const seasonalPatterns = analyzeSeasonalPatterns(historicalData)
    const priceTrends = analyzeTrends(historicalData)
    
    // Calculate optimal booking windows
    const domesticWindow = route_type === 'domestic' ? 
      { min_days: 14, max_days: 60, avg_savings: 23 } :
      { min_days: 30, max_days: 90, avg_savings: 18 }
    
    const internationalWindow = {
      min_days: 45,
      max_days: 120,
      avg_savings: 32
    }
    
    // Generate market insights
    const peakDemandPeriods = ['December', 'June-August', 'Chinese New Year']
    const lowestPriceMonths = ['February', 'September', 'November']
    const highestSavingsOpportunities = [
      'Book 60-90 days in advance',
      'Avoid weekend departures',
      'Consider shoulder season travel'
    ]
    const riskFactors = [
      priceTrends.volatility_level === 'HIGH' ? 'High price volatility detected' : null,
      priceTrends.short_term === 'UP' ? 'Prices trending upward recently' : null,
      'Fuel price fluctuations may impact fares'
    ].filter(Boolean) as string[]
    
    const analysis: TrendAnalysis = {
      route: `${origin} → ${destination}`,
      historical_data: historicalData.slice(-60), // Return last 60 days
      seasonal_patterns: seasonalPatterns,
      price_trends: priceTrends,
      optimal_booking_windows: {
        domestic: domesticWindow,
        international: internationalWindow
      },
      market_insights: {
        peak_demand_periods: peakDemandPeriods,
        lowest_price_months: lowestPriceMonths,
        highest_savings_opportunities: highestSavingsOpportunities,
        risk_factors: riskFactors
      }
    }
    
    return NextResponse.json({
      success: true,
      analysis,
      generated_at: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Historical analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate historical analysis' },
      { status: 500 }
    )
  }
}