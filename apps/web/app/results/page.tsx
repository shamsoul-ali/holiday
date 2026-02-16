'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Calendar,
  Users,
  Star,
  Heart,
  Share2,
  Eye,
  Thermometer,
  DollarSign,
  Plane,
  Clock,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../components/providers/AuthProvider'
import { favorites } from '../../lib/auth-client'
import { apiHelpers } from '../../lib/api-config'
import PricePredictor from '../../components/PricePredictor'
import PriceAlertManager from '../../components/PriceAlertManager'
import TravelAssistantButton from '../../components/TravelAssistantButton'
import RealTimePriceMonitor from '../../components/RealTimePriceMonitor'
import EnhancedPackageCard from '../../components/EnhancedPackageCard'
import HotelDetailsSection from '../../components/HotelDetailsSection'
import DetailedActivityItinerary from '../../components/DetailedActivityItinerary'
import PackageInclusionsSection from '../../components/PackageInclusionsSection'
import SmartTripPlanningAssistant from '../../components/SmartTripPlanningAssistant'
import RealTimeTravelIntelligence from '../../components/RealTimeTravelIntelligence'
import TravelCommunityHub from '../../components/TravelCommunityHub'
import AdvancedBookingSystem from '../../components/AdvancedBookingSystem'
import TravelDocumentManager from '../../components/TravelDocumentManager'
import toast from 'react-hot-toast'
import APIStatusBanner from '../../components/APIStatusBanner'
import ProviderBadge from '../../components/ProviderBadge'

interface Itinerary {
  id: string
  title: string
  destination: string
  duration: string
  dates: { start: string; end: string }
  price: { 
    total: number; 
    perPerson: number; 
    currency: string;
    breakdown?: {
      flights: number;
      accommodation: number;
      meals: number;
      activities: number;
      transport: number;
      insurance: number;
      taxes: number;
    }
  }
  travelers: {
    adults: number;
    children: number;
    infants: number;
    total: number;
  }
  countries: number
  weather?: { temperature: number; condition: string; description: string }
  highlights: string[]
  days: any[]
  accommodation: string
  transport: string[]
  meals: string[]
  activities: string[]
  flightDetails?: {
    outbound: {
      airline: string;
      flightNumber: string;
      departure: { airport: string; time: string; };
      arrival: { airport: string; time: string; };
      duration: string;
      class: string;
      price: number;
    };
    return: {
      airline: string;
      flightNumber: string;
      departure: { airport: string; time: string; };
      arrival: { airport: string; time: string; };
      duration: string;
      class: string;
      price: number;
    };
  }
  accommodationDetails?: {
    hotels: Array<{
      name: string;
      rating: number;
      location: string;
      amenities: string[];
      checkIn: string;
      checkOut: string;
      roomType: string;
      pricePerNight: number;
      totalNights: number;
      totalPrice: number;
    }>;
  }
  insuranceDetails?: {
    provider: string;
    coverage: string[];
    price: number;
  }
}

export default function ResultsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterBy, setFilterBy] = useState('all')
  const [sortBy, setSortBy] = useState('price-low')
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set())
  const [showPriceAlertManager, setShowPriceAlertManager] = useState(false)
  const [alertPreset, setAlertPreset] = useState<any>(null)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [detailViewId, setDetailViewId] = useState<string | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'hotels' | 'itinerary' | 'inclusions'>('overview')

  // Scroll reveal animations - exactly like David's site
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  useEffect(() => {
    loadItineraries()
    if (user) {
      loadUserFavorites()
    }
  }, [user, searchParams])

  const loadItineraries = async () => {
    setLoading(true)
    
    try {
      // Get data from URL params or generate intelligent AI recommendations
      const data = searchParams.get('data')
      if (data) {
        const parsedData = JSON.parse(decodeURIComponent(data))
        if (parsedData.itineraries) {
          setItineraries(parsedData.itineraries)
        }
      } else {
        // Generate AI-powered personalized itineraries
        const userDestination = searchParams.get('destination')
        const departureCountry = searchParams.get('departureCountry') || 'Malaysia'
        const budget = parseInt(searchParams.get('budget') || '5000')
        const travelers = parseInt(searchParams.get('travelers') || '2')
        const duration = searchParams.get('duration') || '1-week'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const style = searchParams.get('style') || 'comfort'
        const accommodation = searchParams.get('accommodation') || 'hotel'
        const interests = searchParams.get('interests')?.split(',') || []
        const travelType = searchParams.get('travelType') || 'leisure'
        const groupType = searchParams.get('groupType') || 'couple'
        const dietaryReqs = searchParams.get('dietaryReqs')?.split(',') || []
        const letAISuggest = searchParams.get('letAISuggest') === 'true'
        
        const aiItineraries = await generateIntelligentItineraries({
          userDestination,
          departureCountry,
          budget,
          travelers,
          duration,
          startDate,
          endDate,
          style,
          accommodation,
          interests,
          travelType,
          groupType,
          dietaryReqs,
          letAISuggest
        })
        
        setItineraries(aiItineraries)
        
        // Store in localStorage for persistence
        localStorage.setItem('latest-itineraries', JSON.stringify(aiItineraries))
      }
    } catch (error) {
      console.error('Error loading itineraries:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateIntelligentItineraries = async (params: any): Promise<Itinerary[]> => {
    // Use real OpenAI API for destination generation
    const destinations = await getAIGeneratedDestinations(params)
    const durationDays = getDurationDays(params.duration)
    
    return Promise.all(destinations.map(async (dest, index) => {
      const basePrice = calculateIntelligentPricing(dest, params)
      const multipliers = [0.75, 1.0, 1.25] // Budget, Standard, Luxury
      const tiers = ['Budget-Friendly', 'Ultimate', 'Luxury']
      const multiplier = multipliers[index] || 1.0
      const tier = tiers[index] || 'Standard'
      
      const totalPrice = Math.round(basePrice * multiplier)
      const flightDetails = await getFlightDetailsFromAPI(dest, params, tier)
      const accommodationDetails = await getHotelDetailsFromAPI(dest, params, tier, durationDays)
      const priceBreakdown = generatePriceBreakdown(totalPrice, flightDetails, accommodationDetails, durationDays)
      const visaRequirements = getVisaRequirements(params.departureCountry, dest.name)

      return {
        id: `ai-${index + 1}`,
        title: `${tier} ${dest.name} ${params.travelType === 'adventure' ? 'Adventure' : 'Experience'}`,
        destination: dest.name,
        duration: params.duration.replace('-', ' '),
        dates: {
          start: params.startDate || getDefaultStartDate(),
          end: params.endDate || getDefaultEndDate(params.duration)
        },
        price: {
          total: totalPrice,
          perPerson: Math.round(totalPrice / params.travelers),
          currency: 'MYR',
          breakdown: priceBreakdown
        },
        travelers: {
          adults: params.travelers,
          children: 0,
          infants: 0,
          total: params.travelers
        },
        countries: dest.countries,
        weather: dest.weather,
        highlights: getPersonalizedHighlights(dest, params, tier),
        days: generateDetailedItinerary(dest, durationDays, params),
        accommodation: getAccommodationByStyle(params.style, tier),
        transport: getTransportOptions(dest, params.style, tier),
        meals: getMealOptions(params.dietaryReqs, params.style, tier),
        activities: getActivitiesByInterests(params.interests, dest, tier),
        dataSource: dest.dataSource, // Track if from OpenAI or hardcoded
        flightDetails: flightDetails,
        accommodationDetails: accommodationDetails,
        insuranceDetails: generateInsuranceDetails(totalPrice, tier),
        visaRequirements: visaRequirements
      }
    }))
  }

  const getAIGeneratedDestinations = async (params: any) => {
    try {
      console.log('🔍 [DATA SOURCE CHECK] Generating destinations with OpenAI for params:', params)

      const userPreferences = {
        destination: params.letAISuggest ? 'AI-SUGGEST' : params.userDestination,
        departureCountry: params.departureCountry,
        budget: params.budget,
        travelers: params.travelers,
        duration: params.duration,
        style: params.style,
        interests: params.interests,
        flightClass: 'economy', // Default
        groupType: params.groupType || 'couple',
        dietaryReqs: params.dietaryReqs || [],
        currency: 'MYR'
      }

      // Use the new dedicated API endpoint
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPreferences)
      })

      if (response.ok) {
        const data = await response.json()

        if (data.success && data.parsed_itineraries) {
          console.log('✅ [REAL DATA] Using OpenAI parsed itineraries:', data.parsed_itineraries.length, 'packages')

          // Convert AI itineraries to destination format
          const destinations = data.parsed_itineraries.map((itinerary: any, index: number) => ({
            name: itinerary.destination,
            countries: 1,
            weather: { temperature: 25, condition: 'Pleasant', description: 'Great for travel' },
            bestFor: params.interests || ['culture', 'food'],
            priceLevel: index === 0 ? 'low' : index === 1 ? 'medium' : 'high',
            continent: getContinent(itinerary.destination),
            aiGenerated: true,
            aiData: itinerary, // Store full AI data for later use
            dataSource: 'openai' // Track data source
          }))

          console.log('✅ [REAL DATA] AI Generated destinations:', destinations.map(d => d.name))
          return destinations
        } else {
          console.warn('⚠️ [API ISSUE] OpenAI response missing parsed_itineraries:', data)
        }
      } else {
        console.error('❌ [API FAILED] OpenAI API returned error:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ [API FAILED] OpenAI API error:', error)
    }

    // Fallback to intelligent selection from destination pool
    console.warn('⚠️ [FALLBACK DATA] Using hardcoded destination pool')
    const fallbackDests = getAIDestinations(params)
    return fallbackDests.map(d => ({ ...d, dataSource: 'hardcoded' }))
  }

  const parseAIDestinations = (aiContent: string, preferences: any) => {
    try {
      // Try to extract destinations from AI response
      const destinations = []
      
      // Look for common destination patterns in AI response
      const destinationRegex = /(?:destination|visit|travel to|recommended?)[\s\w]*:?\s*([A-Z][a-zA-Z\s,]+?)(?:\n|\.|\,|\s-|\s\|)/gi
      const matches = aiContent.match(destinationRegex)
      
      if (matches && matches.length > 0) {
        matches.slice(0, 3).forEach((match, index) => {
          const cleanDestination = match.replace(/destination|visit|travel to|recommended?/gi, '').replace(/[:,-]/g, '').trim()
          if (cleanDestination.length > 2) {
            destinations.push({
              name: cleanDestination,
              countries: 1,
              weather: { temperature: 25, condition: 'Pleasant', description: 'Ideal for travel' },
              bestFor: preferences.interests || ['culture', 'food'],
              priceLevel: preferences.budget < 3000 ? 'low' : preferences.budget > 8000 ? 'high' : 'medium',
              continent: getContinent(cleanDestination),
              aiGenerated: true
            })
          }
        })
      }
      
      // If no destinations found, extract from broader content
      if (destinations.length === 0) {
        const cityCountryRegex = /([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*),?\s*([A-Z][a-zA-Z]+)/g
        const cityMatches = Array.from(aiContent.matchAll(cityCountryRegex))
        
        cityMatches.slice(0, 3).forEach(match => {
          if (match[1] && match[2]) {
            destinations.push({
              name: `${match[1]}, ${match[2]}`,
              countries: 1,
              weather: { temperature: 25, condition: 'Pleasant', description: 'Great for visiting' },
              bestFor: preferences.interests || ['culture', 'food'],
              priceLevel: preferences.budget < 3000 ? 'low' : preferences.budget > 8000 ? 'high' : 'medium',
              continent: getContinent(match[2]),
              aiGenerated: true
            })
          }
        })
      }
      
      return destinations
    } catch (error) {
      console.error('Error parsing AI destinations:', error)
      return []
    }
  }

  const getContinent = (location: string) => {
    const asianCountries = ['Japan', 'Thailand', 'Korea', 'Singapore', 'Malaysia', 'Indonesia', 'Vietnam', 'Philippines', 'China', 'India']
    const europeanCountries = ['France', 'Italy', 'Spain', 'Germany', 'UK', 'Netherlands', 'Switzerland', 'Greece', 'Portugal']
    const americanCountries = ['USA', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Peru', 'Chile']
    
    if (asianCountries.some(country => location.includes(country))) return 'asia'
    if (europeanCountries.some(country => location.includes(country))) return 'europe'
    if (americanCountries.some(country => location.includes(country))) return 'america'
    return 'other'
  }

  const getFlightDetailsFromAPI = async (dest: any, params: any, tier: string) => {
    try {
      // Get departure airport code
      const departureAirportMap: { [key: string]: string } = {
        'Malaysia': 'KUL', 'Singapore': 'SIN', 'Thailand': 'BKK', 'Indonesia': 'CGK',
        'Philippines': 'MNL', 'Vietnam': 'SGN', 'India': 'DEL', 'China': 'PEK'
      }

      const originCode = departureAirportMap[params.departureCountry] || 'KUL'
      const destinationCode = getDestinationCode(dest.name)
      const departureDate = params.startDate || getDefaultStartDate()
      const returnDate = params.endDate || getDefaultEndDate(params.duration)

      console.log(`🔍 [FLIGHTS] Fetching real flight data: ${originCode} → ${destinationCode}`)

      const flightResponse = await fetch(`/api/flights/search?origin=${originCode}&destination=${destinationCode}&departure_date=${departureDate}&return_date=${returnDate}&adults=${params.travelers}&currency=MYR&cabin_class=${tier === 'Budget-Friendly' ? 'ECONOMY' : tier === 'Luxury' ? 'BUSINESS' : 'ECONOMY'}`)

      if (flightResponse.ok) {
        const flightData = await flightResponse.json()
        if (flightData.success && flightData.data.flights.length > 0) {
          const flight = flightData.data.flights[0] // Get cheapest flight
          console.log(`✅ [REAL DATA - FLIGHTS] Using Amadeus flight: ${flight.airline} RM${flight.price.total}`)
          return {
            outbound: {
              airline: flight.airline,
              flightNumber: flight.flight_number,
              departure: { airport: flight.departure.airport_code, time: flight.departure.time },
              arrival: { airport: flight.arrival.airport_code, time: flight.arrival.time },
              duration: flight.duration,
              class: flight.cabin_class,
              price: Math.round(flight.price.total / 2), // One way price
              dataSource: 'amadeus'
            },
            return: {
              airline: flight.airline,
              flightNumber: flight.flight_number.replace(/\d+/, (match) => String(parseInt(match) + 1)),
              departure: { airport: flight.arrival.airport_code, time: '14:30' },
              arrival: { airport: flight.departure.airport_code, time: '18:45' },
              duration: flight.duration,
              class: flight.cabin_class,
              price: Math.round(flight.price.total / 2), // One way price
              dataSource: 'amadeus'
            }
          }
        } else {
          console.warn(`⚠️ [API ISSUE] No flights found in response for ${originCode} → ${destinationCode}`)
        }
      } else {
        console.error(`❌ [API FAILED] Flight API error: ${flightResponse.status}`)
      }
    } catch (error) {
      console.error('❌ [API FAILED] Flight API error, using fallback:', error)
    }

    // Fallback to original generation function
    console.warn(`⚠️ [FALLBACK DATA - FLIGHTS] Using generated flight data for ${dest.name}`)
    return generateFlightDetails(dest, params.departureCountry, params, tier)
  }

  const getHotelDetailsFromAPI = async (dest: any, params: any, tier: string, days: number) => {
    try {
      const checkIn = params.startDate || getDefaultStartDate()
      const checkOut = params.endDate || getDefaultEndDate(params.duration)
      const cityName = dest.name.split(',')[0] // Get city name only

      console.log(`🔍 [HOTELS] Fetching real hotel data for ${cityName} (${dest.name})`)

      const hotelResponse = await fetch(`/api/hotels/search?destination=${cityName}&check_in=${checkIn}&check_out=${checkOut}&adults=${params.travelers}&currency=MYR&sort_by=price_low_to_high`)

      if (hotelResponse.ok) {
        const hotelData = await hotelResponse.json()
        if (hotelData.success && hotelData.data.hotels.length > 0) {
          console.log(`✅ [REAL DATA - HOTELS] Found ${hotelData.data.hotels.length} hotels from API`)
          
          // Validate that hotels are actually in the requested destination
          const validateHotelLocation = (hotel: any, requestedCity: string): boolean => {
            const hotelLocation = hotel.location?.city || hotel.name || ''
            const requestedLower = requestedCity.toLowerCase()
            const hotelLower = hotelLocation.toLowerCase()
            
            // Check if hotel is in the correct city/country
            if (requestedLower.includes('istanbul') && !hotelLower.includes('istanbul') && !hotelLower.includes('turkey')) {
              console.warn(`Hotel location mismatch: Expected Istanbul, got ${hotelLocation}`)
              return false
            }
            if (requestedLower.includes('bangkok') && !hotelLower.includes('bangkok') && !hotelLower.includes('thailand')) {
              console.warn(`Hotel location mismatch: Expected Bangkok, got ${hotelLocation}`)
              return false
            }
            if (requestedLower.includes('jakarta') && !hotelLower.includes('jakarta') && !hotelLower.includes('indonesia')) {
              console.warn(`Hotel location mismatch: Expected Jakarta, got ${hotelLocation}`)
              return false
            }
            
            return true
          }
          
          // Filter hotels to ensure they're in the correct location
          const validHotels = hotelData.data.hotels.filter(hotel => validateHotelLocation(hotel, cityName))
          
          if (validHotels.length === 0) {
            console.warn(`No valid hotels found for ${cityName}, falling back to original generation`)
            return generateAccommodationDetails(dest, params, tier, days)
          }
          
          // Select hotel based on tier from valid hotels
          let selectedHotel
          if (tier === 'Budget-Friendly') {
            selectedHotel = validHotels[0] // Cheapest
          } else if (tier === 'Luxury') {
            selectedHotel = validHotels[validHotels.length - 1] // Most expensive
          } else {
            selectedHotel = validHotels[Math.floor(validHotels.length / 2)] // Middle option
          }

          if (selectedHotel) {
            return {
              hotels: [{
                name: selectedHotel.name,
                rating: selectedHotel.star_rating,
                location: selectedHotel.location.address,
                amenities: selectedHotel.amenities,
                checkIn: checkIn,
                checkOut: checkOut,
                roomType: selectedHotel.room_types[0]?.type || 'Standard Room',
                pricePerNight: selectedHotel.pricing.per_night,
                totalNights: days,
                totalPrice: selectedHotel.pricing.total
              }]
            }
          }
        }
      }
    } catch (error) {
      console.log('Hotel API error, using fallback:', error)
    }

    // Fallback to original generation function
    return generateAccommodationDetails(dest, params, tier, days)
  }

  const getDestinationCode = (destinationName: string): string => {
    const codes: { [key: string]: string } = {
      'Bangkok': 'BKK', 'Tokyo': 'TYO', 'Singapore': 'SIN', 'Seoul': 'ICN', 
      'Hong Kong': 'HKG', 'Kuala Lumpur': 'KUL', 'Jakarta': 'CGK', 'Manila': 'MNL',
      'Ho Chi Minh': 'SGN', 'Hanoi': 'HAN', 'Osaka': 'KIX', 'Kyoto': 'KIX',
      'Taipei': 'TPE', 'Mumbai': 'BOM', 'Delhi': 'DEL', 'Dubai': 'DXB', 'Istanbul': 'IST'
    }
    
    for (const [city, code] of Object.entries(codes)) {
      if (destinationName.includes(city)) {
        return code
      }
    }
    
    return 'BKK' // Default fallback
  }

  const getOriginAirportCode = (itinerary: any): string => {
    const params = searchParams
    const departureCountry = params.get('departureCountry') || 'Malaysia'
    
    const originCodes: { [key: string]: string } = {
      'Malaysia': 'KUL',
      'Singapore': 'SIN',
      'Thailand': 'BKK',
      'Indonesia': 'CGK',
      'Philippines': 'MNL',
      'Vietnam': 'SGN',
      'Japan': 'NRT',
      'South Korea': 'ICN',
      'Hong Kong': 'HKG',
      'Taiwan': 'TPE'
    }
    
    return originCodes[departureCountry] || 'KUL'
  }

  const getAIDestinations = (params: any) => {
    // AI destination suggestions based on user preferences
    const destinationPool = [
      // Asian destinations
      {
        name: 'Tokyo, Japan',
        countries: 1,
        weather: { temperature: 22, condition: 'Mild', description: 'Perfect spring weather' },
        bestFor: ['culture', 'food', 'technology', 'shopping'],
        priceLevel: 'high',
        continent: 'asia'
      },
      {
        name: 'Bangkok, Thailand',
        countries: 1,
        weather: { temperature: 30, condition: 'Tropical', description: 'Warm and humid' },
        bestFor: ['food', 'culture', 'nightlife', 'budget'],
        priceLevel: 'low',
        continent: 'asia'
      },
      {
        name: 'Seoul, South Korea',
        countries: 1,
        weather: { temperature: 18, condition: 'Cool', description: 'Comfortable weather' },
        bestFor: ['culture', 'food', 'shopping', 'technology'],
        priceLevel: 'medium',
        continent: 'asia'
      },
      // European destinations
      {
        name: 'Paris, France',
        countries: 1,
        weather: { temperature: 20, condition: 'Pleasant', description: 'Ideal for walking' },
        bestFor: ['culture', 'art', 'food', 'history'],
        priceLevel: 'high',
        continent: 'europe'
      },
      {
        name: 'Rome, Italy',
        countries: 1,
        weather: { temperature: 25, condition: 'Sunny', description: 'Perfect Mediterranean weather' },
        bestFor: ['history', 'culture', 'food', 'art'],
        priceLevel: 'medium',
        continent: 'europe'
      },
      {
        name: 'Amsterdam, Netherlands',
        countries: 1,
        weather: { temperature: 17, condition: 'Mild', description: 'Cool and pleasant' },
        bestFor: ['culture', 'art', 'history', 'cycling'],
        priceLevel: 'high',
        continent: 'europe'
      },
      // Middle East & Africa
      {
        name: 'Dubai, UAE',
        countries: 1,
        weather: { temperature: 28, condition: 'Sunny', description: 'Warm desert climate' },
        bestFor: ['luxury', 'shopping', 'modern', 'desert'],
        priceLevel: 'high',
        continent: 'middle-east'
      },
      {
        name: 'Istanbul, Turkey',
        countries: 1,
        weather: { temperature: 23, condition: 'Mild', description: 'Mediterranean climate' },
        bestFor: ['history', 'culture', 'food', 'architecture'],
        priceLevel: 'medium',
        continent: 'europe'
      }
    ]

    let selectedDestinations: any[] = []

    if (params.letAISuggest || params.userDestination === 'AI-SUGGEST' || !params.userDestination) {
      // AI-powered destination selection based on interests and preferences
      const scoredDestinations = destinationPool.map(dest => ({
        ...dest,
        score: calculateDestinationScore(dest, params)
      })).sort((a, b) => b.score - a.score)

      selectedDestinations = scoredDestinations.slice(0, 3)
    } else {
      // User specified destination - find or create
      const userDest = destinationPool.find(d => 
        d.name.toLowerCase().includes(params.userDestination.toLowerCase())
      )
      
      if (userDest) {
        selectedDestinations = [userDest]
        // Add 2 more similar destinations
        const similar = destinationPool
          .filter(d => d !== userDest && d.continent === userDest.continent)
          .slice(0, 2)
        selectedDestinations = selectedDestinations.concat(similar)
      } else {
        // Create custom destination entry
        selectedDestinations = [{
          name: params.userDestination,
          countries: 1,
          weather: { temperature: 25, condition: 'Pleasant', description: 'Great weather for travel' },
          bestFor: params.interests,
          priceLevel: 'medium',
          continent: 'unknown'
        }]
        // Add 2 popular destinations as alternatives
        selectedDestinations = selectedDestinations.concat(destinationPool.slice(0, 2))
      }
    }

    return selectedDestinations
  }

  const calculateDestinationScore = (dest: any, params: any) => {
    let score = 0

    // Interest matching
    const userInterests = params.interests.map((i: string) => i.toLowerCase())
    dest.bestFor.forEach((feature: string) => {
      if (userInterests.some((interest: string) => interest.includes(feature) || feature.includes(interest.split(' ')[0]))) {
        score += 3
      }
    })

    // Budget compatibility
    const budgetLevel = params.budget < 4000 ? 'low' : params.budget > 8000 ? 'high' : 'medium'
    if (dest.priceLevel === budgetLevel) score += 2

    // Travel style compatibility
    if (params.style === 'luxury' && dest.priceLevel === 'high') score += 2
    if (params.style === 'budget' && dest.priceLevel === 'low') score += 2

    // Group type considerations
    if (params.groupType === 'family' && dest.bestFor.includes('family-friendly')) score += 2
    if (params.groupType === 'couple' && dest.continent === 'europe') score += 1

    return score
  }

  const getDurationDays = (duration: string) => {
    switch (duration) {
      case '3-days': return 3
      case '1-week': return 7
      case '2-weeks': return 14
      case '1-month': return 30
      default: return 7
    }
  }

  const calculateIntelligentPricing = (dest: any, params: any) => {
    let basePrice = params.budget * 0.8 // Start with 80% of user budget
    
    // Adjust for departure country economic factors
    const departureCountryMultipliers = {
      'Malaysia': 1.0,        // Base reference
      'Singapore': 1.4,       // Higher cost of living
      'Thailand': 0.85,       // Lower cost of living
      'Indonesia': 0.8,       // Lower cost of living
      'Philippines': 0.75,    // Lower cost of living
      'Vietnam': 0.7,         // Lower cost of living
      'India': 0.65,          // Lower cost of living
      'China': 0.9,           // Moderate cost of living
      'Hong Kong': 1.3,       // High cost of living
      'Taiwan': 1.1,          // Moderate-high cost of living
      'South Korea': 1.2,     // High cost of living
      'Japan': 1.35,          // Very high cost of living
      'Australia': 1.45,      // Very high cost of living
      'New Zealand': 1.4,     // High cost of living
      'United Kingdom': 1.5,  // Very high cost of living
      'United States': 1.55,  // Very high cost of living
      'Canada': 1.4,          // High cost of living
      'Germany': 1.35,        // High cost of living
      'France': 1.3,          // High cost of living
      'Netherlands': 1.35,    // High cost of living
      'Switzerland': 1.7,     // Extremely high cost of living
      'Norway': 1.65,         // Extremely high cost of living
      'UAE': 1.25,            // High cost of living
      'Saudi Arabia': 1.1,    // Moderate-high cost of living
      'Turkey': 0.8           // Lower cost of living
    }
    
    const departureMultiplier = departureCountryMultipliers[params.departureCountry] || 1.0
    basePrice *= departureMultiplier
    
    // Adjust for destination price level
    if (dest.priceLevel === 'high') basePrice *= 1.3
    if (dest.priceLevel === 'low') basePrice *= 0.7
    
    // Adjust for duration
    const days = getDurationDays(params.duration)
    if (days > 7) basePrice *= (1 + (days - 7) * 0.1)
    
    // Adjust for group size
    if (params.travelers > 2) {
      basePrice *= (1 + (params.travelers - 2) * 0.15)
    }
    
    // Currency purchasing power adjustment based on departure country
    const currencyPowerAdjustments = {
      'Malaysia': 1.0,        // Base reference (MYR)
      'Singapore': 1.1,       // SGD stronger than MYR
      'Thailand': 0.95,       // THB slightly weaker
      'Indonesia': 0.85,      // IDR weaker
      'Philippines': 0.8,     // PHP weaker
      'Vietnam': 0.7,         // VND much weaker
      'India': 0.6,           // INR much weaker
      'China': 0.9,           // CNY slightly weaker
      'Hong Kong': 1.1,       // HKD stronger
      'Taiwan': 1.05,         // TWD slightly stronger
      'South Korea': 1.15,    // KRW stronger
      'Japan': 1.2,           // JPY stronger
      'Australia': 1.25,      // AUD stronger
      'New Zealand': 1.2,     // NZD stronger
      'United Kingdom': 1.6,  // GBP much stronger
      'United States': 1.55,  // USD much stronger
      'Canada': 1.4,          // CAD stronger
      'Germany': 1.45,        // EUR stronger
      'France': 1.45,         // EUR stronger
      'Netherlands': 1.45,    // EUR stronger
      'Switzerland': 1.8,     // CHF very strong
      'Norway': 1.7,          // NOK very strong
      'UAE': 1.5,             // AED stronger
      'Saudi Arabia': 1.45,   // SAR stronger
      'Turkey': 0.75          // TRY much weaker than MYR
    }
    
    const currencyMultiplier = currencyPowerAdjustments[params.departureCountry] || 1.0
    basePrice *= currencyMultiplier
    
    return Math.round(basePrice)
  }

  const getDefaultStartDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 2) // 2 months from now
    return date.toISOString().split('T')[0]
  }

  const getDefaultEndDate = (duration: string) => {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() + 2)
    const days = getDurationDays(duration)
    startDate.setDate(startDate.getDate() + days)
    return startDate.toISOString().split('T')[0]
  }

  const getPersonalizedHighlights = (dest: any, params: any, tier: string) => {
    const baseHighlights = {
      'Tokyo, Japan': ['Tokyo Skytree visit', 'Shibuya crossing experience', 'Traditional sushi tasting', 'Cherry blossom viewing'],
      'Bangkok, Thailand': ['Grand Palace tour', 'Floating market experience', 'Street food exploration', 'Thai massage session'],
      'Seoul, South Korea': ['Gyeongbokgung Palace', 'Myeongdong shopping', 'Korean BBQ experience', 'Namsan Tower visit'],
      'Paris, France': ['Eiffel Tower visit', 'Louvre Museum tour', 'Seine river cruise', 'Montmartre exploration'],
      'Rome, Italy': ['Colosseum tour', 'Vatican City visit', 'Authentic pasta cooking class', 'Trevi Fountain'],
      'Amsterdam, Netherlands': ['Canal cruise', 'Van Gogh Museum', 'Vondelpark cycling', 'Anne Frank House'],
      'Dubai, UAE': ['Burj Khalifa visit', 'Desert safari', 'Gold Souk shopping', 'Dubai Marina cruise'],
      'Istanbul, Turkey': ['Hagia Sophia tour', 'Grand Bazaar shopping', 'Bosphorus cruise', 'Turkish bath experience']
    }

    let highlights = baseHighlights[dest.name] || ['Local sightseeing', 'Cultural experiences', 'Local cuisine', 'Historical sites']

    // Customize based on interests
    if (params.interests.includes('Food & Cuisine')) {
      highlights = highlights.map(h => h.includes('food') || h.includes('cuisine') ? h : h).concat(['Local cooking class', 'Food market tour'])
    }
    
    if (params.interests.includes('Culture & History')) {
      highlights = highlights.concat(['Museum visits', 'Historical walking tour'])
    }

    if (tier === 'Luxury') {
      highlights = highlights.map(h => `Premium ${h.toLowerCase()}`).concat(['VIP experiences', 'Private guided tours'])
    }

    if (tier === 'Budget-Friendly') {
      highlights = highlights.map(h => `Budget ${h.toLowerCase()}`).concat(['Free walking tours', 'Local market visits'])
    }

    return highlights.slice(0, 6) // Limit to 6 highlights
  }

  const generateDetailedItinerary = (dest: any, days: number, params: any) => {
    const detailedTemplates = {
      'Tokyo, Japan': [
        {
          day: 1,
          title: 'Arrival & Tokyo Exploration',
          schedule: [
            { time: '6:45 PM', activity: 'Arrive at Narita International Airport', type: 'transport', cost: 0 },
            { time: '8:30 PM', activity: 'Airport Express Train to Shibuya', type: 'transport', cost: 55 },
            { time: '9:30 PM', activity: 'Hotel check-in & rest', type: 'accommodation', cost: 0 },
            { time: '10:00 PM', activity: 'Light dinner at hotel restaurant', type: 'meal', cost: 45 }
          ],
          dayTotal: 100,
          meals: [
            { name: 'Light dinner at hotel restaurant', time: '10:00 PM', cost: 45, type: 'Japanese' }
          ],
          accommodation: 'Hotel Gracery Shinjuku (4-star)',
          highlights: ['Safe arrival', 'First taste of Japan', 'Rest & preparation']
        },
        {
          day: 2,
          title: 'Traditional Tokyo Discovery',
          schedule: [
            { time: '8:00 AM', activity: 'Traditional Japanese breakfast', type: 'meal', cost: 25 },
            { time: '9:30 AM', activity: 'Visit Senso-ji Temple in Asakusa', type: 'activity', cost: 0 },
            { time: '11:00 AM', activity: 'Explore Nakamise Shopping Street', type: 'shopping', cost: 50 },
            { time: '1:00 PM', activity: 'Authentic tempura lunch', type: 'meal', cost: 60 },
            { time: '3:00 PM', activity: 'Tokyo Skytree observation deck', type: 'activity', cost: 85 },
            { time: '5:30 PM', activity: 'Traditional garden stroll at Hamarikyu', type: 'activity', cost: 30 },
            { time: '7:30 PM', activity: 'Kaiseki dinner experience', type: 'meal', cost: 120 }
          ],
          dayTotal: 370,
          meals: [
            { name: 'Traditional Japanese breakfast', time: '8:00 AM', cost: 25, type: 'Japanese' },
            { name: 'Authentic tempura lunch', time: '1:00 PM', cost: 60, type: 'Japanese' },
            { name: 'Kaiseki dinner experience', time: '7:30 PM', cost: 120, type: 'Fine Dining' }
          ],
          accommodation: 'Hotel Gracery Shinjuku (4-star)',
          highlights: ['Historic temples', 'Tokyo skyline views', 'Traditional cuisine', 'Cultural immersion']
        },
        {
          day: 3,
          title: 'Modern Tokyo Culture',
          schedule: [
            { time: '8:30 AM', activity: 'Hotel breakfast buffet', type: 'meal', cost: 30 },
            { time: '10:00 AM', activity: 'Explore Harajuku fashion district', type: 'activity', cost: 0 },
            { time: '11:30 AM', activity: 'Visit Meiji Shrine', type: 'activity', cost: 0 },
            { time: '1:00 PM', activity: 'Sushi lunch at Tsukiji Outer Market', type: 'meal', cost: 80 },
            { time: '3:00 PM', activity: 'Anime & manga culture exploration in Akihabara', type: 'activity', cost: 40 },
            { time: '5:00 PM', activity: 'Shopping in Ginza district', type: 'shopping', cost: 100 },
            { time: '8:00 PM', activity: 'Modern fusion dinner in Roppongi', type: 'meal', cost: 95 }
          ],
          dayTotal: 345,
          meals: [
            { name: 'Hotel breakfast buffet', time: '8:30 AM', cost: 30, type: 'International' },
            { name: 'Sushi lunch at Tsukiji Outer Market', time: '1:00 PM', cost: 80, type: 'Japanese' },
            { name: 'Modern fusion dinner in Roppongi', time: '8:00 PM', cost: 95, type: 'Fusion' }
          ],
          accommodation: 'Hotel Gracery Shinjuku (4-star)',
          highlights: ['Pop culture immersion', 'Sacred shrines', 'World-class sushi', 'Shopping districts']
        }
      ],
      'Bangkok, Thailand': [
        {
          day: 1,
          title: 'Bangkok Temple Discovery',
          schedule: [
            { time: '12:15 PM', activity: 'Arrive at Suvarnabhumi Airport', type: 'transport', cost: 0 },
            { time: '2:00 PM', activity: 'Airport taxi to hotel', type: 'transport', cost: 25 },
            { time: '3:00 PM', activity: 'Hotel check-in & refresh', type: 'accommodation', cost: 0 },
            { time: '4:30 PM', activity: 'Visit Grand Palace complex', type: 'activity', cost: 15 },
            { time: '6:00 PM', activity: 'Explore Wat Pho Temple', type: 'activity', cost: 5 },
            { time: '7:30 PM', activity: 'Street food dinner tour', type: 'meal', cost: 20 }
          ],
          dayTotal: 65,
          meals: [
            { name: 'Welcome Thai lunch', time: '2:30 PM', cost: 12, type: 'Thai' },
            { name: 'Street food dinner tour', time: '7:30 PM', cost: 20, type: 'Street Food' }
          ],
          accommodation: 'Shangri-La Bangkok (5-star)',
          highlights: ['Royal Palace grandeur', 'Golden Buddha statues', 'Authentic street food', 'Thai culture']
        }
      ]
    }

    const basicTemplate = [
      {
        day: 1,
        title: 'Arrival & City Introduction',
        schedule: [
          { time: '2:00 PM', activity: 'Airport arrival & transfer', type: 'transport', cost: 30 },
          { time: '4:00 PM', activity: 'Hotel check-in', type: 'accommodation', cost: 0 },
          { time: '6:00 PM', activity: 'City orientation walk', type: 'activity', cost: 0 },
          { time: '8:00 PM', activity: 'Welcome dinner at local restaurant', type: 'meal', cost: 40 }
        ],
        dayTotal: 70,
        meals: [
          { name: 'Welcome dinner at local restaurant', time: '8:00 PM', cost: 40, type: 'Local' }
        ],
        accommodation: 'Premium City Hotel (4-star)',
        highlights: ['Safe arrival', 'First impressions', 'Local flavors']
      },
      {
        day: 2,
        title: 'Cultural Exploration',
        schedule: [
          { time: '8:00 AM', activity: 'Hotel breakfast', type: 'meal', cost: 20 },
          { time: '10:00 AM', activity: 'Historical site visit', type: 'activity', cost: 25 },
          { time: '1:00 PM', activity: 'Local cuisine lunch', type: 'meal', cost: 35 },
          { time: '3:00 PM', activity: 'Museum or gallery tour', type: 'activity', cost: 20 },
          { time: '6:00 PM', activity: 'Local market exploration', type: 'activity', cost: 10 },
          { time: '8:00 PM', activity: 'Traditional dinner experience', type: 'meal', cost: 50 }
        ],
        dayTotal: 160,
        meals: [
          { name: 'Hotel breakfast', time: '8:00 AM', cost: 20, type: 'Continental' },
          { name: 'Local cuisine lunch', time: '1:00 PM', cost: 35, type: 'Local' },
          { name: 'Traditional dinner experience', time: '8:00 PM', cost: 50, type: 'Traditional' }
        ],
        accommodation: 'Premium City Hotel (4-star)',
        highlights: ['Cultural immersion', 'Historical insights', 'Culinary adventure', 'Local interactions']
      }
    ]

    const template = detailedTemplates[dest.name] || basicTemplate
    let fullItinerary = []
    
    for (let i = 0; i < days; i++) {
      const templateDay = template[i % template.length]
      const isLastDay = i === days - 1
      
      if (isLastDay) {
        fullItinerary.push({
          day: i + 1,
          title: 'Departure Day',
          schedule: [
            { time: '9:00 AM', activity: 'Hotel breakfast & check-out', type: 'meal', cost: 25 },
            { time: '11:00 AM', activity: 'Last-minute shopping or sightseeing', type: 'activity', cost: 30 },
            { time: '1:00 PM', activity: 'Airport transfer', type: 'transport', cost: 35 },
            { time: '2:15 PM', activity: 'Departure flight check-in', type: 'transport', cost: 0 }
          ],
          dayTotal: 90,
          meals: [
            { name: 'Hotel breakfast & check-out', time: '9:00 AM', cost: 25, type: 'Continental' }
          ],
          accommodation: 'Check-out day',
          highlights: ['Final memories', 'Souvenir shopping', 'Safe departure']
        })
      } else {
        fullItinerary.push({
          ...templateDay,
          day: i + 1,
          title: i === 0 ? templateDay.title : `Day ${i + 1} - ${templateDay.title}`
        })
      }
    }

    return fullItinerary
  }

  const getAccommodationByStyle = (style: string, tier: string) => {
    const accommodationMap = {
      'budget': {
        'Budget-Friendly': '3-star hotels & guesthouses',
        'Ultimate': '3-star boutique hotels',
        'Luxury': '4-star hotels'
      },
      'comfort': {
        'Budget-Friendly': '4-star hotels',
        'Ultimate': '4-star premium hotels',
        'Luxury': '5-star luxury hotels'
      },
      'luxury': {
        'Budget-Friendly': '4-star boutique hotels',
        'Ultimate': '5-star luxury resorts',
        'Luxury': 'Ultra-luxury 5-star hotels & suites'
      }
    }

    return accommodationMap[style]?.[tier] || '4-star hotels'
  }

  const getTransportOptions = (dest: any, style: string, tier: string) => {
    const baseTransport = ['International flights', 'Airport transfers']
    
    if (style === 'luxury' || tier === 'Luxury') {
      return [...baseTransport, 'Private car transfers', 'Premium transport options']
    } else if (style === 'budget' || tier === 'Budget-Friendly') {
      return [...baseTransport, 'Public transport passes', 'Budget-friendly local transport']
    } else {
      return [...baseTransport, 'Private transfers', 'Local transport as needed']
    }
  }

  const getMealOptions = (dietaryReqs: string[], style: string, tier: string) => {
    let meals = ['Daily breakfast']
    
    // Add dietary accommodations
    if (dietaryReqs.includes('Halal')) {
      meals.push('Halal-certified restaurants')
    }
    if (dietaryReqs.includes('Vegetarian')) {
      meals.push('Vegetarian meal options')
    }
    if (dietaryReqs.includes('Vegan')) {
      meals.push('Vegan-friendly restaurants')
    }

    // Add style-based meals
    if (style === 'luxury' || tier === 'Luxury') {
      meals.push('Fine dining experiences', 'Michelin-starred restaurants')
    } else if (style === 'budget' || tier === 'Budget-Friendly') {
      meals.push('Local food recommendations', 'Street food tours')
    } else {
      meals.push('Local restaurant recommendations', 'Cultural dining experiences')
    }

    return meals
  }

  const getActivitiesByInterests = (interests: string[], dest: any, tier: string) => {
    let activities = ['City sightseeing', 'Cultural experiences']

    interests.forEach(interest => {
      switch (interest) {
        case 'Culture & History':
          activities.push('Museum visits', 'Historical site tours', 'Heritage walks')
          break
        case 'Food & Cuisine':
          activities.push('Cooking classes', 'Food tours', 'Local market visits')
          break
        case 'Nature & Outdoors':
          activities.push('Nature excursions', 'Hiking trails', 'Scenic viewpoints')
          break
        case 'Shopping':
          activities.push('Shopping district tours', 'Local market shopping', 'Souvenir hunting')
          break
        case 'Nightlife':
          activities.push('Evening entertainment', 'Local nightlife tours', 'Cultural shows')
          break
        case 'Art & Museums':
          activities.push('Art gallery visits', 'Contemporary art tours', 'Creative workshops')
          break
        case 'Adventure Sports':
          activities.push('Adventure activities', 'Outdoor sports', 'Thrill experiences')
          break
        case 'Religious Sites':
          activities.push('Sacred site visits', 'Spiritual experiences', 'Religious tours')
          break
      }
    })

    if (tier === 'Luxury') {
      activities = activities.map(a => `Premium ${a.toLowerCase()}`)
    }

    return Array.from(new Set(activities)).slice(0, 8) // Remove duplicates and limit
  }

  const generateFlightDetails = (dest: any, departureCountry: string, params: any, tier: string) => {
    // Departure airports by country
    const departureAirportMap = {
      'Malaysia': { code: 'KUL', name: 'Kuala Lumpur International Airport' },
      'Singapore': { code: 'SIN', name: 'Singapore Changi Airport' },
      'Thailand': { code: 'BKK', name: 'Suvarnabhumi Airport' },
      'Indonesia': { code: 'CGK', name: 'Jakarta Soekarno-Hatta Airport' },
      'Philippines': { code: 'MNL', name: 'Manila Ninoy Aquino Airport' },
      'Vietnam': { code: 'SGN', name: 'Ho Chi Minh City Airport' },
      'India': { code: 'DEL', name: 'Delhi Indira Gandhi Airport' },
      'China': { code: 'PEK', name: 'Beijing Capital Airport' },
      'Hong Kong': { code: 'HKG', name: 'Hong Kong International Airport' },
      'Taiwan': { code: 'TPE', name: 'Taipei Taoyuan Airport' },
      'South Korea': { code: 'ICN', name: 'Seoul Incheon Airport' },
      'Japan': { code: 'NRT', name: 'Tokyo Narita Airport' },
      'Australia': { code: 'SYD', name: 'Sydney Kingsford Smith Airport' },
      'New Zealand': { code: 'AKL', name: 'Auckland Airport' },
      'United Kingdom': { code: 'LHR', name: 'London Heathrow Airport' },
      'United States': { code: 'LAX', name: 'Los Angeles International Airport' },
      'Canada': { code: 'YYZ', name: 'Toronto Pearson Airport' },
      'Germany': { code: 'FRA', name: 'Frankfurt Airport' },
      'France': { code: 'CDG', name: 'Paris Charles de Gaulle Airport' },
      'Netherlands': { code: 'AMS', name: 'Amsterdam Schiphol Airport' },
      'UAE': { code: 'DXB', name: 'Dubai International Airport' },
      'Saudi Arabia': { code: 'RUH', name: 'Riyadh King Khalid Airport' },
      'Other': { code: 'XXX', name: 'International Airport' }
    }

    // Destination airports
    const destinationAirportMap = {
      'Tokyo, Japan': { code: 'NRT', name: 'Narita International Airport' },
      'Bangkok, Thailand': { code: 'BKK', name: 'Suvarnabhumi Airport' },
      'Seoul, South Korea': { code: 'ICN', name: 'Incheon International Airport' },
      'Paris, France': { code: 'CDG', name: 'Charles de Gaulle Airport' },
      'Rome, Italy': { code: 'FCO', name: 'Fiumicino Airport' },
      'Amsterdam, Netherlands': { code: 'AMS', name: 'Amsterdam Schiphol Airport' },
      'Dubai, UAE': { code: 'DXB', name: 'Dubai International Airport' },
      'Istanbul, Turkey': { code: 'IST', name: 'Istanbul Airport' }
    }

    const airlines = {
      'Tokyo, Japan': ['Japan Airlines', 'ANA', 'Malaysia Airlines'],
      'Bangkok, Thailand': ['Thai Airways', 'AirAsia', 'Malaysia Airlines'],
      'Seoul, South Korea': ['Korean Air', 'Asiana Airlines', 'Malaysia Airlines'],
      'Paris, France': ['Air France', 'Malaysia Airlines', 'Emirates'],
      'Rome, Italy': ['Alitalia', 'Emirates', 'Malaysia Airlines'],
      'Amsterdam, Netherlands': ['KLM', 'Malaysia Airlines', 'Emirates'],
      'Dubai, UAE': ['Emirates', 'Malaysia Airlines', 'Etihad'],
      'Istanbul, Turkey': ['Turkish Airlines', 'Malaysia Airlines', 'Emirates']
    }

    const departureAirport = departureAirportMap[departureCountry] || departureAirportMap['Other']
    const destAirport = destinationAirportMap[dest.name] || { code: 'XXX', name: 'International Airport' }
    const selectedAirline = airlines[dest.name]?.[0] || getPreferredAirline(departureCountry)
    
    const flightClass = tier === 'Luxury' ? 'Business Class' : tier === 'Ultimate' ? 'Premium Economy' : 'Economy Class'
    const baseFlightPrice = calculateFlightPrice(departureCountry, dest.name, tier)

    return {
      outbound: {
        airline: selectedAirline,
        flightNumber: `${selectedAirline.split(' ')[0].toUpperCase().slice(0,2)}${Math.floor(Math.random() * 900) + 100}`,
        departure: { airport: `${departureAirport.code} - ${departureAirport.name}`, time: getDepartureTime(departureCountry) },
        arrival: { airport: `${destAirport.code} - ${destAirport.name}`, time: getArrivalTime(departureCountry, dest.name) },
        duration: getFlightDuration(departureCountry, dest.name),
        class: flightClass,
        price: baseFlightPrice
      },
      return: {
        airline: selectedAirline,
        flightNumber: `${selectedAirline.split(' ')[0].toUpperCase().slice(0,2)}${Math.floor(Math.random() * 900) + 100}`,
        departure: { airport: `${destAirport.code} - ${destAirport.name}`, time: '2:15 PM' },
        arrival: { airport: `${departureAirport.code} - ${departureAirport.name}`, time: getReturnArrivalTime(departureCountry, dest.name) },
        duration: getFlightDuration(departureCountry, dest.name),
        class: flightClass,
        price: baseFlightPrice
      }
    }
  }

  const getPreferredAirline = (departureCountry: string) => {
    const airlineMap = {
      'Malaysia': 'Malaysia Airlines',
      'Singapore': 'Singapore Airlines',
      'Thailand': 'Thai Airways',
      'Indonesia': 'Garuda Indonesia',
      'Philippines': 'Philippine Airlines',
      'Vietnam': 'Vietnam Airlines',
      'India': 'Air India',
      'China': 'Air China',
      'Hong Kong': 'Cathay Pacific',
      'Taiwan': 'China Airlines',
      'South Korea': 'Korean Air',
      'Japan': 'Japan Airlines',
      'Australia': 'Qantas',
      'New Zealand': 'Air New Zealand',
      'United Kingdom': 'British Airways',
      'United States': 'United Airlines',
      'Canada': 'Air Canada',
      'Germany': 'Lufthansa',
      'France': 'Air France',
      'Netherlands': 'KLM',
      'UAE': 'Emirates',
      'Saudi Arabia': 'Saudia'
    }
    return airlineMap[departureCountry] || 'International Airlines'
  }

  const getDepartureTime = (departureCountry: string) => {
    // Standard departure times based on region
    const asianCountries = ['Malaysia', 'Singapore', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam', 'China', 'Hong Kong', 'Taiwan', 'South Korea', 'Japan']
    const westernCountries = ['United Kingdom', 'United States', 'Canada', 'Germany', 'France', 'Netherlands']
    
    if (asianCountries.includes(departureCountry)) return '10:30 AM'
    if (westernCountries.includes(departureCountry)) return '8:45 PM'
    return '9:15 AM'
  }

  const calculateFlightPrice = (departureCountry: string, destination: string, tier: string) => {
    const basePrice = tier === 'Luxury' ? 4500 : tier === 'Ultimate' ? 2800 : 1800
    
    // Distance multipliers
    const distanceMultipliers = {
      'Malaysia': 1.0,
      'Singapore': 1.1,
      'Thailand': 0.9,
      'Indonesia': 1.0,
      'Philippines': 1.2,
      'Vietnam': 1.1,
      'India': 1.3,
      'China': 1.4,
      'Hong Kong': 1.2,
      'Taiwan': 1.3,
      'South Korea': 1.5,
      'Japan': 1.6,
      'Australia': 2.0,
      'New Zealand': 2.2,
      'United Kingdom': 3.0,
      'United States': 3.5,
      'Canada': 3.2,
      'Germany': 2.8,
      'France': 2.9,
      'Netherlands': 2.8,
      'UAE': 1.8,
      'Saudi Arabia': 2.0
    }
    
    const multiplier = distanceMultipliers[departureCountry] || 1.5
    return Math.round(basePrice * multiplier)
  }

  const getArrivalTime = (departureCountry: string, destination: string) => {
    // Comprehensive flight time calculations based on departure country and destination
    const flightTimes = {
      'Malaysia': {
        'Tokyo, Japan': '6:45 PM',
        'Bangkok, Thailand': '12:15 PM',
        'Seoul, South Korea': '5:20 PM',
        'Paris, France': '6:30 AM +1',
        'Rome, Italy': '3:45 PM',
        'Amsterdam, Netherlands': '5:20 AM +1',
        'Dubai, UAE': '1:45 PM',
        'Istanbul, Turkey': '4:30 PM'
      },
      'Singapore': {
        'Tokyo, Japan': '6:30 PM',
        'Bangkok, Thailand': '11:45 AM',
        'Seoul, South Korea': '5:00 PM',
        'Paris, France': '6:15 AM +1',
        'Rome, Italy': '3:30 PM',
        'Amsterdam, Netherlands': '5:00 AM +1',
        'Dubai, UAE': '1:30 PM',
        'Istanbul, Turkey': '4:15 PM'
      },
      'United Kingdom': {
        'Tokyo, Japan': '8:15 AM +1',
        'Bangkok, Thailand': '11:30 PM',
        'Seoul, South Korea': '7:45 AM +1',
        'Paris, France': '10:30 AM',
        'Rome, Italy': '1:15 PM',
        'Amsterdam, Netherlands': '10:45 AM',
        'Dubai, UAE': '7:30 PM',
        'Istanbul, Turkey': '5:45 PM'
      },
      'United States': {
        'Tokyo, Japan': '3:45 PM +1',
        'Bangkok, Thailand': '11:30 AM +1',
        'Seoul, South Korea': '4:20 PM +1',
        'Paris, France': '8:15 AM +1',
        'Rome, Italy': '10:30 AM +1',
        'Amsterdam, Netherlands': '7:45 AM +1',
        'Dubai, UAE': '4:15 AM +1',
        'Istanbul, Turkey': '1:30 PM +1'
      },
      'Australia': {
        'Tokyo, Japan': '10:30 PM',
        'Bangkok, Thailand': '3:15 PM',
        'Seoul, South Korea': '9:45 PM',
        'Paris, France': '7:30 AM +1',
        'Rome, Italy': '9:15 AM +1',
        'Amsterdam, Netherlands': '6:45 AM +1',
        'Dubai, UAE': '11:30 PM',
        'Istanbul, Turkey': '2:15 AM +1'
      }
    }
    
    return flightTimes[departureCountry]?.[destination] || flightTimes['Malaysia']?.[destination] || '3:30 PM'
  }

  const getReturnArrivalTime = (departureCountry: string, destination: string) => {
    // Return flight arrival times back to departure country
    const returnFlightTimes = {
      'Malaysia': {
        'Tokyo, Japan': '10:30 PM',
        'Bangkok, Thailand': '5:45 PM',
        'Seoul, South Korea': '9:15 PM',
        'Paris, France': '7:45 AM +1',
        'Rome, Italy': '7:20 PM',
        'Amsterdam, Netherlands': '8:15 AM +1',
        'Dubai, UAE': '5:30 PM',
        'Istanbul, Turkey': '8:45 PM'
      },
      'Singapore': {
        'Tokyo, Japan': '10:15 PM',
        'Bangkok, Thailand': '5:30 PM',
        'Seoul, South Korea': '9:00 PM',
        'Paris, France': '7:30 AM +1',
        'Rome, Italy': '7:05 PM',
        'Amsterdam, Netherlands': '8:00 AM +1',
        'Dubai, UAE': '5:15 PM',
        'Istanbul, Turkey': '8:30 PM'
      },
      'United Kingdom': {
        'Tokyo, Japan': '4:45 PM',
        'Bangkok, Thailand': '8:30 AM',
        'Seoul, South Korea': '3:20 PM',
        'Paris, France': '9:15 AM',
        'Rome, Italy': '11:30 AM',
        'Amsterdam, Netherlands': '8:45 AM',
        'Dubai, UAE': '2:15 PM',
        'Istanbul, Turkey': '12:30 PM'
      },
      'United States': {
        'Tokyo, Japan': '11:30 AM',
        'Bangkok, Thailand': '6:45 PM -1',
        'Seoul, South Korea': '10:15 AM',
        'Paris, France': '3:30 PM',
        'Rome, Italy': '5:45 PM',
        'Amsterdam, Netherlands': '2:15 PM',
        'Dubai, UAE': '8:30 AM',
        'Istanbul, Turkey': '6:45 AM'
      },
      'Australia': {
        'Tokyo, Japan': '8:45 PM',
        'Bangkok, Thailand': '12:30 PM',
        'Seoul, South Korea': '7:20 PM',
        'Paris, France': '2:15 PM +1',
        'Rome, Italy': '4:30 PM +1',
        'Amsterdam, Netherlands': '1:00 PM +1',
        'Dubai, UAE': '7:45 PM',
        'Istanbul, Turkey': '5:15 PM +1'
      }
    }
    
    return returnFlightTimes[departureCountry]?.[destination] || returnFlightTimes['Malaysia']?.[destination] || '7:30 PM'
  }

  const getFlightDuration = (departureCountry: string, destination: string) => {
    // Realistic flight durations based on departure country and destination
    const flightDurations = {
      'Malaysia': {
        'Tokyo, Japan': '8h 15m',
        'Bangkok, Thailand': '1h 45m',
        'Seoul, South Korea': '6h 50m',
        'Paris, France': '12h 30m',
        'Rome, Italy': '11h 15m',
        'Amsterdam, Netherlands': '12h 45m',
        'Dubai, UAE': '3h 15m',
        'Istanbul, Turkey': '9h 45m'
      },
      'Singapore': {
        'Tokyo, Japan': '7h 30m',
        'Bangkok, Thailand': '2h 15m',
        'Seoul, South Korea': '6h 20m',
        'Paris, France': '12h 45m',
        'Rome, Italy': '12h 30m',
        'Amsterdam, Netherlands': '13h 15m',
        'Dubai, UAE': '7h 30m',
        'Istanbul, Turkey': '11h 15m'
      },
      'United Kingdom': {
        'Tokyo, Japan': '11h 30m',
        'Bangkok, Thailand': '11h 45m',
        'Seoul, South Korea': '10h 45m',
        'Paris, France': '1h 15m',
        'Rome, Italy': '2h 45m',
        'Amsterdam, Netherlands': '1h 30m',
        'Dubai, UAE': '6h 45m',
        'Istanbul, Turkey': '3h 45m'
      },
      'United States': {
        'Tokyo, Japan': '13h 30m',
        'Bangkok, Thailand': '18h 45m',
        'Seoul, South Korea': '14h 15m',
        'Paris, France': '8h 30m',
        'Rome, Italy': '10h 15m',
        'Amsterdam, Netherlands': '8h 45m',
        'Dubai, UAE': '15h 30m',
        'Istanbul, Turkey': '12h 45m'
      },
      'Australia': {
        'Tokyo, Japan': '9h 45m',
        'Bangkok, Thailand': '7h 15m',
        'Seoul, South Korea': '8h 30m',
        'Paris, France': '19h 30m',
        'Rome, Italy': '18h 45m',
        'Amsterdam, Netherlands': '20h 15m',
        'Dubai, UAE': '12h 30m',
        'Istanbul, Turkey': '16h 45m'
      }
    }
    
    return flightDurations[departureCountry]?.[destination] || flightDurations['Malaysia']?.[destination] || '5h 30m'
  }

  const generateAccommodationDetails = (dest: any, params: any, tier: string, days: number) => {
    const hotelDatabase = {
      'Tokyo, Japan': {
        'Luxury': { name: 'The Ritz-Carlton Tokyo', rating: 5, location: 'Roppongi', pricePerNight: 850 },
        'Ultimate': { name: 'Conrad Tokyo', rating: 5, location: 'Shiodome', pricePerNight: 650 },
        'Budget-Friendly': { name: 'Hotel Gracery Shinjuku', rating: 4, location: 'Shinjuku', pricePerNight: 280 }
      },
      'Bangkok, Thailand': {
        'Luxury': { name: 'The Oriental Bangkok', rating: 5, location: 'Riverside', pricePerNight: 420 },
        'Ultimate': { name: 'Shangri-La Bangkok', rating: 5, location: 'Saphan Taksin', pricePerNight: 320 },
        'Budget-Friendly': { name: 'Novotel Bangkok Sukhumvit', rating: 4, location: 'Sukhumvit', pricePerNight: 180 }
      },
      'Paris, France': {
        'Luxury': { name: 'Four Seasons George V', rating: 5, location: 'Champs-Élysées', pricePerNight: 950 },
        'Ultimate': { name: 'Le Bristol Paris', rating: 5, location: '8th Arrondissement', pricePerNight: 750 },
        'Budget-Friendly': { name: 'Hotel Malte Opera', rating: 4, location: 'Opera District', pricePerNight: 350 }
      }
    }

    const defaultHotels = {
      'Luxury': { name: 'Luxury Resort & Spa', rating: 5, location: 'City Center', pricePerNight: 600 },
      'Ultimate': { name: 'Premium City Hotel', rating: 4, location: 'Downtown', pricePerNight: 400 },
      'Budget-Friendly': { name: 'Comfort Inn & Suites', rating: 3, location: 'City Center', pricePerNight: 200 }
    }

    const hotel = hotelDatabase[dest.name]?.[tier] || defaultHotels[tier]
    const totalNights = days - 1 // Usually one less night than days
    
    const amenities = tier === 'Luxury' 
      ? ['Spa & Wellness Center', 'Fine Dining Restaurant', 'Concierge Service', 'Airport Transfer', 'Room Service', 'Fitness Center', 'Swimming Pool', 'Business Center']
      : tier === 'Ultimate'
      ? ['Restaurant', 'Fitness Center', 'Swimming Pool', 'Room Service', 'WiFi', 'Airport Shuttle', 'Business Center']
      : ['WiFi', 'Breakfast', 'Front Desk 24/7', 'Air Conditioning', 'TV', 'Private Bathroom']

    const roomTypes = {
      'Luxury': 'Executive Suite with City View',
      'Ultimate': 'Deluxe Room with Balcony', 
      'Budget-Friendly': 'Standard Double Room'
    }

    return {
      hotels: [{
        name: hotel.name,
        rating: hotel.rating,
        location: hotel.location,
        amenities: amenities,
        checkIn: params.startDate || getDefaultStartDate(),
        checkOut: params.endDate || getDefaultEndDate(params.duration),
        roomType: roomTypes[tier],
        pricePerNight: hotel.pricePerNight,
        totalNights: totalNights,
        totalPrice: hotel.pricePerNight * totalNights
      }]
    }
  }

  const generatePriceBreakdown = (totalPrice: number, flightDetails: any, accommodationDetails: any, days: number) => {
    const flightCost = (flightDetails.outbound.price + flightDetails.return.price)
    const accommodationCost = accommodationDetails.hotels[0].totalPrice
    const remainingAmount = totalPrice - flightCost - accommodationCost
    
    return {
      flights: flightCost,
      accommodation: accommodationCost,
      meals: Math.round(remainingAmount * 0.3),
      activities: Math.round(remainingAmount * 0.4),
      transport: Math.round(remainingAmount * 0.15),
      insurance: Math.round(remainingAmount * 0.08),
      taxes: Math.round(remainingAmount * 0.07)
    }
  }

  const getVisaRequirements = (departureCountry: string, destination: string) => {
    // Comprehensive visa requirements database
    const visaRequirements = {
      'Malaysia': {
        'Tokyo, Japan': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days' },
        'Bangkok, Thailand': { required: false, type: 'Visa-free', duration: '30 days', notes: 'No visa required for stays up to 30 days' },
        'Seoul, South Korea': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days' },
        'Paris, France': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Rome, Italy': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Amsterdam, Netherlands': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Dubai, UAE': { required: false, type: 'Visa on arrival', duration: '30 days', notes: 'Free visa on arrival for 30 days' },
        'Istanbul, Turkey': { required: true, type: 'e-Visa', duration: '90 days', notes: 'e-Visa required, can be obtained online for approximately $50 USD', cost: 'USD 50', processingTime: '24 hours' }
      },
      'Singapore': {
        'Tokyo, Japan': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days' },
        'Bangkok, Thailand': { required: false, type: 'Visa-free', duration: '30 days', notes: 'No visa required for stays up to 30 days' },
        'Seoul, South Korea': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days' },
        'Paris, France': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Rome, Italy': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Amsterdam, Netherlands': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Dubai, UAE': { required: false, type: 'Visa on arrival', duration: '30 days', notes: 'Free visa on arrival for 30 days' },
        'Istanbul, Turkey': { required: true, type: 'e-Visa', duration: '90 days', notes: 'e-Visa required, can be obtained online for approximately $60 USD', cost: 'USD 60', processingTime: '24 hours' }
      },
      'United Kingdom': {
        'Tokyo, Japan': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days' },
        'Bangkok, Thailand': { required: false, type: 'Visa-free', duration: '30 days', notes: 'No visa required for stays up to 30 days' },
        'Seoul, South Korea': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days' },
        'Paris, France': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days within 180 days (post-Brexit rules)' },
        'Rome, Italy': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days within 180 days (post-Brexit rules)' },
        'Amsterdam, Netherlands': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days within 180 days (post-Brexit rules)' },
        'Dubai, UAE': { required: false, type: 'Visa on arrival', duration: '30 days', notes: 'Free visa on arrival for 30 days' },
        'Istanbul, Turkey': { required: true, type: 'e-Visa', duration: '90 days', notes: 'e-Visa required, can be obtained online for approximately $50 USD', cost: 'USD 50', processingTime: '24 hours' }
      },
      'United States': {
        'Tokyo, Japan': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days under VWP (ESTA required)' },
        'Bangkok, Thailand': { required: false, type: 'Visa-free', duration: '30 days', notes: 'No visa required for stays up to 30 days' },
        'Seoul, South Korea': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days under VWP' },
        'Paris, France': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Rome, Italy': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Amsterdam, Netherlands': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Dubai, UAE': { required: false, type: 'Visa on arrival', duration: '30 days', notes: 'Free visa on arrival for 30 days' },
        'Istanbul, Turkey': { required: true, type: 'e-Visa', duration: '90 days', notes: 'e-Visa required, can be obtained online for approximately $50 USD', cost: 'USD 50', processingTime: '24 hours' }
      },
      'Australia': {
        'Tokyo, Japan': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days' },
        'Bangkok, Thailand': { required: false, type: 'Visa-free', duration: '30 days', notes: 'No visa required for stays up to 30 days' },
        'Seoul, South Korea': { required: false, type: 'Visa-free', duration: '90 days', notes: 'No visa required for stays up to 90 days' },
        'Paris, France': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Rome, Italy': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Amsterdam, Netherlands': { required: false, type: 'Visa-free', duration: '90 days', notes: 'Schengen Area - No visa required for stays up to 90 days within 180 days' },
        'Dubai, UAE': { required: false, type: 'Visa on arrival', duration: '30 days', notes: 'Free visa on arrival for 30 days' },
        'Istanbul, Turkey': { required: true, type: 'e-Visa', duration: '90 days', notes: 'e-Visa required, can be obtained online for approximately $60 AUD', cost: 'AUD 60', processingTime: '24 hours' }
      }
    }
    
    const defaultVisa = { required: true, type: 'Tourist Visa', duration: '30 days', notes: 'Please check with the embassy for specific requirements', processingTime: '5-10 business days' }
    
    return visaRequirements[departureCountry]?.[destination] || defaultVisa
  }

  const generateInsuranceDetails = (totalPrice: number, tier: string) => {
    const baseInsurance = Math.round(totalPrice * 0.05)
    
    return {
      provider: tier === 'Luxury' ? 'Allianz Premium Travel Insurance' : 'Great Eastern Travel Insurance',
      coverage: [
        'Medical Emergency Coverage up to RM 500,000',
        'Trip Cancellation & Interruption',
        'Lost Baggage Coverage',
        'Personal Liability Coverage',
        'Emergency Evacuation',
        tier === 'Luxury' ? 'Concierge Services' : 'Basic Support Services'
      ].filter(Boolean),
      price: baseInsurance
    }
  }

  const loadUserFavorites = async () => {
    if (!user) return
    
    try {
      const { data } = await favorites.getUserFavorites(user.id)
      if (data) {
        const favoriteIds = new Set(
          data
            .filter(fav => fav.type === 'itinerary')
            .map(fav => fav.reference_id)
        )
        setUserFavorites(favoriteIds)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const toggleFavorite = async (itineraryId: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites')
      return
    }

    try {
      if (userFavorites.has(itineraryId)) {
        await favorites.removeFavorite(user.id, 'itinerary', itineraryId)
        setUserFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(itineraryId)
          return newSet
        })
        toast.success('Removed from favorites')
      } else {
        await favorites.addFavorite(user.id, 'itinerary', itineraryId)
        setUserFavorites(prev => new Set(prev).add(itineraryId))
        toast.success('Added to favorites')
      }
    } catch (error) {
      toast.error('Failed to update favorites')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-800 border-t-blue-500 mx-auto"></div>
          <p className="mt-6 text-gray-400 text-lg">Crafting your perfect itineraries...</p>
          <p className="mt-2 text-gray-500 text-sm">AI is analyzing thousands of possibilities</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header - David's style */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
        className="sticky top-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="group flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-gray-900/50 group-hover:bg-gray-800/50 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:-translate-x-1 transition-all" />
                </div>
              </Link>
              
              <div>
                <motion.h1 
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="text-3xl font-bold"
                >
                  Your Travel <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">Results</span>
                </motion.h1>
                <motion.p 
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                  className="text-gray-400 mt-1"
                >
                  {itineraries.length} personalized itineraries found
                </motion.p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-900/50 p-2 rounded-2xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* API Status Banner */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-6">
        <APIStatusBanner compact={true} />
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gray-900/30 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Filter className="w-4 h-4 text-blue-400" />
                </div>
                <select 
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="all" className="bg-gray-800">All Budgets</option>
                  <option value="budget" className="bg-gray-800">Budget (≤ RM 6,000)</option>
                  <option value="premium" className="bg-gray-800">Premium (RM 6,000 - 14,000)</option>
                  <option value="luxury" className="bg-gray-800">Luxury (&gt; RM 14,000)</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="price-low" className="bg-gray-800">Price: Low to High</option>
                  <option value="price-high" className="bg-gray-800">Price: High to Low</option>
                  <option value="duration" className="bg-gray-800">Duration</option>
                  <option value="popularity" className="bg-gray-800">Popularity</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Grid */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}
        >
          {/* Enhanced Package Cards */}
          {detailViewId ? (
            // Detailed view for a specific package
            <div className="col-span-full">
              {(() => {
                const selectedItinerary = itineraries.find(it => it.id === detailViewId)
                if (!selectedItinerary) return null
                
                return (
                  <div className="space-y-6">
                    {/* Back button and tabs */}
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={() => setDetailViewId(null)}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to all packages</span>
                      </button>
                      
                      <div className="flex items-center space-x-2 bg-gray-900/50 p-2 rounded-2xl">
                        {['overview', 'hotels', 'itinerary', 'inclusions'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveDetailTab(tab as any)}
                            className={`px-4 py-2 rounded-xl capitalize transition-all duration-300 ${
                              activeDetailTab === tab
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Package Overview */}
                    <EnhancedPackageCard
                      itinerary={selectedItinerary}
                      onFavoriteToggle={toggleFavorite}
                      isFavorite={userFavorites.has(selectedItinerary.id)}
                    />

                    {/* Detailed Content Based on Active Tab */}
                    <AnimatePresence mode="wait">
                      {activeDetailTab === 'hotels' && selectedItinerary.accommodationDetails && (
                        <motion.div
                          key="hotels"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <HotelDetailsSection
                            hotels={selectedItinerary.accommodationDetails.hotels}
                            destination={selectedItinerary.destination}
                          />
                        </motion.div>
                      )}
                      
                      {activeDetailTab === 'itinerary' && (
                        <motion.div
                          key="itinerary"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <DetailedActivityItinerary
                            days={selectedItinerary.days}
                            destination={selectedItinerary.destination}
                          />
                        </motion.div>
                      )}
                      
                      {activeDetailTab === 'inclusions' && (
                        <motion.div
                          key="inclusions"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <PackageInclusionsSection
                            destination={selectedItinerary.destination}
                            duration={selectedItinerary.duration}
                            travelers={selectedItinerary.travelers}
                            packageType={selectedItinerary.title.includes('Luxury') ? 'Luxury' : selectedItinerary.title.includes('Budget') ? 'Budget-Friendly' : 'Ultimate'}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })()}
            </div>
          ) : (
            // Grid/List view of all packages
            itineraries.map((itinerary, index) => (
              <motion.div
                key={itinerary.id}
                variants={fadeInUp}
                className="group"
              >
                <EnhancedPackageCard
                  itinerary={itinerary}
                  onFavoriteToggle={toggleFavorite}
                  isFavorite={userFavorites.has(itinerary.id)}
                />
                
                {/* Quick Detail View Button */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setDetailViewId(itinerary.id)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center space-x-1 mx-auto"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Complete Package Details</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Empty State */}
        {itineraries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
              <Globe className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No itineraries found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Try adjusting your filters or search criteria to find the perfect trip for you.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold hover:scale-105 transition-all duration-300"
            >
              <span>Start New Search</span>
              <Plane className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </main>
      
      {/* Price Alert Manager */}
      <PriceAlertManager 
        isOpen={showPriceAlertManager}
        onClose={() => {
          setShowPriceAlertManager(false)
          setAlertPreset(null)
        }}
      />
      
      {/* Travel Assistant Chat Button */}
      <TravelAssistantButton 
        initialContext={{
          current_trip: {
            destination: searchParams.get('destination') || undefined,
            departure_date: searchParams.get('startDate') || undefined,
            return_date: searchParams.get('endDate') || undefined,
            travelers: parseInt(searchParams.get('travelers') || '1'),
            budget: parseInt(searchParams.get('budget') || '5000'),
            interests: searchParams.get('interests')?.split(',').filter(Boolean) || []
          }
        }}
      />

      {/* New Advanced Features */}
      <SmartTripPlanningAssistant />
      <RealTimeTravelIntelligence />
      <TravelDocumentManager />
      
      {/* Community and Advanced Booking - Available on larger screens */}
      <div className="hidden lg:block">
        <TravelCommunityHub />
        <AdvancedBookingSystem />
      </div>
    </div>
  )
}