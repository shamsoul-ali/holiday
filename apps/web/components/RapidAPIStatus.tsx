'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Hotel, 
  Plane, 
  Camera, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  Globe
} from 'lucide-react'

interface APIStatus {
  name: string
  endpoint: string
  status: 'active' | 'inactive' | 'checking'
  lastChecked?: Date
  responseTime?: number
  icon: JSX.Element
}

export default function RapidAPIStatus() {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    {
      name: 'Booking.com Hotels',
      endpoint: '/api/hotels/rapidapi',
      status: 'checking',
      icon: <Hotel className="w-5 h-5" />
    },
    {
      name: 'Skyscanner Flights',
      endpoint: '/api/flights/rapidapi',
      status: 'checking',
      icon: <Plane className="w-5 h-5" />
    },
    {
      name: 'TripAdvisor Activities',
      endpoint: '/api/activities/rapidapi',
      status: 'checking',
      icon: <Camera className="w-5 h-5" />
    }
  ])

  const checkAPIStatus = async (api: APIStatus) => {
    try {
      const testParams = api.name.includes('Hotels') 
        ? '?destination=Bangkok&checkin=2025-09-15&checkout=2025-09-16&adults=2'
        : api.name.includes('Flights')
        ? '?origin=KUL&destination=BKK&departure_date=2025-09-15&adults=1'
        : '?destination=Bangkok&limit=5'

      const startTime = Date.now()
      const response = await fetch(`${api.endpoint}${testParams}`, {
        method: 'GET',
        timeout: 10000
      })
      const responseTime = Date.now() - startTime

      return {
        status: response.ok ? 'active' as const : 'inactive' as const,
        responseTime,
        lastChecked: new Date()
      }
    } catch (error) {
      return {
        status: 'inactive' as const,
        responseTime: undefined,
        lastChecked: new Date()
      }
    }
  }

  useEffect(() => {
    const checkAllAPIs = async () => {
      const updatedStatuses = await Promise.all(
        apiStatuses.map(async (api) => {
          const result = await checkAPIStatus(api)
          return {
            ...api,
            ...result
          }
        })
      )
      setApiStatuses(updatedStatuses)
    }

    checkAllAPIs()

    // Check APIs every 30 seconds
    const interval = setInterval(checkAllAPIs, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'inactive': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'checking': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'inactive': return <XCircle className="w-4 h-4" />
      case 'checking': return <Clock className="w-4 h-4 animate-spin" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const activeCount = apiStatuses.filter(api => api.status === 'active').length
  const totalCount = apiStatuses.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">RapidAPI Integration</h3>
            <p className="text-sm text-gray-400">Enhanced travel data sources</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-lg border ${
            activeCount === totalCount ? 'text-green-400 bg-green-500/20 border-green-500/30' :
            activeCount > 0 ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' :
            'text-red-400 bg-red-500/20 border-red-500/30'
          }`}>
            <span className="text-sm font-medium">
              {activeCount}/{totalCount} Active
            </span>
          </div>
        </div>
      </div>

      {/* API Status Cards */}
      <div className="space-y-3">
        {apiStatuses.map((api, index) => (
          <motion.div
            key={api.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(api.status)}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`${getStatusColor(api.status)} p-2 rounded-lg`}>
                {api.icon}
              </div>
              <div>
                <h4 className="font-medium text-white">{api.name}</h4>
                <p className="text-xs text-gray-400">{api.endpoint}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {api.responseTime && (
                <span className="text-xs text-gray-400">
                  {api.responseTime}ms
                </span>
              )}
              
              {api.lastChecked && (
                <span className="text-xs text-gray-400">
                  {api.lastChecked.toLocaleTimeString()}
                </span>
              )}
              
              <div className={`${getStatusColor(api.status)} p-1 rounded`}>
                {getStatusIcon(api.status)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="text-sm font-semibold text-white mb-3">Enhanced Features</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Real-time data</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Global coverage</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Fast responses</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Reliable fallback</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}