'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface APIHealth {
  status: string
  message: string
  health_score: number
  api_keys: Record<string, {
    is_configured: boolean
    is_valid: boolean
    is_required: boolean
    status: string
  }>
  missing_required: string[]
}

interface APIStatusBannerProps {
  compact?: boolean
  showDetails?: boolean
  className?: string
}

export default function APIStatusBanner({
  compact = true,
  showDetails = false,
  className = ''
}: APIStatusBannerProps) {
  const [healthData, setHealthData] = useState<APIHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(showDetails)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/system/health')
        if (response.ok) {
          const data = await response.json()
          setHealthData(data)
        }
      } catch (error) {
        console.error('Failed to fetch API health:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
    // Refresh every 60 seconds
    const interval = setInterval(fetchHealth, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !healthData || dismissed) return null

  const getStatusConfig = () => {
    const score = healthData.health_score

    if (score >= 80) {
      return {
        icon: CheckCircle,
        bgColor: 'bg-green-50 border-green-200',
        iconColor: 'text-green-600',
        textColor: 'text-green-800',
        title: 'All Systems Operational',
        description: 'All core travel APIs are functioning normally'
      }
    } else if (score >= 40) {
      return {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50 border-yellow-200',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-800',
        title: 'Limited Functionality',
        description: `${healthData.missing_required.length} provider${healthData.missing_required.length > 1 ? 's' : ''} unavailable`
      }
    } else {
      return {
        icon: XCircle,
        bgColor: 'bg-red-50 border-red-200',
        iconColor: 'text-red-600',
        textColor: 'text-red-800',
        title: 'Degraded Service',
        description: 'Multiple providers are currently unavailable'
      }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const configuredAPIs = Object.entries(healthData.api_keys || {})
    .filter(([_, api]) => api.is_configured && api.is_valid)
    .map(([name]) => name)

  if (compact) {
    return (
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`border ${config.bgColor} rounded-lg ${className}`}
          >
            <div className="flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-3 flex-1">
                <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium ${config.textColor}`}>
                      {config.title}
                    </span>
                    <span className="text-xs text-gray-600">
                      • {configuredAPIs.length} provider{configuredAPIs.length !== 1 ? 's' : ''} active
                    </span>
                  </div>
                  {healthData.health_score < 80 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {config.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/api-dashboard"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
                >
                  View Details
                </Link>
                <button
                  onClick={() => setDismissed(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Dismiss"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Full banner with expandable details
  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`border ${config.bgColor} rounded-xl ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1">
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
              <div className="flex-1">
                <h3 className={`font-semibold ${config.textColor}`}>
                  {config.title}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {config.description} • {Math.round(healthData.health_score)}% operational
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${config.textColor} hover:bg-black/5`}
              >
                {expanded ? (
                  <>
                    Hide Details <ChevronUp className="w-4 h-4 inline ml-1" />
                  </>
                ) : (
                  <>
                    Show Details <ChevronDown className="w-4 h-4 inline ml-1" />
                  </>
                )}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expandable Details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-black/10">
                  <div className="pt-4 space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Active Providers ({configuredAPIs.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {configuredAPIs.map(name => (
                        <span
                          key={name}
                          className="px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-700 border border-black/10"
                        >
                          {name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>

                    {healthData.missing_required.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Missing Providers ({healthData.missing_required.length}):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {healthData.missing_required.map(name => (
                            <span
                              key={name}
                              className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-500 border border-gray-200"
                            >
                              {name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-black/10">
                      <Link
                        href="/api-dashboard"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View Full API Dashboard →
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
