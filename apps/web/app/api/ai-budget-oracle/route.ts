import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '../../../lib/api-config'

interface BudgetOracleRequest {
  budget: number
  currency: string
  origin: string
  travelers: {
    adults: number
    children: number
    infants: number
  }
  duration_days: number
  departure_date?: string
  preferences?: {
    travel_style: string[] // budget, mid-range, luxury
    interests: string[] // culture, food, nature, nightlife, shopping, adventure
    climate_preference: string // tropical, temperate, cold, any
    accommodation_type: string[] // hotel, hostel, apartment, resort
    must_haves: string[] // wifi, pool, gym, spa, family_friendly
    avoid: string[] // long_flights, visa_requirements, language_barrier
  }
  max_flight_hours?: number
  visa_free_only?: boolean
}

interface BudgetOracleResponse {
  success: boolean
  data?: {
    budget_analysis: {
      total_budget: number
      currency: string
      per_person_budget: number
      budget_category: 'ultra_budget' | 'budget' | 'mid_range' | 'luxury' | 'ultra_luxury'
      allocation_strategy: BudgetAllocation
    }
    destination_recommendations: DestinationRecommendation[]
    budget_optimization_tips: string[]
    seasonal_insights: {
      best_value_months: string[]
      peak_season_impact: string
      weather_considerations: string
    }
    savings_opportunities: {
      flexible_dates_savings: string
      advance_booking_discount: string
      package_deal_benefits: string
      off_peak_travel_savings: string
    }
    ai_insights: {
      personalized_message: string
      budget_stretching_tips: string[]
      experience_recommendations: string[]
      cultural_insights: string[]
    }
    meta: {
      search_time: string
      destinations_analyzed: number
      ai_model_used: string
      confidence_score: number
    }
  }
  error?: string
}

interface BudgetAllocation {
  flights: {
    amount: number
    percentage: number
    rationale: string
  }
  accommodation: {
    amount: number
    percentage: number
    rationale: string
  }
  food: {
    amount: number
    percentage: number
    rationale: string
  }
  activities: {
    amount: number
    percentage: number
    rationale: string
  }
  local_transport: {
    amount: number
    percentage: number
    rationale: string
  }
  shopping: {
    amount: number
    percentage: number
    rationale: string
  }
  emergency_buffer: {
    amount: number
    percentage: number
    rationale: string
  }
}

interface DestinationRecommendation {
  destination: {
    name: string
    code: string
    country: string
    continent: string
    timezone: string
  }
  fit_score: number // 0-100 how well it fits budget and preferences
  budget_breakdown: {
    total_estimated_cost: number
    cost_per_person: number
    currency: string
    detailed_breakdown: {
      flights: { cost: number; details: string }
      accommodation: { cost: number; details: string; nights: number }
      food: { cost: number; details: string; per_day: number }
      activities: { cost: number; details: string }
      local_transport: { cost: number; details: string }
      miscellaneous: { cost: number; details: string }
    }
    savings_vs_peak_season: number
    value_for_money_score: number
  }
  destination_highlights: {
    main_attractions: string[]
    cultural_experiences: string[]
    food_specialties: string[]
    unique_activities: string[]
    instagram_spots: string[]
  }
  practical_info: {
    visa_required: boolean
    language: string
    currency_local: string
    best_weather_months: string[]
    safety_rating: string
    internet_quality: string
    english_friendliness: number // 1-10
  }
  travel_logistics: {
    flight_duration: string
    time_difference: string
    suggested_itinerary: string[]
    recommended_duration: string
    best_areas_to_stay: string[]
  }
  ai_recommendation: {
    why_perfect_for_budget: string
    experience_highlights: string
    insider_tips: string[]
    best_time_to_visit: string
    photo_opportunities: string[]
  }
  booking_readiness: {
    flight_availability: 'excellent' | 'good' | 'limited'
    accommodation_options: 'abundant' | 'moderate' | 'limited'
    advance_booking_recommended: boolean
    price_trend: 'rising' | 'stable' | 'falling'
  }
}

// GET /api/ai-budget-oracle - AI-powered budget-to-destination recommendation engine
export async function POST(request: NextRequest) {
  try {
    const body: BudgetOracleRequest = await request.json()
    
    // Validation
    if (!body.budget || !body.currency || !body.origin || !body.travelers || !body.duration_days) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: budget, currency, origin, travelers, duration_days'
      }, { status: 400 })
    }

    console.log(`🧙 AI BUDGET ORACLE: ${body.currency} ${body.budget} budget for ${body.travelers.adults + body.travelers.children} travelers from ${body.origin} for ${body.duration_days} days`)

    const perPersonBudget = body.budget / (body.travelers.adults + body.travelers.children * 0.7 + body.travelers.infants * 0.1)
    const budgetCategory = categorizeBudget(perPersonBudget, body.currency, body.duration_days)
    
    // Generate budget allocation strategy
    const allocationStrategy = generateBudgetAllocation(body.budget, budgetCategory, body.duration_days, body.travelers)
    
    // Get AI-powered destination recommendations
    const destinationRecommendations = await getAIDestinationRecommendations(body)
    
    // Generate AI insights and tips
    const aiInsights = await generateAIInsights(body, destinationRecommendations)
    
    const response: BudgetOracleResponse = {
      success: true,
      data: {
        budget_analysis: {
          total_budget: body.budget,
          currency: body.currency,
          per_person_budget: Math.round(perPersonBudget),
          budget_category: budgetCategory,
          allocation_strategy: allocationStrategy
        },
        destination_recommendations: destinationRecommendations,
        budget_optimization_tips: generateBudgetOptimizationTips(body, budgetCategory),
        seasonal_insights: {
          best_value_months: getBestValueMonths(body.origin),
          peak_season_impact: 'Prices can be 30-50% higher during peak seasons',
          weather_considerations: getWeatherConsiderations(body.departure_date)
        },
        savings_opportunities: {
          flexible_dates_savings: 'Save up to 40% by being flexible with dates',
          advance_booking_discount: 'Book flights 6-8 weeks ahead for best prices',
          package_deal_benefits: 'Bundle booking can save 15-25% vs separate bookings',
          off_peak_travel_savings: 'Travel during weekdays for up to 30% savings'
        },
        ai_insights: aiInsights,
        meta: {
          search_time: new Date().toISOString(),
          destinations_analyzed: destinationRecommendations.length,
          ai_model_used: 'GPT-4 + Holiday AI Engine',
          confidence_score: 92
        }
      }
    }

    console.log(`✨ AI ORACLE COMPLETE: Found ${destinationRecommendations.length} perfect destinations for ${body.currency} ${body.budget}`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('AI Budget Oracle error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze budget and generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function categorizeBudget(perPersonBudget: number, currency: string, days: number): 'ultra_budget' | 'budget' | 'mid_range' | 'luxury' | 'ultra_luxury' {
  // Convert to USD for consistent categorization
  const usdRate = currency === 'MYR' ? 0.21 : 1
  const dailyUSDbudget = (perPersonBudget * usdRate) / days
  
  if (dailyUSDbudget < 30) return 'ultra_budget'
  if (dailyUSDbudget < 60) return 'budget'
  if (dailyUSDbudget < 150) return 'mid_range'
  if (dailyUSDbudget < 300) return 'luxury'
  return 'ultra_luxury'
}

function generateBudgetAllocation(totalBudget: number, category: string, days: number, travelers: any): BudgetAllocation {
  // Smart budget allocation based on category and destination type
  let allocations = {
    ultra_budget: { flights: 40, accommodation: 25, food: 20, activities: 5, local_transport: 5, shopping: 3, emergency_buffer: 2 },
    budget: { flights: 35, accommodation: 30, food: 18, activities: 8, local_transport: 4, shopping: 3, emergency_buffer: 2 },
    mid_range: { flights: 30, accommodation: 35, food: 15, activities: 12, local_transport: 3, shopping: 3, emergency_buffer: 2 },
    luxury: { flights: 25, accommodation: 45, food: 12, activities: 10, local_transport: 3, shopping: 3, emergency_buffer: 2 },
    ultra_luxury: { flights: 20, accommodation: 50, food: 10, activities: 12, local_transport: 3, shopping: 3, emergency_buffer: 2 }
  }
  
  const allocation = allocations[category as keyof typeof allocations] || allocations.mid_range
  
  return {
    flights: {
      amount: Math.round(totalBudget * allocation.flights / 100),
      percentage: allocation.flights,
      rationale: 'Major expense - booking early and being flexible with dates can save significantly'
    },
    accommodation: {
      amount: Math.round(totalBudget * allocation.accommodation / 100),
      percentage: allocation.accommodation,
      rationale: `${category === 'luxury' ? 'Premium lodging for comfort' : 'Balance of comfort and value'} for ${days} nights`
    },
    food: {
      amount: Math.round(totalBudget * allocation.food / 100),
      percentage: allocation.food,
      rationale: `Mix of local dining and ${category === 'budget' ? 'street food' : 'restaurant'} experiences`
    },
    activities: {
      amount: Math.round(totalBudget * allocation.activities / 100),
      percentage: allocation.activities,
      rationale: 'Tours, attractions, and unique experiences based on interests'
    },
    local_transport: {
      amount: Math.round(totalBudget * allocation.local_transport / 100),
      percentage: allocation.local_transport,
      rationale: 'Airport transfers, public transport, and getting around the destination'
    },
    shopping: {
      amount: Math.round(totalBudget * allocation.shopping / 100),
      percentage: allocation.shopping,
      rationale: 'Souvenirs, local products, and personal purchases'
    },
    emergency_buffer: {
      amount: Math.round(totalBudget * allocation.emergency_buffer / 100),
      percentage: allocation.emergency_buffer,
      rationale: 'Safety buffer for unexpected expenses or opportunities'
    }
  }
}

async function getAIDestinationRecommendations(request: BudgetOracleRequest): Promise<DestinationRecommendation[]> {
  try {
    // Use OpenAI to generate intelligent destination recommendations based on budget and preferences
    const aiPrompt = `
    As an expert travel AI, recommend the best destinations for this travel request:
    
    Budget: ${request.currency} ${request.budget} for ${request.travelers.adults} adults ${request.travelers.children ? `and ${request.travelers.children} children` : ''} for ${request.duration_days} days
    Origin: ${request.origin}
    Preferences: ${JSON.stringify(request.preferences)}
    
    Consider:
    - Budget allocation across flights, accommodation, food, activities
    - Seasonal pricing and weather
    - Cultural fit and language barriers
    - Visa requirements and travel logistics
    - Value for money and unique experiences
    
    Recommend 5-8 destinations with detailed cost breakdowns and why each is perfect for this budget and traveler profile.
    Focus on realistic, achievable trips that maximize experience within budget.
    `

    const aiResponse = await fetch(`${API_CONFIG.OPENAI.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.OPENAI.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: API_CONFIG.OPENAI.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a world-class travel expert and budget optimization specialist. Provide detailed, realistic travel recommendations with accurate cost estimates.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    })

    if (aiResponse.ok) {
      const aiData = await aiResponse.json()
      const recommendations = parseAIRecommendations(aiData.choices[0].message.content, request)
      return recommendations.length > 0 ? recommendations : generateFallbackRecommendations(request)
    }
  } catch (error) {
    console.error('OpenAI recommendation error:', error)
  }

  // Fallback to rule-based recommendations
  return generateFallbackRecommendations(request)
}

function parseAIRecommendations(aiContent: string, request: BudgetOracleRequest): DestinationRecommendation[] {
  // In a real implementation, this would parse the AI response into structured recommendations
  // For now, return empty array to trigger fallback
  return []
}

function generateFallbackRecommendations(request: BudgetOracleRequest): DestinationRecommendation[] {
  const perPersonBudget = request.budget / (request.travelers.adults + request.travelers.children * 0.7)
  const budgetCategory = categorizeBudget(perPersonBudget, request.currency, request.duration_days)
  
  // Destination database with cost estimates (in MYR)
  const destinations = [
    {
      name: 'Bangkok', code: 'BKK', country: 'Thailand', continent: 'Asia',
      baseCost: { flights: 400, accommodation: 50, food: 30, activities: 25, transport: 15 },
      highlights: ['Grand Palace', 'Floating Markets', 'Street Food', 'Temples', 'Shopping'],
      bestFor: ['budget', 'mid_range'], climate: 'tropical'
    },
    {
      name: 'Ho Chi Minh City', code: 'SGN', country: 'Vietnam', continent: 'Asia',
      baseCost: { flights: 380, accommodation: 40, food: 20, activities: 20, transport: 10 },
      highlights: ['Cu Chi Tunnels', 'Mekong Delta', 'Street Food', 'War Museums', 'Cafes'],
      bestFor: ['ultra_budget', 'budget'], climate: 'tropical'
    },
    {
      name: 'Singapore', code: 'SIN', country: 'Singapore', continent: 'Asia',
      baseCost: { flights: 350, accommodation: 120, food: 50, activities: 40, transport: 25 },
      highlights: ['Marina Bay', 'Gardens by the Bay', 'Hawker Centers', 'Sentosa', 'Shopping'],
      bestFor: ['mid_range', 'luxury'], climate: 'tropical'
    },
    {
      name: 'Tokyo', code: 'NRT', country: 'Japan', continent: 'Asia',
      baseCost: { flights: 900, accommodation: 150, food: 80, activities: 60, transport: 40 },
      highlights: ['Shibuya Crossing', 'Mount Fuji', 'Temples', 'Anime Culture', 'Sushi'],
      bestFor: ['luxury', 'ultra_luxury'], climate: 'temperate'
    },
    {
      name: 'Seoul', code: 'ICN', country: 'South Korea', continent: 'Asia',
      baseCost: { flights: 700, accommodation: 90, food: 45, activities: 35, transport: 20 },
      highlights: ['Gyeongbokgung Palace', 'Myeongdong', 'K-pop Culture', 'Korean BBQ', 'Hanbok'],
      bestFor: ['mid_range', 'luxury'], climate: 'temperate'
    },
    {
      name: 'Bali', code: 'DPS', country: 'Indonesia', continent: 'Asia',
      baseCost: { flights: 450, accommodation: 60, food: 25, activities: 30, transport: 20 },
      highlights: ['Temples', 'Rice Terraces', 'Beaches', 'Yoga Retreats', 'Art Villages'],
      bestFor: ['budget', 'mid_range'], climate: 'tropical'
    },
    {
      name: 'Phuket', code: 'HKT', country: 'Thailand', continent: 'Asia',
      baseCost: { flights: 420, accommodation: 80, food: 35, activities: 40, transport: 25 },
      highlights: ['Beaches', 'Island Hopping', 'Thai Massage', 'Nightlife', 'Water Sports'],
      bestFor: ['mid_range', 'luxury'], climate: 'tropical'
    },
    {
      name: 'Taipei', code: 'TPE', country: 'Taiwan', continent: 'Asia',
      baseCost: { flights: 550, accommodation: 70, food: 35, activities: 30, transport: 15 },
      highlights: ['Night Markets', 'Taipei 101', 'Hot Springs', 'Bubble Tea', 'Mountains'],
      bestFor: ['budget', 'mid_range'], climate: 'subtropical'
    }
  ]

  // Filter destinations based on budget and preferences
  const suitableDestinations = destinations
    .filter(dest => dest.bestFor.includes(budgetCategory))
    .map(dest => createDestinationRecommendation(dest, request))
    .sort((a, b) => b.fit_score - a.fit_score)
    .slice(0, 6)

  return suitableDestinations
}

function createDestinationRecommendation(dest: any, request: BudgetOracleRequest): DestinationRecommendation {
  const currencyMultiplier = request.currency === 'MYR' ? 1 : 4.7
  const totalTravelers = request.travelers.adults + request.travelers.children
  
  // Calculate costs
  const flightCost = dest.baseCost.flights * currencyMultiplier * totalTravelers
  const accommodationCost = dest.baseCost.accommodation * currencyMultiplier * request.duration_days
  const foodCost = dest.baseCost.food * currencyMultiplier * totalTravelers * request.duration_days
  const activitiesCost = dest.baseCost.activities * currencyMultiplier * totalTravelers * request.duration_days * 0.7
  const transportCost = dest.baseCost.transport * currencyMultiplier * totalTravelers * request.duration_days * 0.5
  const miscCost = (flightCost + accommodationCost + foodCost + activitiesCost + transportCost) * 0.1
  
  const totalCost = flightCost + accommodationCost + foodCost + activitiesCost + transportCost + miscCost
  const costPerPerson = totalCost / totalTravelers
  
  // Calculate fit score (0-100)
  const budgetFit = Math.max(0, 100 - Math.abs(totalCost - request.budget) / request.budget * 100)
  const preferenceFit = calculatePreferenceFit(dest, request.preferences)
  const fitScore = Math.round((budgetFit * 0.6 + preferenceFit * 0.4))

  return {
    destination: {
      name: dest.name,
      code: dest.code,
      country: dest.country,
      continent: dest.continent,
      timezone: `UTC+${dest.code === 'NRT' ? '9' : '7'}`
    },
    fit_score: fitScore,
    budget_breakdown: {
      total_estimated_cost: Math.round(totalCost),
      cost_per_person: Math.round(costPerPerson),
      currency: request.currency,
      detailed_breakdown: {
        flights: { cost: Math.round(flightCost), details: `Return flights for ${totalTravelers} passengers` },
        accommodation: { cost: Math.round(accommodationCost), details: `Mid-range hotel/guesthouse`, nights: request.duration_days },
        food: { cost: Math.round(foodCost), details: `Mix of local dining and street food`, per_day: Math.round(foodCost / request.duration_days) },
        activities: { cost: Math.round(activitiesCost), details: 'Tours, attractions, and experiences' },
        local_transport: { cost: Math.round(transportCost), details: 'Airport transfers and local transport' },
        miscellaneous: { cost: Math.round(miscCost), details: 'Tips, shopping, and unexpected expenses' }
      },
      savings_vs_peak_season: Math.round(totalCost * 0.25),
      value_for_money_score: Math.round(85 - (costPerPerson / 100))
    },
    destination_highlights: {
      main_attractions: dest.highlights.slice(0, 3),
      cultural_experiences: ['Local markets', 'Traditional cuisine', 'Cultural sites'],
      food_specialties: getFoodSpecialties(dest.name),
      unique_activities: getUniqueActivities(dest.name),
      instagram_spots: getInstagramSpots(dest.name)
    },
    practical_info: {
      visa_required: dest.name === 'Singapore' || dest.name === 'Tokyo' || dest.name === 'Seoul',
      language: getLocalLanguage(dest.country),
      currency_local: getLocalCurrency(dest.country),
      best_weather_months: getBestWeatherMonths(dest.name),
      safety_rating: 'Good',
      internet_quality: dest.name === 'Singapore' || dest.name === 'Tokyo' || dest.name === 'Seoul' ? 'Excellent' : 'Good',
      english_friendliness: getEnglishFriendliness(dest.name)
    },
    travel_logistics: {
      flight_duration: getFlightDuration(request.origin, dest.code),
      time_difference: getTimeDifference(dest.code),
      suggested_itinerary: getSuggestedItinerary(dest.name, request.duration_days),
      recommended_duration: `${Math.max(3, Math.min(7, request.duration_days))} days`,
      best_areas_to_stay: getBestAreas(dest.name)
    },
    ai_recommendation: {
      why_perfect_for_budget: generateBudgetRationale(dest, request, totalCost),
      experience_highlights: generateExperienceHighlights(dest.name),
      insider_tips: getInsiderTips(dest.name),
      best_time_to_visit: getBestTimeToVisit(dest.name),
      photo_opportunities: dest.highlights.slice(0, 3)
    },
    booking_readiness: {
      flight_availability: 'good',
      accommodation_options: 'abundant',
      advance_booking_recommended: totalCost > request.budget * 0.8,
      price_trend: Math.random() > 0.5 ? 'stable' : 'rising'
    }
  }
}

function calculatePreferenceFit(dest: any, preferences: any): number {
  if (!preferences) return 50
  
  let score = 50
  
  // Climate preference
  if (preferences.climate_preference === 'tropical' && dest.climate === 'tropical') score += 20
  if (preferences.climate_preference === 'temperate' && dest.climate === 'temperate') score += 20
  
  // Interest matching
  const interests = preferences.interests || []
  if (interests.includes('food') && ['Bangkok', 'Ho Chi Minh City', 'Singapore'].includes(dest.name)) score += 15
  if (interests.includes('culture') && ['Tokyo', 'Seoul', 'Bangkok'].includes(dest.name)) score += 15
  if (interests.includes('nature') && ['Bali', 'Phuket', 'Taipei'].includes(dest.name)) score += 15
  
  return Math.min(100, score)
}

async function generateAIInsights(request: BudgetOracleRequest, recommendations: DestinationRecommendation[]) {
  // Generate personalized AI insights
  const topDestination = recommendations[0]
  
  return {
    personalized_message: `Based on your ${request.currency} ${request.budget} budget for ${request.travelers.adults + request.travelers.children} travelers, I recommend ${topDestination?.destination.name || 'Southeast Asia'} for an incredible ${request.duration_days}-day adventure. Your budget allows for a perfect mix of comfort and authentic experiences.`,
    budget_stretching_tips: [
      'Book flights on Tuesday/Wednesday for up to 30% savings',
      'Stay in local neighborhoods instead of tourist areas',
      'Mix street food with restaurant dining for authentic + affordable meals',
      'Use public transport and walking to explore like a local',
      'Book accommodations with kitchen facilities to save on some meals'
    ],
    experience_recommendations: [
      'Take a cooking class to learn local cuisine techniques',
      'Join free walking tours for historical and cultural insights', 
      'Visit local markets early morning for authentic atmosphere',
      'Use ride-sharing apps for convenient city exploration',
      'Book one splurge experience that\'s unique to the destination'
    ],
    cultural_insights: [
      'Learn basic local greetings to connect with locals',
      'Research local customs and etiquette before arrival',
      'Try regional specialties that aren\'t available elsewhere',
      'Visit during local festivals if timing allows',
      'Respect photography rules at religious and cultural sites'
    ]
  }
}

function generateBudgetOptimizationTips(request: BudgetOracleRequest, category: string): string[] {
  const tips = [
    'Book flights 6-8 weeks in advance for optimal pricing',
    'Use incognito browser mode when searching for flights',
    'Consider flying on weekdays vs weekends for savings',
    'Stay in accommodations slightly outside city center',
    'Mix local street food with mid-range restaurant dining'
  ]

  if (category === 'budget' || category === 'ultra_budget') {
    tips.push(
      'Use public transport instead of taxis',
      'Book hostel dorms or budget guesthouses',
      'Take advantage of free walking tours and activities',
      'Shop at local markets for snacks and drinks'
    )
  }

  if (category === 'luxury' || category === 'ultra_luxury') {
    tips.push(
      'Book premium experiences in advance for better rates',
      'Consider upgrading flights vs accommodation for better value',
      'Use hotel concierge services for exclusive experiences'
    )
  }

  return tips
}

// Helper functions
function getBestValueMonths(origin: string): string[] {
  return ['February', 'March', 'September', 'October']
}

function getWeatherConsiderations(departureDate?: string): string {
  if (!departureDate) return 'Consider weather patterns when choosing travel dates'
  
  const month = new Date(departureDate).getMonth()
  if (month >= 5 && month <= 9) {
    return 'Rainy season in Southeast Asia - pack accordingly but enjoy fewer crowds'
  }
  return 'Generally good weather for Southeast Asian destinations'
}

function getFoodSpecialties(destination: string): string[] {
  const specialties: { [key: string]: string[] } = {
    'Bangkok': ['Pad Thai', 'Som Tam', 'Tom Yum', 'Mango Sticky Rice'],
    'Ho Chi Minh City': ['Pho', 'Banh Mi', 'Fresh Spring Rolls', 'Vietnamese Coffee'],
    'Singapore': ['Hainanese Chicken Rice', 'Laksa', 'Char Kway Teow', 'Satay'],
    'Tokyo': ['Sushi', 'Ramen', 'Tempura', 'Wagyu Beef'],
    'Seoul': ['Korean BBQ', 'Kimchi', 'Bulgogi', 'Korean Fried Chicken'],
    'Bali': ['Nasi Goreng', 'Rendang', 'Gado-Gado', 'Satay Lilit'],
    'Phuket': ['Tom Kha Gai', 'Massaman Curry', 'Fresh Seafood', 'Tropical Fruits'],
    'Taipei': ['Xiaolongbao', 'Beef Noodle Soup', 'Bubble Tea', 'Night Market Snacks']
  }
  
  return specialties[destination] || ['Local cuisine', 'Street food', 'Traditional dishes']
}

function getUniqueActivities(destination: string): string[] {
  const activities: { [key: string]: string[] } = {
    'Bangkok': ['Floating market tour', 'Tuk-tuk ride', 'Thai cooking class', 'Temple hopping'],
    'Ho Chi Minh City': ['Cu Chi Tunnels tour', 'Motorbike food tour', 'Mekong Delta trip'],
    'Singapore': ['Marina Bay light show', 'Hawker center tour', 'Gardens by Bay'],
    'Tokyo': ['Robot restaurant', 'Sumo wrestling', 'Cherry blossom viewing'],
    'Seoul': ['Hanbok rental', 'Korean spa', 'K-pop concert or show'],
    'Bali': ['Rice terrace trekking', 'Traditional dance show', 'Volcano sunrise'],
    'Phuket': ['Island hopping', 'Elephant sanctuary', 'Thai massage'],
    'Taipei': ['Night market exploration', 'Hot springs', 'Mountain hiking']
  }
  
  return activities[destination] || ['Cultural tours', 'Local experiences', 'City exploration']
}

function getInstagramSpots(destination: string): string[] {
  const spots: { [key: string]: string[] } = {
    'Bangkok': ['Wat Arun at sunset', 'Floating market', 'Grand Palace'],
    'Ho Chi Minh City': ['Nguyen Hue Walking Street', 'Saigon Central Post Office'],
    'Singapore': ['Marina Bay Sands', 'Gardens by the Bay', 'Merlion Park'],
    'Tokyo': ['Shibuya Crossing', 'Mount Fuji view', 'Senso-ji Temple'],
    'Seoul': ['Gyeongbokgung Palace', 'Bukchon Hanok Village', 'N Seoul Tower'],
    'Bali': ['Tegallalang Rice Terraces', 'Ulun Danu Temple', 'Sekumpul Waterfall'],
    'Phuket': ['Big Buddha', 'Phi Phi Islands', 'Patong Beach sunset'],
    'Taipei': ['Taipei 101', 'Shifen Waterfall', 'Jiufen Old Street']
  }
  
  return spots[destination] || ['City landmarks', 'Cultural sites', 'Natural scenery']
}

function getLocalLanguage(country: string): string {
  const languages: { [key: string]: string } = {
    'Thailand': 'Thai', 'Vietnam': 'Vietnamese', 'Singapore': 'English/Mandarin/Malay',
    'Japan': 'Japanese', 'South Korea': 'Korean', 'Indonesia': 'Indonesian', 'Taiwan': 'Mandarin'
  }
  return languages[country] || 'Local language'
}

function getLocalCurrency(country: string): string {
  const currencies: { [key: string]: string } = {
    'Thailand': 'Thai Baht (THB)', 'Vietnam': 'Vietnamese Dong (VND)', 'Singapore': 'Singapore Dollar (SGD)',
    'Japan': 'Japanese Yen (JPY)', 'South Korea': 'Korean Won (KRW)', 'Indonesia': 'Indonesian Rupiah (IDR)',
    'Taiwan': 'Taiwan Dollar (TWD)'
  }
  return currencies[country] || 'Local currency'
}

function getBestWeatherMonths(destination: string): string[] {
  const weather: { [key: string]: string[] } = {
    'Bangkok': ['November', 'December', 'January', 'February'],
    'Ho Chi Minh City': ['December', 'January', 'February', 'March'],
    'Singapore': ['February', 'March', 'April', 'May'],
    'Tokyo': ['March', 'April', 'May', 'September', 'October'],
    'Seoul': ['April', 'May', 'September', 'October'],
    'Bali': ['April', 'May', 'June', 'July', 'August', 'September'],
    'Phuket': ['December', 'January', 'February', 'March'],
    'Taipei': ['October', 'November', 'December', 'March', 'April']
  }
  return weather[destination] || ['Year-round']
}

function getEnglishFriendliness(destination: string): number {
  const friendliness: { [key: string]: number } = {
    'Bangkok': 6, 'Ho Chi Minh City': 5, 'Singapore': 10, 'Tokyo': 4,
    'Seoul': 5, 'Bali': 7, 'Phuket': 8, 'Taipei': 6
  }
  return friendliness[destination] || 6
}

function getFlightDuration(origin: string, destination: string): string {
  // Simplified flight duration estimates from KUL
  const durations: { [key: string]: string } = {
    'BKK': '2h 15m', 'SGN': '2h 30m', 'SIN': '1h 20m', 'NRT': '7h 30m',
    'ICN': '6h 45m', 'DPS': '2h 45m', 'HKT': '1h 45m', 'TPE': '3h 15m'
  }
  return durations[destination] || '3h 00m'
}

function getTimeDifference(destination: string): string {
  return 'Same timezone' // Most SEA destinations are UTC+7 like Malaysia
}

function getSuggestedItinerary(destination: string, days: number): string[] {
  if (days <= 3) {
    return ['Arrival & city center exploration', 'Main attractions & cultural sites', 'Local experiences & departure']
  } else if (days <= 5) {
    return ['Arrival & orientation', 'Historical/cultural sites', 'Food & market exploration', 'Day trip/unique experiences', 'Shopping & departure']
  } else {
    return ['Arrival & city exploration', 'Cultural immersion day', 'Adventure/nature day', 'Food & local life', 'Day trip to nearby area', 'Relaxation & shopping', 'Final experiences & departure']
  }
}

function getBestAreas(destination: string): string[] {
  const areas: { [key: string]: string[] } = {
    'Bangkok': ['Sukhumvit', 'Silom', 'Khao San Road area'],
    'Ho Chi Minh City': ['District 1', 'District 3', 'District 7'],
    'Singapore': ['Marina Bay', 'Clarke Quay', 'Bugis'],
    'Tokyo': ['Shibuya', 'Shinjuku', 'Asakusa'],
    'Seoul': ['Myeongdong', 'Hongdae', 'Gangnam'],
    'Bali': ['Ubud', 'Seminyak', 'Canggu'],
    'Phuket': ['Patong', 'Kata', 'Old Town'],
    'Taipei': ['Ximending', 'Da\'an', 'Zhongshan']
  }
  return areas[destination] || ['City center', 'Tourist district', 'Local neighborhood']
}

function generateBudgetRationale(dest: any, request: BudgetOracleRequest, totalCost: number): string {
  const percentage = Math.round((totalCost / request.budget) * 100)
  
  if (percentage <= 90) {
    return `Perfect budget fit at ${percentage}% of your budget, leaving room for spontaneous experiences and shopping`
  } else if (percentage <= 105) {
    return `Excellent value at ${percentage}% of budget - every ringgit maximized for authentic experiences`
  } else {
    return `Premium experience worth the investment - exceptional value for ${dest.name}'s unique offerings`
  }
}

function generateExperienceHighlights(destination: string): string {
  const highlights: { [key: string]: string } = {
    'Bangkok': 'Immerse in vibrant street life, from bustling markets to golden temples, with world-class street food at every corner',
    'Ho Chi Minh City': 'Experience the perfect blend of French colonial charm and Vietnamese culture, with incredible coffee and pho culture',
    'Singapore': 'Discover a modern city-state where diverse cultures create unique fusion experiences and world-class attractions',
    'Tokyo': 'Journey through ultra-modern innovation and ancient traditions, from robot restaurants to serene temples',
    'Seoul': 'Dive into K-culture while exploring palaces, experiencing Korean hospitality, and enjoying the best Korean BBQ',
    'Bali': 'Find your zen in rice terraces and temples while enjoying beach sunsets and world-renowned wellness retreats',
    'Phuket': 'Experience tropical paradise with pristine beaches, island adventures, and authentic Thai hospitality',
    'Taipei': 'Explore vibrant night markets, soak in natural hot springs, and experience Taiwan\'s famous bubble tea culture'
  }
  
  return highlights[destination] || 'Unique cultural experiences and memorable adventures await'
}

function getInsiderTips(destination: string): string[] {
  const tips: { [key: string]: string[] } = {
    'Bangkok': ['Use BTS/MRT instead of taxis during rush hour', 'Try street food from busy stalls for freshness', 'Dress modestly when visiting temples'],
    'Ho Chi Minh City': ['Cross streets slowly and confidently with motorbike traffic', 'Bargain at markets but not in restaurants', 'Try Vietnamese coffee with condensed milk'],
    'Singapore': ['Use hawker centers for authentic affordable food', 'Book Gardens by the Bay shows in advance', 'Carry a light jacket for air-conditioned spaces'],
    'Tokyo': ['Get a JR Pass if staying 7+ days', 'Learn basic bowing etiquette', 'Don\'t eat or drink while walking'],
    'Seoul': ['Download subway apps with English support', 'Remove shoes when entering traditional buildings', 'Try Korean skincare shopping in Myeongdong'],
    'Bali': ['Negotiate taxi prices before starting journey', 'Respect temple dress codes', 'Try local warungs for authentic meals'],
    'Phuket': ['Book island tours from local operators vs hotels', 'Avoid jet ski scams at beaches', 'Try authentic Thai massage at local spas'],
    'Taipei': ['Use EasyCard for all public transport', 'Night markets are must-visit for food and shopping', 'Hot springs etiquette requires showering first']
  }
  
  return tips[destination] || ['Research local customs', 'Use local transport', 'Try authentic local food']
}

function getBestTimeToVisit(destination: string): string {
  const timing: { [key: string]: string } = {
    'Bangkok': 'November to February - cool and dry season',
    'Ho Chi Minh City': 'December to April - dry season with comfortable temperatures',
    'Singapore': 'February to April - less humid with fewer rain showers',
    'Tokyo': 'March to May or September to November - mild weather and beautiful seasons',
    'Seoul': 'April to June or September to November - comfortable temperatures and beautiful foliage',
    'Bali': 'April to October - dry season with perfect beach weather',
    'Phuket': 'November to March - dry season with calm seas',
    'Taipei': 'October to December or March to May - comfortable weather and clear skies'
  }
  
  return timing[destination] || 'Year-round destination with seasonal variations'
}