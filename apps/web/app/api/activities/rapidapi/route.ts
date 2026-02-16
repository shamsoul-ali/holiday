import { NextRequest, NextResponse } from 'next/server'
import { rapidAPIService, RapidAPIActivity } from '../../../../lib/rapidapi-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || 'attractions'

    if (!destination) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: destination'
      }, { status: 400 })
    }

    console.log(`RapidAPI Activities: Searching for ${category} in ${destination}`)

    // Search activities using RapidAPI
    const activitiesResponse = await rapidAPIService.searchActivities({
      destination,
      limit,
      category
    })

    if (!activitiesResponse.success) {
      console.error('RapidAPI Activities search failed:', activitiesResponse.error)
      
      // Return fallback activities if API fails
      const fallbackActivities = getFallbackActivities(destination, limit)
      return NextResponse.json({
        success: true,
        data: {
          activities: fallbackActivities,
          total: fallbackActivities.length,
          destination: destination,
          source: 'Fallback Data (RapidAPI unavailable)'
        }
      })
    }

    const activities = activitiesResponse.data || []

    // Transform to match your existing activity interface
    const transformedActivities = activities.map((activity: RapidAPIActivity, index: number) => ({
      id: activity.location_id || `activity_${index}`,
      name: activity.name,
      description: activity.description,
      category: activity.category,
      subcategories: [activity.category],
      rating: activity.rating,
      review_count: activity.review_count,
      price: {
        range: activity.price_range,
        currency: 'USD',
        min: getPriceFromRange(activity.price_range, 'min'),
        max: getPriceFromRange(activity.price_range, 'max'),
        adult: getPriceFromRange(activity.price_range, 'adult'),
        child: getPriceFromRange(activity.price_range, 'child')
      },
      duration: estimateDuration(activity.category),
      location: {
        address: activity.address,
        city: destination,
        coordinates: {
          latitude: 0, // RapidAPI doesn't always provide coordinates
          longitude: 0
        }
      },
      images: activity.photos.length > 0 ? activity.photos : getDefaultImages(activity.category),
      amenities: getActivityAmenities(activity.category),
      booking: {
        required: true,
        advance_booking: true,
        cancellation_policy: 'Free cancellation up to 24 hours before start time',
        min_age: getMinAge(activity.category),
        max_group_size: getMaxGroupSize(activity.category)
      },
      highlights: generateHighlights(activity.name, activity.category),
      inclusions: getInclusions(activity.category),
      contact: {
        phone: activity.phone || '+1-000-000-0000',
        website: activity.website || 'https://example.com',
        email: 'info@activity.com'
      },
      available_times: getAvailableTimes(activity.category),
      languages: ['English', 'Local Language'],
      accessibility: {
        wheelchair_accessible: Math.random() > 0.5,
        suitable_for_children: activity.category !== 'Nightlife',
        suitable_for_elderly: activity.category !== 'Adventure Sports'
      },
      source: 'rapidapi_tripadvisor'
    }))

    console.log(`RapidAPI Activities: Found ${transformedActivities.length} activities in ${destination}`)

    return NextResponse.json({
      success: true,
      data: {
        activities: transformedActivities,
        total: transformedActivities.length,
        destination: destination,
        category: category,
        source: 'RapidAPI TripAdvisor'
      }
    })

  } catch (error) {
    console.error('RapidAPI Activities API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

function getPriceFromRange(priceRange: string, type: 'min' | 'max' | 'adult' | 'child'): number {
  // Parse price ranges like "$", "$$", "$$$", "$$$$" or actual numbers
  if (priceRange.includes('$')) {
    const level = priceRange.length
    const basePrice = level * 25 // $25 per $ symbol
    
    switch (type) {
      case 'min': return basePrice * 0.5
      case 'max': return basePrice * 1.5
      case 'adult': return basePrice
      case 'child': return basePrice * 0.5
      default: return basePrice
    }
  }
  
  // Try to parse actual numbers from the string
  const numbers = priceRange.match(/\d+/g)
  if (numbers && numbers.length > 0) {
    const basePrice = parseInt(numbers[0])
    
    switch (type) {
      case 'min': return basePrice
      case 'max': return numbers.length > 1 ? parseInt(numbers[1]) : basePrice * 2
      case 'adult': return basePrice
      case 'child': return Math.round(basePrice * 0.5)
      default: return basePrice
    }
  }
  
  // Default pricing
  return type === 'child' ? 25 : 50
}

function estimateDuration(category: string): string {
  const durations: { [key: string]: string } = {
    'Museums': '2-3 hours',
    'Historical Sites': '1-2 hours',
    'Tours': '3-4 hours',
    'Outdoor Activities': '4-6 hours',
    'Cultural Experiences': '2-3 hours',
    'Adventure Sports': '3-5 hours',
    'Food & Drink': '2-3 hours',
    'Entertainment': '2-4 hours',
    'Shopping': '2-3 hours',
    'Wellness & Spa': '1-2 hours'
  }
  
  return durations[category] || '2-3 hours'
}

function getDefaultImages(category: string): string[] {
  const imageMap: { [key: string]: string[] } = {
    'Museums': [
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
      'https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800&q=80'
    ],
    'Historical Sites': [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73273?w=800&q=80',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&q=80'
    ],
    'Tours': [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80'
    ]
  }
  
  return imageMap[category] || [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80'
  ]
}

function getActivityAmenities(category: string): string[] {
  const commonAmenities = ['Professional Guide', 'Safety Equipment', 'Insurance Included']
  
  const categoryAmenities: { [key: string]: string[] } = {
    'Museums': ['Audio Guide', 'Educational Materials', 'Gift Shop'],
    'Tours': ['Transportation', 'Refreshments', 'Photo Opportunities'],
    'Adventure Sports': ['Safety Briefing', 'Equipment Rental', 'First Aid'],
    'Cultural Experiences': ['Cultural Demonstration', 'Local Interaction', 'Traditional Materials']
  }
  
  return [...commonAmenities, ...(categoryAmenities[category] || [])]
}

function generateHighlights(name: string, category: string): string[] {
  const highlights = [
    `Experience the best of ${name}`,
    'Professional local guidance',
    'Small group experience',
    'Photo opportunities included'
  ]
  
  if (category === 'Historical Sites') {
    highlights.push('Learn about local history and culture')
  }
  
  if (category === 'Adventure Sports') {
    highlights.push('Adrenaline-pumping adventure')
    highlights.push('Safety equipment provided')
  }
  
  return highlights
}

function getInclusions(category: string): string[] {
  const baseInclusions = ['Professional guide', 'Entry fees', 'Safety briefing']
  
  const categoryInclusions: { [key: string]: string[] } = {
    'Tours': ['Transportation', 'Light refreshments'],
    'Adventure Sports': ['Safety equipment', 'Insurance'],
    'Cultural Experiences': ['Traditional materials', 'Cultural demonstration'],
    'Food & Drink': ['Food tasting', 'Recipe cards']
  }
  
  return [...baseInclusions, ...(categoryInclusions[category] || [])]
}

function getAvailableTimes(category: string): string[] {
  const morningAfternoon = ['09:00', '14:00']
  const fullDay = ['08:00', '13:00']
  const eveningTours = ['17:00', '19:00']
  
  if (category === 'Adventure Sports') return fullDay
  if (category === 'Food & Drink') return eveningTours
  return morningAfternoon
}

function getMinAge(category: string): number {
  if (category === 'Adventure Sports') return 12
  if (category === 'Entertainment' || category === 'Nightlife') return 18
  return 0
}

function getMaxGroupSize(category: string): number {
  if (category === 'Adventure Sports') return 8
  if (category === 'Cultural Experiences') return 12
  return 20
}

function getFallbackActivities(destination: string, limit: number) {
  const fallbackActivities = [
    {
      id: 'fallback_1',
      name: `${destination} City Tour`,
      description: `Comprehensive city tour covering the major attractions of ${destination}`,
      category: 'Tours',
      rating: 4.5,
      review_count: 245,
      price: { range: '$$', adult: 50, child: 25 },
      duration: '3-4 hours'
    },
    {
      id: 'fallback_2',
      name: `${destination} Cultural Experience`,
      description: `Immerse yourself in the local culture and traditions of ${destination}`,
      category: 'Cultural Experiences',
      rating: 4.7,
      review_count: 189,
      price: { range: '$$', adult: 40, child: 20 },
      duration: '2-3 hours'
    },
    {
      id: 'fallback_3',
      name: `${destination} Food Tour`,
      description: `Taste the authentic flavors and local cuisine of ${destination}`,
      category: 'Food & Drink',
      rating: 4.6,
      review_count: 312,
      price: { range: '$$$', adult: 60, child: 30 },
      duration: '3-4 hours'
    }
  ]
  
  return fallbackActivities.slice(0, limit)
}