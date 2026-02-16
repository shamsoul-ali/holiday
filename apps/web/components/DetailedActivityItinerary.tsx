'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  MapPin, 
  Camera, 
  Utensils, 
  Car, 
  Plane, 
  Hotel, 
  Star, 
  DollarSign, 
  Users,
  ChevronDown,
  ChevronUp,
  Info,
  Heart,
  Share2,
  Play,
  Image as ImageIcon,
  Calendar,
  ArrowRight,
  X,
  CheckCircle,
  ThermometerSun,
  Droplets,
  Wind,
  Navigation,
  Phone,
  Globe,
  CreditCard,
  Shield,
  AlertTriangle,
  BookOpen,
  Zap
} from 'lucide-react'

interface ScheduleItem {
  time: string;
  activity: string;
  type: 'transport' | 'meal' | 'activity' | 'accommodation';
  cost: number;
  description?: string;
  location?: string;
  duration?: string;
  highlights?: string[];
  images?: string[];
  tips?: string[];
}

interface ItineraryDay {
  day: number | string;
  title: string;
  schedule: ScheduleItem[];
  dayTotal: number;
  meals: Array<{
    name: string;
    time: string;
    cost: number;
    type: string;
    description?: string;
    cuisine?: string;
    dietary?: string[];
  }>;
  accommodation: string;
  highlights: string[];
  weather?: {
    condition: string;
    temperature: number;
    humidity: number;
  };
  transportation?: {
    method: string;
    duration: string;
    cost: number;
  };
}

interface DetailedActivityItineraryProps {
  days: ItineraryDay[];
  destination: string;
}

export default function DetailedActivityItinerary({ days, destination }: DetailedActivityItineraryProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0)
  const [selectedActivity, setSelectedActivity] = useState<ScheduleItem | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline')

  const formatTime = (time: string) => {
    return time
  }

  const formatPrice = (price: number, currency: string = 'MYR') => {
    return `${currency} ${price}`
  }

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'transport':
        return <Car className="w-4 h-4" />
      case 'meal':
        return <Utensils className="w-4 h-4" />
      case 'activity':
        return <Camera className="w-4 h-4" />
      case 'accommodation':
        return <Hotel className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'transport':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'meal':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      case 'activity':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'accommodation':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getActivityImages = (activity: string, destination: string) => {
    // Mock images based on activity type and destination
    const activityImageMap: { [key: string]: string[] } = {
      'temple': [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        'https://images.unsplash.com/photo-1544967882-7ad74fb7e5c3?w=800&q=80'
      ],
      'palace': [
        'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80',
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&q=80'
      ],
      'market': [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
        'https://images.unsplash.com/photo-1528873981-36c6afde7b9f?w=800&q=80'
      ],
      'museum': [
        'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
        'https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800&q=80'
      ]
    }

    const activityLower = activity.toLowerCase()
    for (const [key, images] of Object.entries(activityImageMap)) {
      if (activityLower.includes(key)) {
        return images
      }
    }

    return [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
    ]
  }

  // Generate comprehensive activity details like travel agencies provide
  const getDetailedActivityInfo = (activity: string, type: string, destination: string) => {
    const cityName = destination.split(',')[0]
    const baseDescriptions = {
      transport: {
        'Airport arrival & transfer': {
          description: `Welcome to ${cityName}! Upon arrival at the airport, you'll be greeted by our professional driver holding a personalized welcome sign. Enjoy a comfortable, air-conditioned transfer to your hotel while getting your first glimpse of the vibrant city.`,
          whatToExpected: ['Personal meet & greet at arrival hall', 'Assistance with luggage', 'Comfortable vehicle transfer', 'Brief city orientation during drive'],
          includes: ['Airport pickup service', 'Professional English-speaking driver', 'Air-conditioned vehicle', 'Complimentary bottled water'],
          excludes: ['Airport taxes', 'Personal expenses', 'Tips for driver (optional)'],
          meetingPoint: 'Arrival Hall - Driver will hold name sign',
          duration: '45-60 minutes'
        }
      },
      accommodation: {
        'Hotel check-in': {
          description: `Check into your carefully selected accommodation, chosen for its comfort, location, and authentic local character. Our team has pre-arranged your room to ensure a smooth arrival experience.`,
          whatToExpect: ['Swift check-in process', 'Room orientation', 'Hotel facilities briefing', 'Local area information'],
          includes: ['Pre-arranged check-in', 'Welcome refreshment', 'Hotel facilities access', 'Concierge assistance'],
          duration: '30-45 minutes'
        }
      },
      activity: {
        'City orientation walk': {
          description: `Discover the heart and soul of ${cityName} through this immersive walking tour. Led by knowledgeable local guides, explore hidden gems, bustling markets, and iconic landmarks while learning about the rich history, culture, and daily life of the locals.`,
          whatToExpect: ['Small group experience (max 12 people)', 'Professional local guide', 'Cultural insights and stories', 'Photo opportunities at scenic spots', 'Interactive experience with locals'],
          includes: ['Professional guide (English speaking)', 'Walking tour route map', 'Cultural commentary', 'Safety briefing', 'Small group experience'],
          excludes: ['Personal expenses', 'Food and beverages', 'Entrance fees to attractions', 'Transportation to meeting point'],
          meetingPoint: `${cityName} Central Square (Hotel pickup available)`,
          tips: ['Wear comfortable walking shoes', 'Bring sun protection (hat, sunscreen)', 'Stay hydrated - bring water bottle', 'Dress modestly for cultural sites', 'Bring camera for memorable photos'],
          duration: '2.5-3 hours'
        }
      },
      meal: {
        'Welcome dinner at local restaurant': {
          description: `Indulge in an authentic culinary journey featuring the finest local cuisine at a carefully selected restaurant. This welcome dinner is designed to introduce you to the diverse flavors and dining culture of ${cityName}.`,
          whatToExpect: ['Multi-course traditional meal', 'Local specialties and delicacies', 'Cultural dining experience', 'Restaurant with local atmosphere', 'Dietary accommodations available'],
          includes: ['Set menu dinner (3-4 courses)', 'Local beverages (1-2 drinks)', 'Service charge and taxes', 'Cultural dining experience'],
          excludes: ['Additional alcoholic beverages', 'Personal food preferences beyond standard menu', 'Transportation to restaurant', 'Tips for restaurant staff'],
          meetingPoint: 'Hotel lobby (group transfer provided)',
          duration: '2-2.5 hours'
        }
      }
    }

    // Get specific details based on activity and type
    const typeDetails = baseDescriptions[type as keyof typeof baseDescriptions]
    const specificDetails = typeDetails?.[activity as keyof typeof typeDetails]

    if (specificDetails) {
      return {
        description: specificDetails.description,
        whatToExpect: specificDetails.whatToExpected || [],
        includes: specificDetails.includes || [],
        excludes: specificDetails.excludes || [],
        meetingPoint: specificDetails.meetingPoint || `${cityName} City Center`,
        tips: specificDetails.tips || ['Arrive 15 minutes early', 'Bring comfortable clothing', 'Stay hydrated'],
        duration: specificDetails.duration || '2-3 hours',
        location: `${cityName}, ${destination.split(',')[1] || 'Local Area'}`,
        highlights: specificDetails.includes || ['Professional service', 'Local experience', 'Cultural insights'],
        importantInfo: [`Please arrive 15 minutes before scheduled time`, `Contact our 24/7 support: +60 12-345-6789`, `Weather-dependent activities may be adjusted`],
        contactInfo: {
          phone: '+60 12-345-6789',
          email: 'support@holidayai.com',
          whatsapp: '+60 12-345-6789'
        }
      }
    }

    // Default fallback with comprehensive details
    return {
      description: `Experience ${activity.toLowerCase()} in ${cityName} with our expertly planned itinerary. This ${type} is carefully curated to provide authentic local experiences while ensuring your comfort and safety throughout.`,
      whatToExpect: ['Professional service', 'Local cultural insights', 'Small group experience', 'Photo opportunities'],
      includes: ['Professional guidance', 'Safety measures', 'Cultural commentary'],
      excludes: ['Personal expenses', 'Optional activities', 'Gratuities'],
      meetingPoint: `${cityName} designated meeting point`,
      tips: ['Comfortable clothing recommended', 'Bring camera', 'Stay hydrated', 'Respect local customs'],
      duration: type === 'meal' ? '1.5-2 hours' : type === 'transport' ? '30-60 minutes' : '2-3 hours',
      location: `${cityName}, ${destination}`,
      highlights: ['Authentic experience', 'Professional service', 'Cultural immersion'],
      importantInfo: [`Arrive 15 minutes early`, `Emergency contact: +60 12-345-6789`],
      contactInfo: {
        phone: '+60 12-345-6789',
        email: 'support@holidayai.com',
        whatsapp: '+60 12-345-6789'
      }
    }
  }

  // Generate realistic meal plans for each day
  const generateMealsForDay = (dayIndex: number, destination: string) => {
    const cityName = destination.split(',')[0]
    const mealPlans = [
      [
        { name: 'Welcome Breakfast', time: '8:00 AM', cost: 25, type: 'Continental', description: `Start your ${cityName} adventure with a hearty continental breakfast featuring local pastries and fresh tropical fruits.`, cuisine: 'International', dietary: ['Vegetarian options', 'Halal certified'] },
        { name: 'Local Street Food Lunch', time: '12:30 PM', cost: 18, type: 'Street Food', description: 'Authentic street food experience guided by locals, featuring signature dishes and hidden culinary gems.', cuisine: 'Local', dietary: ['Spicy options available', 'Vegetarian friendly'] },
        { name: 'Traditional Dinner', time: '7:00 PM', cost: 45, type: 'Fine Dining', description: `Elegant dining experience showcasing ${cityName}'s finest traditional cuisine in a culturally rich atmosphere.`, cuisine: 'Traditional', dietary: ['Halal certified', 'Vegetarian menu'] }
      ],
      [
        { name: 'Hotel Breakfast Buffet', time: '7:30 AM', cost: 30, type: 'Buffet', description: 'International buffet with local specialties, fresh fruits, and made-to-order options.', cuisine: 'International', dietary: ['Full dietary accommodations'] },
        { name: 'Riverside Lunch', time: '1:00 PM', cost: 35, type: 'Scenic Dining', description: 'Picturesque lunch with waterfront views, featuring fresh seafood and local delicacies.', cuisine: 'Seafood & Local', dietary: ['Pescatarian friendly'] },
        { name: 'Night Market Food Tour', time: '6:30 PM', cost: 28, type: 'Food Tour', description: 'Guided culinary adventure through bustling night markets, sampling diverse local flavors.', cuisine: 'Street Food Variety', dietary: ['Multiple dietary options'] }
      ]
    ]

    return mealPlans[dayIndex % 2] || mealPlans[0]
  }

  // Enhanced days with comprehensive travel agency-style information
  const enhancedDays = days.map((day, dayIndex) => ({
    ...day,
    schedule: day.schedule?.map(item => {
      const activityDetails = getDetailedActivityInfo(item.activity, item.type, destination);
      return {
        ...item,
        description: item.description || activityDetails.description,
        location: item.location || activityDetails.location,
        duration: item.duration || activityDetails.duration,
        highlights: item.highlights || activityDetails.highlights,
        images: getActivityImages(item.activity, destination),
        tips: item.tips || activityDetails.tips,
        whatToExpect: activityDetails.whatToExpect,
        importantInfo: activityDetails.importantInfo,
        includes: activityDetails.includes,
        excludes: activityDetails.excludes,
        meetingPoint: activityDetails.meetingPoint,
        contactInfo: activityDetails.contactInfo
      }
    }) || [],
    weather: day.weather || {
      condition: 'Partly Cloudy',
      temperature: 28,
      humidity: 65,
      windSpeed: 15,
      uvIndex: 6,
      sunrise: '06:30',
      sunset: '18:45'
    },
    transportation: day.transportation || {
      method: 'Private Air-conditioned Vehicle with Professional Driver',
      duration: '30-45 minutes per transfer',
      cost: 50,
      vehicleType: 'Premium Toyota Alphard (7-seater)',
      features: ['WiFi', 'USB Charging', 'Cool Towels', 'Complimentary Water'],
      pickupTime: '15 minutes before each activity'
    },
    meals: day.meals || generateMealsForDay(dayIndex, destination)
  }))

  const toggleDay = (dayIndex: number) => {
    setExpandedDay(expandedDay === dayIndex ? null : dayIndex)
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-bold text-white">Detailed Daily Itinerary</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              viewMode === 'timeline' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {enhancedDays.map((day, dayIndex) => (
          <motion.div
            key={dayIndex}
            className="border border-white/10 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.1 }}
          >
            {/* Day Header */}
            <button
              onClick={() => toggleDay(dayIndex)}
              className="w-full p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">{day.day}</span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-white">{day.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{day.schedule?.length || 0} activities</span>
                      <span>Budget: {formatPrice(day.dayTotal || 0)}</span>
                      {day.weather && (
                        <span>{day.weather.temperature}°C, {day.weather.condition}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right mr-2">
                    <div className="text-sm text-gray-400">Day Total</div>
                    <div className="text-lg font-bold text-white">{formatPrice(day.dayTotal || 0)}</div>
                  </div>
                  {expandedDay === dayIndex ? 
                    <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </div>
            </button>

            {/* Day Content */}
            <AnimatePresence>
              {expandedDay === dayIndex && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-black/20">
                    {/* Enhanced Day Overview - Travel Agency Style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {/* Weather Information */}
                      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <ThermometerSun className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">Weather</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-white">{day.weather?.temperature || 28}°C</span>
                            <span className="text-xs text-gray-300 capitalize">{day.weather?.condition || 'Pleasant'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                            <div className="flex items-center space-x-1">
                              <Droplets className="w-3 h-3" />
                              <span>{day.weather?.humidity || 65}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Wind className="w-3 h-3" />
                              <span>{day.weather?.windSpeed || 15}km/h</span>
                            </div>
                          </div>
                          <div className="text-xs text-blue-300">
                            🌅 {day.weather?.sunrise || '06:30'} | 🌅 {day.weather?.sunset || '18:45'}
                          </div>
                        </div>
                      </div>

                      {/* Transportation Details */}
                      <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Car className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium text-white">Transportation</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-300 font-medium">{day.transportation?.vehicleType || 'Premium Vehicle'}</p>
                          <p className="text-xs text-gray-400">{day.transportation?.method}</p>
                          <div className="flex items-center space-x-2 text-xs">
                            <Clock className="w-3 h-3 text-green-300" />
                            <span className="text-gray-300">{day.transportation?.duration}</span>
                          </div>
                          {day.transportation?.features && (
                            <div className="flex flex-wrap gap-1">
                              {day.transportation.features.slice(0, 2).map((feature, idx) => (
                                <span key={idx} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                  {feature}
                                </span>
                              ))}
                              {day.transportation.features.length > 2 && (
                                <span className="text-xs text-blue-300">+{day.transportation.features.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Meals Preview */}
                      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Utensils className="w-4 h-4 text-orange-400" />
                          <span className="text-sm font-medium text-white">Dining ({day.meals?.length || 0})</span>
                        </div>
                        <div className="space-y-2">
                          {day.meals?.slice(0, 2).map((meal, idx) => (
                            <div key={idx} className="text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">{meal.name}</span>
                                <span className="text-green-400">{formatPrice(meal.cost)}</span>
                              </div>
                              <div className="text-gray-400">{meal.time} • {meal.cuisine}</div>
                            </div>
                          ))}
                          {day.meals && day.meals.length > 2 && (
                            <div className="text-xs text-blue-300">+{day.meals.length - 2} more meals</div>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            {day.meals?.[0]?.dietary?.join(', ') || 'Dietary options available'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Day Highlights & Budget */}
                      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium text-white">Day Summary</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Activities</span>
                            <span className="text-sm font-bold text-white">{day.schedule?.length || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Day Total</span>
                            <span className="text-sm font-bold text-green-400">{formatPrice(day.dayTotal || 0)}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {day.highlights?.slice(0, 2).map((highlight, idx) => (
                              <div key={idx} className="flex items-center space-x-1 mb-1">
                                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                                <span>{highlight}</span>
                              </div>
                            )) || <span>Curated experiences</span>}
                          </div>
                          {day.highlights && day.highlights.length > 2 && (
                            <div className="text-xs text-blue-300">+{day.highlights.length - 2} more highlights</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Activities Timeline */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-white mb-4">Activity Schedule</h5>
                      
                      {viewMode === 'timeline' ? (
                        <div className="relative">
                          {/* Timeline Line */}
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-purple-400"></div>
                          
                          {day.schedule?.map((item, itemIndex) => (
                            <div key={itemIndex} className="relative flex items-start space-x-4 mb-6">
                              {/* Timeline Dot */}
                              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getActivityTypeColor(item.type)}`}>
                                {getActivityTypeIcon(item.type)}
                              </div>
                              
                              {/* Enhanced Activity Card - Travel Agency Style */}
                              <div className="flex-1 bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-5 hover:from-white/10 hover:to-white/15 transition-all duration-300 cursor-pointer border border-white/10"
                                   onClick={() => setSelectedActivity(item)}>
                                
                                {/* Header with Time and Type */}
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                      <Clock className="w-4 h-4 text-blue-300" />
                                      <span className="text-base font-semibold text-blue-300">{item.time}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getActivityTypeColor(item.type)}`}>
                                      {getActivityTypeIcon(item.type)}
                                      <span className="ml-1">{item.type}</span>
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-base font-bold text-green-400">{formatPrice(item.cost)}</div>
                                    <div className="text-xs text-gray-400">per person</div>
                                  </div>
                                </div>

                                {/* Activity Title and Quick Info */}
                                <div className="mb-4">
                                  <h6 className="text-lg font-semibold text-white mb-2">{item.activity}</h6>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center space-x-1 text-gray-300">
                                      <Clock className="w-3 h-3" />
                                      <span>{item.duration}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-gray-300">
                                      <MapPin className="w-3 h-3" />
                                      <span className="truncate">{item.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-gray-300">
                                      <Users className="w-3 h-3" />
                                      <span>Small group</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-gray-300">
                                      <Shield className="w-3 h-3" />
                                      <span>Insured</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Description */}
                                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{item.description}</p>
                                
                                {/* What's Included Preview */}
                                {item.includes && item.includes.length > 0 && (
                                  <div className="mb-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                      <span className="text-sm font-medium text-white">What's Included:</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1">
                                      {item.includes.slice(0, 3).map((include, idx) => (
                                        <div key={idx} className="flex items-center space-x-2 text-xs text-gray-300">
                                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                                          <span>{include}</span>
                                        </div>
                                      ))}
                                      {item.includes.length > 3 && (
                                        <div className="text-xs text-blue-300 mt-1">+{item.includes.length - 3} more included</div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Meeting Point */}
                                {item.meetingPoint && (
                                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <Navigation className="w-3 h-3 text-blue-300" />
                                      <span className="text-xs font-medium text-blue-300">Meeting Point</span>
                                    </div>
                                    <p className="text-xs text-gray-300">{item.meetingPoint}</p>
                                  </div>
                                )}

                                {/* Important Info */}
                                {item.importantInfo && item.importantInfo.length > 0 && (
                                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <AlertTriangle className="w-3 h-3 text-yellow-300" />
                                      <span className="text-xs font-medium text-yellow-300">Important Information</span>
                                    </div>
                                    <div className="text-xs text-gray-300">{item.importantInfo[0]}</div>
                                    {item.importantInfo.length > 1 && (
                                      <div className="text-xs text-blue-300 mt-1">+{item.importantInfo.length - 1} more notices</div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                  <div className="flex items-center space-x-2">
                                    <button className="flex items-center space-x-1 p-2 hover:bg-white/10 rounded-lg transition-colors text-xs text-gray-300">
                                      <Heart className="w-3 h-3" />
                                      <span>Save</span>
                                    </button>
                                    <button className="flex items-center space-x-1 p-2 hover:bg-white/10 rounded-lg transition-colors text-xs text-gray-300">
                                      <Share2 className="w-3 h-3" />
                                      <span>Share</span>
                                    </button>
                                  </div>
                                  
                                  <button className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-xs font-medium text-white hover:from-blue-600 hover:to-purple-700 transition-all">
                                    <Info className="w-3 h-3" />
                                    <span>Full Details</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )) || []}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {day.schedule?.map((item, itemIndex) => (
                            <div key={itemIndex} 
                                 className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                                 onClick={() => setSelectedActivity(item)}>
                              <div className="flex items-start justify-between mb-2">
                                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${getActivityTypeColor(item.type)}`}>
                                  {getActivityTypeIcon(item.type)}
                                </div>
                                <span className="text-sm text-green-400">{formatPrice(item.cost)}</span>
                              </div>
                              
                              <div className="mb-2">
                                <span className="text-xs text-blue-300">{item.time}</span>
                                <h6 className="text-white font-medium">{item.activity}</h6>
                              </div>
                              
                              <p className="text-sm text-gray-300 text-ellipsis overflow-hidden">
                                {item.description?.slice(0, 100)}...
                              </p>
                            </div>
                          )) || []}
                        </div>
                      )}
                    </div>

                    {/* Day Highlights */}
                    {day.highlights && day.highlights.length > 0 && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                        <h6 className="text-yellow-300 font-medium mb-2">Day Highlights</h6>
                        <div className="grid grid-cols-2 gap-2">
                          {day.highlights.map((highlight, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-sm text-yellow-200">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{selectedActivity.activity}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>{selectedActivity.time}</span>
                    <span>•</span>
                    <span>{selectedActivity.duration}</span>
                    <span>•</span>
                    <span className="text-green-400">{formatPrice(selectedActivity.cost)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Activity Images */}
                {selectedActivity.images && selectedActivity.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedActivity.images.slice(0, 4).map((image, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={image}
                          alt={selectedActivity.activity}
                          className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 rounded-lg transition-all">
                          <div className="absolute bottom-2 left-2">
                            <ImageIcon className="w-4 h-4 text-white/80" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Activity Description */}
                <div>
                  <h6 className="text-lg font-semibold text-white mb-3">Experience Overview</h6>
                  <p className="text-gray-300 leading-relaxed">{selectedActivity.description}</p>
                </div>

                {/* What to Expect */}
                {selectedActivity.whatToExpect && selectedActivity.whatToExpect.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Zap className="w-5 h-5 text-blue-400" />
                      <h6 className="text-white font-medium">What to Expect</h6>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedActivity.whatToExpect.map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm text-gray-300">
                          <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* What's Included & Excluded */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedActivity.includes && selectedActivity.includes.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <h6 className="text-white font-medium">What's Included</h6>
                      </div>
                      <div className="space-y-2">
                        {selectedActivity.includes.map((item, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedActivity.excludes && selectedActivity.excludes.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <X className="w-5 h-5 text-red-400" />
                        <h6 className="text-white font-medium">Not Included</h6>
                      </div>
                      <div className="space-y-2">
                        {selectedActivity.excludes.map((item, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Meeting Point & Contact */}
                {(selectedActivity.meetingPoint || selectedActivity.contactInfo) && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Navigation className="w-5 h-5 text-purple-400" />
                      <h6 className="text-white font-medium">Logistics</h6>
                    </div>
                    <div className="space-y-3">
                      {selectedActivity.meetingPoint && (
                        <div>
                          <div className="text-sm font-medium text-purple-300 mb-1">Meeting Point</div>
                          <div className="text-sm text-gray-300">{selectedActivity.meetingPoint}</div>
                        </div>
                      )}
                      
                      {selectedActivity.contactInfo && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-purple-500/20">
                          {selectedActivity.contactInfo.phone && (
                            <div className="flex items-center space-x-2 text-xs text-gray-300">
                              <Phone className="w-3 h-3 text-purple-300" />
                              <span>{selectedActivity.contactInfo.phone}</span>
                            </div>
                          )}
                          {selectedActivity.contactInfo.email && (
                            <div className="flex items-center space-x-2 text-xs text-gray-300">
                              <Globe className="w-3 h-3 text-purple-300" />
                              <span>{selectedActivity.contactInfo.email}</span>
                            </div>
                          )}
                          {selectedActivity.contactInfo.whatsapp && (
                            <div className="flex items-center space-x-2 text-xs text-gray-300">
                              <Phone className="w-3 h-3 text-green-400" />
                              <span>WhatsApp: {selectedActivity.contactInfo.whatsapp}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Important Information */}
                {selectedActivity.importantInfo && selectedActivity.importantInfo.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      <h6 className="text-white font-medium">Important Information</h6>
                    </div>
                    <div className="space-y-2">
                      {selectedActivity.importantInfo.map((info, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{info}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips & Recommendations */}
                {selectedActivity.tips && selectedActivity.tips.length > 0 && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                      <h6 className="text-white font-medium">Travel Tips & Recommendations</h6>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedActivity.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm text-gray-300">
                          <Info className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>Save Activity</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Activity Price</div>
                    <div className="text-xl font-bold text-green-400">{formatPrice(selectedActivity.cost)}</div>
                    <div className="text-xs text-gray-400">per person</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}