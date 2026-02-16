'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRequireAuth } from '../../components/providers/AuthProvider'
import { 
  Plane, 
  Calendar, 
  Heart, 
  Settings, 
  Plus,
  MapPin,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  user: {
    id: string
    email: string
    full_name: string
    avatar_url: string | null
  }
  stats: {
    total_itineraries: number
    total_bookings: number
    total_reviews: number
    total_favorites: number
    completed_trips: number
    total_spent: number
  }
  recentItineraries: any[]
  recentBookings: any[]
  quickActions: any[]
}

export default function DashboardPage() {
  const { user, loading } = useRequireAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0.8])
  const heroScale = useTransform(scrollY, [0, 200], [1, 0.98])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

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

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/user/dashboard')
      const data = await response.json()
      
      if (data.success) {
        setDashboardData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
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
          <p className="text-white/60 text-lg">Loading your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-medium text-white mb-6">Failed to load dashboard</h2>
          <p className="text-white/60 mb-12 leading-relaxed">
            Unable to fetch your dashboard data. Please try again.
          </p>
          <button 
            onClick={fetchDashboardData}
            className="inline-flex items-center px-8 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all duration-300"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0f0f0f] overflow-x-hidden">
      {/* Hero Section */}
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
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center gap-6 mb-8"
            >
              {dashboardData.user.avatar_url ? (
                <img
                  src={dashboardData.user.avatar_url}
                  alt={dashboardData.user.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white text-xl font-medium">
                  {dashboardData.user.full_name?.[0] || dashboardData.user.email[0]}
                </div>
              )}
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-medium text-white leading-tight"
            >
              Welcome back, {dashboardData.user.full_name?.split(' ')[0] || 'Traveler'}
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto"
            >
              Ready to plan your next adventure? Your travel dashboard awaits.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="pt-8"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full hover:bg-white/90 transition-all duration-300 font-medium"
              >
                <Plus size={20} />
                Plan New Trip
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="space-y-20"
        >
          {/* Stats Grid */}
          <motion.section variants={fadeInUp}>
            <h2 className="text-3xl font-medium text-white mb-12 text-center">Your Travel Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div 
                className="p-8 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 backdrop-blur-sm text-center group hover:border-white/20 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane size={24} className="text-white/60" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{dashboardData.stats.total_itineraries}</div>
                <div className="text-white/60 text-sm">Total Trips</div>
              </motion.div>

              <motion.div 
                className="p-8 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 backdrop-blur-sm text-center group hover:border-white/20 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-white/60" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{dashboardData.stats.total_bookings}</div>
                <div className="text-white/60 text-sm">Bookings</div>
              </motion.div>

              <motion.div 
                className="p-8 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 backdrop-blur-sm text-center group hover:border-white/20 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart size={24} className="text-white/60" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{dashboardData.stats.total_favorites}</div>
                <div className="text-white/60 text-sm">Favorites</div>
              </motion.div>

              <motion.div 
                className="p-8 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 backdrop-blur-sm text-center group hover:border-white/20 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign size={24} className="text-white/60" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">RM {dashboardData.stats.total_spent.toLocaleString()}</div>
                <div className="text-white/60 text-sm">Total Spent</div>
              </motion.div>
            </div>
          </motion.section>

          {/* Recent Activity */}
          <motion.section variants={fadeInUp}>
            <h2 className="text-3xl font-medium text-white mb-12">Recent Activity</h2>
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Recent Itineraries */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium text-white">Recent Itineraries</h3>
                  <Link href="/itineraries" className="text-white/60 hover:text-white transition-colors text-sm">
                    View all →
                  </Link>
                </div>
                
                {dashboardData.recentItineraries.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentItineraries.map((itinerary, index) => (
                      <motion.div 
                        key={index}
                        className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 backdrop-blur-sm group hover:border-white/20 transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                              <MapPin size={16} className="text-white/60" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{itinerary.title}</h4>
                              <p className="text-white/60 text-sm">{itinerary.destination} • {itinerary.duration}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">RM {itinerary.budget.toLocaleString()}</div>
                            <div className="text-white/60 text-sm">
                              {typeof itinerary.travelers === 'number' 
                                ? `${itinerary.travelers} travelers`
                                : `${itinerary.travelers.total} travelers`
                              }
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin size={32} className="text-white/60" />
                    </div>
                    <p className="text-white/60 mb-2">No itineraries yet</p>
                    <p className="text-white/40 text-sm">Start planning your first trip!</p>
                  </div>
                )}
              </div>

              {/* Recent Bookings */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium text-white">Recent Bookings</h3>
                  <Link href="/bookings" className="text-white/60 hover:text-white transition-colors text-sm">
                    View all →
                  </Link>
                </div>
                
                {dashboardData.recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentBookings.map((booking, index) => (
                      <motion.div 
                        key={index}
                        className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 backdrop-blur-sm group hover:border-white/20 transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                              <Calendar size={16} className="text-white/60" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{booking.itineraries?.title}</h4>
                              <p className="text-white/60 text-sm">{booking.booking_reference}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">RM {booking.total_amount.toLocaleString()}</div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                              booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar size={32} className="text-white/60" />
                    </div>
                    <p className="text-white/60 mb-2">No bookings yet</p>
                    <p className="text-white/40 text-sm">Book your first trip to see it here!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  )
}