'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  BellOff, 
  Plus, 
  X, 
  Target, 
  TrendingDown, 
  Calendar, 
  Plane, 
  DollarSign,
  Settings,
  Check,
  AlertCircle,
  Trash2,
  Mail,
  Smartphone,
  MessageSquare,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PriceAlert {
  id: string
  user_id: string
  origin: string
  destination: string
  departure_date: string
  return_date?: string
  adults: number
  children: number
  travel_class: string
  target_price: number
  current_price: number
  currency: string
  alert_type: 'PRICE_DROP' | 'THRESHOLD' | 'PERCENTAGE'
  threshold_percentage?: number
  status: 'ACTIVE' | 'TRIGGERED' | 'EXPIRED' | 'CANCELLED'
  created_at: string
  expires_at: string
  last_checked: string
  notifications_sent: number
  notification_preferences: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

interface CreateAlertForm {
  origin: string
  destination: string
  departure_date: string
  return_date?: string
  adults: number
  children: number
  travel_class: string
  target_price: number
  alert_type: 'PRICE_DROP' | 'THRESHOLD' | 'PERCENTAGE'
  threshold_percentage: number
  notification_preferences: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

interface PriceAlertManagerProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export default function PriceAlertManager({ isOpen, onClose, className = "" }: PriceAlertManagerProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'triggered' | 'expired'>('active')
  
  const [createForm, setCreateForm] = useState<CreateAlertForm>({
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    adults: 2,
    children: 0,
    travel_class: 'ECONOMY',
    target_price: 1000,
    alert_type: 'THRESHOLD',
    threshold_percentage: 10,
    notification_preferences: {
      email: true,
      push: true,
      sms: false
    }
  })

  useEffect(() => {
    if (isOpen) {
      fetchAlerts()
    }
  }, [isOpen])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/price-alerts', {
        headers: {
          'x-user-id': 'current-user' // Mock user ID
        }
      })
      const result = await response.json()
      
      if (result.success) {
        setAlerts(result.data.alerts)
      } else {
        toast.error('Failed to fetch price alerts')
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      toast.error('Unable to load price alerts')
    } finally {
      setLoading(false)
    }
  }

  const createAlert = async () => {
    if (!createForm.origin || !createForm.destination || !createForm.departure_date || createForm.target_price <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'current-user' // Mock user ID
        },
        body: JSON.stringify(createForm)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setAlerts(prev => [...prev, result.data.alert])
        toast.success(result.data.immediate_feedback.message)
        setShowCreateForm(false)
        resetForm()
      } else {
        toast.error(result.error || 'Failed to create price alert')
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      toast.error('Unable to create price alert')
    } finally {
      setLoading(false)
    }
  }

  const cancelAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/price-alerts?id=${alertId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': 'current-user' // Mock user ID
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, status: 'CANCELLED' } : alert
        ))
        toast.success('Price alert cancelled')
      } else {
        toast.error(result.error || 'Failed to cancel alert')
      }
    } catch (error) {
      console.error('Error cancelling alert:', error)
      toast.error('Unable to cancel price alert')
    }
  }

  const resetForm = () => {
    setCreateForm({
      origin: '',
      destination: '',
      departure_date: '',
      return_date: '',
      adults: 2,
      children: 0,
      travel_class: 'ECONOMY',
      target_price: 1000,
      alert_type: 'THRESHOLD',
      threshold_percentage: 10,
      notification_preferences: {
        email: true,
        push: true,
        sms: false
      }
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Bell className="w-4 h-4 text-blue-400" />
      case 'TRIGGERED':
        return <Check className="w-4 h-4 text-green-400" />
      case 'EXPIRED':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'CANCELLED':
        return <BellOff className="w-4 h-4 text-gray-400" />
      default:
        return <Bell className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'TRIGGERED':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'EXPIRED':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'CANCELLED':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const formatPrice = (price: number, currency: string = 'MYR') => {
    return `${currency} ${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredAlerts = alerts.filter(alert => {
    switch (activeTab) {
      case 'active':
        return alert.status === 'ACTIVE'
      case 'triggered':
        return alert.status === 'TRIGGERED'
      case 'expired':
        return ['EXPIRED', 'CANCELLED'].includes(alert.status)
      default:
        return true
    }
  })

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
          className={`bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Price Alerts</h2>
                <p className="text-sm text-gray-400">Monitor flight prices and get notified when they drop</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 p-6 pb-3 border-b border-white/10">
            {[
              { id: 'active', label: 'Active', count: alerts.filter(a => a.status === 'ACTIVE').length },
              { id: 'triggered', label: 'Triggered', count: alerts.filter(a => a.status === 'TRIGGERED').length },
              { id: 'expired', label: 'Expired', count: alerts.filter(a => ['EXPIRED', 'CANCELLED'].includes(a.status)).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Create Alert Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl hover:from-blue-500/20 hover:to-purple-500/20 transition-all flex items-center justify-center space-x-3"
              >
                <Plus className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Create New Price Alert</span>
              </button>
            </div>

            {/* Alert List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading price alerts...</p>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No {activeTab} alerts</h3>
                <p className="text-gray-400 text-sm">
                  {activeTab === 'active' ? 'Create your first price alert to start monitoring flight prices' : 
                   activeTab === 'triggered' ? 'No alerts have been triggered yet' :
                   'No expired or cancelled alerts'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-2xl transition-all hover:bg-white/5 ${getStatusColor(alert.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getStatusIcon(alert.status)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-white">
                              {alert.origin} → {alert.destination}
                            </h4>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(alert.status)}`}>
                              {alert.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300 mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(alert.departure_date)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4" />
                              <span>{formatPrice(alert.target_price, alert.currency)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <TrendingDown className="w-4 h-4" />
                              <span>{formatPrice(alert.current_price, alert.currency)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Plane className="w-4 h-4" />
                              <span>{alert.adults + alert.children} travelers</span>
                            </div>
                          </div>

                          {/* Price Comparison */}
                          <div className="mb-3">
                            {alert.current_price <= alert.target_price ? (
                              <div className="flex items-center space-x-2 text-green-400 text-sm">
                                <Check className="w-4 h-4" />
                                <span>Price is below target! Save {formatPrice(alert.target_price - alert.current_price, alert.currency)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>Price is {formatPrice(alert.current_price - alert.target_price, alert.currency)} above target</span>
                              </div>
                            )}
                          </div>

                          {/* Notification Preferences */}
                          <div className="flex items-center space-x-3">
                            {alert.notification_preferences.email && (
                              <div className="flex items-center space-x-1 text-xs text-gray-400">
                                <Mail className="w-3 h-3" />
                                <span>Email</span>
                              </div>
                            )}
                            {alert.notification_preferences.push && (
                              <div className="flex items-center space-x-1 text-xs text-gray-400">
                                <Smartphone className="w-3 h-3" />
                                <span>Push</span>
                              </div>
                            )}
                            {alert.notification_preferences.sms && (
                              <div className="flex items-center space-x-1 text-xs text-gray-400">
                                <MessageSquare className="w-3 h-3" />
                                <span>SMS</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {alert.status === 'ACTIVE' && (
                          <button
                            onClick={() => cancelAlert(alert.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                            title="Cancel alert"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Create Alert Modal */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl w-full max-w-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Create Price Alert</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Create Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Origin</label>
                    <input
                      type="text"
                      value={createForm.origin}
                      onChange={(e) => setCreateForm({...createForm, origin: e.target.value})}
                      placeholder="e.g., KUL"
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Destination</label>
                    <input
                      type="text"
                      value={createForm.destination}
                      onChange={(e) => setCreateForm({...createForm, destination: e.target.value})}
                      placeholder="e.g., BKK"
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Departure Date</label>
                    <input
                      type="date"
                      value={createForm.departure_date}
                      onChange={(e) => setCreateForm({...createForm, departure_date: e.target.value})}
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Price (MYR)</label>
                    <input
                      type="number"
                      value={createForm.target_price}
                      onChange={(e) => setCreateForm({...createForm, target_price: parseInt(e.target.value) || 0})}
                      placeholder="1000"
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                {/* Notification Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notifications</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: 'email', icon: Mail, label: 'Email' },
                      { key: 'push', icon: Smartphone, label: 'Push' },
                      { key: 'sms', icon: MessageSquare, label: 'SMS' }
                    ].map(({ key, icon: Icon, label }) => (
                      <label key={key} className="flex items-center space-x-3 p-3 bg-black/20 rounded-xl cursor-pointer hover:bg-black/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={createForm.notification_preferences[key as keyof typeof createForm.notification_preferences]}
                          onChange={(e) => setCreateForm({
                            ...createForm, 
                            notification_preferences: {
                              ...createForm.notification_preferences,
                              [key]: e.target.checked
                            }
                          })}
                          className="rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500/50"
                        />
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createAlert}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    <span>Create Alert</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}