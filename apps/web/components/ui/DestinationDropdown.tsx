'use client'

import React, { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Plane, 
  Clock, 
  DollarSign, 
  Star, 
  Shield, 
  Thermometer,
  TrendingUp
} from 'lucide-react'
import { DestinationResult } from '../../lib/hooks/useDestinationSearch'

interface DestinationDropdownProps {
  isOpen: boolean
  results: DestinationResult[]
  popularDestinations: DestinationResult[]
  loading: boolean
  error: string | null
  query: string
  selectedIndex: number
  onSelect: (destination: DestinationResult) => void
  onMouseEnter: (index: number) => void
  className?: string
}

const DestinationDropdown = forwardRef<HTMLDivElement, DestinationDropdownProps>(
  ({ 
    isOpen, 
    results, 
    popularDestinations, 
    loading, 
    error, 
    query, 
    selectedIndex, 
    onSelect, 
    onMouseEnter, 
    className = '' 
  }, ref) => {
    const showResults = query.trim() && results.length > 0
    const showPopular = !query.trim() && popularDestinations.length > 0
    const showError = error && !loading
    const displayResults = showResults ? results : (showPopular ? popularDestinations : [])

    if (!isOpen) return null

    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden ${className}`}
        >
          {loading && (
            <div className="p-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                <span className="text-gray-300 text-sm">Searching destinations...</span>
              </div>
            </div>
          )}

          {showError && (
            <div className="p-4">
              <div className="flex items-center space-x-3 text-red-400">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-xs">!</span>
                </div>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {!loading && !showError && displayResults.length === 0 && query.trim() && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm mb-2">No destinations found for "{query}"</p>
              <p className="text-gray-500 text-xs">Try searching for cities like Tokyo, Bangkok, or Singapore</p>
            </div>
          )}

          {displayResults.length > 0 && (
            <div className="py-2">
              {/* Section Header */}
              {!query.trim() && (
                <div className="px-4 py-2 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">Popular Destinations</span>
                  </div>
                </div>
              )}

              {/* Results List */}
              <div className="max-h-80 overflow-y-auto">
                {displayResults.map((destination, index) => (
                  <DestinationItem
                    key={`${destination.destination_code}-${index}`}
                    destination={destination}
                    isSelected={index === selectedIndex}
                    onSelect={() => onSelect(destination)}
                    onMouseEnter={() => onMouseEnter(index)}
                  />
                ))}
              </div>

              {/* Footer */}
              {query.trim() && results.length > 0 && (
                <div className="px-4 py-2 border-t border-white/10 bg-black/20">
                  <p className="text-xs text-gray-500 text-center">
                    Found {results.length} destination{results.length !== 1 ? 's' : ''} • Powered by live flight data
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    )
  }
)

DestinationDropdown.displayName = 'DestinationDropdown'

interface DestinationItemProps {
  destination: DestinationResult
  isSelected: boolean
  onSelect: () => void
  onMouseEnter: () => void
}

function DestinationItem({ destination, isSelected, onSelect, onMouseEnter }: DestinationItemProps) {
  const countryEmojis: { [key: string]: string } = {
    'Thailand': '🇹🇭',
    'Singapore': '🇸🇬', 
    'Japan': '🇯🇵',
    'Indonesia': '🇮🇩',
    'Malaysia': '🇲🇾',
    'Vietnam': '🇻🇳',
    'South Korea': '🇰🇷',
    'Philippines': '🇵🇭',
    'Hong Kong': '🇭🇰',
    'Taiwan': '🇹🇼',
    'China': '🇨🇳',
    'India': '🇮🇳',
    'United Arab Emirates': '🇦🇪',
    'Australia': '🇦🇺',
    'New Zealand': '🇳🇿'
  }

  const getCountryEmoji = (country: string): string => {
    return countryEmojis[country] || '🌍'
  }

  const formatPrice = (price: number, currency: string): string => {
    if (price >= 1000) {
      return `${currency} ${(price / 1000).toFixed(1)}k`
    }
    return `${currency} ${price.toLocaleString()}`
  }

  const getVisaStatus = (required: boolean): { icon: React.ReactNode, text: string, color: string } => {
    if (required) {
      return {
        icon: <Shield className="w-3 h-3" />,
        text: 'Visa required',
        color: 'text-amber-400'
      }
    }
    return {
      icon: <Shield className="w-3 h-3" />,
      text: 'Visa-free',
      color: 'text-green-400'
    }
  }

  const visaStatus = getVisaStatus(destination.travel_requirements.visa_required)

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full px-4 py-4 text-left transition-all duration-200 border-l-2 ${
        isSelected
          ? 'bg-blue-500/10 border-l-blue-400 border-r border-r-blue-500/20'
          : 'hover:bg-white/5 border-l-transparent hover:border-l-blue-400/50'
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Main info */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="text-2xl flex-shrink-0 mt-0.5">
            {getCountryEmoji(destination.country)}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* City and Country */}
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-white text-base truncate">
                {destination.name}
              </h3>
              <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded font-mono">
                {destination.destination_code}
              </span>
            </div>
            
            {/* Flight info and visa status */}
            <div className="flex items-center space-x-4 mb-2">
              {destination.from_price.flight_duration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {destination.from_price.flight_duration}
                  </span>
                </div>
              )}
              
              <div className={`flex items-center space-x-1 ${visaStatus.color}`}>
                {visaStatus.icon}
                <span className="text-xs">{visaStatus.text}</span>
              </div>
            </div>

            {/* Tags and highlights */}
            <div className="flex flex-wrap gap-1">
              {destination.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Price and weather */}
        <div className="text-right flex-shrink-0 ml-4">
          <div className="flex items-center justify-end space-x-1 mb-1">
            <DollarSign className="w-3 h-3 text-green-400" />
            <span className="font-semibold text-green-400 text-sm">
              {formatPrice(destination.from_price.amount, destination.from_price.currency)}
            </span>
          </div>
          
          {destination.weather_info && (
            <div className="flex items-center justify-end space-x-1">
              <Thermometer className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-gray-400">
                {destination.weather_info.current_temp}°C
              </span>
            </div>
          )}
          
          {destination.popularity_score && (
            <div className="flex items-center justify-end space-x-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-gray-400">
                {Math.round(destination.popularity_score)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}

export default DestinationDropdown