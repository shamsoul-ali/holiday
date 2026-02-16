import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/api-config'

// GetYourGuide Integration for Premium Activities & Experiences
// 100,000+ activities across 170+ countries
// Tours, attractions, food experiences, outdoor activities

interface GetYourGuideSearchRequest {
  destination: string
  destination_id?: string
  latitude?: number
  longitude?: number
  activity_types?: string[] // ['tours', 'attractions', 'food', 'outdoor', 'culture', 'adventure']
  date?: string
  duration_min?: number // minutes
  duration_max?: number // minutes
  price_min?: number
  price_max?: number
  group_size?: number
  language?: string[]
  currency?: string
  rating_min?: number
  instant_confirmation?: boolean
  free_cancellation?: boolean
  skip_the_line?: boolean
  limit?: number
}

interface GetYourGuideActivity {
  id: string
  title: string
  description: {
    short: string
    detailed: string
    highlights: string[]
    inclusions: string[]
    exclusions: string[]
    important_info: string[]
  }
  location: {
    city: string
    country: string
    address: string
    meeting_point: string
    coordinates: {
      latitude: number
      longitude: number
    }
  }
  images: {
    main: string
    gallery: string[]
    video_url?: string
  }
  pricing: {
    from_price: number
    currency: string
    adult_price: number
    child_price?: number
    youth_price?: number
    senior_price?: number
    group_discount?: {
      min_size: number
      discount_percent: number
    }
  }
  duration: {
    total_minutes: number
    formatted: string
    flexible: boolean
  }
  availability: {
    next_available_date: string
    booking_cutoff: string // how far in advance to book
    instant_confirmation: boolean
    likely_to_sell_out: boolean
  }
  features: {
    free_cancellation: boolean
    mobile_ticket: boolean
    skip_the_line: boolean
    audio_guide: boolean
    live_guide: boolean
    pickup_service: boolean
    wheelchair_accessible: boolean
    suitable_for_children: boolean
  }
  rating: {
    average: number
    count: number
    distribution: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }
  category: {
    primary: string
    secondary: string[]
    tags: string[]
  }
  languages: string[]
  supplier: {
    name: string
    logo: string
    rating: number
    verified: boolean
  }
  booking_info: {
    booking_url: string
    deep_link: string
    commission_rate: number
  }
}

interface GetYourGuideRecommendations {
  most_popular: GetYourGuideActivity
  best_value: GetYourGuideActivity
  highest_rated: GetYourGuideActivity
  best_for_families: GetYourGuideActivity
  unique_experiences: GetYourGuideActivity[]
  trending_now: GetYourGuideActivity[]
}

interface GetYourGuideResponse {
  success: boolean
  activities: GetYourGuideActivity[]
  total_count: number
  search_metadata: {
    destination: string
    search_date: string
    currency: string
    filters_applied: any
    search_radius: number
  }
  recommendations: GetYourGuideRecommendations
  featured_collections: {
    name: string
    activities: GetYourGuideActivity[]
  }[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')
    const destinationId = searchParams.get('destination_id')
    const latitude = searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined
    const longitude = searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined
    const activityTypes = searchParams.get('activity_types')?.split(',') || ['tours', 'attractions']
    const date = searchParams.get('date')
    const durationMin = searchParams.get('duration_min') ? parseInt(searchParams.get('duration_min')!) : undefined
    const durationMax = searchParams.get('duration_max') ? parseInt(searchParams.get('duration_max')!) : undefined
    const priceMin = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : undefined
    const priceMax = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : undefined
    const groupSize = parseInt(searchParams.get('group_size') || '2')
    const languages = searchParams.get('language')?.split(',') || ['en']
    const currency = searchParams.get('currency') || 'MYR'
    const ratingMin = searchParams.get('rating_min') ? parseFloat(searchParams.get('rating_min')!) : undefined
    const instantConfirmation = searchParams.get('instant_confirmation') === 'true'
    const freeCancellation = searchParams.get('free_cancellation') === 'true'
    const skipTheLine = searchParams.get('skip_the_line') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!destination && !destinationId && (!latitude || !longitude)) {
      return NextResponse.json({
        success: false,
        error: 'Destination name, destination ID, or coordinates are required'
      }, { status: 400 })
    }

    // Real GetYourGuide API integration would go here
    if (API_CONFIG.GETYOURGUIDE.API_KEY) {
      try {
        const gygUrl = new URL(`${API_CONFIG.GETYOURGUIDE.BASE_URL}/activities`)
        
        if (destinationId) gygUrl.searchParams.set('destination_id', destinationId)
        if (destination) gygUrl.searchParams.set('q', destination)
        if (latitude && longitude) {
          gygUrl.searchParams.set('latitude', latitude.toString())
          gygUrl.searchParams.set('longitude', longitude.toString())
        }
        
        gygUrl.searchParams.set('currency', currency)
        gygUrl.searchParams.set('limit', limit.toString())
        if (date) gygUrl.searchParams.set('date', date)
        if (languages.length) gygUrl.searchParams.set('language', languages.join(','))

        const response = await fetch(gygUrl.toString(), {
          headers: {
            'Authorization': `Bearer ${API_CONFIG.GETYOURGUIDE.API_KEY}`,
            'Content-Type': 'application/json',
            'User-Agent': 'HolidayAI/1.0'
          }
        })

        if (response.ok) {
          const data = await response.json()
          const processedData = processGetYourGuideResponse(data, currency)
          return NextResponse.json(processedData)
        }
      } catch (apiError) {
        console.error('GetYourGuide API error:', apiError)
        // Fall back to mock data
      }
    }

    // Mock data for demonstration - comprehensive GetYourGuide offerings for Kuala Lumpur
    const mockActivities: GetYourGuideActivity[] = [
      {
        id: 'gyg_kl_towers_tour',
        title: 'Kuala Lumpur: Petronas Twin Towers & KL Tower Skip-the-Line Tour',
        description: {
          short: 'Skip the lines and discover KL\'s iconic towers with stunning city views and cultural insights.',
          detailed: 'Experience the best of Kuala Lumpur\'s skyline with this comprehensive tour of the city\'s most famous landmarks. Start at the iconic Petronas Twin Towers, where you\'ll skip the long queues and head straight to the Skybridge and Observation Deck for breathtaking panoramic views. Then visit KL Tower for another perspective of the bustling metropolis below.',
          highlights: [
            'Skip-the-line access to Petronas Twin Towers Skybridge',
            'Panoramic city views from KL Tower observation deck',
            'Professional guide with insider knowledge',
            'Photo opportunities at the best vantage points',
            'Learn about Malaysian architecture and culture'
          ],
          inclusions: [
            'Skip-the-line tickets to Petronas Twin Towers',
            'KL Tower observation deck admission',
            'Professional English-speaking guide',
            'Air-conditioned transportation',
            'Hotel pickup and drop-off (selected hotels)',
            'Complimentary bottled water'
          ],
          exclusions: [
            'Meals and refreshments',
            'Personal expenses',
            'Gratuities',
            'Hotel pickup from non-selected hotels'
          ],
          important_info: [
            'Dress code: Smart casual, no shorts or sleeveless tops',
            'Bring valid ID for tower entry',
            'Tour operates in all weather conditions',
            'Not suitable for people with mobility issues'
          ]
        },
        location: {
          city: 'Kuala Lumpur',
          country: 'Malaysia',
          address: 'Petronas Twin Towers, KLCC',
          meeting_point: 'KLCC Park, main entrance near the fountains',
          coordinates: {
            latitude: 3.1570,
            longitude: 101.7116
          }
        },
        images: {
          main: 'https://cdn.getyourguide.com/img/tour/petronas-towers-main.jpg',
          gallery: [
            'https://cdn.getyourguide.com/img/tour/petronas-towers-1.jpg',
            'https://cdn.getyourguide.com/img/tour/petronas-towers-2.jpg',
            'https://cdn.getyourguide.com/img/tour/kl-tower-view.jpg'
          ],
          video_url: 'https://cdn.getyourguide.com/video/kl-towers-tour.mp4'
        },
        pricing: {
          from_price: 89.00,
          currency,
          adult_price: 89.00,
          child_price: 65.00,
          youth_price: 79.00,
          group_discount: {
            min_size: 6,
            discount_percent: 10
          }
        },
        duration: {
          total_minutes: 240,
          formatted: '4 hours',
          flexible: false
        },
        availability: {
          next_available_date: '2024-03-16',
          booking_cutoff: '24 hours in advance',
          instant_confirmation: true,
          likely_to_sell_out: true
        },
        features: {
          free_cancellation: true,
          mobile_ticket: true,
          skip_the_line: true,
          audio_guide: false,
          live_guide: true,
          pickup_service: true,
          wheelchair_accessible: false,
          suitable_for_children: true
        },
        rating: {
          average: 4.6,
          count: 2847,
          distribution: {
            5: 1823,
            4: 731,
            3: 198,
            2: 67,
            1: 28
          }
        },
        category: {
          primary: 'Sightseeing',
          secondary: ['City Tours', 'Skip-the-line'],
          tags: ['towers', 'skyline', 'architecture', 'views', 'iconic']
        },
        languages: ['en', 'ms', 'zh'],
        supplier: {
          name: 'KL Premium Tours',
          logo: 'https://cdn.getyourguide.com/supplier/kl-premium.png',
          rating: 4.8,
          verified: true
        },
        booking_info: {
          booking_url: 'https://www.getyourguide.com/kuala-lumpur-l150/towers-tour-t123456',
          deep_link: 'getyourguide://activity/123456',
          commission_rate: 8.5
        }
      },
      {
        id: 'gyg_kl_food_tour',
        title: 'Kuala Lumpur: Street Food & Night Market Cultural Experience',
        description: {
          short: 'Discover authentic Malaysian flavors on this guided food tour through vibrant night markets and street stalls.',
          detailed: 'Embark on a culinary adventure through Kuala Lumpur\'s most beloved food scenes. This evening tour takes you to bustling night markets and hidden street food gems where locals eat. Sample over 10 different Malaysian dishes while learning about the multicultural influences that shape the country\'s cuisine.',
          highlights: [
            'Visit 4+ authentic food locations',
            'Try 10+ traditional Malaysian dishes',
            'Learn about multicultural food heritage',
            'Explore vibrant night markets',
            'Meet local food vendors and hear their stories'
          ],
          inclusions: [
            'Professional foodie guide',
            'All food tastings included',
            'Cultural explanations and stories',
            'Night market entrance fees',
            'Bottled water'
          ],
          exclusions: [
            'Additional food purchases',
            'Alcoholic beverages',
            'Transportation to meeting point',
            'Hotel pickup and drop-off'
          ],
          important_info: [
            'Vegetarian and halal options available',
            'Inform guide of dietary restrictions',
            'Wear comfortable walking shoes',
            'Bring appetite - lots of food included!'
          ]
        },
        location: {
          city: 'Kuala Lumpur',
          country: 'Malaysia',
          address: 'Jalan Alor Food Street',
          meeting_point: 'Jalan Alor entrance, near Wong Ah Wah restaurant',
          coordinates: {
            latitude: 3.1478,
            longitude: 101.7089
          }
        },
        images: {
          main: 'https://cdn.getyourguide.com/img/tour/kl-food-tour-main.jpg',
          gallery: [
            'https://cdn.getyourguide.com/img/tour/street-food-1.jpg',
            'https://cdn.getyourguide.com/img/tour/night-market.jpg',
            'https://cdn.getyourguide.com/img/tour/local-dishes.jpg'
          ]
        },
        pricing: {
          from_price: 65.00,
          currency,
          adult_price: 65.00,
          child_price: 45.00
        },
        duration: {
          total_minutes: 180,
          formatted: '3 hours',
          flexible: false
        },
        availability: {
          next_available_date: '2024-03-15',
          booking_cutoff: '4 hours in advance',
          instant_confirmation: true,
          likely_to_sell_out: false
        },
        features: {
          free_cancellation: true,
          mobile_ticket: true,
          skip_the_line: false,
          audio_guide: false,
          live_guide: true,
          pickup_service: false,
          wheelchair_accessible: true,
          suitable_for_children: true
        },
        rating: {
          average: 4.8,
          count: 1456,
          distribution: {
            5: 1167,
            4: 234,
            3: 38,
            2: 12,
            1: 5
          }
        },
        category: {
          primary: 'Food & Drink',
          secondary: ['Cultural Tours', 'Night Tours'],
          tags: ['food', 'culture', 'local', 'night markets', 'authentic']
        },
        languages: ['en', 'ms'],
        supplier: {
          name: 'Foodie Adventures KL',
          logo: 'https://cdn.getyourguide.com/supplier/foodie-adventures.png',
          rating: 4.9,
          verified: true
        },
        booking_info: {
          booking_url: 'https://www.getyourguide.com/kuala-lumpur-l150/food-tour-t123457',
          deep_link: 'getyourguide://activity/123457',
          commission_rate: 10.0
        }
      },
      {
        id: 'gyg_batu_caves',
        title: 'From Kuala Lumpur: Batu Caves & Cultural Temple Half-Day Tour',
        description: {
          short: 'Explore the famous Batu Caves limestone formations and Hindu temples on this cultural half-day adventure.',
          detailed: 'Discover one of Malaysia\'s most popular attractions on this comprehensive half-day tour to Batu Caves. Climb the 272 colorful steps to reach the temple caves, marvel at the towering golden statue of Lord Murugan, and learn about Hindu culture and traditions from your knowledgeable guide.',
          highlights: [
            'Climb the famous 272 rainbow steps',
            'Explore ancient limestone cave temples',
            'See the world\'s tallest statue of Lord Murugan',
            'Learn about Hindu religious practices',
            'Visit the Dark Cave for a nature experience'
          ],
          inclusions: [
            'Round-trip transportation from KL',
            'Professional guide',
            'Batu Caves entrance fees',
            'Dark Cave basic tour',
            'Bottled water'
          ],
          exclusions: [
            'Meals',
            'Dark Cave adventure tours (additional cost)',
            'Personal expenses',
            'Gratuities'
          ],
          important_info: [
            'Dress modestly - cover shoulders and knees',
            'Comfortable walking shoes required',
            'Be prepared for monkeys - do not feed them',
            'Steep climb up 272 steps'
          ]
        },
        location: {
          city: 'Gombak',
          country: 'Malaysia',
          address: 'Batu Caves, Gombak',
          meeting_point: 'Hotel pickup available or meet at KL Sentral',
          coordinates: {
            latitude: 3.2379,
            longitude: 101.6840
          }
        },
        images: {
          main: 'https://cdn.getyourguide.com/img/tour/batu-caves-main.jpg',
          gallery: [
            'https://cdn.getyourguide.com/img/tour/batu-caves-steps.jpg',
            'https://cdn.getyourguide.com/img/tour/murugan-statue.jpg',
            'https://cdn.getyourguide.com/img/tour/temple-interior.jpg'
          ]
        },
        pricing: {
          from_price: 55.00,
          currency,
          adult_price: 55.00,
          child_price: 35.00
        },
        duration: {
          total_minutes: 270,
          formatted: '4.5 hours',
          flexible: false
        },
        availability: {
          next_available_date: '2024-03-15',
          booking_cutoff: '12 hours in advance',
          instant_confirmation: true,
          likely_to_sell_out: false
        },
        features: {
          free_cancellation: true,
          mobile_ticket: true,
          skip_the_line: false,
          audio_guide: false,
          live_guide: true,
          pickup_service: true,
          wheelchair_accessible: false,
          suitable_for_children: true
        },
        rating: {
          average: 4.4,
          count: 3247,
          distribution: {
            5: 1948,
            4: 974,
            3: 234,
            2: 67,
            1: 24
          }
        },
        category: {
          primary: 'Cultural Tours',
          secondary: ['Religious Sites', 'Nature'],
          tags: ['caves', 'temples', 'hindu', 'cultural', 'religious']
        },
        languages: ['en', 'ms', 'zh', 'ta'],
        supplier: {
          name: 'Malaysia Heritage Tours',
          logo: 'https://cdn.getyourguide.com/supplier/heritage-tours.png',
          rating: 4.6,
          verified: true
        },
        booking_info: {
          booking_url: 'https://www.getyourguide.com/kuala-lumpur-l150/batu-caves-t123458',
          deep_link: 'getyourguide://activity/123458',
          commission_rate: 7.5
        }
      }
    ]

    // Apply filters
    let filteredActivities = mockActivities

    if (activityTypes.length > 0) {
      filteredActivities = filteredActivities.filter(activity => 
        activityTypes.some(type => 
          activity.category.primary.toLowerCase().includes(type.toLowerCase()) ||
          activity.category.secondary.some(sec => sec.toLowerCase().includes(type.toLowerCase()))
        )
      )
    }

    if (priceMin !== undefined) {
      filteredActivities = filteredActivities.filter(activity => activity.pricing.from_price >= priceMin)
    }

    if (priceMax !== undefined) {
      filteredActivities = filteredActivities.filter(activity => activity.pricing.from_price <= priceMax)
    }

    if (durationMin !== undefined) {
      filteredActivities = filteredActivities.filter(activity => activity.duration.total_minutes >= durationMin)
    }

    if (durationMax !== undefined) {
      filteredActivities = filteredActivities.filter(activity => activity.duration.total_minutes <= durationMax)
    }

    if (ratingMin !== undefined) {
      filteredActivities = filteredActivities.filter(activity => activity.rating.average >= ratingMin)
    }

    if (instantConfirmation) {
      filteredActivities = filteredActivities.filter(activity => activity.availability.instant_confirmation)
    }

    if (freeCancellation) {
      filteredActivities = filteredActivities.filter(activity => activity.features.free_cancellation)
    }

    if (skipTheLine) {
      filteredActivities = filteredActivities.filter(activity => activity.features.skip_the_line)
    }

    // Generate recommendations
    const recommendations: GetYourGuideRecommendations = {
      most_popular: filteredActivities.reduce((popular, current) => 
        current.rating.count > popular.rating.count ? current : popular
      ),
      best_value: filteredActivities.reduce((value, current) => 
        (current.rating.average / current.pricing.from_price) > (value.rating.average / value.pricing.from_price) 
          ? current : value
      ),
      highest_rated: filteredActivities.reduce((rated, current) => 
        current.rating.average > rated.rating.average ? current : rated
      ),
      best_for_families: filteredActivities.filter(activity => 
        activity.features.suitable_for_children
      )[0] || filteredActivities[0],
      unique_experiences: filteredActivities.filter(activity => 
        activity.category.tags.includes('unique') || activity.rating.average >= 4.7
      ).slice(0, 3),
      trending_now: filteredActivities.filter(activity => 
        activity.availability.likely_to_sell_out
      ).slice(0, 3)
    }

    const featuredCollections = [
      {
        name: 'Iconic Landmarks',
        activities: filteredActivities.filter(activity => 
          activity.category.tags.includes('iconic') || activity.category.tags.includes('towers')
        )
      },
      {
        name: 'Cultural Experiences',
        activities: filteredActivities.filter(activity => 
          activity.category.primary === 'Cultural Tours'
        )
      },
      {
        name: 'Food & Local Life',
        activities: filteredActivities.filter(activity => 
          activity.category.primary === 'Food & Drink'
        )
      }
    ]

    const response: GetYourGuideResponse = {
      success: true,
      activities: filteredActivities.slice(0, limit),
      total_count: filteredActivities.length,
      search_metadata: {
        destination: destination || 'Current Location',
        search_date: new Date().toISOString(),
        currency,
        filters_applied: {
          activity_types: activityTypes,
          price_range: [priceMin, priceMax],
          duration_range: [durationMin, durationMax],
          rating_min: ratingMin,
          instant_confirmation: instantConfirmation,
          free_cancellation: freeCancellation,
          skip_the_line: skipTheLine
        },
        search_radius: 50 // km
      },
      recommendations,
      featured_collections: featuredCollections.filter(collection => collection.activities.length > 0)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('GetYourGuide API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch activities from GetYourGuide'
    }, { status: 500 })
  }
}

// Helper function to process real GetYourGuide API response
function processGetYourGuideResponse(data: any, currency: string): GetYourGuideResponse {
  const activities: GetYourGuideActivity[] = data.activities?.map((activity: any) => ({
    id: activity.id,
    title: activity.title,
    description: {
      short: activity.abstract,
      detailed: activity.description,
      highlights: activity.highlights || [],
      inclusions: activity.inclusions || [],
      exclusions: activity.exclusions || [],
      important_info: activity.important_information || []
    },
    location: {
      city: activity.destination.name,
      country: activity.destination.country,
      address: activity.meeting_point?.address || '',
      meeting_point: activity.meeting_point?.description || '',
      coordinates: {
        latitude: activity.location?.latitude || 0,
        longitude: activity.location?.longitude || 0
      }
    },
    images: {
      main: activity.pictures?.[0]?.url || '',
      gallery: activity.pictures?.slice(1).map((pic: any) => pic.url) || [],
      video_url: activity.video?.url
    },
    pricing: {
      from_price: activity.pricing?.from_price || 0,
      currency: activity.pricing?.currency || currency,
      adult_price: activity.pricing?.adult_price || 0,
      child_price: activity.pricing?.child_price,
      youth_price: activity.pricing?.youth_price,
      senior_price: activity.pricing?.senior_price
    },
    duration: {
      total_minutes: activity.duration?.total_minutes || 0,
      formatted: activity.duration?.formatted || '',
      flexible: activity.duration?.flexible || false
    },
    availability: {
      next_available_date: activity.availability?.next_date || '',
      booking_cutoff: activity.availability?.cutoff || '',
      instant_confirmation: activity.features?.instant_confirmation || false,
      likely_to_sell_out: activity.availability?.likely_to_sell_out || false
    },
    features: {
      free_cancellation: activity.features?.free_cancellation || false,
      mobile_ticket: activity.features?.mobile_ticket || false,
      skip_the_line: activity.features?.skip_the_line || false,
      audio_guide: activity.features?.audio_guide || false,
      live_guide: activity.features?.live_guide || false,
      pickup_service: activity.features?.pickup_service || false,
      wheelchair_accessible: activity.features?.wheelchair_accessible || false,
      suitable_for_children: activity.features?.suitable_for_children || false
    },
    rating: {
      average: activity.rating?.average || 0,
      count: activity.rating?.count || 0,
      distribution: activity.rating?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    },
    category: {
      primary: activity.categories?.[0]?.name || '',
      secondary: activity.categories?.slice(1).map((cat: any) => cat.name) || [],
      tags: activity.tags || []
    },
    languages: activity.languages || [],
    supplier: {
      name: activity.supplier?.name || '',
      logo: activity.supplier?.logo || '',
      rating: activity.supplier?.rating || 0,
      verified: activity.supplier?.verified || false
    },
    booking_info: {
      booking_url: activity.booking_url || '',
      deep_link: activity.deep_link || '',
      commission_rate: activity.commission_rate || 0
    }
  })) || []

  return {
    success: true,
    activities,
    total_count: data.total_count || activities.length,
    search_metadata: {
      destination: data.search_query?.destination || '',
      search_date: new Date().toISOString(),
      currency,
      filters_applied: data.filters || {},
      search_radius: data.search_radius || 50
    },
    recommendations: generateGetYourGuideRecommendations(activities),
    featured_collections: []
  }
}

function generateGetYourGuideRecommendations(activities: GetYourGuideActivity[]): GetYourGuideRecommendations {
  return {
    most_popular: activities.reduce((popular, current) => 
      current.rating.count > popular.rating.count ? current : popular
    ),
    best_value: activities.reduce((value, current) => 
      (current.rating.average / current.pricing.from_price) > (value.rating.average / value.pricing.from_price) 
        ? current : value
    ),
    highest_rated: activities.reduce((rated, current) => 
      current.rating.average > rated.rating.average ? current : rated
    ),
    best_for_families: activities.filter(activity => 
      activity.features.suitable_for_children
    )[0] || activities[0],
    unique_experiences: activities.filter(activity => 
      activity.rating.average >= 4.7
    ).slice(0, 3),
    trending_now: activities.filter(activity => 
      activity.availability.likely_to_sell_out
    ).slice(0, 3)
  }
}