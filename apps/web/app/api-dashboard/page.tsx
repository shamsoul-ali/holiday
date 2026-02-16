'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface APIKeyStatus {
  is_configured: boolean
  is_valid: boolean
  is_required: boolean
  status: string
}

interface HealthData {
  status: string
  message: string
  health_score: number
  service: string
  version: string
  api_keys: Record<string, APIKeyStatus>
  missing_required: string[]
  timestamp: string
}

export default function APIDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/system/health')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setHealthData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setHealthData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
    const interval = setInterval(fetchHealthData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (apiStatus: APIKeyStatus) => {
    if (apiStatus.is_valid && apiStatus.is_configured) {
      return 'text-green-600 bg-green-100'
    } else if (apiStatus.is_configured && !apiStatus.is_valid) {
      return 'text-yellow-600 bg-yellow-100'
    } else {
      return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (apiStatus: APIKeyStatus) => {
    if (apiStatus.is_valid && apiStatus.is_configured) {
      return '✅ Valid'
    } else if (apiStatus.is_configured && !apiStatus.is_valid) {
      return '⚠️ Invalid'
    } else {
      return '❌ Not Configured'
    }
  }

  const getOverallStatusColor = (score: number) => {
    if (score >= 80) {
      return 'text-green-600 border-green-200 bg-green-50'
    } else if (score >= 40) {
      return 'text-yellow-600 border-yellow-200 bg-yellow-50'
    } else {
      return 'text-red-600 border-red-200 bg-red-50'
    }
  }

  if (loading && !healthData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading API Status...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchHealthData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">API Services Dashboard</h1>
          <p className="text-gray-600">Monitor all enabled travel API providers and their health status</p>
        </motion.div>

        {healthData && (
          <>
            {/* Overall Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`border-2 rounded-xl p-6 mb-8 ${getOverallStatusColor(healthData.health_score)}`}
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{healthData.message}</h2>
                <div className="flex justify-center items-center gap-8 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {Object.values(healthData.api_keys).filter(api => api.is_valid && api.is_configured).length}
                    </div>
                    <div className="text-sm">Configured APIs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{Math.round(healthData.health_score)}%</div>
                    <div className="text-sm">Health Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{Object.keys(healthData.api_keys).length}</div>
                    <div className="text-sm">Total APIs</div>
                  </div>
                </div>
                <p className="text-sm opacity-75">
                  Last updated: {new Date(healthData.timestamp).toLocaleString()}
                </p>
              </div>
            </motion.div>

            {/* API Status Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Object.entries(healthData.api_keys).map(([name, apiStatus], index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 capitalize">
                      {name.replace(/_/g, ' ')}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apiStatus)}`}>
                      {getStatusText(apiStatus)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between items-center">
                      <span>Required:</span>
                      <span className={`font-semibold ${apiStatus.is_required ? 'text-red-600' : 'text-gray-500'}`}>
                        {apiStatus.is_required ? 'Yes' : 'Optional'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Configured:</span>
                      <span className={apiStatus.is_configured ? 'text-green-600' : 'text-gray-400'}>
                        {apiStatus.is_configured ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {apiStatus.is_configured && (
                      <div className="flex justify-between items-center">
                        <span>Valid:</span>
                        <span className={apiStatus.is_valid ? 'text-green-600' : 'text-yellow-600'}>
                          {apiStatus.is_valid ? 'Yes' : 'Invalid'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Missing Required APIs */}
            {healthData.missing_required.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-6 mb-8"
              >
                <h3 className="text-xl font-bold text-yellow-800 mb-4">⚠️ Missing Required APIs</h3>
                <p className="text-gray-700 mb-4">
                  The following required API providers are not configured. Some features may be unavailable:
                </p>
                <div className="flex flex-wrap gap-2">
                  {healthData.missing_required.map((apiName) => (
                    <span
                      key={apiName}
                      className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium border border-yellow-300"
                    >
                      {apiName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Refresh Button */}
            <div className="text-center mt-8">
              <button
                onClick={fetchHealthData}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}