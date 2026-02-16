'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Hotel, 
  Star, 
  MapPin, 
  Wifi, 
  Car, 
  Utensils, 
  Waves, 
  Dumbbell, 
  Coffee, 
  Shield, 
  AirVent, 
  Tv, 
  Bath, 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart
} from 'lucide-react'

interface Hotel {
  name: string;
  rating: number;
  location: string;
  amenities: string[];
  checkIn: string;
  checkOut: string;
  roomType: string;
  pricePerNight: number;
  totalNights: number;
  totalPrice: number;
  images?: string[];
  description?: string;
  highlights?: string[];
  facilities?: {
    wifi: boolean;
    parking: boolean;
    restaurant: boolean;
    pool: boolean;
    gym: boolean;
    spa: boolean;
    airConditioning: boolean;
    tv: boolean;
    minibar: boolean;
    roomService: boolean;
  };
  policies?: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    pets: boolean;
  };
  reviews?: {
    overall: number;
    cleanliness: number;
    service: number;
    location: number;
    value: number;
    totalReviews: number;
  };
  nearbyAttractions?: Array<{
    name: string;
    distance: string;
    type: string;
  }>;
}

interface HotelDetailsSectionProps {
  hotels: Hotel[]
  destination: string
}

export default function HotelDetailsSection({ hotels, destination }: HotelDetailsSectionProps) {
  const [selectedHotel, setSelectedHotel] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllAmenities, setShowAllAmenities] = useState(false)

  const formatPrice = (price: number, currency: string = 'MYR') => {
    return `${currency} ${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getHotelImages = (hotelName: string, destination: string) => {
    // Default hotel images based on destination
    const hotelImageMap: { [key: string]: string[] } = {
      'Jakarta': [
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'
      ],
      'Bangkok': [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'
      ],
      'Tokyo': [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'
      ]
    }

    return hotelImageMap[destination.split(',')[0]] || [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'
    ]
  }

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'wifi': <Wifi className="w-4 h-4" />,
      'parking': <Car className="w-4 h-4" />,
      'restaurant': <Utensils className="w-4 h-4" />,
      'pool': <Waves className="w-4 h-4" />,
      'gym': <Dumbbell className="w-4 h-4" />,
      'spa': <Bath className="w-4 h-4" />,
      'air conditioning': <AirVent className="w-4 h-4" />,
      'tv': <Tv className="w-4 h-4" />,
      'coffee maker': <Coffee className="w-4 h-4" />,
      'room service': <Shield className="w-4 h-4" />
    }

    return iconMap[amenity.toLowerCase()] || <CheckCircle className="w-4 h-4" />
  }

  // Enhanced hotel data with mock details
  const enhancedHotels = hotels.map((hotel, index) => ({
    ...hotel,
    images: getHotelImages(hotel.name, destination),
    description: `Experience luxury and comfort at ${hotel.name}, perfectly located in the heart of ${destination.split(',')[0]}. Our ${hotel.roomType} rooms offer modern amenities and stunning city views.`,
    highlights: [
      'Prime location in city center',
      'Modern amenities and facilities',
      'Exceptional customer service',
      '24/7 front desk assistance'
    ],
    facilities: {
      wifi: true,
      parking: true,
      restaurant: true,
      pool: hotel.rating >= 4,
      gym: hotel.rating >= 4,
      spa: hotel.rating >= 5,
      airConditioning: true,
      tv: true,
      minibar: hotel.rating >= 4,
      roomService: hotel.rating >= 4
    },
    policies: {
      checkIn: '3:00 PM',
      checkOut: '12:00 PM',
      cancellation: 'Free cancellation up to 24 hours before check-in',
      pets: hotel.rating <= 3
    },
    reviews: {
      overall: hotel.rating,
      cleanliness: hotel.rating,
      service: hotel.rating - 0.2,
      location: hotel.rating - 0.1,
      value: hotel.rating - 0.3,
      totalReviews: Math.floor(Math.random() * 1000) + 100
    },
    nearbyAttractions: [
      { name: 'City Center', distance: '0.5 km', type: 'Shopping' },
      { name: 'National Museum', distance: '1.2 km', type: 'Culture' },
      { name: 'Central Park', distance: '0.8 km', type: 'Recreation' },
      { name: 'Airport', distance: '15 km', type: 'Transport' }
    ]
  }))

  const currentHotel = enhancedHotels[selectedHotel]
  const currentImages = currentHotel?.images || []

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Hotel className="w-5 h-5 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Accommodation Details</h3>
      </div>

      {/* Hotel Selection Tabs */}
      {enhancedHotels.length > 1 && (
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {enhancedHotels.map((hotel, index) => (
            <button
              key={index}
              onClick={() => setSelectedHotel(index)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedHotel === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {hotel.name}
            </button>
          ))}
        </div>
      )}

      {currentHotel && (
        <div className="space-y-6">
          {/* Hotel Header */}
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            {/* Hotel Images */}
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <div className="relative">
                <motion.img
                  key={currentImageIndex}
                  src={currentImages[currentImageIndex]}
                  alt={currentHotel.name}
                  className="w-full h-64 object-cover rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Image Navigation */}
                {currentImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? currentImages.length - 1 : prev - 1
                      )}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === currentImages.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {currentImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Hotel Info */}
            <div className="w-full md:w-1/2">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-xl font-bold text-white">{currentHotel.name}</h4>
                <button className="p-1 hover:bg-white/10 rounded transition-colors">
                  <Heart className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < currentHotel.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  {currentHotel.rating}/5 ({currentHotel.reviews?.totalReviews} reviews)
                </span>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{currentHotel.location}</span>
              </div>

              <p className="text-sm text-gray-300 mb-4">
                {currentHotel.description}
              </p>

              {/* Pricing Info */}
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Room Type:</span>
                  <span className="text-white font-medium">{currentHotel.roomType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Price per night:</span>
                  <span className="text-white font-medium">{formatPrice(currentHotel.pricePerNight)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total nights:</span>
                  <span className="text-white">{currentHotel.totalNights} nights</span>
                </div>
                <div className="border-t border-white/10 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Total Price:</span>
                    <span className="text-blue-400 font-bold">{formatPrice(currentHotel.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Check-in/out Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">Check-in</span>
              </div>
              <p className="text-sm text-gray-300">{formatDate(currentHotel.checkIn)}</p>
              <p className="text-xs text-gray-400">{currentHotel.policies?.checkIn}</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-white">Check-out</span>
              </div>
              <p className="text-sm text-gray-300">{formatDate(currentHotel.checkOut)}</p>
              <p className="text-xs text-gray-400">{currentHotel.policies?.checkOut}</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Guests</span>
              </div>
              <p className="text-sm text-gray-300">2 Adults</p>
              <p className="text-xs text-gray-400">Standard occupancy</p>
            </div>
          </div>

          {/* Amenities & Facilities */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-3">Amenities & Facilities</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(currentHotel.facilities || {})
                .filter(([_, available]) => available)
                .slice(0, showAllAmenities ? undefined : 8)
                .map(([facility, _]) => (
                  <div key={facility} className="flex items-center space-x-2 text-sm text-gray-300">
                    {getAmenityIcon(facility.replace(/([A-Z])/g, ' $1').toLowerCase())}
                    <span className="capitalize">{facility.replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                ))
              }
            </div>
            
            {Object.keys(currentHotel.facilities || {}).length > 8 && (
              <button
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showAllAmenities ? 'Show Less' : 'Show All Amenities'}
              </button>
            )}
          </div>

          {/* Nearby Attractions */}
          {currentHotel.nearbyAttractions && (
            <div>
              <h5 className="text-lg font-semibold text-white mb-3">Nearby Attractions</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentHotel.nearbyAttractions.map((attraction, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{attraction.name}</p>
                      <p className="text-xs text-gray-400">{attraction.type}</p>
                    </div>
                    <span className="text-sm text-gray-300">{attraction.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policies */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h5 className="text-lg font-semibold text-blue-300 mb-3">Hotel Policies</h5>
            <div className="space-y-2 text-sm">
              <p className="text-blue-200">
                <strong>Cancellation:</strong> {currentHotel.policies?.cancellation}
              </p>
              <p className="text-blue-200">
                <strong>Pets:</strong> {currentHotel.policies?.pets ? 'Allowed' : 'Not allowed'}
              </p>
              <p className="text-blue-200">
                <strong>Additional Info:</strong> Valid ID required at check-in. Security deposit may apply.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}