import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '../../../../lib/api-config'

interface DestinationDetails {
  destination_code: string
  name: string
  country: string
  region: string
  coordinates: {
    latitude: number
    longitude: number
  }
  timezone: string
  overview: {
    description: string
    best_time_to_visit: string
    avg_days_recommended: number
    difficulty_level: 'Easy' | 'Moderate' | 'Challenging'
  }
  weather: {
    current: {
      temperature: number
      condition: string
      humidity: number
      wind_speed: number
    }
    forecast: Array<{
      date: string
      high: number
      low: number
      condition: string
      rain_chance: number
    }>
    climate_info: {
      dry_season: string
      rainy_season: string
      peak_season: string
      off_season: string
    }
  }
  attractions: Array<{
    name: string
    type: 'Cultural' | 'Natural' | 'Entertainment' | 'Religious' | 'Historical'
    rating: number
    description: string
    estimated_visit_duration: string
    entrance_fee?: {
      amount: number
      currency: string
    }
    opening_hours: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }>
  accommodation: {
    budget_range: {
      min: number
      max: number
      currency: string
      per: 'night' | 'person'
    }
    recommendations: Array<{
      name: string
      type: 'Hotel' | 'Resort' | 'Hostel' | 'Guesthouse' | 'Apartment'
      rating: number
      price_range: string
      amenities: string[]
      location: string
    }>
  }
  transportation: {
    from_airport: {
      taxi: { duration: string; cost: number; currency: string }
      public_transport: { duration: string; cost: number; currency: string }
      ride_share: { duration: string; cost: number; currency: string }
    }
    local_transport: Array<{
      type: 'Metro' | 'Bus' | 'Taxi' | 'Tuk-tuk' | 'Grab' | 'Walking'
      description: string
      cost_range: string
      convenience_rating: number
    }>
  }
  food_and_dining: {
    cuisine_highlights: string[]
    must_try_dishes: string[]
    dining_options: Array<{
      type: 'Street Food' | 'Local Restaurant' | 'Fine Dining' | 'Food Court' | 'Market'
      description: string
      price_range: string
      halal_availability: 'Widely Available' | 'Limited' | 'Rare'
    }>
    budget_estimate: {
      street_food: { min: number; max: number; currency: string; per: 'meal' }
      mid_range: { min: number; max: number; currency: string; per: 'meal' }
      fine_dining: { min: number; max: number; currency: string; per: 'meal' }
    }
  }
  travel_requirements: {
    visa: {
      required: boolean
      type?: string
      duration?: string
      cost?: number
      currency?: string
    }
    vaccination: {
      required: boolean
      recommended_vaccines?: string[]
    }
    passport_validity: {
      months_required: number
    }
    currency: {
      code: string
      name: string
      exchange_rate_usd: number
      cash_recommended: boolean
      cards_accepted: boolean
    }
  }
  safety_and_health: {
    safety_rating: number
    common_precautions: string[]
    emergency_numbers: {
      police: string
      ambulance: string
      fire: string
      tourist_hotline?: string
    }
    health_considerations: string[]
  }
  cultural_info: {
    language: string[]
    religion_majority: string
    cultural_norms: string[]
    tipping_culture: string
    bargaining_culture: string
    dress_code: string[]
  }
  shopping: {
    popular_items: string[]
    shopping_areas: Array<{
      name: string
      type: 'Mall' | 'Market' | 'Street' | 'District'
      speciality: string
      price_level: 'Budget' | 'Mid-range' | 'Luxury'
    }>
  }
  estimated_costs: {
    daily_budget: {
      budget: { min: number; max: number; currency: string }
      mid_range: { min: number; max: number; currency: string }
      luxury: { min: number; max: number; currency: string }
    }
    breakdown: {
      accommodation: number
      food: number
      transportation: number
      attractions: number
      shopping: number
    }
  }
  best_for: string[]
  tags: string[]
}

// GET /api/destinations/[code] - Get detailed destination information
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const destinationCode = params.code.toUpperCase()
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get('currency') || 'MYR'

    console.log(`Fetching destination details for: ${destinationCode}`)

    // Get basic destination info from Amadeus if available
    let basicInfo = null
    try {
      const token = await getAmadeusToken()
      if (token) {
        basicInfo = await getAmadeusDestinationInfo(token, destinationCode)
      }
    } catch (error) {
      console.log('Amadeus API not available, using comprehensive mock data:', error)
    }

    // Get weather data
    const weatherData = await getWeatherData(basicInfo?.name || getDestinationName(destinationCode))

    // Build comprehensive destination details
    const destinationDetails = buildDestinationDetails(destinationCode, basicInfo, weatherData, currency)

    return NextResponse.json({
      success: true,
      data: destinationDetails,
      data_source: basicInfo ? 'amadeus_enhanced' : 'comprehensive_mock'
    })

  } catch (error) {
    console.error('Destination details API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch destination details',
      data: getBasicDestinationDetails(params.code.toUpperCase(), 'MYR')
    }, { status: 500 })
  }
}

async function getAmadeusToken(): Promise<string | null> {
  try {
    const response = await fetch(`https://test.api.amadeus.com/v1/security/oauth2/token`, {
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

    if (!response.ok) {
      throw new Error('Failed to get Amadeus token')
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Amadeus token error:', error)
    return null
  }
}

async function getAmadeusDestinationInfo(token: string, code: string): Promise<any> {
  try {
    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/${code}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.log('Error fetching Amadeus destination info:', error)
    return null
  }
}

async function getWeatherData(cityName: string): Promise<any> {
  try {
    // Current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_CONFIG.OPENWEATHER.API_KEY}&units=metric`
    )

    // 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=${API_CONFIG.OPENWEATHER.API_KEY}&units=metric`
    )

    const current = currentResponse.ok ? await currentResponse.json() : null
    const forecast = forecastResponse.ok ? await forecastResponse.json() : null

    return { current, forecast }
  } catch (error) {
    console.log('Weather API error:', error)
    return null
  }
}

function buildDestinationDetails(code: string, basicInfo: any, weatherData: any, currency: string): DestinationDetails {
  const destinationData = getDestinationData(code)
  
  // Build weather info
  const weather = {
    current: weatherData?.current ? {
      temperature: Math.round(weatherData.current.main.temp),
      condition: weatherData.current.weather[0].main,
      humidity: weatherData.current.main.humidity,
      wind_speed: weatherData.current.wind?.speed || 0
    } : {
      temperature: 28,
      condition: 'Clear',
      humidity: 65,
      wind_speed: 5
    },
    forecast: weatherData?.forecast ? weatherData.forecast.list.slice(0, 5).map((item: any) => ({
      date: item.dt_txt.split(' ')[0],
      high: Math.round(item.main.temp_max),
      low: Math.round(item.main.temp_min),
      condition: item.weather[0].main,
      rain_chance: item.pop * 100
    })) : [],
    climate_info: destinationData.climate
  }

  return {
    destination_code: code,
    name: basicInfo?.name || destinationData.name,
    country: basicInfo?.address?.countryName || destinationData.country,
    region: destinationData.region,
    coordinates: basicInfo?.geoCode || destinationData.coordinates,
    timezone: destinationData.timezone,
    overview: destinationData.overview,
    weather,
    attractions: destinationData.attractions,
    accommodation: destinationData.accommodation,
    transportation: destinationData.transportation,
    food_and_dining: destinationData.food,
    travel_requirements: destinationData.requirements,
    safety_and_health: destinationData.safety,
    cultural_info: destinationData.culture,
    shopping: destinationData.shopping,
    estimated_costs: convertCurrency(destinationData.costs, currency),
    best_for: destinationData.bestFor,
    tags: destinationData.tags
  }
}

function getDestinationData(code: string): any {
  const destinations: { [key: string]: any } = {
    'BKK': {
      name: 'Bangkok, Thailand',
      country: 'Thailand',
      region: 'Southeast Asia',
      coordinates: { latitude: 13.7563, longitude: 100.5018 },
      timezone: 'Asia/Bangkok',
      climate: {
        dry_season: 'November to February',
        rainy_season: 'May to October',
        peak_season: 'December to February',
        off_season: 'March to May'
      },
      overview: {
        description: 'Bangkok is a vibrant metropolis known for its ornate temples, bustling street life, incredible street food, and warm hospitality.',
        best_time_to_visit: 'November to February (cool season)',
        avg_days_recommended: 4,
        difficulty_level: 'Easy' as const
      },
      attractions: [
        {
          name: 'Grand Palace',
          type: 'Historical' as const,
          rating: 4.5,
          description: 'Former royal residence and Thailand\'s most sacred temple complex',
          estimated_visit_duration: '2-3 hours',
          entrance_fee: { amount: 500, currency: 'THB' },
          opening_hours: '8:30 AM - 3:30 PM'
        },
        {
          name: 'Wat Arun',
          type: 'Religious' as const,
          rating: 4.3,
          description: 'Iconic riverside temple known for its towering spires',
          estimated_visit_duration: '1-2 hours',
          entrance_fee: { amount: 100, currency: 'THB' },
          opening_hours: '8:30 AM - 5:30 PM'
        },
        {
          name: 'Chatuchak Weekend Market',
          type: 'Cultural' as const,
          rating: 4.2,
          description: 'One of the world\'s largest weekend markets',
          estimated_visit_duration: '3-4 hours',
          opening_hours: 'Weekends 9 AM - 6 PM'
        }
      ],
      accommodation: {
        budget_range: { min: 20, max: 300, currency: 'USD', per: 'night' as const },
        recommendations: [
          {
            name: 'Khao San Road Area',
            type: 'Hostel' as const,
            rating: 4.0,
            price_range: '$10-30',
            amenities: ['WiFi', 'AC', 'Shared Kitchen'],
            location: 'Backpacker District'
          },
          {
            name: 'Siam Area',
            type: 'Hotel' as const,
            rating: 4.5,
            price_range: '$80-150',
            amenities: ['Pool', 'Gym', 'Restaurant', 'WiFi'],
            location: 'Shopping District'
          }
        ]
      },
      transportation: {
        from_airport: {
          taxi: { duration: '45-60 minutes', cost: 400, currency: 'THB' },
          public_transport: { duration: '60-90 minutes', cost: 45, currency: 'THB' },
          ride_share: { duration: '45-60 minutes', cost: 350, currency: 'THB' }
        },
        local_transport: [
          {
            type: 'Metro' as const,
            description: 'BTS Skytrain and MRT subway system',
            cost_range: '15-60 THB per ride',
            convenience_rating: 5
          },
          {
            type: 'Tuk-tuk' as const,
            description: 'Iconic three-wheeled vehicles for short distances',
            cost_range: '100-300 THB per ride',
            convenience_rating: 3
          }
        ]
      },
      food: {
        cuisine_highlights: ['Pad Thai', 'Tom Yum Goong', 'Green Curry', 'Mango Sticky Rice'],
        must_try_dishes: ['Som Tam', 'Massaman Curry', 'Thai Fried Rice'],
        dining_options: [
          {
            type: 'Street Food' as const,
            description: 'Authentic local flavors at incredible prices',
            price_range: '30-100 THB per meal',
            halal_availability: 'Widely Available' as const
          },
          {
            type: 'Local Restaurant' as const,
            description: 'Traditional Thai restaurants',
            price_range: '150-400 THB per meal',
            halal_availability: 'Widely Available' as const
          }
        ],
        budget_estimate: {
          street_food: { min: 2, max: 5, currency: 'USD', per: 'meal' as const },
          mid_range: { min: 8, max: 15, currency: 'USD', per: 'meal' as const },
          fine_dining: { min: 25, max: 60, currency: 'USD', per: 'meal' as const }
        }
      },
      requirements: {
        visa: { required: false },
        vaccination: { required: false },
        passport_validity: { months_required: 6 },
        currency: {
          code: 'THB',
          name: 'Thai Baht',
          exchange_rate_usd: 35.5,
          cash_recommended: true,
          cards_accepted: true
        }
      },
      safety: {
        safety_rating: 4,
        common_precautions: ['Watch for pickpockets', 'Negotiate taxi fares', 'Stay hydrated'],
        emergency_numbers: {
          police: '191',
          ambulance: '1669',
          fire: '199',
          tourist_hotline: '1672'
        },
        health_considerations: ['Drink bottled water', 'Use mosquito repellent']
      },
      culture: {
        language: ['Thai', 'English (tourist areas)'],
        religion_majority: 'Buddhism',
        cultural_norms: ['Remove shoes in temples', 'Dress modestly', 'Respect Buddha images'],
        tipping_culture: 'Not expected but appreciated (10-20 THB)',
        bargaining_culture: 'Common in markets, not in malls',
        dress_code: ['Modest clothing in temples', 'Cover shoulders and knees']
      },
      shopping: {
        popular_items: ['Thai Silk', 'Handicrafts', 'Electronics', 'Thai Spices'],
        shopping_areas: [
          {
            name: 'Chatuchak Market',
            type: 'Market' as const,
            speciality: 'Local goods and handicrafts',
            price_level: 'Budget' as const
          },
          {
            name: 'Siam Paragon',
            type: 'Mall' as const,
            speciality: 'Luxury brands and electronics',
            price_level: 'Luxury' as const
          }
        ]
      },
      costs: {
        daily_budget: {
          budget: { min: 25, max: 40, currency: 'USD' },
          mid_range: { min: 60, max: 100, currency: 'USD' },
          luxury: { min: 150, max: 300, currency: 'USD' }
        },
        breakdown: {
          accommodation: 40,
          food: 25,
          transportation: 15,
          attractions: 15,
          shopping: 5
        }
      },
      bestFor: ['First-time visitors to Asia', 'Food lovers', 'Culture enthusiasts', 'Budget travelers'],
      tags: ['Halal-friendly', 'Budget-friendly', 'Cultural', 'Street Food', 'Temples']
    },
    // Add more destinations...
    'TYO': {
      name: 'Tokyo, Japan',
      country: 'Japan',
      region: 'East Asia',
      coordinates: { latitude: 35.6762, longitude: 139.6503 },
      timezone: 'Asia/Tokyo',
      climate: {
        dry_season: 'November to February',
        rainy_season: 'June to July',
        peak_season: 'March to May, October to November',
        off_season: 'June to September'
      },
      overview: {
        description: 'Tokyo seamlessly blends ultramodern and traditional, from neon-lit skyscrapers to historic temples.',
        best_time_to_visit: 'March to May, September to November',
        avg_days_recommended: 6,
        difficulty_level: 'Moderate' as const
      },
      // ... similar structure for Tokyo
      costs: {
        daily_budget: {
          budget: { min: 60, max: 80, currency: 'USD' },
          mid_range: { min: 120, max: 200, currency: 'USD' },
          luxury: { min: 300, max: 500, currency: 'USD' }
        },
        breakdown: {
          accommodation: 45,
          food: 30,
          transportation: 15,
          attractions: 8,
          shopping: 2
        }
      },
      bestFor: ['Technology enthusiasts', 'Culture lovers', 'Food connoisseurs', 'Shopping fans'],
      tags: ['Modern', 'Cultural', 'Technology', 'Family-friendly', 'Safe']
    }
  }

  return destinations[code] || getDefaultDestinationData(code)
}

function getDefaultDestinationData(code: string): any {
  return {
    name: getDestinationName(code),
    country: 'Unknown',
    region: 'Unknown',
    coordinates: { latitude: 0, longitude: 0 },
    timezone: 'UTC',
    climate: {
      dry_season: 'Unknown',
      rainy_season: 'Unknown',
      peak_season: 'Year round',
      off_season: 'None'
    },
    overview: {
      description: 'A wonderful destination with unique attractions and culture.',
      best_time_to_visit: 'Year round',
      avg_days_recommended: 3,
      difficulty_level: 'Easy' as const
    },
    attractions: [],
    accommodation: {
      budget_range: { min: 50, max: 200, currency: 'USD', per: 'night' as const },
      recommendations: []
    },
    transportation: {
      from_airport: {
        taxi: { duration: '30-45 minutes', cost: 50, currency: 'USD' },
        public_transport: { duration: '45-60 minutes', cost: 5, currency: 'USD' },
        ride_share: { duration: '30-45 minutes', cost: 40, currency: 'USD' }
      },
      local_transport: []
    },
    food: {
      cuisine_highlights: ['Local specialties'],
      must_try_dishes: ['Regional favorites'],
      dining_options: [],
      budget_estimate: {
        street_food: { min: 3, max: 8, currency: 'USD', per: 'meal' as const },
        mid_range: { min: 15, max: 30, currency: 'USD', per: 'meal' as const },
        fine_dining: { min: 50, max: 100, currency: 'USD', per: 'meal' as const }
      }
    },
    requirements: {
      visa: { required: true },
      vaccination: { required: false },
      passport_validity: { months_required: 6 },
      currency: {
        code: 'USD',
        name: 'US Dollar',
        exchange_rate_usd: 1.0,
        cash_recommended: false,
        cards_accepted: true
      }
    },
    safety: {
      safety_rating: 3,
      common_precautions: ['General safety measures'],
      emergency_numbers: {
        police: '911',
        ambulance: '911',
        fire: '911'
      },
      health_considerations: ['Stay hydrated', 'Use sunscreen']
    },
    culture: {
      language: ['English'],
      religion_majority: 'Various',
      cultural_norms: ['Respect local customs'],
      tipping_culture: 'Standard 15-20%',
      bargaining_culture: 'Not common',
      dress_code: ['Dress appropriately for venues']
    },
    shopping: {
      popular_items: ['Local crafts', 'Souvenirs'],
      shopping_areas: []
    },
    costs: {
      daily_budget: {
        budget: { min: 50, max: 80, currency: 'USD' },
        mid_range: { min: 100, max: 150, currency: 'USD' },
        luxury: { min: 200, max: 400, currency: 'USD' }
      },
      breakdown: {
        accommodation: 40,
        food: 30,
        transportation: 15,
        attractions: 10,
        shopping: 5
      }
    },
    bestFor: ['Travelers', 'Culture enthusiasts'],
    tags: ['Cultural', 'Scenic']
  }
}

function getDestinationName(code: string): string {
  const names: { [key: string]: string } = {
    'BKK': 'Bangkok, Thailand',
    'TYO': 'Tokyo, Japan',
    'SIN': 'Singapore',
    'HKG': 'Hong Kong',
    'KUL': 'Kuala Lumpur, Malaysia',
    'CGK': 'Jakarta, Indonesia',
    'MNL': 'Manila, Philippines',
    'HAN': 'Hanoi, Vietnam',
    'SGN': 'Ho Chi Minh City, Vietnam'
  }
  return names[code] || `${code} Destination`
}

function convertCurrency(costs: any, targetCurrency: string): any {
  // Simple currency conversion (in production, use real exchange rates)
  const exchangeRates: { [key: string]: number } = {
    'MYR': 4.7,
    'USD': 1.0,
    'THB': 35.5,
    'JPY': 150,
    'SGD': 1.35
  }

  const rate = exchangeRates[targetCurrency] || 1.0
  
  return {
    daily_budget: {
      budget: {
        min: Math.round(costs.daily_budget.budget.min * rate),
        max: Math.round(costs.daily_budget.budget.max * rate),
        currency: targetCurrency
      },
      mid_range: {
        min: Math.round(costs.daily_budget.mid_range.min * rate),
        max: Math.round(costs.daily_budget.mid_range.max * rate),
        currency: targetCurrency
      },
      luxury: {
        min: Math.round(costs.daily_budget.luxury.min * rate),
        max: Math.round(costs.daily_budget.luxury.max * rate),
        currency: targetCurrency
      }
    },
    breakdown: costs.breakdown
  }
}

function getBasicDestinationDetails(code: string, currency: string): DestinationDetails {
  const basic = getDefaultDestinationData(code)
  return buildDestinationDetails(code, null, null, currency)
}