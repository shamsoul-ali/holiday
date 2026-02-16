import { NextRequest, NextResponse } from 'next/server'

interface IntelligenceRequest {
  destination: string
  flightNumber?: string
  hotelId?: string
  userId?: string
  preferences?: {
    alertTypes: string[]
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
    pushNotifications: boolean
  }
}

interface TravelAlert {
  id: string
  type: 'flight' | 'weather' | 'traffic' | 'event' | 'price' | 'safety' | 'activity'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: Date
  actionable: boolean
  action?: {
    label: string
    url?: string
    handler?: string
  }
  location?: string
  duration?: number
  metadata?: Record<string, any>
}

interface LiveIntelligence {
  alerts: TravelAlert[]
  liveData: {
    flights: {
      status: 'on-time' | 'delayed' | 'cancelled' | 'boarding'
      delay?: number
      gate?: string
      terminal?: string
      nextUpdate?: Date
    }
    weather: {
      current: number
      condition: string
      forecast: string
      alerts: string[]
      uvIndex?: number
      humidity?: number
      windSpeed?: number
    }
    traffic: {
      status: 'light' | 'moderate' | 'heavy'
      duration: number
      alternativeRoute?: string
      incidents?: string[]
    }
    events: {
      local: Array<{name: string, impact: string, time?: string}>
      festivals: Array<{name: string, dates: string, location?: string}>
      closures: Array<{location: string, reason: string, until?: string}>
    }
    prices: {
      trend: 'up' | 'down' | 'stable'
      change: number
      alert: boolean
      recommendations?: string[]
    }
    safety: {
      level: 'low' | 'medium' | 'high'
      alerts: string[]
      advisories?: string[]
    }
  }
  insights: {
    bestTimes: {
      activities: string[]
      transportation: string[]
      dining: string[]
    }
    recommendations: Array<{
      type: string
      title: string
      description: string
      confidence: number
    }>
    optimizations: Array<{
      area: string
      suggestion: string
      impact: string
      savings?: number
    }>
  }
  lastUpdated: Date
  nextUpdate: Date
}

class TravelIntelligenceService {
  static async generateIntelligence(request: IntelligenceRequest): Promise<LiveIntelligence> {
    const destination = request.destination.toLowerCase()
    
    // Generate alerts based on destination and current context
    const alerts = await this.generateAlerts(destination, request)
    
    // Generate live data
    const liveData = await this.generateLiveData(destination, request)
    
    // Generate insights and recommendations
    const insights = await this.generateInsights(destination, request, alerts, liveData)
    
    return {
      alerts,
      liveData,
      insights,
      lastUpdated: new Date(),
      nextUpdate: new Date(Date.now() + 5 * 60 * 1000) // Next update in 5 minutes
    }
  }

  private static async generateAlerts(destination: string, request: IntelligenceRequest): Promise<TravelAlert[]> {
    const alerts: TravelAlert[] = []
    const now = new Date()

    // Weather-based alerts
    if (this.shouldIncludeAlert('weather', request)) {
      if (destination.includes('jakarta') || destination.includes('indonesia')) {
        alerts.push({
          id: `weather-${Date.now()}`,
          type: 'weather',
          priority: 'medium',
          title: 'Tropical Weather Alert',
          message: 'Afternoon thunderstorms likely. Plan indoor activities between 2-5 PM.',
          timestamp: now,
          actionable: true,
          action: { label: 'View hourly forecast', url: '/weather-detail' },
          location: destination,
          metadata: { temperature: 32, humidity: 85, rainChance: 70 }
        })
      }
      
      if (destination.includes('kuala lumpur') || destination.includes('malaysia')) {
        alerts.push({
          id: `weather-${Date.now() + 1}`,
          type: 'weather',
          priority: 'low',
          title: 'Pleasant Weather Ahead',
          message: 'Sunny skies with comfortable temperatures. Perfect for outdoor activities.',
          timestamp: now,
          actionable: false,
          location: destination,
          metadata: { temperature: 28, humidity: 60, rainChance: 10 }
        })
      }
    }

    // Flight alerts
    if (this.shouldIncludeAlert('flight', request) && request.flightNumber) {
      alerts.push({
        id: `flight-${Date.now()}`,
        type: 'flight',
        priority: 'high',
        title: 'Flight Status Update',
        message: `Flight ${request.flightNumber} is on schedule. Gate assignment in 2 hours.`,
        timestamp: new Date(now.getTime() - 10 * 60 * 1000),
        actionable: true,
        action: { label: 'Set boarding reminder', handler: 'setBoardingReminder' },
        metadata: { flightNumber: request.flightNumber, status: 'on-time' }
      })
    }

    // Price alerts
    if (this.shouldIncludeAlert('price', request)) {
      alerts.push({
        id: `price-${Date.now()}`,
        type: 'price',
        priority: 'high',
        title: 'Limited Time Deal',
        message: 'Restaurant vouchers 30% off until midnight. Popular spots included.',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000),
        actionable: true,
        action: { label: 'Browse deals', url: '/deals' },
        location: destination,
        metadata: { discount: 30, validUntil: '23:59', category: 'dining' }
      })
    }

    // Event alerts
    if (this.shouldIncludeAlert('event', request)) {
      alerts.push({
        id: `event-${Date.now()}`,
        type: 'event',
        priority: 'medium',
        title: 'Local Cultural Event',
        message: 'Traditional dance performance at city square starting 8 PM. Free admission.',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000),
        actionable: true,
        action: { label: 'Get directions', handler: 'getDirections' },
        location: destination,
        duration: 120,
        metadata: { eventType: 'cultural', admission: 'free', duration: '2 hours' }
      })
    }

    // Traffic alerts
    if (this.shouldIncludeAlert('traffic', request)) {
      alerts.push({
        id: `traffic-${Date.now()}`,
        type: 'traffic',
        priority: 'medium',
        title: 'Traffic Optimization',
        message: 'Alternative route available - saves 15 minutes to city center.',
        timestamp: new Date(now.getTime() - 3 * 60 * 1000),
        actionable: true,
        action: { label: 'Use alternative route', handler: 'useAlternativeRoute' },
        location: destination,
        metadata: { timeSaved: 15, routeType: 'alternative' }
      })
    }

    // Safety alerts
    if (this.shouldIncludeAlert('safety', request)) {
      alerts.push({
        id: `safety-${Date.now()}`,
        type: 'safety',
        priority: 'low',
        title: 'Safety Reminder',
        message: 'Tourist police station nearby. Emergency services: 999',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
        actionable: true,
        action: { label: 'Save emergency contacts', handler: 'saveEmergencyContacts' },
        location: destination,
        metadata: { emergencyNumber: '999', nearbyServices: ['police', 'hospital'] }
      })
    }

    return alerts.slice(0, 10) // Limit to 10 recent alerts
  }

  private static async generateLiveData(destination: string, request: IntelligenceRequest) {
    return {
      flights: {
        status: 'on-time' as const,
        gate: 'G' + Math.floor(Math.random() * 20 + 1),
        terminal: Math.random() > 0.5 ? 'Terminal 1' : 'Terminal 2',
        nextUpdate: new Date(Date.now() + 15 * 60 * 1000)
      },
      weather: {
        current: Math.floor(Math.random() * 8) + 26, // 26-34°C
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        forecast: 'Scattered showers possible in the evening',
        alerts: [],
        uvIndex: Math.floor(Math.random() * 5) + 6, // 6-10
        humidity: Math.floor(Math.random() * 30) + 60, // 60-90%
        windSpeed: Math.floor(Math.random() * 10) + 5 // 5-15 km/h
      },
      traffic: {
        status: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)] as any,
        duration: Math.floor(Math.random() * 30) + 30, // 30-60 minutes
        alternativeRoute: 'Via SMART Tunnel (+5 min, toll MYR 6)',
        incidents: []
      },
      events: {
        local: [
          { name: 'Night Market', impact: 'Road closures 6-11 PM', time: '18:00-23:00' },
          { name: 'Street Festival', impact: 'Heavy pedestrian traffic', time: '19:00-22:00' }
        ],
        festivals: [
          { name: 'Cultural Heritage Festival', dates: 'Dec 15-20', location: 'City Center' }
        ],
        closures: [
          { location: 'Main Boulevard', reason: 'Street maintenance', until: 'Tomorrow 6 AM' }
        ]
      },
      prices: {
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
        change: Math.floor(Math.random() * 30) - 15, // -15% to +15%
        alert: Math.random() > 0.7,
        recommendations: [
          'Book dinner restaurants early for weekend',
          'Transport passes cheaper when bought in advance',
          'Museum tickets 50% off on weekdays'
        ]
      },
      safety: {
        level: 'low' as const,
        alerts: [],
        advisories: [
          'Keep valuables secure in crowded areas',
          'Use official taxis or ride-sharing apps',
          'Emergency services: 999 (Police), 994 (Fire), 991 (Medical)'
        ]
      }
    }
  }

  private static async generateInsights(destination: string, request: IntelligenceRequest, alerts: TravelAlert[], liveData: any) {
    return {
      bestTimes: {
        activities: [
          'Museums: 10 AM - 12 PM (fewer crowds)',
          'Outdoor sightseeing: 7-9 AM, 5-7 PM (cooler weather)',
          'Shopping: 2-5 PM (less crowded malls)'
        ],
        transportation: [
          'Avoid rush hours: 7-9 AM, 5-7 PM',
          'Best taxi availability: 10 AM - 4 PM',
          'Public transport least crowded: 10 AM - 3 PM'
        ],
        dining: [
          'Lunch specials: 11:30 AM - 2 PM',
          'Happy hour deals: 4-6 PM',
          'Street food peak: 6-9 PM'
        ]
      },
      recommendations: [
        {
          type: 'timing',
          title: 'Optimal Activity Schedule',
          description: 'Plan outdoor activities before 11 AM or after 4 PM to avoid heat',
          confidence: 92
        },
        {
          type: 'transportation',
          title: 'Smart Transport Choice',
          description: 'Metro system is 40% faster than taxis during peak hours',
          confidence: 88
        },
        {
          type: 'dining',
          title: 'Local Food Experience',
          description: 'Evening food courts offer authentic local cuisine at great prices',
          confidence: 85
        }
      ],
      optimizations: [
        {
          area: 'Transportation',
          suggestion: 'Purchase 3-day transport pass for unlimited travel',
          impact: 'Save 35% on transportation costs',
          savings: 45
        },
        {
          area: 'Activities',
          suggestion: 'Combine nearby attractions in single trips',
          impact: 'Reduce travel time by 25%'
        },
        {
          area: 'Dining',
          suggestion: 'Lunch at local warungs, dinner at restaurants',
          impact: 'Authentic experience with 40% food savings',
          savings: 120
        }
      ]
    }
  }

  private static shouldIncludeAlert(type: string, request: IntelligenceRequest): boolean {
    if (!request.preferences?.alertTypes) return true
    return request.preferences.alertTypes.includes(type) || request.preferences.alertTypes.includes('all')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: IntelligenceRequest = await request.json()

    if (!body.destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      )
    }

    const intelligence = await TravelIntelligenceService.generateIntelligence(body)

    return NextResponse.json({
      success: true,
      data: intelligence,
      meta: {
        generatedAt: new Date().toISOString(),
        destination: body.destination,
        alertCount: intelligence.alerts.length,
        nextUpdateIn: '5 minutes'
      }
    })

  } catch (error) {
    console.error('Travel Intelligence API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate travel intelligence' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const destination = searchParams.get('destination')

  if (!destination) {
    return NextResponse.json({
      status: 'Travel Intelligence API is operational',
      features: [
        'Real-time weather monitoring',
        'Flight status tracking',
        'Traffic optimization alerts',
        'Local event notifications',
        'Price change alerts',
        'Safety advisories',
        'Personalized recommendations'
      ],
      alertTypes: ['flight', 'weather', 'traffic', 'event', 'price', 'safety', 'activity'],
      updateFrequency: '5 minutes',
      version: '2.0.0'
    })
  }

  // Quick status check for destination
  try {
    const intelligence = await TravelIntelligenceService.generateIntelligence({
      destination,
      preferences: { alertTypes: ['all'], urgencyLevel: 'medium', pushNotifications: false }
    })

    return NextResponse.json({
      destination,
      status: 'active',
      summary: {
        totalAlerts: intelligence.alerts.length,
        highPriorityAlerts: intelligence.alerts.filter(a => a.priority === 'high' || a.priority === 'critical').length,
        weatherCondition: intelligence.liveData.weather.condition,
        trafficStatus: intelligence.liveData.traffic.status,
        lastUpdated: intelligence.lastUpdated
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get destination status' },
      { status: 500 }
    )
  }
}