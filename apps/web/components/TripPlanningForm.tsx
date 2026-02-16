'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Sparkles,
  Shield,
  Baby,
  Star,
  Crown,
  MessageSquare,
  Hotel,
  Map,
  Plane
} from 'lucide-react'

interface TripPreferences {
  destination: string
  startDate: string
  endDate: string
  passengers: number
  budget: number
  travelStyle: string[]
  halal: boolean
  kids: boolean
  luxury: boolean
  nature: boolean
  city: boolean
  culture: boolean
  adventure: boolean
  relaxation: boolean
  specialRequirements: string[]
  activities: string[]
  accommodationTypes: string[]
  transportationPreferences: string[]
  additionalNotes: string
}

export default function TripPlanningForm() {
  const [preferences, setPreferences] = useState<TripPreferences>({
    destination: '',
    startDate: '',
    endDate: '',
    passengers: 2,
    budget: 5000,
    travelStyle: [],
    halal: false,
    kids: false,
    luxury: false,
    nature: false,
    city: false,
    culture: false,
    adventure: false,
    relaxation: false,
    specialRequirements: [],
    activities: [],
    accommodationTypes: [],
    transportationPreferences: [],
    additionalNotes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof TripPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTravelStyleChange = (style: string) => {
    setPreferences(prev => ({
      ...prev,
      travelStyle: prev.travelStyle.includes(style)
        ? prev.travelStyle.filter(s => s !== style)
        : [...prev.travelStyle, style]
    }))
  }

  const handleSpecialRequirementChange = (requirement: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      specialRequirements: checked
        ? [...prev.specialRequirements, requirement]
        : prev.specialRequirements.filter(r => r !== requirement)
    }))
  }

  const handleActivityChange = (activity: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      activities: checked
        ? [...prev.activities, activity]
        : prev.activities.filter(a => a !== activity)
    }))
  }

  const handleAccommodationChange = (type: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      accommodationTypes: checked
        ? [...prev.accommodationTypes, type]
        : prev.accommodationTypes.filter(t => t !== type)
    }))
  }

  const handleTransportationChange = (transport: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      transportationPreferences: checked
        ? [...prev.transportationPreferences, transport]
        : prev.transportationPreferences.filter(t => t !== transport)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare data for AI orchestrator (matching backend schema)
      const requestData = {
        origin: "KUL", // Default from Kuala Lumpur
        destination: preferences.destination,
        start_date: preferences.startDate,  // Using start_date (backend expects this)
        end_date: preferences.endDate,      // Using end_date (backend expects this)
        passengers: preferences.passengers,  // Using passengers (backend expects this)
        budget_per_person: preferences.budget / preferences.passengers, // Calculate per person
        travel_style: preferences.travelStyle.length > 0 ? preferences.travelStyle[0] : 'comfort',
        preferences: {
          halal_friendly: preferences.halal,
          family_friendly: preferences.kids,
          luxury_experience: preferences.luxury,
          nature_outdoors: preferences.nature,
          city_life: preferences.city,
          culture_history: preferences.culture,
          adventure_sports: preferences.adventure,
          wellness_spa: preferences.relaxation
        },
        special_requirements: {
          wheelchair_accessible: false,
          dietary_restrictions: [],
          language_preference: "en",
          prayer_room: preferences.halal,
          quiet_environment: false
        }
      }

      console.log('Submitting to AI orchestrator:', requestData)
      
      // Call our AI-powered backend using Next.js API proxy
      const apiUrl = '/api/planning/create'
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const itinerary = await response.json()
      console.log('AI-generated itinerary:', itinerary)
      
      // TODO: Redirect to results page with itinerary data
      alert(`Trip plan created successfully! You have ${itinerary.options.length} options to choose from.`)
      
      // Store itinerary in localStorage for results page
      localStorage.setItem('currentItinerary', JSON.stringify(itinerary))
      
      // Redirect to results page
      window.location.href = `/results/${itinerary.request_id}`
      
    } catch (error) {
      console.error('Failed to create trip plan:', error)
      alert('Failed to create trip plan. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateNights = () => {
    if (!preferences.startDate || !preferences.endDate) return 0
    const start = new Date(preferences.startDate)
    const end = new Date(preferences.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-travel p-8"
      >
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Tell Us About Your Dream Trip
          </h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our AI needs to understand your preferences, style, and dreams to create the perfect itinerary. 
            The more details you provide, the better your recommendations will be!
          </p>
          
          {/* Progress Indicator */}
          <div className="mt-8 flex justify-center">
            <div className="bg-gray-200 rounded-full p-1">
              <div className="bg-primary-600 h-2 w-16 rounded-full transition-all duration-300"></div>
            </div>
            <span className="ml-3 text-sm text-gray-600">Step 1 of 4</span>
          </div>
        </div>

        {/* Information Gathering Sections */}
        <div className="space-y-12">
          {/* Section 1: Basic Details */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Basic Trip Details</h4>
                <p className="text-gray-600">Let's start with the fundamentals of your journey</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Destination */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  <MapPin className="h-5 w-5 inline mr-2 text-blue-600" />
                  Where do you want to go?
                </label>
                <input
                  type="text"
                  value={preferences.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder="e.g., Tokyo, Japan or Anywhere"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg placeholder-gray-400"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">Be specific for better recommendations, or let us surprise you!</p>
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  <Users className="h-5 w-5 inline mr-2 text-blue-600" />
                  Who's traveling with you?
                </label>
                <select
                  value={preferences.passengers}
                  onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">This helps us find the right accommodation and activities</p>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  <Calendar className="h-5 w-5 inline mr-2 text-blue-600" />
                  When do you want to start?
                </label>
                <input
                  type="date"
                  value={preferences.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">Consider weather, events, and peak seasons</p>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  <Calendar className="h-5 w-5 inline mr-2 text-blue-600" />
                  When do you want to return?
                </label>
                <input
                  type="date"
                  value={preferences.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={preferences.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">Longer trips get better deals and more options</p>
              </div>
            </div>

            {/* Trip Duration Summary */}
            {preferences.startDate && preferences.endDate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-center text-white"
              >
                <p className="text-xl font-bold mb-2">
                  🎉 {calculateNights()} nights of adventure await!
                </p>
                <p className="text-blue-100">
                  Perfect duration for exploring {preferences.destination || 'your destination'}!
                </p>
              </motion.div>
            )}
          </div>

          {/* Section 2: Budget & Style */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Budget & Travel Style</h4>
                <p className="text-gray-600">Help us understand your comfort level and spending preferences</p>
              </div>
            </div>

            {/* Budget Range */}
            <div className="mb-8">
              <label className="block text-xl font-semibold text-gray-700 mb-4">
                <DollarSign className="h-6 w-6 inline mr-3 text-green-600" />
                What's your budget per person for this trip?
              </label>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-gray-600">Your Budget</span>
                  <span className="text-3xl font-bold text-green-600">
                    {formatCurrency(preferences.budget)}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="500"
                    value={preferences.budget}
                    onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                    className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="absolute -top-2 left-0 right-0 flex justify-between text-sm text-gray-500">
                    <span>RM 1,000</span>
                    <span>RM 50,000</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="text-sm">
                    <div className="w-3 h-3 bg-red-400 rounded-full mx-auto mb-1"></div>
                    <span className="text-gray-600">Budget</span>
                  </div>
                  <div className="text-sm">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mx-auto mb-1"></div>
                    <span className="text-gray-600">Comfort</span>
                  </div>
                  <div className="text-sm">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mx-auto mb-1"></div>
                    <span className="text-gray-600">Premium</span>
                  </div>
                  <div className="text-sm">
                    <div className="w-3 h-3 bg-purple-400 rounded-full mx-auto mb-1"></div>
                    <span className="text-gray-600">Luxury</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                <Star className="h-5 w-5 inline mr-2 text-green-600" />
                What's your travel style? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { name: 'Budget', icon: DollarSign, description: 'Value for money' },
                  { name: 'Comfort', icon: Star, description: 'Quality & convenience' },
                  { name: 'Luxury', icon: Crown, description: 'Premium experiences' },
                  { name: 'Adventure', icon: Map, description: 'Thrilling activities' },
                  { name: 'Relaxation', icon: Hotel, description: 'Peaceful retreats' }
                ].map((style) => (
                  <button
                    key={style.name}
                    type="button"
                    onClick={() => handleTravelStyleChange(style.name)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-center group ${
                      preferences.travelStyle?.includes(style.name)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <style.icon className="h-8 w-8 mx-auto mb-2 text-gray-400 group-hover:text-green-600 transition-colors duration-300" />
                    <div className="text-sm font-semibold">{style.name}</div>
                    <div className="text-xs text-gray-500">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Special Preferences */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Special Preferences & Requirements</h4>
                <p className="text-gray-600">These details help us find the perfect matches for your needs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Special Requirements */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  <Shield className="h-5 w-5 inline mr-2 text-purple-600" />
                  Special requirements
                </label>
                <div className="space-y-3">
                  {[
                    { name: 'Halal-friendly', description: 'Halal dining & prayer facilities' },
                    { name: 'Family-friendly', description: 'Activities suitable for all ages' },
                    { name: 'Accessibility', description: 'Wheelchair accessible options' },
                    { name: 'Pet-friendly', description: 'Accommodations that welcome pets' }
                  ].map((req) => (
                    <label key={req.name} className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={preferences.specialRequirements?.includes(req.name)}
                        onChange={(e) => handleSpecialRequirementChange(req.name, e.target.checked)}
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium group-hover:text-purple-700 transition-colors duration-200">
                          {req.name}
                        </span>
                        <p className="text-sm text-gray-500">{req.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Activity Interests */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  <Map className="h-5 w-5 inline mr-2 text-purple-600" />
                  What activities interest you?
                </label>
                <div className="space-y-3">
                  {[
                    { name: 'Nature & Outdoors', description: 'Hiking, beaches, parks' },
                    { name: 'City Life', description: 'Shopping, nightlife, urban culture' },
                    { name: 'Culture & History', description: 'Museums, temples, heritage sites' },
                    { name: 'Adventure Sports', description: 'Diving, skiing, rock climbing' },
                    { name: 'Wellness & Spa', description: 'Relaxation, meditation, health' }
                  ].map((activity) => (
                    <label key={activity.name} className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={preferences.activities?.includes(activity.name)}
                        onChange={(e) => handleActivityChange(activity.name, e.target.checked)}
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium group-hover:text-purple-700 transition-colors duration-200">
                          {activity.name}
                        </span>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Additional Details */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Additional Details & Preferences</h4>
                <p className="text-gray-600">These final touches help us perfect your itinerary</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Accommodation Preferences */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  <Hotel className="h-5 w-5 inline mr-2 text-orange-600" />
                  Accommodation preferences
                </label>
                <div className="space-y-3">
                  {[
                    { name: 'Hotel', description: 'Traditional hotel experience' },
                    { name: 'Resort', description: 'All-inclusive luxury resorts' },
                    { name: 'Apartment', description: 'Home-like accommodation' },
                    { name: 'Hostel', description: 'Budget-friendly social stays' }
                  ].map((type) => (
                    <label key={type.name} className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={preferences.accommodationTypes?.includes(type.name)}
                        onChange={(e) => handleAccommodationChange(type.name, e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium group-hover:text-orange-700 transition-colors duration-200">
                          {type.name}
                        </span>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Transportation Preferences */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  <Plane className="h-5 w-5 inline mr-2 text-orange-600" />
                  Transportation preferences
                </label>
                <div className="space-y-3">
                  {[
                    { name: 'Direct Flights', description: 'Prefer non-stop journeys' },
                    { name: 'Budget Airlines', description: 'Cost-effective travel' },
                    { name: 'Premium Airlines', description: 'Comfort and luxury' },
                    { name: 'Flexible Dates', description: 'Open to date changes for better prices' }
                  ].map((transport) => (
                    <label key={transport.name} className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={preferences.transportationPreferences?.includes(transport.name)}
                        onChange={(e) => handleTransportationChange(transport.name, e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium group-hover:text-orange-700 transition-colors duration-200">
                          {transport.name}
                        </span>
                        <p className="text-sm text-gray-500">{transport.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mt-6">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                <MessageSquare className="h-5 w-5 inline mr-2 text-orange-600" />
                Any additional notes or special requests?
              </label>
              <textarea
                value={preferences.additionalNotes || ''}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                placeholder="Tell us anything else that's important for your perfect trip..."
                rows={4}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg placeholder-gray-400"
              />
              <p className="text-sm text-gray-500 mt-2">
                This could be dietary restrictions, accessibility needs, or any other preferences
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 mb-8">
            <h4 className="text-xl font-bold text-gray-900 mb-4">🚀 What Happens Next?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <h5 className="font-semibold text-gray-900 mb-2">AI Analysis</h5>
                <p className="text-sm text-gray-600">Our AI analyzes your preferences and creates personalized recommendations</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <h5 className="font-semibold text-gray-900 mb-2">3 Itineraries</h5>
                <p className="text-sm text-gray-600">Get 3 different options: Budget, Comfort, and Luxury</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <h5 className="font-semibold text-gray-900 mb-2">Book & Go</h5>
                <p className="text-sm text-gray-600">Direct booking links and 24/7 support throughout your journey</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full max-w-2xl py-6 px-12 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-500/50 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 text-white shadow-2xl hover:shadow-3xl'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                <span>Creating Your Dream Trip...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Sparkles className="h-6 w-6" />
                <span>Create My Dream Trip with AI</span>
              </div>
            )}
          </button>
          
          <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto">
            💡 <strong>Pro tip:</strong> The more details you provide, the better your AI recommendations will be. 
            Our system learns from your preferences to create truly personalized experiences!
          </p>
        </div>
      </motion.form>
    </div>
  )
}
