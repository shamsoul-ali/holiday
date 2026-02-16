import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

/**
 * Hotel Search API - Proxies to FastAPI Backend
 * Uses backend's working Amadeus + Google Places integration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const destination = searchParams.get('destination')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = searchParams.get('guests') || '2'

    if (!destination || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required parameters: destination, checkIn, checkOut' },
        { status: 400 }
      )
    }

    console.log(`Proxying hotel search to backend: ${destination} (${checkIn} to ${checkOut})`)

    // Proxy to FastAPI backend
    const backendUrl = new URL(`${BACKEND_URL}/api/hotels/search`)
    backendUrl.searchParams.set('destination', destination)
    backendUrl.searchParams.set('check_in', checkIn)
    backendUrl.searchParams.set('check_out', checkOut)
    backendUrl.searchParams.set('adults', guests)

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Backend hotel search error:', error)
      return NextResponse.json(
        { error: error.detail || 'Hotel search failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`✅ Found ${data.hotels?.length || 0} hotels from backend`)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Hotel search proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error', hotels: [] },
      { status: 500 }
    )
  }
}
