'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Zap, 
  Clock, 
  Bell,
  CheckCircle,
  AlertCircle,
  ExternalLink 
} from 'lucide-react'

interface RealTimeUpdatesProps {
  itinerary: any
  onPriceUpdate?: (newPrice: number) => void
}

interface PriceUpdate {
  category: string
  oldPrice: number
  newPrice: number
  change: number
  changePercent: number
  provider: string
  timestamp: string
}

export default function RealTimeUpdates({ itinerary, onPriceUpdate }: RealTimeUpdatesProps) {
  const [updates, setUpdates] = useState<PriceUpdate[]>([])
  const [isTracking, setIsTracking] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [totalSavings, setTotalSavings] = useState(0)

  useEffect(() => {
    if (!isTracking) return

    const interval = setInterval(() => {
      simulateRealTimeUpdates()
    }, 15000) // Update every 15 seconds

    return () => clearInterval(interval)
  }, [isTracking, itinerary])

  const simulateRealTimeUpdates = () => {
    // Simulate real-time price changes
    const categories = [
      { name: 'flights', provider: 'Skyscanner', basePrice: itinerary.price.breakdown?.flights || 3000 },
      { name: 'hotels', provider: 'Booking.com', basePrice: itinerary.price.breakdown?.accommodation || 1500 },
      { name: 'activities', provider: 'GetYourGuide', basePrice: itinerary.price.breakdown?.activities || 600 }
    ]

    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const changePercent = (Math.random() - 0.5) * 0.1 // -5% to +5%
    const change = Math.round(randomCategory.basePrice * changePercent)
    const newPrice = randomCategory.basePrice + change

    if (Math.abs(change) > 10) { // Only show significant changes
      const update: PriceUpdate = {
        category: randomCategory.name,
        oldPrice: randomCategory.basePrice,
        newPrice: newPrice,
        change: change,
        changePercent: changePercent * 100,
        provider: randomCategory.provider,
        timestamp: new Date().toLocaleTimeString()
      }

      setUpdates(prev => [update, ...prev.slice(0, 4)]) // Keep last 5 updates
      setLastUpdate(new Date())
      
      if (change < 0) {
        setTotalSavings(prev => prev + Math.abs(change))
      }

      // Notify parent component
      onPriceUpdate?.(newPrice)
    }
  }

  const getChangeColor = (change: number) => {
    return change < 0 ? 'text-green-400' : 'text-red-400'
  }

  const getChangeIcon = (change: number) => {
    return change < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />
  }

  return (
    <div className="space-y-6">
      {/* Real-time Status Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="text-blue-400" size={20} />
              {isTracking && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">Real-Time Price Tracking</h3>
              <p className="text-white/60 text-sm">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {totalSavings > 0 && (
              <div className="text-right">
                <div className="text-green-400 font-bold">-RM {totalSavings.toLocaleString()}</div>
                <div className="text-green-400/70 text-xs">Total saved</div>
              </div>
            )}
            
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`p-2 rounded-lg transition-all ${
                isTracking 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              <RefreshCw size={16} className={isTracking ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Price Update Feed */}
      <AnimatePresence>
        {updates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-white font-medium flex items-center gap-2">
              <Bell size={16} />
              Recent Price Updates
            </h4>
            
            {updates.map((update, idx) => (
              <motion.div
                key={`${update.category}-${update.timestamp}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg border ${
                  update.change < 0 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      update.change < 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {getChangeIcon(update.change)}
                    </div>
                    
                    <div>
                      <div className="text-white font-medium capitalize">
                        {update.category} Price Update
                      </div>
                      <div className="text-white/60 text-sm">
                        via {update.provider} • {update.timestamp}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold ${getChangeColor(update.change)}`}>
                      {update.change < 0 ? '-' : '+'}RM {Math.abs(update.change)}
                    </div>
                    <div className="text-white/60 text-sm">
                      RM {update.newPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Booking Opportunities */}
      {updates.some(u => u.change < 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/30"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="text-green-400" size={20} />
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Great Deal Alert! 🎉</h4>
                <p className="text-white/80 text-sm mb-3">
                  Prices have dropped for multiple components. Book now to lock in these savings!
                </p>
                
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all">
                    <ExternalLink size={16} />
                    Book Now
                  </button>
                  
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all">
                    <Bell size={16} />
                    Set Alert
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-green-400 font-bold text-xl">
                Save RM {totalSavings.toLocaleString()}
              </div>
              <div className="text-green-400/70 text-sm">vs original price</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Price Prediction */}
      <PricePrediction itinerary={itinerary} updates={updates} />
    </div>
  )
}

function PricePrediction({ itinerary, updates }: { itinerary: any, updates: PriceUpdate[] }) {
  const [prediction, setPrediction] = useState<{
    trend: 'up' | 'down' | 'stable'
    confidence: number
    recommendation: string
    bestTimeToBook: string
  } | null>(null)

  useEffect(() => {
    // Simple prediction based on recent updates
    if (updates.length >= 3) {
      const recentChanges = updates.slice(0, 3).map(u => u.change)
      const avgChange = recentChanges.reduce((sum, change) => sum + change, 0) / recentChanges.length
      
      let trend: 'up' | 'down' | 'stable'
      let recommendation: string
      let bestTimeToBook: string
      
      if (avgChange < -20) {
        trend = 'down'
        recommendation = 'Excellent time to book! Prices are trending down.'
        bestTimeToBook = 'Now'
      } else if (avgChange > 20) {
        trend = 'up'
        recommendation = 'Consider booking soon. Prices are trending up.'
        bestTimeToBook = 'Within 24 hours'
      } else {
        trend = 'stable'
        recommendation = 'Prices are stable. You can take your time.'
        bestTimeToBook = 'Within a week'
      }
      
      setPrediction({
        trend,
        confidence: Math.min(85 + Math.random() * 10, 95),
        recommendation,
        bestTimeToBook
      })
    }
  }, [updates])

  if (!prediction) return null

  return (
    <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <TrendingUp className="text-indigo-400" size={16} />
        </div>
        <div>
          <h4 className="text-white font-semibold">AI Price Prediction</h4>
          <div className="text-indigo-400 text-sm">{prediction.confidence}% confidence</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/60">Trend:</span>
          <span className={`font-medium ${
            prediction.trend === 'down' ? 'text-green-400' :
            prediction.trend === 'up' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {prediction.trend === 'down' ? '📉 Decreasing' :
             prediction.trend === 'up' ? '📈 Increasing' : '📊 Stable'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-white/60">Best time to book:</span>
          <span className="text-white font-medium">{prediction.bestTimeToBook}</span>
        </div>
        
        <div className="pt-2 border-t border-white/10">
          <p className="text-white/80 text-sm">{prediction.recommendation}</p>
        </div>
      </div>
    </div>
  )
}