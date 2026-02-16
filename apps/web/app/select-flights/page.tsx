'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plane, Clock, Wifi, Coffee, TrendingUp, CheckCircle, Info, Users, Calendar } from 'lucide-react'

interface Flight {
  id: string
  airline: string
  logo: string
  flightNumber: string
  departure: {
    time: string
    airport: string
    code: string
  }
  arrival: {
    time: string
    airport: string
    code: string
  }
  duration: string
  stops: number
  stopLocation?: string
  price: number
  class: 'Economy' | 'Premium Economy' | 'Business'
  amenities: string[]
  baggage: string
  seatsPitch: string
  recommended?: boolean
  cheapest?: boolean
  fastest?: boolean
}

export default function SelectFlightsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const destination = searchParams.get('destination') || 'Tokyo, Japan'
  const budget = parseInt(searchParams.get('budget') || '10000')
  const travelers = parseInt(searchParams.get('travelers') || '2')
  const tier = searchParams.get('tier') || 'Standard'
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''

  const [selectedOutbound, setSelectedOutbound] = useState<string | null>(null)
  const [selectedReturn, setSelectedReturn] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock flight data - outbound
  const outboundFlights: Flight[] = [
    {
      id: 'out-1',
      airline: 'Malaysia Airlines',
      logo: 'https://images.kiwi.com/airlines/64/MH.png',
      flightNumber: 'MH 070',
      departure: { time: '09:00', airport: 'Kuala Lumpur International', code: 'KUL' },
      arrival: { time: '17:00', airport: 'Narita International', code: 'NRT' },
      duration: '7h 00m',
      stops: 0,
      price: 2850,
      class: 'Economy',
      amenities: ['In-flight entertainment', 'Meals included', 'USB charging'],
      baggage: '30kg checked + 7kg cabin',
      seatsPitch: '32 inches',
      recommended: true
    },
    {
      id: 'out-2',
      airline: 'AirAsia X',
      logo: 'https://images.kiwi.com/airlines/64/D7.png',
      flightNumber: 'D7 523',
      departure: { time: '06:30', airport: 'Kuala Lumpur International', code: 'KUL' },
      arrival: { time: '14:45', airport: 'Narita International', code: 'NRT' },
      duration: '7h 15m',
      stops: 0,
      price: 1890,
      class: 'Economy',
      amenities: ['Buy on board meals', 'Power outlets'],
      baggage: '20kg checked + 7kg cabin',
      seatsPitch: '30 inches',
      cheapest: true
    },
    {
      id: 'out-3',
      airline: 'Singapore Airlines',
      logo: 'https://images.kiwi.com/airlines/64/SQ.png',
      flightNumber: 'SQ 638',
      departure: { time: '10:30', airport: 'Kuala Lumpur International', code: 'KUL' },
      arrival: { time: '18:15', airport: 'Narita International', code: 'NRT' },
      duration: '6h 45m',
      stops: 1,
      stopLocation: 'Singapore (SIN)',
      price: 3200,
      class: 'Economy',
      amenities: ['Premium meals', 'In-flight entertainment', 'Wifi available'],
      baggage: '30kg checked + 7kg cabin',
      seatsPitch: '32 inches',
      fastest: true
    },
    {
      id: 'out-4',
      airline: 'Malaysia Airlines',
      logo: 'https://images.kiwi.com/airlines/64/MH.png',
      flightNumber: 'MH 072',
      departure: { time: '23:00', airport: 'Kuala Lumpur International', code: 'KUL' },
      arrival: { time: '07:15+1', airport: 'Narita International', code: 'NRT' },
      duration: '7h 15m',
      stops: 0,
      price: 3450,
      class: 'Premium Economy',
      amenities: ['Extra legroom', 'Premium meals', 'Priority boarding', 'Amenity kit'],
      baggage: '35kg checked + 10kg cabin',
      seatsPitch: '38 inches'
    }
  ]

  // Mock flight data - return
  const returnFlights: Flight[] = [
    {
      id: 'ret-1',
      airline: 'Malaysia Airlines',
      logo: 'https://images.kiwi.com/airlines/64/MH.png',
      flightNumber: 'MH 071',
      departure: { time: '19:00', airport: 'Narita International', code: 'NRT' },
      arrival: { time: '01:30+1', airport: 'Kuala Lumpur International', code: 'KUL' },
      duration: '7h 30m',
      stops: 0,
      price: 2950,
      class: 'Economy',
      amenities: ['In-flight entertainment', 'Meals included', 'USB charging'],
      baggage: '30kg checked + 7kg cabin',
      seatsPitch: '32 inches',
      recommended: true
    },
    {
      id: 'ret-2',
      airline: 'AirAsia X',
      logo: 'https://images.kiwi.com/airlines/64/D7.png',
      flightNumber: 'D7 524',
      departure: { time: '15:45', airport: 'Narita International', code: 'NRT' },
      arrival: { time: '22:15', airport: 'Kuala Lumpur International', code: 'KUL' },
      duration: '7h 30m',
      stops: 0,
      price: 1950,
      class: 'Economy',
      amenities: ['Buy on board meals', 'Power outlets'],
      baggage: '20kg checked + 7kg cabin',
      seatsPitch: '30 inches',
      cheapest: true
    },
    {
      id: 'ret-3',
      airline: 'Japan Airlines',
      logo: 'https://images.kiwi.com/airlines/64/JL.png',
      flightNumber: 'JL 725',
      departure: { time: '11:00', airport: 'Narita International', code: 'NRT' },
      arrival: { time: '17:30', airport: 'Kuala Lumpur International', code: 'KUL' },
      duration: '7h 30m',
      stops: 0,
      price: 3680,
      class: 'Economy',
      amenities: ['Japanese cuisine', 'In-flight entertainment', 'Wifi', 'Amenity kit'],
      baggage: '32kg checked + 10kg cabin',
      seatsPitch: '34 inches'
    }
  ]

  const handleContinue = () => {
    if (!selectedOutbound || !selectedReturn) return

    setIsLoading(true)
    const outboundFlight = outboundFlights.find(f => f.id === selectedOutbound)
    const returnFlight = returnFlights.find(f => f.id === selectedReturn)
    const flightsCost = (outboundFlight?.price || 0) + (returnFlight?.price || 0)

    const params = new URLSearchParams({
      destination,
      budget: budget.toString(),
      travelers: travelers.toString(),
      tier,
      checkIn,
      checkOut,
      outboundFlight: selectedOutbound,
      returnFlight: selectedReturn,
      flightsCost: flightsCost.toString()
    })

    setTimeout(() => {
      router.push(`/select-hotels?${params.toString()}`)
    }, 600)
  }

  const calculateTotal = () => {
    const outbound = outboundFlights.find(f => f.id === selectedOutbound)
    const returnFl = returnFlights.find(f => f.id === selectedReturn)
    return ((outbound?.price || 0) + (returnFl?.price || 0)) * travelers
  }

  const FlightCard = ({ flight, isSelected, onSelect, type }: {
    flight: Flight
    isSelected: boolean
    onSelect: () => void
    type: 'outbound' | 'return'
  }) => (
    <div
      onClick={onSelect}
      className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'ring-4 ring-blue-500 ring-offset-2 transform scale-102'
          : 'hover:shadow-2xl hover:scale-102'
      }`}
    >
      {/* Badges */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={flight.logo} alt={flight.airline} className="w-12 h-12 object-contain" />
          <div>
            <p className="font-bold text-gray-900">{flight.airline}</p>
            <p className="text-sm text-gray-500">{flight.flightNumber}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {flight.recommended && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
              Recommended
            </span>
          )}
          {flight.cheapest && (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
              Cheapest
            </span>
          )}
          {flight.fastest && (
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
              Fastest
            </span>
          )}
        </div>
      </div>

      {/* Flight Times */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">{flight.departure.time}</p>
          <p className="text-sm text-gray-600 font-medium">{flight.departure.code}</p>
          <p className="text-xs text-gray-500">{flight.departure.airport}</p>
        </div>

        <div className="flex-1 mx-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="flex-1 h-px bg-gray-300"></div>
            <Plane className="w-5 h-5 text-gray-400" />
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">{flight.duration}</p>
            {flight.stops === 0 ? (
              <p className="text-xs text-green-600 font-semibold">Direct</p>
            ) : (
              <p className="text-xs text-orange-600 font-semibold">{flight.stops} stop via {flight.stopLocation}</p>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">{flight.arrival.time}</p>
          <p className="text-sm text-gray-600 font-medium">{flight.arrival.code}</p>
          <p className="text-xs text-gray-500">{flight.arrival.airport}</p>
        </div>
      </div>

      {/* Details */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Class</p>
            <p className="text-sm font-semibold text-gray-900">{flight.class}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Baggage</p>
            <p className="text-sm font-semibold text-gray-900">{flight.baggage}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {flight.amenities.map((amenity, idx) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Price per person</p>
          <p className="text-2xl font-bold text-gray-900">RM {flight.price.toLocaleString()}</p>
        </div>

        <button
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            isSelected
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isSelected ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Selected
            </span>
          ) : (
            'Select'
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Select Your Flights</h1>
              <p className="text-sm text-gray-600 mt-1">
                {destination} • {travelers} travelers • {tier} Plan
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

      {/* Trip Info Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Outbound: {checkIn || 'Select date'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Return: {checkOut || 'Select date'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{travelers} travelers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Outbound Flights */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              1
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Outbound Flight</h2>
              <p className="text-sm text-gray-600">KUL → NRT • {checkIn}</p>
            </div>
          </div>

          <div className="space-y-4">
            {outboundFlights.map(flight => (
              <FlightCard
                key={flight.id}
                flight={flight}
                isSelected={selectedOutbound === flight.id}
                onSelect={() => setSelectedOutbound(flight.id)}
                type="outbound"
              />
            ))}
          </div>
        </div>

        {/* Return Flights */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              2
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Return Flight</h2>
              <p className="text-sm text-gray-600">NRT → KUL • {checkOut}</p>
            </div>
          </div>

          <div className="space-y-4">
            {returnFlights.map(flight => (
              <FlightCard
                key={flight.id}
                flight={flight}
                isSelected={selectedReturn === flight.id}
                onSelect={() => setSelectedReturn(flight.id)}
                type="return"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {(selectedOutbound || selectedReturn) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Flight Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  RM {calculateTotal().toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedOutbound && selectedReturn ? 'Both flights selected' : 'Please select both flights'}
                </p>
              </div>

              <button
                onClick={handleContinue}
                disabled={!selectedOutbound || !selectedReturn || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 px-8 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
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
                    Continue to Hotels
                    <Plane className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
