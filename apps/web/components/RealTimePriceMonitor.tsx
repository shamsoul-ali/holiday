'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, Star, Clock, Shield,
  Utensils, Luggage, Square, ExternalLink, AlertCircle, CheckCircle2,
  Activity, Award, Zap, Target, BarChart3, DollarSign, Globe
} from 'lucide-react'

interface FlightVendor {
  id: string
  name: string
  logo_url: string
  booking_url: string
  api_provider: string
  reliability_score: number
  last_updated: string
}

interface VendorPrice {
  vendor: FlightVendor
  price: number
  currency: string
  availability: 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT'
  booking_class: string
  restrictions: string[]
  baggage_included: boolean
  seat_selection: boolean
  meal_included: boolean
  refundable: boolean
  change_fee: number
  last_updated: string
  price_change: {
    direction: 'UP' | 'DOWN' | 'STABLE'
    percentage: number
    amount: number
    since: string
  }
}

interface PriceMonitoringData {
  route: string
  search_criteria: any
  monitoring_status: 'ACTIVE' | 'PAUSED' | 'ERROR'
  last_scan: string
  vendor_prices: VendorPrice[]
  best_deals: {
    lowest_price: VendorPrice
    best_value: VendorPrice
    most_flexible: VendorPrice
  }
  price_trends: {
    average_price: number
    median_price: number
    price_range: { min: number; max: number }
    volatility_score: number
    trend_direction: 'RISING' | 'FALLING' | 'STABLE'
  }
  alerts_triggered: {
    price_drops: number
    threshold_alerts: number
    availability_changes: number
  }
  next_scan_time: string
  monitoring_duration: number
}

interface RealTimePriceMonitorProps {
  origin: string
  destination: string
  departure_date: string
  return_date?: string
  adults?: number
  children?: number
  travel_class?: string
  className?: string
}

export default function RealTimePriceMonitor({
  origin,
  destination,
  departure_date,
  return_date,
  adults = 1,
  children = 0,
  travel_class = 'ECONOMY',
  className = ""
}: RealTimePriceMonitorProps) {
  const [monitoringData, setMonitoringData] = useState<PriceMonitoringData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [activeTab, setActiveTab] = useState<'comparison' | 'trends' | 'alerts'>('comparison')

  useEffect(() => {
    if (origin && destination && departure_date) {
      fetchMonitoringData()
      
      if (autoRefresh) {
        const interval = setInterval(fetchMonitoringData, 60000) // Refresh every minute
        setRefreshInterval(interval)
        return () => clearInterval(interval)
      }
    }
  }, [origin, destination, departure_date, return_date, adults, children, travel_class, autoRefresh])

  const fetchMonitoringData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/flights/price-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departure_date,
          return_date,
          adults,
          children,
          travel_class
        })
      })

      const result = await response.json()

      if (result.success) {
        setMonitoringData(result.data)
      } else {
        setError('Failed to load price monitoring data')
      }
    } catch (err) {
      setError('Error fetching monitoring data')
      console.error('Price monitoring error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'UP': return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'DOWN': return <TrendingDown className="w-4 h-4 text-green-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'UP': return 'text-red-500'
      case 'DOWN': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE': return 'text-green-600 bg-green-100'
      case 'LIMITED': return 'text-yellow-600 bg-yellow-100'
      case 'SOLD_OUT': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatPrice = (price: number, currency: string = 'MYR') => {
    return `${currency} ${price.toLocaleString()}`
  }

  const formatLastUpdated = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading && !monitoringData) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchMonitoringData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry Monitoring
          </button>
        </div>
      </div>
    )
  }

  if (!monitoringData) return null

  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Real-Time Price Monitor</h2>
              <p className="text-indigo-100">{monitoringData.route}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              monitoringData.monitoring_status === 'ACTIVE' ? 'bg-green-500/20 text-green-200' :
              monitoringData.monitoring_status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-200' :
              'bg-red-500/20 text-red-200'
            }`}>
              {monitoringData.monitoring_status}
            </div>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-indigo-200">Monitoring</p>
            <p className="text-lg font-bold">{monitoringData.vendor_prices.length} Vendors</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-indigo-200">Best Price</p>
            <p className="text-lg font-bold">{formatPrice(monitoringData.best_deals.lowest_price.price)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-indigo-200">Price Range</p>
            <p className="text-lg font-bold">
              {formatPrice(monitoringData.price_trends.price_range.min)} - {formatPrice(monitoringData.price_trends.price_range.max)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-indigo-200">Last Scan</p>
            <p className="text-lg font-bold">{formatLastUpdated(monitoringData.last_scan)}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'comparison', label: 'Vendor Comparison', icon: Globe },
            { id: 'trends', label: 'Price Trends', icon: BarChart3 },
            { id: 'alerts', label: 'Alert Activity', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-600'
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
          {activeTab === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Best Deals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">Lowest Price</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(monitoringData.best_deals.lowest_price.price)}</p>
                  <p className="text-sm text-green-600">{monitoringData.best_deals.lowest_price.vendor.name}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Best Value</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{formatPrice(monitoringData.best_deals.best_value.price)}</p>
                  <p className="text-sm text-blue-600">{monitoringData.best_deals.best_value.vendor.name}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-800">Most Flexible</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{formatPrice(monitoringData.best_deals.most_flexible.price)}</p>
                  <p className="text-sm text-purple-600">{monitoringData.best_deals.most_flexible.vendor.name}</p>
                </div>
              </div>

              {/* Vendor Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 text-sm font-medium text-gray-600">Vendor</th>
                      <th className="pb-3 text-sm font-medium text-gray-600">Price</th>
                      <th className="pb-3 text-sm font-medium text-gray-600">Change</th>
                      <th className="pb-3 text-sm font-medium text-gray-600">Availability</th>
                      <th className="pb-3 text-sm font-medium text-gray-600">Features</th>
                      <th className="pb-3 text-sm font-medium text-gray-600">Rating</th>
                      <th className="pb-3 text-sm font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monitoringData.vendor_prices.map((vendorPrice, index) => (
                      <motion.tr
                        key={vendorPrice.vendor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-xs font-bold">{vendorPrice.vendor.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{vendorPrice.vendor.name}</p>
                              <p className="text-xs text-gray-500">{formatLastUpdated(vendorPrice.last_updated)}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4">
                          <p className="font-bold text-gray-900">{formatPrice(vendorPrice.price, vendorPrice.currency)}</p>
                          <p className="text-xs text-gray-500">{vendorPrice.booking_class}</p>
                        </td>
                        
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            {getTrendIcon(vendorPrice.price_change.direction)}
                            <span className={`text-sm font-medium ${getTrendColor(vendorPrice.price_change.direction)}`}>
                              {vendorPrice.price_change.direction === 'STABLE' ? '—' : 
                               `${vendorPrice.price_change.direction === 'UP' ? '+' : ''}${vendorPrice.price_change.percentage}%`}
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(vendorPrice.availability)}`}>
                            {vendorPrice.availability}
                          </span>
                        </td>
                        
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            {vendorPrice.baggage_included && <Luggage className="w-4 h-4 text-green-500" title="Baggage included" />}
                            {vendorPrice.seat_selection && <Square className="w-4 h-4 text-blue-500" title="Seat selection" />}
                            {vendorPrice.meal_included && <Utensils className="w-4 h-4 text-orange-500" title="Meal included" />}
                            {vendorPrice.refundable && <Shield className="w-4 h-4 text-purple-500" title="Refundable" />}
                          </div>
                        </td>
                        
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{vendorPrice.vendor.reliability_score}</span>
                          </div>
                        </td>
                        
                        <td className="py-4">
                          <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                            <ExternalLink className="w-3 h-3" />
                            Book
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Price Trend Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Average Price</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(monitoringData.price_trends.average_price)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Median Price</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(monitoringData.price_trends.median_price)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Volatility Score</h3>
                  <p className="text-2xl font-bold text-gray-900">{monitoringData.price_trends.volatility_score}</p>
                  <p className="text-xs text-gray-500">
                    {monitoringData.price_trends.volatility_score > 0.3 ? 'High' : 
                     monitoringData.price_trends.volatility_score > 0.15 ? 'Medium' : 'Low'} volatility
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Overall Trend</h3>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(monitoringData.price_trends.trend_direction)}
                    <p className={`text-xl font-bold ${getTrendColor(monitoringData.price_trends.trend_direction)}`}>
                      {monitoringData.price_trends.trend_direction}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Distribution Chart Simulation */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Price Distribution Across Vendors</h3>
                <div className="space-y-3">
                  {monitoringData.vendor_prices.map((vendorPrice, index) => {
                    const percentage = ((vendorPrice.price - monitoringData.price_trends.price_range.min) / 
                      (monitoringData.price_trends.price_range.max - monitoringData.price_trends.price_range.min)) * 100
                    
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-gray-600 truncate">
                          {vendorPrice.vendor.name}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                          />
                        </div>
                        <div className="w-20 text-sm font-bold text-right">
                          {formatPrice(vendorPrice.price)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Alert Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">Price Drops</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{monitoringData.alerts_triggered.price_drops}</p>
                  <p className="text-sm text-green-600">alerts triggered today</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Threshold Alerts</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{monitoringData.alerts_triggered.threshold_alerts}</p>
                  <p className="text-sm text-blue-600">price targets hit</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-orange-800">Availability Changes</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{monitoringData.alerts_triggered.availability_changes}</p>
                  <p className="text-sm text-orange-600">status updates</p>
                </div>
              </div>

              {/* Monitoring Status */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Monitoring Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Next scan scheduled:</span>
                    <span className="font-medium">{formatLastUpdated(monitoringData.next_scan_time)} from now</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Monitoring duration:</span>
                    <span className="font-medium">{monitoringData.monitoring_duration} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Auto-refresh status:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="font-medium">{autoRefresh ? 'Active' : 'Paused'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}