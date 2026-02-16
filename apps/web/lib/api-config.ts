// API Configuration for Holiday AI Platform
// This file contains all API keys and configuration for external services

export const API_CONFIG = {
  // OpenAI Configuration
  // NOTE: API keys should NEVER be in client-side code. Use backend proxy instead.
  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    BASE_URL: 'https://api.openai.com/v1',
    MODEL: 'gpt-4-turbo-preview'
  },

  // Amadeus Travel API Configuration
  // NOTE: API keys should NEVER be in client-side code. Use backend proxy instead.
  AMADEUS: {
    API_KEY: process.env.AMADEUS_API_KEY || process.env.NEXT_PUBLIC_AMADEUS_API_KEY || '',
    API_SECRET: process.env.AMADEUS_API_SECRET || process.env.NEXT_PUBLIC_AMADEUS_API_SECRET || '',
    BASE_URL: 'https://test.api.amadeus.com/v2',
    // Production: https://api.amadeus.com/v2
  },

  // Phase 1: Core Booking Hub APIs
  // Booking.com Affiliate API (69.3% European market share)
  BOOKING_COM: {
    API_KEY: process.env.BOOKING_COM_API_KEY || '',
    BASE_URL: 'https://api.booking.com/v1',
    AFFILIATE_ID: process.env.BOOKING_COM_AFFILIATE_ID || '',
    // Booking.com uses both API Key and Affiliate ID for partner access
  },

  // Agoda Affiliate API (34% best rates globally, Asia specialist)
  AGODA: {
    API_KEY: process.env.AGODA_API_KEY || '',
    PARTNER_ID: process.env.AGODA_PARTNER_ID || '',
    BASE_URL: 'https://api.agoda.com/affiliates/partner/1.0',
    // Agoda Partner API for affiliate bookings
  },

  // Skyscanner API (best for budget carriers)
  SKYSCANNER: {
    API_KEY: process.env.SKYSCANNER_API_KEY || '',
    BASE_URL: 'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
    RAPID_API_HOST: 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
    // Skyscanner uses RapidAPI for third-party access
  },

  // Google Hotels & Flights Integration
  GOOGLE: {
    API_KEY: process.env.GOOGLE_API_KEY || process.env.GOOGLE_HOTELS_API_KEY || '',
    PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || '',
    FLIGHTS_API_KEY: process.env.GOOGLE_FLIGHTS_API_KEY || '',
    BASE_URL: 'https://maps.googleapis.com/maps/api',
    // Google uses different endpoints for different services
  },

  // Airbnb API (most downloaded 2024)
  AIRBNB: {
    API_KEY: process.env.AIRBNB_API_KEY || '',
    BASE_URL: 'https://api.airbnb.com',
    CLIENT_ID: process.env.AIRBNB_CLIENT_ID || '',
    // Airbnb requires partner program access
  },

  // VRBO API (vacation rentals specialist)
  VRBO: {
    API_KEY: process.env.VRBO_API_KEY || '',
    BASE_URL: 'https://api.vrbo.com',
    PARTNER_ID: process.env.VRBO_PARTNER_ID || '',
    // VRBO/HomeAway API for vacation rentals
  },

  // Phase 2: Activity & Experience APIs
  // Viator API (300K+ experiences, 2,500 destinations)
  VIATOR: {
    API_KEY: process.env.VIATOR_API_KEY || '',
    BASE_URL: 'https://api.viator.com',
    PARTNER_ID: process.env.VIATOR_PARTNER_ID || '',
    // Viator API for tours and activities
  },

  // GetYourGuide API (140K+ tours, 10K+ cities)
  GETYOURGUIDE: {
    API_KEY: process.env.GETYOURGUIDE_API_KEY || '',
    BASE_URL: 'https://api.getyourguide.com',
    PARTNER_ID: process.env.GETYOURGUIDE_PARTNER_ID || '',
    // GetYourGuide Affiliate API
  },

  // TripAdvisor API (reviews and recommendations)
  TRIPADVISOR: {
    API_KEY: process.env.TRIPADVISOR_API_KEY || '',
    BASE_URL: 'https://api.tripadvisor.com/api/partner/2.0',
    // TripAdvisor Content API
  },

  // Phase 3: Transportation APIs
  // Rome2Rio API (multi-modal trip planning, 240 countries)
  ROME2RIO: {
    API_KEY: process.env.ROME2RIO_API_KEY || '',
    BASE_URL: 'http://free.rome2rio.com/api/1.4/json',
    // Rome2Rio Search API
  },

  // Uber API (global transportation)
  UBER: {
    CLIENT_ID: process.env.UBER_CLIENT_ID || '',
    CLIENT_SECRET: process.env.UBER_CLIENT_SECRET || '',
    BASE_URL: 'https://api.uber.com/v1.2',
    // Uber API for ride estimates and booking
  },

  // Grab API (Southeast Asia dominant)
  GRAB: {
    CLIENT_ID: process.env.GRAB_CLIENT_ID || '',
    CLIENT_SECRET: process.env.GRAB_CLIENT_SECRET || '',
    BASE_URL: 'https://api.grab.com',
    // Grab API for Southeast Asian markets
  },

  // Phase 4: Financial Intelligence APIs
  // Revolut API (all-in-one travel card)
  REVOLUT: {
    API_KEY: process.env.REVOLUT_API_KEY || '',
    BASE_URL: 'https://api.revolut.com',
    // Revolut Business API for currency services
  },

  // Wise API (best exchange rates, 40+ currencies)
  WISE: {
    API_TOKEN: process.env.WISE_API_TOKEN || '',
    BASE_URL: 'https://api.transferwise.com',
    // Wise (TransferWise) API for currency exchange
  },

  // XE Currency API (rate reference standard)
  XE_CURRENCY: {
    API_KEY: process.env.XE_API_KEY || '',
    ACCOUNT_ID: process.env.XE_ACCOUNT_ID || '',
    BASE_URL: 'https://xecdapi.xe.com/v1',
    // XE Currency Data API
  },

  // OpenWeather API Configuration
  // NOTE: API keys should NEVER be in client-side code. Use backend proxy instead.
  OPENWEATHER: {
    API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '',
    API_KEY_BACKUP: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY_BACKUP || '',
    BASE_URL: 'https://api.openweathermap.org/data/2.5'
  },

  // Backend API Configuration
  BACKEND: {
    BASE_URL: process.env.BACKEND_URL || 'http://localhost:8000',
    API_PREFIX: '/api'
  }
}

// API Helper Functions
export const apiHelpers = {
  // OpenAI Chat Completion
  async generateItinerary(userPreferences: any) {
    try {
      const response = await fetch(`${API_CONFIG.OPENAI.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.OPENAI.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: API_CONFIG.OPENAI.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert travel planner. Generate detailed, personalized travel itineraries based on user preferences, budget, and requirements.'
            },
            {
              role: 'user',
              content: `Create a detailed travel itinerary with these preferences: ${JSON.stringify(userPreferences)}. 
              
              Key considerations:
              - Flight class: ${userPreferences.flightClass || 'economy'} (adjust recommendations for comfort level and budget)
              - Include specific airline suggestions for ${userPreferences.flightClass || 'economy'} class travel
              - Budget: RM ${userPreferences.budget} total (not per person)
              - Travelers: ${userPreferences.travelers?.adults || 2} adults, ${userPreferences.travelers?.children || 0} children, ${userPreferences.travelers?.infants || 0} infants
              - Consider family-friendly activities if children/infants are included
              - Provide flight cost estimates and airline recommendations
              - Break down budget allocation: flights, accommodation, food, activities, transport`
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      })

      if (!response.ok) throw new Error('OpenAI API request failed')
      return await response.json()
    } catch (error) {
      console.error('OpenAI API Error:', error)
      return null
    }
  },

  // Amadeus Flight Search
  async searchFlights(origin: string, destination: string, departureDate: string, returnDate?: string) {
    try {
      // First get access token
      const tokenResponse = await fetch(`${API_CONFIG.AMADEUS.BASE_URL}/security/oauth2/token`, {
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

      if (!tokenResponse.ok) throw new Error('Amadeus token request failed')
      const tokenData = await tokenResponse.json()

      // Search flights
      const searchParams = new URLSearchParams({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        adults: '1'
      })

      if (returnDate) {
        searchParams.append('returnDate', returnDate)
      }

      const flightResponse = await fetch(
        `${API_CONFIG.AMADEUS.BASE_URL}/shopping/flight-offers?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        }
      )

      if (!flightResponse.ok) throw new Error('Amadeus flight search failed')
      return await flightResponse.json()
    } catch (error) {
      console.error('Amadeus API Error:', error)
      return null
    }
  },

  // OpenWeather Current Weather
  async getCurrentWeather(city: string) {
    try {
      const response = await fetch(
        `${API_CONFIG.OPENWEATHER.BASE_URL}/weather?q=${city}&appid=${API_CONFIG.OPENWEATHER.API_KEY}&units=metric`
      )

      if (!response.ok) {
        // Try backup API key
        const backupResponse = await fetch(
          `${API_CONFIG.OPENWEATHER.BASE_URL}/weather?q=${city}&appid=${API_CONFIG.OPENWEATHER.API_KEY_BACKUP}&units=metric`
        )
        if (!backupResponse.ok) throw new Error('OpenWeather API request failed')
        return await backupResponse.json()
      }

      return await response.json()
    } catch (error) {
      console.error('OpenWeather API Error:', error)
      return null
    }
  },

  // OpenWeather 5-day Forecast
  async getWeatherForecast(city: string) {
    try {
      const response = await fetch(
        `${API_CONFIG.OPENWEATHER.BASE_URL}/forecast?q=${city}&appid=${API_CONFIG.OPENWEATHER.API_KEY}&units=metric`
      )

      if (!response.ok) {
        // Try backup API key
        const backupResponse = await fetch(
          `${API_CONFIG.OPENWEATHER.BASE_URL}/forecast?q=${city}&appid=${API_CONFIG.OPENWEATHER.API_KEY_BACKUP}&units=metric`
        )
        if (!backupResponse.ok) throw new Error('OpenWeather forecast request failed')
        return await backupResponse.json()
      }

      return await response.json()
    } catch (error) {
      console.error('OpenWeather Forecast Error:', error)
      return null
    }
  },

  // Backend API call
  async callBackendAPI(endpoint: string, method = 'GET', data?: any) {
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(`${API_CONFIG.BACKEND.BASE_URL}${API_CONFIG.BACKEND.API_PREFIX}${endpoint}`, options)
      
      if (!response.ok) throw new Error(`Backend API request failed: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Backend API Error:', error)
      return null
    }
  }
}

// Test API Connections
export async function testAPIConnections() {
  const results = {
    openai: false,
    amadeus: false,
    openweather: false,
    backend: false
  }

  // Test OpenAI
  try {
    const openaiTest = await fetch(`${API_CONFIG.OPENAI.BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.OPENAI.API_KEY}`
      }
    })
    results.openai = openaiTest.ok
  } catch (error) {
    console.error('OpenAI connection test failed:', error)
  }

  // Test Amadeus
  try {
    const amadeusTest = await fetch(`${API_CONFIG.AMADEUS.BASE_URL}/security/oauth2/token`, {
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
    results.amadeus = amadeusTest.ok
  } catch (error) {
    console.error('Amadeus connection test failed:', error)
  }

  // Test OpenWeather
  try {
    const weatherTest = await fetch(
      `${API_CONFIG.OPENWEATHER.BASE_URL}/weather?q=London&appid=${API_CONFIG.OPENWEATHER.API_KEY}`
    )
    results.openweather = weatherTest.ok
  } catch (error) {
    console.error('OpenWeather connection test failed:', error)
  }

  // Test Backend
  try {
    const backendTest = await fetch(`${API_CONFIG.BACKEND.BASE_URL}/health`)
    results.backend = backendTest.ok
  } catch (error) {
    console.error('Backend connection test failed:', error)
  }

  return results
}