'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Heart, 
  Share2, 
  Eye, 
  Plane, 
  Hotel, 
  Utensils, 
  Camera, 
  CheckCircle, 
  X, 
  Clock, 
  Wifi, 
  Car, 
  Shield, 
  Info,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ThermometerSun
} from 'lucide-react'
import Link from 'next/link'

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
  dataSource?: 'openai' | 'hardcoded'
  flightDetails?: {
    outbound: {
      airline: string;
      flightNumber: string;
      departure: { airport: string; time: string; };
      arrival: { airport: string; time: string; };
      duration: string;
      class: string;
      price: number;
      dataSource?: 'amadeus' | 'hardcoded';
    };
    return: {
      airline: string;
      flightNumber: string;
      departure: { airport: string; time: string; };
      arrival: { airport: string; time: string; };
      duration: string;
      class: string;
      price: number;
      dataSource?: 'amadeus' | 'hardcoded';
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
      dataSource?: 'amadeus' | 'google_places' | 'hardcoded';
    }>;
  }
}

interface EnhancedPackageCardProps {
  itinerary: Itinerary
  onFavoriteToggle?: (id: string) => void
  isFavorite?: boolean
}

export default function EnhancedPackageCard({
  itinerary,
  onFavoriteToggle,
  isFavorite = false
}: EnhancedPackageCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [showFullItinerary, setShowFullItinerary] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number, currency: string = 'MYR') => {
    return `${currency} ${price.toLocaleString()}`
  }

  const getDataSourceBadge = (source?: string, type: 'itinerary' | 'flight' | 'hotel' = 'itinerary') => {
    if (!source) return null

    const configs: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
      openai: { label: 'AI Generated', color: 'text-green-600', bgColor: 'bg-green-100', icon: '🤖' },
      amadeus: { label: 'Amadeus API', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '✈️' },
      google_places: { label: 'Google Places', color: 'text-red-600', bgColor: 'bg-red-100', icon: '📍' },
      hardcoded: { label: 'Sample Data', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '⚠️' }
    }

    const config = configs[source] || configs.hardcoded

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    )
  }

  const getDestinationImages = (destination: string) => {
    const imageMap: { [key: string]: string[] } = {
      'Jakarta': [
        'https://images.unsplash.com/photo-1555225943-9b2afc5c7367?w=800&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
        'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&q=80'
      ],
      'Bangkok': [
        'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        'https://images.unsplash.com/photo-1564499581500-68b62ac5c3de?w=800&q=80'
      ],
      'Tokyo': [
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
        'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&q=80',
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80'
      ]
    }
    
    return imageMap[destination.split(',')[0]] || [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'
    ]
  }

  const images = getDestinationImages(itinerary.destination)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const inclusions = [
    { icon: <Plane className="w-4 h-4" />, text: "Round-trip flights", included: true },
    { icon: <Hotel className="w-4 h-4" />, text: `${itinerary.accommodation} accommodation`, included: true },
    { icon: <Utensils className="w-4 h-4" />, text: "Daily breakfast included", included: true },
    { icon: <Car className="w-4 h-4" />, text: "Airport transfers", included: true },
    { icon: <Camera className="w-4 h-4" />, text: "Guided city tours", included: true },
    { icon: <Shield className="w-4 h-4" />, text: "Travel insurance", included: itinerary.price.breakdown?.insurance ? true : false },
    { icon: <Wifi className="w-4 h-4" />, text: "Personal expenses", included: false },
    { icon: <Utensils className="w-4 h-4" />, text: "Lunch & dinner (unless specified)", included: false },
    { icon: <Camera className="w-4 h-4" />, text: "Optional activities", included: false },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 group"
    >
      {/* Hero Image Section */}
      <div className="relative h-64 overflow-hidden">
        <motion.img 
          key={currentImageIndex}
          src={images[currentImageIndex]}
          alt={itinerary.destination}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        />
        
        {/* Image Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Overlay Information */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => onFavoriteToggle?.(itinerary.id)}
            className="p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
          <button className="p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Destination Info Overlay */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{itinerary.destination}</span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-white/80">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{itinerary.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{itinerary.travelers.total} travelers</span>
            </div>
            {itinerary.weather && (
              <div className="flex items-center space-x-1">
                <span>{itinerary.weather.temperature}°C</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Package Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-2xl font-bold text-white flex-1">{itinerary.title}</h3>
            {getDataSourceBadge(itinerary.dataSource, 'itinerary')}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{formatDate(itinerary.dates.start)} - {formatDate(itinerary.dates.end)}</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">
                {formatPrice(itinerary.price.total, itinerary.price.currency)}
              </div>
              <div className="text-sm text-gray-400">
                {formatPrice(itinerary.price.perPerson, itinerary.price.currency)} per person
              </div>
            </div>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2">
            {itinerary.highlights.slice(0, 4).map((highlight, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Data Sources</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Itinerary:</span>
              {getDataSourceBadge(itinerary.dataSource, 'itinerary')}
            </div>
            {itinerary.flightDetails && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Flights:</span>
                {getDataSourceBadge(itinerary.flightDetails.outbound.dataSource, 'flight')}
              </div>
            )}
            {itinerary.accommodationDetails?.hotels?.[0] && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Hotels:</span>
                {getDataSourceBadge(itinerary.accommodationDetails.hotels[0].dataSource, 'hotel')}
              </div>
            )}
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="space-y-3">
          {/* Price Breakdown */}
          <div>
            <button
              onClick={() => toggleSection('pricing')}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="font-medium text-white">Price Breakdown</span>
              </div>
              {expandedSection === 'pricing' ? 
                <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                <ChevronDown className="w-4 h-4 text-gray-400" />
              }
            </button>
            
            <AnimatePresence>
              {expandedSection === 'pricing' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-2 bg-white/5 rounded-lg mt-2">
                    {itinerary.price.breakdown && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Flights</span>
                          <span className="text-white">{formatPrice(itinerary.price.breakdown.flights)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Accommodation</span>
                          <span className="text-white">{formatPrice(itinerary.price.breakdown.accommodation)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Meals</span>
                          <span className="text-white">{formatPrice(itinerary.price.breakdown.meals)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Activities</span>
                          <span className="text-white">{formatPrice(itinerary.price.breakdown.activities)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Transport</span>
                          <span className="text-white">{formatPrice(itinerary.price.breakdown.transport)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Taxes & Fees</span>
                          <span className="text-white">{formatPrice(itinerary.price.breakdown.taxes)}</span>
                        </div>
                        <div className="border-t border-white/10 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-white">Total</span>
                            <span className="text-blue-400">{formatPrice(itinerary.price.total)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* What's Included/Excluded */}
          <div>
            <button
              onClick={() => toggleSection('inclusions')}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="font-medium text-white">What's Included</span>
              </div>
              {expandedSection === 'inclusions' ? 
                <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                <ChevronDown className="w-4 h-4 text-gray-400" />
              }
            </button>
            
            <AnimatePresence>
              {expandedSection === 'inclusions' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-2 bg-white/5 rounded-lg mt-2">
                    {inclusions.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        {item.included ? (
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                        <div className="flex items-center space-x-2">
                          <span className={`${item.included ? 'text-green-400' : 'text-red-400'}`}>
                            {item.icon}
                          </span>
                          <span className={`text-sm ${item.included ? 'text-gray-300' : 'text-gray-500'}`}>
                            {item.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Daily Itinerary Preview */}
          <div>
            <button
              onClick={() => toggleSection('itinerary')}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-white">Daily Itinerary</span>
              </div>
              {expandedSection === 'itinerary' ? 
                <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                <ChevronDown className="w-4 h-4 text-gray-400" />
              }
            </button>
            
            <AnimatePresence>
              {expandedSection === 'itinerary' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-4 bg-white/5 rounded-lg mt-2">
                    {itinerary.days.slice(0, showFullItinerary ? itinerary.days.length : 2).map((day, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-4 border border-white/10">
                        {/* Day Header with Overview */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">D{day.day}</span>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{day.title}</h4>
                              <div className="flex items-center space-x-3 text-xs text-gray-400">
                                <span>{day.schedule?.length || 0} activities</span>
                                <span>Budget: MYR {day.dayTotal || 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-400">MYR {day.dayTotal || 0}</div>
                            <div className="text-xs text-gray-400">day total</div>
                          </div>
                        </div>

                        {/* Day Overview Cards */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                            <div className="flex items-center space-x-1 mb-1">
                              <ThermometerSun className="w-3 h-3 text-blue-400" />
                              <span className="text-xs font-medium text-white">Weather</span>
                            </div>
                            <div className="text-xs text-gray-300">28°C, Pleasant</div>
                          </div>
                          
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                            <div className="flex items-center space-x-1 mb-1">
                              <Car className="w-3 h-3 text-green-400" />
                              <span className="text-xs font-medium text-white">Transport</span>
                            </div>
                            <div className="text-xs text-gray-300">Private Vehicle</div>
                          </div>
                          
                          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                            <div className="flex items-center space-x-1 mb-1">
                              <Utensils className="w-3 h-3 text-orange-400" />
                              <span className="text-xs font-medium text-white">Meals</span>
                            </div>
                            <div className="text-xs text-gray-300">{day.meals?.length || 2} included</div>
                          </div>
                        </div>

                        {/* Enhanced Activity Timeline */}
                        {day.schedule && (
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-white border-b border-white/10 pb-2">Activity Schedule</h5>
                            {day.schedule.slice(0, showFullItinerary ? day.schedule.length : 3).map((item: any, scheduleIdx: number) => {
                              const getActivityIcon = (type: string) => {
                                switch (type) {
                                  case 'transport': return <Car className="w-3 h-3" />
                                  case 'meal': return <Utensils className="w-3 h-3" />
                                  case 'activity': return <Camera className="w-3 h-3" />
                                  case 'accommodation': return <Hotel className="w-3 h-3" />
                                  default: return <Clock className="w-3 h-3" />
                                }
                              }

                              const getActivityColor = (type: string) => {
                                switch (type) {
                                  case 'transport': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                                  case 'meal': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                                  case 'activity': return 'text-green-400 bg-green-500/10 border-green-500/20'
                                  case 'accommodation': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                                  default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
                                }
                              }

                              return (
                                <div key={scheduleIdx} className="flex items-start space-x-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                                  {/* Activity Icon */}
                                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${getActivityColor(item.type)}`}>
                                    {getActivityIcon(item.type)}
                                  </div>
                                  
                                  {/* Activity Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-blue-300">{item.time}</span>
                                        <span className="text-xs px-2 py-1 bg-white/10 rounded text-gray-300 capitalize">
                                          {item.type}
                                        </span>
                                      </div>
                                      <span className="text-sm font-bold text-green-400">MYR {item.cost}</span>
                                    </div>
                                    
                                    <h6 className="text-white font-medium text-sm mb-1">{item.activity}</h6>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />
                                        <span>2-3 hours</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">City Center</span>
                                      </div>
                                    </div>

                                    {/* What's Included Preview */}
                                    <div className="mt-2 pt-2 border-t border-white/10">
                                      <div className="flex items-center space-x-1 mb-1">
                                        <CheckCircle className="w-3 h-3 text-green-400" />
                                        <span className="text-xs font-medium text-white">Includes:</span>
                                      </div>
                                      <div className="text-xs text-gray-300">
                                        Professional guide • Transportation • Cultural insights
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                            
                            {day.schedule.length > 3 && !showFullItinerary && (
                              <div className="text-center">
                                <span className="text-sm text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg">
                                  +{day.schedule.length - 3} more activities today
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Day Highlights */}
                        {day.highlights && day.highlights.length > 0 && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs font-medium text-yellow-300">Day Highlights</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {day.highlights.slice(0, 3).map((highlight, idx) => (
                                <span key={idx} className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded">
                                  {highlight}
                                </span>
                              ))}
                              {day.highlights.length > 3 && (
                                <span className="text-xs text-blue-300">+{day.highlights.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {itinerary.days.length > 2 && (
                      <div className="text-center pt-3 border-t border-white/10">
                        <button
                          onClick={() => setShowFullItinerary(!showFullItinerary)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-sm font-medium text-white hover:from-blue-600 hover:to-purple-700 transition-all"
                        >
                          {showFullItinerary ? 'Show Less' : `View All ${itinerary.days.length} Days`}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-white/10">
          <Link
            href={`/itinerary/${itinerary.id}?data=${encodeURIComponent(JSON.stringify(itinerary))}`}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Full Details</span>
          </Link>
          <Link
            href={`/itinerary/${itinerary.id}?data=${encodeURIComponent(JSON.stringify(itinerary))}&book=true`}
            className="flex-1 px-4 py-3 bg-white text-black rounded-2xl font-semibold hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Plane className="w-4 h-4" />
            <span>Book Now</span>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-300 font-medium">Free Cancellation</p>
            <p className="text-blue-200/80">Cancel up to 24 hours before departure for a full refund</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}