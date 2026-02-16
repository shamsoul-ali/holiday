import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '../../../../lib/api-config'

interface AmadeusToken {
  access_token: string
  token_type: string
  expires_in: number
}

interface AmadeusDestination {
  type: string
  subType: string
  name: string
  iataCode: string
  address: {
    cityName?: string
    countryName?: string
    countryCode: string
    stateCode?: string
    regionCode?: string
  }
  geoCode: {
    latitude: number
    longitude: number
  }
  timeZoneOffset?: string
  analytics?: {
    travelers?: {
      score: number
    }
  }
}

interface AmadeusFlightOffer {
  type: string
  id: string
  oneWay: boolean
  lastTicketingDate: string
  numberOfBookableSeats: number
  itineraries: Array<{
    duration: string
    segments: Array<{
      departure: {
        iataCode: string
        terminal?: string
        at: string
      }
      arrival: {
        iataCode: string
        terminal?: string
        at: string
      }
      carrierCode: string
      number: string
      aircraft: {
        code: string
      }
      duration: string
    }>
  }>
  price: {
    currency: string
    total: string
    base: string
    fees: Array<{
      amount: string
      type: string
    }>
  }
  validatingAirlineCodes: string[]
}

interface DestinationSearchResult {
  destination_code: string
  name: string
  country: string
  region: string
  coordinates: {
    latitude: number
    longitude: number
  }
  popularity_score: number
  from_price: {
    amount: number
    currency: string
    flight_duration?: string
  }
  best_flight_offer?: {
    airline: string
    flight_number: string
    departure: string
    arrival: string
    duration: string
    price: number
  }
  weather_info?: {
    current_temp: number
    condition: string
    humidity: number
  }
  travel_requirements: {
    visa_required: boolean
    vaccination_required: boolean
    passport_validity_months: number
  }
  highlights: string[]
  tags: string[]
}

// Enhanced caching system with error recovery
const destinationCache = new Map<string, { data: any; timestamp: number; errorCount: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes for destinations
const ERROR_RETRY_DELAY = 5 * 60 * 1000 // 5 minutes before retry after error  
const MAX_ERROR_COUNT = 3 // Max errors before longer cache

// GET /api/destinations/search - Search destinations with real-time data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const origin = searchParams.get('origin') || 'KUL' // Default to Kuala Lumpur
    const budget = parseFloat(searchParams.get('budget') || '5000')
    const currency = searchParams.get('currency') || 'MYR'
    const departureDate = searchParams.get('departure_date') || getDefaultDepartureDate()
    const returnDate = searchParams.get('return_date')
    const limit = parseInt(searchParams.get('limit') || '10')
    const quickSearch = searchParams.get('quick') === 'true' // Flag for autocomplete quick searches

    console.log(`Searching destinations: query="${query}", origin=${origin}, budget=${budget}, quick=${quickSearch}`)
    
    // Create cache key for this search
    const cacheKey = `${query}-${origin}-${budget}-${currency}-${quickSearch ? 'quick' : 'full'}`
    
    // Check cache first with error recovery logic
    const cached = destinationCache.get(cacheKey)
    if (cached) {
      const now = Date.now()
      const cacheAge = now - cached.timestamp
      const shouldUseCache = cached.errorCount < MAX_ERROR_COUNT ? 
        cacheAge < CACHE_DURATION : 
        cacheAge < ERROR_RETRY_DELAY
      
      if (shouldUseCache) {
        console.log(`Using cached destinations for ${query} (age: ${Math.round(cacheAge/1000/60)}min, errors: ${cached.errorCount})`)
        return NextResponse.json({
          success: true,
          query: query,
          origin: origin,
          results: cached.data,
          total: cached.data.length,
          data_source: 'cached',
          cache_age_minutes: Math.round(cacheAge / 60000)
        })
      }
    }

    // Get Amadeus access token
    const token = await getAmadeusToken()
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Unable to connect to travel data provider',
        fallback: getBasicDestinations(budget, currency)
      }, { status: 503 })
    }

    let destinations: DestinationSearchResult[] = []

    // Search for destinations with enhanced Google Places integration
    if (query) {
      // For quick searches (autocomplete), prioritize speed and use lighter data fetching
      if (quickSearch) {
        // Use cached data and simpler search for fast autocomplete responses
        destinations = await quickDestinationSearch(token, query, origin, budget, currency, limit)
      } else {
        // Full search with detailed data for comprehensive results
        const [amadeusResults, googleResults] = await Promise.allSettled([
          searchDestinationsByQuery(token, query, origin, budget, currency, departureDate, returnDate),
          searchDestinationsWithGoogle(query, origin, budget, currency, departureDate, returnDate)
        ])
        
        const amadeusData = amadeusResults.status === 'fulfilled' ? amadeusResults.value : []
        const googleData = googleResults.status === 'fulfilled' ? googleResults.value : []
        
        // Combine and deduplicate results
        destinations = combineAndRankDestinations(amadeusData, googleData)
      }
    } else {
      // Get popular destinations
      destinations = await getPopularDestinations(token, origin, budget, currency, departureDate, returnDate)
    }

    // Enhance destinations with additional data
    const enhancedDestinations = await Promise.all(
      destinations.map(async (dest) => {
        const enhanced = await enhanceDestinationData(dest, token)
        return enhanced
      })
    )

    // Cache successful results with error count reset
    const finalResults = enhancedDestinations.slice(0, limit)
    destinationCache.set(cacheKey, {
      data: finalResults,
      timestamp: Date.now(),
      errorCount: 0 // Reset error count on successful fetch
    })
    
    console.log(`Successfully cached ${finalResults.length} destinations for ${query}`)

    return NextResponse.json({
      success: true,
      query: query,
      origin: origin,
      results: finalResults,
      total: enhancedDestinations.length,
      data_source: 'amadeus_live'
    })

  } catch (error) {
    console.error('Destination search API error:', error)
    
    const budget = parseFloat(request.nextUrl.searchParams.get('budget') || '5000')
    const currency = request.nextUrl.searchParams.get('currency') || 'MYR'
    const query = request.nextUrl.searchParams.get('q') || ''
    const origin = request.nextUrl.searchParams.get('origin') || 'KUL'
    const quickSearch = request.nextUrl.searchParams.get('quick') === 'true'
    
    // Try to increment error count and use stale cache if available
    const cacheKey = `${query}-${origin}-${budget}-${currency}-${quickSearch ? 'quick' : 'full'}`
    const cached = destinationCache.get(cacheKey)
    
    if (cached) {
      // Increment error count but still return cached data
      destinationCache.set(cacheKey, {
        data: cached.data,
        timestamp: cached.timestamp,
        errorCount: (cached.errorCount || 0) + 1
      })
      
      console.log(`API error, using stale cache for ${query} (errors: ${cached.errorCount + 1})`)
      
      return NextResponse.json({
        success: true,
        query: query,
        origin: origin,
        results: cached.data,
        total: cached.data.length,
        data_source: 'stale_cache',
        warning: 'Data may be outdated due to API issues',
        error_count: cached.errorCount + 1
      })
    }
    
    // If no cache available, use emergency fallback destinations
    const fallbackDestinations = await searchEmergencyFallbackDestinations('', budget, currency, 10)
    
    // Cache the fallback data to prevent repeated errors
    destinationCache.set(cacheKey, {
      data: fallbackDestinations,
      timestamp: Date.now(),
      errorCount: 1
    })
    
    console.log(`Using enhanced fallback destinations for ${query}`)
    
    return NextResponse.json({
      success: true,
      query: query,
      origin: origin,
      results: fallbackDestinations,
      total: fallbackDestinations.length,
      data_source: 'fallback',
      warning: 'Using fallback data due to API issues',
      error: 'Primary search service temporarily unavailable'
    }, { status: 200 }) // Return 200 instead of 500 since we have fallback data
  }
}

function getBasicDestinations(budget: number, currency: string): DestinationSearchResult[] {
  const basicDestinations = [
    { code: 'BKK', name: 'Bangkok, Thailand', country: 'Thailand', region: 'Southeast Asia', lat: 13.7563, lon: 100.5018, basePrice: 800 },
    { code: 'SIN', name: 'Singapore', country: 'Singapore', region: 'Southeast Asia', lat: 1.3521, lon: 103.8198, basePrice: 1200 },
    { code: 'HKT', name: 'Phuket, Thailand', country: 'Thailand', region: 'Southeast Asia', lat: 7.8804, lon: 98.3923, basePrice: 900 },
    { code: 'DPS', name: 'Bali, Indonesia', country: 'Indonesia', region: 'Southeast Asia', lat: -8.3405, lon: 115.0920, basePrice: 1000 },
    { code: 'HAN', name: 'Hanoi, Vietnam', country: 'Vietnam', region: 'Southeast Asia', lat: 21.0285, lon: 105.8542, basePrice: 700 },
    { code: 'SGN', name: 'Ho Chi Minh City, Vietnam', country: 'Vietnam', region: 'Southeast Asia', lat: 10.8231, lon: 106.6297, basePrice: 750 },
    { code: 'MNL', name: 'Manila, Philippines', country: 'Philippines', region: 'Southeast Asia', lat: 14.5995, lon: 120.9842, basePrice: 600 },
    { code: 'CGK', name: 'Jakarta, Indonesia', country: 'Indonesia', region: 'Southeast Asia', lat: -6.2088, lon: 106.8456, basePrice: 850 }
  ]

  return basicDestinations
    .filter(dest => dest.basePrice <= budget)
    .map(dest => ({
      destination_code: dest.code,
      name: dest.name,
      country: dest.country,
      region: dest.region,
      coordinates: { latitude: dest.lat, longitude: dest.lon },
      popularity_score: 75 + Math.random() * 20,
      from_price: {
        amount: dest.basePrice,
        currency: currency,
        flight_duration: '2h 30m'
      }
    }))
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

    const data: AmadeusToken = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Amadeus token error:', error)
    return null
  }
}

async function searchDestinationsByQuery(
  token: string, 
  query: string, 
  origin: string, 
  budget: number, 
  currency: string,
  departureDate: string,
  returnDate?: string
): Promise<DestinationSearchResult[]> {
  try {
    // Search for locations matching the query
    const locationsResponse = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${encodeURIComponent(query)}&page[limit]=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!locationsResponse.ok) {
      throw new Error('Failed to search locations')
    }

    const locationsData = await locationsResponse.json()
    const destinations: AmadeusDestination[] = locationsData.data || []

    const results: DestinationSearchResult[] = []

    for (const dest of destinations.slice(0, 10)) {
      if (dest.iataCode && dest.name) {
        // Get flight prices for this destination
        const flightPrice = await getFlightPrice(token, origin, dest.iataCode, departureDate, returnDate)
        
        const result: DestinationSearchResult = {
          destination_code: dest.iataCode,
          name: dest.name,
          country: dest.address.countryName || dest.address.countryCode,
          region: dest.address.regionCode || dest.address.stateCode || '',
          coordinates: {
            latitude: dest.geoCode.latitude,
            longitude: dest.geoCode.longitude
          },
          popularity_score: dest.analytics?.travelers?.score || (70 + Math.random() * 25),
          from_price: {
            amount: flightPrice?.price || calculateEstimatedPrice(dest, budget),
            currency: currency,
            flight_duration: flightPrice?.duration
          },
          best_flight_offer: flightPrice ? {
            airline: flightPrice.airline,
            flight_number: flightPrice.flight_number,
            departure: flightPrice.departure,
            arrival: flightPrice.arrival,
            duration: flightPrice.duration,
            price: flightPrice.price
          } : undefined,
          travel_requirements: getTravelRequirements(dest.address.countryCode),
          highlights: getDestinationHighlights(dest.name, dest.address.countryCode),
          tags: getDestinationTags(dest.address.countryCode, budget)
        }

        results.push(result)
      }
    }

    return results
  } catch (error) {
    console.error('Error searching destinations by query:', error)
    return []
  }
}

async function getPopularDestinations(
  token: string,
  origin: string,
  budget: number,
  currency: string,
  departureDate: string,
  returnDate?: string
): Promise<DestinationSearchResult[]> {
  try {
    // Use Amadeus to discover popular destinations dynamically instead of hardcoded list
    const popularDestinations = await getPopularDestinationsFromAmadeus(token, origin, budget, currency, departureDate, returnDate, 15)

    return popularDestinations
  } catch (error) {
    console.error('Error getting popular destinations:', error)
    return await searchEmergencyFallbackDestinations('', budget, currency, 5)
  }
}

// Get popular destinations dynamically from Amadeus API instead of hardcoded list
async function getPopularDestinationsFromAmadeus(
  token: string,
  origin: string,
  budget: number,
  currency: string,
  departureDate: string,
  returnDate?: string,
  limit: number = 15
): Promise<DestinationSearchResult[]> {
  try {
    console.log(`Getting popular destinations from Amadeus for origin: ${origin}`)
    
    // Use Amadeus Travel Recommendations API to get popular destinations
    const recommendationsResponse = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/recommended-locations?cityCodes=${origin}&travelerCountryCode=MY`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    let destinations: DestinationSearchResult[] = []

    if (recommendationsResponse.ok) {
      const recommendationsData = await recommendationsResponse.json()
      console.log(`Amadeus recommendations API returned ${recommendationsData.data?.length || 0} destinations`)
      
      // Process recommended destinations
      if (recommendationsData.data && recommendationsData.data.length > 0) {
        for (const rec of recommendationsData.data.slice(0, limit)) {
          try {
            // Get detailed location info
            const locationResponse = await fetch(
              `https://test.api.amadeus.com/v1/reference-data/locations/${rec.iataCode}`,
              {
                headers: { 'Authorization': `Bearer ${token}` }
              }
            )
            
            if (locationResponse.ok) {
              const locationData = await locationResponse.json()
              const dest: AmadeusDestination = locationData.data
              
              // Get flight prices
              const flightPrice = await getFlightPrice(token, origin, rec.iataCode, departureDate, returnDate)
              
              const destination: DestinationSearchResult = {
                destination_code: rec.iataCode,
                name: rec.name || dest.name,
                country: dest.address.countryName || dest.address.countryCode,
                region: dest.address.regionCode || dest.address.stateCode || '',
                coordinates: {
                  latitude: dest.geoCode.latitude,
                  longitude: dest.geoCode.longitude
                },
                popularity_score: dest.analytics?.travelers?.score || (80 + Math.random() * 15),
                from_price: {
                  amount: flightPrice?.price || calculateEstimatedPrice(dest, budget),
                  currency: currency,
                  flight_duration: flightPrice?.duration
                },
                best_flight_offer: flightPrice ? {
                  airline: flightPrice.airline,
                  flight_number: flightPrice.flight_number,
                  departure: flightPrice.departure,
                  arrival: flightPrice.arrival,
                  duration: flightPrice.duration,
                  price: flightPrice.price
                } : undefined,
                travel_requirements: getTravelRequirements(dest.address.countryCode),
                highlights: getDestinationHighlights(dest.name, dest.address.countryCode),
                tags: getDestinationTags(dest.address.countryCode, budget)
              }
              
              destinations.push(destination)
            }
          } catch (error) {
            console.log(`Error processing recommendation ${rec.iataCode}:`, error)
          }
        }
      }
    }

    // If we don't have enough destinations from recommendations, search for popular cities globally
    if (destinations.length < 10) {
      console.log('Getting additional popular destinations via city search')
      
      const popularCityTerms = ['city', 'capital', 'tourist', 'beach', 'mountain']
      
      for (const term of popularCityTerms) {
        if (destinations.length >= limit) break
        
        try {
          const citySearchResponse = await fetch(
            `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=${term}&page[limit]=10`,
            {
              headers: { 'Authorization': `Bearer ${token}` },
              signal: AbortSignal.timeout(5000)
            }
          )
          
          if (citySearchResponse.ok) {
            const cityData = await citySearchResponse.json()
            
            for (const location of (cityData.data || []).slice(0, 3)) {
              if (destinations.length >= limit) break
              
              // Skip if we already have this destination
              if (destinations.some(d => d.destination_code === location.iataCode)) continue
              
              try {
                const flightPrice = await getFlightPrice(token, origin, location.iataCode, departureDate, returnDate)
                
                const destination: DestinationSearchResult = {
                  destination_code: location.iataCode,
                  name: location.name,
                  country: location.address.countryName || location.address.countryCode,
                  region: location.address.regionCode || '',
                  coordinates: {
                    latitude: location.geoCode.latitude,
                    longitude: location.geoCode.longitude
                  },
                  popularity_score: location.analytics?.travelers?.score || (70 + Math.random() * 20),
                  from_price: {
                    amount: flightPrice?.price || calculateEstimatedPrice(location, budget),
                    currency: currency,
                    flight_duration: flightPrice?.duration
                  },
                  best_flight_offer: flightPrice ? {
                    airline: flightPrice.airline,
                    flight_number: flightPrice.flight_number,
                    departure: flightPrice.departure,
                    arrival: flightPrice.arrival,
                    duration: flightPrice.duration,
                    price: flightPrice.price
                  } : undefined,
                  travel_requirements: getTravelRequirements(location.address.countryCode),
                  highlights: getDestinationHighlights(location.name, location.address.countryCode),
                  tags: getDestinationTags(location.address.countryCode, budget)
                }
                
                destinations.push(destination)
              } catch (error) {
                console.log(`Error processing city destination ${location.iataCode}:`, error)
              }
            }
          }
        } catch (error) {
          console.log(`Error searching cities for term "${term}":`, error)
        }
      }
    }
    
    console.log(`Successfully found ${destinations.length} popular destinations from Amadeus API`)
    return destinations.slice(0, limit)
    
  } catch (error) {
    console.error('Error getting popular destinations from Amadeus:', error)
    return []
  }
}

async function getFlightPrice(
  token: string, 
  origin: string, 
  destination: string, 
  departureDate: string,
  returnDate?: string
): Promise<{
  price: number
  duration: string
  airline: string
  flight_number: string
  departure: string
  arrival: string
} | null> {
  try {
    const searchParams = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departureDate,
      adults: '2',
      max: '3'
    })

    if (returnDate) {
      searchParams.append('returnDate', returnDate)
    }

    const response = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams}`,
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
    const offers: AmadeusFlightOffer[] = data.data || []

    if (offers.length > 0) {
      const bestOffer = offers[0]
      const firstSegment = bestOffer.itineraries[0].segments[0]
      
      return {
        price: parseFloat(bestOffer.price.total),
        duration: bestOffer.itineraries[0].duration,
        airline: firstSegment.carrierCode,
        flight_number: `${firstSegment.carrierCode}${firstSegment.number}`,
        departure: firstSegment.departure.at,
        arrival: firstSegment.arrival.at
      }
    }

    return null
  } catch (error) {
    console.log('Error getting flight price:', error)
    return null
  }
}

async function enhanceDestinationData(dest: DestinationSearchResult, token: string): Promise<DestinationSearchResult> {
  try {
    // Get weather data
    const weather = await getWeatherData(dest.name)
    if (weather) {
      dest.weather_info = weather
    }

    return dest
  } catch (error) {
    console.log('Error enhancing destination data:', error)
    return dest
  }
}

async function getWeatherData(cityName: string): Promise<{
  current_temp: number
  condition: string
  humidity: number
} | null> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_CONFIG.OPENWEATHER.API_KEY}&units=metric`
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      current_temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity
    }
  } catch (error) {
    console.log('Weather API error:', error)
    return null
  }
}

function calculateEstimatedPrice(dest: AmadeusDestination, budget: number): number {
  const countryPriceMultipliers: { [key: string]: number } = {
    'JP': 0.28, 'AU': 0.32, 'NZ': 0.30, 'KR': 0.25,
    'SG': 0.22, 'HK': 0.24, 'TW': 0.20,
    'TH': 0.15, 'VN': 0.13, 'PH': 0.14, 'ID': 0.12,
    'MY': 0.10, 'IN': 0.18, 'CN': 0.22,
    'AE': 0.26, 'QA': 0.28
  }

  const multiplier = countryPriceMultipliers[dest.address.countryCode] || 0.20
  return Math.round(budget * multiplier * 0.8) // Flight portion of budget
}

function getTravelRequirements(countryCode: string): {
  visa_required: boolean
  vaccination_required: boolean
  passport_validity_months: number
} {
  const requirements: { [key: string]: any } = {
    'TH': { visa_required: false, vaccination_required: false, passport_validity_months: 6 },
    'SG': { visa_required: false, vaccination_required: false, passport_validity_months: 6 },
    'ID': { visa_required: false, vaccination_required: false, passport_validity_months: 6 },
    'JP': { visa_required: false, vaccination_required: false, passport_validity_months: 6 },
    'KR': { visa_required: false, vaccination_required: false, passport_validity_months: 6 },
    'VN': { visa_required: true, vaccination_required: false, passport_validity_months: 6 },
    'CN': { visa_required: true, vaccination_required: false, passport_validity_months: 6 },
    'IN': { visa_required: true, vaccination_required: true, passport_validity_months: 6 },
  }

  return requirements[countryCode] || { visa_required: true, vaccination_required: false, passport_validity_months: 6 }
}

function getDestinationHighlights(cityName: string, countryCode: string): string[] {
  const highlights: { [key: string]: string[] } = {
    'TH': ['Ancient Temples', 'Street Food', 'Floating Markets', 'Thai Massage'],
    'SG': ['Marina Bay Sands', 'Gardens by the Bay', 'Hawker Centers', 'Shopping'],
    'JP': ['Cherry Blossoms', 'Traditional Culture', 'Modern Technology', 'Sushi'],
    'ID': ['Beautiful Beaches', 'Cultural Heritage', 'Volcanoes', 'Islands'],
    'VN': ['Ha Long Bay', 'Street Food', 'Historical Sites', 'Coffee Culture'],
    'KR': ['K-Culture', 'Palaces', 'Shopping', 'Korean BBQ'],
    'HK': ['Skyline Views', 'Dim Sum', 'Shopping', 'Peak Tram']
  }

  return highlights[countryCode] || ['Cultural Sites', 'Local Cuisine', 'Scenic Views', 'Shopping']
}

function getDestinationTags(countryCode: string, budget: number): string[] {
  const tags = []
  
  const halalFriendly = ['MY', 'ID', 'SG', 'TH', 'AE', 'QA']
  if (halalFriendly.includes(countryCode)) {
    tags.push('Halal-friendly')
  }

  const budgetFriendly = ['TH', 'VN', 'ID', 'PH', 'MY']
  if (budgetFriendly.includes(countryCode) || budget < 3000) {
    tags.push('Budget-friendly')
  }

  const familyFriendly = ['SG', 'JP', 'HK', 'AU', 'NZ']
  if (familyFriendly.includes(countryCode)) {
    tags.push('Family-friendly')
  }

  const cultural = ['JP', 'TH', 'VN', 'CN', 'IN', 'KR']
  if (cultural.includes(countryCode)) {
    tags.push('Cultural')
  }

  const modern = ['SG', 'JP', 'HK', 'KR', 'AE']
  if (modern.includes(countryCode)) {
    tags.push('Modern')
  }

  return tags
}

function getDefaultDepartureDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30) // 30 days from now
  return date.toISOString().split('T')[0]
}

// Enhanced Google Places integration for better destination suggestions
async function searchDestinationsWithGoogle(
  query: string, 
  origin: string, 
  budget: number, 
  currency: string,
  departureDate: string,
  returnDate?: string
): Promise<DestinationSearchResult[]> {
  try {
    const googleApiKey = process.env.GOOGLE_PLACES_SUGGESTIONS_API_KEY
    if (!googleApiKey) {
      console.log('Google Places Suggestions API key not configured')
      return []
    }

    // Use Google Places Text Search for comprehensive city/destination search
    // Try multiple search approaches for better results
    const queries = [
      `${query} city`,
      `${query} tourist destination`,
      query
    ]
    
    let bestResult = null
    for (const searchQuery of queries) {
      const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${googleApiKey}`
      const response = await fetch(textSearchUrl)
      
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          bestResult = data
          console.log(`Google Places found ${data.results.length} results for query: "${searchQuery}"`)
          break
        }
      }
    }
    
    if (!bestResult) {
      console.log('Google Places Text Search: No results found for any query variation')
      return []
    }

    const data = bestResult
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const destinations: DestinationSearchResult[] = []

      for (const place of data.results.slice(0, 8)) {
        // Get place details for more information
        const placeDetails = await getGooglePlaceDetails(place.place_id, googleApiKey)
        
        // Find nearest airport using city name
        const airportCode = findNearestAirport(place.name, place.geometry?.location)
        
        if (airportCode) {
          const destination: DestinationSearchResult = {
            destination_code: airportCode,
            name: place.name,
            country: extractCountryFromPlace(place.formatted_address),
            region: extractRegionFromPlace(place.formatted_address),
            coordinates: {
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng
            },
            popularity_score: (place.rating || 4.0) * 20, // Convert to 0-100 scale
            from_price: {
              amount: estimatePriceFromGoogle(place, budget, origin),
              currency: currency
            },
            travel_requirements: getTravelRequirements(getCountryCode(place.formatted_address)),
            highlights: extractHighlightsFromGoogle(place, placeDetails),
            tags: generateTagsFromGoogle(place, placeDetails, budget)
          }

          destinations.push(destination)
        }
      }

      console.log(`Found ${destinations.length} destinations from Google Places Text Search`)
      return destinations
    }

    return []
  } catch (error) {
    console.error('Google Places destination search error:', error)
    return []
  }
}

async function getGooglePlaceDetails(placeId: string, apiKey: string): Promise<any> {
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,types,vicinity,website,rating,user_ratings_total,reviews,photos&key=${apiKey}`
    
    const response = await fetch(detailsUrl)
    if (response.ok) {
      const data = await response.json()
      return data.result
    }
  } catch (error) {
    console.log('Error getting place details:', error)
  }
  return null
}

function findNearestAirport(cityName: string, location: {lat: number, lng: number}): string | null {
  // Major city to airport code mapping
  const cityAirportMap: { [key: string]: string } = {
    'Bangkok': 'BKK', 'Singapore': 'SIN', 'Tokyo': 'NRT', 'Hong Kong': 'HKG',
    'Seoul': 'ICN', 'Taipei': 'TPE', 'Manila': 'MNL', 'Jakarta': 'CGK',
    'Hanoi': 'HAN', 'Ho Chi Minh City': 'SGN', 'Shanghai': 'PVG',
    'Delhi': 'DEL', 'Mumbai': 'BOM', 'Dubai': 'DXB', 'Doha': 'DOH',
    'Sydney': 'SYD', 'Melbourne': 'MEL', 'Perth': 'PER', 'Paris': 'CDG',
    'London': 'LHR', 'New York': 'JFK', 'Los Angeles': 'LAX',
    'Kuala Lumpur': 'KUL', 'Phuket': 'HKT', 'Bali': 'DPS', 'Cebu': 'CEB',
    'Kota Kinabalu': 'BKI', 'Langkawi': 'LGK', 'Penang': 'PEN'
  }

  // Try exact match first
  for (const [city, code] of Object.entries(cityAirportMap)) {
    if (cityName.toLowerCase().includes(city.toLowerCase())) {
      return code
    }
  }

  // For unknown cities, try to generate a reasonable airport code
  // This is a fallback - in production you'd use a more comprehensive airport database
  const cleanName = cityName.replace(/[^a-zA-Z\s]/g, '').trim()
  if (cleanName.length >= 3) {
    return cleanName.substring(0, 3).toUpperCase()
  }

  return null
}

function extractCountryFromPlace(formattedAddress: string): string {
  // Extract country from formatted address (usually the last part)
  const parts = formattedAddress.split(', ')
  return parts[parts.length - 1] || 'Unknown'
}

function extractRegionFromPlace(formattedAddress: string): string {
  const parts = formattedAddress.split(', ')
  if (parts.length >= 2) {
    return parts[parts.length - 2] || ''
  }
  return ''
}

function getCountryCode(formattedAddress: string): string {
  const countryMapping: { [key: string]: string } = {
    'Thailand': 'TH', 'Singapore': 'SG', 'Japan': 'JP', 'Hong Kong': 'HK',
    'South Korea': 'KR', 'Taiwan': 'TW', 'Philippines': 'PH', 'Indonesia': 'ID',
    'Vietnam': 'VN', 'Malaysia': 'MY', 'China': 'CN', 'India': 'IN',
    'United Arab Emirates': 'AE', 'Qatar': 'QA', 'Australia': 'AU',
    'New Zealand': 'NZ', 'France': 'FR', 'United Kingdom': 'GB',
    'United States': 'US'
  }

  const country = extractCountryFromPlace(formattedAddress)
  return countryMapping[country] || 'XX'
}

function estimatePriceFromGoogle(place: any, budget: number, origin: string): number {
  // Estimate price based on place rating, location, and popularity
  const basePrice = budget * 0.2 // 20% of budget for flights
  
  // Adjust based on rating (higher rating = potentially more expensive destination)
  const ratingMultiplier = place.rating ? (place.rating / 5.0) * 0.3 + 0.7 : 1.0
  
  // Adjust based on user ratings total (more popular = potentially more expensive)
  const popularityMultiplier = place.user_ratings_total > 1000 ? 1.2 : 
                              place.user_ratings_total > 500 ? 1.1 : 1.0
  
  return Math.round(basePrice * ratingMultiplier * popularityMultiplier)
}

function extractHighlightsFromGoogle(place: any, details: any): string[] {
  const highlights: string[] = []
  
  // Extract from place types
  if (place.types) {
    const typeMapping: { [key: string]: string } = {
      'tourist_attraction': 'Tourist Attractions',
      'museum': 'Museums',
      'park': 'Parks & Gardens',
      'shopping_mall': 'Shopping',
      'restaurant': 'Dining',
      'lodging': 'Accommodations',
      'natural_feature': 'Natural Beauty',
      'historical': 'Historical Sites'
    }
    
    for (const type of place.types) {
      if (typeMapping[type]) {
        highlights.push(typeMapping[type])
      }
    }
  }
  
  // Add generic highlights if none found
  if (highlights.length === 0) {
    highlights.push('Cultural Sites', 'Local Cuisine', 'Scenic Views')
  }
  
  return highlights.slice(0, 4) // Limit to 4 highlights
}

function generateTagsFromGoogle(place: any, details: any, budget: number): string[] {
  const tags: string[] = []
  
  // Based on rating
  if (place.rating >= 4.5) {
    tags.push('Highly Rated')
  }
  
  // Based on popularity
  if (place.user_ratings_total > 2000) {
    tags.push('Popular')
  }
  
  // Based on place types
  if (place.types?.includes('tourist_attraction')) {
    tags.push('Tourist Destination')
  }
  
  if (place.types?.includes('natural_feature')) {
    tags.push('Natural Beauty')
  }
  
  // Budget consideration
  if (budget < 3000) {
    tags.push('Budget-friendly')
  }
  
  return tags
}

function combineAndRankDestinations(
  amadeusResults: DestinationSearchResult[], 
  googleResults: DestinationSearchResult[]
): DestinationSearchResult[] {
  const combined = [...amadeusResults]
  const amadeusNames = new Set(amadeusResults.map(d => d.name.toLowerCase()))
  
  // Add Google results that don't duplicate Amadeus results
  for (const googleResult of googleResults) {
    const googleName = googleResult.name.toLowerCase()
    if (!amadeusNames.has(googleName)) {
      // Mark as Google-sourced
      googleResult.tags = [...(googleResult.tags || []), 'Google Places']
      combined.push(googleResult)
    }
  }
  
  // Sort by popularity score (highest first)
  combined.sort((a, b) => b.popularity_score - a.popularity_score)
  
  return combined
}

// Quick search function optimized for autocomplete with cached data and faster responses
async function quickDestinationSearch(
  token: string,
  query: string,
  origin: string,
  budget: number,
  currency: string,
  limit: number
): Promise<DestinationSearchResult[]> {
  try {
    console.log(`Quick search for: "${query}"`)
    
    // Use only Amadeus API for global destination search - no hardcoded destinations
    if (token) {
      try {
        const amadeusResults = await searchDestinationsByQueryQuick(token, query, origin, budget, currency, limit)
        
        if (amadeusResults.length > 0) {
          console.log(`Quick Amadeus search found ${amadeusResults.length} destinations for "${query}"`)
          return amadeusResults
        }
      } catch (error) {
        console.log('Quick Amadeus search failed:', error)
      }
    }

    // If Amadeus fails, try a simple text-based search with popular airport codes as absolute fallback
    const emergencyFallback = await searchEmergencyFallbackDestinations(query, budget, currency, limit)
    console.log(`Using emergency fallback: found ${emergencyFallback.length} destinations`)
    return emergencyFallback
  } catch (error) {
    console.error('Quick destination search error:', error)
    // Final fallback to emergency search if all else fails
    return await searchEmergencyFallbackDestinations(query, budget, currency, limit)
  }
}

// Simplified Amadeus search for quick autocomplete responses
async function searchDestinationsByQueryQuick(
  token: string,
  query: string,
  origin: string,
  budget: number,
  currency: string,
  limit: number
): Promise<DestinationSearchResult[]> {
  try {
    const locationsResponse = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${encodeURIComponent(query)}&page[limit]=${limit * 2}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(3000) // Shorter timeout for quick search
      }
    )

    if (!locationsResponse.ok) return []

    const locationsData = await locationsResponse.json()
    const destinations: AmadeusDestination[] = locationsData.data || []

    return destinations.slice(0, limit).map(dest => ({
      destination_code: dest.iataCode,
      name: dest.name,
      country: dest.address.countryName || dest.address.countryCode,
      region: dest.address.regionCode || dest.address.stateCode || '',
      coordinates: {
        latitude: dest.geoCode.latitude,
        longitude: dest.geoCode.longitude
      },
      popularity_score: dest.analytics?.travelers?.score || (70 + Math.random() * 25),
      from_price: {
        amount: calculateEstimatedPrice(dest, budget),
        currency: currency
      },
      travel_requirements: getTravelRequirements(dest.address.countryCode),
      highlights: getDestinationHighlights(dest.name, dest.address.countryCode),
      tags: getDestinationTags(dest.address.countryCode, budget)
    })).filter(dest => dest.destination_code && dest.name)
  } catch (error) {
    console.log('Quick Amadeus search error:', error)
    return []
  }
}

// Emergency fallback for when all APIs fail - uses minimal data without hardcoded destinations
async function searchEmergencyFallbackDestinations(
  query: string,
  budget: number, 
  currency: string, 
  limit: number
): Promise<DestinationSearchResult[]> {
  try {
    console.log(`Emergency fallback search for: "${query}"`)
    
    // If we have a query, try to create a basic destination entry
    if (query && query.trim()) {
      // Generate a basic airport code from the query
      const queryCode = query.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase()
      
      return [{
        destination_code: queryCode || 'XXX',
        name: query.trim(),
        country: 'Unknown',
        region: 'Global',
        coordinates: { latitude: 0, longitude: 0 },
        popularity_score: 50,
        from_price: {
          amount: Math.round(budget * 0.20), // 20% of budget estimate for flights
          currency: currency
        },
        travel_requirements: {
          visa_required: true, // Conservative assumption
          vaccination_required: false,
          passport_validity_months: 6
        },
        highlights: ['Local Culture', 'Scenic Views', 'Local Cuisine', 'Tourist Attractions'],
        tags: ['Global Destination'],
        weather_info: {
          current_temp: 25,
          condition: 'Unknown',
          humidity: 60
        }
      }]
    }
    
    // If no query, return empty (will force user to search)
    return []
  } catch (error) {
    console.error('Emergency fallback search failed:', error)
    return []
  }
}

function estimateFlightDuration(destinationCode: string): string {
  const durations: { [key: string]: string } = {
    'BKK': '2h 30m', 'SIN': '1h 30m', 'CGK': '2h 15m', 'MNL': '3h', 'HAN': '2h 45m', 'SGN': '2h 30m',
    'PEN': '1h 15m', 'LGK': '1h 20m', 'NRT': '7h', 'KIX': '6h 30m', 'ICN': '6h 45m', 'HKG': '3h 30m',
    'TPE': '3h 15m', 'PVG': '5h 30m', 'DEL': '4h 30m', 'BOM': '4h', 'DXB': '7h', 'DOH': '7h 30m',
    'SYD': '8h', 'MEL': '7h 30m', 'IST': '9h 45m'
  }
  return durations[destinationCode] || '4h'
}

// This function has been removed - replaced with API-driven emergency fallback