import { NextRequest, NextResponse } from 'next/server'
import { enhancedRapidAPI } from '../../../../lib/enhanced-rapidapi-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')

    if (!destination) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: destination'
      }, { status: 400 })
    }

    console.log(`RapidAPI Destinations: Getting comprehensive data for ${destination}`)

    const destinationResponse = await enhancedRapidAPI.getDestinationPackage(destination)

    if (!destinationResponse.success) {
      return NextResponse.json({
        success: false,
        error: destinationResponse.error || 'Failed to get destination data'
      }, { status: 500 })
    }

    const data = destinationResponse.data
    
    // Transform and enhance the destination data
    const enhancedDestination = {
      destination: destination,
      summary: {
        name: destination,
        country: data?.weather?.location?.country || 'Unknown',
        region: data?.weather?.location?.region || '',
        timezone: data?.weather?.location?.tz_id || ''
      },
      weather: data?.weather ? {
        current_temperature: data.weather.current?.temp_c || 25,
        condition: data.weather.current?.condition?.text || 'Pleasant',
        humidity: data.weather.current?.humidity || 65,
        wind_speed: data.weather.current?.wind_kph || 10,
        feels_like: data.weather.current?.feelslike_c || 25,
        uv_index: data.weather.current?.uv || 5,
        icon: data.weather.current?.condition?.icon || ''
      } : {
        current_temperature: 25,
        condition: 'Pleasant',
        humidity: 65,
        wind_speed: 10,
        feels_like: 25,
        uv_index: 5,
        icon: ''
      },
      places: {
        total_found: data?.places?.predictions?.length || 0,
        suggestions: data?.places?.predictions?.slice(0, 5).map((place: any) => ({
          name: place.structured_formatting?.main_text || place.description,
          description: place.description,
          types: place.types || []
        })) || []
      },
      attractions: {
        total_found: data?.attractions?.data?.length || 0,
        cities: data?.attractions?.data?.slice(0, 3).map((city: any) => ({
          name: city.name || city.city,
          population: city.population || 0,
          country: city.country || destination,
          region: city.region || ''
        })) || []
      },
      dining: {
        restaurants_available: data?.restaurants ? true : false,
        data: data?.restaurants || null
      },
      images: {
        available: data?.images ? true : false,
        count: data?.images?.value?.length || 0,
        sample_images: data?.images?.value?.slice(0, 3).map((img: any) => ({
          url: img.url,
          title: img.name || `${destination} attraction`,
          source: img.hostPageDisplayUrl || ''
        })) || []
      },
      travel_tips: generateTravelTips(destination, data),
      best_time_to_visit: getBestTimeToVisit(data?.weather),
      compiled_at: data?.compiled_at || new Date().toISOString()
    }

    console.log(`RapidAPI Destinations: Successfully compiled data for ${destination}`)

    return NextResponse.json({
      success: true,
      data: enhancedDestination,
      source: 'RapidAPI Destination Package'
    })

  } catch (error) {
    console.error('RapidAPI Destinations error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

function generateTravelTips(destination: string, data: any): string[] {
  const tips = [
    `Best explored during comfortable weather conditions`,
    `Local currency exchange recommended for better rates`,
    `Try local cuisine for authentic ${destination} experience`,
    `Book accommodations in advance for better options`,
    `Check local weather before outdoor activities`
  ]

  // Add weather-specific tips
  if (data?.weather) {
    const temp = data.weather.current?.temp_c || 25
    const humidity = data.weather.current?.humidity || 65
    
    if (temp > 30) {
      tips.push('Stay hydrated and wear sun protection - high temperatures expected')
    }
    if (temp < 15) {
      tips.push('Pack warm clothing - cooler temperatures expected')
    }
    if (humidity > 80) {
      tips.push('High humidity - lightweight, breathable clothing recommended')
    }
  }

  return tips
}

function getBestTimeToVisit(weather: any): string {
  if (!weather) return 'Year-round destination with generally pleasant weather'
  
  const temp = weather.current?.temp_c || 25
  const condition = weather.current?.condition?.text || ''
  
  if (temp >= 20 && temp <= 28 && !condition.toLowerCase().includes('rain')) {
    return 'Excellent time to visit - ideal weather conditions'
  } else if (temp > 28) {
    return 'Warm season - great for indoor attractions and evening activities'
  } else if (temp < 20) {
    return 'Cool season - perfect for outdoor exploration and sightseeing'
  } else {
    return 'Good time to visit - check local weather for daily planning'
  }
}