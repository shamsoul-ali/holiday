'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plane, Cloud, MapPin, Clock, Bell, AlertTriangle, CheckCircle, TrendingUp, Wifi, Battery, Navigation } from 'lucide-react'

export default function LiveDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingRef = searchParams.get('ref') || 'HA7F3G2K1'

  const [currentTime, setCurrentTime] = useState(new Date())
  const [flightStatus, setFlightStatus] = useState('On Time')
  const [weatherTemp, setWeatherTemp] = useState(24)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate dynamic updates
    const statusTimer = setInterval(() => {
      const statuses = ['On Time', 'Boarding Soon', 'Delayed 15 min']
      setFlightStatus(statuses[Math.floor(Math.random() * statuses.length)])
    }, 10000)

    return () => {
      clearInterval(timer)
      clearInterval(statusTimer)
    }
  }, [])

  const daysUntilDeparture = 45

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Navigation className="w-6 h-6 animate-pulse" />
                Live Travel Dashboard
              </h1>
              <p className="text-sm text-white/90 mt-1">
                Ref: {bookingRef} • Real-time updates
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-white/90 hover:text-white font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white text-center">
          <p className="text-lg mb-2 opacity-90">Departure in</p>
          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="text-5xl font-bold">{daysUntilDeparture}</p>
              <p className="text-sm opacity-90">Days</p>
            </div>
            <div className="text-4xl">:</div>
            <div>
              <p className="text-5xl font-bold">{currentTime.getHours().toString().padStart(2, '0')}</p>
              <p className="text-sm opacity-90">Hours</p>
            </div>
            <div className="text-4xl">:</div>
            <div>
              <p className="text-5xl font-bold">{currentTime.getMinutes().toString().padStart(2, '0')}</p>
              <p className="text-sm opacity-90">Minutes</p>
            </div>
            <div className="text-4xl">:</div>
            <div>
              <p className="text-5xl font-bold">{currentTime.getSeconds().toString().padStart(2, '0')}</p>
              <p className="text-sm opacity-90">Seconds</p>
            </div>
          </div>
          <p className="text-sm opacity-90 mt-4">to Tokyo, Japan 🇯🇵</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plane className="w-6 h-6 text-blue-600" />
                Flight Status
              </h2>

              <div className="space-y-4">
                {/* Outbound Flight */}
                <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Outbound Flight</p>
                      <p className="text-lg font-bold text-gray-900">MH 070 • KUL → NRT</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      flightStatus === 'On Time' ? 'bg-green-100 text-green-700' :
                      flightStatus === 'Boarding Soon' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {flightStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Departure</p>
                      <p className="font-bold text-gray-900">09:00 AM</p>
                      <p className="text-gray-500">15 Mar 2026</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Arrival</p>
                      <p className="font-bold text-gray-900">05:00 PM</p>
                      <p className="text-gray-500">Same day</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Gate</p>
                      <p className="font-bold text-gray-900">C8</p>
                      <p className="text-gray-500">Terminal KLIA</p>
                    </div>
                  </div>
                </div>

                {/* Return Flight */}
                <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Return Flight</p>
                      <p className="text-lg font-bold text-gray-900">MH 071 • NRT → KUL</p>
                    </div>
                    <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-bold">
                      Scheduled
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Departure</p>
                      <p className="font-bold text-gray-900">07:00 PM</p>
                      <p className="text-gray-500">20 Mar 2026</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Arrival</p>
                      <p className="font-bold text-gray-900">01:30 AM</p>
                      <p className="text-gray-500">Next day</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Gate</p>
                      <p className="font-bold text-gray-900">A12</p>
                      <p className="text-gray-500">Terminal 1</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Forecast */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Cloud className="w-6 h-6 text-blue-600" />
                Weather in Tokyo
              </h2>

              <div className="grid grid-cols-5 gap-3">
                {[
                  { day: 'Mon', temp: 24, icon: '☀️', condition: 'Sunny' },
                  { day: 'Tue', temp: 22, icon: '⛅', condition: 'Cloudy' },
                  { day: 'Wed', temp: 20, icon: '🌧️', condition: 'Rainy' },
                  { day: 'Thu', temp: 23, icon: '☀️', condition: 'Sunny' },
                  { day: 'Fri', temp: 25, icon: '☀️', condition: 'Sunny' }
                ].map((day, idx) => (
                  <div key={idx} className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{day.day}</p>
                    <p className="text-4xl mb-2">{day.icon}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{day.temp}°C</p>
                    <p className="text-xs text-gray-600">{day.condition}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Accommodation
              </h2>

              <div className="flex gap-4">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop"
                  alt="Hotel"
                  className="w-32 h-32 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Hotel Gracery Shinjuku</h3>
                  <p className="text-sm text-gray-600 mb-2">1-19-1 Kabukicho, Shinjuku-ku</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700">📍 500m to Shinjuku Station</p>
                    <p className="text-gray-700">✓ Check-in: 15 Mar, 3:00 PM</p>
                    <p className="text-gray-700">✓ Check-out: 20 Mar, 11:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Notifications
              </h3>

              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">Booking Confirmed</p>
                      <p className="text-xs text-green-700">All set for your trip!</p>
                      <p className="text-xs text-green-600 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">Weather Alert</p>
                      <p className="text-xs text-yellow-700">Rain expected Wed</p>
                      <p className="text-xs text-yellow-600 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Reminder</p>
                      <p className="text-xs text-blue-700">Check-in opens in 24h</p>
                      <p className="text-xs text-blue-600 mt-1">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/travel-documents?ref=${bookingRef}`)}
                  className="w-full bg-blue-100 text-blue-700 py-3 px-4 rounded-xl font-semibold hover:bg-blue-200 transition-all text-left"
                >
                  📄 View Documents
                </button>

                <button
                  onClick={() => router.push('/travel-planner')}
                  className="w-full bg-purple-100 text-purple-700 py-3 px-4 rounded-xl font-semibold hover:bg-purple-200 transition-all text-left"
                >
                  ✅ Travel Checklist
                </button>

                <button className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-xl font-semibold hover:bg-green-200 transition-all text-left">
                  📍 Offline Maps
                </button>

                <button className="w-full bg-orange-100 text-orange-700 py-3 px-4 rounded-xl font-semibold hover:bg-orange-200 transition-all text-left">
                  💬 Support Chat
                </button>
              </div>
            </div>

            {/* Live Stats */}
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Live Stats</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <Battery className="w-4 h-4" />
                    Device Battery
                  </span>
                  <span className="font-bold text-green-600">87%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    Connection
                  </span>
                  <span className="font-bold text-blue-600">Strong</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trip Progress
                  </span>
                  <span className="font-bold text-purple-600">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
