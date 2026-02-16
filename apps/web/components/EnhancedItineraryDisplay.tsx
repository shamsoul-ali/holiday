'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle,
  ExternalLink,
  Star,
  Clock,
  MapPin,
  Plane,
  Hotel,
  Camera,
  Car,
  Utensils,
  CreditCard,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react'
import { getProviderBrand, formatPriceWithProvider, getRealTimeStatus } from '../lib/provider-branding'
import RealTimeUpdates from './RealTimeUpdates'

interface EnhancedItineraryDisplayProps {
  itinerary: any
}

export default function EnhancedItineraryDisplay({ itinerary }: EnhancedItineraryDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Provider Showcase Header */}
      {itinerary.api_powered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl border border-blue-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">AI-Powered Real-Time Data</h3>
              <p className="text-white/60 text-sm">Powered by live APIs from trusted travel providers</p>
            </div>
            <div className="ml-auto">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Data
              </div>
            </div>
          </div>
          
          {/* Provider Badges */}
          <div className="flex flex-wrap gap-2">
            {itinerary.providers?.map((provider, idx) => {
              const brand = getProviderBrand(provider)
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs text-white/80"
                >
                  <span>{brand?.logo || '🌐'}</span>
                  <span>{brand?.name || provider}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Enhanced Flight Details */}
      {itinerary.flightDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Plane className="text-blue-400" />
              Flight Details
            </h3>
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <span>✈️</span>
              <span>Powered by Skyscanner</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Outbound Flight */}
            <FlightCard 
              flight={itinerary.flightDetails.outbound}
              type="Outbound"
              realTimeStatus={getRealTimeStatus('skyscanner')}
            />
            
            {/* Return Flight */}
            <FlightCard 
              flight={itinerary.flightDetails.return}
              type="Return" 
              realTimeStatus={getRealTimeStatus('skyscanner')}
            />
          </div>
        </motion.div>
      )}

      {/* Enhanced Accommodation */}
      {itinerary.accommodationDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Hotel className="text-green-400" />
              Accommodation
            </h3>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <span>🏨</span>
              <span>Powered by Booking.com</span>
            </div>
          </div>

          {itinerary.accommodationDetails.hotels.map((hotel, idx) => (
            <HotelCard 
              key={idx}
              hotel={hotel}
              realTimeStatus={getRealTimeStatus('booking.com')}
            />
          ))}
        </motion.div>
      )}

      {/* Enhanced Daily Schedule with Provider Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h3 className="text-xl font-semibold text-white">Enhanced Daily Schedule</h3>
        
        {itinerary.days?.map((day, dayIdx) => (
          <DayCard 
            key={dayIdx}
            day={day}
            dayNumber={dayIdx + 1}
          />
        ))}
      </motion.div>

      {/* Real-Time Updates & Interactive Booking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h3 className="text-xl font-semibold text-white">Live Price Tracking</h3>
        <RealTimeUpdates itinerary={itinerary} />
      </motion.div>

      {/* Price Breakdown with Provider Attribution */}
      {itinerary.price.breakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white">Transparent Pricing</h3>
          <PriceBreakdownCard breakdown={itinerary.price.breakdown} />
        </motion.div>
      )}
    </div>
  )
}

function FlightCard({ flight, type, realTimeStatus }) {
  const isOutbound = type === 'Outbound'
  
  return (
    <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 hover:border-blue-400/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <Plane className={`${isOutbound ? 'text-blue-400' : 'text-purple-400 rotate-180'}`} size={18} />
          {type} Flight
        </h4>
        <div className="text-xs text-green-400 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          {realTimeStatus}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-white font-semibold">{flight.airline}</div>
            <div className="text-white/60 text-sm">{flight.flightNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-white font-semibold">{flight.class}</div>
            <div className="text-green-400 font-bold">RM {flight.price.toLocaleString()}</div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-white font-semibold text-lg">{flight.departure.time}</div>
              <div className="text-white/60">{flight.departure.airport}</div>
            </div>
            
            <div className="flex-1 mx-4">
              <div className="flex items-center justify-center">
                <div className="flex-1 h-px bg-white/20"></div>
                <div className="px-3 text-white/60 text-sm">{flight.duration}</div>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white font-semibold text-lg">{flight.arrival.time}</div>
              <div className="text-white/60">{flight.arrival.airport}</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
            <ExternalLink size={16} />
            Book with Skyscanner
          </button>
        </div>
      </div>
    </div>
  )
}

function HotelCard({ hotel, realTimeStatus }) {
  return (
    <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 hover:border-green-400/50 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xl font-semibold text-white">{hotel.name}</h4>
            <div className="text-xs text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              {realTimeStatus}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1">
              {[...Array(hotel.rating)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-white/60">•</span>
            <div className="flex items-center gap-1 text-white/60">
              <MapPin size={14} />
              <span>{hotel.location}</span>
            </div>
          </div>
          
          <div className="text-white/80 mb-4">{hotel.roomType}</div>
        </div>
        
        <div className="text-right ml-6">
          <div className="text-2xl font-bold text-white">RM {hotel.pricePerNight.toLocaleString()}</div>
          <div className="text-white/60 text-sm">per night</div>
          <div className="text-green-400 font-semibold mt-1">
            Total: RM {hotel.totalPrice.toLocaleString()}
          </div>
          <div className="text-white/60 text-xs">({hotel.totalNights} nights)</div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4 mb-4">
        <h5 className="text-white font-medium mb-3">Amenities</h5>
        <div className="grid grid-cols-2 gap-2">
          {hotel.amenities.slice(0, 6).map((amenity, idx) => (
            <div key={idx} className="flex items-center gap-2 text-white/70">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-sm">{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
        <ExternalLink size={16} />
        Book with Booking.com
      </button>
    </div>
  )
}

function DayCard({ day, dayNumber }) {
  return (
    <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-white">
          Day {dayNumber}: {day.title}
        </h4>
        {day.dayTotal && (
          <div className="text-green-400 font-bold">
            RM {day.dayTotal.toLocaleString()}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {day.schedule?.map((item, idx) => (
          <ScheduleItem key={idx} item={item} />
        ))}
      </div>
    </div>
  )
}

function ScheduleItem({ item }) {
  const getIcon = (type) => {
    switch (type) {
      case 'meal': return <Utensils className="text-orange-400" size={18} />
      case 'activity': return <Camera className="text-purple-400" size={18} />
      case 'transport': return <Car className="text-blue-400" size={18} />
      case 'accommodation': return <Hotel className="text-green-400" size={18} />
      default: return <Clock className="text-gray-400" size={18} />
    }
  }

  const getProviderInfo = (type, activity) => {
    if (type === 'activity') return { name: 'GetYourGuide', logo: '🎯' }
    if (type === 'transport' && activity.toLowerCase().includes('uber')) return { name: 'Uber', logo: '🚗' }
    if (type === 'transport') return { name: 'Rome2Rio', logo: '🚌' }
    return null
  }

  const provider = getProviderInfo(item.type, item.activity)

  return (
    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3">
        <div className="text-blue-400 font-mono font-bold text-lg min-w-[60px]">
          {item.time}
        </div>
        {getIcon(item.type)}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-white font-medium mb-1">{item.activity}</div>
            
            {item.details && (
              <div className="space-y-2 text-sm text-white/70">
                {item.details.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-400" />
                    <span>{item.details.location}</span>
                  </div>
                )}
                {item.details.tips && (
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-yellow-400" />
                    <span>{item.details.tips}</span>
                  </div>
                )}
              </div>
            )}

            {provider && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs">{provider.logo}</span>
                <span className="text-xs text-white/60">Powered by {provider.name}</span>
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Live pricing</span>
              </div>
            )}
          </div>

          <div className="text-right ml-4">
            {item.cost > 0 ? (
              <div className="text-green-400 font-bold">RM {item.cost}</div>
            ) : (
              <div className="text-gray-500 font-medium">Free</div>
            )}
            {item.duration && (
              <div className="text-white/60 text-xs">{item.duration}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PriceBreakdownCard({ breakdown }) {
  const priceItems = [
    { label: 'Flight Tickets', amount: breakdown.flights, provider: 'Skyscanner', icon: '✈️' },
    { label: 'Accommodation', amount: breakdown.accommodation, provider: 'Booking.com', icon: '🏨' },
    { label: 'Activities & Tours', amount: breakdown.activities, provider: 'GetYourGuide', icon: '🎯' },
    { label: 'Meals & Dining', amount: breakdown.meals, provider: 'Local Partners', icon: '🍽️' },
    { label: 'Local Transport', amount: breakdown.transport, provider: 'Uber + Rome2Rio', icon: '🚗' },
    { label: 'Travel Insurance', amount: breakdown.insurance, provider: 'Allianz', icon: '🛡️' },
    { label: 'Taxes & Fees', amount: breakdown.taxes, provider: 'Various', icon: '📋' }
  ]

  const total = Object.values(breakdown).reduce((sum: number, val: any) => sum + (val || 0), 0)

  return (
    <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10">
      <div className="space-y-4">
        {priceItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <div className="text-white">{item.label}</div>
                <div className="text-white/60 text-sm">via {item.provider}</div>
              </div>
            </div>
            <div className="text-white font-medium">RM {item.amount.toLocaleString()}</div>
          </div>
        ))}
        
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-400" />
              <span className="text-xl font-bold text-white">Total Price</span>
            </div>
            <span className="text-2xl font-bold text-green-400">RM {total.toLocaleString()}</span>
          </div>
          <div className="text-right text-white/60 text-sm mt-1">
            Best prices guaranteed across all platforms
          </div>
        </div>
      </div>
    </div>
  )
}