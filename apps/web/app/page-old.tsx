'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  Star,
  TrendingUp,
  Globe,
  Shield,
  Heart,
  Menu,
  X,
  ArrowRight,
  Play
} from 'lucide-react'
import DestinationAutocomplete from '../components/DestinationAutocomplete'
import { DestinationResult } from '../lib/hooks/useDestinationSearch'
import TravelAssistantButton from '../components/TravelAssistantButton'
import Link from 'next/link'
import { useAuth } from '../components/providers/AuthProvider'
import AuthModal from '../components/auth/AuthModal'
import UserMenu from '../components/auth/UserMenu'
import HeroCarousel from '../components/HeroCarousel'
import DestinationCard from '../components/DestinationCard'
import APIStatusBanner from '../components/APIStatusBanner'
import { ProviderBadges } from '../components/ProviderBadge'

export default function HomePage() {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, -50])

  // Scroll reveal animations - exactly like David's site
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

  // Smooth scroll to sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
      setIsMenuOpen(false)
    }
  }

  // Form state for the AI planning
  const [formData, setFormData] = useState({
    destination: '',
    departureCountry: 'Malaysia',
    budget: 5000,
    travelers: 2,
    duration: '1-week',
    startDate: '',
    endDate: '',
    style: 'comfort',
    accommodation: 'hotel',
    interests: [] as string[],
    travelType: 'leisure',
    groupType: 'couple',
    dietaryReqs: [],
    specialRequests: '',
    letAISuggest: false
  })

  const handleGenerateItinerary = async () => {
    // Navigate to results with form data
    const params = new URLSearchParams({
      destination: formData.letAISuggest ? 'AI-SUGGEST' : formData.destination,
      departureCountry: formData.departureCountry,
      budget: formData.budget.toString(),
      travelers: formData.travelers.toString(),
      duration: formData.duration,
      startDate: formData.startDate,
      endDate: formData.endDate,
      style: formData.style,
      accommodation: formData.accommodation,
      interests: formData.interests.join(','),
      travelType: formData.travelType,
      groupType: formData.groupType,
      dietaryReqs: formData.dietaryReqs.join(','),
      specialRequests: formData.specialRequests,
      letAISuggest: formData.letAISuggest.toString()
    })
    window.location.href = `/results?${params}`
  }

  const handleAISuggestToggle = () => {
    setFormData(prev => ({
      ...prev,
      letAISuggest: !prev.letAISuggest,
      destination: !prev.letAISuggest ? '' : prev.destination // Clear destination when enabling AI suggest
    }))
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const toggleDietaryReq = (req: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryReqs: prev.dietaryReqs.includes(req)
        ? prev.dietaryReqs.filter(r => r !== req)
        : [...prev.dietaryReqs, req]
    }))
  }

  return (
    <div className="bg-[#0f0f0f] text-white">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />

      {/* Navigation - Minimalist like David's */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Holiday AI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['home', 'features', 'how-it-works'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeSection === item 
                      ? 'text-blue-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 bg-gray-800 rounded-full animate-pulse"></div>
              ) : (
                <UserMenu 
                  user={user} 
                  onAuthClick={() => setShowAuthModal(true)} 
                />
              )}
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-white/10"
            >
              {['home', 'features', 'how-it-works'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="block w-full text-left py-2 text-gray-400 hover:text-white transition-colors"
                >
                  {item.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* API Status Banner */}
      <div className="pt-20 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <APIStatusBanner compact={true} className="mb-4" />
        </div>
      </div>

      {/* Hero Section - David's centered approach */}
      <section id="home" className="min-h-screen flex items-center justify-center px-6 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Hero Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-400 font-medium">AI-Powered Travel Planning</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-white">Plan Your Perfect</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Adventure
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Let our AI create personalized travel itineraries that match your style, budget, and dreams. 
              From hidden gems to must-see destinations.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => scrollToSection('planner')}
                className="group bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
                <span className="font-medium">Watch Demo</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeInUp} className="flex items-center justify-center space-x-12 pt-12">
              {[
                { number: '10K+', label: 'Happy Travelers' },
                { number: '200+', label: 'Destinations' },
                { number: '24/7', label: 'AI Support' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/60 rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* AI Travel Planner Section */}
      <section id="planner" className="py-24 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-white">AI Travel</span>
              <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text"> Planner</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-2xl mx-auto">
              Tell us your preferences and let our AI craft the perfect itinerary for you
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-12"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Enhanced Form */}
              <div className="space-y-8">
                {/* Destination & Travel Dates */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-white">Where do you want to go?</label>
                    
                    {/* Toggle between Manual Input and AI Suggestion */}
                    <div className="flex items-center gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, letAISuggest: false})}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          !formData.letAISuggest
                            ? 'bg-blue-500 text-white border border-blue-500'
                            : 'bg-black/30 text-gray-300 border border-white/10 hover:border-blue-500/50'
                        }`}
                      >
                        I have a destination
                      </button>
                      <button
                        type="button"
                        onClick={handleAISuggestToggle}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                          formData.letAISuggest
                            ? 'bg-purple-500 text-white border border-purple-500'
                            : 'bg-black/30 text-gray-300 border border-white/10 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-400 to-pink-400"></div>
                        Let AI suggest
                      </button>
                    </div>

                    {/* Conditional Input Field */}
                    {!formData.letAISuggest ? (
                      <DestinationAutocomplete
                        value={formData.destination}
                        onChange={(value: string, destination?: DestinationResult) => {
                          setFormData({...formData, destination: value})
                        }}
                        placeholder="e.g., Tokyo, Paris, New York..."
                        searchOptions={{
                          origin: formData.departureCountry || 'KUL',
                          budget: parseInt(formData.budget) || 5000,
                          currency: 'MYR',
                          departureDate: formData.departureDate,
                          returnDate: formData.returnDate
                        }}
                      />
                    ) : (
                      <div className="w-full px-4 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl text-purple-200 flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></div>
                        <span className="font-medium">AI will analyze your preferences and suggest perfect destinations for you</span>
                      </div>
                    )}
                  </div>

                  {/* Departure Country */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">Travelling from</label>
                    <select
                      value={formData.departureCountry}
                      onChange={(e) => setFormData({...formData, departureCountry: e.target.value})}
                      className="w-full px-4 py-4 bg-black/30 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="Malaysia" className="bg-gray-800">🇲🇾 Malaysia</option>
                      <option value="Singapore" className="bg-gray-800">🇸🇬 Singapore</option>
                      <option value="Thailand" className="bg-gray-800">🇹🇭 Thailand</option>
                      <option value="Indonesia" className="bg-gray-800">🇮🇩 Indonesia</option>
                      <option value="Philippines" className="bg-gray-800">🇵🇭 Philippines</option>
                      <option value="Vietnam" className="bg-gray-800">🇻🇳 Vietnam</option>
                      <option value="India" className="bg-gray-800">🇮🇳 India</option>
                      <option value="China" className="bg-gray-800">🇨🇳 China</option>
                      <option value="Hong Kong" className="bg-gray-800">🇭🇰 Hong Kong</option>
                      <option value="Taiwan" className="bg-gray-800">🇹🇼 Taiwan</option>
                      <option value="South Korea" className="bg-gray-800">🇰🇷 South Korea</option>
                      <option value="Japan" className="bg-gray-800">🇯🇵 Japan</option>
                      <option value="Australia" className="bg-gray-800">🇦🇺 Australia</option>
                      <option value="New Zealand" className="bg-gray-800">🇳🇿 New Zealand</option>
                      <option value="United Kingdom" className="bg-gray-800">🇬🇧 United Kingdom</option>
                      <option value="United States" className="bg-gray-800">🇺🇸 United States</option>
                      <option value="Canada" className="bg-gray-800">🇨🇦 Canada</option>
                      <option value="Germany" className="bg-gray-800">🇩🇪 Germany</option>
                      <option value="France" className="bg-gray-800">🇫🇷 France</option>
                      <option value="Netherlands" className="bg-gray-800">🇳🇱 Netherlands</option>
                      <option value="UAE" className="bg-gray-800">🇦🇪 UAE</option>
                      <option value="Saudi Arabia" className="bg-gray-800">🇸🇦 Saudi Arabia</option>
                      <option value="Other" className="bg-gray-800">🌍 Other Country</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-white">Departure Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full px-4 py-4 bg-black/30 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-white">Return Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full px-4 py-4 bg-black/30 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Budget & Travelers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">Budget (MYR)</label>
                    <div className="relative">
                      <input
                        type="range"
                        min="2000"
                        max="20000"
                        step="1000"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(formData.budget - 2000) / (20000 - 2000) * 100}%, #374151 ${(formData.budget - 2000) / (20000 - 2000) * 100}%, #374151 100%)`
                        }}
                      />
                      <div className="mt-2 text-center">
                        <span className="text-xl font-bold text-blue-400">RM {formData.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">Number of Travelers</label>
                    <select
                      value={formData.travelers}
                      onChange={(e) => setFormData({...formData, travelers: parseInt(e.target.value)})}
                      className="w-full px-4 py-4 bg-black/30 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value={1} className="bg-gray-800">1 person</option>
                      <option value={2} className="bg-gray-800">2 people</option>
                      <option value={3} className="bg-gray-800">3-4 people</option>
                      <option value={5} className="bg-gray-800">5+ people</option>
                    </select>
                  </div>
                </div>

                {/* Travel Preferences */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">Travel Type</label>
                    <select
                      value={formData.travelType}
                      onChange={(e) => setFormData({...formData, travelType: e.target.value})}
                      className="w-full px-4 py-4 bg-black/30 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="leisure" className="bg-gray-800">Leisure</option>
                      <option value="adventure" className="bg-gray-800">Adventure</option>
                      <option value="cultural" className="bg-gray-800">Cultural</option>
                      <option value="relaxation" className="bg-gray-800">Relaxation</option>
                      <option value="business" className="bg-gray-800">Business</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">Group Type</label>
                    <select
                      value={formData.groupType}
                      onChange={(e) => setFormData({...formData, groupType: e.target.value})}
                      className="w-full px-4 py-4 bg-black/30 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="solo" className="bg-gray-800">Solo Travel</option>
                      <option value="couple" className="bg-gray-800">Couple</option>
                      <option value="family" className="bg-gray-800">Family</option>
                      <option value="friends" className="bg-gray-800">Friends</option>
                      <option value="business" className="bg-gray-800">Business Group</option>
                    </select>
                  </div>
                </div>

                {/* Travel Style & Accommodation */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">Travel Style</label>
                    <select
                      value={formData.style}
                      onChange={(e) => setFormData({...formData, style: e.target.value})}
                      className="w-full px-4 py-4 bg-black/30 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="budget" className="bg-gray-800">Budget</option>
                      <option value="comfort" className="bg-gray-800">Comfort</option>
                      <option value="luxury" className="bg-gray-800">Luxury</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">Accommodation</label>
                    <select
                      value={formData.accommodation}
                      onChange={(e) => setFormData({...formData, accommodation: e.target.value})}
                      className="w-full px-4 py-4 bg-black/30 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="hotel" className="bg-gray-800">Hotel</option>
                      <option value="resort" className="bg-gray-800">Resort</option>
                      <option value="boutique" className="bg-gray-800">Boutique Hotel</option>
                      <option value="airbnb" className="bg-gray-800">Airbnb/Vacation Rental</option>
                      <option value="hostel" className="bg-gray-800">Hostel</option>
                    </select>
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">Your Interests</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Culture & History', 'Food & Cuisine', 'Nature & Outdoors', 'Shopping', 'Nightlife', 'Art & Museums', 'Adventure Sports', 'Religious Sites'].map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          formData.interests.includes(interest)
                            ? 'bg-blue-500 text-white border border-blue-500'
                            : 'bg-black/30 text-gray-300 border border-white/10 hover:border-blue-500/50'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Requirements */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">Dietary Requirements</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Halal', 'Vegetarian', 'Vegan', 'No Dietary Restrictions'].map((req) => (
                      <button
                        key={req}
                        type="button"
                        onClick={() => toggleDietaryReq(req)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          formData.dietaryReqs.includes(req)
                            ? 'bg-green-500 text-white border border-green-500'
                            : 'bg-black/30 text-gray-300 border border-white/10 hover:border-green-500/50'
                        }`}
                      >
                        {req}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">Special Requests (Optional)</label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                    placeholder="Any specific preferences, accessibility needs, or special occasions..."
                    rows={3}
                    className="w-full px-4 py-4 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerateItinerary}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
                >
                  <span>Generate AI Itinerary</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Enhanced Preview */}
              <div className="lg:pl-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
                  <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8 h-fit sticky top-8">
                    <h3 className="text-2xl font-bold mb-6 text-center">AI Preview</h3>
                    
                    {formData.destination || formData.letAISuggest || formData.startDate || formData.interests.length > 0 ? (
                      <div className="space-y-4">
                        {formData.letAISuggest ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 rounded bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse flex-shrink-0"></div>
                              <span className="text-purple-300 font-medium">AI will suggest destinations</span>
                            </div>
                            {formData.interests.length > 0 && (
                              <div className="text-xs text-purple-400 ml-8">
                                Based on your interests: {formData.interests.slice(0, 2).join(', ')}
                                {formData.interests.length > 2 && ` +${formData.interests.length - 2} more`}
                              </div>
                            )}
                          </div>
                        ) : formData.destination ? (
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-300">{formData.destination}</span>
                          </div>
                        ) : null}
                        
                        {(formData.startDate || formData.endDate) && (
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0" />
                            <span className="text-gray-300">
                              {formData.startDate && formData.endDate 
                                ? `${formData.startDate} to ${formData.endDate}`
                                : formData.startDate || formData.endDate
                              }
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">
                            {formData.travelers} {formData.travelers === 1 ? 'traveler' : 'travelers'} • {formData.groupType}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Plane className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <span className="text-gray-300">
                            Departing from {formData.departureCountry}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                          <span className="text-gray-300">{formData.style} • {formData.travelType}</span>
                        </div>

                        {formData.accommodation !== 'hotel' && (
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                              <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
                            </div>
                            <span className="text-gray-300">{formData.accommodation} accommodation</span>
                          </div>
                        )}

                        {formData.interests.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm text-gray-400">Interests:</div>
                            <div className="flex flex-wrap gap-2">
                              {formData.interests.slice(0, 3).map((interest, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs">
                                  {interest}
                                </span>
                              ))}
                              {formData.interests.length > 3 && (
                                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-lg text-xs">
                                  +{formData.interests.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {formData.dietaryReqs.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm text-gray-400">Dietary:</div>
                            <div className="flex flex-wrap gap-2">
                              {formData.dietaryReqs.map((req, index) => (
                                <span key={index} className="px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs">
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-4 border-t border-white/10">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">RM {formData.budget.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">total budget</div>
                          </div>
                        </div>

                        {formData.specialRequests && (
                          <div className="pt-4 border-t border-white/10">
                            <div className="text-sm text-gray-400 mb-2">Special Requests:</div>
                            <div className="text-xs text-gray-300 bg-black/30 rounded-lg p-3 max-h-20 overflow-y-auto">
                              {formData.specialRequests}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                          <Globe className="w-8 h-8" />
                        </div>
                        <p>Start filling the form to see AI preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 sm:px-8 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-6">
              Why Choose <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">Holiday AI?</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-2xl mx-auto">
              Intelligent travel planning that understands your unique preferences and creates unforgettable experiences
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Globe,
                title: "AI-Powered Recommendations",
                description: "Our advanced AI analyzes millions of travel data points to suggest perfect destinations tailored to your preferences and budget.",
                color: "from-blue-500 to-cyan-500",
                providers: ['openai', 'amadeus']
              },
              {
                icon: Shield,
                title: "Halal & Family Friendly",
                description: "Specialized filters for halal dining, prayer facilities, and family-friendly activities that respect your values and lifestyle.",
                color: "from-green-500 to-emerald-500",
                providers: ['google_places', 'google_maps']
              },
              {
                icon: Heart,
                title: "Personalized Experiences",
                description: "Every itinerary is uniquely crafted based on your travel style, interests, and the memories you want to create.",
                color: "from-purple-500 to-pink-500",
                providers: ['amadeus', 'google_places', 'openweather']
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:scale-105 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-4">{feature.description}</p>

                {/* Provider Badges */}
                {feature.providers && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-gray-500 mb-2">Powered by:</div>
                    <ProviderBadges providers={feature.providers as any} size="sm" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Destinations Carousel Section */}
      <section className="py-20 px-6 sm:px-8 bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-12"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Explore <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">Dream Destinations</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Discover breathtaking locations handpicked for your next adventure
              </p>
            </motion.div>

            <HeroCarousel />
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations Grid */}
      <section className="py-20 px-6 sm:px-8 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Trending <span className="text-transparent bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text">Destinations</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Most popular travel spots loved by our community
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <DestinationCard
                name="Paris"
                country="France"
                image="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80"
                rating={4.8}
                reviews={2847}
                price="RM 4,200"
                trending={true}
                delay={0}
              />
              <DestinationCard
                name="Iceland"
                country="Northern Europe"
                image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
                rating={4.9}
                reviews={1923}
                price="RM 6,800"
                trending={true}
                delay={0.1}
              />
              <DestinationCard
                name="Bora Bora"
                country="French Polynesia"
                image="https://images.unsplash.com/photo-1589197331516-cdd1d3f261a6?w=800&q=80"
                rating={4.9}
                reviews={3214}
                price="RM 8,500"
                delay={0.2}
              />
              <DestinationCard
                name="Kyoto"
                country="Japan"
                image="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80"
                rating={4.7}
                reviews={2156}
                price="RM 4,800"
                delay={0.3}
              />
              <DestinationCard
                name="Machu Picchu"
                country="Peru"
                image="https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80"
                rating={4.8}
                reviews={1678}
                price="RM 5,900"
                delay={0.4}
              />
              <DestinationCard
                name="Amalfi Coast"
                country="Italy"
                image="https://images.unsplash.com/photo-1534113414509-0bd0019d00ec?w=800&q=80"
                rating={4.6}
                reviews={2891}
                price="RM 5,200"
                delay={0.5}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 sm:px-8 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-6">
              How It <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">Works</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three simple steps to your perfect travel experience
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-12"
          >
            {[
              {
                step: "01",
                title: "Tell Us Your Dreams",
                description: "Share your destination preferences, budget, travel style, and what makes you happy when traveling."
              },
              {
                step: "02", 
                title: "AI Creates Magic",
                description: "Our AI analyzes your preferences against millions of travel data points to craft personalized itineraries."
              },
              {
                step: "03",
                title: "Experience Paradise",
                description: "Get detailed itineraries with bookings, local recommendations, and 24/7 support throughout your journey."
              }
            ].map((step, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">{step.step}</span>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent transform -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-16 px-6 sm:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">Holiday AI</span>
          </div>
          
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Transforming the way you plan and experience travel with the power of artificial intelligence.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <span>© 2024 Holiday AI. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
      
      {/* Travel Assistant Chat Button */}
      <TravelAssistantButton 
        initialContext={{
          current_trip: {
            destination: formData.destination,
            departure_date: formData.startDate,
            return_date: formData.endDate,
            travelers: parseInt(formData.travelers),
            budget: parseInt(formData.budget),
            interests: formData.interests
          }
        }}
      />
    </div>
  )
}