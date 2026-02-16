import { NextRequest, NextResponse } from 'next/server'

interface TripRequest {
  destination: string
  budget: number
  duration: number
  travelers: number
  travelStyle: string
  interests: string[]
  userMessage: string
}

interface AIRecommendation {
  id: string
  type: 'destination' | 'activity' | 'optimization' | 'alternative' | 'seasonal'
  title: string
  description: string
  confidence: number
  reasoning: string[]
  impact: 'budget' | 'experience' | 'time' | 'convenience'
  savings?: number
  alternatives?: string[]
}

// Enhanced AI logic for trip planning
class TripPlanningAI {
  static generateRecommendations(request: TripRequest): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []

    // Budget optimization analysis
    if (request.budget > 0) {
      const budgetOptimization = this.analyzeBudgetOptimization(request)
      if (budgetOptimization) recommendations.push(budgetOptimization)
    }

    // Seasonal analysis
    const seasonalRec = this.analyzeSeasonalOptimality(request)
    if (seasonalRec) recommendations.push(seasonalRec)

    // Activity recommendations based on interests
    const activityRecs = this.generateActivityRecommendations(request)
    recommendations.push(...activityRecs)

    // Alternative destination suggestions
    const alternatives = this.generateAlternativeDestinations(request)
    if (alternatives) recommendations.push(alternatives)

    // Duration optimization
    const durationRec = this.analyzeDurationOptimization(request)
    if (durationRec) recommendations.push(durationRec)

    return recommendations.slice(0, 5) // Limit to top 5 recommendations
  }

  private static analyzeBudgetOptimization(request: TripRequest): AIRecommendation | null {
    const budgetPerDay = request.budget / request.duration
    const budgetCategory = budgetPerDay < 200 ? 'budget' : budgetPerDay < 500 ? 'mid-range' : 'luxury'
    
    if (request.travelStyle !== budgetCategory) {
      const potentialSavings = Math.floor(request.budget * 0.15)
      return {
        id: 'budget-opt-1',
        type: 'optimization',
        title: 'Smart Budget Optimization',
        description: `Travel mid-week and book accommodations 2-3 zones outside city center for optimal savings`,
        confidence: 87,
        reasoning: [
          `Your ${request.travelStyle} style can be maintained with 15-20% savings`,
          'Mid-week flights are typically 25% cheaper than weekends',
          'Accommodations outside immediate city center offer 30% savings with good transport links'
        ],
        impact: 'budget',
        savings: potentialSavings
      }
    }
    return null
  }

  private static analyzeSeasonalOptimality(request: TripRequest): AIRecommendation | null {
    const destination = request.destination.toLowerCase()
    const currentMonth = new Date().getMonth()
    
    // Simple seasonal analysis for popular destinations
    const seasonalData: Record<string, {optimalMonths: number[], reason: string}> = {
      'japan': { optimalMonths: [3, 4, 10, 11], reason: 'Cherry blossoms (March-May) or autumn colors (Oct-Nov) with mild weather' },
      'thailand': { optimalMonths: [11, 12, 1, 2], reason: 'Cool, dry season with minimal rainfall and comfortable temperatures' },
      'malaysia': { optimalMonths: [12, 1, 2], reason: 'Dry season with lower humidity and fewer afternoon showers' },
      'indonesia': { optimalMonths: [5, 6, 7, 8, 9], reason: 'Dry season with clear skies and calm seas for island hopping' },
      'vietnam': { optimalMonths: [11, 12, 1, 2, 3], reason: 'Cool, dry weather ideal for exploring cities and countryside' },
    }

    for (const [country, data] of Object.entries(seasonalData)) {
      if (destination.includes(country)) {
        const isOptimalSeason = data.optimalMonths.includes(currentMonth)
        return {
          id: 'seasonal-1',
          type: 'seasonal',
          title: isOptimalSeason ? 'Perfect Seasonal Timing' : 'Consider Seasonal Adjustment',
          description: isOptimalSeason 
            ? `Excellent choice! This is peak season for ${request.destination}`
            : `Consider shifting travel dates to optimal season for better experience`,
          confidence: isOptimalSeason ? 92 : 75,
          reasoning: [
            data.reason,
            isOptimalSeason ? 'Current timing aligns with optimal weather conditions' : 'Off-season may mean unpredictable weather',
            isOptimalSeason ? 'All attractions and activities will be fully operational' : 'Some seasonal attractions may be closed'
          ],
          impact: 'experience'
        }
      }
    }

    return {
      id: 'seasonal-generic',
      type: 'seasonal',
      title: 'Weather & Season Analysis',
      description: 'Based on your destination, here are seasonal considerations for optimal experience',
      confidence: 70,
      reasoning: [
        'Weather patterns significantly impact travel experience',
        'Local events and festivals vary by season',
        'Tourist crowds and pricing fluctuate seasonally'
      ],
      impact: 'experience'
    }
  }

  private static generateActivityRecommendations(request: TripRequest): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []
    
    if (request.interests.includes('Cultural Heritage') || request.interests.includes('Historical Sites')) {
      recommendations.push({
        id: 'activity-cultural',
        type: 'activity',
        title: 'Cultural Immersion Opportunities',
        description: 'Prioritize authentic cultural experiences and historical site visits',
        confidence: 85,
        reasoning: [
          'Your interest in cultural heritage aligns with local offerings',
          'Historical sites provide educational and memorable experiences',
          'Local cultural activities offer authentic travel memories'
        ],
        impact: 'experience',
        alternatives: ['Museum passes', 'Heritage walking tours', 'Traditional craft workshops']
      })
    }

    if (request.interests.includes('Food & Dining')) {
      recommendations.push({
        id: 'activity-food',
        type: 'activity',
        title: 'Culinary Experience Strategy',
        description: 'Structure your trip around local food scene and culinary experiences',
        confidence: 88,
        reasoning: [
          'Food experiences create lasting travel memories',
          'Local cuisine is integral to cultural understanding',
          'Food tours and cooking classes offer immersive experiences'
        ],
        impact: 'experience',
        alternatives: ['Street food tours', 'Cooking classes', 'Local market visits']
      })
    }

    if (request.interests.includes('Adventure Sports') && request.travelers <= 4) {
      recommendations.push({
        id: 'activity-adventure',
        type: 'activity',
        title: 'Adventure Activity Planning',
        description: 'Small group size is perfect for adventure activities and extreme sports',
        confidence: 82,
        reasoning: [
          'Small groups have more flexibility for adventure bookings',
          'Adventure activities are more enjoyable with close companions',
          'Safety and instruction quality is better in smaller groups'
        ],
        impact: 'experience',
        alternatives: ['Water sports packages', 'Mountain activities', 'Urban adventures']
      })
    }

    return recommendations
  }

  private static generateAlternativeDestinations(request: TripRequest): AIRecommendation | null {
    const destination = request.destination.toLowerCase()
    
    // Alternative destination suggestions based on common requests
    const alternatives: Record<string, {suggestion: string, reasoning: string[], savings?: number}> = {
      'tokyo': {
        suggestion: 'Consider Osaka or Kyoto for authentic Japanese experience',
        reasoning: [
          'Lower accommodation costs compared to Tokyo',
          'Better access to traditional culture and temples',
          'Excellent food scene with regional specialties'
        ],
        savings: 800
      },
      'singapore': {
        suggestion: 'Penang or Kuala Lumpur offer similar urban experiences',
        reasoning: [
          'Rich cultural diversity and food scene',
          '40-50% lower overall costs',
          'Less crowded with more authentic local experiences'
        ],
        savings: 1200
      },
      'bali': {
        suggestion: 'Lombok or Flores offer unspoiled island experiences',
        reasoning: [
          'Less touristy with pristine natural beauty',
          '30% lower costs for similar tropical experiences',
          'Better opportunities for authentic cultural interaction'
        ],
        savings: 600
      }
    }

    for (const [place, data] of Object.entries(alternatives)) {
      if (destination.includes(place)) {
        return {
          id: 'alternative-dest',
          type: 'alternative',
          title: 'Hidden Gem Alternative',
          description: data.suggestion,
          confidence: 76,
          reasoning: data.reasoning,
          impact: 'experience',
          savings: data.savings,
          alternatives: ['Cultural attractions', 'Local experiences', 'Natural beauty']
        }
      }
    }

    return null
  }

  private static analyzeDurationOptimization(request: TripRequest): AIRecommendation | null {
    if (request.duration < 5) {
      return {
        id: 'duration-short',
        type: 'optimization',
        title: 'Short Trip Optimization',
        description: 'Focus on city center activities to maximize limited time',
        confidence: 80,
        reasoning: [
          'Short trips benefit from concentrated activities',
          'Minimize travel time between attractions',
          'Focus on must-see experiences rather than extensive exploration'
        ],
        impact: 'time'
      }
    }

    if (request.duration > 14) {
      return {
        id: 'duration-long',
        type: 'optimization',
        title: 'Extended Stay Benefits',
        description: 'Take advantage of longer stays with slow travel and local experiences',
        confidence: 85,
        reasoning: [
          'Extended stays allow for weekly accommodation discounts',
          'Opportunity for deeper cultural immersion',
          'Can explore off-the-beaten-path destinations'
        ],
        impact: 'experience',
        savings: Math.floor(request.budget * 0.12)
      }
    }

    return null
  }

  static generateResponse(request: TripRequest): string {
    const recommendations = this.generateRecommendations(request)
    
    if (recommendations.length === 0) {
      return `Based on your ${request.duration}-day trip to ${request.destination} with a ${request.travelStyle} style, I've analyzed your preferences. Your plan looks solid! I'd recommend focusing on ${request.interests.slice(0, 2).join(' and ')} activities that match your interests.`
    }

    const topRec = recommendations[0]
    let response = `I've analyzed your ${request.duration}-day ${request.travelStyle} trip to ${request.destination} for ${request.travelers} travelers. `
    
    if (topRec.type === 'optimization') {
      response += `Great news - I found some optimization opportunities! ${topRec.description}`
    } else if (topRec.type === 'seasonal') {
      response += `Regarding timing, ${topRec.description}`
    } else if (topRec.type === 'alternative') {
      response += `I have an interesting alternative suggestion: ${topRec.description}`
    } else {
      response += `For activities, ${topRec.description}`
    }

    response += ` I've generated ${recommendations.length} personalized recommendations to enhance your trip experience and optimize your budget.`
    
    return response
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TripRequest = await request.json()

    // Validate required fields
    if (!body.destination || !body.userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: destination and userMessage' },
        { status: 400 }
      )
    }

    // Generate AI response and recommendations
    const aiResponse = TripPlanningAI.generateResponse(body)
    const recommendations = TripPlanningAI.generateRecommendations(body)

    return NextResponse.json({
      response: aiResponse,
      recommendations,
      metadata: {
        destination: body.destination,
        budget: body.budget,
        duration: body.duration,
        travelStyle: body.travelStyle,
        processingTime: Date.now()
      }
    })

  } catch (error) {
    console.error('AI Trip Planner error:', error)
    return NextResponse.json(
      { error: 'Failed to process trip planning request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'AI Trip Planning service is operational',
    features: [
      'Budget optimization analysis',
      'Seasonal timing recommendations',
      'Activity suggestions based on interests',
      'Alternative destination proposals',
      'Duration optimization strategies'
    ],
    version: '1.0.0'
  })
}