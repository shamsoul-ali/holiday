'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Hotel, Star, MapPin, Wifi, Coffee, Dumbbell, Utensils, Waves, CheckCircle, Heart } from 'lucide-react'

interface HotelOption {
  id: string
  name: string
  rating: number
  reviews: number
  location: string
  distance: string
  images: string[]
  price: number
  originalPrice?: number
  amenities: string[]
  roomType: string
  breakfast: boolean
  cancellation: string
  recommended?: boolean
  bestValue?: boolean
}

export default function SelectHotelsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const destination = searchParams.get('destination') || 'Tokyo, Japan'
  const travelers = parseInt(searchParams.get('travelers') || '2')
  const tier = searchParams.get('tier') || 'Standard'
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const flightsCost = parseInt(searchParams.get('flightsCost') || '0')

  const [selectedHotel, setSelectedHotel] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const hotels: HotelOption[] = [
    {
      id: 'hotel-1',
      name: 'Hotel Gracery Shinjuku',
      rating: 4.5,
      reviews: 2847,
      location: 'Shinjuku, Tokyo',
      distance: '500m to Shinjuku Station',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop'
      ],
      price: 2400,
      originalPrice: 2800,
      amenities: ['Free WiFi', 'Restaurant', 'Gym', 'Rooftop bar', 'Laundry'],
      roomType: 'Superior Double Room',
      breakfast: true,
      cancellation: 'Free cancellation until 3 days before',
      recommended: true
    },
    {
      id: 'hotel-2',
      name: 'Tokyu Stay Shibuya',
      rating: 4.3,
      reviews: 1923,
      location: 'Shibuya, Tokyo',
      distance: '300m to Shibuya Crossing',
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop'
      ],
      price: 1850,
      amenities: ['Free WiFi', 'Kitchenette', 'Washing machine', '24/7 reception'],
      roomType: 'Standard Twin Room',
      breakfast: false,
      cancellation: 'Free cancellation until 1 day before',
      bestValue: true
    },
    {
      id: 'hotel-3',
      name: 'The Prince Park Tower Tokyo',
      rating: 4.7,
      reviews: 3421,
      location: 'Minato, Tokyo',
      distance: '200m to Tokyo Tower',
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop'
      ],
      price: 4200,
      originalPrice: 4900,
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Multiple restaurants', 'Concierge', 'Gym'],
      roomType: 'Deluxe King Room with Tower View',
      breakfast: true,
      cancellation: 'Free cancellation until 7 days before'
    },
    {
      id: 'hotel-4',
      name: 'Hotel Mystays Asakusa',
      rating: 4.1,
      reviews: 1647,
      location: 'Asakusa, Tokyo',
      distance: '400m to Senso-ji Temple',
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&auto=format&fit=crop'
      ],
      price: 1580,
      amenities: ['Free WiFi', 'Coin laundry', 'Vending machines', 'Luggage storage'],
      roomType: 'Standard Double Room',
      breakfast: false,
      cancellation: 'Non-refundable'
    },
    {
      id: 'hotel-5',
      name: 'The Ritz-Carlton Tokyo',
      rating: 4.9,
      reviews: 4832,
      location: 'Roppongi, Tokyo',
      distance: 'In Midtown Tower',
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop'
      ],
      price: 8500,
      originalPrice: 10000,
      amenities: ['Free WiFi', 'Spa', 'Pool', 'Michelin restaurant', 'Butler service', 'Club lounge'],
      roomType: 'Deluxe Room with Tokyo Skytree View',
      breakfast: true,
      cancellation: 'Free cancellation until 7 days before'
    }
  ]

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 5
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights : 5
  }

  const nights = calculateNights()

  const handleContinue = () => {
    if (!selectedHotel) return

    setIsLoading(true)
    const hotel = hotels.find(h => h.id === selectedHotel)
    const hotelCost = (hotel?.price || 0) * nights

    const params = new URLSearchParams({
      destination,
      travelers: travelers.toString(),
      tier,
      checkIn,
      checkOut,
      flightsCost: flightsCost.toString(),
      selectedHotel,
      hotelCost: hotelCost.toString()
    })

    setTimeout(() => {
      router.push(`/review-itinerary?${params.toString()}`)
    }, 600)
  }

  const HotelCard = ({ hotel }: { hotel: HotelOption }) => {
    const isSelected = selectedHotel === hotel.id
    const totalPrice = hotel.price * nights

    return (
      <div
        onClick={() => setSelectedHotel(hotel.id)}
        className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ${
          isSelected
            ? 'ring-4 ring-blue-500 ring-offset-2 transform scale-102'
            : 'hover:shadow-2xl hover:scale-102'
        }`}
      >
        <div className="flex flex-col md:flex-row">
          {/* Images */}
          <div className="md:w-2/5 relative">
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-64 md:h-full object-cover"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              {hotel.recommended && (
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ⭐ Recommended
                </span>
              )}
              {hotel.bestValue && (
                <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  💰 Best Value
                </span>
              )}
            </div>
            <button className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Details */}
          <div className="md:w-3/5 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{hotel.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{hotel.location}</span>
                  <span className="text-gray-400">•</span>
                  <span>{hotel.distance}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="font-bold">{hotel.rating}</span>
              </div>
              <span className="text-sm text-gray-600">({hotel.reviews.toLocaleString()} reviews)</span>
            </div>

            {/* Room Type */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 mb-1">Room Type</p>
              <p className="font-semibold text-gray-900">{hotel.roomType}</p>
              {hotel.breakfast && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold mt-1">
                  <Coffee className="w-3 h-3" />
                  Breakfast included
                </span>
              )}
            </div>

            {/* Amenities */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.slice(0, 5).map((amenity, idx) => (
                  <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {amenity}
                  </span>
                ))}
                {hotel.amenities.length > 5 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{hotel.amenities.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Cancellation */}
            <p className="text-xs text-gray-600 mb-4">
              🔒 {hotel.cancellation}
            </p>

            {/* Price & Button */}
            <div className="flex items-end justify-between pt-4 border-t border-gray-200">
              <div>
                {hotel.originalPrice && (
                  <p className="text-sm text-gray-500 line-through">
                    RM {(hotel.originalPrice * nights).toLocaleString()}
                  </p>
                )}
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">
                    RM {totalPrice.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">total</p>
                </div>
                <p className="text-xs text-gray-500">RM {hotel.price.toLocaleString()} per night × {nights} nights</p>
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Select Your Hotel</h1>
              <p className="text-sm text-gray-600 mt-1">
                {destination} • {nights} nights • {travelers} guests
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

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
              All Hotels
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              With Breakfast
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Free Cancellation
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              4+ Stars
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-gray-600 mb-6">{hotels.length} hotels found in {destination}</p>

        <div className="space-y-6">
          {hotels.map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {selectedHotel && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trip Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  RM {(flightsCost + (hotels.find(h => h.id === selectedHotel)?.price || 0) * nights).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Flights: RM {flightsCost.toLocaleString()} • Hotel: RM {((hotels.find(h => h.id === selectedHotel)?.price || 0) * nights).toLocaleString()}
                </p>
              </div>

              <button
                onClick={handleContinue}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 px-8 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg flex items-center gap-2"
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
                    Review Itinerary
                    <Hotel className="w-5 h-5" />
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
