'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import RapidAPIStatus from '../../components/RapidAPIStatus'

export default function TestRapidAPIPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testRapidAPIEndpoints = async () => {
    setLoading(true)
    setTestResults([])

    const tests = [
      {
        name: 'Hotels API',
        endpoint: '/api/hotels/rapidapi',
        params: '?destination=Bangkok&checkin=2025-09-15&checkout=2025-09-16&adults=2&currency=USD'
      },
      {
        name: 'Flights API', 
        endpoint: '/api/flights/rapidapi',
        params: '?origin=KUL&destination=BKK&departure_date=2025-09-15&adults=1&currency=USD'
      },
      {
        name: 'Activities API',
        endpoint: '/api/activities/rapidapi', 
        params: '?destination=Bangkok&limit=5'
      }
    ]

    for (const test of tests) {
      try {
        const startTime = Date.now()
        const response = await fetch(`${test.endpoint}${test.params}`)
        const responseTime = Date.now() - startTime
        const data = await response.json()
        
        setTestResults(prev => [...prev, {
          name: test.name,
          status: response.ok ? 'success' : 'error',
          responseTime,
          data: data,
          error: response.ok ? null : `${response.status} ${response.statusText}`
        }])
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          status: 'error',
          responseTime: 0,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        }])
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            RapidAPI <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">Integration Test</span>
          </h1>
          <p className="text-gray-400 text-lg">Test and monitor your RapidAPI travel services integration</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Status Monitor */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Live API Status</h2>
            <RapidAPIStatus />
          </div>

          {/* Manual Testing */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Manual Testing</h2>
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <button
                onClick={testRapidAPIEndpoints}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100"
              >
                {loading ? 'Testing APIs...' : 'Test All RapidAPI Endpoints'}
              </button>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Test Results</h3>
                  {testResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        result.status === 'success' 
                          ? 'bg-green-500/20 border-green-500/30 text-green-300'
                          : 'bg-red-500/20 border-red-500/30 text-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{result.name}</span>
                        <span className="text-sm">{result.responseTime}ms</span>
                      </div>
                      
                      {result.status === 'success' ? (
                        <div>
                          <p className="text-sm text-green-200 mb-2">✓ API call successful</p>
                          {result.data && (
                            <div className="text-xs">
                              <p>Data received: {JSON.stringify(result.data).slice(0, 100)}...</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-red-200">✗ {result.error}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integration Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">RapidAPI Integration Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">🏨 Hotels (Booking.com)</h4>
              <p className="text-sm text-gray-300">Real-time hotel search with pricing, amenities, and availability</p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                <li>• Global hotel database</li>
                <li>• Real-time pricing</li>
                <li>• Availability checking</li>
                <li>• Multiple currencies</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-400 mb-2">✈️ Flights (Skyscanner)</h4>
              <p className="text-sm text-gray-300">Comprehensive flight search with multiple airlines and routes</p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                <li>• Multi-airline search</li>
                <li>• Route optimization</li>
                <li>• Price comparison</li>
                <li>• Class selection</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">🎯 Activities (TripAdvisor)</h4>
              <p className="text-sm text-gray-300">Local attractions, tours, and experiences with reviews</p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                <li>• Attraction database</li>
                <li>• User reviews & ratings</li>
                <li>• Tour bookings</li>
                <li>• Local experiences</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>Integration Status:</strong> RapidAPI is integrated as a fallback system. When primary APIs (Amadeus, Google) fail, 
              the system automatically falls back to RapidAPI to ensure continuous service availability.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}