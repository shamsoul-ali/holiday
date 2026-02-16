'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Luggage, 
  X, 
  Check, 
  Star,
  Thermometer,
  CloudRain,
  Sun,
  Wind,
  Plus,
  Minus,
  Download,
  Share2,
  AlertCircle,
  Info,
  CheckSquare,
  Square,
  Plane,
  MapPin,
  Calendar,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PackingItem {
  name: string
  category: 'clothing' | 'electronics' | 'toiletries' | 'documents' | 'health' | 'accessories' | 'gear'
  priority: 'essential' | 'recommended' | 'optional'
  quantity: string
  reason: string
  alternatives?: string[]
  brand_recommendations?: string[]
  estimated_cost?: string
  packing_tip?: string
}

interface WeatherInfo {
  average_temp_high: number
  average_temp_low: number
  rainfall_mm: number
  humidity_percent: number
  conditions: string[]
  season: string
  uv_index: number
}

interface PackingData {
  destination_info: {
    country: string
    region: string
    climate_zone: string
    cultural_notes: string[]
    local_customs: string[]
  }
  weather_forecast: WeatherInfo
  packing_list: {
    essentials: PackingItem[]
    clothing: PackingItem[]
    electronics: PackingItem[]
    toiletries: PackingItem[]
    documents: PackingItem[]
    health_safety: PackingItem[]
    activities: PackingItem[]
    optional: PackingItem[]
  }
  packing_tips: {
    general: string[]
    destination_specific: string[]
    climate_specific: string[]
    cultural_considerations: string[]
  }
  baggage_guidelines: {
    carry_on_restrictions: string[]
    checked_baggage_tips: string[]
    airline_specific: string[]
    prohibited_items: string[]
  }
  shopping_locally: {
    recommended_items: string[]
    cost_savings: string[]
    quality_considerations: string[]
  }
  final_checklist: string[]
}

interface SmartPackingAssistantProps {
  isOpen: boolean
  onClose: () => void
  tripDetails?: {
    destination: string
    departure_date: string
    return_date?: string
    travelers: { adults: number; children: number; infants: number }
    trip_type: string
    activities: string[]
    accommodation_type?: string
  }
  className?: string
}

export default function SmartPackingAssistant({ 
  isOpen, 
  onClose, 
  tripDetails,
  className = "" 
}: SmartPackingAssistantProps) {
  const [packingData, setPackingData] = useState<PackingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'tips' | 'weather' | 'checklist'>('list')
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['essentials', 'clothing']))

  useEffect(() => {
    if (isOpen && tripDetails) {
      generatePackingList()
    }
  }, [isOpen, tripDetails])

  const generatePackingList = async () => {
    if (!tripDetails) return

    setLoading(true)
    try {
      const response = await fetch('/api/packing-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: tripDetails.destination,
          departure_date: tripDetails.departure_date,
          return_date: tripDetails.return_date,
          travelers: tripDetails.travelers,
          trip_type: tripDetails.trip_type || 'leisure',
          accommodation_type: tripDetails.accommodation_type || 'hotel',
          activities: tripDetails.activities || [],
          baggage_type: 'both'
        })
      })

      const result = await response.json()

      if (result.success) {
        setPackingData(result.data)
      } else {
        toast.error('Failed to generate packing list')
      }
    } catch (error) {
      console.error('Packing assistant error:', error)
      toast.error('Unable to generate packing recommendations')
    } finally {
      setLoading(false)
    }
  }

  const toggleItemChecked = (itemName: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(itemName)) {
      newChecked.delete(itemName)
    } else {
      newChecked.add(itemName)
    }
    setCheckedItems(newChecked)
  }

  const toggleCategoryExpanded = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential':
        return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'recommended':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'optional':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'essentials': return '🎯'
      case 'clothing': return '👕'
      case 'electronics': return '🔌'
      case 'toiletries': return '🧴'
      case 'documents': return '📄'
      case 'health_safety': return '💊'
      case 'activities': return '🏃'
      case 'optional': return '➕'
      default: return '📦'
    }
  }

  const renderPackingItem = (item: PackingItem) => {
    const isChecked = checkedItems.has(item.name)
    
    return (
      <motion.div
        key={item.name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border transition-all ${
          isChecked ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-800/30 border-white/10'
        }`}
      >
        <div className="flex items-start space-x-3">
          <button
            onClick={() => toggleItemChecked(item.name)}
            className={`mt-1 flex-shrink-0 transition-colors ${
              isChecked ? 'text-green-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isChecked ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-medium ${isChecked ? 'line-through text-gray-400' : 'text-white'}`}>
                {item.name}
              </h4>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                  {item.priority}
                </span>
                <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                  {item.quantity}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-2">{item.reason}</p>
            
            {item.packing_tip && (
              <div className="flex items-start space-x-2 mb-2 p-2 bg-blue-500/10 rounded-lg">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300">{item.packing_tip}</p>
              </div>
            )}
            
            {item.alternatives && item.alternatives.length > 0 && (
              <div className="text-xs text-gray-400 mb-1">
                <span className="font-medium">Alternatives:</span> {item.alternatives.join(', ')}
              </div>
            )}
            
            {item.brand_recommendations && item.brand_recommendations.length > 0 && (
              <div className="text-xs text-gray-400 mb-1">
                <span className="font-medium">Recommended brands:</span> {item.brand_recommendations.join(', ')}
              </div>
            )}
            
            {item.estimated_cost && (
              <div className="text-xs text-green-400">
                <span className="font-medium">Est. cost:</span> {item.estimated_cost}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderPackingCategory = (categoryName: string, items: PackingItem[]) => {
    const isExpanded = expandedCategories.has(categoryName)
    const checkedCount = items.filter(item => checkedItems.has(item.name)).length
    
    return (
      <div key={categoryName} className="mb-6">
        <button
          onClick={() => toggleCategoryExpanded(categoryName)}
          className="w-full flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-colors mb-4"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCategoryIcon(categoryName)}</span>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white capitalize">
                {categoryName.replace('_', ' ')}
              </h3>
              <p className="text-sm text-gray-400">
                {checkedCount}/{items.length} items packed
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-5 h-5 text-gray-400" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {items.map(renderPackingItem)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Luggage className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Smart Packing Assistant</h2>
                {tripDetails && (
                  <div className="flex items-center space-x-4 text-sm text-gray-300 mt-1">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{tripDetails.destination}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(tripDetails.departure_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{tripDetails.travelers.adults + tripDetails.travelers.children} travelers</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  // Share packing list functionality
                  toast.success('Packing list copied to clipboard')
                }}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                title="Share packing list"
              >
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-300">Generating your personalized packing list...</p>
            </div>
          ) : packingData ? (
            <>
              {/* Tabs */}
              <div className="flex items-center space-x-1 p-6 pb-3 border-b border-white/10">
                {[
                  { id: 'list', label: 'Packing List', icon: CheckSquare },
                  { id: 'weather', label: 'Weather Info', icon: Thermometer },
                  { id: 'tips', label: 'Tips & Guidelines', icon: Star },
                  { id: 'checklist', label: 'Final Checklist', icon: Check }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {activeTab === 'list' && (
                  <div>
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">Packing Progress</h3>
                        <span className="text-sm text-gray-300">
                          {checkedItems.size}/{Object.values(packingData.packing_list).flat().length} items packed
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${(checkedItems.size / Object.values(packingData.packing_list).flat().length) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    {Object.entries(packingData.packing_list).map(([category, items]) =>
                      items.length > 0 ? renderPackingCategory(category, items) : null
                    )}
                  </div>
                )}

                {activeTab === 'weather' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                        <div className="flex items-center space-x-3">
                          <Sun className="w-6 h-6 text-orange-400" />
                          <div>
                            <p className="text-sm text-gray-300">High Temperature</p>
                            <p className="text-xl font-bold text-white">{packingData.weather_forecast.average_temp_high}°C</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                        <div className="flex items-center space-x-3">
                          <Thermometer className="w-6 h-6 text-blue-400" />
                          <div>
                            <p className="text-sm text-gray-300">Low Temperature</p>
                            <p className="text-xl font-bold text-white">{packingData.weather_forecast.average_temp_low}°C</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                        <div className="flex items-center space-x-3">
                          <CloudRain className="w-6 h-6 text-purple-400" />
                          <div>
                            <p className="text-sm text-gray-300">Rainfall</p>
                            <p className="text-xl font-bold text-white">{packingData.weather_forecast.rainfall_mm}mm</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl border border-green-500/30">
                        <div className="flex items-center space-x-3">
                          <Wind className="w-6 h-6 text-green-400" />
                          <div>
                            <p className="text-sm text-gray-300">Humidity</p>
                            <p className="text-xl font-bold text-white">{packingData.weather_forecast.humidity_percent}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="text-lg font-semibold text-white mb-3">Weather Conditions</h4>
                      <div className="flex flex-wrap gap-2">
                        {packingData.weather_forecast.conditions.map((condition, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-300 mt-3">
                        UV Index: <span className="font-semibold text-orange-400">{packingData.weather_forecast.uv_index}</span> 
                        {packingData.weather_forecast.uv_index > 8 && <span className="text-red-400"> (Very High - Strong sun protection required)</span>}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'tips' && (
                  <div className="space-y-6">
                    {[
                      { title: 'General Packing Tips', items: packingData.packing_tips.general, icon: '💡' },
                      { title: 'Destination-Specific Tips', items: packingData.packing_tips.destination_specific, icon: '🌍' },
                      { title: 'Climate Considerations', items: packingData.packing_tips.climate_specific, icon: '🌤️' },
                      { title: 'Cultural Considerations', items: packingData.packing_tips.cultural_considerations, icon: '🕌' }
                    ].map((section, index) => (
                      <div key={index} className="p-4 bg-gray-800/30 rounded-xl">
                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                          <span className="text-xl">{section.icon}</span>
                          <span>{section.title}</span>
                        </h4>
                        <ul className="space-y-2">
                          {section.items.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start space-x-2 text-gray-300 text-sm">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'checklist' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-400" />
                        <span>Final Pre-Travel Checklist</span>
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Complete these items before departing to ensure a smooth travel experience.
                      </p>
                    </div>
                    
                    {packingData.final_checklist.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-800/30 rounded-xl flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold text-purple-400">{index + 1}</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Unable to Generate Packing List</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                We need your trip details to create a personalized packing list. Please provide destination and travel dates.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}