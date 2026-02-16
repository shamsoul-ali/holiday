'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Star, 
  TrendingUp,
  Calendar,
  Users,
  ExternalLink,
  Heart,
  Share2
} from 'lucide-react'

interface Destination {
  destination_code: string
  name: string
  from_price: {
    amount: number
    currency: string
  }
  popularity_score: number
  signals: {
    intent_7d_vs_28d: number
    events_count: number
    halal_index: number
  }
  weather: {
    month: string
    comfort_index: number
    avg_high_c: number
    rain_prob: number
  }
  events: Array<{
    name: string
    date: string
  }>
  badges: string[]
  sample_package: {
    nights: number
    tier: string
    hotel: string
    activities: string[]
    est_total: {
      amount: number
      currency: string
    }
  }
  deep_links: {
    flight: string
    hotel: string
    activities: string[]
  }
}

interface Top10CarouselProps {
  budget: number
}

export default function Top10Carousel({ budget }: Top10CarouselProps) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedDestinations, setSelectedDestinations] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchTop10Destinations()
  }, [budget])

  const fetchTop10Destinations = async () => {
    setLoading(true)
    try {
      // Use Next.js API proxy to avoid CORS issues
      const apiUrl = `/api/top10?budget=${budget}&currency=MYR&pax=2`
        
      const response = await fetch(apiUrl)
      if (response.ok) {
        const data = await response.json()
        setDestinations(data.items || [])
      } else {
        // Fallback to mock data if API fails
        setDestinations(getMockDestinations())
      }
    } catch (error) {
      console.error('Failed to fetch destinations:', error)
      setDestinations(getMockDestinations())
    } finally {
      setLoading(false)
    }
  }

  const getMockDestinations = (): Destination[] => {
    return [
      {
        destination_code: "TYO",
        name: "Tokyo, Japan",
        from_price: { amount: budget * 0.15, currency: "MYR" },
        popularity_score: 87.3,
        signals: {
          intent_7d_vs_28d: 1.34,
          events_count: 12,
          halal_index: 0.62
        },
        weather: {
          month: "2025-12",
          comfort_index: 0.74,
          avg_high_c: 12,
          rain_prob: 0.21
        },
        events: [
          { name: "Illumination Festival", date: "2025-12-28" },
          { name: "New Year Countdown", date: "2025-12-31" }
        ],
        badges: ["Kids-friendly", "Halal options", "Eco"],
        sample_package: {
          nights: 5,
          tier: "COMFORT",
          hotel: "Shinjuku Granbell Hotel",
          activities: ["DisneySea", "Asakusa Temple", "Shibuya Crossing"],
          est_total: { amount: budget * 0.35, currency: "MYR" }
        },
        deep_links: {
          flight: "https://example.com/flight/tyo",
          hotel: "https://example.com/hotel/tyo",
          activities: [
            "https://example.com/activity/disneysea",
            "https://example.com/activity/asakusa"
          ]
        }
      },
      {
        destination_code: "BKK",
        name: "Bangkok, Thailand",
        from_price: { amount: budget * 0.12, currency: "MYR" },
        popularity_score: 92.1,
        signals: {
          intent_7d_vs_28d: 1.67,
          events_count: 8,
          halal_index: 0.89
        },
        weather: {
          month: "2025-12",
          comfort_index: 0.85,
          avg_high_c: 31,
          rain_prob: 0.15
        },
        events: [
          { name: "Loy Krathong Festival", date: "2025-12-15" }
        ],
        badges: ["Halal-friendly", "Budget", "Culture"],
        sample_package: {
          nights: 4,
          tier: "BUDGET",
          hotel: "Siam@Siam Design Hotel",
          activities: ["Grand Palace", "Chatuchak Market", "Wat Arun"],
          est_total: { amount: budget * 0.28, currency: "MYR" }
        },
        deep_links: {
          flight: "https://example.com/flight/bkk",
          hotel: "https://example.com/hotel/bkk",
          activities: [
            "https://example.com/activity/grand-palace",
            "https://example.com/activity/chatuchak"
          ]
        }
      },
      {
        destination_code: "SIN",
        name: "Singapore",
        from_price: { amount: budget * 0.18, currency: "MYR" },
        popularity_score: 89.7,
        signals: {
          intent_7d_vs_28d: 1.23,
          events_count: 15,
          halal_index: 0.95
        },
        weather: {
          month: "2025-12",
          comfort_index: 0.78,
          avg_high_c: 30,
          rain_prob: 0.45
        },
        events: [
          { name: "Christmas Wonderland", date: "2025-12-20" },
          { name: "New Year Countdown", date: "2025-12-31" }
        ],
        badges: ["Halal-certified", "Family-friendly", "Safe"],
        sample_package: {
          nights: 3,
          tier: "COMFORT",
          hotel: "Marina Bay Sands",
          activities: ["Gardens by the Bay", "Sentosa Island", "Chinatown"],
          est_total: { amount: budget * 0.42, currency: "MYR" }
        },
        deep_links: {
          flight: "https://example.com/flight/sin",
          hotel: "https://example.com/hotel/sin",
          activities: [
            "https://example.com/activity/gardens-bay",
            "https://example.com/activity/sentosa"
          ]
        }
      }
    ]
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % destinations.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + destinations.length) % destinations.length)
  }

  const toggleDestination = (code: string) => {
    const newSelected = new Set(selectedDestinations)
    if (newSelected.has(code)) {
      newSelected.delete(code)
    } else {
      newSelected.add(code)
    }
    setSelectedDestinations(newSelected)
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-400 animate-ping"></div>
        </div>
        <p className="mt-4 text-gray-600 text-lg font-medium">Discovering amazing destinations...</p>
        <p className="mt-2 text-gray-500 text-sm">Powered by AI travel intelligence</p>
      </div>
    )
  }

  if (destinations.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No destinations found</h3>
        <p className="text-gray-500 mb-4">Try adjusting your budget or preferences</p>
        <button 
          onClick={fetchTop10Destinations}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={destinations.length <= 1}
      >
        <ChevronLeft className="h-6 w-6 text-gray-600" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={destinations.length <= 1}
      >
        <ChevronRight className="h-6 w-6 text-gray-600" />
      </button>

      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-travel overflow-hidden">
              {/* Hero Image Placeholder */}
              <div className="h-64 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{destinations[currentIndex].name}</h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">{destinations[currentIndex].destination_code}</span>
                  </div>
                </div>
                
                {/* Popularity Score */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-bold text-gray-700">
                      {destinations[currentIndex].popularity_score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Price and Actions */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatPrice(destinations[currentIndex].from_price.amount, destinations[currentIndex].from_price.currency)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleDestination(destinations[currentIndex].destination_code)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        selectedDestinations.has(destinations[currentIndex].destination_code)
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${
                        selectedDestinations.has(destinations[currentIndex].destination_code) ? 'fill-current' : ''
                      }`} />
                    </button>
                    <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {destinations[currentIndex].badges.map((badge, index) => {
                    const badgeColors = {
                      'Kids-friendly': 'bg-green-100 text-green-700 border-green-200',
                      'Halal options': 'bg-halal-green/20 text-halal-green border-halal-green/30',
                      'Eco': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                      'Budget': 'bg-blue-100 text-blue-700 border-blue-200',
                      'Culture': 'bg-purple-100 text-purple-700 border-purple-200',
                      'Halal-friendly': 'bg-halal-green/20 text-halal-green border-halal-green/30'
                    }
                    const defaultColors = 'bg-primary-100 text-primary-700 border-primary-200'
                    
                    return (
                      <span
                        key={index}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${badgeColors[badge as keyof typeof badgeColors] || defaultColors}`}
                      >
                        {badge}
                      </span>
                    )
                  })}
                </div>

                {/* Sample Package */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Sample Package</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{destinations[currentIndex].sample_package.nights} nights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>{destinations[currentIndex].sample_package.tier} tier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{destinations[currentIndex].sample_package.hotel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Est. total: {formatPrice(destinations[currentIndex].sample_package.est_total.amount, destinations[currentIndex].sample_package.est_total.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Weather and Events */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Weather</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {destinations[currentIndex].weather.avg_high_c}°C
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(destinations[currentIndex].weather.comfort_index * 100)}% comfort
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Events</p>
                    <p className="text-lg font-semibold text-purple-600">
                      {destinations[currentIndex].events.length}
                    </p>
                    <p className="text-xs text-gray-500">this month</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    <ExternalLink className="h-4 w-4" />
                    Book Now
                  </button>
                  <button className="flex-1 bg-white text-primary-600 border-2 border-primary-200 py-3 px-4 rounded-xl font-semibold hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 transform hover:-translate-y-0.5">
                    Customize
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {destinations.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-125 ${
              index === currentIndex 
                ? 'bg-primary-600 shadow-lg' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Compare Button */}
      {selectedDestinations.size > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <button className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 mx-auto">
            <span>Compare {selectedDestinations.size} Destination{selectedDestinations.size > 1 ? 's' : ''}</span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
              {selectedDestinations.size}
            </span>
          </button>
        </motion.div>
      )}
    </div>
  )
}
