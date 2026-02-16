import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Transform frontend field names to match backend schema
    const backendRequest = {
      origin: body.origin || 'KUL',
      destination: body.destination,
      start_date: body.start_date || body.startDate || body.departure_date,
      end_date: body.end_date || body.endDate || body.return_date,
      passengers: body.passengers || body.travelers || 2,
      budget_per_person: body.budget_per_person || (body.budget / (body.passengers || body.travelers || 2)),
      travel_style: body.travel_style || body.travelStyle || 'comfort',
      preferences: body.preferences || {},
      special_requirements: body.special_requirements || {}
    }

    console.log('Proxying request to backend:', backendRequest)

    // Forward to FastAPI backend
    const response = await fetch(`${BACKEND_URL}/api/planning/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequest),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Backend error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to create itinerary' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
