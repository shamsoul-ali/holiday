import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const rapidApiKey = process.env.RAPIDAPI_KEY
    
    if (!rapidApiKey) {
      return NextResponse.json({
        success: false,
        error: 'RapidAPI key not configured'
      }, { status: 500 })
    }

    // Test with a simple, reliable API - WeatherAPI
    const response = await fetch('https://weatherapi-com.p.rapidapi.com/current.json?q=Bangkok', {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    })

    console.log(`RapidAPI Test: Status ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('RapidAPI Error Response:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`,
        details: errorText,
        status_code: response.status
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data,
      message: 'RapidAPI connection test successful',
      api_host: 'weatherapi-com.p.rapidapi.com'
    })

  } catch (error) {
    console.error('RapidAPI Test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}