'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plane, Hotel, Calendar, Users, MapPin, Clock, CreditCard, CheckCircle, Edit, ChevronDown, ChevronUp } from 'lucide-react'

export default function ReviewItineraryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const destination = searchParams.get('destination') || 'Tokyo, Japan'
  const travelers = parseInt(searchParams.get('travelers') || '2')
  const tier = searchParams.get('tier') || 'Standard'
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const flightsCost = parseInt(searchParams.get('flightsCost') || '0')
  const hotelCost = parseInt(searchParams.get('hotelCost') || '0')

  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [isLoading, setIsLoading] = useState(false)

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 5
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights : 5
  }

  const nights = calculateNights()

  // Mock day-by-day itinerary
  const dailyItinerary = [
    {
      day: 1,
      date: checkIn,
      title: 'Arrival in Tokyo',
      activities: [
        { time: '09:00', name: 'Depart from Kuala Lumpur (KUL)', type: 'flight', icon: Plane },
        { time: '17:00', name: 'Arrive at Narita Airport (NRT)', type: 'flight', icon: Plane },
        { time: '18:30', name: 'Hotel check-in', type: 'hotel', icon: Hotel },
        { time: '20:00', name: 'Welcome dinner at Shibuya', type: 'activity', icon: MapPin }
      ]
    },
    {
      day: 2,
      date: new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0],
      title: 'Explore Central Tokyo',
      activities: [
        { time: '08:00', name: 'Breakfast at hotel', type: 'meal', icon: Hotel },
        { time: '09:30', name: 'Visit Senso-ji Temple, Asakusa', type: 'activity', icon: MapPin },
        { time: '12:00', name: 'Lunch at traditional restaurant', type: 'meal', icon: MapPin },
        { time: '14:00', name: 'Tokyo Skytree observation deck', type: 'activity', icon: MapPin },
        { time: '18:00', name: 'Dinner in Ginza district', type: 'meal', icon: MapPin }
      ]
    },
    {
      day: 3,
      date: new Date(new Date(checkIn).getTime() + 172800000).toISOString().split('T')[0],
      title: 'Modern Tokyo & Shopping',
      activities: [
        { time: '08:00', name: 'Breakfast at hotel', type: 'meal', icon: Hotel },
        { time: '10:00', name: 'Meiji Shrine & Harajuku', type: 'activity', icon: MapPin },
        { time: '13:00', name: 'Lunch at Omotesando', type: 'meal', icon: MapPin },
        { time: '15:00', name: 'Shopping in Shibuya', type: 'activity', icon: MapPin },
        { time: '19:00', name: 'Dinner at izakaya', type: 'meal', icon: MapPin }
      ]
    },
    {
      day: 4,
      date: new Date(new Date(checkIn).getTime() + 259200000).toISOString().split('T')[0],
      title: 'Day Trip to Hakone',
      activities: [
        { time: '07:00', name: 'Early breakfast', type: 'meal', icon: Hotel },
        { time: '08:30', name: 'Train to Hakone', type: 'activity', icon: MapPin },
        { time: '11:00', name: 'Hakone Shrine & Lake Ashi', type: 'activity', icon: MapPin },
        { time: '13:00', name: 'Lunch with Mt. Fuji views', type: 'meal', icon: MapPin },
        { time: '15:00', name: 'Onsen (hot spring) experience', type: 'activity', icon: MapPin },
        { time: '19:00', name: 'Return to Tokyo', type: 'activity', icon: MapPin }
      ]
    },
    {
      day: 5,
      date: checkOut,
      title: 'Departure Day',
      activities: [
        { time: '08:00', name: 'Final breakfast & hotel checkout', type: 'meal', icon: Hotel },
        { time: '10:00', name: 'Last minute shopping', type: 'activity', icon: MapPin },
        { time: '14:00', name: 'Depart for Narita Airport', type: 'activity', icon: MapPin },
        { time: '19:00', name: 'Flight departure to KUL', type: 'flight', icon: Plane },
        { time: '01:30+1', name: 'Arrive in Kuala Lumpur', type: 'flight', icon: Plane }
      ]
    }
  ]

  const totalCost = flightsCost + hotelCost

  const handleProceedToPayment = () => {
    setIsLoading(true)

    const params = new URLSearchParams({
      destination,
      travelers: travelers.toString(),
      checkIn,
      checkOut,
      totalCost: totalCost.toString()
    })

    setTimeout(() => {
      router.push(`/payment?${params.toString()}`)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review Your Itinerary</h1>
              <p className="text-sm text-gray-600 mt-1">
                {destination} • {nights} days • {travelers} travelers
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Trip Summary</h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {tier} Plan
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-semibold text-gray-900">{checkIn}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-semibold text-gray-900">{checkOut}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Travelers</p>
                    <p className="font-semibold text-gray-900">{travelers} adults</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{nights} nights</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-600" />
                  Flights
                </h3>
                <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">
                  <Edit className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 pl-4 py-2">
                  <p className="text-sm text-gray-600">Outbound</p>
                  <p className="font-semibold text-gray-900">Malaysia Airlines MH 070</p>
                  <p className="text-sm text-gray-600">KUL 09:00 → NRT 17:00</p>
                </div>

                <div className="border-l-4 border-purple-600 pl-4 py-2">
                  <p className="text-sm text-gray-600">Return</p>
                  <p className="font-semibold text-gray-900">Malaysia Airlines MH 071</p>
                  <p className="text-sm text-gray-600">NRT 19:00 → KUL 01:30+1</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                <span className="text-gray-600">Total Flight Cost</span>
                <span className="font-bold text-gray-900">RM {flightsCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Hotel Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-blue-600" />
                  Accommodation
                </h3>
                <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">
                  <Edit className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
              </div>

              <div className="flex gap-4">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop"
                  alt="Hotel"
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Hotel Gracery Shinjuku</p>
                  <p className="text-sm text-gray-600">Shinjuku, Tokyo</p>
                  <p className="text-sm text-gray-600 mt-1">Superior Double Room</p>
                  <p className="text-xs text-green-700 font-semibold mt-1">✓ Breakfast included</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                <span className="text-gray-600">Total Hotel Cost ({nights} nights)</span>
                <span className="font-bold text-gray-900">RM {hotelCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Daily Itinerary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Day-by-Day Itinerary</h3>

              <div className="space-y-3">
                {dailyItinerary.map((day) => (
                  <div key={day.day} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all flex items-center justify-between"
                    >
                      <div className="text-left">
                        <p className="font-bold text-gray-900">Day {day.day}: {day.title}</p>
                        <p className="text-sm text-gray-600">{day.date}</p>
                      </div>
                      {expandedDay === day.day ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>

                    {expandedDay === day.day && (
                      <div className="p-6 space-y-4">
                        {day.activities.map((activity, idx) => {
                          const Icon = activity.icon
                          return (
                            <div key={idx} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-blue-600" />
                                </div>
                                {idx < day.activities.length - 1 && (
                                  <div className="w-px h-8 bg-gray-200 my-1"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <p className="text-sm text-gray-500">{activity.time}</p>
                                <p className="font-semibold text-gray-900">{activity.name}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Price Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Flights (x{travelers})</span>
                  <span className="font-semibold text-gray-900">RM {flightsCost.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Hotel ({nights} nights)</span>
                  <span className="font-semibold text-gray-900">RM {hotelCost.toLocaleString()}</span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-2xl text-blue-600">RM {totalCost.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <CreditCard className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Free cancellation up to 48 hours</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">24/7 customer support</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Instant confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
