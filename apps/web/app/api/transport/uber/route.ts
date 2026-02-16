import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/api-config'

// Uber Integration for Local Transportation
// Real-time ride estimates, booking, and trip management
// Available in 70+ countries and 900+ cities worldwide

interface UberRideRequest {
  pickup_location: {
    latitude: number
    longitude: number
    address?: string
  }
  destination: {
    latitude: number
    longitude: number
    address?: string
  }
  product_types?: string[] // ['UberX', 'UberXL', 'UberBlack', 'UberPool']
  passengers?: number
  scheduled_time?: string // For future bookings
  currency?: string
}

interface UberProduct {
  product_id: string
  display_name: string
  description: string
  capacity: number
  image_url: string
  price_details: {
    service_fees: number[]
    cost_per_minute: number
    distance_unit: string
    cost_per_distance_unit: number
    base_price: number
    cancellation_fee: number
    currency_code: string
    minimum_charge: number
  }
  price_estimate: {
    low_estimate: number
    high_estimate: number
    currency_code: string
    estimate: string
    surge_multiplier: number
  }
  time_estimate: {
    pickup_estimate: number // seconds
    duration_estimate: number // seconds
  }
  available: boolean
  shared: boolean
  eco_friendly: boolean
}

interface UberRideEstimate {
  trip_id: string
  pickup_location: {
    latitude: number
    longitude: number
    address: string
  }
  destination: {
    latitude: number
    longitude: number  
    address: string
  }
  distance: {
    value: number
    unit: string
    text: string
  }
  duration: {
    value: number
    unit: string
    text: string
  }
  products: UberProduct[]
  recommendations: {
    most_popular: UberProduct
    cheapest: UberProduct
    fastest: UberProduct
    most_comfortable: UberProduct
  }
  surge_pricing: {
    active: boolean
    multiplier: number
    message: string
  }
  airport_surcharge?: {
    amount: number
    currency: string
  }
}

interface UberResponse {
  success: boolean
  ride_estimates: UberRideEstimate[]
  search_metadata: {
    pickup_address: string
    destination_address: string
    search_time: string
    currency: string
    city: string
    country: string
  }
  booking_info: {
    deep_link: string
    web_link: string
    booking_available: boolean
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse pickup location
    const pickupLat = parseFloat(searchParams.get('pickup_lat') || '0')
    const pickupLng = parseFloat(searchParams.get('pickup_lng') || '0')
    const pickupAddress = searchParams.get('pickup_address')
    
    // Parse destination
    const destLat = parseFloat(searchParams.get('dest_lat') || '0')
    const destLng = parseFloat(searchParams.get('dest_lng') || '0')
    const destAddress = searchParams.get('dest_address')
    
    const productTypes = searchParams.get('product_types')?.split(',') || ['UberX', 'UberXL']
    const passengers = parseInt(searchParams.get('passengers') || '1')
    const currency = searchParams.get('currency') || 'MYR'
    const scheduledTime = searchParams.get('scheduled_time')

    if (!pickupLat || !pickupLng || !destLat || !destLng) {
      return NextResponse.json({
        success: false,
        error: 'Pickup and destination coordinates are required'
      }, { status: 400 })
    }

    // Real Uber API integration would go here
    if (API_CONFIG.UBER.API_KEY) {
      try {
        // Get price estimates
        const priceUrl = new URL('https://api.uber.com/v1.2/estimates/price')
        priceUrl.searchParams.set('start_latitude', pickupLat.toString())
        priceUrl.searchParams.set('start_longitude', pickupLng.toString())
        priceUrl.searchParams.set('end_latitude', destLat.toString())
        priceUrl.searchParams.set('end_longitude', destLng.toString())

        const priceResponse = await fetch(priceUrl.toString(), {
          headers: {
            'Authorization': `Token ${API_CONFIG.UBER.API_KEY}`,
            'Accept-Language': 'en_US',
            'Content-Type': 'application/json'
          }
        })

        // Get time estimates
        const timeUrl = new URL('https://api.uber.com/v1.2/estimates/time')
        timeUrl.searchParams.set('start_latitude', pickupLat.toString())
        timeUrl.searchParams.set('start_longitude', pickupLng.toString())

        const timeResponse = await fetch(timeUrl.toString(), {
          headers: {
            'Authorization': `Token ${API_CONFIG.UBER.API_KEY}`,
            'Accept-Language': 'en_US',
            'Content-Type': 'application/json'
          }
        })

        if (priceResponse.ok && timeResponse.ok) {
          const priceData = await priceResponse.json()
          const timeData = await timeResponse.json()
          
          const processedData = processUberApiResponse(priceData, timeData, {
            pickupLat, pickupLng, destLat, destLng, 
            pickupAddress, destAddress, currency
          })
          
          return NextResponse.json(processedData)
        }
      } catch (apiError) {
        console.error('Uber API error:', apiError)
        // Fall back to mock data
      }
    }

    // Mock data for demonstration - comprehensive Uber product offerings
    const mockProducts: UberProduct[] = [
      {
        product_id: 'uber_x_kl',
        display_name: 'UberX',
        description: 'Affordable rides for up to 4 people',
        capacity: 4,
        image_url: 'https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberx.png',
        price_details: {
          service_fees: [2.50],
          cost_per_minute: 0.35,
          distance_unit: 'km',
          cost_per_distance_unit: 1.25,
          base_price: 3.50,
          cancellation_fee: 5.00,
          currency_code: currency,
          minimum_charge: 8.00
        },
        price_estimate: {
          low_estimate: 12.50,
          high_estimate: 16.50,
          currency_code: currency,
          estimate: `${currency} 12.50-16.50`,
          surge_multiplier: 1.0
        },
        time_estimate: {
          pickup_estimate: 420, // 7 minutes
          duration_estimate: 900 // 15 minutes
        },
        available: true,
        shared: false,
        eco_friendly: false
      },
      {
        product_id: 'uber_xl_kl',
        display_name: 'UberXL',
        description: 'Spacious rides for up to 6 people',
        capacity: 6,
        image_url: 'https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberxl.png',
        price_details: {
          service_fees: [3.00],
          cost_per_minute: 0.45,
          distance_unit: 'km',
          cost_per_distance_unit: 1.55,
          base_price: 4.50,
          cancellation_fee: 5.00,
          currency_code: currency,
          minimum_charge: 12.00
        },
        price_estimate: {
          low_estimate: 18.00,
          high_estimate: 23.50,
          currency_code: currency,
          estimate: `${currency} 18.00-23.50`,
          surge_multiplier: 1.0
        },
        time_estimate: {
          pickup_estimate: 480, // 8 minutes
          duration_estimate: 900 // 15 minutes
        },
        available: true,
        shared: false,
        eco_friendly: false
      },
      {
        product_id: 'uber_comfort_kl',
        display_name: 'Uber Comfort',
        description: 'Premium rides with newer cars and top drivers',
        capacity: 4,
        image_url: 'https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-comfort.png',
        price_details: {
          service_fees: [3.50],
          cost_per_minute: 0.50,
          distance_unit: 'km',
          cost_per_distance_unit: 1.75,
          base_price: 5.00,
          cancellation_fee: 5.00,
          currency_code: currency,
          minimum_charge: 15.00
        },
        price_estimate: {
          low_estimate: 22.00,
          high_estimate: 28.50,
          currency_code: currency,
          estimate: `${currency} 22.00-28.50`,
          surge_multiplier: 1.0
        },
        time_estimate: {
          pickup_estimate: 360, // 6 minutes
          duration_estimate: 900 // 15 minutes
        },
        available: true,
        shared: false,
        eco_friendly: false
      },
      {
        product_id: 'uber_pool_kl',
        display_name: 'UberPool',
        description: 'Share the ride and split the cost',
        capacity: 2,
        image_url: 'https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-pool.png',
        price_details: {
          service_fees: [1.50],
          cost_per_minute: 0.25,
          distance_unit: 'km',
          cost_per_distance_unit: 0.95,
          base_price: 2.50,
          cancellation_fee: 5.00,
          currency_code: currency,
          minimum_charge: 6.00
        },
        price_estimate: {
          low_estimate: 8.50,
          high_estimate: 11.00,
          currency_code: currency,
          estimate: `${currency} 8.50-11.00`,
          surge_multiplier: 1.0
        },
        time_estimate: {
          pickup_estimate: 600, // 10 minutes
          duration_estimate: 1200 // 20 minutes (including stops)
        },
        available: true,
        shared: true,
        eco_friendly: true
      },
      {
        product_id: 'uber_green_kl',
        display_name: 'Uber Green',
        description: 'Low-emission vehicles for eco-friendly rides',
        capacity: 4,
        image_url: 'https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-green.png',
        price_details: {
          service_fees: [2.50],
          cost_per_minute: 0.35,
          distance_unit: 'km',
          cost_per_distance_unit: 1.25,
          base_price: 3.50,
          cancellation_fee: 5.00,
          currency_code: currency,
          minimum_charge: 8.00
        },
        price_estimate: {
          low_estimate: 12.50,
          high_estimate: 16.50,
          currency_code: currency,
          estimate: `${currency} 12.50-16.50`,
          surge_multiplier: 1.0
        },
        time_estimate: {
          pickup_estimate: 540, // 9 minutes
          duration_estimate: 900 // 15 minutes
        },
        available: true,
        shared: false,
        eco_friendly: true
      }
    ]

    // Filter products based on passenger count
    const availableProducts = mockProducts.filter(product => 
      product.capacity >= passengers && 
      (productTypes.includes(product.display_name) || productTypes.length === 0)
    )

    // Generate recommendations
    const recommendations = {
      most_popular: availableProducts.find(p => p.display_name === 'UberX') || availableProducts[0],
      cheapest: availableProducts.reduce((cheapest, current) => 
        current.price_estimate.low_estimate < cheapest.price_estimate.low_estimate ? current : cheapest
      ),
      fastest: availableProducts.reduce((fastest, current) => 
        current.time_estimate.pickup_estimate < fastest.time_estimate.pickup_estimate ? current : fastest
      ),
      most_comfortable: availableProducts.find(p => p.display_name === 'Uber Comfort') || 
                      availableProducts.reduce((comfortable, current) => 
        current.price_estimate.high_estimate > comfortable.price_estimate.high_estimate ? current : comfortable
      )
    }

    const rideEstimate: UberRideEstimate = {
      trip_id: `uber_estimate_${Date.now()}`,
      pickup_location: {
        latitude: pickupLat,
        longitude: pickupLng,
        address: pickupAddress || `${pickupLat}, ${pickupLng}`
      },
      destination: {
        latitude: destLat,
        longitude: destLng,
        address: destAddress || `${destLat}, ${destLng}`
      },
      distance: {
        value: 8.5,
        unit: 'km',
        text: '8.5 km'
      },
      duration: {
        value: 15,
        unit: 'minutes',
        text: '15 min'
      },
      products: availableProducts,
      recommendations,
      surge_pricing: {
        active: false,
        multiplier: 1.0,
        message: 'No surge pricing currently'
      }
    }

    // Check if location is near airport (example for KLIA)
    const kliaCoords = { lat: 2.7456, lng: 101.7098 }
    const isNearAirport = calculateDistance(pickupLat, pickupLng, kliaCoords.lat, kliaCoords.lng) < 10 ||
                         calculateDistance(destLat, destLng, kliaCoords.lat, kliaCoords.lng) < 10
    
    if (isNearAirport) {
      rideEstimate.airport_surcharge = {
        amount: 5.00,
        currency
      }
    }

    const response: UberResponse = {
      success: true,
      ride_estimates: [rideEstimate],
      search_metadata: {
        pickup_address: pickupAddress || `${pickupLat}, ${pickupLng}`,
        destination_address: destAddress || `${destLat}, ${destLng}`,
        search_time: new Date().toISOString(),
        currency,
        city: 'Kuala Lumpur',
        country: 'Malaysia'
      },
      booking_info: {
        deep_link: `uber://?action=setPickup&pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&dropoff[latitude]=${destLat}&dropoff[longitude]=${destLng}`,
        web_link: `https://m.uber.com/ul/?pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&dropoff[latitude]=${destLat}&dropoff[longitude]=${destLng}`,
        booking_available: true
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Uber API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get Uber ride estimates'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, pickup_location, destination, scheduled_time } = body

    if (!product_id || !pickup_location || !destination) {
      return NextResponse.json({
        success: false,
        error: 'Product ID, pickup location, and destination are required'
      }, { status: 400 })
    }

    // Real Uber booking would go here
    if (API_CONFIG.UBER.API_KEY) {
      try {
        const bookingResponse = await fetch('https://api.uber.com/v1.2/requests', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_CONFIG.UBER.API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id,
            start_latitude: pickup_location.latitude,
            start_longitude: pickup_location.longitude,
            end_latitude: destination.latitude,
            end_longitude: destination.longitude,
            scheduled_time: scheduled_time ? new Date(scheduled_time).getTime() / 1000 : undefined
          })
        })

        if (bookingResponse.ok) {
          const bookingData = await bookingResponse.json()
          
          return NextResponse.json({
            success: true,
            booking: {
              request_id: bookingData.request_id,
              status: bookingData.status,
              driver: bookingData.driver,
              vehicle: bookingData.vehicle,
              location: bookingData.location,
              eta: bookingData.eta,
              surge_multiplier: bookingData.surge_multiplier
            }
          })
        }
      } catch (apiError) {
        console.error('Uber booking API error:', apiError)
      }
    }

    // Mock booking response
    return NextResponse.json({
      success: true,
      booking: {
        request_id: `uber_booking_${Date.now()}`,
        status: 'accepted',
        driver: {
          name: 'Ahmad Rahman',
          phone_number: '+60123456789',
          rating: 4.8,
          picture_url: 'https://d1a3f4spazzrp4.cloudfront.net/driver-profile.jpg'
        },
        vehicle: {
          make: 'Toyota',
          model: 'Vios',
          license_plate: 'WBE 1234',
          color: 'White'
        },
        location: {
          latitude: pickup_location.latitude + 0.001,
          longitude: pickup_location.longitude + 0.001,
          bearing: 180
        },
        eta: 420, // 7 minutes
        surge_multiplier: 1.0
      }
    })

  } catch (error) {
    console.error('Uber booking error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to book Uber ride'
    }, { status: 500 })
  }
}

// Helper function to process real Uber API response
function processUberApiResponse(priceData: any, timeData: any, params: any): UberResponse {
  const products: UberProduct[] = priceData.prices?.map((price: any, index: number) => {
    const timeEstimate = timeData.times?.find((time: any) => time.product_id === price.product_id)
    
    return {
      product_id: price.product_id,
      display_name: price.localized_display_name,
      description: price.high_estimate > 0 ? `${price.estimate}` : 'Price unavailable',
      capacity: getProductCapacity(price.localized_display_name),
      image_url: getProductImage(price.localized_display_name),
      price_details: {
        service_fees: [],
        cost_per_minute: 0,
        distance_unit: price.distance_unit || 'km',
        cost_per_distance_unit: 0,
        base_price: 0,
        cancellation_fee: 0,
        currency_code: price.currency_code,
        minimum_charge: 0
      },
      price_estimate: {
        low_estimate: price.low_estimate || 0,
        high_estimate: price.high_estimate || 0,
        currency_code: price.currency_code,
        estimate: price.estimate,
        surge_multiplier: price.surge_multiplier || 1.0
      },
      time_estimate: {
        pickup_estimate: timeEstimate?.estimate || 0,
        duration_estimate: price.duration || 0
      },
      available: price.high_estimate > 0,
      shared: price.localized_display_name.toLowerCase().includes('pool'),
      eco_friendly: price.localized_display_name.toLowerCase().includes('green')
    }
  }) || []

  return {
    success: true,
    ride_estimates: [{
      trip_id: `uber_${Date.now()}`,
      pickup_location: {
        latitude: params.pickupLat,
        longitude: params.pickupLng,
        address: params.pickupAddress || ''
      },
      destination: {
        latitude: params.destLat,
        longitude: params.destLng,
        address: params.destAddress || ''
      },
      distance: { value: 0, unit: 'km', text: '0 km' },
      duration: { value: 0, unit: 'minutes', text: '0 min' },
      products,
      recommendations: generateUberRecommendations(products),
      surge_pricing: {
        active: products.some(p => p.price_estimate.surge_multiplier > 1.0),
        multiplier: Math.max(...products.map(p => p.price_estimate.surge_multiplier)),
        message: 'Current pricing'
      }
    }],
    search_metadata: {
      pickup_address: params.pickupAddress || '',
      destination_address: params.destAddress || '',
      search_time: new Date().toISOString(),
      currency: params.currency,
      city: 'Current City',
      country: 'Current Country'
    },
    booking_info: {
      deep_link: `uber://?action=setPickup&pickup[latitude]=${params.pickupLat}&pickup[longitude]=${params.pickupLng}&dropoff[latitude]=${params.destLat}&dropoff[longitude]=${params.destLng}`,
      web_link: `https://m.uber.com/ul/?pickup[latitude]=${params.pickupLat}&pickup[longitude]=${params.pickupLng}&dropoff[latitude]=${params.destLat}&dropoff[longitude]=${params.destLng}`,
      booking_available: true
    }
  }
}

function getProductCapacity(displayName: string): number {
  if (displayName.toLowerCase().includes('xl')) return 6
  if (displayName.toLowerCase().includes('pool')) return 2
  return 4
}

function getProductImage(displayName: string): string {
  const name = displayName.toLowerCase()
  if (name.includes('xl')) return 'https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberxl.png'
  if (name.includes('pool')) return 'https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-pool.png'
  if (name.includes('comfort')) return 'https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-comfort.png'
  if (name.includes('green')) return 'https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-green.png'
  return 'https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberx.png'
}

function generateUberRecommendations(products: UberProduct[]) {
  return {
    most_popular: products.find(p => p.display_name.includes('UberX')) || products[0],
    cheapest: products.reduce((cheapest, current) => 
      current.price_estimate.low_estimate < cheapest.price_estimate.low_estimate ? current : cheapest
    ),
    fastest: products.reduce((fastest, current) => 
      current.time_estimate.pickup_estimate < fastest.time_estimate.pickup_estimate ? current : fastest
    ),
    most_comfortable: products.find(p => p.display_name.includes('Comfort')) || 
                      products.reduce((comfortable, current) => 
      current.price_estimate.high_estimate > comfortable.price_estimate.high_estimate ? current : comfortable
    )
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}