import { NextRequest, NextResponse } from 'next/server'
import { rapidAPIService, RapidAPIFlight } from '../../../../lib/rapidapi-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const departureDate = searchParams.get('departure_date') || searchParams.get('departureDate')
    const returnDate = searchParams.get('return_date') || searchParams.get('returnDate')
    const adults = parseInt(searchParams.get('adults') || '1')
    const currency = searchParams.get('currency') || 'USD'
    const cabinClass = searchParams.get('cabin_class') || searchParams.get('class') || 'economy'

    if (!origin || !destination || !departureDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: origin, destination, departure_date'
      }, { status: 400 })
    }

    console.log(`RapidAPI Flights: Searching ${origin} → ${destination} on ${departureDate}${returnDate ? ` returning ${returnDate}` : ''}`)

    // Search flights using RapidAPI
    const flightsResponse = await rapidAPIService.searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      currency,
      cabinClass
    })

    if (!flightsResponse.success) {
      console.error('RapidAPI Flights search failed:', flightsResponse.error)
      return NextResponse.json({
        success: false,
        error: flightsResponse.error || 'Failed to search flights'
      }, { status: 500 })
    }

    const flights = flightsResponse.data || []

    // Transform to match your existing flight interface
    const transformedFlights = flights.map((flight: RapidAPIFlight) => ({
      id: flight.flight_id,
      airline: flight.airline,
      flight_number: generateFlightNumber(flight.airline),
      departure: {
        airport_code: flight.departure.airport,
        airport_name: getAirportName(flight.departure.airport),
        city: getCityFromAirport(flight.departure.airport),
        terminal: 'T1',
        time: flight.departure.time,
        date: flight.departure.date
      },
      arrival: {
        airport_code: flight.arrival.airport,
        airport_name: getAirportName(flight.arrival.airport),
        city: getCityFromAirport(flight.arrival.airport),
        terminal: 'T1',
        time: flight.arrival.time,
        date: flight.arrival.date
      },
      duration: flight.duration,
      stops: flight.stops,
      cabin_class: flight.cabin_class.toUpperCase(),
      price: {
        total: flight.price.amount,
        currency: flight.price.currency,
        per_person: flight.price.amount / adults,
        taxes: Math.round(flight.price.amount * 0.1), // Estimate 10% taxes
        fees: Math.round(flight.price.amount * 0.02)   // Estimate 2% fees
      },
      baggage: {
        carry_on: '7kg',
        checked: cabinClass === 'economy' ? '23kg' : '32kg'
      },
      amenities: getAmenities(flight.cabin_class),
      aircraft: 'Boeing 737', // Default aircraft type
      booking_code: generateBookingCode(),
      availability: Math.floor(Math.random() * 50) + 1, // Random availability
      source: 'rapidapi_skyscanner'
    }))

    console.log(`RapidAPI Flights: Found ${transformedFlights.length} flights for ${origin} → ${destination}`)

    return NextResponse.json({
      success: true,
      data: {
        flights: transformedFlights,
        total: transformedFlights.length,
        origin: origin,
        destination: destination,
        departure_date: departureDate,
        return_date: returnDate,
        adults: adults,
        cabin_class: cabinClass,
        currency: currency,
        source: 'RapidAPI Skyscanner'
      }
    })

  } catch (error) {
    console.error('RapidAPI Flights API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

function generateFlightNumber(airline: string): string {
  const airlineCodes: { [key: string]: string } = {
    'Malaysia Airlines': 'MH',
    'AirAsia': 'AK',
    'Singapore Airlines': 'SQ',
    'Thai Airways': 'TG',
    'Emirates': 'EK',
    'Qatar Airways': 'QR',
    'Cathay Pacific': 'CX'
  }
  
  const code = airlineCodes[airline] || 'XX'
  const number = Math.floor(Math.random() * 9000) + 1000
  return `${code}${number}`
}

function getAirportName(code: string): string {
  const airports: { [key: string]: string } = {
    'KUL': 'Kuala Lumpur International Airport',
    'CGK': 'Soekarno-Hatta International Airport',
    'BKK': 'Suvarnabhumi Airport',
    'DMK': 'Don Mueang International Airport',
    'SIN': 'Singapore Changi Airport',
    'NRT': 'Narita International Airport',
    'ICN': 'Incheon International Airport'
  }
  
  return airports[code] || `${code} International Airport`
}

function getCityFromAirport(code: string): string {
  const cities: { [key: string]: string } = {
    'KUL': 'Kuala Lumpur',
    'CGK': 'Jakarta',
    'BKK': 'Bangkok',
    'DMK': 'Bangkok',
    'SIN': 'Singapore',
    'NRT': 'Tokyo',
    'ICN': 'Seoul'
  }
  
  return cities[code] || 'Unknown City'
}

function getAmenities(cabinClass: string): string[] {
  const economyAmenities = [
    'In-flight entertainment',
    'Meals included',
    'Beverages',
    'WiFi available'
  ]
  
  const businessAmenities = [
    'Priority boarding',
    'Lounge access',
    'Lie-flat seats',
    'Premium meals',
    'Free WiFi',
    'Extra baggage allowance'
  ]
  
  return cabinClass.toLowerCase() === 'business' ? businessAmenities : economyAmenities
}

function generateBookingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}