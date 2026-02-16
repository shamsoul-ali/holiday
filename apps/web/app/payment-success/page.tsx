'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Download, Mail, Plane, Calendar, Users, MapPin, Share2 } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const destination = searchParams.get('destination') || 'Tokyo, Japan'
  const travelers = searchParams.get('travelers') || '2'
  const totalCost = searchParams.get('totalCost') || '0'
  const bookingRef = searchParams.get('bookingRef') || 'HA123456'

  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    // Store booking in localStorage
    const booking = {
      bookingRef,
      destination,
      travelers,
      totalCost,
      date: new Date().toISOString(),
      status: 'confirmed'
    }

    const existingBookings = JSON.parse(localStorage.getItem('holiday_ai_bookings') || '[]')
    existingBookings.push(booking)
    localStorage.setItem('holiday_ai_bookings', JSON.stringify(existingBookings))

    // Simulate email send
    setTimeout(() => setEmailSent(true), 1500)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">Your trip to {destination} is confirmed</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Booking Reference</p>
                <p className="text-3xl font-bold tracking-wider">{bookingRef}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Total Paid</p>
                <p className="text-3xl font-bold">RM {parseInt(totalCost).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="font-semibold text-gray-900">{destination}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Travelers</p>
                  <p className="font-semibold text-gray-900">{travelers} adults</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Booking Date</p>
                  <p className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Plane className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Confirmed
                  </span>
                </div>
              </div>
            </div>

            {/* Email Confirmation Status */}
            <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 transition-all ${emailSent ? 'opacity-100' : 'opacity-50'}`}>
              <Mail className={`w-6 h-6 ${emailSent ? 'text-blue-600' : 'text-gray-400'}`} />
              <div className="flex-1">
                {emailSent ? (
                  <>
                    <p className="font-semibold text-blue-900">Confirmation Email Sent!</p>
                    <p className="text-sm text-blue-700">Check your inbox for booking details and travel documents</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900">Sending Confirmation Email...</p>
                    <p className="text-sm text-gray-700">Please wait...</p>
                  </>
                )}
              </div>
              {emailSent && <CheckCircle className="w-6 h-6 text-green-600" />}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push(`/my-bookings`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Plane className="w-5 h-5" />
                View My Bookings
              </button>

              <button
                onClick={() => router.push(`/travel-documents?ref=${bookingRef}`)}
                className="bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:border-gray-400 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Travel Documents
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Holiday AI Booking',
                      text: `I just booked a trip to ${destination}!`,
                      url: window.location.href
                    })
                  }
                }}
                className="bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:border-gray-400 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Trip
              </button>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">What's Next?</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Check Your Email</p>
                <p className="text-sm text-gray-600">We've sent your booking confirmation and e-tickets</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Prepare for Your Trip</p>
                <p className="text-sm text-gray-600">Use our travel planner to organize your journey</p>
                <button
                  onClick={() => router.push('/travel-planner')}
                  className="text-blue-600 text-sm font-semibold hover:text-blue-700 mt-1"
                >
                  Go to Travel Planner →
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Track Your Journey</p>
                <p className="text-sm text-gray-600">Get real-time flight updates and travel reminders</p>
                <button
                  onClick={() => router.push(`/live-dashboard?ref=${bookingRef}`)}
                  className="text-blue-600 text-sm font-semibold hover:text-blue-700 mt-1"
                >
                  Open Live Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 text-center">
          <p className="text-gray-800 mb-2">Need help with your booking?</p>
          <p className="text-sm text-gray-600 mb-4">Our 24/7 support team is here to assist you</p>
          <div className="flex items-center justify-center gap-4">
            <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all">
              Contact Support
            </button>
            <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all">
              FAQs
            </button>
          </div>
        </div>

        {/* Return Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/home-new')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Return to Homepage
          </button>
        </div>
      </div>
    </div>
  )
}
