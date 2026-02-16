import { NextRequest, NextResponse } from 'next/server'

interface PriceComparisonResult {
  success: boolean
  data?: {
    flights: {
      best_price: {
        total: number
        currency: string
        airline: string
        provider: string
      }
      price_range: {
        min: number
        max: number
        currency: string
      }
      providers: Array<{
        name: string
        price: number
        currency: string
        flight_details: any
        booking_link: string
      }>
    }
    hotels: {
      best_price: {
        total: number
        per_night: number
        currency: string
        hotel: string
        provider: string
      }
      price_range: {
        min: number
        max: number
        currency: string
      }
      providers: Array<{
        name: string
        price: number
        per_night: number
        currency: string
        hotel_details: any
        booking_link: string
      }>
    }
    total_comparison: {
      cheapest_combination: {
        total: number
        currency: string
        flight_provider: string
        hotel_provider: string
        savings: number
      }
      most_expensive: {
        total: number
        currency: string
      }
    }
    search_params: any
    meta: {
      search_time: string
      providers_searched: string[]
      currency_rates_used: boolean
    }
  }
  error?: string
}

// GET /api/compare-prices - Compare prices across multiple providers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Flight parameters
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const departureDate = searchParams.get('departure_date')
    const returnDate = searchParams.get('return_date')
    
    // Hotel parameters
    const checkIn = searchParams.get('check_in') || departureDate
    const checkOut = searchParams.get('check_out') || returnDate
    
    // Common parameters
    const adults = parseInt(searchParams.get('adults') || '2')
    const children = parseInt(searchParams.get('children') || '0')
    const currency = searchParams.get('currency') || 'MYR'

    if (!origin || !destination || !departureDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: origin, destination, departure_date'
      }, { status: 400 })
    }

    console.log(`Comparing prices: ${origin} → ${destination} on ${departureDate}`)

    // Search multiple providers in parallel
    const providers = ['amadeus', 'booking', 'agoda', 'expedia', 'skyscanner']
    const searchResults = await Promise.allSettled([
      searchFlightProviders(origin, destination, departureDate, returnDate, adults, children, currency),
      searchHotelProviders(destination, checkIn, checkOut, adults, children, currency)
    ])

    const flightResults = searchResults[0].status === 'fulfilled' ? searchResults[0].value : { providers: [] }
    const hotelResults = searchResults[1].status === 'fulfilled' ? searchResults[1].value : { providers: [] }

    // Analyze flight prices
    const flightAnalysis = analyzeFlightPrices(flightResults.providers, currency)
    
    // Analyze hotel prices  
    const hotelAnalysis = analyzeHotelPrices(hotelResults.providers, currency)

    // Find best combinations
    const totalComparison = calculateBestCombinations(flightAnalysis, hotelAnalysis, currency)

    const response = {
      success: true,
      data: {
        flights: flightAnalysis,
        hotels: hotelAnalysis,
        total_comparison: totalComparison,
        search_params: {
          origin,
          destination,
          departure_date: departureDate,
          return_date: returnDate,
          check_in: checkIn,
          check_out: checkOut,
          adults,
          children,
          currency
        },
        meta: {
          search_time: new Date().toISOString(),
          providers_searched: providers,
          currency_rates_used: currency !== 'USD'
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Price comparison API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to compare prices',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function searchFlightProviders(
  origin: string, 
  destination: string, 
  departureDate: string,
  returnDate: string | null,
  adults: number,
  children: number,
  currency: string
) {
  try {
    // In production, you would call multiple real APIs
    const providers = []

    // Amadeus (real API integration)
    try {
      const amadeusUrl = `http://localhost:3010/api/flights/search?origin=${origin}&destination=${destination}&departure_date=${departureDate}${returnDate ? `&return_date=${returnDate}` : ''}&adults=${adults}&children=${children}&currency=${currency}`
      const amadeusResponse = await fetch(amadeusUrl)
      const amadeusData = await amadeusResponse.json()
      
      if (amadeusData.success && amadeusData.data.flights.length > 0) {
        const bestFlight = amadeusData.data.flights[0] // Cheapest
        providers.push({
          name: 'Amadeus',
          price: bestFlight.price.total,
          currency: currency,
          flight_details: bestFlight,
          booking_link: `https://amadeus.com/book/${bestFlight.id}`,
          meta: amadeusData.data.meta
        })
      }
    } catch (error) {
      console.log('Amadeus provider error:', error)
    }

    // Mock additional providers for demonstration
    const mockProviders = [
      {
        name: 'Skyscanner',
        price_multiplier: 0.95,
        booking_link: 'https://skyscanner.com',
      },
      {
        name: 'Expedia',
        price_multiplier: 1.05,
        booking_link: 'https://expedia.com',
      },
      {
        name: 'Kayak',
        price_multiplier: 1.02,
        booking_link: 'https://kayak.com',
      },
      {
        name: 'Google Flights',
        price_multiplier: 0.98,
        booking_link: 'https://google.com/flights',
      }
    ]

    // Generate mock results for other providers based on Amadeus data
    if (providers.length > 0) {
      const basePrice = providers[0].price
      const baseFlightDetails = providers[0].flight_details

      for (const mockProvider of mockProviders) {
        const adjustedPrice = Math.round(basePrice * mockProvider.price_multiplier)
        providers.push({
          name: mockProvider.name,
          price: adjustedPrice,
          currency: currency,
          flight_details: {
            ...baseFlightDetails,
            price: { ...baseFlightDetails.price, total: adjustedPrice },
            airline: mockProvider.name.includes('Skyscanner') ? 'Various Airlines' : baseFlightDetails.airline
          },
          booking_link: mockProvider.booking_link,
          meta: { data_source: 'mock_comparison' }
        })
      }
    }

    return { providers }
  } catch (error) {
    console.error('Flight provider search error:', error)
    return { providers: [] }
  }
}

async function searchHotelProviders(
  destination: string,
  checkIn: string | null,
  checkOut: string | null,
  adults: number,
  children: number,
  currency: string
) {
  try {
    if (!checkIn || !checkOut) {
      return { providers: [] }
    }

    const providers = []

    // Our hotel search API
    try {
      const hotelUrl = `http://localhost:3010/api/hotels/search?destination=${destination}&check_in=${checkIn}&check_out=${checkOut}&adults=${adults}&children=${children}&currency=${currency}`
      const hotelResponse = await fetch(hotelUrl)
      const hotelData = await hotelResponse.json()
      
      if (hotelData.success && hotelData.data.hotels.length > 0) {
        // Take the cheapest hotel from our API (could be Google Hotels or mock data)
        const bestHotel = hotelData.data.hotels[0]
        const providerName = bestHotel.provider === 'Google Hotels' ? 'Google Hotels' : 'Booking.com'
        providers.push({
          name: providerName,
          price: bestHotel.pricing.total,
          per_night: bestHotel.pricing.per_night,
          currency: currency,
          hotel_details: bestHotel,
          booking_link: bestHotel.deep_link,
          meta: hotelData.data.meta
        })
      }
    } catch (error) {
      console.log('Hotel provider error:', error)
    }

    // Mock additional providers
    const mockHotelProviders = [
      { name: 'Agoda', price_multiplier: 0.92, booking_link: 'https://agoda.com' },
      { name: 'Hotels.com', price_multiplier: 1.08, booking_link: 'https://hotels.com' },
      { name: 'Expedia', price_multiplier: 1.03, booking_link: 'https://expedia.com' },
      { name: 'Trivago', price_multiplier: 0.96, booking_link: 'https://trivago.com' }
    ]

    if (providers.length > 0) {
      const basePrice = providers[0].price
      const basePerNight = providers[0].per_night
      const baseHotelDetails = providers[0].hotel_details

      for (const mockProvider of mockHotelProviders) {
        const adjustedTotal = Math.round(basePrice * mockProvider.price_multiplier)
        const adjustedPerNight = Math.round(basePerNight * mockProvider.price_multiplier)
        
        providers.push({
          name: mockProvider.name,
          price: adjustedTotal,
          per_night: adjustedPerNight,
          currency: currency,
          hotel_details: {
            ...baseHotelDetails,
            pricing: { 
              ...baseHotelDetails.pricing, 
              total: adjustedTotal, 
              per_night: adjustedPerNight 
            }
          },
          booking_link: mockProvider.booking_link,
          meta: { data_source: 'mock_comparison' }
        })
      }
    }

    return { providers }
  } catch (error) {
    console.error('Hotel provider search error:', error)
    return { providers: [] }
  }
}

function analyzeFlightPrices(providers: any[], currency: string) {
  if (providers.length === 0) {
    return {
      best_price: null,
      price_range: { min: 0, max: 0, currency },
      providers: []
    }
  }

  const prices = providers.map(p => p.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const bestProvider = providers.find(p => p.price === minPrice)

  return {
    best_price: {
      total: minPrice,
      currency: currency,
      airline: bestProvider.flight_details.airline,
      provider: bestProvider.name
    },
    price_range: {
      min: minPrice,
      max: maxPrice,
      currency: currency
    },
    providers: providers.sort((a, b) => a.price - b.price)
  }
}

function analyzeHotelPrices(providers: any[], currency: string) {
  if (providers.length === 0) {
    return {
      best_price: null,
      price_range: { min: 0, max: 0, currency },
      providers: []
    }
  }

  const prices = providers.map(p => p.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const bestProvider = providers.find(p => p.price === minPrice)

  return {
    best_price: {
      total: minPrice,
      per_night: bestProvider.per_night,
      currency: currency,
      hotel: bestProvider.hotel_details.name,
      provider: bestProvider.name
    },
    price_range: {
      min: minPrice,
      max: maxPrice,
      currency: currency
    },
    providers: providers.sort((a, b) => a.price - b.price)
  }
}

function calculateBestCombinations(flightAnalysis: any, hotelAnalysis: any, currency: string) {
  if (!flightAnalysis.best_price || !hotelAnalysis.best_price) {
    return {
      cheapest_combination: null,
      most_expensive: null
    }
  }

  const cheapestTotal = flightAnalysis.best_price.total + hotelAnalysis.best_price.total
  const mostExpensiveTotal = flightAnalysis.price_range.max + hotelAnalysis.price_range.max

  return {
    cheapest_combination: {
      total: cheapestTotal,
      currency: currency,
      flight_provider: flightAnalysis.best_price.provider,
      hotel_provider: hotelAnalysis.best_price.provider,
      savings: mostExpensiveTotal - cheapestTotal
    },
    most_expensive: {
      total: mostExpensiveTotal,
      currency: currency
    }
  }
}