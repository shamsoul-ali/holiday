'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, Minus, Calendar, AlertTriangle, 
  Target, Clock, BarChart3, PieChart, Info, CheckCircle2 
} from 'lucide-react'

interface HistoricalPricePoint {
  date: string
  price: number
  demand_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK'
  season: 'LOW' | 'SHOULDER' | 'HIGH' | 'PEAK'
  day_of_week: string
  advance_booking_days: number
}

interface SeasonalPattern {
  season: string
  avg_price: number
  price_volatility: number
  booking_window_effect: number
  demand_trend: 'INCREASING' | 'STABLE' | 'DECREASING'
}

interface TrendAnalysis {
  route: string
  historical_data: HistoricalPricePoint[]
  seasonal_patterns: SeasonalPattern[]
  price_trends: {
    short_term: 'UP' | 'DOWN' | 'STABLE'
    long_term: 'UP' | 'DOWN' | 'STABLE'
    volatility_level: 'LOW' | 'MEDIUM' | 'HIGH'
  }
  optimal_booking_windows: {
    domestic: { min_days: number; max_days: number; avg_savings: number }
    international: { min_days: number; max_days: number; avg_savings: number }
  }
  market_insights: {
    peak_demand_periods: string[]
    lowest_price_months: string[]
    highest_savings_opportunities: string[]
    risk_factors: string[]
  }
}

interface HistoricalAnalysisProps {
  origin: string
  destination: string
  routeType?: 'domestic' | 'international'
  className?: string
}

export default function HistoricalPriceAnalysis({ 
  origin, 
  destination, 
  routeType = 'international',
  className = "" 
}: HistoricalAnalysisProps) {
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'trends' | 'seasonal' | 'insights'>('trends')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (origin && destination) {
      fetchHistoricalAnalysis()
    }
  }, [origin, destination, routeType])

  const fetchHistoricalAnalysis = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/flights/historical-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          route_type: routeType
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAnalysis(data.analysis)
      } else {
        setError('Failed to load historical analysis')
      }
    } catch (err) {
      setError('Error fetching analysis data')
      console.error('Historical analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'DOWN': return <TrendingDown className="w-4 h-4 text-green-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UP': return 'text-red-500 bg-red-50 border-red-200'
      case 'DOWN': return 'text-green-500 bg-green-50 border-green-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getVolatilityColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'PEAK': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchHistoricalAnalysis}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-6 h-6" />
          <h2 className="text-xl font-bold">Historical Price Analysis</h2>
        </div>
        <p className="text-blue-100">{analysis.route}</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'trends', label: 'Price Trends', icon: TrendingUp },
            { id: 'seasonal', label: 'Seasonal Patterns', icon: Calendar },
            { id: 'insights', label: 'Market Insights', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Price Trends Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border-2 ${getTrendColor(analysis.price_trends.short_term)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getTrendIcon(analysis.price_trends.short_term)}
                    <span className="font-medium">Short-term Trend</span>
                  </div>
                  <p className="text-sm opacity-80">Last 30 days</p>
                </div>
                
                <div className={`p-4 rounded-lg border-2 ${getTrendColor(analysis.price_trends.long_term)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getTrendIcon(analysis.price_trends.long_term)}
                    <span className="font-medium">Long-term Trend</span>
                  </div>
                  <p className="text-sm opacity-80">Past 12 months</p>
                </div>
                
                <div className={`p-4 rounded-lg ${getVolatilityColor(analysis.price_trends.volatility_level)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="font-medium">Volatility</span>
                  </div>
                  <p className="text-sm opacity-80">{analysis.price_trends.volatility_level}</p>
                </div>
              </div>

              {/* Price Chart Simulation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Price History (Last 60 Days)
                </h3>
                <div className="h-48 relative bg-white rounded border">
                  <div className="absolute inset-4 flex items-end justify-between">
                    {analysis.historical_data.slice(-20).map((point, index) => {
                      const height = ((point.price - Math.min(...analysis.historical_data.map(d => d.price))) / 
                        (Math.max(...analysis.historical_data.map(d => d.price)) - Math.min(...analysis.historical_data.map(d => d.price)))) * 160
                      
                      return (
                        <div key={index} className="flex flex-col items-center group relative">
                          <div
                            className={`w-3 rounded-t ${getDemandColor(point.demand_level)} transition-all hover:opacity-75`}
                            style={{ height: `${height}px` }}
                          />
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap transition-opacity">
                            ${point.price} - {point.date.split('-')[2]}/{point.date.split('-')[1]}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="absolute bottom-2 left-4 text-xs text-gray-500">
                    Price range: ${Math.min(...analysis.historical_data.map(d => d.price))} - ${Math.max(...analysis.historical_data.map(d => d.price))}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Low Demand</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Medium Demand</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span>High Demand</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Peak Demand</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'seasonal' && (
            <motion.div
              key="seasonal"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Seasonal Patterns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analysis.seasonal_patterns.map((pattern, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{pattern.season} Season</h3>
                      <div className={`p-1 rounded text-xs ${
                        pattern.demand_trend === 'INCREASING' ? 'bg-red-100 text-red-600' :
                        pattern.demand_trend === 'DECREASING' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {pattern.demand_trend}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Price:</span>
                        <span className="font-medium">${pattern.avg_price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volatility:</span>
                        <span className="font-medium">${pattern.price_volatility}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking Effect:</span>
                        <span className="font-medium">{pattern.booking_window_effect}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Optimal Booking Windows */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700">
                  <Clock className="w-5 h-5" />
                  Optimal Booking Windows
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Domestic Flights</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Best booking window:</span>
                        <span className="font-medium">{analysis.optimal_booking_windows.domestic.min_days}-{analysis.optimal_booking_windows.domestic.max_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average savings:</span>
                        <span className="font-medium text-green-600">{analysis.optimal_booking_windows.domestic.avg_savings}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">International Flights</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Best booking window:</span>
                        <span className="font-medium">{analysis.optimal_booking_windows.international.min_days}-{analysis.optimal_booking_windows.international.max_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average savings:</span>
                        <span className="font-medium text-green-600">{analysis.optimal_booking_windows.international.avg_savings}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Market Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Peak Demand Periods */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Peak Demand Periods
                  </h3>
                  <ul className="space-y-2">
                    {analysis.market_insights.peak_demand_periods.map((period, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {period}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best Booking Times */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Lowest Price Months
                  </h3>
                  <ul className="space-y-2">
                    {analysis.market_insights.lowest_price_months.map((month, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {month}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Savings Opportunities */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Highest Savings Opportunities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysis.market_insights.highest_savings_opportunities.map((opportunity, index) => (
                    <div key={index} className="bg-white rounded p-3 border border-blue-100">
                      <p className="text-sm text-blue-600">{opportunity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              {analysis.market_insights.risk_factors.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Risk Factors to Consider
                  </h3>
                  <ul className="space-y-2">
                    {analysis.market_insights.risk_factors.map((risk, index) => (
                      <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}