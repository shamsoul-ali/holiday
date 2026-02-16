'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type Provider = 'amadeus' | 'google_places' | 'openai' | 'openweather' | 'google_maps' | 'kiwi' | 'skyscanner'

interface ProviderBadgeProps {
  provider: Provider
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

const providerConfig: Record<Provider, {
  name: string
  color: string
  bgColor: string
  description: string
  icon?: string
}> = {
  amadeus: {
    name: 'Amadeus',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Real-time flight and hotel pricing from Amadeus Travel Platform',
    icon: '✈️'
  },
  google_places: {
    name: 'Google Places',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Verified hotel ratings and reviews from Google',
    icon: '📍'
  },
  openai: {
    name: 'OpenAI',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'AI-powered itinerary generation and recommendations',
    icon: '🤖'
  },
  openweather: {
    name: 'OpenWeather',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Real-time weather forecasts and conditions',
    icon: '🌤️'
  },
  google_maps: {
    name: 'Google Maps',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Maps, directions, and location services',
    icon: '🗺️'
  },
  kiwi: {
    name: 'Kiwi',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Alternative flight options and routes',
    icon: '🥝'
  },
  skyscanner: {
    name: 'Skyscanner',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    description: 'Comprehensive flight price comparison',
    icon: '✈️'
  }
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5'
}

export default function ProviderBadge({
  provider,
  size = 'sm',
  showTooltip = true,
  className = ''
}: ProviderBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const config = providerConfig[provider]

  if (!config) return null

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`
          inline-flex items-center gap-1.5 rounded-full font-medium
          ${config.bgColor} ${config.color} ${sizeClasses[size]}
          ${className}
          transition-all duration-200 cursor-default
          ${isHovered ? 'scale-105' : ''}
        `}
      >
        {config.icon && <span>{config.icon}</span>}
        <span>{config.name}</span>
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none"
            >
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-xs whitespace-normal">
                {config.description}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

// Multi-provider badge component
interface ProviderBadgesProps {
  providers: Provider[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProviderBadges({ providers, size = 'sm', className = '' }: ProviderBadgesProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {providers.map(provider => (
        <ProviderBadge key={provider} provider={provider} size={size} />
      ))}
    </div>
  )
}
