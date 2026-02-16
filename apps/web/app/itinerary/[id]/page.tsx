'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  Heart,
  Share2,
  Download,
  Clock,
  Utensils,
  Bed,
  Camera,
  DollarSign,
  CheckCircle,
  Plane,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../../components/providers/AuthProvider'
import { favorites, itineraries } from '../../../lib/auth-client'
import BookingFlow from '../../../components/BookingFlow'
import AuthModal from '../../../components/auth/AuthModal'
import AuthDebugger from '../../../components/AuthDebugger'
import EnhancedItineraryDisplay from '../../../components/EnhancedItineraryDisplay'
import toast from 'react-hot-toast'

interface ItineraryDay {
  day: number | string
  title: string
  activities: string[]
  meals: Array<{
    name: string;
    time: string;
    cost: number;
    type: string;
  }> | string[]
  accommodation: string
  schedule?: Array<{
    time: string;
    activity: string;
    type: string;
    cost: number;
  }>
  dayTotal?: number
  highlights?: string[]
}

interface Itinerary {
  id: string
  title: string
  destination: string
  duration: string
  dates: { start: string; end: string }
  price: { 
    total: number; 
    perPerson: number; 
    currency: string;
    breakdown?: {
      adults?: { count: number; unitPrice: number; total: number };
      children?: { count: number; unitPrice: number; total: number };
      infants?: { count: number; unitPrice: number; total: number };
      flights?: number;
      accommodation?: number;
      meals?: number;
      activities?: number;
      transport?: number;
      insurance?: number;
      taxes?: number;
    }
  }
  travelers: {
    adults: number;
    children: number;
    infants: number;
    total: number;
  } | number
  countries: number
  weather?: { temperature: number; condition: string; description: string }
  highlights: string[]
  days: ItineraryDay[]
  accommodation: string
  transport: string[]
  meals: string[]
  activities: string[]
  flightClass?: string
  airlines?: {
    recommendations: Array<{
      name: string;
      route: string;
      features: string[];
      estimatedPrice: string;
    }>;
    flightClass: string;
    estimatedFlightBudget: string;
  }
  flightDetails?: {
    outbound: {
      airline: string;
      flightNumber: string;
      departure: { airport: string; time: string; };
      arrival: { airport: string; time: string; };
      duration: string;
      class: string;
      price: number;
    };
    return: {
      airline: string;
      flightNumber: string;
      departure: { airport: string; time: string; };
      arrival: { airport: string; time: string; };
      duration: string;
      class: string;
      price: number;
    };
  }
  accommodationDetails?: {
    hotels: Array<{
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
    }>;
  }
  insuranceDetails?: {
    provider: string;
    coverage: string[];
    price: number;
  }
}

export default function ItineraryDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeDay, setActiveDay] = useState<number>(1)
  const [bookingFlowOpen, setBookingFlowOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95])

  useEffect(() => {
    loadItinerary()
  }, [params.id, searchParams])

  useEffect(() => {
    if (user && itinerary) {
      checkIfFavorited()
    }
  }, [user, itinerary])

  useEffect(() => {
    // Auto-open booking flow if book parameter is present
    const shouldBook = searchParams.get('book')
    console.log('Checking auto-book:', { shouldBook, hasItinerary: !!itinerary, hasUser: !!user, authLoading })
    
    if (shouldBook === 'true' && itinerary && !authLoading) {
      if (user) {
        console.log('Auto-opening booking flow')
        setBookingFlowOpen(true)
      } else {
        console.log('Auto-opening auth modal')
        setAuthModalOpen(true)
      }
    }
  }, [searchParams, itinerary, user, authLoading])

  const loadItinerary = () => {
    const itineraryData = searchParams.get('data')
    if (itineraryData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(itineraryData))
        setItinerary(decoded)
        setLoading(false)
        return
      } catch (error) {
        console.error('Error parsing itinerary data:', error)
      }
    }

    const stored = localStorage.getItem('latest-itineraries')
    if (stored) {
      try {
        const itineraries = JSON.parse(stored)
        const found = itineraries.find((it: Itinerary) => it.id === params.id)
        if (found) {
          setItinerary(found)
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error)
      }
    }
    
    setLoading(false)
  }

  const checkIfFavorited = async () => {
    if (!user || !itinerary) return
    try {
      const { data } = await favorites.isFavorited(user.id, 'itinerary', itinerary.id)
      setIsFavorited(!!data)
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!user || !itinerary) {
      toast.error('Please sign in to save favorites')
      return
    }

    try {
      if (isFavorited) {
        await favorites.removeFavorite(user.id, 'itinerary', itinerary.id)
        setIsFavorited(false)
        toast.success('Removed from favorites')
      } else {
        await favorites.addFavorite(user.id, 'itinerary', itinerary.id)
        setIsFavorited(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      toast.error('Failed to update favorites')
    }
  }

  const shareItinerary = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Itinerary link copied to clipboard!')
  }

  const saveItinerary = async () => {
    if (!user || !itinerary) {
      toast.error('Please sign in to save itinerary')
      return
    }

    try {
      const itineraryData = {
        user_id: user.id,
        title: itinerary.title,
        destination: itinerary.destination,
        duration: itinerary.duration,
        start_date: itinerary.dates?.start || null,
        end_date: itinerary.dates?.end || null,
        budget: itinerary.price.total,
        travelers: itinerary.travelers,
        preferences: {},
        itinerary_data: itinerary,
        status: 'saved' as const
      }

      await itineraries.saveItinerary(itineraryData)
      toast.success('Itinerary saved to your account!')
    } catch (error) {
      toast.error('Failed to save itinerary')
    }
  }

  // David's exact animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const handleBookingSuccess = (bookingId: string) => {
    toast.success('Your trip has been successfully booked!')
    setBookingFlowOpen(false)
    // You could redirect to booking confirmation or dashboard
    // router.push(`/dashboard?booking=${bookingId}`)
  }

  const openBookingFlow = () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    setBookingFlowOpen(true)
  }

  const handleAuthSuccess = () => {
    setAuthModalOpen(false)
    // After successful auth, auto-open booking flow
    setTimeout(() => {
      setBookingFlowOpen(true)
    }, 500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-8 h-8 mx-auto mb-8">
            <div className="w-full h-full border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white/60 text-lg">Loading your journey...</p>
        </motion.div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-medium text-white mb-6">Itinerary not found</h2>
          <p className="text-white/60 mb-12 leading-relaxed">
            The itinerary you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            href="/results" 
            className="inline-flex items-center px-8 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all duration-300"
          >
            Back to Results
          </Link>
        </motion.div>
      </div>
    )
  }

  const activeDayData = itinerary.days.find(day => day.day === activeDay) || itinerary.days[0]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0f0f0f] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/results" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-colors ${
                isFavorited ? 'text-red-500' : 'text-white/60 hover:text-white'
              }`}
            >
              <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={shareItinerary}
              className="p-2 rounded-full text-white/60 hover:text-white transition-colors"
            >
              <Share2 size={20} />
            </button>
            <button className="p-2 rounded-full text-white/60 hover:text-white transition-colors">
              <Download size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <motion.section 
        className="relative pt-24 pb-20"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-medium text-white leading-tight"
            >
              {itinerary.title}
            </motion.h1>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-8 text-white/60"
            >
              <div className="flex items-center gap-3">
                <MapPin size={20} />
                <span>{itinerary.destination}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={20} />
                <span>{itinerary.duration}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users size={20} />
                <span>
                  {typeof itinerary.travelers === 'number' 
                    ? `${itinerary.travelers} travelers`
                    : `${itinerary.travelers.total} travelers`
                  }
                </span>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="text-4xl font-bold text-white"
            >
              RM {itinerary.price.total.toLocaleString()}
              <div className="text-lg font-normal text-white/60 mt-2">
                {typeof itinerary.travelers === 'number' 
                  ? `for ${itinerary.travelers} travelers`
                  : `for ${itinerary.travelers.adults} adults${itinerary.travelers.children > 0 ? `, ${itinerary.travelers.children} children` : ''}${itinerary.travelers.infants > 0 ? `, ${itinerary.travelers.infants} infants` : ''}`
                }
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div 
          className="grid lg:grid-cols-3 gap-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-20">
            {/* Enhanced Trip Overview with Real API Data */}
            <motion.section variants={fadeInUp}>
              {itinerary.api_powered || itinerary.real_time_data ? (
                <div>
                  <h2 className="text-3xl font-medium text-white mb-12">Enhanced Trip Overview</h2>
                  <EnhancedItineraryDisplay itinerary={itinerary} />
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-medium text-white mb-12">Trip Overview</h2>
                  
                  {/* Flight Details */}
              {itinerary.flightDetails && (
                <div className="mb-16">
                  <h3 className="text-xl font-medium text-white mb-8">Flight Details</h3>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Outbound Flight */}
                    <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10">
                      <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Plane size={20} className="text-blue-400" />
                        Outbound Flight
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-medium">{itinerary.flightDetails.outbound.airline}</div>
                            <div className="text-white/60 text-sm">{itinerary.flightDetails.outbound.flightNumber}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{itinerary.flightDetails.outbound.class}</div>
                            <div className="text-green-400 font-medium">RM {itinerary.flightDetails.outbound.price.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <div className="text-white font-medium">{itinerary.flightDetails.outbound.departure.time}</div>
                              <div className="text-white/60 text-sm">{itinerary.flightDetails.outbound.departure.airport}</div>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                              <div className="w-8 h-px bg-white/30"></div>
                              <span className="text-xs">{itinerary.flightDetails.outbound.duration}</span>
                              <div className="w-8 h-px bg-white/30"></div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-medium">{itinerary.flightDetails.outbound.arrival.time}</div>
                              <div className="text-white/60 text-sm">{itinerary.flightDetails.outbound.arrival.airport}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Return Flight */}
                    <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10">
                      <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Plane size={20} className="text-purple-400 rotate-180" />
                        Return Flight
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-medium">{itinerary.flightDetails.return.airline}</div>
                            <div className="text-white/60 text-sm">{itinerary.flightDetails.return.flightNumber}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{itinerary.flightDetails.return.class}</div>
                            <div className="text-green-400 font-medium">RM {itinerary.flightDetails.return.price.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <div className="text-white font-medium">{itinerary.flightDetails.return.departure.time}</div>
                              <div className="text-white/60 text-sm">{itinerary.flightDetails.return.departure.airport}</div>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                              <div className="w-8 h-px bg-white/30"></div>
                              <span className="text-xs">{itinerary.flightDetails.return.duration}</span>
                              <div className="w-8 h-px bg-white/30"></div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-medium">{itinerary.flightDetails.return.arrival.time}</div>
                              <div className="text-white/60 text-sm">{itinerary.flightDetails.return.arrival.airport}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Accommodation Details */}
              {itinerary.accommodationDetails && (
                <div className="mb-16">
                  <h3 className="text-xl font-medium text-white mb-8">Accommodation Details</h3>
                  {itinerary.accommodationDetails.hotels.map((hotel, idx) => (
                    <div key={idx} className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 mb-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-xl font-medium text-white mb-2">{hotel.name}</h4>
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-1">
                              {[...Array(hotel.rating)].map((_, i) => (
                                <Star key={i} size={16} className="text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="text-white/60">•</span>
                            <span className="text-white/60">{hotel.location}</span>
                          </div>
                          <div className="text-white/60 mb-4">{hotel.roomType}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">RM {hotel.pricePerNight.toLocaleString()}</div>
                          <div className="text-white/60 text-sm">per night</div>
                          <div className="text-green-400 font-medium mt-2">
                            Total: RM {hotel.totalPrice.toLocaleString()} ({hotel.totalNights} nights)
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-6">
                        <h5 className="text-white font-medium mb-4">Hotel Amenities</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {hotel.amenities.map((amenity, amenityIdx) => (
                            <div key={amenityIdx} className="flex items-center gap-2 text-white/60">
                              <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                              <span className="text-sm">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-6 mt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-white/60 text-sm">Check-in</div>
                            <div className="text-white font-medium">{new Date(hotel.checkIn).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-white/60 text-sm">Check-out</div>
                            <div className="text-white font-medium">{new Date(hotel.checkOut).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Breakdown */}
              {itinerary.price.breakdown && (
                <div className="mb-16">
                  <h3 className="text-xl font-medium text-white mb-8">Price Breakdown</h3>
                  <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Flight Tickets</span>
                        <span className="text-white font-medium">RM {itinerary.price.breakdown.flights.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Accommodation</span>
                        <span className="text-white font-medium">RM {itinerary.price.breakdown.accommodation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Meals & Dining</span>
                        <span className="text-white font-medium">RM {itinerary.price.breakdown.meals.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Activities & Tours</span>
                        <span className="text-white font-medium">RM {itinerary.price.breakdown.activities.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Local Transport</span>
                        <span className="text-white font-medium">RM {itinerary.price.breakdown.transport.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Travel Insurance</span>
                        <span className="text-white font-medium">RM {itinerary.price.breakdown.insurance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Taxes & Fees</span>
                        <span className="text-white font-medium">RM {itinerary.price.breakdown.taxes.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-white">Total Price</span>
                          <span className="text-2xl font-bold text-green-400">RM {itinerary.price.total.toLocaleString()}</span>
                        </div>
                        <div className="text-right text-white/60 text-sm mt-1">
                          RM {itinerary.price.perPerson.toLocaleString()} per person
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Travel Insurance */}
              {itinerary.insuranceDetails && (
                <div className="mb-16">
                  <h3 className="text-xl font-medium text-white mb-8">Travel Insurance</h3>
                  <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-lg font-medium text-white mb-2">{itinerary.insuranceDetails.provider}</h4>
                        <div className="text-green-400 font-medium">RM {itinerary.insuranceDetails.price.toLocaleString()}</div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-white font-medium mb-4">Coverage Includes</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {itinerary.insuranceDetails.coverage.map((coverage, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-white/60">
                            <CheckCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{coverage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
                </div>
              )}
            </motion.section>

            {/* Highlights */}
            <motion.section variants={fadeInUp}>
              <h2 className="text-3xl font-medium text-white mb-12">Trip Highlights</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {itinerary.highlights.map((highlight, idx) => (
                  <motion.div 
                    key={idx}
                    className="flex items-start gap-4 p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 backdrop-blur-sm group hover:border-white/20 transition-all duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star size={16} className="text-white/60" />
                    </div>
                    <span className="text-white/80 leading-relaxed">{highlight}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Day-by-Day Itinerary */}
            <motion.section variants={fadeInUp}>
              <h2 className="text-3xl font-medium text-white mb-12">Daily Itinerary</h2>
              
              {/* Day Selector */}
              <div className="flex flex-wrap gap-3 mb-12">
                {itinerary.days.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(day.day as number)}
                    className={`px-6 py-3 rounded-full border transition-all duration-300 ${
                      activeDay === day.day
                        ? 'bg-white text-black border-white'
                        : 'text-white/60 border-white/20 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>

              {/* Active Day Content */}
              <AnimatePresence mode="wait">
                {activeDayData && (
                  <motion.div
                    key={activeDay}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8"
                  >
                    <div className="text-center p-8 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10">
                      <h3 className="text-2xl font-medium text-white mb-2">
                        {activeDayData.title}
                      </h3>
                      {activeDayData.day !== '...' && (
                        <div className="text-white/60">Day {activeDayData.day} of your journey</div>
                      )}
                    </div>

                    {/* Detailed Schedule */}
                    {activeDayData.schedule && activeDayData.schedule.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xl font-medium text-white">Detailed Schedule</h4>
                          {activeDayData.dayTotal && (
                            <div className="text-right">
                              <div className="text-green-400 font-bold">RM {activeDayData.dayTotal}</div>
                              <div className="text-white/60 text-sm">day total</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {activeDayData.schedule.map((item, idx) => (
                            <div key={idx} className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-3">
                                    <div className="text-blue-400 font-mono font-bold text-xl">
                                      {item.time}
                                    </div>
                                    {(item as any).duration && (
                                      <div className="text-white/60 text-sm bg-white/10 px-3 py-1 rounded-full">
                                        {(item as any).duration}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      {item.type === 'meal' && <Utensils size={18} className="text-orange-400" />}
                                      {item.type === 'activity' && <Camera size={18} className="text-purple-400" />}
                                      {item.type === 'transport' && <Plane size={18} className="text-blue-400" />}
                                      {item.type === 'accommodation' && <Bed size={18} className="text-green-400" />}
                                      {item.type === 'shopping' && <div className="w-5 h-5 bg-pink-400 rounded-sm" />}
                                      {item.type === 'free time' && <Clock size={18} className="text-gray-400" />}
                                      <span className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${
                                        item.type === 'meal' ? 'bg-orange-400/20 text-orange-400' :
                                        item.type === 'activity' ? 'bg-purple-400/20 text-purple-400' :
                                        item.type === 'transport' ? 'bg-blue-400/20 text-blue-400' :
                                        item.type === 'accommodation' ? 'bg-green-400/20 text-green-400' :
                                        item.type === 'shopping' ? 'bg-pink-400/20 text-pink-400' :
                                        item.type === 'free time' ? 'bg-gray-400/20 text-gray-400' :
                                        'bg-white/20 text-white/60'
                                      }`}>
                                        {item.type}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-white font-medium mb-3 leading-relaxed">{item.activity}</div>
                                  
                                  {/* Enhanced Details Section */}
                                  {(item as any).details && (
                                    <div className="bg-white/5 rounded-lg p-4 mt-4 space-y-3">
                                      {(item as any).details.location && (
                                        <div className="flex items-start gap-3">
                                          <MapPin size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <div className="text-blue-400 font-medium text-sm">Location</div>
                                            <div className="text-white/80 text-sm">{(item as any).details.location}</div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {(item as any).details.contact && (
                                        <div className="flex items-start gap-3">
                                          <div className="w-4 h-4 bg-green-400 rounded-full mt-0.5 flex-shrink-0"></div>
                                          <div>
                                            <div className="text-green-400 font-medium text-sm">Contact</div>
                                            <div className="text-white/80 text-sm">{(item as any).details.contact}</div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {(item as any).details.tips && (
                                        <div className="flex items-start gap-3">
                                          <Star size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <div className="text-yellow-400 font-medium text-sm">Tips</div>
                                            <div className="text-white/80 text-sm">{(item as any).details.tips}</div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {(item as any).details.weatherCondition && (
                                        <div className="flex items-start gap-3">
                                          <div className="text-lg mt-0.5">🌤️</div>
                                          <div>
                                            <div className="text-cyan-400 font-medium text-sm">Weather</div>
                                            <div className="text-white/80 text-sm">{(item as any).details.weatherCondition}</div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {(item as any).details.menu && (
                                        <div className="flex items-start gap-3">
                                          <Utensils size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <div className="text-orange-400 font-medium text-sm">Menu Highlights</div>
                                            <div className="text-white/80 text-sm">
                                              {(item as any).details.menu.slice(0, 3).join(' • ')}
                                              {(item as any).details.menu.length > 3 && ` (+${(item as any).details.menu.length - 3} more)`}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {(item as any).details.amenities && (
                                        <div className="flex items-start gap-3">
                                          <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <div className="text-green-400 font-medium text-sm">Amenities</div>
                                            <div className="text-white/80 text-sm">
                                              {(item as any).details.amenities.slice(0, 3).join(' • ')}
                                              {(item as any).details.amenities.length > 3 && ` (+${(item as any).details.amenities.length - 3} more)`}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {(item as any).details.highlights && (
                                        <div className="flex items-start gap-3">
                                          <Camera size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <div className="text-purple-400 font-medium text-sm">Highlights</div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {(item as any).details.highlights.map((highlight, hIdx) => (
                                                <span key={hIdx} className="text-xs bg-purple-400/20 text-purple-400 px-2 py-1 rounded-full">
                                                  {highlight}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {(item as any).details.route && (
                                        <div className="flex items-start gap-3">
                                          <ArrowRight size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <div className="text-blue-400 font-medium text-sm">Route</div>
                                            <div className="text-white/80 text-sm">{(item as any).details.route}</div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {(item as any).details.dressCode && (
                                        <div className="flex items-start gap-3">
                                          <div className="text-lg mt-0.5">👔</div>
                                          <div>
                                            <div className="text-pink-400 font-medium text-sm">Dress Code</div>
                                            <div className="text-white/80 text-sm">{(item as any).details.dressCode}</div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  {item.cost > 0 ? (
                                    <div className="text-green-400 font-bold text-lg">RM {item.cost}</div>
                                  ) : (
                                    <div className="text-gray-500 font-medium">Free</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Day Highlights */}
                        {activeDayData.highlights && activeDayData.highlights.length > 0 && (
                          <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/20">
                            <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                              <Star size={16} className="text-yellow-400" />
                              Day Highlights
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                              {activeDayData.highlights.map((highlight, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-white/80">
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                                  <span className="text-sm">{highlight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Meals Summary */}
                        {activeDayData.meals && activeDayData.meals.length > 0 && (
                          <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
                            <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                              <Utensils size={16} className="text-orange-400" />
                              Dining Schedule
                            </h5>
                            <div className="space-y-3">
                              {activeDayData.meals.map((meal, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <div>
                                    <div className="text-white font-medium">{meal.name}</div>
                                    <div className="text-white/60 text-sm">{meal.time} • {meal.type}</div>
                                  </div>
                                  <div className="text-green-400 font-bold">RM {meal.cost}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Accommodation Info */}
                        <div className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl border border-green-500/20">
                          <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                            <Bed size={16} className="text-green-400" />
                            Accommodation
                          </h5>
                          <div className="text-white/80">{activeDayData.accommodation}</div>
                        </div>
                      </div>
                    ) : (
                      // Fallback to old format if no detailed schedule
                      <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                          <h4 className="text-white font-medium flex items-center gap-3">
                            <Camera size={20} className="text-white/60" />
                            Activities
                          </h4>
                          <div className="space-y-3">
                            {activeDayData.activities?.map((activity, idx) => (
                              <div key={idx} className="flex items-start gap-3 text-white/60">
                                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="leading-relaxed">{activity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-white font-medium flex items-center gap-3">
                            <Utensils size={20} className="text-white/60" />
                            Meals
                          </h4>
                          <div className="space-y-3">
                            {activeDayData.meals?.map((meal, idx) => (
                              <div key={idx} className="flex items-start gap-3 text-white/60">
                                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="leading-relaxed">{typeof meal === 'string' ? meal : meal.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-white font-medium flex items-center gap-3">
                            <Bed size={20} className="text-white/60" />
                            Accommodation
                          </h4>
                          <div className="flex items-start gap-3 text-white/60">
                            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">{activeDayData.accommodation}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Booking Card */}
            <motion.div 
              variants={fadeInUp}
              className="sticky top-32 p-8 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 backdrop-blur-sm"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    RM {itinerary.price.total.toLocaleString()}
                  </div>
                  <div className="text-white/60">Total for your trip</div>
                </div>

                {/* Airlines Info */}
                {itinerary.airlines && (
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Plane size={16} />
                      Flight Options
                    </h4>
                    <div className="space-y-3">
                      {itinerary.airlines.recommendations.slice(0, 2).map((airline, idx) => (
                        <div key={idx} className="p-4 bg-white/5 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-white font-medium text-sm">{airline.name}</div>
                            <div className="text-white/60 text-xs">{airline.estimatedPrice}</div>
                          </div>
                          <div className="text-white/60 text-xs mb-2">{airline.route}</div>
                          <div className="text-white/60 text-xs">
                            {airline.features.slice(0, 2).join(' • ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <button 
                    onClick={openBookingFlow}
                    disabled={authLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-full font-medium hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Plane size={20} />
                    {authLoading ? 'Loading...' : 'Book This Trip'}
                  </button>
                  <button 
                    onClick={saveItinerary}
                    className="w-full bg-white/10 text-white py-4 rounded-full font-medium border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    Save to Dashboard
                  </button>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Free cancellation up to 24 hours</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Best price guarantee</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Booking Flow Modal */}
      {itinerary && (
        <BookingFlow
          itinerary={itinerary}
          isOpen={bookingFlowOpen}
          onClose={() => setBookingFlowOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
      
      {/* Auth Debugger - only shows in development */}
      <AuthDebugger />
    </div>
  )
}