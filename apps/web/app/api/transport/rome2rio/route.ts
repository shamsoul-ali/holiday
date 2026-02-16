import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/api-config'

// Rome2Rio Transport Integration
// Multi-modal transport search covering 240+ countries
// Includes flights, trains, buses, ferries, driving directions, rideshare

interface Rome2RioSearchRequest {
  origin: string
  destination: string
  departure_date?: string
  arrival_date?: string
  currency?: string
  language?: string
  transport_types?: string[] // ['flight', 'train', 'bus', 'car', 'rideshare', 'ferry']
  passengers?: number
}

interface Rome2RioRoute {
  id: string
  total_duration: string
  total_distance: number
  total_price: {
    amount: number
    currency: string
  }
  segments: Rome2RioSegment[]
  carbon_footprint: {
    kg_co2: number
    comparison: string
  }
  recommended: boolean
  provider_info: {
    name: string
    logo: string
    rating: number
  }
}

interface Rome2RioSegment {
  transport_type: 'flight' | 'train' | 'bus' | 'car' | 'rideshare' | 'ferry' | 'walk'
  provider: string
  provider_logo: string
  origin: {
    name: string
    code: string
    coordinates: [number, number]
  }
  destination: {
    name: string
    code: string
    coordinates: [number, number]
  }
  departure_time: string
  arrival_time: string
  duration: string
  distance: number
  price: {
    amount: number
    currency: string
  }
  booking_url?: string
  vehicle_info?: {
    type: string
    model: string
    amenities: string[]
  }
  station_info?: {
    departure_station: string
    arrival_station: string
    platform?: string
  }
}

interface Rome2RioResponse {
  success: boolean
  routes: Rome2RioRoute[]
  search_metadata: {
    origin: string
    destination: string
    search_time: string
    total_options: number
    currency: string
  }
  recommendations: {
    fastest: Rome2RioRoute
    cheapest: Rome2RioRoute
    most_eco_friendly: Rome2RioRoute
    most_convenient: Rome2RioRoute
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const departureDate = searchParams.get('departure_date')
    const arrivalDate = searchParams.get('arrival_date')
    const currency = searchParams.get('currency') || 'MYR'
    const language = searchParams.get('language') || 'en'
    const transportTypes = searchParams.get('transport_types')?.split(',') || ['flight', 'train', 'bus', 'car']
    const passengers = parseInt(searchParams.get('passengers') || '1')

    if (!origin || !destination) {
      return NextResponse.json({
        success: false,
        error: 'Origin and destination are required'
      }, { status: 400 })
    }

    // Real Rome2Rio API integration would go here
    if (API_CONFIG.ROME2RIO.API_KEY) {
      const rome2rioUrl = new URL('Search', API_CONFIG.ROME2RIO.BASE_URL)
      rome2rioUrl.searchParams.set('key', API_CONFIG.ROME2RIO.API_KEY)
      rome2rioUrl.searchParams.set('oName', origin)
      rome2rioUrl.searchParams.set('dName', destination)
      rome2rioUrl.searchParams.set('noPax', passengers.toString())
      rome2rioUrl.searchParams.set('currency', currency)
      rome2rioUrl.searchParams.set('lang', language)
      
      if (departureDate) {
        rome2rioUrl.searchParams.set('oTime', departureDate)
      }

      try {
        const response = await fetch(rome2rioUrl.toString())
        const data = await response.json()

        // Process Rome2Rio response and convert to our format
        const processedRoutes = processRome2RioResponse(data, currency)
        
        return NextResponse.json({
          success: true,
          routes: processedRoutes.routes,
          search_metadata: processedRoutes.search_metadata,
          recommendations: processedRoutes.recommendations
        })
      } catch (apiError) {
        console.error('Rome2Rio API error:', apiError)
        // Fall back to mock data
      }
    }

    // Mock data for demonstration - comprehensive multi-modal options
    const mockRoutes: Rome2RioRoute[] = [
      {
        id: 'rome2rio_route_1',
        total_duration: '3h 45m',
        total_distance: 347,
        total_price: {
          amount: 89.50,
          currency
        },
        segments: [
          {
            transport_type: 'flight',
            provider: 'Malaysia Airlines',
            provider_logo: 'https://logos.rome2rio.com/malaysia-airlines.png',
            origin: {
              name: 'Kuala Lumpur International Airport',
              code: 'KUL',
              coordinates: [101.7098, 2.7456]
            },
            destination: {
              name: 'Penang International Airport',
              code: 'PEN',
              coordinates: [100.2767, 5.2972]
            },
            departure_time: '09:30',
            arrival_time: '10:45',
            duration: '1h 15m',
            distance: 287,
            price: {
              amount: 89.50,
              currency
            },
            booking_url: 'https://www.malaysiaairlines.com',
            vehicle_info: {
              type: 'Boeing 737',
              model: '737-800',
              amenities: ['WiFi', 'In-flight meals', 'Entertainment system']
            }
          }
        ],
        carbon_footprint: {
          kg_co2: 45.2,
          comparison: '75% less than driving alone'
        },
        recommended: true,
        provider_info: {
          name: 'Malaysia Airlines',
          logo: 'https://logos.rome2rio.com/malaysia-airlines.png',
          rating: 4.2
        }
      },
      {
        id: 'rome2rio_route_2',
        total_duration: '5h 30m',
        total_distance: 365,
        total_price: {
          amount: 35.00,
          currency
        },
        segments: [
          {
            transport_type: 'bus',
            provider: 'Plusliner',
            provider_logo: 'https://logos.rome2rio.com/plusliner.png',
            origin: {
              name: 'KL Sentral',
              code: 'KLS',
              coordinates: [101.6869, 3.1337]
            },
            destination: {
              name: 'Penang Sentral',
              code: 'PSL',
              coordinates: [100.3989, 5.3662]
            },
            departure_time: '08:00',
            arrival_time: '13:30',
            duration: '5h 30m',
            distance: 365,
            price: {
              amount: 35.00,
              currency
            },
            booking_url: 'https://www.easybook.com',
            vehicle_info: {
              type: 'Luxury Coach',
              model: 'Mercedes-Benz',
              amenities: ['WiFi', 'Reclining seats', 'Air conditioning', 'USB charging']
            },
            station_info: {
              departure_station: 'KL Sentral Bus Terminal',
              arrival_station: 'Penang Sentral Bus Terminal',
              platform: 'Platform 12'
            }
          }
        ],
        carbon_footprint: {
          kg_co2: 28.7,
          comparison: '60% less than flying'
        },
        recommended: false,
        provider_info: {
          name: 'Plusliner',
          logo: 'https://logos.rome2rio.com/plusliner.png',
          rating: 4.1
        }
      },
      {
        id: 'rome2rio_route_3',
        total_duration: '4h 15m',
        total_distance: 358,
        total_price: {
          amount: 65.00,
          currency
        },
        segments: [
          {
            transport_type: 'car',
            provider: 'Self Drive',
            provider_logo: 'https://logos.rome2rio.com/self-drive.png',
            origin: {
              name: 'Kuala Lumpur City Centre',
              code: 'KLCC',
              coordinates: [101.7098, 3.1319]
            },
            destination: {
              name: 'George Town, Penang',
              code: 'GTN',
              coordinates: [100.3364, 5.4141]
            },
            departure_time: '07:00',
            arrival_time: '11:15',
            duration: '4h 15m',
            distance: 358,
            price: {
              amount: 65.00, // Fuel + toll costs
              currency
            },
            vehicle_info: {
              type: 'Personal Vehicle',
              model: 'Various',
              amenities: ['Flexibility', 'Door-to-door', 'Stop anywhere']
            }
          }
        ],
        carbon_footprint: {
          kg_co2: 72.4,
          comparison: 'Baseline for comparison'
        },
        recommended: false,
        provider_info: {
          name: 'Self Drive',
          logo: 'https://logos.rome2rio.com/self-drive.png',
          rating: 4.0
        }
      },
      {
        id: 'rome2rio_route_4',
        total_duration: '6h 45m',
        total_distance: 375,
        total_price: {
          amount: 25.00,
          currency
        },
        segments: [
          {
            transport_type: 'train',
            provider: 'KTM ETS',
            provider_logo: 'https://logos.rome2rio.com/ktm.png',
            origin: {
              name: 'KL Sentral',
              code: 'KLS',
              coordinates: [101.6869, 3.1337]
            },
            destination: {
              name: 'Butterworth Railway Station',
              code: 'BWH',
              coordinates: [100.3608, 5.3886]
            },
            departure_time: '06:00',
            arrival_time: '10:15',
            duration: '4h 15m',
            distance: 365,
            price: {
              amount: 25.00,
              currency
            },
            booking_url: 'https://www.ktmb.com.my',
            vehicle_info: {
              type: 'Electric Train Service (ETS)',
              model: 'ETS Gold',
              amenities: ['WiFi', 'Comfortable seating', 'Food service', 'Power outlets']
            },
            station_info: {
              departure_station: 'KL Sentral Railway Station',
              arrival_station: 'Butterworth Railway Station',
              platform: 'Platform 3'
            }
          },
          {
            transport_type: 'ferry',
            provider: 'Penang Ferry',
            provider_logo: 'https://logos.rome2rio.com/penang-ferry.png',
            origin: {
              name: 'Butterworth Ferry Terminal',
              code: 'BFT',
              coordinates: [100.3608, 5.3886]
            },
            destination: {
              name: 'George Town Ferry Terminal',
              code: 'GFT',
              coordinates: [100.3364, 5.4141]
            },
            departure_time: '10:30',
            arrival_time: '10:45',
            duration: '15m',
            distance: 3,
            price: {
              amount: 0.00, // Free for foot passengers
              currency
            },
            vehicle_info: {
              type: 'Passenger Ferry',
              model: 'Traditional Ferry',
              amenities: ['Scenic views', 'Historical significance', 'Fresh sea breeze']
            }
          },
          {
            transport_type: 'walk',
            provider: 'Walking',
            provider_logo: 'https://logos.rome2rio.com/walk.png',
            origin: {
              name: 'George Town Ferry Terminal',
              code: 'GFT',
              coordinates: [100.3364, 5.4141]
            },
            destination: {
              name: 'George Town Heritage Area',
              code: 'GTH',
              coordinates: [100.3364, 5.4141]
            },
            departure_time: '10:45',
            arrival_time: '11:00',
            duration: '15m',
            distance: 1,
            price: {
              amount: 0.00,
              currency
            }
          }
        ],
        carbon_footprint: {
          kg_co2: 18.5,
          comparison: '74% less than driving, most eco-friendly option'
        },
        recommended: false,
        provider_info: {
          name: 'KTM + Penang Ferry',
          logo: 'https://logos.rome2rio.com/multi-modal.png',
          rating: 3.8
        }
      }
    ]

    // Generate recommendations
    const recommendations = {
      fastest: mockRoutes.reduce((fastest, current) => 
        parseDuration(current.total_duration) < parseDuration(fastest.total_duration) ? current : fastest
      ),
      cheapest: mockRoutes.reduce((cheapest, current) => 
        current.total_price.amount < cheapest.total_price.amount ? current : cheapest
      ),
      most_eco_friendly: mockRoutes.reduce((greenest, current) => 
        current.carbon_footprint.kg_co2 < greenest.carbon_footprint.kg_co2 ? current : greenest
      ),
      most_convenient: mockRoutes.find(route => route.recommended) || mockRoutes[0]
    }

    const response: Rome2RioResponse = {
      success: true,
      routes: mockRoutes,
      search_metadata: {
        origin,
        destination,
        search_time: new Date().toISOString(),
        total_options: mockRoutes.length,
        currency
      },
      recommendations
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Rome2Rio API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transport options'
    }, { status: 500 })
  }
}

// Helper function to process Rome2Rio API response
function processRome2RioResponse(data: any, currency: string): Rome2RioResponse {
  // This would contain the logic to convert Rome2Rio's API format to our standardized format
  // Rome2Rio returns data in their specific format, so we need to transform it
  
  const processedRoutes: Rome2RioRoute[] = data.routes?.map((route: any) => ({
    id: route.id,
    total_duration: route.totalDuration,
    total_distance: route.totalDistance,
    total_price: {
      amount: route.indicativePrice?.price || 0,
      currency: route.indicativePrice?.currency || currency
    },
    segments: route.segments?.map((segment: any) => ({
      transport_type: mapTransportType(segment.segmentKind),
      provider: segment.agencies?.[0]?.name || 'Unknown',
      provider_logo: segment.agencies?.[0]?.iconUrl || '',
      origin: {
        name: segment.depPlace.name,
        code: segment.depPlace.code || '',
        coordinates: [segment.depPlace.lng, segment.depPlace.lat]
      },
      destination: {
        name: segment.arrPlace.name,
        code: segment.arrPlace.code || '',
        coordinates: [segment.arrPlace.lng, segment.arrPlace.lat]
      },
      departure_time: segment.depTime,
      arrival_time: segment.arrTime,
      duration: segment.duration,
      distance: segment.distance,
      price: {
        amount: segment.indicativePrice?.price || 0,
        currency: segment.indicativePrice?.currency || currency
      },
      booking_url: segment.agencies?.[0]?.url
    })) || [],
    carbon_footprint: {
      kg_co2: calculateCarbonFootprint(route),
      comparison: 'Calculated estimate'
    },
    recommended: route.recommended || false,
    provider_info: {
      name: route.agencies?.[0]?.name || 'Multi-modal',
      logo: route.agencies?.[0]?.iconUrl || '',
      rating: 4.0
    }
  })) || []

  return {
    success: true,
    routes: processedRoutes,
    search_metadata: {
      origin: data.oName,
      destination: data.dName,
      search_time: new Date().toISOString(),
      total_options: processedRoutes.length,
      currency
    },
    recommendations: generateRecommendations(processedRoutes)
  }
}

function mapTransportType(segmentKind: string): Rome2RioSegment['transport_type'] {
  const typeMapping: Record<string, Rome2RioSegment['transport_type']> = {
    'flight': 'flight',
    'train': 'train',
    'bus': 'bus',
    'car': 'car',
    'rideshare': 'rideshare',
    'ferry': 'ferry',
    'walk': 'walk'
  }
  return typeMapping[segmentKind] || 'bus'
}

function calculateCarbonFootprint(route: any): number {
  // Simplified carbon footprint calculation
  // In reality, this would be more sophisticated
  const baseEmissions = route.totalDistance * 0.2 // kg CO2 per km
  return Math.round(baseEmissions * 10) / 10
}

function generateRecommendations(routes: Rome2RioRoute[]) {
  return {
    fastest: routes.reduce((fastest, current) => 
      parseDuration(current.total_duration) < parseDuration(fastest.total_duration) ? current : fastest
    ),
    cheapest: routes.reduce((cheapest, current) => 
      current.total_price.amount < cheapest.total_price.amount ? current : cheapest
    ),
    most_eco_friendly: routes.reduce((greenest, current) => 
      current.carbon_footprint.kg_co2 < greenest.carbon_footprint.kg_co2 ? current : greenest
    ),
    most_convenient: routes.find(route => route.recommended) || routes[0]
  }
}

function parseDuration(duration: string): number {
  const parts = duration.match(/(\d+)h\s*(\d+)m/) || duration.match(/(\d+)h/) || duration.match(/(\d+)m/)
  if (!parts) return 0
  
  const hours = parts[1] ? parseInt(parts[1]) : 0
  const minutes = parts[2] ? parseInt(parts[2]) : (parts[1] && duration.includes('m') ? parseInt(parts[1]) : 0)
  
  return hours * 60 + minutes
}