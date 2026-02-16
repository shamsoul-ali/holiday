import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

/**
 * Flight Search API - Proxies to FastAPI Backend
 * This eliminates duplicate Amadeus logic and uses the working backend implementation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const origin = searchParams.get('origin') || 'KUL'
    const destination = searchParams.get('destination')
    const departureDate = searchParams.get('departureDate')
    const returnDate = searchParams.get('returnDate')
    const passengers = searchParams.get('passengers') || '1'

    if (!destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: destination, departureDate' },
        { status: 400 }
      )
    }

    console.log(`Proxying flight search to backend: ${origin} → ${destination}`)

    // Proxy to FastAPI backend
    const backendUrl = new URL(`${BACKEND_URL}/api/flights/search`)
    backendUrl.searchParams.set('origin', origin)
    backendUrl.searchParams.set('destination', destination)
    backendUrl.searchParams.set('departure_date', departureDate)
    if (returnDate) backendUrl.searchParams.set('return_date', returnDate)
    backendUrl.searchParams.set('adults', passengers)

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Backend flight search error:', error)
      return NextResponse.json(
        { error: error.detail || 'Flight search failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`✅ Found ${data.flights?.length || 0} flights from backend`)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Flight search proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error', flights: [] },
      { status: 500 }
    )
  }
}
