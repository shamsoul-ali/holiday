'use client'

import { useState, useEffect } from 'react'
import { Booking, BookingListResponse } from '@/lib/types/booking'

interface BookingStatusDashboardProps {
  userId: string
}

export default function BookingStatusDashboard({ userId }: BookingStatusDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchBookings()
  }, [userId, statusFilter, currentPage])

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        userId,
        status: statusFilter,
        page: currentPage.toString(),
        limit: '10'
      })

      const response = await fetch(`/api/bookings/list?${params}`)
      const data: BookingListResponse = await response.json()

      if (data.success) {
        setBookings(data.bookings || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        setError(data.error || 'Failed to fetch bookings')
      }
    } catch (err) {
      setError('Network error while fetching bookings')
      console.error('Booking fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string): string => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status: string): string => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      partial: 'bg-orange-100 text-orange-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatBookingType = (type: string): string => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Track and manage all your travel bookings in one place</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status)
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading bookings</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {statusFilter === 'all' 
                  ? "You haven't made any bookings yet. Start planning your next adventure!"
                  : `No bookings with status "${statusFilter}" found.`
                }
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.bookingReference}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatBookingType(booking.bookingType)} • {booking.travelerCount} traveler{booking.travelerCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {booking.currency} {booking.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Booked {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Travel Dates */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-gray-900">
                          {new Date(booking.travelStartDate).toLocaleDateString()}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium text-gray-900">
                          {new Date(booking.travelEndDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.ceil((new Date(booking.travelEndDate).getTime() - new Date(booking.travelStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </div>

                  {/* Booking Components */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {booking.flightBookings && booking.flightBookings.length > 0 && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl mb-1">✈️</div>
                        <div className="text-sm font-medium text-blue-800">Flights</div>
                        <div className="text-xs text-blue-600">{booking.flightBookings.length} booking(s)</div>
                      </div>
                    )}
                    {booking.hotelBookings && booking.hotelBookings.length > 0 && (
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl mb-1">🏨</div>
                        <div className="text-sm font-medium text-green-800">Hotels</div>
                        <div className="text-xs text-green-600">{booking.hotelBookings.length} booking(s)</div>
                      </div>
                    )}
                    {booking.activityBookings && booking.activityBookings.length > 0 && (
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl mb-1">🎯</div>
                        <div className="text-sm font-medium text-purple-800">Activities</div>
                        <div className="text-xs text-purple-600">{booking.activityBookings.length} booking(s)</div>
                      </div>
                    )}
                    {booking.transportBookings && booking.transportBookings.length > 0 && (
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl mb-1">🚗</div>
                        <div className="text-sm font-medium text-orange-800">Transport</div>
                        <div className="text-xs text-orange-600">{booking.transportBookings.length} booking(s)</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => window.location.href = `/bookings/${booking.id}`}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                    {booking.status === 'confirmed' && (
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        Manage Booking
                      </button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}