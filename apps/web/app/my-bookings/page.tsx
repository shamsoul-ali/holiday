'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plane, Hotel, Calendar, MapPin, Download, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Booking {
  bookingRef: string
  destination: string
  travelers: string
  totalCost: string
  date: string
  status: 'confirmed' | 'completed' | 'cancelled'
  checkIn?: string
  checkOut?: string
}

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all')

  useEffect(() => {
    // Load bookings from localStorage
    const stored = localStorage.getItem('holiday_ai_bookings')
    if (stored) {
      setBookings(JSON.parse(stored))
    }

    // Add some mock bookings for demo
    if (!stored || JSON.parse(stored).length === 0) {
      const mockBookings: Booking[] = [
        {
          bookingRef: 'HA7F3G2K1',
          destination: 'Tokyo, Japan',
          travelers: '2',
          totalCost: '12500',
          date: new Date().toISOString(),
          status: 'confirmed',
          checkIn: '2026-03-15',
          checkOut: '2026-03-20'
        },
        {
          bookingRef: 'HA9X4M2P5',
          destination: 'Seoul, South Korea',
          travelers: '3',
          totalCost: '9800',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          checkIn: '2026-01-10',
          checkOut: '2026-01-15'
        },
        {
          bookingRef: 'HA2K8L3N9',
          destination: 'Bangkok, Thailand',
          travelers: '4',
          totalCost: '8200',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          checkIn: '2026-04-01',
          checkOut: '2026-04-05'
        }
      ]
      setBookings(mockBookings)
      localStorage.setItem('holiday_ai_bookings', JSON.stringify(mockBookings))
    }
  }, [])

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return booking.status === 'confirmed'
    if (filter === 'past') return booking.status === 'completed'
    if (filter === 'cancelled') return booking.status === 'cancelled'
    return true
  })

  const getStatusConfig = (status: string) => {
    const configs = {
      confirmed: {
        icon: CheckCircle,
        color: 'text-green-700',
        bg: 'bg-green-100',
        label: 'Confirmed'
      },
      completed: {
        icon: Clock,
        color: 'text-gray-700',
        bg: 'bg-gray-100',
        label: 'Completed'
      },
      cancelled: {
        icon: XCircle,
        color: 'text-red-700',
        bg: 'bg-red-100',
        label: 'Cancelled'
      }
    }
    return configs[status as keyof typeof configs] || configs.confirmed
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const statusConfig = getStatusConfig(booking.status)
    const StatusIcon = statusConfig.icon

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{booking.destination}</h3>
              <p className="text-gray-600 text-sm">Ref: {booking.bookingRef}</p>
            </div>
            <span className={`inline-flex items-center gap-1 ${statusConfig.bg} ${statusConfig.color} px-3 py-1.5 rounded-full text-sm font-bold`}>
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Check-in</p>
                <p className="text-sm font-semibold text-gray-900">{booking.checkIn || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Check-out</p>
                <p className="text-sm font-semibold text-gray-900">{booking.checkOut || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Travelers</p>
                <p className="text-sm font-semibold text-gray-900">{booking.travelers} adults</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="text-sm font-semibold text-gray-900">RM {parseInt(booking.totalCost).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/travel-documents?ref=${booking.bookingRef}`)}
              className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>

            <button
              onClick={() => router.push(`/travel-documents?ref=${booking.bookingRef}`)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            {booking.status === 'confirmed' && (
              <button
                onClick={() => router.push(`/live-dashboard?ref=${booking.bookingRef}`)}
                className="flex-1 bg-purple-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Track Live
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your trips and travel documents
              </p>
            </div>
            <button
              onClick={() => router.push('/home-new')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Trips ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Upcoming ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Past ({bookings.filter(b => b.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'cancelled'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
          </button>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map(booking => (
              <BookingCard key={booking.bookingRef} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">Start planning your next adventure!</p>
            <button
              onClick={() => router.push('/home-new')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Book a Trip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
