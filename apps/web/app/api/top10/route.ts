import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '../../../lib/api-config'

interface AmadeusDestination {
  type: string
  subType: string
  name: string
  iataCode: string
  geoCode: {
    latitude: number
    longitude: number
  }
  address?: {
    countryCode: string
    stateCode?: string
  }
  analytics?: {
    travelers?: {
      score: number
    }
  }
}

interface Top10Destination {
  destination_code: string
  name: string
  from_price: {
    amount: number
    currency: string
  }
  popularity_score: number
  signals: {
    intent_7d_vs_28d: number
    events_count: number
    halal_index: number
  }
  weather: {
    month: string
    comfort_index: number
    avg_high_c: number
    rain_prob: number
  }
  events: Array<{
    name: string
    date: string
  }>
  badges: string[]
  sample_package: {
    nights: number
    tier: string
    hotel: string
    activities: string[]
    est_total: {
      amount: number
      currency: string
    }
  }
  deep_links: {
    flight: string
    hotel: string
    activities: string[]
  }
}

// GET /api/top10 - Get top 10 destinations based on budget and preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const budget = parseFloat(searchParams.get('budget') || '5000')
    const currency = searchParams.get('currency') || 'MYR'
    const pax = parseInt(searchParams.get('pax') || '2')
    const origin = searchParams.get('origin') || 'KUL' // Default Kuala Lumpur

    console.log(`Fetching top 10 destinations for budget: ${budget} ${currency}, ${pax} pax from ${origin}`)

    // First try to get Amadeus access token
    let amadeusDestinations: AmadeusDestination[] = []
    try {
      const tokenResponse = await fetch(`https://test.api.amadeus.com/v1/security/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: API_CONFIG.AMADEUS.API_KEY,
          client_secret: API_CONFIG.AMADEUS.API_SECRET
        })
      })

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        
        // Get popular destinations from Amadeus
        const destinationsResponse = await fetch(
          `https://test.api.amadeus.com/v1/reference-data/locations/cities?countryCode=MY,TH,SG,JP,ID,VN&max=20`,
          {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`
            }
          }
        )

        if (destinationsResponse.ok) {
          const destinationsData = await destinationsResponse.json()
          amadeusDestinations = destinationsData.data || []
          console.log(`Fetched ${amadeusDestinations.length} destinations from Amadeus`)
        }
      }
    } catch (amadeusError) {
      console.log('Amadeus API not available, using enhanced mock data:', amadeusError)
    }

    // Process destinations and enhance with realistic data
    const enhancedDestinations: Top10Destination[] = []

    if (amadeusDestinations.length > 0) {
      // Use real Amadeus data and enhance it
      const selectedDestinations = amadeusDestinations
        .filter(dest => dest.iataCode && dest.name)
        .slice(0, 10)

      for (const dest of selectedDestinations) {
        const enhanced = await enhanceDestinationWithRealData(dest, budget, currency)
        if (enhanced) {
          enhancedDestinations.push(enhanced)
        }
      }
    }

    // If we don't have enough real data, supplement with enhanced mock destinations
    if (enhancedDestinations.length < 10) {
      const mockDestinations = getEnhancedMockDestinations(budget, currency)
      const needed = 10 - enhancedDestinations.length
      enhancedDestinations.push(...mockDestinations.slice(0, needed))
    }

    // Sort by popularity score
    enhancedDestinations.sort((a, b) => b.popularity_score - a.popularity_score)

    return NextResponse.json({
      success: true,
      items: enhancedDestinations.slice(0, 10),
      metadata: {
        total: enhancedDestinations.length,
        budget: budget,
        currency: currency,
        pax: pax,
        data_source: amadeusDestinations.length > 0 ? 'amadeus_enhanced' : 'mock_enhanced'
      }
    })
  } catch (error) {
    console.error('Top 10 destinations API error:', error)
    
    // Fallback to enhanced mock data
    const budget = parseFloat(request.nextUrl.searchParams.get('budget') || '5000')
    const currency = request.nextUrl.searchParams.get('currency') || 'MYR'
    
    return NextResponse.json({
      success: true,
      items: getEnhancedMockDestinations(budget, currency),
      metadata: {
        total: 10,
        budget: budget,
        currency: currency,
        data_source: 'fallback_mock'
      }
    })
  }
}

async function enhanceDestinationWithRealData(
  dest: AmadeusDestination, 
  budget: number, 
  currency: string
): Promise<Top10Destination | null> {
  try {
    // Get weather data from OpenWeather API
    let weather = {
      month: new Date().toISOString().substr(0, 7),
      comfort_index: 0.75,
      avg_high_c: 28,
      rain_prob: 0.3
    }

    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${dest.name}&appid=${API_CONFIG.OPENWEATHER.API_KEY}&units=metric`
      )
      
      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json()
        weather = {
          month: new Date().toISOString().substr(0, 7),
          comfort_index: Math.min(0.95, Math.max(0.1, (weatherData.main.temp - 15) / 20)),
          avg_high_c: Math.round(weatherData.main.temp),
          rain_prob: weatherData.clouds ? weatherData.clouds.all / 100 : 0.2
        }
      }
    } catch (weatherError) {
      console.log('Weather API error for', dest.name, weatherError)
    }

    // Calculate realistic pricing based on destination and budget
    const basePrice = calculateBasePrice(dest, budget)
    const popularityScore = dest.analytics?.travelers?.score || (70 + Math.random() * 25)

    return {
      destination_code: dest.iataCode,
      name: dest.name,
      from_price: {
        amount: basePrice,
        currency: currency
      },
      popularity_score: Math.round(popularityScore * 10) / 10,
      signals: {
        intent_7d_vs_28d: 1 + Math.random() * 0.8,
        events_count: Math.floor(Math.random() * 15) + 3,
        halal_index: getHalalIndex(dest.address?.countryCode || 'XX')
      },
      weather,
      events: generateEvents(dest.name),
      badges: generateBadges(dest, budget),
      sample_package: {
        nights: Math.floor(budget / 1000) + 2,
        tier: budget > 8000 ? 'LUXURY' : budget > 4000 ? 'COMFORT' : 'BUDGET',
        hotel: `${dest.name} Hotel`,
        activities: generateActivities(dest.name),
        est_total: {
          amount: Math.round(budget * (0.6 + Math.random() * 0.3)),
          currency: currency
        }
      },
      deep_links: {
        flight: `https://www.amadeus.com/flight/${dest.iataCode.toLowerCase()}`,
        hotel: `https://www.booking.com/city/${dest.name.toLowerCase().replace(/\s+/g, '-')}`,
        activities: [
          `https://www.viator.com/${dest.name.toLowerCase().replace(/\s+/g, '-')}`,
          `https://www.getyourguide.com/${dest.name.toLowerCase().replace(/\s+/g, '-')}`
        ]
      }
    }
  } catch (error) {
    console.error('Error enhancing destination:', dest.name, error)
    return null
  }
}

function calculateBasePrice(dest: AmadeusDestination, budget: number): number {
  const countryPriceMultipliers: { [key: string]: number } = {
    'JP': 0.25, // Japan - higher cost
    'SG': 0.22, // Singapore - high cost
    'AU': 0.28, // Australia - very high cost
    'TH': 0.15, // Thailand - lower cost
    'ID': 0.12, // Indonesia - lower cost
    'VN': 0.13, // Vietnam - lower cost
    'MY': 0.10, // Malaysia - lowest cost
    'PH': 0.14, // Philippines - lower cost
  }

  const multiplier = countryPriceMultipliers[dest.address?.countryCode || 'TH'] || 0.18
  return Math.round(budget * multiplier)
}

function getHalalIndex(countryCode: string): number {
  const halalFriendly: { [key: string]: number } = {
    'MY': 0.98, // Malaysia
    'ID': 0.95, // Indonesia
    'SG': 0.92, // Singapore
    'TH': 0.85, // Thailand
    'JP': 0.65, // Japan
    'VN': 0.70, // Vietnam
    'PH': 0.75, // Philippines
  }
  return halalFriendly[countryCode] || 0.6
}

function generateEvents(cityName: string): Array<{name: string, date: string}> {
  const events = [
    { name: `${cityName} Food Festival`, date: getRandomFutureDate() },
    { name: 'Cultural Night Market', date: getRandomFutureDate() },
    { name: 'Traditional Arts Exhibition', date: getRandomFutureDate() },
  ]
  return events.slice(0, Math.floor(Math.random() * 3) + 1)
}

function generateBadges(dest: AmadeusDestination, budget: number): string[] {
  const badges = []
  
  if (getHalalIndex(dest.address?.countryCode || 'XX') > 0.8) {
    badges.push('Halal-friendly')
  }
  
  if (budget < 3000) {
    badges.push('Budget')
  } else if (budget > 8000) {
    badges.push('Luxury')
  }
  
  badges.push('Culture')
  
  if (['SG', 'JP', 'AU'].includes(dest.address?.countryCode || '')) {
    badges.push('Family-friendly')
  }
  
  return badges
}

function generateActivities(cityName: string): string[] {
  const activities = [
    `${cityName} City Tour`,
    'Local Food Experience',
    'Cultural Sites Visit',
    'Shopping Districts',
    'Scenic Viewpoints'
  ]
  return activities.slice(0, 3)
}

function getRandomFutureDate(): string {
  const today = new Date()
  const futureDate = new Date(today.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000)
  return futureDate.toISOString().split('T')[0]
}

function getEnhancedMockDestinations(budget: number, currency: string): Top10Destination[] {
  return [
    {
      destination_code: "TYO",
      name: "Tokyo, Japan",
      from_price: { amount: Math.round(budget * 0.25), currency },
      popularity_score: 94.2,
      signals: {
        intent_7d_vs_28d: 1.45,
        events_count: 18,
        halal_index: 0.65
      },
      weather: {
        month: new Date().toISOString().substr(0, 7),
        comfort_index: 0.78,
        avg_high_c: 15,
        rain_prob: 0.25
      },
      events: [
        { name: "Tokyo Illumination Festival", date: getRandomFutureDate() },
        { name: "Cherry Blossom Festival", date: getRandomFutureDate() }
      ],
      badges: ["Culture", "Technology", "Family-friendly"],
      sample_package: {
        nights: 6,
        tier: budget > 8000 ? "LUXURY" : "COMFORT",
        hotel: "Shibuya Sky Hotel",
        activities: ["Tokyo Skytree", "Senso-ji Temple", "Harajuku District"],
        est_total: { amount: Math.round(budget * 0.75), currency }
      },
      deep_links: {
        flight: "https://www.amadeus.com/flight/tyo",
        hotel: "https://www.booking.com/city/tokyo",
        activities: ["https://www.viator.com/tokyo", "https://www.getyourguide.com/tokyo"]
      }
    },
    {
      destination_code: "BKK",
      name: "Bangkok, Thailand", 
      from_price: { amount: Math.round(budget * 0.15), currency },
      popularity_score: 96.8,
      signals: {
        intent_7d_vs_28d: 1.72,
        events_count: 12,
        halal_index: 0.85
      },
      weather: {
        month: new Date().toISOString().substr(0, 7),
        comfort_index: 0.82,
        avg_high_c: 32,
        rain_prob: 0.35
      },
      events: [
        { name: "Songkran Festival", date: getRandomFutureDate() },
        { name: "Floating Market Festival", date: getRandomFutureDate() }
      ],
      badges: ["Halal-friendly", "Budget", "Street Food"],
      sample_package: {
        nights: 5,
        tier: "COMFORT",
        hotel: "Riverside Bangkok Hotel",
        activities: ["Grand Palace", "Wat Pho Temple", "Chatuchak Market"],
        est_total: { amount: Math.round(budget * 0.55), currency }
      },
      deep_links: {
        flight: "https://www.amadeus.com/flight/bkk",
        hotel: "https://www.booking.com/city/bangkok",
        activities: ["https://www.viator.com/bangkok", "https://www.getyourguide.com/bangkok"]
      }
    },
    {
      destination_code: "SIN",
      name: "Singapore",
      from_price: { amount: Math.round(budget * 0.22), currency },
      popularity_score: 92.5,
      signals: {
        intent_7d_vs_28d: 1.38,
        events_count: 15,
        halal_index: 0.92
      },
      weather: {
        month: new Date().toISOString().substr(0, 7),
        comfort_index: 0.85,
        avg_high_c: 31,
        rain_prob: 0.45
      },
      events: [
        { name: "Gardens by the Bay Light Show", date: getRandomFutureDate() },
        { name: "Singapore Food Festival", date: getRandomFutureDate() }
      ],
      badges: ["Halal-certified", "Family-friendly", "Safe", "Modern"],
      sample_package: {
        nights: 4,
        tier: "LUXURY",
        hotel: "Marina Bay Sands",
        activities: ["Gardens by the Bay", "Sentosa Island", "Clarke Quay"],
        est_total: { amount: Math.round(budget * 0.68), currency }
      },
      deep_links: {
        flight: "https://www.amadeus.com/flight/sin",
        hotel: "https://www.booking.com/city/singapore",
        activities: ["https://www.viator.com/singapore", "https://www.getyourguide.com/singapore"]
      }
    }
  ]
}