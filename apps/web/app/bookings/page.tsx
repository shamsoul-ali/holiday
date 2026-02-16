'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  MoreHorizontal,
  Plane,
  Hotel,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../components/providers/AuthProvider'
import { bookingService } from '../../lib/booking-service'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  booking_reference: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_amount: number
  currency: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
  itineraries?: {
    title: string
    destination: string
    duration: string
    dates?: {
      start: string
      end: string
    }
  }
  booking_data: any
}

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user, filter])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const response = await bookingService.getUserBookings({
        status: filter === 'all' ? undefined : filter,
        limit: 50
      })

      if (response.success && response.data) {
        setBookings(response.data)
      } else {
        toast.error(response.error || 'Failed to load bookings')
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/20'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} />
      case 'pending':
        return <Clock size={16} />
      case 'cancelled':
        return <XCircle size={16} />
      case 'completed':
        return <CheckCircle size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-800 border-t-blue-500 mx-auto"></div>
          <p className="mt-6 text-gray-400 text-lg">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4">My Bookings</h1>
            <p className="text-gray-400 text-lg">
              Manage and track all your travel bookings
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filter Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Bookings' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  filter === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
              <Plane className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No bookings found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't made any bookings yet. Start planning your next adventure!
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold hover:scale-105 transition-all duration-300"
            >
              <span>Plan New Trip</span>
              <Plane className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <AnimatePresence>
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-2xl font-bold">
                          {booking.itineraries?.title || 'Trip Booking'}
                        </h3>
                        <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{booking.itineraries?.destination}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{booking.itineraries?.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} />
                          <span>Ref: {booking.booking_reference}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">
                        {booking.currency.toUpperCase()} {booking.total_amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">
                        Booked on {formatDate(booking.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  {booking.itineraries?.dates && (
                    <div className="bg-white/5 rounded-2xl p-6 mb-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            Travel Dates
                          </h4>
                          <div className="text-gray-300">
                            {formatDate(booking.itineraries.dates.start)} - {formatDate(booking.itineraries.dates.end)}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Plane className="w-5 h-5 text-green-400" />
                            Flight Status
                          </h4>
                          <div className="text-gray-300">
                            {booking.status === 'confirmed' ? 'Tickets Issued' : 'Pending Confirmation'}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-400" />
                            Payment
                          </h4>
                          <div className={`text-sm font-medium ${
                            booking.payment_status === 'paid' ? 'text-green-400' :
                            booking.payment_status === 'pending' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors">
                        <Eye size={16} />
                        View Details
                      </button>
                      
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-colors">
                        <Download size={16} />
                        Download
                      </button>
                    </div>

                    {booking.status === 'confirmed' && (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle size={16} />
                        <span>Ready to travel</span>
                      </div>
                    )}

                    {booking.status === 'pending' && (
                      <div className="flex items-center gap-2 text-sm text-yellow-400">
                        <Clock size={16} />
                        <span>Awaiting confirmation</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}