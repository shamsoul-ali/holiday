import { NextRequest, NextResponse } from 'next/server'
import { enhancedRapidAPI } from '../../../../lib/enhanced-rapidapi-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: city'
      }, { status: 400 })
    }

    console.log(`RapidAPI Weather: Getting weather for ${city}`)

    const weatherResponse = await enhancedRapidAPI.getWeatherData(city)

    if (!weatherResponse.success) {
      return NextResponse.json({
        success: false,
        error: weatherResponse.error || 'Failed to get weather data'
      }, { status: 500 })
    }

    // Transform weather data
    const weather = weatherResponse.data
    const transformedWeather = {
      location: {
        name: weather?.location?.name || city,
        country: weather?.location?.country || 'Unknown',
        region: weather?.location?.region || '',
        timezone: weather?.location?.tz_id || ''
      },
      current: {
        temperature: weather?.current?.temp_c || 25,
        condition: weather?.current?.condition?.text || 'Pleasant',
        humidity: weather?.current?.humidity || 65,
        wind_speed: weather?.current?.wind_kph || 10,
        visibility: weather?.current?.vis_km || 10,
        uv_index: weather?.current?.uv || 5,
        feels_like: weather?.current?.feelslike_c || 25
      },
      icon: weather?.current?.condition?.icon || '',
      last_updated: weather?.current?.last_updated || new Date().toISOString()
    }

    console.log(`RapidAPI Weather: Successfully got weather for ${city}`)

    return NextResponse.json({
      success: true,
      data: transformedWeather,
      source: 'RapidAPI WeatherAPI'
    })

  } catch (error) {
    console.error('RapidAPI Weather error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}