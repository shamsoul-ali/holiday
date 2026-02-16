'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Zap, 
  Plane, 
  CloudRain, 
  ThermometerSun, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  Wifi,
  WifiOff,
  RefreshCw,
  Calendar,
  Users,
  Car,
  Train,
  Navigation,
  Star,
  X,
  Settings,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react'

interface TravelAlert {
  id: string
  type: 'flight' | 'weather' | 'traffic' | 'event' | 'price' | 'safety' | 'activity'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: Date
  actionable: boolean
  action?: {
    label: string
    url?: string
    handler?: () => void
  }
  location?: string
  duration?: number
  read: boolean
}

interface LiveData {
  flights: {
    status: 'on-time' | 'delayed' | 'cancelled' | 'boarding'
    delay?: number
    gate?: string
    terminal?: string
  }
  weather: {
    current: number
    condition: string
    forecast: string
    alerts: string[]
  }
  traffic: {
    status: 'light' | 'moderate' | 'heavy'
    duration: number
    alternativeRoute?: string
  }
  events: {
    local: Array<{name: string, impact: string}>
    festivals: Array<{name: string, dates: string}>
  }
  prices: {
    trend: 'up' | 'down' | 'stable'
    change: number
    alert: boolean
  }
}

const alertIcons = {
  flight: Plane,
  weather: ThermometerSun,
  traffic: Car,
  event: Calendar,
  price: TrendingDown,
  safety: AlertTriangle,
  activity: Star
}

const priorityColors = {
  low: 'bg-blue-50 border-blue-200 text-blue-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  high: 'bg-orange-50 border-orange-200 text-orange-800',
  critical: 'bg-red-50 border-red-200 text-red-800'
}

export default function RealTimeTravelIntelligence() {
  const [isOpen, setIsOpen] = useState(false)
  const [alerts, setAlerts] = useState<TravelAlert[]>([])
  const [liveData, setLiveData] = useState<LiveData | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Simulate real-time data updates
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      generateLiveUpdate()
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Initialize with sample data
  useEffect(() => {
    generateInitialData()
  }, [])

  const generateInitialData = () => {
    const initialAlerts: TravelAlert[] = [
      {
        id: '1',
        type: 'weather',
        priority: 'medium',
        title: 'Weather Alert',
        message: 'Light rain expected at your destination this afternoon. Consider bringing an umbrella for outdoor activities.',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        actionable: true,
        action: { label: 'View 7-day forecast' },
        location: 'Jakarta',
        read: false
      },
      {
        id: '2',
        type: 'price',
        priority: 'high',
        title: 'Price Drop Alert',
        message: 'Hotel prices dropped 15% for your dates! Book now to save MYR 280.',
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        actionable: true,
        action: { label: 'Book now', handler: () => alert('Redirecting to booking...') },
        read: false
      },
      {
        id: '3',
        type: 'flight',
        priority: 'low',
        title: 'Flight Update',
        message: 'Your flight MH370 is on schedule. Check-in opens in 18 hours.',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        actionable: true,
        action: { label: 'Set reminder' },
        read: true
      },
      {
        id: '4',
        type: 'event',
        priority: 'medium',
        title: 'Local Event',
        message: 'Jakarta Night Festival starts tomorrow! Special cultural performances and street food.',
        timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
        actionable: true,
        action: { label: 'Get tickets' },
        location: 'Jakarta',
        read: false
      }
    ]

    const initialLiveData: LiveData = {
      flights: {
        status: 'on-time',
        gate: 'G7',
        terminal: 'KLIA Terminal 1'
      },
      weather: {
        current: 28,
        condition: 'Partly Cloudy',
        forecast: 'Light showers expected in the evening',
        alerts: []
      },
      traffic: {
        status: 'moderate',
        duration: 45,
        alternativeRoute: 'Via PLUS Highway (+10 min, toll MYR 15)'
      },
      events: {
        local: [
          { name: 'Jakarta Night Market', impact: 'Heavy foot traffic in Old Town area' },
          { name: 'Cultural Festival', impact: 'Road closures near National Monument' }
        ],
        festivals: [
          { name: 'Jakarta Food Festival', dates: 'Dec 15-20' }
        ]
      },
      prices: {
        trend: 'down',
        change: -12,
        alert: true
      }
    }

    setAlerts(initialAlerts)
    setLiveData(initialLiveData)
  }

  const generateLiveUpdate = () => {
    // Simulate random updates
    const updateTypes = ['weather', 'traffic', 'price', 'event', 'flight']
    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)]
    
    const newAlert: TravelAlert = {
      id: Date.now().toString(),
      type: randomType as any,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      title: getUpdateTitle(randomType),
      message: getUpdateMessage(randomType),
      timestamp: new Date(),
      actionable: Math.random() > 0.5,
      action: Math.random() > 0.5 ? { label: 'Take action' } : undefined,
      read: false
    }

    setAlerts(prev => [newAlert, ...prev.slice(0, 19)]) // Keep latest 20 alerts

    // Play notification sound
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {}) // Ignore if audio fails
    }
  }

  const getUpdateTitle = (type: string): string => {
    const titles = {
      weather: ['Weather Update', 'Climate Alert', 'Weather Change'],
      traffic: ['Traffic Update', 'Route Alert', 'Transportation Notice'],
      price: ['Price Alert', 'Deal Notification', 'Booking Update'],
      event: ['Local Event', 'Activity Alert', 'Festival Notice'],
      flight: ['Flight Update', 'Travel Notice', 'Departure Alert']
    }
    return titles[type as keyof typeof titles][Math.floor(Math.random() * 3)]
  }

  const getUpdateMessage = (type: string): string => {
    const messages = {
      weather: [
        'Temperature rising to 32°C this afternoon. Stay hydrated!',
        'UV index is high today. Don\'t forget sunscreen.',
        'Humidity levels increasing. Plan indoor activities during midday.'
      ],
      traffic: [
        'Heavy traffic on main route. Alternative route saves 15 minutes.',
        'Metro delays due to maintenance. Consider taxi or ride-share.',
        'New express bus service launched - 30% faster to city center.'
      ],
      price: [
        'Restaurant prices 20% off during happy hour (4-6 PM).',
        'Last-minute activity deals available - save up to 40%.',
        'Transportation pass offers 15% discount for advance booking.'
      ],
      event: [
        'Street parade happening nearby - expect road closures.',
        'Pop-up art exhibition in your area - free entry today.',
        'Live music performance at central square starting at 7 PM.'
      ],
      flight: [
        'Gate changed to B12. Allow extra 10 minutes walking time.',
        'Duty-free pre-order available - collect at destination.',
        'Flight upgraded to premium economy at no extra charge!'
      ]
    }
    return messages[type as keyof typeof messages][Math.floor(Math.random() * 3)]
  }

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ))
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const unreadCount = alerts.filter(alert => !alert.read).length

  const filteredAlerts = selectedFilters.length > 0 
    ? alerts.filter(alert => selectedFilters.includes(alert.type))
    : alerts

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return timestamp.toLocaleDateString()
  }

  return (
    <>
      {/* Notification Bell */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 border border-gray-200 dark:border-gray-700"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-xs text-white font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </motion.div>
          )}
          {isConnected && (
            <motion.div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      </motion.button>

      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzuR" type="audio/wav" />
      </audio>

      {/* Intelligence Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Travel Intelligence</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      {isConnected ? (
                        <>
                          <Wifi className="w-4 h-4 text-green-500" />
                          <span>Live • Updated {formatTimeAgo(lastUpdate)}</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-4 h-4 text-red-500" />
                          <span>Offline Mode</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`p-2 rounded-full transition-colors ${
                      autoRefresh 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Live Status Bar */}
              {liveData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center space-x-2">
                    <Plane className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {liveData.flights.status.replace('-', ' ').toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        Gate {liveData.flights.gate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <ThermometerSun className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {liveData.weather.current}°C
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {liveData.weather.condition}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Car className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {liveData.traffic.duration} min
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {liveData.traffic.status} traffic
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {liveData.prices.change}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        Price trend
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {['flight', 'weather', 'traffic', 'event', 'price', 'safety'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilters(prev => 
                        prev.includes(filter) 
                          ? prev.filter(f => f !== filter)
                          : [...prev, filter]
                      )}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors capitalize ${
                        selectedFilters.includes(filter)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerts Feed */}
              <div className="flex-1 overflow-y-auto">
                {filteredAlerts.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No alerts match your filters</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    {filteredAlerts.map((alert) => {
                      const Icon = alertIcons[alert.type]
                      return (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`border rounded-xl p-4 transition-all cursor-pointer ${
                            alert.read 
                              ? 'bg-gray-50 dark:bg-gray-800/50 opacity-75' 
                              : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md'
                          } ${priorityColors[alert.priority]}`}
                          onClick={() => markAsRead(alert.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              alert.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/20' :
                              alert.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/20' :
                              alert.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                              'bg-blue-100 dark:bg-blue-900/20'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">{alert.title}</h3>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatTimeAgo(alert.timestamp)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      dismissAlert(alert.id)
                                    }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{alert.message}</p>
                              
                              {alert.location && (
                                <div className="flex items-center space-x-1 mb-2">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{alert.location}</span>
                                </div>
                              )}
                              
                              {alert.actionable && alert.action && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    alert.action?.handler?.()
                                  }}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  {alert.action.label}
                                </button>
                              )}
                            </div>
                            
                            {!alert.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}