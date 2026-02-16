import { NextRequest, NextResponse } from 'next/server'
import { sampleDetailedItinerary } from '@/lib/sample-detailed-itinerary'

export async function GET(request: NextRequest) {
  try {
    // Return the detailed sample itinerary for testing
    return NextResponse.json({
      success: true,
      ai_content: "Sample detailed itinerary generated for testing purposes",
      parsed_itineraries: [
        sampleDetailedItinerary,
        {
          ...sampleDetailedItinerary,
          id: `sample-${Date.now()}-2`,
          title: "Bangkok Street Food Adventure",
          destination: "Bangkok, Thailand",
          price: {
            ...sampleDetailedItinerary.price,
            total: 4500,
            perPerson: 2250
          },
          tier: "Budget-Friendly"
        },
        {
          ...sampleDetailedItinerary,
          id: `sample-${Date.now()}-3`,
          title: "Singapore Luxury Experience",
          destination: "Singapore",
          price: {
            ...sampleDetailedItinerary.price,
            total: 12000,
            perPerson: 6000
          },
          tier: "Luxury"
        }
      ],
      user_preferences: {
        destination: "AI-SUGGEST",
        departureCountry: "Malaysia",
        budget: 8000,
        currency: "MYR",
        travelers: 2,
        duration: "5 days",
        style: "cultural",
        interests: ["culture", "food", "sightseeing"],
        groupType: "couple",
        flightClass: "economy"
      }
    })

  } catch (error) {
    console.error('Test itinerary API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load test itinerary',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}