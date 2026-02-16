'use client'

import { useState } from 'react'
import { Search, Plane, Hotel, Home, Calendar, Users, Plus, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AgodaStyleHome() {
  const [searchType, setSearchType] = useState<'hotels' | 'flights' | 'homes' | 'package' | 'activities'>('hotels')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [destination, setDestination] = useState('')
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 })
  const [showGuestPicker, setShowGuestPicker] = useState(false)

  const topDestinations = [
    { name: 'Kuala Lumpur', count: '19,902 accommodations', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400' },
    { name: 'Penang', count: '5,161 accommodations', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400' },
    { name: 'Malacca', count: '5,883 accommodations', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400' },
    { name: 'Kota Kinabalu', count: '3,417 accommodations', image: 'https://images.unsplash.com/photo-1562206075-49ed0e08f8c4?w=400' },
    { name: 'Johor Bahru', count: '6,994 accommodations', image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400' },
  ]

  const featuredProperties = [
    {
      name: 'Tropicana The Residence By Klcc',
      location: 'Kuala Lumpur City Centre, Kuala Lumpur',
      price: 368.96,
      rating: 9,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
    },
    {
      name: 'Paxtonz Premium Suites Petaling Jaya',
      location: 'One Utama / Damansara, Kuala Lumpur',
      price: 241.49,
      rating: 8.6,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400'
    },
    {
      name: 'Highpark Suites at PJ, Kelana Jaya',
      location: 'Petaling Jaya, Kuala Lumpur',
      price: 96.45,
      rating: 8.6,
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'
    },
    {
      name: 'Upper Hotel Suites KL Sentral',
      location: 'Kuala Lumpur Sentral, Kuala Lumpur',
      price: 154.77,
      rating: 8.4,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400'
    },
  ]

  const internationalDestinations = [
    { name: 'Manila', count: '13,223 accommodations', image: 'https://images.unsplash.com/photo-1544986581-efac024faf62?w=400' },
    { name: 'Jakarta', count: '14,249 accommodations', image: 'https://images.unsplash.com/photo-1555225943-9b2afc5c7367?w=400' },
    { name: 'Bangkok', count: '12,048 accommodations', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400' },
    { name: 'Las Vegas (NV)', count: '1,113 accommodations', image: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400' },
    { name: 'Cebu', count: '5,254 accommodations', image: 'https://images.unsplash.com/photo-1621544402532-63f5f8a93e76?w=400' },
  ]

  const handleSearch = () => {
    // If user has filled destination AND dates, go directly to results
    // Otherwise, send them to the planning flow to complete their preferences

    if (destination && checkIn && checkOut) {
      // Complete basic search - go directly to results with default preferences
      const params = new URLSearchParams({
        destination,
        departureCountry: 'Malaysia',
        budget: '5000',
        travelers: guests.adults.toString(),
        duration: calculateDuration(checkIn, checkOut),
        startDate: checkIn,
        endDate: checkOut,
        style: 'comfort',
        interests: 'culture,food',
      })

      window.location.href = `/results?${params.toString()}`
    } else if (destination || checkIn || checkOut) {
      // Partial data - send to planning flow to complete
      const params = new URLSearchParams()
      if (destination) params.append('destination', destination)
      if (checkIn) params.append('checkIn', checkIn)
      if (checkOut) params.append('checkOut', checkOut)
      params.append('adults', guests.adults.toString())
      params.append('children', guests.children.toString())

      window.location.href = `/plan?${params.toString()}`
    } else {
      // Fresh start - go to planning flow
      window.location.href = '/plan'
    }
  }

  const calculateDuration = (checkIn: string, checkOut: string) => {
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 3) return '3-days'
    if (days <= 7) return '1-week'
    if (days <= 14) return '2-weeks'
    return '1-month'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Holiday<span className="text-gray-800">AI</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Hotels
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Flights
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Homes & Apts
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Flight + Hotel
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Activities
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Airport transfer
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-700 hover:text-blue-600">List your place</button>
              <button className="text-sm text-gray-700 hover:text-blue-600">RM</button>
              <button className="text-sm text-gray-700 hover:text-blue-600">Sign in</button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                Create account
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <div
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-4xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8">
              SEE THE WORLD FOR LESS
            </h1>

            {/* Search Box */}
            <div className="bg-white rounded-lg shadow-2xl p-6">
              {/* Search Type Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setSearchType('hotels')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    searchType === 'hotels'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Hotel className="w-4 h-4 inline mr-2" />
                  Hotels
                </button>
                <button
                  onClick={() => setSearchType('flights')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    searchType === 'flights'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Plane className="w-4 h-4 inline mr-2" />
                  Flights
                </button>
                <button
                  onClick={() => setSearchType('homes')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    searchType === 'homes'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home className="w-4 h-4 inline mr-2" />
                  Homes & Apts
                </button>
                <button
                  onClick={() => setSearchType('package')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    searchType === 'package'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Plane className="w-4 h-4 inline mr-2" />
                  Flight + Hotel
                </button>
              </div>

              {/* Search Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Enter a destination or property
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Kuala Lumpur"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="md:col-span-1 relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Guests & Rooms
                  </label>
                  <button
                    onClick={() => setShowGuestPicker(!showGuestPicker)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {guests.adults} adults, {guests.rooms} room
                      </span>
                    </div>
                  </button>

                  {showGuestPicker && (
                    <div className="absolute top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Adults</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setGuests(g => ({ ...g, adults: Math.max(1, g.adults - 1) }))}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{guests.adults}</span>
                            <button
                              onClick={() => setGuests(g => ({ ...g, adults: g.adults + 1 }))}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Children</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setGuests(g => ({ ...g, children: Math.max(0, g.children - 1) }))}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{guests.children}</span>
                            <button
                              onClick={() => setGuests(g => ({ ...g, children: g.children + 1 }))}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Rooms</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setGuests(g => ({ ...g, rooms: Math.max(1, g.rooms - 1) }))}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{guests.rooms}</span>
                            <button
                              onClick={() => setGuests(g => ({ ...g, rooms: g.rooms + 1 }))}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                {destination && checkIn && checkOut ? 'SEARCH NOW' : 'CONTINUE PLANNING'}
              </button>

              {(!destination || !checkIn || !checkOut) && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  {!destination && !checkIn && !checkOut
                    ? "We'll help you plan step by step"
                    : "Complete your search details in the next step"}
                </p>
              )}

              {/* Quick Start Button */}
              <div className="mt-4 text-center">
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Or start with AI-guided planning
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Experiences Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">What type of experience are you looking for?</h2>
          <p className="text-gray-600 text-lg">Let AI curate the perfect journey based on your interests</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            { name: 'Adventure & Outdoor', desc: 'Hiking, diving, extreme sports', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop' },
            { name: 'Umrah & Religious', desc: 'Spiritual journeys & pilgrimages', image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop' },
            { name: 'Food & Culinary', desc: 'Food tours & cooking classes', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop' },
            { name: 'Cultural & Heritage', desc: 'Museums, history & traditions', image: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&auto=format&fit=crop' },
            { name: 'Wellness & Healing', desc: 'Spa, yoga & meditation retreats', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop' },
            { name: 'Beach & Island', desc: 'Tropical paradise & water sports', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop' },
            { name: 'City & Urban', desc: 'Shopping, nightlife & entertainment', image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop' },
            { name: 'Nature & Eco', desc: 'National parks & eco lodges', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop' },
            { name: 'Romance & Honeymoon', desc: 'Romantic getaways for couples', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&auto=format&fit=crop' },
            { name: 'Family & Kids', desc: 'Theme parks & family activities', image: 'https://images.unsplash.com/photo-1533094602577-198d3beab8ea?w=800&auto=format&fit=crop' },
            { name: 'Luxury & VIP', desc: '5-star resorts & exclusive experiences', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop' },
            { name: 'Budget & Backpacking', desc: 'Affordable adventures & hostels', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop' },
          ].map((category) => (
            <Link
              key={category.name}
              href={`/plan?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group relative rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 aspect-[3/4]"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 text-white">
                <h3 className="font-bold text-xl mb-2">{category.name}</h3>
                <p className="text-sm text-white/90">{category.desc}</p>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-colors duration-300"></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Destinations in Malaysia */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Top destinations in Malaysia</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {topDestinations.map((dest) => (
            <div key={dest.name} className="group cursor-pointer">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="font-bold text-lg">{dest.name}</h3>
                  <p className="text-xs text-white/90">{dest.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Properties we think you'll like</h2>
          <Link href="/results" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProperties.map((property) => (
            <div key={property.name} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="relative aspect-[4/3]">
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
                  {property.rating}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-1">{property.location}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">Per night before taxes and fees</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  MYR {property.price.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular destinations outside Malaysia */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular destinations outside Malaysia</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {internationalDestinations.map((dest) => (
            <div key={dest.name} className="group cursor-pointer">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="font-bold text-lg">{dest.name}</h3>
                  <p className="text-xs text-white/90">{dest.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Help</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help center</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
                <li><a href="#" className="hover:text-white">Privacy policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of use</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Partner with us</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">List your property</a></li>
                <li><a href="#" className="hover:text-white">Partner Hub</a></li>
                <li><a href="#" className="hover:text-white">Affiliates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Get the app</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">iOS app</a></li>
                <li><a href="#" className="hover:text-white">Android app</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>All material herein © 2005–2026 Holiday AI Company. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
