'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Brain,
  Calendar,
  DollarSign,
  BarChart3,
  Target,
  Zap,
  ChevronRight,
  Info,
  TrendingDown as HistoryIcon
} from 'lucide-react'
import HistoricalPriceAnalysis from './HistoricalPriceAnalysis'

interface PricePredictionData {
  current_price: {
    amount: number
    currency: string
    provider: string
    last_updated: string
  }
  prediction: {
    recommendation: 'BUY_NOW' | 'WAIT' | 'MONITOR'
    confidence_score: number
    reasoning: string
    expected_change: {
      direction: 'UP' | 'DOWN' | 'STABLE'
      percentage: number
      timeframe_days: number
    }
  }
  historical_analysis: {
    avg_price_30d: number
    lowest_price_30d: number
    highest_price_30d: number
    price_trend: 'RISING' | 'FALLING' | 'STABLE'
    volatility_score: number
  }
  optimal_booking_window: {
    start_date: string
    end_date: string
    reason: string
  }
  seasonal_insights: {
    is_peak_season: boolean
    seasonal_factor: number
    comparable_periods: string[]
  }
  savings_opportunities: {
    flexible_dates: {
      potential_savings: number
      alternative_dates: string[]
    }
    nearby_airports: {
      potential_savings: number
      alternative_airports: string[]
    }
  }
  next_check_recommendation: string
  price_alerts: {
    target_price: number
    drop_threshold_percentage: number
  }
}

interface PricePredictorProps {
  origin: string
  destination: string
  departure_date: string
  return_date?: string
  adults: number
  children?: number
  travel_class?: string
  currentPrice?: number
  onSetPriceAlert?: (targetPrice: number) => void
  className?: string
}

export default function PricePredictor({
  origin,
  destination,
  departure_date,
  return_date,
  adults,
  children = 0,
  travel_class = 'ECONOMY',
  currentPrice,
  onSetPriceAlert,
  className = ""
}: PricePredictorProps) {
  const [predictionData, setPredictionData] = useState<PricePredictionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [showHistoricalAnalysis, setShowHistoricalAnalysis] = useState(false)

  useEffect(() => {
    if (origin && destination && departure_date) {
      fetchPrediction()
    }
  }, [origin, destination, departure_date, return_date, adults, children, travel_class])

  const fetchPrediction = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/flights/price-predictor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
          departure_date,
          return_date,
          adults,
          children,
          travel_class,
          currency: 'MYR'
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setPredictionData(result.data)
      } else {
        setError(result.error || 'Failed to get price prediction')
      }
    } catch (err) {
      console.error('Price prediction error:', err)
      setError('Unable to fetch price prediction')
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY_NOW':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'WAIT':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'MONITOR':
        return <AlertCircle className="w-5 h-5 text-blue-400" />
      default:
        return <Brain className="w-5 h-5 text-gray-400" />
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY_NOW':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
      case 'WAIT':
        return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
      case 'MONITOR':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
      default:
        return 'from-gray-500/20 to-gray-400/20 border-gray-500/30'
    }
  }

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY_NOW':
        return 'Buy Now'
      case 'WAIT':
        return 'Wait & Monitor'
      case 'MONITOR':
        return 'Keep Watching'
      default:
        return 'Analyzing...'
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'UP':
        return <TrendingUp className="w-4 h-4 text-red-400" />
      case 'DOWN':
        return <TrendingDown className="w-4 h-4 text-green-400" />
      default:
        return <BarChart3 className="w-4 h-4 text-gray-400" />
    }
  }

  const formatPrice = (price: number, currency: string = 'MYR') => {
    return `${currency} ${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          <div>
            <p className="text-white font-medium">AI Price Analysis</p>
            <p className="text-gray-400 text-sm">Analyzing market trends...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !predictionData) {
    return (
      <div className={`bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <div>
            <p className="text-white font-medium">Price Analysis Unavailable</p>
            <p className="text-gray-400 text-sm">{error || 'Unable to analyze prices at this time'}</p>
          </div>
        </div>
      </div>
    )
  }

  const { prediction, historical_analysis, savings_opportunities } = predictionData

  return (
    <div className={`bg-gradient-to-r ${getRecommendationColor(prediction.recommendation)} backdrop-blur-md border rounded-2xl overflow-hidden ${className}`}>
      {/* Main Recommendation */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5">
              {getRecommendationIcon(prediction.recommendation)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-white">
                  {getRecommendationText(prediction.recommendation)}
                </h3>
                <div className="px-2 py-1 bg-white/10 rounded-lg">
                  <span className="text-xs font-medium text-white">
                    {prediction.confidence_score}% confident
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-200 leading-relaxed mb-3">
                {prediction.reasoning}
              </p>

              {/* Expected Change */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(prediction.expected_change.direction)}
                  <span className="text-sm text-gray-300">
                    {prediction.expected_change.direction === 'UP' ? '+' : prediction.expected_change.direction === 'DOWN' ? '-' : '±'}
                    {prediction.expected_change.percentage}% in {prediction.expected_change.timeframe_days} days
                  </span>
                </div>
                
                <button 
                  onClick={() => onSetPriceAlert?.(predictionData.price_alerts.target_price)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Set Alert</span>
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            <span className="text-sm font-medium text-white">Details</span>
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Price Analysis */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Price Analysis (30 days)</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Current</p>
                    <p className="text-sm font-semibold text-white">
                      {formatPrice(predictionData.current_price.amount, predictionData.current_price.currency)}
                    </p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Average</p>
                    <p className="text-sm font-semibold text-white">
                      {formatPrice(historical_analysis.avg_price_30d, predictionData.current_price.currency)}
                    </p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Lowest</p>
                    <p className="text-sm font-semibold text-green-400">
                      {formatPrice(historical_analysis.lowest_price_30d, predictionData.current_price.currency)}
                    </p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Highest</p>
                    <p className="text-sm font-semibold text-red-400">
                      {formatPrice(historical_analysis.highest_price_30d, predictionData.current_price.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Savings Opportunities */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Potential Savings</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <p className="text-sm text-white">Flexible dates</p>
                      <p className="text-xs text-gray-400">±3 days from your selected date</p>
                    </div>
                    <span className="text-sm font-semibold text-green-400">
                      Save up to {formatPrice(savings_opportunities.flexible_dates.potential_savings)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <p className="text-sm text-white">Nearby airports</p>
                      <p className="text-xs text-gray-400">Consider alternative departure/arrival airports</p>
                    </div>
                    <span className="text-sm font-semibold text-green-400">
                      Save up to {formatPrice(savings_opportunities.nearby_airports.potential_savings)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="flex items-start space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Next Step</p>
                  <p className="text-xs text-gray-300">{predictionData.next_check_recommendation}</p>
                </div>
              </div>

              {/* Historical Analysis Button */}
              <div className="pt-2 border-t border-white/10">
                <button 
                  onClick={() => setShowHistoricalAnalysis(!showHistoricalAnalysis)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-lg transition-all group"
                >
                  <HistoryIcon className="w-4 h-4 text-purple-300 group-hover:text-purple-200" />
                  <span className="text-sm font-medium text-white">
                    {showHistoricalAnalysis ? 'Hide' : 'View'} Historical Analysis
                  </span>
                  <motion.div
                    animate={{ rotate: showHistoricalAnalysis ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4 text-purple-300" />
                  </motion.div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historical Price Analysis */}
      <AnimatePresence>
        {showHistoricalAnalysis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-white/10"
          >
            <div className="p-4">
              <HistoricalPriceAnalysis 
                origin={origin}
                destination={destination}
                routeType={origin === destination ? 'domestic' : 'international'}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}