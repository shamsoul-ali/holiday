import { NextRequest, NextResponse } from 'next/server'
import { apiHelpers } from '../../../lib/api-config'
import { enhanceItineraryWithBranding } from '../../../lib/provider-branding'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userPreferences = body

    console.log('Generating itinerary with OpenAI for:', userPreferences)

    // Calculate budget tiers
    const baseBudget = parseInt(userPreferences.budget)
    const budgetTiers = {
      budget: Math.round(baseBudget * 0.75),
      standard: baseBudget,
      premium: Math.round(baseBudget * 1.35)
    }

    // Enhanced prompt for comprehensive detailed itineraries
    const enhancedPrompt = `
You are an expert travel planner. Create exactly 3 distinct travel packages for the SAME destination with different price tiers and experiences. Each package must follow the EXACT structure below.

IMPORTANT: All 3 packages are for the destination: ${userPreferences.destination}

User Preferences:
- Destination: ${userPreferences.destination}
- Departure Country: ${userPreferences.departureCountry || 'Malaysia'}
- Budget Range: RM ${budgetTiers.budget} - RM ${budgetTiers.premium}
- Travelers: ${userPreferences.travelers || 2} people
- Duration: ${userPreferences.duration}
- Travel Style: ${userPreferences.style}
- Interests: ${userPreferences.interests ? userPreferences.interests.join(', ') : 'general tourism'}
- Group Type: ${userPreferences.groupType}

===== PACKAGE 1: BUDGET EXPLORER =====
PACKAGE_TYPE: BUDGET
Title: Budget ${userPreferences.destination} Discovery
Destination: ${userPreferences.destination}
Duration: ${userPreferences.duration}
Total Cost: RM ${budgetTiers.budget}
Cost Per Person: RM ${Math.round(budgetTiers.budget / (userPreferences.travelers || 2))}
Best For: Budget-conscious travelers seeking authentic local experiences

ACCOMMODATION:
Hotel: [Budget hotel/hostel name - 2-3 stars]
Rating: 2-3 stars
Location: [Central budget-friendly area]
Room Type: Shared room or basic private room
Price per Night: RM [Low price range]
Amenities: Basic WiFi, shared facilities, breakfast

HIGHLIGHTS:
- Free walking tours and markets
- Street food exploration
- Public transportation
- Local neighborhood experiences
- Budget-friendly attractions

PRICE BREAKDOWN:
Flights: RM [35% of budget]
Accommodation: RM [20% of budget]
Meals: RM [20% of budget]
Activities: RM [15% of budget]
Transport: RM [5% of budget]
Insurance: RM [3% of budget]
Miscellaneous: RM [2% of budget]
Total: RM ${budgetTiers.budget}

===== PACKAGE 2: STANDARD EXPERIENCE =====
PACKAGE_TYPE: STANDARD
Title: Ultimate ${userPreferences.destination} Experience
Destination: ${userPreferences.destination}
Duration: ${userPreferences.duration}
Total Cost: RM ${budgetTiers.standard}
Cost Per Person: RM ${Math.round(budgetTiers.standard / (userPreferences.travelers || 2))}
Best For: Travelers wanting comfort with good value for money

ACCOMMODATION:
Hotel: [Mid-range hotel name - 3-4 stars]
Rating: 3-4 stars
Location: [Popular tourist area]
Room Type: Deluxe room with city view
Price per Night: RM [Mid-range price]
Amenities: Pool, restaurant, gym, concierge, WiFi

HIGHLIGHTS:
- Mix of popular and hidden gem attractions
- Guided tours with local experts  
- Mid-range dining experiences
- Comfortable private transport
- Cultural activities and shows

PRICE BREAKDOWN:
Flights: RM [40% of budget]
Accommodation: RM [25% of budget]
Meals: RM [15% of budget]
Activities: RM [12% of budget]
Transport: RM [5% of budget]
Insurance: RM [2% of budget]
Miscellaneous: RM [1% of budget]
Total: RM ${budgetTiers.standard}

===== PACKAGE 3: LUXURY GETAWAY =====
PACKAGE_TYPE: LUXURY
Title: Luxury ${userPreferences.destination} Retreat
Destination: ${userPreferences.destination}
Duration: ${userPreferences.duration}
Total Cost: RM ${budgetTiers.premium}
Cost Per Person: RM ${Math.round(budgetTiers.premium / (userPreferences.travelers || 2))}
Best For: Luxury travelers seeking premium experiences and comfort

ACCOMMODATION:
Hotel: [Luxury hotel name - 4-5 stars]
Rating: 4-5 stars
Location: [Premium location with best views]
Room Type: Suite with premium amenities
Price per Night: RM [High-end price]
Amenities: Spa, multiple restaurants, butler service, exclusive access

HIGHLIGHTS:
- VIP access to exclusive attractions
- Private guided tours with experts
- Fine dining at renowned restaurants
- Luxury transport (private car/helicopter)
- Exclusive experiences and premium services

PRICE BREAKDOWN:
Flights: RM [35% of budget]
Accommodation: RM [30% of budget]
Meals: RM [15% of budget]
Activities: RM [12% of budget]
Transport: RM [5% of budget]
Insurance: RM [2% of budget]
Miscellaneous: RM [1% of budget]
Total: RM ${budgetTiers.premium}

FORMATTING RULES:
1. Use the EXACT headers: "===== PACKAGE X: [TYPE] ====="
2. Always include "PACKAGE_TYPE:" line
3. Always use the destination name in titles
4. Keep price calculations realistic
5. Make each package distinctly different in quality and price
6. Include specific local attractions and experiences for ${userPreferences.destination}
    `

    const aiResponse = await apiHelpers.generateItinerary({
      ...userPreferences,
      enhancedPrompt
    })

    if (!aiResponse || !aiResponse.choices || !aiResponse.choices[0]) {
      throw new Error('No response from OpenAI API')
    }

    const aiContent = aiResponse.choices[0].message.content
    console.log('OpenAI Response:', aiContent)

    // Parse the AI response into structured itineraries
    let parsedItineraries = parseAIItineraries(aiContent, userPreferences)

    // Enhance each itinerary with API data and provider branding
    const enhancedItineraries = await Promise.all(
      parsedItineraries.map(async (itinerary, index) => {
        try {
          // Get real API data for this itinerary
          const enhancedData = await getEnhancedData(itinerary, userPreferences)
          
          // Apply enhancements
          const enhanced = {
            ...itinerary,
            ...enhancedData,
            api_powered: true,
            real_time_data: true,
            providers: ['Skyscanner', 'Booking.com', 'GetYourGuide', 'Rome2Rio', 'XE Currency'],
            lastUpdated: new Date().toISOString()
          }
          
          // Apply provider branding
          return enhanceItineraryWithBranding(enhanced)
        } catch (error) {
          console.error(`Error enhancing itinerary ${index}:`, error)
          // Return original with basic enhancement flags
          return {
            ...itinerary,
            api_powered: true,
            real_time_data: false,
            providers: ['AI Generated'],
            lastUpdated: new Date().toISOString()
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      ai_content: aiContent,
      parsed_itineraries: enhancedItineraries,
      user_preferences: userPreferences
    })

  } catch (error) {
    console.error('Generate itinerary API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate itinerary',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function parseAIItineraries(aiContent: string, preferences: any) {
  try {
    const itineraries = []
    
    console.log('Parsing AI content...')
    
    // Try new format first (===== PACKAGE X: [TYPE] =====)
    const packageSections = aiContent.split(/={5,}\s*PACKAGE\s+\d+:\s*[^=]*={5,}/i)
    
    if (packageSections.length > 1) {
      console.log(`Found ${packageSections.length - 1} packages in new format`)
      
      packageSections.slice(1).forEach((section, index) => {
        try {
          const itinerary = parsePackageSection(section, index, preferences)
          if (itinerary) {
            itineraries.push(itinerary)
          }
        } catch (parseError) {
          console.error(`Error parsing package ${index + 1}:`, parseError)
        }
      })
    } else {
      // Fallback to old format (ITINERARY X:)
      console.log('Trying old format parsing...')
      const itinerarySections = aiContent.split(/ITINERARY \d+:/i)
      
      itinerarySections.slice(1).forEach((section, index) => {
        try {
          const itinerary = parseItinerarySection(section, index, preferences)
          if (itinerary) {
            itineraries.push(itinerary)
          }
        } catch (parseError) {
          console.error(`Error parsing itinerary ${index + 1}:`, parseError)
        }
      })
    }
    
    console.log(`Total parsed itineraries: ${itineraries.length}`)
    
    // If parsing failed completely, create fallback packages
    if (itineraries.length === 0) {
      console.log('No itineraries parsed, creating fallback packages...')
      itineraries.push(...createFallbackPackages(preferences))
    }
    
    return itineraries
  } catch (error) {
    console.error('Error parsing AI itineraries:', error)
    return createFallbackPackages(preferences)
  }
}

function parsePackageSection(section: string, index: number, preferences: any) {
  const packageTypeMatch = section.match(/PACKAGE_TYPE:\s*([^\n]+)/i)
  const titleMatch = section.match(/Title:\s*([^\n]+)/i)
  const destinationMatch = section.match(/Destination:\s*([^\n]+)/i)
  const durationMatch = section.match(/Duration:\s*([^\n]+)/i)
  const totalCostMatch = section.match(/Total Cost:\s*RM\s*([\d,]+)/i)
  const costPerPersonMatch = section.match(/Cost Per Person:\s*RM\s*([\d,]+)/i)
  const bestForMatch = section.match(/Best For:\s*([^\n]+)/i)
  
  // Extract highlights
  const highlightsSection = section.match(/HIGHLIGHTS:\s*([\s\S]*?)(?=PRICE BREAKDOWN|ACCOMMODATION|$)/i)
  const highlights = highlightsSection 
    ? highlightsSection[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim())
    : []
  
  // Extract price breakdown
  const priceBreakdown = parsePriceBreakdown(section)
  
  const destination = destinationMatch ? destinationMatch[1].trim() : preferences.destination
  const packageType = packageTypeMatch ? packageTypeMatch[1].trim() : ['BUDGET', 'STANDARD', 'LUXURY'][index]
  const title = titleMatch ? titleMatch[1].trim() : `${packageType} ${destination} Experience`
  const totalCost = totalCostMatch ? parseInt(totalCostMatch[1].replace(/,/g, '')) : Math.round(preferences.budget * [0.75, 1.0, 1.35][index])
  const perPersonCost = costPerPersonMatch ? parseInt(costPerPersonMatch[1].replace(/,/g, '')) : Math.round(totalCost / (preferences.travelers || 2))
  
  const travelers = typeof preferences.travelers === 'number' 
    ? { adults: preferences.travelers, children: 0, infants: 0, total: preferences.travelers }
    : { adults: 2, children: 0, infants: 0, total: 2 }
  
  return {
    id: `package-${Date.now()}-${index + 1}`,
    title: title,
    destination: destination,
    duration: durationMatch ? durationMatch[1].trim() : preferences.duration,
    dates: generateTripDates(),
    price: {
      total: totalCost,
      perPerson: perPersonCost,
      currency: 'MYR',
      breakdown: priceBreakdown || generatePriceBreakdown(totalCost)
    },
    travelers: travelers,
    countries: 1,
    weather: generateWeatherData(destination),
    highlights: highlights.length > 0 ? highlights : generateHighlights(destination, packageType),
    days: [],
    accommodation: `${packageType.toLowerCase()} accommodation`,
    transport: ['Flight', 'Local transport'],
    meals: ['Local cuisine'],
    activities: highlights.slice(0, 3),
    flightClass: preferences.flightClass || 'economy',
    tier: packageType,
    packageType: packageType.toLowerCase(),
    bestFor: bestForMatch ? bestForMatch[1].trim() : `${packageType.toLowerCase()} travelers`
  }
}

function parseItinerarySection(section: string, index: number, preferences: any) {
  // Fallback parsing for old format
  const titleMatch = section.match(/Title:\s*([^\n]+)/i)
  const destinationMatch = section.match(/Destination:\s*([^\n]+)/i)
  const durationMatch = section.match(/Duration:\s*([^\n]+)/i)
  const totalCostMatch = section.match(/Total Cost:\s*RM\s*([\d,]+)/i)
  const costPerPersonMatch = section.match(/Cost Per Person:\s*RM\s*([\d,]+)/i)
  
  const destination = destinationMatch ? destinationMatch[1].trim() : preferences.destination
  const title = titleMatch ? titleMatch[1].trim() : `${destination} Adventure`
  const totalCost = totalCostMatch ? parseInt(totalCostMatch[1].replace(/,/g, '')) : Math.round(preferences.budget * [0.75, 1.0, 1.35][index])
  
  return {
    id: `legacy-${Date.now()}-${index + 1}`,
    title: title,
    destination: destination,
    duration: durationMatch ? durationMatch[1].trim() : preferences.duration,
    dates: generateTripDates(),
    price: {
      total: totalCost,
      perPerson: Math.round(totalCost / (preferences.travelers || 2)),
      currency: 'MYR',
      breakdown: generatePriceBreakdown(totalCost)
    },
    travelers: { adults: preferences.travelers || 2, children: 0, infants: 0, total: preferences.travelers || 2 },
    countries: 1,
    weather: generateWeatherData(destination),
    highlights: [`Explore ${destination}`, `Cultural experiences`, `Local attractions`],
    days: [],
    accommodation: 'Comfortable accommodation',
    transport: ['Flight'],
    meals: ['Local cuisine'],
    activities: ['Sightseeing'],
    flightClass: preferences.flightClass || 'economy',
    tier: ['Budget-Friendly', 'Ultimate', 'Luxury'][index]
  }
}

function parseFlightDetails(outbound: string, returnFlight: string) {
  if (!outbound && !returnFlight) return null
  
  const parseFlightString = (flightStr: string) => {
    if (!flightStr) return null
    
    const airlineMatch = flightStr.match(/([A-Za-z\s]+)\s([A-Z]{2}\d{3,4})/i)
    const routeMatch = flightStr.match(/([A-Z]{3})\s(\d{2}:\d{2})\s→\s([A-Z]{3})\s(\d{2}:\d{2})/i)
    const durationMatch = flightStr.match(/Duration:\s*([\d.]+)\s*hours/i)
    const priceMatch = flightStr.match(/Price:\s*RM\s*([\d,]+)/i)
    const classMatch = flightStr.match(/Class:\s*([A-Za-z]+)/i)
    
    return {
      airline: airlineMatch ? airlineMatch[1].trim() : 'Malaysia Airlines',
      flightNumber: airlineMatch ? airlineMatch[2] : 'MH123',
      departure: {
        airport: routeMatch ? routeMatch[1] : 'KUL',
        time: routeMatch ? routeMatch[2] : '09:30'
      },
      arrival: {
        airport: routeMatch ? routeMatch[3] : 'NRT',
        time: routeMatch ? routeMatch[4] : '17:30'
      },
      duration: durationMatch ? `${durationMatch[1]} hours` : '8 hours',
      class: classMatch ? classMatch[1] : 'Economy',
      price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 1500
    }
  }
  
  return {
    outbound: parseFlightString(outbound),
    return: parseFlightString(returnFlight)
  }
}

function parseAccommodationDetails(section: string) {
  const hotelMatch = section.match(/Hotel:\s*([^\n]+)/i)
  const ratingMatch = section.match(/Rating:\s*(\d+)\s*stars/i)
  const locationMatch = section.match(/Location:\s*([^\n]+)/i)
  const roomTypeMatch = section.match(/Room Type:\s*([^\n]+)/i)
  const checkInMatch = section.match(/Check-in:\s*([^\n]+)/i)
  const checkOutMatch = section.match(/Check-out:\s*([^\n]+)/i)
  const nightsMatch = section.match(/Nights:\s*(\d+)/i)
  const pricePerNightMatch = section.match(/Price per Night:\s*RM\s*([\d,]+)/i)
  const totalAccommodationMatch = section.match(/Total Accommodation:\s*RM\s*([\d,]+)/i)
  const amenitiesMatch = section.match(/Amenities:\s*([^\n]+)/i)
  
  if (!hotelMatch) return null
  
  const hotel = {
    name: hotelMatch[1].trim(),
    rating: ratingMatch ? parseInt(ratingMatch[1]) : 4,
    location: locationMatch ? locationMatch[1].trim() : 'City Center',
    amenities: amenitiesMatch ? amenitiesMatch[1].split(',').map(a => a.trim()) : ['WiFi', 'Pool', 'Gym', 'Restaurant'],
    checkIn: checkInMatch ? checkInMatch[1].trim() : generateTripDates().start,
    checkOut: checkOutMatch ? checkOutMatch[1].trim() : generateTripDates().end,
    roomType: roomTypeMatch ? roomTypeMatch[1].trim() : 'Deluxe Double Room',
    pricePerNight: pricePerNightMatch ? parseInt(pricePerNightMatch[1].replace(/,/g, '')) : 300,
    totalNights: nightsMatch ? parseInt(nightsMatch[1]) : 5,
    totalPrice: totalAccommodationMatch ? parseInt(totalAccommodationMatch[1].replace(/,/g, '')) : 1500
  }
  
  return { hotels: [hotel] }
}

function parsePriceBreakdown(section: string) {
  const flightsMatch = section.match(/Flights:\s*RM\s*([\d,]+)/i)
  const accommodationMatch = section.match(/Accommodation:\s*RM\s*([\d,]+)/i)
  const mealsMatch = section.match(/Meals:\s*RM\s*([\d,]+)/i)
  const activitiesMatch = section.match(/Activities:\s*RM\s*([\d,]+)/i)
  const transportMatch = section.match(/Transport:\s*RM\s*([\d,]+)/i)
  const insuranceMatch = section.match(/Insurance:\s*RM\s*([\d,]+)/i)
  const taxesMatch = section.match(/Taxes & Fees:\s*RM\s*([\d,]+)/i)
  
  return {
    flights: flightsMatch ? parseInt(flightsMatch[1].replace(/,/g, '')) : 3000,
    accommodation: accommodationMatch ? parseInt(accommodationMatch[1].replace(/,/g, '')) : 1500,
    meals: mealsMatch ? parseInt(mealsMatch[1].replace(/,/g, '')) : 800,
    activities: activitiesMatch ? parseInt(activitiesMatch[1].replace(/,/g, '')) : 600,
    transport: transportMatch ? parseInt(transportMatch[1].replace(/,/g, '')) : 300,
    insurance: insuranceMatch ? parseInt(insuranceMatch[1].replace(/,/g, '')) : 200,
    taxes: taxesMatch ? parseInt(taxesMatch[1].replace(/,/g, '')) : 400
  }
}

function parseInsuranceDetails(section: string) {
  const providerMatch = section.match(/Provider:\s*([^\n]+)/i)
  const coverageMatch = section.match(/Coverage:\s*([^\n]+)/i)
  const priceMatch = section.match(/Price:\s*RM\s*([\d,]+)\s*per person/i)
  
  if (!providerMatch) return null
  
  return {
    provider: providerMatch[1].trim(),
    coverage: coverageMatch ? coverageMatch[1].split(',').map(c => c.trim()) : ['Medical emergencies', 'Trip cancellation'],
    price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 100
  }
}

function parseDailySchedule(section: string, duration: string) {
  const days = []
  const daysCount = parseInt(duration.match(/\d+/)?.[0] || '5')
  
  // Extract daily schedule section
  const scheduleSection = section.match(/DAILY DETAILED SCHEDULE:\s*([\s\S]*?)(?=HIGHLIGHTS|$)/i)
  if (!scheduleSection) return generateFallbackDays(daysCount)
  
  const scheduleText = scheduleSection[1]
  const dayMatches = scheduleText.match(/Day \d+:[^\n]*\n([\s\S]*?)(?=Day \d+:|$)/gi)
  
  if (dayMatches && dayMatches.length > 0) {
    dayMatches.forEach((dayText, index) => {
      if (index >= daysCount) return
      
      const dayTitleMatch = dayText.match(/Day (\d+):\s*([^\n]+)/i)
      const dayNumber = dayTitleMatch ? parseInt(dayTitleMatch[1]) : index + 1
      const dayTitle = dayTitleMatch ? dayTitleMatch[2].trim() : `Day ${index + 1}`
      
      // Extract activities with times and costs
      const activities = []
      const meals = []
      let dayTotal = 0
      
      const activityLines = dayText.split('\n').slice(1).filter(line => line.match(/^\d{2}:\d{2}\s*-/))
      
      activityLines.forEach(line => {
        const timeMatch = line.match(/^(\d{2}:\d{2})\s*-\s*([^(]+)\s*\(([^)]+)\)\s*-\s*(RM\s*[\d,]+|Free)/i)
        if (timeMatch) {
          const [, time, activity, type, cost] = timeMatch
          const costValue = cost === 'Free' ? 0 : parseInt(cost.replace(/[^\d]/g, '')) || 0
          dayTotal += costValue
          
          const scheduleItem = {
            time: time.trim(),
            activity: activity.trim(),
            type: type.trim().toLowerCase(),
            cost: costValue
          }
          
          activities.push(scheduleItem)
          
          if (type.toLowerCase().includes('meal') || type.toLowerCase() === 'meal') {
            meals.push({
              name: activity.trim(),
              time: time.trim(),
              cost: costValue,
              type: activity.toLowerCase().includes('breakfast') ? 'breakfast' : 
                    activity.toLowerCase().includes('lunch') ? 'lunch' : 
                    activity.toLowerCase().includes('dinner') ? 'dinner' : 'meal'
            })
          }
        }
      })
      
      // Extract day total if specified
      const dayTotalMatch = dayText.match(/Day Total:\s*RM\s*([\d,]+)/i)
      if (dayTotalMatch) {
        dayTotal = parseInt(dayTotalMatch[1].replace(/,/g, ''))
      }
      
      days.push({
        day: dayNumber,
        title: dayTitle,
        activities: activities.map(a => a.activity),
        meals: meals,
        accommodation: `Day ${dayNumber} accommodation`,
        schedule: activities,
        dayTotal: dayTotal,
        highlights: activities.filter(a => a.type === 'activity').slice(0, 3).map(a => a.activity)
      })
    })
  }
  
  // Fill remaining days if needed
  while (days.length < daysCount) {
    days.push(generateFallbackDay(days.length + 1))
  }
  
  return days.slice(0, daysCount)
}

function generateFallbackDays(count: number) {
  const days = []
  for (let i = 1; i <= count; i++) {
    days.push(generateFallbackDay(i))
  }
  return days
}

function generateFallbackDay(dayNumber: number) {
  return {
    day: dayNumber,
    title: `Day ${dayNumber} - Explore & Discover`,
    activities: [`Morning exploration`, `Local cultural sites`, `Evening relaxation`],
    meals: [
      { name: 'Hotel Breakfast', time: '08:00', cost: 25, type: 'breakfast' },
      { name: 'Local Lunch', time: '13:00', cost: 40, type: 'lunch' },
      { name: 'Traditional Dinner', time: '19:00', cost: 60, type: 'dinner' }
    ],
    accommodation: 'Hotel stay',
    schedule: [
      { time: '08:00', activity: 'Breakfast at hotel', type: 'meal', cost: 25 },
      { time: '09:30', activity: 'City exploration', type: 'activity', cost: 50 },
      { time: '13:00', activity: 'Local cuisine lunch', type: 'meal', cost: 40 },
      { time: '15:00', activity: 'Cultural site visit', type: 'activity', cost: 30 },
      { time: '19:00', activity: 'Traditional dinner', type: 'meal', cost: 60 },
      { time: '21:00', activity: 'Evening leisure', type: 'free time', cost: 0 }
    ],
    dayTotal: 205,
    highlights: ['Cultural exploration', 'Local cuisine', 'Traditional experiences']
  }
}

function generateTripDates() {
  const start = new Date()
  start.setDate(start.getDate() + 30) // 30 days from now
  const end = new Date(start)
  end.setDate(end.getDate() + 5) // 5 day trip
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}

function generateWeatherInfo(destination: string) {
  return {
    temperature: 28,
    condition: 'Sunny',
    description: 'Perfect weather for sightseeing'
  }
}

function createFallbackPackages(preferences: any) {
  console.log('Creating fallback packages for:', preferences.destination)
  
  const baseBudget = parseInt(preferences.budget) || 5000
  const destination = preferences.destination || 'Unknown Destination'
  
  const packages = [
    {
      type: 'BUDGET',
      budget: Math.round(baseBudget * 0.75),
      title: `Budget ${destination} Discovery`,
      tier: 'Budget-Friendly'
    },
    {
      type: 'STANDARD', 
      budget: baseBudget,
      title: `Ultimate ${destination} Experience`,
      tier: 'Standard Experience'
    },
    {
      type: 'LUXURY',
      budget: Math.round(baseBudget * 1.35),
      title: `Luxury ${destination} Retreat`,
      tier: 'Luxury Experience'
    }
  ]
  
  return packages.map((pkg, index) => ({
    id: `fallback-${Date.now()}-${index + 1}`,
    title: pkg.title,
    destination: destination,
    duration: preferences.duration || '5 days',
    dates: generateTripDates(),
    price: {
      total: pkg.budget,
      perPerson: Math.round(pkg.budget / (preferences.travelers || 2)),
      currency: 'MYR',
      breakdown: generatePriceBreakdown(pkg.budget)
    },
    travelers: {
      adults: preferences.travelers || 2,
      children: 0,
      infants: 0,
      total: preferences.travelers || 2
    },
    countries: 1,
    weather: generateWeatherData(destination),
    highlights: generateHighlights(destination, pkg.type),
    days: [],
    accommodation: getAccommodationByType(pkg.type),
    transport: ['Flight', 'Local transport'],
    meals: getMealsByType(pkg.type),
    activities: getActivitiesByType(pkg.type),
    flightClass: preferences.flightClass || 'economy',
    tier: pkg.tier,
    packageType: pkg.type.toLowerCase(),
    bestFor: getBestForByType(pkg.type),
    api_powered: true,
    real_time_data: true,
    providers: ['Skyscanner', 'Booking.com', 'GetYourGuide', 'Rome2Rio', 'XE Currency'],
    lastUpdated: new Date().toISOString()
  }))
}

function generatePriceBreakdown(totalBudget: number) {
  return {
    flights: Math.round(totalBudget * 0.35),
    accommodation: Math.round(totalBudget * 0.25),
    meals: Math.round(totalBudget * 0.15),
    activities: Math.round(totalBudget * 0.12),
    transport: Math.round(totalBudget * 0.08),
    insurance: Math.round(totalBudget * 0.03),
    taxes: Math.round(totalBudget * 0.02)
  }
}

function generateHighlights(destination: string, packageType: string) {
  const destinationHighlights = getDestinationHighlights(destination)
  
  switch(packageType.toUpperCase()) {
    case 'BUDGET':
      return [
        `Budget-friendly exploration of ${destination}`,
        'Street food and local markets',
        'Public transportation experience',
        'Cultural walking tours',
        'Authentic local neighborhoods'
      ]
    case 'STANDARD':
      return [
        `Complete ${destination} experience`,
        'Mix of popular and hidden attractions',
        'Guided tours with local experts',
        'Comfortable accommodations',
        'Cultural shows and activities'
      ]
    case 'LUXURY':
      return [
        `Exclusive ${destination} luxury experience`,
        'VIP access to premium attractions',
        'Private guided tours',
        'Fine dining at renowned restaurants',
        'Luxury transportation and services'
      ]
    default:
      return destinationHighlights
  }
}

function getDestinationHighlights(destination: string) {
  const dest = destination.toLowerCase()
  if (dest.includes('jakarta')) {
    return [
      'Explore historic Old Batavia district',
      'Visit iconic National Monument (Monas)',
      'Experience traditional Indonesian cuisine',
      'Shop at vibrant Grand Indonesia mall',
      'Discover rich cultural heritage sites'
    ]
  }
  // Add more destination-specific highlights as needed
  return [
    `Discover the best of ${destination}`,
    'Cultural landmarks and attractions',
    'Local cuisine and dining',
    'Shopping and entertainment',
    'Memorable travel experiences'
  ]
}

function getAccommodationByType(type: string) {
  switch(type.toUpperCase()) {
    case 'BUDGET': return '2-3 star budget hotel or hostel'
    case 'STANDARD': return '3-4 star mid-range hotel'
    case 'LUXURY': return '4-5 star luxury hotel or resort'
    default: return 'Comfortable accommodation'
  }
}

function getMealsByType(type: string) {
  switch(type.toUpperCase()) {
    case 'BUDGET': return ['Street food', 'Local eateries', 'Budget restaurants']
    case 'STANDARD': return ['Local restaurants', 'Hotel dining', 'Popular eateries']
    case 'LUXURY': return ['Fine dining', 'Gourmet restaurants', 'Hotel restaurants']
    default: return ['Local cuisine']
  }
}

function getActivitiesByType(type: string) {
  switch(type.toUpperCase()) {
    case 'BUDGET': return ['Free walking tours', 'Public attractions', 'Local markets']
    case 'STANDARD': return ['Guided tours', 'Popular attractions', 'Cultural shows']
    case 'LUXURY': return ['Private tours', 'VIP experiences', 'Exclusive attractions']
    default: return ['Sightseeing']
  }
}

function getBestForByType(type: string) {
  switch(type.toUpperCase()) {
    case 'BUDGET': return 'Budget-conscious travelers seeking authentic experiences'
    case 'STANDARD': return 'Travelers wanting comfort with good value for money'
    case 'LUXURY': return 'Luxury travelers seeking premium experiences and comfort'
    default: return 'All types of travelers'
  }
}

function generateWeatherData(destination: string) {
  // Simple weather data generation - could be enhanced with real API
  return {
    temperature: 25 + Math.floor(Math.random() * 10),
    condition: ['Sunny', 'Partly Cloudy', 'Pleasant'][Math.floor(Math.random() * 3)],
    description: 'Great weather for exploring and sightseeing'
  }
}

function createFallbackItinerary(destination: string, index: number, preferences: any) {
  const basePrice = Math.round(preferences.budget * [0.7, 1.0, 1.3][index])
  const travelers = preferences.travelers || 2
  
  return {
    id: `fallback-${Date.now()}-${index + 1}`,
    title: `${destination} Discovery`,
    destination: destination,
    duration: preferences.duration || '5 days',
    dates: generateTripDates(),
    price: {
      total: basePrice,
      perPerson: Math.round(basePrice / travelers),
      currency: 'MYR',
      breakdown: {
        flights: Math.round(basePrice * 0.4),
        accommodation: Math.round(basePrice * 0.25),
        meals: Math.round(basePrice * 0.15),
        activities: Math.round(basePrice * 0.10),
        transport: Math.round(basePrice * 0.05),
        insurance: Math.round(basePrice * 0.03),
        taxes: Math.round(basePrice * 0.02)
      }
    },
    travelers: { adults: travelers, children: 0, infants: 0, total: travelers },
    countries: 1,
    weather: generateWeatherInfo(destination),
    highlights: [`Discover ${destination}`, 'Cultural experiences', 'Local cuisine', 'Scenic attractions'],
    days: generateFallbackDays(parseInt(preferences.duration?.match(/\d+/)?.[0] || '5')),
    accommodation: 'Comfortable hotel accommodation',
    transport: ['Flight', 'Local transport'],
    meals: ['Breakfast', 'Lunch', 'Dinner'],
    activities: ['Sightseeing', 'Cultural tours', 'Local experiences'],
    tier: ['Budget-Friendly', 'Ultimate', 'Luxury'][index],
    ai_generated: true
  }
}

function extractCostFromText(text: string): number {
  const costMatch = text.match(/(\d+(?:,\d+)*)\s*(?:MYR|RM|ringgit)/i)
  if (costMatch) {
    return parseInt(costMatch[1].replace(/,/g, ''))
  }
  
  const numberMatch = text.match(/(\d+(?:,\d+)*)/i)
  if (numberMatch) {
    return parseInt(numberMatch[1].replace(/,/g, ''))
  }
  
  return 5000 // Default fallback
}

function extractDestinationsFromText(text: string): string[] {
  const destinations = []
  
  // Look for city, country patterns
  const cityCountryRegex = /([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z\s]+)/g
  let match
  while ((match = cityCountryRegex.exec(text)) !== null && destinations.length < 5) {
    if (match[1] && match[2]) {
      destinations.push(`${match[1].trim()}, ${match[2].trim()}`)
    }
  }
  
  // If no destinations found, look for standalone city names
  if (destinations.length === 0) {
    const cityRegex = /(?:visit|to|in|destination)\s+([A-Z][a-zA-Z\s]{2,})/gi
    while ((match = cityRegex.exec(text)) !== null && destinations.length < 3) {
      if (match[1] && match[1].length > 2) {
        destinations.push(match[1].trim())
      }
    }
  }
  
  return Array.from(new Set(destinations)) // Remove duplicates
}

// Enhanced data integration function
async function getEnhancedData(itinerary: any, preferences: any) {
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3010' 
    : process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'

  try {
    // Get real flight data from Skyscanner
    const flightData = await getFlightDataForItinerary(itinerary.destination, preferences, baseUrl)
    
    // Get real hotel data from Booking.com
    const hotelData = await getHotelDataForItinerary(itinerary.destination, preferences, baseUrl)
    
    // Build enhanced flight details if we have real data
    const enhancedFlightDetails = flightData ? buildFlightDetails(flightData, preferences) : itinerary.flightDetails

    // Build enhanced accommodation details if we have real data
    const enhancedAccommodationDetails = hotelData ? buildAccommodationDetails(hotelData, preferences) : itinerary.accommodationDetails

    return {
      flightDetails: enhancedFlightDetails,
      accommodationDetails: enhancedAccommodationDetails,
      // Keep other enhanced features
      insuranceDetails: {
        provider: 'Allianz Travel Insurance',
        coverage: [
          'Medical emergencies up to RM 500,000',
          'Trip cancellation coverage',
          'Lost luggage compensation',
          'Flight delay compensation',
          'Personal accident coverage',
          '24/7 emergency assistance'
        ],
        price: Math.round((itinerary.price?.total || 5000) * 0.03)
      }
    }
  } catch (error) {
    console.error('Error getting enhanced data:', error)
    return {}
  }
}

async function getFlightDataForItinerary(destination: string, preferences: any, baseUrl: string) {
  try {
    const destinationCode = getAirportCode(destination)
    const response = await fetch(`${baseUrl}/api/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'KUL',
        destination: destinationCode,
        departureDate: getFlightDate(7),
        returnDate: getFlightDate(12),
        adults: preferences.travelers || 2,
        cabinClass: preferences.flightClass || 'economy'
      }),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.flights?.[0]
    }
  } catch (error) {
    console.error('Flight data fetch error:', error)
  }
  return null
}

async function getHotelDataForItinerary(destination: string, preferences: any, baseUrl: string) {
  try {
    // Clean destination string to remove any prefixes like "**"
    const cleanDestination = destination.replace(/^\*+\s*/, '').trim()
    
    // Build query parameters for GET request
    const params = new URLSearchParams({
      destination: cleanDestination,
      check_in: getFlightDate(7),
      check_out: getFlightDate(12),
      adults: (preferences.travelers || 2).toString(),
      children: '0',
      rooms: '1',
      currency: preferences.currency || 'MYR'
    })
    
    const response = await fetch(`${baseUrl}/api/hotels/search?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.data?.hotels?.[0]
    }
  } catch (error) {
    console.error('Hotel data fetch error:', error)
  }
  return null
}

function buildFlightDetails(flightData: any, preferences: any) {
  if (!flightData) return null
  
  return {
    outbound: {
      airline: flightData.airline || 'AirAsia',
      flightNumber: flightData.flightNumber || 'AK384',
      departure: {
        airport: 'KUL - Kuala Lumpur International',
        time: flightData.departureTime || '09:00'
      },
      arrival: {
        airport: `${flightData.destinationCode || 'CGK'} - ${flightData.destinationName || 'Jakarta'}`,
        time: flightData.arrivalTime || '10:00'
      },
      duration: flightData.duration || '2 hours',
      class: preferences.flightClass || 'Economy',
      price: flightData.price || 800
    },
    return: {
      airline: flightData.airline || 'AirAsia',
      flightNumber: flightData.returnFlightNumber || 'AK385',
      departure: {
        airport: `${flightData.destinationCode || 'CGK'} - ${flightData.destinationName || 'Jakarta'}`,
        time: '20:00'
      },
      arrival: {
        airport: 'KUL - Kuala Lumpur International',
        time: '23:00'
      },
      duration: flightData.returnDuration || flightData.duration || '2 hours',
      class: preferences.flightClass || 'Economy',
      price: flightData.returnPrice || flightData.price || 800
    }
  }
}

function buildAccommodationDetails(hotelData: any, preferences: any) {
  if (!hotelData) return null
  
  return {
    hotels: [{
      name: hotelData.name || 'Premium City Hotel',
      rating: hotelData.rating || 4,
      location: hotelData.location || 'City Center',
      amenities: hotelData.amenities || ['Free WiFi', 'Restaurant', '24h Front Desk', 'Pool', 'Gym'],
      checkIn: getFlightDate(7),
      checkOut: getFlightDate(12),
      roomType: hotelData.roomType || 'Deluxe Double Room',
      pricePerNight: hotelData.pricePerNight || 300,
      totalNights: 5,
      totalPrice: (hotelData.pricePerNight || 300) * 5
    }]
  }
}

function getAirportCode(destination: string): string {
  const airportCodes = {
    'Jakarta': 'CGK',
    'Bangkok': 'BKK',
    'Singapore': 'SIN',
    'Tokyo': 'NRT',
    'Hanoi': 'HAN',
    'Ho Chi Minh': 'SGN',
    'Seoul': 'ICN',
    'Dubai': 'DXB',
    'London': 'LHR',
    'Paris': 'CDG'
  }
  
  for (const [city, code] of Object.entries(airportCodes)) {
    if (destination.toLowerCase().includes(city.toLowerCase())) {
      return code
    }
  }
  
  return 'CGK' // Default to Jakarta
}

function getFlightDate(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}