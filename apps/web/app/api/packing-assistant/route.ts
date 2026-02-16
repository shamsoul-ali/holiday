import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '../../../lib/api-config'

interface PackingRequest {
  destination: string
  departure_date: string
  return_date?: string
  travelers: {
    adults: number
    children: number
    infants: number
  }
  trip_type: 'leisure' | 'business' | 'adventure' | 'cultural' | 'romantic' | 'family'
  accommodation_type: 'hotel' | 'hostel' | 'resort' | 'apartment' | 'camping'
  activities: string[]
  climate_preference?: 'tropical' | 'temperate' | 'cold' | 'desert' | 'mountain'
  special_requirements?: string[]
  airline?: string
  baggage_type?: 'carry_on_only' | 'checked_bag' | 'both'
}

interface PackingItem {
  name: string
  category: 'clothing' | 'electronics' | 'toiletries' | 'documents' | 'health' | 'accessories' | 'gear'
  priority: 'essential' | 'recommended' | 'optional'
  quantity: string
  reason: string
  alternatives?: string[]
  brand_recommendations?: string[]
  estimated_cost?: string
  packing_tip?: string
}

interface WeatherInfo {
  average_temp_high: number
  average_temp_low: number
  rainfall_mm: number
  humidity_percent: number
  conditions: string[]
  season: string
  uv_index: number
}

interface PackingResponse {
  success: boolean
  data?: {
    destination_info: {
      country: string
      region: string
      climate_zone: string
      cultural_notes: string[]
      local_customs: string[]
    }
    weather_forecast: WeatherInfo
    packing_list: {
      essentials: PackingItem[]
      clothing: PackingItem[]
      electronics: PackingItem[]
      toiletries: PackingItem[]
      documents: PackingItem[]
      health_safety: PackingItem[]
      activities: PackingItem[]
      optional: PackingItem[]
    }
    packing_tips: {
      general: string[]
      destination_specific: string[]
      climate_specific: string[]
      cultural_considerations: string[]
    }
    baggage_guidelines: {
      carry_on_restrictions: string[]
      checked_baggage_tips: string[]
      airline_specific: string[]
      prohibited_items: string[]
    }
    shopping_locally: {
      recommended_items: string[]
      cost_savings: string[]
      quality_considerations: string[]
    }
    final_checklist: string[]
  }
  error?: string
}

// Mock weather database - In production, this would come from a weather API
const getWeatherInfo = (destination: string, month: number): WeatherInfo => {
  const weatherData: { [key: string]: WeatherInfo } = {
    'Bangkok': {
      average_temp_high: 35,
      average_temp_low: 26,
      rainfall_mm: month >= 5 && month <= 10 ? 200 : 50,
      humidity_percent: 75,
      conditions: month >= 5 && month <= 10 ? ['rainy', 'humid', 'thunderstorms'] : ['hot', 'sunny', 'humid'],
      season: month >= 5 && month <= 10 ? 'rainy' : 'dry',
      uv_index: 11
    },
    'Tokyo': {
      average_temp_high: month <= 3 || month >= 11 ? 12 : month >= 6 && month <= 8 ? 30 : 22,
      average_temp_low: month <= 3 || month >= 11 ? 3 : month >= 6 && month <= 8 ? 24 : 14,
      rainfall_mm: month >= 6 && month <= 7 ? 180 : 100,
      humidity_percent: 65,
      conditions: month <= 3 || month >= 11 ? ['cool', 'dry'] : month >= 6 && month <= 8 ? ['hot', 'humid', 'rainy'] : ['mild', 'pleasant'],
      season: month <= 3 || month >= 11 ? 'winter' : month >= 6 && month <= 8 ? 'summer' : 'spring/autumn',
      uv_index: month >= 5 && month <= 9 ? 8 : 4
    },
    'Singapore': {
      average_temp_high: 32,
      average_temp_low: 25,
      rainfall_mm: month >= 11 || month <= 1 ? 250 : 150,
      humidity_percent: 85,
      conditions: ['hot', 'humid', 'thunderstorms'],
      season: 'tropical',
      uv_index: 12
    },
    'default': {
      average_temp_high: 28,
      average_temp_low: 20,
      rainfall_mm: 100,
      humidity_percent: 70,
      conditions: ['variable'],
      season: 'temperate',
      uv_index: 6
    }
  }

  // Find matching destination
  for (const [key, data] of Object.entries(weatherData)) {
    if (destination.toLowerCase().includes(key.toLowerCase())) {
      return data
    }
  }
  
  return weatherData.default
}

const generatePackingList = (request: PackingRequest, weather: WeatherInfo): any => {
  const tripDuration = request.return_date 
    ? Math.ceil((new Date(request.return_date).getTime() - new Date(request.departure_date).getTime()) / (1000 * 60 * 60 * 24))
    : 7

  const packingList = {
    essentials: [
      {
        name: 'Passport',
        category: 'documents',
        priority: 'essential',
        quantity: '1 per person',
        reason: 'Required for international travel',
        packing_tip: 'Ensure valid for 6+ months beyond return date'
      },
      {
        name: 'Travel Insurance Documents',
        category: 'documents',
        priority: 'essential',
        quantity: '1 set',
        reason: 'Medical emergencies and trip protection',
        packing_tip: 'Keep digital and physical copies'
      },
      {
        name: 'Phone Charger',
        category: 'electronics',
        priority: 'essential',
        quantity: '1-2',
        reason: 'Communication and navigation',
        packing_tip: 'Bring backup cable and portable battery'
      }
    ],

    clothing: generateClothingList(weather, tripDuration, request.activities, request.trip_type),
    electronics: generateElectronicsList(request.destination, tripDuration),
    toiletries: generateToiletriesList(tripDuration, weather),
    documents: generateDocumentsList(request.destination),
    health_safety: generateHealthList(request.destination, weather),
    activities: generateActivityGearList(request.activities, weather),
    optional: generateOptionalItems(request.trip_type, tripDuration)
  }

  return packingList
}

const generateClothingList = (weather: WeatherInfo, duration: number, activities: string[], tripType: string): PackingItem[] => {
  const clothing: PackingItem[] = []
  
  // Base clothing calculations
  const tshirtCount = Math.min(Math.ceil(duration * 0.8), 7)
  const pantsCount = Math.min(Math.ceil(duration / 3), 4)
  const underwearCount = duration + 2
  
  // Temperature-based clothing
  if (weather.average_temp_high > 30) {
    clothing.push(
      {
        name: 'Lightweight T-shirts/Tank Tops',
        category: 'clothing',
        priority: 'essential',
        quantity: `${tshirtCount}`,
        reason: 'Hot climate requires breathable, quick-dry materials',
        alternatives: ['Bamboo fiber shirts', 'Merino wool tees'],
        packing_tip: 'Choose light colors to reflect heat'
      },
      {
        name: 'Lightweight Shorts',
        category: 'clothing',
        priority: 'essential',
        quantity: `${Math.min(pantsCount, 3)}`,
        reason: 'Hot weather comfort and cultural appropriateness',
        packing_tip: 'Knee-length or longer for temple visits'
      },
      {
        name: 'Sun Hat',
        category: 'clothing',
        priority: 'recommended',
        quantity: '1',
        reason: `UV index of ${weather.uv_index} requires sun protection`,
        alternatives: ['Baseball cap', 'Wide-brim hat', 'Bucket hat']
      }
    )
  }

  if (weather.average_temp_low < 15) {
    clothing.push(
      {
        name: 'Light Jacket/Cardigan',
        category: 'clothing',
        priority: 'essential',
        quantity: '1',
        reason: `Low temperatures around ${weather.average_temp_low}°C`,
        packing_tip: 'Packable down jacket saves space'
      },
      {
        name: 'Long Pants',
        category: 'clothing',
        priority: 'essential',
        quantity: `${pantsCount}`,
        reason: 'Cooler weather and cultural considerations',
        alternatives: ['Jeans', 'Chinos', 'Travel pants']
      }
    )
  }

  // Rain gear
  if (weather.rainfall_mm > 150) {
    clothing.push({
      name: 'Lightweight Rain Jacket',
      category: 'clothing',
      priority: 'recommended',
      quantity: '1',
      reason: `High rainfall expected (${weather.rainfall_mm}mm average)`,
      alternatives: ['Packable poncho', 'Umbrella'],
      packing_tip: 'Waterproof, not just water-resistant'
    })
  }

  // Activity-specific clothing
  if (activities.includes('swimming') || activities.includes('beach')) {
    clothing.push({
      name: 'Swimwear',
      category: 'clothing',
      priority: 'essential',
      quantity: '1-2',
      reason: 'Beach/swimming activities planned',
      packing_tip: 'Bring two so one can dry while using the other'
    })
  }

  if (activities.includes('hiking') || activities.includes('adventure')) {
    clothing.push({
      name: 'Hiking Boots/Sturdy Shoes',
      category: 'clothing',
      priority: 'essential',
      quantity: '1 pair',
      reason: 'Adventure activities require proper footwear',
      packing_tip: 'Break them in before travel to avoid blisters'
    })
  }

  // Universal items
  clothing.push(
    {
      name: 'Comfortable Walking Shoes',
      category: 'clothing',
      priority: 'essential',
      quantity: '1 pair',
      reason: 'Daily exploration and sightseeing',
      brand_recommendations: ['Allbirds', 'Adidas Ultraboost', 'Nike Air Max'],
      packing_tip: 'Wear your heaviest shoes while traveling to save luggage weight'
    },
    {
      name: 'Flip-flops/Sandals',
      category: 'clothing',
      priority: 'recommended',
      quantity: '1 pair',
      reason: 'Hotel rooms, beaches, and casual wear',
      alternatives: ['Shower slides', 'Comfortable sandals']
    },
    {
      name: 'Underwear',
      category: 'clothing',
      priority: 'essential',
      quantity: `${underwearCount}`,
      reason: 'Daily essentials with extras for laundry delays',
      packing_tip: 'Quick-dry materials are ideal for travel'
    },
    {
      name: 'Socks',
      category: 'clothing',
      priority: 'essential',
      quantity: `${underwearCount}`,
      reason: 'Daily comfort and foot health',
      brand_recommendations: ['Darn Tough', 'Smartwool', 'Bombas'],
      packing_tip: 'Moisture-wicking materials prevent blisters'
    }
  )

  // Business/formal clothing
  if (tripType === 'business') {
    clothing.push({
      name: 'Business Attire',
      category: 'clothing',
      priority: 'essential',
      quantity: 'As needed',
      reason: 'Professional meetings and events',
      packing_tip: 'Wrinkle-resistant fabrics or pack with dry cleaning bags'
    })
  }

  return clothing
}

const generateElectronicsList = (destination: string, duration: number): PackingItem[] => {
  return [
    {
      name: 'Universal Power Adapter',
      category: 'electronics',
      priority: 'essential',
      quantity: '1',
      reason: 'Different plug types in international destinations',
      brand_recommendations: ['Epicka', 'BESTEK', 'NEWVANGA'],
      packing_tip: 'Check your destination\'s plug type in advance'
    },
    {
      name: 'Portable Battery/Power Bank',
      category: 'electronics',
      priority: 'recommended',
      quantity: '1-2',
      reason: 'Long days of sightseeing drain phone batteries',
      packing_tip: '10,000mAh capacity is ideal for travel',
      estimated_cost: 'RM 50-100'
    },
    {
      name: 'Extra Charging Cables',
      category: 'electronics',
      priority: 'recommended',
      quantity: '1 set',
      reason: 'Backup in case of loss or damage',
      packing_tip: 'Pack in carry-on bag for easy access'
    },
    {
      name: 'Camera (Optional)',
      category: 'electronics',
      priority: 'optional',
      quantity: '1',
      reason: 'Better photo quality than phone camera',
      alternatives: ['High-quality phone camera', 'GoPro for adventures'],
      packing_tip: 'Don\'t forget extra memory cards and batteries'
    },
    {
      name: 'Noise-Cancelling Headphones',
      category: 'electronics',
      priority: 'recommended',
      quantity: '1',
      reason: 'Long flights and noisy transportation',
      brand_recommendations: ['Sony WH-1000XM4', 'Bose QuietComfort', 'AirPods Pro'],
      packing_tip: 'Bluetooth headphones eliminate wire tangles'
    }
  ]
}

const generateToiletriesList = (duration: number, weather: WeatherInfo): PackingItem[] => {
  const toiletries: PackingItem[] = [
    {
      name: 'Toothbrush & Toothpaste',
      category: 'toiletries',
      priority: 'essential',
      quantity: '1 set',
      reason: 'Daily oral hygiene',
      packing_tip: 'Travel-size toothpaste for carry-on compliance (100ml max)'
    },
    {
      name: 'Shampoo & Conditioner',
      category: 'toiletries',
      priority: 'essential',
      quantity: 'Travel size',
      reason: 'Hair care during travel',
      alternatives: ['Hotel-provided', 'Solid shampoo bars'],
      packing_tip: 'Many hotels provide these, check before packing'
    },
    {
      name: 'Deodorant',
      category: 'toiletries',
      priority: 'essential',
      quantity: '1',
      reason: 'Personal hygiene and comfort',
      packing_tip: 'Stick deodorant is easier for travel than aerosol'
    },
    {
      name: 'Razor & Shaving Cream',
      category: 'toiletries',
      priority: 'recommended',
      quantity: '1 set',
      reason: 'Personal grooming',
      packing_tip: 'Disposable razors in checked bag, electric in carry-on'
    }
  ]

  // Hot climate additions
  if (weather.average_temp_high > 30) {
    toiletries.push({
      name: 'Sunscreen (SPF 30+)',
      category: 'toiletries',
      priority: 'essential',
      quantity: '1-2 bottles',
      reason: `High UV index of ${weather.uv_index} requires strong sun protection`,
      packing_tip: 'Reef-safe sunscreen required in some destinations',
      estimated_cost: 'RM 30-60'
    })
  }

  // High humidity additions
  if (weather.humidity_percent > 75) {
    toiletries.push({
      name: 'Antifungal Powder',
      category: 'toiletries',
      priority: 'recommended',
      quantity: '1',
      reason: 'High humidity can cause skin issues',
      packing_tip: 'Apply to feet and other areas prone to moisture'
    })
  }

  return toiletries
}

const generateDocumentsList = (destination: string): PackingItem[] => {
  return [
    {
      name: 'Flight Tickets (Digital + Print)',
      category: 'documents',
      priority: 'essential',
      quantity: '1 set',
      reason: 'Required for travel',
      packing_tip: 'Screenshots saved offline in case of no internet'
    },
    {
      name: 'Hotel Confirmation',
      category: 'documents',
      priority: 'essential',
      quantity: '1 set',
      reason: 'Proof of accommodation for immigration',
      packing_tip: 'Include address in local language'
    },
    {
      name: 'Travel Itinerary',
      category: 'documents',
      priority: 'recommended',
      quantity: '1 copy',
      reason: 'Reference for activities and emergency contacts',
      packing_tip: 'Share with someone at home'
    },
    {
      name: 'Emergency Contacts List',
      category: 'documents',
      priority: 'essential',
      quantity: '1 copy',
      reason: 'Local embassy, hotel, and personal contacts',
      packing_tip: 'Include local emergency numbers (police, medical)'
    },
    {
      name: 'Passport Photos',
      category: 'documents',
      priority: 'recommended',
      quantity: '2-4',
      reason: 'Visa applications or replacement documents if needed',
      packing_tip: 'Recent photos meeting international standards'
    }
  ]
}

const generateHealthList = (destination: string, weather: WeatherInfo): PackingItem[] => {
  const health: PackingItem[] = [
    {
      name: 'Personal Medications',
      category: 'health',
      priority: 'essential',
      quantity: 'Full supply + extra',
      reason: 'Prescriptions may not be available abroad',
      packing_tip: 'Keep in original containers with prescription labels'
    },
    {
      name: 'First Aid Kit',
      category: 'health',
      priority: 'recommended',
      quantity: '1 compact kit',
      reason: 'Minor injuries and common ailments',
      packing_tip: 'Include band-aids, pain relievers, antiseptic wipes'
    },
    {
      name: 'Hand Sanitizer',
      category: 'health',
      priority: 'recommended',
      quantity: '1 travel bottle',
      reason: 'Hygiene when soap and water unavailable',
      packing_tip: '60ml max for carry-on, larger size for checked bag'
    },
    {
      name: 'Insect Repellent',
      category: 'health',
      priority: 'recommended',
      quantity: '1',
      reason: 'Protection against mosquitoes and other insects',
      packing_tip: 'DEET-based repellent is most effective',
      estimated_cost: 'RM 20-40'
    }
  ]

  // Hot/humid climate health items
  if (weather.average_temp_high > 30 && weather.humidity_percent > 70) {
    health.push({
      name: 'Electrolyte Supplements',
      category: 'health',
      priority: 'recommended',
      quantity: '1 pack',
      reason: 'Prevent dehydration in hot, humid climate',
      alternatives: ['Coconut water', 'Sports drinks'],
      packing_tip: 'Powder form is more travel-friendly than liquids'
    })
  }

  return health
}

const generateActivityGearList = (activities: string[], weather: WeatherInfo): PackingItem[] => {
  const gear: PackingItem[] = []

  if (activities.includes('swimming') || activities.includes('beach')) {
    gear.push(
      {
        name: 'Beach Towel',
        category: 'gear',
        priority: 'recommended',
        quantity: '1',
        reason: 'Beach and swimming activities',
        alternatives: ['Quick-dry microfiber towel'],
        packing_tip: 'Microfiber towels are more compact and dry faster'
      },
      {
        name: 'Waterproof Phone Case',
        category: 'gear',
        priority: 'optional',
        quantity: '1',
        reason: 'Protect electronics near water',
        packing_tip: 'Test waterproofing before travel'
      }
    )
  }

  if (activities.includes('hiking') || activities.includes('adventure')) {
    gear.push(
      {
        name: 'Daypack/Hiking Backpack',
        category: 'gear',
        priority: 'essential',
        quantity: '1',
        reason: 'Carry supplies during day trips and hikes',
        brand_recommendations: ['Osprey Daylite', 'Patagonia Refugio'],
        packing_tip: 'Foldable packs save space when not in use'
      },
      {
        name: 'Water Bottle',
        category: 'gear',
        priority: 'essential',
        quantity: '1',
        reason: 'Stay hydrated during activities',
        alternatives: ['Hydration bladder', 'Collapsible bottle'],
        packing_tip: 'Insulated bottles keep water cool in hot weather'
      }
    )
  }

  if (activities.includes('photography') || activities.includes('sightseeing')) {
    gear.push({
      name: 'Universal Travel Adapter',
      category: 'gear',
      priority: 'recommended',
      quantity: '1',
      reason: 'Charge camera and devices in different countries',
      packing_tip: 'Some adapters include USB ports for multiple devices'
    })
  }

  return gear
}

const generateOptionalItems = (tripType: string, duration: number): PackingItem[] => {
  const optional: PackingItem[] = [
    {
      name: 'Travel Pillow',
      category: 'accessories',
      priority: 'optional',
      quantity: '1',
      reason: 'Comfort during long flights and bus rides',
      brand_recommendations: ['Trtl', 'Cabeau Evolution', 'Ostrich Pillow'],
      packing_tip: 'Inflatable pillows take up less space'
    },
    {
      name: 'Eye Mask & Earplugs',
      category: 'accessories',
      priority: 'optional',
      quantity: '1 set',
      reason: 'Better sleep in unfamiliar environments',
      packing_tip: 'Essential for light sleepers and shared accommodations'
    },
    {
      name: 'Laundry Bag',
      category: 'accessories',
      priority: 'optional',
      quantity: '1',
      reason: 'Separate dirty clothes from clean',
      alternatives: ['Plastic bags', 'Mesh laundry bags'],
      packing_tip: 'Doubles as a beach bag or shopping bag'
    }
  ]

  if (duration > 7) {
    optional.push({
      name: 'Laundry Detergent Sheets',
      category: 'accessories',
      priority: 'recommended',
      quantity: '1 pack',
      reason: 'Longer trips require doing laundry',
      packing_tip: 'Sheets are lighter and spill-proof compared to liquid'
    })
  }

  if (tripType === 'business') {
    optional.push({
      name: 'Laptop/Tablet',
      category: 'electronics',
      priority: 'essential',
      quantity: '1',
      reason: 'Work requirements and presentations',
      packing_tip: 'Backup all important files before travel'
    })
  }

  return optional
}

export async function POST(request: NextRequest) {
  try {
    const body: PackingRequest = await request.json()
    
    if (!body.destination || !body.departure_date) {
      return NextResponse.json({
        success: false,
        error: 'Destination and departure date are required'
      }, { status: 400 })
    }
    
    // Parse travel month for weather data
    const travelMonth = new Date(body.departure_date).getMonth() + 1
    
    // Get weather information
    const weather = getWeatherInfo(body.destination, travelMonth)
    
    // Generate comprehensive packing list
    const packingList = generatePackingList(body, weather)
    
    // Generate destination-specific information
    const destinationInfo = {
      country: body.destination.includes(',') ? body.destination.split(',')[1]?.trim() : 'Unknown',
      region: 'Southeast Asia', // Would be determined by destination in production
      climate_zone: weather.season,
      cultural_notes: [
        'Dress modestly when visiting religious sites',
        'Remove shoes before entering homes and temples',
        'Learn basic local phrases to show respect'
      ],
      local_customs: [
        'Tipping practices vary by location',
        'Bargaining is common in markets',
        'Business cards should be received with both hands'
      ]
    }
    
    // Generate comprehensive tips
    const packingTips = {
      general: [
        'Roll clothes instead of folding to save 30% space',
        'Wear your heaviest items on the plane',
        'Pack one complete outfit in carry-on',
        'Leave 25% of luggage space for souvenirs',
        'Use packing cubes for organization',
        'Check airline baggage restrictions before packing'
      ],
      destination_specific: [
        `${body.destination} has high humidity - pack quick-dry materials`,
        'Local markets sell basic toiletries if you forget items',
        'International brands may be more expensive locally',
        'Power outlets use different plugs - bring universal adapter'
      ],
      climate_specific: [
        weather.rainfall_mm > 150 ? 'Pack waterproof gear for rainy season' : 'Light rain jacket for occasional showers',
        weather.uv_index > 8 ? 'Strong sun protection essential - SPF 30+ sunscreen' : 'Basic sun protection recommended',
        weather.humidity_percent > 75 ? 'Choose breathable, moisture-wicking fabrics' : 'Standard cotton clothing is suitable'
      ],
      cultural_considerations: [
        'Cover shoulders and knees when visiting religious sites',
        'Modest swimwear may be required at some beaches/pools',
        'Business attire tends to be more formal in Asia'
      ]
    }
    
    const baggageGuidelines = {
      carry_on_restrictions: [
        'Liquids must be 100ml or less in clear bag',
        'No sharp objects (scissors, knives, razors)',
        'Electronics must be easily removable for security',
        'Medicines in original containers with labels'
      ],
      checked_baggage_tips: [
        'Pack fragile items in center of suitcase',
        'Use TSA-approved locks for security',
        'Put identification inside and outside luggage',
        'Distribute weight evenly to avoid overweight fees'
      ],
      airline_specific: body.airline ? [
        `${body.airline} allows 7kg carry-on`,
        `Check ${body.airline} website for latest restrictions`,
        'Consider purchasing extra baggage allowance in advance'
      ] : [
        'Check your specific airline\'s baggage policy',
        'Budget airlines often have stricter weight limits',
        'Premium airlines may allow larger carry-ons'
      ],
      prohibited_items: [
        'Liquids over 100ml in carry-on',
        'Sharp objects and tools',
        'Flammable materials',
        'Batteries over 100Wh capacity'
      ]
    }

    const response: PackingResponse = {
      success: true,
      data: {
        destination_info: destinationInfo,
        weather_forecast: weather,
        packing_list: packingList,
        packing_tips: packingTips,
        baggage_guidelines: baggageGuidelines,
        shopping_locally: {
          recommended_items: [
            'Basic toiletries (shampoo, toothpaste)',
            'Umbrellas and rain gear',
            'Local SIM card',
            'Sunscreen (check if reef-safe required)'
          ],
          cost_savings: [
            'Electronics are often cheaper at home',
            'Clothing basics available at local prices',
            'Pharmacy items readily available',
            'Tourist areas will be more expensive'
          ],
          quality_considerations: [
            'International brands available in major cities',
            'Local products may have different formulations',
            'Check expiry dates on consumables',
            'Counterfeit goods common in some areas'
          ]
        },
        final_checklist: [
          '✈️ Confirm all flights and check-in online',
          '📋 Print or save digital copies of all documents',
          '💊 Ensure medications are properly labeled',
          '🔌 Verify power adapter compatibility',
          '📱 Download offline maps and translation apps',
          '💳 Notify banks of travel plans',
          '🧳 Weigh luggage before leaving home',
          '🏠 Arrange house/pet care if needed',
          '📞 Share itinerary with emergency contacts',
          '✅ Double-check passport validity (6+ months)'
        ]
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('Packing assistant error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate packing recommendations'
    }, { status: 500 })
  }
}