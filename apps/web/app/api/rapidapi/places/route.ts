import { NextRequest, NextResponse } from 'next/server'
import { enhancedRapidAPI } from '../../../../lib/enhanced-rapidapi-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const place = searchParams.get('place') || searchParams.get('query')

    if (!place) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: place'
      }, { status: 400 })
    }

    console.log(`RapidAPI Places: Searching for ${place}`)

    const placesResponse = await enhancedRapidAPI.getPlaceInfo(place)

    if (!placesResponse.success) {
      return NextResponse.json({
        success: false,
        error: placesResponse.error || 'Failed to get place information'
      }, { status: 500 })
    }

    const places = placesResponse.data
    const transformedPlaces = {
      query: place,
      predictions: places?.predictions?.map((prediction: any) => ({
        place_id: prediction.place_id,
        description: prediction.description,
        structured_formatting: {
          main_text: prediction.structured_formatting?.main_text || prediction.description,
          secondary_text: prediction.structured_formatting?.secondary_text || ''
        },
        types: prediction.types || [],
        reference: prediction.reference || ''
      })) || [],
      status: places?.status || 'OK'
    }

    console.log(`RapidAPI Places: Found ${transformedPlaces.predictions.length} places for ${place}`)

    return NextResponse.json({
      success: true,
      data: transformedPlaces,
      source: 'RapidAPI Places API'
    })

  } catch (error) {
    console.error('RapidAPI Places error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}