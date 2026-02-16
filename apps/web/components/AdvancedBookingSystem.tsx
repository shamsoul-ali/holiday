'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  MapPin, 
  Plane, 
  Hotel, 
  Car, 
  Clock, 
  DollarSign,
  Plus,
  X,
  Check,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Shuffle,
  BookOpen,
  CreditCard,
  Shield,
  Bell,
  Settings,
  Filter,
  Search,
  Star,
  Heart,
  Share2,
  Eye,
  ChevronDown,
  ChevronUp,
  Navigation,
  Zap,
  Target
} from 'lucide-react'

interface BookingOption {
  id: string
  type: 'flight' | 'hotel' | 'package' | 'activity' | 'transport'
  title: string
  description: string
  price: number
  originalPrice?: number
  currency: string
  provider: string
  rating: number
  reviews: number
  images: string[]
  features: string[]
  cancellation: 'free' | 'flexible' | 'non-refundable'
  availability: 'high' | 'medium' | 'low' | 'last-few'
  duration?: string
  location?: string
  priceAlert?: boolean
  bestValue?: boolean
  recommended?: boolean
}

interface FlexibleDate {
  date: string
  price: number
  priceChange: number
  dayOfWeek: string
  isSelected: boolean
}

interface GroupBooking {
  id: string
  name: string
  travelers: {
    adults: number
    children: number
    infants: number
  }
  budget: {
    perPerson: number
    total: number
    flexible: boolean
  }
  preferences: string[]
  bookedBy: string
  status: 'draft' | 'pending' | 'confirmed' | 'cancelled'
}

interface MultiCityTrip {
  id: string
  cities: Array<{
    name: string
    country: string
    arrival: string
    departure: string
    duration: number
    recommended?: boolean
  }>
  totalDuration: number
  estimatedPrice: number
  optimized: boolean
}

export default function AdvancedBookingSystem() {
  const [activeTab, setActiveTab] = useState<'search' | 'flexible' | 'group' | 'multi-city' | 'alerts'>('search')
  const [searchResults, setSearchResults] = useState<BookingOption[]>([])
  const [flexibleDates, setFlexibleDates] = useState<FlexibleDate[]>([])
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([])
  const [multiCityTrips, setMultiCityTrips] = useState<MultiCityTrip[]>([])
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'popularity' | 'duration'>('price')
  const [priceAlerts, setPriceAlerts] = useState<any[]>([])
  const [selectedBooking, setSelectedBooking] = useState<BookingOption | null>(null)

  useEffect(() => {
    generateSampleData()
  }, [])

  const generateSampleData = () => {
    const sampleResults: BookingOption[] = [
      {
        id: '1',
        type: 'package',
        title: '5D4N Jakarta Cultural Explorer',
        description: 'Discover Jakarta\'s rich heritage with guided tours, local cuisine experiences, and cultural workshops.',
        price: 1299,
        originalPrice: 1599,
        currency: 'MYR',
        provider: 'Holiday AI Premium',
        rating: 4.8,
        reviews: 234,
        images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
        features: ['Cultural Guide', 'Local Cuisine', 'Museum Tours', 'Traditional Workshops'],
        cancellation: 'flexible',
        availability: 'medium',
        duration: '5 days',
        location: 'Jakarta, Indonesia',
        bestValue: true,
        recommended: true
      },
      {
        id: '2',
        type: 'flight',
        title: 'Premium Flight to Bangkok',
        description: 'Direct flight with complimentary meals and 30kg baggage allowance.',
        price: 456,
        originalPrice: 589,
        currency: 'MYR',
        provider: 'Malaysia Airlines',
        rating: 4.6,
        reviews: 1205,
        images: ['/api/placeholder/300/200'],
        features: ['Direct Flight', '30kg Baggage', 'Meals Included', 'In-flight Entertainment'],
        cancellation: 'flexible',
        availability: 'high',
        duration: '2h 15m',
        location: 'Bangkok, Thailand',
        priceAlert: true
      },
      {
        id: '3',
        type: 'hotel',
        title: 'Luxury Resort & Spa Bali',
        description: 'Beachfront luxury resort with private pool villas and world-class spa facilities.',
        price: 789,
        originalPrice: 1200,
        currency: 'MYR',
        provider: 'Booking.com',
        rating: 4.9,
        reviews: 567,
        images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
        features: ['Private Pool', 'Spa Access', 'Beach Front', 'Free WiFi'],
        cancellation: 'free',
        availability: 'low',
        duration: 'per night',
        location: 'Seminyak, Bali'
      }
    ]

    const sampleFlexibleDates: FlexibleDate[] = [
      { date: '2024-01-15', price: 1299, priceChange: -18, dayOfWeek: 'Mon', isSelected: false },
      { date: '2024-01-16', price: 1356, priceChange: -12, dayOfWeek: 'Tue', isSelected: true },
      { date: '2024-01-17', price: 1489, priceChange: +15, dayOfWeek: 'Wed', isSelected: false },
      { date: '2024-01-18', price: 1623, priceChange: +28, dayOfWeek: 'Thu', isSelected: false },
      { date: '2024-01-19', price: 1789, priceChange: +45, dayOfWeek: 'Fri', isSelected: false },
      { date: '2024-01-20', price: 1899, priceChange: +58, dayOfWeek: 'Sat', isSelected: false },
      { date: '2024-01-21', price: 1699, priceChange: +32, dayOfWeek: 'Sun', isSelected: false }
    ]

    const sampleGroupBookings: GroupBooking[] = [
      {
        id: '1',
        name: 'Family Bali Trip',
        travelers: { adults: 4, children: 2, infants: 0 },
        budget: { perPerson: 2000, total: 12000, flexible: true },
        preferences: ['Beach Resort', 'Family Friendly', 'Cultural Tours'],
        bookedBy: 'Sarah Johnson',
        status: 'confirmed'
      },
      {
        id: '2',
        name: 'Friends Bangkok Adventure',
        travelers: { adults: 6, children: 0, infants: 0 },
        budget: { perPerson: 1500, total: 9000, flexible: false },
        preferences: ['Nightlife', 'Street Food', 'Adventure Activities'],
        bookedBy: 'Mike Chen',
        status: 'pending'
      }
    ]

    const sampleMultiCity: MultiCityTrip[] = [
      {
        id: '1',
        cities: [
          { name: 'Bangkok', country: 'Thailand', arrival: '2024-01-15', departure: '2024-01-18', duration: 3, recommended: true },
          { name: 'Ho Chi Minh', country: 'Vietnam', arrival: '2024-01-18', departure: '2024-01-22', duration: 4 },
          { name: 'Siem Reap', country: 'Cambodia', arrival: '2024-01-22', departure: '2024-01-25', duration: 3 }
        ],
        totalDuration: 10,
        estimatedPrice: 2899,
        optimized: true
      }
    ]

    setSearchResults(sampleResults)
    setFlexibleDates(sampleFlexibleDates)
    setGroupBookings(sampleGroupBookings)
    setMultiCityTrips(sampleMultiCity)
  }

  const handleDateSelect = (dateIndex: number) => {
    setFlexibleDates(prev => prev.map((date, index) => ({
      ...date,
      isSelected: index === dateIndex
    })))
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  const sortResults = (results: BookingOption[]) => {
    switch (sortBy) {
      case 'price':
        return [...results].sort((a, b) => a.price - b.price)
      case 'rating':
        return [...results].sort((a, b) => b.rating - a.rating)
      case 'popularity':
        return [...results].sort((a, b) => b.reviews - a.reviews)
      default:
        return results
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'high': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-orange-100 text-orange-700'
      case 'last-few': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCancellationColor = (cancellation: string) => {
    switch (cancellation) {
      case 'free': return 'text-green-600'
      case 'flexible': return 'text-blue-600'
      case 'non-refundable': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Advanced Booking</h1>
        <p className="text-gray-600 dark:text-gray-300">Smart booking tools for flexible travel planning</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-2 mb-8">
        {[
          { id: 'search', name: 'Smart Search', icon: Search },
          { id: 'flexible', name: 'Flexible Dates', icon: Calendar },
          { id: 'group', name: 'Group Booking', icon: Users },
          { id: 'multi-city', name: 'Multi-City', icon: Navigation },
          { id: 'alerts', name: 'Price Alerts', icon: Bell }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Smart Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search destinations, hotels, activities..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
              >
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
                <option value="popularity">Sort by Popularity</option>
                <option value="duration">Sort by Duration</option>
              </select>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {['Best Value', 'Free Cancellation', 'Instant Confirmation', 'Local Experiences', 'Family Friendly'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedFilters.includes(filter)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {sortResults(searchResults).map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-72 h-48 md:h-auto">
                    <img
                      src={result.images[0]}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{result.title}</h3>
                          {result.recommended && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Recommended
                            </span>
                          )}
                          {result.bestValue && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              Best Value
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">{result.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{result.rating}</span>
                            <span>({result.reviews} reviews)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{result.location}</span>
                          </div>
                          {result.duration && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{result.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {result.originalPrice && (
                            <span className="text-gray-500 dark:text-gray-400 line-through">
                              {result.currency} {result.originalPrice}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {result.currency} {result.price}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getAvailabilityColor(result.availability)}`}>
                          {result.availability} availability
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.features.slice(0, 4).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {result.features.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                          +{result.features.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`${getCancellationColor(result.cancellation)}`}>
                          {result.cancellation === 'free' ? 'Free cancellation' :
                           result.cancellation === 'flexible' ? 'Flexible booking' : 'Non-refundable'}
                        </span>
                        {result.priceAlert && (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <Bell className="w-4 h-4" />
                            <span>Price alert active</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedBooking(result)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Flexible Dates Tab */}
      {activeTab === 'flexible' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Find the Best Dates</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Compare prices across different dates to find the best deals for your trip.
            </p>

            {/* Date Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {flexibleDates.map((date, index) => (
                <motion.button
                  key={date.date}
                  onClick={() => handleDateSelect(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    date.isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{date.dayOfWeek}</div>
                  <div className="text-sm text-gray-900 dark:text-white mb-2">
                    {new Date(date.date).getDate()}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    MYR {date.price}
                  </div>
                  <div className={`text-xs flex items-center justify-center space-x-1 ${
                    date.priceChange < 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {date.priceChange < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    <span>{Math.abs(date.priceChange)}%</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Selected Date Info */}
            {flexibleDates.find(d => d.isSelected) && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Selected Date Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Date: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(flexibleDates.find(d => d.isSelected)!.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Price: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      MYR {flexibleDates.find(d => d.isSelected)!.price}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Savings: </span>
                    <span className={`font-medium ${
                      flexibleDates.find(d => d.isSelected)!.priceChange < 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {flexibleDates.find(d => d.isSelected)!.priceChange}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Group Booking Tab */}
      {activeTab === 'group' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Group Bookings</h2>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Create Group</span>
            </button>
          </div>

          {/* Group Booking Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupBookings.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    group.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    group.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    group.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {group.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {group.travelers.adults} adults
                      {group.travelers.children > 0 && `, ${group.travelers.children} children`}
                      {group.travelers.infants > 0 && `, ${group.travelers.infants} infants`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      MYR {group.budget.total.toLocaleString()} total 
                      ({group.budget.perPerson}/person)
                      {group.budget.flexible && <span className="text-green-600 ml-2">Flexible</span>}
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    Organized by {group.bookedBy}
                  </div>
                </div>

                {/* Preferences */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.preferences.map((pref, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                    View Details
                  </button>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Edit
                    </button>
                    {group.status === 'draft' && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                        Invite Members
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-City Tab */}
      {activeTab === 'multi-city' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-City Trips</h2>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Plan New Trip</span>
            </button>
          </div>

          {/* Multi-City Trip Cards */}
          {multiCityTrips.map((trip) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {trip.cities.length}-City Southeast Asia Adventure
                  </h3>
                  <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{trip.totalDuration} days</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>MYR {trip.estimatedPrice.toLocaleString()}</span>
                    </div>
                    {trip.optimized && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Route Optimized
                      </span>
                    )}
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  Book Trip
                </button>
              </div>

              {/* City Timeline */}
              <div className="space-y-4">
                {trip.cities.map((city, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${
                        city.recommended ? 'bg-blue-600' : 'bg-gray-400'
                      }`} />
                      {index < trip.cities.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {city.name}, {city.country}
                          </h4>
                          {city.recommended && (
                            <span className="text-xs text-blue-600">Recommended stop</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {city.duration} days
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(city.arrival).toLocaleDateString()} - {new Date(city.departure).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <button className="flex items-center space-x-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-xl transition-colors">
                  <Shuffle className="w-4 h-4" />
                  <span>Optimize Route</span>
                </button>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Customize
                  </button>
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                    Share Trip
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Price Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Price Alert System</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get notified when prices drop for your favorite destinations and hotels
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              Set Up Alerts
            </button>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedBooking.title}
                  </h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <img
                    src={selectedBooking.images[0]}
                    alt={selectedBooking.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <p className="text-gray-600 dark:text-gray-300">{selectedBooking.description}</p>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBooking.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedBooking.currency} {selectedBooking.price}
                    </div>
                    {selectedBooking.originalPrice && (
                      <div className="text-gray-500 line-through">
                        {selectedBooking.currency} {selectedBooking.originalPrice}
                      </div>
                    )}
                  </div>
                  <button className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}